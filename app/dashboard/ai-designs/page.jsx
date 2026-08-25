// app/dashboard/ai-designs/page.jsx
"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { Wand2 } from "lucide-react";

import DashboardLayout from "@/components/shared/dashboard/layout";
import DesignsFilters from "@/components/shared/dashboard/designs/filters";
import DesignsGrid from "@/components/shared/dashboard/designs/grid";
import SubscriptionPanel from "@/components/shared/dashboard/designs/subscription-panel";
import { useDesigns } from "@/hooks/use-designs";

/** The studio lives outside the dashboard shell — see app/ziora/studio/layout.jsx.
 *  /dashboard/ai-designs/new redirects here for links already in the wild. */
const CREATE_HREF = "/ziora/studio";

const DEFAULT_FILTERS = {
  search: "",
  roomType: "all",
  sortBy: "newest",
  view: "grid",
};

/** Rows per page. Two full rows at the widest (4-column) breakpoint. */
const PAGE_SIZE = 8;

export default function DesignsPage() {
  const [filters, setFiltersState] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  // Any filter change restarts at page 1 — page 3 of "all designs" is not a
  // page of "bathrooms". `view` is purely presentational and keeps the page.
  const setFilters = (update) => {
    setFiltersState((prev) => {
      const next = typeof update === "function" ? update(prev) : update;
      if (
        next.roomType !== prev.roomType ||
        next.search !== prev.search ||
        next.sortBy !== prev.sortBy
      ) {
        setPage(1);
      }
      return next;
    });
  };

  // `isPending`, not `isLoading`: the query is gated on the session, and while
  // the session resolves it is pending-but-idle. `isLoading` is false then,
  // which would flash the "no designs yet" pitch at every signed-in user.
  const { data, isPending, isError, refetch } = useDesigns({
    ...filters,
    page,
    limit: PAGE_SIZE,
  });
  const designs = data?.designs;
  const pagination = data?.pagination;

  // `sortBy` and `view` reorder or restyle the same set, so they are not
  // filters — narrowing is what decides whether an empty result is a dead end.
  const hasActiveFilters = filters.roomType !== "all" || filters.search !== "";

  // Total across all pages, not the length of this one.
  const count = pagination?.total ?? designs?.length ?? 0;

  // A room-type tab strip and a sort dropdown above a single design is furniture
  // for a gallery that does not exist yet. Shown once there is something to sort
  // — or whenever a filter is on, so the user can always undo one.
  const showFilters = hasActiveFilters || count > 3;

  return (
    <DashboardLayout>
      <div className="w-full space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col gap-4 border-b border-white/08 pb-6 sm:flex-row sm:items-start sm:justify-between"
        >
          <div>
            <h1 className="text-[28px] font-semibold leading-tight text-white md:text-[32px]">
              My Ziora Designs
            </h1>
            <p className="mt-1.5 max-w-2xl text-[15px] text-white/45">
              {count > 0
                ? `${count} ${count === 1 ? "design" : "designs"} in your gallery.`
                : "Every space you render with Ziora is saved here."}
            </p>
          </div>

          <Link
            href={CREATE_HREF}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 self-start rounded-xl px-5 text-[14px] font-semibold text-black transition-all hover:opacity-90 active:scale-[0.98] sm:self-auto"
            style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
          >
            <Wand2 className="h-4 w-4" strokeWidth={2} />
            Create New Design
          </Link>
        </motion.div>

        <SubscriptionPanel />

        {showFilters && <DesignsFilters filters={filters} setFilters={setFilters} />}

        <DesignsGrid
          designs={designs}
          pagination={pagination}
          onPageChange={setPage}
          isLoading={isPending}
          isError={isError}
          view={filters.view}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={() => setFilters(DEFAULT_FILTERS)}
          onRetry={refetch}
        />
      </div>
    </DashboardLayout>
  );
}
