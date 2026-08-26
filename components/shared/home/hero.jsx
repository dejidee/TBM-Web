"use client";

import Image from "next/image";
import Link from "next/link";
import { Layers, Hammer, Cpu, Diamond, ArrowRight } from "lucide-react";

const TRUST_CHIPS = [
  { Icon: Layers, label: "Design Excellence" },
  { Icon: Hammer, label: "Luxury Renovation" },
  { Icon: Cpu, label: "Smart Construction" },
  { Icon: Diamond, label: "Premium Finishes" },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen bg-black flex items-center overflow-hidden">
      {/* ── Right column — luxury image (desktop) ─────────────────── */}
      <div className="hidden lg:block absolute inset-y-0 right-0 w-[50%]">
        <div className="relative h-full w-full">
          {/* <Image
            src="/hero/re-imagine.png"
            alt="Luxury interior by TBM Building Services"
            fill
            priority
            className="object-cover object-center"
          /> */}
          <video className="object-cover object-center w-full h-full" src={"/hero/videos/2.mp4"} autoPlay muted loop playsInline>
            {/* <source src="/hero/videos/2.mp4" type="video/mp4" /> */}
          </video>
          {/* Left bleed — fades image into the black text column */}
          <div className="absolute inset-y-0 left-0 w-48 bg-linear-to-r from-black to-transparent" />
          {/* Subtle dark overlay for richness */}
          <div className="absolute inset-0 bg-black/25" />
          {/* Bottom fade into stats bar */}
          <div className="absolute bottom-0 inset-x-0 h-28 bg-linear-to-t from-black to-transparent" />
        </div>
      </div>

      {/* ── Mobile background image ───────────────────────────────── */}
      <div className="lg:hidden absolute inset-0">
        {/* <Image
          src="/hero/re-imagine.png"
          alt="Luxury interior"
          fill
          priority
          className="object-cover object-center opacity-20"
        /> */}
         <video className="object-cover object-center w-full h-full" src={"/hero/videos/2.mp4"} autoPlay muted loop playsInline></video>
        <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/55 to-black" />
      </div>

      {/* ── Content column (left) ─────────────────────────────────── */}
      <div className="relative z-10 w-full lg:w-[55%] xl:w-[52%]">
        <div className="w-full mx-auto lg:mx-0 px-6 sm:px-10 lg:pl-16 xl:pl-20 2xl:pl-28 pt-32 pb-24 sm:pt-36 sm:pb-28 ">
          {/* Eyebrow */}
          <p className="text-[#D4AF37] text-[11px] sm:text-[14px] font-manrope font-bold tracking-[0.22em] sm:tracking-[0.38em] uppercase mb-4 sm:mb-5 hero-badge">
            Contractor Abuja &amp; Lagos
          </p>

          {/* Headline — fluid type scales smoothly across every width;
              "Renovation &" is glued so the ampersand never orphans onto
              its own line. */}
          <h1 className="font-poppins font-bold leading-[1.15] tracking-tight mb-6 hero-heading text-[clamp(1.9rem,6.2vw,3.9rem)]">
            <span className="block text-white text-balance">
              Luxury{" "}
              <span className="whitespace-nowrap">Renovation&nbsp;&amp;</span>
            </span>
            <span className="block">
              <span className="text-[#D4AF37]">Smart</span>
              <span className="text-white"> Construction</span>
            </span>
            <span className="block text-white">Experts</span>
          </h1>

          {/* Subtitle — TBM's core offer only; Ziora is introduced in its
              own section further down the page, not named here */}
          <p className="text-white/50 text-[14px] sm:text-[18px] font-manrope leading-normal mb-8 max-w-[38ch] hero-sub">
            We design, visualize, and build premium homes with precision
            planning and expert execution.
          </p>

          {/* Trust chips */}
          <div className="flex flex-wrap gap-x-5 gap-y-3 mb-10 hero-sub ">
            {TRUST_CHIPS.map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full shrink-0">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4AF37]" strokeWidth={1.6} />
                </span>
                <span className="text-white/55 text-[14px] sm:text-[16px] font-manrope font-medium whitespace-nowrap">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* CTAs — TBM's core offer leads; Ziora supports, it doesn't compete */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 hero-ctas">
            <Link
              href="/consultation"
              className="btn-gold px-8 py-3.5"
            >
              Book a Paid Site Inspection <ArrowRight size={14} />
            </Link>
            <Link
              href="/project"
              className="btn-outline px-8 py-3.5"
            >
              View Our Projects
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
