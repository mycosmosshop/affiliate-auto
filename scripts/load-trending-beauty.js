// Curated ürünler — manuel araştırılmış / Claude ile bulunmuş ürünler
// data/curated-products.json'dan okur (varsa); yoksa hardcoded default kullanır.
// Yeni ürün eklemek için: data/curated-products.json'u edit et veya bana söyle.
//
// Kullanım: node scripts/load-trending-beauty.js
//   --append  → mevcut products.json'a ekler (dedup'lu)
//   default   → products.json'u sıfırdan trend ürünlerle doldurur

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const ASSOCIATE_TAG = process.env.AMAZON_ASSOCIATE_TAG || 'mycosmoline-20';
const REGION = process.env.PINTEREST_REGION || 'USA';
const OUT_FILE = path.join(process.cwd(), 'data', 'products.json');
const CURATED_FILE = path.join(process.cwd(), 'data', 'curated-products.json');

// 1) Önce kullanıcının curated-products.json'unu yükle (varsa)
let TRENDING;
if (fs.existsSync(CURATED_FILE)) {
  try {
    TRENDING = JSON.parse(fs.readFileSync(CURATED_FILE, 'utf8'));
    console.log(`📄 data/curated-products.json kullanılıyor (${TRENDING.length} ürün)`);
  } catch (e) {
    console.warn(`⚠️  curated-products.json parse hatası: ${e.message}, hardcoded default kullanılıyor`);
    TRENDING = null;
  }
}

// 2) Yoksa hardcoded default (geriye uyumluluk)
if (!TRENDING) TRENDING = [
  {
    asin: 'B0GM82RQ3Y',
    title: 'Rhode Peptide Lip Tint by Hailey Bieber',
    price: '$27.00',
    rating: '4.6',
    reviewCount: 'Viral',
    description: 'Viral peptide lip tint — glass lips effect, Selena Gomez approved',
    pinterestTrend: 'glass lips, peptide lip treatment',
  },
  {
    asin: 'B0GWKBL3V9',
    title: 'Paula\'s Choice SKIN PERFECTING 2% BHA Liquid Exfoliant',
    price: '$34.00',
    rating: '4.5',
    reviewCount: '114,000+',
    description: 'Glass skin holy grail, pore-minimizing leave-on exfoliant',
    pinterestTrend: 'glass skin, pore minimizing',
  },
  {
    asin: 'B00TTD9BRC',
    title: 'CeraVe Moisturizing Cream 19 Oz Face & Body Moisturizer',
    price: '$18.99',
    rating: '4.7',
    reviewCount: '144,000+',
    description: 'Dermatologist recommended #1 moisturizer with hyaluronic acid and ceramides',
    pinterestTrend: 'skincare routine, affordable skincare',
  },
  {
    asin: 'B0CFJQKL2V',
    title: 'e.l.f. Power Grip Primer + 4% Niacinamide',
    price: '$10.00',
    rating: '4.6',
    reviewCount: '13,900+',
    description: 'Viral TikTok drugstore primer dupe with grippy hold',
    pinterestTrend: 'drugstore dupes, viral makeup',
  },
  {
    asin: 'B0C1CG2YZ5',
    title: 'Rare Beauty Soft Pinch Tinted Lip Oil by Selena Gomez',
    price: '$30.00',
    rating: '4.1',
    reviewCount: 'Trending',
    description: 'Glazed lip oil — juicy glossy finish in 10 shades',
    pinterestTrend: 'glazed lips, juicy lip',
  },
  {
    asin: 'B0C75G6RWX',
    title: 'Glow Recipe Watermelon Glow Niacinamide Dew Drops Serum',
    price: '$36.00',
    rating: '4.8',
    reviewCount: 'Top Rated',
    description: 'Dewy glass skin serum with niacinamide and watermelon extract',
    pinterestTrend: 'dewy skin, glass skin, K-beauty',
  },
  {
    asin: 'B0F6D35G3G',
    title: 'La Roche-Posay Toleriane Double Repair Face Moisturizer',
    price: '$22.00',
    rating: '4.9',
    reviewCount: 'Top Rated',
    description: 'Ceramide + niacinamide formula, sensitive skin essential',
    pinterestTrend: 'sensitive skin, skincare essentials',
  },
  {
    asin: 'B0D5XJMQP9',
    title: 'Peter Thomas Roth 24K Gold Pure Luxury Eye Patches',
    price: '$95.00',
    rating: '5.0',
    reviewCount: 'Luxury',
    description: '24K gold under-eye patches for instant brightening and de-puffing',
    pinterestTrend: 'luxury skincare, self-care',
  },
  {
    asin: 'B07GPM4XBV',
    title: 'Charlotte Tilbury Charlotte\'s Magic Cream Moisturizer',
    price: '$100.00',
    rating: '4.7',
    reviewCount: 'Cult Favorite',
    description: 'Instant radiance moisturizer — celebrity makeup artist\'s secret',
    pinterestTrend: 'glowing skin, luxury moisturizer',
  },
  {
    asin: 'B00SNM5US4',
    title: 'Olaplex No.3 Hair Perfector Pre-Shampoo Treatment',
    price: '$30.00',
    rating: '4.5',
    reviewCount: 'Bestseller',
    description: 'Salon-quality bond repair at home, restores damaged hair',
    pinterestTrend: 'hair care routine, damaged hair repair',
  },
];

function buildProduct(p) {
  return {
    asin: p.asin,
    title: p.title,
    price: p.price,
    rating: p.rating,
    reviewCount: p.reviewCount,
    // imageUrl: curated-products.json'da manuel verilmişse onu kullan, yoksa ASIN-based
    imageUrl: p.imageUrl || `https://images-na.ssl-images-amazon.com/images/P/${p.asin}.01.LZZZZZZZ.jpg`,
    productUrl: `https://www.amazon.com/dp/${p.asin}`,
    affiliateUrl: `https://www.amazon.com/dp/${p.asin}?tag=${ASSOCIATE_TAG}`,
    description: p.description,
    isPrime: true,
    rank: TRENDING.indexOf(p) + 1,
    category: p.category || 'beauty',
    region: REGION,
    keywords: (p.pinterestTrend || '').split(',').map(k => k.trim()).filter(Boolean),
    pin_hook: p.pin_hook || null,
    // Storefront/idea-list link override — pin'in ana link'i bu olur
    affiliateUrlOverride: p.affiliateUrlOverride || null,
    // Collection metadata — multi-image flat-lay ve description için
    collection: p.collection || false,
    collectionItems: p.collectionItems || null,
    imageUrls: p.imageUrls || null,
  };
}

const append = process.argv.includes('--append');
const fresh = TRENDING.map(buildProduct);

let final;
if (append) {
  let existing = [];
  try { existing = JSON.parse(fs.readFileSync(OUT_FILE, 'utf8')); } catch {}
  const map = new Map();
  for (const p of existing) map.set(p.asin, p);
  for (const p of fresh) map.set(p.asin, p);
  final = Array.from(map.values());
  console.log(`Append modu: ${existing.length} eski + ${fresh.length} trend → ${final.length} toplam`);
} else {
  final = fresh;
  console.log(`Replace modu: ${fresh.length} trend ürün yazıldı (eski veri silindi)`);
}

if (!fs.existsSync(path.dirname(OUT_FILE))) {
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
}
fs.writeFileSync(OUT_FILE, JSON.stringify(final, null, 2));

console.log(`\n✅ ${OUT_FILE}`);
console.log(`\nTrend ürünler:`);
fresh.forEach((p, i) => {
  console.log(`  ${(i + 1).toString().padStart(2)}. ${p.title.substring(0, 60).padEnd(60)} ${p.price}`);
});
console.log(`\nPin yayınlamak için: start.bat → 1 (veya 2 toplu 5 pin)`);
console.log(`Tüm 10'unu yayınlamak için:`);
console.log(`  $env:MAX_PINS = "10"`);
console.log(`  node pinterest-auto.js`);
