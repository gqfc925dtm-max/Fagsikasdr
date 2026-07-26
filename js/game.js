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
  "Лови живой свет — он прыгает и крутится.",
  "Счёт растёт — волны меняют хищников: стая, стрелки… и дальше до бездны.",
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

const HEROES = [
  { id: "octopus", name: "осьминог", glyph: "Ос", ability: "рывок", tip: "РЕЗКИЙ СВАЙП — РЫВОК" },
  { id: "jellyfish", name: "медуза", glyph: "Ме", ability: "аура", tip: "АУРА ЗАМЕДЛЯЕТ" },
  { id: "turtle", name: "черепаха", glyph: "Че", ability: "панцирь", tip: "ПАНЦИРЬ ДЕРЖИТ ДОЛЬШЕ" },
  { id: "crab", name: "краб", glyph: "Кр", ability: "щит", tip: "ЩИТ НА 1 УДАР" },
  { id: "custom", name: "свой", glyph: "✦", ability: "рывок", tip: "РЕЗКИЙ СВАЙП — РЫВОК" },
];

const DIFFICULTIES = [
  { id: "easy", name: "лёгкий", speed: 0.78, spawn: 1.28, hunters: 0.72, hunger: 0.82, dash: 0.8 },
  { id: "normal", name: "обычный", speed: 1, spawn: 1, hunters: 1, hunger: 1, dash: 1 },
  { id: "hard", name: "сложный", speed: 1.2, spawn: 0.8, hunters: 1.22, hunger: 1.18, dash: 1.18 },
];

const HOUR_MS = 60 * 60 * 1000;
const GIFTS = [
  {
    id: "hourly",
    kicker: "каждый час",
    title: "Часовой",
    amount: 8,
    ready: (meta, now) => now >= (meta.hourlyGiftAt || 0),
    waitMs: (meta, now) => Math.max(0, (meta.hourlyGiftAt || 0) - now),
    claim: (meta, now) => {
      meta.hourlyGiftAt = now + HOUR_MS;
      return 8;
    },
  },
  {
    id: "daily",
    kicker: "раз в день",
    title: "Дневной",
    amount: 22,
    ready: (meta) => meta.dailyGiftDay !== localDayKey(),
    waitMs: () => msUntilNextLocalDay(),
    claim: (meta) => {
      meta.dailyGiftDay = localDayKey();
      return 22;
    },
  },
  {
    id: "weekly",
    kicker: "раз в неделю",
    title: "Недельный",
    amount: 60,
    ready: (meta) => meta.weeklyGiftWeek !== weekKey(),
    waitMs: () => msUntilNextWeek(),
    claim: (meta) => {
      meta.weeklyGiftWeek = weekKey();
      return 60;
    },
  },
  {
    id: "streak",
    kicker: "за серию",
    title: "Серия",
    amount: 0,
    ready: (meta) => (meta.streak || 0) >= 2 && meta.streakGiftDay !== localDayKey(),
    waitMs: (meta) => ((meta.streak || 0) >= 2 ? msUntilNextLocalDay() : 0),
    claim: (meta) => {
      meta.streakGiftDay = localDayKey();
      return 6 + Math.min(14, Math.max(0, (meta.streak || 0) - 1) * 3);
    },
    amountLabel: (meta) => `+${6 + Math.min(14, Math.max(0, (meta.streak || 0) - 1) * 3)}`,
    lockedLabel: (meta) => ((meta.streak || 0) < 2 ? "нужно 2 дня" : ""),
  },
  {
    id: "return",
    kicker: "возвращение",
    title: "С возвращением",
    amount: 16,
    ready: (meta) => meta.returnAvailableDay === localDayKey() && meta.returnGiftAt !== localDayKey(),
    waitMs: () => msUntilNextLocalDay(),
    claim: (meta) => {
      meta.returnGiftAt = localDayKey();
      return 16;
    },
    lockedLabel: () => "зайди завтра",
  },
];

/** Difficulty waves: each tier swaps predator species + pacing. */
const WAVES = [
  {
    id: "school",
    at: 0,
    name: "стая",
    species: "fish",
    maxBonus: 0,
    speedMul: 1,
    intervalMul: 1,
    label: "ВОЛНА 1 · СТАЯ",
  },
  {
    id: "darts",
    at: 22,
    name: "стрелки",
    species: "dart",
    maxBonus: 1,
    speedMul: 1.18,
    intervalMul: 0.9,
    label: "ВОЛНА 2 · СТРЕЛКИ",
  },
  {
    id: "jellies",
    at: 48,
    name: "медузы",
    species: "jelly",
    maxBonus: 1,
    speedMul: 0.66,
    intervalMul: 0.98,
    label: "ВОЛНА 3 · МЕДУЗЫ",
  },
  {
    id: "eels",
    at: 80,
    name: "угри",
    species: "eel",
    maxBonus: 1,
    speedMul: 1.02,
    intervalMul: 0.84,
    label: "ВОЛНА 4 · УГРИ",
  },
  {
    id: "sharks",
    at: 130,
    name: "акулы",
    species: "shark",
    maxBonus: 1,
    speedMul: 0.95,
    intervalMul: 0.92,
    label: "ВОЛНА 5 · АКУЛЫ",
  },
  {
    id: "leviathan",
    at: 155,
    name: "левиафан",
    species: "boss",
    maxBonus: 0,
    speedMul: 0.9,
    intervalMul: 8,
    boss: true,
    label: "БОСС · ЛЕВИАФАН",
  },
  {
    id: "rays",
    at: 185,
    name: "скаты",
    species: "ray",
    maxBonus: 1,
    speedMul: 0.88,
    intervalMul: 0.95,
    label: "ВОЛНА 7 · СКАТЫ",
  },
  {
    id: "ghosts",
    at: 230,
    name: "призраки",
    species: "ghost",
    maxBonus: 2,
    speedMul: 1.05,
    intervalMul: 0.88,
    label: "ВОЛНА 8 · ПРИЗРАКИ",
  },
  {
    id: "abyss",
    at: 280,
    name: "бездна",
    species: "mix",
    maxBonus: 2,
    speedMul: 1.08,
    intervalMul: 0.82,
    label: "ВОЛНА 9 · БЕЗДНА",
  },
];

const MIX_SPECIES = ["fish", "dart", "jelly", "eel", "shark", "ray", "ghost"];

const customHeroImage = { img: null, src: "", ready: false };

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
const screenDrawEl = document.getElementById("screen-draw");
const heroListEl = document.getElementById("hero-list");
const btnDrawHero = document.getElementById("btn-draw-hero");
const drawCanvasEl = document.getElementById("draw-canvas");
const btnDrawClear = document.getElementById("btn-draw-clear");
const btnDrawCancel = document.getElementById("btn-draw-cancel");
const btnDrawSave = document.getElementById("btn-draw-save");
const screenOverEl = document.getElementById("screen-over");
const drawCtx = drawCanvasEl?.getContext?.("2d") || null;
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
  waveId: "school",
  waveIndex: 0,
  heroDashCd: 0,
  heroShield: true,
  tipFlags: {
    move: false,
    hunter: false,
    hunger: false,
    echo: false,
    dive: false,
    shadow: false,
    word: false,
    boss: false,
    ability: false,
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
  mutationDing();
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
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!state.audio) state.audio = new AudioCtx();
  const ac = state.audio;
  if (!state.audioBus) {
    const master = ac.createGain();
    master.gain.value = 1.15;
    // Keep the path short for iOS Safari reliability.
    master.connect(ac.destination);
    state.audioBus = { master };
    state.noiseBuffer = null;
    state.audioUnlocked = false;
  }
  if (ac.state === "suspended") {
    try {
      const p = ac.resume();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } catch (_) {
      // ignore
    }
  }
  return ac;
}

function audioOut() {
  const ac = ensureAudio();
  if (!ac || !state.audioBus) return null;
  return { ac, out: state.audioBus.master };
}

/** Must run inside a user gesture on iPhone or WebAudio stays muted. */
function unlockAudio() {
  if (!soundEnabled()) return false;
  const ac = ensureAudio();
  if (!ac || !state.audioBus) return false;
  try {
    if (ac.state === "suspended") {
      const p = ac.resume();
      if (p && typeof p.catch === "function") p.catch(() => {});
    }
  } catch (_) {
    // ignore
  }
  if (!state.audioUnlocked) {
    try {
      // Silent buffer kick — required so iOS keeps the audio graph alive.
      const buf = ac.createBuffer(1, 1, ac.sampleRate);
      const src = ac.createBufferSource();
      src.buffer = buf;
      src.connect(state.audioBus.master);
      src.start(0);
      state.audioUnlocked = true;
    } catch (_) {
      // ignore
    }
  }
  return ac.state === "running" || state.audioUnlocked;
}

function getNoiseBuffer() {
  const ac = ensureAudio();
  if (!ac) return null;
  if (state.noiseBuffer) return state.noiseBuffer;
  const len = Math.max(1, Math.floor(ac.sampleRate * 0.8));
  const buffer = ac.createBuffer(1, len, ac.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i += 1) {
    // Soft pink-ish noise for underwater grit.
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = (white * 0.35 + last * 0.65) * 0.55;
  }
  state.noiseBuffer = buffer;
  return buffer;
}

function envGain(ac, out, gain, attack, dur, release = 0.04, delay = 0) {
  const amp = ac.createGain();
  const at = ac.currentTime + Math.max(0, delay);
  const att = Math.max(0.006, attack);
  const peak = Math.max(0.001, gain);
  const end = at + Math.max(att + 0.02, dur + release);
  amp.gain.setValueAtTime(0.0001, at);
  amp.gain.linearRampToValueAtTime(peak, at + att);
  amp.gain.linearRampToValueAtTime(0.0001, end);
  amp.connect(out);
  return { amp, at, stopAt: end + 0.03 };
}

function rampFreq(param, from, to, at, dur) {
  const a = Math.max(20, from);
  const b = Math.max(20, to);
  param.setValueAtTime(a, at);
  if (Math.abs(a - b) < 1) return;
  // linearRamp is safer across Safari than exponentialRamp.
  param.linearRampToValueAtTime(b, at + Math.max(0.01, dur));
}

function playOsc({
  freq = 440,
  endFreq = null,
  type = "sine",
  gain = 0.03,
  dur = 0.12,
  delay = 0,
  attack = 0.01,
  release = 0.05,
  detune = 0,
  filterFreq = 0,
  filterQ = 0.8,
  filterType = "lowpass",
} = {}) {
  if (!soundEnabled()) return;
  unlockAudio();
  const bus = audioOut();
  if (!bus) return;
  try {
    const { ac, out } = bus;
    const { amp, at, stopAt } = envGain(ac, out, gain * 1.35, attack, dur, release, delay);
    const osc = ac.createOscillator();
    osc.type = type;
    rampFreq(osc.frequency, freq, endFreq == null ? freq : endFreq, at, dur);
    if (detune) osc.detune.setValueAtTime(detune, at);
    if (filterFreq > 0) {
      const filter = ac.createBiquadFilter();
      filter.type = filterType;
      filter.frequency.setValueAtTime(Math.max(40, filterFreq), at);
      filter.Q.value = filterQ;
      osc.connect(filter);
      filter.connect(amp);
    } else {
      osc.connect(amp);
    }
    osc.start(at);
    osc.stop(stopAt);
  } catch (_) {
    // Never let audio errors kill the game loop.
  }
}

function playNoise({
  gain = 0.03,
  dur = 0.12,
  delay = 0,
  attack = 0.005,
  release = 0.06,
  filterFreq = 1200,
  endFilter = null,
  filterType = "bandpass",
  filterQ = 1.2,
} = {}) {
  if (!soundEnabled()) return;
  unlockAudio();
  const bus = audioOut();
  if (!bus) return;
  const buffer = getNoiseBuffer();
  if (!buffer) return;
  try {
    const { ac, out } = bus;
    const { amp, at, stopAt } = envGain(ac, out, gain * 1.25, attack, dur, release, delay);
    const src = ac.createBufferSource();
    src.buffer = buffer;
    const filter = ac.createBiquadFilter();
    filter.type = filterType;
    filter.Q.value = filterQ;
    rampFreq(filter.frequency, filterFreq, endFilter == null ? filterFreq : endFilter, at, dur);
    src.connect(filter);
    filter.connect(amp);
    src.start(at);
    src.stop(stopAt);
  } catch (_) {
    // ignore
  }
}

/** Legacy thin beep kept as a tiny wrapper for any leftover call sites. */
function tone(freq, dur = 0.08, type = "sine", gain = 0.04, delay = 0) {
  playOsc({ freq, type, gain: gain * 0.85, dur, delay, attack: 0.008, release: 0.04, filterFreq: freq * 3.2 });
}

function hum(on) {
  if (!on) {
    if (!state.humNode || !state.audio) {
      state.humNode = null;
      return;
    }
    const ac = state.audio;
    const node = state.humNode;
    const t = ac.currentTime;
    node.g.gain.cancelScheduledValues(t);
    node.g.gain.setTargetAtTime(0.0001, t, 0.08);
    node.noiseGain.gain.setTargetAtTime(0.0001, t, 0.08);
    try {
      node.o1.stop(t + 0.22);
      node.o2.stop(t + 0.22);
      node.o3.stop(t + 0.22);
      node.lfo.stop(t + 0.22);
      node.noise.stop(t + 0.22);
    } catch (_) {
      // already stopped
    }
    state.humNode = null;
    return;
  }
  if (!soundEnabled()) return;
  unlockAudio();
  const bus = audioOut();
  if (!bus) return;
  if (state.humNode) return;
  const { ac, out } = bus;
  const o1 = ac.createOscillator();
  const o2 = ac.createOscillator();
  const o3 = ac.createOscillator();
  const lfo = ac.createOscillator();
  const lfoGain = ac.createGain();
  const g = ac.createGain();
  const filter = ac.createBiquadFilter();
  const noise = ac.createBufferSource();
  const noiseFilter = ac.createBiquadFilter();
  const noiseGain = ac.createGain();
  const buffer = getNoiseBuffer();
  o1.type = "sine";
  o2.type = "triangle";
  o3.type = "sine";
  lfo.type = "sine";
  o1.frequency.value = 48;
  o2.frequency.value = 72;
  o3.frequency.value = 96;
  lfo.frequency.value = 0.18;
  lfoGain.gain.value = 7;
  filter.type = "lowpass";
  filter.frequency.value = 420;
  filter.Q.value = 0.9;
  g.gain.value = 0.0001;
  noiseGain.gain.value = 0.0001;
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = 280;
  noiseFilter.Q.value = 0.7;
  if (buffer) {
    noise.buffer = buffer;
    noise.loop = true;
  }
  lfo.connect(lfoGain);
  lfoGain.connect(o1.frequency);
  lfoGain.connect(o2.frequency);
  o1.connect(filter);
  o2.connect(filter);
  o3.connect(filter);
  filter.connect(g);
  g.connect(out);
  if (buffer) {
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(out);
    noise.start();
  }
  o1.start();
  o2.start();
  o3.start();
  lfo.start();
  state.humNode = { o1, o2, o3, lfo, g, noise, noiseGain, filter, noiseFilter };
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
  const base = 46 + urgency * 54 + hunterBoost * 28;
  const t = ac.currentTime;
  state.humNode.o1.frequency.setTargetAtTime(base, t, 0.1);
  state.humNode.o2.frequency.setTargetAtTime(base * 1.5, t, 0.1);
  state.humNode.o3.frequency.setTargetAtTime(base * 2.02, t, 0.12);
  state.humNode.filter.frequency.setTargetAtTime(320 + urgency * 520 + hunterBoost * 380, t, 0.12);
  state.humNode.g.gain.setTargetAtTime(0.01 + urgency * 0.022 + hunterBoost * 0.014, t, 0.1);
  state.humNode.noiseGain.gain.setTargetAtTime(0.004 + urgency * 0.012 + hunterBoost * 0.01, t, 0.12);
  state.humNode.noiseFilter.frequency.setTargetAtTime(220 + hunterBoost * 700 + urgency * 260, t, 0.14);
}

function sfxBubblePop(pitch = 1) {
  playNoise({
    gain: 0.028,
    dur: 0.07,
    attack: 0.002,
    release: 0.05,
    filterFreq: 1800 * pitch,
    endFilter: 700 * pitch,
    filterType: "bandpass",
    filterQ: 2.4,
  });
  playOsc({
    freq: 520 * pitch,
    endFreq: 180 * pitch,
    type: "sine",
    gain: 0.03,
    dur: 0.09,
    attack: 0.004,
    filterFreq: 2400,
  });
}

/** Soft gravitational swallow + crystal ping — eating a light-planet. */
function sfxPlanktonEat(combo = 0) {
  const pitch = 1 + Math.min(12, combo) * 0.038;
  // mass absorb (low whoomp)
  playOsc({
    freq: 210 * pitch,
    endFreq: 68 * pitch,
    type: "sine",
    gain: 0.042,
    dur: 0.15,
    attack: 0.003,
    release: 0.08,
    filterFreq: 520,
  });
  playOsc({
    freq: 140 * pitch,
    endFreq: 48 * pitch,
    type: "triangle",
    gain: 0.02,
    dur: 0.16,
    attack: 0.004,
    filterFreq: 380,
  });
  // planetary core ting
  playOsc({
    freq: 680 * pitch,
    endFreq: 980 * pitch,
    type: "triangle",
    gain: 0.03,
    dur: 0.11,
    delay: 0.018,
    attack: 0.002,
    filterFreq: 2600,
    filterQ: 1.2,
  });
  // bright overtone sparkle
  playOsc({
    freq: 1360 * pitch,
    endFreq: 1880 * pitch,
    type: "sine",
    gain: 0.016,
    dur: 0.1,
    delay: 0.045,
    filterFreq: 3400,
  });
  // light-dust hush
  playNoise({
    gain: 0.02,
    dur: 0.11,
    attack: 0.002,
    release: 0.07,
    filterFreq: 2600 * pitch,
    endFilter: 480 * pitch,
    filterType: "bandpass",
    filterQ: 1.6,
  });
}

function sfxRareEat() {
  playOsc({ freq: 160, endFreq: 70, type: "sine", gain: 0.036, dur: 0.18, attack: 0.006, filterFreq: 500 });
  playOsc({ freq: 740, endFreq: 1180, type: "triangle", gain: 0.032, dur: 0.14, delay: 0.02, filterFreq: 3200 });
  playOsc({ freq: 1180, endFreq: 1680, type: "sine", gain: 0.02, dur: 0.16, delay: 0.07 });
  playNoise({ gain: 0.018, dur: 0.12, delay: 0.02, filterFreq: 2800, endFilter: 700, filterQ: 1.8 });
}

function sfxCoolEat() {
  playOsc({ freq: 420, endFreq: 180, type: "sine", gain: 0.03, dur: 0.18, attack: 0.008, filterFreq: 1200 });
  playOsc({ freq: 840, endFreq: 420, type: "triangle", gain: 0.018, dur: 0.2, delay: 0.03 });
  playNoise({ gain: 0.016, dur: 0.16, filterFreq: 1100, endFilter: 220, filterType: "lowpass" });
}

function sfxBaitEat() {
  playOsc({ freq: 180, endFreq: 90, type: "sawtooth", gain: 0.018, dur: 0.14, filterFreq: 500, filterQ: 1.4 });
  playOsc({ freq: 240, endFreq: 120, type: "square", gain: 0.012, dur: 0.12, delay: 0.04, filterFreq: 700 });
  playNoise({ gain: 0.022, dur: 0.12, filterFreq: 420, endFilter: 160, filterQ: 0.8 });
}

function sfxCometEat() {
  playNoise({ gain: 0.03, dur: 0.18, filterFreq: 3200, endFilter: 400, filterType: "lowpass", filterQ: 0.6 });
  playOsc({ freq: 980, endFreq: 220, type: "sawtooth", gain: 0.02, dur: 0.2, filterFreq: 1800 });
  playOsc({ freq: 1460, endFreq: 420, type: "triangle", gain: 0.018, dur: 0.16, delay: 0.03 });
}

function sfxDeepEat() {
  playOsc({ freq: 140, endFreq: 70, type: "sine", gain: 0.04, dur: 0.28, attack: 0.02, filterFreq: 500 });
  playOsc({ freq: 210, endFreq: 105, type: "triangle", gain: 0.02, dur: 0.26, delay: 0.04 });
  playNoise({ gain: 0.02, dur: 0.22, filterFreq: 180, endFilter: 80, filterType: "lowpass" });
}

function sfxSeedEat() {
  playOsc({ freq: 180, endFreq: 90, type: "sine", gain: 0.028, dur: 0.14, attack: 0.006, filterFreq: 480 });
  playOsc({ freq: 720, endFreq: 1080, type: "triangle", gain: 0.022, dur: 0.13, delay: 0.03, filterFreq: 2600 });
  playOsc({ freq: 1080, endFreq: 1440, type: "sine", gain: 0.014, dur: 0.12, delay: 0.08 });
  playNoise({ gain: 0.014, dur: 0.1, delay: 0.02, filterFreq: 2200, endFilter: 600, filterQ: 1.5 });
}

function sfxPulsarEat() {
  playNoise({ gain: 0.038, dur: 0.24, filterFreq: 1800, endFilter: 240, filterType: "bandpass", filterQ: 0.85 });
  playOsc({ freq: 150, endFreq: 55, type: "sine", gain: 0.048, dur: 0.3, attack: 0.012, filterFreq: 420 });
  playOsc({ freq: 480, endFreq: 960, type: "triangle", gain: 0.032, dur: 0.2, delay: 0.04, filterFreq: 2800 });
  playOsc({ freq: 960, endFreq: 1440, type: "sine", gain: 0.024, dur: 0.22, delay: 0.1 });
  playOsc({ freq: 1440, endFreq: 360, type: "triangle", gain: 0.016, dur: 0.24, delay: 0.16 });
}

function goalChime() {
  playOsc({ freq: 523, type: "sine", gain: 0.03, dur: 0.12, filterFreq: 2600 });
  playOsc({ freq: 659, type: "triangle", gain: 0.026, dur: 0.13, delay: 0.07, filterFreq: 2800 });
  playOsc({ freq: 784, type: "sine", gain: 0.024, dur: 0.16, delay: 0.14, filterFreq: 3000 });
  playOsc({ freq: 1046, type: "triangle", gain: 0.016, dur: 0.18, delay: 0.2 });
  playNoise({ gain: 0.012, dur: 0.12, delay: 0.08, filterFreq: 2800, endFilter: 1200, filterQ: 1.8 });
}

function mutationDing() {
  playOsc({ freq: 700, endFreq: 1050, type: "triangle", gain: 0.03, dur: 0.14, filterFreq: 3200 });
  playOsc({ freq: 1050, endFreq: 1400, type: "sine", gain: 0.022, dur: 0.16, delay: 0.07 });
  playNoise({ gain: 0.016, dur: 0.12, delay: 0.03, filterFreq: 2400, endFilter: 900 });
}

function sfxAwaken() {
  playNoise({ gain: 0.035, dur: 0.28, filterFreq: 600, endFilter: 2200, filterType: "lowpass", filterQ: 0.7 });
  playOsc({ freq: 110, endFreq: 220, type: "sine", gain: 0.04, dur: 0.3, attack: 0.02 });
  playOsc({ freq: 220, endFreq: 440, type: "triangle", gain: 0.028, dur: 0.24, delay: 0.06 });
  playOsc({ freq: 440, endFreq: 880, type: "sine", gain: 0.02, dur: 0.2, delay: 0.14 });
  playOsc({ freq: 880, endFreq: 1320, type: "triangle", gain: 0.014, dur: 0.16, delay: 0.22 });
  sfxBubblePop(0.85);
  sfxBubblePop(1.25);
}

function sfxPulse() {
  playNoise({ gain: 0.03, dur: 0.16, filterFreq: 500, endFilter: 140, filterType: "lowpass" });
  playOsc({ freq: 180, endFreq: 70, type: "sine", gain: 0.034, dur: 0.18, attack: 0.008 });
  playOsc({ freq: 90, endFreq: 45, type: "triangle", gain: 0.02, dur: 0.2, delay: 0.03 });
}

function sfxDeath() {
  playNoise({ gain: 0.05, dur: 0.42, filterFreq: 900, endFilter: 90, filterType: "lowpass", filterQ: 0.6 });
  playOsc({ freq: 160, endFreq: 48, type: "sawtooth", gain: 0.03, dur: 0.38, attack: 0.01, filterFreq: 700 });
  playOsc({ freq: 96, endFreq: 36, type: "triangle", gain: 0.034, dur: 0.42, delay: 0.05, filterFreq: 400 });
  playOsc({ freq: 220, endFreq: 55, type: "sine", gain: 0.02, dur: 0.3, delay: 0.1 });
}

function sfxNearMiss() {
  playNoise({ gain: 0.02, dur: 0.08, filterFreq: 2200, endFilter: 700, filterQ: 2 });
  playOsc({ freq: 980, endFreq: 420, type: "triangle", gain: 0.02, dur: 0.09, filterFreq: 2600 });
}

function sfxWaveShift() {
  playNoise({ gain: 0.028, dur: 0.22, filterFreq: 300, endFilter: 1800, filterType: "bandpass", filterQ: 0.9 });
  playOsc({ freq: 180, endFreq: 360, type: "sine", gain: 0.028, dur: 0.2 });
  playOsc({ freq: 270, endFreq: 540, type: "triangle", gain: 0.02, dur: 0.22, delay: 0.06 });
  playOsc({ freq: 540, endFreq: 810, type: "sine", gain: 0.014, dur: 0.18, delay: 0.12 });
}

function sfxDiveIn() {
  playNoise({ gain: 0.03, dur: 0.24, filterFreq: 1400, endFilter: 180, filterType: "lowpass" });
  playOsc({ freq: 240, endFreq: 80, type: "sine", gain: 0.03, dur: 0.26, attack: 0.02 });
  playOsc({ freq: 160, endFreq: 60, type: "triangle", gain: 0.018, dur: 0.28, delay: 0.05 });
}

function sfxDiveOut() {
  playNoise({ gain: 0.022, dur: 0.16, filterFreq: 200, endFilter: 1600, filterType: "lowpass" });
  playOsc({ freq: 120, endFreq: 320, type: "sine", gain: 0.026, dur: 0.18 });
  playOsc({ freq: 240, endFreq: 480, type: "triangle", gain: 0.016, dur: 0.16, delay: 0.05 });
}

function sfxHunterWarn() {
  playOsc({ freq: 140, endFreq: 90, type: "sawtooth", gain: 0.02, dur: 0.16, filterFreq: 500, filterQ: 1.8 });
  playNoise({ gain: 0.02, dur: 0.14, filterFreq: 260, endFilter: 120, filterType: "lowpass" });
}

function sfxShadow() {
  playOsc({ freq: 90, endFreq: 45, type: "sine", gain: 0.034, dur: 0.28, attack: 0.03 });
  playOsc({ freq: 135, endFreq: 60, type: "triangle", gain: 0.02, dur: 0.26, delay: 0.05 });
  playNoise({ gain: 0.024, dur: 0.24, filterFreq: 180, endFilter: 70, filterType: "lowpass" });
}

function sfxUiTap(step = 0) {
  playOsc({
    freq: 520 + step * 70,
    endFreq: 780 + step * 40,
    type: "triangle",
    gain: 0.018,
    dur: 0.07,
    filterFreq: 2400,
  });
  playNoise({ gain: 0.01, dur: 0.05, filterFreq: 2600, endFilter: 1200, filterQ: 2 });
}

function sfxContinue() {
  playOsc({ freq: 330, endFreq: 520, type: "sine", gain: 0.028, dur: 0.14 });
  playOsc({ freq: 520, endFreq: 780, type: "triangle", gain: 0.02, dur: 0.16, delay: 0.07 });
  sfxBubblePop(1.1);
}

function sfxHungerTick(hunger = 20) {
  const danger = clamp((28 - hunger) / 28, 0, 1);
  playOsc({
    freq: 120 + danger * 90,
    endFreq: 70 + danger * 40,
    type: "triangle",
    gain: 0.012 + danger * 0.012,
    dur: 0.07,
    filterFreq: 500,
  });
  playNoise({
    gain: 0.01 + danger * 0.012,
    dur: 0.06,
    filterFreq: 300 + danger * 400,
    endFilter: 120,
    filterType: "bandpass",
    filterQ: 1.5,
  });
}

function playSparkTone(type) {
  if (type === "super") sfxPulsarEat();
  else if (type === "rare") sfxRareEat();
  else if (type === "cool") sfxCoolEat();
  else if (type === "bait") sfxBaitEat();
  else if (type === "comet") sfxCometEat();
  else if (type === "deep") sfxDeepEat();
  else if (type === "seed") sfxSeedEat();
  else sfxPlanktonEat(state.combo || 0);
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
  sfxDiveIn();
  buzz([12, 20, 12]);
  state.flash = Math.max(state.flash, 0.16);
  for (let i = 0; i < 5; i += 1) spawnSpark({ edge: true, type: "deep" });
}

function exitInkDive() {
  state.inkDive = 0;
  app.classList.remove("ink-dive");
  if (!state.event) setEventChip("");
  pulseUnlock(cssVar("--life", "#7affd4"), 0.1);
  sfxDiveOut();
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
  sfxShadow();
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
    sfxUiTap(state.glyphIndex);
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
  sfxSeedEat();
}

function consumeSymbioteShield(hunter) {
  if (!state.symbiote || !state.life) return false;
  state.symbiote = null;
  buzz([10, 18, 10]);
  sfxPulse();
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

function playerDifficulty() {
  const id = state.meta?.difficulty || "normal";
  return DIFFICULTIES.find((d) => d.id === id) || DIFFICULTIES[1];
}

function skillSoftScale() {
  const best = Math.max(state.best || 0, state.meta?.best || 0);
  if (best < 12) return 0.52;
  if (best < 30) return 0.68;
  if (best < 60) return 0.82;
  if (best < 100) return 0.92;
  return 1;
}

function difficultyScale() {
  return skillSoftScale() * playerDifficulty().speed;
}

/** Ease the mid-run spike so objects feel a bit slower around 20–110 score. */
function midgamePace() {
  const s = state.score || 0;
  let pace = 1;
  if (s < 18) pace = 1;
  else if (s < 40) pace = 0.88;
  else if (s < 70) pace = 0.82;
  else if (s < 110) pace = 0.85;
  else if (s < 150) pace = 0.92;
  else if (s < 220) pace = 0.94;
  else if (s < 280) pace = 0.96;
  else pace = 1;
  // Easy stays gentler late; hard keeps more pressure.
  if (playerDifficulty().id === "easy") pace *= 0.94;
  if (playerDifficulty().id === "hard") pace = Math.min(1, pace + 0.06);
  return pace;
}

const waveLabelEl = document.getElementById("wave-label");

function waveForScore(score = state.score) {
  let current = WAVES[0];
  for (const wave of WAVES) {
    if (score >= wave.at) current = wave;
  }
  return current;
}

function updateWaveUi(flash = false) {
  if (!waveLabelEl) return;
  const wave = waveForScore();
  waveLabelEl.textContent = `волна ${WAVES.indexOf(wave) + 1} · ${wave.name}`;
  if (flash) {
    waveLabelEl.classList.remove("flash");
    void waveLabelEl.offsetWidth;
    waveLabelEl.classList.add("flash");
  }
}

function rollHunterSpecies(waveSpecies) {
  if (waveSpecies === "mix") {
    return MIX_SPECIES[Math.floor(Math.random() * MIX_SPECIES.length)];
  }
  return waveSpecies || "fish";
}

function applySpeciesToHunter(hunter, species) {
  const kind = rollHunterSpecies(species);
  hunter.species = kind;
  hunter.boss = kind === "boss";
  hunter.dashCd = kind === "dart" ? rand(0.4, 1.1) : kind === "shark" ? rand(2.2, 3.4) : kind === "ghost" ? rand(1.4, 2.4) : kind === "boss" ? rand(1.6, 2.4) : 0;
  hunter.dashT = 0;
  hunter.pulse = Math.random() * Math.PI * 2;
  hunter.weave = Math.random() * Math.PI * 2;
  hunter.phaseAlpha = 1;
  if (kind === "dart") hunter.r = rand(11, 14);
  else if (kind === "jelly") hunter.r = rand(18, 24);
  else if (kind === "eel") hunter.r = rand(13, 16);
  else if (kind === "shark") hunter.r = rand(16, 20);
  else if (kind === "ray") hunter.r = rand(18, 23);
  else if (kind === "ghost") hunter.r = rand(13, 17);
  else if (kind === "boss") {
    hunter.r = 40;
    hunter.bossPhase = "orbit";
    hunter.bossTimer = 2.1;
    hunter.anger = Math.max(hunter.anger || 1, 1.05);
  } else hunter.r = rand(15, 19);
}

function spawnBoss() {
  const point = hunterSpawnPointAwayFromPlayer();
  const boss = {
    x: point.x,
    y: point.y,
    vx: 0,
    vy: 0,
    r: 40,
    anger: 1.08,
    slow: false,
    warn: 1.2,
    phase: Math.random() * Math.PI * 2,
    nearMissed: false,
    grace: 1.8,
    orbit: Math.random() * Math.PI * 2,
    orbitR: 150,
    orbitSpeed: 0.85,
    species: "boss",
    boss: true,
    bossPhase: "orbit",
    bossTimer: 2.4,
    chargeTx: 0,
    chargeTy: 0,
    dashCd: 0,
    dashT: 0,
    pulse: Math.random() * Math.PI * 2,
    weave: Math.random() * Math.PI * 2,
    phaseAlpha: 1,
  };
  state.hunters.push(boss);
  tipOnce("boss", "ЛЕВИАФАН", 1900);
  sfxHunterWarn();
  sfxWaveShift();
  buzz([16, 22, 16, 22, 16]);
  state.flash = Math.max(state.flash, 0.2);
  state.shake = Math.max(state.shake, 8);
}

function syncWave(announce = true) {
  const wave = waveForScore();
  if (wave.id === state.waveId) {
    updateWaveUi(false);
    return wave;
  }
  state.waveId = wave.id;
  state.waveIndex = WAVES.indexOf(wave);
  if (wave.boss) {
    state.hunters = state.hunters.filter((h) => h.shadow);
    spawnBoss();
  } else {
    for (const hunter of state.hunters) {
      if (hunter.shadow || hunter.demo) continue;
      if (hunter.boss) {
        // Boss leaves when the wave ends — push off-screen cleanup via splice later.
        hunter.boss = false;
        hunter.species = wave.species;
      }
      applySpeciesToHunter(hunter, wave.species);
      hunter.warn = 1;
      placeHunterOnEdge(hunter);
      hunter.grace = Math.max(hunter.grace || 0, 0.75);
    }
  }
  updateWaveUi(true);
  if (announce && state.running && !inOpening()) {
    tipOnce(`wave-${wave.id}`, wave.label, 1700);
    showCombo(wave.label, true);
    buzz([12, 18, 12]);
    sfxWaveShift();
    state.flash = Math.max(state.flash, 0.16);
  }
  return wave;
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
    floatText(x, y - 26, "ПУЛЬСАР", "#ff2f45", 22);
    buzz([14, 20, 14, 28]);
  }
}

function localDayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function msUntilNextLocalDay(now = Date.now()) {
  const d = new Date(now);
  const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0, 0);
  return Math.max(0, next.getTime() - now);
}

function msUntilNextWeek(now = Date.now()) {
  const d = new Date(now);
  const day = d.getDay(); // 0 Sun
  const daysToMon = day === 0 ? 1 : 8 - day;
  const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + daysToMon, 0, 0, 0, 0);
  return Math.max(0, next.getTime() - now);
}

function formatWait(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}ч ${String(m).padStart(2, "0")}м`;
  if (m > 0) return `${m}м ${String(s).padStart(2, "0")}с`;
  return `${s}с`;
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
    activeHero: HEROES.some((h) => h.id === raw?.activeHero) ? raw.activeHero : "octopus",
    customHero: typeof raw?.customHero === "string" && raw.customHero.startsWith("data:image") ? raw.customHero : "",
    difficulty: DIFFICULTIES.some((d) => d.id === raw?.difficulty) ? raw.difficulty : "normal",
    hourlyGiftAt: Math.max(0, Number(raw?.hourlyGiftAt || 0)),
    dailyGiftDay: typeof raw?.dailyGiftDay === "string" ? raw.dailyGiftDay : "",
    weeklyGiftWeek: typeof raw?.weeklyGiftWeek === "string" ? raw.weeklyGiftWeek : "",
    streakGiftDay: typeof raw?.streakGiftDay === "string" ? raw.streakGiftDay : "",
    returnGiftAt: typeof raw?.returnGiftAt === "string" ? raw.returnGiftAt : "",
    returnAvailableDay: typeof raw?.returnAvailableDay === "string" ? raw.returnAvailableDay : "",
    lastVisitAt: Math.max(0, Number(raw?.lastVisitAt || 0)),
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

function activeHeroId() {
  const id = state.meta?.activeHero || "octopus";
  if (id === "custom" && !state.meta?.customHero) return "octopus";
  return HEROES.some((h) => h.id === id) ? id : "octopus";
}

function activeHero() {
  return HEROES.find((h) => h.id === activeHeroId()) || HEROES[0];
}

function playerIsSafe() {
  return performance.now() < (state.safeUntil || 0);
}

function heroCanDash() {
  const id = activeHeroId();
  return id === "octopus" || id === "custom";
}

function heroHasAura() {
  return activeHeroId() === "jellyfish";
}

function heroHungerMul() {
  return activeHeroId() === "turtle" ? 0.78 : 1;
}

function heroAuraSlowMul(hunter) {
  if (!heroHasAura() || !state.life || !hunter) return 1;
  const reach = 118 + Math.sin(state.time * 2.4) * 6;
  const d = dist(hunter.x, hunter.y, state.life.x, state.life.y);
  if (d > reach) return 1;
  return 0.52 + 0.28 * clamp(d / reach, 0, 1);
}

function tryHeroDash(dx, dy, moved) {
  if (!heroCanDash() || !state.life || state.heroDashCd > 0 || inOpening()) return false;
  if ((state.holdLifeTime || 0) < 0.35) return false;
  if (moved < 26) return false;
  const len = Math.hypot(dx, dy) || 1;
  const nx = dx / len;
  const ny = dy / len;
  const boost = 56;
  state.life.x += nx * boost;
  state.life.y += ny * boost;
  clampLife();
  state.life.aim = Math.atan2(ny, nx);
  state.heroDashCd = 2.6;
  state.safeUntil = performance.now() + 320;
  for (const hunter of state.hunters) {
    if (hunter.boss) continue;
    const d = dist(hunter.x, hunter.y, state.life.x, state.life.y);
    if (d > 96 || d < 0.1) continue;
    const push = ((96 - d) / 96) * 7.5;
    hunter.vx += ((hunter.x - state.life.x) / d) * push;
    hunter.vy += ((hunter.y - state.life.y) / d) * push;
    hunter.warn = Math.max(hunter.warn, 0.7);
    hunter.grace = Math.max(hunter.grace || 0, 0.35);
  }
  for (let i = 0; i < 10; i += 1) {
    pushParticle({
      x: state.life.x - nx * i * 4,
      y: state.life.y - ny * i * 4,
      vx: -nx * rand(1.2, 2.8),
      vy: -ny * rand(1.2, 2.8),
      size: rand(2, 4.5),
      color: cssVar("--life", "#7affd4"),
      kind: "streak",
      decay: rand(0.04, 0.07),
    });
  }
  floatText(state.life.x, state.life.y - 22, "рывок", cssVar("--life", "#7affd4"), 15);
  tipOnce("ability", activeHero().tip || "РЫВОК", 1400);
  sfxPulse();
  buzz([8, 14, 8]);
  state.flash = Math.max(state.flash, 0.1);
  return true;
}

function tryCrabShield(hunter) {
  if (activeHeroId() !== "crab" || !state.heroShield || !state.life) return false;
  state.heroShield = false;
  buzz([12, 20, 12]);
  sfxPulse();
  burst(state.life.x, state.life.y, cssVar("--accent-a", "#ff9a62"), 22, 5.2);
  floatText(state.life.x, state.life.y - 20, "щит", cssVar("--accent-a", "#ff9a62"), 16);
  tipOnce("ability", "ЩИТ СЛОМАН", 1400);
  if (hunter) {
    const ang = Math.atan2(hunter.y - state.life.y, hunter.x - state.life.x) || 0;
    hunter.vx += Math.cos(ang) * 9;
    hunter.vy += Math.sin(ang) * 9;
    hunter.warn = 1;
    hunter.grace = Math.max(hunter.grace || 0, 0.55);
    if (!hunter.boss) placeHunterOnEdge(hunter);
  }
  state.safeUntil = performance.now() + 900;
  return true;
}

function absorbHunterHit(hunter) {
  if (playerIsSafe()) {
    if (hunter && state.life) {
      const ang = Math.atan2(hunter.y - state.life.y, hunter.x - state.life.x) || 0;
      hunter.vx += Math.cos(ang) * 4.5;
      hunter.vy += Math.sin(ang) * 4.5;
      hunter.grace = Math.max(hunter.grace || 0, 0.4);
    }
    return true;
  }
  if (consumeSymbioteShield(hunter)) return true;
  if (tryCrabShield(hunter)) return true;
  return false;
}

function loadCustomHeroImage(src) {
  if (!src) {
    customHeroImage.img = null;
    customHeroImage.src = "";
    customHeroImage.ready = false;
    return;
  }
  if (customHeroImage.src === src && customHeroImage.ready) return;
  const img = new Image();
  img.onload = () => {
    customHeroImage.img = img;
    customHeroImage.src = src;
    customHeroImage.ready = true;
  };
  img.onerror = () => {
    customHeroImage.img = null;
    customHeroImage.src = "";
    customHeroImage.ready = false;
  };
  img.src = src;
}

function setActiveHero(id) {
  if (!state.meta) return;
  if (id === "custom" && !state.meta.customHero) {
    openDrawHero();
    return;
  }
  state.meta.activeHero = id;
  saveMeta();
  renderHeroPicker();
  showToast(`герой · ${activeHero().name}`);
}

function renderHeroPicker() {
  if (!heroListEl) return;
  heroListEl.textContent = "";
  const current = activeHeroId();
  for (const hero of HEROES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `hero-tile${hero.id === current ? " on" : ""}`;
    const label = hero.id === "custom" && !state.meta?.customHero ? "нарисуй" : hero.name;
    const ability = hero.ability ? `<span class="hero-ability">${hero.ability}</span>` : "";
    btn.innerHTML = `<span class="hero-glyph" aria-hidden="true">${hero.glyph || "•"}</span><span class="hero-tile-name">${label}</span>${ability}`;
    btn.setAttribute("role", "option");
    btn.setAttribute("aria-label", hero.ability ? `${label}, ${hero.ability}` : label);
    btn.setAttribute("aria-selected", hero.id === current ? "true" : "false");
    btn.addEventListener("click", () => setActiveHero(hero.id));
    heroListEl.appendChild(btn);
  }
  if (btnDrawHero) btnDrawHero.textContent = state.meta?.customHero ? "перерисовать" : "нарисовать";
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
  if (marksStartEl) marksStartEl.textContent = `${state.meta.marks || 0} следов`;
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
  renderGifts();
}

function giftReady(gift, now = Date.now()) {
  if (!state.meta) return false;
  return !!gift.ready(state.meta, now);
}

function touchVisitClock() {
  if (!state.meta) return;
  const now = Date.now();
  const prev = state.meta.lastVisitAt || 0;
  if (prev && now - prev >= HOUR_MS * 20) {
    state.meta.returnAvailableDay = localDayKey();
  }
  state.meta.lastVisitAt = now;
  saveMeta();
}

function claimGift(giftId) {
  if (!state.meta) return;
  const gift = GIFTS.find((g) => g.id === giftId);
  if (!gift) return;
  const now = Date.now();
  if (!giftReady(gift, now)) {
    const locked = gift.lockedLabel?.(state.meta, now);
    showToast(locked || "ещё рано");
    return;
  }
  const amount = gift.claim(state.meta, now);
  saveMeta();
  awardMarks(amount, { metaOnly: true });
  goalChime();
  buzz([10, 18, 10]);
  showToast(`${gift.title.toLowerCase()} · +${amount} следов`);
  renderGifts();
  updateEconomyLabels();
}

function renderGifts() {
  const list = document.getElementById("gift-list");
  if (!list || !state.meta) return;
  const now = Date.now();
  list.textContent = "";
  for (const gift of GIFTS) {
    const ready = giftReady(gift, now);
    const locked = gift.lockedLabel?.(state.meta, now) || "";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `gift-tile${ready ? " ready" : ""}`;
    btn.disabled = !ready;
    const amountText = gift.amountLabel?.(state.meta, now) || `+${gift.amount}`;
    let metaText = ready ? `забрать ${amountText}` : (locked || formatWait(gift.waitMs(state.meta, now)));
    if (!ready && gift.id === "streak" && (state.meta.streak || 0) < 2) {
      metaText = "нужно 2 дня";
    }
    if (!ready && gift.id === "return") {
      metaText = locked || "после паузы 20ч";
    }
    btn.innerHTML = `
      <span class="gift-tile-kicker">${gift.kicker}</span>
      <span class="gift-tile-title">${gift.title}</span>
      <span class="gift-tile-meta">${metaText}</span>
    `;
    btn.addEventListener("click", () => claimGift(gift.id));
    list.appendChild(btn);
  }
  updateEconomyLabels();
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
  renderDifficultyPicker();
}

function setDifficulty(id) {
  if (!state.meta) return;
  if (!DIFFICULTIES.some((d) => d.id === id)) return;
  state.meta.difficulty = id;
  saveMeta();
  renderDifficultyPicker();
  const diff = playerDifficulty();
  showToast(`сложность · ${diff.name}`);
  const sub = document.querySelector("#btn-start .btn-sub");
  if (sub) sub.textContent = `${diff.name} · удерживай`;
}

function renderDifficultyPicker() {
  const list = document.getElementById("difficulty-list");
  if (!list || !state.meta) return;
  list.textContent = "";
  const current = playerDifficulty().id;
  for (const diff of DIFFICULTIES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `diff-chip${diff.id === current ? " on" : ""}`;
    btn.textContent = diff.name;
    btn.setAttribute("aria-pressed", diff.id === current ? "true" : "false");
    btn.addEventListener("click", () => setDifficulty(diff.id));
    list.appendChild(btn);
  }
  const sub = document.querySelector("#btn-start .btn-sub");
  if (sub) sub.textContent = `${playerDifficulty().name} · удерживай`;
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
    sfxUiTap(state.onboardStep);
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
    unlockAudio();
    state.hold = { target, pointerId: e.pointerId, progress: 0 };
    setHoldVisual("0%", target);
    sfxUiTap(0);
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
      sfxAwaken();
      buzz([14, 28, 14]);
      showCoach("ЕШЬ СВЕТ", 1500, true);
    } else {
      burst(x, y, cssVar("--life", "#7affd4"), 12, 3.4);
      sfxBubblePop(1);
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
  sfxPulse();
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
  sfxContinue();
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
  unlockAudio();
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
  const wave = waveForScore(state.score);
  const waveN = Math.max(1, WAVES.indexOf(wave) + 1);
  const hero = activeHero();
  return `Мой след в ОТТИСК: ${state.score} света · волна ${waveN} · ${hero.name}. ${SHARE_URL}`;
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
  const hero = activeHero();
  const wave = waveForScore(state.score);
  const waveN = Math.max(1, WAVES.indexOf(wave) + 1);
  const accent = cssVar("--life", "#7affd4");
  const gold = cssVar("--gold", "#ffe898");

  const gradient = shareCtx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#0a2438");
  gradient.addColorStop(0.45, "#081828");
  gradient.addColorStop(1, "#040c18");
  shareCtx.fillStyle = gradient;
  shareCtx.fillRect(0, 0, width, height);

  // Atmospheric depth blooms for Stories
  const bloomA = shareCtx.createRadialGradient(width * 0.78, height * 0.18, 20, width * 0.78, height * 0.18, 220);
  bloomA.addColorStop(0, "rgba(90, 190, 255, 0.22)");
  bloomA.addColorStop(1, "transparent");
  shareCtx.fillStyle = bloomA;
  shareCtx.fillRect(0, 0, width, height);
  const bloomB = shareCtx.createRadialGradient(width * 0.2, height * 0.72, 10, width * 0.2, height * 0.72, 260);
  bloomB.addColorStop(0, "rgba(255, 140, 90, 0.14)");
  bloomB.addColorStop(1, "transparent");
  shareCtx.fillStyle = bloomB;
  shareCtx.fillRect(0, 0, width, height);

  shareCtx.strokeStyle = "rgba(243,238,232,0.14)";
  shareCtx.lineWidth = 2;
  shareCtx.strokeRect(36, 36, width - 72, height - 72);

  shareCtx.textAlign = "left";
  shareCtx.fillStyle = gold;
  shareCtx.font = "800 54px Syne, sans-serif";
  shareCtx.fillText("ОТТИСК", 72, 118);
  shareCtx.fillStyle = "rgba(243,238,232,0.72)";
  shareCtx.font = "600 24px Instrument Sans, sans-serif";
  shareCtx.fillText("живёт только под пальцем", 74, 158);

  shareCtx.fillStyle = accent;
  shareCtx.font = "800 168px Syne, sans-serif";
  shareCtx.fillText(String(state.score), 68, 360);
  shareCtx.fillStyle = "rgba(243,238,232,0.9)";
  shareCtx.font = "700 30px Instrument Sans, sans-serif";
  shareCtx.fillText("света", 78, 408);

  // Wave + hero chips
  const chipY = 480;
  shareCtx.fillStyle = "rgba(255,255,255,0.08)";
  roundRectPath(shareCtx, 72, chipY - 34, 280, 52, 16);
  shareCtx.fill();
  shareCtx.fillStyle = "rgba(255,255,255,0.08)";
  roundRectPath(shareCtx, 370, chipY - 34, 260, 52, 16);
  shareCtx.fill();
  shareCtx.fillStyle = gold;
  shareCtx.font = "700 22px Instrument Sans, sans-serif";
  shareCtx.fillText(`волна ${waveN}`, 92, chipY);
  shareCtx.fillStyle = "rgba(243,238,232,0.88)";
  shareCtx.fillText(wave.name, 92, chipY + 26);
  shareCtx.fillStyle = accent;
  shareCtx.fillText(hero.name, 390, chipY);
  shareCtx.fillStyle = "rgba(243,238,232,0.78)";
  shareCtx.fillText(hero.ability || "свой след", 390, chipY + 26);

  shareCtx.fillStyle = "rgba(243,238,232,0.82)";
  shareCtx.font = "600 26px Instrument Sans, sans-serif";
  shareCtx.fillText(`Рекорд · ${state.best}`, 74, 600);
  if (state.runMarks > 0) {
    shareCtx.fillText(`+${state.runMarks} следов`, 74, 646);
  }

  shareCtx.fillStyle = "rgba(243,238,232,0.55)";
  shareCtx.font = "600 20px Instrument Sans, sans-serif";
  shareCtx.fillText("gqfc925dtm-max.github.io/Fagsikasdr", 74, 820);

  return shareCanvasEl;
}

function roundRectPath(ctx2d, x, y, w, h, r) {
  const radius = Math.min(r, w * 0.5, h * 0.5);
  ctx2d.beginPath();
  ctx2d.moveTo(x + radius, y);
  ctx2d.arcTo(x + w, y, x + w, y + h, radius);
  ctx2d.arcTo(x + w, y + h, x, y + h, radius);
  ctx2d.arcTo(x, y + h, x, y, radius);
  ctx2d.arcTo(x, y, x + w, y, radius);
  ctx2d.closePath();
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
    return { type, worth: 10, restore: 48, color: "#ff2f45", r: rand(18, 22), super: true, form: "pulsar" };
  }
  if (type === "rare") {
    return { type, worth: 3, restore: 35, color: "#ffcc44", r: rand(14, 18), form: "prism" };
  }
  if (type === "cool") {
    return { type, worth: 1, restore: 25, color: "#58c8ff", r: rand(12.5, 16), form: "frost" };
  }
  if (type === "bait") {
    return { type, worth: 1, restore: 12, color: "#ff58d0", r: rand(12.5, 16), form: "lure" };
  }
  if (type === "comet") {
    return { type, worth: 5, restore: 28, color: "#ffd840", r: rand(15, 19), comet: true, form: "bolt" };
  }
  if (type === "deep") {
    return { type, worth: 4, restore: 32, color: "#70d8ff", r: rand(13.5, 17), form: "abyss" };
  }
  if (type === "seed") {
    return { type, worth: 2, restore: 16, color: "#58ffb0", r: rand(13, 16.5), seed: true, form: "seed" };
  }
  const normals = ["#ffd080", "#ffb868", "#7affd4", "#9ad0ff", cssVar("--accent-b", "#62f0c8")];
  return {
    type: "normal",
    worth: 1,
    restore: 18,
    color: normals[Math.floor(Math.random() * normals.length)],
    r: rand(12, 16),
    form: "plankton",
  };
}

function rollSparkType() {
  if (inInkDive()) return Math.random() < 0.7 ? "deep" : "rare";
  if (inOpening()) {
    const r0 = Math.random();
    if (r0 < 0.12) return "cool";
    return "normal";
  }
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
  tipOnce("super", "ПУЛЬСАР", 1800);
  floatText(x, y - 28, "ПУЛЬСАР", "#ff2f45", 18);
}

function spawnComet() {
  const fromLeft = Math.random() < 0.5;
  const y = rand(state.height * 0.18, state.height * 0.78);
  const x = fromLeft ? -20 : state.width + 20;
  const speed = rand(2.6, 3.6);
  const profile = sparkProfile("comet");
  state.sparks.push({
    x,
    y,
    vx: fromLeft ? speed : -speed,
    vy: rand(-0.28, 0.28),
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

function hunterSpawnPointAwayFromPlayer() {
  const pad = 72;
  const candidates = [
    { x: rand(0, state.width), y: -pad },
    { x: state.width + pad, y: rand(0, state.height) },
    { x: rand(0, state.width), y: state.height + pad },
    { x: -pad, y: rand(0, state.height) },
  ];
  if (!state.life) return candidates[Math.floor(Math.random() * candidates.length)];
  let best = candidates[0];
  let bestD = -1;
  for (const c of candidates) {
    const d = dist(c.x, c.y, state.life.x, state.life.y);
    if (d > bestD) {
      bestD = d;
      best = c;
    }
  }
  return best;
}

function spawnHunter(slow = false) {
  const point = hunterSpawnPointAwayFromPlayer();
  const soft = skillSoftScale();
  const wave = syncWave(false);
  const anger = (slow ? 0.26 : rand(0.58, 0.88) + Math.min(0.28, state.score * 0.0035)) * soft;
  const hunter = {
    x: point.x,
    y: point.y,
    vx: 0,
    vy: 0,
    r: rand(15, 19),
    anger,
    slow,
    warn: 1,
    phase: Math.random() * Math.PI * 2,
    nearMissed: false,
    grace: slow ? 1.6 : state.elapsed < 3 ? 1.2 : 0.85,
    orbit: (state.hunters.length * 2.1) + Math.random() * 1.2,
    orbitR: rand(36, 64),
    orbitSpeed: rand(0.7, 1.25) * (Math.random() < 0.5 ? -1 : 1),
    species: wave.species,
    dashCd: 0,
    dashT: 0,
    pulse: Math.random() * Math.PI * 2,
    weave: Math.random() * Math.PI * 2,
  };
  applySpeciesToHunter(hunter, wave.species);
  state.hunters.push(hunter);
  if (state.running && !state.tipFlags.hunter) {
    tipOnce("hunter", wave.label.replace("ВОЛНА ", "ХИЩНИК · "), 1500);
    sfxHunterWarn();
  }
}

function registerNearMiss(hunter, x, y) {
  if (hunter.nearMissed) return;
  hunter.nearMissed = true;
  state.stats.nearMisses += 1;
  floatText(x, y - 18, "мимо", cssVar("--foam", "#f3eee8"), 14);
  sfxNearMiss();
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
  state.tipFlags = { move: false, hunter: false, hunger: false, echo: false, dive: false, shadow: false, word: false, super: false, boss: false, ability: false };
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
  state.waveId = "school";
  state.waveIndex = 0;
  state.heroDashCd = 0;
  state.heroShield = true;
  app.classList.remove("ink-dive");
  setDiveMeter(0);
  resetStats();
  clearHold();
  applyThemeFromScore(false);
  updateScoreUi(false);
  updateHungerUi();
  updateMutationUi();
  updateWaveUi(false);
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
  // First fish enters from the far edge almost immediately after the run starts.
  state.hunters = [];
  state.slowHunterSeen = false;
  state.hunterAcc = 1.2;
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
  unlockAudio();
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
    const hero = activeHero();
    if (hero?.tip) {
      setTimeout(() => tipOnce("ability", hero.tip, 1600), 1900);
    }
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
  sfxDeath();
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
    reason === "твой старый след догнал тебя" ||
    reason === "левиафан сомкнул кольцо";
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
  unlockAudio();
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
  if (moved > 0.5) tryHeroDash(state.life.x - prevX, state.life.y - prevY, moved);
}

function onCanvasUp(e) {
  if (!state.touchActive) return;
  if (state.pointerId != null && e.pointerId !== state.pointerId) return;
  state.touchActive = false;
  state.pointerId = null;
  if (state.running) releaseLife();
}

function updateSparkMotion(spark, dt) {
  spark.pulse += dt * (spark.type === "super" ? 7.2 : spark.type === "rare" ? 6.2 : 5.2);
  spark.drift = (spark.drift || 0) + dt;
  if (spark.comet) {
    spark.x += spark.vx * dt * 60;
    spark.y += spark.vy * dt * 60 + Math.sin(spark.pulse * 2) * 8 * dt;
    // Comet particle wake
    if (Math.random() < 0.55) {
      pushParticle({
        x: spark.x - spark.vx * 2,
        y: spark.y - spark.vy * 2,
        vx: -spark.vx * 0.08 + rand(-0.3, 0.3),
        vy: -spark.vy * 0.08 + rand(-0.3, 0.3),
        size: rand(1.2, 2.8),
        color: spark.color,
        kind: "dot",
        grav: 0.01,
        decay: 0.04,
        life: 0.7,
      });
    }
    return;
  }
  if (spark.pinned) {
    // Pulsar circles in place
    const orbit = 10 + Math.sin(spark.pulse) * 6;
    spark.x += Math.cos(spark.pulse * 1.4) * orbit * dt * 2.2;
    spark.y += Math.sin(spark.pulse * 1.1) * orbit * dt * 2.2;
  } else if (spark.type === "rare") {
    spark.vx += Math.cos(spark.pulse * 1.8) * 0.045;
    spark.vy += Math.sin(spark.pulse * 1.5) * 0.045;
  } else if (spark.type === "cool") {
    spark.vx += Math.sin(spark.drift * 2.4) * 0.03;
    spark.vy -= 0.012;
  } else {
    spark.vx += Math.sin(state.time * 1.7 + spark.y * 0.014) * 0.014;
    spark.vy += Math.cos(state.time * 1.4 + spark.x * 0.012) * 0.012;
    // Occasional dart hop
    if (Math.random() < 0.01) {
      const a = Math.random() * Math.PI * 2;
      spark.vx += Math.cos(a) * 0.55;
      spark.vy += Math.sin(a) * 0.55;
    }
  }
  spark.vx *= spark.type === "super" ? 0.97 : 0.988;
  spark.vy *= spark.type === "super" ? 0.97 : 0.988;
  const sparkPace = 0.9 + midgamePace() * 0.1;
  spark.x += spark.vx * dt * 60 * sparkPace;
  spark.y += spark.vy * dt * 60 * sparkPace;
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
    if (!inOpening()) spawnHunter(false);
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
    goalChime();
    buzz([10, 18, 10]);
    floatText(spark.x, spark.y - 18, "!", cssVar("--gold", "#ffe898"), 22);
  }
  if (state.stats.sparkEats === 1) tipOnce("move", "ЛОВИ СВЕТ", 1600);
  syncWave(true);
  playSparkTone(spark.type);
  eatSparkBlast(spark, openingEat);
  addScore(spark.worth, spark.x, spark.y - 12, { color: spark.color });
}

function placeHunterOnEdge(hunter) {
  const point = hunterSpawnPointAwayFromPlayer();
  hunter.x = point.x;
  hunter.y = point.y;
  hunter.vx = 0;
  hunter.vy = 0;
}

function hunterReachMul(hunter) {
  const species = hunter.species || "fish";
  if (species === "dart") return 1.25;
  if (species === "jelly") {
    const swell = 1 + Math.max(0, Math.sin(hunter.pulse || 0)) * 0.55;
    return 1.7 * swell;
  }
  if (species === "eel") return 1.9;
  if (species === "shark") return 1.45;
  if (species === "ray") return 1.7;
  if (species === "ghost") return 1.2;
  if (species === "boss" || hunter.boss) {
    if (hunter.bossPhase === "charge") return 1.35;
    if (hunter.bossPhase === "telegraph") return 1.15;
    return 1.05;
  }
  return 1.55;
}

function updateBossHunter(hunter, dt, diff) {
  if (!state.life) {
    hunter.bossPhase = "orbit";
    hunter.bossTimer = 1.5;
    return { tx: state.width * 0.5, ty: state.height * 0.5, speedMul: 0.55 };
  }
  hunter.bossTimer = (hunter.bossTimer || 0) - dt;
  hunter.orbit = (hunter.orbit || 0) + dt * (hunter.orbitSpeed || 0.85);
  const orbitR = hunter.orbitR || 150;
  if (hunter.bossPhase === "orbit") {
    if (hunter.bossTimer <= 0) {
      hunter.bossPhase = "telegraph";
      hunter.bossTimer = 0.85;
      hunter.chargeTx = state.life.x;
      hunter.chargeTy = state.life.y;
      hunter.warn = 1;
      sfxHunterWarn();
    }
    return {
      tx: state.life.x + Math.cos(hunter.orbit) * orbitR,
      ty: state.life.y + Math.sin(hunter.orbit * 0.9) * orbitR * 0.78,
      speedMul: 0.72,
    };
  }
  if (hunter.bossPhase === "telegraph") {
    if (hunter.bossTimer <= 0) {
      hunter.bossPhase = "charge";
      hunter.bossTimer = 0.55;
      hunter.dashT = 0.55;
      const ang = Math.atan2(hunter.chargeTy - hunter.y, hunter.chargeTx - hunter.x);
      hunter.vx += Math.cos(ang) * (4.2 * diff.dash);
      hunter.vy += Math.sin(ang) * (4.2 * diff.dash);
      buzz(10);
    }
    return { tx: hunter.chargeTx, ty: hunter.chargeTy, speedMul: 0.2 };
  }
  if (hunter.bossPhase === "charge") {
    if (hunter.bossTimer <= 0) {
      hunter.bossPhase = "recover";
      hunter.bossTimer = 1.15;
      hunter.dashT = 0;
    }
    return { tx: hunter.chargeTx, ty: hunter.chargeTy, speedMul: 1.55 * diff.dash };
  }
  // recover
  if (hunter.bossTimer <= 0) {
    hunter.bossPhase = "orbit";
    hunter.bossTimer = rand(1.7, 2.5);
    hunter.orbitR = rand(130, 170);
  }
  return {
    tx: state.life.x + Math.cos(hunter.orbit) * (orbitR + 40),
    ty: state.life.y + Math.sin(hunter.orbit) * (orbitR + 30),
    speedMul: 0.45,
  };
}

function updateHunters(dt) {
  const soft = skillSoftScale();
  const diff = playerDifficulty();
  const wave = syncWave(true);
  // Fish from the start: only one slow hunter early, then ramp with score.
  const early = state.elapsed < OPENING_SEC + 8 || state.score < 12;
  const opening = inOpening();
  let maxHunters = early || opening
    ? 1
    : Math.min(7, Math.max(1, Math.floor((1 + Math.floor(state.score / 22) + wave.maxBonus) * soft * diff.hunters)));
  if (wave.boss) maxHunters = 1;
  state.hunterAcc += dt;
  let interval = (Math.max(1.35, 4.1 - state.score * 0.018) * wave.intervalMul * diff.spawn) / Math.max(0.55, soft);
  interval /= Math.max(0.75, midgamePace());
  // Mid-game: spawn a bit less often so the field stays readable.
  if (state.score >= 22 && state.score < 110) interval *= 1.12;
  if (opening) interval = Math.max(interval, 2.8);
  if (!state.slowHunterSeen) interval = Math.max(interval, 1.1);
  const firstHunterAt = 0.45;
  if (wave.boss) {
    const hasBoss = state.hunters.some((h) => h.boss || h.species === "boss");
    if (!hasBoss && state.elapsed > firstHunterAt) {
      state.hunters = state.hunters.filter((h) => h.shadow);
      spawnBoss();
      state.hunterAcc = 0;
    }
  } else if (state.hunters.length < maxHunters && state.hunterAcc >= interval && state.elapsed > firstHunterAt) {
    // Spawn at most one hunter per update to avoid a sudden ambush pack.
    state.hunterAcc = 0;
    if (!state.slowHunterSeen) {
      spawnHunter(true);
      state.slowHunterSeen = true;
    } else {
      spawnHunter(false);
    }
  }

  for (let i = state.hunters.length - 1; i >= 0; i -= 1) {
    const hunter = state.hunters[i];
    const species = hunter.species || wave.species || "fish";
    hunter.phase += dt * (species === "dart" ? 8 : species === "jelly" ? 3.2 : species === "ray" ? 2.6 : species === "boss" ? 2.2 : 5);
    hunter.pulse = (hunter.pulse || 0) + dt * (species === "jelly" ? 2.4 : species === "ghost" ? 3.1 : species === "boss" ? 2.8 : 1.6);
    hunter.weave = (hunter.weave || 0) + dt * (species === "eel" ? 3.6 : species === "ray" ? 1.8 : 1.2);
    if (hunter.shadow) hunter.wobble = (hunter.wobble || 0) + dt * 5.5;
    hunter.warn = Math.max(0, hunter.warn - dt * (species === "boss" && hunter.bossPhase === "telegraph" ? 0.15 : 1.45));
    hunter.grace = Math.max(0, (hunter.grace || 0) - dt);
    hunter.dashCd = Math.max(0, (hunter.dashCd || 0) - dt);
    hunter.dashT = Math.max(0, (hunter.dashT || 0) - dt);
    if (species === "ghost") {
      // Soft blink: briefly hard to read, but never fully invisible for fairness.
      hunter.phaseAlpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(hunter.pulse * 1.4));
    } else {
      hunter.phaseAlpha = 1;
    }
    if (hunter.parade || hunter.demo) {
      // Convert showcase fish safely: always re-enter from a far edge.
      placeHunterOnEdge(hunter);
      hunter.parade = false;
      hunter.demo = false;
      hunter.slow = true;
      hunter.warn = 1;
      hunter.grace = 1.2;
      hunter.anger = Math.min(hunter.anger || 0.7, 0.5);
      hunter.orbit = (i * 2.15) + Math.random();
      hunter.orbitR = rand(36, 64);
      hunter.orbitSpeed = rand(0.7, 1.2) * (i % 2 === 0 ? -1 : 1);
      hunter.nearMissed = false;
      applySpeciesToHunter(hunter, wave.species);
    }
    let tx = state.width * 0.5;
    let ty = state.height * 0.5;
    let bossSpeedMul = 1;
    if ((hunter.boss || species === "boss") && state.life) {
      const plan = updateBossHunter(hunter, dt, diff);
      tx = plan.tx;
      ty = plan.ty;
      bossSpeedMul = plan.speedMul;
    } else if (state.life) {
      const dLife = dist(hunter.x, hunter.y, state.life.x, state.life.y);
      const orbit = hunter.orbit ?? i * 2.1;
      const orbitR = hunter.orbitR ?? 42;
      const orbitSpeed = hunter.orbitSpeed ?? 0.9;
      const angOff = orbit + state.time * orbitSpeed;
      if (species === "jelly") {
        tx = state.life.x + Math.sin(hunter.weave) * 48;
        ty = state.life.y - 20 + Math.cos(hunter.pulse) * 36;
      } else if (species === "eel") {
        const lane = 70 + Math.sin(hunter.weave) * 50;
        tx = state.life.x + Math.cos(angOff) * lane;
        ty = state.life.y + Math.sin(angOff * 1.4) * lane * 0.7;
      } else if (species === "ray") {
        // Broad lateral sweep across the player.
        tx = state.life.x + Math.sin(hunter.weave) * 120;
        ty = state.life.y + Math.cos(hunter.weave * 0.7) * 28;
      } else if (species === "ghost") {
        tx = state.life.x + Math.cos(angOff) * (orbitR * 0.7);
        ty = state.life.y + Math.sin(angOff * 1.2) * (orbitR * 0.7);
      } else if (dLife > 160) {
        tx = state.life.x;
        ty = state.life.y;
      } else {
        tx = state.life.x + Math.cos(angOff) * orbitR;
        ty = state.life.y + Math.sin(angOff) * orbitR * 0.85;
      }
    } else if (state.echo) {
      tx = state.echo.x;
      ty = state.echo.y;
    }
    const ang = Math.atan2(ty - hunter.y, tx - hunter.x);
    let speed = (0.88 + state.score * 0.0085) * hunter.anger * wave.speedMul * midgamePace() * diff.speed;
    if (hunter.shadow) speed *= 0.88;
    if (hunter.slow) speed *= 0.68;
    if (hasMut("cool") && state.hunger < 50) speed *= 0.85;
    if (activeEventId() === "calm") speed *= 0.62;
    if (activeEventId() === "raid") speed *= 1.08;
    if (inInkDive()) speed *= 0.35;
    if (species === "dart" && hunter.dashT > 0) speed *= 2.05 * diff.dash;
    if (species === "shark" && hunter.dashT > 0) speed *= 1.75 * diff.dash;
    if (species === "ray") speed *= 0.92;
    if (hunter.boss || species === "boss") speed *= bossSpeedMul;
    speed *= heroAuraSlowMul(hunter);

    // Periodic lunges for dart/shark waves.
    if (state.life && hunter.dashCd <= 0 && hunter.dashT <= 0 && (species === "dart" || species === "shark")) {
      const dLife2 = dist(hunter.x, hunter.y, state.life.x, state.life.y);
      if (dLife2 < (species === "shark" ? 160 : 170) && dLife2 > 56) {
        hunter.dashT = (species === "shark" ? 0.24 : 0.22) * (0.85 + diff.dash * 0.15);
        hunter.dashCd = (species === "shark" ? rand(2.8, 4.2) : rand(0.7, 1.3)) / Math.max(0.7, diff.dash);
        const dashAng = Math.atan2(state.life.y - hunter.y, state.life.x - hunter.x);
        const impulse = (species === "shark" ? 2.4 : 3.1) * diff.dash;
        hunter.vx += Math.cos(dashAng) * impulse;
        hunter.vy += Math.sin(dashAng) * impulse;
      }
    }
    // Ghosts short-blink closer instead of a hard dash.
    if (state.life && species === "ghost" && hunter.dashCd <= 0) {
      const dLife3 = dist(hunter.x, hunter.y, state.life.x, state.life.y);
      if (dLife3 > 90 && dLife3 < 210) {
        const blinkAng = Math.atan2(state.life.y - hunter.y, state.life.x - hunter.x);
        hunter.x += Math.cos(blinkAng) * (28 * diff.dash);
        hunter.y += Math.sin(blinkAng) * (28 * diff.dash);
        hunter.dashCd = rand(1.8, 2.8) / Math.max(0.75, diff.dash);
        hunter.warn = Math.max(hunter.warn, 0.55);
      }
    }

    hunter.vx += Math.cos(ang) * speed * dt * 3.1;
    hunter.vy += Math.sin(ang) * speed * dt * 3.1;
    if (species === "eel") {
      hunter.vx += Math.cos(hunter.weave * 2.2) * 0.55;
      hunter.vy += Math.sin(hunter.weave * 1.7) * 0.55;
    }
    if (species === "ray") {
      hunter.vx += Math.cos(hunter.weave) * 0.7;
      hunter.vy += Math.sin(hunter.weave * 0.5) * 0.25;
    }
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
    const damp = species === "shark" && hunter.dashT > 0 ? 0.94 : 0.955;
    hunter.vx *= damp;
    hunter.vy *= damp;
    hunter.x += hunter.vx * dt * 60;
    hunter.y += hunter.vy * dt * 60;

    if (state.life) {
      const d = dist(hunter.x, hunter.y, state.life.x, state.life.y);
      const fishReach = hunter.r * hunterReachMul(hunter);
      const killR = fishReach + state.life.r * 0.7;
      const nearR = killR + 22;
      if (d < nearR && d >= killR) {
        registerNearMiss(hunter, state.life.x, state.life.y);
      } else if (d >= nearR + 24) {
        hunter.nearMissed = false;
      }
      if (d < killR) {
        if (hunter.grace > 0) {
          // Brand-new fish: push away instead of instantly eating the player on spawn.
          const pushAng = Math.atan2(hunter.y - state.life.y, hunter.x - state.life.x) || 0;
          hunter.vx += Math.cos(pushAng) * 2.8;
          hunter.vy += Math.sin(pushAng) * 2.8;
          if (!hunter.boss) placeHunterOnEdge(hunter);
          hunter.grace = Math.max(hunter.grace, 0.6);
          hunter.warn = 1;
          continue;
        }
        if (absorbHunterHit(hunter)) continue;
        // First real contact with a fish ends the run.
        finishRun(
          hunter.shadow
            ? "твой старый след догнал тебя"
            : hunter.boss
              ? "левиафан сомкнул кольцо"
              : DEATH.HUNTER
        );
        return;
      }
    } else if (state.echo && !inInkDive()) {
      const d = dist(hunter.x, hunter.y, state.echo.x, state.echo.y);
      const killR = hunter.r * hunterReachMul(hunter) + state.echo.r * 0.7;
      if (d < killR + 16 && d >= killR) {
        registerNearMiss(hunter, state.echo.x, state.echo.y);
      }
      if (d < killR) {
        if (absorbHunterHit(hunter)) continue;
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
    state.heroDashCd = Math.max(0, (state.heroDashCd || 0) - dt);
    state.hunger -= HUNGER_DRAIN_PER_SEC * dt * (hasMut("cool") ? 0.7 : 1) * stillPenalty * calmMul * diveMul * (inOpening() ? 0.72 : 1) * playerDifficulty().hunger * heroHungerMul();
    state.hunger = Math.max(0, state.hunger);
  }
  updateHungerUi();
  if (state.hunger < 18 && state.life) {
    state.hungerWarnClock -= dt;
    if (state.hungerWarnClock <= 0) {
      state.hungerWarnClock = 0.55;
      buzz(6);
      sfxHungerTick(state.hunger);
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

function drawLightOrb(x, y, r, color, pulse, alpha = 1, kind = "normal") {
  const isSuper = kind === "super";
  const isRare = kind === "rare";
  const wob = 1 + Math.sin(pulse) * (isSuper ? 0.14 : 0.1);
  const bodyR = r * wob;
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = alpha * 0.4;
  const glow = ctx.createRadialGradient(0, 0, bodyR * 0.15, 0, 0, bodyR * (isSuper ? 2.8 : 2.15));
  glow.addColorStop(0, mixColor(color, "#ffffff", 0.65));
  glow.addColorStop(0.4, color);
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, bodyR * (isSuper ? 2.8 : 2.15), 0, Math.PI * 2);
  ctx.fill();

  // Soft organic core (not a star)
  ctx.globalAlpha = alpha;
  const core = ctx.createRadialGradient(-bodyR * 0.2, -bodyR * 0.25, bodyR * 0.05, 0, 0, bodyR);
  core.addColorStop(0, mixColor(color, "#ffffff", 0.75));
  core.addColorStop(0.55, color);
  core.addColorStop(1, mixColor(color, "#102038", 0.35));
  ctx.fillStyle = core;
  ctx.beginPath();
  const lobes = isSuper ? 7 : isRare ? 6 : 5;
  for (let i = 0; i <= lobes; i += 1) {
    const a = (i / lobes) * Math.PI * 2 + pulse * 0.2;
    const rad = bodyR * (0.72 + 0.28 * Math.sin(pulse * 1.7 + i * 1.3));
    const px = Math.cos(a) * rad;
    const py = Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  // Orbiting motes / ribbons
  const moteCount = isSuper ? 6 : isRare ? 4 : 3;
  for (let i = 0; i < moteCount; i += 1) {
    const a = pulse * (1.4 + i * 0.18) + (i / moteCount) * Math.PI * 2;
    const orbit = bodyR * (1.15 + (i % 2) * 0.35 + Math.sin(pulse + i) * 0.08);
    const mx = Math.cos(a) * orbit;
    const my = Math.sin(a) * orbit * 0.72;
    ctx.globalAlpha = alpha * (0.55 + (i % 2) * 0.25);
    ctx.fillStyle = mixColor(color, "#ffffff", 0.55);
    ctx.beginPath();
    ctx.arc(mx, my, Math.max(1.4, bodyR * (isSuper ? 0.16 : 0.11)), 0, Math.PI * 2);
    ctx.fill();
    if (isSuper || isRare) {
      ctx.strokeStyle = mixColor(color, "#ffffff", 0.35);
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = alpha * 0.35;
      ctx.beginPath();
      ctx.arc(0, 0, orbit, a - 0.45, a + 0.05);
      ctx.stroke();
    }
  }

  if (isSuper) {
    ctx.globalAlpha = alpha * 0.7;
    ctx.strokeStyle = mixColor(color, "#ffffff", 0.25);
    ctx.lineWidth = 2;
    const ring = bodyR * (1.55 + Math.sin(pulse * 2) * 0.2);
    ctx.beginPath();
    ctx.ellipse(0, 0, ring * 1.15, ring * 0.55, pulse * 0.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, 0, ring * 0.55, ring * 1.1, -pulse * 0.4, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.globalAlpha = alpha * 0.9;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.beginPath();
  ctx.arc(-bodyR * 0.18, -bodyR * 0.2, Math.max(1.6, bodyR * 0.18), 0, Math.PI * 2);
  ctx.fill();
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
  const r = spark.r;
  if (spark.comet) {
    const ang = Math.atan2(spark.vy, spark.vx || 0.001);
    ctx.save();
    ctx.translate(spark.x, spark.y);
    ctx.rotate(ang);
    const trail = ctx.createLinearGradient(-40, 0, 14, 0);
    trail.addColorStop(0, "transparent");
    trail.addColorStop(0.55, spark.color);
    trail.addColorStop(1, mixColor(spark.color, "#fff4d8", 0.4));
    ctx.fillStyle = trail;
    ctx.globalAlpha = 0.95;
    ctx.beginPath();
    ctx.moveTo(-40, 0);
    ctx.lineTo(10, -6);
    ctx.lineTo(10, 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  if (spark.type === "seed") {
    ctx.save();
    ctx.translate(spark.x, spark.y);
    ctx.rotate(spark.pulse * 0.4);
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
    drawLightOrb(spark.x, spark.y, r, spark.color, spark.pulse, 1, kind);
  }
  if (spark.type === "super") {
    const t = (state.time * 2.2) % 1;
    ctx.globalAlpha = (1 - t) * 0.75;
    ctx.strokeStyle = "#ff2f45";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(
      spark.x,
      spark.y,
      r * (1.4 + t * 1.8),
      r * (0.7 + t * 0.9),
      state.time * 1.2,
      0,
      Math.PI * 2
    );
    ctx.stroke();
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = "#ff2f45";
    ctx.font = "800 12px Syne, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("ПУЛЬСАР", spark.x, spark.y - r * 1.85);
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
    const fishW = r * 4.2;
    const fishH = r * 2.15;
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

function drawDartHunter(hunter, alpha = 1) {
  const angle = Math.atan2(hunter.vy || 0.001, hunter.vx || 0.001);
  const r = hunter.r;
  const dash = hunter.dashT > 0;
  ctx.save();
  ctx.translate(hunter.x, hunter.y);
  ctx.rotate(angle);
  ctx.globalAlpha = alpha;
  if (dash) {
    ctx.strokeStyle = "rgba(255,220,140,0.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 2.8, 0);
    ctx.lineTo(-r * 0.8, 0);
    ctx.stroke();
  }
  ctx.fillStyle = "#ffb45a";
  ctx.beginPath();
  ctx.moveTo(r * 1.7, 0);
  ctx.lineTo(-r * 1.1, -r * 0.55);
  ctx.lineTo(-r * 0.7, 0);
  ctx.lineTo(-r * 1.1, r * 0.55);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fff4d8";
  ctx.beginPath();
  ctx.arc(r * 0.7, -r * 0.1, r * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a0810";
  ctx.beginPath();
  ctx.arc(r * 0.78, -r * 0.08, r * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawJellyHunter(hunter, alpha = 1) {
  const r = hunter.r * (1 + Math.max(0, Math.sin(hunter.pulse || 0)) * 0.18);
  const wob = hunter.phase || 0;
  ctx.save();
  ctx.translate(hunter.x, hunter.y);
  ctx.globalAlpha = alpha * 0.9;
  const bell = ctx.createRadialGradient(0, -r * 0.2, r * 0.1, 0, 0, r * 1.2);
  bell.addColorStop(0, "rgba(255,180,220,0.95)");
  bell.addColorStop(0.55, "rgba(255,90,160,0.85)");
  bell.addColorStop(1, "rgba(120,40,90,0.2)");
  ctx.fillStyle = bell;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 1.15, r * 0.85, 0, Math.PI, 0);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,210,230,0.55)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 1.15, r * 0.85, 0, Math.PI, 0);
  ctx.stroke();
  for (let i = 0; i < 5; i += 1) {
    const ox = (i - 2) * r * 0.28;
    ctx.strokeStyle = "rgba(255,150,200,0.65)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(ox, r * 0.05);
    ctx.quadraticCurveTo(
      ox + Math.sin(wob + i) * r * 0.25,
      r * 0.7,
      ox + Math.cos(wob * 1.3 + i) * r * 0.2,
      r * 1.35
    );
    ctx.stroke();
  }
  ctx.restore();
}

function drawEelHunter(hunter, alpha = 1) {
  const angle = Math.atan2(hunter.vy || 0.001, hunter.vx || 0.001);
  const r = hunter.r;
  const weave = hunter.weave || 0;
  ctx.save();
  ctx.translate(hunter.x, hunter.y);
  ctx.rotate(angle);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = "#3cffb0";
  ctx.lineWidth = r * 0.85;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-r * 2.4, Math.sin(weave) * r * 0.5);
  ctx.quadraticCurveTo(-r * 0.8, -Math.sin(weave * 1.4) * r * 0.7, r * 0.2, Math.sin(weave * 0.8) * r * 0.25);
  ctx.quadraticCurveTo(r * 1.1, -Math.sin(weave) * r * 0.35, r * 2.1, 0);
  ctx.stroke();
  ctx.strokeStyle = "#9dffd8";
  ctx.lineWidth = r * 0.35;
  ctx.beginPath();
  ctx.moveTo(-r * 2.1, Math.sin(weave) * r * 0.35);
  ctx.lineTo(r * 1.6, 0);
  ctx.stroke();
  ctx.fillStyle = "#fffdf8";
  ctx.beginPath();
  ctx.arc(r * 1.55, -r * 0.12, r * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#081018";
  ctx.beginPath();
  ctx.arc(r * 1.62, -r * 0.1, r * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSharkHunter(hunter, alpha = 1) {
  const angle = Math.atan2(hunter.vy || 0.001, hunter.vx || 0.001);
  const r = hunter.r;
  const dash = hunter.dashT > 0;
  ctx.save();
  ctx.translate(hunter.x, hunter.y);
  ctx.rotate(angle);
  ctx.globalAlpha = alpha;
  if (dash) {
    ctx.fillStyle = "rgba(140,190,255,0.28)";
    ctx.beginPath();
    ctx.moveTo(-r * 3.2, 0);
    ctx.lineTo(-r * 1.2, -r * 0.45);
    ctx.lineTo(-r * 1.2, r * 0.45);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = "#6a8eae";
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 1.55, r * 0.72, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#4a6a86";
  ctx.beginPath();
  ctx.moveTo(-r * 1.2, 0);
  ctx.lineTo(-r * 2.15, -r * 0.55);
  ctx.lineTo(-r * 1.7, 0);
  ctx.lineTo(-r * 2.15, r * 0.55);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#3d5a74";
  ctx.beginPath();
  ctx.moveTo(-r * 0.1, -r * 0.55);
  ctx.lineTo(r * 0.25, -r * 1.35);
  ctx.lineTo(r * 0.55, -r * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#dfeaf4";
  ctx.beginPath();
  ctx.ellipse(r * 0.1, r * 0.2, r * 0.7, r * 0.32, 0.1, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = "#fff8f0";
  ctx.beginPath();
  ctx.arc(r * 0.85, -r * 0.12, r * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#120810";
  ctx.beginPath();
  ctx.arc(r * 0.92, -r * 0.1, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawRayHunter(hunter, alpha = 1) {
  const angle = Math.atan2(hunter.vy || 0.001, hunter.vx || 0.001);
  const r = hunter.r;
  const flap = Math.sin(hunter.weave || 0) * 0.18;
  ctx.save();
  ctx.translate(hunter.x, hunter.y);
  ctx.rotate(angle);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#5ec4c0";
  ctx.beginPath();
  ctx.moveTo(r * 1.5, 0);
  ctx.quadraticCurveTo(r * 0.2, -r * (1.35 + flap), -r * 1.1, -r * 0.15);
  ctx.lineTo(-r * 1.55, 0);
  ctx.lineTo(-r * 1.1, r * 0.15);
  ctx.quadraticCurveTo(r * 0.2, r * (1.35 + flap), r * 1.5, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#d8fffb";
  ctx.beginPath();
  ctx.ellipse(r * 0.35, 0, r * 0.55, r * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0c2030";
  ctx.beginPath();
  ctx.arc(r * 0.85, -r * 0.08, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGhostHunter(hunter, alpha = 1) {
  const angle = Math.atan2(hunter.vy || 0.001, hunter.vx || 0.001);
  const r = hunter.r;
  const a = alpha * (hunter.phaseAlpha ?? 0.7);
  ctx.save();
  ctx.translate(hunter.x, hunter.y);
  ctx.rotate(angle);
  ctx.globalAlpha = a;
  ctx.fillStyle = "rgba(190, 210, 255, 0.85)";
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 1.2, r * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(230, 240, 255, 0.7)";
  ctx.lineWidth = 1.6;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 1.35, r * 0.85, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#f7fbff";
  ctx.beginPath();
  ctx.arc(r * 0.45, -r * 0.1, r * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#203050";
  ctx.beginPath();
  ctx.arc(r * 0.5, -r * 0.08, r * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBossHunter(hunter, alpha = 1) {
  const pulse = hunter.pulse || 0;
  const aim = Math.atan2(hunter.vy || 0.01, hunter.vx || 0.01);
  const s = hunter.r;
  const body = "#1a2a44";
  const accent = hunter.bossPhase === "telegraph" || hunter.bossPhase === "charge"
    ? "#ff6b7a"
    : "#7ab8ff";
  ctx.save();
  ctx.translate(hunter.x, hunter.y);
  ctx.rotate(aim);
  ctx.globalAlpha = alpha * 0.35;
  const glow = ctx.createRadialGradient(0, 0, s * 0.2, 0, 0, s * 2.4);
  glow.addColorStop(0, mixColor(accent, "#ffffff", 0.2));
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, s * 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = alpha;
  // Serpent body
  ctx.fillStyle = mixColor(body, accent, 0.18);
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 1.35, s * 0.72, 0, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 1; i <= 4; i += 1) {
    const t = -s * (0.55 + i * 0.42);
    const wob = Math.sin(pulse * 2 + i) * s * 0.12;
    ctx.beginPath();
    ctx.ellipse(t, wob, s * (0.7 - i * 0.08), s * (0.42 - i * 0.04), 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Jaw / crest
  ctx.fillStyle = mixColor(accent, "#120818", 0.35);
  ctx.beginPath();
  ctx.moveTo(s * 0.9, -s * 0.2);
  ctx.lineTo(s * 1.55, 0);
  ctx.lineTo(s * 0.9, s * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fffdf8";
  ctx.beginPath();
  ctx.arc(s * 0.45, -s * 0.18, s * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#120818";
  ctx.beginPath();
  ctx.arc(s * 0.5, -s * 0.18, s * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if ((hunter.bossPhase === "telegraph" || hunter.bossPhase === "charge") && !inInkDive()) {
    const ring = hunter.bossPhase === "charge"
      ? s * (1.4 + (1 - (hunter.bossTimer || 0) / 0.55) * 0.8)
      : s * (1.8 + (1 - (hunter.bossTimer || 0) / 0.85) * 1.4);
    ctx.save();
    ctx.globalAlpha = hunter.bossPhase === "telegraph" ? 0.55 : 0.35;
    ctx.strokeStyle = accent;
    ctx.lineWidth = hunter.bossPhase === "telegraph" ? 3 : 2;
    ctx.beginPath();
    ctx.arc(hunter.x, hunter.y, ring, 0, Math.PI * 2);
    ctx.stroke();
    if (hunter.bossPhase === "telegraph") {
      ctx.globalAlpha = 0.35;
      ctx.setLineDash([8, 10]);
      ctx.beginPath();
      ctx.moveTo(hunter.x, hunter.y);
      ctx.lineTo(hunter.chargeTx, hunter.chargeTy);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }
}

function drawHeroAura() {
  if (!state.life || !state.running) return;
  const hero = activeHeroId();
  if (hero === "jellyfish") {
    const reach = 118 + Math.sin(state.time * 2.4) * 6;
    ctx.save();
    ctx.globalAlpha = 0.16 + Math.sin(state.time * 3) * 0.04;
    ctx.strokeStyle = cssVar("--accent-b", "#7affd4");
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(state.life.x, state.life.y, reach, 0, Math.PI * 2);
    ctx.stroke();
    const soft = ctx.createRadialGradient(state.life.x, state.life.y, reach * 0.2, state.life.x, state.life.y, reach);
    soft.addColorStop(0, "rgba(122, 255, 212, 0.08)");
    soft.addColorStop(1, "transparent");
    ctx.fillStyle = soft;
    ctx.beginPath();
    ctx.arc(state.life.x, state.life.y, reach, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (hero === "crab" && state.heroShield) {
    const pulse = 1 + Math.sin(state.time * 4) * 0.06;
    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.strokeStyle = cssVar("--accent-a", "#ff9a62");
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(state.life.x, state.life.y, state.life.r * 1.55 * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  } else if (heroCanDash() && state.heroDashCd <= 0 && !inOpening()) {
    ctx.save();
    ctx.globalAlpha = 0.22 + Math.sin(state.time * 5) * 0.06;
    ctx.strokeStyle = cssVar("--life", "#7affd4");
    ctx.lineWidth = 1.6;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.arc(state.life.x, state.life.y, state.life.r * 1.7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }
}

function drawHunter(hunter) {
  const alpha = inInkDive() ? 0.28 : 1;
  if (hunter.shadow) {
    ctx.save();
    drawEvilFish(hunter, inInkDive() ? 0.2 : 0.68, true);
    ctx.restore();
    return;
  }
  const species = hunter.species || "fish";
  if (species === "boss" || hunter.boss) drawBossHunter(hunter, alpha);
  else if (species === "dart") drawDartHunter(hunter, alpha);
  else if (species === "jelly") drawJellyHunter(hunter, alpha);
  else if (species === "eel") drawEelHunter(hunter, alpha);
  else if (species === "shark") drawSharkHunter(hunter, alpha);
  else if (species === "ray") drawRayHunter(hunter, alpha);
  else if (species === "ghost") drawGhostHunter(hunter, alpha);
  else drawEvilFish(hunter, alpha, false);
  if (hunter.warn > 0 && !inInkDive() && species !== "boss" && !hunter.boss) {
    ctx.save();
    ctx.globalAlpha = hunter.warn * 0.5;
    ctx.strokeStyle =
      species === "eel" ? "#3cffb0"
      : species === "jelly" ? "#ff7ab8"
      : species === "ray" ? "#7ef0ea"
      : species === "ghost" ? "#c8d8ff"
      : cssVar("--danger", "#ff6888");
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(hunter.x, hunter.y, hunter.r * (hunterReachMul(hunter) + (1 - hunter.warn) * 1.2), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawHeroEyes(s, wob, alpha, eyeY = 0) {
  const blink = Math.sin(wob * 0.32) > 0.93 ? 0.2 : 1;
  for (const side of [-1, 1]) {
    const ex = s * 0.28;
    const ey = side * s * 0.22 + eyeY;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#fffdf8";
    ctx.beginPath();
    ctx.ellipse(ex, ey, s * 0.16, s * 0.2 * blink, side * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#120818";
    ctx.beginPath();
    ctx.arc(ex + s * 0.04, ey, s * 0.07 * blink, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(ex + s * 0.07, ey - s * 0.04, s * 0.03, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawJellyfish(body, alpha = 1) {
  const ink = lifeInkColor();
  const accentB = cssVar("--accent-b", "#7affd4");
  const aim = body.aim ?? -Math.PI / 2;
  const s = body.r;
  const wob = body.wobble;
  ctx.save();
  ctx.translate(body.x, body.y);
  ctx.rotate(aim);
  ctx.lineCap = "round";
  for (let i = 0; i < 7; i += 1) {
    const spread = (i - 3) * 0.22;
    const len = s * (1.35 + Math.sin(wob + i) * 0.2);
    ctx.globalAlpha = alpha * (0.35 + (i % 3) * 0.1);
    ctx.strokeStyle = mixColor(ink, accentB, 0.35);
    ctx.lineWidth = Math.max(1.4, s * 0.08);
    ctx.beginPath();
    ctx.moveTo(s * 0.05, spread * s * 0.35);
    ctx.quadraticCurveTo(-s * 0.35, spread * s * 0.9, -len, spread * s * 1.1 + Math.sin(wob * 1.4 + i) * s * 0.2);
    ctx.stroke();
  }
  ctx.globalAlpha = alpha;
  const bell = ctx.createRadialGradient(s * 0.1, 0, s * 0.1, 0, 0, s);
  bell.addColorStop(0, mixColor(ink, "#ffffff", 0.45));
  bell.addColorStop(0.55, mixColor(ink, accentB, 0.2));
  bell.addColorStop(1, mixColor(ink, "#1a2848", 0.25));
  ctx.fillStyle = bell;
  ctx.beginPath();
  ctx.ellipse(s * 0.08, 0, s * 0.85, s * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
  drawHeroEyes(s, wob, alpha, -s * 0.05);
  ctx.restore();
}

function drawTurtle(body, alpha = 1) {
  const ink = lifeInkColor();
  const accent = cssVar("--accent-a", "#ff9a62");
  const aim = body.aim ?? -Math.PI / 2;
  const s = body.r;
  const wob = body.wobble;
  ctx.save();
  ctx.translate(body.x, body.y);
  ctx.rotate(aim);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = mixColor(ink, accent, 0.2);
  for (const [fx, fy, fr] of [
    [s * 0.85, 0, s * 0.28],
    [-s * 0.55, -s * 0.45, s * 0.22],
    [-s * 0.55, s * 0.45, s * 0.22],
    [-s * 0.95, 0, s * 0.2],
  ]) {
    ctx.beginPath();
    ctx.ellipse(fx, fy + Math.sin(wob + fx) * s * 0.03, fr, fr * 0.72, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = mixColor(ink, "#2a4030", 0.35);
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.95, s * 0.72, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = mixColor(ink, "#102018", 0.4);
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-s * 0.35, 0);
  ctx.lineTo(s * 0.35, 0);
  ctx.moveTo(0, -s * 0.35);
  ctx.lineTo(0, s * 0.35);
  ctx.stroke();
  ctx.fillStyle = mixColor(ink, accent, 0.15);
  ctx.beginPath();
  ctx.ellipse(s * 0.72, 0, s * 0.34, s * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  drawHeroEyes(s * 0.85, wob, alpha, 0);
  ctx.restore();
}

function drawCrab(body, alpha = 1) {
  const ink = lifeInkColor();
  const accent = cssVar("--accent-a", "#ff9a62");
  const aim = body.aim ?? -Math.PI / 2;
  const s = body.r;
  const wob = body.wobble;
  ctx.save();
  ctx.translate(body.x, body.y);
  ctx.rotate(aim);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = mixColor(ink, accent, 0.25);
  ctx.lineWidth = Math.max(2, s * 0.12);
  ctx.lineCap = "round";
  for (const side of [-1, 1]) {
    const clawX = s * 0.7;
    const clawY = side * s * 0.55;
    ctx.beginPath();
    ctx.moveTo(s * 0.2, side * s * 0.2);
    ctx.quadraticCurveTo(s * 0.55, clawY, clawX, clawY);
    ctx.stroke();
    ctx.fillStyle = mixColor(ink, accent, 0.2);
    ctx.beginPath();
    ctx.ellipse(clawX + s * 0.08, clawY, s * 0.22, s * 0.14, side * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 3; i += 1) {
    for (const side of [-1, 1]) {
      const lx = -s * (0.1 + i * 0.18);
      const ly = side * s * (0.45 + i * 0.05);
      ctx.beginPath();
      ctx.moveTo(lx + s * 0.2, side * s * 0.1);
      ctx.lineTo(lx - s * 0.15, ly + Math.sin(wob + i) * s * 0.08);
      ctx.stroke();
    }
  }
  ctx.fillStyle = mixColor(ink, accent, 0.18);
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.78, s * 0.58, 0, 0, Math.PI * 2);
  ctx.fill();
  drawHeroEyes(s, wob, alpha, -s * 0.05);
  ctx.restore();
}

function drawCustomHero(body, alpha = 1) {
  if (!customHeroImage.ready || !customHeroImage.img) {
    drawInkPolyp(body, alpha);
    return;
  }
  const aim = body.aim ?? -Math.PI / 2;
  const s = body.r;
  const size = s * 2.5;
  ctx.save();
  ctx.translate(body.x, body.y);
  ctx.rotate(aim + Math.PI / 2);
  ctx.globalAlpha = alpha;
  ctx.drawImage(customHeroImage.img, -size * 0.5, -size * 0.5, size, size);
  ctx.restore();
}

function drawLifeBody(body, alpha = 1) {
  const hero = activeHeroId();
  if (hero === "jellyfish") drawJellyfish(body, alpha);
  else if (hero === "turtle") drawTurtle(body, alpha);
  else if (hero === "crab") drawCrab(body, alpha);
  else if (hero === "custom") drawCustomHero(body, alpha);
  else drawInkPolyp(body, alpha);
}

const drawTool = {
  drawing: false,
  dirty: false,
  color: "#fff1e4",
  lastX: 0,
  lastY: 0,
};

function paintDrawGuide() {
  if (!drawCtx || !drawCanvasEl) return;
  const w = drawCanvasEl.width;
  const h = drawCanvasEl.height;
  const cx = w * 0.5;
  const cy = h * 0.48;
  const r = Math.min(w, h) * 0.28;
  drawCtx.save();
  drawCtx.strokeStyle = "rgba(255, 241, 228, 0.22)";
  drawCtx.lineWidth = 2;
  drawCtx.setLineDash([8, 8]);
  drawCtx.beginPath();
  drawCtx.arc(cx, cy, r, 0, Math.PI * 2);
  drawCtx.stroke();
  drawCtx.setLineDash([]);
  drawCtx.fillStyle = "rgba(255, 241, 228, 0.28)";
  drawCtx.font = "600 18px Instrument Sans, sans-serif";
  drawCtx.textAlign = "center";
  drawCtx.fillText("рисуй здесь", cx, cy + r + 28);
  drawCtx.restore();
}

function clearDrawCanvas() {
  if (!drawCtx || !drawCanvasEl) return;
  drawCtx.clearRect(0, 0, drawCanvasEl.width, drawCanvasEl.height);
  // Opaque base so strokes are visible; export keeps solid pixels on transparent via destination-over trim later.
  drawCtx.fillStyle = "rgba(12, 32, 64, 0.01)";
  drawCtx.fillRect(0, 0, drawCanvasEl.width, drawCanvasEl.height);
  paintDrawGuide();
  drawTool.dirty = false;
}

function exportCustomHeroPng() {
  if (!drawCanvasEl || !drawTool.dirty) return "";
  return drawCanvasEl.toDataURL("image/png");
}

function openDrawHero() {
  if (!screenDrawEl || !drawCanvasEl) return;
  screenStartEl?.classList.add("hidden");
  screenOnboardEl?.classList.add("hidden");
  screenOverEl?.classList.add("hidden");
  screenDrawEl.classList.remove("hidden");
  clearDrawCanvas();
  drawTool.color = "#fff1e4";
  document.querySelectorAll(".draw-color").forEach((btn) => {
    btn.classList.toggle("on", btn.dataset.color === drawTool.color);
    btn.style.setProperty("--swatch", btn.dataset.color);
  });
}

function closeDrawHero(backToStart = true) {
  screenDrawEl?.classList.add("hidden");
  if (backToStart) screenStartEl?.classList.remove("hidden");
}

function drawPointerPos(e) {
  const rect = drawCanvasEl.getBoundingClientRect();
  const scaleX = drawCanvasEl.width / Math.max(1, rect.width);
  const scaleY = drawCanvasEl.height / Math.max(1, rect.height);
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
}

function strokeDraw(x0, y0, x1, y1) {
  if (!drawCtx) return;
  if (!drawTool.dirty) {
    // Wipe guide text/circle once the player starts drawing.
    drawCtx.clearRect(0, 0, drawCanvasEl.width, drawCanvasEl.height);
    drawTool.dirty = true;
  }
  drawCtx.strokeStyle = drawTool.color;
  drawCtx.fillStyle = drawTool.color;
  drawCtx.lineWidth = 16;
  drawCtx.lineCap = "round";
  drawCtx.lineJoin = "round";
  drawCtx.beginPath();
  drawCtx.moveTo(x0, y0);
  drawCtx.lineTo(x1, y1);
  drawCtx.stroke();
  drawCtx.beginPath();
  drawCtx.arc(x1, y1, 8, 0, Math.PI * 2);
  drawCtx.fill();
}

function bindDrawHeroUi() {
  if (!drawCanvasEl || !drawCtx) return;
  document.querySelectorAll(".draw-color").forEach((btn) => {
    btn.style.setProperty("--swatch", btn.dataset.color);
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      drawTool.color = btn.dataset.color || "#fff1e4";
      document.querySelectorAll(".draw-color").forEach((b) => b.classList.toggle("on", b === btn));
    });
  });
  const startDraw = (e) => {
    e.preventDefault();
    e.stopPropagation();
    drawCanvasEl.setPointerCapture?.(e.pointerId);
    drawTool.drawing = true;
    const p = drawPointerPos(e);
    drawTool.lastX = p.x;
    drawTool.lastY = p.y;
    strokeDraw(p.x, p.y, p.x, p.y);
  };
  const moveDraw = (e) => {
    if (!drawTool.drawing) return;
    e.preventDefault();
    e.stopPropagation();
    const p = drawPointerPos(e);
    strokeDraw(drawTool.lastX, drawTool.lastY, p.x, p.y);
    drawTool.lastX = p.x;
    drawTool.lastY = p.y;
  };
  const endDraw = (e) => {
    if (!drawTool.drawing) return;
    e.preventDefault();
    drawTool.drawing = false;
  };
  drawCanvasEl.addEventListener("pointerdown", startDraw, { passive: false });
  drawCanvasEl.addEventListener("pointermove", moveDraw, { passive: false });
  drawCanvasEl.addEventListener("pointerup", endDraw, { passive: false });
  drawCanvasEl.addEventListener("pointercancel", endDraw, { passive: false });
  btnDrawClear?.addEventListener("click", (e) => {
    e.preventDefault();
    clearDrawCanvas();
  });
  btnDrawCancel?.addEventListener("click", (e) => {
    e.preventDefault();
    closeDrawHero(true);
  });
  btnDrawSave?.addEventListener("click", (e) => {
    e.preventDefault();
    if (!state.meta || !drawCanvasEl) return;
    const data = exportCustomHeroPng();
    if (!data) {
      showToast("сначала нарисуй героя");
      return;
    }
    state.meta.customHero = data;
    state.meta.activeHero = "custom";
    saveMeta();
    loadCustomHeroImage(data);
    closeDrawHero(true);
    renderHeroPicker();
    showToast("свой герой готов");
  });
  btnDrawHero?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openDrawHero();
  });
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
  drawHeroAura();
  if (!state.life || !playerIsSafe()) return;
  const left = Math.max(0, state.safeUntil - performance.now()) / 900;
  ctx.save();
  ctx.globalAlpha = 0.18 + clamp(left, 0, 1) * 0.2;
  ctx.strokeStyle = cssVar("--foam", "#f3eee8");
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(state.life.x, state.life.y, state.life.r * 1.85, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
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
  loadCustomHeroImage(state.meta.customHero || "");
  touchPlayDay();
  touchVisitClock();
  refreshDaily();
  state.best = state.meta.best;
  updateBestLabels();
  renderDaily();
  renderSkinMeta();
  renderHeroPicker();
  renderGifts();
  updateEconomyLabels();
  resize();
  applyThemeFromScore(false);
  updateScoreUi(false);
  updateHungerUi();
  updateMutationUi();
  updateWaveUi(false);
  resetDemo();
  bindDrawHeroUi();
  bindHoldButton(btnStart, "start");
  bindHoldButton(btnRetry, "retry");
  setInterval(() => {
    if (!screenStartEl || screenStartEl.classList.contains("hidden")) return;
    renderGifts();
  }, 15000);
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
    if (!state.meta.sound) {
      hum(false);
      state.audioUnlocked = false;
    } else {
      unlockAudio();
      sfxUiTap(2);
    }
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
    if (soundEnabled()) unlockAudio();
    touchVisitClock();
    if (!screenStartEl?.classList.contains("hidden")) renderGifts();
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
      .register("./sw.js?v=52")
      .then((reg) => reg.update())
      .catch(() => {});
  }
}

boot();
