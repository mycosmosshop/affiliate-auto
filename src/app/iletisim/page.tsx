import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "İletişim | Cosmositio",
  description:
    "Cosmositio ile iletişime geçin — soru, öneri, marka işbirliği veya geri bildirim için.",
};

export default function IletisimPage() {
  return (
    <article className="max-w-2xl mx-auto px-6 py-16">
      <header className="mb-10 text-center">
        <p className="text-pink-600 text-xs uppercase tracking-widest mb-3">
          İletişim
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight">
          Bize{" "}
          <span className="italic text-pink-700">ulaşın</span>
        </h1>
        <p className="text-stone-600 mt-4 leading-relaxed">
          Soru, öneri veya marka işbirliği için her zaman buradayız.
        </p>
      </header>

      <div className="bg-white border border-stone-200 rounded-2xl p-8 space-y-6">
        <div className="flex items-start gap-4">
          <div className="text-2xl">📧</div>
          <div>
            <h3 className="font-semibold text-stone-900 mb-1">E-posta</h3>
            <a
              href="mailto:volkanpekatik@gmail.com"
              className="text-pink-700 underline text-lg"
            >
              volkanpekatik@gmail.com
            </a>
            <p className="text-sm text-stone-500 mt-1">
              En hızlı yanıt için tercih edin (24-48 saat içinde dönüş)
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="text-2xl">📞</div>
          <div>
            <h3 className="font-semibold text-stone-900 mb-1">Telefon</h3>
            <a
              href="tel:+905427939382"
              className="text-pink-700 underline text-lg"
            >
              +90 542 793 9382
            </a>
            <p className="text-sm text-stone-500 mt-1">
              WhatsApp veya SMS ile yazılı iletişim önerilir
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="text-2xl">📍</div>
          <div>
            <h3 className="font-semibold text-stone-900 mb-1">Adres</h3>
            <p className="text-stone-700">
              İstasyon Mah. Cengiz Topel Cad.
              <br />
              No:111/2 C Blok
              <br />
              59500 Çerkezköy / Tekirdağ
              <br />
              Türkiye
            </p>
          </div>
        </div>

        <hr className="border-stone-200" />

        <div>
          <h3 className="font-semibold text-stone-900 mb-3">
            Hangi konularda iletişime geçebilirsiniz?
          </h3>
          <ul className="space-y-2 text-stone-700">
            <li className="flex gap-2">
              <span>💄</span>
              <span>Ürün önerisi taleplerinizin paylaşımı</span>
            </li>
            <li className="flex gap-2">
              <span>🤝</span>
              <span>Marka işbirliği ve sponsor içerik talepleri</span>
            </li>
            <li className="flex gap-2">
              <span>✏️</span>
              <span>İçerikteki yanlışlıkları bildirmek</span>
            </li>
            <li className="flex gap-2">
              <span>💌</span>
              <span>Sadece merhaba demek 😊</span>
            </li>
          </ul>
        </div>

        <div className="bg-pink-50 border border-pink-200 rounded-xl p-5 text-sm text-stone-700">
          <p>
            <strong>Marka işbirliği:</strong> Cosmositio, beauty markalarıyla
            sponsorlu içerik üretiyoruz. Spam değil, kaliteli işbirlikleri
            için her zaman açığız. Lütfen bize markanız ve ürününüz
            hakkında özet bir e-posta gönderin.
          </p>
        </div>
      </div>

      <p className="text-center text-xs text-stone-500 mt-8">
        Cosmositio, Amazon.com.tr Partnernet programının bir üyesidir.
        <br />
        © 2026 cosmositio
      </p>
    </article>
  );
}
