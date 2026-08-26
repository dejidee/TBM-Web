"use client";

import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Circle, ArrowLeft, FileDown } from "lucide-react";
import DashboardLayout from "@/components/shared/dashboard/layout";
import { useProjectTimeline, useProject } from "@/hooks/use-project";

function PhaseIcon({ status }) {
  const s = status?.toLowerCase();
  if (s === "completed")
    return (
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #D4AF37, #b8962e)" }}
      >
        <CheckCircle2 className="w-4 h-4 text-black" />
      </div>
    );
  if (s === "in-progress" || s === "inprogress" || s === "active")
    return (
      <div
        className="w-8 h-8 rounded-full border-2 flex items-center justify-center"
        style={{ borderColor: "#D4AF37", background: "rgba(212,175,55,0.10)" }}
      >
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: "#D4AF37" }}
        />
      </div>
    );
  return (
    <div
      className="w-8 h-8 rounded-full border-2 border-white/15 flex items-center justify-center"
      style={{ background: "rgba(255,255,255,0.04)" }}
    >
      <Circle className="w-3.5 h-3.5 text-white/20" />
    </div>
  );
}

function PhaseBadge({ status }) {
  const s = status?.toLowerCase();
  if (s === "completed")
    return (
      <span
        className="text-[16px] font-bold tracking-wider px-2 py-0.5 rounded-md"
        style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e" }}
      >
        COMPLETED
      </span>
    );
  if (s === "in-progress" || s === "inprogress" || s === "active")
    return (
      <span
        className="text-[16px] font-bold tracking-wider px-2 py-0.5 rounded-md"
        style={{ background: "rgba(212,175,55,0.12)", color: "#D4AF37" }}
      >
        IN PROGRESS
      </span>
    );
  return (
    <span
      className="text-[16px] font-bold tracking-wider px-2 py-0.5 rounded-md"
      style={{
        background: "rgba(255,255,255,0.06)",
        color: "rgba(255,255,255,0.30)",
      }}
    >
      PENDING
    </span>
  );
}

function SkeletonPhase() {
  return (
    <div className="flex gap-4 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-white/06 shrink-0 mt-4" />
      <div
        className="flex-1 rounded-2xl border border-white/06 px-5 py-4 space-y-2"
        style={{ background: "#0d0b08" }}
      >
        <div className="h-4 bg-white/06 rounded w-1/2" />
        <div className="h-3 bg-white/06 rounded w-3/4" />
      </div>
    </div>
  );
}

export default function TimelinePage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: timeline, isLoading: timelineLoading } = useProjectTimeline(id);
  const { data: project } = useProject(id);

  // Timeline response shape logged in hook — flexible access
  const phases = Array.isArray(timeline)
    ? timeline
    : (timeline?.phases ?? timeline?.milestones ?? timeline?.items ?? []);

  const overallProgress = project?.progress ?? project?.completionPercent ?? 0;
  const startDate = project?.startDate ?? project?.createdAt ?? "";
  const estCompletion =
    project?.estCompletion ?? project?.estimatedCompletion ?? "";

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full max-w-[700px]">
        {/* Back */}
        <button
          onClick={() => router.push(`/dashboard/projects/${id}`)}
          className="inline-flex items-center gap-2 text-white/35 hover:text-white transition-colors text-[13px] font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Project
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-start justify-between gap-4"
        >
          <div>
            <h1 className="text-[26px] font-bold text-white leading-tight">
              Project Timeline
            </h1>
            <p className="text-[13px] text-white/35 mt-1">
              {project?.name
                ? `Schedule for ${project.name}`
                : "Full milestone schedule and phase breakdown."}
            </p>
          </div>
          <button
            className="flex items-center gap-1.5 text-[13px] font-semibold text-white/50 border border-white/10 px-3.5 py-2 rounded-lg hover:bg-white/05 transition-colors shrink-0 mt-1"
            style={{ background: "#0d0b08" }}
          >
            <FileDown className="w-3.5 h-3.5" /> Export PDF
          </button>
        </motion.div>

        {/* Overall progress card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl border border-white/08 px-5 py-4"
          style={{ background: "#0d0b08" }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-semibold text-white/60">
              Overall Completion
            </span>
            <span className="text-[22px] font-bold text-white">
              {overallProgress}%
            </span>
          </div>
          <div
            className="h-2.5 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.07)" }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #D4AF37, #b8962e)" }}
            />
          </div>
          {(startDate || estCompletion) && (
            <div className="flex items-center justify-between mt-2">
              {startDate && (
                <span className="text-[11px] text-white/25">
                  Started:{" "}
                  {new Date(startDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
              {estCompletion && (
                <span className="text-[11px] text-white/25">
                  Est. Completion: {estCompletion}
                </span>
              )}
            </div>
          )}
        </motion.div>

        {/* Phases */}
        <div className="relative">
          <div className="absolute left-[15px] top-4 bottom-4 w-px bg-white/08 z-0" />
          <div className="space-y-3">
            {timelineLoading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonPhase key={i} />)
            ) : phases.length === 0 ? (
              <p className="text-white/30 text-[13px] pl-12 py-6">
                No timeline data yet.
              </p>
            ) : (
              phases.map((phase, index) => {
                const title =
                  phase?.title ?? phase?.name ?? `Phase ${index + 1}`;
                const status = phase?.status ?? "pending";
                const description = phase?.description ?? phase?.summary ?? "";
                const duration =
                  phase?.duration ??
                  phase?.durationDisplay ??
                  phase?.dateRange ??
                  "";
                const durationLabel =
                  phase?.durationLabel ??
                  (status?.toLowerCase() === "in-progress" ||
                  status?.toLowerCase() === "active"
                    ? "CURRENT PHASE"
                    : status?.toLowerCase() === "completed"
                      ? "DURATION"
                      : "PLANNED");
                const tasks =
                  phase?.tasks ?? phase?.subTasks ?? phase?.checkItems ?? [];
                const sections = phase?.sections ?? phase?.subPhases ?? [];
                const isActive =
                  status?.toLowerCase() === "in-progress" ||
                  status?.toLowerCase() === "active";

                return (
                  <motion.div
                    key={phase?.id ?? index}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 + index * 0.09 }}
                    className="relative flex gap-4"
                  >
                    <div className="relative z-10 shrink-0 mt-4">
                      <PhaseIcon status={status} />
                    </div>
                    <div
                      className="flex-1 rounded-2xl border px-5 py-4"
                      style={{
                        background: "#0d0b08",
                        borderColor: isActive
                          ? "rgba(212,175,55,0.30)"
                          : "rgba(255,255,255,0.07)",
                        boxShadow: isActive
                          ? "0 0 0 1px rgba(212,175,55,0.12)"
                          : undefined,
                      }}
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-[14px] font-bold text-white">
                            {index + 1}. {title}
                          </h3>
                          <PhaseBadge status={status} />
                        </div>
                        {duration && (
                          <div className="text-right shrink-0">
                            <p className="text-[9px] font-bold tracking-widest text-white/25 uppercase">
                              {durationLabel}
                            </p>
                            <p className="text-[12px] font-semibold text-white/70 mt-0.5">
                              {duration}
                            </p>
                          </div>
                        )}
                      </div>
                      {description && (
                        <p className="text-[12px] text-white/40 mt-1.5 leading-relaxed">
                          {description}
                        </p>
                      )}
                      {tasks.length > 0 && (
                        <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3">
                          {tasks.map((task, ti) => (
                            <div key={ti} className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-white/25" />
                              <span className="text-[11.5px] text-white/45">
                                {typeof task === "string"
                                  ? task
                                  : (task?.title ?? task?.name ?? "")}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {sections.length > 0 && (
                        <div className="mt-3 space-y-3">
                          {sections.map((section, si) => (
                            <div key={si}>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[16px] font-bold tracking-wider text-white/30 uppercase">
                                  {section?.label ??
                                    section?.name ??
                                    `Section ${si + 1}`}
                                </span>
                                <span className="text-[12px] font-bold text-white/70">
                                  {section?.percent ?? section?.progress ?? 0}%
                                </span>
                              </div>
                              <div
                                className="h-2 rounded-full overflow-hidden"
                                style={{ background: "rgba(255,255,255,0.07)" }}
                              >
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${section?.percent ?? section?.progress ?? 0}%`,
                                  }}
                                  transition={{
                                    duration: 0.8,
                                    delay: 0.5 + si * 0.1,
                                    ease: "easeOut",
                                  }}
                                  className="h-full rounded-full"
                                  style={{
                                    background:
                                      "linear-gradient(90deg, #D4AF37, #b8962e)",
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
