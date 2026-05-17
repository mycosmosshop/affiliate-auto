// Pinterest pin görseli üretici
// 5 farklı HTML template, ürün verisi ile doldurulup Playwright ile 1000x1500 PNG export edilir.
// Opsiyonel: OPENAI_API_KEY varsa DALL-E ile lifestyle background üretir ve cache'ler.

const fs = require('fs');
const path = require('path');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const DALLE_BG_DIR = './cache/dalle-bg';
const PIN_OUT_DIR = './tmp-pin-images';

// HTML escape
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// Amazon görseli için hi-res + ASIN fallback URL listesi
function imageCandidates(product) {
  const hi = (product.imageUrl || '').replace(/_(AC_)?S[LX]\d+_/i, '_AC_SL1500_');
  return [
    hi,
    product.imageUrl,
    `https://images-na.ssl-images-amazon.com/images/P/${product.asin}.01.LZZZZZZZ.jpg`,
    `https://images-na.ssl-images-amazon.com/images/P/${product.asin}.01._SCRMZZZZZZ_.jpg`,
  ].filter(Boolean);
}

// JPEG/PNG header'ından width × height parse et — placeholder'lar genelde küçük boyutludur
function readImageDimensions(buf) {
  // PNG: ilk 24 byte'ta SIGNATURE + IHDR
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) {
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  }
  // JPEG: SOF marker'ı bul (0xFFC0..0xFFCF)
  if (buf[0] === 0xFF && buf[1] === 0xD8) {
    let i = 2;
    while (i < buf.length - 9) {
      if (buf[i] !== 0xFF) { i++; continue; }
      const marker = buf[i + 1];
      if (marker >= 0xC0 && marker <= 0xCF && marker !== 0xC4 && marker !== 0xC8) {
        return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
      }
      const segLen = buf.readUInt16BE(i + 2);
      i += 2 + segLen;
    }
  }
  return null;
}

// İlk başarılı VE geçerli URL'i base64 data URI'ye çevirir
// Amazon "no image" placeholder'lar genelde < 3KB ve/veya < 100x100 piksel
async function fetchAsDataUri(urls) {
  const MIN_BYTES = 3000;
  const MIN_DIM = 150;
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const ct = res.headers.get('content-type') || '';
      if (!ct.startsWith('image/')) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < MIN_BYTES) {
        console.log(`  [img] ${url.substring(60, 120)} placeholder (${buf.length}B), skip`);
        continue;
      }
      const dims = readImageDimensions(buf);
      if (dims && (dims.w < MIN_DIM || dims.h < MIN_DIM)) {
        console.log(`  [img] ${url.substring(60, 120)} too small (${dims.w}x${dims.h}), skip`);
        continue;
      }
      return { dataUri: `data:${ct};base64,${buf.toString('base64')}`, sourceUrl: url, dims };
    } catch {}
  }
  return null;
}

// AI-composite: ürün fotoğraf(lar)ını gpt-image-1 image-edit API ile Pinterest pin composite'ine çevir
// Multi-image: product.imageUrls array varsa birden çok foto'yu birleştirir
async function composeAiPin(product) {
  if (!OPENAI_API_KEY) {
    console.log('[AI] OPENAI_API_KEY yok — ai-composite stili kullanılamaz');
    return null;
  }

  const cacheDir = './cache/ai-pins';
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
  const cachePath = path.join(cacheDir, `${product.asin}.png`);
  if (fs.existsSync(cachePath)) {
    console.log(`[AI] cache hit: ${cachePath}`);
    return cachePath;
  }

  // Input image(s) — product.imageUrls (multi) varsa hepsi, yoksa tek imageUrl + ASIN fallback'ler
  const candidates = Array.isArray(product.imageUrls) && product.imageUrls.length
    ? product.imageUrls
    : imageCandidates(product);

  const buffers = [];
  for (const url of candidates) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const ct = res.headers.get('content-type') || '';
      if (!ct.startsWith('image/')) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 15000) continue;
      buffers.push({ buf, ct });
      if (buffers.length >= 5) break; // gpt-image-1 max ~5 input image (collection için)
    } catch {}
  }
  if (!buffers.length) {
    console.log(`[AI] geçerli input image yok (ASIN: ${product.asin})`);
    return null;
  }

  // Pinterest aesthetic prompt — kategori-aware
  const cat = (product.category || 'beauty').toLowerCase();
  const aesthetic = {
    beauty: 'soft pastel pink and cream tones, dewy lighting, instagram-worthy minimalist beauty editorial',
    electronics: 'tech-modern, clean white and accent color, professional product showcase',
    kitchen: 'warm wood tones, natural lighting, food-styling aesthetic',
    fitness: 'energetic bright colors, action-oriented composition',
    all: 'modern editorial, soft gradient, professional advertising photography',
  }[cat] || 'modern editorial, professional advertising photography';

  // Collection mode: multi-product flat-lay collage (Pinterest "roundup" pin tarzı)
  const isCollection = product.collection || (Array.isArray(product.imageUrls) && product.imageUrls.length >= 2);
  const prompt = isCollection
    ? `Pinterest pin design, vertical 1024x1536 format. Create a curated flat-lay collage featuring all the input product photos arranged scattered like an editorial beauty roundup pin. Soft pastel background (sage green, cream, or blush pink). Products clearly visible, well-spaced, with subtle drop shadows under each. Add 2-3 colorful sticker-style callouts in playful colors (sunny yellow, orange, hot pink, lavender) with short text like "WOW", "MUST HAVE", "HOT", "HOTLIST", "NEW", "TOP PICK", "TRENDING". Place a bold central title text like "Amazon Finds" or "Beauty Favorites" in modern sans-serif black/charcoal font. Pinterest beauty influencer aesthetic, instagram-worthy, magazine-quality composition, attractive negative space.`
    : `Pinterest pin design, vertical 1024x1536 format. Place the product photo(s) prominently centered, large and detailed. ${aesthetic}. No text, no words, no logos overlay. Soft drop shadows, subtle decorative elements (organic shapes, soft glow). Magazine cover quality. The product should be the clear focal point with attractive negative space around it.`;

  // Multipart form data — image edit endpoint (gpt-image-1 input image desteği)
  const formData = new FormData();
  formData.append('model', 'gpt-image-1');
  formData.append('prompt', prompt);
  formData.append('size', '1024x1536');
  formData.append('n', '1');
  for (let i = 0; i < buffers.length; i++) {
    const { buf, ct } = buffers[i];
    const ext = ct.includes('png') ? 'png' : 'jpg';
    formData.append('image', new Blob([buf], { type: ct }), `image${i + 1}.${ext}`);
  }

  try {
    const res = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: formData,
    });
    if (!res.ok) {
      const errTxt = (await res.text()).substring(0, 300);
      console.log(`[AI] error ${res.status}: ${errTxt}`);
      return null;
    }
    const data = await res.json();
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) {
      console.log('[AI] response b64_json yok');
      return null;
    }
    fs.writeFileSync(cachePath, Buffer.from(b64, 'base64'));
    console.log(`[AI] composite cached: ${cachePath}`);
    return cachePath;
  } catch (e) {
    console.log(`[AI] fetch failed: ${e.message}`);
    return null;
  }
}

// DALL-E 3 ile lifestyle background üret (ürün başına bir kez, cache'lenir)
async function getDalleBackground(product) {
  if (!OPENAI_API_KEY) return null;
  if (!fs.existsSync(DALLE_BG_DIR)) fs.mkdirSync(DALLE_BG_DIR, { recursive: true });
  const cachePath = path.join(DALLE_BG_DIR, `${product.asin}.png`);

  if (fs.existsSync(cachePath)) {
    const buf = fs.readFileSync(cachePath);
    return `data:image/png;base64,${buf.toString('base64')}`;
  }

  const category = product.category || 'product';
  const prompt = `Soft pastel lifestyle scene, ${category} theme, minimal clean aesthetic, no products visible, no text, no logos, professional advertising background, instagram-worthy, natural lighting, vertical composition`;

  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1', // 2026: dall-e-3 deprecated
        prompt,
        size: '1024x1536', // dikey, pin formatına yakın (gpt-image-1 destekli boyut)
        n: 1,
      }),
    });
    if (!res.ok) {
      console.warn('[DALL-E] error:', res.status, (await res.text()).substring(0, 200));
      return null;
    }
    const data = await res.json();
    const item = data?.data?.[0] || {};
    let buf;
    if (item.b64_json) {
      // gpt-image-1 default response — base64
      buf = Buffer.from(item.b64_json, 'base64');
    } else if (item.url) {
      // dall-e-3 fallback — URL'i indir
      const imgRes = await fetch(item.url);
      buf = Buffer.from(await imgRes.arrayBuffer());
    } else {
      console.warn('[Image] response neither url nor b64_json:', JSON.stringify(data).substring(0, 200));
      return null;
    }
    fs.writeFileSync(cachePath, buf);
    console.log(`[Image] background cached: ${cachePath}`);
    return `data:image/png;base64,${buf.toString('base64')}`;
  } catch (e) {
    console.warn('[DALL-E] fetch failed:', e.message);
    return null;
  }
}

// Multi-word brand listesi — "La Roche-Posay" gibi marka adlarını doğru tanır
const KNOWN_BRANDS = [
  "La Roche-Posay", "Paula's Choice", "Charlotte Tilbury", "Glow Recipe",
  "Rare Beauty", "Peter Thomas Roth", "Clean Skin Club", "Hero Cosmetics",
  "Amazon Basics", "The Ordinary", "Mighty Patch", "Hailey Bieber",
  "Sol de Janeiro", "Drunk Elephant", "Tatcha", "Fenty Beauty",
];

function brandFromTitle(title) {
  if (!title) return '';
  for (const b of KNOWN_BRANDS) {
    if (title.toLowerCase().startsWith(b.toLowerCase())) return b;
  }
  return title.split(/[\s,|]/)[0];
}

// Catchy, 3-7 kelimelik Pinterest hook üret (full title değil)
function generatePinHook(product) {
  if (product.pin_hook) return product.pin_hook;

  const brand = brandFromTitle(product.title);
  const cat = (product.category || '').toLowerCase();

  // Category-specific hooks
  const catHooks = {
    beauty: ['Glow Up Essential', 'Skin Hero', 'K-Beauty Must-Have', 'Pore Genius', 'Cult Favorite', 'Glass Skin Secret'],
    electronics: ['Tech Game-Changer', 'Smart Buy 2026', 'Must-Have Gadget', 'Editor\'s Tech Pick', 'Trending Tech'],
    kitchen: ['Kitchen Game-Changer', 'Chef\'s Secret', 'Everyday Hero', 'Worth The Hype', 'Counter Essential'],
    fitness: ['Home Gym Hero', 'Fitness Must-Have', 'Body Game-Changer', 'Workout Essential'],
    toys: ['Best Gift Ever', 'Kids Approved', 'Trending Toy 2026', 'Holiday Must-Have'],
    books: ['Life-Changing Read', 'Must-Read 2026', 'Bookworm Favorite', 'TBR Top Pick'],
    baby: ['Mom-Approved', 'Baby Essential', 'Nursery Must-Have', 'Genius Baby Find'],
    pet: ['Pet Parent Approved', 'Tail-Wagging Hit', 'Vet Recommended Vibe', 'Pet Must-Have'],
  };

  const generic = ['Internet\'s Obsession', 'TikTok Made Me Buy It', 'Editor\'s Pick', 'Hidden Gem', 'Worth Every Penny', 'You Need This'];
  const pool = catHooks[cat] || generic;

  // %40 ihtimalle brand'i hook'a ekle
  const useBrand = Math.random() < 0.4 && brand && brand.length < 16;
  const base = pool[Math.floor(Math.random() * pool.length)];
  return useBrand ? `${brand}: ${base}` : base;
}

// 15 farklı pin template — Pinterest 2026 trend araştırmasıyla genişletildi
const STYLES = [
  'bold-gradient', 'minimal-premium', 'magazine', 'before-after', 'lifestyle-overlay',
  'collage-grid', 'price-drop', 'quote-overlay', 'y2k-retro',
  'vamp-romantic', 'typography-collage', 'aura-monochrome',
  'traffic-magnet',
  'ai-composite',         // OpenAI gpt-image-1 ile composite — premium, $0.04/pin
  'collection-flatlay',   // Multi-product flat-lay (HTML) — Pinterest "Top Beauty Finds" tarzı
];

function renderTemplate(style, ctx) {
  const { hook, price, rating, productImg, lifestyleBg, brand, brandLong } = ctx;
  // Modern font stack — Inter benzeri sans + serif accent
  const base = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800;900&family=Playfair+Display:wght@700;900&family=Bebas+Neue&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}
      html,body{width:1000px;height:1500px;font-family:'Inter',system-ui,sans-serif;overflow:hidden;color:#1a1a1a;-webkit-font-smoothing:antialiased}
      .card{width:1000px;height:1500px;position:relative;overflow:hidden}
    </style>`;

  // bold-gradient: küçük üst tag → BÜYÜK foto (880x880) → alt bold hook + fiyat
  if (style === 'bold-gradient') {
    return `${base}<div class="card" style="background:radial-gradient(circle at 30% 20%,#FF7B7B 0%,#C9184A 45%,#3D0816 100%);padding:50px;display:flex;flex-direction:column">
      <div style="display:flex;align-items:center;justify-content:space-between;color:#fff;margin-bottom:20px">
        <div style="background:rgba(255,255,255,.15);backdrop-filter:blur(10px);padding:12px 22px;border-radius:50px;font-size:16px;letter-spacing:4px;font-weight:700;text-transform:uppercase">★ Amazon Pick</div>
        <div style="font-size:18px;opacity:.85;letter-spacing:2px">${esc(brand)}</div>
      </div>
      <div style="flex:1;display:flex;align-items:center;justify-content:center">
        <div style="background:#fff;border-radius:48px;padding:40px;box-shadow:0 40px 80px rgba(0,0,0,.4),inset 0 0 0 1px rgba(255,255,255,.6);width:880px;height:880px;display:flex;align-items:center;justify-content:center;transform:rotate(-2deg)">
          <img src="${productImg}" style="max-width:100%;max-height:100%;object-fit:contain"/>
        </div>
      </div>
      <div style="color:#fff;margin-top:20px">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:110px;line-height:.95;letter-spacing:1px;text-shadow:0 6px 30px rgba(0,0,0,.4);text-transform:uppercase">${esc(hook)}</div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:24px">
          <div style="background:#FFD60A;color:#000;padding:18px 34px;border-radius:50px;font-size:48px;font-weight:900;box-shadow:0 14px 40px rgba(255,214,10,.4)">${esc(price)}</div>
          <div style="display:flex;align-items:center;gap:10px;font-size:28px;font-weight:700">⭐ ${esc(rating)}</div>
        </div>
      </div>
    </div>`;
  }

  // minimal-premium: krem üst, koyu alt; ürün asimetrik, serif başlık
  if (style === 'minimal-premium') {
    return `${base}<div class="card" style="background:#F5F1EA;display:flex;flex-direction:column">
      <div style="flex:1;display:flex;align-items:center;justify-content:center;position:relative;padding:60px">
        <div style="position:absolute;top:40px;left:50px;font-family:'Playfair Display',serif;font-style:italic;font-size:22px;letter-spacing:3px;color:#8B6F47;opacity:.7">— ${esc(brand)}</div>
        <img src="${productImg}" style="max-width:780px;max-height:780px;object-fit:contain;filter:drop-shadow(0 40px 60px rgba(0,0,0,.12))"/>
      </div>
      <div style="background:#1A1614;color:#F5F1EA;padding:70px 60px 60px;border-top-left-radius:80px;border-top-right-radius:80px">
        <div style="font-family:'Playfair Display',serif;font-size:84px;font-weight:900;line-height:1.05;letter-spacing:-1px;margin-bottom:34px">${esc(hook)}</div>
        <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(245,241,234,.2);padding-top:28px">
          <div style="font-size:56px;font-weight:300;letter-spacing:1px">${esc(price)}</div>
          <div style="font-size:22px;opacity:.75;letter-spacing:1px">★ ${esc(rating)} · Amazon</div>
        </div>
      </div>
    </div>`;
  }

  // magazine: cover stili — temiz hiyerarşi: header → büyük ürün → alt hook → fiyat ribbon
  if (style === 'magazine') {
    return `${base}<div class="card" style="background:#F0EBE3;display:flex;flex-direction:column;color:#0a0a0a">
      <!-- Üst header bar -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding:40px 50px 20px;flex-shrink:0">
        <div style="font-family:'Playfair Display',serif;font-size:48px;font-weight:900;letter-spacing:-1px">EDIT</div>
        <div style="font-size:14px;letter-spacing:6px;border:1px solid rgba(0,0,0,.4);padding:8px 16px;font-weight:600">ISSUE ${String(new Date().getMonth() + 1).padStart(2, '0')}</div>
      </div>

      <!-- BIG centered product image (ana fokus) -->
      <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:20px 50px;min-height:0">
        <img src="${productImg}" style="max-width:95%;max-height:100%;object-fit:contain;filter:drop-shadow(0 40px 60px rgba(0,0,0,.2))"/>
      </div>

      <!-- Hook ürünün ALTINDA (üstüne değil) -->
      <div style="padding:0 50px 20px;text-align:center">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:115px;line-height:.9;letter-spacing:-1px;text-transform:uppercase">${esc(hook)}</div>
        <div style="margin-top:14px;font-family:'Playfair Display',serif;font-style:italic;font-size:22px;color:#555">— Editor's Pick —</div>
      </div>

      <!-- Alt siyah ribbon (brand + fiyat + rating) -->
      <div style="background:#0a0a0a;color:#F0EBE3;padding:30px 50px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0">
        <div>
          <div style="font-size:14px;letter-spacing:5px;opacity:.6;margin-bottom:4px;font-weight:600">FEATURED</div>
          <div style="font-size:24px;font-weight:800;letter-spacing:-.3px">${esc(brandLong)}</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:'Playfair Display',serif;font-size:56px;font-weight:900;line-height:1">${esc(price)}</div>
          <div style="font-size:13px;opacity:.65;letter-spacing:3px;margin-top:2px">★ ${esc(rating)} RATING</div>
        </div>
      </div>
    </div>`;
  }

  // before-after: split — sol foto, sağ fayda listesi
  if (style === 'before-after') {
    const features = (ctx.features && ctx.features.length ? ctx.features : [
      `★ ${rating}/5 rated`,
      'Cult favorite',
      'Top Amazon pick',
      'Worth the hype',
    ]).slice(0, 4);
    return `${base}<div class="card" style="background:linear-gradient(160deg,#FEF6E4 0%,#F3D2C1 100%);padding:60px;display:flex;flex-direction:column">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:30px">
        <div style="background:#001858;color:#fff;padding:14px 26px;border-radius:50px;font-size:18px;letter-spacing:4px;font-weight:800;text-transform:uppercase">Why It Hits</div>
        <div style="font-size:18px;color:#172C66;letter-spacing:3px;font-weight:700">${esc(brand)}</div>
      </div>
      <div style="background:#fff;border-radius:36px;padding:50px;box-shadow:0 30px 60px rgba(0,24,88,.12);flex:1;display:flex;align-items:center;justify-content:center;margin-bottom:30px">
        <img src="${productImg}" style="max-width:100%;max-height:100%;object-fit:contain"/>
      </div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:110px;line-height:.9;letter-spacing:.5px;color:#001858;text-transform:uppercase;margin-bottom:24px">${esc(hook)}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:24px">
        ${features.map(f => `<div style="background:#fff;border-radius:20px;padding:18px 22px;font-size:22px;font-weight:600;display:flex;align-items:center;gap:14px;color:#001858;box-shadow:0 6px 20px rgba(0,24,88,.06)"><span style="color:#F582AE;font-size:32px;font-weight:900">✓</span>${esc(f)}</div>`).join('')}
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div style="background:#F582AE;color:#fff;padding:18px 38px;border-radius:50px;font-size:46px;font-weight:900;box-shadow:0 14px 30px rgba(245,130,174,.5)">${esc(price)}</div>
        <div style="font-size:24px;color:#001858;font-weight:700">Shop on Amazon →</div>
      </div>
    </div>`;
  }

  // lifestyle-overlay: DALL-E lifestyle bg varsa magazine-cover, yoksa zengin gradient fallback
  if (style === 'lifestyle-overlay') {
    // Fallback: çok katmanlı gradient + decorative bg shapes (DALL-E olmasa bile dolu görünsün)
    const fallbackBg = `
      background:
        radial-gradient(circle at 25% 20%,#FFB88C 0%,transparent 45%),
        radial-gradient(circle at 75% 70%,#DE6262 0%,transparent 50%),
        radial-gradient(circle at 50% 50%,#8B3A3A 0%,transparent 60%),
        linear-gradient(135deg,#2C1810 0%,#4A2C2C 100%)`;
    const bgStyle = lifestyleBg
      ? `background-image:url('${lifestyleBg}');background-size:cover;background-position:center`
      : fallbackBg.replace(/\s+/g, ' ').trim();

    return `${base}<div class="card" style="${bgStyle};position:relative">
      ${!lifestyleBg ? `
        <!-- Decorative shapes (DALL-E yokken sahneyi doldur) -->
        <div style="position:absolute;top:80px;right:-60px;width:320px;height:320px;background:radial-gradient(circle,rgba(255,184,140,.5),transparent 70%);filter:blur(40px)"></div>
        <div style="position:absolute;top:300px;left:-40px;width:280px;height:280px;background:radial-gradient(circle,rgba(255,255,255,.15),transparent 70%);filter:blur(30px)"></div>
        <div style="position:absolute;top:120px;left:50%;transform:translateX(-50%);width:600px;height:600px;border-radius:50%;border:2px solid rgba(255,255,255,.1)"></div>
        <div style="position:absolute;top:170px;left:50%;transform:translateX(-50%);width:500px;height:500px;border-radius:50%;border:2px solid rgba(255,255,255,.08)"></div>
      ` : ''}
      <!-- Dark gradient overlay -->
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.15) 0%,rgba(0,0,0,.0) 30%,rgba(0,0,0,.55) 75%,rgba(0,0,0,.9) 100%)"></div>

      <!-- Top header -->
      <div style="position:absolute;top:50px;left:60px;right:60px;display:flex;align-items:center;justify-content:space-between;color:#fff;z-index:5">
        <div style="background:rgba(255,255,255,.18);backdrop-filter:blur(20px);padding:14px 26px;border-radius:50px;font-size:18px;letter-spacing:4px;font-weight:700">★ AMAZON PICK</div>
        <div style="font-size:20px;letter-spacing:3px;opacity:.9;font-weight:700">${esc(brand)}</div>
      </div>

      <!-- BIG centered product (no white box behind, just shadow + glow) -->
      <div style="position:absolute;top:160px;left:50%;transform:translateX(-50%);width:720px;height:720px;z-index:4;display:flex;align-items:center;justify-content:center">
        <div style="position:absolute;inset:-40px;background:radial-gradient(circle,rgba(255,255,255,.25),transparent 65%);filter:blur(30px)"></div>
        <img src="${productImg}" style="max-width:100%;max-height:100%;object-fit:contain;filter:drop-shadow(0 40px 70px rgba(0,0,0,.7));position:relative"/>
      </div>

      <!-- Bottom content -->
      <div style="position:absolute;bottom:60px;left:60px;right:60px;color:#fff;z-index:5">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:130px;line-height:.9;text-transform:uppercase;text-shadow:0 6px 40px rgba(0,0,0,.8);letter-spacing:1px;margin-bottom:30px">${esc(hook)}</div>
        <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(255,255,255,.35);padding-top:24px">
          <div style="background:#FFD60A;color:#000;padding:18px 36px;border-radius:50px;font-size:46px;font-weight:900;box-shadow:0 12px 30px rgba(255,214,10,.4)">${esc(price)}</div>
          <div style="font-size:22px;letter-spacing:3px;opacity:.95;font-weight:700">★ ${esc(rating)} · SHOP NOW</div>
        </div>
      </div>
    </div>`;
  }

  // collage-grid: 2x2 renkli quadrant grid, ortada ürün foto, çevresinde renk blokları
  if (style === 'collage-grid') {
    const palettes = [
      ['#FFD6E0', '#C7CEEA', '#FFDAC1', '#B5EAD7'],
      ['#FAD2E1', '#BEE1E6', '#FFE5D9', '#E2ECE9'],
      ['#FFCBA4', '#FFAFCC', '#BDE0FE', '#A2D2FF'],
    ];
    const p = palettes[Math.floor(Math.random() * palettes.length)];
    return `${base}<div class="card" style="background:#fff;padding:40px;display:flex;flex-direction:column">
      <div style="text-align:center;font-family:'Bebas Neue',sans-serif;font-size:42px;letter-spacing:8px;color:#333;margin-bottom:20px">${esc(brand)} · 2026</div>
      <div style="flex:1;position:relative;border-radius:32px;overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,.12)">
        <div style="position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr">
          <div style="background:${p[0]}"></div><div style="background:${p[1]}"></div>
          <div style="background:${p[2]}"></div><div style="background:${p[3]}"></div>
        </div>
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">
          <div style="background:#fff;border-radius:32px;padding:30px;width:680px;height:680px;display:flex;align-items:center;justify-content:center;box-shadow:0 30px 70px rgba(0,0,0,.25)">
            <img src="${productImg}" style="max-width:100%;max-height:100%;object-fit:contain"/>
          </div>
        </div>
        <div style="position:absolute;top:30px;left:30px;background:#000;color:#fff;padding:14px 24px;border-radius:50px;font-size:18px;letter-spacing:3px;font-weight:800">NEW IN</div>
        <div style="position:absolute;top:30px;right:30px;background:#fff;padding:14px 24px;border-radius:50px;font-size:18px;font-weight:800">⭐ ${esc(rating)}</div>
      </div>
      <div style="margin-top:30px;display:flex;align-items:center;justify-content:space-between">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:80px;line-height:.95;letter-spacing:.5px;color:#1a1a1a">${esc(hook)}</div>
        <div style="background:#1a1a1a;color:#fff;padding:18px 30px;border-radius:50px;font-size:36px;font-weight:900">${esc(price)}</div>
      </div>
    </div>`;
  }

  // price-drop: eski fiyat üstü çizili + büyük yeni fiyat (discount sinyali)
  if (style === 'price-drop') {
    const dis = ctx.discount || '20% OFF';
    // "Eski fiyat" simüle et: mevcut fiyat × 1.3
    const oldPrice = price.match(/[\d.]+/)
      ? `$${(parseFloat(price.replace(/[^\d.]/g, '')) * 1.3).toFixed(2)}`
      : '';
    return `${base}<div class="card" style="background:linear-gradient(180deg,#FFF5E1 0%,#FFE8A1 100%);padding:50px;display:flex;flex-direction:column">
      <div style="text-align:center">
        <div style="display:inline-block;background:#FF1744;color:#fff;padding:18px 40px;font-family:'Bebas Neue',sans-serif;font-size:48px;letter-spacing:4px;transform:rotate(-3deg);box-shadow:0 12px 30px rgba(255,23,68,.4)">PRICE DROP ALERT</div>
      </div>
      <div style="flex:1;display:flex;align-items:center;justify-content:center;margin:30px 0">
        <div style="background:#fff;border-radius:32px;padding:40px;width:820px;height:820px;display:flex;align-items:center;justify-content:center;box-shadow:0 30px 70px rgba(0,0,0,.18)">
          <img src="${productImg}" style="max-width:100%;max-height:100%;object-fit:contain"/>
        </div>
      </div>
      <div style="text-align:center">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:80px;line-height:.95;color:#1a1a1a;margin-bottom:18px">${esc(hook)}</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:24px">
          ${oldPrice ? `<div style="font-size:48px;color:#999;text-decoration:line-through;font-weight:600">${esc(oldPrice)}</div>` : ''}
          <div style="font-family:'Bebas Neue',sans-serif;font-size:120px;color:#FF1744;line-height:1">${esc(price)}</div>
        </div>
        <div style="margin-top:14px;font-size:24px;font-weight:800;letter-spacing:3px;color:#1a1a1a">${esc(dis)} · LIMITED TIME</div>
      </div>
    </div>`;
  }

  // quote-overlay: büyük testimonial quote + ürün + sosyal kanıt
  if (style === 'quote-overlay') {
    const quotes = [
      `"Best purchase of 2026, hands down."`,
      `"I can't believe this was under ${price}."`,
      `"Bought it twice — that's how good it is."`,
      `"Worth every single penny."`,
      `"My friends keep asking where I got this."`,
    ];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    return `${base}<div class="card" style="background:#1A1614;color:#F5F1EA;padding:60px;display:flex;flex-direction:column">
      <div style="font-family:'Playfair Display',serif;font-size:200px;line-height:.6;color:#FFD60A;height:80px">"</div>
      <div style="font-family:'Playfair Display',serif;font-size:54px;font-style:italic;line-height:1.15;margin-bottom:30px">${esc(quote)}</div>
      <div style="font-size:18px;letter-spacing:4px;opacity:.6;margin-bottom:30px">— VERIFIED AMAZON BUYER · ★ ${esc(rating)}</div>
      <div style="flex:1;background:#F5F1EA;border-radius:32px;padding:40px;display:flex;align-items:center;justify-content:center;margin-bottom:30px">
        <img src="${productImg}" style="max-width:100%;max-height:100%;object-fit:contain"/>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div>
          <div style="font-size:14px;letter-spacing:5px;opacity:.6">FEATURED</div>
          <div style="font-family:'Bebas Neue',sans-serif;font-size:62px;letter-spacing:1px">${esc(hook)}</div>
        </div>
        <div style="background:#FFD60A;color:#000;padding:18px 32px;border-radius:50px;font-size:42px;font-weight:900">${esc(price)}</div>
      </div>
    </div>`;
  }

  // y2k-retro: 2026 trend Y2K stili — pastel + sticker'lar + chunky shapes
  if (style === 'y2k-retro') {
    return `${base}<div class="card" style="background:linear-gradient(135deg,#FFB6E1 0%,#A0E7E5 50%,#B4F8C8 100%);padding:50px;position:relative;overflow:hidden">
      <!-- Sticker decorations -->
      <div style="position:absolute;top:30px;right:30px;background:#FFD60A;border-radius:50%;width:140px;height:140px;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:24px;color:#000;transform:rotate(15deg);box-shadow:0 8px 20px rgba(0,0,0,.15);font-weight:900;text-align:center;line-height:1">NEW<br>2026</div>
      <div style="position:absolute;top:340px;left:30px;background:#FF6B9D;color:#fff;padding:10px 18px;border-radius:30px;font-size:18px;font-weight:900;letter-spacing:2px;transform:rotate(-8deg);box-shadow:0 6px 18px rgba(255,107,157,.4)">★ MUST HAVE</div>
      <div style="position:absolute;bottom:380px;right:60px;font-family:'Bebas Neue',sans-serif;font-size:50px;color:#fff;transform:rotate(8deg);text-shadow:3px 3px 0 #FF6B9D">cute!</div>

      <div style="text-align:center;margin-bottom:20px">
        <div style="display:inline-block;background:rgba(255,255,255,.6);backdrop-filter:blur(10px);padding:12px 24px;border-radius:50px;font-size:18px;letter-spacing:5px;font-weight:800;color:#000">${esc(brand)}</div>
      </div>
      <div style="display:flex;align-items:center;justify-content:center;height:780px">
        <div style="background:#fff;border:6px solid #1a1a1a;border-radius:48px;padding:40px;width:720px;height:720px;display:flex;align-items:center;justify-content:center;box-shadow:12px 12px 0 #1a1a1a;transform:rotate(-3deg)">
          <img src="${productImg}" style="max-width:100%;max-height:100%;object-fit:contain"/>
        </div>
      </div>
      <div style="margin-top:30px;text-align:center">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:120px;line-height:.9;color:#1a1a1a;text-shadow:5px 5px 0 #FFD60A;text-transform:uppercase">${esc(hook)}</div>
        <div style="margin-top:20px;display:inline-block;background:#1a1a1a;color:#fff;padding:18px 36px;border-radius:50px;font-family:'Bebas Neue',sans-serif;font-size:54px;letter-spacing:2px">${esc(price)} · SHOP NOW</div>
      </div>
    </div>`;
  }

  // vamp-romantic: 2026 trend Vamp aesthetic — full-bleed product, satin gradient, magazine cover
  if (style === 'vamp-romantic') {
    return `${base}<div class="card" style="background:#0E0509;position:relative">
      <!-- Satin gradient background -->
      <div style="position:absolute;inset:0;background:
          radial-gradient(ellipse at 30% 30%,#5A1F35 0%,transparent 50%),
          radial-gradient(ellipse at 70% 70%,#3D0E25 0%,transparent 50%),
          linear-gradient(160deg,#2A0E1A 0%,#0E0509 100%)"></div>
      <!-- Soft cherry glow behind product -->
      <div style="position:absolute;top:200px;left:50%;transform:translateX(-50%);width:900px;height:900px;background:radial-gradient(circle,rgba(168,36,58,.55) 0%,transparent 65%);filter:blur(60px)"></div>
      <!-- Gold hairline frame -->
      <div style="position:absolute;inset:30px;border:1px solid rgba(212,175,127,.35);pointer-events:none;z-index:5"></div>

      <!-- Top header -->
      <div style="position:absolute;top:60px;left:60px;right:60px;display:flex;justify-content:space-between;align-items:center;color:#D4AF7F;font-family:'Inter',sans-serif;font-size:14px;letter-spacing:8px;font-weight:600;text-transform:uppercase;z-index:6">
        <div>VOL. ${String(Math.floor(Math.random() * 9 + 1)).padStart(2, '0')} · ${new Date().getFullYear()}</div>
        <div>${esc(brand)}</div>
      </div>

      <!-- BIG full-bleed product image -->
      <div style="position:absolute;top:140px;left:50%;transform:translateX(-50%);width:920px;height:920px;z-index:3">
        <img src="${productImg}" style="width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 50px 80px rgba(0,0,0,.8))"/>
      </div>

      <!-- Bottom: massive italic Playfair hook + thin metadata bar -->
      <div style="position:absolute;bottom:80px;left:60px;right:60px;text-align:center;color:#F4E9D8;z-index:6">
        <div style="font-family:'Playfair Display',serif;font-size:140px;font-style:italic;font-weight:900;line-height:.88;letter-spacing:-4px;text-shadow:0 6px 40px rgba(0,0,0,.7);margin-bottom:20px">${esc(hook)}</div>
        <div style="display:inline-flex;align-items:center;gap:30px;border-top:1px solid rgba(212,175,127,.6);border-bottom:1px solid rgba(212,175,127,.6);padding:14px 40px;font-family:'Inter',sans-serif;font-size:14px;letter-spacing:6px;color:#D4AF7F;background:rgba(14,5,9,.4);backdrop-filter:blur(6px)">
          <span style="font-weight:700">★ ${esc(rating)}</span>
          <span style="opacity:.5">·</span>
          <span style="font-size:22px;color:#F4E9D8;font-weight:700">${esc(price)}</span>
          <span style="opacity:.5">·</span>
          <span style="font-weight:700">AMAZON</span>
        </div>
      </div>

      <!-- Vignette darkening edges -->
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 40%,rgba(0,0,0,.5) 100%);pointer-events:none;z-index:4"></div>
    </div>`;
  }

  // typography-collage: ransom-note / scrapbook — karışık fontlar, washi tape, kağıt yırtık
  if (style === 'typography-collage') {
    const words = (hook || 'MUST HAVE').split(/\s+/);
    return `${base}<div class="card" style="background:#FAF6F0;padding:50px;position:relative;overflow:hidden">
      <!-- background paper noise -->
      <div style="position:absolute;inset:0;background-image:repeating-linear-gradient(45deg,transparent,transparent 2px,rgba(0,0,0,.015) 2px,rgba(0,0,0,.015) 3px);pointer-events:none"></div>

      <!-- left: layered scrapbook text -->
      <div style="position:relative;height:100%;display:flex">
        <div style="flex:1;position:relative;padding-top:60px">
          <!-- washi tape strip -->
          <div style="position:absolute;top:20px;left:-30px;width:160px;height:34px;background:#3A5F4A;transform:rotate(-12deg);opacity:.85"></div>
          <!-- mixed-font hook words -->
          <div style="position:relative">
            ${words.map((w, i) => {
              const fonts = [
                "font-family:'Playfair Display',serif;font-weight:900;font-style:italic",
                "font-family:'Bebas Neue',sans-serif;font-weight:400",
                "font-family:'Inter',sans-serif;font-weight:900;text-transform:lowercase",
                "font-family:'Playfair Display',serif;font-weight:400;text-transform:uppercase;letter-spacing:8px",
              ];
              const sizes = [110, 130, 95, 120];
              const rotates = [-3, 2, -1, 3, 0];
              const colors = ['#1A1614', '#FF4D3D', '#1A1614', '#3A5F4A'];
              const highlights = i % 3 === 1
                ? ';background:linear-gradient(180deg,transparent 55%,#FFD60A 55%,#FFD60A 92%,transparent 92%);padding:0 8px'
                : '';
              return `<div style="${fonts[i % fonts.length]};font-size:${sizes[i % sizes.length]}px;line-height:1;color:${colors[i % colors.length]};transform:rotate(${rotates[i % rotates.length]}deg);display:inline-block;margin:6px 8px 6px 0${highlights}">${esc(w)}</div>`;
            }).join('')}
          </div>
          <!-- doodle arrow -->
          <div style="position:absolute;left:60px;top:480px;font-family:'Inter',sans-serif;font-size:22px;color:#1A1614;font-weight:600;transform:rotate(-8deg)">→ this one</div>
          <!-- handwritten note -->
          <div style="position:absolute;bottom:200px;left:0;background:#FFE5A0;padding:14px 18px;font-family:'Inter',sans-serif;font-size:18px;line-height:1.3;color:#1A1614;max-width:280px;transform:rotate(-4deg);box-shadow:4px 4px 0 rgba(0,0,0,.1)">${esc(brand)} just dropped this and it's worth the hype</div>
          <!-- price stamp -->
          <div style="position:absolute;bottom:60px;left:20px;background:#FF4D3D;color:#fff;padding:18px 26px;font-family:'Bebas Neue',sans-serif;font-size:54px;letter-spacing:2px;transform:rotate(-6deg);box-shadow:6px 6px 0 #1A1614">${esc(price)}</div>
        </div>

        <!-- right: cutout product with paper-tear -->
        <div style="width:460px;position:relative;display:flex;align-items:center;justify-content:center">
          <div style="background:#fff;border:8px solid #1A1614;padding:30px;width:420px;height:520px;display:flex;align-items:center;justify-content:center;transform:rotate(4deg);box-shadow:10px 10px 0 #FF4D3D">
            <img src="${productImg}" style="max-width:100%;max-height:100%;object-fit:contain"/>
          </div>
          <!-- scotch tape -->
          <div style="position:absolute;top:60px;right:30px;width:80px;height:30px;background:rgba(255,255,255,.7);border:1px solid rgba(0,0,0,.1);transform:rotate(35deg)"></div>
          <!-- star sticker -->
          <div style="position:absolute;bottom:60px;left:10px;width:90px;height:90px;background:#FFD60A;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#1A1614;transform:rotate(-15deg);box-shadow:0 4px 12px rgba(0,0,0,.15);text-align:center;line-height:1">★<br>${esc(rating)}</div>
        </div>
      </div>
    </div>`;
  }

  // aura-monochrome: tek renk ailesi her şeyi sarar, radial glow, soft typography
  if (style === 'aura-monochrome') {
    // 4 farklı aura paleti — random seçim
    const auras = [
      { name: 'JADE',     deep: '#1F3A2E', mid: '#3A5F4A', light: '#7FA890', wash: '#D4E5D6' },
      { name: 'CHERRY',   deep: '#5C0A14', mid: '#A8243A', light: '#E07A8C', wash: '#F2C2C8' },
      { name: 'COOL BLUE',deep: '#0D2240', mid: '#1E3A52', light: '#6B8FAE', wash: '#D6E4F0' },
      { name: 'PLUM',     deep: '#2A0E1A', mid: '#4A2C3A', light: '#9B6B8B', wash: '#E4CBD8' },
    ];
    const a = auras[Math.floor(Math.random() * auras.length)];
    return `${base}<div class="card" style="background:radial-gradient(circle at 50% 45%,${a.wash} 0%,${a.light} 50%,${a.mid} 100%);padding:60px;display:flex;flex-direction:column;color:${a.deep}">
      <!-- top arc text -->
      <div style="text-align:center;font-family:'Inter',sans-serif;font-size:22px;letter-spacing:14px;font-weight:800;text-transform:uppercase;margin-bottom:20px;opacity:.75">${a.name} AURA · ${esc(brand)}</div>
      <div style="flex:1;display:flex;align-items:center;justify-content:center;position:relative">
        <!-- aura glow rings -->
        <div style="position:absolute;width:880px;height:880px;border-radius:50%;background:radial-gradient(circle,${a.wash} 0%,transparent 60%);filter:blur(20px)"></div>
        <div style="position:absolute;width:700px;height:700px;border-radius:50%;border:1px solid ${a.deep}33"></div>
        <div style="position:absolute;width:520px;height:520px;border-radius:50%;border:1px solid ${a.deep}22"></div>
        <!-- product floating -->
        <img src="${productImg}" style="max-width:600px;max-height:600px;object-fit:contain;filter:drop-shadow(0 30px 60px ${a.deep}66);position:relative"/>
      </div>
      <!-- centered geometric hook -->
      <div style="text-align:center;margin-top:20px">
        <div style="font-family:'Inter',sans-serif;font-size:96px;font-weight:900;line-height:.95;letter-spacing:-3px;color:${a.deep};text-transform:uppercase">${esc(hook)}</div>
        <div style="margin-top:24px;display:inline-flex;align-items:center;gap:24px;background:${a.deep};color:${a.wash};padding:18px 36px;border-radius:50px;font-family:'Inter',sans-serif;font-weight:700;letter-spacing:3px">
          <span style="font-size:32px">${esc(price)}</span>
          <span style="opacity:.5">·</span>
          <span style="font-size:18px">★ ${esc(rating)}</span>
          <span style="opacity:.5">·</span>
          <span style="font-size:18px">SHOP</span>
        </div>
      </div>
    </div>`;
  }

  // traffic-magnet: Pinterest CTR-optimized — açık zemin, curiosity gap, 3 text band, 1/3 badge
  if (style === 'traffic-magnet') {
    const curiosityPrefixes = [
      'WHY EVERYONE\'S BUYING',
      'WHAT NO ONE TELLS YOU',
      'THE REASON I REORDERED',
      '3 REASONS THIS WORKS',
      'I CAN\'T BELIEVE THE PRICE',
      'TRENDING ON PINTEREST',
    ];
    const ctas = [
      'TAP TO SHOP →',
      'SEE WHY · LINK BELOW',
      'GRAB YOURS · AMAZON',
      'SHOP NOW → AMAZON',
      'CLICK FOR DETAILS →',
    ];
    const prefix = curiosityPrefixes[Math.floor(Math.random() * curiosityPrefixes.length)];
    const cta = ctas[Math.floor(Math.random() * ctas.length)];
    // Renkli accent — 4 palette random
    const palettes = [
      { bg: '#FFF5EC', accent: '#FF3B30', deep: '#1A1614', soft: '#FFD8C2' }, // coral
      { bg: '#FEF7E5', accent: '#F582AE', deep: '#001858', soft: '#FFE8A0' }, // pink+navy
      { bg: '#E8F3EE', accent: '#3A5F4A', deep: '#1A1614', soft: '#C9E4D2' }, // jade
      { bg: '#EEF4FF', accent: '#1E3A52', deep: '#0D2240', soft: '#D6E4F0' }, // cool blue
    ];
    const p = palettes[Math.floor(Math.random() * palettes.length)];

    return `${base}<div class="card" style="background:${p.bg};padding:50px;position:relative;overflow:hidden;color:${p.deep}">
      <!-- decorative blob behind product -->
      <div style="position:absolute;top:240px;left:50%;transform:translateX(-50%);width:780px;height:780px;background:${p.soft};border-radius:50%;opacity:.7"></div>
      <div style="position:absolute;top:200px;right:20px;width:220px;height:220px;background:${p.accent};border-radius:50%;opacity:.15"></div>

      <!-- 1/3 badge top-left -->
      <div style="position:absolute;top:50px;left:50px;background:${p.deep};color:#fff;width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Inter',sans-serif;font-size:24px;font-weight:900;z-index:5;box-shadow:0 8px 20px rgba(0,0,0,.15)">1<span style="font-size:14px;opacity:.7">/3</span></div>
      <!-- Brand top-right -->
      <div style="position:absolute;top:65px;right:50px;font-family:'Inter',sans-serif;font-size:16px;letter-spacing:4px;font-weight:700;z-index:5">${esc(brand)}</div>

      <!-- BAND 1: Curiosity hook (small red label) -->
      <div style="text-align:center;margin-top:60px;position:relative;z-index:5">
        <div style="display:inline-block;background:${p.accent};color:#fff;padding:12px 22px;font-family:'Inter',sans-serif;font-size:18px;font-weight:900;letter-spacing:4px;border-radius:8px;transform:rotate(-1.5deg);box-shadow:0 8px 20px ${p.accent}44">${esc(prefix)}</div>
      </div>

      <!-- BAND 2: Main hook (HUGE) -->
      <div style="text-align:center;margin-top:24px;position:relative;z-index:5">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:140px;line-height:.88;letter-spacing:-1px;color:${p.deep};text-transform:uppercase">${esc(hook)}</div>
      </div>

      <!-- Product image — flatlay style centered -->
      <div style="position:relative;z-index:5;margin-top:30px;display:flex;align-items:center;justify-content:center;height:600px">
        <img src="${productImg}" style="max-width:580px;max-height:580px;object-fit:contain;filter:drop-shadow(0 25px 40px rgba(0,0,0,.18))"/>
        <!-- Curved arrow pointing at product -->
        <div style="position:absolute;left:60px;top:20%;font-family:'Playfair Display',serif;font-style:italic;font-size:34px;color:${p.deep};transform:rotate(-12deg)">try this →</div>
      </div>

      <!-- BAND 3: Bottom — price + CTA bar -->
      <div style="position:absolute;bottom:50px;left:50px;right:50px;z-index:5">
        <div style="background:${p.deep};color:${p.bg};border-radius:24px;padding:24px 32px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 20px 40px rgba(0,0,0,.2)">
          <div style="display:flex;align-items:baseline;gap:12px">
            <div style="font-family:'Bebas Neue',sans-serif;font-size:54px;letter-spacing:1px">${esc(price)}</div>
            <div style="font-size:18px;opacity:.65">on Amazon</div>
          </div>
          <div style="font-family:'Inter',sans-serif;font-size:18px;font-weight:900;letter-spacing:3px;color:${p.bg}">${esc(cta)}</div>
        </div>
        <div style="text-align:center;margin-top:14px;font-family:'Inter',sans-serif;font-size:14px;letter-spacing:5px;color:${p.deep};opacity:.6;font-weight:600">★ ${esc(rating)} · VERIFIED AMAZON BEST SELLER</div>
      </div>
    </div>`;
  }

  // collection-flatlay: 4-5 ürün foto'su scattered, Pinterest "Top Beauty Finds" tarzı
  if (style === 'collection-flatlay') {
    const imgs = ctx.collectionImages || [];
    // 5 ürün için scattered pozisyonlar (krem flat-lay) — Pinterest beauty roundup pin tarzı
    const positions = [
      { top: '90px',  left: '60px',  w: 200, h: 200, rotate: -8 },   // sol üst
      { top: '60px',  right: '90px', w: 220, h: 220, rotate: 5 },    // sağ üst
      { top: '510px', left: '40px',  w: 240, h: 240, rotate: -3 },   // sol alt-orta (büyük)
      { top: '470px', right: '60px', w: 260, h: 260, rotate: 7 },    // sağ alt-orta (büyük)
      { top: '780px', left: '50%',   w: 240, h: 240, rotate: -5, transform: 'translateX(-50%)' }, // alt orta
    ];
    const subtitle = ctx.collectionTitle?.replace(/—.*$/, '').trim() || 'Beauty Finds';

    return `${base}<div class="card" style="background:#FAF6F0;position:relative;overflow:hidden">
      <!-- Dekoratif krem bg detayları (rose petal vibe) -->
      <div style="position:absolute;top:30px;left:50%;transform:translateX(-50%);width:30px;height:30px;background:#F8C4C4;border-radius:50% 0;transform:translateX(-50%) rotate(35deg);opacity:.4"></div>
      <div style="position:absolute;top:300px;left:30px;width:24px;height:24px;background:#E8B4B4;border-radius:50% 0;transform:rotate(-20deg);opacity:.5"></div>
      <div style="position:absolute;top:680px;right:80px;width:28px;height:28px;background:#F8C4C4;border-radius:50% 0;transform:rotate(50deg);opacity:.45"></div>
      <div style="position:absolute;bottom:200px;left:120px;width:22px;height:22px;background:#E8B4B4;border-radius:50% 0;transform:rotate(-15deg);opacity:.5"></div>
      <!-- Subtle texture noise -->
      <div style="position:absolute;inset:0;background-image:radial-gradient(circle at 30% 20%,rgba(248,196,196,.15),transparent 50%),radial-gradient(circle at 70% 70%,rgba(232,180,180,.12),transparent 60%)"></div>

      <!-- Ürün foto'lar scattered yerleştir -->
      ${imgs.slice(0, 5).map((img, i) => {
        const p = positions[i] || positions[0];
        const transform = `rotate(${p.rotate}deg) ${p.transform || ''}`;
        const pos = `top:${p.top};${p.left ? `left:${p.left}` : `right:${p.right}`}`;
        return `<div style="position:absolute;${pos};width:${p.w}px;height:${p.h}px;transform:${transform};z-index:${5 + i}">
          <div style="width:100%;height:100%;background:#fff;border-radius:20px;padding:14px;display:flex;align-items:center;justify-content:center;box-shadow:0 20px 40px rgba(0,0,0,.15)">
            <img src="${img}" style="max-width:100%;max-height:100%;object-fit:contain"/>
          </div>
        </div>`;
      }).join('')}

      <!-- Merkez başlık (Top Amazon Beauty Finds tarzı) -->
      <div style="position:absolute;top:300px;left:50%;transform:translateX(-50%);text-align:center;z-index:20;width:80%">
        <div style="font-family:'Inter',sans-serif;font-size:38px;font-weight:600;color:#7A4444;letter-spacing:2px">Top</div>
        <div style="font-family:'Playfair Display',serif;font-style:italic;font-weight:900;font-size:90px;line-height:1;color:#8B3A3A;margin:8px 0">Amazon<br>Beauty Finds</div>
        <div style="font-family:'Inter',sans-serif;font-size:26px;color:#5A3030;margin-top:14px;letter-spacing:1px">for ${esc(subtitle.replace(/^(Top |Amazon )/i, '').replace(/ — .*$/, ''))}</div>
      </div>

      <!-- Alt info bar -->
      <div style="position:absolute;bottom:40px;left:50%;transform:translateX(-50%);text-align:center;z-index:20;background:#fff;padding:18px 36px;border-radius:50px;box-shadow:0 10px 30px rgba(0,0,0,.12);font-family:'Inter',sans-serif;font-size:22px;font-weight:700;color:#1a1a1a">
        ${esc(price)} · ${imgs.length} curated picks · Amazon
      </div>
    </div>`;
  }

  return `${base}<div class="card" style="background:#fff;padding:60px"><img src="${productImg}" style="width:100%"/><h1>${esc(hook)}</h1></div>`;
}

// Ana fonksiyon: ürün için pin görseli üret, dosya yolunu döndür
async function generatePinImage(product, browser, opts = {}) {
  if (!fs.existsSync(PIN_OUT_DIR)) fs.mkdirSync(PIN_OUT_DIR, { recursive: true });

  // Stil seçimi
  let style = opts.style;
  if (!style || !STYLES.includes(style)) {
    // OpenAI yoksa lifestyle-overlay'i listeden çıkar
    const pool = OPENAI_API_KEY ? STYLES : STYLES.filter(s => s !== 'lifestyle-overlay');
    style = pool[Math.floor(Math.random() * pool.length)];
  }
  console.log(`[PinGen] style: ${style}`);

  // ai-composite: HTML template'i atla, direkt gpt-image-1 ile composite üret
  if (style === 'ai-composite') {
    const aiPath = await composeAiPin(product);
    if (!aiPath) {
      console.log('[PinGen] ai-composite fail, fallback to collection-flatlay (HTML)');
      return generatePinImage(product, browser, { style: 'collection-flatlay' });
    }
    return { path: aiPath, style: 'ai-composite' };
  }

  // collection-flatlay: 5 ürün foto'sunu scattered HTML flat-lay olarak yerleştir
  let collectionImages = null;
  if (style === 'collection-flatlay' && Array.isArray(product.imageUrls) && product.imageUrls.length > 1) {
    collectionImages = [];
    for (const url of product.imageUrls) {
      const single = await fetchAsDataUri([url]);
      if (single) collectionImages.push(single.dataUri);
    }
    console.log(`[PinGen] collection-flatlay: ${collectionImages.length}/${product.imageUrls.length} valid image`);
    if (collectionImages.length < 2) {
      console.log('[PinGen] flatlay için yeterli image yok, fallback bold-gradient');
      return generatePinImage(product, browser, { style: 'bold-gradient' });
    }
  }

  // Ürün görselini data URI olarak yükle
  const imgFetch = await fetchAsDataUri(imageCandidates(product));
  if (!imgFetch) throw new Error(`Ürün görseli alınamadı (ASIN: ${product.asin})`);

  // DALL-E background (sadece lifestyle-overlay için)
  let lifestyleBg = null;
  if (style === 'lifestyle-overlay') {
    lifestyleBg = await getDalleBackground(product);
    if (!lifestyleBg) {
      console.log('[PinGen] DALL-E unavailable, using gradient fallback');
    }
  }

  // Marka kısa (ilk kelime) ve uzun (ilk 4 kelime) — template'ler ikisini de kullanıyor
  const titleWords = (product.title || '').split(/\s+/);
  const brand = (product.brand || titleWords[0] || 'AMAZON').toUpperCase();
  const brandLong = titleWords.slice(0, 4).join(' ');

  const ctx = {
    hook: generatePinHook(product),
    price: product.price || '',
    rating: product.rating || '4.5',
    productImg: imgFetch.dataUri,
    lifestyleBg,
    brand,
    brandLong,
    features: product.features,
    discount: product.discount,
    collectionImages, // multi-image array (collection-flatlay için)
    collectionTitle: product.title,
  };
  console.log(`[PinGen] hook: "${ctx.hook}"`);

  const html = `<!doctype html><html><head><meta charset="utf-8"></head><body>${renderTemplate(style, ctx)}</body></html>`;

  // Yeni context (her pin için izole) + screenshot @2x DPR (keskin sonuç: 2000x3000)
  const ctxBrowser = await browser.newContext({
    viewport: { width: 1000, height: 1500 },
    deviceScaleFactor: 2,
  });
  const page = await ctxBrowser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800); // font/layout settle (Google Fonts gelmesi için)

  const outPath = path.join(PIN_OUT_DIR, `pin-${product.asin}-${style}.png`);
  await page.screenshot({ path: outPath, type: 'png', fullPage: false, omitBackground: false });
  await ctxBrowser.close();

  console.log(`[PinGen] saved: ${outPath}`);
  return { path: outPath, style };
}

module.exports = { generatePinImage, STYLES };
