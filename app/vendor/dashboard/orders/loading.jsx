/**
 * Mirrors app/vendor/dashboard/orders/page.jsx: header + import button,
 * filters bar, then the orders table.
 */
export default function OrdersLoading() {
  return (
    <div className="max-w-360 mx-auto bg-background animate-pulse" aria-busy="true">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="h-8 w-64 rounded bg-white/08" />
          <div className="mt-2 h-3 w-80 max-w-full rounded bg-white/05" />
        </div>
        <div className="h-11 w-32 rounded-lg bg-white/08" />
      </div>

      <div className="mb-6 p-4 bg-surface rounded-xl border border-white/08 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
        <div className="flex-1 h-11 rounded-lg bg-white/05" />
        <div className="h-11 w-full md:w-40 rounded-lg bg-white/05" />
        <div className="h-11 w-full md:w-40 rounded-lg bg-white/05" />
      </div>

      <div className="bg-surface rounded-xl border border-white/08 overflow-hidden">
        <div className="h-10 bg-white/05 border-b border-white/08" />
        <div className="divide-y divide-white/08">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <div className="h-4 w-20 rounded bg-white/08" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-1/2 rounded bg-white/08" />
                <div className="h-3 w-1/3 rounded bg-white/05" />
              </div>
              <div className="h-6 w-20 rounded-full bg-white/08" />
              <div className="h-4 w-16 rounded bg-white/05" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
