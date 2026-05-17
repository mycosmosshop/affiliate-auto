import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gizlilik Politikası | Cosmositio",
  description:
    "Cosmositio gizlilik politikası — kişisel verileriniz, çerezler ve Amazon.com.tr bağlantıları hakkında bilgilendirme.",
};

export default function GizlilikPage() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-16">
      <header className="mb-10">
        <p className="text-pink-600 text-xs uppercase tracking-widest mb-3">
          Gizlilik Politikası
        </p>
        <h1 className="font-display text-4xl font-bold leading-tight">
          Gizlilik Politikası
        </h1>
        <p className="text-stone-500 text-sm mt-3">
          Son güncelleme: 16 Mayıs 2026
        </p>
      </header>

      <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed space-y-6">
        <section>
          <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
            1. Giriş
          </h2>
          <p>
            Cosmositio (&quot;biz&quot;, &quot;site&quot;), kullanıcılarımızın
            gizliliğine değer verir. Bu Gizlilik Politikası, sitemizi
            ziyaret ettiğinizde hangi bilgilerin toplandığını, nasıl
            kullanıldığını ve haklarınızı açıklar.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
            2. Amazon.com.tr Bağlantıları Hakkında
          </h2>
          <p>
            Sitemizde yer alan ürün bağlantıları, Amazon.com.tr&apos;deki
            ilgili ürün sayfalarına yönlendirme amaçlıdır. Bu bağlantılar
            üzerinden bir satın alma gerçekleştirseniz dahi, sizin için
            herhangi bir ek maliyet veya fiyat farkı söz konusu değildir.
          </p>
          <p>
            Önerilerimiz; kullanıcı yorumları, ürün özellikleri ve içerik
            analizine dayanır. Bizim için ödeme yapan ya da sponsorluk
            sağlayan herhangi bir markaya öncelik vermiyoruz.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
            3. Topladığımız Bilgiler
          </h2>
          <p>
            Cosmositio, kullanıcılarından <strong>kişisel veri toplamaz</strong>.
            Spesifik olarak:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Adınız, e-posta veya iletişim bilgileri (bize gönüllü olarak yazmadığınız sürece)</li>
            <li>Ödeme bilgileri</li>
            <li>Tarama geçmişi veya bizim koyduğumuz çerezler</li>
            <li>Konum bilgisi</li>
          </ul>
          <p>
            Bize doğrudan e-posta yazarsanız, sadece yanıtlamak amacıyla
            adınız ve iletişim bilgileriniz kullanılır.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
            4. Üçüncü Taraf Hizmetler
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Amazon.com.tr:</strong> Bir ürün bağlantısına
              tıklayıp Amazon&apos;a giderseniz, Amazon&apos;un kendi{" "}
              <a
                href="https://www.amazon.com.tr/gp/help/customer/display.html?nodeId=GX7NJQ4ZB8MHFRNJ"
                className="text-pink-700 underline"
                target="_blank"
                rel="noopener"
              >
                Gizlilik Politikası
              </a>{" "}
              geçerlidir. Cosmositio, Amazon üzerindeki adınız, adresiniz
              veya ödeme detaylarınıza erişemez — yalnızca anonim,
              toplam komisyon raporları alır.
            </li>
            <li>
              <strong>Vercel (hosting):</strong> Bu site, Vercel
              platformunda barındırılır. Vercel&apos;in standart sunucu
              logları geçerli olabilir.
            </li>
            <li>
              <strong>Pinterest:</strong> Sitedeki bazı pin&apos;ler
              Pinterest&apos;ten gömülmüş olabilir. Pinterest&apos;in
              kendi gizlilik politikası geçerlidir.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
            5. Çerezler
          </h2>
          <p>
            Cosmositio kendi tarama çerezi kullanmaz. Amazon
            bağlantısına tıkladığınızda, Amazon&apos;un ortaklık tıklama
            takibi (cookie tabanlı, 24 saat süreli) kullanılır — bu,
            ürünü o tıklama sonrası satın alırsanız komisyon
            atanabilmesi içindir.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
            6. Çocukların Gizliliği
          </h2>
          <p>
            Cosmositio, 13 yaşın altındaki çocuklara yönelik içerik
            üretmez ve onlardan bilerek bilgi toplamaz. Beauty içerik
            yetişkin tüketiciler içindir.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
            7. Yapay Zeka Kullanımı
          </h2>
          <p>
            Sitemiz, içerik üretiminde ve ürün önerilerinde yapay zeka
            (OpenAI) kullanabilir. Yapay zeka çıktıları{" "}
            <strong>bilgilendirme amaçlıdır</strong>, tıbbi veya
            profesyonel cilt bakım tavsiyesi yerine geçmez. Cilt sağlığı
            konularında bir dermatoloğa danışın.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
            8. Haklarınız (KVKK)
          </h2>
          <p>
            Kişisel veri toplamadığımız için klasik KVKK erişim/silme
            talepleri bize doğrudan uygulanmaz. Amazon&apos;da tutulan
            verileriniz için Amazon&apos;a, Vercel logları için
            Vercel&apos;e başvurabilirsiniz.
          </p>
          <p>
            Bize gönüllü olarak e-posta yazdıysanız, talep üzerine
            iletişim geçmişinizi sileriz:{" "}
            <a
              href="mailto:volkanpekatik@gmail.com"
              className="text-pink-700 underline"
            >
              volkanpekatik@gmail.com
            </a>
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
            9. Politika Güncellemeleri
          </h2>
          <p>
            Bu politikayı zaman zaman güncelleyebiliriz. Önemli
            değişiklikler en üstteki &quot;Son güncelleme&quot; tarihiyle
            belirtilir. Sitenin kullanımına devam etmeniz, güncel
            politikayı kabul ettiğiniz anlamına gelir.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
            10. İletişim
          </h2>
          <p>
            Sorularınız için:
            <br />
            📧{" "}
            <a
              href="mailto:volkanpekatik@gmail.com"
              className="text-pink-700 underline"
            >
              volkanpekatik@gmail.com
            </a>
            <br />
            📞 +90 542 793 9382
            <br />
            📍 İstasyon Mah. Cengiz Topel Cad. No:111/2 C Blok 59500 Çerkezköy / Tekirdağ
          </p>
        </section>

        <hr className="my-10 border-stone-200" />
        <p className="text-xs text-stone-500">
          © 2026 cosmositio. Bu sayfa GitHub üzerinde versiyon
          kontrollüdür ve Vercel platformunda barındırılır.
        </p>
      </div>
    </article>
  );
}
