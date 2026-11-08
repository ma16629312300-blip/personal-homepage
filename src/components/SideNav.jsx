import { sections } from '../data/sections.js';
import { tr } from '../lib/i18n.js';
import { sfx } from '../lib/sfx.js';

export default function SideNav({ activeId }) {
  return (
    <nav className="side-nav" aria-label={tr('主栏目')}>
      <ol className="side-nav__list">
        {sections.map((s) => {
          const current = s.id === activeId;
          return (
            <li key={s.id}>
              <a
                className="side-nav__item"
                href={`#${s.id}`}
                aria-current={current ? 'page' : undefined}
                onPointerEnter={() => sfx('hover')}
                onFocus={() => sfx('hover')}
                onClick={() => !current && sfx('select')}
              >
                <span className="side-nav__num" aria-hidden="true">{s.number}</span>
                <span className="side-nav__en" aria-hidden="true">{s.label}</span>
                <span className="side-nav__zh">{tr(s.title)}</span>
                <span className="visually-hidden"> {s.label}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
