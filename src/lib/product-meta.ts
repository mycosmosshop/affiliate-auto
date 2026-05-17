// Gerçek view counter + comments için KV-backed sistem.
// Vercel KV (Upstash) provision edildikten sonra çalışır.
//
// Şimdilik: in-memory + file fallback (development).
// Production: @vercel/kv ile değiştirilecek.

import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const VIEWS_FILE = path.join(DATA_DIR, "views.json");
const COMMENTS_FILE = path.join(DATA_DIR, "comments.json");

function readJson<T>(file: string, fallback: T): T {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(file: string, data: unknown) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch {
    // Read-only fs (Vercel production) — yoksay
  }
}

export interface Comment {
  id: string;
  asin: string;
  author: string;
  rating: number;
  text: string;
  createdAt: string;
  approved: boolean;
}

export function getViews(asin: string): number {
  const views = readJson<Record<string, number>>(VIEWS_FILE, {});
  return views[asin] || 0;
}

export function incrementViews(asin: string): number {
  const views = readJson<Record<string, number>>(VIEWS_FILE, {});
  views[asin] = (views[asin] || 0) + 1;
  writeJson(VIEWS_FILE, views);
  return views[asin];
}

export function formatViews(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toString();
}

export function getComments(asin: string): Comment[] {
  const all = readJson<Comment[]>(COMMENTS_FILE, []);
  return all.filter((c) => c.asin === asin && c.approved);
}

export function addComment(c: Omit<Comment, "id" | "createdAt" | "approved">): Comment {
  const all = readJson<Comment[]>(COMMENTS_FILE, []);
  const newC: Comment = {
    ...c,
    id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    approved: false, // moderasyon
  };
  all.unshift(newC);
  writeJson(COMMENTS_FILE, all.slice(0, 5000));
  return newC;
}
