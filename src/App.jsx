import { useEffect, useMemo, useRef, useState } from 'react';
import { animate, useMotionValue, useReducedMotion } from 'motion/react';
import BgmControl from './components/BgmControl.jsx';
import Calendar from './components/Calendar.jsx';
import SideNav from './components/SideNav.jsx';
import Stage from './components/Stage.jsx';
import Intro, { shouldPlayIntro } from './components/Intro.jsx';
import { Shatter } from './components/Tarot.jsx';
import { EvokeCrack, EvokerButton, SummonLabel } from './components/Evoker.jsx';
import { parseHash, sectionIndex, sections } from './data/sections.js';
import { STEP, mod } from './lib/ring.js';
import { DarkHourContext } from './lib/darkHour.js';
import { sfx } from './lib/sfx.js';

const count = sections.length;

export default function App() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  const reduce = useReducedMotion();
  const initial = sectionIndex(route.section) * STEP;
  const ring = useMotionValue(initial);
  const target = useRef(initial);
  const userMoved = useRef(false);
  const anim = useRef(null);
  const lastNav = useRef(0);
  const [settled, setSettled] = useState(route.section);
  const [dark, setDark] = useState(false);
  const [intro, setIntro] = useState(() => (shouldPlayIntro(reduce, route.section) ? 'playing' : 'done'));
  const [flash, setFlash] = useState(0);
  const [summonCard, setSummonCard] = useState(0);
  const [evoke, setEvoke] = useState(0);
  const [summoned, setSummoned] = useState(false);
  const evokeTimer = useRef(0);

  /* 召唤：裂纹 → 卡牌碎裂 → 人格面具浮现并显示标签，数秒后退场（影时间里会一直留着） */
  const onEvoke = () => {
    if (summoned) return;
    sfx('shatter');
    setEvoke((n) => n + 1);
    if (!reduce) setSummonCard((n) => n + 1);
    setSummoned(true);
    window.clearTimeout(evokeTimer.current);
    evokeTimer.current = window.setTimeout(() => setSummoned(false), 5200);
  };
  useEffect(() => () => window.clearTimeout(evokeTimer.current), []);
  const spinRef = useRef(null);
  const darkValue = useMemo(
    () => ({
      active: dark,
      spinRef,
      enter: () => {
        if (dark || !spinRef.current) return;
        spinRef.current(reduce, () => {
          setDark(true);
          setFlash((n) => n + 1);
          sfx('darkHour');
          if (!reduce) setSummonCard((n) => n + 1);
        });
      },
      enterNow: () => {
        setDark(true);
        setFlash((n) => n + 1);
        sfx('darkHour');
        if (!reduce) setSummonCard((n) => n + 1);
      },
      exit: () => {
        setDark(false);
        spinRef.reset?.();
      },
    }),
    [dark, reduce],
  );

  useEffect(() => {
    if (!dark) return undefined;
    const onKey = (e) => e.key === 'Escape' && darkValue.exit();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dark, darkValue]);

  useEffect(() => {
    const onHash = () => {
      userMoved.current = true;
      setRoute(parseHash(window.location.hash));
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  /* 转向目标栏目：从最近一次目标出发取最短方向；连续点击时直接改写目标，
     动画值从当前位置平滑转向，不排队。 */
  useEffect(() => {
    const idx = sectionIndex(route.section);
    const from = mod(Math.round(target.current / STEP), count);
    let delta = mod(idx - from, count);
    if (delta > count / 2) delta -= count;
    const next = target.current + delta * STEP;
    target.current = next;

    const finish = () => {
      if (target.current !== next) return;
      setSettled(route.section);
      if (userMoved.current) {
        document.getElementById(`heading-${route.section}`)?.focus({ preventScroll: true });
      }
    };

    if (delta === 0 && Math.abs(ring.get() - next) < 0.01) {
      finish();
      return;
    }
    if (reduce) {
      ring.set(next);
      finish();
      return;
    }
    sfx('whoosh');
    anim.current = animate(ring, next, { type: 'spring', visualDuration: 1.1, bounce: 0.04, onComplete: finish });
    lastNav.current = Date.now();
  }, [route.section, reduce, ring]);

  /* 滚轮 / 触控板：正文还能滚动时让给正文，否则切换到相邻栏目 */
  useEffect(() => {
    const go = (dir) => {
      const idx = sectionIndex(parseHash(window.location.hash).section);
      window.location.hash = sections[mod(idx + dir, count)].id;
    };
    let acc = 0;
    let accAt = 0;
    const onWheel = (e) => {
      if (e.ctrlKey || Date.now() - lastNav.current < 1100) return;
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const sc = e.target.closest?.('.scroller, .pg-detail');
      if (sc && Math.abs(e.deltaY) >= Math.abs(e.deltaX)) {
        const canDown = sc.scrollTop + sc.clientHeight < sc.scrollHeight - 1;
        const canUp = sc.scrollTop > 0;
        if ((d > 0 && canDown) || (d < 0 && canUp)) return;
      }
      if (e.timeStamp - accAt > 250) acc = 0;
      accAt = e.timeStamp;
      acc += d;
      if (Math.abs(acc) > 70) {
        const dir = Math.sign(acc);
        acc = 0;
        lastNav.current = Date.now();
        go(dir);
      }
    };

    /* 触屏：横向拖动时画面跟着手指转，松手超过阈值就转到相邻栏目，否则弹回 */
    let start = null;
    const onDown = (e) => {
      if (e.pointerType !== 'touch' || e.target.closest?.('a, button, .side-nav')) return;
      start = { x: e.clientX, y: e.clientY, base: target.current, dragging: false };
    };
    const onMove = (e) => {
      if (!start || e.pointerType !== 'touch') return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (!start.dragging) {
        if (Math.abs(dx) < 12 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
        start.dragging = true;
        anim.current?.stop();
      }
      ring.set(start.base - (dx / window.innerWidth) * STEP * 0.9);
    };
    const onUp = (e) => {
      if (!start) return;
      const s0 = start;
      start = null;
      if (!s0.dragging) return;
      const dx = e.clientX - s0.x;
      if (Math.abs(dx) > window.innerWidth * 0.16) {
        go(dx < 0 ? 1 : -1);
      } else {
        anim.current = animate(ring, target.current, { type: 'spring', visualDuration: 0.5, bounce: 0.1 });
      }
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [ring]);

  /* 左右方向键切换相邻栏目 */
  useEffect(() => {
    const onKey = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return;
      const idx = sectionIndex(parseHash(window.location.hash).section);
      const next = sections[mod(idx + (e.key === 'ArrowRight' ? 1 : -1), count)];
      window.location.hash = next.id;
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <DarkHourContext.Provider value={darkValue}>
      <div className="app" data-section={route.section} data-settled={settled === route.section} data-dark-hour={dark} data-intro={intro} data-summon={summoned}>
        <Stage ring={ring} route={route} reduce={reduce} settled={settled === route.section ? settled : null} />
        <SideNav activeId={route.section} />
        <Calendar />
        <div className="top-controls">
          <EvokerButton onEvoke={onEvoke} disabled={summoned} />
          {dark && (
            <button type="button" className="dark-exit" onClick={darkValue.exit}>
              <span>DARK HOUR</span>
              <strong>离开影时间</strong>
            </button>
          )}
          <BgmControl />
        </div>
        {flash > 0 && <div key={flash} className="dark-flash" aria-hidden="true" />}
        {evoke > 0 && !reduce && <EvokeCrack key={`crack-${evoke}`} />}
        {summoned && <SummonLabel key={`label-${evoke}`} />}
        <p className="visually-hidden" role="status">{summoned ? '已召唤人格面具 HOROLOGIUM' : ''}</p>
        {summonCard > 0 && <Shatter key={`card-${summonCard}`} center item={null} onDone={() => setSummonCard(0)} />}
        {intro !== 'done' && <Intro onOpen={() => setIntro('rising')} onDone={() => setIntro('done')} />}
        <p className="visually-hidden" role="status">{dark ? '已进入影时间，按 Esc 离开' : ''}</p>
      </div>
    </DarkHourContext.Provider>
  );
}
