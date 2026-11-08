import { useEffect, useRef, useState } from 'react';
import { tr } from '../lib/i18n.js';
import { bgmTracks } from '../data/sections.js';
import { useWorld } from '../lib/sky.js';
import { useDarkHour } from '../lib/darkHour.js';
import { setSfxEnabled } from '../lib/sfx.js';
import { connectPulse, setPulsePlaying } from '../lib/pulse.js';
import { bond } from '../lib/bond.js';

const trackUrl = (name) => `${import.meta.env.BASE_URL}audio/${name}`;
const VOLUME = 0.34;

/* 音量渐变：换曲时先淡出再淡入 */
function fade(audio, to, ms, done) {
  const from = audio.volume;
  const start = performance.now();
  const id = window.setInterval(() => {
    const k = Math.min(1, (performance.now() - start) / ms);
    audio.volume = from + (to - from) * k;
    if (k >= 1) {
      window.clearInterval(id);
      done?.();
    }
  }, 30);
  return () => window.clearInterval(id);
}

export default function BgmControl() {
  const audioRef = useRef(null);
  const [enabled, setEnabled] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const { sky } = useWorld();
  const dark = useDarkHour();
  const want = trackUrl((dark.active ? bgmTracks.darkHour : bgmTracks[sky]) || bgmTracks.night);
  const [src, setSrc] = useState(want);

  /* 时段或影时间变化时换曲：播放中就淡出、换曲、再淡入 */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || want === src) return undefined;
    if (!enabled) {
      setSrc(want);
      return undefined;
    }
    return fade(audio, 0, 700, () => setSrc(want));
  }, [want, src, enabled]);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !enabled || !audio.paused) return undefined;
    audio.volume = 0;
    audio.play().catch(() => {});
    return fade(audio, VOLUME, 900);
  }, [src]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleBgm = async () => {
    const audio = audioRef.current;
    if (!audio || unavailable) return;

    try {
      if (enabled) {
        audio.muted = true;
        audio.pause();
        setEnabled(false);
        setSfxEnabled(false);
        setPulsePlaying(false);
        return;
      }

      audio.muted = false;
      audio.volume = VOLUME;
      connectPulse(audio);
      await audio.play();
      setEnabled(true);
      setSfxEnabled(true);
      setPulsePlaying(true);
      bond('bgm');
    } catch (error) {
      /* 浏览器拦截自动播放时只是没播成，不代表音乐坏了，下次点击还能再试 */
      if (error?.name !== 'NotAllowedError' && error?.name !== 'AbortError') setUnavailable(true);
      setEnabled(false);
      setSfxEnabled(false);
      setPulsePlaying(false);
    }
  };

  return (
    <div className="bgm-control">
      <audio ref={audioRef} src={src} loop preload="none" onError={() => setUnavailable(true)} />
      <button
        type="button"
        className="bgm-control__button"
        aria-pressed={enabled}
        aria-label={tr(enabled ? '静音背景音乐' : '播放背景音乐')}
        disabled={unavailable}
        onClick={toggleBgm}
      >
        <span>BGM</span>
        <strong>{unavailable ? tr('不可用') : enabled ? 'ON' : 'OFF'}</strong>
      </button>
    </div>
  );
}
