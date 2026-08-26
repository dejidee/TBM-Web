"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { subscriptionApi } from "@/lib/api/subscriptions";
import { useCurrentUser } from "@/hooks/use-auth";
import { showToast } from "@/components/shared/toast";

export const subscriptionKeys = {
  all: ["subscription"],
  current: () => [...subscriptionKeys.all, "current"],
};

/** Fetch the authenticated user's current subscription state. */
export function useSubscription() {
  const { data: user } = useCurrentUser();
  return useQuery({
    queryKey: subscriptionKeys.current(),
    queryFn: subscriptionApi.getCurrent,
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
    retry: false,
  });
}

/**
 * Derived helpers — call useSubscription() and use these to avoid
 * spreading tier/status checks across every component.
 */
export function useSubscriptionState() {
  const query = useSubscription();
  const sub = query.data ?? null;

  const tier = sub?.tier ?? null; // "economy" | "premium" | "luxury" | null
  const status = sub?.status ?? null; // "active" | "expired" | "canceled" | "paused" | null

  const isActive = status === "active";
  const isExpired = status === "expired";
  const isCanceled = status === "canceled";
  const isPaused = status === "paused";

  const isEconomy = tier === "economy";
  const isPremium = tier === "premium";
  const isLuxury = tier === "luxury";

  const generationsUsed = sub?.generationsUsed ?? 0;
  const generationsAllowed = sub?.generationsAllowed ?? null; // null = unlimited
  const quotaExhausted =
    isEconomy && isActive && generationsAllowed !== null && generationsUsed >= generationsAllowed;

  // Can the user generate right now?
  const canGenerate =
    isActive &&
    !quotaExhausted &&
    (isLuxury || isPremium || (isEconomy && !quotaExhausted));

  // Show upgrade wall: economy exhausted, or expired, or paused
  const showUpgradeWall = quotaExhausted || isExpired || isPaused;

  // Show package selection: no subscription at all
  const noSubscription = !sub && !query.isLoading;

  return {
    ...query,
    sub,
    tier,
    status,
    isActive,
    isExpired,
    isCanceled,
    isPaused,
    isEconomy,
    isPremium,
    isLuxury,
    generationsUsed,
    generationsAllowed,
    quotaExhausted,
    canGenerate,
    showUpgradeWall,
    noSubscription,
  };
}

/** POST /api/v1/subscription/activate — Economy tier only. */
export function useActivateEconomy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: subscriptionApi.activate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
    },
    onError: (error) =>
      showToast.error(error.message || "Failed to activate plan"),
  });
}

/**
 * POST /api/v1/subscription/subscribe — Premium or Luxury.
 * On success, if backend returns { checkoutUrl }, redirect to payment page.
 */
export function useSubscribePaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: subscriptionApi.subscribe,
    onSuccess: (data) => {
      const redirectUrl = data?.authorizationUrl ?? data?.checkoutUrl;
      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
    },
    onError: (error) =>
      showToast.error(error.message || "Failed to start subscription"),
  });
}

/** POST /api/v1/subscription/cancel */
export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: subscriptionApi.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
    },
    onError: (error) =>
      showToast.error(error.message || "Failed to cancel subscription"),
  });
}

/** POST /api/v1/subscription/renew */
export function useRenewSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: subscriptionApi.renew,
    onSuccess: (data) => {
      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
    },
    onError: (error) =>
      showToast.error(error.message || "Failed to renew subscription"),
  });
}
