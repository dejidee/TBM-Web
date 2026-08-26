import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vendorNotificationsAPI } from "@/lib/api/vendor/notifications";
import { showToast } from "@/components/shared/toast";

// Vendor notifications — GET /api/v1/vendor/notifications.
//
// Was lib/mock/notifications.js, which invented both the notifications and the
// TODAY/YESTERDAY grouping and served them through a fake `categoryMap`
// ("Orders (Bogat)", "Enquiries (TBM)"). The real endpoint answers a flat page:
//
//   { items: [], total: 0, page: 1, pageSize: 20 }
//
// so the grouping is a presentation concern and is done here, in `select`,
// rather than in the component.

export const NOTIFICATIONS_QUERY_KEYS = {
  all: ["vendor", "notifications"],
  list: (filters) => ["vendor", "notifications", "list", filters],
};

const startOfDay = (d) => {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy.getTime();
};

/**
 * Bucket by calendar day into the sections the page renders.
 *
 * The item shape is unverified — the dev backend has no notifications, so
 * `items` has always been empty and there is nothing to record. Only the
 * timestamp is read here, from the spellings the rest of the API uses; an item
 * without a recognisable date falls into EARLIER rather than being dropped.
 */
function group(items) {
  const today = startOfDay(new Date());
  const yesterday = today - 86_400_000;

  const buckets = { TODAY: [], YESTERDAY: [], EARLIER: [] };
  for (const item of items) {
    const raw = item?.createdAt ?? item?.timestamp ?? item?.date;
    const day = raw ? startOfDay(new Date(raw)) : NaN;
    if (day === today) buckets.TODAY.push(item);
    else if (day === yesterday) buckets.YESTERDAY.push(item);
    else buckets.EARLIER.push(item);
  }
  return buckets;
}

export function useNotifications(filters = {}) {
  const { unreadOnly = false, page = 1, pageSize = 20 } = filters;

  return useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEYS.list({ unreadOnly, page, pageSize }),
    queryFn: () =>
      vendorNotificationsAPI.getNotifications({ unreadOnly, page, pageSize }),
    select: (res) => {
      const payload = res?.data ?? res ?? {};
      const items = Array.isArray(payload.items) ? payload.items : [];
      return { items, total: payload.total ?? items.length, notifications: group(items) };
    },
    staleTime: 30 * 1000,
  });
}

/** PUT /api/v1/vendor/notifications/mark-all-read */
export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: vendorNotificationsAPI.markAllAsRead,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEYS.all }),
    onError: (error) =>
      showToast.error(error.message || "Failed to mark notifications as read"),
  });
}

/** PATCH /api/v1/vendor/notifications/{notificationId}/read */
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => vendorNotificationsAPI.markAsRead(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEYS.all }),
    onError: (error) =>
      showToast.error(error.message || "Failed to mark notification as read"),
  });
}
