import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowUpRight, Copy, Download, Mail } from 'lucide-react';
import { email, images, playgroundItems } from '../data/sections.js';
import { CardFace, Shatter } from './Tarot.jsx';
import Dialogue from './Dialogue.jsx';
import { useDarkHour } from '../lib/darkHour.js';
import { sfx } from '../lib/sfx.js';
import { bond } from '../lib/bond.js';
import { BlueDoor, HiddenCard } from './Arcana.jsx';
import { DailyTarot, Stats } from './Daily.jsx';
import { useName } from '../lib/name.js';
import { dreamHour, setDream } from '../lib/sky.js';
import { tr } from '../lib/i18n.js';
import Kinetic from './Kinetic.jsx';

function Heading({ section, children }) {
  return (
    <header className="panel-head">
      <p className="panel-head__kicker">
        <span>{section.number}</span>
        <span>{section.label}</span>
        <span className="arcana-tag">{section.arcana[0]} · {section.arcana[1]} <i>{tr(section.arcana[2])}</i></span>
      </p>
      <h1 id={`heading-${section.id}`} tabIndex={-1} className="panel-head__title">
        <Kinetic text={tr(section.title)} />
      </h1>
      {children}
    </header>
  );
}

function Home({ section }) {
  const dark = useDarkHour();
  /* 拖动时针：把首页时钟拨到几点，天空就变成几点的颜色；拨过零点进入影时间。只点一下仍是原来的"拨到零点"。 */
  const drag = useRef(null);
  const angleAt = (e) => {
    const m = document.querySelector('.moon')?.getBoundingClientRect();
    if (!m) return 0;
    const a = Math.atan2(e.clientX - (m.left + m.width / 2), -(e.clientY - (m.top + m.height / 2)));
    return ((a * 180) / Math.PI + 360) % 360;
  };
  const onDown = (e) => {
    if (dark.active || e.button > 0) return;
    const dh = dreamHour();
    const now = new Date();
    drag.current = { x: e.clientX, y: e.clientY, moved: false, h: dh ?? now.getHours() + now.getMinutes() / 60, id: e.pointerId };
  };
  const onMove = (e) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (!d.moved) {
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 8) return;
      d.moved = true;
      e.currentTarget.setPointerCapture?.(e.pointerId);
    }
    const target = angleAt(e) / 30;
    let delta = target - (((d.h % 12) + 12) % 12);
    if (delta > 6) delta -= 12;
    if (delta < -6) delta += 12;
    const next = d.h + delta;
    if (Math.floor(next) !== Math.floor(d.h)) sfx('text');
    /* 顺时针拨过零点：进入影时间 */
    if (delta > 0 && Math.floor(next / 24) > Math.floor(d.h / 24)) {
      drag.current = null;
      setDream({ hour: 0 });
      bond('dream');
      dark.enterNow();
      return;
    }
    d.h = next;
    setDream({ hour: ((next % 24) + 24) % 24 });
  };
  const onUp = (e) => {
    const d = drag.current;
    if (d?.moved) {
      bond('dream');
      d.suppress = true;
      window.setTimeout(() => {
        drag.current = null;
      }, 0);
    } else drag.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };
  return (
    <div className="content content--home">
      <button
        type="button"
        className="clock-hit"
        aria-label={tr(dark.active ? '已在影时间' : '把时钟拨到零点')}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onClick={(e) => {
          if (drag.current?.suppress) {
            e.preventDefault();
            return;
          }
          if (dark.active) dark.exit();
          else dark.enter();
        }}
      >
        <span className="clock-hit__hint" aria-hidden="true">{tr(dark.active ? '离开影时间' : '拖动时针 · 或点我拨到零点')}</span>
      </button>
      <h1 id={`heading-${section.id}`} tabIndex={-1} className="visually-hidden">
        {tr('tiaotiao 的个人空间')}
      </h1>
      <p className="home-line">
        <Kinetic text={tr('河北工业大学北辰最忧郁之人')} variant="slide" />
      </p>
      <p className="home-arcana arcana-tag">{section.arcana[0]} · {section.arcana[1]} <i>{tr(section.arcana[2])}</i></p>
    </div>
  );
}

const ABOUT_LINES = [
  '……啊，你来了。我是 tiaotiao。',
  '河北工业大学北辰最忧郁之人。',
  '我喜欢把网页做成有情绪的界面。',
  '也喜欢把小玩法、小工具和视觉实验，塞进自己的宇宙里。',
  '要去看看吗？',
];
const ABOUT_CHOICES = [
  { label: '去看看有趣功能', href: '#playground' },
  { label: '想联系 tiaotiao', href: '#contact' },
  { label: '再听一遍', restart: true },
];

function About({ section, active }) {
  const name = useName();
  const lines = useMemo(() => (name ? ['……啊，{name}，你来了。我是 tiaotiao。', ...ABOUT_LINES.slice(1)] : ABOUT_LINES), [name]);
  return (
    <div className="content content--about">
      <Heading section={section} />
      <div className="about-body">
        <Dialogue
          name="tiaotiao"
          lines={lines}
          vars={{ name: name || '' }}
          choices={ABOUT_CHOICES}
          active={active}
          avatar={images.portrait}
          onDone={() => bond('dialogue:about')}
        />
        <ul className="about-tags" aria-label={tr('关键词')}>
          <li>{tr('河北工业大学')}</li>
          <li>{tr('游戏 UI')}</li>
          <li>{tr('交互实验')}</li>
        </ul>
        <Stats />
      </div>
    </div>
  );
}

function Projects({ section }) {
  return (
    <div className="content content--projects">
      <Heading section={section} />
      <div className="empty-state">
        <p className="empty-state__title">{tr('暂无公开项目')}</p>
        <p className="empty-state__text">{tr('正式项目整理好之后会放在这里。')}</p>
      </div>
    </div>
  );
}

function Playground({ section, route, active }) {
  const reduce = useReducedMotion();
  const detail = playgroundItems.find((p) => p.id === route.detail);
  const listRef = useRef(null);
  const lastOpened = useRef(null);
  const [summon, setSummon] = useState(null);

  /* 召唤：卡牌击碎后再进入详情 */
  const openCard = (e, item) => {
    if (reduce || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (summon) return;
    const rect = e.currentTarget.querySelector('.card').getBoundingClientRect();
    sfx('shatter');
    setSummon({ item, rect });
  };

  useEffect(() => {
    if (listRef.current) listRef.current.inert = Boolean(detail);
    if (detail) {
      lastOpened.current = detail.id;
      bond(`card:${detail.id}`);
    }
  }, [detail]);

  return (
    <div className="content content--playground">
      <div className="pg-list" ref={listRef} data-pushed={Boolean(detail)}>
        <Heading section={section} />
        <ol className="pg-cards">
          {playgroundItems.map((item, i) => (
            <li key={item.id} style={{ '--tilt': i % 2 ? '4deg' : '-5deg' }}>
              <a
                className="pg-card"
                href={`#${item.id}`}
                id={`entry-${item.id}`}
                data-summoning={summon?.item.id === item.id}
                onClick={(e) => openCard(e, item)}
                onPointerEnter={() => sfx('hover')}
              >
                <span className="card">
                  <CardFace item={item} />
                </span>
                <span className="pg-card__title">{tr(item.title)}</span>
                <span className="pg-card__teaser">{tr(item.teaser)}</span>
              </a>
            </li>
          ))}
          <li style={{ '--tilt': '-2deg' }}>
            <DailyTarot />
          </li>
        </ol>
      </div>
      {summon && (
        <Shatter
          rect={summon.rect}
          item={summon.item}
          onDone={() => {
            window.location.hash = summon.item.id;
            setSummon(null);
          }}
        />
      )}
      <AnimatePresence
        onExitComplete={() => {
          if (active && lastOpened.current) {
            document.getElementById(`entry-${lastOpened.current}`)?.focus({ preventScroll: true });
          }
        }}
      >
        {detail && (
          <motion.article
            key={detail.id}
            className="pg-detail"
            aria-labelledby={`detail-${detail.id}`}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, rotateY: -14 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, rotateY: 10 }}
            transition={{ duration: reduce ? 0.15 : 0.5, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={(def) => {
              if (def?.opacity === 1) document.getElementById(`detail-${detail.id}`)?.focus({ preventScroll: true });
            }}
          >
            <a className="pg-back" href="#playground">
              <ArrowLeft aria-hidden="true" size={18} />
              {tr('返回有趣功能')}
            </a>
            <p className="panel-head__kicker">
              <span>{detail.number}</span>
              <span>{detail.label}</span>
            </p>
            <p className="pg-detail__arcana">
              <b>{detail.arcana[0]}</b>
              <span>{detail.arcana[1]}</span>
              <i>{tr(detail.arcana[2])}</i>
            </p>
            <h2 id={`detail-${detail.id}`} tabIndex={-1} className="pg-detail__title">
              {tr(detail.title)}
            </h2>
            <p className="pg-detail__author">{tr('作者 tiaotiao')}</p>
            <p className="pg-detail__copy">{tr(detail.copy)}</p>
            {detail.note && <p className="pg-detail__note">{tr(detail.note)}</p>}
            <div className="pg-actions">
              {detail.links.map((l) => (
                <a
                  key={l.label}
                  className={`btn ${l.primary ? 'btn--primary' : ''}`}
                  href={l.href}
                  {...(l.download
                    ? { download: l.download }
                    : { target: '_blank', rel: 'noreferrer' })}
                >
                  {l.download ? <Download aria-hidden="true" size={18} /> : <ArrowUpRight aria-hidden="true" size={18} />}
                  <span>{tr(l.label)}</span>
                  {l.sub && <small>{tr(l.sub)}</small>}
                </a>
              ))}
            </div>
          </motion.article>
        )}
      </AnimatePresence>
    </div>
  );
}

const CONTACT_LINES = ['想找我的话……', '写信到这个邮箱就好。'];

function Contact({ section, active }) {
  const [copied, setCopied] = useState(null);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = async () => {
    bond('mail');
    try {
      await navigator.clipboard.writeText(email);
      setCopied('ok');
    } catch {
      setCopied('fail');
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(null), 2400);
  };
  return (
    <div className="content content--contact">
      <Heading section={section} />
      <Dialogue
        name="tiaotiao"
        lines={CONTACT_LINES}
        active={active}
        avatar={images.portrait}
        onDone={() => bond('dialogue:contact')}
        choices={[
          { label: '发邮件', href: `mailto:${email}`, onClick: () => bond('mail') },
          { label: '复制邮箱', onClick: () => copy() },
          { label: '下次再说', href: '#home' },
        ]}
      />
      <p className="contact-email">{email}</p>
      <div className="contact-actions">
        <a className="btn btn--primary" href={`mailto:${email}`} onClick={() => bond('mail')}>
          <Mail aria-hidden="true" size={18} />
          <span>{tr('发邮件')}</span>
        </a>
        <button type="button" className="btn" onClick={copy}>
          <Copy aria-hidden="true" size={18} />
          <span>{tr(copied === 'ok' ? '已复制' : '复制邮箱')}</span>
        </button>
      </div>
      <p className="contact-status" role="status">
        {copied === 'ok' ? tr('邮箱已复制到剪贴板') : copied === 'fail' ? tr('复制失败，请手动选择邮箱地址') : ''}
      </p>
    </div>
  );
}

const MAP = { home: Home, about: About, projects: Projects, playground: Playground, contact: Contact };

export function PanelContent({ section, route, active }) {
  const C = MAP[section.id];
  const [scrolled, setScrolled] = useState(false);
  return (
    <>
      <div className="scroller" onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 40)}>
        <C section={section} route={route} active={active} />
      </div>
      {section.id === 'home' && <BlueDoor />}
      <HiddenCard section={section} hidden={scrolled} />
    </>
  );
}
