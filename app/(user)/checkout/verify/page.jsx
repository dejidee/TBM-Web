"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { checkoutApi } from "@/lib/api/checkout";
import { ordersApi } from "@/lib/api/orders";
import { usePersistedState, clearPersistedState, CHECKOUT_KEYS } from "@/hooks/use-persisted-state";

const PAID_RE = /paid|success|complete/i;
// Quick automatic retries on a *network* failure (not a real answer from the
// backend) before falling back to checking the order directly, then a slow
// background poll while genuinely uncertain. Paystack's own webhook
// (POST /webhooks/paystack) usually settles the order's paymentStatus
// server-side within seconds, independent of whether this browser can reach
// the verify endpoint at all — the poll gives that a chance to land before
// asking the shopper to do anything.
const QUICK_RETRIES = 2;
const QUICK_RETRY_DELAY_MS = 1500;
const POLL_INTERVAL_MS = 6000;
const POLL_MAX_ATTEMPTS = 5;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function CheckoutVerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { width, height } = useWindowSize();
  // Same storage as app/(user)/checkout/page.jsx — must match, or the two
  // pages would be reading/writing different copies of `attempt`.
  const [attempt, setAttempt] = usePersistedState(CHECKOUT_KEYS.attempt, null, {
    storage: "local",
  });

  const reference =
    searchParams.get("reference") || searchParams.get("trxref") || attempt?.reference;
  const urlOrderId = searchParams.get("orderId");
  const orderId = urlOrderId || attempt?.orderId;
  const alreadyConfirmed = searchParams.get("confirmed") === "true";

  // "loading" | "checking" | "success" | "failed" | "uncertain"
  const [status, setStatus] = useState("loading");
  const [resolvedOrderId, setResolvedOrderId] = useState(orderId || null);
  const [errorMessage, setErrorMessage] = useState("");
  // State, not a ref: setStatus("uncertain") while already "uncertain" is a
  // no-op re-render as far as React is concerned, so the poll effect below
  // must depend on something that *does* change on every tick to be
  // rescheduled — a ref update alone would not re-trigger it.
  const [pollCount, setPollCount] = useState(0);
  const stoppedRef = useRef(false);

  const finish = useCallback(
    (outcome, message) => {
      setErrorMessage(message ?? "");
      setStatus(outcome);
      if (outcome === "success") {
        // The purchase is genuinely done — safe to wipe the whole draft.
        // `attempt` lives in localStorage (see the hook above) while the rest
        // of the draft is sessionStorage — clear each from its own store.
        clearPersistedState([
          CHECKOUT_KEYS.step,
          CHECKOUT_KEYS.delivery,
          CHECKOUT_KEYS.payment,
          CHECKOUT_KEYS.promoCode,
          CHECKOUT_KEYS.promoDiscount,
          CHECKOUT_KEYS.form,
        ]);
        setAttempt(null);
      } else if (outcome === "failed") {
        // The attempt is dead (backend gave a definitive no). Clear only the
        // attempt guard, keeping delivery/payment so retrying doesn't force
        // the shopper to re-enter their address — the next submit mints a
        // fresh idempotency key since `attempt` is now gone.
        setAttempt(null);
      }
      // "uncertain" clears nothing: the order may still resolve, and the
      // checkout page must keep refusing to submit a second payment for it.
    },
    [setAttempt],
  );

  /** One attempt at answering "did this payment go through?" — network errors return null, they don't throw. */
  const checkOnce = useCallback(async () => {
    if (reference) {
      try {
        const data = await checkoutApi.verifyPaystackPayment(reference);
        return { reachable: true, orderId: data?.orderId ?? null, paymentStatus: data?.paymentStatus };
      } catch {
        // fall through to the order-status fallback below
      }
    }
    if (orderId) {
      try {
        const res = await ordersApi.getOrderDetails(orderId);
        const order = res?.data;
        return {
          reachable: true,
          orderId: order?.id ?? orderId,
          paymentStatus: order?.paymentStatusName,
        };
      } catch {
        return { reachable: false };
      }
    }
    return { reachable: false };
  }, [reference, orderId]);

  const runCheck = useCallback(async () => {
    if (!reference && !orderId) {
      router.replace("/checkout");
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
      setResolvedOrderId(result.orderId ?? null);
      if (result.paymentStatus && PAID_RE.test(result.paymentStatus)) {
        finish("success");
      } else if (result.paymentStatus === "Failed") {
        finish("failed", "Your payment was not completed.");
      } else {
        finish(
          "uncertain",
          `We're still waiting on a status for this payment${
            result.paymentStatus ? ` (currently: ${result.paymentStatus})` : ""
          }. If you were charged, do not pay again — it will show up on your order shortly.`,
        );
      }
      return;
    }

    finish(
      "uncertain",
      "We couldn't reach our servers to confirm this payment. If you were charged, do not pay again — check back in a moment or contact support with your order number.",
    );
  }, [reference, orderId, checkOnce, finish, router]);

  // Initial check, once.
  useEffect(() => {
    if (alreadyConfirmed && orderId) {
      setResolvedOrderId(orderId);
      finish("success");
      return;
    }
    runCheck();
    return () => {
      stoppedRef.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // While genuinely uncertain, keep quietly checking in the background — the
  // webhook that actually settles payment status runs server-side and does
  // not depend on this tab's connection at all.
  useEffect(() => {
    if (status !== "uncertain") return;
    if (pollCount >= POLL_MAX_ATTEMPTS) return;
    const t = setTimeout(() => {
      // Bumping this — not `status`, which is already "uncertain" and won't
      // change — is what makes this effect run again for the next tick.
      setPollCount((c) => c + 1);
      runCheck();
    }, POLL_INTERVAL_MS);
    return () => clearTimeout(t);
  }, [status, pollCount, runCheck]);

  if (status === "loading" || status === "checking") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mx-auto mb-4" />
          <p className="text-[15px] text-white/50">Verifying your payment…</p>
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
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(245,158,11,0.12)" }}
          >
            <AlertTriangle className="w-9 h-9 text-amber-400" />
          </div>
          <h2 className="text-[24px] font-bold text-white mb-2">Still confirming…</h2>
          <p className="text-[14px] text-white/45 mb-2 leading-relaxed">{errorMessage}</p>
          {resolvedOrderId && (
            <p className="text-[13px] text-white/30 mb-6">Order #{resolvedOrderId}</p>
          )}
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
              href="/dashboard/orders"
              className="px-6 py-3 rounded-lg font-medium border border-white/10 text-white hover:bg-white/05 transition-colors"
            >
              View Orders
            </Link>
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
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(239,68,68,0.12)" }}
          >
            <XCircle className="w-9 h-9 text-red-400" />
          </div>
          <h2 className="text-[24px] font-bold text-white mb-2">Payment Failed</h2>
          <p className="text-[14px] text-white/45 mb-8 leading-relaxed">{errorMessage}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/checkout"
              className="px-6 py-3 rounded-lg font-semibold text-black transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
            >
              Try Again
            </Link>
            <Link
              href="/cart"
              className="px-6 py-3 rounded-lg font-medium border border-white/10 text-white hover:bg-white/05 transition-colors"
            >
              Back to Cart
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={500}
        gravity={0.3}
        colors={["#D4AF37", "#b8962e", "#fff", "#ffffff80"]}
      />
      <div className="min-h-screen bg-black flex items-center justify-center pt-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-white/08 p-12 text-center max-w-lg w-full"
          style={{ background: "#0d0b08" }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(212,175,55,0.12)" }}
          >
            <CheckCircle className="w-12 h-12 text-[#D4AF37]" />
          </div>

          <h2 className="text-[32px] font-bold text-white mb-2">Order Confirmed!</h2>

          {resolvedOrderId && (
            <p className="text-[18px] font-semibold text-[#D4AF37] mb-4">Order #{resolvedOrderId}</p>
          )}

          <p className="text-[15px] text-white/45 mb-8 max-w-md mx-auto leading-relaxed">
            Thank you for your purchase. We&rsquo;ve sent a confirmation email with your order details
            and tracking information.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard/orders"
              className="px-6 py-3 rounded-lg font-semibold transition-opacity hover:opacity-90 text-black"
              style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
            >
              View Orders
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

export default function CheckoutVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center pt-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mx-auto mb-4" />
          <p className="text-[15px] text-white/50">Verifying your payment…</p>
        </div>
      </div>
    }>
      <CheckoutVerifyContent />
    </Suspense>
  );
}
