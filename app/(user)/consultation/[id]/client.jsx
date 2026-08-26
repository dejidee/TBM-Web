"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Copy, Check, Lock } from "lucide-react";

import { useConsultation } from "@/hooks/use-consultations";
import { useSession } from "@/hooks/use-session";
import { getManagementToken, rememberManagementToken, manageHref } from "@/lib/consultation-tokens";
import ConsultationCard from "@/components/shared/consultation/consultation-card";
import { showToast } from "@/components/shared/toast";

/**
 * Guest manage page. Token precedence: `?t=` in the URL (the link we gave
 * them, works on any device) → localStorage (this device, after the Paystack
 * round-trip) → none (a signed-in owner, authorised by cookie).
 *
 * A `?t=` is remembered on arrival so a later visit to the bare URL still works.
 */
export default function ConsultationDetailClient({ id }) {
  const searchParams = useSearchParams();
  const urlToken = searchParams.get("t");
  const { isAuthenticated } = useSession();
  const [stored, setStored] = useState(null);

  useEffect(() => {
    if (urlToken) rememberManagementToken(id, urlToken);
    setStored(getManagementToken(id));
  }, [id, urlToken]);

  const token = urlToken ?? stored;
  const { data: consultation, isLoading, isError, error, refetch } = useConsultation(id, token);

  const shareHref = useMemo(() => manageHref(id, token), [id, token]);
  const [copied, setCopied] = useState(false);
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${shareHref}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast.error("Could not copy — select the address bar instead.");
    }
  };

  const unauthorised = isError && (error?.status === 401 || error?.status === 404);

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#D4AF37]">Your booking</p>
        <h1 className="mt-2 text-[28px] font-semibold text-white">Consultation details</h1>
        <p className="mt-1.5 text-[14px] text-white/45">
          {token && !isAuthenticated
            ? "This link is how you manage your booking — keep it somewhere safe."
            : "Reschedule, cancel, or complete payment below."}
        </p>

        <div className="mt-8">
          {isLoading ? (
            <div className="h-44 rounded-2xl border border-white/08 bg-white/03 animate-pulse" />
          ) : unauthorised ? (
            <div className="rounded-2xl border border-white/08 p-10 text-center" style={{ background: "#0d0b08" }}>
              <Lock className="mx-auto h-8 w-8 text-white/20" strokeWidth={1.5} />
              <p className="mt-4 text-[15px] font-medium text-white">We can&rsquo;t show this booking</p>
              <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-white/40">
                {token
                  ? "The link you followed is not valid for this booking. Open the link from your booking confirmation, or sign in if you booked with an account."
                  : "Open the manage link from your booking confirmation, or sign in if you booked with an account."}
              </p>
              <div className="mt-5 flex flex-col sm:flex-row justify-center gap-3">
                <Link href={`/sign-in?from=${encodeURIComponent(`/consultation/${id}`)}`} className="btn-gold px-5 py-2.5 min-h-11 inline-flex items-center justify-center">
                  Sign in
                </Link>
                <Link href="/consultation" className="min-h-11 inline-flex items-center justify-center px-5 rounded-lg border border-white/10 text-white text-[13px] font-medium hover:bg-white/05">
                  Book a consultation
                </Link>
              </div>
            </div>
          ) : isError ? (
            <div className="rounded-2xl border border-white/08 p-10 text-center" style={{ background: "#0d0b08" }}>
              <p className="text-[14px] text-white/40 mb-4">{error?.message || "Couldn't load this booking."}</p>
              <button onClick={() => refetch()} className="text-[13px] text-[#D4AF37] hover:underline min-h-11">Try again</button>
            </div>
          ) : consultation ? (
            <>
              <ConsultationCard consultation={consultation} token={token} />

              <dl className="mt-6 rounded-2xl border border-white/08 p-5 space-y-2 text-[13px]" style={{ background: "#0d0b08" }}>
                <div className="flex justify-between gap-4"><dt className="text-white/40">Name</dt><dd className="text-white/80 text-right">{consultation.contactName}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-white/40">Email</dt><dd className="text-white/80 text-right break-all">{consultation.contactEmail}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-white/40">Phone</dt><dd className="text-white/80 text-right">{consultation.contactPhone}</dd></div>
                {consultation.siteAddress && (
                  <div className="flex justify-between gap-4"><dt className="text-white/40">Site</dt><dd className="text-white/80 text-right">{consultation.siteAddress}, {consultation.siteCity}, {consultation.siteState}</dd></div>
                )}
                {consultation.notes && (
                  <div className="flex justify-between gap-4"><dt className="text-white/40">Notes</dt><dd className="text-white/80 text-right">{consultation.notes}</dd></div>
                )}
              </dl>

              {token && (
                <button
                  type="button"
                  onClick={copyLink}
                  className="mt-4 inline-flex items-center gap-2 min-h-11 px-4 rounded-lg border border-white/10 text-[13px] font-medium text-white/70 hover:text-white hover:bg-white/05 transition-colors"
                >
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  {copied ? "Link copied" : "Copy manage link"}
                </button>
              )}

              {isAuthenticated && (
                <p className="mt-6 text-[13px] text-white/40">
                  <Link href="/consultation/mine" className="text-[#D4AF37] hover:underline">All my consultations →</Link>
                </p>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
