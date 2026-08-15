// Build-time image dimension lookup for markdown-embedded images.
//
// Markdown bodies reference images as ![alt](/blog/…/name.webp). To render
// them through next/image without layout shift we need intrinsic
// width/height at render time. Every article page is fully prerendered
// (generateStaticParams + dynamicParams=false), so reading the file from
// /public here happens at build only — the same contract as getPostBody().
//
// Parses the header bytes directly (PNG, JPEG, WebP in its VP8/VP8L/VP8X
// flavours) so we take no dependency for a few dozen bytes of struct
// reading. Unknown formats return null and the caller falls back to a
// plain lazy <img>.

import { openSync, readSync, closeSync } from 'node:fs';
import { join } from 'node:path';

export type ImageDimensions = { width: number; height: number };

const cache = new Map<string, ImageDimensions | null>();

function readHead(path: string, bytes: number): Buffer | null {
  let fd: number;
  try {
    fd = openSync(path, 'r');
  } catch {
    return null;
  }
  try {
    const buf = Buffer.alloc(bytes);
    const read = readSync(fd, buf, 0, bytes, 0);
    return buf.subarray(0, read);
  } finally {
    closeSync(fd);
  }
}

function parse(buf: Buffer): ImageDimensions | null {
  // PNG: IHDR width/height at fixed offsets.
  if (buf.length >= 24 && buf.subarray(0, 8).equals(Buffer.from('\x89PNG\r\n\x1a\n', 'binary'))) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  // JPEG: walk markers to the first SOFn frame header.
  if (buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) {
        i += 1;
        continue;
      }
      const marker = buf[i + 1];
      if (marker >= 0xc0 && marker <= 0xc3) {
        return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
    return null;
  }
  // WebP: RIFF container, three chunk flavours.
  if (buf.length >= 30 && buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP') {
    const chunk = buf.subarray(12, 16).toString();
    if (chunk === 'VP8 ') {
      return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
    }
    if (chunk === 'VP8L') {
      const b = buf.readUInt32LE(21);
      return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
    }
    if (chunk === 'VP8X') {
      return {
        width: 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16)),
        height: 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16)),
      };
    }
  }
  return null;
}

/**
 * Dimensions for a public asset referenced by root-relative URL
 * (e.g. "/blog/best-meal-planning-apps-uk-2026/price-chart.webp").
 * Returns null for external URLs or unparseable files.
 */
export function getPublicImageDimensions(src: string): ImageDimensions | null {
  if (!src.startsWith('/')) return null;
  const hit = cache.get(src);
  if (hit !== undefined) return hit;
  const head = readHead(join(process.cwd(), 'public', src), 64 * 1024);
  const dims = head ? parse(head) : null;
  cache.set(src, dims);
  return dims;
}
