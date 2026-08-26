import DashboardLayout from "@/components/shared/dashboard/layout";

/**
 * Mirrors app/dashboard/projects/[id]/financial-overview/page.jsx: back
 * link, header + CTA, three budget cards, then the invoices table.
 */
export default function ProjectFinancialOverviewLoading() {
  return (
    <DashboardLayout>
      <div className="space-y-5 w-full max-w-[700px] animate-pulse" aria-busy="true">
        <div className="h-4 w-32 rounded bg-white/06" />

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="h-7 w-52 rounded bg-white/06" />
            <div className="mt-1.5 h-3 w-64 rounded bg-white/06" />
          </div>
          <div className="h-9 w-36 rounded-lg bg-white/06" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/08 p-4 space-y-3" style={{ background: "#0d0b08" }}>
              <div className="h-8 w-8 rounded-lg bg-white/06" />
              <div className="h-3 w-16 rounded bg-white/06" />
              <div className="h-5 w-20 rounded bg-white/06" />
              <div className="h-1.5 rounded-full bg-white/06" />
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/08 overflow-hidden" style={{ background: "#0d0b08" }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/06">
            <div className="h-4 w-32 rounded bg-white/06" />
            <div className="flex gap-2">
              <div className="h-7 w-16 rounded-lg bg-white/06" />
              <div className="h-7 w-20 rounded-lg bg-white/06" />
            </div>
          </div>
          <div
            className="h-9"
            style={{ background: "rgba(255,255,255,0.02)" }}
          />
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_2fr_1fr_1fr_auto] gap-4 px-5 py-3.5 items-center border-b border-white/04 last:border-0"
            >
              {Array.from({ length: 5 }).map((__, j) => (
                <div key={j} className="h-3 bg-white/06 rounded" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
