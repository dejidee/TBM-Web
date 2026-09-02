"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useIsAuthenticated } from "@/hooks/use-auth";
import { useIsSaved, useToggleSave } from "@/hooks/use-saved";

function SaveButton({ productId }) {
  const { isAuthenticated } = useIsAuthenticated();
  const { isSaved, savedId, isLoading } = useIsSaved(productId);
  const toggleSave = useToggleSave();

  const handleClick = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href =
        "/sign-in?redirect=" + encodeURIComponent(window.location.pathname);
      return;
    }
    toggleSave.mutate({ productId, savedId, isSaved });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || toggleSave.isPending}
      className="absolute top-3 right-3 w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-60"
      aria-label={isSaved ? "Remove from saved" : "Save item"}
    >
      <Heart
        className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200 ${
          isLoading
            ? "text-gray-300"
            : isSaved
              ? "fill-red-500 text-red-500"
              : "text-gray-400"
        }`}
      />
    </button>
  );
}

export default function TrendingClient({ products = [] }) {
  if (!products.length) return null;

  return (
    <section className="py-12 sm:py-14 lg:py-16 bg-white font-manrope">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-5">
            Featured Materials
          </h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Explore our most popular renovation and construction materials, quality-certified and sourced through Bogat for every stage of your project.
          </p>
          <div className="flex justify-center mt-4">
            <div className="w-20 h-1 bg-primary rounded-full" />
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <Link href={`/materials/${product.slug}`}>
                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <SaveButton productId={product.id} />
                </div>
              </Link>

              <div className="p-4 sm:p-5">
                <p className="text-xs text-gray-400 mb-1 truncate">
                  {product.categoryName} · {product.brandName}
                </p>
                <Link href={`/materials/${product.slug}`}>
                  <h3 className="text-sm sm:text-base text-gray-600 mb-1.5 line-clamp-1 hover:text-gray-900 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                {product.showPrice ? (
                  <p className="text-lg sm:text-xl font-bold text-gray-900">
                    {product.priceDisplay}
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-primary">
                    Request Price
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* View all CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.4 }}
          className="flex justify-center mt-10 sm:mt-12"
        >
          <Link
            href="/bogat/materials"
            className="px-7 py-3 border border-gray-300 text-gray-700 font-semibold rounded-full text-sm hover:bg-gray-50 hover:border-gray-400 transition-all"
          >
            View All Materials
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
