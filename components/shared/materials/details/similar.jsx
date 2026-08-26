"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/**
 * Renders nothing when the API returns no siblings.
 *
 * This used to fall back to four hardcoded marble tiles with /mock/*.svg
 * images. A product with no siblings in its category — which is most of the
 * catalogue — showed a shopper four items that do not exist, each linking
 * nowhere. An absent section is the honest answer.
 */
export default function SimilarStyles({ materials = [] }) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const products = materials;

  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    updateScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", updateScrollButtons);
      return () => container.removeEventListener("scroll", updateScrollButtons);
    }
  }, []);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350;
      const newPosition =
        direction === "left"
          ? scrollPosition - scrollAmount
          : scrollPosition + scrollAmount;
      scrollContainerRef.current.scrollTo({ left: newPosition, behavior: "smooth" });
      setScrollPosition(newPosition);
    }
  };

  if (products.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="p-4"
      style={{ background: "#050505" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white">Similar Styles</h2>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`w-11 h-11 flex items-center justify-center rounded-full border-2 transition-colors ${
              canScrollLeft
                ? "border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
                : "border-white/10 text-white/20 cursor-not-allowed"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`w-11 h-11 flex items-center justify-center rounded-full border-2 transition-colors ${
              canScrollRight
                ? "border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
                : "border-white/10 text-white/20 cursor-not-allowed"
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Products Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto -mx-6 px-6"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            {/* The backend resolves /materials/{idOrSlug}, so an id URL works
                — but it puts a second address on every product. Prefer the
                slug and keep one canonical URL per product. */}
            <Link
              href={`/materials/${product.slug ?? product.id}`}
              className="group block w-70 shrink-0"
            >
              <div
                className="rounded-lg overflow-hidden border border-white/08 hover:border-white/20 transition-all"
                style={{ background: "#0d0b08" }}
              >
                {/* Product Image */}
                <div className="relative aspect-3/2 bg-[#1a1a1a]">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                    sizes="280px"
                  />
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-1 group-hover:text-[#D4AF37] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-white/40 mb-3">{product.subtitle}</p>

                  <div className="flex items-center justify-between">
                    {/* priceDisplay is always a string, and is already
                        "Request Price" on quote-only products — so "From" is
                        only correct when there is a number behind it. */}
                    <div className="flex items-baseline gap-1">
                      {typeof product.price === "number" && (
                        <span className="text-[11px] text-white/40 mr-1">From</span>
                      )}
                      <span className="text-lg font-bold text-white">
                        {product.priceDisplay ??
                          (typeof product.price === "number"
                            ? product.price.toLocaleString("en-NG", {
                                style: "currency",
                                currency: "NGN",
                              })
                            : "Request price")}
                      </span>
                    </div>

                    <span
                      className="w-8 h-8 flex items-center justify-center rounded-full text-black transition-transform group-hover:scale-110"
                      style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
                      aria-hidden="true"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
