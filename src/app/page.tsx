import Link from "next/link";
import fs from "fs";
import path from "path";
import ProductImage from "@/components/ProductImage";
import { getLocale, t, localizeCategory } from "@/lib/i18n";
import { buildAffiliateUrl, shortenAmazonUrl } from "@/lib/affiliate";

interface TrProduct {
  asin: string;
  title: string;
  price: string;
  description: string;
  imageUrl: string;
  affiliateUrl: string;
  category: string;
  emoji?: string;
  rating?: string;
}

function loadProducts(locale: "tr" | "de"): TrProduct[] {
  try {
    const file =
      locale === "de" ? "products-de.json" : "products-tr.json";
    const p = path.join(process.cwd(), "data", file);
    if (!fs.existsSync(p)) return [];
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return [];
  }
}

const CATEGORY_INFO: Record<
  string,
  {
    emoji: string;
    subtitle_tr: string;
    subtitle_de: string;
    tone: string;
    accent: string;
  }
> = {
  Teknoloji: {
    emoji: "🔌",
    subtitle_tr: "Akıllı ev, kulaklık, şarj — viral teknoloji",
    subtitle_de: "Smart Home, Kopfhörer, Ladegeräte — virale Tech",
    tone: "from-slate-50 to-blue-50/30",
    accent: "text-blue-700",
  },
  Mutfak: {
    emoji: "🍳",
    subtitle_tr: "Air fryer, blender, akıllı pişirici",
    subtitle_de: "Heißluftfritteuse, Mixer, smarte Küchengeräte",
    tone: "from-amber-50/40 to-orange-50/30",
    accent: "text-amber-700",
  },
  Güzellik: {
    emoji: "💄",
    subtitle_tr: "Cilt bakımı, makyaj — viral beauty",
    subtitle_de: "Hautpflege, Make-up — virale Beauty",
    tone: "from-rose-50/40 to-pink-50/30",
    accent: "text-rose-700",
  },
  "Spor & Sağlık": {
    emoji: "💪",
    subtitle_tr: "Ev egzersizi, fitness — vücut bakımı",
    subtitle_de: "Heim-Workout, Fitness — Körperpflege",
    tone: "from-emerald-50/40 to-teal-50/30",
    accent: "text-emerald-700",
  },
  "Anne & Bebek": {
    emoji: "👶",
    subtitle_tr: "Bebek bakım, anne hayatını kolaylaştıranlar",
    subtitle_de: "Babypflege, Lebensretter für Mamas",
    tone: "from-violet-50/40 to-purple-50/30",
    accent: "text-violet-700",
  },
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, "ve")
    .replace(/[ğ]/g, "g").replace(/[ş]/g, "s").replace(/[ı]/g, "i")
    .replace(/[ö]/g, "o").replace(/[ü]/g, "u").replace(/[ç]/g, "c")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

export default async function Home() {
  const locale = await getLocale();
  const m = t(locale);
  const products = loadProducts(locale);
  const grouped = products.reduce<Record<string, TrProduct[]>>((acc, p) => {
    (acc[p.category] = acc[p.category] || []).push(p);
    return acc;
  }, {});
  const categories = Object.keys(grouped);

  return (
    <div>
      {/* ====== HERO — sade, sofistike, animated subtle ====== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-50 via-white to-stone-50/50 border-b border-stone-200/60">
        {/* Subtle animated gradient mesh */}
        <div className="absolute inset-0 pointer-events-none opacity-60">
          <div className="absolute -top-40 -left-20 w-[500px] h-[500px] bg-rose-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-20 -right-20 w-[500px] h-[500px] bg-amber-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-violet-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-16 md:py-20 text-center">
          {/* Live tag */}
          <div className="inline-flex items-center gap-2 bg-white border border-stone-200 px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-widest text-stone-700 mb-6 shadow-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>{m.hero_badge}</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-[1.05] tracking-tight text-stone-900 max-w-3xl mx-auto">
            {m.hero_title_part1}{" "}
            <span className="font-display-italic bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">
              {m.hero_title_highlight}
            </span>{" "}
            {m.hero_title_part2}
          </h1>

          <p className="mt-6 text-base md:text-lg text-stone-600 max-w-xl mx-auto leading-relaxed">
            {m.hero_sub(products.length)}
          </p>

          {/* CTA row */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={`#${slugify(categories[0] || "")}`}
              className="bg-stone-900 hover:bg-pink-700 text-white font-semibold px-6 py-3 rounded-full transition shadow-md text-sm"
            >
              {m.cta_browse}
            </a>
            <a
              href={locale === "de" ? "/blog/de" : "/blog"}
              className="bg-white border border-stone-300 hover:border-stone-900 text-stone-900 font-semibold px-6 py-3 rounded-full transition text-sm"
            >
              {m.cta_guides}
            </a>
          </div>

          {/* Categories nav */}
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {categories.map((c) => {
              const info = CATEGORY_INFO[c];
              return (
                <a
                  key={c}
                  href={`#${slugify(c)}`}
                  className="group bg-white border border-stone-200 rounded-full px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition"
                >
                  <span className="mr-1">{info?.emoji ?? "📦"}</span>
                  {localizeCategory(c, locale)}
                </a>
              );
            })}
          </div>

          {/* Stats — refined */}
          <div className="mt-14 grid grid-cols-3 gap-8 max-w-2xl mx-auto border-t border-stone-200/60 pt-8">
            <div>
              <div className="font-display text-4xl font-bold text-stone-900">
                {products.length}+
              </div>
              <div className="text-xs uppercase tracking-wider font-medium text-stone-500 mt-2">
                {m.stats_products}
              </div>
            </div>
            <div className="border-x border-stone-200/60">
              <div className="font-display text-4xl font-bold text-stone-900">
                {categories.length}
              </div>
              <div className="text-xs uppercase tracking-wider font-medium text-stone-500 mt-2">
                {m.stats_categories}
              </div>
            </div>
            <div>
              <div className="font-display text-4xl font-bold text-stone-900">
                7/24
              </div>
              <div className="text-xs uppercase tracking-wider font-medium text-stone-500 mt-2">
                {m.stats_realtime}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== KATEGORİ BÖLÜMLERİ ====== */}
      {categories.map((cat) => {
        const items = grouped[cat];
        const info = CATEGORY_INFO[cat] || {
          emoji: "📦",
          subtitle_tr: "Trend ürünler",
          subtitle_de: "Trend-Produkte",
          tone: "from-stone-50 to-stone-100",
          accent: "text-stone-700",
        };
        const subtitle = locale === "de" ? info.subtitle_de : info.subtitle_tr;
        return (
          <section
            key={cat}
            id={slugify(cat)}
            className={`relative bg-gradient-to-b ${info.tone} py-20`}
          >
            <div className="max-w-7xl mx-auto px-6">
              <header className="mb-12 flex items-end justify-between flex-wrap gap-4 border-b border-stone-200 pb-6">
                <div>
                  <p className={`text-xs uppercase tracking-widest font-semibold ${info.accent} mb-2`}>
                    {info.emoji} {localizeCategory(cat, locale)}
                  </p>
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-stone-900 leading-tight max-w-2xl">
                    {subtitle}
                  </h2>
                </div>
                <p className="text-sm text-stone-500 font-medium">
                  {m.cat_products_count(items.length)}
                </p>
              </header>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {items.map((p) => {
                  const affUrl = buildAffiliateUrl(locale, p.affiliateUrl, p.title);
                  const shortUrl = shortenAmazonUrl(affUrl);
                  return (
                    <article
                      key={p.asin}
                      className="group bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-xl hover:border-stone-300 hover:-translate-y-1 transition duration-300 flex flex-col"
                    >
                      {/* Image area — clickable, goes to review */}
                      <Link
                        href={`/urun/${p.asin}`}
                        className="block aspect-square bg-stone-50 relative overflow-hidden border-b border-stone-100"
                      >
                        <ProductImage
                          src={p.imageUrl}
                          alt={p.title}
                          emoji={info.emoji}
                        />

                        {/* Rating badge */}
                        {p.rating && (
                          <span className="absolute top-3 right-3 bg-white/95 backdrop-blur px-2 py-1 rounded-full text-xs font-semibold text-stone-800 shadow-sm z-10">
                            ⭐ {p.rating}
                          </span>
                        )}

                      </Link>

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col">
                        <Link href={`/urun/${p.asin}`} className="block flex-1">
                          <h3 className="font-medium text-sm text-stone-900 line-clamp-2 leading-snug mb-2 min-h-[2.5em] group-hover:text-pink-700 transition">
                            {p.title}
                          </h3>
                        </Link>

                        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-4 min-h-[2em]">
                          {p.description}
                        </p>

                        {/* Price + İncele */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-display text-xl font-bold text-stone-900">
                            {p.price}
                          </span>
                          <Link
                            href={`/urun/${p.asin}`}
                            className="text-xs font-semibold text-pink-700 hover:underline"
                          >
                            {m.card_review}
                          </Link>
                        </div>

                        {/* Amazon link — açık ve görünür */}
                        <a
                          href={affUrl}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="block border-t border-stone-100 pt-3 text-xs"
                        >
                          <span className="text-stone-500">{m.card_amazon_link}</span>
                          <br />
                          <span className="font-mono text-amber-700 hover:text-amber-900 break-all transition">
                            {shortUrl} →
                          </span>
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}

      {/* ====== Disclaimer ====== */}
      <section className="bg-stone-900 text-stone-300 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-pink-300 text-xs uppercase tracking-widest font-semibold mb-4">
            {locale === "de" ? "Transparenz" : "Şeffaflık"}
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-5 leading-tight">
            {locale === "de"
              ? "Ehrliche Empfehlungen, echte Auswahl"
              : "Dürüst öneriler, gerçek seçkiler"}
          </h2>
          <p className="leading-relaxed text-stone-400">
            {locale === "de" ? (
              <>
                Cosmositio prüft Produkte auf Amazon Deutschland, die von
                echten Nutzerbewertungen hervorgehoben werden, und empfiehlt sie
                <strong className="text-white"> ehrlich</strong>. Wir listen
                <em> niemals</em> Produkte gegen Zahlung oder Rabatte.
              </>
            ) : (
              <>
                Cosmositio, Amazon Deutschland&apos;da viral olan, gerçek
                kullanıcı yorumlarıyla öne çıkan ürünleri özenle inceler ve
                <strong className="text-white"> dürüstçe</strong> önerir.
                Beğenmediğimiz bir ürünü, anlaşma ya da indirim karşılığında
                <em> asla</em> listelemiyoruz.
              </>
            )}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
            <Link
              href="/hakkimizda"
              className="bg-white text-stone-900 font-semibold px-5 py-2.5 rounded-full hover:bg-stone-100 transition"
            >
              {m.nav_about}
            </Link>
            <Link
              href={locale === "de" ? "/blog/de" : "/blog"}
              className="border border-stone-700 text-white font-semibold px-5 py-2.5 rounded-full hover:bg-stone-800 transition"
            >
              {m.nav_blog}
            </Link>
            <Link
              href="/iletisim"
              className="border border-stone-700 text-white font-semibold px-5 py-2.5 rounded-full hover:bg-stone-800 transition"
            >
              {m.nav_contact}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
