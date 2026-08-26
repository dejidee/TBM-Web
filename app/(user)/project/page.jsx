"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePortfolio, usePortfolioCategories } from "@/hooks/use-project";

const CATEGORY_COLORS = {
  "Guest Toilet Renovation": "bg-black/75 text-blue-300 border-blue-400/60",
  "Construction (Shell to Finish)":
    "bg-black/75 text-orange-300 border-orange-400/60",
  "Outdoor / Exterior Design": "bg-black/75 text-green-300 border-green-400/60",
  "Bathroom Renovation": "bg-black/75 text-purple-300 border-purple-400/60",
  "Interior Finishing": "bg-black/75 text-pink-300 border-pink-400/60",
  "Interior Renovation": "bg-black/75 text-yellow-300 border-yellow-400/60",
};

// ── Portfolio Card ────────────────────────────────────────────────────────────

function PortfolioCard({ item }) {
  const router = useRouter();
  const catColor =
    CATEGORY_COLORS[item.category] ??
    "bg-black/75 text-white/70 border-white/20";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      onClick={() => router.push(`/project/${item.id}`)}
      className="group cursor-pointer bg-[#111] border border-white/8 rounded-2xl overflow-hidden hover:border-[#D4AF37]/40 transition-colors duration-300"
    >
      {/* Thumbnail */}
      <div className="relative aspect-square sm:aspect-[4/3] bg-[#1a1a1a] overflow-hidden">
        {item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt={item.title}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 text-sm">
            No image
          </div>
        )}
        <span
          className={`absolute top-3 left-3 text-[11px] font-medium px-2.5 py-1 rounded-full border backdrop-blur-sm ${catColor}`}
        >
          {item.category}
        </span>
        {item.beforeImages?.length > 0 && item.afterImages?.length > 0 && (
          <span className="absolute top-3 right-3 bg-black/60 text-white/80 text-[16px] px-2 py-0.5 rounded-full backdrop-blur-sm">
            Before / After
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 mb-2 group-hover:text-[#D4AF37] transition-colors">
          {item.title}
        </h3>
        <p className="text-white/40 text-xs mb-3 font-manrope line-clamp-1">
          {item.vendorName}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-white/40 text-xs">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="font-manrope">{item.location}</span>
          </div>
          {item.budgetDisplay && item.budgetDisplay !== "" && (
            <span className="text-[#D4AF37] text-xs font-manrope font-medium">
              {item.budgetDisplay}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, isFetching } = usePortfolio({
    page,
    pageSize: 12,
    ...(activeCategory ? { category: activeCategory } : {}),
  });

  // Derived from the published portfolio, the same source the admin form picks
  // from — a tab can never offer a category no project carries.
  const { data: categories } = usePortfolioCategories();

  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / 12);
  const hasMore = page < totalPages;

  function handleCategoryChange(cat) {
    setActiveCategory(cat);
    setPage(1);
  }

  return (
    <>
      {/* Hero */}
      <section className="w-full bg-[#0A0A0A] pt-28 sm:pt-36 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2.5 border border-white/15 text-white/60 text-xs font-manrope font-medium px-4 py-2 tracking-[0.15em] uppercase mb-7">
              <span className="w-1 h-1 bg-[#D4AF37] rounded-full" />
              TBM Building Services
            </span>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-primary font-bold text-white leading-tight tracking-tight mb-6">
              Past Projects
            </h1>
            <p className="text-base sm:text-lg font-manrope text-white/55 max-w-xl">
              Real spaces transformed by TBM. Filter by category to find
              inspiration for your next project.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-[#0A0A0A] border-b border-white/8 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <FilterBtn
              active={activeCategory === null}
              onClick={() => handleCategoryChange(null)}
            >
              All
            </FilterBtn>
            {(categories ?? []).map((cat) => (
              <FilterBtn
                key={cat}
                active={activeCategory === cat}
                onClick={() => handleCategoryChange(cat)}
              >
                {cat}
              </FilterBtn>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="bg-[#0A0A0A] min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden animate-pulse"
                >
                  <div className="aspect-square sm:aspect-[4/3] bg-white/5" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-white/5 rounded w-3/4" />
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {isError && (
            <div className="text-center py-24">
              <p className="text-white/40 text-sm font-manrope">
                Failed to load portfolio. Please try again.
              </p>
            </div>
          )}

          {!isLoading && !isError && items.length === 0 && (
            <div className="text-center py-24">
              <p className="text-white/40 text-sm font-manrope">
                No projects found
                {activeCategory ? ` in "${activeCategory}"` : ""}.
              </p>
            </div>
          )}

          {!isLoading && items.length > 0 && (
            <>
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <PortfolioCard key={item.id} item={item} />
                  ))}
                </AnimatePresence>
              </motion.div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-12">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || isFetching}
                    className="flex items-center justify-center gap-1.5 min-h-11 px-4 text-sm font-manrope text-white/60 hover:text-white border border-white/15 hover:border-white/30 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>
                  <span className="text-white/40 text-sm font-manrope">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!hasMore || isFetching}
                    className="flex items-center justify-center gap-1.5 min-h-11 px-4 text-sm font-manrope text-white/60 hover:text-white border border-white/15 hover:border-white/30 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}

function FilterBtn({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 flex items-center justify-center min-h-11 px-4 rounded-full text-xs font-manrope font-medium border transition-colors duration-200 whitespace-nowrap ${
        active
          ? "bg-[#D4AF37] text-black border-[#D4AF37]"
          : "bg-transparent text-white/50 border-white/15 hover:text-white hover:border-white/30"
      }`}
    >
      {children}
    </button>
  );
}
