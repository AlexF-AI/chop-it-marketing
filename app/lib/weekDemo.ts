// The homepage's live "a week, for real" data.
//
// Four published recipes, their full ingredients and method, and the
// combined shopping list those four actually produce. The homepage used to
// show two app screenshots here; this is the same two claims made with the
// real catalogue, so the merge on screen is the merge the product does.
//
// Everything is read at build/revalidate time and rendered as plain HTML —
// no client fetching, and the section still means something with JS off.

import { supabase, supabaseConfigured } from './supabase';
import {
  buildShoppingList,
  type CanonicalIngredient,
  type ShoppingList,
  type SourceIngredient,
} from './shoppingList';

/** How many dinners the demo week holds. */
export const WEEK_SIZE = 4;

export type WeekRecipe = {
  id: string;
  slug: string;
  title: string;
  imageUrl: string | null;
  servings: number | null;
  totalMinutes: number | null;
  /** Full lines as written, e.g. "8 boneless, skin-on chicken thighs". */
  ingredientLines: string[];
  /** Method steps in order. */
  steps: string[];
};

export type WeekDemo = {
  recipes: WeekRecipe[];
  shoppingList: ShoppingList;
};

type RawIngredient = {
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

type RawStep = { text?: string | null } | string;

type Row = {
  id: string;
  slug: string | null;
  title: string | null;
  image_url: string | null;
  servings: number | null;
  timings_json: { total_minutes?: number | null } | null;
  ingredients_json: RawIngredient[] | null;
  method_steps_json: RawStep[] | null;
};

const COLUMNS =
  'id, slug, title, image_url, servings, timings_json, ingredients_json, method_steps_json, display_priority';

function toSourceIngredient(raw: RawIngredient): SourceIngredient {
  return {
    canonicalId: typeof raw.canonical_id === 'number' ? raw.canonical_id : null,
    canonicalName: raw.canonical_name ?? null,
    name: raw.name_uk ?? raw.name ?? null,
    display: raw.display ?? raw.rawText ?? null,
    // Published rows carry both `qty` and `quantity`; they agree, and `qty`
    // is the one the app writes first.
    qty: typeof raw.qty === 'number' ? raw.qty : typeof raw.quantity === 'number' ? raw.quantity : null,
    unit: raw.unit ?? null,
    optional: raw.optional === true,
    section: raw.section ?? null,
  };
}

function stepText(raw: RawStep): string | null {
  if (typeof raw === 'string') return raw.trim() || null;
  const text = raw?.text?.trim();
  return text ? text : null;
}

/**
 * The four dinners, and the shop they add up to.
 *
 * Returns null when Supabase isn't configured (preview builds, a local
 * checkout without env) so the homepage can fall back rather than render an
 * empty promise.
 */
export async function getWeekDemo(): Promise<WeekDemo | null> {
  if (!supabase || !supabaseConfigured) return null;

  const { data, error } = await supabase
    .from('recipes_published')
    .select(COLUMNS)
    .eq('seo_published', true)
    .is('deleted_at', null)
    .not('slug', 'is', null)
    .not('image_url', 'is', null)
    .not('ingredients_json', 'is', null)
    .order('display_priority', { ascending: false, nullsFirst: false })
    .order('title', { ascending: true })
    .limit(WEEK_SIZE);

  if (error || !data || data.length === 0) {
    if (error) console.error('[weekDemo] recipe query failed', error.message);
    return null;
  }

  const rows = data as Row[];

  const recipes: WeekRecipe[] = rows
    .map((r): WeekRecipe | null => {
      if (!r.slug || !r.title) return null;
      const rawIngredients = Array.isArray(r.ingredients_json) ? r.ingredients_json : [];
      return {
        id: r.id,
        slug: r.slug,
        title: r.title,
        imageUrl: r.image_url ?? null,
        servings: r.servings ?? null,
        totalMinutes: r.timings_json?.total_minutes ?? null,
        ingredientLines: rawIngredients
          .map((i) => i.display ?? i.rawText ?? i.name_uk ?? i.name ?? null)
          .filter((s): s is string => Boolean(s && s.trim())),
        steps: (Array.isArray(r.method_steps_json) ? r.method_steps_json : [])
          .map(stepText)
          .filter((s): s is string => s !== null),
      };
    })
    .filter((r): r is WeekRecipe => r !== null);

  if (recipes.length === 0) return null;

  // Ingredient objects for the merge, kept alongside the display lines.
  const perRecipe = rows.map((r) => ({
    title: r.title ?? '',
    ingredients: (Array.isArray(r.ingredients_json) ? r.ingredients_json : []).map(
      toSourceIngredient,
    ),
  }));

  const ids = Array.from(
    new Set(
      perRecipe
        .flatMap((r) => r.ingredients)
        .map((i) => i.canonicalId)
        .filter((id): id is number => id !== null),
    ),
  );

  const catalogue = new Map<number, CanonicalIngredient>();
  if (ids.length > 0) {
    const { data: cat, error: catError } = await supabase.rpc('get_ingredient_catalogue', {
      p_ids: ids,
    });
    if (catError) {
      // The list still builds without the catalogue — ingredients merge on
      // their canonical id regardless, they just lose their section and the
      // pantry-staple flag. Worth a log, not worth failing the page.
      console.error('[weekDemo] catalogue lookup failed', catError.message);
    } else if (Array.isArray(cat)) {
      for (const row of cat as {
        id: number;
        name_uk: string | null;
        category: string | null;
        pantry_staple: boolean | null;
      }[]) {
        catalogue.set(row.id, {
          id: row.id,
          name: row.name_uk ?? '',
          category: row.category ?? null,
          pantryStaple: row.pantry_staple === true,
        });
      }
    }
  }

  return { recipes, shoppingList: buildShoppingList(perRecipe, catalogue) };
}
