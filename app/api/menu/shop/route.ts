// The combined shop for a set of picks in the /menu builder.
//
// The builder promises "one link that opens the whole thing — recipes,
// timings and a combined shop". It used to make that promise and then show
// you none of it until you opened the app. This returns the real merge for
// whatever is currently picked, so the shop is on screen while you build
// the menu, using the same code as the homepage's week
// (lib/shopFromRecipes.ts).
//
// Read-only and behind a route handler for the same reason as the pool
// query: the Supabase key stays server-side.

import { NextResponse } from 'next/server';

import { MAX_MENU_RECIPES } from '@/app/lib/menuBuilder';
import { buildShop, toSourceRecipes, type RawIngredient } from '@/app/lib/shopFromRecipes';
import { supabase, supabaseConfigured } from '@/app/lib/supabase';

// The answer depends on the posted body, so it is never a cached route.
export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  if (!supabase || !supabaseConfigured) {
    return NextResponse.json({ error: 'Not configured.' }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Expected a JSON body.' }, { status: 400 });
  }

  const { recipeIds } = (body ?? {}) as { recipeIds?: unknown };
  if (!Array.isArray(recipeIds)) {
    return NextResponse.json({ error: 'recipeIds must be an array.' }, { status: 400 });
  }

  // Shape-checked and de-duplicated before the query, so a malformed or
  // padded body cannot turn into a large `in (…)`.
  const ids = Array.from(
    new Set(recipeIds.filter((id): id is string => typeof id === 'string' && UUID.test(id))),
  ).slice(0, MAX_MENU_RECIPES);

  if (ids.length === 0) {
    return NextResponse.json({ shop: null });
  }

  const { data, error } = await supabase
    .from('recipes_published')
    .select('id, title, ingredients_json')
    .in('id', ids)
    .eq('seo_published', true)
    .is('deleted_at', null);

  if (error) {
    console.error('[menu/shop] recipe query failed', error.message);
    return NextResponse.json({ error: 'Could not build the shop.' }, { status: 502 });
  }

  const rows = (data ?? []) as { id: string; title: string | null; ingredients_json: RawIngredient[] | null }[];
  if (rows.length === 0) {
    return NextResponse.json({ shop: null });
  }

  // Postgres returns the `in` set in its own order; the visitor's pick order
  // is what the panel should show, so it is imposed here.
  const rank = new Map(ids.map((id, i) => [id, i]));
  rows.sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0));

  const shop = await buildShop(toSourceRecipes(rows));
  return NextResponse.json({ shop });
}
