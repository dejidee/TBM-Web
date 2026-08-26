// components/shared/dashboard/designs/empty-state.jsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ImageIcon, Sparkles, Wand2 } from "lucide-react";

/**
 * The designs gallery with nothing in it.
 *
 * This was a bordered box containing the sentence "No designs yet" in 30%-white
 * text, under a dashed tile offering to create one. An empty gallery is the
 * screen a new user is *most* likely to see, so it is worth designing: it
 * states what the tool does, and hands over three running starts rather than a
 * blank prompt box.
 *
 * The starter ideas deep-link with `?prompt=`, which the studio reads into its
 * prompt field — so "try one" is one click, not a click and then a blank page.
 */

const STARTERS = [
  "Modern minimalist living room with warm wood tones and natural light",
  "Contemporary kitchen with marble island and open shelving",
  "Luxury bedroom with floor-to-ceiling windows and a neutral palette",
];

export default function DesignsEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl border border-white/08"
      style={{ background: "#0d0b08" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(212,175,55,0.09) 0%, transparent 70%)" }}
      />

      <div className="relative flex flex-col items-center px-6 py-14 text-center sm:px-10">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: "rgba(212,175,55,0.10)" }}
        >
          <ImageIcon className="h-6 w-6 text-[#D4AF37]" strokeWidth={1.5} />
        </div>

        <h2 className="mt-6 text-[22px] font-semibold text-white sm:text-[26px]">
          Your gallery is waiting.
        </h2>
        <p className="mt-2.5 max-w-md text-[15px] leading-relaxed text-white/45">
          Upload a photo of any room and Ziora renders it in the style you describe — furnished,
          lit, and priced against real materials.
        </p>

        <Link
          href="/ziora/studio"
          className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl px-6 text-[14px] font-semibold text-black transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
        >
          <Wand2 className="h-4 w-4" strokeWidth={2} />
          Create your first design
        </Link>

        <div className="mt-11 w-full max-w-2xl">
          <p className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/25">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
            Or start from an idea
          </p>
          <div className="mt-4 grid gap-2.5">
            {STARTERS.map((idea) => (
              <Link
                key={idea}
                href={`/ziora/studio?prompt=${encodeURIComponent(idea)}`}
                className="group flex min-h-11 items-center justify-between gap-4 rounded-xl border border-white/08 px-4 py-3 text-left transition-colors hover:border-[#D4AF37]/30 hover:bg-white/03"
              >
                <span className="text-[13px] leading-relaxed text-white/55 transition-colors group-hover:text-white/85">
                  {idea}
                </span>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-white/20 transition-all group-hover:translate-x-0.5 group-hover:text-[#D4AF37]"
                  strokeWidth={2}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
