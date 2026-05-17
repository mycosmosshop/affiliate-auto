# cosmositio.com Vercel Deploy Rehberi

Next.js site'ı Vercel'a deploy + cosmositio.com domain bağlama. Tamamen bedava.

## Tahmini süre: 15-20 dakika

---

## Adım 1: GitHub'a push (mevcut affiliate-auto repo)

Site dosyaları affiliate-auto repo'sunda master branch'te. Vercel buraya bağlanacak.

### A. Önce master branch'i temizle (sadece site dosyaları)

```bash
cd "C:/Users/volka/OneDrive/Desktop/Yazılımlar/affiliate-auto"
git checkout master
git add src/ data/products-tr.json package.json next.config.ts tsconfig.json
git commit -m "Cosmositio TR site: Next.js + 3 yasal sayfa + Türkçe içerik"
git push origin master
```

### B. Eğer master remote'a push edilmemişse

GitHub'da `mycosmosshop/affiliate-auto` repo'sunda **public-data** branch var (curated JSON).
**master** branch ayrı bir push gerektirir.

```bash
git push -u origin master
```

(İlk push'ta auth iste — daha önce yaptığımız gibi)

---

## Adım 2: Vercel hesap aç + repo bağla

1. **https://vercel.com** aç → **Sign up** (GitHub ile)
2. Hesap oluşturulduktan sonra → **New Project**
3. **Import Git Repository** → `mycosmosshop/affiliate-auto` repo'su listelenir
4. **Import** tıkla

### Build settings (otomatik algılanır)

| Alan | Değer |
|---|---|
| Framework Preset | **Next.js** (otomatik) |
| Root Directory | `.` (default) |
| Build Command | `npm run build` (default) |
| Output Directory | `.next` (default) |
| Install Command | `npm install` (default) |

### Environment Variables (opsiyonel — şu an gerekmez)

Site sadece statik JSON okuyor, env değişkeni şart değil. Sonra eklersin:
- `AMAZON_TR_AFFILIATE_TAG` — Amazon.com.tr Partnernet tag'in

5. **Deploy** tıkla → 1-2 dakika bekle → Vercel URL'in hazır:
   ```
   https://affiliate-auto-xxx.vercel.app
   ```

6. Test et: URL'i aç → Türkçe cosmositio anasayfası görmeli

---

## Adım 3: cosmositio.com domain bağlama

Domain hangi sağlayıcıdan aldın? (GoDaddy / Namecheap / Cloudflare / vb.)

### Vercel tarafı

1. Vercel proje → **Settings** → **Domains**
2. `cosmositio.com` yaz → **Add**
3. Vercel sana 2 seçenek sunar:
   - **A record:** IP `76.76.21.21`
   - **Veya nameservers:** `ns1.vercel-dns.com` + `ns2.vercel-dns.com`

### Domain sağlayıcı tarafı

**A) Sadece A record (basit):**

Domain panelinde DNS bölümüne git → Yeni kayıt ekle:

| Type | Name | Value | TTL |
|---|---|---|---|
| `A` | `@` | `76.76.21.21` | Auto |
| `CNAME` | `www` | `cname.vercel-dns.com` | Auto |

**B) Tüm nameserver Vercel'a yönlendir (önerilen):**

Domain panel → "Nameservers" / "DNS Server" bölümü:
- `ns1.vercel-dns.com`
- `ns2.vercel-dns.com`

Save → 5 dakika - 24 saat DNS propagasyonu.

### Test

```bash
nslookup cosmositio.com
```

`76.76.21.21` veya Vercel IP'leri çıkmalı. Hazır olunca tarayıcıda `cosmositio.com` → Türkçe site.

---

## Adım 4: SSL otomatik

Vercel **Let's Encrypt SSL** otomatik kurar (5 dk - 1 saat). Site **https://cosmositio.com** olarak erişilebilir.

Verify: tarayıcı adres barında 🔒 kilit ikonu görmeli.

---

## Adım 5: Admin panel erişimi

Mevcut Pinterest Dashboard `cosmositio.com/admin` adresine taşındı:
```
https://cosmositio.com/admin
```

Bu sayfa **public** (kimlik doğrulama yok). İleride dashboard auth ekleyebiliriz (NextAuth, Clerk, vb.).

---

## Adım 6: Amazon.com.tr Partnernet onayı için site URL

Amazon.com.tr Partnernet başvuru formunda **"Website URL"** istenir. Buraya:

```
https://cosmositio.com
```

yaz. Sitenin canlı + içerikli (3 yasal sayfa + ürün önerileri) olması başvuru onayını kolaylaştırır.

**Onay sonrası:**
1. Partnernet panel → Tracking ID al (örn. `cosmositio-21` veya `volkanpek-21`)
2. `data/products-tr.json`'da tüm `PLACEHOLDER-21` → gerçek tag ile değiştir:

```bash
cd "C:/Users/volka/OneDrive/Desktop/Yazılımlar/affiliate-auto"
sed -i 's/PLACEHOLDER-21/cosmositio-21/g' data/products-tr.json
git add data/products-tr.json && git commit -m "Real Amazon.com.tr affiliate tag" && git push
```

Vercel otomatik yeniden deploy eder.

---

## Adım 7: SEO (önemli!)

### Google Search Console

1. https://search.google.com/search-console aç
2. **Add property** → `https://cosmositio.com`
3. Verify (Vercel DNS varsa otomatik onaylar)
4. **Submit sitemap:** Next.js otomatik sitemap üretmiyor → manuel ekleme:

```bash
# src/app/sitemap.ts dosyası oluştur (sonra yapılır)
```

### Google Analytics

Vercel proje → Settings → Analytics → ücretsiz tier aktif.
Veya Google Analytics 4 ekleyebilirim, söyle.

---

## Adım 8: Pinterest verification

Pinterest'te **cosmositio.com**'u kanıtlamak için:

1. Pinterest profil → Settings → **Claim website**
2. `cosmositio.com` yaz → DNS TXT record veya meta tag yöntemi
3. Onaylanınca **Pinterest pin'lerinde "claimed by cosmositio.com" rozeti**
4. Pin'lerin trafik analytics'i Pinterest'te görünür

---

## Maliyet özeti

| Hizmet | Maliyet |
|---|---|
| Vercel (Hobby plan) | **Ücretsiz** |
| SSL (Let's Encrypt) | Ücretsiz |
| GitHub repo | Ücretsiz |
| cosmositio.com domain | Senin maliyetin (~$10-15/yıl) |
| **Toplam aylık** | **$0** |

---

## Hata giderme

### Build fail
Vercel build loglarına bak. Genelde:
- `npm install` fail → package.json'da eksik dep
- Type error → `npm run build` lokalde dene

### Domain çalışmıyor
- DNS propagasyonu 5 dk - 24 saat sürer
- nslookup ile kontrol et
- Vercel "Domains" panel'inde ✓ işareti olmalı

### Pinterest pin grid boş
- `data/products-tr.json` dosyası deploy edilmiş mi kontrol et
- Vercel logs'a bak → "ENOENT" hatası varsa dosya commit edilmemiş

---

## Sonraki adımlar (deploy sonrası)

1. ✅ Site canlı → Amazon.com.tr Partnernet başvuru
2. ✅ Pinterest verification
3. ⏳ İçerik: Türkçe blog yazıları ekle (`src/app/blog/...`)
4. ⏳ Sitemap + robots.txt
5. ⏳ Google Analytics + Search Console
6. ⏳ Otomatik pin → blog post (Pinterest pipeline'la entegre)
