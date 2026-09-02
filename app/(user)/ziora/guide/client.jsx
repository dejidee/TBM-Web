"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const STEPS = [
  {
    number: "01",
    action: "Click 'Ziora' in the top navigation bar.",
    detail:
      "This opens the Ziora overview page where you can learn about features and pick a plan.",
    fullShot: "/guide/ziora/01-ziora-hero.png",
    fullAlt: "Ziora overview page showing hero section",
  },
  {
    number: "02",
    action:
      "Pick a plan. Start free with Economy, upgrade whenever you need more.",
    detail:
      "Scroll down on the Ziora page and click 'Choose Plan'. The Economy plan is free to start.",
    fullShot: "/guide/ziora/05-pricing-plans.png",
    fullAlt: "Ziora pricing plans page",
  },
  {
    number: "03",
    action: "Don't have an account? Click 'Login' → then 'Sign Up'.",
    detail: "Fill in your name, email, phone and password. Takes 30 seconds.",
    fullShot: "/guide/ziora/03-sign-up.png",
    fullAlt: "Create Account form",
  },
  {
    number: "04",
    action:
      "Already registered? Enter your email and password, then click 'Sign In'.",
    detail: null,
    fullShot: "/guide/ziora/02-dashboard-ai-designs.png",
    fullAlt: "Sign In page",
  },
  {
    number: "05",
    action:
      "Once logged in, click 'My Ziora Designs' in your sidebar, then click 'Create New Design'.",
    detail:
      "The gold 'Create New Design' button is at the top right of the page.",
    fullShot: "/guide/ziora/06-dashboard-ai-designs.png",
    fullAlt:
      "Dashboard Ziora Designs page showing the Create New Design button",
  },
  {
    number: "06",
    action:
      "Choose 'Still Image' or 'Video Tour', then describe what you want.",
    detail:
      "Write in plain English, e.g. 'A modern bedroom with warm wood tones and soft lighting'.",
    fullShot: "/guide/ziora/07-new-design-modal.png",
    fullAlt:
      "Create a New Design modal showing type selection and description field",
  },
  {
    number: "07",
    action: "Select the style tags that match your vision.",
    detail:
      "Tap chips like 'Luxury interior', 'Scandinavian style', or 'Bathroom design' to narrow the style.",
    fullShot: "/guide/ziora/08-new-design-upload.png",
    fullAlt: "Style tag selection inside the new design modal",
  },
  {
    number: "08",
    action:
      "Upload a clear photo of your room, then click 'Generate My Design'.",
    detail:
      "Use a JPG or PNG. Avoid dark, blurry or half-cropped photos for best results.",
    fullShot: "/guide/ziora/09-new-design-photo-upload.png",
    fullAlt: "Photo upload area and Generate My Design button",
  },
  {
    number: "09",
    action:
      "Your design appears as a card. Click '...' to Download, Share, or Edit.",
    detail:
      "Use 'Share' to copy a shareable link. Use 'Download' to save the image to your device.",
    fullShot: "/guide/ziora/10-design-cards.png",
    fullAlt: "Generated design cards in the Ziora Designs dashboard",
    cropShot: "/guide/ziora/11-design-card-menu.png",
    cropLabel: "The '...' menu on your design card",
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
            alt={step.fullAlt}
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
              Zoom in: actions available on each design card
            </p>
            <div
              className="overflow-hidden border"
              style={{
                borderColor: "rgba(212,175,55,0.28)",
                maxWidth: "520px",
              }}
            >
              <Image
                src={step.cropShot}
                alt={step.cropLabel || "Detail"}
                width={700}
                height={400}
                className="w-full h-auto block"
                unoptimized
              />
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

export default function ZioraGuideClient() {
  return (
    <div
      className="min-h-screen font-manrope overflow-x-hidden"
      style={{ background: "#070604" }}
    >
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
            background:
              "radial-gradient(ellipse, rgba(212,175,55,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-px"
          style={{
            width: "700px",
            background:
              "linear-gradient(90deg,transparent,rgba(212,175,55,0.45),transparent)",
          }}
        />

        <div className="max-w-5xl mx-auto px-6 sm:px-10">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#D4AF37] text-[10px] font-bold tracking-[0.42em] uppercase mb-7"
          >
            Ziora AI · User Guide
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.07 }}
            className="font-poppins font-extrabold text-white leading-[1.04] mb-6"
            style={{ fontSize: "clamp(46px, 8vw, 100px)" }}
          >
            How to Use
            <br />
            <span className="text-[#D4AF37]">Ziora AI</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.13 }}
            className="text-white/38 text-base sm:text-lg leading-relaxed mb-12 max-w-lg"
          >
            9 steps. From sign-up to your first generated design.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.22 }}
            className="flex flex-wrap gap-x-8 gap-y-3"
          >
            {[
              "No technical knowledge needed",
              "Free to start",
              "Results in minutes",
            ].map((t) => (
              <span
                key={t}
                className="flex items-center gap-2 text-[11px] text-white/30"
              >
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
          style={{
            background:
              "radial-gradient(ellipse at 50% 100%, rgba(212,175,55,0.07) 0%, transparent 60%)",
          }}
        />
        <div
          className="pointer-events-none mx-auto h-px mb-20"
          style={{
            maxWidth: "520px",
            background:
              "linear-gradient(90deg,transparent,rgba(212,175,55,0.32),transparent)",
          }}
        />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-poppins font-extrabold text-white leading-[1.05] mb-5"
          style={{ fontSize: "clamp(38px, 6.5vw, 80px)" }}
        >
          Ready? <span className="text-[#D4AF37]">Start Designing.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 }}
          className="text-white/35 text-sm sm:text-base mb-10"
        >
          Free to start. No credit card needed.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.14 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link href="/dashboard/ai-designs" className="btn-gold px-10 py-4">
            Open Ziora <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link href="/ziora" className="btn-outline px-10 py-4">
            Ziora Overview
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
