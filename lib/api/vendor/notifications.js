/**
 * Vendor Notifications API
 * Endpoints for vendor notifications
 */

import apiClient from "@/lib/axios";

export const vendorNotificationsAPI = {
  // GET /api/vendor/notifications
  getNotifications: async (params = {}) => {
    const response = await apiClient.get("/vendor/notifications", { params });
    return response.data;
  },

  // PATCH /api/v1/vendor/notifications/{notificationId}/read
  markAsRead: async (notificationId) => {
    const response = await apiClient.patch(`/vendor/notifications/${notificationId}/read`);
    return response.data;
  },

  // PUT /api/v1/vendor/notifications/mark-all-read — the endpoint exists in the
  // spec but was missing here, so "mark all read" had nothing real to call.
  markAllAsRead: async () => {
    const response = await apiClient.put("/vendor/notifications/mark-all-read");
    return response.data;
  },
};
