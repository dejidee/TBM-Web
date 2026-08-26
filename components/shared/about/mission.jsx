"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function MissionVision() {
  return (
    <section className="bg-black py-20 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 font-manrope">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          {/* Left — Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-4/3 overflow-hidden relative">
              <Image
                src="/site-images/web/team-on-site.jpg"
                alt="TBM team on a project site"
                fill
                className="object-cover"
                priority
              />
              {/*
                TODO(client): the "Impact Badge" (Over 10,000 homes
                transformed) was removed — it conflicted with the homepage's
                "700+" figure (also removed there) and neither number could
                be confirmed as accurate. Provide one real, verifiable
                project/homes-transformed count and this badge can go back.
              */}
            </div>
          </motion.div>

          {/* Right — Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <span className="inline-block text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.2em]">
              Who we are
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight font-poppins">
              Our Mission & Vision
            </h2>
            <p className="text-base text-white/50 leading-relaxed max-w-xl">
              To deliver{" "}
              <span className="font-semibold text-white">
                premium construction and renovation experiences
              </span>{" "}
              through structured execution, high-quality materials, and
              disciplined project management.
            </p>

            {/* Value Cards */}
            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-px"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              {[
                {
                  label: "Empowerment",
                  desc: "Tools that put you in control.",
                  path: "M13 10V3L4 14h7v7l9-11h-7z",
                },
                {
                  label: "Innovation",
                  desc: "AI-driven design solutions.",
                  path: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
                },
                {
                  label: "Satisfaction",
                  desc: "Quality-focused delivery, every project.",
                  path: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-[#0d0b08] p-6"
                >
                  <div className="w-9 h-9 border border-white/10 flex items-center justify-center mb-4">
                    <svg
                      className="w-4 h-4 text-[#D4AF37]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d={card.path}
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5 tracking-wide">
                    {card.label}
                  </h3>
                  <p className="text-xs text-white/40 leading-relaxed">
                    {card.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
