// Single source of truth for the App Store + Play Store URLs, live flags,
// and App Store campaign tagging.
//
// iOS launch (gb): https://apps.apple.com/gb/app/chop-it/id6762079343
// Android: not live yet — gated by NEXT_PUBLIC_ANDROID_LIVE === 'true'.
//
// URLs are env-var-overridable so we can swap the regional store ID later
// (e.g. ?l=es to point at the Spanish listing) without a code change.

import type { CtaSurface } from '@/lib/posthog-events';

/**
 * The canonical App Store listing, with NO campaign parameters.
 *
 * This is the clean entity URL. It is what the MobileApplication JSON-LD in
 * app/page.tsx feeds Google as `downloadUrl` — structured data describes the
 * app, it is not a click surface, and tracking parameters do not belong in
 * it. Every clickable App Store CTA must use `appStoreUrl(surface)` instead.
 */
export const APP_STORE_URL =
  process.env.NEXT_PUBLIC_APP_STORE_URL ?? 'https://apps.apple.com/gb/app/chop-it/id6762079343';

export const PLAY_STORE_URL = process.env.NEXT_PUBLIC_PLAY_STORE_URL ?? '#';

// IOS_LIVE is true whenever APP_STORE_URL isn't the placeholder '#'. This
// way the moment we yank the URL (or unset the env var) the eyebrow reverts
// to "COMING SOON" rather than dangling a dead Apple link.
export const IOS_LIVE = APP_STORE_URL !== '#';

export const ANDROID_LIVE = process.env.NEXT_PUBLIC_ANDROID_LIVE === 'true';

// Apple App Analytics campaign attribution.
//
// Every clickable App Store link carries `ct=<cta_location>`, using the exact
// same surface token the `cta_clicked` PostHog event reports. That is the
// whole point: a click counted on `homepage_hero` in PostHog lands in the
// `homepage_hero` campaign in App Analytics, so on-site CTA volume and store
// impressions/installs reconcile surface-for-surface without a mapping table.
//
// `pt` is the App Store Connect provider token (Users and Access →
// Integrations). It is optional here: when it is not set we ship `ct` + `mt`
// alone, which still segments in App Analytics. We deliberately do NOT emit
// an empty `pt=` — Apple treats a blank token as a malformed campaign link.
//
// `mt=8` is Apple's media type for iOS apps.
const APPLE_PROVIDER_TOKEN = process.env.NEXT_PUBLIC_APPLE_PROVIDER_TOKEN;

/**
 * Builds the campaign-tagged App Store URL for a CTA surface.
 *
 * Pure string construction evaluated at build time — the result is inlined
 * into the server-rendered HTML, so the href is present before any client
 * JS runs. Callers must gate on IOS_LIVE; if the base URL is unusable this
 * returns it untouched rather than throwing, and `assertStoreUrlsValid()`
 * is what fails the build in that case.
 */
export function appStoreUrl(surface: CtaSurface): string {
  let url: URL;
  try {
    url = new URL(APP_STORE_URL);
  } catch {
    return APP_STORE_URL;
  }

  if (APPLE_PROVIDER_TOKEN) url.searchParams.set('pt', APPLE_PROVIDER_TOKEN);
  url.searchParams.set('ct', surface);
  url.searchParams.set('mt', '8');

  return url.toString();
}

// The homepage's small "Android coming later" line. Off by default: the design
// package is explicit that no Android timing is published until the release
// plan is confirmed, and "later" is still a claim. Opt in when it is.
export const SHOW_ANDROID_NOTE =
  process.env.NEXT_PUBLIC_SHOW_ANDROID_NOTE === 'true';

// Chop It in ChatGPT — the Apps SDK app in the ChatGPT app directory
// (replaces the old "Weekly Food Shop Planner" Custom GPT). Primary entry
// surface for the ChatGPT-first positioning; the App Store remains the
// download/monetisation destination. Env-overridable so we can swap the
// app id without a code change — if NEXT_PUBLIC_CHATGPT_URL is set in
// Vercel, it must be updated there too.
export const CHATGPT_URL =
  process.env.NEXT_PUBLIC_CHATGPT_URL ??
  'https://chatgpt.com/plugins/plugin_asdk_app_6a1c0dfa60b88191b3360153a1c6613c';

export const CHATGPT_LIVE = CHATGPT_URL !== '#';
