// hooks/use-reviews.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewsApi } from "@/lib/api/reviews";

/** GET /api/v1/products/{productId}/reviews — public, no session gate needed. */
export function useProductReviews(productId, page) {
  return useQuery({
    queryKey: ["product-reviews", productId, page ?? 1],
    queryFn: () => reviewsApi.getProductReviews(productId, page),
    select: (res) => res?.data,
    enabled: Boolean(productId),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * POST /api/v1/products/{productId}/reviews. The backend enforces "verified
 * purchaser" itself (400 if not) — this doesn't pre-check eligibility, it
 * just surfaces whatever the backend says.
 */
export function useCreateReview(productId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (review) => reviewsApi.createProductReview(productId, review),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-reviews", productId] });
      // averageRating/reviewCount live on the product itself too.
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
    },
  });
}
