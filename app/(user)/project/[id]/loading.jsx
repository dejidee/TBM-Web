export default function ProjectDetailLoading() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 pb-10 sm:pb-14">
        <div className="h-4 w-40 bg-white/8 rounded animate-pulse mb-8" />

        <div className="mb-8 space-y-4">
          <div className="h-6 w-40 bg-white/8 rounded-full animate-pulse" />
          <div className="h-10 sm:h-12 bg-white/8 rounded w-2/3 animate-pulse" />
          <div className="h-4 w-56 bg-white/6 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
          <div className="space-y-10">
            <div className="w-full aspect-[4/5] sm:aspect-[16/10] bg-white/6 rounded-2xl animate-pulse" />
            <div className="space-y-3">
              <div className="h-5 w-40 bg-white/8 rounded animate-pulse" />
              <div className="h-4 w-full bg-white/6 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-white/6 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-white/6 rounded animate-pulse" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[#111] border border-white/8 rounded-2xl p-5 space-y-3">
              <div className="h-3 w-28 bg-white/8 rounded animate-pulse mb-2" />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-white/4 rounded-xl animate-pulse" />
              ))}
              <div className="h-12 bg-white/8 rounded-xl animate-pulse" />
              <div className="h-12 bg-white/6 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
