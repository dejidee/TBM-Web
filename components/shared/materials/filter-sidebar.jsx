"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SlidersHorizontal, X, Search } from "lucide-react";
import ActiveFilterTags from "./active-filter-tabs";

// Thin dispatcher (no hooks of its own) so the two variants can each own their
// hook order cleanly.
export default function FilterSidebar(props) {
  if (props.variant === "collections") {
    return (
      <CollectionsFilter
        categories={props.categories ?? []}
        activeFilters={props.activeFilters}
        onFilterChange={props.onFilterChange}
        onApplyFilters={props.onApplyFilters}
        onSearchChange={props.onSearchChange}
        sortBy={props.sortBy}
        setSortBy={props.setSortBy}
      />
    );
  }
  return <FullFilterSidebar {...props} />;
}

/**
 * A purpose-built, single-select collections filter for the Bogat catalogue.
 * No Brand/Type/Apply — the page is already one brand of physical vanities, so
 * those controls were noise. Selection applies immediately and stays in sync
 * with the hero's collection rail (both drive activeFilters.categoryIds).
 */
function CollectionsFilter({
  categories = [],
  activeFilters,
  onFilterChange,
  onApplyFilters,
  onSearchChange,
  sortBy,
  setSortBy,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const selectedId = activeFilters?.categoryIds?.[0] ?? null;
  const totalPieces = categories.reduce((sum, c) => sum + (c.count ?? 0), 0);

  // Local, controlled search text — debounced before it hits the query so we
  // don't fire a request per keystroke. Stays in sync if the term is cleared
  // elsewhere (e.g. the results chip or a fresh URL).
  const committed = activeFilters?.searchTerm ?? "";
  const [term, setTerm] = useState(committed);
  useEffect(() => {
    setTerm(committed);
  }, [committed]);
  useEffect(() => {
    const id = setTimeout(() => {
      if (term !== committed) onSearchChange?.(term.trim());
    }, 300);
    return () => clearTimeout(id);
  }, [term, committed, onSearchChange]);

  const select = (id) => {
    onFilterChange({ ...activeFilters, categoryIds: id ? [id] : [] });
    onApplyFilters?.();
    setMobileOpen(false);
  };

  // Plain render helpers (not nested components) — declaring components inside a
  // component gives them a new identity every render, which remounts the search
  // input and drops its focus on each keystroke. Inline elements reconcile in
  // place instead.
  const renderRow = ({ id, name, count, active }) => (
    <button
      key={id ?? "all"}
      onClick={() => select(id)}
      className={`flex w-full min-h-11 items-center justify-between gap-3 rounded-sm px-3 text-left transition-colors ${
        active
          ? "bg-[#D4AF37]/8 text-white"
          : "text-white/55 hover:bg-white/3 hover:text-white/85"
      }`}
      style={active ? { boxShadow: "inset 0 0 0 1px rgba(212,175,55,0.4)" } : undefined}
    >
      <span className="flex items-center gap-2.5 text-[13.5px] font-medium">
        <span
          className={`h-1.5 w-1.5 rounded-full transition-colors ${active ? "bg-[#D4AF37]" : "bg-white/20"}`}
        />
        {name}
      </span>
      {count != null && (
        <span
          className={`text-[11px] tabular-nums ${active ? "text-[#D4AF37]" : "text-white/30"}`}
        >
          {count}
        </span>
      )}
    </button>
  );

  const list = (
    <div className="space-y-0.5">
      {renderRow({ id: null, name: "All collections", count: totalPieces, active: !selectedId })}
      {categories.map((c) =>
        renderRow({ id: c.id, name: c.name, count: c.count, active: selectedId === c.id }),
      )}
    </div>
  );

  const searchBox = (
    <div className="relative mb-5">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
      <input
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Search pieces or collections"
        aria-label="Search materials"
        className="w-full rounded-sm border border-white/12 bg-white/3 py-2.5 pl-9 pr-9 text-[13.5px] text-white placeholder:text-white/30 transition-colors focus:border-[#D4AF37]/50 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {term && (
        <button
          onClick={() => {
            setTerm("");
            onSearchChange?.("");
          }}
          aria-label="Clear search"
          className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );

  return (
    <div className="w-full font-manrope">
      {/* Search — visible on all breakpoints, above the collection controls. */}
      {searchBox}

      {/* Mobile: a compact Filters button + sort, with a collapsible list. */}
      <div className="md:hidden">
        <div className="mb-4 flex items-center gap-2">
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex flex-1 min-h-11 items-center justify-center gap-2 rounded-sm border border-white/12 px-4 py-2.5 text-sm font-medium text-white/80"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {selectedId
              ? categories.find((c) => c.id === selectedId)?.name
              : "All collections"}
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-sm border border-white/10 bg-[#1a1a1a] px-3 py-2.5 text-sm text-white focus:border-[#D4AF37]/50 focus:outline-none"
          >
            <option value="popular">Most Popular</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="featured">Featured</option>
          </select>
        </div>
        {mobileOpen && <div className="mb-4">{list}</div>}
      </div>

      {/* Desktop: persistent collections list. */}
      <div className="hidden md:block">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
          Collections
        </p>
        {list}
        <div
          className="mt-6 p-6"
          style={{
            background: "rgba(212,175,55,0.06)",
            boxShadow: "0 0 0 1px rgba(212,175,55,0.15)",
          }}
        >
          <div className="w-px h-3 bg-[#D4AF37] mb-4" />
          <h4 className="font-semibold mb-2 font-poppins text-white text-sm">
            Not sure where to start?
          </h4>
          <p className="text-sm text-white/40 mb-4 font-manrope">
            Tell us about your space and our design team will recommend the right
            collection.
          </p>
          <Link
            href="/consultation"
            className="text-sm font-medium text-[#D4AF37]/80 hover:text-[#D4AF37] transition-colors inline-flex items-center gap-1 font-manrope"
          >
            Book a consultation →
          </Link>
        </div>
      </div>
    </div>
  );
}

function FullFilterSidebar({
  categories = [],
  activeFilters,
  onFilterChange,
  onApplyFilters,
  handleRemoveFilter,
  handleClearAllFilters,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  totalCount = 0,
}) {

  const [filterTab, setFilterTab] = useState(true);
  const [filterDrop, setFilterDrop] = useState(false);
  const [expandedSections, setExpandedSections] = useState({ category: true, brandType: false, productType: false });
  const [stagedFilters, setStagedFilters] = useState(activeFilters);

  useEffect(() => { setStagedFilters(activeFilters); }, [activeFilters]);

  const hasPendingChanges = JSON.stringify(stagedFilters) !== JSON.stringify(activeFilters);
  const toggleSection = (section) => setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));

  const handleCategoryChange = (categoryId) => {
    const current = stagedFilters.categoryIds || [];
    setStagedFilters((prev) => ({
      ...prev,
      categoryIds: current.includes(categoryId) ? current.filter((c) => c !== categoryId) : [...current, categoryId],
    }));
  };

  const handleBrandTypeChange = (brandType) => {
    const current = stagedFilters.brandTypes || [];
    setStagedFilters((prev) => ({
      ...prev,
      brandTypes: current.includes(brandType) ? current.filter((b) => b !== brandType) : [...current, brandType],
    }));
  };

  const handleProductTypeChange = (productType) => {
    const current = stagedFilters.productTypes || [];
    setStagedFilters((prev) => ({
      ...prev,
      productTypes: current.includes(productType) ? current.filter((p) => p !== productType) : [...current, productType],
    }));
  };

  const handleApply = () => { onFilterChange(stagedFilters); onApplyFilters?.(); };

  const handleClearAll = () => {
    const reset = { categoryIds: [], brandTypes: [], productTypes: [], searchTerm: "", isFeatured: null };
    setStagedFilters(reset);
    handleClearAllFilters();
  };

  const sortOptions = [
    { value: "popular", label: "Most Popular" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "featured", label: "Featured" },
  ];

  const brandTypeLabels = { 1: "TBM", 2: "Bogat" };
  const productTypeLabels = { 1: "Physical Product", 2: "Service" };

  const ChevronIcon = ({ expanded }) => (
    <svg className={`w-4 h-4 text-white/30 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );

  const ViewToggle = () => (
    <div className="flex items-center gap-px border border-white/10 p-1">
      <button onClick={() => setViewMode("grid")} aria-label="Grid view"
        className={`p-1.5 transition-colors ${viewMode === "grid" ? "bg-white/10" : "hover:bg-white/05"}`}>
        <svg className="w-5 h-5 text-white/60" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </button>
      <button onClick={() => setViewMode("list")} aria-label="List view"
        className={`p-1.5 transition-colors ${viewMode === "list" ? "bg-white/10" : "hover:bg-white/05"}`}>
        <svg className="w-5 h-5 text-white/60" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );

  const FilterContent = () => (
    <>
      <div className="flex flex-col gap-2 py-2">
        <p className="text-white/35 text-sm font-manrope">{totalCount} Results</p>
        <h1 className="text-lg font-bold text-white mb-2 font-poppins">
          {activeFilters.categoryIds?.length > 0
            ? categories.filter((c) => activeFilters.categoryIds.includes(c.id)).map((c) => c.name).join(", ")
            : "All Materials"}
        </h1>
        <ActiveFilterTags activeFilters={activeFilters} categories={categories} onRemoveFilter={handleRemoveFilter} onClearAll={handleClearAll} />
      </div>

      {/* Category */}
      <div className="border-b border-white/08 pb-4 mb-4 mt-3">
        <button onClick={() => toggleSection("category")} className="flex items-center justify-between w-full mb-3">
          <span className="font-medium text-white/70 font-manrope text-sm">Category</span>
          <ChevronIcon expanded={expandedSections.category} />
        </button>
        {expandedSections.category && (
          <div className="space-y-2">
            {categories.length === 0 && <p className="text-sm text-white/35 font-manrope">Loading categories…</p>}
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={stagedFilters.categoryIds?.includes(cat.id) || false}
                  onChange={() => handleCategoryChange(cat.id)}
                  className="w-4 h-4 rounded border-white/20 bg-[#1a1a1a] accent-[#D4AF37] cursor-pointer"
                />
                <span className="text-sm text-white/45 group-hover:text-white/70 font-manrope transition-colors">{cat.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Brand Type */}
      <div className="border-b border-white/08 pb-4 mb-4">
        <button onClick={() => toggleSection("brandType")} className="flex items-center justify-between w-full mb-3">
          <span className="font-medium text-white/70 font-manrope text-sm">Brand</span>
          <ChevronIcon expanded={expandedSections.brandType} />
        </button>
        {expandedSections.brandType && (
          <div className="space-y-2">
            {[1, 2].map((bt) => (
              <label key={bt} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={stagedFilters.brandTypes?.includes(bt) || false}
                  onChange={() => handleBrandTypeChange(bt)}
                  className="w-4 h-4 rounded border-white/20 bg-[#1a1a1a] accent-[#D4AF37] cursor-pointer"
                />
                <span className="text-sm text-white/45 group-hover:text-white/70 font-manrope transition-colors">{brandTypeLabels[bt]}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Product Type */}
      <div className="pb-4 mb-4">
        <button onClick={() => toggleSection("productType")} className="flex items-center justify-between w-full mb-3">
          <span className="font-medium text-white/70 font-manrope text-sm">Product Type</span>
          <ChevronIcon expanded={expandedSections.productType} />
        </button>
        {expandedSections.productType && (
          <div className="space-y-2">
            {[1, 2].map((pt) => (
              <label key={pt} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={stagedFilters.productTypes?.includes(pt) || false}
                  onChange={() => handleProductTypeChange(pt)}
                  className="w-4 h-4 rounded border-white/20 bg-[#1a1a1a] accent-[#D4AF37] cursor-pointer"
                />
                <span className="text-sm text-white/45 group-hover:text-white/70 font-manrope transition-colors">{productTypeLabels[pt]}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Apply Button */}
      <button
        onClick={handleApply}
        className="w-full py-3 px-4 font-medium font-manrope transition-all duration-200 text-sm"
        style={{
          background: hasPendingChanges
            ? "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)"
            : "rgba(212,175,55,0.2)",
          color: hasPendingChanges ? "black" : "rgba(212,175,55,0.5)",
          opacity: hasPendingChanges ? 1 : 0.7,
          cursor: hasPendingChanges ? "pointer" : "default",
        }}
      >
        {hasPendingChanges ? "Apply Filters" : "Filters Applied"}
      </button>
    </>
  );

  return (
    <div className="w-full">
      {/* Mobile controls */}
      <div className="flex items-center gap-2 justify-evenly mb-6 md:hidden">
        <div
          className="px-4 py-1.5 flex-1 cursor-pointer"
          style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
          onClick={() => { setFilterDrop((p) => !p); setFilterTab(false); }}
        >
          <h3 className="text-sm font-semibold text-black font-manrope">Filters</h3>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-white/10 bg-[#1a1a1a] text-white text-sm focus:outline-none focus:border-[#D4AF37]/50 font-manrope"
        >
          {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ViewToggle />
      </div>

      {/* Desktop header */}
      <div className="items-center justify-between mb-6 hidden md:flex">
        <h3 className="text-base font-semibold text-white font-manrope">Filters</h3>
        <button
          onClick={() => { setFilterTab((p) => !p); setFilterDrop(false); }}
          className="text-sm text-white/35 hover:text-white/60 flex items-center gap-1 transition-colors"
        >
          {filterTab ? <X className="w-4 h-4" /> : <SlidersHorizontal className="w-4 h-4" />}
        </button>
      </div>

      {(filterTab || filterDrop) && <FilterContent />}

      {/* Design-help card — a real, low-commitment path to conversion for a
          bespoke catalogue: talk to a consultant instead of a dead-end promo. */}
      <div
        className="mt-6 p-6 hidden md:block"
        style={{
          background: "rgba(212,175,55,0.06)",
          boxShadow: "0 0 0 1px rgba(212,175,55,0.15)",
        }}
      >
        <div className="w-px h-3 bg-[#D4AF37] mb-4" />
        <h4 className="font-semibold mb-2 font-poppins text-white text-sm">
          Not sure where to start?
        </h4>
        <p className="text-sm text-white/40 mb-4 font-manrope">
          Tell us about your space and our design team will recommend the right
          collection.
        </p>
        <Link
          href="/consultation"
          className="text-sm font-medium text-[#D4AF37]/80 hover:text-[#D4AF37] transition-colors inline-flex items-center gap-1 font-manrope"
        >
          Book a consultation →
        </Link>
      </div>
    </div>
  );
}
