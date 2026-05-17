"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import ProductImage from "@/components/ProductImage";

interface Item {
  asin: string;
  title: string;
  price: string;
  imageUrl: string;
  category: string;
  emoji?: string;
}

export default function RelatedCarousel({
  items,
  categoryEmoji,
}: {
  items: Item[];
  categoryEmoji: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateButtons = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    updateButtons();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    return () => {
      el.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
    };
  }, []);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step * 2, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Sol ok */}
      <button
        type="button"
        aria-label="Sola kaydır"
        onClick={() => scrollBy(-1)}
        disabled={!canLeft}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-20 w-12 h-12 items-center justify-center rounded-full bg-white border border-stone-200 shadow-lg hover:shadow-xl hover:bg-stone-900 hover:text-white hover:border-stone-900 transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-stone-900"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Sağ ok */}
      <button
        type="button"
        aria-label="Sağa kaydır"
        onClick={() => scrollBy(1)}
        disabled={!canRight}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-20 w-12 h-12 items-center justify-center rounded-full bg-white border border-stone-200 shadow-lg hover:shadow-xl hover:bg-stone-900 hover:text-white hover:border-stone-900 transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-stone-900"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mb-4 scroll-smooth"
      >
        {items.map((r) => (
          <Link
            key={r.asin}
            href={`/urun/${r.asin}`}
            data-card
            className="group bg-white rounded-2xl border border-stone-200 p-4 hover:shadow-lg hover:border-stone-300 transition flex-shrink-0 w-60 sm:w-64 snap-start"
          >
            <div className="aspect-square bg-stone-100 rounded-xl mb-3 relative overflow-hidden">
              <ProductImage src={r.imageUrl} alt={r.title} emoji={categoryEmoji} />
            </div>
            <p className="text-xs text-pink-700 font-semibold mb-1">
              {categoryEmoji} {r.category}
            </p>
            <h3 className="text-sm font-semibold text-stone-900 line-clamp-2 leading-snug mb-2">
              {r.title}
            </h3>
            <p className="text-stone-900 font-bold">{r.price}</p>
            <p className="text-xs text-pink-700 mt-2 group-hover:underline">
              İncele →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
