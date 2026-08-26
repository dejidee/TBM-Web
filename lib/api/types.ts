// lib/api/types.ts
//
// Types for the .NET backend's responses. Every one is inferred from the Zod
// schema that validates it, so the runtime check and the compile-time type
// cannot drift apart — there is one definition, in lib/api/schemas/.
//
// This module is safe to import from client code **with `import type`**. The
// schema imports below are type-only, so Zod is erased at compile time and
// never reaches the browser bundle. Value-importing lib/api/schemas/* from a
// client component is a lint error.
//
// The shapes were derived by calling the live API, not invented: the backend's
// OpenAPI document declares all 266 operations as a bare `200: OK` with no body
// type. Fields that were null in every observed response are `unknown` on
// purpose. See CLAUDE.md, "Backend response shapes".

import type { z } from "zod";
import type {
  brandTypeSchema,
  categoryListResponse,
  categoryResponse,
  categorySchema,
  flooringResponse,
  materialListResponse,
  materialSummarySchema,
  productArrayResponse,
  productImageSchema,
  productListResponse,
  productResponse,
  productSchema,
  productVariantSchema,
} from "./schemas/catalog";
import type {
  listFiltersSchema,
  listPaginationSchema,
} from "./schemas/common";
import type {
  adminProductBulkResponse,
  adminProductCreateResponse,
  adminProductDeleteResponse,
  adminProductImageUploadResponse,
  adminProductUpdateResponse,
} from "./schemas/admin-products";
import type {
  aiStyleSchema,
  aiStylesResponse,
  renovationEstimateResponse,
  renovationEstimateSummarySchema,
  renovationEstimateListResponse,
} from "./schemas/ai";
import type { createProjectResponse, projectSchema } from "./schemas/projects";
import type {
  productReviewsDataSchema,
  productReviewsResponse,
} from "./schemas/reviews";
import type {
  consultationAvailabilityResponse,
  consultationBookingResponse,
  consultationListResponse,
  consultationPaymentInitResponse,
  consultationResponse,
  consultationSchema,
  consultationSlotSchema,
  consultationTypeSchema,
  consultationTypesResponse,
  consultationVerifyPaymentResponse,
  adminConsultationListResponse,
  adminConsultationCancelResponse,
  consultationPricingConfigSchema,
  adminConsultationPricingResponse,
  adminConsultationPricingItemResponse,
} from "./schemas/consultations";
import type {
  orderItemSchema,
  orderListResponse,
  orderResponse,
  orderSchema,
  vendorOrderListItemSchema,
  vendorOrderListResponse,
} from "./schemas/orders";
import type {
  designDetailSchema,
  designDownloadResponse,
  designFavoriteResponse,
  designListResponse,
  designResponse,
  designSchema,
} from "./schemas/designs";
import type {
  checkoutAddressSchema,
  checkoutDataResponse,
  checkoutItemSchema,
  checkoutPaymentResponse,
  checkoutVerifyResponse,
} from "./schemas/checkout";

// ── Envelopes ────────────────────────────────────────────────────────────────

/** `{ success, message, data, errors }` — the wrapper on most of /api/v1. */
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  errors: unknown;
}

/** Pagination inside the envelope, used by /products and /materials. */
export interface Paged<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ── Domain ───────────────────────────────────────────────────────────────────

/** TBM = 1, Bogat = 2. */
export type BrandType = z.infer<typeof brandTypeSchema>;

/**
 * 1 = PhysicalProduct, 2 = Service.
 *
 * The spec types this as a bare `integer` with no enum; both values were
 * decoded from live data by reading `productTypeName` alongside it. Widen only
 * against real data.
 */
export type ProductType = 1 | 2;

/**
 * `price` is `null` exactly when `showPrice` is `false` (quote-only products,
 * `priceDisplay: "Request Price"`). Narrow on `showPrice` before touching
 * `price`; render `priceDisplay` when in doubt — it is always a string.
 */
export type Product = z.infer<typeof productSchema>;
export type Category = z.infer<typeof categorySchema>;

/** A product image. `Product.images[]` is an array of these. */
export type ProductImage = z.infer<typeof productImageSchema>;
export type ProductVariant = z.infer<typeof productVariantSchema>;

/** /materials/list returns this, not a Product. `price` is nullable with no discriminant. */
export type MaterialSummary = z.infer<typeof materialSummarySchema>;

export type ListPagination = z.infer<typeof listPaginationSchema>;
export type ListFilters = z.infer<typeof listFiltersSchema>;

// ── Whole-response types ─────────────────────────────────────────────────────

export type ProductListResponse = z.infer<typeof productListResponse>;
export type ProductResponse = z.infer<typeof productResponse>;
export type ProductArrayResponse = z.infer<typeof productArrayResponse>;
export type CategoryListResponse = z.infer<typeof categoryListResponse>;
export type CategoryResponse = z.infer<typeof categoryResponse>;

/** /flooring — no envelope. */
export type FlooringResponse = z.infer<typeof flooringResponse>;
/** /materials/list — no envelope, and not Product[]. */
export type MaterialListResponse = z.infer<typeof materialListResponse>;

// AdminProducts. Create/update/bulk all return the same 41-field Product;
// delete returns a bare boolean. Recorded, not assumed — see contracts/.
export type AdminProductCreateResponse = z.infer<typeof adminProductCreateResponse>;
export type AdminProductUpdateResponse = z.infer<typeof adminProductUpdateResponse>;
export type AdminProductDeleteResponse = z.infer<typeof adminProductDeleteResponse>;
export type AdminProductBulkResponse = z.infer<typeof adminProductBulkResponse>;
export type AdminProductImageUploadResponse = z.infer<typeof adminProductImageUploadResponse>;

/** GET /ai/styles — a bare array of { id, name }. */
export type AiStyle = z.infer<typeof aiStyleSchema>;
export type AiStylesResponse = z.infer<typeof aiStylesResponse>;

/**
 * GET /products/{productId}/reviews. `items` is `unknown[]` — every product
 * checked has zero reviews, so the element shape has never been observed.
 * Widen `productReviewsDataSchema` (lib/api/schemas/reviews.ts) once one has.
 */
export type ProductReviewsData = z.infer<typeof productReviewsDataSchema>;
export type ProductReviewsResponse = z.infer<typeof productReviewsResponse>;

/**
 * `status` is a real string the backend names itself — observed:
 * "PendingPayment", "Confirmed", "Cancelled". Render as-is; the full set is
 * unconfirmed, so don't build a switch that assumes only these three.
 */
export type ConsultationType = z.infer<typeof consultationTypeSchema>;
export type ConsultationSlot = z.infer<typeof consultationSlotSchema>;
export type Consultation = z.infer<typeof consultationSchema>;
export type ConsultationTypesResponse = z.infer<typeof consultationTypesResponse>;
export type ConsultationAvailabilityResponse = z.infer<typeof consultationAvailabilityResponse>;
export type ConsultationBookingResponse = z.infer<typeof consultationBookingResponse>;
export type ConsultationResponse = z.infer<typeof consultationResponse>;
/** GET /consultations/mine — `data` is a bare Consultation[], not `data.items`. */
export type ConsultationListResponse = z.infer<typeof consultationListResponse>;
/** POST /consultations/{id}/initialize-payment — enveloped, unlike checkout's equivalent. */
export type ConsultationPaymentInitResponse = z.infer<typeof consultationPaymentInitResponse>;
/** POST /consultations/verify-payment — only the failure shape (400) is confirmed. */
export type ConsultationVerifyPaymentResponse = z.infer<typeof consultationVerifyPaymentResponse>;
/** GET /admin/consultations — `data.{items,page,pageSize,totalCount}`, no totalPages/hasMore. */
export type AdminConsultationListResponse = z.infer<typeof adminConsultationListResponse>;
export type AdminConsultationCancelResponse = z.infer<typeof adminConsultationCancelResponse>;
/** One per-type fee row; `consultationType` is the display name, not the `typeKey`. */
export type ConsultationPricingConfig = z.infer<typeof consultationPricingConfigSchema>;
export type AdminConsultationPricingResponse = z.infer<typeof adminConsultationPricingResponse>;
export type AdminConsultationPricingItemResponse = z.infer<typeof adminConsultationPricingItemResponse>;

/**
 * `status`/`paymentStatus` are unnamed integer enums (0-7 for OrderStatus,
 * per the spec — CLAUDE.md). Read `statusName`/`paymentStatusName` instead of
 * mapping the number yourself.
 */
export type Order = z.infer<typeof orderSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type OrderResponse = z.infer<typeof orderResponse>;
/** GET /orders/my-orders — `data` is a bare Order[], not `data.items`. */
export type OrderListResponse = z.infer<typeof orderListResponse>;

/** A row from GET /vendor/orders (list) — not the same shape as Order. */
export type VendorOrderListItem = z.infer<typeof vendorOrderListItemSchema>;
export type VendorOrderListResponse = z.infer<typeof vendorOrderListResponse>;

/** GET /Checkout — no envelope. */
export type CheckoutItem = z.infer<typeof checkoutItemSchema>;
export type CheckoutAddress = z.infer<typeof checkoutAddressSchema>;
export type CheckoutDataResponse = z.infer<typeof checkoutDataResponse>;
/** POST /Checkout/payment — no envelope; creates an order as a side effect. */
export type CheckoutPaymentResponse = z.infer<typeof checkoutPaymentResponse>;
/** GET /Checkout/payment/paystack/verify/{reference} — no envelope. */
export type CheckoutVerifyResponse = z.infer<typeof checkoutVerifyResponse>;

/**
 * A row from GET /Designs. Heading is `prompt` (there is no name/title);
 * `roomType` is backend-derived lower-case text or null; `outputType` has only
 * been observed as "Image".
 */
export type Design = z.infer<typeof designSchema>;
/** GET /Designs — no envelope: `{ designs, pagination }`. `pageSize` is ignored; send `limit`. */
export type DesignListResponse = z.infer<typeof designListResponse>;
/** GET /Designs/{id} — no envelope, and the image is `outputUrl`, not `url`. */
export type DesignDetail = z.infer<typeof designDetailSchema>;
export type DesignResponse = z.infer<typeof designResponse>;
/** GET /Designs/{id}/download — no envelope. */
export type DesignDownloadResponse = z.infer<typeof designDownloadResponse>;
/** POST /Designs/{id}/favorite — no envelope; `isFavorite` is the state after the toggle. */
export type DesignFavoriteResponse = z.infer<typeof designFavoriteResponse>;

/** Query params for GET /Designs. Only `newest`/`oldest` are honoured for `sortBy`. */
export interface DesignListParams {
  page?: number;
  limit?: number;
  roomType?: string;
  search?: string;
  sortBy?: "newest" | "oldest";
}

/** Query params for the image-upload endpoint. The file goes in the body. */
export interface UploadImageParams {
  isPrimary?: boolean;
  displayOrder?: number;
  altText?: string;
}

// ── Request params ───────────────────────────────────────────────────────────

export interface ProductListParams {
  pageNumber?: number;
  pageSize?: number;
  brandType?: BrandType;
  productType?: number;
  categoryId?: string;
  searchTerm?: string;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  /** Defaults to true when omitted. */
  activeOnly?: boolean;
}

export interface MaterialListParams {
  pageNumber?: number;
  pageSize?: number;
}

// ── AdminProducts request bodies ─────────────────────────────────────────────
//
// Unlike responses, requests *are* specified: these come from
// docs/api/swagger.snapshot.json, not from a recorded response. Do not
// reconstruct them from a neighbouring call site.
//
// The spec declares no `required` list and marks nearly every field
// `nullable: true`. That is missing information, not permission to omit — send
// every field, using null for "no value".

/** `{ key, value }` pairs. Sent as an array, or null. */
export interface SpecificationItem {
  key: string | null;
  value: string | null;
}

/** Fields common to CreateProductDto and UpdateProductDto. */
interface ProductDtoBase {
  name: string | null;
  description: string | null;
  shortDescription: string | null;
  sku: string | null;
  categoryId: string;
  price: number | null;
  compareAtPrice: number | null;
  showPrice: boolean;
  stockQuantity: number | null;
  lowStockThreshold: number | null;
  trackInventory: boolean;
  isFeatured: boolean;
  displayOrder: number;
  metaTitle: string | null;
  metaDescription: string | null;
  tags: string | null;
  aiKeywords: string | null;
  materialType: string | null;
  qualityTier: string | null;
  recommendedFor: string | null;
  specifications: SpecificationItem[] | null;
  keyFeatures: string[] | null;
  whatsIncluded: string[] | null;
  whatsNotIncluded: string[] | null;
  dimensions: string | null;
  warranty: string | null;
  finishType: string | null;
  installationType: string | null;
  material: string | null;
  color: string | null;
}

/**
 * POST /admin/AdminProducts.
 *
 * Carries `brandType` and `productType`; has **no** `isActive`. The sibling
 * UpdateProductDto is the mirror image. They look like typos of each other and
 * are not — sending the wrong one silently drops or ignores fields.
 */
export interface CreateProductDto extends ProductDtoBase {
  brandType: BrandType;
  /** 1 = PhysicalProduct, 2 = Service. Typed `integer` in the spec, no enum. */
  productType: ProductType;
}

/**
 * PUT /admin/AdminProducts/{id}.
 *
 * Carries **neither** `brandType` nor `productType`, and adds `isActive`.
 * A product's brand and type are immutable after creation.
 */
export interface UpdateProductDto extends ProductDtoBase {
  isActive: boolean;
}

/** POST /admin/AdminProducts/bulk — a bare array, no envelope. */
export type BulkCreateProductDto = CreateProductDto[];

/** POST /ai/renovation/estimate — no envelope. Also what GET /ai/renovation/estimates/{id} returns. */
export type RenovationEstimateResponse = z.infer<typeof renovationEstimateResponse>;
/** One row from GET /ai/renovation/estimates — a lighter summary than the full estimate. */
export type RenovationEstimateSummary = z.infer<typeof renovationEstimateSummarySchema>;
/** GET /ai/renovation/estimates — no envelope, no pagination. */
export type RenovationEstimateListResponse = z.infer<typeof renovationEstimateListResponse>;

/** Request body for POST /ai/renovation/estimate. `roomDimensions` duplicates the three `*Meters` fields — the backend rejects unknown keys, so send both. */
export interface CreateRenovationEstimateRequestDto {
  projectId: string | null;
  projectName: string | null;
  roomType: string | null;
  lengthMeters: number;
  widthMeters: number;
  heightMeters: number;
  finishLevel: string | null;
  includeFlooring: boolean;
  includePainting: boolean;
  includeElectrical: boolean;
  includePlumbing: boolean;
  contingencyPercent: number;
  roomDimensions: { length: number; width: number; height: number };
}

/**
 * A project as returned by POST /projects. `designSessionId`/`orderId`/
 * `bomId`/`vendorId` were null on the only project observed — one created
 * directly, not derived from a design session or order.
 */
export type Project = z.infer<typeof projectSchema>;
/** POST /projects — enveloped. */
export type CreateProjectResponse = z.infer<typeof createProjectResponse>;

/** Request body for POST /projects. */
export interface CreateProjectRequestDto {
  name?: string | null;
  description?: string | null;
  roomType?: string | null;
  startDate?: string | null;
  totalBudget?: number | null;
}

/** Error thrown by the api* helpers. `message` is already user-safe. */
export interface ApiError extends Error {
  status: number;
  backendMessage: string;
}
