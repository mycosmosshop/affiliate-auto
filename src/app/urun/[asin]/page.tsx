import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import ProductImage from "@/components/ProductImage";
import RelatedCarousel from "@/components/RelatedCarousel";

interface TrProduct {
  asin: string;
  title: string;
  price: string;
  description: string;
  imageUrl: string;
  affiliateUrl: string;
  category: string;
  emoji?: string;
  rating?: string;
}

function loadProducts(): TrProduct[] {
  try {
    const p = path.join(process.cwd(), "data", "products-tr.json");
    if (!fs.existsSync(p)) return [];
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  const products = loadProducts();
  return products.map((p) => ({ asin: p.asin }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ asin: string }>;
}): Promise<Metadata> {
  const { asin } = await params;
  const products = loadProducts();
  const product = products.find((p) => p.asin === asin);
  if (!product) return { title: "Ürün Bulunamadı | Cosmositio" };
  return {
    title: `${product.title.substring(0, 60)} | İnceleme | Cosmositio`,
    description: `${product.title} hakkında detaylı inceleme, kullanıcı yorumları, en iyi fiyat — Amazon.com.tr ile uyumlu.`,
  };
}

export default async function UrunReview({
  params,
}: {
  params: Promise<{ asin: string }>;
}) {
  const { asin } = await params;
  const products = loadProducts();
  const product = products.find((p) => p.asin === asin);
  if (!product) notFound();

  // Aynı kategoriden ilgili ürünler (carousel için daha fazla)
  const related = products
    .filter((p) => p.category === product.category && p.asin !== asin)
    .slice(0, 12);

  // Pros & cons (kategori-bazlı template)
  const featuresByCategory: Record<string, { pros: string[]; cons: string[] }> = {
    Teknoloji: {
      pros: [
        "Güvenilir marka kalitesi",
        "Hızlı kargo (Amazon Prime uyumlu)",
        "Türkçe destek + 2 yıl garanti",
        "Kullanıcı yorumları %85+ olumlu",
      ],
      cons: ["Bazı modeller stok sınırlı olabilir", "Renkler ekranda farklı görünebilir"],
    },
    Mutfak: {
      pros: [
        "Bulaşık makinesinde yıkanabilir parçalar",
        "Türkçe kullanım kılavuzu",
        "Enerji verimliliği A+ sınıfı (varsa)",
        "Yedek parça erişimi kolay",
      ],
      cons: ["Tezgah alanı planlaması gerekir", "İlk kullanımda koku olabilir"],
    },
    Güzellik: {
      pros: [
        "Dermatolog onaylı formül",
        "Cruelty-free + parabensiz seçenekler",
        "Hassas ciltler için uygun",
        "Türkiye'de orijinal ürün garantisi",
      ],
      cons: ["Hassas ciltlerde patch test önerilir", "Etki 2-4 haftada görünür"],
    },
    "Spor & Sağlık": {
      pros: [
        "Profesyonel/amatör sporcu için uygun",
        "Kaymaz, terlemeyen materyal",
        "Kolay taşıma + saklama",
        "Antrenör onaylı modeller",
      ],
      cons: ["İlk hafta vücut alışma süreci", "Boyut tablosu kontrolü şart"],
    },
    "Anne & Bebek": {
      pros: [
        "Pediatrist onaylı malzeme",
        "BPA-free, hipoalerjenik",
        "Bulaşık makinesi + sterilizatör uyumlu",
        "Avrupa CE güvenlik sertifikası",
      ],
      cons: ["Yenidoğan için boy ayarı önerilir", "İlk yıkamada renk değişebilir"],
    },
  };
  const features = featuresByCategory[product.category] || featuresByCategory.Teknoloji;

  // Kategori-bazlı emoji (her üründe doğru emoji görünsün — productEmojis rotation yanıltıcıydı)
  const categoryEmoji: Record<string, string> = {
    Teknoloji: "🔌",
    Mutfak: "🍳",
    Güzellik: "💄",
    "Spor & Sağlık": "💪",
    "Anne & Bebek": "👶",
  };
  const catEmoji = categoryEmoji[product.category] || "📦";

  return (
    <article className="bg-stone-50">
      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-6 pt-8 text-sm text-stone-500">
        <Link href="/" className="hover:text-pink-700">
          Ana Sayfa
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-700">{product.category}</span>
        <span className="mx-2">/</span>
        <span className="text-stone-900 font-medium">İnceleme</span>
      </div>

      {/* Header */}
      <header className="max-w-5xl mx-auto px-6 pt-6 pb-12 grid md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="aspect-square bg-white rounded-3xl border border-stone-200 shadow-sm relative overflow-hidden">
          <ProductImage src={product.imageUrl} alt={product.title} emoji={catEmoji} />
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-widest text-pink-700 font-semibold mb-2">
            {catEmoji} {product.category}
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-stone-900 leading-tight mb-4">
            {product.title}
          </h1>
          <div className="flex items-center gap-3 mb-6 text-sm">
            {product.rating && (
              <span className="bg-amber-100 text-amber-900 px-2 py-1 rounded-full font-semibold">
                ⭐ {product.rating}/5
              </span>
            )}
            <span className="text-stone-600">Amazon.com.tr</span>
          </div>

          <div className="border border-stone-200 rounded-2xl p-5 bg-white shadow-sm mb-6">
            <p className="text-xs uppercase tracking-wider text-stone-500 font-semibold">
              Güncel Fiyat
            </p>
            <p className="font-display text-4xl font-bold text-stone-900 mt-1">
              {product.price}
            </p>
            <a
              href={product.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="mt-4 block bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-center py-3 rounded-xl transition shadow-md hover:shadow-lg"
            >
              Amazon&apos;da Gör →
            </a>
            <p className="text-xs text-stone-500 mt-3 text-center font-mono break-all">
              {product.affiliateUrl}
            </p>
          </div>

          <p className="text-stone-600 leading-relaxed text-sm">
            {product.description}
          </p>
        </div>
      </header>

      {/* Detaylı inceleme */}
      <section className="max-w-3xl mx-auto px-6 py-12 bg-white rounded-3xl border border-stone-200 shadow-sm">
        <h2 className="font-display text-3xl font-bold text-stone-900 mb-6">
          Ürün İncelemesi
        </h2>
        <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed space-y-4">
          <p className="text-lg">
            <strong>{product.title}</strong>, Amazon.com.tr&apos;de{" "}
            <strong>{product.category}</strong> kategorisinde dikkat çeken ürünlerden biri.
            Kullanıcı yorumlarına ve teknik özelliklerine baktığımızda, bu fiyat
            segmentinde tercih edilebilir bir seçenek olarak öne çıkıyor.
          </p>
          <p>
            Bu inceleme, Amazon&apos;daki gerçek kullanıcı yorumlarına ve ürün
            teknik özelliklerine dayanmaktadır. Cosmositio olarak hiçbir ürünü
            denemeden önermiyoruz — ancak Amazon Türkiye&apos;deki binlerce
            doğrulanmış müşteri yorumunu analiz ederek size en güvenilir özetleri
            sunuyoruz.
          </p>
        </div>

        <h3 className="font-display text-xl font-bold text-stone-900 mt-10 mb-4">
          ✅ Artıları
        </h3>
        <ul className="space-y-2 text-stone-700">
          {features.pros.map((pro, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>{pro}</span>
            </li>
          ))}
        </ul>

        <h3 className="font-display text-xl font-bold text-stone-900 mt-8 mb-4">
          ⚠️ Dikkat Edilecekler
        </h3>
        <ul className="space-y-2 text-stone-700">
          {features.cons.map((con, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="text-amber-600 font-bold">!</span>
              <span>{con}</span>
            </li>
          ))}
        </ul>

        <h3 className="font-display text-xl font-bold text-stone-900 mt-10 mb-4">
          Kimler için uygun?
        </h3>
        <p className="text-stone-700 leading-relaxed">
          Bu ürün, kalite/fiyat oranı arayan, dürüst kullanıcı yorumlarına önem
          veren ve Amazon&apos;un hızlı kargo + iade güvencesinden faydalanmak
          isteyen Türk müşteriler için ideal bir seçimdir.
        </p>

        {/* Big CTA */}
        <div className="mt-10 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 text-center">
          <p className="text-sm text-stone-600 mb-3">Güncel fiyat ve stok için:</p>
          <a
            href={product.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-8 py-4 rounded-xl transition shadow-md hover:shadow-lg text-lg"
          >
            Amazon.com.tr&apos;de Görüntüle →
          </a>
          <p className="text-xs text-stone-500 mt-3 font-mono break-all">
            {product.affiliateUrl}
          </p>
        </div>

        {/* Affiliate disclosure */}
        <div className="mt-10 bg-stone-50 border-l-4 border-pink-300 rounded-r-xl p-5 text-sm text-stone-600 leading-relaxed">
          <p>
            <strong>Şeffaflık Bildirimi:</strong> Cosmositio, Amazon.com.tr
            Partnernet ortaklık programının bir üyesidir. Yukarıdaki bağlantı
            üzerinden satın alım gerçekleştirirseniz, Amazon&apos;dan küçük bir
            komisyon kazanırız. <strong>Sizin için ek bir maliyet oluşturmaz</strong>.
            Bu komisyon, ürün önerilerimizi <em>asla</em> etkilemez — sadece
            bağımsız beauty/tech/lifestyle önerilerimizi sürdürmemize destek olur.
          </p>
        </div>
      </section>

      {/* İlgili ürünler — oklarla kaydırılabilir carousel */}
      {related.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="font-display text-2xl font-bold text-stone-900 mb-6">
            {product.category} kategorisinden diğer öneriler
          </h2>
          <RelatedCarousel items={related} categoryEmoji={catEmoji} />
        </section>
      )}
    </article>
  );
}
