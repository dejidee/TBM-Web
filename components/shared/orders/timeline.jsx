// components/orders/OrderTimeline.jsx
"use client";

import { motion } from "framer-motion";
import { Truck, Check, Package, XCircle } from "lucide-react";

function formatDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * The Order response has no ETA, no per-step dates, and no "active" flag — the
 * mock this used to render invented all three (`estimatedDelivery`,
 * `timeline[]`). What it does have: `createdAt`, `shippedAt`, `deliveredAt`,
 * `cancelledAt`/`cancellationReason`, and `statusName`
 * (lib/api/schemas/orders.ts). This renders those directly instead of a
 * fabricated multi-step schedule.
 */
export default function OrderTimeline({ order }) {
  const isCancelled = Boolean(order?.cancelledAt) || order?.statusName === "Cancelled";

  if (isCancelled) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-2xl p-6 border"
        style={{ background: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.20)" }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "rgba(239,68,68,0.15)" }}
          >
            <XCircle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-[20px] font-semibold text-white mb-1">Order Cancelled</h2>
            <p className="text-[14px] text-white/40">
              {order?.cancellationReason ||
                (formatDate(order?.cancelledAt)
                  ? `Cancelled on ${formatDate(order.cancelledAt)}`
                  : "This order was cancelled.")}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  const steps = [
    { key: "placed", label: "Order Placed", icon: Check, date: order?.createdAt },
    { key: "shipped", label: "Shipped", icon: Truck, date: order?.shippedAt },
    { key: "delivered", label: "Delivered", icon: Package, date: order?.deliveredAt },
  ];
  const completedCount = steps.filter((s) => s.date).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-2xl p-6 border"
      style={{ background: "rgba(212,175,55,0.06)", borderColor: "rgba(212,175,55,0.20)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
        >
          <Truck className="w-6 h-6 text-black" />
        </div>
        <div>
          <h2 className="text-[20px] font-semibold text-white mb-1">
            {order?.statusName ?? "Processing"}
          </h2>
          {order?.trackingNumber && (
            <p className="text-[14px] text-white/40">Tracking: {order.trackingNumber}</p>
          )}
        </div>
      </div>

      {/* Steps */}
      <div className="relative">
        <div
          className="absolute top-6 left-6 h-0.5"
          style={{
            width: `${(completedCount / steps.length) * 100}%`,
            background: "linear-gradient(90deg, #D4AF37, #b8962e)",
          }}
        />

        <div className="grid grid-cols-3 gap-4">
          {steps.map((step) => {
            const Icon = step.icon;
            const isDone = Boolean(step.date);
            const formatted = formatDate(step.date);

            return (
              <div key={step.key} className="relative flex flex-col items-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-3 relative z-10"
                  style={
                    isDone
                      ? { background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }
                      : { background: "rgba(255,255,255,0.08)" }
                  }
                >
                  <Icon className={`w-5 h-5 ${isDone ? "text-black" : "text-white/25"}`} />
                </div>

                <p className={`text-[13px] font-medium text-center mb-1 ${isDone ? "text-white" : "text-white/30"}`}>
                  {step.label}
                </p>
                <p className="text-[12px] text-white/35 text-center">{formatted ?? "Pending"}</p>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
