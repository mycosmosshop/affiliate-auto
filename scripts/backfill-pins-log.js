// Retroactive pin log
// Pinterest profilinden mevcut yayınlanmış pinleri çeker, pins-log.json'a ekler.
// Style/asin eşleşmesi yapılamaz (profil sayfasında bu meta yok), sadece pin URL + başlık.
//
// Kullanım: node scripts/backfill-pins-log.js
// pins-log.json yoksa oluşturur, varsa yeni pin'leri ekler (dedup).

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const SESSION_FILE = path.join(process.cwd(), 'pinterest-session.json');
const LOG_FILE = path.join(process.cwd(), 'data', 'pins-log.json');
const USERNAME = process.env.PINTEREST_USERNAME || 'mycosmosshop';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  if (!fs.existsSync(SESSION_FILE)) {
    console.log('❌ Login session yok. Önce: node pinterest-auto.js');
    process.exit(1);
  }

  console.log(`Profile pin scraping: /${USERNAME}/pins/\n`);

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

  await page.goto(`https://www.pinterest.com/${USERNAME}/pins/`, {
    waitUntil: 'commit', timeout: 30000,
  });
  await sleep(4000);

  if (page.url().includes('/login')) {
    console.log('❌ Session geçersiz');
    await browser.close();
    process.exit(1);
  }

  // Lazy-load için sayfa kaydır (tüm pinleri yükle)
  for (let i = 0; i < 8; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await sleep(1500);
  }

  // Tüm pin link'lerini topla
  const pins = await page.evaluate(() => {
    const cards = document.querySelectorAll('a[href*="/pin/"]');
    const out = [];
    const seen = new Set();
    for (const a of cards) {
      const m = a.href.match(/\/pin\/(\d+)/);
      if (!m) continue;
      const id = m[1];
      if (seen.has(id)) continue;
      seen.add(id);
      const img = a.querySelector('img');
      out.push({
        id,
        url: `https://www.pinterest.com/pin/${id}/`,
        title: img?.getAttribute('alt') || '',
        imgUrl: img?.src || '',
      });
    }
    return out;
  });

  await browser.close();

  console.log(`Profil'de ${pins.length} pin bulundu.\n`);

  // Mevcut log'u oku
  let existing = [];
  try { existing = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8')); } catch {}
  const existingIds = new Set(existing.map(p => p.id));

  // Dedup, yeni olanları ekle
  let added = 0;
  for (const p of pins) {
    if (existingIds.has(p.id)) continue;
    existing.push({
      id: p.id,
      url: p.url,
      asin: 'unknown', // profil'den çıkarılamıyor
      productTitle: p.title,
      category: 'all',
      style: 'unknown', // retroactive — stil bilgisi yok
      hook: p.title,
      publishedAt: new Date().toISOString(),
      _backfilled: true,
    });
    added++;
  }

  if (!fs.existsSync(path.dirname(LOG_FILE))) {
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
  }
  fs.writeFileSync(LOG_FILE, JSON.stringify(existing, null, 2));

  console.log(`✅ ${added} yeni pin log'a eklendi (toplam ${existing.length})`);
  console.log(`📄 ${LOG_FILE}`);
  if (added > 0) {
    console.log(`\nNot: Retroactive eklenen pin'lerde style="unknown" — performans karşılaştırması`);
    console.log(`     sonraki run'larda doğru style ile log'lanacak yeni pinler için anlamlı olur.`);
  }
})();
