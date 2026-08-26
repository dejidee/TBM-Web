/**
 * Mirrors app/admin/dashboard/portfolio/page.jsx: header, filter chips, then
 * rows. Shaped like the list rather than the table so it does not read as a
 * table behind the mobile card layout.
 */
export default function AdminPortfolioLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="h-7 w-36 rounded bg-white/08" />
          <div className="mt-2 h-3 w-48 rounded bg-white/05" />
        </div>
        <div className="h-11 w-36 rounded-lg bg-white/08" />
      </div>

      <div className="flex flex-wrap gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-11 w-24 rounded-lg bg-white/05" />
        ))}
      </div>

      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-white/08 p-4"
            style={{ background: "#0d0b08" }}
          >
            <div className="flex items-center gap-4">
              <div className="h-14 w-20 shrink-0 rounded-lg bg-white/06" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 rounded bg-white/08" />
                <div className="h-3 w-1/3 rounded bg-white/05" />
              </div>
              <div className="h-6 w-20 rounded-full bg-white/06" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
