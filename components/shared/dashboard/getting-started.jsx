// components/shared/dashboard/getting-started.jsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, ShoppingBag, Wand2 } from "lucide-react";

/**
 * What a brand-new account sees instead of four empty boxes.
 *
 * The Overview used to reserve a card for every module — Recent Order, Latest
 * Design, Consultations, Saved Items — and render "No recent orders", "No
 * designs yet", "No saved items yet" into them. A new user's first impression
 * of the product was a grid of things they do not have. Absence is not a
 * dashboard; the page now drops those modules entirely (see app/dashboard/page.jsx)
 * and spends the space on the one thing worth doing first.
 */

const STEPS = [
  {
    n: "01",
    Icon: Wand2,
    title: "Visualise it",
    body: "Upload a photo of your room and Ziora renders it in the style you choose.",
    href: "/ziora/studio",
    cta: "Open the studio",
  },
  {
    n: "02",
    Icon: ShoppingBag,
    title: "Source the materials",
    body: "Flooring, tiles, and fixtures from Bogat — priced and ready to order.",
    href: "/bogat/materials",
    cta: "Browse materials",
  },
  {
    n: "03",
    Icon: Calendar,
    title: "Talk to a designer",
    body: "Bring your render to a consultation and turn it into a real build plan.",
    href: "/consultation",
    cta: "Book a consultation",
  },
];

export default function GettingStarted() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl border border-white/08"
      style={{ background: "#0d0b08" }}
    >
      {/* A single soft light source, top-left. The whole dashboard is 1px
          borders on near-black; one lit surface is what gives the page a
          foreground and a background instead of a flat grid of boxes. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(212,175,55,0.10) 0%, transparent 70%)" }}
      />

      <div className="relative px-6 py-10 sm:px-10 sm:py-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#D4AF37]/70">
          Get started
        </p>
        <h2 className="mt-3 max-w-xl text-[26px] font-semibold leading-tight text-white sm:text-[32px]">
          Let&apos;s design your first space.
        </h2>
        <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-white/45">
          Three steps from a photo of the room you have to a plan for the one you want.
        </p>

        <Link
          href="/ziora/studio"
          className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl px-6 text-[14px] font-semibold text-black transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
        >
          <Wand2 className="h-4 w-4" strokeWidth={2} />
          Create your first design
        </Link>

        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/08 bg-white/08 sm:grid-cols-3">
          {STEPS.map(({ n, Icon, title, body, href, cta }, i) => (
            <motion.div
              key={n}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
              style={{ background: "#0b0a07" }}
            >
              <Link
                href={href}
                className="group flex h-full flex-col p-6 transition-colors hover:bg-white/03"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4.5 w-4.5 text-[#D4AF37]" strokeWidth={1.75} />
                  <span className="text-[11px] font-semibold tracking-[0.18em] text-white/25">
                    {n}
                  </span>
                </div>
                <h3 className="mt-4 text-[15px] font-semibold text-white">{title}</h3>
                <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-white/40">{body}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-white/50 transition-colors group-hover:text-[#D4AF37]">
                  {cta}
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                    strokeWidth={2}
                  />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
