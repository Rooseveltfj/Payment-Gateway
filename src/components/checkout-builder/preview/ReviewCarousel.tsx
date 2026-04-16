"use client";

import { useState } from "react";
import { Review, ReviewDisplay } from "@/types/checkout-config";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  reviews: Review[];
  display: ReviewDisplay;
  primaryColor: string;
}

function StarRow({ stars }: { stars: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} className={`h-3.5 w-3.5 ${n <= stars ? "fill-amber-400 text-amber-400" : "text-zinc-600"}`} />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="rounded-xl p-4 space-y-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={review.photoUrl} alt={review.name}
          className="h-9 w-9 rounded-full object-cover border border-white/10" />
        <div>
          <p className="text-sm font-semibold text-white">{review.name}</p>
          <StarRow stars={review.stars} />
        </div>
      </div>
      <p className="text-xs text-zinc-400 leading-relaxed">{review.text}</p>
    </div>
  );
}

export function ReviewCarousel({ reviews, display, primaryColor }: Props) {
  const [idx, setIdx] = useState(0);
  const avg = (reviews.reduce((s, r) => s + r.stars, 0) / reviews.length).toFixed(1);

  return (
    <div className="space-y-3">
      {/* Average */}
      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold text-white">{avg}</span>
        <div>
          <StarRow stars={Math.round(Number(avg))} />
          <p className="text-xs text-zinc-400 mt-0.5">{reviews.length} avaliações</p>
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
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <ChevronLeft className="h-3.5 w-3.5 text-zinc-400" />
              </button>
              <div className="flex gap-1">
                {reviews.map((_, i) => (
                  <button key={i} onClick={() => setIdx(i)}
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: i === idx ? 20 : 6,
                      background: i === idx ? primaryColor : "rgba(255,255,255,0.2)"
                    }} />
                ))}
              </div>
              <button
                onClick={() => setIdx(i => (i + 1) % reviews.length)}
                className="h-7 w-7 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
