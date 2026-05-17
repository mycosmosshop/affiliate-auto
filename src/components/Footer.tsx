import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-stone-900 text-stone-300 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-display text-xl font-bold text-white mb-3">
            cosmositio
          </h3>
          <p className="text-sm leading-relaxed text-stone-400">
            Amazon.com.tr&apos;den özenle seçilmiş beauty, cilt bakım ve makyaj
            ürünleri. Dürüst öneriler, gerçek incelemeler.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3 text-sm">Site</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/" className="hover:text-white transition">
                Ana Sayfa
              </Link>
            </li>
            <li>
              <Link
                href="/hakkimizda"
                className="hover:text-white transition"
              >
                Hakkımızda
              </Link>
            </li>
            <li>
              <Link
                href="/gizlilik-politikasi"
                className="hover:text-white transition"
              >
                Gizlilik Politikası
              </Link>
            </li>
            <li>
              <Link href="/iletisim" className="hover:text-white transition">
                İletişim
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3 text-sm">İletişim</h4>
          <ul className="space-y-2 text-sm text-stone-400">
            <li>
              📍 İstasyon Mah. Cengiz Topel Cad.
              <br />
              No:111/2 C Blok 59500 Çerkezköy/Tekirdağ
            </li>
            <li>
              ✉{" "}
              <a
                href="mailto:volkanpekatik@gmail.com"
                className="hover:text-white"
              >
                volkanpekatik@gmail.com
              </a>
            </li>
            <li>
              📞{" "}
              <a href="tel:+905427939382" className="hover:text-white">
                +90 542 793 9382
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-stone-800">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>© {year} cosmositio — Tüm hakları saklıdır.</p>
          <p>
            Amazon.com.tr Partnernet programı üyesi olarak nitelikli alışverişlerden
            komisyon kazanıyoruz.
          </p>
        </div>
      </div>
    </footer>
  );
}
