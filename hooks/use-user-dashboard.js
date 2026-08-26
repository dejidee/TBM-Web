// hooks/use-dashboard.js
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { dashboardApi } from "@/lib/api/user-dashboard";
import { useSession } from "@/hooks/use-session";

/**
 * Query key factory — keeps cache keys consistent across the app.
 * Colocated here so every dashboard hook imports from one place.
 */
export const dashboardKeys = {
  all: ["dashboard"],
  recentOrder: () => [...dashboardKeys.all, "recent-order"],
  orders: () => [...dashboardKeys.all, "orders"],
  orderTracking: (id) => [...dashboardKeys.all, "order-tracking", id],
  designs: (filters) => [...dashboardKeys.all, "designs", filters],
  latestDesign: () => [...dashboardKeys.all, "latest-design"],
  consultations: () => [...dashboardKeys.all, "consultations"],
  savedItems: () => [...dashboardKeys.all, "saved-items"],
  profile: () => [...dashboardKeys.all, "profile"],
};

/**
 * Base hook — subscribes to the session cache so the component re-renders
 * as soon as the user data resolves (fixes stuck loading on first navigation).
 */
function useAuthGuard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useSession();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/sign-in");
    }
  }, [isAuthenticated, isLoading, router]);

  return { user, isAuthenticated };
}

/**
 * Unwrap the response envelope.
 *
 * The dashboard API returns `ApiEnvelope<T>` = `{ success, message, data }`,
 * but every widget reads its fields off the root — `order.title`, `design.style`,
 * `consultations.upcoming`. Without this the components received the envelope,
 * so `design.title` was `undefined` while `design` itself stayed truthy and
 * `design.hasDesign !== false` still passed. The card rendered, and rendered
 * blank: no title, a "Style:" with nothing after it, a broken image, and a
 * "Generated" badge with no date. That is what the live dashboard was showing.
 *
 * It keys off the presence of a `data` key rather than its truthiness, because
 * not every endpoint here is enveloped (see the shape table in CLAUDE.md) and
 * because `data` is `null` precisely when there is no order or no design — the
 * shorter `res?.data ?? res` would fall back to the envelope in exactly that
 * case and hand the widget a truthy object again.
 */
const unwrap = (res) =>
  res && typeof res === "object" && "data" in res ? (res.data ?? null) : (res ?? null);

/** Shared options for dashboard queries — tune once, apply everywhere */
const dashboardQueryOptions = {
  staleTime: 5 * 60 * 1000, // 5 min — data considered fresh
  gcTime: 10 * 60 * 1000, // 10 min — keep in cache after unmount
  retry: 1,
  refetchOnWindowFocus: false,
};

const consultationQueryOptions = {
  ...dashboardQueryOptions,
  staleTime: 2 * 60 * 1000, // 2 min — appointments need fresher data
  refetchOnWindowFocus: true, // re-check when user switches tabs
};

// ─── Individual hooks ──────────────────────────────────────────────────────

export function useDashboardUser() {
  return useAuthGuard();
}

export function useRecentOrder() {
  const { isAuthenticated } = useAuthGuard();
  return useQuery({
    queryKey: dashboardKeys.recentOrder(),
    queryFn: dashboardApi.getRecentOrder,
    enabled: isAuthenticated,
    ...dashboardQueryOptions,
    select: unwrap,
  });
}

// `useOrders`/`useOrder` used to live here too — a second, unused fetcher on
// the same `dashboardKeys.orders`/`dashboardKeys.order` keys that
// `hooks/use-user-orders.js` and `hooks/use-order-details.js` already own and
// wire to real pages. Removed rather than fixed: exactly the "one query key,
// one queryFn" trap CLAUDE.md calls out, just not caught here because nothing
// imported these.

export function useLatestDesign() {
  const { isAuthenticated } = useAuthGuard();
  return useQuery({
    queryKey: dashboardKeys.latestDesign(),
    queryFn: dashboardApi.getLatestDesign,
    enabled: isAuthenticated,
    ...dashboardQueryOptions,
    select: unwrap,
  });
}

export function useDesigns(filters = {}) {
  const { isAuthenticated } = useAuthGuard();
  return useQuery({
    queryKey: dashboardKeys.designs(filters),
    queryFn: () => dashboardApi.getDesigns(filters),
    enabled: isAuthenticated,
    ...dashboardQueryOptions,
    placeholderData: (prev) => prev,
  });
}

export function useConsultations() {
  const { isAuthenticated } = useAuthGuard();
  return useQuery({
    queryKey: dashboardKeys.consultations(),
    queryFn: dashboardApi.getConsultations,
    enabled: isAuthenticated,
    ...consultationQueryOptions,
    select: unwrap,
  });
}

export function useSavedItems() {
  const { isAuthenticated } = useAuthGuard();
  return useQuery({
    queryKey: dashboardKeys.savedItems(),
    queryFn: dashboardApi.getSavedItems,
    enabled: isAuthenticated,
    ...dashboardQueryOptions,
    select: unwrap,
  });
}

export function useOrderTracking(orderId) {
  const { isAuthenticated } = useAuthGuard();
  return useQuery({
    queryKey: dashboardKeys.orderTracking(orderId),
    queryFn: () => dashboardApi.getOrderTracking(orderId),
    enabled: isAuthenticated && !!orderId,
    staleTime: 2 * 60 * 1000,
    select: (res) => res?.data ?? res,
  });
}

export function useDashboardProfile() {
  const { isAuthenticated } = useAuthGuard();
  return useQuery({
    queryKey: dashboardKeys.profile(),
    queryFn: dashboardApi.getProfile,
    enabled: isAuthenticated,
    ...dashboardQueryOptions,
  });
}

/**
 * Prefetch all dashboard data at once.
 * Call this in the layout or a parent component for instant child renders.
 *
 * Usage:
 *   const prefetch = usePrefetchDashboard();
 *   useEffect(() => { prefetch(); }, []);
 */
export function usePrefetchDashboard() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthGuard();

  return () => {
    if (!isAuthenticated) return;

    queryClient.prefetchQuery({
      queryKey: dashboardKeys.recentOrder(),
      queryFn: dashboardApi.getRecentOrder,
      ...dashboardQueryOptions,
    });
    queryClient.prefetchQuery({
      queryKey: dashboardKeys.latestDesign(),
      queryFn: dashboardApi.getLatestDesign,
      ...dashboardQueryOptions,
    });
    queryClient.prefetchQuery({
      queryKey: dashboardKeys.consultations(),
      queryFn: dashboardApi.getConsultations,
      ...consultationQueryOptions,
    });
    queryClient.prefetchQuery({
      queryKey: dashboardKeys.savedItems(),
      queryFn: dashboardApi.getSavedItems,
      ...dashboardQueryOptions,
    });
  };
}
