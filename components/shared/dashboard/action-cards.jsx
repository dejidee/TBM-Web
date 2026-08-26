// components/dashboard/ActionCards.jsx
"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Calendar, ShoppingBag, Wand2 } from "lucide-react";
import Link from "next/link";

/**
 * Quick actions — three equal, compact rows.
 *
 * These were three large equal cards, then briefly a Ziora hero plus two
 * secondaries. Both were wrong once ContinueBand took the top of the page: the
 * hero slot is spoken for, and a second large "Design with Ziora" card directly
 * under a band whose last link is "Create another design" is the same offer
 * twice. What is left is a launcher, so it is sized like one — one line each,
 * scannable, out of the way of the two sections that actually convert.
 */
const ACTIONS = [
  {
    Icon: Wand2,
    title: "New design",
    description: "Render a room with Ziora",
    href: "/ziora/studio",
  },
  {
    Icon: ShoppingBag,
    title: "Shop materials",
    description: "Flooring, tiles, fixtures",
    href: "/bogat/materials",
  },
  {
    Icon: Calendar,
    title: "Book a consultation",
    description: "Talk to a pro designer",
    href: "/consultation",
  },
];

export default function ActionCards() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {ACTIONS.map(({ Icon, title, description, href }, i) => (
        <motion.div
          key={title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.06 }}
        >
          <Link
            href={href}
            className="group flex min-h-11 items-center gap-3.5 rounded-2xl border border-white/08 px-4 py-3.5 transition-colors hover:border-[#D4AF37]/30"
            style={{ background: "#0d0b08" }}
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: "rgba(212,175,55,0.10)" }}
            >
              <Icon className="h-4.5 w-4.5 text-[#D4AF37]" strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-semibold text-white">{title}</span>
              <span className="block truncate text-[12.5px] text-white/35">{description}</span>
            </span>
            <ArrowUpRight
              className="h-4 w-4 shrink-0 text-white/20 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#D4AF37]"
              strokeWidth={2}
            />
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
