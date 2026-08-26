// app/dashboard/profile/page.jsx
"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { BadgeCheck } from "lucide-react";

import { useProfile } from "@/hooks/use-profile";
import { useResendVerification } from "@/hooks/use-auth";
import { showToast } from "@/components/shared/toast";
import DashboardLayout from "@/components/shared/dashboard/layout";
import ProfileTabs from "@/components/shared/dashboard/profile/tabs";
import PersonalInformation from "@/components/shared/dashboard/profile/personal-info";
import AddressBook from "@/components/shared/dashboard/profile/address";
import Security from "@/components/shared/dashboard/profile/security";
import NotificationPreferences from "@/components/shared/dashboard/profile/notification";

/**
 * Verification status, promoted out of the deleted avatar card.
 *
 * It was a coloured pill that said "Unverified" and did nothing about it —
 * telling someone their account is limited without giving them the one control
 * that fixes it. Unverified now carries the resend action.
 */
function VerificationChip({ profile, isLoading }) {
  const resend = useResendVerification();

  if (isLoading || !profile) return null;

  if (profile.emailVerified) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold"
        style={{ background: "rgba(34,197,94,0.10)", color: "#4ade80" }}
      >
        <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2} />
        Email verified
      </span>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span
        className="inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold"
        style={{ background: "rgba(245,158,11,0.12)", color: "#fbbf24" }}
      >
        Email not verified
      </span>
      <button
        onClick={() =>
          // mutationFn takes the address itself, not an object — see
          // hooks/use-auth.js:213.
          resend.mutate(profile.email, {
            onSuccess: () => showToast.success("Verification email sent."),
            onError: (err) => showToast.error(err.message),
          })
        }
        disabled={resend.isPending || !profile.email}
        className="text-[12px] font-semibold text-[#D4AF37] underline-offset-4 transition-opacity hover:underline disabled:opacity-50"
      >
        {resend.isPending ? "Sending…" : "Resend link"}
      </button>
    </span>
  );
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("personal");
  const { data: profile, isLoading } = useProfile();

  return (
    <DashboardLayout>
      <div className="w-full space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <h1 className="text-[28px] font-semibold leading-tight text-white md:text-[32px]">
              Profile &amp; Settings
            </h1>
            <VerificationChip profile={profile} isLoading={isLoading} />
          </div>
          <p className="mt-1.5 text-[15px] text-white/45">
            Manage your account details, delivery addresses, and preferences.
          </p>
        </motion.div>

        <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Full width now that the second rail is gone. Forms cap their own
            measure internally — the column no longer has to do it for them. */}
        <div className="min-h-150">
          {activeTab === "personal" && (
            <PersonalInformation profile={profile} isLoading={isLoading} />
          )}
          {activeTab === "addresses" && <AddressBook />}
          {activeTab === "security" && <Security />}
          {activeTab === "notifications" && <NotificationPreferences />}
        </div>
      </div>
    </DashboardLayout>
  );
}
