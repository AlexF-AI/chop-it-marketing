// Client-side PostHog bootstrap. Next.js's instrumentation-client.ts is
// loaded once on first paint; we use it for posthog.init(), for pinning the
// session's entry traffic source, and for a single global click listener.
//
// The listener is where all outbound link handling lives:
//
//  1. Pins/reads the session traffic source so a click can be attributed to
//     the AI assistant that sent the visitor, long after `utm_source` fell
//     off the URL. See lib/traffic-source.ts for why we keep our own copy.
//
//  2. Fires `cta_clicked` for ChatGPT plugin links that no component
//     instruments — the nine inline links inside markdown article bodies.
//     These fired nothing at all, which is why the ChatGPT funnel looked
//     empty.
//
//  3. Upgrades App Store `ct=` campaign tokens from `<surface>` to
//     `web-<source>-<surface>` at click time, since the source is only
//     knowable in the browser. The server-rendered href keeps the
//     surface-only token, so a click before hydration still attributes.
//
//  4. Rewrites <a href="…chopit.app…"> to append `?phid=<distinct_id>` so
//     the PWA's separate PostHog project (146925) can stitch the same user
//     across domains, and captures `outbound_to_app`.
//
// CONSENT: every one of those is gated on the visitor not having opted out.
// A visitor who declined the cookie banner gets clean hrefs — no phid, no
// campaign token, no events — and their pinned entry source is deleted.
//
// Single capture-phase listener at window means we catch every <a> click,
// including ones in components that mount after the listener installs
// (React Link, components rendered after route change, markdown bodies).
// Rewriting link.href inside the click handler before navigation is safe —
// browsers read the href value AT navigation time, which happens after
// click handlers complete. Capture phase also means we run before React's
// own onClick handlers, which are attached at the root in the bubble phase.

import posthog from 'posthog-js';

import { APP_STORE_APP_ID } from '@/app/lib/app-stores';
import {
  trackCtaClicked,
  trackOutboundToApp,
  trackAppStoreClick,
  type CtaSurface,
} from '@/lib/posthog-events';
import {
  appStoreCampaignUrl,
  captureEntrySource,
  forgetEntrySource,
  getTrafficSource,
  inlineSurfaceForPath,
} from '@/lib/traffic-source';

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  // PostHog managed reverse proxy on a chop-it.com subdomain. Cloudflare
  // proxies through to eu.i.posthog.com — no Next.js rewrites needed,
  // and the request stays first-party (ad-blockers don't see a 3rd-party
  // host). Was '/ingest' with Next.js rewrites before this change.
  api_host: 'https://e.chop-it.com',
  ui_host: 'https://eu.posthog.com',
  defaults: '2026-01-30',
  // Only materialise a Person profile when posthog.identify() is called.
  // Cuts MAU billing for anonymous visitors and matches the spec.
  person_profiles: 'identified_only',
  capture_exceptions: true,
  // Domains differ between chop-it.com and chopit.app, so we explicitly
  // disable subdomain-cookie sharing — identity passthrough rides on
  // the ?phid= query param injected at click time instead.
  cross_subdomain_cookie: false,
  debug: process.env.NODE_ENV === 'development',
});

/**
 * Whether we may track this visitor and tag their outbound links.
 *
 * Fails CLOSED. If posthog has not finished loading, or the opt-out store
 * throws (privacy-mode browsers do), we treat the visitor as opted out: a
 * clean href and a missing event are recoverable, and passing a visitor's
 * source to another domain against their wishes is not.
 */
function trackingAllowed(): boolean {
  try {
    return !posthog.has_opted_out_capturing();
  } catch {
    return false;
  }
}

// Pin the entry source before anything can navigate away from the landing
// page. A visitor who has already declined gets their pin dropped instead —
// the banner is shown once, so the decline usually lands on the page after
// the pin was written.
if (trackingAllowed()) {
  captureEntrySource();
} else {
  forgetEntrySource();
}

// Social hosts we care about for outbound tracking. Keep the pattern
// brand-anchored so e.g. tiktok.example.com doesn't impersonate TikTok.
type SocialMatch = { test: RegExp; platform: 'tiktok' | 'instagram' | 'x' | 'twitter' };
const SOCIAL_MATCHERS: SocialMatch[] = [
  { test: /^https?:\/\/(www\.)?tiktok\.com\//i, platform: 'tiktok' },
  { test: /^https?:\/\/(www\.)?instagram\.com\//i, platform: 'instagram' },
  { test: /^https?:\/\/(www\.)?x\.com\//i, platform: 'x' },
  { test: /^https?:\/\/(www\.)?twitter\.com\//i, platform: 'twitter' },
];

const CHATGPT_PLUGIN_RE = /^https?:\/\/(www\.)?chatgpt\.com\/plugins\//i;
const APP_STORE_RE = /^https?:\/\/([a-z0-9-]+\.)*apple\.com\//i;
const CHOPIT_APP_RE = /^https?:\/\/(www\.)?chopit\.app\b/i;

/**
 * True when a component already fires its own CTA events for this anchor.
 *
 * StoreLink, BlogCTA, Nav and RecipeCTA all carry explicit, typed
 * `cta_location` values and fire from their own onClick. The listener must
 * still rewrite THEIR hrefs (only it knows the traffic source at click
 * time) but must not also fire an event for them — that is exactly the
 * double-counting that got `nav_cta_click` and `chatgpt_click` deleted.
 */
function isComponentTracked(link: HTMLAnchorElement): boolean {
  return link.dataset.ctaTracked === 'true';
}

/** Link text, trimmed and bounded, as the cta_label for an inline link. */
function inlineLabel(link: HTMLAnchorElement): string {
  const text = (link.textContent ?? '').replace(/\s+/g, ' ').trim();
  return text.slice(0, 120) || 'inline link';
}

if (typeof window !== 'undefined') {
  window.addEventListener(
    'click',
    (event) => {
      const target = event.target as HTMLElement | null;
      if (!target || typeof target.closest !== 'function') return;
      const link = target.closest('a[href]') as HTMLAnchorElement | null;
      if (!link) return;

      // link.href returns the resolved absolute URL — easier to pattern-
      // match than the raw attribute, which may be relative or path-only.
      const href = link.href;
      if (!href) return;

      // Declined analytics: no rewrite, no event, clean href. Every branch
      // below both tracks and mutates the URL, so one gate covers all of it.
      if (!trackingAllowed()) return;

      const trafficSource = getTrafficSource();
      const pagePath = window.location.pathname;
      const inlineSurface: CtaSurface = inlineSurfaceForPath(pagePath);

      // 1. ChatGPT plugin links.
      //
      // Components instrument six of these surfaces; the nine inline links
      // in article bodies have no component, which is the whole gap. No URL
      // rewriting — the plugin URL takes no campaign params.
      if (CHATGPT_PLUGIN_RE.test(href)) {
        if (isComponentTracked(link)) return;
        try {
          trackCtaClicked({
            cta_location: inlineSurface,
            cta_label: inlineLabel(link),
            cta_destination: 'chatgpt_plugin',
            page_path: pagePath,
          });
        } catch {
          /* ignore — tracking never blocks navigation */
        }
        return;
      }

      // 2. App Store links — rewrite the campaign token for every one of
      // ours, then fire events only for the ones no component covers (the
      // two bare listing links in markdown article bodies).
      if (APP_STORE_RE.test(href)) {
        try {
          // Returns the href untouched for a competitor's listing, which
          // the cornerstone comparison article links to nine of.
          const tagged = appStoreCampaignUrl(href, {
            appId: APP_STORE_APP_ID,
            source: trafficSource,
            surface: isComponentTracked(link) ? null : inlineSurface,
          });
          if (tagged !== href) link.href = tagged;
        } catch {
          // Malformed URL — leave the href alone, still fire the event so
          // we can measure CTR even when rewriting failed.
        }

        if (isComponentTracked(link)) return;
        // Someone else's listing is a reference, not a CTA. The cornerstone
        // comparison links to nine of them in a single pricing footnote.
        if (!APP_STORE_APP_ID || !href.includes(`id${APP_STORE_APP_ID}`)) return;

        try {
          trackAppStoreClick({ location: 'inline_article' });
          trackCtaClicked({
            cta_location: inlineSurface,
            cta_label: inlineLabel(link),
            cta_destination: link.href,
            page_path: pagePath,
          });
        } catch {
          /* ignore */
        }
        return;
      }

      // 3. chopit.app passthrough — rewrite then capture.
      //
      // buildAppUrl() (utm pass-through) is deliberately NOT wired here yet:
      // the only chopit.app links on the site are the /m/<code> share-page
      // deep links, and share traffic does not arrive from AI answers.
      if (CHOPIT_APP_RE.test(href)) {
        try {
          const distinctId =
            typeof posthog.get_distinct_id === 'function' ? posthog.get_distinct_id() : null;
          if (distinctId) {
            const url = new URL(href);
            url.searchParams.set('phid', distinctId);
            link.href = url.toString();
          }
        } catch {
          // Malformed URL — leave the href alone, still fire the event so
          // we can measure CTR even when rewriting failed.
        }
        try {
          trackOutboundToApp({ from_url: pagePath, to_url: link.href });
        } catch {
          /* ignore — tracking never blocks navigation */
        }
        return;
      }

      // 4. Social outbound — single capture per click
      for (const { test, platform } of SOCIAL_MATCHERS) {
        if (test.test(href)) {
          try {
            posthog.capture('outbound_to_social', {
              platform,
              from_url: pagePath,
              to_url: href,
            });
          } catch {
            /* ignore */
          }
          break;
        }
      }
    },
    // Capture phase: runs before the browser begins navigation, which
    // means our href rewrite is in effect by the time the navigation
    // reads it.
    true,
  );
}
