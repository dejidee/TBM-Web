// lib/api/schemas/orders.ts
//
// SERVER-ONLY. See the header of ./common.ts.
//
// POST /api/v1/orders 500'd on a SQL sequence defect until 2026-08-11 (BACKLOG.md
// item 7) — the dev backend held zero orders, so nothing here could be observed
// before that. Every field below was recorded live the day the bug was fixed:
// scripts/record-order-shape.mjs --write (contracts/orders.json) and a manual
// GET /orders/my-orders. `status`/`paymentStatus` are unnamed integer enums
// (CLAUDE.md: "OrderStatus: 0-7" with no names in the spec) — read the sibling
// `statusName`/`paymentStatusName` string instead of guessing a label for the
// number. Fields observed only null are `z.unknown()`, not a guess.

import { z } from "zod";
import { envelope } from "./common";

/** A line item on an order. `productSKU` and `productImageUrl` were null on every observed order. */
export const orderItemSchema = z.looseObject({
  id: z.string(),
  productId: z.string(),
  productName: z.string(),
  productSKU: z.unknown(),
  productImageUrl: z.unknown(),
  quantity: z.number(),
  unitPrice: z.number(),
  subTotal: z.number(),
});

/**
 * The full order, returned identically by `POST /orders` and
 * `GET /orders/{orderId}` (and inside the array from `GET /orders/my-orders`).
 *
 * `paymentMethod`/`paymentMethodName`/`paymentReference` were widened
 * 2026-08-12: null before a payment attempt, then `1`/`"Paystack"`/the
 * idempotency key sent to `POST /checkout/payment` once one has been made
 * (confirmed live — an order created via `POST /orders` directly, bypassing
 * checkout, still shows all three null). `paymentMethod` is a bare integer
 * with only `1` decoded so far; treat other values as unconfirmed.
 *
 * `trackingNumber`, `shippedAt`, `deliveredAt`, `cancelledAt`,
 * `cancellationReason`, `paidAt`, `shippingNotes`, `adminNotes`,
 * `guestEmail`, `guestPhone`, and `designSessionId` are still `z.unknown()`
 * — null on every order observed so far, including paid ones. Widen off real
 * data once a shipped/delivered/refunded order has been seen.
 */
export const orderSchema = z.looseObject({
  id: z.string(),
  orderNumber: z.string(),
  userId: z.string(),
  designSessionId: z.unknown(),
  guestEmail: z.unknown(),
  guestPhone: z.unknown(),
  isGuestOrder: z.boolean(),
  userEmail: z.string(),
  userFullName: z.string(),
  status: z.number(),
  statusName: z.string(),
  paymentStatus: z.number(),
  paymentStatusName: z.string(),
  paymentMethod: z.number().nullable(),
  paymentMethodName: z.string().nullable(),
  subTotal: z.number(),
  shippingCost: z.number(),
  tax: z.number(),
  discount: z.number(),
  total: z.number(),
  shippingFullName: z.string(),
  shippingPhone: z.string(),
  shippingAddress: z.string(),
  shippingCity: z.string(),
  shippingState: z.string(),
  shippingNotes: z.unknown(),
  paymentReference: z.string().nullable(),
  paidAt: z.unknown(),
  trackingNumber: z.unknown(),
  shippedAt: z.unknown(),
  deliveredAt: z.unknown(),
  cancelledAt: z.unknown(),
  cancellationReason: z.unknown(),
  customerNotes: z.string(),
  adminNotes: z.unknown(),
  items: z.array(orderItemSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** GET /api/v1/orders/{orderId}, and the envelope POST /api/v1/orders returns. */
export const orderResponse = envelope(orderSchema);

/** GET /api/v1/orders/my-orders — `data` is a bare array, NOT `data.items`. */
export const orderListResponse = envelope(z.array(orderSchema));

/**
 * A row from `GET /api/v1/vendor/orders` (list). Distinct from `orderSchema`:
 * no line items, a denormalised `customerName`/`type`, and delivery-agent
 * fields the customer-facing Order never carries. The single-order detail
 * shape (`GET /vendor/orders/{orderId}`) has only been observed as a 403
 * scope-error body (`{ error: string }`) — the test order wasn't owned by the
 * authenticated vendor — so it is not modelled here. Do not assume it matches
 * either this row or `orderSchema` until a success response has been seen.
 */
export const vendorOrderListItemSchema = z.looseObject({
  id: z.string(),
  orderNumber: z.string(),
  customerName: z.string(),
  type: z.string(),
  status: z.number(),
  paymentStatus: z.number(),
  total: z.number(),
  createdAt: z.string(),
  matchingItems: z.number(),
  deliveryAgentName: z.unknown(),
  deliveryAgentPhone: z.unknown(),
});

/** GET /api/v1/vendor/orders — no envelope. */
export const vendorOrderListResponse = z.looseObject({
  items: z.array(vendorOrderListItemSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});
