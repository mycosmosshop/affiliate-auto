// Amazon TR ürün foto'larını GERÇEK browser (Playwright) ile al
// Static fetch çalışmıyor (Amazon bot detection HTML kısıtlıyor)
// Playwright headless Chrome ile sayfayı tam render eder → landingImage src
//
// Kullanım: node scripts/enrich-tr-playwright.js

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const PRODUCTS_FILE = path.join(process.cwd(), "data", "products-tr.json");

(async () => {
  console.log("Playwright ile Amazon TR image scraping başlıyor...\n");

  const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf8"));
  console.log(`Toplam ürün: ${products.length}\n`);

  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-blink-features=AutomationControlled"],
  });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    locale: "tr-TR",
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  let fixed = 0;
  let failed = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    process.stdout.write(`  [${i + 1}/${products.length}] ${p.asin} `);
    try {
      await page.goto(`https://www.amazon.com.tr/dp/${p.asin}`, {
        waitUntil: "domcontentloaded",
        timeout: 20000,
      });
      // Wait for landingImage to render
      await page.waitForSelector("#landingImage, #imgBlkFront, #imgTagWrapperId img", {
        timeout: 8000,
      });

      const imgSrc = await page.evaluate(() => {
        const sels = [
          "#landingImage",
          "#imgBlkFront",
          "#imgTagWrapperId img",
          "img[data-old-hires]",
        ];
        for (const sel of sels) {
          const el = document.querySelector(sel);
          if (el) {
            const src =
              el.getAttribute("data-old-hires") ||
              el.getAttribute("src") ||
              "";
            if (src && src.includes("media-amazon.com/images/I/")) return src;
          }
        }
        // og:image fallback
        const og = document.querySelector('meta[property="og:image"]');
        return og?.getAttribute("content") || "";
      });

      if (imgSrc && imgSrc.includes("media-amazon.com")) {
        // Boyutu normalize et — _SL400_ ile küçük versiyona çevir
        const normalized = imgSrc.replace(/\._[^.]+_\./, "._SL400_.");
        p.imageUrl = normalized;
        fixed++;
        console.log(`✓ ${normalized.match(/\/I\/([^.]+)/)?.[1].substring(0, 14)}`);
      } else {
        p.imageUrl = "";
        failed++;
        console.log("✗ image bulunamadı (emoji fallback'e geçecek)");
      }
    } catch (e) {
      p.imageUrl = "";
      failed++;
      console.log(`✗ ${e.message.substring(0, 40)}`);
    }
    await page.waitForTimeout(800);
  }

  await browser.close();

  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));

  console.log("\n" + "═".repeat(50));
  console.log(`✅ ${products.length} ürün`);
  console.log(`   ✓ ${fixed} image düzeltildi`);
  console.log(`   ⚠ ${failed} image bulunamadı (emoji)`);
})();
