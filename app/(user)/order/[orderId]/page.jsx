// app/orders/[orderId]/page.jsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, Headphones, ChevronRight, CreditCard } from "lucide-react";
import { use } from "react";

import { useOrderDetails, useDownloadInvoice } from "@/hooks/use-order-details";
import { useResumePayment } from "@/hooks/use-checkout";
import { showToast } from "@/components/shared/toast";
import OrderTimeline from "@/components/shared/orders/timeline";
import OrderItems from "@/components/shared/orders/items";
import ShippingDetails from "@/components/shared/orders/shipping-details";
import AIVisualizerPromo from "@/components/shared/orders/ai-promo";
import HelpSection from "@/components/shared/orders/help";

function formatDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
}

export default function OrderDetailsPage({ params }) {
  const { orderId } = use(params);
  const { data: order, isLoading, isError } = useOrderDetails(orderId);
  const downloadInvoice = useDownloadInvoice();
  const resumePayment = useResumePayment();

  const handleDownloadInvoice = () => {
    downloadInvoice.mutate(orderId, {
      onSuccess: (data) => window.open(data.url, "_blank"),
      onError: (err) => showToast.error(err.message),
    });
  };

  const handleResumePayment = () => {
    resumePayment.mutate(order, {
      onSuccess: (data) => {
        if (data?.authorizationUrl) window.location.href = data.authorizationUrl;
        else showToast.error("Could not resume this payment. Try checking out again.");
      },
      onError: (err) => showToast.error(err.message),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[14px] text-white/40">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-20 px-4">
        <div className="text-center">
          <p className="text-[16px] text-white mb-2">
            {isError ? "Couldn't load this order" : "Order not found"}
          </p>
          <p className="text-[14px] text-white/40 mb-6">
            {isError
              ? "Your order is safe — this is a problem reaching it. Try again in a moment."
              : "It may have been cancelled, or belong to another account."}
          </p>
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 text-[14px] text-white hover:bg-white/05 transition-colors"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-[13px]">
            <Link href="/" className="text-white/30 hover:text-white/60 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-white/20" />
            <Link href="/dashboard" className="text-white/30 hover:text-white/60 transition-colors">Account</Link>
            <ChevronRight className="w-3 h-3 text-white/20" />
            <Link href="/dashboard/orders" className="text-white/30 hover:text-white/60 transition-colors">Orders</Link>
            <ChevronRight className="w-3 h-3 text-white/20" />
            <span className="text-[#D4AF37] font-medium">Order {order.orderNumber}</span>
          </div>
        </div>

        {/* Payment still pending — the checkout that created this order was
            never confirmed (tab closed, connection dropped). The Paystack
            session is still live; resuming reuses it instead of starting a
            new order. Not shown once paymentStatusName moves past Pending. */}
        {order.paymentStatusName === "Pending" && order.paymentReference && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between rounded-xl border p-4 mb-6"
            style={{ background: "rgba(212,175,55,0.06)", borderColor: "rgba(212,175,55,0.20)" }}
          >
            <p className="text-[14px] text-white/70">
              This order is awaiting payment. If you already paid and it hasn&rsquo;t
              updated, wait a moment before trying again.
            </p>
            <button
              onClick={handleResumePayment}
              disabled={resumePayment.isPending}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[14px] font-medium text-black hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
              style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
            >
              <CreditCard className="w-4 h-4" />
              {resumePayment.isPending ? "Redirecting…" : "Complete Payment"}
            </button>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-[40px] md:text-[48px] font-bold text-white leading-tight">
              Order {order.orderNumber}
            </h1>
            <p className="text-[14px] text-white/40 mt-2">
              Placed on {formatDate(order.createdAt) ?? "—"} · Total:{" "}
              <span className="font-semibold text-[#D4AF37]">
                ₦{order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadInvoice}
              disabled={downloadInvoice.isPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-white/10 rounded-lg text-[14px] font-medium text-white/60 hover:bg-white/05 transition-colors disabled:opacity-50"
              style={{ background: "#0d0b08" }}
            >
              <FileText className="w-4 h-4" /> Invoice
            </button>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[14px] font-medium text-black hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
            >
              <Headphones className="w-4 h-4" /> Support
            </Link>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-8">
          <div className="space-y-6">
            <OrderTimeline order={order} />
            <OrderItems items={order.items} />
          </div>
          <div className="space-y-6">
            <ShippingDetails order={order} />
            <AIVisualizerPromo items={order.items} />
            <HelpSection />
          </div>
        </div>
      </div>
    </div>
  );
}
