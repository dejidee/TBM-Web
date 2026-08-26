// hooks/use-checkout.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { checkoutApi } from "@/lib/api/checkout";
import { usePersistedState, CHECKOUT_KEYS } from "@/hooks/use-persisted-state";

export function useCheckoutData() {
  return useQuery({
    queryKey: ["checkout"],
    queryFn: () => checkoutApi.getCheckoutData(),
    staleTime: 30 * 1000, // 30 seconds
    retry: 1, // Only retry once if cart is empty
  });
}

export function useSubmitPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkoutApi.submitPayment,
    onSuccess: () => {
      // v5 takes a filters object, not a bare key array — the old calls here
      // matched every query (filters.queryKey was undefined) rather than
      // scoping to cart/checkout.
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["checkout"] });
    },
  });
}

export function useValidatePromoCode() {
  return useMutation({
    mutationFn: checkoutApi.validatePromoCode,
  });
}

/**
 * Resume payment on an existing `Pending` order — for a shopper who paid,
 * lost the tab before /checkout/verify could confirm it, and is finding the
 * order again later from /dashboard/orders, possibly on a different device.
 *
 * Reuses the order's own `paymentReference` as the idempotency key. The
 * backend recognises it and returns the *same* Paystack session it created
 * the first time — confirmed live: identical `authorizationUrl`,
 * `idempotent: true` — so this works from anywhere, without needing the
 * original checkout's local `attempt` state (see use-persisted-state.js) to
 * have survived. It reconstructs that `attempt` on success so the usual
 * verify/retry machinery takes over from here.
 *
 * Only meaningful while `paymentStatusName` is `"Pending"`. A `"Failed"`
 * order's Paystack session is permanently dead — reusing its reference
 * returns that same dead session, not a fresh one (also confirmed live).
 * That case needs a brand new checkout, not a resume.
 */
export function useResumePayment() {
  const [, setAttempt] = usePersistedState(CHECKOUT_KEYS.attempt, null, {
    storage: "local",
  });

  return useMutation({
    mutationFn: async (order) => {
      const data = await checkoutApi.submitPayment({
        delivery: {
          fullName: order.shippingFullName ?? null,
          phone: order.shippingPhone ?? null,
          address: order.shippingAddress ?? null,
          city: order.shippingCity ?? null,
          state: order.shippingState ?? null,
        },
        payment: {
          method: (typeof order.paymentMethodName === "string" && order.paymentMethodName) || "Paystack",
          reference: null,
          callbackUrl: `${window.location.origin}/checkout/verify`,
        },
        total: order.total,
        idempotencyKey: order.paymentReference,
      });
      setAttempt({
        idempotencyKey: order.paymentReference,
        orderId: data?.orderId,
        orderNumber: data?.orderNumber,
        reference: data?.paymentReference,
        createdAt: Date.now(),
      });
      return data;
    },
  });
}
