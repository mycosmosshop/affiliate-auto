import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Air Fryer Almadan Önce Bilmeniz Gereken 7 Şey | 2026 Rehberi | Cosmositio",
  description:
    "Türkiye'de viral olan air fryer'lar gerçekten alınır mı? Cuisinart, Philips, Tefal — hangisini, ne kadara almalısınız? Dürüst air fryer satın alma rehberi.",
};

export default function AirFryerPost() {
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
            🍳 Mutfak
          </span>
          <span>16 Mayıs 2026</span>
          <span>·</span>
          <span>8 dk okuma</span>
        </div>
        <h1 className="font-display text-3xl md:text-5xl font-bold leading-tight">
          Air Fryer Almadan Önce Bilmeniz Gereken 7 Şey
        </h1>
        <p className="mt-4 text-xl text-stone-600 leading-relaxed italic">
          Türkiye&apos;de viral olan air fryer&apos;lar gerçekten alınır mı?
          Mutfak deneyimimle dürüst rehber.
        </p>
      </header>

      <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed text-lg space-y-5">
        <p>
          Air fryer Türkiye&apos;de son 2 yılın en çok satılan mutfak gereci.
          Pinterest, TikTok, Instagram — her yerde &quot;yağsız pişirme&quot;
          videoları. Peki gerçekten her şey reklam edildiği kadar harika mı?
          1.5 yıllık deneyimden sonra bunu yazıyorum.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          1. Boyut çok önemli — küçük alma!
        </h2>
        <p>
          En sık yapılan hata: küçük (2-3 litre) air fryer almak. &quot;Tek
          kişilik yeter&quot; düşüncesi yanlış. Çiftler için bile minimum
          <strong> 5-6 litre</strong> önerilir. Patates, kanat, sebze hepsi
          tek seferde sığsın. Tefal Easy Fry XXL 6.5L veya Cuisinart 8-in-1
          oven Türkiye&apos;de en popüler aile boyutları.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          2. Air fryer = gerçek bir fritöz değil
        </h2>
        <p>
          Air fryer &quot;hava ile kızartıyor&quot; pazarlama ifadesi. Aslında
          mini bir fan-fırın. Yağda kızartmanın o çıtırlığını <em>tam olarak</em>
          alamazsın. Ama %80 yakın gelir ve <strong>%80 daha az yağ</strong>
          ile. Pratik air fryer = sağlık + hız.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          3. Hangi markalar Türkiye&apos;de güvenilir?
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Tefal:</strong> Servis ağı geniş, yedek parça kolay,
            Fransız mühendislik. Easy Fry XXL serisi 3.500 TL civarı.
          </li>
          <li>
            <strong>Philips:</strong> Premium, sessiz, daha pahalı ama
            uzun ömürlü. Airfryer XXL 5.500-7.000 TL.
          </li>
          <li>
            <strong>Karaca / Arzum:</strong> Türk markaları, garanti süreci
            daha sorunsuz, fiyat avantajlı.
          </li>
          <li>
            <strong>Ninja, Cuisinart:</strong> ABD favori. Türkiye&apos;de
            servis daha sınırlı ama performans üst düzey.
          </li>
        </ul>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          4. Air fryer tarifleri internette &quot;abartılı&quot;
        </h2>
        <p>
          Pinterest&apos;te &quot;Air fryer cheesecake&quot; gibi tarifler
          görürsen, %90&apos;ı &quot;yapıldı ama o kadar da değil&quot; pişer.
          Air fryer en iyi: <strong>patates, tavuk kanadı, sebze,
          balık, tost, börek</strong>. Cheesecake için fırın al.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          5. Kolay temizlenebilir model şart
        </h2>
        <p>
          Yapışmaz iç kaplama + bulaşık makinesinde yıkanabilir sepet
          olmazsa olmaz. Aksi takdirde her yağlı pişirmeden sonra elle
          ovmak işkence. <em>Bunu özellikle bütçe modellerinde sor.</em>
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          6. Mutfakta yer kaplar — sürekli kullanacak mısın?
        </h2>
        <p>
          Air fryer boyutu mikrodalga kadar. Tezgahta sürekli durmazsa
          dolaba kaldırma sıkıntısı yaratır. <strong>Haftada 3+ kez
          kullanacağına eminsen al.</strong> Aksi takdirde bir süre sonra
          dolaba gönderirsin.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          7. En çok yaptığım hata: Önceden ısıtmayı atlamak
        </h2>
        <p>
          Tarifte &quot;180°C&apos;de 15 dakika&quot; diyorsa, önce 3 dakika
          boş ısıt, sonra yemeği koy. Çok daha çıtır sonuç. Bu detay air
          fryer deneyiminizi 2x iyileştirir.
        </p>

        <hr className="my-10 border-stone-200" />

        <h2 className="font-display text-2xl font-bold text-stone-900">
          Önerilen Modeller (Amazon.com.tr)
        </h2>
        <div className="bg-pink-50 border border-pink-200 rounded-2xl p-6 not-prose space-y-3 text-sm">
          <div>
            <strong className="text-stone-900">Bütçe dostu (3.000 TL altı):</strong>
            <br />
            <a
              href="https://www.amazon.com.tr/s?k=Tefal+Easy+Fry+XXL"
              className="text-pink-700 underline"
              target="_blank"
              rel="noopener sponsored"
            >
              Tefal Easy Fry XXL 6.5L
            </a>{" "}
            — aile boyu, dijital ekran, 9 program
          </div>
          <div>
            <strong className="text-stone-900">Premium (5.000 TL üstü):</strong>
            <br />
            <a
              href="https://www.amazon.com.tr/s?k=Cuisinart+Air+Fryer"
              className="text-pink-700 underline"
              target="_blank"
              rel="noopener sponsored"
            >
              Cuisinart Air Fryer + Tost Fırını 8-in-1
            </a>{" "}
            — air fryer + tost makinesi + mini fırın
          </div>
          <div>
            <strong className="text-stone-900">Türk marka (yerli garanti):</strong>
            <br />
            <a
              href="https://www.amazon.com.tr/s?k=Karaca+Air+Fryer"
              className="text-pink-700 underline"
              target="_blank"
              rel="noopener sponsored"
            >
              Karaca Air Fryer modelleri
            </a>{" "}
            — Türkiye&apos;de servis garantili
          </div>
        </div>

        <p className="text-sm text-stone-500 mt-8">
          <strong>Şeffaflık notu:</strong> Bu yazıdaki Amazon.com.tr
          linkleri Partnernet ortaklık programı ile ilişkili olabilir.
          Tıklayıp satın alırsanız küçük bir komisyon kazanırız, sizin
          için ek bir maliyet oluşturmaz.
        </p>
      </div>
    </article>
  );
}
