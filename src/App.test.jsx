import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from './App.jsx';
import { ARCANA_IDS, BOND_TOTAL, bond, rankOf, resetBond } from './lib/bond.js';
import { festivalOf, lunarOf, seasonOf, setDream, skyOf, weatherOf } from './lib/sky.js';

const go = async (hash) => {
  await act(async () => {
    window.location.hash = hash;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
};

afterEach(() => {
  window.history.replaceState(null, '', '/');
  cleanup();
  resetBond();
  window.localStorage.clear();
  setDream(null);
});

describe('tiaotiao 个人空间', () => {
  it('五个主栏目顺序固定，首页为当前栏目', () => {
    render(<App />);
    const nav = screen.getByRole('navigation', { name: '主栏目' });
    const links = within(nav).getAllByRole('link');
    expect(links.map((l) => l.getAttribute('href'))).toEqual(['#home', '#about', '#projects', '#playground', '#contact']);
    expect(links[0]).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByText('个人项目')).toBeInTheDocument();
  });

  it('非当前栏目对辅助技术隐藏且不可交互', () => {
    render(<App />);
    const panels = document.querySelectorAll('.panel');
    expect(panels).toHaveLength(5);
    const hidden = [...panels].filter((p) => p.getAttribute('aria-hidden') === 'true');
    expect(hidden).toHaveLength(4);
    hidden.forEach((p) => expect(p.inert).toBe(true));
  });

  it('简介使用北辰，不再出现南院', async () => {
    render(<App />);
    await go('#about');
    expect(screen.getAllByText(/河北工业大学北辰最忧郁之人/).length).toBeGreaterThan(0);
    expect(document.body.textContent).not.toMatch(/南院/);
  });

  it('旧链接 #profile 仍能打开个人简介', () => {
    window.history.replaceState(null, '', '/#profile');
    render(<App />);
    const nav = screen.getByRole('navigation', { name: '主栏目' });
    expect(within(nav).getByRole('link', { name: /个人简介/ })).toHaveAttribute('aria-current', 'page');
  });

  it('掌中宇宙详情页指向介绍站，不标成安装包', async () => {
    render(<App />);
    await go('#palm-universe');
    const detail = screen.getByRole('article', { name: '掌中宇宙' });
    expect(within(detail).getByText('作者 tiaotiao')).toBeInTheDocument();
    expect(within(detail).getByRole('link', { name: /返回有趣功能/ })).toHaveAttribute('href', '#playground');
    const link = within(detail).getByRole('link', { name: /前往介绍页/ });
    expect(link).toHaveAttribute('href', 'https://ma16629312300-blip.github.io/palm-universe-download-site-20260601202734/');
    expect(link).not.toHaveAttribute('download');
  });

  it('记忆相册详情页有在线预览和兼容子路径的下载', async () => {
    window.history.replaceState(null, '', '/#memory-album');
    render(<App />);
    const detail = screen.getByRole('article', { name: '记忆相册' });
    expect(within(detail).getByRole('link', { name: /在线预览/ })).toHaveAttribute('href', 'https://cosmic-starship-0aed8e.netlify.app/');
    const dl = within(detail).getByRole('link', { name: /下载记忆树/ });
    expect(dl).toHaveAttribute('href', `${import.meta.env.BASE_URL}downloads/memory_tree_v3_7_theme_switchable.html`);
    expect(dl).toHaveAttribute('download', 'memory_tree_v3_7_theme_switchable.html');
    const nav = screen.getByRole('navigation', { name: '主栏目' });
    expect(within(nav).getByRole('link', { name: /有趣功能/ })).toHaveAttribute('aria-current', 'page');
  });

  it('联系我展示真实邮箱并可邮件跳转', async () => {
    render(<App />);
    await go('#contact');
    expect(screen.getByText('2058194218@qq.com')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /发邮件/ })).toHaveAttribute('href', 'mailto:2058194218@qq.com');
    expect(screen.getByRole('button', { name: /复制邮箱/ })).toBeInTheDocument();
  });

  it('背景音乐默认关闭，由用户主动开启', () => {
    render(<App />);
    const btn = screen.getByRole('button', { name: '播放背景音乐' });
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    expect(document.querySelector('audio')).toHaveAttribute('src', `${import.meta.env.BASE_URL}audio/color-your-night.mp3`);
  });

  it('首页时钟提供影时间彩蛋入口', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: '把时钟拨到零点', hidden: true })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
  });

  it('羁绊等级按做过的事累积，全部完成才到最高级', () => {
    expect(rankOf(0)).toBe(1);
    expect(rankOf(3)).toBe(2);
    expect(rankOf(BOND_TOTAL - 1)).toBe(9);
    expect(rankOf(BOND_TOTAL)).toBe(10);
  });

  it('找到隐藏的塔罗会记进进度并显示在日历上', async () => {
    render(<App />);
    const card = screen.getByRole('button', { name: '藏在这里的塔罗牌' });
    await act(async () => {
      fireEvent.click(card);
    });
    expect(JSON.parse(window.localStorage.getItem('tiaotiao.bond.v1')).done).toContain('arcana:home');
    expect(document.querySelector('.cal__bond').textContent).toMatch('1/5');
  });

  it('五张牌没集齐时进不了天鹅绒房间，集齐后蓝门出现并可进入', async () => {
    render(<App />);
    await go('#velvet');
    expect(screen.queryByRole('dialog', { name: /天鹅绒房间/ })).not.toBeInTheDocument();
    await go('#home');
    await act(async () => {
      ARCANA_IDS.forEach((id) => bond(`arcana:${id}`));
    });
    expect(screen.getByRole('link', { name: '推开天鹅绒之门' })).toHaveAttribute('href', '#velvet');
    await go('#velvet');
    const room = screen.getByRole('dialog', { name: /天鹅绒房间/ });
    expect(within(room).getAllByRole('button', { name: /THE / })).toHaveLength(5);
    expect(within(room).getByRole('link', { name: /离开房间/ })).toHaveAttribute('href', '#home');
  });

  it('天空、季节与月相跟着真实时间走', () => {
    expect(skyOf(new Date(2026, 10, 8, 6, 0))).toBe('dawn');
    expect(skyOf(new Date(2026, 10, 8, 12, 0))).toBe('day');
    expect(skyOf(new Date(2026, 10, 8, 17, 0))).toBe('dusk');
    expect(skyOf(new Date(2026, 10, 8, 23, 0))).toBe('night');
    expect(seasonOf(new Date(2026, 3, 1))).toBe('spring');
    expect(seasonOf(new Date(2026, 10, 8))).toBe('autumn');
    expect(seasonOf(new Date(2026, 0, 8))).toBe('winter');
    expect(lunarOf(new Date(Date.UTC(2000, 0, 6, 18, 14)))).toBe('new');
    expect(lunarOf(new Date(Date.UTC(2000, 0, 21, 12, 0)))).toBe('full');
  });

  it('个人简介展示人物参数，忧郁度满级', async () => {
    render(<App />);
    await go('#about');
    const stats = screen.getByRole('region', { name: /人物参数/ });
    expect(within(stats).getAllByRole('listitem')).toHaveLength(5);
    expect(within(stats).getByText('MAX')).toBeInTheDocument();
  });

  it('每日塔罗每天只能抽一张，抽到后显示当天的牌', async () => {
    render(<App />);
    await go('#playground');
    const card = screen.getByRole('button', { name: '抽一张今天的塔罗' });
    await act(async () => {
      fireEvent.click(card);
    });
    const drawn = screen.getByRole('button', { name: /^今日塔罗：/ });
    const label = drawn.getAttribute('aria-label');
    await act(async () => {
      fireEvent.click(drawn);
    });
    expect(screen.getByRole('button', { name: /^今日塔罗：/ })).toHaveAttribute('aria-label', label);
    expect(screen.getByText('明天再来抽一张。')).toBeInTheDocument();
  });

  it('点蓝蝶可以临时切换季节，并能还原现实', async () => {
    render(<App />);
    const real = document.querySelector('.app').dataset.season;
    fireEvent.click(screen.getByRole('button', { name: /蓝蝶/ }));
    const menu = screen.getByRole('group', { name: /蝴蝶之梦/ });
    const target = real === 'winter' ? '夏' : '冬';
    fireEvent.click(within(within(menu).getByRole('group', { name: '季节' })).getByRole('button', { name: target }));
    expect(document.querySelector('.app').dataset.season).toBe(target === '冬' ? 'winter' : 'summer');
    expect(screen.getByText('梦境中')).toBeInTheDocument();
    fireEvent.click(within(menu).getByRole('button', { name: '还原现实' }));
    expect(document.querySelector('.app').dataset.season).toBe(real);
  });

  it('天气按日期固定，节日按公历与农历判断', () => {
    const d = new Date(2026, 10, 8);
    expect(['clear', 'rain', 'fog']).toContain(weatherOf(d));
    expect(weatherOf(new Date(2026, 10, 8, 23))).toBe(weatherOf(d));
    expect(festivalOf(new Date(2027, 0, 1))).toBe('newyear');
    expect(festivalOf(new Date(2026, 11, 25))).toBe('christmas');
    expect(festivalOf(new Date(2027, 1, 6))).toBe('springfest');
    expect(festivalOf(new Date(2026, 8, 25))).toBe('midautumn');
    expect(festivalOf(new Date(2026, 7, 19))).toBe('qixi');
    expect(festivalOf(new Date(2026, 10, 8))).toBe('none');
  });

  it('点日历的羁绊行打开记录，可以两步确认清除进度', async () => {
    render(<App />);
    await act(async () => {
      bond('bgm');
    });
    fireEvent.click(screen.getByRole('button', { name: '打开羁绊记录' }));
    const rec = screen.getByRole('dialog', { name: /羁绊记录/ });
    expect(within(rec).getByText('一起听了歌')).toBeInTheDocument();
    const wipe = within(rec).getByRole('button', { name: '清除全部进度' });
    fireEvent.click(wipe);
    fireEvent.click(within(rec).getByRole('button', { name: /确定清除/ }));
    expect(within(rec).queryByText('一起听了歌')).not.toBeInTheDocument();
    expect(within(rec).getByText('和我一起听首歌')).toBeInTheDocument();
  });

  it('键入 persona 会召唤当前页的守护灵', () => {
    render(<App />);
    'persona'.split('').forEach((key) => fireEvent.keyDown(window, { key }));
    expect(screen.getByText('已召唤守护灵 潮汐看守')).toBeInTheDocument();
    expect(document.querySelector('.summon-label__name').textContent).toBe('TIDE KEEPER');
  });

  it('按 H 进入拍照模式，再按一次退出', () => {
    render(<App />);
    const app = document.querySelector('.app');
    fireEvent.keyDown(window, { key: 'h' });
    expect(app.dataset.photo).toBe('true');
    fireEvent.keyDown(window, { key: 'h' });
    expect(app.dataset.photo).toBe('false');
  });

  it('天鹅绒房间里两张牌可以合成出零时钟匠，并多出一张世界牌', async () => {
    render(<App />);
    await act(async () => {
      ARCANA_IDS.forEach((id) => bond(`arcana:${id}`));
    });
    await go('#velvet');
    const room = screen.getByRole('dialog', { name: /天鹅绒房间/ });
    fireEvent.click(within(room).getByRole('button', { name: '合成守护灵' }));
    const start = within(room).getByRole('button', { name: '开始合成' });
    expect(start).toBeDisabled();
    fireEvent.click(within(room).getByRole('button', { name: /THE FOOL/ }));
    fireEvent.click(within(room).getByRole('button', { name: /THE STAR/ }));
    expect(start).not.toBeDisabled();
    fireEvent.click(start);
    expect((await within(room).findAllByText(/零时钟匠/)).length).toBeGreaterThan(0);
    expect(within(room).getByRole('button', { name: /THE WORLD/ })).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('tiaotiao.fusion.v1'))).toEqual(['home+playground']);
  });
});
