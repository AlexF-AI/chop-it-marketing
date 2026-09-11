'use client';

// Typed PostHog event helpers for the chop-it.com marketing site.
//
// This module is the single source of truth for event names + property
// shapes. Components import these helpers instead of calling
// posthog.capture inline — keeps the event taxonomy reviewable in one
// place and the call sites editor-discoverable.
//
// PostHog is initialised by instrumentation-client.ts (wizard install).
// Do NOT call posthog.init here.

import posthog from 'posthog-js';

import { getTrafficSource, type TrafficSource } from './traffic-source';

// Capture options for anything fired from a click that then navigates.
//
// `send_instantly` is the part that does the work: without options, capture()
// drops the event into the 3s batch queue, which a same-tab navigation can
// beat. With it, the request goes straight to _send_retriable_request, and
// posthog's fetch transport sets `keepalive: true` on POSTs under 64KB, so
// the in-flight request survives the page teardown.
//
// `transport: 'sendBeacon'` is the documented way to ask for the beacon API
// and is what the spec calls for, so it is stated here — but be aware it is
// a NO-OP in posthog-js 1.373.5: capture() builds its requestOptions from
// `_url`/`_batchKey` only and never forwards `transport` (posthog's own
// $pageleave capture hits the same gap). Keep it; when upstream forwards the
// option this starts working with no change here. Until then `keepalive` is
// what actually gets the event out, which the network-tab evidence confirms.
const BEFORE_NAVIGATION = { transport: 'sendBeacon', send_instantly: true } as const;

/**
 * Every CTA and outbound event carries the session's entry source, so a
 * click can be attributed to the AI assistant that sent the visitor even
 * though `utm_source` was gone after the first navigation.
 *
 * Stamped here rather than at the call sites: a call site that forgets it
 * produces a silently unattributed click, and there is no way to tell that
 * apart from a genuinely direct one after the fact.
 */
function captureBeforeNavigation(event: string, properties: Record<string, unknown>): void {
  posthog.capture(
    event,
    { ...properties, traffic_source: getTrafficSource() },
    BEFORE_NAVIGATION,
  );
}

export type { TrafficSource };

// Where on the site the CTA lives. Add to this union when adding a new
// surface — the literal type forces every call site to be explicit and
// keeps the dashboard groupings clean.
export type CtaLocation =
  | 'nav'
  | 'mobile_menu'
  | 'hero'
  | 'download_cta'
  | 'recipe_page'
  | 'blog_cta'
  // A bare App Store link inside a markdown article body, tagged and
  // counted by the global listener rather than by a component.
  | 'inline_article';

export type StoreClickProps = {
  recipe_slug?: string;
  recipe_title?: string;
  location: CtaLocation;
};

export type RecipeViewProps = {
  recipe_id: string;
  recipe_slug: string;
  recipe_title: string;
  cuisine: string | null;
  season: string | null;
  cost_band: string | null;
  has_nutrition: boolean;
  // Referrer enrichment, computed at mount time by RecipeViewTracker:
  //  - referrer: raw document.referrer or 'direct'
  //  - referrer_domain: parsed hostname for funnel grouping ('direct' if none)
  //  - search_engine_referrer: regex match against common search hosts —
  //    a cheap organic-vs-other split that doesn't depend on UTM tagging
  //  - entry_path: window.location.pathname at mount, useful when the recipe
  //    page was deep-linked vs reached via /recipes hub navigation
  referrer: string;
  referrer_domain: string;
  search_engine_referrer: boolean;
  entry_path: string;
};

export function trackAppStoreClick(props: StoreClickProps): void {
  captureBeforeNavigation('app_store_click', props);
}

export function trackPlayStoreClick(props: StoreClickProps): void {
  posthog.capture('play_store_click', props);
}

export function trackRecipeView(props: RecipeViewProps): void {
  posthog.capture('recipe_view', props);
}

// `cta_clicked` is the single event for every on-site CTA. It used to fire
// alongside per-surface duplicates (`nav_cta_click`, `chatgpt_click`) that
// doubled every CTA metric; those are gone. Anything measuring CTA volume
// pivots on `cta_location` here.
//
// `chatgpt_click` stays gone. It was reconsidered when the ChatGPT funnel
// went dark and rejected again for the same reason: it fires on the same
// click as `cta_clicked` and would re-inflate every ChatGPT CTA ~2x, this
// time breaking comparability across the AI Search dashboard's own history.
// "ChatGPT click" is `cta_clicked where cta_destination = 'chatgpt_plugin'`.
// The reason that filter returned nothing before this change was coverage,
// not the event name: the nine inline plugin links in article bodies fired
// nothing at all. The global listener now covers them.
//
// Closed enum: extend this union when adding a new surface; ad-hoc string
// values are rejected at compile time so dashboards don't accumulate
// typo'd variants. The same values are used as the App Store `ct=`
// campaign token (see app/lib/app-stores.ts) so PostHog clicks and Apple
// App Analytics reconcile surface-for-surface.
export type CtaSurface =
  | 'homepage_hero'
  | 'homepage_secondary'
  | 'homepage_chatgpt_panel'
  | 'header_nav'
  | 'mobile_menu'
  | 'footer'
  | 'recipe_page_inline'
  | 'recipe_page_footer'
  | 'blog_footer'
  | 'resource_footer'
  // Links inside markdown article bodies. These have no component to pass
  // an explicit surface, so the global listener in instrumentation-client.ts
  // derives one from the route and sends `page_path` for the exact article.
  // NEVER pass an inline_* value to appStoreUrl(): those tokens are the
  // build-time `ct=` campaign, and inline links are tagged at click time.
  | 'inline_blog'
  | 'inline_learn'
  | 'inline_research'
  | 'inline_features'
  | 'inline_other'
  // The "Use it in your browser" CTA for the web app, which is a third
  // destination alongside the App Store and ChatGPT rather than a variant
  // of either. Its own surfaces so the PWA path is separable in the
  // dashboard from the install and ChatGPT paths that sit beside it in the
  // same block. Like the inline_* values these are NEVER passed to
  // appStoreUrl(): there is no App Store campaign for a web-app click.
  | 'homepage_pwa'
  | 'blog_pwa';

/**
 * Stable destination tokens.
 *
 * `chatgpt_plugin` is a LITERAL, not the URL: every ChatGPT CTA used to send
 * the full plugin URL as cta_destination, which meant the dashboard grouped
 * on a 60-character string that changes whenever NEXT_PUBLIC_CHATGPT_URL is
 * swapped. One token means one row.
 *
 * `pwa` is the web app at chopit.app, for the same reason: the href carries
 * utm params rewritten at click time by buildAppUrl(), so the URL is
 * different on every click and useless as a grouping key.
 */
export type CtaDestination = 'chatgpt_plugin' | 'pwa' | (string & {});

export type CtaClickedProps = {
  cta_location: CtaSurface;
  cta_label: string;
  cta_destination: CtaDestination;
  /** Set for inline article links; the article the link was in. */
  page_path?: string;
};

export function trackCtaClicked(props: CtaClickedProps): void {
  captureBeforeNavigation('cta_clicked', props);
}

// Outbound link tracking — fired automatically by the global click listener
// in instrumentation-client.ts. Exposed here so any imperative call sites
// (e.g. a programmatic window.location assignment) can fire the same event.
export type OutboundDestination = 'app' | 'tiktok' | 'instagram' | 'x' | 'twitter';

export function trackOutboundToApp(props: { from_url: string; to_url: string }): void {
  captureBeforeNavigation('outbound_to_app', props);
}

export function trackOutboundToSocial(props: {
  platform: OutboundDestination;
  from_url: string;
  to_url: string;
}): void {
  posthog.capture('outbound_to_social', props);
}

// Waitlist taxonomy — the v1 conversion funnel.
//
// `location` distinguishes the hero form from the sticky footer bar, so
// the dashboard can pivot conversion rate by surface without needing
// extra autocapture.

export type WaitlistLocation = 'hero' | 'footer_sticky';

export type WaitlistAttemptedProps = {
  location: WaitlistLocation;
  has_email: boolean;
};

export type WaitlistSucceededProps = {
  location: WaitlistLocation;
  already_subscribed: boolean;
};

export type WaitlistFailedProps = {
  location: WaitlistLocation;
  error_type:
    | 'invalid_email'
    | 'turnstile_failed'
    | 'network_error'
    | 'submission_failed'
    | 'unknown';
};

export function trackWaitlistSubmitAttempted(props: WaitlistAttemptedProps): void {
  posthog.capture('waitlist_submit_attempted', props);
}

export function trackWaitlistSubmitSucceeded(props: WaitlistSucceededProps): void {
  posthog.capture('waitlist_submit_succeeded', props);
}

export function trackWaitlistSubmitFailed(props: WaitlistFailedProps): void {
  posthog.capture('waitlist_submit_failed', props);
}

export function trackWaitlistStickyShown(): void {
  posthog.capture('waitlist_sticky_shown');
}

export function trackWaitlistStickyDismissed(): void {
  posthog.capture('waitlist_sticky_dismissed');
}

// Interactive phone demo on the homepage. The three tabs simulate the
// real app's This Week / Shop / Pantry surfaces; events here let us
// measure tab engagement, which recipes converted to a detail click, and
// whether the search bar produced a real /recipes?q= navigation.

export type DemoTab = 'this_week' | 'shop' | 'pantry';

export function trackDemoTabSwitched(props: { tab: DemoTab }): void {
  posthog.capture('demo_tab_switched', props);
}

export function trackDemoRecipeClicked(props: { slug: string; tab: DemoTab }): void {
  posthog.capture('demo_recipe_clicked', props);
}

export function trackDemoSearchSubmitted(props: { query_length: number }): void {
  posthog.capture('demo_search_submitted', props);
}

/**
 * Sets the Person profile for an identified waitlist member. Called on
 * successful submission. Combined with the `identified_only` person
 * profile setting in instrumentation-client.ts, this is also what
 * promotes the visitor from anonymous → person in PostHog.
 */
export function setWaitlistMemberPersonProperties(): void {
  posthog.setPersonProperties({
    waitlist_member: true,
    waitlist_joined_at: new Date().toISOString(),
  });
}
