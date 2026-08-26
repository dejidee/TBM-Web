// app/dashboard/page.jsx
"use client";

import { motion } from "framer-motion";

import ActionCards from "@/components/shared/dashboard/action-cards";
import Consultations from "@/components/shared/dashboard/consulations";
import ContinueBand from "@/components/shared/dashboard/continue-band";
import GettingStarted from "@/components/shared/dashboard/getting-started";
import DashboardLayout from "@/components/shared/dashboard/layout";
import MarketplaceRow from "@/components/shared/dashboard/marketplace-row";
import RecentOrder from "@/components/shared/dashboard/recent-order";
import SavedItems from "@/components/shared/dashboard/saved-items";
import {
  useConsultations,
  useDashboardUser,
  useLatestDesign,
  useRecentOrder,
  useSavedItems,
} from "@/hooks/use-user-dashboard";

/**
 * The Overview.
 *
 * Every section here used to be keyed to something the user *owns* — a recent
 * order, a design, a consultation, saved items — so anyone who had not yet
 * bought or built anything got a page that reported absence four times and
 * offered no way out of it. The screen a user sees most often was the screen
 * that gave them the least.
 *
 * The order is now what a person actually needs, in that order:
 *
 *   1. What did I just do, and what do I do with it   → ContinueBand
 *   2. What else can I do right now                   → ActionCards
 *   3. What is happening with my money and my time    → order / consultation
 *   4. What can I buy                                 → MarketplaceRow
 *   5. What did I put aside                           → SavedItems
 *
 * Only (1), (2) and (4) are unconditional, and (4) reads from the public
 * catalogue — so the page is full for a user who has done nothing at all, and
 * the two commercial paths (materials, consultation) are reachable from the top
 * of it in one click no matter which state the account is in.
 */

/** Local hour → greeting. Cheap, and it is the difference between a page that
 *  knows who is reading it and a page with the word "Dashboard" at the top. */
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function toArray(raw) {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.items)) return raw.items;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
}

export default function DashboardPage() {
  const { user } = useDashboardUser();

  const { data: order, isLoading: orderLoading } = useRecentOrder();
  const { data: design, isLoading: designLoading } = useLatestDesign();
  const { data: consultations, isLoading: consultationsLoading } = useConsultations();
  const { data: saved, isLoading: savedLoading } = useSavedItems();

  const isLoading = orderLoading || designLoading || consultationsLoading || savedLoading;

  const hasOrder = Boolean(order) && order.hasOrder !== false;
  const hasDesign = Boolean(design) && design.hasDesign !== false;
  const hasConsultation = Boolean(consultations?.upcoming);
  const hasSaved = toArray(saved).length > 0;

  // Modules for things in flight. Rendered only when they carry something —
  // "No recent orders" in a bordered box is not a status, it is a blank.
  const modules = [
    hasOrder && <RecentOrder key="order" />,
    hasConsultation && <Consultations key="consultations" />,
  ].filter(Boolean);

  const subline = hasDesign
    ? "Your last render is ready to turn into a real room."
    : hasOrder || hasConsultation
      ? "Here is where your projects stand today."
      : "Your account is ready — here is where to begin.";

  return (
    <DashboardLayout>
      <div className="w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <h1 className="text-[28px] font-semibold leading-tight text-white md:text-[32px]">
            {greeting()}
            {user?.firstName ? `, ${user.firstName}` : ""}.
          </h1>
          <p className="mt-1.5 text-[15px] text-white/45">{isLoading ? " " : subline}</p>
        </motion.div>

        {isLoading ? (
          <OverviewSkeleton />
        ) : (
          <>
            {/* The hand-off, or the first step if there is nothing to hand off. */}
            {hasDesign ? <ContinueBand design={design} /> : <GettingStarted />}

            {/* GettingStarted already spells these three out as numbered steps;
                repeating them directly underneath would be the same page twice. */}
            {hasDesign && <ActionCards />}

            {modules.length > 0 && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">{modules}</div>
            )}

            <MarketplaceRow />

            {hasSaved && <SavedItems />}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

/** Shaped like the real layout — a wide band, a launcher row, then a product
 *  grid — so the page does not reflow when the queries land. */
function OverviewSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-72 animate-pulse rounded-3xl bg-white/05" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-17 animate-pulse rounded-2xl bg-white/05" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="aspect-4/5 animate-pulse bg-white/05" />
        ))}
      </div>
    </div>
  );
}
