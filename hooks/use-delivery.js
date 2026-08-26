import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vendorDeliveriesAPI } from "@/lib/api/vendor/deliveries";
import { showToast } from "@/components/shared/toast";

// Query keys
export const DELIVERY_QUERY_KEYS = {
  assignments: (filters) => ["delivery", "assignments", filters],
};

// Hook to fetch delivery assignments
export function useDeliveryAssignments(filters = {}) {
  const { page = 1, limit = 10, status = "all" } = filters;

  return useQuery({
    queryKey: DELIVERY_QUERY_KEYS.assignments({ page, limit, status }),
    queryFn: async () => {
      const response = await vendorDeliveriesAPI.getDeliveries({
        page,
        limit,
        status,
      });

      // GET /vendor/deliveries has no envelope: { items, total, page, pageSize }.
      // This read `response.totalCount`, which doesn't exist on the real
      // response (real field is `total`) — pagination always showed 0 results.
      return {
        assignments: response.items || [],
        pagination: {
          page: response.page ?? page,
          limit: response.pageSize ?? limit,
          total: response.total || 0,
          totalPages: Math.ceil((response.total || 0) / (response.pageSize || limit)),
        },
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    keepPreviousData: true,
  });
}

/**
 * PATCH /api/v1/vendor/deliveries/{orderId} — now real. Was rejecting with a
 * placeholder error because no endpoint existed (BACKLOG.md); it does now,
 * with exactly `{ deliveryPartner, trackingNumber }`.
 */
export function useUpdateDeliveryAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, updates }) =>
      vendorDeliveriesAPI.updateDelivery(orderId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery", "assignments"] });
    },
    onError: (error) => {
      showToast.error(error.message);
    },
  });
}
