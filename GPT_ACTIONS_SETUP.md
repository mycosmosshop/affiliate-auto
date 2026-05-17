# Custom GPT Actions Setup

Custom GPT'ye **API çağrısı** ekleyerek senin sistemine canlı bağlantı kur.

## Action 1: Curated Products Endpoint (önerilen başlangıç)

### Adım 1: GitHub Pages deploy

1. **GitHub'a repo oluştur** (zaten varsa atla)
   - github.com → New repository
   - Name: `affiliate-auto`
   - Public ✓
   - Create

2. **curated-products.json'u push et**
   ```bash
   cd "C:\Users\volka\OneDrive\Desktop\Yazılımlar\affiliate-auto"
   git init
   git add data/curated-products.json
   git commit -m "Add curated products"
   git remote add origin https://github.com/USERNAME/affiliate-auto.git
   git push -u origin main
   ```

3. **GitHub Pages aç**
   - Repo → Settings → Pages
   - Source: `main` branch, `/` (root) folder
   - Save → 2 dk sonra URL hazır:
   - `https://USERNAME.github.io/affiliate-auto/data/curated-products.json`

### Adım 2: GPT Actions'a OpenAPI schema yapıştır

ChatGPT → My GPTs → düzenle → **Configure** → **Create new action** → **Schema** alanına:

```yaml
openapi: 3.1.0
info:
  title: Beauty Curated Products API
  version: 1.0.0
  description: Access curated Amazon beauty product collections
servers:
  - url: https://USERNAME.github.io/affiliate-auto
paths:
  /data/curated-products.json:
    get:
      operationId: getCuratedProducts
      summary: Get all curated beauty product collections
      description: Returns list of curated Amazon beauty products with ASINs, prices, and storefront link
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    asin:
                      type: string
                      description: Amazon Standard Identification Number
                    title:
                      type: string
                    price:
                      type: string
                    description:
                      type: string
                    category:
                      type: string
                    affiliateUrlOverride:
                      type: string
                      description: Amazon storefront link
                    collection:
                      type: boolean
                      description: True if this is a multi-product collection
                    collectionItems:
                      type: array
                      items:
                        type: object
                        properties:
                          asin: { type: string }
                          title: { type: string }
```

**`USERNAME`'i GitHub kullanıcı adınla değiştir.**

### Adım 3: System Prompt güncellemesi

Custom GPT system prompt'una ekle:

```
You have access to a live API that returns my latest curated Amazon product collections.

When users ask for product recommendations:
1. ALWAYS call the `getCuratedProducts` action first to fetch the current list
2. Use the returned data to provide specific, up-to-date recommendations
3. Include the affiliateUrlOverride for each collection (it's the storefront link)
4. Mention specific ASINs from collectionItems when recommending individual products

This ensures recommendations are always current and link to my live storefront.
```

### Test
GPT'de sor: "What are your current top beauty picks?"
GPT call → API → curated-products.json → yanıt = senin güncel listenle birlikte.

---

## Action 2: Amazon Live Price Lookup (gelişmiş)

Amazon Product Advertising API (PA-API) gerekiyor. Setup:

1. amazon.com/associates → Account → "Manage Tracking IDs" → "Programmatic Access"
2. **Access Key + Secret** al
3. **AWS Signed Request** lazım (kompleks, OAuth2 değil HMAC-SHA256)
4. Genelde middleware backend lazım (Vercel function veya AWS Lambda)

**Daha basit alternatif:** **RapidAPI** üzerinden Amazon data
- rapidapi.com → "Real Time Amazon Data" gibi public API'ler
- Free tier: ~500 istek/ay
- OpenAPI schema kolay yazılır

```yaml
openapi: 3.1.0
info:
  title: Amazon Product Data
  version: 1.0.0
servers:
  - url: https://real-time-amazon-data.p.rapidapi.com
paths:
  /product-details:
    get:
      operationId: getProductDetails
      parameters:
        - name: asin
          in: query
          required: true
          schema: { type: string }
        - name: country
          in: query
          schema: { type: string, default: US }
      responses:
        '200':
          description: Product details
```

**Auth:** Action settings'te `API Key` → header name `X-RapidAPI-Key` → value `YOUR_KEY`

---

## Action 3: Affiliate Link Builder (en basit)

Hiçbir external API'ya ihtiyaç yok — kendin oluştur (Vercel function veya bir web endpoint).

Basit Vercel function (~1 dk):

```js
// api/affiliate-link.js
export default function handler(req, res) {
  const { asin } = req.query;
  if (!asin) return res.status(400).json({ error: 'asin required' });
  const tag = 'mycosmoline-20';
  res.json({
    asin,
    url: `https://www.amazon.com/dp/${asin}?tag=${tag}`,
    storefrontUrl: 'https://www.amazon.com/shop/mycosmoline?ccs_id=91620cab-5b6a-43ba-b5c6-74e74f008993'
  });
}
```

Vercel'a deploy et → URL → GPT Action.

---

## Hangi Action'la başla?

**Önerim:** Action 1 (Curated Products Endpoint) — GitHub Pages'le 5 dakikada bitiyor, GPT senin storefront'unu otomatik tanıyor.

Sonra Action 2/3 eklenebilir.

## Sonuç

GPT'n bu Action'larla:
- "Senin son storefront listende ne var?" → canlı yanıt
- "Şu ASIN için link yap" → affiliate URL döndür
- "Trending olan ne?" → gerçek-zamanlı veri

Pasif gelir akışı: kullanıcılar GPT ile sohbet eder → linkleri görür → storefront'a tıklar → komisyon.
