"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ExternalLink, ChevronDown, ChevronRight } from "lucide-react";
import {
  usePaymentSettings,
  useAIConfiguration,
  useNotificationSettings,
  useGeneralSettings,
  useSavePaymentSettings,
  useSaveGeneralSettings,
  useUpdateNotificationSettings,
  useTogglePaymentGateway,
  useToggleAIModel,
} from "@/hooks/use-settings";
import { showToast } from "@/components/shared/toast";
import PaymentSettingsForm from "@/components/admin/settings/PaymentSettingsForm";

// Import SVG icons
import paymentIcon from "@/public/icons/settings/payment.svg";
import aiConfigIcon from "@/public/icons/settings/aiConfiguration.svg";
import notificationsIcon from "@/public/icons/settings/notifications.svg";
import generalIcon from "@/public/icons/settings/general.svg";
import paymentGatewaysIcon from "@/public/icons/settings/ppaymentGateways.svg";
import stripeIcon from "@/public/icons/settings/stripePayments.svg";
import paypalIcon from "@/public/icons/settings/paypalIntegration.svg";
import cryptoIcon from "@/public/icons/settings/cryptoPayments.svg";
import quickActionsIcon from "@/public/icons/settings/quickActions.svg";
import rightArrowIcon from "@/public/icons/settings/rightArrow.svg";
import shieldIcon from "@/public/icons/settings/shield.svg";

/**
 * Display names for the ids the API returns.
 *
 * GET /admin/settings/payment answers `gateways: [{ id, enabled, publicKey,
 * secretKey }]` and GET /admin/settings/ai answers `models: [{ id, enabled,
 * apiKey, maxTokens }]` — an id and nothing human-readable. These are UI copy
 * keyed by that id, which is a different thing from the `name`, `description`,
 * `provider`, `purpose` and `costPerRequest` this page used to read off
 * lib/mock/settings.js: those were invented values presented as configuration.
 * An unknown id falls through to the id itself rather than to a made-up label.
 */
const GATEWAY_LABELS = {
  paystack: "Paystack",
  stripe: "Stripe",
  paypal: "PayPal",
  flutterwave: "Flutterwave",
};

const MODEL_LABELS = {
  replicate: "Replicate",
  openai: "OpenAI",
  anthropic: "Anthropic",
};

const labelFor = (map, id) => map[id] ?? id;

export default function PlatformSettingsPage() {
  const [activeTab, setActiveTab] = useState("payment");
  const [hasChanges, setHasChanges] = useState(false);

  const { data: paymentSettings, isLoading: paymentLoading, error: paymentError } =
    usePaymentSettings();
  const { data: aiConfig, isLoading: aiLoading } = useAIConfiguration();
  const { data: notificationSettings, isLoading: notificationLoading } =
    useNotificationSettings();
  const { data: generalSettings, isLoading: generalLoading } =
    useGeneralSettings();

  const { mutate: savePayment, isPending: isSaving } = useSavePaymentSettings();
  const { mutate: saveGeneral, isPending: isSavingGeneral } = useSaveGeneralSettings();
  const { mutate: saveNotifications, isPending: isSavingNotifications } =
    useUpdateNotificationSettings();
  const {
    mutate: toggleGateway,
    isPending: isTogglingGateway,
    variables: gatewayVariables,
  } = useTogglePaymentGateway();
  const {
    mutate: toggleModel,
    isPending: isTogglingModel,
    variables: modelVariables,
  } = useToggleAIModel();

  // Each toggle mutation is one instance shared by every row's switch — scope
  // pending to the row actually mutating, or one slow toggle disables every
  // switch in the section. Gateway/model requests carry their own id in
  // `variables`; the notification request sends the whole preferences object,
  // so the key being changed is tracked separately, set at the same time the
  // mutation fires.
  const pendingGatewayId = isTogglingGateway ? gatewayVariables?.gatewayId : null;
  const pendingModelId = isTogglingModel ? modelVariables?.modelId : null;
  const [pendingNotificationKey, setPendingNotificationKey] = useState(null);

  // Local state for form values. Field names match the API's, so nothing has to
  // be renamed on the way out — the old shape (`baseFee`, `fixedFee`,
  // `currency`) was translated in the mutation and defaulted to USD.
  const [formData, setFormData] = useState({
    basePlatformFee: 0,
    fixedFeePerTransaction: 0,
    defaultCurrency: "NGN",
    gateways: [],
  });

  // General settings are editable, so they need state — they used to be
  // `defaultValue` on uncontrolled inputs with no save path at all.
  const [generalForm, setGeneralForm] = useState(null);

  useEffect(() => {
    if (paymentSettings) {
      setFormData({
        basePlatformFee: paymentSettings.basePlatformFee ?? 0,
        fixedFeePerTransaction: paymentSettings.fixedFeePerTransaction ?? 0,
        defaultCurrency: paymentSettings.defaultCurrency ?? "NGN",
        gateways: paymentSettings.gateways ?? [],
      });
    }
  }, [paymentSettings]);

  useEffect(() => {
    if (generalSettings) setGeneralForm({ ...generalSettings });
  }, [generalSettings]);

  const isLoading =
    paymentLoading || aiLoading || notificationLoading || generalLoading;

  const tabs = [
    { id: "payment", label: "Payment", icon: paymentIcon },
    { id: "ai", label: "AI Configuration", icon: aiConfigIcon },
    { id: "notifications", label: "Notifications", icon: notificationsIcon },
    { id: "general", label: "General", icon: generalIcon },
  ];

  // Gateway icon mapping. Only ids we ship an icon for; everything else falls
  // back to the generic payment icon.
  const gatewayIconMap = {
    stripe: stripeIcon,
    paypal: paypalIcon,
    crypto: cryptoIcon,
  };

  const handleSave = (values) => {
    savePayment(values ?? formData, {
      onSuccess: () => {
        setHasChanges(false);
        showToast.success("Payment settings saved");
      },
      onError: (err) => showToast.error("Could not save settings", err.message),
    });
  };

  const handleCancel = () => {
    if (paymentSettings) {
      setFormData({
        basePlatformFee: paymentSettings.basePlatformFee ?? 0,
        fixedFeePerTransaction: paymentSettings.fixedFeePerTransaction ?? 0,
        defaultCurrency: paymentSettings.defaultCurrency ?? "NGN",
        gateways: paymentSettings.gateways ?? [],
      });
    }
    setHasChanges(false);
  };

  const handleSaveGeneral = () => {
    if (!generalForm) return;
    saveGeneral(generalForm, {
      onSuccess: () => showToast.success("General settings saved"),
      onError: (err) => showToast.error("Could not save settings", err.message),
    });
  };

  /**
   * The notification toggles were `<button>`s with no onClick — the whole tab
   * was decorative. Each one now writes the flat boolean the API expects.
   */
  const handleToggleNotification = (key) => {
    if (!notificationSettings) return;
    setPendingNotificationKey(key);
    saveNotifications(
      { ...notificationSettings, [key]: !notificationSettings[key] },
      {
        onError: (err) => showToast.error("Could not save settings", err.message),
        onSettled: () => setPendingNotificationKey(null),
      },
    );
  };

  const handleToggleGateway = (gatewayId, currentStatus) => {
    const updatedGateways = formData.gateways.map((gateway) =>
      gateway.id === gatewayId ? { ...gateway, enabled: !currentStatus } : gateway,
    );
    setFormData({ ...formData, gateways: updatedGateways });

    toggleGateway(
      { gatewayId, enabled: !currentStatus },
      { onError: (err) => showToast.error("Could not update gateway", err.message) },
    );
    setHasChanges(true);
  };

  const handleToggleModel = (modelId, currentStatus) => {
    toggleModel(
      { modelId, enabled: !currentStatus },
      { onError: (err) => showToast.error("Could not update model", err.message) },
    );
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="max-w-360 mx-auto">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white/10 border-t-accent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/50 font-inter text-[14px]">
              Loading settings...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-360 mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="font-inter text-[28px] sm:text-[36px] lg:text-[44.79px] font-black leading-tight lg:leading-[49.77px] tracking-[-1.48px] text-white mb-2">
              Platform Settings
            </h1>
            <p className="font-inter text-[13px] sm:text-[14px] text-white/50">
              Manage global configurations for payments, AI models, and
              notifications. Changes affect the entire system immediately.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCancel}
              className="flex-1 md:flex-none px-4 sm:px-6 py-2.5 border border-white/10 rounded-lg font-inter text-[13px] sm:text-[14px] font-medium text-white/60 hover:bg-white/05 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="flex-1 md:flex-none px-4 sm:px-6 py-2.5 rounded-lg font-inter text-[13px] sm:text-[14px] font-medium text-white transition-opacity disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, var(--color-accent-solid) 0%, var(--color-accent-solid-dim) 100%)" }}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/08 mb-6 sm:mb-8 -mx-4 sm:mx-0">
        <div className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide px-4 sm:px-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-3 font-inter text-[14px] sm:text-[16px] lg:text-[17.42px] font-bold leading-[26.13px] tracking-[0.26px] border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-accent text-accent"
                  : "border-transparent text-white/40 hover:text-white"
              }`}
            >
              <Image
                src={tab.icon}
                alt={tab.label}
                className="h-[16px] w-[16px] sm:h-[18px] sm:w-[18px]"
              />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Error Display */}
          {activeTab === "payment" && paymentError && (
            <div className="bg-danger/10 border border-danger/25 rounded-xl p-4 sm:p-6">
              <h3 className="font-inter text-[16px] font-bold text-danger mb-2">
                Error Loading Payment Settings
              </h3>
              <p className="font-inter text-[14px] text-danger/80">
                {paymentError.message || 'Failed to load payment settings. Please try again.'}
              </p>
            </div>
          )}

          {/* Payment Tab */}
          {activeTab === "payment" && paymentSettings && (
            <>
              {/* Payment Gateways */}
              <div className="bg-surface rounded-xl border border-white/08 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Image
                        src={paymentGatewaysIcon}
                        alt="Payment Gateways"
                        className="h-[20px] w-[20px]"
                      />
                    </div>
                    <h2 className="font-inter text-[16px] sm:text-[18px] font-bold text-white">
                      Payment Gateways
                    </h2>
                  </div>
                  <span className="px-3 py-1 bg-transparent border-[1.24px] border-success/20 rounded-[12440.4px] font-inter text-[12px] sm:text-[14.93px] font-bold leading-[19.91px] text-success uppercase">
                    SYSTEM ACTIVE
                  </span>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {paymentSettings.gateways.map((gateway) => (
                    <div
                      key={gateway.id}
                      className={`flex items-center justify-between p-3 sm:p-4 rounded-[9.95px] border-[1.24px] ${
                        gateway.enabled
                          ? "bg-white/05 border-white/10"
                          : gateway.id === "crypto"
                            ? "bg-white/03 opacity-75 border-white/08"
                            : "bg-white/03 border-white/08"
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <Image
                            src={gatewayIconMap[gateway.id] || paymentIcon}
                            alt=""
                            className="h-[18px] w-[18px] sm:h-[20px] sm:w-[20px]"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-inter text-[14px] sm:text-[15px] font-bold text-white">
                            {labelFor(GATEWAY_LABELS, gateway.id)}
                          </p>
                          {/* The API returns publicKey/secretKey, not a blurb.
                              Whether keys are present is the fact an admin
                              needs here; the old subtitle was marketing copy
                              from the fixture. */}
                          <p className="font-inter text-[12px] sm:text-[13px] text-white/40 truncate">
                            {gateway.publicKey || gateway.secretKey
                              ? "API keys configured"
                              : "No API keys set"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleToggleGateway(gateway.id, gateway.enabled)
                        }
                        disabled={pendingGatewayId === gateway.id}
                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ml-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: gateway.enabled
                            ? "var(--color-success-solid)"
                            : "var(--color-track-off)",
                        }}
                      >
                        {pendingGatewayId === gateway.id ? (
                          <span className="mx-auto h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        ) : (
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              gateway.enabled ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transaction Fees - Formik Form */}
              <PaymentSettingsForm
                initialValues={formData}
                onSubmit={handleSave}
                onCancel={handleCancel}
                isSubmitting={isSaving}
              />
            </>
          )}

          {/* Payment Tab - No Data */}
          {activeTab === "payment" && !paymentSettings && !paymentError && !paymentLoading && (
            <div className="bg-warning/10 border border-warning/25 rounded-xl p-4 sm:p-6">
              <h3 className="font-inter text-[16px] font-bold text-warning mb-2">
                No Payment Settings Found
              </h3>
              <p className="font-inter text-[14px] text-warning/80">
                Payment settings data is empty. Please check your API configuration.
              </p>
            </div>
          )}

          {/* AI Configuration Tab */}
          {activeTab === "ai" && aiConfig && (
            <div className="bg-surface rounded-xl border border-white/08 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 bg-white/05 rounded-lg flex items-center justify-center shrink-0">
                  <Image
                    src={aiConfigIcon}
                    alt="AI Configuration"
                    className="h-[20px] w-[20px]"
                  />
                </div>
                <h2 className="font-inter text-[16px] sm:text-[18px] font-bold text-white">
                  AI Models
                </h2>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {aiConfig.models.map((model) => (
                  <div
                    key={model.id}
                    className="flex items-center justify-between p-3 sm:p-4 bg-white/05 rounded-lg border border-white/08"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-chart-1 to-accent-solid rounded-full flex items-center justify-center flex-shrink-0">
                        <Image
                          src={aiConfigIcon}
                          alt=""
                          className="h-[18px] w-[18px] sm:h-[20px] sm:w-[20px]"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-inter text-[14px] sm:text-[15px] font-bold text-white">
                          {labelFor(MODEL_LABELS, model.id)}
                        </p>
                        {/* `provider`, `purpose` and a per-request cost were
                            fixture inventions — the API returns maxTokens and
                            whether a key is set, so that is what is shown. */}
                        <p className="font-inter text-[12px] sm:text-[13px] text-white/50 truncate">
                          {typeof model.maxTokens === "number"
                            ? `Max ${model.maxTokens.toLocaleString()} tokens`
                            : "Token limit not set"}
                          {model.apiKey ? " • Key configured" : " • No key set"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleModel(model.id, model.enabled)}
                      disabled={pendingModelId === model.id}
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ml-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: model.enabled ? "var(--color-success-solid)" : "var(--color-track-off)",
                      }}
                    >
                      {pendingModelId === model.id ? (
                        <span className="mx-auto h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      ) : (
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            model.enabled ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && notificationSettings && (
            <div className="bg-surface rounded-xl border border-white/08 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center shrink-0">
                  <Image
                    src={notificationsIcon}
                    alt="Notifications"
                    className="h-[20px] w-[20px]"
                  />
                </div>
                <h2 className="font-inter text-[16px] sm:text-[18px] font-bold text-white">
                  Notification Preferences
                </h2>
              </div>

              {/* The API answers seven flat booleans, not the nested
                  email/sms/push groups the fixture had. They are grouped here
                  for reading; each toggle writes the whole object back. */}
              <div className="space-y-6">
                {[
                  {
                    heading: "Channels",
                    keys: [
                      ["emailEnabled", "Email"],
                      ["smsEnabled", "SMS"],
                      ["pushEnabled", "Push"],
                      ["webhookEnabled", "Webhooks"],
                    ],
                  },
                  {
                    heading: "Alerts",
                    keys: [
                      ["lowStockAlerts", "Low stock"],
                      ["highValueOrderAlerts", "High-value orders"],
                      ["paymentFailureAlerts", "Payment failures"],
                    ],
                  },
                ].map((group, gi) => (
                  <div
                    key={group.heading}
                    className={gi > 0 ? "pt-5 sm:pt-6 border-t border-white/08" : ""}
                  >
                    <h3 className="font-inter text-[14px] sm:text-[15px] font-bold text-white mb-3 sm:mb-4">
                      {group.heading}
                    </h3>
                    <div className="space-y-3">
                      {group.keys
                        .filter(([key]) => key in notificationSettings)
                        .map(([key, label]) => {
                          const value = Boolean(notificationSettings[key]);
                          return (
                            <div key={key} className="flex items-center justify-between gap-3">
                              <span className="font-inter text-[13px] sm:text-[14px] text-white/50 flex-1">
                                {label}
                              </span>
                              <button
                                type="button"
                                role="switch"
                                aria-checked={value}
                                aria-label={label}
                                onClick={() => handleToggleNotification(key)}
                                disabled={pendingNotificationKey === key}
                                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                  backgroundColor: value
                                    ? "var(--color-success-solid)"
                                    : "var(--color-track-off)",
                                }}
                              >
                                {pendingNotificationKey === key ? (
                                  <span className="mx-auto h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                ) : (
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                      value ? "translate-x-6" : "translate-x-1"
                                    }`}
                                  />
                                )}
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* General Tab ────────────────────────────────────────────────
              The API has exactly four general fields. Timezone, date format
              and session timeout were fixture-only: the picker wrote to
              nothing, and PUT /admin/settings/general would have dropped them.
              The inputs were also uncontrolled `defaultValue`s with no save
              button — editing them did nothing at all. */}
          {activeTab === "general" && generalForm && (
            <div className="bg-surface rounded-xl border border-white/08 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 bg-white/08 rounded-lg flex items-center justify-center shrink-0">
                  <Image src={generalIcon} alt="" className="h-[20px] w-[20px]" />
                </div>
                <h2 className="font-inter text-[16px] sm:text-[18px] font-bold text-white">
                  General Settings
                </h2>
              </div>

              <div className="space-y-5 sm:space-y-6">
                <div>
                  <label
                    htmlFor="platformName"
                    className="block font-inter text-[14px] font-medium text-white/70 mb-2"
                  >
                    Platform Name
                  </label>
                  <input
                    id="platformName"
                    type="text"
                    value={generalForm.platformName ?? ""}
                    onChange={(e) =>
                      setGeneralForm({ ...generalForm, platformName: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-surface-raised border border-white/10 rounded-lg font-inter text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label
                    htmlFor="supportEmail"
                    className="block font-inter text-[14px] font-medium text-white/70 mb-2"
                  >
                    Support Email
                  </label>
                  <input
                    id="supportEmail"
                    type="email"
                    value={generalForm.supportEmail ?? ""}
                    onChange={(e) =>
                      setGeneralForm({ ...generalForm, supportEmail: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-surface-raised border border-white/10 rounded-lg font-inter text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label
                    htmlFor="apiRateLimit"
                    className="block font-inter text-[14px] font-medium text-white/70 mb-2"
                  >
                    API Rate Limit
                  </label>
                  <input
                    id="apiRateLimit"
                    type="number"
                    min={0}
                    value={generalForm.apiRateLimit ?? 0}
                    onChange={(e) =>
                      setGeneralForm({
                        ...generalForm,
                        apiRateLimit: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 bg-surface-raised border border-white/10 rounded-lg font-inter text-[14px] text-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-transparent transition-all"
                  />
                  <p className="mt-1.5 font-inter text-[12px] text-white/30">
                    Requests per hour.
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <div>
                    <p className="font-inter text-[14px] font-medium text-white/70">
                      Maintenance Mode
                    </p>
                    <p className="font-inter text-[12px] text-white/30">
                      Takes the storefront offline for everyone but admins.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={Boolean(generalForm.maintenanceMode)}
                    aria-label="Maintenance mode"
                    onClick={() =>
                      setGeneralForm({
                        ...generalForm,
                        maintenanceMode: !generalForm.maintenanceMode,
                      })
                    }
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
                    style={{
                      backgroundColor: generalForm.maintenanceMode
                        ? "var(--color-success-solid)"
                        : "var(--color-track-off)",
                    }}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        generalForm.maintenanceMode ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="pt-2 border-t border-white/08 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveGeneral}
                    disabled={isSavingGeneral}
                    className="px-5 py-2.5 rounded-lg bg-accent-solid text-white font-inter text-[14px] font-semibold transition-opacity disabled:opacity-50"
                  >
                    {isSavingGeneral ? "Saving…" : "Save changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setGeneralForm({ ...generalSettings })}
                    className="px-5 py-2.5 rounded-lg border border-white/15 text-white/70 font-inter text-[14px] hover:text-white transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Quick Actions */}
          <div className="bg-surface rounded-xl border border-white/08 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <Image
                src={quickActionsIcon}
                alt="Quick Actions"
                className="h-[18px] w-[18px] sm:h-[20px] sm:w-[20px]"
              />
              <h3 className="font-inter text-[15px] sm:text-[16px] font-bold text-white">
                Quick Actions
              </h3>
            </div>
            <p className="font-inter text-[12px] sm:text-[13px] text-white/40 mb-3 sm:mb-4">
              Common tasks for super admins.
            </p>
            <div className="space-y-2">
              {[
                "View Transaction Logs",
                "Manage Tax Rules",
                "Invoice Settings",
              ].map((action, i) => (
                <button
                  key={i}
                  className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-white/05 hover:bg-white/08 rounded-[9.95px] border border-white/08 transition-colors group"
                >
                  <span className="font-inter text-[13px] sm:text-[14px] text-white/80">
                    {action}
                  </span>
                  <Image
                    src={rightArrowIcon}
                    alt=""
                    className="h-[14px] w-[14px] sm:h-[15px] sm:w-[15px] group-hover:translate-x-1 transition-transform shrink-0"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Security Context */}
          <div className="bg-surface rounded-[14.93px] border border-white/08 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <Image
                src={shieldIcon}
                alt="Security"
                className="h-[18px] w-[22px] sm:h-[20px] sm:w-[25px] shrink-0"
              />
              <h3 className="font-inter text-[17px] sm:text-[19.91px] font-bold leading-tight sm:leading-[29.86px] text-accent">
                Security Context
              </h3>
            </div>
            <p className="font-inter text-[12px] sm:text-[13px] text-white/40 mb-3 sm:mb-4">
              Changes to payment configurations require 2FA verification upon
              saving.
            </p>
            <div className="flex items-center gap-2 text-white">
              <span className="w-2 h-2 bg-success-solid rounded-full shrink-0"></span>
              <span className="font-inter text-[12px] sm:text-[13px] font-medium text-white/70">
                Audit Logging Active
              </span>
            </div>
          </div>

          {/* Help */}
          <div className="bg-surface rounded-[14.93px] border border-white/08 p-4 sm:p-6">
            <p className="font-inter text-[13px] sm:text-[14px] text-white/50 mb-3">
              Need help with fee calculation?
            </p>
            <button className="flex items-center gap-2 font-inter text-[13px] sm:text-[14px] font-medium text-accent hover:underline">
              Read Documentation
              <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
