// Graphic for /features/pantry. Use-by life per ingredient type, matching
// the article's description of the shelf-life model (fish in a couple of
// days through tins and dry goods in weeks).

import { THEME, card, h } from '../theme.mjs';

const TYPES = [
  { label: 'Fish', days: 2 },
  { label: 'Raw meat', days: 3 },
  { label: 'Leafy herbs and soft fruit', days: 4 },
  { label: 'Fresh dairy', days: 5 },
  { label: 'Hardy vegetables', days: 14 },
  { label: 'Tins and dry goods', days: 45 },
];

const MAX = 46;
const BAR_MAX_W = 620;

function shelfLifeChart() {
  const rows = TYPES.map((t, i) =>
    h(
      'div',
      { display: 'flex', alignItems: 'center', height: 66, borderTop: i === 0 ? 'none' : `1px solid ${THEME.line}` },
      h('div', { width: 330, fontSize: 25 }, t.label),
      h('div', { width: Math.max(10, Math.round((t.days / MAX) * BAR_MAX_W)), height: 28, backgroundColor: THEME.seriesA, borderRadius: 4 }),
      h('div', { fontSize: 25, fontWeight: 700, marginLeft: 16 }, t.days === 45 ? '6+ weeks' : `${t.days} days`),
    ),
  );

  return card({
    width: 1200,
    kicker: 'Pantry shelf-life model',
    title: 'Each ingredient carries a use-by life matched to what it is',
    footer: 'Items are flagged to use before they turn, never silently deleted',
    body: rows,
  });
}

export default {
  outputs: [
    { file: 'features/pantry/pantry-shelf-life-model.webp', width: 1200, height: 760, render: shelfLifeChart },
  ],
};
