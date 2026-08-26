/**
 * Vendor Deliveries API
 * Endpoints for vendor delivery management
 */

import apiClient from "@/lib/axios";

export const vendorDeliveriesAPI = {
  // GET /api/v1/vendor/deliveries — query params are `page, pageSize, status`
  // only (docs/api/tbm-backend-api.md). `search` and `dateRange` were sent
  // here but neither exists on this endpoint — silently ignored server-side,
  // so the search box and date filter on this page have never actually
  // filtered anything.
  //
  // `status` is the numeric OrderStatus enum, same as GET /vendor/orders —
  // source real names from GET /lookups/order-statuses (hooks/use-lookups.js)
  // rather than the invented "picked up"/"urgent" labels this used to send.
  getDeliveries: async (params = {}) => {
    const queryParams = {
      page: params.page || 1,
      pageSize: params.limit || 20,
    };

    if (params.status !== undefined && params.status !== "all") {
      queryParams.status = Number(params.status);
    }

    const response = await apiClient.get("/vendor/deliveries", {
      params: queryParams,
    });
    return response.data;
  },

  /**
   * PATCH /api/v1/vendor/deliveries/{orderId} — `Vendor.VendorDeliveryUpdateRequest`.
   * Body is exactly `{ deliveryPartner, trackingNumber }`; both nullable
   * strings, nothing else accepted.
   */
  updateDelivery: async (orderId, { deliveryPartner, trackingNumber }) => {
    const response = await apiClient.patch(`/vendor/deliveries/${orderId}`, {
      deliveryPartner: deliveryPartner ?? null,
      trackingNumber: trackingNumber ?? null,
    });
    return response.data;
  },
};
