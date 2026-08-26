"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { enter, RISE } from "@/lib/theme/motion";

/**
 * Act II — Design.
 *
 * The doubt: "I can't decide." The evidence: the actual product.
 *
 * This replaced a 515-line hand-built mock of the app — a fake sidebar, a fake
 * toolbar, a fake 2D/3D toggle, all wrapped around one stock kitchen photo. A
 * mock can only ever assert that a product exists. Real screenshots prove it,
 * and they cost nothing to keep honest.
 *
 * The lead row is the positioning argument for the whole page. Ziora's own tag
 * groups are INTERIOR DESIGN / CONSTRUCTION / FURNITURE / MATERIALS — the
 * vocabulary of a build, not of a styling app. That is the product's language,
 * not marketing's, which is exactly why it is worth showing rather than
 * claiming.
 *
 * ── On the crops ───────────────────────────────────────────────────────────
 *
 * The captures in /public/guide/ziora are full-browser: site navbar, footer, a
 * floating chat widget, and a lot of empty page. Shown whole they read as
 * screenshots someone forgot to trim. Every one here is therefore framed to its
 * working area via <ProductShot>, which positions the image inside a
 * fixed-aspect window using source-pixel coordinates.
 *
 * Keep displayed widths near the crop's source width. These are 1038px-wide
 * PNGs, so a 630px-wide crop stretched across a full-bleed row is a 2x upscale
 * and looks soft — which undoes the point of using real product imagery.
 */

const SRC_W = 1038;
const SRC_H = 654;

/**
 * A window onto part of a screenshot.
 *
 * x/y/w/h are in the source image's pixel space, so a crop can be read off the
 * capture directly. The image is scaled so `w` source pixels span the frame,
 * then translated by percentages of its own rendered size — which is what makes
 * this hold at every breakpoint without a media query.
 */
function ProductShot({ src, alt, x, y, w, h }) {
  return (
    <div
      className="relative overflow-hidden bg-z-deep"
      style={{ aspectRatio: `${w} / ${h}` }}
    >
      <Image
        src={src}
        alt={alt}
        width={SRC_W}
        height={SRC_H}
        unoptimized
        className="absolute top-0 left-0 max-w-none"
        style={{
          width: `${(SRC_W / w) * 100}%`,
          height: "auto",
          transform: `translate(${(-x / SRC_W) * 100}%, ${(-y / SRC_H) * 100}%)`,
        }}
      />
    </div>
  );
}

const ROWS = [
  {
    label: "The job, not a mood board",
    title: "Organised the way a build is",
    body: "Interiors, structure, furniture, materials. Ziora tags a project the way the work is actually divided, so what comes back is scoped to the job rather than a room-styling exercise.",
    caption: "Tag groups — Create a New Design",
    shot: {
      src: "/guide/ziora/08-new-design-upload.png",
      alt: "Ziora's project tag groups: Interior Design expanded, with Construction and Furniture as peer groups below",
      // Stops just under FURNITURE. The capture's own MATERIALS row is clipped
      // by the modal's bottom edge, so any crop reaching for it ends mid-text
      // and reads as a careless trim. Three groups make the point; a fourth
      // half-visible one would cost more than it adds.
      x: 196,
      y: 262,
      w: 632,
      h: 340,
    },
  },
  {
    label: "Still or walkthrough",
    title: "Choose what you get back",
    body: "A single high-resolution render, or an animated walkthrough of the space. Describe what you want in plain English — there is no drawing to commission and no brief to write.",
    caption: "Output type and description",
    shot: {
      src: "/guide/ziora/07-new-design-modal.png",
      alt: "Choosing between Still Image and Video Tour, and describing the space in plain English",
      x: 196,
      y: 128,
      w: 632,
      h: 345,
    },
  },
  {
    label: "Compare and revise",
    title: "Every option in one place",
    body: "Designs are saved to your library as you generate them — reopen one, download it, share it with your team or your builder, and run it again until it is right.",
    caption: "Your saved designs",
    shot: {
      src: "/guide/ziora/10-design-cards.png",
      alt: "A saved design card with download and share actions, beside a Create New tile",
      x: 332,
      y: 140,
      w: 472,
      h: 292,
    },
  },
];

export default function ActDesign() {
  return (
    <section className="relative bg-z-base py-20 sm:py-24 lg:py-32 px-4 sm:px-6 font-manrope">
      <div className="max-w-6xl mx-auto">
        {/* ── Header ── */}
        <motion.div
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-14 sm:mb-20"
          initial={RISE}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={enter()}
        >
          <div className="max-w-xl">
            <span className="z-eyebrow mb-5">Design</span>
            <h2 className="font-primary text-[2.25rem] sm:text-5xl font-bold tracking-tight leading-[1.05]">
              <span className="text-white">Decide before</span>{" "}
              <span className="z-gold-text">anything is poured</span>
            </h2>
          </div>
          <p className="text-white/70 text-[15px] leading-relaxed max-w-sm lg:text-right lg:pb-2">
            Not a preview of the software — the software. Every screen below is
            the product as it ships today.
          </p>
        </motion.div>

        {/* ── Alternating rows ── */}
        <div className="flex flex-col gap-16 sm:gap-20 lg:gap-28">
          {ROWS.map(({ label, title, body, caption, shot }, i) => (
            <motion.div
              key={title}
              initial={RISE}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-70px" }}
              transition={enter(0)}
              className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center"
            >
              {/* Shot — leads on odd rows, follows on even. `order` only, so the
                  reading order stays copy-then-image for a screen reader. */}
              <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                <div className="border border-z-line bg-z-panel p-2">
                  <ProductShot {...shot} />
                </div>
                <p className="z-micro mt-3 text-[10px]">{caption}</p>
              </div>

              <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                <div className="flex items-center gap-2.5 mb-4">
                  <span aria-hidden className="h-px w-6 bg-gold/50 shrink-0" />
                  <span className="z-micro">{label}</span>
                </div>
                <h3 className="font-primary text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                  {title}
                </h3>
                <p className="mt-4 text-white/70 text-[15px] leading-relaxed max-w-md">
                  {body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Hand-off ── */}
        <motion.div
          initial={RISE}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={enter(1)}
          className="mt-16 sm:mt-20 pt-10 border-t border-z-line flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5"
        >
          <p className="text-white/70 text-[15px] leading-relaxed max-w-md">
            Generating a design is free on the Economy plan. Start with a photo
            and a sentence.
          </p>
          <Link
            href="/dashboard/ai-designs/new"
            className="btn-gold px-8 py-4 justify-center shrink-0"
          >
            Start Your Design <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
