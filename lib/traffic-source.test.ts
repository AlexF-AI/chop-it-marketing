// Unit tests for the traffic-source classifier and the two URL builders.
//
// Run with `npm test`. Node's built-in test runner strips the TypeScript
// types at load, so there is no test framework, no transform step and no
// extra dependency — which is why this module is kept DOM-free and
// dependency-free.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  APPLE_CT_MAX_LENGTH,
  appStoreCampaignUrl,
  buildAppUrl,
  classifyTrafficSource,
  inlineSurfaceForPath,
} from './traffic-source.ts';

const APP_ID = '6762079343';
const LISTING = `https://apps.apple.com/gb/app/chop-it/id${APP_ID}`;

describe('classifyTrafficSource', () => {
  it('classifies by utm_source before referrer', () => {
    assert.equal(
      classifyTrafficSource({ utmSource: 'chatgpt.com', referrer: 'https://www.google.com/' }),
      'chatgpt',
    );
  });

  it('matches every AI assistant substring in the spec', () => {
    const cases: Array<[string, string]> = [
      ['chatgpt.com', 'chatgpt'],
      ['openai.com', 'chatgpt'],
      ['perplexity', 'perplexity'],
      ['copilot', 'copilot'],
      ['claude.ai', 'claude'],
      ['gemini.google', 'gemini'],
      ['google', 'google'],
      ['bing', 'bing'],
    ];
    for (const [utmSource, expected] of cases) {
      assert.equal(classifyTrafficSource({ utmSource, referrer: null }), expected, utmSource);
    }
  });

  it('falls back to the referring host when there is no utm_source', () => {
    const cases: Array<[string, string]> = [
      ['https://chatgpt.com/', 'chatgpt'],
      ['https://www.perplexity.ai/search?q=meal+planning', 'perplexity'],
      ['https://copilot.microsoft.com/', 'copilot'],
      ['https://claude.ai/chat/abc', 'claude'],
      ['https://www.google.com/', 'google'],
      ['https://www.bing.com/search?q=x', 'bing'],
    ];
    for (const [referrer, expected] of cases) {
      assert.equal(classifyTrafficSource({ utmSource: null, referrer }), expected, referrer);
    }
  });

  it('does not let google.com swallow gemini.google.com', () => {
    assert.equal(
      classifyTrafficSource({ utmSource: null, referrer: 'https://gemini.google.com/app' }),
      'gemini',
    );
  });

  it('treats a present-but-unknown utm_source as other, not as the referrer', () => {
    assert.equal(
      classifyTrafficSource({ utmSource: 'newsletter', referrer: 'https://www.google.com/' }),
      'other',
    );
  });

  it('treats no utm_source and no referrer as direct', () => {
    assert.equal(classifyTrafficSource({ utmSource: null, referrer: null }), 'direct');
    assert.equal(classifyTrafficSource({ utmSource: '', referrer: '' }), 'direct');
  });

  it('treats a same-site entry referrer as direct', () => {
    assert.equal(
      classifyTrafficSource({ utmSource: null, referrer: 'https://chop-it.com/recipes' }),
      'direct',
    );
    assert.equal(
      classifyTrafficSource({ utmSource: null, referrer: 'https://www.chop-it.com/blog' }),
      'direct',
    );
  });

  it('does not let a lookalike host impersonate a source or the site', () => {
    // chop-it.com.evil.test must not read as internal...
    assert.equal(
      classifyTrafficSource({ utmSource: null, referrer: 'https://chop-it.com.evil.test/' }),
      'other',
    );
  });

  it('classifies an unrecognised referrer as other', () => {
    assert.equal(
      classifyTrafficSource({ utmSource: null, referrer: 'https://news.ycombinator.com/' }),
      'other',
    );
  });

  it('is case-insensitive', () => {
    assert.equal(classifyTrafficSource({ utmSource: 'ChatGPT.com', referrer: null }), 'chatgpt');
  });

  it('survives an unparseable referrer', () => {
    assert.equal(classifyTrafficSource({ utmSource: null, referrer: 'not a url' }), 'other');
  });
});

describe('buildAppUrl', () => {
  it('appends the full param set', () => {
    const out = new URL(
      buildAppUrl('https://chopit.app/m/abc123', {
        source: 'chatgpt',
        ctaLocation: 'blog_footer',
      }),
    );
    assert.equal(out.searchParams.get('utm_source'), 'chop-it.com');
    assert.equal(out.searchParams.get('utm_medium'), 'referral');
    assert.equal(out.searchParams.get('utm_campaign'), 'chatgpt');
    assert.equal(out.searchParams.get('utm_content'), 'blog_footer');
  });

  it('preserves existing query params', () => {
    const out = new URL(
      buildAppUrl('https://chopit.app/m/abc?ref=share&n=2', {
        source: 'google',
        ctaLocation: 'inline_blog',
      }),
    );
    assert.equal(out.searchParams.get('ref'), 'share');
    assert.equal(out.searchParams.get('n'), '2');
    assert.equal(out.searchParams.get('utm_campaign'), 'google');
  });

  it('preserves a hash fragment, and keeps it after the query string', () => {
    const out = buildAppUrl('https://chopit.app/m/abc#recipe-42', {
      source: 'chatgpt',
      ctaLocation: 'recipe_page_footer',
    });
    assert.ok(out.endsWith('#recipe-42'), out);
    assert.equal(new URL(out).hash, '#recipe-42');
    assert.equal(new URL(out).searchParams.get('utm_campaign'), 'chatgpt');
  });

  it('omits utm_campaign when the source is missing', () => {
    const out = new URL(buildAppUrl('https://chopit.app/m/abc', { ctaLocation: 'blog_footer' }));
    assert.equal(out.searchParams.has('utm_campaign'), false);
    // The rest still applies — a known surface is worth recording even
    // when the source is not.
    assert.equal(out.searchParams.get('utm_source'), 'chop-it.com');
    assert.equal(out.searchParams.get('utm_content'), 'blog_footer');
  });

  it('omits utm_content when the cta location is missing', () => {
    const out = new URL(buildAppUrl('https://chopit.app/m/abc', { source: 'chatgpt' }));
    assert.equal(out.searchParams.has('utm_content'), false);
    assert.equal(out.searchParams.get('utm_campaign'), 'chatgpt');
  });

  it('applies nothing but the defaults when given no options at all', () => {
    const out = new URL(buildAppUrl('https://chopit.app/m/abc'));
    assert.equal(out.searchParams.get('utm_source'), 'chop-it.com');
    assert.equal(out.searchParams.get('utm_medium'), 'referral');
    assert.equal(out.searchParams.has('utm_campaign'), false);
    assert.equal(out.searchParams.has('utm_content'), false);
  });

  it('leaves a URL that already carries any utm param untouched', () => {
    const tagged = 'https://chopit.app/m/abc?utm_source=partner';
    assert.equal(buildAppUrl(tagged, { source: 'chatgpt', ctaLocation: 'hero' }), tagged);

    const taggedMixedCase = 'https://chopit.app/m/abc?UTM_Campaign=spring';
    assert.equal(buildAppUrl(taggedMixedCase, { source: 'chatgpt' }), taggedMixedCase);
  });

  it('returns an unparseable href unchanged rather than throwing', () => {
    assert.equal(buildAppUrl('/m/abc', { source: 'chatgpt' }), '/m/abc');
    assert.equal(buildAppUrl('', { source: 'chatgpt' }), '');
  });
});

describe('appStoreCampaignUrl', () => {
  const opts = (source: 'chatgpt' | 'google' | 'perplexity', surface?: string) => ({
    appId: APP_ID,
    source,
    surface,
  });

  it('combines source and the build-time surface token', () => {
    const out = new URL(appStoreCampaignUrl(`${LISTING}?ct=homepage_hero&mt=8`, opts('chatgpt')));
    assert.equal(out.searchParams.get('ct'), 'web-chatgpt-homepage_hero');
  });

  it('uses the supplied surface when the href has no ct yet', () => {
    const out = new URL(appStoreCampaignUrl(LISTING, opts('google', 'inline_blog')));
    assert.equal(out.searchParams.get('ct'), 'web-google-inline_blog');
    assert.equal(out.searchParams.get('mt'), '8', 'mt is required alongside ct');
  });

  it('falls back to source-only when there is no surface anywhere', () => {
    const out = new URL(appStoreCampaignUrl(LISTING, opts('chatgpt')));
    assert.equal(out.searchParams.get('ct'), 'web-chatgpt');
  });

  it('preserves the provider token and the storefront path', () => {
    const out = new URL(appStoreCampaignUrl(`${LISTING}?pt=123456&ct=blog_footer&mt=8`, opts('chatgpt')));
    assert.equal(out.searchParams.get('pt'), '123456');
    assert.equal(out.pathname, `/gb/app/chop-it/id${APP_ID}`);
  });

  it('is idempotent — a second click does not double-prefix', () => {
    const once = appStoreCampaignUrl(`${LISTING}?ct=homepage_hero&mt=8`, opts('chatgpt'));
    const twice = appStoreCampaignUrl(once, opts('chatgpt'));
    assert.equal(new URL(twice).searchParams.get('ct'), 'web-chatgpt-homepage_hero');
  });

  it('stays inside Apple 40-character limit for the longest real token', () => {
    // The longest source (perplexity) against the longest surface.
    const out = new URL(
      appStoreCampaignUrl(`${LISTING}?ct=homepage_chatgpt_panel&mt=8`, opts('perplexity')),
    );
    const ct = out.searchParams.get('ct')!;
    assert.equal(ct, 'web-perplexity-homepage_chatgpt_panel');
    assert.ok(ct.length <= APPLE_CT_MAX_LENGTH, `${ct.length} chars`);
  });

  it('drops the surface rather than truncating when the token would overflow', () => {
    const long = 'a_very_long_surface_token_that_will_not_fit';
    const out = new URL(appStoreCampaignUrl(`${LISTING}?ct=${long}&mt=8`, opts('perplexity')));
    const ct = out.searchParams.get('ct')!;
    assert.equal(ct, 'web-perplexity');
    assert.ok(ct.length <= APPLE_CT_MAX_LENGTH);
  });

  it("does not tag a competitor's listing", () => {
    const mealime = 'https://apps.apple.com/gb/app/mealime-meal-plans-recipes/id1079999103';
    assert.equal(appStoreCampaignUrl(mealime, opts('chatgpt', 'inline_blog')), mealime);
  });

  it('does not tag a non-Apple host', () => {
    const play = 'https://play.google.com/store/apps/details?id=com.chopit';
    assert.equal(appStoreCampaignUrl(play, opts('chatgpt')), play);
  });

  it('does not treat a lookalike host as Apple', () => {
    const fake = `https://apps.apple.com.evil.test/gb/app/chop-it/id${APP_ID}`;
    assert.equal(appStoreCampaignUrl(fake, opts('chatgpt')), fake);
  });

  it('returns the href unchanged when the app id is unknown', () => {
    assert.equal(appStoreCampaignUrl(LISTING, { appId: null, source: 'chatgpt' }), LISTING);
  });

  it('returns an unparseable href unchanged', () => {
    assert.equal(appStoreCampaignUrl('#', opts('chatgpt')), '#');
  });
});

describe('inlineSurfaceForPath', () => {
  it('maps each content route to its own surface', () => {
    assert.equal(inlineSurfaceForPath('/blog/chatgpt-meal-planning'), 'inline_blog');
    assert.equal(inlineSurfaceForPath('/learn/chop-it-vs-chatgpt'), 'inline_learn');
    assert.equal(inlineSurfaceForPath('/research/whatever'), 'inline_research');
    assert.equal(inlineSurfaceForPath('/features/pantry'), 'inline_features');
  });

  it('does not claim the section index pages, only articles', () => {
    assert.equal(inlineSurfaceForPath('/blog'), 'inline_other');
    assert.equal(inlineSurfaceForPath('/'), 'inline_other');
  });
});
