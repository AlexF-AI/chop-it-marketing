// Which aisle a shopping-list line belongs to.
//
// The app groups a shopping list by supermarket aisle — Meat & Fish, Dairy
// & Eggs, Vegetables, and so on. The names and the order here are the
// app's own (client/src/lib/shopCategories.ts: SHOP_CATEGORY_LABELS and
// SHOP_CATEGORY_ORDER, most perishable first), so a list on this site is
// grouped the way the list in the product is.
//
// The app classifies from the ingredient's name, because its lists include
// items a user typed. This site only ever shows published recipes, whose
// ingredients carry a canonical id, so the classification here starts from
// the controlled `ingredients_canonical` vocabulary and only falls back to
// the coarse canonical category (protein / veg / carb / fat / flavour) for
// a name it does not recognise. That is five buckets where the app has
// thirteen, which is exactly why the name pass exists: "burrata" and
// "chicken thigh" are both `protein`, and they are not bought in the same
// aisle.
//
// Pure and dependency-free so lib/shopping-list.test.ts can cover it.

export type ShopAisle =
  | 'meat_and_fish'
  | 'dairy_and_eggs'
  | 'vegetables'
  | 'fruit'
  | 'herbs'
  | 'pasta_and_grains'
  | 'sauces'
  | 'oils_and_vinegars'
  | 'baking'
  | 'tinned_and_jarred'
  | 'frozen'
  | 'spices_and_seasoning'
  | 'pantry';

/** Aisle order and labels, as the app has them. */
export const SHOP_AISLES: { id: ShopAisle; label: string }[] = [
  { id: 'meat_and_fish', label: 'Meat & Fish' },
  { id: 'dairy_and_eggs', label: 'Dairy & Eggs' },
  { id: 'vegetables', label: 'Vegetables' },
  { id: 'fruit', label: 'Fruit' },
  { id: 'herbs', label: 'Herbs' },
  { id: 'pasta_and_grains', label: 'Pasta & Grains' },
  { id: 'sauces', label: 'Sauces' },
  { id: 'oils_and_vinegars', label: 'Oils & Vinegars' },
  { id: 'baking', label: 'Baking' },
  { id: 'tinned_and_jarred', label: 'Tinned & Jarred' },
  { id: 'frozen', label: 'Frozen' },
  { id: 'spices_and_seasoning', label: 'Spices & Seasoning' },
  { id: 'pantry', label: 'Pantry' },
];

/**
 * Name rules, tried in order. The order is the whole design: the first
 * match wins, so anything ambiguous has to be settled before the general
 * rule that would otherwise claim it.
 *
 * The cases that need it: "butter beans" before "butter"; "chilli flakes"
 * before fresh "red chilli"; "ground coriander" before the fresh herb;
 * "cherry tomato" before "cherry"; "flour tortilla" before "flour";
 * "balsamic vinegar" before "white wine"; and "olive" (jarred) before
 * "olive oil" would be wrong, so oils are matched on the word `oil`.
 */
const RULES: { aisle: ShopAisle; test: RegExp }[] = [
  // Explicit tin/jar/freezer wording beats everything: a tin of tomatoes
  // is not bought in the vegetable aisle.
  { aisle: 'tinned_and_jarred', test: /\b(tinned|canned|tin of|can of|jarred|jar of)\b/ },
  { aisle: 'frozen', test: /\bfrozen\b/ },

  // Stock is a cupboard item wherever its flavour came from: "chicken
  // stock" is not shopped in the meat aisle.
  { aisle: 'pantry', test: /\bstocks?\b|\bbroth\b|\bbouillon\b/ },

  // Pulses and preserves, before the vegetable and dairy rules. Olives are
  // jarred; olive oil is not, so it is excluded here and caught by the oils
  // rule below.
  {
    aisle: 'tinned_and_jarred',
    test: /\b(butter|black|kidney|cannellini|borlotti|haricot|pinto|broad|baked|mixed)\s+beans?\b|\bchickpeas?\b|\blentils?\b|\bolives?\b(?!\s*oil)|\bcapers?\b|\bsun-?dried tomato(es)?\b|\banchov(y|ies)\b|\bpassata\b|\bcoconut milk\b/,
  },

  { aisle: 'meat_and_fish', test: /\b(chicken|turkey|duck|beef|steak|mince|meatballs?|pork|bacon|sausages?|chorizo|ham|prosciutto|pancetta|gammon|lamb|salmon|cod|haddock|tuna|mackerel|trout|sardines?|sea ?bass|sea ?bream|monkfish|hake|plaice|sole|prawns?|shrimps?|crab|lobster|mussels?|scallops?|oysters?|squid|calamari|octopus|fish)\b/ },

  { aisle: 'dairy_and_eggs', test: /\b(milk|cream|crème fraîche|creme fraiche|yoghurt|yogurt|cheese|cheddar|parmesan|pecorino|mozzarella|burrata|feta|halloumi|ricotta|mascarpone|stilton|gruy[eè]re|manchego|paneer|labneh|eggs?|tofu|tempeh)\b|\bbutter\b(?!\s*beans?)/ },

  // Dried leaves are a cupboard spice; fresh ones are a herb.
  { aisle: 'spices_and_seasoning', test: /\bdried\b|\bbay lea(f|ves)\b|\bground\b|\bseeds?\b|\b(salt|pepper|peppercorns?|paprika|cumin|turmeric|cinnamon|nutmeg|cardamom|cloves|star anise|allspice|cayenne|oregano|saffron|sumac|za'?atar|garam masala|ras el hanout|five ?spice|curry powder|chilli (flakes|powder)|chill?i flakes|seasoning)\b/ },

  { aisle: 'herbs', test: /\b(basil|coriander|cilantro|parsley|mint|dill|chives|tarragon|thyme|rosemary|sage|lemongrass)\b/ },

  { aisle: 'oils_and_vinegars', test: /\boils?\b|\bvinegar\b/ },

  // Cooking alcohol, after vinegars so "red wine vinegar" is a vinegar.
  // The app has no drinks aisle, so it goes to the cupboard.
  { aisle: 'pantry', test: /\b(wine|beer|cider|sherry|vermouth|marsala|brandy|rum)\b/ },

  { aisle: 'sauces', test: /\bsauces?\b|\bpaste\b|\bketchup\b|\bmustard\b|\bmayo(nnaise)?\b|\bpesto\b|\btahini\b|\bmiso\b|\bharissa\b|\bsoy\b|\bworcestershire\b|\bchutney\b|\bpickle[sd]?\b|\brelish\b/ },

  { aisle: 'pasta_and_grains', test: /\b(pasta|spaghetti|linguine|tagliatelle|penne|rigatoni|macaroni|orzo|lasagne|gnocchi|rice|risotto|noodles?|couscous|bulgur|freekeh|quinoa|pearl barley|barley|oats|polenta|bread|breadcrumbs?|tortillas?|wraps?|pitta|naan|ciabatta|sourdough|baguette|brioche|flatbread)\b/ },

  { aisle: 'baking', test: /\b(flour|sugar|yeast|baking powder|bicarbonate|cocoa|vanilla|honey|maple syrup|syrup|chocolate|icing)\b/ },

  { aisle: 'fruit', test: /\b(lemons?|limes?|oranges?|apples?|pears?|peach(es)?|nectarines?|plums?|prunes?|apricots?|bananas?|berr(y|ies)|strawberr(y|ies)|raspberr(y|ies)|blueberr(y|ies)|grapes?|mangoe?s?|melon|watermelon|pineapple|pomegranate|figs?|dates?|raisins?|sultanas?|avocados?|rhubarb)\b|\bcherr(y|ies)\b(?!\s*tomato)/ },

  { aisle: 'vegetables', test: /\b(onions?|shallots?|garlic|leeks?|carrots?|celery|potatoes?|potato|tomato(es)?|peppers?|chill?i(es)?|jalape[nñ]os?|aubergines?|courgettes?|mushrooms?|spinach|rocket|lettuce|cucumbers?|cabbage|broccoli|cauliflower|squash|pumpkin|peas|mangetout|green beans|runner beans|beansprouts?|sweetcorn|corn|kale|chard|fennel|beetroot|radish(es)?|asparagus|samphire|ginger|pak choi|bok choy|spring greens|parsnips?|swede|turnips?|celeriac|artichokes?)\b/ },
];

/**
 * The canonical category is five coarse buckets, so it can only ever be a
 * fallback. `flavour` in particular spans herbs, spices, sauces and wine,
 * which is why the name rules run first.
 */
const CATEGORY_FALLBACK: Record<string, ShopAisle> = {
  protein: 'meat_and_fish',
  veg: 'vegetables',
  carb: 'pasta_and_grains',
  fat: 'oils_and_vinegars',
  flavour: 'spices_and_seasoning',
};

/** The aisle for an ingredient, by name first and category second. */
export function shopAisle(name: string, category: string | null): ShopAisle {
  const normalised = name.toLowerCase().trim();
  for (const rule of RULES) {
    if (rule.test.test(normalised)) return rule.aisle;
  }
  return CATEGORY_FALLBACK[category ?? ''] ?? 'pantry';
}

export function aisleLabel(aisle: ShopAisle): string {
  return SHOP_AISLES.find((a) => a.id === aisle)?.label ?? 'Pantry';
}
