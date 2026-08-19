/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { buildManifest, CONTENT_CORRECTION_IDS, fitmentFor } = require('./build-acura-corrected-link-release');

const root = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const ledger = readJson('data/acura-corrected-link-release/review-ledger.json');
const snapshot = readJson('data/acura-corrected-link-release/source-snapshot.json');
const committedManifest = readJson('data/acura-corrected-link-release/final-target.json');

function issue(id, manifest = committedManifest) {
  return manifest.issues.find((item) => item.id === id);
}

function urls(item) {
  return item.after.fixParts.flatMap((part) => part.buyLinks.map((link) => link.url));
}

test('locks the corrected Acura occurrence accounting', () => {
  assert.equal(ledger.occurrences.length, 63);
  assert.equal(ledger.occurrences.filter((item) => item.correctedDecision === 'keep').length, 36);
  assert.equal(ledger.occurrences.filter((item) => item.correctedDecision === 'replace').length, 25);
  assert.equal(ledger.occurrences.filter((item) => item.correctedDecision === 'hold').length, 2);
  assert.equal(ledger.occurrences.filter((item) => item.approvedDestinations.length > 0).length, 61);
  assert.equal(new Set(ledger.occurrences.map((item) => item.issueId)).size, 36);
  assert.equal(ledger.contentCorrections.length, 12);
  assert.deepEqual(
    [...new Set(ledger.contentCorrections.map((item) => item.issueId))].sort(),
    [...CONTENT_CORRECTION_IDS].sort(),
  );
  assert.deepEqual(ledger.holds.map((item) => item.index), [40, 41]);
  assert.deepEqual(committedManifest.occurrenceCoverage, {
    supplied: 66,
    preservedExisting: 3,
    correctedApproved: 61,
    held: 2,
  });
});

test('the committed release is reproducible from the frozen snapshot and ledger', () => {
  assert.deepEqual(buildManifest(snapshot, ledger), committedManifest);
  assert.equal(committedManifest.issues.length, 36);
  for (const item of committedManifest.issues) {
    const itemUrls = urls(item);
    assert.equal(itemUrls.length, new Set(itemUrls).size, `${item.id} has duplicate destinations`);
  }
});

test('holds stay out and reviewed corrections stay in', () => {
  const vcm = issue('acura-mdx-vcm-related-oil-consumption-spark-plug-fouling-motor-mount-f');
  assert.doesNotMatch(`${vcm.after.title} ${vcm.after.solution} ${urls(vcm).join(' ')}`, /vcmtuner\.com/i);
  assert.match(vcm.after.solution, /not a VCM application/i);
  assert.match(vcm.after.description, /does not use Variable Cylinder Management/i);
  assert.doesNotMatch(vcm.after.description, /deactivates one bank|6-3-6|class-action/i);
  assert.ok(!vcm.after.dtcCodes.includes('P3400'));

  const distributor = issue('acura-rl-c35a-distributor-shaft-seal-oil-leak');
  assert.equal(urls(distributor).length, 0);
  assert.match(distributor.after.contentUpdateSummary, /no verified repair product link was published/i);

  const timing = issue('acura-mdx-timing-belt-tensioner-2001');
  assert.match(timing.after.solution, /TKH-001/);
  assert.match(timing.after.solution, /TKH-002/);
  assert.ok(timing.after.fixParts.some((part) => part.component.includes('TKH-001')));
  assert.ok(timing.after.fixParts.some((part) => part.component.includes('TKH-002')));

  const tlx = issue('acura-tlx-9speed-shudder-2015');
  assert.match(tlx.after.solution, /ATF Type 3\.1/);
  assert.doesNotMatch(tlx.after.solution, /DW-1/);
  assert.doesNotMatch(JSON.stringify(tlx.after.communityRecommendations), /DW-1/);

  const tlxBrakes = issue('acura-tlx-brake-noise-aspec-2018');
  assert.doesNotMatch(`${tlxBrakes.after.description} ${tlxBrakes.after.solution}`, /slide pins|A-Spec calipers are identical/i);
  assert.match(tlxBrakes.after.solution, /fixed Brembo calipers/i);

  const rlTiming = issue('acura-rl-c35a-timing-belt-tensioner-interference');
  assert.doesNotMatch(JSON.stringify(rlTiming.after.communityRecommendations), /TKH-022/i);

  const vigor = issue('acura-vigor-g25a1-timing-belt-interference');
  assert.doesNotMatch(`${vigor.after.description} ${JSON.stringify(vigor.after.communityRecommendations)}`, /same hydraulic tensioner|complete kit/i);

  for (const item of committedManifest.issues) {
    assert.equal(Object.hasOwn(item.after, 'reviewedOn'), false);
    for (const part of item.after.fixParts) {
      assert.doesNotMatch(part.note || '', /brand conflict|wrong|unrelated/i);
    }
  }
});

test('supplemental commerce is explicit and evidence is not promoted automatically', () => {
  const legendHose = issue('acura-legend-power-steering-high-pressure-hose-crimp-leak-internal-hose-s');
  assert.ok(urls(legendHose).some((url) => url.includes('53713-sp0-a01')));
  const allUrls = committedManifest.issues.flatMap(urls);
  assert.ok(!allUrls.some((url) => url.includes('14510-pv0-003')));

  const evidenceOnly = ledger.occurrences.flatMap((item) => item.evidenceUrls)
    .filter((url) => !ledger.occurrences.flatMap((item) => [
      ...item.approvedDestinations,
      ...item.supplementalDestinations.filter((destination) => destination.commerceApproved),
    ]).some((destination) => destination.url === url));
  assert.ok(evidenceOnly.length > 0);
  assert.ok(evidenceOnly.some((url) => !allUrls.includes(url)));
});

test('fitment extraction preserves narrow year and engine subsets', () => {
  const record = { years: [2001, 2002, 2003, 2004], engines: ['3.5L V6', '2.4L I4'], trims: ['Base'] };
  const occurrence = { correctedDecision: 'keep', fitmentScope: '2001–2002 Acura MDX 3.5L V6 only.' };
  const destination = { label: 'AISIN kit' };
  assert.deepEqual(fitmentFor(record, occurrence, destination), {
    years: [2001, 2002],
    engines: ['3.5L V6'],
  });
});

test('replacement fitment never inherits the rejected product scope', () => {
  const distributor = issue('acura-integra-dc-distributor-internal-failure');
  const nonVtec = distributor.after.fixParts.find((part) => part.component.includes('Non-VTEC'));
  assert.equal(nonVtec.fitment?.engines, undefined);
  assert.doesNotMatch(nonVtec.note, /coil lists many/i);
  const earlyGsr = distributor.after.fixParts.find((part) => part.component === 'GS-R 1994–1995');
  assert.deepEqual(earlyGsr.fitment, { years: [1994, 1995] });
  assert.match(earlyGsr.note, /GS-R 1994–1995/);
});

test('recall-first gate is present before TL power-steering commerce', () => {
  const tl = issue('acura-tl-power-steering-hose-leak-2004');
  const gate = tl.after.fixParts.find((part) => part.recallFirst);
  assert.ok(gate);
  assert.deepEqual(gate.buyLinks, []);
  assert.match(gate.note, /check the VIN/i);
});

test('customer notes state the approved repair role', () => {
  const notes = committedManifest.issues.flatMap((item) => item.after.fixParts.map((part) => part.note || ''));
  assert.ok(notes.some((note) => note.startsWith('Verified repair fluid.')));
  assert.ok(notes.some((note) => note.startsWith('Verified repair kit.')));
  assert.ok(notes.every((note) => !note.startsWith('Verified replacement part.')));
});
