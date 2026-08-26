// components/shared/dashboard/section-empty.jsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

/**
 * One empty state for the whole dashboard.
 *
 * Orders, Saved Items and Projects each rolled their own, and they disagreed on
 * everything that matters: Orders rendered "No orders found" as 30%-white text
 * in a bordered box with no way forward, Saved had an icon and a heading, and
 * Projects had a heading, body copy and a CTA. A user moving between them met a
 * different idea of "empty" on every page.
 *
 * The rule this encodes: an empty state names what will live here, says how to
 * get one, and links there. A page that only reports absence is a dead end, and
 * on a commerce product a dead end is a lost sale.
 */
export default function SectionEmpty({
  icon: Icon,
  title,
  body,
  action,
  secondary,
  compact = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden rounded-3xl border border-white/08"
      style={{ background: "#0d0b08" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%)" }}
      />

      <div
        className={`relative flex flex-col items-center px-6 text-center ${
          compact ? "py-12" : "py-16"
        }`}
      >
        {Icon && (
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: "rgba(212,175,55,0.10)" }}
          >
            <Icon className="h-6 w-6 text-[#D4AF37]" strokeWidth={1.5} />
          </div>
        )}

        <h2 className="mt-6 text-[20px] font-semibold text-white sm:text-[23px]">{title}</h2>
        {body && (
          <p className="mt-2.5 max-w-md text-[15px] leading-relaxed text-white/45">{body}</p>
        )}

        {(action || secondary) && (
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            {action && (
              <Link
                href={action.href}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl px-6 text-[14px] font-semibold text-black transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
              >
                {action.icon ? <action.icon className="h-4 w-4" strokeWidth={2} /> : null}
                {action.label}
              </Link>
            )}
            {/* A secondary action is a link when it goes somewhere and a button
                when it changes state in place — "Clear filters" pointed at the
                page's own href would be a no-op, since the filters live in
                component state, not the URL. */}
            {secondary &&
              (secondary.onClick ? (
                <button
                  onClick={secondary.onClick}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-white/12 px-5 text-[14px] font-medium text-white/70 transition-colors hover:border-white/30 hover:text-white"
                >
                  {secondary.label}
                </button>
              ) : (
                <Link
                  href={secondary.href}
                  className="group inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-white/12 px-5 text-[14px] font-medium text-white/70 transition-colors hover:border-white/30 hover:text-white"
                >
                  {secondary.label}
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    strokeWidth={2}
                  />
                </Link>
              ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
