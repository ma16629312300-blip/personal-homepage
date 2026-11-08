import { useEffect, useState } from 'react';

/* 开场：漆黑中一条地平线从中间划开，上下两半像眼睑一样打开，月亮从海里升起。
   每次会话只播一次，可点击或按任意键跳过。 */
const KEY = 'tiaotiao-intro-seen';

export function shouldPlayIntro(reduce, section) {
  if (reduce || section !== 'home') return false;
  try {
    return window.sessionStorage.getItem(KEY) !== '1';
  } catch {
    return true;
  }
}

export default function Intro({ onOpen, onDone }) {
  const [phase, setPhase] = useState('line');

  useEffect(() => {
    try {
      window.sessionStorage.setItem(KEY, '1');
    } catch {
      /* 存储不可用时照常播放 */
    }
    const t1 = window.setTimeout(() => {
      setPhase('open');
      onOpen();
    }, 1100);
    const t2 = window.setTimeout(onDone, 2200);
    const skip = () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      onOpen();
      onDone();
    };
    window.addEventListener('keydown', skip, { once: true });
    window.addEventListener('pointerdown', skip, { once: true });
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="intro" data-phase={phase} aria-hidden="true">
      <div className="intro__lid intro__lid--top" />
      <div className="intro__lid intro__lid--bottom" />
      <span className="intro__line" />
      <span className="intro__motto">MEMENTO MORI</span>
    </div>
  );
}
