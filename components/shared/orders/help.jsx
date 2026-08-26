// components/orders/HelpSection.jsx
"use client";

import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import Link from "next/link";

export default function HelpSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="rounded-2xl border border-white/08 p-6"
      style={{ background: "#0d0b08" }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "rgba(212,175,55,0.12)" }}
        >
          <HelpCircle className="w-5 h-5 text-[#D4AF37]" />
        </div>
        <div>
          <h3 className="text-[16px] font-semibold text-white mb-2">Have a question?</h3>
          <p className="text-[14px] text-white/40 mb-4 leading-relaxed">
            Our renovation experts are here to help with your order.
          </p>
          <Link
            href="/contact"
            className="text-[14px] font-semibold text-[#D4AF37] hover:text-[#D4AF37]/70 transition-colors"
          >
            Contact Us →
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
