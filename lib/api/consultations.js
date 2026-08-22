// lib/api/consultations.js
// Consultation booking. All requests go through the Next.js proxy (/api/proxy/v1).
//
// Rebuilt 2026-08-12 against the real `Consultations` resource (BACKLOG.md —
// "A real consultation-booking feature exists"). Replaces the old client-side
// taxonomy this file used to carry: five consultation types, their fees, and
// the "requires a site visit" flag are now real backend data
// (`GET /consultations/types`), not constants folded into a notes string.
//
// Every shape here was recorded live, not invented — see
// contracts/consultations-types.json, contracts/consultation-booking-{free,paid}.json,
// contracts/consultation-reschedule-cancel.json, and lib/api/schemas/consultations.ts.
//
// Two things worth knowing before touching this file:
//
// 1. `BookConsultationRequestDto` has no idempotency key. Unlike
//    `POST /checkout/payment`, resubmitting an identical booking is not
//    deduplicated by a key the frontend controls — it is only prevented
//    because the slot itself becomes unavailable once booked ("That
//    consultation slot has just been booked."), which is a side effect of
//    slot-locking, not a designed safeguard. Never call `book()` again for an
//    attempt that already produced a consultation id — reuse that id for any
//    further payment attempts instead. See hooks/use-consultations.js.
//
// 2. `initialize-payment` is NOT idempotent — calling it twice on the same
//    consultation returns two *different* Paystack sessions (confirmed live).
//    That's safe to do (it can't create a second consultation, only a second
//    payment link for the same one), but don't assume retrying it returns the
//    same authorizationUrl the way checkout's equivalent does.

import { logApiError, getFriendlyMessage } from "@/lib/errors";

/**
 * @param {string} path
 * @param {RequestInit & { token?: string|null }} [options] — `token` is a
 *   guest booking's `managementToken`, sent as `X-Consultation-Token`
 *   (the only form the backend accepts; Bearer/query/body all 401 —
 *   confirmed live 2026-08-22). Omit it for a signed-in user: the cookie
 *   identifies them and the backend resolves ownership from that.
 */
async function proxyFetch(path, { token, ...options } = {}) {
  const res = await fetch(`/api/proxy/v1${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "X-Consultation-Token": token } : {}),
      ...(options.headers ?? {}),
    },
  });
  if (res.status === 401) {
    // Carry the status: callers (useConsultation's retry, the manage page)
    // need to tell "not allowed" from "unreachable". A guest with no/wrong
    // token lands here too, so the message can't assume a session existed.
    throw Object.assign(
      new Error(token ? "This link is not valid for this booking." : "Sign in, or open the manage link from your booking confirmation."),
      { status: 401 },
    );
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let json = null;
    try { json = JSON.parse(text); } catch {}
    const backendMessage = json?.message || json?.title || `API error ${res.status}`;
    logApiError(path, res.status, json ?? text);
    throw Object.assign(new Error(getFriendlyMessage(res.status, backendMessage)), { status: res.status, backendMessage });
  }
  const text = await res.text();
  return text ? JSON.parse(text) : { success: true };
}

export const consultationsApi = {
  /**
   * GET /api/v1/consultations/types — public. Five types observed, each with
   * a real `fee` (three are 0, i.e. free) and `format` ("Video" | "InPerson").
   * @returns {Promise<import("@/lib/api/types").ConsultationTypesResponse>}
   */
  getTypes: () => proxyFetch("/consultations/types"),

  /**
   * GET /api/v1/consultations/availability?type=&date= — public.
   * `date` is optional (defaults to today server-side, observed).
   * @param {string} typeKey
   * @param {string} [date] - "YYYY-MM-DD"
   * @returns {Promise<import("@/lib/api/types").ConsultationAvailabilityResponse>}
   */
  getAvailability: (typeKey, date) => {
    const query = new URLSearchParams({ type: typeKey, ...(date ? { date } : {}) });
    return proxyFetch(`/consultations/availability?${query}`);
  },

  /**
   * POST /api/v1/consultations — `Consultations.BookConsultationRequestDto`.
   * Works anonymously (confirmed live — a guest booking gets a real
   * `managementToken` back; an authenticated one gets `null`, managed via
   * `/consultations/mine` instead). Guest booking is intentional on the
   * backend's side (confirmed 2026-08-22). This app allows it for **free**
   * types only — paid types require sign-in (product rule, see
   * app/(user)/consultation/client.jsx). A guest's token is remembered in
   * lib/consultation-tokens.js and carried in the manage link,
   * `/consultation/{id}?t=…`.
   *
   * @param {{
   *   typeKey: string, scheduledStart: string, projectId?: string,
   *   contactName?: string, contactPhone?: string, contactEmail?: string,
   *   propertyType?: string, siteAddress?: string, siteCity?: string,
   *   siteState?: string, notes?: string,
   * }} payload
   * @returns {Promise<import("@/lib/api/types").ConsultationBookingResponse>}
   */
  book: (payload) =>
    proxyFetch("/consultations", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /**
   * POST /api/v1/consultations/{id}/initialize-payment — real Paystack
   * session, enveloped (unlike checkout's equivalent). Only meaningful when
   * the consultation's `fee > 0`; a free type is `status: "Confirmed"`
   * immediately on booking and never needs this.
   * @returns {Promise<import("@/lib/api/types").ConsultationPaymentInitResponse>}
   */
  initializePayment: (id, email, token) =>
    proxyFetch(`/consultations/${id}/initialize-payment`, {
      method: "POST",
      body: JSON.stringify({ email }),
      token,
    }),

  /**
   * POST /api/v1/consultations/verify-payment. Unlike checkout's Paystack
   * verify (always 200, status in the body), this returns **400** for a
   * reference that never completed — confirmed live,
   * `{ success: false, message, data: null }`. A thrown network error is the
   * only genuinely ambiguous case; a clean 400 here already is the answer.
   * @param {string} reference
   * @returns {Promise<import("@/lib/api/types").ConsultationVerifyPaymentResponse>}
   */
  verifyPayment: (reference) =>
    proxyFetch("/consultations/verify-payment", {
      method: "POST",
      body: JSON.stringify({ reference }),
    }),

  /**
   * GET /api/v1/consultations/{id}
   * @returns {Promise<import("@/lib/api/types").ConsultationResponse>}
   */
  getConsultation: (id, token) => proxyFetch(`/consultations/${id}`, { token }),

  /**
   * GET /api/v1/consultations/mine — `data` is a bare array, not `data.items`.
   * @returns {Promise<import("@/lib/api/types").ConsultationListResponse>}
   */
  getMyConsultations: () => proxyFetch("/consultations/mine"),

  /**
   * PUT /api/v1/consultations/{id}/reschedule
   * @returns {Promise<import("@/lib/api/types").ConsultationResponse>}
   */
  reschedule: (id, scheduledStart, token) =>
    proxyFetch(`/consultations/${id}/reschedule`, {
      method: "PUT",
      body: JSON.stringify({ scheduledStart }),
      token,
    }),

  /**
   * POST /api/v1/consultations/{id}/cancel. Cancellation policy is in the
   * response `message`, not a field — e.g. "Payments within 24 hours are
   * non-refundable; no refund was issued automatically." (confirmed live).
   * Surface it; don't invent your own policy copy.
   * @returns {Promise<import("@/lib/api/types").ConsultationResponse>}
   */
  cancel: (id, reason, token) =>
    proxyFetch(`/consultations/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
      token,
    }),
};

/** "₦50,000" · "Free" */
export function formatFee(naira) {
  return naira > 0 ? `₦${naira.toLocaleString("en-NG")}` : "Free";
}

/** "45 minutes" · "1 hour" · "1 hour 30 minutes" */
export function formatDuration(minutes) {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const h = `${hours} hour${hours > 1 ? "s" : ""}`;
  return rest ? `${h} ${rest} minutes` : h;
}

export const PROPERTY_TYPES = [
  "Apartment / Flat",
  "Duplex",
  "Bungalow",
  "Detached House",
  "Office / Commercial",
  "Retail Space",
  "Hospitality",
  "Other",
];
