// components/cart/RelatedProducts.jsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAddToCart } from "@/hooks/use-cart";
import { ShoppingCart } from "lucide-react";

const PLACEHOLDER =
  "/product-placeholder.svg";

async function fetchFeaturedProducts() {
  const res = await fetch(
    "/api/products?isFeatured=true&pageSize=4&ActiveOnly=true",
  );
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.items ?? [];
}

export default function RelatedProducts() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["products", "featured-for-cart"],
    queryFn: fetchFeaturedProducts,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const addToCart = useAddToCart();

  if (isLoading || !products || products.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mt-16"
    >
      <h2 className="text-[28px] font-bold text-white mb-8">
        You might also need
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
            className="overflow-hidden group"
            style={{ background: "#0d0b08" }}
          >
            {/* Image */}
            <Link href={`/materials/${product.slug}`}>
              <div className="relative aspect-square bg-[#1a1a1a] overflow-hidden">
                <Image
                  src={
                    product.primaryImageUrl ||
                    product.images?.[0] ||
                    PLACEHOLDER
                  }
                  alt={product.name}
                  fill
                  className="object-contain group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
            </Link>

            <div className="p-4">
              <Link href={`/materials/${product.slug}`}>
                <h3 className="text-[15px] font-semibold text-white mb-1 line-clamp-2 min-h-10 hover:text-[#D4AF37] transition-colors">
                  {product.name}
                </h3>
              </Link>
              <p className="text-[12px] text-white/40 mb-3">
                {product.categoryName} · {product.brandName}
              </p>

              <div className="flex items-center justify-between gap-2">
                {product.showPrice ? (
                  <span className="text-[16px] font-bold text-white">
                    {product.priceDisplay}
                  </span>
                ) : (
                  <span className="text-[13px] font-semibold text-white/60">
                    Request Price
                  </span>
                )}

                {product.inStock && (
                  <button
                    onClick={() =>
                      addToCart.mutate(
                        { product, quantity: 1 },
                        { onSuccess: () => {} },
                      )
                    }
                    disabled={addToCart.isPending}
                    className="p-2 rounded-lg transition-colors disabled:opacity-50 shrink-0 text-black"
                    style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
                    aria-label={`Add ${product.name} to cart`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
