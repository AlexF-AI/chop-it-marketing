import type { Metadata, Viewport } from 'next';
import { Archivo, JetBrains_Mono } from 'next/font/google';
import './styles/globals.css';

import CookieBanner from './components/CookieBanner';
import MotionRoot from './components/MotionRoot';
import NavTracker from './components/NavTracker';
import { assertStoreUrlsValid } from './lib/app-stores';

// Fail the build on a store-URL misconfiguration rather than shipping CTAs
// that go nowhere. NEXT_PUBLIC_* values are inlined at build time, so this
// module-scope call runs during `next build` and a bad value stops the
// deploy — the class of defect that put href="#" in front of paid traffic
// is invisible to lint and typecheck, because it lives in the environment.
assertStoreUrlsValid();

// Archivo carries headings and body copy; JetBrains Mono carries kickers,
// meta rows and numerals. Both are wired to the CSS variables read by
// --ff-display / --ff-sans / --ff-mono in globals.css.
const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-archivo',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

// Both themes ship, so the mobile address bar follows whichever one the
// visitor lands in rather than being pinned to the light background.
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf8f4' },
    { media: '(prefers-color-scheme: dark)', color: '#131110' },
  ],
  colorScheme: 'light dark',
};

// Replays a stored theme choice onto <html> before first paint, so a
// visitor who picked dark on a light-scheme OS never sees a cream flash.
// Kept inline and dependency-free for that reason.
const THEME_INIT = `try{var t=localStorage.getItem('chopit-theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t}}catch(e){}`;

const SITE_DESCRIPTION =
  'The home of AI cooking for UK kitchens. Save recipes from ChatGPT, cookbooks, websites and social, then plan, shop and cook from one library.';

export const metadata: Metadata = {
  title: 'Chop it | The home of AI cooking',
  description: SITE_DESCRIPTION,
  metadataBase: new URL('https://chop-it.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Chop it | The home of AI cooking',
    description: SITE_DESCRIPTION,
    url: 'https://chop-it.com',
    siteName: 'Chop it',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chop it | The home of AI cooking',
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

const ORGANIZATION_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Chop it',
  url: 'https://chop-it.com',
  logo: 'https://chop-it.com/logo.webp',
  description:
    'Chop it is the home of AI cooking: one place to keep recipes, plan the week, build the shop and cook.',
  // The App Store listing is the strongest entity signal available: it ties
  // this Organization to the published app. Instagram + X are still omitted
  // because neither handle could be confirmed live (Instagram rate-limits
  // unauthenticated requests, and x.com returns 200 for any path because it
  // is a single-page app, so neither check proves a profile exists). A sameAs
  // pointing at a profile that does not exist is worse than a shorter list.
  sameAs: [
    'https://chopit.app',
    'https://apps.apple.com/gb/app/chop-it/id6762079343',
    'https://www.tiktok.com/@chop_it',
  ],
};

// Site identity. Google's sitelinks search box was retired, so this deliberately
// omits the obsolete SearchAction markup that used to point at arbitrary ?q=
// result pages.
const WEBSITE_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Chop it',
  url: 'https://chop-it.com',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-GB"
      className={`${archivo.variable} ${jetbrainsMono.variable}`}
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
