import type { Metadata, Viewport } from 'next';
import { Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import './styles/globals.css';

import CookieBanner from './components/CookieBanner';
import MotionRoot from './components/MotionRoot';
import NavTracker from './components/NavTracker';

// Hybrid type system: Instrument Serif for display headings, JetBrains Mono for meta/numerals,
// system-ui stack for body copy so we match the PWA visually (PWA is system-font-only under CSP).
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

// Light theme — browser chrome (mobile address bar, etc.) matches the cream
// background from globals.css.
export const viewport: Viewport = {
  themeColor: '#fbf5ec',
  colorScheme: 'light',
};

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
      className={`${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
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
