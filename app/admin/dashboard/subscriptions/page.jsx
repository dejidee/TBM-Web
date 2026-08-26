"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  Check,
  Tag,
  ChevronDown,
} from "lucide-react";
import {
  useAdminPricing,
  useUpdateAdminPricing,
  useAdminDiscounts,
  useCreateAdminDiscount,
  useUpdateAdminDiscount,
  useDeleteAdminDiscount,
} from "@/hooks/use-admin-subscriptions";

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Chips are a 14% tint of the token with the token itself as text — the same
// construction as the role chips. The previous values were light-theme pairs
// (green-100 fill / green-800 text) that rendered as white blocks on the dark
// table and put their text 1.3:1 against the page behind them.
const tint = (token) => `color-mix(in oklab, var(${token}) 14%, transparent)`;

const TIER_COLORS = {
  economy: { bg: tint("--color-success"), text: "var(--color-success)", label: "Economy" },
  premium: { bg: tint("--color-info"), text: "var(--color-info)", label: "Premium" },
  luxury: { bg: tint("--color-role-superadmin"), text: "var(--color-role-superadmin)", label: "Luxury" },
};

const STATUS_CHIP = {
  active: { bg: tint("--color-success"), text: "var(--color-success)", label: "Active" },
  scheduled: { bg: tint("--color-info"), text: "var(--color-info)", label: "Scheduled" },
  expired: { bg: "rgba(255,255,255,0.08)", text: "rgba(255,255,255,0.4)", label: "Expired" },
};

function formatNGN(val) {
  if (val == null) return "—";
  return `₦${Number(val).toLocaleString()}`;
}

function discountStatus(d) {
  const now = new Date();
  if (!d.isActive) return "expired";
  if (new Date(d.startDate) > now) return "scheduled";
  if (new Date(d.endDate) < now) return "expired";
  return "active";
}

// ─── Pricing Row ──────────────────────────────────────────────────────────────
// Each config record = one tier + billingCycle combination from the API.
// Fields: id, tier, billingCycle, price, currency, generationsPerMonth (-1=∞),
//         prioritySupport, unlimitedGenerations, displayName, description, features[]

function PricingRow({ config, onSave }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    price: config.price ?? 0,
    generationsPerMonth: config.unlimitedGenerations ? "" : (config.generationsPerMonth ?? ""),
    prioritySupport: config.prioritySupport ?? false,
    unlimitedGenerations: config.unlimitedGenerations ?? false,
    description: config.description ?? "",
  });
  const [saving, setSaving] = useState(false);

  const tierKey = config.tier?.toLowerCase() || "economy";
  const colors = TIER_COLORS[tierKey] || TIER_COLORS.economy;
  const isUnlimited = form.unlimitedGenerations;

  const inputCls =
    "px-2 py-1 bg-surface-raised border border-white/10 rounded-lg font-manrope text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-transparent transition-all disabled:opacity-40 disabled:cursor-not-allowed";

  const handleSave = async () => {
    setSaving(true);
    await onSave(tierKey, config.billingCycle?.toLowerCase(), {
      price: Number(form.price),
      generationsPerMonth: isUnlimited ? -1 : Number(form.generationsPerMonth),
      prioritySupport: form.prioritySupport,
      unlimitedGenerations: form.unlimitedGenerations,
      description: form.description,
    });
    setSaving(false);
    setEditing(false);
  };

  const displayGenerations =
    config.unlimitedGenerations || config.generationsPerMonth === -1
      ? "Unlimited"
      : config.generationsPerMonth;

  return (
    <tr className="border-b border-white/08 last:border-0 hover:bg-white/03 transition-colors">
      {/* Tier */}
      <td className="py-4 px-4 whitespace-nowrap">
        <span
          className="px-3 py-1 rounded-full font-manrope text-[12px] font-bold uppercase"
          style={{ backgroundColor: colors.bg, color: colors.text }}
        >
          {config.tier}
        </span>
      </td>

      {/* Billing Cycle */}
      <td className="py-4 px-4 whitespace-nowrap">
        <span className="font-manrope text-[13px] text-white/60">{config.billingCycle}</span>
      </td>

      {/* Price */}
      <td className="py-4 px-4">
        {editing ? (
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className={`w-28 ${inputCls}`}
            min="0"
            disabled={tierKey === "economy"}
          />
        ) : (
          <span className="font-manrope text-[14px] text-white font-semibold">
            {tierKey === "economy" ? "Free" : `${formatNGN(config.price)} ${config.currency}`}
          </span>
        )}
      </td>

      {/* Generations / Month */}
      <td className="py-4 px-4">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={form.generationsPerMonth}
              onChange={(e) => setForm({ ...form, generationsPerMonth: e.target.value })}
              className={`w-20 ${inputCls}`}
              placeholder="e.g. 20"
              disabled={isUnlimited}
              min="1"
            />
            <label className="flex items-center gap-1.5 text-[12px] text-white/50 whitespace-nowrap cursor-pointer">
              <input
                type="checkbox"
                checked={form.unlimitedGenerations}
                onChange={(e) => setForm({ ...form, unlimitedGenerations: e.target.checked, generationsPerMonth: "" })}
                className="accent-accent-solid"
              />
              Unlimited
            </label>
          </div>
        ) : (
          <span className="font-manrope text-[14px] text-white">{displayGenerations}</span>
        )}
      </td>

      {/* Priority Support */}
      <td className="py-4 px-4">
        {editing ? (
          <button
            onClick={() => setForm({ ...form, prioritySupport: !form.prioritySupport })}
            className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
            style={{ backgroundColor: form.prioritySupport ? "var(--color-success-solid)" : "rgba(255,255,255,0.15)" }}
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${form.prioritySupport ? "translate-x-4" : "translate-x-0.5"}`} />
          </button>
        ) : (
          <span className={`font-manrope text-[12px] font-semibold px-2 py-0.5 rounded-full ${config.prioritySupport ? "bg-success/10 text-success" : "bg-white/08 text-white/40"}`}>
            {config.prioritySupport ? "Yes" : "No"}
          </span>
        )}
      </td>

      {/* Description */}
      <td className="py-4 px-4 max-w-48">
        {editing ? (
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={`w-full ${inputCls}`}
          />
        ) : (
          <span className="font-manrope text-[12px] text-white/50 line-clamp-2">{config.description || "—"}</span>
        )}
      </td>

      {/* Actions */}
      <td className="py-4 px-4 whitespace-nowrap">
        {editing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-manrope text-[12px] font-semibold text-white transition-opacity disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, var(--color-accent-solid) 0%, var(--color-accent-solid-dim) 100%)" }}
            >
              <Check size={12} />
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-3 py-1.5 border border-white/10 rounded-lg font-manrope text-[12px] text-white/60 hover:bg-white/05 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 px-3 py-1.5 border border-white/10 rounded-lg font-manrope text-[12px] text-white/60 hover:bg-white/05 transition-colors"
          >
            <Edit2 size={12} />
            Edit
          </button>
        )}
      </td>
    </tr>
  );
}

// ─── Discount Row ─────────────────────────────────────────────────────────────

function DiscountRow({ discount, onDeactivate, isDeactivating }) {
  const status = discountStatus(discount);
  const chip = STATUS_CHIP[status];

  return (
    <tr className="border-b border-white/08 last:border-0 hover:bg-white/03 transition-colors">
      <td className="py-4 px-4">
        <p className="font-manrope text-[14px] font-semibold text-white">
          {discount.name}
        </p>
        {discount.displayLabel && (
          <span className="px-2 py-0.5 mt-1 inline-block bg-white/08 text-accent rounded font-manrope text-[11px] font-semibold">
            {discount.displayLabel}
          </span>
        )}
      </td>
      <td className="py-4 px-4">
        {discount.tier ? (
          <span
            className="px-2.5 py-1 rounded-full font-manrope text-[12px] font-semibold capitalize"
            style={{
              backgroundColor: TIER_COLORS[discount.tier]?.bg || "rgba(255,255,255,0.08)",
              color: TIER_COLORS[discount.tier]?.text || "rgba(255,255,255,0.5)",
            }}
          >
            {discount.tier}
          </span>
        ) : (
          <span className="font-manrope text-[13px] text-white/50">All paid tiers</span>
        )}
      </td>
      <td className="py-4 px-4 font-manrope text-[13px] text-white/50 capitalize">
        {discount.billingCycle || "Both"}
      </td>
      <td className="py-4 px-4 font-manrope text-[14px] text-white font-semibold">
        {discount.discountType === "percentage"
          ? `${discount.discountValue}%`
          : formatNGN(discount.discountValue)}
      </td>
      <td className="py-4 px-4 font-manrope text-[12px] text-white/50">
        {discount.startDate ? new Date(discount.startDate).toLocaleDateString() : "—"}
        {" → "}
        {discount.endDate ? new Date(discount.endDate).toLocaleDateString() : "—"}
      </td>
      <td className="py-4 px-4">
        {discount.promoCode ? (
          <code className="px-2 py-1 bg-white/08 rounded font-mono text-[12px] text-white">
            {discount.promoCode}
          </code>
        ) : (
          <span className="font-manrope text-[12px] text-white/40">Auto-applied</span>
        )}
      </td>
      <td className="py-4 px-4 font-manrope text-[13px] text-white/50">
        {discount.redemptionCount ?? 0}
        {discount.maxRedemptions != null ? ` / ${discount.maxRedemptions}` : ""}
      </td>
      <td className="py-4 px-4">
        <span
          className="px-2.5 py-1 rounded-full font-manrope text-[12px] font-semibold"
          style={{ backgroundColor: chip.bg, color: chip.text }}
        >
          {chip.label}
        </span>
      </td>
      <td className="py-4 px-4">
        {status !== "expired" && (
          <button
            onClick={() => onDeactivate(discount.id)}
            disabled={isDeactivating}
            className="flex items-center gap-1 px-3 py-1.5 border border-danger/25 text-danger rounded-lg font-manrope text-[12px] hover:bg-danger/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeactivating ? (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-danger/30 border-t-danger" />
            ) : (
              <Trash2 size={12} />
            )}
            {isDeactivating ? "Deactivating…" : "Deactivate"}
          </button>
        )}
      </td>
    </tr>
  );
}

// ─── Create Discount Modal ────────────────────────────────────────────────────

const EMPTY_FORM = {
  name: "",
  tier: "",
  billingCycle: "",
  discountType: "percentage",
  discountValue: "",
  startDate: "",
  endDate: "",
  promoCode: "",
  maxRedemptions: "",
  displayLabel: "",
};

const inputCls =
  "w-full px-3 py-2.5 bg-surface-raised border border-white/10 rounded-lg font-manrope text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-transparent transition-all";

const selectCls =
  "appearance-none w-full px-3 py-2.5 bg-surface-raised border border-white/10 rounded-lg font-manrope text-[14px] text-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-transparent transition-all";

function CreateDiscountModal({ onClose, onCreate }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.name || !form.discountType || !form.discountValue || !form.startDate || !form.endDate) {
      setFormError("Please fill in all required fields.");
      return;
    }
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      setFormError("Start date must be before end date.");
      return;
    }

    setSubmitting(true);
    try {
      await onCreate({
        name: form.name,
        tier: form.tier || undefined,
        billingCycle: form.billingCycle || undefined,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        startDate: form.startDate,
        endDate: form.endDate,
        promoCode: form.promoCode || undefined,
        maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : undefined,
        displayLabel: form.displayLabel || undefined,
      });
      onClose();
    } catch (err) {
      setFormError(err?.response?.data?.message || err.message || "Failed to create discount.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-surface border border-white/08 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/08">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/05 rounded-lg flex items-center justify-center">
              <Tag size={18} className="text-accent" />
            </div>
            <h2 className="font-manrope text-[18px] font-bold text-white">
              New Discount Campaign
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/08 transition-colors"
          >
            <X size={18} className="text-white/40" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/25 rounded-lg">
              <AlertCircle size={16} className="text-danger shrink-0" />
              <p className="font-manrope text-[13px] text-danger">{formError}</p>
            </div>
          )}

          {/* Campaign Name */}
          <div>
            <label className="block font-manrope text-[13px] font-semibold text-white/70 mb-1.5">
              Campaign Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Black Friday 2025"
              className={inputCls}
            />
          </div>

          {/* Tier + Billing Cycle */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-manrope text-[13px] font-semibold text-white/70 mb-1.5">
                Tier
              </label>
              <div className="relative">
                <select
                  value={form.tier}
                  onChange={(e) => set("tier", e.target.value)}
                  className={selectCls}
                >
                  <option value="">All paid tiers</option>
                  <option value="premium">Premium</option>
                  <option value="luxury">Luxury</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block font-manrope text-[13px] font-semibold text-white/70 mb-1.5">
                Billing Cycle
              </label>
              <div className="relative">
                <select
                  value={form.billingCycle}
                  onChange={(e) => set("billingCycle", e.target.value)}
                  className={selectCls}
                >
                  <option value="">Both</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Discount Type + Value */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-manrope text-[13px] font-semibold text-white/70 mb-1.5">
                Discount Type <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <select
                  value={form.discountType}
                  onChange={(e) => set("discountType", e.target.value)}
                  className={selectCls}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed_amount">Fixed Amount (₦)</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block font-manrope text-[13px] font-semibold text-white/70 mb-1.5">
                Value <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                value={form.discountValue}
                onChange={(e) => set("discountValue", e.target.value)}
                placeholder={form.discountType === "percentage" ? "e.g. 25" : "e.g. 5000"}
                min="0"
                max={form.discountType === "percentage" ? "100" : undefined}
                className={inputCls}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-manrope text-[13px] font-semibold text-white/70 mb-1.5">
                Start Date <span className="text-danger">*</span>
              </label>
              <input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block font-manrope text-[13px] font-semibold text-white/70 mb-1.5">
                End Date <span className="text-danger">*</span>
              </label>
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Promo Code */}
          <div>
            <label className="block font-manrope text-[13px] font-semibold text-white/70 mb-1.5">
              Promo Code <span className="text-white/30 font-normal">(optional — blank = auto-applied)</span>
            </label>
            <input
              type="text"
              value={form.promoCode}
              onChange={(e) => set("promoCode", e.target.value.toUpperCase())}
              placeholder="e.g. BLACKFRIDAY25"
              className={`${inputCls} font-mono uppercase`}
            />
          </div>

          {/* Max Redemptions + Display Label */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-manrope text-[13px] font-semibold text-white/70 mb-1.5">
                Max Redemptions <span className="text-white/30 font-normal">(blank = unlimited)</span>
              </label>
              <input
                type="number"
                value={form.maxRedemptions}
                onChange={(e) => set("maxRedemptions", e.target.value)}
                placeholder="e.g. 100"
                min="1"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block font-manrope text-[13px] font-semibold text-white/70 mb-1.5">
                Display Label <span className="text-white/30 font-normal">(badge text)</span>
              </label>
              <input
                type="text"
                value={form.displayLabel}
                onChange={(e) => set("displayLabel", e.target.value)}
                placeholder="e.g. Black Friday"
                className={inputCls}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-white/10 rounded-lg font-manrope text-[14px] font-semibold text-white/60 hover:bg-white/05 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-lg font-manrope text-[14px] font-semibold text-white transition-opacity disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, var(--color-accent-solid) 0%, var(--color-accent-solid-dim) 100%)" }}
            >
              {submitting ? "Creating…" : "Create Campaign"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SubscriptionsPage() {
  const [activeTab, setActiveTab] = useState("pricing");
  const [discountFilter, setDiscountFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pageError, setPageError] = useState(null);

  const { data: pricingData, isLoading: pricingLoading, error: pricingError } =
    useAdminPricing();
  const { data: discountsData, isLoading: discountsLoading, error: discountsError } =
    useAdminDiscounts({ status: discountFilter });

  const { mutateAsync: updatePricing } = useUpdateAdminPricing();
  const { mutateAsync: createDiscount } = useCreateAdminDiscount();
  const {
    mutate: deleteDiscount,
    isPending: isDeactivating,
    variables: deactivatingId,
  } = useDeleteAdminDiscount();

  const pricing = Array.isArray(pricingData) ? pricingData : pricingData?.data ?? [];
  const discounts = Array.isArray(discountsData) ? discountsData : discountsData?.data ?? [];

  const handleUpdatePricing = async (tier, cycle, data) => {
    try {
      await updatePricing({ tier, cycle, data });
    } catch (err) {
      setPageError(err?.response?.data?.message || err.message || "Failed to save pricing.");
    }
  };

  const isLoading = pricingLoading || discountsLoading;

  if (isLoading) {
    return (
      <div className="max-w-360 mx-auto animate-pulse space-y-6">
        <div className="h-10 w-64 bg-white/08 rounded-lg" />
        <div className="h-8 w-72 bg-white/08 rounded" />
        <div className="bg-surface rounded-xl border border-white/08 p-6 h-64" />
      </div>
    );
  }

  return (
    <div className="max-w-360 mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-inter text-[28px] sm:text-[32px] font-bold text-white mb-2">
          Subscriptions & Pricing
        </h1>
        <p className="font-manrope text-[13px] sm:text-[14px] text-white/50">
          Manage subscription tier prices, generation quotas, and discount campaigns.
        </p>
      </div>

      {/* Error Banner */}
      {(pageError || pricingError || discountsError) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-danger/10 border border-danger/25 rounded-lg p-4 flex items-start gap-3"
        >
          <AlertCircle className="text-danger shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="font-manrope text-[14px] font-semibold text-danger mb-1">Error</p>
            <p className="font-manrope text-[13px] text-danger/80">
              {pageError ||
                pricingError?.message ||
                discountsError?.message ||
                "Failed to load data."}
            </p>
          </div>
          <button onClick={() => setPageError(null)}>
            <X size={18} className="text-danger" />
          </button>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="border-b border-white/08 mb-6 -mx-4 sm:mx-0">
        <div className="flex gap-6 px-4 sm:px-0">
          {[
            { id: "pricing", label: "Pricing & Packages" },
            { id: "discounts", label: "Discount Campaigns" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 font-manrope text-[15px] font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-accent text-accent"
                  : "border-transparent text-white/40 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Pricing Tab ── */}
      {activeTab === "pricing" && (
        <div className="bg-surface rounded-xl border border-white/08 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-white/08">
            <h2 className="font-manrope text-[16px] font-bold text-white">
              Tier Pricing Configuration
            </h2>
            <p className="font-manrope text-[13px] text-white/50 mt-1">
              Click Edit on any row to update pricing. Changes take effect immediately for new subscribers.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/05 border-b border-white/08">
                  {["Tier", "Billing Cycle", "Price (NGN)", "Generations / Month", "Priority Support", "Description", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left font-manrope text-[12px] font-semibold text-white/40 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {pricing.length > 0 ? (
                  pricing.map((config) => (
                    <PricingRow
                      key={config.id}
                      config={config}
                      onSave={handleUpdatePricing}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center font-manrope text-[14px] text-white/40">
                      No pricing data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Discounts Tab ── */}
      {activeTab === "discounts" && (
        <div className="space-y-4">
          {/* Discount Table Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter */}
            <div className="flex items-center gap-2">
              {["all", "active", "scheduled", "expired"].map((f) => (
                <button
                  key={f}
                  onClick={() => setDiscountFilter(f)}
                  className={`px-3 py-1.5 rounded-lg font-manrope text-[13px] font-semibold capitalize transition-colors ${
                    discountFilter === f
                      ? "text-white"
                      : "border border-white/10 text-white/50 hover:bg-white/05"
                  }`}
                  style={
                    discountFilter === f
                      ? { background: "linear-gradient(135deg, var(--color-accent-solid) 0%, var(--color-accent-solid-dim) 100%)" }
                      : undefined
                  }
                >
                  {f}
                </button>
              ))}
            </div>

            {/* New Discount */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-manrope text-[13px] font-semibold text-white transition-opacity"
              style={{ background: "linear-gradient(135deg, var(--color-accent-solid) 0%, var(--color-accent-solid-dim) 100%)" }}
            >
              <Plus size={16} />
              New Discount
            </motion.button>
          </div>

          <div className="bg-surface rounded-xl border border-white/08 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/05 border-b border-white/08">
                    {["Campaign", "Tier", "Billing", "Value", "Date Range", "Promo Code", "Redemptions", "Status", ""].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left font-manrope text-[12px] font-semibold text-white/40 uppercase tracking-wider whitespace-nowrap"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {discounts.length > 0 ? (
                    discounts.map((d) => (
                      <DiscountRow
                        key={d.id}
                        discount={d}
                        onDeactivate={(id) => deleteDiscount(id)}
                        isDeactivating={isDeactivating && deactivatingId === d.id}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-12 text-center font-manrope text-[14px] text-white/40">
                        No discount campaigns found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create Discount Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateDiscountModal
            onClose={() => setShowCreateModal(false)}
            onCreate={createDiscount}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
