import DashboardLayout from "@/components/shared/dashboard/layout";

/**
 * Mirrors app/dashboard/saved/page.jsx: header + action buttons, filter
 * chips, then the saved-items card grid.
 */
export default function SavedItemsLoading() {
  return (
    <DashboardLayout>
      <div className="w-full space-y-6 animate-pulse" aria-busy="true">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="h-8 w-56 rounded bg-white/08" />
            <div className="mt-1.5 h-4 w-72 max-w-full rounded bg-white/05" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-11 w-36 rounded-xl bg-white/05" />
            <div className="h-11 w-28 rounded-xl bg-white/08" />
          </div>
        </div>

        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 w-24 rounded-full bg-white/05" />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/08 overflow-hidden">
              <div className="aspect-square bg-white/05" />
              <div className="p-3 space-y-1.5">
                <div className="h-3.5 w-3/4 rounded bg-white/08" />
                <div className="h-3 w-1/2 rounded bg-white/05" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
