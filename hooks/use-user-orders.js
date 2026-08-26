// hooks/use-user-orders.js

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/user-dashboard";
import { ordersApi } from "@/lib/api/orders";
import { dashboardKeys } from "@/hooks/use-user-dashboard";

export function useOrders() {
  return useQuery({
    queryKey: dashboardKeys.orders(),
    queryFn: dashboardApi.getOrders,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    select: (res) => {
      if (Array.isArray(res)) return res;
      return res?.data ?? res?.orders ?? res?.items ?? [];
    },
  });
}

/** POST /api/v1/orders — create order directly from cart */
export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => ordersApi.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.orders() });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}
