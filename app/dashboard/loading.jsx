import DashboardLayout from "@/components/shared/dashboard/layout";

/**
 * Mirrors app/dashboard/page.jsx: the greeting header, then the same shape
 * its own `OverviewSkeleton` uses for the client-fetch gap — a wide band, a
 * launcher row, then a product grid. Wrapped in `DashboardLayout` so the
 * sidebar doesn't pop in after this fallback resolves.
 */
export default function DashboardOverviewLoading() {
  return (
    <DashboardLayout>
      <div className="w-full space-y-8 animate-pulse" aria-busy="true">
        <div>
          <div className="h-8 w-64 rounded bg-white/08" />
          <div className="mt-2 h-4 w-48 rounded bg-white/05" />
        </div>

        <div className="h-72 rounded-3xl bg-white/05" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-17 rounded-2xl bg-white/05" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="aspect-4/5 bg-white/05" />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
