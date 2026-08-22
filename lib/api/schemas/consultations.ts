// lib/api/schemas/consultations.ts
//
// SERVER-ONLY. See the header of ./common.ts.
//
// The `Consultations` resource (distinct from the old, thinner `Inspection`
// endpoints it sits alongside — BACKLOG.md) was fully unmodelled until
// 2026-08-12. Every shape here was recorded live —
// scripts/record-consultation-shape.mjs, both the free (`fee: 0`) and
// test-mode-paid paths, each booked then cancelled — see
// contracts/consultation-booking-{free,paid}.json,
// contracts/consultations-{types,mine}.json.
//
// `status` is a real string the backend already names (unlike Order's numeric
// enum) — observed values: "PendingPayment" (paid type, before payment),
// "Confirmed" (free type, or paid + verified), "Cancelled". Others (e.g. a
// completed/past consultation) are unconfirmed; render the string as-is and
// don't invent a closed set.

import { z } from "zod";
import { envelope } from "./common";

/** GET /consultations/types item. `description` was null on all 5 seeded types. */
export const consultationTypeSchema = z.looseObject({
  key: z.string(),
  name: z.string(),
  durationMinutes: z.number(),
  fee: z.number(),
  /** Added by the backend after 2026-08-12; "NGN" on every row since. */
  currency: z.string().optional(),
  format: z.string(),
  description: z.unknown(),
});

/** GET /consultations/types — a bare array in `data`, not `data.items`. */
export const consultationTypesResponse = envelope(z.array(consultationTypeSchema));

export const consultationSlotSchema = z.looseObject({
  start: z.string(),
  end: z.string(),
  isAvailable: z.boolean(),
});

/** GET /consultations/availability */
export const consultationAvailabilityResponse = envelope(
  z.looseObject({
    type: consultationTypeSchema,
    timeZone: z.string(),
    slots: z.array(consultationSlotSchema),
  }),
);

/**
 * The full consultation booking. `projectId`, `paymentReference` (before a
 * payment attempt), `cancelledAtUtc`, and `cancellationReason` are nullable —
 * confirmed both states live (null right after booking; `paymentReference`
 * populated once `initialize-payment` runs, `cancelledAtUtc`/
 * `cancellationReason` populated once cancelled).
 *
 * `propertyType`, `siteAddress`, `siteCity`, `siteState` and `notes` were
 * modelled as plain strings on 2026-08-12 because every booking this app had
 * made filled them in. The admin list (contracts/admin-consultations.json,
 * 13 rows) shows all five as `null|string` — a video consultation has no site
 * and the DTO does not require any of them. Widened 2026-08-22.
 */
export const consultationSchema = z.looseObject({
  id: z.string(),
  projectId: z.string().nullable(),
  typeKey: z.string(),
  typeName: z.string(),
  format: z.string(),
  durationMinutes: z.number(),
  fee: z.number(),
  scheduledStart: z.string(),
  scheduledEnd: z.string(),
  status: z.string(),
  paymentVerified: z.boolean(),
  paymentReference: z.string().nullable(),
  contactName: z.string(),
  contactEmail: z.string(),
  contactPhone: z.string(),
  propertyType: z.string().nullable(),
  siteAddress: z.string().nullable(),
  siteCity: z.string().nullable(),
  siteState: z.string().nullable(),
  notes: z.string().nullable(),
  cancelledAtUtc: z.string().nullable(),
  cancellationReason: z.string().nullable(),
  cancellationRequiresManualRefundReview: z.boolean(),
});

/**
 * POST /consultations, POST /consultations/book — same
 * `ConsultationBookingResultDto` either way (confirmed both routes accept the
 * identical `BookConsultationRequestDto`; this app calls `/consultations`).
 * `managementToken` was null on every authenticated booking observed — likely
 * only populated for a guest booking with no account to manage it from;
 * unconfirmed.
 */
export const consultationBookingResponse = envelope(
  z.looseObject({
    consultation: consultationSchema,
    managementToken: z.unknown(),
  }),
);

/** GET /consultations/{id}, PUT .../reschedule, POST|PUT .../cancel — all answer the bare Consultation. */
export const consultationResponse = envelope(consultationSchema);

/** GET /consultations/mine — a bare array in `data`, not `data.items` (confirmed; the `ConsultationPagedResultDto` schema in the spec is not what this endpoint actually returns). */
export const consultationListResponse = envelope(z.array(consultationSchema));

/**
 * POST /consultations/{id}/initialize-payment — enveloped (unlike
 * `POST /checkout/payment`, which is not). Same Paystack fields as checkout.
 */
export const consultationPaymentInitResponse = envelope(
  z.looseObject({
    authorizationUrl: z.string(),
    accessCode: z.string(),
    reference: z.string(),
    amount: z.number(),
  }),
);

/**
 * POST /consultations/verify-payment. Only the *failure* shape has been
 * observed (400, `data: null`) — a reference that doesn't match any
 * consultation, and a reference for a payment never completed at Paystack,
 * both returned `{ success: false, message, data: null, errors: [] }`. Note
 * `errors` is `[]` here, not `null` like every other envelope in this app —
 * confirmed, not a typo. The success shape (200) is unconfirmed; this schema
 * only covers what's been seen.
 */
export const consultationVerifyPaymentResponse = z.looseObject({
  success: z.boolean(),
  message: z.string(),
  data: z.unknown(),
  errors: z.unknown(),
});

// ── Admin ────────────────────────────────────────────────────────────────────
//
// `AdminConsultations` is list + cancel + pricing. Recorded 2026-08-22 —
// contracts/admin-consultations.json, contracts/admin-consultations-pricing.json,
// contracts/admin-consultation-cancel.json,
// contracts/admin-consultation-pricing-update.json. Note this is a different
// table from the legacy `/admin/inspections` surface (different ids, different
// records); the app's booking flow writes here.

/**
 * GET /admin/consultations — paged, but with the *short* pagination block:
 * `{ items, page, pageSize, totalCount }` and nothing else. No `totalPages`,
 * no `hasMore` — derive them. Matches `ConsultationPagedResultDto` exactly.
 */
export const adminConsultationListResponse = envelope(
  z.looseObject({
    items: z.array(consultationSchema),
    page: z.number(),
    pageSize: z.number(),
    totalCount: z.number(),
  }),
);

/** PUT /admin/consultations/{id}/cancel — the bare Consultation, like the user-side cancel. */
export const adminConsultationCancelResponse = envelope(consultationSchema);

/**
 * One row of the per-type fee table. `consultationType` is the *display name*
 * ("Site Consultation"), not the `typeKey` ("site-consultation") that
 * `/consultations/types` uses — there is no key on this row, so join on the
 * name. `location` was null on every row; it is the not-yet-used
 * per-location pricing hook and is left unmodelled.
 */
export const consultationPricingConfigSchema = z.looseObject({
  id: z.string(),
  consultationType: z.string(),
  fee: z.number(),
  currency: z.string(),
  location: z.unknown(),
  creditedTowardProject: z.boolean(),
  isActive: z.boolean(),
  updatedAt: z.string(),
});

/** GET /admin/consultations/pricing — a bare array in `data`. */
export const adminConsultationPricingResponse = envelope(
  z.array(consultationPricingConfigSchema),
);

/** PUT /admin/consultations/pricing/{id} — the updated row. */
export const adminConsultationPricingItemResponse = envelope(consultationPricingConfigSchema);
