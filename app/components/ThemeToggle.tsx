'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'chopit-theme';

// Reads whichever theme is on screen right now: an explicit choice already
// written to <html> by the inline script in layout.tsx, otherwise light.
//
// It must not consult prefers-color-scheme. The stylesheet stopped doing
// so, so a visitor on a dark-scheme OS with no stored choice sees the
// light site — and a toggle that disagreed would spend its first click
// "switching to light" while nothing moved.
function currentTheme(): Theme {
  const stamped = document.documentElement.dataset.theme;
  return stamped === 'dark' ? 'dark' : 'light';
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(currentTheme());
  }, []);

  const toggle = () => {
    const next: Theme = (theme ?? currentTheme()) === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private browsing with storage blocked: the toggle still works for
      // this page view, it just won't survive a reload.
    }
  };

  const label = theme === 'dark' ? 'Switch to light appearance' : 'Switch to dark appearance';

  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-label={label} title={label}>
      <span className="theme-toggle-on" aria-hidden="true" />
      <span className="theme-toggle-off" aria-hidden="true" />
    </button>
  );
}
