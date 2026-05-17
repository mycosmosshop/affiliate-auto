import Link from "next/link";
import { getLocale, t } from "@/lib/i18n";

export default async function Footer() {
  const year = new Date().getFullYear();
  const locale = await getLocale();
  const m = t(locale);
  const blogHref = locale === "de" ? "/blog/de" : "/blog";

  return (
    <footer className="bg-stone-900 text-stone-300 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-display text-xl font-bold text-white mb-3">
            cosmositio
          </h3>
          <p className="text-sm leading-relaxed text-stone-400">
            {m.footer_about}
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3 text-sm">
            {m.footer_site}
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/" className="hover:text-white transition">
                {m.nav_home}
              </Link>
            </li>
            <li>
              <Link href={blogHref} className="hover:text-white transition">
                {m.nav_blog}
              </Link>
            </li>
            <li>
              <Link href="/hakkimizda" className="hover:text-white transition">
                {m.nav_about}
              </Link>
            </li>
            <li>
              <Link
                href="/gizlilik-politikasi"
                className="hover:text-white transition"
              >
                {locale === "de" ? "Datenschutz" : "Gizlilik Politikası"}
              </Link>
            </li>
            <li>
              <Link href="/iletisim" className="hover:text-white transition">
                {m.nav_contact}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3 text-sm">
            {m.footer_contact}
          </h4>
          <ul className="space-y-2 text-sm text-stone-400">
            <li>
              📍 İstasyon Mah. Cengiz Topel Cad.
              <br />
              No:111/2 C Blok 59500 Çerkezköy / Tekirdağ / TR
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
          <p>
            © {year} cosmositio —{" "}
            {locale === "de" ? "Alle Rechte vorbehalten" : "Tüm hakları saklıdır"}
            .
          </p>
          <p className="flex items-center gap-3">
            {locale === "tr" ? (
              <a
                href="https://laden.cosmositio.com"
                className="hover:text-white"
              >
                🇩🇪 Deutsche Version
              </a>
            ) : (
              <a
                href="https://shop.cosmositio.com"
                className="hover:text-white"
              >
                🇹🇷 Türkçe sürüm
              </a>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
