/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const path = require('node:path');
const config = require('./triumph-hold-audit-config');
const { assertSnapshot, buildAudit, buildRouting } = require('./build-conservative-make-hold-audit');
const { validateAudit } = require('./validate-conservative-make-hold-audit');

const root = path.resolve(__dirname, '..');
const snapshot = JSON.parse(fs.readFileSync(path.join(root, config.snapshotFile), 'utf8'));
const ymmt = JSON.parse(fs.readFileSync(path.join(root, 'public/data/ymmt.json'), 'utf8'));

test('builds six deterministic byte-identical published holds', () => {
  const audit = buildAudit(config);
  assert.equal(audit.summary.rows, 6);
  assert.equal(audit.summary.held, 6);
  assert.equal(audit.summary.authorizedWriteCandidates, 0);
  assert.equal(audit.decisions.every((row) => row.beforeSha256 === row.proposalSha256 && row.changedFields.length === 0 && row.proposal.status === 'published'), true);
  assert.deepEqual(validateAudit(config, audit), []);
});

test('rejects a frozen content mutation', () => {
  const mutated = structuredClone(snapshot);
  mutated.records[0].title += ' changed';
  assert.throws(() => assertSnapshot(config, mutated), /differs from the pinned snapshot file|frozen title hash drifted/);
});

test('rejects status, identity, owner and commerce mutation in a held proposal', () => {
  for (const mutate of [
    (row) => { row.proposal.status = 'archived'; },
    (row) => { row.proposal.title += ' changed'; },
    (row) => { row.proposal.reportCount = 99; },
    (row) => { row.proposal.fixParts = [{ name: 'unsafe' }]; },
  ]) {
    const audit = buildAudit(config);
    mutate(audit.decisions[0]);
    assert.notDeepEqual(validateAudit(config, audit), []);
  }
});

test('records every TR6 issue-year as selector unavailable without hiding the page', () => {
  const rows = assertSnapshot(config, snapshot);
  const routing = buildRouting(rows, config, ymmt);
  assert.equal(routing.routes.length, rows.reduce((sum, row) => sum + row.years.length, 0));
  assert.equal(routing.routes.every((route) => route.classification === 'selector-unavailable'), true);
  assert.equal(routing.metadataWritesAuthorized, 0);
});

test('validator rejects missing and duplicate decisions', () => {
  const missing = buildAudit(config);
  missing.decisions.pop();
  assert.notDeepEqual(validateAudit(config, missing), []);
  const duplicate = buildAudit(config);
  duplicate.decisions[1] = structuredClone(duplicate.decisions[0]);
  assert.notDeepEqual(validateAudit(config, duplicate), []);
});
