import DashboardLayout from "@/components/shared/dashboard/layout";

/**
 * Mirrors app/dashboard/projects/[id]/page.jsx: back link, project header,
 * then a two-column layout — milestones + progress photos beside documents,
 * live updates, and the regional office card.
 */
export default function ProjectDetailLoading() {
  return (
    <DashboardLayout>
      <div className="space-y-6 w-full animate-pulse" aria-busy="true">
        <div className="h-4 w-28 rounded bg-white/06" />

        <div className="rounded-2xl border border-white/08 p-6 space-y-3" style={{ background: "#0d0b08" }}>
          <div className="h-6 w-1/2 rounded bg-white/06" />
          <div className="h-3.5 w-1/3 rounded bg-white/06" />
          <div className="h-1.5 rounded-full bg-white/06" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] lg:grid-cols-[1fr_300px] gap-6 items-start">
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/08 p-5 space-y-3" style={{ background: "#0d0b08" }}>
              <div className="h-5 w-32 rounded bg-white/06" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-white/06" />
              ))}
            </div>
            <div className="rounded-2xl border border-white/08 p-5 space-y-3" style={{ background: "#0d0b08" }}>
              <div className="h-5 w-40 rounded bg-white/06" />
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-lg bg-white/06" />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/08 p-5 space-y-2" style={{ background: "#0d0b08" }}>
                <div className="h-4 w-24 rounded bg-white/06" />
                <div className="h-3 w-full rounded bg-white/06" />
                <div className="h-3 w-2/3 rounded bg-white/06" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
