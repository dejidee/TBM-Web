"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Save,
  Camera,
  Lock,
  Bell,
  Building2,
  MoreVertical,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import {
  useProfile,
  useUpdateProfile,
  useChangePassword,
  useSecuritySettings,
  useToggle2FA,
  useNotificationSettings,
  useUpdateNotificationSettings,
  useBrandAccess,
  useDeactivateAccount,
} from "@/hooks/use-account";
import { avatarStyle } from "@/lib/theme/avatar";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: security } = useSecuritySettings();
  const { data: notifications } = useNotificationSettings();
  const { data: brandAccess } = useBrandAccess();

  // DATA CHECKS
  // console.log("profile: ", profile)
  // console.log("security: ", security)
  // console.log("notifications: ", notifications)
  // console.log("brandAccess: ", brandAccess)

  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const toggle2FA = useToggle2FA();
  const updateNotifications = useUpdateNotificationSettings();
  const deactivateAccount = useDeactivateAccount();

  // Prefill from the API. This was `useState(fn, [profile])` — a lazy state
  // initialiser, which runs once at mount and ignores the dependency array
  // entirely, so the form never populated once the request came back.
  // `profile.phone` was also the wrong field: UpdateMeRequest and the /me
  // response both call it `phoneNumber`.
  useEffect(() => {
    if (!profile) return;
    setProfileData({
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      email: profile.email ?? "",
      phoneNumber: profile.phoneNumber ?? "",
    });
  }, [profile]);

  const handleProfileChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSaveProfile = () => {
    updateProfile.mutate(profileData);
    setHasUnsavedChanges(false);
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    changePassword.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
      confirmNewPassword: passwordData.confirmPassword,
    });
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleToggle2FA = (enabled) => {
    toggle2FA.mutate(enabled);
  };

  // NotificationPreferenceState declares all four booleans as required, and the
  // route is a PUT — sending `{ [key]: value }` alone submitted three undefined
  // preferences alongside the one being changed, switching them off.
  const handleNotificationToggle = (key, value) => {
    updateNotifications.mutate({ ...notifications, [key]: value });
  };

  const handleDeactivateAccount = () => {
    if (
      confirm(
        "Are you sure you want to deactivate your account? This action cannot be undone.",
      )
    ) {
      deactivateAccount.mutate();
    }
  };

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "brand-access", label: "Brand Access" },
    { id: "security", label: "Security" },
    { id: "notifications", label: "Notifications" },
  ];

  return (
    <div className="max-w-300 mx-auto bg-background">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="font-manrope text-[32px] font-bold text-white mb-2">
              Account Settings
            </h1>
            <p className="font-manrope text-[14px] text-muted">
              Manage your profile details, security preferences, and authorized
              brand access.
            </p>
          </div>

          {/* Save Button */}
          {hasUnsavedChanges && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveProfile}
              disabled={updateProfile.isPending}
              className="flex items-center gap-2 px-4 py-2.5 bg-accent-solid text-white rounded-lg font-manrope text-[13px] font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              {updateProfile.isPending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Save size={16} />
              )}
              {updateProfile.isPending ? "Saving…" : "Save Changes"}
            </motion.button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 border-b border-white/08">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                pb-3 font-manrope text-[14px] font-medium border-b-2 transition-colors
                ${
                  activeTab === tab.id
                    ? "border-accent text-white"
                    : "border-transparent text-muted hover:text-white"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <>
            {/* Left Column - Profile Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface rounded-xl border border-white/08 p-6 lg:col-span-2"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="w-32 h-32 rounded-full bg-linear-to-br from-chart-1/10 to-chart-1/10 flex items-center justify-center">
                      <span className="text-[48px] font-bold text-chart-1">
                        {profile?.firstName?.[0]}
                        {profile?.lastName?.[0]}
                      </span>
                    </div>
                    {profile?.isVerifiedVendor && (
                      <div className="absolute top-0 right-0 px-3 py-1 bg-accent-solid text-white rounded-full font-manrope text-[16px] font-bold">
                        Verified Vendor
                      </div>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/05 border border-white/08 rounded-lg font-manrope text-[13px] font-medium text-white hover:bg-white/08 transition-colors"
                  >
                    <Camera size={16} />
                    Change Photo
                  </motion.button>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  {/* Name Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-manrope text-[13px] font-medium text-white mb-2">
                        FIRST NAME
                      </label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) =>
                          handleProfileChange("firstName", e.target.value)
                        }
                        className="w-full px-4 py-2.5 bg-surface-raised border border-white/10 rounded-lg font-manrope text-[14px] text-white focus:outline-none focus:ring-2 focus:ring-accent/40"
                      />
                    </div>
                    <div>
                      <label className="block font-manrope text-[13px] font-medium text-white mb-2">
                        LAST NAME
                      </label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) =>
                          handleProfileChange("lastName", e.target.value)
                        }
                        className="w-full px-4 py-2.5 bg-surface-raised border border-white/10 rounded-lg font-manrope text-[14px] text-white focus:outline-none focus:ring-2 focus:ring-accent/40"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block font-manrope text-[13px] font-medium text-white mb-2">
                      EMAIL ADDRESS
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                        📧
                      </span>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          handleProfileChange("email", e.target.value)
                        }
                        className="w-full pl-12 pr-4 py-2.5 bg-surface-raised border border-white/10 rounded-lg font-manrope text-[14px] text-white focus:outline-none focus:ring-2 focus:ring-accent/40"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block font-manrope text-[13px] font-medium text-white mb-2">
                      PHONE NUMBER
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                        📱
                      </span>
                      <input
                        type="tel"
                        value={profileData.phoneNumber}
                        onChange={(e) =>
                          handleProfileChange("phoneNumber", e.target.value)
                        }
                        className="w-full pl-12 pr-4 py-2.5 bg-surface-raised border border-white/10 rounded-lg font-manrope text-[14px] text-white focus:outline-none focus:ring-2 focus:ring-accent/40"
                      />
                    </div>
                  </div>

                  {/* Company Info */}
                  <div className="pt-4 border-t border-white/08">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-manrope text-[13px] font-medium text-muted mb-2">
                          COMPANY NAME
                        </label>
                        <div className="px-4 py-2.5 bg-accent-solid text-white rounded-lg font-manrope text-[14px]">
                          {profile?.companyName}
                        </div>
                      </div>
                      <div>
                        <label className="block font-manrope text-[13px] font-medium text-muted mb-2">
                          VENDOR ID
                        </label>
                        <div className="px-4 py-2.5 bg-white/05 border border-white/08 text-muted rounded-lg font-manrope text-[14px]">
                          {profile?.vendorId}
                        </div>
                        {!profile?.canChangeVendorId && (
                          <p className="mt-1 font-manrope text-[11px] text-muted">
                            Vendor ID cannot be changed manually. Contact
                            support.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Brand Access Tab */}
        {activeTab === "brand-access" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface rounded-xl border border-white/08 p-6 lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-manrope text-[18px] font-bold text-white mb-1">
                  Authorized Brand Access
                </h3>
                <p className="font-manrope text-[13px] text-muted">
                  Brands you are authorized to supply and manage inventory for.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 bg-surface-raised border border-white/10 rounded-lg font-manrope text-[13px] font-medium text-white hover:bg-white/05 transition-colors"
              >
                Request Access
              </motion.button>
            </div>

            {/* Brand Access Table */}
            <div className="border border-white/08 rounded-xl overflow-hidden">
              {/* Header */}
              <div className="px-6 py-3 bg-white/05 border-b border-white/08">
                <div className="grid grid-cols-[1fr_180px_140px_100px] gap-4">
                  <span className="font-manrope text-[11px] font-bold text-muted uppercase tracking-wider">
                    BRAND ENTITY
                  </span>
                  <span className="font-manrope text-[11px] font-bold text-muted uppercase tracking-wider">
                    ROLE
                  </span>
                  <span className="font-manrope text-[11px] font-bold text-muted uppercase tracking-wider">
                    STATUS
                  </span>
                  <span className="font-manrope text-[11px] font-bold text-muted uppercase tracking-wider">
                    ACTION
                  </span>
                </div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-white/08">
                {brandAccess?.map((brand, index) => (
                  <motion.div
                    key={brand.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="px-6 py-4 hover:bg-white/05 transition-colors"
                  >
                    <div className="grid grid-cols-[1fr_180px_140px_100px] gap-4 items-center">
                      {/* Brand Info */}
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-[20px]"
                          style={avatarStyle(brand.id ?? brand.name)}
                        >
                          {brand.brandIcon}
                        </div>
                        <div>
                          <h4 className="font-manrope text-[14px] font-bold text-white">
                            {brand.brandName}
                          </h4>
                          <p className="font-manrope text-[12px] text-muted">
                            {brand.brandDescription}
                          </p>
                        </div>
                      </div>

                      {/* Role */}
                      <span className="font-manrope text-[13px] text-white">
                        {brand.role}
                      </span>

                      {/* Status */}
                      <div>
                        <span
                          className={`
                            inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-manrope text-[11px] font-bold
                            ${
                              brand.statusColor === "success"
                                ? "bg-success/10 text-success"
                                : "bg-warning/10 text-warning"
                            }
                          `}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              brand.statusColor === "success"
                                ? "bg-success-solid"
                                : "bg-warning"
                            }`}
                          />
                          {brand.status}
                        </span>
                      </div>

                      {/* Actions */}
                      <button className="p-2 text-muted hover:bg-white/08 rounded-lg transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <>
            {/* Security Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface rounded-xl border border-white/08 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Lock size={20} className="text-white" />
                <h3 className="font-manrope text-[18px] font-bold text-white">
                  Security
                </h3>
              </div>

              {/* Change Password */}
              <div className="mb-6">
                <h4 className="font-manrope text-[14px] font-bold text-white mb-4">
                  Change Password
                </h4>
                <div className="space-y-3">
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 bg-surface-raised border border-white/10 rounded-lg font-manrope text-[13px] text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 bg-surface-raised border border-white/10 rounded-lg font-manrope text-[13px] text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 bg-surface-raised border border-white/10 rounded-lg font-manrope text-[13px] text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handlePasswordChange}
                    disabled={changePassword.isPending}
                    className="w-full px-4 py-2.5 bg-accent-solid text-white rounded-lg font-manrope text-[13px] font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
                  >
                    {changePassword.isPending ? "Updating…" : "Update Password"}
                  </motion.button>
                </div>
              </div>

              {/* 2FA Toggle */}
              <div className="pt-6 border-t border-white/08">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-manrope text-[14px] font-bold text-white mb-1">
                      Two-Factor Auth
                    </h4>
                    <p className="font-manrope text-[12px] text-muted">
                      Secure your account with 2FA.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={security?.twoFactorEnabled || false}
                      onChange={(e) => handleToggle2FA(e.target.checked)}
                      disabled={toggle2FA.isPending}
                      className="sr-only peer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <div className="w-11 h-6 bg-track-off peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-white/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success-solid"></div>
                  </label>
                </div>
                <button className="mt-3 font-manrope text-[13px] text-info hover:underline flex items-center gap-1">
                  Manage Methods
                  <ExternalLink size={12} />
                </button>
              </div>
            </motion.div>

            {/* Notifications Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-surface rounded-xl border border-white/08 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Bell size={20} className="text-white" />
                <h3 className="font-manrope text-[18px] font-bold text-white">
                  Notifications
                </h3>
              </div>

              <div className="space-y-4">
                {/* Order Updates */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-manrope text-[14px] font-medium text-white mb-1">
                      Order Updates
                    </h4>
                    <p className="font-manrope text-[12px] text-muted">
                      Status changes on active orders
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications?.orderUpdates || false}
                      onChange={(e) =>
                        handleNotificationToggle(
                          "orderUpdates",
                          e.target.checked,
                        )
                      }
                      disabled={updateNotifications.isPending}
                      className="sr-only peer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <div className="w-11 h-6 bg-track-off peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-white/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success-solid"></div>
                  </label>
                </div>

                {/* Inventory Alerts */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-manrope text-[14px] font-medium text-white mb-1">
                      Inventory Alerts
                    </h4>
                    <p className="font-manrope text-[12px] text-muted">
                      Low stock warnings
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications?.inventoryAlerts || false}
                      onChange={(e) =>
                        handleNotificationToggle(
                          "inventoryAlerts",
                          e.target.checked,
                        )
                      }
                      disabled={updateNotifications.isPending}
                      className="sr-only peer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <div className="w-11 h-6 bg-track-off peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-white/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success-solid"></div>
                  </label>
                </div>

                {/* Marketing */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-manrope text-[14px] font-medium text-white mb-1">
                      Marketing
                    </h4>
                    <p className="font-manrope text-[12px] text-muted">
                      New features and promotions
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications?.marketing || false}
                      onChange={(e) =>
                        handleNotificationToggle("marketing", e.target.checked)
                      }
                      disabled={updateNotifications.isPending}
                      className="sr-only peer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <div className="w-11 h-6 bg-track-off peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-white/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success-solid"></div>
                  </label>
                </div>
              </div>
            </motion.div>

            {/* Danger Zone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-danger/10 rounded-xl border border-danger/40 p-6 lg:col-span-2"
            >
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle
                  size={20}
                  className="text-danger shrink-0 mt-0.5"
                />
                <div>
                  <h3 className="font-manrope text-[16px] font-bold text-danger mb-1">
                    Warning
                  </h3>
                  <p className="font-manrope text-[13px] text-danger">
                    Actions listed here will be undone.
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleDeactivateAccount}
                disabled={deactivateAccount.isPending}
                className="px-6 py-2.5 bg-surface border border-danger text-danger rounded-lg font-manrope text-[13px] font-medium hover:bg-danger-solid hover:text-white transition-colors disabled:opacity-50"
              >
                {deactivateAccount.isPending
                  ? "Deactivating…"
                  : "Deactivate Account"}
              </motion.button>
            </motion.div>
          </>
        )}

        {/* Notifications Tab - Same as Security right column */}
        {activeTab === "notifications" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface rounded-xl border border-white/08 p-6 lg:col-span-2"
          >
            <div className="flex items-center gap-3 mb-6">
              <Bell size={20} className="text-white" />
              <h3 className="font-manrope text-[18px] font-bold text-white">
                Notification Preferences
              </h3>
            </div>

            <div className="space-y-6 max-w-2xl">
              {/* Order Updates */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-manrope text-[16px] font-bold text-white mb-1">
                    Order Updates
                  </h4>
                  <p className="font-manrope text-[13px] text-muted">
                    Status changes on active orders
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications?.orderUpdates || false}
                    onChange={(e) =>
                      handleNotificationToggle("orderUpdates", e.target.checked)
                    }
                    disabled={updateNotifications.isPending}
                    className="sr-only peer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div className="w-11 h-6 bg-track-off peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-white/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success-solid"></div>
                </label>
              </div>

              {/* Inventory Alerts */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-manrope text-[16px] font-bold text-white mb-1">
                    Inventory Alerts
                  </h4>
                  <p className="font-manrope text-[13px] text-muted">
                    Low stock warnings
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications?.inventoryAlerts || false}
                    onChange={(e) =>
                      handleNotificationToggle(
                        "inventoryAlerts",
                        e.target.checked,
                      )
                    }
                    disabled={updateNotifications.isPending}
                    className="sr-only peer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div className="w-11 h-6 bg-track-off peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-white/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success-solid"></div>
                </label>
              </div>

              {/* Marketing */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-manrope text-[16px] font-bold text-white mb-1">
                    Marketing
                  </h4>
                  <p className="font-manrope text-[13px] text-muted">
                    New features and promotions
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications?.marketing || false}
                    onChange={(e) =>
                      handleNotificationToggle("marketing", e.target.checked)
                    }
                    disabled={updateNotifications.isPending}
                    className="sr-only peer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div className="w-11 h-6 bg-track-off peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-white/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success-solid"></div>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
