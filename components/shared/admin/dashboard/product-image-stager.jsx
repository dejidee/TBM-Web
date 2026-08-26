"use client";

import { useEffect, useRef } from "react";
import { Star, Trash2, UploadCloud, AlertTriangle } from "lucide-react";
import { showToast } from "@/components/shared/toast";
import {
  IMAGE_ACCEPT_ATTR,
  validateImageFile,
} from "@/lib/validations/admin-product";

/**
 * Staging area for the CREATE page.
 *
 * The upload endpoint needs a productId, which does not exist until the product
 * is created. So this does not upload anything — it collects `File`s in the
 * parent's state, shows previews, and lets the admin pick a cover and alt text.
 * The new-product page uploads them, in order, once create returns an id.
 *
 * Controlled: `value` is an array of `{ file, previewUrl, altText, isPrimary }`.
 * The parent owns the array; this renders and edits it.
 */
export default function ProductImageStager({ value, onChange }) {
  const fileRef = useRef(null);

  // Object URLs must be revoked or they leak. Revoke every preview on unmount.
  useEffect(() => {
    return () => value.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    // Intentionally empty deps: run cleanup only on unmount. Per-item revocation
    // on removal is handled in `remove()`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFiles(event) {
    const files = Array.from(event.target.files ?? []);
    if (fileRef.current) fileRef.current.value = "";

    const accepted = [];
    for (const file of files) {
      const error = validateImageFile(file);
      if (error) {
        showToast.error(`Skipped ${file.name}`, error);
        continue;
      }
      accepted.push({
        file,
        previewUrl: URL.createObjectURL(file),
        altText: "",
        // First image staged becomes the cover, unless one already is.
        isPrimary: false,
      });
    }
    if (!accepted.length) return;

    const next = [...value, ...accepted];
    if (!next.some((i) => i.isPrimary)) next[0].isPrimary = true;
    onChange(next);
  }

  function remove(index) {
    const removed = value[index];
    URL.revokeObjectURL(removed.previewUrl);
    const next = value.filter((_, i) => i !== index);
    // If the cover was removed, promote the first remaining image.
    if (removed.isPrimary && next.length && !next.some((i) => i.isPrimary)) {
      next[0].isPrimary = true;
    }
    onChange(next);
  }

  function setPrimary(index) {
    onChange(value.map((img, i) => ({ ...img, isPrimary: i === index })));
  }

  function setAlt(index, altText) {
    onChange(value.map((img, i) => (i === index ? { ...img, altText } : img)));
  }

  return (
    <section className="space-y-4">
      <h2 className="text-[13px] uppercase tracking-[0.12em] text-white/40">Images</h2>

      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((img, i) => (
            <div
              key={img.previewUrl}
              className="group relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-white/5"
            >
              {/* Local preview — a plain <img> on a blob: URL, which next/image
                  cannot optimize and does not need to. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.previewUrl}
                alt={img.altText || ""}
                className="h-full w-full object-contain"
              />

              {img.isPrimary && (
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-[#D4AF37] px-2 py-0.5 text-[10px] font-semibold text-black">
                  <Star className="h-3 w-3 fill-black" strokeWidth={0} />
                  Cover
                </span>
              )}

              <div className="absolute inset-0 flex items-end justify-end gap-1.5 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                {!img.isPrimary && (
                  <button
                    type="button"
                    onClick={() => setPrimary(i)}
                    aria-label="Set as cover"
                    className="rounded-md bg-black/60 p-2 text-white/80 transition-colors hover:text-[#D4AF37]"
                  >
                    <Star className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label="Remove image"
                  className="rounded-md bg-black/60 p-2 text-white/80 transition-colors hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>

              <input
                value={img.altText}
                onChange={(e) => setAlt(i, e.target.value)}
                placeholder="Alt text"
                className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-black/60 px-2 py-1.5 text-[11px] text-white placeholder:text-white/30 focus:bg-black/80 focus:outline-none"
              />
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept={IMAGE_ACCEPT_ATTR}
        multiple
        onChange={handleFiles}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 py-6 text-[14px] text-white/70 transition-colors hover:border-white/40"
      >
        <UploadCloud className="h-4 w-4" strokeWidth={1.75} />
        {value.length ? "Add more images" : "Choose images"}
      </button>

      <div className="flex items-start gap-2 text-[12px] text-white/30">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
        <span>
          JPG, PNG, or WEBP · up to 10&nbsp;MB · uploaded after the product is
          created.
        </span>
      </div>
    </section>
  );
}
