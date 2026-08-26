// lib/api/schemas/checkout.ts
//
// SERVER-ONLY. See the header of ./common.ts.
//
// None of these three operations carry the `{ success, message, data, errors }`
// envelope most of /api/v1 uses — see CLAUDE.md, "Backend response shapes".
// Recorded live 2026-08-11 by scripts/record-checkout-shape.mjs --write, which
// initiates one real (Paystack test-mode) session and cancels the order it
// creates. See contracts/checkout.json.

import { z } from "zod";

/** A cart line as `GET /checkout` shapes it — distinct field names from `orderItemSchema`. */
export const checkoutItemSchema = z.looseObject({
  productId: z.string(),
  name: z.string(),
  unitPrice: z.number(),
  quantity: z.number(),
  subtotal: z.number(),
  // Observed only null. Every /Products image lives elsewhere; don't assume this matches.
  image: z.unknown(),
});

export const checkoutAddressSchema = z.looseObject({
  id: z.string(),
  fullName: z.string(),
  street: z.string(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
  phone: z.string(),
  deliveryNotes: z.string(),
  isDefault: z.boolean(),
});

/**
 * GET /api/v1/Checkout — no envelope.
 *
 * `defaultAddress` was observed non-null (the test account has a saved
 * address); an account with none has not been observed, so this does not
 * model it as nullable. Guard with `savedAddresses.length` before assuming
 * `defaultAddress` is present.
 */
export const checkoutDataResponse = z.looseObject({
  items: z.array(checkoutItemSchema),
  subtotal: z.number(),
  shipping: z.number(),
  tax: z.number(),
  discount: z.number(),
  total: z.number(),
  savedAddresses: z.array(checkoutAddressSchema),
  defaultAddress: checkoutAddressSchema,
});

/**
 * POST /api/v1/Checkout/payment — no envelope. Creates an order as a side
 * effect (`orderId`/`orderNumber`); this is a second order-creation path
 * distinct from `POST /orders` (see lib/api/schemas/orders.ts). `paymentStatus`
 * here is a string ("Pending" observed) — unrelated to the numeric
 * `Order.paymentStatus` enum.
 */
export const checkoutPaymentResponse = z.looseObject({
  success: z.boolean(),
  orderId: z.string(),
  orderNumber: z.string(),
  message: z.string(),
  idempotent: z.boolean(),
  paymentProvider: z.string(),
  paymentReference: z.string(),
  paymentStatus: z.string(),
  authorizationUrl: z.string(),
  accessCode: z.string(),
  publicKey: z.string(),
});

/**
 * GET /api/v1/Checkout/payment/paystack/verify/{reference} — no envelope.
 * Same shape as checkoutPaymentResponse minus `authorizationUrl`/`accessCode`.
 * Observed `paymentStatus: "Failed"` for a reference that was never completed
 * at Paystack — this is the honest unpaid-verification response, not an error.
 */
export const checkoutVerifyResponse = z.looseObject({
  success: z.boolean(),
  orderId: z.string(),
  orderNumber: z.string(),
  message: z.string(),
  idempotent: z.boolean(),
  paymentProvider: z.string(),
  paymentReference: z.string(),
  paymentStatus: z.string(),
  publicKey: z.string(),
});
