/**
 * Mirrors app/admin/dashboard/consultations/page.jsx: header, tab strip,
 * filter chips, then rows — shaped like the list so it does not read as a
 * table behind the mobile card layout.
 */
export default function AdminConsultationsLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true">
      <div>
        <div className="h-7 w-44 rounded bg-white/08" />
        <div className="mt-2 h-3 w-72 rounded bg-white/05" />
      </div>
      <div className="flex gap-6 border-b border-white/08 pb-3">
        <div className="h-4 w-16 rounded bg-white/08" />
        <div className="h-4 w-14 rounded bg-white/05" />
      </div>
      <div className="flex flex-wrap gap-2">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-11 w-28 rounded-lg bg-white/05" />)}
      </div>
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-white/08 p-4" style={{ background: "#0d0b08" }}>
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-white/08" />
                <div className="h-3 w-1/2 rounded bg-white/05" />
              </div>
              <div className="h-6 w-24 rounded-full bg-white/06" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
