"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useIsAuthenticated } from "@/hooks/use-auth";
import { useProductReviews, useCreateReview } from "@/hooks/use-reviews";
import { showToast } from "@/components/shared/toast";
import RatingsReviews from "@/components/shared/materials/details/reviews";

function formatDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * Individual review items — `items[]`'s element shape has never been
 * observed (every product checked has zero reviews; lib/api/schemas/reviews.ts).
 * Rendered defensively off the one part of the contract that IS confirmed —
 * the create DTO's own fields (`rating`, `title`, `comment`) — plus common
 * candidate names for reviewer/date, falling back gracefully if absent.
 * Correct this the day a real review can be read back.
 */
function ReviewItem({ review }) {
  const rating = review?.rating ?? 0;
  const reviewer =
    review?.reviewerName ?? review?.userName ?? review?.customerName ?? "Verified buyer";
  const date = formatDate(review?.createdAt ?? review?.createdAtUtc);

  return (
    <div className="border-b border-white/06 py-5 last:border-0">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${
                i < rating ? "fill-[#D4AF37] text-[#D4AF37]" : "fill-white/10 text-white/10"
              }`}
            />
          ))}
        </div>
        {date && <span className="text-xs text-white/30">{date}</span>}
      </div>
      {review?.title && (
        <p className="mb-1 text-sm font-semibold text-white">{review.title}</p>
      )}
      {review?.comment && (
        <p className="text-sm text-white/50 leading-relaxed">{review.comment}</p>
      )}
      <p className="mt-2 text-xs text-white/30">{reviewer}</p>
    </div>
  );
}

function WriteReviewForm({ productId, onDone }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const createReview = useCreateReview(productId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating) {
      showToast.error("Choose a star rating before submitting.");
      return;
    }
    createReview.mutate(
      { rating, title: title || undefined, comment: comment || undefined },
      {
        onSuccess: () => {
          showToast.success("Review submitted");
          setRating(0);
          setTitle("");
          setComment("");
          onDone?.();
        },
        // Backend enforces "verified purchaser" itself — its message is
        // already user-safe (lib/errors.js), rendered as-is.
        onError: (err) => showToast.error(err.message),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border-t border-white/08 pt-6">
      <h3 className="text-sm font-semibold text-white">Write a review</h3>

      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHoverRating(n)}
            onMouseLeave={() => setHoverRating(0)}
            className="min-w-11 min-h-11 flex items-center justify-center"
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            <Star
              className={`h-6 w-6 ${
                n <= (hoverRating || rating)
                  ? "fill-[#D4AF37] text-[#D4AF37]"
                  : "fill-white/10 text-white/20"
              }`}
            />
          </button>
        ))}
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (optional)"
        maxLength={120}
        className="w-full rounded-lg border border-white/08 bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[#D4AF37]/40 focus:outline-none"
      />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience with this piece (optional)"
        rows={3}
        maxLength={1000}
        className="w-full resize-none rounded-lg border border-white/08 bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[#D4AF37]/40 focus:outline-none"
      />

      <button
        type="submit"
        disabled={createReview.isPending}
        className="h-11 rounded-lg bg-[#D4AF37] px-6 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {createReview.isPending ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}

export default function ProductReviews({ productId }) {
  const { isAuthenticated } = useIsAuthenticated();
  const { data } = useProductReviews(productId);
  const [showForm, setShowForm] = useState(false);

  const items = data?.items ?? [];
  const totalReviews = data?.totalCount ?? 0;
  const averageRating = data?.averageRating ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <RatingsReviews averageRating={averageRating} totalReviews={totalReviews} />

      {items.length > 0 && (
        <div className="rounded-lg border border-white/08 p-6" style={{ background: "#0d0b08" }}>
          {items.map((review, i) => (
            <ReviewItem key={review?.id ?? i} review={review} />
          ))}
        </div>
      )}

      <div className="rounded-lg border border-white/08 p-6" style={{ background: "#0d0b08" }}>
        {isAuthenticated ? (
          showForm ? (
            <WriteReviewForm productId={productId} onDone={() => setShowForm(false)} />
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="text-sm font-semibold text-[#D4AF37] hover:underline"
            >
              Write a review
            </button>
          )
        ) : (
          <p className="text-sm text-white/40">
            <a href="/sign-in" className="text-[#D4AF37] hover:underline">
              Sign in
            </a>{" "}
            to write a review. Only customers with a paid order for this product can leave one.
          </p>
        )}
      </div>
    </motion.div>
  );
}
