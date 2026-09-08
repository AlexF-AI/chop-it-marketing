// Canonical entity graph for the Chop it brand.
//
// One organisation publishes across two domains: this marketing site
// (chop-it.com) and the web app (chopit.app). Search engines decide for
// themselves which URL represents the "Chop it" entity — today they pick
// the app — but they can only treat the two as ONE entity if both sites
// describe the same node.
//
// Before this module the site emitted three anonymous Organization nodes
// under two different names: "Chop it" in layout.tsx, "Chop it" again in
// the Recipe author, and "Chop It AI Ltd" in the homepage
// MobileApplication author. None carried an @id, so a consumer had to
// infer identity from matching `url` strings, and the differing names
// worked against even that.
//
// Everything now hangs off one stable @id. That same @id is what the
// chopit.app codebase must emit for both domains to resolve to a single
// entity — see docs/entity-alignment.md for the other half of this.

export const SITE_ORIGIN = 'https://chop-it.com';

// The web app lives on its own domain and is the stronger brand signal of
// the two: `chopit` matches the spoken name where `chop-it` does not.
// Declared here so the cross-domain identity claim has a single source.
export const WEB_APP_ORIGIN = 'https://chopit.app';

// Fragment @ids, not page URLs: the organisation is not the homepage, and
// giving it the bare origin would collide with the WebSite node.
export const ORG_ID = `${SITE_ORIGIN}/#organization`;
export const WEBSITE_ID = `${SITE_ORIGIN}/#website`;

/**
 * Reference to the canonical Organization, for use as `author`,
 * `publisher` or `provider` on any other node.
 *
 * Emitting this instead of a fresh inline `{'@type': 'Organization', …}`
 * is the whole point of the module: a repeated inline node is a NEW
 * anonymous entity every time, so the same company appears as several
 * unrelated organisations across the site. The Organization node itself
 * ships in layout.tsx on every page, so a bare @id reference always
 * resolves.
 */
export const orgRef = { '@id': ORG_ID } as const;

/** A JSON-LD node referenced by @id rather than inlined. */
export type EntityRef = { '@id': string };

export const ORGANIZATION_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': ORG_ID,
  name: 'Chop it',
  // The legal entity named in app/terms/page.tsx. Carrying it here as a
  // property — rather than as a separate node with its own name, which is
  // what the homepage used to emit — keeps trading name and legal name on
  // one entity instead of splitting the brand across two.
  legalName: 'Chop It AI Ltd',
  url: SITE_ORIGIN,
  // ImageObject rather than a bare URL string: Article/BlogPosting
  // publishers reference this node instead of inlining their own, and
  // Google's article guidance expects a publisher logo it can resolve.
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_ORIGIN}/logo.webp`,
  },
  description:
    'Chop it is an AI meal planning platform and recipe organiser: one place to keep recipes from any source, plan the week, build the shop and cook. It runs on iPhone and inside ChatGPT.',
  // Entity reinforcement for knowledge graphs: the topics this organisation
  // publishes on, matching the Learn and Research sections. Terms mirror the
  // wording used across the site so the entity stays consistent.
  knowsAbout: [
    'AI meal planning',
    'AI cooking',
    'AI shopping lists',
    'recipe organisation',
    'ChatGPT for cooking',
    'food waste reduction',
  ],
  // Identity claims, not content links. The web app is first because the
  // two-domain split is the weakest point in this entity: chopit.app
  // currently outranks chop-it.com for the brand term while linking
  // nothing back, so a consumer following only on-page links sees two
  // unrelated sites with the same name.
  //
  // The App Store listing is the strongest third-party entity signal
  // available: it ties this Organization to the published app. Instagram
  // and X are still omitted because neither handle could be confirmed live
  // (Instagram rate-limits unauthenticated requests, and x.com returns 200
  // for any path because it is a single-page app, so neither check proves
  // a profile exists). A sameAs pointing at a profile that does not exist
  // is worse than a shorter list.
  sameAs: [
    WEB_APP_ORIGIN,
    'https://apps.apple.com/gb/app/chop-it/id6762079343',
    'https://www.tiktok.com/@chop_it',
  ],
};

// Site identity. Google's sitelinks search box was retired, so this
// deliberately omits the obsolete SearchAction markup that used to point
// at arbitrary ?q= result pages.
export const WEBSITE_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: 'Chop it',
  url: SITE_ORIGIN,
  publisher: orgRef,
};
