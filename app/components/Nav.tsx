'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import ThemeToggle from './ThemeToggle';
import { APP_STORE_URL, IOS_LIVE } from '@/app/lib/app-stores';
import { trackCtaClicked, trackNavCtaClick } from '@/lib/posthog-events';
import styles from './Nav.module.css';

// Homepage anchors are absolute (`/#why`) so they still resolve from
// /recipes, /blog, /method and the legal pages.
const LINKS = [
  { href: '/#how', label: 'How it works' },
  { href: '/#chatgpt', label: 'In ChatGPT' },
  { href: '/recipes', label: 'Recipes' },
  { href: '/method', label: 'Our method' },
];

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function Nav() {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const closeNav = useCallback(() => setNavOpen(false), []);

  // While iOS is the only live install path, "Get the app" deep-links
  // straight to the App Store listing instead of scrolling visitors to
  // the closing CTA block on the homepage. Defensive: if IOS_LIVE ever
  // flips false (URL yanked), revert to the in-page anchor.
  const getAppHref = IOS_LIVE ? APP_STORE_URL : '/#download';

  // Hold the page still behind the drawer. `overflow: hidden` is not enough —
  // it stops user scrolling but not programmatic, and iOS Safari ignores it on
  // touch. Pinning the body and offsetting it by the current scroll position
  // does hold, and restoring it on close puts the reader back where they were.
  useEffect(() => {
    if (!navOpen) return;
    const { body, documentElement } = document;
    const scrollY = window.scrollY;
    const gutter = window.innerWidth - documentElement.clientWidth;
    const previous = body.getAttribute('style') ?? '';

    Object.assign(body.style, {
      position: 'fixed',
      top: `-${scrollY}px`,
      left: '0',
      right: '0',
      width: '100%',
      ...(gutter > 0 ? { paddingRight: `${gutter}px` } : null),
    });

    return () => {
      body.setAttribute('style', previous);
      // Reading a layout property forces the reflow that gives the document
      // its height back. Without it the scroll below lands while the page is
      // still collapsed to one viewport and gets clamped to 0.
      void documentElement.scrollHeight;
      window.scrollTo(0, scrollY);
    };
  }, [navOpen]);

  // Escape closes; Tab cycles inside the drawer rather than walking into the
  // page behind it. Focus starts on the close button and returns to the menu
  // button on the way out.
  useEffect(() => {
    if (!navOpen) return;
    const opener = menuButtonRef.current;
    drawerRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeNav();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = Array.from(
        drawerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (
        event.shiftKey &&
        (active === first || !drawerRef.current?.contains(active))
      ) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      // preventScroll: focusing the trigger would otherwise scroll it
      // into view and undo the scroll position the lock just restored.
      opener?.focus({ preventScroll: true });
    };
  }, [navOpen, closeNav]);

  // Both enums already carry `mobile_menu`; no need to extend them.
  const trackGetApp = (location: 'nav' | 'mobile_menu') => {
    trackNavCtaClick({ destination: 'get_app', location });
    trackCtaClicked({
      cta_location: location === 'nav' ? 'header_nav' : 'mobile_menu',
      cta_label: 'Get the app',
      cta_destination: getAppHref,
    });
  };

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="wordmark">
          <Image
            src="/logo.webp"
            alt=""
            width={26}
            height={26}
            className="wordmark-logo"
            priority
          />
          Chop&nbsp;it
        </Link>
        <div className="nav-links">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname === l.href ? 'page' : undefined}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="nav-spacer" />
        <div className="nav-cta">
          <ThemeToggle />
          <a
            className="nav-get"
            href={getAppHref}
            rel={IOS_LIVE ? 'noopener noreferrer' : undefined}
            onClick={() => trackGetApp('nav')}
          >
            Get the app
          </a>
          <button
            ref={menuButtonRef}
            type="button"
            className={styles.menuButton}
            aria-label="Open menu"
            aria-expanded={navOpen}
            onClick={() => setNavOpen(true)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="3" y1="7" x2="21" y2="7" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="17" x2="21" y2="17" />
            </svg>
          </button>
        </div>
      </div>

      {navOpen ? (
        <div className={styles.root}>
          <div aria-hidden="true" onClick={closeNav} className={styles.scrim} />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className={styles.drawer}
          >
            <div className={styles.header}>
              <span className={styles.brand}>
                <Image
                  src="/logo.webp"
                  alt=""
                  width={26}
                  height={26}
                  className={styles.brandLogo}
                />
                Chop&nbsp;it
              </span>
              <button
                type="button"
                className={styles.close}
                aria-label="Close menu"
                onClick={closeNav}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <line x1="5" y1="5" x2="19" y2="19" />
                  <line x1="19" y1="5" x2="5" y2="19" />
                </svg>
              </button>
            </div>

            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={styles.link}
                onClick={closeNav}
              >
                {l.label}
              </Link>
            ))}

            <div className={styles.appearance}>
              Appearance
              <ThemeToggle />
            </div>

            <a
              className={styles.cta}
              href={getAppHref}
              rel={IOS_LIVE ? 'noopener noreferrer' : undefined}
              onClick={() => trackGetApp('mobile_menu')}
            >
              Get the iPhone app
            </a>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
