// Pinterest top-pin & trend araştırma scripti
// Pinterest search results'tan top pinleri çeker, başlık/görsel/pattern analizi yapar.
//
// Kullanım: node scripts/research-pins.js [keyword]
//   node scripts/research-pins.js                  → "beauty bestseller 2026"
//   node scripts/research-pins.js "korean skincare"
//   node scripts/research-pins.js "amazon finds beauty"
//
// Çıktı: data/pinterest-research.json + konsol özeti

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const SESSION_FILE = path.join(process.cwd(), 'pinterest-session.json');
const OUT_FILE = path.join(process.cwd(), 'data', 'pinterest-research.json');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function scrapePinsForKeyword(page, query, limit = 30) {
  const url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}&rs=typed`;
  console.log(`▸ Aranıyor: "${query}"`);
  await page.goto(url, { waitUntil: 'commit', timeout: 30000 });
  await page.waitForSelector('div[data-test-id="pin"], div[data-grid-item="true"]', { timeout: 15000 }).catch(() => {});
  await sleep(3000);

  // Lazy-load için 2 kez aşağı kaydır
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.9));
    await sleep(1500);
  }

  const pins = await page.evaluate((max) => {
    const out = [];
    // Pinterest pin cards — birden çok selector dene
    const cards = document.querySelectorAll('div[data-test-id="pin"], div[data-grid-item="true"], div[data-test-id="pinrep"]');
    for (const card of Array.from(cards).slice(0, max)) {
      const img = card.querySelector('img');
      const link = card.querySelector('a[href*="/pin/"]');
      if (!img || !link) continue;
      const pinId = (link.getAttribute('href') || '').match(/\/pin\/(\d+)/)?.[1];
      if (!pinId) continue;
      // Aynı pini iki kez ekleme
      if (out.find(p => p.id === pinId)) continue;
      // Pinterest pin başlığı genelde img alt text'inde
      const title = img.getAttribute('alt') || '';
      // Yüksek çözünürlük url (lazy load thumbnail'i 236x'tan 736x'a değiştir)
      const imgUrl = (img.src || img.getAttribute('data-src') || '').replace(/\/236x\//, '/736x/');
      // Açıklama / repins (varsa metadata)
      const aria = card.getAttribute('aria-label') || '';
      out.push({ id: pinId, title: title.trim(), imgUrl, aria: aria.trim() });
    }
    return out;
  }, limit);

  console.log(`  → ${pins.length} pin bulundu`);
  return pins;
}

// Başlık örüntü analizi — pattern istatistikleri
function analyzeTitles(pins) {
  const stats = {
    avgLength: 0,
    startsWithNumber: 0,
    questionFormat: 0,
    hasPrice: 0,
    hasYear: 0,
    hasEmoji: 0,
    superlatives: 0, // best, top, ultimate
    powerWords: {},  // en sık geçen anlamlı kelimeler
  };
  const yr = new Date().getFullYear();
  const stopWords = new Set(['the', 'a', 'an', 'in', 'on', 'for', 'of', 'to', 'and', 'or', 'is', 'are', 'with', 'by', 'this', 'that', 'how', 'what', 'why']);
  const wordCount = {};

  for (const pin of pins) {
    const t = (pin.title || '').toLowerCase();
    if (!t) continue;
    stats.avgLength += t.length;
    if (/^\d+\s/.test(t)) stats.startsWithNumber++;
    if (/\?$/.test(t) || /^(why|how|what|when)\s/i.test(t)) stats.questionFormat++;
    if (/\$\d+/.test(t)) stats.hasPrice++;
    if (new RegExp(`\\b${yr}\\b|\\b${yr - 1}\\b`).test(t)) stats.hasYear++;
    if (/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u.test(pin.title)) stats.hasEmoji++;
    if (/\b(best|top|ultimate|viral|trending|must-have|game-?changer|holy grail|cult)\b/i.test(t)) stats.superlatives++;

    for (const w of t.split(/\s+/)) {
      const clean = w.replace(/[^a-z]/g, '');
      if (clean.length < 4 || stopWords.has(clean)) continue;
      wordCount[clean] = (wordCount[clean] || 0) + 1;
    }
  }

  const n = pins.length || 1;
  stats.avgLength = Math.round(stats.avgLength / n);
  stats.startsWithNumber = +(stats.startsWithNumber / n * 100).toFixed(1);
  stats.questionFormat = +(stats.questionFormat / n * 100).toFixed(1);
  stats.hasPrice = +(stats.hasPrice / n * 100).toFixed(1);
  stats.hasYear = +(stats.hasYear / n * 100).toFixed(1);
  stats.hasEmoji = +(stats.hasEmoji / n * 100).toFixed(1);
  stats.superlatives = +(stats.superlatives / n * 100).toFixed(1);
  stats.powerWords = Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([w, c]) => `${w} (${c})`);

  return stats;
}

(async () => {
  if (!fs.existsSync(SESSION_FILE)) {
    console.log('❌ Login session yok. Önce: node pinterest-auto.js (login ol)');
    process.exit(1);
  }

  const keyword = process.argv.slice(2).join(' ') || 'beauty bestseller 2026';

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

  // İlk login durumunu kontrol et
  await page.goto('https://www.pinterest.com/', { waitUntil: 'commit', timeout: 30000 });
  await sleep(3000);
  if (page.url().includes('/login')) {
    console.log('❌ Session geçersiz, tekrar login: node pinterest-auto.js');
    await browser.close();
    process.exit(1);
  }

  // Birden çok keyword'ü sırayla araştır (varyasyon için)
  const queries = [
    keyword,
    `${keyword} amazon`,
    `${keyword} aesthetic`,
  ];

  const allPins = [];
  for (const q of queries) {
    const pins = await scrapePinsForKeyword(page, q, 20);
    pins.forEach(p => { if (!allPins.find(x => x.id === p.id)) allPins.push(p); });
    await sleep(1500);
  }

  await browser.close();

  console.log(`\nToplam ${allPins.length} benzersiz pin toplandı.\n`);

  if (!allPins.length) {
    console.log('❌ Pinterest hiç pin döndürmedi (UI değişmiş veya rate-limit).');
    process.exit(1);
  }

  // Pattern analizi
  const titleStats = analyzeTitles(allPins);

  // Dominant ortak hashtag'ler (aria + title)
  const tagPattern = /#(\w+)/g;
  const tagCount = {};
  for (const p of allPins) {
    const txt = (p.title + ' ' + p.aria);
    let m; while ((m = tagPattern.exec(txt)) !== null) {
      const t = m[1].toLowerCase();
      tagCount[t] = (tagCount[t] || 0) + 1;
    }
  }
  const topTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([t, c]) => `#${t} (${c})`);

  const report = {
    query: keyword,
    scrapedAt: new Date().toISOString(),
    totalPins: allPins.length,
    titleStats,
    topHashtags: topTags,
    samplePins: allPins.slice(0, 10).map(p => ({
      title: p.title.substring(0, 80),
      id: p.id,
      url: `https://pinterest.com/pin/${p.id}/`,
      imgUrl: p.imgUrl,
    })),
  };

  if (!fs.existsSync(path.dirname(OUT_FILE))) fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

  // Konsol özeti
  console.log('═'.repeat(64));
  console.log(`PINTEREST ARAŞTIRMA RAPORU · "${keyword}"`);
  console.log('═'.repeat(64));
  console.log(`Pin örnek say.        : ${allPins.length}`);
  console.log(`Ort. başlık uzunluk  : ${titleStats.avgLength} char`);
  console.log(`Rakam ile başlayan   : %${titleStats.startsWithNumber}`);
  console.log(`Soru format          : %${titleStats.questionFormat}`);
  console.log(`Fiyat içeren         : %${titleStats.hasPrice}`);
  console.log(`Yıl içeren           : %${titleStats.hasYear}`);
  console.log(`Emoji içeren         : %${titleStats.hasEmoji}`);
  console.log(`Superlative kelime   : %${titleStats.superlatives}`);
  console.log('');
  console.log('🔥 EN ÇOK GEÇEN KELİMELER (başlık SEO için):');
  console.log('   ' + titleStats.powerWords.slice(0, 10).join(', '));
  console.log('');
  console.log('🏷  EN ÇOK KULLANILAN HASHTAG\'LER:');
  console.log('   ' + (topTags.length ? topTags.join(', ') : '(yok)'));
  console.log('');
  console.log(`📄 Detaylı rapor: ${OUT_FILE}`);
})();
