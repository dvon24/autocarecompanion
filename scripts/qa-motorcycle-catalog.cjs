/* Read-only synthetic route tests. No env files, live API or database access.
 * Real catalog templates + real scoped loaders, with fixture DB and leaf UI.
 * Interactive consumer islands are exercised by qa-motorcycle-actions.cjs. */
/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const esbuild = require('esbuild');
const { renderToStaticMarkup } = require('react-dom/server');
const date = new Date('2026-09-08T00:00:00Z');
const fixture = (model, vehicleType, status = 'published') => ({
  id: `${vehicleType}-${model.toLowerCase().replaceAll(' ', '-')}`, make: 'Honda', model,
  years: [2020], vehicleType, status, category: 'electrical', severity: 'medium',
  title: `${model} synthetic charging issue`, description: 'Synthetic catalog boundary fixture, not repair advice.',
  solution: 'Have the confirmed charging fault inspected by a qualified technician.',
  trims: [], engines: [], symptoms: ['Slow cranking'], affectedSystems: ['Battery'],
  dtcCodes: ['P0562'], relatedIssueIds: [], citations: [], communityRecommendations: [],
  fixParts: [], reportCount: 5, confidence: 'high', source: 'ai-researched',
  createdAt: date, updatedAt: date, reviewedOn: '2026-09-08', humanApproved: false,
});
let rows = [fixture('Accord', 'car'), fixture('Gold Wing', 'motorcycle'), fixture('Rebel', 'motorcycle'), fixture('Pending Bike', 'motorcycle', 'pending_review')];
const queries = [];
let codeReads = 0;
function matches(row, where = {}) {
  return Object.entries(where).every(([key, value]) => {
    if (key === 'AND') return value.every(clause => matches(row, clause));
    if (key === 'OR') return value.some(clause => matches(row, clause));
    if (key === 'NOT') return !matches(row, value);
    if (value && typeof value === 'object') {
      if ('equals' in value) return value.mode === 'insensitive' ? String(row[key]).toLowerCase() === String(value.equals).toLowerCase() : row[key] === value.equals;
      if ('hasSome' in value) return value.hasSome.some(item => (row[key] || []).includes(item));
      if ('in' in value) return value.mode === 'insensitive' ? value.in.includes(String(row[key]).toLowerCase()) : value.in.includes(row[key]);
      throw Error(`Unhandled fixture predicate: ${key}`);
    }
    return row[key] === value;
  });
}
function query(args) {
  assert.equal(args.where?.status, 'published', 'every catalog read must be published-only');
  assert(['car', 'motorcycle'].includes(args.where?.vehicleType), 'every catalog read must select a vehicle type');
  queries.push(args.where);
  let result = rows.filter(row => matches(row, args.where));
  if (args.distinct) {
    const keys = Array.isArray(args.distinct) ? args.distinct : [args.distinct];
    const seen = new Set(); result = result.filter(row => { const key = JSON.stringify(keys.map(k => row[k])); if (seen.has(key)) return false; seen.add(key); return true; });
  }
  return args.take ? result.slice(0, args.take) : result;
}
global.__catalogDb = { knownIssue: {
  findMany: async args => query(args), count: async args => query(args).length,
  aggregate: async args => { const result = query(args); return { _min: { createdAt: result.length ? new Date(Math.min(...result.map(row => row.createdAt.getTime()))) : null }, _max: { updatedAt: result.length ? new Date(Math.max(...result.map(row => row.updatedAt.getTime()))) : null } }; },
}, dTCCode: { findMany: async () => { codeReads++; return []; } }, $queryRaw: async strings => {
  assert(strings.join('').includes(`"vehicleType" = 'car'`), 'legacy sitemap SQL remains car-scoped'); return [];
} };
global.__catalogCodeRead = () => { codeReads++; return ['p0562']; };
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'output/motorcycle-catalog-release');

async function loadRoutes() {
  const leaves = new Map();
  for (const kind of ['Article', 'Index', 'Make', 'Category']) {
    const source = fs.readFileSync(path.join(root, `src/components/known-issues/catalog/${kind}Route.tsx`), 'utf8');
    for (const match of source.matchAll(/import\s+([^;]+?)\s+from\s+['"](@\/components\/[^'"]+)['"];?/g)) {
      const clause = match[1];
      const names = clause.includes('{') ? clause.slice(clause.indexOf('{') + 1, clause.indexOf('}')).split(',').map(x => x.trim()).filter(Boolean) : ['default'];
      leaves.set(match[2], [...new Set([...(leaves.get(match[2]) || []), ...names])]);
    }
  }
  const stubComponent = `function leaf(name,p){
    if(name==='KnownIssueAlertSignup')return <section data-alert-context={p.context} data-car-carousel={String(p.showCarousel)}>Free issue alerts</section>;
    if(name==='ArticleIssuesList')return <section data-base-path={p.basePath} data-code-links={JSON.stringify(p.linkableDtcCodes)}>{p.issues.map(i=><article key={i.id}><h3>{i.title}</h3><p>{i.description}</p><h4>How to Fix</h4><p>{i.solution}</p>{(p.relatedByIssueId?.[i.id]||[]).map(r=><a key={r.issueId} href={p.basePath+'/'+r.slug+'#'+r.issueId}>{r.model}</a>)}</article>)}</section>;
    return <span data-leaf={name}>{p.children}</span>;
  }`;
  // Exercise actual structured data, not a stub that drops every description.
  leaves.delete('@/components/seo/JsonLd');
  const bundled = await esbuild.build({ stdin: { resolveDir: root, contents: `
    export * from './src/components/known-issues/catalog/ArticleRoute';
    export * from './src/components/known-issues/catalog/IndexRoute';
    export * from './src/components/known-issues/catalog/MakeRoute';
    export * from './src/components/known-issues/catalog/CategoryRoute';
    export * from './src/lib/known-issues-catalog';
    export {catalogCategory} from './src/lib/issue-categories';
    export {getCategoryDates} from './src/lib/known-issues';
    export {default as sitemap} from './src/app/sitemap';
    export {generateMetadata as bikeIndexMetadata} from './src/app/motorcycle-issues/page';
  ` }, platform: 'node', format: 'cjs', bundle: true, packages: 'external', write: false, jsx: 'automatic', plugins: [{ name: 'isolated-boundaries', setup(build) {
    const mocks = {
      '@/lib/db': 'export default global.__catalogDb;',
      'next/cache': 'export const unstable_cache=(fn)=>fn;',
      'next/navigation': 'export function notFound(){throw Error("FIXTURE_NOT_FOUND")}',
      'next/headers': 'export async function headers(){return new Headers({"x-vercel-ip-country":"US"})}',
      'next/link': 'export default function Link({prefetch,replace,scroll,...p}){return <a {...p}/>}',
      'next/image': 'export default function Image({fill,priority,unoptimized,...p}){return <img {...p}/>}',
      '@/lib/recalls': 'export async function getRecallsForArticle(){return []}',
      '@/lib/dtc-codes': 'export async function getLinkableDtcCodes(){return global.__catalogCodeRead()}export async function getAllDTCSlugsWithDates(){return []}export async function getAllDTCMakeSlugs(){return []}',
      '@/lib/symptoms': 'export function getAllSymptomSlugs(){return []}',
      '@/lib/specs': 'export function getAllSpecSlugsWithDates(){return []}',
    };
    build.onResolve({ filter: /.*/ }, args => args.path in mocks || leaves.has(args.path) ? { path: args.path, namespace: 'fixture' } : undefined);
    build.onLoad({ filter: /.*/, namespace: 'fixture' }, args => ({ loader: 'jsx', resolveDir: root, contents: mocks[args.path] || stubComponent + '\n' + leaves.get(args.path).map(name => name === 'default' ? 'export default function C(p){return leaf("FutureModelYearNotice",p)}' : `export function ${name}(p){return leaf("${name}",p)}`).join('\n') }));
  } }] });
  const mod = new Module(path.join(root, 'catalog-fixture.cjs'), module);
  mod.filename = path.join(root, 'catalog-fixture.cjs'); mod.paths = module.paths;
  mod._compile(bundled.outputFiles[0].text, mod.filename); return mod.exports;
}
async function main() {
  process.env.NODE_ENV = 'production';
  delete process.env.AU7O_ISOLATED_SIGNUP_PREVIEW;
  const r = await loadRoutes(), car = r.CAR_CATALOG, bike = r.MOTORCYCLE_CATALOG;
  const prop = (key, value, query = {}) => ({ params: Promise.resolve({ [key]: value }), searchParams: Promise.resolve(query) });
  const render = async element => renderToStaticMarkup(await element);
  const html = {};
  for (const [name, catalog, model] of [['bike', bike, 'honda-gold-wing'], ['car', car, 'honda-accord']]) {
    const before = codeReads;
    html[name + '-index'] = await render(r.IndexPage(catalog));
    html[name + '-make'] = await render(r.MakePage(catalog, prop('make', 'honda')));
    html[name + '-category'] = await render(r.CategoryPage(catalog, prop('category', 'electrical')));
    html[name + '-article'] = await render(r.ArticlePage(catalog, prop('slug', model, { year: '2020' })));
    for (const [key, content] of Object.entries(html).filter(([key]) => key.startsWith(name))) {
      assert(!content.includes('Pending Bike'), key + ' excludes unpublished rows');
      assert(!new RegExp(name === 'bike' ? '\\bAccord\\b' : '\\bGold Wing\\b').test(content), key + ' excludes opposite models');
      assert(content.includes(`${catalog.basePath}/${key.endsWith('index') ? 'make/honda' : model}`) || key.endsWith('article'), key + ' catalog-local discovery links');
      if (name === 'bike') for (const forbidden of ['data-pilot', 'data-member-return', 'data-leaf="AlertSignupPopup"', 'data-leaf="MobileBottomBar"', 'data-alert-context', '/symptom-chat', 'Diagnose my bike', '/vehicle/', '/demo/hub', '/known-issues/dtc/']) assert(!content.includes(forbidden), key + ' must not contain ' + forbidden);
    }
    if (name === 'bike') assert.equal(codeReads, before, 'motorcycle catalog never loads automotive DTC pages');
    const meta = await r.articleMetadata(catalog, prop('slug', model, { year: '2020' }));
    assert.equal(meta.alternates.canonical, `https://au7o.io${catalog.basePath}/${model}?year=2020`);
    const statics = await r.articleStaticParams(catalog);
    assert(statics.some(row => row.slug === model));
    assert(!statics.some(row => row.slug === (name === 'bike' ? 'honda-accord' : 'honda-gold-wing')));
  }
  assert(html['bike-article'].includes('/motorcycle-issues/honda-rebel#'), 'related issue deep links stay in motorcycle catalog');
  for (const name of ['KnownIssueAlertSignup', 'AlertSignupPopup', 'MobileBottomBar']) {
    assert(html['car-article'].includes(name === 'KnownIssueAlertSignup' ? 'data-alert-context' : `data-leaf="${name}"`), 'car ' + name + ' remains');
  }
  for (const [catalog, slug] of [[car, 'honda-gold-wing'], [bike, 'honda-accord'], [bike, 'honda-pending-bike']]) await assert.rejects(r.ArticlePage(catalog, prop('slug', slug)), /FIXTURE_NOT_FOUND/);
  await assert.rejects(r.MakePage(bike, prop('make', 'cadillac')), /FIXTURE_NOT_FOUND/);
  await assert.rejects(r.CategoryPage(bike, prop('category', 'invalid')), /FIXTURE_NOT_FOUND/);
  const savedRows = rows; rows = rows.filter(row => row.vehicleType === 'car');
  assert.equal((await r.articleStaticParams(bike)).length, 0);
  assert.equal((await r.categoryStaticParams(bike)).length, 0);
  const empty = await render(r.IndexPage(bike)); assert(!empty.includes('Gold Wing'));
  assert(empty.includes('No motorcycle issues are published yet.'));
  assert(!empty.includes('NHTSA-Verified') && !empty.includes('0+ documented'));
  assert.equal(process.env.NODE_ENV, 'production');
  assert.equal((await r.bikeIndexMetadata()).robots.index, false);
  assert.equal((await r.categoryMetadata(bike, prop('category', 'electrical'))).robots.index, false);
  html['empty-index'] = empty;
  html['empty-category'] = await render(r.CategoryPage(bike, prop('category', 'electrical')));
  assert(html['empty-category'].includes('No motorcycle issues are published yet.'));
  assert(!(await r.sitemap()).some(page => page.url.includes('/motorcycle-issues')));
  rows = savedRows;
  rows.push({...fixture('Alias Bike','motorcycle'), category:'fuel-system'}, {...fixture('Unsupported Bike','motorcycle'), category:'unsupported-alias'}, {...fixture('Uppercase Bike','motorcycle'), category:'ELECTRICAL'});
  for (const category of ['constructor', '__proto__', 'toString', 'unsupported-alias']) {
    assert.equal(r.catalogCategory(category), null, category + ' is never a category');
    rows.push({...fixture('Unknown ' + category, 'motorcycle'), category});
  }
  const aliasDate = new Date('2026-09-10T00:00:00Z');
  rows.find(row => row.category === 'fuel-system').updatedAt = aliasDate;
  const fuelDates = await r.getCategoryDates('fuel', 'motorcycle');
  assert.equal(fuelDates.published, '2026-09-08', 'alias-only category uses actual publication date');
  assert.equal(fuelDates.modified, '2026-09-10', 'alias-only category uses actual update date');
  const carDatesQueryStart = queries.length;
  await r.getCategoryDates('electrical', 'car');
  assert.equal(queries[carDatesQueryStart].category, 'electrical', 'car date predicate remains exact');
  const categoryParams = await r.categoryStaticParams(bike);
  assert(categoryParams.some(p => p.category === 'fuel'));
  assert(!categoryParams.some(p => ['fuel-system','unsupported-alias','ELECTRICAL'].includes(p.category)));
  const aliasHtml = await render(r.CategoryPage(bike, prop('category','fuel')));
  assert(aliasHtml.includes('Alias Bike'), 'canonical category page includes supported stored alias');
  assert(aliasHtml.includes('"datePublished":"2026-09-08"') && aliasHtml.includes('"dateModified":"2026-09-10"'), 'actual category structured dates include aliases');
  html['alias-category'] = aliasHtml;
  const normalizedMake = await render(r.MakePage(bike, prop('make', 'honda')));
  assert(normalizedMake.includes('/motorcycle-issues/category/fuel'));
  assert(!/\/category\/(?:constructor|__proto__|function|%5Bobject)/.test(normalizedMake));
  const sitemap = await r.sitemap();
  const bikeUrls = sitemap.map(page => page.url).filter(url => url.includes('/motorcycle-issues'));
  assert(bikeUrls.includes('https://au7o.io/motorcycle-issues/category/fuel'));
  assert(bikeUrls.includes('https://au7o.io/motorcycle-issues/category/electrical'));
  assert(!bikeUrls.filter(url => url.includes('/category/')).some(url => /fuel-system|unsupported-alias|ELECTRICAL/.test(url)));
  assert(!bikeUrls.some(url => /pending-bike|honda-accord/.test(url)));
  assert(!sitemap.some(page => page.url.includes('/known-issues/honda-gold-wing')));
  assert(!bikeUrls.filter(url => url.includes('/category/')).some(url => /constructor|__proto__|function|\[object/.test(url)));
  assert.equal(sitemap.find(page => page.url.endsWith('/motorcycle-issues/category/fuel')).lastModified.toISOString(), aliasDate.toISOString());
  const originalEnv = {NODE_ENV:process.env.NODE_ENV, AU7O_ISOLATED_SIGNUP_PREVIEW:process.env.AU7O_ISOLATED_SIGNUP_PREVIEW};
  try {
    Object.assign(process.env,{NODE_ENV:'development',AU7O_ISOLATED_SIGNUP_PREVIEW:'true'});
    for (const [name, element] of [
      ['index',r.IndexPage(bike)], ['make',r.MakePage(bike,prop('make','honda'))],
      ['category',r.CategoryPage(bike,prop('category','electrical'))], ['article',r.ArticlePage(bike,prop('slug','honda-gold-wing'))],
    ]) {
      const content = await render(element);
      assert(content.toLowerCase().includes('synthetic'), name + ' labels preview');
      for(const bad of ['NHTSA-Verified','compiled from NHTSA','According to Au7o','owner-reported problems']) assert(!content.includes(bad), name+' no unsupported claim: '+bad);
      const json = [...content.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
      assert(json.some(item => String(item.description).includes('synthetic')), name+' actual structured description labels preview');
      html['preview-'+name] = content;
    }
    for(const meta of [await r.bikeIndexMetadata(),await r.makeMetadata(bike,prop('make','honda')),await r.categoryMetadata(bike,prop('category','electrical')),await r.articleMetadata(bike,prop('slug','honda-gold-wing'))]) {
      assert(meta.description.includes('synthetic')); assert(!JSON.stringify(meta).includes('compiled from NHTSA'));
      assert.equal(meta.robots.index, false, 'every preview route is noindex');
      assert.equal(typeof meta.title.absolute, 'string', 'preview title avoids duplicate inherited suffix');
    }
    assert(!(await r.sitemap()).some(page => page.url.includes('/motorcycle-issues')), 'synthetic pages stay out of sitemap');
  } finally { for(const [key,value] of Object.entries(originalEnv)) if(value === undefined) delete process.env[key]; else process.env[key]=value; }
  fs.mkdirSync(output, { recursive: true });
  for (const [name, content] of Object.entries(html)) fs.writeFileSync(path.join(output, name + '.html'), content);
  if (process.argv.includes('--browser')) {
    const { chromium } = require(process.env.AU7O_PLAYWRIGHT_PATH || 'playwright');
    const postcss = require('postcss'), tailwind = require('@tailwindcss/postcss');
    const css = (await postcss([tailwind({ base: root })]).process(fs.readFileSync(path.join(root, 'src/app/globals.css'), 'utf8'), { from: path.join(root, 'src/app/globals.css') })).css;
    const browser = await chromium.launch({ channel: 'msedge', headless: true });
    try { for (const width of [390, 1280]) for (const [name, content] of Object.entries(html)) {
      const page = await browser.newPage({ viewport: { width, height: 844 } });
      const missing = []; const errors = []; page.on('pageerror', error => errors.push(error.message));
      await page.route('**/*', async route => {
        const url = new URL(route.request().url());
        if (url.origin !== 'https://catalog.invalid') { missing.push(url.href); return route.abort(); }
        if (url.pathname === '/') return route.fulfill({ contentType: 'text/html; charset=utf-8', body: '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>' + css + '</style></head><body>' + content + '</body></html>' });
        const file = path.resolve(root, 'public', '.' + decodeURIComponent(url.pathname));
        if (!file.startsWith(path.join(root, 'public') + path.sep) || !fs.existsSync(file)) { missing.push(url.pathname); return route.abort(); }
        return route.fulfill({ path: file });
      });
      await page.goto('https://catalog.invalid/');
      assert.deepEqual(missing, [], name + ' assets'); assert.deepEqual(errors, [], name + ' runtime');
      assert(!await page.locator('body').innerText().then(text => /Ã|Â|â€/.test(text)), name + ' UTF-8 text');
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), name + ' no horizontal overflow at ' + width);
      await page.screenshot({ path: path.join(output, `${name}-${width}.png`), fullPage: true });
      await page.close();
    } } finally { await browser.close(); }
  }
  console.log(JSON.stringify({ routeScreens: Object.keys(html).length, scopedReads: queries.length, realWrites: 0, realNetwork: 0, leafIslands: 'stubbed; qa-motorcycle-actions.cjs tests actual consumers', browserWidths: process.argv.includes('--browser') ? [390, 1280] : [] }));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
