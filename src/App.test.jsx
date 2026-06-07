import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import App from './App.jsx';

afterEach(() => {
  window.history.replaceState(null, '', '/');
  cleanup();
});

describe('Stage menu experience', () => {
  it('starts with intro content and new moon phase', () => {
    render(<App />);

    expect(document.querySelector('.stage-shell')).toHaveAttribute('data-section', 'intro');
    expect(screen.getByRole('heading', { name: /首页/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/stage emblem/i)).toHaveAttribute('data-phase', 'new');
    expect(screen.getByLabelText(/stage emblem/i)).toHaveAttribute('data-orbit', 'top');
  });

  it('shows the selected section name inside the transition wipe', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /有趣功能 PLAYGROUND/i }));

    expect(screen.getByTestId('transition-wipe')).toHaveAttribute('data-active', 'true');
    expect(screen.getByTestId('transition-title')).toHaveTextContent('有趣功能');
  });

  it('opens the palm universe subpage from playground', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /有趣功能 PLAYGROUND/i }));
    await user.click(screen.getByRole('link', { name: /查看掌中宇宙/i }));

    expect(screen.getByRole('heading', { name: /掌中宇宙/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /返回有趣功能/i })).toHaveAttribute('href', '#playground');
    expect(screen.getByRole('link', { name: /在线预览/i })).toHaveAttribute(
      'href',
      'https://ma16629312300-blip.github.io/palm-universe-download-site-20260601202734/'
    );
  });

  it('opens the memory album subpage with a real memory tree download', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /有趣功能 PLAYGROUND/i }));
    await user.click(screen.getByRole('link', { name: /查看记忆相册/i }));

    expect(screen.getByRole('heading', { name: /记忆相册/i })).toBeInTheDocument();
    expect(screen.getAllByText(/作者 tiaotiao/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /在线预览/i })).toHaveAttribute(
      'href',
      'https://cosmic-starship-0aed8e.netlify.app/'
    );
    expect(screen.getByRole('link', { name: /下载记忆树/i })).toHaveAttribute(
      'href',
      `${import.meta.env.BASE_URL}downloads/memory_tree_v3_7_theme_switchable.html`
    );
    expect(screen.getByRole('link', { name: /下载记忆树/i })).toHaveAttribute(
      'download',
      'memory_tree_v3_7_theme_switchable.html'
    );
  });

  it('keeps playground highlighted when opening side pages directly', () => {
    window.history.replaceState(null, '', '/#memory-album');

    render(<App />);

    expect(screen.getByRole('heading', { name: /记忆相册/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /有趣功能 PLAYGROUND/i })).toHaveAttribute('aria-pressed', 'true');
  });
});
