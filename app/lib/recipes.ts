import { supabase, supabaseConfigured } from './supabase';
import { CUISINE_META, CUISINE_SLUGS } from './cuisines';
import { segmentDbLabel } from './segments';

export type Ingredient = {
  display: string;
  optional?: boolean;
};

export type MethodStep = { text: string };

export type Timings = {
  prep_minutes?: number | null;
  cook_minutes?: number | null;
  total_minutes?: number | null;
};

export type TagsJson = {
  core?: string[];
  _catalog?: { cuisines?: string[]; segments?: unknown };
} | null;

export type Recipe = {
  id: string;
  slug: string;
  title: string;
  hero_description: string | null;
  image_url: string | null;
  season: string | null;
  cost_band: string | null;
  display_priority: number | null;
  servings: number | null;
  ingredients_json: Ingredient[] | null;
  method_steps_json: MethodStep[] | null;
  timings_json: Timings | null;
  tags_json: TagsJson;
  nutrition_kcal: number | null;
  nutrition_protein_g: number | null;
  nutrition_fibre_g: number | null;
  nutrition_carbs_g: number | null;
  nutrition_fat_g: number | null;
  nutrition_source: string | null;
  published_at: string;
  updated_at: string;
};

export type RecipeListItem = {
  id: string;
  slug: string;
  title: string;
  image_url: string | null;
  season: string | null;
  cost_band: string | null;
  total_minutes: number | null;
  updated_at: string;
};

const RECIPE_COLUMNS =
  'id, slug, title, hero_description, image_url, season, cost_band, display_priority, servings, ingredients_json, method_steps_json, timings_json, tags_json, nutrition_kcal, nutrition_protein_g, nutrition_fibre_g, nutrition_carbs_g, nutrition_fat_g, nutrition_source, published_at, updated_at';

const LIST_COLUMNS =
  'id, slug, title, image_url, season, cost_band, display_priority, timings_json, updated_at';

// --- Legacy id-based helpers (kept so the old /recipes/[id] redirect can
// resolve the slug from the URL it was hit with).
export async function getAllRecipeIds(): Promise<string[]> {
  if (!supabase || !supabaseConfigured) return [];
  const { data, error } = await supabase
    .from('recipes_published')
    .select('id')
    .is('deleted_at', null)
    .not('image_url', 'is', null);
  if (error || !data) return [];
  return data.map((r) => r.id as string);
}

export async function getSlugById(id: string): Promise<string | null> {
  if (!supabase || !supabaseConfigured) return null;
  const { data, error } = await supabase
    .from('recipes_published')
    .select('slug')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();
  if (error || !data) return null;
  return (data.slug as string | null) ?? null;
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  if (!supabase || !supabaseConfigured) return null;
  const { data, error } = await supabase
    .from('recipes_published')
    .select(RECIPE_COLUMNS)
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();
  if (error || !data) return null;
  return data as Recipe;
}

// --- New slug-based helpers (SEO recipe pages).

// Supabase's hosted PostgREST caps result rows at `db-max-rows` (1000 by
// default on the Free / Pro tier). Once we crossed 1,000 published recipes
// the sitemap and generateStaticParams were truncating silently. This
// helper paginates the query with .range() so we always see the full set.
const SUPABASE_PAGE_SIZE = 1000;

async function fetchAllPaged<T>(
  build: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: T[] | null; error: unknown }>,
): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += SUPABASE_PAGE_SIZE) {
    const { data, error } = await build(from, from + SUPABASE_PAGE_SIZE - 1);
    if (error || !data) break;
    out.push(...data);
    if (data.length < SUPABASE_PAGE_SIZE) break;
  }
  return out;
}

export async function getPublishedRecipeSlugs(): Promise<
  { slug: string; updated_at: string }[]
> {
  if (!supabase || !supabaseConfigured) return [];
  const rows = await fetchAllPaged<{ slug: string | null; updated_at: string }>(
    (from, to) =>
      supabase!
        .from('recipes_published')
        .select('slug, updated_at')
        .eq('seo_published', true)
        .is('deleted_at', null)
        .not('slug', 'is', null)
        .range(from, to),
  );
  return rows
    .filter((r): r is { slug: string; updated_at: string } => typeof r.slug === 'string')
    .map((r) => ({ slug: r.slug, updated_at: r.updated_at }));
}

export async function getPublishedRecipeBySlug(slug: string): Promise<Recipe | null> {
  if (!supabase || !supabaseConfigured) return null;
  const { data, error } = await supabase
    .from('recipes_published')
    .select(RECIPE_COLUMNS)
    .eq('slug', slug)
    .eq('seo_published', true)
    .is('deleted_at', null)
    .maybeSingle();
  if (error || !data) return null;
  return data as Recipe;
}

export type ListFilter = {
  season?: string;
  costBand?: string;
  cuisine?: string;
  tag?: string;
  page?: number;
  perPage?: number;
};

function cuisineSlug(value: string): string | null {
  const normalized = value.trim().toLowerCase().replace(/[\s_]+/g, '-');
  if (CUISINE_SLUGS.includes(normalized)) return normalized;
  const displayName = value.trim().toLowerCase();
  return CUISINE_SLUGS.find(
    (slug) => CUISINE_META[slug].name.toLowerCase() === displayName,
  ) ?? null;
}

export async function listPublishedRecipes(
  filter: ListFilter = {},
): Promise<{ items: RecipeListItem[]; total: number }> {
  if (!supabase || !supabaseConfigured) return { items: [], total: 0 };
  const page = Math.max(1, filter.page ?? 1);
  const perPage = Math.max(1, Math.min(48, filter.perPage ?? 24));
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let q = supabase
    .from('recipes_published')
    .select(LIST_COLUMNS, { count: 'exact' })
    .eq('seo_published', true)
    .is('deleted_at', null)
    .not('slug', 'is', null);

  if (filter.season) q = q.eq('season', filter.season);
  if (filter.costBand) q = q.eq('cost_band', filter.costBand);
  if (filter.cuisine) {
    const slug = cuisineSlug(filter.cuisine);
    if (!slug) return { items: [], total: 0 };
    q = q.contains('tags_json', { _catalog: { cuisines: [slug] } });
  }
  if (filter.tag) {
    q = q.contains('tags_json', { core: [filter.tag] });
  }

  q = q.order('display_priority', { ascending: false, nullsFirst: false })
    .order('title', { ascending: true })
    .range(from, to);

  const { data, error, count } = await q;
  if (error || !data) return { items: [], total: 0 };

  const items: RecipeListItem[] = data.map((r) => {
    const timings = r.timings_json as Timings | null;
    return {
      id: r.id as string,
      slug: r.slug as string,
      title: r.title as string,
      image_url: (r.image_url as string | null) ?? null,
      season: (r.season as string | null) ?? null,
      cost_band: (r.cost_band as string | null) ?? null,
      total_minutes: timings?.total_minutes ?? null,
      updated_at: r.updated_at as string,
    };
  });
  return { items, total: count ?? items.length };
}

// Recipes in a curated segment (tags_json._catalog.segments[]). Used by
// the editorial /recipes/collection/<slug> landing pages. The catalog
// segment slugs (bbq_szn, quick, batch, …) are produced by an offline
// curation pass; this query just structurally matches the slug into the
// jsonb array via @>. Top 60 by display_priority is plenty for v1 — no
// pagination yet.
export async function listCollectionRecipes(
  segmentSlug: string,
  opts: { limit?: number } = {},
): Promise<RecipeListItem[]> {
  if (!supabase || !supabaseConfigured) return [];
  const client = supabase;
  const limit = Math.max(1, Math.min(120, opts.limit ?? 60));
  const query = (segmentValue: string) =>
    client
      .from('recipes_published')
      .select(LIST_COLUMNS)
      .eq('seo_published', true)
      .is('deleted_at', null)
      .not('slug', 'is', null)
      .contains('tags_json', { _catalog: { segments: [segmentValue] } })
      .order('display_priority', { ascending: false, nullsFirst: false })
      .order('title', { ascending: true })
      .limit(limit);
  // The library stores segments as labels ("Quick"); older rows or a future
  // catalog pass may store the slug. Query both spellings, merge and dedupe
  // by id so a mixed-data release never drops half the collection, then
  // re-apply the display_priority / title ordering across the merged set.
  const candidates = Array.from(new Set([segmentDbLabel(segmentSlug), segmentSlug]));
  const results = await Promise.all(candidates.map((value) => query(value)));
  if (results.some((result) => result.error)) return [];
  const byId = new Map<string, Record<string, unknown>>();
  for (const result of results) {
    for (const row of (result.data ?? []) as Record<string, unknown>[]) {
      const id = row.id as string;
      if (!byId.has(id)) byId.set(id, row);
    }
  }
  if (byId.size === 0) return [];
  const priorityOf = (r: Record<string, unknown>) =>
    typeof r.display_priority === 'number' ? (r.display_priority as number) : Number.NEGATIVE_INFINITY;
  const data = Array.from(byId.values())
    .sort((a, b) => {
      const diff = priorityOf(b) - priorityOf(a);
      if (diff !== 0) return diff;
      return String(a.title ?? '').localeCompare(String(b.title ?? ''));
    })
    .slice(0, limit);
  return data.map((r) => {
    const timings = r.timings_json as Timings | null;
    return {
      id: r.id as string,
      slug: r.slug as string,
      title: r.title as string,
      image_url: (r.image_url as string | null) ?? null,
      season: (r.season as string | null) ?? null,
      cost_band: (r.cost_band as string | null) ?? null,
      total_minutes: timings?.total_minutes ?? null,
      updated_at: r.updated_at as string,
    };
  });
}

// Curated cuisine collection landing pages (/recipes/cuisine/[slug]).
// Pages the search_public_recipes RPC until exhausted so the
// CollectionPage JSON-LD's numberOfItems and the visible grid match
// the true cuisine total — capping (e.g. 50) silently truncates the
// big cuisines (British 255, Italian 109, …) and the schema would lie.
//
// Hard ceiling so a runaway cuisine can't trigger unbounded fetching
// at build time. 1000 is well over the current largest cuisine (255).
const CUISINE_RPC_PAGE = 100;
const CUISINE_MAX_TOTAL = 1000;

type CuisineRpcRow = {
  id: string;
  slug: string;
  title: string;
  image_url: string | null;
  total_minutes: number | null;
};

export async function listCuisineRecipes(
  cuisineSlug: string,
): Promise<RecipeListItem[]> {
  if (!supabase || !supabaseConfigured) return [];
  const out: RecipeListItem[] = [];
  for (let offset = 0; offset < CUISINE_MAX_TOTAL; offset += CUISINE_RPC_PAGE) {
    const { data, error } = await supabase.rpc('search_public_recipes', {
      p_cuisines: [cuisineSlug],
      p_limit: CUISINE_RPC_PAGE,
      p_offset: offset,
    });
    if (error) {
      console.warn('[listCuisineRecipes] RPC error', error.message);
      break;
    }
    if (!Array.isArray(data) || data.length === 0) break;
    const rows = data as CuisineRpcRow[];
    for (const r of rows) {
      out.push({
        id: r.id,
        slug: r.slug,
        title: r.title,
        image_url: r.image_url ?? null,
        // The RPC doesn't return season/cost_band/updated_at; null them
        // so the RecipeGrid card just doesn't render those chips.
        season: null,
        cost_band: null,
        total_minutes: r.total_minutes ?? null,
        updated_at: new Date().toISOString(),
      });
    }
    if (rows.length < CUISINE_RPC_PAGE) break;
  }
  return out;
}

// Thin wrapper around the public.search_public_recipes RPC (title-only
// trigram + ILIKE fuzzy search). The RPC returns total_count on every row;
// we pull it from row[0] (or 0 for an empty result) and reshape the row
// into a RecipeListItem so RecipeGrid can render search results without a
// separate component. season / cost_band / updated_at aren't in the RPC
// payload; null'd here — the grid only conditionally shows the cost dot,
// and updated_at isn't rendered.
export async function searchPublicRecipes(
  query: string,
  opts: { page?: number; perPage?: number } = {},
): Promise<{ items: RecipeListItem[]; total: number }> {
  if (!supabase || !supabaseConfigured) return { items: [], total: 0 };
  const trimmed = query.trim();
  if (!trimmed) return { items: [], total: 0 };

  const page = Math.max(1, opts.page ?? 1);
  const perPage = Math.max(1, Math.min(48, opts.perPage ?? 24));
  const offset = (page - 1) * perPage;

  const { data, error } = await supabase.rpc('search_public_recipes', {
    p_query: trimmed,
    p_limit: perPage,
    p_offset: offset,
  });
  if (error || !Array.isArray(data) || data.length === 0) {
    return { items: [], total: 0 };
  }

  type Row = {
    id: string;
    title: string;
    slug: string;
    image_url: string | null;
    total_minutes: number | null;
    servings: number | null;
    plant_count: number | null;
    match_score: number | null;
    total_count: number | null;
  };
  const rows = data as Row[];
  const items: RecipeListItem[] = rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    image_url: r.image_url ?? null,
    season: null,
    cost_band: null,
    total_minutes: r.total_minutes ?? null,
    updated_at: '',
  }));
  return { items, total: rows[0]?.total_count ?? items.length };
}

// URL-safe character set for tag/cuisine paths. Tags containing spaces or
// other characters that encodeURIComponent translates into %NN sequences
// break Next.js static export (it can't write a `.rsc` file with `%` in
// the filename on case-sensitive macOS / Linux). The taxonomy in the DB
// contains ~40% such values (e.g. "Modern British", "quick weeknight").
// Excluding them from generateStaticParams + sitemap is the minimum patch
// to unblock the build. A future PR can introduce a slugify/unslugify pair
// to preserve those tags as `/recipes/tag/modern-british` URLs.
export const URL_SAFE_SLUG_RE = /^[A-Za-z0-9_-]+$/;

// Distinct taxonomy values for the hub filter bar. Read the same canonical
// multi-membership array as the app and curated cuisine landing-page RPC.
export async function getDistinctCuisines(): Promise<string[]> {
  if (!supabase || !supabaseConfigured) return [];
  const rows = await fetchAllPaged<{ tags_json: TagsJson }>((from, to) =>
    supabase!
      .from('recipes_published')
      .select('tags_json')
      .eq('seo_published', true)
      .is('deleted_at', null)
      .not('slug', 'is', null)
      .range(from, to),
  );
  const out = new Set<string>();
  for (const r of rows) {
    const cuisines = r.tags_json?._catalog?.cuisines;
    if (!Array.isArray(cuisines)) continue;
    for (const slug of cuisines) {
      if (CUISINE_SLUGS.includes(slug)) out.add(slug);
    }
  }
  return CUISINE_SLUGS
    .filter((slug) => out.has(slug))
    .map((slug) => CUISINE_META[slug].name);
}

// Note: getDistinctSeasons() and getDistinctTags() were removed when the
// free-text /recipes/season/[season] and /recipes/tag/[tag] routes were
// retired (the 700-ish unnormalised values were flooding the sitemap and
// throttling crawl). The curated taxonomies are app/lib/cuisines.ts and
// app/lib/collections.ts. getDistinctCuisines() is kept solely for the
// /recipes hub's cuisine-filter chip (?cuisine=... noindexed facet) —
// it uses the same tags_json._catalog.cuisines[] memberships as the
// curated /recipes/cuisine/[slug] landings.

export async function getDistinctCostBands(): Promise<string[]> {
  if (!supabase || !supabaseConfigured) return [];
  const { data, error } = await supabase
    .from('recipes_published')
    .select('cost_band')
    .eq('seo_published', true)
    .is('deleted_at', null)
    .not('cost_band', 'is', null);
  if (error || !data) return [];
  return Array.from(new Set(data.map((r) => r.cost_band as string))).sort();
}

// One-shot fetch for the recipes sitemap. Returns each canonical slug, its
// real last-modified value and its primary image. The curated cuisine and
// collection routes are added by the sitemap route itself.
export type RecipesSitemapData = {
  recipes: { slug: string; updated_at: string; image_url: string | null }[];
};

export async function getRecipesSitemapData(): Promise<RecipesSitemapData> {
  if (!supabase || !supabaseConfigured) return { recipes: [] };
  const rows = await fetchAllPaged<{
    slug: string | null;
    updated_at: string;
    image_url: string | null;
  }>(
    (from, to) =>
      supabase!
        .from('recipes_published')
        .select('slug, updated_at, image_url')
        .eq('seo_published', true)
        .is('deleted_at', null)
        .not('slug', 'is', null)
        .range(from, to),
  );
  const recipes: RecipesSitemapData['recipes'] = [];
  for (const r of rows) {
    if (typeof r.slug !== 'string') continue;
    recipes.push({ slug: r.slug, updated_at: r.updated_at, image_url: r.image_url ?? null });
  }
  return { recipes };
}

export async function countPublishedRecipes(): Promise<number> {
  if (!supabase || !supabaseConfigured) return 0;
  const { count, error } = await supabase
    .from('recipes_published')
    .select('id', { count: 'exact', head: true })
    .eq('seo_published', true)
    .is('deleted_at', null);
  if (error) return 0;
  return count ?? 0;
}
