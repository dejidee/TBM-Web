"use client";

import Link from "next/link";
import { ShoppingCart, ExternalLink, Loader2 } from "lucide-react";
import { useAddToCart } from "@/hooks/use-cart";
import { showToast } from "@/components/shared/toast";

export const naira = (n) => `₦${Number(n ?? 0).toLocaleString()}`;

/**
 * The renovation-estimate result: total, cost breakdown, the BOQ-style line
 * items, the suggested Bogat products (with Add to Cart — the spec's "Buy
 * Materials" action, built on the estimate's material mapping since the
 * backend's separate DesignSessions/BOM system is never actually reached by
 * the live studio), and next steps.
 *
 * Shared between the "just generated" view (estimate-modal.jsx) and the
 * saved-estimate detail page (app/dashboard/ai-designs/estimates/[id]) so the
 * two don't drift — a POST and a GET /ai/renovation/estimates/{id} return the
 * same shape.
 */
export default function EstimateResult({ result, onDone, doneLabel = "Done" }) {
  const addToCart = useAddToCart();
  const products = result.suggestedProducts ?? [];

  const handleAddOne = (product) => {
    addToCart.mutate(
      { product: { id: product.productId, name: product.name, price: product.price } },
      {
        onSuccess: () => showToast.success(`${product.name} added to cart`),
        onError: (error) =>
          showToast.error(error.message || `Couldn't add ${product.name} to cart`),
      },
    );
  };

  // Suggested products come from the AI estimate, not a live catalog lookup —
  // one of them 400ing (a deleted or inactive product) is expected, not a
  // fluke. useAddToCart's own onError only rolls back the optimistic cache
  // update and stays silent, so `mutateAsync` + allSettled here is what
  // actually reports which of the N adds succeeded, rather than a blanket
  // "N added" toast that lied about the ones that failed.
  const handleAddAll = async () => {
    const results = await Promise.allSettled(
      products.map((product) =>
        addToCart.mutateAsync({
          product: { id: product.productId, name: product.name, price: product.price },
        }),
      ),
    );
    const failed = results.filter((r) => r.status === "rejected").length;
    const succeeded = results.length - failed;
    if (failed === 0) {
      showToast.success(`${succeeded} material${succeeded === 1 ? "" : "s"} added to cart`);
    } else if (succeeded === 0) {
      showToast.error("Couldn't add any materials to cart");
    } else {
      showToast.error(`Added ${succeeded} of ${results.length} materials — ${failed} couldn't be added`);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-[#D4AF37]/20 bg-[#D4AF37]/06 p-4 text-center">
        <p className="text-[12px] text-white/50 uppercase tracking-wide">Total estimate</p>
        <p className="text-[28px] font-semibold text-[#D4AF37] mt-1">{naira(result.totalEstimate)}</p>
        <p className="text-[12px] text-white/40 mt-1">{result.summary}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-white/04 p-3">
          <p className="text-[11px] text-white/40">Materials</p>
          <p className="text-[14px] text-white font-medium mt-0.5">{naira(result.materialsSubtotal)}</p>
        </div>
        <div className="rounded-lg bg-white/04 p-3">
          <p className="text-[11px] text-white/40">Labour</p>
          <p className="text-[14px] text-white font-medium mt-0.5">{naira(result.laborSubtotal)}</p>
        </div>
        <div className="rounded-lg bg-white/04 p-3">
          <p className="text-[11px] text-white/40">Contingency</p>
          <p className="text-[14px] text-white font-medium mt-0.5">{naira(result.contingencyAmount)}</p>
        </div>
      </div>

      {result.lineItems?.length > 0 && (
        <div>
          <p className="text-[13px] font-medium text-white/70 mb-2">Bill of quantities</p>
          <div className="rounded-lg border border-white/08 divide-y divide-white/06">
            {result.lineItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-3 px-3 py-2.5 text-[13px]">
                <div className="min-w-0">
                  <p className="text-white truncate">{item.name}</p>
                  <p className="text-white/35 text-[11px]">
                    {item.quantity} {item.unit} · {item.group}
                  </p>
                </div>
                <p className="text-white/70 shrink-0">{naira(item.totalCost)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {products.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2 gap-3">
            <p className="text-[13px] font-medium text-white/70">Materials</p>
            <button
              onClick={handleAddAll}
              disabled={addToCart.isPending}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#D4AF37] hover:text-[#D4AF37]/80 transition-colors disabled:opacity-50"
            >
              {addToCart.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ShoppingCart className="w-3.5 h-3.5" />
              )}
              Buy all materials
            </button>
          </div>
          <div className="rounded-lg border border-white/08 divide-y divide-white/06">
            {products.map((product, i) => (
              <div key={product.productId ?? i} className="flex items-center gap-3 px-3 py-2.5 text-[13px]">
                <div className="min-w-0 flex-1">
                  <Link
                    href={product.link || "#"}
                    className="flex items-center gap-1 text-white hover:text-[#D4AF37] transition-colors truncate"
                  >
                    <span className="truncate">{product.name}</span>
                    <ExternalLink className="w-3 h-3 shrink-0 text-white/30" />
                  </Link>
                  <p className="text-white/35 text-[11px]">
                    {product.category} · {naira(product.price)}
                  </p>
                </div>
                <button
                  onClick={() => handleAddOne(product)}
                  disabled={addToCart.isPending}
                  aria-label={`Add ${product.name} to cart`}
                  className="shrink-0 h-9 w-9 flex items-center justify-center rounded-md bg-white/06 hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  <ShoppingCart className="w-4 h-4 text-white/60" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {result.nextSteps?.length > 0 && (
        <div>
          <p className="text-[13px] font-medium text-white/70 mb-2">Next steps</p>
          <div className="flex flex-col gap-2">
            {result.nextSteps.map((step, i) => (
              <a
                key={i}
                href={step.url}
                className="min-h-11 flex items-center justify-between px-3.5 rounded-lg bg-white/06 hover:bg-white/10 text-[13px] text-white/80 transition-colors"
              >
                {step.label}
                <span className="text-white/30">&rarr;</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {onDone && (
        <button
          onClick={onDone}
          className="w-full min-h-11 rounded-lg text-[14px] font-semibold text-black transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)" }}
        >
          {doneLabel}
        </button>
      )}
    </div>
  );
}
