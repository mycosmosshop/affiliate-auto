// View counter + comments — Upstash Redis (Vercel KV marketplace) ile persistent.
// Env varsa Redis kullanılır, yoksa local file fallback (sadece development).
//
// Gerekli env:
//   KV_REST_API_URL        (Vercel KV / Upstash Redis)
//   KV_REST_API_TOKEN
//   veya UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN

import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

const DATA_DIR = path.join(process.cwd(), "data");
const VIEWS_FILE = path.join(DATA_DIR, "views.json");
const COMMENTS_FILE = path.join(DATA_DIR, "comments.json");

const REDIS_URL =
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN =
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const redis =
  REDIS_URL && REDIS_TOKEN
    ? new Redis({ url: REDIS_URL, token: REDIS_TOKEN })
    : null;

export const isKvEnabled = () => redis !== null;

// ---- File fallback (development) -------------------------------------------

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
    // Read-only fs — yoksay (Vercel prod)
  }
}

// ---- Views -----------------------------------------------------------------

export async function getViews(asin: string): Promise<number> {
  if (redis) {
    const v = await redis.get<number>(`v:${asin}`);
    return v ?? 0;
  }
  const all = readJson<Record<string, number>>(VIEWS_FILE, {});
  return all[asin] || 0;
}

export async function incrementViews(asin: string): Promise<number> {
  if (redis) {
    return await redis.incr(`v:${asin}`);
  }
  const all = readJson<Record<string, number>>(VIEWS_FILE, {});
  all[asin] = (all[asin] || 0) + 1;
  writeJson(VIEWS_FILE, all);
  return all[asin];
}

export function formatViews(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toString();
}

// ---- Comments --------------------------------------------------------------

export interface Comment {
  id: string;
  asin: string;
  author: string;
  rating: number;
  text: string;
  createdAt: string;
  approved: boolean;
}

export async function getComments(asin: string): Promise<Comment[]> {
  if (redis) {
    // Redis list: c:{asin} → JSON string array
    const items = await redis.lrange<string | Comment>(`c:${asin}`, 0, 99);
    const parsed: Comment[] = items
      .map((x) => (typeof x === "string" ? safeParse<Comment>(x) : x))
      .filter((c): c is Comment => !!c && c.approved);
    return parsed;
  }
  const all = readJson<Comment[]>(COMMENTS_FILE, []);
  return all.filter((c) => c.asin === asin && c.approved);
}

export async function addComment(
  c: Omit<Comment, "id" | "createdAt" | "approved">
): Promise<Comment> {
  const newC: Comment = {
    ...c,
    id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    approved: false, // moderasyon — admin paneli ile approve edilir
  };
  if (redis) {
    // Pending list — moderasyondan sonra public list'e taşınır
    await redis.lpush(`cp:${c.asin}`, JSON.stringify(newC));
    await redis.ltrim(`cp:${c.asin}`, 0, 999);
  } else {
    const all = readJson<Comment[]>(COMMENTS_FILE, []);
    all.unshift(newC);
    writeJson(COMMENTS_FILE, all.slice(0, 5000));
  }
  return newC;
}

function safeParse<T>(s: string): T | null {
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}
