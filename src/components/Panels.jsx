import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowUpRight, Copy, Download, Mail } from 'lucide-react';
import { email, playgroundItems } from '../data/sections.js';
import { CardFace, Shatter } from './Tarot.jsx';
import { useDarkHour } from '../lib/darkHour.js';
import { sfx } from '../lib/sfx.js';

function Heading({ section, children }) {
  return (
    <header className="panel-head">
      <p className="panel-head__kicker">
        <span>{section.number}</span>
        <span>{section.label}</span>
        <span className="arcana-tag">{section.arcana[0]} · {section.arcana[1]} <i>{section.arcana[2]}</i></span>
      </p>
      <h1 id={`heading-${section.id}`} tabIndex={-1} className="panel-head__title">
        <span className="reveal">{section.title}</span>
      </h1>
      {children}
    </header>
  );
}

function Home({ section }) {
  const dark = useDarkHour();
  return (
    <div className="content content--home">
      <button
        type="button"
        className="clock-hit"
        aria-label={dark.active ? '已在影时间' : '把时钟拨到零点'}
        onClick={dark.active ? dark.exit : dark.enter}
      >
        <span className="clock-hit__hint" aria-hidden="true">{dark.active ? '离开影时间' : '拨到零点？'}</span>
      </button>
      <h1 id={`heading-${section.id}`} tabIndex={-1} className="visually-hidden">
        tiaotiao 的个人空间
      </h1>
      <p className="home-line">
        <span className="reveal">河北工业大学北辰最忧郁之人</span>
      </p>
      <p className="home-arcana arcana-tag">{section.arcana[0]} · {section.arcana[1]} <i>{section.arcana[2]}</i></p>
    </div>
  );
}

function About({ section }) {
  return (
    <div className="content content--about">
      <Heading section={section} />
      <div className="about-body">
        <p className="about-name">tiaotiao</p>
        <p className="about-motto">河北工业大学北辰最忧郁之人。</p>
        <p className="about-copy">
          喜欢把网页做成有情绪的界面，也喜欢把小玩法、小工具和视觉实验塞进自己的宇宙里。
        </p>
        <ul className="about-tags" aria-label="关键词">
          <li>河北工业大学</li>
          <li>游戏 UI</li>
          <li>交互实验</li>
        </ul>
      </div>
    </div>
  );
}

function Projects({ section }) {
  return (
    <div className="content content--projects">
      <Heading section={section} />
      <div className="empty-state">
        <p className="empty-state__title">暂无公开项目</p>
        <p className="empty-state__text">正式项目整理好之后会放在这里。</p>
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
    if (detail) lastOpened.current = detail.id;
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
                <span className="pg-card__title">{item.title}</span>
                <span className="pg-card__teaser">{item.teaser}</span>
              </a>
            </li>
          ))}
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
              返回有趣功能
            </a>
            <p className="panel-head__kicker">
              <span>{detail.number}</span>
              <span>{detail.label}</span>
            </p>
            <p className="pg-detail__arcana">
              <b>{detail.arcana[0]}</b>
              <span>{detail.arcana[1]}</span>
              <i>{detail.arcana[2]}</i>
            </p>
            <h2 id={`detail-${detail.id}`} tabIndex={-1} className="pg-detail__title">
              {detail.title}
            </h2>
            <p className="pg-detail__author">作者 tiaotiao</p>
            <p className="pg-detail__copy">{detail.copy}</p>
            {detail.note && <p className="pg-detail__note">{detail.note}</p>}
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
                  <span>{l.label}</span>
                  {l.sub && <small>{l.sub}</small>}
                </a>
              ))}
            </div>
          </motion.article>
        )}
      </AnimatePresence>
    </div>
  );
}

function Contact({ section }) {
  const [copied, setCopied] = useState(null);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = async () => {
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
      <p className="contact-email">{email}</p>
      <div className="contact-actions">
        <a className="btn btn--primary" href={`mailto:${email}`}>
          <Mail aria-hidden="true" size={18} />
          <span>发邮件</span>
        </a>
        <button type="button" className="btn" onClick={copy}>
          <Copy aria-hidden="true" size={18} />
          <span>{copied === 'ok' ? '已复制' : '复制邮箱'}</span>
        </button>
      </div>
      <p className="contact-status" role="status">
        {copied === 'ok' ? '邮箱已复制到剪贴板' : copied === 'fail' ? '复制失败，请手动选择邮箱地址' : ''}
      </p>
    </div>
  );
}

const MAP = { home: Home, about: About, projects: Projects, playground: Playground, contact: Contact };

export function PanelContent({ section, route, active }) {
  const C = MAP[section.id];
  return (
    <div className="scroller">
      <C section={section} route={route} active={active} />
    </div>
  );
}
