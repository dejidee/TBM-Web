"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  ChevronLeft,
  ChevronRight,
  Headphones,
} from "lucide-react";
import DashboardLayout from "@/components/shared/dashboard/layout";
import { useProject } from "@/hooks/use-project";

const STATUS_STYLES = {
  paid: {
    label: "PAID",
    bg: "rgba(34,197,94,0.12)",
    color: "#22c55e",
    dot: "bg-green-400",
  },
  pending: {
    label: "PENDING",
    bg: "rgba(251,146,60,0.12)",
    color: "#fb923c",
    dot: "bg-orange-400",
  },
  overdue: {
    label: "OVERDUE",
    bg: "rgba(239,68,68,0.12)",
    color: "#f87171",
    dot: "bg-red-400",
  },
};

function invoiceStatus(s = "") {
  return STATUS_STYLES[s.toLowerCase()] ?? STATUS_STYLES.pending;
}

function formatCurrency(val) {
  if (!val && val !== 0) return "—";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(val);
}

function BudgetCard({ label, value, barPercent, icon, highlight }) {
  return (
    <div
      className="rounded-xl border border-white/08 p-4"
      style={{ background: "#0d0b08" }}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-[16px] font-bold tracking-widest text-white/25 uppercase">
          {label}
        </p>
        <span className="text-white/30">{icon}</span>
      </div>
      <p
        className="text-[20px] font-bold mb-3"
        style={{ color: highlight ? "#D4AF37" : "#ffffff" }}
      >
        {value}
      </p>
      <div
        className="h-1 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.07)" }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${barPercent}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{
            background: highlight
              ? "linear-gradient(90deg, #D4AF37, #b8962e)"
              : "rgba(255,255,255,0.25)",
          }}
        />
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      className="rounded-xl border border-white/08 p-4 animate-pulse space-y-3"
      style={{ background: "#0d0b08" }}
    >
      <div className="h-3 bg-white/06 rounded w-24" />
      <div className="h-6 bg-white/06 rounded w-32" />
      <div className="h-1 bg-white/06 rounded-full" />
    </div>
  );
}

export default function FinancialOverviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [invoicePage, setInvoicePage] = useState(1);

  const { data: project, isLoading } = useProject(id);

  // Flexible field mapping — log output confirms shape
  const budget = project?.budget ?? project?.financials ?? {};
  const totalBudget =
    budget?.total ?? budget?.totalBudget ?? project?.totalBudget ?? 0;
  const amountPaid =
    budget?.paid ?? budget?.amountPaid ?? project?.amountPaid ?? 0;
  const remaining =
    budget?.remaining ??
    budget?.remainingBalance ??
    project?.remainingBalance ??
    0;
  const paidPercent =
    totalBudget > 0 ? Math.round((amountPaid / totalBudget) * 100) : 0;
  const remainPercent =
    totalBudget > 0 ? Math.round((remaining / totalBudget) * 100) : 0;

  const invoices = budget?.invoices ?? project?.invoices ?? [];
  const INVOICES_PER_PAGE = 4;
  const totalPages = Math.max(
    1,
    Math.ceil(invoices.length / INVOICES_PER_PAGE),
  );
  const pagedInvoices = invoices.slice(
    (invoicePage - 1) * INVOICES_PER_PAGE,
    invoicePage * INVOICES_PER_PAGE,
  );

  const BudgetIcon = ({ path }) => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );

  return (
    <DashboardLayout>
      <div className="space-y-5 w-full max-w-[700px]">
        {/* Back */}
        <button
          onClick={() => router.push(`/dashboard/projects/${id}`)}
          className="inline-flex items-center gap-2 text-white/35 hover:text-white transition-colors text-[13px] font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Project
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-start justify-between gap-4"
        >
          <div>
            <h1 className="text-[26px] font-bold text-white leading-tight">
              Financial Overview
            </h1>
            <p className="text-[13px] text-white/35 mt-1">
              Track your project investment and transaction history.
            </p>
          </div>
          <button
            className="flex items-center gap-1.5 text-[13px] font-semibold text-black px-4 py-2 rounded-lg hover:opacity-90 transition-opacity shrink-0 mt-1"
            style={{
              background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)",
            }}
          >
            + New Payment
          </button>
        </motion.div>

        {/* Budget Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-3 gap-4"
        >
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <BudgetCard
                label="Total Budget"
                value={formatCurrency(totalBudget)}
                barPercent={100}
                icon={
                  <BudgetIcon path="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                }
              />
              <BudgetCard
                label="Amount Paid"
                value={formatCurrency(amountPaid)}
                barPercent={paidPercent}
                icon={
                  <BudgetIcon path="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                }
                highlight
              />
              <BudgetCard
                label="Remaining Balance"
                value={formatCurrency(remaining)}
                barPercent={remainPercent}
                icon={
                  <BudgetIcon path="M3 4h18v2H3zM3 10h18v2H3zM3 16h18v2H3z" />
                }
              />
            </>
          )}
        </motion.div>

        {/* Invoices table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="rounded-2xl border border-white/08 overflow-hidden"
          style={{ background: "#0d0b08" }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/06">
            <h2 className="text-[15px] font-bold text-white">
              Recent Invoices
            </h2>
            <div className="flex items-center gap-2">
              <button className="text-[12.5px] font-semibold text-white/40 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/05 transition-colors">
                Filter
              </button>
              <button className="text-[12.5px] font-semibold text-white/40 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/05 transition-colors">
                Export All
              </button>
            </div>
          </div>

          <div
            className="grid grid-cols-[1fr_2fr_1fr_1fr_auto] gap-4 px-5 py-2.5 border-b border-white/04"
            style={{ background: "rgba(255,255,255,0.02)" }}
          >
            {["DATE", "DESCRIPTION", "AMOUNT", "STATUS", ""].map((h) => (
              <span
                key={h}
                className="text-[16px] font-bold tracking-wider text-white/25 uppercase"
              >
                {h}
              </span>
            ))}
          </div>

          <div className="divide-y divide-white/04">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_2fr_1fr_1fr_auto] gap-4 px-5 py-3.5 items-center animate-pulse"
                >
                  {Array.from({ length: 5 }).map((__, j) => (
                    <div key={j} className="h-3 bg-white/06 rounded" />
                  ))}
                </div>
              ))
            ) : pagedInvoices.length === 0 ? (
              <p className="text-center text-white/25 text-[13px] py-10">
                No invoices yet.
              </p>
            ) : (
              pagedInvoices.map((inv, index) => {
                const style = invoiceStatus(inv?.status ?? "pending");
                const date =
                  inv?.date ?? inv?.createdAt ?? inv?.invoiceDate ?? "";
                const description =
                  inv?.description ?? inv?.title ?? inv?.name ?? "Invoice";
                const ref =
                  inv?.ref ?? inv?.reference ?? inv?.invoiceNumber ?? "";
                const amount = inv?.amount ?? inv?.total ?? 0;

                return (
                  <motion.div
                    key={inv?.id ?? index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25, delay: 0.3 + index * 0.06 }}
                    className="grid grid-cols-[1fr_2fr_1fr_1fr_auto] gap-4 px-5 py-3.5 items-center hover:bg-white/02 transition-colors"
                  >
                    <span className="text-[12.5px] text-white/40">
                      {date
                        ? new Date(date).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </span>
                    <div>
                      <p className="text-[13px] font-semibold text-white">
                        {description}
                      </p>
                      {ref && (
                        <p className="text-[11px] text-white/30">{ref}</p>
                      )}
                    </div>
                    <span className="text-[13px] font-semibold text-white">
                      {formatCurrency(amount)}
                    </span>
                    <span
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-md"
                      style={{ background: style.bg, color: style.color }}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${style.dot}`}
                      />
                      {style.label}
                    </span>
                    <button className="flex items-center gap-1 text-[11.5px] font-semibold text-white/30 hover:text-[#D4AF37] transition-colors">
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                  </motion.div>
                );
              })
            )}
          </div>

          {!isLoading && invoices.length > 0 && (
            <div
              className="flex items-center justify-between px-5 py-3 border-t border-white/06"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <span className="text-[12px] text-white/25">
                Showing {pagedInvoices.length} of {invoices.length} invoices
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setInvoicePage((p) => Math.max(1, p - 1))}
                  disabled={invoicePage === 1}
                  className="w-7 h-7 rounded-md border border-white/10 text-white/30 flex items-center justify-center hover:bg-white/05 disabled:opacity-30"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {Array.from({ length: totalPages }).map((_, p) => (
                  <button
                    key={p}
                    onClick={() => setInvoicePage(p + 1)}
                    className="w-7 h-7 rounded-md text-[12px] font-semibold flex items-center justify-center transition-colors"
                    style={
                      invoicePage === p + 1
                        ? {
                            background:
                              "linear-gradient(135deg, #D4AF37, #b8962e)",
                            color: "#000",
                          }
                        : {
                            border: "1px solid rgba(255,255,255,0.10)",
                            color: "rgba(255,255,255,0.35)",
                          }
                    }
                  >
                    {p + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setInvoicePage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={invoicePage === totalPages}
                  className="w-7 h-7 rounded-md border border-white/10 text-white/30 flex items-center justify-center hover:bg-white/05 disabled:opacity-30"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Support CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="rounded-2xl border border-white/08 p-8 flex flex-col items-center text-center"
          style={{ background: "#0d0b08" }}
        >
          <div
            className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-4"
            style={{ background: "rgba(212,175,55,0.08)" }}
          >
            <Headphones className="w-5 h-5 text-[#D4AF37]/60" />
          </div>
          <h3 className="text-[15px] font-bold text-white mb-1.5">
            Need financial assistance?
          </h3>
          <p className="text-[13px] text-white/35 max-w-xs leading-relaxed mb-5">
            Our billing team is available to answer questions about invoices,
            payment schedules, or custom billing arrangements.
          </p>
          <button
            onClick={() => router.push("/contact")}
            className="text-[13px] font-semibold text-black px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            style={{
              background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)",
            }}
          >
            Contact Support
          </button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
