/**
 * Vendor Orders API
 * Endpoints for vendor order management
 */

import apiClient from "@/lib/axios";

export const vendorOrdersAPI = {
  // POST /api/v1/Orders - Create new order
  createOrder: async (orderData) => {
    const response = await apiClient.post("/vendor/orders", orderData);
    return response.data;
  },

  // GET /api/v1/vendor/orders — query params are `page, pageSize, status,
  // search, fromDate, toDate, assignedOnly, type` (docs/api/tbm-backend-api.md).
  // This sent `PageNumber`/`PageSize`/`SearchTerm`, none of which exist on the
  // endpoint — `search` silently matched nothing.
  //
  // `status` is the numeric OrderStatus enum (0-7); the filter dropdown
  // (app/vendor/dashboard/orders/page.jsx) now sources its options from
  // GET /lookups/order-statuses (hooks/use-lookups.js) instead of guessing
  // labels, so `params.status` arrives here as that same number already —
  // confirmed live that the backend actually filters on it, not just accepts it.
  getOrders: async (params = {}) => {
    const queryParams = {
      page: params.page || 1,
      pageSize: params.limit || 10,
    };

    if (params.status !== undefined && params.status !== "all") {
      queryParams.status = Number(params.status);
    }
    if (params.search) {
      queryParams.search = params.search;
    }

    const response = await apiClient.get("/vendor/orders", { params: queryParams });
    return response.data;
  },

  // GET /api/vendor/orders/:orderId
  getOrderById: async (orderId) => {
    const response = await apiClient.get(`/vendor/orders/${orderId}`);
    return response.data;
  },

  // PATCH /api/vendor/orders/:orderId/status
  updateStatus: async (orderId, status) => {
    const response = await apiClient.patch(`/vendor/orders/${orderId}/status`, { status });
    return response.data;
  },

  // POST /api/v1/vendor/orders/{orderId}/notes — body is VendorOrderNoteRequest
  // { note }. This posted to /status with a bare string, which is the
  // status-update route and a different DTO (VendorOrderStatusUpdateRequest).
  addNote: async (orderId, note) => {
    const response = await apiClient.post(`/vendor/orders/${orderId}/notes`, { note });
    return response.data;
  },

  // PATCH /api/vendor/orders/:orderId/assignment
  updateAssignment: async (orderId, assignment) => {
    const response = await apiClient.patch(`/vendor/orders/${orderId}/assignment`, assignment);
    return response.data;
  },

  // GET /api/v1/vendor/orders/export
  exportOrders: async (params = {}) => {
    const queryParams = {};

    // Add optional filters
    if (params.status !== undefined && params.status !== 'all') {
      queryParams.status = params.status;
    }
    if (params.search) {
      queryParams.search = params.search;
    }
    if (params.fromDate) {
      queryParams.fromDate = params.fromDate;
    }
    if (params.toDate) {
      queryParams.toDate = params.toDate;
    }
    if (params.assignedOnly !== undefined) {
      queryParams.assignedOnly = params.assignedOnly;
    }
    if (params.type) {
      queryParams.type = params.type;
    }

    const response = await apiClient.get("/vendor/orders/export", {
      params: queryParams,
      responseType: 'blob', // Important for file download
    });

    // Create a download link
    const blob = new Blob([response.data], {
      type: response.headers['content-type'] || 'text/csv'
    });
    const url = window.URL.createObjectURL(blob);
    const filename = `vendor-orders-export-${new Date().toISOString().slice(0, 10)}.csv`;

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true, filename };
  },

  // POST /api/v1/vendor/orders/import
  importOrders: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post("/vendor/orders/import", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};
