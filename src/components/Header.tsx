import Link from "next/link";
import Image from "next/image";
import { getLocale, t } from "@/lib/i18n";
import LangSwitch from "@/components/LangSwitch";

export default async function Header() {
  const locale = await getLocale();
  const m = t(locale);
  const blogHref = locale === "de" ? "/blog/de" : "/blog";

  return (
    <header className="bg-white/85 backdrop-blur-xl sticky top-0 z-50 shadow-[0_1px_0_0_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(236,72,153,0.15)]">
      {/* Üst trend strip — canlı gradient */}
      <div className="h-1 w-full bg-gradient-to-r from-rose-500 via-pink-500 via-amber-500 to-rose-500 bg-[length:200%_100%] animate-shimmer" />

      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between gap-6">
        <Link
          href="/"
          className="flex items-center btn-magnet"
          aria-label="cosmositio"
        >
          <Image
            src="/logo.png"
            alt="cosmositio"
            width={640}
            height={192}
            priority
            className="h-32 md:h-40 w-auto mix-blend-multiply"
          />
        </Link>

        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-0.5 text-sm font-semibold">
            <Link
              href="/"
              className="px-3.5 py-2 rounded-full text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition"
            >
              {m.nav_home}
            </Link>
            <Link
              href={blogHref}
              className="px-3.5 py-2 rounded-full text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition"
            >
              {m.nav_blog}
            </Link>
            <Link
              href="/hakkimizda"
              className="px-3.5 py-2 rounded-full text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition"
            >
              {m.nav_about}
            </Link>
            <Link
              href="/iletisim"
              className="ml-1 px-4 py-2 rounded-full text-pink-700 hover:bg-pink-50 transition"
            >
              {m.nav_contact}
            </Link>

            {/* Dil değiştirme (cross-domain link) */}
            <span className="ml-3 hidden md:inline text-stone-300">|</span>
            {locale === "tr" ? (
              <LangSwitch toLocale="de" href="https://laden.cosmositio.com" />
            ) : (
              <LangSwitch toLocale="tr" href="https://shop.cosmositio.com" />
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
