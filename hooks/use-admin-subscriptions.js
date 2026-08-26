import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminPricingAPI, adminDiscountsAPI } from "@/lib/api/admin";
import { showToast } from "@/components/shared/toast";

export const SUBSCRIPTION_QUERY_KEYS = {
  pricing: ["admin", "pricing"],
  discounts: (params) => ["admin", "discounts", params],
};

// ─── Pricing Hooks ─────────────────────────────────────────────────────────────

export function useAdminPricing() {
  return useQuery({
    queryKey: SUBSCRIPTION_QUERY_KEYS.pricing,
    queryFn: adminPricingAPI.getAll,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateAdminPricing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tier, cycle, data }) => adminPricingAPI.updateTier(tier, cycle, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEYS.pricing });
    },
    onError: (error) => showToast.error(error.message || "Failed to save pricing"),
  });
}

// ─── Discount Hooks ────────────────────────────────────────────────────────────

export function useAdminDiscounts(params) {
  return useQuery({
    queryKey: SUBSCRIPTION_QUERY_KEYS.discounts(params),
    queryFn: () => adminDiscountsAPI.getAll(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateAdminDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminDiscountsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "discounts"] });
    },
    onError: (error) =>
      showToast.error(error.message || "Failed to create discount"),
  });
}

export function useUpdateAdminDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => adminDiscountsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "discounts"] });
    },
    onError: (error) =>
      showToast.error(error.message || "Failed to update discount"),
  });
}

export function useDeleteAdminDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminDiscountsAPI.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "discounts"] });
      showToast.success("Discount deactivated");
    },
    onError: (error) =>
      showToast.error(error.message || "Failed to deactivate discount"),
  });
}
