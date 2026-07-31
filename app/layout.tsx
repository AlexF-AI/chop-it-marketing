import type { Metadata, Viewport } from 'next';
import { Archivo, JetBrains_Mono } from 'next/font/google';
import './styles/globals.css';

import CookieBanner from './components/CookieBanner';
import MotionRoot from './components/MotionRoot';
import NavTracker from './components/NavTracker';

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

export const metadata: Metadata = {
  title: 'Chop it — Every recipe you’ve saved, in one place, inside ChatGPT',
  description:
    'Chop It gathers the recipes you’ve saved from books, websites and socials into one library. Plan the week and write the shopping list inside ChatGPT — it’s all waiting in the iPhone app.',
  metadataBase: new URL('https://chop-it.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Chop it — Every recipe you’ve saved, in one place, inside ChatGPT',
    description:
      'Books, websites, socials — one recipe library. Plan the week and write the shop inside ChatGPT; everything you save is waiting in the app.',
    url: 'https://chop-it.com',
    siteName: 'Chop it',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chop it — Every recipe you’ve saved, in one place, inside ChatGPT',
    description:
      'Books, websites, socials — one recipe library. Plan the week and write the shop inside ChatGPT; everything you save is waiting in the app.',
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
    'Chop it plans your week, writes the shop, and quietly coaches you toward more varied, plant-forward eating.',
  // Instagram + X handles are noted as inactive — add them here when they go live.
  sameAs: ['https://chopit.app', 'https://www.tiktok.com/@chop_it'],
};

// WebSite + SearchAction — declares the on-site recipe search so Google can
// surface a sitelinks search box on branded queries. The target maps to the
// /recipes hub's ?q= search param.
const WEBSITE_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Chop It',
  url: 'https://chop-it.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://chop-it.com/recipes?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
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
