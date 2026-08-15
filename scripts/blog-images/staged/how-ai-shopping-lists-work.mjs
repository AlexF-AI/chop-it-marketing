// STAGED — see README.md. Graphic for /learn/how-ai-shopping-lists-work:
// the three jobs a generated list does, matching the article's step H2s.

import { THEME, card, h } from '../theme.mjs';

const JOBS = [
  { head: 'Structured ingredients', body: 'Each recipe stores quantities as data, not lines of prose' },
  { head: 'Merging and unit conversion', body: 'Four recipes wanting onions become one line with a total' },
  { head: 'Pantry subtraction', body: 'What you already own comes off the list before you see it' },
];

function diagram() {
  const rows = JOBS.flatMap((s, i) => {
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
    const connector = i < JOBS.length - 1 ? h('div', { width: 3, height: 22, backgroundColor: THEME.line, marginLeft: 27, marginTop: 4, marginBottom: 4 }) : null;
    return [step, connector];
  });

  return card({
    width: 1200,
    kicker: 'How it works',
    title: 'The three jobs behind a generated shopping list',
    footer: 'Aisle sorting comes after all three',
    body: rows,
  });
}

export default {
  outputs: [
    { file: 'learn/how-ai-shopping-lists-work/generated-shopping-list-three-jobs.webp', width: 1200, height: 660, render: diagram },
  ],
};
