// lib/api/user-dashboard.js
// All requests go through the local Next.js proxy (/api/proxy/v1)
// so the real backend URL is never exposed to the browser.

import { logApiError, getFriendlyMessage } from "@/lib/errors";

async function proxyFetch(path) {
  const res = await fetch(`/api/proxy/v1${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (res.status === 401) throw new Error("Your session has expired. Please sign in again.");
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let json = null;
    try { json = JSON.parse(text); } catch {}
    const backendMessage = json?.message || json?.title || `API error ${res.status}`;
    logApiError(path, res.status, json ?? text);
    throw Object.assign(new Error(getFriendlyMessage(res.status, backendMessage)), { status: res.status, backendMessage });
  }
  return res.json();
}

export const dashboardApi = {
  /** GET /api/v1/dashboard/recent-order */
  getRecentOrder: () => proxyFetch("/dashboard/recent-order"),

  /** GET /api/v1/orders/my-orders */
  getOrders: () => fetch("/api/orders/my-orders", { credentials: "include" }).then((r) => r.json()),

  /** GET /api/v1/orders/{orderId} */
  getOrder: (id) => proxyFetch(`/orders/${id}`),

  /** GET /api/v1/dashboard/latest-design */
  getLatestDesign: () => proxyFetch("/dashboard/latest-design"),

  /** GET /api/v1/designs (paginated) */
  getDesigns: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return proxyFetch(`/designs${query ? `?${query}` : ""}`);
  },

  /** GET /api/v1/dashboard/consultations */
  getConsultations: () => proxyFetch("/dashboard/consultations"),

  /** GET /api/v1/dashboard/saved-items */
  getSavedItems: () => proxyFetch("/dashboard/saved-items"),

  /** GET /api/v1/account/me — uses the local Next.js route (reads httpOnly cookie) */
  getProfile: () => fetch("/api/account/me", { credentials: "include" }).then((r) => r.json()),

  /** GET /api/v1/dashboard/orders/{orderId}/tracking */
  getOrderTracking: (orderId) => proxyFetch(`/dashboard/orders/${orderId}/tracking`),
};
