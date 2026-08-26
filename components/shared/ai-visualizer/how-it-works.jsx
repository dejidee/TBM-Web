"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Upload, Cpu, ReceiptText, Hammer, ArrowRight } from "lucide-react";
import { enter, RISE } from "@/lib/theme/motion";

/**
 * The four steps, as an editorial sequence rather than a card grid.
 *
 * Composition is asymmetric on purpose: a sticky narrative rail on the left
 * holding the pitch and the action, and the steps stacked as numbered rows on
 * the right. Four equal boxes is the pattern every SaaS page reaches for, and
 * `transformation.jsx` already uses it two sections below — repeating it here
 * makes the page read as one long undifferentiated grid.
 *
 * Two structural rules worth keeping:
 *
 * · The separators are the rows' own borders, and the numerals sit inside the
 *   row grid. Nothing here is absolutely positioned against a guessed offset —
 *   the previous version laid a dashed connector across the row with hand-summed
 *   `calc()` values and `12.5%` column-centre guesses, and it drifted out of
 *   alignment at every width it had not been eyeballed at.
 *
 * · The numerals are the focal element, not the icons. Four stock glyphs
 *   (upload / chip / receipt / hammer) are the most generic thing this section
 *   could lead with, so they are demoted to a small mark at the end of the row.
 *
 * Each step names what the user *walks away with*, which is the part that earns
 * the section its place: it removes doubt, then hands off to the action.
 */
const STEPS = [
  {
    number: "01",
    Icon: Upload,
    title: "Upload Your Space",
    desc: "Start with what you already have — a floor plan, a rough sketch, or a photo taken on your phone.",
    outcome: "A digital model of your room",
  },
  {
    number: "02",
    Icon: Cpu,
    title: "AI Generates Designs",
    desc: "Ziora AI returns photoreal 3D concepts of the room, styled to your taste and your budget.",
    outcome: "Multiple concepts to compare",
  },
  {
    number: "03",
    Icon: ReceiptText,
    title: "Get Project Estimate — Coming Soon",
    desc: "Every concept will come costed to Nigerian market rates — construction, finishing and materials, line by line.",
    outcome: "An itemised cost breakdown (in development)",
  },
  {
    number: "04",
    Icon: Hammer,
    title: "Plan & Build",
    desc: "Refine the design you want, share it with your team, and move to site with the numbers already settled.",
    outcome: "A build-ready plan and budget",
  },
];

/** Gold gradient poured through the glyphs — the same ramp as `.btn-gold`. */
const GOLD_TEXT = {
  backgroundImage: "linear-gradient(180deg, #F5D040 0%, #A8850A 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

/**
 * Rendered twice — in the left rail on desktop, below the steps on mobile.
 * Ordering matters more than the duplication: on a phone the left column
 * stacks first, which would put the CTA above the content that justifies it.
 */
function ActionBlock({ className = "" }) {
  return (
    <div className={className}>
      <hr className="z-rule mb-8" />
      <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
        <Link
          href="/dashboard/ai-designs/new"
          className="btn-gold px-8 py-4 justify-center"
        >
          Start Your Design <ArrowRight size={14} />
        </Link>
        <Link href="#pricing" className="btn-outline px-8 py-4 justify-center">
          See Plans
        </Link>
      </div>
      <p className="mt-5 text-white/50 text-xs leading-relaxed">
        Start free on the Economy plan — upgrade only when you need more.
      </p>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-z-base py-20 sm:py-24 lg:py-32 px-4 sm:px-6 font-manrope"
    >
      {/* Off-centre key light, so the surface reads as lit rather than flat */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/3 -left-1/4 w-[70rem] h-[70rem] opacity-70"
        style={{
          background:
            "radial-gradient(circle, rgba(212,175,55,0.07) 0%, rgba(212,175,55,0.02) 35%, transparent 68%)",
        }}
      />
      {/* Film grain — kills the plasticky flatness of a large dark fill */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-24">
        {/* ── Narrative rail ── */}
        <motion.div
          className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start"
          initial={RISE}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={enter()}
        >
          <span className="z-eyebrow mb-5">How Ziora Works</span>

          <h2 className="font-primary text-[2.25rem] sm:text-5xl xl:text-[3.5rem] font-bold text-white tracking-tight leading-[1.05]">
            From idea to design
            <span className="block" style={GOLD_TEXT}>
              in four steps
            </span>
          </h2>

          <p className="mt-7 text-white/70 text-[15px] leading-relaxed max-w-md">
            No drawings to commission, no quotes to chase. Upload one photo and
            see the design — cost estimates are coming soon.
          </p>

          <ActionBlock className="hidden lg:block mt-10" />
        </motion.div>

        {/* ── The sequence ── */}
        <div className="lg:col-span-7">
          {STEPS.map(({ number, Icon, title, desc, outcome }, i) => (
            <motion.div
              key={number}
              initial={RISE}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={enter(i)}
              className={`group relative border-t border-z-line py-8 sm:py-10 transition-colors duration-500 ${
                i === STEPS.length - 1 ? "border-b" : ""
              }`}
            >
              {/* Edge marker — slides in from the row's own left edge */}
              <span
                aria-hidden
                className="absolute left-0 top-0 bottom-0 w-px bg-gold origin-top scale-y-0 transition-transform duration-500 ease-out group-hover:scale-y-100"
              />

              <div className="flex items-start gap-6 sm:gap-8 lg:gap-10 pl-0 group-hover:pl-4 sm:group-hover:pl-6 transition-[padding] duration-500 ease-out">
                {/* Numeral — the focal element */}
                <span
                  aria-hidden
                  className="font-primary text-4xl sm:text-5xl font-extrabold leading-none shrink-0 w-[2.2ch] tabular-nums opacity-45 transition-opacity duration-500 group-hover:opacity-100"
                  style={GOLD_TEXT}
                >
                  {number}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-primary text-lg sm:text-xl font-bold text-white tracking-tight">
                      {title}
                    </h3>
                    <Icon
                      className="w-5 h-5 text-white/20 shrink-0 mt-0.5 transition-colors duration-500 group-hover:text-gold/70"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  </div>

                  <p className="mt-3 text-white/70 text-sm sm:text-[15px] leading-relaxed max-w-lg">
                    {desc}
                  </p>

                  <div className="mt-5 flex items-center gap-2.5">
                    <span
                      aria-hidden
                      className="h-px w-6 bg-gold/50 transition-all duration-500 group-hover:w-10 group-hover:bg-gold"
                    />
                    <span className="z-micro transition-colors duration-500 group-hover:text-white">
                      {outcome}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          <ActionBlock className="lg:hidden mt-10" />
        </div>
      </div>
    </section>
  );
}
