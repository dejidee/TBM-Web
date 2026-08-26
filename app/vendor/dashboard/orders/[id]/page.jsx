"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Copy,
  MapPin,
  MessageSquare,
  Package,
} from "lucide-react";
import { useOrder, useAddOrderNote } from "@/hooks/use-orders";
import { showToast } from "@/components/shared/toast";

/**
 * Vendor order detail — GET /api/v1/vendor/orders/{orderId}.
 *
 * This page used to render `lib/mock/order-details.js`: a fabricated order with
 * invented line items, a VISA card with an expiry, a "member type", a carrier
 * status, a Google Maps placeholder and a hand-written activity timeline. None
 * of it came from the backend and none of those fields exist anywhere in its
 * surface — so those panels are gone rather than re-pointed at fields that do
 * not exist.
 *
 * What is left maps to things the API actually has: the order itself, its line
 * items, the shipping fields of CreateOrderDto, the delivery agent of
 * VendorOrderAssignmentRequest, and POST /vendor/orders/{id}/notes.
 *
 * Update, 2026-08-11: `POST /api/v1/orders` (the SQL sequence defect,
 * BACKLOG.md item 7) is fixed and the *Order* shape — id, orderNumber, status/
 * statusName, items[], shippingFullName/Phone/Address/City/State, subTotal/
 * shippingCost/tax/discount/total, customerNotes, createdAt — is confirmed
 * live (`GET /orders/{orderId}`, contracts/orders.json, lib/api/schemas/orders.ts).
 * `pick()` below is *kept*, not removed: it already tries the correct field
 * names first for every one of those, so it was silently correct the whole
 * time the shape was unknown. What is genuinely still unverified is whether
 * *this vendor-scoped detail endpoint* returns that same Order shape — the
 * only response seen from it is a 403 scope error
 * (`"Order is outside this vendor scope"`, confirmed live), because the order
 * placed to record the shape wasn't owned by the vendor account used to read
 * it. `pick()` staying defensive here is deliberate, not leftover caution.
 */

/** First present, non-null value among `keys`. */
function pick(obj, ...keys) {
  if (!obj) return undefined;
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
}

const DASH = "—";

/** Money is naira here — the mock rendered `$` on a catalogue priced in ₦. */
function money(value) {
  return typeof value === "number"
    ? `₦${value.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`
    : DASH;
}

function date(value) {
  if (!value) return DASH;
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? String(value)
    : d.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * OrderStatus is an integer enum whose names the spec does not publish
 * (CLAUDE.md: "0–7 without names"). Render the string when the backend sends
 * one, and the raw value otherwise — inventing labels for 0–7 is how a vendor
 * ends up reading "Delivered" off an order that is not.
 */
function StatusChip({ status }) {
  if (status === undefined || status === null) return null;
  const label = typeof status === "string" ? status : `Status ${status}`;
  return (
    <span className="px-3 py-1.5 rounded-lg bg-white/08 text-white font-manrope text-[12px] font-bold">
      {label}
    </span>
  );
}

function Panel({ title, action, children, delay = 0 }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-surface rounded-xl border border-white/08 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-manrope text-[16px] font-bold text-white">{title}</h2>
        {action}
      </div>
      {children}
    </motion.section>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="font-manrope text-[11px] font-bold text-muted uppercase tracking-wider shrink-0">
        {label}
      </span>
      <span className="font-manrope text-[13px] text-white text-right wrap-break-word min-w-0">
        {children ?? DASH}
      </span>
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id;

  const [note, setNote] = useState("");
  const { data: order, isLoading, isError, error } = useOrder(orderId);
  const addNote = useAddOrderNote();

  const items = Array.isArray(pick(order, "items", "orderItems", "lineItems"))
    ? pick(order, "items", "orderItems", "lineItems")
    : [];

  const trackingNumber = pick(order, "trackingNumber");

  function handleSaveNote() {
    const trimmed = note.trim();
    if (!trimmed) return;
    addNote.mutate(
      { orderId, note: trimmed },
      {
        onSuccess: () => {
          setNote("");
          showToast.success("Note added");
        },
        onError: (err) => showToast.error("Could not add note", err.message),
      },
    );
  }

  function handleCopyTracking() {
    if (!trackingNumber) return;
    navigator.clipboard.writeText(String(trackingNumber));
    showToast.success("Tracking number copied");
  }

  if (isLoading) {
    return (
      <div className="max-w-360 mx-auto space-y-6">
        <div className="h-8 w-40 animate-pulse rounded bg-white/05" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 animate-pulse rounded-xl bg-white/05" />
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-xl bg-white/05" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="max-w-360 mx-auto py-16 text-center">
        <p className="font-manrope text-[15px] text-white mb-2">
          {isError ? "Could not load this order" : "Order not found"}
        </p>
        <p className="font-manrope text-[13px] text-muted mb-6">
          {isError
            ? error?.message
            : "It may have been cancelled, or belong to another vendor."}
        </p>
        <button
          onClick={() => router.push("/vendor/dashboard/orders")}
          className="px-4 py-2.5 rounded-lg border border-white/10 font-manrope text-[13px] text-white hover:bg-white/05 transition-colors"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-360 mx-auto bg-background">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted hover:text-white font-manrope text-[14px] font-medium mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Orders
      </button>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <h1 className="font-manrope text-[28px] font-bold text-white">
          Order #{pick(order, "orderNumber", "number") ?? orderId}
        </h1>
        <StatusChip status={pick(order, "statusName", "status")} />
      </div>

      <p className="flex items-center gap-2 text-white font-semibold font-manrope text-[13px] mb-8">
        <span className="w-6 h-6 bg-white/08 rounded flex items-center justify-center">
          <Calendar className="text-white" strokeWidth={2} size={14} />
        </span>
        Placed on {date(pick(order, "placedAt", "createdAt", "orderDate"))}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Items ─────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface rounded-xl border border-white/08 overflow-hidden"
          >
            <div className="px-6 py-3 border-b border-white/08">
              <h2 className="font-manrope text-[16px] font-bold text-white">
                Items Ordered{items.length ? ` (${items.length})` : ""}
              </h2>
            </div>

            {items.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Package className="mx-auto mb-3 text-muted" size={28} strokeWidth={1.5} />
                <p className="font-manrope text-[13px] text-muted">
                  No line items on this order.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block">
                  <div className="px-6 py-3 bg-white/05 border-b border-white/08 grid grid-cols-[1fr_110px_70px_110px] gap-4">
                    {["Product", "Price", "Qty", "Total"].map((h, i) => (
                      <span
                        key={h}
                        className={`font-manrope text-[11px] font-bold text-muted uppercase tracking-wider ${
                          i === 0 ? "" : i === 2 ? "text-center" : "text-right"
                        }`}
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                  <div className="divide-y divide-white/08">
                    {items.map((item, index) => {
                      const price = pick(item, "unitPrice", "price");
                      const qty = pick(item, "quantity", "qty") ?? 0;
                      return (
                        <div
                          key={pick(item, "id", "productId") ?? index}
                          className="px-6 py-5 grid grid-cols-[1fr_110px_70px_110px] gap-4 items-center"
                        >
                          <div>
                            <h3 className="font-manrope text-[14px] font-medium text-white">
                              {pick(item, "productName", "name") ?? DASH}
                            </h3>
                            <p className="font-manrope text-[12px] text-muted">
                              {pick(item, "sku", "productSku") ?? DASH}
                            </p>
                          </div>
                          <span className="font-manrope text-[14px] text-white text-right">
                            {money(price)}
                          </span>
                          <span className="font-manrope text-[14px] text-white text-center">
                            {qty}
                          </span>
                          <span className="font-manrope text-[14px] font-bold text-white text-right">
                            {money(
                              pick(item, "total", "lineTotal", "subtotal") ??
                                (typeof price === "number" ? price * qty : undefined),
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile cards — a 4-column table does not survive a phone. */}
                <div className="md:hidden divide-y divide-white/08">
                  {items.map((item, index) => {
                    const price = pick(item, "unitPrice", "price");
                    const qty = pick(item, "quantity", "qty") ?? 0;
                    return (
                      <div key={pick(item, "id", "productId") ?? index} className="p-5 space-y-3">
                        <div>
                          <h3 className="font-manrope text-[14px] font-medium text-white">
                            {pick(item, "productName", "name") ?? DASH}
                          </h3>
                          <p className="font-manrope text-[12px] text-muted">
                            {pick(item, "sku", "productSku") ?? DASH}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-manrope text-[13px] text-muted">
                            {money(price)} × {qty}
                          </span>
                          <span className="font-manrope text-[14px] font-bold text-white">
                            {money(
                              pick(item, "total", "lineTotal", "subtotal") ??
                                (typeof price === "number" ? price * qty : undefined),
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <div className="p-6 bg-white/05 border-t border-white/08">
              <div className="space-y-3 max-w-md ml-auto">
                {[
                  ["Subtotal", pick(order, "subtotal", "subTotal")],
                  ["Shipping", pick(order, "shippingCost", "shipping")],
                  ["Tax", pick(order, "tax", "taxAmount")],
                  ["Discount", pick(order, "discount", "discountAmount")],
                ]
                  // A line that is absent is not the same as a line that is zero;
                  // only the ones the backend sent are shown.
                  .filter(([, value]) => typeof value === "number")
                  .map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="font-manrope text-[13px] text-muted">{label}</span>
                      <span className="font-manrope text-[14px] text-white">{money(value)}</span>
                    </div>
                  ))}
                <div className="pt-3 border-t border-white/08 flex items-center justify-between">
                  <span className="font-manrope text-[16px] font-bold text-white">Total</span>
                  <span className="font-manrope text-[18px] font-bold text-white">
                    {money(pick(order, "total", "totalAmount", "grandTotal"))}
                  </span>
                </div>
              </div>
            </div>
          </motion.section>
        </div>

        {/* ── Customer, delivery, notes ─────────────────────────────────── */}
        <div className="space-y-6">
          <Panel title="Customer" delay={0.1}>
            <div className="space-y-3">
              <Row label="Name">
                {pick(order, "userFullName", "customerName", "shippingFullName", "guestName")}
              </Row>
              <Row label="Email">{pick(order, "userEmail", "customerEmail", "guestEmail")}</Row>
              <Row label="Phone">
                {pick(order, "customerPhone", "shippingPhone", "guestPhone")}
              </Row>
            </div>
            <button
              type="button"
              onClick={() => router.push("/vendor/dashboard/messages")}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/05 border border-white/08 rounded-lg font-manrope text-[13px] font-medium text-white hover:bg-white/08 transition-colors"
            >
              <MessageSquare size={16} />
              Message Customer
            </button>
          </Panel>

          {/* The map was a grey box captioned "Google Maps" — no map was ever
              loaded. Dropped in favour of the address the order carries. */}
          <Panel
            title="Delivery"
            delay={0.15}
            action={<MapPin size={16} className="text-muted" />}
          >
            <div className="space-y-3">
              <Row label="Address">{pick(order, "shippingAddress", "address")}</Row>
              <Row label="City">{pick(order, "shippingCity", "city")}</Row>
              <Row label="State">{pick(order, "shippingState", "state")}</Row>
              <Row label="Agent">{pick(order, "deliveryAgentName")}</Row>
              <Row label="Agent phone">{pick(order, "deliveryAgentPhone")}</Row>
              <Row label="Tracking">
                {trackingNumber ? (
                  <span className="inline-flex items-center gap-2">
                    {trackingNumber}
                    <button
                      type="button"
                      onClick={handleCopyTracking}
                      aria-label="Copy tracking number"
                      className="text-muted hover:text-white"
                    >
                      <Copy size={14} />
                    </button>
                  </span>
                ) : undefined}
              </Row>
              {pick(order, "shippingNotes") && (
                <Row label="Notes">{pick(order, "shippingNotes")}</Row>
              )}
            </div>
          </Panel>

          {/* Payment was a hardcoded VISA badge with a card expiry the backend
              has no field for. Only what the order carries is shown. */}
          {(pick(order, "paymentStatus", "paymentStatusName") ||
            pick(order, "paymentReference", "transactionId") ||
            pick(order, "paymentMethod")) && (
            <Panel title="Payment" delay={0.2}>
              <div className="space-y-3">
                <Row label="Status">{pick(order, "paymentStatusName", "paymentStatus")}</Row>
                <Row label="Method">{pick(order, "paymentMethod")}</Row>
                <Row label="Reference">
                  {pick(order, "paymentReference", "transactionId")}
                </Row>
              </div>
            </Panel>
          )}

          <Panel title="Internal Notes" delay={0.25}>
            {pick(order, "customerNotes") && (
              <p className="mb-4 font-manrope text-[13px] text-muted">
                <span className="block text-[11px] font-bold uppercase tracking-wider mb-1">
                  From the customer
                </span>
                {pick(order, "customerNotes")}
              </p>
            )}
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note for the operations team…"
              className="w-full h-24 px-4 py-3 bg-white/10 border border-white/08 rounded-lg font-manrope text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-transparent resize-none"
            />
            <button
              type="button"
              onClick={handleSaveNote}
              disabled={addNote.isPending || !note.trim()}
              className="w-full mt-3 px-4 py-2.5 bg-white/05 border border-white/08 rounded-lg font-manrope text-[13px] font-medium text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              {addNote.isPending ? "Saving…" : "Save note"}
            </button>
          </Panel>
        </div>
      </div>
    </div>
  );
}
