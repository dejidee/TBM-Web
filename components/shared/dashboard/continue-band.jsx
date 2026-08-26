// components/shared/dashboard/continue-band.jsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, ShoppingBag, Wand2 } from "lucide-react";

/**
 * The top of the Overview when the user has already made something.
 *
 * The design they generated used to sit in a third-width "Latest Design" card
 * beside two empty boxes — the single most valuable thing on the page, rendered
 * as one tile of an inventory grid, ending in a dead end.
 *
 * A render is not a trophy, it is a decision point: the user has just seen the
 * room they want, and the two things TBM sells are the materials to build it
 * and the people to build it. So the band leads with the image at full size and
 * attaches both paths to it. Everything else on the Overview is secondary to
 * this hand-off.
 */

/** The API returns designs with empty strings for fields it has not filled in
 *  (style and generatedAt both come back blank today), so every optional field
 *  is trimmed before it is allowed to render a label. A "Style:" with nothing
 *  after it reads as a broken page, not as missing metadata. */
const clean = (v) => (typeof v === "string" ? v.trim() : "") || null;

function Placeholder() {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-2"
      style={{ background: "radial-gradient(circle at 50% 35%, #14110b 0%, #0a0a08 72%)" }}
    >
      <Wand2 className="h-6 w-6 text-[#D4AF37]/50" strokeWidth={1.5} />
      <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]/70">
        Ziora
      </span>
    </div>
  );
}

export default function ContinueBand({ design }) {
  // next/image renders a broken-image glyph when the URL 404s, which is what
  // the live dashboard was showing. Fall back to the branded panel instead.
  const [imageFailed, setImageFailed] = useState(false);

  const title = clean(design?.title) ?? "Your latest design";
  const style = clean(design?.style);
  const generatedAt = clean(design?.generatedAt);
  const image = clean(design?.image);
  const showImage = image && !imageFailed;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl border border-white/08"
      style={{ background: "#0d0b08" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(212,175,55,0.10) 0%, transparent 70%)" }}
      />

      <div className="relative grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-10 lg:p-8">
        {/* The render, at a size worth looking at. */}
        <Link
          href="/dashboard/ai-designs"
          className="group relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/08 bg-[#111]"
        >
          {showImage ? (
            <Image
              src={image}
              alt={title}
              fill
              onError={() => setImageFailed(true)}
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
          ) : (
            <Placeholder />
          )}
          {generatedAt && (
            <span className="absolute bottom-3 left-3 rounded-md border border-white/10 bg-black/60 px-2.5 py-1 text-[11px] text-white/80 backdrop-blur-sm">
              {generatedAt}
            </span>
          )}
        </Link>

        {/* The hand-off. */}
        <div className="flex flex-col justify-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#D4AF37]/70">
            Pick up where you left off
          </p>

          <h2 className="mt-3 text-[22px] font-semibold leading-tight text-white sm:text-[26px]">
            {title}
          </h2>

          {style && (
            <span className="mt-3 inline-flex w-fit rounded-full border border-white/10 bg-white/04 px-3 py-1 text-[12px] font-medium text-white/60">
              {style}
            </span>
          )}

          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/45">
            Ready to make it real? Source the materials from Bogat, or bring the render to a
            designer and turn it into a build plan.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/bogat/materials"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl px-5 text-[14px] font-semibold text-black transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={2} />
              Shop the materials
            </Link>
            <Link
              href="/consultation"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 px-5 text-[14px] font-semibold text-white/80 transition-colors hover:border-white/35 hover:text-white"
            >
              <Calendar className="h-4 w-4" strokeWidth={1.75} />
              Book a consultation
            </Link>
          </div>

          <Link
            href="/ziora/studio"
            className="group mt-5 inline-flex w-fit items-center gap-1.5 text-[13px] font-medium text-white/45 transition-colors hover:text-[#D4AF37]"
          >
            <Wand2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            Create another design
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
              strokeWidth={2}
            />
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
