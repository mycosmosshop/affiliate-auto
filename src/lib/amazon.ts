import crypto from 'crypto';

const ASSOCIATE_TAG = process.env.AMAZON_ASSOCIATE_TAG || 'mycosmoline-20';
const ACCESS_KEY = process.env.AMAZON_ACCESS_KEY || '';
const SECRET_KEY = process.env.AMAZON_SECRET_KEY || '';
const REGION = 'us-east-1';
const HOST = 'webservices.amazon.com';
const PATH = '/paapi5/searchitems';

export interface AmazonProduct {
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
  discount?: string;
}

// PAAPI5 imza oluşturma
function sign(key: Buffer, msg: string): Buffer {
  return crypto.createHmac('sha256', key).update(msg).digest();
}

function getSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string): Buffer {
  const kDate = sign(Buffer.from('AWS4' + key, 'utf8'), dateStamp);
  const kRegion = sign(kDate, regionName);
  const kService = sign(kRegion, serviceName);
  const kSigning = sign(kService, 'aws4_request');
  return kSigning;
}

export async function searchBestSellers(category: string, keywords?: string): Promise<AmazonProduct[]> {
  // API anahtarı yoksa demo data döndür
  if (!ACCESS_KEY || ACCESS_KEY === 'YOUR_ACCESS_KEY_HERE') {
    return getDemoProducts(category);
  }

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '').substring(0, 15) + 'Z';
  const dateStamp = amzDate.substring(0, 8);

  const payload = JSON.stringify({
    Keywords: keywords || getBestSellerKeyword(category),
    Resources: [
      'Images.Primary.Large',
      'ItemInfo.Title',
      'Offers.Listings.Price',
      'ItemInfo.Features',
      'CustomerReviews.Count',
      'CustomerReviews.StarRating',
    ],
    SearchIndex: getCategoryIndex(category),
    ItemCount: 10,
    PartnerTag: ASSOCIATE_TAG,
    PartnerType: 'Associates',
    Marketplace: 'www.amazon.com',
    SortBy: 'Relevance',
  });

  const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');
  const contentType = 'application/json; charset=utf-8';
  const target = 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems';

  const canonicalHeaders = `content-encoding:amz-1.0\ncontent-type:${contentType}\nhost:${HOST}\nx-amz-date:${amzDate}\nx-amz-target:${target}\n`;
  const signedHeaders = 'content-encoding;content-type;host;x-amz-date;x-amz-target';
  const canonicalRequest = `POST\n${PATH}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

  const credentialScope = `${dateStamp}/${REGION}/ProductAdvertisingAPI/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${crypto.createHash('sha256').update(canonicalRequest).digest('hex')}`;

  const signingKey = getSignatureKey(SECRET_KEY, dateStamp, REGION, 'ProductAdvertisingAPI');
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

  const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const response = await fetch(`https://${HOST}${PATH}`, {
    method: 'POST',
    headers: {
      'content-encoding': 'amz-1.0',
      'content-type': contentType,
      host: HOST,
      'x-amz-date': amzDate,
      'x-amz-target': target,
      Authorization: authorizationHeader,
    },
    body: payload,
  });

  if (!response.ok) {
    console.error('Amazon API error:', await response.text());
    return getDemoProducts(category);
  }

  const data = await response.json();
  return parseAmazonResponse(data, category);
}

function parseAmazonResponse(data: Record<string, unknown>, category: string): AmazonProduct[] {
  const items = (data?.SearchResult as Record<string, unknown>)?.Items as Record<string, unknown>[];
  if (!items) return [];

  return items.map((item: Record<string, unknown>) => {
    const asin = item.ASIN as string;
    const itemInfo = item.ItemInfo as Record<string, unknown>;
    const title = ((itemInfo?.Title as Record<string, unknown>)?.DisplayValue as string) || 'Unknown Product';
    const offers = item.Offers as Record<string, unknown>;
    const listings = (offers?.Listings as Record<string, unknown>[]);
    const price = (((listings?.[0] as Record<string, unknown>)?.Price as Record<string, unknown>)?.DisplayAmount as string) || 'N/A';
    const images = item.Images as Record<string, unknown>;
    const imageUrl = (((images?.Primary as Record<string, unknown>)?.Large as Record<string, unknown>)?.URL as string) || '';
    const reviews = item.CustomerReviews as Record<string, unknown>;
    const rating = ((reviews?.StarRating as Record<string, unknown>)?.Value as string) || '0';
    const reviewCount = ((reviews?.Count as Record<string, unknown>)?.DisplayValue as string) || '0';

    return {
      asin,
      title,
      price,
      rating,
      reviewCount,
      imageUrl,
      productUrl: `https://www.amazon.com/dp/${asin}`,
      affiliateUrl: `https://www.amazon.com/dp/${asin}?tag=${ASSOCIATE_TAG}`,
      category,
      description: title,
      isPrime: true,
    };
  });
}

function getCategoryIndex(category: string): string {
  const map: Record<string, string> = {
    electronics: 'Electronics',
    kitchen: 'Kitchen',
    fitness: 'SportingGoods',
    beauty: 'Beauty',
    books: 'Books',
    toys: 'Toys',
    fashion: 'Fashion',
    garden: 'Garden',
    tools: 'Tools',
    baby: 'Baby',
    pet: 'PetSupplies',
    all: 'All',
  };
  return map[category] || 'All';
}

function getBestSellerKeyword(category: string): string {
  const keywords: Record<string, string> = {
    electronics: 'best seller electronics 2025',
    kitchen: 'best kitchen gadgets',
    fitness: 'best fitness equipment',
    beauty: 'best beauty products',
    books: 'best seller books',
    toys: 'best toys kids',
    all: 'best sellers amazon',
  };
  return keywords[category] || 'best sellers';
}

// API anahtarı olmadan demo/test için
function getDemoProducts(category: string): AmazonProduct[] {
  const demos = [
    {
      asin: 'B09B8YWXDF',
      title: 'Apple AirPods Pro (2nd Generation) - Active Noise Cancellation',
      price: '$189.99',
      rating: '4.8',
      reviewCount: '45,231',
      imageUrl: 'https://m.media-amazon.com/images/I/51Rqf7FIUEL._SL500_.jpg',
      productUrl: 'https://www.amazon.com/dp/B09B8YWXDF',
      affiliateUrl: `https://www.amazon.com/dp/B09B8YWXDF?tag=${ASSOCIATE_TAG}`,
      category,
      description: 'Active Noise Cancellation, Transparency Mode, Personalized Spatial Audio',
      isPrime: true,
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
      discount: '20%',
    },
    {
      asin: 'B07ZPKN6YR',
      title: 'Resistance Bands Set - 11 Piece Exercise Bands for Working Out',
      price: '$29.99',
      rating: '4.6',
      reviewCount: '78,902',
      imageUrl: 'https://m.media-amazon.com/images/I/81GarGSKRML._SL500_.jpg',
      productUrl: 'https://www.amazon.com/dp/B07ZPKN6YR',
      affiliateUrl: `https://www.amazon.com/dp/B07ZPKN6YR?tag=${ASSOCIATE_TAG}`,
      category,
      description: 'Perfect for home workouts, yoga, physical therapy',
      isPrime: true,
    },
    {
      asin: 'B00FLYWNYQ',
      title: 'CeraVe Moisturizing Cream | 19 Oz | Daily Face and Body Moisturizer',
      price: '$18.99',
      rating: '4.8',
      reviewCount: '234,567',
      imageUrl: 'https://m.media-amazon.com/images/I/61S8hynnlhL._SL500_.jpg',
      productUrl: 'https://www.amazon.com/dp/B00FLYWNYQ',
      affiliateUrl: `https://www.amazon.com/dp/B00FLYWNYQ?tag=${ASSOCIATE_TAG}`,
      category,
      description: 'Developed with dermatologists, contains hyaluronic acid',
      isPrime: true,
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
    },
  ];
  return demos;
}
