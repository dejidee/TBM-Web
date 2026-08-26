"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Calendar,
  Package,
  Upload,
  X,
} from "lucide-react";
import { useOrders, useImportOrders } from "@/hooks/use-orders";
import { useOrderStatuses } from "@/hooks/use-lookups";
import OrdersTable from "@/components/shared/vendor/dashboard/table";
import Pagination from "@/components/shared/vendor/dashboard/pagination";

export default function OrdersPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 5,
    status: "all",
    type: "all",
    dateRange: "last30days",
    search: "",
  });

  const [searchInput, setSearchInput] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);

  const { data, isLoading, isError } = useOrders(filters);
  const { data: orderStatuses } = useOrderStatuses();
  const importOrders = useImportOrders();

  // DATA CHECKS
  // console.log("orders: ", data)

  const handleSearch = (value) => {
    setSearchInput(value);
    if (value.trim()) {
      setFilters((prev) => ({ ...prev, search: value, page: 1 }));
    } else {
      setFilters((prev) => ({ ...prev, search: "", page: 1 }));
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value, page: 1 }));

    // Update active filters display
    if (value !== "all" && filterType !== "page" && filterType !== "limit") {
      const filterLabel =
        filterType === "type"
          ? `Type: ${value}`
          : filterType === "status"
            ? // `value` is the numeric OrderStatus the dropdown now sends
              // (GET /lookups/order-statuses) — show the name, not the number.
              `Status: ${orderStatuses?.find((s) => String(s.value) === String(value))?.name ?? value}`
            : filterType === "dateRange"
              ? `Date: ${value}`
              : value;

      setActiveFilters((prev) => {
        const filtered = prev.filter((f) => !f.startsWith(filterType));
        return [...filtered, `${filterType}:${filterLabel}`];
      });
    }
  };

  const removeFilter = (filterKey) => {
    const [type] = filterKey.split(":");
    setFilters((prev) => ({ ...prev, [type]: "all" }));
    setActiveFilters((prev) => prev.filter((f) => !f.startsWith(type)));
  };

  const clearAllFilters = () => {
    setFilters((prev) => ({
      ...prev,
      status: "all",
      type: "all",
      dateRange: "last30days",
    }));
    setActiveFilters([]);
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      importOrders.mutate(file);
      // Reset file input
      e.target.value = '';
    }
  };

  return (
    <div className="max-w-360 mx-auto bg-background">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="font-manrope text-[32px] font-bold text-white mb-2">
              Order Management
            </h1>
            <p className="font-manrope text-[14px] text-muted">
              Track e-commerce shipments and renovation service requests in
              real-time.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => document.getElementById('import-orders-file')?.click()}
              disabled={importOrders.isPending}
              className="flex items-center gap-2 px-4 py-2.5 bg-accent-solid text-white rounded-lg font-manrope text-[13px] font-medium hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importOrders.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload size={16} />
              )}
              {importOrders.isPending ? "Importing..." : "Import"}
            </motion.button>
            <input
              id="import-orders-file"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 bg-surface rounded-xl border border-white/08"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by Order ID, Customer..."
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/05 border border-white/08 rounded-lg font-manrope text-[13px] text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <SlidersHorizontal
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              size={16}
            />
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-surface-raised border border-white/10 rounded-lg font-manrope text-[13px] text-white focus:outline-none focus:ring-2 focus:ring-accent/40 appearance-none cursor-pointer"
            >
              <option value="all">Status: All</option>
              {orderStatuses?.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="relative">
            <Calendar
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              size={16}
            />
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange("dateRange", e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-surface-raised border border-white/10 rounded-lg font-manrope text-[13px] text-white focus:outline-none focus:ring-2 focus:ring-accent/40 appearance-none cursor-pointer"
            >
              <option value="last30days">Last 30 Days</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last90days">Last 90 Days</option>
              <option value="thisyear">This Year</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Package
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              size={16}
            />
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-surface-raised border border-white/10 rounded-lg font-manrope text-[13px] text-white focus:outline-none focus:ring-2 focus:ring-accent/40 appearance-none cursor-pointer"
            >
              <option value="all">Type: All</option>
              <option value="renovation">Renovation</option>
              <option value="e-commerce">E-commerce</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-3"
        >
          <span className="font-manrope text-[12px] text-muted uppercase tracking-wider">
            ACTIVE FILTERS:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {activeFilters.map((filter) => {
              const [, label] = filter.split(":");
              return (
                <motion.button
                  key={filter}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  onClick={() => removeFilter(filter)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-chart-1/10 text-chart-1 rounded-lg font-manrope text-[12px] font-medium hover:bg-chart-1/10 transition-colors group"
                >
                  {label}
                  <X
                    size={14}
                    className="group-hover:scale-110 transition-transform"
                  />
                </motion.button>
              );
            })}
            <button
              onClick={clearAllFilters}
              className="font-manrope text-[12px] text-muted hover:text-white underline"
            >
              Clear all
            </button>
          </div>
        </motion.div>
      )}

      {/* Orders Table */}
      {/* GET /vendor/orders answers { items, total, page, pageSize } — no
          `orders`/`pagination` keys, and no `totalPages` (unlike the enveloped
          Paged<T> shape other list endpoints use). This read `data?.orders`
          and `data.pagination.page/totalPages` until 2026-08-11, which was
          always undefined against the real response — the table silently
          showed "No orders found" and pagination never rendered, regardless
          of how many orders actually existed. See lib/api/schemas/orders.ts. */}
      <OrdersTable orders={data?.items} isLoading={isLoading} isError={isError} />

      {data?.total > (data?.pageSize ?? filters.limit) && (
        <Pagination
          currentPage={data.page}
          totalPages={Math.ceil(data.total / (data.pageSize || filters.limit))}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
