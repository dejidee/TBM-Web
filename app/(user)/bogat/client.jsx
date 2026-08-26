"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Layers,
  Droplets,
  DoorOpen,
  Bath,
  Diamond,
  Gem,
  Shield,
  Truck,
  Headphones,
  CheckCircle,
  RotateCcw,
  Phone,
  Search,
  ShoppingCart,
  PackageSearch,
  BookOpen,
  Sparkles,
} from "lucide-react";
import Reveal from "@/components/common/reveal";

// ── Data ──────────────────────────────────────────────────────────────────────

const TRUST_CHIPS = [
  { Icon: Diamond, label: "Premium Quality" },
  { Icon: Shield, label: "Verified Authentic" },
  { Icon: Truck, label: "Reliable Delivery" },
  { Icon: Headphones, label: "Expert Advice" },
];

// Bogat's real signature collections — all bathroom vanity/stone, matching
// the client audit's required positioning. Sourced from the live category
// data (parent "Bathroom", 7 children); hrefs use each collection's real
// slug, which app/(user)/bogat/materials/client.jsx resolves to a category
// id and applies as a filter. Do not add categories that don't exist in the
// live catalogue (Bogat has no separate tiles/doors/general-materials line).
const CATEGORIES = [
  {
    Icon: Diamond,
    label: "Eclat Atelier",
    href: "/bogat/materials?category=eclat-atelier",
    image: "/site-images/web/bathroom-2-after.jpg",
    description: "Complete luxury vanity systems.",
  },
  {
    Icon: Gem,
    label: "Joaillerie Stone",
    href: "/bogat/materials?category=joaillerie-stone",
    image: "/site-images/web/bathroom-1-after.jpg",
    description: "Stone & cabinet editions.",
  },
  {
    Icon: Layers,
    label: "Monolithe Prive",
    href: "/bogat/materials?category=monolithe-prive",
    image: "/site-images/web/staircase-after.jpg",
    description: "Illuminated stone vanities.",
  },
  {
    Icon: Droplets,
    label: "Levitation Royale",
    href: "/bogat/materials?category=levitation-royale",
    image: "/site-images/web/kitchen-island.jpg",
    description: "Light floating basins.",
  },
  {
    Icon: Bath,
    label: "Maison Sculptee",
    href: "/bogat/materials?category=maison-sculptee",
    image: "/site-images/web/interior-finished.jpg",
    description: "Vessel & double vanity collection.",
  },
  {
    Icon: DoorOpen,
    label: "Terra Sculpte",
    href: "/bogat/materials?category=terra-sculpte",
    image: "/site-images/web/patio-after.jpg",
    description: "Organic & artisan stone forms.",
  },
  {
    Icon: Sparkles,
    label: "Symphonie Deux",
    href: "/bogat/materials?category=symphonie-deux",
    image: "/site-images/web/villa-modern-after.jpg",
    description: "Statement stone collection.",
  },
];

const WHY_BOGAT = [
  {
    Icon: Diamond,
    title: "Premium Quality",
    desc: "Carefully selected materials of the highest standard.",
  },
  {
    Icon: CheckCircle,
    title: "Authentic Brands",
    desc: "We partner with world-class brands you can trust.",
  },
  {
    Icon: Layers,
    title: "Wide Selection",
    desc: "A vast range of designs, finishes, and styles to suit every taste.",
  },
  {
    Icon: Truck,
    title: "Reliable Delivery",
    desc: "Timely delivery with care and professional handling.",
  },
  {
    Icon: Headphones,
    title: "Expert Support",
    desc: "Our team helps you choose the perfect fit for your project.",
  },
  {
    Icon: RotateCcw,
    title: "After-Sales Care",
    desc: "We stand by our products long after installation.",
  },
];

const BRANDS = [
  "Atlas Concorde",
  "Marazzi",
  "Grohe",
  "Kohler",
  "Jaquar",
  "Duravit",
  "RAK Ceramics",
  "Porcelanosa",
];

const HOW_TO_SHOP = [
  {
    step: "01",
    Icon: Search,
    title: "Browse & Search",
    desc: "Head to the Marketplace and filter by category, brand, or price — or search by product name.",
  },
  {
    step: "02",
    Icon: PackageSearch,
    title: "Explore the Product",
    desc: "View the full gallery, select your variant (size or finish), and read the specifications.",
  },
  {
    step: "03",
    Icon: ShoppingCart,
    title: "Add to Cart or Request Price",
    desc: "Products with visible pricing go straight to cart. Premium items allow you to request a tailored quote.",
  },
  {
    step: "04",
    Icon: Truck,
    title: "Receive at Your Door",
    desc: "Confirm your delivery address at checkout. We deliver across Abuja and Lagos within 3–7 business days.",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function BogatClient() {
  return (
    <div className="min-h-screen bg-black font-manrope">
      {/* ═══════════════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Desktop — full-bleed image, text emerges from the gradient rather
            than sitting beside a hard-edged image column */}
        <div className="hidden lg:block absolute inset-0">
          <div className="relative h-full w-full">
            <Image
              src="/hero/bogat-hero.png"
              alt="Bogat premium materials showroom"
              fill
              priority
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-linear-to-r from-black via-black/85 to-black/40" />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute bottom-0 inset-x-0 h-28 bg-linear-to-t from-black to-transparent" />
          </div>
        </div>

        {/* Mobile — background image */}
        <div className="lg:hidden absolute inset-0">
          <Image
            src="/hero/bogat-hero.png"
            alt="Bogat premium materials"
            fill
            priority
            className="object-cover object-center opacity-20"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/55 to-black" />
        </div>

        {/* Content column */}
        <div className="relative z-10 w-full lg:w-[56%]">
          <div className="px-6 sm:px-10 lg:pl-16 xl:pl-20 2xl:pl-28 pt-32 pb-24 sm:pt-36 sm:pb-28">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-[#D4AF37] text-xs font-bold tracking-[0.38em] uppercase mb-5"
            >
              Bogat by TBM
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="font-poppins font-bold leading-[1.12] tracking-tight mb-6"
            >
              <span className="block text-white text-[32px] sm:text-[50px] lg:text-[52px] xl:text-[58px]">
                Luxury Finishes.
              </span>
              <span className="block text-white text-[32px] sm:text-[50px] lg:text-[52px] xl:text-[58px]">
                Timeless Beauty.
              </span>
              <span className="block text-[#D4AF37] text-[32px] sm:text-[50px] lg:text-[52px] xl:text-[58px]">
                Built to Perfection.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="text-white/50 text-[14px] sm:text-[17px] leading-relaxed mb-8 max-w-[85%]"
            >
              TBM&apos;s premium bathroom vanity, sanitaryware, and finishing
              brand — for luxury homes and commercial spaces across Nigeria.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24 }}
              className="flex flex-wrap gap-x-6 gap-y-3 mb-10"
            >
              {TRUST_CHIPS.map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-[#D4AF37]" strokeWidth={1.5} />
                  <span className="text-white/55 text-[13px] font-medium">
                    {label}
                  </span>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.32 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
            >
              <Link
                href="/bogat/materials"
                className="btn-gold px-8 py-3.5"
              >
                Explore Materials <ArrowRight size={14} />
              </Link>
              <Link
                href="/contact"
                className="btn-outline px-8 py-3.5"
              >
                Book Showroom Visit
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.46 }}
              className="mt-5"
            >
              <Link
                href="/bogat/guide"
                className="inline-flex items-center gap-2 text-white/30 hover:text-[#D4AF37]/70 text-xs font-manrope transition-colors duration-200 group"
              >
                <BookOpen size={11} className="shrink-0" />
                First time here? Read our 6-step shopping guide
                <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform duration-200" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CATEGORY NAVIGATION STRIP
      ═══════════════════════════════════════════════════════════════════ */}
      <section
        style={{ background: "#0d0b08" }}
        className="border-y border-white/[0.08]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 md:grid-cols-7 divide-x divide-white/[0.08]">
            {CATEGORIES.map(({ Icon, label, href }) => (
              <Link
                key={label}
                href={href}
                className="group flex flex-col items-center gap-3 py-7 px-3 text-center hover:bg-white/[0.025] transition-colors duration-200"
              >
                <div className="w-10 h-10 rounded-full border border-white/10 group-hover:border-[#D4AF37]/40 flex items-center justify-center transition-colors duration-200 shrink-0">
                  <Icon
                    className="w-4 h-4 text-white/40 group-hover:text-[#D4AF37] transition-colors duration-200"
                    strokeWidth={1.5}
                  />
                </div>
                <span className="text-white/50 group-hover:text-white/85 text-[16px] font-semibold tracking-[0.14em] uppercase transition-colors duration-200 leading-snug">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          PREMIUM COLLECTIONS GRID
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-black py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-12">
            <div>
              <Reveal direction="up">
                <p className="text-[#D4AF37] text-[16px] font-semibold uppercase tracking-[0.28em] mb-3">
                  Our Premium Collections
                </p>
              </Reveal>
              <Reveal direction="up" delay={60}>
                <h2 className="font-poppins font-bold text-3xl sm:text-4xl text-white leading-tight">
                  Curated for Luxury Spaces
                </h2>
              </Reveal>
            </div>
            <Reveal direction="up" delay={80}>
              <Link
                href="/bogat/materials"
                className="flex items-center gap-2 text-white/40 hover:text-[#D4AF37] text-sm font-medium transition-colors duration-200 whitespace-nowrap shrink-0"
              >
                View All Products <ArrowRight size={13} />
              </Link>
            </Reveal>
          </div>

          {/* Editorial grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORIES.map(({ label, href, image, description }, i) => (
              <Reveal key={label} direction="scale" delay={i * 55}>
                <Link
                  href={href}
                  className="group relative block overflow-hidden aspect-[4/5] border border-white/[0.06] hover:border-white/[0.18] transition-all duration-300"
                >
                  <Image
                    src={image}
                    alt={label}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                    <p className="text-[#D4AF37] text-[9px] font-bold uppercase tracking-[0.22em] mb-1.5">
                      {label}
                    </p>
                    <p className="text-white/80 font-poppins font-semibold text-[13px] sm:text-sm leading-snug mb-3">
                      {description}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-white/40 group-hover:text-white/80 text-[16px] font-semibold uppercase tracking-[0.14em] transition-colors duration-200">
                      Explore <ArrowRight size={9} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          GUIDE BANNER
      ═══════════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden border-y"
        style={{ background: "#0c0a06", borderColor: "rgba(212,175,55,0.12)" }}
      >
        {/* Gold top hairline */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)" }}
        />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 py-16 sm:py-20">
          <Reveal direction="up">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-10 lg:gap-20 justify-between">

              {/* Left */}
              <div className="flex items-start gap-5 sm:gap-8 flex-1 min-w-0">
                {/* Ghost "6" */}
                <div
                  aria-hidden
                  className="hidden sm:block shrink-0 select-none leading-none"
                  style={{ opacity: 0.04 }}
                >
                  <span
                    className="font-poppins font-extrabold text-white"
                    style={{ fontSize: "clamp(90px, 12vw, 160px)" }}
                  >
                    6
                  </span>
                </div>

                <div>
                  <span
                    className="block text-[10px] font-bold tracking-[0.42em] uppercase font-manrope mb-4"
                    style={{ color: "rgba(212,175,55,0.65)" }}
                  >
                    Complete Shopping Guide
                  </span>
                  <h3
                    className="font-poppins font-extrabold text-white leading-[1.08] mb-4"
                    style={{ fontSize: "clamp(24px, 3.2vw, 44px)" }}
                  >
                    New to Bogat?<br />
                    <span className="text-[#D4AF37]">We&apos;ve got your guide.</span>
                  </h3>
                  <p className="text-white/40 text-sm sm:text-[15px] leading-relaxed max-w-xl mb-6">
                    6 steps — browsing the catalogue, filtering by category, selecting your variant,
                    adding to cart, and receiving delivery at your door.
                  </p>

                  {/* Step trail */}
                  <div className="flex flex-wrap items-center gap-x-1 gap-y-2">
                    {["Browse", "Filter", "Select", "Add to Cart", "Checkout", "Delivery"].map((s, i) => (
                      <span key={s} className="flex items-center gap-1">
                        <span
                          className="text-[9px] font-bold font-manrope"
                          style={{ color: "rgba(212,175,55,0.45)" }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-[12px] text-white/35 font-manrope">{s}</span>
                        {i < 5 && (
                          <ArrowRight size={9} className="text-white/15 mx-0.5" />
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: CTA */}
              <div className="shrink-0 flex flex-col items-start lg:items-end gap-3">
                <Link href="/bogat/guide" className="btn-gold px-10 py-4">
                  Read the Full Guide <ArrowRight size={14} />
                </Link>
                <p
                  className="text-[11px] font-manrope"
                  style={{ color: "rgba(255,255,255,0.22)" }}
                >
                  6 steps · Free · With screenshots
                </p>
              </div>

            </div>
          </Reveal>
        </div>

        {/* Gold bottom hairline */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent)" }}
        />
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          HOW TO SHOP — 4-STEP STRIP
      ═══════════════════════════════════════════════════════════════════ */}
      <section
        style={{ background: "#0a0806" }}
        className="py-16 sm:py-20 border-y border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10">
            <div>
              <Reveal direction="up">
                <p className="text-[#D4AF37] text-[16px] font-semibold uppercase tracking-[0.28em] mb-2">
                  How to Shop
                </p>
              </Reveal>
              <Reveal direction="up" delay={60}>
                <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-white">
                  From Browse to Doorstep in 4 Steps
                </h2>
              </Reveal>
            </div>
            <Reveal direction="up" delay={80}>
              <Link
                href="/bogat/guide"
                className="flex items-center gap-1.5 text-[#D4AF37]/60 hover:text-[#D4AF37] text-[16px] font-semibold transition-colors duration-200 whitespace-nowrap shrink-0"
              >
                Full Shopping Guide <ArrowRight size={12} />
              </Link>
            </Reveal>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5">
            {HOW_TO_SHOP.map(({ step, Icon, title, desc }, i) => (
              <Reveal key={step} direction="up" delay={i * 60}>
                <div
                  className="p-6 sm:p-7 flex flex-col gap-4 h-full"
                  style={{ background: "#0a0806" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full border flex items-center justify-center shrink-0"
                      style={{
                        borderColor: "rgba(212,175,55,0.22)",
                        background: "rgba(212,175,55,0.05)",
                      }}
                    >
                      <Icon className="w-4 h-4 text-[#D4AF37]" strokeWidth={1.5} />
                    </div>
                    <span className="text-white/22 text-[11px] font-bold tracking-[0.25em] uppercase font-manrope">
                      Step {step}
                    </span>
                  </div>
                  <h3 className="font-poppins font-bold text-white text-[14px] leading-snug">
                    {title}
                  </h3>
                  <p className="text-white/40 text-[13px] leading-relaxed">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* CTA row */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/bogat/materials"
              className="btn-gold"
            >
              <ShoppingCart size={13} />
              Start Shopping
            </Link>
            <Link
              href="/bogat/guide"
              className="btn-outline"
            >
              Read the Full Guide <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          WHY BOGAT — TRUST GRID
      ═══════════════════════════════════════════════════════════════════ */}
      <section style={{ background: "#080808" }} className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
          <div className="text-center mb-14">
            <Reveal direction="up">
              <p className="text-[#D4AF37] text-[16px] font-semibold uppercase tracking-[0.28em] mb-3">
                Why Bogat
              </p>
            </Reveal>
            <Reveal direction="up" delay={60}>
              <h2 className="font-poppins font-bold text-3xl sm:text-4xl text-white">
                The Standard Behind Every Finish
              </h2>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06] border border-white/[0.06]">
            {WHY_BOGAT.map(({ Icon, title, desc }, i) => (
              <Reveal key={title} direction="up" delay={i * 55}>
                <div className="bg-[#080808] p-7 sm:p-8 group hover:bg-[#0f0d0a] transition-colors duration-200 h-full">
                  <div className="w-10 h-10 rounded-full border border-[#D4AF37]/25 flex items-center justify-center mb-5 group-hover:border-[#D4AF37]/50 transition-colors duration-200">
                    <Icon
                      className="w-4 h-4 text-[#D4AF37]"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="font-poppins font-semibold text-white text-[14px] mb-2">
                    {title}
                  </h3>
                  <p className="text-white/38 text-[13px] leading-relaxed">
                    {desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          TRUSTED BRANDS — MARQUEE
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-black py-16 border-y border-white/[0.06] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 mb-10">
          <Reveal direction="up">
            <p className="text-white/30 text-[16px] font-semibold uppercase tracking-[0.3em] text-center">
              Our Trusted Brands
            </p>
          </Reveal>
        </div>

        <div className="relative flex overflow-x-hidden">
          <motion.div
            className="flex gap-16 whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          >
            {[...BRANDS, ...BRANDS].map((brand, i) => (
              <span
                key={i}
                className="text-white/22 font-poppins font-bold text-base sm:text-lg tracking-tight cursor-default select-none"
              >
                {brand}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SHOWROOM CTA
      ═══════════════════════════════════════════════════════════════════ */}
      <section style={{ background: "#0d0b08" }} className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image */}
            <Reveal direction="left">
              <div className="relative overflow-hidden aspect-[4/5] lg:aspect-auto lg:h-[520px] bg-[#111]">
                <Image
                  src="/hero/re-imagine.png"
                  alt="Bogat showroom — experience premium materials in person"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute bottom-0 inset-x-0 h-24 bg-linear-to-t from-black/60 to-transparent" />
              </div>
            </Reveal>

            {/* Content */}
            <div>
              <Reveal direction="up">
                <p className="text-[#D4AF37] text-[16px] font-semibold uppercase tracking-[0.28em] mb-4">
                  Visit Our Showroom
                </p>
              </Reveal>
              <Reveal direction="up" delay={60}>
                <h2 className="font-poppins font-bold text-3xl sm:text-[40px] lg:text-[44px] leading-[1.1] text-white mb-5">
                  Experience Materials.{" "}
                  <span className="text-[#D4AF37]">Feel the Difference.</span>
                </h2>
              </Reveal>
              <Reveal direction="up" delay={100}>
                <p className="text-white/45 text-base leading-relaxed mb-10 max-w-md">
                  Visit any of our showrooms in Abuja or Lagos and let our
                  experts guide you through the full Bogat collection. Touch,
                  compare, and choose with confidence.
                </p>
              </Reveal>
              <Reveal direction="up" delay={140}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <Link
                    href="/contact"
                    className="btn-gold px-8 py-3.5"
                  >
                    Book a Showroom Visit <ArrowRight size={14} />
                  </Link>
                  <a
                    href="tel:+2348107324443"
                    className="flex items-center gap-2 text-white/50 hover:text-white text-sm font-medium transition-colors duration-200"
                  >
                    <Phone size={13} className="text-[#D4AF37]" />
                    +234 810 732 4443
                  </a>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
