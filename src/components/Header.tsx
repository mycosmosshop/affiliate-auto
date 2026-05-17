import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-stone-200/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center btn-magnet"
          aria-label="cosmositio anasayfa"
        >
          <Image
            src="/logo.png"
            alt="cosmositio"
            width={440}
            height={132}
            priority
            className="h-24 w-auto"
          />
        </Link>
        <nav className="flex items-center gap-1 text-sm font-semibold">
          <Link
            href="/"
            className="px-4 py-2 rounded-full hover:bg-pink-50 hover:text-pink-700 transition"
          >
            Ana Sayfa
          </Link>
          <Link
            href="/blog"
            className="px-4 py-2 rounded-full hover:bg-pink-50 hover:text-pink-700 transition"
          >
            Blog
          </Link>
          <Link
            href="/hakkimizda"
            className="px-4 py-2 rounded-full hover:bg-pink-50 hover:text-pink-700 transition"
          >
            Hakkımızda
          </Link>
          <Link
            href="/iletisim"
            className="px-4 py-2 rounded-full hover:bg-pink-50 hover:text-pink-700 transition"
          >
            İletişim
          </Link>
        </nav>
      </div>
    </header>
  );
}
