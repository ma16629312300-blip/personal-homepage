import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { sfx } from '../lib/sfx.js';

/* P3 风格对话框：名字牌、逐字打出、点击或空格翻页、▼ 提示、跳过，最后给出选择支。
   逐字的文字对读屏软件隐藏，另附一份完整台词，保证内容可读。 */
export default function Dialogue({ name, lines, choices, active }) {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [chars, setChars] = useState(0);
  const [done, setDone] = useState(false);
  const box = useRef(null);

  useEffect(() => {
    if (!active) return;
    setIdx(0);
    setChars(reduce ? lines[0].length : 0);
    setDone(false);
  }, [active, reduce, lines]);

  const line = lines[idx];
  const typing = chars < line.length;

  useEffect(() => {
    if (!active || !typing || reduce) return undefined;
    const id = window.setTimeout(() => {
      setChars((c) => c + 1);
      if (chars % 3 === 0) sfx('text');
    }, chars === 0 ? 420 : 42);
    return () => window.clearTimeout(id);
  }, [active, typing, chars, reduce]);

  const advance = () => {
    if (typing) {
      setChars(line.length);
      return;
    }
    if (idx < lines.length - 1) {
      sfx('hover');
      setIdx(idx + 1);
      setChars(reduce ? lines[idx + 1].length : 0);
    } else if (!done) {
      sfx('select');
      setDone(true);
    }
  };

  const skip = () => {
    setIdx(lines.length - 1);
    setChars(lines[lines.length - 1].length);
    setDone(true);
  };

  const restart = () => {
    setIdx(0);
    setChars(reduce ? lines[0].length : 0);
    setDone(false);
    box.current?.focus();
  };

  return (
    <div className="dlg" data-done={done}>
      <p className="visually-hidden">{lines.join(' ')}</p>
      <button ref={box} type="button" className="dlg__box" onClick={advance} aria-label={done ? '对话已结束' : typing ? '显示整句' : '下一句'}>
        <span className="dlg__name">{name}</span>
        <span className="dlg__text" aria-hidden="true">
          {line.slice(0, chars)}
          <span className="dlg__ghost">{line.slice(chars)}</span>
        </span>
        <span className="dlg__page" aria-hidden="true">{idx + 1} / {lines.length}</span>
        {!typing && !done && <span className="dlg__next" aria-hidden="true">▼</span>}
      </button>
      {!done && (
        <button type="button" className="dlg__skip" onClick={skip}>
          SKIP <span aria-hidden="true">▶▶</span>
        </button>
      )}
      {done && (
        <ul className="dlg__choices" aria-label="选择">
          {choices.map((c) => (
            <li key={c.label}>
              {c.href ? (
                <a className="dlg__choice" href={c.href} {...(c.external ? { target: '_blank', rel: 'noreferrer' } : {})} onPointerEnter={() => sfx('hover')}>
                  {c.label}
                </a>
              ) : (
                <button type="button" className="dlg__choice" onClick={c.restart ? restart : c.onClick} onPointerEnter={() => sfx('hover')}>
                  {c.label}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
