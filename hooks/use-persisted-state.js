// hooks/use-persisted-state.js
"use client";

import { useEffect, useRef, useState } from "react";

/**
 * useState that mirrors its value to web storage so it survives refreshes
 * and navigation. Defaults to sessionStorage (per-tab, cleared when the tab
 * closes) which suits transient, sensitive flows like checkout.
 *
 * Hydration is done in an effect (not the initializer) so the first client
 * render matches the server render and there is no hydration mismatch.
 *
 * @param {string} key
 * @param {*} initialValue
 * @param {{ storage?: "session" | "local" }} [opts]
 * @returns {[value, setValue, hydrated]}
 */
export function usePersistedState(key, initialValue, { storage = "session" } = {}) {
  const [value, setValue] = useState(initialValue);
  const [hydrated, setHydrated] = useState(false);
  // Avoid writing back the initial value before hydration has run.
  const didHydrate = useRef(false);

  const getStore = () => {
    if (typeof window === "undefined") return null;
    return storage === "local" ? window.localStorage : window.sessionStorage;
  };

  // Hydrate once on mount (client only).
  useEffect(() => {
    try {
      const raw = getStore()?.getItem(key);
      if (raw != null) setValue(JSON.parse(raw));
    } catch {
      // ignore malformed/blocked storage
    }
    didHydrate.current = true;
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Persist on change, after hydration.
  useEffect(() => {
    if (!didHydrate.current) return;
    try {
      const store = getStore();
      if (!store) return;
      if (value == null || value === "") store.removeItem(key);
      else store.setItem(key, JSON.stringify(value));
    } catch {
      // ignore quota/availability errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, value]);

  return [value, setValue, hydrated];
}

/** Remove keys from sessionStorage (and optionally localStorage). */
export function clearPersistedState(keys, { storage = "session" } = {}) {
  if (typeof window === "undefined") return;
  const store = storage === "local" ? window.localStorage : window.sessionStorage;
  for (const k of [].concat(keys)) {
    try {
      store.removeItem(k);
    } catch {
      // ignore
    }
  }
}

// Shared key namespace so page + form components stay in sync.
export const CHECKOUT_KEYS = {
  step: "tbm_checkout_step",
  delivery: "tbm_checkout_delivery",
  payment: "tbm_checkout_payment",
  promoCode: "tbm_checkout_promo_code",
  promoDiscount: "tbm_checkout_promo_discount",
  form: "tbm_checkout_form", // live (uncommitted) delivery form fields
  // A payment attempt that has been submitted to the backend but not yet
  // resolved (paid or definitively failed) — { idempotencyKey, orderId,
  // orderNumber, reference, createdAt }. Its presence is what stops the
  // checkout page from starting a second payment for the same cart; only
  // app/(user)/checkout/verify clears it, and only once it has a terminal
  // answer. See BACKLOG.md, "Checkout retry could double-charge".
  //
  // Deliberately `localStorage`, not `sessionStorage` like the rest of this
  // namespace: it has to survive the tab closing or the browser crashing
  // between paying on Paystack and this app confirming it, or the shopper
  // loses the one thing standing between them and a duplicate charge. Pass
  // `{ storage: "local" }` wherever this key is read or written.
  attempt: "tbm_checkout_attempt",
};

/**
 * How long an unresolved `attempt` blocks a new checkout submission before
 * it's treated as abandoned rather than in-flight. Long enough to cover a
 * slow webhook or a shopper who stepped away mid-payment; short enough that
 * a genuinely abandoned attempt doesn't lock a shopper out of buying
 * something else. The order itself is never deleted by this — it just stops
 * being the reason `/checkout` redirects instead of rendering.
 */
export const CHECKOUT_ATTEMPT_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Same role as `CHECKOUT_KEYS.attempt`, for consultation booking payment —
 * `localStorage`, `{ storage: "local" }`. `{ consultationId, createdAt }`.
 *
 * The failure mode this guards against is narrower than checkout's:
 * `BookConsultationRequestDto` has no idempotency key, so a lost response
 * after `POST /consultations` genuinely cannot be deduped by resubmitting —
 * only the slot-locking side effect ("That consultation slot has just been
 * booked") catches an exact resubmit, and it reads as a confusing error, not
 * a safe no-op. This key's job is narrower and still real: once a
 * consultation id is known, never call `book()` again for that attempt —
 * only ever retry `initialize-payment` against the same id, which is safe to
 * repeat (see lib/api/consultations.js).
 */
export const CONSULTATION_KEYS = {
  attempt: "tbm_consultation_attempt",
};

export const CONSULTATION_ATTEMPT_TTL_MS = 30 * 60 * 1000; // 30 minutes
