// components/dashboard/Sidebar.jsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  LayoutGrid,
  Package,
  Layers,
  Heart,
  User,
  FolderOpen,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useDashboardUser } from "@/hooks/use-user-dashboard";
import { useSubscriptionState } from "@/hooks/use-subscription";
import PlanCard from "./plan-card";

/** The plan label under the user's name. This used to be the string
 *  "Premium Member", hardcoded — so an account with no subscription at all was
 *  told it was premium, on the same screen where the designs page offered to
 *  sell it a plan. */
const TIER_LABEL = {
  luxury: "Luxury plan",
  premium: "Premium plan",
  economy: "Economy plan",
};

const navItems = [
  { icon: LayoutGrid, label: "Overview", href: "/dashboard" },
  { icon: Package, label: "Orders", href: "/dashboard/orders" },
  { icon: Layers, label: "My Ziora Designs", href: "/dashboard/ai-designs" },
  { icon: FolderOpen, label: "Projects", href: "/dashboard/projects" },
  { icon: Heart, label: "Saved Items", href: "/dashboard/saved" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user } = useDashboardUser();
  const { tier, isLoading: planLoading } = useSubscriptionState();

  const planLabel = planLoading ? null : (TIER_LABEL[tier] ?? "No active plan");

  const displayName =
    user?.fullName ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    "Welcome";
  const avatarInitial =
    user?.firstName?.charAt(0)?.toUpperCase() ||
    user?.fullName?.charAt(0)?.toUpperCase() ||
    "U";

  const sidebarContent = (
    <div
      className="h-full flex flex-col font-manrope"
      style={{ background: "#0d0b08" }}
    >
      {/* Header */}
      <div className="p-5 border-b border-white/08">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
              style={{ background: "rgba(212,175,55,0.12)" }}
            >
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={displayName}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-[#D4AF37]">
                  {avatarInitial}
                </span>
              )}
            </div>
            <div className="min-w-0">
              {user ? (
                <>
                  {/* The name alone. "Welcome back, {name}" was prefixed onto a
                      fixed-width column, so every name past ~6 characters
                      truncated to the greeting — the page header greets now. */}
                  <p className="truncate font-manrope text-[15px] font-semibold text-white">
                    {displayName}
                  </p>
                  {planLabel ? (
                    <p className="mt-0.5 truncate text-[13px] text-white/40">
                      {planLabel}
                    </p>
                  ) : (
                    <div className="mt-1.5 h-3 w-20 animate-pulse rounded bg-white/08" />
                  )}
                </>
              ) : (
                <>
                  <div className="h-4 w-32 bg-white/08 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-white/08 rounded animate-pulse mt-1.5" />
                </>
              )}
            </div>
          </div>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="md:hidden p-1 hover:bg-white/05 rounded-md transition-colors shrink-0"
          >
            <X className="w-5 h-5 text-white/40" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onClose()}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg
                text-[14px] font-medium transition-all
                ${
                  isActive
                    ? "text-[#D4AF37]"
                    : "text-white/50 hover:bg-white/05 hover:text-white"
                }
              `}
              style={
                isActive ? { background: "rgba(212,175,55,0.10)" } : undefined
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Plan + quota. Replaces the fixed "Go Pro?" card, which said the same
          sentence to a free user and a paying one. See plan-card.jsx. */}
      <PlanCard />
    </div>
  );

  return (
    <>
      {/* Tablet + Desktop Sidebar — two elements, two jobs.
          The <aside> is the *column*: it carries the background and the right
          border, and has no height of its own, so the flex row's default
          `align-items: stretch` runs it the full height of the page. Making the
          aside itself sticky (or 100vh tall) left the rest of the column empty
          black on any page taller than the viewport.
          The inner div is the *content*: `top-16` clears the fixed `h-16`
          navbar, and `h-[calc(100vh-4rem)]` fills exactly the space beneath it,
          so the nav follows the viewport while the column stays full height. */}
      <aside
        className="hidden md:block w-56 lg:w-64 shrink-0 border-r border-white/08"
        style={{ background: "#0d0b08" }}
      >
        <div className="sticky top-16 h-[calc(100vh-4rem)]">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="md:hidden fixed top-16 left-0 h-[calc(100vh-4rem)] w-72 border-r border-white/08 z-50 overflow-y-auto"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
