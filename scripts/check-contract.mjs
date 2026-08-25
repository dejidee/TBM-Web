#!/usr/bin/env node
/**
 * Contract drift check.
 *
 * Fetches each recorded endpoint from the dev backend and validates it against
 * the schema in lib/api/schemas/. Exits non-zero when reality and the schema
 * disagree.
 *
 * This is the alarm on the assumption. The backend publishes no response
 * schemas, so nothing else tells us when a field goes nullable, changes type,
 * or disappears — the first symptom would otherwise be a `TypeError: cannot
 * read properties of null` in a user's browser.
 *
 * Run it on a schedule, not on every PR: it hits a live server, so a backend
 * outage would otherwise block merges. Failure means "go look", not "revert".
 *
 *   npm run contract:check
 *
 * The schema modules are .ts and import each other extensionlessly, because the
 * app's tsconfig uses `moduleResolution: "bundler"`. Node's ESM resolver wants
 * an explicit extension, so a tiny resolve hook supplies one rather than
 * changing tsconfig to suit a script.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function readEnv() {
  const raw = readFileSync(join(ROOT, ".env.local"), "utf8");
  const line = raw.split("\n").find((l) => l.startsWith("API_URL="));
  if (!line) throw new Error("API_URL not found in .env.local");
  return line.slice("API_URL=".length).trim();
}

const API_URL = process.env.API_URL ?? readEnv();

/**
 * Endpoints and their schema names come from contracts/manifest.json — the same
 * file that drives record-contract.mjs and coverage.mjs. Entries with
 * `schema: null` are recorded but not yet modelled, and are skipped here.
 */
// Merge every schema module, so a manifest entry can name an export from any of
// them. Only GET entries are replayed — a mutation cannot be re-run nightly, so
// its schema is modelled (and counts toward coverage) but not drift-checked.
const schemas = {
  ...(await import("../lib/api/schemas/catalog.ts")),
  ...(await import("../lib/api/schemas/admin-products.ts")),
  ...(await import("../lib/api/schemas/ai.ts")),
  ...(await import("../lib/api/schemas/designs.ts")),
};
const manifest = JSON.parse(
  readFileSync(join(ROOT, "contracts/manifest.json"), "utf8"),
);

const CHECKS = manifest.endpoints
  .filter((e) => e.schema && e.op.startsWith("GET "))
  .map((e) => {
    const schema = schemas[e.schema];
    if (!schema) {
      console.error(
        `contracts/manifest.json names schema "${e.schema}" for ${e.op}, ` +
          `but lib/api/schemas/catalog.ts does not export it.`,
      );
      process.exit(1);
    }
    return {
      label: e.op.replace("/api/v1", ""),
      path: e.op.replace(/^GET \/api\/v1/, "") + (e.sample ?? ""),
      schema,
    };
  });

let failures = 0;
console.log(`Checking ${CHECKS.length} contracts against ${new URL(API_URL).host}\n`);

for (const { label, path, schema } of CHECKS) {
  let json;
  try {
    const res = await fetch(`${API_URL}${path}`);
    if (!res.ok) {
      console.log(`  ⚠ ${label.padEnd(24)} upstream ${res.status} — skipped`);
      continue;
    }
    json = await res.json();
  } catch (err) {
    console.log(`  ⚠ ${label.padEnd(24)} unreachable (${err.message}) — skipped`);
    continue;
  }

  const result = schema.safeParse(json);
  if (result.success) {
    console.log(`  ✓ ${label.padEnd(24)} matches`);
  } else {
    failures++;
    console.log(`  ✗ ${label.padEnd(24)} DRIFT`);
    // Paths only — a value here could be a customer's address.
    for (const issue of result.error.issues.slice(0, 6)) {
      const p = issue.path.length ? issue.path.join(".") : "<root>";
      console.log(`      ${p}: ${issue.message}`);
    }
    const more = result.error.issues.length - 6;
    if (more > 0) console.log(`      …and ${more} more`);
  }
}

if (failures) {
  console.log(
    `\n${failures} contract(s) drifted. The backend changed, or lib/api/schemas is wrong.\n` +
      `Run \`npm run contract:record\` to see the new shape, then update the schema.\n` +
      `Do not cast around it — the type is what the components trust.`,
  );
  process.exit(1);
}
console.log("\nAll contracts hold.");
