"use client";
import { motion } from "framer-motion";

export default function TBMJourney() {
  return (
    <section className="bg-[#050505] py-20 px-4 sm:px-6 lg:px-8 font-manrope">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-block text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.2em] mb-4">
            Our story
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 font-poppins">
            The TBM Journey
          </h2>
          <p className="text-white/50 text-base sm:text-lg max-w-xl mx-auto">
            Founded in response to a gap in the market — and built to close it.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative max-w-5xl mx-auto">
          <div className="absolute left-0 top-0 bottom-0 w-px ml-2" style={{ background: "rgba(212,175,55,0.2)" }} />

          <div className="space-y-32">
            {/* 2018 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative pl-12"
            >
              <div className="absolute left-0 top-0 w-4 h-4 rounded-full border-2 border-[#D4AF37] bg-black" style={{ marginLeft: "0px" }} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-right">
                  <div className="text-xs font-semibold text-[#D4AF37] mb-2 tracking-[0.15em] uppercase">2018</div>
                  <h3 className="text-2xl font-bold text-white mb-4 font-poppins">The Foundation</h3>
                  <p className="text-white/50 leading-relaxed text-sm">
                    TBM was founded in response to a consistent gap in the
                    market: projects were being executed without structure,
                    without accountability, and without attention to
                    finishing. We set out to change that.
                  </p>
                </div>
                <div
                  className="rounded-2xl p-6"
                  style={{ background: "#0d0b08", boxShadow: "0 0 0 1px rgba(255,255,255,0.06)" }}
                >
                  <p className="text-white/60 leading-relaxed text-sm">
                    TBM was built to introduce order, control, and quality
                    into an industry that often lacks all three — construction
                    and renovation shouldn&apos;t be chaotic, uncertain, or
                    stressful.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 2025 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative pl-12"
            >
              <div className="absolute left-0 top-0 w-4 h-4 rounded-full border-2 border-[#D4AF37] bg-black" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div
                  className="rounded-2xl p-6 md:col-start-1"
                  style={{ background: "#0d0b08", boxShadow: "0 0 0 1px rgba(255,255,255,0.06)" }}
                >
                  <p className="text-white/60 leading-relaxed text-sm">
                    Ziora gives clients a way to see possibilities before
                    execution begins — bringing clarity and confidence into
                    the process, assisted by TBM&apos;s own team.
                  </p>
                </div>
                <div className="text-left md:col-start-2">
                  <div className="text-xs font-semibold text-[#D4AF37] mb-2 tracking-[0.15em] uppercase">2025</div>
                  <h3 className="text-2xl font-bold text-white mb-4 font-poppins">Ziora Launch</h3>
                  <p className="text-white/50 leading-relaxed text-sm">
                    Launched Ziora, our technology platform for planning and
                    decision-making — AI-powered design visualization, space
                    transformation previews, and guided renovation planning.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Full Ecosystem */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="relative pl-12"
            >
              <div className="absolute left-0 top-0 w-4 h-4 rounded-full border-2 border-[#D4AF37] bg-black" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-right">
                  <h3 className="text-2xl font-bold text-white mb-4 font-poppins">Full Ecosystem</h3>
                  <p className="text-white/50 leading-relaxed text-sm">
                    Since its founding in 2018, TBM has grown into a fully
                    integrated building solutions company, combining
                    execution, materials, and technology into one seamless
                    system across residential and commercial projects.
                  </p>
                </div>
                <div
                  className="rounded-2xl p-8"
                  style={{ background: "rgba(212,175,55,0.06)", boxShadow: "0 0 0 1px rgba(212,175,55,0.15)" }}
                >
                  <h4 className="text-xl font-bold text-white mb-3 font-poppins">Where We Operate</h4>
                  <p className="text-white/50 leading-relaxed text-sm">
                    Abuja (our primary base) and Lagos, with select projects
                    taken on in other locations where scope and standards can
                    be properly maintained.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
