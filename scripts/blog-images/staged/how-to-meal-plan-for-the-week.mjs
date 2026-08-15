// STAGED — see README.md. Graphic for /blog/how-to-meal-plan-for-the-week:
// the three-step system the article's short answer describes.

import { THEME, card, h } from '../theme.mjs';

const STEPS = [
  { head: 'Pick 4–5 dinners for the week', body: 'A handful, not a month mapped out in advance' },
  { head: 'Write the one merged shopping list those meals need', body: 'Duplicates combined into single lines with totals' },
  { head: 'Shop to it once', body: 'Leftovers, theme nights and prep are polish on top' },
];

function flow() {
  const rows = STEPS.flatMap((s, i) => {
    const step = h(
      'div',
      { display: 'flex', alignItems: 'center', gap: 24 },
      h(
        'div',
        { width: 56, height: 56, borderRadius: 999, border: `3px solid ${THEME.seriesA}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, flexShrink: 0 },
        String(i + 1),
      ),
      h(
        'div',
        { display: 'flex', flexDirection: 'column', backgroundColor: THEME.surface, border: `1px solid ${THEME.line}`, borderRadius: 4, padding: '16px 24px', width: 960 },
        h('div', { fontSize: 28, fontWeight: 700, marginBottom: 4 }, s.head),
        h('div', { fontSize: 23, color: THEME.muted }, s.body),
      ),
    );
    const connector = i < STEPS.length - 1 ? h('div', { width: 3, height: 22, backgroundColor: THEME.line, marginLeft: 27, marginTop: 4, marginBottom: 4 }) : null;
    return [step, connector];
  });

  return card({
    width: 1200,
    kicker: 'The system',
    title: 'Meal planning that survives a real week',
    footer: 'The whole job is three steps · everything else is polish',
    body: rows,
  });
}

export default {
  outputs: [
    { file: 'blog/how-to-meal-plan-for-the-week/meal-planning-three-step-system.webp', width: 1200, height: 660, render: flow },
  ],
};
