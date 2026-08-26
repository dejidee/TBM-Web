/**
 * Mirrors the studio's real layout — the sticky bar, the heading block, and the
 * two-column body — rather than a spinner, so the page does not jump when the
 * form arrives.
 */
export default function StudioLoading() {
  return (
    <div className="min-h-screen bg-black">
      <div className="h-16 border-b border-white/07" style={{ background: "rgba(9,8,6,0.82)" }}>
        <div className="mx-auto flex h-full w-full max-w-6xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <div className="h-9 w-9 animate-pulse rounded-xl bg-white/06" />
          <div className="mx-auto h-3.5 w-28 animate-pulse rounded bg-white/06" />
          <div className="ml-auto h-6 w-36 animate-pulse rounded-full bg-white/06" />
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-8 w-72 animate-pulse rounded bg-white/06" />
        <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-white/06" />

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="h-4 w-44 animate-pulse rounded bg-white/06" />
            <div className="aspect-[4/3] w-full animate-pulse rounded-2xl bg-white/06" />
          </div>
          <div className="space-y-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 w-36 animate-pulse rounded bg-white/06" />
                <div className="h-24 w-full animate-pulse rounded-2xl bg-white/06" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
