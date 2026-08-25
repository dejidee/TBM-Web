"use client";

import { useState } from "react";
import { useFormik } from "formik";
import { Loader2 } from "lucide-react";
import ModalShell, { Field, inputClass } from "./modal-shell";
import { useCreateRenovationEstimate } from "@/hooks/use-ai-services";
import { renovationEstimateSchema, FINISH_LEVELS } from "@/lib/validations/estimate";

const SCOPE_FIELDS = [
  { name: "includeFlooring", label: "Flooring" },
  { name: "includePainting", label: "Painting" },
  { name: "includeElectrical", label: "Electrical" },
  { name: "includePlumbing", label: "Plumbing" },
];

const naira = (n) => `₦${Number(n ?? 0).toLocaleString()}`;

/**
 * "Get Estimate" from a design card. A Design carries no dimensions (only its
 * design session did, and that's gone by the time it's a saved design), so
 * length/width/height always start blank — see lib/api/schemas/ai.ts.
 *
 * POST /ai/renovation/estimate returns the full breakdown directly (no
 * envelope); this modal shows it in place rather than closing on success,
 * since there's nowhere else in the app that surfaces it yet.
 */
export default function EstimateModal({ design, onClose }) {
  const [result, setResult] = useState(null);
  const createEstimate = useCreateRenovationEstimate();

  const formik = useFormik({
    initialValues: {
      roomType: design.roomType || "",
      lengthMeters: "",
      widthMeters: "",
      heightMeters: "",
      finishLevel: "Standard",
      includeFlooring: true,
      includePainting: true,
      includeElectrical: false,
      includePlumbing: false,
      contingencyPercent: 10,
    },
    validationSchema: renovationEstimateSchema,
    onSubmit: (values, { setSubmitting }) => {
      const length = Number(values.lengthMeters);
      const width = Number(values.widthMeters);
      const height = Number(values.heightMeters);
      createEstimate.mutate(
        {
          projectId: null,
          projectName: design.prompt?.slice(0, 100) || null,
          roomType: values.roomType,
          lengthMeters: length,
          widthMeters: width,
          heightMeters: height,
          finishLevel: values.finishLevel,
          includeFlooring: values.includeFlooring,
          includePainting: values.includePainting,
          includeElectrical: values.includeElectrical,
          includePlumbing: values.includePlumbing,
          contingencyPercent: Number(values.contingencyPercent),
          roomDimensions: { length, width, height },
        },
        {
          onSuccess: (data) => setResult(data),
          onSettled: () => setSubmitting(false),
        },
      );
    },
  });

  if (result) {
    return (
      <ModalShell title="Renovation Estimate" onClose={onClose} maxWidthClass="max-w-lg">
        <div className="space-y-5">
          <div className="rounded-lg border border-[#D4AF37]/20 bg-[#D4AF37]/06 p-4 text-center">
            <p className="text-[12px] text-white/50 uppercase tracking-wide">Total estimate</p>
            <p className="text-[28px] font-semibold text-[#D4AF37] mt-1">{naira(result.totalEstimate)}</p>
            <p className="text-[12px] text-white/40 mt-1">{result.summary}</p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-white/04 p-3">
              <p className="text-[11px] text-white/40">Materials</p>
              <p className="text-[14px] text-white font-medium mt-0.5">{naira(result.materialsSubtotal)}</p>
            </div>
            <div className="rounded-lg bg-white/04 p-3">
              <p className="text-[11px] text-white/40">Labour</p>
              <p className="text-[14px] text-white font-medium mt-0.5">{naira(result.laborSubtotal)}</p>
            </div>
            <div className="rounded-lg bg-white/04 p-3">
              <p className="text-[11px] text-white/40">Contingency</p>
              <p className="text-[14px] text-white font-medium mt-0.5">{naira(result.contingencyAmount)}</p>
            </div>
          </div>

          {result.lineItems?.length > 0 && (
            <div>
              <p className="text-[13px] font-medium text-white/70 mb-2">Breakdown</p>
              <div className="rounded-lg border border-white/08 divide-y divide-white/06">
                {result.lineItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 px-3 py-2.5 text-[13px]">
                    <div className="min-w-0">
                      <p className="text-white truncate">{item.name}</p>
                      <p className="text-white/35 text-[11px]">
                        {item.quantity} {item.unit} · {item.group}
                      </p>
                    </div>
                    <p className="text-white/70 shrink-0">{naira(item.totalCost)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.nextSteps?.length > 0 && (
            <div>
              <p className="text-[13px] font-medium text-white/70 mb-2">Next steps</p>
              <div className="flex flex-col gap-2">
                {result.nextSteps.map((step, i) => (
                  <a
                    key={i}
                    href={step.url}
                    className="min-h-11 flex items-center justify-between px-3.5 rounded-lg bg-white/06 hover:bg-white/10 text-[13px] text-white/80 transition-colors"
                  >
                    {step.label}
                    <span className="text-white/30">&rarr;</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full min-h-11 rounded-lg text-[14px] font-semibold text-black transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
          >
            Done
          </button>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell title="Get an Estimate" onClose={onClose}>
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <p className="text-[13px] text-white/45 -mt-1">
          Enter the room's dimensions to get an AI cost estimate for this design.
        </p>

        <Field label="Room type" required error={formik.errors.roomType} touched={formik.touched.roomType}>
          <input
            name="roomType"
            value={formik.values.roomType}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Living room"
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Length (m)" required error={formik.errors.lengthMeters} touched={formik.touched.lengthMeters}>
            <input
              name="lengthMeters"
              type="number"
              inputMode="decimal"
              step="0.1"
              value={formik.values.lengthMeters}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="5"
              className={inputClass}
            />
          </Field>
          <Field label="Width (m)" required error={formik.errors.widthMeters} touched={formik.touched.widthMeters}>
            <input
              name="widthMeters"
              type="number"
              inputMode="decimal"
              step="0.1"
              value={formik.values.widthMeters}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="4"
              className={inputClass}
            />
          </Field>
          <Field label="Height (m)" required error={formik.errors.heightMeters} touched={formik.touched.heightMeters}>
            <input
              name="heightMeters"
              type="number"
              inputMode="decimal"
              step="0.1"
              value={formik.values.heightMeters}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="3"
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Finish level" required error={formik.errors.finishLevel} touched={formik.touched.finishLevel}>
          <select
            name="finishLevel"
            value={formik.values.finishLevel}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={inputClass}
          >
            {FINISH_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </Field>

        <div>
          <span className="block text-[13px] font-medium text-white/70 mb-2">Include in scope</span>
          <div className="grid grid-cols-2 gap-2.5">
            {SCOPE_FIELDS.map(({ name, label }) => (
              <label
                key={name}
                className="flex items-center gap-2.5 min-h-11 px-3 rounded-lg bg-white/04 border border-white/08 text-[13px] text-white/70 cursor-pointer"
              >
                <input
                  type="checkbox"
                  name={name}
                  checked={formik.values[name]}
                  onChange={formik.handleChange}
                  className="h-4 w-4 accent-[#D4AF37]"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <Field
          label="Contingency (%)"
          required
          error={formik.errors.contingencyPercent}
          touched={formik.touched.contingencyPercent}
        >
          <input
            name="contingencyPercent"
            type="number"
            inputMode="decimal"
            value={formik.values.contingencyPercent}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={inputClass}
          />
        </Field>

        <button
          type="submit"
          disabled={formik.isSubmitting || createEstimate.isPending}
          className="w-full min-h-11 flex items-center justify-center gap-2 rounded-lg text-[14px] font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
        >
          {(formik.isSubmitting || createEstimate.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
          Get Estimate
        </button>
      </form>
    </ModalShell>
  );
}
