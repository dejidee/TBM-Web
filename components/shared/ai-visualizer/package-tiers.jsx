"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Star,
  Zap,
  Crown,
  AlertCircle,
  Loader2,
  RefreshCw,
  BadgeCheck,
  CalendarClock,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { usePricing } from "@/hooks/use-pricing";
import { enter, RISE } from "@/lib/theme/motion";
import { useSession } from "@/hooks/use-session";
import {
  useSubscriptionState,
  useActivateEconomy,
  useSubscribePaid,
  useCancelSubscription,
  useRenewSubscription,
} from "@/hooks/use-subscription";
import CancelModal from "@/components/shared/dashboard/designs/cancel-modal";

// ── Helpers ───────────────────────────────────────────────────────────────

function fmt(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Returns the state of a tier card relative to the user's subscription.
 * "current-active" | "current-canceled" | "current-expired" | "current-paused"
 * | "has-other-active" | "none"
 */
function resolveTierState(
  tierId,
  sub,
  status,
  isActive,
  isCanceled,
  isExpired,
  isPaused,
) {
  if (!sub) return "none";
  const isCurrentTier = sub.tier === tierId;
  if (isCurrentTier) {
    if (isActive) return "current-active";
    if (isCanceled) return "current-canceled";
    if (isExpired) return "current-expired";
    if (isPaused) return "current-paused";
  }
  if (isActive) return "has-other-active";
  return "none";
}

// ── Price skeleton ────────────────────────────────────────────────────────

function PriceSkeleton() {
  return (
    <div className="space-y-2 mt-4">
      <div className="h-9 w-32 bg-white/06 animate-pulse" />
      <div className="h-4 w-40 bg-white/06 animate-pulse" />
    </div>
  );
}

// ── Tier price block ──────────────────────────────────────────────────────

function TierPrice({ tier, billing, pricing, discount }) {
  const textMuted = "text-white/50";
  const textMain = "text-white";

  // Economy is always free
  if (tier === "economy") {
    return (
      <div className="mt-4">
        <span className={`text-4xl font-extrabold ${textMain}`}>Free</span>
        <span className={`text-sm ${textMuted} ml-1 font-manrope`}>
          forever
        </span>
      </div>
    );
  }

  const data = pricing?.[tier];
  if (!data) return <PriceSkeleton />;

  const isYearly = billing === "yearly";
  const basePrice = isYearly ? data.yearlyMonthlyEquiv : data.monthlyPrice;
  const annualTotal = data.annualPrice;

  const activeDiscount =
    discount &&
    discount.isActive &&
    (discount.tier === null || discount.tier === tier) &&
    (discount.billingCycle === null || discount.billingCycle === billing)
      ? discount
      : null;

  const discountedPrice = activeDiscount
    ? isYearly
      ? (data.discountedYearlyMonthlyEquiv ?? null)
      : (data.discountedMonthlyPrice ?? null)
    : null;

  return (
    <div className="mt-4">
      {activeDiscount && (
        <span
          className="inline-block mb-2 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide font-manrope"
          style={{ background: "rgba(212,175,55,0.12)", color: "#D4AF37" }}
        >
          {activeDiscount.displayLabel || "Limited Offer"}
        </span>
      )}
      <div className="flex items-end gap-2">
        {activeDiscount && discountedPrice != null ? (
          <>
            <span className={`text-4xl font-extrabold ${textMain}`}>
              ₦
              {Number(discountedPrice).toLocaleString("en-NG", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className={`text-sm ${textMuted} line-through mb-1.5`}>
              ₦
              {Number(basePrice).toLocaleString("en-NG", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </>
        ) : (
          <span className={`text-4xl font-extrabold ${textMain}`}>
            ₦
            {Number(basePrice).toLocaleString("en-NG", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        )}
        <span className={`text-sm ${textMuted} mb-1.5 font-manrope`}>/mo</span>
      </div>
      {isYearly && (
        <p className={`text-sm ${textMuted} mt-1 font-manrope`}>
          ₦
          {Number(annualTotal).toLocaleString("en-NG", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          billed annually
        </p>
      )}
      {activeDiscount?.endDate && (
        <p className="text-xs text-gold mt-1 font-medium font-manrope">
          Offer ends {new Date(activeDiscount.endDate).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

// ── Quota bar (shown on active card) ─────────────────────────────────────

function QuotaBar({ used, allowed }) {
  if (allowed === null) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-white/70 mt-4">
        <Crown className="w-3.5 h-3.5 text-gold" /> Unlimited generations
      </div>
    );
  }

  const pct = Math.min((used / allowed) * 100, 100);
  const isHigh = pct >= 80;
  const trackBg = "bg-white/10";
  const textColor = "text-white/70";
  const countColor = isHigh ? "text-orange-400" : "text-white";

  return (
    <div className="mt-4 space-y-1.5">
      <div
        className={`flex items-center justify-between text-xs ${textColor} font-manrope`}
      >
        <span>Generations used</span>
        <span className={`font-bold ${countColor}`}>
          {used} / {allowed}
        </span>
      </div>
      <div className={`h-1.5 ${trackBg} overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full"
          style={
            isHigh
              ? { background: "#fb923c" }
              : {
                  background:
                    "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)",
                }
          }
        />
      </div>
      {isHigh && (
        <p className="text-[11px] text-orange-400 font-manrope">
          Running low — consider upgrading.
        </p>
      )}
    </div>
  );
}

// ── Tier definitions ──────────────────────────────────────────────────────

const TIERS = [
  {
    id: "economy",
    label: "Economy",
    tagline: "Try it before you commit",
    icon: Zap,
    dark: false,
    badge: null,
    features: [
      "5 AI generations/month",
      "Standard quality renders",
      "Nigerian materials context",
      "Email support",
    ],
  },
  {
    id: "premium",
    label: "Premium",
    tagline: "More designs, more control",
    icon: Star,
    dark: true,
    badge: "Most Popular",
    features: [
      "50 generations per billing period",
      "Multiple style variations",
      "Style selection control",
      "Basic cost range estimate — Coming Soon",
      "Priority rendering queue",
    ],
  },
  {
    id: "luxury",
    label: "Luxury",
    tagline: "From vision to execution",
    icon: Crown,
    dark: false,
    badge: "Full Access",
    features: [
      "Unlimited generations",
      "Full material mapping (BOQ) — Coming Soon",
      "Detailed cost breakdown — Coming Soon",
      "Start Project with TBM — Coming Soon",
      "Buy Bathroom Vanities via Bogat — Coming Soon",
      "Execution-ready output",
    ],
  },
];

// ── Switch plan confirmation modal ────────────────────────────────────────

function SwitchPlanModal({
  isOpen,
  fromTier,
  toTier,
  accessUntil,
  onConfirm,
  onClose,
  isBusy,
  error,
}) {
  const accessDate = accessUntil
    ? new Date(accessUntil).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="sw-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50"
            onClick={() => !isBusy && onClose()}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              key="sw-modal"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-md overflow-hidden font-manrope border border-z-line"
              style={{
                background: "var(--color-z-panel)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 pt-6 pb-2 border-b border-z-line">
                <h2 className="text-lg font-bold text-white">
                  Switch to {capitalize(toTier)}?
                </h2>
                <p className="text-white/70 text-sm mt-1 mb-4 font-manrope">
                  You currently have an active{" "}
                  <span className="text-white/70 font-semibold">
                    {capitalize(fromTier)}
                  </span>{" "}
                  plan.
                </p>
              </div>

              <div className="px-6 py-5 space-y-4">
                {/* What this means */}
                <div
                  className="p-4 border text-sm space-y-2 font-manrope"
                  style={{
                    background: "rgba(245,158,11,0.06)",
                    borderColor: "rgba(245,158,11,0.20)",
                  }}
                >
                  <p className="font-semibold text-amber-400">
                    What happens when you switch:
                  </p>
                  <ul className="space-y-1.5 text-white/70">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">•</span>
                      Your{" "}
                      <span className="text-white font-medium">
                        {capitalize(fromTier)}
                      </span>{" "}
                      plan will be canceled immediately.
                    </li>
                    {accessDate && (
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">•</span>
                        You had access until{" "}
                        <span className="text-white font-medium">
                          {accessDate}
                        </span>
                        . No refund is issued for unused time.
                      </li>
                    )}
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">•</span>
                      You&apos;ll be taken to payment to activate{" "}
                      <span className="text-white font-medium">
                        {capitalize(toTier)}
                      </span>
                      .
                    </li>
                  </ul>
                </div>

                {error && (
                  <p className="text-sm text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  </p>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={onClose}
                    disabled={isBusy}
                    className="flex-1 py-3 text-sm font-semibold text-white/50 border border-z-line hover:bg-white/05 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Keep My Plan
                  </button>
                  <button
                    onClick={onConfirm}
                    disabled={isBusy}
                    className="flex-1 py-3 text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                    style={{
                      background: "linear-gradient(180deg, #E8C230 0%, #B8940A 100%)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.22), 0 0 18px rgba(212,175,55,0.28)",
                    }}
                  >
                    {isBusy && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isBusy
                      ? "Processing…"
                      : `Cancel & Switch to ${capitalize(toTier)}`}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Main component ────────────────────────────────────────────────────────

export default function PackageTiers({ id, onSubscribed }) {
  const [billing, setBilling] = useState("monthly");
  const [pendingTier, setPendingTier] = useState(null);
  const [ctaError, setCtaError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [switchTarget, setSwitchTarget] = useState(null); // tier id to switch to
  const [switchError, setSwitchError] = useState(null);
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoStatus, setPromoStatus] = useState(null); // "applied" | "invalid" | null

  const router = useRouter();
  // Signed-in-ness only — no profile field is read here, so this must come from
  // the session, not the profile. useCurrentUser() resolves a beat later, and in
  // that gap a signed-in user who clicks a plan gets bounced to /sign-in.
  const { isAuthenticated } = useSession();
  const {
    data: pricingData,
    isLoading: priceLoading,
    isError: priceError,
  } = usePricing(appliedPromo);

  const {
    sub,
    tier: currentTier,
    status,
    isActive,
    isCanceled,
    isExpired,
    isPaused,
    generationsUsed,
    generationsAllowed,
    isLoading: subLoading,
  } = useSubscriptionState();

  const activateEconomy = useActivateEconomy();
  const subscribePaid = useSubscribePaid();
  const cancelSub = useCancelSubscription();
  const renew = useRenewSubscription();

  const pricing = pricingData
    ? {
        economy: pricingData.economy,
        premium: pricingData.premium,
        luxury: pricingData.luxury,
      }
    : null;
  const activeDiscount = pricingData?.activeDiscount ?? null;
  const yearlyDiscountPct =
    pricingData?.premium?.yearlyDiscountPct ??
    pricingData?.luxury?.yearlyDiscountPct ??
    null;

  const TIER_ENUM = { economy: 0, premium: 1, luxury: 2 };
  const CYCLE_ENUM = { monthly: 0, yearly: 1 };

  // Detect whether the applied promo code returned a valid discount
  useEffect(() => {
    if (!appliedPromo) return;
    if (priceLoading) return;
    setPromoStatus(pricingData?.activeDiscount ? "applied" : "invalid");
  }, [appliedPromo, pricingData, priceLoading]);

  const handleApplyPromo = () => {
    const code = promoInput.trim();
    if (!code) return;
    setPromoStatus(null);
    setAppliedPromo(code);
  };

  const handleRemovePromo = () => {
    setPromoInput("");
    setAppliedPromo(null);
    setPromoStatus(null);
  };

  const handleSubscribe = async (tierId) => {
    setCtaError(null);
    if (!isAuthenticated) {
      router.push(`/sign-in?from=${encodeURIComponent("/ziora#pricing")}`);
      return;
    }
    setPendingTier(tierId);
    try {
      if (tierId === "economy") {
        await activateEconomy.mutateAsync({ cycle: CYCLE_ENUM[billing] });
      } else {
        await subscribePaid.mutateAsync({
          tier: TIER_ENUM[tierId],
          cycle: CYCLE_ENUM[billing],
          callbackUrl: `${window.location.origin}/ziora?subscription=success`,
          ...(appliedPromo && { promoCode: appliedPromo }),
        });
      }
      onSubscribed?.(tierId);
    } catch (err) {
      setCtaError(err.message || "Something went wrong. Please try again.");
    } finally {
      setPendingTier(null);
    }
  };

  const handleRenew = async () => {
    setCtaError(null);
    try {
      await renew.mutateAsync();
    } catch (err) {
      setCtaError(err.message || "Renewal failed. Please try again.");
    }
  };

  const handleConfirmSwitch = async () => {
    if (!switchTarget) return;
    setSwitchError(null);
    try {
      await cancelSub.mutateAsync({});
      await subscribePaid.mutateAsync({
        tier: TIER_ENUM[switchTarget],
        cycle: CYCLE_ENUM[billing],
        callbackUrl: `${window.location.origin}/ziora?subscription=success`,
        ...(appliedPromo && { promoCode: appliedPromo }),
      });
      setSwitchTarget(null);
      onSubscribed?.(switchTarget);
    } catch (err) {
      setSwitchError(err.message || "Something went wrong. Please try again.");
    }
  };

  const isSwitching = cancelSub.isPending || subscribePaid.isPending;
  const isSubmitting =
    activateEconomy.isPending ||
    subscribePaid.isPending ||
    cancelSub.isPending ||
    renew.isPending;

  return (
    <>
      <section
        id={id}
        className="bg-z-base py-16 sm:py-20 font-manrope scroll-mt-20"
      >
        {/* max-w-7xl, matching the hero and how-it-works. This was max-w-315
            (1260px) — 20px narrower than everything above it, which reads as a
            container that slipped rather than a deliberate step. */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ── Section header ───────────────────────────────────── */}
          <motion.div
            className="mb-12"
            initial={RISE}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={enter()}
          >
            {/* The Wand2 that used to sit here was the only section eyebrow on
                the page carrying an icon, at 12px beside letterspaced caps. */}
            <span className="z-eyebrow mb-4">Ziora Intelligence Plans</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight font-primary">
              {currentTier && isActive ? "Your Plan" : "Choose Your Plan"}
            </h2>
            <p className="text-white/70 text-base max-w-xl font-manrope">
              {currentTier && isActive
                ? "You're all set. Manage your subscription or upgrade below."
                : "Start free and upgrade when you're ready for deeper design power and full project execution."}
            </p>
          </motion.div>

          {/* ── Billing toggle (hide when user has active paid plan — cycle is locked) ── */}
          {!(isActive && currentTier && currentTier !== "economy") && (
            <motion.div
              className="flex items-center mb-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div
                className="inline-flex items-center gap-0 border p-1"
                style={{
                  background: "var(--color-z-panel)",
                  borderColor: "rgba(255,255,255,0.10)",
                }}
              >
                {["monthly", "yearly"].map((cycle) => (
                  <button
                    key={cycle}
                    onClick={() => setBilling(cycle)}
                    className="relative min-h-11 px-5 py-2 text-sm font-semibold transition-colors font-manrope text-black"
                    style={
                      billing === cycle
                        ? {
                            background:
                              "linear-gradient(180deg, #E8C230 0%, #B8940A 100%)",
                          }
                        : {
                            background: "transparent",
                            color: "rgba(255,255,255,0.40)",
                          }
                    }
                  >
                    {cycle === "monthly" ? "Monthly" : "Yearly"}
                    {cycle === "yearly" && yearlyDiscountPct != null && (
                      <span
                        className="ml-2 px-1.5 py-0.5 text-[16px] font-bold"
                        style={{
                          background: "rgba(212,175,55,0.15)",
                          color: "#D4AF37",
                        }}
                      >
                        Save {Math.round(yearlyDiscountPct)}%
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {isActive && currentTier && currentTier !== "economy" && (
                <p className="ml-4 text-xs text-white/50">
                  Billing cycle is locked to your current plan.
                </p>
              )}
            </motion.div>
          )}

          {/* ── Promo code ───────────────────────────────────────── */}
          {!(isActive && currentTier && currentTier !== "economy") && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              {!appliedPromo ? (
                <div className="flex items-center gap-2 max-w-xs">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                    placeholder="Promo code"
                    className="flex-1 px-3 py-2 text-sm bg-white/05 border border-z-line text-white placeholder-white/50 outline-none focus:border-gold/40 font-manrope"
                  />
                  <button
                    onClick={handleApplyPromo}
                    disabled={!promoInput.trim() || priceLoading}
                    className="min-h-11 px-4 py-2 text-sm font-semibold font-manrope text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
                    style={{
                      background: "linear-gradient(180deg, #E8C230 0%, #B8940A 100%)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2), 0 0 14px rgba(212,175,55,0.22)",
                    }}
                  >
                    Apply
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {promoStatus === "applied" && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 font-manrope">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      <span className="font-mono uppercase">
                        {appliedPromo}
                      </span>{" "}
                      applied
                    </span>
                  )}
                  {promoStatus === "invalid" && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-red-400 font-manrope">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span className="font-mono uppercase">
                        {appliedPromo}
                      </span>{" "}
                      — not valid or not applicable
                    </span>
                  )}
                  {promoStatus === null && (
                    <span className="text-xs text-white/50 font-manrope">
                      Checking…
                    </span>
                  )}
                  <button
                    onClick={handleRemovePromo}
                    className="inline-flex items-center min-h-11 text-xs text-white/50 hover:text-white underline font-manrope transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Errors ───────────────────────────────────────────── */}
          {priceError && (
            <div className="flex items-center gap-2 py-4 mb-6 text-red-500 text-sm font-manrope">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Unable to load pricing. Please refresh.
            </div>
          )}

          {ctaError && (
            <div
              className="flex items-start gap-3 p-4 mb-6 border font-manrope"
              style={{
                background: "rgba(245,158,11,0.08)",
                borderColor: "rgba(245,158,11,0.25)",
              }}
            >
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-400">{ctaError}</p>
            </div>
          )}

          {/* ── Tier cards ───────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-z-line">
            {TIERS.map((tier, i) => {
              const Icon = tier.icon;
              const isHidden =
                tier.id !== "economy" && pricingData
                  ? pricingData[tier.id]?.isActive === false
                  : false;
              if (isHidden) return null;

              const tierState = resolveTierState(
                tier.id,
                sub,
                status,
                isActive,
                isCanceled,
                isExpired,
                isPaused,
              );

              const isCurrentActive = tierState === "current-active";
              const isCurrentCanceled = tierState === "current-canceled";
              const isCurrentExpired = tierState === "current-expired";
              const isCurrentPaused = tierState === "current-paused";
              const hasOtherActive = tierState === "has-other-active";
              const isCurrent =
                isCurrentActive ||
                isCurrentCanceled ||
                isCurrentExpired ||
                isCurrentPaused;

              const isBusy = isSubmitting && pendingTier === tier.id;

              const cardBg = tier.dark ? "rgba(212,175,55,0.04)" : "var(--color-z-panel)";
              const cardBorder = tier.dark
                ? "rgba(212,175,55,0.20)"
                : "rgba(255,255,255,0.08)";
              const textMain = "text-white";
              const textMuted = "text-white/50";
              const divider = "border-z-line";
              const iconBorder = "border-z-line";

              // Outer ring for current plan
              const ringStyle = isCurrentActive
                ? {
                    outline: "2px solid rgba(212,175,55,0.50)",
                    outlineOffset: "-2px",
                  }
                : isCurrentCanceled
                  ? { outline: "2px solid #f59e0b", outlineOffset: "-2px" }
                  : isCurrentExpired || isCurrentPaused
                    ? {
                        outline: "2px solid rgba(239,68,68,0.60)",
                        outlineOffset: "-2px",
                      }
                    : {};

              return (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: i * 0.1 }}
                  className={`relative flex flex-col p-8 border ${hasOtherActive ? "opacity-60" : ""}`}
                  style={{
                    background: cardBg,
                    borderColor: cardBorder,
                    ...ringStyle,
                  }}
                >
                  {/* ── Top badges ── */}
                  <div className="absolute top-5 right-5 flex flex-col items-end gap-1.5">
                    {/* Current plan badge */}
                    {isCurrentActive && (
                      <span
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-black uppercase tracking-wide font-manrope"
                        style={{
                          background:
                            "linear-gradient(180deg, #E8C230 0%, #B8940A 100%)",
                        }}
                      >
                        <BadgeCheck className="w-3 h-3" /> Your Plan
                      </span>
                    )}
                    {isCurrentCanceled && (
                      <span className="px-2.5 py-1 text-[11px] font-bold bg-amber-400 text-white uppercase tracking-wide font-manrope">
                        Canceling
                      </span>
                    )}
                    {isCurrentExpired && (
                      <span className="px-2.5 py-1 text-[11px] font-bold bg-red-400 text-white uppercase tracking-wide font-manrope">
                        Expired
                      </span>
                    )}
                    {isCurrentPaused && (
                      <span className="px-2.5 py-1 text-[11px] font-bold bg-red-500 text-white uppercase tracking-wide font-manrope">
                        Paused
                      </span>
                    )}
                    {/* Regular tier badge — only show if not current plan */}
                    {!isCurrent && tier.badge && (
                      <span className="px-2.5 py-1 text-[11px] font-bold bg-gold text-white uppercase tracking-wide font-manrope">
                        {tier.badge}
                      </span>
                    )}
                  </div>

                  {/* Icon + title */}
                  <div
                    className={`w-10 h-10 border ${iconBorder} flex items-center justify-center mb-3`}
                    style={{ background: "rgba(212,175,55,0.06)" }}
                  >
                    <Icon className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <h3 className={`text-xl font-bold ${textMain} font-primary`}>
                    {tier.label}
                  </h3>
                  <p className={`text-sm ${textMuted} mt-0.5 font-manrope`}>
                    {tier.tagline}
                  </p>

                  {/* Price */}
                  {priceLoading && tier.id !== "economy" ? (
                    <PriceSkeleton />
                  ) : (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${tier.id}-${billing}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <TierPrice
                          tier={tier.id}
                          billing={billing}
                          pricing={pricing}
                          discount={activeDiscount}
                        />
                      </motion.div>
                    </AnimatePresence>
                  )}

                  {/* Quota bar — only on active current plan */}
                  {isCurrentActive && (
                    <QuotaBar
                      used={generationsUsed}
                      allowed={generationsAllowed}
                    />
                  )}

                  {/* Subscription status info */}
                  {isCurrentActive && sub?.endDate && (
                    <div
                      className={`flex items-center gap-1.5 mt-3 text-xs ${textMuted} font-manrope`}
                    >
                      <CalendarClock className="w-3.5 h-3.5 shrink-0" />
                      Renews {fmt(sub.endDate)}
                    </div>
                  )}

                  {isCurrentCanceled && sub?.endDate && (
                    <div className="flex items-center gap-1.5 mt-3 text-xs text-amber-600 font-manrope">
                      <CalendarClock className="w-3.5 h-3.5 shrink-0" />
                      Access until {fmt(sub.endDate)}
                    </div>
                  )}

                  {isCurrentExpired && sub?.endDate && (
                    <div className="flex items-center gap-1.5 mt-3 text-xs text-red-500 font-manrope">
                      <CalendarClock className="w-3.5 h-3.5 shrink-0" />
                      Expired {fmt(sub.endDate)}
                    </div>
                  )}

                  <div className={`my-6 border-t ${divider}`} />

                  {/* Features list */}
                  <ul className="flex-1 space-y-3">
                    {tier.features.map((f) => (
                      <li
                        key={f}
                        className={`flex items-start gap-2.5 text-sm ${textMuted} font-manrope`}
                      >
                        <Check className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* ── CTA area ── */}
                  <div className="mt-8 space-y-2">
                    {/* ACTIVE current plan */}
                    {isCurrentActive && (
                      <>
                        {/* Economy: no cancel — just a status indicator */}
                        {tier.id === "economy" ? (
                          <div
                            className={`w-full py-3 px-6 font-manrope font-semibold text-sm flex items-center justify-center gap-2 border ${divider} ${textMuted}`}
                          >
                            <BadgeCheck className="w-4 h-4" /> Active Plan
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowCancelModal(true)}
                            disabled={isSubmitting}
                            className="w-full py-3 px-6 font-manrope font-semibold text-sm transition-colors flex items-center justify-center gap-2 border border-red-500/30 text-red-400 hover:bg-red-900/20 disabled:opacity-40 disabled:cursor-not-allowed tracking-wide"
                          >
                            Cancel Plan
                          </button>
                        )}
                      </>
                    )}

                    {/* CANCELED current plan — reactivate */}
                    {isCurrentCanceled && (
                      <button
                        onClick={handleRenew}
                        disabled={renew.isPending}
                        className="w-full py-3 px-6 font-manrope font-semibold text-sm transition-colors flex items-center justify-center gap-2 bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed tracking-wide"
                      >
                        {renew.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                        Reactivate Plan
                      </button>
                    )}

                    {/* EXPIRED or PAUSED current plan — renew */}
                    {(isCurrentExpired || isCurrentPaused) && (
                      <button
                        onClick={handleRenew}
                        disabled={renew.isPending}
                        className="w-full py-3 px-6 font-manrope font-semibold text-sm transition-colors flex items-center justify-center gap-2 text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed tracking-wide"
                        style={{
                          background: "linear-gradient(180deg, #E8C230 0%, #B8940A 100%)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.22), 0 0 18px rgba(212,175,55,0.28)",
                        }}
                      >
                        {renew.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                        Renew Plan
                      </button>
                    )}

                    {/* HAS OTHER ACTIVE plan — open switch confirmation modal */}
                    {hasOtherActive && (
                      <button
                        onClick={() => {
                          setSwitchError(null);
                          setSwitchTarget(tier.id);
                        }}
                        disabled={isSubmitting || priceLoading || !!priceError}
                        className="w-full py-3 px-6 font-manrope font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed tracking-wide text-white hover:opacity-90 transition-opacity"
                        style={{
                          background: "linear-gradient(180deg, #E8C230 0%, #B8940A 100%)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.22), 0 0 18px rgba(212,175,55,0.28)",
                        }}
                      >
                        {`Switch to ${tier.label}`}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}

                    {/* NO subscription — normal CTA */}
                    {tierState === "none" && !subLoading && (
                      <button
                        onClick={() => handleSubscribe(tier.id)}
                        disabled={
                          isSubmitting ||
                          (tier.id !== "economy" &&
                            (priceLoading || !!priceError))
                        }
                        className="w-full py-3 px-6 font-manrope font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed tracking-wide text-white hover:opacity-90 transition-opacity"
                        style={{
                          background: "linear-gradient(180deg, #E8C230 0%, #B8940A 100%)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.22), 0 0 18px rgba(212,175,55,0.28)",
                        }}
                      >
                        {isBusy && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isBusy ? "Processing…" : `Choose ${tier.label}`}
                      </button>
                    )}

                    {/* Subscription loading skeleton for CTA */}
                    {subLoading && (
                      <div className="w-full h-11 bg-white/06 animate-pulse" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ── Footer note ──────────────────────────────────────── */}
          <motion.p
            className="text-sm text-white/50 mt-10 font-manrope"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            All plans include Nigerian materials context. Upgrade or cancel
            anytime. No credit card required for Economy.
          </motion.p>
        </div>
      </section>

      {/* Cancel modal — for canceling without switching */}
      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        accessUntil={sub?.endDate}
      />

      {/* Switch plan modal — cancel current then subscribe to new */}
      <SwitchPlanModal
        isOpen={!!switchTarget}
        fromTier={currentTier}
        toTier={switchTarget}
        accessUntil={sub?.endDate}
        onConfirm={handleConfirmSwitch}
        onClose={() => {
          if (!isSwitching) {
            setSwitchTarget(null);
            setSwitchError(null);
          }
        }}
        isBusy={isSwitching}
        error={switchError}
      />
    </>
  );
}
