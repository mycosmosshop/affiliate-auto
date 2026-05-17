"use client";

// Dil değiştirme linki — manual seçim cookie'sini set eder ki
// middleware geri yönlendirmesin

export default function LangSwitch({
  toLocale,
  href,
}: {
  toLocale: "tr" | "de";
  href: string;
}) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Set manual cookie on both domains via path
    document.cookie =
      "cs_lang_pref=manual; path=/; max-age=2592000; domain=.cosmositio.com";
    window.location.href = href;
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className="hidden md:inline px-3 py-2 text-xs font-bold uppercase text-stone-500 hover:text-rose-700 tracking-wider"
    >
      {toLocale === "de" ? "🇩🇪 DE" : "🇹🇷 TR"}
    </a>
  );
}
