"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/common/reveal";

const FILTERS = ["All", "Bathroom", "Kitchens", "Staircase", "Interiors", "Exteriors"];

const PROJECTS = [
  { src: "/site-images/web/kitchen-lux-after.jpg",  category: "Kitchens",  alt: "Luxury kitchen project" },
  { src: "/site-images/web/interior-finished.jpg",  category: "Interiors", alt: "Finished interior project" },
  { src: "/site-images/web/bathroom-2-after.jpg",   category: "Bathroom",  alt: "Marble bathroom project" },
  { src: "/site-images/web/villa-dusk-after.jpg",   category: "Exteriors", alt: "Completed villa exterior" },
  { src: "/site-images/web/kitchen-island.jpg",     category: "Kitchens",  alt: "Marble island kitchen" },
  { src: "/site-images/web/staircase-after.jpg",    category: "Staircase", alt: "Sculptural staircase design" },
];

export default function PortfolioSection() {
  const [active, setActive] = useState("All");

  const filtered =
    active === "All" ? PROJECTS : PROJECTS.filter((p) => p.category === active);

  return (
    <section className="bg-black py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">

        {/* Title */}
        <Reveal direction="up">
          <h2 className="font-poppins font-bold text-3xl sm:text-4xl text-white text-center mb-10 sm:mb-12">
            Explore Our Work
          </h2>
        </Reveal>

        {/* Filter tabs */}
        <Reveal direction="up" delay={80}>
          <div className="flex flex-wrap justify-center gap-2 mb-10 sm:mb-14">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={`px-5 py-2 text-[13px] font-manrope font-medium tracking-wide transition-all duration-200 rounded-full ${
                  active === f
                    ? "bg-[#D4AF37] text-black"
                    : "border border-white/20 text-white/60 hover:border-white/40 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Image grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((project, i) => (
            <Reveal key={`${project.src}-${i}`} direction="scale" delay={i * 60}>
              <div className="relative overflow-hidden rounded-xl aspect-square bg-card group">
                <Image
                  src={project.src}
                  alt={project.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
              </div>
            </Reveal>
          ))}
        </div>

        {/* CTA */}
        <Reveal direction="up" delay={100}>
          <div className="flex justify-center mt-12 sm:mt-16">
            <Link href="/project" className="btn-gold">
              View Full Portfolio
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
