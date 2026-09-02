"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Check,
  Play,
  LayoutDashboard,
  FolderOpen,
  Box,
  FileText,
  Package,
  Lightbulb,
  Settings2,
} from "lucide-react";
import Reveal from "@/components/common/reveal";

const CHECKLIST = [
  "3D Visualizations",
  "Estimated Cost Range",
  "Smart Design Recommendations",
];

const ESTIMATE_ROWS = [
  ["Construction", "₦ 16,850,000"],
  ["Finishing", "₦ 6,950,000"],
  ["Materials", "₦ 4,650,000"],
];

const NAV_ITEMS = [
  { Icon: LayoutDashboard, label: "Dashboard" },
  { Icon: FolderOpen, label: "My Projects" },
  { Icon: Box, label: "3D Designs", active: true },
  { Icon: FileText, label: "Estimates" },
  { Icon: Package, label: "Materials" },
  { Icon: Lightbulb, label: "Inspiration" },
  { Icon: Settings2, label: "Settings" },
];

const THUMBS = [
  "/site-images/web/interior-finished.jpg",
  "/site-images/web/kitchen-lux-after.jpg",
  "/site-images/web/bathroom-2-after.jpg",
  "/site-images/web/patio-after.jpg",
];

function ZioraAppMockup() {
  return (
    <div
      className="relative rounded-2xl overflow-hidden w-full"
      style={{
        background: "#0d0b08",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow:
          "0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)",
      }}
    >
      {/* ── 3-panel body ──────────────────────────────────── */}
      <div className="flex" style={{ height: 340 }}>
        {/* Left nav sidebar */}
        <div
          className="hidden sm:flex flex-col shrink-0"
          style={{
            width: 148,
            background: "#090806",
            borderRight: "1px solid rgba(255,255,255,0.055)",
          }}
        >
          {/* Sidebar header */}
          <div className="flex items-center gap-1.5 px-4 py-3.5 border-b border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            <span className="text-white font-poppins font-bold text-[12px] tracking-[0.22em]">
              ZIORA
            </span>
          </div>

          {/* Nav items */}
          <nav className="flex flex-col py-2 flex-1">
            {NAV_ITEMS.map(({ Icon, label, active }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 px-4 py-2"
                style={{
                  background: active ? "rgba(212,175,55,0.08)" : "transparent",
                  borderLeft: active
                    ? "2px solid #D4AF37"
                    : "2px solid transparent",
                }}
              >
                <Icon
                  style={{ width: 12, height: 12, flexShrink: 0 }}
                  color={active ? "#D4AF37" : "rgba(255,255,255,0.3)"}
                  strokeWidth={1.8}
                />
                <span
                  className="font-manrope text-[16px] leading-tight truncate"
                  style={{
                    color: active ? "#D4AF37" : "rgba(255,255,255,0.32)",
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </nav>
        </div>

        {/* Centre — render image */}
        <div className="relative flex-1 min-w-0">
          <Image
            src="/hero/hero.png"
            alt="Ziora 3D visualization"
            fill
            className="object-cover"
          />
          {/* Subtle vignette */}
          <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Right — estimate panel */}
        <div
          className="hidden md:flex flex-col shrink-0 p-4"
          style={{
            width: 196,
            background: "#090806",
            borderLeft: "1px solid rgba(255,255,255,0.055)",
          }}
        >
          <p
            className="font-manrope font-bold uppercase mb-4"
            style={{
              fontSize: 9,
              letterSpacing: "0.28em",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            Project Estimate{" "}
            <span style={{ color: "rgba(255,255,255,0.18)" }}>(Sample)</span>
          </p>

          <p
            className="font-manrope uppercase mb-1"
            style={{
              fontSize: 8,
              letterSpacing: "0.2em",
              color: "rgba(255,255,255,0.22)",
            }}
          >
            Total Estimate
          </p>
          <p
            className="font-poppins font-bold text-white leading-tight mb-4"
            style={{ fontSize: 19 }}
          >
            ₦ 28,450,000
          </p>

          {/* Line items */}
          <div className="flex flex-col gap-3 mb-5">
            {ESTIMATE_ROWS.map(([k, v]) => (
              <div key={k}>
                <div className="flex justify-between items-baseline mb-0.5">
                  <span
                    style={{
                      fontSize: 9,
                      color: "rgba(255,255,255,0.28)",
                      fontFamily: "var(--font-manrope)",
                    }}
                  >
                    {k}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.55)",
                      fontFamily: "var(--font-manrope)",
                      fontWeight: 600,
                    }}
                  >
                    {v}
                  </span>
                </div>
                {/* mini bar */}
                <div
                  style={{
                    height: 2,
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: 2,
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width:
                        k === "Construction"
                          ? "60%"
                          : k === "Finishing"
                            ? "25%"
                            : "15%",
                      background: "#D4AF37",
                      borderRadius: 2,
                      opacity: 0.6,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* View Full Estimate CTA */}
          <button
            className="w-full font-manrope uppercase text-center py-2 rounded-lg transition-colors"
            style={{
              fontSize: 8,
              letterSpacing: "0.2em",
              color: "rgba(255,255,255,0.45)",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent",
            }}
          >
            View Full Estimate
          </button>
        </div>
      </div>

      {/* ── Bottom thumbnail strip ─────────────────────────── */}
      <div
        className="grid gap-1.5 p-3"
        style={{
          gridTemplateColumns: "repeat(4, 1fr)",
          borderTop: "1px solid rgba(255,255,255,0.055)",
          background: "#080604",
        }}
      >
        {THUMBS.map((src, i) => (
          <div
            key={i}
            className="relative overflow-hidden bg-[#111]"
            style={{ borderRadius: 6, aspectRatio: "4/3" }}
          >
            <Image
              src={src}
              alt=""
              fill
              className="object-cover"
              style={{ opacity: i === 0 ? 1 : 0.55 }}
            />
            {/* active indicator on first thumb */}
            {i === 0 && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ border: "1.5px solid #D4AF37", borderRadius: 6 }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ZioraSection() {
  return (
    <section className="bg-black py-16 sm:py-28 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-[42%_58%] gap-10 lg:gap-16 items-center">
          {/* ── Left: copy ───────────────────────────────────────── */}
          <div>
            <Reveal direction="up">
              {/* ZIORA AI badge — sized to never outrank TBM's core-offer
                  headings (capped at text-4xl, same ceiling as "Our Services") */}
              <div className="flex items-center gap-2.5 mb-3">
                <span className="font-poppins font-bold text-white text-2xl sm:text-3xl lg:text-4xl tracking-[0.2em]">
                  ZIORA
                </span>
                <span
                  className="font-manrope font-extrabold text-black uppercase leading-none"
                  style={{
                    fontSize: 12,
                    letterSpacing: "0.15em",
                    background: "#D4AF37",
                    padding: "5px 9px",
                    borderRadius: 5,
                  }}
                >
                  AI
                </span>
              </div>

              <p
                className="text-[#D4AF37] font-manrope font-extrabold uppercase mb-5 text-[16px]"
                style={{ letterSpacing: "0.3em" }}
              >
                TBM&apos;s Ziora Design &amp; Estimate Advantage
              </p>

              <h2 className="font-poppins font-bold text-[26px] sm:text-[34px] md:text-[40px] text-white leading-[1.12] mb-4">
                Design Your Space.
                <br />
                Know Your Cost.
                <br />
                Before We Build.
              </h2>

              <p
                className="text-white/45 font-manrope leading-[1.75] mb-7"
                style={{ fontSize: 16, maxWidth: 320 }}
              >
                Upload your space, choose your style and get stunning 3D designs
                with a cost estimate range in minutes, assisted by TBM&apos;s
                team.
              </p>
            </Reveal>

            {/* Checklist */}
            <Reveal direction="up" delay={100}>
              <ul className="flex flex-col gap-3 mb-9">
                {CHECKLIST.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-transparent shrink-0">
                      <Check
                        className="w-3.5 h-3.5 text-[#D4AF37]"
                        strokeWidth={2.5}
                      />
                    </span>
                    <span
                      className="text-white/60 font-manrope"
                      style={{ fontSize: 13 }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>

            {/* CTAs */}
            <Reveal direction="up" delay={160}>
              <div className="flex items-center gap-5 flex-wrap">
                <Link href="/ziora" className="btn-gold">
                  Design with Ziora Now →
                </Link>
                <Link
                  href="/services#how-it-works"
                  className="flex items-center gap-2.5 group"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  <span className="flex items-center justify-center w-11 h-11 rounded-full border border-white/18 group-hover:border-white/35 transition-colors shrink-0">
                    <Play
                      className="w-3 h-3 ml-0.5 text-white"
                      fill="currentColor"
                      strokeWidth={0}
                    />
                  </span>
                  <span className="font-manrope font-medium text-[13px] group-hover:text-white transition-colors">
                    See How It Works
                  </span>
                </Link>
              </div>
            </Reveal>
          </div>

          {/* ── Right: 3-panel app mockup ─────────────────────────── */}
          <Reveal direction="right" delay={80}>
            <ZioraAppMockup />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
