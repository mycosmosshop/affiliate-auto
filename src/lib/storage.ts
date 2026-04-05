import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const PINS_FILE = path.join(DATA_DIR, 'pins.json');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');
const SCHEDULER_FILE = path.join(DATA_DIR, 'scheduler.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJson<T>(file: string, defaultValue: T): T {
  try {
    if (!fs.existsSync(file)) return defaultValue;
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return defaultValue;
  }
}

function writeJson(file: string, data: unknown) {
  ensureDataDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Products
export function getProducts() {
  return readJson(PRODUCTS_FILE, []);
}

export function saveProducts(products: unknown[]) {
  writeJson(PRODUCTS_FILE, products);
}

// Pins log
export interface PinLog {
  id: string;
  pinId: string;
  pinUrl: string;
  productTitle: string;
  productAsin: string;
  category: string;
  createdAt: string;
  platform: string;
}

export function getPinLogs(): PinLog[] {
  return readJson(PINS_FILE, []);
}

export function addPinLog(log: PinLog) {
  const logs = getPinLogs();
  logs.unshift(log); // newest first
  // max 500 log tut
  writeJson(PINS_FILE, logs.slice(0, 500));
}

// Stats
export interface DailyStats {
  date: string;
  pinsCreated: number;
  productsScanned: number;
  categoriesProcessed: string[];
}

export function getStats(): DailyStats[] {
  return readJson(STATS_FILE, []);
}

export function updateTodayStats(update: Partial<DailyStats>) {
  const stats = getStats();
  const today = new Date().toISOString().split('T')[0];
  const idx = stats.findIndex((s) => s.date === today);

  if (idx >= 0) {
    stats[idx] = { ...stats[idx], ...update };
  } else {
    stats.unshift({
      date: today,
      pinsCreated: 0,
      productsScanned: 0,
      categoriesProcessed: [],
      ...update,
    });
  }

  writeJson(STATS_FILE, stats.slice(0, 90)); // 90 günlük
}

export function incrementPinCount() {
  const stats = getStats();
  const today = new Date().toISOString().split('T')[0];
  const idx = stats.findIndex((s) => s.date === today);

  if (idx >= 0) {
    stats[idx].pinsCreated = (stats[idx].pinsCreated || 0) + 1;
  } else {
    stats.unshift({ date: today, pinsCreated: 1, productsScanned: 0, categoriesProcessed: [] });
  }
  writeJson(STATS_FILE, stats.slice(0, 90));
}

// Scheduler config
export interface SchedulerConfig {
  enabled: boolean;
  interval: string; // cron expression
  pinsPerRun: number;
  categories: string[];
  lastRun: string | null;
  nextRun: string | null;
  totalPinsToday: number;
  dailyLimit: number;
}

export const DEFAULT_SCHEDULER: SchedulerConfig = {
  enabled: false,
  interval: '0 9,13,17,21 * * *', // 4x per day
  pinsPerRun: 5,
  categories: ['electronics', 'kitchen', 'beauty', 'fitness'],
  lastRun: null,
  nextRun: null,
  totalPinsToday: 0,
  dailyLimit: 25,
};

export function getSchedulerConfig(): SchedulerConfig {
  return readJson(SCHEDULER_FILE, DEFAULT_SCHEDULER);
}

export function saveSchedulerConfig(config: SchedulerConfig) {
  writeJson(SCHEDULER_FILE, config);
}
