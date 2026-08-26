"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, MessageSquare } from "lucide-react";
import { enter, RISE } from "@/lib/theme/motion";

/**
 * Act III — Build.
 *
 * The doubt: "I can't afford it, and I can't execute it." Two doubts really,
 * and the section answers them in that order — the number first, then the
 * people who stand behind it.
 *
 * This is where the page stops being software and becomes a building company.
 * A render is cheap to produce and every competitor has one; a costed breakdown
 * at local market rates, from a firm that has actually built the thing in Act I,
 * is the part that cannot be copied. So the estimate is rendered at full size
 * here rather than as the hero's thumbnail, and the consultation sits directly
 * under it.
 *
 * Every figure below is derived, never typed twice: `share` comes from
 * value/total, and the total is summed from the lines. A breakdown whose parts
 * do not add up is worse than no breakdown, and hand-maintained percentages
 * drift the first time a number is edited.
 *
 * The estimate stays labelled "Sample". These are illustrative figures and must
 * never be able to read as a quotation.
 */

const ESTIMATE_LINES = [
  { label: "Construction", value: 16_850_000 },
  { label: "Finishing", value: 6_450_000 },
  { label: "Materials", value: 4_400_000 },
  { label: "Others", value: 750_000 },
];

const TOTAL = ESTIMATE_LINES.reduce((sum, l) => sum + l.value, 0);

const naira = (n) => `₦ ${n.toLocaleString("en-NG")}`;

/**
 * "Photo to first render" rather than the previous "Avg. Design Time": same
 * measurement, stated as the thing a visitor gets instead of as an internal
 * metric. A stat band answers "what does this do for me", not "what do we
 * track".
 *
 * TODO(client): "700+ Projects designed" and "10,000+ Designs generated"
 * were removed — they conflicted with the site's other project-count
 * figures (Home, About) and none of them could be confirmed as accurate.
 * Provide one real, verifiable count and it can go back in.
 *
 * TODO(client): "98% Estimate accuracy" was also removed — no cost/estimate
 * feature is actually implemented anywhere in the app yet (the breakdown
 * below is explicitly labeled "Sample"), so an accuracy figure for it isn't
 * verifiable. Add it back once the real estimate feature ships and the
 * number is measured, not assumed.
 */
const STATS = [{ value: "~3 min", label: "Photo to first render" }];

const TRUST = [
  {
    title: "Costed to Nigerian market rates",
    body: "Not a global average converted at today's rate. The figures will track what materials and labour actually cost here.",
  },
  {
    title: "Broken out line by line",
    body: "Structure, finishes and materials will be separated, so you can see where the money goes and what moves if you change your mind.",
  },
  {
    title: "Re-costed when the design changes",
    body: "Revise the concept and the estimate will follow it. The number is attached to the design, not to a document that goes stale.",
  },
];

export default function ActBuild() {
  return (
    <section className="relative bg-z-deep font-manrope">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24 lg:py-32">
        {/* ── Header ── */}
        <motion.div
          className="max-w-2xl"
          initial={RISE}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={enter()}
        >
          <span className="z-eyebrow mb-5">Build — Coming Soon</span>
          <h2 className="font-primary text-[2.25rem] sm:text-5xl font-bold tracking-tight leading-[1.05]">
            <span className="text-white">Know the number</span>{" "}
            <span className="z-gold-text">before you break ground</span>
          </h2>
          <p className="mt-6 text-white/70 text-[15px] leading-relaxed">
            The design is the easy half. What decides whether a project happens
            is the cost — and whether anyone is accountable for it once the
            renders are closed. This costed breakdown is in development; the
            sample below shows what it will look like.
          </p>
        </motion.div>

        {/* ── The estimate ── */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <motion.div
            initial={RISE}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={enter(1)}
            className="border border-z-line bg-z-panel p-6 sm:p-8"
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-white text-[11px] font-bold uppercase tracking-[0.16em] leading-none">
                Project Estimate
              </p>
              <span className="z-micro text-[10px]">Sample</span>
            </div>

            <p className="z-micro mt-6 mb-1.5">Total Estimate</p>
            <p className="text-white text-[2.5rem] sm:text-[3rem] font-extrabold font-primary leading-none tabular-nums">
              {naira(TOTAL)}
            </p>

            {/* Stacked share bar — the whole cost, in proportion */}
            <div
              className="mt-7 flex h-1.5 w-full overflow-hidden"
              role="img"
              aria-label={`Cost split: ${ESTIMATE_LINES.map(
                (l) => `${l.label} ${Math.round((l.value / TOTAL) * 100)}%`,
              ).join(", ")}`}
            >
              {ESTIMATE_LINES.map((l, i) => (
                <span
                  key={l.label}
                  style={{
                    width: `${(l.value / TOTAL) * 100}%`,
                    opacity: Number((1 - i * 0.22).toFixed(2)),
                  }}
                  className="bg-gold"
                />
              ))}
            </div>

            <div className="mt-7 divide-y divide-z-line">
              {ESTIMATE_LINES.map((l) => {
                const share = Math.round((l.value / TOTAL) * 100);
                return (
                  <div
                    key={l.label}
                    className="flex items-baseline justify-between gap-4 py-3.5"
                  >
                    <span className="text-white/70 text-sm">{l.label}</span>
                    <span className="flex items-baseline gap-3 shrink-0">
                      <span className="z-micro text-[10px] tabular-nums">
                        {share}%
                      </span>
                      <span className="text-white text-[13px] font-medium tabular-nums">
                        {naira(l.value)}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* ── Why the number is worth trusting ── */}
          <motion.div
            initial={RISE}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={enter(2)}
          >
            <div className="flex flex-col gap-8">
              {TRUST.map(({ title, body }) => (
                <div key={title} className="flex gap-4">
                  <span
                    aria-hidden
                    className="mt-2.5 h-1 w-1 shrink-0 bg-gold"
                  />
                  <div>
                    <h3 className="font-primary text-lg font-bold text-white tracking-tight">
                      {title}
                    </h3>
                    <p className="mt-2 text-white/70 text-sm leading-relaxed">
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <hr className="z-rule my-9" />

            <p className="text-white/70 text-[15px] leading-relaxed">
              And when it is time to build, the design is only the start of
              the conversation — TBM built the house at the top of this page.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard/ai-designs/new"
                className="btn-gold px-8 py-4 justify-center"
              >
                Start Your Design <ArrowRight size={14} />
              </Link>
              <Link
                href="/consultation"
                className="btn-outline px-8 py-4 justify-center"
              >
                <MessageSquare size={14} />
                Book a Consultation
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Track record ── */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={enter()}
        className="border-t border-z-line bg-z-base"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1">
            {STATS.map(({ value, label }, i) => (
              <div
                key={label}
                className={`px-4 sm:px-6 py-9 sm:py-11 text-center border-z-line
                  ${i < STATS.length - 1 ? "border-r" : ""}
                `}
              >
                <p className="text-white text-[1.75rem] sm:text-[2.25rem] font-extrabold font-primary leading-none tabular-nums">
                  {value}
                </p>
                <p className="z-micro mt-3 text-[10px]">{label}</p>
              </div>
            ))}
          </div>

          <p className="pb-9 text-center text-white/50 text-xs">
            Across three years of TBM projects.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
