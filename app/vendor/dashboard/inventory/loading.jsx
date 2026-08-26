/**
 * Mirrors app/vendor/dashboard/inventory/page.jsx: header + two action
 * buttons, stat cards, a search/filter bar, then the product table.
 */
export default function InventoryLoading() {
  return (
    <div className="max-w-360 mx-auto bg-background animate-pulse" aria-busy="true">
      <div className="mb-8 flex flex-col gap-4 md:gap-0 md:flex-row items-start justify-between">
        <div>
          <div className="h-6 w-56 rounded bg-white/08 mb-2" />
          <div className="h-3.5 w-80 max-w-full rounded bg-white/05" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-36 rounded-lg bg-white/05" />
          <div className="h-9 w-40 rounded-lg bg-white/08" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface rounded-xl p-4 border border-white/08">
            <div className="h-3.5 w-20 rounded bg-white/08 mb-2" />
            <div className="h-6 w-16 rounded bg-white/08" />
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-accent/50 overflow-hidden">
        <div className="p-4 bg-surface border-b border-accent flex gap-3">
          <div className="h-10 flex-1 rounded-lg bg-white/05" />
          <div className="h-10 w-32 rounded-lg bg-white/05" />
        </div>
        <div className="divide-y divide-white/08">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <div className="h-10 w-10 rounded-lg bg-white/08 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-1/2 rounded bg-white/08" />
                <div className="h-3 w-1/3 rounded bg-white/05" />
              </div>
              <div className="h-6 w-20 rounded-full bg-white/08" />
              <div className="h-7 w-24 rounded bg-white/05" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
