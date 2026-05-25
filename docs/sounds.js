// === 梦女模拟器 - Web Audio 音效引擎 ===
const Sound = (() => {
  let ctx = null, enabled = true;

  function getCtx() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {} }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function send() {
    const c = getCtx(); if (!c || !enabled) return;
    const osc = c.createOscillator(), gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, c.currentTime + 0.06);
    gain.gain.setValueAtTime(0.06, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08);
    osc.connect(gain); gain.connect(c.destination);
    osc.start(c.currentTime); osc.stop(c.currentTime + 0.08);
  }

  function receive() {
    if (!enabled) return;
    const c = getCtx(); if (!c) return;
    [880, 1100].forEach((freq, i) => setTimeout(() => {
      const osc = c.createOscillator(), gain = c.createGain();
      osc.type = 'sine'; osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.07, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + (i === 0 ? 0.12 : 0.15));
      osc.connect(gain); gain.connect(c.destination);
      osc.start(c.currentTime); osc.stop(c.currentTime + (i === 0 ? 0.12 : 0.15));
    }, i * 80));
  }

  function typing() {
    if (!enabled) return;
    const c = getCtx(); if (!c) return;
    const osc = c.createOscillator(), gain = c.createGain();
    osc.type = 'sine'; osc.frequency.value = 600;
    gain.gain.setValueAtTime(0.02, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.04);
    osc.connect(gain); gain.connect(c.destination);
    osc.start(c.currentTime); osc.stop(c.currentTime + 0.04);
  }

  function click() {
    if (!enabled) return;
    const c = getCtx(); if (!c) return;
    const osc = c.createOscillator(), gain = c.createGain();
    osc.type = 'sine'; osc.frequency.value = 800;
    gain.gain.setValueAtTime(0.03, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.03);
    osc.connect(gain); gain.connect(c.destination);
    osc.start(c.currentTime); osc.stop(c.currentTime + 0.03);
  }

  function toggle() { enabled = !enabled; return enabled; }
  function isEnabled() { return enabled; }

  function init() {
    document.addEventListener('click', () => { const c = getCtx(); if (c && c.state === 'suspended') c.resume(); }, { once: true });
    document.addEventListener('touchstart', () => { const c = getCtx(); if (c && c.state === 'suspended') c.resume(); }, { once: true });
    try { const s = localStorage.getItem('dream-sim-sound'); if (s !== null) enabled = s === 'true'; } catch(e) {}
  }
  function save() { try { localStorage.setItem('dream-sim-sound', enabled); } catch(e) {} }

  return { send, receive, typing, click, toggle, isEnabled, init, save };
})();
Sound.init();
