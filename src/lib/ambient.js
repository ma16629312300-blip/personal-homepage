/* 环境音：全部用 WebAudio 合成，不需要音频文件。
   海浪一直在；下雨加雨声；列车页加车轮声；影时间加低鸣。音量都很轻。 */
let ctx = null;
let nodes = null;
let clack = 0;
let want = { on: false, rain: false, train: false, dark: false };

let cached = null;
function noiseBuffer(a) {
  if (cached) return cached;
  const buf = a.createBuffer(1, a.sampleRate * 2, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i += 1) d[i] = Math.random() * 2 - 1;
  cached = buf;
  return buf;
}

function build() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = ctx || new AC();
  const a = ctx;
  const master = a.createGain();
  master.gain.value = 0;
  master.connect(a.destination);
  const src = a.createBufferSource();
  src.buffer = noiseBuffer(a);
  src.loop = true;
  /* 海浪：低通噪声，音量随慢速 LFO 起伏 */
  const waveF = a.createBiquadFilter();
  waveF.type = 'lowpass';
  waveF.frequency.value = 420;
  const wave = a.createGain();
  wave.gain.value = 0.16;
  const lfo = a.createOscillator();
  lfo.frequency.value = 0.11;
  const lfoAmt = a.createGain();
  lfoAmt.gain.value = 0.12;
  lfo.connect(lfoAmt).connect(wave.gain);
  src.connect(waveF).connect(wave).connect(master);
  /* 雨：高频噪声 */
  const rainF = a.createBiquadFilter();
  rainF.type = 'highpass';
  rainF.frequency.value = 2600;
  const rain = a.createGain();
  rain.gain.value = 0;
  src.connect(rainF).connect(rain).connect(master);
  /* 列车：很低的隆隆声 */
  const rumbleF = a.createBiquadFilter();
  rumbleF.type = 'lowpass';
  rumbleF.frequency.value = 110;
  const rumble = a.createGain();
  rumble.gain.value = 0;
  src.connect(rumbleF).connect(rumble).connect(master);
  /* 影时间：低沉的嗡鸣 */
  const hum = a.createOscillator();
  hum.type = 'sawtooth';
  hum.frequency.value = 55;
  const humF = a.createBiquadFilter();
  humF.type = 'lowpass';
  humF.frequency.value = 160;
  const humG = a.createGain();
  humG.gain.value = 0;
  hum.connect(humF).connect(humG).connect(master);
  src.start();
  lfo.start();
  hum.start();
  return { master, rain, rumble, humG };
}

function apply() {
  if (!nodes) return;
  const t = ctx.currentTime;
  nodes.master.gain.setTargetAtTime(want.on ? 0.5 : 0, t, 0.6);
  nodes.rain.gain.setTargetAtTime(want.rain ? 0.05 : 0, t, 0.8);
  nodes.rumble.gain.setTargetAtTime(want.train ? 0.5 : 0, t, 0.8);
  nodes.humG.gain.setTargetAtTime(want.dark ? 0.03 : 0, t, 1);
  window.clearInterval(clack);
  if (want.on && want.train) {
    /* 车轮压过铁轨接缝的"咔哒、咔哒" */
    clack = window.setInterval(() => {
      if (!ctx || document.hidden) return;
      [0, 0.16].forEach((dt) => {
        const s = ctx.createBufferSource();
        s.buffer = noiseBuffer(ctx);
        const f = ctx.createBiquadFilter();
        f.type = 'bandpass';
        f.frequency.value = 900;
        const g = ctx.createGain();
        const at = ctx.currentTime + dt;
        g.gain.setValueAtTime(0.0001, at);
        g.gain.exponentialRampToValueAtTime(0.09, at + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, at + 0.09);
        s.connect(f).connect(g).connect(nodes.master);
        s.start(at);
        s.stop(at + 0.12);
      });
    }, 1300);
  }
}

/* 只能在用户点击之后开启（浏览器的自动播放限制） */
export function setAmbient(on) {
  want.on = on;
  if (on && !nodes) nodes = build();
  if (ctx?.state === 'suspended') ctx.resume();
  apply();
}
export function updateAmbient(patch) {
  want = { ...want, ...patch };
  apply();
}
export const ambientOn = () => want.on;
