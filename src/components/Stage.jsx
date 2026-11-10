import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useVelocity } from 'motion/react';
import { images, sections } from '../data/sections.js';
import { STEP, geom, mod, orbit, panelOpacity, updateGeom, wrap180 } from '../lib/ring.js';
import { useDarkHour } from '../lib/darkHour.js';
import MoonClock from './MoonClock.jsx';
import Sea from './Sea.jsx';
import Butterfly from './Butterfly.jsx';
import { WeatherFront } from './Weather.jsx';
import BubbleBurst from './BubbleBurst.jsx';
import Petals from './Petals.jsx';
import { SCENES, SakuraBranch } from './Scenes.jsx';
import { PanelContent } from './Panels.jsx';

/* 每个栏目的分层：深度 d、自转比例 spin、指针位移 par、指针倾斜 tilt。
   正文层不受指针影响，停下后保持正向清晰。 */
const LAYERS = {
  plane: { d: -180, spin: 0.9, par: -8, tilt: 1 },
  word: { d: 320, spin: 0.45, par: 22, tilt: 1.2 },
  scene: { d: 60, spin: 0.75, par: 9, tilt: 1.3 },
  figure: { d: 90, spin: 0.7, par: 12, tilt: 1.4 },
  blade: { d: 200, spin: 0.85, par: 16, tilt: 1.2 },
  body: { d: 0, spin: 0.5, par: 0, tilt: 0 },
};

function useLayer(rel, px, py, name) {
  const { d, spin, par, tilt } = LAYERS[name];
  return useTransform([rel, px, py], ([r, x, y]) => {
    /* 手机：陀螺仪视差只作用在停稳的当前页，转场途中和其他页保持静态，省掉大量每帧计算 */
    if (geom.mobile) {
      if (Math.abs(r) > 0.5) return orbit(r, d, spin);
      return orbit(r, d, spin, x * par * 0.7, y * par * 0.35, x * 1.4 * tilt, -y * 0.9 * tilt);
    }
    return orbit(r, d, spin, x * par, y * par * 0.5, x * 2.4 * tilt, -y * 1.6 * tilt);
  });
}

function Panel({ section, index, ring, px, py, active, route, reduce, blur, load, personaReady }) {
  const ref = useRef(null);
  const rel = useTransform(ring, (a) => wrap180(index * STEP - a));
  const opacity = useTransform(rel, panelOpacity);
  const visibility = useTransform(rel, (r) => (Math.abs(r) > 56 ? 'hidden' : 'visible'));
  const plane = useLayer(rel, px, py, 'plane');
  const word = useLayer(rel, px, py, 'word');
  const scene = useLayer(rel, px, py, 'scene');
  const figure = useLayer(rel, px, py, 'figure');
  const blade = useLayer(rel, px, py, 'blade');
  const body = useLayer(rel, px, py, 'body');

  useEffect(() => {
    if (ref.current) ref.current.inert = !active;
  }, [active]);

  const s = (mv, blurred) => (reduce ? undefined : blurred ? { transform: mv, filter: blur } : { transform: mv });
  const Scene = SCENES[section.id];

  return (
    <motion.section
      ref={ref}
      className={`panel panel--${section.id}`}
      data-active={active}
      aria-hidden={!active}
      aria-labelledby={`heading-${section.id}`}
      style={reduce ? undefined : { opacity, visibility }}
    >
      <motion.div className="layer layer--plane" style={s(plane)} aria-hidden="true">
        <span className="plane plane-a" />
        <span className="plane plane-b" />
      </motion.div>
      <motion.div className="layer layer--word" style={s(word, true)} aria-hidden="true">
        <span className="word">{section.id === 'home' ? 'tiaotiao' : section.label}</span>
      </motion.div>
      {load && section.school && (
        <motion.div className="layer layer--branch" style={s(word)} aria-hidden="true">
          <SakuraBranch />
        </motion.div>
      )}
      {load && Scene && (
        <motion.div className="layer layer--scene" style={s(scene)} aria-hidden="true">
          <Scene figure={section.character.src} carriage={images.carriage} school={images.schoolSeasons} persona={personaReady ? images.persona : null} />
        </motion.div>
      )}
      {load && !section.inScene && (
        <motion.div className="layer layer--figure" style={s(figure)} aria-hidden="true">
          <picture>
            <source media="(max-width: 760px), (max-width: 1100px) and (orientation: portrait)" srcSet={section.character.mobile} />
            <img className="figure" src={section.character.src} alt="" decoding="async" draggable="false" />
          </picture>
        </motion.div>
      )}
      <motion.div className="layer layer--blade" style={s(blade)} aria-hidden="true">
        <span className="blade" />
      </motion.div>
      <motion.div className="layer layer--body" style={s(body)}>
        <PanelContent section={section} route={route} active={active} />
      </motion.div>
    </motion.section>
  );
}

/* 只加载当前栏目与左右相邻栏目的图片；页面空闲后再把其余的补上 */
const near = (id) => {
  const i = sections.findIndex((s) => s.id === id);
  const n = sections.length;
  return [i, (i + 1) % n, (i + n - 1) % n];
};

export default function Stage({ ring, route, reduce, settled }) {
  const [loaded, setLoaded] = useState(() => new Set(near(route.section)));
  const [idleTimer, setIdle] = useState(false);
  const dark = useDarkHour();
  const idle = idleTimer || dark.active;
  useEffect(() => {
    setLoaded((prev) => {
      const next = new Set(prev);
      near(route.section).forEach((i) => next.add(i));
      return next.size === prev.size ? prev : next;
    });
  }, [route.section]);
  useEffect(() => {
    const id = window.setTimeout(() => {
      setIdle(true);
      setLoaded(new Set(sections.map((_, i) => i)));
    }, 2000);
    return () => window.clearTimeout(id);
  }, []);
  /* 镜头：转向途中画面轻微侧倾并拉远，停下时回正；转得越快，人物与大字越模糊 */
  const velocity = useVelocity(ring);
  const blur = useTransform(velocity, (v) => {
    /* 手机上不做动态模糊：大图实时模糊是转场卡顿的主要来源 */
    if (geom.mobile) return 'none';
    const b = Math.min(3.2, Math.abs(v) / 70);
    return b < 0.15 ? 'none' : `blur(${b.toFixed(2)}px)`;
  });
  const camera = useTransform([ring, velocity], ([a, v]) => {
    const r = mod(a, STEP) / STEP;
    const p = Math.sin(Math.PI * r);
    if (p < 0.002) return 'none';
    const dir = v === 0 ? 1 : Math.sign(v);
    const k = geom.mobile ? 0.5 : 1;
    return `scale(${(1 - 0.045 * p * k).toFixed(4)}) rotate(${(dir * 1.1 * p * k).toFixed(3)}deg)`;
  });
  const glitter = useRef(null);
  const onGeometry = useCallback((cx) => {
    /* 用 transform 移动碎光带，不改 left，避免每帧重新排版 60 段碎光 */
    if (glitter.current) glitter.current.style.transform = `translate3d(${cx.toFixed(1)}px, 0, 0)`;
  }, []);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const px = useSpring(pointerX, { stiffness: 50, damping: 18, mass: 0.6 });
  const py = useSpring(pointerY, { stiffness: 50, damping: 18, mass: 0.6 });

  useEffect(() => {
    updateGeom();
    const onResize = () => {
      updateGeom();
      ring.set(ring.get() + 0.0001);
      ring.set(ring.get() - 0.0001);
    };
    const fine = window.matchMedia('(pointer: fine)');
    const onMove = (e) => {
      if (!fine.matches || reduce) return;
      pointerX.set((e.clientX / window.innerWidth - 0.5) * 2);
      pointerY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    const onLeave = () => {
      pointerX.set(0);
      pointerY.set(0);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, [ring, reduce, pointerX, pointerY]);

  /* 手机陀螺仪：倾斜手机时画面层次跟着微动。基准角度会慢慢跟上手机的握持姿势，
     所以怎么拿都行。iOS 需要访客点一下屏幕后授权。 */
  useEffect(() => {
    const DOE = window.DeviceOrientationEvent;
    if (reduce || !DOE || window.matchMedia('(pointer: fine)').matches) return undefined;
    const clamp = (v) => Math.max(-1, Math.min(1, v));
    let base = null;
    const onOri = (e) => {
      if (e.gamma == null || e.beta == null) return;
      const angle = window.screen?.orientation?.angle ?? 0;
      let gx = e.gamma;
      let gy = e.beta;
      if (angle === 90) [gx, gy] = [e.beta, -e.gamma];
      else if (angle === 270 || angle === -90) [gx, gy] = [-e.beta, e.gamma];
      if (!base) base = { x: gx, y: gy };
      base.x += (gx - base.x) * 0.004;
      base.y += (gy - base.y) * 0.004;
      const nx = clamp((gx - base.x) / 16);
      const ny = clamp((gy - base.y) / 16);
      /* 很小的抖动不更新，避免手机静止时也每帧重算 */
      if (Math.abs(nx - pointerX.get()) > 0.015) pointerX.set(nx);
      if (Math.abs(ny - pointerY.get()) > 0.015) pointerY.set(ny);
    };
    const attach = () => window.addEventListener('deviceorientation', onOri);
    let ask = null;
    if (typeof DOE.requestPermission === 'function') {
      ask = () => {
        DOE.requestPermission()
          .then((r) => r === 'granted' && attach())
          .catch(() => {});
      };
      window.addEventListener('touchend', ask, { once: true });
    } else {
      attach();
    }
    return () => {
      if (ask) window.removeEventListener('touchend', ask);
      window.removeEventListener('deviceorientation', onOri);
    };
  }, [reduce, pointerX, pointerY]);

  return (
    <main className="stage" style={{ '--grain': `url(${images.grain})` }}>
      <motion.div className="camera" style={reduce ? undefined : { transform: camera }}>
      <Sea ring={ring} tartarus={idle ? images.tartarus : null} skyline={images.skyline} persona={idle ? images.persona : null} reduce={reduce} ref={glitter} />
      <MoonClock ring={ring} settled={settled} reduce={reduce} onGeometry={onGeometry} />
      {!reduce && <Petals />}
      {sections.map((section, index) => (
        <Panel
          key={section.id}
          section={section}
          index={index}
          ring={ring}
          px={px}
          py={py}
          active={section.id === route.section}
          route={route}
          reduce={reduce}
          blur={blur}
          load={loaded.has(index)}
          personaReady={idle}
        />
      ))}
      </motion.div>
      <BubbleBurst route={route.section} reduce={reduce} />
      <Butterfly settled={settled} reduce={reduce} />
      <WeatherFront reduce={reduce} />
      <div className="stage__grain" aria-hidden="true" />
    </main>
  );
}
