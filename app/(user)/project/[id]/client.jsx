"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Wallet, Clock, Building2, CheckCircle2, Phone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const CATEGORY_COLORS = {
  "Guest Toilet Renovation": "bg-black/75 text-blue-300 border-blue-400/60",
  "Construction (Shell to Finish)": "bg-black/75 text-orange-300 border-orange-400/60",
  "Outdoor / Exterior Design": "bg-black/75 text-green-300 border-green-400/60",
  "Bathroom Renovation": "bg-black/75 text-purple-300 border-purple-400/60",
  "Interior Finishing": "bg-black/75 text-pink-300 border-pink-400/60",
  "Interior Renovation": "bg-black/75 text-yellow-300 border-yellow-400/60",
};

// ── Before / After Slider ─────────────────────────────────────────────────────

function BeforeAfterSlider({ beforeUrl, afterUrl, beforeCaption, afterCaption, title }) {
  const [pos, setPos] = useState(50);
  // Natural aspect of the After photo. The frame adopts it once known, so a
  // portrait pair gets a tall centered frame instead of floating in a 16:10
  // letterbox, and a landscape pair still fills the column.
  const [ratio, setRatio] = useState(null);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const updatePos = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPos((x / rect.width) * 100);
  }, []);

  useEffect(() => {
    const onUp = () => { isDragging.current = false; };
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchend", onUp);
    return () => {
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchend", onUp);
    };
  }, []);

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className={`relative mx-auto overflow-hidden cursor-col-resize select-none rounded-2xl bg-[#111] ${ratio ? "" : "w-full aspect-[4/5] sm:aspect-[16/10]"}`}
        style={
          ratio
            ? ratio >= 1
              ? { aspectRatio: ratio, width: "100%" }
              : { aspectRatio: ratio, height: "min(72vh, 40rem)", maxWidth: "100%" }
            : undefined
        }
        onMouseDown={(e) => { isDragging.current = true; updatePos(e.clientX); }}
        onMouseMove={(e) => { if (isDragging.current) updatePos(e.clientX); }}
        onTouchStart={(e) => { isDragging.current = true; updatePos(e.touches[0].clientX); }}
        onTouchMove={(e) => { if (isDragging.current) updatePos(e.touches[0].clientX); }}
      >
        {/* After (background) */}
        <Image
          src={afterUrl}
          alt={`${title} — after renovation`}
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          draggable={false}
          className="object-cover"
          onLoad={(e) => {
            const { naturalWidth: w, naturalHeight: h } = e.target;
            if (w > 0 && h > 0) setRatio(w / h);
          }}
        />

        {/* Before (clipped to left) */}
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <Image
            src={beforeUrl}
            alt={`${title} — before renovation`}
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            draggable={false}
            className="object-cover"
          />
        </div>

        {/* Divider + handle */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-xl pointer-events-none" style={{ left: `${pos}%` }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-2xl flex items-center justify-center border border-white/50">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M6 9L3 6M3 6L6 3M3 6H12" stroke="#1a1a1a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 9L15 12M15 12L12 15M15 12H6" stroke="#1a1a1a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Side labels */}
        <div className="absolute bottom-4 left-4 flex flex-col items-start gap-1 pointer-events-none">
          <span className="bg-black/80 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">Before</span>
        </div>
        <div className="absolute bottom-4 right-4 flex flex-col items-end gap-1 pointer-events-none">
          <span className="bg-[#D4AF37]/90 text-black text-xs font-semibold px-3 py-1 rounded-full">After</span>
        </div>

        {/* Hint — fades after interaction */}
        {pos === 50 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="bg-black/60 text-white/80 text-xs font-manrope px-4 py-2 rounded-full backdrop-blur-sm mt-16">
              Drag left or right to compare
            </span>
          </div>
        )}
      </div>

      {/* Captions */}
      {(beforeCaption || afterCaption) && (
        <div className="flex justify-between text-xs text-white/35 font-manrope px-1">
          <span>{beforeCaption}</span>
          <span>{afterCaption}</span>
        </div>
      )}
    </div>
  );
}

// ── Detail Section Block ──────────────────────────────────────────────────────

function DetailItem({ icon: Icon, label, value, highlight }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 p-4 bg-white/4 rounded-xl border border-white/8">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${highlight ? "bg-[#D4AF37]/15" : "bg-white/8"}`}>
        <Icon className={`w-4 h-4 ${highlight ? "text-[#D4AF37]" : "text-white/50"}`} />
      </div>
      <div>
        <p className="text-white/40 text-xs font-manrope mb-0.5">{label}</p>
        <p className={`text-sm font-semibold ${highlight ? "text-[#D4AF37]" : "text-white"}`}>{value}</p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProjectDetailClient({ item }) {
  const router = useRouter();

  const catColor = CATEGORY_COLORS[item.category] ?? "bg-black/75 text-white/70 border-white/20";
  const before = item?.beforeImages?.[0]?.imageUrl ?? null;
  const after = item?.afterImages?.[0]?.imageUrl ?? item?.thumbnailUrl ?? null;
  const beforeCaption = item?.beforeImages?.[0]?.caption ?? null;
  const afterCaption = item?.afterImages?.[0]?.caption ?? null;
  const hasSlider = !!(before && after);

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 pb-10 sm:pb-14">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

          {/* Back link */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 min-h-11 text-white/40 hover:text-white transition-colors text-sm font-manrope mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Past Projects
          </button>

          {/* Header */}
          <div className="mb-8">
            <span className={`inline-block text-[11px] font-medium px-3 py-1 rounded-full border ${catColor} mb-4`}>
              {item.category}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-primary font-bold text-white leading-tight mb-3">
              {item.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-white/50 font-manrope">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                {item.vendorName}
              </span>
              {item.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {item.location}
                </span>
              )}
            </div>
          </div>

          {/* 2-col layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">

            {/* LEFT — visual + description + scope */}
            <div className="space-y-10">

              {/* Before / After slider */}
              {hasSlider ? (
                <div>
                  <p className="text-white/40 text-xs font-manrope uppercase tracking-widest mb-4">
                    Before &amp; After — drag the handle to compare
                  </p>
                  <BeforeAfterSlider
                    beforeUrl={before}
                    afterUrl={after}
                    beforeCaption={beforeCaption}
                    afterCaption={afterCaption}
                    title={item.title}
                  />
                </div>
              ) : after ? (
                <div>
                  <p className="text-white/40 text-xs font-manrope uppercase tracking-widest mb-4">Completed Work</p>
                  <div className="relative w-full max-h-[75vh] aspect-[4/3] bg-[#111] rounded-2xl overflow-hidden">
                    <Image
                      src={after}
                      alt={item.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-contain"
                    />
                  </div>
                </div>
              ) : null}

              {/* Description */}
              {item.description && (
                <div>
                  <h2 className="text-white font-semibold text-base mb-3">About this project</h2>
                  <p className="text-white/55 font-manrope text-sm leading-relaxed">{item.description}</p>
                </div>
              )}

              {/* Scope of Work */}
              {item.scopeOfWork?.length > 0 && (
                <div>
                  <h2 className="text-white font-semibold text-base mb-4">What was done</h2>
                  <ul className="space-y-3">
                    {item.scopeOfWork.map((scope, i) => (
                      <li key={i} className="flex items-start gap-3 text-white/60 text-sm font-manrope leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                        {scope}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* RIGHT — project details sidebar */}
            <div className="space-y-4">
              <div className="bg-[#111] border border-white/8 rounded-2xl p-5 space-y-3 lg:sticky lg:top-32">
                <p className="text-white/30 text-[11px] font-manrope uppercase tracking-widest mb-4">Project Details</p>

                <DetailItem
                  icon={Wallet}
                  label="Estimated Budget"
                  value={item.budgetDisplay && item.budgetDisplay !== "On Request" ? item.budgetDisplay : null}
                  highlight
                />
                {item.budgetDisplay === "On Request" && (
                  <div className="flex items-start gap-3 p-4 bg-white/4 rounded-xl border border-white/8">
                    <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center shrink-0">
                      <Wallet className="w-4 h-4 text-white/50" />
                    </div>
                    <div>
                      <p className="text-white/40 text-xs font-manrope mb-0.5">Estimated Budget</p>
                      <p className="text-white text-sm font-semibold">Available on request</p>
                      <p className="text-white/35 text-xs font-manrope mt-0.5">Contact us for a personalised quote</p>
                    </div>
                  </div>
                )}

                {item.durationDisplay && item.durationDisplay !== "" && (
                  <DetailItem icon={Clock} label="Project Timeline" value={item.durationDisplay} />
                )}

                <DetailItem icon={Building2} label="Completed by" value={item.vendorName} />
                <DetailItem icon={MapPin} label="Location" value={item.location} />

                {/* CTA */}
                <div className="pt-3 border-t border-white/8 space-y-2">
                  <p className="text-white/40 text-xs font-manrope">Want a similar transformation?</p>
                  <Link
                    href="/consultation"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#D4AF37] text-black text-sm font-manrope font-semibold rounded-xl hover:bg-[#D4AF37]/90 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Book a Consultation
                  </Link>
                  <Link
                    href="/project"
                    className="flex items-center justify-center w-full px-4 py-3 bg-white/5 text-white/60 text-sm font-manrope rounded-xl hover:bg-white/10 hover:text-white transition-colors"
                  >
                    Browse More Projects
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
