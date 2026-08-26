// components/dashboard/DashboardLayout.jsx
"use client";

import Link from "next/link";
import Sidebar from "./sidebar";
import { useDashboardShell } from "./shell-context";

/**
 * The signed-in shell: persistent sidebar, content column, thin legal strip.
 *
 * No marketing footer. A footer is a wayfinding net for a visitor who has run
 * out of page — a signed-in user has the sidebar, so the net is redundant, and
 * re-listing Renovation / Kitchen Remodeling / Privacy under a work surface
 * sells things to someone who already bought. On the empty Overview it was
 * also most of the lower half of the screen.
 *
 * What is left is the part that is actually load-bearing: copyright, privacy,
 * support. One line, muted, at the end of the reading order.
 */
export default function DashboardLayout({ children }) {
  const { sidebarOpen, setSidebarOpen } = useDashboardShell();

  return (
    // Not `min-h-screen`: this renders inside the layout's `mt-16`, so a full
    // viewport height here plus that offset made every dashboard page 64px
    // taller than the screen — a strip of dead black under the legal line, and
    // a scrollbar on pages that otherwise fit. The row below carries the height.
    <div className="bg-black">
      {/* Mobile overlay. The toggle that opens the sidebar lives in the app bar
          (see shell-context.jsx) — it used to be a button floating over the
          page content. */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-x-0 bottom-0 top-16 z-40 bg-black/70 md:hidden"
        />
      )}

      {/* Layout Wrapper.
          Full width, not `max-w-7xl`. Capping the whole shell froze the content
          column at 1024px on every screen and pushed the nav rail inward: at
          1920 that left a 320px black gutter to the *left* of the sidebar, and
          a third of the display empty. A rail that does not touch the viewport
          edge reads as a stray card rather than navigation.
          The cap belongs on the content instead — see <main> below.

          `min-h-[calc(100vh-4rem)]` (viewport minus the fixed h-16 app bar) so the
          sidebar column still runs the full height on pages whose content is
          shorter than the screen — the row is what the sidebar stretches to. */}
      <div className="flex min-h-[calc(100vh-4rem)] w-full">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content — a column, so the legal strip can be pinned to the
            bottom on short pages instead of floating under the fold.
            `max-w-350` is 1400px: wide enough that four product cards are worth
            photographing, narrow enough that no line of body copy runs past a
            readable measure. It was already here but never bound, because the
            shell above it was 120px narrower than the cap. */}
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="mx-auto w-full max-w-350 flex-1 px-4 pb-10 pt-6 font-manrope sm:px-6 lg:px-10">
            {children}
          </main>

          <div className="border-t border-white/06 px-4 py-5 sm:px-6 lg:px-10">
            <div className="mx-auto flex w-full max-w-350 flex-wrap items-center justify-between gap-x-6 gap-y-2">
              <p className="text-[12px] text-white/25">
                © {new Date().getFullYear()} TBM Building Services
              </p>
              <div className="flex items-center gap-5">
                <Link
                  href="/privacy-policy"
                  className="text-[12px] text-white/30 transition-colors hover:text-white/60"
                >
                  Privacy
                </Link>
                <Link
                  href="/contact"
                  className="text-[12px] text-white/30 transition-colors hover:text-white/60"
                >
                  Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
