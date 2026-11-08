/* 音乐脉动：BGM 播放时分析音频，把低频与整体响度写成 CSS 变量 --pulse-bass / --pulse-level（0–1），
   并在检测到鼓点时通知订阅者。不播放时数值平滑衰减到 0。 */
let ctx = null;
let analyser = null;
let data = null;
let raf = 0;
let playing = false;
let bass = 0;
let level = 0;
let avg = 0.2;
let lastBeat = 0;
let prevRaw = 0;
const beatListeners = new Set();

export function onBeat(fn) {
  beatListeners.add(fn);
  return () => beatListeners.delete(fn);
}

/* 写入的是相对变化：低频超出近期平均越多，数值越大，这样安静段落和鼓点的对比更明显 */
const clamp = (v) => Math.min(1, Math.max(0, v));
function write() {
  const root = document.documentElement.style;
  root.setProperty('--pulse-bass', clamp((bass - avg) * 3.2 + bass * 0.25).toFixed(3));
  root.setProperty('--pulse-level', clamp(level).toFixed(3));
}

function loop(now) {
  if (analyser && playing) {
    analyser.getByteFrequencyData(data);
    let b = 0;
    for (let i = 1; i <= 6; i += 1) b += data[i];
    b = b / (6 * 255);
    let l = 0;
    for (let i = 0; i < data.length; i += 1) l += data[i];
    l = l / (data.length * 255);
    bass += (b - bass) * 0.35;
    level += (l * 1.6 - level) * 0.15;
    avg += (bass - avg) * 0.02;
    /* 鼓点：低频瞬间跳升，且高于近期平均 */
    const jump = b - prevRaw;
    prevRaw = b;
    if (jump > 0.07 && b > 0.35 && b > avg * 1.08 && now - lastBeat > 280) {
      lastBeat = now;
      beatListeners.forEach((fn) => fn(bass));
    }
  } else {
    bass *= 0.9;
    level *= 0.9;
  }
  write();
  if (playing || bass > 0.005 || level > 0.005) {
    raf = requestAnimationFrame(loop);
  } else {
    bass = 0;
    level = 0;
    write();
    raf = 0;
  }
}

/* 在用户点击开启音乐时调用（需要用户手势才能创建音频上下文） */
export function connectPulse(audio) {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  try {
    if (!ctx) {
      ctx = new AC();
      const src = ctx.createMediaElementSource(audio);
      analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.6;
      data = new Uint8Array(analyser.frequencyBinCount);
      src.connect(analyser);
      analyser.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
  } catch {
    analyser = null;
  }
}

export function setPulsePlaying(v) {
  playing = v;
  if (!raf) raf = requestAnimationFrame(loop);
}
