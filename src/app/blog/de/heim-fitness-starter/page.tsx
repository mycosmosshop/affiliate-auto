import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Heim-Fitness starten: minimale Ausrüstungsliste für unter 30 EUR | Cosmositio Blog",
  description:
    "Die 7 Geräte, die du wirklich brauchst, um zu Hause mit Sport anzufangen. Yogamatte, Widerstandsband, Hanteln, Kettlebell und Springseil – zusammen unter 30 EUR.",
};

export default function HeimFitnessStarterDe() {
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
            💪 Sport & Gesundheit
          </span>
          <span>16. Mai 2026</span>
          <span>·</span>
          <span>7 Min Lesezeit</span>
        </div>
        <h1 className="font-display text-3xl md:text-5xl font-bold leading-tight">
          Heim-Fitness starten: minimale Ausrüstungsliste für unter 30 EUR
        </h1>
        <p className="mt-4 text-xl text-stone-600 leading-relaxed italic">
          Du brauchst kein Peloton, um dem Fitnessstudio Tschüss zu sagen. Starte
          mit 7 einfachen Geräten – günstiger als ein Monat Mitgliedschaft.
        </p>
      </header>

      <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed text-lg space-y-5">
        <p>
          Ich war einmal 6 Monate Mitglied im Fitnessstudio – meine
          tatsächliche Quote lag bei <strong>15 %</strong>. Anfahrt, Wetter,
          Andrang – alles Ausreden. Ein minimales Setup zu Hause räumte diese
          Hindernisse komplett aus dem Weg. Hier sind die 7 Teile für unter
          30 EUR, die ich wirklich nutze:
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          1. Yogamatte 🧘
        </h2>
        <p>
          Preis: 8–20 EUR. Reebok oder Decathlon (Domyos) sind die sichersten
          Optionen. 6 mm Dicke reichen zum Schutz der Gelenke; dickere Matten
          können bei Balanceübungen <strong>sogar Verletzungen begünstigen</strong>.
        </p>
        <p>
          Liegestütze, Plank, Yoga, Pilates – alles auf dieser Matte. Auf
          Parkett oder Fliesen direkt zu trainieren ruiniert die Knie; selbst
          eine günstige Matte macht einen riesigen Unterschied.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          2. Widerstandsband-Set
        </h2>
        <p>
          Preis: ca. 8 EUR (5er-Set). Meiner Meinung nach das wertvollste Teil
          auf dieser Liste. Mit verschiedenen Widerstandsstufen (5–25 kg)
          ersetzt es Hanteln und wird zusätzlich von Physiotherapeuten für
          <strong> Sehnen- und Schulter-Reha</strong> empfohlen.
        </p>
        <p>
          Passt auf Reisen in jeden Koffer. Im Hotelzimmer reicht es allein für
          ein Ganzkörpertraining.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          3. Verstellbares Hantel-Set (5–10 kg)
        </h2>
        <p>
          Preis: ca. 25–40 EUR. Statt 8 Hanteln mit festen Gewichten kauf ein
          verstellbares Paar – du erweiterst es <strong>von 2,5 kg auf 10 kg</strong>
          durch Wechselscheiben. Enorme Platzersparnis.
        </p>
        <p>
          Für den Einstieg reicht ein 10-kg-Paar. Nach 6–12 Monaten kannst du
          bei Bedarf weitere Scheiben ergänzen. Gummibeschichtete Hex-Hanteln
          schonen das Parkett.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          4. Yogablock + Gurt
        </h2>
        <p>
          Preis: ca. 10 EUR. Die &quot;Geheimwaffe&quot; bei Mobility- und
          Dehnübungen. Vor allem, wenn du den Boden <strong>nicht erreichst</strong>
          (was bei den meisten der Fall ist), bringt der Block den Boden näher
          zu dir.
        </p>
        <p>
          Der Yogagurt (Strap) dient als Verlängerung bei Posen, in denen du
          deine Füße nicht erreichst. In den ersten 6 Monaten unverzichtbar,
          danach nimmt der Bedarf ab.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          5. Springseil (CrossFit-Stil)
        </h2>
        <p>
          Preis: ca. 10–18 EUR. <strong>Kauf niemals</strong> ein Plastik-
          Kinderseil – nimm ein kugelgelagertes (Ball-Bearing) CrossFit-Seil.
          Günstige Schnüre verdrehen sich beim schnellen Springen, der Fuß
          bleibt hängen.
        </p>
        <p>
          10 Minuten Seilspringen entsprechen kalorisch 30 Minuten Spaziergang.
          Modelle mit gummibeschichteten Griffen sind im Mietshaus geräuscharm.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          6. Faszienrolle (Muskelentspannung)
        </h2>
        <p>
          Preis: ca. 15–25 EUR. 5 Minuten Faszienrolle nach dem Training
          reduzieren den Muskelkater am Folgetag um die <strong>Hälfte</strong>.
          Das musst du selbst ausprobieren, um es zu glauben.
        </p>
        <p>
          Eine glatte Rolle reicht für den Einstieg. Strukturierte oder harte
          Modelle (Trigger Point) lohnen sich erst nach mindestens 6 Monaten
          Routine.
        </p>

        <h2 className="font-display text-2xl font-bold text-stone-900 mt-8">
          7. Kettlebell (starte mit 8 kg)
        </h2>
        <p>
          Preis: ca. 25–40 EUR. Allein dieses Gerät reicht für ein <strong>
          Ganzkörpertraining</strong>. Kettlebell Swings, Goblet Squats,
          Turkish Get-ups – stundenweise kostenlose Inhalte online verfügbar.
        </p>
        <p>
          Für Frauen sind 8 kg ideal, für Männer 12 kg. Zu leicht und die
          Technik leidet, zu schwer und der Rücken kann Schaden nehmen. Diese
          beiden Gewichte sind der goldene Mittelweg.
        </p>

        <hr className="my-10 border-stone-200" />

        <h2 className="font-display text-2xl font-bold text-stone-900">
          Was du nicht brauchst 🙅
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Teure Fitness-App-Abos:</strong> YouTube ist kostenlos und
            bietet tausende Trainer. Caroline Girvan, Heather Robertson, MadFit
            – alles gratis.
          </li>
          <li>
            <strong>Glänzende Tracker-Armbänder:</strong> Dein Handy zählt
            ohnehin Schritte. Für Herzfrequenz reicht ein Mi Band – die Apple
            Watch Ultra ist fürs reine Training Overkill.
          </li>
          <li>
            <strong>Peloton-Bike (1.500 EUR+):</strong> Die Quote, mit der es
            nach 6 Monaten zum Wäscheständer wird, ist hoch. Trainiere zuerst
            6 Monate konsequent zu Hause, dann überleg dir das.
          </li>
          <li>
            <strong>Vibrationsplatten, EMS-Geräte:</strong> bauen allein keine
            Muskeln auf. Reines Marketing.
          </li>
        </ul>

        <hr className="my-10 border-stone-200" />

        <div className="bg-pink-50 border border-pink-200 rounded-2xl p-6 not-prose">
          <p className="text-stone-700">
            <strong>Ehrliche Wahrheit:</strong> Das Schwierigste am
            Heimtraining ist nicht die Ausrüstung, sondern <strong>die
            Motivation</strong>. Bevor ein 300-EUR-Set 6 Monate später
            verstaubt, fang mit 30 EUR an und erweitere nur, wenn du es
            wirklich brauchst. Für die Jahresgebühr eines Fitnessstudios
            kannst du diese Liste dreimal kaufen.
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
