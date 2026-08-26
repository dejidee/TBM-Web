"use client";

import AuthModal from "@/components/common/auth-modal";
import { useCurrentUser } from "@/hooks/use-auth";
import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw, Star } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const RECOMMENDED_PROJECTS = [
  { id: 1, image: "/site-images/web/patio-after.jpg", title: "Courtyard Lounge" },
  { id: 2, image: "/site-images/web/kitchen-dark-lux.jpg", title: "Dark Luxury Kitchen" },
  { id: 3, image: "/site-images/web/interior-finished.jpg", title: "Open-Plan Interior" },
  { id: 4, image: "/site-images/web/bathroom-2-after.jpg", title: "Marble Bathroom Suite" },
];

export default function LoadMoreAndRecommended() {
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState("");
  const { data: user } = useCurrentUser();

  const handleSaveProject = () => {
    if (!user) setShowAuthModal((prev) => !prev);
  };

  const handleLoadMore = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <section className="w-full bg-black pb-12 sm:pb-16 lg:pb-20 font-manrope">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Load More Button */}
        <div className="flex justify-center mb-12 sm:mb-16">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLoadMore}
            disabled={isLoading}
            className="px-6 sm:px-8 py-3 sm:py-3.5 border border-white/10 rounded-full text-white/60 font-semibold text-sm sm:text-base hover:bg-white/05 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "#0d0b08" }}
          >
            {isLoading ? (
              <><RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> Loading...</>
            ) : (
              <><RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" /> Load More Projects</>
            )}
          </motion.button>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/08 mb-12 sm:mb-16" />

        {/* Recommended Section */}
        <div className="mb-10 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 mb-6 sm:mb-8"
          >
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37] shrink-0" />
            <h2 className="text-xl sm:text-2xl font-medium text-white">Recommended for You</h2>
          </motion.div>

          {/* Recommended Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-12">
            {RECOMMENDED_PROJECTS.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative group overflow-hidden rounded-xl sm:rounded-2xl cursor-pointer"
              >
                <div className="relative w-full" style={{ paddingBottom: "75%" }}>
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover absolute inset-0 transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 lg:p-5">
                    <h3 className="text-white text-sm sm:text-base lg:text-lg font-medium line-clamp-1">
                      {project.title}
                    </h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative rounded-2xl p-5 sm:p-6 w-full sm:w-4/5 lg:w-3/5 overflow-hidden mx-auto border"
            style={{
              background: "linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(184,150,46,0.05) 100%)",
              borderColor: "rgba(212,175,55,0.20)",
            }}
          >
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 rounded-full border border-[#D4AF37] -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-36 sm:w-48 h-36 sm:h-48 rounded-full border border-[#D4AF37] translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sm:gap-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(212,175,55,0.12)" }}
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white text-base sm:text-lg font-semibold mb-0.5 sm:mb-1">
                    Love these designs?
                  </h3>
                  <p className="text-white/50 text-xs sm:text-sm">Book your free consultation today.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                {!user && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveProject}
                    className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 border border-white/10 text-white/60 rounded-lg font-medium text-xs sm:text-sm hover:bg-white/05 transition-colors text-center"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    Save for later
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm text-black hover:opacity-90 transition-opacity text-center"
                  style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
                >
                  Book Now
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {showAuthModal && (
            <AuthModal setShowAuthModal={setShowAuthModal} showAuthModal={showAuthModal} />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
