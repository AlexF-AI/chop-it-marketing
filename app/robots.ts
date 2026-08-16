import type { MetadataRoute } from 'next';

// The wildcard already permits crawling. These named rules make the policy
// explicit and protect relevant AI agents if the wildcard policy is narrowed
// later. They are grouped by purpose because training access is not the same
// thing as eligibility for an AI search citation.
const AI_SEARCH_CRAWLERS = [
  'OAI-SearchBot',
  'Claude-SearchBot',
  'PerplexityBot',
] as const;

const AI_USER_FETCHERS = [
  'ChatGPT-User',
  'Claude-User',
  'Perplexity-User',
] as const;

const AI_MODEL_CRAWLERS = [
  'GPTBot',
  'ClaudeBot',
  'Google-Extended',
] as const;

const EXPLICIT_AI_AGENTS = [
  ...AI_SEARCH_CRAWLERS,
  ...AI_USER_FETCHERS,
  ...AI_MODEL_CRAWLERS,
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...EXPLICIT_AI_AGENTS.map((userAgent) => ({
        userAgent,
        allow: '/',
      })),
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: 'https://chop-it.com/sitemap.xml',
    host: 'https://chop-it.com',
  };
}
