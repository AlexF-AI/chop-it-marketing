// Shared look for generated article graphics. Mirrors the blog OG card
// (app/blog/[slug]/opengraph-image.tsx) and the site's dark palette in
// app/styles/globals.css: same ground, same ink, same Archivo type the
// site renders in, so a generated chart reads as a Chop it asset.
//
// Chart series colours are deliberately deeper steps of the brand accent
// and fibre ramps than the UI tokens (#E4739A / #E0B54A): the pair
// #C75A80 / #B08A2E passes all six checks of the palette validator on the
// dark surface (lightness band, chroma, CVD separation, normal-vision
// floor, contrast) — validated 15 Aug 2026. Change them only through the
// validator.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

export const THEME = {
  ground: '#131110', // dark --ground
  surface: '#1C1917', // dark --surface
  line: '#302B27', // dark --line
  ink: '#F7F4EE', // dark --ink
  muted: '#A9A29A', // dark --ink-2
  seriesA: '#C75A80', // validated chart step of the accent ramp
  seriesB: '#B08A2E', // validated chart step of the fibre ramp
  good: '#9BB06A', // dark --green, status only, always with a label
};

export function loadFonts() {
  return [
    { name: 'Archivo', weight: 400, style: 'normal', data: readFileSync(join(HERE, '../fonts/Archivo-400.ttf')) },
    { name: 'Archivo', weight: 600, style: 'normal', data: readFileSync(join(HERE, '../fonts/Archivo-600.ttf')) },
    { name: 'Archivo', weight: 700, style: 'normal', data: readFileSync(join(HERE, '../fonts/Archivo-700.ttf')) },
  ];
}

/** Tiny hyperscript for satori element trees (no JSX in scripts). Satori
 * demands an explicit display on any element with several children, so
 * default every div to flex (satori has no block layout anyway). */
export function h(type, style = {}, ...children) {
  const kids = children.flat().filter((c) => c !== null && c !== undefined && c !== false);
  const withDisplay = type === 'div' && style.display === undefined ? { display: 'flex', ...style } : style;
  return { type, props: { style: withDisplay, children: kids.length === 1 ? kids[0] : kids } };
}

/**
 * Brand card frame every graphic sits in: dark ground, kicker, title,
 * chop-it.com footer. `body` fills the middle.
 */
export function card({ width, title, kicker, footer, body }) {
  return h(
    'div',
    {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: THEME.ground,
      padding: 56,
      fontFamily: 'Archivo',
      color: THEME.ink,
    },
    kicker
      ? h('div', { fontSize: 22, letterSpacing: 2, color: THEME.muted, textTransform: 'uppercase', marginBottom: 14 }, kicker)
      : null,
    h('div', { fontSize: 40, fontWeight: 700, lineHeight: 1.15, marginBottom: 36, maxWidth: width - 112 }, title),
    h('div', { display: 'flex', flexDirection: 'column', flexGrow: 1 }, body),
    h(
      'div',
      { display: 'flex', justifyContent: 'space-between', marginTop: 40, fontSize: 22, color: THEME.muted },
      h('div', {}, footer ?? ''),
      h('div', {}, 'chop-it.com'),
    ),
  );
}

/** Legend row: swatch + label pairs, plus optional note on the right. */
export function legend(entries, note) {
  return h(
    'div',
    { display: 'flex', alignItems: 'center', gap: 28, marginBottom: 28, fontSize: 24 },
    entries.map((e) =>
      h(
        'div',
        { display: 'flex', alignItems: 'center', gap: 10 },
        h('div', {
          width: 22,
          height: 22,
          borderRadius: 4,
          backgroundColor: e.outlined ? 'transparent' : e.color,
          border: e.outlined ? `3px solid ${e.color}` : 'none',
        }),
        h('div', { color: THEME.muted }, e.label),
      ),
    ),
    note ? h('div', { marginLeft: 'auto', fontSize: 22, color: THEME.muted }, note) : null,
  );
}
