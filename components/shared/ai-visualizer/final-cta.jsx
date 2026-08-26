"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, MessageSquare, BookOpen } from "lucide-react";
import { enter, RISE } from "@/lib/theme/motion";

/**
 * The close.
 *
 * It restates the three words the hero opened with, because by this point the
 * page has actually earned them: a real building in Act I, the real product in
 * Act II, a real costed breakdown in Act III. Repeating a promise at the end is
 * only powerful if the middle paid for it.
 *
 * Short on purpose. This replaced 380 lines whose bulk was a CSS-3D tablet
 * mockup displaying a stock kitchen photo — the last fake product image on the
 * page, and one that directly contradicted Act II's argument that these are
 * real screenshots. A closing section has one job, and a device mockup is not
 * it.
 *
 * The page previously ended four times over: pricing, then a guide banner, then
 * a CTA-plus-testimonials block, then this — pointing at three different
 * destinations between them. Every primary action on the page now goes to
 * /dashboard/ai-designs/new and every secondary to /consultation.
 */
export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-z-base font-manrope">
      {/* Gold hairline — the page's last edge */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.55) 50%, transparent 100%)",
        }}
      />
      {/* Centred key light, so the close lifts off the section above it */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-160 w-240 -translate-x-1/2 -translate-y-1/3"
        style={{
          background:
            "radial-gradient(circle, rgba(212,175,55,0.09) 0%, rgba(212,175,55,0.02) 40%, transparent 70%)",
        }}
      />

      <motion.div
        initial={RISE}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={enter()}
        className="relative max-w-3xl mx-auto px-4 sm:px-6 py-24 sm:py-28 lg:py-36 text-center"
      >
        <span className="z-eyebrow mb-7">Ready when you are</span>

        <h2 className="font-primary font-extrabold text-[2.5rem] sm:text-[3.5rem] lg:text-[4rem] tracking-tight leading-[0.98] uppercase">
          <span className="text-white">Imagine. Design.</span>{" "}
          <span className="z-gold-text">Build.</span>
        </h2>

        <p className="mt-7 text-white/70 text-base leading-relaxed max-w-lg mx-auto">
          Upload one photo and see the space and the specification — then talk
          to the people who would build it.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard/ai-designs/new"
            className="btn-gold px-9 py-4 justify-center"
          >
            Start Your Design <ArrowRight size={14} />
          </Link>
          <Link
            href="/consultation"
            className="btn-outline px-9 py-4 justify-center"
          >
            <MessageSquare size={14} />
            Book a Consultation
          </Link>
        </div>

        <p className="mt-6 text-white/50 text-xs">
          Start free on the Economy plan — upgrade only when you need more.
        </p>

        <Link
          href="/ziora/guide"
          className="group mt-10 inline-flex items-center min-h-11 gap-2 py-2 text-white/50 hover:text-gold text-[13px] transition-colors"
        >
          <BookOpen size={13} className="shrink-0" aria-hidden />
          New here? Read the 9-step guide
          <ArrowRight
            size={12}
            aria-hidden
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      </motion.div>
    </section>
  );
}
