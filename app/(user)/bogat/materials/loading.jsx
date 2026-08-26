export default function BogatMaterialsLoading() {
  return (
    <div className="min-h-screen bg-black pt-20 font-manrope">
      {/* Breadcrumb skeleton */}
      <div className="border-b border-white/8" style={{ background: "#0d0b08" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="h-4 w-40 bg-white/8 rounded animate-pulse" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          {/* Sidebar skeleton — desktop only */}
          <div className="hidden lg:block space-y-6">
            <div className="h-5 w-32 bg-white/8 rounded animate-pulse" />
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-4 w-full bg-white/6 rounded animate-pulse" />
            ))}
          </div>

          {/* Product grid skeleton */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="h-5 w-48 bg-white/8 rounded animate-pulse" />
              <div className="h-9 w-32 bg-white/8 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="overflow-hidden rounded-lg" style={{ background: "#0d0b08" }}>
                  <div className="aspect-square bg-white/6 animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-2.5 w-16 bg-white/8 rounded animate-pulse" />
                    <div className="h-4 w-full bg-white/8 rounded animate-pulse" />
                    <div className="h-4 w-2/3 bg-white/6 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
