// ==========================================================
// Gym – Logik: Speicher, Trainingsplan, Progression, XP, Ränge, Coach
// Keine Oberfläche hier – nur Rechnen und Speichern.
// ==========================================================

const SCHLUESSEL = {
  profil: "gym-profil",
  plan: "gym-plan",
  stand: "gym-uebungsstand",
  trainings: "gym-trainings",
  einstellungen: "gym-einstellungen",
  aktiv: "gym-aktiv",
  backupZeit: "gym-backup-zeit"
};

const WOCHENTAGE = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const TAG_KURZ = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const MONATE = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const MONATE_KURZ = ["Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sep.", "Okt.", "Nov.", "Dez."];

const ZIELE = { muskel: "Muskelaufbau", kraft: "Kraft", fitness: "Fitness" };
const ERFAHRUNG = { anfaenger: "Anfänger", fortgeschritten: "Fortgeschritten" };
const GEFUEHL = { leicht: "Leicht", gut: "Passt", schwer: "Schwer" };
const BLOCK_WOCHEN = 6;

// ---------- Speicher ----------

function laden(schluessel, standard) {
  try {
    const wert = localStorage.getItem(schluessel);
    return wert === null ? standard : JSON.parse(wert);
  } catch (fehler) {
    return standard;
  }
}

function speichern(schluessel, wert) {
  try {
    localStorage.setItem(schluessel, JSON.stringify(wert));
  } catch (fehler) {
    // Ohne Speicher funktioniert die App, merkt sich aber nichts
  }
}

function neueId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

const profil = () => laden(SCHLUESSEL.profil, null);
const plan = () => laden(SCHLUESSEL.plan, null);
const uebungsstand = () => laden(SCHLUESSEL.stand, {});
const trainings = () => laden(SCHLUESSEL.trainings, []);
const einstellungen = () => ({ theme: "dunkel", pause: null, ...laden(SCHLUESSEL.einstellungen, {}) });

// ---------- Datum ----------

function datumKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function keyZuDatum(key) {
  const [j, m, t] = key.split("-").map(Number);
  return new Date(j, m - 1, t);
}

// Montag der Woche eines Datums als Schlüssel – so lassen sich Trainings pro Woche zählen
function wochenKey(datum) {
  const d = new Date(datum);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return datumKey(d);
}

function tageZwischen(a, b) {
  return Math.round((keyZuDatum(datumKey(b)) - keyZuDatum(datumKey(a))) / 86400000);
}

function datumKurz(iso) {
  const d = new Date(iso);
  const n = tageZwischen(d, new Date());
  if (n === 0) return "Heute";
  if (n === 1) return "Gestern";
  if (n < 7) return WOCHENTAGE[d.getDay()];
  return `${d.getDate()}. ${MONATE_KURZ[d.getMonth()]}`;
}

function zahl(n, stellen = 1) {
  return Number(n.toFixed(stellen)).toLocaleString("de-DE");
}

// ---------- Trainingsplan erstellen ----------

// Einheiten-Vorlagen: Übungen in der Reihenfolge ihrer Wichtigkeit
const EINHEITEN = {
  gkA: { name: "Ganzkörper A", fokus: "Beine · Brust · Rücken", uebungen: ["kniebeuge", "bankdruecken", "rudern", "schulterdruecken", "beinbeuger", "plank"] },
  gkB: { name: "Ganzkörper B", fokus: "Hüfte · Schräge Brust · Latissimus", uebungen: ["rumaenisch", "schraegbank", "latzug", "seitheben", "bizeps", "beinheben"] },
  gkC: { name: "Ganzkörper C", fokus: "Beinpresse · Drücken · Ziehen", uebungen: ["beinpresse", "bankdruecken", "kabelrudern", "schulterdruecken", "trizeps", "wadenheben"] },
  push: { name: "Push", fokus: "Brust · Schultern · Trizeps", uebungen: ["bankdruecken", "schulterdruecken", "schraegbank", "seitheben", "trizeps", "dips"] },
  pull: { name: "Pull", fokus: "Rücken · Bizeps", uebungen: ["kreuzheben", "klimmzuege", "rudern", "kabelrudern", "bizeps", "beinheben"] },
  beine: { name: "Beine", fokus: "Oberschenkel · Po · Waden", uebungen: ["kniebeuge", "rumaenisch", "beinpresse", "beinbeuger", "beinstrecker", "wadenheben"] },
  obenA: { name: "Oberkörper A", fokus: "Drücken & Ziehen schwer", uebungen: ["bankdruecken", "rudern", "schulterdruecken", "latzug", "bizeps", "trizeps"] },
  untenA: { name: "Unterkörper A", fokus: "Kniebeuge-Tag", uebungen: ["kniebeuge", "rumaenisch", "ausfallschritt", "beinbeuger", "wadenheben", "plank"] },
  obenB: { name: "Oberkörper B", fokus: "Schräg & Latissimus", uebungen: ["schraegbank", "klimmzuege", "kabelrudern", "seitheben", "dips", "bizeps"] },
  untenB: { name: "Unterkörper B", fokus: "Kreuzheben-Tag", uebungen: ["kreuzheben", "beinpresse", "beinstrecker", "beinbeuger", "wadenheben", "beinheben"] }
};

const SPLITS = {
  2: { name: "Ganzkörper 2×", einheiten: ["gkA", "gkB"] },
  3: { name: "Ganzkörper 3×", einheiten: ["gkA", "gkB", "gkC"], fortgeschritten: { name: "Push · Pull · Beine", einheiten: ["push", "pull", "beine"] } },
  4: { name: "Ober-/Unterkörper", einheiten: ["obenA", "untenA", "obenB", "untenB"] },
  5: { name: "Push · Pull · Beine + Ober/Unter", einheiten: ["push", "pull", "beine", "obenA", "untenA"] }
};

// Für Anfänger: schwierige Übungen durch leichtere ersetzen
const ANFAENGER_ERSATZ = { klimmzuege: "latzug", dips: "trizeps", kreuzheben: "rumaenisch" };

// Sätze und Wiederholungen je nach Ziel und Übungsart
function satzSchema(ziel, erfahrung, uebung) {
  if (uebung.einheit === "s") return { saetze: 3, wdhMin: 30, wdhMax: 60 };
  if (uebung.einheit === "wdh") return ziel === "fitness" ? { saetze: 3, wdhMin: 10, wdhMax: 20 } : { saetze: 3, wdhMin: 6, wdhMax: 12 };
  const grund = uebung.typ === "grund";
  if (ziel === "kraft") {
    if (!grund) return { saetze: 3, wdhMin: 8, wdhMax: 12 };
    return erfahrung === "anfaenger" ? { saetze: 3, wdhMin: 5, wdhMax: 8 } : { saetze: 4, wdhMin: 4, wdhMax: 6 };
  }
  if (ziel === "fitness") return grund ? { saetze: 3, wdhMin: 10, wdhMax: 15 } : { saetze: 2, wdhMin: 12, wdhMax: 20 };
  return grund ? { saetze: 3, wdhMin: 8, wdhMax: 12 } : { saetze: 3, wdhMin: 10, wdhMax: 15 };
}

function anzahlUebungen(dauer) {
  return dauer <= 45 ? 4 : dauer <= 60 ? 5 : 6;
}

function aufGewichtRunden(kg, schritt) {
  return Math.max(schritt, Math.round(kg / schritt) * schritt);
}

function startGewicht(id, p) {
  const u = UEBUNGEN[id];
  if (u.einheit !== "kg" || !u.startFaktor) return 0;
  const faktor = p.erfahrung === "anfaenger" ? 0.75 : 1;
  return aufGewichtRunden((p.koerpergewicht || 70) * u.startFaktor * faktor, u.schritt);
}

function planEintrag(id, p) {
  return { id, ...satzSchema(p.ziel, p.erfahrung, UEBUNGEN[id]) };
}

function planErstellen(p) {
  const vorlage = SPLITS[p.tage];
  const split = p.erfahrung === "fortgeschritten" && vorlage.fortgeschritten ? vorlage.fortgeschritten : vorlage;
  const anzahl = anzahlUebungen(p.dauer);

  const einheiten = split.einheiten.map((schluessel) => {
    const e = EINHEITEN[schluessel];
    const ids = e.uebungen
      .map((id) => (p.erfahrung === "anfaenger" && ANFAENGER_ERSATZ[id] ? ANFAENGER_ERSATZ[id] : id))
      .filter((id, i, alle) => alle.indexOf(id) === i)
      .slice(0, anzahl);
    return { id: schluessel, name: e.name, fokus: e.fokus, uebungen: ids.map((id) => planEintrag(id, p)) };
  });

  const neu = { split: split.name, einheiten, naechste: 0, block: 1, blockStart: new Date().toISOString() };

  // Startgewichte nur für Übungen, die noch keinen Stand haben
  const stand = uebungsstand();
  einheiten.forEach((e) => e.uebungen.forEach((eintrag) => {
    if (!stand[eintrag.id]) stand[eintrag.id] = { gewicht: startGewicht(eintrag.id, p), bonus: 0, fehlversuche: 0, best: 0, verlauf: [] };
  }));
  speichern(SCHLUESSEL.stand, stand);
  speichern(SCHLUESSEL.plan, neu);
  return neu;
}

function naechsteEinheit() {
  const p = plan();
  if (!p) return null;
  return p.einheiten[p.naechste % p.einheiten.length];
}

function blockWoche() {
  const p = plan();
  if (!p) return 1;
  return Math.floor(tageZwischen(new Date(p.blockStart), new Date()) / 7) + 1;
}

// Neuer Trainingsblock: Isolationsübungen gegen Varianten tauschen, Grundübungen bleiben
function neuerBlock() {
  const p = plan();
  const pr = profil();
  if (!p || !pr) return null;
  const stand = uebungsstand();
  p.einheiten.forEach((e) => {
    const vergeben = new Set(e.uebungen.map((u) => u.id));
    e.uebungen = e.uebungen.map((eintrag) => {
      const u = UEBUNGEN[eintrag.id];
      if (u.typ === "grund") return eintrag;
      const alternative = (u.alternativen || []).find((a) => !vergeben.has(a) && !(pr.erfahrung === "anfaenger" && ANFAENGER_ERSATZ[a]));
      if (!alternative) return eintrag;
      vergeben.add(alternative);
      if (!stand[alternative]) stand[alternative] = { gewicht: startGewicht(alternative, pr), bonus: 0, fehlversuche: 0, best: 0, verlauf: [] };
      return planEintrag(alternative, pr);
    });
  });
  p.block += 1;
  p.blockStart = new Date().toISOString();
  speichern(SCHLUESSEL.stand, stand);
  speichern(SCHLUESSEL.plan, p);
  return p;
}

function uebungTauschen(einheitIndex, uebungIndex, neueUebung) {
  const p = plan();
  const pr = profil();
  const stand = uebungsstand();
  if (!stand[neueUebung]) stand[neueUebung] = { gewicht: startGewicht(neueUebung, pr), bonus: 0, fehlversuche: 0, best: 0, verlauf: [] };
  p.einheiten[einheitIndex].uebungen[uebungIndex] = planEintrag(neueUebung, pr);
  speichern(SCHLUESSEL.stand, stand);
  speichern(SCHLUESSEL.plan, p);
}

// Alternativen: erst die vorgesehenen, dann Übungen mit derselben Hauptmuskelgruppe
function tauschOptionen(id) {
  const u = UEBUNGEN[id];
  const vorgesehen = u.alternativen || [];
  const gleicherMuskel = Object.keys(UEBUNGEN).filter((a) => a !== id && UEBUNGEN[a].muskeln[0] === u.muskeln[0]);
  return [...new Set([...vorgesehen, ...gleicherMuskel])];
}

// ---------- Ziele für eine Übung (inkl. persönlichem Bonus) ----------

function ziel(eintrag) {
  const stand = uebungsstand()[eintrag.id] || { gewicht: 0, bonus: 0 };
  const u = UEBUNGEN[eintrag.id];
  const bonus = u.einheit === "kg" ? 0 : stand.bonus || 0;
  return { saetze: eintrag.saetze, wdhMin: eintrag.wdhMin + bonus, wdhMax: eintrag.wdhMax + bonus, gewicht: stand.gewicht || 0, einheit: u.einheit };
}

function zielText(eintrag) {
  const z = ziel(eintrag);
  const wdh = z.einheit === "s" ? `${z.wdhMin}–${z.wdhMax} s` : `${z.wdhMin}–${z.wdhMax}`;
  const gewicht = z.einheit === "kg" ? ` · ${zahl(z.gewicht)} kg` : z.einheit === "wdh" ? " · Körpergewicht" : "";
  return `${z.saetze} × ${wdh}${gewicht}`;
}

// ---------- Auswertung nach dem Training: Progression und Rekorde ----------

// Geschätztes Maximalgewicht (Epley-Formel) – zum Vergleichen von Sätzen
function e1rm(gewicht, wdh) {
  return gewicht * (1 + wdh / 30);
}

function satzWert(einheit, satz) {
  return einheit === "kg" ? e1rm(satz.gewicht, satz.wdh) : satz.wdh;
}

// Wertet ein Training aus: neue Gewichte, Rekorde, Meldungen
function trainingAuswerten(training) {
  const stand = uebungsstand();
  const p = plan();
  const einheit = p.einheiten.find((e) => e.id === training.einheitId) || { uebungen: [] };
  const meldungen = [];
  const rekorde = [];

  const nachUebung = {};
  training.saetze.forEach((s) => (nachUebung[s.uebungId] = nachUebung[s.uebungId] || []).push(s));

  Object.entries(nachUebung).forEach(([id, saetze]) => {
    const u = UEBUNGEN[id];
    const eintrag = einheit.uebungen.find((e) => e.id === id) || { saetze: saetze.length, wdhMin: 8, wdhMax: 12 };
    const z = ziel(eintrag);
    const st = stand[id] || { gewicht: 0, bonus: 0, fehlversuche: 0, best: 0, verlauf: [] };
    const bester = Math.max(...saetze.map((s) => satzWert(u.einheit, s)));

    // Rekord?
    if (st.best && bester > st.best + 0.01) rekorde.push({ id, alt: st.best, neu: bester });
    st.best = Math.max(st.best || 0, bester);

    // Verlauf für das Diagramm: bester Satz des Tages
    const topSatz = saetze.reduce((a, b) => (satzWert(u.einheit, b) > satzWert(u.einheit, a) ? b : a));
    st.verlauf = [...(st.verlauf || []), { datum: training.datum, gewicht: topSatz.gewicht, wdh: topSatz.wdh, wert: Math.round(bester * 10) / 10 }].slice(-60);

    // Mit dem Gewicht weiterrechnen, das wirklich benutzt wurde
    if (u.einheit === "kg") st.gewicht = Math.max(...saetze.map((s) => s.gewicht));

    const alleGeschafft = saetze.length >= z.saetze && saetze.every((s) => s.wdh >= z.wdhMax);
    const zuSchwer = saetze.filter((s) => s.gefuehl === "schwer").length > 1;
    const verfehlt = saetze.some((s) => s.wdh < z.wdhMin);

    if (alleGeschafft && !zuSchwer) {
      st.fehlversuche = 0;
      if (u.einheit === "kg") {
        st.gewicht = Math.round((st.gewicht + u.schritt) * 10) / 10;
        meldungen.push({ id, text: `${u.name}: nächstes Mal ${zahl(st.gewicht)} kg (+${zahl(u.schritt)} kg)`, art: "hoch" });
      } else {
        st.bonus = (st.bonus || 0) + (u.einheit === "s" ? 10 : 2);
        meldungen.push({ id, text: `${u.name}: Ziel steigt um ${u.einheit === "s" ? "10 s" : "2 Wiederholungen"}`, art: "hoch" });
      }
    } else if (verfehlt) {
      st.fehlversuche = (st.fehlversuche || 0) + 1;
      if (st.fehlversuche >= 2 && u.einheit === "kg" && st.gewicht > u.schritt) {
        st.gewicht = aufGewichtRunden(st.gewicht * 0.9, u.schritt);
        st.fehlversuche = 0;
        meldungen.push({ id, text: `${u.name}: Entlastung auf ${zahl(st.gewicht)} kg – so kommst du wieder in Schwung`, art: "runter" });
      } else {
        meldungen.push({ id, text: `${u.name}: Gewicht bleibt – nächstes Mal mehr Wiederholungen`, art: "gleich" });
      }
    }
    stand[id] = st;
  });

  speichern(SCHLUESSEL.stand, stand);
  return { meldungen, rekorde };
}

// ---------- XP und Serien ----------

// Wochen, in denen das Wochenziel erreicht wurde, als Serie gezählt
function wochenStatistik(liste = trainings(), ziel = (profil() || {}).tage || 3) {
  const proWoche = {};
  liste.forEach((t) => (proWoche[wochenKey(new Date(t.datum))] = (proWoche[wochenKey(new Date(t.datum))] || 0) + 1));

  const dieseWoche = wochenKey(new Date());
  let aktuelleSerie = 0;
  const d = keyZuDatum(dieseWoche);
  // Die laufende Woche zählt nur mit, wenn ihr Ziel schon erreicht ist
  if ((proWoche[dieseWoche] || 0) >= ziel) aktuelleSerie++;
  d.setDate(d.getDate() - 7);
  while ((proWoche[datumKey(d)] || 0) >= ziel) {
    aktuelleSerie++;
    d.setDate(d.getDate() - 7);
  }

  // Beste Serie über alle Wochen
  const wochen = Object.keys(proWoche).sort();
  let beste = 0;
  let lauf = 0;
  let vorher = null;
  wochen.forEach((w) => {
    const erfuellt = proWoche[w] >= ziel;
    const anschluss = vorher && tageZwischen(keyZuDatum(vorher), keyZuDatum(w)) === 7;
    lauf = erfuellt ? (anschluss && lauf ? lauf + 1 : 1) : 0;
    beste = Math.max(beste, lauf);
    vorher = w;
  });

  return { proWoche, aktuelleSerie, besteSerie: Math.max(beste, aktuelleSerie), dieseWoche: proWoche[dieseWoche] || 0, ziel };
}

// XP für ein gerade beendetes Training (bevor es gespeichert wird)
function xpBerechnen(training, rekorde) {
  const bisher = trainings();
  const ziel = (profil() || {}).tage || 3;
  const stat = wochenStatistik(bisher, ziel);
  const saetze = training.saetze.length;

  const teile = [];
  const basis = saetze >= 6 ? 100 : 50;
  teile.push({ name: saetze >= 6 ? "Training abgeschlossen" : "Kurzes Training (unter 6 Sätze)", xp: basis });
  teile.push({ name: `${saetze} Sätze`, xp: saetze * 6 });
  const schwer = training.saetze.filter((s) => s.gefuehl === "schwer").length;
  if (schwer) teile.push({ name: `${schwer} harte Sätze`, xp: schwer * 2 });
  if (rekorde.length) teile.push({ name: `${rekorde.length} ${rekorde.length === 1 ? "Rekord" : "Rekorde"}`, xp: rekorde.length * 40 });

  let summe = teile.reduce((s, t) => s + t.xp, 0);

  // Serien-Bonus: +5 % pro Woche Serie, höchstens +50 %
  const serieVorher = stat.aktuelleSerie - (stat.dieseWoche >= ziel ? 1 : 0);
  const faktor = 1 + 0.05 * Math.min(Math.max(serieVorher, 0), 10);
  if (faktor > 1) teile.push({ name: `Serien-Bonus ×${zahl(faktor, 2)}`, xp: Math.round(summe * (faktor - 1)) });
  summe = Math.round(summe * faktor);

  // Mehrmals am Tag zählt nur wenig – Erholung gehört dazu
  const heuteSchon = bisher.some((t) => datumKey(new Date(t.datum)) === datumKey(new Date(training.datum)));
  if (heuteSchon) {
    teile.push({ name: "Zweites Training heute (nur 25 %)", xp: -Math.round(summe * 0.75) });
    summe = Math.round(summe * 0.25);
  }

  // Wochenziel genau mit diesem Training erreicht
  if (stat.dieseWoche + 1 === ziel) {
    teile.push({ name: "Wochenziel erreicht", xp: 200 });
    summe += 200;
  }

  return { xp: summe, teile };
}

function xpGesamt() {
  return trainings().reduce((s, t) => s + (t.xp || 0), 0);
}

// ---------- Ränge ----------
// Aufsteigen braucht XP UND Beständigkeit (beste Wochen-Serie) UND Erfahrung (Anzahl Trainings).
// Grobe Rechnung: 3 Trainings pro Woche ≈ 650–800 XP pro Woche.

const RAENGE = [
  { name: "Neuling", stufe: "neu", xp: 0, serie: 0, trainings: 0 },
  { name: "Bronze I", stufe: "bronze", xp: 800, serie: 0, trainings: 3 },
  { name: "Bronze II", stufe: "bronze", xp: 2000, serie: 2, trainings: 6 },
  { name: "Bronze III", stufe: "bronze", xp: 3600, serie: 3, trainings: 10 },
  { name: "Silber I", stufe: "silber", xp: 6000, serie: 4, trainings: 16 },
  { name: "Silber II", stufe: "silber", xp: 9000, serie: 5, trainings: 22 },
  { name: "Silber III", stufe: "silber", xp: 12500, serie: 6, trainings: 30 },
  { name: "Gold I", stufe: "gold", xp: 17000, serie: 8, trainings: 40 },
  { name: "Gold II", stufe: "gold", xp: 22000, serie: 9, trainings: 50 },
  { name: "Gold III", stufe: "gold", xp: 28000, serie: 10, trainings: 62 },
  { name: "Platin I", stufe: "platin", xp: 36000, serie: 12, trainings: 80 },
  { name: "Platin II", stufe: "platin", xp: 45000, serie: 14, trainings: 95 },
  { name: "Platin III", stufe: "platin", xp: 55000, serie: 16, trainings: 110 },
  { name: "Diamant I", stufe: "diamant", xp: 68000, serie: 20, trainings: 130 },
  { name: "Diamant II", stufe: "diamant", xp: 82000, serie: 22, trainings: 150 },
  { name: "Diamant III", stufe: "diamant", xp: 98000, serie: 26, trainings: 175 },
  { name: "Titan", stufe: "titan", xp: 120000, serie: 30, trainings: 200 },
  { name: "Legende", stufe: "legende", xp: 150000, serie: 52, trainings: 260 }
];

function rangInfo(xp = xpGesamt(), stat = wochenStatistik(), anzahl = trainings().length) {
  const erfuellt = (r) => xp >= r.xp && stat.besteSerie >= r.serie && anzahl >= r.trainings;
  let index = 0;
  RAENGE.forEach((r, i) => {
    if (erfuellt(r) && i === index + 1) index = i;
  });
  const rang = RAENGE[index];
  const naechster = RAENGE[index + 1] || null;
  let fortschritt = 1;
  const fehlt = [];
  if (naechster) {
    fortschritt = Math.min(1, Math.max(0, (xp - rang.xp) / (naechster.xp - rang.xp)));
    if (xp < naechster.xp) fehlt.push({ text: `${zahl(naechster.xp - xp, 0)} XP`, art: "xp" });
    if (stat.besteSerie < naechster.serie) fehlt.push({ text: `${naechster.serie}-Wochen-Serie (beste: ${stat.besteSerie})`, art: "serie" });
    if (anzahl < naechster.trainings) fehlt.push({ text: `${naechster.trainings - anzahl} weitere Trainings`, art: "trainings" });
  }
  return { rang, index, naechster, fortschritt, fehlt, xp, stat, anzahl };
}

// Abzeichen: Form je Stufe, Füllung zeigt die Untereinteilung – alles in Schwarz/Weiß
function rangAbzeichen(rang, groesse = 64) {
  const formen = {
    neu: '<circle cx="50" cy="50" r="34" class="abz-linie"/>',
    bronze: '<circle cx="50" cy="50" r="38" class="abz-linie dick"/>',
    silber: '<path d="M50 10 L84 22 V50 C84 70 68 84 50 92 C32 84 16 70 16 50 V22 Z" class="abz-linie dick"/>',
    gold: '<path d="M50 8 L86 29 V71 L50 92 L14 71 V29 Z" class="abz-flaeche"/>',
    platin: '<path d="M50 6 L61 37 L94 38 L68 58 L77 90 L50 71 L23 90 L32 58 L6 38 L39 37 Z" class="abz-flaeche"/>',
    diamant: '<path d="M50 6 L90 40 L50 94 L10 40 Z M10 40 H90 M30 40 L50 94 L70 40 M30 40 L42 22 L50 40 L58 22 L70 40" class="abz-flaeche-linien"/>',
    titan: '<path d="M50 6 L90 28 V72 L50 94 L10 72 V28 Z" class="abz-flaeche"/><path d="M50 22 L74 36 V64 L50 78 L26 64 V36 Z" class="abz-innen"/>',
    legende: '<path d="M12 74 L18 30 L36 50 L50 18 L64 50 L82 30 L88 74 Z" class="abz-flaeche"/><rect x="12" y="78" width="76" height="10" rx="3" class="abz-flaeche"/>'
  };
  const roemisch = (rang.name.match(/ (I{1,3})$/) || [])[1] || "";
  const textKlasse = ["gold", "platin", "diamant", "titan", "legende"].includes(rang.stufe) ? "abz-text invers" : "abz-text";
  const text = roemisch ? `<text x="50" y="${rang.stufe === "platin" ? 60 : 58}" class="${textKlasse}">${roemisch}</text>` : rang.stufe === "neu" ? '<text x="50" y="58" class="abz-text">N</text>' : "";
  return `<svg class="abzeichen" width="${groesse}" height="${groesse}" viewBox="0 0 100 100" aria-hidden="true">${formen[rang.stufe]}${rang.stufe === "diamant" || rang.stufe === "legende" || rang.stufe === "titan" ? "" : text}</svg>`;
}

// ---------- Coach ----------
// Ein persönlicher Berater, der nur deine eigenen Daten auswertet (ohne KI-Dienst).

function letztesTraining() {
  const liste = trainings();
  return liste.length ? liste[liste.length - 1] : null;
}

function stagnierendeUebungen() {
  return Object.entries(uebungsstand()).filter(([, st]) => (st.fehlversuche || 0) >= 1).map(([id]) => id).filter((id) => UEBUNGEN[id]);
}

function staerksteUebung() {
  const stand = uebungsstand();
  let beste = null;
  Object.entries(stand).forEach(([id, st]) => {
    const u = UEBUNGEN[id];
    if (!u || u.einheit !== "kg" || !st.verlauf || st.verlauf.length < 2) return;
    const erster = st.verlauf[0].wert;
    const letzter = st.verlauf[st.verlauf.length - 1].wert;
    const plus = (letzter - erster) / erster;
    if (!beste || plus > beste.plus) beste = { id, plus, erster, letzter };
  });
  return beste;
}

// Der wichtigste Hinweis für heute
function coachHinweis() {
  const pr = profil();
  const letztes = letztesTraining();
  const stat = wochenStatistik();
  const name = pr && pr.name ? `, ${pr.name}` : "";

  if (!letztes) return { titel: `Los geht's${name}!`, text: "Starte dein erstes Training. Nimm die vorgeschlagenen Gewichte als Startpunkt – lieber zu leicht als zu schwer. Wir steigern dann gemeinsam." };

  const tage = tageZwischen(new Date(letztes.datum), new Date());
  if (tage === 0) return { titel: "Heute erledigt 💪", text: "Starkes Training! Jetzt zählt die Erholung: genug Eiweiß, viel Wasser und gut schlafen – Muskeln wachsen in der Pause." };
  if (tage >= 6) return { titel: "Willkommen zurück", text: `Dein letztes Training ist ${tage} Tage her. Kein Problem – starte heute ganz normal. Wenn es sich schwer anfühlt, nimm bei den ersten Sätzen 10 % weniger Gewicht.` };

  if (blockWoche() > BLOCK_WOCHEN) return { titel: "Zeit für einen neuen Block", text: `Du trainierst seit ${BLOCK_WOCHEN} Wochen mit diesem Plan. Ein neuer Block bringt frische Reize: Ich tausche ein paar Ergänzungsübungen, die Grundübungen bleiben. Tippe im Tab „Plan“ auf „Neuer Block“.` };

  const offen = stat.ziel - stat.dieseWoche;
  const heute = new Date().getDay();
  const restTage = heute === 0 ? 0 : 7 - heute;
  if (offen > 0 && offen > restTage) return { titel: "Wochenziel wird knapp", text: `Diese Woche fehlen noch ${offen} Trainings, aber nur ${restTage} Tage bleiben. Ein Training zählt trotzdem für XP – und nächste Woche greifst du wieder an.` };

  const haengt = stagnierendeUebungen();
  if (haengt.length) {
    const u = UEBUNGEN[haengt[0]];
    return { titel: `Fokus: ${u.name}`, text: `Hier hängst du gerade etwas. Technik-Tipp: ${u.tipps[0]}. Schlaf und Essen machen oft den Unterschied – nach zwei verpassten Zielen senke ich das Gewicht automatisch etwas.` };
  }

  if (offen > 0) return { titel: `Noch ${offen} ${offen === 1 ? "Training" : "Trainings"} diese Woche`, text: `Für dein Wochenziel (${stat.ziel}×) und den Serien-Bonus. Aktuelle Serie: ${stat.aktuelleSerie} ${stat.aktuelleSerie === 1 ? "Woche" : "Wochen"}.` };
  return { titel: "Wochenziel geschafft", text: "Du hast diese Woche alles erledigt. Ein Extra-Training gibt XP, aber Erholung ist genauso wichtig. Hör auf deinen Körper." };
}

// Fragen an den Coach – Antworten aus deinen Daten
const COACH_FRAGEN = [
  { id: "stand", text: "Wie läuft mein Training?" },
  { id: "heute", text: "Was mache ich heute?" },
  { id: "rang", text: "Wann steige ich auf?" },
  { id: "plateau", text: "Warum steigt mein Gewicht nicht?" },
  { id: "essen", text: "Was soll ich essen?" },
  { id: "aufwaermen", text: "Wie wärme ich mich auf?" },
  { id: "muskelkater", text: "Ich habe Muskelkater – was tun?" },
  { id: "schmerz", text: "Etwas tut weh – was nun?" }
];

function coachAntwort(frage) {
  const pr = profil() || {};
  const stat = wochenStatistik();
  const liste = trainings();
  const info = rangInfo();

  switch (frage) {
    case "stand": {
      if (!liste.length) return "Noch keine Trainings – nach deinem ersten Training kann ich dir genau sagen, wie es läuft.";
      const staerkste = staerksteUebung();
      const teile = [`Du hast ${liste.length} ${liste.length === 1 ? "Training" : "Trainings"} gemacht und ${zahl(info.xp, 0)} XP gesammelt.`];
      teile.push(`Diese Woche: ${stat.dieseWoche} von ${stat.ziel}. Aktuelle Serie: ${stat.aktuelleSerie} ${stat.aktuelleSerie === 1 ? "Woche" : "Wochen"}, beste: ${stat.besteSerie}.`);
      if (staerkste && staerkste.plus > 0) teile.push(`Größter Fortschritt: ${UEBUNGEN[staerkste.id].name} mit +${Math.round(staerkste.plus * 100)} % geschätzter Kraft.`);
      const haengt = stagnierendeUebungen();
      if (haengt.length) teile.push(`Aufpassen bei: ${haengt.map((id) => UEBUNGEN[id].name).join(", ")}.`);
      return teile.join(" ");
    }
    case "heute": {
      const e = naechsteEinheit();
      if (!e) return "Erstelle zuerst deinen Plan.";
      const letztes = letztesTraining();
      if (letztes && tageZwischen(new Date(letztes.datum), new Date()) === 0) return `Heute hast du schon trainiert. Als Nächstes kommt „${e.name}“ – am besten morgen oder übermorgen.`;
      return `Heute steht „${e.name}“ an (${e.fokus}): ${e.uebungen.map((u) => UEBUNGEN[u.id].name).join(", ")}. Starte mit 5 Minuten Aufwärmen und 1–2 leichten Sätzen der ersten Übung.`;
    }
    case "rang": {
      if (!info.naechster) return "Du bist Legende. Mehr geht nicht – jetzt heißt es: Rang halten und Vorbild sein.";
      const wochen = Math.max(1, Math.ceil((info.naechster.xp - info.xp) / 700));
      return `Du bist ${info.rang.name}. Für ${info.naechster.name} fehlt dir: ${info.fehlt.map((f) => f.text).join(", ") || "nichts mehr – das nächste Training bringt den Aufstieg"}. Bei 3 Trainings pro Woche sind das grob ${wochen} ${wochen === 1 ? "Woche" : "Wochen"}. Serien zählen: Wer regelmäßig kommt, steigt schneller auf.`;
    }
    case "plateau": {
      const haengt = stagnierendeUebungen();
      const tipp = haengt.length ? `Gerade betroffen: ${haengt.map((id) => UEBUNGEN[id].name).join(", ")}. ` : "";
      return `${tipp}Häufige Gründe: zu wenig Schlaf (Ziel 8–9 Stunden), zu wenig Eiweiß oder zu viel auf einmal. Schaffst du zweimal hintereinander die Mindest-Wiederholungen nicht, senke ich das Gewicht um 10 % – danach geht es meist schnell wieder darüber hinaus.`;
    }
    case "essen": {
      const kg = pr.koerpergewicht || 70;
      return `Für Muskelaufbau gilt grob: etwa ${Math.round(kg * 1.6)}–${Math.round(kg * 2)} g Eiweiß pro Tag (1,6–2 g pro kg Körpergewicht), verteilt auf 3–5 Mahlzeiten – z. B. Quark, Skyr, Eier, Hähnchen, Linsen. Iss genug insgesamt, gerade im Wachstum. Keine Crash-Diäten! (Die Essens-App kommt noch.)`;
    }
    case "aufwaermen":
      return "5 Minuten locker bewegen (Rad, Laufband, Hampelmänner), dann 1–2 leichte Sätze der ersten Übung mit etwa 50 % des Gewichts. Vor jeder neuen Grundübung einen leichten Satz. Dehnen kannst du nach dem Training.";
    case "muskelkater":
      return "Muskelkater ist normal, besonders am Anfang. Lockere Bewegung (Spazieren, leichtes Radfahren), genug schlafen und trinken hilft. Ist der Muskel noch stark verkatert, trainiere ihn leichter oder lass ihn einen Tag länger ruhen.";
    case "schmerz":
      return "Stechender Schmerz, Schmerz in Gelenken oder Schmerz, der beim Training schlimmer wird: sofort aufhören! Muskelbrennen während eines Satzes ist okay – echter Schmerz nicht. Hält es an, sprich mit einem Arzt oder Physiotherapeuten. Ich bin kein Arzt.";
    default:
      return "Dazu weiß ich noch nichts.";
  }
}
