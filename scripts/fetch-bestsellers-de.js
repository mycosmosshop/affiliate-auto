// Amazon Deutschland bestseller scraper — Playwright (gerçek browser)
//
// Her kategori için bestseller sayfasını açar, ASIN + title + price + image çeker,
// data/products-de.json'a yazar.
//
// Kullanım: node scripts/fetch-bestsellers-de.js

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const TAG = process.env.AMAZON_DE_TAG || "mycosmos0b-21";
const OUT_FILE = path.join(process.cwd(), "data", "products-de.json");

const CATEGORIES = {
  Teknoloji: {
    url: "https://www.amazon.de/gp/bestsellers/ce-de",
    emoji: "🔌",
  },
  Mutfak: {
    url: "https://www.amazon.de/gp/bestsellers/kitchen",
    emoji: "🍳",
  },
  Güzellik: {
    url: "https://www.amazon.de/gp/bestsellers/beauty",
    emoji: "💄",
  },
  "Spor & Sağlık": {
    url: "https://www.amazon.de/gp/bestsellers/sports",
    emoji: "💪",
  },
  "Anne & Bebek": {
    url: "https://www.amazon.de/gp/bestsellers/baby",
    emoji: "👶",
  },
};

// Almanca blacklist
const BLACKLIST = [
  // Bıçaklar
  "messer", "klinge", "knife", "schwert", "axt", "beil",
  "opinel", "rasiermesser", "scheermesser",
  // Tıraş
  "rasierer", "rasur", "gillette", "wilkinson",
  // Silah
  "waffe", "pistole", "gewehr",
  // Bebek bezi
  "windel", "pampers",
  // Yetişkin
  "alkohol", "wein", "zigarette", "tabak", "vape",
  // İlaç
  "rezept", "arznei", "medikament",
  // Canlı
  "hamster", "papagei",
];

function isBlacklisted(title) {
  const t = (title || "").toLowerCase();
  return BLACKLIST.some((kw) => t.includes(kw));
}

(async () => {
  console.log("Amazon.de bestseller scraper başlıyor (Playwright)...\n");
  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-blink-features=AutomationControlled"],
  });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    locale: "de-DE",
    viewport: { width: 1280, height: 900 },
    extraHTTPHeaders: { "Accept-Language": "de-DE,de;q=0.9" },
  });

  // Force EUR currency + Germany location
  await context.addCookies([
    { name: "i18n-prefs", value: "EUR", domain: ".amazon.de", path: "/" },
    { name: "lc-main", value: "de_DE", domain: ".amazon.de", path: "/" },
    // Address-based location (Berlin postcode 10115)
    { name: "session-id-location", value: "10115", domain: ".amazon.de", path: "/" },
  ]);

  const page = await context.newPage();

  const all = [];

  // Önce ana sayfayı ziyaret edip cookie'leri yerleştir + lokasyon set et
  console.log("Önce amazon.de ana sayfayı ziyaret edip lokasyon set ediliyor...");
  await page.goto("https://www.amazon.de/?language=de_DE&currency=EUR", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await page.waitForTimeout(3000);
  // Cookie banner accept
  try {
    await page.click('input[id="sp-cc-accept"]', { timeout: 3000 });
    await page.waitForTimeout(1000);
  } catch {}

  for (const [category, info] of Object.entries(CATEGORIES)) {
    console.log(`▸ ${info.emoji} ${category}: ${info.url}`);
    try {
      await page.goto(info.url + "?language=de_DE&currency=EUR", { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForTimeout(3000);

      // Lazy-load images — biraz scroll yap
      await page.evaluate(() => {
        window.scrollBy(0, 1500);
      });
      await page.waitForTimeout(1500);
      await page.evaluate(() => {
        window.scrollBy(0, 1500);
      });
      await page.waitForTimeout(1500);

      const items = await page.evaluate(() => {
        // Fallback to broader selector if zg-grid yok
        let cards = Array.from(
          document.querySelectorAll("[id='gridItemRoot'], .zg-grid-general-faceout")
        );
        if (cards.length === 0) {
          // Newer layout — find products by ASIN attribute
          cards = Array.from(document.querySelectorAll("[data-asin]"));
        }
        const out = [];
        for (const card of cards) {
          // ASIN
          const asinEl = card.querySelector("[data-asin]");
          const asin =
            asinEl?.getAttribute("data-asin") ||
            card.getAttribute("data-asin") ||
            "";

          // Title — pek çok seçenek
          const title =
            card
              .querySelector(".p13n-sc-truncate-desktop-type2, ._cDEzb_p13n-sc-css-line-clamp-3_g3dy1, .p13n-sc-truncate")
              ?.textContent?.trim() ||
            card.querySelector("a img")?.getAttribute("alt") ||
            "";

          // Price — EUR formatı
          let price = "";
          const priceEl = card.querySelector(
            "._cDEzb_p13n-sc-price_3mJ9Z, .p13n-sc-price, span.a-color-price"
          );
          if (priceEl) price = priceEl.textContent?.trim() || "";

          // Image URL — gerçek high-res
          const img = card.querySelector("img");
          let imageUrl = "";
          if (img) {
            imageUrl =
              img.getAttribute("data-src") ||
              img.getAttribute("src") ||
              "";
            // Boyutu yükselt
            imageUrl = imageUrl.replace(/\._[^.]+_\./, "._SL400_.");
          }

          // Rating
          const ratingText =
            card.querySelector(".a-icon-alt")?.textContent || "";
          const ratingMatch = ratingText.match(/(\d+[,.]?\d*)/);
          const rating = ratingMatch
            ? parseFloat(ratingMatch[1].replace(",", "."))
            : null;

          if (asin && title) {
            out.push({ asin, title, price, imageUrl, rating });
          }
        }
        return out;
      });

      const unique = [];
      const seen = new Set();
      for (const item of items) {
        if (seen.has(item.asin)) continue;
        seen.add(item.asin);
        if (isBlacklisted(item.title)) {
          console.log(`  ⊘ ${item.title.substring(0, 50)}`);
          continue;
        }
        if (unique.length >= 10) break;
        unique.push(item);
      }

      console.log(`  ✓ ${unique.length} ürün`);

      for (const item of unique) {
        const trimmedTitle = item.title.substring(0, 100).replace(/\s+\S*$/, "...");
        all.push({
          asin: item.asin,
          title: trimmedTitle,
          price: item.price || "—",
          rating: item.rating ? item.rating.toFixed(1) : "4.5",
          description: item.title.substring(0, 140).replace(/\s+\S*$/, "..."),
          imageUrl: item.imageUrl,
          affiliateUrl: `https://www.amazon.de/dp/${item.asin}?tag=${TAG}`,
          category,
          emoji: info.emoji,
        });
      }

      await page.waitForTimeout(2000);
    } catch (e) {
      console.log(`  ✗ Hata: ${e.message.substring(0, 80)}`);
    }
  }

  await browser.close();

  if (!all.length) {
    console.log("\n❌ Hiç ürün alınamadı.");
    process.exit(1);
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(all, null, 2));
  console.log("\n" + "═".repeat(50));
  console.log(`✅ ${OUT_FILE} (${all.length} ürün)`);
  console.log("\nÖrnek:");
  console.log(JSON.stringify(all[0], null, 2));
})();
