import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog | Cosmositio — Türkiye'nin Trend Ürün Rehberi",
  description:
    "Amazon Türkiye'deki trend ürünler, dürüst review'lar, satın alma rehberleri ve viral ürün analizleri.",
};

const POSTS = [
  {
    slug: "air-fryer-rehberi",
    title: "Air Fryer Almadan Önce Bilmeniz Gereken 7 Şey (2026 Rehberi)",
    excerpt:
      "Türkiye'de viral olan air fryer'lar gerçekten alınır mı? Hangi modeli, ne kadara almalısınız? Mutfak deneyimimle dürüst rehber.",
    category: "Mutfak",
    date: "16 Mayıs 2026",
    readTime: "8 dk okuma",
    emoji: "🍟",
  },
  {
    slug: "anti-aging-rutin-40",
    title: "40 Yaş Üstü Cilt Bakım Rutini: Amazon'dan Bulabileceğin 5 Holy Grail",
    excerpt:
      "Retinol, niasinamid, peptid... 40+ ciltler için gerçekten işe yarayan ürünler hangileri? Amazon TR'de mevcut olanlardan kürasyon.",
    category: "Güzellik",
    date: "15 Mayıs 2026",
    readTime: "10 dk okuma",
    emoji: "✨",
  },
  {
    slug: "yeni-anne-hayat-kurtaran-urunler",
    title: "Yeni Anne Olduğunuzda Pişman Olmayacağınız 10 Amazon Ürünü",
    excerpt:
      "İlk bebeğimde aldığım ve hayatımı kurtaran ürünler. Bebek bezi seçiminden gece lambasına kadar dürüst öneriler.",
    category: "Anne & Bebek",
    date: "12 Mayıs 2026",
    readTime: "12 dk okuma",
    emoji: "👶",
  },
];

export default function BlogIndex() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-12 text-center">
        <p className="text-pink-600 text-xs uppercase tracking-widest mb-3">
          📝 Blog
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight">
          Trend ürün <span className="italic text-pink-700">rehberi</span>
        </h1>
        <p className="text-stone-600 mt-4 text-lg max-w-2xl mx-auto">
          Amazon Türkiye&apos;deki viral ürünler, dürüst review&apos;lar ve
          satın alma rehberleri.
        </p>
      </header>

      <div className="grid gap-6">
        {POSTS.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group bg-white rounded-2xl border border-stone-200 p-6 md:p-8 hover:shadow-lg transition flex gap-6"
          >
            <div className="text-5xl md:text-6xl flex-shrink-0">
              {post.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 text-xs text-stone-500 mb-2">
                <span className="bg-pink-50 text-pink-700 px-2 py-1 rounded-full font-medium">
                  {post.category}
                </span>
                <span>{post.date}</span>
                <span>·</span>
                <span>{post.readTime}</span>
              </div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-stone-900 mb-2 leading-tight group-hover:text-pink-700 transition">
                {post.title}
              </h2>
              <p className="text-stone-600 leading-relaxed">{post.excerpt}</p>
              <p className="mt-3 text-sm font-medium text-pink-700 group-hover:underline">
                Devamını oku →
              </p>
            </div>
          </Link>
        ))}
      </div>

      <p className="text-center text-xs text-stone-500 mt-12">
        Cosmositio, Amazon.com.tr Partnernet programının bir üyesidir.
      </p>
    </div>
  );
}
