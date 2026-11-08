import { useSyncExternalStore } from 'react';

/* 访客的名字：第一次来访时写下（可以跳过），只存在访客自己的浏览器里。
   null 表示还没问过，'' 表示跳过了。 */
const KEY = 'tiaotiao.name';
const read = () => {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return '';
  }
};
let name = read();
const listeners = new Set();
export function setName(v) {
  name = v == null ? null : String(v).trim().slice(0, 12);
  try {
    if (name == null) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, name);
  } catch {
    /* ignore */
  }
  listeners.forEach((fn) => fn());
}
const get = () => name;
export function useName() {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    get,
    get,
  );
}
