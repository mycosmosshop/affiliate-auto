const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
const { generatePinImage } = require('./pin-generator');

const AFFILIATE_TAG = process.env.AMAZON_ASSOCIATE_TAG || 'mycosmoline-20';
const EMAIL = process.env.PINTEREST_EMAIL || '';
const PASSWORD = process.env.PINTEREST_PASSWORD || '';
const USERNAME = process.env.PINTEREST_USERNAME || 'mycosmosshop';
const SESSION_FILE = './pinterest-session.json';
const TMP_DIR = './tmp-pin-images';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function downloadImage(url, outPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Image fetch failed: ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outPath, buf);
  return outPath;
}

// Birden çok selector dener, ilk görüneni döner
async function findFirst(page, selectors, perTry = 1500) {
  for (const sel of selectors) {
    try {
      const el = await page.waitForSelector(sel, { timeout: perTry, state: 'visible' });
      if (el) return el;
    } catch {}
  }
  return null;
}

// Sayfayı engelleyen modal/popup'ları kapat (Instagram bağlama, browser ext promo, çerez, vb.)
async function dismissPopups(page) {
  for (let i = 0; i < 4; i++) {
    let closed = false;

    // "Bul. Beğen. Kaydedin." gibi modal'larda sağ üst X butonu — genelde svg/path içerir
    // Sırayla dene: aria-label, data-test-id, dialog içindeki "close" butonu
    const closeBtn = await findFirst(page, [
      '[role="dialog"] [aria-label="Kapat"]',
      '[role="dialog"] [aria-label="Close"]',
      '[role="dialog"] [aria-label="Dismiss"]',
      '[role="dialog"] button[aria-label*="apat" i]',
      '[role="dialog"] button[aria-label*="lose" i]',
      '[data-test-id="dialog-close-button"]',
      '[data-test-id="modal-close-button"]',
      '[aria-label="Kapat"]',
      '[aria-label="Close"]',
    ], 500);
    if (closeBtn) {
      try {
        await closeBtn.click({ timeout: 1500 });
        closed = true;
        console.log('Popup kapatıldı');
        await sleep(800);
      } catch {}
    }

    const overlay = await page.$('[role="dialog"], [data-test-id="modal-overlay"]');
    const overlayVisible = overlay ? await overlay.isVisible().catch(() => false) : false;
    if (!overlayVisible && !closed) break;

    if (!closed && overlayVisible) {
      // Son çare: ESC + sayfa kenarına tıkla (modal dışına)
      await page.keyboard.press('Escape');
      await sleep(400);
      try { await page.mouse.click(10, 10); } catch {}
      await sleep(400);
    }
  }
}

// Pin-creation-tool sayfasında birikmiş taslakları otomatik sil
// Pinterest auto-save ile her başarısız denemede taslak birikiyor; her run'da temizliyoruz.
async function cleanupDrafts(page) {
  let deleted = 0;
  const MAX_DELETE = 20;

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
      // Sol panel: x<400, y>200 (header altında, sol drafts paneli)
      if (box.x < 400 && box.y > 200) {
        target = btn;
        break;
      }
    }
    if (!target) break;

    try {
      await target.click({ timeout: 1500 });
      await sleep(500);
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
      await sleep(700);
      const confirm = await page.$([
        '[role="dialog"] button:has-text("Sil")',
        '[role="dialog"] button:has-text("Delete")',
        '[role="dialog"] button:has-text("Onayla")',
      ].join(', '));
      if (confirm) {
        await confirm.click();
        await sleep(1200);
      }
      deleted++;
    } catch {
      break;
    }
  }

  if (deleted > 0) console.log(`✓ ${deleted} taslak temizlendi`);
}

// ────────────────────────────────────────────────────────────────────────
// Pinterest SEO + GEO yardımcıları
// ────────────────────────────────────────────────────────────────────────

// Multi-word brand listesi (Pinterest'te title'lar genelde "Brand Product Name" şeklinde)
const KNOWN_MULTI_WORD_BRANDS = [
  "La Roche-Posay", "Paula's Choice", "Charlotte Tilbury", "Glow Recipe",
  "Rare Beauty", "Peter Thomas Roth", "Clean Skin Club", "Hero Cosmetics",
  "Amazon Basics", "The Ordinary", "Mighty Patch", "Hailey Bieber",
];

// Brand'i title'dan çıkar — multi-word brand desteği var
function extractBrand(product) {
  if (product.brand) return product.brand.trim();
  const title = (product.title || '').trim();
  if (!title) return '';
  // Önce bilinen multi-word brand'leri kontrol et
  for (const b of KNOWN_MULTI_WORD_BRANDS) {
    if (title.toLowerCase().startsWith(b.toLowerCase())) return b;
  }
  // Default: ilk kelime (eğer makul uzunluksa)
  const first = title.split(/[\s,|]/)[0];
  return first.length >= 2 && first.length <= 20 ? first : '';
}

// Category-spesifik anahtar kelimeler (Pinterest search'te yüksek hacimli)
const CATEGORY_KEYWORDS = {
  beauty:      ['Skincare', 'BeautyFinds', 'GlowUp', 'SelfCareRoutine', 'CleanBeauty', 'KBeauty'],
  electronics: ['TechFinds', 'GadgetLove', 'SmartHome', 'TechDeals', 'TechTrends'],
  kitchen:     ['KitchenGadgets', 'HomeCooking', 'KitchenFinds', 'CookingTips', 'KitchenEssentials'],
  fitness:     ['FitnessJourney', 'HomeWorkout', 'WellnessFinds', 'FitLife', 'HealthyHabits'],
  toys:        ['KidsActivities', 'ToysForKids', 'GiftIdeas', 'PlayTime', 'KidsFinds'],
  books:       ['BookLovers', 'MustRead', 'BookishLife', 'ReadingList', 'BookRecommendations'],
  baby:        ['BabyEssentials', 'NurseryInspo', 'NewMomLife', 'BabyMustHaves', 'MomLife'],
  pet:         ['PetParents', 'DogMom', 'CatMom', 'PetFinds', 'PetCare'],
  garden:      ['GardenInspo', 'OutdoorLiving', 'PlantParents', 'GardenIdeas'],
  tools:       ['DIYProjects', 'HomeImprovement', 'ToolEssentials', 'WorkshopLife'],
  all:         ['AmazonFinds', 'BestSellers', 'ShopSmart'],
};

// GEO hashtag — region'a göre lokal sinyaller
function geoHashtags(region) {
  const r = (region || 'USA').toUpperCase();
  const geoMap = {
    USA:    ['#USABeauty', '#ShopUSA', '#AmericanFinds'],
    UK:     ['#UKBeauty', '#ShopUK', '#BritishFinds'],
    CA:     ['#CanadianFinds', '#ShopCanada'],
    AU:     ['#AustralianBeauty', '#ShopAustralia'],
    TR:     ['#TurkiyeAlisveris', '#TurkiyeKesfet'],
    DE:     ['#DeutschlandFinds', '#ShopDeutschland'],
  };
  return geoMap[r] || [`#${r}Finds`, `#Shop${r}`];
}

// Çoklu kelime → CamelCase hashtag ("korean skincare" → "#KoreanSkincare")
function toHashtag(s) {
  return '#' + s.replace(/[^a-zA-Z0-9 ]/g, '').split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
}

// SEO hashtag bloğu — Pinterest 2026 research: top beauty pin'lerinde HASHTAG %0
// Bu yüzden minimal: 2-3 strategic hashtag, çok daha az gürültü
function generateHashtags(product) {
  const cat = (product.category || 'all').toLowerCase();
  const brand = extractBrand(product).replace(/[^a-zA-Z0-9]/g, '');

  const out = new Set();

  // 1) En sık kullanılan tek broad hashtag — Pinterest top pin'lerinde "AmazonFinds" baskın
  out.add('#AmazonFinds');

  // 2) 1 niche category hashtag (research power keywords'tan)
  const niche = (CATEGORY_KEYWORDS[cat] || CATEGORY_KEYWORDS.all);
  out.add(`#${niche[Math.floor(Math.random() * niche.length)]}`);

  // 3) Brand (varsa, anlamlı) — Pinterest brand search'leri çok güçlü
  if (brand && brand.length >= 3 && brand.length <= 20) out.add(`#${brand}`);

  return Array.from(out).join(' ');
}

// Doğal, Pinterest SEO uyumlu başlık üret — Pinterest research power keywords enjekte
// Top performing kelimeler (research'ten): beauty, amazon, finds, skincare, must-haves, makeup
function generatePinTitle(product) {
  if (product.pin_title) return product.pin_title.substring(0, 100);

  const yr = new Date().getFullYear();
  const brand = extractBrand(product);
  const cat = (product.category || 'product').toLowerCase();
  const title = (product.title || '').replace(/\s+/g, ' ').trim();
  const shortTitle = title.split(' ').slice(0, 6).join(' ').replace(/[,|].*$/, '').trim();

  // Category-spesifik power phrase'ler — Pinterest top pin başlıklarından
  const powerPhrases = {
    beauty:      ['Amazon Beauty Finds', 'Beauty Must-Haves', 'Skincare Routine Essentials', 'Clean Beauty Picks', 'K-Beauty Favorites'],
    electronics: ['Amazon Tech Finds', 'Smart Home Essentials', 'Tech Must-Haves', 'Trending Gadgets'],
    kitchen:     ['Amazon Kitchen Finds', 'Kitchen Essentials', 'Home Cooking Must-Haves', 'Counter Essentials'],
    fitness:     ['Amazon Fitness Finds', 'Home Workout Essentials', 'Wellness Must-Haves'],
    toys:        ['Amazon Kids Finds', 'Toy Must-Haves', 'Gift Ideas'],
    books:       ['Must-Read Books', 'Bookworm Favorites', 'Amazon Book Picks'],
    baby:        ['Baby Essentials', 'Mom-Approved Finds', 'Amazon Baby Picks'],
    pet:         ['Amazon Pet Finds', 'Pet Parent Must-Haves'],
    all:         ['Amazon Finds', 'Best Sellers 2026', 'Trending Now'],
  };
  const pp = powerPhrases[cat] || powerPhrases.all;
  const power = pp[Math.floor(Math.random() * pp.length)];

  // 8 farklı doğal pattern — Pinterest research bulgularına göre optimize edildi
  // Hepsi power phrase + superlative + year sinyalini doğal şekilde içerir
  const patterns = [
    `${shortTitle} — ${power} for ${yr}`,
    `${power}: Why Everyone Loves ${shortTitle}`,
    `${shortTitle} Is the ${cat} Pick of ${yr} — ${power}`,
    `${power} ${yr}: ${shortTitle} Lives Up to the Hype`,
    `${shortTitle} — A Cult Favorite from ${power}`,
    `${power} Worth Buying: ${shortTitle}`,
    `${brand ? brand : 'Amazon'} ${cat} Hero: ${shortTitle} | ${power}`,
    `${shortTitle}: The ${power} Drop Everyone's Talking About`,
  ];

  const candidate = patterns[Math.floor(Math.random() * patterns.length)];
  return candidate.length > 100 ? candidate.substring(0, 97) + '...' : candidate;
}

// SEO + GEO açıklama: keyword density + GEO sinyali + sistematik hashtag bloğu
// Pinterest 2026: 200-500 char optimal, son satırda 5-8 strategic hashtag
// COLLECTION ürünleri için: 5 ürünün ayrı affiliate link'leriyle birlikte (storefront alternatifi)
function generatePinDescription(product) {
  if (product.pin_description) return product.pin_description;

  // Collection ürünleri için özel description — her ürünün affiliate link'i
  if (product.collection && Array.isArray(product.collectionItems) && product.collectionItems.length) {
    const intro = `${product.title} — ${product.description || 'Curated Amazon picks worth every penny.'}\n\nShop the full edit:\n\n`;
    const items = product.collectionItems.map((it, i) => {
      const url = `https://www.amazon.com/dp/${it.asin}?tag=${AFFILIATE_TAG}`;
      return `${i + 1}. ${it.title}\n${url}`;
    }).join('\n\n');
    const tags = generateHashtags(product);
    return `${intro}${items}\n\n${tags}`;
  }

  const cat = product.category || 'product';
  const reviews = product.reviewCount ? `${product.reviewCount}+ reviews` : 'top reviews';
  const rating = product.rating ? `${product.rating}/5 stars` : 'highly rated';
  const price = product.price || '';
  const region = product.region || 'USA';
  const brand = extractBrand(product);
  const yr = new Date().getFullYear();
  const shortTitle = (product.title || '').split(' ').slice(0, 8).join(' ');

  // 4 farklı doğal şablon (varyasyon spam detection için kritik)
  const bodies = [
    `${shortTitle} is having a major moment right now. ${rating} from ${reviews} on Amazon ${region}, and shoppers can't stop raving. At ${price}, it's the kind of ${cat} find you'll wish you knew about sooner. Fast Prime shipping in the ${region}. Tap to shop the link.`,

    `Looking for the best ${cat} of ${yr}? Real Amazon ${region} shoppers gave ${shortTitle} ${rating} across ${reviews} — and the praise is everywhere on Pinterest. Just ${price}, ships fast with Prime. Click to grab yours before it sells out.`,

    `If you've been searching for a ${cat} that actually delivers, ${shortTitle} is it. ${reviews} on Amazon ${region}, an honest ${rating}, and a price tag of ${price} that won't wreck your budget. ${brand ? brand + " is a name that keeps showing up in beauty routines for a reason. " : ''}Shop it now — link below.`,

    `Pinterest is obsessed with ${shortTitle} and honestly, it's earned. ${rating}, ${reviews}, and a steal at ${price} on Amazon ${region}. Whether you're refreshing your ${cat} routine or hunting for the perfect ${yr} upgrade, this one belongs on your list. Tap to shop.`,
  ];

  const body = bodies[Math.floor(Math.random() * bodies.length)];
  const tags = generateHashtags(product);

  // Body + boş satır + hashtag bloğu (Pinterest hashtag'leri sonda görmek istiyor)
  return `${body}\n\n${tags}`;
}

async function login(context, page) {
  await page.goto('https://www.pinterest.com/login/');
  await sleep(3000);
  await page.fill('input[name="id"]', EMAIL);
  await sleep(600);
  await page.fill('input[name="password"]', PASSWORD);
  await sleep(600);
  await page.press('input[name="password"]', 'Enter');
  await sleep(8000);
  const url = page.url();
  if (url.includes('login')) throw new Error('Login failed');
  console.log('Login OK:', url);
  const cookies = await context.cookies();
  fs.writeFileSync(SESSION_FILE, JSON.stringify(cookies));
}

async function createPin(page, product) {
  // Affiliate URL — öncelik: product.affiliateUrlOverride > PIN_AFFILIATE_URL env > default ASIN link
  const affiliateUrl = product.affiliateUrlOverride
    || process.env.PIN_AFFILIATE_URL
    || `https://www.amazon.com/dp/${product.asin}?tag=${AFFILIATE_TAG}`;
  const title = generatePinTitle(product);
  const desc = generatePinDescription(product);

  console.log('Creating pin:', title.substring(0, 60));

  // 1. Pin görseli üret — pin-generator: 5 stilden biri rastgele, opsiyonel DALL-E bg
  const { path: localImage, style: usedStyle } = await generatePinImage(product, page.context().browser(), {
    style: process.env.PIN_STYLE || undefined, // env'den sabit stil seçilebilir
  });

  // 2. Pin oluşturma sayfasını aç — Pinterest tracking script'leri çok yavaş olduğu için
  //    'commit' kullanıyoruz (sadece URL response gelsin yeter). Sonra explicit selector ile bekleriz.
  let pageReady = false;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await page.goto('https://www.pinterest.com/pin-creation-tool/', {
        waitUntil: 'commit',
        timeout: 30000,
      });
      // URL commit olduktan sonra header'ın yüklenmesini bekle (sayfa render delili)
      await page.waitForSelector('header, [data-test-id="header"], img[alt*="Emma" i]', {
        timeout: 25000,
      }).catch(() => {});
      pageReady = true;
      break;
    } catch (e) {
      console.log(`Pin-creation-tool yükleme deneme ${attempt}/3 başarısız: ${e.message.substring(0, 80)}`);
      if (attempt < 3) await sleep(3000);
    }
  }
  if (!pageReady) {
    throw new Error('Pin-creation-tool sayfası açılamadı (Pinterest yavaş veya session sorunu)');
  }
  await sleep(3000);
  await dismissPopups(page);

  if (!page.url().includes('pin-creation-tool')) {
    await page.screenshot({ path: 'debug-wrong-page.png', fullPage: true });
    throw new Error(`Yanlış sayfaya yönlendirildi: ${page.url()}`);
  }
  console.log('On pin-creation-tool page');

  // Birikmiş taslakları otomatik temizle (sol panelde her draft'ta "..." → Sil)
  await cleanupDrafts(page);

  // File input'a ulaşmak için 3 katmanlı strateji (drafts'lar varsa form gizleniyor)
  async function findFileInput(timeout = 3000) {
    try {
      return await page.waitForSelector('input[type="file"]', { state: 'attached', timeout });
    } catch {
      return null;
    }
  }

  let fileInput = await findFileInput(3000);

  if (!fileInput) {
    console.log('File input yok, "Yeni bir tane oluştur" deneniyor');
    const newPinBtn = await findFirst(page, [
      'button:has-text("Yeni bir tane oluştur"):not([disabled])',
      'button:has-text("Create new"):not([disabled])',
      '[data-test-id="create-new-pin-button"]:not([disabled])',
    ], 1500);
    if (newPinBtn) {
      try {
        await newPinBtn.click({ timeout: 3000 });
        await sleep(2500);
        await dismissPopups(page);
        fileInput = await findFileInput(5000);
      } catch (e) {
        console.log('"Yeni bir tane oluştur" tıklanamadı:', e.message.substring(0, 60));
      }
    }
  }

  if (!fileInput) {
    console.log('Hâlâ file input yok, drafts panelini kapatmayı deniyorum');
    // Sol panelin "<<" collapse butonu
    const collapseBtn = await findFirst(page, [
      'button[aria-label*="Daralt" i]',
      'button[aria-label*="Collapse" i]',
      'button[aria-label*="Drafts" i]',
    ], 1000);
    if (collapseBtn) {
      try { await collapseBtn.click(); await sleep(1500); } catch {}
    }
    fileInput = await findFileInput(3000);
  }

  if (!fileInput) {
    console.log('Son çare: sayfa reload + taze pin-creation-tool');
    // localStorage temizle (Pinterest draft state'i orada tutuyor olabilir)
    await page.evaluate(() => {
      try { localStorage.clear(); sessionStorage.clear(); } catch {}
    }).catch(() => {});
    await page.goto('https://www.pinterest.com/pin-creation-tool/?reset=' + Date.now(), {
      waitUntil: 'domcontentloaded', timeout: 60000
    });
    await sleep(4000);
    await dismissPopups(page);
    fileInput = await findFileInput(15000);
  }

  if (!fileInput) {
    await page.screenshot({ path: 'debug-no-file-input.png', fullPage: true });
    throw new Error('File input bulunamadı (taslakları manuel silmen gerekebilir)');
  }
  await fileInput.setInputFiles(localImage);
  console.log('Image uploaded, waiting for processing...');
  await sleep(6000);

  // 4-6. Başlık → Tab → Açıklama → Tab → Bağlantı
  //      Pinterest placeholder text'leri sık değişiyor. Çok katmanlı arama:
  //      1) Direct selector  2) Label-bazlı DOM walk  3) Tüm editable scan (heuristics)
  async function findTitleField() {
    // Katman 1: bilinen selector'lar (CSS)
    const direct = await findFirst(page, [
      // Yeni placeholder (2026)
      'textarea[placeholder*="Pininizin ne hakkında" i]',
      'textarea[placeholder*="herkese söyleyin" i]',
      'textarea[placeholder*="tell everyone" i]',
      'input[placeholder*="Pininizin ne hakkında" i]',
      'input[placeholder*="herkese söyleyin" i]',
      // Eski placeholder
      'textarea[placeholder*="Başlık" i]',
      'input[placeholder*="Başlık" i]',
      'textarea[placeholder*="Add a title" i]',
      'textarea[placeholder*="title" i]',
      // Aria/data-test
      '[aria-label*="Başlık" i]',
      '[aria-label*="Title" i]',
      '[data-test-id="pin-draft-title"] textarea',
      '[data-test-id="pin-draft-title"] input',
      '[data-test-id="pin-draft-title"] [contenteditable="true"]',
    ], 1500);
    if (direct) return direct;

    // Katman 2: "Başlık"/"Title" label'ı altındaki editable element (DOM walk)
    const labelBased = await page.evaluateHandle(() => {
      const allEls = Array.from(document.querySelectorAll('label, div, span'));
      const label = allEls.find(el => {
        const txt = (el.textContent || '').trim();
        return txt === 'Başlık' || txt === 'Title';
      });
      if (!label) return null;
      // Label'in container'ında editable element bul (yukarı 3 seviye, sonra aşağı tara)
      let scope = label;
      for (let i = 0; i < 4; i++) {
        scope = scope.parentElement;
        if (!scope) break;
        const editable = scope.querySelector(
          'textarea, input[type="text"], input:not([type]), [contenteditable="true"]'
        );
        if (editable) return editable;
      }
      return null;
    });
    if (labelBased) {
      const el = labelBased.asElement();
      if (el) return el;
    }

    // Katman 3: tüm visible editable elementleri tara, heuristics ile title olanı seç
    const allCands = await page.$$('textarea, input[type="text"], input:not([type]), [contenteditable="true"]');
    console.log(`  Tarama: ${allCands.length} editable element bulundu`);
    for (const el of allCands) {
      const visible = await el.isVisible().catch(() => false);
      if (!visible) continue;
      const placeholder = (await el.getAttribute('placeholder').catch(() => '')) || '';
      const ariaLabel = (await el.getAttribute('aria-label').catch(() => '')) || '';
      const sig = (placeholder + ' ' + ariaLabel).toLowerCase();
      if (/başlık|title|pininizin ne|herkese söyleyin|add a title/i.test(sig)) {
        return el;
      }
    }
    // Son çare: en üstteki visible textarea/input (form order)
    for (const el of allCands) {
      const visible = await el.isVisible().catch(() => false);
      if (visible) return el;
    }
    return null;
  }

  let titleEl = await findTitleField();

  // Bulunamadıysa: 3 sn bekle (lazy-load) + bir kez daha dene
  if (!titleEl) {
    console.log('Title bulunamadı, 3 sn bekleyip tekrar deniyor...');
    await sleep(3000);
    titleEl = await findTitleField();
  }

  if (!titleEl) {
    await page.screenshot({ path: 'debug-no-title-field.png', fullPage: true });
    throw new Error('Title field bulunamadı (Pinterest UI değişmiş olabilir)');
  }
  await titleEl.click();
  await sleep(400);
  await page.keyboard.type(title, { delay: 15 });
  console.log('Title typed');

  // Tab → Açıklama
  await page.keyboard.press('Tab');
  await sleep(500);
  await page.keyboard.type(desc, { delay: 8 });
  console.log('Description typed (via Tab)');

  // Tab → Bağlantı
  await page.keyboard.press('Tab');
  await sleep(500);
  await page.keyboard.type(affiliateUrl, { delay: 8 });
  console.log('Link typed (via Tab)');

  // 7. Pano seç — zorunlu, 2 deneme + daha uzun bekleme (UI yavaş olabilir)
  async function selectBoard() {
    const boardBtn = await findFirst(page, [
      'button:has-text("Bir pano seçin")',
      'div[role="combobox"]:has-text("Bir pano seçin")',
      'button:has-text("Bir pano sec")',
      '[data-test-id="board-dropdown-select-button"]',
      'button[data-test-id*="board-dropdown"]',
      'button[aria-label*="Pano" i]',
      'button[aria-label*="board" i]',
    ], 2000);
    if (!boardBtn) return false;

    await boardBtn.click();
    // Daha uzun bekleme — dropdown render + boards loading
    await sleep(3000);

    // Env'de specific board ismi varsa onu seç
    const preferredBoard = process.env.PINTEREST_BOARD_NAME;
    if (preferredBoard) {
      const named = await page.$(`[role="option"]:has-text("${preferredBoard}"), [data-test-id="board-row"]:has-text("${preferredBoard}")`);
      if (named) {
        await named.click();
        console.log(`Board selected: ${preferredBoard}`);
        return true;
      }
    }

    // İlk available board'u seç — birden çok deneme (DOM lazy-load)
    for (let tryNum = 0; tryNum < 3; tryNum++) {
      const opts = await page.$$('[data-test-id="board-row"], [role="option"], [data-test-id="boardWithoutSection"], [role="listbox"] [role="option"]');
      const visibleOpts = [];
      for (const o of opts) {
        if (await o.isVisible().catch(() => false)) visibleOpts.push(o);
      }
      if (visibleOpts.length > 0) {
        await visibleOpts[0].click();
        const txt = (await visibleOpts[0].textContent() || '').trim();
        console.log(`Board selected (first): ${txt.substring(0, 40)}`);
        return true;
      }
      await sleep(1500); // bir kez daha bekle, dropdown geç gelebilir
    }
    return false;
  }

  let boardSelected = await selectBoard();
  if (!boardSelected) {
    console.log('Pano seçimi 1. deneme fail, 3sn bekleyip tekrar denenıyor...');
    // Dropdown belki yarı-açık kaldı, ESC ile kapat ve sıfırla
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(3000);
    boardSelected = await selectBoard();
  }

  if (!boardSelected) {
    await page.screenshot({ path: 'debug-no-board.png', fullPage: true });
    throw new Error('Pano seçilemedi (2 deneme) — pin draft olarak kalır');
  }

  await sleep(1500);
  await page.screenshot({ path: 'debug-before-publish.png' });

  // 8. Yayınla — Playwright locator + has-text (case-insensitive, nested span tolerant)
  let published = false;
  const publishLocator = page.locator('button').filter({ hasText: /^(Yayınla|Publish)$/i });
  const count = await publishLocator.count();
  console.log(`Yayınla button candidates: ${count}`);

  for (let i = 0; i < count; i++) {
    const btn = publishLocator.nth(i);
    const visible = await btn.isVisible().catch(() => false);
    if (!visible) continue;
    const disabled = await btn.isDisabled().catch(() => false);
    if (disabled) {
      console.log(`Candidate ${i}: disabled`);
      continue;
    }
    try {
      await btn.scrollIntoViewIfNeeded({ timeout: 2000 });
      await btn.click({ timeout: 5000, force: false });
      published = true;
      console.log(`Clicked Yayınla (candidate ${i})`);
      break;
    } catch (e) {
      console.log(`Candidate ${i} click failed:`, e.message.substring(0, 100));
      // force ile bir defa daha dene (overlay'i bypass et)
      try {
        await btn.click({ force: true });
        published = true;
        console.log(`Force-clicked Yayınla (candidate ${i})`);
        break;
      } catch {}
    }
  }

  if (!published) {
    // Son çare: data-test-id veya keyboard shortcut
    const dataPublish = await page.$('[data-test-id*="publish" i], [data-test-id*="save-button" i]');
    if (dataPublish) {
      const txt = await dataPublish.textContent();
      console.log('Fallback data-test-id button:', txt);
      try {
        await dataPublish.click({ force: true });
        published = true;
      } catch {}
    }
  }

  if (!published) {
    await page.screenshot({ path: 'debug-publish-missing.png', fullPage: true });
    throw new Error('Yayınla butonu bulunamadı veya disabled');
  }

  // Yayın doğrulama: URL'in pin sayfasına dönmesini veya başarı toast'ını bekle
  let confirmed = false;
  try {
    await Promise.race([
      page.waitForURL(/\/pin\/\d+/, { timeout: 12000 }),
      page.waitForSelector('text=/Pin.*yayınlandı|Pin.*published|Pin.*saved/i', { timeout: 12000 }),
    ]);
    confirmed = true;
  } catch {}

  if (confirmed) {
    let publishedUrl = page.url();
    // Pin ID birden çok kaynaktan dene: URL, toast link, sol panel pin liste linki
    let pinId = (publishedUrl.match(/\/pin\/(\d+)/) || [])[1];
    if (!pinId) {
      // Toast içindeki "Pini görüntüle" link'i veya pin sayfasına yönlendiren herhangi bir a[href*="/pin/"]
      pinId = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href*="/pin/"]'));
        for (const a of links) {
          const m = a.href.match(/\/pin\/(\d{15,})/); // pin ID 15+ haneli sayı
          if (m) return m[1];
        }
        return null;
      }).catch(() => null);
      if (pinId) publishedUrl = `https://www.pinterest.com/pin/${pinId}/`;
    }
    console.log('✅ PIN YAYINLANDI:', publishedUrl);

    // pins-log.json'a kaydet
    const pinIdMatch = pinId ? [null, pinId] : null;
    if (pinIdMatch) {
      const logPath = './data/pins-log.json';
      let log = [];
      try { log = JSON.parse(fs.readFileSync(logPath, 'utf8')); } catch {}
      log.push({
        id: pinIdMatch[1],
        url: publishedUrl,
        asin: product.asin,
        productTitle: product.title,
        category: product.category || 'all',
        style: usedStyle,
        hook: title,
        publishedAt: new Date().toISOString(),
      });
      try {
        if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
        fs.writeFileSync(logPath, JSON.stringify(log, null, 2));
        console.log(`   → pins-log.json'a eklendi (toplam ${log.length})`);
      } catch (e) { console.log('   pin log yazılamadı:', e.message); }
    }
  } else {
    await page.screenshot({ path: 'debug-after-publish.png', fullPage: true });
    console.log('⚠️ Yayınlama doğrulanamadı — debug-after-publish.png kontrol et');
  }
  await sleep(3000);

  // Temizlik
  try { fs.unlinkSync(localImage); } catch {}
}

async function run() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 100,
    args: ['--disable-blink-features=AutomationControlled']
  });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'tr-TR',
    viewport: { width: 1280, height: 900 }
  });

  const page = await context.newPage();

  if (fs.existsSync(SESSION_FILE)) {
    const cookies = JSON.parse(fs.readFileSync(SESSION_FILE));
    await context.addCookies(cookies);
    await page.goto('https://www.pinterest.com/');
    await sleep(3000);
    if (page.url().includes('login')) {
      fs.unlinkSync(SESSION_FILE);
      await login(context, page);
    } else {
      console.log('Session OK');
    }
  } else {
    await login(context, page);
  }

  // Ürünleri data/products.json'dan oku, yayınlanmamış olanları random sırayla seç
  const PRODUCTS_FILE = './data/products.json';
  const LOG_FILE = './data/pins-log.json';
  const MAX_PINS = parseInt(process.env.MAX_PINS || '3', 10);
  if (!fs.existsSync(PRODUCTS_FILE)) {
    throw new Error(`Ürün dosyası yok: ${PRODUCTS_FILE}`);
  }
  const allProducts = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));

  // Spesifik ASIN seçimi — env PIN_PRODUCT_ASIN ile (örn. collection pin için)
  const specificAsin = process.env.PIN_PRODUCT_ASIN;
  let products;
  if (specificAsin) {
    const target = allProducts.find(p => p.asin === specificAsin);
    if (!target) {
      throw new Error(`PIN_PRODUCT_ASIN=${specificAsin} products.json'da yok`);
    }
    console.log(`Spesifik ürün seçildi: ${target.title}`);
    products = [target];
  } else {

  // Daha önce yayınlanan ASIN'leri çıkar
  let publishedAsins = new Set();
  try {
    const log = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
    publishedAsins = new Set(log.map(p => p.asin));
  } catch {}

  const unpublished = allProducts.filter(p => !publishedAsins.has(p.asin));
  // Random shuffle (Fisher-Yates)
  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  if (unpublished.length >= MAX_PINS) {
    products = shuffle(unpublished).slice(0, MAX_PINS);
    console.log(`${products.length} yeni ürün için pin oluşturulacak (${publishedAsins.size} daha önce yayınlandı, ${unpublished.length} yeni mevcut)`);
  } else if (unpublished.length > 0) {
    // Önce yeni olanları al, kalan slot'ları random olarak doldur
    const fillCount = MAX_PINS - unpublished.length;
    const oldRandom = shuffle(allProducts.filter(p => publishedAsins.has(p.asin))).slice(0, fillCount);
    products = [...shuffle(unpublished), ...oldRandom];
    console.log(`${unpublished.length} yeni + ${oldRandom.length} tekrar = ${products.length} ürün (yeni ürünler tükeniyor)`);
  } else {
    // Tüm ürünler yayınlanmış — random tekrar
    products = shuffle(allProducts).slice(0, MAX_PINS);
    console.log(`Tüm ürünler daha önce yayınlandı. ${products.length} ürün random tekrar yayınlanacak.`);
    console.log(`İpucu: yeni ürün için → node scripts/fetch-bestsellers.js <kategori>`);
  }
  } // end else (no specificAsin)

  // Pinterest spam-detection: art arda hızlı pin yayını blocklamaya yol açıyor.
  // Pin'ler arası uzun bekleme (default 30s) + fail durumunda extra cooldown.
  const INTER_PIN_DELAY = parseInt(process.env.INTER_PIN_DELAY || '30000', 10);
  const FAIL_COOLDOWN = parseInt(process.env.FAIL_COOLDOWN || '60000', 10);

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    console.log(`\n━━━ Pin ${i + 1}/${products.length} ━━━`);
    let failed = false;
    try {
      await createPin(page, product);
    } catch (e) {
      console.error('Pin failed:', e.message);
      failed = true;
    }
    // Son pin değilse bekle
    if (i < products.length - 1) {
      const wait = failed ? FAIL_COOLDOWN : INTER_PIN_DELAY;
      console.log(`Bir sonraki pine kadar ${wait / 1000}s bekleniyor (Pinterest rate-limit koruması)...`);
      await sleep(wait);
    }
  }

  await sleep(10000);
  await browser.close();
}

run().catch(e => console.error(e.message));
