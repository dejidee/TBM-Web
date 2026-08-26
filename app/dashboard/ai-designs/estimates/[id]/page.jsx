"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "@/components/shared/dashboard/layout";
import SectionError from "@/components/shared/dashboard/section-error";
import EstimateResult from "@/components/shared/dashboard/designs/estimate-result";
import { useRenovationEstimate } from "@/hooks/use-ai-services";

export default function EstimateDetailPage() {
  const { id } = useParams();
  const { data: result, isPending, isError, error, refetch } = useRenovationEstimate(id);

  return (
    <DashboardLayout>
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <Link
            href="/dashboard/ai-designs/estimates"
            className="inline-flex items-center gap-1.5 text-[13px] text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> My Estimates
          </Link>
        </motion.div>

        {isPending ? (
          <DetailSkeleton />
        ) : isError ? (
          <SectionError
            title={error?.status === 404 ? "Estimate not found" : "We couldn't load this estimate"}
            body={
              error?.status === 404
                ? "It may have been removed, or the link is wrong."
                : "It's safe — this is a problem reaching it. Try again in a moment."
            }
            onRetry={error?.status === 404 ? undefined : refetch}
          />
        ) : (
          <EstimateResult result={result} />
        )}
      </div>
    </DashboardLayout>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-5 animate-pulse" aria-busy="true">
      <div className="h-32 rounded-lg bg-white/05" />
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-white/04" />
        ))}
      </div>
      <div className="h-40 rounded-lg bg-white/04" />
    </div>
  );
}
