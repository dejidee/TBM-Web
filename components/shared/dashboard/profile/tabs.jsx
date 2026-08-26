// components/shared/dashboard/profile/tabs.jsx
"use client";

import { motion } from "framer-motion";
import { Bell, MapPin, Shield, User } from "lucide-react";

/**
 * Horizontal tabs, not a second sidebar.
 *
 * This was a vertical nav rail rendered directly beside the dashboard's own
 * vertical nav rail. Two stacked rails give the user no way to tell which one
 * moves them around the app and which one moves them around the page, and it
 * cost 240px of the content column on every profile screen.
 *
 * The avatar card that sat above it is gone too: the user's name and picture
 * are already in the app bar and in the sidebar, and a third copy on the page
 * about the user is the least useful of the three. The one thing it carried
 * that lives nowhere else — whether the email is verified — moved up into the
 * page header, where it is actionable.
 */
const TABS = [
  { id: "personal", label: "Personal Details", icon: User },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export default function ProfileTabs({ activeTab, setActiveTab }) {
  return (
    <div
      role="tablist"
      aria-label="Profile sections"
      className="-mx-1 flex gap-1 overflow-x-auto border-b border-white/08 px-1"
      style={{ scrollbarWidth: "none" }}
    >
      {TABS.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={isActive}
            onClick={() => setActiveTab(id)}
            className={`relative inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap px-4 text-[14px] font-medium transition-colors ${
              isActive ? "text-[#D4AF37]" : "text-white/45 hover:text-white/80"
            }`}
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} />
            {label}
            {isActive && (
              <motion.span
                layoutId="profile-tab-underline"
                className="absolute inset-x-2 -bottom-px h-0.5 rounded-full"
                style={{ background: "linear-gradient(90deg, #D4AF37, #b8962e)" }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
