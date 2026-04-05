import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/storage';

export async function GET() {
  const products = getProducts();
  return NextResponse.json({ products, count: products.length });
}
