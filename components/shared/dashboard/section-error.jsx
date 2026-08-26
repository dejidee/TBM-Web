// components/shared/dashboard/section-error.jsx
"use client";

import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw } from "lucide-react";

/**
 * One inline error state for the whole dashboard.
 *
 * "Could not load your projects. Please refresh." was rendering as a bare
 * sentence floating in black — no container, no icon, no button. Telling a user
 * to refresh while giving them nothing to click is asking them to do the app's
 * job, and an unstyled sentence reads as a page that broke rather than a state
 * that was designed.
 *
 * Distinct from components/common/error-state.jsx, which is the full-page
 * boundary UI ("Back to home", 70vh tall). This is for one failed section on a
 * page whose other sections are fine — the sidebar, the header and the rest of
 * the content are still usable, so it must not take over the screen.
 *
 * `onRetry` should be a query's `refetch`. Falls back to a reload only when the
 * caller has nothing better, because a full reload throws away every other
 * query on the page to fix one.
 */
export default function SectionError({
  title = "We couldn't load this",
  body = "Something went wrong on our side. It has been logged.",
  onRetry,
  compact = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex flex-col items-center rounded-3xl border px-6 text-center ${
        compact ? "py-10" : "py-14"
      }`}
      style={{ background: "rgba(239,68,68,0.03)", borderColor: "rgba(239,68,68,0.16)" }}
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{ background: "rgba(239,68,68,0.10)" }}
      >
        <AlertTriangle className="h-5 w-5 text-red-400" strokeWidth={1.75} />
      </div>

      <h2 className="mt-5 text-[17px] font-semibold text-white">{title}</h2>
      <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-white/45">{body}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 px-5 text-[14px] font-medium text-white/80 transition-colors hover:border-white/35 hover:text-white"
        >
          <RotateCcw className="h-4 w-4" strokeWidth={2} />
          Try again
        </button>
      )}
    </motion.div>
  );
}
