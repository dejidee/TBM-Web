// app/dashboard/saved/page.jsx
"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { FolderPlus, Heart, ShoppingBag } from "lucide-react";

import { useSavedItems, useBuyAll, useCreateBoard } from "@/hooks/use-saved";
import DashboardLayout from "@/components/shared/dashboard/layout";
import SavedItemsFilters from "@/components/shared/dashboard/saved-items/filters";
import SavedItemsGrid from "@/components/shared/dashboard/saved-items/grid";
import SectionEmpty from "@/components/shared/dashboard/section-empty";
import SectionError from "@/components/shared/dashboard/section-error";

const DEFAULT_FILTERS = {
  search: "",
  category: "all",
  sortBy: "date-added",
};

export default function SavedItemsPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selectedItems, setSelectedItems] = useState([]);

  const { data: items = [], isLoading, isError, refetch } = useSavedItems(filters);

  // `sortBy` only reorders the same set, so it is not a filter — narrowing is
  // what decides whether an empty result is a dead end or something to undo.
  const hasActiveFilters = filters.search !== "" || filters.category !== "all";
  const createBoard = useCreateBoard();
  const buyAll = useBuyAll();

  const handleCreateBoard = () => {
    const itemIds =
      selectedItems.length > 0 ? selectedItems : items.map((item) => item.id);
    if (itemIds.length === 0) return;

    const boardName = prompt("Enter board name:");
    if (boardName) {
      createBoard.mutate(
        { itemIds, boardName },
        {
          onSuccess: () => setSelectedItems([]),
        },
      );
    }
  };

  const handleBuyAll = () => {
    // Use selected items if any, otherwise all items
    const targetItems =
      selectedItems.length > 0
        ? items.filter((item) => selectedItems.includes(item.id))
        : items;

    const itemIds = targetItems.map((item) => item.id);
    if (itemIds.length === 0) return;

    buyAll.mutate(itemIds);
  };

  const totalItems = items.length;

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-white/08"
        >
          <div>
            <h1 className="text-[28px] md:text-[32px] font-semibold text-white leading-tight">
              My Saved Items
            </h1>
            <p className="text-[14px] text-white/50 mt-1">
              Organize your materials, products, and inspiration for upcoming
              projects.
            </p>
          </div>

          {/* Both actions operate on the saved set, so with nothing saved they
              are removed rather than disabled. A gold gradient at 50% opacity
              still reads as the page's primary call to action — "Buy All" sat
              next to a counter reading 0 and could never do anything. */}
          {totalItems > 0 && (
            <div className="flex shrink-0 items-center gap-3">
              <button
                onClick={handleCreateBoard}
                disabled={createBoard.isPending}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-[14px] font-medium text-white/60 transition-colors hover:bg-white/05 hover:text-white disabled:opacity-50"
              >
                {createBoard.isPending ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white/70" />
                ) : (
                  <FolderPlus className="h-4 w-4" strokeWidth={1.75} />
                )}
                {createBoard.isPending ? "Creating…" : "Create Board"}
              </button>
              <button
                onClick={handleBuyAll}
                disabled={buyAll.isPending}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-[14px] font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
              >
                <ShoppingBag className="h-4 w-4" strokeWidth={2} />
                {buyAll.isPending
                  ? "Adding…"
                  : selectedItems.length > 0
                    ? `Buy Selected (${selectedItems.length})`
                    : "Buy All"}
              </button>
            </div>
          )}
        </motion.div>

        {/* Search and category chips over an empty board are controls for a set
            that does not exist yet. Kept whenever a filter is on, so a search
            that matches nothing can always be undone. */}
        {(totalItems > 0 || hasActiveFilters) && !isLoading && !isError && (
          <SavedItemsFilters
            filters={filters}
            setFilters={setFilters}
            totalItems={totalItems}
          />
        )}

        {isError ? (
          <SectionError
            title="We couldn't load your saved items"
            body="Nothing has been lost — this is a problem reaching them. Try again in a moment."
            onRetry={refetch}
          />
        ) : !isLoading && totalItems === 0 ? (
          hasActiveFilters ? (
            <SectionEmpty
              compact
              icon={Heart}
              title="Nothing matches that search"
              body="Try a different term, or clear the filters to see everything you've saved."
              secondary={{ label: "Clear filters", onClick: () => setFilters(DEFAULT_FILTERS) }}
            />
          ) : (
            <SectionEmpty
              icon={Heart}
              title="Nothing saved yet"
              body="Tap the heart on any material to keep it here — build a shortlist for a room, then order the whole thing at once."
              action={{ label: "Browse materials", href: "/bogat/materials", icon: ShoppingBag }}
              secondary={{ label: "Design a room first", href: "/ziora/studio" }}
            />
          )
        ) : (
          <SavedItemsGrid
            items={items}
            isLoading={isLoading}
            isError={false}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
