'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import ThemeToggle from './ThemeToggle';
import { APP_STORE_URL, IOS_LIVE } from '@/app/lib/app-stores';
import { trackCtaClicked, trackNavCtaClick } from '@/lib/posthog-events';

const LINKS = [
  { href: '/#chatgpt', label: 'ChatGPT plug-in' },
  { href: '/#ai-chef', label: 'AI Chef' },
  { href: '/recipes', label: 'Recipes' },
  { href: '/method', label: 'Method' },
  { href: '/blog', label: 'Blog' },
];

export default function Nav() {
  const pathname = usePathname();
  // While iOS is the only live install path, "Get the app" deep-links
  // straight to the App Store listing instead of scrolling visitors to
  // the closing CTA block on the homepage. Defensive: if IOS_LIVE ever
  // flips false (URL yanked), revert to the in-page anchor.
  const getAppHref = IOS_LIVE ? APP_STORE_URL : '/#download';

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="wordmark">
          <Image src="/logo.webp" alt="" width={26} height={26} className="wordmark-logo" priority />
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
            onClick={() => {
              trackNavCtaClick({ destination: 'get_app', location: 'nav' });
              trackCtaClicked({
                cta_location: 'header_nav',
                cta_label: 'Get the app',
                cta_destination: getAppHref,
              });
            }}
          >
            Get the app
          </a>
        </div>
      </div>
    </nav>
  );
}
