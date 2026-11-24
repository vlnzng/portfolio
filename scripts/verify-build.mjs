// npm run verify — after check and build, asserts what neither of them catches:
// internal links and assets in dist/ resolve, the engine boundary string matches
// media.ts everywhere, and a few budgets hold. No dependencies; exits 1 on failure.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const SITE = 'https://valentinlenzing.com';
const JS_BUDGET_KB = 25;

if (!existsSync(dist)) {
  console.error('dist/ not found: run the build first.');
  process.exit(1);
}

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]
  );
const read = (file) => readFileSync(file, 'utf8');
const rel = (file) => relative(root, file).replaceAll('\\', '/');
const code = (text) =>
  text
    .replace(/\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->/g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
    .replace(/\s+/g, ' ');
const results = [];
const check = (name, problems, summary) => results.push({ name, problems, summary });

const distFiles = walk(dist);
const pages = distFiles.filter((f) => f.endsWith('.html'));

// 1. Every root-relative or own-domain reference resolves: attributes, srcset
//    candidates, the case data JSON (hero images, CTA PDFs, also inside the
//    <template>s) and sitemap entries. /_vercel/ only exists on the host.
const REF = /(?:href|src|content)="([^"]+)"|srcset="([^"]+)"|"(?:heroImage|url)":"([^"]+)"|<loc>([^<]+)<\/loc>/g;
const exists = (path) => {
  const file = join(dist, path);
  return existsSync(file) && (statSync(file).isFile() || existsSync(join(file, 'index.html')));
};
const broken = [];
let refs = 0;
for (const file of distFiles.filter((f) => /\.(html|xml)$/.test(f))) {
  for (const m of read(file).matchAll(REF)) {
    const found = m[2] ? m[2].split(',').map((c) => c.trim().split(/\s+/)[0]) : [m[1] ?? m[3] ?? m[4]];
    for (let ref of found) {
      if (ref.startsWith(SITE)) ref = ref.slice(SITE.length) || '/';
      if (!ref.startsWith('/') || ref.startsWith('//') || ref.startsWith('/_vercel/')) continue;
      refs++;
      if (!exists(decodeURI(ref.split(/[?#]/)[0]))) broken.push(`${rel(file)} → ${ref}`);
    }
  }
}
check('links', broken, `${refs} internal references in ${pages.length} pages and the sitemap resolve`);

// 2. The engine boundary is one string (CLAUDE.md). Every @media rule shaped like
//    it repeats media.ts verbatim, every `sizes` that switches on it lists all
//    arms, no other script asks for it, and nobody uses an integer complement.
const boundary = read(join(root, 'src/scripts/media.ts')).match(/mobileQuery = window\.matchMedia\(\s*'([^']+)'/)?.[1];
const arms = boundary?.split(/,\s*/) ?? [];
const complements = [...(boundary ?? '').matchAll(/max-(width|height): (\d+)px/g)].map(([, d, px]) => `min-${d}: ${+px + 1}px`);
const drift = boundary ? [] : ['src/scripts/media.ts: mobileQuery string not found'];
let queries = 0;
let sizes = 0;
for (const file of walk(join(root, 'src')).filter((f) => /\.(astro|css|ts)$/.test(f))) {
  const text = code(read(file));
  for (const [, prelude] of text.matchAll(/@media([^{]+)\{/g)) {
    if (!prelude.includes(arms[0]) && !/\(max-width: \d+px\), \(max-height: \d+px\)/.test(prelude)) continue;
    queries++;
    if (!prelude.includes(boundary)) drift.push(`${rel(file)}: @media${prelude}`);
  }
  for (const [, value] of text.matchAll(/sizes="([^"]+)"/g)) {
    if (!value.includes('(max-height:') && !value.includes(arms[0])) continue;
    sizes++;
    if (!arms.every((arm) => value.includes(arm))) drift.push(`${rel(file)}: sizes="${value}" misses an arm`);
  }
  if (!file.endsWith('media.ts') && /matchMedia\(\s*['"`][^'"`]*max-width/.test(text)) {
    drift.push(`${rel(file)}: own width query, import desktopQuery from media.ts instead`);
  }
  for (const c of complements) if (text.includes(c)) drift.push(`${rel(file)}: uses the complement ${c}`);
}
// The shipped CSS keeps that syntax: a minifier that rewrites queries as ranges
// (width<=820px) asks something Safari before 16.4 can't read, so the layout and
// media.ts would disagree there.
let shipped = 0;
for (const file of distFiles.filter((f) => /\.(css|html)$/.test(f))) {
  const css = file.endsWith('.css') ? read(file) : [...read(file).matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('');
  for (const [, prelude] of css.matchAll(/@media([^{]+)\{/g)) {
    shipped++;
    if (/[<>]/.test(prelude)) drift.push(`${rel(file)}: @media${prelude} uses range syntax`);
  }
}
check('boundary', drift, `${queries} @media rules and ${sizes} sizes attributes repeat media.ts; no complements; no range syntax in ${shipped} shipped queries`);

// 3. Budgets: WebP-only images; the JS a phone loads eagerly on / (module scripts
//    and their static imports, the desktop engine is a dynamic import); case
//    diagrams with outlined text, since an SVG in <img> can't load the web fonts.
check('images', distFiles.filter((f) => f.endsWith('.avif')).map(rel), 'no AVIF in dist');

const eager = new Set();
const queue = [...read(join(dist, 'index.html')).matchAll(/<script type="module" src="\/_astro\/([^"]+)"/g)].map((m) => m[1]);
while (queue.length) {
  const name = queue.pop();
  if (eager.has(name)) continue;
  eager.add(name);
  for (const [, dep] of read(join(dist, '_astro', name)).matchAll(/(?:from|import)\s*["']\.\/([^"']+\.js)["']/g)) queue.push(dep);
}
const kb = [...eager].reduce((sum, name) => sum + statSync(join(dist, '_astro', name)).size, 0) / 1024;
check('js budget', kb > JS_BUDGET_KB ? [`${kb.toFixed(1)} KB: ${[...eager].join(', ')}`] : [], `${kb.toFixed(1)} KB of bundled JS loads eagerly on / (limit ${JS_BUDGET_KB} KB)`);

const svgs = distFiles.filter((f) => f.endsWith('.svg'));
check('svg text', svgs.filter((f) => /<text[\s>]/.test(read(f))).map(rel), `${svgs.length} SVGs, none with live <text>`);

// 4. Document shape: every page ends with </body></html> (a <script> placed after
//    the layout component would land behind </html>), and a <button> holds
//    phrasing content only, or cards and headings inside it lose their semantics.
const trailing = pages.filter((file) => !/<\/body>\s*<\/html>\s*$/.test(read(file))).map(rel);
check('document', trailing, `all ${pages.length} pages end with </body></html>`);

const wrapped = pages.flatMap((file) =>
  [...read(file).matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/g)]
    .filter(([, inner]) => /<(div|p|h[1-6]|ul|ol|li|section|article|figure|header|footer|nav)\b/.test(inner))
    .map(([outer]) => `${rel(file)}: ${outer.slice(0, 80)}…`)
);
check('markup', wrapped, `no <button> wraps block content in ${pages.length} pages`);

let failed = 0;
for (const { name, problems, summary } of results) {
  if (!problems.length) {
    console.log(`✓ ${name}: ${summary}`);
    continue;
  }
  failed++;
  console.log(`✗ ${name}: ${problems.length} problem(s)`);
  for (const problem of problems.slice(0, 20)) console.log(`    ${problem}`);
}
console.log(failed ? `\n${failed} of ${results.length} checks failed` : `\nAll ${results.length} checks passed.`);
process.exit(failed ? 1 : 0);
