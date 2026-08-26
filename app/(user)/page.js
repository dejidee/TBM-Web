import HeroSection from "@/components/shared/home/hero";
import StatsStrip from "@/components/shared/home/trust-strip";
import ZioraSection from "@/components/shared/home/ziora-teaser";
import TransformationSection from "@/components/shared/home/transformation";
import ProcessSection from "@/components/shared/home/process";
import ServicesSection from "@/components/shared/home/services";
import PortfolioSection from "@/components/shared/home/featured-projects";
import MaterialsBogatSection from "@/components/shared/home/materials-bogat";
import WhyChooseTBM from "@/components/shared/home/why-choose-tbm";
import CTASection from "@/components/shared/home/cta";

export const metadata = {
  title: "TBM Building Services – Luxury Renovation & Smart Construction",
  description:
    "Premium renovation and construction company in Abuja & Lagos. We design, visualize, and build luxury spaces using Ziora — our AI-powered 3D design and project estimation system.",
  keywords: [
    "TBM Building Services",
    "luxury renovation Abuja",
    "construction Lagos",
    "Ziora AI design",
    "Bogat materials Nigeria",
    "interior design Abuja",
    "3D home visualization",
    "building project estimate Nigeria",
    "smart construction Nigeria",
    "premium renovation contractor",
  ],
  authors: [{ name: "TBM Building Services" }],
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://tbmbuilding.com",
    siteName: "TBM Building Services",
    title: "TBM Building Services – Luxury Renovation & Smart Construction",
    description:
      "Premium renovation, AI-powered design with Ziora, and certified materials from Bogat — all in one platform.",
  },
};

export default function Home() {
  return (
    <main className="bg-black min-h-screen">
      {/* 1. Hero — split layout */}
      <HeroSection />

      {/* 2. Stats — trust indicators */}
      <StatsStrip />

      {/* 3. Before & After — 4-across transformation gallery (real project proof) */}
      <TransformationSection />
      <div className="bg-white/35 h-[0.35px] w-[80%] mx-auto"></div>
      {/* 4. How TBM Works — 4-step process */}
      <ProcessSection />
      <div className="bg-white/35 h-[0.35px] w-[80%] mx-auto"></div>
      {/* 5. Our Services — 6 image cards */}
      <ServicesSection />

      {/* 6. Explore Our Work — filterable portfolio */}
      {/* <PortfolioSection /> */}

      {/* 7. Why Choose TBM + Final CTA — trust signals */}
      <WhyChooseTBM />

      {/* 8. Ziora AI — supporting technology, introduced only after TBM's
          services, project proof, process, and trust signals (per the
          client audit: Ziora must never compete with or precede TBM's
          core offer) */}
      <ZioraSection />

      {/* 9. Bogat Marketplace — product showcase */}
      <MaterialsBogatSection />

      {/* 10. Final conversion section — repeats the booking CTA at the very
          bottom of the page, per the audit's homepage hierarchy (row 8) */}
      <CTASection />
    </main>
  );
}
