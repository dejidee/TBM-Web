"use client";
import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Mail,
  ChevronDown,
  FileText,
  SendHorizonal,
  MapPin,
  Clock,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { showToast } from "@/components/shared/toast";

// Client components must not know the backend URL — a NEXT_PUBLIC_* var would be
// inlined into the bundle. Go through the local proxy, which rewrites
// /api/v1/* → /api/proxy/v1/* and attaches auth server-side. See lib/proxy.js.
const API_BASE = "/api/v1";

const FORM_TYPES = [
  {
    key: "consultation",
    label: "Book a Consultation",
    pipeline: "Book Project",
  },
  {
    key: "estimate",
    label: "Get a Project Estimate",
    pipeline: "Estimate Request",
  },
  {
    key: "product",
    label: "Product / Material Inquiry",
    pipeline: "Product Inquiry",
  },
  { key: "ziora", label: "Ziora AI Inquiry", pipeline: "Design Inquiry" },
  {
    key: "partnership",
    label: "Partnership / Vendor Inquiry",
    pipeline: "Partnership",
  },
  { key: "other", label: "General Inquiry", pipeline: "General" },
];

const PROJECT_TYPES = [
  "Kitchen Renovation",
  "Bathroom Renovation",
  "Full Home Renovation",
  "New Construction",
  "Interior Fit-Out",
  "Exterior / Outdoor",
  "Other",
];

const BUDGETS = [
  "Under ₦1M",
  "₦1M – ₦5M",
  "₦5M – ₦15M",
  "₦15M – ₦30M",
  "Above ₦30M",
  "Prefer not to say",
];

const CONTACT_METHODS = [
  "WhatsApp",
  "Email",
  "Phone Call",
  "Video Call",
  "In-Person",
];

const LOCATIONS = ["Abuja", "Lagos", "Other"];

const FAQS = [
  {
    q: "How quickly can I schedule a consultation?",
    a: "We typically confirm consultations within 24 hours of a request. Same-week slots are usually available for Abuja and Lagos.",
  },
  {
    q: "Do you offer virtual consultations?",
    a: "Yes — video consultations are available. You can also use Ziora AI to generate a design concept before booking a formal session.",
  },
  {
    q: "Is there a fee for the initial project review?",
    a: "There is a structured consultation fee which is fully credited toward your project cost if you proceed with TBM.",
  },
  {
    q: "Can I inquire about a specific product from the Bogat store?",
    a: "Yes — select 'Product / Material Inquiry' and describe the product you're interested in. Our team will respond with availability and pricing.",
  },
];

const inputClass =
  "w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 sm:py-4 text-sm sm:text-base text-white placeholder:text-white/25 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 transition-colors";

function ContactPageInner() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");

  const defaultType =
    FORM_TYPES.find((t) => t.key === typeParam) || FORM_TYPES[0];

  const [selectedType, setSelectedType] = useState(defaultType);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState("");
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [isMethodOpen, setIsMethodOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [selectedProjectType, setSelectedProjectType] = useState("");
  const [isProjectTypeOpen, setIsProjectTypeOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    message: "",
  });

  useEffect(() => {
    const found = FORM_TYPES.find((t) => t.key === typeParam);
    if (found) setSelectedType(found);
  }, [typeParam]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      showToast.error({
        title: "Missing Info",
        message: "Please enter your full name.",
      });
      return;
    }
    if (!formData.email.trim()) {
      showToast.error({
        title: "Missing Info",
        message: "Please enter your email address.",
      });
      return;
    }
    if (!formData.message.trim()) {
      showToast.error({
        title: "Missing Info",
        message: "Please tell us about your project.",
      });
      return;
    }

    const payload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      subject: `[${selectedType.pipeline}] ${selectedType.label}`,
      message: formData.message.trim(),
      budget: selectedBudget || undefined,
      preferredContact: selectedMethod || undefined,
      location: selectedLocation || undefined,
      projectType: selectedProjectType || undefined,
      pipeline: selectedType.pipeline,
    };

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const rawText = await res.text();
      let json = null;
      try {
        json = JSON.parse(rawText);
      } catch {}

      if (!res.ok) {
        // Two known-safe shapes: json?.message from the backend's own
        // envelope ({ success, message, data, errors }), and json?.errors
        // from an ASP.NET validation ProblemDetails response — both are
        // user-facing-safe text about the submitted data, not internals.
        // Never fall back to json?.title, json?.traceId, or the raw
        // response body — those can carry a stack frame or other internal
        // detail from an unhandled server error.
        const firstValidationError = json?.errors
          ? Object.values(json.errors).flat()[0]
          : null;
        const errMsg =
          json?.message ||
          firstValidationError ||
          "Something went wrong. Please try again.";
        showToast.error({ title: `Error ${res.status}`, message: errMsg });
        return;
      }

      showToast.success({
        title: "Message Sent!",
        message: json?.message || "We'll get back to you within 24 hours.",
      });

      setFormData({ fullName: "", email: "", phoneNumber: "", message: "" });
      setSelectedType(FORM_TYPES[0]);
      setSelectedBudget("");
      setSelectedMethod("");
      setSelectedLocation("");
      setSelectedProjectType("");
    } catch (err) {
      // Never render the raw caught exception's message — it can be a
      // browser/runtime-internal string, not something safe to show a user.
      showToast.error({
        title: "Network Error",
        message: "Unable to send message. Please check your connection.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black font-manrope">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-12 pt-32 lg:pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column — Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-4 sm:mb-6"
              style={{ background: "rgba(212,175,55,0.10)" }}
            >
              <div className="w-2 h-2 bg-[#D4AF37] rounded-full" />
              <span className="text-[#D4AF37] text-xs sm:text-sm font-medium tracking-widest uppercase">
                Contact Us
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3 sm:mb-4 leading-tight font-poppins"
            >
              Let&apos;s build your vision.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/50 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed"
            >
              Choose your inquiry type below and we&apos;ll route your message
              to the right team — renovation, materials, Ziora AI, or
              partnerships.
            </motion.p>

            {/* Contact quick-links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 sm:mb-8"
            >
              <div
                className="rounded-2xl p-4"
                style={{
                  background: "#0d0b08",
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.07)",
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "rgba(212,175,55,0.12)" }}
                  >
                    <Phone className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <span className="text-white/40 text-xs font-bold uppercase tracking-widest">
                    Call
                  </span>
                </div>
                <a
                  href="tel:+2349066913241"
                  className="inline-flex items-center min-h-11 -my-2 py-2 text-white text-sm font-bold hover:text-[#D4AF37] transition-colors"
                >
                  (+234) 906-691-3241
                </a>
              </div>

              <div
                className="rounded-2xl p-4"
                style={{
                  background: "#0d0b08",
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.07)",
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-white/40 text-xs font-bold uppercase tracking-widest">
                    WhatsApp
                  </span>
                </div>
                <a
                  href="https://wa.me/2349066913241"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center min-h-11 -my-2 py-2 text-green-400 text-sm font-bold hover:text-green-300 transition-colors"
                >
                  Chat Now
                </a>
              </div>

              <div
                className="rounded-2xl p-4"
                style={{
                  background: "#0d0b08",
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.07)",
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "rgba(212,175,55,0.12)" }}
                  >
                    <Mail className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <span className="text-white/40 text-xs font-bold uppercase tracking-widest">
                    Email
                  </span>
                </div>
                <a
                  href="mailto:info@tbmbuilding.com"
                  className="inline-flex items-center min-h-11 -my-2 py-2 text-white text-sm font-bold hover:text-[#D4AF37] transition-colors break-all"
                >
                  info@tbmbuilding.com
                </a>
              </div>
            </motion.div>

            {/* Office info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="flex flex-col sm:flex-row gap-3 mb-6 sm:mb-8"
            >
              <div className="flex items-start gap-2 text-sm text-white/40">
                <MapPin className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                <span>Showroom: Maitama, Abuja (& Lagos branch)</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-white/40">
                <Clock className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                <span>Mon – Sat: 8am – 6pm</span>
              </div>
            </motion.div>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              {/* Inquiry type */}
              <div>
                <label className="block text-white text-base sm:text-lg font-bold mb-2">
                  What can we help you with?
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsTypeOpen(!isTypeOpen)}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-4 text-left text-white flex items-center justify-between focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                  >
                    <div>
                      <span className="font-medium">{selectedType.label}</span>
                      <span className="ml-2 text-xs text-white/30">
                        → {selectedType.pipeline}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-white/40 transition-transform ${isTypeOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {isTypeOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute z-20 w-full mt-2 rounded-xl overflow-hidden border border-white/10"
                        style={{ background: "#0d0b08" }}
                      >
                        {FORM_TYPES.map((t) => (
                          <button
                            key={t.key}
                            type="button"
                            onClick={() => {
                              setSelectedType(t);
                              setIsTypeOpen(false);
                            }}
                            className={`w-full px-4 py-3.5 text-left flex items-center justify-between hover:bg-white/05 transition-colors ${selectedType.key === t.key ? "text-[#D4AF37]" : "text-white/70"}`}
                          >
                            <span className="font-medium text-sm">
                              {t.label}
                            </span>
                            <span className="text-xs text-white/30">
                              {t.pipeline}
                            </span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Name and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                  className={inputClass}
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  required
                  className={inputClass}
                />
              </div>

              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Phone / WhatsApp Number"
                className={inputClass}
              />

              {/* Project type + location + budget + preferred contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsProjectTypeOpen(!isProjectTypeOpen)}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 sm:py-4 text-left text-sm sm:text-base flex items-center justify-between focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                  >
                    <span
                      className={
                        selectedProjectType ? "text-white" : "text-white/25"
                      }
                    >
                      {selectedProjectType || "Project Type"}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-white/40 transition-transform ${isProjectTypeOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {isProjectTypeOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute z-20 w-full mt-2 rounded-xl overflow-hidden border border-white/10"
                        style={{ background: "#0d0b08" }}
                      >
                        {PROJECT_TYPES.map((p, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setSelectedProjectType(p);
                              setIsProjectTypeOpen(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-white/05 text-white/70 hover:text-white text-sm transition-colors"
                          >
                            {p}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsLocationOpen(!isLocationOpen)}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 sm:py-4 text-left text-sm sm:text-base flex items-center justify-between focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                  >
                    <span
                      className={
                        selectedLocation ? "text-white" : "text-white/25"
                      }
                    >
                      {selectedLocation || "Location"}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-white/40 transition-transform ${isLocationOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {isLocationOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute z-20 w-full mt-2 rounded-xl overflow-hidden border border-white/10"
                        style={{ background: "#0d0b08" }}
                      >
                        {LOCATIONS.map((l, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setSelectedLocation(l);
                              setIsLocationOpen(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-white/05 text-white/70 hover:text-white text-sm transition-colors"
                          >
                            {l}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsBudgetOpen(!isBudgetOpen)}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 sm:py-4 text-left text-sm sm:text-base flex items-center justify-between focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                  >
                    <span
                      className={
                        selectedBudget ? "text-white" : "text-white/25"
                      }
                    >
                      {selectedBudget || "Budget Range (Optional)"}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-white/40 transition-transform ${isBudgetOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {isBudgetOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute z-20 w-full mt-2 rounded-xl overflow-hidden border border-white/10"
                        style={{ background: "#0d0b08" }}
                      >
                        {BUDGETS.map((b, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setSelectedBudget(b);
                              setIsBudgetOpen(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-white/05 text-white/70 hover:text-white text-sm transition-colors"
                          >
                            {b}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsMethodOpen(!isMethodOpen)}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 sm:py-4 text-left text-sm sm:text-base flex items-center justify-between focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                  >
                    <span
                      className={
                        selectedMethod ? "text-white" : "text-white/25"
                      }
                    >
                      {selectedMethod || "Preferred Contact Method"}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-white/40 transition-transform ${isMethodOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {isMethodOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute z-20 w-full mt-2 rounded-xl overflow-hidden border border-white/10"
                        style={{ background: "#0d0b08" }}
                      >
                        {CONTACT_METHODS.map((m, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setSelectedMethod(m);
                              setIsMethodOpen(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-white/05 text-white/70 hover:text-white text-sm transition-colors"
                          >
                            {m}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder={
                  selectedType.key === "product"
                    ? "Describe the product or material you're looking for..."
                    : selectedType.key === "ziora"
                      ? "Tell us about your Ziora design inquiry or project..."
                      : selectedType.key === "partnership"
                        ? "Tell us about your company and what you're proposing..."
                        : "Tell us about your project — space, scope, timeline, location..."
                }
                rows={5}
                required
                className={`${inputClass} resize-none`}
              />

              <motion.button
                whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl py-3 sm:py-4 text-sm sm:text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-opacity text-black"
                style={{
                  background:
                    "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)",
                }}
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-black border-t-transparent rounded-full"
                    />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <SendHorizonal className="w-4 h-4 sm:w-5 sm:h-5" />
                  </>
                )}
              </motion.button>

              <p className="text-white/25 text-xs text-center mt-2">
                By submitting, you agree to our Terms and Privacy Policy.
              </p>
            </motion.form>

            {/* WhatsApp quick CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-4"
            >
              <a
                href="https://wa.me/2349066913241"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-3.5 text-sm font-semibold transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Chat on WhatsApp Instead
              </a>
            </motion.div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-10 sm:mt-12"
            >
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />
                <h2 className="text-white text-lg sm:text-xl font-bold">
                  Frequently Asked Questions
                </h2>
              </div>
              <div className="space-y-3">
                {FAQS.map((faq, i) => (
                  <div
                    key={i}
                    className="rounded-xl overflow-hidden border border-white/08"
                    style={{ background: "#0d0b08" }}
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full px-4 sm:px-6 py-4 sm:py-5 text-left flex items-center justify-between text-white text-sm sm:text-base font-medium"
                    >
                      <span className="pr-4">{faq.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-white/40 transition-transform shrink-0 ${openFaq === i ? "rotate-180" : ""}`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {openFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <p className="px-4 sm:px-6 pb-4 sm:pb-5 text-white/50 text-sm sm:text-base leading-relaxed">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column — Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative h-[500px] sm:h-[600px] lg:h-full lg:min-h-[700px] lg:mt-[72px]"
          >
            <div className="relative h-[94%] overflow-hidden rounded-2xl">
              <Image
                src="/contact.svg"
                alt="TBM Building Services"
                fill
                className="object-cover w-full h-full"
              />

              {/* Testimonial overlay */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute top-4 sm:top-8 left-4 sm:left-8 right-4 sm:right-8 lg:bottom-60 lg:top-auto bg-black/50 backdrop-blur-xl rounded-2xl p-4 sm:p-6 text-white border border-white/10"
              >
                <svg
                  className="w-8 h-8 mb-3 text-[#D4AF37]"
                  viewBox="0 0 40 40"
                  fill="currentColor"
                >
                  <path d="M10 18c0-4.4 3.6-8 8-8v4c-2.2 0-4 1.8-4 4v2h4v8h-8v-10zm16 0c0-4.4 3.6-8 8-8v4c-2.2 0-4 1.8-4 4v2h4v8h-8v-10z" />
                </svg>
                <p className="text-sm sm:text-base leading-relaxed mb-4 text-white/80">
                  &ldquo;TBM transformed our renovation process. The Ziora AI
                  tool gave us clarity before we spent a naira — and the
                  execution team delivered exactly what was promised.&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-black text-sm shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)",
                    }}
                  >
                    KA
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-white">
                      Kemi Adeoti
                    </div>
                    <div className="text-xs text-white/50">
                      Homeowner, Maitama Abuja
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Showroom badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 bg-black/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-white flex items-center gap-3 border border-white/10"
              >
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">
                    Visit Our Showroom
                  </p>
                  <p className="text-xs text-white/50">
                    Abuja & Lagos · Mon–Sat 8am–6pm
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={null}>
      <ContactPageInner />
    </Suspense>
  );
}
