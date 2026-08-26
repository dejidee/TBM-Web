import BogatClient from "./client";

export const metadata = {
  title: "Bogat Signature Collections | TBM — Luxury Bathroom Vanities for Nigerian Homes",
  description:
    "Explore Bogat's signature stone vanity collections — luxury bathroom vanities, basins, and stone furniture. Sourced for quality, supplied by TBM across Nigeria.",
  keywords:
    "Bogat bathroom vanity Nigeria, luxury stone vanity Abuja, bathroom sanitaryware Lagos, basins Nigeria, Bogat by TBM",
  openGraph: {
    title: "Bogat Signature Collections | TBM Building Services",
    description:
      "Luxury bathroom vanity and sanitaryware collections for homes and commercial spaces across Nigeria.",
    type: "website",
    images: [
      {
        url: "/og-materials.jpg",
        width: 1200,
        height: 630,
        alt: "Bogat Signature Collections by TBM",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bogat Signature Collections | TBM",
    description: "Premium bathroom vanity collections curated for Nigerian homes.",
  },
  alternates: {
    canonical: "/bogat",
  },
};

export default function BogatPage() {
  return <BogatClient />;
}
