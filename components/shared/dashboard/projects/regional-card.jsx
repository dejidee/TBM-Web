// components/shared/dashboard/projects/regional-office-card.jsx
"use client";

import { motion } from "framer-motion";

export default function RegionalOfficeCard({ office, isLoading }) {
  const name = office?.name ?? "Regional Office: Pacific Northwest";
  const contact = office?.contact ?? "support@tbmbuilding.com";
  const imageSrc = office?.imageSrc ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.35 }}
      className="rounded-2xl border border-white/08 overflow-hidden"
      style={{ background: "#0d0b08" }}
    >
      {/* Image area */}
      <div
        className="w-full h-28"
        style={{
          backgroundImage: imageSrc ? `url(${imageSrc})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: imageSrc ? undefined : "rgba(212,175,55,0.08)",
        }}
      >
        {!imageSrc && (
          <div className="w-full h-full flex items-end justify-end p-3 opacity-20">
            <svg width="60" height="80" viewBox="0 0 60 80" fill="none">
              <path
                d="M30 80 C30 80 28 40 10 20 C20 30 30 25 30 25 C30 25 20 10 30 0 C40 10 30 25 30 25 C30 25 40 30 50 20 C32 40 30 80 30 80Z"
                fill="#D4AF37"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-4 py-3">
        <p className="text-[13px] font-bold text-white">{name}</p>
        <p className="text-[12px] text-white/35 mt-0.5">Contact: {contact}</p>
      </div>
    </motion.div>
  );
}
