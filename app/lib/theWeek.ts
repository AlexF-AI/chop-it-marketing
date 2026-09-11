/**
 * The four dinners the homepage shows as "a week".
 *
 * Both the featured rail and the live shopping-list demo read from this
 * list, so the four dishes you browse are the four the shop is built from
 * and the one Cook Mode opens. They used to be "top four by
 * display_priority", which kept them in sync only by accident and changed
 * under us whenever a recipe was re-prioritised.
 *
 * Order matters: it is the order they appear in the rail, and the first
 * slug is the recipe the Cook Mode card opens on. Two chicken dishes are
 * deliberately spaced apart.
 *
 * Every slug here must be `seo_published` with an image, ingredients and a
 * method — anything missing is dropped rather than rendered half-built, so
 * a retired recipe shortens the week instead of breaking the page.
 */
export const WEEK_SLUGS = [
  'chicken-marbella',
  'charred-sweetcorn-and-black-bean-tacos',
  'chargrilled-chicken-with-chimichurri-and-butter-bean-salad',
  'burrata-with-grilled-peaches-prosciutto-and-basil',
] as const;

/** Sort rows into WEEK_SLUGS order; anything unlisted sorts last. */
export function bySlugOrder<T extends { slug: string | null }>(rows: T[]): T[] {
  const rank = new Map<string, number>(WEEK_SLUGS.map((slug, i) => [slug, i]));
  return [...rows].sort(
    (a, b) =>
      (rank.get(a.slug ?? '') ?? Number.MAX_SAFE_INTEGER) -
      (rank.get(b.slug ?? '') ?? Number.MAX_SAFE_INTEGER),
  );
}
