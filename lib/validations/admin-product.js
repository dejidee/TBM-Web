// lib/validations/admin-product.js
//
// Two schemas, not one.
//
// `CreateProductDto` carries `brandType` and `productType` and has no
// `isActive`. `UpdateProductDto` carries neither and adds `isActive`: a
// product's brand and type are immutable once created. They look like typos of
// each other and are not. Sharing one schema would silently send fields the
// backend ignores, and omit one it needs.
//
// Field names come from docs/api/swagger.snapshot.json. The spec declares no
// `required` list and marks nearly every field `nullable: true` — that is
// missing information, not permission to omit. We send every field, using null
// for "no value", and require the handful the backend cannot invent.

import * as Yup from "yup";

/** brandType: the spec types this `integer` with no enum. Decoded from live data. */
export const BRAND_TYPES = [
  { value: 1, label: "TBM" },
  { value: 2, label: "Bogat" },
];

/** productType: likewise undeclared. 1 = PhysicalProduct, 2 = Service. */
export const PRODUCT_TYPES = [
  { value: 1, label: "Physical Product" },
  { value: 2, label: "Service" },
];

// The backend's stated image rules. Shared by the edit-page manager and the
// create-page stager so they cannot drift, and enforced client-side so a bad
// file is rejected before it costs an upload round-trip.
export const IMAGE_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
export const IMAGE_ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const IMAGE_ACCEPT_ATTR = "image/jpeg,image/png,image/webp";

/** @returns {string|null} an error message, or null if the file is acceptable. */
export function validateImageFile(file) {
  if (!IMAGE_ACCEPTED_TYPES.includes(file.type)) return "Use JPG, PNG, or WEBP.";
  if (file.size > IMAGE_MAX_BYTES) return "Images must be 10 MB or smaller.";
  return null;
}

const specificationItem = Yup.object({
  key: Yup.string().trim().required("Key is required"),
  value: Yup.string().trim().required("Value is required"),
});

/**
 * Fields shared by create and update.
 *
 * `price` is required only when `showPrice` is true. That mirrors the response
 * contract exactly: `price` is null iff `showPrice` is false (quote-only
 * products render `priceDisplay: "Request Price"`). Letting an admin save a
 * priced product with no price would produce a row the discriminated union in
 * lib/api/schemas/catalog.ts cannot represent.
 */
const baseFields = {
  name: Yup.string().trim().required("Name is required").max(200),
  description: Yup.string().trim().required("Description is required"),
  shortDescription: Yup.string().trim().max(300).nullable(),
  sku: Yup.string().trim().nullable(),
  categoryId: Yup.string().uuid("Pick a category").required("Category is required"),

  showPrice: Yup.boolean().required(),
  price: Yup.number()
    .typeError("Price must be a number")
    .min(0, "Price cannot be negative")
    .nullable()
    .when("showPrice", {
      is: true,
      then: (s) => s.required("Price is required when the price is shown"),
      otherwise: (s) => s.nullable(),
    }),
  compareAtPrice: Yup.number()
    .typeError("Compare-at price must be a number")
    .min(0)
    .nullable()
    .test(
      "above-price",
      "Compare-at price should be higher than the price",
      // Only meaningful when both are set — a strike-through below the real
      // price reads as a price rise.
      (value, ctx) =>
        value == null || ctx.parent.price == null || value > ctx.parent.price,
    ),

  trackInventory: Yup.boolean().required(),
  stockQuantity: Yup.number()
    .typeError("Stock must be a number")
    .integer()
    .min(0)
    .nullable()
    .when("trackInventory", {
      is: true,
      then: (s) => s.required("Stock quantity is required when tracking inventory"),
      otherwise: (s) => s.nullable(),
    }),
  lowStockThreshold: Yup.number().typeError("Must be a number").integer().min(0).nullable(),

  isFeatured: Yup.boolean().required(),
  displayOrder: Yup.number().typeError("Must be a number").integer().min(0).required(),

  metaTitle: Yup.string().trim().max(70).nullable(),
  metaDescription: Yup.string().trim().max(160).nullable(),

  // Free-text, comma-separated on the wire — a string, not an array.
  tags: Yup.string().trim().nullable(),
  aiKeywords: Yup.string().trim().nullable(),

  materialType: Yup.string().trim().nullable(),
  qualityTier: Yup.string().trim().nullable(),
  recommendedFor: Yup.string().trim().nullable(),
  dimensions: Yup.string().trim().nullable(),
  warranty: Yup.string().trim().nullable(),
  finishType: Yup.string().trim().nullable(),
  installationType: Yup.string().trim().nullable(),
  material: Yup.string().trim().nullable(),
  color: Yup.string().trim().nullable(),

  specifications: Yup.array().of(specificationItem).nullable(),
  keyFeatures: Yup.array().of(Yup.string().trim()).nullable(),
  whatsIncluded: Yup.array().of(Yup.string().trim()).nullable(),
  whatsNotIncluded: Yup.array().of(Yup.string().trim()).nullable(),
};

/** POST /admin/AdminProducts — brandType + productType, no isActive. */
export const createProductSchema = Yup.object({
  ...baseFields,
  brandType: Yup.number()
    .oneOf(BRAND_TYPES.map((b) => b.value), "Pick a brand")
    .required("Brand is required"),
  productType: Yup.number()
    .oneOf(PRODUCT_TYPES.map((p) => p.value), "Pick a product type")
    .required("Product type is required"),
});

/** PUT /admin/AdminProducts/{id} — isActive, and no brandType/productType. */
export const updateProductSchema = Yup.object({
  ...baseFields,
  isActive: Yup.boolean().required(),
});

/** Every field the create endpoint accepts, at its "empty" value. */
export const createProductInitialValues = {
  name: "",
  description: "",
  shortDescription: "",
  sku: "",
  brandType: 2,
  productType: 1,
  categoryId: "",
  price: "",
  compareAtPrice: "",
  showPrice: true,
  stockQuantity: 0,
  lowStockThreshold: 0,
  trackInventory: false,
  isFeatured: false,
  displayOrder: 0,
  metaTitle: "",
  metaDescription: "",
  tags: "",
  aiKeywords: "",
  materialType: "",
  qualityTier: "",
  recommendedFor: "",
  specifications: [],
  keyFeatures: [],
  whatsIncluded: [],
  whatsNotIncluded: [],
  dimensions: "",
  warranty: "",
  finishType: "",
  installationType: "",
  material: "",
  color: "",
};

/** "" is how a form says "empty"; the backend wants null. */
const orNull = (v) => (v === "" || v === undefined ? null : v);
const listOrNull = (v) => (Array.isArray(v) && v.length ? v : null);
const numOrNull = (v) => (v === "" || v === null || v === undefined ? null : Number(v));

/**
 * Formik values → CreateProductDto.
 *
 * Every field is sent, because the spec's silence about `required` is missing
 * information rather than permission to omit.
 */
export function toCreateDto(v) {
  return {
    name: orNull(v.name),
    description: orNull(v.description),
    shortDescription: orNull(v.shortDescription),
    sku: orNull(v.sku),
    brandType: Number(v.brandType),
    productType: Number(v.productType),
    categoryId: v.categoryId,
    price: v.showPrice ? numOrNull(v.price) : null,
    compareAtPrice: numOrNull(v.compareAtPrice),
    showPrice: Boolean(v.showPrice),
    stockQuantity: v.trackInventory ? numOrNull(v.stockQuantity) : null,
    lowStockThreshold: numOrNull(v.lowStockThreshold),
    trackInventory: Boolean(v.trackInventory),
    isFeatured: Boolean(v.isFeatured),
    displayOrder: Number(v.displayOrder) || 0,
    metaTitle: orNull(v.metaTitle),
    metaDescription: orNull(v.metaDescription),
    tags: orNull(v.tags),
    aiKeywords: orNull(v.aiKeywords),
    materialType: orNull(v.materialType),
    qualityTier: orNull(v.qualityTier),
    recommendedFor: orNull(v.recommendedFor),
    specifications: listOrNull(v.specifications),
    keyFeatures: listOrNull(v.keyFeatures),
    whatsIncluded: listOrNull(v.whatsIncluded),
    whatsNotIncluded: listOrNull(v.whatsNotIncluded),
    dimensions: orNull(v.dimensions),
    warranty: orNull(v.warranty),
    finishType: orNull(v.finishType),
    installationType: orNull(v.installationType),
    material: orNull(v.material),
    color: orNull(v.color),
  };
}

/**
 * Formik values → UpdateProductDto.
 *
 * Note what is absent: `brandType` and `productType`. The update endpoint does
 * not accept them, and sending them is how a "harmless extra field" becomes a
 * silent no-op that looks like a bug in the UI.
 */
export function toUpdateDto(v) {
  const { brandType, productType, ...rest } = toCreateDto(v);
  return { ...rest, isActive: Boolean(v.isActive) };
}

/** A Product from the API → Formik values for the edit form. */
export function productToFormValues(p) {
  return {
    ...createProductInitialValues,
    name: p.name ?? "",
    description: p.description ?? "",
    shortDescription: p.shortDescription ?? "",
    sku: p.sku ?? "",
    brandType: p.brandType,
    productType: p.productType,
    categoryId: p.categoryId ?? "",
    // `price` is null exactly when showPrice is false — narrow, don't coerce.
    price: p.showPrice && p.price != null ? p.price : "",
    compareAtPrice: p.compareAtPrice ?? "",
    showPrice: Boolean(p.showPrice),
    stockQuantity: p.stockQuantity ?? 0,
    lowStockThreshold: p.lowStockThreshold ?? 0,
    trackInventory: Boolean(p.trackInventory),
    isFeatured: Boolean(p.isFeatured),
    isActive: Boolean(p.isActive),
    displayOrder: p.displayOrder ?? 0,
    // Returned on read since 2026-08-22 (contracts/products.json). Null on
    // every live product because, until now, no form could prefill them.
    metaTitle: p.metaTitle ?? "",
    metaDescription: p.metaDescription ?? "",
    tags: p.tags ?? "",
    aiKeywords: p.aiKeywords ?? "",
    // All four come back on read — verified against 20 live products, 15 of
    // which carry populated whatsIncluded/whatsNotIncluded/specifications.
    // (lib/api/schemas/catalog.ts still types the latter three z.unknown() from
    // an earlier sample where every product read back null; the shapes are
    // string[] and { key, value }[], ready to widen.) Array.isArray keeps the
    // null products at [].
    keyFeatures: Array.isArray(p.keyFeatures) ? p.keyFeatures : [],
    whatsIncluded: Array.isArray(p.whatsIncluded) ? p.whatsIncluded : [],
    whatsNotIncluded: Array.isArray(p.whatsNotIncluded) ? p.whatsNotIncluded : [],
    specifications: Array.isArray(p.specifications) ? p.specifications : [],
    materialType: p.materialType ?? "",
    qualityTier: p.qualityTier ?? "",
    recommendedFor: p.recommendedFor ?? "",
    dimensions: p.dimensions ?? "",
    warranty: p.warranty ?? "",
    finishType: p.finishType ?? "",
    installationType: p.installationType ?? "",
    material: p.material ?? "",
    color: p.color ?? "",
  };
}
