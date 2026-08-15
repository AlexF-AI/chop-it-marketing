// STAGED — see README.md. Graphic for /blog/how-much-fibre-do-you-need-a-day:
// the 30g target against the 4% of adults who reach it (National Diet and
// Nutrition Survey, as quoted in the article).

import { THEME, card, h } from '../theme.mjs';

function statTiles() {
  const tile = (value, label) =>
    h(
      'div',
      { display: 'flex', flexDirection: 'column', backgroundColor: THEME.surface, border: `1px solid ${THEME.line}`, borderRadius: 4, padding: '36px 44px', width: 520 },
      h('div', { fontSize: 88, fontWeight: 700, color: THEME.seriesA, marginBottom: 10 }, value),
      h('div', { fontSize: 26, color: THEME.muted, lineHeight: 1.35 }, label),
    );

  return card({
    width: 1200,
    kicker: 'The fibre gap',
    title: 'The UK fibre target, and how many adults reach it',
    footer: 'Target: UK government Eatwell guidance · share: National Diet and Nutrition Survey',
    body: h(
      'div',
      { display: 'flex', justifyContent: 'space-between' },
      tile('30g', 'Recommended daily fibre intake for UK adults'),
      tile('4%', 'Share of adults who actually meet the 30g recommendation'),
    ),
  });
}

export default {
  outputs: [
    { file: 'blog/how-much-fibre-do-you-need-a-day/uk-fibre-target-gap.webp', width: 1200, height: 560, render: statTiles },
  ],
};
