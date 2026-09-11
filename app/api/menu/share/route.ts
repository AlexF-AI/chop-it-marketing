// Mints a /m/<code> share link for a menu built on the site.
//
// This is the only write path the marketing site has. It is deliberately
// thin: shape-check the body, throttle, then hand off to the
// create_public_shared_menu RPC, which does the real validation (recipe ids
// must resolve to live seo_published rows, 1-24 of them, name capped at 80
// characters). Anything that gets past this handler still cannot write a row
// the RPC would refuse.

import { NextResponse } from 'next/server';

import { MAX_MENU_RECIPES, mintSharedMenu } from '@/app/lib/menuBuilder';

// Writes, so never cached or prerendered.
export const dynamic = 'force-dynamic';

/** Cap on a single request body, before the RPC's own 1-24 bound. */
const MAX_IDS_IN_BODY = 60;
const MAX_NAME_LENGTH = 80;

// Best-effort throttle: one instance's memory, so it does not hold across a
// scale-out and resets on a cold start. It is here to blunt a naive loop
// rather than to be a real rate limiter — if abuse shows up, this is the
// seam to put Turnstile behind (NEXT_PUBLIC_TURNSTILE_SITE_KEY is already
// provisioned in .env.example).
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);

  // Keep the map from growing without bound across a long-lived instance.
  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }

  return recent.length > MAX_PER_WINDOW;
}

function clientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || 'unknown';
}

export async function POST(request: Request) {
  if (rateLimited(clientKey(request))) {
    return NextResponse.json(
      { error: 'Too many menus in a short time. Try again in a minute.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Expected a JSON body.' }, { status: 400 });
  }

  const { name, recipeIds } = (body ?? {}) as {
    name?: unknown;
    recipeIds?: unknown;
  };

  if (!Array.isArray(recipeIds) || recipeIds.length === 0) {
    return NextResponse.json(
      { error: 'Pick at least one dish before generating a link.' },
      { status: 422 },
    );
  }

  if (recipeIds.length > MAX_IDS_IN_BODY) {
    return NextResponse.json(
      { error: `A menu can hold up to ${MAX_MENU_RECIPES} dishes.` },
      { status: 422 },
    );
  }

  // Strings only, de-duplicated, order preserved — the RPC orders the share
  // page by the order it receives.
  const ids = Array.from(
    new Set(
      recipeIds.filter((id): id is string => typeof id === 'string' && id.length > 0),
    ),
  );

  if (ids.length === 0) {
    return NextResponse.json(
      { error: 'Pick at least one dish before generating a link.' },
      { status: 422 },
    );
  }

  const menuName =
    typeof name === 'string' && name.trim() ? name.trim().slice(0, MAX_NAME_LENGTH) : '';

  const result = await mintSharedMenu(menuName, ids);

  if (!result.ok) {
    if (result.reason === 'no_valid_recipes') {
      return NextResponse.json(
        { error: 'Those dishes are no longer available. Try picking again.' },
        { status: 422 },
      );
    }
    if (result.reason === 'too_many_recipes') {
      return NextResponse.json(
        { error: `A menu can hold up to ${MAX_MENU_RECIPES} dishes.` },
        { status: 422 },
      );
    }
    if (result.reason === 'unconfigured') {
      return NextResponse.json(
        { error: 'Sharing is unavailable right now.' },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: 'Could not create that link. Try again.' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    shareCode: result.menu.shareCode,
    name: result.menu.name,
    recipeCount: result.menu.recipeCount,
  });
}
