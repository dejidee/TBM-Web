// lib/consultation-tokens.js
//
// Where a guest's consultation management tokens live between page loads.
//
// A guest books without an account, and the backend hands back a
// `managementToken` exactly once, on the booking response. It is the only
// credential that can read, reschedule, cancel or pay for that booking
// (`X-Consultation-Token`, lib/api/consultations.js). We have to keep it
// somewhere the verify page can find it after Paystack redirects back, and
// somewhere the manage page can find it on a later visit — so: localStorage,
// keyed by consultation id. The manage link also carries it (`?t=`), so a
// guest on another device is not locked out.
//
// It is a capability for one booking, not an identity — losing it loses
// access to that booking only, and the contact details on it are ones the
// guest typed themselves.

const STORAGE_KEY = "tbm_consultation_tokens";

function read() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

export function rememberManagementToken(id, token) {
  if (!id || !token || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...read(), [id]: token }));
  } catch {
    /* private mode / quota — the ?t= link still works */
  }
}

/** @returns {string|null} */
export function getManagementToken(id) {
  if (!id) return null;
  return read()[id] ?? null;
}

/** The shareable manage URL for a booking — token included only when we hold one. */
export function manageHref(id, token) {
  const t = token ?? getManagementToken(id);
  return t ? `/consultation/${id}?t=${encodeURIComponent(t)}` : `/consultation/${id}`;
}
