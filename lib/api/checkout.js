// lib/api/checkout.js
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

// Normalise the backend checkout response. GET /api/v1/Checkout has no
// envelope (raw *is* the root — `raw?.data` is only a fallback in case that
// ever changes) and its item fields are `{ productId, name, unitPrice,
// quantity, subtotal, image }` — a different shape from an Order's line items
// (`productName`/`productImageUrl`/`subTotal`), so both are tried.
// See lib/api/schemas/checkout.ts / contracts/checkout.json.
function normaliseCheckoutData(raw) {
  const root = raw?.data ?? raw ?? {};
  const rawItems = root.items ?? root.cartItems ?? [];

  const items = rawItems.map((item) => ({
    id: String(item.cartItemId ?? item.id ?? item.itemId ?? crypto.randomUUID()),
    name: item.name ?? item.productName ?? "",
    description: item.shortDescription ?? item.description ?? "",
    image: item.image ?? item.productImageUrl ?? null,
    quantity: item.quantity ?? item.qty ?? 1,
    unit: item.unit ?? null,
    pricePerUnit: item.unitPrice ?? item.price ?? 0,
    // line total — prefer server-computed, fall back to unit × qty
    price:
      item.subtotal ??
      item.lineTotal ??
      item.totalPrice ??
      (item.unitPrice ?? item.price ?? 0) * (item.quantity ?? item.qty ?? 1),
  }));

  const subtotal =
    root.subtotal ?? root.subTotal ?? items.reduce((s, i) => s + i.price, 0);
  const tax = root.tax ?? root.taxAmount ?? 0;
  const shipping = root.shipping ?? root.shippingCost ?? 0;
  const discount = root.discount ?? root.discountAmount ?? 0;
  const total =
    root.total ?? root.grandTotal ?? subtotal + tax + shipping - discount;

  return {
    items,
    subtotal,
    shipping,
    tax,
    discount,
    total,
    savedAddresses: root.savedAddresses ?? root.addresses ?? [],
    defaultAddress: root.defaultAddress ?? null,
  };
}

export const checkoutApi = {
  /**
   * GET /api/v1/checkout — no envelope. Returns items, subtotal, shipping,
   * tax, discount, total, savedAddresses, defaultAddress. Confirmed live
   * 2026-08-11, see contracts/checkout.json / lib/api/schemas/checkout.ts.
   * @param {string} [promoCode] - Optional promo code to pre-apply
   */
  getCheckoutData: async (promoCode) => {
    const query =
      typeof promoCode === "string" && promoCode
        ? `?promoCode=${encodeURIComponent(promoCode)}`
        : "";
    const raw = await proxyFetch(`/checkout${query}`);
    return normaliseCheckoutData(raw);
  },

  /**
   * POST /api/v1/checkout/validate-promo
   * @param {string} code - Promo code to validate
   */
  validatePromoCode: (code) =>
    proxyFetch("/checkout/validate-promo", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),

  /**
   * POST /api/v1/checkout/payment — no envelope. Confirmed live 2026-08-11
   * against Paystack test-mode keys; creates an order as a side effect
   * (`orderId`/`orderNumber` on the response) distinct from `POST /orders`.
   * Returns `authorizationUrl` (Paystack) to redirect to, or `orderId` alone
   * for a non-redirect method. See contracts/checkout.json.
   *
   * @param {object} payload
   * @param {string} [payload.designSessionId]
   * @param {string} [payload.guestEmail]
   * @param {string} [payload.guestPhone]
   * @param {string} [payload.guestSessionId]
   * @param {object} payload.delivery  - { fullName?, phone?, address?, city?, state?, notes?, customerNotes? }
   * @param {object} payload.payment   - { method?: "Paystack"|"BankTransfer", reference?, callbackUrl? } — field is `method`, not `provider`.
   * @param {number} payload.total     - Must match server-side calculated total
   * @param {string} [payload.promoCode]
   * @param {string} [payload.idempotencyKey]
   * @returns {Promise<import("@/lib/api/types").CheckoutPaymentResponse>}
   */
  submitPayment: (payload) =>
    proxyFetch("/checkout/payment", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /**
   * GET /api/v1/checkout/payment/paystack/verify/{ref} — no envelope.
   * `paymentStatus: "Failed"` is the honest response for a reference that was
   * never completed at Paystack, not an error — check `res.success` /
   * `res.paymentStatus`, don't rely on the HTTP status alone.
   * @param {string} reference - Paystack payment reference
   * @returns {Promise<import("@/lib/api/types").CheckoutVerifyResponse>}
   */
  verifyPaystackPayment: (reference) =>
    proxyFetch(`/checkout/payment/paystack/verify/${reference}`),
};
