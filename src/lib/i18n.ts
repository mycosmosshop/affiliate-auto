// Host-tabanlı locale detection
// shop.cosmositio.com → "tr"
// laden.cosmositio.com → "de"
// localhost / diğer → "tr" (default)

import { headers } from "next/headers";

export type Locale = "tr" | "de";

export async function getLocale(): Promise<Locale> {
  const h = await headers();
  const host = (h.get("host") || "").toLowerCase();
  if (host.startsWith("laden.")) return "de";
  return "tr";
}

// Translation dictionary
export const messages = {
  tr: {
    // Header
    nav_home: "Ana Sayfa",
    nav_blog: "Blog",
    nav_about: "Hakkımızda",
    nav_contact: "İletişim",

    // Hero
    hero_badge: "Bu hafta güncellendi",
    hero_title_part1: "Türkiye'nin",
    hero_title_highlight: "trend ürün",
    hero_title_part2: "rehberi.",
    hero_sub: (n: number) =>
      `Amazon Deutschland'taki binlerce ürünü inceliyor, kullanıcı yorumlarıyla öne çıkanları her hafta sizin için tek bir sayfada topluyoruz.`,
    cta_browse: "Trend ürünleri gör ↓",
    cta_guides: "Satın alma rehberlerini oku",
    stats_products: "İncelenmiş Ürün",
    stats_categories: "Kategori",
    stats_realtime: "Güncel",

    // Categories
    cat_products_count: (n: number) => `${n} ürün incelemesi`,

    // Product card
    card_amazon_link: "Amazon'da gör:",
    card_review: "İncele →",

    // Product detail
    detail_breadcrumb_home: "Ana Sayfa",
    detail_breadcrumb_review: "İnceleme",
    detail_current_price: "Güncel Fiyat",
    detail_amazon_cta: "Amazon'da Gör →",
    detail_review_title: "Ürün İncelemesi",
    detail_pros: "✅ Artıları",
    detail_cons: "⚠️ Dikkat Edilecekler",
    detail_who_for: "Kimler için uygun?",
    detail_who_for_text:
      "Bu ürün, kalite/fiyat oranı arayan, dürüst kullanıcı yorumlarına önem veren ve hızlı kargo + iade güvencesinden faydalanmak isteyen kullanıcılar için ideal bir seçimdir.",
    detail_buy_cta: "Güncel fiyat ve stok için:",
    detail_view_on: "Amazon'da Görüntüle →",
    detail_transparency_title: "Şeffaflık:",
    detail_transparency_text:
      "Yukarıdaki bağlantı, ürünü Amazon üzerinde görüntülemenizi sağlar. Bu bağlantıyı kullanmanız sizin için herhangi bir ek maliyet oluşturmaz. Ürün önerilerimiz, kullanıcı yorumları ve içerik analizine dayanır; hiçbir markayla ücretli iş birliğimiz bulunmamaktadır.",
    detail_related_title: (cat: string) =>
      `${cat} kategorisinden diğer öneriler`,

    // Reviews
    reviews_title: "Yorumlar",
    reviews_count: (n: number) => `${n} kullanıcı yorumu`,
    reviews_avg: "Ortalama",
    reviews_empty_title: "Henüz yorum yok",
    reviews_empty_sub: "Bu ürünün ilk yorumunu sen yaz, başkalarına yardımcı ol!",
    reviews_write: "Yorum bırak",
    reviews_name: "İsim",
    reviews_name_placeholder: "Adın...",
    reviews_rating: "Puan",
    reviews_comment: "Yorumun",
    reviews_comment_placeholder: "Bu ürünü nasıl buldun? Deneyimini paylaş...",
    reviews_submit: "Yorumu gönder",
    reviews_submitting: "Gönderiliyor...",
    reviews_disclaimer:
      "Yorumlar moderasyondan geçtikten sonra yayınlanır. E-posta adresi paylaşılmaz.",
    views_label: "görüntülenme",

    // Footer
    footer_about: "Amazon Deutschland'da yer alan, gerçek kullanıcı yorumlarıyla öne çıkan ürünleri özenle seçer ve sizinle paylaşırız.",
    footer_site: "Site",
    footer_contact: "İletişim",
  },
  de: {
    // Header
    nav_home: "Startseite",
    nav_blog: "Blog",
    nav_about: "Über uns",
    nav_contact: "Kontakt",

    // Hero
    hero_badge: "Diese Woche aktualisiert",
    hero_title_part1: "Dein",
    hero_title_highlight: "Trend-Produkt",
    hero_title_part2: "Guide.",
    hero_sub: (_n: number) =>
      `Wir prüfen tausende Produkte auf Amazon Deutschland und sammeln die besten – basierend auf echten Nutzerbewertungen – jede Woche auf einer Seite.`,
    cta_browse: "Trend-Produkte ansehen ↓",
    cta_guides: "Kaufratgeber lesen",
    stats_products: "Geprüfte Produkte",
    stats_categories: "Kategorien",
    stats_realtime: "Aktuell",

    cat_products_count: (n: number) => `${n} Produktbewertungen`,

    // Product card
    card_amazon_link: "Auf Amazon ansehen:",
    card_review: "Details →",

    // Product detail
    detail_breadcrumb_home: "Startseite",
    detail_breadcrumb_review: "Test",
    detail_current_price: "Aktueller Preis",
    detail_amazon_cta: "Auf Amazon ansehen →",
    detail_review_title: "Produkttest",
    detail_pros: "✅ Vorteile",
    detail_cons: "⚠️ Worauf achten",
    detail_who_for: "Für wen geeignet?",
    detail_who_for_text:
      "Dieses Produkt ist ideal für Käufer, die Wert auf Preis-Leistung, ehrliche Nutzerbewertungen sowie schnellen Versand und unkomplizierte Rückgabe legen.",
    detail_buy_cta: "Für aktuellen Preis und Verfügbarkeit:",
    detail_view_on: "Auf Amazon anzeigen →",
    detail_transparency_title: "Transparenz:",
    detail_transparency_text:
      "Der obige Link führt zur Produktseite auf Amazon. Dir entstehen dadurch keine zusätzlichen Kosten. Unsere Empfehlungen basieren auf Nutzerbewertungen und inhaltlicher Analyse; es bestehen keine bezahlten Markenkooperationen.",
    detail_related_title: (cat: string) =>
      `Weitere Empfehlungen aus ${cat}`,

    // Reviews
    reviews_title: "Bewertungen",
    reviews_count: (n: number) => `${n} Nutzerbewertungen`,
    reviews_avg: "Durchschnitt",
    reviews_empty_title: "Noch keine Bewertung",
    reviews_empty_sub: "Schreib die erste Bewertung und hilf anderen Käufern!",
    reviews_write: "Bewertung schreiben",
    reviews_name: "Name",
    reviews_name_placeholder: "Dein Name...",
    reviews_rating: "Sterne",
    reviews_comment: "Deine Bewertung",
    reviews_comment_placeholder:
      "Wie hat dir das Produkt gefallen? Teile deine Erfahrung...",
    reviews_submit: "Bewertung senden",
    reviews_submitting: "Wird gesendet...",
    reviews_disclaimer:
      "Bewertungen werden nach Moderation veröffentlicht. E-Mail-Adressen werden nicht geteilt.",
    views_label: "Aufrufe",

    // Footer
    footer_about: "Wir prüfen Produkte auf Amazon Deutschland und teilen die besten – basierend auf echten Nutzerbewertungen – mit dir.",
    footer_site: "Seite",
    footer_contact: "Kontakt",
  },
} as const;

export function t(locale: Locale) {
  return messages[locale];
}

// Kategori adlarını locale'e göre çevir
export const CATEGORY_LABEL: Record<Locale, Record<string, string>> = {
  tr: {
    Teknoloji: "Teknoloji",
    Mutfak: "Mutfak",
    Güzellik: "Güzellik",
    "Spor & Sağlık": "Spor & Sağlık",
    "Anne & Bebek": "Anne & Bebek",
  },
  de: {
    Teknoloji: "Technologie",
    Mutfak: "Küche",
    Güzellik: "Beauty",
    "Spor & Sağlık": "Sport & Gesundheit",
    "Anne & Bebek": "Mama & Baby",
  },
};

export function localizeCategory(cat: string, locale: Locale): string {
  return CATEGORY_LABEL[locale][cat] || cat;
}
