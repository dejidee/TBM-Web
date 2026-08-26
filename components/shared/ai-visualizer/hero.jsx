"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Box, Calculator, LayoutGrid, ArrowRight, ImageIcon, Clapperboard } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { EASE, DUR_MICRO } from "@/lib/theme/motion";

/**
 * The Ziora cover.
 *
 * Ziora is presented as an independent AI renovation platform *powered by* TBM —
 * the wordmark stands alone and the byline carries the attribution. BOGAT is
 * deliberately absent here: it is the bathroom products, vanities and shopping
 * partner *inside* the app, not part of the platform's identity. Do not
 * reintroduce it on this screen.
 *
 * ── The headline is the navigation ──────────────────────────────────────────
 *
 * "Imagine. Design. Build." used to be three static words, and the page below
 * never proved any of them. Here each word is a real control: selecting one
 * swaps the panel to the evidence for that verb. The promise becomes something
 * you operate rather than something you read, and a visitor who touches it has
 * already seen the product answer its own claim.
 *
 * The three panels are drawn from the real product, not invented:
 *   · Imagine — the plain-English prompt and the Still Image / Video Tour
 *     choice, both from the live "Create a New Design" modal.
 *   · Design  — the product's own tag taxonomy. CONSTRUCTION and MATERIALS
 *     sitting beside INTERIOR DESIGN is the whole positioning argument, and it
 *     is the product's vocabulary, not marketing's.
 *   · Build   — a costed breakdown. Labelled Sample, always, so the figures can
 *     never be mistaken for a quotation.
 *
 * The background is a finished luxury kitchen from a real TBM project
 * (/site-images/web/kitchen-lux-after.jpg). Its dark cabinetry and gold cove
 * lighting match the page's black/gold palette, and an interior fits Ziora's
 * room-visualization pitch better than a facade.
 *
 * Exploring is anonymous — the account wall sits at save-a-design /
 * detailed-estimate / book-a-consultation, not at the front door.
 */

const ESTIMATE_LINES = [
  { label: "Construction", value: "₦ 16,850,000" },
  { label: "Finishing", value: "₦ 6,450,000" },
  { label: "Materials", value: "₦ 4,400,000" },
  { label: "Others", value: "₦ 750,000" },
];

const CAPABILITIES = [
  {
    Icon: Box,
    label: "Visualize",
    desc: "Photoreal concepts from one room photo",
  },
  {
    Icon: Calculator,
    label: "Estimate",
    // Act III already says "Costed to Nigerian market rates" verbatim, with a
    // paragraph behind it. Two identical sentences on one page read as filler.
    // Coming Soon: no package tier currently ships a working cost estimate
    // (package-tiers.jsx marks every cost-estimate feature Coming Soon), so
    // this can't be described as a live capability yet.
    desc: "A costed breakdown, not a ballpark — Coming Soon",
  },
  {
    Icon: LayoutGrid,
    label: "Manage",
    desc: "Quotation, schedule and site progress",
  },
];

/** The product's real tag groups. Order matches the app. */
const TAG_GROUPS = [
  { name: "Interior Design", tags: ["Living room", "Kitchen", "Bathroom", "Office"] },
  { name: "Construction", tags: ["Structure", "Roofing", "Finishes"] },
  { name: "Furniture", tags: ["Built-in", "Loose"] },
  { name: "Materials", tags: ["Tiles", "Timber", "Stone"] },
];

const ACTS = [
  {
    id: "imagine",
    word: "Imagine.",
    line: "Describe the space in plain English. Ziora renders it — as a still, or as a walkthrough.",
  },
  {
    id: "design",
    word: "Design.",
    line: "Tag it the way the job is actually organised: interiors, structure, furniture, materials.",
  },
  {
    id: "build",
    word: "Build.",
    line: "Cost estimates to Nigerian market rates, broken out line by line — coming soon.",
  },
];

// ── Panels ──────────────────────────────────────────────────────────────────

function PanelShell({ title, badge, children }) {
  return (
    /* min-h holds the tallest of the three panels (Design, whose chips wrap to
       two rows at this width). Without it, AnimatePresence unmounts the old
       panel before mounting the new one and the column collapses mid-swap. */
    <div
      className="border border-z-line p-6 w-full lg:w-88 min-h-92 flex flex-col"
      style={{
        background: "rgba(8,7,4,0.94)",
        backdropFilter: "blur(24px)",
        boxShadow: "0 24px 72px rgba(0,0,0,0.7)",
      }}
    >
      <div className="flex items-baseline justify-between gap-3 mb-5">
        <p className="text-white text-[11px] font-bold uppercase tracking-[0.16em] leading-none">
          {title}
        </p>
        {badge && <span className="z-micro text-[10px]">{badge}</span>}
      </div>
      {children}
    </div>
  );
}

function ImaginePanel() {
  return (
    <PanelShell title="Describe It" badge="Prompt">
      <div className="border border-z-line bg-white/5 p-3.5 mb-5">
        <p className="text-white/70 text-[13px] leading-relaxed">
          A modern four-bedroom duplex with warm timber screens, a double-height
          living area and soft ambient lighting.
        </p>
      </div>

      <p className="z-micro mb-3">Output</p>
      <div className="grid grid-cols-2 gap-2.5 mt-auto">
        {[
          { Icon: ImageIcon, label: "Still Image", active: true },
          { Icon: Clapperboard, label: "Video Tour", active: false },
        ].map(({ Icon, label, active }) => (
          <div
            key={label}
            className={`border p-3 flex flex-col gap-2 ${
              active ? "border-gold/45 bg-gold/06" : "border-z-line"
            }`}
          >
            <Icon
              className={`w-4 h-4 ${active ? "text-gold" : "text-white/50"}`}
              strokeWidth={1.5}
              aria-hidden
            />
            <span
              className={`text-[12px] font-semibold ${
                active ? "text-white" : "text-white/50"
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </PanelShell>
  );
}

function DesignPanel() {
  return (
    <PanelShell title="Tag The Job" badge="4 Groups">
      <div className="flex flex-col gap-3">
        {TAG_GROUPS.map(({ name, tags }) => (
          <div key={name}>
            <p className="z-micro text-[10px] mb-1.5">{name}</p>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="border border-z-line px-2 py-1 text-[11px] text-white/70 leading-none"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PanelShell>
  );
}

function BuildPanel() {
  return (
    <PanelShell title="Project Estimate" badge="Sample">
      <p className="z-micro mb-1.5">Total Estimate</p>
      <p className="text-white text-[2rem] font-extrabold font-primary mb-5 leading-none">
        ₦ 28,450,000
      </p>

      <div className="space-y-2.5 mt-auto">
        {ESTIMATE_LINES.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between gap-3">
            <span className="text-white/70 text-sm">{label}</span>
            <span className="text-white text-xs font-medium tabular-nums">
              {value}
            </span>
          </div>
        ))}
      </div>
    </PanelShell>
  );
}

const PANELS = { imagine: ImaginePanel, design: DesignPanel, build: BuildPanel };

// ── Hero ────────────────────────────────────────────────────────────────────

export default function Hero() {
  const { isAuthenticated } = useSession();
  const [active, setActive] = useState(0);

  /**
   * The panel advances once through all three acts, then stops for good.
   *
   * A visitor who never touches the headline would otherwise only ever see
   * "Imagine" — and the Construction/Materials taxonomy in act two is the
   * single strongest positioning signal on the page. One pass demonstrates
   * that the control exists; looping forever would make the section something
   * you have to wait out to read. Any interaction cancels it immediately, and
   * it never starts for a visitor who asked for reduced motion.
   */
  const touched = useRef(false);
  const [autoDone, setAutoDone] = useState(false);

  const select = useCallback((i) => {
    touched.current = true;
    setAutoDone(true);
    setActive(i);
  }, []);

  useEffect(() => {
    if (autoDone) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setAutoDone(true);
      return;
    }
    const id = setTimeout(() => {
      if (touched.current) return;
      setActive((i) => {
        const next = i + 1;
        if (next >= ACTS.length) {
          setAutoDone(true);
          return i;
        }
        return next;
      });
    }, 4200);
    return () => clearTimeout(id);
  }, [active, autoDone]);

  const Panel = PANELS[ACTS[active].id];

  return (
    <section className="relative bg-black overflow-hidden">
      {/* ── Background: a real finished TBM interior ── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/site-images/web/kitchen-lux-after.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Left-heavy gradient so text stays readable */}
        <div className="absolute inset-0 bg-linear-to-b md:bg-linear-to-r from-black via-black/85 to-black/60 md:to-black/40" />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 lg:gap-16 min-h-[85vh] py-28 lg:py-36">
          {/* ── Left: wordmark, the operable promise, actions ── */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            className="w-full lg:max-w-xl"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <p className="text-gold font-primary font-extrabold text-[1.75rem] sm:text-[2rem] tracking-[0.3em] uppercase leading-none">
                Ziora
              </p>
              <p className="mt-2.5 font-manrope font-semibold uppercase text-white/80 text-[12px] sm:text-[13px] tracking-[0.18em] leading-snug">
                AI Renovation Platform by TBM Building Services
              </p>
            </motion.div>

            <div className="mt-7 h-px w-16 bg-gold/40" />

            {/* The promise, as three controls.
                Buttons live inside the h1 so the heading text stays intact for
                assistive tech and search — the words are the content and the
                navigation at once, not a heading with a widget bolted beside it. */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.75 }}
              className="mt-7 font-primary font-extrabold text-[2.6rem] sm:text-[3.25rem] lg:text-[4rem] xl:text-[4.5rem] tracking-tight leading-[0.95] uppercase"
            >
              {ACTS.map(({ id, word }, i) => {
                const on = i === active;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => select(i)}
                    aria-pressed={on}
                    className="group relative block text-left transition-opacity duration-300 cursor-pointer"
                  >
                    <span
                      className={
                        on
                          ? "z-gold-text"
                          : "text-white/70 group-hover:text-white transition-colors duration-300"
                      }
                    >
                      {word}
                    </span>
                    {/* Active marker — sits in the left gutter, never reflows the word */}
                    <span
                      aria-hidden
                      className={`absolute -left-5 top-1/2 -translate-y-1/2 h-px bg-gold transition-all duration-300 ${
                        on ? "w-3 opacity-100" : "w-0 opacity-0"
                      }`}
                    />
                  </button>
                );
              })}
            </motion.h1>

            {/* Sub-line, tied to the selected act */}
            <div className="mt-6 min-h-14 max-w-md">
              <AnimatePresence mode="wait">
                <motion.p
                  key={ACTS[active].id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="text-white/90 text-base sm:text-lg leading-relaxed [text-shadow:0_1px_10px_rgba(0,0,0,0.55)]"
                >
                  {ACTS[active].line}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* One primary action. "Book a Consultation" was competing with it
                as an equal-weight button; it is a different intent for a much
                smaller group, so it reads as a link now. */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
            >
              <Link
                href="/dashboard/ai-designs/new"
                className="btn-gold px-8 py-4 justify-center"
              >
                Start Your Design <ArrowRight size={14} />
              </Link>

              <div className="flex items-center gap-5">
                <Link
                  href="/consultation"
                  className="inline-flex items-center min-h-11 py-2 text-[13px] font-semibold tracking-[0.12em] uppercase text-white/85 hover:text-white transition-colors"
                >
                  Book a Consultation
                </Link>
                <Link
                  href={isAuthenticated ? "/dashboard" : "/sign-in"}
                  className="inline-flex items-center min-h-11 py-2 text-[13px] font-semibold tracking-[0.12em] uppercase text-white/70 hover:text-white transition-colors"
                >
                  {isAuthenticated ? "My Dashboard" : "Log In"}
                </Link>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mt-6 text-white/70 text-[13px] leading-relaxed max-w-sm"
            >
              Explore without an account. You&rsquo;ll only need one to save a
              design or book a consultation.
            </motion.p>
          </motion.div>

          {/* ── Right: the evidence for the selected act ── */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.7, ease: "easeOut" }}
            className="w-full lg:w-auto lg:shrink-0"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={ACTS[active].id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: DUR_MICRO * 0.6, ease: EASE }}
              >
                <Panel />
              </motion.div>
            </AnimatePresence>

            {/* Which act you are on, and how many there are */}
            <div className="flex items-center gap-2 mt-4 lg:justify-end">
              {ACTS.map(({ id, word }, i) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => select(i)}
                  aria-label={`Show ${word.replace(".", "")}`}
                  aria-pressed={i === active}
                  className="h-11 w-11 flex items-center justify-center cursor-pointer group"
                >
                  <span
                    className={`h-px transition-all duration-300 ${
                      i === active
                        ? "w-7 bg-gold"
                        : "w-4 bg-white/25 group-hover:bg-white/60"
                    }`}
                  />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Capability strip: what the platform does, in the journey's order ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85, duration: 0.6 }}
        className="relative z-10 border-t border-z-line"
        style={{ background: "rgba(5,4,2,0.92)", backdropFilter: "blur(16px)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3">
            {CAPABILITIES.map(({ Icon, label, desc }, i) => (
              <div
                key={label}
                className={`flex items-start gap-3 px-5 sm:px-6 lg:px-8 py-5 border-z-line
                  ${i < CAPABILITIES.length - 1 ? "border-b sm:border-b-0 sm:border-r" : ""}
                `}
              >
                <Icon
                  className="w-5 h-5 text-gold shrink-0 mt-0.5"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="z-eyebrow text-[12px] tracking-[0.14em] mb-1.5">
                    {label}
                  </p>
                  <p className="text-white/70 text-[13px] leading-snug">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
