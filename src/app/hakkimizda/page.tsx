import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hakkımızda | Cosmositio",
  description:
    "Cosmositio, Türkiye'deki beauty severler için Amazon.com.tr'den özenle seçilmiş ürün önerileri sunan bağımsız bir kürasyon sitesidir.",
};

export default function HakkimizdaPage() {
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
          Cosmositio&apos;yu Amazon.com.tr&apos;de gerçekten işe yarayan,
          viral olan ve uygun fiyatlı ürünleri Türk takipçilere
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
          Her gün Amazon.com.tr&apos;de en çok satılan ürünleri tarar,
          Pinterest ve TikTok trendlerini takip eder, kullanıcı
          yorumlarını analiz ederiz. Önerdiğimiz her ürün; gerçek
          satış verisi, doğrulanmış yorumlar ve viral değerlendirmeler
          üzerine kuruludur.
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
          Cosmositio, Amazon.com.tr Partnernet ortaklık programına başvuru
          aşamasındadır. Onay sonrası, sitedeki linkler üzerinden yapılan
          nitelikli alışverişlerden küçük bir komisyon kazanmaya başlayacağız.
          Bu, sizin için ekstra maliyet oluşturmaz ve bağımsız önerilerimizi
          sürdürmemize destek olur.
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
