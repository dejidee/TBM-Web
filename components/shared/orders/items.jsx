// components/orders/OrderItems.jsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const PLACEHOLDER = "/product-placeholder.svg";

/** An order line item — `{ productName, productImageUrl, quantity, unitPrice, subTotal }` (lib/api/schemas/orders.ts). No description field exists here. */
export default function OrderItems({ items }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-2xl border border-white/08 p-6"
      style={{ background: "#0d0b08" }}
    >
      <h2 className="text-[18px] font-semibold text-white mb-6">
        Items in this shipment ({items?.length || 0})
      </h2>

      <div className="space-y-6">
        {items?.map((item, index) => {
          const lineTotal = item.subTotal ?? item.unitPrice * item.quantity;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              className="flex gap-4 pb-6 border-b border-white/06 last:border-0 last:pb-0"
            >
              <div className="relative w-20 h-20 shrink-0 bg-surface-raised rounded-lg overflow-hidden">
                <Image
                  src={item.productImageUrl || PLACEHOLDER}
                  alt={item.productName}
                  fill
                  className="object-contain"
                  sizes="80px"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-semibold text-white mb-1">{item.productName}</h3>
                {item.productSKU && (
                  <p className="text-[13px] text-white/40 mb-2">{item.productSKU}</p>
                )}
              </div>

              <div className="text-right shrink-0">
                <p className="text-[13px] text-white/40 mb-1">Qty: {item.quantity}</p>
                <p className="text-[16px] font-bold text-white">
                  ₦{lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
