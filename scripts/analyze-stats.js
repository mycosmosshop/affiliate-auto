// Pinterest pin performance analyzer
// pins-log.json'daki pinleri ziyaret eder, save/repin sayılarını çeker,
// stil bazında ortalama performans raporlar.
//
// Kullanım: node scripts/analyze-stats.js
// Çıktı: konsol raporu + data/pins-stats.json

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const LOG_FILE = path.join(process.cwd(), 'data', 'pins-log.json');
const STATS_FILE = path.join(process.cwd(), 'data', 'pins-stats.json');
const SESSION_FILE = path.join(process.cwd(), 'pinterest-session.json');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// "1.2K" → 1200, "500" → 500
function parseCount(str) {
  if (!str) return 0;
  const s = String(str).replace(/[.,]/g, '');
  const m = s.match(/(\d+(?:\.\d+)?)\s*([KMmkBb]?)/);
  if (!m) return 0;
  const num = parseFloat(m[1]);
  const mult = { K: 1000, k: 1000, M: 1000000, m: 1000000, B: 1000000000, b: 1000000000 }[m[2]] || 1;
  return Math.round(num * mult);
}

async function getPinStats(page, pinId) {
  await page.goto(`https://www.pinterest.com/pin/${pinId}/`, {
    waitUntil: 'domcontentloaded', timeout: 30000,
  });
  await sleep(2500);

  const result = await page.evaluate(() => {
    const text = document.body.innerText || '';
    // TR + EN — "5 kez kaydedildi", "1.2K saves", "3 repins", "yorumlar (5)"
    const patterns = {
      saves:    /(\d+(?:[.,]\d+)?\s*[KkMm]?)\s*(?:kez\s+)?(?:kaydedil|save|repin)/i,
      comments: /(\d+(?:[.,]\d+)?\s*[KkMm]?)\s*(?:yorum|comment)/i,
      reacts:   /(\d+(?:[.,]\d+)?\s*[KkMm]?)\s*(?:reaction|tepki|beğen)/i,
    };
    const out = {};
    for (const [k, re] of Object.entries(patterns)) {
      const m = text.match(re);
      if (m) out[k] = m[1].trim();
    }
    // Pinterest bazen meta tag'de açık olarak veriyor
    const ogDesc = document.querySelector('meta[property="og:description"]')?.content;
    if (ogDesc) out._ogDesc = ogDesc.substring(0, 200);
    return out;
  });
  return result;
}

(async () => {
  if (!fs.existsSync(LOG_FILE)) {
    console.log(`❌ ${LOG_FILE} yok. Önce pin yayınla: node scripts/auto.js`);
    process.exit(1);
  }
  if (!fs.existsSync(SESSION_FILE)) {
    console.log(`❌ ${SESSION_FILE} yok. Önce: node pinterest-auto.js (login ol)`);
    process.exit(1);
  }

  const log = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
  if (!log.length) {
    console.log('❌ pins-log.json boş.');
    process.exit(1);
  }

  console.log(`${log.length} pin için performans analizi başlıyor...\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 900 },
  });
  await context.addCookies(JSON.parse(fs.readFileSync(SESSION_FILE)));
  const page = await context.newPage();
  await page.goto('https://www.pinterest.com/', { waitUntil: 'domcontentloaded' });
  await sleep(2000);

  const stats = [];
  for (let i = 0; i < log.length; i++) {
    const pin = log[i];
    process.stdout.write(`  [${i + 1}/${log.length}] ${pin.style.padEnd(22)} `);
    try {
      const data = await getPinStats(page, pin.id);
      const saves = parseCount(data.saves);
      const comments = parseCount(data.comments);
      stats.push({ ...pin, saves, comments, reacts: parseCount(data.reacts), raw: data });
      console.log(`saves=${saves} comments=${comments}`);
    } catch (e) {
      stats.push({ ...pin, error: e.message.substring(0, 80) });
      console.log(`✗ ${e.message.substring(0, 40)}`);
    }
    await sleep(1500); // rate limit
  }

  await browser.close();
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));

  // ── Stil bazında performans ranking
  const byStyle = {};
  for (const s of stats) {
    if (s.error) continue;
    const k = s.style || 'unknown';
    if (!byStyle[k]) byStyle[k] = { count: 0, totalSaves: 0, totalComments: 0 };
    byStyle[k].count++;
    byStyle[k].totalSaves += s.saves || 0;
    byStyle[k].totalComments += s.comments || 0;
  }

  const ranked = Object.entries(byStyle)
    .map(([style, d]) => ({
      style,
      pins: d.count,
      totalSaves: d.totalSaves,
      avgSaves: +(d.totalSaves / d.count).toFixed(2),
      totalComments: d.totalComments,
      score: d.totalSaves + d.totalComments * 3, // comments daha değerli
    }))
    .sort((a, b) => b.score - a.score);

  console.log('\n' + '═'.repeat(72));
  console.log('STIL PERFORMANS SIRALAMASI');
  console.log('═'.repeat(72));
  console.log('Sıra  Stil                    Pin   Saves   Yorum   Skor');
  console.log('─'.repeat(72));
  ranked.forEach((r, i) => {
    const medal = i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  ';
    console.log(
      `${medal} ${String(i + 1).padStart(2)}  ${r.style.padEnd(22)} ${String(r.pins).padStart(3)}   ${String(r.totalSaves).padStart(5)}   ${String(r.totalComments).padStart(5)}   ${r.score}`
    );
  });
  console.log('═'.repeat(72));

  if (ranked.length === 0) {
    console.log('\n⚠️  Veri toplanamadı. Yeni yayınlanan pinlerde save count görünmüyor olabilir.');
    console.log('   24 saat sonra tekrar dene.');
  } else {
    const best = ranked[0];
    console.log(`\n🏆 EN İYİ STİL: ${best.style} (avg ${best.avgSaves} saves)`);
    console.log(`\nBu stille daha fazla pin üretmek için:`);
    console.log(`  $env:PIN_STYLE = "${best.style}"`);
    console.log(`  $env:MAX_PINS = "5"`);
    console.log(`  node pinterest-auto.js`);
  }
  console.log(`\n📄 Detaylı veri: ${STATS_FILE}`);
})();
