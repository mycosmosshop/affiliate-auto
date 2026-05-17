import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  if (locale === "de") {
    return {
      title: "Datenschutz | Cosmositio",
      description:
        "Cosmositio Datenschutzerklärung — Hinweise zu personenbezogenen Daten, Cookies und Amazon-Links.",
    };
  }
  return {
    title: "Gizlilik Politikası | Cosmositio",
    description:
      "Cosmositio gizlilik politikası — kişisel verileriniz, çerezler ve Amazon.de bağlantıları hakkında bilgilendirme.",
  };
}

export default async function GizlilikPage() {
  const locale = await getLocale();

  if (locale === "de") {
    return (
      <article className="max-w-3xl mx-auto px-6 py-16">
        <header className="mb-10">
          <p className="text-pink-600 text-xs uppercase tracking-widest mb-3">
            Datenschutz
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight">
            Datenschutzerklärung
          </h1>
          <p className="text-stone-500 text-sm mt-3">
            Letzte Aktualisierung: 17. Mai 2026
          </p>
        </header>

        <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed space-y-6">
          <section>
            <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
              1. Einleitung
            </h2>
            <p>
              Cosmositio (&quot;wir&quot;, &quot;die Website&quot;) respektiert
              die Privatsphäre unserer Besucher. Diese Datenschutzerklärung
              informiert dich darüber, welche Daten beim Besuch unserer Seite
              erfasst werden und wie sie verwendet werden.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
              2. Amazon Deutschland Links
            </h2>
            <p>
              Die Produktlinks auf unserer Website führen zu den
              entsprechenden Produktseiten auf Amazon Deutschland. Wenn du
              über diese Links einen Kauf tätigst, entstehen dir keine
              zusätzlichen Kosten oder Preisaufschläge.
            </p>
            <p>
              Unsere Empfehlungen basieren auf Nutzerbewertungen,
              Produkteigenschaften und inhaltlicher Analyse. Wir bevorzugen
              keine Marke aufgrund von Bezahlung oder Sponsoring.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
              3. Welche Daten wir erfassen
            </h2>
            <p>
              Cosmositio erfasst <strong>keine personenbezogenen Daten</strong>{" "}
              von Besuchern. Konkret nicht:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Name, E-Mail oder Kontaktdaten (außer du schreibst uns freiwillig)</li>
              <li>Zahlungsinformationen</li>
              <li>Browser-Historie oder eigene Tracking-Cookies</li>
              <li>Standortinformationen</li>
            </ul>
            <p>
              Wenn du uns direkt per E-Mail schreibst, verwenden wir deinen
              Namen und deine Kontaktdaten ausschließlich zur Beantwortung.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
              4. Drittanbieter-Dienste
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Amazon Deutschland:</strong> Wenn du auf einen
                Produktlink klickst, gilt die{" "}
                <a
                  href="https://www.amazon.de/gp/help/customer/display.html?nodeId=201909010"
                  className="text-pink-700 underline"
                  target="_blank"
                  rel="noopener"
                >
                  Datenschutzerklärung von Amazon
                </a>
                . Cosmositio hat keinen Zugriff auf deinen Namen, deine
                Adresse oder Zahlungsdaten — nur auf anonyme aggregierte
                Verkaufsberichte.
              </li>
              <li>
                <strong>Vercel (Hosting):</strong> Diese Seite wird auf der
                Vercel-Plattform gehostet. Vercels Standard-Serverlogs können
                anfallen.
              </li>
              <li>
                <strong>Upstash Redis:</strong> Anonyme Aufrufzähler und
                Bewertungen werden in einer Redis-Datenbank gespeichert; ohne
                Bezug zu deiner Identität.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
              5. Cookies
            </h2>
            <p>
              Cosmositio setzt keine eigenen Tracking-Cookies. Beim Klicken
              auf einen Amazon-Link wird das Affiliate-Cookie von Amazon
              (24-Stunden-Tracking) gesetzt — damit eine Provision
              zugeordnet werden kann, falls du das Produkt kaufst.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
              6. Datenschutz für Minderjährige
            </h2>
            <p>
              Cosmositio richtet sich nicht an Personen unter 16 Jahren und
              erfasst keine wissentlichen Daten von ihnen.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
              7. KI-Nutzung
            </h2>
            <p>
              Wir setzen KI (OpenAI) bei der Content-Erstellung und
              Produktempfehlungen ein. KI-Ausgaben sind{" "}
              <strong>rein informativ</strong> und ersetzen keine
              medizinische oder fachliche Beratung. Bei Hautproblemen
              konsultiere bitte einen Dermatologen.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
              8. Deine Rechte (DSGVO)
            </h2>
            <p>
              Da wir keine personenbezogenen Daten erheben, sind klassische
              DSGVO-Auskunfts- und Löschanträge bei uns nicht relevant. Für
              Daten bei Amazon wende dich bitte an Amazon, für Vercel-Logs
              an Vercel.
            </p>
            <p>
              Falls du uns freiwillig per E-Mail kontaktiert hast, kannst
              du jederzeit die Löschung deiner Korrespondenz beantragen:{" "}
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
              9. Aktualisierungen
            </h2>
            <p>
              Wir können diese Richtlinie von Zeit zu Zeit aktualisieren.
              Wichtige Änderungen werden mit dem &quot;Letzte
              Aktualisierung&quot;-Datum oben gekennzeichnet. Die weitere
              Nutzung der Seite gilt als Zustimmung zur aktuellen Fassung.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
              10. Kontakt
            </h2>
            <p>
              Bei Fragen:
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
              📍 İstasyon Mah. Cengiz Topel Cad. No:111/2 C Blok 59500
              Çerkezköy / Tekirdağ, Türkei
            </p>
          </section>

          <hr className="my-10 border-stone-200" />
          <p className="text-xs text-stone-500">
            © 2026 cosmositio. Diese Seite wird auf GitHub versioniert und
            auf Vercel gehostet.
          </p>
        </div>
      </article>
    );
  }

  // TR version
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
          Son güncelleme: 17 Mayıs 2026
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
            2. Amazon.de Bağlantıları Hakkında
          </h2>
          <p>
            Sitemizde yer alan ürün bağlantıları, Amazon Deutschland&apos;daki
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
              <strong>Amazon Deutschland:</strong> Bir ürün bağlantısına
              tıklayıp Amazon&apos;a giderseniz, Amazon&apos;un kendi{" "}
              <a
                href="https://www.amazon.de/gp/help/customer/display.html?nodeId=201909010"
                className="text-pink-700 underline"
                target="_blank"
                rel="noopener"
              >
                Gizlilik Politikası
              </a>{" "}
              geçerlidir. Cosmositio, Amazon üzerindeki adınız, adresiniz
              veya ödeme detaylarınıza erişemez — yalnızca anonim, toplam
              komisyon raporları alır.
            </li>
            <li>
              <strong>Vercel (hosting):</strong> Bu site, Vercel
              platformunda barındırılır. Vercel&apos;in standart sunucu
              logları geçerli olabilir.
            </li>
            <li>
              <strong>Upstash Redis:</strong> Anonim görüntülenme sayacı
              ve yorumlar Redis veritabanında saklanır; kimliğinizle
              eşleşmez.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
            5. Çerezler
          </h2>
          <p>
            Cosmositio kendi tarama çerezi kullanmaz. Amazon bağlantısına
            tıkladığınızda, Amazon&apos;un ortaklık tıklama takibi (cookie
            tabanlı, 24 saat süreli) kullanılır — bu, ürünü o tıklama
            sonrası satın alırsanız komisyon atanabilmesi içindir.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
            6. Çocukların Gizliliği
          </h2>
          <p>
            Cosmositio, 13 yaşın altındaki çocuklara yönelik içerik
            üretmez ve onlardan bilerek bilgi toplamaz.
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
            profesyonel cilt bakım tavsiyesi yerine geçmez.
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
            Bu politikayı zaman zaman güncelleyebiliriz. Önemli değişiklikler
            en üstteki &quot;Son güncelleme&quot; tarihiyle belirtilir.
            Sitenin kullanımına devam etmeniz, güncel politikayı kabul
            ettiğiniz anlamına gelir.
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
          © 2026 cosmositio. Bu sayfa GitHub üzerinde versiyon kontrollüdür
          ve Vercel platformunda barındırılır.
        </p>
      </div>
    </article>
  );
}
