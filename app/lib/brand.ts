/**
 * The brand's positioning strings, in one place.
 *
 * "The home of AI cooking" used to live as a hand-typed literal in five
 * files — layout.tsx metadata, the Organization description in entity.ts,
 * the OG image, the footer and the legacy hero. Retiring it meant finding
 * all five, and the next repositioning would have meant the same hunt.
 * Anything that states what Chop it *is* now reads from here.
 *
 * Copy rules this module encodes:
 *
 * - The product is always "Chop it", never "Chop It" — the capitalised
 *   form belongs only to the legal entity in app/terms/page.tsx.
 * - The library size is a rounded floor ("over 1,000"), never a precise
 *   count. The precise count lives in RECIPE_COUNT in featuredRecipes.ts
 *   and moves with the catalogue; a rounded floor in the positioning copy
 *   stays true between catalogue changes.
 */

/** The sign-off. Ends the homepage and carries the brand on its own. */
export const SLOGAN = 'Before you shop it, Chop it.';

/**
 * How big the browsable catalogue is, in copy.
 *
 * Deliberately a floor, not a count: the catalogue is 1,322 published
 * recipes (1,291 of them browsable on /recipes) as of September 2026, so
 * "thousands" would overstate it while "over 1,000" stays true as the
 * catalogue grows.
 */
export const LIBRARY_SIZE = 'over 1,000';

/**
 * The meta description, shared by the page description, Open Graph and
 * the Twitter card so the three can never disagree.
 */
export const SITE_DESCRIPTION =
  'Browse over 1,000 dishes with photos, prep times and step-by-step instructions, save recipes from anywhere, and plan your food week in minutes. Before you shop it, Chop it.';

/**
 * The footer's one-line descriptor.
 *
 * Deliberately NOT the slogan: the closing CTA already signs the page off
 * with SLOGAN, and the footer sits directly beneath it, so repeating the
 * line puts it twice within one screen. This says what Chop it is instead.
 */
export const FOOTER_TAG = 'Meal planning for UK kitchens.';

/** The <title> suffix and the OG/Twitter title. */
export const SITE_TITLE = 'Chop it | Plan your food week in minutes';

/**
 * The Organization node's description. Longer and flatter than
 * SITE_DESCRIPTION: this one is read by knowledge graphs rather than
 * shown in a search result, so it names the surfaces explicitly.
 */
export const ORG_DESCRIPTION =
  'Chop it is a meal planning app and recipe organiser for UK kitchens. Browse over 1,000 dishes with photos, prep times and step-by-step instructions, save recipes from anywhere online or from a cookbook, plan the week and turn it into one shopping list. It runs on iPhone and inside ChatGPT.';
