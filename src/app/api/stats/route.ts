import { NextResponse } from 'next/server';
import { getStats, getPinLogs, getProducts, getSchedulerConfig } from '@/lib/storage';

export async function GET() {
  const stats = getStats();
  const pinLogs = getPinLogs();
  const products = getProducts();
  const scheduler = getSchedulerConfig();

  const today = new Date().toISOString().split('T')[0];
  const todayStats = stats.find((s) => s.date === today);
  const weekStats = stats.slice(0, 7);

  const totalPins = pinLogs.length;
  const todayPins = pinLogs.filter((p) => p.createdAt.startsWith(today)).length;

  return NextResponse.json({
    overview: {
      totalPins,
      todayPins,
      totalProducts: products.length,
      schedulerEnabled: scheduler.enabled,
      lastRun: scheduler.lastRun,
      nextRun: scheduler.nextRun,
    },
    today: todayStats || { date: today, pinsCreated: 0, productsScanned: 0, categoriesProcessed: [] },
    weekChart: weekStats.reverse(),
    recentPins: pinLogs.slice(0, 10),
    scheduler,
  });
}
