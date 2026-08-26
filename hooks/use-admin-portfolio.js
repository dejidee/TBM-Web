// hooks/use-admin-portfolio.js
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adminPortfolioAPI } from "@/lib/api/admin";
import { useAdminUser } from "@/hooks/use-admin-auth";

export const adminPortfolioKeys = {
  all: ["admin", "portfolio"],
  list: (params) => [...adminPortfolioKeys.all, "list", params],
  detail: (id) => [...adminPortfolioKeys.all, "detail", id],
};

/**
 * Admin portfolio list.
 *
 * Gated on the admin session — an admin page still renders its shell while the
 * session resolves, and firing this before then just spends a request to be
 * told 401.
 */
export function useAdminPortfolio(params = {}) {
  const { isAdmin } = useAdminUser();

  return useQuery({
    queryKey: adminPortfolioKeys.list(params),
    queryFn: () => adminPortfolioAPI.getAll(params),
    select: (response) => {
      const data = response?.data ?? {};
      return {
        items: data.items ?? [],
        totalCount: data.totalCount ?? 0,
        page: data.page ?? 1,
        pageSize: data.pageSize ?? 20,
        totalPages: data.totalPages ?? 1,
        hasMore: data.hasMore ?? false,
      };
    },
    enabled: isAdmin,
  });
}

/**
 * Create a project, then attach its images, then optionally publish.
 *
 * The order is forced by the API: `/images` is keyed by project id, so the
 * project must exist before a single file can be sent. That makes a partial
 * failure real — the project can be created and an image upload still fail —
 * so this resolves with a per-file outcome instead of throwing the whole thing
 * away. A project with three of four photos is worth keeping and fixing; a
 * silent rollback would leave the admin with nothing and no explanation.
 *
 * `publishImmediately` on the DTO is deliberately *not* used when there are
 * images to upload: publishing before the photos land would put a project with
 * no before/after on the public site. Publish is a separate call afterwards.
 */
export function useCreatePortfolioProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ values, beforeFiles = [], afterFiles = [], publish }) => {
      const hasImages = beforeFiles.length > 0 || afterFiles.length > 0;

      const created = await adminPortfolioAPI.create({
        vendorName: values.vendorName,
        title: values.title,
        location: values.location,
        category: values.category,
        budgetMin: values.budgetMin === "" ? null : Number(values.budgetMin),
        budgetMax: values.budgetMax === "" ? null : Number(values.budgetMax),
        durationMinDays:
          values.durationMinDays === "" ? null : Number(values.durationMinDays),
        durationMaxDays:
          values.durationMaxDays === "" ? null : Number(values.durationMaxDays),
        description: values.description,
        scopeOfWork: values.scopeOfWork
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        publishImmediately: publish && !hasImages,
      });

      const projectId = created?.data?.id ?? created?.id ?? null;
      if (!projectId) {
        throw new Error(
          "The project was created but the server returned no id, so its images could not be attached.",
        );
      }

      const failures = [];
      for (const [file, type] of [
        ...beforeFiles.map((f) => [f, "Before"]),
        ...afterFiles.map((f) => [f, "After"]),
      ]) {
        try {
          await adminPortfolioAPI.uploadImage(projectId, file, type);
        } catch (err) {
          failures.push({ name: file.name, type, message: err.message });
        }
      }

      let published = publish && !hasImages;
      if (publish && hasImages && failures.length === 0) {
        await adminPortfolioAPI.publish(projectId);
        published = true;
      }

      return { projectId, failures, published };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPortfolioKeys.all });
    },
  });
}

/** POST /admin/AdminPortfolio/{id}/publish */
export function usePublishPortfolioProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => adminPortfolioAPI.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPortfolioKeys.all });
    },
  });
}

/** PATCH /admin/AdminPortfolio/{id}/status — status is an integer. */
export function useUpdatePortfolioStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, rejectionReason }) =>
      adminPortfolioAPI.updateStatus(id, status, rejectionReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPortfolioKeys.all });
    },
  });
}

/** Upload one more image onto an existing project. */
export function useUploadPortfolioImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file, imageType, caption }) =>
      adminPortfolioAPI.uploadImage(id, file, imageType, caption),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPortfolioKeys.all });
    },
  });
}
