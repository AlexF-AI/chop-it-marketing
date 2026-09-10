// Session-entry traffic source for chop-it.com.
//
// The problem this solves: ChatGPT (and every other AI assistant) appends
// `utm_source=chatgpt.com` to the LANDING url only. The moment a visitor
// clicks a second link on the site, the query string is gone and every
// downstream event, outbound link and store campaign looks like `direct`.
// Since mid-August AI assistants have been 40-65% of UK visitors, so that
// loss is most of the interesting traffic.
//
// Fix: pin the entry utm_source + referrer to the tab on first paint, then
// classify from the pinned value for the rest of the session.
//
// WHY NOT posthog's `$session_entry_*` PROPERTIES
// posthog-js already derives `$session_entry_utm_source` /
// `$session_entry_referring_domain` from the same two inputs and attaches
// them to every event (see posthog-js `src/session-props.ts`). Those are
// great for querying in PostHog and we still get them for free. They are
// not usable HERE because there is no supported read API for them:
// `posthog.getSessionProperty()` reads `register_for_session` super
// properties, NOT these — the SDK's own docblock says so ("based on
// browser-level sessionStorage, NOT the PostHog session"). Reading them
// means reaching into `posthog.sessionPropsManager`, which is an internal
// field that a minor SDK bump can rename. We need the value in JS at click
// time to rewrite hrefs, so we keep our own copy.
//
// WHY sessionStorage AND NOT A COOKIE
// It is first-party, session-scoped, never travels on an HTTP request, and
// needs no cookie-banner change. It survives reloads and both hard and soft
// (next/link) navigation within the tab, which is the requirement. A link
// opened in a NEW tab starts a new session, which is the correct semantics
// anyway. Swap in a cookie only if this ever needs to be readable
// server-side or shared across tabs.
//
// This module is deliberately dependency-free and DOM-optional: every pure
// function below is unit-tested under `node --test` with no DOM present.

export type TrafficSource =
  | 'chatgpt'
  | 'perplexity'
  | 'copilot'
  | 'claude'
  | 'gemini'
  | 'google'
  | 'bing'
  | 'direct'
  | 'other';

/**
 * The single classification table. Order matters and is load-bearing:
 * `gemini.google` MUST be tested before the bare `google` rule or every
 * Gemini referral is miscounted as organic search.
 *
 * Substring matching (not host equality) is intentional — the same rule has
 * to catch `www.perplexity.ai`, `perplexity.ai` and `utm_source=perplexity`,
 * and Copilot arrives from several Microsoft hosts.
 */
const SOURCE_MATCHERS: ReadonlyArray<readonly [match: string, source: TrafficSource]> = [
  ['chatgpt.com', 'chatgpt'],
  ['openai.com', 'chatgpt'],
  ['perplexity', 'perplexity'],
  ['copilot', 'copilot'],
  ['claude.ai', 'claude'],
  ['gemini.google', 'gemini'],
  ['google', 'google'],
  ['bing', 'bing'],
];

/** Our own hosts. An entry referrer on one of these is not a real source. */
const INTERNAL_HOST_RE = /(^|\.)chop-it\.com$/i;

function matchSource(value: string): TrafficSource | null {
  const haystack = value.toLowerCase();
  for (const [match, source] of SOURCE_MATCHERS) {
    if (haystack.includes(match)) return source;
  }
  return null;
}

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export type EntrySource = {
  /** `utm_source` from the landing URL's query string, if it had one. */
  utmSource: string | null;
  /** `document.referrer` at landing, if there was one. */
  referrer: string | null;
};

/**
 * Classify a session entry. Pure — no DOM, no storage.
 *
 * Precedence is utm_source first, then the referring host, per the spec. A
 * PRESENT-BUT-UNRECOGNISED utm_source resolves to `other` rather than
 * falling through to the referrer: the visitor arrived on a deliberately
 * tagged link (a newsletter, a paid campaign) and the referrer would
 * describe the click host, not the campaign.
 */
export function classifyTrafficSource(entry: EntrySource): TrafficSource {
  const utmSource = entry.utmSource?.trim();
  if (utmSource) return matchSource(utmSource) ?? 'other';

  const referrer = entry.referrer?.trim();
  if (!referrer) return 'direct';

  const host = hostOf(referrer);
  if (!host) return 'other';
  // A same-site entry referrer means the pin was written on an internal
  // navigation rather than a real landing. Treat as direct, not as a source.
  if (INTERNAL_HOST_RE.test(host)) return 'direct';

  return matchSource(host) ?? 'other';
}

// ---------------------------------------------------------------------------
// Browser side: pin the entry source to the tab.
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'chopit_entry_source';

type StoredEntry = { u: string | null; r: string | null };

function readStored(): EntrySource | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredEntry;
    return {
      utmSource: typeof parsed.u === 'string' ? parsed.u : null,
      referrer: typeof parsed.r === 'string' ? parsed.r : null,
    };
  } catch {
    // Malformed JSON, or sessionStorage throwing outright (privacy modes
    // and some embedded webviews do). Treat as "nothing pinned".
    return null;
  }
}

/**
 * Pin the current page's utm_source + referrer as the session entry, ONCE
 * per tab. Call this as early as possible on first paint.
 *
 * Write-once is the whole mechanism: because a second call is a no-op, the
 * stored value stays whatever the LANDING page saw, and every subsequent
 * navigation — which has neither the utm param nor the external referrer —
 * leaves it untouched.
 */
export function captureEntrySource(): void {
  if (typeof window === 'undefined') return;
  if (readStored()) return;

  try {
    const entry: StoredEntry = {
      u: new URLSearchParams(window.location.search).get('utm_source'),
      r: document.referrer || null,
    };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  } catch {
    // Storage unavailable. getTrafficSource() falls back to reading the
    // live URL/referrer, which is still correct on the landing page itself.
  }
}

/** Drop the pin. Called when a visitor declines analytics. */
export function forgetEntrySource(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing we can do, and nothing we need to do */
  }
}

/**
 * The session's traffic source. Reads the pin; falls back to the live URL
 * and referrer when storage is unavailable (correct on a landing page,
 * degrades to `direct` deeper into the session — better than throwing).
 */
export function getTrafficSource(): TrafficSource {
  if (typeof window === 'undefined') return 'direct';

  const stored = readStored();
  if (stored) return classifyTrafficSource(stored);

  return classifyTrafficSource({
    utmSource: new URLSearchParams(window.location.search).get('utm_source'),
    referrer: document.referrer || null,
  });
}

// ---------------------------------------------------------------------------
// URL builders. Both pure, both unit-tested.
// ---------------------------------------------------------------------------

/**
 * Appends chop-it.com attribution params to an outbound chopit.app URL.
 *
 * NOT WIRED TO ANY LINK YET — deliberately. The only chopit.app links on
 * the site today are the deep links on the /m/<code> share pages, and share
 * traffic does not arrive from AI answers, so tagging them would add noise
 * and no signal. This ships now, tested, so the cornerstone CTA block can
 * use it the day it lands.
 *
 * Existing query params and the hash fragment are preserved. A URL that
 * already carries ANY utm param is returned untouched: something upstream
 * has already claimed attribution and clobbering it would silently rewrite
 * a real campaign.
 */
export function buildAppUrl(
  href: string,
  options: { source?: TrafficSource | null; ctaLocation?: string | null } = {},
): string {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return href;
  }

  for (const key of url.searchParams.keys()) {
    if (key.toLowerCase().startsWith('utm_')) return href;
  }

  url.searchParams.set('utm_source', 'chop-it.com');
  url.searchParams.set('utm_medium', 'referral');
  // Omit rather than emit an empty value: a blank utm_campaign is a
  // reporting row that looks like data and is not.
  if (options.source) url.searchParams.set('utm_campaign', options.source);
  if (options.ctaLocation) url.searchParams.set('utm_content', options.ctaLocation);

  return url.toString();
}

/** Apple truncates campaign tokens past 40 characters. */
export const APPLE_CT_MAX_LENGTH = 40;

/**
 * Upgrades an App Store link's `ct=` campaign token with the traffic source.
 *
 * The server-rendered href already carries `ct=<cta_location>` (built at
 * build time by appStoreUrl()) because the surface is known then and the
 * source is not. This runs at click time, when the source IS known, and
 * rewrites the token to `web-<source>-<surface>`. A visitor with JS off
 * still gets the surface-only campaign rather than nothing.
 *
 * Returns the href untouched unless it is an App Store link for OUR app —
 * the cornerstone comparison article links to nine competitors' listings
 * and we must not tag those.
 */
export function appStoreCampaignUrl(
  href: string,
  options: { appId: string | null; source: TrafficSource; surface?: string | null },
): string {
  const { appId, source, surface } = options;
  if (!appId) return href;

  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return href;
  }

  if (!/(^|\.)apple\.com$/i.test(url.hostname)) return href;
  // `/gb/app/chop-it/id6762079343` — the id segment is what identifies the
  // app regardless of storefront locale or slug.
  if (!url.pathname.includes(`id${appId}`)) return href;

  const existing = url.searchParams.get('ct');
  // Idempotent: a second click on the same anchor (we rewrite the live DOM
  // href) must not produce `web-chatgpt-web-chatgpt-homepage_hero`.
  if (existing?.startsWith('web-')) return url.toString();

  const base = existing ?? surface ?? null;
  let ct = base ? `web-${source}-${base}` : `web-${source}`;
  if (ct.length > APPLE_CT_MAX_LENGTH) {
    // Drop the surface rather than truncate mid-token — a sliced token is
    // an unreadable campaign row, whereas `web-<source>` is still a real
    // answer to "did AI traffic install?". `web-perplexity` is 14 chars,
    // so this branch can never itself overflow.
    ct = `web-${source}`;
  }

  url.searchParams.set('ct', ct);
  // Markdown links are bare listing URLs with no campaign params at all.
  // mt=8 is Apple's media type for iOS apps and is required alongside ct.
  if (!url.searchParams.has('mt')) url.searchParams.set('mt', '8');

  return url.toString();
}

// ---------------------------------------------------------------------------
// Inline-link surfaces.
// ---------------------------------------------------------------------------

/**
 * cta_location for a link inside a markdown article body, inferred from the
 * route. Inline links have no component to pass an explicit surface, and
 * "which content section" is the dimension that is actually useful for them
 * — the exact paragraph is carried by `page_path` instead.
 */
export function inlineSurfaceForPath(
  pathname: string,
): 'inline_blog' | 'inline_learn' | 'inline_research' | 'inline_features' | 'inline_other' {
  if (pathname.startsWith('/blog/')) return 'inline_blog';
  if (pathname.startsWith('/learn/')) return 'inline_learn';
  if (pathname.startsWith('/research/')) return 'inline_research';
  if (pathname.startsWith('/features/')) return 'inline_features';
  return 'inline_other';
}
