// hooks/use-designs.js
"use client";

import {
  keepPreviousData,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { designsApi, designSessionsApi } from "@/lib/api/designs";
import { useSession } from "@/hooks/use-session";
import { showToast } from "@/components/shared/toast";

// ─── Saved Designs ────────────────────────────────────────────────────────────

/** Sorts the backend accepts and actually applies. Anything else is ignored. */
const SERVER_SORTS = new Set(["newest", "oldest"]);

/**
 * GET /Designs, one query per filter combination. Filtering and pagination are
 * server-side — the default page is 10 rows, so filtering in the browser used
 * to search only the first ten designs and call that the gallery.
 *
 * `sortBy: "favorites" | "alphabetical"` are sorted here, within the page the
 * server returned: the backend accepts both and ignores them (verified by
 * toggling a favourite and re-fetching, 2026-08-25).
 *
 * Resolves to `{ designs, pagination }` — see `DesignListResponse`.
 */
export function useDesigns(filters = {}) {
  const { isAuthenticated } = useSession();
  const { page = 1, limit, search, roomType, sortBy = "newest" } = filters;

  const params = {
    page,
    limit,
    search: search || undefined,
    roomType: roomType && roomType !== "all" ? roomType : undefined,
    sortBy: SERVER_SORTS.has(sortBy) ? sortBy : "newest",
  };

  return useQuery({
    queryKey: ["designs", { ...params, clientSort: SERVER_SORTS.has(sortBy) ? undefined : sortBy }],
    queryFn: () => designsApi.getDesigns(params),
    enabled: isAuthenticated,
    staleTime: 3 * 60 * 1000,
    refetchOnWindowFocus: false,
    // Keep the previous page on screen while the next one loads — a page flip
    // should not flash the skeleton.
    placeholderData: keepPreviousData,
    select: (res) => {
      let designs = Array.isArray(res?.designs) ? res.designs : [];
      if (sortBy === "favorites") {
        designs = [...designs].sort(
          (a, b) => Number(b.isFavorite) - Number(a.isFavorite),
        );
      } else if (sortBy === "alphabetical") {
        designs = [...designs].sort((a, b) =>
          a.prompt.localeCompare(b.prompt, undefined, { sensitivity: "base" }),
        );
      }
      return { designs, pagination: res?.pagination ?? null };
    },
  });
}

/** GET /Designs/{id} — no envelope; the image is `outputUrl` here, not `url`. */
export function useDesignDetails(designId) {
  const { isAuthenticated } = useSession();
  return useQuery({
    queryKey: ["design", designId],
    queryFn: () => designsApi.getDesignDetails(designId),
    enabled: isAuthenticated && !!designId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (designId) => designsApi.toggleFavorite(designId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designs"] });
    },
    onError: (error) =>
      showToast.error(error.message || "Failed to update favorite"),
  });
}

export function useDeleteDesign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (designId) => designsApi.deleteDesign(designId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designs"] });
    },
    onError: (error) =>
      showToast.error(error.message || "Failed to delete design"),
  });
}

/**
 * Resolves to `{ success, downloadUrl }`. The caller opens the URL — the
 * mutation only mints it. `quality` is optional; the backend answers the same
 * shape with or without it.
 */
export function useDownloadDesign() {
  return useMutation({
    mutationFn: ({ designId, quality }) =>
      designsApi.downloadDesign(designId, quality),
    onError: (error) =>
      showToast.error(error.message || "Failed to download design"),
  });
}

export function useShareDesign() {
  return useMutation({
    mutationFn: (designId) => designsApi.shareDesign(designId),
    onError: (error) =>
      showToast.error(error.message || "Failed to share design"),
  });
}

// ─── Design Sessions ──────────────────────────────────────────────────────────

export function useDesignSessions() {
  return useQuery({
    queryKey: ["design-sessions"],
    queryFn: designSessionsApi.getSessions,
    staleTime: 2 * 60 * 1000,
    select: (res) => res?.data ?? res,
  });
}

export function useDesignSession(sessionId) {
  return useQuery({
    queryKey: ["design-session", sessionId],
    queryFn: () => designSessionsApi.getSession(sessionId),
    enabled: !!sessionId,
    select: (res) => res?.data ?? res,
  });
}

export function useDesignSessionStatus(sessionId, { enabled = true } = {}) {
  return useQuery({
    queryKey: ["design-session-status", sessionId],
    queryFn: () => designSessionsApi.pollStatus(sessionId),
    enabled: !!sessionId && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status ?? query.state.data?.status;
      // Stop polling when generation is complete or failed
      if (status === "Generated" || status === "Failed" || status === "Ordered")
        return false;
      return 3000; // Poll every 3s while processing
    },
    select: (res) => res?.data ?? res,
  });
}

export function useCreateDesignSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => designSessionsApi.createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["design-sessions"] });
    },
    onError: (error) =>
      showToast.error(error.message || "Failed to start design session"),
  });
}

export function useUploadSessionPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, file }) =>
      designSessionsApi.uploadPhoto(sessionId, file),
    onSuccess: (_data, { sessionId }) => {
      queryClient.invalidateQueries({
        queryKey: ["design-session", sessionId],
      });
    },
    onError: (error) =>
      showToast.error(error.message || "Failed to upload photo"),
  });
}

export function useGenerateDesign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId) => designSessionsApi.generate(sessionId),
    onSuccess: (_data, sessionId) => {
      queryClient.invalidateQueries({
        queryKey: ["design-session-status", sessionId],
      });
    },
    onError: (error) =>
      showToast.error(error.message || "Failed to generate design"),
  });
}

export function useAddBomToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId) => designSessionsApi.addBomToCart(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error) =>
      showToast.error(error.message || "Failed to add items to cart"),
  });
}

// ── Public AI Designs gallery (no auth) ──────────────────────────────────────
export function usePublicDesigns(params = {}) {
  return useQuery({
    queryKey: ["public-designs", params],
    queryFn: () => designsApi.getPublicDesigns(params),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    select: (res) => {
      // Response shape logged to console — adjust selector once shape is known
      const items =
        res?.data?.items ??
        res?.data?.designs ??
        res?.designs ??
        res?.data ??
        res?.items ??
        [];
      return Array.isArray(items) ? items : [];
    },
  });
}
