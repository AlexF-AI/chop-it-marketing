// Blog post registry for the /blog SEO articles.
//
// Two halves, kept deliberately separate:
//   - BLOG_POSTS: metadata only (no fs). Safe to import anywhere on the
//     server — the /blog index, generateMetadata, JSON-LD, and the sitemap
//     route all read from here without touching the filesystem.
//   - getPostBody(): reads the markdown body from content/blog/<slug>.md.
//     Only called from app/blog/[slug]/page.tsx, which is fully prerendered
//     (generateStaticParams + dynamicParams=false + static), so the fs read
//     happens at BUILD time and never inside a request-time function.
//
// To add an article: drop content/blog/<slug>.md and add a BLOG_POSTS entry.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const BLOG_AUTHOR = 'Chop it';

export type BlogPostMeta = {
  slug: string;
  /** Used as the visible-page intent, the SEO <title> base, and JSON-LD headline. */
  title: string;
  /** Meta description (~150–160 chars). */
  description: string;
  /** ISO date (YYYY-MM-DD). */
  datePublished: string;
  /** ISO date (YYYY-MM-DD). */
  dateModified: string;
  /**
   * Set for interactive recipe-menu posts (e.g. "This week's dinners"). The
   * post body is rendered from the shared menu with this code rather than a
   * markdown file, so getPostBody() is never called for it.
   */
  menuShareCode?: string;
};

export const BLOG_POSTS: BlogPostMeta[] = [
  {
    slug: 'future-of-ai-cooking',
    title: 'The Future of AI Cooking: From Chat to Kitchen',
    description:
      'AI can generate dinner ideas in seconds. The future is making those recipes persistent, structured and useful from chat through planning, shopping and cooking.',
    datePublished: '2026-08-03',
    dateModified: '2026-08-03',
  },
  {
    slug: 'what-to-cook-with-a-veg-box',
    title: 'What to Cook With a Veg Box (Without Wasting Half of It)',
    description:
      'Photograph your veg box, turn its contents into a pantry, and plan meals that use the fragile produce first. A practical way to waste less of every delivery.',
    datePublished: '2026-08-03',
    dateModified: '2026-08-03',
  },
  {
    slug: 'future-of-meal-prep-ai-customisation',
    title: 'The Future of Meal Prep: AI as the Customisation Layer',
    description:
      "AI meal planning turns a household's changing constraints into recipes, a practical weekly menu and one shopping list. Here is the customisation layer.",
    datePublished: '2026-07-23',
    dateModified: '2026-08-03',
  },
  {
    slug: 'easy-summer-salads-this-weeks-dinners',
    title: '49 Easy Summer Salads to Cook This Week',
    description:
      'A full week of easy summer salads that hold their own as dinner, each with ingredients and method, plus a one-tap shopping list for the whole lot in Chop it.',
    datePublished: '2026-06-22',
    dateModified: '2026-08-03',
    menuShareCode: 'MDSAP7JV',
  },
  {
    slug: 'how-to-meal-plan-for-the-week',
    title: 'How to Meal Plan for the Week (A System That Sticks)',
    description:
      'A meal-planning method that survives a real week: pick 4–5 dinners, write one merged shopping list, shop once. Plus how to keep the habit going.',
    datePublished: '2026-06-16',
    dateModified: '2026-08-03',
  },
  {
    slug: 'how-to-reduce-food-waste-at-home',
    title: 'How to Reduce Food Waste at Home (UK Guide)',
    description:
      'UK households throw away food worth £17bn a year. These practical habits make ingredients easier to use before they reach the bin.',
    datePublished: '2026-06-16',
    dateModified: '2026-08-03',
  },
  {
    slug: 'how-much-fibre-do-you-need-a-day',
    title: 'How Much Fibre Do You Need a Day? (And How to Eat It)',
    description:
      'The UK target is 30g of fibre a day, yet 96% of adults fall short. These simple swaps help close the gap without counting every gram.',
    datePublished: '2026-06-16',
    dateModified: '2026-08-03',
  },
  {
    slug: 'why-chatgpt-changes-home-cooking-and-grocery-shopping',
    title: 'How ChatGPT Will Change Cooking and Grocery Shopping',
    description:
      'ChatGPT can plan meals and draft a grocery list. The useful future connects that conversation to reliable recipes, one library and the weekly shop.',
    datePublished: '2026-05-31',
    dateModified: '2026-08-03',
  },
  {
    slug: 'how-to-eat-30-plants-a-week',
    title: 'How to Eat 30 Plants a Week (and What Counts)',
    description:
      "What the 30-plants-a-week gut-health rule means, what counts (herbs, spices, nuts and coffee all do), and how to hit it without a spreadsheet.",
    datePublished: '2026-05-31',
    dateModified: '2026-08-03',
  },
  {
    slug: 'best-meal-planning-apps-uk-2026',
    title: 'Best Meal Planning Apps in the UK for 2026',
    description:
      'We compare Good Food, Paprika, Samsung Food, Mealime, AnyList, Mob and Chop it by the job you need done, from recipe discovery to keeping every recipe together.',
    datePublished: '2026-05-29',
    dateModified: '2026-08-03',
  },
];

/** Newest first, for the index listing. */
export function getAllPostsMeta(): BlogPostMeta[] {
  return [...BLOG_POSTS].sort((a, b) => b.datePublished.localeCompare(a.datePublished));
}

export function getPostMeta(slug: string): BlogPostMeta | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

/** Build-time only — see file header. */
export function getPostBody(slug: string): string {
  return readFileSync(join(process.cwd(), 'content', 'blog', `${slug}.md`), 'utf8');
}
