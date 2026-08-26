"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Calculator, ChevronRight } from "lucide-react";
import DashboardLayout from "@/components/shared/dashboard/layout";
import SectionEmpty from "@/components/shared/dashboard/section-empty";
import SectionError from "@/components/shared/dashboard/section-error";
import { naira } from "@/components/shared/dashboard/designs/estimate-result";
import { useRenovationEstimates } from "@/hooks/use-ai-services";

/**
 * "Saved estimates" / "BOQ history" — required by the client correction doc's
 * web-app feature list. Built on GET /ai/renovation/estimates rather than the
 * backend's separate DesignSessions/BillOfMaterialsDto system, which the live
 * studio never reaches — see the estimate-result.jsx header comment.
 */
export default function EstimatesPage() {
  const { data: estimates, isPending, isError, refetch } = useRenovationEstimates();

  return (
    <DashboardLayout>
      <div className="w-full space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="border-b border-white/08 pb-6"
        >
          <Link
            href="/dashboard/ai-designs"
            className="inline-flex items-center gap-1.5 text-[13px] text-white/40 hover:text-white/70 transition-colors mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> My Ziora Designs
          </Link>
          <h1 className="text-[28px] font-semibold leading-tight text-white md:text-[32px]">
            My Estimates
          </h1>
          <p className="mt-1.5 max-w-2xl text-[15px] text-white/45">
            Every renovation estimate you've generated, with its cost breakdown and materials.
          </p>
        </motion.div>

        {isPending ? (
          <EstimatesSkeleton />
        ) : isError ? (
          <SectionError
            title="We couldn't load your estimates"
            body="Your estimates are safe — this is a problem reaching them. Try again in a moment."
            onRetry={refetch}
          />
        ) : estimates.length === 0 ? (
          <SectionEmpty
            icon={Calculator}
            title="No estimates yet"
            body="Get an AI cost estimate for any of your designs — open a design's menu and choose Get Estimate."
            action={{ label: "View my designs", href: "/dashboard/ai-designs", icon: ChevronRight }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {estimates.map((estimate, i) => (
              <motion.div
                key={estimate.estimateId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <Link
                  href={`/dashboard/ai-designs/estimates/${estimate.estimateId}`}
                  className="block rounded-xl border border-white/08 p-5 hover:border-white/15 transition-all"
                  style={{ background: "#0d0b08" }}
                >
                  <div className="flex items-center gap-2 text-[13px] text-white/40 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                    <span className="capitalize">{estimate.roomType}</span>
                  </div>
                  <h3 className="text-[15px] font-semibold text-white line-clamp-1 mb-3">
                    {estimate.projectName || "Renovation estimate"}
                  </h3>
                  <div className="flex items-center justify-between pt-3 border-t border-white/06">
                    <span className="text-[12px] text-white/25">
                      {new Date(estimate.createdAtUtc).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-[16px] font-semibold text-[#D4AF37]">
                      {naira(estimate.totalEstimate)}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function EstimatesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-pulse" aria-busy="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-white/08 p-5" style={{ background: "#0d0b08" }}>
          <div className="h-3 w-24 rounded bg-white/06 mb-3" />
          <div className="h-4 w-3/4 rounded bg-white/08 mb-4" />
          <div className="flex items-center justify-between pt-3 border-t border-white/06">
            <div className="h-3 w-16 rounded bg-white/05" />
            <div className="h-4 w-20 rounded bg-white/08" />
          </div>
        </div>
      ))}
    </div>
  );
}
