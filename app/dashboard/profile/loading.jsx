import DashboardLayout from "@/components/shared/dashboard/layout";

/**
 * Mirrors app/dashboard/profile/page.jsx: header, the tab row, then a form
 * card (the default Personal tab).
 */
export default function ProfileLoading() {
  return (
    <DashboardLayout>
      <div className="w-full space-y-6 animate-pulse" aria-busy="true">
        <div>
          <div className="h-8 w-40 rounded bg-white/08" />
          <div className="mt-2 h-4 w-64 rounded bg-white/05" />
        </div>

        <div className="flex gap-2 border-b border-white/08 pb-px">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 w-28 rounded-t bg-white/05" />
          ))}
        </div>

        <div className="rounded-xl border border-white/08 p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-11 rounded-lg bg-white/05" />
            <div className="h-11 rounded-lg bg-white/05" />
          </div>
          <div className="h-11 rounded-lg bg-white/05" />
          <div className="h-11 rounded-lg bg-white/05" />
        </div>
      </div>
    </DashboardLayout>
  );
}
