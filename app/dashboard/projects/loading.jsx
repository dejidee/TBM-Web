import DashboardLayout from "@/components/shared/dashboard/layout";

/**
 * Mirrors app/dashboard/projects/page.jsx: header, then a card grid — the
 * same shape as that page's own inline `SkeletonCard`.
 */
export default function ProjectsListLoading() {
  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        <div>
          <div className="h-7 w-40 animate-pulse rounded bg-white/06" />
          <div className="mt-1.5 h-3.5 w-56 animate-pulse rounded bg-white/06" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/08 overflow-hidden animate-pulse"
              style={{ background: "#0d0b08" }}
            >
              <div className="px-5 pt-5 pb-4 space-y-3">
                <div className="h-5 bg-white/06 rounded w-24" />
                <div className="h-6 bg-white/06 rounded w-3/4" />
                <div className="h-3.5 bg-white/06 rounded w-1/2" />
              </div>
              <div className="px-5 pb-4 space-y-1.5">
                <div className="h-1.5 bg-white/06 rounded-full" />
              </div>
              <div className="border-t border-white/06 px-5 py-4">
                <div className="h-8 bg-white/06 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
