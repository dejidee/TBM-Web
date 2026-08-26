"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import Image from "next/image";

const EXPO = [0.76, 0, 0.24, 1];
const SMOOTH = [0.22, 1, 0.36, 1];

/**
 * Surfaces where the intro must never play.
 *
 * This is a brand moment for someone arriving at the marketing site. It is 2.2
 * seconds of `overflow: hidden` in front of a work surface for someone who has
 * already signed in — and because <Providers> is mounted once at the root (and
 * must stay that way), it played on /dashboard too. A user opening their orders
 * in a new tab sat through a logo animation to reach a table.
 *
 * The flag is still written on these routes, so a user who starts in the app
 * and then visits the marketing site does not get splashed mid-session either.
 */
const APP_PREFIXES = ["/dashboard", "/admin", "/vendor", "/ziora/studio", "/checkout", "/cart"];

// ─── Corner bracket ───────────────────────────────────────────────────────────
function CornerBracket({ corner }) {
  const ARM = 28;
  const COLOR = "rgba(212,175,55,0.38)";

  const h = { position: "absolute", height: 1, width: ARM, background: COLOR };
  const v = { position: "absolute", width: 1, height: ARM, background: COLOR };

  const isRight  = corner === "tr" || corner === "br";
  const isBottom = corner === "bl" || corner === "br";

  return (
    <div
      style={{
        position: "absolute",
        width: ARM,
        height: ARM,
        ...(isRight  ? { right:  56 } : { left:   56 }),
        ...(isBottom ? { bottom: 56 } : { top:    56 }),
      }}
    >
      <div style={{ ...h, ...(isRight ? { right: 0 } : { left: 0 }), ...(isBottom ? { bottom: 0 } : { top: 0 }) }} />
      <div style={{ ...v, ...(isRight ? { right: 0 } : { left: 0 }), ...(isBottom ? { bottom: 0 } : { top: 0 }) }} />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function LoadingScreen() {
  const [show,  setShow]  = useState(false);
  const [phase, setPhase] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const isAppSurface = APP_PREFIXES.some(
      (p) => pathname === p || pathname?.startsWith(`${p}/`),
    );

    try {
      if (sessionStorage.getItem("tbm:intro")) return;
      sessionStorage.setItem("tbm:intro", "1");
    } catch {
      return; // private mode / SSR guard
    }

    if (isAppSurface) return; // flag consumed above — never plays in the app

    setShow(true);
    document.body.style.overflow = "hidden";

    const timers = [
      setTimeout(() => setPhase(1),  100),   // corner brackets
      setTimeout(() => setPhase(2),  450),   // logo focus-pull
      setTimeout(() => setPhase(3),  950),   // progress sweep
      setTimeout(() => setShow(false), 2200), // trigger exit
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  const onExitComplete = useCallback(() => {
    document.body.style.overflow = "";
  }, []);

  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      {show && (
        <motion.div
          key="tbm-loader"
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: "#080704" }}
          exit={{ y: "-100%", transition: { duration: 0.82, ease: EXPO } }}
        >
          {/* Subtle warm glow behind logo */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(212,175,55,0.055) 0%, transparent 68%)",
            }}
          />

          {/* Corner brackets */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 1 ? 1 : 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <CornerBracket corner="tl" />
            <CornerBracket corner="tr" />
            <CornerBracket corner="bl" />
            <CornerBracket corner="br" />
          </motion.div>

          {/* Logo + rule */}
          <div className="flex flex-col items-center select-none">
            <motion.div
              initial={{ opacity: 0, y: 14, filter: "blur(10px)" }}
              animate={
                phase >= 2
                  ? { opacity: 1, y: 0, filter: "blur(0px)" }
                  : {}
              }
              transition={{ duration: 0.9, ease: SMOOTH }}
            >
              <Image
                src="/tbm-logo-v2.png"
                alt="TBM Building Services"
                width={156}
                height={78}
                priority
                className="w-auto object-contain"
                style={{ height: 68 }}
              />
            </motion.div>

            {/* Horizontal rule that expands from centre */}
            <div
              className="mt-7 overflow-hidden"
              style={{ width: 108, height: 1 }}
            >
              <motion.div
                className="h-full w-full"
                initial={{ scaleX: 0 }}
                animate={phase >= 2 ? { scaleX: 1 } : {}}
                transition={{ duration: 0.75, delay: 0.18, ease: SMOOTH }}
                style={{
                  originX: 0.5,
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.55) 50%, transparent 100%)",
                }}
              />
            </div>
          </div>

          {/* Progress hairline – bottom edge */}
          <div
            className="absolute bottom-0 left-0 right-0 overflow-hidden"
            style={{ height: 1 }}
          >
            <motion.div
              className="h-full w-full"
              initial={{ x: "-100%" }}
              animate={phase >= 3 ? { x: "0%" } : {}}
              transition={{ duration: 1.15, ease: SMOOTH }}
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, #D4AF37 35%, rgba(212,175,55,0.55) 100%)",
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
