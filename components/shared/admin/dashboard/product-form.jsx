"use client";

import { useFormik } from "formik";
import Link from "next/link";
import { AlertCircle, Loader2, Plus, X } from "lucide-react";
import { useCategories } from "@/hooks/use-products";
import {
  BRAND_TYPES,
  PRODUCT_TYPES,
  createProductSchema,
  updateProductSchema,
} from "@/lib/validations/admin-product";

const input =
  "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-[14px] text-white placeholder:text-white/25 focus:border-[#D4AF37]/60 focus:outline-none transition-colors";
const label = "block text-[12px] font-medium text-white/60 mb-1.5";
const errorText = "mt-1 text-[12px] text-red-400";
const sectionHeading = "text-[13px] uppercase tracking-[0.12em] text-white/40";

/**
 * A card in the right-hand rail. The rail holds the settings an admin sets once
 * and glances at (price, stock, visibility); the main column holds the copy they
 * actually write. Boxing the rail is what makes the two columns read as
 * "reference" and "work" rather than as one form snapped in half.
 */
function RailCard({ title, children }) {
  return (
    <section className="space-y-4 rounded-xl border border-white/10 bg-white/2 p-4">
      <h2 className={sectionHeading}>{title}</h2>
      {children}
    </section>
  );
}

/** A checkbox + label row, the shape used for every boolean in this form. */
function CheckboxRow({ formik, name, children }) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <input
        type="checkbox"
        className="h-4 w-4 accent-[#D4AF37]"
        {...formik.getFieldProps(name)}
        checked={Boolean(formik.values[name])}
      />
      <span className="text-[14px] text-white/80">{children}</span>
    </label>
  );
}

function Field({ formik, name, children, hint }) {
  const touched = formik.touched[name];
  const error = formik.errors[name];
  return (
    <div>
      {children}
      {hint && !(touched && error) && (
        <p className="mt-1 text-[12px] text-white/30">{hint}</p>
      )}
      {touched && error && <p className={errorText}>{error}</p>}
    </div>
  );
}

/** A plain text field bound to `name`, to keep the many attribute inputs terse. */
function TextField({ formik, name, label: labelText, placeholder, hint }) {
  return (
    <Field formik={formik} name={name} hint={hint}>
      <label className={label} htmlFor={name}>
        {labelText}
      </label>
      <input
        id={name}
        className={input}
        placeholder={placeholder}
        {...formik.getFieldProps(name)}
      />
    </Field>
  );
}

/** Editor for a `string[]` value (keyFeatures, whatsIncluded, …): one row per
 *  bullet, add/remove, stored straight onto the Formik array. */
function StringListField({ formik, name, label: labelText, placeholder }) {
  const items = formik.values[name] ?? [];
  const set = (next) => formik.setFieldValue(name, next);
  return (
    <div>
      <label className={label}>{labelText}</label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              className={input}
              value={item}
              placeholder={placeholder}
              onChange={(e) =>
                set(items.map((v, j) => (j === i ? e.target.value : v)))
              }
            />
            <button
              type="button"
              aria-label={`Remove ${labelText} item`}
              onClick={() => set(items.filter((_, j) => j !== i))}
              className="shrink-0 rounded-lg border border-white/10 px-3 text-white/40 transition-colors hover:border-red-400/40 hover:text-red-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => set([...items, ""])}
        className="mt-2 inline-flex items-center gap-1.5 text-[13px] text-[#D4AF37] transition-opacity hover:opacity-80"
      >
        <Plus className="h-3.5 w-3.5" /> Add item
      </button>
    </div>
  );
}

/** Editor for `specifications`: an array of { key, value } rows. */
function SpecificationsField({ formik }) {
  const items = formik.values.specifications ?? [];
  const set = (next) => formik.setFieldValue("specifications", next);
  return (
    <div>
      <label className={label}>Specifications</label>
      <div className="space-y-2">
        {items.map((row, i) => (
          <div key={i} className="flex gap-2">
            <input
              className={`${input} sm:max-w-[40%]`}
              placeholder="Label (e.g. Origin)"
              value={row?.key ?? ""}
              onChange={(e) =>
                set(items.map((r, j) => (j === i ? { ...r, key: e.target.value } : r)))
              }
            />
            <input
              className={input}
              placeholder="Value (e.g. Italy)"
              value={row?.value ?? ""}
              onChange={(e) =>
                set(items.map((r, j) => (j === i ? { ...r, value: e.target.value } : r)))
              }
            />
            <button
              type="button"
              aria-label="Remove specification"
              onClick={() => set(items.filter((_, j) => j !== i))}
              className="shrink-0 rounded-lg border border-white/10 px-3 text-white/40 transition-colors hover:border-red-400/40 hover:text-red-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => set([...items, { key: "", value: "" }])}
        className="mt-2 inline-flex items-center gap-1.5 text-[13px] text-[#D4AF37] transition-opacity hover:opacity-80"
      >
        <Plus className="h-3.5 w-3.5" /> Add specification
      </button>
    </div>
  );
}

/**
 * Create and edit share this form, but not their payload.
 *
 * `mode="create"` validates with createProductSchema (brandType + productType);
 * `mode="edit"` with updateProductSchema (isActive, and brand/type immutable).
 * The two DTOs differ by exactly those fields — see lib/validations/admin-product.js.
 */
export default function ProductForm({
  mode,
  initialValues,
  onSubmit,
  isPending,
  submitLabel,
  media,
}) {
  const isEdit = mode === "edit";
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const formik = useFormik({
    initialValues,
    validationSchema: isEdit ? updateProductSchema : createProductSchema,
    enableReinitialize: true,
    onSubmit,
  });

  const busy = formik.isSubmitting || isPending;
  const errorCount = Object.keys(formik.errors).length;
  const showErrors = formik.submitCount > 0 && errorCount > 0;

  /**
   * Submitting an invalid form is otherwise silent: Formik marks every field
   * touched, but the messages land wherever those fields happen to be, and on a
   * form this long the first one is usually off-screen. The save bar reports the
   * count and this jumps to it.
   */
  function focusFirstError() {
    const [first] = Object.keys(formik.errors);
    // Array fields (specifications, keyFeatures) key their error by the array
    // name, which is not an input id — nothing to focus, so scroll only.
    const el = first && document.getElementById(first);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.focus({ preventScroll: true });
  }

  /**
   * Enter in any single-line input submits a form by default. Across thirty-odd
   * inputs — several of which sit in add-a-row editors where Enter reads as
   * "add" — that fires a save the admin did not ask for. The save bar is always
   * on screen, so nothing is lost by requiring it to be clicked. Textareas keep
   * Enter for newlines; buttons keep it for activation.
   */
  function blockImplicitSubmit(e) {
    if (e.key !== "Enter") return;
    const el = e.target;
    if (el instanceof HTMLInputElement && el.type !== "submit") e.preventDefault();
  }

  return (
    <form onSubmit={formik.handleSubmit} onKeyDown={blockImplicitSubmit}>
      {/* Two columns once the form itself is wide enough — a container query,
          not a viewport one. The admin shell already spends 240px on the
          sidebar, so an `xl:` breakpoint measures the wrong box and leaves a
          1440px laptop rendering the narrow layout. Below the split the form
          stays capped at a readable measure rather than stretching.

          The query lives on this wrapper rather than on <form> so the action
          bar below is not inside a `container-type: inline-size` box — that
          applies layout containment, and the bar depends on `position: sticky`
          resolving against the page. */}
      <div className="@container">
        <div className="grid max-w-3xl grid-cols-1 items-start gap-x-8 gap-y-8 @[62rem]:max-w-none @[62rem]:grid-cols-[minmax(0,1fr)_22rem]">
        {/* ── Main column ──────────────────────────────────────────────────── */}
        <div className="min-w-0 space-y-8">
          {media}

          {/* ── Basics ─────────────────────────────────────────────────────── */}
          <section className="space-y-4">
            <h2 className={sectionHeading}>Basics</h2>

            <Field formik={formik} name="name">
              <label className={label} htmlFor="name">
                Name
              </label>
              <input
                id="name"
                className={input}
                placeholder="Matte Black Basin Tap"
                {...formik.getFieldProps("name")}
              />
            </Field>

            <Field formik={formik} name="description">
              <label className={label} htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                rows={5}
                className={input}
                placeholder="What it is, what it's made of, where it fits."
                {...formik.getFieldProps("description")}
              />
            </Field>

            <Field formik={formik} name="shortDescription">
              <label className={label} htmlFor="shortDescription">
                Short description
              </label>
              <input
                id="shortDescription"
                className={input}
                placeholder="One line for cards and search results"
                {...formik.getFieldProps("shortDescription")}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field formik={formik} name="sku">
                <label className={label} htmlFor="sku">
                  SKU
                </label>
                <input id="sku" className={input} {...formik.getFieldProps("sku")} />
              </Field>

              <Field
                formik={formik}
                name="categoryId"
                hint={categoriesLoading ? "Loading categories…" : undefined}
              >
                <label className={label} htmlFor="categoryId">
                  Category
                </label>
                <select
                  id="categoryId"
                  className={input}
                  disabled={categoriesLoading}
                  {...formik.getFieldProps("categoryId")}
                >
                  <option value="">Select a category…</option>
                  {(categories ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Brand and type are set once, at creation. UpdateProductDto does
                not carry them, so the edit form shows them read-only rather
                than offering a control that would silently do nothing. */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field formik={formik} name="brandType">
                <label className={label} htmlFor="brandType">
                  Brand {isEdit && <span className="text-white/25">· immutable</span>}
                </label>
                <select
                  id="brandType"
                  className={`${input} ${isEdit ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={isEdit}
                  {...formik.getFieldProps("brandType")}
                >
                  {BRAND_TYPES.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field formik={formik} name="productType">
                <label className={label} htmlFor="productType">
                  Type {isEdit && <span className="text-white/25">· immutable</span>}
                </label>
                <select
                  id="productType"
                  className={`${input} ${isEdit ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={isEdit}
                  {...formik.getFieldProps("productType")}
                >
                  {PRODUCT_TYPES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </section>

          {/* ── Content ──────────────────────────────────────────────────── */}
          <section className="space-y-5">
            <div>
              <h2 className={sectionHeading}>Content</h2>
              <p className="mt-1 text-[12px] text-white/30">
                The marketing copy shown on the product page — features, what
                the buyer gets, and the spec table.
              </p>
            </div>

            <StringListField
              formik={formik}
              name="keyFeatures"
              label="Key features"
              placeholder="Integrated stone basin"
            />
            <StringListField
              formik={formik}
              name="whatsIncluded"
              label="What's included"
              placeholder="Stone basin and vanity top"
            />
            <StringListField
              formik={formik}
              name="whatsNotIncluded"
              label="What's not included"
              placeholder="Tapware, installation"
            />
            <SpecificationsField formik={formik} />
          </section>

          {/* ── Attributes ───────────────────────────────────────────────── */}
          <section className="space-y-4">
            <h2 className={sectionHeading}>Attributes</h2>

            <div className="grid gap-4 sm:grid-cols-2 @[62rem]:grid-cols-3">
              <TextField formik={formik} name="material" label="Material" placeholder="Natural marble" />
              <TextField formik={formik} name="color" label="Colour" placeholder="Emperador brown" />
              <TextField formik={formik} name="finishType" label="Finish" placeholder="Polished" />
              <TextField formik={formik} name="installationType" label="Installation" placeholder="Wall-mounted" />
              <TextField formik={formik} name="dimensions" label="Dimensions" placeholder="1200 × 500 × 200 mm" />
              <TextField formik={formik} name="warranty" label="Warranty" placeholder="2 years" />
              <TextField formik={formik} name="materialType" label="Material type" placeholder="Stone" />
              <TextField formik={formik} name="qualityTier" label="Quality tier" placeholder="Premium" />
            </div>
            <TextField
              formik={formik}
              name="recommendedFor"
              label="Recommended for"
              placeholder="Powder rooms, guest suites"
            />
          </section>

          {/* ── Search listing ───────────────────────────────────────────── */}
          <section className="space-y-4">
            <div>
              <h2 className={sectionHeading}>Search listing</h2>
              <p className="mt-1 text-[12px] text-white/30">
                What Google shows. Left blank, it falls back to the name and
                short description.
              </p>
            </div>

            <Field
              formik={formik}
              name="metaTitle"
              hint="Up to 70 characters."
            >
              <label className={label} htmlFor="metaTitle">
                Meta title
              </label>
              <input id="metaTitle" className={input} {...formik.getFieldProps("metaTitle")} />
            </Field>

            <Field
              formik={formik}
              name="metaDescription"
              hint="Up to 160 characters."
            >
              <label className={label} htmlFor="metaDescription">
                Meta description
              </label>
              <textarea
                id="metaDescription"
                rows={2}
                className={input}
                {...formik.getFieldProps("metaDescription")}
              />
            </Field>
          </section>
        </div>

        {/* ── Rail ───────────────────────────────────────────────────────────
            Settings, not copy. Sticky so price and stock stay in view while the
            admin works down the long left column. */}
        <aside className="min-w-0 space-y-4 @[62rem]:sticky @[62rem]:top-6">
          <RailCard title="Status">
            {isEdit && (
              <CheckboxRow formik={formik} name="isActive">
                Active
              </CheckboxRow>
            )}
            <CheckboxRow formik={formik} name="isFeatured">
              Featured
            </CheckboxRow>
            <p className="text-[12px] text-white/30">
              Inactive products stay in the catalogue but are hidden from the
              storefront.
            </p>
          </RailCard>

          <RailCard title="Pricing">
            <CheckboxRow formik={formik} name="showPrice">
              Show the price publicly
            </CheckboxRow>
            <p className="-mt-2 text-[12px] text-white/30">
              Unchecked makes this a quote-only product: the storefront renders
              &ldquo;Request Price&rdquo; and no price is sent to the browser.
            </p>

            {/* price is required iff showPrice — the same coupling the response
                contract enforces (price is null exactly when showPrice is
                false). */}
            {formik.values.showPrice && (
              <div className="space-y-4">
                <Field formik={formik} name="price">
                  <label className={label} htmlFor="price">
                    Price (₦)
                  </label>
                  <input
                    id="price"
                    type="number"
                    step="0.01"
                    className={input}
                    {...formik.getFieldProps("price")}
                  />
                </Field>

                <Field
                  formik={formik}
                  name="compareAtPrice"
                  hint="Optional. Shown struck through, so it must exceed the price."
                >
                  <label className={label} htmlFor="compareAtPrice">
                    Compare-at price (₦)
                  </label>
                  <input
                    id="compareAtPrice"
                    type="number"
                    step="0.01"
                    className={input}
                    {...formik.getFieldProps("compareAtPrice")}
                  />
                </Field>
              </div>
            )}
          </RailCard>

          <RailCard title="Inventory">
            <CheckboxRow formik={formik} name="trackInventory">
              Track inventory
            </CheckboxRow>

            {formik.values.trackInventory && (
              <div className="space-y-4">
                <Field formik={formik} name="stockQuantity">
                  <label className={label} htmlFor="stockQuantity">
                    Stock quantity
                  </label>
                  <input
                    id="stockQuantity"
                    type="number"
                    className={input}
                    {...formik.getFieldProps("stockQuantity")}
                  />
                </Field>

                <Field
                  formik={formik}
                  name="lowStockThreshold"
                  hint="Flags the product in the admin low-stock alerts."
                >
                  <label className={label} htmlFor="lowStockThreshold">
                    Low-stock threshold
                  </label>
                  <input
                    id="lowStockThreshold"
                    type="number"
                    className={input}
                    {...formik.getFieldProps("lowStockThreshold")}
                  />
                </Field>
              </div>
            )}
          </RailCard>

          <RailCard title="Organisation">
            <Field formik={formik} name="displayOrder" hint="Lower sorts first.">
              <label className={label} htmlFor="displayOrder">
                Display order
              </label>
              <input
                id="displayOrder"
                type="number"
                className={input}
                {...formik.getFieldProps("displayOrder")}
              />
            </Field>

            <TextField
              formik={formik}
              name="tags"
              label="Tags"
              placeholder="bathroom, vanity, luxury"
              hint="Comma-separated."
            />
            <TextField
              formik={formik}
              name="aiKeywords"
              label="AI keywords"
              placeholder="stone basin luxury"
              hint="Comma-separated. Feeds AI search."
            />
          </RailCard>
        </aside>
        </div>
      </div>

      {/* ── Actions ──────────────────────────────────────────────────────────
          Pinned to the bottom of the viewport. This form is long enough that a
          save button in the flow means scrolling past thirty fields to commit a
          one-word edit — and scrolling back to find what failed. The negative
          margins bleed it to the edges of the admin shell's padding so it reads
          as a bar rather than a floating card. */}
      <div className="sticky bottom-0 z-30 -mx-4 mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-white/10 bg-black/85 px-4 py-3 backdrop-blur lg:-mx-6 lg:px-6 xl:-mx-8 xl:px-8">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#D4AF37] px-5 text-[14px] font-semibold text-black transition-opacity disabled:opacity-50"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {busy ? "Saving…" : submitLabel}
        </button>
        <Link
          href="/admin/dashboard/products"
          className="inline-flex min-h-11 items-center rounded-lg border border-white/15 px-5 text-[14px] text-white/70 transition-colors hover:text-white"
        >
          Cancel
        </Link>

        {showErrors ? (
          <button
            type="button"
            onClick={focusFirstError}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-[12.5px] text-red-400 transition-colors hover:text-red-300 sm:ml-auto"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            {errorCount === 1
              ? "1 field needs attention"
              : `${errorCount} fields need attention`}
          </button>
        ) : formik.dirty ? (
          <span className="text-[12.5px] text-white/40 sm:ml-auto">
            Unsaved changes
          </span>
        ) : null}
      </div>
    </form>
  );
}
