/**
 * Observe the checkout/payment response shapes — the ones no GET could reveal.
 *
 * `POST /checkout/payment` initiates a real Paystack session and creates an
 * order as a side effect, so `contract:record` (GET-only) can never see it.
 * This does the smallest thing that makes the shape observable: add one unit
 * of the cheapest product to the cart, read /checkout, initiate payment,
 * verify the (unpaid) reference, then cancel the order it created.
 *
 *   node scripts/record-checkout-shape.mjs            # dry run: says what it would do
 *   node scripts/record-checkout-shape.mjs --write    # place, initiate, verify, cancel
 *
 * Dev host only, and it refuses to run anywhere else. Confirms the payment
 * gateway key is Paystack *test* mode before doing anything — this must never
 * run against a live key.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const WRITE = process.argv.includes("--write");

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

if (!/dev|localhost|staging/i.test(API)) {
  throw new Error(`Refusing to initiate payment against a non-dev host: ${API}`);
}

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

const login = await call("POST", "/admin/auth/login", {
  body: { email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD },
});
const token = login.json?.data?.accessToken ?? login.json?.data?.token;
if (!token) throw new Error(`Login failed (${login.status})`);

// Refuse to run against a live Paystack key — this initiates a real session.
// No envelope on this endpoint — bare { gateways: [{ id, publicKey, ... }] }.
const paymentSettings = await call("GET", "/admin/settings/payment", { token });
const publicKey = (paymentSettings.json?.gateways ?? paymentSettings.json?.data?.gateways)?.find(
  (g) => /paystack/i.test(g.id ?? g.name ?? g.provider ?? ""),
)?.publicKey;
if (!publicKey || !publicKey.startsWith("pk_test")) {
  throw new Error(
    `Refusing to run: Paystack public key is not test-mode (${publicKey ?? "not found"}).`,
  );
}

const products = await call("GET", "/Products?PageSize=50&ActiveOnly=true", { token });
const candidate = (products.json?.data?.items ?? [])
  .filter((p) => p.showPrice && typeof p.price === "number" && p.inStock)
  .sort((a, b) => a.price - b.price)[0];
if (!candidate) throw new Error("No priced, in-stock product to check out with");

console.log(`API        ${API}`);
console.log(`product    ${candidate.name} — ${candidate.priceDisplay}`);
console.log(`gateway    Paystack, ${publicKey.slice(0, 12)}… (test mode)`);
console.log(`mode       ${WRITE ? "WRITE (initiates a real Paystack session, then cancels)" : "dry run"}`);

if (!WRITE) {
  console.log(
    "\nWould: POST /Cart/items → GET /checkout → POST /checkout/payment → " +
      "GET /checkout/payment/paystack/verify/{ref} → POST /orders/{id}/cancel",
  );
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

  const checkout = await call("GET", "/checkout", { token });
  console.log(`checkout   GET /checkout → ${checkout.status}`);
  if (checkout.status >= 400) throw new Error(checkout.text.slice(0, 300));

  const reference = `record-checkout-shape-${Date.now()}`;
  const payment = await call("POST", "/checkout/payment", {
    token,
    body: {
      delivery: {
        fullName: "Contract Recorder",
        phone: "+2348000000000",
        address: "1 Recorder Way",
        city: "Abuja",
        state: "FCT",
        customerNotes: "Automated contract recording — safe to ignore.",
      },
      payment: { method: "Paystack" },
      total: checkout.json?.total,
      idempotencyKey: reference,
    },
  });
  console.log(`payment    POST /checkout/payment → ${payment.status}`);
  if (payment.status >= 400) throw new Error(payment.text.slice(0, 500));

  orderId = payment.json?.orderId;
  const paymentReference = payment.json?.paymentReference ?? reference;

  const verify = await call(
    "GET",
    `/checkout/payment/paystack/verify/${paymentReference}`,
    { token },
  );
  console.log(`verify     GET /checkout/payment/paystack/verify/{ref} → ${verify.status}`);

  mkdirSync(resolve(ROOT, "contracts"), { recursive: true });
  writeFileSync(
    resolve(ROOT, "contracts/checkout.json"),
    JSON.stringify(
      {
        recordedAt: new Date().toISOString().slice(0, 10),
        note:
          "Shapes only, no values. Recorded by scripts/record-checkout-shape.mjs, " +
          "which initiates one real (test-mode) Paystack session and cancels the order it creates.",
        operations: {
          "GET /api/v1/Checkout": shapeOf(checkout.json),
          "POST /api/v1/Checkout/payment": shapeOf(payment.json),
          "GET /api/v1/Checkout/payment/paystack/verify/{reference}": shapeOf(verify.json),
        },
      },
      null,
      2,
    ) + "\n",
  );
  console.log("wrote      contracts/checkout.json");
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
