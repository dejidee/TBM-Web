"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "@/components/shared/dashboard/layout";
import SiteGallery from "@/components/shared/dashboard/projects/site-gallery";

export default function GalleryPage() {
  const { id } = useParams();
  const router = useRouter();

  return (
    <DashboardLayout>
      <div className="space-y-4 w-full">
        <button
          onClick={() => router.push(`/dashboard/projects/${id}`)}
          className="inline-flex items-center gap-2 text-white/35 hover:text-white transition-colors text-[13px] font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Project
        </button>
        <SiteGallery projectId={id} />
      </div>
    </DashboardLayout>
  );
}
