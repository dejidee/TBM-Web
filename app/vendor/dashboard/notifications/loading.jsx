/**
 * Mirrors app/vendor/dashboard/notifications/page.jsx: header + two action
 * buttons, a tabs card, then the notification list.
 */
export default function NotificationsLoading() {
  return (
    <div className="max-w-300 mx-auto bg-background animate-pulse" aria-busy="true">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="h-8 w-64 rounded bg-white/08" />
          <div className="mt-2 h-3 w-80 max-w-full rounded bg-white/05" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-36 rounded-lg bg-white/05" />
          <div className="h-10 w-40 rounded-lg bg-white/08" />
        </div>
      </div>

      <div className="mb-6 p-4 bg-surface rounded-xl border border-white/08 flex gap-2">
        <div className="h-9 w-32 rounded-lg bg-white/08" />
        <div className="h-9 w-24 rounded-lg bg-white/05" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-4 bg-surface rounded-xl border border-white/08">
            <div className="h-9 w-9 rounded-full bg-white/08 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 rounded bg-white/08" />
              <div className="h-3 w-1/2 rounded bg-white/05" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
