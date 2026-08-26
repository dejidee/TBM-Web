import ZioraGuideClient from "./client";

export const metadata = {
  title: "How to Use Ziora AI — Full Guide | TBM Building Services",
  description:
    "Step-by-step guide to using Ziora AI: upload your space, choose a style, and get a 3D visualization to share with TBM to start building.",
  keywords: [
    "Ziora guide",
    "how to use Ziora AI",
    "AI interior design guide",
    "3D room design tutorial",
    "Ziora tutorial",
  ],
  openGraph: {
    title: "How to Use Ziora AI — Your Complete Guide | TBM",
    description:
      "Everything you need to know to get stunning 3D designs from Ziora AI.",
    type: "website",
  },
};

export default function ZioraGuidePage() {
  return <ZioraGuideClient />;
}
