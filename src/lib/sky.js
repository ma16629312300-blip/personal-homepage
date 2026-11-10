import { useSyncExternalStore } from 'react';
import { moonCycle } from './moon.js';

/* 真实世界的时间：时段决定天空颜色，月份决定季节，月相决定满月 / 新月夜。
   预览用：网址后面加 ?sky=day|dawn|dusk|night、?season=spring|summer|autumn|winter、?moon=full|new 可以强制指定。 */
const params = (() => {
  try {
    return new URLSearchParams(window.location.search);
  } catch {
    return new URLSearchParams();
  }
})();
const pick = (key, allowed) => (allowed.includes(params.get(key)) ? params.get(key) : null);
const FORCE = {
  sky: pick('sky', ['dawn', 'day', 'dusk', 'night']),
  season: pick('season', ['spring', 'summer', 'autumn', 'winter']),
  moon: pick('moon', ['full', 'new', 'none']),
  weather: pick('weather', ['clear', 'rain', 'fog']),
  festival: pick('festival', ['newyear', 'springfest', 'midautumn', 'qixi', 'christmas']),
};

export function skyOfHour(t) {
  if (t >= 5 && t < 7) return 'dawn';
  if (t >= 7 && t < 16) return 'day';
  if (t >= 16 && t < 18.5) return 'dusk';
  return 'night';
}
export function skyOf(date) {
  const t = date.getHours() + date.getMinutes() / 60;
  if (t >= 5 && t < 7) return 'dawn';
  if (t >= 7 && t < 16) return 'day';
  if (t >= 16 && t < 18.5) return 'dusk';
  return 'night';
}

export function seasonOf(date) {
  const m = date.getMonth() + 1;
  if (m >= 3 && m <= 5) return 'spring';
  if (m >= 6 && m <= 8) return 'summer';
  if (m >= 9 && m <= 11) return 'autumn';
  return 'winter';
}

/* 满月 / 新月前后约一天 */
export function lunarOf(date) {
  const p = moonCycle(date);
  if (Math.abs(p - 0.5) < 0.034) return 'full';
  if (p < 0.034 || p > 0.966) return 'new';
  return 'none';
}

/* 天气：按日期固定生成（同一天所有人看到的一样），不需要访客的位置。
   大约六成晴、两成多雨、一成多雾。 */
export function weatherOf(date) {
  let h = 2166136261;
  const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  for (const c of key) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  const r = (h % 1000) / 1000;
  if (r < 0.62) return 'clear';
  if (r < 0.85) return 'rain';
  return 'fog';
}

/* 节日：公历节日直接按日期；春节、中秋、七夕按农历，先列到 2030 年 */
const LUNAR = {
  springfest: { 2026: [2, 17], 2027: [2, 6], 2028: [1, 26], 2029: [2, 13], 2030: [2, 3] },
  midautumn: { 2026: [9, 25], 2027: [9, 15], 2028: [10, 3], 2029: [9, 22], 2030: [9, 12] },
  qixi: { 2026: [8, 19], 2027: [8, 8], 2028: [8, 26], 2029: [8, 16], 2030: [8, 5] },
};
export const FESTIVAL_NAMES = { newyear: '元旦', springfest: '春节', midautumn: '中秋', qixi: '七夕', christmas: '圣诞' };
export function festivalOf(date) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  if (m === 1 && d === 1) return 'newyear';
  if (m === 12 && (d === 24 || d === 25)) return 'christmas';
  const day = Date.UTC(y, m - 1, d);
  const near = (key, before, after) => {
    const hit = LUNAR[key][y];
    if (!hit) return false;
    const diff = (day - Date.UTC(y, hit[0] - 1, hit[1])) / 86400000;
    return diff >= -before && diff <= after;
  };
  if (near('springfest', 1, 2)) return 'springfest';
  if (near('midautumn', 0, 0)) return 'midautumn';
  if (near('qixi', 0, 0)) return 'qixi';
  return 'none';
}

/* 共享的"现在"：每 30 秒更新一次，所有组件读同一个值 */
let now = new Date();
const listeners = new Set();
let timer = 0;
function subscribe(fn) {
  listeners.add(fn);
  if (!timer) {
    timer = window.setInterval(() => {
      now = new Date();
      listeners.forEach((l) => l());
    }, 30000);
  }
  return () => {
    listeners.delete(fn);
    if (!listeners.size) {
      window.clearInterval(timer);
      timer = 0;
    }
  };
}
const get = () => now;
export function useNow() {
  return useSyncExternalStore(subscribe, get, get);
}

/* 蝴蝶之梦：访客点蓝蝶临时改变时段、季节、月相。只在当前标签页里有效，关掉网页就回到现实。 */
const DREAM_KEY = 'tiaotiao.dream';
const DREAM_VALUES = {
  sky: ['dawn', 'day', 'dusk', 'night'],
  season: ['spring', 'summer', 'autumn', 'winter'],
  moon: ['full', 'new'],
  weather: ['clear', 'rain', 'fog'],
  festival: ['newyear', 'springfest', 'midautumn', 'qixi', 'christmas'],
};
function loadDream() {
  try {
    const raw = JSON.parse(window.sessionStorage.getItem(DREAM_KEY) || '{}');
    return Object.fromEntries(Object.entries(raw).filter(([k, v]) => DREAM_VALUES[k]?.includes(v) || (k === 'hour' && typeof v === 'number')));
  } catch {
    return {};
  }
}
let dream = loadDream();
const dreamListeners = new Set();
export function setDream(patch) {
  const next = patch === null ? {} : { ...dream, ...patch };
  Object.keys(next).forEach((k) => {
    if (k === 'hour') {
      if (typeof next.hour !== 'number' || !Number.isFinite(next.hour)) delete next.hour;
      return;
    }
    if (!DREAM_VALUES[k]?.includes(next[k])) delete next[k];
  });
  dream = next;
  try {
    window.sessionStorage.setItem(DREAM_KEY, JSON.stringify(dream));
  } catch {
    /* 存不住就只在内存里 */
  }
  dreamListeners.forEach((fn) => fn());
}
export function randomDream() {
  const any = (arr) => arr[Math.floor(Math.random() * arr.length)];
  setDream({
    sky: any(DREAM_VALUES.sky),
    season: any(DREAM_VALUES.season),
    moon: any([...DREAM_VALUES.moon, 'auto']),
    weather: any(DREAM_VALUES.weather),
    festival: Math.random() < 0.3 ? any(DREAM_VALUES.festival) : 'auto',
  });
}
const dreamSub = (fn) => {
  dreamListeners.add(fn);
  return () => dreamListeners.delete(fn);
};
const dreamGet = () => dream;
export function useDream() {
  return useSyncExternalStore(dreamSub, dreamGet, dreamGet);
}

/* 首页月亮的周期位置：梦里指定了满月 / 新月就用它，否则是今天真实的月相 */
/* 拖动首页时针时的梦中时刻（0–24 小时，可能带小数） */
export const dreamHour = () => (typeof dream.hour === 'number' ? dream.hour : null);

export function homeCycle(date = new Date()) {
  const f = FORCE.festival ?? dream.festival ?? festivalOf(date);
  const m = FORCE.moon ?? dream.moon ?? (f === 'midautumn' ? 'full' : null);
  if (m === 'full') return 0.5;
  if (m === 'new') return 0;
  return moonCycle(date);
}

export function useWorld() {
  const d = useNow();
  const dr = useDream();
  const festival = FORCE.festival ?? dr.festival ?? festivalOf(d);
  /* 中秋一定是满月；圣诞一定下雪 */
  const lunar = FORCE.moon ?? dr.moon ?? (festival === 'midautumn' ? 'full' : lunarOf(d));
  const season = FORCE.season ?? dr.season ?? (festival === 'christmas' ? 'winter' : seasonOf(d));
  return {
    now: d,
    sky: FORCE.sky ?? dr.sky ?? (typeof dr.hour === 'number' ? skyOfHour(dr.hour) : skyOf(d)),
    season,
    lunar,
    weather: FORCE.weather ?? dr.weather ?? weatherOf(d),
    festival,
    dreaming: Object.keys(dr).length > 0,
    skyForced: Boolean(FORCE.sky ?? dr.sky) || typeof dr.hour === 'number',
    moonForced: Boolean(FORCE.moon ?? dr.moon) || festival === 'midautumn',
  };
}
