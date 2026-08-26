// lib/api/schemas/reviews.ts
//
// SERVER-ONLY. See the header of ./common.ts.
//
// GET /api/v1/products/{productId}/reviews confirmed live 2026-08-13: enveloped,
// `{ items: [], totalCount, page, pageSize, averageRating }`. Every product
// checked so far has zero reviews — `items` has never been observed non-empty,
// so its element shape is genuinely unknown, not modelled as an object. Do not
// invent one; widen this the day a real review is read back.
//
// The create body IS fully specified — `Products.CreateProductReviewDto`
// (docs/api/tbm-backend-api.md): `{ rating, title?, comment? }`. Confirmed
// live that creating one is enforced server-side to verified purchasers only:
// `{"success":false,"message":"Only customers with a paid order for this
// product can leave a review."}`, 400, for an unpurchased product.

import { z } from "zod";
import { envelope } from "./common";

export const productReviewsDataSchema = z.looseObject({
  items: z.array(z.unknown()),
  totalCount: z.number(),
  page: z.number(),
  pageSize: z.number(),
  averageRating: z.number(),
});

/** GET /api/v1/products/{productId}/reviews */
export const productReviewsResponse = envelope(productReviewsDataSchema);
