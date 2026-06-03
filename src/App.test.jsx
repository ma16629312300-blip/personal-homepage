import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import App from './App.jsx';

afterEach(() => {
  window.history.replaceState(null, '', '/');
  cleanup();
});

describe('Stage menu redesign', () => {
  it('starts with Chinese-first intro content and a staged emblem', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /首页/i })).toBeInTheDocument();
    expect(screen.getByText(/PERSONAL STAGE/i)).toBeInTheDocument();
    expect(screen.getByText(/个人主页的动态入口/i)).toBeInTheDocument();
    expect(document.querySelector('.stage-shell')).toHaveAttribute('data-visual-system', 'lunar');
    expect(screen.getByLabelText(/stage emblem/i)).toHaveAttribute('data-section', 'intro');
    expect(screen.getByLabelText(/stage emblem/i)).toHaveAttribute('data-phase', 'new');
    expect(screen.getByLabelText(/stage emblem/i)).toHaveAttribute('data-orbit', 'center');
    expect(screen.getByRole('button', { name: /首页 INTRO/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows the author profile in Chinese-first language', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /个人简介 PROFILE/i }));

    expect(screen.getByRole('heading', { name: /个人简介/i })).toBeInTheDocument();
    expect(screen.getAllByText(/作者 tiaotiao/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/河北工业大学南院最忧郁之人/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/stage emblem/i)).toHaveAttribute('data-section', 'profile');
  });

  it('switches structure, menu dominance, content, emblem state, and playground link on section click', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /有趣功能 PLAYGROUND/i }));

    expect(screen.getByRole('heading', { name: /有趣功能/i })).toBeInTheDocument();
    expect(screen.getAllByText(/PLAYGROUND/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/掌中宇宙/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /进入掌中宇宙/i })).toHaveAttribute(
      'href',
      'https://ma16629312300-blip.github.io/palm-universe-download-site-20260601202734/'
    );
    expect(screen.getByLabelText(/stage emblem/i)).toHaveAttribute('data-section', 'playground');
    expect(screen.getByLabelText(/stage emblem/i)).toHaveAttribute('data-phase', 'gibbous');
    expect(screen.getByLabelText(/stage emblem/i)).toHaveAttribute('data-orbit', 'high');
    expect(screen.getByRole('button', { name: /有趣功能 PLAYGROUND/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('transition-wipe')).toHaveAttribute('data-active', 'true');
  });

  it('can open a section directly from the URL hash', () => {
    window.history.replaceState(null, '', '/#playground');

    render(<App />);

    expect(screen.getByRole('heading', { name: /有趣功能/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/stage emblem/i)).toHaveAttribute('data-phase', 'gibbous');
  });
});
