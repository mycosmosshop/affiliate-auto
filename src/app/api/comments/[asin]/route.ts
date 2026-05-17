import { NextResponse } from "next/server";
import { getComments, addComment } from "@/lib/product-meta";

// GET /api/comments/[asin] — onaylı yorumları getir
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ asin: string }> }
) {
  const { asin } = await params;
  return NextResponse.json({ asin, comments: getComments(asin) });
}

// POST /api/comments/[asin] — yeni yorum ekle (onay bekler)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ asin: string }> }
) {
  const { asin } = await params;
  if (!/^[A-Z0-9]{10}$/.test(asin)) {
    return NextResponse.json({ error: "Invalid ASIN" }, { status: 400 });
  }

  let body: { author?: string; rating?: number; text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const author = (body.author || "").trim().substring(0, 60);
  const text = (body.text || "").trim().substring(0, 2000);
  const rating = Math.max(1, Math.min(5, Math.floor(body.rating || 5)));

  if (!author || text.length < 5) {
    return NextResponse.json(
      { error: "İsim ve en az 5 karakter yorum gerekli" },
      { status: 400 }
    );
  }

  const comment = addComment({ asin, author, rating, text });
  return NextResponse.json({
    ok: true,
    message: "Yorumun moderasyona gönderildi.",
    comment: { ...comment, approved: undefined },
  });
}
