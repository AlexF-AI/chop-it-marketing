// Curated cuisine collection landing pages.
//
// Mirrors app/lib/collections.ts (which carries the editorial-segment
// landings, /recipes/collection/<slug>) — slug-keyed map + ordered slug
// list. Used by the /recipes/cuisine/[slug] page + the sitemap +
// the /recipes hub "Browse by cuisine" section.
//
// The order in CUISINE_SLUGS is recipe-count descending at the time of
// writing (British 255 → Chinese 10). Counts come from the
// search_public_recipes RPC with p_cuisines=[slug] — see the RPC
// implementation in the backend repo for the cuisine → recipe mapping.

export type CuisineMeta = { name: string; intro: string };

export const CUISINE_META: Record<string, CuisineMeta> = {
  british: {
    name: 'British',
    intro:
      'British recipes for everyday cooking, from roast dinners and cottage pie to curries, traybakes and the comfort food UK kitchens return to.',
  },
  italian: {
    name: 'Italian',
    intro:
      'Italian recipes built around pasta, risotto, tomatoes, cheese and good olive oil, with quick weeknight dinners alongside slower weekend cooking.',
  },
  mediterranean: {
    name: 'Mediterranean',
    intro:
      'Mediterranean recipes full of vegetables, pulses, fish, herbs, lemon and olive oil, from fresh salads to generous one-pan dinners.',
  },
  'middle-eastern': {
    name: 'Middle Eastern',
    intro:
      'Middle Eastern recipes with warm spices, grains, herbs and dishes made for sharing, including kebabs, mezze, pilafs and slow-cooked mains.',
  },
  mexican: {
    name: 'Mexican',
    intro:
      'Mexican recipes for tacos, enchiladas, chilli, salsas and bright weeknight dinners, with heat and toppings kept easy to adjust at the table.',
  },
  asian: {
    name: 'Asian',
    intro:
      'A broad collection of Asian-inspired recipes, including stir-fries, curries, noodle dishes and rice bowls made for practical home cooking.',
  },
  japanese: {
    name: 'Japanese',
    intro:
      'Japanese recipes for ramen, rice bowls, katsu, teriyaki and lighter dishes, using clear methods and ingredients available in UK shops.',
  },
  american: {
    name: 'American',
    intro:
      'American recipes for burgers, barbecue, fried chicken, mac and cheese, diner favourites and big, relaxed meals built for sharing.',
  },
  french: {
    name: 'French',
    intro:
      'French recipes that bring bistro cooking home, from gratins, tarts and steak suppers to braises that reward a slower afternoon.',
  },
  indian: {
    name: 'Indian',
    intro:
      'Indian recipes for curries, dals, rice dishes and grilled favourites, with layered spices and practical methods for the home kitchen.',
  },
  greek: {
    name: 'Greek',
    intro:
      'Greek recipes with lemon, oregano, feta, vegetables and lamb, from quick mezze and salads to traybakes and slow-cooked family meals.',
  },
  thai: {
    name: 'Thai',
    intro:
      'Thai recipes balancing sweet, sour, salty and hot flavours across curries, noodle dishes, stir-fries and fresh, herb-led meals.',
  },
  spanish: {
    name: 'Spanish',
    intro:
      'Spanish recipes for tapas, paella, tortilla, seafood and slow-cooked dishes, with bold flavours and plenty made for the middle of the table.',
  },
  vietnamese: {
    name: 'Vietnamese',
    intro:
      'Vietnamese recipes combining fresh herbs, sharp dressings, noodles and deeply savoury broths in meals that stay bright and balanced.',
  },
  korean: {
    name: 'Korean',
    intro:
      'Korean recipes built around gochujang, kimchi, sesame and soy, from crisp fried favourites to rice bowls, noodles and barbecue-style dinners.',
  },
  moroccan: {
    name: 'Moroccan',
    intro:
      'Moroccan recipes with warm spices, preserved lemon, couscous and slow-cooked tagines, plus quicker dishes for an ordinary weeknight.',
  },
  chinese: {
    name: 'Chinese',
    intro:
      'Chinese recipes for stir-fries, noodles, dumplings, steamed dishes and slow braises, with clear steps for getting the best from a home hob.',
  },
};

// Order by recipe-count desc so the /recipes hub "Browse by cuisine"
// section surfaces the biggest sections first. Values are the production
// counts returned by search_public_recipes(p_cuisines := ARRAY[slug])
// at PR time — used only for ordering + the optional count badge.
export const CUISINE_COUNTS: Record<string, number> = {
  british: 255,
  italian: 109,
  mediterranean: 70,
  'middle-eastern': 52,
  mexican: 41,
  asian: 38,
  japanese: 35,
  american: 32,
  french: 26,
  indian: 22,
  greek: 18,
  thai: 16,
  spanish: 15,
  vietnamese: 13,
  korean: 12,
  moroccan: 11,
  chinese: 10,
};

export const CUISINE_SLUGS = Object.keys(CUISINE_META) as readonly string[];
