// npm run gen:assets — brand assets built from the committed marks:
//   public/favicon.svg           V/L monogram, theme-aware
//   public/apple-touch-icon.png  180×180 gold monogram on dark
//   public/favicon.ico           16/32/48 fallback
//   public/og-image.jpg          1200×630 share card (wordmark + portrait)
// Sources: src/assets/brand/{logo,wordmark}.svg (their path data is read directly,
// so every asset is the real mark) and src/assets/images/portrait.png.
//
// The share card's text needs real Inter glyphs, but resvg reads TTF/OTF only:
// the Fontsource woff2 files are decompressed first, in static weights, because
// resvg 2.6 can't pick a weight out of a variable font.
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { decompress } from 'wawoff2';
import { readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const r = (p) => resolve(root, p);

// Brand tokens — kept in sync with src/styles/tokens.css by hand.
const BG = '#1A1816';
const TEXT = '#EDE6D9';
const ACCENT = '#D9B36C';
const MUTED = '#9B9590';

// ---- fonts: woff2 → TTF for resvg ----
async function woff2ToTtf(relPath, outName) {
  const ttf = await decompress(readFileSync(r(relPath)));
  const out = join(tmpdir(), outName);
  writeFileSync(out, ttf);
  return out;
}
const interSemi = await woff2ToTtf(
  'node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2',
  'vl-inter-600.ttf',
);
const interMed = await woff2ToTtf(
  'node_modules/@fontsource/inter/files/inter-latin-500-normal.woff2',
  'vl-inter-500.ttf',
);
const FONT = {
  fontFiles: [interSemi, interMed],
  loadSystemFonts: false,
  defaultFontFamily: 'Inter',
};

// ---- brand marks: read the committed Figma vectors ----
// Returns the inner markup (bare <path>s, no fill) plus the viewBox dimensions.
function loadMark(relPath) {
  const svg = readFileSync(r(relPath), 'utf8');
  const [, w, h] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>[\s\S]*$/, '');
  return { inner, w: +w, h: +h };
}
const logo = loadMark('src/assets/brand/logo.svg');
const { w: vbW, h: vbH } = logo;
// the icons are single-colour, so drop the .mark-v hook the site uses for the gold V
const monoPaths = logo.inner.replace(/ class="[^"]+"/g, '');
const wordmark = loadMark('src/assets/brand/wordmark.svg');

// ---- 1. favicon.svg (theme-aware monogram) ----
writeFileSync(
  r('public/favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vbW} ${vbH}">${monoPaths}<style>path{fill:${BG}}@media(prefers-color-scheme:dark){path{fill:${TEXT}}}</style></svg>\n`,
);
console.log('✓ public/favicon.svg');

// Gold monogram centred on a dark tile, at a given size and fill ratio.
const darkTile = (S, fill) => {
  const avail = S * fill;
  const scale = Math.min(avail / vbW, avail / vbH);
  const x = (S - vbW * scale) / 2;
  const y = (S - vbH * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}"><rect width="${S}" height="${S}" fill="${BG}"/><g transform="translate(${x} ${y}) scale(${scale})" fill="${ACCENT}">${monoPaths}</g></svg>`;
};

// ---- 2. apple-touch-icon.png (gold monogram on dark tile) ----
await sharp(Buffer.from(darkTile(180, 0.68))).png().toFile(r('public/apple-touch-icon.png'));
console.log('✓ public/apple-touch-icon.png');

// ---- 2b. favicon.ico (legacy fallback; SVG above is the primary icon) ----
// Minimal PNG-in-ICO container so we don't need an .ico encoder dependency.
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  const entries = Buffer.alloc(16 * images.length);
  let offset = 6 + 16 * images.length;
  images.forEach((img, i) => {
    const e = i * 16;
    entries.writeUInt8(img.size >= 256 ? 0 : img.size, e); // width
    entries.writeUInt8(img.size >= 256 ? 0 : img.size, e + 1); // height
    entries.writeUInt16LE(1, e + 4); // colour planes
    entries.writeUInt16LE(32, e + 6); // bits per pixel
    entries.writeUInt32LE(img.data.length, e + 8);
    entries.writeUInt32LE(offset, e + 12);
    offset += img.data.length;
  });
  return Buffer.concat([header, entries, ...images.map((i) => i.data)]);
}
const icoSizes = [16, 32, 48];
const icoPngs = await Promise.all(
  icoSizes.map(async (size) => ({
    size,
    data: await sharp(Buffer.from(darkTile(size, 0.82))).png().toBuffer(),
  })),
);
writeFileSync(r('public/favicon.ico'), buildIco(icoPngs));
console.log('✓ public/favicon.ico');

// ---- 3. og-image.jpg (hero-style: wordmark lockup left, portrait right) ----
const W = 1200;
const H = 630;

// Portrait: cover-fit into the right column, then fade its left edge into the
// dark field so it blends like the hero (no hard rectangle).
const PW = 500; // portrait column width
const portrait = await sharp(r('src/assets/images/portrait.png'))
  .resize(PW, H, { fit: 'cover', position: 'top' })
  .ensureAlpha()
  .png()
  .toBuffer();
const fade = await sharp(
  Buffer.from(
    `<svg width="${PW}" height="${H}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.45" stop-color="#fff" stop-opacity="1"/></linearGradient></defs><rect width="${PW}" height="${H}" fill="url(#g)"/></svg>`,
  ),
)
  .png()
  .toBuffer();
const portraitFaded = await sharp(portrait)
  .composite([{ input: fade, blend: 'dest-in' }])
  .png()
  .toBuffer();

// Wordmark lockup top-left, two-tone like the site (gold V, cream rest), scaled by
// height so it never crowds the portrait column.
const WM_H = 232; // rendered wordmark height
const WM_X = 96;
const WM_Y = 122; // top edge of the lockup
const wmScale = WM_H / wordmark.h;
const wmPaths = wordmark.inner.replace('class="mark-v"', `class="mark-v" fill="${ACCENT}"`);
const lockup = `<g transform="translate(${WM_X} ${WM_Y}) scale(${wmScale})" fill="${TEXT}">${wmPaths}</g>`;

const textSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  ${lockup}
  <text x="100" y="438" font-family="Inter" font-weight="600" font-size="27" letter-spacing="4" fill="${ACCENT}">PRODUCT DESIGNER · UX/UI</text>
  <text x="100" y="512" font-family="Inter" font-weight="500" font-size="23" letter-spacing="1.5" fill="${MUTED}">valentinlenzing.com</text>
</svg>`;
const textPng = new Resvg(textSvg, { background: 'rgba(0,0,0,0)', font: FONT }).render().asPng();

await sharp({ create: { width: W, height: H, channels: 4, background: BG } })
  .composite([
    { input: portraitFaded, left: W - PW, top: 0 },
    { input: textPng, left: 0, top: 0 },
  ])
  .jpeg({ quality: 88, chromaSubsampling: '4:4:4' })
  .toFile(r('public/og-image.jpg'));
console.log('✓ public/og-image.jpg');
