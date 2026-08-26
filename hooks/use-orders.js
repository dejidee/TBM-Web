import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vendorOrdersAPI } from "@/lib/api/vendor/orders";

// Query keys.
//
// Scoped to "vendor". The vendor order page used to declare `["order", id]`
// inline with a mock fetcher, which is the exact key hooks/use-order-details.js
// uses for the *customer* order query with a different fetcher — one key, two
// queryFns, and whichever mounted first won.
export const ORDERS_QUERY_KEYS = {
  all: ["vendor", "orders"],
  list: (filters) => ["vendor", "orders", "list", filters],
  detail: (id) => ["vendor", "orders", "detail", id],
};

// Hook to fetch orders with filters
export function useOrders(filters = {}) {
  const {
    page = 1,
    limit = 10,
    status = "all",
    type = "all",
    dateRange = "last30days",
    search = "",
  } = filters;

  return useQuery({
    queryKey: ORDERS_QUERY_KEYS.list({
      page,
      limit,
      status,
      type,
      dateRange,
      search,
    }),
    queryFn: () =>
      vendorOrdersAPI.getOrders({ page, limit, status, type, dateRange, search }),
    staleTime: 30 * 1000, // 30 seconds
    keepPreviousData: true, // Keep previous page data while fetching new page
  });
}

/**
 * GET /api/v1/vendor/orders/{orderId}
 *
 * Was `ordersAPI.getOrderById` from lib/mock/orders — a fabricated order.
 * The envelope is unwrapped here rather than in the component: most of
 * /api/v1/* answers ApiEnvelope<T>, but not all of it does (see CLAUDE.md),
 * so accept either.
 */
export function useOrder(id) {
  return useQuery({
    queryKey: ORDERS_QUERY_KEYS.detail(id),
    queryFn: () => vendorOrdersAPI.getOrderById(id),
    select: (res) => res?.data ?? res,
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
}

/** POST /api/v1/vendor/orders/{orderId}/notes */
export function useAddOrderNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, note }) => vendorOrdersAPI.addNote(orderId, note),
    onSuccess: (_data, { orderId }) =>
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEYS.detail(orderId) }),
  });
}

// Hook to refresh orders
export function useRefreshOrders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEYS.all });
    },
  });
}

// Hook to create order
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData) => vendorOrdersAPI.createOrder(orderData),
    onSuccess: () => {
      // Invalidate orders list to refetch with new order
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEYS.all });
    },
  });
}

// Hook to export orders
export function useExportOrders() {
  return useMutation({
    mutationFn: (filters) => vendorOrdersAPI.exportOrders(filters),
    onSuccess: (data) => {
      console.log('✅ Orders exported:', data?.filename);
    },
    onError: (error) => {
      console.error('❌ Orders export failed:', error);
    },
  });
}

// Hook to import orders
export function useImportOrders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file) => vendorOrdersAPI.importOrders(file),
    onSuccess: () => {
      console.log('✅ Orders imported successfully');
      // Invalidate orders list to refetch with imported orders
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEYS.all });
    },
    onError: (error) => {
      console.error('❌ Orders import failed:', error);
    },
  });
}
