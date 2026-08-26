/**
 * Mirrors app/vendor/dashboard/delivery/page.jsx: header, filters bar, then
 * the assignments table (see components/shared/vendor/dashboard/delivery/table.jsx
 * for the real column layout this shadows).
 */
export default function DeliveryLoading() {
  return (
    <div className="max-w-360 mx-auto bg-background animate-pulse" aria-busy="true">
      <div className="mb-8">
        <div className="h-8 w-64 rounded bg-white/08" />
        <div className="mt-2 h-3 w-72 rounded bg-white/05" />
      </div>

      <div className="bg-surface rounded-xl border border-white/08 p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="h-11 flex-1 rounded-lg bg-white/05" />
        <div className="h-11 w-full sm:w-40 rounded-lg bg-white/05" />
      </div>

      <div className="bg-surface rounded-xl border border-white/08 overflow-hidden">
        <div className="h-10 bg-white/05 border-b border-white/08" />
        <div className="divide-y divide-white/08">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <div className="h-4 w-4 rounded bg-white/08 shrink-0" />
              <div className="h-6 w-20 rounded-full bg-white/08" />
              <div className="h-4 w-16 rounded bg-white/08" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-1/2 rounded bg-white/08" />
                <div className="h-3 w-1/3 rounded bg-white/05" />
              </div>
              <div className="h-4 w-20 rounded bg-white/05" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
