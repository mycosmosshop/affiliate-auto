import { NextRequest, NextResponse } from "next/server";

// Geo-aware language redirect:
// - shop.cosmositio.com'a Alman ziyaretçi gelirse → laden'a 302 redirect
// - laden.cosmositio.com'a Türk ziyaretçi gelirse → shop'a 302 redirect
// - Tek seferlik (cookie ile remember)

const REDIRECT_COOKIE = "cs_lang_pref"; // "tr" | "de" | "auto"

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase();
  const url = req.nextUrl;

  // Sadece kök veya kategori sayfalarında redirect (statik asset'lerde değil)
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/api") ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|css|js|woff2?)$/i)
  ) {
    return NextResponse.next();
  }

  // Kullanıcı manuel olarak dil seçtiyse, redirect etme
  const cookiePref = req.cookies.get(REDIRECT_COOKIE)?.value;
  if (cookiePref === "manual") return NextResponse.next();

  // Country detection — Vercel/Cloudflare otomatik header gönderiyor
  const country =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    "";

  const acceptLang = (req.headers.get("accept-language") || "").toLowerCase();
  const prefersDe =
    country === "DE" ||
    country === "AT" ||
    country === "CH" ||
    acceptLang.startsWith("de");
  const prefersTr = country === "TR" || acceptLang.startsWith("tr");

  // shop.* → Alman ziyaretçi laden'a
  if (host.startsWith("shop.") && prefersDe && !prefersTr) {
    const target = `https://laden.cosmositio.com${url.pathname}${url.search}`;
    const res = NextResponse.redirect(target, 302);
    res.cookies.set(REDIRECT_COOKIE, "auto", { maxAge: 60 * 60 * 24 * 30 });
    return res;
  }

  // laden.* → Türk ziyaretçi shop'a
  if (host.startsWith("laden.") && prefersTr && !prefersDe) {
    const target = `https://shop.cosmositio.com${url.pathname}${url.search}`;
    const res = NextResponse.redirect(target, 302);
    res.cookies.set(REDIRECT_COOKIE, "auto", { maxAge: 60 * 60 * 24 * 30 });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
