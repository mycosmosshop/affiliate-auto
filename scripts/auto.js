// Tek komutluk otomatik pipeline
//   node scripts/auto.js                    → beauty kategorisi, 3 pin
//   node scripts/auto.js electronics 5      → electronics, 5 pin
//   node scripts/auto.js beauty 3 --keywords → Pinterest keyword scraping de yap
//   node scripts/auto.js beauty 3 --replace  → products.json'u sıfırdan yenile
//
// Adımlar:
//   1. Amazon RSS bestseller'ları çek → data/products.json güncelle
//   2. (opsiyonel) Pinterest keyword scraping → her ürüne keywords ekle
//   3. Pinterest'e pin yayınla (random stil rotation)

const { spawn } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
const flags = args.filter(a => a.startsWith('--'));
const positional = args.filter(a => !a.startsWith('--'));

const category = positional[0] || 'beauty';
const maxPins = positional[1] || '3';
const fetchKeywords = flags.includes('--keywords');
const replace = flags.includes('--replace');

function run(cmd, runArgs, env = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, runArgs, {
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd(),
      env: { ...process.env, ...env },
    });
    proc.on('exit', code => code === 0 ? resolve() : reject(new Error(`Exit code ${code}`)));
    proc.on('error', reject);
  });
}

function section(n, total, title) {
  console.log('');
  console.log('━'.repeat(60));
  console.log(`[${n}/${total}] ${title}`);
  console.log('━'.repeat(60));
}

(async () => {
  const totalSteps = fetchKeywords ? 3 : 2;
  console.log('');
  console.log('▼ AUTO PIPELINE');
  console.log(`  kategori : ${category}`);
  console.log(`  maxPins  : ${maxPins}`);
  console.log(`  keywords : ${fetchKeywords ? 'on' : 'off'}`);
  console.log(`  replace  : ${replace ? 'on' : 'off'}`);

  try {
    // STEP 1: Amazon bestsellers
    section(1, totalSteps, `Amazon RSS bestseller'ları çekiliyor (${category})`);
    const fetchArgs = ['scripts/fetch-bestsellers.js', category];
    if (replace) fetchArgs.push('--replace');
    await run('node', fetchArgs);

    // STEP 2 (opsiyonel): Pinterest keywords
    if (fetchKeywords) {
      section(2, totalSteps, 'Pinterest autocomplete keyword scraping');
      try {
        await run('node', ['scripts/fetch-pinterest-keywords.js']);
      } catch (e) {
        console.log(`⚠️  Keyword scraping başarısız: ${e.message} — devam ediliyor`);
      }
    }

    // SON STEP: pin yayınla (random stil)
    section(fetchKeywords ? 3 : 2, totalSteps, `Pinterest'e ${maxPins} pin yayınlanıyor (random stil)`);
    await run('node', ['pinterest-auto.js'], {
      MAX_PINS: maxPins,
      PIN_STYLE: '', // boş = random
    });

    console.log('');
    console.log('═'.repeat(60));
    console.log('✅ PIPELINE TAMAMLANDI');
    console.log('═'.repeat(60));
  } catch (e) {
    console.error('');
    console.error('━'.repeat(60));
    console.error(`❌ PIPELINE BAŞARISIZ: ${e.message}`);
    console.error('━'.repeat(60));
    process.exit(1);
  }
})();
