/**
 * Mirrors app/vendor/dashboard/messages/page.jsx: header, then a two-panel
 * layout — conversation sidebar (search + list) beside the chat pane.
 */
export default function MessagesLoading() {
  return (
    <div className="h-[calc(100vh-65px)] flex flex-col bg-background overflow-hidden animate-pulse" aria-busy="true">
      <div className="px-4 md:px-6 py-4 md:py-6 bg-surface border-b border-white/08">
        <div className="h-6 w-48 rounded bg-white/08 mb-1.5" />
        <div className="h-3 w-72 max-w-full rounded bg-white/05" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:flex w-85 bg-surface border-r border-white/08 flex-col">
          <div className="p-4 border-b border-white/08">
            <div className="h-10 rounded-lg bg-white/05" />
          </div>
          <div className="p-3 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <div className="h-10 w-10 rounded-full bg-white/08 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-2/3 rounded bg-white/08" />
                  <div className="h-3 w-1/2 rounded bg-white/05" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden md:flex flex-1 flex-col items-center justify-center gap-3">
          <div className="h-12 w-12 rounded-full bg-white/08" />
          <div className="h-3 w-40 rounded bg-white/05" />
        </div>
      </div>
    </div>
  );
}
