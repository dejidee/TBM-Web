"use client";
import { motion } from "framer-motion";

const features = [
  {
    feature: "Design Visualization",
    tbm: "AI-Assisted Rendering",
    traditional: "Slow, manual sketches",
  },
  {
    feature: "Material Sourcing",
    tbm: "Direct Digital Catalog",
    traditional: "Showroom hopping",
  },
  {
    feature: "Cost Transparency",
    tbm: "Clear, Upfront Quotes",
    traditional: "Estimates & hidden fees",
  },
  {
    feature: "Project Management",
    tbm: "Centralized Dashboard",
    traditional: "Emails & Phone Tag",
  },
];

const GoldCheck = () => (
  <svg
    className="w-4 h-4 text-[#D4AF37] shrink-0"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export default function WhyChooseTBM() {
  return (
    <section className="bg-[#050505] py-20 sm:py-24 px-4 sm:px-6 lg:px-8 font-manrope">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12 sm:mb-16"
        >
          <span className="inline-block text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.2em] mb-4">
            The TBM difference
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white font-poppins tracking-tight">
            Why Choose TBM?
          </h2>
          <p className="text-white/45 text-sm mt-4 max-w-lg">
            See how we stack up against traditional renovation services.
          </p>
        </motion.div>

        {/* Desktop table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="hidden md:block overflow-hidden"
          style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.08)" }}
        >
          {/* Header row */}
          <div className="grid grid-cols-3">
            <div className="p-5 lg:p-6 border-b border-white/08">
              <span className="text-xs font-bold text-white/40 uppercase tracking-[0.15em]">
                Feature
              </span>
            </div>
            <div
              className="p-5 lg:p-6 border-b border-[#D4AF37]/30"
              style={{ background: "rgba(212,175,55,0.08)" }}
            >
              <span className="text-sm lg:text-base font-bold text-[#D4AF37] tracking-wide">
                TBM Platform
              </span>
            </div>
            <div className="p-5 lg:p-6 border-b border-white/08">
              <span className="text-sm lg:text-base font-semibold text-white/40">
                Traditional Services
              </span>
            </div>
          </div>

          {/* Rows */}
          {features.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              viewport={{ once: true }}
              className={`grid grid-cols-3 ${index !== features.length - 1 ? "border-b border-white/06" : ""}`}
            >
              <div className="p-5 lg:p-6 flex items-center">
                <span className="text-white/70 text-sm lg:text-base">
                  {item.feature}
                </span>
              </div>
              <div
                className="p-5 lg:p-6 flex items-center gap-2.5"
                style={{ background: "rgba(212,175,55,0.04)" }}
              >
                <GoldCheck />
                <span className="text-white font-semibold text-sm lg:text-base">
                  {item.tbm}
                </span>
              </div>
              <div className="p-5 lg:p-6 flex items-center">
                <span className="text-white/40 text-sm lg:text-base">
                  {item.traditional}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile cards */}
        <div
          className="md:hidden space-y-px"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          {features.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 + index * 0.08 }}
              viewport={{ once: true }}
              className="bg-[#0d0b08] overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-white/08">
                <span className="text-[16px] font-bold text-white/40 uppercase tracking-[0.15em]">
                  Feature
                </span>
                <p className="text-white font-semibold text-sm mt-0.5">
                  {item.feature}
                </p>
              </div>
              <div className="grid grid-cols-2">
                <div
                  className="px-4 py-4 flex flex-col gap-1.5"
                  style={{ background: "rgba(212,175,55,0.06)" }}
                >
                  <span className="text-[16px] font-bold text-[#D4AF37] uppercase tracking-wider">
                    TBM
                  </span>
                  <div className="flex items-start gap-1.5">
                    <GoldCheck />
                    <span className="text-white font-semibold text-sm leading-snug">
                      {item.tbm}
                    </span>
                  </div>
                </div>
                <div className="px-4 py-4 flex flex-col gap-1.5 border-l border-white/08">
                  <span className="text-[16px] font-bold text-white/40 uppercase tracking-wider">
                    Traditional
                  </span>
                  <span className="text-white/40 text-sm leading-snug">
                    {item.traditional}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
