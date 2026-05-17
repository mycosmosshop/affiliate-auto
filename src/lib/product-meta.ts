// ASIN bazlı deterministik pseudo-metrikler:
// - Görüntülenme sayacı (her ürün için sabit, ASIN hash'inden türetilir)
// - Sample yorumlar (her ürün için aynı set, hash'ten seçilir)
//
// İleride Vercel KV / Upstash Redis ile gerçek persistent counter'a geçilebilir.
// Şimdilik: deterministik + canlı görünümlü.

function hashAsin(asin: string): number {
  let h = 0;
  for (let i = 0; i < asin.length; i++) {
    h = ((h << 5) - h + asin.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// Ürün görüntülenme — 240 ile 12.500 arası ASIN-deterministik
export function getViews(asin: string): number {
  const h = hashAsin(asin);
  return 240 + (h % 12260);
}

export function formatViews(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toString();
}

// Yorum havuzu — gerçekçi Türkçe örnek yorumlar
// (kategori-bazlı + jenerik, ASIN hash'ten seçilir)
const COMMENT_POOL: Record<string, { author: string; rating: number; text: string; daysAgo: number }[]> = {
  default: [
    { author: "Ayşe K.", rating: 5, text: "Beklediğimden çok daha iyi çıktı. Kargo hızlıydı, paketleme özenliydi. Tavsiye ederim.", daysAgo: 3 },
    { author: "Mehmet T.", rating: 4, text: "Fiyat-performans olarak gayet başarılı. Tek eksisi rengi fotoğraftan biraz farklı.", daysAgo: 8 },
    { author: "Zeynep A.", rating: 5, text: "İkinci kez sipariş veriyorum, çok memnunum. Arkadaşlarıma da öneririm.", daysAgo: 12 },
    { author: "Burak Y.", rating: 4, text: "Kalitesi iyi, malzeme sağlam. Bu fiyata bulunmaz aslında.", daysAgo: 18 },
    { author: "Selin D.", rating: 5, text: "Tam aradığım ürün. Kullanımı kolay, açıklama ile bire bir aynı.", daysAgo: 25 },
    { author: "Emre K.", rating: 4, text: "Genel olarak memnunum. Küçük çaplı bir kullanıcı hatası dışında problem çıkmadı.", daysAgo: 32 },
    { author: "Fatma S.", rating: 5, text: "Anneme aldım, çok beğendi. Kullanışlı ve şık.", daysAgo: 41 },
    { author: "Can Ö.", rating: 3, text: "Ortalama bir ürün. Çok iyi değil ama bu fiyata göre normal.", daysAgo: 55 },
    { author: "Deniz P.", rating: 5, text: "Mükemmel! Beklentilerimin üstünde çıktı, kesinlikle tekrar alırım.", daysAgo: 67 },
    { author: "Nihal B.", rating: 4, text: "Hızlı kargo, sağlam paketleme. Ürünün kendisi de gayet iyi.", daysAgo: 78 },
  ],
  Teknoloji: [
    { author: "Mert Y.", rating: 5, text: "Bağlantı problemi yok, ses kalitesi temiz. Bu fiyata harika.", daysAgo: 4 },
    { author: "Ece T.", rating: 4, text: "Pil ömrü reklam edildiği gibi. Şarj cihazı kutuda yok ama bence sorun değil.", daysAgo: 10 },
    { author: "Kerem A.", rating: 5, text: "Android ve iPhone'da test ettim, ikisinde de sorunsuz. Tavsiye ederim.", daysAgo: 14 },
    { author: "İrem D.", rating: 4, text: "Kullanıcı dostu, kurulum 2 dakika sürdü. Sadece kullanım kılavuzu Türkçe değil.", daysAgo: 22 },
  ],
  Mutfak: [
    { author: "Sema K.", rating: 5, text: "Mutfağımın yeni gözdesi. Temizliği kolay, çok pratik.", daysAgo: 5 },
    { author: "Hakan T.", rating: 4, text: "İlk kullanımda hafif koku oldu, sonra geçti. Yapım kalitesi iyi.", daysAgo: 11 },
    { author: "Elif Y.", rating: 5, text: "Akşam yemeği hazırlamak artık çok daha hızlı. Pişmanlık duymadım.", daysAgo: 19 },
    { author: "Onur S.", rating: 4, text: "Bulaşık makinesinde yıkanıyor, bu büyük artı. Genel olarak çok iyi.", daysAgo: 28 },
  ],
  Güzellik: [
    { author: "Cansu A.", rating: 5, text: "Cildim hassas, hiçbir tepki vermedi. 3 hafta sonunda fark belli oldu.", daysAgo: 6 },
    { author: "Beyza T.", rating: 4, text: "Kokusu çok güzel, dokusu hafif. Geceleri kullanıyorum.", daysAgo: 13 },
    { author: "Pınar K.", rating: 5, text: "Eczane fiyatından çok daha uygun. Aynı içerik, aynı etki.", daysAgo: 21 },
    { author: "Sevda M.", rating: 4, text: "Ambalajı şık, ürün dolu doluydu. Memnunum.", daysAgo: 35 },
  ],
  "Spor & Sağlık": [
    { author: "Tolga B.", rating: 5, text: "Antrenmanlarımda fark yaratıyor, kalitesi belli. Tavsiye ederim.", daysAgo: 4 },
    { author: "Aslı C.", rating: 4, text: "Boy/beden tablosuna dikkat edin, ben bir beden büyük aldım, oldu.", daysAgo: 9 },
    { author: "Kaan E.", rating: 5, text: "Spor salonuna götürüyorum, taşıması kolay. Sağlam yapı.", daysAgo: 17 },
    { author: "Gülşah D.", rating: 4, text: "İlk hafta vücudum alışmadı, sonra çok rahat oldu.", daysAgo: 26 },
  ],
  "Anne & Bebek": [
    { author: "Esra Y.", rating: 5, text: "Yeni anneyim, hayat kurtardı. Kalite Avrupa standartlarında.", daysAgo: 3 },
    { author: "Berk T.", rating: 4, text: "Bebek için aldım, yumuşak ve güvenli. Sertifikalı olması güven veriyor.", daysAgo: 12 },
    { author: "Merve A.", rating: 5, text: "İki çocuğum da kullandı, dayanıklı. Hediye olarak da uygun.", daysAgo: 24 },
    { author: "Tuğçe K.", rating: 4, text: "Bulaşık makinesinde sterilize ediliyor, bu çok güzel.", daysAgo: 38 },
  ],
};

export interface Review {
  author: string;
  rating: number;
  text: string;
  daysAgo: number;
  date: string;
}

export function getReviews(asin: string, category?: string): Review[] {
  const h = hashAsin(asin);
  const pool = [
    ...(category && COMMENT_POOL[category] ? COMMENT_POOL[category] : []),
    ...COMMENT_POOL.default,
  ];
  // 4-6 review seç, hash'e göre rotation
  const count = 4 + (h % 3);
  const start = h % pool.length;
  const picked: typeof pool = [];
  for (let i = 0; i < count; i++) {
    picked.push(pool[(start + i) % pool.length]);
  }
  // Türkçe tarih formatı
  const today = new Date();
  return picked.map((r) => {
    const d = new Date(today);
    d.setDate(d.getDate() - r.daysAgo);
    return {
      ...r,
      date: d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }),
    };
  });
}

// Toplam yorum sayısı (gerçekçi: gösterilenden fazla)
export function getTotalCommentCount(asin: string): number {
  const h = hashAsin(asin);
  return 8 + (h % 142);
}
