import { Suspense } from "react";

import ConsultationClient from "./client";
import ConsultationLoading from "./loading";

export const metadata = {
  title: "Book a Consultation | TBM Building Services",
  description:
    "Book a virtual consultation, site inspection, design session, renovation planning or estimate review with TBM Building Services. Abuja and Lagos, with nationwide coverage.",
  keywords: [
    "book renovation consultation Nigeria",
    "site inspection Abuja",
    "virtual design consultation Lagos",
    "renovation planning consultation",
    "construction estimate review Nigeria",
    "TBM Building Services consultation",
  ],
  openGraph: {
    title: "Book a Consultation | TBM Building Services",
    description:
      "Pick a consultation type, choose a real available time, and confirm instantly. Free consultations confirm on booking, paid ones after checkout.",
    type: "website",
  },
  alternates: { canonical: "/consultation" },
};

/**
 * ConsultationClient reads `?notes=` via useSearchParams (Ziora's "Start
 * Project with TBM" carries a design's brief forward into the booking form's
 * notes field), which opts the subtree into client-side rendering — Next
 * requires a Suspense boundary around it. Mirrors app/ziora/studio/page.jsx.
 */
export default function ConsultationPage() {
  return (
    <Suspense fallback={<ConsultationLoading />}>
      <ConsultationClient />
    </Suspense>
  );
}
