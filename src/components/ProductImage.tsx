"use client";

import { useState } from "react";

interface Props {
  src?: string;
  alt: string;
  emoji?: string;
  className?: string;
}

/**
 * Image fallback ladder:
 * 1. Verilen src (örn. images-na P/{ASIN}.01.LZZZZZZZ.jpg)
 * 2. Alternatif format: P/{ASIN}.01._SCRMZZZZZZ_.jpg
 * 3. Alternatif format: P/{ASIN}.01.MZZZZZZZ.jpg
 * 4. Hepsi fail → büyük emoji
 *
 * Server component değil — onError için 'use client' lazım.
 */
function getAlternatives(src?: string): string[] {
  if (!src) return [];
  const out = [src];
  // ASIN'i URL'den çıkar
  const asinMatch = src.match(/\/P\/([A-Z0-9]{10})\./);
  if (asinMatch) {
    const asin = asinMatch[1];
    out.push(`https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SCRMZZZZZZ_.jpg`);
    out.push(`https://m.media-amazon.com/images/P/${asin}.01.L.jpg`);
  }
  return out;
}

export default function ProductImage({ src, alt, emoji, className = "" }: Props) {
  const alternatives = getAlternatives(src);
  const [attemptIdx, setAttemptIdx] = useState(0);
  const [errored, setErrored] = useState(false);
  const currentSrc = alternatives[attemptIdx];

  const handleError = () => {
    if (attemptIdx < alternatives.length - 1) {
      setAttemptIdx(attemptIdx + 1);
    } else {
      setErrored(true);
    }
  };

  const showImage = currentSrc && !errored;

  return (
    <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentSrc}
          alt={alt}
          className="max-w-[85%] max-h-[85%] object-contain"
          onError={handleError}
        />
      ) : (
        <span className="text-7xl select-none" aria-hidden>
          {emoji ?? "🛒"}
        </span>
      )}
    </div>
  );
}
