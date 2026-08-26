"use client";
import { motion } from "framer-motion";

const ARMS = [
  {
    name: "TBM",
    role: "Execution",
    desc: "Construction, renovation, interior fit-outs, and full project management — where ideas are translated into reality with precision and discipline.",
  },
  {
    name: "Bogat",
    role: "Materials",
    desc: "Carefully selected, high-quality bathroom vanity, sanitaryware, and finishing materials — ensuring every project matches the desired standard of finish.",
  },
  {
    name: "Ziora",
    role: "Technology",
    desc: "A TBM-assisted planning tool — AI-powered design visualization, space transformation previews, and guided renovation planning.",
  },
];

export default function OurStructure() {
  return (
    <section className="bg-[#050505] py-20 px-4 sm:px-6 lg:px-8 font-manrope">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.2em] mb-4">
            Our structure
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 font-poppins">
            Three Arms, One System
          </h2>
          <p className="text-white/50 text-base sm:text-lg max-w-2xl mx-auto">
            TBM operates through three integrated arms, each designed to
            deliver control and consistency across every project.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: "rgba(255,255,255,0.06)" }}>
          {ARMS.map((arm, i) => (
            <motion.div
              key={arm.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-[#0d0b08] p-8"
            >
              <span className="inline-block text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.2em] mb-3">
                {arm.role}
              </span>
              <h3 className="text-2xl font-bold text-white mb-3 font-poppins">
                {arm.name}
              </h3>
              <p className="text-sm text-white/50 leading-relaxed">
                {arm.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
