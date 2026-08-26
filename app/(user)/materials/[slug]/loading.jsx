export default function MaterialLoading() {
  return (
    <div className="min-h-screen bg-black font-manrope pt-20">
      {/* Breadcrumb skeleton */}
      <div className="border-b border-white/8" style={{ background: "#0d0b08" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="h-4 w-48 bg-white/8 rounded animate-pulse" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image gallery skeleton */}
          <div className="space-y-4">
            <div className="w-full aspect-square bg-white/6 rounded-lg animate-pulse" />
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-white/6 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Details skeleton */}
          <div className="space-y-6">
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-white/8 rounded-full animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="h-9 bg-white/8 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-white/6 rounded w-1/2 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-8 bg-white/8 rounded w-1/3 animate-pulse" />
              <div className="h-4 bg-white/6 rounded w-1/2 animate-pulse" />
            </div>
            <div className="h-8 bg-white/8 rounded-full w-48 animate-pulse" />
            <div className="border border-white/10 rounded-lg p-4 space-y-3">
              <div className="h-4 bg-white/8 rounded w-24 animate-pulse" />
              <div className="h-10 bg-white/8 rounded w-40 animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="h-12 bg-white/8 rounded-lg w-full animate-pulse" />
              <div className="h-10 bg-white/6 rounded-lg w-full animate-pulse" />
            </div>
            <div className="h-32 bg-white/6 rounded-xl animate-pulse" />
          </div>
        </div>

        <div className="mb-12 h-96 bg-white/6 rounded-lg animate-pulse" />
        <div className="mb-12 h-64 bg-white/6 rounded-lg animate-pulse" />
        <div className="h-80 bg-white/6 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}
