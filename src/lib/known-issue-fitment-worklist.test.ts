import assert from 'node:assert/strict';
import test from 'node:test';
import { buildFitmentPacket, type FrozenIssueRecord } from './known-issue-fitment-worklist';

const base: FrozenIssueRecord = {
  id: 'acura-test-pump', make: 'Acura', model: 'MDX', years: [2010, 2009], trims: ['Base', 'SH-AWD'],
  engines: ['3.7L V6', '3.5L V6'], title: 'Cooling failure',
  solution: 'If pressure testing confirms leakage, replace the water pump and thermostat.',
  fixParts: [{
    component: 'Water pump', oemPartNumber: '19200-RYE-A01', aftermarketXref: ['WP-1'],
    variants: [{ oemPartNumber: '19200-ALT-A01' }], buyLinks: [],
  }],
  before: { fixPartsHash: 'frozen' },
};

test('builds one full-scope engine slice for every prescription and existing part', () => {
  const packet = buildFitmentPacket([base, { ...base, id: 'honda', make: 'Honda' }], 'Acura');
  assert.equal(packet.ledger.length, 1);
  assert.equal(packet.ledger[0]!.disposition, 'diagnosis-dependent');
  assert.equal(packet.ledger[0]!.prescriptionCount, 2);
  assert.equal(packet.ledger[0]!.existingFixPartCount, 1);
  assert.equal(packet.entries.length, 10);
  assert.deepEqual(new Set(packet.entries.map((entry) => entry.declaredEngine)), new Set(['3.7L V6', '3.5L V6']));
  assert.deepEqual(new Set(packet.entries.map((entry) => entry.engineMatch)), new Set(['3.7L', '3.5L']));
  assert.ok(packet.entries.every((entry) => entry.years.join(',') === '2009,2010'));
  assert.ok(packet.entries.every((entry) => entry.trims.includes('SH-AWD')));
  assert.equal(packet.entries.filter((entry) => entry.source === 'existing-fix-part').length, 6);
  assert.deepEqual(
    new Set(packet.entries.filter((entry) => entry.source === 'existing-fix-part').map((entry) => entry.partNumber)),
    new Set(['19200-RYE-A01', 'WP-1', '19200-ALT-A01']),
  );
  assert.ok(packet.entries.every((entry) => entry.id === base.id));
  assert.ok(packet.entries.every((entry) => entry.prescriptionKey && entry.articleScope.make === 'Acura'));
  assert.ok(packet.entries.every((entry) => entry.existingFixParts?.length === 1));
  assert.deepEqual(packet.ledger[0]!.before, { fixPartsHash: 'frozen' });
});

test('classifies each published issue exactly once', () => {
  const records: FrozenIssueRecord[] = [
    { ...base, id: 'buy', solution: 'Replace the water pump.', fixParts: [] },
    { ...base, id: 'dealer', solution: 'The dealer will perform a software update.', fixParts: [] },
    { ...base, id: 'service', solution: 'Flush the brake fluid and bleed the system.', fixParts: [] },
    { ...base, id: 'none', solution: 'Inspect the area and monitor the noise.', fixParts: [] },
  ];
  const packet = buildFitmentPacket(records, 'Acura');
  assert.deepEqual(new Set(packet.ledger.map((row) => row.disposition)), new Set([
    'buyable', 'recall/dealer', 'service/tool/fluid', 'no-commerce',
  ]));
  assert.equal(new Set(packet.ledger.map((row) => row.issueId)).size, records.length);
  assert.deepEqual(
    new Set(packet.entries.map((entry) => entry.issueId)),
    new Set(['buy']),
  );
  assert.ok(packet.ledger.filter((row) => row.disposition !== 'buyable').every((row) => row.workItemIds.length === 0));
});

test('recall/dealer prescriptions stay in the ledger and never enter commerce sourcing', () => {
  const record: FrozenIssueRecord = {
    ...base,
    id: 'acura-recall-interlock',
    solution: 'Under the recall, the dealer will replace the ignition-switch interlock at no charge.',
    fixParts: [{ component: 'Ignition switch interlock', oemPartNumber: 'RECALL-PN' }],
  };
  const packet = buildFitmentPacket([record], 'Acura');
  assert.equal(packet.ledger[0]!.disposition, 'recall/dealer');
  assert.equal(packet.ledger[0]!.existingFixPartCount, 1);
  assert.deepEqual(packet.ledger[0]!.workItemIds, []);
  assert.deepEqual(packet.entries, []);
});

test('software and warranty language cannot suppress a separate conditional replacement', () => {
  const packet = buildFitmentPacket([{
    ...base,
    id: 'acura-software-then-part',
    solution: 'Install the software update. If shudder persists, the torque converter must be replaced under the warranty extension.',
    fixParts: [],
  }], 'Acura');
  assert.equal(packet.ledger[0]!.disposition, 'diagnosis-dependent');
  assert.ok(packet.ledger[0]!.workItemIds.length > 0);
  assert.deepEqual(new Set(packet.entries.map((entry) => entry.component)), new Set(['torque converter']));

  const campaign = buildFitmentPacket([{
    ...base,
    id: 'acura-campaign-then-part',
    solution: 'Under the service campaign, the dealer will install the software update. If shudder persists, replace the torque converter.',
    fixParts: [],
  }], 'Acura');
  assert.equal(campaign.ledger[0]!.disposition, 'diagnosis-dependent');
  assert.deepEqual(new Set(campaign.entries.map((entry) => entry.component)), new Set(['torque converter']));
});
