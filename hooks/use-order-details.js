// hooks/use-order-details.js

import { useQuery, useMutation } from "@tanstack/react-query";
import { ordersApi } from "@/lib/api/orders";

/** GET /api/v1/orders/{orderId} — confirmed live 2026-08-11. Unwraps the envelope; components get the Order directly. */
export function useOrderDetails(orderId) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => ordersApi.getOrderDetails(orderId),
    select: (res) => res?.data,
    enabled: !!orderId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * GET /api/v1/orders/{orderId}/invoice — unverified (not in the confirmed
 * order/checkout set; contract:coverage still lists it UNKNOWN). This used to
 * call `ordersApi.downloadInvoice`, which does not exist on `ordersApi` and
 * would throw the moment a shopper clicked the button. Wired to the real
 * method that does exist; the response shape is still a guess, so this
 * throws a clear error rather than silently opening `undefined`.
 */
export function useDownloadInvoice() {
  return useMutation({
    mutationFn: async (orderId) => {
      const res = await ordersApi.getInvoiceUrl(orderId);
      const url = res?.data?.url ?? res?.url;
      if (!url) throw new Error("Invoice link is not available for this order yet.");
      return { url };
    },
  });
}

/**
 * Copies a tracking number to the clipboard. This is a client-only action —
 * there is no backend endpoint for it, and `ordersApi.copyTrackingNumber`
 * (which the old version of this hook called) never existed, so invoking it
 * threw immediately. `components/shared/orders/shipping-details.jsx` is the
 * only caller.
 */
export function useCopyTracking() {
  return useMutation({
    mutationFn: async (trackingNumber) => {
      if (!trackingNumber) throw new Error("No tracking number to copy.");
      await navigator.clipboard.writeText(String(trackingNumber));
      return trackingNumber;
    },
  });
}
