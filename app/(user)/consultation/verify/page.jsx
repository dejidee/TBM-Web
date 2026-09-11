"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { consultationsApi, formatFee } from "@/lib/api/consultations";
import {
  usePersistedState,
  CONSULTATION_KEYS,
} from "@/hooks/use-persisted-state";
import { showToast } from "@/components/shared/toast";
import { useSession } from "@/hooks/use-session";
import { getManagementToken, manageHref } from "@/lib/consultation-tokens";

// Quick automatic retries on a *network* failure (checkout's pattern —
// BACKLOG.md — adapted for how this backend actually signals failure: a
// clean HTTP 400 with `{ success: false, message }`, not a 200 with a status
// field. A 400 already IS the answer; only a thrown network error is
// genuinely ambiguous here.
const QUICK_RETRIES = 2;
const QUICK_RETRY_DELAY_MS = 1500;
const POLL_INTERVAL_MS = 6000;
const POLL_MAX_ATTEMPTS = 5;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function formatDateTime(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleString("en-NG", { weekday: "short", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" });
}

function ConsultationVerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { width, height } = useWindowSize();
  const [attempt, setAttempt] = usePersistedState(CONSULTATION_KEYS.attempt, null, {
    storage: "local",
  });

  const reference = searchParams.get("reference") || searchParams.get("trxref") || attempt?.reference;
  const consultationId = searchParams.get("consultationId") || attempt?.consultationId;
  const alreadyConfirmed = searchParams.get("confirmed") === "true";
  const { isAuthenticated } = useSession();
  // A guest's management token survives the Paystack round-trip in the
  // persisted attempt and in lib/consultation-tokens.js; a signed-in owner
  // has neither and needs neither.
  const token = attempt?.token ?? getManagementToken(consultationId);

  // "loading" | "checking" | "success" | "failed" | "uncertain"
  const [status, setStatus] = useState("loading");
  const [consultation, setConsultation] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [pollCount, setPollCount] = useState(0);
  const [retrying, setRetrying] = useState(false);
  const stoppedRef = useRef(false);

  const finish = useCallback(
    (outcome, message, consultationData) => {
      setErrorMessage(message ?? "");
      setStatus(outcome);
      if (consultationData) setConsultation(consultationData);

      if (outcome === "success") {
        setAttempt(null);
      } else if (outcome === "failed") {
        // Unlike checkout, the *booking* has no idempotency key — a fresh
        // "Try Again" cannot safely resubmit POST /consultations at all (it
        // would either double-book or hit slot-locking). What's safe to
        // retry is initialize-payment against the *same* consultation id, so
        // keep that id, just drop the dead reference.
        setAttempt((prev) => (prev ? { consultationId: prev.consultationId, createdAt: prev.createdAt, token: prev.token } : null));
      }
      // "uncertain" clears nothing — the consultation may still resolve.
    },
    [setAttempt],
  );

  const checkOnce = useCallback(async () => {
    if (reference) {
      try {
        await consultationsApi.verifyPayment(reference);
        // Resolved without throwing. The success shape has never been
        // observed (only the 400 failure path has) — re-fetch the
        // consultation itself for the authoritative status either way.
        if (consultationId) {
          const res = await consultationsApi.getConsultation(consultationId, token);
          return { reachable: true, consultation: res?.data };
        }
        return { reachable: true, assumedPaid: true };
      } catch (err) {
        if (err.status === 400) {
          // A clean, definitive answer for *this reference* — but check the
          // consultation directly too, in case it was already confirmed by
          // some other path.
          if (consultationId) {
            try {
              const res = await consultationsApi.getConsultation(consultationId, token);
              return { reachable: true, consultation: res?.data };
            } catch {
              /* fall through to network-unreachable below */
            }
          }
          return { reachable: true, failed: true, message: err.message };
        }
        // No `.status` — a network-level failure, not a backend answer. Fall
        // through to the consultation-status fallback below.
      }
    }
    if (consultationId) {
      try {
        const res = await consultationsApi.getConsultation(consultationId, token);
        return { reachable: true, consultation: res?.data };
      } catch {
        return { reachable: false };
      }
    }
    return { reachable: false };
  }, [reference, consultationId]);

  const runCheck = useCallback(async () => {
    if (!reference && !consultationId) {
      router.replace("/consultation");
      return;
    }

    setStatus((s) => (s === "loading" ? "loading" : "checking"));

    let result = null;
    for (let i = 0; i <= QUICK_RETRIES; i++) {
      result = await checkOnce();
      if (result.reachable) break;
      if (i < QUICK_RETRIES) await sleep(QUICK_RETRY_DELAY_MS);
    }

    if (stoppedRef.current) return;

    if (result?.reachable) {
      if (result.consultation) {
        const c = result.consultation;
        if (c.paymentVerified || c.status === "Confirmed") {
          finish("success", "", c);
        } else if (c.status === "Cancelled") {
          finish("failed", c.cancellationReason || "This consultation was cancelled.", c);
        } else {
          finish(
            "uncertain",
            `Still waiting on payment confirmation (status: ${c.status}). If you were charged, do not pay again.`,
            c,
          );
        }
      } else if (result.assumedPaid) {
        finish("success");
      } else if (result.failed) {
        finish("failed", result.message || "Your payment was not completed.");
      } else {
        finish("uncertain", "We're still waiting on a status for this payment.");
      }
      return;
    }

    finish(
      "uncertain",
      "We couldn't reach our servers to confirm this payment. If you were charged, do not pay again; check back in a moment or contact support.",
    );
  }, [reference, consultationId, checkOnce, finish, router]);

  useEffect(() => {
    if (alreadyConfirmed && consultationId) {
      consultationsApi
        .getConsultation(consultationId, token)
        .then((res) => finish("success", "", res?.data))
        .catch(() => finish("success")); // free booking: already confirmed at booking time regardless
      return;
    }
    runCheck();
    return () => {
      stoppedRef.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status !== "uncertain") return;
    if (pollCount >= POLL_MAX_ATTEMPTS) return;
    const t = setTimeout(() => {
      setPollCount((c) => c + 1);
      runCheck();
    }, POLL_INTERVAL_MS);
    return () => clearTimeout(t);
  }, [status, pollCount, runCheck]);

  const handleTryAgain = async () => {
    if (!consultation && !consultationId) return;
    setRetrying(true);
    try {
      const email = consultation?.contactEmail;
      const payment = await consultationsApi.initializePayment(consultationId, email, token);
      const data = payment?.data;
      if (data?.authorizationUrl) {
        setAttempt({ consultationId, createdAt: Date.now(), reference: data.reference, token });
        window.location.href = data.authorizationUrl;
        return;
      }
      throw new Error("Could not start a new payment attempt.");
    } catch (err) {
      showToast.error(err.message);
      setRetrying(false);
    }
  };

  if (status === "loading" || status === "checking") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mx-auto mb-4" />
          <p className="text-[15px] text-white/50">Confirming your consultation…</p>
          <p className="text-[13px] text-white/25 mt-1">Please don&rsquo;t close this page</p>
        </div>
      </div>
    );
  }

  if (status === "uncertain") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-white/08 p-10 text-center max-w-md w-full"
          style={{ background: "#0d0b08" }}
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(245,158,11,0.12)" }}>
            <AlertTriangle className="w-9 h-9 text-amber-400" />
          </div>
          <h2 className="text-[24px] font-bold text-white mb-2">Still confirming…</h2>
          <p className="text-[14px] text-white/45 mb-6 leading-relaxed">{errorMessage}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                setPollCount(0);
                runCheck();
              }}
              className="px-6 py-3 rounded-lg font-semibold text-black transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
            >
              Check again
            </button>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-lg font-medium border border-white/10 text-white hover:bg-white/05 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-white/08 p-10 text-center max-w-md w-full"
          style={{ background: "#0d0b08" }}
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(239,68,68,0.12)" }}>
            <XCircle className="w-9 h-9 text-red-400" />
          </div>
          <h2 className="text-[24px] font-bold text-white mb-2">Payment Not Completed</h2>
          <p className="text-[14px] text-white/45 mb-8 leading-relaxed">{errorMessage}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleTryAgain}
              disabled={retrying}
              className="px-6 py-3 rounded-lg font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
            >
              {retrying ? "Redirecting…" : "Try Again"}
            </button>
            <Link
              href="/consultation"
              className="px-6 py-3 rounded-lg font-medium border border-white/10 text-white hover:bg-white/05 transition-colors"
            >
              Back to Booking
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Confetti width={width} height={height} recycle={false} numberOfPieces={500} gravity={0.3} colors={["#D4AF37", "#b8962e", "#fff", "#ffffff80"]} />
      <div className="min-h-screen bg-black flex items-center justify-center pt-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-white/08 p-12 text-center max-w-lg w-full"
          style={{ background: "#0d0b08" }}
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(212,175,55,0.12)" }}>
            <CheckCircle2 className="w-12 h-12 text-[#D4AF37]" />
          </div>

          <h2 className="text-[32px] font-bold text-white mb-2">Consultation Confirmed!</h2>

          {consultation && (
            <p className="text-[15px] text-white/60 mb-1">{consultation.typeName}</p>
          )}
          {consultation?.scheduledStart && (
            <p className="text-[18px] font-semibold text-[#D4AF37] mb-4">
              {formatDateTime(consultation.scheduledStart)}
            </p>
          )}

          <p className="text-[15px] text-white/45 mb-8 max-w-md mx-auto leading-relaxed">
            {consultation?.fee > 0
              ? `Payment of ${formatFee(consultation.fee)} received. `
              : ""}
            We&rsquo;ll send a reminder ahead of your session.
            {!isAuthenticated && token && (
              <>
                {" "}
                Keep the manage link on the next page &mdash; it&rsquo;s how you reschedule or cancel without an account.
              </>
            )}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={isAuthenticated ? "/consultation/mine" : manageHref(consultationId, token)}
              className="px-6 py-3 rounded-lg font-semibold transition-opacity hover:opacity-90 text-black"
              style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
            >
              {isAuthenticated ? "View My Consultations" : "Manage This Booking"}
            </Link>
            <Link
              href="/bogat/materials"
              className="px-6 py-3 rounded-lg font-medium border border-white/10 text-white hover:bg-white/05 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default function ConsultationVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center pt-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mx-auto mb-4" />
            <p className="text-[15px] text-white/50">Confirming your consultation…</p>
          </div>
        </div>
      }
    >
      <ConsultationVerifyContent />
    </Suspense>
  );
}
