const BEST_KEY = "ottisk-best-v2";
const META_KEY = "ottisk-meta-v1";
const HOLD_SECONDS = 0.62;
const OPENING_SEC = 10;
const HUNGER_DRAIN_PER_SEC = 100 / 12;
const ECHO_FADE_SEC = 2.35;
const FREE_CONTINUES_PER_RUN = 1;
const MARKS_CONTINUE_COST = 12;
const MAX_CONTINUES_PER_RUN = 2;
const MARKS_PACK_AMOUNT = 60;
const MARKS_PACK_PRODUCT_ID = "ottisk_marks_60";
const WEEKLY_TARGET = 50;
const WEEKLY_REWARD = 20;
const STARTER_MARKS = 15;
const SHARE_URL = "https://gqfc925dtm-max.github.io/Fagsikasdr/";
const PRIVACY_URL = `${SHARE_URL}privacy.html`;
const SUPPORT_URL = `${SHARE_URL}support.html`;
const THEME_COUNT = 6;
const ONBOARD_STEPS = [
  "Удерживай палец — существо живёт только в касании.",
  "Замри на секунду — можно провалиться в чернила.",
  "Отпущенный след иногда оживает и идёт за тобой.",
];
const SECRET_WORD = "ЯЕЩЁЗДЕСЬ";
const SCORE_MILESTONES = [
  { at: 10, marks: 2, text: "первый ритм" },
  { at: 25, marks: 3, text: "след держится" },
  { at: 50, marks: 5, text: "половина сотни" },
  { at: 100, marks: 8, text: "новая тема" },
  { at: 150, marks: 10, text: "глубокий след" },
  { at: 200, marks: 12, text: "легенда света" },
  { at: 300, marks: 15, text: "без конца" },
];
const DEATH = {
  HUNTER: "охотник поймал оттиск",
  ECHO: "тень сожрала след",
  HUNGER: "свет иссяк — слишком долго без пищи",
};

const PHOTO_VER = "5";
const PHOTOS = {
  fish: {
    src: new URL(`../assets/fish-evil.png?v=${PHOTO_VER}`, import.meta.url).href,
    img: null,
    ready: false,
  },
};

function loadImage(entry) {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      entry.img = img;
      entry.ready = true;
      resolve(true);
    };
    img.onerror = () => resolve(false);
    img.src = entry.src;
  });
}

function loadPhotos() {
  return loadImage(PHOTOS.fish);
}

function drawImageCover(img, x, y, w, h) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const scale = Math.max(w / iw, h / ih);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (iw - sw) * 0.5;
  const sy = (ih - sh) * 0.5;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

const BLAST_STYLES = [
  "spray",
  "ring",
  "nova",
  "shards",
  "spiral",
  "cross",
  "rain",
  "bloom",
  "scatter",
  "pulse",
  "streaks",
  "firework",
];
let lastBlastStyle = -1;

const MUTATIONS = [
  { id: "spark", at: 0, name: "искра" },
  { id: "cool", at: 5, name: "хладь" },
  { id: "magnet", at: 12, name: "магнит" },
  { id: "veins", at: 20, name: "жилы" },
  { id: "fang", at: 30, name: "клык" },
  { id: "bloom", at: 42, name: "цвет" },
];

const SKINS = [
  { id: "ink", name: "чернь", at: 0, color: "#fff1e4" },
  { id: "mint", name: "мята", at: 25, color: "#7dffc8" },
  { id: "ember", name: "жар", at: 60, color: "#ffb068" },
  { id: "frost", name: "иней", at: 100, color: "#b8dcff" },
  { id: "void", name: "пусто", at: 160, color: "#e0b8ff" },
  { id: "pulse", name: "пульс", at: 220, color: "#ff8ab4" },
  { id: "solar", name: "солнце", at: 9999, cost: 40, color: "#ffe08a", premium: true },
  { id: "noir", name: "нуар", at: 9999, cost: 70, color: "#8ab4ff", premium: true },
];

const app = document.getElementById("app");
const stage = document.getElementById("stage");
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const statusEl = document.getElementById("status");
const scoreEl = document.getElementById("score");
const comboEl = document.getElementById("combo");
const toastEl = document.getElementById("toast");
const coachEl = document.getElementById("coach");
const heatEl = document.getElementById("heat");
const heatFillEl = document.getElementById("heat-fill");
const heatPctEl = document.getElementById("heat-pct");
const mutTrackFillEl = document.getElementById("mut-track-fill");
const diveMeterEl = document.getElementById("dive-meter");
const diveFillEl = document.getElementById("dive-fill");
const holdFillEl = document.getElementById("hold-fill");
const holdFillOverEl = document.getElementById("hold-fill-over");
const screenStartEl = document.getElementById("screen-start");
const screenOverEl = document.getElementById("screen-over");
const bestStartEl = document.getElementById("best-start");
const bestOverEl = document.getElementById("best-over");
const finalScoreEl = document.getElementById("final-score");
const deathReasonEl = document.getElementById("death-reason");
const mutSummaryEl = document.getElementById("mut-summary");
const skinResultEl = document.getElementById("skin-result");
const skinNameEl = document.getElementById("skin-name");
const skinUnlocksEl = document.getElementById("skin-unlocks");
const btnStart = document.getElementById("btn-start");
const btnRetry = document.getElementById("btn-retry");
const dailyCardEl = document.getElementById("daily-card");
const streakStartEl = document.getElementById("streak-start");
const marksStartEl = document.getElementById("marks-start");
const screenContinueEl = document.getElementById("screen-continue");
const continueReasonEl = document.getElementById("continue-reason");
const continueHintEl = document.getElementById("continue-hint");
const btnContinue = document.getElementById("btn-continue");
const continueLabelEl = document.getElementById("continue-label");
const continueSubEl = document.getElementById("continue-sub");
const btnSkipContinue = document.getElementById("btn-skip-continue");
const btnShare = document.getElementById("btn-share");
const streakOverEl = document.getElementById("streak-over");
const dailyResultEl = document.getElementById("daily-result");
const marksResultEl = document.getElementById("marks-result");
const weeklyCardEl = document.getElementById("weekly-card");
const btnSound = document.getElementById("btn-sound");
const btnHaptics = document.getElementById("btn-haptics");
const btnMarksPack = document.getElementById("btn-marks-pack");
const btnRate = document.getElementById("btn-rate");
const screenOnboardEl = document.getElementById("screen-onboard");
const onboardTextEl = document.getElementById("onboard-text");
const btnOnboard = document.getElementById("btn-onboard");
const onboardLabelEl = document.getElementById("onboard-label");
const onboardSubEl = document.getElementById("onboard-sub");
const shareCanvasEl = document.getElementById("share-canvas");

const RUN_EVENTS = [
  { id: "rain", title: "ливень света", dur: 4.2 },
  { id: "raid", title: "облава", dur: 3.2 },
  { id: "calm", title: "тишина", dur: 5.0 },
  { id: "comet", title: "комета", dur: 0.8 },
];

const DAILY_DEFS = [
  {
    id: "score30",
    title: "30 света",
    label: (s) => `${Math.min(s.score, 30)}/30`,
    check: (s) => s.score >= 30,
  },
  {
    id: "rare2",
    title: "2 редких",
    label: (s) => `редкие ${Math.min(s.stats.rareEats, 2)}/2`,
    check: (s) => s.stats.rareEats >= 2,
  },
  {
    id: "survive30",
    title: "30 секунд",
    label: (s) => `${Math.min(Math.floor(s.elapsed), 30)}/30с`,
    check: (s) => s.elapsed >= 30,
  },
  {
    id: "fang",
    title: "клык за забег",
    label: () => (hasMut("fang") ? "клык" : `${Math.min(state.score, 30)}/30`),
    check: () => hasMut("fang"),
  },
  {
    id: "combo5",
    title: "цепь ×5",
    label: (s) => `цепь ${Math.min(s.stats.maxCombo, 5)}/5`,
    check: (s) => s.stats.maxCombo >= 5,
  },
  {
    id: "dodge3",
    title: "3 мимо",
    label: (s) => `мимо ${Math.min(s.stats.nearMisses, 3)}/3`,
    check: (s) => s.stats.nearMisses >= 3,
  },
];

const state = {
  running: false,
  demo: true,
  width: 0,
  height: 0,
  dpr: 1,
  time: 0,
  elapsed: 0,
  lastTs: 0,
  score: 0,
  combo: 0,
  comboClock: 0,
  hunger: 100,
  best: 0,
  theme: 0,
  mutation: MUTATIONS[0],
  unlockedMuts: ["spark"],
  touchActive: false,
  pointerId: null,
  hasTouchedCanvas: false,
  life: null,
  echo: null,
  guideSpark: null,
  lastVeinX: 0,
  lastVeinY: 0,
  sparks: [],
  hunters: [],
  veins: [],
  particles: [],
  floaters: [],
  spawnAcc: 0,
  hunterAcc: 0,
  slowHunterSeen: false,
  bloomPulse: 0,
  flash: 0,
  shake: 0,
  deathReason: "",
  coachCount: 0,
  hold: null,
  meta: null,
  runUnlockedSkins: [],
  pendingDeathReason: "",
  continuesUsed: 0,
  safeUntil: 0,
  continueBusy: false,
  paused: false,
  runMarks: 0,
  milestonesHit: [],
  hungerWarnClock: 0,
  timeScale: 1,
  slowmoUntil: 0,
  onboardStep: 0,
  event: null,
  eventAcc: 0,
  eventNext: 11,
  eventRainAcc: 0,
  pulseCd: 0,
  holdLifeTime: 0,
  fever: false,
  stillAcc: 0,
  inkDive: 0,
  inkDiveCd: 0,
  glyphs: [],
  glyphIndex: 0,
  glyphSpawnAcc: 0,
  wordDone: false,
  symbiote: null,
  openingBurst: false,
  firstEatDone: false,
  tipFlags: {
    move: false,
    hunter: false,
    hunger: false,
    echo: false,
    dive: false,
    shadow: false,
    word: false,
  },
  stats: {
    sparkEats: 0,
    rareEats: 0,
    hunterEats: 0,
    maxCombo: 0,
    nearMisses: 0,
    shadowsSpawned: 0,
    glyphsTaken: 0,
  },
  audio: null,
  humNode: null,
  demoClock: 0,
  demoDownClock: 0,
};

function inOpening() {
  return state.running && state.elapsed < OPENING_SEC;
}

function pulseUnlock(color = cssVar("--life", "#7affd4"), strength = 0.14) {
  state.flash = Math.max(state.flash, strength);
  burst(state.width * 0.5, state.height * 0.38, color, 20, 4.6);
  tone(720, 0.08, "triangle", 0.03);
  tone(940, 0.11, "sine", 0.024, 0.07);
  buzz([8, 18, 8]);
}

function spawnOpeningRing(x, y) {
  const count = 2;
  for (let i = 0; i < count; i += 1) {
    const a = (i / count) * Math.PI * 2 + rand(-0.12, 0.12);
    const d = rand(130, 190);
    spawnSpark({
      near: { x: x + Math.cos(a) * d, y: y + Math.sin(a) * d },
      type: i === 0 ? "rare" : "normal",
      tutorial: i === 0,
      opening: true,
    });
  }
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function dist(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function cssVar(name, fallback) {
  const value = getComputedStyle(app).getPropertyValue(name).trim();
  return value || fallback;
}

function hexToRgb(hex) {
  const value = hex.trim();
  if (value.startsWith("rgb")) {
    const nums = value.match(/[\d.]+/g) || ["255", "255", "255"];
    return nums.slice(0, 3).map(Number);
  }
  const clean = value.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function mixColor(a, b, t) {
  const aa = hexToRgb(a);
  const bb = hexToRgb(b);
  const m = aa.map((v, i) => Math.round(v + (bb[i] - v) * clamp(t, 0, 1)));
  return `rgb(${m[0]}, ${m[1]}, ${m[2]})`;
}

function soundEnabled() {
  return state.meta?.sound !== false;
}

function hapticsEnabled() {
  return state.meta?.haptics !== false;
}

function buzz(pattern = 8) {
  if (!hapticsEnabled()) return;
  if (navigator.vibrate) navigator.vibrate(pattern);
  const native = window.OttiskNative;
  if (native?.isNative) {
    const style = Array.isArray(pattern) || pattern >= 16 ? "medium" : "light";
    native.haptic?.(style);
  }
}

function ensureAudio() {
  if (!soundEnabled()) return null;
  if (state.audio) return state.audio;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  state.audio = new AudioCtx();
  return state.audio;
}

function tone(freq, dur = 0.08, type = "sine", gain = 0.04, delay = 0) {
  if (!soundEnabled()) return;
  const ac = ensureAudio();
  if (!ac) return;
  if (ac.state === "suspended") ac.resume().catch(() => {});
  const at = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  amp.gain.setValueAtTime(0.0001, at);
  amp.gain.linearRampToValueAtTime(gain, at + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(amp);
  amp.connect(ac.destination);
  osc.start(at);
  osc.stop(at + dur + 0.02);
}

function hum(on) {
  if (!on) {
    if (!state.humNode || !state.audio) {
      state.humNode = null;
      return;
    }
    const ac = state.audio;
    const { g, o1, o2 } = state.humNode;
    const t = ac.currentTime;
    g.gain.cancelScheduledValues(t);
    g.gain.setTargetAtTime(0.0001, t, 0.05);
    o1.stop(t + 0.16);
    o2.stop(t + 0.16);
    state.humNode = null;
    return;
  }
  if (!soundEnabled()) return;
  const ac = ensureAudio();
  if (!ac) return;
  if (ac.state === "suspended") ac.resume().catch(() => {});
  if (state.humNode) return;
  const o1 = ac.createOscillator();
  const o2 = ac.createOscillator();
  const g = ac.createGain();
  o1.type = "sine";
  o2.type = "triangle";
  o1.frequency.value = 62;
  o2.frequency.value = 93;
  g.gain.value = 0.0001;
  o1.connect(g);
  o2.connect(g);
  g.connect(ac.destination);
  o1.start();
  o2.start();
  state.humNode = { o1, o2, g };
}

function updateHum() {
  if (!state.humNode || !state.audio || !state.life) return;
  const ac = state.audio;
  const urgency = 1 - state.hunger / 100;
  let hunterBoost = 0;
  for (const h of state.hunters) {
    const d = dist(h.x, h.y, state.life.x, state.life.y);
    hunterBoost = Math.max(hunterBoost, clamp(1 - d / 220, 0, 1));
  }
  const base = 62 + urgency * 68 + hunterBoost * 20;
  state.humNode.o1.frequency.setTargetAtTime(base, ac.currentTime, 0.08);
  state.humNode.o2.frequency.setTargetAtTime(base * 1.48, ac.currentTime, 0.08);
  state.humNode.g.gain.setTargetAtTime(0.006 + urgency * 0.018 + hunterBoost * 0.01, ac.currentTime, 0.09);
}

function goalChime() {
  tone(620, 0.08, "triangle", 0.035, 0);
  tone(830, 0.08, "triangle", 0.03, 0.07);
  tone(1080, 0.12, "sine", 0.028, 0.14);
}

function mutationDing() {
  tone(760, 0.08, "triangle", 0.036, 0);
  tone(1040, 0.12, "sine", 0.03, 0.09);
}

function playSparkTone(type) {
  if (type === "super") {
    tone(520, 0.08, "triangle", 0.036);
    tone(780, 0.1, "sine", 0.03, 0.05);
    tone(1180, 0.14, "triangle", 0.028, 0.1);
  } else if (type === "rare") {
    tone(980, 0.11, "triangle", 0.04);
  } else if (type === "cool") {
    tone(420, 0.1, "sine", 0.026);
  } else if (type === "bait") {
    tone(260, 0.08, "square", 0.028);
    tone(190, 0.1, "triangle", 0.022, 0.07);
  } else if (type === "comet") {
    tone(740, 0.08, "triangle", 0.034);
    tone(1100, 0.12, "sine", 0.03, 0.07);
  } else if (type === "deep") {
    tone(260, 0.12, "sine", 0.03);
    tone(390, 0.14, "triangle", 0.024, 0.08);
  } else if (type === "seed") {
    tone(860, 0.09, "sine", 0.028);
  } else {
    tone(620 + Math.min(12, state.combo) * 18, 0.055, "sine", 0.028);
  }
}

function showCombo(text, fever = false) {
  comboEl.textContent = text;
  comboEl.className = `combo show${fever ? " fever" : ""}`;
  clearTimeout(showCombo.timer);
  showCombo.timer = setTimeout(() => {
    comboEl.classList.remove("show");
    if (!state.fever) comboEl.classList.remove("fever");
  }, 750);
}

function setEventChip(text) {
  if (!text || state.running) return;
}

function activeEventId() {
  return state.event?.id || "";
}

function startRunEvent(def) {
  state.event = { id: def.id, title: def.title, t: def.dur };
  pulseUnlock(cssVar("--gold", "#ffe898"), 0.12);
  if (def.id === "raid") {
    spawnHunter(false);
    spawnHunter(false);
  } else if (def.id === "comet") {
    spawnComet();
  } else if (def.id === "rain") {
    state.eventRainAcc = 0;
    for (let i = 0; i < 2; i += 1) spawnSpark({ edge: true });
  }
}

function updateRunEvents(dt) {
  if (state.event) {
    state.event.t -= dt;
    if (state.event.id === "rain") {
      state.eventRainAcc += dt;
      while (state.eventRainAcc >= 0.38) {
        state.eventRainAcc -= 0.38;
        spawnSpark({ edge: true, type: Math.random() < 0.18 ? "rare" : null });
      }
    }
    if (state.event.t <= 0) {
      state.event = null;
      setEventChip("");
      state.eventNext = rand(10, 16);
      state.eventAcc = 0;
    }
    return;
  }
  if (state.elapsed < OPENING_SEC + 2) return;
  state.eventAcc += dt;
  if (state.eventAcc < state.eventNext) return;
  const pick = RUN_EVENTS[Math.floor(Math.random() * RUN_EVENTS.length)];
  startRunEvent(pick);
}

function inInkDive() {
  return state.inkDive > 0;
}

function setDiveMeter(progress) {
  if (!diveMeterEl || !diveFillEl) return;
  const show = progress > 0.05 && progress < 1 && !inInkDive();
  diveMeterEl.classList.toggle("show", show);
  diveFillEl.style.width = `${Math.round(clamp(progress, 0, 1) * 100)}%`;
}

function enterInkDive() {
  if (inInkDive() || state.inkDiveCd > 0 || !state.life) return;
  state.inkDive = 5.2;
  state.inkDiveCd = 16;
  state.stillAcc = 0;
  setDiveMeter(0);
  app.classList.add("ink-dive");
  pulseUnlock("#8ae0ff", 0.16);
  tipOnce("dive", "ЗДЕСЬ ТИХО", 1600);
  tone(220, 0.16, "sine", 0.03);
  tone(140, 0.22, "triangle", 0.024, 0.08);
  buzz([12, 20, 12]);
  state.flash = Math.max(state.flash, 0.16);
  for (let i = 0; i < 5; i += 1) spawnSpark({ edge: true, type: "deep" });
}

function exitInkDive() {
  state.inkDive = 0;
  app.classList.remove("ink-dive");
  if (!state.event) setEventChip("");
  pulseUnlock(cssVar("--life", "#7affd4"), 0.1);
  tone(480, 0.08, "triangle", 0.026);
}

function spawnShadowHunter(x, y) {
  state.stats.shadowsSpawned += 1;
  state.hunters.push({
    x,
    y,
    vx: 0,
    vy: 0,
    r: 15,
    anger: 0.78,
    slow: false,
    warn: 1,
    phase: Math.random() * Math.PI * 2,
    nearMissed: false,
    shadow: true,
    wobble: Math.random() * Math.PI * 2,
  });
  tipOnce("shadow", "СЛЕД ОЖИЛ", 1700);
  tone(160, 0.14, "sawtooth", 0.028);
  buzz([16, 24, 16]);
}

function maybeAwakenEcho() {
  if (!state.echo) return;
  if (state.elapsed < OPENING_SEC + 6) return;
  if (state.score < 10) return;
  if (state.stats.shadowsSpawned >= 3) return;
  const chance = 0.42 + Math.min(0.25, state.score * 0.002);
  if (Math.random() > chance) return;
  spawnShadowHunter(state.echo.x, state.echo.y);
}

function spawnGlyph(x, y) {
  if (state.wordDone || state.glyphIndex >= SECRET_WORD.length) return;
  const ch = SECRET_WORD[state.glyphIndex];
  state.glyphs.push({
    x: clamp(x + rand(-26, 26), 24, state.width - 24),
    y: clamp(y + rand(-26, 26), 40, state.height - 24),
    ch,
    index: state.glyphIndex,
    life: 1,
    pulse: Math.random() * Math.PI * 2,
  });
}

function updateGlyphs(dt) {
  for (let i = state.glyphs.length - 1; i >= 0; i -= 1) {
    const g = state.glyphs[i];
    g.pulse += dt * 4;
    g.life -= dt * 0.12;
    if (g.life <= 0) {
      state.glyphs.splice(i, 1);
      continue;
    }
    if (!state.life) continue;
    if (dist(g.x, g.y, state.life.x, state.life.y) > state.life.r * 0.85) continue;
    if (g.index !== state.glyphIndex) {
      burst(g.x, g.y, cssVar("--danger", "#e2556d"), 6, 2.5);
      state.glyphs.splice(i, 1);
      continue;
    }
    state.glyphs.splice(i, 1);
    state.glyphIndex += 1;
    state.stats.glyphsTaken += 1;
    state.hunger = clamp(state.hunger + 12, 0, 100);
    updateHungerUi();
    floatText(g.x, g.y - 10, g.ch, cssVar("--foam", "#f3eee8"), 20);
    tone(520 + state.glyphIndex * 40, 0.07, "triangle", 0.03);
    tipOnce("word", "БУКВЫ ЖИВЫЕ", 1500);
    if (state.glyphIndex >= SECRET_WORD.length) {
      state.wordDone = true;
      pulseUnlock(cssVar("--life", "#7affd4"), 0.18);
      goalChime();
      awardMarks(12, {
        x: state.width * 0.5,
        y: state.height * 0.2,
        color: cssVar("--life", "#6fd9b0"),
        size: 17,
      });
      addScore(15, state.width * 0.5, state.height * 0.28, {
        combo: false,
        color: cssVar("--life", "#6fd9b0"),
      });
      state.safeUntil = performance.now() + 1800;
      burst(state.life.x, state.life.y, cssVar("--life", "#6fd9b0"), 28, 5.5);
    } else {
      burst(g.x, g.y, cssVar("--gold", "#ffe898"), 8, 3.2);
    }
  }
}

function attachSymbiote(x, y) {
  state.symbiote = { ang: Math.random() * Math.PI * 2, life: 1 };
  burst(x, y, "#9cf0d0", 16, 4.2);
  tone(900, 0.08, "sine", 0.03);
}

function consumeSymbioteShield(hunter) {
  if (!state.symbiote || !state.life) return false;
  state.symbiote = null;
  buzz([10, 18, 10]);
  tone(240, 0.1, "square", 0.03);
  burst(state.life.x, state.life.y, "#9cf0d0", 20, 5);
  const ang = Math.atan2(hunter.y - state.life.y, hunter.x - state.life.x);
  hunter.vx += Math.cos(ang) * 8;
  hunter.vy += Math.sin(ang) * 8;
  hunter.warn = 1;
  state.safeUntil = performance.now() + 700;
  return true;
}

function updateWeirdSystems(dt) {
  state.inkDiveCd = Math.max(0, state.inkDiveCd - dt);
  if (inInkDive()) {
    state.inkDive -= dt;
    if (state.inkDive <= 0) exitInkDive();
    else if (Math.random() < dt * 1.4) spawnSpark({ edge: true, type: "deep" });
  }

  if (state.life && !inInkDive() && state.inkDiveCd <= 0 && state.elapsed > OPENING_SEC + 4) {
    const still = (state.life.speed || 0) < 5.5;
    state.stillAcc = still ? state.stillAcc + dt : Math.max(0, state.stillAcc - dt * 1.8);
    setDiveMeter(state.stillAcc / 1.05);
    if (state.stillAcc >= 1.05) enterInkDive();
  } else {
    state.stillAcc = 0;
    setDiveMeter(0);
  }

  if (state.life) {
    state.glyphSpawnAcc += dt * clamp((state.life.speed || 0) / 18, 0, 1);
    if (!state.wordDone && state.glyphSpawnAcc > 1.35 && state.glyphs.length < 2 && state.elapsed > OPENING_SEC + 8) {
      state.glyphSpawnAcc = 0;
      if (Math.random() < 0.55) spawnGlyph(state.life.x, state.life.y);
    }
  }

  if (state.symbiote) {
    state.symbiote.ang += dt * 3.4;
    state.symbiote.life = Math.min(1, state.symbiote.life + dt * 0.05);
  }

  updateGlyphs(dt);
}

function showToast(text, ms = 1450) {
  toastEl.textContent = text;
  toastEl.className = "toast show";
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toastEl.classList.remove("show"), ms);
}

function showCoach(text, ms = 1600, force = false) {
  if (!force && state.coachCount >= 3) return;
  if (!force) state.coachCount += 1;
  coachEl.textContent = text;
  coachEl.className = "coach show";
  clearTimeout(showCoach.timer);
  showCoach.timer = setTimeout(() => coachEl.classList.remove("show"), ms);
}

function tipOnce(key, text, ms = 1700) {
  if (state.tipFlags[key]) return;
  state.tipFlags[key] = true;
  showCoach(text, ms, true);
}

function difficultyScale() {
  const best = Math.max(state.best || 0, state.meta?.best || 0);
  if (best < 12) return 0.52;
  if (best < 30) return 0.68;
  if (best < 60) return 0.82;
  if (best < 100) return 0.92;
  return 1;
}

function floatText(x, y, text, color = "#f2c15a", size = 16) {
  state.floaters.push({ x, y, text, color, size, life: 1, vy: -0.45 });
}

function pushParticle(p) {
  state.particles.push({
    x: p.x,
    y: p.y,
    vx: p.vx || 0,
    vy: p.vy || 0,
    life: p.life ?? 1,
    decay: p.decay ?? rand(0.012, 0.028),
    size: p.size ?? rand(1.4, 3.8),
    color: p.color,
    kind: p.kind || "dot",
    rot: p.rot || 0,
    spin: p.spin || 0,
    grav: p.grav ?? 0.03,
  });
}

function burst(x, y, color, count = 12, speed = 3.5) {
  const accent = cssVar("--accent-b", cssVar("--gold", "#ffd27a"));
  for (let i = 0; i < count; i += 1) {
    const a = Math.random() * Math.PI * 2;
    const s = rand(0.7, speed);
    pushParticle({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: 1,
      decay: rand(0.012, 0.028),
      size: rand(1.4, 3.8),
      color: Math.random() < 0.35 ? accent : color,
      kind: "dot",
    });
  }
}

function pickBlastStyle() {
  if (BLAST_STYLES.length <= 1) return BLAST_STYLES[0];
  let idx = Math.floor(Math.random() * BLAST_STYLES.length);
  if (idx === lastBlastStyle) idx = (idx + 1 + Math.floor(Math.random() * (BLAST_STYLES.length - 1))) % BLAST_STYLES.length;
  lastBlastStyle = idx;
  return BLAST_STYLES[idx];
}

function eatSparkBlast(spark, opening = false) {
  const style = pickBlastStyle();
  const power =
    (spark.type === "super" ? 1.85 : spark.type === "rare" || spark.comet ? 1.4 : spark.type === "deep" ? 1.25 : 1) *
    (opening ? 1.25 : 1);
  const color = spark.color;
  const accent = mixColor(color, "#ffffff", 0.35);
  const gold = cssVar("--gold", "#ffe898");
  const x = spark.x;
  const y = spark.y;
  state.shake = Math.max(state.shake, (7 + Math.random() * 9) * power);
  state.flash = Math.max(state.flash, (0.1 + Math.random() * 0.08) * power);

  if (style === "spray") {
    for (let i = 0; i < Math.round(16 * power); i += 1) {
      const a = Math.random() * Math.PI * 2;
      const s = rand(1.2, 4.8) * power;
      pushParticle({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        size: rand(1.6, 4.2), color: Math.random() < 0.4 ? accent : color, kind: "dot",
      });
    }
  } else if (style === "ring") {
    const n = Math.round(22 * power);
    for (let i = 0; i < n; i += 1) {
      const a = (i / n) * Math.PI * 2;
      const s = (2.6 + Math.random() * 0.6) * power;
      pushParticle({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        size: rand(1.8, 3.2), color: i % 2 ? accent : color, kind: "ring", grav: 0.01, decay: 0.018,
      });
    }
  } else if (style === "nova") {
    for (let i = 0; i < Math.round(10 * power); i += 1) {
      const a = (i / Math.round(10 * power)) * Math.PI * 2;
      const s = (4.2 + Math.random()) * power;
      pushParticle({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        size: rand(2.2, 5), color: gold, kind: "streak", rot: a, spin: 0, grav: 0.005, decay: 0.02,
      });
    }
    burst(x, y, color, Math.round(12 * power), 2.4 * power);
  } else if (style === "shards") {
    for (let i = 0; i < Math.round(14 * power); i += 1) {
      const a = Math.random() * Math.PI * 2;
      const s = rand(1.8, 5.2) * power;
      pushParticle({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        size: rand(2.4, 5.5), color: Math.random() < 0.5 ? accent : color,
        kind: "shard", rot: a, spin: rand(-0.35, 0.35), grav: 0.04,
      });
    }
  } else if (style === "spiral") {
    for (let i = 0; i < Math.round(20 * power); i += 1) {
      const a = i * 0.55;
      const s = (1.2 + i * 0.12) * power * 0.35;
      pushParticle({
        x, y, vx: Math.cos(a) * s * 3.2, vy: Math.sin(a) * s * 3.2,
        size: rand(1.5, 3.6), color: i % 3 ? color : accent, kind: "dot", grav: 0.015, decay: 0.016,
      });
    }
  } else if (style === "cross") {
    for (let arm = 0; arm < 4; arm += 1) {
      const base = (arm * Math.PI) / 2 + Math.random() * 0.2;
      for (let i = 0; i < Math.round(5 * power); i += 1) {
        const a = base + (Math.random() - 0.5) * 0.28;
        const s = rand(2, 5.5) * power;
        pushParticle({
          x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
          size: rand(1.8, 4), color: arm % 2 ? gold : color, kind: "streak", rot: a, grav: 0.02,
        });
      }
    }
  } else if (style === "rain") {
    for (let i = 0; i < Math.round(18 * power); i += 1) {
      pushParticle({
        x: x + rand(-18, 18) * power,
        y: y + rand(-8, 8),
        vx: rand(-0.6, 0.6),
        vy: rand(-4.8, -2.2) * power,
        size: rand(1.4, 3.4),
        color: Math.random() < 0.35 ? accent : color,
        kind: "dot",
        grav: 0.12,
        decay: 0.014,
      });
    }
  } else if (style === "bloom") {
    for (let i = 0; i < Math.round(12 * power); i += 1) {
      const a = (i / Math.round(12 * power)) * Math.PI * 2 + rand(-0.1, 0.1);
      const s = rand(0.8, 2.2) * power;
      pushParticle({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        size: rand(3.5, 7), color: mixColor(color, "#ffffff", 0.2),
        kind: "bloom", rot: a, spin: rand(-0.08, 0.08), grav: 0.008, decay: 0.011, life: 1.15,
      });
    }
  } else if (style === "scatter") {
    for (let c = 0; c < 3; c += 1) {
      const cx = x + rand(-22, 22);
      const cy = y + rand(-22, 22);
      for (let i = 0; i < Math.round(6 * power); i += 1) {
        const a = Math.random() * Math.PI * 2;
        const s = rand(0.8, 3.2) * power;
        pushParticle({
          x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
          size: rand(1.5, 3.8), color: c === 1 ? gold : color, kind: "dot",
        });
      }
    }
  } else if (style === "pulse") {
    for (let ring = 0; ring < 2; ring += 1) {
      const n = Math.round(16 * power);
      const speed = (1.6 + ring * 1.8) * power;
      for (let i = 0; i < n; i += 1) {
        const a = (i / n) * Math.PI * 2;
        pushParticle({
          x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed,
          size: rand(1.6, 3.2), color: ring ? accent : color, kind: "ring", grav: 0, decay: 0.02,
        });
      }
    }
  } else if (style === "streaks") {
    for (let i = 0; i < Math.round(16 * power); i += 1) {
      const a = Math.random() * Math.PI * 2;
      const s = rand(2.5, 6) * power;
      pushParticle({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        size: rand(2, 4.5), color: Math.random() < 0.4 ? gold : color,
        kind: "streak", rot: a, grav: 0.01, decay: 0.022,
      });
    }
  } else {
    // firework: tight core then secondary scatter
    burst(x, y, color, Math.round(10 * power), 2.2 * power);
    for (let i = 0; i < Math.round(14 * power); i += 1) {
      const a = Math.random() * Math.PI * 2;
      const s = rand(2.8, 5.8) * power;
      pushParticle({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        size: rand(1.8, 4.2), color: i % 2 ? gold : accent,
        kind: "shard", rot: a, spin: rand(-0.4, 0.4), grav: 0.05, decay: 0.015,
      });
    }
  }

  if (spark.type === "super") {
    state.shake = Math.max(state.shake, 26);
    state.flash = Math.max(state.flash, 1.25);
    floatText(x, y - 26, "СУПЕР", "#ff2f45", 22);
    buzz([14, 20, 14, 28]);
  }
}

function localDayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDayKey(dayKey) {
  if (!dayKey || !/^\d{4}-\d{2}-\d{2}$/.test(dayKey)) return null;
  const [year, month, day] = dayKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function dayDiff(fromKey, toKey) {
  const from = parseDayKey(fromKey);
  const to = parseDayKey(toKey);
  if (!from || !to) return 0;
  const diff = to.getTime() - from.getTime();
  return Math.round(diff / 86400000);
}

function ownedSkinIds(meta = state.meta) {
  if (!meta) return ["ink"];
  const ids = new Set(["ink", ...(meta.unlockedSkins || []), ...(meta.premiumUnlocked || [])]);
  return [...ids];
}

function isSkinOwned(id, meta = state.meta) {
  return ownedSkinIds(meta).includes(id);
}

function currentDailyDef() {
  return DAILY_DEFS.find((daily) => daily.id === state.meta?.dailyId) || DAILY_DEFS[0];
}

function pickDailyId(prevId = "") {
  const pool = DAILY_DEFS.filter((daily) => daily.id !== prevId);
  const choices = pool.length ? pool : DAILY_DEFS;
  return choices[Math.floor(Math.random() * choices.length)].id;
}

function weekKey(date = new Date()) {
  const tmp = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7));
  const week1 = new Date(tmp.getFullYear(), 0, 4);
  const week = 1 + Math.round(((tmp - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${tmp.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function loadMeta() {
  let raw = null;
  try {
    raw = JSON.parse(localStorage.getItem(META_KEY) || "null");
  } catch (_) {
    raw = null;
  }
  const oldBest = Number(localStorage.getItem(BEST_KEY) || 0);
  const best = Math.max(0, Number(raw?.best || 0), oldBest);
  const unlockedSkins = SKINS.filter((skin) => !skin.premium && best >= skin.at).map((skin) => skin.id);
  const premiumUnlocked = SKINS.filter((skin) => skin.premium && Array.isArray(raw?.premiumUnlocked) && raw.premiumUnlocked.includes(skin.id))
    .map((skin) => skin.id);
  const streak = Math.max(0, Number(raw?.streak || 0));
  const marks = Math.max(0, Number(raw?.marks || 0));
  const activeId = typeof raw?.activeSkin === "string" ? raw.activeSkin : "";
  const activeSkin = isSkinOwned(activeId, { unlockedSkins, premiumUnlocked })
    ? activeId
    : ownedSkinIds({ unlockedSkins, premiumUnlocked }).slice(-1)[0] || "ink";
  const currentWeek = weekKey();
  const savedWeek = typeof raw?.weekId === "string" ? raw.weekId : "";
  const weekFresh = savedWeek !== currentWeek;
  return {
    best,
    unlockedSkins,
    activeSkin,
    marks,
    streak,
    lastPlayDay: typeof raw?.lastPlayDay === "string" ? raw.lastPlayDay : "",
    dailyDay: typeof raw?.dailyDay === "string" ? raw.dailyDay : "",
    dailyId: typeof raw?.dailyId === "string" ? raw.dailyId : "",
    dailyDone: !!raw?.dailyDone,
    premiumUnlocked,
    sound: raw?.sound !== false,
    haptics: raw?.haptics !== false,
    // Returning players skip onboarding even if the flag was added later.
    onboarded: !!raw?.onboarded || best > 0 || marks > 0 || Math.max(0, Number(raw?.runs || 0)) > 0,
    starterGift: !!raw?.starterGift || best > 0 || marks > 0,
    ratePrompted: !!raw?.ratePrompted,
    runs: Math.max(0, Number(raw?.runs || 0)),
    weekId: currentWeek,
    weekBest: weekFresh ? 0 : Math.max(0, Number(raw?.weekBest || 0)),
    weekRewardTaken: weekFresh ? false : !!raw?.weekRewardTaken,
    iapMarksBought: Math.max(0, Number(raw?.iapMarksBought || 0)),
  };
}

function saveMeta() {
  if (!state.meta) return;
  localStorage.setItem(META_KEY, JSON.stringify(state.meta));
  localStorage.setItem(BEST_KEY, String(state.meta.best));
}

function skinById(id) {
  return SKINS.find((skin) => skin.id === id) || SKINS[0];
}

function activeSkin() {
  return skinById(state.meta?.activeSkin || "ink");
}

function touchPlayDay() {
  if (!state.meta) return;
  const today = localDayKey();
  const diff = dayDiff(state.meta.lastPlayDay, today);
  if (!state.meta.lastPlayDay) {
    state.meta.streak = Math.max(1, state.meta.streak || 0);
  } else if (diff === 1) {
    state.meta.streak = Math.max(1, (state.meta.streak || 0) + 1);
  } else if (diff > 1) {
    state.meta.streak = 1;
  }
  state.meta.lastPlayDay = today;
  saveMeta();
}

function refreshDaily() {
  if (!state.meta) return;
  const today = localDayKey();
  let changed = false;
  if (state.meta.dailyDay !== today) {
    state.meta.dailyDay = today;
    state.meta.dailyId = pickDailyId(state.meta.dailyId);
    state.meta.dailyDone = false;
    changed = true;
  } else if (!DAILY_DEFS.some((daily) => daily.id === state.meta.dailyId)) {
    state.meta.dailyId = pickDailyId();
    changed = true;
  }
  if (changed) saveMeta();
}

function updateEconomyLabels() {
  if (!state.meta) return;
  if (marksStartEl) marksStartEl.textContent = String(state.meta.marks);
  const streakText = `${Math.max(0, state.meta.streak || 0)} дн`;
  if (streakStartEl) streakStartEl.textContent = streakText;
  if (streakOverEl) streakOverEl.textContent = String(Math.max(0, state.meta.streak || 0));
}

function dailyProgressText(daily = currentDailyDef()) {
  if (!daily) return "";
  return state.meta?.dailyDone ? "выполнено · +15 следов" : daily.label(state);
}

function renderDaily() {
  const daily = currentDailyDef();
  if (!daily) return;
  if (dailyCardEl) dailyCardEl.textContent = `ежедневка · ${daily.title} · ${dailyProgressText(daily)}`;
  renderWeekly();
  renderSettings();
}

function renderWeekly() {
  if (!weeklyCardEl || !state.meta) return;
  const best = Math.min(WEEKLY_TARGET, state.meta.weekBest || 0);
  if (state.meta.weekRewardTaken) {
    weeklyCardEl.textContent = `неделя · ${WEEKLY_TARGET} света · +${WEEKLY_REWARD} взято`;
    return;
  }
  weeklyCardEl.textContent = `неделя · ${best}/${WEEKLY_TARGET} света · +${WEEKLY_REWARD} следов`;
}

function renderSettings() {
  if (!state.meta) return;
  if (btnSound) {
    btnSound.classList.toggle("on", state.meta.sound !== false);
    btnSound.setAttribute("aria-pressed", state.meta.sound !== false ? "true" : "false");
    btnSound.textContent = state.meta.sound !== false ? "звук" : "звук off";
  }
  if (btnHaptics) {
    btnHaptics.classList.toggle("on", state.meta.haptics !== false);
    btnHaptics.setAttribute("aria-pressed", state.meta.haptics !== false ? "true" : "false");
    btnHaptics.textContent = state.meta.haptics !== false ? "вибро" : "вибро off";
  }
}

function evaluateWeekly(score) {
  if (!state.meta) return false;
  const currentWeek = weekKey();
  if (state.meta.weekId !== currentWeek) {
    state.meta.weekId = currentWeek;
    state.meta.weekBest = 0;
    state.meta.weekRewardTaken = false;
  }
  state.meta.weekBest = Math.max(state.meta.weekBest || 0, score);
  saveMeta();
  renderWeekly();
  if (state.meta.weekRewardTaken || state.meta.weekBest < WEEKLY_TARGET) return false;
  state.meta.weekRewardTaken = true;
  awardMarks(WEEKLY_REWARD, {
    x: state.width * 0.5,
    y: state.height * 0.2,
    color: cssVar("--life", "#6fd9b0"),
    size: 16,
  });
  showToast(`неделя: +${WEEKLY_REWARD} следов`);
  goalChime();
  return true;
}

function grantStarterGift() {
  if (!state.meta || state.meta.starterGift) return;
  state.meta.starterGift = true;
  awardMarks(STARTER_MARKS, { metaOnly: true });
  showToast(`подарок · +${STARTER_MARKS} следов`);
}

function showOnboard() {
  if (!screenOnboardEl) return;
  state.onboardStep = 0;
  refreshOnboardUi();
  screenStartEl.classList.add("hidden");
  screenOnboardEl.classList.remove("hidden");
}

function refreshOnboardUi() {
  const step = state.onboardStep;
  if (onboardTextEl) onboardTextEl.textContent = ONBOARD_STEPS[step] || ONBOARD_STEPS[0];
  const last = step >= ONBOARD_STEPS.length - 1;
  if (onboardLabelEl) onboardLabelEl.textContent = last ? "Играть" : "Дальше";
  if (onboardSubEl) onboardSubEl.textContent = last ? "держи кнопку на старте" : `шаг ${step + 1} из ${ONBOARD_STEPS.length}`;
}

function advanceOnboard() {
  if (state.onboardStep < ONBOARD_STEPS.length - 1) {
    state.onboardStep += 1;
    refreshOnboardUi();
    tone(520 + state.onboardStep * 80, 0.06, "triangle", 0.024);
    return;
  }
  if (state.meta) {
    state.meta.onboarded = true;
    saveMeta();
  }
  grantStarterGift();
  screenOnboardEl?.classList.add("hidden");
  screenStartEl.classList.remove("hidden");
  updateEconomyLabels();
  renderDaily();
}

async function purchaseMarksPack() {
  if (!state.meta) return;
  const native = window.OttiskNative;
  if (native?.isNative && typeof native.purchase === "function") {
    showToast("открываем покупку…");
    const result = await native.purchase(MARKS_PACK_PRODUCT_ID).catch(() => null);
    if (result?.ok) {
      state.meta.iapMarksBought = (state.meta.iapMarksBought || 0) + 1;
      awardMarks(MARKS_PACK_AMOUNT, { metaOnly: true });
      showToast(`+${MARKS_PACK_AMOUNT} следов`);
      return;
    }
    showToast(result?.message || "покупка отменена");
    return;
  }
  showToast("покупка · в версии App Store");
}

async function maybeAskRate() {
  if (!state.meta || state.meta.ratePrompted) {
    btnRate?.classList.add("hidden");
    return;
  }
  const strong = state.score >= 40 || state.score >= state.best;
  const enoughRuns = (state.meta.runs || 0) >= 3;
  if (!strong || !enoughRuns) {
    btnRate?.classList.add("hidden");
    return;
  }
  btnRate?.classList.remove("hidden");
}

async function requestReview() {
  if (!state.meta) return;
  state.meta.ratePrompted = true;
  saveMeta();
  btnRate?.classList.add("hidden");
  const native = window.OttiskNative;
  if (native?.isNative && typeof native.requestReview === "function") {
    await native.requestReview().catch(() => {});
    showToast("спасибо");
    return;
  }
  showToast("спасибо — оценка будет в App Store");
}

function awardMarks(amount, opts = {}) {
  if (!state.meta || !amount) return;
  const gained = Math.max(0, Math.round(amount));
  state.meta.marks = Math.max(0, Math.round((state.meta.marks || 0) + gained));
  if (!opts.metaOnly) state.runMarks += gained;
  saveMeta();
  updateEconomyLabels();
  renderDaily();
  renderSkinMeta();
  if (opts.x != null && opts.y != null) {
    floatText(opts.x, opts.y, `+${gained} следов`, opts.color || cssVar("--gold", "#f2c15a"), opts.size || 15);
  }
}

function checkScoreMilestones() {
  for (const mile of SCORE_MILESTONES) {
    if (state.score < mile.at || state.milestonesHit.includes(mile.at)) continue;
    state.milestonesHit.push(mile.at);
    pulseUnlock(cssVar("--gold", "#ffe898"), 0.1);
    goalChime();
    buzz([8, 16, 8]);
    awardMarks(mile.marks, {
      x: state.width * 0.5,
      y: state.height * 0.2,
      color: cssVar("--gold", "#f2c15a"),
      size: 16,
    });
  }
}

function evaluateDaily() {
  if (!state.meta || state.meta.dailyDone) return false;
  const daily = currentDailyDef();
  if (!daily || !daily.check(state)) {
    renderDaily();
    return false;
  }
  state.meta.dailyDone = true;
  awardMarks(15, {
    x: state.life?.x ?? state.width * 0.5,
    y: state.life?.y ?? state.height * 0.22,
    color: cssVar("--life", "#6fd9b0"),
    size: 17,
  });
  showToast(`ежедневка: ${daily.title}`);
  goalChime();
  buzz([10, 18, 10]);
  renderDaily();
  return true;
}

function syncMetaFromBest() {
  if (!state.meta) return [];
  const prev = new Set(state.meta.unlockedSkins);
  const hadPremiumSkin = !!skinById(state.meta.activeSkin).premium && state.meta.premiumUnlocked.includes(state.meta.activeSkin);
  state.meta.best = Math.max(state.meta.best, state.score);
  state.best = state.meta.best;
  state.meta.unlockedSkins = SKINS.filter((skin) => !skin.premium && state.meta.best >= skin.at).map((skin) => skin.id);
  const newlyUnlocked = state.meta.unlockedSkins.filter((id) => !prev.has(id));
  if (!isSkinOwned(state.meta.activeSkin) || (!hadPremiumSkin && newlyUnlocked.length)) {
    state.meta.activeSkin = newlyUnlocked[newlyUnlocked.length - 1]
      || state.meta.unlockedSkins[state.meta.unlockedSkins.length - 1]
      || "ink";
  }
  saveMeta();
  updateBestLabels();
  updateEconomyLabels();
  renderDaily();
  renderSkinMeta();
  return newlyUnlocked;
}

function renderSkinMeta() {
  const skin = activeSkin();
  app.dataset.skin = skin.id;
  if (skinNameEl) skinNameEl.textContent = skin.name;
  if (!skinUnlocksEl) return;
  skinUnlocksEl.textContent = "";
  for (const item of SKINS) {
    const pill = document.createElement("button");
    const owned = isSkinOwned(item.id);
    const premiumLocked = !!item.premium && !owned;
    const scoreLocked = !item.premium && !owned;
    pill.type = "button";
    pill.className = `skin-pill${owned ? " on" : ""}${item.id === skin.id ? " active" : ""}${item.premium ? " premium" : ""}${!owned ? " locked" : ""}`;
    pill.disabled = scoreLocked;
    pill.setAttribute("aria-pressed", item.id === skin.id ? "true" : "false");
    if (owned) {
      pill.textContent = item.id === skin.id ? `${item.name} · выбран` : item.name;
      pill.addEventListener("click", () => {
        if (!state.meta || state.meta.activeSkin === item.id) return;
        state.meta.activeSkin = item.id;
        saveMeta();
        renderSkinMeta();
      });
    } else if (premiumLocked) {
      pill.textContent = `${item.name} · ${item.cost} следов`;
      pill.addEventListener("click", () => {
        if (!state.meta) return;
        if ((state.meta.marks || 0) < item.cost) {
          showToast(`нужно ${item.cost} следов`);
          return;
        }
        state.meta.marks = Math.max(0, state.meta.marks - item.cost);
        state.meta.premiumUnlocked = [...new Set([...(state.meta.premiumUnlocked || []), item.id])];
        state.meta.activeSkin = item.id;
        saveMeta();
        updateEconomyLabels();
        renderSkinMeta();
        showToast(`куплен оттиск: ${item.name}`);
      });
    } else {
      pill.textContent = `${item.name} · рекорд ${item.at}`;
    }
    skinUnlocksEl.appendChild(pill);
  }
}

function updateBestLabels() {
  bestStartEl.textContent = String(state.best);
  bestOverEl.textContent = String(state.best);
}

function mutationForScore(score) {
  let current = MUTATIONS[0];
  for (const mut of MUTATIONS) {
    if (score >= mut.at) current = mut;
  }
  return current;
}

function hasMut(id) {
  return state.unlockedMuts.includes(id);
}

function updateMutationUi() {
  if (!mutTrackFillEl) return;
  const currentIdx = MUTATIONS.findIndex((m) => m.id === state.mutation.id);
  const next = MUTATIONS[currentIdx + 1];
  if (!next) {
    mutTrackFillEl.style.width = "100%";
    return;
  }
  const span = Math.max(1, next.at - state.mutation.at);
  const progress = clamp((state.score - state.mutation.at) / span, 0, 1);
  mutTrackFillEl.style.width = `${Math.round(progress * 100)}%`;
}

function applyThemeFromScore(announce = false) {
  const theme = Math.floor(state.score / 100) % THEME_COUNT;
  const changed = theme !== state.theme;
  if (!changed && !announce) return;
  state.theme = theme;
  app.dataset.theme = String(theme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", cssVar("--bg0", "#241828"));
  if (changed && announce && state.score >= 100) {
    pulseUnlock(cssVar("--accent-a", "#ff9a62"), 0.18);
    burst(state.width * 0.5, state.height * 0.4, cssVar("--accent-a", "#ff9a62"), 28, 5.2);
  }
}

function updateScoreUi(pop = false) {
  scoreEl.textContent = String(state.score);
  if (pop) {
    scoreEl.classList.remove("pop");
    void scoreEl.offsetWidth;
    scoreEl.classList.add("pop");
  }
}

function updateHungerUi() {
  const pct = Math.round(clamp(state.hunger, 0, 100));
  heatFillEl.style.width = `${pct}%`;
  heatPctEl.textContent = `${pct}%`;
  heatEl.classList.toggle("low", pct < 30);
  heatEl.classList.toggle("critical", pct < 18);
  if (pct < 28 && state.running && state.life) tipOnce("hunger", "ЕШЬ СВЕТ", 1500);
}

function renderSkinResult() {
  const current = activeSkin().name;
  if (!state.runUnlockedSkins.length) {
    skinResultEl.textContent = `оттиск: ${current}`;
    return;
  }
  const names = state.runUnlockedSkins.map((id) => skinById(id).name).join(" · ");
  skinResultEl.textContent = `оттиск: ${current} · новый: ${names}`;
}

function renderDailyResult() {
  const daily = currentDailyDef();
  if (!dailyResultEl || !daily) return;
  if (state.meta?.dailyDone) {
    dailyResultEl.textContent = `ежедневка: ${daily.title} · +15 следов`;
  } else {
    dailyResultEl.textContent = `ежедневка: ${daily.title} · ${daily.label(state)}`;
  }
  if (marksResultEl) {
    marksResultEl.textContent = state.runMarks > 0
      ? `за забег · +${state.runMarks} следов`
      : "за забег · следы не набраны";
  }
}

function syncMutation() {
  const now = mutationForScore(state.score);
  const newly = MUTATIONS.filter((mut) => state.score >= mut.at && !state.unlockedMuts.includes(mut.id));
  for (const mut of newly) {
    state.unlockedMuts.push(mut.id);
    mutationDing();
    pulseUnlock(cssVar("--life", "#7affd4"), 0.13);
    burst(state.width * 0.5, state.height * 0.38, cssVar("--life", "#7affd4"), 22, 4.8);
    if (mut.id === "bloom") state.bloomPulse = 1;
  }
  state.mutation = now;
  updateMutationUi();
}

function afterScoreChange(pop = false) {
  updateScoreUi(pop);
  const newlyUnlockedSkins = syncMetaFromBest();
  if (newlyUnlockedSkins.length) {
    state.runUnlockedSkins.push(...newlyUnlockedSkins.filter((id) => !state.runUnlockedSkins.includes(id)));
    pulseUnlock(activeSkin().color, 0.12);
  }
  syncMutation();
  applyThemeFromScore(pop);
  checkScoreMilestones();
  evaluateDaily();
}

function addScore(amount, x, y, opts = {}) {
  if (!amount) return;
  let gained = amount;
  if (opts.combo !== false && (state.fever || state.combo >= 4)) {
    gained = Math.max(amount, Math.round(amount * 1.5));
  }
  state.score += gained;
  if (opts.combo !== false) {
    state.combo += 1;
    state.comboClock = 2.8;
    state.stats.maxCombo = Math.max(state.stats.maxCombo, state.combo);
    const feverNow = state.combo >= 5;
    if (feverNow && !state.fever) {
      pulseUnlock(cssVar("--ember", "#ff9a62"), 0.11);
      state.bloomPulse = Math.max(state.bloomPulse, 0.55);
    }
    state.fever = feverNow;
    if (state.combo >= 2) showCombo(feverNow ? `×${state.combo}` : `×${state.combo}`, feverNow);
    if (state.combo === 8) {
      awardMarks(2, {
        x: state.width * 0.5,
        y: state.height * 0.16,
        color: cssVar("--gold", "#f2c15a"),
        size: 14,
      });
      showToast("цепь ×8");
    }
    if (hasMut("bloom") && state.combo > 0 && state.combo % 6 === 0 && state.life) {
      state.bloomPulse = 1;
      // Spawn at edges — never on top of the player (prevents AFK magnet farm)
      for (let i = 0; i < 2; i += 1) spawnSpark({ edge: true, type: Math.random() < 0.12 ? "rare" : null });
      pulseUnlock(cssVar("--gold", "#ffe898"), 0.1);
    }
  }
  if (!opts.silentFloat && x != null && y != null) {
    floatText(x, y, `+${gained}`, opts.color || cssVar("--gold", "#f2c15a"));
  }
  afterScoreChange(true);
}

function resize() {
  const prevW = state.width || 1;
  const prevH = state.height || 1;
  const rect = stage.getBoundingClientRect();
  state.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  state.width = Math.max(1, Math.floor(rect.width));
  state.height = Math.max(1, Math.floor(rect.height));
  canvas.width = Math.floor(state.width * state.dpr);
  canvas.height = Math.floor(state.height * state.dpr);
  canvas.style.width = `${state.width}px`;
  canvas.style.height = `${state.height}px`;
  ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  const sx = state.width / prevW;
  const sy = state.height / prevH;
  if (state.life) {
    state.life.x *= sx;
    state.life.y *= sy;
  }
  if (state.echo) {
    state.echo.x *= sx;
    state.echo.y *= sy;
  }
  for (const list of [state.sparks, state.hunters, state.veins, state.particles, state.floaters]) {
    for (const item of list) {
      if ("x" in item) item.x *= sx;
      if ("y" in item) item.y *= sy;
    }
  }
}

function pointerPos(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = state.width / Math.max(1, rect.width);
  const scaleY = state.height / Math.max(1, rect.height);
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
}

function clampLife() {
  if (!state.life) return;
  const pad = state.life.r * 0.52;
  state.life.x = clamp(state.life.x, pad, state.width - pad);
  state.life.y = clamp(state.life.y, pad, state.height - pad);
}

function nearestSpark(x, y) {
  let best = null;
  let bestD = Infinity;
  for (const spark of state.sparks) {
    const d = dist(x, y, spark.x, spark.y);
    if (d < bestD) {
      bestD = d;
      best = spark;
    }
  }
  return best;
}

function setHoldVisual(pct, target) {
  holdFillEl.style.width = target === "start" ? pct : "0%";
  holdFillOverEl.style.width = target === "retry" ? pct : "0%";
}

function clearHold() {
  state.hold = null;
  holdFillEl.style.width = "0%";
  holdFillOverEl.style.width = "0%";
}

function bindHoldButton(button, target) {
  button.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    if (state.running) return;
    ensureAudio();
    state.hold = { target, pointerId: e.pointerId, progress: 0 };
    setHoldVisual("0%", target);
    tone(300, 0.05, "sine", 0.024);
    try {
      button.setPointerCapture(e.pointerId);
    } catch (_) {
      // noop
    }
  });
  const release = (e) => {
    if (!state.hold) return;
    if (e && state.hold.pointerId !== e.pointerId) return;
    if (!state.running && state.hold.progress < 1) showToast("держи кнопку");
    clearHold();
  };
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", () => clearHold());
  button.addEventListener("click", (e) => e.preventDefault());
}

function continueOffer() {
  const used = state.continuesUsed || 0;
  if (used >= MAX_CONTINUES_PER_RUN) {
    return { ok: false, kind: "none", label: "Лимит", sub: "забег исчерпан", cost: 0 };
  }
  if (used < FREE_CONTINUES_PER_RUN) {
    return { ok: true, kind: "free", label: "Продолжить", sub: "бесплатно · 1 раз", cost: 0 };
  }
  const marks = state.meta?.marks || 0;
  const affordable = marks >= MARKS_CONTINUE_COST;
  return {
    ok: affordable,
    kind: "marks",
    label: affordable ? "Продолжить" : "Мало следов",
    sub: `${MARKS_CONTINUE_COST} следов · есть ${marks}`,
    cost: MARKS_CONTINUE_COST,
  };
}

function canOfferContinue() {
  return continueOffer().kind !== "none";
}

function refreshContinueUi() {
  const offer = continueOffer();
  if (continueLabelEl) continueLabelEl.textContent = offer.label;
  if (continueSubEl) continueSubEl.textContent = offer.sub;
  if (continueHintEl) {
    continueHintEl.textContent = offer.kind === "free"
      ? "Один бесплатный шанс за забег. Счёт сохранится."
      : offer.ok
        ? `Дополнительный шанс за ${MARKS_CONTINUE_COST} следов.`
        : `Нужно ${MARKS_CONTINUE_COST} следов. Сыграй ещё — копи следы.`;
  }
  if (btnContinue) btnContinue.disabled = !offer.ok;
}

function showContinueScreen(reason) {
  state.pendingDeathReason = reason;
  state.continueBusy = false;
  if (continueReasonEl) continueReasonEl.textContent = reason;
  refreshContinueUi();
  statusEl.classList.add("hidden");
  screenOverEl.classList.add("hidden");
  screenContinueEl?.classList.remove("hidden");
  clearHold();
}

function finalizeGameOver(reason) {
  state.deathReason = reason;
  state.pendingDeathReason = "";
  state.continueBusy = false;
  state.timeScale = 1;
  if (state.meta) {
    state.meta.runs = Math.max(0, (state.meta.runs || 0) + 1);
    saveMeta();
  }
  evaluateDaily();
  evaluateWeekly(state.score);
  finalScoreEl.textContent = String(state.score);
  deathReasonEl.textContent = reason;
  const muts = state.unlockedMuts.filter((id) => id !== "spark");
  mutSummaryEl.textContent = muts.length ? `новых сил: ${muts.length}` : "";
  renderSkinResult();
  renderDailyResult();
  updateBestLabels();
  updateEconomyLabels();
  renderDaily();
  maybeAskRate();
  app.classList.remove("in-run");
  statusEl.classList.add("hidden");
  screenContinueEl?.classList.add("hidden");
  screenOverEl.classList.remove("hidden");
  clearHold();
}

function createLife(x, y, opts = {}) {
  state.echo = null;
  state.holdLifeTime = 0;
  state.life = {
    x,
    y,
    px: x,
    py: y,
    speed: 0,
    r: 17,
    wobble: Math.random() * Math.PI * 2,
    aim: -Math.PI / 2,
    teeth: 0,
  };
  state.lastVeinX = x;
  state.lastVeinY = y;
  if (!opts.silent) {
    hum(true);
    if (state.running && !state.openingBurst) {
      state.openingBurst = true;
      burst(x, y, cssVar("--life", "#7affd4"), 32, 5.8);
      burst(x, y, cssVar("--gold", "#ffe898"), 22, 4.6);
      state.flash = Math.max(state.flash, 0.24);
      spawnOpeningRing(x, y);
      tone(440, 0.12, "sine", 0.042);
      tone(660, 0.14, "triangle", 0.036, 0.06);
      tone(880, 0.1, "sine", 0.028, 0.12);
      buzz([14, 28, 14]);
      showCoach("ЕШЬ СВЕТ", 1500, true);
    } else {
      burst(x, y, cssVar("--life", "#7affd4"), 12, 3.4);
      buzz(5);
    }
  }
}

function releasePulse(x, y) {
  if (state.pulseCd > 0 || state.holdLifeTime < 0.45) return false;
  state.pulseCd = 2.6;
  let pushed = 0;
  for (const hunter of state.hunters) {
    const d = dist(hunter.x, hunter.y, x, y);
    if (d > 150) continue;
    const force = (1 - d / 150) * 9.5;
    hunter.vx += ((hunter.x - x) / (d || 1)) * force;
    hunter.vy += ((hunter.y - y) / (d || 1)) * force;
    hunter.warn = Math.max(hunter.warn, 0.7);
    pushed += 1;
  }
  burst(x, y, cssVar("--foam", "#f3eee8"), 14, 4.2);
  state.flash = Math.max(state.flash, 0.08);
  tone(300, 0.07, "sine", 0.024);
  tone(180, 0.1, "triangle", 0.02, 0.05);
  if (pushed) {
    burst(x, y, cssVar("--foam", "#fffdf8"), 18, 4.8);
    buzz(8);
  }
  return pushed > 0;
}

function releaseLife() {
  if (!state.life) return;
  const x = state.life.x;
  const y = state.life.y;
  const wobble = state.life.wobble;
  const r = state.life.r * 0.92;
  releasePulse(x, y);
  if (inInkDive()) exitInkDive();
  state.stillAcc = 0;
  setDiveMeter(0);
  state.echo = {
    x,
    y,
    r,
    wobble,
    aim: state.life.aim ?? -Math.PI / 2,
    life: 1,
  };
  state.life = null;
  state.holdLifeTime = 0;
  hum(false);
  if (state.running) tipOnce("echo", "СЛЕД УЯЗВИМ", 1400);
}

function grantContinue() {
  state.pendingDeathReason = "";
  state.continuesUsed = (state.continuesUsed || 0) + 1;
  state.continueBusy = false;
  state.paused = false;
  state.running = true;
  state.demo = false;
  state.touchActive = false;
  state.pointerId = null;
  state.hunger = 68;
  state.hunters = [];
  state.echo = null;
  state.safeUntil = performance.now() + 2800;
  if (!state.life) createLife(state.width * 0.5, state.height * 0.56);
  else hum(true);
  updateHungerUi();
  renderDaily();
  statusEl.classList.remove("hidden");
  screenContinueEl?.classList.add("hidden");
  screenOverEl.classList.add("hidden");
  state.lastTs = performance.now();
  state.flash = Math.max(state.flash, 0.14);
  burst(state.width * 0.5, state.height * 0.56, cssVar("--life", "#6fd9b0"), 22, 4.8);
  tone(520, 0.08, "triangle", 0.03);
  tone(780, 0.12, "sine", 0.026, 0.07);
  showToast("щит · 3 сек");
  buzz([8, 20, 8]);
  window.OttiskNative?.haptic?.("medium");
}

function requestContinue() {
  if (!state.pendingDeathReason || state.continueBusy) return;
  const offer = continueOffer();
  if (!offer.ok) {
    showToast(offer.kind === "marks" ? `нужно ${MARKS_CONTINUE_COST} следов` : "лимит шансов");
    refreshContinueUi();
    return;
  }
  ensureAudio();
  state.continueBusy = true;
  if (offer.kind === "marks") {
    if (!state.meta || (state.meta.marks || 0) < offer.cost) {
      state.continueBusy = false;
      showToast(`нужно ${offer.cost} следов`);
      refreshContinueUi();
      return;
    }
    state.meta.marks = Math.max(0, state.meta.marks - offer.cost);
    saveMeta();
    updateEconomyLabels();
    renderSkinMeta();
    showToast(`−${offer.cost} следов`);
  }
  grantContinue();
}

function shareText() {
  return `Мой след в ОТТИСК: ${state.score} света. Рекорд ${state.best}. ${SHARE_URL}`;
}

function canvasToBlob(canvasEl) {
  return new Promise((resolve) => {
    if (!canvasEl?.toBlob) {
      resolve(null);
      return;
    }
    canvasEl.toBlob((blob) => resolve(blob), "image/png");
  });
}

function buildShareCard() {
  if (!shareCanvasEl) return null;
  const shareCtx = shareCanvasEl.getContext("2d");
  if (!shareCtx) return null;
  const { width, height } = shareCanvasEl;
  const skin = activeSkin();
  const reason = state.deathReason || state.pendingDeathReason || "след ещё жив";
  const gradient = shareCtx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#19151c");
  gradient.addColorStop(1, "#0f0d12");
  shareCtx.fillStyle = gradient;
  shareCtx.fillRect(0, 0, width, height);

  shareCtx.fillStyle = "rgba(255,255,255,0.06)";
  shareCtx.beginPath();
  shareCtx.arc(width * 0.82, height * 0.18, 130, 0, Math.PI * 2);
  shareCtx.fill();
  shareCtx.beginPath();
  shareCtx.arc(width * 0.18, height * 0.78, 170, 0, Math.PI * 2);
  shareCtx.fill();

  shareCtx.strokeStyle = skin.color;
  shareCtx.lineWidth = 4;
  shareCtx.strokeRect(40, 40, width - 80, height - 80);

  shareCtx.fillStyle = "#f3eee8";
  shareCtx.textAlign = "left";
  shareCtx.font = "700 32px Instrument Sans, sans-serif";
  shareCtx.fillText("ОТТИСК", 90, 120);
  shareCtx.font = "600 24px Instrument Sans, sans-serif";
  shareCtx.fillStyle = "rgba(243,238,232,0.78)";
  shareCtx.fillText("живёт только под пальцем", 90, 164);

  shareCtx.fillStyle = skin.color;
  shareCtx.font = "800 180px Syne, sans-serif";
  shareCtx.fillText(String(state.score), 90, 400);

  shareCtx.fillStyle = "#f3eee8";
  shareCtx.font = "700 34px Instrument Sans, sans-serif";
  shareCtx.fillText("света", 96, 448);
  shareCtx.font = "600 28px Instrument Sans, sans-serif";
  shareCtx.fillStyle = "rgba(243,238,232,0.82)";
  shareCtx.fillText(`Рекорд · ${state.best}`, 90, 548);
  shareCtx.fillText(`Причина · ${reason}`, 90, 602);
  shareCtx.fillText(`Оттиск · ${skin.name}`, 90, 656);

  shareCtx.fillStyle = "rgba(243,238,232,0.62)";
  shareCtx.font = "600 22px Instrument Sans, sans-serif";
  shareCtx.fillText(`gqfc925dtm-max.github.io/Fagsikasdr`, 90, 770);
  if (state.runMarks > 0) {
    shareCtx.fillText(`+${state.runMarks} следов за забег`, 90, 808);
  }

  return shareCanvasEl;
}

async function shareRun() {
  const text = shareText();
  const card = buildShareCard();
  try {
    if (navigator.share) {
      const blob = await canvasToBlob(card);
      if (blob && typeof File !== "undefined") {
        const file = new File([blob], "ottisk-share.png", { type: blob.type || "image/png" });
        if (!navigator.canShare || navigator.canShare({ files: [file] })) {
          await navigator.share({ title: "ОТТИСК", text, files: [file] });
          showToast("след отправлен");
          return;
        }
      }
      await navigator.share({ title: "ОТТИСК", text });
      showToast("след отправлен");
      return;
    }
  } catch (err) {
    if (err?.name === "AbortError") {
      showToast("поделиться отменено");
      return;
    }
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      showToast("текст скопирован");
      return;
    }
  } catch (_) {
    // noop
  }

  showToast(text, 2200);
}

function sparkProfile(type) {
  if (type === "super") {
    return { type, worth: 10, restore: 48, color: "#ff2f45", r: rand(20, 24), super: true };
  }
  if (type === "rare") {
    return { type, worth: 3, restore: 35, color: "#ffcc44", r: rand(15, 19) };
  }
  if (type === "cool") {
    return { type, worth: 1, restore: 25, color: "#58c8ff", r: rand(13.5, 17) };
  }
  if (type === "bait") {
    return { type, worth: 1, restore: 12, color: "#ff58d0", r: rand(13.5, 17) };
  }
  if (type === "comet") {
    return { type, worth: 5, restore: 28, color: "#ffd840", r: rand(16, 20), comet: true };
  }
  if (type === "deep") {
    return { type, worth: 4, restore: 32, color: "#70d8ff", r: rand(14.5, 18) };
  }
  if (type === "seed") {
    return { type, worth: 2, restore: 16, color: "#58ffb0", r: rand(14, 17.5), seed: true };
  }
  const normals = ["#ffd080", "#ffb868", "#fff0a0", cssVar("--accent-b", "#62f0c8")];
  return {
    type: "normal",
    worth: 1,
    restore: 18,
    color: normals[Math.floor(Math.random() * normals.length)],
    r: rand(13, 17),
  };
}

function rollSparkType() {
  if (inInkDive()) return Math.random() < 0.7 ? "deep" : "rare";
  const r = Math.random();
  if (r < 0.1) return "rare";
  if (r < 0.2) return "cool";
  if (r < 0.27) return "bait";
  if (r < 0.32 && !state.symbiote) return "seed";
  return "normal";
}

function maybeSpawnSuperStar() {
  if (!state.running || state.score >= 100 || state.superStarEaten) return;
  if (state.sparks.some((s) => s.type === "super")) return;
  const ready = state.stats.sparkEats >= 1 || state.elapsed > 3.2;
  if (!ready) return;
  const margin = 56;
  const side = Math.floor(Math.random() * 4);
  let x = state.width * 0.72;
  let y = state.height * 0.28;
  if (side === 0) {
    x = rand(margin, state.width - margin);
    y = margin + 24;
  } else if (side === 1) {
    x = state.width - margin - 10;
    y = rand(margin, state.height * 0.55);
  } else if (side === 2) {
    x = rand(margin, state.width - margin);
    y = state.height - margin - 24;
  } else {
    x = margin + 10;
    y = rand(margin, state.height * 0.55);
  }
  if (state.life && dist(x, y, state.life.x, state.life.y) < 110) {
    x = clamp(state.width - state.life.x, margin, state.width - margin);
    y = clamp(state.height * 0.25, margin, state.height - margin);
  }
  const profile = sparkProfile("super");
  state.sparks.push({
    x,
    y,
    vx: rand(-0.25, 0.25),
    vy: rand(-0.25, 0.25),
    pulse: Math.random() * Math.PI * 2,
    tutorial: false,
    grace: 0.55,
    pinned: true,
    ...profile,
  });
  state.superStarSpawned = true;
  tipOnce("super", "СУПЕР ЗВЕЗДА", 1800);
  floatText(x, y - 28, "СУПЕР", "#ff2f45", 18);
}

function spawnComet() {
  const fromLeft = Math.random() < 0.5;
  const y = rand(state.height * 0.18, state.height * 0.78);
  const x = fromLeft ? -20 : state.width + 20;
  const speed = rand(3.2, 4.4);
  const profile = sparkProfile("comet");
  state.sparks.push({
    x,
    y,
    vx: fromLeft ? speed : -speed,
    vy: rand(-0.35, 0.35),
    pulse: Math.random() * Math.PI * 2,
    tutorial: false,
    grace: 0.1,
    ...profile,
  });
}

function spawnSpark(opts = {}) {
  const margin = 42;
  const type = opts.type || rollSparkType();
  const profile = sparkProfile(type);
  let x = rand(margin, state.width - margin);
  let y = rand(margin + 28, state.height - margin);
  if (opts.near) {
    const a = Math.random() * Math.PI * 2;
    const d = rand(90, 160);
    x = clamp(opts.near.x + Math.cos(a) * d, margin, state.width - margin);
    y = clamp(opts.near.y + Math.sin(a) * d, margin, state.height - margin);
  }
  if (opts.edge) {
    const side = Math.floor(Math.random() * 4);
    if (side === 0) { x = rand(margin, state.width - margin); y = margin + 10; }
    else if (side === 1) { x = state.width - margin - 10; y = rand(margin, state.height - margin); }
    else if (side === 2) { x = rand(margin, state.width - margin); y = state.height - margin - 10; }
    else { x = margin + 10; y = rand(margin, state.height - margin); }
  }
  // Never spawn inside the player's eat radius
  if (state.life && dist(x, y, state.life.x, state.life.y) < state.life.r + 48) {
    const a = Math.atan2(y - state.life.y, x - state.life.x) || rand(0, Math.PI * 2);
    x = clamp(state.life.x + Math.cos(a) * 120, margin, state.width - margin);
    y = clamp(state.life.y + Math.sin(a) * 120, margin, state.height - margin);
  }
  state.sparks.push({
    x,
    y,
    vx: rand(-0.55, 0.55),
    vy: rand(-0.55, 0.55),
    pulse: Math.random() * Math.PI * 2,
    tutorial: !!opts.tutorial,
    grace: opts.opening ? 0.05 : 0.35,
    ...profile,
  });
}

function spawnHunter(slow = false) {
  const pad = 26;
  const side = Math.floor(Math.random() * 4);
  let x = 0;
  let y = 0;
  if (side === 0) {
    x = rand(0, state.width);
    y = -pad;
  } else if (side === 1) {
    x = state.width + pad;
    y = rand(0, state.height);
  } else if (side === 2) {
    x = rand(0, state.width);
    y = state.height + pad;
  } else {
    x = -pad;
    y = rand(0, state.height);
  }
  const soft = difficultyScale();
  const anger = (slow ? 0.35 : rand(0.72, 1.08) + Math.min(0.52, state.score * 0.006)) * soft;
  state.hunters.push({
    x,
    y,
    vx: 0,
    vy: 0,
    r: rand(17, 23),
    anger,
    slow,
    warn: slow ? 1 : 0,
    phase: Math.random() * Math.PI * 2,
    nearMissed: false,
    orbit: (state.hunters.length * 2.1) + Math.random() * 1.2,
    orbitR: rand(30, 58),
    orbitSpeed: rand(0.7, 1.25) * (Math.random() < 0.5 ? -1 : 1),
  });
  if (state.running && !state.tipFlags.hunter) tipOnce("hunter", "ХИЩНИК", 1500);
}

function registerNearMiss(hunter, x, y) {
  if (hunter.nearMissed) return;
  hunter.nearMissed = true;
  state.stats.nearMisses += 1;
  floatText(x, y - 18, "мимо", cssVar("--foam", "#f3eee8"), 14);
  tone(880, 0.045, "triangle", 0.02);
  buzz(4);
  state.timeScale = 0.42;
  state.slowmoUntil = performance.now() + 160;
  state.flash = Math.max(state.flash, 0.06);
  if (state.stats.nearMisses === 1 || state.stats.nearMisses % 4 === 0) {
    floatText(x, y - 24, "!", cssVar("--foam", "#fffdf8"), 16);
  }
}

function resetStats() {
  state.stats.sparkEats = 0;
  state.stats.rareEats = 0;
  state.stats.hunterEats = 0;
  state.stats.maxCombo = 0;
  state.stats.nearMisses = 0;
  state.stats.shadowsSpawned = 0;
  state.stats.glyphsTaken = 0;
}

function resetRun() {
  state.time = 0;
  state.elapsed = 0;
  state.score = 0;
  state.combo = 0;
  state.comboClock = 0;
  state.hunger = 100;
  state.theme = 0;
  state.mutation = MUTATIONS[0];
  state.unlockedMuts = ["spark"];
  state.touchActive = false;
  state.pointerId = null;
  state.hasTouchedCanvas = false;
  state.life = null;
  state.echo = null;
  state.guideSpark = null;
  state.sparks = [];
  state.hunters = [];
  state.veins = [];
  state.particles = [];
  state.floaters = [];
  state.spawnAcc = 0;
  state.hunterAcc = 0;
  state.slowHunterSeen = false;
  state.bloomPulse = 0;
  state.flash = 0;
  state.shake = 0;
  state.deathReason = "";
  state.pendingDeathReason = "";
  state.runUnlockedSkins = [];
  state.continuesUsed = 0;
  state.safeUntil = 0;
  state.continueBusy = false;
  state.paused = false;
  state.runMarks = 0;
  state.milestonesHit = [];
  state.hungerWarnClock = 0;
  state.coachCount = 0;
  state.tipFlags = { move: false, hunter: false, hunger: false, echo: false, dive: false, shadow: false, word: false, super: false };
  lastBlastStyle = -1;
  state.event = null;
  state.eventAcc = 0;
  state.eventNext = rand(9, 13);
  state.eventRainAcc = 0;
  state.pulseCd = 0;
  state.holdLifeTime = 0;
  state.fever = false;
  state.stillAcc = 0;
  state.inkDive = 0;
  state.inkDiveCd = 0;
  state.glyphs = [];
  state.glyphIndex = 0;
  state.glyphSpawnAcc = 0;
  state.wordDone = false;
  state.symbiote = null;
  state.openingBurst = false;
  state.firstEatDone = false;
  state.superStarSpawned = false;
  state.superStarEaten = false;
  app.classList.remove("ink-dive");
  setDiveMeter(0);
  resetStats();
  clearHold();
  applyThemeFromScore(false);
  updateScoreUi(false);
  updateHungerUi();
  updateMutationUi();
  renderDaily();
  setEventChip("");
  comboEl.className = "combo";
  toastEl.className = "toast";
  coachEl.className = "coach";
  finalScoreEl.textContent = "0";
  deathReasonEl.textContent = "";
  mutSummaryEl.textContent = "";
  skinResultEl.textContent = "";
  dailyResultEl.textContent = "";
  if (marksResultEl) marksResultEl.textContent = "";
  screenContinueEl?.classList.add("hidden");
  for (let i = 0; i < 2; i += 1) spawnSpark();
  spawnSpark({ tutorial: true, type: "normal", near: { x: state.width * 0.5, y: state.height * 0.42 } });
  state.hunters.push({
    x: -36,
    y: state.height * 0.22,
    vx: 70,
    vy: 10,
    r: 20,
    anger: 0.55,
    slow: true,
    warn: 1,
    phase: Math.random() * Math.PI * 2,
    nearMissed: false,
    parade: true,
  });
  state.slowHunterSeen = true;
}

function resetDemo() {
  state.demo = true;
  state.running = false;
  state.touchActive = false;
  state.pointerId = null;
  state.life = null;
  state.echo = null;
  state.sparks = [];
  state.hunters = [];
  state.veins = [];
  state.particles = [];
  state.floaters = [];
  state.bloomPulse = 0;
  state.demoClock = 0;
  state.demoDownClock = 0;
  applyThemeFromScore(false);
  for (let i = 0; i < 3; i += 1) spawnSpark();
  spawnSpark({ tutorial: true, type: "normal", near: { x: state.width * 0.48, y: state.height * 0.44 } });
  state.hunters.push({
    x: state.width * 0.12,
    y: state.height * 0.28,
    vx: 48,
    vy: 8,
    r: 19,
    anger: 0.4,
    slow: true,
    warn: 0,
    phase: 0,
    nearMissed: true,
    demo: true,
  });
}

function startGame() {
  ensureAudio();
  hum(false);
  touchPlayDay();
  refreshDaily();
  renderDaily();
  updateEconomyLabels();
  screenStartEl.classList.add("hidden");
  screenOverEl.classList.add("hidden");
  screenContinueEl?.classList.add("hidden");
  statusEl.classList.remove("hidden");
  app.classList.add("in-run");
  requestAnimationFrame(() => {
    resize();
    resetRun();
    state.running = true;
    state.paused = false;
    state.demo = false;
    state.lastTs = performance.now();
    showCoach("УДЕРЖИВАЙ", 1700, true);
  });
}

function finishRun(reason) {
  if (!state.running) return;
  state.running = false;
  state.paused = false;
  state.demo = false;
  state.touchActive = false;
  state.pointerId = null;
  state.deathReason = reason;
  hum(false);
  if (inInkDive()) exitInkDive();
  app.classList.remove("ink-dive");
  setDiveMeter(0);
  buzz([20, 40, 36]);
  tone(108, 0.28, "sawtooth", 0.04, 0);
  tone(82, 0.34, "triangle", 0.028, 0.06);
  if (state.life) burst(state.life.x, state.life.y, cssVar("--danger", "#e2556d"), 28, 5.2);
  if (state.echo) burst(state.echo.x, state.echo.y, cssVar("--danger", "#e2556d"), 18, 4.2);
  state.life = null;
  state.echo = null;
  state.symbiote = null;
  state.shake = 10;
  state.flash = 0.22;
  const canContinueDeath =
    reason === DEATH.HUNTER ||
    reason === DEATH.ECHO ||
    reason === DEATH.HUNGER ||
    reason === "твой старый след догнал тебя";
  if (canOfferContinue() && canContinueDeath) {
    showContinueScreen(reason);
    return;
  }
  finalizeGameOver(reason);
}

function tryCompleteByHunger() {
  if (state.hunger <= 0) finishRun(DEATH.HUNGER);
}

function onCanvasDown(e) {
  if (!state.running || state.touchActive) return;
  e.preventDefault();
  ensureAudio();
  state.touchActive = true;
  state.pointerId = e.pointerId;
  state.hasTouchedCanvas = true;
  try {
    canvas.setPointerCapture(e.pointerId);
  } catch (_) {
    // noop
  }
  const p = pointerPos(e);
  createLife(p.x, p.y);
}

function pushVein(x, y) {
  if (!hasMut("veins")) return;
  state.veins.push({
    x,
    y,
    r: rand(7, 12),
    life: 1,
    decay: 0.32,
  });
  if (state.veins.length > 140) state.veins.shift();
}

function onCanvasMove(e) {
  if (!state.running || !state.touchActive || e.pointerId !== state.pointerId || !state.life) return;
  const p = pointerPos(e);
  const prevX = state.life.x;
  const prevY = state.life.y;
  state.life.x = p.x;
  state.life.y = p.y;
  clampLife();
  const moved = dist(prevX, prevY, state.life.x, state.life.y);
  if (moved > 7 && hasMut("veins")) {
    pushVein((prevX + state.life.x) * 0.5, (prevY + state.life.y) * 0.5);
    state.lastVeinX = state.life.x;
    state.lastVeinY = state.life.y;
  }
}

function onCanvasUp(e) {
  if (!state.touchActive) return;
  if (state.pointerId != null && e.pointerId !== state.pointerId) return;
  state.touchActive = false;
  state.pointerId = null;
  if (state.running) releaseLife();
}

function updateSparkMotion(spark, dt) {
  spark.pulse += dt * 5.2;
  if (spark.comet) {
    spark.x += spark.vx * dt * 60;
    spark.y += spark.vy * dt * 60;
    return;
  }
  spark.vx += Math.sin(state.time * 1.3 + spark.y * 0.012) * 0.006;
  spark.vy += Math.cos(state.time * 1.1 + spark.x * 0.01) * 0.004;
  spark.vx *= 0.992;
  spark.vy *= 0.992;
  spark.x += spark.vx * dt * 60;
  spark.y += spark.vy * dt * 60;
  const margin = spark.r + 8;
  if (spark.x < margin || spark.x > state.width - margin) {
    spark.x = clamp(spark.x, margin, state.width - margin);
    spark.vx *= -0.88;
  }
  if (spark.y < margin || spark.y > state.height - margin) {
    spark.y = clamp(spark.y, margin, state.height - margin);
    spark.vy *= -0.88;
  }
}

function updateSparks(dt) {
  const moveFactor = state.life ? clamp((state.life.speed || 0) / 14, 0, 1) : 0;
  // Magnet/veins only help while moving — standing still can't vacuum the map
  const veinPull = hasMut("veins") ? 0.12 * moveFactor : 0;
  const magnetPull = hasMut("magnet") ? 0.14 * moveFactor : 0;
  for (let i = state.sparks.length - 1; i >= 0; i -= 1) {
    const spark = state.sparks[i];
    spark.grace = Math.max(0, (spark.grace || 0) - dt);
    if (spark.comet && (spark.x < -80 || spark.x > state.width + 80)) {
      state.sparks.splice(i, 1);
      continue;
    }
    if (state.life && magnetPull > 0 && !spark.comet && spark.type !== "super") {
      const d = dist(spark.x, spark.y, state.life.x, state.life.y);
      if (d < 200) {
        const force = (1 - d / 200) * magnetPull;
        spark.vx += ((state.life.x - spark.x) / (d || 1)) * force;
        spark.vy += ((state.life.y - spark.y) / (d || 1)) * force;
      }
    }
    if (veinPull > 0 && state.veins.length) {
      let target = null;
      let bestD = 130;
      for (const vein of state.veins) {
        const d = dist(spark.x, spark.y, vein.x, vein.y);
        if (d < bestD) {
          bestD = d;
          target = vein;
        }
      }
      if (target) {
        const force = (1 - bestD / 130) * veinPull;
        spark.vx += ((target.x - spark.x) / (bestD || 1)) * force;
        spark.vy += ((target.y - spark.y) / (bestD || 1)) * force;
      }
    }
    updateSparkMotion(spark, dt);
    if (
      state.life &&
      spark.grace <= 0 &&
      dist(spark.x, spark.y, state.life.x, state.life.y) < state.life.r * 0.72 + spark.r
    ) {
      eatSpark(i, spark);
    }
  }
}

function eatSpark(index, spark) {
  state.sparks.splice(index, 1);
  state.stats.sparkEats += 1;
  if (spark.type === "super") state.superStarEaten = true;
  if (spark.type === "rare" || spark.type === "super") state.stats.rareEats += 1;
  const moveFactor = state.life ? clamp((state.life.speed || 0) / 12, 0.2, 1) : 0.2;
  // AFK / standing eats barely refill hunger — must hunt light
  const restore = spark.restore * (0.35 + 0.65 * moveFactor);
  state.hunger = clamp(state.hunger + restore, 0, 100);
  updateHungerUi();
  if (spark.type === "bait") {
    spawnHunter(false);
    buzz([10, 20, 10]);
  } else if (spark.type === "comet") {
    buzz([8, 12, 8]);
  } else if (spark.type === "deep") {
    buzz(6);
  } else if (spark.type === "seed") {
    attachSymbiote(spark.x, spark.y);
  } else if (spark.type !== "super") {
    buzz(5);
  }
  const openingEat = inOpening() && !state.firstEatDone;
  if (openingEat) {
    state.firstEatDone = true;
    tone(520, 0.08, "triangle", 0.034);
    tone(780, 0.11, "sine", 0.028, 0.07);
    buzz([10, 18, 10]);
    floatText(spark.x, spark.y - 18, "!", cssVar("--gold", "#ffe898"), 22);
  }
  if (state.stats.sparkEats === 1) tipOnce("move", "ТЯНИСЬ К СВЕТУ", 1600);
  playSparkTone(spark.type);
  eatSparkBlast(spark, openingEat);
  addScore(spark.worth, spark.x, spark.y - 12, { color: spark.color });
}

function updateHunters(dt) {
  const soft = difficultyScale();
  if (!inOpening()) {
    const maxHunters = Math.min(7, Math.max(1, Math.floor((2 + Math.floor(state.score / 18)) * soft)));
    state.hunterAcc += dt;
    let interval = Math.max(1.05, 3.4 - state.score * 0.026) / Math.max(0.55, soft);
    if (!state.slowHunterSeen) interval = Math.max(interval, 2.4 + (1 - soft) * 1.2);
    const firstHunterAt = soft < 0.7 ? OPENING_SEC + 0.4 : OPENING_SEC;
    while (state.hunters.length < maxHunters && state.hunterAcc >= interval) {
      state.hunterAcc -= interval;
      if (!state.slowHunterSeen && state.stats.sparkEats > 0) {
        spawnHunter(true);
        state.slowHunterSeen = true;
      } else if (state.elapsed > firstHunterAt) {
        spawnHunter(false);
        if (state.score > 45 && Math.random() < 0.22 * soft && state.hunters.length < maxHunters) spawnHunter(false);
      }
    }
  }

  for (let i = state.hunters.length - 1; i >= 0; i -= 1) {
    const hunter = state.hunters[i];
    hunter.phase += dt * 5;
    if (hunter.shadow) hunter.wobble = (hunter.wobble || 0) + dt * 5.5;
    hunter.warn = Math.max(0, hunter.warn - dt * 1.45);
    if (hunter.parade) {
      if (!inOpening()) {
        hunter.parade = false;
        hunter.slow = false;
        hunter.warn = 1;
        hunter.orbit = (i * 2.15) + Math.random();
        hunter.orbitR = rand(30, 58);
        hunter.orbitSpeed = rand(0.7, 1.2) * (i % 2 === 0 ? -1 : 1);
      } else {
        hunter.x += (hunter.vx || 55) * dt;
        hunter.y += Math.sin(hunter.phase) * 22 * dt;
        if (hunter.x > state.width + 50) {
          hunter.x = -50;
          hunter.y = state.height * (0.18 + Math.random() * 0.28);
        }
        continue;
      }
    }
    let tx = state.width * 0.5;
    let ty = state.height * 0.5;
    if (state.life) {
      const dLife = dist(hunter.x, hunter.y, state.life.x, state.life.y);
      const orbit = hunter.orbit ?? i * 2.1;
      const orbitR = hunter.orbitR ?? 42;
      const orbitSpeed = hunter.orbitSpeed ?? 0.9;
      const angOff = orbit + state.time * orbitSpeed;
      if (dLife > 160) {
        // Far away: chase the player directly.
        tx = state.life.x;
        ty = state.life.y;
      } else {
        // Close in: flank on unique orbits so fish don't stack.
        tx = state.life.x + Math.cos(angOff) * orbitR;
        ty = state.life.y + Math.sin(angOff) * orbitR * 0.85;
      }
    } else if (state.echo) {
      tx = state.echo.x;
      ty = state.echo.y;
    }
    const ang = Math.atan2(ty - hunter.y, tx - hunter.x);
    let speed = (0.95 + state.score * 0.012) * hunter.anger;
    if (hunter.shadow) speed *= 0.9;
    if (hunter.slow) speed *= 0.72;
    if (hasMut("cool") && state.hunger < 50) speed *= 0.85;
    if (activeEventId() === "calm") speed *= 0.62;
    if (activeEventId() === "raid") speed *= 1.12;
    if (inInkDive()) speed *= 0.35;
    hunter.vx += Math.cos(ang) * speed * dt * 3.1;
    hunter.vy += Math.sin(ang) * speed * dt * 3.1;
    // Keep fish apart so they don't pile into one blob.
    for (let j = 0; j < state.hunters.length; j += 1) {
      if (j === i) continue;
      const other = state.hunters[j];
      const gap = dist(hunter.x, hunter.y, other.x, other.y);
      const minGap = hunter.r + other.r + 34;
      if (gap > 0.1 && gap < minGap) {
        const push = ((minGap - gap) / minGap) * 0.55;
        hunter.vx += ((hunter.x - other.x) / gap) * push;
        hunter.vy += ((hunter.y - other.y) / gap) * push;
      }
    }
    hunter.vx *= 0.955;
    hunter.vy *= 0.955;
    hunter.x += hunter.vx * dt * 60;
    hunter.y += hunter.vy * dt * 60;

    if (state.life) {
      const d = dist(hunter.x, hunter.y, state.life.x, state.life.y);
      const killR = hunter.r * 0.72 + state.life.r * 0.75;
      const nearR = killR + 18;
      if (d < nearR && d >= killR) {
        registerNearMiss(hunter, state.life.x, state.life.y);
      } else if (d >= nearR + 24) {
        hunter.nearMissed = false;
      }
      if (d < killR) {
        // First contact with a fish always ends the run.
        finishRun(hunter.shadow ? "твой старый след догнал тебя" : DEATH.HUNTER);
        return;
      }
    } else if (state.echo && !inInkDive()) {
      const d = dist(hunter.x, hunter.y, state.echo.x, state.echo.y);
      const killR = hunter.r * 0.72 + state.echo.r * 0.78;
      if (d < killR + 16 && d >= killR) {
        registerNearMiss(hunter, state.echo.x, state.echo.y);
      }
      if (d < killR) {
        finishRun(DEATH.ECHO);
        return;
      }
    }

    if (hunter.x < -120 || hunter.x > state.width + 120 || hunter.y < -120 || hunter.y > state.height + 120) {
      state.hunters.splice(i, 1);
    }
  }
}

function updateVeins(dt) {
  for (let i = state.veins.length - 1; i >= 0; i -= 1) {
    const vein = state.veins[i];
    vein.life -= dt * vein.decay;
    if (vein.life <= 0) state.veins.splice(i, 1);
  }
}

function updateParticles(dt) {
  for (let i = state.particles.length - 1; i >= 0; i -= 1) {
    const p = state.particles[i];
    p.x += p.vx * dt * 60;
    p.y += p.vy * dt * 60;
    p.vy += (p.grav ?? 0.03) * dt * 60;
    p.vx *= Math.pow(0.992, dt * 60);
    if (p.spin) p.rot = (p.rot || 0) + p.spin * dt * 60;
    p.life -= p.decay * dt * 60;
    if (p.life <= 0) state.particles.splice(i, 1);
  }
  for (let i = state.floaters.length - 1; i >= 0; i -= 1) {
    const f = state.floaters[i];
    f.y += f.vy * dt * 60;
    f.life -= dt * 1.18;
    if (f.life <= 0) state.floaters.splice(i, 1);
  }
}

function updateRun(dt) {
  if (state.paused) {
    updateParticles(dt);
    state.flash = Math.max(0, state.flash - dt * 1.2);
    return;
  }
  state.time += dt;
  state.elapsed += dt;
  state.spawnAcc += dt;
  state.comboClock = Math.max(0, state.comboClock - dt);
  if (state.comboClock <= 0 && state.combo !== 0) {
    state.combo = 0;
    state.fever = false;
  }
  state.pulseCd = Math.max(0, state.pulseCd - dt);
  if (state.life) {
    state.holdLifeTime += dt;
    const prevX = state.life.px ?? state.life.x;
    const prevY = state.life.py ?? state.life.y;
    const moved = dist(state.life.x, state.life.y, prevX, prevY);
    if (moved > 0.6) state.life.aim = Math.atan2(state.life.y - prevY, state.life.x - prevX);
    state.life.speed = (state.life.speed || 0) * 0.78 + moved * 0.22;
    state.life.px = state.life.x;
    state.life.py = state.life.y;
    state.life.wobble += dt * 7.2;
    state.life.r = 17 + Math.min(4, state.combo * 0.45) + Math.sin(state.life.wobble) * 0.8;
    if (state.fever) state.life.r += 1.4;
    state.life.teeth = hasMut("fang") && state.combo >= 4 ? Math.min(1, state.life.teeth + dt * 3) : Math.max(0, state.life.teeth - dt * 3);
    clampLife();
    updateHum();
  } else if (state.echo) {
    state.echo.wobble += dt * 4.2;
    state.echo.life = Math.max(0, (state.echo.life ?? 1) - dt / ECHO_FADE_SEC);
    state.echo.r = Math.max(8, state.echo.r * (1 - dt * 0.08));
    if (state.echo.life <= 0) {
      maybeAwakenEcho();
      state.echo = null;
    }
  }
  state.guideSpark = state.life ? nearestSpark(state.life.x, state.life.y) : null;
  updateWeirdSystems(dt);
  // Standing still drains hunger faster — except while charging / inside ink dive
  const chargingDive = !!state.life && state.stillAcc > 0.15 && !inInkDive();
  const stillPenalty = state.life && (state.life.speed || 0) < 6 && !chargingDive && !inInkDive() ? 1.55 : 1;
  const calmMul = activeEventId() === "calm" ? 0.55 : 1;
  const diveMul = inInkDive() ? 0.72 : 1;
  if (state.life) {
    state.hunger -= HUNGER_DRAIN_PER_SEC * dt * (hasMut("cool") ? 0.7 : 1) * stillPenalty * calmMul * diveMul * (inOpening() ? 0.72 : 1);
    state.hunger = Math.max(0, state.hunger);
  }
  updateHungerUi();
  if (state.hunger < 18 && state.life) {
    state.hungerWarnClock -= dt;
    if (state.hungerWarnClock <= 0) {
      state.hungerWarnClock = 0.55;
      buzz(6);
      tone(140 + (18 - state.hunger) * 4, 0.05, "triangle", 0.018);
    }
  } else {
    state.hungerWarnClock = 0;
  }
  updateParticles(dt);
  const opening = inOpening();
  const targetSparkCount = opening ? 3 : 4 + Math.min(2, Math.floor(state.score / 120));
  const spawnInterval = opening ? 1.6 : 0.95;
  while (state.spawnAcc >= spawnInterval) {
    state.spawnAcc -= spawnInterval;
    if (state.sparks.length < targetSparkCount) {
      spawnSpark({
        edge: true,
        opening,
        type: !opening && Math.random() < 0.08 ? "rare" : null,
      });
    }
  }
  maybeSpawnSuperStar();
  updateSparks(dt);
  tryCompleteByHunger();
  if (!state.running) return;
  updateRunEvents(dt);
  updateHunters(dt);
  if (!state.running) return;
  updateVeins(dt);
  updateParticles(dt);
  state.bloomPulse = Math.max(0, state.bloomPulse - dt * 0.85);
  state.flash = Math.max(0, state.flash - dt * 1.9);
  state.shake *= Math.pow(0.9, dt * 60);
}

function updateDemo(dt) {
  state.time += dt;
  state.demoClock += dt;
  if (state.sparks.length < 4 && Math.random() < 0.025) spawnSpark();
  for (const spark of state.sparks) updateSparkMotion(spark, dt * 0.7);
  for (const hunter of state.hunters) {
    hunter.phase += dt * 4;
    hunter.x += (hunter.vx || 40) * dt;
    hunter.y += Math.sin(hunter.phase) * 18 * dt;
    if (hunter.x > state.width + 40) {
      hunter.x = -40;
      hunter.y = state.height * (0.22 + Math.random() * 0.35);
    }
  }
  if (state.life) {
    state.life.wobble += dt * 6;
    state.life.x = state.width * 0.5 + Math.sin(state.demoClock * 1.35) * state.width * 0.17;
    state.life.y = state.height * 0.58 + Math.cos(state.demoClock * 0.92) * state.height * 0.07;
    state.life.r = 16 + Math.sin(state.demoClock * 2.8) * 0.8;
    for (let i = state.sparks.length - 1; i >= 0; i -= 1) {
      const spark = state.sparks[i];
      if (dist(spark.x, spark.y, state.life.x, state.life.y) < state.life.r * 0.72 + spark.r) {
        burst(spark.x, spark.y, spark.color, 8, 3);
        state.sparks.splice(i, 1);
        if (state.sparks.length < 4) spawnSpark();
      }
    }
    state.demoDownClock -= dt;
    if (state.demoDownClock <= 0) {
      state.echo = {
        x: state.life.x,
        y: state.life.y,
        r: state.life.r * 0.9,
        wobble: state.life.wobble,
        aim: state.life.aim ?? -Math.PI / 2,
      };
      state.life = null;
      state.demoDownClock = rand(0.5, 0.9);
    }
  } else {
    if (state.echo) state.echo.wobble += dt * 4;
    state.demoDownClock -= dt;
    if (state.demoDownClock <= 0) {
      createLife(state.width * 0.45, state.height * 0.58, { silent: true });
      state.demoDownClock = rand(1.4, 2.1);
    }
  }
  updateParticles(dt);
  state.flash = Math.max(0, state.flash - dt * 1.6);
}

function updateOver(dt) {
  state.time += dt;
  updateParticles(dt);
  state.flash = Math.max(0, state.flash - dt * 1.4);
  state.shake *= Math.pow(0.9, dt * 60);
}

function lifeInkColor() {
  const base = activeSkin().color;
  if (state.hunger >= 65) return base;
  if (state.hunger >= 30) return mixColor(base, cssVar("--gold", "#e6c07b"), clamp((65 - state.hunger) / 35, 0, 1));
  return mixColor(base, cssVar("--danger", "#e2556d"), clamp((30 - state.hunger) / 30, 0, 1));
}

function drawOceanBackground() {
  const w = state.width;
  const h = state.height;
  const t = state.time;
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  if (inInkDive()) {
    grad.addColorStop(0, "#041828");
    grad.addColorStop(0.5, "#0a2848");
    grad.addColorStop(1, "#121438");
  } else {
    grad.addColorStop(0, "#0c2248");
    grad.addColorStop(0.45, "#081830");
    grad.addColorStop(1, "#040c1c");
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  const glow = ctx.createRadialGradient(w * 0.5, h * 0.42, 20, w * 0.5, h * 0.5, Math.max(w, h) * 0.7);
  glow.addColorStop(0, `rgba(40, 120, 200, ${0.1 + Math.sin(t * 1.4) * 0.025})`);
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  const vignette = ctx.createRadialGradient(w * 0.5, h * 0.5, Math.min(w, h) * 0.28, w * 0.5, h * 0.5, Math.max(w, h) * 0.72);
  vignette.addColorStop(0, "transparent");
  vignette.addColorStop(1, "rgba(0, 4, 16, 0.45)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
}

function drawBackground() {
  drawOceanBackground();
  if (state.bloomPulse > 0) {
    ctx.fillStyle = cssVar("--gold", "#ffe08a");
    ctx.globalAlpha = state.bloomPulse * 0.08;
    ctx.fillRect(0, 0, state.width, state.height);
    ctx.globalAlpha = 1;
  }
  if (state.fever) {
    ctx.fillStyle = cssVar("--ember", "#ff8a52");
    ctx.globalAlpha = 0.08 + Math.sin(state.time * 7) * 0.03;
    ctx.fillRect(0, 0, state.width, state.height);
    ctx.globalAlpha = 1;
  }
}

function drawGlyphs() {
  for (const g of state.glyphs) {
    const pulse = 1 + Math.sin(g.pulse) * 0.08;
    ctx.save();
    ctx.globalAlpha = 0.35 + g.life * 0.55;
    ctx.fillStyle = g.index === state.glyphIndex ? cssVar("--gold", "#e6c07b") : cssVar("--sand", "#a89b90");
    ctx.font = `800 ${Math.round(22 * pulse)}px Syne, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(g.ch, g.x, g.y);
    ctx.strokeStyle = "rgba(243,238,232,0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(g.x, g.y, 16 * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawSymbiote() {
  if (!state.symbiote || !state.life) return;
  const ang = state.symbiote.ang;
  const x = state.life.x + Math.cos(ang) * (state.life.r + 14);
  const y = state.life.y + Math.sin(ang) * (state.life.r + 14);
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = "#9cf0d0";
  ctx.beginPath();
  ctx.arc(x, y, 4.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawVeins() {
  for (const vein of state.veins) {
    ctx.save();
    ctx.globalAlpha = 0.16 * vein.life;
    ctx.strokeStyle = cssVar("--life", "#6fd9b0");
    ctx.lineWidth = 1.2;
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    ctx.arc(vein.x, vein.y, vein.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawLightShard(x, y, r, color, rot, alpha = 1, kind = "normal") {
  const isSuper = kind === "super";
  const isRare = kind === "rare" || isSuper;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha * 0.35;
  const glow = ctx.createRadialGradient(0, 0, r * 0.1, 0, 0, r * (isSuper ? 2.4 : 1.85));
  glow.addColorStop(0, mixColor(color, "#ffffff", 0.55));
  glow.addColorStop(0.45, color);
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, r * (isSuper ? 2.4 : 1.85), 0, Math.PI * 2);
  ctx.fill();
  if (isSuper) {
    ctx.globalAlpha = alpha * 0.55;
    ctx.strokeStyle = mixColor(color, "#ffffff", 0.4);
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 6; i += 1) {
      const a = (i / 6) * Math.PI * 2 + state.time * 1.6;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5);
      ctx.lineTo(Math.cos(a) * r * 2.1, Math.sin(a) * r * 2.1);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = alpha;
  const points = isSuper ? 12 : 8;
  const outer = ctx.createLinearGradient(-r, -r, r, r);
  outer.addColorStop(0, mixColor(color, "#ffffff", 0.55));
  outer.addColorStop(0.45, color);
  outer.addColorStop(1, mixColor(color, "#804018", 0.2));
  ctx.fillStyle = outer;
  ctx.beginPath();
  for (let i = 0; i < points; i += 1) {
    const a = (i / points) * Math.PI * 2 - Math.PI / 2;
    const long = i % 2 === 0;
    const rad = long ? r : r * (isSuper ? 0.42 : 0.34);
    const px = Math.cos(a) * rad;
    const py = Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = mixColor(color, "#ffffff", isRare ? 0.55 : 0.3);
  ctx.lineWidth = isSuper ? 2.4 : 1.7;
  ctx.globalAlpha = alpha * 0.9;
  ctx.stroke();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = mixColor(color, "#ffffff", 0.5);
  ctx.beginPath();
  for (let i = 0; i < 4; i += 1) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const rad = r * 0.42;
    const px = Math.cos(a) * rad;
    const py = Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.beginPath();
  ctx.arc(-r * 0.12, -r * 0.14, Math.max(1.5, r * 0.16), 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = alpha * 0.75;
  ctx.fillStyle = mixColor(color, "#ffffff", 0.65);
  for (let i = 0; i < (isSuper ? 4 : 2); i += 1) {
    const a = state.time * (1.8 + i) + i * 1.7;
    const pr = r * (0.55 + (i % 2) * 0.2);
    ctx.beginPath();
    ctx.arc(Math.cos(a) * pr, Math.sin(a) * pr, Math.max(1, r * 0.08), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function inkPolypBodyPath(s) {
  ctx.beginPath();
  ctx.ellipse(s * 0.08, 0, s * 0.92, s * 0.78, 0, 0, Math.PI * 2);
}

function drawOctopusTentacle(s, wob, i, ink, accent, alpha) {
  const side = i < 4 ? -1 : 1;
  const rank = i % 4;
  const baseY = side * s * (0.18 + rank * 0.2);
  const curl = Math.sin(wob * 1.35 + i * 0.9) * s * 0.42;
  const wave = Math.cos(wob * 1.1 + i * 0.7) * s * 0.28;
  const len = s * (1.55 + rank * 0.12 + Math.sin(wob + i) * 0.12);
  const midX = -s * (0.55 + rank * 0.08) + wave * 0.35;
  const midY = baseY * 1.45 + curl * 0.55;
  const tipX = -len;
  const tipY = baseY * 1.1 + curl + Math.sin(wob * 1.6 + i) * s * 0.2;
  const width = Math.max(2.4, s * (0.22 - rank * 0.02));
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalAlpha = alpha * (0.78 + rank * 0.04);
  ctx.strokeStyle = mixColor(ink, accent, 0.12 + rank * 0.05);
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(-s * 0.05, baseY * 0.55);
  ctx.bezierCurveTo(midX, midY, tipX + s * 0.35, tipY - curl * 0.2, tipX, tipY);
  ctx.stroke();
  ctx.globalAlpha = alpha * 0.55;
  ctx.strokeStyle = mixColor(ink, "#2a1830", 0.35);
  ctx.lineWidth = Math.max(1.2, width * 0.42);
  ctx.beginPath();
  ctx.moveTo(-s * 0.02, baseY * 0.55 + width * 0.18);
  ctx.bezierCurveTo(midX, midY + width * 0.15, tipX + s * 0.32, tipY - curl * 0.15, tipX + s * 0.04, tipY);
  ctx.stroke();
  ctx.fillStyle = mixColor(ink, "#fff0e0", 0.35);
  for (let k = 0; k < 5; k += 1) {
    const t = 0.22 + k * 0.14;
    const sx = -s * 0.05 * (1 - t) + midX * (1 - t) * 0.55 + tipX * t;
    const sy = baseY * 0.55 * (1 - t) + midY * (1 - t) * 0.45 + tipY * t;
    const sr = Math.max(1.1, width * (0.28 - k * 0.03));
    ctx.globalAlpha = alpha * (0.55 - k * 0.06);
    ctx.beginPath();
    ctx.ellipse(sx, sy + width * 0.12, sr, sr * 0.72, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawInkPolyp(body, alpha = 1) {
  const ink = lifeInkColor();
  const accent = cssVar("--accent-a", "#ff9a62");
  const accentB = cssVar("--accent-b", "#7affd4");
  const aim = body.aim ?? -Math.PI / 2;
  const s = body.r;
  const wob = body.wobble;
  ctx.save();
  ctx.translate(body.x, body.y);
  ctx.rotate(aim);
  for (let i = 0; i < 8; i += 1) {
    drawOctopusTentacle(s, wob, i, ink, accentB, alpha);
  }
  if ((body.speed || 0) > 5) {
    ctx.globalAlpha = alpha * 0.28;
    ctx.fillStyle = mixColor(ink, accentB, 0.4);
    ctx.beginPath();
    ctx.ellipse(-s * 1.15, 0, s * 0.55, s * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = alpha;
  const mantle = ctx.createRadialGradient(s * 0.12, -s * 0.18, s * 0.1, s * 0.05, 0, s * 0.95);
  mantle.addColorStop(0, mixColor(ink, "#fff4e8", 0.28));
  mantle.addColorStop(0.45, mixColor(ink, accent, 0.12));
  mantle.addColorStop(1, mixColor(ink, "#1a1020", 0.28));
  ctx.fillStyle = mantle;
  ctx.strokeStyle = mixColor(ink, "#140818", 0.25);
  ctx.lineWidth = 2.4;
  inkPolypBodyPath(s);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = mixColor(ink, accentB, 0.18);
  ctx.globalAlpha = alpha * 0.55;
  for (let i = 0; i < 10; i += 1) {
    const a = i * 0.62 + wob * 0.2;
    const pr = s * (0.18 + (i % 3) * 0.08);
    const px = Math.cos(a) * s * (0.22 + (i % 4) * 0.1);
    const py = Math.sin(a * 1.1) * s * (0.18 + (i % 3) * 0.08);
    ctx.beginPath();
    ctx.ellipse(px, py, pr * 0.35, pr * 0.28, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = alpha;
  ctx.fillStyle = mixColor(ink, "#2a1428", 0.35);
  ctx.beginPath();
  ctx.ellipse(-s * 0.55, s * 0.08, s * 0.18, s * 0.12, 0.2, 0, Math.PI * 2);
  ctx.fill();
  const blink = Math.sin(wob * 0.32) > 0.93 ? 0.2 : 1;
  for (const side of [-1, 1]) {
    const ex = s * 0.38;
    const ey = side * s * 0.28;
    ctx.fillStyle = "#fffdf8";
    ctx.beginPath();
    ctx.ellipse(ex, ey, s * 0.2, s * 0.24 * blink, side * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = mixColor(accentB, "#1a2840", 0.35);
    ctx.beginPath();
    ctx.ellipse(ex + s * 0.04, ey, s * 0.11, s * 0.13 * blink, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#120818";
    ctx.beginPath();
    ctx.arc(ex + s * 0.06, ey, s * 0.07 * blink, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(ex + s * 0.09, ey - s * 0.05, s * 0.035, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = mixColor(ink, "#1a1020", 0.4);
    ctx.lineWidth = Math.max(1.4, s * 0.05);
    ctx.beginPath();
    ctx.arc(ex - s * 0.02, ey - s * 0.2, s * 0.16, Math.PI * 1.1, Math.PI * 1.85);
    ctx.stroke();
  }
  ctx.fillStyle = mixColor(ink, accent, 0.35);
  ctx.globalAlpha = alpha * 0.9;
  ctx.beginPath();
  ctx.moveTo(s * 0.75, -s * 0.08);
  ctx.quadraticCurveTo(s * 1.15, 0, s * 0.75, s * 0.1);
  ctx.quadraticCurveTo(s * 0.62, 0, s * 0.75, -s * 0.08);
  ctx.fill();
  if (state.fever) {
    ctx.strokeStyle = cssVar("--ember", "#ff9a62");
    ctx.lineWidth = 1.8;
    ctx.globalAlpha = alpha * (0.45 + Math.sin(state.time * 9) * 0.2);
    inkPolypBodyPath(s * 1.08);
    ctx.stroke();
  }
  if (hasMut("fang") && state.combo >= 4) {
    ctx.strokeStyle = cssVar("--danger", "#ff5d7a");
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.globalAlpha = alpha * 0.95;
    ctx.beginPath();
    ctx.moveTo(s * 0.95, -s * 0.08);
    ctx.lineTo(s * 1.35, -s * 0.18);
    ctx.moveTo(s * 0.95, s * 0.08);
    ctx.lineTo(s * 1.35, s * 0.18);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSpark(spark) {
  const pulse = 1 + Math.sin(spark.pulse) * 0.08;
  const r = spark.r * pulse;
  const rot = spark.pulse * 0.35 + (spark.comet ? Math.atan2(spark.vy, spark.vx || 0.001) : 0);
  if (spark.comet) {
    const ang = Math.atan2(spark.vy, spark.vx || 0.001);
    ctx.save();
    ctx.translate(spark.x, spark.y);
    ctx.rotate(ang);
    const trail = ctx.createLinearGradient(-32, 0, 12, 0);
    trail.addColorStop(0, "transparent");
    trail.addColorStop(0.65, spark.color);
    trail.addColorStop(1, mixColor(spark.color, "#fff4d8", 0.28));
    ctx.fillStyle = trail;
    ctx.globalAlpha = 0.95;
    ctx.beginPath();
    ctx.moveTo(-32, 0);
    ctx.lineTo(8, -5);
    ctx.lineTo(8, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  if (spark.type === "seed") {
    ctx.save();
    ctx.translate(spark.x, spark.y);
    ctx.rotate(rot);
    ctx.fillStyle = spark.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.55, r, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = mixColor(spark.color, "#ffffff", 0.3);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.1);
    ctx.lineTo(0, r * 0.35);
    ctx.stroke();
    ctx.restore();
  } else {
    const kind = spark.type === "super" ? "super" : spark.type === "rare" ? "rare" : "normal";
    drawLightShard(spark.x, spark.y, r, spark.color, rot, 1, kind);
  }
  if (spark.type === "super") {
    const t = (state.time * 1.8) % 1;
    ctx.globalAlpha = (1 - t) * 0.7;
    ctx.strokeStyle = "#ff2f45";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(spark.x, spark.y, r * (1.55 + t * 1.5), 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = "#ff7a88";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(spark.x, spark.y, r * 1.28, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = "#ff2f45";
    ctx.font = "800 13px Syne, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("СУПЕР", spark.x, spark.y - r * 1.7);
    ctx.globalAlpha = 1;
  } else if (spark.type === "rare" || spark.comet || spark.deep) {
    ctx.strokeStyle = spark.deep ? "#90e8ff" : "#ffe070";
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.arc(spark.x, spark.y, r * 1.35, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  if (spark.tutorial) {
    const t = (state.time * 1.4) % 1;
    for (let i = 0; i < 2; i += 1) {
      const phase = (t + i * 0.5) % 1;
      ctx.globalAlpha = (1 - phase) * 0.5;
      ctx.strokeStyle = spark.color;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(spark.x, spark.y, r * (1.4 + phase * 2), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}

function drawEvilFish(hunter, alpha = 1, ghost = false) {
  const angle = Math.atan2(hunter.vy || 0.001, hunter.vx || 0.001);
  const r = hunter.r * (ghost ? 1.05 : 1);
  const wobble = Math.sin(hunter.phase || 0) * 0.1;
  if (PHOTOS.fish.ready) {
    const img = PHOTOS.fish.img;
    const fishW = r * 4.8;
    const fishH = r * 2.45;
    ctx.save();
    ctx.translate(hunter.x, hunter.y);
    ctx.rotate(angle + wobble);
    ctx.globalAlpha = alpha;
    if (ghost) {
      ctx.filter = "brightness(1.35) saturate(0.35)";
    }
    ctx.drawImage(img, -fishW * 0.52, -fishH * 0.5, fishW, fishH);
    ctx.restore();
    return;
  }
  ctx.save();
  ctx.translate(hunter.x, hunter.y);
  ctx.rotate(angle + wobble);
  ctx.globalAlpha = alpha;
  if (ghost) {
    ctx.strokeStyle = cssVar("--foam", "#fffdf8");
    ctx.lineWidth = 1.8;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.moveTo(-r * 1.1, 0);
    ctx.lineTo(-r * 1.8, -r * 0.5);
    ctx.lineTo(-r * 1.4, 0);
    ctx.lineTo(-r * 1.8, r * 0.5);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.05, r * 0.72, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    return;
  }
  const body = cssVar("--danger", "#ff6888");
  const dark = mixColor(body, "#6a1028", 0.35);
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.moveTo(-r * 1.05, 0);
  ctx.lineTo(-r * 1.75, -r * 0.58);
  ctx.lineTo(-r * 1.35, 0);
  ctx.lineTo(-r * 1.75, r * 0.58);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 1.08, r * 0.74, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = mixColor(body, "#ffc0c8", 0.42);
  ctx.beginPath();
  ctx.ellipse(r * 0.08, r * 0.18, r * 0.52, r * 0.34, 0.15, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = mixColor(body, "#901838", 0.3);
  ctx.beginPath();
  ctx.moveTo(-r * 0.2, -r * 0.62);
  ctx.lineTo(r * 0.08, -r * 1.18);
  ctx.lineTo(r * 0.32, -r * 0.52);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(r * 0.02, r * 0.42);
  ctx.lineTo(-r * 0.38, r * 0.98);
  ctx.lineTo(-r * 0.08, r * 0.38);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fff8f0";
  ctx.beginPath();
  ctx.arc(r * 0.44, -r * 0.17, r * 0.23, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#180810";
  ctx.beginPath();
  ctx.arc(r * 0.5, -r * 0.15, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff2848";
  ctx.beginPath();
  ctx.arc(r * 0.54, -r * 0.19, r * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#180810";
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(r * 0.28, -r * 0.4);
  ctx.lineTo(r * 0.62, -r * 0.3);
  ctx.stroke();
  ctx.fillStyle = "#fffaf2";
  for (let i = 0; i < 4; i += 1) {
    const tx = r * 0.68 + i * r * 0.09;
    ctx.beginPath();
    ctx.moveTo(tx, r * 0.06);
    ctx.lineTo(tx + r * 0.07, r * 0.24);
    ctx.lineTo(tx + r * 0.14, r * 0.04);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawHunter(hunter) {
  if (hunter.shadow) {
    ctx.save();
    drawEvilFish(hunter, inInkDive() ? 0.2 : 0.68, true);
    ctx.restore();
    return;
  }
  drawEvilFish(hunter, inInkDive() ? 0.28 : 1, false);
  if (hunter.warn > 0 && !inInkDive()) {
    ctx.save();
    ctx.globalAlpha = hunter.warn * 0.5;
    ctx.strokeStyle = cssVar("--danger", "#ff6888");
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(hunter.x, hunter.y, hunter.r * (1.55 + (1 - hunter.warn) * 1.6), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawLifeBody(body, alpha = 1) {
  drawInkPolyp(body, alpha);
}

function drawEcho() {
  if (!state.echo) return;
  const fade = clamp(state.echo.life ?? 1, 0, 1);
  const ink = lifeInkColor();
  const s = state.echo.r;
  const aim = state.echo.aim ?? -Math.PI / 2;
  ctx.save();
  ctx.translate(state.echo.x, state.echo.y);
  ctx.rotate(aim);
  ctx.globalAlpha = 0.1 + fade * 0.3;
  ctx.strokeStyle = mixColor(ink, cssVar("--foam", "#fffdf8"), 0.45);
  ctx.lineWidth = 2.2;
  ctx.setLineDash([5, 7]);
  inkPolypBodyPath(s);
  ctx.stroke();
  for (let i = 0; i < 3; i += 1) {
    const spread = (i - 1) * 0.42;
    ctx.beginPath();
    ctx.moveTo(-s * 0.1, spread * s * 0.45);
    ctx.quadraticCurveTo(-s * 0.75, spread * s * 0.9, -s * 0.95, spread * s * 0.7);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.restore();
}

function drawSafeShield() {
  // No rings around the octopus.
}

function drawHungerVignette() {
  if (!state.running) return;
  if (state.fever) {
    const e = hexToRgb(cssVar("--ember", "#ff8a52"));
    ctx.fillStyle = `rgba(${e[0]}, ${e[1]}, ${e[2]}, ${0.08 + Math.sin(state.time * 8) * 0.03})`;
    ctx.fillRect(0, 0, state.width, state.height);
  }
  if (activeEventId() === "calm") {
    const l = hexToRgb(cssVar("--life", "#6ff0c4"));
    ctx.fillStyle = `rgba(${l[0]}, ${l[1]}, ${l[2]}, 0.07)`;
    ctx.fillRect(0, 0, state.width, state.height);
  }
  if (activeEventId() === "rain") {
    const g = hexToRgb(cssVar("--gold", "#ffe08a"));
    ctx.fillStyle = `rgba(${g[0]}, ${g[1]}, ${g[2]}, 0.06)`;
    ctx.fillRect(0, 0, state.width, state.height);
  }
  if (state.hunger >= 28 || !state.life) return;
  const strength = clamp((28 - state.hunger) / 28, 0, 1);
  const grad = ctx.createRadialGradient(
    state.width * 0.5,
    state.height * 0.5,
    Math.min(state.width, state.height) * 0.28,
    state.width * 0.5,
    state.height * 0.5,
    Math.max(state.width, state.height) * 0.72
  );
  grad.addColorStop(0, "transparent");
  grad.addColorStop(1, `rgba(226, 85, 109, ${0.08 + strength * 0.28})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, state.width, state.height);
}

function drawPauseHint() {
  if (!state.paused || !state.running) return;
  ctx.save();
  ctx.fillStyle = "rgba(12,10,14,0.34)";
  ctx.fillRect(0, 0, state.width, state.height);
  ctx.fillStyle = "rgba(243,238,232,0.82)";
  ctx.font = "700 14px Instrument Sans, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("пауза", state.width * 0.5, state.height * 0.48);
  ctx.restore();
}

function drawGuide() {
  if (!state.running || !state.life || !state.guideSpark || state.score >= 5) return;
  ctx.save();
  ctx.globalAlpha = 0.34 + Math.sin(state.time * 4) * 0.08;
  ctx.strokeStyle = cssVar("--gold", "#e6c07b");
  ctx.lineWidth = 1.4;
  ctx.setLineDash([6, 8]);
  ctx.beginPath();
  ctx.moveTo(state.life.x, state.life.y);
  ctx.lineTo(state.guideSpark.x, state.guideSpark.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(state.guideSpark.x, state.guideSpark.y, state.guideSpark.r * 1.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawHoldHint() {
  const cx = state.width * 0.5;
  const cy = state.height * 0.56;
  const s = 34;
  const pulse = 0.33 + Math.sin(state.time * 2.9) * 0.11;
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.strokeStyle = cssVar("--foam", "#f3eee8");
  ctx.lineWidth = 1.5;
  const corners = [
    [cx - s, cy - s, 1, 1],
    [cx + s, cy - s, -1, 1],
    [cx - s, cy + s, 1, -1],
    [cx + s, cy + s, -1, -1],
  ];
  for (const [x, y, dx, dy] of corners) {
    ctx.beginPath();
    ctx.moveTo(x, y + dy * 14);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dx * 14, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.58;
  ctx.fillStyle = cssVar("--sand", "#a89b90");
  ctx.font = "600 12px Instrument Sans, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("удерживай", cx, cy + s + 28);
  ctx.restore();
}

function drawParticles() {
  for (const p of state.particles) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    const kind = p.kind || "dot";
    if (kind === "streak") {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot || Math.atan2(p.vy, p.vx || 0.001));
      ctx.fillRect(-p.size * 1.6, -p.size * 0.28, p.size * 3.2, p.size * 0.56);
      ctx.restore();
    } else if (kind === "shard") {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot || 0);
      ctx.beginPath();
      ctx.moveTo(p.size, 0);
      ctx.lineTo(0, p.size * 0.55);
      ctx.lineTo(-p.size * 0.7, 0);
      ctx.lineTo(0, -p.size * 0.55);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (kind === "bloom") {
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.size, p.size * 0.62, p.rot || 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === "ring") {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = Math.max(1.2, p.size * 0.45);
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(1.5, p.size), 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(1.2, p.size * 0.85), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = mixColor(p.color, "#ffffff", 0.35);
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.6, p.size * 0.4), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  for (const f of state.floaters) {
    ctx.globalAlpha = Math.max(0, f.life);
    ctx.fillStyle = f.color;
    ctx.shadowColor = f.color;
    ctx.shadowBlur = 6;
    ctx.font = `800 ${f.size}px Syne, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(f.text, f.x, f.y);
    ctx.shadowBlur = 0;
  }
  ctx.globalAlpha = 1;
}

function drawOpeningPulse() {
  // No rotating rings around the octopus.
}

function draw() {
  const sx = (Math.random() - 0.5) * state.shake;
  const sy = (Math.random() - 0.5) * state.shake;
  ctx.save();
  ctx.translate(sx, sy);
  drawBackground();
  drawVeins();
  drawGlyphs();
  for (const spark of state.sparks) drawSpark(spark);
  for (const hunter of state.hunters) drawHunter(hunter);
  drawEcho();
  drawGuide();
  if (state.life) {
    drawSafeShield();
    drawLifeBody(state.life);
    drawSymbiote();
  } else if (state.running && !state.hasTouchedCanvas) {
    drawHoldHint();
  } else if (!state.running && state.demo && state.life) {
    drawLifeBody(state.life, 0.86);
  }
  drawParticles();
  drawOpeningPulse();
  drawHungerVignette();
  if (state.flash > 0) {
    const flashRgb = hexToRgb(cssVar("--gold", "#ffe08a"));
    const strength = Math.min(0.72, state.flash * (state.flash > 0.7 ? 0.55 : 0.22));
    ctx.fillStyle = `rgba(${flashRgb[0]},${flashRgb[1]},${flashRgb[2]},${strength})`;
    ctx.fillRect(0, 0, state.width, state.height);
    if (state.flash > 0.7) {
      ctx.fillStyle = `rgba(255,255,255,${Math.min(0.35, (state.flash - 0.7) * 0.5)})`;
      ctx.fillRect(0, 0, state.width, state.height);
    }
  }
  drawPauseHint();
  ctx.restore();
}

function frame(ts) {
  const rawDt = Math.min(0.033, (ts - (state.lastTs || ts)) / 1000 || 0.016);
  state.lastTs = ts;
  if (state.slowmoUntil && ts >= state.slowmoUntil) {
    state.timeScale = 1;
    state.slowmoUntil = 0;
  }
  const dt = rawDt * (state.running ? state.timeScale || 1 : 1);
  if (state.hold && !state.running) {
    state.hold.progress = clamp(state.hold.progress + rawDt / HOLD_SECONDS, 0, 1);
    const width = `${Math.round(state.hold.progress * 100)}%`;
    setHoldVisual(width, state.hold.target);
    if (state.hold.progress >= 1) {
      clearHold();
      startGame();
    }
  }
  if (state.running) {
    updateRun(dt);
  } else if (!screenStartEl.classList.contains("hidden") && screenOnboardEl?.classList.contains("hidden")) {
    updateDemo(dt);
  } else {
    updateOver(dt);
  }
  draw();
  requestAnimationFrame(frame);
}

function boot() {
  loadPhotos();
  state.meta = loadMeta();
  saveMeta();
  touchPlayDay();
  refreshDaily();
  state.best = state.meta.best;
  updateBestLabels();
  renderDaily();
  renderSkinMeta();
  updateEconomyLabels();
  resize();
  applyThemeFromScore(false);
  updateScoreUi(false);
  updateHungerUi();
  updateMutationUi();
  resetDemo();
  bindHoldButton(btnStart, "start");
  bindHoldButton(btnRetry, "retry");
  canvas.addEventListener("pointerdown", onCanvasDown, { passive: false });
  canvas.addEventListener("pointermove", onCanvasMove, { passive: false });
  canvas.addEventListener("pointerup", onCanvasUp, { passive: false });
  canvas.addEventListener("pointercancel", onCanvasUp, { passive: false });
  btnContinue?.addEventListener("click", (e) => {
    e.preventDefault();
    requestContinue();
  });
  btnSkipContinue?.addEventListener("click", () => {
    if (!state.pendingDeathReason) return;
    finalizeGameOver(state.pendingDeathReason);
  });
  btnShare?.addEventListener("click", () => {
    shareRun().catch(() => showToast("не удалось поделиться"));
  });
  btnRate?.addEventListener("click", () => {
    requestReview().catch(() => {});
  });
  btnOnboard?.addEventListener("click", () => advanceOnboard());
  btnSound?.addEventListener("click", () => {
    if (!state.meta) return;
    state.meta.sound = !(state.meta.sound !== false);
    if (!state.meta.sound) hum(false);
    saveMeta();
    renderSettings();
    showToast(state.meta.sound ? "звук вкл" : "звук выкл");
  });
  btnHaptics?.addEventListener("click", () => {
    if (!state.meta) return;
    state.meta.haptics = !(state.meta.haptics !== false);
    saveMeta();
    renderSettings();
    if (state.meta.haptics) buzz(8);
    showToast(state.meta.haptics ? "вибро вкл" : "вибро выкл");
  });
  btnMarksPack?.addEventListener("click", () => {
    purchaseMarksPack().catch(() => showToast("покупка недоступна"));
  });
  window.addEventListener("resize", resize);
  const pauseForBackground = () => {
    if (state.touchActive) {
      state.touchActive = false;
      state.pointerId = null;
    }
    if (state.running && !state.pendingDeathReason) {
      state.life = null;
      state.echo = null;
      state.paused = true;
      hum(false);
    }
  };
  const resumeFromBackground = () => {
    state.lastTs = performance.now();
    if (state.paused && state.running) {
      state.paused = false;
      state.safeUntil = performance.now() + 1200;
      showToast("удерживай снова");
    }
  };
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pauseForBackground();
    else resumeFromBackground();
  });
  document.addEventListener("ottisk-app-state", (event) => {
    if (event.detail?.isActive) resumeFromBackground();
    else pauseForBackground();
  });
  if (!state.meta.onboarded) {
    showOnboard();
  } else if (state.meta?.streak > 1) {
    setTimeout(() => showToast(`серия · ${state.meta.streak} дн`), 650);
  }
  requestAnimationFrame(frame);
  const nativeShell = !!window.OttiskNative?.isNative;
  if ("serviceWorker" in navigator && !nativeShell) {
    navigator.serviceWorker
      .register("./sw.js?v=35")
      .then((reg) => reg.update())
      .catch(() => {});
  }
}

boot();
