import Footer from './components/Footer';
import Nav from './components/Nav';
import { BrowseTheWeek } from './components/homepage/BrowseTheWeek';
import { FinalCTA } from './components/homepage/FinalCTA';
import { Hero } from './components/homepage/Hero';
import { InChatGPT } from './components/homepage/InChatGPT';
import { OneLibrary } from './components/homepage/OneLibrary';
import RecipeProof from './components/homepage/RecipeProof';
import { RecipeToDinner } from './components/homepage/RecipeToDinner';
import { APP_STORE_URL } from './lib/app-stores';
import { orgRef } from './lib/entity';
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
  name: 'Chop it',
  operatingSystem: 'iOS',
  applicationCategory: 'LifestyleApplication',
  // Verified GB-only: an App Store lookup for id6762079343 returns the app on
  // the gb storefront and resultCount 0 on us, ie, au, ca, de and fr. Worth
  // declaring rather than leaving Google to infer availability, since a US
  // searcher cannot install this.
  countriesSupported: 'GB',
  url: SITE_ORIGIN,
  downloadUrl: APP_STORE_URL,
  // Reference to the canonical Organization rather than a second inline
  // node. This block used to name the company 'Chop It AI Ltd' while the
  // site-wide node named it 'Chop it', which published the same company
  // as two unrelated organisations. The legal name is now a `legalName`
  // property on the one node.
  author: orgRef,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'GBP',
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(MOBILE_APP_JSONLD) }}
      />
      <Nav />
      <main>
        <Hero />
        <BrowseTheWeek />
        <OneLibrary />
        <RecipeToDinner />
        <InChatGPT />
        {/* Server component — reads the featured recipes from Supabase. */}
        <RecipeProof />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
