import { AmazonProduct } from './amazon';

const PINTEREST_TOKEN = process.env.PINTEREST_ACCESS_TOKEN || '';
const PINTEREST_BOARD_ID = process.env.PINTEREST_BOARD_ID || '';
const BASE_URL = 'https://api.pinterest.com/v5';

export interface PinResult {
  id: string;
  url: string;
  created: string;
  product: string;
}

export interface PinterestBoard {
  id: string;
  name: string;
  description: string;
  pin_count: number;
}

// Pin açıklaması oluştur (AI yoksa template kullan)
function generatePinDescription(product: AmazonProduct): string {
  const templates = [
    `⭐ ${product.rating}/5 stars | ${product.reviewCount} reviews\n\n${product.title}\n\n✅ ${product.price} ${product.isPrime ? '| FREE Prime Shipping' : ''}\n\n${product.description}\n\n🛒 Shop now → Link in bio\n\n#AmazonFinds #BestSellers #${product.category}Deals #Amazon #Shopping`,
    `🔥 TRENDING on Amazon!\n\n${product.title}\n\n💰 Only ${product.price}${product.discount ? ` (${product.discount} OFF!)` : ''}\n⭐ Rated ${product.rating}/5 by ${product.reviewCount} shoppers\n${product.isPrime ? '📦 FREE 2-Day Prime Shipping\n' : ''}\nClick link in bio to grab yours! 👆\n\n#AmazonDeals #MustHave #${product.category} #BestBuy #OnlineShopping`,
    `💎 Amazon Best Seller Alert!\n\n${product.title}\n\nWhy people love it:\n✓ Top-rated ${product.rating}⭐\n✓ ${product.reviewCount} happy customers\n✓ ${product.price}${product.isPrime ? ' with FREE shipping' : ''}\n\nGet yours before it sells out! Link in bio 🔗\n\n#Amazon #${product.category}Finds #Deal #MustHave #Shopping2025`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

// Pin başlığı oluştur
function generatePinTitle(product: AmazonProduct): string {
  const cleaned = product.title.substring(0, 90);
  return `${cleaned} | Amazon Best Seller ${product.price}`;
}

// Pinterest'e pin gönder
export async function createPin(product: AmazonProduct, boardId?: string): Promise<PinResult | null> {
  if (!PINTEREST_TOKEN || PINTEREST_TOKEN === 'YOUR_PINTEREST_TOKEN_HERE') {
    console.log('[Pinterest] Demo mode - pin simulated:', product.title);
    return {
      id: `demo_${Date.now()}`,
      url: `https://pinterest.com/pin/demo_${Date.now()}`,
      created: new Date().toISOString(),
      product: product.title,
    };
  }

  const targetBoard = boardId || PINTEREST_BOARD_ID;
  const description = generatePinDescription(product);
  const title = generatePinTitle(product);

  const pinData = {
    board_id: targetBoard,
    title,
    description,
    link: product.affiliateUrl,
    media_source: {
      source_type: 'image_url',
      url: product.imageUrl,
    },
  };

  try {
    const response = await fetch(`${BASE_URL}/pins`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PINTEREST_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pinData),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[Pinterest] Error creating pin:', err);
      return null;
    }

    const data = await response.json();
    return {
      id: data.id,
      url: `https://pinterest.com/pin/${data.id}`,
      created: new Date().toISOString(),
      product: product.title,
    };
  } catch (error) {
    console.error('[Pinterest] Error:', error);
    return null;
  }
}

// Toplu pin gönder (rate limit ile)
export async function createPinsInBatch(
  products: AmazonProduct[],
  boardId?: string,
  delayMs: number = 3000
): Promise<PinResult[]> {
  const results: PinResult[] = [];

  for (const product of products) {
    const result = await createPin(product, boardId);
    if (result) {
      results.push(result);
    }
    // Rate limit - Pinterest günde max 150 pin
    await new Promise((r) => setTimeout(r, delayMs));
  }

  return results;
}

// Board listesini al
export async function getBoards(): Promise<PinterestBoard[]> {
  if (!PINTEREST_TOKEN || PINTEREST_TOKEN === 'YOUR_PINTEREST_TOKEN_HERE') {
    return [
      { id: 'demo_board_1', name: 'Amazon Best Sellers', description: 'Top picks from Amazon', pin_count: 0 },
      { id: 'demo_board_2', name: 'Kitchen Gadgets', description: 'Best kitchen products', pin_count: 0 },
      { id: 'demo_board_3', name: 'Fitness Deals', description: 'Fitness equipment deals', pin_count: 0 },
    ];
  }

  try {
    const response = await fetch(`${BASE_URL}/boards?page_size=25`, {
      headers: { Authorization: `Bearer ${PINTEREST_TOKEN}` },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.items || [];
  } catch {
    return [];
  }
}

// Pinterest hesap bilgisi al
export async function getPinterestUser(): Promise<{ username: string; follower_count: number } | null> {
  if (!PINTEREST_TOKEN || PINTEREST_TOKEN === 'YOUR_PINTEREST_TOKEN_HERE') {
    return { username: 'demo_user', follower_count: 0 };
  }

  try {
    const response = await fetch(`${BASE_URL}/user_account`, {
      headers: { Authorization: `Bearer ${PINTEREST_TOKEN}` },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}
