/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { REWRITE_IDS, safeApplicabilityValues } = require('./build-gmc-adjudication');
const { expectedAction, expectedCitationUrl, validatePacket } = require('./validate-gmc-adjudication');

const packetFile = path.resolve(__dirname, '..', 'data', 'known-issue-gmc-adjudication-2026-08-05.json');
const snapshotFile = path.resolve(__dirname, '..', 'data', '_gmc-deeplink-snapshot-2026-08-05.json');

function sha256File(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

test('applicability arrays retain names and reject scope prose', () => {
  assert.deepEqual(
    safeApplicabilityValues(['Denali', 'Vehicles covered by campaign 20V668', '6.2L V8']),
    ['Denali', '6.2L V8'],
  );
});

test('GMC rewrite whitelist is narrow and every other row stays published unchanged', () => {
  assert.equal(REWRITE_IDS.size, 21);
  assert.equal(expectedAction('gmc-acadia-fuel-pump-mixing-tube-burr-causing-engine-stall-low-fuel'), 'rewrite_then_publish');
  assert.equal(expectedAction('gmc-acadia-transmission-9t65-2017'), 'keep_published_pending_source');
  assert.equal(expectedAction('gmc-canyon-3-6l-v6-excessive-oil-consumption-from-clogged-pcv-orifice'), 'keep_published_pending_source');
  assert.equal(expectedAction('gmc-sierra-1500-p0011-intake-cam-over-advanced-from-sludge-clogged-vvt-solen'), 'keep_published_pending_source');
});

test('high-risk campaign links are exact and not generic vehicle queries', () => {
  assert.equal(
    expectedCitationUrl('gmc-yukon-xl-takata-passenger-airbag-inflator-rupture-risk-recall-174-nhtsa-21v-050'),
    'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=21V050000',
  );
  assert.equal(
    expectedCitationUrl('gmc-acadia-shift-to-park-message-no-shutdown-door-lock-lockout-battery'),
    'https://static.nhtsa.gov/odi/tsbs/2024/MC-10251901-0001.pdf',
  );
});

test('generated GMC packet passes the no-archive and byte-identical keep gates', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(snapshotFile, 'utf8'));
  assert.deepEqual(validatePacket(packet, snapshot, sha256File(snapshotFile)), []);
  assert.deepEqual(packet.summary, {
    rewrite_then_publish: 21,
    keep_published_pending_source: 152,
    total: 173,
  });
  assert.equal(packet.rows.some((row) => row.proposal.status === 'archived'), false);
  for (const row of packet.rows.filter((candidate) => candidate.action === 'keep_published_pending_source')) {
    assert.deepEqual(row.proposal, row.before, row.id);
  }
});
