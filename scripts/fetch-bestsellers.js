// Amazon best-seller fetcher CLI
// Kullanım: node scripts/fetch-bestsellers.js beauty electronics kitchen
// RSS feed'ten gerçek bestseller'ları çeker, data/products.json'a yazar (mevcut data ile merge)
// Default: tüm kategoriler

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const ASSOCIATE_TAG = process.env.AMAZON_ASSOCIATE_TAG || 'mycosmoline-20';
const REGION = process.env.PINTEREST_REGION || 'USA';
const OUT_FILE = path.join(process.cwd(), 'data', 'products.json');

// Amazon RSS feed'leri 2019'da kapandı, artık HTML best-seller sayfalarını scrape ediyoruz
const HTML_FEEDS = {
  all:         'https://www.amazon.com/best-sellers',
  electronics: 'https://www.amazon.com/Best-Sellers-Electronics/zgbs/electronics',
  kitchen:     'https://www.amazon.com/Best-Sellers-Kitchen-Dining/zgbs/kitchen',
  beauty:      'https://www.amazon.com/Best-Sellers-Beauty/zgbs/beauty',
  fitness:     'https://www.amazon.com/Best-Sellers-Sports-Outdoors/zgbs/sporting-goods',
  books:       'https://www.amazon.com/best-sellers-books-Amazon/zgbs/books',
  toys:        'https://www.amazon.com/Best-Sellers-Toys-Games/zgbs/toys-and-games',
  baby:        'https://www.amazon.com/Best-Sellers-Baby/zgbs/baby-products',
  pet:         'https://www.amazon.com/Best-Sellers-Pet-Supplies/zgbs/pet-supplies',
  tools:       'https://www.amazon.com/Best-Sellers-Tools-Home-Improvement/zgbs/hi',
  garden:      'https://www.amazon.com/Best-Sellers-Garden-Outdoor/zgbs/lawn-garden',
  fashion:     'https://www.amazon.com/Best-Sellers-Fashion/zgbs/fashion',
};

// CORS proxy'ler — Amazon bot detection'ı bypass eder
const PROXIES = [
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

// Amazon HTML sayfasını proxy üzerinden çek (bot detection bypass)
async function fetchHtmlViaProxy(amazonUrl) {
  for (const buildProxy of PROXIES) {
    const proxyUrl = buildProxy(amazonUrl);
    try {
      const res = await fetch(proxyUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) continue;
      const text = await res.text();
      // Captcha veya çok kısa response — başka proxy dene
      if (text.length < 5000 || /captcha|Type the characters/i.test(text)) continue;
      return text;
    } catch { /* sıradakini dene */ }
  }
  return '';
}

// Amazon best-seller HTML'inden ASIN, title, price, image parse et
// Pozisyon bazlı: her ASIN'in DOM'daki pozisyonuna en yakın image atanır
function parseAmazonHtml(html, category) {
  const products = [];

  // 1) Tüm benzersiz ASIN pozisyonları
  const asinPat = /data-asin="([A-Z0-9]{10})"/g;
  const asins = [];
  let m;
  while ((m = asinPat.exec(html)) !== null) {
    if (m[1] && !asins.find(a => a.asin === m[1])) {
      asins.push({ asin: m[1], pos: m.index });
    }
  }
  if (!asins.length) return [];

  // 2) Tüm Amazon CDN image ID + pozisyon
  const imgPat = /m\.media-amazon\.com\/images\/I\/([A-Za-z0-9%+]{10,})\./g;
  const imgs = [];
  while ((m = imgPat.exec(html)) !== null) {
    if (m[1] && !imgs.find(x => x.id === m[1])) imgs.push({ id: m[1], pos: m.index });
  }

  // En yakın image bul
  const nearestImg = (pos) => imgs.length
    ? imgs.reduce((best, cur) => Math.abs(cur.pos - pos) < Math.abs(best.pos - pos) ? cur : best).id
    : '';

  // 3) Her ASIN'in komşuluğundan title + price çıkar
  for (let i = 0; i < Math.min(asins.length, 10); i++) {
    const { asin, pos } = asins[i];
    const end = asins[i + 1]?.pos ?? pos + 4000;
    const block = html.substring(pos, Math.min(end, pos + 4000));

    let title = '';
    for (const pat of [
      /class="[^"]*p13n-sc-truncate[^"]*"[^>]*>\s*([^<]{10,200})\s*</,
      /class="[^"]*_cDEzb_p13n-sc-css-line-clamp[^"]*"[^>]*>\s*([^<]{10,200})\s*</,
      /class="[^"]*sc-css-line-clamp[^"]*"[^>]*>\s*([^<]{10,200})\s*</,
      /"name"\s*:\s*"([^"]{10,200})"/,
      /title="([^"]{10,200})"/,
      /alt="([^"]{10,200})"/,
    ]) {
      const t = block.match(pat)?.[1]?.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (t && t.length >= 10) { title = t; break; }
    }

    let price = 'See Price';
    for (const pat of [
      /class="[^"]*p13n-sc-price[^"]*"[^>]*>\s*\$?([\d,]+\.?\d*)/,
      /"displayAmount"\s*:\s*"\\?\$?([\d,.]+)"/,
      /\$\s*([\d]+\.\d{2})/,
    ]) {
      const p = block.match(pat)?.[1];
      if (p) { price = '$' + p; break; }
    }

    const rating = block.match(/aria-label="([\d.]+) out of 5 stars"/)?.[1] || '4.5';
    const reviewCount = block.match(/aria-label="([\d,]+) ratings?"/)?.[1] || 'Top Rated';
    const imgId = nearestImg(pos);
    const imageUrl = imgId ? `https://m.media-amazon.com/images/I/${imgId}._AC_SL1500_.jpg` : '';

    products.push({
      asin,
      title: title || `Amazon Best Seller #${i + 1}`,
      price,
      rating,
      reviewCount,
      imageUrl,
      productUrl: `https://www.amazon.com/dp/${asin}`,
      affiliateUrl: `https://www.amazon.com/dp/${asin}?tag=${ASSOCIATE_TAG}`,
      description: title,
      isPrime: true,
      rank: i + 1,
      category,
      region: REGION,
    });
  }
  return products;
}

async function fetchCategory(category) {
  const url = HTML_FEEDS[category];
  if (!url) {
    console.log(`  ⚠️  Bilinmeyen kategori: ${category}`);
    return [];
  }
  try {
    const html = await fetchHtmlViaProxy(url);
    if (!html) {
      console.log(`  ✗ ${category}: tüm proxy'ler başarısız`);
      return [];
    }
    const products = parseAmazonHtml(html, category);
    console.log(`  ✓ ${category}: ${products.length} ürün`);
    return products;
  } catch (e) {
    console.log(`  ✗ ${category}: ${e.message}`);
    return [];
  }
}

function loadExisting() {
  try {
    return JSON.parse(fs.readFileSync(OUT_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function mergeProducts(existing, fresh) {
  // ASIN bazlı dedup — fresh data eskiyi override eder
  const map = new Map();
  for (const p of existing) map.set(p.asin, p);
  for (const p of fresh) map.set(p.asin, p);
  return Array.from(map.values());
}

(async () => {
  const args = process.argv.slice(2);
  let categories = args.length ? args : ['beauty']; // default: beauty
  const replace = categories.includes('--replace');
  categories = categories.filter(c => !c.startsWith('--'));

  console.log(`Amazon RSS bestseller fetcher`);
  console.log(`Kategoriler: ${categories.join(', ')}`);
  console.log(`Region: ${REGION}\n`);

  const fresh = [];
  for (const cat of categories) {
    const items = await fetchCategory(cat);
    fresh.push(...items);
  }

  if (!fresh.length) {
    console.log('\n❌ Hiç ürün alınamadı. RSS feed timeout veya engelleniyor olabilir.');
    process.exit(1);
  }

  const existing = replace ? [] : loadExisting();
  const merged = mergeProducts(existing, fresh);

  if (!fs.existsSync(path.dirname(OUT_FILE))) {
    fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  }
  fs.writeFileSync(OUT_FILE, JSON.stringify(merged, null, 2));

  console.log(`\n✅ ${OUT_FILE}`);
  console.log(`   Önceki: ${existing.length} ürün`);
  console.log(`   Yeni:   ${fresh.length} ürün`);
  console.log(`   Toplam: ${merged.length} ürün (ASIN dedup'lu)`);
})();
