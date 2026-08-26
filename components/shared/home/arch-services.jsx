"use client";

import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/common/reveal";

const PILLARS = [
  {
    label: "TBM Projects",
    tagline: "Renovation · Construction · Fit-Out · Interiors",
    desc: "End-to-end project execution — from initial inspection and design through to final handover. We handle homes, apartments, and commercial spaces across Abuja and Lagos.",
    cta: "View Projects",
    href: "/project",
    src: "/site-images/web/villa-modern-after.jpg",
  },
  {
    label: "Bogat Store",
    tagline: "Bathroom · Kitchen · Plumbing · Finishing",
    desc: "Browse and order premium construction materials directly — WCs, basins, faucets, tiles, water heaters, and more. Fixed prices and request-quote options available.",
    cta: "Shop Materials",
    href: "/materials",
    src: "/site-images/web/kitchen-island.jpg",
  },
  {
    label: "Ziora AI",
    tagline: "Before/After · Inspiration · Estimate Guidance",
    desc: "Upload a room photo, pick a style, and see a photorealistic concept in seconds. Use the result to get an estimate, shop matching materials, or book a consultation.",
    cta: "Design with Ziora AI",
    href: "/ziora",
    src: "/site-images/web/interior-finished.jpg",
  },
];

export default function ThreePillarsSection() {
  return (
    <section className="bg-black py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
        {/* Title */}
        <Reveal direction="up">
          <p className="text-[#D4AF37] text-[16px] font-manrope font-semibold tracking-[0.3em] uppercase mb-4">
            What We Offer
          </p>
        </Reveal>
        <Reveal direction="up" delay={60}>
          <h2 className="font-poppins font-bold text-3xl sm:text-4xl text-white mb-10 sm:mb-14">
            Three Ways TBM Serves You
          </h2>
        </Reveal>

        {/* Three equal cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {PILLARS.map(({ label, tagline, desc, cta, href, src }, i) => (
            <Reveal key={label} direction="up" delay={i * 100}>
              <div className="group relative overflow-hidden rounded-2xl min-h-96 bg-card flex flex-col justify-end">
                <Image
                  src={src}
                  alt={label}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />
                <div className="relative z-10 p-7 flex flex-col gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] inline-block" />
                  <h3 className="font-poppins font-bold text-xl text-white leading-snug">
                    {label}
                  </h3>
                  <p className="text-[#D4AF37] text-[16px] font-manrope font-semibold tracking-[0.18em] uppercase">
                    {tagline}
                  </p>
                  <p className="text-white/50 text-sm font-manrope leading-relaxed">
                    {desc}
                  </p>
                  <Link
                    href={href}
                    className="mt-1 inline-flex items-center gap-2 text-[11px] font-manrope font-semibold tracking-[0.18em] uppercase text-[#D4AF37] hover:text-white transition-colors"
                  >
                    {cta} →
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
