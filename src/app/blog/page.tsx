import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog | Cosmositio — Türkiye'nin Trend Ürün Rehberi",
  description:
    "Amazon Türkiye'deki trend ürünler, dürüst review'lar, satın alma rehberleri ve viral ürün analizleri.",
};

const POSTS = [
  {
    slug: "kablosuz-kulaklik-rehberi-2026",
    title: "Kablosuz Kulaklık Almadan Önce: AirPods, Galaxy Buds, JBL — Hangisi?",
    excerpt:
      "1.500 TL'den 6.000 TL'ye kadar — bütçenize göre Amazon TR'de bulabileceğiniz en mantıklı 6 kablosuz kulaklık. Aktif gürültü engelleme önemli mi?",
    category: "Teknoloji",
    date: "17 Mayıs 2026",
    readTime: "9 dk okuma",
    emoji: "🎧",
  },
  {
    slug: "evde-fitness-baslangic-seti",
    title: "Evde Fitness'a Başlamak: 1.000 TL'lik Minimal Ekipman Listesi",
    excerpt:
      "Spor salonu üyeliği almadan evde kas yapmak mümkün mü? Yoga matı, direnç bandı, dambıl seti — sıfırdan başlamak için 7 ürün.",
    category: "Spor & Sağlık",
    date: "16 Mayıs 2026",
    readTime: "7 dk okuma",
    emoji: "💪",
  },
  {
    slug: "air-fryer-rehberi",
    title: "Air Fryer Almadan Önce Bilmeniz Gereken 7 Şey (2026 Rehberi)",
    excerpt:
      "Türkiye'de viral olan air fryer'lar gerçekten alınır mı? Hangi modeli, ne kadara almalısınız? Mutfak deneyimimle dürüst rehber.",
    category: "Mutfak",
    date: "15 Mayıs 2026",
    readTime: "8 dk okuma",
    emoji: "🍟",
  },
  {
    slug: "anti-aging-rutin-40",
    title: "40 Yaş Üstü Cilt Bakım Rutini: Amazon'dan Bulabileceğin 5 Holy Grail",
    excerpt:
      "Retinol, niasinamid, peptid... 40+ ciltler için gerçekten işe yarayan ürünler hangileri? Amazon TR'de mevcut olanlardan kürasyon.",
    category: "Güzellik",
    date: "14 Mayıs 2026",
    readTime: "10 dk okuma",
    emoji: "✨",
  },
  {
    slug: "kahve-makinesi-rehberi",
    title: "Evde Espresso: French Press'ten Bean-to-Cup'a — 5 Bütçe, 5 Makine",
    excerpt:
      "Sabah kahvesi tutkunları için Amazon TR'deki en mantıklı kahve makineleri. 200 TL'lik mokapot mı, 8.000 TL'lik DeLonghi mi?",
    category: "Mutfak",
    date: "13 Mayıs 2026",
    readTime: "9 dk okuma",
    emoji: "☕",
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
  {
    slug: "sac-bakim-holy-grail",
    title: "Hasarlı Saç İçin Holy Grail: Olaplex Türkiye'de Var mı, Alternatif Ne?",
    excerpt:
      "Boyalı, sertleşmiş, mat saçlar için Amazon TR'deki en etkili 6 saç bakım ürünü. K18, Olaplex No.3, argan yağı — gerçekten işe yarıyor mu?",
    category: "Güzellik",
    date: "11 Mayıs 2026",
    readTime: "8 dk okuma",
    emoji: "💁",
  },
  {
    slug: "akilli-ev-baslangic",
    title: "Akıllı Eve Başlangıç: 2.500 TL ile Evi Smart Yapmanın 5 Adımı",
    excerpt:
      "Smart plug, akıllı ampul, kamera, robot süpürge — Türkiye'de Wi-Fi ile çalışan, Türkçe uygulamalı ürünler. Tuya/Tapo karşılaştırması.",
    category: "Teknoloji",
    date: "10 Mayıs 2026",
    readTime: "10 dk okuma",
    emoji: "🏠",
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
        Cosmositio, Amazon.com.tr Partnernet ortaklık programına başvuru
        aşamasındadır.
      </p>
    </div>
  );
}
