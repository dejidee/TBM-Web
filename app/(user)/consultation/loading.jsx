/**
 * Mirrors app/(user)/consultation/client.jsx step 1: header, stepper, and the
 * stacked list of consultation options (single-select, each row shows its own
 * real fee/duration/format — GET /consultations/types). A spinner here would
 * tell the user nothing about what is arriving.
 *
 * The list is one bordered block with divided rows, not a 2-up grid of cards —
 * if this drifts from the real layout the page will visibly jump when it
 * hydrates, which is worse than showing no skeleton at all.
 */
export default function ConsultationLoading() {
  return (
    <div className="min-h-screen bg-black pt-28 pb-20" aria-busy="true">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 animate-pulse">
        {/* Header */}
        <div className="h-3 w-40 bg-white/6" />
        <div className="mt-4 h-10 sm:h-12 w-72 max-w-full bg-white/8" />
        <div className="mt-5 space-y-2">
          <div className="h-3.5 w-full max-w-xl bg-white/5" />
          <div className="h-3.5 w-2/3 max-w-md bg-white/5" />
        </div>

        {/* Stepper */}
        <div className="mt-10 flex items-center gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 shrink-0 rounded-full bg-white/6" />
              <div className="hidden sm:block h-3 w-24 bg-white/5" />
              {i < 2 && <div className="h-px flex-1 min-w-4 bg-z-line" />}
            </div>
          ))}
        </div>

        {/* "What do you need help with?" + the sub-line */}
        <div className="mt-8 h-4 w-56 bg-white/8" />
        <div className="mt-3 h-3 w-72 max-w-full bg-white/5" />

        {/* Option rows */}
        <div className="mt-5 border border-z-line divide-y divide-z-line">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-z-panel p-5 sm:p-6 flex gap-4 sm:gap-5">
              <div className="w-5 h-5 shrink-0 mt-0.5 bg-white/6" />
              <div className="min-w-0 flex-1">
                <div className="h-4 w-44 max-w-full bg-white/8" />
                <div className="mt-3 space-y-2">
                  <div className="h-3 w-full bg-white/5" />
                  <div className="h-3 w-3/4 bg-white/5" />
                </div>
                <div className="mt-4 flex gap-4">
                  <div className="h-2.5 w-20 bg-white/4" />
                  <div className="h-2.5 w-24 bg-white/4" />
                  <div className="h-2.5 w-16 bg-white/4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Property type field */}
        <div className="mt-6 h-3 w-28 bg-white/6" />
        <div className="mt-2 h-11 w-full bg-white/4 border border-z-line" />

        {/* Nav */}
        <div className="mt-8 flex justify-end">
          <div className="h-11 w-36 bg-white/8" />
        </div>
      </div>
    </div>
  );
}
