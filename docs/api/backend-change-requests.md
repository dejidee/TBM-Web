TBM BACKEND — CHANGE REQUESTS
Consultation Booking & Portfolio

Prepared for: Backend Developer (.NET API)
Prepared by: Web team
Date: 1 August 2026
Environment tested: tbmdev-001-site1.dtempurl.com (dev)
Status: For review


HOW TO READ THIS

Every finding below was verified by calling the live dev API, not by reading the
OpenAPI document. Where the two disagree, the document is wrong — that is itself
request B2.

Requests are grouped into two sections:

Section A — Blocking the consultation feature. The web app already ships a
consultation booking flow against the one endpoint that exists. These six items
are the difference between what it can do today and what the product requires.

Section B — Correctness and spec accuracy. Lower urgency, higher leverage.

Priority order is given at the end.


---------------------------------------------------------------------------
SECTION A — BLOCKING THE CONSULTATION FEATURE
---------------------------------------------------------------------------

Context: the entire consultation surface in the API is two operations.

     POST /api/v1/inspections/book
     POST /api/v1/inspections/verify-payment

That is one site inspection, booked blind, for free. The product calls for five
consultation types, an availability calendar, a published fee, in-app payment,
reschedule and cancel, and an admin management surface.


A1. THE BOOKING DTO HAS NO CONSULTATION TYPE OR PROPERTY TYPE

Problem
     BookInspectionRequestDto models a site inspection only. The product
     requires five distinct consultation types:

          Virtual consultation
          Site inspection
          Design consultation
          Renovation planning
          Estimate and quotation review

     There is no field for any of them, and none for property type.

Requested change
     Add to BookInspectionRequestDto, and return both on read:

          ConsultationType ConsultationType
               Virtual, SiteInspection, Design, RenovationPlanning, EstimateReview

          string PropertyType

Current workaround
     The frontend prepends both values to additionalNotes so the team reading a
     booking can at least see what was requested. This is a stopgap, not a
     design — the data is unqueryable, unfilterable and unreportable in that
     form.


A2. NO AVAILABILITY — A CHOSEN TIME IS A WISH, NOT A BOOKING

Problem
     No endpoint exposes bookable slots. The whole scheduling model is two
     free-text preferred dates on the booking DTO.

     Consequence: the app cannot let a user book a time. It can only let them
     ask for one, and the UI has to say so explicitly — "Times are requests, not
     confirmed reservations."

Requested change
     Add an availability endpoint:

          GET /api/v1/inspections/availability
               query: consultationType, date, state
               returns: date, and a list of slots, each with start, end,
                        and whether it is available


A3. NOTHING CAN CHARGE FOR A CONSULTATION  ** HARD BLOCKER **

This is the only item on the list that makes a client-requested feature
outright impossible rather than merely degraded.

Three separate findings, all verified against the live API:

     1. verify-payment cannot take a payment.
        Calling POST /api/v1/inspections/verify-payment with an unknown
        reference returns HTTP 200 and this body:

             success: false
             verified: false
             amount: 0
             reference: (echoed back)
             paidAt: null
             message: "No inspection booking matches this payment reference."

        It only CONFIRMS a reference that is already attached to a booking. It
        cannot create one.

     2. There is no consultation fee stored anywhere.
        GET /api/v1/pricing returns AI subscription plans only — Economy and
        Premium render tiers. No consultation or inspection fee exists in it.

     3. There is exactly one payment-initiation endpoint in all 266 operations,
        and it is cart-scoped:

             POST /api/v1/Checkout/payment

Consequence
     "See the applicable consultation fee" and "Make payment through the app"
     are not buildable. The web app's review step therefore states that the fee
     is confirmed by the consultant on acceptance, rather than displaying an
     invented figure behind a Pay button that cannot work.

Requested change
     Add a fee lookup:

          GET /api/v1/inspections/fees
               returns: per-type fee, currency, and whether it is credited
                        toward the project

     Add payment initiation, mirroring the existing Checkout flow:

          POST /api/v1/inspections/{id}/payment
               returns: authorizationUrl, reference

     Note: verify-payment already works correctly and the frontend half is
     written and waiting. Only initiation is missing.


A4. NO WAY TO READ A BOOKING BACK

Problem
     POST /book returns a bookingId, and nothing in the API can ever fetch that
     booking again.

     GET /api/v1/Dashboard/consultations exists, but it is a dashboard summary
     rather than a booking record, and its response shape is still unrecorded.

Consequence
     No confirmation page can show real booking details. No user can review what
     they asked for. Nothing can drive a reschedule or cancel screen.

Requested change
          GET /api/v1/inspections/{id}
          GET /api/v1/inspections/mine


A5. NO RESCHEDULE OR CANCEL

Problem
     No endpoint exists for either. The product explicitly requires both,
     "according to the applicable policy".

Requested change
          PATCH /api/v1/inspections/{id}/reschedule
          POST  /api/v1/inspections/{id}/cancel

     Please also confirm the intended cancellation window and any fee
     consequence, so the frontend can state the policy accurately rather than
     guessing at it.


A6. NO ADMIN SURFACE AT ALL

Problem
     There is no admin/inspections path anywhere in the spec. The client asked
     to manage availability, consultation categories, locations, pricing,
     payments and booking status. None of it is reachable from the admin
     dashboard because none of it exists.

Requested change
     Add an AdminInspections tag covering:

          List bookings, with filters by status, type, date and location
          Transition booking status
          Manage availability and the consulting calendar
          Configure consultation categories
          Configure per-type and per-location pricing
          View payment state against a booking


A7. THE BOOKING ENDPOINT ACCEPTS ANONYMOUS REQUESTS

Finding
     POST /api/v1/inspections/book returns HTTP 200 with no Authorization
     header. No rate limiting was observed.

Please confirm whether that is intended. As it stands the endpoint can be
spammed by anyone who finds it. The frontend already puts an account wall in
front of the submit button, but that is a client-side product decision and not
a control.


---------------------------------------------------------------------------
SECTION B — CORRECTNESS AND SPEC ACCURACY
---------------------------------------------------------------------------

B1. DECLARE RESPONSE SCHEMAS — THE ROOT CAUSE OF EVERYTHING BELOW

Problem
     All 266 operations declare exactly one response — a bare 200 OK — with no
     body type, and no error codes at all. The spec describes requests only.

Consequence
     There is nothing to generate response types from. The web repo carries a
     hand-written schema layer, a recorded-contract directory and three scripts
     purely to work around this. Every response shape in the app had to be
     discovered by calling the live API.

Requested change
     Annotate each action, for example:

          [ProducesResponseType(typeof(ApiResponse<ProductDto>), StatusCodes.Status200OK)]

     Once these exist, Swashbuckle emits response schemas, our types are
     generated in CI automatically, and a shape change becomes a build failure
     instead of a nightly alarm. This is the single highest-leverage item in
     this document — it pays for itself across all 266 operations.


B2. THE BOOKING DTO MARKS REQUIRED FIELDS AS OPTIONAL

Problem
     BookInspectionRequestDto has every field nullable, with no required list.
     Walking the validation chain against the live API proves seven fields are
     in fact enforced:

          contactName
          contactPhone
          contactEmail
          siteAddress
          siteCity
          siteState
          preferredDate1

     Optional, confirmed: preferredDate2, uploadedFileUrls, paymentReference,
     additionalNotes.

Consequence
     Anyone integrating from the document alone receives seven consecutive 400
     responses, one field at a time, before finding a payload that works.

Requested change
     Add the Required attributes so the published spec matches the validator.
     This applies across the API generally — currently only 1 of 96 schemas
     declares a required list.


B3. INSPECTION RESPONSES BREAK THE ENVELOPE CONVENTION

Problem
     Most of /api/v1 returns the standard envelope:

          success, message, data, errors

     These two do not. Their fields sit at the top level with no data object:

          POST /inspections/book
               success, bookingId, status, message

          POST /inspections/verify-payment
               success, verified, amount, reference, paidAt, message

Consequence
     Client code cannot assume an envelope anywhere, so every new endpoint
     becomes a guessing exercise. We currently track at least five distinct
     response shapes across the API.

Requested change
     Either wrap these in the standard envelope, or document the exception
     explicitly. Silent inconsistency is the expensive option.


B4. ENUMS BIND INCONSISTENTLY BETWEEN QUERY AND BODY

Problem
     Two enums are declared in the spec as bare integers with values 0, 1, 2 and
     no names. Both were decoded by probing the live API.

     PortfolioStatus
          0 = Draft
          1 = Published
          2 = Rejected

          Binding: the query parameter accepts either the name ("Published") or
          the integer (1). The JSON body on PATCH /status accepts ONLY the
          integer — sending a string returns 400 with a validation error on
          $.status.

     PortfolioImageType
          0 = Before
          1 = After
          2 = Reference

          Binding: query parameter; names bind correctly.

     Additionally, PATCH /status accepted the value 3, which is out of range for
     a three-value enum. Range validation appears to be missing.

Requested change
     Annotate both enums so body and query bind alike, and so the names reach
     the published spec:

          [JsonConverter(typeof(JsonStringEnumConverter))]

     Add range validation on the status transition.


B5. TWO PRODUCT FIELDS REMAIN WRITE-ONLY

Problem
     CreateProductDto and UpdateProductDto both accept metaTitle and
     metaDescription, and no read endpoint returns either — not GET /Products,
     not /Products/{id}, not /Products/slug/{slug}, and the AdminProducts
     surface has no GET at all.

Consequence
     The admin edit form cannot prefill either field, and a PUT silently
     replaces whatever is stored with whatever the form happened to send.

Requested change
     Return both fields on read.

     This is a pre-existing item, repeated here because the fix is small and the
     data loss is silent.


---------------------------------------------------------------------------
PRIORITY
---------------------------------------------------------------------------

     1.  A3 — payment initiation and fee lookup.
         The only item that makes a client-requested feature impossible rather
         than degraded.

     2.  A1, A4, A5 — consultation type, read-back, reschedule and cancel.
         These unlock the rest of the customer journey.

     3.  B1 — declare response schemas.
         Highest leverage item in the document; benefits every endpoint.

     4.  A2, A6 — availability and the admin surface.

     5.  B2, B3, B4, B5 — spec accuracy and consistency.


---------------------------------------------------------------------------
HOUSEKEEPING
---------------------------------------------------------------------------

Two test bookings were created on the DEV backend while establishing the
contracts documented above. They can be identified by contact name:

     ZZ Contract Probe
     ZZ Proxy Probe

There is no delete endpoint for inspections, so these need removing
server-side. This is also request A6 in miniature — there is currently no way
for anyone to remove a bad booking.


---------------------------------------------------------------------------
APPENDIX — VERIFIED RESPONSE SHAPES
---------------------------------------------------------------------------

Recorded 31 July 2026 against the dev host. Field names exactly as returned.

POST /api/v1/inspections/book
     Request  (7 required fields, see B2)
          contactName, contactPhone, contactEmail,
          siteAddress, siteCity, siteState,
          preferredDate1, preferredDate2, uploadedFileUrls,
          paymentReference, additionalNotes
     Response (HTTP 200, flat — no envelope)
          success, bookingId, status, message
     Example status value: "Pending"

POST /api/v1/inspections/verify-payment
     Request
          reference
     Response (HTTP 200, flat — no envelope)
          success, verified, amount, reference, paidAt, message
     Missing reference returns HTTP 400: success, message

GET /api/v1/portfolio
     Response (enveloped, but note the pagination field names differ from the
     Paged convention used by /Products)
          success, message, errors
          data: items, totalCount, page, pageSize, totalPages, hasMore
     Each item:
          id, vendorId, vendorName, title, location, category,
          budgetMin, budgetMax, budgetDisplay,
          durationMinDays, durationMaxDays, durationDisplay,
          description, scopeOfWork, status, rejectionReason,
          publishedAt, createdAt,
          beforeImages, afterImages, referenceImages, thumbnailUrl
     Each image: id, imageUrl, caption, sortOrder
     Live data at time of writing: 12 published projects, all with before and
     after images.

GET /api/v1/pricing
     Returns AI subscription plans only. Contains no consultation or inspection
     fee. See A3.
