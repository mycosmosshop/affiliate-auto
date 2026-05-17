// Affiliate URL helper — amazon.de odaklı, mycosmos0b-21 tag ile
//
// Mevcut data/products-tr.json'da affiliateUrl alanı amazon.com.tr için.
// amazon.de'ye geçince:
//   - Eğer ürün başlığında belirgin marka varsa → arama URL'i ile aktarım
//   - Tag her zaman eklenir (env'den ya da varsayılan)
//
// Önemli: amazon.de'de aynı ASIN olmayabilir. Bu yüzden ürün adıyla
// arama URL'i daha pratik.

const AMAZON_DE_TAG = process.env.AMAZON_DE_TAG || "mycosmos0b-21";
const AMAZON_TR_TAG = process.env.AMAZON_TR_TAG || "";

function appendTag(url: string, tag: string): string {
  if (!tag) return url;
  const sep = url.includes("?") ? "&" : "?";
  // Aynı tag varsa tekrar ekleme
  if (url.includes(`tag=${tag}`)) return url;
  return `${url}${sep}tag=${tag}`;
}

// TR site: amazon.com.tr URL'leri + tag (eğer varsa)
export function buildTrUrl(rawUrl: string): string {
  return appendTag(rawUrl, AMAZON_TR_TAG);
}

// DE site: amazon.de arama URL'ine çevir + tag
export function buildDeUrl(rawUrl: string, productTitle: string): string {
  // Eğer raw URL zaten amazon.de ise ve tag yoksa ekle
  if (/amazon\.de\//.test(rawUrl)) {
    return appendTag(rawUrl, AMAZON_DE_TAG);
  }
  // Aksi takdirde: amazon.de arama URL'i ürün başlığıyla
  const q = encodeURIComponent(productTitle.substring(0, 120));
  return `https://www.amazon.de/s?k=${q}&tag=${AMAZON_DE_TAG}`;
}

// Locale'e göre seçim
export function buildAffiliateUrl(
  locale: "tr" | "de",
  rawUrl: string,
  productTitle: string
): string {
  if (locale === "de") return buildDeUrl(rawUrl, productTitle);
  return buildTrUrl(rawUrl);
}

// Görsel kısa URL — kart altında gösterilir
export function shortenAmazonUrl(url: string): string {
  try {
    const m = url.match(/amazon\.com\.tr\/dp\/([A-Z0-9]{10})/);
    if (m) return `amazon.com.tr/dp/${m[1]}`;
    const md = url.match(/amazon\.de\/dp\/([A-Z0-9]{10})/);
    if (md) return `amazon.de/dp/${md[1]}`;
    const ms = url.match(/amazon\.de\/s\?k=([^&]+)/);
    if (ms) {
      const q = decodeURIComponent(ms[1]).substring(0, 35);
      return `amazon.de/search/${q}…`;
    }
    return url.replace(/^https?:\/\//, "").substring(0, 50);
  } catch {
    return url;
  }
}
