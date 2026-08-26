"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SECTIONS = [
  {
    title: "Services",
    links: [
      { label: "Renovation", href: "/services" },
      { label: "Interior Fit-Out", href: "/services" },
      { label: "Bathroom Remodeling", href: "/services" },
      { label: "Kitchen Remodeling", href: "/services" },
      { label: "Construction", href: "/services" },
      { label: "Design Consultation", href: "/services" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Projects", href: "/project" },
      { label: "Shop Materials", href: "/materials" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy-policy" },
    ],
  },
];

function AccordionSection({ title, links }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/10 md:border-none">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-4 md:py-0 md:cursor-default md:pointer-events-none"
      >
        <h3 className="text-[#D4AF37] text-[16px] font-bold tracking-[0.25em] uppercase font-manrope">
          {title}
        </h3>
        <ChevronDown
          className={`w-4 h-4 text-white/30 transition-transform duration-300 md:hidden ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Mobile: animated accordion */}
      <AnimatePresence initial={false}>
        <motion.ul
          key="mobile"
          initial={false}
          animate={
            open ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }
          }
          transition={{ duration: 0.28, ease: "easeInOut" }}
          className="overflow-hidden md:hidden"
        >
          <div className="pb-4 space-y-3">
            {links.map((item) => (
              <li key={item.label} className="list-none">
                <Link
                  href={item.href}
                  className="text-white/40 hover:text-white transition-colors text-sm font-manrope"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </div>
        </motion.ul>
      </AnimatePresence>

      {/* Desktop: always visible */}
      <ul className="hidden md:block mt-6 space-y-4">
        {links.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className="text-white/40 hover:text-white transition-colors text-sm font-manrope"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const Footer = () => {
  return (
    <footer className="relative w-full font-manrope overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/footer-background.png"
          alt=""
          fill
          className="object-cover object-center"
          priority={false}
        />
        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-black/5" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-10 md:py-16">
        {/* Top border */}
        <div className="w-full h-px bg-white mb-8 md:mb-12" />

        {/* Grid: Services | Company | divider | Get In Touch */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1px_1.4fr] gap-0 md:gap-12 mb-8 md:mb-12 items-start">
          {SECTIONS.map((s) => (
            <AccordionSection key={s.title} title={s.title} links={s.links} />
          ))}

          {/* Vertical divider — desktop only */}
          <div className="hidden md:block w-px h-full bg-white/20 self-stretch" />

          {/* Get In Touch */}
          <div className="pt-4 md:pt-0">
            <h3 className="text-[#D4AF37] text-[16px] font-bold mb-5 md:mb-7 tracking-[0.25em] uppercase font-manrope">
              Get In Touch
            </h3>
            <p className="text-white/40 text-sm font-manrope leading-relaxed mb-5">
              Reach us for project inquiries, material orders, or Ziora AI
              support.
            </p>
            <a
              href="mailto:info@tbmbuilding.com"
              className="text-[#D4AF37] text-xl md:text-2xl font-bold hover:text-[#c49e30] transition-colors block font-manrope break-all"
            >
              info@tbmbuilding.com
            </a>
            <div className="mt-4 flex flex-col gap-1 text-white/40 text-sm font-manrope">
              <a
                href="https://www.tbmbuilding.com"
                className="hover:text-white/70 transition-colors"
              >
                www.tbmbuilding.com
              </a>
              {/* TODO(client): @tbmbuildingservices is confirmed as the
                  social handle (audit PDF, Priority 4), but which platform
                  (Instagram, X, Facebook...) and the real profile URL
                  weren't specified — shown as plain text, not a link, until
                  confirmed. */}
              <span>@tbmbuildingservices</span>
            </div>
          </div>
        </div>

        {/* Bottom border */}
        <div className="w-full h-px bg-white/20 mb-6" />

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-white/30 text-xs font-manrope tracking-wide">
            © 2026 TBM Building Services — The Building Doctors. All Rights
            Reserved.
          </p>
          <Link
            href="/privacy-policy"
            className="text-white/30 hover:text-white/60 text-xs font-manrope tracking-wide transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
