// lib/api/designs.js
// All requests go through the Next.js proxy (/api/proxy/v1).

import { logApiError, getFriendlyMessage } from "@/lib/errors";

async function proxyFetch(path, options = {}) {
  const res = await fetch(`/api/proxy/v1${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
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
  const text = await res.text();
  return text ? JSON.parse(text) : { success: true };
}

// ─── Saved Designs ────────────────────────────────────────────────────────────

export const designsApi = {
  /**
   * GET /api/v1/Designs — no envelope: `{ designs, pagination }`.
   *
   * Observed 2026-08-25 (contracts/designs.json): `roomType` (case-insensitive
   * exact match on the backend-derived value, e.g. "living room"), `search`
   * (matches `prompt`), `page`, `limit` and `sortBy=newest|oldest` are all
   * honoured. `pageSize` is silently ignored — the default `limit` is 10, so
   * always send one. `sortBy=favorites|alphabetical` return 200 and do nothing;
   * the hook sorts those client-side.
   *
   * @param {import("@/lib/api/types").DesignListParams} params
   * @returns {Promise<import("@/lib/api/types").DesignListResponse>}
   */
  getDesigns: ({ page, limit, roomType, search, sortBy } = {}) => {
    const params = new URLSearchParams();
    if (page) params.set("page", page);
    if (limit) params.set("limit", limit);
    if (roomType) params.set("roomType", roomType);
    if (search) params.set("search", search);
    if (sortBy) params.set("sortBy", sortBy);
    const query = params.toString();
    return proxyFetch(`/designs${query ? `?${query}` : ""}`);
  },

  /**
   * GET /api/v1/Designs/{id} — no envelope, and not the list row: the image
   * is `outputUrl`, with `width`/`height`/`durationSeconds` alongside.
   * @returns {Promise<import("@/lib/api/types").DesignDetail>}
   */
  getDesignDetails: (designId) => proxyFetch(`/designs/${designId}`),

  /**
   * POST /api/v1/Designs/{id}/favorite — toggles, and answers with the new
   * state: `{ success, isFavorite }`, no envelope.
   * @returns {Promise<import("@/lib/api/types").DesignFavoriteResponse>}
   */
  toggleFavorite: (designId) =>
    proxyFetch(`/designs/${designId}/favorite`, { method: "POST" }),

  /**
   * PATCH /api/v1/designs/{id}/visibility
   * @param {string} designId
   * @param {"public"|"private"} visibility
   */
  setVisibility: (designId, visibility) =>
    proxyFetch(`/designs/${designId}/visibility`, {
      method: "PATCH",
      body: JSON.stringify({ visibility }),
    }),

  /**
   * GET /api/v1/Designs/{id}/download[?quality=] — no envelope:
   * `{ success, downloadUrl }`. The shape is identical with `quality=high`.
   * @param {string} designId
   * @param {string} [quality]
   * @returns {Promise<import("@/lib/api/types").DesignDownloadResponse>}
   */
  downloadDesign: (designId, quality) =>
    proxyFetch(
      `/designs/${designId}/download${quality ? `?quality=${encodeURIComponent(quality)}` : ""}`,
    ),

  /**
   * POST /api/v1/Designs/{id}/share
   * Response shape NOT observed — it is a mutation with a persistent side
   * effect, so it was not recorded. Guard every field you read off it.
   */
  shareDesign: (designId) =>
    proxyFetch(`/designs/${designId}/share`, { method: "POST" }),

  /**
   * DELETE /api/v1/designs/{id}
   */
  deleteDesign: (designId) =>
    proxyFetch(`/designs/${designId}`, { method: "DELETE" }),

  /**
   * GET /api/v1/public/designs — publicly visible AI designs (no auth required)
   * Response shape is logged to console for UI mapping.
   */
  getPublicDesigns: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const r = await fetch(`/api/proxy/v1/public/designs${query ? `?${query}` : ""}`);
    if (!r.ok) throw new Error(`API error ${r.status}`);
    const data = await r.json();
    return data;
  },
};

// ─── Design Sessions ──────────────────────────────────────────────────────────

export const designSessionsApi = {
  /**
   * POST /api/v1/designs/sessions
   * @param {{ projectName, roomType, visionText?, tier, roomDimensions? }} data
   *   tier: Luxury=1 | Economic=2
   */
  createSession: (data) =>
    proxyFetch("/designs/sessions", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * GET /api/v1/designs/sessions
   */
  getSessions: () => proxyFetch("/designs/sessions"),

  /**
   * GET /api/v1/designs/sessions/{sessionId}
   */
  getSession: (sessionId) => proxyFetch(`/designs/sessions/${sessionId}`),

  /**
   * GET /api/v1/designs/sessions/{sessionId}/status
   * Poll until status is "Generated" or "Failed".
   */
  pollStatus: (sessionId) =>
    proxyFetch(`/designs/sessions/${sessionId}/status`),

  /**
   * POST /api/v1/designs/sessions/{sessionId}/upload
   * Multipart/form-data — field name: "image" — max 10 MB — JPEG/PNG/WEBP
   * @param {string} sessionId
   * @param {File} file
   */
  uploadPhoto: async (sessionId, file) => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(
      `/api/proxy/v1/designs/sessions/${sessionId}/upload`,
      {
        method: "POST",
        credentials: "include",
        body: formData, // Browser sets correct multipart Content-Type with boundary
      },
    );
    if (res.status === 401) throw new Error("UNAUTHORIZED");
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      let message = `Upload error ${res.status}`;
      try { message = JSON.parse(text)?.message || message; } catch {}
      throw Object.assign(new Error(message), { status: res.status });
    }
    return res.json();
  },

  /**
   * POST /api/v1/designs/sessions/{sessionId}/generate
   * Triggers AI image generation. Poll pollStatus() to track progress.
   */
  generate: (sessionId) =>
    proxyFetch(`/designs/sessions/${sessionId}/generate`, { method: "POST" }),

  /**
   * POST /api/v1/designs/sessions/{sessionId}/add-to-cart
   * Adds the Bill-of-Materials items from the generated design to the cart.
   */
  addBomToCart: (sessionId) =>
    proxyFetch(`/designs/sessions/${sessionId}/add-to-cart`, {
      method: "POST",
    }),
};
