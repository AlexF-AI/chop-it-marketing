// Generates article graphics from per-page configs, in the shared brand
// style (scripts/blog-images/theme.mjs). One command regenerates
// everything deterministically from data declared next to the page it
// belongs to:
//
//   npm run generate:blog-images            # all configs
//   npm run generate:blog-images -- <slug>  # one config by filename
//
// Each config in scripts/blog-images/configs/<name>.mjs exports:
//   export default {
//     outputs: [{
//       file: 'blog/<slug>/<graphic>.webp',  // under /public, kebab-case
//       width: 1200,                          // ≤ 1200
//       height: 800,
//       render: () => satoriElementTree,      // usually theme.card(...)
//     }],
//   }
//
// Pipeline: satori (element tree → SVG, Archivo embedded as paths) →
// sharp (SVG → webp). Output contract: webp, max 1200px wide, < 150KB —
// quality steps down automatically until the budget holds.

import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import satori from 'satori';
import sharp from 'sharp';

import { loadFonts } from './blog-images/theme.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CONFIG_DIR = join(HERE, 'blog-images/configs');
const PUBLIC_DIR = join(HERE, '../public');
const MAX_WIDTH = 1200;
const MAX_BYTES = 150 * 1024;

const only = process.argv[2];
const fonts = loadFonts();

const configFiles = readdirSync(CONFIG_DIR)
  .filter((f) => f.endsWith('.mjs'))
  .filter((f) => !only || f.replace(/\.mjs$/, '') === only.replace(/\.mjs$/, ''));

if (configFiles.length === 0) {
  console.error(only ? `No config named ${only} in ${CONFIG_DIR}` : `No configs in ${CONFIG_DIR}`);
  process.exit(1);
}

for (const file of configFiles) {
  const { default: config } = await import(join(CONFIG_DIR, file));
  for (const out of config.outputs) {
    if (out.width > MAX_WIDTH) throw new Error(`${out.file}: width ${out.width} exceeds ${MAX_WIDTH}`);
    if (!/^[a-z0-9/-]+\.webp$/.test(out.file)) throw new Error(`${out.file}: use kebab-case .webp paths`);

    const svg = await satori(out.render(), { width: out.width, height: out.height, fonts });

    let quality = 82;
    let buf;
    do {
      buf = await sharp(Buffer.from(svg)).webp({ quality, effort: 6 }).toBuffer();
      quality -= 8;
    } while (buf.length > MAX_BYTES && quality >= 34);
    if (buf.length > MAX_BYTES) throw new Error(`${out.file}: ${Math.round(buf.length / 1024)}KB over the 150KB budget at minimum quality`);

    const dest = join(PUBLIC_DIR, out.file);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, buf);
    console.log(`${out.file}  ${out.width}x${out.height}  ${Math.round(buf.length / 1024)}KB  q${quality + 8}`);
  }
}
