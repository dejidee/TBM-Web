/**
 * Mirrors app/vendor/dashboard/page.jsx: header, four stat cards, an alerts
 * panel beside quick actions, then a recent-activity list.
 */
export default function VendorDashboardLoading() {
  return (
    <div className="max-w-360 mx-auto bg-background animate-pulse" aria-busy="true">
      <div className="mb-8">
        <div className="h-8 w-56 rounded bg-white/08" />
        <div className="mt-2 h-3 w-64 rounded bg-white/05" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface rounded-xl p-5 border border-white/08">
            <div className="h-4 w-24 rounded bg-white/08 mb-3" />
            <div className="h-8 w-20 rounded bg-white/08 mb-3" />
            <div className="h-3 w-28 rounded bg-white/08" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-surface rounded-xl border border-white/08 p-5 space-y-3">
          <div className="h-5 w-32 rounded bg-white/08 mb-2" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-white/05" />
          ))}
        </div>
        <div className="bg-surface rounded-xl border border-white/08 p-5 space-y-3">
          <div className="h-5 w-28 rounded bg-white/08 mb-2" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-11 rounded-lg bg-white/05" />
          ))}
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-white/08 p-5 space-y-3">
        <div className="h-5 w-40 rounded bg-white/08 mb-2" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-white/08 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-2/3 rounded bg-white/08" />
              <div className="h-3 w-1/3 rounded bg-white/05" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
