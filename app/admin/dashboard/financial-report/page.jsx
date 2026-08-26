"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import RevenueChart from "@/components/shared/admin/dashboard/revenue-chart";
import { txnStatusChip } from "@/lib/theme/status";
import { avatarStyle } from "@/lib/theme/avatar";
import {
  useFinancialStats,
  useMonthlyRevenue,
  useRevenueByService,
  useTransactions,
  useExportFinancialReport,
} from "@/hooks/use-financial";
import netProfitIcon from "@/public/assets/svgs/financialReport/netProfit.svg";
import pendingIcon from "@/public/assets/svgs/financialReport/pending.svg";
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  CheckCircle,
  RefreshCw,
  DollarSign,
} from "lucide-react";
import calendarIcon from "@/public/assets/svgs/financialReport/calendarIcon.svg";
import filterIcon from "@/public/assets/svgs/financialReport/filter.svg";
import searchIcon from "@/public/assets/svgs/financialReport/searchIcon.svg";

export default function FinancialReportPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const { data: stats, isLoading: statsLoading } = useFinancialStats();
  const { data: monthlyRevenue, isLoading: revenueLoading } =
    useMonthlyRevenue();
  const { data: revenueByService, isLoading: serviceLoading } =
    useRevenueByService();
  const { data: transactions, isLoading: transactionsLoading } =
    useTransactions({
      page,
      limit: 5,
      search,
      filter,
    });
  const { mutate: exportReport, isPending: isExporting } =
    useExportFinancialReport();

  const isLoading =
    statsLoading || revenueLoading || serviceLoading || transactionsLoading;

  if (isLoading) {
    return (
      <div className="max-w-360 mx-auto">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white/10 border-t-accent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/50 font-inter text-[14px]">
              Loading financial data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to format currency
  const formatCurrency = (value) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num) || num === 0) return "$0";
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    }
    return `$${num.toLocaleString()}`;
  };

  // Map API response fields directly to stat cards
  const statsData = stats
    ? [
        {
          key: "totalRevenue",
          label: "Total Revenue",
          value: formatCurrency(stats.totalRevenue),
          icon: DollarSign,
          color: "text-success",
          bg: "bg-success/10",
        },
        {
          key: "revenueThisMonth",
          label: "Revenue This Month",
          value: formatCurrency(stats.revenueThisMonth),
          icon: TrendingUp,
          color: "text-info",
          bg: "bg-info/10",
        },
        {
          key: "totalTransactions",
          label: "Total Transactions",
          value: stats.totalTransactions.toLocaleString(),
          icon: CreditCard,
          color: "text-chart-1",
          bg: "bg-chart-1/10",
        },
        {
          key: "successfulTransactions",
          label: "Successful",
          value: stats.successfulTransactions.toLocaleString(),
          icon: CheckCircle,
          color: "text-success",
          bg: "bg-success/10",
        },
        {
          key: "refundedTransactions",
          label: "Refunded Transactions",
          value: stats.refundedTransactions.toLocaleString(),
          icon: RefreshCw,
          color: "text-danger",
          bg: "bg-danger/10",
        },
        {
          key: "refundedAmount",
          label: "Refunded Amount",
          value: formatCurrency(stats.refundedAmount),
          icon: TrendingDown,
          color: "text-danger",
          bg: "bg-danger/10",
        },
      ]
    : [];


  return (
    <div className="max-w-360 mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
          <div>
            <h1 className="font-inter text-[28px] sm:text-[34px] md:text-[39px] font-black text-white mb-2 leading-[1.1] tracking-[-1.3px]">
              Financial Reports
            </h1>
            <p className="font-inter text-[14px] sm:text-[16px] md:text-[18px] text-white/50">
              Overview of platform revenue and financial health
            </p>
          </div>

          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <div className="relative w-full sm:w-auto">
              <Image
                src={calendarIcon}
                alt="Calendar"
                width={16}
                height={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              />
              <select className="appearance-none w-full bg-surface-raised border border-white/10 rounded-lg pl-10 pr-10 py-2.5 font-inter text-[14px] font-medium text-white/60 hover:bg-white/08 transition-colors cursor-pointer">
                <option>Last 7 Days</option>
                <option defaultValue="selected">Last 30 Days</option>
                <option>Last 90 Days</option>
                <option>Last 6 Months</option>
                <option>Last Year</option>
                <option>All Time</option>
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => exportReport()}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-inter text-[14px] font-bold text-white transition-opacity disabled:opacity-50 w-full sm:w-auto"
              style={{
                background: "linear-gradient(135deg, var(--color-accent-solid) 0%, var(--color-accent-solid-dim) 100%)",
              }}
            >
              {isExporting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Download size={16} />
              )}
              {isExporting ? "Exporting…" : "Export Report"}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statsData?.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-surface rounded-xl p-6 border border-white/08 flex items-start justify-between"
            >
              <div>
                <p className="font-inter text-[14px] font-medium text-white/50 mb-2">
                  {stat.label}
                </p>
                <h3 className="font-inter text-[32px] font-bold text-white leading-none">
                  {stat.value}
                </h3>
              </div>
              <div
                className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}
              >
                <Icon size={20} className={stat.color} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Monthly Revenue Trends */}
        <div className="lg:col-span-2">
          <RevenueChart
            data={{
              totalRevenue: stats?.totalRevenue ?? 0,
              monthlyRecurring: stats?.revenueThisMonth ?? 0,
              chartData: monthlyRevenue,
            }}
          />
        </div>

        {/* Revenue by Service */}
        <div className="bg-surface rounded-xl border border-white/08 p-6">
          <h2 className="font-inter text-[18px] font-bold text-white mb-6">
            Revenue by Service
          </h2>
          <div className="flex flex-col items-center">
            {/* Donut chart placeholder */}
            <div className="relative w-32 sm:w-40 md:w-48 h-32 sm:h-40 md:h-48 mb-6">
              <svg viewBox="0 0 100 100" className="-rotate-90">
                {revenueByService?.services?.map((service, i) => {
                  const prevPercentages =
                    revenueByService?.services
                      ?.slice(0, i)
                      .reduce((sum, s) => sum + (s?.percentage || 0), 0) || 0;
                  const circumference = 2 * Math.PI * 40;
                  const offset = (prevPercentages / 100) * circumference;
                  const dashArray = `${((service?.percentage || 0) / 100) * circumference} ${circumference}`;

                  return (
                    <circle
                      key={i}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={service?.color || "var(--color-muted)"}
                      strokeWidth="20"
                      strokeDasharray={dashArray}
                      strokeDashoffset={-offset}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="font-inter text-[12px] font-medium text-white/40">
                  Total
                </p>
                <p className="font-inter text-[20px] font-bold text-white">
                  {formatCurrency(stats?.totalRevenue ?? 0)}
                </p>
              </div>
            </div>

            {/* Legend */}
            <div className="w-full grid grid-cols-2 gap-3">
              {revenueByService?.services?.map((service, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: service?.color || "var(--color-muted)" }}
                  />
                  <div>
                    <p className="font-inter text-[12px] font-medium text-white/50">
                      {service?.name || "N/A"}
                    </p>
                    <p className="font-inter text-[14px] font-bold text-white">
                      {service?.percentage || 0}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="bg-surface rounded-xl border border-white/08">
        <div className="px-6 py-4 border-b border-white/08">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="font-inter text-[18px] font-bold text-white">
              Transaction Summaries
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:w-80">
                <Image
                  src={searchIcon}
                  alt="Search"
                  width={18}
                  height={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-surface-raised border border-white/10 rounded-lg font-inter text-[14px] text-white placeholder:text-white/30 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg font-inter text-[14px] font-medium text-white/60 hover:bg-white/05">
                <Image src={filterIcon} alt="Filter" width={16} height={16} />
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/05 border-b border-white/08">
              <tr>
                <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left font-inter text-[9px] sm:text-[10px] md:text-[12px] font-semibold text-white/40 uppercase tracking-[0.59px]">
                  Transaction ID
                </th>
                <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left font-inter text-[9px] sm:text-[10px] md:text-[12px] font-semibold text-white/40 uppercase tracking-[0.59px]">
                  Date
                </th>
                <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left font-inter text-[9px] sm:text-[10px] md:text-[12px] font-semibold text-white/40 uppercase tracking-[0.59px] hidden sm:table-cell">
                  User
                </th>
                <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left font-inter text-[9px] sm:text-[10px] md:text-[12px] font-semibold text-white/40 uppercase tracking-[0.59px] hidden md:table-cell">
                  Service Type
                </th>
                <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left font-inter text-[9px] sm:text-[10px] md:text-[12px] font-semibold text-white/40 uppercase tracking-[0.59px]">
                  Amount
                </th>
                <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left font-inter text-[9px] sm:text-[10px] md:text-[12px] font-semibold text-white/40 uppercase tracking-[0.59px]">
                  Status
                </th>
                <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 hidden sm:table-cell"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/08">
              {transactions?.transactions?.map((txn, index) => (
                <tr key={txn?.id || index} className="hover:bg-white/03">
                  <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 font-inter text-[11px] sm:text-[13px] md:text-[14px] font-medium text-white">
                    #{txn?.id || "N/A"}
                  </td>
                  <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4">
                    <p className="font-inter text-[11px] sm:text-[13px] md:text-[14px] text-white/50">
                      {txn?.date || "N/A"}
                    </p>
                    <p className="font-inter text-[10px] sm:text-[11px] md:text-[12px] text-white/30">
                      {txn?.time || ""}
                    </p>
                  </td>
                  <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 hidden sm:table-cell">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-inter font-bold text-[10px] sm:text-[12px]"
                        style={avatarStyle(txn?.user?.id ?? txn?.user?.email)}
                      >
                        {txn?.user?.initials || "?"}
                      </div>
                      <div>
                        <p className="font-inter text-[12px] sm:text-[14px] font-medium text-white">
                          {txn?.user?.name || "N/A"}
                        </p>
                        <p className="font-inter text-[10px] sm:text-[12px] text-white/40">
                          {txn?.user?.type || ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 font-inter text-[11px] sm:text-[13px] md:text-[14px] text-white/60 hidden md:table-cell">
                    {txn?.serviceType || "N/A"}
                  </td>
                  <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 font-inter text-[12px] sm:text-[13px] md:text-[14px] font-semibold text-white">
                    ${txn?.amount?.toLocaleString() || "0"}
                  </td>
                  <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4">
                    {(() => {
                      const chip = txnStatusChip(txn?.status);
                      return (
                        <span
                          className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-2.5 py-1 rounded-full border border-white/10 font-inter text-[11px] md:text-[12px] font-medium ${chip.bg} ${chip.text}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${chip.dot}`}
                          />
                          {txn?.status || "N/A"}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 hidden sm:table-cell">
                    <div className="flex items-center gap-[3px]">
                      <span className="w-[3.26px] h-[3.26px] rounded-full bg-muted"></span>
                      <span className="w-[3.26px] h-[3.26px] rounded-full bg-muted"></span>
                      <span className="w-[3.26px] h-[3.26px] rounded-full bg-muted"></span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {transactions?.pagination && (
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-white/08 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
            <p className="font-inter text-[12px] sm:text-[13.7px] font-normal text-white/50 text-center sm:text-left">
              Showing <span className="font-medium">{(page - 1) * 5 + 1}</span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(page * 5, transactions?.pagination?.total || 0)}
              </span>{" "}
              of{" "}
              <span className="font-medium">
                {transactions?.pagination?.total || 0}
              </span>{" "}
              results
            </p>
            <div className="flex items-center">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="w-[30px] sm:w-[35px] h-[30px] sm:h-[35px] flex items-center justify-center rounded-l-[6px] bg-surface-raised border border-white/10 hover:bg-white/05 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              >
                <ChevronLeft
                  size={14}
                  className="sm:w-4 sm:h-4 text-muted"
                />
              </button>

              {/* Show only first, current, and last on mobile */}
              <div className="flex sm:hidden">
                {page > 1 && (
                  <button
                    onClick={() => setPage(1)}
                    className="w-[36px] h-[30px] flex items-center justify-center font-inter text-[13px] font-semibold bg-surface-raised border border-white/10 text-white/70 hover:bg-white/08"
                  >
                    1
                  </button>
                )}
                {page > 2 && (
                  <span className="w-[36px] h-[30px] flex items-center justify-center bg-surface-raised border border-white/10 font-inter text-[13px] font-semibold text-white/40">
                    ...
                  </span>
                )}
                {page !== 1 && page !== 10 && (
                  <button
                    onClick={() => setPage(page)}
                    className="w-[36px] h-[30px] flex items-center justify-center font-inter text-[13px] font-semibold bg-white/10 text-accent border border-accent/30"
                  >
                    {page}
                  </button>
                )}
                {page < 9 && (
                  <span className="w-[36px] h-[30px] flex items-center justify-center bg-surface-raised border border-white/10 font-inter text-[13px] font-semibold text-white/40">
                    ...
                  </span>
                )}
                {page < 10 && (
                  <button
                    onClick={() => setPage(10)}
                    className={`w-[36px] h-[30px] flex items-center justify-center font-inter text-[13px] font-semibold ${
                      page === 10
                        ? "bg-white/10 text-accent border border-accent/30"
                        : "bg-surface-raised border border-white/10 text-white/70 hover:bg-white/08"
                    }`}
                  >
                    10
                  </button>
                )}
              </div>

              {/* Show all page numbers on desktop */}
              <div className="hidden sm:flex">
                {[1, 2, 3, "...", 10].map((p, i) =>
                  p === "..." ? (
                    <span
                      key={i}
                      className="w-[40px] md:w-[44px] h-[30px] sm:h-[35px] flex items-center justify-center bg-surface-raised border border-white/10 font-inter text-[13px] sm:text-[14px] font-semibold text-white/40"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={i}
                      onClick={() => setPage(p)}
                      className={`${p >= 10 ? "w-[40px] md:w-[44px]" : "w-[36px] md:w-[40px]"} h-[30px] sm:h-[35px] flex items-center justify-center font-inter text-[13px] sm:text-[14px] font-semibold ${
                        page === p
                          ? "bg-white/10 text-accent border border-accent/30"
                          : "bg-surface-raised border border-white/10 text-white/70 hover:bg-white/08"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() => setPage(Math.min(10, page + 1))}
                disabled={page === 10}
                className="w-[30px] sm:w-[35px] h-[30px] sm:h-[35px] flex items-center justify-center rounded-r-[6px] bg-surface-raised border border-white/10 hover:bg-white/05 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              >
                <ChevronRight
                  size={14}
                  className="sm:w-4 sm:h-4 text-muted"
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
