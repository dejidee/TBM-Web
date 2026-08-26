export const metadata = {
  title: "About TBM Building Services",
  description:
    "Learn about TBM Building Services — our mission, the Bogat materials store, Design with Ziora, and our execution teams across Abuja and Lagos.",
  keywords: [
    "about TBM Building Services",
    "renovation company Abuja",
    "construction company Nigeria",
    "Bogat materials",
    "Ziora AI",
  ],
  openGraph: {
    title: "About TBM Building Services",
    description:
      "Premium renovation, materials, and AI-powered design — all under one roof in Abuja and Lagos.",
    type: "website",
  },
};

import CoreValues from "@/components/shared/about/core-values";
import CTACards from "@/components/shared/about/cta-cards";
import FinalCTA from "@/components/shared/about/final-cta";
import Hero from "@/components/shared/about/hero";
import TBMJourney from "@/components/shared/about/journey";
import MissionVision from "@/components/shared/about/mission";
import OurStructure from "@/components/shared/about/structure";
import WhyChooseTBM from "@/components/shared/about/why";
import React from "react";

const AboutPage = () => {
  return (
    <div>
      <Hero />
      <MissionVision />
      <OurStructure />
      <TBMJourney />
      <CoreValues />
      <WhyChooseTBM />
      <CTACards />
      <FinalCTA />
    </div>
  );
};

export default AboutPage;
