// Data layer for the /menu builder.
//
// Two jobs:
//   1. read a pool of pickable recipes (optionally narrowed to one cuisine)
//   2. mint a share code for a set of picks
//
// Both sit behind route handlers rather than being called from the browser,
// so the anon key stays server-side and there is one place to add throttling
// or a Turnstile check later.
//
// The pool is deliberately a pool, not a paginated browse: the builder is a
// "pick a few dinners" surface, not the recipes hub. A visitor who wants the
// whole catalogue has /recipes.

import { supabase, supabaseConfigured } from './supabase';
import { CUISINE_META, CUISINE_SLUGS } from './cuisines';

/** How many recipes the builder offers per cuisine (and for "All"). */
export const MENU_POOL_SIZE = 24;

/** Matches the 1..24 bound enforced by create_public_shared_menu. */
export const MAX_MENU_RECIPES = 24;

export type PickableRecipe = {
  id: string;
  slug: string;
  title: string;
  imageUrl: string | null;
  /** Pre-formatted for the card, e.g. "45 min · 40g protein · Serves 4". */
  meta: string;
  /** Cuisine slug, or null when the recipe isn't catalogued to one. */
  cuisine: string | null;
};

type Row = {
  id: string;
  slug: string | null;
  title: string | null;
  image_url: string | null;
  servings: number | null;
  timings_json: { total_minutes?: number | null } | null;
  nutrition_protein_g: number | null;
  tags_json: { _catalog?: { cuisines?: string[] } } | null;
};

const POOL_COLUMNS =
  'id, slug, title, image_url, servings, timings_json, nutrition_protein_g, tags_json, display_priority';

function buildMeta(row: Row): string {
  const bits: string[] = [];
  const minutes = row.timings_json?.total_minutes;
  if (typeof minutes === 'number' && minutes > 0) bits.push(`${minutes} min`);
  if (typeof row.nutrition_protein_g === 'number' && row.nutrition_protein_g > 0) {
    bits.push(`${Math.round(row.nutrition_protein_g)}g protein`);
  }
  if (typeof row.servings === 'number' && row.servings > 0) {
    bits.push(`Serves ${row.servings}`);
  }
  return bits.join(' · ');
}

function toPickable(row: Row): PickableRecipe | null {
  if (!row.slug || !row.title) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    imageUrl: row.image_url ?? null,
    meta: buildMeta(row),
    cuisine: row.tags_json?._catalog?.cuisines?.[0] ?? null,
  };
}

/**
 * Normalises whatever arrived on the wire into a known cuisine slug.
 * Returns null for "all" and for anything unrecognised, so an unknown value
 * widens to the full pool rather than returning an empty list.
 */
export function normaliseCuisineFilter(value: string | null | undefined): string | null {
  if (!value) return null;
  const slug = value.trim().toLowerCase();
  if (!slug || slug === 'all') return null;
  return CUISINE_SLUGS.includes(slug) ? slug : null;
}

export async function getPickableRecipes(
  cuisine?: string | null,
): Promise<PickableRecipe[]> {
  if (!supabase || !supabaseConfigured) return [];

  let q = supabase
    .from('recipes_published')
    .select(POOL_COLUMNS)
    .eq('seo_published', true)
    .is('deleted_at', null)
    .not('slug', 'is', null)
    .not('image_url', 'is', null);

  const slug = normaliseCuisineFilter(cuisine);
  if (slug) q = q.contains('tags_json', { _catalog: { cuisines: [slug] } });

  const { data, error } = await q
    .order('display_priority', { ascending: false, nullsFirst: false })
    .order('title', { ascending: true })
    .limit(MENU_POOL_SIZE);

  if (error || !data) {
    if (error) console.error('[menuBuilder] pool query failed', error.message);
    return [];
  }

  return (data as Row[])
    .map(toPickable)
    .filter((r): r is PickableRecipe => r !== null);
}

export type MenuCuisineChip = {
  slug: string;
  name: string;
};

/**
 * The chip row. Ordered as CUISINE_SLUGS is (recipe-count descending), and
 * capped so the row stays a scroller rather than a wall — the design shows
 * a handful, and "All" is always first.
 */
export function getMenuCuisineChips(limit = 8): MenuCuisineChip[] {
  return CUISINE_SLUGS.slice(0, limit).map((slug) => ({
    slug,
    name: CUISINE_META[slug].name,
  }));
}

export type MintedMenu = {
  shareCode: string;
  name: string;
  recipeCount: number;
};

export type MintMenuResult =
  | { ok: true; menu: MintedMenu }
  | { ok: false; reason: 'unconfigured' | 'no_valid_recipes' | 'too_many_recipes' | 'failed' };

/**
 * Mints a share code via the create_public_shared_menu RPC.
 *
 * The RPC is the only writer: it re-validates the recipe ids against
 * recipes_published, caps the count and the name length, and is the thing
 * granted to anon — so a caller that reached this function with a doctored
 * payload still cannot write anything the RPC wouldn't accept.
 */
export async function mintSharedMenu(
  name: string,
  recipeIds: string[],
): Promise<MintMenuResult> {
  if (!supabase || !supabaseConfigured) return { ok: false, reason: 'unconfigured' };

  const { data, error } = await supabase.rpc('create_public_shared_menu', {
    p_name: name,
    p_recipe_ids: recipeIds,
  });

  if (error) {
    // The RPC raises these by name; map them so the route can answer 422
    // with something the UI can act on rather than a blanket 500.
    const message = error.message ?? '';
    if (message.includes('no_valid_recipes') || message.includes('no_recipes')) {
      return { ok: false, reason: 'no_valid_recipes' };
    }
    if (message.includes('too_many_recipes')) {
      return { ok: false, reason: 'too_many_recipes' };
    }
    console.error('[menuBuilder] mint failed', message);
    return { ok: false, reason: 'failed' };
  }

  const payload = data as
    | { share_code?: string; name?: string; recipe_count?: number }
    | null;

  if (!payload?.share_code) return { ok: false, reason: 'failed' };

  return {
    ok: true,
    menu: {
      shareCode: payload.share_code,
      name: payload.name ?? name,
      recipeCount: payload.recipe_count ?? recipeIds.length,
    },
  };
}
