// hooks/use-project.js
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "@/lib/api/projects";
import { showToast } from "@/components/shared/toast";

// ── Query keys ─────────────────────────────────────────────────────────────────
export const projectKeys = {
  all: ["projects"],
  list: () => ["projects", "list"],
  detail: (id) => ["projects", id],
  timeline: (id) => ["projects", id, "timeline"],
  documents: (id) => ["projects", id, "documents"],
  gallery: (id) => ["projects", id, "gallery"],
  public: () => ["projects", "public"],
};

// ── Create project ─────────────────────────────────────────────────────────────

/**
 * POST /projects — enveloped (`res.data` is the created Project). Used by the
 * "make into a project" design-card action; there's no backend link between a
 * design and a project (BACKLOG.md #5), so this just pre-fills a new one.
 */
export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => projectsApi.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.list() });
    },
    onError: (error) =>
      showToast.error(error.message || "Failed to create project"),
  });
}

// ── Project list ────────────────────────────────────────────────────────────────────
export function useProjects() {
  return useQuery({
    queryKey: projectKeys.list(),
    queryFn: projectsApi.getProjects,
    staleTime: 5 * 60 * 1000,
    select: (res) => res?.data?.items ?? res?.data ?? res?.items ?? res,
  });
}

// ── Project detail ──────────────────────────────────────────────────────────────
export function useProject(id) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectsApi.getProject(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: (count, err) => err?.status !== 404 && count < 2,
    select: (res) => res?.data ?? res,
  });
}

// ── Timeline ────────────────────────────────────────────────────────────────────
export function useProjectTimeline(projectId) {
  return useQuery({
    queryKey: projectKeys.timeline(projectId),
    queryFn: () => projectsApi.getTimeline(projectId),
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000,
    select: (res) => res?.data ?? res,
  });
}

// ── Documents ───────────────────────────────────────────────────────────────────
export function useProjectDocuments(projectId) {
  return useQuery({
    queryKey: projectKeys.documents(projectId),
    queryFn: () => projectsApi.getDocuments(projectId),
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000,
    select: (res) => res?.data?.items ?? res?.data ?? res?.items ?? [],
  });
}

export function useUploadProjectDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, file }) =>
      projectsApi.uploadDocument(projectId, file),
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.documents(projectId) });
    },
    onError: (error) =>
      showToast.error(error.message || "Failed to upload document"),
  });
}

// ── Gallery ─────────────────────────────────────────────────────────────────────
export function useProjectGallery(projectId) {
  return useQuery({
    queryKey: projectKeys.gallery(projectId),
    queryFn: () => projectsApi.getGallery(projectId),
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000,
    select: (res) => res?.data?.items ?? res?.data ?? res?.items ?? [],
  });
}

export function useUploadGalleryImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, file }) =>
      projectsApi.uploadGalleryImage(projectId, file),
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.gallery(projectId) });
    },
    onError: (error) =>
      showToast.error(error.message || "Failed to upload image"),
  });
}

// ── Public project gallery ──────────────────────────────────────────────────────
export function usePublicProjects(params = {}) {
  return useQuery({
    queryKey: projectKeys.public(),
    queryFn: () => projectsApi.getPublicProjects(params),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    select: (res) => res?.data?.items ?? res?.data ?? res?.items ?? [],
  });
}

// ── Portfolio (public, no auth) ─────────────────────────────────────────────────
export const portfolioKeys = {
  all: ["portfolio"],
  list: (params) => ["portfolio", "list", params],
  detail: (id) => ["portfolio", id],
  categories: () => ["portfolio", "categories"],
};

export function usePortfolio({ enabled = true, ...params } = {}) {
  return useQuery({
    queryKey: portfolioKeys.list(params),
    queryFn: () => projectsApi.getPortfolio(params),
    enabled,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    select: (res) => ({
      items: res?.data?.items ?? res?.data ?? res?.items ?? [],
      totalCount: res?.data?.totalCount ?? res?.totalCount ?? 0,
      page: res?.data?.page ?? res?.page ?? 1,
      pageSize: res?.data?.pageSize ?? res?.pageSize ?? 12,
    }),
  });
}

export function usePortfolioItem(id) {
  return useQuery({
    queryKey: portfolioKeys.detail(id),
    queryFn: () => projectsApi.getPortfolioItem(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    select: (res) => res?.data ?? res,
  });
}

/**
 * The distinct `category` values in use across the published portfolio.
 *
 * There is no portfolio-category endpoint — `category` is a free-text string on
 * `AdminCreatePortfolioProjectDto` — so the option list is derived from what has
 * actually been published.
 *
 * Casing is folded: live data contains both "Bathroom renovation" and "Bathroom
 * Renovation", and `GET /portfolio?category=` matches exactly, so offering both
 * as options would let an admin pick the variant the public filter misses. One
 * option survives per case-insensitive name — the spelling used most often, and
 * the first published on a tie.
 */
export function usePortfolioCategories() {
  return useQuery({
    queryKey: portfolioKeys.categories(),
    // One wide page: the option list must cover the whole portfolio, not the
    // 12-item first page the grid renders.
    queryFn: () => projectsApi.getPortfolio({ page: 1, pageSize: 100 }),
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    select: (res) => {
      const items = res?.data?.items ?? res?.data ?? res?.items ?? [];

      // Count each exact spelling, in publication order.
      const spellings = new Map();
      for (const item of items) {
        const name = typeof item?.category === "string" ? item.category.trim() : "";
        if (name) spellings.set(name, (spellings.get(name) ?? 0) + 1);
      }

      // Fold to one winner per case-insensitive name. Map preserves insertion
      // order, so a strict `>` leaves the first-published spelling on a tie.
      const winners = new Map();
      for (const [name, count] of spellings) {
        const key = name.toLowerCase();
        const best = winners.get(key);
        if (!best || count > best.count) winners.set(key, { name, count });
      }

      return Array.from(winners.values(), (w) => w.name).sort((a, b) =>
        a.localeCompare(b),
      );
    },
  });
}
