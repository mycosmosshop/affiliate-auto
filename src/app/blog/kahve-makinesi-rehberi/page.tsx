import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Evde Espresso: French Press'ten Bean-to-Cup'a — 5 Bütçe, 5 Makine | Cosmositio Blog",
  description:
    "200 TL'den 8.000 TL'ye kadar her bütçeye bir kahve makinesi: Moka Pot, French Press, Aeropress, Saeco yarı-otomatik ve DeLonghi Magnifica Evo karşılaştırması.",
};

export default function KahveMakinesiRehberiPost() {
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
            ☕ Mutfak
          </span>
          <span>13 Mayıs 2026</span>
          <span>·</span>
          <span>9 dk okuma</span>
        </div>
        <h1 className="font-display text-3xl md:text-5xl font-bold leading-tight">
          Evde Espresso: French Press&apos;ten Bean-to-Cup&apos;a — 5 Bütçe,
          5 Makine
        </h1>
        <p className="mt-4 text-xl text-stone-600 leading-relaxed italic">
          200 TL&apos;lik Moka Pot ile başlayıp 8.000 TL&apos;lik tam
          otomatik makineye uzanan dürüst bir kahve yolculuğu — hangisi
          senin için fazla?
        </p>
      </header>

      <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed text-lg space-y-5">
        <p>
          Kahve almak için <strong>her sabah 70 TL</strong> harcamak — yılda
          25.000 TL. Bu rakamı yüzüme vurduklarında ciddi anlamda evde
          kahve yapmaya başladım. Son 4 yılda 5 farklı yöntem denedim, her
          bütçe segmentinde gerçek deneyimimi paylaşıyorum.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          1. 200-400 TL: Moka Pot (Bialetti) ☕
        </h2>
        <p>
          İtalyan klasiği. Gaz ocağında çalışan, alt kazandaki suyun
          basıncıyla kahveyi yukarı iten paslanmaz/alüminyum kazan. Bialetti
          orijinali <strong>100 yıllık tasarım</strong>, kullanması basit:
          su koy, kahve koy, ocağa at.
        </p>
        <p>
          Sonuç &quot;gerçek espresso&quot; değil, ama yoğun, kremamsı,
          espressoya en yakın evde yapılan kahve. Bakım sıfır, elektrik
          yok, 50 yıl dayanır. İlk kahve makinesi için en akıllı yatırım.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          2. 500-1.500 TL: French Press + el değirmeni
        </h2>
        <p>
          Bodum French Press (300-400 TL) + bir el değirmeni (Hario Slim
          veya Timemore Chestnut, 600-900 TL). Bu kombinasyon
          <strong> taze öğüt + saf demleme</strong> verir — espresso değil
          ama tam bir filtre kahve deneyimi.
        </p>
        <p>
          French Press&apos;in sırrı: 4 dakika bekleme süresi. Bunu
          kronometreyle tut. Çok kısa olursa zayıf, çok uzun olursa acı.
          Bu aralıkta yaptığında kafe kahvelerinin çoğunu evde geçersin.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          3. 1.500-3.000 TL: Aeropress + termos
        </h2>
        <p>
          Baristaların favorisi neden? Çünkü <strong>5 dakikada bir
          fincan</strong> espresso-benzeri yoğunlukta kahve yapıyor,
          temizliği saniyeler içinde bitiyor, kâğıt filtre tortusuz sonuç
          veriyor.
        </p>
        <p>
          Aeropress (1.200-1.500 TL) + Timemore C2 el değirmeni (1.200 TL)
          kombosu seyahatte bile yanına alabileceğin profesyonel set.
          Filtre kahve, espresso-stili, soğuk demleme — üçünü de yapar.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          4. 3.000-6.000 TL: Yarı-otomatik espresso (Saeco / Gaggia)
        </h2>
        <p>
          Burada işler ciddileşiyor. Gerçek 9 bar basınç, portafilter, süt
          köpürtme borusu — yani <strong>gerçek bir barista
          deneyimi</strong>. Saeco Aroma veya Gaggia Classic Pro klasikleşmiş
          modeller.
        </p>
        <p>
          Ama dikkat: yarı-otomatik makine bir <strong>hobi</strong>.
          Doğru öğüt boyutu, doğru bastırma (tamping), süt köpürtme
          tekniği — öğrenmek 1-2 ay sürer. Hazır kahveye uzanmak isteyenler
          için doğru kategori değil. Eğer kahveye gerçekten bağımlıysan,
          buradan tatmin alacaksın.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          5. 8.000+ TL: DeLonghi Magnifica Evo (bean-to-cup)
        </h2>
        <p>
          Tam otomatik makine. Çekirdek kahveyi içine doldur, butona bas —
          öğütür, demler, süt köpürtür, fincana dökmer. <strong>Sıfır
          öğrenme eğrisi</strong>. Sabah uykulu halde kalitedeki kahveye
          ulaşmanın en garantili yolu.
        </p>
        <p>
          Ama bedeli: 8.000-15.000 TL. Bakımı da gerekli (yağ alma, kireç
          çözme, su tankı temizliği). Kahve düşkünü bir ailede 2-3 yılda
          parasını öder, tek kişi için fazlalık. Süt köpürtmesi Magnifica
          Evo&apos;da otomatik — LatteCrema sistemi gerçekten iyi.
        </p>

        <hr className="my-10 border-stone-200" />

        <h2 className="font-display text-2xl font-bold text-stone-900">
          Kahve çekirdeği nasıl seçilir?
        </h2>
        <p>
          Makineden daha önemli olabilecek tek şey: çekirdek. Süpermarket
          öğütülmüş kahveler ortalama <strong>6 ay önce</strong>{" "}
          paketlenmiştir, taze değildir. Specialty kahveciden (Probador,
          Coffee Department, Cosmo Coffee gibi) çekirdek al.
        </p>
        <p>
          Etikette &quot;kavurma tarihi&quot; arayın — 2-3 hafta öncesi
          ideal. 3 aydan eski çekirdek aroması kaybolur, kâğıt gibi tat
          verir. Türk markaları arasında Kronotrop ve Federal Coffee
          taze kavurma standardını sağlıyor.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          Taze öğütmek neden şart?
        </h2>
        <p>
          Öğütülmüş kahve <strong>15 dakika sonra</strong> aromasının yarısını
          kaybeder. Bu yüzden specialty kafelerde her espresso anında
          öğütülerek hazırlanır. Hazır öğütülmüş paket alıp evde
          espresso makinesi kullanmak — Lamborghini&apos;ye benzin yerine
          motorin koymak gibi.
        </p>
        <p>
          Çözüm: konik bıçaklı (conical burr) bir öğütücü. El değirmeni
          (Timemore, 1Zpresso) 1.000-2.000 TL, elektrikli (Baratza
          Encore) 5.000 TL civarı. Makineye verdiğin paranın
          %30-40&apos;ını öğütücüye ayır — bu altın kural.
        </p>

        <hr className="my-10 border-stone-200" />

        <div className="bg-pink-50 border border-pink-200 rounded-2xl p-6 not-prose">
          <p className="text-stone-700">
            <strong>Kahve ipucu:</strong> 8.000 TL&apos;lik makineyle eski
            kahve kullanmaktansa, 400 TL&apos;lik Moka Pot ile taze
            çekirdek kullanın — sonuç çok daha lezzetli olur. Kahvenin
            sırrı malzemede, ekipman ikinci sırada.
          </p>
        </div>

        <p className="text-sm text-stone-500 mt-8">
          <strong>Şeffaflık:</strong> Bu yazıdaki Amazon.com.tr linkleri
          Partnernet ortaklık programı ile ilişkili. Tıklayıp satın
          alırsanız küçük bir komisyon kazanırız.
        </p>
      </div>
    </article>
  );
}
