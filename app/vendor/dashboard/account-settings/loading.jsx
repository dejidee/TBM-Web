/**
 * Mirrors app/vendor/dashboard/account-settings/page.jsx: header, tab row,
 * then the Profile tab's avatar-plus-form card (the default tab).
 */
export default function AccountSettingsLoading() {
  return (
    <div className="max-w-300 mx-auto bg-background animate-pulse" aria-busy="true">
      <div className="mb-8">
        <div className="h-8 w-56 rounded bg-white/08" />
        <div className="mt-2 h-3 w-80 max-w-full rounded bg-white/05" />
      </div>

      <div className="mb-8 border-b border-white/08 flex gap-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 w-24 rounded-t bg-white/05" />
        ))}
      </div>

      <div className="bg-surface rounded-xl border border-white/08 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-full bg-white/08" />
            <div className="h-9 w-32 rounded-lg bg-white/05" />
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-11 rounded-lg bg-white/05" />
              <div className="h-11 rounded-lg bg-white/05" />
            </div>
            <div className="h-11 rounded-lg bg-white/05" />
            <div className="h-11 rounded-lg bg-white/05" />
          </div>
        </div>
      </div>
    </div>
  );
}
