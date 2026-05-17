"use client";

import { useEffect, useState } from "react";

export default function ViewTracker({
  asin,
  initial,
  locale = "tr",
}: {
  asin: string;
  initial: number;
  locale?: "tr" | "de";
}) {
  const label = locale === "de" ? "Aufrufe" : "görüntülenme";
  const [count, setCount] = useState(initial);

  useEffect(() => {
    // Bot/crawler'lar için biraz gecikme + sessionStorage ile aynı sekmede tekrar artmasın
    const key = `viewed_${asin}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    const t = setTimeout(() => {
      fetch(`/api/views/${asin}`, { method: "POST" })
        .then((r) => r.json())
        .then((d) => {
          if (typeof d.views === "number") setCount(d.views);
        })
        .catch(() => {});
    }, 1500);

    return () => clearTimeout(t);
  }, [asin]);

  const formatted =
    count >= 1000 ? (count / 1000).toFixed(1).replace(/\.0$/, "") + "k" : count.toString();

  return (
    <span className="bg-stone-100 text-stone-700 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 text-sm">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      {formatted} {label}
    </span>
  );
}
