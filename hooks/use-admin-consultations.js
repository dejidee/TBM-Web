// hooks/use-admin-consultations.js
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adminConsultationsAPI } from "@/lib/api/admin";
import { useAdminUser } from "@/hooks/use-admin-auth";

export const adminConsultationKeys = {
  all: ["admin", "consultations"],
  list: (params) => [...adminConsultationKeys.all, "list", params],
  pricing: () => [...adminConsultationKeys.all, "pricing"],
};

/**
 * GET /admin/consultations. Gated on the admin session — the page shell
 * renders while the session resolves and firing early only buys a 401.
 *
 * The backend's pagination block is the short one (`items, page, pageSize,
 * totalCount`); `totalPages` is derived here so the page never has to.
 */
export function useAdminConsultations(params = {}) {
  const { isAdmin } = useAdminUser();

  return useQuery({
    queryKey: adminConsultationKeys.list(params),
    queryFn: () => adminConsultationsAPI.getAll(params),
    select: (response) => {
      const data = response?.data ?? {};
      const pageSize = data.pageSize || params.pageSize || 20;
      const totalCount = data.totalCount ?? 0;
      return {
        items: data.items ?? [],
        page: data.page ?? 1,
        pageSize,
        totalCount,
        totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
      };
    },
    enabled: isAdmin,
    staleTime: 30 * 1000,
  });
}

/** PUT /admin/consultations/{id}/cancel */
export function useCancelAdminConsultation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => adminConsultationsAPI.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminConsultationKeys.all });
      // Cancelling frees the slot on the public calendar.
      queryClient.invalidateQueries({ queryKey: ["consultations", "availability"] });
    },
  });
}

/** GET /admin/consultations/pricing */
export function useAdminConsultationPricing() {
  const { isAdmin } = useAdminUser();
  return useQuery({
    queryKey: adminConsultationKeys.pricing(),
    queryFn: adminConsultationsAPI.getPricing,
    select: (response) => response?.data ?? [],
    enabled: isAdmin,
  });
}

/** PUT /admin/consultations/pricing/{id} */
export function useUpdateConsultationPricing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }) => adminConsultationsAPI.updatePricing(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminConsultationKeys.pricing() });
      // The public booking page reads its fees from the same rows.
      queryClient.invalidateQueries({ queryKey: ["consultations", "types"] });
    },
  });
}
