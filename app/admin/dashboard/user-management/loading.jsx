/**
 * Mirrors app/admin/dashboard/user-management/page.jsx: header + Add User
 * button, filter bar, then the user table (desktop rows; the table component
 * itself switches to cards on mobile, so this stays row-shaped).
 */
export default function UserManagementLoading() {
  return (
    <div className="max-w-360 mx-auto animate-pulse" aria-busy="true">
      <div className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="h-8 w-72 rounded bg-white/08" />
          <div className="mt-2 h-3 w-80 max-w-full rounded bg-white/05" />
        </div>
        <div className="h-11 w-40 rounded-lg bg-white/08" />
      </div>

      <div className="bg-surface rounded-xl border border-white/08 p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="h-11 flex-1 rounded-lg bg-white/05" />
        <div className="h-11 w-full sm:w-40 rounded-lg bg-white/05" />
        <div className="h-11 w-full sm:w-40 rounded-lg bg-white/05" />
      </div>

      <div className="bg-surface rounded-xl border border-white/08 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-6 py-4 border-b border-white/08 last:border-0"
          >
            <div className="h-9 w-9 rounded-full bg-white/08 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-1/3 rounded bg-white/08" />
              <div className="h-3 w-1/4 rounded bg-white/05" />
            </div>
            <div className="h-6 w-16 rounded-full bg-white/08" />
            <div className="h-6 w-11 rounded-full bg-white/08" />
          </div>
        ))}
      </div>
    </div>
  );
}
