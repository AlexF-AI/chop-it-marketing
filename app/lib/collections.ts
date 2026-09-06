// Editorial collection definitions for /recipes/collection/<slug>.
// Lives outside the page file because Next.js page modules can only
// export the canonical set (default, generateMetadata, generateStaticParams,
// revalidate, …) — any other named export is rejected at build time.
//
// Slugs match the curated tags_json._catalog.segments[] values produced by
// the offline catalog pass. Names and introductions are written for the
// search intent each page serves, while keeping the copy useful on-page.

export const COLLECTION_META: Record<string, { name: string; intro: string }> = {
  mediterranean: {
    name: 'Mediterranean diet recipes',
    intro:
      'Mediterranean diet recipes for everyday dinners: olive oil, vegetables, beans and lentils, fish and chicken, feta and yoghurt, with real quantities and a plant count for every recipe. Curated for people eating the Mediterranean way at home in the UK.',
  },
  quick: {
    name: 'Quick dinner recipes',
    intro:
      'Quick dinner recipes for busy weeknights, with clear methods, familiar ingredients and meals you can get on the table in 30 minutes or less.',
  },
  batch: {
    name: 'Batch cooking recipes',
    intro:
      'Batch cooking recipes that make several portions, freeze well and turn one session in the kitchen into easier dinners later in the week.',
  },
  comfort: {
    name: 'Comfort food recipes',
    intro:
      'Comfort food recipes for the nights that call for pies, pasta bakes, curries, stews and the familiar dinners everyone is pleased to see.',
  },
  puds: {
    name: 'Pudding and dessert recipes',
    intro:
      'Pudding and dessert recipes for finishing dinner properly, from fruit crumbles and baked classics to chocolate puddings and simple weekend treats.',
  },
  tray_bake: {
    name: 'Traybake recipes',
    intro:
      'Easy traybake recipes with the main ingredients cooked together in one tin. Expect clear timings, plenty of weeknight options and less washing up.',
  },
  fodmap: {
    name: 'Low-FODMAP dinner recipes',
    intro:
      'Low-FODMAP dinner recipes built around satisfying meals, clear ingredients and practical swaps. Always follow your own tolerances and clinical advice.',
  },
  healthy: {
    name: 'Healthy dinner recipes',
    intro:
      'Healthy dinner recipes that still feel like dinner, with vegetables, fibre and useful protein alongside the flavour and comfort that make a meal worth cooking.',
  },
  high_protein: {
    name: 'High-protein dinner recipes',
    intro:
      'High-protein dinner recipes with clear per-serving nutrition, from chicken and fish to vegetarian meals built around beans, lentils, eggs and dairy.',
  },
  one_pot: {
    name: 'One-pot recipes',
    intro:
      'One-pot recipes for stews, curries, pasta and rice dishes that keep the method simple, build flavour in one pan and leave less washing up.',
  },
  kid_friendly: {
    name: 'Family-friendly dinner recipes',
    intro:
      'Family-friendly dinner recipes that work for children without boring the adults, with approachable flavours, flexible toppings and easy ways to adjust a plate.',
  },
};

export const COLLECTION_SLUGS = Object.keys(COLLECTION_META);
