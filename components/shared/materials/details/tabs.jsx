"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const tabs = [
  { id: "description", label: "Description" },
  { id: "specifications", label: "Specifications" },
  { id: "ordering", label: "Ordering & Delivery" },
];

// A spec row only appears when the product actually carries the value — no
// invented defaults. (The old version hardcoded Carrara-marble facts, so every
// product read "Origin: Italy, Size: 12x24 inches" regardless of what it was.)
function buildSpecs(material) {
  const rows = [
    { label: "Collection", value: material.categoryName },
    { label: "Brand", value: material.brandName },
    { label: "SKU", value: material.sku },
    { label: "Material", value: material.material },
    { label: "Colour", value: material.color },
    { label: "Finish", value: material.finishType },
    { label: "Installation", value: material.installationType },
    { label: "Dimensions", value: material.dimensions },
    { label: "Warranty", value: material.warranty },
  ].filter((r) => r.value && r.value !== "null");

  // Backend `specifications` is a list of { key, value } when present.
  if (Array.isArray(material.specifications)) {
    for (const spec of material.specifications) {
      if (spec?.key && spec?.value) {
        rows.push({ label: spec.key, value: spec.value });
      }
    }
  }
  return rows;
}

export default function ProductTabs({ material }) {
  const [activeTab, setActiveTab] = useState("description");

  const isMadeToOrder = material.brandType === 2;
  const keyFeatures = Array.isArray(material.keyFeatures)
    ? material.keyFeatures
    : [];
  const specs = buildSpecs(material);

  const renderContent = () => {
    switch (activeTab) {
      case "description":
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="prose prose-sm max-w-none"
          >
            {material.description && (
              <p className="text-white/60 leading-relaxed mb-4">
                {material.description}
              </p>
            )}
            {keyFeatures.length > 0 && (
              <ul className="space-y-2 text-white/60 list-disc pl-5">
                {keyFeatures.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            )}
          </motion.div>
        );

      case "specifications":
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {specs.length > 0 ? (
              specs.map(({ label, value }) => (
                <div
                  key={label}
                  className="flex justify-between gap-4 py-3 border-b border-white/06"
                >
                  <span className="text-sm font-medium text-white/70">
                    {label}
                  </span>
                  <span className="text-sm text-white/50 text-right">
                    {value}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/40">
                Detailed specifications are confirmed on your quotation.
              </p>
            )}
          </motion.div>
        );

      case "ordering":
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {(isMadeToOrder
              ? [
                  {
                    title: "Made to order",
                    body: "Each piece is handcrafted to your specification. Lead time is 8–12 weeks after approved drawings and material selection. A site measurement and structural wall assessment are carried out before production begins.",
                  },
                  {
                    title: "Natural stone",
                    body: "Final veining and colour vary because every slab is natural; no two pieces are identical. Bespoke widths are quoted individually.",
                  },
                  {
                    title: "Pricing & delivery",
                    body: "Listed prices are recommended starting prices and exclude VAT, delivery and installation unless expressly stated. Your final quotation reflects stone selection, finish and dimensions.",
                  },
                ]
              : [
                  {
                    title: "Shipping",
                    body: "Standard delivery takes 5–7 business days. Due to the weight and fragility of natural stone, a signature is required on delivery.",
                  },
                  {
                    title: "Returns",
                    body: "We accept returns within 30 days of delivery for unopened items in original condition. Return shipping is the customer's responsibility unless the item is defective or damaged on arrival.",
                  },
                  {
                    title: "Damaged items",
                    body: "If your order arrives damaged, take photos and contact us within 48 hours. We'll arrange a replacement or refund at no additional cost.",
                  },
                ]
            ).map(({ title, body }) => (
              <div key={title}>
                <h4 className="text-sm font-semibold text-white mb-2">{title}</h4>
                <p className="text-sm text-white/50 leading-relaxed">{body}</p>
              </div>
            ))}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="rounded-lg border border-white/08" style={{ background: "#0d0b08" }}>
      {/* Tab Headers */}
      <div className="border-b border-white/08">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: "linear-gradient(90deg, #D4AF37, #b8962e)" }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">{renderContent()}</div>
    </div>
  );
}
