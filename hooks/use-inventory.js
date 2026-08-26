import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vendorInventoryAPI } from "@/lib/api/vendor/inventory";
import { showToast } from "@/components/shared/toast";

// Query keys
export const INVENTORY_QUERY_KEYS = {
  stats: ["inventory", "stats"],
  products: (filters) => ["inventory", "products", filters],
};

// Hook to fetch inventory stats
export function useInventoryStats() {
  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.stats,
    queryFn: vendorInventoryAPI.getStats,
    staleTime: 60 * 1000, // 1 minute
  });
}

// Hook to fetch inventory products
export function useInventoryProducts(filters = {}) {
  const {
    page = 1,
    limit = 20,
    search = "",
    lowStockOnly = false,
  } = filters;

  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.products({
      page,
      limit,
      search,
      lowStockOnly,
    }),
    queryFn: () =>
      vendorInventoryAPI.getInventory({
        page,
        limit,
        search,
        lowStockOnly,
      }),
    staleTime: 30 * 1000, // 30 seconds
    keepPreviousData: true,
  });
}

// Hook to add new product
export function useAddProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData) => vendorInventoryAPI.addProduct(productData),
    onSuccess: () => {
      // Invalidate both stats and products queries
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.stats });
      queryClient.invalidateQueries({ queryKey: ["inventory", "products"] });
    },
    onError: (error) => {
      showToast.error(error.message || "Failed to add product");
    },
  });
}

// Hook to update product
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, productData }) =>
      vendorInventoryAPI.updateProduct(productId, productData),
    onSuccess: () => {
      // Invalidate both stats and products queries
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.stats });
      queryClient.invalidateQueries({ queryKey: ["inventory", "products"] });
    },
    onError: (error) => {
      showToast.error(error.message || "Failed to update product");
    },
  });
}

// Hook to update product quantity (convenience wrapper)
export function useUpdateProductQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, quantity }) =>
      vendorInventoryAPI.updateProduct(id, { stockQuantity: quantity }),
    onSuccess: () => {
      // Invalidate both stats and products queries
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.stats });
      queryClient.invalidateQueries({ queryKey: ["inventory", "products"] });
    },
    onError: (error) => {
      showToast.error(error.message || "Failed to update quantity");
    },
  });
}

// Hook to delete product
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId) => vendorInventoryAPI.deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.stats });
      queryClient.invalidateQueries({ queryKey: ["inventory", "products"] });
    },
    onError: (error) => {
      showToast.error(error.message || "Failed to delete product");
    },
  });
}
