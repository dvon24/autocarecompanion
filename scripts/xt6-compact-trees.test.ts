import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';
import snapshot from './fixtures/xt6-published-snapshot.json';
import { projectKnownIssueTwinIssues, resolveKnownIssueTwinPartImage } from '../src/lib/known-issue-twin-pilot';
import { reviewedKnownIssueTwinCopy } from '../src/lib/known-issue-twin-copy';
import { buildIssueTree, knownIssueTreeProducts } from '../src/lib/known-issue-twin-tree';
import type { KnownIssue } from '../src/schemas/knownIssue.schema';

const issues = projectKnownIssueTwinIssues(snapshot.issues as unknown as KnownIssue[]);

test('ten source-reviewed LGX issues map to meaningful systems; the LSY heater record stays written only', () => {
  assert.equal(issues.filter(issue => issue.hotspot).length, 10);
  const expected = [['missing-endcap', 'trans'], ['cooling-system-through-bl', 'cooling'], ['steering-assist-is-redu', 'steering'], ['bad-coaxial-cable-crimp-surr', 'camera'], ['pinholes-roof-panel-laser', 'roof']];
  for (const [suffix, area] of expected) {
    const issue = issues.find(row => row.id.includes(suffix))!;
    assert.equal(issue.hotspot?.id, area);
    assert.equal(issue.typicalMileage, null, 'no invented mileage window');
    assert.ok(issue.applicability, 'build/VIN/option scope is explicit');
    assert.ok(new Set(Object.values(buildIssueTree(issue).nodes).map(node => node.img)).size >= 3);
    const raw = snapshot.issues.find(row => row.id === issue.id)!;
    for (const changed of [
      { ...raw, description: raw.description + ' Source changed.' },
      { ...raw, solution: raw.solution + ' Source changed.' },
      { ...raw, vehicleMatch: { ...raw.vehicleMatch, years: [2020] } },
      { ...raw, vehicleMatch: { ...raw.vehicleMatch, engines: ['2.0L LSY'] } },
      { ...raw, vehicleMatch: { ...raw.vehicleMatch, trims: ['Different trim'] } },
      { ...raw, citations: [] },
    ]) {
      if (JSON.stringify(changed) !== JSON.stringify(raw)) assert.equal(projectKnownIssueTwinIssues([changed as unknown as KnownIssue])[0].hotspot, null, 'changed source needs a fresh mapping review');
    }
  }
  const heater = issues.find(issue => issue.id.includes('loss-cabin-heat'))!;
  assert.equal(heater.hotspot, null);
  const steering = issues.find(issue => issue.hotspot?.id === 'steering')!;
  assert.equal(steering.scanner, null, 'an engine OBD scanner is not qualified for steering-module diagnosis');
  assert.match(steering.applicability!, /September 28–October 22, 2020/);
  assert.match(steering.explanation.mechanism, /C0460-58.*C0545-00/);
  const cooling = buildIssueTree(issues.find(issue => issue.hotspot?.id === 'cooling')!);
  assert.match(JSON.stringify(cooling.nodes.action), /oil cooler.*rubber coolant hoses.*Flush the radiator and heater core/);
  const camera = buildIssueTree(issues.find(issue => issue.hotspot?.id === 'camera')!);
  assert.match(camera.nodes.action.sub, /front coaxial cable/);
  assert.match(JSON.stringify(camera.nodes.mechanism), /UV2/);
  const roof = buildIssueTree(issues.find(issue => issue.hotspot?.id === 'roof')!);
  assert.match(JSON.stringify(roof.nodes.action), /only as necessary/);
  assert.doesNotMatch(JSON.stringify(roof), /usually needs replacement/);
});

test('all eleven pilot issues have a complete sequential tree and retain symptoms, checks, and artwork', () => {
  assert.equal(issues.length, 11);
  for (const issue of issues) {
    const before = JSON.stringify(issue);
    const tree = buildIssueTree(issue);
    const expected = tree.nodes.system ? ['vehicle', 'system', 'mechanism', 'action'] : ['vehicle', 'mechanism', 'action'];
    assert.equal(Object.keys(tree.nodes).length, expected.length, issue.id);
    expected.forEach((id, index) => assert.deepEqual(tree.nodes[id].kids, expected.slice(index + 1, index + 2), issue.id));
    assert.deepEqual(tree.nodes.mechanism.detailSections?.find(section => section.label === 'Symptoms')?.items ?? [], issue.symptoms);
    if (issue.explanation.mechanism !== issue.explanation.issueSentence) {
      assert.ok(tree.nodes.mechanism.detailSections?.some(section => section.items.includes(issue.explanation.mechanism)), 'full mechanism remains in detail');
    }
    assert.deepEqual(tree.nodes.action.detailSections?.find(section => section.label === 'How to check')?.items ?? [], issue.howToCheck);
    const copy = reviewedKnownIssueTwinCopy(issue);
    assert.equal(tree.nodes.mechanism.img, copy?.image ? `/twin-stage/parts/${copy.image}` : resolveKnownIssueTwinPartImage('', issue.hotspot?.id).src);
    assert.equal(tree.nodes.action.img, copy?.repairImage ? `/twin-stage/parts/${copy.repairImage}` : '/twin-stage/thumbs/service-inspection.svg');
    for (const node of Object.values(tree.nodes)) {
      assert.ok(existsSync(`public${node.img}`), node.img);
      if (node.img.startsWith('/twin-stage/parts/')) assert.ok(existsSync(`public/twin-stage/thumbs/${node.img.split('/').at(-1)}`), `compact thumbnail for ${node.img}`);
    }
    assert.ok(tree.nodes.vehicle.sub.includes(issue.title));
    assert.equal(JSON.stringify(issue), before, 'tree building does not mutate source data');
  }
});

test('missing system mapping omits the system node; recall guidance and locator remain primary', () => {
  const unknown = structuredClone(issues[0]);
  unknown.hotspot = null;
  unknown.explanation.system = null;
  assert.deepEqual(buildIssueTree(unknown).nodes.vehicle.kids, ['mechanism']);
  const recall = issues.find(issue => issue.id.includes('missing-endcap'))!;
  const action = buildIssueTree(recall).nodes.action;
  assert.equal(action.label, 'Dealer or recall action');
  assert.equal(action.dealerMake, 'Cadillac');
  assert.match(action.sub, /20V668000/);
  assert.match(JSON.stringify(action.detailSections), /N202313440/);
  assert.equal(action.products?.length, 0, 'a fluid is not a substitute for recall completion');
});

test('grouped products keep each scope, note and link and never give tools a parts fitment claim', () => {
  const issue = structuredClone(issues[0]);
  issue.fixParts = [{ component: 'Reviewed test fluid', oemPartNumber: 'TEST-1', aftermarketXref: [],
    note: 'Confirm RPO; price excludes shipping; repair leaking seals first.', priceLow: 20, priceHigh: 25,
    recallFirst: false, fitmentScope: '2020 3.6L AWD only', fitmentConfirmed: true,
    buyLinks: [{ vendor: 'Test vendor', url: 'https://example.com/fluid' }] }];
  issue.scanner = { name: 'Test scanner', priceRange: '$99', productUrl: 'https://example.com/scanner' };
  const action = buildIssueTree(issue).nodes.action;
  assert.equal(action.productFitmentMode, 'individual');
  const [fluid, scanner] = action.products!;
  assert.equal(fluid.spec, issue.fixParts[0].fitmentScope);
  assert.equal(fluid.note, issue.fixParts[0].note);
  assert.equal(fluid.price, '$20–$25');
  assert.equal(fluid.buyUrl, issue.fixParts[0].buyLinks[0].url);
  assert.equal(scanner.commerceKind, 'diagnostic-tool');
  assert.equal(scanner.fitmentReviewed, false);
  assert.match(scanner.spec, /Confirm exact vehicle and module coverage/);
  issue.scanner = null;
  assert.equal(knownIssueTreeProducts(issue).some(product => product.commerceKind === 'diagnostic-tool'), false);
});

test('battery keeps conditional replacement, core-charge caveat and exact link while excluding optional eliminator', () => {
  const issue = issues.find(row => row.id === 'cadillac-xt6-auto-stop-2020')!;
  const products = knownIssueTreeProducts(issue);
  assert.equal(products.length, 1);
  assert.match(products[0].label, /only if testing confirms it is weak/);
  assert.match(products[0].note, /\$18 core charge/);
  assert.equal(products[0].buyUrl, 'https://www.partsdirect.parts/parts/acdelco-battery-94ragm');
  assert.doesNotMatch(JSON.stringify(buildIssueTree(issue).nodes.action), /eliminator/i);
  const changed = structuredClone(issue);
  changed.solution += ' Changed repair.';
  assert.deepEqual(knownIssueTreeProducts(changed), [], 'stale battery review is withheld');
});

test('conflicting fluid advice stays qualified and is not copied to the confirmed DEXRON VI branch', () => {
  const conflict = buildIssueTree(issues.find(row => row.id === 'cadillac-xt6-transmission-shudder-2020')!).nodes.action;
  assert.match(conflict.sub, /conflicts/);
  assert.doesNotMatch(JSON.stringify(conflict), /resolves mild cases/);
  const confirmed = buildIssueTree(issues.find(row => row.id === 'cadillac-xt6-9speed-transmission-2020')!).nodes.action;
  assert.match(confirmed.sub, /M3G\/M3W/);
  assert.match(confirmed.sub, /200 miles/);
  assert.doesNotMatch(JSON.stringify(confirmed), /Blue Label/);
});
