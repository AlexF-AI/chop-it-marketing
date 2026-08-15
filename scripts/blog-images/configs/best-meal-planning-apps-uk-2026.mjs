// Graphics for /blog/best-meal-planning-apps-uk-2026.
// Prices mirror the article's comparison table exactly (verified on the UK
// App Store / in-app on 5 August 2026). If the table changes, change this
// data and re-run: npm run generate:blog-images -- best-meal-planning-apps-uk-2026

import { THEME, card, h, legend } from '../theme.mjs';

// Article-table order. monthly/annual in GBP; null = no such tier.
// oneTime marks Paprika's buy-once price, drawn outlined + labelled rather
// than as a third colour.
const APPS = [
  { name: 'Chop it', monthly: 3.99, annual: 34.99 },
  { name: 'Mealime', monthly: 2.99, annual: null },
  { name: 'Samsung Food', monthly: 6.99, annual: 59.99 },
  { name: 'Paprika 3', monthly: null, annual: null, oneTime: 4.99 },
  { name: 'Cherrypick', monthly: 3.49, annual: null, note: 'Plus tier' },
  { name: 'Plan to Eat', monthly: null, annual: 49.99 },
  { name: 'AnyList', monthly: null, annual: 9.99 },
  { name: 'Eat This Much', monthly: 14.99, annual: 58.99 },
  { name: 'Good Food', monthly: 4.49, annual: 24.99 },
  { name: 'Mob', monthly: 6.99, annual: 39.99 },
];

const MAX_MONTHLY = 16; // scale ceilings just above the data maxima
const MAX_ANNUAL = 64;

const ROW_H = 64;
const BAR_H = 26;
const PANEL_W = 360;
const LABEL_W = 220;

function bar(value, max, color, text, { outlined = false } = {}) {
  if (value === null) {
    return h('div', { fontSize: 22, color: THEME.muted, display: 'flex', alignItems: 'center', height: BAR_H }, '—');
  }
  const w = Math.max(8, Math.round((value / max) * (PANEL_W - 110)));
  return h(
    'div',
    { display: 'flex', alignItems: 'center', gap: 12, height: BAR_H },
    h('div', {
      width: w,
      height: BAR_H,
      backgroundColor: outlined ? 'transparent' : color,
      border: outlined ? `3px solid ${color}` : 'none',
      borderRadius: 4,
    }),
    h('div', { fontSize: 22, color: THEME.ink }, text),
  );
}

function priceChart() {
  const header = h(
    'div',
    { display: 'flex', fontSize: 24, fontWeight: 600, color: THEME.muted, marginBottom: 12 },
    h('div', { width: LABEL_W }, ''),
    h('div', { width: PANEL_W }, 'Per month'),
    h('div', { width: PANEL_W }, 'Per year'),
  );

  const rows = APPS.map((a, i) =>
    h(
      'div',
      {
        display: 'flex',
        alignItems: 'center',
        height: ROW_H,
        borderTop: i === 0 ? 'none' : `1px solid ${THEME.line}`,
      },
      h(
        'div',
        { width: LABEL_W, fontSize: 25, fontWeight: 600, display: 'flex', flexDirection: 'column' },
        h('div', {}, a.name),
        a.note ? h('div', { fontSize: 19, fontWeight: 400, color: THEME.muted }, a.note) : null,
      ),
      h(
        'div',
        { width: PANEL_W, display: 'flex' },
        a.oneTime
          ? bar(a.oneTime, MAX_MONTHLY, THEME.seriesA, `£${a.oneTime.toFixed(2)} one-time`, { outlined: true })
          : bar(a.monthly, MAX_MONTHLY, THEME.seriesA, a.monthly === null ? '' : `£${a.monthly.toFixed(2)}`),
      ),
      h(
        'div',
        { width: PANEL_W, display: 'flex' },
        a.oneTime
          ? h('div', { fontSize: 22, color: THEME.muted, display: 'flex', alignItems: 'center', height: BAR_H }, 'pay once, keep forever')
          : bar(a.annual, MAX_ANNUAL, THEME.seriesB, a.annual === null ? '' : `£${a.annual.toFixed(2)}`),
      ),
    ),
  );

  return card({
    width: 1200,
    kicker: 'Price comparison',
    title: 'UK meal planning app prices, verified August 2026',
    footer: 'Cheapest paid tier per app · UK App Store and in-app prices, 5 August 2026',
    body: [
      legend(
        [
          { color: THEME.seriesA, label: 'Monthly price' },
          { color: THEME.seriesB, label: 'Annual price' },
          { color: THEME.seriesA, label: 'One-time purchase', outlined: true },
        ],
        'Panels use separate scales',
      ),
      header,
      ...rows,
    ],
  });
}

// Decision flowchart mirroring the article's intro verdicts, same order.
const VERDICTS = [
  { want: 'The largest bank of reliable British recipes', app: 'Good Food' },
  { want: 'To own your collection outright and never pay again', app: 'Paprika 3' },
  { want: 'A free planner that writes the shopping list for you', app: 'Samsung Food' },
  { want: "Your basket priced at Sainsbury's, Tesco or Asda while you plan", app: 'Cherrypick' },
  { want: 'Four people in your house on the same list', app: 'AnyList' },
  { want: 'Recipes from ChatGPT, cookbooks and the web kept in one library', app: 'Chop it' },
];

function flowchart() {
  const rows = VERDICTS.map((v) =>
    h(
      'div',
      { display: 'flex', alignItems: 'center', marginBottom: 18 },
      h(
        'div',
        {
          width: 700,
          backgroundColor: THEME.surface,
          border: `1px solid ${THEME.line}`,
          borderRadius: 4,
          padding: '18px 24px',
          fontSize: 26,
          lineHeight: 1.3,
          display: 'flex',
        },
        v.want,
      ),
      h('div', { width: 60, display: 'flex', justifyContent: 'center', fontSize: 30, color: THEME.muted }, '→'),
      h(
        'div',
        {
          border: `3px solid ${THEME.seriesA}`,
          borderRadius: 4,
          padding: '16px 26px',
          fontSize: 28,
          fontWeight: 700,
          display: 'flex',
        },
        v.app,
      ),
    ),
  );

  return card({
    width: 1200,
    kicker: 'Decision guide',
    title: 'Which meal planning app should you choose?',
    footer: 'Start from the job you need done, not the feature list',
    body: [
      h('div', { fontSize: 26, fontWeight: 600, color: THEME.muted, marginBottom: 24, display: 'flex' }, 'What do you mainly want?'),
      ...rows,
    ],
  });
}

// Before/after of the duplicate-ingredient merge, for the judging-criteria
// section. Status green is used for the merged state, with a label doing
// the work rather than colour alone.
function mergeGraphic() {
  const listLine = (text, opts = {}) =>
    h(
      'div',
      {
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '13px 22px',
        borderTop: opts.first ? 'none' : `1px solid ${THEME.line}`,
        fontSize: 26,
        color: opts.muted ? THEME.muted : THEME.ink,
      },
      h('div', { width: 12, height: 12, borderRadius: 999, border: `2px solid ${THEME.muted}` }),
      text,
    );

  // No glyph icons here: Archivo carries no ✓/✗, so the verdict is a
  // coloured swatch plus words — the label does the work, not the colour.
  const panel = (title, lines, verdictText, verdictColor) =>
    h(
      'div',
      { display: 'flex', flexDirection: 'column', width: 512 },
      h('div', { fontSize: 26, fontWeight: 700, marginBottom: 16 }, title),
      h(
        'div',
        { display: 'flex', flexDirection: 'column', backgroundColor: THEME.surface, border: `1px solid ${THEME.line}`, borderRadius: 4 },
        lines,
      ),
      h(
        'div',
        { marginTop: 16, fontSize: 24, color: verdictColor, display: 'flex', alignItems: 'center', gap: 10 },
        h('div', { width: 14, height: 14, borderRadius: 4, backgroundColor: verdictColor }),
        verdictText,
      ),
    );

  return card({
    width: 1200,
    kicker: 'The shopping list test',
    title: 'Four recipes want onions. What does the list say?',
    footer: 'How Chop it merges duplicate ingredients into one line',
    body: h(
      'div',
      { display: 'flex', justifyContent: 'space-between' },
      panel(
        'Without merging',
        [
          listLine('1 onion · Tuesday curry', { first: true }),
          listLine('1 onion · stir fry'),
          listLine('1 onion · soup'),
          listLine('1 onion · Friday chilli'),
        ],
        'You still do the arithmetic in the shop',
        THEME.muted,
      ),
      panel(
        'Merged list',
        [
          listLine('3 onions', { first: true }),
          listLine('(1 already in your pantry)', { muted: true }),
        ],
        'One line, total counted, pantry checked',
        THEME.good,
      ),
    ),
  });
}

export default {
  outputs: [
    { file: 'blog/best-meal-planning-apps-uk-2026/uk-meal-planning-app-prices-august-2026.webp', width: 1200, height: 1000, render: priceChart },
    { file: 'blog/best-meal-planning-apps-uk-2026/meal-planning-app-decision-guide.webp', width: 1200, height: 900, render: flowchart },
    { file: 'blog/best-meal-planning-apps-uk-2026/shopping-list-ingredient-merge.webp', width: 1200, height: 580, render: mergeGraphic },
  ],
};
