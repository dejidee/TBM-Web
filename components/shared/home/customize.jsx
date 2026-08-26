"use client";

import React from "react";
import Image from "next/image";

const CustomizeSection = () => {
  return (
    <section className="py-12 sm:py-14 lg:py-16 bg-gray-50">
      <div className="">
        <div className="bg-slate-400 overflow-hidden relative min-h-[200px] sm:min-h-[450px] md:min-h-[300px]">
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-slate-500/40" />

          {/* Content Container */}
          <div className="relative z-10 h-full flex items-center">
            <div className="w-full md:w-1/2 px-8 sm:px-12 md:px-16 lg:px-20 py-12 sm:py-16">
              {/* Heading */}
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-primary font-bold text-white mb-4 sm:mb-6 leading-tight">
                Plan your renovation with Ziora, build it with TBM
              </h2>

              {/* Description */}
              <p className="text-base sm:text-lg md:text-xl font-inter text-white/90 mb-8 sm:mb-10 max-w-xl">
                Get a full project estimate, source materials from Bogat, and
                let TBM manage your renovation or construction from start to
                finish.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 sm:px-10 py-3 sm:py-4 rounded-lg transition-colors duration-200 text-base sm:text-lg shadow-lg">
                  Get Project Estimate
                </button>
                <button className="bg-white/20 hover:bg-white/30 border border-white/40 text-white font-semibold px-8 sm:px-10 py-3 sm:py-4 rounded-lg transition-colors duration-200 text-base sm:text-lg shadow-lg backdrop-blur-sm">
                  Browse Bogat Materials
                </button>
              </div>
            </div>

            {/* Project photo - Hidden on mobile, visible on larger screens */}
            <div className="hidden md:block absolute right-12 lg:right-20 top-1/2 -translate-y-1/2 w-100 lg:w-125 h-70 lg:h-80 rounded-xl overflow-hidden shadow-2xl">
              <Image
                src="/site-images/web/exterior-courtyard-dusk.jpg"
                alt="TBM renovated courtyard at dusk"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomizeSection;
