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

export type ResourceSection = 'learn' | 'research' | 'features';

/**
 * Contextual end-of-article action. Each article names the single next step
 * its reader is most ready to take, instead of a site-wide generic CTA —
 * someone who just read about ingredient merging is invited to build a
 * list, not told to "download the app". Research pages carry none: their
 * value as citable references depends on neutrality.
 */
export type ResourceCta = {
  heading: string;
  body: string;
  label: string;
  kind: 'app_store' | 'chatgpt';
};

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
  /** Contextual end-of-article action. Omit on research pages. */
  cta?: ResourceCta;
};

export const LEARN_RESOURCES: ResourceMeta[] = [
  {
    slug: 'what-is-chop-it',
    section: 'learn',
    title: 'What Is Chop it? Every Part of the App, Explained',
    seoTitle: 'What Is Chop it? The App, Explained',
    description:
      'Every part of the Chop it app, explained: the weekly plan, recipe library, Chef IQ catalogue, Recipe Generator, pantry, merged shopping list and ChatGPT.',
    datePublished: '2026-08-05',
    dateModified: '2026-08-05',
    faq: [
      {
        question: 'Is Chop it free?',
        answer:
          'Free to start. AI features run on credits, because the app pays for those AI calls itself. Pro is £3.99 a month or £34.99 a year and adds 100 monthly credits, and one-off credit packs are available for people who dislike subscriptions.',
      },
      {
        question: 'What are Chef IQ Recipes?',
        answer:
          'The Chef IQ catalogue: ready-made recipes you can browse or ask for in plain language. The same catalogue is public at chop-it.com/recipes, organised by cuisine and collection.',
      },
      {
        question: 'What is the difference between New chat and the Recipe Generator?',
        answer:
          'New chat is a conversation: ideas, adaptation and planning, back and forth. The Recipe Generator is one-shot: it takes your request and returns a finished recipe card with quantities, method, macros and the Weekly Diversity Score in a single step.',
      },
      {
        question: 'Does Chop it work on Android?',
        answer:
          'Not yet. The app is iPhone-only today. Chop it inside ChatGPT works on any device with ChatGPT, and shared week and recipe links open in any browser.',
      },
    ], 
    cta: {
      heading: "Start with tonight's dinner",
      body: 'One planned week explains the app faster than any tour.',
      label: 'Get the iPhone app',
      kind: 'app_store',
    },
  },
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
        question: 'Can AI create a usable recipe?',
        answer:
          'Yes. Large language models have read enough cooking text to produce recipes that follow sound technique for familiar dishes. Treat the output as a workable starting point rather than a tested recipe, and check quantities and cooking times before you rely on them.',
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
    cta: {
      heading: "Generate your first recipe",
      body: 'Describe what is in your fridge and get a card you can cook from.',
      label: 'Generate a recipe in Chop it',
      kind: 'app_store',
    },
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
    cta: {
      heading: "Build this week's shopping list",
      body: 'Plan a few dinners and watch the merge do the arithmetic.',
      label: 'Build a list in Chop it',
      kind: 'app_store',
    },
  },
  {
    slug: 'can-ai-reduce-food-waste',
    section: 'learn',
    title: 'Can AI Reduce Food Waste at Home?',
    seoTitle: 'Can AI Reduce Food Waste at Home?',
    description:
      'UK homes throw away food worth £17bn a year. Where planning cuts waste, what AI adds to it, and what no app can do about the bin.',
    datePublished: '2026-08-05',
    dateModified: '2026-08-05',
    faq: [
      {
        question: 'How much food does a UK household waste?',
        answer:
          'WRAP puts it at around £1,000 a year for an average household of four, about £86 a month. Across the UK roughly 4.4 million tonnes of edible food worth £17 billion is thrown from homes each year.',
      },
      {
        question: 'Does meal planning reduce food waste?',
        answer:
          'Planning attacks the biggest cause, which is buying without a plan for using it. A planned week buys what the recipes need and no more. AI adds the reverse direction: starting the plan from what is already in the kitchen, so food gets cooked before it goes off rather than after.',
      },
    ], 
    cta: {
      heading: "Start from your kitchen, not a recipe",
      body: 'Photograph your next food shop and plan from what you own.',
      label: 'Scan a shop into Chop it',
      kind: 'app_store',
    },
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
    cta: {
      heading: "Import a recipe from Instagram",
      body: 'Paste a link or photograph a page, and keep it for good.',
      label: 'Import a recipe with Chop it',
      kind: 'app_store',
    },
  },
  {
    slug: 'chop-it-vs-chatgpt',
    section: 'learn',
    title: 'Chop it vs ChatGPT: What Each Does Better',
    seoTitle: 'Chop it vs ChatGPT for Meal Planning',
    description:
      'ChatGPT creates the recipes; Chop it adds guardrails: staged menus tuned for plant variety, UK phrasing, and recipe cards with macros.',
    datePublished: '2026-08-05',
    dateModified: '2026-08-05',
    faq: [
      {
        question: 'Is Chop it a replacement for ChatGPT?',
        answer:
          'No. ChatGPT creates Chop it’s recipes, so the two are additive rather than competitive. Chop it wraps the generation in guardrails: staged menus tuned to raise plant variety and keep fibre and protein high, UK phrasing and methods on every recipe, and structured recipe cards with macros and the Weekly Diversity Score. It also holds what a conversation cannot: the week, the merged list, the pantry and a library that takes recipes from sources other than AI.',
      },
      {
        question: 'Do I need both?',
        answer:
          'If you already plan meals in ChatGPT and retype the results somewhere, the combination removes that step and applies the guardrails on the way through. If you only ever want one-off dinner ideas, ChatGPT alone is enough and it is free.',
      },
    ], 
    cta: {
      heading: "Plan this week in ChatGPT",
      body: 'The conversation you already have, with the results kept.',
      label: 'Use Chop it in ChatGPT',
      kind: 'chatgpt',
    },
  },
];

export const RESEARCH_RESOURCES: ResourceMeta[] = [
  {
    slug: 'ai-cooking-statistics',
    section: 'research',
    title: 'AI Cooking Statistics: What the Research Shows',
    seoTitle: 'AI Cooking Statistics (UK, 2026)',
    description:
      'Sourced figures on AI in home cooking: 66.8% of Brits have used AI food tools, 75.9% would take AI recipe recommendations. Every number cited and dated.',
    datePublished: '2026-08-05',
    dateModified: '2026-08-15',
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

// Canonical feature pages. Only features with enough verified substance to
// avoid thin content get one; the rest live as sections of the
// what-is-chop-it walkthrough until they have real depth (screens, worked
// examples) behind them.
export const FEATURES_RESOURCES: ResourceMeta[] = [
  {
    slug: 'weekly-diversity-score',
    section: 'features',
    title: 'The Weekly Diversity Score: What It Measures and What It Does Not',
    seoTitle: 'Weekly Diversity Score in Chop it',
    description:
      'How Chop it scores a planned week across plants, fibre and protein, why it is directional guidance on variety rather than a health assessment.',
    datePublished: '2026-08-05',
    dateModified: '2026-08-05',
    faq: [
      {
        question: 'What is the Weekly Diversity Score?',
        answer:
          'A view of variety across the week you have planned in Chop it: how many different plants it contains and how it sits for fibre and protein. It reads the recipes on your plan, so it updates as the plan changes.',
      },
      {
        question: 'Is the Weekly Diversity Score a health score?',
        answer:
          'No. It is directional guidance on variety, nothing more. It does not diagnose, assess or make health claims; it shows you repetition and narrowness in a planned week so you can vary it if you want to.',
      },
    ],
    cta: {
      heading: 'See your own week scored',
      body: 'Plan a few dinners and the score reads what you chose.',
      label: 'Get the iPhone app',
      kind: 'app_store',
    },
  },
  {
    slug: 'pantry',
    section: 'features',
    title: 'The Chop it Pantry: Automatic Management, Explained',
    seoTitle: 'The Chop it Pantry, Explained',
    description:
      'How the pantry maintains itself: shops go in by photo, ingredients come off as meals are cooked, use-by life per ingredient, bulk edits by chat.',
    datePublished: '2026-08-05',
    dateModified: '2026-08-15',
    faq: [
      {
        question: 'Do I have to keep the pantry up to date by hand?',
        answer:
          'No, and that is the point of it. Shops go in as you add them, including photographed shops and veg boxes. Ingredients come off when you mark a meal cooked and return if you unmark it. Bulk changes are one confirmed chat instruction, such as emptying the fridge before a holiday.',
      },
      {
        question: 'How does the pantry handle food going off?',
        answer:
          'Every item carries a use-by life matched to what it is: days for fish and raw meat, longer for hardy vegetables, longer still for tins and dry goods. Items are flagged to use before they turn, and anything past its date is marked rather than silently deleted.',
      },
    ],
    cta: {
      heading: 'Photograph your next shop',
      body: 'One photo and the pantry starts maintaining itself.',
      label: 'Scan a shop into Chop it',
      kind: 'app_store',
    },
  },
];

const ALL: ResourceMeta[] = [...LEARN_RESOURCES, ...RESEARCH_RESOURCES, ...FEATURES_RESOURCES];

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
