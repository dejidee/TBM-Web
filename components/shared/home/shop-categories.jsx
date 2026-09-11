"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// ─── Custom SVG Icons ────────────────────────────────────────────────────────
// All icons: viewBox 0 0 24 24, fill none, stroke currentColor,
// strokeWidth 1.5, strokeLinecap round, strokeLinejoin round

const iconProps = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

// WC & Concealed Systems — tank on top, bowl below, flush button
function WCIcon({ className }) {
  return (
    <svg {...iconProps} className={className}>
      {/* Tank */}
      <rect x="7" y="2" width="10" height="5" rx="1" />
      {/* Flush button on tank */}
      <circle cx="12" cy="4.5" r="1" />
      {/* Seat dividing line */}
      <path d="M5 7h14" />
      {/* Bowl — U shape curving down from seat line */}
      <path d="M5 7C3 7 2 9 2 12C2 17 6.5 20 12 20C17.5 20 22 17 22 12C22 9 21 7 19 7" />
      {/* Floor line */}
      <line x1="2" y1="21.5" x2="22" y2="21.5" />
    </svg>
  );
}

// Basins & Vanity Cabinets — counter top, inset basin, drain, tap
function BasinIcon({ className }) {
  return (
    <svg {...iconProps} className={className}>
      {/* Counter top surface */}
      <path d="M1 8h22" />
      {/* Vanity cabinet body */}
      <path d="M3 8v12a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8" />
      {/* Basin inset — rounded rect cut into counter */}
      <path d="M6 8v6a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V8" />
      {/* Drain circle */}
      <circle cx="12" cy="15" r="1.5" />
      {/* Faucet spout */}
      <path d="M12 8V5" />
      {/* Tap crossbar handle */}
      <path d="M10 5h4" />
    </svg>
  );
}

// Faucets & Mixers — gooseneck mixer tap in side profile
function FaucetIcon({ className }) {
  return (
    <svg {...iconProps} className={className}>
      {/* Base plate */}
      <rect x="9" y="20" width="6" height="2" rx="1" />
      {/* Vertical body */}
      <path d="M12 20V13" />
      {/* Gooseneck arc to the right */}
      <path d="M12 13Q12 8 17 8" />
      {/* Spout going down */}
      <path d="M17 8V12" />
      {/* Water stream */}
      <path d="M17 13V15" />
      {/* Lever handle — horizontal bar through body */}
      <path d="M9 17H15" />
      {/* Handle knob at end */}
      <circle cx="15" cy="17" r="1" />
    </svg>
  );
}

// Shower Sets & Enclosures — wall arm, head plate, spray lines
function ShowerIcon({ className }) {
  return (
    <svg {...iconProps} className={className}>
      {/* Wall mount point */}
      <circle cx="3" cy="5" r="1.5" />
      {/* Arm — horizontal then curves to head */}
      <path d="M4.5 5H9Q12 5 12 9" />
      {/* Shower head plate — horizontal rect */}
      <rect x="8" y="9" width="13" height="5" rx="2.5" />
      {/* Spray lines angled downward */}
      <path d="M10 14L9 19" />
      <path d="M14 14V19" />
      <path d="M18 14L19 19" />
    </svg>
  );
}

// Water Heaters — capsule tank, pipe connections, thermostat dial
function WaterHeaterIcon({ className }) {
  return (
    <svg {...iconProps} className={className}>
      {/* Cylindrical tank body — capsule shape */}
      <rect x="6" y="4" width="12" height="16" rx="6" />
      {/* Top inlet pipe */}
      <path d="M9 4.5V2" />
      <path d="M15 4.5V2" />
      {/* Bottom outlet pipe */}
      <path d="M9 19.5V22" />
      <path d="M15 19.5V22" />
      {/* Thermostat dial */}
      <circle cx="12" cy="12" r="3" />
      {/* Dial indicator tick */}
      <path d="M12 9V10" />
    </svg>
  );
}

// Kitchen Sinks & Taps — double basin, central mixer, drains
function KitchenSinkIcon({ className }) {
  return (
    <svg {...iconProps} className={className}>
      {/* Sink body */}
      <rect x="2" y="5" width="20" height="15" rx="2" />
      {/* Centre divider */}
      <line x1="12" y1="5" x2="12" y2="20" />
      {/* Left basin drain */}
      <circle cx="7" cy="14" r="1.5" />
      {/* Right basin drain */}
      <circle cx="17" cy="14" r="1.5" />
      {/* Faucet spout */}
      <path d="M12 5V2" />
      {/* Faucet crossbar */}
      <path d="M10 2h4" />
    </svg>
  );
}

// Pipes & Fittings — L-shaped pipe with visible wall thickness
function PipesIcon({ className }) {
  return (
    <svg {...iconProps} className={className}>
      {/* L-pipe outline — one closed path: top → right → down → inner corner → left → close */}
      <path d="M2 9H19V22H15V13H2Z" />
      {/* Left end flange */}
      <rect x="1" y="8" width="2" height="7" rx="0.5" />
      {/* Bottom end flange */}
      <rect x="14" y="22" width="6" height="1.5" rx="0.5" />
    </svg>
  );
}

// Tiles & Accessories — 3×3 tile grid with grout lines
function TilesIcon({ className }) {
  return (
    <svg {...iconProps} className={className}>
      {/* Outer border */}
      <rect x="2" y="2" width="20" height="20" rx="1" />
      {/* Vertical grout lines */}
      <line x1="9" y1="2" x2="9" y2="22" />
      <line x1="16" y1="2" x2="16" y2="22" />
      {/* Horizontal grout lines */}
      <line x1="2" y1="9" x2="22" y2="9" />
      <line x1="2" y1="16" x2="22" y2="16" />
    </svg>
  );
}

// Lighting — pendant lamp with shade cone and light rays
function LightingIcon({ className }) {
  return (
    <svg {...iconProps} className={className}>
      {/* Ceiling rose / mount */}
      <line x1="9" y1="2" x2="15" y2="2" />
      {/* Pendant cord */}
      <line x1="12" y1="2" x2="12" y2="6" />
      {/* Shade — trapezoid (wider at bottom) */}
      <path d="M7 6H17L20 17H4Z" />
      {/* Bottom rim of shade */}
      <line x1="4" y1="17" x2="20" y2="17" />
      {/* Light rays below shade */}
      <path d="M8 19L6.5 22" />
      <path d="M12 19V22" />
      <path d="M16 19L17.5 22" />
    </svg>
  );
}

// Doors, Hardware & Finishing — door panel with hinge marks and knob
function DoorIcon({ className }) {
  return (
    <svg {...iconProps} className={className}>
      {/* Door frame / outer border */}
      <rect x="3" y="1" width="18" height="22" rx="1" />
      {/* Door leaf — slightly inset on right, leaving jamb gap */}
      <rect x="4" y="2" width="14" height="20" rx="0.5" />
      {/* Round door knob */}
      <circle cx="20" cy="12" r="1.5" />
      {/* Top hinge */}
      <line x1="4" y1="6" x2="7" y2="6" />
      {/* Bottom hinge */}
      <line x1="4" y1="18" x2="7" y2="18" />
    </svg>
  );
}

// ─── Category data ────────────────────────────────────────────────────────────
const CATEGORIES = [
  { label: "WCs & Concealed Systems",     slug: "wc-concealed",   Icon: WCIcon },
  { label: "Basins & Vanity Cabinets",    slug: "basins-vanity",  Icon: BasinIcon },
  { label: "Faucets & Mixers",            slug: "faucets-mixers", Icon: FaucetIcon },
  { label: "Shower Sets & Enclosures",    slug: "shower-sets",    Icon: ShowerIcon },
  { label: "Water Heaters",               slug: "water-heaters",  Icon: WaterHeaterIcon },
  { label: "Kitchen Sinks & Taps",        slug: "kitchen-sinks",  Icon: KitchenSinkIcon },
  { label: "Pipes & Fittings",            slug: "pipes-fittings", Icon: PipesIcon },
  { label: "Tiles & Accessories",         slug: "tiles",          Icon: TilesIcon },
  { label: "Lighting",                    slug: "lighting",       Icon: LightingIcon },
  { label: "Doors, Hardware & Finishing", slug: "doors-hardware", Icon: DoorIcon },
];

// ─── Section ─────────────────────────────────────────────────────────────────
export default function ShopCategories() {
  return (
    <section className="py-20 sm:py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14"
        >
          <div>
            <span className="inline-block text-gold text-xs font-manrope font-semibold uppercase tracking-[0.2em] mb-4">
              Bogat Store
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-primary font-bold text-[#0A0A0A] leading-tight tracking-tight">
              Shop by Category
            </h2>
            <p className="mt-4 text-base text-[#7A736C] font-manrope max-w-xl">
              Premium building and finishing materials sourced from certified suppliers, delivered to your site.
            </p>
          </div>
          <Link
            href="/bogat/materials"
            className="group inline-flex items-center gap-2 text-[#0A0A0A] font-manrope font-semibold text-sm hover:gap-3 transition-all duration-200 shrink-0"
          >
            View all materials
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-stone">
          {CATEGORIES.map(({ slug, Icon, label }, index) => {
            return (
              <motion.div
                key={slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link
                  href={`/materials?category=${slug}`}
                  className="group flex flex-col items-start gap-4 bg-white p-6 sm:p-7 hover:bg-warm transition-colors duration-200 h-full"
                >
                  <div className="w-11 h-11 flex items-center justify-center border border-stone group-hover:border-gold transition-colors duration-200">
                    <Icon className="w-5 h-5 text-[#3D3833] group-hover:text-[#0A0A0A] transition-colors duration-200" />
                  </div>
                  <span className="text-xs sm:text-sm font-manrope font-semibold text-[#3D3833] group-hover:text-[#0A0A0A] transition-colors leading-snug tracking-wide">
                    {label}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
