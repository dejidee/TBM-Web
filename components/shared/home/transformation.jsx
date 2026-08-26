"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/common/reveal";
import BeforeAfter from "@/components/common/before-after";
import { usePortfolio } from "@/hooks/use-project";

/* ─────────────────────────────────────────────────────────────────────────
   One large, interactive comparison instead of four equal-weight tiles — the
   transformation is the section's whole argument, so it gets the space a
   thesis needs. A filmstrip beneath it swaps which project fills the frame;
   switching sweeps the divider once, which is also how a visitor who has
   never seen this control learns it drags.

   Sourced from real portfolio entries (beforeImages + afterImages both
   present), not a hardcoded list — this was previously four cards that all
   reused the same stock "before" photo.

   Square, not the portrait ratio the source photography actually is: at
   portrait proportions the featured image alone ran past a full screen on
   most viewports. `BeforeAfter` already crops via `object-cover` for the
   compare effect regardless of ratio, so squaring it off costs no more
   crop than the portrait version did — it just costs less height. The
   featured image also has a capped width (not `1fr`) so it can't grow
   taller again just because the viewport got wider.
───────────────────────────────────────────────────────────────────────── */

function useTransformationProjects() {
  const { data, isLoading } = usePortfolio({ page: 1, pageSize: 20 });
  const projects = useMemo(() => {
    const items = data?.items ?? [];
    return items
      .filter((p) => p.beforeImages?.[0]?.imageUrl && p.afterImages?.[0]?.imageUrl)
      // A homepage teaser, not the archive — the full list lives at /project.
      .slice(0, 6)
      .map((p) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        before: p.beforeImages[0].imageUrl,
        after: p.afterImages[0].imageUrl,
      }));
  }, [data]);
  return { projects, isLoading };
}

function FilmstripThumb({ project, active, onSelect }) {
  return (
    <button
      onClick={onSelect}
      aria-pressed={active}
      aria-label={`Show ${project.title}`}
      className="group relative shrink-0 w-16 sm:w-20 text-left"
    >
      <div
        className={`relative aspect-4/5 overflow-hidden rounded-lg transition-all ${
          active ? "ring-2 ring-[#D4AF37]" : "ring-1 ring-white/12 hover:ring-white/30"
        }`}
      >
        <Image
          src={project.after}
          alt={project.title}
          fill
          className={`object-cover transition-opacity ${active ? "opacity-100" : "opacity-60 group-hover:opacity-90"}`}
          sizes="112px"
        />
      </div>
      <p
        className={`mt-1.5 text-[10px] font-manrope font-semibold uppercase tracking-[0.14em] truncate transition-colors ${
          active ? "text-[#D4AF37]" : "text-white/40 group-hover:text-white/70"
        }`}
      >
        {project.category || "Renovation"}
      </p>
    </button>
  );
}

function TransformationSkeleton() {
  return (
    <div className="max-w-sm mx-auto lg:max-w-none animate-pulse">
      <div className="aspect-square rounded-2xl bg-white/5" />
      <div className="mt-4 h-3 w-32 rounded bg-white/5 mx-auto lg:mx-0" />
      <div className="mt-5 flex gap-3 justify-center lg:justify-start">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="w-16 sm:w-20 aspect-4/5 rounded-lg bg-white/5" />
        ))}
      </div>
    </div>
  );
}

export default function TransformationSection() {
  const { projects, isLoading } = useTransformationProjects();
  const [activeId, setActiveId] = useState(null);

  const active = projects.find((p) => p.id === activeId) ?? projects[0];

  // Nothing real to show — a stock-photo placeholder repeats exactly the
  // problem this section was rebuilt to fix, so this section simply doesn't
  // render rather than fake content.
  if (!isLoading && projects.length === 0) return null;

  return (
    <section className="bg-black py-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <Reveal direction="up">
              <p className="text-[#D4AF37] text-[16px] font-manrope font-extrabold tracking-[0.32em] uppercase mb-3">
                Real Transformations
              </p>
            </Reveal>
            <Reveal direction="up" delay={60}>
              <h2 className="font-poppins font-bold text-3xl sm:text-4xl lg:text-5xl text-white">
                Before &amp; After Projects
              </h2>
            </Reveal>
          </div>
          <Reveal direction="up" delay={80}>
            <Link
              href="/project"
              className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-[12px] font-manrope font-semibold tracking-[0.18em] uppercase shrink-0"
            >
              View All Projects
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Reveal>
        </div>

        {isLoading ? (
          <TransformationSkeleton />
        ) : (
          <div className="lg:flex lg:items-start lg:gap-8">
            {/* Featured comparison — capped width so it can't grow to fill
                the whole row on a wide screen; that's what was making the
                section so tall. */}
            <Reveal direction="scale">
              <div className="max-w-sm mx-auto lg:mx-0 lg:max-w-none lg:w-95 lg:shrink-0">
                <BeforeAfter
                  before={active.before}
                  after={active.after}
                  label={active.title}
                  aspect="1/1"
                  sweepKey={active.id}
                />
                <p className="mt-3 text-[13px] font-manrope text-white/40 text-center lg:text-left">
                  <span className="text-[#D4AF37] font-semibold">{active.category || "Renovation"}</span>
                  {active.title ? ` — ${active.title}` : ""}
                </p>
              </div>
            </Reveal>

            {/* Filmstrip selector */}
            <Reveal direction="up" delay={100}>
              <div className="mt-5 lg:mt-0 lg:flex-1 lg:self-center">
                <p className="hidden lg:block text-white/30 text-[11px] font-manrope font-semibold uppercase tracking-[0.18em] mb-4">
                  More Projects
                </p>
                <div className="flex lg:flex-wrap gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {projects.map((p) => (
                    <FilmstripThumb
                      key={p.id}
                      project={p}
                      active={p.id === active.id}
                      onSelect={() => setActiveId(p.id)}
                    />
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        )}
      </div>
    </section>
  );
}
