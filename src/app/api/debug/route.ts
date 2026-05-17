import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: Record<string, unknown> = {
    env: {
      hasAccessKey: !!process.env.AMAZON_ACCESS_KEY,
      accessKeyPrefix: process.env.AMAZON_ACCESS_KEY?.substring(0, 6) || 'MISSING',
      hasSecretKey: !!process.env.AMAZON_SECRET_KEY,
      associateTag: process.env.AMAZON_ASSOCIATE_TAG || 'MISSING',
      hasScraperApiKey: !!process.env.SCRAPER_API_KEY,
      scraperApiKeyPrefix: process.env.SCRAPER_API_KEY?.substring(0, 8) || 'NOT SET',
      hasVercel: !!process.env.VERCEL,
    },
  };

  // PA API testi
  try {
    const crypto = await import('crypto');
    const ACCESS_KEY = process.env.AMAZON_ACCESS_KEY || '';
    const SECRET_KEY = process.env.AMAZON_SECRET_KEY || '';
    const ASSOCIATE_TAG = process.env.AMAZON_ASSOCIATE_TAG || 'mycosmoline-20';

    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '').substring(0, 15) + 'Z';
    const dateStamp = amzDate.substring(0, 8);

    const payload = JSON.stringify({
      Keywords: 'best seller',
      Resources: ['ItemInfo.Title', 'Images.Primary.Large', 'Offers.Listings.Price'],
      SearchIndex: 'Electronics',
      ItemCount: 3,
      PartnerTag: ASSOCIATE_TAG,
      PartnerType: 'Associates',
      Marketplace: 'www.amazon.com',
    });

    const HOST = 'webservices.amazon.com';
    const PATH = '/paapi5/searchitems';
    const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');
    const contentType = 'application/json; charset=utf-8';
    const target = 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems';
    const canonicalHeaders = `content-encoding:amz-1.0\ncontent-type:${contentType}\nhost:${HOST}\nx-amz-date:${amzDate}\nx-amz-target:${target}\n`;
    const signedHeaders = 'content-encoding;content-type;host;x-amz-date;x-amz-target';
    const canonicalRequest = `POST\n${PATH}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
    const credentialScope = `${dateStamp}/us-east-1/ProductAdvertisingAPI/aws4_request`;
    const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${crypto.createHash('sha256').update(canonicalRequest).digest('hex')}`;

    function sign(key: Buffer, msg: string) { return crypto.createHmac('sha256', key).update(msg).digest(); }
    const kDate = sign(Buffer.from('AWS4' + SECRET_KEY, 'utf8'), dateStamp);
    const kRegion = sign(kDate, 'us-east-1');
    const kService = sign(kRegion, 'ProductAdvertisingAPI');
    const kSigning = sign(kService, 'aws4_request');
    const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');
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
      signal: AbortSignal.timeout(10000),
    });

    const responseText = await response.text();
    results.paapi = {
      status: response.status,
      ok: response.ok,
      response: responseText.substring(0, 500),
    };
  } catch (e) {
    results.paapi = { error: String(e) };
  }

  // RSS testi
  try {
    const rssResponse = await fetch('https://www.amazon.com/gp/rss/bestsellers/electronics', {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/rss+xml' },
      signal: AbortSignal.timeout(8000),
    });
    const rssText = await rssResponse.text();
    results.rss = {
      status: rssResponse.status,
      hasItems: rssText.includes('<item>'),
      preview: rssText.substring(0, 300),
    };
  } catch (e) {
    results.rss = { error: String(e) };
  }

  return NextResponse.json(results, { headers: { 'Cache-Control': 'no-store' } });
}
