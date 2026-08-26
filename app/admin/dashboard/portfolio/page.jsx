"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, ImageOff, Eye, Undo2, ExternalLink } from "lucide-react";

import {
  useAdminPortfolio,
  usePublishPortfolioProject,
  useUpdatePortfolioStatus,
} from "@/hooks/use-admin-portfolio";
import { PORTFOLIO_STATUS } from "@/lib/api/admin";
import { showToast } from "@/components/shared/toast";

const PAGE_SIZE = 20;

const FILTERS = [
  { label: "All", value: "" },
  { label: "Published", value: PORTFOLIO_STATUS.Published },
  { label: "Draft", value: PORTFOLIO_STATUS.Draft },
  { label: "Rejected", value: PORTFOLIO_STATUS.Rejected },
];

/** Chip colours come from the status, never from a literal at the call site. */
function statusChip(status) {
  switch (status) {
    case "Published":
      return "bg-emerald-500/12 text-emerald-300 border-emerald-500/25";
    case "Draft":
      return "bg-amber-500/12 text-amber-300 border-amber-500/25";
    case "Rejected":
      return "bg-red-500/12 text-red-300 border-red-500/25";
    default:
      return "bg-white/06 text-white/50 border-white/12";
  }
}

function imageCount(item) {
  const before = item.beforeImages?.length ?? 0;
  const after = item.afterImages?.length ?? 0;
  return { before, after, total: before + after };
}

export default function AdminPortfolioPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");

  const { data, isLoading, isError, error } = useAdminPortfolio({
    page,
    pageSize: PAGE_SIZE,
    ...(status === "" ? {} : { status }),
  });

  const publish = usePublishPortfolioProject();
  const updateStatus = useUpdatePortfolioStatus();

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const busyId = publish.variables ?? updateStatus.variables?.id ?? null;

  function handlePublish(item) {
    const { total } = imageCount(item);
    if (total === 0) {
      showToast.warning(
        "No images yet",
        "Add at least one before or after photo before publishing.",
      );
      return;
    }
    publish.mutate(item.id, {
      onSuccess: () => showToast.success("Published", `"${item.title}" is now live.`),
      onError: (err) => showToast.error("Could not publish", err.message),
    });
  }

  function handleUnpublish(item) {
    updateStatus.mutate(
      { id: item.id, status: PORTFOLIO_STATUS.Draft },
      {
        onSuccess: () =>
          showToast.success("Moved to draft", `"${item.title}" is off the public site.`),
        onError: (err) => showToast.error("Could not update", err.message),
      },
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Portfolio</h1>
          <p className="mt-1 text-[13px] text-white/40">
            {data ? `${data.totalCount} project${data.totalCount === 1 ? "" : "s"}` : " "}
            {" · "}
            <Link
              href="/project"
              target="_blank"
              className="inline-flex items-center gap-1 text-white/50 hover:text-white transition-colors"
            >
              View public page <ExternalLink className="h-3 w-3" />
            </Link>
          </p>
        </div>

        <Link
          href="/admin/dashboard/portfolio/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2.5 text-[13px] font-semibold text-black min-h-11"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          New project
        </Link>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const active = status === filter.value;
          return (
            <button
              key={filter.label}
              onClick={() => {
                setStatus(filter.value);
                setPage(1);
              }}
              className={`min-h-11 rounded-lg border px-4 text-[13px] font-medium transition-colors ${
                active
                  ? "border-[#D4AF37]/50 bg-[#D4AF37]/10 text-[#D4AF37]"
                  : "border-white/10 text-white/50 hover:text-white hover:border-white/25"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-white/08 p-4"
              style={{ background: "#0d0b08" }}
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-20 shrink-0 rounded-lg bg-white/06" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 rounded bg-white/08" />
                  <div className="h-3 w-1/3 rounded bg-white/05" />
                </div>
                <div className="h-6 w-20 rounded-full bg-white/06" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/06 p-6 text-center">
          <p className="text-[14px] font-medium text-white">
            Could not load the portfolio
          </p>
          <p className="mt-1.5 text-[13px] text-white/45">{error?.message}</p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && items.length === 0 && (
        <div
          className="rounded-xl border border-white/08 p-10 text-center"
          style={{ background: "#0d0b08" }}
        >
          <ImageOff className="mx-auto h-8 w-8 text-white/20" strokeWidth={1.5} />
          <p className="mt-4 text-[15px] font-medium text-white">
            {status === "" ? "No projects yet" : "Nothing with this status"}
          </p>
          <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-white/40">
            {status === ""
              ? "Add a completed project with before and after photos — it is what the public Projects page renders."
              : "Try a different filter."}
          </p>
          {status === "" && (
            <Link
              href="/admin/dashboard/portfolio/new"
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#D4AF37] px-5 text-[13px] font-semibold text-black"
            >
              <Plus className="h-4 w-4" /> New project
            </Link>
          )}
        </div>
      )}

      {!isLoading && !isError && items.length > 0 && (
        <>
          {/* ── Desktop Table View ── */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-white/08">
            <table className="w-full" style={{ background: "#0d0b08" }}>
              <thead>
                <tr className="border-b border-white/08 text-left">
                  <th className="px-4 py-3 text-[12px] font-medium uppercase tracking-wider text-white/35">
                    Project
                  </th>
                  <th className="px-4 py-3 text-[12px] font-medium uppercase tracking-wider text-white/35">
                    Category
                  </th>
                  <th className="px-4 py-3 text-[12px] font-medium uppercase tracking-wider text-white/35">
                    Before / After
                  </th>
                  <th className="px-4 py-3 text-[12px] font-medium uppercase tracking-wider text-white/35">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-[12px] font-medium uppercase tracking-wider text-white/35">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/06">
                {items.map((item) => {
                  const counts = imageCount(item);
                  const busy = busyId === item.id;
                  return (
                    <tr key={item.id} className="hover:bg-white/02">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-white/04">
                            {item.thumbnailUrl ? (
                              <Image
                                src={item.thumbnailUrl}
                                alt=""
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            ) : (
                              <span className="grid h-full w-full place-items-center">
                                <ImageOff className="h-4 w-4 text-white/20" />
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-[14px] font-medium text-white">
                              {item.title}
                            </p>
                            <p className="truncate text-[12px] text-white/35">
                              {item.location}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-white/55">
                        {item.category}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[13px] ${counts.total === 0 ? "text-amber-300/80" : "text-white/55"}`}
                        >
                          {counts.before} / {counts.after}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusChip(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {item.status === "Published" ? (
                            <button
                              onClick={() => handleUnpublish(item)}
                              disabled={busy}
                              className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-white/12 px-3 text-[12px] font-medium text-white/70 transition-colors hover:text-white disabled:opacity-40"
                            >
                              <Undo2 className="h-3.5 w-3.5" /> Unpublish
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePublish(item)}
                              disabled={busy}
                              className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-[#D4AF37] px-3 text-[12px] font-semibold text-black disabled:opacity-40"
                            >
                              <Eye className="h-3.5 w-3.5" /> Publish
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Mobile Card View ── */}
          <div className="md:hidden space-y-3">
            {items.map((item) => {
              const counts = imageCount(item);
              const busy = busyId === item.id;
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-white/08 p-4"
                  style={{ background: "#0d0b08" }}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-white/04">
                      {item.thumbnailUrl ? (
                        <Image
                          src={item.thumbnailUrl}
                          alt=""
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="grid h-full w-full place-items-center">
                          <ImageOff className="h-4 w-4 text-white/20" />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-[15px] font-semibold leading-snug text-white">
                        {item.title}
                      </h3>
                      <span
                        className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusChip(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <dl className="mt-4 space-y-1.5">
                    <div className="flex justify-between gap-3">
                      <dt className="text-[12px] text-white/35">Location</dt>
                      <dd className="text-[12px] text-white/60">{item.location}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-[12px] text-white/35">Before / After</dt>
                      <dd
                        className={`text-[12px] ${counts.total === 0 ? "text-amber-300/80" : "text-white/60"}`}
                      >
                        {counts.before} / {counts.after}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-4">
                    {item.status === "Published" ? (
                      <button
                        onClick={() => handleUnpublish(item)}
                        disabled={busy}
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/12 px-4 text-[13px] font-medium text-white/80 disabled:opacity-40"
                      >
                        <Undo2 className="h-4 w-4" /> Unpublish
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePublish(item)}
                        disabled={busy}
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#D4AF37] px-4 text-[13px] font-semibold text-black disabled:opacity-40"
                      >
                        <Eye className="h-4 w-4" /> Publish
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="min-h-11 rounded-lg border border-white/12 px-4 text-[13px] text-white/70 disabled:opacity-30"
              >
                Previous
              </button>
              <span className="text-[13px] text-white/35">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="min-h-11 rounded-lg border border-white/12 px-4 text-[13px] text-white/70 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
