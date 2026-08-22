"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import AdminConsultationBookings from "@/components/shared/admin/consultations/bookings";
import AdminConsultationPricing from "@/components/shared/admin/consultations/pricing";

const TABS = [
  { key: "bookings", label: "Bookings" },
  { key: "pricing", label: "Pricing" },
];

/**
 * Admin side of the consultation feature — `AdminConsultations`.
 *
 * Two tabs, not two routes: the surface is small and the pricing table is
 * five rows. Availability management is deliberately absent — the only
 * availability API is on the legacy `/admin/inspections` surface and does not
 * affect the calendar the public page books from (lib/api/admin.js).
 */
export default function AdminConsultationsPage() {
  const [tab, setTab] = useState("bookings");

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Consultations</h1>
          <p className="mt-1 text-[13px] text-white/40">
            Bookings from the public consultation page, and the fee for each type.{" "}
            <Link href="/consultation" target="_blank" className="inline-flex items-center gap-1 text-white/50 transition-colors hover:text-white">
              View booking page <ExternalLink className="h-3 w-3" />
            </Link>
          </p>
        </div>
      </header>

      <div role="tablist" className="flex gap-1 border-b border-white/08">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={`-mb-px min-h-11 border-b-2 px-4 text-[14px] font-medium transition-colors ${
                active ? "border-[#D4AF37] text-white" : "border-transparent text-white/45 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "bookings" ? <AdminConsultationBookings /> : <AdminConsultationPricing />}
    </div>
  );
}
