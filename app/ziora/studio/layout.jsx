import "../../globals.css";

/**
 * The Ziora studio is a chromeless route, deliberately.
 *
 * It sits outside both the marketing shell (`app/(user)/layout.js` — navbar,
 * footer, concierge) and the dashboard shell (`app/dashboard/layout.jsx` —
 * app bar, sidebar) because it is not a page you browse, it is a tool you use.
 * Generation is a single sustained task with a two-column body and a large
 * image preview, and every pixel of surrounding navigation is an invitation to
 * abandon it halfway.
 *
 * The escape route is explicit instead: one "Back to My Designs" control,
 * first in the reading order. See components/shared/ziora/studio-view.jsx.
 *
 * No <Providers> here — the root layout (app/layout.js) already supplies them.
 */
export const metadata = {
  title: "Ziora Studio | TBM Building Services",
  description:
    "Upload your room, choose a style, and let Ziora render your redesigned space.",
  robots: { index: false, follow: false },
};

export default function ZioraStudioLayout({ children }) {
  return <div className="min-h-screen bg-black">{children}</div>;
}
