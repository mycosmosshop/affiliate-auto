import { NextRequest, NextResponse } from "next/server";

// Amazon affiliate redirect endpoint
//   /go/B00TTD9BRC          → amazon.com.tr/dp/B00TTD9BRC?tag=...
//   /go/B00TTD9BRC?r=us     → amazon.com/dp/B00TTD9BRC?tag=... (US fallback)
//   /go/B00TTD9BRC?r=uk     → amazon.co.uk/dp/B00TTD9BRC?tag=... (UK)
//
// Affiliate tag .env'den okunur — onay gelince env değiştir, tüm link'ler güncellenir.

export const dynamic = "force-dynamic";

const REGIONS: Record<string, { host: string; tag: string | undefined }> = {
  tr: {
    host: "www.amazon.com.tr",
    tag: process.env.AMAZON_TR_TAG, // ör. "cosmositio-21" (onay sonrası)
  },
  us: {
    host: "www.amazon.com",
    tag: process.env.AMAZON_US_TAG || "mycosmoline-20",
  },
  uk: {
    host: "www.amazon.co.uk",
    tag: process.env.AMAZON_UK_TAG || "allphoneaccessory-21",
  },
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ asin: string }> }
) {
  const { asin } = await params;
  const region = (req.nextUrl.searchParams.get("r") || "tr").toLowerCase();
  const r = REGIONS[region] || REGIONS.tr;

  // ASIN format kontrolü (B + 9 alphanumeric)
  if (!/^[A-Z0-9]{10}$/.test(asin)) {
    return NextResponse.json(
      { error: "Geçersiz ASIN formatı" },
      { status: 400 }
    );
  }

  const url = new URL(`https://${r.host}/dp/${asin}`);
  if (r.tag) url.searchParams.set("tag", r.tag);

  // 302 redirect (geçici, böylece tag değişiklikleri tıklayanı eski tag'e fixlemez)
  return NextResponse.redirect(url.toString(), 302);
}
