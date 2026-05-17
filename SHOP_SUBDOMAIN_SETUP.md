# shop.cosmositio.com Subdomain Kurulumu

Cosmositio Türkçe Amazon TR sitesi **shop.cosmositio.com** subdomain'inde yayınlanacak. Cloudflare DNS + Vercel.

**Süre:** ~10 dakika  
**Maliyet:** Bedava

---

## Mimari

```
cosmositio.com           → root (boş şimdilik veya landing page)
shop.cosmositio.com      → Türkiye Amazon TR sitesi (mevcut Next.js app)
www.cosmositio.com       → cosmositio.com'a redirect (opsiyonel)
en.cosmositio.com        → ileride İngilizce versiyon
blog.cosmositio.com      → ileride blog
```

Şimdilik sadece **shop.cosmositio.com** kuracağız.

---

## Adım 1: Vercel'a deploy

(Eğer ilk kez deploy ediyorsan, [COSMOSITIO_DEPLOY.md](COSMOSITIO_DEPLOY.md) Adım 1-2'yi yap önce — repo push + Vercel project create.)

Vercel project URL: `https://affiliate-auto-xxx.vercel.app` (hazır)

---

## Adım 2: Vercel'a shop.cosmositio.com ekle

1. **Vercel dashboard** → projeyi seç (affiliate-auto)
2. **Settings** → **Domains**
3. **Add Domain** → `shop.cosmositio.com` yaz → **Add**
4. Vercel sana iki seçenek gösterir:
   - **CNAME kayıt:** `shop` → `cname.vercel-dns.com` (önerilen)
   - Veya: A record `76.76.21.21`

Vercel "Pending — DNS configuration required" yazar.

---

## Adım 3: Cloudflare'de DNS kaydı ekle

1. https://dash.cloudflare.com aç → **cosmositio.com** zone'una gir
2. Sol panel → **DNS** → **Records**
3. **Add record** tıkla
4. Aşağıdaki bilgileri gir:

| Alan | Değer |
|---|---|
| **Type** | `CNAME` |
| **Name** | `shop` |
| **Target** (Content) | `cname.vercel-dns.com` |
| **Proxy status** | 🟠 **DNS only** (gri bulut) — **PROXIED yapma!** |
| **TTL** | Auto |

**ÖNEMLİ:** Cloudflare proxy (🟠 turuncu bulut) **kapalı** olmalı. Vercel SSL ile çakışır.

5. **Save** tıkla

---

## Adım 4: SSL ve doğrulama bekleme

- **DNS propagation:** 2-30 dakika (genelde Cloudflare çabuk)
- **Vercel SSL:** otomatik Let's Encrypt, 5 dk
- Vercel dashboard'da `shop.cosmositio.com` yanında ✓ yeşil işaret beklenir

Test:
```bash
nslookup shop.cosmositio.com
```

Vercel IP'leri görmeli (`76.76.21.x`).

Tarayıcıda aç: **https://shop.cosmositio.com** → Türkçe site yüklenmeli.

---

## Adım 5: Root domain (cosmositio.com) ne olacak?

3 seçenek var:

### A) Şimdilik shop'a redirect (en pratik)

Vercel proje → Settings → Domains:
1. `cosmositio.com` ekle
2. Vercel "Redirect to" seç → `https://shop.cosmositio.com`
3. Cloudflare'de A record: `cosmositio.com` → `76.76.21.21`

Kullanıcı `cosmositio.com` yazsa → otomatik `shop.cosmositio.com`'a gider.

### B) Root'ta basit landing page

Yeni Vercel project veya aynı project'in farklı path'i. Manual setup gerekir.

### C) Şimdilik root'a dokunma

Sadece `shop.cosmositio.com` çalışır. `cosmositio.com` yazılınca "Site bulunamadı" hatası verir. **En basit ama profesyonel değil.**

**Önerim: A** — shop'a redirect.

---

## Adım 6: Amazon.com.tr Partnernet başvuru

Başvuru formunda website URL olarak:

```
https://shop.cosmositio.com
```

Site **canlı + içerik dolu** olmalı:
- ✅ 3 yasal sayfa (Hakkımızda, Gizlilik, İletişim)
- ✅ 40 ürün listesi
- ✅ Türkçe içerik
- ✅ Partnernet disclaimer footer'da
- ✅ Çerkezköy/Tekirdağ adres (Türk firma sinyali)

---

## Adım 7: Tag aktivasyonu (onay sonrası)

Partnernet onay gelince:

1. Panel'de tracking ID al (örn. `cosmositio-21`)
2. Vercel → Project → Settings → Environment Variables → **Add**:
   ```
   AMAZON_TR_TAG = cosmositio-21
   ```
3. Vercel otomatik redeploy

Tüm `/go/{ASIN}` link'leri otomatik tag'li olur.

Şu an page.tsx **arama URL'i** kullanıyor (`/s?k=...`). Onay sonrası bu URL'lere de tag eklenebilir:

```js
const tag = process.env.AMAZON_TR_TAG ? `&tag=${process.env.AMAZON_TR_TAG}` : '';
href={`https://www.amazon.com.tr/s?k=${encodeURIComponent(p.title)}${tag}`}
```

---

## Mevcut Cloudflare DNS — örnek tam yapı (referans)

cosmositio.com zone'unda olması gereken kayıtlar:

| Type | Name | Content | Proxy |
|---|---|---|---|
| `A` | `cosmositio.com` | `76.76.21.21` (Vercel) | 🟠 DNS only |
| `CNAME` | `shop` | `cname.vercel-dns.com` | 🟠 DNS only |
| `CNAME` | `www` | `cname.vercel-dns.com` | 🟠 DNS only |
| `MX` | `cosmositio.com` | (email kullanıyorsan) | 🟠 DNS only |
| `TXT` | `cosmositio.com` | SPF/DMARC (email için) | — |

İleride ek subdomain:
- `en` → `cname.vercel-dns.com` (İngilizce site için ayrı Vercel project)
- `blog` → blog platformu (ör. Ghost/WordPress)
- `api` → API endpoint'ler

---

## Test komutu

```bash
# DNS doğrulama
nslookup shop.cosmositio.com

# Site erişim testi
curl -I https://shop.cosmositio.com
```

`HTTP/2 200` görürsen site canlı + SSL aktif.

---

## Sorun giderme

### "Invalid DNS configuration"
- Cloudflare'de proxy 🟠 turuncu mu? Onu **gri bulut** (DNS only) yap.
- 30 dakika bekle DNS propagasyonu için.

### "SSL certificate pending"
- Vercel Let's Encrypt çekiyor, 5-15 dk bekle.
- DNS doğru ise otomatik çözülür.

### Site açılıyor ama 404
- Vercel project deploy başarılı mı kontrol et (Vercel dashboard).
- Project yeni push'tan sonra "Building..." aşamasında olabilir.

### Cloudflare 521/522 hata
- Proxy AÇIK (🟠 turuncu bulut). Vercel ile uyumsuz → **DNS only** yap.
