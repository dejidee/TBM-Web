"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFormik } from "formik";
import { X, Pencil, Tags } from "lucide-react";

import { useAdminConsultationPricing, useUpdateConsultationPricing } from "@/hooks/use-admin-consultations";
import { formatFee } from "@/lib/api/consultations";
import { consultationPricingSchema } from "@/lib/validations/admin-consultation";
import { showToast } from "@/components/shared/toast";

function formatUpdated(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function EditPricingModal({ row, onClose, onSave, isPending }) {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      fee: row?.fee ?? 0,
      currency: row?.currency ?? "NGN",
      creditedTowardProject: row?.creditedTowardProject ?? false,
      isActive: row?.isActive ?? true,
    },
    validationSchema: consultationPricingSchema,
    onSubmit: (values) =>
      onSave({
        fee: Number(values.fee),
        currency: values.currency.trim().toUpperCase(),
        // `location` is the per-location pricing hook; null on every row so far
        // and not editable here. Sent back unchanged because PUT is a full replace.
        location: row?.location ?? null,
        creditedTowardProject: values.creditedTowardProject,
        isActive: values.isActive,
      }),
  });

  const input =
    "w-full min-h-11 rounded-lg border border-white/10 bg-white/04 px-3 text-[14px] text-white outline-none focus:border-[#D4AF37]/50 disabled:opacity-50";

  return (
    <AnimatePresence>
      {row && (
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
              <div>
                <h2 className="font-manrope text-[20px] font-bold text-white">{row.consultationType}</h2>
                <p className="mt-0.5 text-[13px] text-white/40">Changes apply to the public booking page immediately.</p>
              </div>
              <button type="button" onClick={onClose} disabled={isPending} aria-label="Close" className="-mr-2 -mt-2 grid h-11 w-11 place-items-center text-white/30 hover:text-white/60 disabled:opacity-50">
                <X size={22} />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label htmlFor="fee" className="mb-1.5 block text-[12px] font-medium uppercase tracking-wider text-white/40">Fee</label>
                  <input id="fee" name="fee" type="number" min="0" step="500" inputMode="numeric" value={formik.values.fee} onChange={formik.handleChange} onBlur={formik.handleBlur} disabled={isPending} className={input} />
                  {formik.touched.fee && formik.errors.fee && <p className="mt-1.5 text-[12px] text-danger">{formik.errors.fee}</p>}
                  <p className="mt-1.5 text-[12px] text-white/35">Set to 0 to make it free.</p>
                </div>
                <div>
                  <label htmlFor="currency" className="mb-1.5 block text-[12px] font-medium uppercase tracking-wider text-white/40">Currency</label>
                  <input id="currency" name="currency" maxLength={3} value={formik.values.currency} onChange={formik.handleChange} onBlur={formik.handleBlur} disabled={isPending} className={`${input} uppercase`} />
                  {formik.touched.currency && formik.errors.currency && <p className="mt-1.5 text-[12px] text-danger">{formik.errors.currency}</p>}
                </div>
              </div>

              <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-white/08 px-3">
                <input type="checkbox" name="creditedTowardProject" checked={formik.values.creditedTowardProject} onChange={formik.handleChange} disabled={isPending} className="h-5 w-5 accent-[#D4AF37]" />
                <span className="text-[14px] text-white/80">Fee is credited toward the project if they proceed</span>
              </label>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-white/08 px-3">
                <input type="checkbox" name="isActive" checked={formik.values.isActive} onChange={formik.handleChange} disabled={isPending} className="h-5 w-5 accent-[#D4AF37]" />
                <span className="text-[14px] text-white/80">Active</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 rounded-b-2xl border-t border-white/08 bg-white/03 px-6 py-4">
              <button type="button" onClick={onClose} disabled={isPending} className="min-h-11 rounded-lg border border-white/10 px-5 text-[14px] font-medium text-white/60 hover:bg-white/05 disabled:opacity-50">
                Cancel
              </button>
              <button type="submit" disabled={isPending || formik.isSubmitting} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#D4AF37] px-5 text-[14px] font-semibold text-black disabled:opacity-50">
                {isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function AdminConsultationPricing() {
  const { data: rows = [], isLoading, isError, error } = useAdminConsultationPricing();
  const update = useUpdateConsultationPricing();
  const [editing, setEditing] = useState(null);

  function save(body) {
    const target = editing;
    update.mutate(
      { id: target.id, body },
      {
        onSuccess: () => {
          setEditing(null);
          showToast.success("Pricing updated", `${target.consultationType} is now ${formatFee(body.fee)}.`);
        },
        onError: (err) => showToast.error("Could not save", err.message),
      },
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-[13px] text-white/40">
        One row per consultation type. These fees are what the public booking page shows and charges.
      </p>

      {isLoading && (
        <div className="space-y-3" aria-busy="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl border border-white/08 bg-white/03" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/06 p-6 text-center">
          <p className="text-[14px] font-medium text-white">Could not load pricing</p>
          <p className="mt-1.5 text-[13px] text-white/45">{error?.message}</p>
        </div>
      )}

      {!isLoading && !isError && rows.length === 0 && (
        <div className="rounded-xl border border-white/08 p-10 text-center" style={{ background: "#0d0b08" }}>
          <Tags className="mx-auto h-8 w-8 text-white/20" strokeWidth={1.5} />
          <p className="mt-4 text-[15px] font-medium text-white">No pricing configured</p>
          <p className="mx-auto mt-1.5 max-w-sm text-[13px] text-white/40">
            Pricing rows are seeded by the backend; none came back. Check with the backend team.
          </p>
        </div>
      )}

      {!isLoading && !isError && rows.length > 0 && (
        <>
          {/* Desktop Table View */}
          <div className="hidden overflow-hidden rounded-xl border border-white/08 md:block">
            <table className="w-full" style={{ background: "#0d0b08" }}>
              <thead>
                <tr className="border-b border-white/08 text-left">
                  {["Consultation", "Fee", "Credited", "Active", "Updated", ""].map((h, i) => (
                    <th key={i} className={`px-4 py-3 text-[12px] font-medium uppercase tracking-wider text-white/35 ${i === 5 ? "text-right" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/06">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-white/02">
                    <td className="px-4 py-3 text-[14px] font-medium text-white">{row.consultationType}</td>
                    <td className="px-4 py-3 text-[13px] text-white/80">{formatFee(row.fee)}{row.currency !== "NGN" && <span className="ml-1 text-white/40">{row.currency}</span>}</td>
                    <td className="px-4 py-3 text-[13px] text-white/55">{row.creditedTowardProject ? "Yes" : "No"}</td>
                    <td className="px-4 py-3 text-[13px]">{row.isActive ? <span className="text-success">Active</span> : <span className="text-white/40">Inactive</span>}</td>
                    <td className="px-4 py-3 text-[13px] text-white/45">{formatUpdated(row.updatedAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setEditing(row)} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-white/12 px-3 text-[12px] font-medium text-white/70 hover:text-white">
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="space-y-3 md:hidden">
            {rows.map((row) => (
              <div key={row.id} className="rounded-xl border border-white/08 p-4" style={{ background: "#0d0b08" }}>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[15px] font-semibold text-white">{row.consultationType}</h3>
                  <span className={`text-[12px] ${row.isActive ? "text-success" : "text-white/40"}`}>{row.isActive ? "Active" : "Inactive"}</span>
                </div>
                <p className="mt-1 text-[20px] font-semibold text-[#D4AF37]">{formatFee(row.fee)}</p>
                <p className="mt-1 text-[12px] text-white/40">{row.creditedTowardProject ? "Credited toward the project" : "Not credited toward the project"}</p>
                <button onClick={() => setEditing(row)} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/12 text-[13px] font-medium text-white/80">
                  <Pencil className="h-4 w-4" /> Edit pricing
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <EditPricingModal row={editing} onClose={() => !update.isPending && setEditing(null)} onSave={save} isPending={update.isPending} />
    </div>
  );
}
