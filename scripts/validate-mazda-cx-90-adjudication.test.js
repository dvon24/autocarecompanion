/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mazda-cx-90-adjudication');
const { diffFields, hashValue } = require('./mazda-adjudication-utils');
const { validatePacket } = require('./validate-mazda-cx-90-adjudication');

const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function copy(value) { return JSON.parse(JSON.stringify(value)); }
function rowFor(value, id) { return value.rows.find((row) => row.id === id); }
function rehash(row) { row.proposalSha256 = hashValue(row.proposal); row.changedFields = diffFields(row.before, row.proposal); }
function errorsFor(mutator) { const value = copy(packet); mutator(value); return validatePacket(value, snapshot); }

test('baseline CX-90 proposal packet passes', () => assert.deepEqual(validatePacket(packet, snapshot), []));

test('indexed title mutation is rejected', () => {
  const errors = errorsFor((value) => { const row = rowFor(value, IDS.roof); row.proposal.title = 'Panorama Roof Rattle'; rehash(row); });
  assert.ok(errors.some((error) => error.includes('immutable title changed')));
});

test('fabricated report count cannot be reintroduced', () => {
  const errors = errorsFor((value) => { const row = rowFor(value, IDS.engineStalling); row.proposal.reportCount = 1800; rehash(row); });
  assert.ok(errors.some((error) => error.includes('fabricated report count must remain proposal-only zero')));
});

test('owner-count social proof is rejected', () => {
  const errors = errorsFor((value) => { const row = rowFor(value, IDS.roof); row.proposal.description += ' 0+ owners have reported this issue.'; rehash(row); });
  assert.ok(errors.some((error) => error.includes('owner social proof is forbidden')));
});

test('search-style citation is rejected', () => {
  const errors = errorsFor((value) => { const row = rowFor(value, IDS.dashEsu); row.proposal.citations[0].url = 'https://example.com/search?q=24V814'; rehash(row); });
  assert.ok(errors.some((error) => error.includes('not an exact approved primary source')));
});

test('commerce insertion is rejected', () => {
  const errors = errorsFor((value) => { const row = rowFor(value, IDS.transmission); row.proposal.fixParts.push({ name: 'Valve body', url: 'https://shop.example/part' }); rehash(row); });
  assert.ok(errors.some((error) => error.includes('must remain unapproved and commerce-free')));
});

test('identity hold cannot be silently released', () => {
  const errors = errorsFor((value) => { const row = rowFor(value, IDS.charging); row.identityReviewRequired = false; row.identityConflict = null; row.action = 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source'; });
  assert.ok(errors.some((error) => error.includes('action/identity hold drifted')));
});

test('missing CX-90 page is rejected', () => {
  const errors = errorsFor((value) => { value.rows.pop(); });
  assert.ok(errors.some((error) => error.includes('coverage must be 9/9')));
});

test('automatic battery replacement is rejected', () => {
  const errors = errorsFor((value) => { const row = rowFor(value, IDS.battery); row.proposal.solution += ' Replace the 48-volt battery.'; rehash(row); });
  assert.ok(errors.some((error) => error.includes('battery software/no-parts boundary drifted')));
});

test('steering investigation cannot be described as a final failure finding', () => {
  const errors = errorsFor((value) => { const row = rowFor(value, IDS.steering); row.proposal.description = row.proposal.description.replace('not a final finding', 'a final finding'); rehash(row); });
  assert.ok(errors.some((error) => error.includes('steering recall-query boundary drifted')));
});

test('false engine campaign is rejected', () => {
  const errors = errorsFor((value) => { const row = rowFor(value, IDS.engineStalling); row.proposal.solution += ' Recall 24V228 requires fuel pump replacement.'; rehash(row); });
  assert.ok(errors.some((error) => error.includes('engine recall boundary drifted')));
});

test('false backup-camera disablement is rejected', () => {
  const errors = errorsFor((value) => { const row = rowFor(value, IDS.infotainment); row.proposal.solution += ' The backup camera is disabled.'; rehash(row); });
  assert.ok(errors.some((error) => error.includes('infotainment camera/software boundary drifted')));
});

test('unsupported onboard-charger replacement is rejected', () => {
  const errors = errorsFor((value) => { const row = rowFor(value, IDS.charging); row.proposal.solution += ' Replace the onboard charger.'; rehash(row); });
  assert.ok(errors.some((error) => error.includes('charging manual/diagnosis boundary drifted')));
});

test('unsupported transmission valve-body remedy is rejected', () => {
  const errors = errorsFor((value) => { const row = rowFor(value, IDS.transmission); row.proposal.solution += ' Perform valve body replacement.'; rehash(row); });
  assert.ok(errors.some((error) => error.includes('transmission exact-bulletin boundary drifted')));
});

test('application gate cannot be opened', () => {
  const errors = errorsFor((value) => { value.applicationGate.status = 'approved'; });
  assert.ok(errors.some((error) => error.includes('packet must remain blocked proposal-only')));
});

test('PDF visual-page metadata drift is rejected', () => {
  const errors = errorsFor((value) => { value.pdfSources.fuelGaugeRecall.visualPages.pop(); });
  assert.ok(errors.some((error) => error.includes('fuelGaugeRecall: PDF evidence metadata drifted')));
});
