'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'chopit-theme';

// Reads whichever theme is on screen right now: an explicit choice already
// written to <html> by the inline script in layout.tsx, otherwise the OS
// preference. Runs on mount only — the server can't know either.
function currentTheme(): Theme {
  const stamped = document.documentElement.dataset.theme;
  if (stamped === 'light' || stamped === 'dark') return stamped;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
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
