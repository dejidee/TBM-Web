"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingCart, CreditCard } from "lucide-react";

const STEPS = [
  {
    number: "01",
    action: "Click 'Marketplace' in the top navigation bar.",
    detail: "This takes you to the full Bogat product catalogue.",
    fullShot: "/guide/bogat/01-marketplace-full.png",
    fullAlt: "Bogat Marketplace page",
    cropShot: null,
  },
  {
    number: "02",
    action: "Use the left panel to filter by Category, Brand, or Price.",
    detail: "Tick a category like 'Bathroom Vanity' to show only those products.",
    fullShot: "/guide/bogat/01-marketplace-full.png",
    fullAlt: "Marketplace with filter sidebar",
    cropShot: "/guide/bogat/02-filter-sidebar.png",
    cropLabel: "The filter panel — on the left side of the page",
  },
  {
    number: "03",
    action: "Click on any product card to open it.",
    detail: "You'll see the full gallery, sizes, specifications, and price.",
    fullShot: "/guide/bogat/03-product-grid.png",
    fullAlt: "Product grid view",
    cropShot: null,
  },
  {
    number: "04",
    action: "Tap a size or finish button to select your variant.",
    detail: "The price updates automatically when you switch sizes.",
    fullShot: "/guide/bogat/05-variant-selector.png",
    fullAlt: "Product detail with variant selector",
    cropShot: null,
  },
  {
    number: "05",
    action: "Tap 'Buy Now' to go straight to checkout — or 'Add to Cart' to keep browsing.",
    detail: "Some products show 'Request Price' instead — tap it and TBM will send you a quote within 24 hours.",
    fullShot: "/guide/bogat/06-add-to-cart-buttons.png",
    fullAlt: "Buy Now and Add to Cart buttons",
    cropShot: null,
  },
  {
    number: "06",
    action: "Enter your delivery address and complete payment.",
    detail: "We deliver across Abuja and Lagos within 3–7 business days.",
    fullShot: null,
    Icon: CreditCard,
  },
];

function StepSection({ step }) {
  return (
    <div className="relative">
      {/* Giant ghost step number */}
      <div
        aria-hidden
        className="pointer-events-none select-none absolute -top-4 left-0 overflow-hidden leading-none"
        style={{ opacity: 0.028 }}
      >
        <span
          className="font-poppins font-extrabold text-white"
          style={{ fontSize: "clamp(130px, 23vw, 280px)" }}
        >
          {step.number}
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55 }}
        className="relative pt-16 pb-20 sm:pt-22 sm:pb-28"
      >
        {/* Step label + action + detail */}
        <div className="max-w-5xl mx-auto px-6 sm:px-10 mb-10 sm:mb-14">
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.04 }}
            className="block text-[10px] font-bold tracking-[0.42em] uppercase font-manrope mb-5"
            style={{ color: "rgba(212,175,55,0.55)" }}
          >
            Step {step.number}
          </motion.span>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.07 }}
            className="font-poppins font-extrabold text-white leading-[1.08] mb-5"
            style={{ fontSize: "clamp(28px, 4.2vw, 54px)" }}
          >
            {step.action}
          </motion.p>
          {step.detail && (
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.12 }}
              className="text-white/38 text-sm sm:text-[15px] leading-relaxed font-manrope max-w-2xl"
            >
              {step.detail}
            </motion.p>
          )}
        </div>

        {step.fullShot ? (
          <>
            {/* Full-bleed screenshot */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.1, duration: 0.55 }}
              className="overflow-hidden border mx-4 sm:mx-8 lg:mx-14"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
              <Image
                src={step.fullShot}
                alt={step.fullAlt || `Step ${step.number}`}
                width={1600}
                height={900}
                className="w-full h-auto block"
                unoptimized
              />
            </motion.div>

            {/* Crop detail */}
            {step.cropShot && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="max-w-5xl mx-auto px-6 sm:px-10 mt-8"
              >
                <p className="text-[10px] font-bold text-[#D4AF37]/45 uppercase tracking-[0.3em] font-manrope mb-4">
                  ↑ Look for this on the left side
                </p>
                <div
                  className="overflow-hidden border"
                  style={{ borderColor: "rgba(212,175,55,0.28)", maxWidth: "240px" }}
                >
                  <Image
                    src={step.cropShot}
                    alt={step.cropLabel || "Detail"}
                    width={220}
                    height={400}
                    className="w-full h-auto block"
                    unoptimized
                  />
                </div>
                {step.cropLabel && (
                  <p className="text-white/25 text-[11px] font-manrope mt-2">{step.cropLabel}</p>
                )}
              </motion.div>
            )}
          </>
        ) : (
          /* Icon card for steps without a screenshot */
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-4 sm:mx-8 lg:mx-14"
          >
            <div
              className="flex items-center gap-7 border p-10 sm:p-14"
              style={{ background: "#0d0b08", borderColor: "rgba(212,175,55,0.12)" }}
            >
              {step.Icon && (
                <div
                  className="w-18 h-18 rounded-full border flex items-center justify-center shrink-0"
                  style={{ borderColor: "rgba(212,175,55,0.3)", background: "rgba(212,175,55,0.06)" }}
                >
                  <step.Icon className="w-8 h-8 text-[#D4AF37]" strokeWidth={1.3} />
                </div>
              )}
              <p className="text-white/38 text-base sm:text-lg font-manrope leading-relaxed">
                You'll complete this on the{" "}
                <strong className="text-white/65">checkout page</strong> after adding items to your cart.
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Step separator */}
      <div
        className="mx-6 sm:mx-10 h-px"
        style={{ background: "rgba(255,255,255,0.05)" }}
      />
    </div>
  );
}

export default function BogatGuideClient() {
  return (
    <div className="min-h-screen font-manrope overflow-x-hidden" style={{ background: "#070503" }}>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section
        className="relative pt-36 pb-20 sm:pt-48 sm:pb-28 overflow-hidden border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "700px",
            height: "380px",
            background: "radial-gradient(ellipse, rgba(212,175,55,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-px"
          style={{ width: "700px", background: "linear-gradient(90deg,transparent,rgba(212,175,55,0.45),transparent)" }}
        />

        <div className="max-w-5xl mx-auto px-6 sm:px-10">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#D4AF37] text-[10px] font-bold tracking-[0.42em] uppercase mb-7"
          >
            Bogat Marketplace · Shopping Guide
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.07 }}
            className="font-poppins font-extrabold text-white leading-[1.04] mb-6"
            style={{ fontSize: "clamp(46px, 8vw, 100px)" }}
          >
            How to Shop<br />
            <span className="text-[#D4AF37]">with Bogat</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.13 }}
            className="text-white/38 text-base sm:text-lg leading-relaxed mb-12 max-w-lg"
          >
            6 steps. From browsing to doorstep delivery.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.22 }}
            className="flex flex-wrap gap-x-8 gap-y-3"
          >
            {["Verified authentic products", "Delivery across Nigeria", "Expert support available"].map((t) => (
              <span key={t} className="flex items-center gap-2 text-[11px] text-white/30">
                <span className="w-1 h-1 rounded-full bg-[#D4AF37]/50" />
                {t}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── STEPS ─────────────────────────────────────────────── */}
      <div>
        {STEPS.map((step) => (
          <StepSection key={step.number} step={step} />
        ))}
      </div>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="relative py-32 sm:py-40 text-center px-6 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(212,175,55,0.07) 0%, transparent 60%)" }}
        />
        <div
          className="pointer-events-none mx-auto h-px mb-20"
          style={{ maxWidth: "520px", background: "linear-gradient(90deg,transparent,rgba(212,175,55,0.32),transparent)" }}
        />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-poppins font-extrabold text-white leading-[1.05] mb-5"
          style={{ fontSize: "clamp(38px, 6.5vw, 80px)" }}
        >
          Ready to Browse?{" "}
          <span className="text-[#D4AF37]">Let's Go.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 }}
          className="text-white/35 text-sm sm:text-base mb-10"
        >
          Premium materials. Delivered to your door.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.14 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/bogat/materials"
            className="btn-gold px-10 py-4"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Browse the Marketplace
          </Link>
          <Link
            href="/bogat"
            className="btn-outline px-10 py-4"
          >
            About Bogat <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      </section>

    </div>
  );
}
