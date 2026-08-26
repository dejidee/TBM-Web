import DashboardLayout from "@/components/shared/dashboard/layout";

/**
 * Mirrors app/dashboard/orders/page.jsx: header, filters bar, then the
 * orders table.
 */
export default function OrdersLoading() {
  return (
    <DashboardLayout>
      <div className="w-full space-y-6 animate-pulse" aria-busy="true">
        <div>
          <div className="h-8 w-48 rounded bg-white/08" />
          <div className="mt-2 h-4 w-64 rounded bg-white/05" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="h-11 flex-1 rounded-lg bg-white/05" />
          <div className="h-11 w-full sm:w-40 rounded-lg bg-white/05" />
        </div>

        <div className="rounded-xl border border-white/08 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-white/08 last:border-0">
              <div className="h-4 w-24 rounded bg-white/08" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-1/2 rounded bg-white/08" />
                <div className="h-3 w-1/3 rounded bg-white/05" />
              </div>
              <div className="h-6 w-20 rounded-full bg-white/08" />
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
