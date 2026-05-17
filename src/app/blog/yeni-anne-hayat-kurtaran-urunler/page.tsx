import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Yeni Anne Hayat Kurtaran 10 Amazon Ürünü | Cosmositio Blog",
  description:
    "İlk bebek bekleyen veya yeni anne olanlar için Amazon Türkiye'de pişman olmayacağınız 10 ürün. Bebek bezi, gece lambası, ergonomik kanguru ve daha fazlası.",
};

export default function YeniAnnePost() {
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
            👶 Anne & Bebek
          </span>
          <span>12 Mayıs 2026</span>
          <span>·</span>
          <span>12 dk okuma</span>
        </div>
        <h1 className="font-display text-3xl md:text-5xl font-bold leading-tight">
          Yeni Anne Olduğunuzda Pişman Olmayacağınız 10 Amazon Ürünü
        </h1>
        <p className="mt-4 text-xl text-stone-600 leading-relaxed italic">
          İlk bebeğimde aldığım ve hayatımı kurtaran ürünler — dürüst
          tavsiyeler, abartısız.
        </p>
      </header>

      <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed text-lg space-y-5">
        <p>
          Anne olmak ezici bir his. İlk bebek için aldığım ürünlerin yarısı
          bir köşede tozlandı, diğer yarısı <strong>hayat kurtardı</strong>.
          İkinci bebek için sadece ikinci yarıyı tekrar aldım. İşte
          deneyimden öğrendiğim 10 olmazsa olmaz:
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          1. Kaliteli bebek bezi (Pampers Premium Care)
        </h2>
        <p>
          Bütçeden tasarruf etme alanı <strong>asla burası değil</strong>.
          Ucuz bezler gece sızdırıyor, alerji yapıyor. Pampers Premium
          Care veya Prima beden 1 yenidoğan için en güvenli seçim.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          2. Beyaz gürültü makinesi (Hatch Rest)
        </h2>
        <p>
          Bebek uyku düzeni kurmanın <strong>%80&apos;i</strong> beyaz
          gürültüde. Hatch Rest gibi uygulama kontrollü modeller pahalı
          ama bir bebek için en az 2 yıl kullanılır. Anne uyku saatleri
          için fiyatı buna değer.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          3. Ergonomik bebek kangurusu (BabyBjorn Mini)
        </h2>
        <p>
          Bebeği taşımaktan kollarınız ağrımayacaksa: <strong>doğru
          kanguru şart</strong>. BabyBjorn Mini İsveç tasarımı, yenidoğan
          ergonomiyle uyumlu, sırt ağrısı yapmaz. Markette, sokakta,
          ev işlerinde bebek üzerinizde kalabilir.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          4. Doğal akış biberon (Philips Avent Natural)
        </h2>
        <p>
          Anne sütü + biberon kombinasyonu olanların kabusu: bebeğin
          biberonu reddetmesi. Philips Avent Natural emzik şekli en
          doğal — bebeğim ilk denemede aldı.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          5. Biberon temizleme seti (Munchkin)
        </h2>
        <p>
          Günde 6-8 biberon temizleyeceksiniz. Sıradan bulaşık fırçası
          yetmiyor. Munchkin&apos;in döner başlıklı fırça + havalandırma
          standı seti hayat kurtarır.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          6. Taşınabilir bebek yatağı (Graco Pack&apos;n Play)
        </h2>
        <p>
          Anneanne, hala, seyahat — bebek nereye gittiyse temiz uyku
          alanı şart. Graco katlanabilir, 5 kg taşıma çantasıyla.
          0-3 yaş arası kullanılır.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          7. Bebek vücut losyonu (Burt&apos;s Bees)
        </h2>
        <p>
          %99 doğal, parfümsüz, gözyaşı izi bırakmaz. Yenidoğan cildi
          hassas — kimyasal kremler yerine bunu tercih edin.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          8. Güvenli oto koltuğu (Cybex Solution G)
        </h2>
        <p>
          Avrupa güvenlik standartları, yan darbe koruma, ayarlanabilir
          baş desteği. Bebeği arabaya almadan önce mutlaka yatırım. ISOFIX
          sistemi takılması kolay, 3-12 yaş arası 9 yıl kullanılır.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          9. Bebek monitörü (kamera + ses)
        </h2>
        <p>
          Bebek uyurken siz başka odadasınız — kalp rahatlığı için
          gerek. TP-Link Tapo C200 gibi Wi-Fi kameralar 800-1200 TL,
          telefondan canlı görüş + 2 yönlü konuşma.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          10. Anne kahve makinesi 😊
        </h2>
        <p>
          Bu listede en önemlisi belki. Uykusuz geceler için sabah
          espresso. DeLonghi Magnifica Evo veya basit bir French Press.
          Anne hayatta kalır = bebek mutlu olur.
        </p>

        <hr className="my-10 border-stone-200" />

        <h2 className="font-display text-2xl font-bold text-stone-900">
          Almamanız gereken 5 şey
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Pahalı &quot;designer&quot; bebek kıyafetleri:</strong>{" "}
            6 ay sonra küçücük oluyor. H&M baby yeter.
          </li>
          <li>
            <strong>Bebek ayakkabıları (yürümeyene kadar):</strong>{" "}
            Sadece dekoratif, hiçbir işe yaramaz.
          </li>
          <li>
            <strong>4-fonksiyonlu pahalı oyuncaklar:</strong> Bebek
            kutudan keyif alır, oyuncağa değil.
          </li>
          <li>
            <strong>Premium yüksek beşik (sallanan, ışıklı):</strong>{" "}
            Basit beşik + beyaz gürültü makinesi yeterli.
          </li>
          <li>
            <strong>Wipe warmer (mendil ısıtıcı):</strong> Yaz kış
            normal ısıdaki mendil zaten yeterli, fazlalık.
          </li>
        </ul>

        <hr className="my-10 border-stone-200" />

        <div className="bg-pink-50 border border-pink-200 rounded-2xl p-6 not-prose">
          <p className="text-stone-700">
            <strong>Yeni anne ipucu:</strong> Bebek doğmadan tüm bu
            ürünleri stoklamayın. Doğumda bebek 3-4 kg, ilk 2 ay sadece
            bez + bebek bezi + nemlendirici lazım. Diğerleri 2. aydan
            sonra alabilir veya hediye olarak gelir.
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
