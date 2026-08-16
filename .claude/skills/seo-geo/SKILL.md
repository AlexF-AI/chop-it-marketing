---
name: seo-geo
description: Audit and improve chop-it.com SEO and visibility in generative search. Use when editing content, metadata, structured data, crawler access, internal links, images, or when diagnosing Search Console and AI-referral performance.
---

# SEO and generative search for chop-it.com

## Operating principles

- Treat sound SEO as the basis of visibility in Google AI features. Do not invent separate "GEO hacks".
- Optimise for a useful page first. Use answer-first copy, lists, tables or diagrams only when they help the reader.
- Prefer first-hand evidence, dated checks, original comparisons and clearly attributed sources over commodity summaries.
- Back factual recommendations with primary documentation. Label observations from Chop it data as observations, not universal rules.

## Editing safeguards

- Preserve slugs, canonicals and `datePublished` unless an approved migration includes redirects and validation.
- Change a title tag or H1 only when page-level query, intent or click-through evidence supports it. Record the baseline before changing either.
- When body content changes, update `dateModified` in `app/lib/blog.ts` or `app/lib/resources.ts` and set the visible "Last updated" date to the same real date.
- Keep research or price verification dates separate from the page's modification date.
- Keep structured data representative of visible content. If FAQPage JSON-LD is retained, its questions and answers must match the rendered FAQ exactly.
- Do not add FAQ markup for a promised ranking benefit. Google stopped showing FAQ rich results in May 2026.
- Use specific, natural H2s that describe their sections. Do not force exact-match wording where it makes the page worse.
- Group coherent changes for safe review. Pull request boundaries do not control how or when individual URLs are recrawled.

## Where content lives

- Blog body: `content/blog/<slug>.md`
- Blog metadata and dates: `app/lib/blog.ts`
- Resource body: `content/<section>/<slug>.md`
- Resource metadata, dates and FAQs: `app/lib/resources.ts`
- Blog FAQ and ItemList JSON-LD: `app/lib/blogSchema.ts`
- Renderers and Article JSON-LD: `app/blog/[slug]/page.tsx` and `app/components/ResourcePages.tsx`
- OG images: `app/blog/[slug]/opengraph-image.tsx`
- Sitemap route: `app/sitemap.xml`, backed by `sitemap-static.xml`

## Diagnose performance

- Segment Search Console by page, query, country and device before drawing conclusions. Site-wide average position is impression-weighted and can move when the query or URL mix changes.
- Compare useful windows, normally 28 days against the preceding 28 days and the prior year when available. Do not treat two days as a trend.
- Record clicks, impressions, CTR, position, indexing state and conversions before material page changes.
- Do not assume universal indexing or reprocessing times. Record the actual request, crawl and performance dates for this site.
- Use Search Console's Generative AI performance report when the property has access. Also review PostHog landing-page conversions and referrals from AI products.
- Prefer a forward correction when the current page is sound. Roll back only when evidence shows the change caused harm.

## Crawler access

- Keep the wildcard rule crawlable unless a real section needs blocking.
- Distinguish search crawlers from training crawlers and user-triggered fetchers:
  - Search: `OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`
  - Model development or product improvement: `GPTBot`, `ClaudeBot`, `Google-Extended`
  - User-triggered fetchers: `ChatGPT-User`, `Claude-User`, `Perplexity-User`
- Do not claim that allowing a training crawler improves search rankings or citations.
- Check CDN and firewall behaviour as well as `robots.txt`; an allow rule cannot override an upstream block.

## Content and entity quality

- Put important claims in HTML text even when a chart or screenshot repeats them.
- Answer genuine questions directly, then add evidence and limits. Do not split prose into artificial fragments for an imagined LLM parser.
- Date volatile facts and link to the source used for verification.
- Keep product limitations explicit. Do not claim live account, library or pantry access inside ChatGPT until it exists.
- Write the product as "Chop it". Preserve "Chop It" only where `app/terms/page.tsx` defines the legal term for Chop It AI Ltd.
- Treat the ChatGPT listing and the website as complementary discovery assets. Neither replaces the other.

## Image pipeline

- Regenerate all graphics with `npm run generate:blog-images` or one config with `npm run generate:blog-images -- <name>`.
- Store active configs in `scripts/blog-images/configs/`; keep staged configs in `scripts/blog-images/staged/` until their pages are ready.
- Keep chart data identical to the adjacent article text or table.
- Use `scripts/blog-images/theme.mjs` and the validated chart colours `#C75A80` and `#B08A2E`.
- Give every multi-child Satori `div` `display:flex`; the shared `h()` helper does this by default.
- Use the bundled Archivo fonts. They do not contain tick or cross glyphs, so pair colour with written labels.
- Put article images under `/public`. Markdown images render through `MarkdownImage` with intrinsic dimensions.
- Resize portrait screenshots to no more than 720px wide before embedding. Keep generated WebP assets at no more than 1200px wide and below 150KB.

## Image quality

- Add an image only when it explains, proves or demonstrates something useful. Do not impose an image quota per article or section.
- Use owned screenshots and generated brand graphics. Do not use competitor screenshots or unlicensed third-party images.
- Keep filenames short and descriptive.
- Write concise alt text for the image's purpose. Do not repeat an adjacent table or paragraph word for word, and do not use alt text as a keyword list.
- Keep chart values and source caveats in nearby HTML text because text inside an image is not a substitute for accessible content.

## Primary sources to re-check

- Google generative-search guidance: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Google Search documentation updates: https://developers.google.com/search/updates
- OpenAI crawlers: https://developers.openai.com/api/docs/bots
- Anthropic crawlers: https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
- Perplexity crawlers: https://docs.perplexity.ai/docs/resources/perplexity-crawlers
