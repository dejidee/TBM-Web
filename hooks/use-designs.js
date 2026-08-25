// hooks/use-designs.js
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { designsApi, designSessionsApi } from "@/lib/api/designs";
import { showToast } from "@/components/shared/toast";

// ─── Saved Designs ────────────────────────────────────────────────────────────

export function useDesigns(filters = {}) {
  const { page, pageSize, search, roomType, sortBy } = filters;

  return useQuery({
    // Only pagination in the cache key so filters don't cause extra fetches
    queryKey: ["designs", { page, pageSize }],
    queryFn: () => designsApi.getDesigns({ page, pageSize }),
    staleTime: 3 * 60 * 1000,
    refetchOnWindowFocus: false,
    select: (res) => {
      // API returns { designs: [...], pagination: {...} }
      let items =
        res?.designs ?? res?.data?.items ?? res?.data ?? res?.items ?? [];
      if (!Array.isArray(items)) items = [];

      // Client-side filtering (backend doesn't support these params)
      if (search) {
        const q = search.toLowerCase();
        items = items.filter(
          (d) =>
            d.name?.toLowerCase().includes(q) ||
            d.projectName?.toLowerCase().includes(q) ||
            d.roomType?.toLowerCase().includes(q),
        );
      }
      if (roomType && roomType !== "all") {
        items = items.filter(
          (d) => d.roomType?.toLowerCase() === roomType.toLowerCase(),
        );
      }
      if (sortBy) {
        items = [...items].sort((a, b) => {
          switch (sortBy) {
            case "oldest":
              return new Date(a.createdAt) - new Date(b.createdAt);
            case "alphabetical":
              return (a.name || a.projectName || "").localeCompare(
                b.name || b.projectName || "",
              );
            default: // newest
              return new Date(b.createdAt) - new Date(a.createdAt);
          }
        });
      }
      console.log(items);
      return items;
    },
  });
}

export function useDesignDetails(designId) {
  return useQuery({
    queryKey: ["design", designId],
    queryFn: () => designsApi.getDesignDetails(designId),
    enabled: !!designId,
    staleTime: 5 * 60 * 1000,
    select: (res) => res?.data ?? res,
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

export function useDownloadDesign() {
  return useMutation({
    mutationFn: (designId) => designsApi.downloadDesign(designId),
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
