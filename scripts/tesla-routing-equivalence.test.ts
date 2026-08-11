import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { filterableKnownIssueTrims as productionFilterable, isApplicabilityProseTrim as productionProse, knownIssueMatchesTrim as productionMatches } from '../src/lib/known-issue-trim-filter';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mirror = require('./known-issue-trim-routing-contract');

test('routing mirror is equivalent for every frozen issue/year/selectable-trim route', () => {
  const root = path.resolve(__dirname, '..');
  const snapshot = JSON.parse(fs.readFileSync(path.join(root, 'data/_tesla-deeplink-snapshot-2026-08-11.json'), 'utf8'));
  const ymmt = JSON.parse(fs.readFileSync(path.join(root, 'public/data/ymmt.json'), 'utf8'));
  for (const row of snapshot.records) for (const year of row.years) for (const selectedTrim of ymmt[String(year)]?.Tesla?.[row.model] || []) {
    assert.deepEqual(mirror.filterableKnownIssueTrims(row.trims), productionFilterable(row.trims), `${row.id}/${year}/${selectedTrim}: filterable`);
    assert.equal(mirror.knownIssueMatchesTrim(row.trims, selectedTrim), productionMatches(row.trims, selectedTrim), `${row.id}/${year}/${selectedTrim}: match`);
  }
});

test('routing mirror preserves applicability-prose fail-open boundaries', () => {
  const fixtures = ['Vehicles built before 2020', 'VIN-specific campaign', 'Only vehicles equipped with X', 'software level 123', 'Sport'];
  for (const fixture of fixtures) {
    assert.equal(mirror.isApplicabilityProseTrim(fixture), productionProse(fixture));
    assert.deepEqual(mirror.filterableKnownIssueTrims([fixture]), productionFilterable([fixture]));
    assert.equal(mirror.knownIssueMatchesTrim([fixture], 'Active'), productionMatches([fixture], 'Active'));
  }
});
