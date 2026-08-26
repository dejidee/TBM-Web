"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { useCancelSubscription } from "@/hooks/use-subscription";

const REASONS = [
  "Too expensive",
  "Not using it enough",
  "Missing features I need",
  "Switching to another tool",
  "Technical issues",
  "Just taking a break",
  "Other",
];

export default function CancelModal({ isOpen, onClose, accessUntil }) {
  const [step, setStep] = useState(1); // 1 | 2 | 3
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [done, setDone] = useState(false);

  const cancel = useCancelSubscription();

  const accessDate = accessUntil
    ? new Date(accessUntil).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const handleConfirmCancel = async () => {
    try {
      await cancel.mutateAsync({ reason, feedback });
      setDone(true);
      setTimeout(() => {
        onClose?.();
        setStep(1);
        setReason("");
        setFeedback("");
        setDone(false);
      }, 2000);
    } catch {
      // error shown inline
    }
  };

  const handleClose = () => {
    if (cancel.isPending) return;
    setStep(1);
    setReason("");
    setFeedback("");
    setDone(false);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50"
            onClick={handleClose}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              key="modal"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-md rounded-2xl overflow-hidden font-manrope border border-white/10"
              style={{ background: "#0d0b08", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/08">
                <h2 className="text-lg font-bold text-white">
                  {step === 1 && "Cancel Subscription?"}
                  {step === 2 && "One quick question"}
                  {step === 3 && "Confirm Cancellation"}
                </h2>
                <button
                  onClick={handleClose}
                  disabled={cancel.isPending}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white/30 hover:bg-white/05 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-6 py-6">
                {/* Step 1 — Confirmation */}
                {step === 1 && (
                  <div>
                    <p className="text-white/50 text-sm leading-relaxed">
                      Are you sure you want to cancel? Your access continues until your current
                      billing period ends.
                    </p>
                    {accessDate && (
                      <div
                        className="mt-4 rounded-xl px-4 py-3 text-sm text-amber-300 font-medium"
                        style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.20)" }}
                      >
                        You&apos;ll have full access until{" "}
                        <span className="font-bold">{accessDate}</span>.
                      </div>
                    )}
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => setStep(2)}
                        className="flex-1 min-h-11 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-900/20 transition-colors"
                        style={{ border: "1px solid rgba(239,68,68,0.25)" }}
                      >
                        Continue to Cancel
                      </button>
                      <button
                        onClick={handleClose}
                        className="flex-1 min-h-11 py-2.5 rounded-xl text-sm font-semibold text-black hover:opacity-90 transition-opacity"
                        style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
                      >
                        Keep My Plan
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2 — Questionnaire */}
                {step === 2 && (
                  <div>
                    <p className="text-white/40 text-sm mb-4">
                      Help us improve — why are you leaving?{" "}
                      <span className="text-white/25">(optional)</span>
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {REASONS.map((r) => (
                        <button
                          key={r}
                          onClick={() => setReason(r === reason ? "" : r)}
                          className="text-left min-h-11 px-3 py-2 rounded-lg text-sm transition-colors"
                          style={
                            reason === r
                              ? {
                                  background: "rgba(212,175,55,0.10)",
                                  border: "1px solid rgba(212,175,55,0.40)",
                                  color: "#D4AF37",
                                  fontWeight: 500,
                                }
                              : {
                                  background: "transparent",
                                  border: "1px solid rgba(255,255,255,0.08)",
                                  color: "rgba(255,255,255,0.50)",
                                }
                          }
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Anything else you'd like us to know…"
                      rows={3}
                      className="w-full text-sm border border-white/10 rounded-xl px-3 py-2.5 outline-none focus:border-[#D4AF37]/50 resize-none text-white placeholder-white/20 bg-[#1a1a1a] transition-all"
                    />
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => setStep(1)}
                        className="min-h-11 px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:bg-white/05 transition-colors"
                        style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setStep(3)}
                        className="flex-1 min-h-11 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-900/20 transition-colors"
                        style={{ border: "1px solid rgba(239,68,68,0.25)" }}
                      >
                        Next
                      </button>
                      <button
                        onClick={() => { setReason(""); setFeedback(""); setStep(3); }}
                        className="min-h-11 px-4 py-2.5 text-white/30 text-sm hover:text-white/50 transition-colors"
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3 — Final confirm */}
                {step === 3 && (
                  <div>
                    {done ? (
                      <div className="text-center py-8">
                        <p className="text-green-400 font-semibold text-base">
                          Subscription canceled.
                        </p>
                        {accessDate && (
                          <p className="text-white/40 text-sm mt-2">
                            You have access until {accessDate}.
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        <p className="text-white/50 text-sm leading-relaxed mb-4">
                          This will cancel your subscription at the end of your current billing
                          period.
                          {accessDate && (
                            <> You&apos;ll retain access until{" "}
                              <strong className="text-white/70">{accessDate}</strong>.</>
                          )}
                        </p>

                        {cancel.isError && (
                          <p className="text-red-400 text-sm mb-3">
                            {cancel.error?.message || "Cancellation failed. Please try again."}
                          </p>
                        )}

                        <div className="flex gap-3">
                          <button
                            onClick={() => setStep(2)}
                            disabled={cancel.isPending}
                            className="min-h-11 px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:bg-white/05 transition-colors disabled:opacity-50"
                            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                          >
                            Back
                          </button>
                          <button
                            onClick={handleConfirmCancel}
                            disabled={cancel.isPending}
                            className="flex-1 min-h-11 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            {cancel.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            Yes, Cancel Subscription
                          </button>
                          <button
                            onClick={handleClose}
                            disabled={cancel.isPending}
                            className="min-h-11 px-4 py-2.5 rounded-xl text-sm font-semibold text-black hover:opacity-90 transition-opacity disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
                          >
                            Keep Plan
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
