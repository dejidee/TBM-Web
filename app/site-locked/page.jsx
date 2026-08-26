import UnderConstruction from "@/components/shared/under-construction";

export const metadata = {
  title: "TBM Building Services",
  robots: { index: false, follow: false },
};

// proxy.js rewrites every route here while NEXT_PUBLIC_SITE_LIVE !== "true".
// Outside the (user)/admin/vendor/dashboard route groups on purpose — it must
// render off the bare root layout, not pull in a section-specific shell.
export default function SiteLocked() {
  return <UnderConstruction />;
}
