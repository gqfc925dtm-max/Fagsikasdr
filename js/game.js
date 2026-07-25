const BEST_KEY = "ottisk-best";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const hud = document.getElementById("hud");
const scoreEl = document.getElementById("score");
const comboEl = document.getElementById("combo");
const heatFill = document.getElementById("heat-fill");
const screenStart = document.getElementById("screen-start");
const screenOver = document.getElementById("screen-over");
const bestStart = document.getElementById("best-start");
const bestOver = document.getElementById("best-over");
const finalScore = document.getElementById("final-score");
const deathReason = document.getElementById("death-reason");
const btnStart = document.getElementById("btn-start");
const btnRetry = document.getElementById("btn-retry");

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
  particles: [],
  scars: [],
  shake: 0,
  flash: 0,
  spawnAcc: 0,
  hunterAcc: 0,
  lastTs: 0,
  audio: null,
  death: "",
  time: 0,
  stillTimer: 0,
  lastX: 0,
  lastY: 0,
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
}

function rand(a, b) {
  return a + Math.random() * (b - a);
}

function dist(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.hypot(dx, dy);
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
  o.frequency.value = freq;
  g.gain.value = gain;
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
  o.connect(g);
  g.connect(ac.destination);
  o.start();
  o.stop(ac.currentTime + dur);
}

function showCombo(text) {
  comboEl.textContent = text;
  comboEl.className = "combo show";
  clearTimeout(showCombo._t);
  showCombo._t = setTimeout(() => comboEl.classList.remove("show"), 650);
}

function burst(x, y, color, n = 12) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = rand(1, 4.2);
    state.particles.push({
      x, y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: 1,
      decay: rand(0.016, 0.035),
      size: rand(1.5, 4),
      color,
    });
  }
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
  state.particles = [];
  state.scars = [];
  state.shake = 0;
  state.flash = 0;
  state.spawnAcc = 0;
  state.hunterAcc = 0;
  state.stillTimer = 0;
  state.death = "";
  state.time = 0;
  scoreEl.textContent = "0";
  heatFill.style.width = "0%";
  comboEl.className = "combo";
  for (let i = 0; i < 7; i++) spawnSpark(true);
}

function spawnSpark(anywhere = false) {
  const margin = 36;
  state.sparks.push({
    x: rand(margin, state.width - margin),
    y: anywhere ? rand(state.height * 0.2, state.height - margin) : rand(-40, -10),
    vx: rand(-0.4, 0.4),
    vy: anywhere ? rand(-0.25, 0.45) : rand(0.4, 1.2),
    r: rand(5, 9),
    pulse: Math.random() * Math.PI * 2,
    worth: 1,
  });
}

function spawnHunter() {
  const side = Math.floor(Math.random() * 4);
  let x, y;
  if (side === 0) { x = rand(0, state.width); y = -20; }
  else if (side === 1) { x = state.width + 20; y = rand(0, state.height); }
  else if (side === 2) { x = rand(0, state.width); y = state.height + 20; }
  else { x = -20; y = rand(0, state.height); }

  const target = state.life || state.echo || { x: state.width / 2, y: state.height / 2 };
  state.hunters.push({
    x, y,
    vx: 0,
    vy: 0,
    r: rand(10, 15),
    anger: rand(0.7, 1.25),
    targetX: target.x,
    targetY: target.y,
  });
}

function beginLife(x, y) {
  const baseR = 22;
  state.life = {
    x, y,
    r: baseR,
    hunger: 0,
    wobble: 0,
    born: state.time,
  };
  state.lastX = x;
  state.lastY = y;
  state.stillTimer = 0;
  state.heat = Math.max(0, state.heat - 0.18);
  burst(x, y, "#7dffb2", 10);
  tone(520, 0.06, "triangle", 0.035);
  buzz(6);
}

function endLife(asEcho = true) {
  if (!state.life) return;
  if (asEcho) {
    state.echo = {
      x: state.life.x,
      y: state.life.y,
      r: state.life.r,
      life: 1,
    };
  }
  state.life = null;
}

function kill(reason) {
  if (!state.running) return;
  state.running = false;
  state.touching = false;
  state.death = reason;
  state.shake = 12;
  state.flash = 0.55;
  buzz([18, 40, 30]);
  tone(110, 0.22, "sawtooth", 0.04);
  if (state.life) burst(state.life.x, state.life.y, "#ff3b5c", 28);
  endLife(false);
  finalScore.textContent = String(state.score);
  bestOver.textContent = String(state.best);
  deathReason.textContent = reason;
  hud.classList.add("hidden");
  screenOver.classList.remove("hidden");
}

function addScore(n) {
  state.score += n;
  state.combo += 1;
  scoreEl.textContent = String(state.score);
  if (state.score > state.best) {
    state.best = state.score;
    localStorage.setItem(BEST_KEY, String(state.best));
  }
  if (state.combo >= 3) showCombo(`цепь ×${state.combo}`);
}

function startGame() {
  ensureAudio();
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
  state.life.x = e.clientX;
  state.life.y = e.clientY;
}

function onPointerUp(e) {
  if (!state.touching || (state.pointerId != null && e.pointerId !== state.pointerId)) return;
  state.touching = false;
  state.pointerId = null;
  if (!state.running) return;
  if (state.life) {
    // Leaving a scar of where it rested too long
    if (state.heat > 0.55) {
      state.scars.push({
        x: state.life.x,
        y: state.life.y,
        r: state.life.r * 0.8,
        life: 1,
      });
    }
    endLife(true);
    tone(240, 0.05, "sine", 0.03);
  }
}

function update(dt) {
  state.time += dt;
  const difficulty = 1 + state.score * 0.035;

  if (state.life) {
    const moved = dist(state.life.x, state.life.y, state.lastX, state.lastY);
    if (moved < 2.2) {
      state.stillTimer += dt;
      // Heat grows faster the longer you camp
      const heatRate = (0.16 + state.stillTimer * 0.12) * (0.85 + difficulty * 0.08);
      state.heat = Math.min(1, state.heat + heatRate * dt);
    } else {
      state.stillTimer = 0;
      state.heat = Math.max(0, state.heat - 0.55 * dt);
      // Movement leaves soft burns that hunters can smell
      if (Math.random() < 0.35) {
        state.burns.push({
          x: state.life.x,
          y: state.life.y,
          r: state.life.r * 0.55,
          life: 1,
        });
      }
    }
    state.lastX = state.life.x;
    state.lastY = state.life.y;
    state.life.wobble += dt * 8;
    state.life.r = 20 + Math.min(18, state.combo * 0.7) + Math.sin(state.life.wobble) * 1.5;

    if (state.heat >= 1) {
      kill("сгорело на месте");
      return;
    }

    // Edge death while alive under finger
    const m = state.life.r * 0.35;
    if (
      state.life.x < m ||
      state.life.y < m ||
      state.life.x > state.width - m ||
      state.life.y > state.height - m
    ) {
      kill("ушло за край");
      return;
    }
  } else {
    state.heat = Math.max(0, state.heat - 0.25 * dt);
  }

  heatFill.style.width = `${Math.round(state.heat * 100)}%`;

  // Sparks
  state.spawnAcc += dt;
  const spawnEvery = Math.max(0.28, 0.85 - difficulty * 0.05);
  while (state.spawnAcc >= spawnEvery) {
    state.spawnAcc -= spawnEvery;
    spawnSpark(false);
  }

  for (let i = state.sparks.length - 1; i >= 0; i--) {
    const s = state.sparks[i];
    s.pulse += dt * 6;
    s.x += s.vx * dt * 60;
    s.y += s.vy * dt * 60;
    s.vx += Math.sin(state.time * 2 + s.y * 0.01) * 0.01;
    if (s.y > state.height + 30 || s.x < -40 || s.x > state.width + 40) {
      state.sparks.splice(i, 1);
      continue;
    }
    if (state.life && dist(s.x, s.y, state.life.x, state.life.y) < state.life.r + s.r * 0.2) {
      state.sparks.splice(i, 1);
      addScore(1);
      state.heat = Math.max(0, state.heat - 0.06);
      burst(s.x, s.y, "#f0c15a", 9);
      tone(660 + Math.min(state.combo, 12) * 28, 0.05, "sine", 0.03);
      buzz(5);
    }
  }

  // Hunters
  state.hunterAcc += dt;
  const hunterEvery = Math.max(0.9, 2.4 - difficulty * 0.12);
  if (state.hunterAcc >= hunterEvery) {
    state.hunterAcc = 0;
    spawnHunter();
    if (difficulty > 2.2 && Math.random() < 0.4) spawnHunter();
  }

  for (let i = state.hunters.length - 1; i >= 0; i--) {
    const h = state.hunters[i];
    let tx = state.width / 2;
    let ty = state.height / 2;
    if (state.life) {
      tx = state.life.x;
      ty = state.life.y;
    } else if (state.echo) {
      tx = state.echo.x;
      ty = state.echo.y;
    } else if (state.burns.length) {
      const b = state.burns[state.burns.length - 1];
      tx = b.x;
      ty = b.y;
    }
    const ang = Math.atan2(ty - h.y, tx - h.x);
    const spd = (1.1 + difficulty * 0.15) * h.anger;
    h.vx += Math.cos(ang) * spd * dt * 3;
    h.vy += Math.sin(ang) * spd * dt * 3;
    h.vx *= 0.96;
    h.vy *= 0.96;
    h.x += h.vx * dt * 60;
    h.y += h.vy * dt * 60;

    if (state.life && dist(h.x, h.y, state.life.x, state.life.y) < state.life.r * 0.72 + h.r * 0.5) {
      kill("съели тень");
      return;
    }
    if (state.echo && dist(h.x, h.y, state.echo.x, state.echo.y) < state.echo.r * 0.7 + h.r * 0.5) {
      // Shattering an echo costs combo, not always death
      burst(state.echo.x, state.echo.y, "#c9b29a", 16);
      state.echo = null;
      state.combo = 0;
      state.shake = 5;
      tone(150, 0.1, "square", 0.025);
      buzz(12);
    }

    if (h.x < -80 || h.y < -80 || h.x > state.width + 80 || h.y > state.height + 80) {
      state.hunters.splice(i, 1);
    }
  }

  if (state.echo) {
    state.echo.life -= dt * 1.7;
    if (state.echo.life <= 0) state.echo = null;
  }

  for (let i = state.burns.length - 1; i >= 0; i--) {
    state.burns[i].life -= dt * 1.3;
    if (state.burns[i].life <= 0) state.burns.splice(i, 1);
  }
  for (let i = state.scars.length - 1; i >= 0; i--) {
    state.scars[i].life -= dt * 0.15;
    if (state.scars[i].life <= 0) state.scars.splice(i, 1);
  }
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx * dt * 60;
    p.y += p.vy * dt * 60;
    p.vy += 0.04 * dt * 60;
    p.life -= p.decay * dt * 60;
    if (p.life <= 0) state.particles.splice(i, 1);
  }

  state.shake *= Math.pow(0.9, dt * 60);
  state.flash = Math.max(0, state.flash - dt * 2.2);

  // If not touching for too long while hunters exist, pressure rises via more hunters - already handled
  // Soft fail: starve if no touch and no sparks eaten recently - skip, too punishing
}

function drawBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, state.height);
  g.addColorStop(0, "#2a1810");
  g.addColorStop(0.55, "#1a100c");
  g.addColorStop(1, "#140c08");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, state.width, state.height);

  // grainy vignette rings
  const rg = ctx.createRadialGradient(
    state.width * 0.5,
    state.height * 0.45,
    20,
    state.width * 0.5,
    state.height * 0.45,
    state.width * 0.75
  );
  rg.addColorStop(0, "rgba(255,106,61,0.05)");
  rg.addColorStop(1, "transparent");
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, state.width, state.height);
}

function draw() {
  const sx = (Math.random() - 0.5) * state.shake;
  const sy = (Math.random() - 0.5) * state.shake;
  ctx.save();
  ctx.translate(sx, sy);
  drawBackground();

  // scars
  for (const sc of state.scars) {
    ctx.beginPath();
    ctx.fillStyle = `rgba(255,59,92,${0.12 * sc.life})`;
    ctx.arc(sc.x, sc.y, sc.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // burns
  for (const b of state.burns) {
    ctx.beginPath();
    ctx.fillStyle = `rgba(240,193,90,${0.1 * b.life})`;
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // sparks
  for (const s of state.sparks) {
    const pr = s.r * (1 + Math.sin(s.pulse) * 0.15);
    const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, pr * 3);
    glow.addColorStop(0, "rgba(240,193,90,0.85)");
    glow.addColorStop(0.4, "rgba(255,106,61,0.35)");
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(s.x, s.y, pr * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f3ebe1";
    ctx.beginPath();
    ctx.arc(s.x, s.y, pr * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }

  // hunters
  for (const h of state.hunters) {
    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.rotate(Math.atan2(h.vy, h.vx));
    ctx.fillStyle = "#ff3b5c";
    ctx.beginPath();
    ctx.moveTo(h.r, 0);
    ctx.lineTo(-h.r * 0.8, h.r * 0.7);
    ctx.lineTo(-h.r * 0.45, 0);
    ctx.lineTo(-h.r * 0.8, -h.r * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // echo - fragile afterimage
  if (state.echo) {
    ctx.beginPath();
    ctx.strokeStyle = `rgba(243,235,225,${0.55 * state.echo.life})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 6]);
    ctx.arc(state.echo.x, state.echo.y, state.echo.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = `rgba(201,178,154,${0.12 * state.echo.life})`;
    ctx.beginPath();
    ctx.arc(state.echo.x, state.echo.y, state.echo.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // life - only under finger
  if (state.life) {
    const L = state.life;
    const heatTint = state.heat;
    const glow = ctx.createRadialGradient(L.x, L.y, L.r * 0.1, L.x, L.y, L.r * 2.4);
    glow.addColorStop(0, `rgba(125,255,178,${0.55 - heatTint * 0.25})`);
    glow.addColorStop(0.45, `rgba(255,106,61,${0.2 + heatTint * 0.35})`);
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(L.x, L.y, L.r * 2.4, 0, Math.PI * 2);
    ctx.fill();

    // organic body
    ctx.beginPath();
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + L.wobble * 0.15;
      const rr = L.r * (0.86 + Math.sin(L.wobble * 1.4 + i) * 0.1);
      const px = L.x + Math.cos(a) * rr;
      const py = L.y + Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    const body = ctx.createRadialGradient(L.x - L.r * 0.2, L.y - L.r * 0.2, 2, L.x, L.y, L.r);
    body.addColorStop(0, heatTint > 0.65 ? "#ffd19a" : "#eafff2");
    body.addColorStop(0.55, heatTint > 0.65 ? "#ff6a3d" : "#7dffb2");
    body.addColorStop(1, heatTint > 0.8 ? "#ff3b5c" : "#1f6b4a");
    ctx.fillStyle = body;
    ctx.fill();

    // pupil / core
    ctx.fillStyle = "#140c08";
    ctx.beginPath();
    ctx.arc(L.x, L.y, Math.max(3, L.r * 0.18), 0, Math.PI * 2);
    ctx.fill();
  } else if (state.running) {
    // invitation mark
    ctx.save();
    ctx.globalAlpha = 0.25 + Math.sin(state.time * 3) * 0.1;
    ctx.strokeStyle = "#c9b29a";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 8]);
    ctx.beginPath();
    ctx.arc(state.width / 2, state.height * 0.55, 26, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#c9b29a";
    ctx.font = "600 13px Sora, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("коснись", state.width / 2, state.height * 0.55 + 48);
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

  if (state.flash > 0) {
    ctx.fillStyle = `rgba(243,235,225,${state.flash * 0.25})`;
    ctx.fillRect(0, 0, state.width, state.height);
  }

  ctx.restore();
}

function frame(ts) {
  const dt = Math.min(0.033, (ts - state.lastTs) / 1000 || 0.016);
  state.lastTs = ts;
  if (state.running) update(dt);
  else if (!screenStart.classList.contains("hidden")) {
    // idle ambient sparks
    state.time += dt;
    if (state.sparks.length < 5 && Math.random() < 0.03) spawnSpark(true);
    for (const s of state.sparks) {
      s.pulse += dt * 5;
      s.x += s.vx * dt * 30;
      s.y += s.vy * dt * 30;
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

// Prevent start button from also placing life awkwardly: start then wait for touch on canvas
btnStart.addEventListener("pointerup", (e) => e.stopPropagation());

function boot() {
  resize();
  updateBestLabels();
  resetWorld();
  requestAnimationFrame(frame);
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

boot();
