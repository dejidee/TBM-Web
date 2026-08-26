"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

// An honest branded panel when a piece has no photography yet — a stock photo
// would misrepresent a bespoke stone product.
function Placeholder({ name, categoryName }) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6"
      style={{
        background: "radial-gradient(circle at 50% 35%, #14110b 0%, #0a0a08 70%)",
      }}
    >
      <span className="font-poppins font-bold text-[#D4AF37] tracking-[0.3em] text-sm uppercase">
        BOGAT
      </span>
      <span className="text-white/80 font-poppins text-lg tracking-wide">
        {name}
      </span>
      {categoryName && (
        <span className="text-white/30 text-[11px] tracking-[0.25em] uppercase">
          {categoryName}
        </span>
      )}
      <span className="mt-2 text-white/25 text-[11px] tracking-wider">
        Studio photography in production
      </span>
    </div>
  );
}

function Badges({ madeToOrder, featured, discountPct }) {
  return (
    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
      {madeToOrder && (
        <span className="text-[11px] font-bold px-2.5 py-1 tracking-widest uppercase bg-[#D4AF37] text-black">
          Made to Order
        </span>
      )}
      {featured && (
        <span className="text-[11px] font-bold px-2.5 py-1 tracking-widest uppercase bg-white/10 text-white border border-white/20">
          Featured
        </span>
      )}
      {discountPct != null && (
        <span className="text-[11px] font-bold px-2.5 py-1 tracking-widest uppercase bg-emerald-500 text-white">
          -{discountPct}% OFF
        </span>
      )}
    </div>
  );
}

/**
 * The product image gallery: a vertical thumbnail rail (horizontal on mobile), a
 * large contained main image, and a full-screen lightbox with cursor-follow
 * zoom, keyboard arrows/Esc, and swipe. Degrades cleanly: at 0 images it shows
 * the branded placeholder; at 1 image it drops the rail/counter/arrows but keeps
 * click-to-expand.
 *
 * `images` are URL strings; `hasRealImages` gates the placeholder.
 */
export default function ProductGallery({
  images = [],
  hasRealImages = false,
  name = "Product",
  categoryName,
  badges = {},
}) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const touchStartX = useRef(null);

  const count = images.length;
  const go = useCallback(
    (dir) => {
      setZoom(false);
      setIndex((i) => (i + dir + count) % count);
    },
    [count],
  );

  // Keyboard nav + body-scroll lock while the lightbox is open.
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === "Escape") setLightbox(false);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [lightbox, go]);

  const onMove = (e) => {
    if (!zoom) return;
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
  };
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40 && count > 1) go(dx < 0 ? 1 : -1);
    touchStartX.current = null;
  };

  const openLightbox = () => {
    setZoom(false);
    setLightbox(true);
  };

  // Aspect lives in the class (square on mobile, 4:3 from sm) — a fixed 4:3
  // frame on a ~360px screen leaves a contained portrait photo tiny.
  const frameClass = "aspect-square sm:aspect-[4/3]";
  const frame = {
    border: "1px solid rgba(212,175,55,0.2)",
    background: "#0d0b09",
  };

  // ── No photography yet ──────────────────────────────────────────────────────
  if (!hasRealImages || count === 0) {
    return (
      <div className={`relative w-full overflow-hidden ${frameClass}`} style={frame}>
        <Placeholder name={name} categoryName={categoryName} />
        <Badges {...badges} />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col-reverse gap-3 lg:flex-row">
        {/* Thumbnail rail — vertical on desktop, horizontal on mobile. */}
        {count > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 lg:w-[76px] lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:overflow-x-visible lg:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => {
                  setIndex(i);
                  setZoom(false);
                }}
                aria-label={`View ${i + 1}`}
                aria-current={i === index}
                className="relative h-16 w-16 shrink-0 overflow-hidden transition-all sm:h-[76px] sm:w-[76px]"
                style={{
                  border:
                    i === index
                      ? "2px solid #D4AF37"
                      : "2px solid rgba(255,255,255,0.08)",
                  background: "#111",
                }}
              >
                <Image
                  src={img}
                  alt={`${name} view ${i + 1}`}
                  fill
                  className="object-contain"
                  sizes="76px"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main image — click to open the lightbox. */}
        <button
          onClick={openLightbox}
          aria-label="Open full-screen gallery"
          className={`group relative block flex-1 cursor-zoom-in overflow-hidden ${frameClass}`}
          style={frame}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              <Image
                src={images[index]}
                alt={`${name} — view ${index + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 55vw"
                priority={index === 0}
              />
            </motion.div>
          </AnimatePresence>

          <Badges {...badges} />

          <span className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-sm bg-black/50 px-2.5 py-1 text-[11px] text-white/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
            <ZoomIn className="h-3.5 w-3.5" /> Click to expand
          </span>
          {count > 1 && (
            <span className="absolute bottom-3 left-3 z-10 rounded-sm bg-black/50 px-2 py-1 text-[11px] tabular-nums text-white/80 backdrop-blur-sm">
              {index + 1} / {count}
            </span>
          )}
        </button>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
            onClick={() => setLightbox(false)}
            role="dialog"
            aria-modal="true"
            aria-label={`${name} gallery`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightbox(false);
              }}
              aria-label="Close gallery"
              className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center text-white/70 transition-colors hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>

            {count > 1 && (
              <span className="absolute left-6 top-6 z-20 text-[13px] tabular-nums text-white/60">
                {index + 1} / {count}
              </span>
            )}

            {count > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    go(-1);
                  }}
                  aria-label="Previous image"
                  className="absolute left-2 z-20 flex h-12 w-12 items-center justify-center text-white/60 transition-colors hover:text-white sm:left-6"
                >
                  <ChevronLeft className="h-7 w-7" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    go(1);
                  }}
                  aria-label="Next image"
                  className="absolute right-2 z-20 flex h-12 w-12 items-center justify-center text-white/60 transition-colors hover:text-white sm:right-6"
                >
                  <ChevronRight className="h-7 w-7" />
                </button>
              </>
            )}

            {/* Image stage — click toggles cursor-follow zoom. */}
            <div
              className="relative h-[80vh] w-[92vw] sm:w-[78vw]"
              onClick={(e) => {
                e.stopPropagation();
                setZoom((z) => !z);
              }}
              onMouseMove={onMove}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
              style={{ cursor: zoom ? "zoom-out" : "zoom-in" }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0"
                >
                  <div
                    className="relative h-full w-full transition-transform duration-200 ease-out"
                    style={{
                      transform: zoom ? "scale(2.4)" : "scale(1)",
                      transformOrigin: `${origin.x}% ${origin.y}%`,
                    }}
                  >
                    <Image
                      src={images[index]}
                      alt={`${name} — view ${index + 1}`}
                      fill
                      className="object-contain"
                      sizes="90vw"
                      priority
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {count > 1 && (
              <div
                className="absolute bottom-4 left-1/2 z-20 flex max-w-[92vw] -translate-x-1/2 gap-2 overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setIndex(i);
                      setZoom(false);
                    }}
                    aria-label={`View ${i + 1}`}
                    className="relative h-14 w-14 shrink-0 overflow-hidden"
                    style={{
                      border:
                        i === index
                          ? "2px solid #D4AF37"
                          : "2px solid rgba(255,255,255,0.15)",
                    }}
                  >
                    <Image src={img} alt="" fill className="object-contain" sizes="56px" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
