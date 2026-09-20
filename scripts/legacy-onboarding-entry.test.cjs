/* Actual server-page fixtures; no database, provider, network, or customer writes. */
/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const { test, before, after } = require('node:test');
const esbuild = require('esbuild');

let pages;
const fixtureKey = '__legacyEntryFixture';
function reset(session = null, options = {}) {
  const fixture = {
    session, authCalls: 0, privateCalls: [], publicCalls: [],
    ...options,
  };
  const forbidden = model => new Proxy({}, {
    get: (_, method) => (...args) => {
      fixture.privateCalls.push({ model, method, args });
      throw new Error(`Forbidden private access: ${model}.${String(method)}`);
    },
  });
  const knownIssue = {
    count: async query => {
      fixture.publicCalls.push({ method: 'count', query });
      if (fixture.statsError) throw new Error('Synthetic stats outage');
      return 8123;
    },
    findMany: async query => {
      fixture.publicCalls.push({ method: 'findMany', query });
      return query.distinct.length === 1 ? [{ make: 'A' }, { make: 'B' }] : [{ make: 'A', model: 'One' }];
    },
  };
  fixture.db = new Proxy({}, { get: (_, model) => model === 'knownIssue' ? knownIssue : forbidden(model) });
  globalThis[fixtureKey] = fixture;
  return fixture;
}

before(async () => {
  const mocks = {
    '@/lib/auth': `export async function auth(){const f=globalThis.${fixtureKey};f.authCalls++;if(f.authError)throw new Error('Synthetic auth outage');return f.session}`,
    '@/lib/db': `export default new Proxy({}, {get:(_,key)=>globalThis.${fixtureKey}.db[key]})`,
    'next/navigation': 'export function redirect(href){throw Object.assign(new Error("redirect"),{href,digest:`NEXT_REDIRECT;replace;${href};307;`})}',
    react: 'export const cache=fn=>fn;',
    'react/jsx-runtime': 'export const jsx=(type,props)=>({type,props});export const jsxs=jsx;',
    '@/components/landing/LandingPage': 'export default function LandingPage(){}',
  };
  const sources = {
    './src/app/onboarding/page': 'src/app/onboarding/page.tsx',
    './src/app/page': 'src/app/page.tsx',
    '@/lib/auth-callback': 'src/lib/auth-callback.ts',
  };
  const bundle = await esbuild.build({
    stdin: { resolveDir: process.cwd(), loader: 'tsx', contents: `
      export { default as onboarding } from './src/app/onboarding/page';
      export { default as home, generateMetadata } from './src/app/page';
    ` },
    bundle: true, write: false, platform: 'node', format: 'cjs', jsx: 'automatic', tsconfigRaw: {},
    plugins: [{ name: 'isolated-entry-dependencies', setup(build) {
      build.onResolve({ filter: /.*/ }, args => {
        if (Object.hasOwn(mocks, args.path)) return { path: args.path, namespace: 'fixture' };
        // Permit only the actual page modules and their pure callback helper.
        // A new dependency must be explicitly reviewed before this test can run.
        if (Object.hasOwn(sources, args.path)) return { path: args.path, namespace: 'source' };
        throw new Error(`Unexpected page dependency: ${args.path}`);
      });
      build.onLoad({ filter: /.*/, namespace: 'fixture' }, args => ({ loader: 'js', contents: mocks[args.path] }));
      build.onLoad({ filter: /.*/, namespace: 'source' }, args => ({ loader: 'tsx', contents: fs.readFileSync(sources[args.path], 'utf8') }));
    } }],
  });
  const filename = path.resolve('scripts/.legacy-entry-fixture.cjs');
  const compiled = new Module(filename, module);
  compiled.filename = filename;
  compiled.paths = Module._nodeModulePaths(process.cwd());
  compiled._compile(bundle.outputFiles[0].text, filename);
  pages = compiled.exports;
});

after(() => { delete globalThis[fixtureKey]; });

const queries = [
  {}, { step: '1' }, { step: '2' }, { step: '3' },
  { step: 'invalid', callbackUrl: 'https://evil.invalid', returnTo: '//evil.invalid' },
  { step: ['1', '3'], callbackUrl: '/subscribe?product=hub', redirect: '/vehicle/slug' },
];
const sessions = [
  { name: 'incomplete unpaid', user: { id: 'synthetic', onboardingCompletedAt: null, subscriptionTier: null } },
  { name: 'completed Visual', user: { id: 'synthetic', onboardingCompletedAt: '2026-09-01', subscriptionTier: 'visual' } },
  { name: 'completed Hub', user: { id: 'synthetic', onboardingCompletedAt: '2026-09-01', subscriptionTier: 'hub' } },
  { name: 'unverified', user: { id: 'synthetic', emailVerified: null } },
  { name: 'minimal session', user: { id: 'synthetic' } },
];
const expectRedirect = (run, href) => assert.rejects(run, error => error.href === href && error.digest.startsWith('NEXT_REDIRECT;'));

test('legacy entry sends anonymous, incomplete-session and failed-auth visits to sign-in with fixed Account callback', async () => {
  for (const session of [null, {}, { user: {} }, { user: { id: '' } }]) {
    for (const query of queries) {
      const fixture = reset(session);
      await expectRedirect(() => pages.onboarding({ searchParams: Promise.resolve(query) }), '/auth/signin?callbackUrl=%2Faccount');
      assert.equal(fixture.authCalls, 1);
      assert.deepEqual(fixture.privateCalls, []);
      assert.deepEqual(fixture.publicCalls, []);
    }
  }
  const fixture = reset(null, { authError: true });
  await expectRedirect(() => pages.onboarding(), '/auth/signin?callbackUrl=%2Faccount');
  assert.deepEqual(fixture.privateCalls, []);
  assert.deepEqual(fixture.publicCalls, []);
});

test('legacy entry sends every authenticated session/query directly to Account without data access', async () => {
  for (const session of sessions) {
    for (const query of queries) {
      const fixture = reset(session);
      await expectRedirect(() => pages.onboarding({ searchParams: Promise.resolve(query) }), '/account');
      assert.deepEqual(fixture.privateCalls, [], session.name);
      assert.deepEqual(fixture.publicCalls, [], session.name);
    }
  }
});

test('ordinary signed-in Home delegates to Account regardless of old completion state or supplied destination', async () => {
  for (const session of sessions) {
    for (const query of [...queries, { home: '0' }, { home: ['1', '0'] }]) {
      const fixture = reset(session);
      await expectRedirect(() => pages.home({ searchParams: Promise.resolve(query) }), '/account');
      assert.deepEqual(fixture.privateCalls, [], session.name);
      assert.deepEqual(fixture.publicCalls, [], session.name);
    }
  }
});

function assertLanding(result, fixture, stats = { totalIssues: 8123, totalMakes: 2, totalModels: 1 }) {
  assert.equal(result.type.name, 'LandingPage');
  assert.deepEqual(result.props.stats, stats);
  assert.deepEqual(fixture.privateCalls, []);
  assert.equal(fixture.publicCalls.length, 3);
  for (const { query } of fixture.publicCalls) assert.deepEqual(query.where, { status: 'published', vehicleType: 'car' });
}

test('explicit public Home remains available for anonymous and all signed-in sessions', async () => {
  for (const session of [null, ...sessions]) {
    const fixture = reset(session);
    assertLanding(await pages.home({ searchParams: Promise.resolve({ home: '1', returnTo: 'https://evil.invalid' }) }), fixture);
  }
});

test('anonymous, incomplete-session and failed-auth Home retain the public landing fallback', async () => {
  for (const session of [null, {}, { user: {} }]) {
    const fixture = reset(session);
    assertLanding(await pages.home({ searchParams: Promise.resolve({}) }), fixture);
  }
  for (const home of [undefined, '1']) {
    const fixture = reset(null, { authError: true });
    assertLanding(await pages.home({ searchParams: Promise.resolve({ home }) }), fixture);
  }
});

test('public stats outage preserves existing fallback and marketing metadata', async () => {
  const fixture = reset(null, { statsError: true });
  assertLanding(await pages.home({ searchParams: Promise.resolve({}) }), fixture, { totalIssues: 7000, totalMakes: 34, totalModels: 640 });
  reset();
  const metadata = await pages.generateMetadata();
  assert.equal(metadata.title.absolute, "Au7o: Know Your Car's Weak Spots | 8,123+ Issues");
  assert.equal(metadata.alternates.canonical, 'https://au7o.io');
  assert.deepEqual(globalThis[fixtureKey].privateCalls, []);
});
