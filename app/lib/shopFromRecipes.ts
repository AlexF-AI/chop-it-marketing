// Builds a combined shopping list from published recipes.
//
// The merge itself is pure and lives in shoppingList.ts. This is the part
// that needs the database: reading each recipe's ingredients into the
// merge's input shape, and looking up the canonical reference rows that
// give a line its aisle, its plural and its pantry-staple flag.
//
// Two surfaces use it and must not drift apart: the homepage's week
// (lib/weekDemo.ts) and the menu builder's live shop for whatever you have
// picked (app/api/menu/shop). A visitor who builds the homepage's four
// dinners in the builder should get the homepage's list.

import { supabase } from './supabase';
import {
  buildShoppingList,
  type CanonicalIngredient,
  type ShoppingList,
  type SourceIngredient,
  type SourceRecipe,
} from './shoppingList';

/** An ingredient as `recipes_published.ingredients_json` stores it. */
export type RawIngredient = {
  canonical_id?: number | null;
  canonical_name?: string | null;
  name_uk?: string | null;
  name?: string | null;
  display?: string | null;
  rawText?: string | null;
  qty?: number | null;
  quantity?: number | null;
  unit?: string | null;
  optional?: boolean | null;
  section?: string | null;
};

export function toSourceIngredient(raw: RawIngredient): SourceIngredient {
  return {
    canonicalId: typeof raw.canonical_id === 'number' ? raw.canonical_id : null,
    canonicalName: raw.canonical_name ?? null,
    name: raw.name_uk ?? raw.name ?? null,
    display: raw.display ?? raw.rawText ?? null,
    // Published rows carry both `qty` and `quantity`; they agree, and `qty`
    // is the one the app writes first.
    qty:
      typeof raw.qty === 'number'
        ? raw.qty
        : typeof raw.quantity === 'number'
          ? raw.quantity
          : null,
    unit: raw.unit ?? null,
    optional: raw.optional === true,
    section: raw.section ?? null,
  };
}

/**
 * Reference rows for the canonical ids these recipes use.
 *
 * Returns an empty map rather than throwing when the lookup fails: the list
 * still builds without it — ingredients merge on their canonical id
 * regardless — they just lose their aisle, their plural and the
 * pantry-staple flag. Worth a log, not worth failing the page.
 */
export async function loadCatalogue(
  recipes: SourceRecipe[],
): Promise<Map<number, CanonicalIngredient>> {
  const catalogue = new Map<number, CanonicalIngredient>();
  if (!supabase) return catalogue;

  const ids = Array.from(
    new Set(
      recipes
        .flatMap((r) => r.ingredients)
        .map((i) => i.canonicalId)
        .filter((id): id is number => id !== null),
    ),
  );
  if (ids.length === 0) return catalogue;

  const { data, error } = await supabase.rpc('get_ingredient_catalogue', { p_ids: ids });
  if (error) {
    console.error('[shopFromRecipes] catalogue lookup failed', error.message);
    return catalogue;
  }
  if (!Array.isArray(data)) return catalogue;

  for (const row of data as {
    id: number;
    name_uk: string | null;
    plural: string | null;
    category: string | null;
    pantry_staple: boolean | null;
  }[]) {
    catalogue.set(row.id, {
      id: row.id,
      name: row.name_uk ?? '',
      plural: row.plural ?? null,
      category: row.category ?? null,
      pantryStaple: row.pantry_staple === true,
    });
  }
  return catalogue;
}

/** The combined shop for a set of recipes, plus the same merge per recipe. */
export type Shop = {
  combined: ShoppingList;
  perRecipe: { title: string; list: ShoppingList }[];
};

/**
 * Both lists in one pass.
 *
 * `perRecipe` is built rather than derived by filtering `combined`, because
 * the combined amounts are the whole shop's: four dinners may want 20
 * chicken thighs while one of them wants 12. Line keys are the same in
 * both, so a tick in one view is a tick in the other.
 */
export async function buildShop(
  recipes: SourceRecipe[],
  /** Pass one already in hand to save the round trip. */
  catalogue?: Map<number, CanonicalIngredient>,
): Promise<Shop> {
  const reference = catalogue ?? (await loadCatalogue(recipes));
  return {
    combined: buildShoppingList(recipes, reference),
    perRecipe: recipes.map((r) => ({
      title: r.title,
      list: buildShoppingList([r], reference),
    })),
  };
}

/** Rows of `{ title, ingredients_json }` in the merge's input shape. */
export function toSourceRecipes(
  rows: { title: string | null; ingredients_json: RawIngredient[] | null }[],
): SourceRecipe[] {
  return rows.map((r) => ({
    title: r.title ?? '',
    ingredients: (Array.isArray(r.ingredients_json) ? r.ingredients_json : []).map(
      toSourceIngredient,
    ),
  }));
}
