// components/shared/dashboard/plan-card.jsx
"use client";

import Link from "next/link";
import { Crown, Wand2 } from "lucide-react";

import { useSubscriptionState } from "@/hooks/use-subscription";

/**
 * The sidebar's plan block — the same slot the "Go Pro?" card occupied.
 *
 * That card said "Get unlimited AI renders and priority support" to everyone,
 * forever: to a user with no plan who did not know a free tier existed, and to
 * a paying user who wanted to know how many generations were left. It was the
 * only persistent thing in the sidebar and it knew nothing about the account.
 *
 * The number that matters is the quota, and the user needs it *before* they
 * open the studio — otherwise they compose a prompt, upload a room, and learn
 * at the Generate button that they had nothing left.
 */
export default function PlanCard() {
  const {
    tier,
    isActive,
    isLuxury,
    generationsUsed,
    generationsAllowed,
    quotaExhausted,
    noSubscription,
    isLoading,
  } = useSubscriptionState();

  if (isLoading) {
    return (
      <div className="p-3">
        <div className="h-32 animate-pulse rounded-2xl bg-white/05" />
      </div>
    );
  }

  // ── No plan: name the free tier. "Go Pro" buried the fact that the first
  //    render costs nothing, which is the only offer likely to convert here.
  if (noSubscription) {
    return (
      <Shell>
        <IconBadge>
          <Wand2 className="h-5 w-5 text-[#D4AF37]" strokeWidth={1.75} />
        </IconBadge>
        <h3 className="text-[15px] font-semibold text-white">Your first render is free</h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-white/45">
          Activate the Economy tier and see a room redesigned — no card needed.
        </p>
        <Cta href="/ziora#pricing">View plans</Cta>
      </Shell>
    );
  }

  const unlimited = generationsAllowed == null;
  const left = unlimited ? null : Math.max(0, generationsAllowed - (generationsUsed ?? 0));
  const pct = unlimited ? 100 : Math.min(100, ((generationsUsed ?? 0) / generationsAllowed) * 100);

  return (
    <Shell>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
          {tier ?? "Plan"}
        </span>
        {isLuxury && <Crown className="h-4 w-4 text-purple-400" strokeWidth={1.75} />}
      </div>

      {unlimited ? (
        <p className="mt-3 text-[15px] font-semibold text-white">Unlimited renders</p>
      ) : (
        <>
          <p className="mt-3 text-[15px] font-semibold text-white">
            {left} render{left === 1 ? "" : "s"} left
          </p>
          <div
            className="mt-3 h-1.5 overflow-hidden rounded-full"
            style={{ background: "rgba(255,255,255,0.07)" }}
          >
            <div
              className="h-full rounded-full transition-[width] duration-700"
              style={{
                width: `${pct}%`,
                background: quotaExhausted
                  ? "linear-gradient(90deg,#f97316,#ea580c)"
                  : "linear-gradient(90deg,#D4AF37,#b8962e)",
              }}
            />
          </div>
          <p className="mt-2 text-[12px] text-white/30">
            {generationsUsed ?? 0} of {generationsAllowed} used
          </p>
        </>
      )}

      {/* Nothing to sell on the top tier, and nothing to upsell mid-period to a
          user who still has renders left and an active plan. */}
      {!isLuxury && (quotaExhausted || !isActive) && (
        <Cta href="/ziora#pricing">{quotaExhausted ? "Get more renders" : "Renew plan"}</Cta>
      )}
      {!isLuxury && isActive && !quotaExhausted && (
        <Link
          href="/ziora#pricing"
          className="mt-4 block text-[12.5px] font-medium text-white/40 transition-colors hover:text-[#D4AF37]"
        >
          Compare plans
        </Link>
      )}
    </Shell>
  );
}

/* ── bits ─────────────────────────────────────────────────────────── */

function Shell({ children }) {
  return (
    <div className="p-3">
      <div
        className="rounded-2xl p-5"
        style={{
          background: "rgba(212,175,55,0.05)",
          boxShadow: "0 0 0 1px rgba(212,175,55,0.14)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function IconBadge({ children }) {
  return (
    <div
      className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
      style={{ background: "rgba(212,175,55,0.12)" }}
    >
      {children}
    </div>
  );
}

function Cta({ href, children }) {
  return (
    <Link
      href={href}
      className="mt-4 flex min-h-11 w-full items-center justify-center rounded-xl px-4 text-[14px] font-semibold text-black transition-opacity hover:opacity-90"
      style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
    >
      {children}
    </Link>
  );
}
