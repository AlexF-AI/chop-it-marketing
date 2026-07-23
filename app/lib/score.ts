// Helpers for the Weekly Diversity Score — port of ring.jsx's bandFor/coachingFor/BRAND,
// with the colours retuned for the light theme (the vivid dark-theme originals
// wash out on cream/white surfaces).

export const BRAND = {
  protein: '#BD4D76',
  fibre: '#DE8E0B',
  plants: '#4B9E50',
} as const;

// Keep in sync with --pink / --amber / --green / --purple in globals.css.
export const ACCENTS = {
  pink:   '#BD4D76',
  amber:  '#A8770D',
  green:  '#3E8E43',
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
