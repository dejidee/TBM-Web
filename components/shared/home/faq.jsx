"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "What areas does TBM serve?",
    a: "TBM currently operates in Abuja and Lagos, with delivery and project execution teams in both cities. We are expanding to other major Nigerian cities.",
  },
  {
    q: "How does the Ziora AI design tool work?",
    a: "Upload a photo of your room, select the room type and your preferred style, and Ziora generates a premium design concept within seconds. You can then use the result to get an estimate, shop matching materials, or book a consultation.",
  },
  {
    q: "Can I buy materials without booking a renovation project?",
    a: "Absolutely. The Bogat store is fully independent; you can browse, add to cart, and checkout for any product without engaging TBM for project execution.",
  },
  {
    q: "How long does a typical bathroom renovation take?",
    a: "Most bathroom renovations take 2–4 weeks depending on scope, existing conditions, and material availability. Your project manager will give you a precise timeline after the initial inspection.",
  },
  {
    q: "Do you offer a warranty on completed projects?",
    a: "Yes. TBM provides a workmanship warranty on all executed projects, and Bogat materials carry manufacturer warranties. Full details are included in every project agreement.",
  },
  {
    q: "What is the consultation fee?",
    a: "Initial consultations are structured to give you a full project assessment, scope, and estimate. Our team will confirm current consultation fees during the booking step, and the fee is credited toward your project if you proceed.",
  },
  {
    q: "Can I track my project progress?",
    a: "Yes. Your account dashboard includes a project tracker where you can see milestone updates, material delivery status, and team notes throughout the build.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <section className="py-20 sm:py-24 lg:py-32 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <span className="inline-block text-gold text-xs font-manrope font-semibold uppercase tracking-[0.2em] mb-4">
            FAQ
          </span>
          <h2 className="text-4xl sm:text-5xl font-primary font-bold text-[#0A0A0A] tracking-tight">
            Common Questions
          </h2>
        </motion.div>

        <div className="divide-y divide-stone">
          {FAQS.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
            >
              <button
                onClick={() => setOpen(open === index ? null : index)}
                className="w-full flex items-center justify-between gap-4 py-6 text-left"
              >
                <span className="font-manrope font-semibold text-[#0A0A0A] text-sm sm:text-base tracking-wide">
                  {faq.q}
                </span>
                <motion.div
                  animate={{ rotate: open === index ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                >
                  <ChevronDown
                    className={`w-5 h-5 transition-colors ${open === index ? "text-gold" : "text-[#7A736C]"}`}
                  />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {open === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="pb-6">
                      <p className="text-sm sm:text-base font-manrope text-[#7A736C] leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
