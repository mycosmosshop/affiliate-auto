// Amazon product page'lerinden gerçek IMG_ID'leri scrape eder
// curated-products.json'daki her ürünün imageUrl ve imageUrls array'ini günceller.
//
// Kullanım: node scripts/enrich-product-images.js
// Çıktı: data/curated-products.json güncellenir (gerçek high-res Amazon foto URL'leriyle)

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const CURATED_FILE = path.join(process.cwd(), 'data', 'curated-products.json');

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
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124' },
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) continue;
      const text = await res.text();
      if (text.length < 5000 || /captcha|Type the characters/i.test(text)) continue;
      return text;
    } catch {}
  }
  return '';
}

// Amazon HTML'inden tüm benzersiz IMG_ID'leri çıkar (top down sırayla)
function extractImageIds(html) {
  const ids = [];
  const seen = new Set();
  // m.media-amazon.com/images/I/{IMG_ID}.jpg pattern
  const pat = /m\.media-amazon\.com\/images\/I\/([A-Za-z0-9%+\-]{10,})\./g;
  let m;
  while ((m = pat.exec(html)) !== null) {
    const id = m[1];
    if (seen.has(id)) continue;
    // UI/icon/sprite/logo imageleri exclude — bunlar genelde kısa veya specific
    if (/^[01]\.svg|nav|logo|sprite/i.test(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  return ids;
}

async function enrichProduct(p) {
  const url = `https://www.amazon.com/dp/${p.asin}`;
  console.log(`▸ ${p.asin}: ${p.title.substring(0, 50)}`);
  const html = await fetchHtml(url);
  if (!html) {
    console.log(`  ✗ HTML alinamadi`);
    return p;
  }
  const ids = extractImageIds(html);
  if (!ids.length) {
    console.log(`  ✗ IMG_ID bulunamadi`);
    return p;
  }
  const heroId = ids[0];
  const heroUrl = `https://m.media-amazon.com/images/I/${heroId}._AC_SL1500_.jpg`;
  console.log(`  ✓ ${ids.length} IMG_ID bulundu, hero: ${heroId}`);
  return {
    ...p,
    imageUrl: heroUrl,
    _allImgIds: ids.slice(0, 6), // ileride lazım olabilir
  };
}

(async () => {
  if (!fs.existsSync(CURATED_FILE)) {
    console.log(`❌ ${CURATED_FILE} yok`);
    process.exit(1);
  }

  const products = JSON.parse(fs.readFileSync(CURATED_FILE, 'utf8'));
  console.log(`${products.length} ürün için Amazon image scraping başlıyor...\n`);

  // Hero ürünler — her ASIN için gerçek foto URL'i çek
  const enriched = [];
  for (const p of products) {
    const updated = await enrichProduct(p);
    enriched.push(updated);
    await new Promise(r => setTimeout(r, 1500));
  }

  // Collection ürünleri için: collectionItems içindeki her ASIN için de hero foto çek,
  // imageUrls array'ini hero URL'leriyle güncelle
  for (const p of enriched) {
    if (!p.collection || !Array.isArray(p.collectionItems)) continue;
    console.log(`\n▸ Collection: ${p.title}`);
    const newImageUrls = [];
    for (const item of p.collectionItems) {
      const existing = enriched.find(x => x.asin === item.asin);
      if (existing && existing.imageUrl && !existing.imageUrl.includes('LZZZZZZZ')) {
        newImageUrls.push(existing.imageUrl);
        console.log(`  ✓ ${item.asin}: ${existing.imageUrl.substring(0, 80)}`);
      } else {
        // collectionItem ASIN curated'da yoksa scrape et
        const fresh = await enrichProduct({ asin: item.asin, title: item.title });
        if (fresh.imageUrl && !fresh.imageUrl.includes('LZZZZZZZ')) {
          newImageUrls.push(fresh.imageUrl);
        }
        await new Promise(r => setTimeout(r, 1500));
      }
    }
    p.imageUrls = newImageUrls;
    console.log(`  → ${newImageUrls.length}/${p.collectionItems.length} valid hero URL`);
  }

  fs.writeFileSync(CURATED_FILE, JSON.stringify(enriched, null, 2));
  console.log(`\n✅ ${CURATED_FILE} güncellendi`);
  console.log(`   ${enriched.length} ürün enriched`);
})();
