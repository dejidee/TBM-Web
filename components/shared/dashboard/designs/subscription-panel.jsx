"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Star,
  Crown,
  Zap,
  ArrowUpRight,
  RefreshCw,
  CreditCard,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useSubscriptionState, useRenewSubscription } from "@/hooks/use-subscription";
import CancelModal from "./cancel-modal";

// ── Status badge ──────────────────────────────────────────────────────────

function StatusBadge({ status, quotaExhausted }) {
  if (quotaExhausted)
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-900/30 text-orange-400">
        Quota Used
      </span>
    );

  const map = {
    active: "bg-green-900/30 text-green-400",
    expired: "bg-red-900/20 text-red-400",
    canceled: "bg-yellow-900/20 text-yellow-400",
    paused: "bg-red-900/20 text-red-400",
  };

  const label = {
    active: "Active",
    expired: "Expired",
    canceled: "Canceled",
    paused: "Paused",
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${map[status] ?? "bg-white/06 text-white/40"}`}>
      {label[status] ?? status}
    </span>
  );
}

// ── Tier icon ─────────────────────────────────────────────────────────────

function TierIcon({ tier }) {
  if (tier === "luxury") return <Crown className="w-5 h-5 text-purple-400" />;
  if (tier === "premium") return <Star className="w-5 h-5 text-blue-400" />;
  return <Zap className="w-5 h-5 text-white/40" />;
}

function tierLabel(tier) {
  if (tier === "luxury") return "Luxury";
  if (tier === "premium") return "Premium";
  if (tier === "economy") return "Economy — Free";
  return "No Plan";
}

function tierChipStyle(tier) {
  if (tier === "luxury") return { background: "rgba(168,85,247,0.15)", color: "#c084fc" };
  if (tier === "premium") return { background: "rgba(59,130,246,0.15)", color: "#93c5fd" };
  return { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.40)" };
}

// ── Quota progress bar ────────────────────────────────────────────────────

function QuotaBar({ used, allowed }) {
  if (allowed === null) {
    return (
      <div className="flex items-center gap-2 text-sm text-purple-400 font-medium">
        <Crown className="w-4 h-4" /> Unlimited generations
      </div>
    );
  }
  const pct = Math.min((used / allowed) * 100, 100);
  const isHigh = pct >= 80;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/40">Generations this period</span>
        <span className="font-semibold" style={{ color: isHigh ? "#fb923c" : "#D4AF37" }}>
          {used} / {allowed}
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{
            background: isHigh
              ? "linear-gradient(90deg, #f97316, #ea580c)"
              : "linear-gradient(90deg, #D4AF37, #b8962e)",
          }}
        />
      </div>
    </div>
  );
}

// ── Format date ───────────────────────────────────────────────────────────

function fmt(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// ── Main panel ────────────────────────────────────────────────────────────

export default function SubscriptionPanel() {
  const [showCancelModal, setShowCancelModal] = useState(false);

  const {
    sub,
    tier,
    status,
    isActive,
    isExpired,
    isCanceled,
    isPaused,
    isEconomy,
    isPremium,
    isLuxury,
    generationsUsed,
    generationsAllowed,
    quotaExhausted,
    noSubscription,
    isLoading,
    isError,
  } = useSubscriptionState();

  const renew = useRenewSubscription();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/08 p-6" style={{ background: "#0d0b08" }}>
        <div className="space-y-3 animate-pulse">
          <div className="h-5 w-40 bg-white/06 rounded" />
          <div className="h-4 w-28 bg-white/06 rounded" />
          <div className="h-8 bg-white/06 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="rounded-2xl border p-6 flex items-center gap-3 text-red-400 text-sm"
        style={{ background: "rgba(239,68,68,0.05)", borderColor: "rgba(239,68,68,0.20)" }}
      >
        <AlertCircle className="w-5 h-5 shrink-0" />
        Unable to load subscription status. Please refresh.
      </div>
    );
  }

  // A single row, not a panel. This was a centred, dashed, 200px-tall box with
  // an icon — it took the top third of the designs page to say that a setting
  // is unset. Plan state is a status line, and it should never outweigh the
  // gallery it sits above.
  if (noSubscription) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border border-white/08 px-5 py-4"
        style={{ background: "#0d0b08" }}
      >
        <Zap className="h-4.5 w-4.5 shrink-0 text-white/30" strokeWidth={1.75} />
        <p className="text-sm text-white/50">
          <span className="font-semibold text-white">No active plan.</span> Activate the free
          Economy tier to start generating.
        </p>
        <Link
          href="/ziora#pricing"
          className="ml-auto inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-[#D4AF37]/30 px-4 text-[13px] font-semibold text-[#D4AF37] transition-colors hover:bg-[#D4AF37]/08"
        >
          View plans <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
        </Link>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/08 p-6 space-y-5"
        style={{ background: "#0d0b08" }}
      >
        {/* Top row — tier + status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <TierIcon tier={tier} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={tierChipStyle(tier)}
                >
                  {tierLabel(tier)}
                </span>
                <StatusBadge status={status} quotaExhausted={quotaExhausted} />
              </div>
              {sub?.billingCycle && (
                <p className="text-xs text-white/30 mt-0.5 capitalize">{sub.billingCycle} billing</p>
              )}
            </div>
          </div>
        </div>

        {/* Renewal / access info */}
        {isActive && sub?.periodEnd && !quotaExhausted && (
          <p className="text-sm text-white/40">
            Renews on <span className="font-semibold text-[#D4AF37]">{fmt(sub.periodEnd)}</span>
          </p>
        )}

        {isCanceled && sub?.accessUntil && (
          <div
            className="rounded-xl px-4 py-3 text-sm text-amber-300"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.20)" }}
          >
            Active until <span className="font-bold">{fmt(sub.accessUntil)}</span>
          </div>
        )}

        {isExpired && sub?.periodEnd && (
          <div
            className="rounded-xl px-4 py-3 text-sm text-red-400"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.20)" }}
          >
            Access ended on <span className="font-bold">{fmt(sub.periodEnd)}</span>
          </div>
        )}

        {isPaused && (
          <div
            className="rounded-xl px-4 py-3 text-sm text-red-400 flex items-start gap-2"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.20)" }}
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            We couldn&apos;t renew your subscription. Please update your payment method.
          </div>
        )}

        {/* Quota progress */}
        {isActive && <QuotaBar used={generationsUsed} allowed={generationsAllowed} />}

        {/* Economy exhausted message */}
        {isEconomy && quotaExhausted && (
          <p className="text-sm text-white/40">You have used your one free generation.</p>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 pt-1">
          {/* Upgrade CTA — economy, exhausted, expired */}
          {(isEconomy || isExpired || quotaExhausted) && (
            <Link
              href="/ziora#pricing"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-black hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
            >
              Upgrade Now <ArrowUpRight className="w-4 h-4" />
            </Link>
          )}

          {/* Upgrade from Premium to Luxury */}
          {isPremium && isActive && (
            <Link
              href="/ziora#pricing"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              style={{ border: "1px solid rgba(168,85,247,0.30)", color: "#c084fc" }}
            >
              <Crown className="w-4 h-4" /> Upgrade to Luxury
            </Link>
          )}

          {/* Reactivate — canceled within access period */}
          {isCanceled && (
            <button
              onClick={() => renew.mutate()}
              disabled={renew.isPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-black hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
            >
              {renew.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Reactivate
            </button>
          )}

          {/* Renew — expired */}
          {isExpired && (
            <button
              onClick={() => renew.mutate()}
              disabled={renew.isPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-black hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
            >
              {renew.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Renew Plan
            </button>
          )}

          {/* Update payment — paused */}
          {isPaused && (
            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">
              <CreditCard className="w-4 h-4" /> Update Payment Method
            </button>
          )}

          {/* Cancel — active paid only */}
          {isActive && (isPremium || isLuxury) && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors text-red-400 hover:bg-red-900/20"
              style={{ border: "1px solid rgba(239,68,68,0.25)" }}
            >
              Cancel Subscription
            </button>
          )}
        </div>

        {renew.isError && (
          <p className="text-red-400 text-xs">
            {renew.error?.message || "Renewal failed. Please try again."}
          </p>
        )}
      </motion.div>

      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        accessUntil={sub?.periodEnd}
      />
    </>
  );
}
