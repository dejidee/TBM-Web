import ConsultationDetailClient from "./client";

export const metadata = {
  title: "Your Consultation | TBM Building Services",
  description: "View, reschedule, cancel or pay for your booked consultation.",
  robots: { index: false, follow: false },
};

/**
 * One booking. Reached from the confirmation page and from the manage link a
 * guest is given (`/consultation/{id}?t=<managementToken>`). A signed-in owner
 * lands here without a token and is authorised by their session.
 */
export default async function ConsultationDetailPage({ params }) {
  const { id } = await params;
  return <ConsultationDetailClient id={id} />;
}
