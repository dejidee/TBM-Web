"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Hammer,
  Building2,
  Bath,
  UtensilsCrossed,
  HardHat,
  Wrench,
  Palette,
  ClipboardCheck,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { usePortfolio } from "@/hooks/use-project";

const SERVICES = [
  {
    icon: Hammer,
    title: "Renovation",
    slug: "renovation",
    portfolioCategory: "Interior Renovation",
    tagline: "Transform existing spaces into premium environments",
    intro:
      "TBM specialises in full-scope renovation projects for homes, apartments, and commercial spaces — from structural upgrades to complete interior overhauls.",
    includes: [
      "Site assessment and feasibility review",
      "Full demolition and structural works",
      "Plastering, screeding, and dry-lining",
      "Electrical rewiring and plumbing upgrade",
      "Tiling, flooring, and painting",
      "Final snag, clean, and handover",
    ],
    whoFor:
      "Homeowners, landlords, and developers upgrading existing properties",
    timeline: "4 – 16 weeks depending on scope",
    pricing: "Fixed-price contract after inspection",
    faqs: [
      {
        q: "Do I need to vacate during renovation?",
        a: "For full-scope projects we strongly recommend it. For phased renovations we can work around occupancy.",
      },
      {
        q: "Can I supply my own materials?",
        a: "Yes. For bathroom vanities and sanitaryware specifically, we recommend sourcing through Bogat for quality and warranty coverage.",
      },
    ],
  },
  {
    icon: Palette,
    title: "Interior Fit-Out",
    slug: "interior-fit-out",
    portfolioCategory: "Interior Finishing",
    tagline: "Turn a shell into a space that speaks",
    intro:
      "Our interior fit-out service covers everything from partition walls and ceilings to bespoke joinery, feature walls, and lighting design.",
    includes: [
      "Space planning and layout design",
      "Partition walls and suspended ceilings",
      "Bespoke joinery and built-ins",
      "Feature wall and surface treatments",
      "Lighting design and installation",
      "Furnishing coordination",
    ],
    whoFor:
      "Commercial offices, retail spaces, hospitality venues, and premium residential",
    timeline: "3 – 10 weeks",
    pricing: "Itemised quote after design brief",
    faqs: [
      {
        q: "Do you handle FF&E procurement?",
        a: "Yes — we can coordinate furniture and equipment sourcing through trusted third-party suppliers, and bathroom fixtures through Bogat.",
      },
    ],
  },
  {
    icon: Bath,
    title: "Bathroom Remodeling",
    slug: "bathroom-remodeling",
    portfolioCategory: "Bathroom Renovation",
    tagline: "Luxury bathrooms, delivered",
    intro:
      "From simple refreshes to full wet-room transformations, our bathroom team handles waterproofing, tiling, sanitaryware installation, and all plumbing works.",
    includes: [
      "Waterproofing and tanking",
      "Floor and wall tiling",
      "Concealed cistern and WC installation",
      "Basin, vanity, and mirror fitting",
      "Shower enclosure or wet room construction",
      "Towel rail, heated floor, and accessories",
    ],
    whoFor:
      "Homeowners wanting a premium bathroom without the project management headache",
    timeline: "2 – 4 weeks",
    pricing: "Fixed price after site visit",
    faqs: [
      {
        q: "Can I use my own tiles?",
        a: "Yes. We also recommend tiles and sanitaryware from the Bogat store for convenience and warranty.",
      },
      {
        q: "Do you handle small bathroom refreshes?",
        a: "Yes — re-tiling, fixture swap-outs, and regrouting are all within scope.",
      },
    ],
  },
  {
    icon: UtensilsCrossed,
    title: "Kitchen Remodeling",
    slug: "kitchen-remodeling",
    tagline: "The kitchen you always wanted",
    intro:
      "Full kitchen design and installation — custom cabinetry, countertops, splashbacks, appliance integration, and all associated plumbing and electrical works.",
    includes: [
      "Kitchen layout and design",
      "Cabinet and drawer unit supply and fitting",
      "Countertop fabrication and installation",
      "Splashback tiling",
      "Sink, tap, and appliance plumbing",
      "Electrical sockets and under-cabinet lighting",
    ],
    whoFor:
      "Homeowners and developers remodelling existing kitchens or fitting out new builds",
    timeline: "3 – 6 weeks",
    pricing: "Quote based on kitchen dimensions and spec",
    faqs: [
      {
        q: "Do you supply kitchen units?",
        a: "Yes — we can supply through our trusted kitchen partners or work with your chosen brand.",
      },
    ],
  },
  {
    icon: Building2,
    title: "Construction",
    slug: "construction",
    portfolioCategory: "Construction (Shell to Finish)",
    tagline: "Ground up. Done right.",
    intro:
      "TBM manages new-build construction projects from foundation to finishing — residential and light commercial, with full project management and supervision.",
    includes: [
      "Foundation and substructure",
      "Structural frame and roofing",
      "Block-work, plastering, and screeding",
      "MEP (mechanical, electrical, plumbing) coordination",
      "Internal and external finishing",
      "Handover documentation",
    ],
    whoFor:
      "Landowners, developers, and investors building new residential or commercial structures",
    timeline: "6 – 24 months depending on size and complexity",
    pricing: "Bills of quantities and fixed-price contract",
    faqs: [
      {
        q: "Do you handle planning approvals?",
        a: "We can advise and partner with approved architects and consultants for permit applications.",
      },
    ],
  },
  {
    icon: Wrench,
    title: "Maintenance",
    slug: "maintenance",
    tagline: "Keep your property in peak condition",
    intro:
      "Planned and reactive maintenance services for residential and commercial properties — plumbing, electrical, painting, tiling repairs, and general works.",
    includes: [
      "Plumbing repairs and emergency callouts",
      "Electrical fault-finding and repairs",
      "Repainting and touch-ups",
      "Tile replacement and grouting",
      "Door and window repairs",
      "General snag-fixing",
    ],
    whoFor:
      "Property owners and managers who need reliable, responsive maintenance support",
    timeline: "Same-day to 5 days depending on job type",
    pricing: "Hourly or fixed-rate depending on scope",
    faqs: [
      {
        q: "Do you do emergency callouts?",
        a: "Yes — emergency plumbing and electrical callouts are available for clients in Abuja and Lagos.",
      },
    ],
  },
  {
    icon: ClipboardCheck,
    title: "Design Consultation",
    slug: "design-consultation",
    tagline: "Start with clarity",
    intro:
      "A structured design consultation gives you a full project brief, Ziora AI concepts, material recommendations, and a realistic budget — before any work begins.",
    includes: [
      "Site visit or remote session",
      "Ziora AI concept generation",
      "Style and material recommendations",
      "Rough order of cost",
      "Project phasing advice",
      "Written consultation summary",
    ],
    whoFor:
      "Anyone starting a renovation or fit-out who wants clarity before committing",
    timeline: "1–2 days for output after session",
    pricing: "Fixed consultation fee — credited toward project if you proceed",
    faqs: [
      {
        q: "Is the consultation fee refundable?",
        a: "It's not refundable, but it is credited in full toward your project cost if you proceed with TBM.",
      },
    ],
  },
  {
    icon: HardHat,
    title: "Project Supervision",
    slug: "project-supervision",
    tagline: "Eyes on site, every day",
    intro:
      "If you have your own contractors but need professional oversight, TBM provides dedicated site supervisors to ensure quality, schedule, and compliance.",
    includes: [
      "Daily site inspection and reporting",
      "Contractor coordination",
      "Quality control sign-off",
      "Schedule tracking",
      "Client progress updates",
      "Final snag walkthrough",
    ],
    whoFor:
      "Clients who have sourced their own builders but need independent oversight",
    timeline: "Duration of the construction phase",
    pricing: "Monthly retainer or project-based fee",
    faqs: [
      {
        q: "Can you supervise projects outside Abuja and Lagos?",
        a: "On a case-by-case basis — contact us to discuss.",
      },
    ],
  },
];

function ServiceCard({ service, index }) {
  const [faqOpen, setFaqOpen] = useState(null);
  const Icon = service.icon;

  const { data: sampleData } = usePortfolio({
    category: service.portfolioCategory,
    pageSize: 2,
    enabled: !!service.portfolioCategory,
  });
  const sampleProjects = service.portfolioCategory
    ? (sampleData?.items ?? [])
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 2) * 0.1 }}
      className="overflow-hidden"
      style={{
        background: "#0d0b08",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.06)",
      }}
      id={service.slug}
    >
      {/* Header */}
      <div className="p-8 sm:p-10 border-b border-white/08">
        <div className="flex items-start gap-5">
          <div
            className="w-12 h-12 border border-white/10 flex items-center justify-center shrink-0"
            style={{ background: "rgba(212,175,55,0.06)" }}
          >
            <Icon className="w-5 h-5 text-[#D4AF37]" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-poppins font-bold text-white mb-1 tracking-tight">
              {service.title}
            </h2>
            <p className="text-[#D4AF37] font-manrope font-medium text-xs tracking-[0.15em] uppercase">
              {service.tagline}
            </p>
          </div>
        </div>
        <p className="mt-5 text-white/45 font-manrope leading-relaxed text-sm sm:text-base">
          {service.intro}
        </p>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/06">
        <div className="p-6 sm:p-8">
          <p className="text-[16px] font-manrope font-bold text-white/35 uppercase tracking-[0.2em] mb-4">
            What&apos;s Included
          </p>
          <ul className="space-y-2.5">
            {service.includes.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm font-manrope text-white/60"
              >
                <span className="w-px h-3 bg-[#D4AF37] mt-1.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <p className="text-[16px] font-manrope font-bold text-white/35 uppercase tracking-[0.2em] mb-2">
              Who It&apos;s For
            </p>
            <p className="text-sm font-manrope text-white/60">
              {service.whoFor}
            </p>
          </div>
          <div>
            <p className="text-[16px] font-manrope font-bold text-white/35 uppercase tracking-[0.2em] mb-2">
              Typical Timeline
            </p>
            <p className="text-sm font-manrope text-white/60">
              {service.timeline}
            </p>
          </div>
          <div>
            <p className="text-[16px] font-manrope font-bold text-white/35 uppercase tracking-[0.2em] mb-2">
              Pricing Approach
            </p>
            <p className="text-sm font-manrope text-white/60">
              {service.pricing}
            </p>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <p className="text-[16px] font-manrope font-bold text-white/35 uppercase tracking-[0.2em] mb-4">
            FAQ
          </p>
          <div
            className="space-y-px"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            {service.faqs.map((faq, fi) => (
              <div
                key={fi}
                className="overflow-hidden"
                style={{ background: "#0d0b08" }}
              >
                <button
                  onClick={() => setFaqOpen(faqOpen === fi ? null : fi)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left"
                >
                  <span className="text-xs font-manrope font-semibold text-white/70">
                    {faq.q}
                  </span>
                  <motion.div
                    animate={{ rotate: faqOpen === fi ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-colors ${faqOpen === fi ? "text-[#D4AF37]" : "text-white/30"}`}
                    />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {faqOpen === fi && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="px-4 pb-4 text-xs font-manrope text-white/45 leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <Link href="/consultation">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full inline-flex items-center justify-center gap-2 font-manrope font-semibold text-sm px-5 py-3.5 text-black group hover:opacity-90 transition-opacity"
                style={{
                  background:
                    "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)",
                }}
              >
                Book Inspection
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            <Link href="/contact?type=estimate">
              <button className="w-full text-sm font-manrope font-medium text-white/60 border border-white/12 hover:border-white/30 px-5 py-3 transition-colors">
                Get Quote
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Sample projects — real portfolio items in this service's category,
          never fabricated examples. Falls back to a link to the full
          portfolio when there's no category match or no published work yet. */}
      <div className="p-6 sm:p-8 border-t border-white/08">
        <p className="text-[16px] font-manrope font-bold text-white/35 uppercase tracking-[0.2em] mb-4">
          Sample Projects
        </p>
        {sampleProjects.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {sampleProjects.map((p) => (
              <Link
                key={p.id}
                href={`/project/${p.id}`}
                className="group block overflow-hidden rounded-lg"
              >
                <div className="relative aspect-4/3 bg-white/5">
                  {p.thumbnailUrl && (
                    <Image
                      src={p.thumbnailUrl}
                      alt={p.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </div>
                <p className="mt-2 text-xs font-manrope text-white/60 group-hover:text-white transition-colors line-clamp-1">
                  {p.title}
                </p>
              </Link>
            ))}
            <Link
              href="/project"
              className="flex items-center justify-center gap-1.5 text-xs font-manrope font-semibold text-[#D4AF37] hover:text-[#D4AF37]/80 transition-colors"
            >
              View all our work
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ) : (
          <Link
            href="/project"
            className="inline-flex items-center gap-1.5 text-sm font-manrope font-semibold text-[#D4AF37] hover:text-[#D4AF37]/80 transition-colors"
          >
            View our completed projects
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </motion.div>
  );
}

export default function ServiceList() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="flex flex-col gap-px"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          {SERVICES.map((service, index) => (
            <ServiceCard key={service.slug} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
