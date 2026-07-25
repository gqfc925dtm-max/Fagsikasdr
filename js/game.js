const BEST_KEY = "ottisk-best-v2";

const app = document.getElementById("app");
const stage = document.getElementById("stage");
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const statusEl = document.getElementById("status");
const scoreEl = document.getElementById("score");
const comboEl = document.getElementById("combo");
const toastEl = document.getElementById("toast");
const mutBadge = document.getElementById("mut-badge");
const themeChip = document.getElementById("theme-chip");
const heatFill = document.getElementById("heat-fill");
const heatPct = document.getElementById("heat-pct");
const mutTrackFill = document.getElementById("mut-track-fill");
const nextMutEl = document.getElementById("next-mut");
const coachEl = document.getElementById("coach");
const holdFill = document.getElementById("hold-fill");
const holdFillOver = document.getElementById("hold-fill-over");
const screenStart = document.getElementById("screen-start");
const screenOver = document.getElementById("screen-over");
const bestStart = document.getElementById("best-start");
const bestOver = document.getElementById("best-over");
const finalScore = document.getElementById("final-score");
const deathReason = document.getElementById("death-reason");
const mutSummary = document.getElementById("mut-summary");
const btnStart = document.getElementById("btn-start");
const btnRetry = document.getElementById("btn-retry");

const THEME_COUNT = 6;
const THEME_NAMES = ["уголь", "глубина", "янтарь", "мох", "дымка", "пыльца"];

const MUTATIONS = [
  { at: 0, id: "spark", name: "искра", blurb: "только рождается" },
  { at: 5, id: "cool", name: "хладь", blurb: "жар растёт медленнее" },
  { at: 12, id: "magnet", name: "тяга", blurb: "свет тянется к тебе" },
  { at: 20, id: "veins", name: "жилы", blurb: "твой путь зовёт искры" },
  { at: 30, id: "fang", name: "клык", blurb: "при цепи ×5 можно кусать охотников" },
  { at: 42, id: "bloom", name: "цвет", blurb: "мир вспыхивает и кормит тебя" },
];

const state = {
  running: false,
  width: 0,
  height: 0,
  dpr: 1,
  score: 0,
  combo: 0,
  best: Number(localStorage.getItem(BEST_KEY) || 0),
  touching: false,
  pointerId: null,
  life: null,
  echo: null,
  heat: 0,
  sparks: [],
  hunters: [],
  burns: [],
  veins: [],
  particles: [],
  scars: [],
  floatTexts: [],
  ash: [],
  shake: 0,
  flash: 0,
  bloom: 0,
  spawnAcc: 0,
  hunterAcc: 0,
  lastTs: 0,
  audio: null,
  nodes: null,
  death: "",
  time: 0,
  stillTimer: 0,
  smoothSpeed: 0,
  lastX: 0,
  lastY: 0,
  mutation: MUTATIONS[0],
  unlocked: ["spark"],
  demo: true,
  demoPhase: 0,
  demoTimer: 0,
  coachStep: 0,
  coachTimer: 0,
  grace: 0,
  holdProgress: 0,
  holdingStart: false,
  guideSpark: null,
  safeUntil: 0,
  relocateCool: 0,
  theme: 0,
};

function resize() {
  state.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  const rect = stage.getBoundingClientRect();
  state.width = Math.max(1, Math.floor(rect.width));
  state.height = Math.max(1, Math.floor(rect.height));
  canvas.width = Math.floor(state.width * state.dpr);
  canvas.height = Math.floor(state.height * state.dpr);
  canvas.style.width = `${state.width}px`;
  canvas.style.height = `${state.height}px`;
  ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  if (!state.ash.length) seedAsh();
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

function cssVar(name, fallback) {
  const v = getComputedStyle(app).getPropertyValue(name).trim();
  return v || fallback;
}

function applyTheme(score, announce = false) {
  // Every 100 points cycles the whole game palette
  const theme = Math.floor(score / 100) % THEME_COUNT;
  const changed = theme !== state.theme;
  if (!changed && !announce) return;
  state.theme = theme;
  app.dataset.theme = String(theme);
  themeChip.textContent = `${THEME_NAMES[theme]}`;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", cssVar("--bg0", "#120d14"));
  if (changed && announce && score >= 100) {
    showToast(`новый цвет: ${THEME_NAMES[theme]}`);
    state.bloom = 1;
    state.flash = 0.45;
    tone(740, 0.1, "triangle", 0.04);
    buzz([8, 24, 10]);
  }
}

function rand(a, b) {
  return a + Math.random() * (b - a);
}

function dist(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

function buzz(pattern = 8) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

function ensureAudio() {
  if (state.audio) return state.audio;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  state.audio = new AC();
  return state.audio;
}

function tone(freq, dur = 0.08, type = "sine", gain = 0.04) {
  const ac = ensureAudio();
  if (!ac) return;
  if (ac.state === "suspended") ac.resume();
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, ac.currentTime);
  g.gain.value = gain;
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
  o.connect(g);
  g.connect(ac.destination);
  o.start();
  o.stop(ac.currentTime + dur);
}

function hum(on) {
  const ac = ensureAudio();
  if (!ac) return;
  if (ac.state === "suspended") ac.resume();
  if (!on) {
    if (state.nodes) {
      state.nodes.g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.15);
      state.nodes = null;
    }
    return;
  }
  if (state.nodes) return;
  const o1 = ac.createOscillator();
  const o2 = ac.createOscillator();
  const g = ac.createGain();
  o1.type = "sine";
  o2.type = "triangle";
  o1.frequency.value = 55;
  o2.frequency.value = 82;
  g.gain.value = 0.012;
  o1.connect(g);
  o2.connect(g);
  g.connect(ac.destination);
  o1.start();
  o2.start();
  state.nodes = { o1, o2, g };
}

function showCombo(text) {
  comboEl.textContent = text;
  comboEl.className = "combo show";
  clearTimeout(showCombo._t);
  showCombo._t = setTimeout(() => comboEl.classList.remove("show"), 700);
}

function showToast(text) {
  toastEl.textContent = text;
  toastEl.className = "toast show";
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toastEl.classList.remove("show"), 1400);
}

function showCoach(text, ms = 2200) {
  coachEl.textContent = text;
  coachEl.className = "coach show";
  clearTimeout(showCoach._t);
  showCoach._t = setTimeout(() => coachEl.classList.remove("show"), ms);
}

function updateMutTrack() {
  let prev = MUTATIONS[0];
  let next = null;
  for (let i = 0; i < MUTATIONS.length; i++) {
    if (state.score >= MUTATIONS[i].at) prev = MUTATIONS[i];
    if (state.score < MUTATIONS[i].at) {
      next = MUTATIONS[i];
      break;
    }
  }
  if (!next) {
    mutTrackFill.style.width = "100%";
    nextMutEl.textContent = "форма завершена";
    return;
  }
  const span = Math.max(1, next.at - prev.at);
  const prog = Math.min(1, (state.score - prev.at) / span);
  mutTrackFill.style.width = `${Math.round(prog * 100)}%`;
  nextMutEl.textContent = `до «${next.name}»: ${next.at - state.score}`;
}

function floatText(x, y, text, color = "#f2c15a") {
  state.floatTexts.push({ x, y, text, color, life: 1, vy: -0.6 });
}

function burst(x, y, color, n = 12, speed = 4) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = rand(0.8, speed);
    state.particles.push({
      x, y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: 1,
      decay: rand(0.014, 0.03),
      size: rand(1.4, 3.8),
      color,
    });
  }
}

function seedAsh() {
  state.ash = Array.from({ length: 48 }, () => ({
    x: Math.random() * state.width,
    y: Math.random() * state.height,
    r: rand(0.6, 1.8),
    vx: rand(-0.15, 0.15),
    vy: rand(-0.2, 0.05),
    a: rand(0.08, 0.28),
  }));
}

function hasMut(id) {
  return state.unlocked.includes(id);
}

function syncMutation() {
  let current = MUTATIONS[0];
  for (const m of MUTATIONS) {
    if (state.score >= m.at) current = m;
  }
  if (current.id !== state.mutation.id) {
    state.mutation = current;
    if (!state.unlocked.includes(current.id)) {
      state.unlocked.push(current.id);
      showToast(`мутация: ${current.name}`);
      floatText(state.width / 2, state.height * 0.35, current.name.toUpperCase(), "#6dffc2");
      burst(state.width / 2, state.height * 0.4, "#6dffc2", 26, 5);
      tone(880, 0.12, "triangle", 0.045);
      tone(1320, 0.18, "sine", 0.03);
      buzz([8, 30, 12]);
      if (current.id === "bloom") state.bloom = 1;
    }
  }
  mutBadge.textContent = state.mutation.name;
  updateMutTrack();
}

function resetWorld() {
  state.score = 0;
  state.combo = 0;
  state.heat = 0;
  state.life = null;
  state.echo = null;
  state.touching = false;
  state.pointerId = null;
  state.sparks = [];
  state.hunters = [];
  state.burns = [];
  state.veins = [];
  state.particles = [];
  state.scars = [];
  state.floatTexts = [];
  state.shake = 0;
  state.flash = 0;
  state.bloom = 0;
  state.spawnAcc = 0;
  state.hunterAcc = 0;
  state.stillTimer = 0;
  state.death = "";
  state.time = 0;
  state.mutation = MUTATIONS[0];
  state.unlocked = ["spark"];
  scoreEl.textContent = "0";
  heatFill.style.width = "0%";
  comboEl.className = "combo";
  toastEl.className = "toast";
  mutBadge.textContent = "искра";
  state.coachStep = 0;
  state.coachTimer = 0;
  state.grace = 4.5;
  state.safeUntil = 0;
  state.relocateCool = 0;
  state.guideSpark = null;
  applyTheme(0, false);
  updateMutTrack();
  for (let i = 0; i < 8; i++) spawnSpark(true);
  // First sparks near center so tutorial is obvious
  state.sparks[0].x = state.width * 0.5;
  state.sparks[0].y = state.height * 0.42;
  state.sparks[0].vx = 0.1;
  state.sparks[0].vy = 0.05;
  state.sparks[0].type = "normal";
  state.sparks[0].color = "#ffe3b0";
  state.sparks[0].worth = 1;
}

function sparkTypeRoll() {
  const r = Math.random();
  if (r < 0.08) return "rare";
  if (r < 0.16) return "cool";
  if (r < 0.22) return "bait";
  return "normal";
}

function spawnSpark(anywhere = false) {
  const margin = 40;
  const type = sparkTypeRoll();
  const base = {
    x: rand(margin, state.width - margin),
    y: anywhere ? rand(state.height * 0.18, state.height - margin) : rand(-50, -12),
    vx: rand(-0.45, 0.45),
    vy: anywhere ? rand(-0.3, 0.5) : rand(0.35, 1.15),
    pulse: Math.random() * Math.PI * 2,
    type,
  };
  if (type === "rare") Object.assign(base, { r: rand(7, 10), worth: 3, color: "#f2c15a" });
  else if (type === "cool") Object.assign(base, { r: rand(6, 9), worth: 1, color: "#7eb6ff" });
  else if (type === "bait") Object.assign(base, { r: rand(6, 9), worth: 2, color: "#ff7ad1" });
  else Object.assign(base, { r: rand(5, 8), worth: 1, color: "#ffe3b0" });
  state.sparks.push(base);
}

function spawnHunter() {
  const side = Math.floor(Math.random() * 4);
  let x, y;
  if (side === 0) { x = rand(0, state.width); y = -24; }
  else if (side === 1) { x = state.width + 24; y = rand(0, state.height); }
  else if (side === 2) { x = rand(0, state.width); y = state.height + 24; }
  else { x = -24; y = rand(0, state.height); }
  state.hunters.push({
    x, y, vx: 0, vy: 0,
    r: rand(11, 16),
    anger: rand(0.75, 1.3),
    phase: Math.random() * Math.PI * 2,
  });
}

function beginLife(x, y) {
  state.life = {
    x, y,
    r: 22,
    wobble: 0,
    teeth: 0,
  };
  state.lastX = x;
  state.lastY = y;
  state.stillTimer = 0;
  state.heat = Math.max(0, state.heat - 0.01);
  state.smoothSpeed = 0;
  burst(x, y, "#6dffc2", 14, 3.5);
  if (state.running) {
    tone(540, 0.06, "triangle", 0.032);
    buzz(5);
    hum(true);
  }
}

function endLife(asEcho = true) {
  if (!state.life) return;
  if (asEcho) {
    state.echo = {
      x: state.life.x,
      y: state.life.y,
      r: state.life.r,
      life: hasMut("fang") ? 1.15 : 0.85,
    };
  }
  state.life = null;
  hum(false);
}

function kill(reason) {
  if (!state.running) return;
  state.running = false;
  state.touching = false;
  state.death = reason;
  state.shake = 14;
  state.flash = 0.65;
  hum(false);
  buzz([20, 40, 35]);
  tone(100, 0.25, "sawtooth", 0.04);
  if (state.life) burst(state.life.x, state.life.y, "#ff3d66", 34, 5.5);
  endLife(false);
  finalScore.textContent = String(state.score);
  bestOver.textContent = String(state.best);
  deathReason.textContent = reason;
  const gained = state.unlocked.filter((id) => id !== "spark");
  mutSummary.textContent = gained.length
    ? `мутации: ${gained.map((id) => MUTATIONS.find((m) => m.id === id).name).join(" · ")}`
    : "мутаций не успело случиться";
  statusEl.classList.add("hidden");
  screenOver.classList.remove("hidden");
}

function popScore() {
  scoreEl.classList.remove("pop");
  void scoreEl.offsetWidth;
  scoreEl.classList.add("pop");
}

function addScore(n, x, y) {
  state.score += n;
  state.combo += 1;
  scoreEl.textContent = String(state.score);
  popScore();
  if (state.score > state.best) {
    state.best = state.score;
    localStorage.setItem(BEST_KEY, String(state.best));
  }
  syncMutation();
  applyTheme(state.score, true);
  if (n > 1) floatText(x, y, `+${n}`, cssVar("--gold", "#f2c15a"));
  updateMutTrack();
  if (state.combo >= 3) showCombo(`цепь ×${state.combo}`);
  if (state.coachStep < 3 && state.score >= 1) {
    state.coachStep = 3;
    showCoach("Есть! Собирай цепь", 2000);
  }
  if (hasMut("bloom") && state.combo > 0 && state.combo % 8 === 0) {
    state.bloom = 1;
    showToast("цветение");
    for (let i = 0; i < 5; i++) spawnSpark(true);
    tone(720, 0.1, "sine", 0.04);
  }
}

function startGame() {
  ensureAudio();
  state.demo = false;
  state.holdingStart = false;
  state.holdProgress = 0;
  holdFill.style.width = "0%";
  holdFillOver.style.width = "0%";
  screenStart.classList.add("hidden");
  screenOver.classList.add("hidden");
  statusEl.classList.remove("hidden");
  // layout changes when status appears — resize playfield
  requestAnimationFrame(() => {
    resize();
    resetWorld();
    state.running = true;
    state.lastTs = performance.now();
    showCoach("УДЕРЖИВАЙ палец", 2600);
  });
}

function nearestSpark(x, y) {
  let best = null;
  let bestD = Infinity;
  for (const s of state.sparks) {
    const d = dist(x, y, s.x, s.y);
    if (d < bestD) { bestD = d; best = s; }
  }
  return best;
}

function onPointerDown(e) {
  e.preventDefault();
  if (!state.running) return;
  if (state.touching) return;
  state.touching = true;
  state.pointerId = e.pointerId;
  try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
  const p = pointerPos(e);
  const wasEmpty = !state.life;
  beginLife(p.x, p.y);
  if (wasEmpty && state.relocateCool > 0) {
    state.heat = Math.max(0, state.heat - 0.04);
    state.safeUntil = Math.max(state.safeUntil, 0.45);
    floatText(p.x, p.y - 24, "перенос", cssVar("--life", "#6dffc2"));
    burst(p.x, p.y, cssVar("--life", "#6dffc2"), 12, 3);
  }
  if (state.coachStep === 0) {
    state.coachStep = 1;
    showCoach("ВОДИ по светлым точкам", 2500);
  }
}

function onPointerMove(e) {
  if (!state.running || !state.touching || e.pointerId !== state.pointerId || !state.life) return;
  const p = pointerPos(e);
  const lx = state.life.x;
  const ly = state.life.y;
  state.life.x = p.x;
  state.life.y = p.y;
  const moved = dist(lx, ly, p.x, p.y);
  if (moved > 4 && state.coachStep === 1) {
    state.coachStep = 2;
    showCoach("Не стой — следи за ЖАРОМ", 2400);
  }
  if ((hasMut("veins") || state.coachStep < 4) && moved > 4) {
    state.veins.push({ x: p.x, y: p.y, life: hasMut("veins") ? 1 : 0.45, r: state.life.r * 0.5 });
    if (state.veins.length > 90) state.veins.shift();
  }
}

function onPointerUp(e) {
  if (!state.touching || (state.pointerId != null && e.pointerId !== state.pointerId)) return;
  state.touching = false;
  state.pointerId = null;
  if (!state.running) return;
  if (state.life) {
    if (state.heat > 0.5) {
      state.scars.push({
        x: state.life.x,
        y: state.life.y,
        r: state.life.r * 0.85,
        life: 1,
      });
    }
    endLife(true);
    tone(220, 0.05, "sine", 0.028);
    state.combo = Math.max(0, state.combo - 1);
    state.relocateCool = 0.8;
    if (state.coachStep === 2 || state.coachStep === 3) {
      state.coachStep = 4;
      showCoach("Отпустил — его нет. Жми снова", 2600);
    }
  }
}

function bindHoldToStart(btn, fillEl) {
  let pid = null;
  let armed = false;
  const clear = () => {
    pid = null;
    armed = false;
    state.holdingStart = false;
    state.holdProgress = 0;
    fillEl.style.width = "0%";
  };
  btn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    if (state.running) return;
    pid = e.pointerId;
    armed = true;
    state.holdingStart = true;
    state.holdProgress = 0;
    try { btn.setPointerCapture(e.pointerId); } catch (_) {}
    ensureAudio();
    tone(320, 0.05, "sine", 0.025);
  });
  btn.addEventListener("pointerup", (e) => {
    if (pid != null && e.pointerId !== pid) return;
    if (armed && !state.running && state.holdProgress < 1) {
      showToast("держи дольше — не кликай");
    }
    clear();
  });
  btn.addEventListener("pointercancel", clear);
  btn.addEventListener("lostpointercapture", clear);
  // Block click-to-start habit
  btn.addEventListener("click", (e) => e.preventDefault());
}

function difficulty() {
  return 1 + state.score * 0.032;
}

function updateDemo(dt) {
  state.demoPhase += dt;
  if (!state.life) {
    beginLife(state.width * (0.35 + Math.sin(state.demoPhase) * 0.08), state.height * 0.58);
    state.demoTimer = 1.4;
  }
  if (state.life) {
    state.life.x = state.width * (0.5 + Math.sin(state.demoPhase * 1.2) * 0.18);
    state.life.y = state.height * (0.56 + Math.cos(state.demoPhase * 0.9) * 0.06);
    state.life.wobble += dt * 7;
    state.demoTimer -= dt;
    // eat nearby demo sparks
    for (let i = state.sparks.length - 1; i >= 0; i--) {
      const s = state.sparks[i];
      if (dist(s.x, s.y, state.life.x, state.life.y) < state.life.r + 4) {
        state.sparks.splice(i, 1);
        burst(s.x, s.y, s.color, 8, 3);
      }
    }
    if (state.demoTimer <= 0) {
      endLife(true);
      state.demoTimer = 0.7;
    }
  } else {
    state.demoTimer -= dt;
    if (state.demoTimer <= 0 && state.sparks.length < 6) spawnSpark(true);
  }
}

function update(dt) {
  state.time += dt;
  const diff = difficulty();
  state.grace = Math.max(0, state.grace - dt);
  state.safeUntil = Math.max(0, state.safeUntil - dt);
  state.relocateCool = Math.max(0, state.relocateCool - dt);

  if (state.life) {
    state.guideSpark = nearestSpark(state.life.x, state.life.y);
  } else {
    state.guideSpark = null;
  }

  for (const a of state.ash) {
    a.x += a.vx * dt * 60;
    a.y += a.vy * dt * 60;
    if (a.x < 0) a.x = state.width;
    if (a.x > state.width) a.x = 0;
    if (a.y < 0) a.y = state.height;
    if (a.y > state.height) a.y = 0;
  }

  if (state.life) {
    const moved = dist(state.life.x, state.life.y, state.lastX, state.lastY);
    // Smooth out iPhone finger jitter so "standing still" actually works
    state.smoothSpeed = state.smoothSpeed * 0.82 + moved * 0.18;
    const coolFactor = hasMut("cool") ? 0.7 : 1;
    // Balanced heat: ~2s still to max, slower while moving, never drains while held
    const stillness = Math.max(0.22, 1 - state.smoothSpeed / 48);
    const heatRate = (0.35 + 0.55 * stillness) * coolFactor;
    state.heat = Math.min(1, state.heat + heatRate * dt);
    if (state.smoothSpeed < 12) state.stillTimer += dt;
    else state.stillTimer = 0;
    if (state.smoothSpeed > 18 && Math.random() < 0.35) {
      state.burns.push({
        x: state.life.x,
        y: state.life.y,
        r: state.life.r * 0.5,
        life: 1,
      });
    }
    state.lastX = state.life.x;
    state.lastY = state.life.y;
    state.life.wobble += dt * 8;
    state.life.r = 20 + Math.min(20, state.combo * 0.65) + Math.sin(state.life.wobble) * 1.6;
    state.life.teeth = hasMut("fang") && state.combo >= 5 ? Math.min(1, state.life.teeth + dt * 2) : Math.max(0, state.life.teeth - dt);

    if (state.nodes) {
      const ac = state.audio;
      const heatBoost = 55 + state.heat * 40;
      state.nodes.o1.frequency.setTargetAtTime(heatBoost, ac.currentTime, 0.05);
      state.nodes.g.gain.setTargetAtTime(0.01 + state.heat * 0.02, ac.currentTime, 0.05);
    }

    if (state.heat >= 1) {
      kill("сгорело на месте");
      return;
    }

    const m = state.life.r * 0.32;
    if (
      state.life.x < m || state.life.y < m ||
      state.life.x > state.width - m || state.life.y > state.height - m
    ) {
      kill("ушло за край");
      return;
    }
  } else {
    // Heat only drops when finger is UP
    state.heat = Math.max(0, state.heat - 0.2 * dt);
    state.smoothSpeed = 0;
  }

  const heatRounded = Math.round(state.heat * 100);
  heatFill.style.width = `${heatRounded}%`;
  if (heatPct) heatPct.textContent = `${heatRounded}%`;
  state.bloom = Math.max(0, state.bloom - dt * 0.85);

  state.spawnAcc += dt;
  const spawnEvery = Math.max(0.24, 0.82 - diff * 0.045);
  while (state.spawnAcc >= spawnEvery) {
    state.spawnAcc -= spawnEvery;
    spawnSpark(false);
    if (state.bloom > 0.3) spawnSpark(true);
  }

  for (let i = state.sparks.length - 1; i >= 0; i--) {
    const s = state.sparks[i];
    s.pulse += dt * 6;

    if (state.life && hasMut("magnet")) {
      const d = dist(s.x, s.y, state.life.x, state.life.y);
      if (d < 160) {
        const pull = (1 - d / 160) * 0.085;
        s.vx += ((state.life.x - s.x) / (d || 1)) * pull;
        s.vy += ((state.life.y - s.y) / (d || 1)) * pull;
      }
    }

    if (hasMut("veins") && state.veins.length) {
      let best = null;
      let bestD = 70;
      for (const v of state.veins) {
        const d = dist(s.x, s.y, v.x, v.y);
        if (d < bestD) { bestD = d; best = v; }
      }
      if (best) {
        s.vx += ((best.x - s.x) / (bestD || 1)) * 0.04;
        s.vy += ((best.y - s.y) / (bestD || 1)) * 0.04;
      }
    }

    s.x += s.vx * dt * 60;
    s.y += s.vy * dt * 60;
    s.vx *= 0.99;
    s.vy *= 0.995;
    s.vx += Math.sin(state.time * 2 + s.y * 0.01) * 0.012;

    if (s.y > state.height + 40 || s.x < -50 || s.x > state.width + 50) {
      state.sparks.splice(i, 1);
      continue;
    }

    if (state.life && dist(s.x, s.y, state.life.x, state.life.y) < state.life.r + s.r * 0.15) {
      state.sparks.splice(i, 1);
      if (s.type === "cool") state.heat = Math.max(0, state.heat - 0.05);
      // normal sparks no longer erase heat
      if (s.type === "bait") {
        spawnHunter();
        showToast("приманка!");
      }
      addScore(s.worth, s.x, s.y - 10);
      burst(s.x, s.y, s.color, 10 + s.worth * 2, 3.8);
      tone(620 + Math.min(state.combo, 14) * 26, 0.05, "sine", 0.03);
      buzz(4);
      state.flash = Math.max(state.flash, 0.12);
    }
  }

  state.hunterAcc += dt;
  const hunterEvery = Math.max(0.75, 2.3 - diff * 0.12);
  if (state.grace <= 0 && state.hunterAcc >= hunterEvery) {
    state.hunterAcc = 0;
    spawnHunter();
    if (diff > 2 && Math.random() < 0.45) spawnHunter();
    if (state.coachStep < 5) {
      state.coachStep = 5;
      showCoach("Красные охотники — убегай", 2500);
    }
  }

  for (let i = state.hunters.length - 1; i >= 0; i--) {
    const h = state.hunters[i];
    h.phase += dt * 5;
    let tx = state.width / 2;
    let ty = state.height / 2;
    if (state.life) { tx = state.life.x; ty = state.life.y; }
    else if (state.echo) { tx = state.echo.x; ty = state.echo.y; }
    else if (state.burns.length) {
      const b = state.burns[state.burns.length - 1];
      tx = b.x; ty = b.y;
    }
    const ang = Math.atan2(ty - h.y, tx - h.x);
    const spd = (1.05 + diff * 0.16) * h.anger * (state.safeUntil > 0 ? 0.35 : 1);
    h.vx += Math.cos(ang) * spd * dt * 3.2;
    h.vy += Math.sin(ang) * spd * dt * 3.2;
    h.vx *= 0.955;
    h.vy *= 0.955;
    h.x += h.vx * dt * 60;
    h.y += h.vy * dt * 60;

    if (state.life && state.safeUntil <= 0) {
      const d = dist(h.x, h.y, state.life.x, state.life.y);
      const biteRange = state.life.r * 0.72 + h.r * 0.5;
      if (d < biteRange) {
        if (hasMut("fang") && state.combo >= 5) {
          state.hunters.splice(i, 1);
          addScore(2, h.x, h.y);
          burst(h.x, h.y, "#ff3d66", 18, 5);
          showToast("клык!");
          tone(180, 0.08, "square", 0.03);
          buzz([6, 20, 8]);
          state.combo = Math.max(3, state.combo - 2);
          continue;
        }
        kill("съели тень");
        return;
      }
    }

    if (state.echo && dist(h.x, h.y, state.echo.x, state.echo.y) < state.echo.r * 0.7 + h.r * 0.5) {
      burst(state.echo.x, state.echo.y, "#cbb7a3", 16, 4);
      state.echo = null;
      state.combo = 0;
      state.shake = 6;
      tone(140, 0.1, "square", 0.025);
      buzz(12);
    }

    if (h.x < -90 || h.y < -90 || h.x > state.width + 90 || h.y > state.height + 90) {
      state.hunters.splice(i, 1);
    }
  }

  if (state.echo) {
    state.echo.life -= dt * 1.55;
    if (state.echo.life <= 0) state.echo = null;
  }

  for (let i = state.burns.length - 1; i >= 0; i--) {
    state.burns[i].life -= dt * 1.35;
    if (state.burns[i].life <= 0) state.burns.splice(i, 1);
  }
  for (let i = state.veins.length - 1; i >= 0; i--) {
    state.veins[i].life -= dt * 0.55;
    if (state.veins[i].life <= 0) state.veins.splice(i, 1);
  }
  for (let i = state.scars.length - 1; i >= 0; i--) {
    state.scars[i].life -= dt * 0.14;
    if (state.scars[i].life <= 0) state.scars.splice(i, 1);
  }
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx * dt * 60;
    p.y += p.vy * dt * 60;
    p.vy += 0.035 * dt * 60;
    p.life -= p.decay * dt * 60;
    if (p.life <= 0) state.particles.splice(i, 1);
  }
  for (let i = state.floatTexts.length - 1; i >= 0; i--) {
    const f = state.floatTexts[i];
    f.y += f.vy * dt * 60;
    f.life -= dt * 1.2;
    if (f.life <= 0) state.floatTexts.splice(i, 1);
  }

  state.shake *= Math.pow(0.9, dt * 60);
  state.flash = Math.max(0, state.flash - dt * 2.1);
}

function palette() {
  const a = cssVar("--bg1", "#24161c");
  const b = cssVar("--bg0", "#120d14");
  const ember = cssVar("--ember", "#ff6840");
  return { a, b, glow: ember };
}

function drawBackground() {
  const p = palette();
  const g = ctx.createLinearGradient(0, 0, 0, state.height);
  g.addColorStop(0, p.a);
  g.addColorStop(1, p.b);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, state.width, state.height);

  const cx = state.life ? state.life.x : state.width * 0.5;
  const cy = state.life ? state.life.y : state.height * 0.48;
  const soft = ctx.createRadialGradient(cx, cy, 10, cx, cy, state.width * 0.7);
  soft.addColorStop(0, p.glow);
  soft.addColorStop(1, "transparent");
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = soft;
  ctx.fillRect(0, 0, state.width, state.height);
  ctx.globalAlpha = 1;

  if (state.bloom > 0) {
    ctx.fillStyle = cssVar("--gold", "#f2c15a");
    ctx.globalAlpha = state.bloom * 0.08;
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

function drawLifeBody(L, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const heatTint = state.heat;
  const ink = heatTint > 0.75
    ? cssVar("--danger", "#e2556d")
    : heatTint > 0.45
      ? cssVar("--ember", "#e86a3a")
      : cssVar("--life", "#6fd9b0");
  const soft = ctx.createRadialGradient(L.x, L.y, L.r * 0.2, L.x, L.y, L.r * 2.2);
  soft.addColorStop(0, ink);
  soft.addColorStop(1, "transparent");
  ctx.globalAlpha = alpha * (0.18 + heatTint * 0.2);
  ctx.fillStyle = soft;
  ctx.beginPath();
  ctx.arc(L.x, L.y, L.r * 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = alpha;

  // Ink stamp / fingerprint rings — no cute eye-circle
  ctx.strokeStyle = ink;
  ctx.lineCap = "round";
  const rings = hasMut("fang") ? 5 : 4;
  for (let i = 0; i < rings; i++) {
    const t = (i + 1) / rings;
    const wob = Math.sin(L.wobble * 1.2 + i * 0.9) * (1.2 + i * 0.35);
    ctx.lineWidth = Math.max(1.2, 2.6 - i * 0.25);
    ctx.globalAlpha = alpha * (0.35 + t * 0.5);
    ctx.beginPath();
    ctx.ellipse(
      L.x + Math.sin(L.wobble * 0.4 + i) * 0.8,
      L.y + Math.cos(L.wobble * 0.35 + i) * 0.6,
      L.r * (0.28 + t * 0.72) + wob * 0.15,
      L.r * (0.34 + t * 0.66) + wob * 0.1,
      Math.sin(L.wobble * 0.2) * 0.15,
      0.15 + i * 0.08,
      Math.PI * 1.85 - i * 0.05
    );
    ctx.stroke();
  }

  // Sharp fang ticks when empowered
  if (hasMut("fang") && state.combo >= 5) {
    ctx.globalAlpha = alpha * 0.85;
    ctx.strokeStyle = cssVar("--danger", "#e2556d");
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + L.wobble * 0.1;
      const r0 = L.r * 0.92;
      const r1 = L.r * 1.18;
      ctx.beginPath();
      ctx.moveTo(L.x + Math.cos(a) * r0, L.y + Math.sin(a) * r0);
      ctx.lineTo(L.x + Math.cos(a) * r1, L.y + Math.sin(a) * r1);
      ctx.stroke();
    }
  }

  ctx.restore();
}

function drawHoldHint() {
  const cx = state.width / 2;
  const cy = state.height * 0.52;
  const s = 34;
  const pulse = 0.35 + Math.sin(state.time * 2.8) * 0.12;
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.strokeStyle = cssVar("--foam", "#f3eee8");
  ctx.lineWidth = 1.5;
  // corner brackets instead of a circle
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
  ctx.globalAlpha = 0.55 + Math.sin(state.time * 2.8) * 0.1;
  ctx.fillStyle = cssVar("--sand", "#a89b90");
  ctx.font = "600 12px Instrument Sans, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("удерживай здесь", cx, cy + s + 28);
  ctx.restore();
}

function draw() {
  const sx = (Math.random() - 0.5) * state.shake;
  const sy = (Math.random() - 0.5) * state.shake;
  ctx.save();
  ctx.translate(sx, sy);
  drawBackground();

  for (const sc of state.scars) {
    ctx.beginPath();
    ctx.fillStyle = `rgba(255,61,102,${0.14 * sc.life})`;
    ctx.arc(sc.x, sc.y, sc.r, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const v of state.veins) {
    ctx.beginPath();
    ctx.fillStyle = `rgba(109,255,194,${0.14 * v.life})`;
    ctx.arc(v.x, v.y, v.r, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const b of state.burns) {
    ctx.beginPath();
    ctx.fillStyle = `rgba(242,193,90,${0.1 * b.life})`;
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const s of state.sparks) {
    const pr = s.r * (1 + Math.sin(s.pulse) * 0.16);
    const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, pr * 3.2);
    glow.addColorStop(0, s.color);
    glow.addColorStop(0.35, s.color);
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.arc(s.x, s.y, pr * 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#f6efe6";
    ctx.beginPath();
    ctx.arc(s.x, s.y, pr * 0.4, 0, Math.PI * 2);
    ctx.fill();
    if (s.type === "rare") {
      ctx.strokeStyle = "rgba(242,193,90,0.7)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(s.x, s.y, pr * 1.6, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  for (const h of state.hunters) {
    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.rotate(Math.atan2(h.vy, h.vx || 0.01));
    const pulse = 1 + Math.sin(h.phase) * 0.06;
    ctx.fillStyle = cssVar("--danger", "#ff3d66");
    ctx.beginPath();
    ctx.moveTo(h.r * pulse, 0);
    ctx.lineTo(-h.r * 0.85, h.r * 0.72);
    ctx.lineTo(-h.r * 0.4, 0);
    ctx.lineTo(-h.r * 0.85, -h.r * 0.72);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(18,13,20,0.55)";
    ctx.beginPath();
    ctx.arc(-h.r * 0.1, 0, h.r * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (state.echo) {
    ctx.beginPath();
    ctx.strokeStyle = `rgba(246,239,230,${0.5 * state.echo.life})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 6]);
    ctx.arc(state.echo.x, state.echo.y, state.echo.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = `rgba(203,183,163,${0.12 * state.echo.life})`;
    ctx.beginPath();
    ctx.arc(state.echo.x, state.echo.y, state.echo.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Guide thread to nearest spark while learning
  if (state.running && state.life && state.guideSpark && (state.score < 8 || state.coachStep < 5)) {
    const s = state.guideSpark;
    ctx.save();
    ctx.globalAlpha = 0.35 + Math.sin(state.time * 4) * 0.1;
    ctx.strokeStyle = "#f2c15a";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    ctx.moveTo(state.life.x, state.life.y);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r * 2.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  if (state.life) {
    drawLifeBody(state.life, 1);
    if (state.safeUntil > 0) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(109,255,194,${0.45 * Math.min(1, state.safeUntil * 2)})`;
      ctx.lineWidth = 2;
      ctx.arc(state.life.x, state.life.y, state.life.r * 1.35, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (state.running) {
    ctx.save();
    ctx.globalAlpha = 0.32 + Math.sin(state.time * 3) * 0.12;
    ctx.strokeStyle = "#cbb7a3";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 8]);
    ctx.beginPath();
    ctx.arc(state.width / 2, state.height * 0.55, 28, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#cbb7a3";
    ctx.font = "700 13px Sora, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("зажми палец — не кликай", state.width / 2, state.height * 0.55 + 50);
    ctx.restore();
  } else if (state.demo && state.life) {
    drawLifeBody(state.life, 0.85);
  }

  if (state.running && state.grace > 0) {
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = "#cbb7a3";
    ctx.font = "700 12px Sora, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`тихо ещё ${state.grace.toFixed(1)}с`, state.width / 2, state.height * 0.14);
    ctx.restore();
  }

  for (const p of state.particles) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  for (const f of state.floatTexts) {
    ctx.globalAlpha = Math.max(0, f.life);
    ctx.fillStyle = f.color;
    ctx.font = "800 16px Syne, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(f.text, f.x, f.y);
    ctx.globalAlpha = 1;
  }

  if (state.flash > 0) {
    ctx.fillStyle = `rgba(246,239,230,${state.flash * 0.22})`;
    ctx.fillRect(0, 0, state.width, state.height);
  }

  ctx.restore();
}

function frame(ts) {
  const dt = Math.min(0.033, (ts - state.lastTs) / 1000 || 0.016);
  state.lastTs = ts;

  if (state.holdingStart && !state.running) {
    state.holdProgress = Math.min(1, state.holdProgress + dt * 1.7);
    const w = `${Math.round(state.holdProgress * 100)}%`;
    holdFill.style.width = w;
    holdFillOver.style.width = w;
    if (state.holdProgress >= 1) {
      state.holdingStart = false;
      startGame();
    }
  }

  if (state.running) update(dt);
  else if (!screenStart.classList.contains("hidden")) {
    state.demo = true;
    state.time += dt;
    if (state.sparks.length < 7 && Math.random() < 0.05) spawnSpark(true);
    for (const s of state.sparks) {
      s.pulse += dt * 5;
      s.x += s.vx * dt * 28;
      s.y += s.vy * dt * 28;
      if (s.x < 0 || s.x > state.width) s.vx *= -1;
      if (s.y < 0 || s.y > state.height) s.vy *= -1;
    }
    updateDemo(dt);
    for (const a of state.ash) {
      a.x += a.vx * dt * 40;
      a.y += a.vy * dt * 40;
    }
  }
  draw();
  requestAnimationFrame(frame);
}

function updateBestLabels() {
  bestStart.textContent = String(state.best);
  bestOver.textContent = String(state.best);
}

bindHoldToStart(btnStart, holdFill);
bindHoldToStart(btnRetry, holdFillOver);
canvas.addEventListener("pointerdown", onPointerDown, { passive: false });
canvas.addEventListener("pointermove", onPointerMove, { passive: false });
canvas.addEventListener("pointerup", onPointerUp, { passive: false });
canvas.addEventListener("pointercancel", onPointerUp, { passive: false });
window.addEventListener("resize", resize);

function boot() {
  resize();
  updateBestLabels();
  resetWorld();
  state.demo = true;
  requestAnimationFrame(frame);
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

boot();
