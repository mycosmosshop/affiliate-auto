// Pinterest search autocomplete scraper
// Her ürün için Pinterest search box'a term yazar, autocomplete önerilerini çeker.
// Bunlar gerçek search hacimli keyword'ler — hashtag/description optimization için.
//
// Kullanım: node scripts/fetch-pinterest-keywords.js
// Çıktı: data/products.json'a her ürüne `keywords: ['...']` ekler.

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const PRODUCTS_FILE = path.join(process.cwd(), 'data', 'products.json');
const SESSION_FILE = path.join(process.cwd(), 'pinterest-session.json');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Ürünün search term'lerini üret — brand + ana kelimeler
function buildSearchTerms(product) {
  const title = (product.title || '').toLowerCase();
  const brand = title.split(/[\s,|]/)[0];
  const cat = product.category || '';

  // 2-3 stratejik term: marka tek başına + marka+kategori + kategori
  const terms = new Set();
  if (brand && brand.length >= 3) terms.add(brand);
  if (brand && cat) terms.add(`${brand} ${cat}`);
  // ana ürün kelimesini al (genelde 2-3. kelime — ürün tipi)
  const words = title.split(/\s+/).slice(1, 4).filter(w => w.length >= 4);
  if (words.length) terms.add(`${brand} ${words[0]}`);
  return Array.from(terms).slice(0, 2); // ürün başına 2 query — rate limit dostu
}

async function getAutocompleteSuggestions(page, term) {
  try {
    // Search input'u bul, term'i yaz
    const searchInput = await page.waitForSelector(
      'input[name="searchBoxInput"], input[type="search"], [data-test-id="search-box-input"]',
      { timeout: 5000 }
    );
    await searchInput.click();
    await searchInput.fill('');
    await page.keyboard.type(term, { delay: 60 });
    await sleep(1500); // autocomplete render bekle

    // Suggestion items — birden çok selector dene
    const suggestions = await page.$$eval(
      '[data-test-id="autocomplete-search-suggestion-item"], [role="option"], [data-test-id*="autocomplete"]',
      (els) => els.map(el => el.textContent?.trim()).filter(Boolean)
    ).catch(() => []);

    // Fallback: search dropdown içindeki <a> linkleri
    if (!suggestions.length) {
      const links = await page.$$eval(
        '[role="listbox"] a, [role="menu"] [role="menuitem"]',
        (els) => els.map(el => el.textContent?.trim()).filter(Boolean)
      ).catch(() => []);
      suggestions.push(...links);
    }

    // Dedup, temizle, term'in kendisi olmayan ve 3-50 char arası
    return [...new Set(suggestions)]
      .map(s => s.replace(/\s+/g, ' ').trim().toLowerCase())
      .filter(s => s.length >= 3 && s.length <= 50 && s !== term.toLowerCase())
      .slice(0, 8);
  } catch (e) {
    console.log(`  ✗ ${term}: ${e.message.substring(0, 60)}`);
    return [];
  }
}

(async () => {
  if (!fs.existsSync(PRODUCTS_FILE)) {
    console.log(`❌ ${PRODUCTS_FILE} yok. Önce: node scripts/fetch-bestsellers.js`);
    process.exit(1);
  }
  if (!fs.existsSync(SESSION_FILE)) {
    console.log(`❌ ${SESSION_FILE} yok. Önce: node pinterest-auto.js (login ol)`);
    process.exit(1);
  }

  const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
  console.log(`${products.length} ürün için Pinterest keyword arama başlıyor...\n`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled'],
  });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 900 },
  });
  await context.addCookies(JSON.parse(fs.readFileSync(SESSION_FILE)));
  const page = await context.newPage();
  await page.goto('https://www.pinterest.com/', { waitUntil: 'domcontentloaded' });
  await sleep(3000);

  if (page.url().includes('/login')) {
    console.log('❌ Session geçersiz. Tekrar login için: node pinterest-auto.js');
    await browser.close();
    process.exit(1);
  }

  for (const product of products) {
    console.log(`▸ ${product.title.substring(0, 50)}`);
    const terms = buildSearchTerms(product);
    const allKeywords = new Set();

    for (const term of terms) {
      const kws = await getAutocompleteSuggestions(page, term);
      kws.forEach(k => allKeywords.add(k));
      console.log(`  ◦ "${term}" → ${kws.length} öneri`);
      await sleep(800); // rate limit
    }

    product.keywords = Array.from(allKeywords).slice(0, 10);
    console.log(`  ✓ Toplam ${product.keywords.length} keyword`);
  }

  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  await browser.close();

  console.log(`\n✅ Keywords kaydedildi: ${PRODUCTS_FILE}`);
  console.log(`   Örnek (ilk ürün): ${products[0]?.keywords?.slice(0, 5).join(', ') || 'yok'}`);
})();
