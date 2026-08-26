import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminSettingsAPI } from "@/lib/api/admin";

// Admin platform settings — all four surfaces are live:
//
//   GET/PUT   /api/v1/admin/settings/general
//   GET/PUT   /api/v1/admin/settings/payment
//   GET/PUT   /api/v1/admin/settings/notifications
//   GET/PUT   /api/v1/admin/settings/ai
//   PATCH     /api/v1/admin/settings/payment/gateways/{gatewayId}
//   PATCH     /api/v1/admin/settings/ai/models/{modelId}
//
// This module used to carry `const USE_MOCK_API = true` and a mock branch on
// every hook, so the admin settings page rendered lib/mock/settings.js — Stripe,
// PayPal, GPT-4 and Claude 3, none of which are configured. The real responses
// are a good deal smaller and are the shapes the page is now built against;
// they are recorded in contracts/admin-settings.json.

export const SETTINGS_QUERY_KEYS = {
  all: ["admin", "settings"],
  payment: ["admin", "settings", "payment"],
  ai: ["admin", "settings", "ai"],
  notifications: ["admin", "settings", "notifications"],
  general: ["admin", "settings", "general"],
};

/** These endpoints answer a bare object, not an ApiEnvelope. Tolerate both. */
const unwrap = (res) => res?.data ?? res;

export function usePaymentSettings() {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEYS.payment,
    queryFn: adminSettingsAPI.getPaymentSettings,
    select: unwrap,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAIConfiguration() {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEYS.ai,
    queryFn: adminSettingsAPI.getAISettings,
    select: unwrap,
    staleTime: 5 * 60 * 1000,
  });
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEYS.notifications,
    queryFn: adminSettingsAPI.getNotificationSettings,
    select: unwrap,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGeneralSettings() {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEYS.general,
    queryFn: adminSettingsAPI.getGeneralSettings,
    select: unwrap,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * PUT /api/v1/admin/settings/payment.
 *
 * Takes the settings object as the API defines it. It used to accept the form's
 * own field names and rename them here (`baseFee` → `basePlatformFee`), with a
 * `defaultCurrency: "USD"` fallback baked in — on a catalogue priced in naira.
 */
export function useSavePaymentSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminSettingsAPI.updatePaymentSettings,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEYS.payment }),
  });
}

/** PATCH /api/v1/admin/settings/payment/gateways/{gatewayId} */
export function useTogglePaymentGateway() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ gatewayId, enabled }) =>
      adminSettingsAPI.togglePaymentGateway(gatewayId, enabled),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEYS.payment }),
  });
}

/** PATCH /api/v1/admin/settings/ai/models/{modelId} */
export function useToggleAIModel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ modelId, enabled }) => adminSettingsAPI.toggleAIModel(modelId, enabled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEYS.ai }),
  });
}

/** PUT /api/v1/admin/settings/ai */
export function useSaveAISettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminSettingsAPI.updateAISettings,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEYS.ai }),
  });
}

/** PUT /api/v1/admin/settings/notifications */
export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminSettingsAPI.updateNotificationSettings,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEYS.notifications }),
  });
}

/** PUT /api/v1/admin/settings/general */
export function useSaveGeneralSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminSettingsAPI.updateGeneralSettings,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEYS.general }),
  });
}
