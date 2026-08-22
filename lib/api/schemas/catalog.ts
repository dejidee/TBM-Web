// lib/api/schemas/catalog.ts
//
// SERVER-ONLY. See the header of ./common.ts.
//
// Every field below was observed against the live API. Fields that were null in
// every sampled response are `z.unknown()` on purpose — guessing `z.array(z.string())`
// there would invent a contract and then alarm on the truth.

import { z } from "zod";
import {
  envelope,
  listFiltersSchema,
  listPaginationSchema,
  paged,
} from "./common";

/** Integer on the wire: TBM = 1, Bogat = 2. A third value should raise drift. */
export const brandTypeSchema = z.union([z.literal(1), z.literal(2)]);

/**
 * A product image. Returned by the upload endpoint and embedded in
 * `Product.images[]`. Recorded from the live backend (the /upload endpoint
 * post-dates the OpenAPI snapshot) — see contracts/admin-product-image.json.
 *
 * `viewType` was null in every observed image; `z.unknown()` rather than a
 * guess. The backend example shows it as a string field, so widen when a
 * non-null value appears.
 */
export const productImageSchema = z.looseObject({
  id: z.string(),
  productId: z.string(),
  imageUrl: z.string(),
  altText: z.string().nullable(),
  viewType: z.unknown(),
  displayOrder: z.number(),
  isPrimary: z.boolean(),
});

/**
 * A size configuration of a product (600/800/1000/1200 mm for the Bogat
 * vanities), each with its own price and stock. Verified across 120 seeded
 * products: every field is non-null. `size` is a bare string like "600mm"
 * (no space) — the label the UI renders, not an enum.
 *
 * Note the fields the mock invented and the backend does *not* send:
 * no `name`, `label`, `sku`, `image`, `dimensions`, or `priceDisplay`.
 * Render `size` for the label and format `price` for the amount.
 */
export const productVariantSchema = z.looseObject({
  id: z.string(),
  size: z.string(),
  price: z.number(),
  stockQuantity: z.number(),
  isActive: z.boolean(),
  displayOrder: z.number(),
});

/** Fields common to both pricing branches. Spread into each, so the union discriminates cleanly. */
const productFields = {
  id: z.string(),
  name: z.string(),
  description: z.string(),
  shortDescription: z.string(),
  slug: z.string(),
  /** Null on 2 of 15 live products — the backend does not require it. */
  sku: z.string().nullable(),

  brandType: brandTypeSchema,
  brandName: z.string(),
  productType: z.number(),
  productTypeName: z.string(),

  categoryId: z.string(),
  categoryName: z.string(),

  /** Null when trackInventory is false; `inStock` is the field to read. */
  stockQuantity: z.number().nullable(),
  inStock: z.boolean(),
  trackInventory: z.boolean(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),

  /** Rendered straight into <Image src>. */
  // Was z.array(z.string()) — a guess that never fired because every observed
  // product had images: []. The upload endpoint proved the element is a
  // ProductImageDto object, not a URL string. Corrected against real data.
  images: z.array(productImageSchema),
  primaryImageUrl: z.string().nullable(),
  /** Always empty in every sampled response, and never read. Don't recurse into Product. */
  similarProducts: z.array(z.unknown()),

  createdAt: z.string(),
  updatedAt: z.string(),

  /** The product's own size label (e.g. "600mm"); null on products without one. */
  size: z.string().nullable(),
  /** Non-null across all 136 live products. Controls gallery/listing order. */
  displayOrder: z.number(),
  lowStockThreshold: z.number(),
  /** Size configurations. Empty array on products that have none, never null. */
  variants: z.array(productVariantSchema),

  /** A comma-separated string, not an array. Null on most products. */
  tags: z.string().nullable(),

  // Write-only until 2026-08-22; now returned on every read. Null on all 136
  // live products (nothing could prefill them before) — widen to
  // z.string().nullable() once a non-null value has been observed.
  metaTitle: z.unknown(),
  metaDescription: z.unknown(),
  metaKeywords: z.unknown(),

  // Added 2026-08-12 once the reviews API shipped (BACKLOG.md). 0/0 on every
  // product checked so far — no product has a review yet — but the fields
  // themselves are non-null, unlike the block below.
  averageRating: z.number(),
  reviewCount: z.number(),

  // Widened from z.unknown() once the seeded Bogat catalogue populated it:
  // 120/120 products carry a string[] of feature bullets; null on the rest.
  keyFeatures: z.array(z.string()).nullable(),

  // Never observed non-null across live products. Typed `unknown` on purpose:
  // guessing `string[]` would invent a contract and then alarm on the truth.
  // Widen each when real data appears (whatsIncluded is next — see notes below).
  aiKeywords: z.unknown(),
  materialType: z.unknown(),
  qualityTier: z.unknown(),
  recommendedFor: z.unknown(),
  specifications: z.unknown(),
  whatsIncluded: z.unknown(),
  whatsNotIncluded: z.unknown(),
  dimensions: z.unknown(),
  warranty: z.unknown(),
  finishType: z.unknown(),
  installationType: z.unknown(),
  material: z.unknown(),
  color: z.unknown(),
};

/**
 * Pricing is a discriminated union: `price` is null exactly when
 * `showPrice` is false (quote-only products, `priceDisplay: "Request Price"`).
 * Verified across every product we could fetch. The type makes `.price`
 * unreachable until you narrow on `.showPrice`.
 */
export const productSchema = z.discriminatedUnion("showPrice", [
  z.looseObject({
    ...productFields,
    showPrice: z.literal(true),
    price: z.number(),
    priceDisplay: z.string(),
    compareAtPrice: z.number().nullable(),
  }),
  z.looseObject({
    ...productFields,
    showPrice: z.literal(false),
    price: z.null(),
    priceDisplay: z.string(),
    compareAtPrice: z.number().nullable(),
  }),
]);

export const categorySchema = z.looseObject({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  slug: z.string(),
  brandType: brandTypeSchema,
  brandName: z.string(),
  parentCategoryId: z.string().nullable(),
  parentCategoryName: z.string().nullable(),
  imageUrl: z.string().nullable(),
  displayOrder: z.number(),
  isActive: z.boolean(),
  /** Always empty, never read. Not recursed, to keep the schema non-lazy. */
  subCategories: z.array(z.unknown()),
  productCount: z.number(),
});

/**
 * /materials/list returns a flattened projection, NOT a Product: different field
 * names, and `price` is nullable with no `showPrice` to discriminate on.
 */
export const materialSummarySchema = z.looseObject({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  price: z.number().nullable(),
  image: z.string().nullable(),
  /** A category name, not an id. */
  category: z.string(),
  inStock: z.boolean(),
  similarProducts: z.array(z.unknown()),
});

/**
 * GET /Cart/related returns a **bare array with no envelope**, and its items are
 * neither Product nor MaterialSummary — a fourth response shape. Observed via
 * `npm run contract:record`; see contracts/cart-related.json.
 */
export const cartRelatedItemSchema = z.looseObject({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  /** Null on every observed item. Not `z.string().nullable()` — we have never seen one. */
  image: z.unknown(),
  /** 4.5 on every observed item, which smells hardcoded upstream. */
  rating: z.number(),
});

// ── Full response schemas, keyed to the endpoint that returns them ───────────

export const productListResponse = envelope(paged(productSchema));
export const productResponse = envelope(productSchema);
export const productArrayResponse = envelope(z.array(productSchema));
export const categoryListResponse = envelope(z.array(categorySchema));
export const categoryResponse = envelope(categorySchema);

/** /flooring — no envelope, full Products. */
export const flooringResponse = z.looseObject({
  products: z.array(productSchema),
  pagination: listPaginationSchema,
  filters: listFiltersSchema,
});

/** /materials/list — no envelope, and not Product[]. */
export const materialListResponse = z.looseObject({
  materials: z.array(materialSummarySchema),
  pagination: listPaginationSchema,
  filters: listFiltersSchema,
});

/** /Cart/related — a bare array. No envelope, no pagination, no wrapper object. */
export const cartRelatedResponse = z.array(cartRelatedItemSchema);
