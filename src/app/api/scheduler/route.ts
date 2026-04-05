import { NextRequest, NextResponse } from 'next/server';
import { getSchedulerConfig, saveSchedulerConfig, DEFAULT_SCHEDULER } from '@/lib/storage';
import { searchBestSellers } from '@/lib/amazon';
import { createPinsInBatch } from '@/lib/pinterest';
import { addPinLog, incrementPinCount } from '@/lib/storage';

// Scheduler durumunu al
export async function GET() {
  const config = getSchedulerConfig();
  return NextResponse.json({ config });
}

// Scheduler ayarlarını güncelle
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const current = getSchedulerConfig();
  const updated = { ...current, ...body };
  saveSchedulerConfig(updated);
  return NextResponse.json({ success: true, config: updated });
}

// Manuel tetikleme / Scheduler sıfırla
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === 'reset') {
    saveSchedulerConfig(DEFAULT_SCHEDULER);
    return NextResponse.json({ success: true, message: 'Scheduler reset' });
  }

  if (action === 'run') {
    // Manuel çalıştır
    const config = getSchedulerConfig();
    const results = [];

    for (const category of config.categories) {
      const products = await searchBestSellers(category);
      const toPin = products.slice(0, Math.ceil(config.pinsPerRun / config.categories.length));
      const pins = await createPinsInBatch(toPin, undefined, 1500);

      for (const pin of pins) {
        const product = toPin.find((p) => p.title === pin.product);
        addPinLog({
          id: crypto.randomUUID(),
          pinId: pin.id,
          pinUrl: pin.url,
          productTitle: pin.product,
          productAsin: product?.asin || '',
          category,
          createdAt: pin.created,
          platform: 'pinterest',
        });
        incrementPinCount();
        results.push(pin);
      }
    }

    // Config güncelle
    const updated = {
      ...config,
      lastRun: new Date().toISOString(),
      nextRun: getNextRunTime(config.interval),
    };
    saveSchedulerConfig(updated);

    return NextResponse.json({
      success: true,
      message: `Created ${results.length} pins`,
      pinsCreated: results.length,
      pins: results,
    });
  }

  return NextResponse.json({ success: false, error: 'Unknown action' });
}

function getNextRunTime(cronExpression: string): string {
  // Basit next run hesaplama
  const now = new Date();
  const hours = [9, 13, 17, 21]; // default schedule
  const currentHour = now.getHours();
  const nextHour = hours.find((h) => h > currentHour) || hours[0];
  const next = new Date(now);
  if (nextHour <= currentHour) {
    next.setDate(next.getDate() + 1);
  }
  next.setHours(nextHour, 0, 0, 0);
  return next.toISOString();
}
