'use client';

import { m } from 'motion/react';

import { APP_STORE_URL, CHATGPT_LIVE, CHATGPT_URL, IOS_LIVE } from '@/app/lib/app-stores';
import type { DemoPantryRecipe, DemoRecipe } from '@/app/lib/homepageDemo';
import { trackAppStoreClick, trackChatgptClick, trackCtaClicked } from '@/lib/posthog-events';
import DemoSearchBar from './interactive-demo/DemoSearchBar';
import PhoneSimulator from './interactive-demo/PhoneSimulator';

type HeroProps = {
  score: number;
  accent: string;
  demoRecipes: DemoRecipe[];
  demoPantryRecipes: DemoPantryRecipe[];
};

const PHONE_DEMO_BAND = 'Good';

// Single easing curve across the page — matches the ScoreRing
// stroke-dashoffset transition for one visual vocabulary.
const EASE: [number, number, number, number] = [0.2, 0.7, 0.2, 1];

export default function Hero({ score, demoRecipes, demoPantryRecipes }: HeroProps) {
  return (
    <header className="hero">
      <div className="hero-grid">
        <div className="hero-left">
          <div className="hero-eyebrow">
            {/* Pulse keyframe left alone — already runs in CSS and is
                guarded by the prefers-reduced-motion block. */}
            <span className="pulse" />
            <span className="mono">NOW LIVE IN ChatGPT</span>
          </div>
          <m.h1
            className="hero-h"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <span className="hero-h-line">Every recipe you&rsquo;ve ever saved.</span>
            <span className="hero-h-line">
              <em>One place. Inside ChatGPT.</em>
            </span>
          </m.h1>
          <m.p
            className="hero-sub"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: EASE }}
          >
            Books, websites, socials — Chop It turns them all into one tidy library. Plan the week
            in a ChatGPT conversation, get one consolidated shopping list, and find everything
            waiting in the app.
          </m.p>
          {CHATGPT_LIVE && (
            <m.div
              className="hero-cta"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
            >
              <a
                className="btn btn-ai"
                href={CHATGPT_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackChatgptClick({ location: 'hero' });
                  trackCtaClicked({
                    cta_location: 'homepage_hero',
                    cta_label: 'ChatGPT',
                    cta_destination: CHATGPT_URL,
                  });
                }}
              >
                Use it in ChatGPT
              </a>
              {IOS_LIVE && (
                <a
                  className="btn btn-ghost"
                  href={APP_STORE_URL}
                  rel="noopener noreferrer"
                  onClick={() => {
                    trackAppStoreClick({ location: 'hero' });
                    trackCtaClicked({
                      cta_location: 'homepage_hero',
                      cta_label: 'App Store',
                      cta_destination: APP_STORE_URL,
                    });
                  }}
                >
                  Get the iPhone app
                </a>
              )}
            </m.div>
          )}
          <hr className="hero-separator" aria-hidden="true" />
        </div>
        {/* Wrap the PhoneSimulator container, NOT the simulator internals
            — its own ScoreRing + tab animations stay untouched. */}
        <m.div
          className="hero-right"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
        >
          <PhoneSimulator
            initialRecipes={demoRecipes}
            pantryRecipes={demoPantryRecipes}
            score={score}
            band={PHONE_DEMO_BAND}
          />
        </m.div>
      </div>
      {/* Search lives in its own full-width row below the hero grid so it
          never competes for column width with the phone simulator. On
          mobile this stacks cleanly under the phone; on desktop it spans
          the hero centered. */}
      <m.div
        className="hero-search-row"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
      >
        <DemoSearchBar />
      </m.div>
    </header>
  );
}
