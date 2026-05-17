import { NextResponse } from "next/server";
import { incrementViews, getViews } from "@/lib/product-meta";

// POST /api/views/[asin] — sayacı 1 artır (client bunu çağırır)
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ asin: string }> }
) {
  const { asin } = await params;
  if (!/^[A-Z0-9]{10}$/.test(asin)) {
    return NextResponse.json({ error: "Invalid ASIN" }, { status: 400 });
  }
  const count = incrementViews(asin);
  return NextResponse.json({ asin, views: count });
}

// GET /api/views/[asin] — mevcut sayacı getir (SSR fallback)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ asin: string }> }
) {
  const { asin } = await params;
  return NextResponse.json({ asin, views: getViews(asin) });
}
