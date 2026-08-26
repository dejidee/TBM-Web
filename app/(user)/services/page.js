import ServicesHero from "@/components/shared/services/hero";
import ServiceList from "@/components/shared/services/service-list";

export const metadata = {
  title: "Services | TBM Building Services — Renovation, Fit-Out & Construction",
  description:
    "Renovation, interior fit-out, bathroom remodeling, kitchen remodeling, construction, maintenance, design consultation, and project supervision across Abuja and Lagos.",
  keywords: [
    "renovation Abuja",
    "interior fit-out Nigeria",
    "bathroom remodeling Abuja",
    "kitchen remodeling Lagos",
    "construction company Nigeria",
    "building maintenance Abuja",
    "design consultation Nigeria",
    "project supervision",
  ],
  openGraph: {
    title: "Services | TBM Building Services",
    description:
      "Expert renovation, construction, and fit-out services across Abuja and Lagos — assisted by Ziora AI, with premium bathroom fixtures from Bogat.",
    type: "website",
  },
};

export default function ServicesPage() {
  return (
    <div>
      <ServicesHero />
      <ServiceList />
    </div>
  );
}
