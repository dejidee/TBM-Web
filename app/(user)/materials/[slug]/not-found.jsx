"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Package, Home, CalendarCheck, ArrowRight } from "lucide-react";

const LINKS = [
  {
    Icon: Package,
    label: "Browse All Materials",
    desc: "Explore the full Bogat collection",
    href: "/bogat/materials",
  },
  {
    Icon: Home,
    label: "Back to Home",
    desc: "Return to the main page",
    href: "/",
  },
  {
    Icon: CalendarCheck,
    label: "Book a Consultation",
    desc: "Let our team help you find what you need",
    href: "/consultation",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.2 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function MaterialNotFound() {
  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden font-manrope px-4 py-20"
      style={{ background: "#0d0b08" }}
    >
      {/* Blueprint grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="mnf-grid"
              width="64"
              height="64"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 64 0 L 0 0 0 64"
                fill="none"
                stroke="rgba(212,175,55,0.04)"
                strokeWidth="0.6"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mnf-grid)" />
        </svg>
      </div>

      {/* Ambient large text */}
      <div
        aria-hidden
        className="pointer-events-none select-none absolute inset-0 flex items-center justify-center"
      >
        <span
          className="font-primary font-bold leading-none"
          style={{
            fontSize: "clamp(10rem, 28vw, 32rem)",
            color: "rgba(212,175,55,0.03)",
            userSelect: "none",
            letterSpacing: "-0.04em",
          }}
        >
          404
        </span>
      </div>

      {/* Animated product tag sketch */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.1 }}
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <svg
          width="560"
          height="380"
          viewBox="0 0 560 380"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer frame */}
          <motion.rect
            x="80"
            y="60"
            width="400"
            height="240"
            stroke="rgba(212,175,55,0.12)"
            strokeWidth="0.8"
            strokeDasharray="10 5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2.4, delay: 0.4, ease: "easeInOut" }}
          />
          {/* Inner product silhouette box */}
          <motion.rect
            x="180"
            y="110"
            width="200"
            height="140"
            stroke="rgba(212,175,55,0.15)"
            strokeWidth="0.7"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.6, delay: 1.0, ease: "easeInOut" }}
          />
          {/* X through box — item missing */}
          <motion.line
            x1="180"
            y1="110"
            x2="380"
            y2="250"
            stroke="rgba(212,175,55,0.08)"
            strokeWidth="0.6"
            strokeDasharray="6 3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.7 }}
          />
          <motion.line
            x1="380"
            y1="110"
            x2="180"
            y2="250"
            stroke="rgba(212,175,55,0.08)"
            strokeWidth="0.6"
            strokeDasharray="6 3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.9 }}
          />
          {/* Label tag stem */}
          <motion.line
            x1="380"
            y1="110"
            x2="430"
            y2="75"
            stroke="rgba(212,175,55,0.12)"
            strokeWidth="0.6"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 2.2 }}
          />
          {/* Label tag box */}
          <motion.rect
            x="430"
            y="45"
            width="60"
            height="30"
            stroke="rgba(212,175,55,0.12)"
            strokeWidth="0.6"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 2.4 }}
          />
          <motion.text
            x="460"
            y="64"
            textAnchor="middle"
            fill="rgba(212,175,55,0.14)"
            fontSize="9"
            fontFamily="monospace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.8 }}
          >
            N / A
          </motion.text>
          {/* Dimension line */}
          <motion.line
            x1="80"
            y1="336"
            x2="480"
            y2="336"
            stroke="rgba(212,175,55,0.08)"
            strokeWidth="0.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.4, delay: 2.1 }}
          />
          <motion.line
            x1="80"
            y1="331"
            x2="80"
            y2="341"
            stroke="rgba(212,175,55,0.08)"
            strokeWidth="0.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.6 }}
          />
          <motion.line
            x1="480"
            y1="331"
            x2="480"
            y2="341"
            stroke="rgba(212,175,55,0.08)"
            strokeWidth="0.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.6 }}
          />
        </svg>
      </motion.div>

      {/* ── Main content ── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 text-center max-w-md w-full"
      >
        {/* Overline */}
        <motion.p
          variants={item}
          className="text-[#D4AF37] text-[10px] font-semibold uppercase tracking-[0.32em] mb-5 font-manrope"
        >
          Material · Not Found
        </motion.p>

        {/* Heading */}
        <motion.h1
          variants={item}
          className="font-primary font-bold text-4xl sm:text-5xl text-white leading-tight tracking-tight mb-4"
        >
          This product doesn&apos;t exist
        </motion.h1>

        {/* Gold rule */}
        <motion.div
          variants={item}
          className="mx-auto mb-5 h-px w-20"
          style={{
            background:
              "linear-gradient(90deg, transparent, #D4AF37, transparent)",
          }}
        />

        {/* Description */}
        <motion.p
          variants={item}
          className="text-white/40 text-sm sm:text-base font-manrope leading-relaxed mb-10"
        >
          We couldn&apos;t locate this material. It may have been removed,
          renamed, or the link might be incorrect.
        </motion.p>

        {/* Action links */}
        <motion.div variants={item} className="flex flex-col gap-2.5">
          {LINKS.map(({ Icon, label, desc, href }) => (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ x: 5 }}
                className="flex items-center gap-4 p-4 border border-white/[0.07] hover:border-[#D4AF37]/30 cursor-pointer transition-colors duration-200 group text-left"
                style={{ background: "rgba(255,255,255,0.015)" }}
              >
                <div className="w-9 h-9 border border-white/10 group-hover:border-[#D4AF37]/50 flex items-center justify-center shrink-0 transition-colors">
                  <Icon
                    className="w-4 h-4 text-white/45 group-hover:text-[#D4AF37] transition-colors"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-manrope font-semibold text-white text-sm">
                    {label}
                  </p>
                  <p className="text-white/35 text-xs font-manrope mt-0.5">
                    {desc}
                  </p>
                </div>
                <ArrowRight
                  className="w-4 h-4 text-white/15 group-hover:text-white/45 group-hover:translate-x-1 transition-all duration-200 shrink-0"
                />
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
