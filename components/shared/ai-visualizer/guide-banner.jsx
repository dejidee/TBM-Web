"use client";

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { enter, RISE } from "@/lib/theme/motion";

/**
 * A utility strip, not a section.
 *
 * The guide is genuinely useful — nine steps, real screenshots — but it is a
 * help resource, not an argument, and it used to occupy a full section between
 * pricing and the close: a 160px ghosted "9", a 44px headline, a nine-item
 * chip trail and its own CTA. That made it the fourth thing on the page asking
 * to be read as a conclusion.
 *
 * One row now. It also dropped font-poppins, which appeared nowhere else on
 * this page — the type here is font-primary and font-manrope like everything
 * around it.
 */
export default function ZioraGuideBanner() {
  return (
    <motion.section
      initial={RISE}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={enter()}
      className="bg-z-deep border-y border-z-line font-manrope"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-7">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <BookOpen
              className="w-5 h-5 text-gold shrink-0"
              strokeWidth={1.5}
              aria-hidden
            />
            <div className="min-w-0">
              <p className="text-white text-[15px] font-semibold leading-snug">
                New to Ziora? Nine steps to your first design.
              </p>
              <p className="mt-1 text-white/50 text-[13px] leading-snug">
                Account to download — every step shown with real screenshots.
              </p>
            </div>
          </div>

          <Link
            href="/ziora/guide"
            className="group inline-flex items-center min-h-11 gap-2 py-2 shrink-0 text-[13px] font-semibold tracking-[0.12em] uppercase text-white/70 hover:text-gold transition-colors"
          >
            Read the guide
            <ArrowRight
              size={13}
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
