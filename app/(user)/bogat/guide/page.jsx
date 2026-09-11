import BogatGuideClient from "./client";

export const metadata = {
  title: "How to Shop with Bogat: Marketplace Guide | TBM",
  description:
    "A complete guide to browsing, ordering, and getting premium materials from Bogat by TBM. Learn how to filter products, request prices, add to cart, and receive your delivery.",
  keywords: [
    "Bogat shopping guide",
    "how to order Bogat materials",
    "Bogat marketplace guide",
    "premium materials Nigeria",
    "TBM Bogat",
  ],
  openGraph: {
    title: "How to Shop with Bogat | TBM Building Services",
    description:
      "Your complete shopping guide: browse, request prices, order, and receive premium materials from Bogat.",
    type: "website",
  },
};

export default function BogatGuidePage() {
  return <BogatGuideClient />;
}
