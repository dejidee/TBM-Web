"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormik } from "formik";
import { Loader2, Crown } from "lucide-react";
import ModalShell, { Field, inputClass } from "./modal-shell";
import EstimateResult from "./estimate-result";
import { useCreateRenovationEstimate } from "@/hooks/use-ai-services";
import { useSubscriptionState } from "@/hooks/use-subscription";
import { renovationEstimateSchema, FINISH_LEVELS } from "@/lib/validations/estimate";

const SCOPE_FIELDS = [
  { name: "includeFlooring", label: "Flooring" },
  { name: "includePainting", label: "Painting" },
  { name: "includeElectrical", label: "Electrical" },
  { name: "includePlumbing", label: "Plumbing" },
];

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
  // Master spec's package table: Economy gets "no cost data"; Premium and
  // Luxury both get the full estimate. Gated here, once, so every entry point
  // (this design-card action, the studio's "Continue to Estimate") inherits it
  // for free instead of each caller re-implementing the check.
  const { isLuxury, isPremium, isLoading: isSubLoading } = useSubscriptionState();
  const canEstimate = isLuxury || isPremium;

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

  if (isSubLoading) {
    return (
      <ModalShell title="Get an Estimate" onClose={onClose}>
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-white/30" />
        </div>
      </ModalShell>
    );
  }

  if (!canEstimate) {
    return (
      <ModalShell title="Get an Estimate" onClose={onClose}>
        <div className="text-center py-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#D4AF37]/10">
            <Crown className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <p className="mt-4 text-[15px] font-semibold text-white">Premium feature</p>
          <p className="mt-1.5 text-[13px] text-white/45">
            Cost estimates and material mapping are available on the Premium and Luxury plans.
          </p>
          <Link
            href="/ziora#pricing"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg px-6 text-[14px] font-semibold text-black transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
          >
            Upgrade your plan
          </Link>
        </div>
      </ModalShell>
    );
  }

  if (result) {
    return (
      <ModalShell title="Renovation Estimate" onClose={onClose} maxWidthClass="max-w-lg">
        <EstimateResult result={result} onDone={onClose} doneLabel="Done" />
        <Link
          href="/dashboard/ai-designs/estimates"
          className="block text-center text-[13px] text-white/40 hover:text-white/70 transition-colors mt-4"
        >
          View all estimates
        </Link>
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
