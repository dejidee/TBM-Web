"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import { ArrowLeft, ImagePlus, Loader2, Trash2 } from "lucide-react";

import { useCreatePortfolioProject } from "@/hooks/use-admin-portfolio";
import { usePortfolioCategories } from "@/hooks/use-project";
import { portfolioProjectSchema } from "@/lib/validations/admin-portfolio";
import { showToast } from "@/components/shared/toast";

/**
 * Sentinel `<option>` value that reveals a free-text input instead of selecting
 * a category. The option list is derived from projects already published, so
 * without an escape hatch the first project of a new type could never be filed.
 * No real category can collide with it — the derived list is trimmed, non-empty
 * strings taken verbatim from the backend.
 */
const NEW_CATEGORY = "__new__";

const MAX_PER_SIDE = 6;
const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp";

const inputClass =
  "w-full min-h-11 rounded-lg bg-white/04 border border-white/10 px-4 py-3 text-[14px] text-white placeholder:text-white/25 outline-none transition-colors focus:border-[#D4AF37]/60 focus:bg-white/06";

function Field({ label, error, touched, required, hint, children }) {
  const showError = touched && error;
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-medium text-white/70">
        {label}
        {required && <span className="ml-1 text-[#D4AF37]">*</span>}
      </span>
      {children}
      {hint && !showError && (
        <span className="mt-1.5 block text-[12px] text-white/30">{hint}</span>
      )}
      {showError && (
        <span className="mt-1.5 block text-[12px] text-red-400">{error}</span>
      )}
    </label>
  );
}

/**
 * A before/after image tray.
 *
 * Files are held locally and uploaded only after the project exists — the
 * `/images` endpoint is keyed by project id, so there is nothing to upload to
 * until then. Previews use object URLs, revoked on unmount so a long editing
 * session does not leak blobs.
 */
function ImageTray({ label, hint, files, onAdd, onRemove }) {
  const inputRef = useRef(null);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  function handlePick(event) {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = "";

    const room = MAX_PER_SIDE - files.length;
    const accepted = [];
    for (const file of picked.slice(0, room)) {
      if (file.size > MAX_BYTES) {
        showToast.error("Image too large", `${file.name} exceeds 10 MB.`);
        continue;
      }
      accepted.push(file);
    }
    if (picked.length > room) {
      showToast.warning("Some images skipped", `Up to ${MAX_PER_SIDE} ${label.toLowerCase()} images.`);
    }
    if (accepted.length) onAdd(accepted);
  }

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-medium text-white/70">{label}</span>
        <span className="text-[12px] text-white/25">
          {files.length} / {MAX_PER_SIDE}
        </span>
      </div>
      <p className="mb-3 text-[12px] leading-relaxed text-white/30">{hint}</p>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT}
        onChange={handlePick}
        className="sr-only"
      />

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {previews.map((url, index) => (
          <div
            key={url}
            className="group relative aspect-4/3 overflow-hidden rounded-lg border border-white/08"
          >
            <Image
              src={url}
              alt={`${label} ${index + 1}`}
              fill
              unoptimized
              sizes="120px"
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              aria-label={`Remove ${label} image ${index + 1}`}
              className="absolute right-1 top-1 grid h-11 w-11 place-items-center rounded-lg bg-black/70 text-white/70 transition-colors hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        {files.length < MAX_PER_SIDE && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="grid aspect-4/3 place-items-center rounded-lg border border-dashed border-white/15 text-white/35 transition-colors hover:border-[#D4AF37]/50 hover:text-white/60"
          >
            <ImagePlus className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function NewPortfolioProjectPage() {
  const router = useRouter();
  const [beforeFiles, setBeforeFiles] = useState([]);
  const [afterFiles, setAfterFiles] = useState([]);
  const [addingCategory, setAddingCategory] = useState(false);

  const createProject = useCreatePortfolioProject();
  const {
    data: categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = usePortfolioCategories();

  const hasCategories = (categories?.length ?? 0) > 0;
  // A dropdown with nothing in it is a dead end, so the input stands in whenever
  // there is no list to pick from — a failed fetch must not block publishing.
  const typingCategory =
    addingCategory || categoriesError || (!categoriesLoading && !hasCategories);

  const categoryHint = categoriesError
    ? "Could not load existing categories — type one."
    : typingCategory
      ? "Reuse an existing spelling where one fits; the public filter matches exactly."
      : "Categories already in use across published projects.";

  const formik = useFormik({
    initialValues: {
      title: "",
      vendorName: "TBM",
      location: "",
      category: "",
      description: "",
      scopeOfWork: "",
      budgetMin: "",
      budgetMax: "",
      durationMinDays: "",
      durationMaxDays: "",
    },
    validationSchema: portfolioProjectSchema,
    onSubmit: (values) => submit(values, true),
  });

  function submit(values, publish) {
    createProject.mutate(
      { values, beforeFiles, afterFiles, publish },
      {
        onSuccess: ({ failures, published }) => {
          if (failures.length > 0) {
            showToast.warning(
              "Saved, some images failed",
              `${failures.length} image(s) did not upload. The project was saved as a draft — add them from the list.`,
            );
          } else if (published) {
            showToast.success("Published", `"${values.title}" is live on the Projects page.`);
          } else {
            showToast.success("Saved as draft", "Publish it when the photos look right.");
          }
          router.push("/admin/dashboard/portfolio");
        },
        onError: (err) => showToast.error("Could not save", err.message),
      },
    );
  }

  async function saveAsDraft() {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      formik.setTouched(
        Object.keys(formik.values).reduce((acc, k) => ({ ...acc, [k]: true }), {}),
      );
      showToast.error("Check the form", "Some required fields are still empty.");
      return;
    }
    submit(formik.values, false);
  }

  const busy = createProject.isPending;
  const totalImages = beforeFiles.length + afterFiles.length;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/dashboard/portfolio"
          className="inline-flex min-h-11 items-center gap-2 text-[13px] text-white/50 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Portfolio
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-white">New project</h1>
        <p className="mt-1 text-[13px] leading-relaxed text-white/40">
          Published projects appear on the public Projects page, before-and-after
          photos included.
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <section
          className="space-y-5 rounded-xl border border-white/08 p-5 sm:p-6"
          style={{ background: "#0d0b08" }}
        >
          <h2 className="text-[15px] font-semibold text-white">Details</h2>

          <Field
            label="Title"
            required
            error={formik.errors.title}
            touched={formik.touched.title}
          >
            <input
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Luxury Bathroom Remodel — Maitama"
              className={inputClass}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Location"
              required
              error={formik.errors.location}
              touched={formik.touched.location}
            >
              <input
                name="location"
                value={formik.values.location}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Abuja"
                className={inputClass}
              />
            </Field>

            <Field
              label="Category"
              required
              hint={categoryHint}
              error={formik.errors.category}
              touched={formik.touched.category}
            >
              {typingCategory ? (
                <>
                  <input
                    name="category"
                    value={formik.values.category}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Bathroom Renovation"
                    className={inputClass}
                  />
                  {hasCategories && (
                    <button
                      type="button"
                      onClick={() => {
                        setAddingCategory(false);
                        formik.setFieldValue("category", "");
                      }}
                      className="mt-2 min-h-11 text-[12px] text-[#D4AF37]/80 underline-offset-4 transition-colors hover:text-[#D4AF37] hover:underline"
                    >
                      Choose from existing categories
                    </button>
                  )}
                </>
              ) : (
                <select
                  name="category"
                  value={formik.values.category}
                  onChange={(event) => {
                    // The sentinel is not a category — it swaps the control.
                    if (event.target.value === NEW_CATEGORY) {
                      setAddingCategory(true);
                      formik.setFieldValue("category", "");
                      return;
                    }
                    formik.handleChange(event);
                  }}
                  onBlur={formik.handleBlur}
                  disabled={categoriesLoading}
                  className={inputClass}
                >
                  <option value="">
                    {categoriesLoading
                      ? "Loading categories…"
                      : "Select a category…"}
                  </option>
                  {(categories ?? []).map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                  <option value={NEW_CATEGORY}>+ New category…</option>
                </select>
              )}
            </Field>
          </div>

          <Field
            label="Vendor name"
            required
            hint="Shown as the delivering brand — TBM or BOGAT."
            error={formik.errors.vendorName}
            touched={formik.touched.vendorName}
          >
            <input
              name="vendorName"
              value={formik.values.vendorName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={inputClass}
            />
          </Field>

          <Field
            label="Description"
            required
            error={formik.errors.description}
            touched={formik.touched.description}
          >
            <textarea
              name="description"
              rows={5}
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="What the project involved, what was difficult, and what the result is."
              className={`${inputClass} resize-y leading-relaxed`}
            />
          </Field>

          <Field
            label="Scope of work"
            required
            hint="One item per line."
            error={formik.errors.scopeOfWork}
            touched={formik.touched.scopeOfWork}
          >
            <textarea
              name="scopeOfWork"
              rows={5}
              value={formik.values.scopeOfWork}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder={"Demolition & strip-out\nPlumbing first fix\nWall & floor tiling\nSanitaryware installation"}
              className={`${inputClass} resize-y leading-relaxed`}
            />
          </Field>
        </section>

        <section
          className="space-y-5 rounded-xl border border-white/08 p-5 sm:p-6"
          style={{ background: "#0d0b08" }}
        >
          <div>
            <h2 className="text-[15px] font-semibold text-white">
              Budget &amp; duration
            </h2>
            <p className="mt-1 text-[12px] text-white/35">
              Optional. Left empty, the public page shows &ldquo;On Request&rdquo;.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Budget minimum (₦)"
              error={formik.errors.budgetMin}
              touched={formik.touched.budgetMin}
            >
              <input
                name="budgetMin"
                type="number"
                min="0"
                value={formik.values.budgetMin}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={inputClass}
              />
            </Field>

            <Field
              label="Budget maximum (₦)"
              error={formik.errors.budgetMax}
              touched={formik.touched.budgetMax}
            >
              <input
                name="budgetMax"
                type="number"
                min="0"
                value={formik.values.budgetMax}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={inputClass}
              />
            </Field>

            <Field
              label="Duration minimum (days)"
              error={formik.errors.durationMinDays}
              touched={formik.touched.durationMinDays}
            >
              <input
                name="durationMinDays"
                type="number"
                min="1"
                value={formik.values.durationMinDays}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={inputClass}
              />
            </Field>

            <Field
              label="Duration maximum (days)"
              error={formik.errors.durationMaxDays}
              touched={formik.touched.durationMaxDays}
            >
              <input
                name="durationMaxDays"
                type="number"
                min="1"
                value={formik.values.durationMaxDays}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        <section
          className="space-y-6 rounded-xl border border-white/08 p-5 sm:p-6"
          style={{ background: "#0d0b08" }}
        >
          <div>
            <h2 className="text-[15px] font-semibold text-white">
              Before &amp; after photos
            </h2>
            <p className="mt-1 text-[12px] leading-relaxed text-white/35">
              These are the whole point of the Projects page. Uploaded after the
              project is created, so a failed image never loses the write-up.
            </p>
          </div>

          <ImageTray
            label="Before"
            hint="The space as it was — same angles as the after shots where possible."
            files={beforeFiles}
            onAdd={(added) => setBeforeFiles((current) => [...current, ...added])}
            onRemove={(index) =>
              setBeforeFiles((current) => current.filter((_, i) => i !== index))
            }
          />

          <ImageTray
            label="After"
            hint="The finished result. The first after image becomes the thumbnail."
            files={afterFiles}
            onAdd={(added) => setAfterFiles((current) => [...current, ...added])}
            onRemove={(index) =>
              setAfterFiles((current) => current.filter((_, i) => i !== index))
            }
          />

          {totalImages === 0 && (
            <p className="rounded-lg border border-amber-500/25 bg-amber-500/06 px-4 py-3 text-[12px] leading-relaxed text-amber-200/80">
              With no photos this can be saved as a draft but not published — a
              project with no before-and-after is the problem the Projects page
              is meant to solve.
            </p>
          )}
        </section>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={saveAsDraft}
            disabled={busy}
            className="min-h-11 rounded-lg border border-white/15 px-5 text-[13px] font-medium text-white/80 transition-colors hover:text-white disabled:opacity-40"
          >
            Save as draft
          </button>
          <button
            type="submit"
            disabled={busy || totalImages === 0}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#D4AF37] px-6 text-[13px] font-semibold text-black disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {busy ? "Saving…" : "Save & publish"}
          </button>
        </div>
      </form>
    </div>
  );
}
