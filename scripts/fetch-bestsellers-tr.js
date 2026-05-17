// Amazon Türkiye (amazon.com.tr) best-seller scraper
// Mevcut fetch-bestsellers.js'in TR versiyonu — CORS proxy ile HTML çek, ASIN+IMG_ID parse et
//
// Kullanım: node scripts/fetch-bestsellers-tr.js
// Çıktı: data/products-tr.json güncellenir — her kategori için ~10 gerçek Amazon TR ürünü

const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

const AFFILIATE_TAG = process.env.AMAZON_TR_TAG || ""; // onay sonrası "cosmositio-21"
const OUT_FILE = path.join(process.cwd(), "data", "products-tr.json");

// Amazon TR bestsellers URL'leri (kategori başına) — doğru pathler
const CATEGORIES = {
  Teknoloji: {
    url: "https://www.amazon.com.tr/gp/bestsellers/electronics",
    emoji: "🔌",
    productEmojis: ["🎧", "📺", "⚡", "💡", "📷", "⌚", "🔊", "📱"],
  },
  Mutfak: {
    url: "https://www.amazon.com.tr/gp/bestsellers/kitchen",
    emoji: "🍳",
    productEmojis: ["🍲", "🥤", "🍟", "💧", "☕", "🥗", "🥣", "🍞"],
  },
  "Güzellik": {
    url: "https://www.amazon.com.tr/gp/bestsellers/beauty",
    emoji: "💄",
    productEmojis: ["💆", "✨", "🩹", "🪨", "🐌", "💧", "🌙", "💋"],
  },
  "Spor & Sağlık": {
    url: "https://www.amazon.com.tr/gp/bestsellers/sporting-goods",
    emoji: "💪",
    productEmojis: ["💪", "🧘", "⌚", "🥛", "🏋️", "⚖️", "🎯", "⏱️"],
  },
  "Anne & Bebek": {
    url: "https://www.amazon.com.tr/gp/bestsellers/baby-products",
    emoji: "👶",
    productEmojis: ["👶", "🌙", "🛏️", "🧴", "🍼", "🤱", "🧽", "🚗"],
  },
};

// Title-bazlı blacklist — uygunsuz/tartışmalı/algoritma riskli ürünler
const TITLE_BLACKLIST_KEYWORDS = [
  // Bıçak çeşitleri
  "bıçak", "bicak", "bıçağ", "bicag", "knife",
  "çakı", "caki", "opinel", "swiss army",
  "kılıç", "kilic", "satır", "satir", "balta", "makas", "kesici",
  // Tıraş aletleri (keskin)
  "tıraş bıçağı", "tiras bicagi", "razor", "shaver kafas",
  "gillette", "wilkinson", "venus breeze",
  // Silah
  "silah", "tabanca", "tüfek", "tufek", "pompalı",
  // Bebek bezleri
  "bebek bezi", "diaper", "pampers", "prima diaper", "molfix", "bezler",
  // Yetişkin
  "alkol", "şarap", "sigara", "tütün", "tutun", "vape",
  // Regülasyon
  "ilaç", "ilac", "reçeteli", "receteli",
  // Canlı
  "hamster", "papağan", "papagan",
];

function isBlacklisted(title) {
  const t = (title || "").toLowerCase();
  return TITLE_BLACKLIST_KEYWORDS.some((kw) => t.includes(kw));
}

// CORS proxy'ler (Amazon bot detection bypass)
const PROXIES = [
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

async function fetchHtml(url) {
  for (const buildProxy of PROXIES) {
    const proxyUrl = buildProxy(url);
    try {
      const res = await fetch(proxyUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124",
        },
        signal: AbortSignal.timeout(25000),
      });
      if (!res.ok) continue;
      const text = await res.text();
      if (text.length < 5000) continue;
      if (/captcha|robot check/i.test(text)) continue;
      return text;
    } catch {}
  }
  return "";
}

// HTML'den ASIN+IMG_ID pozisyon eşleştirme (mevcut scraper.ts algoritması)
function parseAmazonHtml(html, category, info) {
  const products = [];

  // 1) Tüm benzersiz ASIN'leri konumları ile çek
  const asinPat = /data-asin="([A-Z0-9]{10})"/g;
  const asins = [];
  let m;
  while ((m = asinPat.exec(html)) !== null) {
    if (m[1] && !asins.find((a) => a.asin === m[1])) {
      asins.push({ asin: m[1], pos: m.index });
    }
  }
  if (!asins.length) return [];

  // 2) Tüm IMG_ID'leri konumları ile çek (Amazon CDN'inin gerçek high-res image hash'i)
  const imgPat = /m\.media-amazon\.com\/images\/I\/([A-Za-z0-9%+\-]{10,})\./g;
  const imgs = [];
  while ((m = imgPat.exec(html)) !== null) {
    if (m[1] && !imgs.find((x) => x.id === m[1])) {
      imgs.push({ id: m[1], pos: m.index });
    }
  }
  const nearestImg = (pos) =>
    imgs.length
      ? imgs.reduce((best, cur) =>
          Math.abs(cur.pos - pos) < Math.abs(best.pos - pos) ? cur : best
        ).id
      : "";

  // 3) Her ASIN için komşuluğundan title + price çıkar
  //    Blacklist filtresi ile, fazladan üretmek için 25 deneme (filtre sonrası ~10 kalır)
  for (let i = 0; i < Math.min(asins.length, 25) && products.length < 10; i++) {
    const { asin, pos } = asins[i];
    const end = asins[i + 1]?.pos ?? pos + 4000;
    const block = html.substring(pos, Math.min(end, pos + 4000));

    let title = "";
    for (const pat of [
      /class="[^"]*p13n-sc-truncate[^"]*"[^>]*>\s*([^<]{10,200})\s*</,
      /class="[^"]*_cDEzb_p13n-sc-css-line-clamp[^"]*"[^>]*>\s*([^<]{10,200})\s*</,
      /class="[^"]*sc-css-line-clamp[^"]*"[^>]*>\s*([^<]{10,200})\s*</,
      /"name"\s*:\s*"([^"]{10,200})"/,
      /title="([^"]{10,200})"/,
      /alt="([^"]{10,200})"/,
    ]) {
      const t = block
        .match(pat)?.[1]
        ?.replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim();
      if (t && t.length >= 10) {
        title = t;
        break;
      }
    }

    let price = "Fiyat için tıkla";
    for (const pat of [
      /class="[^"]*p13n-sc-price[^"]*"[^>]*>\s*[₺TL]*\s*([\d.,]+)/,
      /TL\s*([\d.,]+)/,
      /([\d.,]+)\s*TL/,
    ]) {
      const p = block.match(pat)?.[1];
      if (p) {
        price = "₺" + p;
        break;
      }
    }

    // BLACKLIST: bıçak, bebek bezi, alkol, ilaç vb. uygunsuz ürünleri atla
    if (isBlacklisted(title)) {
      console.log(`  ⊘ atlandı: ${title.substring(0, 50)}...`);
      continue;
    }

    // IMG_ID pozisyonu güvenilmez (sayfa header'ındaki ikonu yakalayabiliyor)
    // ASIN-based Amazon CDN URL'i daha güvenli — Amazon TR'de ürün foto'sunu döndürür
    const imageUrl = `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.LZZZZZZZ.jpg`;

    // Title kısalt (100 char max) — uzun başlıklar UI'da kırpılıyor
    const trimmedTitle = (title || `Amazon TR Best Seller #${products.length + 1}`).substring(0, 100).replace(/\s+\S*$/, "...");

    const emoji =
      info.productEmojis[products.length % info.productEmojis.length] || info.emoji;

    products.push({
      asin,
      title: trimmedTitle,
      price,
      rating: "4.5",
      description: title ? title.substring(0, 140).replace(/\s+\S*$/, "...") : "",
      imageUrl,
      affiliateUrl: AFFILIATE_TAG
        ? `https://www.amazon.com.tr/dp/${asin}?tag=${AFFILIATE_TAG}`
        : `https://www.amazon.com.tr/dp/${asin}`,
      category,
      emoji,
    });
  }
  return products;
}

(async () => {
  console.log("Amazon Türkiye bestseller scraper başlıyor...\n");
  const all = [];

  for (const [category, info] of Object.entries(CATEGORIES)) {
    console.log(`▸ ${info.emoji} ${category}: ${info.url}`);
    const html = await fetchHtml(info.url);
    if (!html) {
      console.log(`  ✗ HTML alınamadı (proxy fail)`);
      continue;
    }
    const products = parseAmazonHtml(html, category, info);
    console.log(`  ✓ ${products.length} ürün`);
    all.push(...products);
    await new Promise((r) => setTimeout(r, 2000));
  }

  if (!all.length) {
    console.log("\n❌ Hiç ürün alınamadı. Proxy fail veya Amazon engellemesi.");
    process.exit(1);
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(all, null, 2));
  console.log(`\n✅ ${OUT_FILE} güncellendi (${all.length} ürün)`);
  console.log(`\nÖrnek ilk ürün:`);
  console.log(JSON.stringify(all[0], null, 2));
})();
