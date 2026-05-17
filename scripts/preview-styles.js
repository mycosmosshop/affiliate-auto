// Tüm pin stillerini önizle — Pinterest'e yüklemez, sadece PNG üretir
// Kullanım: node scripts/preview-styles.js [ürün-index]
//   node scripts/preview-styles.js          → ilk ürün için 13 stil
//   node scripts/preview-styles.js 2        → 3. ürün için (0-indexed)
//
// Çıktı: ./preview-styles/ klasöründe pin-{style}.png dosyaları

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { generatePinImage, STYLES } = require('../pin-generator');

const PREVIEW_DIR = path.join(process.cwd(), 'preview-styles');
const PRODUCTS_FILE = path.join(process.cwd(), 'data', 'products.json');

(async () => {
  if (!fs.existsSync(PRODUCTS_FILE)) {
    console.log(`❌ ${PRODUCTS_FILE} yok. Önce: node scripts/fetch-bestsellers.js beauty`);
    process.exit(1);
  }

  const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
  const idx = parseInt(process.argv[2] || '0', 10);
  const product = products[idx];
  if (!product) {
    console.log(`❌ Ürün bulunamadı (index ${idx}). Toplam ${products.length} ürün var.`);
    process.exit(1);
  }

  console.log(`Önizleme: ${product.title.substring(0, 70)}`);
  console.log(`${STYLES.length} stil üretilecek → ${PREVIEW_DIR}\n`);

  if (!fs.existsSync(PREVIEW_DIR)) fs.mkdirSync(PREVIEW_DIR, { recursive: true });
  // Eski preview'ları temizle
  fs.readdirSync(PREVIEW_DIR).filter(f => f.endsWith('.png')).forEach(f => {
    fs.unlinkSync(path.join(PREVIEW_DIR, f));
  });

  const browser = await chromium.launch({ headless: true });

  let okCount = 0, failCount = 0;
  for (const style of STYLES) {
    process.stdout.write(`  ▸ ${style.padEnd(22)} `);
    try {
      const { path: tmpPath } = await generatePinImage(product, browser, { style });
      // tmp-pin-images'tan preview-styles'a taşı + isim sade
      const targetPath = path.join(PREVIEW_DIR, `${style}.png`);
      fs.copyFileSync(tmpPath, targetPath);
      fs.unlinkSync(tmpPath);
      console.log('✓');
      okCount++;
    } catch (e) {
      console.log(`✗ ${e.message.substring(0, 50)}`);
      failCount++;
    }
  }

  await browser.close();

  console.log(`\n✅ ${okCount}/${STYLES.length} stil üretildi`);
  if (failCount) console.log(`⚠️  ${failCount} stil başarısız`);
  console.log(`\nKlasörü aç: explorer "${PREVIEW_DIR}"`);
  console.log(`Beğendiğin stili gerçek pin için çalıştır:`);
  console.log(`  $env:PIN_STYLE = "<stil-adı>"; $env:MAX_PINS = "1"; node pinterest-auto.js`);
})();
