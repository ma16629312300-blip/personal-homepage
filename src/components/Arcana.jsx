import { useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { images } from '../data/sections.js';
import { ARCANA_IDS, bond, notice, useBond } from '../lib/bond.js';
import { sfx } from '../lib/sfx.js';

/* 每页藏着一张小塔罗：半隐在场景里，点到就翻面、升起、收进口袋。 */
export function HiddenCard({ section }) {
  const reduce = useReducedMotion();
  const state = useBond();
  const [taking, setTaking] = useState(false);
  const found = state.cards.includes(section.id);
  if (found && !taking) return null;

  const take = () => {
    if (taking) return;
    setTaking(true);
    sfx('card');
    const have = state.cards.length + 1;
    bond(`arcana:${section.id}`);
    notice(
      have >= ARCANA_IDS.length
        ? '五张牌集齐了。海面上……好像浮现了一扇门。'
        : `找到了 ${section.arcana[0]} ${section.arcana[2]}　${have} / ${ARCANA_IDS.length}`,
    );
    window.setTimeout(() => setTaking(false), reduce ? 0 : 1400);
  };

  return (
    <button
      type="button"
      className={`hcard hcard--${section.id}`}
      data-taking={taking}
      onClick={take}
      onPointerEnter={() => sfx('hover')}
      aria-label="藏在这里的塔罗牌"
      disabled={taking}
    >
      <span className="hcard__inner">
        <span className="hcard__back" style={{ backgroundImage: `url(${images.cardBack})` }} />
        <span className="hcard__face" aria-hidden="true">
          <b>{section.arcana[0]}</b>
          <i>{section.arcana[2]}</i>
        </span>
      </span>
    </button>
  );
}

/* 五张牌集齐后，首页的海面上浮出天鹅绒之门 */
export function BlueDoor() {
  const state = useBond();
  if (state.cards.length < ARCANA_IDS.length) return null;
  return (
    <a className="blue-door" href="#velvet" aria-label="推开天鹅绒之门" onPointerEnter={() => sfx('hover')}>
      <span className="blue-door__body">
        <img src={images.door} alt="" decoding="async" draggable="false" />
        <span className="blue-door__light" aria-hidden="true" />
      </span>
      <img className="blue-door__reflect" src={images.door} alt="" aria-hidden="true" decoding="async" draggable="false" />
      <span className="blue-door__hint" aria-hidden="true">VELVET ROOM</span>
    </a>
  );
}
