import { useEffect, useMemo, useRef, useState } from 'react';
import { images } from '../data/sections.js';
import { setName, useName } from '../lib/name.js';
import { tr } from '../lib/i18n.js';
import { sfx } from '../lib/sfx.js';
import Dialogue from './Dialogue.jsx';

/* 第一次来访：tiaotiao 打个招呼，请访客写下名字（可跳过），再提示网站里藏着东西 */
export default function Guide() {
  const name = useName();
  const [step, setStep] = useState(() => (name == null && import.meta.env.MODE !== 'test' ? 'hello' : null));
  const [draft, setDraft] = useState('');
  const input = useRef(null);

  useEffect(() => {
    if (step === 'name') input.current?.focus();
  }, [step]);

  const helloLines = useMemo(() => ['……啊，是新面孔。', '在开始之前，可以告诉我你的名字吗？'], []);
  const welcomeLines = useMemo(
    () => [
      name ? '{name}，欢迎来到我的小宇宙。' : '那就先保密吧。欢迎来到我的小宇宙。',
      '这里藏着一些东西：五张牌、一扇门、一只蓝蝶……',
      '慢慢找吧。找不到的时候，点左上角的羁绊记录看看。',
    ],
    [name],
  );
  if (!step) return null;

  const finish = () => {
    sfx('select');
    setStep(null);
  };

  return (
    <div className="guide" role="dialog" aria-modal="true" aria-label={tr('初次见面')}>
      <div className="guide__panel">
        {step === 'hello' && (
          <Dialogue
            name="tiaotiao"
            avatar={images.portrait}
            lines={helloLines}
            active
            choices={[
              { label: '写下名字', onClick: () => setStep('name') },
              {
                label: '不告诉你',
                onClick: () => {
                  setName('');
                  setStep('welcome');
                },
              },
            ]}
          />
        )}
        {step === 'name' && (
          <form
            className="sign"
            onSubmit={(e) => {
              e.preventDefault();
              if (!draft.trim()) return;
              sfx('select');
              setName(draft);
              setStep('welcome');
            }}
          >
            <p className="sign__kicker">PLEASE SIGN HERE</p>
            <label className="sign__label" htmlFor="sign-name">
              {tr('你的名字')}
            </label>
            <input
              id="sign-name"
              ref={input}
              className="sign__input"
              value={draft}
              maxLength={12}
              autoComplete="nickname"
              onChange={(e) => setDraft(e.target.value)}
            />
            <p className="sign__note">{tr('只保存在你的浏览器里，不会上传。')}</p>
            <div className="sign__actions">
              <button type="submit" className="btn btn--primary" disabled={!draft.trim()}>
                {tr('确定')}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setName('');
                  setStep('welcome');
                }}
              >
                {tr('还是算了')}
              </button>
            </div>
          </form>
        )}
        {step === 'welcome' && (
          <Dialogue
            name="tiaotiao"
            avatar={images.portrait}
            lines={welcomeLines}
            vars={{ name: name || '' }}
            active
            choices={[{ label: '出发', onClick: finish }]}
          />
        )}
      </div>
    </div>
  );
}
