"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useFormik } from "formik";
import { X, AlertTriangle } from "lucide-react";

import { cancelConsultationSchema } from "@/lib/validations/admin-consultation";

/**
 * Cancel a booking on the customer's behalf. The reason is required because
 * the backend stores it on the record (`cancellationReason`) and the customer
 * sees it on their own booking list.
 */
export default function CancelConsultationModal({ consultation, onClose, onConfirm, isPending }) {
  const formik = useFormik({
    initialValues: { reason: "" },
    validationSchema: cancelConsultationSchema,
    onSubmit: (values) => onConfirm(values.reason.trim()),
  });

  const open = Boolean(consultation);
  const paid = consultation?.fee > 0 && consultation?.paymentVerified;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={isPending ? undefined : onClose}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
        >
          <motion.form
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={formik.handleSubmit}
            className="w-full max-w-md rounded-2xl border border-white/08 bg-surface shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-white/08 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger/10">
                  <AlertTriangle className="text-danger" size={20} />
                </div>
                <h2 className="font-manrope text-[20px] font-bold text-white">Cancel booking</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                aria-label="Close"
                className="-mr-2 -mt-2 grid h-11 w-11 place-items-center text-white/30 transition-colors hover:text-white/60 disabled:opacity-50"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <p className="text-[14px] leading-relaxed text-white/50">
                <span className="font-semibold text-white">{consultation.contactName}</span>
                {"'s "}
                {consultation.typeName} will be cancelled and the slot released.
                {paid && (
                  <>
                    {" "}
                    This booking is <span className="text-white">paid</span> — the backend decides
                    the refund and reports it in the confirmation.
                  </>
                )}
              </p>

              <div>
                <label htmlFor="cancel-reason" className="mb-1.5 block text-[12px] font-medium uppercase tracking-wider text-white/40">
                  Reason (shown to the customer)
                </label>
                <textarea
                  id="cancel-reason"
                  name="reason"
                  rows={3}
                  value={formik.values.reason}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isPending}
                  className="w-full rounded-lg border border-white/10 bg-white/04 px-3 py-2.5 text-[14px] text-white outline-none placeholder:text-white/25 focus:border-[#D4AF37]/50"
                  placeholder="e.g. Consultant unavailable on this date — we'll reach out to rebook."
                />
                {formik.touched.reason && formik.errors.reason && (
                  <p className="mt-1.5 text-[12px] text-danger">{formik.errors.reason}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 rounded-b-2xl border-t border-white/08 bg-white/03 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="min-h-11 rounded-lg border border-white/10 px-5 text-[14px] font-medium text-white/60 transition-colors hover:bg-white/05 disabled:opacity-50"
              >
                Keep booking
              </button>
              <button
                type="submit"
                disabled={isPending || formik.isSubmitting}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-danger px-5 text-[14px] font-medium text-white transition-colors hover:bg-danger-solid disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Cancelling…
                  </>
                ) : (
                  "Cancel booking"
                )}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
