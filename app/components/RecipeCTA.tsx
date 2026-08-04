'use client';

// RecipeCTA — bottom-of-recipe call-to-action.
//
// Two store badges, App Store left, Google Play right. Google Play is
// hidden until Android is actually live (NEXT_PUBLIC_ANDROID_LIVE === 'true'),
// so we don't ship a dead pill the moment Android lands but before the
// app store listing goes live. App Store eyebrow flips between "COMING
// SOON" and "DOWNLOAD ON THE" based on IOS_LIVE.
//
// Copy is deliberately native-only — SEO recipe pages exist to drive
// install, not to advertise the browser surface. Other entry points on
// the homepage already cover the web fallback.

import { ANDROID_LIVE, appStoreUrl, IOS_LIVE, PLAY_STORE_URL } from '@/app/lib/app-stores';
import {
  trackAppStoreClick,
  trackCtaClicked,
  trackPlayStoreClick,
} from '@/lib/posthog-events';

type RecipeCTAProps = {
  // Passed by the recipe detail page so app_store_click / play_store_click
  // events are attributable to the recipe in PostHog. Optional so the same
  // component can be used in non-recipe surfaces later without breakage.
  recipeSlug?: string;
  recipeTitle?: string;
};

export default function RecipeCTA({ recipeSlug, recipeTitle }: RecipeCTAProps = {}) {
  // Local alias so the null check narrows inside the click handler too —
  // TypeScript won't carry narrowing of an imported binding across a
  // function boundary.
  const playStoreUrl = PLAY_STORE_URL;

  return (
    <section className="recipe-cta">
      <h2 className="recipe-cta-h">Cook this in Chop it</h2>
      <p className="recipe-cta-sub">
        Get the app to scan your fridge, plan the week, and shop in one tap.
      </p>
      <div className="recipe-cta-row">
        {IOS_LIVE ? (
          <a
            className="store-pill"
            href={appStoreUrl('recipe_page_footer')}
            rel="noopener noreferrer"
            aria-label="Download on the App Store"
            onClick={() => {
              trackAppStoreClick({
                recipe_slug: recipeSlug,
                recipe_title: recipeTitle,
                location: 'recipe_page',
              });
              trackCtaClicked({
                cta_location: 'recipe_page_footer',
                cta_label: 'App Store',
                cta_destination: appStoreUrl('recipe_page_footer'),
              });
            }}
          >
            <span className="store-pill-top mono">DOWNLOAD ON THE</span>
            <span className="store-pill-bot">App Store</span>
          </a>
        ) : (
          // No live listing to send anyone to. Render the pill inert rather
          // than as an anchor with a dead href — a non-interactive element
          // is not a CTA and must not emit CTA events.
          <span className="store-pill store-pill-soon">
            <span className="store-pill-top mono">COMING SOON</span>
            <span className="store-pill-bot">App Store</span>
          </span>
        )}
        {ANDROID_LIVE && playStoreUrl && (
          <a
            className="store-pill"
            href={playStoreUrl}
            rel="noopener noreferrer"
            aria-label="Get it on Google Play"
            onClick={() => {
              trackPlayStoreClick({
                recipe_slug: recipeSlug,
                recipe_title: recipeTitle,
                location: 'recipe_page',
              });
              trackCtaClicked({
                cta_location: 'recipe_page_footer',
                cta_label: 'Google Play',
                cta_destination: playStoreUrl,
              });
            }}
          >
            <span className="store-pill-top mono">GET IT ON</span>
            <span className="store-pill-bot">Google Play</span>
          </a>
        )}
      </div>
    </section>
  );
}
