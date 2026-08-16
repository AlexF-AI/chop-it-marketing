// Graphic for /research/ai-cooking-statistics. One measure (Attest's
// AI-food-tool adoption) across audience segments: single hue, direct
// labels, no legend needed.

import { THEME, card, h } from '../theme.mjs';

const SEGMENTS = [
  { label: 'All consumers surveyed', value: 63.8 },
  { label: 'UK consumers', value: 66.8 },
  { label: 'US consumers', value: 60.8 },
  { label: '18 to 24 year olds', value: 74 },
];

const BAR_MAX_W = 640;

function adoptionChart() {
  const rows = SEGMENTS.map((s, i) =>
    h(
      'div',
      { display: 'flex', alignItems: 'center', height: 74, borderTop: i === 0 ? 'none' : `1px solid ${THEME.line}` },
      h('div', { width: 330, fontSize: 25, color: THEME.ink }, s.label),
      h('div', { width: Math.round((s.value / 100) * BAR_MAX_W), height: 28, backgroundColor: THEME.seriesA, borderRadius: 4 }),
      h('div', { fontSize: 26, fontWeight: 700, marginLeft: 16 }, `${s.value}%`),
    ),
  );

  return card({
    width: 1200,
    kicker: 'AI cooking statistics',
    title: 'Who has used AI-powered tools for food-related activities',
    footer: 'Source: Attest, updated 24 June 2026 · sample size not stated in the article · scale 0–100%',
    body: rows,
  });
}

export default {
  outputs: [
    { file: 'research/ai-cooking-statistics/ai-food-tool-adoption.webp', width: 1200, height: 680, render: adoptionChart },
  ],
};
