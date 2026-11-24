// npm run gen:diagrams — the case 1 diagrams with their text as vector outlines.
//   src/assets/showcases/case1/diagrams/*.source.svg  editable originals
//   public/assets/showcases/case1/*.svg               what the site serves
// An SVG in <img> can't reach the page's @font-face rules, so resvg lays the text
// out with the real fonts and writes it back as paths. Static weights only:
// resvg 2.6 can't pick a weight out of a variable font.
import { Resvg } from '@resvg/resvg-js';
import { decompress } from 'wawoff2';
import { readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fontDir = (pkg) => resolve(root, `node_modules/@fontsource/${pkg}/files`);

// One at a time: wawoff2 shares a single buffer, so parallel calls return the
// same font for every file.
const fontFiles = [];
for (const [pkg, name] of [
  ['inter', 'inter-latin-400-normal'],
  ['inter', 'inter-latin-500-normal'],
  ['inter', 'inter-latin-600-normal'],
  ['lora', 'lora-latin-600-normal'],
  ['dejavu-mono', 'dejavu-mono-latin-700-normal'],
]) {
  const ttf = await decompress(readFileSync(join(fontDir(pkg), `${name}.woff2`)));
  const out = join(tmpdir(), `vl-diagram-${name}.ttf`);
  writeFileSync(out, ttf);
  fontFiles.push(out);
}

const font = { fontFiles, loadSystemFonts: false, defaultFontFamily: 'Inter' };

for (const name of ['hero', 'synthesis']) {
  const source = readFileSync(
    resolve(root, `src/assets/showcases/case1/diagrams/${name}.source.svg`),
    'utf8',
  );
  // Two decimals are far below a pixel at these sizes and save about a quarter.
  const outlined = new Resvg(source, { font })
    .toString()
    .replace(/ d="[^"]+"/g, (d) => d.replace(/-?\d+\.\d{3,}/g, (n) => String(+(+n).toFixed(2))));
  if (/<text[\s>]/.test(outlined)) throw new Error(`${name}: text was not outlined`);
  const out = resolve(root, `public/assets/showcases/case1/${name}.svg`);
  writeFileSync(out, `${outlined.trim()}\n`);
  console.log(`✓ public/assets/showcases/case1/${name}.svg (${(outlined.length / 1024).toFixed(1)} KB)`);
}
