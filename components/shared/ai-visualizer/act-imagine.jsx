"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import BeforeAfter from "@/components/common/before-after";
import { enter, RISE } from "@/lib/theme/motion";

/**
 * Act I — Imagine.
 *
 * The doubt this section exists to kill is "I can't picture it." Not "what
 * does the software do" — the steps above already answered that. This is
 * evidence, and it answers with the one thing a render cannot fake: a real
 * building that actually got built.
 *
 * The pair is the "Contemporary Luxury Villa Exterior Transformation" project
 * from the live portfolio (site-images/web/villa-contemp-*.jpg) — the concrete
 * shell behind the TBM site board, and the finished villa at handover.
 *
 * Deliberately one idea, at size. The temptation is to pad a section like this
 * with three supporting cards; the restraint is the point. A large, genuinely
 * draggable comparison of real work outperforms anything that could sit beside
 * it, and anything that did would compete with it.
 *
 * The section must not re-narrate the four steps above. Sequence lives in
 * how-it-works.jsx; this carries proof only.
 */
export default function ActImagine() {
  return (
    <section className="relative bg-z-deep py-20 sm:py-24 lg:py-32 px-4 sm:px-6 font-manrope">
      <div className="max-w-7xl mx-auto">
        {/* ── Header ── */}
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={RISE}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={enter()}
        >
          <span className="z-eyebrow mb-5">Imagine</span>
          <h2 className="font-primary text-[2.25rem] sm:text-5xl font-bold tracking-tight leading-[1.05]">
            <span className="text-white">See it standing</span>{" "}
            <span className="z-gold-text">before you build it</span>
          </h2>
          <p className="mt-6 text-white/70 text-[15px] leading-relaxed">
            Not a mood board — the finished thing, from the space you have
            today. This one is real: drag to move between the frame and the
            handover.
          </p>
        </motion.div>

        {/* ── The evidence ── */}
        <motion.div
          className="mt-12 sm:mt-16 max-w-4xl mx-auto"
          initial={RISE}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={enter(1)}
        >
          {/* 6/5 is the gentlest shared crop for this pair: the before is
              slightly portrait (~0.92) and the after is ~1.44 landscape, so a
              near-square frame trims the least off either photo. */}
          <div className="border border-z-line p-2 bg-z-panel">
            <BeforeAfter
              before="/site-images/web/villa-contemp-before.jpg"
              after="/site-images/web/villa-contemp-after.jpg"
              variant="sharp"
              aspect="6/5"
              beforeLabel="Structure"
              afterLabel="Finished"
            />
          </div>

          {/* Caption + hand-off */}
          <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div className="flex items-center gap-2.5">
              <span aria-hidden className="h-px w-6 bg-gold/50 shrink-0" />
              <p className="z-micro">Contemporary Luxury Villa, Abuja — frame to finish</p>
            </div>

            <Link
              href="/dashboard/ai-designs/new"
              className="btn-gold px-8 py-4 justify-center"
            >
              Start Your Design <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
