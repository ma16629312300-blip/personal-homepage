import { useSyncExternalStore } from 'react';

/* 羁绊：访客在站里做过的事（每件只算一次）累积成等级，进度只存在访客自己的浏览器里。
   隐藏的五张塔罗也记在这里，集齐后天鹅绒之门出现。 */
const KEY = 'tiaotiao.bond.v1';

export const BOND_EVENTS = {
  'visit:about': '走进了列车',
  'visit:projects': '登上了坡道',
  'visit:playground': '来到了站台',
  'visit:contact': '爬上了天台',
  'dialogue:about': '听完了自我介绍',
  'dialogue:contact': '听完了留言',
  'card:palm-universe': '翻开了星星',
  'card:memory-album': '翻开了月亮',
  darkHour: '经历了影时间',
  summon: '召唤了人格面具',
  bgm: '一起听了歌',
  mail: '记下了邮箱',
  daily: '抽了今天的塔罗',
  dream: '在蝴蝶之梦里改变了天空',
  secret: '念出了藏起来的咒语',
  'arcana:home': '找到了愚者',
  'arcana:about': '找到了隐者',
  'arcana:projects': '找到了战车',
  'arcana:playground': '找到了星星',
  'arcana:contact': '找到了恋人',
  velvet: '推开了天鹅绒之门',
  fusion: '合成了新的守护灵',
  wish: '对着流星许了愿',
};
export const ARCANA_IDS = ['home', 'about', 'projects', 'playground', 'contact'];
const TOTAL = Object.keys(BOND_EVENTS).length;
export const BOND_TOTAL = TOTAL;

/* 没做过的事只给一句模糊提示 */
export const BOND_HINTS = {
  'visit:about': '去末班车上坐一坐',
  'visit:projects': '登上那条樱花坡道',
  'visit:playground': '去站台边看看',
  'visit:contact': '爬上学校的天台',
  'dialogue:about': '把列车上的自我介绍听完',
  'dialogue:contact': '把天台上的留言听完',
  'card:palm-universe': '翻开一张画着星星的牌',
  'card:memory-album': '翻开一张画着月亮的牌',
  darkHour: '让时钟的指针走到零点',
  summon: '扣下那把召唤器',
  bgm: '和我一起听首歌',
  mail: '记下联系我的方式',
  daily: '抽一张今天的塔罗',
  dream: '追上那只停着的蓝蝶',
  secret: '在键盘上念出某个词',
  'arcana:home': '海面上漂着什么',
  'arcana:about': '车厢的座位上落了东西',
  'arcana:projects': '坡道的台阶上有张纸片',
  'arcana:playground': '站台的台子上放着什么',
  'arcana:contact': '天台栏杆边好像夹着东西',
  velvet: '集齐五张牌之后，去海边找一扇门',
  fusion: '在天鹅绒房间里，把两张牌叠在一起',
  wish: '没有月亮的夜里，抬头看看天',
};
export const MAX_RANK = 10;

/* 等级 1 起步，最后一级要求所有事情都做过（包括天鹅绒房间） */
export function rankOf(n) {
  if (n >= TOTAL) return MAX_RANK;
  return Math.min(MAX_RANK - 1, 1 + Math.floor((n * (MAX_RANK - 1)) / (TOTAL - 1)));
}

function load() {
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) || '{}');
    const done = Array.isArray(raw.done) ? raw.done.filter((k) => k in BOND_EVENTS) : [];
    return { done };
  } catch {
    return { done: [] };
  }
}

let state = null;
let snapshot = null;
const listeners = new Set();
const rankListeners = new Set();

function get() {
  if (!state) {
    state = load();
    snapshot = make(state.done);
  }
  return snapshot;
}

function make(done) {
  const set = new Set(done);
  return {
    done: set,
    count: done.length,
    rank: rankOf(done.length),
    cards: ARCANA_IDS.filter((id) => set.has(`arcana:${id}`)),
  };
}

export function bond(event) {
  const cur = get();
  if (!(event in BOND_EVENTS) || cur.done.has(event)) return;
  state.done = [...state.done, event];
  snapshot = make(state.done);
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ done: state.done }));
  } catch {
    /* 隐私模式等情况下存不住，本次浏览内照样生效 */
  }
  listeners.forEach((fn) => fn());
  if (snapshot.rank > cur.rank) rankListeners.forEach((fn) => fn(snapshot.rank, cur.rank, event));
}

export function onRankUp(fn) {
  rankListeners.add(fn);
  return () => rankListeners.delete(fn);
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useBond() {
  return useSyncExternalStore(subscribe, get, get);
}

/* 测试用：清空进度 */
export function resetBond() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  state = { done: [] };
  snapshot = make([]);
  listeners.forEach((fn) => fn());
}

/* 小提示（找到卡牌、门出现等），由 App 里的 Notice 组件显示 */
const noticeListeners = new Set();
export function notice(text) {
  noticeListeners.forEach((fn) => fn(text));
}
export function onNotice(fn) {
  noticeListeners.add(fn);
  return () => noticeListeners.delete(fn);
}

/* 合成配方：记录访客试过哪几种两两组合（共十种） */
const FUSION_KEY = 'tiaotiao.fusion.v1';
export const FUSION_TOTAL = 10;
export function fusionPairs() {
  try {
    const raw = JSON.parse(window.localStorage.getItem(FUSION_KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}
export function addFusionPair(a, b) {
  const key = [a, b].sort().join('+');
  const list = fusionPairs();
  if (!list.includes(key)) {
    list.push(key);
    try {
      window.localStorage.setItem(FUSION_KEY, JSON.stringify(list));
    } catch {
      /* ignore */
    }
  }
  return list.length;
}
export function resetFusion() {
  try {
    window.localStorage.removeItem(FUSION_KEY);
  } catch {
    /* ignore */
  }
}
