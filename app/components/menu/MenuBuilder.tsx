'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';

import type { MenuCuisineChip, PickableRecipe } from '@/app/lib/menuBuilder';
import { MAX_MENU_RECIPES } from '@/app/lib/menuBuilder';
import type { Shop } from '@/app/lib/shopFromRecipes';
import ShoppingListPanel from '@/app/components/shop/ShoppingListPanel';
import { trackMenuLinkCreated } from '@/lib/posthog-events';
import shared from '@/app/components/homepage/shared.module.css';
import styles from './MenuBuilder.module.css';

type MenuBuilderProps = {
  /** Server-rendered "All" pool, so the list is populated on first paint. */
  initialRecipes: PickableRecipe[];
  cuisines: MenuCuisineChip[];
  /** Canonical origin for the share URL, e.g. https://chop-it.com. */
  siteOrigin: string;
  /** Deep link base into the app, e.g. https://chopit.app/m. */
  appDeepLinkBase: string;
};

const DEFAULT_NAME = "This week's dinners";
const COPIED_RESET_MS = 2000;
/** Long enough that picking three dishes quickly is one request, not three. */
const SHOP_DEBOUNCE_MS = 400;

export default function MenuBuilder({
  initialRecipes,
  cuisines,
  siteOrigin,
  appDeepLinkBase,
}: MenuBuilderProps) {
  const [filter, setFilter] = useState('all');
  const [pool, setPool] = useState<PickableRecipe[]>(initialRecipes);
  const [poolLoading, setPoolLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState(DEFAULT_NAME);
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [shopLoading, setShopLoading] = useState(false);

  /**
   * Every recipe the visitor has seen, not just the current filter.
   *
   * Selections survive a filter change, so the picks panel has to be able to
   * render a dish whose cuisine is no longer on screen. Without this cache
   * those rows would blank out the moment you tapped a different chip.
   */
  const seenRef = useRef(new Map<string, PickableRecipe>());
  const [, forceSeenUpdate] = useState(0);
  useEffect(() => {
    let added = false;
    for (const recipe of pool) {
      if (!seenRef.current.has(recipe.id)) {
        seenRef.current.set(recipe.id, recipe);
        added = true;
      }
    }
    if (added) forceSeenUpdate((n) => n + 1);
  }, [pool]);

  // Any edit to the menu makes an existing code wrong — it points at a
  // snapshot that no longer matches what is on screen.
  const invalidate = useCallback(() => {
    setCode(null);
    setCopied(false);
    setError(null);
  }, []);

  const toggle = useCallback(
    (id: string) => {
      setSelected((current) =>
        current.includes(id)
          ? current.filter((x) => x !== id)
          : current.length >= MAX_MENU_RECIPES
            ? current
            : [...current, id],
      );
      invalidate();
    },
    [invalidate],
  );

  const chooseCuisine = useCallback(
    async (slug: string) => {
      if (slug === filter) return;
      setFilter(slug);
      setPoolLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/menu/recipes?cuisine=${encodeURIComponent(slug)}`,
        );
        if (!response.ok) throw new Error(String(response.status));
        const data = (await response.json()) as { items?: PickableRecipe[] };
        setPool(data.items ?? []);
      } catch {
        setPool([]);
        setError('Could not load those dishes. Try another cuisine.');
      } finally {
        setPoolLoading(false);
      }
    },
    [filter],
  );

  const picks = useMemo(
    () =>
      selected
        .map((id) => seenRef.current.get(id))
        .filter((r): r is PickableRecipe => Boolean(r)),
    // seenRef is a ref, so the forced re-render above is what re-runs this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected, pool],
  );

  /**
   * The shop for whatever is picked.
   *
   * Debounced, because picking four dinners is four state changes in a few
   * seconds and each one would otherwise be a round trip. Responses are
   * sequenced: a slow one for two dishes must not land after a fast one for
   * three and leave the panel a dish behind.
   */
  const shopRequest = useRef(0);
  useEffect(() => {
    if (selected.length === 0) {
      shopRequest.current += 1;
      setShop(null);
      setShopLoading(false);
      return;
    }

    const id = (shopRequest.current += 1);
    const controller = new AbortController();
    setShopLoading(true);

    const timer = setTimeout(async () => {
      try {
        const response = await fetch('/api/menu/shop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipeIds: selected }),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(String(response.status));
        const data = (await response.json()) as { shop?: Shop | null };
        if (id !== shopRequest.current) return;
        setShop(data.shop ?? null);
      } catch {
        // A failed shop is not worth an error banner — the picks and the
        // link still work, and the panel simply keeps its last good state
        // until the next change succeeds.
        if (id === shopRequest.current) setShop(null);
      } finally {
        if (id === shopRequest.current) setShopLoading(false);
      }
    }, SHOP_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [selected]);

  const generate = useCallback(async () => {
    if (selected.length === 0 || minting) return;
    setMinting(true);
    setError(null);
    try {
      const response = await fetch('/api/menu/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() || DEFAULT_NAME, recipeIds: selected }),
      });
      const data = (await response.json()) as { shareCode?: string; error?: string };
      if (!response.ok || !data.shareCode) {
        setError(data.error ?? 'Could not create that link. Try again.');
        return;
      }
      setCode(data.shareCode);
      setCopied(false);
      trackMenuLinkCreated({
        share_code: data.shareCode,
        recipe_count: selected.length,
      });
    } catch {
      setError('Could not create that link. Try again.');
    } finally {
      setMinting(false);
    }
  }, [selected, minting, name]);

  const shareUrl = code ? `${siteOrigin}/m/${code}` : '';
  // Shown without the scheme, copied with it.
  const shareUrlLabel = code
    ? `${siteOrigin.replace(/^https?:\/\//, '')}/m/${code}`
    : '';

  // One timer, cleared on unmount and on a re-copy, so the label can't be
  // reset by a stale timeout after the code has changed.
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );

  const copy = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
    } catch {
      // Clipboard can be blocked (insecure context, permissions). The URL is
      // on screen and selectable, so this is a silent degrade rather than an
      // error worth interrupting for.
      setCopied(false);
    }
  }, [shareUrl]);

  const atLimit = selected.length >= MAX_MENU_RECIPES;

  return (
    <>
      <div className={styles.head}>
        <div className={shared.eyebrow}>Build a menu</div>
        <h1 className={styles.h1}>Pick a few dishes. Send someone the link.</h1>
        <p className={styles.lede}>
          Tap the dinners you want, name the menu, and you get one link that
          opens the whole thing &mdash; recipes, timings and a combined shop
          &mdash; in Chop it.
        </p>
      </div>

      <ul className={styles.chipRow} aria-label="Filter by cuisine">
        <li>
          <button
            type="button"
            className={`${styles.chip} ${filter === 'all' ? styles.chipOn : ''}`}
            aria-pressed={filter === 'all'}
            onClick={() => chooseCuisine('all')}
          >
            All
          </button>
        </li>
        {cuisines.map((cuisine) => (
          <li key={cuisine.slug}>
            <button
              type="button"
              className={`${styles.chip} ${filter === cuisine.slug ? styles.chipOn : ''}`}
              aria-pressed={filter === cuisine.slug}
              onClick={() => chooseCuisine(cuisine.slug)}
            >
              {cuisine.name}
            </button>
          </li>
        ))}
      </ul>

      <div className={styles.layout}>
        {pool.length === 0 && !poolLoading ? (
          <p className={`${styles.empty} ${styles.dishes}`}>
            No dishes to show here yet. Try another cuisine.
          </p>
        ) : (
          <ul className={styles.dishes} aria-busy={poolLoading}>
            {pool.map((recipe) => {
              const on = selected.includes(recipe.id);
              return (
                <li key={recipe.id}>
                  <button
                    type="button"
                    className={`${styles.dish} ${on ? styles.dishOn : ''}`}
                    aria-pressed={on}
                    // Once the menu is full, everything unselected is
                    // unavailable — but the picks themselves must stay
                    // tappable so a visitor can swap one out.
                    disabled={atLimit && !on}
                    onClick={() => toggle(recipe.id)}
                  >
                    <span className={styles.dishThumb}>
                      {recipe.imageUrl ? (
                        <Image
                          src={recipe.imageUrl}
                          alt=""
                          fill
                          loading="lazy"
                          sizes="104px"
                        />
                      ) : null}
                    </span>
                    <span className={styles.dishCopy}>
                      <span className={styles.dishTitle}>{recipe.title}</span>
                      <span className={styles.dishMeta}>{recipe.meta}</span>
                    </span>
                    <span
                      className={`${styles.tick} ${on ? styles.tickOn : ''}`}
                      aria-hidden="true"
                    >
                      {on ? '✓' : '+'}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <section className={styles.panel} aria-label="Your menu">
          <div className={styles.panelInner}>
            <div className={styles.panelHead}>
              <div className={styles.panelTitle}>Your menu</div>
              <div className={styles.panelCount}>
                {selected.length === 1 ? '1 dish' : `${selected.length} dishes`}
              </div>
            </div>

            {picks.length === 0 ? (
              <p className={styles.panelEmpty}>
                Nothing picked yet. Tap a dish above and it lands here.
              </p>
            ) : (
              <ol className={styles.picks}>
                {picks.map((recipe, index) => (
                  <li key={recipe.id} className={styles.pick}>
                    <span className={styles.pickN}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className={styles.pickTitle}>{recipe.title}</span>
                    <button
                      type="button"
                      className={styles.pickRemove}
                      aria-label={`Remove ${recipe.title}`}
                      onClick={() => toggle(recipe.id)}
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ol>
            )}

            <label className={styles.nameLabel} htmlFor="menu-name">
              Menu name
            </label>
            <input
              id="menu-name"
              type="text"
              className={styles.nameInput}
              value={name}
              maxLength={80}
              placeholder="Sunday for six"
              onChange={(event) => {
                setName(event.target.value);
                // The name is part of the shared payload, so editing it
                // invalidates an existing code too.
                invalidate();
              }}
            />

            <button
              type="button"
              className={styles.generate}
              disabled={selected.length === 0 || minting}
              onClick={generate}
            >
              {minting ? 'Creating…' : code ? 'Make a new link' : 'Get a link'}
            </button>

            {atLimit ? (
              <p className={styles.error} role="status">
                That&rsquo;s the {MAX_MENU_RECIPES}-dish limit. Remove one to
                swap it out.
              </p>
            ) : null}

            {error ? (
              <p className={styles.error} role="alert">
                {error}
              </p>
            ) : null}
          </div>
        </section>
      </div>

      {selected.length > 0 ? (
        <section className={styles.shop} aria-label="Your shop">
          <div className={styles.shopHead}>
            <div className={shared.eyebrow}>And here is the shop</div>
            <h2 className={styles.shopH2}>
              {shop
                ? `${shop.combined.totalIngredientLines} ingredient lines, ${shop.combined.totalShoppingLines} things to buy.`
                : 'Working out the shop\u2026'}
            </h2>
            <p className={styles.shopLede}>
              Every ingredient in the dishes above, merged and grouped by
              aisle. This is the list the link opens in Chop it.
            </p>
          </div>

          {shop ? (
            <div className={styles.shopPanel} aria-busy={shopLoading}>
              <ShoppingListPanel list={shop.combined} perRecipe={shop.perRecipe} />
            </div>
          ) : null}
        </section>
      ) : null}

      {code ? (
        <section className={styles.result} aria-label="Your share link">
          <div className={styles.resultInner}>
            <div className={styles.resultTitle}>Your link is live</div>

            <div className={styles.urlBar}>
              <span className={styles.url}>{shareUrlLabel}</span>
              <button type="button" className={styles.copy} onClick={copy}>
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <p className={styles.resultNote}>
              Anyone with the link sees the menu. Opening it on a phone with
              Chop it installed drops the whole week straight into the app.
            </p>

            {/* What the recipient actually gets. Mirrors /m/[code]. */}
            <div className={styles.preview}>
              <div className={styles.previewEyebrow}>Shared menu · {code}</div>
              <div className={styles.previewName}>{name.trim() || DEFAULT_NAME}</div>
              <div className={styles.previewSub}>
                {picks.length} {picks.length === 1 ? 'recipe' : 'recipes'}, sorted
                into a one-tap shop.
              </div>
              <ul className={styles.previewGrid}>
                {picks.map((recipe) => (
                  <li key={recipe.id}>
                    <div className={styles.previewThumb}>
                      {recipe.imageUrl ? (
                        <Image
                          src={recipe.imageUrl}
                          alt=""
                          fill
                          loading="lazy"
                          sizes="(max-width: 768px) 45vw, 160px"
                        />
                      ) : null}
                    </div>
                    <div className={styles.previewTitle}>{recipe.title}</div>
                    <div className={styles.previewMeta}>{recipe.meta}</div>
                  </li>
                ))}
              </ul>
              <a
                className={styles.previewCta}
                href={`${appDeepLinkBase}/${code}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in Chop it app
              </a>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
