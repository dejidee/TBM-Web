// components/checkout/PaymentMethod.jsx
"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { CreditCard, Landmark, Tag, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useValidatePromoCode } from "@/hooks/use-checkout";

const paymentMethods = [
  {
    id: "Paystack",
    label: "Card / Bank / USSD",
    description: "Pay securely via Paystack: card, bank transfer, or USSD",
    icon: CreditCard,
  },
  {
    id: "BankTransfer",
    label: "Direct Bank Transfer",
    description: "Transfer directly to our account; we confirm within 24 hrs",
    icon: Landmark,
  },
];

export default function PaymentMethod({ onComplete, onPromoChange }) {
  const [selectedMethod, setSelectedMethod] = useState("Paystack");
  const [promoCode, setPromoCode] = useState("");
  const [promoResult, setPromoResult] = useState(null); // { valid, discount, message }

  const validatePromo = useValidatePromoCode();

  const handleMethodSelect = (id) => {
    setSelectedMethod(id);
    onComplete?.({ method: id, promoCode: promoResult?.valid ? promoCode : "" });
  };

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    validatePromo.mutate(
      { code: promoCode.trim() },
      {
        onSuccess: (data) => {
          const result = { valid: true, discount: data.discount, message: data.message || "Promo code applied!" };
          setPromoResult(result);
          onPromoChange?.(promoCode.trim(), data.discount);
          onComplete?.({ method: selectedMethod, promoCode: promoCode.trim() });
        },
        onError: (err) => {
          setPromoResult({ valid: false, message: err.message || "Invalid promo code." });
          onPromoChange?.("", 0);
        },
      }
    );
  };

  const handlePromoKeyDown = (e) => {
    if (e.key === "Enter") handleApplyPromo();
  };

  const handleRemovePromo = () => {
    setPromoCode("");
    setPromoResult(null);
    onPromoChange?.("", 0);
    onComplete?.({ method: selectedMethod, promoCode: "" });
  };

  // Auto-notify parent on initial render
  const handleSelect = (id) => {
    setSelectedMethod(id);
    onComplete?.({ method: id, promoCode: promoResult?.valid ? promoCode : "" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-2xl border border-white/08 p-6"
      style={{ background: "#0d0b08" }}
    >
      <h2 className="text-[18px] font-semibold text-white mb-6">Payment Method</h2>

      {/* Method Selection */}
      <div className="space-y-2.5 mb-6">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const active = selectedMethod === method.id;
          return (
            <button
              key={method.id}
              onClick={() => handleSelect(method.id)}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left"
              style={
                active
                  ? { borderColor: "#D4AF37", background: "rgba(212,175,55,0.06)" }
                  : { borderColor: "rgba(255,255,255,0.08)", background: "transparent" }
              }
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: active ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.05)" }}
              >
                <Icon className={`w-4.5 h-4.5 ${active ? "text-[#D4AF37]" : "text-white/40"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[13px] font-semibold leading-tight ${active ? "text-white" : "text-white/60"}`}>
                  {method.label}
                </p>
                <p className="text-[11px] text-white/35 mt-0.5 leading-relaxed">{method.description}</p>
              </div>
              <div
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                style={active ? { borderColor: "#D4AF37", background: "#D4AF37" } : { borderColor: "rgba(255,255,255,0.2)" }}
              >
                {active && <div className="w-2 h-2 rounded-full bg-black" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Promo Code */}
      <div className="border-t border-white/08 pt-6">
        <label className="flex items-center gap-2 text-[12px] font-medium text-white/30 uppercase tracking-widest mb-3">
          <Tag className="w-3.5 h-3.5" />
          Promo Code
          <span className="normal-case tracking-normal text-white/20 font-normal">(optional)</span>
        </label>

        {promoResult?.valid ? (
          <div className="flex items-center gap-3 p-3 rounded-lg border border-green-500/30 bg-green-500/05">
            <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-green-400">{promoCode.toUpperCase()}</p>
              <p className="text-[12px] text-white/40">{promoResult.message}</p>
            </div>
            <button
              onClick={handleRemovePromo}
              className="text-white/30 hover:text-white/60 transition-colors text-[12px] shrink-0"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => {
                setPromoCode(e.target.value.toUpperCase());
                if (promoResult) setPromoResult(null);
              }}
              onKeyDown={handlePromoKeyDown}
              className="flex-1 px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-[14px] text-white placeholder:text-white/25 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 transition-all uppercase"
              placeholder="ENTER CODE"
            />
            <button
              onClick={handleApplyPromo}
              disabled={!promoCode.trim() || validatePromo.isPending}
              className="px-4 py-2.5 rounded-lg text-[13px] font-semibold border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/08 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
            >
              {validatePromo.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Apply
            </button>
          </div>
        )}

        {promoResult && !promoResult.valid && (
          <div className="flex items-center gap-2 mt-2">
            <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <p className="text-[12px] text-red-400">{promoResult.message}</p>
          </div>
        )}
      </div>

      {/* Paystack redirect notice */}
      <div
        className="mt-6 p-4 rounded-xl flex items-start gap-3"
        style={{ background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.12)" }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: "rgba(212,175,55,0.15)" }}
        >
          <span className="text-[13px] text-[#D4AF37] font-bold">i</span>
        </div>
        <div>
          <p className="text-[13px] font-semibold text-white mb-1">Secure Payment via Paystack</p>
          <p className="text-[12px] text-white/40 leading-relaxed">
            Clicking &ldquo;Confirm &amp; Pay&rdquo; will redirect you to Paystack&rsquo;s secure payment page.
            You&rsquo;ll be brought back here once payment is complete.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
