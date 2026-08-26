// components/shared/dashboard/app-bar.jsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Heart,
  LogOut,
  Menu,
  ShoppingCart,
  Store,
  User,
} from "lucide-react";

import { useLogout } from "@/hooks/use-auth";
import { useSession } from "@/hooks/use-session";
import { useCartCount } from "@/hooks/use-cart";
import { useSavedItems } from "@/hooks/use-saved";
import { useDashboardShell } from "./shell-context";

/**
 * The signed-in app bar.
 *
 * Deliberately *not* `components/common/navbar`. That bar exists to convert a
 * visitor — Home, About Us, Services, Contact Us are acquisition links, and
 * showing them to someone who already has an account makes the product read as
 * a marketing site with a dashboard bolted on. Here the same 64px is spent on
 * where-am-I (breadcrumb) and the three things a signed-in user reaches for
 * (saved, cart, account), plus one way back to shopping.
 *
 * Height is exactly `h-16`. The sidebar's `top-16` and `h-[calc(100vh-4rem)]`
 * are measured against it, so this is load-bearing — the marketing navbar's
 * `h-16 sm:h-18` silently broke that alignment above the `sm` breakpoint.
 */

const SECTIONS = [
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/ai-designs", label: "My Ziora Designs" },
  { href: "/dashboard/projects", label: "Projects" },
  { href: "/dashboard/saved", label: "Saved Items" },
  { href: "/dashboard/profile", label: "Profile" },
];

/** Longest-prefix match, so /dashboard/projects/<id>/timeline still resolves. */
function useCrumb(pathname) {
  const match = SECTIONS.filter(
    (s) => pathname === s.href || pathname.startsWith(`${s.href}/`),
  ).sort((a, b) => b.href.length - a.href.length)[0];
  return match?.label ?? "Overview";
}

function Badge({ count }) {
  if (!count) return null;
  return (
    <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D4AF37] px-1 text-[9px] font-bold text-black">
      {count > 99 ? "99+" : count}
    </span>
  );
}

/** 44×44 hit area around a 20px icon — WCAG 2.5.8's 24px floor is a floor,
 *  not a target, and an icon this small gets mis-tapped at 28px. */
function IconLink({ href, label, children }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="relative flex h-11 w-11 items-center justify-center rounded-xl text-white/55 transition-colors hover:bg-white/06 hover:text-white"
    >
      {children}
    </Link>
  );
}

export default function AppBar() {
  const pathname = usePathname();
  const crumb = useCrumb(pathname);
  const [menuOpen, setMenuOpen] = useState(false);

  const { setSidebarOpen } = useDashboardShell();
  const { user } = useSession();
  const logout = useLogout();
  const cartCount = useCartCount();
  const { data: savedItems = [] } = useSavedItems();

  const displayName =
    user?.firstName ||
    user?.fullName ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    "Account";
  const initial =
    user?.firstName?.charAt(0)?.toUpperCase() ||
    user?.fullName?.charAt(0)?.toUpperCase() ||
    "U";

  return (
    <header
      className="fixed inset-x-0 top-0 z-60 h-16 border-b border-white/07"
      style={{ background: "rgba(9,8,6,0.78)", backdropFilter: "blur(20px)" }}
    >
      {/* Full width, matching the shell below it. Centred on `max-w-7xl` the
          logo floated 320px inboard of the viewport edge at 1920 while the nav
          rail started at the edge, so the bar and the rail disagreed about
          where the app began. */}
      <div className="flex h-full w-full items-center gap-2 px-3 sm:px-5 lg:px-6">
        {/* Mobile: open the sidebar. Lives in the bar rather than floating over
            the page, so it reads as navigation instead of a stray control. */}
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation"
          className="flex h-11 w-11 items-center justify-center rounded-xl text-white/55 transition-colors hover:bg-white/06 hover:text-white md:hidden"
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
        </button>

        <Link href="/" className="shrink-0 transition-opacity hover:opacity-75">
          <Image
            src="/tbm-logo-v2.png"
            alt="TBM — back to site"
            width={120}
            height={60}
            className="h-8 w-auto"
            priority
          />
        </Link>

        {/* Breadcrumb — the bar's whole job on the left. Hidden on the smallest
            screens, where the page's own <h1> is already the answer. */}
        <nav
          aria-label="Breadcrumb"
          className="hidden min-w-0 items-center gap-1.5 sm:flex"
        >
          <span className="mx-2 h-5 w-px bg-white/10" aria-hidden />
          <Link
            href="/dashboard"
            className="text-[13px] font-medium text-white/40 transition-colors hover:text-white/70"
          >
            Dashboard
          </Link>
          {crumb !== "Overview" && (
            <>
              <ChevronRight
                className="h-3.5 w-3.5 shrink-0 text-white/25"
                strokeWidth={2}
              />
              <span className="truncate text-[13px] font-semibold text-white">
                {crumb}
              </span>
            </>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
          {/* The one marketing destination a signed-in user actually wants. */}
          <Link
            href="/bogat/materials"
            className="mr-1 hidden items-center gap-2 rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-white/55 transition-colors hover:bg-white/06 hover:text-white lg:inline-flex"
          >
            <Store className="h-4 w-4" strokeWidth={1.75} />
            Marketplace
          </Link>

          <IconLink href="/dashboard/saved" label="Saved items">
            <Heart className="h-5 w-5" strokeWidth={1.75} />
            <Badge count={savedItems.length} />
          </IconLink>

          <IconLink href="/cart" label="Cart">
            <ShoppingCart className="h-5 w-5" strokeWidth={1.75} />
            <Badge count={cartCount} />
          </IconLink>

          <div className="relative ml-1">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex h-11 items-center gap-2 rounded-xl pl-1 pr-2 transition-colors hover:bg-white/06"
            >
              <span
                className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full text-[13px] font-bold text-[#D4AF37]"
                style={{ background: "rgba(212,175,55,0.14)" }}
              >
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={displayName}
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initial
                )}
              </span>
              <ChevronDown
                className={`hidden h-3.5 w-3.5 text-white/40 transition-transform duration-200 sm:block ${
                  menuOpen ? "rotate-180" : ""
                }`}
                strokeWidth={2}
              />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                  />
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.14 }}
                    className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
                    style={{ background: "#111010" }}
                  >
                    <div className="border-b border-white/07 px-4 py-3">
                      <p className="truncate text-[14px] font-semibold text-white">
                        {displayName}
                      </p>
                      {user?.email && (
                        <p className="truncate text-[12px] text-white/35">
                          {user.email}
                        </p>
                      )}
                    </div>
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex min-h-11 items-center gap-3 px-4 text-[14px] font-medium text-white/70 transition-colors hover:bg-white/05 hover:text-white"
                    >
                      <User className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                      Profile
                    </Link>
                    <Link
                      href="/"
                      onClick={() => setMenuOpen(false)}
                      className="flex min-h-11 items-center gap-3 px-4 text-[14px] font-medium text-white/70 transition-colors hover:bg-white/05 hover:text-white"
                    >
                      <Store className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                      Back to site
                    </Link>
                    <div className="h-px bg-white/07" />
                    <button
                      onClick={() => {
                        logout.mutate();
                        setMenuOpen(false);
                      }}
                      disabled={logout.isPending}
                      className="flex min-h-11 w-full items-center gap-3 px-4 text-left text-[14px] font-medium text-white/70 transition-colors hover:bg-white/05 hover:text-white disabled:opacity-50"
                    >
                      <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                      {logout.isPending ? "Logging out…" : "Log out"}
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
