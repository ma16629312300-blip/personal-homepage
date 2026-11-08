import { useRef, useState } from 'react';
import { setSfxEnabled } from '../lib/sfx.js';
import { connectPulse, setPulsePlaying } from '../lib/pulse.js';

const bgmSrc = `${import.meta.env.BASE_URL}audio/color-your-night.mp3`;

export default function BgmControl() {
  const audioRef = useRef(null);
  const [enabled, setEnabled] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

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
      audio.volume = 0.34;
      connectPulse(audio);
      await audio.play();
      setEnabled(true);
      setSfxEnabled(true);
      setPulsePlaying(true);
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
      <audio ref={audioRef} src={bgmSrc} loop preload="none" onError={() => setUnavailable(true)} />
      <button
        type="button"
        className="bgm-control__button"
        aria-pressed={enabled}
        aria-label={enabled ? '静音背景音乐' : '播放背景音乐'}
        disabled={unavailable}
        onClick={toggleBgm}
      >
        <span>BGM</span>
        <strong>{unavailable ? '不可用' : enabled ? 'ON' : 'OFF'}</strong>
      </button>
    </div>
  );
}
