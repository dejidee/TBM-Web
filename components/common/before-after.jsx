"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Reveal from "@/components/common/reveal";

/**
 * BeforeAfter — a drag-to-compare slider over two images.
 *
 * Extracted from components/shared/home/transformation.jsx, where it was a
 * module-private function, so the Ziora page could use the same control rather
 * than grow a second one that drifts. The home page's rendering is unchanged:
 * every prop defaults to the value it was hard-coded to there.
 *
 * `variant` exists because the two surfaces disagree about corners and nothing
 * else. The home page is soft (rounded cards, pill labels); the Ziora page is
 * sharp everywhere, and a single rounded card there reads as a mistake. Rather
 * than fork the component, the one axis they differ on is a prop.
 *
 * Interaction is deliberately forgiving: drag the handle, or click anywhere on
 * the image to jump the divider there. Pointer, touch and click are all wired;
 * a keyboard user gets the slider input, which is the only one of the four that
 * can be operated without a pointing device.
 *
 * @param {string} before      Image shown on the left of the divider
 * @param {string} after       Image shown on the right
 * @param {string} [label]     Caption over the bottom gradient; omitted if unset
 * @param {number} [delay]     Reveal delay in ms
 * @param {string} [aspect]    CSS aspect-ratio, e.g. "7/5" or "16/9"
 * @param {"soft"|"sharp"} [variant]
 * @param {string} [beforeLabel] Corner pill text
 * @param {string} [afterLabel]
 * @param {string|number} [sweepKey] Changing this value plays the divider
 *   across the frame once — a visitor scrubbing through a filmstrip of
 *   projects would otherwise never discover the image is draggable at all.
 *   Skipped under `prefers-reduced-motion`, where the divider just settles
 *   at center.
 */
export default function BeforeAfter({
  before,
  after,
  label,
  delay = 0,
  aspect = "7/5",
  variant = "soft",
  beforeLabel = "Before",
  afterLabel = "After",
  sweepKey,
}) {
  const [pos, setPos] = useState(50); // 0–100 (% from left)
  const [dragging, setDraggingState] = useState(false);
  const draggingRef = useRef(false);
  const cardRef = useRef(null);
  const setDragging = useCallback((value) => {
    draggingRef.current = value;
    setDraggingState(value);
  }, []);

  // Auto-sweep on sweepKey change: reveal the "before", pause, wipe to
  // "after", settle center. Interrupted cleanly if the visitor starts
  // dragging mid-sweep, or if sweepKey changes again before it finishes.
  useEffect(() => {
    if (sweepKey === undefined) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPos(50);
      return;
    }

    const keyframes = [
      { t: 0, pos: 50 },
      { t: 250, pos: 12 },
      { t: 950, pos: 12 },
      { t: 1700, pos: 88 },
      { t: 2200, pos: 88 },
      { t: 2700, pos: 50 },
    ];
    const start = performance.now();
    let raf;

    const ease = (x) => 1 - Math.pow(1 - x, 3); // cubic ease-out per leg

    const tick = (now) => {
      if (draggingRef.current) return; // a real drag always wins
      const elapsed = now - start;
      let i = 0;
      while (i < keyframes.length - 2 && elapsed > keyframes[i + 1].t) i++;
      const a = keyframes[i];
      const b = keyframes[i + 1];
      const span = b.t - a.t;
      const local = span > 0 ? Math.min(1, Math.max(0, (elapsed - a.t) / span)) : 1;
      setPos(a.pos + (b.pos - a.pos) * ease(local));
      if (elapsed < keyframes[keyframes.length - 1].t) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sweepKey]);

  const soft = variant === "soft";
  const frameRadius = soft ? "rounded-2xl" : "";
  const pillRadius = soft ? "rounded-full" : "";

  /* Clamp + set position from a clientX coordinate */
  const updatePos = useCallback((clientX) => {
    if (!cardRef.current) return;
    const { left, width } = cardRef.current.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((clientX - left) / width) * 100));
    setPos(pct);
  }, []);

  /* Mouse */
  const handleMouseDown = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(true);
      updatePos(e.clientX);

      const onMove = (ev) => updatePos(ev.clientX);
      const onUp = () => {
        setDragging(false);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [updatePos, setDragging],
  );

  /* Touch */
  const handleTouchStart = useCallback(
    (e) => {
      setDragging(true);
      updatePos(e.touches[0].clientX);

      const onMove = (ev) => {
        ev.preventDefault();
        updatePos(ev.touches[0].clientX);
      };
      const onEnd = () => {
        setDragging(false);
        window.removeEventListener("touchmove", onMove);
        window.removeEventListener("touchend", onEnd);
      };
      window.addEventListener("touchmove", onMove, { passive: false });
      window.addEventListener("touchend", onEnd);
    },
    [updatePos, setDragging],
  );

  /* Also allow clicking anywhere on the card to jump the slider */
  const handleCardClick = useCallback(
    (e) => {
      if (e.target.closest("[data-handle]")) return; // handled by handle itself
      updatePos(e.clientX);
    },
    [updatePos],
  );

  return (
    <Reveal direction="up" delay={delay}>
      <div
        ref={cardRef}
        className={`relative overflow-hidden bg-card select-none ${frameRadius}`}
        style={{ aspectRatio: aspect, cursor: "ew-resize" }}
        onClick={handleCardClick}
      >
        {/* ── After image — full background ─────────────────── */}
        <Image
          src={after}
          alt={label ? `${label} — after` : "After"}
          fill
          className="object-cover"
          draggable={false}
        />

        {/* ── Before image — clipped to left `pos`% ─────────── */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          <Image
            src={before}
            alt={label ? `${label} — before` : "Before"}
            fill
            className="object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* ── Divider line ───────────────────────────────────── */}
        <div
          className="absolute inset-y-0 pointer-events-none z-10"
          style={{
            left: `${pos}%`,
            width: 2,
            transform: "translateX(-50%)",
            background: dragging
              ? "rgba(255,255,255,1)"
              : "rgba(255,255,255,0.75)",
            transition: dragging ? "none" : "background 0.2s",
          }}
        />

        {/* ── Drag handle ────────────────────────────────────── */}
        <div
          data-handle="true"
          className="absolute top-1/2 z-20 flex items-center justify-center"
          style={{
            left: `${pos}%`,
            transform: "translate(-50%, -50%)",
            width: dragging ? 36 : 32,
            height: dragging ? 36 : 32,
            borderRadius: "50%",
            background: "#ffffff",
            boxShadow: dragging
              ? "0 4px 24px rgba(0,0,0,0.7), 0 0 0 2px rgba(212,175,55,0.6)"
              : "0 2px 14px rgba(0,0,0,0.55)",
            transition: dragging
              ? "none"
              : "width 0.15s, height 0.15s, box-shadow 0.15s",
            cursor: "ew-resize",
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <HandleIcon />
        </div>

        {/* ── Keyboard access ────────────────────────────────
            The drag handle is a div and always was — reachable by pointer
            only. This range makes the comparison operable with arrow keys.

            `pointer-events-none` is load-bearing, not decoration: the input
            spans the whole card, so without it every click and drag would land
            here instead of on the handle below, and the custom pointer
            handling — the grow-and-glow drag state, the brightening divider,
            the click-anywhere-to-jump — would all silently stop firing. Keyboard
            focus is unaffected by pointer-events, so Tab and the arrow keys
            still reach it. */}
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(pos)}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label={
            label ? `${label}: reveal before or after` : "Reveal before or after"
          }
          className="peer pointer-events-none absolute inset-0 z-30 h-full w-full opacity-0"
        />
        {/* Focus ring — the input itself is invisible, so focus needs somewhere
            to show. Sibling-of-peer, so it must follow the input in the DOM. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-40 opacity-0 ring-2 ring-gold ring-inset transition-opacity peer-focus-visible:opacity-100"
        />

        {/* ── BEFORE / AFTER pill labels ─────────────────────── */}
        <span
          className={`absolute top-3 left-3 z-10 text-white/85 text-[9px] font-manrope font-bold tracking-[0.28em] uppercase bg-black/50 backdrop-blur-sm px-2.5 py-1 pointer-events-none ${pillRadius}`}
        >
          {beforeLabel}
        </span>
        <span
          className={`absolute top-3 right-3 z-10 text-white/85 text-[9px] font-manrope font-bold tracking-[0.28em] uppercase bg-black/50 backdrop-blur-sm px-2.5 py-1 pointer-events-none ${pillRadius}`}
        >
          {afterLabel}
        </span>

        {/* ── Project label ──────────────────────────────────── */}
        {label && (
          <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-linear-to-t from-black/80 to-transparent pointer-events-none">
            <p className="text-white text-[11px] font-manrope font-semibold tracking-[0.12em] uppercase text-center">
              {label}
            </p>
          </div>
        )}
      </div>
    </Reveal>
  );
}

/* Handle SVG — bidirectional arrow icon inside the white circle */
function HandleIcon() {
  return (
    <svg
      width="16"
      height="12"
      viewBox="0 0 16 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M5 2L2 6L5 10"
        stroke="#111"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 2L14 6L11 10"
        stroke="#111"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
