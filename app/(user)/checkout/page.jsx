// app/checkout/page.jsx
"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useCheckoutData, useSubmitPayment } from "@/hooks/use-checkout";
import { useCart } from "@/hooks/use-cart";
import { useSession } from "@/hooks/use-session";
import {
  usePersistedState,
  CHECKOUT_KEYS,
  CHECKOUT_ATTEMPT_TTL_MS,
} from "@/hooks/use-persisted-state";
import { checkoutApi } from "@/lib/api/checkout";
import { showToast } from "@/components/shared/toast";
import CheckoutSteps from "@/components/shared/checkout/steps";
import DeliveryInformation from "@/components/shared/checkout/info";
import PaymentMethod from "@/components/shared/checkout/payment-method";
import OrderConfirmation from "@/components/shared/checkout/order-confirmation";
import OrderSummary from "@/components/shared/checkout/order-summary";

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = usePersistedState(CHECKOUT_KEYS.step, 1);
  const [deliveryData, setDeliveryData] = usePersistedState(
    CHECKOUT_KEYS.delivery,
    null,
  );
  const [paymentData, setPaymentData] = usePersistedState(
    CHECKOUT_KEYS.payment,
    null,
  );
  const [promoCode, setPromoCode] = usePersistedState(CHECKOUT_KEYS.promoCode, "");
  const [promoDiscount, setPromoDiscount] = usePersistedState(
    CHECKOUT_KEYS.promoDiscount,
    0,
  );
  // A payment already submitted to the backend for this cart, not yet
  // resolved. Its presence — not `currentStep` — is what decides whether this
  // page may submit a new payment. `localStorage`, not `sessionStorage`: it
  // has to survive the tab closing between "paid on Paystack" and "this app
  // confirmed it". See use-persisted-state.js and
  // app/(user)/checkout/verify/page.jsx, which is the only place that clears it.
  const [attempt, setAttempt] = usePersistedState(CHECKOUT_KEYS.attempt, null, {
    storage: "local",
  });
  const attemptIsStale =
    Boolean(attempt?.createdAt) && Date.now() - attempt.createdAt > CHECKOUT_ATTEMPT_TTL_MS;

  const router = useRouter();
  const { data: cartData } = useCart();
  const { data: checkoutData } = useCheckoutData();
  // Guest status comes from the session, not from a profile fetch: the profile
  // resolves a beat later, and treating that gap as "guest" would submit a
  // signed-in shopper's order as a guest order.
  const { isAuthenticated } = useSession();
  const submitPayment = useSubmitPayment();

  // Use cart data for items/totals (always available), checkout data for saved addresses
  const savedAddresses = checkoutData?.savedAddresses || [];
  const currentAddress =
    savedAddresses.find((a) => a.isDefault) || savedAddresses[0];

  // Build the summary from cart — map cart items to the shape OrderSummary expects

  const checkout = cartData
    ? {
        items: (cartData.items || []).map((item) => ({
          id: item.id,
          name: item.name,
          image: item.image,
          description: item.categoryName || item.brandName || "",
          quantity: item.quantity,
          pricePerUnit: item.price,
          price: item.price * item.quantity,
          unit: null,
        })),
        subtotal: cartData.subtotal || 0,
        shipping: cartData.shipping || 0,
        tax: cartData.tax || 0,
        discount: checkoutData?.discount || 0,
        // Prefer server total from checkoutData if available
        total: checkoutData?.total || cartData.total || 0,
      }
    : null;

  const handlePaymentComplete = useCallback(
    (data) => {
      setPaymentData(data);
      if (data.promoCode) setPromoCode(data.promoCode);
    },
    [setPaymentData, setPromoCode],
  );

  const handlePromoChange = useCallback(
    (code, discount) => {
      setPromoCode(code);
      setPromoDiscount(discount || 0);
    },
    [setPromoCode, setPromoDiscount],
  );

  // A payment for this cart is already in flight (an order exists on the
  // backend for it) — go find out what happened to it instead of rendering a
  // form that would submit a second one. This is the fix for: connection
  // drops while /checkout/verify is checking a payment that actually went
  // through, the user hits "Try Again", and a second order + Paystack session
  // gets created for the same cart. Only the verify page clears `attempt`,
  // and only once it has a paid/failed answer — not on a network error.
  //
  // A *stale* attempt (older than CHECKOUT_ATTEMPT_TTL_MS) is treated as
  // abandoned instead: it stops blocking new checkouts, but nothing about the
  // order itself changes — it's still sitting on the backend as `Pending`,
  // findable and resumable from /dashboard/orders (useResumePayment).
  useEffect(() => {
    if (attemptIsStale) {
      setAttempt(null);
      return;
    }
    if (attempt?.orderId) {
      const params = new URLSearchParams();
      if (attempt.reference) params.set("reference", attempt.reference);
      params.set("orderId", attempt.orderId);
      router.replace(`/checkout/verify?${params.toString()}`);
    }
  }, [attempt, attemptIsStale, router, setAttempt]);

  if (attempt?.orderId && !attemptIsStale) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[14px] text-white/40">
            Checking your last payment attempt…
          </p>
        </div>
      </div>
    );
  }

  // Redirect if cart is empty
  if (cartData && cartData.items?.length === 0) {
    router.push("/cart");
    return null;
  }

  const handleDeliveryComplete = (data) => {
    setDeliveryData(data);
    setCurrentStep(2);
    setPaymentData((prev) => prev || { method: "Paystack", promoCode: "" });
  };

  const handleSubmitPayment = async () => {
    const delivery = deliveryData || currentAddress;
    const payment = paymentData || { method: "Paystack" };

    // Always fetch server-authoritative total right before submitting
    // to avoid "amount mismatch" errors from stale or client-computed totals
    let serverTotal = checkoutData?.total || 0;
    try {
      const fresh = await checkoutApi.getCheckoutData(promoCode || undefined);
      serverTotal = fresh?.total || serverTotal;
    } catch {
      // fall back to cached checkout total or cart total
      serverTotal = serverTotal || cartData?.total || 0;
    }

    const isGuest = !isAuthenticated;

    // A checkout originating from an AI design flow arrives as
    // /checkout?designSessionId=… — forward it when present.
    const designSessionId =
      new URLSearchParams(window.location.search).get("designSessionId") ||
      undefined;

    // Reused from a prior, unresolved attempt on this same cart if one
    // exists — generating a fresh key on every retry is exactly what let a
    // dropped connection during verification turn into a second order. The
    // backend dedupes on this: a second POST with the same key returns the
    // *original* order/Paystack session instead of creating a new one
    // (confirmed live — see BACKLOG.md). A *stale* attempt does not count —
    // it's being treated as abandoned, so this is a genuinely new purchase
    // and needs its own key.
    const reusable = attempt && !attemptIsStale;
    const idempotencyKey = reusable ? attempt.idempotencyKey : crypto.randomUUID();
    // Persist it *before* the request goes out, not after the response comes
    // back — if the response itself is what gets lost to the network, the
    // key still needs to survive so the retry reuses it.
    if (!reusable) setAttempt({ idempotencyKey, createdAt: Date.now() });

    const payload = {
      designSessionId,
      // Guest identity — only sent for guests; authenticated users are
      // identified by their bearer token, so these stay omitted.
      guestEmail: isGuest ? deliveryData?.email || undefined : undefined,
      guestPhone: isGuest
        ? deliveryData?.phone || delivery.phone || undefined
        : undefined,
      guestSessionId: isGuest ? cartData?.guestSessionId || undefined : undefined,
      delivery: {
        fullName: delivery.fullName || null,
        phone: delivery.phone || null,
        address: delivery.address || delivery.line1 || null,
        city: delivery.city || null,
        state: delivery.state || null,
        notes: delivery.notes || null,
        customerNotes: delivery.notes || null,
      },
      payment: {
        method: payment.method || "Paystack",
        reference: null,
        callbackUrl: `${window.location.origin}/checkout/verify`,
      },
      total: serverTotal,
      promoCode: promoCode || undefined,
      idempotencyKey,
    };

    submitPayment.mutate(payload, {
      onSuccess: (data) => {
        // Record the order this key resolved to. The checkout draft
        // (delivery/payment/promo) is deliberately *not* cleared here — a
        // 200 from this endpoint means "a payment session was created", not
        // "the shopper paid". Only /checkout/verify reaching a terminal
        // answer clears state; the `attempt` guard above takes over from
        // here and stops this page from submitting again for this cart.
        setAttempt({
          idempotencyKey,
          orderId: data?.orderId,
          orderNumber: data?.orderNumber,
          reference: data?.paymentReference,
          // Keep the *original* creation time, not this response's — the TTL
          // measures how long the attempt has been open, not how long ago it
          // last got a response.
          createdAt: attempt?.createdAt ?? Date.now(),
        });
        if (data?.authorizationUrl) {
          window.location.href = data.authorizationUrl;
        } else if (data?.orderId) {
          // BankTransfer or instant confirmation
          router.push(
            `/checkout/verify?orderId=${data.orderId}&confirmed=true`,
          );
        }
      },
      onError: (err) => {
        // The request itself failed before the backend could answer (network,
        // validation, timeout). The idempotency key stays persisted — set
        // above, before the request went out — so retrying reuses it rather
        // than risking a second order for a request that may have actually
        // landed.
        showToast.error(err.message || "Payment failed. Please try again.");
      },
    });
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Sticky mobile bottom bar — only on payment step */}
      {currentStep === 2 && (
        <div
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/08 p-4"
          style={{ background: "#0d0b08" }}
        >
          <button
            onClick={handleSubmitPayment}
            disabled={submitPayment.isPending}
            className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 text-black disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)",
            }}
          >
            {submitPayment.isPending
              ? "Redirecting to Paystack…"
              : `Confirm & Pay · ₦${(checkout?.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Back to Cart */}
        {currentStep !== 3 && (
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Cart
          </Link>
        )}

        <CheckoutSteps currentStep={currentStep} />

        {/* Grid — summary first on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 lg:gap-8 mt-6 pb-24 lg:pb-0">
          {/* Order Summary (top on mobile, right on desktop) */}
          <div className="order-first lg:order-last lg:sticky lg:top-6 h-fit">
            <OrderSummary
              checkout={checkout}
              currentStep={currentStep}
              onSubmitPayment={handleSubmitPayment}
              promoDiscount={promoDiscount}
              isSubmitting={submitPayment.isPending}
            />
          </div>

          {/* Forms */}
          <div className="order-last lg:order-first space-y-6">
            {currentStep === 1 && (
              <DeliveryInformation
                savedAddress={deliveryData || currentAddress}
                savedAddresses={savedAddresses}
                onComplete={handleDeliveryComplete}
                isGuest={!isAuthenticated}
              />
            )}

            {currentStep === 2 && (
              <>
                <DeliveryInformation
                  savedAddress={deliveryData || currentAddress}
                  savedAddresses={savedAddresses}
                  readonly={true}
                  onEdit={() => setCurrentStep(1)}
                />
                <PaymentMethod
                  onComplete={handlePaymentComplete}
                  onPromoChange={handlePromoChange}
                />
              </>
            )}

            {currentStep === 3 && <OrderConfirmation orderId={null} />}
          </div>
        </div>
      </div>
    </div>
  );
}
