// components/dashboard/orders/OrdersTable.jsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight, CreditCard } from "lucide-react";
import { useState } from "react";
import { useResumePayment } from "@/hooks/use-checkout";
import { showToast } from "@/components/shared/toast";

const PLACEHOLDER = "/product-placeholder.svg";

// Keyed by the lowercased `statusName` the backend sends (only "Cancelled"
// has been observed live so far — OrderStatus is an unnamed 0-7 integer enum,
// CLAUDE.md). Anything not in this map renders its own label on a neutral
// badge rather than being mislabelled "Processing".
const statusConfig = {
  pending: { bg: "bg-amber-900/30", text: "text-amber-400" },
  processing: { bg: "bg-blue-900/30", text: "text-blue-400" },
  shipped: { bg: "bg-purple-900/30", text: "text-purple-400" },
  delivered: { bg: "bg-green-900/30", text: "text-green-400" },
  cancelled: { bg: "bg-red-900/20", text: "text-red-400" },
};

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

export default function OrdersTable({ orders, isLoading, isError }) {
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;
  const [resumingOrderId, setResumingOrderId] = useState(null);
  const resumePayment = useResumePayment();

  const handleResumePayment = (order) => {
    setResumingOrderId(order.id);
    resumePayment.mutate(order, {
      onSuccess: (data) => {
        if (data?.authorizationUrl) window.location.href = data.authorizationUrl;
        else {
          setResumingOrderId(null);
          showToast.error("Could not resume this payment. Try checking out again.");
        }
      },
      onError: (err) => {
        setResumingOrderId(null);
        showToast.error(err.message);
      },
    });
  };

  if (isLoading) return <LoadingSkeleton />;

  if (isError || !orders || orders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-12 border border-white/08 text-center"
        style={{ background: "#0d0b08" }}
      >
        <p className="text-[14px] text-white/30">
          {isError ? "Failed to load orders" : "No orders found"}
        </p>
      </motion.div>
    );
  }

  const totalOrders = orders.length;
  const totalPages = Math.ceil(totalOrders / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const currentOrders = orders.slice(startIndex, endIndex);

  const fmt = (n) =>
    `₦${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-2xl border border-white/08 overflow-hidden"
      style={{ background: "#0d0b08" }}
    >
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/08">
              {["Order ID", "Date", "Items", "Total", "Status", ""].map((h, i) => (
                <th
                  key={h || "actions"}
                  className={`px-6 py-4 text-[12px] font-semibold text-white/30 uppercase tracking-widest ${i === 3 ? "text-right" : "text-left"}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentOrders.map((order, index) => (
              <motion.tr
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-b border-white/06 last:border-0 hover:bg-white/02 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4">
                  <span className="text-[14px] font-semibold text-white">{order.orderNumber}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[14px] text-white/40">{formatDate(order.createdAt)}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 shrink-0 bg-surface-raised rounded-lg overflow-hidden">
                      <Image
                        src={order.items[0].productImageUrl || PLACEHOLDER}
                        alt={order.items[0].productName}
                        fill
                        className="object-contain"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-white line-clamp-1">{order.items[0].productName}</p>
                      {order.items.length > 1 && (
                        <p className="text-[12px] text-white/30 mt-0.5">
                          + {order.items.length - 1} other item{order.items.length - 1 > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-[15px] font-semibold text-white">{fmt(order.total)}</span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={order.statusName} />
                </td>
                <td className="px-6 py-4 text-right">
                  {order.paymentStatusName === "Pending" && order.paymentReference && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResumePayment(order);
                      }}
                      disabled={resumingOrderId === order.id}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium text-black hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
                      style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      {resumingOrderId === order.id ? "Redirecting…" : "Complete Payment"}
                    </button>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-white/06">
        {currentOrders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="p-4 hover:bg-white/02 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-[15px] font-semibold text-white">{order.orderNumber}</span>
                <p className="text-[13px] text-white/40 mt-0.5">{formatDate(order.createdAt)}</p>
              </div>
              <StatusBadge status={order.statusName} />
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="relative w-16 h-16 shrink-0 bg-surface-raised rounded-lg overflow-hidden">
                <Image
                  src={order.items[0].productImageUrl || PLACEHOLDER}
                  alt={order.items[0].productName}
                  fill
                  className="object-contain"
                  sizes="64px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-white line-clamp-1">{order.items[0].productName}</p>
                {order.items.length > 1 && (
                  <p className="text-[12px] text-white/30 mt-1">
                    + {order.items.length - 1} other item{order.items.length - 1 > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/06">
              <span className="text-[13px] text-white/40">Total</span>
              <span className="text-[16px] font-semibold text-white">{fmt(order.total)}</span>
            </div>

            {order.paymentStatusName === "Pending" && order.paymentReference && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleResumePayment(order);
                }}
                disabled={resumingOrderId === order.id}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 h-11 rounded-lg text-[14px] font-medium text-black hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
              >
                <CreditCard className="w-4 h-4" />
                {resumingOrderId === order.id ? "Redirecting…" : "Complete Payment"}
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-t border-white/08">
        <p className="text-[13px] text-white/40">
          Showing{" "}
          <span className="font-medium text-white">{startIndex + 1}</span>{" "}
          to{" "}
          <span className="font-medium text-white">{Math.min(endIndex, totalOrders)}</span>{" "}
          of <span className="font-medium text-white">{totalOrders}</span> orders
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1.5 rounded-lg border border-white/10 text-[13px] font-medium transition-all ${
              currentPage === 1 ? "text-white/20 cursor-not-allowed" : "text-white/60 hover:bg-white/05"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-[13px] text-white/40 px-2">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1.5 rounded-lg border border-white/10 text-[13px] font-medium transition-all ${
              currentPage === totalPages ? "text-white/20 cursor-not-allowed" : "text-white/60 hover:bg-white/05"
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }) {
  const config = statusConfig[status?.toLowerCase()] || {
    bg: "bg-white/08",
    text: "text-white/60",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 ${config.bg} ${config.text} text-[12px] font-medium rounded-md`}>
      {status || "—"}
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <div className="rounded-2xl border border-white/08 overflow-hidden" style={{ background: "#0d0b08" }}>
      <div className="hidden md:block p-6 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-center gap-4">
            <div className="h-4 bg-white/06 rounded w-20" />
            <div className="h-4 bg-white/06 rounded w-24" />
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 bg-white/06 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/06 rounded w-3/4" />
                <div className="h-3 bg-white/06 rounded w-1/2" />
              </div>
            </div>
            <div className="h-4 bg-white/06 rounded w-20" />
            <div className="h-6 bg-white/06 rounded w-24" />
          </div>
        ))}
      </div>

      <div className="md:hidden divide-y divide-white/06">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 animate-pulse">
            <div className="flex items-start justify-between mb-3">
              <div className="space-y-2">
                <div className="h-4 bg-white/06 rounded w-20" />
                <div className="h-3 bg-white/06 rounded w-24" />
              </div>
              <div className="h-6 bg-white/06 rounded w-20" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white/06 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/06 rounded w-3/4" />
                <div className="h-3 bg-white/06 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
