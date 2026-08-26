import { notFound } from "next/navigation";
import ProjectDetailClient from "./client";
import { API_URL } from "@/lib/env";

// ─── Server-side fetch ────────────────────────────────────────────────────────
async function getPortfolioItem(id) {
  try {
    const res = await fetch(`${API_URL}/portfolio/${id}`, {
      next: { revalidate: 120 },
      headers: { "Content-Type": "application/json" },
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch {
    return null;
  }
}

// ─── SEO Metadata ─────────────────────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const { id } = await params;
  const item = await getPortfolioItem(id);

  if (!item) {
    return {
      title: "Project Not Found | TBM Building Services",
      description: "The requested project could not be found.",
    };
  }

  const imageUrl =
    item.afterImages?.[0]?.imageUrl || item.thumbnailUrl || "/og-project.jpg";
  const description =
    item.description ||
    `${item.category ?? "Renovation"} project by TBM Building Services${item.location ? ` in ${item.location}` : ""}.`;

  return {
    title: `${item.title} | TBM Building Services`,
    description,
    openGraph: {
      title: item.title,
      description,
      type: "article",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: item.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `/project/${id}`,
    },
  };
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default async function ProjectDetailPage({ params }) {
  const { id } = await params;
  const item = await getPortfolioItem(id);

  if (!item) {
    notFound();
  }

  return <ProjectDetailClient item={item} />;
}
