/**
 * Admin API client for making authenticated requests to admin endpoints
 * Uses axios with Bearer token authentication and HTTP-only cookies
 */

import { adminApiClient as apiClient } from "@/lib/axios";
import { downloadBlob } from "@/lib/download";

/**
 * Admin Dashboard API
 */
export const adminDashboardAPI = {
  // GET /admin/dashboard/stats
  getStats: async () => {
    const response = await apiClient.get("/admin/dashboard/stats");
    return response.data;
  },

  // GET /admin/dashboard/revenue
  getRevenue: async (timeRange = "30d") => {
    const response = await apiClient.get("/admin/dashboard/revenue", {
      params: { timeRange },
    });
    return response.data;
  },

  // GET /admin/dashboard/server-load
  getServerLoad: async () => {
    const response = await apiClient.get("/admin/dashboard/server-load");
    return response.data;
  },

  // GET /admin/dashboard/alerts
  getAlerts: async () => {
    const response = await apiClient.get("/admin/dashboard/alerts");
    return response.data;
  },

  // GET /admin/dashboard/quick-actions
  getQuickActions: async () => {
    const response = await apiClient.get("/admin/dashboard/quick-actions");
    return response.data;
  },

  // POST /admin/dashboard/refresh
  refreshDashboard: async () => {
    const response = await apiClient.post("/admin/dashboard/refresh");
    return response.data;
  },

  // POST /admin/dashboard/export
  exportReport: async () => {
    const response = await apiClient.post(
      "/admin/dashboard/export",
      {},
      { responseType: "blob" },
    );
    const filename = `admin-dashboard-export-${new Date().toISOString().slice(0, 10)}.csv`;
    downloadBlob(response.data, filename, response.headers["content-type"]);
    return { success: true, filename };
  },
};

/**
 * Admin Analytics API
 */
export const adminAnalyticsAPI = {
  // GET /admin/analytics/overview
  getOverview: async () => {
    const response = await apiClient.get("/admin/analytics/overview");
    return response.data;
  },

  // GET /admin/analytics/monthly-revenue
  getMonthlyRevenue: async () => {
    const response = await apiClient.get("/admin/analytics/monthly-revenue");
    return response.data;
  },

  // GET /admin/analytics/payment-distribution
  getPaymentDistribution: async () => {
    const response = await apiClient.get(
      "/admin/analytics/payment-distribution",
    );
    return response.data;
  },
};

/**
 * Admin Orders API
 */
export const adminOrdersAPI = {
  // GET /admin/orders
  getOrders: async (params) => {
    const response = await apiClient.get("/admin/orders", { params });
    return response.data;
  },

  // PATCH /admin/orders/{id}/status
  updateStatus: async (id, status) => {
    const response = await apiClient.patch(`/admin/orders/${id}/status`, {
      status,
    });
    return response.data;
  },

  // PATCH /admin/orders/{id}/cancel
  cancel: async (id, reason) => {
    const response = await apiClient.patch(`/admin/orders/${id}/cancel`, {
      reason,
    });
    return response.data;
  },

  // POST /admin/orders/{id}/refund
  refund: async (id, reason) => {
    const response = await apiClient.post(`/admin/orders/${id}/refund`, {
      reason,
    });
    return response.data;
  },

  // PATCH /admin/orders/{id}/tracking
  updateTracking: async (id, trackingNumber) => {
    const response = await apiClient.patch(`/admin/orders/${id}/tracking`, {
      trackingNumber,
    });
    return response.data;
  },
};

/**
 * Admin Settings API
 */
export const adminSettingsAPI = {
  // GET /admin/settings/payment
  getPaymentSettings: async () => {
    const response = await apiClient.get("/admin/settings/payment");
    return response.data;
  },

  // PUT /admin/settings/payment
  updatePaymentSettings: async (settings) => {
    const response = await apiClient.put("/admin/settings/payment", settings);
    return response.data;
  },

  // PATCH /admin/settings/payment/gateways/{gatewayId}
  togglePaymentGateway: async (gatewayId, enabled) => {
    const response = await apiClient.patch(
      `/admin/settings/payment/gateways/${gatewayId}`,
      { enabled },
    );
    return response.data;
  },

  // GET /admin/settings/ai
  getAISettings: async () => {
    const response = await apiClient.get("/admin/settings/ai");
    return response.data;
  },

  // PUT /admin/settings/ai
  updateAISettings: async (settings) => {
    const response = await apiClient.put("/admin/settings/ai", settings);
    return response.data;
  },

  // PATCH /admin/settings/ai/models/{modelId}
  toggleAIModel: async (modelId, enabled) => {
    const response = await apiClient.patch(
      `/admin/settings/ai/models/${modelId}`,
      { enabled },
    );
    return response.data;
  },

  // GET /admin/settings/general
  getGeneralSettings: async () => {
    const response = await apiClient.get("/admin/settings/general");
    return response.data;
  },

  // PUT /admin/settings/general
  updateGeneralSettings: async (settings) => {
    const response = await apiClient.put("/admin/settings/general", settings);
    return response.data;
  },

  // GET /admin/settings/notifications
  getNotificationSettings: async () => {
    const response = await apiClient.get("/admin/settings/notifications");
    return response.data;
  },

  // PUT /admin/settings/notifications
  updateNotificationSettings: async (settings) => {
    const response = await apiClient.put(
      "/admin/settings/notifications",
      settings,
    );
    return response.data;
  },

  // PUT /admin/settings (general settings update)
  updateSettings: async (settings) => {
    const response = await apiClient.put("/admin/settings", settings);
    return response.data;
  },
};

/**
 * Admin Users API
 */
export const adminUsersAPI = {
  // GET /admin/users
  getUsers: async (params) => {
    const response = await apiClient.get("/admin/users", { params });
    return response.data;
  },

  // POST /admin/users
  createUser: async (userData) => {
    const response = await apiClient.post("/admin/users", userData);
    return response.data;
  },

  // GET /admin/users/{id}
  getUserById: async (id) => {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  },

  // PATCH /admin/users/{id}/status
  updateUserStatus: async (id, isActive) => {
    const response = await apiClient.patch(`/admin/users/${id}/status`, {
      isActive,
    });
    return response.data;
  },

  // PATCH /admin/users/{id}/role
  updateUserRole: async (id, newRole) => {
    const response = await apiClient.patch(`/admin/users/${id}/role`, {
      newRole,
    });
    return response.data;
  },

  // PATCH /admin/users/{id}/suspend
  suspendUser: async (id) => {
    const response = await apiClient.patch(`/admin/users/${id}/suspend`);
    return response.data;
  },

  // PATCH /admin/users/{id}/reactivate
  reactivateUser: async (id) => {
    const response = await apiClient.patch(`/admin/users/${id}/reactivate`);
    return response.data;
  },

  // DELETE /admin/users/{id}
  deleteUser: async (id) => {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  },

  // GET /admin/users/export
  exportUsers: async (params = {}) => {
    const response = await apiClient.get("/admin/users/export", {
      params,
      responseType: "blob",
    });
    const filename = `admin-users-${new Date().toISOString().slice(0, 10)}.csv`;
    downloadBlob(response.data, filename, response.headers["content-type"]);
    return { success: true, filename };
  },
};

/**
 * Admin Financial API
 */
export const adminFinancialAPI = {
  // GET /admin/financial/stats
  getStats: async () => {
    const response = await apiClient.get("/admin/financial/stats");
    return response.data;
  },

  // GET /admin/financial/monthly-revenue
  getMonthlyRevenue: async (months = 12) => {
    const response = await apiClient.get("/admin/financial/monthly-revenue", {
      params: { months },
    });
    return response.data;
  },

  // GET /admin/financial/revenue-by-service
  getRevenueByService: async (dateRange = "12") => {
    const response = await apiClient.get(
      "/admin/financial/revenue-by-service",
      {
        params: { dateRange },
      },
    );
    return response.data;
  },

  // GET /admin/financial/transactions
  getTransactions: async ({
    page = 1,
    limit = 20,
    search = "",
    filter = "",
  } = {}) => {
    const response = await apiClient.get("/admin/financial/transactions", {
      params: { page, limit, search, filter },
    });
    return response.data;
  },

  // GET /admin/financial/export
  exportFinancialReport: async ({ search = "", filter = "" } = {}) => {
    const response = await apiClient.get("/admin/financial/export", {
      params: { search, filter },
      responseType: "blob",
    });
    const filename = `admin-financial-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    downloadBlob(response.data, filename, response.headers["content-type"]);
    return { success: true, filename };
  },
};

/**
 * Admin Products API — the `/admin/AdminProducts` surface.
 *
 * A parallel write surface exists at `/api/v1/Products` (POST, PUT, DELETE) and
 * accepts the same DTOs. This module deliberately targets AdminProducts: it is
 * the admin-scoped surface, and it is the only one with `bulk`.
 *
 * `apiClient` here is `adminApiClient`, whose baseURL is `/api/proxy/admin` —
 * the proxy mount that trusts `adminAuthToken`. An admin write must never
 * authenticate with a shopper's token.
 *
 * Every response shape below was recorded from the live dev backend by
 * `scripts/record-mutations.mjs` and `scripts/explore-image-upload.mjs`; see
 * contracts/admin-products-*.json and admin-product-image.json. The spec
 * declares each as a bare `200: OK`, and the image-upload endpoint is not in the
 * snapshot at all.
 *
 * Images use the multipart `/images/upload` endpoint below. The snapshot's older
 * JSON `AddProductImageDto` (POST {id}/images) is superseded and unused.
 */
export const adminProductsAPI = {
  /**
   * POST /admin/AdminProducts — create a product.
   * Body: CreateProductDto (has brandType + productType, no isActive).
   * Returns: ApiEnvelope<Product>
   */
  createProduct: async (data) => {
    const response = await apiClient.post("/admin/AdminProducts", data);
    return response.data;
  },

  /**
   * PUT /admin/AdminProducts/{id} — update a product.
   * Body: UpdateProductDto (no brandType/productType, adds isActive).
   * Returns: ApiEnvelope<Product>
   */
  updateProduct: async (id, data) => {
    const response = await apiClient.put(`/admin/AdminProducts/${id}`, data);
    return response.data;
  },

  /**
   * DELETE /admin/AdminProducts/{id}
   * Returns: ApiEnvelope<boolean> — `data` is a bare boolean, not a Product.
   */
  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/admin/AdminProducts/${id}`);
    return response.data;
  },

  /**
   * POST /admin/AdminProducts/bulk — create many.
   * Body: CreateProductDto[] — a bare array, no wrapper object.
   * Returns: ApiEnvelope<{ totalSubmitted, created, failed, failures[],
   *          createdProducts[] }>. Created rows are under `data.createdProducts`,
   *          NOT `data[]` like every other create here. Assuming otherwise
   *          orphaned a row the first time the recorder ran.
   */
  bulkCreateProducts: async (products) => {
    const response = await apiClient.post("/admin/AdminProducts/bulk", products);
    return response.data;
  },

  /**
   * POST /admin/adminproducts/{productId}/images/upload — multipart.
   *
   * The file goes in a `file` form field; isPrimary/displayOrder/altText are
   * query params. Returns ApiEnvelope<ProductImageDto>. Not in the OpenAPI
   * snapshot — recorded from the live backend.
   *
   * `Content-Type: undefined` is load-bearing. adminApiClient defaults to
   * `application/json`; sending FormData under that header makes the backend
   * answer **415**. Clearing it lets axios detect the FormData and set
   * `multipart/form-data` with the correct boundary. Verified end-to-end — see
   * scripts/explore-image-upload.mjs.
   *
   * @param {string} productId
   * @param {File|Blob} file
   * @param {import("@/lib/api/types").UploadImageParams} [opts]
   */
  uploadProductImage: async (productId, file, opts = {}) => {
    const params = new URLSearchParams();
    if (opts.isPrimary != null) params.set("isPrimary", String(opts.isPrimary));
    if (opts.displayOrder != null) params.set("displayOrder", String(opts.displayOrder));
    if (opts.altText) params.set("altText", opts.altText);

    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post(
      `/admin/adminproducts/${productId}/images/upload?${params.toString()}`,
      formData,
      { headers: { "Content-Type": undefined } },
    );
    return response.data;
  },

  /** DELETE /admin/AdminProducts/images/{imageId} — remove one image. */
  deleteProductImage: async (imageId) => {
    const response = await apiClient.delete(`/admin/AdminProducts/images/${imageId}`);
    return response.data;
  },

  /** PUT /admin/AdminProducts/{productId}/images/{imageId}/primary — set the cover. */
  setPrimaryImage: async (productId, imageId) => {
    const response = await apiClient.put(
      `/admin/AdminProducts/${productId}/images/${imageId}/primary`,
    );
    return response.data;
  },
};

/**
 * SuperAdmin Categories API
 * Endpoints are at /api/v1/categories (not under /admin), but require SuperAdmin role.
 */
export const adminCategoriesAPI = {
  // POST /categories — create a new category
  createCategory: async (data) => {
    const response = await apiClient.post("/categories", data);
    return response.data;
  },

  // PUT /categories/{id} — update a category
  updateCategory: async (id, data) => {
    const response = await apiClient.put(`/categories/${id}`, data);
    return response.data;
  },

  // DELETE /categories/{id} — delete a category
  deleteCategory: async (id) => {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  },
};

/**
 * Admin AI Usage API
 */
export const adminAIUsageAPI = {
  // GET /admin/ai/usage/monthly-spend — query: months (integer, default 6)
  getMonthlySpend: async (months = 6) => {
    const response = await apiClient.get("/admin/ai/usage/monthly-spend", {
      params: { months },
    });
    return response.data;
  },

  // GET /admin/ai/credits/{userId} — credit balance for a specific user
  getUserCredits: async (userId) => {
    const response = await apiClient.get(`/admin/ai/credits/${userId}`);
    return response.data;
  },

  // POST /admin/ai/credits/adjust — adjust credits for a user
  // body: { userId, amount, reason }
  adjustUserCredits: async (data) => {
    const response = await apiClient.post("/admin/ai/credits/adjust", data);
    return response.data;
  },

  // GET /admin/ai/usage/user/{userId} — per-user usage
  // query: year (integer), month (integer)
  getUserUsage: async (userId, { year, month } = {}) => {
    const response = await apiClient.get(`/admin/ai/usage/user/${userId}`, {
      params: { ...(year != null && { year }), ...(month != null && { month }) },
    });
    return response.data;
  },
};

/**
 * Admin Observability API
 */
export const adminObservabilityAPI = {
  // GET /admin/observability/health
  getHealth: async () => {
    const response = await apiClient.get("/admin/observability/health");
    return response.data;
  },

  // GET /admin/observability/metrics
  getMetrics: async () => {
    const response = await apiClient.get("/admin/observability/metrics");
    return response.data;
  },

  // GET /admin/observability/recent-errors
  getRecentErrors: async () => {
    const response = await apiClient.get("/admin/observability/recent-errors");
    return response.data;
  },
};

/**
 * Admin Vendors API
 */
export const adminVendorsAPI = {
  // GET /admin/vendors
  getVendors: async (params) => {
    const response = await apiClient.get("/admin/vendors", { params });
    return response.data;
  },

  // GET /admin/vendors/{vendorId}
  getVendor: async (vendorId) => {
    const response = await apiClient.get(`/admin/vendors/${vendorId}`);
    return response.data;
  },

  // PUT /admin/vendors/{vendorId}/profile
  updateVendorProfile: async (vendorId, data) => {
    const response = await apiClient.put(`/admin/vendors/${vendorId}/profile`, data);
    return response.data;
  },

  // POST /admin/vendors/{productId}/ownership — assign product to vendor
  assignProductOwnership: async (productId, vendorId) => {
    const response = await apiClient.post(`/admin/vendors/${productId}/ownership`, { vendorId });
    return response.data;
  },

  // DELETE /admin/vendors/{productId}/ownership — remove product from vendor
  removeProductOwnership: async (productId) => {
    const response = await apiClient.delete(`/admin/vendors/${productId}/ownership`);
    return response.data;
  },

  // GET /admin/vendors/{vendorId}/ownership — products owned by vendor
  getVendorOwnership: async (vendorId) => {
    const response = await apiClient.get(`/admin/vendors/${vendorId}/ownership`);
    return response.data;
  },

  // POST /admin/vendors/{orderId}/assignment — assign order to vendor
  assignOrder: async (orderId, vendorId) => {
    const response = await apiClient.post(`/admin/vendors/${orderId}/assignment`, { vendorId });
    return response.data;
  },

  // DELETE /admin/vendors/{orderId}/assignment — remove order-vendor assignment
  removeOrderAssignment: async (orderId) => {
    const response = await apiClient.delete(`/admin/vendors/${orderId}/assignment`);
    return response.data;
  },
};

/**
 * Admin System Logs API
 */
export const adminSystemLogsAPI = {
  // GET /admin/system-logs/stats
  getStats: async (dateRange = "12") => {
    const response = await apiClient.get("/admin/system-logs/stats", {
      params: { dateRange },
    });
    return response.data;
  },

  // GET /admin/system-logs
  getLogs: async ({
    page = 1,
    limit = 20,
    search = "",
    severity = "",
    dateRange = "",
  } = {}) => {
    const response = await apiClient.get("/admin/system-logs", {
      params: { page, limit, search, severity, dateRange },
    });
    return response.data;
  },

  // GET /admin/system-logs/export
  exportLogs: async ({ severity = "", search = "", dateRange = "" } = {}) => {
    const response = await apiClient.get("/admin/system-logs/export", {
      params: { severity, search, dateRange },
      responseType: "blob",
    });
    const filename = `admin-system-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    downloadBlob(response.data, filename, response.headers["content-type"]);
    return { success: true, filename };
  },
};

/**
 * Admin Pricing API
 * Spec: GET /admin/AdminPricing
 *       GET /admin/AdminPricing/{tier}/{cycle}
 *       PUT /admin/AdminPricing/{tier}/{cycle}
 *       POST /admin/AdminPricing/seed
 */
export const adminPricingAPI = {
  // GET /admin/AdminPricing — returns all PricingConfig records
  getAll: async () => {
    const response = await apiClient.get("/admin/AdminPricing");
    return response.data;
  },

  // GET /admin/AdminPricing/{tier}/{cycle}
  getByTierCycle: async (tier, cycle) => {
    const response = await apiClient.get(`/admin/AdminPricing/${tier}/${cycle}`);
    return response.data;
  },

  // PUT /admin/AdminPricing/{tier}/{cycle} — update pricing config for a tier + cycle
  updateTier: async (tier, cycle, data) => {
    const response = await apiClient.put(`/admin/AdminPricing/${tier}/${cycle}`, data);
    return response.data;
  },

  // POST /admin/AdminPricing/seed — seed default pricing
  seed: async () => {
    const response = await apiClient.post("/admin/AdminPricing/seed");
    return response.data;
  },
};

/**
 * Admin Discounts API
 * Spec: GET /admin/AdminDiscounts
 *       POST /admin/AdminDiscounts
 *       GET /admin/AdminDiscounts/{id}
 *       PUT /admin/AdminDiscounts/{id}
 *       DELETE /admin/AdminDiscounts/{id}
 */
export const adminDiscountsAPI = {
  // GET /admin/AdminDiscounts — list all discount campaigns
  getAll: async (params) => {
    const response = await apiClient.get("/admin/AdminDiscounts", { params });
    return response.data;
  },

  // GET /admin/AdminDiscounts/{id}
  getById: async (id) => {
    const response = await apiClient.get(`/admin/AdminDiscounts/${id}`);
    return response.data;
  },

  // POST /admin/AdminDiscounts — create a new discount campaign
  create: async (data) => {
    const response = await apiClient.post("/admin/AdminDiscounts", data);
    return response.data;
  },

  // PUT /admin/AdminDiscounts/{id} — update a discount
  update: async (id, data) => {
    const response = await apiClient.put(`/admin/AdminDiscounts/${id}`, data);
    return response.data;
  },

  // DELETE /admin/AdminDiscounts/{id} — delete a discount
  remove: async (id) => {
    const response = await apiClient.delete(`/admin/AdminDiscounts/${id}`);
    return response.data;
  },
};

/**
 * Admin Portfolio API — the before/after project showcase behind /project.
 *
 * The public `GET /portfolio` has always worked and the site already renders
 * `beforeImages` / `afterImages` (app/(user)/project/[id]/page.jsx). What was
 * missing was any way for an admin to *put* a project there, which is why the
 * showcase looked empty regardless of how many were seeded.
 *
 * Two enum traps, both decoded by probing the live backend rather than guessed:
 *
 *  · PortfolioStatus — 0 Draft, 1 Published, 2 Rejected. The OpenAPI snapshot
 *    declares `enum: [0,1,2]` with no names. The **query** parameter on the
 *    list endpoint binds either form ("Published" or 1); the **JSON body** of
 *    PATCH /status binds only the integer — a string 400s with `$.status`.
 *    Send integers on the body, always.
 *
 *  · PortfolioImageType — "Before", "After", "Reference" (0/1/2). This one is a
 *    query parameter, so the names bind and are used here because they read.
 *
 * Creating a project and attaching its images are separate calls: the image
 * endpoint is keyed by project id, so the project must exist first. See
 * useCreatePortfolioProject in hooks/use-admin-portfolio.js for the sequencing.
 */
export const PORTFOLIO_STATUS = { Draft: 0, Published: 1, Rejected: 2 };

export const adminPortfolioAPI = {
  /**
   * GET /admin/AdminPortfolio
   * @param {{ status?: string|number, page?: number, pageSize?: number }} [params]
   * @returns ApiEnvelope<{ items, totalCount, page, pageSize, totalPages, hasMore }>
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get("/admin/AdminPortfolio", { params });
    return response.data;
  },

  /** GET /admin/AdminPortfolio/{id} */
  getById: async (id) => {
    const response = await apiClient.get(`/admin/AdminPortfolio/${id}`);
    return response.data;
  },

  /**
   * POST /admin/AdminPortfolio — AdminCreatePortfolioProjectDto.
   * Note it carries `vendorName` and `publishImmediately`, which the vendor-facing
   * CreatePortfolioProjectDto does not. Do not copy fields between the two.
   */
  create: async (data) => {
    const response = await apiClient.post("/admin/AdminPortfolio", data);
    return response.data;
  },

  /**
   * POST /admin/AdminPortfolio/{id}/images — multipart, field name `file`.
   *
   * `Content-Type: undefined` is load-bearing: adminApiClient defaults to
   * application/json and the backend answers 415 for FormData sent under it.
   * Clearing the header lets axios set the multipart boundary itself. Same
   * trap as uploadProductImage above.
   *
   * @param {string} id
   * @param {File|Blob} file
   * @param {"Before"|"After"|"Reference"} imageType
   * @param {string} [caption]
   */
  uploadImage: async (id, file, imageType, caption) => {
    const params = new URLSearchParams({ imageType });
    if (caption) params.set("caption", caption);

    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post(
      `/admin/AdminPortfolio/${id}/images?${params.toString()}`,
      formData,
      { headers: { "Content-Type": undefined } },
    );
    return response.data;
  },

  /** POST /admin/AdminPortfolio/{id}/publish — moves a draft to Published. */
  publish: async (id) => {
    const response = await apiClient.post(`/admin/AdminPortfolio/${id}/publish`);
    return response.data;
  },

  /**
   * PATCH /admin/AdminPortfolio/{id}/status — UpdatePortfolioStatusDto.
   * @param {string} id
   * @param {0|1|2} status  Integer only; see the note above.
   * @param {string} [rejectionReason]
   */
  updateStatus: async (id, status, rejectionReason) => {
    const response = await apiClient.patch(
      `/admin/AdminPortfolio/${id}/status`,
      { status, rejectionReason: rejectionReason ?? null },
    );
    return response.data;
  },
};

/**
 * Admin Consultations API — the management side of `app/(user)/consultation`.
 *
 * Built 2026-08-22 against `AdminConsultations` (list, cancel, pricing). All
 * four shapes were recorded live first — contracts/admin-consultation*.json,
 * lib/api/schemas/consultations.ts — coverage 29→33.
 *
 * Two things that are not obvious from the spec:
 *
 *  · This is a different table from `/admin/inspections`. The legacy
 *    `Inspection` surface still exists (and has its own availability blocks,
 *    categories, status transitions, delete) but the app's booking flow
 *    writes to `Consultations`, and a block created under
 *    `/admin/inspections/availability/blocks` does NOT remove a slot from
 *    `/consultations/availability` — confirmed live. That is why there is no
 *    availability manager here: it would be a control that does nothing.
 *    BACKLOG.md carries the ask.
 *  · The pricing rows are shared between both surfaces (same ids), and are
 *    what `GET /consultations/types` reads `fee` from — so an edit here is
 *    live on the public booking page as soon as that query refetches.
 *    `consultationType` on a pricing row is the display *name*, not the
 *    `typeKey`; there is no key to join on.
 */
export const adminConsultationsAPI = {
  /**
   * GET /admin/consultations
   * @param {{ status?: string, fromUtc?: string, toUtc?: string, page?: number, pageSize?: number }} [params]
   * @returns {Promise<import("@/lib/api/types").AdminConsultationListResponse>}
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get("/admin/consultations", { params });
    return response.data;
  },

  /**
   * PUT /admin/consultations/{id}/cancel — `Consultations.CancelConsultationRequestDto`.
   * The refund/policy outcome comes back in `message` (e.g. "Free consultation
   * cancelled."); show it rather than writing our own.
   * @returns {Promise<import("@/lib/api/types").AdminConsultationCancelResponse>}
   */
  cancel: async (id, reason) => {
    const response = await apiClient.put(`/admin/consultations/${id}/cancel`, { reason });
    return response.data;
  },

  /**
   * GET /admin/consultations/pricing — bare array in `data`, one row per type.
   * @returns {Promise<import("@/lib/api/types").AdminConsultationPricingResponse>}
   */
  getPricing: async () => {
    const response = await apiClient.get("/admin/consultations/pricing");
    return response.data;
  },

  /**
   * PUT /admin/consultations/pricing/{id} — `Consultations.UpdateConsultationPricingConfigRequestDto`.
   * A full replace: send every field, not just the one that changed.
   * @param {string} id
   * @param {{ fee: number, currency: string, location: string|null, creditedTowardProject: boolean, isActive: boolean }} body
   * @returns {Promise<import("@/lib/api/types").AdminConsultationPricingItemResponse>}
   */
  updatePricing: async (id, body) => {
    const response = await apiClient.put(`/admin/consultations/pricing/${id}`, body);
    return response.data;
  },
};
