// Generates PNG icons from a base SVG using a tiny zero-dep canvas approach.
// We render via the headless `node:canvas`-like API isn't built-in, so we
// instead emit deterministic PNGs by drawing onto an OffscreenCanvas via
// the `pngjs` lib if present, else fall back to writing solid color icons.
//
// To keep the toolchain free of native deps, this script writes
// pre-baked PNG icons by encoding a simple solid-rounded-square + glyph.
//
// Run with: node scripts/generate-icons.mjs

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..', 'public');
mkdirSync(out, { recursive: true });

// Encode a solid-color RGBA rectangle as PNG, then composite a brand glyph
// via pixel writes. Tiny enough for an icon.

function pngEncode(width, height, pixels) {
  // pixels: Uint8Array length width*height*4 (RGBA)
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const t = Buffer.from(type, 'ascii');
    const crc = Buffer.alloc(4);
    crc.writeInt32BE(crc32(Buffer.concat([t, data])), 0);
    return Buffer.concat([len, t, data, crc]);
  }

  function crc32(buf) {
    let c;
    const table = crc32.table || (crc32.table = (() => {
      const t = new Int32Array(256);
      for (let n = 0; n < 256; n++) {
        c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        t[n] = c;
      }
      return t;
    })());
    c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return c ^ 0xffffffff;
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8);  // bit depth
  ihdr.writeUInt8(6, 9);  // color type RGBA
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);

  // Build raw with filter byte 0 per scanline
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    pixels.copy ? pixels.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride)
                : Buffer.from(pixels.slice(y * stride, y * stride + stride)).copy(raw, y * (stride + 1) + 1);
  }
  const idatData = deflateSync(raw);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idatData), chunk('IEND', Buffer.alloc(0))]);
}

function fillRoundedRect(pixels, w, h, color) {
  const radius = Math.round(w * 0.22);
  const [r, g, b, a] = color;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // rounded corner mask
      let inside = true;
      const corners = [
        [radius, radius],
        [w - radius - 1, radius],
        [radius, h - radius - 1],
        [w - radius - 1, h - radius - 1]
      ];
      const inCornerBox =
        (x < radius || x > w - radius - 1) && (y < radius || y > h - radius - 1);
      if (inCornerBox) {
        let nearest = corners[0];
        let best = Infinity;
        for (const c of corners) {
          const d = (x - c[0]) ** 2 + (y - c[1]) ** 2;
          if (d < best) {
            best = d;
            nearest = c;
          }
        }
        if (Math.sqrt(best) > radius) inside = false;
      }
      const i = (y * w + x) * 4;
      if (inside) {
        pixels[i] = r;
        pixels[i + 1] = g;
        pixels[i + 2] = b;
        pixels[i + 3] = a;
      } else {
        pixels[i + 3] = 0;
      }
    }
  }
}

function fillRect(pixels, w, x0, y0, x1, y1, color) {
  const [r, g, b, a] = color;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * w + x) * 4;
      pixels[i] = r;
      pixels[i + 1] = g;
      pixels[i + 2] = b;
      pixels[i + 3] = a;
    }
  }
}

function fillCircle(pixels, w, cx, cy, radius, color) {
  const [r, g, b, a] = color;
  for (let y = cy - radius; y <= cy + radius; y++) {
    for (let x = cx - radius; x <= cx + radius; x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= radius * radius) {
        const i = (y * w + x) * 4;
        pixels[i] = r;
        pixels[i + 1] = g;
        pixels[i + 2] = b;
        pixels[i + 3] = a;
      }
    }
  }
}

function makeIcon(size, { maskable = false } = {}) {
  const pixels = Buffer.alloc(size * size * 4); // transparent
  const bg = [15, 23, 42, 255]; // var(--bg)
  if (maskable) {
    // For maskable, fill the whole canvas (no transparent corners) so safe zone works.
    fillRect(pixels, size, 0, 0, size, size, bg);
  } else {
    fillRoundedRect(pixels, size, size, bg);
  }

  const accent = [124, 156, 255, 255];
  const accent2 = [155, 109, 255, 255];

  const padding = maskable ? Math.round(size * 0.18) : Math.round(size * 0.18);
  const innerW = size - padding * 2;
  const innerH = size - padding * 2;

  // Three horizontal lines (left side)
  const lineH = Math.max(2, Math.round(innerH * 0.06));
  const gap = Math.round(innerH * 0.18);
  const lineX = padding;
  const lineW = Math.round(innerW * 0.55);

  for (let i = 0; i < 3; i++) {
    const y = padding + Math.round(innerH * 0.15) + i * (lineH + gap);
    const w = i === 0 ? lineW : i === 1 ? Math.round(lineW * 1.15) : Math.round(lineW * 0.7);
    fillRect(pixels, size, lineX, y, lineX + Math.min(w, innerW), y + lineH, accent);
  }

  // Three dots (right side) — gradient via two colors
  const dotR = Math.max(3, Math.round(innerH * 0.08));
  const dotX = padding + Math.round(innerW * 0.78);
  for (let i = 0; i < 3; i++) {
    const y = padding + Math.round(innerH * 0.18) + i * (dotR * 2 + Math.round(innerH * 0.1));
    const color = i === 0 ? accent : i === 1 ? [137, 132, 255, 255] : accent2;
    fillCircle(pixels, size, dotX, y, dotR, color);
  }

  return pngEncode(size, size, pixels);
}

writeFileSync(join(out, 'icon-192.png'), makeIcon(192));
writeFileSync(join(out, 'icon-512.png'), makeIcon(512));
writeFileSync(join(out, 'icon-maskable.png'), makeIcon(512, { maskable: true }));

console.log('Wrote icon-192.png, icon-512.png, icon-maskable.png to', out);
