// TikTok cross-poster — Pinterest pin'lerini TikTok video'ya çevirip upload eder
// 1. Pin PNG → 8 sn MP4 (1080x1920, white pad)
// 2. TikTok web upload (Playwright)
// 3. Caption + hashtag
//
// Kullanım:
//   node scripts/tiktok-cross-post.js                 → en son yayınlanan Pinterest pin'i TikTok'a yolla
//   node scripts/tiktok-cross-post.js [PNG path]      → spesifik PNG'yi upload et

const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const SESSION_FILE = path.join(process.cwd(), 'tiktok-session.json');
const PINS_LOG = path.join(process.cwd(), 'data', 'pins-log.json');
const TMP_DIR = path.join(process.cwd(), 'tmp-tiktok');
const STOREFRONT_URL = process.env.AMAZON_STOREFRONT_URL
  || 'https://www.amazon.com/shop/mycosmoline?ccs_id=91620cab-5b6a-43ba-b5c6-74e74f008993';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ffmpeg ile PNG → MP4
function convertPngToMp4(pngPath, mp4Path, duration = 8) {
  return new Promise((resolve, reject) => {
    const args = [
      '-y', // overwrite
      '-loop', '1',
      '-i', pngPath,
      '-c:v', 'libx264',
      '-t', String(duration),
      '-pix_fmt', 'yuv420p',
      // 1080x1920 portrait, görseli ortala, geri kalan beyaz pad
      '-vf', 'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:white',
      '-r', '30',
      '-movflags', '+faststart',
      mp4Path,
    ];
    console.log(`[ffmpeg] PNG → MP4 (${duration}s, 1080x1920)`);
    const proc = spawn('ffmpeg', args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    proc.stderr.on('data', d => { stderr += d.toString(); });
    proc.on('exit', code => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exit ${code}\n${stderr.slice(-500)}`));
    });
  });
}

// TikTok için caption üret
function buildCaption(pinInfo) {
  const title = pinInfo.hook || pinInfo.productTitle || 'Top Amazon Beauty Find';
  const desc = `${title}\n\nMy curated Amazon beauty picks — link in profile bio or:\n${STOREFRONT_URL}\n\n`;
  // TikTok için 8-15 hashtag (Lemon8/TikTok daha çok hashtag sever)
  const hashtags = [
    '#amazonfinds', '#amazonbeauty', '#beautyfinds', '#skincareroutine',
    '#beautyover40', '#kbeauty', '#viralbeauty', '#beautymusthaves',
    '#amazonshop', '#beautyhack',
  ].join(' ');
  return desc + hashtags;
}

(async () => {
  const argPath = process.argv[2];
  let pngPath, pinInfo;

  if (argPath) {
    pngPath = argPath;
    pinInfo = { hook: path.basename(argPath, '.png'), productTitle: 'Amazon Find' };
  } else {
    // En son yayınlanan pin'i pins-log'tan al
    if (!fs.existsSync(PINS_LOG)) {
      console.log('❌ pins-log.json yok. Önce Pinterest pin yayınla.');
      process.exit(1);
    }
    const log = JSON.parse(fs.readFileSync(PINS_LOG, 'utf8'));
    if (!log.length) {
      console.log('❌ pins-log boş.');
      process.exit(1);
    }
    pinInfo = log[log.length - 1];
    // Pin PNG path = tmp-pin-images/pin-{ASIN}-{style}.png
    pngPath = path.join('tmp-pin-images', `pin-${pinInfo.asin}-${pinInfo.style}.png`);
    if (!fs.existsSync(pngPath)) {
      console.log(`❌ ${pngPath} yok. Pin görseli silinmiş.`);
      process.exit(1);
    }
  }

  console.log(`Pin: ${pngPath}`);
  console.log(`Hook: ${pinInfo.hook}`);

  // 1. PNG → MP4
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
  const mp4Path = path.join(TMP_DIR, path.basename(pngPath, '.png') + '.mp4');
  await convertPngToMp4(pngPath, mp4Path);
  console.log(`✓ MP4 üretildi: ${mp4Path}`);

  // 2. TikTok'a upload
  const browser = await chromium.launch({
    headless: false,
    slowMo: 80,
    args: ['--disable-blink-features=AutomationControlled'],
  });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'en-US',
    viewport: { width: 1280, height: 900 },
  });

  // Session yükle (varsa)
  if (fs.existsSync(SESSION_FILE)) {
    const cookies = JSON.parse(fs.readFileSync(SESSION_FILE));
    await context.addCookies(cookies);
    console.log('Session yüklendi');
  }

  const page = await context.newPage();

  // TikTok upload sayfasına git
  await page.goto('https://www.tiktok.com/tiktokstudio/upload', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(4000);

  // Login kontrol
  if (page.url().includes('/login') || page.url().includes('/tiktokstudio/login')) {
    console.log('⚠️  Login gerekli — tarayıcı açıldı, TikTok hesabınla 90 saniye içinde giriş yap...');
    // 90 sn login için bekle
    await page.waitForURL(/tiktokstudio\/upload|\/upload/, { timeout: 90000 });
    console.log('✓ Login tamamlandı');
    // Session kaydet
    const cookies = await context.cookies();
    fs.writeFileSync(SESSION_FILE, JSON.stringify(cookies, null, 2));
    console.log(`✓ Session kaydedildi: ${SESSION_FILE}`);
    await sleep(3000);
  }

  // File input'a MP4 yolla
  console.log('Video yükleniyor...');
  const fileInput = await page.waitForSelector('input[type="file"]', { state: 'attached', timeout: 30000 });
  await fileInput.setInputFiles(mp4Path);
  console.log('✓ Video upload başladı');

  // Upload tamamlanmasını bekle (caption alanı görünür hale gelir)
  await sleep(10000);

  // Caption alanı — TikTok DraftEditor (contenteditable)
  const caption = buildCaption(pinInfo);
  console.log(`Caption: ${caption.substring(0, 100)}...`);

  const captionEl = await page.waitForSelector(
    '[contenteditable="true"][role="combobox"], [contenteditable="true"][data-text="true"], div[contenteditable="true"]',
    { timeout: 30000 }
  );
  await captionEl.click();
  await sleep(500);
  // Var olan placeholder text'i temizle (ctrl+a + delete)
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  await sleep(300);
  // Yeni caption yaz
  await page.keyboard.type(caption, { delay: 8 });
  console.log('✓ Caption yazıldı');

  // Upload'ın tam bitmesini bekle (video processing)
  console.log('Video processing bekleniyor (30 sn)...');
  await sleep(30000);

  // Publish butonu — TikTok'ta "Post" veya "Yayınla" butonu
  let posted = false;
  const publishCandidates = await page.$$('button');
  for (const btn of publishCandidates) {
    const txt = ((await btn.textContent()) || '').trim();
    if (/^(Post|Publish|Yayınla|Gönder)$/i.test(txt)) {
      const visible = await btn.isVisible().catch(() => false);
      const disabled = await btn.isDisabled().catch(() => false);
      if (!visible || disabled) continue;
      try {
        await btn.click({ timeout: 5000 });
        posted = true;
        console.log(`✓ Tıklandı: "${txt}"`);
        break;
      } catch {}
    }
  }

  if (!posted) {
    await page.screenshot({ path: 'debug-tiktok-no-post.png', fullPage: true });
    throw new Error('Post butonu bulunamadı — debug-tiktok-no-post.png kontrol et');
  }

  // Yayın confirmation bekle
  await sleep(8000);
  console.log('✅ TikTok\'a post yayınlandı');

  await sleep(3000);
  await browser.close();

  // Cleanup MP4
  try { fs.unlinkSync(mp4Path); } catch {}
})().catch(e => {
  console.error('❌', e.message);
  process.exit(1);
});
