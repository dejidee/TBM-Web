"use client";

import Link from "next/link";
import { Building2, Home, CalendarCheck, ArrowRight } from "lucide-react";

const LINKS = [
  {
    Icon: Building2,
    label: "Browse All Projects",
    desc: "See our completed renovation and construction work",
    href: "/project",
  },
  {
    Icon: Home,
    label: "Back to Home",
    desc: "Return to the main page",
    href: "/",
  },
  {
    Icon: CalendarCheck,
    label: "Book a Consultation",
    desc: "Talk to our team about your own project",
    href: "/consultation",
  },
];

export default function ProjectNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] font-manrope px-4 py-24">
      <div className="max-w-md w-full text-center">
        <p className="text-[#D4AF37] text-[10px] font-semibold uppercase tracking-[0.32em] mb-5">
          Project · Not Found
        </p>
        <h1 className="font-primary font-bold text-3xl sm:text-4xl text-white leading-tight mb-4">
          This project doesn&apos;t exist
        </h1>
        <div
          className="mx-auto mb-5 h-px w-20"
          style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }}
        />
        <p className="text-white/40 text-sm sm:text-base leading-relaxed mb-10">
          We couldn&apos;t locate this project. It may have been removed, or
          the link might be incorrect.
        </p>

        <div className="flex flex-col gap-2.5">
          {LINKS.map(({ Icon, label, desc, href }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-4 p-4 min-h-11 border border-white/[0.07] hover:border-[#D4AF37]/30 transition-colors group text-left"
              style={{ background: "rgba(255,255,255,0.015)" }}
            >
              <div className="w-9 h-9 border border-white/10 group-hover:border-[#D4AF37]/50 flex items-center justify-center shrink-0 transition-colors">
                <Icon className="w-4 h-4 text-white/45 group-hover:text-[#D4AF37] transition-colors" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm">{label}</p>
                <p className="text-white/35 text-xs mt-0.5">{desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-white/15 group-hover:text-white/45 group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
