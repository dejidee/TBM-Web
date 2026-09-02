"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Lock,
  Eye,
  Database,
  Users,
  Globe,
  Bell,
  ChevronRight,
  Mail,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Info,
  UserCheck,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const TOC = [
  { id: "introduction", label: "Introduction", icon: Info },
  {
    id: "information-we-collect",
    label: "Information We Collect",
    icon: Database,
  },
  { id: "how-we-use", label: "How We Use Your Information", icon: Eye },
  { id: "how-we-share", label: "How We Share Your Information", icon: Users },
  { id: "data-storage", label: "Data Storage & Security", icon: Lock },
  { id: "your-rights", label: "Your Privacy Rights", icon: UserCheck },
  { id: "cookies", label: "Cookies & Tracking", icon: Globe },
  { id: "third-party", label: "Third-Party Services", icon: ExternalLink },
  { id: "international", label: "International Transfers", icon: Globe },
  { id: "childrens", label: "Children's Privacy", icon: Shield },
  { id: "business-users", label: "Business Users", icon: Users },
  { id: "changes", label: "Policy Changes", icon: Bell },
  { id: "legal", label: "Legal Compliance", icon: CheckCircle },
  { id: "contact", label: "Contact Information", icon: Mail },
  { id: "consent", label: "Your Consent", icon: CheckCircle },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function GoldDivider() {
  return (
    <div
      className="w-full h-px my-10"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.35) 30%, rgba(212,175,55,0.35) 70%, transparent 100%)",
      }}
    />
  );
}

function SectionLabel({ number, label }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span
        className="inline-flex items-center justify-center w-7 h-7 text-[16px] font-bold font-manrope"
        style={{
          background: "rgba(212,175,55,0.12)",
          border: "1px solid rgba(212,175,55,0.25)",
          color: "#D4AF37",
        }}
      >
        {number}
      </span>
      <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.2em] font-manrope">
        {label}
      </span>
    </div>
  );
}

function SectionHeading({ children }) {
  return (
    <h2 className="text-2xl sm:text-3xl font-bold text-white font-poppins leading-snug mb-6">
      {children}
    </h2>
  );
}

function SubHeading({ children }) {
  return (
    <h3 className="text-base font-semibold text-white font-poppins mt-8 mb-3 flex items-center gap-2">
      <span
        className="inline-block w-1 h-4 flex-shrink-0"
        style={{ background: "#D4AF37" }}
      />
      {children}
    </h3>
  );
}

function BodyText({ children, className = "" }) {
  return (
    <p className={`text-white/55 text-sm leading-7 font-manrope ${className}`}>
      {children}
    </p>
  );
}

function BulletList({ items }) {
  return (
    <ul className="space-y-2 mt-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span
            className="inline-block w-1 h-1 rounded-full mt-[10px] flex-shrink-0"
            style={{ background: "#D4AF37" }}
          />
          <span className="text-white/55 text-sm leading-7 font-manrope">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Callout({ type = "info", children }) {
  const config = {
    warning: {
      bg: "rgba(212,175,55,0.06)",
      border: "rgba(212,175,55,0.25)",
      icon: (
        <AlertTriangle
          size={16}
          className="text-[#D4AF37] flex-shrink-0 mt-0.5"
        />
      ),
      label: "Important Notice",
      labelColor: "#D4AF37",
    },
    critical: {
      bg: "rgba(255,255,255,0.03)",
      border: "rgba(255,255,255,0.12)",
      icon: <Shield size={16} className="text-white/70 flex-shrink-0 mt-0.5" />,
      label: "Notice",
      labelColor: "rgba(255,255,255,0.7)",
    },
    success: {
      bg: "rgba(212,175,55,0.04)",
      border: "rgba(212,175,55,0.2)",
      icon: (
        <CheckCircle
          size={16}
          className="text-[#D4AF37] flex-shrink-0 mt-0.5"
        />
      ),
      label: "Commitment",
      labelColor: "#D4AF37",
    },
  };
  const c = config[type];
  return (
    <div
      className="rounded-xl p-5 mt-6 mb-2"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <div className="flex items-start gap-3">
        {c.icon}
        <div>
          <span
            className="block text-[16px] font-bold uppercase tracking-[0.18em] font-manrope mb-1.5"
            style={{ color: c.labelColor }}
          >
            {c.label}
          </span>
          <div className="text-white/60 text-sm leading-7 font-manrope">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ id, number, labelText, heading, children, delay = 0 }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true, margin: "-80px" }}
      className="scroll-mt-28"
    >
      <SectionLabel number={number} label={labelText} />
      <SectionHeading>{heading}</SectionHeading>
      {children}
      <GoldDivider />
    </motion.section>
  );
}

// ─── TOC Sidebar ─────────────────────────────────────────────────────────────

function TableOfContents({ activeId }) {
  const handleClick = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <aside className="hidden xl:block w-64 flex-shrink-0 self-start sticky top-28">
      <div
        className="rounded-2xl p-5 overflow-y-auto max-h-[calc(100vh-8rem)]"
        style={{
          background: "#0d0b08",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 0 40px rgba(0,0,0,0.4)",
        }}
      >
        <p className="text-[16px] font-bold uppercase tracking-[0.22em] text-[#D4AF37] font-manrope mb-4">
          Contents
        </p>
        <nav className="space-y-0.5">
          {TOC.map(({ id, label }) => {
            const isActive = activeId === id;
            return (
              <button
                key={id}
                onClick={() => handleClick(id)}
                className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 group"
                style={{
                  background: isActive ? "rgba(212,175,55,0.1)" : "transparent",
                }}
              >
                <span
                  className="inline-block w-1 h-1 rounded-full flex-shrink-0 transition-all duration-200"
                  style={{
                    background: isActive ? "#D4AF37" : "rgba(255,255,255,0.15)",
                    width: isActive ? 6 : 4,
                    height: isActive ? 6 : 4,
                  }}
                />
                <span
                  className="text-[11px] font-manrope leading-snug transition-colors duration-200"
                  style={{
                    color: isActive ? "#D4AF37" : "rgba(255,255,255,0.4)",
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Contact shortcut */}
        <div
          className="mt-5 pt-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <a
            href="mailto:support@tbmbuilding.com"
            className="flex items-center gap-2 text-[11px] font-manrope text-white/40 hover:text-[#D4AF37] transition-colors"
          >
            <Mail size={12} />
            support@tbmbuilding.com
          </a>
        </div>
      </div>
    </aside>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PrivacyPolicyPage() {
  const [activeId, setActiveId] = useState("introduction");
  const observerRef = useRef(null);

  // Track which section is in view
  useEffect(() => {
    const ids = TOC.map((t) => t.id);
    const observers = [];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveId(id);
        },
        { rootMargin: "-25% 0px -70% 0px", threshold: 0 },
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <div className="min-h-screen bg-black font-manrope">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #0d0b08 0%, #000000 100%)",
        }}
      >
        {/* Decorative radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(212,175,55,0.07) 0%, transparent 70%)",
          }}
        />
        {/* Top gold line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-20 sm:pt-40 sm:pb-28">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 mb-6"
          >
            <span
              className="inline-flex items-center gap-2 border text-white/60 text-[16px] font-medium px-4 py-2 tracking-[0.22em] uppercase font-manrope"
              style={{ borderColor: "rgba(255,255,255,0.12)" }}
            >
              <Shield size={10} className="text-[#D4AF37]" />
              Legal Document
            </span>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white font-poppins tracking-tight leading-[1.05] mb-4">
              Privacy
              <span className="block" style={{ color: "#D4AF37" }}>
                Policy
              </span>
            </h1>
          </motion.div>

          {/* Meta row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
            className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-6"
          >
            <span className="text-white/35 text-sm">
              TBM Building Services, &ldquo;The Building Doctor&rdquo;
            </span>
            <span
              className="w-1 h-1 rounded-full hidden sm:block"
              style={{ background: "rgba(255,255,255,0.2)" }}
            />
            <span className="text-white/35 text-sm">
              Last Updated: April 21, 2026
            </span>
            <span
              className="w-1 h-1 rounded-full hidden sm:block"
              style={{ background: "rgba(255,255,255,0.2)" }}
            />
            <span className="text-white/35 text-sm">Version 1.0</span>
          </motion.div>

          {/* Intro line */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32 }}
            className="text-white/50 text-base sm:text-lg leading-relaxed max-w-2xl"
          >
            We are committed to protecting your privacy and ensuring the
            security of your personal information. This document explains
            exactly how we handle your data.
          </motion.p>

          {/* Stat pills */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.42 }}
            className="flex flex-wrap gap-3 mt-10"
          >
            {[
              { icon: <Shield size={13} />, text: "No data selling" },
              { icon: <Lock size={13} />, text: "SSL encrypted" },
              { icon: <UserCheck size={13} />, text: "NDPR & GDPR aligned" },
              { icon: <Bell size={13} />, text: "30-day response" },
            ].map(({ icon, text }) => (
              <span
                key={text}
                className="inline-flex items-center gap-2 text-[11px] font-medium tracking-wide px-4 py-2 font-manrope"
                style={{
                  background: "rgba(212,175,55,0.07)",
                  border: "1px solid rgba(212,175,55,0.18)",
                  color: "#D4AF37",
                }}
              >
                {icon}
                {text}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex gap-12 items-start">
        {/* Sidebar TOC */}
        <TableOfContents activeId={activeId} />

        {/* Main content */}
        <div className="flex-1 min-w-0 max-w-3xl">
          {/* Opening commitment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl p-8 mb-14"
            style={{
              background: "#0d0b08",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.03), 0 24px 48px rgba(0,0,0,0.3)",
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  background: "rgba(212,175,55,0.1)",
                  border: "1px solid rgba(212,175,55,0.2)",
                }}
              >
                <Shield size={18} className="text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-[#D4AF37] text-xs font-bold uppercase tracking-[0.22em] mb-2 font-manrope">
                  Your Privacy Matters to Us
                </p>
                <p className="text-white/60 text-sm leading-7 font-manrope">
                  At TBM Building Services ("The Building Doctor"), we are
                  committed to protecting your privacy and ensuring the security
                  of your personal information. This Privacy Policy explains how
                  we collect, use, store, and protect your data when you use our
                  platform, mobile application, and services.
                </p>
              </div>
            </div>
          </motion.div>

          {/* ── Section 1 ── */}
          <Section
            id="introduction"
            number="01"
            labelText="Introduction"
            heading="What Is This Policy?"
            delay={0}
          >
            <BodyText>
              TBM Building Services operates an AI-powered e-commerce platform
              and mobile application (collectively, "the Platform") that
              provides building materials, construction services, AI-powered
              design tools, and project management solutions.
            </BodyText>
            <Callout type="critical">
              By accessing or using our Platform, you acknowledge that you have
              read, understood, and agree to be bound by this Privacy Policy. If
              you do not agree with our practices, please do not use our
              services.
            </Callout>
          </Section>

          {/* ── Section 2 ── */}
          <Section
            id="information-we-collect"
            number="02"
            labelText="Data Collection"
            heading="Information We Collect"
          >
            <SubHeading>2.1 Account Information</SubHeading>
            <BodyText>
              When you create an account with TBM Building Services, we collect:
            </BodyText>
            <BulletList
              items={[
                "Personal Identifiers: First name, last name, email address, phone number",
                "Authentication Data: Encrypted password (we never store passwords in plain text)",
                "Profile Information: Profile photo/avatar (optional), user preferences",
                "Account Type: Customer, Vendor, or Admin designation",
              ]}
            />

            <SubHeading>2.2 Delivery & Shipping Information</SubHeading>
            <BodyText>To fulfill your orders, we collect:</BodyText>
            <BulletList
              items={[
                "Delivery addresses (street address, city, state, postal code, country)",
                "Contact phone number for delivery coordination",
                "Delivery instructions or special requests",
              ]}
            />

            <SubHeading>2.3 Payment Information</SubHeading>
            <BodyText>
              For payment processing we collect your payment method selection,
              transaction confirmations, payment reference numbers and
              transaction status.
            </BodyText>
            <Callout type="warning">
              We DO NOT store credit card details, debit card numbers, or
              banking credentials. All payment processing is handled securely by
              our third-party payment processor,{" "}
              <strong className="text-[#D4AF37]">Paystack</strong>.
            </Callout>

            <SubHeading>2.4 Order & Purchase Information</SubHeading>
            <BulletList
              items={[
                "Order history and purchase records",
                "Products and services purchased",
                "Order amounts and transaction values",
                "Delivery status and tracking information",
                "Order-related communications and support tickets",
              ]}
            />

            <SubHeading>2.5 AI & Design Feature Data</SubHeading>
            <BodyText>
              When you use our AI-powered design tools, we collect:
            </BodyText>
            <BulletList
              items={[
                "Room Photos: Images you upload for Ziora design generation",
                "Design Preferences: Selected tiers (Luxury/Economic), room types, style preferences",
                "Project Details: Room dimensions, vision descriptions, context labels",
                "Generated Content: AI-generated designs, videos, and bills of materials",
                "Project Information: Project names, timelines, documents, and site gallery images",
                "AI Usage Metrics: Credits consumed, generation history, feature usage patterns",
              ]}
            />

            <SubHeading>2.6 Technical & Usage Data</SubHeading>
            <BulletList
              items={[
                "Device Information: Device type, operating system, browser type and version",
                "Network Data: IP address, internet service provider",
                "Usage Analytics: Pages visited, features used, time spent on platform, click patterns",
                "Session Data: Login times, session duration, user interactions",
                "Error Logs: Technical errors, crash reports, performance metrics",
              ]}
            />

            <SubHeading>2.7 Communications</SubHeading>
            <BulletList
              items={[
                "Customer support inquiries and responses",
                "Feedback, reviews, and ratings",
                "Email correspondence",
                "In-app messages and notifications",
              ]}
            />

            <Callout type="warning">
              <strong>Age Restriction:</strong> Our Platform is intended for
              users aged <strong>18 years and older</strong>. We do not
              knowingly collect personal information from individuals under 18.
              If we become aware that we have collected information from a
              minor, we will take immediate steps to delete such information.
            </Callout>
          </Section>

          {/* ── Section 3 ── */}
          <Section
            id="how-we-use"
            number="03"
            labelText="Data Usage"
            heading="How We Use Your Information"
          >
            <SubHeading>3.1 Service Delivery</SubHeading>
            <BulletList
              items={[
                "Process and fulfill your orders for building materials and services",
                "Coordinate delivery and shipping logistics",
                "Manage your account and authenticate your identity",
                "Provide customer support and respond to your inquiries",
                "Send transactional communications (order confirmations, shipping updates, receipts)",
              ]}
            />

            <SubHeading>3.2 AI & Design Services</SubHeading>
            <BulletList
              items={[
                "Generate AI-powered room designs based on your uploaded photos",
                "Create customized bills of materials from our product inventory",
                "Produce AI-generated videos and visual content",
                "Manage your design projects, timelines, and documentation",
                "Track AI credit usage and quota management",
              ]}
            />

            <SubHeading>3.3 Payment Processing</SubHeading>
            <BulletList
              items={[
                "Process payments securely through our payment processor (Paystack)",
                "Verify payment status and transaction completion",
                "Generate invoices and payment receipts",
                "Handle refunds and payment disputes",
              ]}
            />

            <SubHeading>3.4 Platform Improvement</SubHeading>
            <BulletList
              items={[
                "Analyze usage patterns to improve user experience",
                "Develop new features and enhance existing functionality",
                "Optimize AI model performance and accuracy",
                "Troubleshoot technical issues and fix bugs",
                "Conduct internal research and analytics",
              ]}
            />

            <SubHeading>
              3.5 Marketing & Communications (with your consent)
            </SubHeading>
            <BulletList
              items={[
                "Send promotional offers, product updates, and newsletters",
                "Provide personalized recommendations based on your preferences",
                "Notify you about new features, services, or special events",
                "Conduct surveys and gather feedback",
              ]}
            />

            <SubHeading>3.6 Legal & Security</SubHeading>
            <BulletList
              items={[
                "Comply with legal obligations and regulatory requirements",
                "Prevent fraud, unauthorized access, and security threats",
                "Enforce our Terms of Service and platform policies",
                "Protect the rights, property, and safety of TBM, our users, and the public",
                "Resolve disputes and legal claims",
              ]}
            />
          </Section>

          {/* ── Section 4 ── */}
          <Section
            id="how-we-share"
            number="04"
            labelText="Data Sharing"
            heading="How We Share Your Information"
          >
            <Callout type="success">
              <strong>
                We do not sell your personal information to third parties.
              </strong>{" "}
              We may share your information only in the specific circumstances
              described below.
            </Callout>

            <SubHeading>4.1 Service Providers & Partners</SubHeading>
            <BodyText>
              We share data with trusted third-party service providers who help
              us operate our platform:
            </BodyText>
            <BulletList
              items={[
                "Paystack: Payment processing and transaction management",
                "Cloudinary: Secure image and media storage",
                "OpenAI: AI-powered image generation and design services",
                "Replicate: Video generation services",
                "Email Service Providers: Transactional and promotional email delivery",
                "Cloud Hosting Providers: Platform infrastructure and data storage",
              ]}
            />
            <BodyText className="mt-3">
              These service providers are contractually obligated to use your
              information only for the purposes we specify and to maintain
              appropriate security measures.
            </BodyText>

            <SubHeading>4.2 Vendors & Delivery Partners</SubHeading>
            <BodyText>
              When you place an order, we share your delivery address and
              contact information with assigned vendors and delivery agents,
              only to the extent needed to complete delivery.
            </BodyText>

            <SubHeading>4.3 Business Transfers</SubHeading>
            <BodyText>
              In the event of a merger, acquisition, reorganization, or sale of
              assets, your information may be transferred to the acquiring
              entity. We will notify you of any such change via email or
              prominent notice on our platform.
            </BodyText>

            <SubHeading>4.4 Legal Requirements</SubHeading>
            <BodyText>
              We may disclose your information if required by law or in response
              to:
            </BodyText>
            <BulletList
              items={[
                "Valid legal processes (court orders, subpoenas, warrants)",
                "Government or regulatory requests",
                "National security or law enforcement requirements",
                "Protection of our legal rights or defense against legal claims",
                "Prevention of fraud, abuse, or harm to users",
              ]}
            />

            <SubHeading>4.5 With Your Consent</SubHeading>
            <BodyText>
              We may share your information for purposes not listed here with
              your explicit consent.
            </BodyText>
          </Section>

          {/* ── Section 5 ── */}
          <Section
            id="data-storage"
            number="05"
            labelText="Security"
            heading="Data Storage & Security"
          >
            <SubHeading>5.1 Where We Store Your Data</SubHeading>
            <BodyText>
              Your data is stored on secure servers provided by reputable cloud
              hosting providers. Data may be stored and processed in Nigeria and
              other jurisdictions where our service providers operate.
            </BodyText>

            <SubHeading>5.2 Security Measures</SubHeading>
            <BodyText>
              We implement industry-standard security measures to protect your
              information:
            </BodyText>
            <BulletList
              items={[
                "Encryption: All passwords are encrypted using strong cryptographic algorithms",
                "Secure Transmission: Data transmitted between your device and our servers is encrypted using SSL/TLS protocols",
                "Access Controls: Strict role-based access controls limit employee access to personal data",
                "Authentication: Multi-factor authentication options for account protection",
                "Monitoring: Continuous monitoring for security threats and suspicious activity",
                "Regular Audits: Periodic security assessments and vulnerability testing",
              ]}
            />

            <SubHeading>5.3 Data Retention</SubHeading>
            <BodyText>
              We retain your personal information for as long as necessary to:
            </BodyText>
            <BulletList
              items={[
                "Provide you with our services",
                "Comply with legal obligations (e.g., tax records, transaction history)",
                "Resolve disputes and enforce our agreements",
                "Maintain business records for operational purposes",
              ]}
            />
            <BodyText className="mt-3">
              When data is no longer needed, we securely delete or anonymize it.
              Account information for inactive accounts may be retained in
              accordance with applicable legal requirements.
            </BodyText>

            <Callout type="warning">
              <strong>Data Breach Notification:</strong> In the unlikely event
              of a data breach affecting your personal information, we will
              notify you promptly via email and take immediate steps to mitigate
              any harm.
            </Callout>
          </Section>

          {/* ── Section 6 ── */}
          <Section
            id="your-rights"
            number="06"
            labelText="Your Rights"
            heading="Your Privacy Rights"
          >
            <BodyText>
              You have the following rights regarding your personal information:
            </BodyText>

            {[
              {
                heading: "6.1 Access & Portability",
                items: [
                  "Right to Access: Request a copy of the personal information we hold about you",
                  "Data Portability: Request your data in a structured, machine-readable format",
                ],
              },
              {
                heading: "6.2 Correction & Updates",
                items: [
                  "Update your account information directly through your profile settings",
                  "Request correction of inaccurate or incomplete data",
                ],
              },
              {
                heading: "6.3 Deletion",
                items: [
                  "Right to Deletion: Request deletion of your account and associated personal data",
                  "We will delete your information unless we are required to retain it for legal, regulatory, or legitimate business purposes",
                  "Note: Some information may remain in backups for a limited period after deletion",
                ],
              },
              {
                heading: "6.4 Objection & Restriction",
                items: [
                  "Opt-Out of Marketing: Unsubscribe from promotional emails via the link in each message",
                  "Restrict Processing: Request limitation of how we use your data in certain circumstances",
                  "Object to Processing: Object to data processing based on legitimate interests",
                ],
              },
              {
                heading: "6.5 Withdraw Consent",
                items: [
                  "If we process your data based on consent, you can withdraw that consent at any time",
                  "Withdrawal does not affect the lawfulness of processing before withdrawal",
                ],
              },
            ].map(({ heading, items }) => (
              <div key={heading}>
                <SubHeading>{heading}</SubHeading>
                <BulletList items={items} />
              </div>
            ))}

            {/* How to exercise rights box */}
            <div
              className="mt-8 rounded-2xl p-6"
              style={{
                background: "#0d0b08",
                border: "1px solid rgba(212,175,55,0.18)",
              }}
            >
              <p className="text-[#D4AF37] text-xs font-bold uppercase tracking-[0.2em] font-manrope mb-4">
                How to Exercise Your Rights
              </p>
              <div className="space-y-2">
                {[
                  { label: "Email", value: "support@tbmbuilding.com" },
                  { label: "Subject Line", value: '"Privacy Rights Request"' },
                  {
                    label: "Include",
                    value:
                      "Your full name, email address, and specific request",
                  },
                  { label: "Response Time", value: "Within 30 days" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <span className="text-white/30 text-sm font-manrope w-28 flex-shrink-0">
                      {label}
                    </span>
                    <span className="text-white/65 text-sm font-manrope">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* ── Section 7 ── */}
          <Section
            id="cookies"
            number="07"
            labelText="Tracking"
            heading="Cookies & Tracking Technologies"
          >
            <SubHeading>7.1 What We Use</SubHeading>
            <BulletList
              items={[
                "Essential Cookies: Required for platform functionality (login, cart, session management)",
                "Analytics Cookies: Help us understand how users interact with our platform",
                "Preference Cookies: Remember your settings and preferences",
              ]}
            />

            <SubHeading>7.2 Your Control</SubHeading>
            <BodyText>
              You can control cookies through your browser settings. Note that
              disabling essential cookies may affect platform functionality.
            </BodyText>
          </Section>

          {/* ── Section 8 ── */}
          <Section
            id="third-party"
            number="08"
            labelText="Integrations"
            heading="Third-Party Services & Links"
          >
            {[
              {
                heading: "8.1 Payment Processing",
                items: [
                  "Paystack: Processes all payment transactions securely",
                  "Subject to Paystack's own privacy policy and terms",
                  "We do not store your payment card information",
                ],
              },
              {
                heading: "8.2 AI Services",
                items: [
                  "OpenAI & Replicate: Power our Ziora design generation features",
                  "Your uploaded images and prompts are processed by these services",
                  "Subject to their respective privacy policies and data handling practices",
                ],
              },
              {
                heading: "8.3 Media Storage",
                items: [
                  "Cloudinary: Securely stores images and media files",
                  "Subject to Cloudinary's privacy policy and security standards",
                ],
              },
            ].map(({ heading, items }) => (
              <div key={heading}>
                <SubHeading>{heading}</SubHeading>
                <BulletList items={items} />
              </div>
            ))}

            <SubHeading>8.4 External Links</SubHeading>
            <BodyText>
              Our Platform may contain links to external websites or services.
              We are not responsible for the privacy practices of these third
              parties. We encourage you to review their privacy policies before
              providing any information.
            </BodyText>
          </Section>

          {/* ── Section 9 ── */}
          <Section
            id="international"
            number="09"
            labelText="Global Operations"
            heading="International Data Transfers"
          >
            <BodyText>
              TBM Building Services operates primarily in Nigeria. However, some
              of our service providers may be located in other countries. When
              we transfer data internationally:
            </BodyText>
            <BulletList
              items={[
                "We ensure appropriate safeguards are in place",
                "We comply with applicable data protection laws",
                "We use service providers that maintain adequate security standards",
              ]}
            />
          </Section>

          {/* ── Section 10 ── */}
          <Section
            id="childrens"
            number="10"
            labelText="Children"
            heading="Children's Privacy"
          >
            <Callout type="warning">
              <strong>Age Restriction (18+):</strong> Our Platform and services
              are intended exclusively for users aged{" "}
              <strong>18 years and older</strong>. We do not knowingly collect,
              use, or disclose personal information from children under 18.
            </Callout>
            <BodyText className="mt-4">
              If you are a parent or guardian and believe your child has
              provided us with personal information, please contact us
              immediately at{" "}
              <a
                href="mailto:support@tbmbuilding.com"
                className="text-[#D4AF37] hover:underline"
              >
                support@tbmbuilding.com
              </a>
              . We will take prompt steps to delete such information from our
              systems.
            </BodyText>
          </Section>

          {/* ── Section 11 ── */}
          <Section
            id="business-users"
            number="11"
            labelText="Vendors & Admins"
            heading="Business Users"
          >
            <BodyText>If you are a vendor or administrative user:</BodyText>
            <BulletList
              items={[
                "Additional data may be collected related to your business operations",
                "You may have access to customer data necessary to fulfill orders",
                "You are responsible for protecting customer information you access",
                "You must comply with our Vendor Terms of Service and data protection requirements",
              ]}
            />
          </Section>

          {/* ── Section 12 ── */}
          <Section
            id="changes"
            number="12"
            labelText="Updates"
            heading="Changes to This Privacy Policy"
          >
            <BodyText>
              We may update this Privacy Policy from time to time to reflect
              changes in our practices or services, legal or regulatory
              requirements, and technology improvements or security
              enhancements.
            </BodyText>
            <SubHeading>When We Make Material Changes</SubHeading>
            <BulletList
              items={[
                'We will update the "Last Updated" date at the top of this policy',
                "We will notify you via email or prominent notice on the Platform",
                "For significant changes, we may request your consent",
              ]}
            />
            <BodyText className="mt-4">
              We encourage you to review this Privacy Policy periodically to
              stay informed about how we protect your information.
            </BodyText>
          </Section>

          {/* ── Section 13 ── */}
          <Section
            id="legal"
            number="13"
            labelText="Compliance"
            heading="Legal Compliance"
          >
            <BodyText>This Privacy Policy is designed to comply with:</BodyText>
            <BulletList
              items={[
                "Nigeria Data Protection Regulation (NDPR)",
                "General Data Protection Regulation (GDPR), for European users",
                "California Consumer Privacy Act (CCPA), for California users",
                "Other applicable data protection and privacy laws",
              ]}
            />
          </Section>

          {/* ── Section 14 ── */}
          <Section
            id="contact"
            number="14"
            labelText="Get in Touch"
            heading="Contact Information"
          >
            <BodyText>
              If you have questions, concerns, or requests regarding this
              Privacy Policy or how we handle your personal information, please
              contact us:
            </BodyText>

            {/* Contact card */}
            <div
              className="mt-6 rounded-2xl overflow-hidden"
              style={{
                border: "1px solid rgba(255,255,255,0.07)",
                background: "#0d0b08",
              }}
            >
              {/* Top accent */}
              <div
                className="h-0.5 w-full"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)",
                }}
              />

              <div className="p-6 sm:p-8 grid sm:grid-cols-2 gap-8">
                <div>
                  <p className="text-[#D4AF37] text-[16px] font-bold uppercase tracking-[0.2em] font-manrope mb-3">
                    Company
                  </p>
                  <p className="text-white font-semibold font-poppins text-sm mb-0.5">
                    TBM Building Services
                  </p>
                  <p className="text-white/40 text-sm font-manrope">
                    "The Building Doctor"
                  </p>
                  <p className="text-white/40 text-sm font-manrope mt-2">
                    Nigeria
                  </p>
                </div>

                <div>
                  <p className="text-[#D4AF37] text-[16px] font-bold uppercase tracking-[0.2em] font-manrope mb-3">
                    Contact
                  </p>
                  <div className="space-y-2">
                    <a
                      href="mailto:support@tbmbuilding.com"
                      className="flex items-center gap-2 text-white/55 hover:text-[#D4AF37] text-sm font-manrope transition-colors"
                    >
                      <Mail size={13} />
                      support@tbmbuilding.com
                    </a>
                    <a
                      href="https://tbmbuilding.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-white/55 hover:text-[#D4AF37] text-sm font-manrope transition-colors"
                    >
                      <Globe size={13} />
                      tbmbuilding.com
                    </a>
                  </div>
                </div>

                <div
                  className="sm:col-span-2 pt-6"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <p className="text-[#D4AF37] text-[16px] font-bold uppercase tracking-[0.2em] font-manrope mb-3">
                    For Privacy Rights Requests
                  </p>
                  <div className="flex flex-wrap gap-x-8 gap-y-2">
                    {[
                      { label: "Email", value: "support@tbmbuilding.com" },
                      { label: "Subject", value: '"Privacy Rights Request"' },
                      { label: "Response", value: "Within 30 days" },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <span className="text-white/30 text-xs font-manrope block">
                          {label}
                        </span>
                        <span className="text-white/60 text-sm font-manrope">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* ── Section 15 ── */}
          <Section
            id="consent"
            number="15"
            labelText="Agreement"
            heading="Your Consent"
          >
            <BodyText>By using our Platform, you consent to:</BodyText>
            <BulletList
              items={[
                "The collection and use of information as described in this Privacy Policy",
                "The processing of your data by our service providers as outlined",
                "Receiving transactional communications necessary for service delivery",
              ]}
            />
            <BodyText className="mt-4">
              For marketing communications, we will obtain separate consent, and
              you can opt out at any time.
            </BodyText>
          </Section>

          {/* ── Footer CTA ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: "#0d0b08",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {/* Glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(212,175,55,0.07) 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(212,175,55,0.45), transparent)",
              }}
            />

            <div className="relative z-10 p-10 sm:p-14 text-center">
              <div
                className="w-12 h-12 flex items-center justify-center mx-auto mb-6"
                style={{
                  background: "rgba(212,175,55,0.1)",
                  border: "1px solid rgba(212,175,55,0.22)",
                }}
              >
                <Shield size={22} className="text-[#D4AF37]" />
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-white font-poppins mb-3">
                Committed to Your Privacy
              </h2>
              <p className="text-white/45 text-sm leading-7 font-manrope max-w-md mx-auto mb-8">
                Questions about this policy? Our team is here to help and will
                respond within 30 days.
              </p>

              <a
                href="mailto:support@tbmbuilding.com"
                className="inline-flex items-center gap-2 px-8 py-4 text-black font-semibold text-[11px] tracking-[0.18em] uppercase font-manrope transition-opacity hover:opacity-90"
                style={{
                  background:
                    "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)",
                }}
              >
                <Mail size={14} />
                Contact Our Privacy Team
              </a>

              <p className="text-white/20 text-xs font-manrope mt-8">
                © 2026 TBM Building Services. All rights reserved. · Version 1.0
                · Last updated April 21, 2026
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
