'use client';

import { useState, useEffect, useCallback } from 'react';

interface Product {
  asin: string;
  title: string;
  price: string;
  rating: string;
  reviewCount: string;
  imageUrl: string;
  affiliateUrl: string;
  category: string;
  discount?: string;
  isPrime: boolean;
}

interface PinLog {
  id: string;
  pinUrl: string;
  productTitle: string;
  category: string;
  createdAt: string;
  platform: string;
}

interface Stats {
  overview: {
    totalPins: number;
    todayPins: number;
    totalProducts: number;
    schedulerEnabled: boolean;
    lastRun: string | null;
    nextRun: string | null;
  };
  recentPins: PinLog[];
  scheduler: {
    enabled: boolean;
    pinsPerRun: number;
    categories: string[];
    dailyLimit: number;
    interval: string;
  };
}

const CATEGORIES = ['all', 'electronics', 'kitchen', 'beauty', 'fitness', 'books', 'toys', 'baby', 'pet'];

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'pins' | 'settings'>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [schedulerEnabled, setSchedulerEnabled] = useState(false);
  const [pinsPerRun, setPinsPerRun] = useState(5);
  const [dailyLimit, setDailyLimit] = useState(25);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
      setSchedulerEnabled(data.scheduler?.enabled || false);
      setPinsPerRun(data.scheduler?.pinsPerRun || 5);
      setDailyLimit(data.scheduler?.dailyLimit || 25);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data.products || []);
  }, []);

  useEffect(() => {
    loadStats();
    loadProducts();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [loadStats, loadProducts]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/amazon?category=${selectedCategory}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
        showMessage('success', `${data.count} products fetched from Amazon!`);
        loadStats();
      }
    } catch {
      showMessage('error', 'Failed to fetch products');
    }
    setLoading(false);
  };

  const runPins = async (count: number = 5) => {
    setLoading(true);
    try {
      const res = await fetch('/api/pinterest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      });
      const data = await res.json();
      if (data.success) {
        showMessage('success', `${data.pinsCreated} pins created on Pinterest!`);
        loadStats();
      } else {
        showMessage('error', data.error || 'Pin failed');
      }
    } catch {
      showMessage('error', 'Failed to create pins');
    }
    setLoading(false);
  };

  const runSchedulerNow = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run' }),
      });
      const data = await res.json();
      if (data.success) {
        showMessage('success', `Automation run complete! ${data.pinsCreated} pins created.`);
        loadStats();
        loadProducts();
      }
    } catch {
      showMessage('error', 'Scheduler run failed');
    }
    setLoading(false);
  };

  const toggleScheduler = async () => {
    const newState = !schedulerEnabled;
    setSchedulerEnabled(newState);
    await fetch('/api/scheduler', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: newState }),
    });
    showMessage('success', newState ? 'Auto-posting ENABLED' : 'Auto-posting DISABLED');
    loadStats();
  };

  const saveSchedulerSettings = async () => {
    await fetch('/api/scheduler', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinsPerRun, dailyLimit }),
    });
    showMessage('success', 'Settings saved!');
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return 'Never';
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-lg">A</div>
            <div>
              <h1 className="font-bold text-lg leading-none">AffiliateAuto</h1>
              <p className="text-xs text-gray-400">mycosmoline-20 · Amazon US</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${schedulerEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
            <span className="text-xs text-gray-400">{schedulerEnabled ? 'Auto ON' : 'Auto OFF'}</span>
          </div>
        </div>
      </header>

      {/* Toast Message */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-medium ${
          message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {message.text}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-900 p-1 rounded-lg w-fit">
          {(['dashboard', 'products', 'pins', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition ${
                activeTab === tab ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Pins" value={stats?.overview.totalPins || 0} color="orange" icon="📌" />
              <StatCard label="Today's Pins" value={stats?.overview.todayPins || 0} color="blue" icon="📅" />
              <StatCard label="Products" value={stats?.overview.totalProducts || 0} color="green" icon="🛍️" />
              <StatCard
                label="Daily Progress"
                value={`${stats?.overview.todayPins || 0}/${stats?.scheduler.dailyLimit || 25}`}
                color="purple"
                icon="🎯"
              />
            </div>

            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <h2 className="font-semibold mb-4 text-gray-200">Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={fetchProducts}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  {loading ? '...' : '🔄 Fetch Best Sellers'}
                </button>
                <button
                  onClick={() => runPins(5)}
                  disabled={loading || products.length === 0}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  {loading ? '...' : '📌 Post 5 Pins'}
                </button>
                <button
                  onClick={runSchedulerNow}
                  disabled={loading}
                  className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  {loading ? 'Running...' : '🚀 Run Full Automation'}
                </button>
                <button
                  onClick={toggleScheduler}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    schedulerEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {schedulerEnabled ? '⏸ Pause Auto' : '▶ Enable Auto'}
                </button>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <h2 className="font-semibold mb-4 text-gray-200">Automation Status</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Status</p>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${schedulerEnabled ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-400'}`}>
                    {schedulerEnabled ? 'ACTIVE' : 'PAUSED'}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Last Run</p>
                  <p className="text-white">{formatDate(stats?.overview.lastRun || null)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Next Run</p>
                  <p className="text-white">{formatDate(stats?.overview.nextRun || null)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Pins / Run</p>
                  <p className="text-white">{stats?.scheduler.pinsPerRun || 5}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Schedule</p>
                  <p className="text-white text-xs font-mono">9am · 1pm · 5pm · 9pm</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Categories</p>
                  <p className="text-white text-xs">{stats?.scheduler.categories?.join(', ')}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <h2 className="font-semibold mb-4 text-gray-200">Recent Pins</h2>
              {(stats?.recentPins?.length || 0) === 0 ? (
                <p className="text-gray-500 text-sm">No pins yet. Click &quot;Run Full Automation&quot; to start!</p>
              ) : (
                <div className="space-y-2">
                  {stats?.recentPins.map((pin) => (
                    <div key={pin.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                      <div>
                        <p className="text-sm text-white line-clamp-1">{pin.productTitle}</p>
                        <p className="text-xs text-gray-500">{pin.category} · {formatDate(pin.createdAt)}</p>
                      </div>
                      <a
                        href={pin.pinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-orange-400 hover:text-orange-300 ml-4 shrink-0"
                      >
                        View →
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
              <button
                onClick={fetchProducts}
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium"
              >
                {loading ? 'Fetching...' : 'Fetch Best Sellers'}
              </button>
              {products.length > 0 && (
                <button
                  onClick={() => runPins(products.length)}
                  disabled={loading}
                  className="bg-red-700 hover:bg-red-600 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Pin All ({products.length})
                </button>
              )}
            </div>

            {products.length === 0 ? (
              <div className="bg-gray-900 rounded-xl p-12 text-center border border-gray-800">
                <p className="text-gray-400 text-lg mb-2">No products yet</p>
                <p className="text-gray-600 text-sm">Select a category and fetch Best Sellers</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.asin} product={product} onPin={() => runPins(1)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* PINS */}
        {activeTab === 'pins' && (
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <h2 className="font-semibold mb-4">Pin History</h2>
            {(stats?.recentPins?.length || 0) === 0 ? (
              <p className="text-gray-500 text-sm">No pins created yet.</p>
            ) : (
              <div className="space-y-3">
                {stats?.recentPins.map((pin) => (
                  <div key={pin.id} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{pin.productTitle}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-400">{pin.category}</span>
                        <span className="text-xs bg-red-900 px-2 py-0.5 rounded text-red-300">{pin.platform}</span>
                        <span className="text-xs text-gray-500">{formatDate(pin.createdAt)}</span>
                      </div>
                    </div>
                    <a
                      href={pin.pinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 shrink-0 text-xs bg-orange-600 hover:bg-orange-700 px-3 py-1.5 rounded-lg transition"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <h2 className="font-semibold mb-4">Automation Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Pins Per Run</label>
                  <input
                    type="number"
                    value={pinsPerRun}
                    onChange={(e) => setPinsPerRun(Number(e.target.value))}
                    min={1}
                    max={25}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white w-32"
                  />
                  <p className="text-xs text-gray-600 mt-1">4 runs/day → Total: {pinsPerRun * 4}/day</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Daily Pin Limit</label>
                  <input
                    type="number"
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(Number(e.target.value))}
                    min={5}
                    max={150}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white w-32"
                  />
                  <p className="text-xs text-gray-600 mt-1">Pinterest max: 150/day. Recommended: 25-50.</p>
                </div>
                <button
                  onClick={saveSchedulerSettings}
                  className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Save Settings
                </button>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <h2 className="font-semibold mb-4">API Configuration</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-800">
                  <div>
                    <p className="text-sm font-medium">Amazon PA API</p>
                    <p className="text-xs text-gray-500">Associates Central → Tools → Product Advertising API</p>
                  </div>
                  <span className="text-xs bg-yellow-900 text-yellow-300 px-2 py-1 rounded">Setup needed</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-800">
                  <div>
                    <p className="text-sm font-medium">Pinterest API</p>
                    <p className="text-xs text-gray-500">developers.pinterest.com → My Apps</p>
                  </div>
                  <span className="text-xs bg-yellow-900 text-yellow-300 px-2 py-1 rounded">Setup needed</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">OpenAI (optional)</p>
                    <p className="text-xs text-gray-500">For AI-powered pin descriptions</p>
                  </div>
                  <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">Optional</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-400">
                  Edit <code className="text-orange-400">.env.local</code> file to add API keys, then restart server.
                </p>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <h2 className="font-semibold mb-3">Amazon Associate Tag</h2>
              <div className="flex items-center gap-3">
                <code className="bg-gray-800 px-3 py-1.5 rounded text-orange-400 text-sm font-mono">mycosmoline-20</code>
                <span className="text-xs text-gray-500">Amazon US · Active</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number | string;
  color: string;
  icon: string;
}) {
  const colors: Record<string, string> = {
    orange: 'border-orange-500/30',
    blue: 'border-blue-500/30',
    green: 'border-green-500/30',
    purple: 'border-purple-500/30',
  };
  return (
    <div className={`rounded-xl p-4 border ${colors[color]} bg-gray-900`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}

function ProductCard({ product, onPin }: { product: Product; onPin: () => void }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-orange-500/50 transition">
      <div className="aspect-square relative bg-gray-800">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.title} className="w-full h-full object-contain p-4" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
        )}
        {product.discount && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold">
            -{product.discount}
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-sm font-medium line-clamp-2 text-white mb-2">{product.title}</p>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-orange-400 font-bold">{product.price}</span>
          <span className="text-xs text-yellow-400">★ {product.rating}</span>
          <span className="text-xs text-gray-500">({product.reviewCount})</span>
          {product.isPrime && (
            <span className="text-xs bg-blue-900 text-blue-300 px-1.5 py-0.5 rounded">Prime</span>
          )}
        </div>
        <div className="flex gap-2">
          <a
            href={product.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center bg-gray-800 hover:bg-gray-700 text-xs py-1.5 rounded-lg transition text-gray-300"
          >
            Amazon ↗
          </a>
          <button
            onClick={onPin}
            className="flex-1 bg-red-700 hover:bg-red-600 text-xs py-1.5 rounded-lg transition text-white"
          >
            📌 Pin
          </button>
        </div>
      </div>
    </div>
  );
}
