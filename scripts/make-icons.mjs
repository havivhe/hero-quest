// Generates original PNG app icons (no external dependencies).
// Draws: dark rounded background, red ring, gold star. Run: npm run icons
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const crcTable = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};

// Star polygon in unit coords (0..1), from favicon.svg (/64)
const star = [
  [32, 12], [37.3, 25.5], [51.5, 26], [40.5, 35], [44.3, 49],
  [32, 41], [19.7, 49], [23.5, 35], [12.5, 26], [26.7, 25.5],
].map(([x, y]) => [x / 64, y / 64]);

function inPoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function sample(u, v, rounded) {
  // rounded-rect mask
  if (rounded) {
    const r = 14 / 64;
    const cx = Math.min(Math.max(u, r), 1 - r);
    const cy = Math.min(Math.max(v, r), 1 - r);
    if ((u - cx) ** 2 + (v - cy) ** 2 > r * r) return [0, 0, 0, 0];
  }
  if (inPoly(u, v, star)) {
    const t = (v - 12 / 64) / (37 / 64);
    return [255, Math.round(224 - 65 * t), Math.round(102 - 74 * t), 255];
  }
  const d = Math.hypot(u - 0.5, v - 0.5);
  if (Math.abs(d - 24 / 64) < 2 / 64) return [230, 57, 70, 255];
  // radial background
  const g = Math.min(1, Math.hypot(u - 0.5, v - 0.4) / 0.7);
  return [Math.round(42 + (11 - 42) * g), Math.round(31 + (13 - 31) * g), Math.round(107 + (31 - 107) * g), 255];
}

function makePng(size, rounded) {
  const SS = 4;
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const acc = [0, 0, 0, 0];
      for (let sy = 0; sy < SS; sy++)
        for (let sx = 0; sx < SS; sx++) {
          const p = sample((x + (sx + 0.5) / SS) / size, (y + (sy + 0.5) / SS) / size, rounded);
          for (let i = 0; i < 4; i++) acc[i] += p[i];
        }
      const o = y * (size * 4 + 1) + 1 + x * 4;
      for (let i = 0; i < 4; i++) raw[o + i] = Math.round(acc[i] / (SS * SS));
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// Full-bleed (square) icons so "maskable" works; OS applies its own rounding.
writeFileSync('public/icon-192.png', makePng(192, false));
writeFileSync('public/icon-512.png', makePng(512, false));
writeFileSync('public/apple-touch-icon.png', makePng(180, false));
console.log('Icons written to public/');
