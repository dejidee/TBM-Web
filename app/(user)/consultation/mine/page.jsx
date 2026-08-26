import MyConsultationsClient from "./client";

export const metadata = {
  title: "My Consultations | TBM Building Services",
  description: "View, reschedule or cancel your booked consultations.",
  alternates: { canonical: "/consultation/mine" },
};

export default function MyConsultationsPage() {
  return <MyConsultationsClient />;
}
