// Primary-segment picker for /recipes/[slug] in-page navigation.
//
// A recipe in `recipes_published.tags_json._catalog.segments[]` can carry
// multiple catalog segments (the offline curation pass tags one recipe
// against several "Quick weeknight + Healthy + Tray bake" buckets).
// For the breadcrumb middle crumb and the "More from <segment>" footer
// section we want a *single* primary segment per recipe, picked by the
// priority order below. Curation rationale: bbq_szn is seasonal and the
// most marketable surface; quick/comfort/healthy are the strongest
// editorial tentpoles; the rest of the list trails into long-tail.
//
// Returns null when the recipe carries no segments at all (very rare —
// at the time of writing 0 of 1,024 published recipes lacked segments),
// OR when it only carries segments outside the priority list (also
// expected to be zero in practice — every catalog segment is listed
// here).

import { COLLECTION_META } from './collections';

export const SEGMENT_PRIORITY = [
  'bbq_szn',
  'mediterranean',
  'quick',
  'comfort',
  'healthy',
  'high_protein',
  'one_pot',
  'batch',
  'tray_bake',
  'kid_friendly',
  'fodmap',
  'puds',
] as const;

export type SegmentSlug = (typeof SEGMENT_PRIORITY)[number];

// The August 2026 recipe-library release writes human labels into
// `_catalog.segments` ("Quick", "BBQ & Picnics", "Oven"), while the site's
// URLs and this module's priority list use slugs. Both spellings are
// accepted on read; `segmentDbLabel` is the form to query the database
// with. Checked 6 September 2026: every live recipe carries labels only.
export const SEGMENT_LABELS: Record<SegmentSlug, string> = {
  bbq_szn: 'BBQ & Picnics',
  mediterranean: 'Mediterranean',
  quick: 'Quick',
  comfort: 'Comfort',
  healthy: 'Healthy',
  high_protein: 'High Protein',
  one_pot: 'One Pot',
  batch: 'Batch',
  tray_bake: 'Oven',
  kid_friendly: 'Kid Friendly',
  fodmap: 'Low FODMAP',
  puds: 'Puds',
};

const SLUG_BY_NORMALISED_LABEL: Record<string, SegmentSlug> = Object.fromEntries(
  (Object.entries(SEGMENT_LABELS) as [SegmentSlug, string][]).flatMap(([slug, label]) => [
    [slug, slug],
    [normaliseSegmentText(label), slug],
  ]),
);

function normaliseSegmentText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/[^a-z0-9\s&]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Slug for a segment value in either spelling, or null when unknown. */
export function normaliseSegment(value: unknown): SegmentSlug | null {
  if (typeof value !== 'string') return null;
  return SLUG_BY_NORMALISED_LABEL[normaliseSegmentText(value)] ?? null;
}

/** The value stored in `_catalog.segments` for a slug. */
export function segmentDbLabel(slug: string): string {
  return SEGMENT_LABELS[slug as SegmentSlug] ?? slug;
}

// tags_json shape isn't strict-typed on the Recipe row (jsonb), so we
// take the loosest type we can read safely.
type TagsWithCatalog =
  | { _catalog?: { segments?: unknown } | null; [k: string]: unknown }
  | null
  | undefined;

/** Segment slugs for a recipe, whichever spelling the row carries. */
export function getRecipeSegments(tagsJson: TagsWithCatalog): string[] {
  const raw = tagsJson?._catalog?.segments;
  if (!Array.isArray(raw)) return [];
  const slugs = new Set<string>();
  for (const value of raw) {
    if (typeof value !== 'string') continue;
    slugs.add(normaliseSegment(value) ?? value);
  }
  return Array.from(slugs);
}

export function pickPrimarySegment(tagsJson: TagsWithCatalog): SegmentSlug | null {
  const segments = getRecipeSegments(tagsJson);
  if (segments.length === 0) return null;
  for (const s of SEGMENT_PRIORITY) {
    if (segments.includes(s)) return s as SegmentSlug;
  }
  return null;
}

export function segmentTitle(slug: SegmentSlug): string {
  return COLLECTION_META[slug]?.name ?? slug;
}
