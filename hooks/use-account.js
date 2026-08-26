import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "@/lib/api/profile";
import { useSession } from "@/hooks/use-session";
import { showToast } from "@/components/shared/toast";

// Account settings — GET /api/v1/account/me.
//
// Was lib/mock/account.js. Everything this page needs is on one real response:
//
//   { profile, addresses, notifications, security, roles, access }
//
// so this is **one query, derived five ways**, not five queries. profileApi's
// getNotifications/getSecurity/getAddresses each call getMe() internally, so
// using them as separate queryFns would fetch /account/me three times for one
// payload. They share this key instead and React Query serves all of them from
// the single request.

export const ACCOUNT_QUERY_KEYS = {
  me: ["account", "me"],
};

/** The one request. Everything below is a `select` over it. */
function useAccount(select) {
  const { isAuthenticated } = useSession();
  return useQuery({
    queryKey: ACCOUNT_QUERY_KEYS.me,
    queryFn: profileApi.getMe,
    select,
    // An anonymous visitor should not spend a request to be told 401.
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });
}

export function useProfile() {
  return useAccount((data) => data?.profile ?? null);
}

export function useSecuritySettings() {
  return useAccount((data) => data?.security ?? {});
}

export function useNotificationSettings() {
  return useAccount((data) => data?.notifications ?? {});
}

export function useAddresses() {
  return useAccount((data) => data?.addresses ?? []);
}

/** Roles and store/admin access, from the same payload. */
export function useBrandAccess() {
  return useAccount((data) => ({
    roles: data?.roles ?? [],
    access: data?.access ?? {},
  }));
}

/** Invalidating the one key refreshes every derived view above. */
function useAccountMutation(mutationFn, errorMessage) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.me }),
    onError: (error) => showToast.error(error.message || errorMessage),
  });
}

/** PATCH /api/v1/account/me */
export function useUpdateProfile() {
  return useAccountMutation(
    (updates) => profileApi.updateMe(updates),
    "Failed to save profile",
  );
}

/**
 * POST /api/v1/account/password/change.
 *
 * The backend also exposes an OTP flow (`password/otp/request` →
 * `password/otp/verify` → `password/otp/change`) — see profileApi. This is the
 * direct current-password path the settings form uses.
 */
export function useChangePassword() {
  return useMutation({
    // ChangePasswordRequest carries confirmNewPassword as well — the caller
    // already collects it, and omitting it left the backend comparing against
    // undefined.
    mutationFn: ({ currentPassword, newPassword, confirmNewPassword }) =>
      profileApi.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword: confirmNewPassword ?? newPassword,
      }),
    onError: (error) =>
      showToast.error(error.message || "Failed to update password"),
  });
}

/** PUT /api/v1/account/security/2fa */
export function useToggle2FA() {
  return useAccountMutation(
    (enabled) => profileApi.update2fa(enabled),
    "Failed to update two-factor authentication",
  );
}

/** PUT /api/v1/account/notifications */
export function useUpdateNotificationSettings() {
  return useAccountMutation(
    (prefs) => profileApi.updateNotifications(prefs),
    "Failed to update notification preferences",
  );
}

/** POST /api/v1/account/deactivate */
export function useDeactivateAccount() {
  return useMutation({
    mutationFn: profileApi.deactivateAccount,
    onError: (error) =>
      showToast.error(error.message || "Failed to deactivate account"),
  });
}
