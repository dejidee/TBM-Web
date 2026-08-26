// app/components/shared/trending-section.jsx
// Server Component — data fetched at build/request time, no client waterfall

import TrendingClient from "./trending-client";
import { API_URL } from "@/lib/env";

const PLACEHOLDER =
  "/product-placeholder.svg";

async function getFeaturedProducts() {
  try {
    const res = await fetch(
      `${API_URL}/products?isFeatured=true&pageSize=4&ActiveOnly=true`,
      {
        next: { revalidate: 300 }, // revalidate every 5 min
        headers: { "Content-Type": "application/json" },
      },
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.items ?? [];
  } catch {
    return [];
  }
}

export default async function TrendingSection() {
  const products = await getFeaturedProducts();

  // Normalise shape
  const normalised = products.map((p) => ({
    id: p.id,
    name: p.name,
    priceDisplay: p.priceDisplay,
    showPrice: p.showPrice,
    image: p.primaryImageUrl || p.images?.[0] || PLACEHOLDER,
    slug: p.slug || p.id,
    categoryName: p.categoryName,
    brandName: p.brandName,
    inStock: p.inStock,
  }));

  return <TrendingClient products={normalised} />;
}
