"use client";

import { useState } from "react";
import { Review, ReviewDisplay } from "@/types/checkout-config";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  reviews: Review[];
  display: ReviewDisplay;
}

// Estrela cheia usa o accent do tema; vazia usa borda. Tudo via var(--checkout-*).
function StarRow({ stars }: { stars: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} className="h-3.5 w-3.5"
          style={n <= stars ? { fill: "var(--checkout-accent)", color: "var(--checkout-accent)" } : { color: "var(--checkout-border)" }} />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="rounded-xl p-4 space-y-2" style={{ background: "var(--checkout-surface-elevated)", border: "1px solid var(--checkout-border)" }}>
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={review.photoUrl} alt={review.name}
          className="h-9 w-9 rounded-full object-cover" style={{ border: "1px solid var(--checkout-border)" }} />
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--checkout-text-primary)" }}>{review.name}</p>
          <StarRow stars={review.stars} />
        </div>
      </div>
      <p className="text-xs leading-relaxed" style={{ color: "var(--checkout-text-secondary)" }}>{review.text}</p>
    </div>
  );
}

export function ReviewCarousel({ reviews, display }: Props) {
  const [idx, setIdx] = useState(0);
  const avg = (reviews.reduce((s, r) => s + r.stars, 0) / reviews.length).toFixed(1);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold" style={{ color: "var(--checkout-text-primary)" }}>{avg}</span>
        <div>
          <StarRow stars={Math.round(Number(avg))} />
          <p className="text-xs mt-0.5" style={{ color: "var(--checkout-text-secondary)" }}>{reviews.length} avaliações</p>
        </div>
      </div>

      {display === "list" ? (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
        </div>
      ) : (
        <div className="relative">
          <ReviewCard review={reviews[idx]} />
          {reviews.length > 1 && (
            <div className="flex items-center justify-between mt-2">
              <button
                onClick={() => setIdx(i => (i - 1 + reviews.length) % reviews.length)}
                className="h-7 w-7 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "var(--checkout-surface-elevated)", border: "1px solid var(--checkout-border)" }}
              >
                <ChevronLeft className="h-3.5 w-3.5" style={{ color: "var(--checkout-text-secondary)" }} />
              </button>
              <div className="flex gap-1">
                {reviews.map((_, i) => (
                  <button key={i} onClick={() => setIdx(i)}
                    className="h-1.5 rounded-full transition-all"
                    style={{ width: i === idx ? 20 : 6, background: i === idx ? "var(--checkout-accent)" : "var(--checkout-border)" }} />
                ))}
              </div>
              <button
                onClick={() => setIdx(i => (i + 1) % reviews.length)}
                className="h-7 w-7 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "var(--checkout-surface-elevated)", border: "1px solid var(--checkout-border)" }}
              >
                <ChevronRight className="h-3.5 w-3.5" style={{ color: "var(--checkout-text-secondary)" }} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
