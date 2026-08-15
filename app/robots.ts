import type { MetadataRoute } from 'next';

// Explicit allow-list for the crawlers that feed search and AI answers.
// Every agent here gets full site access — /blog, /learn, /research and
// /features are the pages we most want cited, so nothing is disallowed.
// The wildcard rule keeps everyone else allowed too; the named rules exist
// so an agent that looks for its own token finds an explicit allow rather
// than inheriting the default.
const AI_AND_SEARCH_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Bingbot',
  'Googlebot',
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...AI_AND_SEARCH_CRAWLERS.map((userAgent) => ({
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
