"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Reveal from "@/components/common/reveal";

const REASONS = [
  "Luxury is our standard",
  "Transparent process, no surprises",
  "Top-quality materials & finishes",
  "On-time project delivery",
  "Limited projects for maximum attention",
];

// TODO(client): the testimonials previously shown here ("Chiamaka O.",
// "Dr. Marcus T.", "Mrs. Aisha Ibrahim") were recycled/unverifiable —
// two of the three were near-identical to fabricated demo copy in a
// legacy, unused component that still carried the retired agency-era
// branding. Removed
// until real, verified client testimonials (name, project, city) are
// provided.

export default function WhyChooseTBM() {
  return (
    <section className="bg-black py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
        {/* ── Top row: 2-column grid ────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-6">
          {/* Left — Why Choose TBM */}
          <Reveal direction="up">
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-[#D4AF37] text-[16px] font-manrope font-bold tracking-[0.32em] uppercase mb-3">
                  Our Promise
                </p>
                <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-white leading-snug">
                  Why Choose TBM
                </h2>
              </div>
              <ul className="flex flex-col gap-3.5">
                {REASONS.map((r) => (
                  <li key={r} className="flex items-center gap-3">
                    <CheckCircle2
                      className="w-4.5 h-4.5 text-[#D4AF37] shrink-0"
                      strokeWidth={1.8}
                    />
                    <span className="text-white/65 text-[14px] font-manrope">
                      {r}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Right — Final CTA block */}
          <Reveal direction="up" delay={140}>
            <div
              className="rounded-2xl p-7 sm:p-8 flex flex-col justify-between gap-8 h-full"
              style={{
                background: "linear-gradient(145deg, #111110 0%, #0d0b08 100%)",
                border: "1px solid rgba(212,175,55,0.14)",
              }}
            >
              <div>
                <p className="font-poppins font-bold text-[22px] sm:text-[24px] text-white leading-[1.25] mb-3">
                  Build Smarter.
                  <br />
                  Build Luxury.
                  <br />
                  <span className="text-[#D4AF37]">Build with TBM.</span>
                </p>
                <p className="text-white/40 text-[13px] font-manrope leading-relaxed">
                  Book a site inspection or speak with our team to begin your
                  project.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Link href="/consultation" className="btn-gold gap-2">
                  Book a Paid Site Inspection
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                {/* TODO(client): a WhatsApp click-to-chat CTA belongs here,
                    but three different numbers were found across the site
                    (Home/Contact/Bogat) and none could be verified as
                    correct. Routes to the contact form instead until TBM
                    confirms the real business number. */}
                <Link
                  href="/contact"
                  className="flex items-center justify-center gap-2.5 rounded-xl border border-white/14 px-6 py-3.5 text-white/70 font-manrope font-semibold text-[11px] tracking-[0.2em] uppercase hover:border-white/28 hover:text-white hover:bg-white/[0.04] transition-all duration-200"
                >
                  Speak With Our Team
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
