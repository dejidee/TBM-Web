"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

const PARTICLES = [
  { x: 8,  y: 18, size: 3, delay: 0,   dur: 4.2 },
  { x: 22, y: 75, size: 5, delay: 1.1, dur: 5.5 },
  { x: 82, y: 12, size: 4, delay: 0.4, dur: 3.8 },
  { x: 73, y: 68, size: 7, delay: 2.0, dur: 6.2 },
  { x: 50, y: 88, size: 3, delay: 1.6, dur: 4.8 },
  { x: 35, y: 42, size: 4, delay: 2.8, dur: 5.1 },
  { x: 92, y: 55, size: 2, delay: 0.7, dur: 3.5 },
  { x: 14, y: 62, size: 6, delay: 1.9, dur: 4.4 },
  { x: 63, y: 28, size: 3, delay: 0.2, dur: 5.8 },
  { x: 47, y: 8,  size: 5, delay: 3.2, dur: 3.9 },
  { x: 88, y: 82, size: 4, delay: 1.4, dur: 6.5 },
  { x: 5,  y: 92, size: 3, delay: 0.9, dur: 4.1 },
];

function FloatingParticle({ x, y, size, delay, dur }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        background: "rgba(212,175,55,0.35)",
        filter: "blur(1px)",
      }}
      animate={{ y: [0, -24, 0], opacity: [0.1, 0.5, 0.1], scale: [1, 1.3, 1] }}
      transition={{ duration: dur, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

const ease = [0.16, 1, 0.3, 1];

export default function UnderConstruction() {
  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden px-6">

      {/* ── ambient glow orbs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute"
          style={{
            top: "-15%", left: "-8%",
            width: 600, height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212,175,55,0.10) 0%, transparent 68%)",
          }}
          animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute"
          style={{
            bottom: "-12%", right: "-6%",
            width: 700, height: 700,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 68%)",
          }}
          animate={{ scale: [1, 1.22, 1], opacity: [0.4, 0.75, 0.4] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
        />
        <motion.div
          className="absolute"
          style={{
            top: "35%", left: "35%",
            width: 900, height: 900,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      {/* ── floating gold particles ── */}
      {PARTICLES.map((p, i) => <FloatingParticle key={i} {...p} />)}

      {/* ── top rule ── */}
      <motion.div
        className="absolute top-0 left-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #D4AF37 50%, transparent)" }}
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 2.2, ease: "easeOut" }}
      />

      {/* ── main content ── */}
      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-2xl">

        {/* brand slug */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
          className="mb-10 flex flex-col items-center gap-2"
        >
          <span className="font-primary tracking-[0.45em] text-[11px] text-gold uppercase">
            TBM Building Services
          </span>
          <div className="h-px w-20 bg-gold/25" />
        </motion.div>

        {/* headline */}
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.95, delay: 0.38, ease }}
          className="font-primary text-[clamp(2.6rem,8vw,5rem)] leading-[1.04] tracking-tight text-white mb-5"
        >
          Something<br />
          <span className="text-gold">Extraordinary</span><br />
          Is Being Built.
        </motion.h1>

        {/* sub-copy */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="font-manrope text-white/38 text-[1.0rem] leading-relaxed mb-12 max-w-[480px]"
        >
          We're putting the finishing touches on our new platform: luxury
          renovation, AI-powered design, and premium materials, all in one place.
        </motion.p>

        {/* location tag */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.15 }}
          className="flex items-center gap-1.5 text-white/18 font-inter text-[11px] tracking-wide"
        >
          <MapPin size={11} className="text-gold/30" />
          <span>Abuja · Lagos, Nigeria</span>
        </motion.div>
      </div>

      {/* ── bottom copyright ── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.25 }}
        className="absolute bottom-6 font-inter text-[11px] text-white/15 tracking-wider"
      >
        © {new Date().getFullYear()} TBM Building Services. All rights reserved.
      </motion.p>

      {/* ── bottom rule ── */}
      <motion.div
        className="absolute bottom-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #D4AF37 50%, transparent)" }}
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 2.2, ease: "easeOut", delay: 0.6 }}
      />
    </div>
  );
}
