"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useFormik } from "formik";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarClock,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Lock,
  MapPin,
  Video,
} from "lucide-react";

import { PROPERTY_TYPES, formatDuration, formatFee } from "@/lib/api/consultations";
import {
  useConsultationTypes,
  useConsultationAvailability,
  useBookConsultation,
  useInitializeConsultationPayment,
} from "@/hooks/use-consultations";
import { NIGERIA_STATES } from "@/lib/data/nigeria-states";
import { consultationSchema } from "@/lib/validations/consultation";
import {
  usePersistedState,
  CONSULTATION_KEYS,
  CONSULTATION_ATTEMPT_TTL_MS,
} from "@/hooks/use-persisted-state";
import { useSession } from "@/hooks/use-session";
import { rememberManagementToken } from "@/lib/consultation-tokens";
import { showToast } from "@/components/shared/toast";

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Service", Icon: Building2 },
  { id: 2, label: "Schedule", Icon: CalendarClock },
  { id: 3, label: "Review", Icon: Check },
];

/** Which fields each step owns, so "Continue" validates only what is on screen. */
const STEP_FIELDS = {
  1: ["typeKey", "propertyType"],
  2: ["contactName", "contactEmail", "contactPhone", "siteAddress", "siteCity", "siteState", "scheduledStart"],
  3: ["notes"],
};

// Sharp corners, matching .btn-gold and .btn-outline.
const CARD = "border border-z-line bg-z-panel";

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatSlotTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" });
}

function formatPickerDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "long" });
}

function formatDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleString("en-NG", { weekday: "short", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" });
}

// ─── Small shared inputs ──────────────────────────────────────────────────────

function Field({ label, error, touched, required, children, hint }) {
  const showError = touched && error;
  return (
    <label className="block">
      <span className="block text-[13px] font-medium text-white/70 mb-2">
        {label}
        {required && <span className="text-gold ml-1">*</span>}
      </span>
      {children}
      {hint && !showError && <span className="block text-[12px] text-white/50 mt-1.5">{hint}</span>}
      {showError && <span className="block text-[12px] text-red-400 mt-1.5">{error}</span>}
    </label>
  );
}

const inputClass =
  "w-full min-h-11 bg-white/4 border border-z-line px-4 py-3 text-[14px] text-white placeholder:text-white/50 outline-none transition-colors focus:border-gold/60 focus:bg-white/6";

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-[13px] text-white/50 shrink-0">{label}</dt>
      <dd className="text-[13px] text-white text-right min-w-0 break-words">
        {value || <span className="text-white/50">Not set</span>}
      </dd>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ConsultationClient() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: sessionLoading } = useSession();

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(todayValue());
  const headingRef = useRef(null);

  // A payment attempt already in flight for a booking this page created —
  // its presence is what stops this page from booking a *second* consultation
  // while the first is still being paid for. Only app/(user)/consultation/verify
  // clears it. See hooks/use-persisted-state.js.
  const [attempt, setAttempt] = usePersistedState(CONSULTATION_KEYS.attempt, null, {
    storage: "local",
  });
  const attemptIsStale =
    Boolean(attempt?.createdAt) && Date.now() - attempt.createdAt > CONSULTATION_ATTEMPT_TTL_MS;

  const { data: types, isLoading: typesLoading } = useConsultationTypes();
  const bookMutation = useBookConsultation();
  const initPaymentMutation = useInitializeConsultationPayment();

  const formik = useFormik({
    initialValues: {
      typeKey: "",
      propertyType: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      siteAddress: "",
      siteCity: "",
      siteState: "",
      scheduledStart: "",
      // Seeded from `?notes=`, which Ziora's "Start Project with TBM" links
      // with — the design's brief, so the team booking this sees what the
      // client already designed instead of a blank notes field. Read once,
      // as the initial value, same as `prompt` in studio-view.jsx.
      notes: searchParams.get("notes") ?? "",
    },
    validationSchema: consultationSchema,
    onSubmit: async (values) => {
      try {
        const result = await bookMutation.mutateAsync({
          typeKey: values.typeKey,
          scheduledStart: values.scheduledStart,
          contactName: values.contactName,
          contactPhone: values.contactPhone,
          contactEmail: values.contactEmail,
          propertyType: values.propertyType,
          siteAddress: values.siteAddress,
          siteCity: values.siteCity,
          siteState: values.siteState,
          notes: values.notes || undefined,
        });
        const consultation = result?.data?.consultation;
        if (!consultation?.id) throw new Error("Booking succeeded but no confirmation was returned.");
        // A guest's only credential for this booking. Null for a signed-in
        // user, whose session is the credential instead.
        const token = result?.data?.managementToken ?? null;
        if (token) rememberManagementToken(consultation.id, token);

        if (consultation.fee > 0 && !consultation.paymentVerified) {
          // Persisted *before* initializing payment — if that request's
          // response is lost, the consultation id survives so a retry never
          // re-books, only re-initiates payment for the same one.
          setAttempt({ consultationId: consultation.id, createdAt: Date.now(), token });
          const payment = await initPaymentMutation.mutateAsync({
            id: consultation.id,
            email: values.contactEmail,
            token,
          });
          const paymentData = payment?.data;
          if (!paymentData?.authorizationUrl) {
            throw new Error("Could not start payment for this booking.");
          }
          setAttempt({
            consultationId: consultation.id,
            createdAt: Date.now(),
            reference: paymentData.reference,
            token,
          });
          window.location.href = paymentData.authorizationUrl;
          return;
        }

        // Free type — already Confirmed, no payment needed.
        router.push(`/consultation/verify?consultationId=${consultation.id}&confirmed=true`);
        // (The verify page finds the token in localStorage / the attempt; a
        // guest is then handed `manageHref()` as their link.)
      } catch (err) {
        showToast.error("Booking failed", err.message);
      }
    },
  });

  // Prefill from the session once it resolves, without clobbering typing.
  useEffect(() => {
    if (!user) return;
    const name = user.fullName || [user.firstName, user.lastName].filter(Boolean).join(" ");
    if (name && !formik.values.contactName) formik.setFieldValue("contactName", name);
    if (user.email && !formik.values.contactEmail) formik.setFieldValue("contactEmail", user.email);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // An unresolved payment attempt exists — go find out what happened to it
  // instead of letting a second booking start. See use-persisted-state.js.
  useEffect(() => {
    if (attemptIsStale) {
      setAttempt(null);
      return;
    }
    if (attempt?.consultationId) {
      router.replace(`/consultation/verify?consultationId=${attempt.consultationId}`);
    }
  }, [attempt, attemptIsStale, router, setAttempt]);

  const selectedType = types?.find((t) => t.key === formik.values.typeKey) ?? null;
  const isInPerson = selectedType?.format === "InPerson";
  // Product rule (2026-08-22): free types can be booked as a guest — the
  // management link is enough to reschedule or cancel. Paid types need an
  // account, because a lost link on a paid booking means a refund the guest
  // can't see the status of. Not an API requirement; the backend allows both.
  const isPaid = (selectedType?.fee ?? 0) > 0;
  const needsSignIn = !sessionLoading && !isAuthenticated && isPaid;

  const { data: availability, isLoading: availabilityLoading } = useConsultationAvailability(
    formik.values.typeKey,
    selectedDate,
  );

  // Today is usually empty (weekend, or the 24-hour lead time). Rather than
  // open on "No slots for this day", jump once to the first day that has one.
  // Only ever moves forward, and only while the user hasn't picked a time.
  useEffect(() => {
    const first = availability?.firstAvailableDate;
    if (!first || formik.values.scheduledStart) return;
    if (availability.slots.length === 0 && first > selectedDate) setSelectedDate(first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availability]);

  function selectType(key) {
    formik.setFieldValue("typeKey", key);
    formik.setFieldValue("scheduledStart", ""); // a different type has different slots
    formik.setFieldTouched("typeKey", true, false);
  }

  const uploading = false;
  const submitting = formik.isSubmitting || bookMutation.isPending || initPaymentMutation.isPending;

  const stepIsValid = useMemo(() => {
    const fields = STEP_FIELDS[step] ?? [];
    return fields.every((name) => !formik.errors[name]);
  }, [step, formik.errors]);

  function goToStep(next) {
    setStep(next);
    headingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleContinue() {
    const fields = STEP_FIELDS[step] ?? [];
    await formik.setTouched(
      fields.reduce((acc, name) => ({ ...acc, [name]: true }), { ...formik.touched }),
      true,
    );
    const errors = await formik.validateForm();
    const blocked = fields.filter((name) => errors[name]);
    if (blocked.length > 0) {
      showToast.error("Check this step", "Some required fields still need attention.");
      return;
    }
    goToStep(step + 1);
  }

  if (attempt?.consultationId && !attemptIsStale) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gold animate-spin mx-auto mb-4" />
          <p className="text-[14px] text-white/40">Checking your last booking…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div ref={headingRef} className="scroll-mt-28">
          <p className="text-gold text-[12px] font-bold tracking-[0.2em] uppercase">TBM Building Services</p>
          <h1 className="mt-3 font-primary font-extrabold text-[2rem] sm:text-[2.75rem] text-white leading-[1.05] tracking-tight">
            Book a Consultation
          </h1>
          <p className="mt-4 text-white/50 text-[15px] leading-relaxed max-w-xl">
            Choose a service and a real available time. Your slot is confirmed the moment you book it, not requested.
          </p>
        </div>

        {/* Stepper */}
        <ol className="mt-10 flex items-center gap-2 sm:gap-3">
          {STEPS.map(({ id, label, Icon }, index) => {
            const done = step > id;
            const active = step === id;
            return (
              <li key={id} className="flex items-center gap-2 sm:gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => done && goToStep(id)}
                  disabled={!done}
                  aria-current={active ? "step" : undefined}
                  className={`flex items-center gap-2 min-h-11 px-2 sm:px-3 transition-colors ${
                    done ? "hover:bg-white/06 cursor-pointer" : "cursor-default"
                  }`}
                >
                  <span
                    className={`w-8 h-8 shrink-0 rounded-full grid place-items-center text-[12px] font-bold transition-colors ${
                      done ? "bg-gold text-black" : active ? "bg-gold/15 text-gold border border-gold/50" : "bg-white/6 text-white/50"
                    }`}
                  >
                    {done ? <Check size={14} strokeWidth={3} /> : <Icon size={14} />}
                  </span>
                  <span className={`hidden sm:block text-[13px] font-medium truncate ${active ? "text-white" : done ? "text-white/70" : "text-white/50"}`}>
                    {label}
                  </span>
                </button>
                {index < STEPS.length - 1 && <span className={`h-px flex-1 min-w-4 ${done ? "bg-gold/40" : "bg-white/10"}`} />}
              </li>
            );
          })}
        </ol>

        <form onSubmit={formik.handleSubmit} className="mt-8">
          <AnimatePresence mode="wait">
            {/* ── Step 1: service & property ── */}
            {step === 1 && (
              <motion.div key="step-1" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }} className="space-y-6">
                <fieldset>
                  <legend className="text-[15px] font-semibold text-white">What do you need help with?</legend>
                  <p className="mt-1.5 mb-5 text-[13px] text-white/70 leading-relaxed">One session per booking.</p>

                  {typesLoading ? (
                    <div className="border border-z-line divide-y divide-z-line">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="p-5 sm:p-6 animate-pulse">
                          <div className="h-4 bg-white/06 rounded w-1/3 mb-2" />
                          <div className="h-3 bg-white/06 rounded w-2/3" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-z-line divide-y divide-z-line">
                      {types?.map((type) => {
                        const checked = formik.values.typeKey === type.key;
                        return (
                          <button
                            key={type.key}
                            type="button"
                            onClick={() => selectType(type.key)}
                            role="radio"
                            aria-checked={checked}
                            className={`group w-full text-left p-5 sm:p-6 flex gap-4 sm:gap-5 transition-colors ${
                              checked ? "bg-gold/6" : "bg-z-panel hover:bg-white/4"
                            }`}
                          >
                            <span
                              aria-hidden
                              className={`w-5 h-5 shrink-0 mt-0.5 rounded-full border grid place-items-center transition-colors ${
                                checked ? "border-gold bg-gold" : "border-white/30 group-hover:border-white/60"
                              }`}
                            >
                              {checked && <span className="w-2 h-2 rounded-full bg-black" />}
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                                <span className="text-[15px] font-semibold text-white">{type.name}</span>
                              </span>

                              {type.description && (
                                <span className="mt-2 block text-[13px] text-white/70 leading-relaxed">{type.description}</span>
                              )}

                              <span className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                                <span className="z-micro text-[10px] flex items-center gap-1.5">
                                  {type.format === "InPerson" ? <MapPin size={11} aria-hidden /> : <Video size={11} aria-hidden />}
                                  {type.format === "InPerson" ? "On site" : "Video call"}
                                </span>
                                <span className="z-micro text-[10px] flex items-center gap-1.5">
                                  <CalendarClock size={11} aria-hidden />
                                  {formatDuration(type.durationMinutes)}
                                </span>
                                <span className="z-micro text-[10px] text-white/70">{formatFee(type.fee)}</span>
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {formik.touched.typeKey && formik.errors.typeKey && (
                    <p className="text-[12px] text-red-400 mt-2">{formik.errors.typeKey}</p>
                  )}
                </fieldset>

                <Field label="Property type" required error={formik.errors.propertyType} touched={formik.touched.propertyType}>
                  <select name="propertyType" value={formik.values.propertyType} onChange={formik.handleChange} onBlur={formik.handleBlur} className={inputClass}>
                    <option value="">Select property type</option>
                    {PROPERTY_TYPES.map((type) => (
                      <option key={type} value={type} className="bg-z-panel">
                        {type}
                      </option>
                    ))}
                  </select>
                </Field>
              </motion.div>
            )}

            {/* ── Step 2: contact, location, real availability ── */}
            {step === 2 && (
              <motion.div key="step-2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }} className="space-y-6">
                <section className={`${CARD} p-5 sm:p-6 space-y-5`}>
                  <h2 className="text-[15px] font-semibold text-white">Your details</h2>

                  <Field label="Full name" required error={formik.errors.contactName} touched={formik.touched.contactName}>
                    <input name="contactName" value={formik.values.contactName} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="Your name" className={inputClass} />
                  </Field>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Email" required error={formik.errors.contactEmail} touched={formik.touched.contactEmail}>
                      <input name="contactEmail" type="email" inputMode="email" value={formik.values.contactEmail} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="you@example.com" className={inputClass} />
                    </Field>
                    <Field label="Phone" required error={formik.errors.contactPhone} touched={formik.touched.contactPhone}>
                      <input name="contactPhone" type="tel" inputMode="tel" value={formik.values.contactPhone} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="0803 123 4567" className={inputClass} />
                    </Field>
                  </div>
                </section>

                <section className={`${CARD} p-5 sm:p-6 space-y-5`}>
                  <div>
                    <h2 className="text-[15px] font-semibold text-white">Location</h2>
                    <p className="mt-1 text-[13px] text-white/70 leading-relaxed">
                      {isInPerson
                        ? "A consultant will travel to this address, so please be precise."
                        : "Your session is remote, but we still need the location to apply the right rates and team."}
                    </p>
                  </div>

                  <Field label="Street address" required error={formik.errors.siteAddress} touched={formik.touched.siteAddress}>
                    <input name="siteAddress" value={formik.values.siteAddress} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="12 Shehu Shagari Way" className={inputClass} />
                  </Field>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="City / area" required error={formik.errors.siteCity} touched={formik.touched.siteCity}>
                      <input name="siteCity" value={formik.values.siteCity} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="Maitama" className={inputClass} />
                    </Field>
                    <Field label="State" required error={formik.errors.siteState} touched={formik.touched.siteState}>
                      <select name="siteState" value={formik.values.siteState} onChange={formik.handleChange} onBlur={formik.handleBlur} className={inputClass}>
                        <option value="">Select state</option>
                        {NIGERIA_STATES.map((state) => (
                          <option key={state} value={state} className="bg-z-panel">
                            {state}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </section>

                <section className={`${CARD} p-5 sm:p-6 space-y-5`}>
                  <div>
                    <h2 className="text-[15px] font-semibold text-white">Choose a time</h2>
                    <p className="mt-1 text-[13px] text-white/70 leading-relaxed">
                      Real availability. Booking a slot confirms it immediately.
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedDate((d) => (d > todayValue() ? addDays(d, -1) : d))}
                      disabled={selectedDate <= todayValue()}
                      className="h-11 w-11 grid place-items-center border border-z-line text-white/60 hover:text-white hover:bg-white/06 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      aria-label="Previous day"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-[14px] font-medium text-white">{formatPickerDate(selectedDate)}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedDate((d) => addDays(d, 1))}
                      className="h-11 w-11 grid place-items-center border border-z-line text-white/60 hover:text-white hover:bg-white/06 transition-colors"
                      aria-label="Next day"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {!formik.values.typeKey ? (
                    <p className="text-[13px] text-white/50 text-center py-6">Choose a service on the previous step first.</p>
                  ) : availabilityLoading ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-11 bg-white/06 rounded animate-pulse" />
                      ))}
                    </div>
                  ) : availability?.slots?.length ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {availability.slots.map((slot) => {
                        const selected = formik.values.scheduledStart === slot.start;
                        return (
                          <button
                            key={slot.start}
                            type="button"
                            disabled={!slot.isAvailable}
                            onClick={() => {
                              formik.setFieldValue("scheduledStart", slot.start);
                              formik.setFieldTouched("scheduledStart", true, false);
                            }}
                            className={`h-11 text-[13px] font-medium border transition-colors ${
                              selected
                                ? "border-gold bg-gold text-black"
                                : slot.isAvailable
                                  ? "border-z-line text-white hover:border-gold/50 hover:bg-white/04"
                                  : "border-z-line text-white/20 line-through cursor-not-allowed"
                            }`}
                          >
                            {formatSlotTime(slot.start)}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[13px] text-white/50 text-center py-6">No slots for this day. Try another date.</p>
                  )}

                  {formik.touched.scheduledStart && formik.errors.scheduledStart && (
                    <p className="text-[12px] text-red-400">{formik.errors.scheduledStart}</p>
                  )}
                </section>
              </motion.div>
            )}

            {/* ── Step 3: notes, review ── */}
            {step === 3 && (
              <motion.div key="step-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }} className="space-y-6">
                <section className={`${CARD} p-5 sm:p-6 space-y-5`}>
                  <Field
                    label="Anything we should know?"
                    hint={`Optional · ${formik.values.notes.length} / 2000 characters`}
                    error={formik.errors.notes}
                    touched={formik.touched.notes}
                  >
                    <textarea
                      name="notes"
                      rows={5}
                      maxLength={2000}
                      value={formik.values.notes}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Rooms involved, rough budget, timing, anything already decided."
                      className={`${inputClass} resize-y leading-relaxed`}
                    />
                  </Field>
                </section>

                <section className={`${CARD} p-5 sm:p-6`}>
                  <h2 className="text-[15px] font-semibold text-white mb-4">Review your booking</h2>
                  <dl className="space-y-3">
                    <SummaryRow label="Service" value={selectedType?.name} />
                    <SummaryRow label="Property" value={formik.values.propertyType} />
                    <SummaryRow
                      label="Location"
                      value={[formik.values.siteAddress, formik.values.siteCity, formik.values.siteState].filter(Boolean).join(", ")}
                    />
                    <SummaryRow label="Time" value={formatDateTime(formik.values.scheduledStart)} />
                  </dl>

                  <div className="mt-5 pt-5 border-t border-z-line flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[13px] font-medium text-white/70">Fee</p>
                      <p className="mt-1 text-[12px] text-white/50 leading-relaxed max-w-sm">
                        {selectedType?.fee > 0
                          ? "You'll pay by card on the next step. Your slot is held once booked."
                          : "This consultation type is free. No payment needed."}
                      </p>
                    </div>
                    <span className="text-white text-xl font-extrabold font-primary tabular-nums shrink-0">
                      {selectedType ? formatFee(selectedType.fee) : "—"}
                    </span>
                  </div>
                </section>

                {!sessionLoading && !isAuthenticated && (isPaid ? (
                  <div className="border border-gold/25 bg-gold/6 p-5">
                    <div className="flex items-start gap-3">
                      <Lock size={16} className="text-gold shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold text-white">Sign in to book a paid consultation</p>
                        <p className="mt-1 text-[13px] text-white/50 leading-relaxed">
                          Paid bookings live under your account so you can always see the payment status, reschedule, or
                          request a refund. Your details here are kept while you sign in.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Link href={`/sign-in?from=${encodeURIComponent(pathname)}`} className="btn-gold px-5 py-2.5 min-h-11">
                            Log In
                          </Link>
                          <Link href={`/sign-up?from=${encodeURIComponent(pathname)}`} className="btn-outline px-5 py-2.5 min-h-11">
                            Create Account
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border border-white/10 bg-white/3 p-5">
                    <div className="flex items-start gap-3">
                      <Lock size={16} className="text-gold shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold text-white">No account needed for a free consultation</p>
                        <p className="mt-1 text-[13px] text-white/50 leading-relaxed">
                          You&rsquo;ll get a private link to view, reschedule or cancel this booking. Prefer to keep
                          everything in one place?{" "}
                          <Link href={`/sign-in?from=${encodeURIComponent(pathname)}`} className="text-gold hover:underline">
                            Sign in
                          </Link>{" "}
                          before you confirm and it will appear under My Consultations.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Navigation ── */}
          <div className="mt-8 flex items-center justify-between gap-3">
            {step > 1 ? (
              <button type="button" onClick={() => goToStep(step - 1)} className="min-h-11 px-5 inline-flex items-center gap-2 text-[14px] text-white/70 hover:text-white hover:bg-white/6 transition-colors">
                <ArrowLeft size={15} /> Back
              </button>
            ) : (
              <span />
            )}

            {step < STEPS.length ? (
              <button type="button" onClick={handleContinue} className="btn-gold px-7 py-3.5 min-h-11">
                Continue <ArrowRight size={14} />
              </button>
            ) : (
              <button type="submit" disabled={submitting || uploading || needsSignIn} className="btn-gold px-7 py-3.5 min-h-11 disabled:opacity-40 disabled:cursor-not-allowed">
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> {initPaymentMutation.isPending ? "Redirecting to payment…" : "Booking…"}
                  </>
                ) : (
                  <>
                    {selectedType?.fee > 0 ? "Continue to Payment" : "Confirm Booking"} <ArrowRight size={14} />
                  </>
                )}
              </button>
            )}
          </div>

          {step === STEPS.length && !stepIsValid && formik.submitCount > 0 && (
            <p className="mt-3 text-[12px] text-red-400 text-right">Some details are still missing. Check the steps above.</p>
          )}
        </form>
      </div>
    </div>
  );
}
