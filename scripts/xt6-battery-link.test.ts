import assert from 'node:assert/strict';
import test from 'node:test';
import snapshot from './fixtures/xt6-published-snapshot.json';
import { projectKnownIssueTwinIssues } from '../src/lib/known-issue-twin-pilot';
import { withReviewedTwinParts } from '../src/lib/known-issue-twin-reviewed-parts';
import type { KnownIssue } from '../src/schemas/knownIssue.schema';

const source = snapshot.issues.find(row => row.id === 'cadillac-xt6-auto-stop-2020') as unknown as KnownIssue;
const url = 'https://www.partsdirect.parts/parts/acdelco-battery-94ragm';

test('reviewed XT6 battery survives commerce and fitment guards without changing published data', () => {
  const before = JSON.stringify(source);
  const row = projectKnownIssueTwinIssues([source])[0];
  const battery = row.fixParts.find(part => part.oemPartNumber === '88864542 (ACDelco Gold 94RAGM)')!;
  assert.deepEqual(battery.buyLinks, [{ vendor: 'PartsDirect', url }]);
  assert.equal(battery.fitmentConfirmed, true);
  assert.equal(battery.priceLow, 243.63);
  assert.match(battery.note, /\$18 core charge/);
  assert.equal(row.scanner, null, 'a stored code alone must not add an OBD product');
  assert.equal(JSON.stringify(source), before);
});

test('battery review does not transfer to changed sources, part numbers or existing scoped variants', () => {
  for (const mutate of [
    (row: KnownIssue) => { row.solution += ' Changed repair.'; },
    (row: KnownIssue) => { row.description += ' Changed diagnosis.'; },
    (row: KnownIssue) => { row.fixParts![0].oemPartNumber = 'different'; },
    (row: KnownIssue) => { row.fixParts![0].verified = false; },
    (row: KnownIssue) => { row.fixParts![0].fitment = { years: [2021] }; },
    (row: KnownIssue) => { row.fixParts![0].variants = [{ scope: '2020 variant', note: 'Test variant', oemPartNumber: 'different', fitment: { years: [2020] } }]; },
    (row: KnownIssue) => { row.vehicleMatch.model = 'XT5'; },
  ]) {
    const changed = structuredClone(source);
    mutate(changed);
    assert.equal(withReviewedTwinParts(changed).fixParts?.some(part => part.buyLinks?.some(link => link.url === url)), false);
  }
});
