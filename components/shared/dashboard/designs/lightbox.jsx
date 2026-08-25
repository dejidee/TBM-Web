"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import Image from "next/image";
import { X, Download, Heart } from "lucide-react";

/**
 * Full-screen viewer for one design, opened by clicking its card image.
 * A single design in, a single design out — this opens from one card, not a
 * gallery sequence, so there is no prev/next filmstrip.
 *
 * `outputType` has only ever been observed as "Image" (lib/api/schemas/designs.ts),
 * but the studio can request a video tour, so a video renders with native
 * controls rather than risking next/image on a non-image URL.
 */
export default function DesignLightbox({
  design,
  onClose,
  onDownload,
  isDownloading,
  onToggleFavorite,
  isTogglingFavorite,
}) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isVideo = design.outputType?.toLowerCase() === "video";

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex flex-col bg-black/95"
    >
      <div className="flex items-center justify-between gap-4 p-4 sm:p-6">
        <div className="min-w-0">
          {design.roomType && (
            <div className="flex items-center gap-2 text-[13px] text-white/50 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              <span className="capitalize">{design.roomType}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggleFavorite}
            disabled={isTogglingFavorite}
            aria-label={design.isFavorite ? "Remove from favourites" : "Add to favourites"}
            className="h-11 w-11 flex items-center justify-center rounded-lg bg-white/06 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            {isTogglingFavorite ? (
              <span className="block h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
            ) : (
              <Heart className={`w-5 h-5 ${design.isFavorite ? "fill-[#ef4444] text-[#ef4444]" : "text-white/60"}`} />
            )}
          </button>
          <button
            onClick={onDownload}
            disabled={isDownloading}
            aria-label="Download"
            className="h-11 w-11 flex items-center justify-center rounded-lg bg-white/06 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            {isDownloading ? (
              <span className="block h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
            ) : (
              <Download className="w-5 h-5 text-white/60" />
            )}
          </button>
          <button
            onClick={onClose}
            aria-label="Close"
            className="h-11 w-11 flex items-center justify-center rounded-lg bg-white/06 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>
      </div>

      <div className="relative flex-1 min-h-0 px-4 pb-4 sm:px-6 sm:pb-6" onClick={onClose}>
        <div className="relative h-full w-full" onClick={(e) => e.stopPropagation()}>
          {isVideo ? (
            <video
              src={design.url}
              controls
              autoPlay
              className="h-full w-full object-contain"
            />
          ) : (
            <Image
              src={design.url}
              alt={design.prompt || "Design"}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          )}
        </div>
      </div>

      {design.prompt && (
        <p className="px-4 pb-6 sm:px-6 text-center text-[14px] text-white/50 max-w-3xl mx-auto">
          {design.prompt}
        </p>
      )}
    </motion.div>,
    document.body,
  );
}
