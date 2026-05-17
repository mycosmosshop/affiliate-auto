import { NextRequest, NextResponse } from 'next/server';
import { getProducts, addPinLog, incrementPinCount } from '@/lib/storage';
import { AmazonProduct } from '@/lib/amazon';

// Pinterest Bulk Pin CSV formatı
// https://help.pinterest.com/en/business/article/create-pins-in-bulk
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format') || 'pinterest';
  const count = parseInt(searchParams.get('count') || '25');

  const products: AmazonProduct[] = getProducts();

  if (products.length === 0) {
    return NextResponse.json({ error: 'No products. Fetch Amazon products first.' }, { status: 400 });
  }

  const toExport = products.slice(0, count);

  if (format === 'pinterest') {
    const csv = generatePinterestCSV(toExport);

    // Dashboard'a kaydet
    for (const p of toExport) {
      addPinLog({
        id: crypto.randomUUID(),
        pinId: `csv_${p.asin}_${Date.now()}`,
        pinUrl: `https://www.pinterest.com/mycosmosshop/`,
        productTitle: p.title,
        productAsin: p.asin,
        productImage: p.imageUrl,
        productPrice: p.price,
        affiliateUrl: p.affiliateUrl,
        category: p.category,
        board: getBoardName(p.category),
        createdAt: new Date().toISOString(),
        platform: 'pinterest_csv',
        status: 'scheduled',
      });
      incrementPinCount();
    }

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="pinterest-pins-${Date.now()}.csv"`,
      },
    });
  }

  return NextResponse.json({ error: 'Unknown format' }, { status: 400 });
}

function csvEscape(str: string): string {
  // CSV güvenli escape — tırnak içine al, içindeki tırnakları iki katla
  const cleaned = str
    .replace(/[\r\n]+/g, ' ')   // newline kaldır
    .replace(/"/g, '""')         // tırnakları escape et
    .trim();
  return `"${cleaned}"`;
}

function generatePinterestCSV(products: AmazonProduct[]): string {
  // Pinterest resmi Bulk Pin CSV formatı
  // Sadece zorunlu kolonlar — Publish Date YOK (anlık yayın)
  const headers = ['Title', 'Media URL', 'Pinterest Board', 'Description', 'Link'];

  const rows = products.map((p) => {
    const title = `${p.title.substring(0, 100)} - ${p.price}`;
    const description = generateDescription(p);
    const board = getBoardName(p.category);

    return [
      csvEscape(title),
      csvEscape(p.imageUrl),
      csvEscape(board),
      csvEscape(description),
      csvEscape(p.affiliateUrl),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

function generateDescription(p: AmazonProduct): string {
  const prime = p.isPrime ? ' FREE Prime Shipping.' : '';
  const discount = p.discount ? ` ${p.discount} OFF!` : '';
  const tags = `#AmazonFinds #BestSellers #${p.category} #Amazon #Shopping #Deal`;

  const templates = [
    `${p.rating} stars | ${p.reviewCount} reviews | ${p.price}${discount}${prime} Shop via link in bio! ${tags}`,
    `Amazon Best Seller: ${p.title}. Only ${p.price}${discount}. Rated ${p.rating}/5 by ${p.reviewCount} shoppers.${prime} ${tags}`,
    `${p.title} - ${p.price}${discount}. Top rated ${p.rating} stars. ${p.reviewCount} happy customers.${prime} ${tags}`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}


function getBoardName(category: string): string {
  // Pinterest'teki board isimleriyle BIREBIR eşleşmeli
  const boards: Record<string, string> = {
    electronics: 'Electronics Deals',
    kitchen: 'Kitchen Must-Haves',
    beauty: 'Beauty Finds & Skincare',
    fitness: 'Fitness & Workout Gear',
    baby: 'Amazon Best Sellers',
    pet: 'Amazon Best Sellers',
    books: 'Amazon Best Sellers',
    toys: 'Amazon Best Sellers',
    all: 'Amazon Best Sellers',
  };
  return boards[category] || 'Amazon Best Sellers';
}

