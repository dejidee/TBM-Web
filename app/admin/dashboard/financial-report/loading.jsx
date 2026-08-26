/**
 * Mirrors app/admin/dashboard/financial-report/page.jsx: header + export
 * button, three stat cards, a revenue chart beside a donut chart, then a
 * transactions table.
 */
export default function FinancialReportLoading() {
  return (
    <div className="max-w-360 mx-auto animate-pulse" aria-busy="true">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="h-8 w-64 rounded bg-white/08" />
          <div className="mt-2 h-3 w-72 max-w-full rounded bg-white/05" />
        </div>
        <div className="h-11 w-full sm:w-40 rounded-lg bg-white/08" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface rounded-xl p-6 border border-white/08 flex items-start justify-between"
          >
            <div className="space-y-2">
              <div className="h-3.5 w-28 rounded bg-white/08" />
              <div className="h-8 w-24 rounded bg-white/08" />
            </div>
            <div className="w-10 h-10 rounded-lg bg-white/08 shrink-0" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-surface rounded-xl border border-white/08 p-6">
          <div className="h-5 w-48 rounded bg-white/08 mb-6" />
          <div className="h-52 rounded-lg bg-white/08" />
        </div>
        <div className="bg-surface rounded-xl border border-white/08 p-6 flex flex-col items-center">
          <div className="h-5 w-40 self-start rounded bg-white/08 mb-6" />
          <div className="w-40 h-40 rounded-full bg-white/08" />
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-white/08 p-4 sm:p-6 space-y-2">
        <div className="h-5 w-40 rounded bg-white/08 mb-4" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3">
            <div className="h-4 flex-1 rounded bg-white/05" />
            <div className="h-4 w-24 rounded bg-white/05" />
            <div className="h-4 w-20 rounded bg-white/05" />
            <div className="h-4 w-16 rounded bg-white/05" />
          </div>
        ))}
      </div>
    </div>
  );
}
