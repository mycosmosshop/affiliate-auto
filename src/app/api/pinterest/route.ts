import { NextRequest, NextResponse } from 'next/server';
import { createPinsInBatch, getBoards } from '@/lib/pinterest';
import { getProducts } from '@/lib/storage';
import { addPinLog, incrementPinCount } from '@/lib/storage';
import { AmazonProduct } from '@/lib/amazon';

// Pin oluştur
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productAsins, boardId, count = 5 } = body;

    // Ürünleri al
    let products: AmazonProduct[] = getProducts();

    // Belirli ASIN'ler seçildiyse filtrele
    if (productAsins && productAsins.length > 0) {
      products = products.filter((p: AmazonProduct) => productAsins.includes(p.asin));
    }

    // İstenilen sayıda al
    const toPin = products.slice(0, count);

    if (toPin.length === 0) {
      return NextResponse.json({ success: false, error: 'No products found. Fetch Amazon products first.' });
    }

    const results = await createPinsInBatch(toPin, boardId, 2000);

    // Log kaydet
    for (const result of results) {
      const product = toPin.find((p: AmazonProduct) => p.title === result.product);
      addPinLog({
        id: crypto.randomUUID(),
        pinId: result.id,
        pinUrl: result.url,
        productTitle: result.product,
        productAsin: product?.asin || '',
        category: product?.category || '',
        createdAt: result.created,
        platform: 'pinterest',
      });
      incrementPinCount();
    }

    return NextResponse.json({
      success: true,
      pinsCreated: results.length,
      pins: results,
    });
  } catch (error) {
    console.error('Pinterest error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create pins' }, { status: 500 });
  }
}

// Board listesi al
export async function GET() {
  const boards = await getBoards();
  return NextResponse.json({ boards });
}
