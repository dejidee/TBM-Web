"use client";

import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "@/components/shared/dashboard/layout";
import { useProject } from "@/hooks/use-project";
import ProjectHeader from "@/components/shared/dashboard/projects/header";
import SiteProgressPhotos from "@/components/shared/dashboard/projects/site-progress";
import LiveUpdates from "@/components/shared/dashboard/projects/live-updates";
import RegionalOfficeCard from "@/components/shared/dashboard/projects/regional-card";
import ProjectMilestones from "@/components/shared/dashboard/projects/milestones";
import ProjectDocuments from "@/components/shared/dashboard/projects/project-documents";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: project, isLoading, isError } = useProject(id);

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        {/* Back link */}
        <button
          onClick={() => router.push("/dashboard/projects")}
          className="inline-flex items-center gap-2 text-white/35 hover:text-white transition-colors text-[13px] font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> My Projects
        </button>

        {isError && (
          <p className="text-white/35 text-[13px] py-12 text-center">Could not load this project. Please try again.</p>
        )}

        {!isError && (
          <>
            <ProjectHeader project={project} isLoading={isLoading} />
            <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] lg:grid-cols-[1fr_300px] gap-6 items-start">
              <div className="space-y-6">
                <ProjectMilestones milestones={project?.milestones} isLoading={isLoading} projectId={id} />
                <SiteProgressPhotos photos={project?.photos} isLoading={isLoading} />
              </div>
              <div className="space-y-6">
                <ProjectDocuments documents={project?.documents} isLoading={isLoading} />
                <LiveUpdates updates={project?.updates} budget={project?.budget} isLoading={isLoading} />
                <RegionalOfficeCard office={project?.office} isLoading={isLoading} />
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
