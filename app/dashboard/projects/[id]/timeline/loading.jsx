import DashboardLayout from "@/components/shared/dashboard/layout";

/**
 * Mirrors app/dashboard/projects/[id]/timeline/page.jsx: back link, header +
 * export button, an overall-progress card, then the milestone list.
 */
export default function ProjectTimelineLoading() {
  return (
    <DashboardLayout>
      <div className="space-y-6 w-full max-w-[700px] animate-pulse" aria-busy="true">
        <div className="h-4 w-32 rounded bg-white/06" />

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="h-7 w-48 rounded bg-white/06" />
            <div className="mt-1.5 h-3 w-56 rounded bg-white/06" />
          </div>
          <div className="h-9 w-32 rounded-lg bg-white/06" />
        </div>

        <div className="rounded-2xl border border-white/08 px-5 py-4" style={{ background: "#0d0b08" }}>
          <div className="h-4 w-32 rounded bg-white/06 mb-3" />
          <div className="h-2.5 rounded-full bg-white/06" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/08 p-5 space-y-2" style={{ background: "#0d0b08" }}>
              <div className="h-4 w-1/3 rounded bg-white/06" />
              <div className="h-3 w-2/3 rounded bg-white/06" />
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
