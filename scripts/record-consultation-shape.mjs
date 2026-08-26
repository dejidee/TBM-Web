/**
 * Observe the Consultations response shapes — booking, payment, and their
 * mutation responses have never been recorded (contract:record is GET-only
 * and every write here needs a live sequence: book → pay → verify → cancel).
 *
 *   node scripts/record-consultation-shape.mjs            # dry run
 *   node scripts/record-consultation-shape.mjs --write     # book a paid type, pay, verify, cancel
 *   node scripts/record-consultation-shape.mjs --write --free   # book a free (fee: 0) type, cancel
 *
 * Dev host only, and it refuses to run anywhere else. Confirms the payment
 * gateway key is Paystack *test* mode before touching the paid path — this
 * must never run against a live key. Mirrors scripts/record-checkout-shape.mjs.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const WRITE = process.argv.includes("--write");
const FREE = process.argv.includes("--free");

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
  throw new Error(`Refusing to run against a non-dev host: ${API}`);
}

function shapeOf(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return value.length ? [shapeOf(value[0])] : [];
  if (typeof value === "object")
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shapeOf(v)]));
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
    /* status is what matters */
  }
  return { status: res.status, json, text };
}

const login = await call("POST", "/admin/auth/login", {
  body: { email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD },
});
const token = login.json?.data?.accessToken ?? login.json?.data?.token;
if (!token) throw new Error(`Login failed (${login.status})`);

if (!FREE) {
  const paymentSettings = await call("GET", "/admin/settings/payment", { token });
  const publicKey = (paymentSettings.json?.gateways ?? paymentSettings.json?.data?.gateways)?.find(
    (g) => /paystack/i.test(g.id ?? g.name ?? g.provider ?? ""),
  )?.publicKey;
  if (!publicKey || !publicKey.startsWith("pk_test")) {
    throw new Error(`Refusing to run: Paystack public key is not test-mode (${publicKey ?? "not found"}).`);
  }
  console.log(`gateway    Paystack, ${publicKey.slice(0, 12)}… (test mode)`);
}

const types = await call("GET", "/consultations/types", { token });
const candidate = FREE
  ? types.json?.data?.find((t) => t.fee === 0)
  : types.json?.data?.find((t) => t.fee > 0);
if (!candidate) throw new Error(`No ${FREE ? "free" : "paid"} consultation type found`);
console.log(`type       ${candidate.name} (${candidate.key}) — fee ${candidate.fee}`);

const availability = await call(
  "GET",
  `/consultations/availability?type=${candidate.key}`,
  { token },
);
const slot = availability.json?.data?.slots?.find((s) => s.isAvailable);
if (!slot) throw new Error("No available slot found");
console.log(`slot       ${slot.start}`);
console.log(`mode       ${WRITE ? "WRITE" : "dry run"}`);

if (!WRITE) {
  console.log(
    "\nWould: POST /consultations → " +
      (candidate.fee > 0
        ? "POST /consultations/{id}/initialize-payment → POST /consultations/verify-payment → "
        : "") +
      "GET /consultations/{id} → POST /consultations/{id}/cancel",
  );
  process.exit(0);
}

let consultationId = null;
try {
  const booked = await call("POST", "/consultations", {
    token,
    body: {
      typeKey: candidate.key,
      scheduledStart: slot.start,
      contactName: "Contract Recorder",
      contactPhone: "+2348000000000",
      contactEmail: "contract-recorder@example.com",
      propertyType: "Residential",
      siteAddress: "1 Recorder Way",
      siteCity: "Abuja",
      siteState: "FCT",
      notes: "Automated contract recording — safe to ignore.",
    },
  });
  console.log(`book       POST /consultations → ${booked.status}`);
  if (booked.status >= 400) throw new Error(booked.text.slice(0, 500));

  const bookingResult = booked.json?.data ?? booked.json;
  consultationId = bookingResult?.consultation?.id ?? bookingResult?.id;
  if (!consultationId) throw new Error(`No consultation id in response: ${booked.text.slice(0, 300)}`);

  const operations = {
    "POST /api/v1/consultations": booked.json,
  };

  if (candidate.fee > 0) {
    const reference = `record-consultation-${Date.now()}`;
    const payment = await call(
      "POST",
      `/consultations/${consultationId}/initialize-payment`,
      { token, body: { email: "contract-recorder@example.com" } },
    );
    console.log(`payment    POST /consultations/{id}/initialize-payment → ${payment.status}`);
    operations["POST /api/v1/consultations/{id}/initialize-payment"] = payment.json;

    if (payment.status < 400) {
      const paymentRef = payment.json?.reference ?? reference;
      const verify = await call("POST", "/consultations/verify-payment", {
        token,
        body: { reference: paymentRef },
      });
      console.log(`verify     POST /consultations/verify-payment → ${verify.status}`);
      operations["POST /api/v1/consultations/verify-payment"] = verify.json;
    }
  }

  const read = await call("GET", `/consultations/${consultationId}`, { token });
  console.log(`read       GET /consultations/{id} → ${read.status}`);
  operations["GET /api/v1/consultations/{id}"] = read.json;

  const mine = await call("GET", "/consultations/mine", { token });
  operations["GET /api/v1/consultations/mine"] = mine.json;

  const outFile = resolve(ROOT, `contracts/consultation-booking${FREE ? "-free" : "-paid"}.json`);
  mkdirSync(resolve(ROOT, "contracts"), { recursive: true });
  writeFileSync(
    outFile,
    JSON.stringify(
      {
        recordedAt: new Date().toISOString().slice(0, 10),
        note:
          "Shapes only, no values. Recorded by scripts/record-consultation-shape.mjs, " +
          `which books one ${FREE ? "free" : "test-mode-paid"} consultation and cancels it.`,
        operations: Object.fromEntries(
          Object.entries(operations).map(([k, v]) => [k, shapeOf(v)]),
        ),
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`wrote      ${outFile}`);
} finally {
  if (consultationId) {
    const cancelled = await call("POST", `/consultations/${consultationId}/cancel`, {
      token,
      body: { reason: "Automated contract recording" },
    });
    console.log(`cleanup    POST /consultations/${consultationId}/cancel → ${cancelled.status}`);
  }
}
