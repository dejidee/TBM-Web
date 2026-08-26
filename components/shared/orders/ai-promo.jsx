// components/orders/AIVisualizerPromo.jsx
"use client";

import { motion } from "framer-motion";
import { Wand2 } from "lucide-react";
import Link from "next/link";

export default function AIVisualizerPromo({ items }) {
  // The copy used to name "the Italian Carrara Marble" regardless of what was
  // ordered — a product from the old mock catalogue that no order can contain.
  // Name the item the shopper actually bought, or say nothing specific.
  // Order line items carry `productName`, not `name` (lib/api/schemas/orders.ts).
  const visualizable = items?.find((item) =>
    /\b(tile|tiles|marble|granite|stone|flooring)\b/i.test(item.productName ?? ""),
  );

  if (!visualizable) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="rounded-2xl p-6 overflow-hidden relative border"
      style={{
        background: "linear-gradient(135deg, rgba(212,175,55,0.10) 0%, rgba(184,150,46,0.06) 100%)",
        borderColor: "rgba(212,175,55,0.25)",
      }}
    >
      {/* Decorative rings */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full border-2 border-[#D4AF37] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full border-2 border-[#D4AF37] translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Wand2 className="w-5 h-5 text-[#D4AF37]" />
          <span className="text-[12px] font-semibold uppercase tracking-wide text-[#D4AF37]">Ziora</span>
        </div>

        <h3 className="text-[20px] font-bold text-white mb-2">Visualize your space</h3>
        <p className="text-[14px] text-white/60 mb-6 leading-relaxed">
          While you wait, see how your {visualizable.productName} looks in your own
          space using Ziora.
        </p>

        <Link
          href="/ai-visualizer"
          className="block w-full text-black text-center py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
        >
          Design with Ziora
        </Link>
      </div>
    </motion.div>
  );
}
