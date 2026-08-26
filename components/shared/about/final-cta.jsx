"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="bg-black py-20 px-4 sm:px-6 lg:px-8 font-manrope">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl"
          style={{ background: "#0d0b08", boxShadow: "0 0 0 1px rgba(255,255,255,0.06)" }}
        >
          {/* Top gold line */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)" }} />
          {/* Glow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(212,175,55,0.08) 0%, transparent 70%)" }} />

          <div className="relative z-10 py-20 px-8 sm:px-16 text-center">
            <span className="inline-block text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.2em] mb-6">
              Let&apos;s build something great
            </span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 tracking-tight font-poppins leading-tight"
            >
              Ready to Create Your Dream Space?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-white/45 text-base sm:text-lg mb-12 max-w-xl mx-auto"
            >
              Don&apos;t just imagine it. See it, build it, and live in it with TBM.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <Link
                href="/consultation"
                className="inline-flex items-center justify-center rounded-xl px-8 py-4 text-black font-semibold text-[11px] tracking-[0.2em] uppercase hover:opacity-90 transition-opacity w-full sm:w-auto"
                style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
              >
                Start Your Project
              </Link>
              <Link
                href="/consultation"
                className="relative inline-flex rounded-xl p-px w-full sm:w-auto hover:opacity-90 transition-opacity"
                style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
              >
                <span className="inline-flex items-center justify-center rounded-[11px] bg-[#0d0b08] px-8 py-4 text-[#D4AF37] font-semibold text-[11px] tracking-[0.2em] uppercase w-full">
                  Book a Paid Site Inspection
                </span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
