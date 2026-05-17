import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog | Cosmositio — Dein Trend-Produkt-Guide",
  description:
    "Trend-Produkte auf Amazon Deutschland, ehrliche Tests, Kaufratgeber und virale Produktanalysen.",
};

const POSTS = [
  {
    slug: "kabellose-kopfhoerer-2026",
    title:
      "Kabellose Kopfhörer: AirPods, Galaxy Buds, JBL — welche kaufen?",
    excerpt:
      "Von 40 bis 250 EUR — sechs sinnvolle In-Ear-Modelle auf Amazon DE. Brauchst du wirklich aktive Geräuschunterdrückung?",
    category: "Technologie",
    date: "17. Mai 2026",
    readTime: "9 Min Lesezeit",
    emoji: "🎧",
  },
  {
    slug: "heim-fitness-starter",
    title: "Heim-Fitness starten: 80-EUR-Minimal-Ausstattung",
    excerpt:
      "Ohne Fitnessstudio fit werden — Yogamatte, Resistance-Bands, Hanteln. Sieben Produkte, mit denen du heute anfängst.",
    category: "Sport & Gesundheit",
    date: "16. Mai 2026",
    readTime: "7 Min Lesezeit",
    emoji: "💪",
  },
  {
    slug: "air-fryer-guide",
    title: "Heißluftfritteuse kaufen: 7 Dinge, die du vorher wissen solltest",
    excerpt:
      "Lohnt sich der Hype wirklich? Welches Modell, zu welchem Preis? Ehrlicher Ratgeber aus 1,5 Jahren Küchen-Erfahrung.",
    category: "Küche",
    date: "15. Mai 2026",
    readTime: "8 Min Lesezeit",
    emoji: "🍟",
  },
  {
    slug: "anti-aging-routine-40",
    title: "Anti-Aging-Routine ab 40: 5 Holy Grails von Amazon",
    excerpt:
      "Retinol, Niacinamid, Peptide — welche Produkte wirken wirklich bei reifer Haut? Kuratiert aus Amazon DE.",
    category: "Beauty",
    date: "14. Mai 2026",
    readTime: "10 Min Lesezeit",
    emoji: "✨",
  },
  {
    slug: "kaffeemaschine-guide",
    title: "Espresso zuhause: Von French Press bis Bean-to-Cup",
    excerpt:
      "Fünf Preisstufen, fünf Maschinen. Lohnt sich der Bialetti für 25 EUR oder doch die 200-EUR-Saeco?",
    category: "Küche",
    date: "13. Mai 2026",
    readTime: "9 Min Lesezeit",
    emoji: "☕",
  },
  {
    slug: "neue-mutter-lebensretter",
    title: "Frischgebackene Mama: 10 Amazon-Produkte ohne Reue",
    excerpt:
      "Was beim ersten Baby wirklich Leben gerettet hat. Von Windeln bis Babyphon — ehrliche Empfehlungen.",
    category: "Mama & Baby",
    date: "12. Mai 2026",
    readTime: "12 Min Lesezeit",
    emoji: "👶",
  },
  {
    slug: "haarpflege-holy-grail",
    title: "Holy Grail für strapaziertes Haar: Olaplex Alternative?",
    excerpt:
      "Sechs effektive Haarpflegeprodukte auf Amazon DE. K18, Olaplex No.3, Argan-Öl — funktionieren sie wirklich?",
    category: "Beauty",
    date: "11. Mai 2026",
    readTime: "8 Min Lesezeit",
    emoji: "💁",
  },
  {
    slug: "smart-home-einsteiger",
    title: "Smart Home Einstieg: 60 EUR und 5 Schritte zur smarten Wohnung",
    excerpt:
      "Smarte Steckdose, Glühbirne, Kamera, Saugroboter — Geräte mit deutscher App-Unterstützung. Tuya vs Tapo vs HomeKit.",
    category: "Technologie",
    date: "10. Mai 2026",
    readTime: "10 Min Lesezeit",
    emoji: "🏠",
  },
];

export default function BlogIndexDe() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-12 text-center">
        <p className="text-pink-600 text-xs uppercase tracking-widest mb-3">
          📝 Blog
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight">
          Trend-Produkt-<span className="italic text-pink-700">Guide</span>
        </h1>
        <p className="text-stone-600 mt-4 text-lg max-w-2xl mx-auto">
          Trend-Produkte auf Amazon Deutschland, ehrliche Tests und
          Kaufratgeber.
        </p>
      </header>

      <div className="grid gap-6">
        {POSTS.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/de/${post.slug}`}
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
                Weiterlesen →
              </p>
            </div>
          </Link>
        ))}
      </div>

      <p className="text-center text-xs text-stone-500 mt-12">
        Cosmositio prüft Trend-Produkte auf Amazon Deutschland — unabhängige
        Empfehlungen.
      </p>
    </div>
  );
}
