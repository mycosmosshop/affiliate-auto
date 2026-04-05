import { NextRequest, NextResponse } from 'next/server';
import { searchBestSellers } from '@/lib/amazon';
import { scrapeBestSellers } from '@/lib/scraper';
import { saveProducts, updateTodayStats } from '@/lib/storage';

const ACCESS_KEY = process.env.AMAZON_ACCESS_KEY || '';
const PA_API_READY = ACCESS_KEY && ACCESS_KEY !== 'YOUR_ACCESS_KEY_HERE';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || 'all';
  const keywords = searchParams.get('keywords') || undefined;
  const forceMode = searchParams.get('mode'); // 'api' | 'scrape'

  try {
    let products = [];
    let source = 'demo';

    if (forceMode === 'api' || (PA_API_READY && forceMode !== 'scrape')) {
      // PA API kullan
      try {
        products = await searchBestSellers(category, keywords);
        source = 'paapi';
      } catch {
        // PA API başarısız → scraper'a geç
        products = await scrapeBestSellers(category);
        source = 'scraper';
      }
    } else {
      // Scraper kullan (API key yok veya yeterli satış yok)
      products = await scrapeBestSellers(category);
      source = products.length > 0 ? 'scraper' : 'demo';
    }

    saveProducts(products);
    updateTodayStats({ productsScanned: products.length });

    return NextResponse.json({
      success: true,
      products,
      count: products.length,
      source, // hangi yöntem kullanıldı
    });
  } catch (error) {
    console.error('Amazon route error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}
