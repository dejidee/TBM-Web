// components/cart/CartItem.jsx
"use client";

import { motion } from "framer-motion";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useUpdateQuantity, useRemoveItem } from "@/hooks/use-cart";
import { useState } from "react";

const PLACEHOLDER =
  "/product-placeholder.svg";

export default function CartItem({ item, index }) {
  const [quantity, setQuantity] = useState(item.quantity);
  const updateQuantity = useUpdateQuantity();
  const removeItem = useRemoveItem();

  const handleQuantityChange = (newQty) => {
    const clamped = Math.max(
      1,
      item.stockQuantity ? Math.min(item.stockQuantity, newQty) : newQty,
    );
    setQuantity(clamped);
    updateQuantity.mutate({ itemId: item.id, quantity: clamped });
  };

  const handleRemove = () => {
    removeItem.mutate(item.id);
  };

  const totalPrice =
    item.price != null ? (item.price * quantity).toLocaleString() : null;
  const isInStock = item.inStock !== false;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -80 }}
      transition={{ duration: 0.28, delay: index * 0.05 }}
      className="p-4 sm:p-6"
    >
      {/* ── Desktop layout ── */}
      <div className="hidden md:grid md:grid-cols-[1fr_120px_140px_40px] gap-4 items-center">
        {/* Product details */}
        <div className="flex gap-4 items-center">
          <div className="relative w-24 h-24 shrink-0 bg-[#1a1a1a] rounded-xl overflow-hidden">
            <Image
              src={item.image || PLACEHOLDER}
              alt={item.name}
              fill
              className="object-contain"
              sizes="96px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-semibold text-white mb-1 line-clamp-2">
              {item.name}
            </h3>
            {(item.brandName || item.categoryName) && (
              <p className="text-[12px] text-white/40 mb-2">
                {[item.brandName, item.categoryName]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
            <span
              className={`inline-block px-2.5 py-1 text-[11px] font-medium rounded-md ${
                isInStock
                  ? "bg-green-900/30 text-green-400"
                  : "bg-red-900/20 text-red-400"
              }`}
            >
              {isInStock ? "In Stock" : "Out of Stock"}
            </span>
            {item.price != null && (
              <p className="text-[12px] text-white/40 mt-2">
                ₦{item.price.toLocaleString()}/unit
              </p>
            )}
          </div>
        </div>

        {/* Quantity */}
        <div className="flex justify-center">
          <QuantityControl
            quantity={quantity}
            onChange={handleQuantityChange}
            isPending={updateQuantity.isPending}
            stockQuantity={item.stockQuantity}
          />
        </div>

        {/* Price */}
        <div className="text-right">
          {totalPrice != null ? (
            <p className="text-[17px] font-bold text-white">₦{totalPrice}</p>
          ) : (
            <p className="text-[14px] font-semibold text-white">
              Request Price
            </p>
          )}
          <p className="text-[12px] text-white/40 mt-0.5">
            {quantity} unit{quantity !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Delete */}
        <div className="flex justify-end">
          <button
            onClick={handleRemove}
            disabled={removeItem.isPending}
            className="p-2 text-[#ef4444] hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Mobile layout ── */}
      <div className="flex md:hidden gap-3">
        {/* Thumbnail */}
        <div className="relative w-18 h-18 shrink-0 bg-[#1a1a1a] rounded-xl overflow-hidden">
          <Image
            src={item.image || PLACEHOLDER}
            alt={item.name}
            fill
            className="object-contain"
            sizes="72px"
          />
        </div>

        {/* Right side */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          {/* Name + delete */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[14px] font-semibold text-white leading-snug line-clamp-2 flex-1">
              {item.name}
            </h3>
            <button
              onClick={handleRemove}
              disabled={removeItem.isPending}
              className="p-1.5 text-[#ef4444] hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 shrink-0 -mt-0.5"
              aria-label="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Brand / category */}
          {(item.brandName || item.categoryName) && (
            <p className="text-[12px] text-white/40 leading-none">
              {[item.brandName, item.categoryName].filter(Boolean).join(" · ")}
            </p>
          )}

          {/* Stock badge + unit price */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-block px-2 py-0.5 text-[16px] font-medium rounded-md ${
                isInStock
                  ? "bg-green-900/30 text-green-400"
                  : "bg-red-900/20 text-red-400"
              }`}
            >
              {isInStock ? "In Stock" : "Out of Stock"}
            </span>
            {item.price != null && (
              <p className="text-[11px] text-white/40">
                ₦{item.price.toLocaleString()}/unit
              </p>
            )}
          </div>

          {/* Quantity + total price inline */}
          <div className="flex items-center justify-between mt-1">
            <QuantityControl
              quantity={quantity}
              onChange={handleQuantityChange}
              isPending={updateQuantity.isPending}
              stockQuantity={item.stockQuantity}
              compact
            />

            <div className="text-right">
              {totalPrice != null ? (
                <p className="text-[15px] font-bold text-white">
                  ₦{totalPrice}
                </p>
              ) : (
                <p className="text-[12px] font-semibold text-white">
                  Request Price
                </p>
              )}
              <p className="text-[11px] text-white/40">
                {quantity} unit{quantity !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function QuantityControl({
  quantity,
  onChange,
  isPending,
  stockQuantity,
  compact = false,
}) {
  const btnSize = compact ? "p-1.5" : "p-2";
  const iconSize = compact ? "w-3.5 h-3.5" : "w-4 h-4";
  const inputWidth = compact ? "w-10" : "w-16";
  const textSize = compact ? "text-[13px]" : "text-[14px]";

  return (
    <div className="inline-flex items-center border border-white/10 rounded-lg overflow-hidden">
      <button
        onClick={() => onChange(quantity - 1)}
        disabled={quantity <= 1 || isPending}
        className={`${btnSize} hover:bg-white/05 transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <Minus className={`${iconSize} text-white/50`} />
      </button>
      <input
        type="number"
        value={quantity}
        min={1}
        max={stockQuantity || undefined}
        onChange={(e) => onChange(parseInt(e.target.value) || 1)}
        className={`${inputWidth} text-center ${textSize} font-medium text-white border-x border-white/10 py-1.5 focus:outline-none bg-transparent`}
      />
      <button
        onClick={() => onChange(quantity + 1)}
        disabled={
          isPending || (stockQuantity != null && quantity >= stockQuantity)
        }
        className={`${btnSize} hover:bg-white/05 transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <Plus className={`${iconSize} text-white/50`} />
      </button>
    </div>
  );
}
