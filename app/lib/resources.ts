// Registry for the Learn and Research sections.
//
// Same split as the blog registry: metadata here (no fs, safe anywhere on
// the server), body markdown in content/<section>/<slug>.md read only at
// build time by the fully prerendered [slug] routes.
//
// Learn holds evergreen educational guides; Research holds sourced,
// citation-grade reference pages. They share one shape and one renderer —
// the section split exists because the two carry different reader intent
// and different nav entries, not because they differ technically.
//
// FAQ entries live here rather than being parsed from the markdown: Google
// only accepts FAQPage markup whose answer text appears on the page, so the
// same strings are rendered into the body AND serialized into the schema
// from this one definition. One source, no drift.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { FaqEntry } from './blogSchema';

export type ResourceSection = 'learn' | 'research';

export type ResourceMeta = {
  slug: string;
  section: ResourceSection;
  /** Visible h1 — may run longer than the SEO title. */
  title: string;
  /** SEO <title> base. Keep ≤60 chars including the " · Chop it" suffix. */
  seoTitle: string;
  /** Meta description, ≤155 chars. */
  description: string;
  /** ISO date (YYYY-MM-DD). */
  datePublished: string;
  /** ISO date (YYYY-MM-DD). Bump only on real content changes. */
  dateModified: string;
  /** Rendered as an FAQ block AND FAQPage JSON-LD. Optional. */
  faq?: FaqEntry[];
};

export const LEARN_RESOURCES: ResourceMeta[] = [
  {
    slug: 'can-ai-create-recipes',
    section: 'learn',
    title: 'Can AI Create Recipes? What Works, What to Check',
    seoTitle: 'Can AI Create Recipes?',
    description:
      'AI can write a workable recipe in seconds. What it gets right, the two failure modes to check before cooking, and how to test a generated recipe safely.',
    datePublished: '2026-08-05',
    dateModified: '2026-08-05',
    faq: [
      {
        question: 'Can AI actually create a usable recipe?',
        answer:
          'Yes. Large language models have read enough cooking text to produce recipes that follow sound technique for familiar dishes. The output is usually a workable starting point rather than a tested recipe, so check quantities and cooking times before you rely on them.',
      },
      {
        question: 'What do AI recipes get wrong?',
        answer:
          'Two things most often: quantities and timing. A generated recipe can call for a plausible-looking amount that is wrong in practice, or a cooking time that suits a different pan or cut. Ratios in baking deserve the most suspicion, because baking depends on proportion more than judgement.',
      },
      {
        question: 'Are AI recipes safe to cook?',
        answer:
          'Treat food-safety-critical steps as yours to verify, not the model’s. Check meat cooking temperatures and times against a trusted reference such as the Food Standards Agency rather than trusting a generated figure, exactly as you would with an unfamiliar human recipe.',
      },
    ],
  },
  {
    slug: 'how-ai-shopping-lists-work',
    section: 'learn',
    title: 'How AI Shopping Lists Work: Merging, Sorting and Pantry Checks',
    seoTitle: 'How AI Shopping Lists Work',
    description:
      'What separates a real generated shopping list from a text dump: structured ingredients, unit conversion, duplicate merging and pantry checks, explained.',
    datePublished: '2026-08-05',
    dateModified: '2026-08-05',
    faq: [
      {
        question: 'How does an AI shopping list combine recipes?',
        answer:
          'By storing each ingredient as a structured quantity rather than a line of text. Once the app knows a recipe needs 200g of rice rather than the sentence "add the rice", combining four recipes becomes arithmetic: the same ingredient across recipes is summed into one line with a total.',
      },
      {
        question: 'Why does ChatGPT repeat ingredients on a shopping list?',
        answer:
          'Because a chat model re-reads its own prose rather than consulting a structured record. Without an explicit instruction to merge duplicates it tends to list each recipe’s ingredients separately. Asking it directly to combine duplicates into single lines with totals fixes most of it, most of the time.',
      },
    ],
  },
  {
    slug: 'can-ai-reduce-food-waste',
    section: 'learn',
    title: 'Can AI Reduce Food Waste at Home?',
    seoTitle: 'Can AI Reduce Food Waste at Home?',
    description:
      'UK homes throw away food worth £17bn a year. Where planning actually cuts waste, what AI adds to it, and what no app can do about the bin.',
    datePublished: '2026-08-05',
    dateModified: '2026-08-05',
    faq: [
      {
        question: 'How much food does a UK household waste?',
        answer:
          'WRAP puts it at around £1,000 a year for an average household of four, about £86 a month. Across the UK roughly 4.4 million tonnes of edible food worth £17 billion is thrown from homes each year.',
      },
      {
        question: 'Does meal planning actually reduce food waste?',
        answer:
          'Planning attacks the biggest cause, which is buying without a plan for using it. A planned week buys what the recipes need and no more. AI adds the reverse direction: starting the plan from what is already in the kitchen, so food gets cooked before it goes off rather than after.',
      },
    ],
  },
  {
    slug: 'how-to-save-recipes-from-anywhere',
    section: 'learn',
    title: 'How to Save Recipes From Anywhere: Cookbooks, Links, Social and AI',
    seoTitle: 'How to Save Recipes From Anywhere',
    description:
      'Recipes now arrive from cookbooks, websites, TikTok and ChatGPT. How to capture each source into one library instead of four apps and a camera roll.',
    datePublished: '2026-08-05',
    dateModified: '2026-08-05',
    faq: [
      {
        question: 'How do I save a recipe from TikTok or Instagram?',
        answer:
          'Screenshots lose the method and links rot when the creator deletes the video. The durable route is an app that extracts the recipe itself: paste the link, and the ingredients and steps are parsed into a structured recipe you keep even if the original disappears.',
      },
      {
        question: 'How do I digitise recipes from a cookbook?',
        answer:
          'Photograph the page and let an app with text recognition turn it into structured ingredients and steps. Chop it does this from a single photo, including handwritten cards. Check the quantities after import, since recognition of handwriting is good but not perfect.',
      },
      {
        question: 'How do I keep a recipe ChatGPT wrote for me?',
        answer:
          'Copy it out of the conversation before it scrolls into history, or use a tool that runs inside ChatGPT and saves the result as a structured recipe directly. A chat log is where good recipes go to disappear; the fix is moving them into something built for keeping.',
      },
    ],
  },
  {
    slug: 'chop-it-vs-chatgpt',
    section: 'learn',
    title: 'Chop it vs ChatGPT: What Each Does Better',
    seoTitle: 'Chop it vs ChatGPT for Meal Planning',
    description:
      'ChatGPT invents and adapts recipes better than any app. Chop it keeps them, plans the week and merges the shopping list. A factual comparison of the split.',
    datePublished: '2026-08-05',
    dateModified: '2026-08-05',
    faq: [
      {
        question: 'Is Chop it a replacement for ChatGPT?',
        answer:
          'No, and it does not try to be. ChatGPT is better at generating and adapting recipes than any app. Chop it runs inside it and covers what a conversation cannot: a persistent week, a merged shopping list, a pantry, and a recipe library that includes sources other than AI.',
      },
      {
        question: 'Do I need both?',
        answer:
          'If you already plan meals in ChatGPT and retype the results somewhere, the combination removes that step. If you only ever want one-off dinner ideas, ChatGPT alone is enough and it is free.',
      },
    ],
  },
];

export const RESEARCH_RESOURCES: ResourceMeta[] = [
  {
    slug: 'ai-cooking-statistics',
    section: 'research',
    title: 'AI Cooking Statistics: What the Research Actually Shows',
    seoTitle: 'AI Cooking Statistics (UK, 2026)',
    description:
      'Sourced figures on AI in home cooking: 66.8% of Brits have used AI food tools, 75.9% would take AI recipe recommendations. Every number cited and dated.',
    datePublished: '2026-08-05',
    dateModified: '2026-08-05',
    faq: [
      {
        question: 'How many people use AI for cooking?',
        answer:
          'Attest research updated in June 2026 found 63.8% of consumers had used AI-powered tools for food-related activities, rising to 66.8% in the UK and 74% among 18 to 24 year olds.',
      },
      {
        question: 'Do people trust AI recipe recommendations?',
        answer:
          'More than most AI food tasks. In the same Attest research 75.9% of UK respondents said they would be comfortable with AI recipe recommendations, against 49.1% for automated grocery shopping. Data privacy was the top concern, named by 45.8% in the UK.',
      },
    ],
  },
];

const ALL: ResourceMeta[] = [...LEARN_RESOURCES, ...RESEARCH_RESOURCES];

export function getResources(section: ResourceSection): ResourceMeta[] {
  return ALL.filter((r) => r.section === section);
}

export function getResource(section: ResourceSection, slug: string): ResourceMeta | undefined {
  return ALL.find((r) => r.section === section && r.slug === slug);
}

/** Build-time only — the [slug] routes are fully prerendered. */
export function getResourceBody(section: ResourceSection, slug: string): string {
  return readFileSync(join(process.cwd(), 'content', section, `${slug}.md`), 'utf8');
}
