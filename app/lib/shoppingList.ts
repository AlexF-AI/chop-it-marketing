// Merges the ingredients of several recipes into one shopping list.
//
// This is the homepage's "one shop" claim, done for real rather than shown
// as a screenshot: four recipes that each want an onion produce one onion
// line, not four. Pure and dependency-free so it can be unit-tested — the
// fetching lives in weekDemo.ts.
//
// Two things make a real merge possible. Published ingredients carry a
// `canonical_id` (92% of rows), so "3 garlic cloves" and "2 garlic cloves,
// crushed" are known to be the same thing; and `ingredients_canonical`
// carries a category and a `pantry_staple` flag, which is what lets the
// list group itself and set aside what is probably already in the cupboard.

export type CanonicalIngredient = {
  id: number;
  name: string;
  category: string | null;
  pantryStaple: boolean;
};

export type SourceIngredient = {
  canonicalId: number | null;
  canonicalName: string | null;
  /** The recipe's own wording, e.g. "plain flour". */
  name: string | null;
  /** The full line, e.g. "60 g plain flour". */
  display: string | null;
  qty: number | null;
  unit: string | null;
  optional: boolean;
  /** "Ingredients", "To serve", … */
  section: string | null;
};

export type SourceRecipe = {
  title: string;
  ingredients: SourceIngredient[];
};

export type ShoppingLine = {
  key: string;
  /** What to buy. Canonical where known, else the recipe's own wording. */
  name: string;
  /** "460 g", "60 g + 1 tbsp", or '' when nothing was quantified. */
  amount: string;
  /** Titles of the recipes that wanted it, de-duplicated, in order. */
  fromRecipes: string[];
  /** Ingredient lines that collapsed into this one. */
  mergedFrom: number;
  pantryStaple: boolean;
  /** True only when every contributing line was optional. */
  optional: boolean;
};

export type ShoppingSection = {
  category: string;
  label: string;
  lines: ShoppingLine[];
};

export type ShoppingList = {
  sections: ShoppingSection[];
  /** Ingredient lines before merging. */
  totalIngredientLines: number;
  /** Distinct lines after merging. */
  totalShoppingLines: number;
  /** Lines flagged as probably already in the cupboard. */
  pantryStapleLines: number;
};

/**
 * Section labels.
 *
 * Deliberately named for what the category actually contains rather than
 * for a supermarket's aisles: `protein` holds halloumi, edamame and labneh
 * as well as meat and fish, and `veg` holds fruit and pickles, so "Meat and
 * fish" or "Vegetables" would both be wrong. Order is the order a list is
 * usually shopped in.
 */
const SECTIONS: { category: string; label: string }[] = [
  { category: 'veg', label: 'Fruit and veg' },
  { category: 'protein', label: 'Protein' },
  { category: 'carb', label: 'Carbs and grains' },
  { category: 'fat', label: 'Dairy, oils and nuts' },
  { category: 'flavour', label: 'Flavour and cupboard' },
  { category: 'other', label: 'Everything else' },
];

/** Trailing prep notes are for the recipe, not the shop. */
function tidyName(input: string): string {
  const withoutNotes = input.split(',')[0].trim();
  if (!withoutNotes) return input.trim();
  return withoutNotes.charAt(0).toUpperCase() + withoutNotes.slice(1);
}

/**
 * Numbers for a shopping list, not a lab: 0.5 -> "½", 1.0 -> "1",
 * 1.25 -> "1.25". Rounded to two places so floating-point addition can't
 * surface as "1.7000000000000002 tbsp".
 */
function formatQty(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  if (rounded === 0.5) return '½';
  if (rounded === 0.25) return '¼';
  if (rounded === 0.75) return '¾';
  if (Number.isInteger(rounded)) return String(rounded);
  return String(rounded);
}

/**
 * Renders the per-unit subtotals as one amount.
 *
 * Quantities only sum within a unit. "60 g plain flour" and "1 tbsp plain
 * flour" are the same ingredient but not addable without a density, so the
 * line reads "60 g + 1 tbsp" rather than inventing a conversion. Unitless
 * counts (3 garlic cloves) sum among themselves.
 */
function formatAmount(byUnit: Map<string, number>): string {
  const parts: string[] = [];
  for (const [unit, qty] of byUnit) {
    if (!Number.isFinite(qty) || qty <= 0) continue;
    parts.push(unit === '' ? formatQty(qty) : `${formatQty(qty)} ${unit}`);
  }
  return parts.join(' + ');
}

export function buildShoppingList(
  recipes: SourceRecipe[],
  catalogue: Map<number, CanonicalIngredient>,
): ShoppingList {
  type Bucket = {
    key: string;
    name: string;
    category: string;
    pantryStaple: boolean;
    byUnit: Map<string, number>;
    /** A line with no parseable quantity still has to appear. */
    hasUnquantified: boolean;
    fromRecipes: string[];
    mergedFrom: number;
    optionalCount: number;
  };

  const buckets = new Map<string, Bucket>();
  let totalIngredientLines = 0;

  for (const recipe of recipes) {
    for (const ing of recipe.ingredients) {
      const canonical =
        ing.canonicalId != null ? catalogue.get(ing.canonicalId) : undefined;

      // Fall back to the recipe's own wording when an ingredient has no
      // canonical entry. Those won't merge across recipes — that is a
      // catalogue gap, and silently dropping them would be worse.
      const rawName =
        canonical?.name ?? ing.canonicalName ?? ing.name ?? ing.display ?? null;
      if (!rawName) continue;

      totalIngredientLines += 1;

      const key =
        ing.canonicalId != null
          ? `c:${ing.canonicalId}`
          : `n:${rawName.trim().toLowerCase()}`;

      let bucket = buckets.get(key);
      if (!bucket) {
        bucket = {
          key,
          name: tidyName(rawName),
          category: canonical?.category ?? 'other',
          pantryStaple: canonical?.pantryStaple ?? false,
          byUnit: new Map(),
          hasUnquantified: false,
          fromRecipes: [],
          mergedFrom: 0,
          optionalCount: 0,
        };
        buckets.set(key, bucket);
      }

      bucket.mergedFrom += 1;
      if (ing.optional) bucket.optionalCount += 1;
      if (!bucket.fromRecipes.includes(recipe.title)) {
        bucket.fromRecipes.push(recipe.title);
      }

      if (typeof ing.qty === 'number' && Number.isFinite(ing.qty) && ing.qty > 0) {
        const unit = (ing.unit ?? '').trim();
        bucket.byUnit.set(unit, (bucket.byUnit.get(unit) ?? 0) + ing.qty);
      } else {
        bucket.hasUnquantified = true;
      }
    }
  }

  const lines: ShoppingLine[] = [...buckets.values()].map((b) => ({
    key: b.key,
    name: b.name,
    amount: formatAmount(b.byUnit),
    fromRecipes: b.fromRecipes,
    mergedFrom: b.mergedFrom,
    pantryStaple: b.pantryStaple,
    optional: b.optionalCount === b.mergedFrom,
  }));

  const sections: ShoppingSection[] = [];
  for (const { category, label } of SECTIONS) {
    const inSection = lines
      .filter((l) => l.key && categoryOf(buckets, l.key) === category)
      // Most-shared first — the merged lines are the point of the list.
      .sort((a, b) => b.mergedFrom - a.mergedFrom || a.name.localeCompare(b.name));
    if (inSection.length > 0) sections.push({ category, label, lines: inSection });
  }

  return {
    sections,
    totalIngredientLines,
    totalShoppingLines: lines.length,
    pantryStapleLines: lines.filter((l) => l.pantryStaple).length,
  };

  function categoryOf(all: Map<string, Bucket>, key: string): string {
    return all.get(key)?.category ?? 'other';
  }
}
