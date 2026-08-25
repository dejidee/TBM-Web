"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X } from "lucide-react";

/**
 * The dark modal shell shared by the design-card action forms (Get Estimate,
 * Make into Project). Portal-rendered so it escapes the card's own stacking
 * context, matching DropdownMenu in ./card.jsx. Esc and an overlay click both
 * close it; a click inside the panel does not.
 */
export default function ModalShell({ title, onClose, children, maxWidthClass = "max-w-md" }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`relative w-full ${maxWidthClass} max-h-[90vh] overflow-y-auto rounded-xl border border-white/10 p-6`}
        style={{ background: "#0d0b08" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-start justify-between mb-5 gap-4">
          <h3 className="text-[18px] font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 p-2 -m-2 rounded-lg text-white/40 hover:bg-white/05 hover:text-white/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </motion.div>
    </div>,
    document.body,
  );
}

export const fieldLabelClass = "block text-[13px] font-medium text-white/70 mb-2";
export const inputClass =
  "w-full min-h-11 rounded-lg bg-white/06 border border-white/10 px-3.5 py-2.5 text-[14px] text-white placeholder:text-white/30 outline-none transition-colors focus:border-[#D4AF37]/50";

export function Field({ label, error, touched, required, children }) {
  const showError = touched && error;
  return (
    <label className="block">
      <span className={fieldLabelClass}>
        {label}
        {required && <span className="text-[#D4AF37] ml-1">*</span>}
      </span>
      {children}
      {showError && <span className="block text-[12px] text-red-400 mt-1.5">{error}</span>}
    </label>
  );
}
