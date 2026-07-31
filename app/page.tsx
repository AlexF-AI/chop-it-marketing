import Home from './components/Home';
import Pantry from './components/home/Pantry';
import RecipeRail from './components/home/RecipeRail';
import { APP_STORE_URL } from './lib/app-stores';
import { serializeJsonLd, SITE_ORIGIN } from './lib/recipeSchema';

export const revalidate = 3600;

// MobileApplication JSON-LD — declares the chop-it.com ↔ App Store entity
// link explicitly to Google. Lives only on the homepage (not layout.tsx,
// which would put it on every page including /recipes/[slug] where the
// Recipe schema is the primary). Coexists with the Organization schema
// in layout.tsx; both are valid as separate top-level @types.
//
// applicationCategory: "LifestyleApplication" is Schema.org's closest
// match for a meal-planning app — "FoodAndDrink" is NOT a valid value
// for this field. operatingSystem stays "iOS" until Android ships;
// then either append ", Android" here or emit a second
// MobileApplication block.
//
// No aggregateRating / review — same rule as recipes, no synthetic
// ratings.
const MOBILE_APP_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'MobileApplication',
  name: 'Chop It',
  operatingSystem: 'iOS',
  applicationCategory: 'LifestyleApplication',
  url: SITE_ORIGIN,
  downloadUrl: APP_STORE_URL,
  author: {
    '@type': 'Organization',
    name: 'Chop It AI Ltd',
    url: SITE_ORIGIN,
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'GBP',
  },
};

export default function Page() {
  // The rail and the pantry block both query Supabase, so they stay server
  // components and get handed into the otherwise-static page shell.
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(MOBILE_APP_JSONLD) }}
      />
      <Home recipeRail={<RecipeRail />} pantry={<Pantry />} />
    </>
  );
}
