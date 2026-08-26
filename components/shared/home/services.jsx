"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Hammer,
  HardHat,
  Bath,
  UtensilsCrossed,
  Palette,
  Package,
} from "lucide-react";
import Reveal from "@/components/common/reveal";

const SERVICES = [
  {
    Icon: HardHat,
    label: "Renovation",
    desc: "Transforming existing spaces into luxury",
    src: "/site-images/web/kitchen-ext-after.jpg",
  },
  {
    Icon: Hammer,
    label: "Construction",
    desc: "Building modern, durable structures",
    src: "/site-images/web/team-on-site.jpg",
  },
  {
    Icon: Bath,
    label: "Bathrooms",
    desc: "Luxury bathroom designs & remodeling",
    src: "/site-images/web/bathroom-1-after.jpg",
  },
  {
    Icon: UtensilsCrossed,
    label: "Kitchens",
    desc: "Modern, functional kitchen spaces",
    src: "/site-images/web/kitchen-modern-grey.jpg",
  },
  {
    Icon: Palette,
    label: "Interior Finishing",
    desc: "Exquisite finishes tailored to your style",
    src: "/site-images/web/staircase-after.jpg",
  },
  {
    Icon: Package,
    label: "Materials (Bogat)",
    desc: "Premium bathroom vanities, sanitaryware & fittings",
    src: "/site-images/web/kitchen-dark-lux.jpg",
  },
];

export default function ServicesSection() {
  return (
    <section className="bg-black py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">

        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-12 sm:mb-14">
          <Reveal direction="up">
            <h2 className="font-poppins font-bold text-3xl sm:text-4xl text-white">
              Our Services
            </h2>
          </Reveal>
          <Reveal direction="up" delay={60}>
            <p className="text-white/30 text-[11px] font-manrope font-semibold tracking-[0.22em] uppercase">
              End-to-End Solutions for Luxury Spaces
            </p>
          </Reveal>
        </div>

        {/* 3×2 image card grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {SERVICES.map(({ Icon, label, desc, src }, i) => (
            <Reveal key={label} direction="up" delay={i * 60}>
              <Link
                href="/services"
                className="group relative overflow-hidden rounded-2xl aspect-4/3 bg-card block"
              >
                {/* Background image */}
                <Image
                  src={src}
                  alt={label}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent transition-opacity duration-300 group-hover:from-black/90" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 flex items-end gap-3">
                  <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-black/50 border border-white/10 backdrop-blur-sm shrink-0">
                    <Icon className="w-4 h-4 text-[#D4AF37]" strokeWidth={1.5} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-white font-manrope font-bold text-[14px] leading-tight">
                      {label}
                    </p>
                    <p className="text-white/45 font-manrope text-[11px] leading-snug mt-0.5 hidden sm:block">
                      {desc}
                    </p>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* CTA */}
        <Reveal direction="up" delay={80}>
          <div className="flex justify-center mt-12 sm:mt-14">
            <Link href="/services" className="btn-gold">
              Explore All Services
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
