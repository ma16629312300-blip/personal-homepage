import { useSyncExternalStore } from 'react';
import EN from '../i18n/en.js';

/* 中 / EN 切换：中文原文就是键，英文版查表，查不到就显示原文。选择保存在访客浏览器里。 */
const KEY = 'tiaotiao.lang';
let lang = (() => {
  try {
    return window.localStorage.getItem(KEY) === 'en' ? 'en' : 'zh';
  } catch {
    return 'zh';
  }
})();
const listeners = new Set();
export function setLang(next) {
  lang = next === 'en' ? 'en' : 'zh';
  try {
    window.localStorage.setItem(KEY, lang);
  } catch {
    /* ignore */
  }
  document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
  listeners.forEach((fn) => fn());
}
export const getLang = () => lang;
export function useLang() {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    getLang,
    getLang,
  );
}
/* 翻译；{name} 之类的占位会用 vars 替换 */
export function tr(s, vars) {
  let out = lang === 'en' && EN[s] != null ? EN[s] : s;
  if (vars) Object.entries(vars).forEach(([k, v]) => (out = out.split(`{${k}}`).join(v)));
  return out;
}
