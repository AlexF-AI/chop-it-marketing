// Graphic for /blog/chatgpt-meal-planning. Mirrors the article's five-step
// method for getting a usable weekly plan out of ChatGPT.

import { THEME, card, h } from '../theme.mjs';

const STEPS = [
  { head: 'Set the constraints once, in one message', body: 'Budget, portions, dislikes and time, front-loaded rather than corrected over six messages' },
  { head: 'Approve titles, then ask for methods', body: 'Get five dinner titles right before any recipe text is written' },
  { head: 'Ask for the shopping list as a separate step', body: 'Tell it explicitly to merge duplicates into single lines with totals' },
  { head: 'Get the plan out of the chat', body: 'Copy the list and the week somewhere you will actually look' },
  { head: 'Start next week in the same conversation', body: 'Continuing the chat keeps your constraints alive without retyping' },
];

function flow() {
  const rows = STEPS.flatMap((s, i) => {
    const step = h(
      'div',
      { display: 'flex', alignItems: 'center', gap: 24 },
      h(
        'div',
        {
          width: 56,
          height: 56,
          borderRadius: 999,
          border: `3px solid ${THEME.seriesA}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          fontWeight: 700,
          flexShrink: 0,
        },
        String(i + 1),
      ),
      h(
        'div',
        { display: 'flex', flexDirection: 'column', backgroundColor: THEME.surface, border: `1px solid ${THEME.line}`, borderRadius: 4, padding: '14px 24px', width: 960 },
        h('div', { fontSize: 27, fontWeight: 700, marginBottom: 4 }, s.head),
        h('div', { fontSize: 23, color: THEME.muted, lineHeight: 1.3 }, s.body),
      ),
    );
    const connector =
      i < STEPS.length - 1
        ? h('div', { width: 3, height: 20, backgroundColor: THEME.line, marginLeft: 27, marginTop: 4, marginBottom: 4 })
        : null;
    return [step, connector];
  });

  return card({
    width: 1200,
    kicker: 'The method',
    title: 'A week of meals out of ChatGPT, in five steps',
    footer: 'Works on the free tier · the full prompts are in the article',
    body: rows,
  });
}

export default {
  outputs: [
    { file: 'blog/chatgpt-meal-planning/chatgpt-meal-planning-five-steps.webp', width: 1200, height: 940, render: flow },
  ],
};
