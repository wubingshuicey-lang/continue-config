// === 梦女模拟器 — 极光星空背景 ===

const canvas = document.getElementById('waterCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, isDown: false };
let clickBursts = [];

// === 主题管理 ===
const html = document.documentElement;
const themeToggles = document.querySelectorAll('.theme-toggle');

function getTheme() {
  return html.getAttribute('data-theme') || 'dark';
}

function setTheme(theme) {
  html.setAttribute('data-theme', theme);
  var icon = theme === 'light' ? '☀' : '☾';
  document.querySelectorAll('.toggle-icon').forEach(function(el) { el.textContent = icon; });
  localStorage.setItem('dream-sim-theme', theme);
}

var saved = localStorage.getItem('dream-sim-theme') || 'dark';
setTheme(saved);

themeToggles.forEach(function(btn) {
  btn.addEventListener('click', function() {
    var next = getTheme() === 'dark' ? 'light' : 'dark';
    setTheme(next);
  });
});

// === 星空粒子 ===
var stars = [];
var STAR_COUNT = 120;

function createStar() {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    ox: 0, oy: 0, // offset from mouse pull
    r: 0.4 + Math.random() * 1.6,
    baseAlpha: 0.3 + Math.random() * 0.7,
    alpha: 0,
    twinkleSpeed: 0.3 + Math.random() * 1.5,
    twinklePhase: Math.random() * Math.PI * 2,
    driftX: (Math.random() - 0.5) * 0.15,
    driftY: (Math.random() - 0.5) * 0.08,
    hue: 30 + Math.random() * 30,
  };
}

function initStars() {
  stars = [];
  for (var i = 0; i < STAR_COUNT; i++) {
    stars.push(createStar());
  }
}

// === 极光波 ===
function AuroraWave(baseY, amplitude, wavelength, speed, hue, alpha) {
  this.baseY = baseY;
  this.amplitude = amplitude;
  this.wavelength = wavelength;
  this.speed = speed;
  this.hue = hue;
  this.alpha = alpha;
  this.phase = Math.random() * Math.PI * 2;
}

var auroraWaves = [];

function initAurora() {
  auroraWaves = [];
  for (var i = 0; i < 3; i++) {
    auroraWaves.push(new AuroraWave(
      height * (0.08 + i * 0.12),
      30 + Math.random() * 50,
      200 + Math.random() * 400,
      0.3 + Math.random() * 0.5,
      260 + i * 30 + Math.random() * 40,
      0.03 + Math.random() * 0.05
    ));
  }
}

// === 点击粒子爆发 ===
function spawnBurst(x, y) {
  var count = 18 + Math.floor(Math.random() * 14);
  for (var i = 0; i < count; i++) {
    var angle = Math.random() * Math.PI * 2;
    var speed = 40 + Math.random() * 160;
    clickBursts.push({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.5 + Math.random() * 0.8,
      age: 0,
      r: 0.8 + Math.random() * 1.6,
      hue: 25 + Math.random() * 30,
    });
  }
}

// === 流星 ===
var shootingStars = [];

function spawnShootingStar() {
  return {
    x: Math.random() * width,
    y: Math.random() * height * 0.5,
    len: 60 + Math.random() * 100,
    speed: 400 + Math.random() * 600,
    angle: 0.3 + Math.random() * 0.5,
    alpha: 0.5 + Math.random() * 0.4,
    life: 0,
    maxLife: 0.8 + Math.random() * 1.0,
  };
}

// === 窗口大小 ===
function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initStars();
  initAurora();
  initSunDust();
}
window.addEventListener('resize', resize);
resize();

// === 鼠标事件 ===
document.addEventListener('mousemove', function(e) {
  mouse.tx = e.clientX;
  mouse.ty = e.clientY;
});
document.addEventListener('touchmove', function(e) {
  if (e.touches.length > 0) {
    mouse.tx = e.touches[0].clientX;
    mouse.ty = e.touches[0].clientY;
  }
}, { passive: true });

document.addEventListener('mousedown', function() { mouse.isDown = true; });
document.addEventListener('mouseup', function() { mouse.isDown = false; });

document.addEventListener('click', function(e) {
  spawnBurst(e.clientX, e.clientY);
});

// === 亮色模式：暖金光尘 ===
var sunDust = [];

function initSunDust() {
  sunDust = [];
  for (var i = 0; i < 70; i++) {
    sunDust.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.6 + Math.random() * 2.5,
      speed: 0.15 + Math.random() * 0.6,
      alpha: 0.2 + Math.random() * 0.45,
      phase: Math.random() * Math.PI * 2,
      hue: 20 + Math.random() * 30,
    });
  }
}

function drawSunDust(time) {
  var t = time * 0.0004;

  // 顶部暖光渐变
  var topGlow = ctx.createRadialGradient(width * 0.45, -40, 0, width * 0.45, height * 0.4, height * 0.6);
  topGlow.addColorStop(0, 'rgba(255, 200, 150, 0.06)');
  topGlow.addColorStop(0.5, 'rgba(255, 180, 130, 0.03)');
  topGlow.addColorStop(1, 'rgba(255, 180, 130, 0)');
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, width, height);

  sunDust.forEach(function(d) {
    d.y -= d.speed * 0.35;
    d.phase += 0.01;
    if (d.y < -30) { d.y = height + 30; d.x = Math.random() * width; }
    var wobble = Math.sin(t + d.phase) * 20;
    var alpha = d.alpha * (0.5 + 0.5 * Math.sin(d.phase * 1.5));

    ctx.beginPath();
    ctx.arc(d.x + wobble, d.y, d.r, 0, Math.PI * 2);
    ctx.fillStyle = 'hsla(' + d.hue + ', 60%, 72%, ' + alpha + ')';
    ctx.fill();

    // 光晕
    if (d.r > 1.0) {
      var glow = ctx.createRadialGradient(d.x + wobble, d.y, 0, d.x + wobble, d.y, d.r * 3.5);
      glow.addColorStop(0, 'hsla(' + d.hue + ', 55%, 75%, ' + (alpha * 0.45) + ')');
      glow.addColorStop(1, 'hsla(' + d.hue + ', 55%, 75%, 0)');
      ctx.beginPath();
      ctx.arc(d.x + wobble, d.y, d.r * 3.5, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();
    }
  });
}

// === 绘制极光 ===
function drawAurora(time) {
  var isDark = getTheme() === 'dark';
  if (!isDark) { drawSunDust(time); return; }

  auroraWaves.forEach(function(wave) {
    var t = time * 0.0003;
    var gradientCount = 6;

    for (var i = 0; i < gradientCount; i++) {
      var offsetY = i * 18;
      var y = wave.baseY + offsetY;
      var progress = i / gradientCount;
      var bandAlpha = wave.alpha * (1 - progress) * 0.6;

      ctx.beginPath();
      ctx.moveTo(0, y);

      for (var x = 0; x <= width; x += 8) {
        var dx = x / wave.wavelength;
        var wave1 = Math.sin(dx * 1.7 + t * wave.speed + wave.phase) * wave.amplitude;
        var wave2 = Math.cos(dx * 0.9 + t * wave.speed * 0.7 + wave.phase * 1.3) * wave.amplitude * 0.6;
        var waveY = y + wave1 + wave2;
        ctx.lineTo(x, waveY);
      }

      ctx.lineTo(width, y + 120);
      ctx.lineTo(0, y + 120);
      ctx.closePath();

      var grad = ctx.createLinearGradient(0, y - wave.amplitude, 0, y + 120);
      var hue = wave.hue + i * 8;
      grad.addColorStop(0, 'hsla(' + hue + ', 60%, 70%, ' + bandAlpha + ')');
      grad.addColorStop(0.5, 'hsla(' + (hue + 20) + ', 50%, 60%, ' + (bandAlpha * 0.4) + ')');
      grad.addColorStop(1, 'hsla(' + (hue + 30) + ', 40%, 50%, 0)');
      ctx.fillStyle = grad;
      ctx.fill();
    }
  });
}

// === 绘制星空 ===
function drawStars(time) {
  stars.forEach(function(star) {
    // 平滑鼠标位置
    var mx = mouse.x;
    var my = mouse.y;

    // 鼠标吸引 — 近的星星被拉向光标
    var dx = mx - star.x;
    var dy = my - star.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var pullRadius = 160;
    var pullStrength = 0;

    if (dist < pullRadius && mx > 0) {
      pullStrength = (1 - dist / pullRadius);
      var easedPull = pullStrength * pullStrength;
      star.ox += (dx * easedPull * 0.012 - star.ox) * 0.12;
      star.oy += (dy * easedPull * 0.012 - star.oy) * 0.12;
    } else {
      star.ox += (0 - star.ox) * 0.05;
      star.oy += (0 - star.oy) * 0.05;
    }

    // 闪烁
    star.twinklePhase += star.twinkleSpeed * 0.016;
    star.alpha = star.baseAlpha * (0.5 + 0.5 * Math.sin(star.twinklePhase));

    // 缓慢漂移
    star.x += star.driftX * 0.016;
    star.y += star.driftY * 0.016;
    if (star.x < -10) star.x = width + 10;
    if (star.x > width + 10) star.x = -10;
    if (star.y < -10) star.y = height + 10;
    if (star.y > height + 10) star.y = -10;

    // 鼠标附近的星星更亮
    var glowRadius = 120;
    var glowBoost = dist < glowRadius && mx > 0 ? (1 - dist / glowRadius) * 0.7 : 0;
    var alpha = Math.min(1, star.alpha + glowBoost);

    var sx = star.x + star.ox;
    var sy = star.y + star.oy;
    var hue = getTheme() === 'dark' ? star.hue : 35;

    // 绘制星光
    ctx.beginPath();
    ctx.arc(sx, sy, star.r, 0, Math.PI * 2);
    ctx.fillStyle = 'hsla(' + hue + ', 40%, 80%, ' + alpha + ')';
    ctx.fill();

    // 亮星加辉光
    if (star.baseAlpha > 0.7 || glowBoost > 0.2) {
      var glowAlpha = alpha * 0.3;
      var glowGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, star.r * 5);
      glowGrad.addColorStop(0, 'hsla(' + hue + ', 50%, 75%, ' + glowAlpha + ')');
      glowGrad.addColorStop(1, 'hsla(' + hue + ', 50%, 75%, 0)');
      ctx.beginPath();
      ctx.arc(sx, sy, star.r * 5, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();
    }
  });
}

// === 绘制鼠标光晕 ===
function drawCursorGlow() {
  if (mouse.x < 0 || mouse.y < 0) return;

  var isDark = getTheme() === 'dark';
  var hue = isDark ? '30, 50%, 75%' : '30, 40%, 65%';

  // 外层大光晕
  var outerGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 80);
  outerGrad.addColorStop(0, 'hsla(' + hue + ', 0.08)');
  outerGrad.addColorStop(1, 'hsla(' + hue + ', 0)');
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 80, 0, Math.PI * 2);
  ctx.fillStyle = outerGrad;
  ctx.fill();

  // 内层光点
  var innerGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 20);
  innerGrad.addColorStop(0, 'hsla(' + hue + ', 0.18)');
  innerGrad.addColorStop(1, 'hsla(' + hue + ', 0)');
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 20, 0, Math.PI * 2);
  ctx.fillStyle = innerGrad;
  ctx.fill();
}

// === 绘制点击爆发粒子 ===
function drawBursts(dt) {
  for (var i = clickBursts.length - 1; i >= 0; i--) {
    var p = clickBursts[i];
    p.age += dt * 0.001;
    if (p.age > p.life) {
      clickBursts.splice(i, 1);
      continue;
    }

    var progress = p.age / p.life;
    var alpha = (1 - progress) * (1 - progress);
    var px = p.x + p.vx * p.age;
    var py = p.y + p.vy * p.age;
    p.vy += 40 * dt * 0.001; // 重力

    var hue = getTheme() === 'dark' ? p.hue : 35;
    ctx.beginPath();
    ctx.arc(px, py, p.r * (1 - progress * 0.6), 0, Math.PI * 2);
    ctx.fillStyle = 'hsla(' + hue + ', 60%, 80%, ' + alpha + ')';
    ctx.fill();
  }
}

// === 绘制流星 ===
function drawShootingStars(dt) {
  if (Math.random() < 0.003 && shootingStars.length < 2) {
    shootingStars.push(spawnShootingStar());
  }

  for (var i = shootingStars.length - 1; i >= 0; i--) {
    var s = shootingStars[i];
    s.life += dt * 0.001;
    if (s.life > s.maxLife) {
      shootingStars.splice(i, 1);
      continue;
    }

    var progress = s.life / s.maxLife;
    var alpha = s.alpha * (1 - progress) * (progress < 0.15 ? progress / 0.15 : 1);
    var cx = s.x + Math.cos(s.angle) * s.speed * s.life;
    var cy = s.y + Math.sin(s.angle) * s.speed * s.life;

    var tailLen = s.len * (1 - progress * 0.5);
    var sx = cx - Math.cos(s.angle) * tailLen;
    var sy = cy - Math.sin(s.angle) * tailLen;

    var grad = ctx.createLinearGradient(sx, sy, cx, cy);
    grad.addColorStop(0, 'rgba(255, 220, 180, 0)');
    grad.addColorStop(0.7, 'rgba(255, 200, 150, ' + (alpha * 0.5) + ')');
    grad.addColorStop(1, 'rgba(255, 240, 220, ' + alpha + ')');

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(cx, cy);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 240, 225, ' + alpha + ')';
    ctx.fill();
  }
}

// === 主循环 ===
var lastTime = performance.now();

function animate(time) {
  var dt = Math.min(time - lastTime, 50);
  lastTime = time;

  // 平滑鼠标位置
  var smoothing = 0.15;
  if (mouse.tx > -999) {
    mouse.x += (mouse.tx - mouse.x) * smoothing;
    mouse.y += (mouse.ty - mouse.y) * smoothing;
  }

  ctx.clearRect(0, 0, width, height);

  drawAurora(time);
  drawStars(time);
  drawCursorGlow();
  drawBursts(dt);
  drawShootingStars(dt);

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
