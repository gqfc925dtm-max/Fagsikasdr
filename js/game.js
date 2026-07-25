const BEST_KEY = "vysota-best";
const PERFECT_TOLERANCE = 4;
const MIN_BLOCK_WIDTH = 18;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const hud = document.getElementById("hud");
const scoreEl = document.getElementById("score");
const comboEl = document.getElementById("combo");
const screenStart = document.getElementById("screen-start");
const screenOver = document.getElementById("screen-over");
const bestStart = document.getElementById("best-start");
const bestOver = document.getElementById("best-over");
const finalScore = document.getElementById("final-score");
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
  blocks: [],
  current: null,
  direction: 1,
  speed: 0,
  cameraY: 0,
  targetCameraY: 0,
  shake: 0,
  particles: [],
  flash: 0,
  hueBase: 168,
  lastTs: 0,
  audio: null,
  demo: true,
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
}

function blockPalette(index) {
  const t = (state.hueBase + index * 11) % 360;
  const top = `hsl(${t} 48% 62%)`;
  const front = `hsl(${t} 52% 42%)`;
  const side = `hsl(${(t + 18) % 360} 46% 34%)`;
  const edge = `hsl(${t} 40% 78%)`;
  return { top, front, side, edge };
}

function createBaseBlock() {
  const w = Math.min(state.width * 0.58, 240);
  const h = Math.max(22, Math.min(28, state.width * 0.055));
  const depth = h * 0.72;
  return {
    x: (state.width - w) / 2,
    y: state.height * 0.62,
    w,
    h,
    depth,
    palette: blockPalette(0),
  };
}

function spawnCurrent() {
  const prev = state.blocks[state.blocks.length - 1];
  const travel = Math.max(state.width * 0.42, prev.w + 40);
  const fromLeft = state.direction > 0;
  state.current = {
    x: fromLeft ? prev.x - travel : prev.x + travel,
    y: prev.y - prev.h,
    w: prev.w,
    h: prev.h,
    depth: prev.depth,
    palette: blockPalette(state.blocks.length),
    minX: prev.x - travel,
    maxX: prev.x + travel,
  };
  state.speed = Math.min(4.2 + state.score * 0.085, 11.5);
}

function resetGame() {
  state.score = 0;
  state.combo = 0;
  state.particles = [];
  state.shake = 0;
  state.flash = 0;
  state.direction = 1;
  state.hueBase = 160 + Math.random() * 40;
  state.blocks = [createBaseBlock()];
  state.cameraY = 0;
  state.targetCameraY = 0;
  spawnCurrent();
  scoreEl.textContent = "0";
  comboEl.className = "combo";
  comboEl.textContent = "";
}

function showCombo(text, perfect = false) {
  comboEl.textContent = text;
  comboEl.className = `combo show${perfect ? " perfect" : ""}`;
  clearTimeout(showCombo._t);
  showCombo._t = setTimeout(() => {
    comboEl.classList.remove("show");
  }, 700);
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

function tone(freq, dur = 0.08, type = "sine", gain = 0.045) {
  const ac = ensureAudio();
  if (!ac) return;
  if (ac.state === "suspended") ac.resume();
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = gain;
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + dur);
}

function burst(x, y, color, count = 14) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 1.2 + Math.random() * 3.5;
    state.particles.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s - 1.2,
      life: 1,
      decay: 0.018 + Math.random() * 0.02,
      size: 2 + Math.random() * 3.5,
      color,
    });
  }
}

function placeBlock() {
  if (!state.running || !state.current) return;

  const prev = state.blocks[state.blocks.length - 1];
  const cur = state.current;
  const left = Math.max(prev.x, cur.x);
  const right = Math.min(prev.x + prev.w, cur.x + cur.w);
  const overlap = right - left;

  if (overlap <= MIN_BLOCK_WIDTH * 0.35) {
    endGame();
    return;
  }

  const offset = cur.x - prev.x;
  const perfect = Math.abs(offset) <= PERFECT_TOLERANCE;

  let placedW = overlap;
  let placedX = left;

  if (perfect) {
    placedW = prev.w;
    placedX = prev.x;
    state.combo += 1;
    state.score += 1 + Math.min(state.combo, 8);
    state.flash = 0.55;
    state.shake = 5;
    showCombo(state.combo >= 3 ? `идеально ×${state.combo}` : "идеально", true);
    buzz([10, 30, 12]);
    tone(660 + state.combo * 40, 0.09, "triangle", 0.05);
    tone(990 + state.combo * 20, 0.12, "sine", 0.03);
    burst(placedX + placedW / 2, cur.y, "#3ecfba", 22);
  } else {
    state.combo = 0;
    state.score += 1;
    state.shake = 2.5;
    showCombo("есть");
    buzz(8);
    tone(320, 0.07, "sine", 0.04);
    burst(placedX + placedW / 2, cur.y, cur.palette.edge, 10);

    // fallen chips
    if (cur.x < prev.x) {
      spawnChip(cur.x, cur.y, prev.x - cur.x, cur.h, cur.depth, cur.palette, -1);
    }
    if (cur.x + cur.w > prev.x + prev.w) {
      const chipW = cur.x + cur.w - (prev.x + prev.w);
      spawnChip(prev.x + prev.w, cur.y, chipW, cur.h, cur.depth, cur.palette, 1);
    }
  }

  state.blocks.push({
    x: placedX,
    y: cur.y,
    w: placedW,
    h: cur.h,
    depth: cur.depth,
    palette: cur.palette,
  });

  state.current = null;
  state.direction *= -1;
  state.targetCameraY = state.score * (prev.h * 0.92);
  scoreEl.textContent = String(state.score);

  if (state.score > state.best) {
    state.best = state.score;
    localStorage.setItem(BEST_KEY, String(state.best));
  }

  setTimeout(() => {
    if (state.running) spawnCurrent();
  }, 90);
}

function spawnChip(x, y, w, h, depth, palette, dir) {
  state.particles.push({
    chip: true,
    x,
    y,
    w,
    h,
    depth,
    palette,
    vx: dir * (1.4 + Math.random()),
    vy: -1.2,
    rot: 0,
    vr: dir * 0.04,
    life: 1,
    decay: 0.012,
  });
}

function endGame() {
  state.running = false;
  state.shake = 10;
  buzz([20, 40, 35]);
  tone(140, 0.2, "sawtooth", 0.035);
  if (state.current) {
    const cur = state.current;
    burst(cur.x + cur.w / 2, cur.y, cur.palette.front, 26);
    spawnChip(cur.x, cur.y, cur.w, cur.h, cur.depth, cur.palette, state.direction);
    state.current = null;
  }
  finalScore.textContent = String(state.score);
  bestOver.textContent = String(state.best);
  hud.classList.add("hidden");
  screenOver.classList.remove("hidden");
}

function startGame() {
  ensureAudio();
  screenStart.classList.add("hidden");
  screenOver.classList.add("hidden");
  hud.classList.remove("hidden");
  state.demo = false;
  resetGame();
  state.running = true;
  state.lastTs = performance.now();
}

function updateDemo(dt) {
  if (!state.demo || state.running) return;
  if (!state.current) {
    if (state.blocks.length > 8) {
      state.blocks = [createBaseBlock()];
      state.cameraY = 0;
      state.targetCameraY = 0;
      state.hueBase = 160 + Math.random() * 40;
    }
    state.direction = Math.random() > 0.5 ? 1 : -1;
    spawnCurrent();
    state.speed = 2.4;
    state.demoTimer = 0.55 + Math.random() * 0.7;
  }

  state.current.x += state.direction * state.speed * dt * 60;
  if (state.current.x <= state.current.minX) {
    state.current.x = state.current.minX;
    state.direction = 1;
  } else if (state.current.x >= state.current.maxX) {
    state.current.x = state.current.maxX;
    state.direction = -1;
  }

  state.demoTimer -= dt;
  if (state.demoTimer > 0) return;

  const prev = state.blocks[state.blocks.length - 1];
  const cur = state.current;
  const left = Math.max(prev.x, cur.x);
  const right = Math.min(prev.x + prev.w, cur.x + cur.w);
  const overlap = right - left;
  if (overlap < prev.w * 0.35) {
    state.current = null;
    return;
  }
  state.blocks.push({
    x: left,
    y: cur.y,
    w: overlap,
    h: cur.h,
    depth: cur.depth,
    palette: cur.palette,
  });
  state.current = null;
  state.targetCameraY = (state.blocks.length - 1) * (prev.h * 0.9);
}

function update(dt) {
  if (state.current && state.running) {
    state.current.x += state.direction * state.speed * dt * 60;
    if (state.current.x <= state.current.minX) {
      state.current.x = state.current.minX;
      state.direction = 1;
    } else if (state.current.x >= state.current.maxX) {
      state.current.x = state.current.maxX;
      state.direction = -1;
    }
  } else {
    updateDemo(dt);
  }

  state.cameraY += (state.targetCameraY - state.cameraY) * Math.min(1, dt * 8);
  state.shake *= Math.pow(0.88, dt * 60);
  state.flash = Math.max(0, state.flash - dt * 1.8);

  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx * dt * 60;
    p.y += p.vy * dt * 60;
    p.vy += (p.chip ? 0.22 : 0.08) * dt * 60;
    if (p.chip) p.rot += p.vr * dt * 60;
    p.life -= p.decay * dt * 60;
    if (p.life <= 0) state.particles.splice(i, 1);
  }
}

function drawBlock(block, yOffset, alpha = 1) {
  const { x, w, h, depth, palette } = block;
  const y = block.y - yOffset;
  ctx.save();
  ctx.globalAlpha = alpha;

  // top face
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w + depth * 0.55, y - depth);
  ctx.lineTo(x + depth * 0.55, y - depth);
  ctx.closePath();
  ctx.fillStyle = palette.top;
  ctx.fill();

  // front face
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fillStyle = palette.front;
  ctx.fill();

  // side face
  ctx.beginPath();
  ctx.moveTo(x + w, y);
  ctx.lineTo(x + w + depth * 0.55, y - depth);
  ctx.lineTo(x + w + depth * 0.55, y - depth + h);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fillStyle = palette.side;
  ctx.fill();

  // highlight edge
  ctx.beginPath();
  ctx.moveTo(x + 2, y + 1);
  ctx.lineTo(x + w - 2, y + 1);
  ctx.strokeStyle = palette.edge;
  ctx.globalAlpha = alpha * 0.55;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}

function drawBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, state.height);
  g.addColorStop(0, "#123247");
  g.addColorStop(0.45, "#0b1c2a");
  g.addColorStop(1, "#071018");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, state.width, state.height);

  // soft horizon glow that rises with score
  const glowY = state.height * 0.7 - state.cameraY * 0.05;
  const rg = ctx.createRadialGradient(
    state.width * 0.5,
    glowY,
    10,
    state.width * 0.5,
    glowY,
    state.width * 0.7
  );
  rg.addColorStop(0, "rgba(62, 207, 186, 0.14)");
  rg.addColorStop(0.45, "rgba(240, 164, 92, 0.07)");
  rg.addColorStop(1, "transparent");
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, state.width, state.height);

  // faint grid
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.strokeStyle = "#e8f4f2";
  ctx.lineWidth = 1;
  const step = 36;
  const shift = state.cameraY % step;
  for (let y = -step; y < state.height + step; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y + shift);
    ctx.lineTo(state.width, y + shift);
    ctx.stroke();
  }
  ctx.restore();
}

function draw() {
  const sx = (Math.random() - 0.5) * state.shake;
  const sy = (Math.random() - 0.5) * state.shake;
  ctx.save();
  ctx.translate(sx, sy);

  drawBackground();

  const yOffset = state.cameraY;
  const start = Math.max(0, state.blocks.length - 40);
  for (let i = start; i < state.blocks.length; i++) {
    const fade = i < start + 4 ? (i - start + 1) / 5 : 1;
    drawBlock(state.blocks[i], yOffset, fade);
  }

  if (state.current) {
    // ghost target outline
    const prev = state.blocks[state.blocks.length - 1];
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = "#e8f4f2";
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(prev.x, prev.y - prev.h - yOffset, prev.w, prev.h);
    ctx.restore();
    drawBlock(state.current, yOffset, 1);
  }

  for (const p of state.particles) {
    if (p.chip) {
      ctx.save();
      ctx.translate(p.x + p.w / 2, p.y - yOffset + p.h / 2);
      ctx.rotate(p.rot);
      drawBlock(
        { x: -p.w / 2, y: -p.h / 2, w: p.w, h: p.h, depth: p.depth, palette: p.palette },
        0,
        Math.max(0, p.life)
      );
      ctx.restore();
    } else {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y - yOffset, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  if (state.flash > 0) {
    ctx.fillStyle = `rgba(232, 244, 242, ${state.flash * 0.22})`;
    ctx.fillRect(0, 0, state.width, state.height);
  }

  ctx.restore();
}

function frame(ts) {
  const dt = Math.min(0.033, (ts - state.lastTs) / 1000 || 0.016);
  state.lastTs = ts;
  update(dt);
  draw();
  requestAnimationFrame(frame);
}

function onTap(e) {
  e.preventDefault();
  if (!state.running) return;
  placeBlock();
}

function updateBestLabels() {
  bestStart.textContent = String(state.best);
  bestOver.textContent = String(state.best);
}

btnStart.addEventListener("click", startGame);
btnRetry.addEventListener("click", startGame);
canvas.addEventListener("pointerdown", onTap, { passive: false });
window.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "Enter") {
    e.preventDefault();
    if (!state.running) startGame();
    else placeBlock();
  }
});

window.addEventListener("resize", () => {
  const wasRunning = state.running;
  const score = state.score;
  resize();
  if (!wasRunning && state.blocks.length === 0) {
    state.blocks = [createBaseBlock()];
  } else if (wasRunning) {
    // keep playable after rotate: rebuild proportions lightly
    state.score = score;
  }
});

// idle preview stack on start screen
function boot() {
  resize();
  updateBestLabels();
  state.demo = true;
  state.blocks = [createBaseBlock()];
  state.current = null;
  state.targetCameraY = 0;
  state.cameraY = 0;
  requestAnimationFrame(frame);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

boot();
