"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Package } from "lucide-react";

// Deterministic, not random — the same customer always gets the same
// initial/colour. Real fields: no avatar colour or icon-per-type exists on
// the API (lib/api/schemas/orders.ts, GET /vendor/orders), so this used to
// read `order.customer.bgColor/textColor/initials` and `order.typeIcon` —
// none of which the backend has ever sent.
const AVATAR_PALETTE = [
  { bg: "#D4AF3733", text: "#D4AF37" },
  { bg: "#60A5FA33", text: "#60A5FA" },
  { bg: "#34D39933", text: "#34D399" },
  { bg: "#F8717133", text: "#F87171" },
  { bg: "#A78BFA33", text: "#A78BFA" },
];

function avatarFor(name) {
  const clean = (name || "?").trim();
  const code = clean.charCodeAt(0) || 0;
  return { initial: clean[0]?.toUpperCase() ?? "?", ...AVATAR_PALETTE[code % AVATAR_PALETTE.length] };
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

export default function OrdersTable({ orders, isLoading, isError }) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="bg-surface rounded-xl border border-white/08">
        <div className="p-8 text-center">
          <div className="w-12 h-12 border-4 border-white/08 border-t-accent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted font-manrope text-[14px]">
            Loading orders...
          </p>
        </div>
      </div>
    );
  }

  // GET /vendor/orders 500s (NullReferenceException) once pagination crosses
  // past the first ~6 orders for a vendor — confirmed live 2026-08-12,
  // BACKLOG.md. Without this, that response's `data?.items === undefined`
  // fell into the empty-state branch below and silently claimed "No orders
  // found" for a vendor who very much has orders.
  if (isError) {
    return (
      <div className="bg-surface rounded-xl border border-white/08 p-12 text-center">
        <p className="text-muted font-manrope text-[14px]">
          Couldn&rsquo;t load orders. Your orders are safe — this is a problem
          reaching them. Try again in a moment.
        </p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-white/08 p-12 text-center">
        <p className="text-muted font-manrope text-[14px]">
          No orders found
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-white/08 overflow-hidden">
      {/* Table Header */}
      <div className="overflow-x-auto table-scroll">
        <div className="px-6 py-4 bg-white/05 border-b border-white/08 min-w-255">
          <div className="grid grid-cols-[140px_240px_120px_140px_120px_140px_120px] justify-between gap-4">
            <span className="font-manrope text-[11px] font-bold text-muted uppercase tracking-wider">
              ORDER ID
            </span>
            <span className="font-manrope text-[11px] font-bold text-muted uppercase tracking-wider">
              CUSTOMER
            </span>
            <span className="font-manrope text-[11px] font-bold text-muted uppercase tracking-wider">
              DATE
            </span>
            <span className="font-manrope text-[11px] font-bold text-muted uppercase tracking-wider">
              TYPE
            </span>
            <span className="font-manrope text-[11px] font-bold text-muted uppercase tracking-wider">
              TOTAL
            </span>
            <span className="font-manrope text-[11px] font-bold text-muted uppercase tracking-wider">
              STATUS
            </span>
            <span className="font-manrope text-[11px] font-bold text-muted uppercase tracking-wider">
              ACTIONS
            </span>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-white/08 overflow-x-auto">
          {orders.map((order, index) => {
            const avatar = avatarFor(order.customerName);
            // No `statusName` on this list row (unlike the Order detail
            // response) — status is a bare 0-7 integer the spec doesn't name.
            // Render it honestly rather than inventing a label/colour for a
            // number this app has never decoded.
            const statusLabel =
              typeof order.status === "string" ? order.status : `Status ${order.status}`;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="px-6 py-4 hover:bg-white/05 transition-colors min-w-255"
              >
                <div className="grid grid-cols-[140px_240px_120px_140px_120px_140px_120px] gap-4 justify-between items-center">
                  {/* Order Number */}
                  <span className="font-manrope text-[14px] font-bold text-white">
                    #{order.orderNumber}
                  </span>

                  {/* Customer */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center font-manrope text-[13px] font-bold shrink-0"
                      style={{ backgroundColor: avatar.bg, color: avatar.text }}
                    >
                      {avatar.initial}
                    </div>
                    <span className="font-manrope text-[14px] text-white truncate">
                      {order.customerName}
                    </span>
                  </div>

                  {/* Date */}
                  <span className="font-manrope text-[13px] text-muted">
                    {formatDate(order.createdAt)}
                  </span>

                  {/* Type */}
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-warning" />
                    <span className="font-manrope text-[13px] text-white">
                      {order.type}
                    </span>
                  </div>

                  {/* Total */}
                  <span className="font-manrope text-[14px] font-bold text-white">
                    ₦{order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <span
                      className="px-3 py-1 rounded-full bg-white/08 text-muted font-manrope text-[11px] font-bold"
                    >
                      {statusLabel}
                    </span>
                  </div>

                  {/* Actions */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      router.push(`/vendor/dashboard/orders/${order.id}`)
                    }
                    className="px-4 py-2 bg-accent-solid text-white rounded-lg font-manrope text-[13px] font-medium hover:bg-white/10 transition-colors"
                  >
                    View Order
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
