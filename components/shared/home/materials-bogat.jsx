"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

async function fetchShowcaseProducts() {
  // Showcase only products that have a real photo — placeholder tiles read
  // as a broken catalogue. Featured products come first; if too few of them
  // carry an image, backfill from the wider active range.
  const TARGET = 8;
  const withImage = (items) => items.filter((p) => p.primaryImageUrl);

  const fetchPage = async (extra = {}) => {
    const params = new URLSearchParams({
      pageSize: "24",
      ActiveOnly: "true",
      ...extra,
    });
    const res = await fetch(`/api/products?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch products");
    const json = await res.json();
    return json.data?.items ?? [];
  };

  const picks = withImage(await fetchPage({ isFeatured: "true" })).slice(
    0,
    TARGET
  );
  if (picks.length < TARGET) {
    const seen = new Set(picks.map((p) => p.id));
    for (const p of withImage(await fetchPage())) {
      if (seen.has(p.id)) continue;
      picks.push(p);
      if (picks.length >= TARGET) break;
    }
  }
  return picks;
}

const PLACEHOLDER =
  "/product-placeholder.svg";

function ProductCard({ product, index }) {
  const imageUrl = product.primaryImageUrl || PLACEHOLDER;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Link href={`/materials/${product.slug}`} className="block group">
        <div
          className="overflow-hidden"
          style={{
            background: "#0d0b08",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Image */}
          <div
            className="relative overflow-hidden"
            style={{ aspectRatio: "4/3" }}
          >
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />

            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Badges */}
            <div className="absolute inset-x-2 top-2 flex items-start gap-1.5">
              {product.isFeatured && (
                <span className="shrink-0 text-[9px] leading-none font-bold px-1.5 py-1 tracking-[0.12em] uppercase bg-[#D4AF37] text-black">
                  Featured
                </span>
              )}
              {product.categoryName && (
                <span className="ml-auto min-w-0 truncate text-[9px] leading-none font-semibold px-1.5 py-1 tracking-[0.08em] uppercase text-white/80 bg-black/60 backdrop-blur-sm border border-white/10">
                  {product.categoryName}
                </span>
              )}
            </div>

            {/* Hover CTA */}
            <div className="absolute inset-x-0 bottom-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-white tracking-[0.15em] uppercase">
                View Product
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="p-3.5">
            <p className="text-[10px] text-white/35 font-semibold uppercase tracking-[0.15em] mb-1.5 truncate">
              {product.brandName}
            </p>
            <h3 className="font-poppins font-semibold text-white text-[13px] leading-snug mb-2.5 line-clamp-2 min-h-[2.5em] group-hover:text-[#D4AF37] transition-colors duration-200">
              {product.name}
            </h3>

            <div className="flex items-baseline justify-between gap-2">
              <div className="min-w-0">
                {product.showPrice ? (
                  <span className="text-sm font-bold text-white truncate block">
                    {product.variants?.length > 0
                      ? `From ${product.priceDisplay}`
                      : product.priceDisplay}
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-[#D4AF37]">
                    Request Price
                  </span>
                )}
              </div>
              {product.rating && (
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
                  <span className="text-[11px] text-white/50">
                    {product.rating}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div
      className="overflow-hidden animate-pulse"
      style={{ background: "#0d0b08", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="w-full bg-white/4" style={{ aspectRatio: "4/3" }} />
      <div className="p-3.5 space-y-2">
        <div className="h-2 w-14 bg-white/5 rounded" />
        <div className="h-3 w-3/4 bg-white/[0.07] rounded" />
        <div className="h-3 w-1/2 bg-white/[0.07] rounded" />
        <div className="h-3.5 w-1/3 bg-white/5 rounded" />
      </div>
    </div>
  );
}

export default function MaterialsBogatSection() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", "homepage-showcase"],
    queryFn: fetchShowcaseProducts,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return (
    <section
      className="py-20 sm:py-28 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #080806 0%, #0a0a08 60%, #050503 100%)",
      }}
    >
      {/* Subtle gold glow top */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-150 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 sm:mb-14">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[#D4AF37] font-manrope text-[11px] font-bold uppercase tracking-[0.3em] mb-3 flex items-center gap-2"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Bogat&apos;s Marketplace
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.07 }}
              className="font-poppins font-bold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight"
            >
              Materials by <span className="text-[#D4AF37]">Bogat</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.12 }}
              className="mt-3 text-white/45 text-sm font-manrope leading-relaxed max-w-md"
            >
              TBM&apos;s premium bathroom vanity, sanitaryware and finishing
              brand — sourced, priced, and delivered across Nigeria.
            </motion.p>
          </div>

          {/* Desktop CTA */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="hidden sm:block shrink-0"
          >
            <Link
              href="/bogat/materials"
              className="btn-outline"
            >
              Browse All Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* ── Product grid ───────────────────────────────────────────
            Three states, not two. Nothing is featured on a fresh catalogue,
            and an empty grid between the heading and the trust chips reads as
            a broken page rather than as "none yet". */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div
            className="mb-10 px-6 py-14 text-center"
            style={{
              background: "#0d0b08",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <p className="font-poppins text-white/70 text-[15px]">
              New pieces are landing shortly.
            </p>
            <p className="mt-2 text-white/35 text-[13px] font-manrope">
              The full Bogat catalogue is already open to browse.
            </p>
            <Link
              href="/bogat/materials"
              className="btn-outline mt-6 inline-flex"
            >
              Browse All Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}

        {/* ── Bottom row: trust chips + mobile CTA ─────────────────── */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* Trust chips */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2">
            {[
              "Authentic Materials",
              "Fast Delivery — Abuja & Lagos",
              "Expert Support",
            ].map((item) => (
              <span
                key={item}
                className="flex items-center gap-1.5 text-[11px] text-white/35 font-manrope"
              >
                <span className="w-1 h-1 rounded-full bg-[#D4AF37]/60 shrink-0" />
                {item}
              </span>
            ))}
          </div>

          {/* Mobile CTA */}
          <Link
            href="/bogat/materials"
            className="btn-gold sm:hidden w-full justify-center py-3.5"
          >
            <ShoppingBag className="w-4 h-4" />
            Browse All Products
          </Link>

          {/* Desktop secondary CTA */}
          <Link
            href="/bogat/materials"
            className="btn-gold hidden sm:inline-flex px-8 py-3.5"
          >
            <ShoppingBag className="w-4 h-4" />
            Shop All Materials
          </Link>
        </div>
      </div>
    </section>
  );
}
