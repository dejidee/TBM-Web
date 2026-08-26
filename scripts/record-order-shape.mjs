/**
 * Observe the order response shapes — the ones no GET could reveal.
 *
 * `contract:record` replays GETs, and `record-mutations.mjs` covers products.
 * Neither can produce an *order*: the dev backend held zero of them, so
 * `GET /vendor/orders/{id}` had nothing to return and the vendor order detail
 * page was built against an invented shape.
 *
 * This does the smallest thing that makes the shape observable — add one unit
 * of the cheapest product to the cart, place the order, snapshot the three
 * reads, then cancel. It writes *shapes*, never values, into contracts/.
 *
 *   node scripts/record-order-shape.mjs            # dry run: says what it would do
 *   node scripts/record-order-shape.mjs --write    # place, record, cancel
 *
 * Dev host only, and it refuses to run anywhere else. Orders can be cancelled
 * but not deleted, so this leaves one cancelled order behind by design.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const WRITE = process.argv.includes("--write");

// ── env ──────────────────────────────────────────────────────────────────────
const env = Object.fromEntries(
  readFileSync(resolve(ROOT, ".env.local"), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")];
    }),
);

const API = env.API_URL;
if (!API) throw new Error("API_URL missing from .env.local");

// The same guard record-mutations.mjs uses. Placing an order is not something
// to discover you have done against production.
if (!/dev|localhost|staging/i.test(API)) {
  throw new Error(`Refusing to place an order against a non-dev host: ${API}`);
}

/** Replace every leaf with its type name. What makes the output safe to commit. */
function shapeOf(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return value.length ? [shapeOf(value[0])] : [];
  if (typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, shapeOf(v)]),
    );
  return typeof value;
}

async function call(method, path, { token, body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* non-JSON body — status is what matters */
  }
  return { status: res.status, json, text };
}

// ── run ──────────────────────────────────────────────────────────────────────
const login = await call("POST", "/admin/auth/login", {
  body: { email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD },
});
const token = login.json?.data?.token ?? login.json?.data?.accessToken;
if (!token) throw new Error(`Login failed (${login.status})`);

// Cheapest priced, in-stock product — keeps the order trivially small.
const products = await call("GET", "/Products?PageSize=50&ActiveOnly=true", { token });
const candidate = (products.json?.data?.items ?? [])
  .filter((p) => p.showPrice && typeof p.price === "number" && p.inStock)
  .sort((a, b) => a.price - b.price)[0];

if (!candidate) throw new Error("No priced, in-stock product to order");

console.log(`API        ${API}`);
console.log(`product    ${candidate.name} — ${candidate.priceDisplay}`);
console.log(`mode       ${WRITE ? "WRITE (places a real order, then cancels)" : "dry run"}`);

if (!WRITE) {
  console.log("\nWould: POST /Cart/items → POST /orders → GET x3 → POST /orders/{id}/cancel");
  process.exit(0);
}

let orderId = null;
try {
  await call("DELETE", "/Cart", { token });

  const added = await call("POST", "/Cart/items", {
    token,
    body: { productId: candidate.id, quantity: 1 },
  });
  console.log(`cart       POST /Cart/items → ${added.status}`);
  if (added.status >= 400) throw new Error(added.text.slice(0, 300));

  const created = await call("POST", "/orders", {
    token,
    body: {
      shippingFullName: "Contract Recorder",
      shippingPhone: "+2348000000000",
      shippingAddress: "1 Recorder Way",
      shippingCity: "Abuja",
      shippingState: "FCT",
      customerNotes: "Automated contract recording — safe to ignore.",
    },
  });
  console.log(`order      POST /orders → ${created.status}`);
  if (created.status >= 400) throw new Error(created.text.slice(0, 500));

  const order = created.json?.data ?? created.json;
  orderId = order?.id ?? order?.orderId;
  if (!orderId) throw new Error(`No order id in response: ${created.text.slice(0, 300)}`);

  const reads = {
    "POST /api/v1/orders": created.json,
    [`GET /api/v1/orders/${"{orderId}"}`]: (await call("GET", `/orders/${orderId}`, { token })).json,
    [`GET /api/v1/vendor/orders/${"{orderId}"}`]: (
      await call("GET", `/vendor/orders/${orderId}`, { token })
    ).json,
    "GET /api/v1/vendor/orders": (await call("GET", "/vendor/orders?pageSize=1", { token })).json,
  };

  mkdirSync(resolve(ROOT, "contracts"), { recursive: true });
  writeFileSync(
    resolve(ROOT, "contracts/orders.json"),
    JSON.stringify(
      {
        recordedAt: new Date().toISOString().slice(0, 10),
        note:
          "Shapes only, no values. Recorded by scripts/record-order-shape.mjs, " +
          "which places one order and cancels it — the dev backend has no other orders.",
        operations: Object.fromEntries(
          Object.entries(reads).map(([k, v]) => [k, shapeOf(v)]),
        ),
      },
      null,
      2,
    ) + "\n",
  );
  console.log("wrote      contracts/orders.json");
} finally {
  if (orderId) {
    const cancelled = await call("POST", `/orders/${orderId}/cancel`, {
      token,
      body: { reason: "Automated contract recording" },
    });
    console.log(`cleanup    POST /orders/${orderId}/cancel → ${cancelled.status}`);
  }
  await call("DELETE", "/Cart", { token });
}
