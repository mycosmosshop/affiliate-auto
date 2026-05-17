import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "40 Yaş Üstü Cilt Bakım Rutini: 5 Holy Grail Ürün | Cosmositio Blog",
  description:
    "40+ ciltler için retinol, niasinamid, peptid içeren gerçekten işe yarayan Amazon ürünleri. Anti-aging rutini, dermatolog onaylı tavsiyeler.",
};

export default function AntiAgingPost() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-16">
      <Link
        href="/blog"
        className="text-sm text-stone-500 hover:text-pink-700 mb-6 inline-block"
      >
        ← Blog
      </Link>

      <header className="mb-10">
        <div className="flex items-center gap-3 text-sm text-stone-500 mb-3">
          <span className="bg-pink-50 text-pink-700 px-3 py-1 rounded-full text-xs font-medium">
            💄 Güzellik
          </span>
          <span>15 Mayıs 2026</span>
          <span>·</span>
          <span>10 dk okuma</span>
        </div>
        <h1 className="font-display text-3xl md:text-5xl font-bold leading-tight">
          40 Yaş Üstü Cilt Bakım Rutini: 5 Holy Grail Ürün
        </h1>
        <p className="mt-4 text-xl text-stone-600 leading-relaxed italic">
          Retinol, niasinamid, peptid... 40+ ciltler için <em>gerçekten</em>
          işe yarayan Amazon ürünleri.
        </p>
      </header>

      <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed text-lg space-y-5">
        <p>
          40 yaş bir eşiktir. Ciltteki kolajen üretimi yavaşlar, hücre
          yenilenmesi azalır, ince çizgiler &quot;dehidratasyon
          kıvrımları&quot; halinde değil <strong>kalıcı</strong> olmaya başlar.
          İyi haber: doğru ürünlerle bu süreci yavaşlatmak, hatta bazı
          belirtileri tersine çevirmek mümkün.
        </p>

        <p>
          Dermatolog konsültasyonu sonrası 2 yıldır uyguladığım rutin ve
          Amazon Türkiye&apos;de bulduğum holy grail ürünler:
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          1. CeraVe Nemlendirici Krem — Bariyer onarım
        </h2>
        <p>
          40+ cildin en büyük şikayeti: <strong>bariyer hasarı</strong>.
          CeraVe&apos;in seramid + hyaluronik asit formülü dermatologların
          dünya genelinde en çok önerdiği nemlendirici. Yağlı değil ama
          gece bile yetiyor. 454gr kutu uzun süre dayanır.
        </p>
        <p>
          Türkiye&apos;de Amazon.com.tr&apos;de bulabilirsin:{" "}
          <a
            href="https://www.amazon.com.tr/s?k=CeraVe+Nemlendirici+Krem"
            target="_blank"
            rel="noopener sponsored"
            className="text-pink-700 underline"
          >
            CeraVe Moisturizing Cream
          </a>
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          2. Olay Regenerist Retinol 24 — Encapsule retinol
        </h2>
        <p>
          Klasik retinol 40+ hassas ciltlere yüksek dozda batırıcı olabilir.
          Olay&apos;ın <em>encapsule</em> formülü yavaş salınımlı — daha az
          tahriş, aynı sonuç. İlk 2 hafta haftada 2 kez, sonra her gece.
          3 ayda ince çizgiler belirgin azalır.
        </p>
        <p>
          <a
            href="https://www.amazon.com.tr/s?k=Olay+Regenerist+Retinol+24"
            target="_blank"
            rel="noopener sponsored"
            className="text-pink-700 underline"
          >
            Olay Regenerist Retinol 24 Night Serum
          </a>
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          3. The Ordinary Niacinamide %10 — Gözenek + ton eşitleme
        </h2>
        <p>
          Niasinamid 40+ ciltlerin altın madeni. <strong>Gözenek sıkılaştırma,
          ton eşitleme, anti-inflammatory</strong>. The Ordinary&apos;nin 30ml
          formülü 250 TL civarı — dünya çapında ucuz ama efsane bir serum.
        </p>
        <p>
          Sabah C vitamini ile beraber, akşam retinol&apos;den önce
          uygulanabilir.
        </p>
        <p>
          <a
            href="https://www.amazon.com.tr/s?k=The+Ordinary+Niacinamide"
            target="_blank"
            rel="noopener sponsored"
            className="text-pink-700 underline"
          >
            The Ordinary Niacinamide %10 + Zinc %1
          </a>
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          4. La Roche-Posay Toleriane — Hassas cilt için günlük krem
        </h2>
        <p>
          Eğer cildin hassasiyse niasinamid + termal su içeren bu krem
          adeta bir kalkan. Aktiflerin yarattığı tahrişi minimize eder.
          Sabah retinol&apos;den sonra bile rahat kullanılır.
        </p>
        <p>
          <a
            href="https://www.amazon.com.tr/s?k=La+Roche-Posay+Toleriane"
            target="_blank"
            rel="noopener sponsored"
            className="text-pink-700 underline"
          >
            La Roche-Posay Toleriane Sensitive
          </a>
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          5. SPF 50+ (her sabah, hiç istisna yok!)
        </h2>
        <p>
          40+ ciltte UV hasarı kolajen yıkımını <strong>4 katına</strong>
          çıkarıyor. Sabah rutinin sonu güneş kremi olmadan tamamlanmaz.
          La Roche-Posay Anthelios, ISDIN, Bioderma Photoderm —
          Türkiye&apos;de hepsi Amazon&apos;da var. Yağlı doku istemiyorsan
          fluid versiyon seç.
        </p>

        <hr className="my-10 border-stone-200" />

        <h2 className="font-display text-2xl font-bold text-stone-900">
          Tam Bir Anti-Aging Rutini
        </h2>
        <p className="font-medium">🌅 SABAH:</p>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Yumuşak temizleyici (CeraVe Hydrating Cleanser)</li>
          <li>C vitamini serumu</li>
          <li>Niasinamid serumu</li>
          <li>Nemlendirici (CeraVe veya La Roche-Posay)</li>
          <li>
            <strong>SPF 50+ (asla atlamayın)</strong>
          </li>
        </ol>

        <p className="font-medium mt-6">🌙 AKŞAM:</p>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Çift yıkama (yağ + sulu temizleyici)</li>
          <li>Niasinamid serumu</li>
          <li>Retinol serumu (haftada 3-5 kez)</li>
          <li>Yoğun nemlendirici</li>
          <li>Göz çevresine ayrı ürün</li>
        </ol>

        <p className="mt-8">
          <strong>Sabır:</strong> Anti-aging rutini 90 günde ilk sonuçlar,
          6 ayda belirgin değişim gösterir. Hızlı sonuç beklemeyin.
          Sürekli kullanım, doğru SPF, ve <em>yeterli uyku + su</em> rutini
          tamamlar.
        </p>

        <p className="text-sm text-stone-500 mt-8">
          <strong>Tıbbi uyarı:</strong> Bu yazı bilgilendirme amaçlıdır,
          dermatolog tavsiyesi yerine geçmez. Cilt sorunlarınız için bir
          uzmana başvurun. Amazon.com.tr Partnernet ortaklık programı
          üyesiyiz.
        </p>
      </div>
    </article>
  );
}
