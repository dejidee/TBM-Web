// lib/api/orders.js
// Customer-facing order API — all requests go through the Next.js proxy.

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

export const ordersApi = {
  /**
   * GET /api/v1/orders/my-orders
   * @returns {Promise<import("@/lib/api/types").OrderListResponse>} `data` is a bare `Order[]`, not `data.items`.
   */
  getMyOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return proxyFetch(`/orders/my-orders${query ? `?${query}` : ""}`);
  },

  /**
   * GET /api/v1/orders/{orderId}
   * @returns {Promise<import("@/lib/api/types").OrderResponse>}
   */
  getOrderDetails: (orderId) => proxyFetch(`/orders/${orderId}`),

  /** GET /api/v1/orders/number/{number} — unverified, not in the confirmed set (contract:coverage). */
  getOrderByNumber: (number) => proxyFetch(`/orders/number/${number}`),

  /** GET /api/v1/orders/{orderId}/invoice — unverified, not in the confirmed set (contract:coverage). */
  getInvoiceUrl: (orderId) => proxyFetch(`/orders/${orderId}/invoice`),

  /**
   * POST /api/v1/orders/{orderId}/cancel
   * @param {string} orderId
   * @param {string} [reason]
   */
  cancelOrder: (orderId, reason) =>
    proxyFetch(`/orders/${orderId}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  /**
   * POST /api/v1/orders — creates an order directly from the cart, bypassing
   * payment initiation. Not currently called by any UI (checkout uses
   * `checkoutApi.submitPayment` → POST /checkout/payment instead, which
   * creates its own order). Field names are `Orders.CreateOrderDto` exactly —
   * see docs/api/tbm-backend-api.md. There is no `shippingCountry`,
   * `shippingPostalCode`, `paymentMethod`, or `notes` on this DTO; sending them
   * gets the whole request rejected (`additionalProperties: false`).
   *
   * @param {{
   *   designSessionId?: string, paymentReference?: string,
   *   guestEmail?: string, guestPhone?: string, guestSessionId?: string,
   *   shippingFullName?: string, shippingPhone?: string, shippingAddress?: string,
   *   shippingCity?: string, shippingState?: string, shippingNotes?: string,
   *   customerNotes?: string, promoCode?: string,
   *   shippingCost?: number, tax?: number, discount?: number,
   * }} data
   * @returns {Promise<import("@/lib/api/types").OrderResponse>}
   */
  createOrder: (data) =>
    proxyFetch("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
