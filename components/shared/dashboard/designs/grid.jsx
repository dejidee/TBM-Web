// components/dashboard/designs/DesignsGrid.jsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import DesignCard from "./card";
import DesignsEmptyState from "./empty-state";
import SectionEmpty from "@/components/shared/dashboard/section-empty";
import SectionError from "@/components/shared/dashboard/section-error";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

/**
 * The gallery.
 *
 * There is no "Create New" tile in the grid any more. The page header already
 * carries a permanent Create New Design button, so the dashed tile was a second
 * copy of the same action — and because it was appended to the item list it
 * also skewed the pagination maths (`designs.length + 1`) and reappeared on
 * whichever page it happened to land on.
 *
 * Pagination is the server's (`pagination` from GET /Designs). It used to be
 * sliced client-side from a single fetch — which, with the backend's default
 * page of 10, meant a gallery could never show an eleventh design.
 */
export default function DesignsGrid({
  designs,
  pagination,
  onPageChange,
  isLoading,
  isError,
  view,
  hasActiveFilters,
  onClearFilters,
  onRetry,
}) {
  if (isLoading) return <LoadingSkeleton view={view} />;

  if (isError) {
    return (
      <SectionError
        title="We couldn't load your designs"
        body="Your renders are safe — this is a problem reaching them. Try again in a moment."
        onRetry={onRetry}
      />
    );
  }

  if (!designs || designs.length === 0) {
    // Two different empty states. "Nothing matches this filter" is a dead end
    // the user created and can undo; "no designs at all" is the onboarding
    // moment. Showing the onboarding pitch to someone who just filtered by
    // Bathroom would read as though their designs had been deleted.
    if (hasActiveFilters) {
      return (
        <SectionEmpty
          compact
          icon={SlidersHorizontal}
          title="No designs match those filters"
          body="Try a different room type, or clear the filters to see everything."
          secondary={{ label: "Clear filters", onClick: onClearFilters }}
        />
      );
    }
    return <DesignsEmptyState />;
  }

  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;
  const currentItems = designs;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {view === "grid" ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {currentItems.map((item, index) => (
                <DesignCard key={item.id} design={item} index={index} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {currentItems.map((item, index) => (
                <DesignCard key={item.id} design={item} index={index} isList />
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg border border-white/10 transition-all ${
              currentPage === 1 ? "text-white/20 cursor-not-allowed" : "text-white/50 hover:bg-white/05"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => onPageChange(i + 1)}
                className="w-10 h-10 rounded-lg text-[14px] font-medium transition-all text-black"
                style={
                  currentPage === i + 1
                    ? { background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }
                    : { background: "transparent", color: "rgba(255,255,255,0.40)" }
                }
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg border border-white/10 transition-all ${
              currentPage === totalPages ? "text-white/20 cursor-not-allowed" : "text-white/50 hover:bg-white/05"
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </>
  );
}

function LoadingSkeleton({ view }) {
  const skeletonCount = view === "grid" ? 8 : 6;

  return (
    <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
      {[...Array(skeletonCount)].map((_, i) => (
        <div key={i} className="animate-pulse">
          {view === "grid" ? (
            <>
              <div className="aspect-4/3 bg-white/06 rounded-xl mb-3" />
              <div className="h-4 bg-white/06 rounded w-3/4 mb-2" />
              <div className="h-3 bg-white/06 rounded w-1/2" />
            </>
          ) : (
            <div className="flex items-center gap-4 rounded-xl border border-white/08 p-4" style={{ background: "#0d0b08" }}>
              <div className="w-28 h-24 bg-white/06 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/06 rounded w-1/2" />
                <div className="h-3 bg-white/06 rounded w-1/3" />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
