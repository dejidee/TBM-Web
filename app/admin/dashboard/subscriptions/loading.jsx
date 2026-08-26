/**
 * Mirrors app/admin/dashboard/subscriptions/page.jsx: header, tab row, then
 * the pricing table (the default tab).
 */
export default function SubscriptionsLoading() {
  return (
    <div className="max-w-360 mx-auto animate-pulse" aria-busy="true">
      <div className="mb-8">
        <div className="h-8 w-72 rounded bg-white/08" />
        <div className="mt-2 h-3 w-96 max-w-full rounded bg-white/05" />
      </div>

      <div className="border-b border-white/08 mb-6 -mx-4 sm:mx-0 flex gap-6 px-4 sm:px-0">
        <div className="h-10 w-40 rounded-t bg-white/05" />
        <div className="h-10 w-44 rounded-t bg-white/05" />
      </div>

      <div className="bg-surface rounded-xl border border-white/08 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-white/08">
          <div className="h-4 w-56 rounded bg-white/08" />
          <div className="mt-2 h-3 w-72 max-w-full rounded bg-white/05" />
        </div>
        <div className="p-4 sm:p-6 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-white/05 last:border-0">
              <div className="h-4 w-20 rounded bg-white/08" />
              <div className="h-4 flex-1 rounded bg-white/05" />
              <div className="h-4 w-16 rounded bg-white/05" />
              <div className="h-4 w-16 rounded bg-white/05" />
              <div className="h-8 w-16 rounded-lg bg-white/08" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
