import { notFound } from "next/navigation";
import MaterialDetailClient from "./client";
import { API_URL } from "@/lib/env";

// ─── Server-side fetchers ─────────────────────────────────────────────────────
async function getProduct(slug) {
  try {
    const res = await fetch(`${API_URL}/Products/slug/${slug}`, {
      next: { revalidate: 120 },
      headers: {
        "Content-Type": "application/json",
        ...(process.env.API_KEY
          ? { Authorization: `Bearer ${process.env.API_KEY}` }
          : {}),
      },
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch {
    return null;
  }
}

async function getSimilarProducts(categoryId, excludeId) {
  if (!categoryId) return [];
  try {
    const params = new URLSearchParams({
      categoryId,
      pageSize: "8",
      ActiveOnly: "true",
    });
    const res = await fetch(`${API_URL}/products?${params.toString()}`, {
      next: { revalidate: 300 },
      headers: {
        "Content-Type": "application/json",
        ...(process.env.API_KEY
          ? { Authorization: `Bearer ${process.env.API_KEY}` }
          : {}),
      },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data?.items ?? []).filter((p) => p.id !== excludeId);
  } catch {
    return [];
  }
}

// ─── SEO Metadata ─────────────────────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Material Not Found | TBM",
      description: "The requested material could not be found.",
    };
  }

  const imageUrl =
    product.primaryImageUrl || product.images?.[0] || "/og-product.jpg";
  const description =
    product.shortDescription ||
    product.description ||
    `${product.name}: ${product.priceDisplay ?? "Request Price"}. ${product.inStock ? "In stock and ready to ship." : ""}`;

  return {
    title: `${product.name} | TBM Building & Construction`,
    description,
    keywords:
      product.tags ||
      `${product.categoryName}, ${product.brandName}, building materials`,
    openGraph: {
      title: product.name,
      description,
      type: "website",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `/materials/${product.slug || slug}`,
    },
  };
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default async function MaterialDetailPage({ params }) {
  const { slug } = await params;

  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const similarProducts = await getSimilarProducts(
    product.categoryId,
    product.id,
  );

  return (
    <MaterialDetailClient product={product} similarProducts={similarProducts} />
  );
}
