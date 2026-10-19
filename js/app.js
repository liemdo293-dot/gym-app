// ==========================================================
// Gym – Oberfläche
// Ansichten: Heute, Plan, Coach, Fortschritt, Rang
// dazu: Übungs-Seite, Einstellungen, Fragebogen, Training im Vollbild
// ==========================================================

const ANSICHTEN = ["heute", "plan", "coach", "fortschritt", "rang"];
const ANSICHT_NAMEN = { heute: "Heute", plan: "Plan", coach: "Coach", fortschritt: "Fortschritt", rang: "Rang" };

const zustand = {
  ansicht: "heute",
  seite: null, // "uebung" oder "einstellungen"
  sheet: null,
  chat: [],
  fortschrittUebung: null,
  start: null, // Auswahl im Fragebogen
  training: null, // das laufende Training
  pause: null, // { ende, dauer }
  ergebnis: null
};

const $ = (auswahl) => document.querySelector(auswahl);

function esc(text) {
  return String(text).replace(/[&<>"']/g, (z) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[z]);
}

const SYMBOL = {
  pfeil: '<svg class="pfeil" viewBox="0 0 8 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 1l6 6-6 6"/></svg>',
  zurueck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  haken: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  kreuz: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M5 12h14"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z"/></svg>',
  zahnrad: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  feuer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c4 0 7-2.7 7-6.8 0-3.6-2.4-5.7-4-8.2-.6 2-1.6 3-2.8 3.4C12.6 7.6 11 4.6 8.5 2c.3 3.5-1.8 5.6-3.2 7.8A7.4 7.4 0 0 0 5 15.2C5 19.3 8 22 12 22z"/></svg>',
  pokal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/></svg>',
  pfeilHoch: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
  pfeilRunter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>',
  gleich: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 9h14M5 15h14"/></svg>'
};

// ---------- Farbschema ----------

const hellAbfrage = window.matchMedia("(prefers-color-scheme: light)");

function farbschemaAnwenden(mitUebergang) {
  const modus = einstellungen().theme;
  const hell = modus === "hell" || (modus === "auto" && hellAbfrage.matches);
  const html = document.documentElement;
  if (mitUebergang) {
    html.classList.add("farbwechsel");
    setTimeout(() => html.classList.remove("farbwechsel"), 600);
  }
  html.dataset.theme = hell ? "light" : "dark";
  $('meta[name="theme-color"]').setAttribute("content", hell ? "#f2f2f7" : "#000000");
}

function einstellungAendern(name, wert) {
  speichern(SCHLUESSEL.einstellungen, { ...einstellungen(), [name]: wert });
}

// ---------- Kleine Helfer für die Oberfläche ----------

let toastTimer;
function zeigeToast(text) {
  const toast = $("#toast");
  toast.textContent = text;
  toast.classList.add("sichtbar");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("sichtbar"), 2400);
}

function animieren(bereich) {
  bereich.classList.remove("animieren");
  void bereich.offsetWidth;
  bereich.classList.add("animieren");
  clearTimeout(bereich._timer);
  bereich._timer = setTimeout(() => bereich.classList.remove("animieren"), 1600);
}

// Balken (data-wert = 0…1) beim Erscheinen von 0 auf ihren Wert wachsen lassen
function balkenSetzen(bereich) {
  bereich.querySelectorAll("[data-wert]").forEach((el) => {
    requestAnimationFrame(() => requestAnimationFrame(() => el.style.setProperty("--wert", el.dataset.wert)));
  });
}

function segmentHtml(name, optionen, aktuell, attribut = "data-wahl") {
  const pos = Math.max(0, optionen.findIndex(([w]) => String(w) === String(aktuell)));
  return `
    <div class="segment" style="--anzahl:${optionen.length}; --pos:${pos}" role="radiogroup">
      <span class="segment-daumen"></span>
      ${optionen.map(([wert, text], i) => `<button type="button" role="radio" aria-checked="${i === pos}" class="${i === pos ? "aktiv" : ""}" ${attribut}="${name}" data-wert="${wert}">${text}</button>`).join("")}
    </div>`;
}

// Gleitenden Daumen eines Segments bewegen und den Wert zurückgeben
function segmentWaehlen(knopf) {
  const segment = knopf.closest(".segment");
  const knoepfe = [...segment.querySelectorAll("button")];
  segment.style.setProperty("--pos", knoepfe.indexOf(knopf));
  knoepfe.forEach((k) => {
    k.classList.toggle("aktiv", k === knopf);
    k.setAttribute("aria-checked", k === knopf);
  });
  return knopf.dataset.wert;
}

function pauseDauer() {
  const e = einstellungen();
  if (e.pause) return Number(e.pause);
  const ziel = (profil() || {}).ziel;
  return ziel === "kraft" ? 150 : ziel === "fitness" ? 60 : 90;
}

// ---------- Ansicht „Heute“ ----------

function begruessung() {
  const stunde = new Date().getHours();
  const name = (profil() || {}).name;
  const gruss = stunde < 11 ? "Guten Morgen" : stunde < 18 ? "Bereit" : "Guten Abend";
  return name ? `${gruss}, ${name}` : gruss;
}

function wochenStreifenHtml() {
  const montag = keyZuDatum(wochenKey(new Date()));
  const trainiert = new Set(trainings().map((t) => datumKey(new Date(t.datum))));
  const heute = datumKey(new Date());
  let html = "";
  for (let i = 0; i < 7; i++) {
    const d = new Date(montag);
    d.setDate(montag.getDate() + i);
    const key = datumKey(d);
    const klassen = ["tag-punkt", trainiert.has(key) ? "voll" : "", key === heute ? "heute" : "", key > heute ? "zukunft" : ""].join(" ");
    html += `<span class="${klassen}"><span class="tag-kreis">${trainiert.has(key) ? SYMBOL.haken : ""}</span><span class="tag-name">${TAG_KURZ[d.getDay()]}</span></span>`;
  }
  return html;
}

function heuteHtml() {
  const p = plan();
  const pr = profil();
  const jetzt = new Date();
  const info = rangInfo();
  const stat = info.stat;
  const einheit = naechsteEinheit();
  const aktiv = zustand.training;
  const hinweis = coachHinweis();
  const letztes = letztesTraining();
  let i = 0;

  let html = `
    <header class="kopf kopf-zeile stagger" style="--i:${i++}">
      <div>
        <p class="kopf-oben">${WOCHENTAGE[jetzt.getDay()]}, ${jetzt.getDate()}. ${MONATE[jetzt.getMonth()]}</p>
        <h1>${esc(begruessung())}</h1>
      </div>
      <div class="kopf-knoepfe">
        <button class="kopf-knopf zahnrad" data-aktion="einstellungen" aria-label="Einstellungen">${SYMBOL.zahnrad}</button>
      </div>
    </header>`;

  if (!p || !pr) return html;

  // Große Karte: das nächste Training
  const index = p.einheiten.indexOf(p.einheiten.find((e) => e.id === einheit.id)) + 1;
  const dauer = Math.round(einheit.uebungen.reduce((s, u) => s + u.saetze * (pauseDauer() + 45), 0) / 60) + 5;
  html += `
    <button class="hero drueckbar stagger gym-hero" style="--i:${i++}" data-aktion="training-start">
      <span class="hero-oben">
        <span class="hero-status">${aktiv ? '<span class="punkt"></span>Training läuft' : `Einheit ${index} von ${p.einheiten.length}`}</span>
        <span>Block ${p.block} · Woche ${Math.min(blockWoche(), BLOCK_WOCHEN)}/${BLOCK_WOCHEN}</span>
      </span>
      <span class="hero-fach">${esc(aktiv ? aktiv.name : einheit.name)}</span>
      <span class="hero-info">${esc(einheit.fokus)}</span>
      <span class="hero-bilder">${einheit.uebungen.slice(0, 6).map((u) => uebungsBild(u.id, "mini")).join("")}</span>
      <span class="hero-rest">
        <span>${einheit.uebungen.length} Übungen · ca. ${dauer} Min.</span>
        <span class="hero-start">${SYMBOL.play} ${aktiv ? "Fortsetzen" : "Starten"}</span>
      </span>
    </button>`;

  // Kacheln
  html += `
    <div class="kacheln stagger" style="--i:${i++}">
      <button class="kachel drueckbar" data-gehe="rang"><span class="kachel-wert kachel-abzeichen">${rangAbzeichen(info.rang, 30)}</span><span class="kachel-name">${esc(info.rang.name)}</span></button>
      <button class="kachel drueckbar" data-gehe="rang"><span class="kachel-wert">${stat.aktuelleSerie}<small> Wo.</small></span><span class="kachel-name">Serie</span></button>
      <button class="kachel drueckbar" data-gehe="fortschritt"><span class="kachel-wert">${stat.dieseWoche}<small>/${stat.ziel}</small></span><span class="kachel-name">Diese Woche</span></button>
    </div>`;

  // Woche
  html += `<div class="noten-karte wochen-karte stagger" style="--i:${i++}"><div class="wochenstreifen">${wochenStreifenHtml()}</div></div>`;

  // Rang-Fortschritt
  html += `
    <button class="noten-karte rang-mini drueckbar stagger" style="--i:${i++}" data-gehe="rang">
      <span class="rang-mini-kopf">
        <span class="noten-titel">${info.naechster ? `Auf dem Weg zu ${esc(info.naechster.name)}` : "Höchster Rang"}</span>
        <span class="rang-mini-xp">${zahl(info.xp, 0)} XP</span>
      </span>
      <span class="balken-spur gross"><span class="fortschritt-balken" data-wert="${info.fortschritt.toFixed(3)}"></span></span>
      <span class="hinweis-klein">${info.fehlt.length ? `Es fehlen: ${esc(info.fehlt.map((f) => f.text).join(" · "))}` : "Alles erfüllt!"}</span>
    </button>`;

  // Coach
  html += `
    <h2 class="abschnitt stagger" style="--i:${i++}">Dein Coach <button class="text-knopf" data-gehe="coach">Fragen ›</button></h2>
    <div class="noten-karte coach-karte stagger" style="--i:${i++}">
      <span class="coach-avatar" aria-hidden="true">C</span>
      <span><strong>${esc(hinweis.titel)}</strong><span class="coach-text">${esc(hinweis.text)}</span></span>
    </div>`;

  // Letztes Training
  if (letztes) {
    html += `
      <h2 class="abschnitt stagger" style="--i:${i++}">Letztes Training</h2>
      <div class="liste stagger" style="--i:${i++}">${trainingZeileHtml(letztes)}</div>`;
  }
  return html;
}

function trainingZeileHtml(t) {
  const volumen = t.saetze.reduce((s, x) => s + (x.gewicht || 0) * (x.wdh || 0), 0);
  return `
    <div class="zeile training-zeile">
      <span class="zeile-zeit">${esc(datumKurz(t.datum))}<small>${t.dauerMin} Min.</small></span>
      <span>
        <span class="zeile-name">${esc(t.name)}</span>
        <span class="zeile-info">${t.saetze.length} Sätze · ${zahl(volumen, 0)} kg bewegt${t.prs && t.prs.length ? ` · ${t.prs.length} ${t.prs.length === 1 ? "Rekord" : "Rekorde"}` : ""}</span>
      </span>
      <span class="xp-pille">+${t.xp} XP</span>
    </div>`;
}

// ---------- Ansicht „Plan“ ----------

function planHtml() {
  const p = plan();
  const pr = profil();
  if (!p || !pr) return "";
  const woche = blockWoche();
  let i = 0;

  let html = `
    <header class="kopf stagger" style="--i:${i++}">
      <p class="kopf-oben">${esc(p.split)} · Block ${p.block} · Woche ${Math.min(woche, BLOCK_WOCHEN)} von ${BLOCK_WOCHEN}</p>
      <h1>Trainingsplan</h1>
    </header>
    <div class="noten-karte plan-karte stagger" style="--i:${i++}">
      <span class="plan-profil">${esc(ZIELE[pr.ziel])} · ${esc(ERFAHRUNG[pr.erfahrung])} · ${esc((SCHWIERIGKEIT[pr.schwierigkeit] || SCHWIERIGKEIT.vorsichtig).name)} · ${pr.tage}× pro Woche · ${pr.dauer} Min.</span>
      <span class="balken-spur"><span class="fortschritt-balken" data-wert="${(Math.min(woche, BLOCK_WOCHEN) / BLOCK_WOCHEN).toFixed(3)}"></span></span>
      <span class="hinweis-klein">${woche > BLOCK_WOCHEN ? "Dein Block ist vorbei – Zeit für frische Reize." : `Nach ${BLOCK_WOCHEN} Wochen schlage ich einen neuen Block vor. Gewichte steigen automatisch, wenn du alle Wiederholungen schaffst.`}</span>
    </div>`;

  p.einheiten.forEach((e, ei) => {
    const istNaechste = ei === p.naechste % p.einheiten.length;
    html += `
      <h2 class="abschnitt stagger" style="--i:${i++}">${esc(e.name)} ${istNaechste ? '<span class="marke">Als Nächstes</span>' : `<small>${esc(e.fokus)}</small>`}</h2>
      <div class="liste stagger" style="--i:${i++}">
        ${e.uebungen.map((eintrag, ui) => `
          <button class="uebung-zeile drueckbar" data-uebung="${eintrag.id}" data-einheit="${ei}" data-index="${ui}">
            <span class="uebung-zeile-bild">${uebungsBild(eintrag.id, "klein")}</span>
            <span>
              <span class="zeile-name">${esc(UEBUNGEN[eintrag.id].name)}</span>
              <span class="zeile-info">${esc(zielText(eintrag))}</span>
            </span>
            ${SYMBOL.pfeil}
          </button>`).join("")}
      </div>`;
  });

  html += `
    <div class="knopf-reihe stagger" style="--i:${i++}">
      <button class="knopf ${woche > BLOCK_WOCHEN ? "" : "zweit"} drueckbar" data-aktion="neuer-block">Neuer Block</button>
      <button class="knopf zweit drueckbar" data-aktion="profil-bearbeiten">Plan neu erstellen</button>
    </div>
    <p class="hinweis">Tippe auf eine Übung für Technik-Tipps, deinen Verlauf und zum Tauschen.</p>`;
  return html;
}

// ---------- Ansicht „Coach“ ----------

function coachHtml() {
  if (!zustand.chat.length) {
    const h = coachHinweis();
    zustand.chat.push({ von: "coach", text: `${h.titel}. ${h.text}` });
  }
  return `
    <header class="kopf stagger" style="--i:0">
      <p class="kopf-oben">Dein persönlicher Trainingsberater</p>
      <h1>Coach</h1>
    </header>
    <div class="chat stagger" style="--i:1" id="chat">${zustand.chat.map(chatBlaseHtml).join("")}</div>
    <div class="chips coach-fragen stagger" style="--i:2">
      ${COACH_FRAGEN.map((f) => `<button type="button" class="chip" data-frage="${f.id}">${esc(f.text)}</button>`).join("")}
    </div>
    <p class="hinweis stagger" style="--i:3">Der Coach wertet nur deine eigenen Trainingsdaten aus und läuft komplett auf deinem Gerät. Später kann hier eine echte KI antworten. Bei Schmerzen oder gesundheitlichen Fragen: Arzt fragen.</p>`;
}

function chatBlaseHtml(nachricht) {
  return `<div class="blase ${nachricht.von}">${nachricht.von === "coach" ? '<span class="coach-avatar klein" aria-hidden="true">C</span>' : ""}<span class="blase-text">${esc(nachricht.text)}</span></div>`;
}

function coachFragen(frageId) {
  const frage = COACH_FRAGEN.find((f) => f.id === frageId);
  if (!frage) return;
  const chat = $("#chat");
  zustand.chat.push({ von: "ich", text: frage.text });
  chat.insertAdjacentHTML("beforeend", chatBlaseHtml({ von: "ich", text: frage.text }));
  chat.insertAdjacentHTML("beforeend", '<div class="blase coach tippt"><span class="coach-avatar klein">C</span><span class="blase-text"><i></i><i></i><i></i></span></div>');
  chat.lastElementChild.scrollIntoView({ behavior: "smooth", block: "end" });
  setTimeout(() => {
    const antwort = coachAntwort(frageId);
    zustand.chat.push({ von: "coach", text: antwort });
    const tippt = chat.querySelector(".tippt");
    if (tippt) tippt.outerHTML = chatBlaseHtml({ von: "coach", text: antwort });
    chat.lastElementChild.scrollIntoView({ behavior: "smooth", block: "end" });
  }, 750);
}

// ---------- Ansicht „Fortschritt“ ----------

function linienDiagrammHtml(verlauf, einheit) {
  if (!verlauf || verlauf.length < 2) return '<p class="noten-leer">Nach zwei Trainings mit dieser Übung siehst du hier deine Entwicklung.</p>';
  const werte = verlauf.map((v) => v.wert);
  const min = Math.min(...werte);
  const max = Math.max(...werte);
  const spanne = max - min || 1;
  const b = 300;
  const h = 120;
  const x = (i) => 8 + (i / (verlauf.length - 1)) * (b - 16);
  const y = (w) => 10 + (1 - (w - min) / spanne) * (h - 30);
  const punkte = verlauf.map((v, i) => `${x(i).toFixed(1)},${y(v.wert).toFixed(1)}`).join(" ");
  const flaeche = `8,${h - 20} ${punkte} ${x(verlauf.length - 1).toFixed(1)},${h - 20}`;
  const label = einheit === "kg" ? "geschätztes Maximum (kg)" : einheit === "s" ? "beste Zeit (s)" : "beste Wiederholungen";
  const letzter = verlauf[verlauf.length - 1];
  return `
    <svg class="linien-diagramm" viewBox="0 0 ${b} ${h}" role="img" aria-label="Verlauf: ${label}">
      <line class="raster" x1="8" y1="10" x2="${b - 8}" y2="10"/><line class="raster" x1="8" y1="${h - 20}" x2="${b - 8}" y2="${h - 20}"/>
      <polygon class="flaeche" points="${flaeche}"/>
      <polyline class="linie" points="${punkte}"/>
      ${verlauf.map((v, i) => `<circle class="punkt-k ${i === verlauf.length - 1 ? "letzter" : ""}" cx="${x(i).toFixed(1)}" cy="${y(v.wert).toFixed(1)}" r="${i === verlauf.length - 1 ? 4.5 : 3}"><title>${datumKurz(v.datum)}: ${einheit === "kg" ? `${zahl(v.gewicht)} kg × ${v.wdh}` : v.wdh}</title></circle>`).join("")}
      <text class="achse" x="8" y="${h - 4}">${datumKurz(verlauf[0].datum)}</text>
      <text class="achse" x="${b - 8}" y="${h - 4}" text-anchor="end">${datumKurz(letzter.datum)}</text>
      <text class="achse" x="${b - 8}" y="22" text-anchor="end">${zahl(max)}</text>
    </svg>
    <p class="hinweis-klein">${label} · zuletzt ${einheit === "kg" ? `${zahl(letzter.gewicht)} kg × ${letzter.wdh}` : letzter.wdh}</p>`;
}

function fortschrittHtml() {
  const liste = trainings();
  const stat = wochenStatistik();
  const stand = uebungsstand();
  const volumen = liste.reduce((s, t) => s + t.saetze.reduce((a, x) => a + (x.gewicht || 0) * (x.wdh || 0), 0), 0);
  const rekorde = liste.reduce((s, t) => s + (t.prs ? t.prs.length : 0), 0);
  let i = 0;

  let html = `
    <header class="kopf stagger" style="--i:${i++}">
      <p class="kopf-oben">${liste.length} Trainings · beste Serie ${stat.besteSerie} Wo.</p>
      <h1>Fortschritt</h1>
    </header>
    <div class="kacheln stagger" style="--i:${i++}">
      <div class="kachel"><span class="kachel-wert">${liste.length}</span><span class="kachel-name">Trainings</span></div>
      <div class="kachel"><span class="kachel-wert">${volumen >= 1000 ? `${zahl(volumen / 1000)}<small> t</small>` : `${zahl(volumen, 0)}<small> kg</small>`}</span><span class="kachel-name">Bewegt</span></div>
      <div class="kachel"><span class="kachel-wert">${rekorde}</span><span class="kachel-name">Rekorde</span></div>
    </div>`;

  // Trainings pro Woche (letzte 8 Wochen)
  const wochen = [];
  const montag = keyZuDatum(wochenKey(new Date()));
  for (let w = 7; w >= 0; w--) {
    const d = new Date(montag);
    d.setDate(montag.getDate() - w * 7);
    wochen.push({ key: datumKey(d), datum: d, anzahl: stat.proWoche[datumKey(d)] || 0 });
  }
  const skala = Math.max(stat.ziel + 1, ...wochen.map((w) => w.anzahl));
  html += `
    <h2 class="abschnitt stagger" style="--i:${i++}">Trainings pro Woche <small>Ziel ${stat.ziel}×</small></h2>
    <div class="noten-karte stagger" style="--i:${i++}">
      <div class="wochen-saeulen">
        <span class="ziel-linie" style="--y:${(stat.ziel / skala).toFixed(3)}"><span>Ziel</span></span>
        ${wochen.map((w, n) => `
          <span class="w-spalte ${w.anzahl >= stat.ziel ? "erreicht" : ""}" style="--i:${n}">
            <span class="w-flaeche"><span class="w-saeule" data-wert="${(w.anzahl / skala).toFixed(3)}"></span><span class="w-zahl">${w.anzahl || ""}</span></span>
            <span class="w-name">${n === 7 ? "Jetzt" : `${w.datum.getDate()}.${w.datum.getMonth() + 1}.`}</span>
          </span>`).join("")}
      </div>
    </div>`;

  // Entwicklung je Übung
  const mitVerlauf = Object.keys(stand).filter((id) => UEBUNGEN[id] && stand[id].verlauf && stand[id].verlauf.length);
  if (!zustand.fortschrittUebung || !mitVerlauf.includes(zustand.fortschrittUebung)) zustand.fortschrittUebung = mitVerlauf[0] || null;
  html += `<h2 class="abschnitt stagger" style="--i:${i++}">Entwicklung je Übung</h2>`;
  if (mitVerlauf.length) {
    const id = zustand.fortschrittUebung;
    html += `
      <div class="chips stagger" style="--i:${i++}">${mitVerlauf.map((u) => `<button type="button" class="chip ${u === id ? "aktiv" : ""}" data-fortschritt="${u}">${esc(UEBUNGEN[u].name)}</button>`).join("")}</div>
      <div class="noten-karte stagger" style="--i:${i++}" id="verlauf-karte">${linienDiagrammHtml(stand[id].verlauf, UEBUNGEN[id].einheit)}</div>`;
  } else {
    html += `<div class="noten-karte stagger" style="--i:${i++}"><p class="noten-leer">Nach deinem ersten Training siehst du hier für jede Übung, wie du stärker wirst.</p></div>`;
  }

  if (liste.length) {
    html += `
      <h2 class="abschnitt stagger" style="--i:${i++}">Verlauf</h2>
      <div class="liste stagger" style="--i:${i++}">${liste.slice(-12).reverse().map(trainingZeileHtml).join("")}</div>`;
  }
  return html;
}

// ---------- Ansicht „Rang“ ----------

function rangHtml() {
  const info = rangInfo();
  let i = 0;

  let html = `
    <header class="kopf stagger" style="--i:${i++}">
      <p class="kopf-oben">${zahl(info.xp, 0)} XP gesamt</p>
      <h1>Rang</h1>
    </header>
    <div class="noten-karte rang-gross stagger" style="--i:${i++}">
      <span class="rang-emblem">${rangAbzeichen(info.rang, 112)}</span>
      <span class="rang-name">${esc(info.rang.name)}</span>
      ${info.naechster ? `
        <span class="rang-ziel">Nächster Rang: <strong>${esc(info.naechster.name)}</strong></span>
        <span class="balken-spur gross"><span class="fortschritt-balken" data-wert="${info.fortschritt.toFixed(3)}"></span></span>
        <span class="rang-zahlen"><span>${zahl(info.xp - info.rang.xp, 0)} XP</span><span>${zahl(info.naechster.xp - info.rang.xp, 0)} XP</span></span>
        <ul class="rang-bedingungen">
          ${[
            ["XP", info.xp >= info.naechster.xp, `${zahl(Math.min(info.xp, info.naechster.xp), 0)} / ${zahl(info.naechster.xp, 0)}`],
            ["Beste Wochen-Serie", info.stat.besteSerie >= info.naechster.serie, `${Math.min(info.stat.besteSerie, info.naechster.serie)} / ${info.naechster.serie}`],
            ["Trainings", info.anzahl >= info.naechster.trainings, `${Math.min(info.anzahl, info.naechster.trainings)} / ${info.naechster.trainings}`]
          ].map(([name, ok, wert]) => `<li class="${ok ? "ok" : ""}"><span class="bed-symbol">${ok ? SYMBOL.haken : ""}</span><span>${name}</span><span class="bed-wert">${wert}</span></li>`).join("")}
        </ul>` : '<span class="rang-ziel">Du hast den höchsten Rang erreicht.</span>'}
    </div>

    <div class="kacheln stagger" style="--i:${i++}">
      <div class="kachel"><span class="kachel-wert">${info.stat.aktuelleSerie}<small> Wo.</small></span><span class="kachel-name">Aktuelle Serie</span></div>
      <div class="kachel"><span class="kachel-wert">${info.stat.besteSerie}<small> Wo.</small></span><span class="kachel-name">Beste Serie</span></div>
      <div class="kachel"><span class="kachel-wert">${info.anzahl}</span><span class="kachel-name">Trainings</span></div>
    </div>

    <h2 class="abschnitt stagger" style="--i:${i++}">So verdienst du XP</h2>
    <div class="liste stagger" style="--i:${i++}">
      ${[
        ["Training abgeschlossen (ab 6 Sätzen)", "+100"],
        ["Pro Satz", "+6"],
        ["Pro harter Satz", "+2"],
        ["Pro persönlichem Rekord", "+40"],
        ["Wochenziel erreicht", "+200"],
        ["Serien-Bonus pro Woche Serie", "+5 % (max. +50 %)"],
        ["Zweites Training am selben Tag", "nur 25 %"]
      ].map(([name, wert]) => `<div class="infozeile"><span>${name}</span><span>${wert}</span></div>`).join("")}
    </div>
    <p class="hinweis stagger" style="--i:${i++}">Aufsteigen braucht mehr als XP: Jeder Rang verlangt auch eine Wochen-Serie (Wochenziel mehrere Wochen am Stück) und eine Mindestzahl an Trainings. Wer regelmäßig kommt, schlägt wer viel auf einmal macht.</p>

    <h2 class="abschnitt stagger" style="--i:${i++}">Alle Ränge</h2>
    <div class="liste stagger" style="--i:${i++}">
      ${RAENGE.map((r, n) => {
        const status = n < info.index ? "erreicht" : n === info.index ? "aktuell" : "gesperrt";
        return `
          <div class="rang-zeile ${status}">
            ${rangAbzeichen(r, 36)}
            <span>
              <span class="zeile-name">${esc(r.name)}</span>
              <span class="zeile-info">${n === 0 ? "Start" : `${zahl(r.xp, 0)} XP · ${r.serie ? `${r.serie} Wo. Serie · ` : ""}${r.trainings} Trainings`}</span>
            </span>
            <span class="rang-status">${status === "erreicht" ? SYMBOL.haken : status === "aktuell" ? '<span class="marke">Du</span>' : ""}</span>
          </div>`;
      }).join("")}
    </div>`;
  return html;
}

// ---------- Seiten von rechts: Übung und Einstellungen ----------

function seiteOeffnen(art, html) {
  zustand.seite = art;
  const detail = $("#detail");
  detail.innerHTML = html;
  detail.scrollTop = 0;
  detail.setAttribute("aria-hidden", "false");
  animieren(detail);
  balkenSetzen(detail);
  requestAnimationFrame(() => {
    detail.classList.add("offen");
    $(".app").classList.add("detail-offen");
  });
}

function seiteSchliessen() {
  if (!zustand.seite) return;
  zustand.seite = null;
  const detail = $("#detail");
  detail.classList.remove("offen");
  detail.setAttribute("aria-hidden", "true");
  $(".app").classList.remove("detail-offen");
  render(zustand.ansicht, false);
}

function seitenLeiste() {
  return `<div class="detail-leiste"><button class="zurueck" data-aktion="zurueck">${SYMBOL.zurueck}${ANSICHT_NAMEN[zustand.ansicht]}</button></div>`;
}

function uebungSeiteHtml(id, einheitIndex, uebungIndex) {
  const u = UEBUNGEN[id];
  const st = uebungsstand()[id] || {};
  const eintrag = einheitIndex !== null ? plan().einheiten[einheitIndex].uebungen[uebungIndex] : null;
  return `
    ${seitenLeiste()}
    <div class="detail-inhalt">
      <div class="bild-karte stagger" style="--i:0">${uebungsBild(id, "gross")}</div>
      <header class="detail-kopf links stagger" style="--i:1">
        <h1>${esc(u.name)}</h1>
        <p>${u.muskeln.map((m) => MUSKELN[m]).join(" · ")} · ${u.typ === "grund" ? "Grundübung" : "Ergänzungsübung"}</p>
      </header>
      ${eintrag ? `
        <div class="liste stagger" style="--i:2">
          <div class="infozeile"><span>Dein Ziel</span><span>${esc(zielText(eintrag))}</span></div>
          ${u.einheit === "kg" ? `<div class="infozeile"><span>Steigerung</span><span>+${zahl(u.schritt)} kg, wenn alle Sätze klappen</span></div>` : ""}
          <div class="infozeile"><span>Bestwert</span><span>${st.best ? (u.einheit === "kg" ? `≈ ${zahl(st.best)} kg Maximum` : `${zahl(st.best, 0)} ${u.einheit === "s" ? "s" : "Wdh."}`) : "noch keiner"}</span></div>
        </div>` : ""}
      <h2 class="abschnitt stagger" style="--i:3">So geht's richtig</h2>
      <div class="liste stagger" style="--i:3">
        ${u.tipps.map((t, n) => `<div class="tipp-zeile"><span class="tipp-nr">${n + 1}</span><span>${esc(t)}</span></div>`).join("")}
      </div>
      <h2 class="abschnitt stagger" style="--i:4">Typische Fehler</h2>
      <div class="liste stagger" style="--i:4">
        ${u.fehler.map((t) => `<div class="tipp-zeile fehler"><span class="tipp-nr">${SYMBOL.kreuz}</span><span>${esc(t)}</span></div>`).join("")}
      </div>
      <h2 class="abschnitt stagger" style="--i:5">Dein Verlauf</h2>
      <div class="noten-karte stagger" style="--i:5">${linienDiagrammHtml(st.verlauf, u.einheit)}</div>
      ${eintrag ? `<button class="knopf breit zweit drueckbar stagger" style="--i:6" data-aktion="tauschen" data-einheit="${einheitIndex}" data-index="${uebungIndex}">Übung tauschen</button>` : ""}
    </div>`;
}

function einstellungenHtml() {
  const e = einstellungen();
  const pr = profil() || {};
  return `
    ${seitenLeiste()}
    <div class="detail-inhalt einstellungen">
      <header class="kopf stagger" style="--i:0"><h1>Einstellungen</h1></header>

      <h2 class="abschnitt stagger" style="--i:1">Darstellung</h2>
      <div class="stagger" style="--i:1">
        ${segmentHtml("theme", [["dunkel", "Dunkel"], ["hell", "Hell"], ["auto", "Automatisch"]], e.theme, "data-einstellung")}
      </div>

      <h2 class="abschnitt stagger" style="--i:2">Schwierigkeit</h2>
      <div class="stagger" style="--i:2">
        ${segmentHtml("schwierigkeit", Object.entries(SCHWIERIGKEIT).map(([w, s]) => [w, s.name]), pr.schwierigkeit || "vorsichtig", "data-schwierigkeit")}
        <p class="hinweis">Wechselst du die Stufe, rechne ich alle deine Gewichte passend um.</p>
        <span class="feld-titel">Alle Gewichte anpassen</span>
        <div class="knopf-reihe gewichte-reihe">
          <button class="knopf zweit drueckbar" data-aktion="gewichte" data-faktor="0.9">−10 %</button>
          <button class="knopf zweit drueckbar" data-aktion="gewichte" data-faktor="1.1">+10 %</button>
          <button class="knopf zweit drueckbar" data-aktion="gewichte" data-faktor="1.2">+20 %</button>
        </div>
        <p class="hinweis">Gilt für alle Übungen mit Gewicht. Gerundet auf die nächste Hantelstufe.</p>
      </div>

      <h2 class="abschnitt stagger" style="--i:2">Pausen zwischen Sätzen</h2>
      <div class="stagger" style="--i:2">
        ${segmentHtml("pause", [["", "Auto"], [60, "1:00"], [90, "1:30"], [120, "2:00"], [180, "3:00"]], e.pause || "", "data-einstellung")}
        <p class="hinweis">„Auto“ richtet sich nach deinem Ziel: Kraft 2:30, Muskelaufbau 1:30, Fitness 1:00.</p>
      </div>

      <h2 class="abschnitt stagger" style="--i:3">Profil</h2>
      <div class="liste stagger" style="--i:3">
        <div class="infozeile"><span>Name</span><span>${esc(pr.name || "–")}</span></div>
        <div class="infozeile"><span>Ziel</span><span>${esc(ZIELE[pr.ziel] || "–")}</span></div>
        <div class="infozeile"><span>Trainings pro Woche</span><span>${pr.tage || "–"}</span></div>
        <div class="infozeile"><span>Schwierigkeit</span><span>${esc((SCHWIERIGKEIT[pr.schwierigkeit] || SCHWIERIGKEIT.vorsichtig).name)}</span></div>
        <div class="infozeile"><span>Körpergewicht</span><span>${pr.koerpergewicht ? `${pr.koerpergewicht} kg` : "–"}</span></div>
      </div>
      <button class="knopf breit zweit drueckbar stagger" style="--i:3" data-aktion="profil-bearbeiten">Profil & Plan ändern</button>

      <h2 class="abschnitt stagger" style="--i:4">Datensicherung</h2>
      <div class="stagger" style="--i:4">
        <div class="knopf-reihe">
          <button class="knopf drueckbar" data-aktion="backup-sichern">Daten sichern</button>
          <button class="knopf zweit drueckbar" data-aktion="backup-waehlen">Wiederherstellen</button>
        </div>
        <p class="hinweis">Deine Trainings bleiben nur auf diesem Gerät. „Daten sichern“ speichert alles als Datei, mit „Wiederherstellen“ holst du es zurück – auch auf einem anderen Gerät.</p>
      </div>

      <h2 class="abschnitt stagger" style="--i:5">Über</h2>
      <div class="liste stagger" style="--i:5">
        <div class="infozeile"><span>Version</span><span>1.0</span></div>
        <div class="infozeile"><span>Teil von</span><span>Mein Ecosystem</span></div>
      </div>
    </div>`;
}

// ---------- Fenster von unten ----------

function sheetOeffnen(html, art, titel) {
  zustand.sheet = art;
  const sheet = $("#sheet");
  sheet.innerHTML = `<div class="sheet-griff"></div><div class="sheet-kopf"><button type="button" class="text-knopf" data-aktion="sheet-zu">Abbrechen</button><h2>${esc(titel)}</h2><span></span></div>${html}`;
  sheet.setAttribute("aria-label", titel);
  sheet.setAttribute("aria-hidden", "false");
  sheet.scrollTop = 0;
  requestAnimationFrame(() => {
    sheet.classList.add("offen");
    $("#sheet-hintergrund").classList.add("offen");
  });
}

function sheetSchliessen() {
  if (!zustand.sheet) return;
  zustand.sheet = null;
  $("#sheet").classList.remove("offen");
  $("#sheet").setAttribute("aria-hidden", "true");
  $("#sheet-hintergrund").classList.remove("offen");
}

function tauschenOeffnen(einheitIndex, uebungIndex) {
  const aktuell = plan().einheiten[einheitIndex].uebungen[uebungIndex].id;
  const optionen = tauschOptionen(aktuell);
  sheetOeffnen(`
    <p class="backup-herkunft">Statt <strong>${esc(UEBUNGEN[aktuell].name)}</strong>:</p>
    <div class="tausch-raster">
      ${optionen.map((id) => `
        <button type="button" class="tausch-karte drueckbar" data-tausch="${id}" data-einheit="${einheitIndex}" data-index="${uebungIndex}">
          ${uebungsBild(id, "klein")}
          <span class="zeile-name">${esc(UEBUNGEN[id].name)}</span>
          <span class="zeile-info">${UEBUNGEN[id].muskeln.map((m) => MUSKELN[m]).join(" · ")}</span>
        </button>`).join("")}
    </div>`, "tauschen", "Übung tauschen");
}

// ---------- Fragebogen (erster Start und „Plan neu erstellen“) ----------

function startOeffnen(bearbeiten) {
  const pr = profil();
  zustand.start = pr ? { schwierigkeit: "vorsichtig", ...pr } : { name: "", ziel: "muskel", erfahrung: "anfaenger", schwierigkeit: "normal", tage: 3, dauer: 60, koerpergewicht: "" };
  const s = zustand.start;
  const element = $("#start");
  element.innerHTML = `
    <div class="start-inhalt">
      ${bearbeiten ? `<button class="text-knopf start-zurueck" data-aktion="start-zu">${SYMBOL.zurueck} Zurück</button>` : ""}
      <div class="start-logo">${rangAbzeichen(RAENGE[1], 64)}</div>
      <p class="kopf-oben">${bearbeiten ? "Profil ändern" : "Willkommen"}</p>
      <h1>${bearbeiten ? "Plan anpassen" : "Dein persönlicher Trainingsplan"}</h1>
      <p class="start-text">Ein paar Fragen – dann bekommst du einen Plan mit Übungen, Sätzen und Startgewichten, der mit dir mitwächst.</p>

      <label class="feld-titel" for="start-name">Wie heißt du?</label>
      <input class="feld" id="start-name" type="text" maxlength="24" autocomplete="off" placeholder="Dein Vorname" value="${esc(s.name || "")}">

      <span class="feld-titel">Dein Ziel</span>
      ${segmentHtml("ziel", [["muskel", "Muskelaufbau"], ["kraft", "Kraft"], ["fitness", "Fitness"]], s.ziel, "data-start")}

      <span class="feld-titel">Erfahrung im Gym</span>
      ${segmentHtml("erfahrung", [["anfaenger", "Anfänger"], ["fortgeschritten", "Fortgeschritten"]], s.erfahrung, "data-start")}

      <span class="feld-titel">Startgewichte</span>
      ${segmentHtml("schwierigkeit", Object.entries(SCHWIERIGKEIT).map(([w, s]) => [w, s.name]), s.schwierigkeit, "data-start")}
      <p class="hinweis start-hinweis">Unsicher? Nimm „Normal“. In den ersten Trainings steigen die Gewichte doppelt so schnell, bis sie passen.</p>

      <span class="feld-titel">Trainings pro Woche</span>
      ${segmentHtml("tage", [[2, "2×"], [3, "3×"], [4, "4×"], [5, "5×"]], s.tage, "data-start")}

      <span class="feld-titel">Zeit pro Training</span>
      ${segmentHtml("dauer", [[45, "45 Min."], [60, "60 Min."], [75, "75 Min."]], s.dauer, "data-start")}

      <label class="feld-titel" for="start-gewicht">Körpergewicht (für Startgewichte)</label>
      <div class="feld-mit-einheit"><input class="feld" id="start-gewicht" type="number" inputmode="decimal" min="30" max="200" placeholder="z. B. 70" value="${esc(s.koerpergewicht || "")}"><span>kg</span></div>

      <p class="quiz-fehler" id="start-fehler" role="alert"></p>
      <button class="knopf breit drueckbar" data-aktion="plan-erstellen">${bearbeiten ? "Plan neu erstellen" : "Meinen Plan erstellen"}</button>
      ${bearbeiten ? '<p class="hinweis">Deine Gewichte, Trainings und XP bleiben erhalten.</p>' : '<p class="hinweis">Alles bleibt auf deinem Gerät.</p>'}
    </div>`;
  element.setAttribute("aria-hidden", "false");
  element.scrollTop = 0;
  requestAnimationFrame(() => element.classList.add("offen"));
}

function startSchliessen() {
  const element = $("#start");
  element.classList.remove("offen");
  element.setAttribute("aria-hidden", "true");
}

function planErstellenAusStart() {
  const s = zustand.start;
  s.name = $("#start-name").value.trim();
  const gewicht = Number(String($("#start-gewicht").value).replace(",", "."));
  if (!gewicht || gewicht < 30 || gewicht > 200) {
    $("#start-fehler").textContent = "Bitte gib dein Körpergewicht ein (30–200 kg). Daraus berechne ich vorsichtige Startgewichte.";
    return;
  }
  s.koerpergewicht = gewicht;
  s.tage = Number(s.tage);
  s.dauer = Number(s.dauer);

  // Bestehendes Profil: geänderte Schwierigkeit rechnet die vorhandenen Gewichte um
  const vorher = profil();
  if (vorher && vorher.schwierigkeit !== s.schwierigkeit) {
    gewichteSkalieren(schwierigkeitFaktor(s.schwierigkeit) / schwierigkeitFaktor(vorher.schwierigkeit));
  }

  speichern(SCHLUESSEL.profil, { ...s, erstellt: (vorher || {}).erstellt || new Date().toISOString() });
  planErstellen(s);
  startSchliessen();
  seiteSchliessen();
  zeigeAnsicht("plan");
  zeigeToast("Dein Plan ist fertig 💪");
}

// ---------- Training im Vollbild ----------

function trainingStarten() {
  if (!zustand.training) {
    const einheit = naechsteEinheit();
    zustand.training = {
      id: neueId(),
      einheitId: einheit.id,
      name: einheit.name,
      start: new Date().toISOString(),
      index: 0,
      uebungen: einheit.uebungen.map((eintrag) => ({ id: eintrag.id, eintrag })),
      saetze: {}
    };
    // Sätze mit Zielwerten vorbereiten
    zustand.training.uebungen.forEach(({ id, eintrag }) => {
      const z = ziel(eintrag);
      zustand.training.saetze[id] = Array.from({ length: z.saetze }, () => ({ gewicht: z.gewicht, wdh: z.wdhMax, gefuehl: null, fertig: false }));
    });
    trainingSpeichern();
  }
  zustand.ergebnis = null;
  const element = $("#training");
  element.setAttribute("aria-hidden", "false");
  trainingRendern();
  requestAnimationFrame(() => element.classList.add("offen"));
  tonVorbereiten();
}

function trainingSpeichern() {
  speichern(SCHLUESSEL.aktiv, zustand.training);
}

function trainingSchliessen() {
  const element = $("#training");
  element.classList.remove("offen");
  element.setAttribute("aria-hidden", "true");
  zustand.pause = null;
  render(zustand.ansicht, false);
}

function stepperHtml(feld, wert, uIndex, sIndex, einheit) {
  const anzeige = feld === "gewicht" ? zahl(wert) : wert;
  return `
    <span class="stepper">
      <button type="button" class="stepper-knopf" data-schritt="${feld}" data-richtung="-1" data-u="${uIndex}" data-s="${sIndex}" aria-label="weniger">${SYMBOL.minus}</button>
      <input class="stepper-wert" type="text" inputmode="decimal" data-feld="${feld}" data-u="${uIndex}" data-s="${sIndex}" value="${anzeige}" aria-label="${feld === "gewicht" ? "Gewicht" : einheit === "s" ? "Sekunden" : "Wiederholungen"}">
      <button type="button" class="stepper-knopf" data-schritt="${feld}" data-richtung="1" data-u="${uIndex}" data-s="${sIndex}" aria-label="mehr">${SYMBOL.plus}</button>
    </span>`;
}

function trainingHtml() {
  const t = zustand.training;
  const anzahl = t.uebungen.length;
  const { id, eintrag } = t.uebungen[t.index];
  const u = UEBUNGEN[id];
  const z = ziel(eintrag);
  const saetze = t.saetze[id];
  const fertigGesamt = Object.values(t.saetze).flat().filter((s) => s.fertig).length;
  const gesamt = Object.values(t.saetze).flat().length;

  return `
    <div class="quiz-leiste">
      <button class="text-knopf" data-aktion="training-zu">${SYMBOL.zurueck} Minimieren</button>
      <span class="quiz-zaehler">Übung ${t.index + 1} von ${anzahl}</span>
      <button class="text-knopf stark" data-aktion="training-beenden">Beenden</button>
    </div>
    <div class="quiz-fortschritt"><span class="quiz-fortschritt-wert" style="--wert:${(fertigGesamt / gesamt).toFixed(3)}"></span></div>

    <div class="training-inhalt wechsel">
      <div class="training-kopf">
        <div class="training-bild">${uebungsBild(id, "mittel")}</div>
        <div>
          <p class="timer-phase">${u.muskeln.map((m) => MUSKELN[m]).join(" · ")}</p>
          <h2 class="training-titel">${esc(u.name)}</h2>
          <p class="training-ziel">${esc(zielText(eintrag))}</p>
          <button class="text-knopf klein-text" data-aktion="uebung-info" data-uebung="${id}">Technik ansehen ›</button>
        </div>
      </div>

      <div class="tipp-band">💡 ${esc(u.tipps[0])}</div>

      <div class="liste satz-liste">
        <div class="satz-kopf"><span>Satz</span><span>${u.einheit === "kg" ? "Gewicht (kg)" : ""}</span><span>${u.einheit === "s" ? "Sekunden" : "Wdh."}</span><span></span></div>
        ${saetze.map((s, n) => `
          <div class="satz-zeile ${s.fertig ? "fertig" : ""}">
            <span class="satz-nr">${n + 1}</span>
            <span>${u.einheit === "kg" ? stepperHtml("gewicht", s.gewicht, t.index, n, u.einheit) : '<span class="satz-kg">Körpergewicht</span>'}</span>
            <span>${stepperHtml("wdh", s.wdh, t.index, n, u.einheit)}</span>
            <button type="button" class="satz-haken" data-aktion="satz-fertig" data-s="${n}" aria-pressed="${s.fertig}" aria-label="Satz ${n + 1} erledigt">${SYMBOL.haken}</button>
          </div>
          ${s.fertig ? `
            <div class="gefuehl-zeile">
              <span>Wie war's?</span>
              ${Object.entries(GEFUEHL).map(([w, text]) => `<button type="button" class="chip klein ${s.gefuehl === w ? "aktiv" : ""}" data-gefuehl="${w}" data-s="${n}">${text}</button>`).join("")}
            </div>` : ""}`).join("")}
      </div>
      <button type="button" class="text-knopf satz-dazu" data-aktion="satz-dazu">${SYMBOL.plus} Satz hinzufügen</button>

      <div class="training-nav">
        <button class="knopf zweit drueckbar" data-aktion="uebung-zurueck" ${t.index === 0 ? "disabled" : ""}>‹ Zurück</button>
        ${t.index < anzahl - 1
          ? '<button class="knopf drueckbar" data-aktion="uebung-weiter">Nächste Übung ›</button>'
          : '<button class="knopf drueckbar" data-aktion="training-beenden">Training beenden</button>'}
      </div>
      <p class="hinweis training-hinweis">Ziel geschafft? Dann einfach abhaken. Weniger geschafft? Wiederholungen anpassen – daraus lernt dein Plan.</p>
    </div>

    <div class="pause-leiste ${zustand.pause ? "sichtbar" : ""}" id="pause-leiste" aria-live="polite">
      <span class="pause-ring"><svg viewBox="0 0 40 40"><circle class="spur" cx="20" cy="20" r="16"/><circle class="wert" id="pause-ring" cx="20" cy="20" r="16" stroke-dasharray="100.5" stroke-dashoffset="0"/></svg></span>
      <span class="pause-text"><small>Pause</small><strong id="pause-zeit">0:00</strong></span>
      <button type="button" class="chip klein" data-aktion="pause-plus">+15 s</button>
      <button type="button" class="chip klein" data-aktion="pause-ende">Weiter</button>
    </div>`;
}

function trainingRendern() {
  const element = $("#training");
  element.innerHTML = zustand.ergebnis ? ergebnisHtml() : trainingHtml();
  if (zustand.ergebnis) ergebnisAnimieren();
  else pauseTick();
}

function satzWertAendern(uIndex, sIndex, feld, roh) {
  const t = zustand.training;
  const { id } = t.uebungen[uIndex];
  const u = UEBUNGEN[id];
  const wert = Number(String(roh).replace(",", "."));
  if (!Number.isFinite(wert) || wert < 0) return;
  const satz = t.saetze[id][sIndex];
  satz[feld] = feld === "gewicht" ? Math.round(wert * 4) / 4 : Math.round(wert);
  // Gewicht in späteren, noch offenen Sätzen gleich mitziehen
  if (feld === "gewicht") t.saetze[id].slice(sIndex + 1).forEach((s) => { if (!s.fertig) s.gewicht = satz.gewicht; });
  trainingSpeichern();
  if (u) trainingRendern();
}

function stepper(knopf) {
  const t = zustand.training;
  const uIndex = Number(knopf.dataset.u);
  const sIndex = Number(knopf.dataset.s);
  const feld = knopf.dataset.schritt;
  const { id } = t.uebungen[uIndex];
  const u = UEBUNGEN[id];
  const satz = t.saetze[id][sIndex];
  const schritt = feld === "gewicht" ? u.schritt : u.einheit === "s" ? 5 : 1;
  satzWertAendern(uIndex, sIndex, feld, Math.max(0, satz[feld] + Number(knopf.dataset.richtung) * schritt));
}

function satzFertig(sIndex) {
  const t = zustand.training;
  const { id } = t.uebungen[t.index];
  const satz = t.saetze[id][sIndex];
  satz.fertig = !satz.fertig;
  if (satz.fertig) {
    satz.gefuehl = satz.gefuehl || "gut";
    pauseStarten();
    if (navigator.vibrate) navigator.vibrate(30);
  }
  trainingSpeichern();
  trainingRendern();
}

// ---------- Pausen-Timer ----------

let audio = null;
function tonVorbereiten() {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === "suspended") audio.resume();
  } catch (fehler) {
    audio = null;
  }
}

function klingeln() {
  if (!audio) return;
  try {
    [[784, 0], [1046.5, 0.18]].forEach(([frequenz, verzoegerung]) => {
      const ton = audio.createOscillator();
      const laut = audio.createGain();
      const t = audio.currentTime + verzoegerung;
      ton.frequency.value = frequenz;
      laut.gain.setValueAtTime(0.0001, t);
      laut.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      laut.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
      ton.connect(laut).connect(audio.destination);
      ton.start(t);
      ton.stop(t + 0.75);
    });
  } catch (fehler) {
    // ohne Ton
  }
}

function pauseStarten() {
  const dauer = pauseDauer();
  zustand.pause = { ende: Date.now() + dauer * 1000, dauer };
}

function pauseTick() {
  const leiste = $("#pause-leiste");
  if (!zustand.pause || !leiste) {
    if (leiste) leiste.classList.remove("sichtbar");
    return;
  }
  const rest = Math.max(0, Math.ceil((zustand.pause.ende - Date.now()) / 1000));
  leiste.classList.add("sichtbar");
  $("#pause-zeit").textContent = `${Math.floor(rest / 60)}:${String(rest % 60).padStart(2, "0")}`;
  $("#pause-ring").style.strokeDashoffset = (100.5 * (1 - rest / zustand.pause.dauer)).toFixed(1);
  if (rest <= 0) {
    zustand.pause = null;
    klingeln();
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    leiste.classList.remove("sichtbar");
    zeigeToast("Pause vorbei – nächster Satz!");
  }
}

// ---------- Training beenden und auswerten ----------

let beendenBestaetigen = false;
function trainingBeenden(knopf) {
  const t = zustand.training;
  const erledigt = [];
  t.uebungen.forEach(({ id }) => t.saetze[id].forEach((s) => { if (s.fertig) erledigt.push({ uebungId: id, gewicht: UEBUNGEN[id].einheit === "kg" ? s.gewicht : 0, wdh: s.wdh, gefuehl: s.gefuehl || "gut" }); }));

  if (!erledigt.length) {
    if (!beendenBestaetigen) {
      beendenBestaetigen = true;
      knopf.textContent = "Wirklich verwerfen?";
      setTimeout(() => { beendenBestaetigen = false; }, 3000);
      return zeigeToast("Noch kein Satz abgehakt – nochmal tippen zum Verwerfen");
    }
    beendenBestaetigen = false;
    zustand.training = null;
    speichern(SCHLUESSEL.aktiv, null);
    return trainingSchliessen();
  }

  const vorher = rangInfo();
  const training = {
    id: t.id,
    datum: new Date().toISOString(),
    einheitId: t.einheitId,
    name: t.name,
    dauerMin: Math.max(1, Math.round((Date.now() - new Date(t.start)) / 60000)),
    saetze: erledigt
  };
  const auswertung = trainingAuswerten(training);
  const xp = xpBerechnen(training, auswertung.rekorde);
  training.xp = xp.xp;
  training.prs = auswertung.rekorde.map((r) => r.id);

  speichern(SCHLUESSEL.trainings, [...trainings(), training]);
  const p = plan();
  p.naechste = (p.naechste + 1) % p.einheiten.length;
  speichern(SCHLUESSEL.plan, p);
  zustand.training = null;
  zustand.pause = null;
  speichern(SCHLUESSEL.aktiv, null);

  const nachher = rangInfo();
  zustand.ergebnis = { training, xp, auswertung, vorher, nachher, aufstieg: nachher.index > vorher.index };
  zustand.chat = [];
  trainingRendern();
  $("#training").scrollTop = 0;
}

function ergebnisHtml() {
  const { training, xp, auswertung, vorher, nachher, aufstieg } = zustand.ergebnis;
  const symbol = { hoch: SYMBOL.pfeilHoch, runter: SYMBOL.pfeilRunter, gleich: SYMBOL.gleich };
  return `
    <div class="quiz-leiste"><span class="quiz-zaehler">${esc(training.name)}</span><button class="text-knopf stark" data-aktion="ergebnis-fertig">Fertig</button></div>
    <div class="training-inhalt ergebnis wechsel">
      ${aufstieg ? `
        <div class="aufstieg">
          <span class="aufstieg-emblem">${rangAbzeichen(nachher.rang, 120)}</span>
          <p class="timer-phase">Aufgestiegen!</p>
          <h2 class="training-titel gross">${esc(nachher.rang.name)}</h2>
        </div>` : `
        <p class="timer-phase">Training abgeschlossen</p>
        <h2 class="training-titel gross">Stark gemacht!</h2>`}

      <div class="xp-gross"><span id="xp-zaehler">0</span><small>XP</small></div>

      <div class="noten-karte rang-mini">
        <span class="rang-mini-kopf"><span class="noten-titel">${esc(nachher.rang.name)}${nachher.naechster ? ` → ${esc(nachher.naechster.name)}` : ""}</span><span class="rang-mini-xp">${zahl(nachher.xp, 0)} XP</span></span>
        <span class="balken-spur gross"><span class="fortschritt-balken" id="ergebnis-balken" style="--wert:${aufstieg ? 0 : vorher.fortschritt.toFixed(3)}" data-ziel="${nachher.fortschritt.toFixed(3)}"></span></span>
        ${nachher.fehlt.length ? `<span class="hinweis-klein">Es fehlen: ${esc(nachher.fehlt.map((f) => f.text).join(" · "))}</span>` : ""}
      </div>

      <h3 class="abschnitt">So setzen sich deine XP zusammen</h3>
      <div class="liste">${xp.teile.map((t) => `<div class="infozeile"><span>${esc(t.name)}</span><span>${t.xp > 0 ? "+" : ""}${t.xp}</span></div>`).join("")}</div>

      ${auswertung.rekorde.length ? `
        <h3 class="abschnitt">Neue Rekorde ${SYMBOL.pokal}</h3>
        <div class="liste">${auswertung.rekorde.map((r) => `<div class="infozeile"><span>${esc(UEBUNGEN[r.id].name)}</span><span>${UEBUNGEN[r.id].einheit === "kg" ? `≈ ${zahl(r.neu)} kg Max.` : zahl(r.neu, 0)}</span></div>`).join("")}</div>` : ""}

      ${auswertung.meldungen.length ? `
        <h3 class="abschnitt">Dein Plan passt sich an</h3>
        <div class="liste">${auswertung.meldungen.map((m) => `<div class="tipp-zeile ${m.art}"><span class="tipp-nr">${symbol[m.art]}</span><span>${esc(m.text)}</span></div>`).join("")}</div>` : ""}

      <button class="knopf breit drueckbar" data-aktion="ergebnis-fertig">Fertig</button>
    </div>`;
}

function ergebnisAnimieren() {
  const ziel = zustand.ergebnis.xp.xp;
  const zaehler = $("#xp-zaehler");
  const start = performance.now();
  const dauer = 1200;
  const schritt = (jetzt) => {
    const t = Math.min(1, (jetzt - start) / dauer);
    const weich = 1 - Math.pow(1 - t, 3);
    zaehler.textContent = `+${Math.round(ziel * weich)}`;
    if (t < 1) requestAnimationFrame(schritt);
  };
  requestAnimationFrame(schritt);
  const balken = $("#ergebnis-balken");
  setTimeout(() => balken.style.setProperty("--wert", balken.dataset.ziel), 350);
  if (zustand.ergebnis.aufstieg) {
    klingeln();
    if (navigator.vibrate) navigator.vibrate([80, 60, 80, 60, 200]);
  }
}

// ---------- Datensicherung ----------

function backupSichern() {
  const daten = {};
  try {
    Object.keys(localStorage).filter((k) => k.startsWith("gym-") && k !== SCHLUESSEL.aktiv && k !== SCHLUESSEL.backupZeit).forEach((k) => (daten[k] = JSON.parse(localStorage.getItem(k))));
  } catch (fehler) {
    return zeigeToast("Speicher nicht verfügbar");
  }
  const datei = new Blob([JSON.stringify({ app: "gym", version: 1, erstellt: new Date().toISOString(), daten }, null, 2)], { type: "application/json" });
  const adresse = URL.createObjectURL(datei);
  const link = document.createElement("a");
  link.href = adresse;
  link.download = `gym-backup-${datumKey(new Date())}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(adresse), 2000);
  speichern(SCHLUESSEL.backupZeit, Date.now());
  zeigeToast("Backup gespeichert – im Ordner Downloads");
}

async function backupEinspielen(datei) {
  if (!datei) return;
  let backup;
  try {
    backup = JSON.parse(await datei.text());
  } catch (fehler) {
    return zeigeToast("Diese Datei lässt sich nicht lesen.");
  }
  if (!backup || backup.app !== "gym" || !backup.daten) return zeigeToast("Das ist kein Gym-Backup.");
  sheetOeffnen(`
    <p class="backup-herkunft">Backup vom <strong>${esc(new Date(backup.erstellt).toLocaleString("de-DE"))}</strong></p>
    <div class="liste">
      <div class="infozeile"><span>Trainings</span><span>${(backup.daten["gym-trainings"] || []).length}</span></div>
      <div class="infozeile"><span>Profil</span><span>${esc((backup.daten["gym-profil"] || {}).name || "–")}</span></div>
    </div>
    <p class="backup-warnung">Deine aktuellen Gym-Daten werden dabei ersetzt.</p>
    <button type="button" class="knopf breit drueckbar" data-aktion="backup-uebernehmen">Wiederherstellen</button>`, "backup", "Daten wiederherstellen");
  zustand.wartendesBackup = backup;
}

function backupUebernehmen() {
  const backup = zustand.wartendesBackup;
  if (!backup) return;
  try {
    Object.keys(localStorage).filter((k) => k.startsWith("gym-")).forEach((k) => localStorage.removeItem(k));
    Object.entries(backup.daten).forEach(([k, v]) => { if (k.startsWith("gym-")) localStorage.setItem(k, JSON.stringify(v)); });
    sessionStorage.setItem("gym-meldung", "Daten wiederhergestellt");
  } catch (fehler) {
    return zeigeToast("Wiederherstellen hat nicht geklappt.");
  }
  location.reload();
}

// ---------- Anzeigen ----------

const ANSICHT_HTML = { heute: heuteHtml, plan: planHtml, coach: coachHtml, fortschritt: fortschrittHtml, rang: rangHtml };

function render(name, animiert) {
  const bereich = document.getElementById("ansicht-" + name);
  bereich.innerHTML = ANSICHT_HTML[name]();
  if (animiert) animieren(bereich);
  balkenSetzen(bereich);
}

function zeigeAnsicht(name) {
  if (!ANSICHTEN.includes(name)) return;
  zustand.ansicht = name;
  document.querySelectorAll(".ansicht").forEach((a) => a.classList.toggle("aktiv", a.dataset.ansicht === name));
  document.querySelectorAll(".tab").forEach((tab) => {
    const aktiv = tab.dataset.ziel === name;
    tab.classList.toggle("aktiv", aktiv);
    if (aktiv) tab.setAttribute("aria-current", "page");
    else tab.removeAttribute("aria-current");
  });
  $(".tabbar").style.setProperty("--pos", ANSICHTEN.indexOf(name));
  render(name, true);
  window.scrollTo({ top: 0 });
}

// ---------- Klicks und Eingaben ----------

const AKTIONEN = {
  "einstellungen": () => seiteOeffnen("einstellungen", einstellungenHtml()),
  "zurueck": () => seiteSchliessen(),
  "sheet-zu": () => sheetSchliessen(),
  "profil-bearbeiten": () => startOeffnen(true),
  "start-zu": () => startSchliessen(),
  "plan-erstellen": () => planErstellenAusStart(),
  "neuer-block": () => {
    neuerBlock();
    render("plan", true);
    zeigeToast("Neuer Block gestartet – frische Übungen!");
  },
  "tauschen": (k) => tauschenOeffnen(Number(k.dataset.einheit), Number(k.dataset.index)),
  "training-start": () => trainingStarten(),
  "training-zu": () => trainingSchliessen(),
  "training-beenden": (k) => trainingBeenden(k),
  "uebung-weiter": () => {
    zustand.training.index = Math.min(zustand.training.index + 1, zustand.training.uebungen.length - 1);
    trainingSpeichern();
    trainingRendern();
    $("#training").scrollTop = 0;
  },
  "uebung-zurueck": () => {
    zustand.training.index = Math.max(zustand.training.index - 1, 0);
    trainingSpeichern();
    trainingRendern();
    $("#training").scrollTop = 0;
  },
  "uebung-info": (k) => {
    trainingSchliessen();
    seiteOeffnen("uebung", uebungSeiteHtml(k.dataset.uebung, null, null));
  },
  "satz-fertig": (k) => satzFertig(Number(k.dataset.s)),
  "satz-dazu": () => {
    const t = zustand.training;
    const { id } = t.uebungen[t.index];
    const letzter = t.saetze[id][t.saetze[id].length - 1];
    t.saetze[id].push({ gewicht: letzter ? letzter.gewicht : 0, wdh: letzter ? letzter.wdh : 10, gefuehl: null, fertig: false });
    trainingSpeichern();
    trainingRendern();
  },
  "pause-plus": () => {
    if (!zustand.pause) return;
    zustand.pause.ende += 15000;
    zustand.pause.dauer += 15;
    pauseTick();
  },
  "pause-ende": () => {
    zustand.pause = null;
    pauseTick();
  },
  "ergebnis-fertig": () => {
    zustand.ergebnis = null;
    trainingSchliessen();
    zeigeAnsicht("heute");
  },
  "gewichte": (k) => {
    const faktor = Number(k.dataset.faktor);
    gewichteSkalieren(faktor);
    zeigeToast(`Alle Gewichte ${faktor > 1 ? "+" : "−"}${Math.round(Math.abs(faktor - 1) * 100)} %`);
  },
  "backup-sichern": () => backupSichern(),
  "backup-waehlen": () => {
    const feld = $("#backup-datei");
    feld.value = "";
    feld.click();
  },
  "backup-uebernehmen": () => backupUebernehmen()
};

document.addEventListener("click", (e) => {
  const aktion = e.target.closest("[data-aktion]");
  if (aktion && AKTIONEN[aktion.dataset.aktion]) return AKTIONEN[aktion.dataset.aktion](aktion);

  const tab = e.target.closest(".tab, [data-gehe]");
  if (tab) return zeigeAnsicht(tab.dataset.ziel || tab.dataset.gehe);

  const uebung = e.target.closest("[data-uebung]");
  if (uebung) return seiteOeffnen("uebung", uebungSeiteHtml(uebung.dataset.uebung, Number(uebung.dataset.einheit), Number(uebung.dataset.index)));

  const tausch = e.target.closest("[data-tausch]");
  if (tausch) {
    uebungTauschen(Number(tausch.dataset.einheit), Number(tausch.dataset.index), tausch.dataset.tausch);
    sheetSchliessen();
    seiteSchliessen();
    return zeigeToast(`Getauscht: ${UEBUNGEN[tausch.dataset.tausch].name}`);
  }

  const frage = e.target.closest("[data-frage]");
  if (frage) return coachFragen(frage.dataset.frage);

  const fortschritt = e.target.closest("[data-fortschritt]");
  if (fortschritt) {
    zustand.fortschrittUebung = fortschritt.dataset.fortschritt;
    document.querySelectorAll("[data-fortschritt]").forEach((c) => c.classList.toggle("aktiv", c === fortschritt));
    const id = zustand.fortschrittUebung;
    $("#verlauf-karte").innerHTML = linienDiagrammHtml(uebungsstand()[id].verlauf, UEBUNGEN[id].einheit);
    return;
  }

  const einstellung = e.target.closest("[data-einstellung]");
  if (einstellung) {
    const wert = segmentWaehlen(einstellung);
    einstellungAendern(einstellung.dataset.einstellung, einstellung.dataset.einstellung === "pause" ? (wert ? Number(wert) : null) : wert);
    if (einstellung.dataset.einstellung === "theme") farbschemaAnwenden(true);
    return;
  }

  const stufe = e.target.closest("[data-schwierigkeit]");
  if (stufe) {
    const verhaeltnis = schwierigkeitAendern(segmentWaehlen(stufe));
    if (verhaeltnis !== 1) zeigeToast(`Gewichte umgerechnet: ${verhaeltnis > 1 ? "+" : "−"}${Math.round(Math.abs(verhaeltnis - 1) * 100)} %`);
    return;
  }

  const startWahl = e.target.closest("[data-start]");
  if (startWahl) {
    zustand.start[startWahl.dataset.start] = segmentWaehlen(startWahl);
    return;
  }

  const schritt = e.target.closest("[data-schritt]");
  if (schritt) return stepper(schritt);

  const gefuehl = e.target.closest("[data-gefuehl]");
  if (gefuehl) {
    const t = zustand.training;
    t.saetze[t.uebungen[t.index].id][Number(gefuehl.dataset.s)].gefuehl = gefuehl.dataset.gefuehl;
    trainingSpeichern();
    trainingRendern();
  }
});

document.addEventListener("change", (e) => {
  if (e.target.matches(".stepper-wert")) satzWertAendern(Number(e.target.dataset.u), Number(e.target.dataset.s), e.target.dataset.feld, e.target.value);
  if (e.target.id === "backup-datei") backupEinspielen(e.target.files[0]);
});

document.addEventListener("focusin", (e) => {
  if (e.target.matches(".stepper-wert")) e.target.select();
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (zustand.sheet) sheetSchliessen();
  else if (zustand.seite) seiteSchliessen();
});

// ---------- Start ----------

farbschemaAnwenden(false);
hellAbfrage.addEventListener("change", () => farbschemaAnwenden(true));
zustand.training = laden(SCHLUESSEL.aktiv, null);
zeigeAnsicht("heute");
if (!profil() || !plan()) startOeffnen(false);

try {
  const meldung = sessionStorage.getItem("gym-meldung");
  if (meldung) {
    sessionStorage.removeItem("gym-meldung");
    setTimeout(() => zeigeToast(meldung), 400);
  }
} catch (fehler) {
  // ohne Meldung
}

setInterval(pauseTick, 250);
