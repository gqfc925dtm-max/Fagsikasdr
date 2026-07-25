const BEST_KEY = "ottisk-best-v2";
const META_KEY = "ottisk-meta-v1";
const HOLD_SECONDS = 0.62;
const HUNGER_DRAIN_PER_SEC = 100 / 12;
const THEME_NAMES = ["уголь", "глубина", "янтарь", "мох", "дымка", "пыльца"];
const DEATH = {
  HUNTER: "охотник поймал оттиск",
  ECHO: "тень сожрала след",
  HUNGER: "свет иссяк — слишком долго без пищи",
};

const MUTATIONS = [
  { id: "spark", at: 0, name: "искра" },
  { id: "cool", at: 5, name: "хладь" },
  { id: "magnet", at: 12, name: "магнит" },
  { id: "veins", at: 20, name: "жилы" },
  { id: "fang", at: 30, name: "клык" },
  { id: "bloom", at: 42, name: "цвет" },
];

const SKINS = [
  { id: "ink", name: "чернь", at: 0, color: "#f2eee7" },
  { id: "mint", name: "мята", at: 25, color: "#9cf0d0" },
  { id: "ember", name: "жар", at: 60, color: "#ffc07d" },
  { id: "frost", name: "иней", at: 100, color: "#cfe1ff" },
  { id: "void", name: "пусто", at: 160, color: "#d7baff" },
  { id: "solar", name: "солнце", at: 9999, cost: 40, color: "#ffd27a", premium: true },
  { id: "noir", name: "нуар", at: 9999, cost: 70, color: "#9aa0ff", premium: true },
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
const mutBadgeEl = document.getElementById("mut-badge");
const themeChipEl = document.getElementById("theme-chip");
const heatEl = document.getElementById("heat");
const heatFillEl = document.getElementById("heat-fill");
const heatPctEl = document.getElementById("heat-pct");
const mutTrackFillEl = document.getElementById("mut-track-fill");
const nextMutEl = document.getElementById("next-mut");
const goalBarEl = document.getElementById("goal-bar");
const holdFillEl = document.getElementById("hold-fill");
const holdFillOverEl = document.getElementById("hold-fill-over");
const screenStartEl = document.getElementById("screen-start");
const screenOverEl = document.getElementById("screen-over");
const bestStartEl = document.getElementById("best-start");
const bestOverEl = document.getElementById("best-over");
const finalScoreEl = document.getElementById("final-score");
const deathReasonEl = document.getElementById("death-reason");
const mutSummaryEl = document.getElementById("mut-summary");
const goalsResultEl = document.getElementById("goals-result");
const skinResultEl = document.getElementById("skin-result");
const skinNameEl = document.getElementById("skin-name");
const skinUnlocksEl = document.getElementById("skin-unlocks");
const btnStart = document.getElementById("btn-start");
const btnRetry = document.getElementById("btn-retry");
const dailyChipEl = document.getElementById("daily-chip");
const dailyCardEl = document.getElementById("daily-card");
const streakStartEl = document.getElementById("streak-start");
const marksStartEl = document.getElementById("marks-start");
const screenContinueEl = document.getElementById("screen-continue");
const continueReasonEl = document.getElementById("continue-reason");
const btnContinue = document.getElementById("btn-continue");
const continueLabelEl = document.getElementById("continue-label");
const adFillEl = document.getElementById("ad-fill");
const btnSkipContinue = document.getElementById("btn-skip-continue");
const btnShare = document.getElementById("btn-share");
const streakOverEl = document.getElementById("streak-over");
const dailyResultEl = document.getElementById("daily-result");
const shareCanvasEl = document.getElementById("share-canvas");

const GOAL_DEFS = [
  {
    id: "light12",
    title: "12 света",
    label: (s) => `свет ${Math.min(s.stats.sparkEats, 12)}/12`,
    check: (s) => s.stats.sparkEats >= 12,
  },
  {
    id: "rare3",
    title: "3 редких",
    label: (s) => `редкие ${Math.min(s.stats.rareEats, 3)}/3`,
    check: (s) => s.stats.rareEats >= 3,
  },
  {
    id: "theme2",
    title: "тема 2",
    label: (s) => (s.score >= 100 ? "тема 2" : `${Math.min(s.score, 100)}/100`),
    check: (s) => s.score >= 100,
  },
  {
    id: "fang",
    title: "клык",
    label: (s) => (hasMut("fang") ? "клык" : `${Math.min(s.score, 30)}/30`),
    check: () => hasMut("fang"),
  },
  {
    id: "combo6",
    title: "цепь 6",
    label: (s) => `цепь ${Math.min(s.stats.maxCombo, 6)}/6`,
    check: (s) => s.stats.maxCombo >= 6,
  },
  {
    id: "survive45",
    title: "45 секунд",
    label: (s) => `${Math.min(Math.floor(s.elapsed), 45)}/45с`,
    check: (s) => s.elapsed >= 45,
  },
  {
    id: "hunters2",
    title: "2 охотника",
    label: (s) => `охота ${Math.min(s.stats.hunterEats, 2)}/2`,
    check: (s) => s.stats.hunterEats >= 2,
  },
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
  ash: [],
  spawnAcc: 0,
  hunterAcc: 0,
  slowHunterSeen: false,
  bloomPulse: 0,
  flash: 0,
  shake: 0,
  deathReason: "",
  goals: [],
  evaluatingGoals: false,
  coachCount: 0,
  hold: null,
  meta: null,
  runUnlockedSkins: [],
  pendingDeathReason: "",
  continueUsed: false,
  safeUntil: 0,
  continueAdActive: false,
  continueAdStartedAt: 0,
  continueAdRaf: 0,
  continueClickGuardUntil: 0,
  stats: {
    sparkEats: 0,
    rareEats: 0,
    hunterEats: 0,
    maxCombo: 0,
  },
  audio: null,
  humNode: null,
  demoClock: 0,
  demoDownClock: 0,
};

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

function buzz(pattern = 8) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

function ensureAudio() {
  if (state.audio) return state.audio;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  state.audio = new AudioCtx();
  return state.audio;
}

function tone(freq, dur = 0.08, type = "sine", gain = 0.04, delay = 0) {
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
  const ac = ensureAudio();
  if (!ac) return;
  if (ac.state === "suspended") ac.resume().catch(() => {});
  if (!on) {
    if (!state.humNode) return;
    const { g, o1, o2 } = state.humNode;
    const t = ac.currentTime;
    g.gain.cancelScheduledValues(t);
    g.gain.setTargetAtTime(0.0001, t, 0.05);
    o1.stop(t + 0.16);
    o2.stop(t + 0.16);
    state.humNode = null;
    return;
  }
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
  if (type === "rare") {
    tone(980, 0.11, "triangle", 0.04);
  } else if (type === "cool") {
    tone(420, 0.1, "sine", 0.026);
  } else if (type === "bait") {
    tone(260, 0.08, "square", 0.028);
    tone(190, 0.1, "triangle", 0.022, 0.07);
  } else {
    tone(620 + Math.min(12, state.combo) * 18, 0.055, "sine", 0.028);
  }
}

function showCombo(text) {
  comboEl.textContent = text;
  comboEl.className = "combo show";
  clearTimeout(showCombo.timer);
  showCombo.timer = setTimeout(() => comboEl.classList.remove("show"), 750);
}

function showToast(text, ms = 1450) {
  toastEl.textContent = text;
  toastEl.className = "toast show";
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toastEl.classList.remove("show"), ms);
}

function showCoach(text, ms = 1600) {
  if (state.coachCount >= 2) return;
  state.coachCount += 1;
  coachEl.textContent = text;
  coachEl.className = "coach show";
  clearTimeout(showCoach.timer);
  showCoach.timer = setTimeout(() => coachEl.classList.remove("show"), ms);
}

function floatText(x, y, text, color = "#f2c15a", size = 16) {
  state.floaters.push({ x, y, text, color, size, life: 1, vy: -0.45 });
}

function burst(x, y, color, count = 12, speed = 3.5) {
  for (let i = 0; i < count; i += 1) {
    const a = Math.random() * Math.PI * 2;
    const s = rand(0.7, speed);
    state.particles.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: 1,
      decay: rand(0.012, 0.028),
      size: rand(1.2, 3.4),
      color,
    });
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
  if (dailyChipEl) dailyChipEl.textContent = state.meta?.dailyDone ? "ежедневка · +15 взято" : `день · ${daily.title} · ${daily.label(state)}`;
}

function awardMarks(amount, opts = {}) {
  if (!state.meta || !amount) return;
  state.meta.marks = Math.max(0, Math.round((state.meta.marks || 0) + amount));
  saveMeta();
  updateEconomyLabels();
  renderDaily();
  renderSkinMeta();
  if (opts.x != null && opts.y != null) {
    floatText(opts.x, opts.y, `+${amount} следов`, opts.color || cssVar("--gold", "#f2c15a"), opts.size || 15);
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
  mutBadgeEl.textContent = state.mutation.name;
  const currentIdx = MUTATIONS.findIndex((m) => m.id === state.mutation.id);
  const next = MUTATIONS[currentIdx + 1];
  if (!next) {
    mutTrackFillEl.style.width = "100%";
    nextMutEl.textContent = "форма полная";
    return;
  }
  const span = Math.max(1, next.at - state.mutation.at);
  const progress = clamp((state.score - state.mutation.at) / span, 0, 1);
  mutTrackFillEl.style.width = `${Math.round(progress * 100)}%`;
  nextMutEl.textContent = `→ ${next.name} ${Math.max(0, next.at - state.score)}`;
}

function applyThemeFromScore(announce = false) {
  const theme = Math.floor(state.score / 100) % THEME_NAMES.length;
  const changed = theme !== state.theme;
  const synced = themeChipEl.textContent === THEME_NAMES[theme] && app.dataset.theme === String(theme);
  if (!changed && !announce && synced) return;
  state.theme = theme;
  app.dataset.theme = String(theme);
  themeChipEl.textContent = THEME_NAMES[theme];
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", cssVar("--bg0", "#121014"));
  if (changed && announce && state.score >= 100) {
    showToast(`тема: ${THEME_NAMES[theme]}`);
    tone(720, 0.08, "triangle", 0.03, 0);
    tone(940, 0.12, "sine", 0.024, 0.08);
    buzz([10, 18, 10]);
    state.flash = Math.max(state.flash, 0.12);
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
}

function renderGoals() {
  goalBarEl.textContent = "";
  for (const goal of state.goals) {
    const chip = document.createElement("span");
    chip.className = `goal-chip${goal.done ? " done" : ""}`;
    chip.textContent = goal.label(state);
    goalBarEl.appendChild(chip);
  }
}

function renderGoalsResult() {
  goalsResultEl.textContent = "";
  const done = state.goals.filter((goal) => goal.done);
  if (!done.length) {
    goalsResultEl.textContent = "цели не завершены";
    return;
  }
  done.forEach((goal, index) => {
    const chip = document.createElement("span");
    chip.className = "goal-chip done";
    chip.textContent = goal.title;
    goalsResultEl.appendChild(chip);
    if (index < done.length - 1) goalsResultEl.appendChild(document.createTextNode(" "));
  });
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
    return;
  }
  dailyResultEl.textContent = `ежедневка: ${daily.title} · ${daily.label(state)}`;
}

function pickRunGoals() {
  state.goals = shuffle([...GOAL_DEFS]).slice(0, 3).map((goal) => ({
    ...goal,
    done: false,
  }));
  renderGoals();
}

function evaluateGoals() {
  if (state.evaluatingGoals) return;
  state.evaluatingGoals = true;
  const newlyDone = [];
  for (const goal of state.goals) {
    if (!goal.done && goal.check(state)) {
      goal.done = true;
      newlyDone.push(goal);
    }
  }
  renderGoals();
  state.evaluatingGoals = false;
  for (const goal of newlyDone) {
    showToast(`цель: ${goal.title}`);
    goalChime();
    buzz([8, 18, 8]);
    floatText(state.width * 0.5, state.height * 0.24, "+5", cssVar("--life", "#6fd9b0"), 18);
    addScore(5, state.width * 0.5, state.height * 0.28, {
      combo: false,
      silentFloat: true,
      color: cssVar("--life", "#6fd9b0"),
    });
    awardMarks(5, {
      x: state.width * 0.5,
      y: state.height * 0.18,
      color: cssVar("--gold", "#f2c15a"),
      size: 15,
    });
  }
  evaluateDaily();
}

function syncMutation() {
  const now = mutationForScore(state.score);
  const newly = MUTATIONS.filter((mut) => state.score >= mut.at && !state.unlockedMuts.includes(mut.id));
  for (const mut of newly) {
    state.unlockedMuts.push(mut.id);
    mutationDing();
    showToast(`форма: ${mut.name}`);
    buzz([8, 22, 8]);
    floatText(state.width * 0.5, state.height * 0.34, mut.name, cssVar("--life", "#6fd9b0"), 18);
    burst(state.width * 0.5, state.height * 0.38, cssVar("--life", "#6fd9b0"), 18, 4.5);
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
  }
  syncMutation();
  applyThemeFromScore(pop);
  renderGoals();
  evaluateGoals();
}

function addScore(amount, x, y, opts = {}) {
  if (!amount) return;
  state.score += amount;
  if (opts.combo !== false) {
    state.combo += 1;
    state.comboClock = 2.8;
    state.stats.maxCombo = Math.max(state.stats.maxCombo, state.combo);
    if (state.combo >= 2) showCombo(`цепь ×${state.combo}`);
    if (hasMut("bloom") && state.combo > 0 && state.combo % 6 === 0 && state.life) {
      state.bloomPulse = 1;
      // Spawn at edges — never on top of the player (prevents AFK magnet farm)
      for (let i = 0; i < 4; i += 1) spawnSpark({ edge: true, type: Math.random() < 0.12 ? "rare" : null });
      showToast("цветение");
      tone(560, 0.08, "triangle", 0.03);
      tone(860, 0.12, "sine", 0.026, 0.08);
      buzz([12, 18, 12]);
    }
  }
  if (!opts.silentFloat && x != null && y != null) {
    floatText(x, y, `+${amount}`, opts.color || cssVar("--gold", "#f2c15a"));
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
  for (const list of [state.sparks, state.hunters, state.veins, state.particles, state.floaters, state.ash]) {
    for (const item of list) {
      if ("x" in item) item.x *= sx;
      if ("y" in item) item.y *= sy;
    }
  }
  if (!state.ash.length) seedAsh();
}

function seedAsh() {
  state.ash = Array.from({ length: 56 }, () => ({
    x: Math.random() * state.width,
    y: Math.random() * state.height,
    r: rand(0.5, 1.7),
    vx: rand(-0.18, 0.18),
    vy: rand(-0.14, 0.04),
    a: rand(0.06, 0.22),
  }));
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

function setContinueAdProgress(progress) {
  const pct = `${Math.round(clamp(progress, 0, 1) * 100)}%`;
  if (adFillEl) adFillEl.style.width = pct;
  if (!continueLabelEl) return;
  if (progress >= 1) {
    continueLabelEl.textContent = "Продолжить";
    return;
  }
  const remain = Math.max(1, Math.ceil(3 - progress * 3));
  continueLabelEl.textContent = progress > 0 ? `Смотрим ${remain} сек` : "Смотреть 3 сек";
}

function stopContinueAd(reset = true) {
  state.continueAdActive = false;
  state.continueAdStartedAt = 0;
  if (state.continueAdRaf) cancelAnimationFrame(state.continueAdRaf);
  state.continueAdRaf = 0;
  if (reset) setContinueAdProgress(0);
}

function continueAdFrame(ts) {
  if (!state.continueAdActive) return;
  if (!state.continueAdStartedAt) state.continueAdStartedAt = ts;
  const progress = clamp((ts - state.continueAdStartedAt) / 3000, 0, 1);
  setContinueAdProgress(progress);
  if (progress >= 1) {
    stopContinueAd(false);
    grantContinue();
    return;
  }
  state.continueAdRaf = requestAnimationFrame(continueAdFrame);
}

function startContinueAd() {
  if (!state.pendingDeathReason || state.continueAdActive) return;
  ensureAudio();
  state.continueAdActive = true;
  state.continueAdStartedAt = 0;
  setContinueAdProgress(0.01);
  state.continueAdRaf = requestAnimationFrame(continueAdFrame);
}

function showContinueScreen(reason) {
  state.pendingDeathReason = reason;
  stopContinueAd(true);
  if (continueReasonEl) continueReasonEl.textContent = reason;
  statusEl.classList.add("hidden");
  screenOverEl.classList.add("hidden");
  screenContinueEl?.classList.remove("hidden");
  clearHold();
}

function finalizeGameOver(reason) {
  state.deathReason = reason;
  state.pendingDeathReason = "";
  stopContinueAd(true);
  evaluateDaily();
  finalScoreEl.textContent = String(state.score);
  deathReasonEl.textContent = reason;
  const muts = state.unlockedMuts
    .filter((id) => id !== "spark")
    .map((id) => mutationForScore(MUTATIONS.find((m) => m.id === id)?.at || 0).name);
  mutSummaryEl.textContent = muts.length ? `формы: ${muts.join(" · ")}` : "форма осталась искрой";
  renderGoalsResult();
  renderSkinResult();
  renderDailyResult();
  updateBestLabels();
  updateEconomyLabels();
  renderDaily();
  statusEl.classList.add("hidden");
  screenContinueEl?.classList.add("hidden");
  screenOverEl.classList.remove("hidden");
  clearHold();
}

function createLife(x, y, opts = {}) {
  state.echo = null;
  state.life = {
    x,
    y,
    px: x,
    py: y,
    speed: 0,
    r: 24,
    wobble: Math.random() * Math.PI * 2,
    teeth: 0,
  };
  state.lastVeinX = x;
  state.lastVeinY = y;
  if (!opts.silent) {
    hum(true);
    burst(x, y, cssVar("--life", "#6fd9b0"), 10, 3.2);
    buzz(5);
  }
}

function releaseLife() {
  if (!state.life) return;
  state.echo = { x: state.life.x, y: state.life.y, r: state.life.r * 0.92, wobble: state.life.wobble };
  state.life = null;
  hum(false);
}

function grantContinue() {
  state.pendingDeathReason = "";
  state.continueUsed = true;
  state.running = true;
  state.demo = false;
  state.touchActive = false;
  state.pointerId = null;
  state.hunger = 60;
  state.hunters = [];
  state.echo = null;
  state.safeUntil = performance.now() + 2500;
  if (!state.life) createLife(state.width * 0.5, state.height * 0.56);
  else hum(true);
  updateHungerUi();
  renderDaily();
  statusEl.classList.remove("hidden");
  screenContinueEl?.classList.add("hidden");
  screenOverEl.classList.add("hidden");
  state.lastTs = performance.now();
  state.flash = Math.max(state.flash, 0.1);
  showToast("ещё шанс");
}

function shareText() {
  return `Мой след в ОТТИСК: ${state.score} света. Рекорд ${state.best}.`;
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
  shareCtx.fillText(shareText(), 90, 770);

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
  if (type === "rare") {
    return { type, worth: 3, restore: 35, color: "#f2c15a", r: rand(7, 9.5) };
  }
  if (type === "cool") {
    return { type, worth: 1, restore: 25, color: "#83bcff", r: rand(6, 8.5) };
  }
  if (type === "bait") {
    return { type, worth: 1, restore: 12, color: "#ff7fd7", r: rand(6, 8.5) };
  }
  return { type: "normal", worth: 1, restore: 18, color: "#ffe2b0", r: rand(5.5, 7.6) };
}

function rollSparkType() {
  const r = Math.random();
  if (r < 0.08) return "rare";
  if (r < 0.18) return "cool";
  if (r < 0.26) return "bait";
  return "normal";
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
    grace: 0.35,
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
  const anger = slow ? 0.35 : rand(0.72, 1.08) + Math.min(0.52, state.score * 0.006);
  state.hunters.push({
    x,
    y,
    vx: 0,
    vy: 0,
    r: rand(12, 16),
    anger,
    slow,
    warn: slow ? 1 : 0,
    phase: Math.random() * Math.PI * 2,
  });
}

function resetStats() {
  state.stats.sparkEats = 0;
  state.stats.rareEats = 0;
  state.stats.hunterEats = 0;
  state.stats.maxCombo = 0;
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
  state.continueUsed = false;
  state.safeUntil = 0;
  state.continueClickGuardUntil = 0;
  state.coachCount = 0;
  resetStats();
  clearHold();
  stopContinueAd(true);
  applyThemeFromScore(false);
  updateScoreUi(false);
  updateHungerUi();
  updateMutationUi();
  renderDaily();
  comboEl.className = "combo";
  toastEl.className = "toast";
  coachEl.className = "coach";
  finalScoreEl.textContent = "0";
  deathReasonEl.textContent = "";
  mutSummaryEl.textContent = "";
  skinResultEl.textContent = "";
  dailyResultEl.textContent = "";
  screenContinueEl?.classList.add("hidden");
  goalsResultEl.textContent = "";
  pickRunGoals();
  for (let i = 0; i < 9; i += 1) spawnSpark();
  spawnSpark({ tutorial: true, type: "normal", near: { x: state.width * 0.5, y: state.height * 0.42 } });
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
  for (let i = 0; i < 7; i += 1) spawnSpark();
  spawnSpark({ tutorial: true, type: "normal", near: { x: state.width * 0.48, y: state.height * 0.44 } });
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
  requestAnimationFrame(() => {
    resize();
    resetRun();
    state.running = true;
    state.demo = false;
    state.lastTs = performance.now();
    showCoach("УДЕРЖИВАЙ", 1700);
  });
}

function finishRun(reason) {
  if (!state.running) return;
  state.running = false;
  state.demo = false;
  state.touchActive = false;
  state.pointerId = null;
  state.deathReason = reason;
  hum(false);
  buzz([20, 40, 36]);
  tone(108, 0.28, "sawtooth", 0.04, 0);
  tone(82, 0.34, "triangle", 0.028, 0.06);
  if (state.life) burst(state.life.x, state.life.y, cssVar("--danger", "#e2556d"), 28, 5.2);
  if (state.echo) burst(state.echo.x, state.echo.y, cssVar("--danger", "#e2556d"), 18, 4.2);
  state.life = null;
  state.echo = null;
  state.shake = 10;
  state.flash = 0.22;
  if (!state.continueUsed && (reason === DEATH.HUNTER || reason === DEATH.ECHO || reason === DEATH.HUNGER)) {
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

function updateAsh(dt) {
  for (const a of state.ash) {
    a.x += a.vx * dt * 60;
    a.y += a.vy * dt * 60;
    if (a.x < 0) a.x = state.width;
    if (a.x > state.width) a.x = 0;
    if (a.y < 0) a.y = state.height;
    if (a.y > state.height) a.y = 0;
  }
}

function updateSparkMotion(spark, dt) {
  spark.pulse += dt * 5.2;
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
    if (state.life && magnetPull > 0) {
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
  if (spark.type === "rare") state.stats.rareEats += 1;
  const moveFactor = state.life ? clamp((state.life.speed || 0) / 12, 0.2, 1) : 0.2;
  // AFK / standing eats barely refill hunger — must hunt light
  const restore = spark.restore * (0.35 + 0.65 * moveFactor);
  state.hunger = clamp(state.hunger + restore, 0, 100);
  updateHungerUi();
  if (spark.type === "bait") {
    showToast("приманка");
    spawnHunter(false);
    buzz([10, 20, 10]);
  } else {
    buzz(5);
  }
  playSparkTone(spark.type);
  burst(spark.x, spark.y, spark.color, 10 + spark.worth * 2, 3.8);
  state.flash = Math.max(state.flash, 0.08);
  addScore(spark.worth, spark.x, spark.y - 12, { color: spark.color });
}

function updateHunters(dt) {
  const maxHunters = Math.min(7, 2 + Math.floor(state.score / 18));
  state.hunterAcc += dt;
  let interval = Math.max(1.05, 3.4 - state.score * 0.026);
  if (!state.slowHunterSeen) interval = Math.max(interval, 4.8);
  while (state.hunters.length < maxHunters && state.hunterAcc >= interval) {
    state.hunterAcc -= interval;
    if (!state.slowHunterSeen && state.stats.sparkEats > 0) {
      spawnHunter(true);
      state.slowHunterSeen = true;
    } else if (state.elapsed > 6) {
      spawnHunter(false);
      if (state.score > 45 && Math.random() < 0.22 && state.hunters.length < maxHunters) spawnHunter(false);
    }
  }

  for (let i = state.hunters.length - 1; i >= 0; i -= 1) {
    const hunter = state.hunters[i];
    hunter.phase += dt * 5;
    hunter.warn = Math.max(0, hunter.warn - dt * 1.45);
    let tx = state.width * 0.5;
    let ty = state.height * 0.5;
    if (state.life) {
      tx = state.life.x;
      ty = state.life.y;
    } else if (state.echo) {
      tx = state.echo.x;
      ty = state.echo.y;
    }
    const ang = Math.atan2(ty - hunter.y, tx - hunter.x);
    let speed = (0.95 + state.score * 0.012) * hunter.anger;
    if (hasMut("cool") && state.hunger < 50) speed *= 0.85;
    hunter.vx += Math.cos(ang) * speed * dt * 3.1;
    hunter.vy += Math.sin(ang) * speed * dt * 3.1;
    hunter.vx *= 0.955;
    hunter.vy *= 0.955;
    hunter.x += hunter.vx * dt * 60;
    hunter.y += hunter.vy * dt * 60;

    if (state.life) {
      const d = dist(hunter.x, hunter.y, state.life.x, state.life.y);
      if (d < hunter.r * 0.72 + state.life.r * 0.75) {
        if (state.safeUntil > performance.now()) {
          hunter.warn = 1;
          continue;
        }
        if (hasMut("fang") && state.combo >= 4) {
          state.hunters.splice(i, 1);
          state.stats.hunterEats += 1;
          showToast("клык");
          tone(165, 0.09, "square", 0.035);
          tone(122, 0.1, "sawtooth", 0.028, 0.05);
          buzz([12, 12, 12]);
          burst(hunter.x, hunter.y, cssVar("--danger", "#e2556d"), 18, 5);
          addScore(3, hunter.x, hunter.y, { color: cssVar("--danger", "#e2556d") });
          continue;
        }
        finishRun(DEATH.HUNTER);
        return;
      }
    } else if (state.echo) {
      const d = dist(hunter.x, hunter.y, state.echo.x, state.echo.y);
      if (d < hunter.r * 0.72 + state.echo.r * 0.78) {
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
    p.vy += 0.03 * dt * 60;
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
  state.time += dt;
  state.elapsed += dt;
  state.spawnAcc += dt;
  state.comboClock = Math.max(0, state.comboClock - dt);
  if (state.comboClock <= 0 && state.combo !== 0) state.combo = 0;
  if (state.life) {
    const prevX = state.life.px ?? state.life.x;
    const prevY = state.life.py ?? state.life.y;
    const moved = dist(state.life.x, state.life.y, prevX, prevY);
    state.life.speed = (state.life.speed || 0) * 0.78 + moved * 0.22;
    state.life.px = state.life.x;
    state.life.py = state.life.y;
    state.life.wobble += dt * 7.2;
    state.life.r = 22 + Math.min(9, state.combo * 0.75) + Math.sin(state.life.wobble) * 1.25;
    state.life.teeth = hasMut("fang") && state.combo >= 4 ? Math.min(1, state.life.teeth + dt * 3) : Math.max(0, state.life.teeth - dt * 3);
    clampLife();
    updateHum();
  }
  state.guideSpark = state.life ? nearestSpark(state.life.x, state.life.y) : null;
  // Standing still drains hunger faster — no AFK farming
  const stillPenalty = state.life && (state.life.speed || 0) < 6 ? 1.55 : 1;
  state.hunger -= HUNGER_DRAIN_PER_SEC * dt * (hasMut("cool") ? 0.7 : 1) * stillPenalty;
  state.hunger = Math.max(0, state.hunger);
  updateHungerUi();
  updateAsh(dt);
  const targetSparkCount = 8 + Math.min(4, Math.floor(state.score / 80));
  while (state.spawnAcc >= 0.55) {
    state.spawnAcc -= 0.55;
    if (state.sparks.length < targetSparkCount) spawnSpark({ edge: Math.random() < 0.55 });
  }
  updateSparks(dt);
  tryCompleteByHunger();
  if (!state.running) return;
  updateHunters(dt);
  if (!state.running) return;
  updateVeins(dt);
  updateParticles(dt);
  state.bloomPulse = Math.max(0, state.bloomPulse - dt * 0.85);
  state.flash = Math.max(0, state.flash - dt * 1.9);
  state.shake *= Math.pow(0.9, dt * 60);
  renderGoals();
  evaluateGoals();
}

function updateDemo(dt) {
  state.time += dt;
  state.demoClock += dt;
  updateAsh(dt);
  if (state.sparks.length < 8 && Math.random() < 0.04) spawnSpark();
  for (const spark of state.sparks) updateSparkMotion(spark, dt * 0.7);
  if (state.life) {
    state.life.wobble += dt * 6;
    state.life.x = state.width * 0.5 + Math.sin(state.demoClock * 1.35) * state.width * 0.17;
    state.life.y = state.height * 0.58 + Math.cos(state.demoClock * 0.92) * state.height * 0.07;
    state.life.r = 23 + Math.sin(state.demoClock * 2.8) * 1.3;
    for (let i = state.sparks.length - 1; i >= 0; i -= 1) {
      const spark = state.sparks[i];
      if (dist(spark.x, spark.y, state.life.x, state.life.y) < state.life.r * 0.72 + spark.r) {
        burst(spark.x, spark.y, spark.color, 8, 3);
        state.sparks.splice(i, 1);
        if (state.sparks.length < 8) spawnSpark();
      }
    }
    state.demoDownClock -= dt;
    if (state.demoDownClock <= 0) {
      state.echo = { x: state.life.x, y: state.life.y, r: state.life.r * 0.9, wobble: state.life.wobble };
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
  updateAsh(dt);
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

function drawBackground() {
  const grad = ctx.createLinearGradient(0, 0, 0, state.height);
  grad.addColorStop(0, cssVar("--bg1", "#1c1820"));
  grad.addColorStop(1, cssVar("--bg0", "#121014"));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, state.width, state.height);
  if (state.bloomPulse > 0) {
    ctx.fillStyle = cssVar("--gold", "#e6c07b");
    ctx.globalAlpha = state.bloomPulse * 0.05;
    ctx.fillRect(0, 0, state.width, state.height);
    ctx.globalAlpha = 1;
  }
  for (const a of state.ash) {
    ctx.globalAlpha = a.a;
    ctx.fillStyle = "#f6efe6";
    ctx.fillRect(a.x, a.y, a.r, a.r);
  }
  ctx.globalAlpha = 1;
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

function drawSpark(spark) {
  const pulse = 1 + Math.sin(spark.pulse) * 0.15;
  const r = spark.r * pulse;
  const glow = ctx.createRadialGradient(spark.x, spark.y, 0, spark.x, spark.y, r * 3.4);
  glow.addColorStop(0, spark.color);
  glow.addColorStop(0.32, spark.color);
  glow.addColorStop(1, "transparent");
  ctx.globalAlpha = 0.88;
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(spark.x, spark.y, r * 3.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#fff8ef";
  ctx.beginPath();
  ctx.arc(spark.x, spark.y, Math.max(1.6, r * 0.42), 0, Math.PI * 2);
  ctx.fill();
  if (spark.type === "rare") {
    ctx.strokeStyle = "rgba(242,193,90,0.7)";
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.arc(spark.x, spark.y, r * 1.6, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (spark.tutorial) {
    const t = (state.time * 1.4) % 1;
    for (let i = 0; i < 2; i += 1) {
      const phase = (t + i * 0.5) % 1;
      ctx.globalAlpha = (1 - phase) * 0.42;
      ctx.strokeStyle = spark.color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(spark.x, spark.y, r * (1.4 + phase * 3.2), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}

function drawHunter(hunter) {
  const angle = Math.atan2(hunter.vy || 0.001, hunter.vx || 0.001);
  ctx.save();
  ctx.translate(hunter.x, hunter.y);
  ctx.rotate(angle);
  ctx.fillStyle = cssVar("--danger", "#e2556d");
  ctx.beginPath();
  ctx.moveTo(hunter.r, 0);
  ctx.lineTo(-hunter.r * 0.2, hunter.r * 0.72);
  ctx.lineTo(-hunter.r * 0.58, hunter.r * 0.26);
  ctx.lineTo(-hunter.r * 0.98, hunter.r * 0.72);
  ctx.lineTo(-hunter.r * 0.68, 0);
  ctx.lineTo(-hunter.r * 0.98, -hunter.r * 0.72);
  ctx.lineTo(-hunter.r * 0.58, -hunter.r * 0.26);
  ctx.lineTo(-hunter.r * 0.2, -hunter.r * 0.72);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(18,13,20,0.55)";
  ctx.beginPath();
  ctx.arc(-hunter.r * 0.06, 0, hunter.r * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  if (hunter.warn > 0) {
    ctx.save();
    ctx.globalAlpha = hunter.warn * 0.55;
    ctx.strokeStyle = cssVar("--danger", "#e2556d");
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(hunter.x, hunter.y, hunter.r * (1.5 + (1 - hunter.warn) * 1.7), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawLifeBody(body, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = lifeInkColor();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const rings = hasMut("fang") ? 5 : 4;
  for (let i = 0; i < rings; i += 1) {
    const t = (i + 1) / rings;
    const wob = Math.sin(body.wobble * 1.1 + i * 0.8) * (1 + i * 0.28);
    ctx.lineWidth = Math.max(1.2, 2.7 - i * 0.3);
    ctx.globalAlpha = alpha * (0.36 + t * 0.5);
    ctx.beginPath();
    ctx.ellipse(
      body.x + Math.sin(body.wobble * 0.35 + i) * 0.7,
      body.y + Math.cos(body.wobble * 0.28 + i) * 0.55,
      body.r * (0.28 + t * 0.72) + wob * 0.14,
      body.r * (0.34 + t * 0.64) + wob * 0.1,
      Math.sin(body.wobble * 0.18) * 0.12,
      0.15 + i * 0.1,
      Math.PI * 1.86 - i * 0.04
    );
    ctx.stroke();
  }
  ctx.globalAlpha = alpha * 0.42;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 5]);
  ctx.beginPath();
  ctx.ellipse(body.x, body.y, body.r * 0.52, body.r * 0.68, 0.2, 0.2, Math.PI * 1.74);
  ctx.stroke();
  ctx.setLineDash([]);
  if (hasMut("fang") && state.combo >= 4) {
    ctx.globalAlpha = alpha * 0.84;
    ctx.strokeStyle = cssVar("--danger", "#e2556d");
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i += 1) {
      const a = (i / 6) * Math.PI * 2 + body.wobble * 0.08;
      const r0 = body.r * 0.92;
      const r1 = body.r * 1.18;
      ctx.beginPath();
      ctx.moveTo(body.x + Math.cos(a) * r0, body.y + Math.sin(a) * r0);
      ctx.lineTo(body.x + Math.cos(a) * r1, body.y + Math.sin(a) * r1);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawEcho() {
  if (!state.echo) return;
  ctx.save();
  ctx.globalAlpha = 0.58;
  ctx.strokeStyle = "rgba(246,239,230,0.65)";
  ctx.lineWidth = 1.8;
  ctx.setLineDash([5, 6]);
  ctx.beginPath();
  ctx.ellipse(state.echo.x, state.echo.y, state.echo.r * 0.82, state.echo.r, 0.2, 0.15, Math.PI * 1.88);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(state.echo.x, state.echo.y, state.echo.r * 0.52, state.echo.r * 0.68, 0.18, 0.4, Math.PI * 1.76);
  ctx.stroke();
  ctx.setLineDash([]);
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
  ctx.arc(state.guideSpark.x, state.guideSpark.y, state.guideSpark.r * 2.2, 0, Math.PI * 2);
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
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (const f of state.floaters) {
    ctx.globalAlpha = Math.max(0, f.life);
    ctx.fillStyle = f.color;
    ctx.font = `800 ${f.size}px Syne, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.globalAlpha = 1;
}

function draw() {
  const sx = (Math.random() - 0.5) * state.shake;
  const sy = (Math.random() - 0.5) * state.shake;
  ctx.save();
  ctx.translate(sx, sy);
  drawBackground();
  drawVeins();
  for (const spark of state.sparks) drawSpark(spark);
  for (const hunter of state.hunters) drawHunter(hunter);
  drawEcho();
  drawGuide();
  if (state.life) {
    drawLifeBody(state.life);
  } else if (state.running && !state.hasTouchedCanvas) {
    drawHoldHint();
  } else if (!state.running && state.demo && state.life) {
    drawLifeBody(state.life, 0.86);
  }
  drawParticles();
  if (state.flash > 0) {
    ctx.fillStyle = `rgba(246,239,230,${state.flash * 0.18})`;
    ctx.fillRect(0, 0, state.width, state.height);
  }
  ctx.restore();
}

function frame(ts) {
  const dt = Math.min(0.033, (ts - (state.lastTs || ts)) / 1000 || 0.016);
  state.lastTs = ts;
  if (state.hold && !state.running) {
    state.hold.progress = clamp(state.hold.progress + dt / HOLD_SECONDS, 0, 1);
    const width = `${Math.round(state.hold.progress * 100)}%`;
    setHoldVisual(width, state.hold.target);
    if (state.hold.progress >= 1) {
      clearHold();
      startGame();
    }
  }
  if (state.running) {
    updateRun(dt);
  } else if (!screenStartEl.classList.contains("hidden")) {
    updateDemo(dt);
  } else {
    updateOver(dt);
  }
  draw();
  requestAnimationFrame(frame);
}

function boot() {
  state.meta = loadMeta();
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
  btnContinue?.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    state.continueClickGuardUntil = performance.now() + 450;
    startContinueAd();
  }, { passive: false });
  btnContinue?.addEventListener("click", (e) => {
    e.preventDefault();
    if (performance.now() < state.continueClickGuardUntil) return;
    startContinueAd();
  });
  btnSkipContinue?.addEventListener("click", () => {
    if (!state.pendingDeathReason) return;
    finalizeGameOver(state.pendingDeathReason);
  });
  btnShare?.addEventListener("click", () => {
    shareRun().catch(() => showToast("не удалось поделиться"));
  });
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state.touchActive) {
      state.touchActive = false;
      state.pointerId = null;
      if (state.running) releaseLife();
    }
    if (document.hidden && state.continueAdActive) stopContinueAd(true);
  });
  requestAnimationFrame(frame);
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

boot();
