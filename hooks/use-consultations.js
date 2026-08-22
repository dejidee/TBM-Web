// hooks/use-consultations.js
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { consultationsApi } from "@/lib/api/consultations";
import { useSession } from "@/hooks/use-session";

/** GET /consultations/types — public, five real types with fee/duration/format. */
export function useConsultationTypes() {
  return useQuery({
    queryKey: ["consultations", "types"],
    queryFn: consultationsApi.getTypes,
    select: (res) => res?.data ?? [],
    staleTime: Infinity, // a near-static catalogue, not user data
  });
}

/**
 * GET /consultations/availability — public. Disabled until a type is chosen.
 *
 * `date` is treated by the backend as the *start of a window*, not a single
 * day: observed 2026-08-22, a request for one date returned up to 200 slots
 * spanning ~25 working days (it was one day's slots on 2026-08-12). The
 * pickers here are day-at-a-time, so the slots are narrowed to `date` in
 * `select`. Slot timestamps carry the WAT offset, so the first ten characters
 * are the local calendar date.
 */
export function useConsultationAvailability(typeKey, date) {
  return useQuery({
    queryKey: ["consultations", "availability", typeKey, date ?? "default"],
    queryFn: () => consultationsApi.getAvailability(typeKey, date),
    select: (res) => {
      const data = res?.data;
      if (!data || !date) return data;
      const all = data.slots ?? [];
      return {
        ...data,
        slots: all.filter((s) => s.start?.slice(0, 10) === date),
        // The window's first bookable day — lets a picker skip past today
        // when today has nothing (weekends, the 24h lead time).
        firstAvailableDate: all.find((s) => s.isAvailable)?.start?.slice(0, 10) ?? null,
      };
    },
    enabled: Boolean(typeKey),
    staleTime: 30 * 1000, // slots can be taken by someone else
  });
}

/**
 * POST /consultations. Not gated on `isAuthenticated` — the endpoint itself
 * works anonymously — but this app's booking page only exposes the submit
 * button once signed in (product decision, lib/api/consultations.js).
 */
export function useBookConsultation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => consultationsApi.book(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations", "mine"] });
      // Booking a slot removes it from availability for everyone.
      queryClient.invalidateQueries({ queryKey: ["consultations", "availability"] });
    },
  });
}

/** POST /consultations/{id}/initialize-payment — safe to call more than once; see lib/api/consultations.js. */
export function useInitializeConsultationPayment() {
  return useMutation({
    mutationFn: ({ id, email, token }) => consultationsApi.initializePayment(id, email, token),
  });
}

/** POST /consultations/verify-payment */
export function useVerifyConsultationPayment() {
  return useMutation({
    mutationFn: (reference) => consultationsApi.verifyPayment(reference),
  });
}

/**
 * GET /consultations/{id}. `token` is a guest's management token; a signed-in
 * owner passes none. Not gated on the session on purpose — a guest has no
 * session, and an id without either credential just gets a clean 401.
 */
export function useConsultation(id, token) {
  return useQuery({
    queryKey: ["consultations", "detail", id],
    queryFn: () => consultationsApi.getConsultation(id, token),
    select: (res) => res?.data,
    enabled: Boolean(id),
    retry: (count, err) => err?.status !== 401 && err?.status !== 404 && count < 2,
  });
}

/** GET /consultations/mine */
export function useMyConsultations() {
  const { isAuthenticated } = useSession();
  return useQuery({
    queryKey: ["consultations", "mine"],
    queryFn: consultationsApi.getMyConsultations,
    select: (res) => res?.data ?? [],
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });
}

export function useRescheduleConsultation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, scheduledStart, token }) => consultationsApi.reschedule(id, scheduledStart, token),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["consultations", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["consultations", "detail", id] });
    },
  });
}

export function useCancelConsultation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason, token }) => consultationsApi.cancel(id, reason, token),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["consultations", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["consultations", "detail", id] });
    },
  });
}
