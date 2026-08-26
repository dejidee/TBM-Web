import DashboardLayout from "@/components/shared/dashboard/layout";

/**
 * Mirrors app/dashboard/projects/[id]/gallery/page.jsx: back link, then the
 * SiteGallery component's own 3-column photo grid shape.
 */
export default function ProjectGalleryLoading() {
  return (
    <DashboardLayout>
      <div className="space-y-4 w-full animate-pulse" aria-busy="true">
        <div className="h-4 w-32 rounded bg-white/06" />
        <div className="rounded-2xl border border-white/08 p-5 space-y-4" style={{ background: "#0d0b08" }}>
          <div className="h-5 w-40 rounded bg-white/06" />
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-white/06" />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
