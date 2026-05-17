import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  if (locale === "de") {
    return {
      title: "Über uns | Cosmositio",
      description:
        "Cosmositio ist ein unabhängiger Produkt-Kurations-Blog mit handverlesenen Trend-Empfehlungen aus Amazon Deutschland.",
    };
  }
  return {
    title: "Hakkımızda | Cosmositio",
    description:
      "Cosmositio, Amazon Deutschland'da öne çıkan trend ürünleri özenle seçen bağımsız bir kürasyon sitesidir.",
  };
}

export default async function HakkimizdaPage() {
  const locale = await getLocale();

  if (locale === "de") {
    return (
      <article className="max-w-3xl mx-auto px-6 py-16">
        <header className="mb-10 text-center">
          <p className="text-pink-600 text-xs uppercase tracking-widest mb-3">
            ✨ Über uns
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight">
            Willkommen bei
            <br />
            <span className="italic text-pink-700">Cosmositio</span>
          </h1>
        </header>

        <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed text-lg space-y-6">
          <p>
            Hallo! Ich bin Volkan — ein unabhängiger Content-Creator mit
            einer Leidenschaft für Online-Shopping und Trend-Produkte. Ich
            habe Cosmositio gestartet, um die wirklich nützlichen, viralen
            und preiswerten Produkte auf Amazon Deutschland zugänglich zu
            machen.
          </p>

          <h2 className="font-display text-2xl font-bold text-stone-900 mt-10">
            Warum Cosmositio?
          </h2>
          <p>
            Online-Shopping ist überfordernd. Tausende Produkte, übertriebene
            Werbung, und echte Bewertungen schwer zu finden. Bei Cosmositio
            konzentrieren wir uns auf drei Dinge:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Ehrliche Tests</strong> — wenn ein Produkt nicht
              funktioniert, empfehlen wir es nicht, egal wie populär es ist.
            </li>
            <li>
              <strong>Multi-Kategorie-Auswahl</strong> — Technik, Küche,
              Beauty, Sport, Mama & Baby. Alles, was dein Leben erleichtert.
            </li>
            <li>
              <strong>Trend-fokussiert</strong> — wir finden virale Produkte
              aus Pinterest und TikTok auf Amazon und stellen sie vor.
            </li>
          </ul>

          <h2 className="font-display text-2xl font-bold text-stone-900 mt-10">
            Wie wir arbeiten
          </h2>
          <p>
            Wir scannen täglich die Amazon-Deutschland-Bestseller, verfolgen
            Pinterest- und TikTok-Trends, und analysieren echte
            Kundenbewertungen. Jede Empfehlung basiert auf echten Verkaufsdaten,
            verifizierten Reviews und viraler Resonanz.
          </p>

          <h2 className="font-display text-2xl font-bold text-stone-900 mt-10">
            Kategorien
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>🔌 <strong>Technologie</strong> — Smart Home, Kopfhörer, Ladegeräte</li>
            <li>🍳 <strong>Küche</strong> — Heißluftfritteuse, Mixer, Küchengeräte</li>
            <li>💄 <strong>Beauty</strong> — Hautpflege, Make-up</li>
            <li>💪 <strong>Sport & Gesundheit</strong> — Heim-Workout, Fitness</li>
            <li>👶 <strong>Mama & Baby</strong> — Babypflege, Lebensretter</li>
          </ul>

          <h2 className="font-display text-2xl font-bold text-stone-900 mt-10">
            Transparenz
          </h2>
          <p>
            Die Produktlinks auf unserer Seite führen zu den entsprechenden
            Produktseiten auf Amazon Deutschland. Die Nutzung dieser Links
            verursacht für dich keine zusätzlichen Kosten.
          </p>
          <p>
            <strong>Unser Versprechen:</strong> Kommissionen beeinflussen{" "}
            <em>niemals</em> unsere Empfehlungen. Ein schlechtes Produkt
            empfehlen wir nicht — egal wie hoch die Provision ist.
          </p>

          <h2 className="font-display text-2xl font-bold text-stone-900 mt-10">
            Kontakt
          </h2>
          <p>
            Fragen, Vorschläge oder Kooperationen — wir freuen uns:
            <br />
            📧{" "}
            <a
              href="mailto:volkanpekatik@gmail.com"
              className="text-pink-700 underline"
            >
              volkanpekatik@gmail.com
            </a>
          </p>
        </div>
      </article>
    );
  }

  // TR version
  return (
    <article className="max-w-3xl mx-auto px-6 py-16">
      <header className="mb-10 text-center">
        <p className="text-pink-600 text-xs uppercase tracking-widest mb-3">
          ✨ Hakkımızda
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight">
          Cosmositio&apos;ya
          <br />
          <span className="italic text-pink-700">hoş geldiniz</span>
        </h1>
      </header>

      <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed text-lg space-y-6">
        <p>
          Merhaba! Ben Volkan — Türkiye&apos;de yaşayan, online alışveriş
          ve trend ürünlere ilgi duyan bağımsız bir içerik üreticisiyim.
          Cosmositio&apos;yu Amazon Deutschland&apos;da gerçekten işe
          yarayan, viral olan ve uygun fiyatlı ürünleri Türk takipçilere
          ulaştırmak için kurdum.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-10">
          Neden Cosmositio?
        </h2>
        <p>
          Online alışveriş dünyası karmaşık. Binlerce ürün, abartılı
          reklam, gerçek incelemeleri bulmak zor. Cosmositio&apos;da
          sadece üç şeye odaklanırız:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Dürüst inceleme</strong> — bir ürün işe yaramıyorsa
            önermiyoruz, popülerliği ne olursa olsun.
          </li>
          <li>
            <strong>Çok kategorili seçki</strong> — teknoloji, mutfak,
            güzellik, spor, anne&bebek. Hayatınızı kolaylaştıran her şey.
          </li>
          <li>
            <strong>Trend odaklı</strong> — Pinterest&apos;te ve
            TikTok&apos;ta viral olan ürünleri Amazon&apos;da bulup
            sunarız.
          </li>
        </ul>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-10">
          Nasıl Çalışıyoruz?
        </h2>
        <p>
          Her gün Amazon Deutschland&apos;da en çok satılan ürünleri tarar,
          Pinterest ve TikTok trendlerini takip eder, kullanıcı yorumlarını
          analiz ederiz. Önerdiğimiz her ürün; gerçek satış verisi,
          doğrulanmış yorumlar ve viral değerlendirmeler üzerine kuruludur.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-10">
          Kategoriler
        </h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>🔌 <strong>Teknoloji</strong> — akıllı ev, kulaklık, şarj</li>
          <li>🍳 <strong>Mutfak</strong> — air fryer, blender, pişirici</li>
          <li>💄 <strong>Güzellik</strong> — cilt bakım, makyaj</li>
          <li>💪 <strong>Spor & Sağlık</strong> — ev egzersizi, fitness</li>
          <li>👶 <strong>Anne & Bebek</strong> — bebek bakım, hayat kurtaranlar</li>
        </ul>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-10">
          Şeffaflık
        </h2>
        <p>
          Sitemizdeki ürün bağlantıları, Amazon Deutschland&apos;daki
          ilgili ürün sayfalarına yönlendirme amaçlıdır. Bu bağlantıları
          kullanmanız sizin için herhangi bir ek maliyet veya fiyat farkı
          oluşturmaz.
        </p>
        <p>
          <strong>Şuna söz veriyoruz:</strong> Komisyon, bir ürünü önerip
          önermeyeceğimizi <em>asla</em> belirlemez. Bir ürün kötüyse
          komisyon ne kadar yüksek olursa olsun önermeyiz.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-10">
          İletişim
        </h2>
        <p>
          Soru, öneri veya işbirliği için her zaman buradayız:
          <br />
          📧{" "}
          <a
            href="mailto:volkanpekatik@gmail.com"
            className="text-pink-700 underline"
          >
            volkanpekatik@gmail.com
          </a>
        </p>
      </div>
    </article>
  );
}
