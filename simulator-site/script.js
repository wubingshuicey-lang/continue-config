// === 梦女模拟器 - 动态水滴交互背景 ===

const canvas = document.getElementById('waterCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let mouse = { x: -9999, y: -9999, isDown: false, prevX: -9999, prevY: -9999 };
let droplets = [];
let ripples = [];
const DROPLET_COUNT = 55;

// === 主题管理 ===
const html = document.documentElement;
const themeToggles = document.querySelectorAll('.theme-toggle');

function getTheme() {
  return html.getAttribute('data-theme') || 'light';
}

function setTheme(theme) {
  html.setAttribute('data-theme', theme);
  const icon = theme === 'dark' ? '☀' : '☾';
  document.querySelectorAll('.toggle-icon').forEach(el => el.textContent = icon);
  localStorage.setItem('dream-sim-theme', theme);
}

// 初始化主题
const saved = localStorage.getItem('dream-sim-theme') || 'light';
setTheme(saved);

themeToggles.forEach(btn => {
  btn.addEventListener('click', () => {
    const next = getTheme() === 'dark' ? 'light' : 'dark';
    setTheme(next);
  });
});

// === 调色板(根据主题) ===
function getColors() {
  const isDark = getTheme() === 'dark';
  return {
    dropletBase: isDark ? 'rgba(180,200,215,0.18)' : 'rgba(210,195,165,0.25)',
    dropletHighlight: isDark ? 'rgba(220,235,250,0.45)' : 'rgba(250,245,235,0.55)',
    dropletShadow: isDark ? 'rgba(140,160,180,0.15)' : 'rgba(160,135,105,0.18)',
    dropletBorder: isDark ? 'rgba(170,190,210,0.22)' : 'rgba(200,180,150,0.30)',
    rippleStroke: isDark ? 'rgba(170,190,210,0.22)' : 'rgba(190,160,130,0.25)',
    connectionLine: isDark ? 'rgba(170,190,210,0.05)' : 'rgba(190,165,135,0.06)',
  };
}

let colors = getColors();

// 主题切换时重绘
themeToggles.forEach(btn => {
  btn.addEventListener('click', () => { colors = getColors(); });
});

// === 窗口大小 ===
function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// === 鼠标事件 ===
document.addEventListener('mousemove', (e) => {
  mouse.prevX = mouse.x;
  mouse.prevY = mouse.y;
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

document.addEventListener('mousedown', () => { mouse.isDown = true; });
document.addEventListener('mouseup', () => { mouse.isDown = false; });

document.addEventListener('click', (e) => {
  // 创建涟漪
  for (let i = 0; i < 3; i++) {
    ripples.push(new Ripple(e.clientX, e.clientY, 60 + i * 30));
  }
});

// === 涟漪类 ===
class Ripple {
  constructor(x, y, delay) {
    this.x = x;
    this.y = y;
    this.radius = 0;
    this.maxRadius = 80 + Math.random() * 60;
    this.opacity = 0.35;
    this.delay = delay;
    this.elapsed = 0;
    this.active = false;
  }

  update(dt) {
    this.elapsed += dt;
    if (this.elapsed >= this.delay) {
      this.active = true;
    }
    if (!this.active) return;

    const progress = (this.elapsed - this.delay) / 1000;
    this.radius = this.maxRadius * (1 - Math.exp(-progress * 3));
    this.opacity = 0.35 * Math.exp(-progress * 2);
  }

  draw(ctx) {
    if (!this.active || this.opacity <= 0.01) return;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = colors.rippleStroke.replace('0.25', String(this.opacity));
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  get alive() {
    return this.opacity > 0.01;
  }
}

// === 水滴类 ===
class WaterDroplet {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.baseRadius = 18 + Math.random() * 40;
    this.radius = this.baseRadius;
    this.wobbleX = 0;
    this.wobbleY = 0;
    this.phase = Math.random() * Math.PI * 2;
    this.speed = 0.3 + Math.random() * 0.7;
    this.amplitude = 0.4 + Math.random() * 0.8;
    this.highlightOffset = { x: -0.3, y: -0.3 };
    this.distortion = Math.random() * 0.06; // 轻微变形
  }

  update(dt, mouseX, mouseY, mouseDown) {
    // 基础浮动
    this.phase += this.speed * dt * 0.001;
    this.wobbleX = Math.sin(this.phase) * this.amplitude;
    this.wobbleY = Math.cos(this.phase * 1.3) * this.amplitude * 0.7;

    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const influenceRadius = 160;

    if (dist < influenceRadius) {
      const force = (1 - dist / influenceRadius);
      const easedForce = force * force;

      // 鼠标吸引
      const attractForce = easedForce * 0.8;
      this.wobbleX += dx * attractForce * 0.015;
      this.wobbleY += dy * attractForce * 0.015;

      // 水滴轻微膨胀
      this.radius = this.baseRadius + easedForce * 6;

      // 高光偏向鼠标方向
      const angle = Math.atan2(dy, dx);
      this.highlightOffset = {
        x: Math.cos(angle) * 0.15 - 0.3,
        y: Math.sin(angle) * 0.15 - 0.3,
      };

      // 按住时额外放大
      if (mouseDown) {
        this.radius += easedForce * 3;
      }
    } else {
      // 恢复
      this.radius += (this.baseRadius - this.radius) * 0.05;
      this.highlightOffset.x += (-0.3 - this.highlightOffset.x) * 0.03;
      this.highlightOffset.y += (-0.3 - this.highlightOffset.y) * 0.03;
    }
  }

  draw(ctx) {
    const cx = this.x + this.wobbleX;
    const cy = this.y + this.wobbleY;
    const r = Math.max(4, this.radius);
    const d = this.distortion;

    ctx.save();
    ctx.translate(cx, cy);

    // 水滴主体 - 轻微椭圆变形
    ctx.beginPath();
    ctx.ellipse(0, 0, r * (1 + d), r * (1 - d * 0.6), 0, 0, Math.PI * 2);

    // 主体填充
    const baseGrad = ctx.createRadialGradient(-r * 0.2, -r * 0.25, r * 0.1, 0, 0, r);
    baseGrad.addColorStop(0, 'rgba(245, 238, 225, 0.30)');
    baseGrad.addColorStop(0.5, 'rgba(215, 200, 175, 0.18)');
    baseGrad.addColorStop(1, 'rgba(175, 150, 120, 0.08)');
    ctx.fillStyle = baseGrad;
    ctx.fill();

    // 边框
    ctx.strokeStyle = 'rgba(195, 175, 145, 0.20)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 高光点
    const hx = this.highlightOffset.x * r;
    const hy = this.highlightOffset.y * r;
    const hr = r * 0.22;

    const highlightGrad = ctx.createRadialGradient(hx, hy, 0, hx, hy, hr);
    highlightGrad.addColorStop(0, 'rgba(255, 252, 245, 0.65)');
    highlightGrad.addColorStop(0.5, 'rgba(250, 245, 235, 0.30)');
    highlightGrad.addColorStop(1, 'rgba(250, 245, 235, 0)');
    ctx.fillStyle = highlightGrad;
    ctx.beginPath();
    ctx.arc(hx, hy, hr, 0, Math.PI * 2);
    ctx.fill();

    // 底部微光
    const bottomGlow = ctx.createRadialGradient(0, r * 0.5, 0, 0, r * 0.3, r * 0.6);
    bottomGlow.addColorStop(0, 'rgba(230, 210, 180, 0.12)');
    bottomGlow.addColorStop(1, 'rgba(230, 210, 180, 0)');
    ctx.fillStyle = bottomGlow;
    ctx.beginPath();
    ctx.arc(0, r * 0.35, r * 0.55, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// === 初始化水滴 ===
function initDroplets() {
  droplets = [];
  for (let i = 0; i < DROPLET_COUNT; i++) {
    droplets.push(new WaterDroplet());
  }
}
initDroplets();
window.addEventListener('resize', initDroplets);

// === 画水滴之间的连接线 ===
function drawConnections() {
  const maxDist = 160;
  for (let i = 0; i < droplets.length; i++) {
    for (let j = i + 1; j < droplets.length; j++) {
      const a = droplets[i];
      const b = droplets[j];
      const ax = a.x + a.wobbleX;
      const ay = a.y + a.wobbleY;
      const bx = b.x + b.wobbleX;
      const by = b.y + b.wobbleY;
      const dx = ax - bx;
      const dy = ay - by;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < maxDist) {
        const opacity = (1 - dist / maxDist) * 0.06;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.strokeStyle = `rgba(190, 165, 135, ${opacity})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
  }
}

// === 主循环 ===
let lastTime = performance.now();

function animate(time) {
  const dt = Math.min(time - lastTime, 50); // cap delta time
  lastTime = time;

  ctx.clearRect(0, 0, width, height);

  // 更新和绘制涟漪
  ripples.forEach(r => r.update(dt));
  ripples = ripples.filter(r => r.alive);

  // 更新水滴
  droplets.forEach(d => d.update(dt, mouse.x, mouse.y, mouse.isDown));

  // 绘制连接线
  drawConnections();

  // 绘制涟漪
  ripples.forEach(r => r.draw(ctx));

  // 绘制水滴
  droplets.forEach(d => d.draw(ctx));

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
