"use client";

import { motion } from "framer-motion";
import { Wand2, MessageCircle } from "lucide-react";
import Image from "next/image";

export default function AIVisualizer() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl p-4 border"
      style={{
        background: "rgba(212,175,55,0.04)",
        borderColor: "rgba(212,175,55,0.15)",
      }}
    >
      {/* Header with Badges */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-xl text-black"
          style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
        >
          PRO FEATURE
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[#D4AF37] text-xs font-semibold">
          UNLOCK POTENTIAL
        </div>
      </div>

      {/* Title */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">
          Visualize this piece in your own room with Ziora.
        </h3>
      </div>

      {/* Launch Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3.5 border border-white/10 text-white font-semibold rounded-lg hover:bg-white/05 transition-colors flex items-center justify-center gap-2 mb-6 bg-transparent"
      >
        <Wand2 className="w-5 h-5 text-[#D4AF37]" />
        Design with Ziora
      </motion.button>

      {/* Consultant Card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-lg p-2 flex items-start gap-3"
        style={{ background: "rgba(255,255,255,0.03)" }}
      >
        <div className="shrink-0">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#1a1a1a]">
            <Image
              src="/consultant.svg"
              alt="Design Consultant"
              fill
              className="object-cover"
            />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-white">
              Unsure about sizing?
            </span>
          </div>
          <p className="text-sm text-white/50 leading-relaxed">
            Book a free 15-min consult.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="shrink-0 w-11 h-11 flex items-center justify-center rounded-full transition-colors"
          style={{ background: "rgba(212,175,55,0.12)" }}
        >
          <MessageCircle className="w-4 h-4 text-[#D4AF37]" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
