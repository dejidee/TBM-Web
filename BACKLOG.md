# Open items

Everything found, flagged, or deliberately deferred — with the evidence, so the
next person does not have to rediscover it.

**This file is tracked.** `CLAUDE.md` is gitignored, so anything a teammate needs
belongs here, not there.

Rules of the house:

- Every item names a file and line, or a command that reproduces it.
- Delete an item when it is done. Do not tick a box and leave it.
- If you find something new, add it here before you forget it. That is the whole
  point — anything learned and not written down gets rediscovered from scratch.

Last verified: 2026-08-12. Counts drift; re-run the commands rather than trusting them.

---

## Act now

### ~~Checkout retry could double-charge~~ — fixed, verified 2026-08-12

Reported: paid on Paystack, connection dropped while `/checkout/verify` was
confirming it, page landed on "Payment Failed", and "Try Again" started an
**entirely new** payment — new order, new Paystack session — for a purchase
that had already gone through.

Root cause, confirmed against the dev backend directly (not guessed):

- `POST /api/v1/checkout/payment` already supports `idempotencyKey` and the
  backend already honours it correctly — sending the same key twice returns
  `idempotent: true` and the *same* `orderId`/`authorizationUrl`, no duplicate
  order. **The frontend never generated or sent one.** Every retry was a
  genuinely new request as far as the backend could tell.
- `/checkout/verify` treated a thrown network error identically to a
  definitive `paymentStatus: "Failed"` answer from the backend — but a
  dropped connection is not evidence the payment failed, it's evidence of
  nothing. Its only recovery path, "Try Again → /checkout", had no way to
  avoid resubmitting from scratch because of the point above.
- Reusing the same key against an order that *is* genuinely `Failed` returns
  the same (now-dead) Paystack session, not a fresh one — confirmed live.
  A real retry after a real decline needs a new key.

Fixed in `app/(user)/checkout/page.jsx` and `.../checkout/verify/page.jsx`:

- A payment attempt now gets one `idempotencyKey`, generated and persisted
  (`sessionStorage`, `CHECKOUT_KEYS.attempt`) *before* the request goes out —
  not after the response comes back, so a lost response doesn't cost the key
  either. It's reused on every retry until the attempt reaches a terminal
  state.
- The checkout page refuses to render its form while an unresolved attempt
  exists for this cart — it redirects straight to `/checkout/verify` for that
  order instead. This is what actually closes the hole: even if something
  else caused a resubmit, there is no code path left that calls
  `POST /checkout/payment` without checking for a live attempt first.
- The verify page now has five outcomes, not two: `loading`, a couple of
  quick automatic retries, a fallback to reading the order's own
  `paymentStatusName` directly (the backend's Paystack webhook,
  `POST /webhooks/paystack`, settles this server-side independent of whether
  the browser can reach anything), a slow background poll (~5× over 30s)
  while genuinely `uncertain`, and only a confirmed `paymentStatus: "Failed"`
  reaches the red "Payment Failed" / Try Again screen. `uncertain` shows "do
  not pay again", a manual recheck, and a support link — never a path back
  into checkout.
- `attempt` is cleared only on a terminal answer: fully on success, just the
  guard (keeping the delivery/payment draft) on a confirmed failure so a
  genuine retry gets a fresh key without re-entering an address.

Verified live against the dev backend (not simulated): same key twice →
`idempotent: true`, same order, same Paystack session both times; same key
reused after a confirmed `Failed` → same dead session (proving a fresh key is
required for a real retry, which the fix now does automatically once
`/checkout/verify` reaches that state). `lint:arch`, `typecheck`, `build` all
pass.

**Follow-up, done 2026-08-12** — the three things flagged above as considered-
but-not-done:

- **`attempt` moved to `localStorage`, with a 30-minute TTL**
  (`CHECKOUT_ATTEMPT_TTL_MS`, `hooks/use-persisted-state.js`). It now survives
  the tab closing or the browser crashing between paying and verifying — the
  scenario `sessionStorage` couldn't cover. Past the TTL it's treated as
  abandoned and stops blocking new checkouts; the order itself isn't touched,
  it's still sitting on the backend as `Pending` and findable from
  `/dashboard/orders`.
- **"Complete Payment" resume action**, `/dashboard/orders`
  (`components/shared/dashboard/orders/table.jsx`) and the order detail page
  (`app/(user)/order/[orderId]/page.jsx`), via `useResumePayment()`
  (`hooks/use-checkout.js`). Shown only when `paymentStatusName === "Pending"`.
  It reuses the order's own `paymentReference` as the idempotency key —
  confirmed live that this returns the *exact same* `authorizationUrl` the
  original checkout got, `idempotent: true` — so it works from any device,
  independent of whether the local `attempt` survived at all. Deliberately
  **not** shown for `"Failed"` orders: reusing the reference there returns the
  same *dead* session (also confirmed live), so a real retry needs a fresh
  checkout, not this button.
- **Authorization scoping — verified safe, not a gap.** Registered a second,
  throwaway customer account and tried to read the first account's order and
  payment reference with it: `GET /orders/{orderId}` → `404 "Unauthorized
  access to order"`; `GET /checkout/payment/paystack/verify/{reference}` →
  `400 "Order not found for this payment reference."` Neither leaks the
  other account's data. No fix needed.
- Widened `orderSchema.paymentMethod`/`paymentMethodName`/`paymentReference`
  (`lib/api/schemas/orders.ts`) from `z.unknown()` — now confirmed non-null
  once a payment attempt has been made (`1`/`"Paystack"`/the idempotency key
  sent), still null on an order created via `POST /orders` directly.

`lint:arch`, `typecheck`, `build` all pass; the resume payload was verified
live against the dev backend to return the identical Paystack session.

### `role === "Vendor"` now fails for every account, not just multi-role ones

`lib/actions/auth.js:138`:

```js
const isVendor = role === "Vendor";   // string compared against an array
```

Filed as a backend question ("is the role claim supposed to be an array?") —
answered, and it raises the severity here. Checked two fresh JWTs live today:
a multi-role account carries `role: ['Vendor','Customer','Admin','SuperAdmin']`,
and a **brand-new, single-role Customer account carries `role: ['Customer']`**
— an array either way now. `role === "Vendor"` was already broken for
multi-role accounts; it is now unconditionally `false` for every account that
authenticates through the *shopper* login, because a string can never equal an
array. If this path is how any vendor's cookie gets set, that's not an edge
case anymore.

The admin path derives role from which cookie is present, not from the claim,
so it's unaffected.

```bash
grep -n 'role === "Vendor"' lib/actions/auth.js
```

- [ ] Normalise the claim to an array and use `.includes("Vendor")`.

### `GET /vendor/orders` 500s once a vendor has more than ~6 orders

Found while wiring the status filter to real values (below). Confirmed live,
not from the spec:

```bash
curl "$API_URL/vendor/orders?pageSize=6"          # 200
curl "$API_URL/vendor/orders?pageSize=7"           # 500 NullReferenceException
curl "$API_URL/vendor/orders?page=2&pageSize=5"    # 500 NullReferenceException — page 1 alone isn't enough either
```

`{"success":false,"error":"NullReferenceException","detail":"Object reference
not set to an instance of an object."}`. A status-filtered query
(`?status=6`) at `pageSize=50` did **not** reproduce it (`total: 9`, all
`status: 6`) — this account has 16 unfiltered orders, so the crash looks tied
to a null field on one specific order past the first page, not to `pageSize`
as a number. Pagination on this endpoint is currently broken for any vendor
with more than a handful of orders — not a hypothetical, a real vendor will
hit this on page 2.

`components/shared/vendor/dashboard/table.jsx` now renders "Couldn't load
orders" instead of a false-empty "No orders found" or a crash when this
happens (`isError` wired through, 2026-08-12) — that's the frontend's whole
available mitigation. The real fix is server-side.

- [ ] Find the null field one of these orders carries that the paginated
      query path dereferences without a check.

### Rotate the dev admin credentials

`app/admin/login/page.jsx` shipped a working admin login as Formik
`initialValues` — email **and** password, compiled into the client bundle.
Anyone who loaded `/admin/login`, or grepped `.next/static`, had SuperAdmin.

The working tree is fixed and a lint rule now blocks it. **The credentials remain
in git history, and in `HEAD`, until that fix is committed.** Removing the line
does not undo the exposure either way.

```bash
# 1 = the seeded literal is present
git show fbc24e8:app/admin/login/page.jsx | grep -cE 'password: "[^"]+"'   # 1, introduced here
git show HEAD:app/admin/login/page.jsx    | grep -cE 'password: "[^"]+"'   # 1 until the fix lands
grep -cE 'password: "[^"]+"' app/admin/login/page.jsx                      # 0, fixed locally
```

- [ ] Rotate that account's password. This is the only step that actually helps.
- [ ] Assume the dev backend was publicly writable for the life of that commit.
- [ ] Decide whether to rewrite history or accept it. If the same password is
      used anywhere else — staging, prod, a personal account — rotate there too.

The account's JWT carries `['Vendor','Customer','Admin','SuperAdmin']`.

### CI secrets

`lib/env.js` throws when `API_URL` or `ADMIN_API_URL` is missing — deliberately,
so a misconfigured deploy fails the build instead of pointing at a placeholder
domain. That means CI fails until both are set as repo secrets.

- [ ] Set `API_URL` and `ADMIN_API_URL` in GitHub → Settings → Secrets → Actions.
- [ ] The nightly `contract` job needs `API_URL` too.

Unverified from here: `gh` is not installed on the dev machine.

### Ziora Studio generation flow reconciled against the backend's handoff (2026-08-26)

`docs/frontend_integration_handoff.txt` documented the real `ai/projects` →
`ai/upload-room` → `ai/generate/{image,video}` flow. Diffed against
`components/shared/ziora/studio-view.jsx` and fixed what was clearly wrong:

- `generateImage`/`generateVideo` were only sending `{ projectId, style }` —
  the handoff's example payloads repeat `sourceImageUrl`, `prompt`, and
  `contextTags` at generation time too. Now sent.
- The success-path query invalidation used the string key `["ai-projects"]`,
  which does not match `aiKeys.projects()` (`["ai", "projects"]`) used by
  `useAIProjects` — a no-op invalidation. Fixed to use `aiKeys.projects()`.
- The 403-quota branch checked `err?.code === "subscription_quota_exceeded"`,
  a field `proxyFetch` never sets (and the handoff's documented error shape
  is just `{ success, message }`, no `code`). Dead code; now keys off
  `err?.status === 403` alone, which the handoff does document as the quota
  case for this endpoint family.
- Added the documented recovery-fallback poll of `GET /ai/projects` — a
  thrown error now checks whether the project actually completed
  server-side before showing a failure screen.
- Added a `contextLabel` (room type) field on project creation, per the
  handoff's example — **unconfirmed with the backend**: don't know whether
  it's validated against a fixed set, free text, or ignored. The dropdown
  values (`Kitchen`, `Living Room`, ...) are our own guess, not backend-
  provided. Ask before relying on it for anything server-side.
- `POST /ai/generate/image`, `POST /ai/generate/video`, and
  `POST /ai/upload-room` now have their own route files
  (`app/api/proxy/v1/ai/**`) with `maxDuration = 60`, instead of the shared
  `[...path]` catch-all with no duration set. This is the Vercel **Hobby**
  plan ceiling — it does not fix the underlying problem:

- [ ] **Decide on a Vercel plan upgrade.** The handoff states image
      generation takes 60-90s and video "several minutes." Hobby caps
      function duration at 60s even maxed out — image generation is already
      at risk, video will essentially never finish through this proxy. Pro
      allows up to 300s (more with Fluid Compute). This is a billing
      decision, not a code fix.
- [ ] `GET /ai/projects`'s response shape (used by the new polling fallback)
      has no recorded contract — no `contracts/ai-projects.json`, no
      `lib/api/schemas/ai.ts` entry. `pollProjectStatus()` in
      `studio-view.jsx` reads `id`/`status` defensively for this reason.
      Record and model it properly once there's a live account to record
      against.
- [ ] Ask backend to confirm `contextLabel`'s accepted values (see above).

---

## Asks for the backend team

These cannot be fixed from this repo. Each one is currently worked around.
Last verified against a live re-pull of the spec + direct API calls,
2026-08-22 — see `docs/api/swagger.snapshot.json` (303→324 operations since
the last snapshot) and `docs/api/tbm-backend-api.md`.

### 1. Declare response schemas (fixes everything below it) — barely started

All 303 operations used to declare a bare `200: OK` with no body type. That's
no longer literally true — every action now returns a schema — but check what
it actually is:

```bash
python3 -c "
import json
d = json.load(open('docs/api/swagger.snapshot.json'))
generic = typed = 0
for p in d['paths'].values():
    for m, op in p.items():
        if m not in ('get','post','put','patch','delete'): continue
        ref = op.get('responses',{}).get('200',{}).get('content',{}).get('application/json',{}).get('schema',{}).get('\$ref','')
        if 'System.Object' in ref: generic += 1
        elif ref: typed += 1
print(f'{typed} concretely typed, {generic} generic ApiResponse<Object>')
"
# 16 concretely typed, 286 generic ApiResponse<Object>  (2026-08-12)
# 44 concretely typed, 279 generic ApiResponse<Object>  (2026-08-22)
```

44 of 324 — about 14%, up from 5%. The whole new `Consultations` /
`Inspections` / `AdminInspections` surface shipped concretely typed, which is
the pattern working; the other 279 are unchanged. The other 286 got wrapped in `ApiResponse<Object>`,
which tells Swashbuckle "there's an envelope" but nothing about what's inside
it, so `openapi-typescript` still can't generate a real type from them. Real
movement (there's now a schema and, on some, a `400` response code, where
before there was neither), but `lib/api/schemas/`, `contracts/`, and the
scripts that populate them are still the source of truth for field-level
shapes on 95% of the surface.

- [ ] Same ask, now with a number attached: `[ProducesResponseType(typeof(ApiResponse<ProductDto>), StatusCodes.Status200OK)]` needs the *concrete* DTO, not `object`, for this to do anything.

### ~~2. Two product fields are still write-only~~ — backend delivered 2026-08-22

`metaTitle`, `metaDescription` (and a new `metaKeywords`) now come back on
every product read — `ProductDto` and `AdminProductDto` both carry them, and
`contracts/products.json` / `products-featured.json` re-recorded today show
all three (`null` on every live product, because nothing has ever been able
to set them from a prefilled form). The AdminProducts surface still has no
`GET`.

- [x] Frontend done 2026-08-22: marker removed, `productToFormValues` prefills
      both, `catalog.ts` carries all three as `z.unknown()` (null on every
      live product — widen to `z.string().nullable()` on first real value).
      Round-tripped live: PUT a value, read it back, saw it prefilled, restored.

### 3. `POST /bulk` still breaks the envelope convention

Every create on the AdminProducts surface returns `ApiEnvelope<Product>` —
except `bulk`, which returns
`ApiEnvelope<{ totalSubmitted, created, failed, failures[], createdProducts[] }>`.
Re-confirmed live today with a real (self-cleaning) mutation —
`node scripts/record-mutations.mjs --write` — not just re-reading the spec:
`contracts/admin-products-bulk.json` still shows `data.createdProducts[]`, not
`data[]`.

- [ ] Not a bug exactly, but worth raising: an inconsistent envelope on one
      endpoint is a trap that costs everyone once.

### 4. Two parallel product write surfaces — confirmed genuinely redundant

`POST /api/v1/Products` and `POST /api/v1/admin/AdminProducts` both still
exist, both take `CreateProductDto`. Tested live, not just read from the spec:
created a product via `POST /Products` and confirmed it immediately appears in
the same `GET /Products` list that `AdminProducts` also relies on for reading
(it has no `GET` of its own) — same underlying table, genuinely duplicated
code paths, not a coincidental overlap. Also confirmed neither is a stray
public write hole: a plain `Customer` token gets `403` on both. Only
`AdminProducts` has `bulk`; only `/Products` has `import`. We target
AdminProducts.

- [ ] Which is canonical? Should one be removed?

### 5. `Designs`/`DesignSessions` still can't be filed under a project

`POST /api/v1/projects` now exists (see "Backend delivered" below), and
`projectId` was added to `AI.CreateRenovationEstimateRequestDto` and to the
new `Consultations.BookConsultationRequestDto` — but **not** to
`DesignFlow.CreateDesignSessionRequestDto`. Two of the three resources the
"My Projects" hub needs to aggregate can now be filed under a project; designs
still can't be linked to one.

- [ ] Add `projectId` (nullable) to `CreateDesignSessionRequestDto`, matching
      the other two.

### 6. `GET /Cart/related` has no way to say "this item has no price"

The fake `rating: 4.5` is gone — it's honestly `null` now. Re-checked live and
cross-referenced every returned item against its real `GET /Products/{id}`
data: three of four matched exactly (one genuinely is a ₦0 item, two correctly
show `image: null` because those products truly have none uploaded). The
fourth is a real, narrower gap than originally reported: a quote-only
("Request Price") product shows `price: 0`, because this endpoint has no
`showPrice` boolean to distinguish "free" from "no price set" — the same
discriminated-union shape `GET /Products` already has.

- [ ] Add `showPrice` to this endpoint's item shape, matching `Product`.

### 7. Consultations — what the admin surface still cannot do (2026-08-22)

Found while building `/admin/dashboard/consultations`. Each was checked
live; the commands are in the text.

**a. Availability blocks don't block the calendar the app books from.**
`POST /admin/inspections/availability/blocks` is the only availability write
in the API. A block created for 09:00–12:00 WAT on a given day flips
`/inspections/availability` slots to `available: false` for that window —
but `/consultations/availability` for the same day still returns every slot
`isAvailable: true`. The app books through `/consultations`, so the block
manager was deliberately *not* built: it would be a control that does
nothing. The client's "manage availability" ask is blocked on this.

- [ ] Either make blocks apply to `Consultations` too, or add
      `/admin/consultations/availability/blocks`.

**b. Block timestamps with an offset are stored wrong.** Sending
`start: "2026-09-08T09:00:00+01:00"` stored `01:00:00+01:00` (eight hours
early). `"…T09:00:00Z"` stored `10:00+01:00` (correct) and the naive
`"…T09:00:00"` stored `09:00+01:00` (treated as WAT, also correct). Only the
explicit-offset form is broken. If (a) is fixed, send UTC.

**c. No status transition on `Consultations`.** `PATCH
/admin/inspections/{id}/status` exists; there is no equivalent under
`/admin/consultations`. Admin can cancel a consultation and nothing else —
no "Completed", no "No-show". The page has only a Cancel action for that
reason.

**d. No type filter or search on the admin list.** `GET /admin/consultations`
takes `status`, `fromUtc`, `toUtc`, `page`, `pageSize`. `/admin/inspections`
has `consultationType` and `state`; the consultations list has neither, and
no free-text search on contact name.

**e. Pricing rows have no `typeKey`.** `consultationType` on a pricing row is
the display name ("Site Consultation"); `/consultations/types` keys by slug
("site-consultation"). The only join is the name. `location` is `null` on
all five rows, so "per-location pricing" has no data yet.

**f. The `/admin/inspections/categories` mapping looks wrong.** It maps
`EstimateReview → "Post-Installation Follow-up"` and `Design → "Material &
Finish Selection"`. Those read like a positional join between two
five-element lists rather than a semantic one. Worth a look before anything
relies on it.

**g. Anonymous booking is by design — not an ask.** `POST /consultations`
and `POST /inspections/book` answer 200 with no `Authorization` header. Raised
as A7 in the August change request; confirmed intentional by the product
owner on 2026-08-22 (guest bookings get an `X-Consultation-Token` to manage
themselves). The app's sign-in gate on submission remains a product choice,
not a control. If spam ever becomes a problem, the ask is rate limiting.

**i. `GET /consultations/availability?date=` now returns a multi-day window.**
On 2026-08-12 a request for one date returned that day's slots. On
2026-08-22 it returns every slot from that date forward, up to 200 (~25
working days) — unannounced. `contract:check` didn't catch it because the
*shape* is unchanged. The booking and reschedule pickers rendered all of
them under one day's heading. `useConsultationAvailability` now filters to
the requested date client-side; the request is ~25× larger than it needs to
be. Either document the window (and add `days=`/`to=`) or restore
single-day semantics.

```bash
curl -s "$API_URL/api/v1/consultations/availability?type=site-consultation&date=2026-09-01" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{const s=JSON.parse(d).data.slots;console.log(s.length, new Set(s.map(x=>x.start.slice(0,10))).size,"days")})'
# 144 18 days
```

**h. `PATCH /admin/AdminPortfolio/{id}/status` still binds the enum as an
integer only** (B4 from the change request). `{"status":"Published"}` → 400;
`{"status":3}` → 200 "Project status updated to 3" — out of range still
accepted. Unchanged since 2026-08-12; `PORTFOLIO_STATUS` in
`lib/api/admin.js` keeps sending integers.

---

## Backend delivered, frontend hasn't wired it up

Confirmed real and working against the live dev backend, 2026-08-12. Not our
bugs anymore — these are frontend TODOs now, unblocked.

**Three of the five items originally here are done — see git history
(`git log --grep=lookups`, `--grep=reviews`, `--grep=delivery`), not repeated
here:** the vendor order/delivery status filters now source real names from
`GET /lookups/order-statuses`; the reviews API is wired end-to-end (list,
write form, `averageRating`/`reviewCount` on product cards) with the item
shape honestly left `unknown` until a real review exists to observe
(`lib/api/schemas/reviews.ts`); and the delivery inline editor is restored
against `PATCH /vendor/deliveries/{orderId}` — which, while rebuilding it,
turned out to need more than restoring: the *read* side was rendering
`assignment.customer.name` and other fields that don't exist on the real
response at all (would have crashed on live data), and `totalCount` should
have been `total`. Both fixed alongside the editor. The write path itself
couldn't be confirmed with a 200 — every order this dev account can reach
comes back "outside this vendor scope" on `PATCH`, including ones it just
created — so the endpoint is confirmed to exist, enforce real authorization,
and match the documented DTO, but a genuine success response is still
unobserved.

### ~~A real consultation-booking feature exists~~ — rebuilt, verified 2026-08-12

`app/(user)/consultation/` now books against the real `Consultations`
resource, not the old thin `POST /inspections/book`. Coverage 20→29/303 —
`lib/api/schemas/consultations.ts`, recorded by
`scripts/record-consultation-shape.mjs --write` (both the free and a
test-mode-paid type, each booked then cancelled) plus manual reschedule/cancel
recordings; see `contracts/consultations-{types,mine}.json`,
`contracts/consultation-booking-{free,paid}.json`,
`contracts/consultation-reschedule-cancel.json`.

Verified end-to-end through the app's own `/api/proxy/v1` layer (not just the
raw backend): booked a paid type → `PendingPayment`, real `fee` →
`initialize-payment` → real `authorizationUrl` → cancelled to clean up. The
old client-side taxonomy (five invented types, one flat `₦50,000` fee) is
gone — `GET /consultations/types` returned exactly five real types, three of
them free.

Two things this surfaced that the old design couldn't have known:

- **`BookConsultationRequestDto` has no idempotency key**, unlike
  `POST /checkout/payment`. An exact resubmit is only caught as a side effect
  of slot-locking ("That consultation slot has just been booked.") — a real
  but incidental protection, not a designed one. The payment-safety pattern
  from the checkout fix was adapted, not copied: once a consultation id
  exists, this app never calls `book()` again for that attempt, only retries
  `initialize-payment` against the same id — confirmed live that repeating
  that call is safe (returns a fresh Paystack session, not a duplicate
  consultation).
- **`initialize-payment` is not idempotent either** — two calls on the same
  consultation returned two *different* Paystack sessions/references.
  `POST /consultations/verify-payment` also signals failure differently than
  checkout's verify: a clean **400** with `{ success: false, message }`, not
  a 200 with a status field — confirmed live, `contracts/consultation-booking-paid.json`.

**Not carried over from the old design, deliberately:** file/photo uploads.
`BookConsultationRequestDto` has no field for them (`additionalProperties:
false` would reject one) — the old upload step had nowhere to attach its
result. Dropped rather than built with nowhere for the data to go.

- [x] ~~Confirm whether `Inspection` is being retired~~ — answered by the
      spec, 2026-08-22: it was *expanded*, not retired. `Inspection` now has
      fees, availability, read-back, reschedule, cancel and payment, and
      `AdminInspections` has list/status/delete, availability blocks,
      categories and pricing CRUD. **It is a separate table** from
      `Consultations` (different ids, different records; confirmed live) that
      only shares the pricing rows. The app books into `Consultations`, so
      the admin surface was built there (`app/admin/dashboard/consultations/`).
- [x] ~~`AdminConsultations` is list+cancel only~~ — built 2026-08-22 at
      `/admin/dashboard/consultations` (bookings with status/date filters +
      cancel with reason; per-type pricing edit). What the client asked for
      that is still not buildable is listed under "Asks for the backend team
      → 7".

**New backend gap found while building this:** guest (unauthenticated)
bookings return a real `managementToken` for cancelling/rescheduling without
an account — confirmed live — but **the mechanism for using it is
undocumented**, and none of the usual conventions work: tried it as a custom
header (`X-Management-Token`, `ManagementToken`, `Management-Token`), as
`Authorization: Bearer`, as a query param, and as a body field — all four
return `401 "A consultation management token is required."` This doesn't
block anything here (this app still gates booking *submission* behind
sign-in, a product decision unchanged from before — authenticated bookings
manage via `/consultations/mine` instead), but it means true guest booking
can't be built until backend documents it.

- [x] ~~Ask backend how `managementToken` is sent~~ — it is the
      **`X-Consultation-Token`** request header, now declared in the spec on
      every `/consultations/{id}/*` and `/inspections/{id}/*` operation.
      Confirmed live on `/consultations/{id}` GET, reschedule and cancel
      (2026-08-22) — header only; Bearer, `?token=`, `?managementToken=` all
      401. **Guest booking is open for free types since 2026-08-22 (paid types still require sign-in — product rule):** the sign-in wall on
      `app/(user)/consultation/client.jsx` is gone, the token is kept in
      `lib/consultation-tokens.js` (localStorage, per booking id) and carried
      in the manage link `/consultation/{id}?t=…` (`app/(user)/consultation/[id]/`).
      `lib/proxy.js` forwards `x-consultation-token`. Driven in a browser:
      no token → lock card; wrong token → "not valid" copy; right token →
      card with Reschedule/Cancel; bare URL afterwards → still works from
      localStorage; reschedule + cancel succeeded through the proxy.

      Found on the way and fixed: `proxyFetch` in `lib/api/consultations.js`
      threw a status-less Error on 401, so `useConsultation` retried an
      unauthorised read twice and the page could not tell "no access" from
      "unreachable". It now carries `status: 401`.
- [x] ~~Orphaned test bookings~~ — "Anon Check" was already gone server-side
      (404 on 2026-08-22); the two `ZZ *Probe` inspections were deleted via
      the new `DELETE /admin/inspections/{id}`.

### `POST /api/v1/projects` exists — `/dashboard/projects` is still read-only

The specific blocker is gone: `POST /api/v1/projects`
(`DesignFlow.CreateProjectRequestDto` — `name`, `description`, `roomType`,
`startDate`, `totalBudget`) now exists, under the plain `Projects` tag (not
admin-only). `projectId` was also added to `AI.CreateRenovationEstimateRequestDto`
and the new `Consultations.BookConsultationRequestDto` — not yet to
`DesignFlow.CreateDesignSessionRequestDto` (tracked separately, ask 5 above).
A single inspection/consultation booking can now be read directly too
(`GET /consultations/{id}`), closing the other half of the old complaint.

- [ ] Build project creation in the UI; wire the "My Projects" hub to
      aggregate designs (once ask 5 lands), renovation estimates, and
      consultations by `projectId`.

---

## Known bugs — found, not fixed

Each was found while doing something else. None is in the path of a shipped
feature, which is why they are here rather than fixed.

### Two unrelated product query-key namespaces

`hooks/use-product.js:34` keys the detail query on `["product", id]` — singular.
`hooks/use-products.js:7` exports `productKeys.all = ["products"]`. React Query
matches by prefix, so invalidating one never touches the other.

`productKeys.detail(id)` exists, returns `["products","detail",id]`, and **nothing
reads it**:

```bash
grep -rl 'productKeys.detail' hooks lib app components | grep -v use-admin-products   # empty
```

Worked around in `hooks/use-admin-products.js`, which invalidates both prefixes.

- [ ] Merge the namespaces, delete `productKeys.detail`, drop the workaround.

### The product detail route caches 120s — stale after an admin write

`app/api/products/[id]/route.js` sets `next: { revalidate: 120 }` and
`s-maxage=120`. Right for the public site, wrong for the admin edit page: after
uploading, deleting, or re-ordering an image, refetching `/api/products/{id}`
returns the cached body, so the change appears not to have happened.

`ProductImageManager` works around this by holding authoritative local state
seeded from props and updated from each mutation's response — an editor trusts
the mutation result rather than round-tripping a cache. So the admin's own
actions are always correct, but a *fresh page load* can be up to 120s stale
(e.g. an image added in another tab).

`useProduct` is admin-only today (the public detail page fetches by slug), so
making this route `no-store` would be safe now — but that couples a generic
route to admin semantics and a future public consumer would silently lose
caching. The list route solved the same tension with an `activeOnly=false`
signal; the detail route has no equivalent.

```bash
grep -n 'revalidate' 'app/api/products/[id]/route.js'
```

- [ ] Decide: local state is enough, or give the detail route an admin-fresh
      signal. Also: this route does not `parseResponse` — it predates the
      contract system, so `images[]` is validated on the list but not here.

### `contracts/manifest.json` casing is load-bearing

The OpenAPI spec keys paths as `/api/v1/Products`; ASP.NET routes
case-insensitively, so `/products` works at runtime. A lowercase key in the
manifest would therefore work everywhere except the ledger, where it would read
as 0% coverage forever. `scripts/coverage.mjs` makes an unresolvable key a hard
error rather than a zero — keep it that way.

---

## Deferred features

### AdminProducts images — DONE (2026-07-10)

Implemented against the multipart endpoint the backend shipped after the
snapshot: `POST /admin/adminproducts/{productId}/images/upload` (field `file`;
`isPrimary`/`displayOrder`/`altText` as query params), plus
`DELETE images/{imageId}` and `PUT .../primary`. All three verified end-to-end
against dev.

Wired into **both** admin product pages:
- **Edit** — `product-image-manager.jsx`: upload/delete/set-cover against an
  existing product, live.
- **New** — `product-image-stager.jsx`: images are staged locally (the upload
  endpoint needs a productId that does not exist yet), then uploaded in order
  after create returns an id. A partial upload failure keeps the created product
  and routes to edit to finish. Verified: create → 3 staged uploads → cover set.

The old JSON `AddProductImageDto` (`POST {id}/images`) is **superseded** by the
upload endpoint and unused. One thing this left behind, below: the
detail-route cache workaround (known bug). The snapshot being behind was the
other — resolved by the 2026-08-12 refresh, see the note at the top of "Asks
for the backend team".

### `POST /api/v1/Products`

The parallel write surface. Deliberately not implemented. See backend ask #4.

---

## Contract coverage

**33 of 324 operations (10.2%) have a validated response schema.**
(29/303 on 2026-08-12; the four `AdminConsultations` operations were added
2026-08-22 — `contracts/admin-consultation*.json`.)

```bash
npm run contract:coverage             # the ledger
npm run contract:coverage -- Cart     # what a given feature needs
```

The floor is ratcheted in CI — coverage cannot regress by accident.

### Mutations are modelled but never drift-checked

`contract:check` replays GETs nightly. It cannot re-run a `POST`. So the four
AdminProducts mutation schemas are only as fresh as the last
`node scripts/record-mutations.mjs --write`. If the backend changes one, nothing
tells us — it fails open in production.

- [ ] Either accept this and re-record on a cadence, or teach the nightly job to
      run the scoped mutation cycle against dev.

### The proxy registry is empty and unused

`lib/api/contract.ts` exports `findContract()`, and `lib/proxy.js` never calls
it. Responses flowing through the generic `/api/v1/*` proxy are **not** validated
— only the bespoke route handlers in `app/api/` parse their responses.

```bash
grep -c 'parseResponse\|findContract' lib/proxy.js    # 0
```

- [ ] Either wire the registry into `lib/proxy.js`, or delete `findContract` and
      say plainly that only route handlers validate.

### Unmodelled things we know we don't know

- `GET /Cart` — only ever observed empty, so the item shape is genuinely unknown.
  Modelling it now would be a guess. 6 of 8 Cart operations are `✗ UNKNOWN`.
- `failures[]` in the bulk response — empty in the only response we could
  obtain, so typed `z.unknown()`. Widen when a bulk row actually fails.
- The 15 always-null `Product` fields (`aiKeywords`, `specifications`, …) are
  `z.unknown()` on purpose. Guessing `string[]` would alarm on the truth.

---

## Structural debt

### `lib/actions/auth.js` duplicates the error-message extraction

`lib/errors.js#extractBackendMessage` is now the one place that pulls a
user-facing message out of a backend error body, used by `lib/axios.js` and
`lib/api/client.js`. `auth.js` still inlines its own `data?.message || …` at
four call sites and routes them through its own `authError` helper.

Its *semantics* are intentionally different — for a login attempt a 401 means
"wrong credentials" and the backend message should show, whereas the general
`getFriendlyMessage` maps 401 → "session expired". So do **not** move auth onto
`getFriendlyMessage`. The safe cleanup is only to swap the four inline
extractions for `extractBackendMessage(data)`. Left undone because the auth
flows (login, register, reset, verify) could not be driven end-to-end in this
session — refactor and drive them together.

### No tests

There is no safety net. "It compiles" is not evidence — every change must be
driven in the app. This is the single largest gap and it makes the three items
below unenforceable.

### TypeScript stops at the API boundary

`checkJs: false`, so `.js`/`.jsx` is not type-checked. `p.price.toFixed()` on a
quote-only product (where `price` is `null`) still compiles.

```bash
find lib -name '*.ts' | wc -l    # 6 converted files
```

The types exist and are correct; they simply do not bite until the *consumer* is
`.ts`. That is the argument for continuing the migration inward.

- [ ] Convert `hooks/use-products.js` and `hooks/use-product.js` next — they are
      the widest consumers of `Product`.

### `enabled: isAuthenticated` cannot be linted

A linter cannot know which endpoints need a session. It is in `CLAUDE.md`, in
`/feature`, and in the checklist. It is not in the gate. A public page that
fires an authenticated query just spends a request to be told 401.

### Loading states

**2 `loading.jsx` files across 63 pages.** Error boundaries are done (6, covering
every route group); loading skeletons are not.

```bash
find app -name loading.jsx | wc -l
find app -name 'page.js*' | wc -l
```

### 50 bespoke route handlers

Most of `app/api/**/route.js` duplicates what `lib/proxy.js` already does. They
now all read `API_URL` from `lib/env.js`, so consolidating them is mechanical.
Prefer `/api/v1/*`; do not add more.

### Mock fixtures in production code

Two left, from fifteen:

```bash
grep -rn "@/lib/mock" app components hooks lib | grep -v '^lib/mock/'
```

| Fixture | Consumer | Real endpoint |
|---|---|---|
| `lib/mock/messages.js` | `hooks/use-messages.js`, vendor messages page (`mockQuickReplies`) | `GET /api/v1/vendor/messages` — **200**, and `lib/api/vendor/messages.js` already wraps it. `useVendorMessages`/`useVendorConversations` in the same hook file are already real; the generic `useConversations`/`useMessages` are not. `mockQuickReplies` is UI copy, not data — move it beside the component. |
| `lib/mock/account.js` | `hooks/use-account.js`, vendor account settings | `GET /api/v1/auth/me` — **200**. `getSecuritySettings`/`toggle2FA` have no endpoint; check `TBM.Core` before building UI for them. |

Deleted in the mock-removal pass: `bogat-products`, `inventory`, `user-orders`,
`user-dashboard`, `order-details`, `orders`, `users`, `settings`,
`notifications`, `admin`, `data`, `delivery`, `financial`, `system-logs`, plus
`lib/data/products.js`, `lib/mock-data.js`, `lib/api/flooring/route.js` and
`public/mock/`.

**No mock *products* remain.** The static catalogue (`lib/data/products.js`),
its orphaned consumer (`lib/api/flooring/route.js` — in `lib/`, so never
routable), `lib/mock-data.js`, `lib/mock/bogat-products.js`, the dead
product-carrying fixtures (`inventory`, `user-orders`, `user-dashboard`) and
`public/mock/*` are all deleted. Every product surface reads the backend.

The vendor order detail page no longer renders mock line items. It reads
`GET /api/v1/vendor/orders/{orderId}` and `lib/mock/order-details.js` is
deleted. The panels that existed only in the fixture — a VISA card with an
expiry, "member type", carrier status, a grey box captioned "Google Maps", a
hand-written activity timeline — were removed rather than re-pointed at fields
the backend has no equivalent for.

The remaining fixtures (`orders`, `messages`, `users`, `notifications`,
`settings`, `account`, `system-logs`) carry no product data.

### 78 lint warnings

`npm run lint` (not `lint:arch`). Mostly:

| Rule | Count |
|---|---|
| `@next/next/no-img-element` | 22 |
| `react-hooks/*` (render/refs) | 28 |
| `react/no-unescaped-entities` | 12 |
| `no-restricted-imports` (mocks) | 10 |

Demoted to warnings in `eslint.guardrails.mjs` so the gate stays meaningful. Fix
them as you touch the files; raise the rule back to `error` when the last one goes.

---

## Doc drift

### Two more unnamed enums decoded — Portfolio

CLAUDE.md lists `brandType` and `productType` as bare `integer`s whose values had
to be decoded from live data. Portfolio adds two, both declared `enum: [0,1,2]`
with no names:

| Enum | Mapping | Binding |
|---|---|---|
| `PortfolioStatus` | 0 Draft, 1 Published, 2 Rejected | Query param takes **either** form; the `PATCH /status` **JSON body takes only the integer** — a string 400s with `$.status` |
| `PortfolioImageType` | 0 Before, 1 After, 2 Reference | Query param; names bind and are used in `adminPortfolioAPI.uploadImage` because they read |

Decoded by probing, not guessed — reproduce with:

```bash
# names bind (reach the project lookup) vs. fail at model binding
for T in Before After Reference Nonsense; do
  curl -s -o /dev/null -w "$T %{http_code}\n" -X POST -H "Authorization: Bearer $TOK" \
    -F file=@/dev/null "$API/admin/AdminPortfolio/00000000-0000-0000-0000-000000000001/images?imageType=$T"
done
# which integer is Published
curl -s -H "Authorization: Bearer $TOK" "$API/admin/AdminPortfolio?status=1" | grep -c Published
```

- [ ] Ask the backend to annotate these with `[JsonConverter(typeof(JsonStringEnumConverter))]`
      so body and query bind alike, and so the names reach the spec.

### `docs/api/tbm-backend-api.md` — RESOLVED (now generated)

There was no generator; the doc had been maintained by hand and lagged the
snapshot. `scripts/gen-api-doc.mjs` now regenerates it from
`docs/api/swagger.snapshot.json`, and the doc is regenerated (278 operations,
all 12 new endpoints included). The hand-written analysis at the top is embedded
in the generator, so that file is the single source.

**Workflow when the backend changes:**

```bash
curl <source-url> -o docs/api/swagger.snapshot.json   # refresh (URL in the doc header)
npm run doc:api                                        # regenerate the markdown
npm run contract:coverage                              # coverage recomputes off the snapshot
```

The generator was validated by diffing its output against the previous
hand-maintained doc: every pre-existing endpoint row and schema block reproduced
byte-for-byte, and all 138 internal links resolve. The only content changes were
the 12 new endpoints and two `Body of:` lines that are now *more* correct (the
generator detects that `POST /AdminProducts/bulk` uses `CreateProductDto` as its
array item, which the hand-maintained doc had missed).

### `CLAUDE.md` stale counts

`CLAUDE.md`'s "Known debt" section has stale counts. Corrected here; fix there
when convenient.

| Claim in `CLAUDE.md` | Actual |
|---|---|
| ~40 legacy React warnings | 78 |
| 48 bespoke route handlers | 50 |
| mocks imported by 11 call sites | 10 |

### `CLAUDE.md` is gitignored

A teammate cloning this repo gets `eslint.guardrails.mjs` and CI — the
machine-enforced half of the architecture — without the reasoning behind it.
Defensible, but know that it is the trade.

- [ ] Decide whether to track it.
