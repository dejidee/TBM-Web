"use client";

import { useState } from "react";
import { CalendarX2, MapPin, Video, XCircle, CheckCircle2 } from "lucide-react";

import { useAdminConsultations, useCancelAdminConsultation } from "@/hooks/use-admin-consultations";
import { formatFee } from "@/lib/api/consultations";
import { consultationStatusChip, consultationStatusLabel } from "@/lib/theme/status";
import { showToast } from "@/components/shared/toast";
import CancelConsultationModal from "./cancel-modal";

const PAGE_SIZE = 20;

// `status` is passed straight through as the backend's own string — these are
// the three values observed live, not an invented set.
const FILTERS = [
  { label: "All", value: "" },
  { label: "Pending payment", value: "PendingPayment" },
  { label: "Confirmed", value: "Confirmed" },
  { label: "Cancelled", value: "Cancelled" },
];

function StatusChip({ status }) {
  const c = consultationStatusChip(status);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${c.bg} ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {consultationStatusLabel(status)}
    </span>
  );
}

function formatWhen(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-NG", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

function Format({ format }) {
  const onSite = format === "InPerson";
  return (
    <span className="inline-flex items-center gap-1 text-[12px] text-white/45">
      {onSite ? <MapPin size={12} /> : <Video size={12} />}
      {onSite ? "On site" : "Video"}
    </span>
  );
}

function Payment({ item }) {
  if (item.fee === 0) return <span className="text-[12px] text-white/45">Free</span>;
  return (
    <span className={`inline-flex items-center gap-1 text-[12px] ${item.paymentVerified ? "text-success" : "text-warning"}`}>
      {item.paymentVerified ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
      {formatFee(item.fee)} · {item.paymentVerified ? "paid" : "unpaid"}
    </span>
  );
}

/** Day-granular date inputs; the API takes instants, so send the day's bounds. */
function toUtcRange(from, to) {
  const params = {};
  if (from) params.fromUtc = new Date(`${from}T00:00:00`).toISOString();
  if (to) params.toUtc = new Date(`${to}T23:59:59.999`).toISOString();
  return params;
}

export default function AdminConsultationBookings() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [cancelling, setCancelling] = useState(null);

  const { data, isLoading, isError, error } = useAdminConsultations({
    page,
    pageSize: PAGE_SIZE,
    ...(status ? { status } : {}),
    ...toUtcRange(from, to),
  });
  const cancel = useCancelAdminConsultation();

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const filtered = Boolean(status || from || to);

  function confirmCancel(reason) {
    const target = cancelling;
    cancel.mutate(
      { id: target.id, reason },
      {
        onSuccess: (res) => {
          setCancelling(null);
          // The policy outcome ("Free consultation cancelled." / refund text)
          // is the backend's message, not ours.
          showToast.success("Booking cancelled", res?.message || `${target.contactName}'s booking was cancelled.`);
        },
        onError: (err) => showToast.error("Could not cancel", err.message),
      },
    );
  }

  const canCancel = (item) => item.status !== "Cancelled" && new Date(item.scheduledEnd) > new Date();

  const dateInput =
    "min-h-11 rounded-lg border border-white/10 bg-white/04 px-3 text-[13px] text-white outline-none focus:border-[#D4AF37]/50 [color-scheme:dark]";

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const active = status === f.value;
          return (
            <button
              key={f.label}
              onClick={() => { setStatus(f.value); setPage(1); }}
              className={`min-h-11 rounded-lg border px-4 text-[13px] font-medium transition-colors ${
                active
                  ? "border-[#D4AF37]/50 bg-[#D4AF37]/10 text-[#D4AF37]"
                  : "border-white/10 text-white/50 hover:border-white/25 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          );
        })}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="from">From</label>
          <input id="from" type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className={dateInput} />
          <span className="text-[12px] text-white/30">to</span>
          <label className="sr-only" htmlFor="to">To</label>
          <input id="to" type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className={dateInput} />
          {(from || to) && (
            <button
              onClick={() => { setFrom(""); setTo(""); setPage(1); }}
              className="min-h-11 px-3 text-[12px] text-white/45 hover:text-white"
            >
              Clear dates
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-white/08 p-4" style={{ background: "#0d0b08" }}>
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-white/08" />
                  <div className="h-3 w-1/2 rounded bg-white/05" />
                </div>
                <div className="h-6 w-24 rounded-full bg-white/06" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/06 p-6 text-center">
          <p className="text-[14px] font-medium text-white">Could not load bookings</p>
          <p className="mt-1.5 text-[13px] text-white/45">{error?.message}</p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && items.length === 0 && (
        <div className="rounded-xl border border-white/08 p-10 text-center" style={{ background: "#0d0b08" }}>
          <CalendarX2 className="mx-auto h-8 w-8 text-white/20" strokeWidth={1.5} />
          <p className="mt-4 text-[15px] font-medium text-white">
            {filtered ? "No bookings match these filters" : "No consultations booked yet"}
          </p>
          <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-white/40">
            {filtered
              ? "Try a different status or widen the date range."
              : "Bookings made on the public consultation page will appear here."}
          </p>
        </div>
      )}

      {!isLoading && !isError && items.length > 0 && (
        <>
          {/* Desktop Table View */}
          <div className="hidden overflow-hidden rounded-xl border border-white/08 md:block">
            <table className="w-full" style={{ background: "#0d0b08" }}>
              <thead>
                <tr className="border-b border-white/08 text-left">
                  {["Customer", "Consultation", "When", "Payment", "Status", ""].map((h, i) => (
                    <th key={i} className={`px-4 py-3 text-[12px] font-medium uppercase tracking-wider text-white/35 ${i === 5 ? "text-right" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/06">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-white/02">
                    <td className="px-4 py-3">
                      <p className="text-[14px] font-medium text-white">{item.contactName}</p>
                      <p className="text-[12px] text-white/35">{item.contactPhone} · {item.contactEmail}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[13px] text-white/80">{item.typeName}</p>
                      <p className="mt-0.5 flex items-center gap-2">
                        <Format format={item.format} />
                        {item.siteCity && <span className="text-[12px] text-white/35">{item.siteCity}, {item.siteState}</span>}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-white/70">{formatWhen(item.scheduledStart)}</td>
                    <td className="px-4 py-3"><Payment item={item} /></td>
                    <td className="px-4 py-3"><StatusChip status={item.status} /></td>
                    <td className="px-4 py-3 text-right">
                      {canCancel(item) && (
                        <button
                          onClick={() => setCancelling(item)}
                          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-white/12 px-3 text-[12px] font-medium text-white/70 transition-colors hover:border-danger/40 hover:text-danger"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="space-y-3 md:hidden">
            {items.map((item) => (
              <div key={item.id} className="rounded-xl border border-white/08 p-4" style={{ background: "#0d0b08" }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-semibold leading-snug text-white">{item.contactName}</h3>
                    <p className="mt-0.5 text-[13px] text-white/60">{item.typeName}</p>
                  </div>
                  <StatusChip status={item.status} />
                </div>
                <dl className="mt-4 space-y-1.5">
                  <div className="flex justify-between gap-3">
                    <dt className="text-[12px] text-white/35">When</dt>
                    <dd className="text-[12px] text-white/70">{formatWhen(item.scheduledStart)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[12px] text-white/35">Payment</dt>
                    <dd><Payment item={item} /></dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[12px] text-white/35">Contact</dt>
                    <dd className="text-right text-[12px] text-white/60">{item.contactPhone}</dd>
                  </div>
                </dl>
                {canCancel(item) && (
                  <button
                    onClick={() => setCancelling(item)}
                    className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/12 px-4 text-[13px] font-medium text-white/80"
                  >
                    <XCircle className="h-4 w-4" /> Cancel booking
                  </button>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="min-h-11 rounded-lg border border-white/12 px-4 text-[13px] text-white/70 disabled:opacity-30">
                Previous
              </button>
              <span className="text-[13px] text-white/35">Page {page} of {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="min-h-11 rounded-lg border border-white/12 px-4 text-[13px] text-white/70 disabled:opacity-30">
                Next
              </button>
            </div>
          )}
        </>
      )}

      <CancelConsultationModal
        consultation={cancelling}
        onClose={() => !cancel.isPending && setCancelling(null)}
        onConfirm={confirmCancel}
        isPending={cancel.isPending}
      />
    </div>
  );
}
