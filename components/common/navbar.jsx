"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useIsAuthenticated, useLogout } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { useAdminUser, useAdminLogout } from "@/hooks/use-admin-auth";
import { useVendorUser, useVendorLogout } from "@/hooks/use-vendor-auth";
import { useCartCount } from "@/hooks/use-cart";
import { useSavedItems } from "@/hooks/use-saved";
import {
  Heart,
  ChevronDown,
  X,
  Menu,
  LogOut,
  User,
  LayoutDashboard,
  ShoppingCart,
} from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const {
    isAuthenticated: isUserAuthed,
    user: regularUser,
    isLoading: userLoading,
  } = useIsAuthenticated();
  const { data: profile } = useProfile();
  const { data: adminUser, isLoading: adminLoading } = useAdminUser();
  const { data: vendorUser, isLoading: vendorLoading } = useVendorUser();

  const userLogout = useLogout();
  const adminLogout = useAdminLogout();
  const vendorLogout = useVendorLogout();

  const isAuthenticated = !!(adminUser || vendorUser || isUserAuthed);
  const isLoading = adminLoading || vendorLoading || userLoading;

  const activeUser = adminUser
    ? {
        ...adminUser,
        fullName:
          adminUser.name ||
          `${adminUser.firstName || ""} ${adminUser.lastName || ""}`.trim(),
      }
    : vendorUser
      ? {
          ...vendorUser,
          fullName:
            vendorUser.name ||
            `${vendorUser.firstName || ""} ${vendorUser.lastName || ""}`.trim(),
        }
      : regularUser;

  const dashboardHref = adminUser
    ? "/admin/dashboard"
    : vendorUser
      ? "/vendor/dashboard"
      : "/dashboard";
  const dashboardLabel = adminUser
    ? "Admin Dashboard"
    : vendorUser
      ? "Vendor Dashboard"
      : "Pro Dashboard";
  const profileHref = adminUser
    ? "/admin/dashboard/settings"
    : vendorUser
      ? "/vendor/dashboard/account-settings"
      : "/dashboard/profile";

  const cartCount = useCartCount();
  const pathname = usePathname();

  const { data: savedItems = [] } = useSavedItems();
  const savedCount = isAuthenticated ? savedItems.length : 0;

  const displayName =
    activeUser?.fullName ||
    `${activeUser?.firstName || ""} ${activeUser?.lastName || ""}`.trim() ||
    "User";
  const avatarInitial =
    activeUser?.firstName?.charAt(0)?.toUpperCase() ||
    activeUser?.fullName?.charAt(0)?.toUpperCase() ||
    "U";

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Ziora", href: "/ziora" },
    { name: "Projects", href: "/project" },
    { name: "Bogat", href: "/bogat" },
    { name: "Marketplace", href: "/bogat/materials", featured: true },
    { name: "Contact Us", href: "/contact" },
  ];

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleLogout = () => {
    if (adminUser) adminLogout.mutate();
    else if (vendorUser) vendorLogout.mutate();
    else userLogout.mutate();
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  };
  const isLogoutPending =
    adminLogout.isPending || vendorLogout.isPending || userLogout.isPending;

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-60"
        style={{
          background:
            "radial-gradient(ellipse 80% 160% at 50% 0%, #2a2a2a 0%, #141414 45%, #0a0a0a 100%)",
        }}
      >
        {/* Left + right white edge highlights */}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(to right, rgba(255,255,255,0.07) 0%, transparent 8%, transparent 92%, rgba(255,255,255,0.07) 100%)",
          }}
        />

        <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo */}
            <Link
              href="/"
              className="shrink-0 transition-opacity hover:opacity-80"
            >
              <Image
                src="/tbm-logo-v2.png"
                alt="TBM"
                width={120}
                height={60}
                className="h-9 sm:h-11 w-auto"
                priority
              />
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden xl:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                if (link.featured) {
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`relative px-4 py-1.5 text-[13px] font-manrope font-semibold tracking-wide transition-all duration-200 rounded-full ${
                        active
                          ? "bg-[#D4AF37] text-black"
                          : "bg-[#D4AF37]/12 text-[#D4AF37] hover:bg-[#D4AF37]/22 border border-[#D4AF37]/30 hover:border-[#D4AF37]/60"
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                }
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`relative px-4 py-2 text-[14px] font-manrope font-medium tracking-wide transition-colors duration-200 group ${
                      active ? "text-white" : "text-white/60 hover:text-white"
                    }`}
                  >
                    {link.name}
                    <span
                      className={`absolute bottom-0 left-4 right-4 h-px bg-[#D4AF37] transition-transform duration-300 origin-left ${
                        active
                          ? "scale-x-100"
                          : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </Link>
                );
              })}
            </div>

            {/* Desktop Right Actions */}
            <div className="hidden xl:flex items-center gap-3">
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
                  <div className="w-20 h-4 rounded bg-white/10 animate-pulse" />
                </div>
              ) : isAuthenticated ? (
                <>
                  {/* Saved */}
                  <Link href="/dashboard/saved">
                    <button className="relative flex items-center justify-center w-11 h-11 text-white/60 hover:text-white transition-colors">
                      <Heart
                        className={`w-5 h-5 ${isActive("/dashboard/saved") ? "fill-[#D4AF37] text-[#D4AF37]" : ""}`}
                      />
                      <SavedBadge count={savedCount} />
                    </button>
                  </Link>
                  {/* Cart */}
                  <Link href="/cart">
                    <button className="relative flex items-center justify-center w-11 h-11 text-white/60 hover:text-white transition-colors">
                      <ShoppingCart
                        className={`w-5 h-5 ${isActive("/cart") ? "text-[#D4AF37]" : ""}`}
                      />
                      <CartBadge count={cartCount} />
                    </button>
                  </Link>
                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-2 py-1.5 px-3 rounded-full border border-white/20 hover:border-white/40 transition-colors"
                    >
                      <Avatar
                        initial={avatarInitial}
                        avatar={activeUser?.avatar}
                        name={displayName}
                        size={7}
                      />
                      <span className="text-sm font-medium text-white/80">
                        {profile?.firstName || displayName}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-white/50 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    <AnimatePresence>
                      {isProfileOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsProfileOpen(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.97 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-2 w-60 bg-[#111111] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                          >
                            <Link
                              href={profileHref}
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-3 px-5 py-4 text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              <User
                                className="w-5 h-5 shrink-0"
                                strokeWidth={1.5}
                              />
                              <span className="text-[15px] font-medium">
                                Profile
                              </span>
                            </Link>
                            <Link
                              href={dashboardHref}
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-3 px-5 py-4 text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              <LayoutDashboard
                                className="w-5 h-5 shrink-0"
                                strokeWidth={1.5}
                              />
                              <span className="text-[15px] font-medium">
                                {dashboardLabel}
                              </span>
                            </Link>
                            <hr className="border-white/10" />
                            <button
                              onClick={handleLogout}
                              disabled={isLogoutPending}
                              className="flex items-center gap-3 w-full px-5 py-4 text-white/70 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
                            >
                              <LogOut
                                className="w-5 h-5 shrink-0"
                                strokeWidth={1.5}
                              />
                              <span className="text-[15px] font-medium">
                                {isLogoutPending ? "Logging out…" : "Logout"}
                              </span>
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  {/* Cart */}
                  <Link href="/cart">
                    <button className="relative flex items-center justify-center w-11 h-11 text-white/70 hover:text-white transition-colors">
                      <ShoppingCart
                        className={`w-5 h-5 ${isActive("/cart") ? "text-[#D4AF37]" : ""}`}
                      />
                      <CartBadge count={cartCount} />
                    </button>
                  </Link>

                  {/* Login — solid white fill */}
                  <Link
                    href="/sign-in"
                    className="inline-flex items-center min-h-11 px-5 py-2 rounded-lg bg-white text-black text-[13px] font-manrope font-semibold tracking-wide hover:bg-white/90 transition-colors duration-200"
                  >
                    Login
                  </Link>

                  {/* Book Consultation — solid gold fill */}
                  <Link
                    href="/consultation"
                    className="inline-flex items-center min-h-11 px-5 py-2 rounded-lg bg-[#D4AF37] text-black text-[13px] font-manrope font-semibold tracking-wide hover:bg-gold-dim transition-colors duration-200"
                  >
                    Book Consultation
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Right */}
            <div className="xl:hidden flex items-center gap-1">
              {!isLoading && isAuthenticated && (
                <Link href="/dashboard/saved">
                  <button className="relative flex items-center justify-center w-11 h-11 text-white/60">
                    <Heart
                      className={`w-5 h-5 ${isActive("/dashboard/saved") ? "fill-[#D4AF37] text-[#D4AF37]" : ""}`}
                    />
                    <SavedBadge count={savedCount} />
                  </button>
                </Link>
              )}
              <Link href="/cart">
                <button className="relative flex items-center justify-center w-11 h-11 text-white/60 hover:text-white transition-colors">
                  <ShoppingCart
                    className={`w-5 h-5 ${isActive("/cart") ? "text-[#D4AF37]" : ""}`}
                  />
                  <CartBadge count={cartCount} />
                </button>
              </Link>
              <button
                onClick={() => setIsMenuOpen(true)}
                className="flex items-center justify-center w-11 h-11 text-white/60 hover:text-white transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-55 bg-black/70 xl:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 h-dvh z-60 w-[78vw] max-w-[320px] bg-[#0a0a0a] border-l border-white/10 shadow-2xl xl:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-5 h-16 border-b border-white/10 shrink-0">
                <span className="text-xs font-semibold text-white/40 tracking-[0.2em] uppercase">
                  Menu
                </span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center w-11 h-11 text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {!isLoading && isAuthenticated && activeUser && (
                  <div className="px-5 py-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <Avatar
                        initial={avatarInitial}
                        avatar={activeUser?.avatar}
                        name={displayName}
                        size={10}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {displayName}
                        </p>
                        <p className="text-xs text-white/40 truncate">
                          {activeUser.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="py-4 px-3">
                  <p className="px-2 pb-2 text-[16px] font-semibold text-white/30 uppercase tracking-[0.2em]">
                    Navigate
                  </p>
                  {navLinks.map((link, i) => {
                    const active = isActive(link.href);
                    return (
                      <motion.div
                        key={link.name}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 + 0.08 }}
                      >
                        <Link
                          href={link.href}
                          className={`flex items-center justify-between px-3 py-3 text-[15px] font-medium rounded-lg transition-colors ${
                            link.featured
                              ? active
                                ? "text-black bg-[#D4AF37]"
                                : "text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/20"
                              : active
                                ? "text-[#D4AF37] bg-[#D4AF37]/10"
                                : "text-white/60 hover:text-white hover:bg-white/5"
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {link.name}
                          {active && (
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${link.featured && active ? "bg-black" : "bg-[#D4AF37]"}`}
                            />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {!isLoading && isAuthenticated && (
                  <div className="py-3 px-3 border-t border-white/10">
                    <p className="px-2 pb-2 text-[16px] font-semibold text-white/30 uppercase tracking-[0.2em]">
                      Account
                    </p>
                    <MobileLink
                      href="/dashboard/saved"
                      icon={
                        <span className="relative">
                          <Heart className="w-4 h-4" />
                          {savedCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] bg-[#D4AF37] text-black text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                              {savedCount > 99 ? "99+" : savedCount}
                            </span>
                          )}
                        </span>
                      }
                      label="Saved Items"
                      active={isActive("/dashboard/saved")}
                      onClick={() => setIsMenuOpen(false)}
                    />
                    <MobileLink
                      href={profileHref}
                      icon={<User className="w-4 h-4" />}
                      label="Profile"
                      active={isActive(profileHref)}
                      onClick={() => setIsMenuOpen(false)}
                    />
                    <MobileLink
                      href={dashboardHref}
                      icon={<LayoutDashboard className="w-4 h-4" />}
                      label={dashboardLabel}
                      active={isActive(dashboardHref) && !isActive(profileHref)}
                      onClick={() => setIsMenuOpen(false)}
                    />
                  </div>
                )}
              </div>

              <div className="px-5 py-5 border-t border-white/10 space-y-2.5 shrink-0">
                {isLoading ? (
                  <div className="w-full h-12 rounded bg-white/10 animate-pulse" />
                ) : isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    disabled={isLogoutPending}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 text-[15px] font-medium text-white bg-red-500 rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    <LogOut className="w-4 h-4" />
                    {isLogoutPending ? "Logging out…" : "Logout"}
                  </button>
                ) : (
                  <>
                    <Link
                      href="/sign-in"
                      className="flex items-center justify-center w-full px-4 py-3 text-[14px] font-semibold text-black bg-white rounded-lg hover:bg-white/90 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/consultation"
                      className="flex items-center justify-center w-full px-4 py-3 text-[14px] font-semibold text-black bg-[#D4AF37] rounded-lg hover:bg-gold-dim transition-colors tracking-wide"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Book Consultation
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Sub-components ─────────────────────────────────────────────── */

function SavedBadge({ count }) {
  if (!count) return null;
  return (
    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-[#D4AF37] text-black text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function CartBadge({ count }) {
  if (!count) return null;
  return (
    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-[#D4AF37] text-black text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function Avatar({ initial, avatar, name, size = 8 }) {
  const sizeClass = `w-${size} h-${size}`;
  return (
    <div
      className={`${sizeClass} rounded-full bg-[#D4AF37]/20 overflow-hidden flex items-center justify-center shrink-0`}
    >
      {avatar ? (
        <Image
          src={avatar}
          alt={name}
          width={44}
          height={44}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-sm font-bold text-[#D4AF37]">{initial}</span>
      )}
    </div>
  );
}

function MobileLink({ href, icon, label, active, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center justify-between px-3 py-3 text-[15px] font-medium rounded-lg transition-colors ${
        active
          ? "text-[#D4AF37] bg-[#D4AF37]/10"
          : "text-white/60 hover:text-white hover:bg-white/5"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={active ? "text-[#D4AF37]" : "text-white/40"}>
          {icon}
        </span>
        {label}
      </div>
      {active && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shrink-0" />
      )}
    </Link>
  );
}
