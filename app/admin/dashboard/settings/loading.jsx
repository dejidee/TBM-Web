/**
 * Mirrors app/admin/dashboard/settings/page.jsx: header with two action
 * buttons, a tab row, then a card of toggle rows (the default Payment tab).
 */
export default function SettingsLoading() {
  return (
    <div className="max-w-360 mx-auto px-4 sm:px-6 lg:px-8 animate-pulse" aria-busy="true">
      <div className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="h-9 w-72 rounded bg-white/08" />
          <div className="mt-2 h-3 w-80 max-w-full rounded bg-white/05" />
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
          <div className="h-11 flex-1 md:w-28 rounded-lg bg-white/05" />
          <div className="h-11 flex-1 md:w-32 rounded-lg bg-white/08" />
        </div>
      </div>

      <div className="border-b border-white/08 mb-6 sm:mb-8 flex gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 w-28 rounded-t bg-white/05" />
        ))}
      </div>

      <div className="bg-surface rounded-xl border border-white/08 p-4 sm:p-6 space-y-3 sm:space-y-4">
        <div className="h-5 w-28 rounded bg-white/08 mb-2" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 sm:p-4 bg-white/05 rounded-lg border border-white/08"
          >
            <div className="flex items-center gap-3 sm:gap-4 flex-1">
              <div className="w-10 h-10 rounded-lg bg-white/08 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-white/08" />
                <div className="h-3 w-40 rounded bg-white/05" />
              </div>
            </div>
            <div className="h-6 w-11 rounded-full bg-white/08 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
