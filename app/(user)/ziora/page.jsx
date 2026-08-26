import AIVisualizerView from "@/components/shared/ai-visualizer/visualizer-view";

export const metadata = {
  title: "Ziora AI — Design & Visualize Before You Build",
  description:
    "Ziora AI by TBM creates 3D interior designs from a single room photo. Upload a photo, choose a style, and see what's possible before you build.",
  keywords: [
    "Ziora AI",
    "AI interior design Nigeria",
    "3D home design Abuja",
    "interior visualizer Lagos",
    "room redesign AI",
    "before and after renovation AI",
    "AI interior design Lagos",
    "Design with Ziora",
  ],
  openGraph: {
    title: "Ziora AI — Design & Visualize | TBM Building Services",
    description:
      "See your space redesigned before a single tile is laid. 3D designs powered by Ziora AI.",
    type: "website",
  },
};

export default function ZioraPage() {
  return <AIVisualizerView />;
}
