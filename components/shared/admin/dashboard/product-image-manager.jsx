"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Star, Trash2, UploadCloud, Loader2, AlertTriangle } from "lucide-react";
import {
  useAdminUploadProductImage,
  useAdminDeleteProductImage,
  useAdminSetPrimaryImage,
} from "@/hooks/use-admin-products";
import { showToast } from "@/components/shared/toast";
import {
  IMAGE_ACCEPT_ATTR,
  validateImageFile,
} from "@/lib/validations/admin-product";

/**
 * Upload, delete, and set-primary for a product's images.
 *
 * Images can only be attached to a product that already exists, so this appears
 * on the edit page, never on create.
 *
 * State is held locally, seeded once from props and updated from each mutation's
 * authoritative response — the upload endpoint returns the created image, and
 * delete/set-primary outcomes are known. This is deliberate: the product detail
 * route (`/api/products/{id}`) caches for 120s, so refetching after an upload
 * would show a stale list and the admin would not see the image they just added.
 * An editor trusts the mutation result, it does not round-trip a cache.
 */
export default function ProductImageManager({ productId, images: initialImages = [] }) {
  const fileRef = useRef(null);
  const [altText, setAltText] = useState("");
  const [images, setImages] = useState(initialImages);
  const [makePrimary, setMakePrimary] = useState(initialImages.length === 0);

  const { mutate: upload, isPending: isUploading } = useAdminUploadProductImage();
  const { mutate: remove, isPending: isRemoving } = useAdminDeleteProductImage();
  const { mutate: setPrimary, isPending: isSettingPrimary } = useAdminSetPrimaryImage();

  const sorted = [...images].sort((a, b) => a.displayOrder - b.displayOrder);

  function handleFile(event) {
    const file = event.target.files?.[0];
    if (file) validateAndUpload(file);
    // Reset so selecting the same file again re-triggers change.
    if (fileRef.current) fileRef.current.value = "";
  }

  function validateAndUpload(file) {
    const error = validateImageFile(file);
    if (error) {
      showToast.error("Can't use that file", error);
      return;
    }
    upload(
      {
        productId,
        file,
        opts: {
          altText: altText.trim() || undefined,
          isPrimary: makePrimary,
          // Append after the current last image.
          displayOrder: sorted.length + 1,
        },
      },
      {
        onSuccess: (res) => {
          const created = res?.data;
          if (created) {
            // The response is the created image — the source of truth. If it
            // came back primary, demote the others locally to match.
            setImages((prev) =>
              (created.isPrimary ? prev.map((i) => ({ ...i, isPrimary: false })) : prev).concat(
                created,
              ),
            );
          }
          showToast.success("Image uploaded");
          setAltText("");
          setMakePrimary(false);
        },
        onError: (err) => showToast.error("Upload failed", err.message),
      },
    );
  }

  function handleDelete(image) {
    remove(image.id, {
      onSuccess: () => {
        setImages((prev) => prev.filter((i) => i.id !== image.id));
        showToast.success("Image removed");
      },
      onError: (err) => showToast.error("Could not remove image", err.message),
    });
  }

  function handleSetPrimary(image) {
    if (image.isPrimary) return;
    setPrimary(
      { productId, imageId: image.id },
      {
        onSuccess: () => {
          setImages((prev) =>
            prev.map((i) => ({ ...i, isPrimary: i.id === image.id })),
          );
          showToast.success("Primary image updated");
        },
        onError: (err) => showToast.error("Could not set primary", err.message),
      },
    );
  }

  const busy = isUploading || isRemoving || isSettingPrimary;

  return (
    <section className="space-y-4">
      <h2 className="text-[13px] uppercase tracking-[0.12em] text-white/40">Images</h2>

      {/* Existing images */}
      {sorted.length === 0 ? (
        <p className="text-[13px] text-white/40">
          No images yet. Upload at least one — it becomes the product&rsquo;s cover.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {sorted.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-white/5"
            >
              <Image
                src={img.imageUrl}
                alt={img.altText ?? ""}
                fill
                sizes="(max-width: 640px) 50vw, 200px"
                className="object-contain"
              />

              {img.isPrimary && (
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-[#D4AF37] px-2 py-0.5 text-[10px] font-semibold text-black">
                  <Star className="h-3 w-3 fill-black" strokeWidth={0} />
                  Cover
                </span>
              )}

              {/* Hover actions — always reachable on touch via opacity-100 on focus-within */}
              <div className="absolute inset-0 flex items-end justify-end gap-1.5 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                {!img.isPrimary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(img)}
                    disabled={busy}
                    aria-label="Set as cover"
                    className="rounded-md bg-black/60 p-2 text-white/80 transition-colors hover:text-[#D4AF37] disabled:opacity-40"
                  >
                    <Star className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(img)}
                  disabled={busy}
                  aria-label="Delete image"
                  className="rounded-md bg-black/60 p-2 text-white/80 transition-colors hover:text-red-400 disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload control */}
      <div className="space-y-3 rounded-xl border border-white/10 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-white/60" htmlFor="altText">
              Alt text (optional)
            </label>
            <input
              id="altText"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Front view"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-[14px] text-white placeholder:text-white/25 focus:border-[#D4AF37]/60 focus:outline-none"
            />
          </div>
          <label className="flex items-end gap-3 pb-2.5">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[#D4AF37]"
              checked={makePrimary}
              onChange={(e) => setMakePrimary(e.target.checked)}
            />
            <span className="text-[14px] text-white/80">Make this the cover image</span>
          </label>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept={IMAGE_ACCEPT_ATTR}
          onChange={handleFile}
          disabled={busy}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 py-6 text-[14px] text-white/70 transition-colors hover:border-white/40 disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <UploadCloud className="h-4 w-4" strokeWidth={1.75} />
              Choose an image
            </>
          )}
        </button>

        <div className="flex items-start gap-2 text-[12px] text-white/30">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
          <span>JPG, PNG, or WEBP · up to 10&nbsp;MB · validated before upload.</span>
        </div>
      </div>
    </section>
  );
}
