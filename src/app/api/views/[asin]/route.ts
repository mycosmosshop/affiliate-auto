import { NextResponse } from "next/server";
import { incrementViews, getViews } from "@/lib/product-meta";

// POST /api/views/[asin] — sayacı 1 artır
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ asin: string }> }
) {
  const { asin } = await params;
  if (!/^[A-Z0-9]{10}$/.test(asin)) {
    return NextResponse.json({ error: "Invalid ASIN" }, { status: 400 });
  }
  const count = await incrementViews(asin);
  return NextResponse.json({ asin, views: count });
}

// GET /api/views/[asin] — mevcut sayacı getir
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ asin: string }> }
) {
  const { asin } = await params;
  const count = await getViews(asin);
  return NextResponse.json({ asin, views: count });
}
