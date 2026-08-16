// Graphic for /blog/hellofresh-alternatives-uk. Prices mirror the article's
// table and discount list (checked 5 August 2026 from each kit's checkout).

import { THEME, card, h, legend } from '../theme.mjs';

const KITS = [
  { name: 'Gousto', standard: 4.65, intro: 2.32 },
  { name: 'HelloFresh', standard: 5.5, intro: 2.75 },
  { name: 'Mindful Chef', standard: 7.62, intro: 5.33 },
];

const MAX = 8;
const BAR_MAX_W = 700;

function row(label, value, color, sub) {
  const w = Math.max(8, Math.round((value / MAX) * BAR_MAX_W));
  return h(
    'div',
    { display: 'flex', alignItems: 'center', height: 46 },
    h('div', { width: 240, fontSize: 24, color: THEME.muted }, label),
    h('div', { width: w, height: 26, backgroundColor: color, borderRadius: 4 }),
    h('div', { fontSize: 24, marginLeft: 14, fontWeight: 600 }, `£${value.toFixed(2)}`),
    sub ? h('div', { fontSize: 21, marginLeft: 12, color: THEME.muted }, sub) : null,
  );
}

function kitChart() {
  const groups = KITS.map((k, i) =>
    h(
      'div',
      { display: 'flex', flexDirection: 'column', paddingTop: 18, paddingBottom: 18, borderTop: i === 0 ? 'none' : `1px solid ${THEME.line}` },
      h('div', { fontSize: 28, fontWeight: 700, marginBottom: 10 }, k.name),
      row('Standard rate', k.standard, THEME.seriesA),
      row('First-box offer', k.intro, THEME.seriesB, 'not what you pay in week three'),
    ),
  );

  return card({
    width: 1200,
    kicker: 'Meal kit costs',
    title: 'UK meal kit price per portion, August 2026',
    footer: 'Checked 5 August 2026 at each kit’s own checkout · standard rate is the ongoing price',
    body: [
      legend([
        { color: THEME.seriesA, label: 'Standard rate per portion' },
        { color: THEME.seriesB, label: 'Introductory offer per portion' },
      ]),
      ...groups,
    ],
  });
}

export default {
  outputs: [
    { file: 'blog/hellofresh-alternatives-uk/uk-meal-kit-price-per-portion.webp', width: 1200, height: 760, render: kitChart },
  ],
};
