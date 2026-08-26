"use client";

import Hero from "./hero";
import HowItWorks from "./how-it-works";
import ActImagine from "./act-imagine";
import ActDesign from "./act-design";
import ActBuild from "./act-build";
import PackageTiers from "./package-tiers";
import ZioraGuideBanner from "./guide-banner";
import FinalCTA from "./final-cta";

/**
 * The Ziora page, as three acts.
 *
 * The hero promises "Imagine. Design. Build." — so the page below has to prove
 * each verb in turn, or the promise is decoration. HowItWorks is the map that
 * orients a visitor in ten seconds; the acts that follow are the evidence, and
 * FinalCTA restates the promise once the middle has paid for it.
 *
 * The division of labour matters: the steps carry *sequence*, the acts carry
 * *proof*. If an act starts explaining "first you upload…", it has drifted into
 * HowItWorks' job and both sections get weaker.
 *
 * Three sections were retired rather than restyled, because their problem was
 * what they said, not how they looked:
 *
 *   · WhyChooseZiora (transformation.jsx) — six cards of adjectives, including
 *     a "used by top architects" claim nobody had verified. ActImagine replaced
 *     it with one real building.
 *   · AppShowcase (show-case.jsx) — 515 lines of hand-built fake app UI wrapped
 *     around a stock kitchen photo. ActDesign replaced it with screenshots of
 *     the product that actually ships.
 *   · CTAAndTestimonials (cta-testimonials.jsx) — three invented quotes from
 *     "Sarah M.", "James T." and "Emily R.", US names on a Nigeria-focused
 *     platform, over blank grey circles where faces should be. Invented social
 *     proof is worth less than none: it is the first thing a sceptical buyer
 *     tests. Act III's verified track record carries the proof now, and a real
 *     testimonial block can return when there are real testimonials.
 *
 * The page also used to end four times — pricing, guide banner, CTA block,
 * final CTA. It ends once now, with the guide reduced to a utility strip.
 */
export default function AIVisualizerView() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <ActImagine />
      <ActDesign />
      <ActBuild />
      <PackageTiers id="pricing" />
      <ZioraGuideBanner />
      <FinalCTA />
    </>
  );
}
