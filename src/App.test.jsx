import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from './App.jsx';
import { ARCANA_IDS, bond, rankOf, resetBond } from './lib/bond.js';

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
    expect(rankOf(2)).toBe(2);
    expect(rankOf(17)).toBe(9);
    expect(rankOf(18)).toBe(10);
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
});
