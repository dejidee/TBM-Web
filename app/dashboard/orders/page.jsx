// app/dashboard/orders/page.jsx
"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Download, Package, ShoppingBag } from "lucide-react";

import { useOrders } from "@/hooks/use-user-orders";
import DashboardLayout from "@/components/shared/dashboard/layout";
import OrdersFilters from "@/components/shared/dashboard/orders/filters";
import OrdersTable from "@/components/shared/dashboard/orders/table";
import SectionEmpty from "@/components/shared/dashboard/section-empty";
import SectionError from "@/components/shared/dashboard/section-error";

const DEFAULT_FILTERS = {
  search: "",
  status: "all",
  dateRange: "last30",
  sortBy: "newest",
};

export default function OrdersPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const { data: orders, isLoading, isError, refetch } = useOrders();

  const count = orders?.length ?? 0;
  const hasOrders = count > 0;

  // `dateRange` defaults to "last30", so it narrows the set from the first
  // render — an account whose only order is older than a month would otherwise
  // be told it has never ordered. It counts as an active filter.
  const hasActiveFilters =
    filters.search !== "" || filters.status !== "all" || filters.dateRange !== "last30";

  const handleExport = () => {
    if (!hasOrders) return;

    const rows = [
      ["Order Number", "Date", "Items", "Total", "Status"],
      ...orders.map((order) => [
        order.orderNumber,
        order.createdAt,
        order.items.map((i) => i.productName).join(" | "),
        order.total.toFixed(2),
        order.statusName,
      ]),
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="w-full space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-[28px] font-semibold leading-tight text-white md:text-[32px]">
              My Orders
            </h1>
            <p className="mt-1.5 text-[15px] text-white/45">
              {hasOrders
                ? `${count} ${count === 1 ? "order" : "orders"} in your history.`
                : "Every material order you place shows up here with live tracking."}
            </p>
          </div>

          {/* Export only exists once there is something to export. A permanently
              greyed-out button is a control that has never worked, which reads
              as broken rather than conditional. */}
          {hasOrders && (
            <button
              onClick={handleExport}
              className="inline-flex min-h-11 items-center gap-2 self-start rounded-xl border border-white/10 px-4 text-[14px] font-medium text-white/60 transition-colors hover:bg-white/05 hover:text-white sm:self-auto"
            >
              <Download className="h-4 w-4" strokeWidth={1.75} />
              Export
            </button>
          )}
        </motion.div>

        {/* Search, status, date range and sort over an empty history is
            furniture for a table that does not exist. */}
        {(hasOrders || hasActiveFilters) && !isLoading && !isError && (
          <OrdersFilters filters={filters} setFilters={setFilters} />
        )}

        {isError ? (
          <SectionError
            title="We couldn't load your orders"
            body="Your orders are safe — this is a problem reaching them. Try again in a moment."
            onRetry={refetch}
          />
        ) : !isLoading && !hasOrders ? (
          hasActiveFilters ? (
            <SectionEmpty
              compact
              icon={Package}
              title="No orders match those filters"
              body="Try a wider date range, or clear the filters to see your full history."
              secondary={{ label: "Clear filters", onClick: () => setFilters(DEFAULT_FILTERS) }}
            />
          ) : (
            <SectionEmpty
              icon={Package}
              title="No orders yet"
              body="When you order flooring, tiles or fixtures from Bogat, you'll track every delivery from here."
              action={{ label: "Browse materials", href: "/bogat/materials", icon: ShoppingBag }}
              secondary={{ label: "Book a consultation", href: "/consultation" }}
            />
          )
        ) : (
          <OrdersTable orders={orders} isLoading={isLoading} isError={false} />
        )}
      </div>
    </DashboardLayout>
  );
}
