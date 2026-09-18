const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');
const esbuild = require('esbuild');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const root = path.resolve(__dirname, '..');

async function load(mockHooks = false) {
  const built = await esbuild.build({ stdin: { resolveDir: root, contents: `
    export {ServiceRecords} from './src/components/maintenance/ServiceRecords';
    export {ServiceReview} from './src/components/maintenance/ServiceReview';
    export {GarageServiceRecordsClient} from './src/components/maintenance/GarageServiceRecordsClient';
    export {serviceRecordEntry} from './src/lib/service-record-entry';
    export {REVIEWED_OWNER_EQUIPMENT} from './src/lib/twin-owner-equipment';
  ` }, bundle: true, write: false, jsx: 'automatic', platform: 'node', format: 'cjs', packages: 'external', plugins: [{ name: 'offline', setup(b) {
    b.onResolve({ filter: /^(next\/navigation|next-auth\/react|@\/components\/(auth\/SessionProvider|garage\/GarageAssistant|ui\/PageLayout))$/ }, a => ({ path: a.path, namespace: 'fixture' }));
    if (mockHooks) b.onResolve({ filter: /^react$/ }, a => ({ path: a.path, namespace: 'fixture' }));
    b.onLoad({ filter: /.*/, namespace: 'fixture' }, a => ({ loader: 'js', contents: a.path === 'react' ? `
      export const useState = initial => { const f=globalThis.__serviceHistory, i=f.index++; if(!(i in f.values))f.values[i]=typeof initial==='function'?initial():initial; return [f.values[i], value=>{f.values[i]=typeof value==='function'?value(f.values[i]):value;f.changes.push([i,f.values[i]])}]; };
      export const useCallback=f=>f; export const useMemo=f=>f(); export const useEffect=()=>{}; export const useRef=value=>({current:value});
    ` : a.path === 'next/navigation' ? 'export const useRouter=()=>({replace(){}}); export const useParams=()=>({id:"car"});'
      : a.path === 'next-auth/react' ? 'export const useSession=()=>({status:"authenticated",data:{user:{capabilities:{maintenance:true}}}});'
      : a.path.endsWith('SessionProvider') ? 'export const useSessionMarkerReady=()=>true;'
      : a.path.endsWith('GarageAssistant') ? 'export const GarageAssistant="garage-assistant";'
      : 'export const PageLayout="page-layout";' }));
  } }] });
  const compiled = new Module(path.join(root, 'fixture-service-record-entry.cjs'));
  compiled.filename = path.join(root, 'fixture-service-record-entry.cjs'); compiled.paths = Module._nodeModulePaths(root);
  compiled._compile(built.outputFiles[0].text, compiled.filename); return compiled.exports;
}
const vehicle = { id: 'car', year: 2020, make: 'Toyota', model: 'Corolla', trim: 'LE', currentMileage: 30000 };
const record = { id: 'first', vehicleId: 'car', type: 'oil_change', date: '2026-09-01', mileage: 29000, cost: 120, receiptUrl: null, shopName: null, description: null, notes: null, nextDueMileage: null, nextDueDate: null };
const children = element => [element, ...React.Children.toArray(element?.props?.children).flatMap(child => typeof child === 'object' ? children(child) : [])];

test('entry selection keeps reviewed Twin setup and only exposes standalone review to maintenance members', async () => {
  const api = await load();
  assert.equal(api.serviceRecordEntry(vehicle, true), 'review');
  assert.equal(api.serviceRecordEntry(vehicle, false), 'none');
  const xt6 = { ...vehicle, year: 2020, make: 'Cadillac', model: 'XT6', trim: 'Sport', transmission: null, currentMileage: null, reviewedEquipmentId: null };
  assert.equal(api.serviceRecordEntry(xt6, true), 'tree');
  assert.equal(api.serviceRecordEntry({ ...xt6, transmission: 'manual' }, true), 'none');
  assert.equal(api.serviceRecordEntry({ ...xt6, reviewedEquipmentId: 'different-equipment' }, true), 'none');
  const profile = api.REVIEWED_OWNER_EQUIPMENT.find(row => row.catalogId === 'xt6');
  assert.equal(api.serviceRecordEntry({ ...xt6, transmission: 'automatic', reviewedEquipmentId: profile.id, currentMileage: 10000 }, true), 'tree');
  const dual = { ...vehicle, year: 2015, make: 'Dodge', model: 'Challenger', trim: 'SRT 392', transmission: null };
  for (const transmission of [null, 'automatic', 'manual']) assert.equal(api.serviceRecordEntry({ ...dual, transmission }, true), 'tree');
});

test('actual review selector displays the exact automatic/manual value passed by the Tech Tree', async () => {
  const api = await load();
  for (const [typeId, label] of [['transmission_fluid_auto', 'Automatic transmission fluid'], ['transmission_fluid_manual', 'Manual transmission fluid']]) {
    const html = renderToStaticMarkup(React.createElement(api.ServiceReview, { vehicleId: 'car', service: { typeId, label } }));
    assert.match(html, new RegExp(`<option value="${typeId}" selected="">${label}</option>`));
  }
});

test('stale history withholds summary, row costs and printable rows, including browser print', async () => {
  const api = await load();
  const html = renderToStaticMarkup(React.createElement(api.ServiceRecords, { vehicle, records: [record], recordsError: 'Refresh failed', onRecordAdded() {}, canManageMaintenance: true }));
  assert.doesNotMatch(html, /\$120\.00|Service record summary|<tbody>/);
  assert.match(html, /disabled=""[^>]*>Print records/);
  assert.match(html, /Refresh successfully before printing/);
  assert.match(html, />Log service or attach receipt<\/button>/);
});

test('fallback mounts the existing canonical review with exact owned vehicle', async t => {
  const api = await load(true);
  globalThis.__serviceHistory = { index: 0, values: ['all', true, '', null], changes: [] };
  t.after(() => delete globalThis.__serviceHistory);
  const tree = api.ServiceRecords({ vehicle, records: [], onRecordAdded() {}, canManageMaintenance: true });
  const review = children(tree).find(node => node.type === api.ServiceReview);
  assert.ok(review); assert.equal(review.props.vehicleId, vehicle.id);
  assert.equal(review.props.currentMileage, vehicle.currentMileage);
});

for (const fails of [false, true]) test(`confirmed deletion refresh ${fails ? 'failure preserves deletion and marks history unavailable' : 'loads transferred invoice cost'}`, async t => {
  const api = await load(true);
  const sibling = { ...record, id: 'second', type: 'tire_rotation', cost: null };
  const f = { index: 0, values: [vehicle, [record, sibling], null, false], changes: [] };
  globalThis.__serviceHistory = f;
  const oldFetch = globalThis.fetch, oldWindow = globalThis.window;
  globalThis.window = { confirm: () => true };
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push([url, options?.method]);
    if (options?.method === 'DELETE') return Response.json({ success: true });
    assert.equal(url, '/api/maintenance?vehicleId=car&limit=100&offset=0');
    if (fails) throw new Error('offline');
    return Response.json({ records: [{ ...sibling, cost: 120 }], nextOffset: null });
  };
  t.after(() => { globalThis.fetch = oldFetch; globalThis.window = oldWindow; delete globalThis.__serviceHistory; });
  const tree = api.GarageServiceRecordsClient();
  const history = children(tree).find(node => node.type === api.ServiceRecords);
  await history.props.onDeleteRecord('first');
  assert.equal(calls.length, 2);
  assert.deepEqual(f.values[1].map(row => row.id), ['second']);
  assert.ok(f.changes.some(([index, value]) => index === 2 && value?.includes('Deletion confirmed')));
  if (fails) assert.match(f.values[2], /Deletion confirmed.*could not be refreshed/);
  else { assert.equal(f.values[1][0].cost, 120); assert.equal(f.values[2], null); }
});
