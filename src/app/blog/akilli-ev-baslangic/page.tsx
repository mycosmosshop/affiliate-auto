import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Akıllı Eve Başlangıç: 2.500 TL ile Evi Smart Yapmanın 5 Adımı | Cosmositio Blog",
  description:
    "Türkiye'de akıllı ev kurmak için 5 temel ürün: TP-Link Tapo smart plug, akıllı ampul, Wi-Fi kamera, robot süpürge ve hareket sensörü. Tuya, Tapo, HomeKit karşılaştırması.",
};

export default function AkilliEvBaslangicPost() {
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
            🏠 Teknoloji
          </span>
          <span>10 Mayıs 2026</span>
          <span>·</span>
          <span>10 dk okuma</span>
        </div>
        <h1 className="font-display text-3xl md:text-5xl font-bold leading-tight">
          Akıllı Eve Başlangıç: 2.500 TL ile Evi Smart Yapmanın 5 Adımı
        </h1>
        <p className="mt-4 text-xl text-stone-600 leading-relaxed italic">
          Pahalı bir Apple Home setine ihtiyacın yok. Türkiye&apos;de
          Türkçe destekli, gerçekten işe yarayan 5 cihazla akıllı evine
          başla.
        </p>
      </header>

      <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed text-lg space-y-5">
        <p>
          Akıllı ev denince akla gelen ilk şey çok genelde
          &quot;Hey Google, ışıkları aç&quot; oluyor. Aslında akıllı evin
          gerçek faydası komutta değil, <strong>otomasyonda</strong> —
          yani sen düşünmeden işlerin kendiliğinden olmasında. 2 yıl
          deneme yanılma ile öğrendiğim ilk 5 adımı paylaşıyorum.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          1. Smart plug (TP-Link Tapo P100) 🔌
        </h2>
        <p>
          Fiyat: ~80-120 TL. Akıllı eve başlamanın <strong>en ucuz ve en
          mantıklı</strong> ilk adımı. Eski cihazları (kombi, klima, su
          ısıtıcı, kahve makinesi) anında akıllı yapar.
        </p>
        <p>
          Senaryolar: kombi her sabah 7:00&apos;de açılsın, sigara dumanı
          için havalandırma 2 saatte bir 10 dakika çalışsın, ütüyü
          kullandıktan sonra otomatik kapansın. Tek başına bu cihaz hayatı
          değiştirebilir. Tapo uygulaması Türkçe ve son derece basit.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          2. Akıllı ampul (Tuya / Yeelight) 💡
        </h2>
        <p>
          Fiyat: ~150-300 TL. Hem renk değiştirebilir (16 milyon renk), hem
          de zamanlayıcıyla otomatik açılır. Renk değiştirmek başta
          oyuncak gibi gelir, sonra ne kadar değerli olduğunu anlarsın:
          <strong> sabah günbatımı tonu, akşam sıcak amber</strong>.
        </p>
        <p>
          Yeelight (Xiaomi grubu) ve Tuya tabanlı markalar Türkiye&apos;de
          fiyat/performans olarak Philips Hue&apos;dan çok daha iyi. Hue
          ampulü 600-800 TL iken Yeelight aynı işi 200 TL&apos;ye yapıyor.
          Renkli değil sadece sıcaklık ayarı olanlar daha da ucuz —
          başlangıç için yeterli.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          3. Wi-Fi kamera (TP-Link Tapo C200) 📷
        </h2>
        <p>
          Fiyat: ~600-800 TL. 360 derece pan/tilt, gece görüşü, hareket
          algılama, 2 yönlü konuşma. Bebek izleme, evcil hayvan kontrolü,
          tatildeyken ev güvenliği — hepsi tek cihazda.
        </p>
        <p>
          microSD kart taktığında kayıt yapar, bulut aboneliği şart
          değil. Mobil uygulamadan canlı izlersin. TP-Link&apos;in
          Türkçe arayüzü ve Türkiye servisi var, bu kategoride <strong>kritik
          bir avantaj</strong> — Çin&apos;den ithal markalarda destek
          alamayabiliyorsun.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          4. Robot süpürge (Xiaomi Mi 3C) 🤖
        </h2>
        <p>
          Fiyat: ~3.500-4.500 TL (indirimde 3.000 TL altı). Bu fiyat
          bandında <strong>en iyi haritalama</strong>, LDS lidar sensörü,
          uygulama kontrolü, yıkama özelliği. Premium markaların (Roborock
          S8, Ecovacs T20) yarı fiyatına %80 performans veriyor.
        </p>
        <p>
          Her gün otomatik temizlik programı: sabah 10:00&apos;da
          evdeyken bütün ev süpürülüp paspaslanıyor. Yıllık 50 saat
          ev işinden tasarruf — bu cihaz parasını ilk 6 ayda öder.
          Halı varsa kıl/tüy için 5.000 TL üstü modelleri (S8 MaxV)
          tercih et.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          5. Akıllı kapı zili veya hareket sensörü 🚨
        </h2>
        <p>
          Fiyat: ~400-800 TL. Aqara hareket sensörleri veya Tuya kapı/
          pencere sensörleri inanılmaz ucuz ve etkili. Otomasyon mantığı:
          <strong> kapı açılınca giriş ışığı yan, koridorda hareket
          olunca gece lambası</strong>.
        </p>
        <p>
          Akıllı kapı zili (Tapo D230 gibi) ise kapıya gelen birini
          telefondan görüp konuşma imkânı sunar. Kargo geldiyse anında
          fark edersin, evden çıkarken kapı açık kaldıysa uyarır.
          Çocuklu evlerde özellikle değerli.
        </p>

        <hr className="my-10 border-stone-200" />

        <h2 className="font-display text-2xl font-bold text-stone-900">
          Tuya vs Tapo vs HomeKit — ekosistem seçimi neden önemli?
        </h2>
        <p>
          Akıllı evdeki <strong>en pahalı hata</strong>: farklı
          markalardan rastgele cihazlar alıp 5 ayrı uygulama yönetmek.
          Telefonun ekranı uygulamalar arasında kaybolur, otomasyon
          kurmak imkânsızlaşır.
        </p>
        <p>
          Üç ana ekosistem var: <strong>Tuya</strong> (Smart Life
          uygulaması, en geniş ürün yelpazesi, Çin merkezli),
          <strong> Tapo</strong> (TP-Link, daha az ürün ama daha kararlı
          ve Türkiye destekli), <strong>Apple HomeKit</strong> (sadece
          iPhone, en pahalı ama en gizlilik dostu). Başlangıç için
          Türkiye&apos;de bence en mantıklısı Tapo — sonra eksiklikleri
          Tuya ile tamamlanır.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          Türkçe app desteği neden kritik?
        </h2>
        <p>
          AliExpress&apos;ten ucuz akıllı cihaz almak cazip ama uygulaması
          sadece Çince/İngilizce, kullanım kılavuzu çevrilmemiş, bağlantı
          sorunlarında destek alamazsın. Türkçe arayüzlü <strong>Tapo,
          Yeelight, Xiaomi, Aqara</strong> markalarına bağlı kal —
          kurulum ve sorun giderme on katı kolay.
        </p>
        <p>
          Bir diğer ipucu: Wi-Fi&apos;ın 2.4 GHz olması şart. Çoğu akıllı
          cihaz 5 GHz Wi-Fi&apos;a bağlanmıyor. Modemini ikili bant
          (dual band) modunda bırak, ayrı SSID&apos;ler oluştur.
        </p>

        <hr className="my-10 border-stone-200" />

        <div className="bg-pink-50 border border-pink-200 rounded-2xl p-6 not-prose">
          <p className="text-stone-700">
            <strong>Akıllı ev ipucu:</strong> Hepsini aynı anda alma. Önce
            1 smart plug ile başla, 2 hafta kullan, otomasyon mantığını
            anla. Sonra ampul, sonra kamera ekle. <strong>Aşamalı büyüme</strong>{" "}
            hem cebine hem de ekosistem seçimine iyi gelir. Türkçe destekli,
            tek uygulama yöneten markaları seç — yıllar içinde teşekkür
            edersin.
          </p>
        </div>

        <p className="text-sm text-stone-500 mt-8">
          <strong>Şeffaflık:</strong> Bu yazıdaki ürün önerileri,
          kullanıcı yorumları ve içerik analizine dayanır; hiçbir
          markayla ücretli iş birliğimiz yoktur.
        </p>
      </div>
    </article>
  );
}
