// Graphic for /blog/meal-planning-app-shopping-list-uk. Mirrors the
// article's opening example: four recipes wanting onions (1+1+1+2) should
// produce one five-onion line.

import { THEME, card, h } from '../theme.mjs';

function listLine(text, opts = {}) {
  return h(
    'div',
    {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '12px 22px',
      borderTop: opts.first ? 'none' : `1px solid ${THEME.line}`,
      fontSize: 25,
      color: opts.muted ? THEME.muted : THEME.ink,
    },
    h('div', { width: 12, height: 12, borderRadius: 999, border: `2px solid ${THEME.muted}` }),
    text,
  );
}

function panel(title, lines, verdictText, verdictColor) {
  return h(
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
      { marginTop: 16, fontSize: 23, color: verdictColor, display: 'flex', alignItems: 'center', gap: 10 },
      h('div', { width: 14, height: 14, borderRadius: 4, backgroundColor: verdictColor }),
      verdictText,
    ),
  );
}

function mergeTest() {
  return card({
    width: 1200,
    kicker: 'The merge test',
    title: 'Four recipes, five onions. What does your list say?',
    footer: 'A bolognese, a curry, a soup and a traybake · the test this article runs on every app',
    body: h(
      'div',
      { display: 'flex', justifyContent: 'space-between' },
      panel(
        'Stored as text lines',
        [
          listLine('1 onion · bolognese', { first: true }),
          listLine('1 onion · curry'),
          listLine('1 onion · soup'),
          listLine('2 onions · traybake'),
        ],
        'Adding up left to you, in aisle three',
        THEME.muted,
      ),
      panel(
        'Stored as structured quantities',
        [listLine('5 onions', { first: true })],
        'One line, one total',
        THEME.good,
      ),
    ),
  });
}

export default {
  outputs: [
    { file: 'blog/meal-planning-app-shopping-list-uk/shopping-list-merge-test.webp', width: 1200, height: 600, render: mergeTest },
  ],
};
