/** Mirrors app/(user)/consultation/[id]/client.jsx: eyebrow, heading, one card. */
export default function ConsultationDetailLoading() {
  return (
    <div className="min-h-screen bg-black pt-24 pb-16" aria-busy="true">
      <div className="max-w-xl mx-auto px-4 sm:px-6 animate-pulse">
        <div className="h-3 w-32 bg-white/6" />
        <div className="mt-3 h-8 w-64 max-w-full bg-white/8" />
        <div className="mt-2 h-3.5 w-80 max-w-full bg-white/5" />
        <div className="mt-8 h-44 rounded-2xl border border-white/08 bg-white/03" />
      </div>
    </div>
  );
}
