// ==========================================================
// Gym – Übungsbibliothek
// Jede Übung hat Infos, Technik-Tipps und zwei Posen (Start/Ende)
// für das animierte Strichfiguren-Bild.
//
// Posen: Punkte im Bild (100 × 100, Boden bei y = 90), Blick nach rechts.
//   k = Kopf, s = Schulter, e = Ellbogen, h = Hand, hu = Hüfte, kn = Knie, f = Fuß
//   kn2/f2 = zweites Bein (z. B. Ausfallschritt)
// vorne: true → Ansicht von vorne (Arme und Beine gespiegelt)
// geraet: was zusätzlich gezeichnet wird
//   { typ: "platte", an: "h" }              Hantelscheibe an einem Punkt
//   { typ: "kh", an: "h" }                  Kurzhantel an einem Punkt
//   { typ: "linie", von: [x, y], bis: [x, y] }  feste Linie (Bank, Stange, Sitz)
//   { typ: "kabel", von: [x, y], an: "h" }  Seilzug von einem festen Punkt zur Hand
// ==========================================================

const MUSKELN = {
  beine: "Beine",
  po: "Po",
  brust: "Brust",
  ruecken: "Rücken",
  schultern: "Schultern",
  arme: "Arme",
  bauch: "Bauch"
};

const STEHEN = { k: [50, 18], s: [50, 28], e: [50, 43], h: [50, 57], hu: [50, 55], kn: [50, 72], f: [50, 90] };

const UEBUNGEN = {
  kniebeuge: {
    name: "Kniebeuge",
    muskeln: ["beine", "po"],
    typ: "grund",
    einheit: "kg",
    schritt: 5,
    startFaktor: 0.5,
    tipps: ["Füße schulterbreit, Zehen leicht nach außen", "Brust raus, Rücken gerade, Blick nach vorn", "So tief, dass die Hüfte unter die Knie kommt – nur, wenn der Rücken gerade bleibt"],
    fehler: ["Knie fallen nach innen", "Fersen heben ab"],
    alternativen: ["beinpresse"],
    posen: [
      { k: [51, 17], s: [50, 28], e: [41, 37], h: [40, 29], hu: [50, 55], kn: [52, 72], f: [50, 90] },
      { k: [53, 33], s: [48, 43], e: [38, 51], h: [37, 43], hu: [36, 64], kn: [60, 70], f: [50, 90] }
    ],
    geraet: [{ typ: "platte", an: "h" }]
  },
  beinpresse: {
    name: "Beinpresse",
    muskeln: ["beine", "po"],
    typ: "grund",
    einheit: "kg",
    schritt: 10,
    startFaktor: 1.0,
    tipps: ["Rücken und Po bleiben fest am Polster", "Füße mittig, schulterbreit auf die Platte", "Knie am Ende nicht ganz durchdrücken"],
    fehler: ["Po hebt sich vom Sitz", "Zu tief, Rücken rundet sich"],
    alternativen: ["kniebeuge"],
    posen: [
      { k: [16, 40], s: [22, 47], e: [30, 58], h: [36, 63], hu: [36, 64], kn: [50, 46], f: [64, 58] },
      { k: [16, 40], s: [22, 47], e: [30, 58], h: [36, 63], hu: [36, 64], kn: [58, 52], f: [80, 42] }
    ],
    geraet: [{ typ: "linie", von: [10, 40], bis: [40, 70] }, { typ: "linie", von: [64, 66], bis: [72, 48], fest: false, an: "f" }]
  },
  rumaenisch: {
    name: "Rumänisches Kreuzheben",
    muskeln: ["beine", "po", "ruecken"],
    typ: "grund",
    einheit: "kg",
    schritt: 5,
    startFaktor: 0.5,
    tipps: ["Knie leicht gebeugt lassen", "Hüfte nach hinten schieben, Rücken bleibt gerade", "Stange nah an den Beinen führen"],
    fehler: ["Runder Rücken", "Zu tief ohne Spannung"],
    alternativen: ["beinbeuger"],
    posen: [
      { ...STEHEN, h: [51, 58] },
      { k: [74, 37], s: [66, 41], e: [67, 53], h: [67, 66], hu: [42, 56], kn: [47, 73], f: [50, 90] }
    ],
    geraet: [{ typ: "platte", an: "h" }]
  },
  kreuzheben: {
    name: "Kreuzheben",
    muskeln: ["ruecken", "beine", "po"],
    typ: "grund",
    einheit: "kg",
    schritt: 5,
    startFaktor: 0.7,
    tipps: ["Stange über der Fußmitte, nah am Schienbein", "Brust raus, Schultern über der Stange", "Aus den Beinen drücken, Hüfte und Schultern steigen gleichzeitig"],
    fehler: ["Runder Rücken", "Stange entfernt sich vom Körper"],
    alternativen: ["rumaenisch"],
    posen: [
      { k: [65, 40], s: [58, 46], e: [57, 60], h: [56, 74], hu: [40, 62], kn: [55, 72], f: [50, 90] },
      { ...STEHEN, h: [51, 58] }
    ],
    geraet: [{ typ: "platte", an: "h" }]
  },
  ausfallschritt: {
    name: "Ausfallschritte",
    muskeln: ["beine", "po"],
    typ: "isolation",
    einheit: "kg",
    schritt: 2,
    startFaktor: 0.1,
    tipps: ["Großer Schritt nach vorn, Oberkörper aufrecht", "Hinteres Knie Richtung Boden", "Vorderes Knie über dem Fuß, nicht nach innen"],
    fehler: ["Zu kleiner Schritt", "Oberkörper kippt nach vorn"],
    alternativen: ["beinpresse"],
    posen: [
      { k: [50, 18], s: [50, 28], e: [50, 43], h: [50, 57], hu: [50, 55], kn: [50, 72], f: [50, 90], kn2: [50, 72], f2: [50, 90] },
      { k: [50, 28], s: [50, 38], e: [50, 52], h: [50, 66], hu: [50, 64], kn: [64, 72], f: [66, 90], kn2: [43, 84], f2: [30, 89] }
    ],
    geraet: [{ typ: "kh", an: "h" }]
  },
  beinbeuger: {
    name: "Beinbeuger",
    muskeln: ["beine"],
    typ: "isolation",
    einheit: "kg",
    schritt: 5,
    startFaktor: 0.25,
    tipps: ["Hüfte fest auf dem Polster lassen", "Langsam hochziehen, kurz halten", "Kontrolliert ablassen"],
    fehler: ["Schwung holen", "Hüfte hebt ab"],
    alternativen: ["rumaenisch"],
    posen: [
      { k: [16, 54], s: [25, 57], e: [20, 63], h: [27, 63], hu: [55, 58], kn: [75, 58], f: [92, 58] },
      { k: [16, 54], s: [25, 57], e: [20, 63], h: [27, 63], hu: [55, 58], kn: [75, 58], f: [80, 39] }
    ],
    geraet: [{ typ: "linie", von: [12, 63], bis: [86, 63] }]
  },
  beinstrecker: {
    name: "Beinstrecker",
    muskeln: ["beine"],
    typ: "isolation",
    einheit: "kg",
    schritt: 5,
    startFaktor: 0.3,
    tipps: ["Rücken an die Lehne", "Beine ganz strecken und kurz halten", "Langsam zurück"],
    fehler: ["Mit Schwung arbeiten"],
    alternativen: ["ausfallschritt"],
    posen: [
      { k: [35, 28], s: [36, 38], e: [38, 52], h: [44, 62], hu: [40, 62], kn: [58, 62], f: [60, 84] },
      { k: [35, 28], s: [36, 38], e: [38, 52], h: [44, 62], hu: [40, 62], kn: [58, 62], f: [80, 58] }
    ],
    geraet: [{ typ: "linie", von: [30, 66], bis: [60, 66] }, { typ: "linie", von: [30, 66], bis: [30, 30] }]
  },
  wadenheben: {
    name: "Wadenheben",
    muskeln: ["beine"],
    typ: "isolation",
    einheit: "kg",
    schritt: 5,
    startFaktor: 0.3,
    tipps: ["Ganz hoch auf die Zehenspitzen", "Oben kurz halten", "Langsam absenken"],
    fehler: ["Zu schnell wippen"],
    alternativen: [],
    posen: [
      { ...STEHEN },
      { k: [51, 13], s: [51, 23], e: [51, 38], h: [51, 52], hu: [51, 50], kn: [51, 67], f: [53, 88] }
    ],
    geraet: [{ typ: "kh", an: "h" }]
  },
  bankdruecken: {
    name: "Bankdrücken",
    muskeln: ["brust", "arme", "schultern"],
    typ: "grund",
    einheit: "kg",
    schritt: 2.5,
    startFaktor: 0.4,
    tipps: ["Schulterblätter zusammen und nach unten", "Stange zur unteren Brust senken", "Füße fest am Boden, Po bleibt auf der Bank"],
    fehler: ["Ellbogen zu weit abgespreizt", "Stange auf der Brust abfedern"],
    alternativen: ["schraegbank", "liegestuetze"],
    posen: [
      { k: [18, 57], s: [28, 58], e: [30, 46], h: [30, 33], hu: [62, 60], kn: [74, 72], f: [76, 90] },
      { k: [18, 57], s: [28, 58], e: [22, 66], h: [31, 50], hu: [62, 60], kn: [74, 72], f: [76, 90] }
    ],
    geraet: [{ typ: "linie", von: [12, 64], bis: [70, 64] }, { typ: "platte", an: "h" }]
  },
  schraegbank: {
    name: "Schrägbankdrücken (Kurzhanteln)",
    muskeln: ["brust", "schultern", "arme"],
    typ: "grund",
    einheit: "kg",
    schritt: 2,
    startFaktor: 0.14,
    tipps: ["Bank auf etwa 30 Grad", "Hanteln über der oberen Brust zusammenführen", "Kontrolliert bis auf Brusthöhe senken"],
    fehler: ["Bank zu steil", "Hohlkreuz"],
    alternativen: ["bankdruecken"],
    posen: [
      { k: [29, 38], s: [35, 46], e: [42, 35], h: [48, 25], hu: [55, 66], kn: [66, 72], f: [70, 90] },
      { k: [29, 38], s: [35, 46], e: [30, 56], h: [40, 44], hu: [55, 66], kn: [66, 72], f: [70, 90] }
    ],
    geraet: [{ typ: "linie", von: [26, 38], bis: [58, 72] }, { typ: "kh", an: "h" }]
  },
  liegestuetze: {
    name: "Liegestütze",
    muskeln: ["brust", "arme", "bauch"],
    typ: "grund",
    einheit: "wdh",
    schritt: 1,
    startFaktor: 0,
    tipps: ["Körper bildet eine gerade Linie", "Hände etwas weiter als schulterbreit", "Brust bis kurz über den Boden"],
    fehler: ["Hüfte hängt durch", "Nur halbe Bewegung"],
    alternativen: ["bankdruecken"],
    posen: [
      { k: [22, 53], s: [31, 58], e: [32, 72], h: [32, 88], hu: [60, 67], kn: [73, 76], f: [88, 88] },
      { k: [22, 71], s: [31, 75], e: [42, 78], h: [32, 88], hu: [60, 79], kn: [74, 83], f: [88, 88] }
    ],
    geraet: []
  },
  latzug: {
    name: "Latzug",
    muskeln: ["ruecken", "arme"],
    typ: "grund",
    einheit: "kg",
    schritt: 5,
    startFaktor: 0.45,
    tipps: ["Brust raus, leicht zurücklehnen", "Stange zur oberen Brust ziehen", "Ellbogen nach unten und hinten"],
    fehler: ["Mit dem ganzen Körper schwingen", "Stange hinter den Kopf"],
    alternativen: ["klimmzuege"],
    posen: [
      { k: [48, 32], s: [48, 42], e: [52, 26], h: [54, 12], hu: [48, 66], kn: [64, 66], f: [64, 88] },
      { k: [47, 32], s: [48, 42], e: [43, 50], h: [53, 37], hu: [48, 66], kn: [64, 66], f: [64, 88] }
    ],
    geraet: [{ typ: "kabel", von: [54, 2], an: "h" }, { typ: "linie", von: [40, 70], bis: [62, 70] }]
  },
  klimmzuege: {
    name: "Klimmzüge",
    muskeln: ["ruecken", "arme"],
    typ: "grund",
    einheit: "wdh",
    schritt: 1,
    startFaktor: 0,
    tipps: ["Aus dem ruhigen Hang starten", "Brust zur Stange, Kinn darüber", "Kontrolliert ganz nach unten"],
    fehler: ["Schwung mit den Beinen", "Halbe Wiederholungen"],
    alternativen: ["latzug"],
    posen: [
      { k: [55, 22], s: [50, 29], e: [50, 18], h: [50, 8], hu: [50, 56], kn: [46, 71], f: [53, 79] },
      { k: [56, 4], s: [50, 14], e: [45, 22], h: [50, 8], hu: [50, 41], kn: [46, 56], f: [53, 64] }
    ],
    geraet: [{ typ: "linie", von: [30, 8], bis: [70, 8] }]
  },
  rudern: {
    name: "Langhantelrudern",
    muskeln: ["ruecken", "arme"],
    typ: "grund",
    einheit: "kg",
    schritt: 2.5,
    startFaktor: 0.4,
    tipps: ["Oberkörper weit vorgebeugt, Rücken gerade", "Stange zum Bauchnabel ziehen", "Schulterblätter zusammenziehen"],
    fehler: ["Oberkörper richtet sich auf", "Runder Rücken"],
    alternativen: ["kabelrudern"],
    posen: [
      { k: [72, 40], s: [64, 44], e: [64, 58], h: [64, 72], hu: [40, 58], kn: [46, 74], f: [44, 90] },
      { k: [72, 40], s: [64, 44], e: [53, 51], h: [60, 61], hu: [40, 58], kn: [46, 74], f: [44, 90] }
    ],
    geraet: [{ typ: "platte", an: "h" }]
  },
  kabelrudern: {
    name: "Rudern am Kabel",
    muskeln: ["ruecken", "arme"],
    typ: "isolation",
    einheit: "kg",
    schritt: 5,
    startFaktor: 0.4,
    tipps: ["Aufrecht sitzen, Brust raus", "Griff zum Bauch ziehen", "Schultern unten lassen"],
    fehler: ["Mit dem Oberkörper reißen"],
    alternativen: ["rudern"],
    posen: [
      { k: [43, 36], s: [41, 46], e: [56, 48], h: [72, 50], hu: [36, 70], kn: [56, 62], f: [72, 72] },
      { k: [42, 36], s: [40, 46], e: [29, 52], h: [46, 55], hu: [36, 70], kn: [56, 62], f: [72, 72] }
    ],
    geraet: [{ typ: "kabel", von: [96, 52], an: "h" }, { typ: "linie", von: [24, 74], bis: [52, 74] }]
  },
  schulterdruecken: {
    name: "Schulterdrücken (Kurzhanteln)",
    muskeln: ["schultern", "arme"],
    typ: "grund",
    einheit: "kg",
    schritt: 2,
    startFaktor: 0.12,
    tipps: ["Aufrecht sitzen, Bauch fest", "Hanteln über den Kopf drücken", "Bis auf Ohrhöhe senken"],
    fehler: ["Hohlkreuz", "Ellbogen zu weit nach hinten"],
    alternativen: ["seitheben"],
    posen: [
      { k: [50, 32], s: [50, 42], e: [58, 47], h: [57, 34], hu: [50, 66], kn: [64, 66], f: [64, 88] },
      { k: [50, 32], s: [50, 42], e: [54, 25], h: [52, 12], hu: [50, 66], kn: [64, 66], f: [64, 88] }
    ],
    geraet: [{ typ: "kh", an: "h" }, { typ: "linie", von: [40, 70], bis: [62, 70] }, { typ: "linie", von: [42, 70], bis: [42, 34] }]
  },
  seitheben: {
    name: "Seitheben",
    muskeln: ["schultern"],
    typ: "isolation",
    einheit: "kg",
    schritt: 1,
    startFaktor: 0.06,
    tipps: ["Leichtes Gewicht, saubere Bewegung", "Arme bis auf Schulterhöhe heben", "Ellbogen minimal gebeugt"],
    fehler: ["Schwung aus dem Körper", "Schultern zu den Ohren ziehen"],
    alternativen: ["schulterdruecken"],
    vorne: true,
    posen: [
      { k: [50, 17], s: [58, 28], e: [61, 43], h: [62, 57], hu: [55, 55], kn: [56, 72], f: [57, 90] },
      { k: [50, 17], s: [58, 28], e: [71, 29], h: [84, 29], hu: [55, 55], kn: [56, 72], f: [57, 90] }
    ],
    geraet: [{ typ: "kh", an: "h" }]
  },
  bizeps: {
    name: "Bizepscurls",
    muskeln: ["arme"],
    typ: "isolation",
    einheit: "kg",
    schritt: 1,
    startFaktor: 0.1,
    tipps: ["Ellbogen bleiben am Körper", "Ganz hochcurlen, oben anspannen", "Langsam ablassen"],
    fehler: ["Mit dem Rücken schwingen"],
    alternativen: [],
    posen: [
      { ...STEHEN, e: [50, 43], h: [52, 58] },
      { ...STEHEN, e: [50, 43], h: [57, 31] }
    ],
    geraet: [{ typ: "kh", an: "h" }]
  },
  trizeps: {
    name: "Trizepsdrücken am Kabel",
    muskeln: ["arme"],
    typ: "isolation",
    einheit: "kg",
    schritt: 2.5,
    startFaktor: 0.2,
    tipps: ["Ellbogen fest neben dem Körper", "Arme ganz nach unten strecken", "Oberarme bewegen sich nicht"],
    fehler: ["Ellbogen wandern nach vorn"],
    alternativen: ["dips"],
    posen: [
      { k: [52, 20], s: [51, 30], e: [53, 45], h: [63, 38], hu: [48, 56], kn: [50, 73], f: [50, 90] },
      { k: [52, 20], s: [51, 30], e: [53, 45], h: [57, 61], hu: [48, 56], kn: [50, 73], f: [50, 90] }
    ],
    geraet: [{ typ: "kabel", von: [66, 2], an: "h" }]
  },
  dips: {
    name: "Dips",
    muskeln: ["brust", "arme"],
    typ: "grund",
    einheit: "wdh",
    schritt: 1,
    startFaktor: 0,
    tipps: ["Oberkörper leicht nach vorn", "Bis die Oberarme waagerecht sind", "Oben Arme strecken, Schultern unten"],
    fehler: ["Zu tief bei Schulterschmerzen"],
    alternativen: ["trizeps"],
    posen: [
      { k: [53, 20], s: [50, 30], e: [50, 40], h: [50, 50], hu: [50, 58], kn: [44, 70], f: [52, 78] },
      { k: [54, 32], s: [50, 42], e: [38, 44], h: [50, 50], hu: [50, 68], kn: [44, 80], f: [52, 88] }
    ],
    geraet: [{ typ: "linie", von: [30, 50], bis: [70, 50] }]
  },
  plank: {
    name: "Unterarmstütz (Plank)",
    muskeln: ["bauch"],
    typ: "isolation",
    einheit: "s",
    schritt: 5,
    startFaktor: 0,
    tipps: ["Körper bildet eine gerade Linie", "Bauch und Po fest anspannen", "Ruhig weiteratmen"],
    fehler: ["Hüfte hängt durch", "Po zu hoch"],
    alternativen: ["beinheben"],
    posen: [
      { k: [22, 66], s: [30, 70], e: [30, 88], h: [43, 88], hu: [58, 72], kn: [72, 79], f: [87, 88] },
      { k: [22, 65], s: [30, 69], e: [30, 88], h: [43, 88], hu: [58, 70], kn: [72, 78], f: [87, 88] }
    ],
    geraet: []
  },
  beinheben: {
    name: "Hängendes Beinheben",
    muskeln: ["bauch"],
    typ: "isolation",
    einheit: "wdh",
    schritt: 1,
    startFaktor: 0,
    tipps: ["Ruhig hängen, nicht schwingen", "Beine bis mindestens waagerecht heben", "Langsam absenken"],
    fehler: ["Mit Schwung arbeiten"],
    alternativen: ["plank"],
    posen: [
      { k: [55, 22], s: [50, 29], e: [50, 18], h: [50, 8], hu: [50, 56], kn: [50, 73], f: [50, 89] },
      { k: [55, 22], s: [50, 29], e: [50, 18], h: [50, 8], hu: [50, 56], kn: [65, 55], f: [80, 56] }
    ],
    geraet: [{ typ: "linie", von: [30, 8], bis: [70, 8] }]
  }
};

// ---------- Das animierte Bild ----------

const BILD_DAUER = "2.6s";

function bildPunkt(pose, name) {
  return pose[name] || null;
}

function gespiegelt(punkt) {
  return [100 - punkt[0], punkt[1]];
}

// Eine Linie, die zwischen Start- und Endpose hin und her animiert
function bildLinie(a1, a2, b1, b2, klasse, bewegt) {
  const runden = (n) => Math.round(n * 10) / 10;
  let animation = "";
  if (bewegt) {
    const wert = (i, a, b) => `${runden(a[i])};${runden(b[i])};${runden(a[i])}`;
    const anim = (attribut, werte) =>
      `<animate attributeName="${attribut}" values="${werte}" dur="${BILD_DAUER}" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="0.45 0 0.25 1;0.45 0 0.25 1"/>`;
    animation = anim("x1", wert(0, a1, b1)) + anim("y1", wert(1, a1, b1)) + anim("x2", wert(0, a2, b2)) + anim("y2", wert(1, a2, b2));
  }
  return `<line class="${klasse}" x1="${runden(a1[0])}" y1="${runden(a1[1])}" x2="${runden(a2[0])}" y2="${runden(a2[1])}">${animation}</line>`;
}

function bildKreis(a, b, r, klasse, bewegt) {
  const runden = (n) => Math.round(n * 10) / 10;
  let animation = "";
  if (bewegt) {
    const anim = (attribut, i) =>
      `<animate attributeName="${attribut}" values="${runden(a[i])};${runden(b[i])};${runden(a[i])}" dur="${BILD_DAUER}" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="0.45 0 0.25 1;0.45 0 0.25 1"/>`;
    animation = anim("cx", 0) + anim("cy", 1);
  }
  return `<circle class="${klasse}" cx="${runden(a[0])}" cy="${runden(a[1])}" r="${r}">${animation}</circle>`;
}

// Zeichnet die Strichfigur einer Übung als SVG
function uebungsBild(id, groesse = "normal") {
  const u = UEBUNGEN[id];
  if (!u) return "";
  const [A, B] = u.posen;
  const weniger = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const bewegt = !weniger && JSON.stringify(A) !== JSON.stringify(B);
  const teile = [];
  const linie = (p1, p2, klasse = "glied") => {
    if (!A[p1] || !A[p2]) return;
    teile.push(bildLinie(A[p1], A[p2], B[p1] || A[p1], B[p2] || A[p2], klasse, bewegt));
  };

  // Boden
  teile.push('<line class="boden" x1="4" y1="91.5" x2="96" y2="91.5"/>');

  // Feste Geräte zuerst (liegen hinter der Figur)
  (u.geraet || []).filter((g) => g.typ === "linie" && !g.an).forEach((g) => {
    teile.push(`<line class="geraet" x1="${g.von[0]}" y1="${g.von[1]}" x2="${g.bis[0]}" y2="${g.bis[1]}"/>`);
  });
  (u.geraet || []).filter((g) => g.typ === "kabel").forEach((g) => {
    teile.push(bildLinie(g.von, A[g.an], g.von, B[g.an], "kabel", bewegt));
  });

  if (u.vorne) {
    // Ansicht von vorne: Rumpf in der Mitte, Arme und Beine auf beiden Seiten
    const spiegelA = (p) => gespiegelt(A[p]);
    const spiegelB = (p) => gespiegelt(B[p]);
    teile.push(bildLinie([50, A.s[1] - 2], [50, A.hu[1]], [50, B.s[1] - 2], [50, B.hu[1]], "glied rumpf", bewegt));
    teile.push(bildLinie(A.s, spiegelA("s"), B.s, spiegelB("s"), "glied", bewegt));
    teile.push(bildLinie(A.hu, spiegelA("hu"), B.hu, spiegelB("hu"), "glied", bewegt));
    for (const seite of [false, true]) {
      const a = (p) => (seite ? spiegelA(p) : A[p]);
      const b = (p) => (seite ? spiegelB(p) : B[p]);
      teile.push(bildLinie(a("s"), a("e"), b("s"), b("e"), "glied", bewegt));
      teile.push(bildLinie(a("e"), a("h"), b("e"), b("h"), "glied", bewegt));
      teile.push(bildLinie(a("hu"), a("kn"), b("hu"), b("kn"), "glied", bewegt));
      teile.push(bildLinie(a("kn"), a("f"), b("kn"), b("f"), "glied", bewegt));
      (u.geraet || []).filter((g) => g.typ === "kh").forEach(() => {
        teile.push(bildKreis(a("h"), b("h"), 3.6, "hantel", bewegt));
      });
    }
  } else {
    // Seitenansicht
    if (A.kn2) {
      linie("hu", "kn2", "glied hinten");
      linie("kn2", "f2", "glied hinten");
    }
    linie("s", "hu", "glied rumpf");
    linie("hu", "kn");
    linie("kn", "f");
    linie("s", "e");
    linie("e", "h");
    (u.geraet || []).forEach((g) => {
      if (g.typ === "platte") teile.push(bildKreis(A[g.an], B[g.an], 7, "platte", bewegt));
      if (g.typ === "kh") teile.push(bildKreis(A[g.an], B[g.an], 3.6, "hantel", bewegt));
      if (g.typ === "linie" && g.an) {
        // eine Platte, die mit einem Punkt mitwandert (z. B. Beinpresse)
        const versatz = (p) => [p[0] + 2, p[1]];
        teile.push(bildLinie([versatz(A[g.an])[0], A[g.an][1] - 10], [versatz(A[g.an])[0] + 2, A[g.an][1] + 8], [versatz(B[g.an])[0], B[g.an][1] - 10], [versatz(B[g.an])[0] + 2, B[g.an][1] + 8], "geraet dick", bewegt));
      }
    });
  }

  // Kopf
  teile.push(bildKreis(A.k, B.k, 6.2, "kopf", bewegt));

  return `<svg class="uebungsbild ${groesse}" viewBox="0 0 100 100" role="img" aria-label="Bewegung: ${u.name}">${teile.join("")}</svg>`;
}
