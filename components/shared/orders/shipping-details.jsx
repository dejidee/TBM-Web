// components/orders/ShippingDetails.jsx
"use client";

import { motion } from "framer-motion";
import { MapPin, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useCopyTracking } from "@/hooks/use-order-details";

/**
 * Order shipping fields are flat — `shippingFullName`, `shippingAddress`,
 * `shippingCity`, `shippingState`, `shippingPhone` — not a nested
 * `shipping.address.{line1,city,country}` object, and there is no carrier
 * field anywhere on the response (lib/api/schemas/orders.ts). Only
 * `trackingNumber` exists, and it was null on every order observed so far.
 */
export default function ShippingDetails({ order }) {
  const [copied, setCopied] = useState(false);
  const copyTracking = useCopyTracking();

  const handleCopy = () => {
    copyTracking.mutate(order?.trackingNumber, {
      onSuccess: () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-2xl border border-white/08 p-6"
      style={{ background: "#0d0b08" }}
    >
      {/* Shipping Address */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-[#D4AF37]" />
          <h3 className="text-[16px] font-semibold text-white">Shipping Details</h3>
        </div>

        <div className="text-[14px] leading-relaxed">
          <p className="font-semibold text-white mb-1">{order?.shippingFullName}</p>
          <p className="text-white/45">
            {order?.shippingAddress}
            <br />
            {order?.shippingCity}, {order?.shippingState}
          </p>
          {order?.shippingPhone && (
            <p className="text-white/45 mt-1">{order.shippingPhone}</p>
          )}
        </div>
      </div>

      {/* Tracking Information — only when the backend has actually sent one */}
      {order?.trackingNumber && (
        <div className="pt-6 border-t border-white/06">
          <h4 className="text-[13px] font-semibold text-white/30 uppercase tracking-widest mb-3">
            Tracking
          </h4>
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-semibold text-white">{order.trackingNumber}</p>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-[13px] font-medium text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-md transition-colors flex items-center gap-1"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> COPY
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
