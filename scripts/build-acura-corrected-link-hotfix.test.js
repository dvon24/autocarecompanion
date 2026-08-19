/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { buildHotfix } = require('./build-acura-corrected-link-hotfix');
const { hashValue } = require('./apply-known-issue-catalog-deeplinks');

const root = path.resolve(__dirname, '..');
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const snapshot = readJson(path.join(root, 'data/acura-corrected-link-release/source-snapshot.json'));
const target = readJson(path.join(root, 'data/acura-corrected-link-release/final-target.json'));
const committed = readJson(path.join(root, 'data/known-issues-catalog-deeplink-decisions/acura-corrected-links-display-hotfix-2026-08-19.json'));
const committedResult = readJson(path.join(root, 'data/known-issues-catalog-deeplink-results/acura-corrected-links-display-hotfix-2026-08-19.json'));

test('the applied display hotfix remains immutable and matches its receipt', () => {
  assert.equal(hashValue(committed), committedResult.manifestHash);
});

test('hotfix comparison ignores fields schema v1 cannot persist', () => {
  const minimalTarget = structuredClone(target);
  minimalTarget.issues = [structuredClone(target.issues[0])];
  minimalTarget.issues[0].after.reviewedOn = '2099-01-01';
  const current = structuredClone(snapshot);
  const targetRecord = minimalTarget.issues[0];
  const row = current.records.find((record) => record.id === targetRecord.id);
  Object.assign(row, targetRecord.after);
  delete row.reviewedOn;
  assert.equal(buildHotfix(current, minimalTarget, 'test').issues.length, 0);
});

test('the J37 correction removes the stale VCM diagnosis and code', () => {
  const issue = committed.issues.find((item) => item.id === 'acura-mdx-vcm-related-oil-consumption-spark-plug-fouling-motor-mount-f');
  assert.ok(issue);
  assert.match(issue.after.description, /does not use Variable Cylinder Management/i);
  assert.ok(!issue.after.dtcCodes.includes('P3400'));
  assert.doesNotMatch(`${issue.after.description} ${issue.after.solution}`, /6-3-6|deactivates one bank/i);
});

test('replacement notes are customer-facing approvals, not rejected-link verdicts', () => {
  const notes = committed.issues.flatMap((item) => item.after.fixParts.map((part) => part.note || ''));
  assert.ok(notes.some((note) => note.includes('Verified replacement part.')));
  assert.ok(notes.every((note) => !/brand conflict|wrong product|unrelated product/i.test(note)));
});
