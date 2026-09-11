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
// The aisles are the app's own — see lib/shopAisles.ts.

// Imported with its extension so `npm test` can run this module under
// Node's type-stripping loader, with no bundler in the way.
import { aisleLabel, shopAisle, SHOP_AISLES, type ShopAisle } from './shopAisles.ts';

export type CanonicalIngredient = {
  id: number;
  name: string;
  /** "chicken thighs" for "chicken thigh". May be absent. */
  plural: string | null;
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
  /**
   * The amount's parts, one per unit. Two or more means the quantities
   * could not be added (see formatAmount), which changes how the line is
   * laid out — "6 cloves + 6 Garlic" reads like a typo, so a line like
   * that puts its amount after the name instead.
   */
  amountParts: string[];
  /** Titles of the recipes that wanted it, de-duplicated, in order. */
  fromRecipes: string[];
  /** Ingredient lines that collapsed into this one. */
  mergedFrom: number;
  pantryStaple: boolean;
  /** True only when every contributing line was optional. */
  optional: boolean;
};

export type ShoppingSection = {
  aisle: ShopAisle;
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
function amountParts(byUnit: Map<string, number>): string[] {
  const parts: string[] = [];
  for (const [unit, qty] of byUnit) {
    if (!Number.isFinite(qty) || qty <= 0) continue;
    parts.push(unit === '' ? formatQty(qty) : `${formatQty(qty)} ${unit}`);
  }
  return parts;
}

/**
 * Singular or plural, the way the app writes a list line.
 *
 * "20 Chicken thigh" reads like a bug. The plural is used only when the
 * whole amount is a bare count above one: "3 Lemons", but "300 g Chicken
 * thigh" and "8 slices Prosciutto" stay singular, because those are a
 * weight and a portion of one thing rather than a number of things. It
 * also keeps garlic honest — its plural is "garlic bulbs", and a line
 * reading "6 cloves" is not asking for bulbs.
 */
function displayName(
  name: string,
  plural: string | null,
  byUnit: Map<string, number>,
): string {
  if (!plural || byUnit.size !== 1) return name;
  const count = byUnit.get('');
  if (count === undefined || count <= 1) return name;
  return tidyName(plural);
}

export function buildShoppingList(
  recipes: SourceRecipe[],
  catalogue: Map<number, CanonicalIngredient>,
): ShoppingList {
  type Bucket = {
    key: string;
    name: string;
    plural: string | null;
    aisle: ShopAisle;
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
          plural: canonical?.plural ?? null,
          aisle: shopAisle(rawName, canonical?.category ?? null),
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
    name: displayName(b.name, b.plural, b.byUnit),
    amount: amountParts(b.byUnit).join(' + '),
    amountParts: amountParts(b.byUnit),
    fromRecipes: b.fromRecipes,
    mergedFrom: b.mergedFrom,
    pantryStaple: b.pantryStaple,
    optional: b.optionalCount === b.mergedFrom,
  }));

  const sections: ShoppingSection[] = [];
  for (const { id } of SHOP_AISLES) {
    const inSection = lines
      .filter((l) => buckets.get(l.key)?.aisle === id)
      // Most-shared first — the merged lines are the point of the list.
      .sort((a, b) => b.mergedFrom - a.mergedFrom || a.name.localeCompare(b.name));
    if (inSection.length > 0) {
      sections.push({ aisle: id, label: aisleLabel(id), lines: inSection });
    }
  }

  return {
    sections,
    totalIngredientLines,
    totalShoppingLines: lines.length,
    pantryStapleLines: lines.filter((l) => l.pantryStaple).length,
  };
}
