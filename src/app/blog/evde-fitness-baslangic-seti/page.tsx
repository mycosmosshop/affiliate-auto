import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Evde Fitness'a Başlamak: 1.000 TL'lik Minimal Ekipman Listesi | Cosmositio Blog",
  description:
    "Evde spora başlamak için gerçekten ihtiyacın olan 7 ekipman. Yoga matı, direnç bandı, dambıl, kettlebell ve atlama ipi — toplam 1000 TL'nin altında.",
};

export default function EvdeFitnessBaslangicSetiPost() {
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
            💪 Spor & Sağlık
          </span>
          <span>16 Mayıs 2026</span>
          <span>·</span>
          <span>7 dk okuma</span>
        </div>
        <h1 className="font-display text-3xl md:text-5xl font-bold leading-tight">
          Evde Fitness&apos;a Başlamak: 1.000 TL&apos;lik Minimal Ekipman
          Listesi
        </h1>
        <p className="mt-4 text-xl text-stone-600 leading-relaxed italic">
          Spor salonu üyeliğine vedaa demek için Peloton&apos;a ihtiyacın
          yok. 7 sade ekipmanla başla — toplamı bir aylık üyelikten ucuz.
        </p>
      </header>

      <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed text-lg space-y-5">
        <p>
          Spor salonuna 6 ay boyunca üye olduğum bir dönem geçirdim ve
          gerçek katılım oranım <strong>%15</strong>&apos;ti. Yolda geçen
          zaman, hava durumu, kalabalık — hepsi bahaneydi. Evdeki minimal
          set bu engelleri tamamen kaldırdı. İşte 1000 TL&apos;nin altında
          gerçekten kullandığım 7 parça:
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          1. Yoga matı 🧘
        </h2>
        <p>
          Fiyat: 150-300 TL. Reebok veya Decathlon (Domyos) en güvenli
          tercih. 6 mm kalınlık eklem koruması için yeterli, daha kalın
          olanlar denge çalışmalarında <strong>tam tersine sakatlayıcı</strong>{" "}
          olabilir.
        </p>
        <p>
          Şınav, plank, yoga, pilates — hepsi bu mat üzerinde. Halısız
          parke veya seramik zeminde direkt spor yapmak dizleri mahveder,
          ucuz mat bile büyük fark yaratır.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          2. Direnç bandı seti
        </h2>
        <p>
          Fiyat: ~80 TL (5&apos;li set). Bence bu liste içindeki en
          değerli parça. Farklı direnç seviyeleri (5-25 kg) sayesinde
          dambıl alternatifi olabilir, üstüne <strong>tendon ve omuz
          rehabilitasyonu</strong> için fizyoterapistlerin bile önerdiği
          ekipman.
        </p>
        <p>
          Seyahatte çantaya atılır, valizde yer kaplamaz. Hotel odasında
          tüm vücut antrenmanı için tek başına yeterli olabiliyor.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          3. Ayarlanabilir dambıl seti (5-10 kg)
        </h2>
        <p>
          Fiyat: ~250-400 TL. Sabit ağırlıklı 8 dambıl satın almaktansa
          ayarlanabilir bir çift al — <strong>2.5 kg&apos;dan 10 kg&apos;a</strong>{" "}
          plaka değiştirerek çıkarsın. Yer tasarrufu inanılmaz.
        </p>
        <p>
          Başlangıç için 10 kg çift yeter. 6-12 ay sonra ihtiyaç olursa
          plakaları artırabilirsin. Hex dambıl tarzı kauçuk kaplı olanlar
          parkeye zarar vermez.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          4. Yoga bloğu + kayış
        </h2>
        <p>
          Fiyat: ~100 TL. Esneme ve mobilite çalışmalarının &quot;gizli
          silahı&quot;. Özellikle <strong>yere temas edemediğin</strong>{" "}
          esneklik seviyesindesin (çoğumuz öyleyiz) — blok zemini sana
          yaklaştırır.
        </p>
        <p>
          Kayış (yoga strap) ise el ayağına yetişemediğin pozlarda
          uzantı görevi görür. İlk 6 ay vazgeçilmez, sonrasında ihtiyaç
          azalır.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          5. Atlama ipi (crossfit tipi)
        </h2>
        <p>
          Fiyat: ~120-180 TL. Plastik çocuk ipi <strong>asla almayın</strong> —
          rulman tipli (ball-bearing) crossfit ipi alın. Ucuz değirmen
          ipler hızlı atlamada kıvrılır, ayak takılır.
        </p>
        <p>
          10 dakikalık atlama ip kardiyosu, 30 dakika yürüyüşe denk
          kalori yakar. Apartman zemini için kauçuk kaplı saplı modeller
          ses sorunu yaratmaz.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          6. Foam roller (kas gevşetme)
        </h2>
        <p>
          Fiyat: ~150-200 TL. Antrenmanın sonunda 5 dakika foam roller
          kullanmak, ertesi gün <strong>kas tutulmasını yarı yarıya</strong>{" "}
          azaltıyor. Bunu denemeden anlamak zor.
        </p>
        <p>
          Düz silindir başlangıç için yeterli. Yumrulu, sert olanlar
          (trigger point) ancak en az 6 ay foam roller kullandıktan sonra
          mantıklı.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          7. Kettlebell (8 kg ile başla)
        </h2>
        <p>
          Fiyat: ~250-350 TL. Tek başına bu ekipman <strong>tam vücut
          antrenmanı</strong> sağlar. Kettlebell swing, goblet squat, Turkish
          get-up — saatlerce dolu içerik internette ücretsiz.
        </p>
        <p>
          Kadınlar için 8 kg, erkekler için 12 kg başlangıç olarak ideal.
          Çok hafif başlarsan form bozulur, çok ağır başlarsan bel
          sakatlanır. Bu iki ağırlık altın orta noktadır.
        </p>

        <hr className="my-10 border-stone-200" />

        <h2 className="font-display text-2xl font-bold text-stone-900">
          Almasanız da olur 🙅
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Pahalı fitness uygulaması aboneliği:</strong> YouTube
            ücretsiz ve binlerce eğitmen var. Caroline Girvan, Heather
            Robertson, MadFit — hepsi bedava.
          </li>
          <li>
            <strong>Parlak tracker bilezikler:</strong> Telefon zaten
            adım sayıyor. Kalp atışı için Mi Band yeterli, Apple Watch
            Ultra fitness için fazlalık.
          </li>
          <li>
            <strong>Peloton bisiklet (40.000 TL+):</strong> 6 ay sonra
            askılığa dönüşme oranı çok yüksek. Önce 6 ay düzenli ev sporu
            yap, sonra düşün.
          </li>
          <li>
            <strong>Vibrasyon plakası, EMS cihazı:</strong> Tek başına
            kas yapmaz. Pazarlama abartısı.
          </li>
        </ul>

        <hr className="my-10 border-stone-200" />

        <div className="bg-pink-50 border border-pink-200 rounded-2xl p-6 not-prose">
          <p className="text-stone-700">
            <strong>Dürüst gerçek:</strong> Ev sporunun en zor kısmı
            ekipman değil, <strong>motivasyon</strong>. 10.000 TL&apos;lik
            ekipman setiyle 6 ay sonra tozlu bir köşede oturmaktansa, 1.000
            TL ile başla ve gerçekten ihtiyacın oldukça büyüt. Spor salonu
            üyeliğinin yıllık ücretiyle bütün bu listenin 3 katını alırsın.
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
