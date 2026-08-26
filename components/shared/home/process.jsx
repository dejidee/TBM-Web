"use client";

import { Box, PenTool, HardHat, Diamond } from "lucide-react";
import Reveal from "@/components/common/reveal";

const STEPS = [
  {
    Icon: Box,
    number: "01",
    title: "AI-Assisted Design & Planning",
    description: "3D designs & project estimate",
  },
  {
    Icon: PenTool,
    number: "02",
    title: "Detailed Planning & Approval",
    description: "We plan every detail and get your approval",
  },
  {
    Icon: HardHat,
    number: "03",
    title: "Structured Project Execution",
    description: "Quality construction with strict supervision",
  },
  {
    Icon: Diamond,
    number: "04",
    title: "Luxury Finishing & Handover",
    description: "Premium finishes and on-time handover",
  },
];

/* ── Hexagonal icon container ────────────────────────────────────────── */
function HexIcon({ Icon }) {
  return (
    <div className="relative shrink-0" style={{ width: 52, height: 52 }}>
      {/* Outer hex border layer */}
      <svg
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full"
      >
        {/* flat-top hexagon path */}
        <polygon
          points="26,2 49,14 49,38 26,50 3,38 3,14"
          fill="rgba(212,175,55,0.07)"
          stroke="rgba(212,175,55,0.55)"
          strokeWidth="1.2"
        />
      </svg>
      {/* Icon centered inside */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon className="w-5 h-5 text-[#D4AF37]" strokeWidth={1.5} />
      </div>
    </div>
  );
}

/* ── Arrow connector ─────────────────────────────────────────────────── */
function StepArrow() {
  return (
    <div className="hidden lg:flex items-center justify-center shrink-0 px-3" style={{ marginTop: 19 }}>
      <svg width="28" height="14" viewBox="0 0 28 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="7" x2="20" y2="7" stroke="rgba(212,175,55,0.4)" strokeWidth="1.2" />
        <polyline points="16,3 21,7 16,11" stroke="rgba(212,175,55,0.4)" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export default function ProcessSection() {
  return (
    <section className="bg-black py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">

        {/* Heading — TBM-led; Ziora is introduced later on the page, not here */}
        <Reveal direction="up">
          <h2 className="font-poppins font-bold text-xl sm:text-2xl text-white tracking-[0.08em] uppercase mb-14 sm:mb-16">
            How TBM Works
          </h2>
        </Reveal>

        {/* Steps row — flex on desktop, vertical stack on mobile */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-10 lg:gap-0">
          {STEPS.map((step, i) => (
            <div key={step.number} className="flex lg:flex-1 lg:items-start">

              {/* Step content */}
              <Reveal direction="up" delay={i * 100} as="div" className="flex items-start gap-4 lg:flex-1">
                {/* Hex icon */}
                <HexIcon Icon={step.Icon} />

                {/* Text stack */}
                <div className="pt-0.5">
                  <span
                    className="font-poppins font-bold block mb-1"
                    style={{ fontSize: 13, color: "#D4AF37", letterSpacing: "0.12em" }}
                  >
                    {step.number}
                  </span>
                  <h3 className="font-manrope font-bold text-white uppercase leading-snug mb-2" style={{ fontSize: 13, letterSpacing: "0.04em" }}>
                    {step.title}
                  </h3>
                  <p className="font-manrope text-white/38 leading-relaxed" style={{ fontSize: 12 }}>
                    {step.description}
                  </p>
                </div>
              </Reveal>

              {/* Arrow between steps (desktop only) */}
              {i < STEPS.length - 1 && <StepArrow />}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
