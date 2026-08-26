/**
 * Mirrors app/admin/dashboard/page.jsx: header with two actions, two rows of
 * three stat cards, then a chart panel beside the alerts panel.
 */
export default function AdminDashboardLoading() {
  return (
    <div className="max-w-360 mx-auto animate-pulse" aria-busy="true">
      <div className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
        <div>
          <div className="h-8 w-56 rounded bg-white/08" />
          <div className="mt-2 h-3 w-64 rounded bg-white/05" />
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="h-11 w-full sm:w-40 rounded-lg bg-white/05" />
          <div className="h-11 w-full sm:w-40 rounded-lg bg-white/08" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-surface rounded-xl p-5 border border-white/08">
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 w-28 rounded bg-white/08" />
              <div className="h-9 w-9 rounded-lg bg-white/08" />
            </div>
            <div className="h-8 w-24 rounded bg-white/08 mb-3" />
            <div className="h-3 w-32 rounded bg-white/08" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface rounded-xl p-6 border border-white/08">
          <div className="h-5 w-40 rounded bg-white/08 mb-6" />
          <div className="h-52 rounded-lg bg-white/08" />
        </div>
        <div className="bg-surface rounded-xl p-5 border border-white/08">
          <div className="h-5 w-32 rounded bg-white/08 mb-6" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4 mb-4 last:mb-0">
              <div className="h-4 w-4 rounded-full bg-white/08 mt-0.5 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-white/08" />
                <div className="h-3 w-1/2 rounded bg-white/08" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
