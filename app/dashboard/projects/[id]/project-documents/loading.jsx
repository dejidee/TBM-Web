import DashboardLayout from "@/components/shared/dashboard/layout";

/**
 * Mirrors app/dashboard/projects/[id]/project-documents/page.jsx: back link,
 * header + search/upload, tab row, then the document table — reusing that
 * page's own `SkeletonRow` shape for the rows.
 */
export default function ProjectDocumentsLoading() {
  return (
    <DashboardLayout>
      <div className="space-y-5 w-full max-w-[720px] animate-pulse" aria-busy="true">
        <div className="h-4 w-32 rounded bg-white/06" />

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="h-7 w-56 rounded bg-white/06" />
            <div className="mt-1.5 h-3 w-64 rounded bg-white/06" />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-44 rounded-lg bg-white/06" />
            <div className="h-9 w-36 rounded-lg bg-white/06" />
          </div>
        </div>

        <div className="flex items-center gap-4 border-b border-white/08 pb-px">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-8 w-20 rounded-t bg-white/06" />
          ))}
        </div>

        <div className="rounded-2xl border border-white/08 overflow-hidden" style={{ background: "#0d0b08" }}>
          <div
            className="h-10"
            style={{ background: "rgba(255,255,255,0.02)" }}
          />
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3.5 items-center border-b border-white/04 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/06 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 bg-white/06 rounded w-3/4" />
                  <div className="h-2.5 bg-white/06 rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-white/06 rounded w-16" />
              <div className="h-3 bg-white/06 rounded w-20" />
              <div className="h-3 bg-white/06 rounded w-12" />
              <div className="w-5 h-5 bg-white/06 rounded" />
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
