// Per-article structured data for markdown blog posts.
//
// The blog template emits BlogPosting + BreadcrumbList for every article.
// A comparison article earns two more types, and both are keyed by slug here
// rather than parsed out of the markdown: FAQ answers have to match the
// visible page text exactly for Google to accept them, and deriving that from
// rendered markdown would silently drift the moment someone edits a heading.
//
// Adding an article does not require an entry. Only articles that carry an
// FAQ block or a ranked list need one.

/** Must match the visible FAQ copy in content/blog/<slug>.md word for word. */
export type FaqEntry = { question: string; answer: string };

/** An app in a ranked comparison list. `url` is the store listing. */
export type ListedApp = { name: string; operatingSystem: string; url: string };

export const FAQ_BY_SLUG: Record<string, FaqEntry[]> = {
  'best-meal-planning-apps-uk-2026': [
    {
      question: 'What is the best meal planner app in the UK?',
      answer:
        'There is no single winner, because the apps solve different problems. Good Food has the best British recipe archive. Paprika 3 is the best way to own a collection without a subscription. Samsung Food is the strongest free planner. Cherrypick is the only one that prices your basket at a UK supermarket while you plan. Chop it is built for recipes arriving from mixed sources including AI.',
    },
    {
      question: 'Is there a free meal planning app in the UK?',
      answer:
        "Yes, several. Samsung Food has the most capable free tier, covering saving, planning and shopping lists across iOS, Android and web. Mealime's free tier is usable on its own. AnyList and Cherrypick both have free versions, Good Food is free to browse, and Chop it is free to start. Paprika 3 has no free tier because it is a £4.99 one-time purchase instead.",
    },
    {
      question: 'Which meal planning app has the best shopping list?',
      answer:
        'For a shared household list, AnyList. For a list that becomes an actual supermarket basket with prices, Cherrypick. For merging duplicate ingredients across several recipes into single lines, Chop it. Mealime and Plan to Eat both produce clean aisle-sorted lists from your plan.',
    },
    {
      question: 'Can I use ChatGPT for meal planning instead of an app?',
      answer:
        'For coming up with ideas, yes, and the free tier is enough. It struggles with continuity: it will not remember the week you planned on Sunday, cannot hold a running shopping list, and does not know what is in your cupboards. Either accept some retyping or use something that keeps the output.',
    },
    {
      question: 'Which meal planning apps work on Android?',
      answer:
        'Mealime, Samsung Food, Paprika 3, Cherrypick, Plan to Eat, AnyList, Eat This Much, Good Food and Mob all have Android apps. Chop it is iPhone-only at the moment, though the ChatGPT app works on any device.',
    },
    {
      question: 'How much should I expect to pay?',
      answer:
        'The cheapest paid tier here is Mealime at £2.99 a month. The cheapest annual commitment is AnyList at £9.99. Paprika 3 costs £4.99 once and never again. At the other end, Eat This Much is £14.99 a month and Samsung Food is £59.99 a year. Most people should start on a free tier and only pay once they have used an app for a fortnight.',
    },
  ],
  'chatgpt-meal-planning': [
    {
      question: 'Can ChatGPT create a weekly meal plan?',
      answer:
        'Yes, and it is good at it. Give it your constraints in one message, ask for titles before methods, then ask separately for a merged shopping list grouped by supermarket section. The free tier is enough. The limitation is that the plan lives in a conversation, so you will need to move it somewhere you will actually look during the week.',
    },
    {
      question: 'Is ChatGPT meal planning free?',
      answer:
        'Yes. Everything described here works on the free tier. ChatGPT Go is £6.99 and Plus is £19.99 on the UK App Store, but neither is necessary for planning meals.',
    },
    {
      question: 'Why does ChatGPT forget my meal plan?',
      answer:
        'Each conversation is its own context, and a plan you made last Sunday is prose inside an older chat rather than a saved record. Memory can retain preferences like "no fish" but will not reliably hold the specifics of which five dinners you chose. Continue the same conversation week to week, or move the plan out into something built to keep it.',
    },
    {
      question: 'Can ChatGPT make a shopping list from recipes?',
      answer:
        'It can, and you should ask for it as a separate step after the recipes are settled. Tell it explicitly to merge duplicate ingredients into single lines with total quantities and to group by supermarket section. Without that instruction you tend to get the same ingredient repeated once per recipe.',
    },
    {
      question: 'Is ChatGPT better than a meal planning app?',
      answer:
        'For generating ideas and adapting recipes to your constraints, it is better than every app I have compared. For keeping a plan, a list and a recipe collection across weeks, a purpose-built app wins, because those need storage and structure rather than generation. Plenty of people sensibly use both.',
    },
  ],
  'meal-planning-app-shopping-list-uk': [
    {
      question: 'Which meal planning app has the best shopping list in the UK?',
      answer:
        "It depends which job you need done. Cherrypick turns the list into a priced basket at Sainsbury's, Tesco or Asda. AnyList is the best shared list for a household. Mealime produces the cleanest aisle-sorted list on a free tier. Chop it is built around merging ingredients from recipes that arrived from different sources.",
    },
    {
      question: 'Do meal planning apps combine duplicate ingredients?',
      answer:
        'The good ones do, and it is worth checking rather than assuming. Plan four recipes that each use onions and look at whether the list gives you one line with the total or four separate lines. Apps that store ingredients as structured quantities handle this more reliably than apps storing them as text.',
    },
    {
      question: 'Is there a free meal planning app with a shopping list?',
      answer:
        "Yes. Samsung Food has the strongest free tier, covering saving, planning and a merged list across iOS, Android and web. Mealime's free tier is usable on its own. AnyList and Cherrypick both have free versions, and Chop it is free to start.",
    },
    {
      question: 'Can I share a shopping list with my partner?',
      answer:
        'AnyList is built around this and does it best, with real-time editing for a household at £14.99 a year. Samsung Food supports sharing too. Most other apps here assume one person doing the shop.',
    },
  ],
};

// Ranked order matches the order the apps appear in the article body. No
// `offers` here on purpose: most of these are free downloads with paid tiers,
// and a single price property would misrepresent that. The prose carries the
// pricing, with its verification date.
export const APP_LIST_BY_SLUG: Record<string, ListedApp[]> = {
  'best-meal-planning-apps-uk-2026': [
    {
      name: 'Chop it',
      operatingSystem: 'iOS',
      url: 'https://apps.apple.com/gb/app/chop-it/id6762079343',
    },
    {
      name: 'Mealime',
      operatingSystem: 'iOS, Android',
      url: 'https://apps.apple.com/gb/app/mealime-meal-plans-recipes/id1079999103',
    },
    {
      name: 'Samsung Food',
      operatingSystem: 'iOS, Android, Web',
      url: 'https://apps.apple.com/gb/app/samsung-food-meal-planning/id1133637674',
    },
    {
      name: 'Paprika Recipe Manager 3',
      operatingSystem: 'iOS, Android, macOS, Windows',
      url: 'https://apps.apple.com/gb/app/paprika-recipe-manager-3/id1303222868',
    },
    {
      name: 'Cherrypick',
      operatingSystem: 'iOS, Android',
      url: 'https://apps.apple.com/gb/app/cherrypick-plan-shop-cook/id1567423761',
    },
    {
      name: 'Plan to Eat',
      operatingSystem: 'iOS, Android, Web',
      url: 'https://apps.apple.com/gb/app/plan-to-eat/id1215348056',
    },
    {
      name: 'AnyList',
      operatingSystem: 'iOS, Android, Web',
      url: 'https://apps.apple.com/gb/app/anylist-grocery-shopping-list/id522167641',
    },
    {
      name: 'Eat This Much',
      operatingSystem: 'iOS, Android, Web',
      url: 'https://apps.apple.com/gb/app/eat-this-much-meal-planner/id981637806',
    },
    {
      name: 'Good Food',
      operatingSystem: 'iOS, Android, Web',
      url: 'https://apps.apple.com/gb/app/good-food-recipe-finder/id533785308',
    },
    {
      name: 'Mob',
      operatingSystem: 'iOS, Android, Web',
      url: 'https://apps.apple.com/gb/app/mob-meal-planner-and-recipes/id6670216494',
    },
  ],
};

export function buildFaqJsonLd(entries: FaqEntry[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((e) => ({
      '@type': 'Question',
      name: e.question,
      acceptedAnswer: { '@type': 'Answer', text: e.answer },
    })),
  };
}

export function buildAppItemListJsonLd(
  pageUrl: string,
  name: string,
  apps: ListedApp[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    url: pageUrl,
    numberOfItems: apps.length,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    itemListElement: apps.map((app, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'SoftwareApplication',
        name: app.name,
        applicationCategory: 'LifestyleApplication',
        operatingSystem: app.operatingSystem,
        url: app.url,
      },
    })),
  };
}
