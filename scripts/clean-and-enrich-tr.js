// Mevcut products-tr.json'u temizler + her ürünün GERÇEK image URL'ini Amazon TR'den çeker
//
// 1. Title blacklist filter — çakı, bıçak, tıraş, vs.
// 2. Amazon TR product page scrape — gerçek IMG_ID extract
// 3. Image URL'i HEAD test — valid değilse fallback
// 4. Updated products-tr.json
//
// Kullanım: node scripts/clean-and-enrich-tr.js

const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

const PRODUCTS_FILE = path.join(process.cwd(), "data", "products-tr.json");

// Genişletilmiş blacklist — Turkish-aware
const BLACKLIST = [
  // Bıçak çeşitleri
  "bıçak", "bicak", "bıçağ", "bicag", "knife",
  "çakı", "caki", "opinel", "swiss army",
  "kılıç", "kilic", "satır", "satir", "balta", "makas", "kesici",
  // Tıraş aletleri (keskin)
  "tıraş bıçağı", "tiras bicagi", "razor", "shaver kafas",
  "gillette", "wilkinson", "venus breeze",
  // Silah
  "silah", "tabanca", "tüfek", "tufek", "pompalı", "av tüfeği",
  // Bebek bezleri (sponsor algoritma)
  "bebek bezi", "diaper", "pampers", "prima diaper", "molfix",
  // Yetişkin
  "alkol", "şarap", "sigara", "tütün", "tutun", "vape",
  // Regülasyon
  "ilaç", "ilac", "reçeteli", "receteli",
  // Canlı
  "hamster", "papağan", "papagan",
];

function isBlacklisted(title) {
  const t = (title || "").toLowerCase();
  return BLACKLIST.some((kw) => t.includes(kw));
}

// Önce direkt fetch (TR'de IP zaten Türkiye), sonra proxy fallback
const PROXIES = [
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
];

async function fetchHtml(url) {
  // 1. Direkt fetch (kullanıcı Türkiye'den çalıştırıyor → IP TR)
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(15000),
    });
    if (res.ok) {
      const text = await res.text();
      if (text.length > 3000 && !/captcha/i.test(text)) return text;
    }
  } catch {}

  // 2. Proxy fallback
  for (const buildProxy of PROXIES) {
    try {
      const res = await fetch(buildProxy(url), {
        headers: { "User-Agent": "Mozilla/5.0 Chrome/124" },
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) continue;
      const text = await res.text();
      if (text.length < 3000) continue;
      if (/captcha/i.test(text)) continue;
      return text;
    } catch {}
  }
  return "";
}

// Amazon TR product page'inden hero image IMG_ID'sini çek — geniş pattern listesi
async function getProductImageId(asin) {
  const html = await fetchHtml(`https://www.amazon.com.tr/dp/${asin}`);
  if (!html) return null;

  // En öncelikli: og:image meta (SSR'de garanti gelir)
  const ogMatch = html.match(
    /<meta\s+property="og:image"\s+content="https:\/\/m\.media-amazon\.com\/images\/I\/([A-Za-z0-9%+\-]{10,})\./i
  );
  if (ogMatch) return ogMatch[1];

  // Sonra: data-old-hires, hiRes, landingImage, dynamic-image (sırayla)
  const patterns = [
    /data-old-hires="https:\/\/m\.media-amazon\.com\/images\/I\/([A-Za-z0-9%+\-]{10,})\./i,
    /"hiRes":"https:\/\/m\.media-amazon\.com\/images\/I\/([A-Za-z0-9%+\-]{10,})\./,
    /"large":"https:\/\/m\.media-amazon\.com\/images\/I\/([A-Za-z0-9%+\-]{10,})\./,
    /id="landingImage"[^>]+src="https:\/\/m\.media-amazon\.com\/images\/I\/([A-Za-z0-9%+\-]{10,})\./i,
    /data-a-dynamic-image="\{[^"]*&quot;https:\/\/m\.media-amazon\.com\/images\/I\/([A-Za-z0-9%+\-]{10,})\./,
    /m\.media-amazon\.com\/images\/I\/([A-Za-z0-9%+\-]{10,})\._AC_S/,
    /m\.media-amazon\.com\/images\/I\/([A-Za-z0-9%+\-]{10,})\._SX/,
  ];

  for (const pat of patterns) {
    const m = html.match(pat);
    if (m && m[1].length >= 10) return m[1];
  }
  return null;
}

// Image URL'i HEAD test (valid mi)
async function isValidImageUrl(url) {
  try {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(8000) });
    if (!res.ok) return false;
    const ct = res.headers.get("content-type") || "";
    if (!ct.startsWith("image/")) return false;
    const size = parseInt(res.headers.get("content-length") || "0", 10);
    return size > 3000; // placeholder'lar genelde < 3KB
  } catch {
    return false;
  }
}

(async () => {
  console.log("products-tr.json temizleme + image enrichment başlıyor...\n");

  const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf8"));
  console.log(`Toplam ürün: ${products.length}`);

  const cleaned = [];
  let blacklisted = 0;
  let imageFixed = 0;
  let imageFailedKeptWithFallback = 0;

  for (const p of products) {
    // 1. Blacklist
    if (isBlacklisted(p.title)) {
      console.log(`  ⊘ atlandı: ${p.title.substring(0, 60)}`);
      blacklisted++;
      continue;
    }

    // 2. Mevcut imageUrl test
    let imageUrl = p.imageUrl;
    let imageOk = imageUrl ? await isValidImageUrl(imageUrl) : false;

    // 3. Yoksa Amazon TR product page scrape
    if (!imageOk) {
      process.stdout.write(`  ◌ ${p.asin}: image scrape... `);
      const imgId = await getProductImageId(p.asin);
      if (imgId) {
        imageUrl = `https://m.media-amazon.com/images/I/${imgId}._SL400_.jpg`;
        imageOk = await isValidImageUrl(imageUrl);
        if (imageOk) {
          console.log(`✓ (${imgId})`);
          imageFixed++;
        } else {
          console.log(`✗ scrape sonrası da invalid`);
        }
      } else {
        console.log(`✗ IMG_ID bulunamadı`);
      }
      await new Promise((r) => setTimeout(r, 1000)); // rate limit
    }

    if (!imageOk) {
      // Image yine yok — emoji fallback'e kalsın, ürünü tut
      imageUrl = "";
      imageFailedKeptWithFallback++;
    }

    cleaned.push({ ...p, imageUrl });
  }

  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(cleaned, null, 2));

  console.log("\n" + "═".repeat(50));
  console.log(`✅ ${cleaned.length} ürün kayıtlı`);
  console.log(`   ⊘ ${blacklisted} ürün blacklist ile atlandı`);
  console.log(`   ✓ ${imageFixed} image scrape ile düzeltildi`);
  console.log(`   ⚠ ${imageFailedKeptWithFallback} image bulunamadı (emoji fallback gösterir)`);
})();
