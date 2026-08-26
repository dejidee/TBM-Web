// components/dashboard/Consultations.jsx
"use client";

import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useConsultations } from "@/hooks/use-user-dashboard";

const cardClass = "rounded-2xl p-6 border border-white/08";
const cardStyle = { background: "#0d0b08" };

export default function Consultations() {
  const { data: consultations, isLoading, isError } = useConsultations();

  if (isLoading) {
    return (
      <div className={cardClass} style={cardStyle}>
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-white/30" />
          <h2 className="text-[16px] font-semibold text-white">Consultations</h2>
        </div>
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/06 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-white/06 rounded w-3/4 mb-2" />
              <div className="h-3 bg-white/06 rounded w-1/2" />
            </div>
          </div>
          <div className="h-12 bg-white/06 rounded-lg w-full" />
        </div>
      </div>
    );
  }

  if (isError || !consultations) {
    return (
      <div className={cardClass} style={cardStyle}>
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-white/30" />
          <h2 className="text-[16px] font-semibold text-white">Consultations</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-[14px] text-white/30">No consultations scheduled</p>
          <Link
            href="/consultation"
            className="mt-4 inline-flex items-center justify-center min-h-11 px-5 rounded-lg text-[13px] font-medium text-[#D4AF37] border border-[#D4AF37]/30 hover:bg-[#D4AF37]/08 transition-colors"
          >
            Book a Consultation
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className={cardClass}
      style={cardStyle}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-white/30" />
          <h2 className="text-[16px] font-semibold text-white">Consultations</h2>
        </div>
        {consultations.canBook && (
          <Link
            href="/consultation"
            className="text-[13px] text-[#D4AF37] font-medium hover:text-[#D4AF37]/80 transition-colors"
          >
            Book New
          </Link>
        )}
      </div>

      {consultations.upcoming && (
        <>
          <div className="mb-4">
            <p className="text-[12px] text-white/30 mb-3 uppercase tracking-widest">Up Next</p>

            <div className="flex items-start gap-3 mb-4">
              <div className="relative w-10 h-10 shrink-0">
                <Image
                  src={consultations.upcoming.consultant.avatar}
                  alt={consultations.upcoming.consultant.name}
                  fill
                  className="object-cover rounded-full"
                  sizes="40px"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-semibold text-white">
                  Video Call with {consultations.upcoming.consultant.name}
                </h3>
                <p className="text-[13px] text-white/40 mt-0.5">
                  {consultations.upcoming.date}
                </p>
              </div>
            </div>

            <div className="rounded-lg p-4 mb-4" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-[12px] text-white/30 mb-1">Topic:</p>
              <p className="text-[13px] text-white/60 leading-relaxed">
                {consultations.upcoming.topic}
              </p>
            </div>
          </div>

          <button
            className="w-full text-[14px] font-medium py-3 rounded-lg transition-opacity hover:opacity-90 text-black"
            style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
          >
            Prepare for Call
          </button>
        </>
      )}
    </motion.div>
  );
}
