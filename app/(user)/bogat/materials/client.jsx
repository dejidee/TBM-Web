"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import FilterSidebar from "@/components/shared/materials/filter-sidebar";
import ProductGrid from "@/components/shared/materials/product-grid";
import Pagination from "@/components/shared/materials/pagination";
import { productKeys, useCategoriesByBrand } from "@/hooks/use-products";

const BOGAT_BRAND_TYPE = 2;

function sortItems(items = [], sortBy) {
  const arr = [...items];
  switch (sortBy) {
    case "price-low":
      return arr.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    case "price-high":
      return arr.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    case "featured":
      return arr.sort(
        (a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0),
      );
    case "popular":
    default:
      return arr;
  }
}

async function fetchProducts(filters, page, pageSize = 12) {
  const params = new URLSearchParams();
  params.set("pageNumber", String(page));
  params.set("pageSize", String(pageSize));
  params.set("ActiveOnly", "true");
  // This page is Bogat's own shop — it must never show TBM's general
  // product catalogue. The sidebar here uses the "collections" variant,
  // which has no brand toggle, so filters.brandTypes is always empty;
  // brandType is forced rather than left to depend on that being set.
  params.set("brandType", String(BOGAT_BRAND_TYPE));

  if (filters.categoryIds?.length === 1)
    params.set("categoryId", filters.categoryIds[0]);
  if (filters.productTypes?.length === 1)
    params.set("productType", String(filters.productTypes[0]));
  if (filters.searchTerm) params.set("searchTerm", filters.searchTerm);
  if (filters.isFeatured != null)
    params.set("isFeatured", String(filters.isFeatured));
  if (filters.minPrice != null)
    params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice != null)
    params.set("maxPrice", String(filters.maxPrice));

  const res = await fetch(`/api/products?${params.toString()}`);
  if (!res.ok) throw new Error(`Products fetch failed: ${res.status}`);
  const json = await res.json();

  return {
    items: json.data?.items ?? [],
    totalCount: json.data?.totalCount ?? 0,
    pageNumber: json.data?.pageNumber ?? page,
    pageSize: json.data?.pageSize ?? pageSize,
    totalPages: json.data?.totalPages ?? 1,
    hasPreviousPage: json.data?.hasPreviousPage ?? false,
    hasNextPage: json.data?.hasNextPage ?? false,
  };
}

export default function BogatMaterialsClient({ initialData }) {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const PAGE_SIZE = 12;

  const [activeFilters, setActiveFilters] = useState({
    categoryIds: [],
    brandTypes: [],
    productTypes: [],
    searchTerm: searchParams.get("search") || "",
    isFeatured: null,
    minPrice: null,
    maxPrice: null,
  });
  const [sortBy, setSortBy] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    if (initialData) {
      queryClient.setQueryData(
        productKeys.list({ filters: activeFilters, page: 1 }),
        {
          items: initialData.items ?? [],
          totalCount: initialData.totalCount ?? 0,
          pageNumber: initialData.pageNumber ?? 1,
          pageSize: initialData.pageSize ?? PAGE_SIZE,
          totalPages: initialData.totalPages ?? 1,
          hasPreviousPage: initialData.hasPreviousPage ?? false,
          hasNextPage: initialData.hasNextPage ?? false,
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: productKeys.list({ filters: activeFilters, page: currentPage }),
    queryFn: () => fetchProducts(activeFilters, currentPage, PAGE_SIZE),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: false,
  });

  // Collections come from the categories endpoint, not from a page of products.
  // Deriving them from a capped product fetch silently dropped any collection
  // whose products fell outside that window — so adding a new signature stone,
  // or simply growing past the page size, could make a whole collection vanish.
  // Sourcing by brand scales to any number of collections.
  const { data: bogatCategories } = useCategoriesByBrand(BOGAT_BRAND_TYPE);

  useEffect(() => {
    if (data?.hasNextPage) {
      queryClient.prefetchQuery({
        queryKey: productKeys.list({ filters: activeFilters, page: currentPage + 1 }),
        queryFn: () => fetchProducts(activeFilters, currentPage + 1, PAGE_SIZE),
        staleTime: 5 * 60 * 1000,
      });
    }
  }, [data, activeFilters, currentPage, queryClient]);

  const sortedItems = useMemo(
    () => sortItems(data?.items, sortBy),
    [data?.items, sortBy],
  );

  // The signature collections are the child categories under the "Bogat
  // Signature Collections" parent — they all carry a parentCategoryId, while the
  // general/scaffolding categories (Bathroom, Tiles & Flooring, …) are
  // top-level (parentCategoryId null). Filtering to children shows exactly the
  // seven, and scales automatically if a new collection is added under the same
  // parent. Sorted by displayOrder (1→7 = the catalogue's chronological order)
  // and carrying the live productCount.
  const categories = useMemo(
    () =>
      (bogatCategories ?? [])
        .filter((c) => c.parentCategoryId != null)
        .map((c) => ({
          id: c.id,
          slug: c.slug,
          name: c.name,
          count: c.productCount ?? 0,
          displayOrder: c.displayOrder ?? 0,
        }))
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [bogatCategories],
  );

  // The Bogat landing page links to a collection by slug (?category=<slug>),
  // a stable, human-readable value it can hardcode. Categories only carry
  // their real id once bogatCategories has loaded, so this resolves the slug
  // to an id and applies it once, the same way `search` is read from the URL
  // above. Runs once per slug — a category slug removed from the URL later
  // (e.g. the user clears the filter) does not re-trigger it.
  const categoryParam = searchParams.get("category");
  const appliedCategoryParam = useRef(null);
  useEffect(() => {
    if (!categoryParam || categoryParam === appliedCategoryParam.current) return;
    const match = categories.find((c) => c.slug === categoryParam);
    if (!match) return;
    appliedCategoryParam.current = categoryParam;
    setActiveFilters((prev) =>
      prev.categoryIds.includes(match.id)
        ? prev
        : { ...prev, categoryIds: [match.id] },
    );
    setCurrentPage(1);
  }, [categoryParam, categories]);

  const handleFilterChange = useCallback((newFilters) => {
    setActiveFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handleRemoveFilter = useCallback((filterType, value) => {
    setActiveFilters((prev) => {
      if (filterType === "categoryId")
        return { ...prev, categoryIds: prev.categoryIds.filter((c) => c !== value) };
      if (filterType === "brandType")
        return { ...prev, brandTypes: prev.brandTypes.filter((b) => b !== value) };
      if (filterType === "productType")
        return { ...prev, productTypes: prev.productTypes.filter((p) => p !== value) };
      if (filterType === "minPrice") return { ...prev, minPrice: null };
      if (filterType === "maxPrice") return { ...prev, maxPrice: null };
      if (filterType === "isFeatured") return { ...prev, isFeatured: null };
      return prev;
    });
    setCurrentPage(1);
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setActiveFilters({
      categoryIds: [],
      brandTypes: [],
      productTypes: [],
      searchTerm: "",
      isFeatured: null,
      minPrice: null,
      maxPrice: null,
    });
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSortChange = useCallback((value) => {
    setSortBy(value);
    setCurrentPage(1);
  }, []);

  // Search: update the filter, reset to page 1, and mirror the term in the URL
  // (?search=) so a search is shareable, survives refresh, and round-trips with
  // the global navbar handoff. Already debounced in the search box.
  const handleSearchChange = useCallback(
    (value) => {
      setActiveFilters((prev) => ({ ...prev, searchTerm: value }));
      setCurrentPage(1);
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set("search", value);
      else params.delete("search");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  return (
    <div className="min-h-screen bg-black pt-20 font-manrope">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="border-b border-white/8" style={{ background: "#0d0b08" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ol className="flex items-center gap-2 text-sm" itemScope itemType="https://schema.org/BreadcrumbList">
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link href="/" className="text-white/40 hover:text-white/70 transition-colors" itemProp="item">
                <span itemProp="name">Home</span>
              </Link>
              <meta itemProp="position" content="1" />
            </li>
            <svg className="w-4 h-4 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link href="/bogat" className="text-white/40 hover:text-white/70 transition-colors" itemProp="item">
                <span itemProp="name">Bogat</span>
              </Link>
              <meta itemProp="position" content="2" />
            </li>
            <svg className="w-4 h-4 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <li>
              <span className="text-white/70 font-medium">All Materials</span>
            </li>
          </ol>
        </div>
      </nav>

      {/* Immersive collection hero — sets the tone and offers a one-tap way into
          each collection, the natural way to browse a bespoke catalogue. */}
      <section
        className="border-b border-white/[0.07]"
        style={{ background: "linear-gradient(180deg, #100d09 0%, #0a0908 100%)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <p className="text-[11px] font-semibold text-[#D4AF37] tracking-[0.28em] uppercase mb-4">
            Bogat by TBM
          </p>
          <h1 className="font-poppins text-3xl sm:text-4xl lg:text-5xl font-semibold text-white leading-[1.05] tracking-[-0.02em] max-w-2xl">
            Signature collections of bespoke stone
          </h1>
          <p className="mt-5 max-w-xl text-[15px] text-white/50 leading-relaxed">
            Made-to-order vanities, basins and stone furniture — each piece
            handcrafted to the proportions of your space, in 8–12 weeks.
          </p>

          {categories.length > 0 && (
            // A single-line rail rather than a wrapping wall: it stays contained
            // no matter how many collections exist. The right-edge fade hints
            // there is more to scroll to.
            <div className="relative mt-9">
              <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 pr-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <button
                  onClick={() =>
                    handleFilterChange({ ...activeFilters, categoryIds: [] })
                  }
                  className={`shrink-0 whitespace-nowrap min-h-11 flex items-center px-4 rounded-sm text-[12px] font-medium tracking-wide transition-colors ${
                    (activeFilters.categoryIds?.length ?? 0) === 0
                      ? "bg-[#D4AF37] text-black"
                      : "border border-white/12 text-white/60 hover:border-white/30 hover:text-white"
                  }`}
                >
                  All collections
                </button>
                {categories.map((cat) => {
                  const active = activeFilters.categoryIds?.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() =>
                        handleFilterChange({
                          ...activeFilters,
                          categoryIds: [cat.id],
                        })
                      }
                      className={`shrink-0 whitespace-nowrap min-h-11 flex items-center px-4 rounded-sm text-[12px] font-medium tracking-wide transition-colors ${
                        active
                          ? "bg-[#D4AF37] text-black"
                          : "border border-white/12 text-white/60 hover:border-white/30 hover:text-white"
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
              <div
                className="pointer-events-none absolute right-0 top-0 bottom-1 w-12"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, #0a0908 85%)",
                }}
              />
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <FilterSidebar
              variant="collections"
              categories={categories}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              handleClearAllFilters={handleClearAllFilters}
              handleRemoveFilter={handleRemoveFilter}
              onApplyFilters={() => setCurrentPage(1)}
              onSearchChange={handleSearchChange}
              sortBy={sortBy}
              setSortBy={handleSortChange}
              viewMode={viewMode}
              setViewMode={setViewMode}
              totalCount={data?.totalCount || 0}
            />
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">
            {/* Desktop Sort/View Controls */}
            <div className="hidden md:flex flex-row items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3 ml-auto">
                <AnimatePresence>
                  {isFetching && !isLoading && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-white/35 flex items-center gap-1"
                    >
                      <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Updating…
                    </motion.span>
                  )}
                </AnimatePresence>
                <p className="text-white/40">
                  {data?.totalCount ?? 0} result
                  {(data?.totalCount ?? 0) === 1 ? "" : "s"}
                  {activeFilters.searchTerm ? (
                    <>
                      {" "}
                      for{" "}
                      <span className="text-white/70">
                        &ldquo;{activeFilters.searchTerm}&rdquo;
                      </span>
                    </>
                  ) : null}
                </p>
                <label className="text-sm text-white/50">Sort:</label>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-3 py-2 border border-white/10 bg-[#1a1a1a] text-white text-sm focus:outline-none focus:border-[#D4AF37]/50"
                >
                  <option value="popular">Most Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="featured">Featured</option>
                </select>
                <div className="flex items-center gap-px border border-white/10 p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`min-w-11 min-h-11 flex items-center justify-center transition-colors ${viewMode === "grid" ? "bg-white/10" : "hover:bg-white/05"}`}
                  >
                    <svg className="w-5 h-5 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`min-w-11 min-h-11 flex items-center justify-center transition-colors ${viewMode === "list" ? "bg-white/10" : "hover:bg-white/05"}`}
                  >
                    <svg className="w-5 h-5 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
                <p className="text-red-400">Failed to load products. Please try again.</p>
              </div>
            )}

            {/* Grid */}
            <ProductGrid
              products={sortedItems}
              isLoading={isLoading}
              viewMode={viewMode}
              emptyTitle={
                activeFilters.searchTerm
                  ? `No pieces match “${activeFilters.searchTerm}”`
                  : undefined
              }
              emptyMessage={
                activeFilters.searchTerm
                  ? "Try a different name or collection — or clear the search to see everything."
                  : undefined
              }
              onReset={
                activeFilters.searchTerm
                  ? () => handleSearchChange("")
                  : undefined
              }
            />

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={data.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
