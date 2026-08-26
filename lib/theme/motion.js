// Motion vocabulary for the storefront's framer-motion sections.
//
// The Ziora page had accumulated seven easing curves and durations ranging from
// 0.3s to 0.9s, chosen per component. Nothing was wrong with any single value,
// but together they read as several designers' work: two sections that reveal
// side by side settled at visibly different speeds.
//
// One curve, two speeds, one stagger. That is enough to build a page, and a
// small vocabulary is what makes motion feel authored rather than applied.
//
// EASE is a standard "ease-out-quint"-ish curve: it leaves fast and arrives
// slowly, which is the right shape for something entering the viewport — the
// element appears to be settling into place rather than sliding to a stop.
// Reserve it for entrances and state changes; it is wrong for anything looping.

export const EASE = [0.22, 1, 0.36, 1];

/** Hover, tap, toggles — anything answering a direct input. */
export const DUR_MICRO = 0.5;

/** Scroll entrances and section-level changes. */
export const DUR_MACRO = 0.7;

/** Delay between siblings in a revealing group. */
export const STAGGER = 0.08;

/**
 * Scroll-entrance transition for the nth item in a group.
 *
 * `viewport={{ once: true }}` is deliberate and belongs at the call site: a
 * section that re-animates every time it scrolls back into view is a section
 * the user has to wait for twice.
 *
 * @param {number} i  Index within the group; 0 for a lone element.
 */
export function enter(i = 0) {
  return { duration: DUR_MACRO, delay: i * STAGGER, ease: EASE };
}

/** Standard fade-and-rise entrance. Pair with `whileInView={{ opacity: 1, y: 0 }}`. */
export const RISE = { opacity: 0, y: 24 };
