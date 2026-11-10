import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { animate, useMotionValue, useReducedMotion } from 'motion/react';
import BgmControl from './components/BgmControl.jsx';
import Calendar from './components/Calendar.jsx';
import SideNav from './components/SideNav.jsx';
import Stage from './components/Stage.jsx';
import Intro, { shouldPlayIntro } from './components/Intro.jsx';
import { Shatter } from './components/Tarot.jsx';
import { EvokeCrack, EvokerButton, SummonGuardian, SummonLabel } from './components/Evoker.jsx';
import { guardians, parseHash, sectionIndex, sections } from './data/sections.js';
import { STEP, mod } from './lib/ring.js';
import { DarkHourContext } from './lib/darkHour.js';
import { buzz, sfx } from './lib/sfx.js';
import { ARCANA_IDS, bond, notice, useBond } from './lib/bond.js';
import { FESTIVAL_NAMES, homeCycle, useWorld } from './lib/sky.js';
import { drawFavicon } from './lib/tab.js';
import { updateAmbient } from './lib/ambient.js';
import { tr, useLang } from './lib/i18n.js';
import Guide from './components/Guide.jsx';
import Meteors from './components/Meteors.jsx';
import TrainArrive from './components/TrainArrive.jsx';
import Cursor from './components/Cursor.jsx';
import { installMagnet } from './lib/magnet.js';
import BondRecord from './components/BondRecord.jsx';
import VelvetRoom from './components/VelvetRoom.jsx';
import Dream from './components/Dream.jsx';
import { Notice, RankUp } from './components/BondToasts.jsx';

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
  const [touring, setTouring] = useState(false);
  const [record, setRecord] = useState(false);
  const [photo, setPhoto] = useState(false);
  const [train, setTrain] = useState(null);
  const prevSection = useRef(route.section);
  const endTrain = useCallback(() => setTrain(null), []);
  const lang = useLang();
  const touringRef = useRef(false);

  /* 召唤：裂纹 → 卡牌碎裂 → 人格面具浮现并显示标签，数秒后退场（影时间里会一直留着） */
  const [summonWho, setSummonWho] = useState(null);
  const onEvoke = () => {
    if (summoned) return;
    /* 召唤当前页的守护灵；首页合成过零时钟匠后召唤它；影时间里仍是 HOROLOGIUM */
    const sec = parseHash(window.location.hash).section;
    const fused = (() => {
      try {
        return JSON.parse(window.localStorage.getItem('tiaotiao.bond.v1') || '{}').done?.includes('fusion');
      } catch {
        return false;
      }
    })();
    setSummonWho(dark ? null : sec === 'home' && fused ? 'world' : sec);
    sfx('shatter');
    buzz([40, 30, 90]);
    setEvoke((n) => n + 1);
    if (!reduce) setSummonCard((n) => n + 1);
    setSummoned(true);
    bond('summon');
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
          buzz(120);
          bond('darkHour');
          if (!reduce) setSummonCard((n) => n + 1);
        });
      },
      enterNow: () => {
        setDark(true);
        setFlash((n) => n + 1);
        sfx('darkHour');
        buzz(120);
        bond('darkHour');
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

  /* 真实的午夜 0 点：自动进入影时间，一分多钟后自行退去（手动进入的不受影响） */
  const world = useWorld();
  const autoDark = useRef({ day: '', on: false });
  useEffect(() => {
    const d = world.now;
    const key = d.toDateString();
    if (d.getHours() !== 0 || d.getMinutes() !== 0 || autoDark.current.day === key || dark) return undefined;
    autoDark.current = { day: key, on: true };
    darkValue.enterNow();
    return undefined;
  }, [world.now, dark, darkValue]);
  useEffect(() => {
    if (!dark || !autoDark.current.on) return undefined;
    const id = window.setTimeout(() => {
      autoDark.current.on = false;
      darkValue.exit();
    }, 75000);
    return () => window.clearTimeout(id);
  }, [dark, darkValue]);
  useEffect(() => {
    if (!dark) autoDark.current.on = false;
  }, [dark]);

  /* 停在某一页就算"去过" */
  useEffect(() => {
    if (settled !== 'home' && !touringRef.current) bond(`visit:${settled}`);
  }, [settled]);
  const bondState = useBond();
  const velvetOpen = Boolean(route.velvet) && bondState.cards.length >= ARCANA_IDS.length;

  useEffect(() => {
    const onHash = () => {
      userMoved.current = !touringRef.current;
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
    /* 叙事化转场：首页 → 简介是列车进站，简介 → 首页是列车离站，简介 → 项目是走出车门。
       画面被车门挡住的那一刻，背后瞬间切到目标页 */
    const prev = prevSection.current;
    const kind =
      intro !== 'done' ? null
        : prev === 'home' && route.section === 'about' ? 'arrive'
          : prev === 'about' && route.section === 'home' ? 'depart'
            : prev === 'about' && route.section === 'projects' ? 'exit'
              : null;
    if (kind) {
      const SWITCH = { arrive: 1300, depart: 620, exit: 520 };
      setTrain({ n: Date.now(), kind });
      sfx(kind === 'arrive' ? 'train' : kind === 'depart' ? 'trainDepart' : 'doorOpen');
      anim.current?.stop();
      lastNav.current = Date.now() + SWITCH[kind];
      const id = window.setTimeout(() => {
        ring.set(next);
        finish();
      }, SWITCH[kind]);
      return () => window.clearTimeout(id);
    }
    sfx('whoosh');
    anim.current = animate(ring, next, { type: 'spring', visualDuration: 1.1, bounce: 0.04, onComplete: finish });
    lastNav.current = Date.now();
    return undefined;
  }, [route.section, reduce, ring]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    prevSection.current = route.section;
  }, [route.section]);

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
      if (e.pointerType !== 'touch' || e.target.closest?.('a, button, .side-nav, .dream')) return;
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

  /* 自由时间：一段时间没有任何操作，就像 P3 的 FREE TIME 一样自动绕着月亮巡游各页；
     一动鼠标、碰屏幕或按键就停。减少动态效果时不启用。 */
  useEffect(() => {
    if (reduce) return undefined;
    const IDLE = 45000;
    const STEP_MS = 7000;
    let idle = 0;
    let step = 0;
    const start = () => {
      const r = parseHash(window.location.hash);
      /* 开着对话框（初次见面、羁绊记录、天鹅绒房间）或拍照模式时不巡游 */
      if (document.hidden || r.detail || r.velvet || document.querySelector('[role="dialog"], .app[data-photo="true"]')) {
        idle = window.setTimeout(start, IDLE);
        return;
      }
      touringRef.current = true;
      setTouring(true);
      step = window.setInterval(() => {
        /* 巡游不往浏览器历史里塞记录，否则巡游之后"后退"要按很多次 */
        const idx = sectionIndex(parseHash(window.location.hash).section);
        window.history.replaceState(null, '', `#${sections[mod(idx + 1, count)].id}`);
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      }, STEP_MS);
    };
    const wake = () => {
      window.clearTimeout(idle);
      window.clearInterval(step);
      if (touringRef.current) {
        touringRef.current = false;
        setTouring(false);
      }
      idle = window.setTimeout(start, IDLE);
    };
    const evs = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart'];
    evs.forEach((e) => window.addEventListener(e, wake, { passive: true }));
    idle = window.setTimeout(start, IDLE);
    return () => {
      window.clearTimeout(idle);
      window.clearInterval(step);
      evs.forEach((e) => window.removeEventListener(e, wake));
    };
  }, [reduce]);

  /* 键盘彩蛋：直接键入 persona 召唤，键入 memento mori 进入影时间 */
  const eggs = useRef({ onEvoke: null, dark: null });
  eggs.current = { onEvoke, darkValue, dark };
  useEffect(() => {
    let buf = '';
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.length !== 1) return;
      buf = (buf + e.key.toLowerCase()).replace(/[^a-z]/g, '').slice(-16);
      const { onEvoke: evoke, darkValue: dv, dark: isDark } = eggs.current;
      if (buf.endsWith('persona')) {
        buf = '';
        bond('secret');
        evoke();
      } else if (buf.endsWith('mementomori')) {
        buf = '';
        bond('secret');
        if (!isDark) dv.enterNow();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* 节日当天第一次打开时提示一下 */
  useEffect(() => {
    if (world.festival === 'none') return undefined;
    const key = `tiaotiao.fest.${world.festival}.${world.now.toDateString()}`;
    try {
      if (window.sessionStorage.getItem(key)) return undefined;
      window.sessionStorage.setItem(key, '1');
    } catch {
      /* ignore */
    }
    const id = window.setTimeout(() => notice(`${tr('今天是')}${tr(FESTIVAL_NAMES[world.festival])}${tr('。')}`), 2400);
    return () => window.clearTimeout(id);
  }, [world.festival]); // eslint-disable-line react-hooks/exhaustive-deps

  /* 电脑上的磁吸按钮 */
  useEffect(() => installMagnet(), []);

  /* 标签页：图标是今天的月相，离开时标题挽留一下 */
  useEffect(() => {
    drawFavicon(dark ? 0.5 : homeCycle(world.now), dark);
    const base = dark ? `${tr('影时间')} · tiaotiao` : 'tiaotiao';
    document.title = base;
    let back = 0;
    const onVis = () => {
      window.clearTimeout(back);
      if (document.hidden) {
        document.title = tr('……还会回来吗？');
      } else {
        document.title = tr('欢迎回来');
        back = window.setTimeout(() => {
          document.title = base;
        }, 2200);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.clearTimeout(back);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [world.now, dark, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  /* 环境音跟着天气、页面与影时间变化 */
  useEffect(() => {
    updateAmbient({ rain: world.weather === 'rain' && !dark, train: settled === 'about' && !dark, dark });
  }, [world.weather, settled, dark]);

  /* 拍照模式：隐藏所有文字与按钮，只留场景。H 键或蝴蝶菜单进入，点击任意处、Esc 或 H 退出 */
  useEffect(() => {
    const toggle = () => setPhoto((v) => !v);
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'h' || e.key === 'H') toggle();
      else if (e.key === 'Escape') setPhoto(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('tt:photo', toggle);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('tt:photo', toggle);
    };
  }, []);
  useEffect(() => {
    if (!photo) return undefined;
    const off = () => setPhoto(false);
    const id = window.setTimeout(() => window.addEventListener('pointerdown', off, { once: true }), 300);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('pointerdown', off);
    };
  }, [photo]);

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
      <div className="app" data-section={route.section} data-settled={settled === route.section} data-dark-hour={dark} data-intro={intro} data-summon={summoned} data-summon-who={summonWho || 'persona'} data-velvet={velvetOpen} data-sky={world.sky} data-season={world.season} data-lunar={world.lunar} data-touring={touring} data-weather={world.weather} data-festival={world.festival} data-photo={photo} lang={lang === 'en' ? 'en' : 'zh-CN'}>
        <Stage ring={ring} route={route} reduce={reduce} settled={settled === route.section ? settled : null} />
        <SideNav activeId={route.section} />
        <Calendar onRecord={() => setRecord(true)} />
        <div className="top-controls">
          <EvokerButton onEvoke={onEvoke} disabled={summoned} />
          {dark && (
            <button type="button" className="dark-exit" onClick={darkValue.exit}>
              <span>DARK HOUR</span>
              <strong>{tr('离开影时间')}</strong>
            </button>
          )}
          <BgmControl />
        </div>
        {!dark && <Dream />}
        {flash > 0 && <div key={flash} className="dark-flash" aria-hidden="true" />}
        {flash > 0 && !reduce && (
          <div key={`scan-${flash}`} className="dark-scan" aria-hidden="true">
            <span className="dark-scan__band" />
          </div>
        )}
        <Cursor />
        {evoke > 0 && !reduce && <EvokeCrack key={`crack-${evoke}`} />}
        {summoned && summonWho && !reduce && <SummonGuardian key={`g-${evoke}`} guardian={guardians[summonWho]} />}
        {summoned && <SummonLabel key={`label-${evoke}`} guardian={summonWho ? guardians[summonWho] : null} />}
        <p className="visually-hidden" role="status">{summoned ? (summonWho ? `${tr('已召唤守护灵')} ${tr(guardians[summonWho].name)}` : tr('已召唤人格面具 HOROLOGIUM')) : ''}</p>
        {summonCard > 0 && <Shatter key={`card-${summonCard}`} center item={null} onDone={() => setSummonCard(0)} />}
        {intro !== 'done' && <Intro onOpen={() => setIntro('rising')} onDone={() => setIntro('done')} />}
        <p className="visually-hidden" role="status">{dark ? tr('已进入影时间，按 Esc 离开') : ''}</p>
        {touring && (
          <div className="free-time" aria-hidden="true">
            <span className="free-time__en">FREE TIME</span>
            <span className="free-time__zh">{tr('自由时间 · 动一下就会停下')}</span>
          </div>
        )}
        {velvetOpen && <VelvetRoom onRecord={() => setRecord(true)} />}
        {record && <BondRecord onClose={() => setRecord(false)} />}
        {intro === 'done' && <Guide />}
        {intro === 'done' && <Meteors />}
        {train && <TrainArrive key={train.n} kind={train.kind} onDone={endTrain} />}
        {photo && (
          <p className="photo-hint" aria-live="polite">
            {tr('拍照模式 · 点击任意处退出')}
          </p>
        )}
        <Notice />
        <RankUp />
      </div>
    </DarkHourContext.Provider>
  );
}
