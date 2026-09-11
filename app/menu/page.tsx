// /menu — build a menu on the web and mint a /m/<code> share link.
//
// The web half of the app's share-a-menu feature, and an acquisition loop in
// its own right: someone builds a menu here, sends the link, and the
// recipient lands on /m/<code> — a page that already exists and already
// renders whatever this mints.
//
// The "All" pool is server-rendered so the list is populated on first paint
// and is indexable; tapping a cuisine chip swaps it through
// /api/menu/recipes. Minting goes through /api/menu/share, which is the only
// write path the marketing site has.

import type { Metadata } from 'next';

import Footer from '@/app/components/Footer';
import Nav from '@/app/components/Nav';
import MenuBuilder from '@/app/components/menu/MenuBuilder';
import { getMenuCuisineChips, getPickableRecipes } from '@/app/lib/menuBuilder';
import { SITE_ORIGIN } from '@/app/lib/recipeSchema';

// The pool moves only when the catalogue does.
export const revalidate = 3600;

const APP_DEEP_LINK_BASE = 'https://chopit.app/m';

const TITLE = 'Build a menu and share the link · Chop it';
const DESCRIPTION =
  'Pick a few dinners, name the menu, and get one link that opens the whole thing — recipes, timings and a combined shopping list — in Chop it.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_ORIGIN}/menu` },
  openGraph: {
    type: 'website',
    url: `${SITE_ORIGIN}/menu`,
    title: TITLE,
    description: DESCRIPTION,
    siteName: 'Chop it',
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

export default async function MenuPage() {
  const [initialRecipes, cuisines] = await Promise.all([
    getPickableRecipes(null),
    Promise.resolve(getMenuCuisineChips()),
  ]);

  return (
    <>
      <Nav />
      <main>
        <MenuBuilder
          initialRecipes={initialRecipes}
          cuisines={cuisines}
          siteOrigin={SITE_ORIGIN}
          appDeepLinkBase={APP_DEEP_LINK_BASE}
        />
      </main>
      <Footer />
    </>
  );
}
