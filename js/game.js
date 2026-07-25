const BEST_KEY = "ottisk-best-v2";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const hud = document.getElementById("hud");
const scoreEl = document.getElementById("score");
const comboEl = document.getElementById("combo");
const toastEl = document.getElementById("toast");
const mutBadge = document.getElementById("mut-badge");
const heatFill = document.getElementById("heat-fill");
const screenStart = document.getElementById("screen-start");
const screenOver = document.getElementById("screen-over");
const bestStart = document.getElementById("best-start");
const bestOver = document.getElementById("best-over");
const finalScore = document.getElementById("final-score");
const deathReason = document.getElementById("death-reason");
const mutSummary = document.getElementById("mut-summary");
const btnStart = document.getElementById("btn-start");
const btnRetry = document.getElementById("btn-retry");

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
  lastX: 0,
  lastY: 0,
  mutation: MUTATIONS[0],
  unlocked: ["spark"],
  demo: true,
  demoPhase: 0,
  demoTimer: 0,
};

function resize() {
  state.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  state.width = window.innerWidth;
  state.height = window.innerHeight;
  canvas.width = Math.floor(state.width * state.dpr);
  canvas.height = Math.floor(state.height * state.dpr);
  canvas.style.width = `${state.width}px`;
  canvas.style.height = `${state.height}px`;
  ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  if (!state.ash.length) seedAsh();
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
  for (let i = 0; i < 8; i++) spawnSpark(true);
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
  state.heat = Math.max(0, state.heat - (hasMut("cool") ? 0.28 : 0.16));
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
  hud.classList.add("hidden");
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
  if (n > 1) floatText(x, y, `+${n}`, "#f2c15a");
  if (state.combo >= 3) showCombo(`цепь ×${state.combo}`);
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
  screenStart.classList.add("hidden");
  screenOver.classList.add("hidden");
  hud.classList.remove("hidden");
  resetWorld();
  state.running = true;
  state.lastTs = performance.now();
}

function onPointerDown(e) {
  e.preventDefault();
  if (!state.running) return;
  if (state.touching) return;
  state.touching = true;
  state.pointerId = e.pointerId;
  try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
  beginLife(e.clientX, e.clientY);
}

function onPointerMove(e) {
  if (!state.running || !state.touching || e.pointerId !== state.pointerId || !state.life) return;
  const lx = state.life.x;
  const ly = state.life.y;
  state.life.x = e.clientX;
  state.life.y = e.clientY;
  if (hasMut("veins") && dist(lx, ly, e.clientX, e.clientY) > 4) {
    state.veins.push({ x: e.clientX, y: e.clientY, life: 1, r: state.life.r * 0.55 });
    if (state.veins.length > 80) state.veins.shift();
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
  }
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
    const coolFactor = hasMut("cool") ? 0.62 : 1;
    if (moved < 2.4) {
      state.stillTimer += dt;
      const heatRate = (0.15 + state.stillTimer * 0.13) * (0.85 + diff * 0.08) * coolFactor;
      state.heat = Math.min(1, state.heat + heatRate * dt);
    } else {
      state.stillTimer = 0;
      state.heat = Math.max(0, state.heat - (0.62 + (hasMut("cool") ? 0.2 : 0)) * dt);
      if (Math.random() < 0.4) {
        state.burns.push({
          x: state.life.x,
          y: state.life.y,
          r: state.life.r * 0.5,
          life: 1,
        });
      }
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
    state.heat = Math.max(0, state.heat - 0.28 * dt);
  }

  heatFill.style.width = `${Math.round(state.heat * 100)}%`;
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
      if (s.type === "cool") state.heat = Math.max(0, state.heat - 0.22);
      else state.heat = Math.max(0, state.heat - 0.05);
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
  if (state.hunterAcc >= hunterEvery) {
    state.hunterAcc = 0;
    spawnHunter();
    if (diff > 2 && Math.random() < 0.45) spawnHunter();
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
    const spd = (1.05 + diff * 0.16) * h.anger;
    h.vx += Math.cos(ang) * spd * dt * 3.2;
    h.vy += Math.sin(ang) * spd * dt * 3.2;
    h.vx *= 0.955;
    h.vy *= 0.955;
    h.x += h.vx * dt * 60;
    h.y += h.vy * dt * 60;

    if (state.life) {
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
  if (hasMut("bloom")) return { a: "#2a1830", b: "#120d14", glow: "rgba(255,122,209,0.10)" };
  if (hasMut("fang")) return { a: "#2a1418", b: "#120d14", glow: "rgba(255,61,102,0.10)" };
  if (hasMut("magnet")) return { a: "#1a2030", b: "#100e16", glow: "rgba(126,182,255,0.10)" };
  if (hasMut("cool")) return { a: "#152428", b: "#0e1216", glow: "rgba(109,255,194,0.10)" };
  return { a: "#2a171d", b: "#120d14", glow: "rgba(255,104,64,0.08)" };
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
  const rg = ctx.createRadialGradient(cx, cy, 10, cx, cy, state.width * 0.7);
  rg.addColorStop(0, p.glow);
  rg.addColorStop(1, "transparent");
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, state.width, state.height);

  if (state.bloom > 0) {
    ctx.fillStyle = `rgba(242,193,90,${state.bloom * 0.08})`;
    ctx.fillRect(0, 0, state.width, state.height);
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
  const glow = ctx.createRadialGradient(L.x, L.y, L.r * 0.1, L.x, L.y, L.r * 2.6);
  glow.addColorStop(0, `rgba(109,255,194,${0.5 - heatTint * 0.2})`);
  glow.addColorStop(0.4, `rgba(255,104,64,${0.18 + heatTint * 0.35})`);
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(L.x, L.y, L.r * 2.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  const lobes = hasMut("fang") ? 9 : 7;
  for (let i = 0; i < lobes; i++) {
    const a = (i / lobes) * Math.PI * 2 + L.wobble * 0.14;
    const spike = hasMut("fang") && state.combo >= 5 && i % 2 === 0 ? 1.18 : 1;
    const rr = L.r * (0.84 + Math.sin(L.wobble * 1.5 + i * 1.3) * 0.11) * spike;
    const px = L.x + Math.cos(a) * rr;
    const py = L.y + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  const body = ctx.createRadialGradient(L.x - L.r * 0.2, L.y - L.r * 0.25, 2, L.x, L.y, L.r);
  body.addColorStop(0, heatTint > 0.7 ? "#ffe1b0" : "#eafff2");
  body.addColorStop(0.55, heatTint > 0.7 ? "#ff6840" : hasMut("magnet") ? "#9ec8ff" : "#6dffc2");
  body.addColorStop(1, heatTint > 0.85 ? "#ff3d66" : "#1c5a48");
  ctx.fillStyle = body;
  ctx.fill();

  // inner core
  ctx.fillStyle = "#120d14";
  ctx.beginPath();
  ctx.arc(L.x, L.y, Math.max(3, L.r * 0.17), 0, Math.PI * 2);
  ctx.fill();

  // tiny highlight
  ctx.fillStyle = "rgba(246,239,230,0.55)";
  ctx.beginPath();
  ctx.arc(L.x - L.r * 0.22, L.y - L.r * 0.22, Math.max(2, L.r * 0.1), 0, Math.PI * 2);
  ctx.fill();
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
    ctx.fillStyle = "#ff3d66";
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

  if (state.life) drawLifeBody(state.life, 1);
  else if (state.running) {
    ctx.save();
    ctx.globalAlpha = 0.28 + Math.sin(state.time * 3) * 0.1;
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
    ctx.fillText("коснись — оно родится", state.width / 2, state.height * 0.55 + 50);
    ctx.restore();
  } else if (state.demo && state.life) {
    drawLifeBody(state.life, 0.85);
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

btnStart.addEventListener("click", startGame);
btnRetry.addEventListener("click", startGame);
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
