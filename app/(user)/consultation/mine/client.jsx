"use client";

import Link from "next/link";

import { useSession } from "@/hooks/use-session";
import { useMyConsultations } from "@/hooks/use-consultations";
import ConsultationCard from "@/components/shared/consultation/consultation-card";

export default function MyConsultationsClient() {
  const { isAuthenticated, isLoading: sessionLoading } = useSession();
  const { data: consultations, isLoading, isError, refetch } = useMyConsultations();

  if (!sessionLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-20 px-4">
        <div className="text-center max-w-sm">
          <p className="text-[16px] text-white mb-2">Sign in to view your consultations</p>
          <Link href="/sign-in?from=/consultation/mine" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-black" style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}>
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-semibold text-white">My Consultations</h1>
            <p className="mt-1.5 text-[14px] text-white/45">Every consultation you've booked, with real-time status.</p>
          </div>
          <Link href="/consultation" className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 text-white text-[13px] font-medium hover:bg-white/05 transition-colors">
            Book Another
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-40 rounded-2xl border border-white/08 bg-white/03 animate-pulse" />)}
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-white/08 p-12 text-center" style={{ background: "#0d0b08" }}>
            <p className="text-[14px] text-white/40 mb-4">Couldn&rsquo;t load your consultations.</p>
            <button onClick={() => refetch()} className="text-[13px] text-[#D4AF37] hover:underline">Try again</button>
          </div>
        ) : !consultations?.length ? (
          <div className="rounded-2xl border border-white/08 p-12 text-center" style={{ background: "#0d0b08" }}>
            <p className="text-[14px] text-white/40 mb-4">No consultations booked yet.</p>
            <Link href="/consultation" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-black" style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}>
              Book a Consultation
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {consultations.map((c) => <ConsultationCard key={c.id} consultation={c} />)}
          </div>
        )}
      </div>
    </div>
  );
}
