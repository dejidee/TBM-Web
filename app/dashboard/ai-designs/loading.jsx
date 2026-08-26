import DashboardLayout from "@/components/shared/dashboard/layout";

/**
 * Mirrors app/dashboard/ai-designs/page.jsx: header + CTA, a subscription
 * panel band, then the design card grid.
 */
export default function AIDesignsLoading() {
  return (
    <DashboardLayout>
      <div className="w-full space-y-6 animate-pulse" aria-busy="true">
        <div className="flex flex-col gap-4 border-b border-white/08 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="h-8 w-56 rounded bg-white/08" />
            <div className="mt-2 h-4 w-64 rounded bg-white/05" />
          </div>
          <div className="h-11 w-48 rounded-xl bg-white/08" />
        </div>

        <div className="h-24 rounded-2xl bg-white/05" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/08 overflow-hidden">
              <div className="aspect-4/3 bg-white/05" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-2/3 rounded bg-white/08" />
                <div className="h-3 w-1/3 rounded bg-white/05" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
