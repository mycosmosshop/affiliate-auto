import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Espresso zu Hause: von der French Press zum Bean-to-Cup – 5 Budgets, 5 Maschinen | Cosmositio Blog",
  description:
    "Eine Kaffeemaschine für jedes Budget von 5 bis 200 EUR: Vergleich von Moka Pot, French Press, Aeropress, Saeco-Halbautomat und DeLonghi Magnifica Evo.",
};

export default function KaffeemaschineGuideDe() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-16">
      <Link
        href="/blog"
        className="text-sm text-stone-500 hover:text-pink-700 mb-6 inline-block"
      >
        ← Blog
      </Link>

      <header className="mb-10">
        <div className="flex items-center gap-3 text-sm text-stone-500 mb-3">
          <span className="bg-pink-50 text-pink-700 px-3 py-1 rounded-full text-xs font-medium">
            ☕ Küche
          </span>
          <span>13. Mai 2026</span>
          <span>·</span>
          <span>9 Min Lesezeit</span>
        </div>
        <h1 className="font-display text-3xl md:text-5xl font-bold leading-tight">
          Espresso zu Hause: Von der French Press zum Bean-to-Cup – 5 Budgets,
          5 Maschinen
        </h1>
        <p className="mt-4 text-xl text-stone-600 leading-relaxed italic">
          Eine ehrliche Kaffeereise vom 10-EUR-Moka-Pot bis zum 200-EUR-
          Vollautomaten – welcher ist für dich übertrieben?
        </p>
      </header>

      <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed text-lg space-y-5">
        <p>
          <strong>Jeden Morgen 4 EUR</strong> für einen Coffee-to-go – im Jahr
          rund 1.500 EUR. Als mir diese Zahl bewusst wurde, fing ich ernsthaft
          an, zu Hause Kaffee zu kochen. In den letzten 4 Jahren habe ich 5
          verschiedene Methoden ausprobiert; hier teile ich meine echten
          Erfahrungen in jeder Preisklasse.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          1. 10–20 EUR: Moka Pot (Bialetti) ☕
        </h2>
        <p>
          Ein italienischer Klassiker. Eine Edelstahl- oder Aluminiumkanne, die
          auf dem Herd das Wasser unten erhitzt und mit Druck durch den Kaffee
          nach oben drückt. Das Original von Bialetti ist <strong>100 Jahre
          altes Design</strong> und denkbar einfach: Wasser rein, Kaffee rein,
          auf den Herd.
        </p>
        <p>
          Das Ergebnis ist kein &quot;echter Espresso&quot;, aber kräftig und
          cremig – der hausgemachte Kaffee, der dem Espresso am nächsten kommt.
          Keine Wartung, kein Strom, hält 50 Jahre. Die klügste Investition als
          erste Kaffeemaschine.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          2. 25–70 EUR: French Press + Handmühle
        </h2>
        <p>
          Bodum French Press (15–25 EUR) + eine Handmühle (Hario Slim oder
          Timemore Chestnut, 30–60 EUR). Diese Kombination liefert
          <strong> frisch gemahlen + reine Brühung</strong> – kein Espresso,
          dafür ein vollwertiges Filterkaffeeerlebnis.
        </p>
        <p>
          Das Geheimnis der French Press: 4 Minuten Brühzeit. Stoppt sie mit
          einem Timer. Zu kurz = schwach, zu lang = bitter. Wenn du diesen
          Bereich triffst, schlägst du zu Hause die meisten Café-Kaffees.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          3. 70–120 EUR: Aeropress + Thermoskanne
        </h2>
        <p>
          Warum der Favorit der Baristas? Weil sie in <strong>5 Minuten eine
          Tasse</strong> Kaffee mit espressoähnlicher Intensität macht, in
          Sekunden gereinigt ist und dank Papierfilter ein sedimentfreies
          Ergebnis liefert.
        </p>
        <p>
          Aeropress (40–55 EUR) + Timemore C2 Handmühle (50–70 EUR) ist ein
          Profi-Setup, das du sogar auf Reisen mitnehmen kannst. Filterkaffee,
          Espresso-Stil, Cold Brew – alle drei sind möglich.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          4. 120–250 EUR: Halbautomatischer Espresso (Saeco / Gaggia)
        </h2>
        <p>
          Hier wird&apos;s ernst. Echte 9 Bar Druck, Siebträger, Milchschäumer –
          also ein <strong>echtes Barista-Erlebnis</strong>. Saeco Aroma oder
          Gaggia Classic Pro sind Klassiker.
        </p>
        <p>
          Aber Achtung: Eine Siebträgermaschine ist ein <strong>Hobby</strong>.
          Mahlgrad, Tampen, Milchschäumen – das dauert 1–2 Monate Lernkurve. Für
          Leute, die nur schnell Kaffee wollen, ist das die falsche Kategorie.
          Wer aber wirklich kaffeebegeistert ist, holt hier alles raus.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          5. ab 200 EUR: DeLonghi Magnifica Evo (Bean-to-Cup)
        </h2>
        <p>
          Vollautomat. Bohnen einfüllen, Knopf drücken – mahlt, brüht,
          schäumt Milch, gibt sie in die Tasse. <strong>Null Lernkurve</strong>.
          Der sicherste Weg, morgens verschlafen an einen guten Kaffee zu
          kommen.
        </p>
        <p>
          Der Preis: 200–400 EUR. Wartung gehört dazu (Entölen, Entkalken,
          Wassertank-Reinigung). In einer kaffeebegeisterten Familie amortisiert
          sich das Gerät in 2–3 Jahren, für Singles ist es überdimensioniert.
          Der Milchschäumer der Magnifica Evo ist automatisch – das
          LatteCrema-System funktioniert wirklich gut.
        </p>

        <hr className="my-10 border-stone-200" />

        <h2 className="font-display text-2xl font-bold text-stone-900">
          Wie wählt man Kaffeebohnen aus?
        </h2>
        <p>
          Wichtiger als die Maschine sind die Bohnen. Im Supermarkt gemahlener
          Kaffee wurde im Schnitt vor <strong>6 Monaten</strong> verpackt – nicht
          frisch. Hol dir Bohnen aus einer Spezialitätenrösterei (z. B. The
          Barn, Five Elephant, Bonanza).
        </p>
        <p>
          Achte auf dem Etikett auf das Röstdatum – 2–3 Wochen alt ist ideal.
          Bohnen, die älter als 3 Monate sind, verlieren ihr Aroma und schmecken
          nach Pappe. Unter den deutschen Marken sind The Barn und Bonanza
          Coffee Roasters Beispiele für frische Röstung.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          Warum frisch mahlen?
        </h2>
        <p>
          Gemahlener Kaffee verliert <strong>nach 15 Minuten</strong> die Hälfte
          seines Aromas. Deshalb wird in Spezialitätencafés jeder Espresso
          frisch gemahlen. Vorgemahlenen Kaffee in einer Espressomaschine zu
          verwenden ist, als würde man in einen Lamborghini Diesel statt Benzin
          tanken.
        </p>
        <p>
          Lösung: eine Mühle mit Kegelmahlwerk (conical burr). Handmühle
          (Timemore, 1Zpresso) 40–80 EUR, elektrisch (Baratza Encore) ca.
          150 EUR. Reserviere <strong>30–40 %</strong> deines Maschinenbudgets
          für die Mühle – das ist die goldene Regel.
        </p>

        <hr className="my-10 border-stone-200" />

        <div className="bg-pink-50 border border-pink-200 rounded-2xl p-6 not-prose">
          <p className="text-stone-700">
            <strong>Kaffeetipp:</strong> Lieber eine 15-EUR-Moka-Pot mit frischen
            Bohnen als ein 250-EUR-Vollautomat mit altem Kaffee. Das Geheimnis
            steckt in den Zutaten – die Ausrüstung ist zweitrangig.
          </p>
        </div>

        <p className="text-sm text-stone-500 mt-8">
          <strong>Transparenz:</strong> Die Produktempfehlungen in diesem
          Artikel basieren auf Nutzerbewertungen und inhaltlichen Recherchen;
          wir stehen in keiner bezahlten Kooperation mit den genannten Marken.
        </p>
      </div>
    </article>
  );
}
