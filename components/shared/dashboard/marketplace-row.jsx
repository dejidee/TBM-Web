// components/shared/dashboard/marketplace-row.jsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import ProductCard from "@/components/shared/materials/product-card";
import { useFeaturedProducts } from "@/hooks/use-products";

/**
 * The one section of the Overview that is never empty.
 *
 * Everything else on this page is keyed to what the user *owns* — orders,
 * designs, consultations, saved items — so a new or light user got a screen
 * that reported absence four times over. The catalogue does not depend on the
 * user having done anything, and it is what TBM actually sells, so it is what
 * fills the page.
 *
 * `/Products/featured` is public (it answers 200 anonymously), so this needs no
 * auth gate. It reuses the marketplace's own ProductCard rather than a
 * dashboard-shaped copy: same prices, same made-to-order rules, same branded
 * placeholder for pieces without photography.
 */
export default function MarketplaceRow() {
  const { data: products, isLoading, isError } = useFeaturedProducts();

  // A merchandising row is an upsell, not information the user asked for — if
  // the catalogue call fails, the page is better off without it than with an
  // error box the user can do nothing about.
  if (isError) return null;
  if (!isLoading && (!products || products.length === 0)) return null;

  const items = (products ?? []).slice(0, 4);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-semibold text-white">Popular in the marketplace</h2>
          <p className="mt-1 text-[14px] text-white/40">
            Flooring, tiles, and fixtures other TBM clients are ordering now.
          </p>
        </div>
        <Link
          href="/bogat/materials"
          className="group inline-flex min-h-11 items-center gap-1.5 text-[13px] font-semibold text-[#D4AF37]"
        >
          Browse all materials
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            strokeWidth={2}
          />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading
          ? [0, 1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] w-full bg-white/05" />
                <div className="mt-3 h-3 w-1/2 rounded bg-white/05" />
                <div className="mt-2 h-4 w-3/4 rounded bg-white/05" />
              </div>
            ))
          : items.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </motion.section>
  );
}
