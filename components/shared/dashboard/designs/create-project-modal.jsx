"use client";

import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import { Loader2 } from "lucide-react";
import ModalShell, { Field, inputClass } from "./modal-shell";
import { useCreateProject } from "@/hooks/use-project";
import { createProjectSchema } from "@/lib/validations/projects";
import { showToast } from "@/components/shared/toast";

/**
 * "Make into a project" from a design card. There's no backend link between a
 * design and a project (BACKLOG.md #5: CreateDesignSessionRequestDto has no
 * projectId), so this creates a brand new project pre-filled from the design
 * — it does not attach or reference the design in any way the backend can see.
 */
export default function CreateProjectModal({ design, onClose }) {
  const router = useRouter();
  const createProject = useCreateProject();

  const formik = useFormik({
    initialValues: {
      name: design.prompt ? design.prompt.slice(0, 80) : "New project",
      roomType: design.roomType || "",
      startDate: "",
      totalBudget: "",
    },
    validationSchema: createProjectSchema,
    onSubmit: (values, { setSubmitting }) => {
      createProject.mutate(
        {
          name: values.name.trim(),
          description: design.prompt || null,
          roomType: values.roomType.trim(),
          startDate: values.startDate ? new Date(values.startDate).toISOString() : null,
          totalBudget: values.totalBudget ? Number(values.totalBudget) : null,
        },
        {
          onSuccess: (res) => {
            const project = res?.data;
            showToast.success("Project created");
            onClose();
            if (project?.id) router.push(`/dashboard/projects/${project.id}`);
            else router.push("/dashboard/projects");
          },
          onSettled: () => setSubmitting(false),
        },
      );
    },
  });

  return (
    <ModalShell title="Make into a Project" onClose={onClose}>
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <p className="text-[13px] text-white/45 -mt-1">
          Starts a new project pre-filled from this design. You can add budget, timeline and
          documents once it's created.
        </p>

        <Field label="Project name" required error={formik.errors.name} touched={formik.touched.name}>
          <input
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="e.g. Living room renovation"
            className={inputClass}
          />
        </Field>

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

        <div className="grid grid-cols-2 gap-3">
          <Field label="Start date" error={formik.errors.startDate} touched={formik.touched.startDate}>
            <input
              name="startDate"
              type="date"
              value={formik.values.startDate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={inputClass}
            />
          </Field>
          <Field label="Budget (₦)" error={formik.errors.totalBudget} touched={formik.touched.totalBudget}>
            <input
              name="totalBudget"
              type="number"
              inputMode="decimal"
              value={formik.values.totalBudget}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Optional"
              className={inputClass}
            />
          </Field>
        </div>

        <button
          type="submit"
          disabled={formik.isSubmitting || createProject.isPending}
          className="w-full min-h-11 flex items-center justify-center gap-2 rounded-lg text-[14px] font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
        >
          {(formik.isSubmitting || createProject.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
          Create Project
        </button>
      </form>
    </ModalShell>
  );
}
