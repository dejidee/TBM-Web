"use client";

import ProductCard from "./product-card";

export default function ProductGrid({
  products,
  isLoading,
  viewMode = "grid",
  emptyTitle = "No products found",
  emptyMessage = "Try adjusting your filters to see more results",
  onReset,
  resetLabel = "Clear search",
}) {
  if (isLoading) {
    return (
      <div
        className={`grid gap-px ${
          viewMode === "grid"
            ? "grid-cols-2 md:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1"
        }`}
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="overflow-hidden animate-pulse"
            style={{ background: "#0d0b08" }}
          >
            <div
              className={
                viewMode === "grid"
                  ? "aspect-[4/5] bg-white/06"
                  : "h-48 bg-white/06"
              }
            />
            <div className="p-4 space-y-3">
              <div className="h-3 bg-white/06 w-1/3" />
              <div className="h-4 bg-white/06 w-3/4" />
              <div className="h-3 bg-white/06 w-full" />
              <div className="h-3 bg-white/06 w-2/3" />
              <div className="flex items-center justify-between">
                <div className="h-6 bg-white/06 w-1/4" />
                <div className="h-8 bg-white/06 w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-16 h-16 text-white/20 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <h3 className="text-lg font-medium text-white mb-2 font-primary">
          {emptyTitle}
        </h3>
        <p className="text-white/40 font-manrope">{emptyMessage}</p>
        {onReset && (
          <button
            onClick={onReset}
            className="mt-5 inline-flex min-h-11 items-center rounded-sm border border-white/15 px-4 text-[13px] font-medium text-white/70 transition-colors hover:border-[#D4AF37]/40 hover:text-[#D4AF37] font-manrope"
          >
            {resetLabel}
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`grid gap-px ${
        viewMode === "grid"
          ? "grid-cols-2 md:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1"
      }`}
      style={{ background: "rgba(255,255,255,0.06)" }}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} viewMode={viewMode} />
      ))}
    </div>
  );
}
