// Pinterest taslaklarını manuel temizleme scripti
// Kullanım: node scripts/cleanup-drafts.js
// Login session'ı kullanarak pin-creation-tool sayfasına gider, tüm taslakları siler.

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const SESSION_FILE = path.join(process.cwd(), 'pinterest-session.json');
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function cleanupDrafts(page) {
  let deleted = 0;
  const MAX_DELETE = 30;

  for (let i = 0; i < MAX_DELETE; i++) {
    const moreBtns = await page.$$([
      'button[aria-label*="iğer seçenek" i]',
      'button[aria-label*="more option" i]',
      'button[aria-label*="seçenek" i]',
      'button[aria-haspopup="menu"]',
      'button[aria-haspopup="true"]',
    ].join(', '));

    let target = null;
    for (const btn of moreBtns) {
      const visible = await btn.isVisible().catch(() => false);
      if (!visible) continue;
      const box = await btn.boundingBox().catch(() => null);
      if (!box) continue;
      // Sol panel sınırı (x<400, y>200) — header'daki menü butonlarını dışla
      if (box.x < 400 && box.y > 200) {
        target = btn;
        break;
      }
    }
    if (!target) break;

    try {
      await target.click({ timeout: 1500 });
      await sleep(600);

      const delItem = await page.$([
        '[role="menuitem"]:has-text("Sil")',
        '[role="menuitem"]:has-text("Delete")',
        '[role="menuitem"]:has-text("Pin taslağını sil")',
        'div[role="menu"] button:has-text("Sil")',
      ].join(', '));
      if (!delItem) {
        await page.keyboard.press('Escape').catch(() => {});
        break;
      }
      await delItem.click();
      await sleep(800);

      const confirm = await page.$([
        '[role="dialog"] button:has-text("Sil")',
        '[role="dialog"] button:has-text("Delete")',
        '[role="dialog"] button:has-text("Onayla")',
      ].join(', '));
      if (confirm) {
        await confirm.click();
        await sleep(1500);
      }
      deleted++;
      console.log(`  ✓ ${deleted}. taslak silindi`);
    } catch (e) {
      console.log(`  ⚠️  silinemedi: ${e.message.substring(0, 60)}`);
      break;
    }
  }

  return deleted;
}

(async () => {
  if (!fs.existsSync(SESSION_FILE)) {
    console.log('❌ Login session yok. Önce: node pinterest-auto.js ile login ol.');
    process.exit(1);
  }

  console.log('Pinterest taslaklarını temizleme başlıyor...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 80,
    args: ['--disable-blink-features=AutomationControlled'],
  });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'tr-TR',
    viewport: { width: 1280, height: 900 },
  });
  await context.addCookies(JSON.parse(fs.readFileSync(SESSION_FILE)));
  const page = await context.newPage();

  await page.goto('https://www.pinterest.com/pin-creation-tool/', { waitUntil: 'domcontentloaded' });
  await sleep(5000);

  if (page.url().includes('/login')) {
    console.log('❌ Session geçersiz, tekrar login: node pinterest-auto.js');
    await browser.close();
    process.exit(1);
  }

  const count = await cleanupDrafts(page);

  console.log('');
  if (count > 0) {
    console.log(`✅ ${count} taslak silindi`);
  } else {
    console.log('ℹ️  Silinecek taslak yok veya Pinterest UI farklı.');
  }

  await sleep(2000);
  await browser.close();
})();
