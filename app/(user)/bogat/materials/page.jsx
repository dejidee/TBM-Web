import { Suspense } from "react";
import BogatMaterialsClient from "./client";
import { API_URL } from "@/lib/env";

export const metadata = {
  title: "Shop Bogat Signature Collections | TBM — Luxury Bathroom Vanities Nigeria",
  description:
    "Browse Bogat's signature stone vanity collections — luxury bathroom vanities, basins, and stone furniture. Fixed pricing and request-quote options. Delivered across Nigeria.",
  keywords:
    "Bogat bathroom vanity Nigeria, luxury stone vanity Abuja, bathroom sanitaryware Lagos, basins Nigeria, bathroom-ware Nigeria",
  openGraph: {
    title: "Shop Bogat Signature Collections | TBM Building Services",
    description:
      "Browse Bogat's premium bathroom vanity and sanitaryware collections. Competitive pricing, fast delivery across Nigeria.",
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
    description: "Premium bathroom vanity and sanitaryware collections.",
  },
  alternates: {
    canonical: "/bogat/materials",
  },
};

async function getInitialProducts() {
  try {
    // brandType=2 (Bogat) — this is Bogat's own shop and must never
    // server-render TBM's general product catalogue, even before the
    // client-side query (which forces the same filter) takes over.
    const res = await fetch(
      `${API_URL}/products?pageNumber=1&pageSize=12&ActiveOnly=true&brandType=2`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export default async function BogatMaterialsPage() {
  const initialData = await getInitialProducts();

  return (
    <Suspense fallback={null}>
      <BogatMaterialsClient initialData={initialData} />
    </Suspense>
  );
}
