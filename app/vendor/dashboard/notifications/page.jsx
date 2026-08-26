"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BellOff, Check, RefreshCw, SlidersHorizontal } from "lucide-react";
import { useNotifications, useMarkAllRead } from "@/hooks/use-notifications";
import NotificationCard from "@/components/shared/vendor/dashboard/notification/card";

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all");

  // `unreadOnly` is the only filter GET /vendor/notifications accepts. The
  // category tabs (Orders (Bogat), Enquiries (TBM), Payments, System Alerts)
  // and the search box were filtering lib/mock/notifications.js in memory —
  // there is no category field and no search parameter on this endpoint.
  const { data, isLoading, isError, refetch } = useNotifications({
    unreadOnly: activeTab === "unread",
  });
  const markAllRead = useMarkAllRead();

  const handleMarkAllRead = () => {
    markAllRead.mutate();
  };

  // Counts were hardcoded (12, 3, 2, 1, 1) and never moved.
  const tabs = [
    { id: "all", label: "All Notifications", count: data?.total ?? 0 },
    { id: "unread", label: "Unread" },
  ];

  const isEmpty = !isLoading && !isError && (data?.items?.length ?? 0) === 0;

  return (
    <div className="max-w-300 mx-auto bg-background">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="font-manrope text-[32px] font-bold text-white mb-2">
              Notifications Center
            </h1>
            <p className="font-manrope text-[14px] text-muted max-w-2xl">
              Stay updated with real-time alerts from TBM and Bogat operations.
              Manage your order updates,
              <br />
              payments, and system messages in one place.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMarkAllRead}
              disabled={markAllRead.isPending}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface-raised border border-white/10 rounded-lg font-manrope text-[13px] font-medium text-white hover:bg-white/05 transition-colors disabled:opacity-50"
            >
              {markAllRead.isPending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Check size={16} />
              )}
              {markAllRead.isPending ? "Marking…" : "Mark all as read"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2.5 bg-accent-solid text-white rounded-lg font-manrope text-[13px] font-medium hover:bg-white/10 transition-colors"
            >
              <SlidersHorizontal size={16} />
              Configure Alerts
            </motion.button>
          </div>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 bg-surface rounded-xl border border-white/08"
      >
        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-manrope text-[13px] font-medium
                whitespace-nowrap transition-colors shrink-0
                ${
                  activeTab === tab.id
                    ? "bg-accent-solid text-white"
                    : "bg-white/05 text-muted hover:bg-white/08"
                }
              `}
            >
              {tab.label}
              {typeof tab.count === "number" && (
                <span
                  className={`
                    px-2 py-0.5 rounded-full text-[11px] font-bold
                    ${
                      activeTab === tab.id
                        ? "bg-white/20 text-white"
                        : "bg-white/10 text-muted"
                    }
                  `}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* The search box filtered the fixture in memory; GET
            /vendor/notifications has no search parameter, so a box that looks
            like it searches and does not is worse than none. */}
      </motion.div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="bg-surface rounded-xl border border-white/08 p-12 text-center">
          <div className="w-12 h-12 border-4 border-white/08 border-t-accent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted font-manrope text-[14px]">
            Loading notifications...
          </p>
        </div>
      ) : isError ? (
        <div className="bg-surface rounded-xl border border-white/08 p-12 text-center">
          <p className="text-white font-manrope text-[15px] mb-2">
            Could not load notifications
          </p>
          <button
            onClick={() => refetch()}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 bg-surface-raised border border-white/10 rounded-lg font-manrope text-[13px] text-white hover:bg-white/05 transition-colors"
          >
            <RefreshCw size={16} />
            Try again
          </button>
        </div>
      ) : isEmpty ? (
        /* The list rendered nothing at all when empty — only the TODAY and
           YESTERDAY sections existed, and both are hidden at length 0. */
        <div className="bg-surface rounded-xl border border-white/08 p-12 text-center">
          <BellOff className="mx-auto mb-3 text-muted" size={28} strokeWidth={1.5} />
          <p className="text-white font-manrope text-[15px] mb-1">
            {activeTab === "unread" ? "Nothing unread" : "No notifications yet"}
          </p>
          <p className="text-muted font-manrope text-[13px]">
            Order and payment alerts will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* EARLIER catches anything older than yesterday — the fixture only
              ever produced two buckets, so older items had nowhere to render. */}
          {[
            ["TODAY", data?.notifications?.TODAY],
            ["YESTERDAY", data?.notifications?.YESTERDAY],
            ["EARLIER", data?.notifications?.EARLIER],
          ]
            .filter(([, list]) => (list?.length ?? 0) > 0)
            .map(([heading, list]) => (
              <div key={heading} className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="font-manrope text-[12px] font-bold text-muted uppercase tracking-wider">
                    {heading}
                  </span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
                <div className="space-y-4">
                  {list.map((notification, index) => (
                    <NotificationCard
                      key={notification.id ?? index}
                      notification={notification}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            ))}

          <div className="text-center mt-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-surface-raised border border-white/10 rounded-lg font-manrope text-[13px] font-medium text-white hover:bg-white/05 transition-colors"
            >
              <RefreshCw size={16} />
              Refresh
            </motion.button>
          </div>
        </>
      )}
    </div>
  );
}
