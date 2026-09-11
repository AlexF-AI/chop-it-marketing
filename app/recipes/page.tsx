import type { Metadata } from 'next';
import Link from 'next/link';

import Footer from '@/app/components/Footer';
import Nav from '@/app/components/Nav';
import RecipeGrid from '@/app/components/RecipeGrid';
import { CUISINE_COUNTS, CUISINE_META, CUISINE_SLUGS } from '@/app/lib/cuisines';
import {
  countPublishedRecipes,
  getDistinctCostBands,
  getDistinctCuisines,
  listPublishedRecipes,
  searchPublicRecipes,
} from '@/app/lib/recipes';
import { serializeJsonLd, SITE_ORIGIN } from '@/app/lib/recipeSchema';
import shared from '@/app/components/homepage/shared.module.css';
import styles from './RecipesHub.module.css';

export const revalidate = 3600;

const PER_PAGE = 24;

// The cuisine band's headline spells its number out ("Seventeen kitchens"),
// which reads better than a numeral at 40px serif. Derived from
// CUISINE_SLUGS rather than typed, so adding an eighteenth cuisine can't
// leave the heading lying; anything outside this range falls back to the
// numeral rather than inventing a word.
const NUMBER_WORDS: Record<number, string> = {
  12: 'Twelve',
  13: 'Thirteen',
  14: 'Fourteen',
  15: 'Fifteen',
  16: 'Sixteen',
  17: 'Seventeen',
  18: 'Eighteen',
  19: 'Nineteen',
  20: 'Twenty',
};

function spellCount(n: number): string {
  return NUMBER_WORDS[n] ?? String(n);
}

type SearchParams = {
  q?: string;
  page?: string;
  season?: string;
  cuisine?: string;
  cost?: string;
};

// Anything beyond the canonical /recipes view is noindex,follow: pagination,
// filter narrowing and arbitrary on-site search results. Curated cuisine and
// collection routes carry the indexable category intent instead.
function isCanonicalHubView(sp: SearchParams): boolean {
  const page = Number.parseInt(sp.page ?? '1', 10) || 1;
  if (page > 1) return false;
  if (sp.season || sp.cuisine || sp.cost) return false;
  return true;
}

// Build the visible search-results URL used by SearchResultsPage JSON-LD.
function searchUrl(query: string): string {
  return `${SITE_ORIGIN}/recipes?q=${encodeURIComponent(query)}`;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? '';

  if (q) {
    const title = `"${q}" recipes | Chop it`;
    const description = `Search results for "${q}" in the Chop it recipe library.`;
    return {
      title,
      description,
      alternates: { canonical: `${SITE_ORIGIN}/recipes` },
      openGraph: {
        title,
        description,
        url: searchUrl(q),
        type: 'website',
      },
      robots: { index: false, follow: true },
    };
  }

  const canonical = isCanonicalHubView(sp);
  const base: Metadata = {
    title: 'Recipes for UK kitchens | Chop it',
    description:
      'Browse dinner recipes built for UK kitchens, with metric quantities, familiar ingredient names and clear methods for planning and cooking the week.',
    alternates: { canonical: `${SITE_ORIGIN}/recipes` },
    openGraph: {
      title: 'Recipes for UK kitchens | Chop it',
      description:
        'Browse dinner recipes built for UK kitchens, with metric quantities, familiar ingredient names and clear methods.',
      url: `${SITE_ORIGIN}/recipes`,
      type: 'website',
    },
  };
  if (!canonical) {
    base.robots = { index: false, follow: true };
  }
  return base;
}


// SearchResultsPage with a nested ItemList. Google's GSC URL inspector
// fails to detect a top-level ItemList on a search page — it expects the
// SearchResultsPage wrapper that explicitly types the page intent. Flat
// ListItems (url + name only, no nested Recipe item) so the schema is
// unambiguous as a "listing pointer" rather than competing with the
// per-recipe Recipe schema rendered on each detail page.
function buildSearchResultsPageJsonLd(
  query: string,
  items: { slug: string; title: string }[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    name: `Recipes matching "${query}"`,
    url: searchUrl(query),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((r, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `${SITE_ORIGIN}/recipes/${r.slug}`,
        name: r.title,
      })),
    },
  };
}

export default async function RecipesHubPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1);
  const q = sp.q?.trim() ?? '';

  // Two modes:
  //   - Search mode (q present): call the RPC, ignore facet filters
  //     (combining search + facets is v1.1). The filter bar still renders
  //     because the hub layout stays the same; the filter links drop q so
  //     clicking one exits search mode.
  //   - Browse mode (no q): existing listPublishedRecipes path.
  const searchMode = q.length > 0;
  const season = searchMode ? undefined : sp.season || undefined;
  const cuisine = searchMode ? undefined : sp.cuisine || undefined;
  const costBand = searchMode ? undefined : sp.cost || undefined;

  const [total, listResult, cuisines, costBands] = await Promise.all([
    countPublishedRecipes(),
    searchMode
      ? searchPublicRecipes(q, { page, perPage: PER_PAGE })
      : listPublishedRecipes({ page, perPage: PER_PAGE, season, cuisine, costBand }),
    getDistinctCuisines(),
    getDistinctCostBands(),
  ]);
  const { items, total: resultTotal } = listResult;

  // Browse mode has an exact count from the table, so it can say "of N".
  // Search mode cannot — the RPC returns no total — so it reports only
  // whether another page exists. See searchPublicRecipes.
  const hasMore = listResult.hasMore;
  const totalPages = searchMode
    ? null
    : Math.max(1, Math.ceil(total / PER_PAGE));
  const filteredTotal = items.length;

  const buildHref = (overrides: Partial<SearchParams>) => {
    const qs = new URLSearchParams();
    const merged: Partial<SearchParams> = searchMode
      ? { q, page: page > 1 ? String(page) : undefined, ...overrides }
      : { season, cuisine, cost: costBand, ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) qs.set(k, v);
    }
    const qsStr = qs.toString();
    return qsStr ? `/recipes?${qsStr}` : '/recipes';
  };

  const searchJsonLd =
    searchMode && items.length > 0 ? buildSearchResultsPageJsonLd(q, items) : null;

  return (
    <>
      <Nav />
      <main>
      <section>
        <div className={styles.head}>
          <div className={shared.eyebrow}>Every recipe</div>
          <h1 className={styles.h1}>
            {searchMode ? `Recipes matching "${q}"` : 'Recipes for UK kitchens'}
          </h1>
          <p className={styles.lede}>
            {searchMode
              ? `${hasMore ? `${resultTotal}+` : resultTotal} ${
                  resultTotal === 1 ? 'recipe' : 'recipes'
                } matching "${q}".`
              : `Browse ${total.toLocaleString('en-GB')} dinner recipes with metric quantities, familiar ingredient names and clear methods.`}
          </p>
        </div>

        <div className={styles.body}>
        <form
          className={styles.search}
          method="GET"
          action="/recipes"
          role="search"
        >
          <label className={styles.searchLabel} htmlFor="recipe-search-q">
            Search recipes
          </label>
          <input
            id="recipe-search-q"
            className={styles.searchInput}
            type="search"
            name="q"
            placeholder="Search by recipe title…"
            defaultValue={q}
            autoComplete="off"
          />
          <button type="submit" className={styles.searchSubmit}>
            Search
          </button>
        </form>

        {/* Chip rows rather than a wrapped filter bar: a scroller keeps
            seventeen cuisines to one line at phone width. Both rows are
            links, not buttons, so a filtered view stays shareable and
            works with JS off. */}
        {!searchMode && (
          <nav className={styles.filters} aria-label="Filter recipes">
            {cuisines.length > 0 && (
              <>
                <div className={styles.filterLabel}>Cuisine</div>
                <ul className={styles.chipRow}>
                  <li>
                    <Link
                      className={`${styles.chip} ${cuisine ? '' : styles.chipOn}`}
                      aria-current={cuisine ? undefined : 'true'}
                      href={buildHref({ cuisine: undefined, page: undefined })}
                    >
                      All
                    </Link>
                  </li>
                  {cuisines.map((c) => (
                    <li key={c}>
                      <Link
                        className={`${styles.chip} ${cuisine === c ? styles.chipOn : ''}`}
                        aria-current={cuisine === c ? 'true' : undefined}
                        href={buildHref({ cuisine: c, page: undefined })}
                      >
                        {c}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {costBands.length > 0 && (
              <>
                <div className={styles.filterLabel}>Cost</div>
                <ul className={styles.chipRow}>
                  <li>
                    <Link
                      className={`${styles.chip} ${costBand ? '' : styles.chipOn}`}
                      aria-current={costBand ? undefined : 'true'}
                      href={buildHref({ cost: undefined, page: undefined })}
                    >
                      All
                    </Link>
                  </li>
                  {costBands.map((c) => (
                    <li key={c}>
                      <Link
                        className={`${styles.chip} ${costBand === c ? styles.chipOn : ''}`}
                        aria-current={costBand === c ? 'true' : undefined}
                        href={buildHref({ cost: c, page: undefined })}
                      >
                        {c}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </nav>
        )}

        {searchMode && filteredTotal === 0 ? (
          <p className={styles.note}>
            No recipes match &ldquo;{q}&rdquo;. Try browsing{' '}
            <Link href="/recipes" className={shared.link}>
              all recipes
            </Link>
            .
          </p>
        ) : (
          <RecipeGrid items={items} />
        )}

        {filteredTotal > 0 && (page > 1 || hasMore) && (
          <nav className={styles.pagination} aria-label="Pagination">
            <span className={styles.pageOf}>
              {totalPages ? `Page ${page} of ${totalPages}` : `Page ${page}`}
            </span>
            <span className={styles.pageLinks}>
              {page > 1 && (
                <Link
                  className={styles.pageLink}
                  href={buildHref({ page: page > 2 ? String(page - 1) : undefined })}
                >
                  <span aria-hidden="true">←</span> Prev
                </Link>
              )}
              {hasMore && (
                <Link
                  className={styles.pageLink}
                  href={buildHref({ page: String(page + 1) })}
                >
                  Next <span aria-hidden="true">→</span>
                </Link>
              )}
            </span>
          </nav>
        )}
        {!searchMode && filteredTotal === 0 && (season || cuisine || costBand) && (
          <p className={styles.note}>
            No recipes match these filters yet.{' '}
            <Link href="/recipes" className={shared.link}>
              Reset
            </Link>
          </p>
        )}
        </div>

        {/* Browse by cuisine — 17 curated cuisine landings. Sorted by
            recipe count desc so the biggest cuisines lead. Only rendered
            in browse mode (out of search results context). */}
        {!searchMode && (
          <section className={styles.cuisineBand} aria-labelledby="cuisine-browse-h">
            <div className={styles.cuisineInner}>
              <div className={`${shared.eyebrow} ${shared.eyebrowOnRasp}`}>
                Browse by cuisine
              </div>
              <h2 id="cuisine-browse-h" className={styles.cuisineH}>
                {spellCount(CUISINE_SLUGS.length)} kitchens, one library.
              </h2>
              <ul className={styles.cuisineGrid}>
                {[...CUISINE_SLUGS]
                  .sort((a, b) => (CUISINE_COUNTS[b] ?? 0) - (CUISINE_COUNTS[a] ?? 0))
                  .map((slug) => (
                    <li key={slug}>
                      <Link
                        href={`/recipes/cuisine/${slug}`}
                        className={styles.cuisineCard}
                      >
                        <span className={styles.cuisineName}>
                          {CUISINE_META[slug].name}
                        </span>
                        <span className={styles.cuisineCount}>
                          {CUISINE_COUNTS[slug]}
                        </span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          </section>
        )}
      </section>
      </main>
      {searchJsonLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(searchJsonLd) }}
        />
      )}
      <Footer />
    </>
  );
}
