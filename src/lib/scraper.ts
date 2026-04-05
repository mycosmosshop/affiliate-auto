// Amazon Best Sellers scraper — API key gerekmez
// PA API erişimi yokken fallback olarak kullanılır

const ASSOCIATE_TAG = process.env.AMAZON_ASSOCIATE_TAG || 'mycosmoline-20';

export interface ScrapedProduct {
  asin: string;
  title: string;
  price: string;
  rating: string;
  reviewCount: string;
  imageUrl: string;
  productUrl: string;
  affiliateUrl: string;
  category: string;
  description: string;
  isPrime: boolean;
  rank: number;
}

const CATEGORY_URLS: Record<string, string> = {
  all: 'https://www.amazon.com/best-sellers',
  electronics: 'https://www.amazon.com/Best-Sellers-Electronics/zgbs/electronics',
  kitchen: 'https://www.amazon.com/Best-Sellers-Kitchen-Dining/zgbs/kitchen',
  beauty: 'https://www.amazon.com/Best-Sellers-Beauty/zgbs/beauty',
  fitness: 'https://www.amazon.com/Best-Sellers-Sports-Outdoors/zgbs/sporting-goods',
  books: 'https://www.amazon.com/best-sellers-books-Amazon/zgbs/books',
  toys: 'https://www.amazon.com/Best-Sellers-Toys-Games/zgbs/toys-and-games',
  baby: 'https://www.amazon.com/Best-Sellers-Baby/zgbs/baby-products',
  pet: 'https://www.amazon.com/Best-Sellers-Pet-Supplies/zgbs/pet-supplies',
  tools: 'https://www.amazon.com/Best-Sellers-Tools-Home-Improvement/zgbs/hi',
  garden: 'https://www.amazon.com/Best-Sellers-Garden-Outdoor/zgbs/lawn-garden',
};

// ASIN'i URL'den çıkar
function extractAsin(url: string): string {
  const match = url.match(/\/dp\/([A-Z0-9]{10})/);
  return match ? match[1] : '';
}

// HTML içinden ürün bilgilerini parse et
function parseProducts(html: string, category: string): ScrapedProduct[] {
  const products: ScrapedProduct[] = [];

  // ASIN pattern — best seller grid items
  const asinPattern = /data-asin="([A-Z0-9]{10})"/g;
  const titlePattern = /class="[^"]*p13n-sc-truncate[^"]*"[^>]*>([^<]{10,200})</g;
  const pricePattern = /class="[^"]*p13n-sc-price[^"]*"[^>]*>\s*\$?([\d,]+\.?\d*)/g;
  const ratingPattern = /aria-label="([\d.]+) out of 5 stars"/g;
  const reviewPattern = /aria-label="([\d,]+) ratings"/g;
  const imagePattern = /class="[^"]*s-image[^"]*"[^>]*src="(https:\/\/m\.media-amazon\.com\/images\/[^"]+)"/g;

  const asins: string[] = [];
  const titles: string[] = [];
  const prices: string[] = [];
  const ratings: string[] = [];
  const reviews: string[] = [];
  const images: string[] = [];

  let m;

  while ((m = asinPattern.exec(html)) !== null) {
    if (!asins.includes(m[1])) asins.push(m[1]);
  }
  while ((m = titlePattern.exec(html)) !== null) {
    const title = m[1].trim().replace(/\s+/g, ' ');
    if (title.length > 10) titles.push(title);
  }
  while ((m = pricePattern.exec(html)) !== null) {
    prices.push('$' + m[1]);
  }
  while ((m = ratingPattern.exec(html)) !== null) {
    ratings.push(m[1]);
  }
  while ((m = reviewPattern.exec(html)) !== null) {
    reviews.push(m[1]);
  }
  while ((m = imagePattern.exec(html)) !== null) {
    if (!images.includes(m[1])) images.push(m[1]);
  }

  const count = Math.min(asins.length, 10);
  for (let i = 0; i < count; i++) {
    const asin = asins[i];
    if (!asin) continue;

    products.push({
      asin,
      title: titles[i] || `Amazon Best Seller #${i + 1}`,
      price: prices[i] || 'See Price',
      rating: ratings[i] || '4.5',
      reviewCount: reviews[i] || '0',
      imageUrl: images[i] || '',
      productUrl: `https://www.amazon.com/dp/${asin}`,
      affiliateUrl: `https://www.amazon.com/dp/${asin}?tag=${ASSOCIATE_TAG}`,
      category,
      description: titles[i] || '',
      isPrime: true,
      rank: i + 1,
    });
  }

  return products;
}

// Amazon Best Sellers'ı scrape et
export async function scrapeBestSellers(category: string = 'all'): Promise<ScrapedProduct[]> {
  const url = CATEGORY_URLS[category] || CATEGORY_URLS.all;

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0',
  };

  try {
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });

    if (!response.ok) {
      console.warn(`[Scraper] HTTP ${response.status} for ${url}, using demo data`);
      return getDemoProducts(category);
    }

    const html = await response.text();

    // CAPTCHA veya robot kontrolü
    if (html.includes('robot') || html.includes('captcha') || html.includes('Type the characters')) {
      console.warn('[Scraper] Bot detection triggered, using demo data');
      return getDemoProducts(category);
    }

    const products = parseProducts(html, category);

    if (products.length === 0) {
      console.warn('[Scraper] No products parsed, using demo data');
      return getDemoProducts(category);
    }

    console.log(`[Scraper] Found ${products.length} products for ${category}`);
    return products;
  } catch (error) {
    console.error('[Scraper] Error:', error);
    return getDemoProducts(category);
  }
}

// Fallback demo data
function getDemoProducts(category: string): ScrapedProduct[] {
  const demos = [
    {
      asin: 'B09B8YWXDF',
      title: 'Apple AirPods Pro (2nd Generation) Wireless Earbuds',
      price: '$189.99',
      rating: '4.8',
      reviewCount: '45,231',
      imageUrl: 'https://m.media-amazon.com/images/I/51Rqf7FIUEL._SL500_.jpg',
      productUrl: 'https://www.amazon.com/dp/B09B8YWXDF',
      affiliateUrl: `https://www.amazon.com/dp/B09B8YWXDF?tag=${ASSOCIATE_TAG}`,
      category,
      description: 'Active Noise Cancellation, Transparency Mode, Personalized Spatial Audio',
      isPrime: true,
      rank: 1,
      discount: '15%',
    },
    {
      asin: 'B0CHWRXH8B',
      title: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker, 6 Quart',
      price: '$79.99',
      rating: '4.7',
      reviewCount: '123,456',
      imageUrl: 'https://m.media-amazon.com/images/I/71mT2v9LpAL._SL500_.jpg',
      productUrl: 'https://www.amazon.com/dp/B0CHWRXH8B',
      affiliateUrl: `https://www.amazon.com/dp/B0CHWRXH8B?tag=${ASSOCIATE_TAG}`,
      category,
      description: '7-in-1 Multi-Use Programmable Pressure Cooker, Slow Cooker, Rice Cooker',
      isPrime: true,
      rank: 2,
    },
    {
      asin: 'B07ZPKN6YR',
      title: 'Resistance Bands Set - 11 Piece Exercise Bands for Workout',
      price: '$29.99',
      rating: '4.6',
      reviewCount: '78,902',
      imageUrl: 'https://m.media-amazon.com/images/I/81GarGSKRML._SL500_.jpg',
      productUrl: 'https://www.amazon.com/dp/B07ZPKN6YR',
      affiliateUrl: `https://www.amazon.com/dp/B07ZPKN6YR?tag=${ASSOCIATE_TAG}`,
      category,
      description: 'Perfect for home workouts, yoga, physical therapy and rehab',
      isPrime: true,
      rank: 3,
    },
    {
      asin: 'B00FLYWNYQ',
      title: 'CeraVe Moisturizing Cream 19 Oz | Body and Face Moisturizer',
      price: '$18.99',
      rating: '4.8',
      reviewCount: '234,567',
      imageUrl: 'https://m.media-amazon.com/images/I/61S8hynnlhL._SL500_.jpg',
      productUrl: 'https://www.amazon.com/dp/B00FLYWNYQ',
      affiliateUrl: `https://www.amazon.com/dp/B00FLYWNYQ?tag=${ASSOCIATE_TAG}`,
      category,
      description: 'Developed with dermatologists, contains hyaluronic acid and ceramides',
      isPrime: true,
      rank: 4,
      discount: '10%',
    },
    {
      asin: 'B09V3KXJPB',
      title: 'COSRX Snail Mucin 96% Power Repairing Essence 3.38 fl.oz',
      price: '$13.99',
      rating: '4.5',
      reviewCount: '156,789',
      imageUrl: 'https://m.media-amazon.com/images/I/51CTdTMR08L._SL500_.jpg',
      productUrl: 'https://www.amazon.com/dp/B09V3KXJPB',
      affiliateUrl: `https://www.amazon.com/dp/B09V3KXJPB?tag=${ASSOCIATE_TAG}`,
      category,
      description: 'Hydrating Serum for Face with Snail Secretion Filtrate',
      isPrime: true,
      rank: 5,
    },
  ];
  return demos;
}
