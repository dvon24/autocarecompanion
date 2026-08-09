/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mazda-cx-70-adjudication');
const { diffFields, hashValue } = require('./mazda-adjudication-utils');
const { validatePacket } = require('./validate-mazda-cx-70-adjudication');

const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function copy(value) { return JSON.parse(JSON.stringify(value)); }
function rowFor(value, id) { return value.rows.find((row) => row.id === id); }
function rehash(row) {
  row.proposalSha256 = hashValue(row.proposal);
  row.changedFields = diffFields(row.before, row.proposal);
}
function errorsFor(mutator) {
  const value = copy(packet);
  mutator(value);
  return validatePacket(value, snapshot);
}

test('baseline CX-70 proposal packet passes', () => {
  assert.deepEqual(validatePacket(packet, snapshot), []);
});

test('indexed title mutation is rejected', () => {
  const errors = errorsFor((value) => {
    const row = rowFor(value, IDS.water);
    row.proposal.title = 'Water Leak Near Front Map Light';
    rehash(row);
  });
  assert.ok(errors.some((error) => error.includes('immutable title changed')));
});

test('report count mutation is rejected', () => {
  const errors = errorsFor((value) => {
    const row = rowFor(value, IDS.heatTrim);
    row.proposal.reportCount = 2;
    rehash(row);
  });
  assert.ok(errors.some((error) => error.includes('report count drifted')));
});

test('owner-count social proof is rejected', () => {
  const errors = errorsFor((value) => {
    const row = rowFor(value, IDS.suddenAcceleration);
    row.proposal.description += ' 0+ owners have reported this issue.';
    rehash(row);
  });
  assert.ok(errors.some((error) => error.includes('owner social proof is forbidden')));
});

test('search-style citation is rejected', () => {
  const errors = errorsFor((value) => {
    const row = rowFor(value, IDS.battery);
    row.proposal.citations[0].url = 'https://example.com/search?q=cx70+battery';
    rehash(row);
  });
  assert.ok(errors.some((error) => error.includes('exact citations drifted')));
  assert.ok(errors.some((error) => error.includes('not an exact approved primary source')));
});

test('commerce insertion is rejected', () => {
  const errors = errorsFor((value) => {
    const row = rowFor(value, IDS.bsm);
    row.proposal.fixParts.push({ name: 'Rear radar module', url: 'https://shop.example/part' });
    rehash(row);
  });
  assert.ok(errors.some((error) => error.includes('must remain unapproved and commerce-free')));
});

test('fuel-gauge scope hold cannot be silently released', () => {
  const errors = errorsFor((value) => {
    const row = rowFor(value, IDS.fuelGauge);
    row.identityReviewRequired = false;
    row.identityConflict = null;
    row.action = 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source';
  });
  assert.ok(errors.some((error) => error.includes('action/identity hold drifted')));
  assert.ok(errors.some((error) => error.includes('fuel-gauge scope hold drifted')));
});

test('missing CX-70 page is rejected', () => {
  const errors = errorsFor((value) => { value.rows.pop(); });
  assert.ok(errors.some((error) => error.includes('coverage must be 19/19')));
});

test('stale P0531 suspension guidance is rejected', () => {
  const errors = errorsFor((value) => {
    const row = rowFor(value, IDS.p0531);
    row.proposal.solution += ' The update was temporarily suspended.';
    rehash(row);
  });
  assert.ok(errors.some((error) => error.includes('P0531 latest-bulletin boundary drifted')));
});

test('unsupported water-intrusion TSB claim is rejected', () => {
  const errors = errorsFor((value) => {
    const row = rowFor(value, IDS.water);
    row.proposal.description += ' Mazda has issued TSBs covering liftgate grommet and panorama roof leaks.';
    rehash(row);
  });
  assert.ok(errors.some((error) => error.includes('water-intrusion hold drifted')));
});

test('sudden-acceleration clutch-cause remedy is rejected', () => {
  const errors = errorsFor((value) => {
    const row = rowFor(value, IDS.suddenAcceleration);
    row.proposal.solution += ' Clutch creep calibration is the suspected contributor.';
    rehash(row);
  });
  assert.ok(errors.some((error) => error.includes('sudden-acceleration complaint boundary drifted')));
});

test('BSM forum-style pending-remedy claim is rejected', () => {
  const errors = errorsFor((value) => {
    const row = rowFor(value, IDS.bsm);
    row.proposal.description += ' A definitive Mazda software remedy was still pending.';
    rehash(row);
  });
  assert.ok(errors.some((error) => error.includes('BSM bulletin boundary drifted')));
});

test('generic infotainment growing-pains language is rejected', () => {
  const errors = errorsFor((value) => {
    const row = rowFor(value, IDS.infotainmentUpdates);
    row.proposal.description += ' These are typical first-model-year growing pains.';
    rehash(row);
  });
  assert.ok(errors.some((error) => error.includes('infotainment exact-version boundary drifted')));
});

test('PDF visual-page metadata drift is rejected', () => {
  const errors = errorsFor((value) => { value.pdfSources.batteryTest.visualPages.pop(); });
  assert.ok(errors.some((error) => error.includes('batteryTest: PDF evidence metadata drifted')));
});

test('application gate cannot be opened', () => {
  const errors = errorsFor((value) => { value.applicationGate.status = 'approved'; });
  assert.ok(errors.some((error) => error.includes('packet must remain blocked proposal-only')));
});
