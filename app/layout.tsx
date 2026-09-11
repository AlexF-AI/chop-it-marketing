import type { Metadata, Viewport } from 'next';
import { Archivo, Instrument_Serif } from 'next/font/google';
import './styles/globals.css';

import CookieBanner from './components/CookieBanner';
import MotionRoot from './components/MotionRoot';
import NavTracker from './components/NavTracker';
import { assertStoreUrlsValid } from './lib/app-stores';
import { SITE_DESCRIPTION, SITE_TITLE } from './lib/brand';
import { ORGANIZATION_JSONLD, WEBSITE_JSONLD } from './lib/entity';

// Fail the build on a store-URL misconfiguration rather than shipping CTAs
// that go nowhere. NEXT_PUBLIC_* values are inlined at build time, so this
// module-scope call runs during `next build` and a bad value stops the
// deploy — the class of defect that put href="#" in front of paid traffic
// is invisible to lint and typecheck, because it lives in the environment.
assertStoreUrlsValid();

// Instrument Serif carries the display voice — every h1/h2, the italic
// eyebrows, step numerals and pull quotes. Archivo carries body copy, UI,
// buttons and metadata. Both are wired to the CSS variables read by
// --ff-display / --ff-sans in globals.css.
//
// JetBrains Mono is gone: the serif italic eyebrow replaced the uppercase
// mono kicker everywhere, and the one surviving microlabel is uppercase
// Archivo 700. Dropping it removes a whole font request from every page.
const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-archivo',
  display: 'swap',
});

// Instrument Serif ships a single weight (400) in roman and italic, which
// is the whole face — there is no 500/600 to ask for.
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
});

// Pinned to paper, because the page is: light is the default regardless of
// the OS scheme (see the theme note at the top of globals.css). A
// prefers-color-scheme pair here would put a dark address bar above a light
// page for anyone on a dark phone, which is what it used to do.
//
// A visitor who picks dark keeps a paper-coloured bar until the next load.
// Repainting it live needs a client effect writing <meta name="theme-color">,
// which is not worth a hydration-time DOM write for one strip of chrome.
export const viewport: Viewport = {
  themeColor: '#f6f1e7',
  colorScheme: 'light dark',
};

// Replays a stored theme choice onto <html> before first paint, so a
// visitor who picked dark on a light-scheme OS never sees a cream flash.
// Kept inline and dependency-free for that reason.
const THEME_INIT = `try{var t=localStorage.getItem('chopit-theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t}}catch(e){}`;

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  metadataBase: new URL('https://chop-it.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: 'https://chop-it.com',
    siteName: 'Chop it',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  // Google Search Console — URL-prefix property verification.
  // Property: https://chop-it.com
  // Once GSC has crawled this tag and verified ownership, this entry can be
  // left in place (no harm) or removed in a later cleanup pass — Google
  // only re-checks if ownership is challenged.
  verification: {
    google: 'kqSyATyhUHmcDShKvUNWK-Ntj3n9qrdB8omXiM6tft0',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-GB"
      className={`${archivo.variable} ${instrumentSerif.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSONLD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSONLD) }}
        />
        <MotionRoot>{children}</MotionRoot>
        <NavTracker />
        {/* WaitlistStickyBar hidden for now alongside the hero form. */}
        <CookieBanner />
      </body>
    </html>
  );
}
