---
name: seo-geo
description: SEO and GEO rules for chop-it.com. Use when editing any
  article, page metadata, schema, or investigating ranking/traffic
  changes. Covers editing invariants, GSC diagnostics, and AI-engine
  (ChatGPT/Perplexity/AI Overviews) optimisation.
---

# SEO + GEO for chop-it.com

## Editing invariants (never break without explicit approval)
- Never change: title tag, H1, slug, canonical, datePublished.
- Always when body changes: bump dateModified in app/lib/blog.ts
  (it drives JSON-LD and sitemap lastmod).
- FAQPage schema in app/lib/blogSchema.ts must mirror on-page FAQ
  text exactly. Never remove on-page answers the schema references.
- Never delete answer-shaped content (bolded Q&A, "Quick answers"
  blocks, one-line verdicts). These are featured-snippet and
  LLM-extraction targets. Restructure, don't remove.
- H2s should carry query keywords, not editorial labels
  ("Best free meal planning apps" beats "The apps").
- Batch content edits into one PR per page = one recrawl.

## Where things live
- Body: content/blog/<slug>.md (no frontmatter)
- Title/description/dates: app/lib/blog.ts BLOG_POSTS registry
- FAQ + ItemList JSON-LD: app/lib/blogSchema.ts
- Renderer + Article/Breadcrumb JSON-LD: app/blog/[slug]/page.tsx
- OG images: app/blog/[slug]/opengraph-image.tsx
- Sitemap: app/sitemap.xml -> sitemap-static.xml

## Diagnosing ranking changes (learned 12-13 Aug 2026)
- GSC "average position" is sitewide and impression-weighted.
  Launching new URLs drops the average while impressions RISE,
  with no page demoted. ALWAYS segment by page before reacting.
- New URLs index at ~30-60 and settle over 2-4 weeks.
- Content edits take 3-10 days to reprocess. Expect query-mix
  churn after adding schema types.
- Rollbacks create a third content identity; forward-fix instead.
- Two days of data is never a trend.

## GEO (generative engine optimisation)
- robots.txt must allow: GPTBot, OAI-SearchBot, ClaudeBot,
  PerplexityBot, Google-Extended. Check before anything else.
- Verdicts as bolded one-liners, not prose paragraphs. LLMs and
  snippets extract structure.
- Answer FAQ questions in the first sentence.
- Dated, sourced facts ("checked on the UK App Store, 5 Aug 2026")
  make the page citable. Keep verification footers.
- Entity consistency: the product is "Chop it" (lowercase i),
  everywhere, every time.
- The ChatGPT app listing is the primary GEO asset; articles
  support it.

## Images
- Owned assets only: Chop it screenshots + generated brand graphics.
  No competitor screenshots or third-party images.
- Generate charts/flowcharts from article data via the shared
  OG-card styling; webp, max 1200px, <150KB, descriptive
  kebab-case filenames, alt text naming the topic.
- Every article: at least one image per major section on
  comparison pages, one diagram minimum elsewhere.
