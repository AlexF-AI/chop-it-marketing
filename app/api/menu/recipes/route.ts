// Pool of pickable recipes for the /menu builder, narrowed to one cuisine.
//
// The page server-renders the "All" pool, so this only runs when a visitor
// taps a cuisine chip. Keeping it behind a route handler rather than querying
// from the browser keeps the Supabase key server-side.

import { NextResponse } from 'next/server';

import { getPickableRecipes, normaliseCuisineFilter } from '@/app/lib/menuBuilder';

// The pool is public, identical for everyone, and changes only when the
// catalogue does. Cache it at the edge for an hour, and let a stale copy
// serve while it revalidates so a chip tap is never blocked on Supabase.
export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cuisine = normaliseCuisineFilter(searchParams.get('cuisine'));
  const items = await getPickableRecipes(cuisine);

  return NextResponse.json(
    { items },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    },
  );
}
