// lib/api/reviews.js
// All requests go through the Next.js proxy (/api/proxy/v1).

import { logApiError, getFriendlyMessage } from "@/lib/errors";

async function proxyFetch(path, options = {}) {
  const res = await fetch(`/api/proxy/v1${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (res.status === 401) throw new Error("Your session has expired. Please sign in again.");
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let json = null;
    try { json = JSON.parse(text); } catch {}
    const backendMessage = json?.message || json?.title || `API error ${res.status}`;
    logApiError(path, res.status, json ?? text);
    throw Object.assign(new Error(getFriendlyMessage(res.status, backendMessage)), { status: res.status, backendMessage });
  }
  const text = await res.text();
  return text ? JSON.parse(text) : { success: true };
}

export const reviewsApi = {
  /**
   * GET /api/v1/products/{productId}/reviews — public, no auth required.
   * @returns {Promise<import("@/lib/api/types").ProductReviewsResponse>}
   */
  getProductReviews: (productId, page) => {
    const query = page ? `?page=${page}` : "";
    return proxyFetch(`/products/${productId}/reviews${query}`);
  },

  /**
   * POST /api/v1/products/{productId}/reviews — `Products.CreateProductReviewDto`.
   * Enforced server-side to verified purchasers: a 400 with message "Only
   * customers with a paid order for this product can leave a review." for
   * anyone else — confirmed live, contracts/product-reviews.json. Surface
   * that message as-is rather than pre-guessing eligibility client-side.
   * @param {string} productId
   * @param {{ rating: number, title?: string, comment?: string }} review
   */
  createProductReview: (productId, review) =>
    proxyFetch(`/products/${productId}/reviews`, {
      method: "POST",
      body: JSON.stringify(review),
    }),
};
