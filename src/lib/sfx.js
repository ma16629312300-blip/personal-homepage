/* 菜单音效：用 Web Audio 实时合成，不需要音频文件。
   默认关闭，只有用户打开背景音乐后才会发声。 */
let ctx = null;
let enabled = false;
let lastHover = 0;

function audio() {
  if (!enabled) return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function setSfxEnabled(v) {
  enabled = v;
}

function tone(a, { type = 'sine', from, to = from, dur = 0.12, gain = 0.05, delay = 0 }) {
  const t = a.currentTime + delay;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(from, t);
  o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(a, { dur = 0.5, from = 400, to = 2400, q = 1.2, gain = 0.06, type = 'bandpass', delay = 0 }) {
  const t = a.currentTime + delay;
  const len = Math.floor(a.sampleRate * dur);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  src.buffer = buf;
  const f = a.createBiquadFilter();
  f.type = type;
  f.Q.value = q;
  f.frequency.setValueAtTime(from, t);
  f.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + dur * 0.25);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(a.destination);
  src.start(t);
  src.stop(t + dur + 0.02);
}

const SOUNDS = {
  /* 光标移过菜单：一声很轻的高音 */
  hover(a) {
    tone(a, { type: 'triangle', from: 2200, to: 1900, dur: 0.05, gain: 0.025 });
  },
  /* 对话逐字：很轻的短促音 */
  text(a) {
    tone(a, { type: 'square', from: 1200 + Math.random() * 120, dur: 0.025, gain: 0.012 });
  },
  /* 确认：两声上行的钟音 */
  select(a) {
    tone(a, { type: 'sine', from: 880, dur: 0.12, gain: 0.05 });
    tone(a, { type: 'sine', from: 1320, dur: 0.18, gain: 0.045, delay: 0.07 });
  },
  /* 转场：水流扫过加几颗气泡 */
  whoosh(a) {
    noise(a, { dur: 0.7, from: 300, to: 1800, q: 0.9, gain: 0.05 });
    for (let i = 0; i < 4; i += 1) {
      const f = 500 + Math.random() * 700;
      tone(a, { type: 'sine', from: f, to: f * 1.8, dur: 0.07, gain: 0.03, delay: 0.15 + i * 0.09 + Math.random() * 0.05 });
    }
  },
  /* 召唤与卡牌碎裂：玻璃碎响加一声低沉的轰鸣 */
  shatter(a) {
    noise(a, { dur: 0.45, from: 6000, to: 2500, q: 0.6, gain: 0.09, type: 'highpass' });
    for (let i = 0; i < 6; i += 1) {
      const f = 2400 + Math.random() * 3200;
      tone(a, { type: 'triangle', from: f, to: f * 0.92, dur: 0.12, gain: 0.025, delay: 0.03 + Math.random() * 0.25 });
    }
    tone(a, { type: 'sine', from: 90, to: 42, dur: 0.9, gain: 0.12, delay: 0.05 });
  },
  /* 影时间：一记钟响后接持续的低鸣 */
  darkHour(a) {
    tone(a, { type: 'sine', from: 196, to: 194, dur: 2.4, gain: 0.08 });
    tone(a, { type: 'sine', from: 392, to: 390, dur: 1.6, gain: 0.04 });
    tone(a, { type: 'sawtooth', from: 55, to: 52, dur: 3.2, gain: 0.02, delay: 0.3 });
  },
};

export function sfx(name) {
  if (name === 'hover') {
    const now = performance.now();
    if (now - lastHover < 60) return;
    lastHover = now;
  }
  const a = audio();
  if (a && SOUNDS[name]) SOUNDS[name](a);
}
