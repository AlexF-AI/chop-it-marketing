import { supabase, supabaseConfigured } from './supabase';

/**
 * The homepage recipe rail.
 *
 * Same source as `components/home/RecipeRail.tsx`, with two differences:
 *
 * 1. It filters on `seo_published`. The rail does not, and `/recipes/[slug]`
 *    resolves through `getPublishedRecipeBySlug`, which *does* — so an
 *    unpublished row surfacing in the rail links to a 404. Worth fixing in
 *    RecipeRail too.
 * 2. The meta line is `45 min · 40g protein`, which is what this section's
 *    design specifies, rather than the rail's `45 MIN · SERVES 4`.
 */

export type RecipeCard = {
  title: string;
  meta: string;
  href: string;
  imageUrl: string | null;
};

type Row = {
  slug: string;
  title: string;
  image_url: string | null;
  timings_json: { total_minutes?: number | null } | null;
  nutrition_protein_g: number | null;
};

/**
 * Shown when Supabase is not configured (preview builds, local checkouts
 * without env vars) so the rail never renders empty.
 *
 * These are real rows read from `recipes_published` — the four the design
 * package named as having checked data, all carrying `display_priority: 95`.
 */
const FALLBACK: RecipeCard[] = [
  {
    title: 'Seared Salmon with Mango Salsa and Lime',
    meta: '45 min · 40g protein',
    href: '/recipes/seared-salmon-with-mango-salsa-and-lime',
    imageUrl:
      'https://imagedelivery.net/67vDR3QPrkqq3a2SIhwzVg/4de8f514-81d8-4879-fa40-acce4f455f00/full',
  },
  {
    title: 'Charred Sweetcorn and Black Bean Tacos',
    meta: '45 min · 38g protein',
    href: '/recipes/charred-sweetcorn-and-black-bean-tacos',
    imageUrl:
      'https://imagedelivery.net/67vDR3QPrkqq3a2SIhwzVg/ae71ee99-5ca3-48c0-30a3-59a46ef1fb00/full',
  },
  {
    title: 'Thai Beef Salad with Crunchy Vegetables',
    meta: '35 min · 32g protein',
    href: '/recipes/thai-beef-salad-with-crunchy-vegetables',
    imageUrl:
      'https://imagedelivery.net/67vDR3QPrkqq3a2SIhwzVg/57b9bfa3-7ab0-4a60-1651-e7d21fcf7700/full',
  },
  {
    title: 'One-Pan Orzo with Roasted Peppers, Olives and Feta',
    meta: '45 min · 21g protein',
    href: '/recipes/one-pan-orzo-with-roasted-peppers-olives-and-feta',
    imageUrl:
      'https://imagedelivery.net/67vDR3QPrkqq3a2SIhwzVg/3133a9f7-6593-4c75-8b5f-f45a46352b00/full',
  },
];

function metaFor(row: Row): string {
  const bits: string[] = [];
  const mins = row.timings_json?.total_minutes;
  if (mins) bits.push(`${mins} min`);
  if (row.nutrition_protein_g) {
    bits.push(`${Math.round(row.nutrition_protein_g)}g protein`);
  }
  return bits.join(' · ');
}

export async function getFeaturedRecipes(): Promise<RecipeCard[]> {
  if (!supabase || !supabaseConfigured) {
    console.warn('[RecipeProof] Supabase env missing — using fallback rail');
    return FALLBACK;
  }

  const { data, error } = await supabase
    .from('recipes_published')
    .select('slug, title, image_url, timings_json, nutrition_protein_g')
    .eq('seo_published', true)
    .is('deleted_at', null)
    .not('image_url', 'is', null)
    .not('slug', 'is', null)
    .order('display_priority', { ascending: false, nullsFirst: false })
    .order('title', { ascending: true })
    .limit(4);

  if (error || !data || data.length === 0) {
    if (error) console.warn('[RecipeProof] query error, using fallback:', error.message);
    return FALLBACK;
  }

  return (data as Row[]).map((row) => ({
    title: row.title,
    meta: metaFor(row),
    href: `/recipes/${row.slug}`,
    imageUrl: row.image_url,
  }));
}

/**
 * The library size, and what the rest of the homepage already claims: the count
 * of non-deleted rows in `recipes_published`.
 *
 * `/recipes` browses the `seo_published` subset, which is eleven fewer (1,024
 * when checked). If the catalogue moves, this and RecipeRail's copy move
 * together.
 */
export const RECIPE_COUNT = '1,035';
