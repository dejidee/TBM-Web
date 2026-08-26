/**
 * Mirrors app/admin/dashboard/system-log/page.jsx: header + export button,
 * four stat cards, a search/filter bar, then a log list.
 */
export default function SystemLogLoading() {
  return (
    <div className="max-w-360 mx-auto animate-pulse" aria-busy="true">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="h-8 w-56 rounded bg-white/08" />
          <div className="mt-2 h-3 w-80 max-w-full rounded bg-white/05" />
        </div>
        <div className="h-10 w-32 rounded-lg bg-white/08" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface rounded-xl p-6 border border-white/08">
            <div className="h-3.5 w-32 rounded bg-white/08 mb-3" />
            <div className="h-8 w-20 rounded bg-white/08" />
          </div>
        ))}
      </div>

      <div className="bg-surface rounded-xl border border-white/08 p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="h-11 rounded-lg bg-white/05" />
          <div className="h-11 rounded-lg bg-white/05" />
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-white/08 p-4 sm:p-6 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-white/05 last:border-0">
            <div className="h-4 w-4 rounded-full bg-white/08 shrink-0" />
            <div className="h-4 flex-1 rounded bg-white/05" />
            <div className="h-4 w-20 rounded bg-white/05" />
            <div className="h-4 w-32 rounded bg-white/05" />
          </div>
        ))}
      </div>
    </div>
  );
}
