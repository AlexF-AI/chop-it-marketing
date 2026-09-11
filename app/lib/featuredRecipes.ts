import { supabase, supabaseConfigured } from './supabase';
import { bySlugOrder, WEEK_SLUGS } from './theWeek';

/**
 * The homepage recipe rail.
 *
 * These are the four dinners of the demo week (app/lib/theWeek.ts), so the
 * dishes you browse here are the ones the shopping list below is built
 * from and the one Cook Mode opens.
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
 * These are real rows read from `recipes_published` — the same four slugs
 * as WEEK_SLUGS, in the same order, checked September 2026.
 */
const FALLBACK: RecipeCard[] = [
  {
    title: 'Chicken Marbella',
    meta: '65 min · 53g protein',
    href: '/recipes/chicken-marbella',
    imageUrl:
      'https://imagedelivery.net/67vDR3QPrkqq3a2SIhwzVg/426f9a27-fff2-4d56-85e0-c7cfa32ada00/full',
  },
  {
    title: 'Charred Sweetcorn and Black Bean Tacos',
    meta: '45 min · 24g protein',
    href: '/recipes/charred-sweetcorn-and-black-bean-tacos',
    imageUrl:
      'https://imagedelivery.net/67vDR3QPrkqq3a2SIhwzVg/ae71ee99-5ca3-48c0-30a3-59a46ef1fb00/full',
  },
  {
    title: 'Chargrilled Chicken with Chimichurri and Butter Bean Salad',
    meta: '40 min · 30g protein',
    href: '/recipes/chargrilled-chicken-with-chimichurri-and-butter-bean-salad',
    imageUrl:
      'https://imagedelivery.net/67vDR3QPrkqq3a2SIhwzVg/3095326a-c414-4eea-389d-580cf813a900/full',
  },
  {
    title: 'Burrata with Grilled Peaches, Prosciutto and Basil',
    meta: '35 min · 13g protein',
    href: '/recipes/burrata-with-grilled-peaches-prosciutto-and-basil',
    imageUrl:
      'https://imagedelivery.net/67vDR3QPrkqq3a2SIhwzVg/73ab14bb-362b-4d1c-6ee6-5adb0b0aa300/full',
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
    .in('slug', WEEK_SLUGS as unknown as string[])
    .eq('seo_published', true)
    .is('deleted_at', null)
    .not('image_url', 'is', null)
    .not('slug', 'is', null);

  if (error || !data || data.length === 0) {
    if (error) console.warn('[RecipeProof] query error, using fallback:', error.message);
    return FALLBACK;
  }

  return bySlugOrder(data as Row[]).map((row) => ({
    title: row.title,
    meta: metaFor(row),
    href: `/recipes/${row.slug}`,
    imageUrl: row.image_url,
  }));
}
