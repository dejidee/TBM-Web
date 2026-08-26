"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, ArrowRight, X, ZoomIn } from "lucide-react";
import Link from "next/link";
import { usePublicProjects } from "@/hooks/use-project";

// ── Design Card ───────────────────────────────────────────────────────────────

function DesignCard({ item, onClick }) {
  // Flexible field access — we'll tighten once response shape is confirmed
  const imageUrl =
    item?.imageUrl ??
    item?.generatedImageUrl ??
    item?.outputUrl ??
    item?.image ??
    item?.url ??
    null;

  const roomType = item?.roomType ?? item?.room_type ?? item?.room ?? null;
  const projectName =
    item?.projectName ?? item?.name ?? item?.title ?? "AI Design";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={() => imageUrl && onClick(item)}
      className={`group relative bg-[#111] border border-white/8 rounded-2xl overflow-hidden ${imageUrl ? "cursor-pointer hover:border-[#D4AF37]/40" : ""} transition-colors duration-300`}
    >
      {imageUrl ? (
        <>
          <div className="relative aspect-square overflow-hidden">
            <img
              src={imageUrl}
              alt={projectName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
              <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
          <div className="p-3">
            <p className="text-white/80 text-sm font-semibold leading-snug line-clamp-1">
              {projectName}
            </p>
            {roomType && (
              <p className="text-white/40 text-xs font-manrope mt-0.5">
                {roomType}
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="aspect-square flex items-center justify-center text-white/20 text-xs font-manrope p-4 text-center">
          Image unavailable
        </div>
      )}
    </motion.div>
  );
}

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({ item, onClose }) {
  const imageUrl =
    item?.imageUrl ??
    item?.generatedImageUrl ??
    item?.outputUrl ??
    item?.image ??
    item?.url ??
    null;
  const roomType = item?.roomType ?? item?.room_type ?? item?.room ?? null;
  const projectName =
    item?.projectName ?? item?.name ?? item?.title ?? "AI Design";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      <button
        className="absolute top-5 right-5 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        onClick={onClose}
      >
        <X className="w-5 h-5" />
      </button>

      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="max-w-2xl w-full"
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt={projectName}
            className="w-full rounded-2xl object-contain max-h-[75vh]"
          />
        )}
        <div className="mt-4 text-center">
          <p className="text-white font-semibold">{projectName}</p>
          {roomType && (
            <p className="text-white/50 text-sm font-manrope mt-1">
              {roomType}
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Skeleton Grid ─────────────────────────────────────────────────────────────

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden animate-pulse"
        >
          <div className="aspect-square bg-white/5" />
          <div className="p-3 space-y-1.5">
            <div className="h-3.5 bg-white/5 rounded w-3/4" />
            <div className="h-3 bg-white/5 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AIGalleryPage() {
  const [lightboxItem, setLightboxItem] = useState(null);

  const {
    data: designs = [],
    isLoading,
    isError,
  } = usePublicProjects({ page: 1, pageSize: 24 });

  return (
    <>
      {/* Hero */}
      <section className="w-full bg-text-black pt-28 sm:pt-36 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2.5 border border-white/15 text-white/60 text-xs font-manrope font-medium px-4 py-2 tracking-[0.15em] uppercase mb-7">
              <span className="w-1 h-1 bg-[#D4AF37] rounded-full" />
              Community Designs
            </span>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-primary font-bold text-white leading-tight tracking-tight mb-6">
              Ziora Design Gallery
            </h1>
            <p className="text-base sm:text-lg font-manrope text-white/55 max-w-xl mb-8">
              Real spaces reimagined by real users. Browse AI-generated interior
              visions and get inspired to visualize your own renovation.
            </p>
            <Link
              href="/ziora"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-black text-sm font-manrope font-semibold rounded-lg hover:bg-[#D4AF37]/90 transition-colors"
            >
              <Wand2 className="w-4 h-4" />
              Try Design with Ziora
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Gallery */}
      <section className="bg-[#0A0A0A] min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading && <SkeletonGrid />}

          {isError && (
            <div className="text-center py-24 space-y-4">
              <p className="text-white/40 text-sm font-manrope">
                Could not load the gallery right now.
              </p>
              <p className="text-white/25 text-xs font-manrope">
                Check the browser console for the API response shape.
              </p>
            </div>
          )}

          {!isLoading && !isError && designs.length === 0 && (
            <div className="text-center py-24 space-y-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center">
                <Wand2 className="w-7 h-7 text-[#D4AF37]/60" />
              </div>
              <div>
                <p className="text-white/60 font-semibold mb-2">
                  No public designs yet
                </p>
                <p className="text-white/30 text-sm font-manrope">
                  Be among the first to generate and share a design.
                </p>
              </div>
              <Link
                href="/ziora"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-black text-sm font-manrope font-semibold rounded-lg hover:bg-[#D4AF37]/90 transition-colors"
              >
                Generate Your Design <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {!isLoading && !isError && designs.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-8">
                <p className="text-white/40 text-sm font-manrope">
                  {designs.length} design{designs.length !== 1 ? "s" : ""}{" "}
                  shared
                </p>
                <Link
                  href="/ziora"
                  className="inline-flex items-center gap-1.5 text-[#D4AF37] text-sm font-manrope hover:text-[#D4AF37]/80 transition-colors"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  Create yours
                </Link>
              </div>

              <motion.div
                layout
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {designs.map((item, i) => (
                    <DesignCard
                      key={item?.id ?? i}
                      item={item}
                      onClick={setLightboxItem}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      {!isLoading && (
        <section className="bg-[#0A0A0A] border-t border-white/8 py-16">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-4xl font-primary font-bold text-white mb-4">
              See your space transformed
            </h2>
            <p className="text-white/50 font-manrope mb-8">
              Upload a photo of any room and let our AI generate stunning
              renovation concepts in minutes.
            </p>
            <Link
              href="/ziora"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#D4AF37] text-black font-manrope font-semibold rounded-xl hover:bg-[#D4AF37]/90 transition-colors text-sm"
            >
              <Wand2 className="w-4 h-4" />
              Start Visualizing for Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxItem && (
          <Lightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
