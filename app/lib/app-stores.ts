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
 * Env vars are strings, so "unset" and "set but blank" are different values
 * and `??` only falls back on the first. That distinction shipped a live
 * trap: .env.example documented `NEXT_PUBLIC_APP_STORE_URL=` (blank) as
 * meaning "use the fallback", but a blank value in Vercel would have
 * resolved every store CTA on the site to href="" — and, because "" is not
 * the '#' placeholder the old IOS_LIVE test looked for, left IOS_LIVE true
 * so the degrade-gracefully path never engaged.
 *
 * Blank is now treated as unset everywhere.
 */
function readEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function readFlag(value: string | undefined, fallback: boolean): boolean {
  const raw = readEnv(value)?.toLowerCase();
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return fallback;
}

/**
 * A store URL is usable only if it is an absolute http(s) URL. This replaces
 * the old `!== '#'` test, which passed anything that wasn't literally a hash
 * — including '', '/', and a half-edited env value.
 */
function isLiveStoreUrl(url: string | null): url is string {
  if (!url) return false;
  try {
    const { protocol } = new URL(url);
    return protocol === 'https:' || protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * The canonical App Store listing, with NO campaign parameters.
 *
 * This is the clean entity URL. It is what the MobileApplication JSON-LD in
 * app/page.tsx feeds Google as `downloadUrl` — structured data describes the
 * app, it is not a click surface, and tracking parameters do not belong in
 * it. Every clickable App Store CTA must use `appStoreUrl(surface)` instead.
 */
export const APP_STORE_URL =
  readEnv(process.env.NEXT_PUBLIC_APP_STORE_URL) ??
  'https://apps.apple.com/gb/app/chop-it/id6762079343';

/**
 * null, not '#'. There is no Play listing yet, and a placeholder string is
 * indistinguishable from a real destination once it has been passed through
 * a few components — that is exactly how a CTA ends up reporting
 * cta_destination '#'. Absent is modelled as absent.
 */
export const PLAY_STORE_URL = readEnv(process.env.NEXT_PUBLIC_PLAY_STORE_URL) ?? null;

/**
 * Live flags require BOTH an explicit opt-in and a usable URL, so neither
 * half can dangle a dead CTA on its own: flipping NEXT_PUBLIC_ANDROID_LIVE
 * without setting a Play URL now renders nothing rather than a link to '#'.
 *
 * NEXT_PUBLIC_IOS_LIVE is the kill switch that yanking the URL used to
 * provide. It defaults to true; set it to 'false' to pull every App Store
 * CTA and fall the nav back to the /#download anchor.
 */
export const IOS_LIVE =
  readFlag(process.env.NEXT_PUBLIC_IOS_LIVE, true) && isLiveStoreUrl(APP_STORE_URL);

export const ANDROID_LIVE =
  readFlag(process.env.NEXT_PUBLIC_ANDROID_LIVE, false) && isLiveStoreUrl(PLAY_STORE_URL);

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
const APPLE_PROVIDER_TOKEN = readEnv(process.env.NEXT_PUBLIC_APPLE_PROVIDER_TOKEN);

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
export const SHOW_ANDROID_NOTE = readFlag(process.env.NEXT_PUBLIC_SHOW_ANDROID_NOTE, false);

// Chop It in ChatGPT — the Apps SDK app in the ChatGPT app directory
// (replaces the old "Weekly Food Shop Planner" Custom GPT). Primary entry
// surface for the ChatGPT-first positioning; the App Store remains the
// download/monetisation destination. Env-overridable so we can swap the
// app id without a code change — if NEXT_PUBLIC_CHATGPT_URL is set in
// Vercel, it must be updated there too.
export const CHATGPT_URL =
  readEnv(process.env.NEXT_PUBLIC_CHATGPT_URL) ??
  'https://chatgpt.com/plugins/plugin_asdk_app_6a1c0dfa60b88191b3360153a1c6613c';

export const CHATGPT_LIVE = isLiveStoreUrl(CHATGPT_URL);

/**
 * Build-time configuration guard.
 *
 * The defect class this catches is a runtime env value, not a code shape —
 * no lint rule or static check can see it, because the offending string
 * lives in the Vercel dashboard. Called at module scope from the root
 * layout, so `next build` evaluates it on every build and a
 * misconfiguration fails the deploy instead of silently shipping dead CTAs.
 *
 * The blank-but-defined checks look at the raw env var rather than the
 * resolved value on purpose: the fallback above would quietly rescue a
 * blank NEXT_PUBLIC_APP_STORE_URL, but someone setting a store URL to
 * empty in production has made a mistake worth surfacing, not papering
 * over.
 */
export function assertStoreUrlsValid(): void {
  const problems: string[] = [];

  const rawAppStore = process.env.NEXT_PUBLIC_APP_STORE_URL;
  if (rawAppStore !== undefined && rawAppStore.trim() === '' && IOS_LIVE) {
    problems.push(
      'NEXT_PUBLIC_APP_STORE_URL is defined but blank while iOS is live. ' +
        'Unset it to use the built-in listing URL, or give it a real value.',
    );
  }

  const rawPlayStore = process.env.NEXT_PUBLIC_PLAY_STORE_URL;
  const androidRequested = readFlag(process.env.NEXT_PUBLIC_ANDROID_LIVE, false);
  if (rawPlayStore !== undefined && rawPlayStore.trim() === '' && androidRequested) {
    problems.push(
      'NEXT_PUBLIC_ANDROID_LIVE is true but NEXT_PUBLIC_PLAY_STORE_URL is blank. ' +
        'Set the Play listing URL before enabling Android.',
    );
  }
  if (androidRequested && !ANDROID_LIVE) {
    problems.push(
      'NEXT_PUBLIC_ANDROID_LIVE is true but NEXT_PUBLIC_PLAY_STORE_URL is not a ' +
        'usable http(s) URL. The Play CTA would have no destination.',
    );
  }

  const resolved: ReadonlyArray<readonly [string, string | null]> = [
    ['APP_STORE_URL', APP_STORE_URL],
    ['PLAY_STORE_URL', PLAY_STORE_URL],
    ['CHATGPT_URL', CHATGPT_URL],
  ];
  for (const [name, url] of resolved) {
    if (url === null) continue;
    if (url === '#' || url.trim() === '') {
      problems.push(`${name} resolves to ${JSON.stringify(url)}, which is not a destination.`);
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `Invalid store URL configuration:\n  - ${problems.join('\n  - ')}\n` +
        'See app/lib/app-stores.ts and .env.example.',
    );
  }
}
