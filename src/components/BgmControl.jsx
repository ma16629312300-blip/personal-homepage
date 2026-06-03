import { useRef, useState } from 'react';

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
        return;
      }

      audio.muted = false;
      audio.volume = 0.34;
      await audio.play();
      setEnabled(true);
    } catch {
      setUnavailable(true);
      setEnabled(false);
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
        <strong>{unavailable ? '待添加' : enabled ? 'ON' : 'OFF'}</strong>
      </button>
    </div>
  );
}
