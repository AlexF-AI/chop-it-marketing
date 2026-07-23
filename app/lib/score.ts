// Helpers for the Weekly Diversity Score — port of ring.jsx's bandFor/coachingFor/BRAND,
// with the colours retuned for the light theme (the vivid dark-theme originals
// wash out on cream/white surfaces).

// Ring-arc graphics: ≥3:1 non-text contrast on white cards (WCAG 1.4.11).
export const BRAND = {
  protein: '#BD4D76',
  fibre: '#C97F08',
  plants: '#4B9E50',
} as const;

// Keep in sync with --pink / --amber / --green / --purple in globals.css.
// Used as text colours, so each clears 4.5:1 on --bg/--card.
export const ACCENTS = {
  pink:   '#BD4D76',
  amber:  '#8F660A',
  green:  '#2F7A35',
  purple: '#6C63C7',
} as const;

export type AccentKey = keyof typeof ACCENTS;

export function bandFor(score: number): string {
  if (score >= 76) return 'Excellent';
  if (score >= 63) return 'Good';
  if (score >= 45) return 'Decent';
  return 'Needs work';
}

export function coachingFor(score: number): string {
  if (score >= 76) return 'Strong on plants and fibre. One fish swap would push you to Excellent.';
  if (score >= 63) return 'Strong week. One plant swap would make it great.';
  if (score >= 45) return 'Decent base. Fibre is the gap — easy to fix before you shop.';
  return 'Heavy on red meat this week — here\u2019s how to balance it out.';
}
