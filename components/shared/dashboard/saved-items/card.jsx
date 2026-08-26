// components/shared/dashboard/saved-items/card.jsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Trash2, CheckSquare, Square } from "lucide-react";
import { useRemoveSaved, useAddSavedToCart } from "@/hooks/use-saved";

const PLACEHOLDER = "/product-placeholder.svg";

export default function SavedItemCard({ item, index, isSelected, onToggleSelect }) {
  const removeSaved = useRemoveSaved();
  const addToCart = useAddSavedToCart();

  const name = item.productName || item.name || "Unnamed Item";
  const category = item.categoryName || item.category || "";
  const image = item.productImageUrl || item.imageUrl || item.image || PLACEHOLDER;
  const { price } = item;
  const priceDisplay = item.priceDisplay || (price ? `₦${price.toLocaleString()}.00` : null);
  const inStock = item.inStock ?? item.isAvailable ?? true;
  const slug = item.productSlug || item.slug;
  const detailHref = slug ? `/materials/${slug}` : "#";

  const handleRemove = (e) => { e.preventDefault(); removeSaved.mutate({ savedId: item.id }); };
  const handleAddToCart = (e) => { e.preventDefault(); addToCart.mutate({ savedId: item.id }); };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="group relative rounded-2xl overflow-hidden border transition-all duration-200"
      style={
        isSelected
          ? { background: "#0d0b08", borderColor: "rgba(212,175,55,0.50)", boxShadow: "0 0 0 1px rgba(212,175,55,0.20)" }
          : { background: "#0d0b08", borderColor: "rgba(255,255,255,0.08)" }
      }
    >
      {/* Selection checkbox */}
      <button
        onClick={(e) => { e.preventDefault(); onToggleSelect(item.id); }}
        className="absolute top-3 left-3 z-10 transition-opacity"
        aria-label="Select item"
      >
        {isSelected ? (
          <CheckSquare className="w-5 h-5 text-[#D4AF37] drop-shadow-sm" />
        ) : (
          <Square className="w-5 h-5 text-white drop-shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </button>

      {/* Remove button */}
      <button
        onClick={handleRemove}
        disabled={removeSaved.isPending}
        className="absolute top-3 right-3 z-10 w-7 h-7 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-red-900/30 disabled:opacity-50"
        style={{ background: "rgba(0,0,0,0.60)" }}
        aria-label="Remove from saved"
      >
        <Trash2 className="w-3.5 h-3.5 text-red-400" />
      </button>

      {/* Image */}
      <Link href={detailHref}>
        <div className="relative aspect-square bg-[#1a1a1a] overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain group-hover:scale-105 transition-transform duration-300"
          />
          {!inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-xs font-semibold px-3 py-1 bg-black/60 rounded-full">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        {category && (
          <p className="text-[11px] font-semibold text-[#D4AF37] uppercase tracking-wide mb-1 truncate">
            {category}
          </p>
        )}
        <Link href={detailHref}>
          <h3 className="text-[14px] font-semibold text-white line-clamp-2 leading-snug mb-2 hover:text-[#D4AF37] transition-colors">
            {name}
          </h3>
        </Link>

        <div className="mb-3">
          {priceDisplay ? (
            <span className="text-[15px] font-bold text-white">{priceDisplay}</span>
          ) : (
            <span className="text-[13px] font-semibold text-[#D4AF37]">Request Price</span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={addToCart.isPending || !inStock}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-black hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          {addToCart.isPending ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </motion.div>
  );
}
