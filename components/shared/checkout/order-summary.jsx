// components/checkout/OrderSummary.jsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Lock, ArrowRight, Loader2 } from "lucide-react";

const PLACEHOLDER =
  "/product-placeholder.svg";

function SkeletonLine({ w = "w-full", h = "h-3" }) {
  return <div className={`${w} ${h} rounded bg-white/06 animate-pulse`} />;
}

export default function OrderSummary({
  checkout,
  currentStep,
  onSubmitPayment,
  promoDiscount = 0,
  isSubmitting = false,
}) {
  const loaded = !!checkout;

  const subtotal = checkout?.subtotal || 0;
  const shipping = checkout?.shipping || 0;
  const tax = checkout?.tax || 0;
  const discount = checkout?.discount || promoDiscount || 0;
  const total = Math.max(0, (checkout?.total || 0) - (promoDiscount || 0));

  const fmt = (n) =>
    `₦${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-2xl border border-white/08 p-6"
      style={{ background: "#0d0b08" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[18px] font-semibold text-white">Order Summary</h2>
        {loaded && (
          <span className="text-[13px] text-white/40">
            {checkout.items?.length || 0} item{checkout.items?.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Order Items */}
      <div className="space-y-4 mb-6 pb-6 border-b border-white/08">
        {loaded ? (
          checkout.items?.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="relative w-16 h-16 shrink-0 bg-[#1a1a1a] rounded-lg overflow-hidden">
                <Image
                  src={item.image || PLACEHOLDER}
                  alt={item.name}
                  fill
                  className="object-contain"
                  sizes="64px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[14px] font-semibold text-white mb-1 line-clamp-1">{item.name}</h3>
                <p className="text-[12px] text-white/40 mb-1">{item.description}</p>
                <p className="text-[12px] text-white/30">
                  Qty: {item.quantity}
                  {item.unit ? ` ${item.unit}` : ""}
                  {item.pricePerUnit && (
                    <span className="ml-2">@ ₦{item.pricePerUnit.toLocaleString()}/{item.unit || "ea"}</span>
                  )}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[15px] font-bold text-white">{fmt(item.price)}</p>
              </div>
            </div>
          ))
        ) : (
          /* skeleton rows while checkout data loads */
          [1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-16 h-16 shrink-0 rounded-lg bg-white/06 animate-pulse" />
              <div className="flex-1 space-y-2 py-1">
                <SkeletonLine w="w-3/4" h="h-3" />
                <SkeletonLine w="w-1/2" h="h-2.5" />
                <SkeletonLine w="w-1/3" h="h-2.5" />
              </div>
              <SkeletonLine w="w-16" h="h-4" />
            </div>
          ))
        )}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 mb-6">
        {loaded ? (
          <>
            <div className="flex justify-between text-[14px]">
              <span className="text-white/45">Subtotal</span>
              <span className="font-medium text-white">{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-white/45">Shipping</span>
              <span className="font-medium text-green-400">{shipping === 0 ? "Free" : fmt(shipping)}</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-white/45">Estimated Tax</span>
              <span className="font-medium text-white">{fmt(tax)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[14px]">
                <span className="text-green-400">Promo Discount</span>
                <span className="font-medium text-green-400">-{fmt(discount)}</span>
              </div>
            )}
          </>
        ) : (
          [1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between">
              <SkeletonLine w="w-24" h="h-3" />
              <SkeletonLine w="w-20" h="h-3" />
            </div>
          ))
        )}
      </div>

      {/* Total */}
      <div className="flex justify-between items-baseline mb-6 pb-6 border-b border-white/08">
        <span className="text-[16px] font-semibold text-white">Total</span>
        <div className="text-right">
          {loaded ? (
            <>
              <p className="text-[28px] font-bold text-white">{fmt(total)}</p>
              <p className="text-[12px] text-white/30">NGN</p>
            </>
          ) : (
            <SkeletonLine w="w-32" h="h-7" />
          )}
        </div>
      </div>

      {/* Confirm Button — desktop only; mobile/tablet use the sticky bottom bar */}
      {currentStep === 2 && (
        <button
          onClick={onSubmitPayment}
          disabled={isSubmitting}
          className="w-full py-4 rounded-lg font-semibold hidden lg:flex items-center justify-center gap-2 group transition-opacity hover:opacity-90 text-black disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Redirecting to Paystack…</span>
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              <span>Confirm &amp; Pay</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      )}

      {/* Security Note */}
      <div className="mt-4 flex items-center justify-center gap-2 text-[12px] text-white/30">
        <Lock className="w-4 h-4" />
        <span>256-bit SSL Encrypted Payment</span>
      </div>
    </motion.div>
  );
}
