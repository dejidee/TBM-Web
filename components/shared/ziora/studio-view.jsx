"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ImageIcon,
  Video,
  UploadCloud,
  Loader2,
  CheckCircle,
  AlertCircle,
  Wand2,
  ChevronDown,
  ArrowLeft,
  Check,
  X,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useUploadRoom,
  useCreateAIProject,
  useGenerateImage,
  useGenerateVideo,
  useAIStyles,
} from "@/hooks/use-ai-services";
import { useSubscriptionState } from "@/hooks/use-subscription";

const GOLD = "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)";

const OUTPUT_TYPES = [
  {
    id: 1,
    label: "Still Image",
    sublabel: "A single high-resolution render of your redesigned space",
    Icon: ImageIcon,
  },
  {
    id: 2,
    label: "Video Tour",
    sublabel: "An animated walkthrough that brings the space to life",
    Icon: Video,
  },
];

const CONTEXT_CATEGORIES = [
  {
    label: "Interior Design",
    tags: [
      "Living room design",
      "Bedroom design",
      "Kitchen design",
      "Bathroom design",
      "Office interior",
      "Commercial interior",
      "Minimalist interior",
      "Luxury interior",
      "Modern interior",
      "Contemporary interior",
      "Traditional interior",
    ],
  },
  {
    label: "Construction",
    tags: [
      "Residential construction",
      "Commercial construction",
      "Renovation",
      "Remodeling",
      "Structural work",
      "Finishing work",
      "Civil works",
      "Drywall installation",
      "Flooring installation",
      "Roofing",
      "Plumbing",
      "Electrical works",
      "Painting & finishing",
    ],
  },
  {
    label: "Furniture",
    tags: [
      "Sofas",
      "Chairs",
      "Tables",
      "Wardrobes",
      "Cabinets",
      "TV units",
      "Bed frames",
      "Shelving",
      "Office desks",
      "Reception desks",
    ],
  },
  {
    label: "Materials",
    tags: [
      "Wood",
      "MDF",
      "Plywood",
      "Marble",
      "Granite",
      "Tiles",
      "PVC panels",
      "Gypsum board",
      "Concrete",
      "Steel",
      "Aluminum",
      "Glass",
      "Laminate",
      "Veneer",
    ],
  },
];

const EXAMPLE_PROMPTS = [
  "Modern minimalist living room with warm wood tones and natural light",
  "Luxury bedroom with floor-to-ceiling windows and neutral palette",
  "Contemporary kitchen with marble island and open shelving",
  "Cosy home office with built-in shelves and earthy tones",
];

const GENERATION_STAGES = [
  "Analysing your description…",
  "Mapping Nigerian materials and context…",
  "Rendering spatial layout…",
  "Applying lighting and textures…",
  "Finalising your design…",
];

function useGenerationStage(active) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!active) {
      setIndex(0);
      return;
    }
    const id = setInterval(
      () => setIndex((i) => (i + 1) % GENERATION_STAGES.length),
      3200,
    );
    return () => clearInterval(id);
  }, [active]);
  return GENERATION_STAGES[index];
}

/**
 * A numbered section heading.
 *
 * Deliberately icon-free: the numbered badge is already the marker, and the
 * icons that used to sit beside it repeated across sections (a wand for both
 * "what to create" and "describe", sparkles for both "style" and "context").
 * A repeated icon carries no information — it is decoration competing with the
 * number for the same job.
 */
function SectionHeader({ n, title, hint, optional, action }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-black"
          style={{ background: GOLD }}
        >
          {n}
        </span>
        {/* Larger and tighter than body copy so the five sections are scannable
            — previously text-base sat almost level with the 15px body text. */}
        <h2 className="text-[17px] font-bold tracking-[-0.01em] text-white">{title}</h2>
        {optional && (
          <span className="rounded-full border border-white/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/35">
            Optional
          </span>
        )}
        {action && <div className="ml-auto">{action}</div>}
      </div>
      {hint && <p className="mt-1.5 pl-[34px] text-[13px] text-white/40">{hint}</p>}
    </div>
  );
}

/**
 * A style tile. Images are curated assets at `public/ai-styles/{id}.webp`.
 * They may not exist yet — a missing image degrades to a deterministic swatch
 * derived from the style id, so the grid always looks intentional and photos
 * simply appear once dropped in. The image is decorative, so a plain <img> with
 * an onError fallback is the simplest correct control.
 */
function StyleTile({ style, selected, onSelect }) {
  const [failed, setFailed] = useState(false);
  const hue = [...style.id].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`group relative aspect-4/3 overflow-hidden rounded-xl border text-left transition-all ${
        selected
          ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/40"
          : "border-white/10 hover:border-white/30"
      }`}
    >
      {failed ? (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, hsl(${hue} 32% 20%), hsl(${(hue + 45) % 360} 28% 11%))`,
          }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/ai-styles/${style.id}.webp`}
          alt={style.name}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

      {selected && (
        <span
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-black"
          style={{ background: GOLD }}
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      )}

      <span className="absolute inset-x-0 bottom-0 px-3 py-2 text-[13px] font-semibold text-white">
        {style.name}
      </span>
    </button>
  );
}

/**
 * The style grid holds only real styles. Opting out lives in the section header
 * as a "Clear" action — as a tile it took the first and most prominent slot, so
 * the eye met "no style" before any style, and it made an odd 11th tile that
 * left a ragged last row in a 3-column grid.
 */
function StyleGrid({ value, onChange }) {
  const { data: styles, isLoading, isError } = useAIStyles();

  if (isError) {
    return (
      <p className="text-[13px] text-white/35">
        Styles couldn&rsquo;t load — you can still generate without one.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {isLoading
        ? Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-4/3 animate-pulse rounded-xl bg-white/5" />
          ))
        : (styles ?? []).map((s) => (
            <StyleTile
              key={s.id}
              style={s}
              selected={value === s.id}
              onSelect={() => onChange(s.id)}
            />
          ))}
    </div>
  );
}

function ContextTagPicker({ contextTags, setContextTags }) {
  const [openCategory, setOpenCategory] = useState(null);
  const toggle = (tag) =>
    setContextTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  return (
    <div
      className="overflow-hidden rounded-xl border border-white/10 divide-y divide-white/08"
      style={{ background: "#0d0b08" }}
    >
      {CONTEXT_CATEGORIES.map(({ label, tags }) => {
        const isOpen = openCategory === label;
        const count = tags.filter((t) => contextTags.includes(t)).length;
        return (
          <div key={label}>
            <button
              type="button"
              onClick={() => setOpenCategory(isOpen ? null : label)}
              className="flex w-full items-center justify-between px-3 py-3 transition-colors hover:bg-white/03"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                  {label}
                </span>
                {count > 0 && (
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-none text-black"
                    style={{ background: GOLD }}
                  >
                    {count}
                  </span>
                )}
              </div>
              <ChevronDown
                className={`h-4 w-4 text-white/30 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div
                    className="flex flex-wrap gap-2 px-3 pb-3 pt-1"
                    style={{ background: "rgba(255,255,255,0.02)" }}
                  >
                    {tags.map((tag) => {
                      const active = contextTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggle(tag)}
                          className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-all"
                          style={
                            active
                              ? { background: GOLD, color: "#000", border: "1px solid transparent" }
                              : {
                                  background: "transparent",
                                  color: "rgba(255,255,255,0.45)",
                                  border: "1px solid rgba(255,255,255,0.12)",
                                }
                          }
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
      {contextTags.length > 0 && (
        <div
          className="flex items-center justify-between px-3 py-2.5"
          style={{ background: "rgba(212,175,55,0.04)" }}
        >
          <p className="text-xs font-semibold text-[#D4AF37]">
            {contextTags.length} tag{contextTags.length !== 1 ? "s" : ""} selected
          </p>
          <button
            type="button"
            onClick={() => setContextTags([])}
            className="text-xs font-medium text-white/40 underline underline-offset-2 transition-colors hover:text-white"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * The studio shell — a chromeless surface with one bar of its own.
 *
 * There is no site navbar and no dashboard sidebar above this (see
 * app/ziora/studio/layout.jsx). Generation is a single sustained task with a
 * two-column body and a large image preview, so the ~16rem the sidebar would
 * take is handed back to the content, and the surrounding navigation — every
 * item of which is a way to abandon the task halfway — is gone.
 *
 * What replaces it is deliberately minimal: one way out, the mark, and the
 * number that governs whether the user can act at all. The bar is sticky
 * because the form is long enough to scroll past it, and an escape route you
 * have to scroll back up to find is not an escape route.
 *
 * A max-width belongs here — with no sidebar there is nothing else constraining
 * the column, and an unbounded form would sprawl on a wide monitor.
 */
function StudioShell({ children, quota }) {
  return (
    <div className="min-h-screen bg-black">
      <header
        className="sticky top-0 z-50 border-b border-white/07"
        style={{ background: "rgba(9,8,6,0.82)", backdropFilter: "blur(20px)" }}
      >
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard/ai-designs"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl pl-1 pr-3 text-[13px] font-medium text-white/60 transition-colors hover:text-white"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 transition-colors group-hover:border-white/25">
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <span className="hidden sm:inline">Back to My Designs</span>
          </Link>

          <div className="mx-auto flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-[#D4AF37]" strokeWidth={1.75} />
            <span className="text-[13px] font-semibold tracking-[0.18em] text-white/70 uppercase">
              Ziora Studio
            </span>
          </div>

          <div className="ml-auto shrink-0">{quota}</div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}

/** Compact remaining-generations chip. Silent while loading or when the plan
 *  does not expose a quota, so it never shows a misleading zero. */
function QuotaChip({ used, allowed, exhausted }) {
  if (allowed == null) return null;
  const left = Math.max(0, allowed - (used ?? 0));
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold ${
        exhausted
          ? "border-red-500/30 bg-red-500/8 text-red-300"
          : "border-white/12 bg-white/3 text-white/60"
      }`}
    >
      {exhausted ? "No generations left" : `${left} of ${allowed} generations left`}
    </span>
  );
}

export default function StudioView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const [outputType, setOutputType] = useState(1);
  const [styleId, setStyleId] = useState(null);
  // Seeded from `?prompt=`, which the empty gallery's starter ideas link with,
  // so "try one of these" lands on a form that is already half filled in rather
  // than the same blank box the user just declined. Read once, as the initial
  // value — after that the field is the user's, and editing it must not be
  // undone by a re-render.
  const [prompt, setPrompt] = useState(() => searchParams.get("prompt") ?? "");
  const [contextTags, setContextTags] = useState([]);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [step, setStep] = useState("form"); // form | generating | done | error
  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef(null);
  const uploadRoom = useUploadRoom();
  const createAIProject = useCreateAIProject();
  const generateImage = useGenerateImage();
  const generateVideo = useGenerateVideo();
  const generationStage = useGenerationStage(step === "generating");

  // Surfaced before the user invests effort. Without it they could fill the whole
  // form and only discover an exhausted quota when Generate failed.
  const { generationsUsed, generationsAllowed, quotaExhausted } = useSubscriptionState();

  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  const applyFile = useCallback(
    (chosen) => {
      if (!chosen) return;
      if (filePreview) URL.revokeObjectURL(filePreview);
      setFile(chosen);
      setFilePreview(URL.createObjectURL(chosen));
    },
    [filePreview],
  );

  const handleFileChange = (e) => {
    applyFile(e.target.files?.[0] ?? null);
    e.target.value = "";
  };
  const removeFile = () => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFile(null);
    setFilePreview(null);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && /^image\/(jpeg|png|webp)$/.test(dropped.type)) applyFile(dropped);
  };

  // `quotaExhausted` is only trusted when it is explicitly true — while the
  // subscription query is loading it is undefined, and blocking on that would
  // disable the button for everyone on first paint.
  const canSubmit =
    Boolean(prompt.trim()) && Boolean(file) && step === "form" && quotaExhausted !== true;

  /** The one reason the user cannot generate yet, most blocking first. */
  const blockReason =
    quotaExhausted === true
      ? "You've used all your generations"
      : !file && !prompt.trim()
        ? "Add a photo and a description"
        : !file
          ? "Add a photo of your space"
          : !prompt.trim()
            ? "Describe what you want"
            : null;

  const handleCreate = async () => {
    if (!canSubmit) return;
    setErrorMsg("");
    setStep("generating");
    try {
      let sourceImageUrl;
      if (file) {
        const uploadRes = await uploadRoom.mutateAsync(file);
        sourceImageUrl = uploadRes?.imageUrl;
        if (!sourceImageUrl) throw new Error("Image upload failed.");
      }
      const projectRes = await createAIProject.mutateAsync({
        sourceImageUrl,
        outputType,
        prompt,
        contextTags: contextTags.length > 0 ? contextTags : undefined,
      });
      const projectId =
        projectRes?.id ?? projectRes?.data?.id ?? projectRes?.data?.projectId;
      if (!projectId) throw new Error("Project creation failed.");

      // `style` is the id from GET /ai/styles, sent at generation time.
      const style = styleId || undefined;
      if (outputType === 1) {
        await generateImage.mutateAsync({ projectId, style });
      } else {
        await generateVideo.mutateAsync({ projectId, durationSeconds: 9, style });
      }

      setStep("done");
      queryClient.invalidateQueries({ queryKey: ["ai-projects"] });
    } catch (err) {
      const msg =
        err?.message ||
        (err?.status === 403 && err?.code === "subscription_quota_exceeded"
          ? "Your generation quota is used up. Upgrade your plan to continue."
          : "Something went wrong. Please try again.");
      setStep("error");
      setErrorMsg(msg);
    }
  };

  // ── Full-panel states ───────────────────────────────────────────────────────
  if (step === "generating" || step === "done" || step === "error") {
    return (
      <StudioShell>
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
          {step === "generating" && (
            <>
              <div className="relative">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ background: "rgba(212,175,55,0.10)" }}
                >
                  <Wand2 className="h-7 w-7 text-[#D4AF37]" />
                </div>
                <Loader2 className="absolute inset-0 h-16 w-16 animate-spin text-[#D4AF37]/30" />
              </div>
              <p className="mt-6 text-lg font-semibold text-white">
                Working on your {outputType === 2 ? "video tour" : "design"}…
              </p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={generationStage}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="mt-1.5 text-sm text-white/40"
                >
                  {generationStage}
                </motion.p>
              </AnimatePresence>
            </>
          )}

          {step === "done" && (
            <>
              <CheckCircle className="h-14 w-14 text-emerald-400" />
              <p className="mt-5 text-lg font-semibold text-white">
                {outputType === 2 ? "Video tour" : "Design"} created!
              </p>
              <p className="mt-1 text-sm text-white/40">Your result is ready in the gallery.</p>
              <button
                onClick={() => router.push("/dashboard/ai-designs")}
                className="mt-6 rounded-xl px-6 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90"
                style={{ background: GOLD }}
              >
                View my designs
              </button>
              <div className="mt-3 flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href="/contact?type=estimate"
                  className="rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-white/70 hover:border-white/30 hover:text-white transition-colors"
                >
                  Continue to Estimate
                </Link>
                <Link
                  href="/consultation"
                  className="rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-white/70 hover:border-white/30 hover:text-white transition-colors"
                >
                  Start Project with TBM
                </Link>
              </div>
            </>
          )}

          {step === "error" && (
            <>
              <AlertCircle className="h-14 w-14 text-red-400" />
              <p className="mt-5 text-lg font-semibold text-white">Something went wrong</p>
              <p className="mt-1 max-w-md text-sm text-white/40">{errorMsg}</p>
              <button
                onClick={() => setStep("form")}
                className="mt-6 rounded-xl px-6 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90"
                style={{ background: GOLD }}
              >
                Try again
              </button>
            </>
          )}
        </div>
      </StudioShell>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <StudioShell
      quota={
        <QuotaChip
          used={generationsUsed}
          allowed={generationsAllowed}
          exhausted={quotaExhausted}
        />
      }
    >
      <div className="w-full space-y-8 pb-28">
        <div>
          <h1 className="text-[28px] font-extrabold leading-tight text-white md:text-[32px]">
            Create a New Design
          </h1>
          <p className="mt-1.5 max-w-2xl text-[15px] font-medium text-white/50">
            Upload your room, choose a style, and describe the vision — Ziora renders the rest.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          {/* Left: the room (visual anchor) */}
          {/* `top-20` = the sticky studio bar (h-16) plus a 16px gap. At `top-4`
              the pinned upload panel slid underneath the bar on scroll. */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <SectionHeader
              n="1"
              title="Photo of your space"
              hint="Ziora redesigns this exact room. A clear, well-lit photo gives the best result."
            />
            <AnimatePresence mode="wait">
              {filePreview ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="relative overflow-hidden rounded-2xl border border-white/10"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={filePreview} alt="Your space" className="aspect-4/3 w-full object-cover" />
                  <button
                    type="button"
                    onClick={removeFile}
                    className="absolute right-3 top-3 rounded-lg bg-black/70 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-black/90"
                  >
                    Replace
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="dropzone"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-4/3 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center transition-colors"
                  style={
                    isDragging
                      ? { borderColor: "rgba(212,175,55,0.60)", background: "rgba(212,175,55,0.05)" }
                      : { borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.02)" }
                  }
                >
                  <UploadCloud
                    className={`h-12 w-12 ${isDragging ? "text-[#D4AF37]" : "text-white/25"}`}
                    strokeWidth={1.25}
                  />
                  <div>
                    <p className="text-sm font-medium text-white/70">
                      Drag a photo here, or{" "}
                      <span className="text-[#D4AF37] underline underline-offset-2">browse</span>
                    </p>
                    <p className="mt-1 text-xs text-white/30">JPG, PNG or WEBP · 1 image</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quiet helper text, not an alert. As an orange-bordered warning
                box this out-shouted the dropzone it was advising about, before
                the user had done anything wrong. The emoji bullet also broke the
                lucide icon language used everywhere else. */}
            {!filePreview && (
              <div className="mt-3">
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/30">
                  For best results, avoid
                </p>
                <ul className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
                  {[
                    "Low-res or tiny images",
                    "Blurry photos",
                    "Half-cropped rooms",
                    "Dark or poorly lit spaces",
                  ].map((wtext) => (
                    <li key={wtext} className="flex items-center gap-1.5 text-[11px] text-white/35">
                      <X className="h-3 w-3 shrink-0 text-white/20" strokeWidth={2.5} />
                      {wtext}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
            />
          </div>

          {/* Right: options */}
          <div className="space-y-9">
            <div>
              <SectionHeader
                n="2"
                title="Choose a style"
                optional
                hint="Pick a look to steer the result, or leave it open."
                action={
                  styleId && (
                    <button
                      type="button"
                      onClick={() => setStyleId(null)}
                      className="text-xs font-medium text-white/40 underline underline-offset-2 transition-colors hover:text-white"
                    >
                      Clear
                    </button>
                  )
                }
              />
              <StyleGrid value={styleId} onChange={setStyleId} />
            </div>

            <div>
              <SectionHeader n="3" title="What should Ziora create?" />
              <div className="grid grid-cols-2 gap-3">
                {OUTPUT_TYPES.map(({ id, label, sublabel, Icon }) => {
                  const active = outputType === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setOutputType(id)}
                      className="flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all"
                      style={
                        active
                          ? { borderColor: "rgba(212,175,55,0.50)", background: "rgba(212,175,55,0.06)" }
                          : { borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }
                      }
                    >
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-lg"
                        style={active ? { background: GOLD } : { background: "rgba(255,255,255,0.06)" }}
                      >
                        <Icon className={`h-5 w-5 ${active ? "text-black" : "text-white/40"}`} />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${active ? "text-[#D4AF37]" : "text-white/70"}`}>
                          {label}
                        </p>
                        <p className={`mt-0.5 text-xs leading-snug ${active ? "text-[#D4AF37]/60" : "text-white/35"}`}>
                          {sublabel}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <SectionHeader
                n="4"
                title="Describe the space you want"
                hint="The more specific — materials, colours, mood, lighting — the better."
              />
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && e.metaKey && handleCreate()}
                rows={4}
                placeholder={
                  outputType === 2
                    ? "e.g. A cinematic walk-through of a modern open-plan living space with warm evening lighting…"
                    : "e.g. A modern minimalist bedroom with warm tones, linen textures, built-in wardrobes and soft ambient lighting…"
                }
                className="w-full resize-none rounded-xl border border-white/10 px-4 py-3.5 text-sm leading-relaxed text-white placeholder-white/25 outline-none transition-colors focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20"
                style={{ background: "#1a1a1a" }}
              />
              {!prompt && (
                <div className="mt-2.5">
                  <p className="mb-1.5 text-xs font-medium text-white/35">Try an example:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {EXAMPLE_PROMPTS.map((ex) => (
                      <button
                        key={ex}
                        type="button"
                        onClick={() => setPrompt(ex)}
                        className="rounded-full px-2.5 py-1 text-xs font-medium text-white/45 transition-colors hover:text-[#D4AF37]"
                        style={{ border: "1px solid rgba(255,255,255,0.12)" }}
                      >
                        {ex.length > 42 ? ex.slice(0, 42) + "…" : ex}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <SectionHeader
                n="5"
                title="Add context"
                optional
                hint="Tag the room type, materials, or scope to guide Ziora."
              />
              <ContextTagPicker contextTags={contextTags} setContextTags={setContextTags} />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky action bar — always reachable without scrolling to the bottom.
          Matches the page black with a defined top border rather than sitting a
          shade lighter, which would read as a seam. */}
      <div className="sticky bottom-0 z-20 border-t border-white/10 bg-black/95 backdrop-blur">
        <div className="flex w-full flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Shown on every breakpoint. Hiding this on mobile left a disabled
              button with no stated reason — exactly where the missing field is
              most likely to be scrolled out of view. */}
          <div className="min-w-0">
            <p className={`text-[13px] ${quotaExhausted === true ? "text-red-300" : "text-white/40"}`}>
              {blockReason ?? "Ready to generate"}
            </p>
            {quotaExhausted === true && (
              <Link
                href="/dashboard/ai-designs"
                className="text-[12px] font-semibold text-[#D4AF37] underline underline-offset-2"
              >
                See upgrade options
              </Link>
            )}
          </div>

          <motion.button
            whileTap={canSubmit ? { scale: 0.99 } : {}}
            onClick={handleCreate}
            disabled={!canSubmit}
            className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-8"
            style={{ background: GOLD }}
          >
            <Wand2 className="h-4 w-4" />
            {outputType === 2 ? "Generate Video Tour" : "Generate My Design"}
          </motion.button>
        </div>
      </div>
    </StudioShell>
  );
}
