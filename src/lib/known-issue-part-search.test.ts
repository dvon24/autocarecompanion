import assert from 'node:assert/strict';
import test from 'node:test';
import type { FitmentWorkItem, IssueLedgerEntry } from './known-issue-fitment-worklist';
import {
  buildKnownIssuePartSearchQuery,
  buildKnownIssuePartSearchQueue,
  contextualSearchComponent,
  partSearchLaneForIssue,
  reviewKnownIssuePartSearchDiscoveries,
} from './known-issue-part-search';

function workItem(overrides: Partial<FitmentWorkItem> = {}): FitmentWorkItem {
  return {
    id: 'acura-integra-mounts',
    issueId: 'acura-integra-mounts',
    workItemId: 'acura-integra-mounts--mounts--1-7l-b17a1',
    prescriptionKey: 'prescription--0--0',
    source: 'prescription',
    component: 'motor mounts',
    repairRoleEvidence: 'Replace failed motor mounts.',
    diagnosisDependent: false,
    partNumber: '',
    make: 'Acura',
    model: 'Integra',
    years: [1990, 1991, 2000, 2001],
    trims: ['RS', 'LS', 'GS', 'GS-R', 'Type R'],
    engines: ['1.7L B17A1'],
    drivetrains: [],
    transmissions: [],
    declaredEngine: '1.7L B17A1',
    engineMatch: '1.7L',
    productMatch: [],
    partTypeMatch: 'motor mount',
    mappingStatus: 'unmapped',
    articleScope: {
      make: 'Acura',
      model: 'Integra',
      years: [1990, 1991, 2000, 2001],
      trims: ['RS', 'LS', 'GS', 'GS-R', 'Type R'],
      engines: ['1.7L B17A1'],
      drivetrains: [],
      transmissions: [],
    },
    existingFixParts: [],
    ...overrides,
  };
}

function ledger(item = workItem()): IssueLedgerEntry {
  return {
    issueId: item.issueId,
    disposition: 'buyable',
    reason: 'Owner-buyable component.',
    prescriptionCount: 1,
    existingFixPartCount: 0,
    workItemIds: [item.workItemId],
    before: {},
  };
}

test('builds Devon-style YMMT, trim, engine, component and US queries deterministically', () => {
  assert.equal(
    buildKnownIssuePartSearchQuery(workItem(), 'devon'),
    '1990-1991 2000-2001 Acura Integra — RS, LS, GS, GS-R, Type R motor mounts us',
  );
  assert.equal(
    buildKnownIssuePartSearchQuery(workItem(), 'precision'),
    '1990-1991 2000-2001 Acura Integra — RS, LS, GS, GS-R, Type R 1.7L B17A1 motor mounts us',
  );
  assert.equal(buildKnownIssuePartSearchQuery(workItem({ years: [2001] }), 'devon').startsWith('2001 '), true);
});

test('routes parts, fluids, tools, recalls and non-commerce before searching', () => {
  assert.equal(partSearchLaneForIssue('buyable', { title: 'Mount failure', solution: '' }), 'repair-part');
  assert.equal(partSearchLaneForIssue('diagnosis-dependent', { title: 'Mount failure', solution: '' }), 'repair-part');
  assert.equal(partSearchLaneForIssue('recall/dealer', { title: 'Recall', solution: '' }), 'recall-dealer-shop');
  assert.equal(partSearchLaneForIssue('service/tool/fluid', { title: 'ATF service', solution: 'Use ATF Type 3.1.' }), 'service-fluid');
  assert.equal(partSearchLaneForIssue('service/tool/fluid', { title: 'Transmission service', solution: 'Replace the transmission fluid.' }), 'service-fluid');
  assert.equal(partSearchLaneForIssue('service/tool/fluid', { title: 'No start', solution: 'Test with a multimeter.' }), 'diagnostic-tool');
  assert.equal(partSearchLaneForIssue('service/tool/fluid', { title: 'Adjustment', solution: 'Adjust the cable.' }), 'no-commerce');
  assert.equal(partSearchLaneForIssue('no-commerce', { title: 'Software behavior', solution: '' }), 'no-commerce');
});

test('uses article context to make generic prescribed objects searchable', () => {
  assert.equal(contextualSearchComponent(workItem({ component: 'bolts', repairRoleEvidence: 'Replace rusted bolts.' }), 'Rear lower control arm bolts seize'), 'rear lower control arm bolts');
  assert.equal(contextualSearchComponent(workItem({ component: 'switch' }), 'VTEC oil pressure switch failure'), 'VTEC oil pressure switch');
  assert.equal(contextualSearchComponent(workItem({ component: 'tubes' }), 'Sunroof drain tube clogs'), 'sunroof drain tubes');
  assert.equal(contextualSearchComponent(workItem({ component: 'pads' }), 'Type S Brembo Front Brake Squeal'), 'Type S Brembo front brake pads');
  assert.equal(contextualSearchComponent(workItem({ component: 'clear grommet/seal pieces', repairRoleEvidence: 'Order Honda 91608-SJ6-003.' }), 'Cowl leak'), 'cowl grommet seal 91608-SJ6-003');
});

test('builds exact terminal queue with primary gaps and reviewed alternates', () => {
  const gap = workItem();
  const alternate = workItem({
    workItemId: 'acura-integra-mounts--rear-mount--1-7l-b17a1',
    component: 'rear motor mount',
  });
  const packet = buildKnownIssuePartSearchQueue({
    make: 'Acura',
    snapshotHash: 'a'.repeat(64),
    sourceRecords: [{
      id: gap.issueId,
      make: 'Acura',
      model: 'Integra',
      years: gap.years,
      trims: gap.trims,
      engines: gap.engines,
      title: 'Motor mounts crack',
      solution: 'Replace failed motor mounts.',
    }],
    ledger: [{ ...ledger(gap), prescriptionCount: 2, workItemIds: [gap.workItemId, alternate.workItemId] }],
    workItems: [alternate, gap],
    evidence: [
      { workItemId: gap.workItemId, verdict: 'unmapped' },
      { workItemId: alternate.workItemId, verdict: 'discovered' },
    ],
    proposals: [{ proposalId: alternate.workItemId, id: alternate.issueId }],
  });
  assert.equal(packet.productionApplied, false);
  assert.equal(packet.issueCount, 1);
  assert.equal(packet.workItemCount, 2);
  assert.equal(packet.primarySearchCount, 1);
  assert.equal(packet.alternateSearchCount, 1);
  assert.equal(packet.sourceCorrectionHeldWorkItemCount, 0);
  assert.equal(packet.entries.find((row) => row.workItemId === gap.workItemId)?.searchDecision, 'find-primary');
  assert.equal(packet.entries.find((row) => row.workItemId === alternate.workItemId)?.searchDecision, 'find-alternate');
  assert.equal(packet.entries[0]?.queries.devon.includes('1.7L B17A1'), false);
  assert.equal(packet.entries[0]?.queries.precision.includes('1.7L B17A1'), true);
});

test('source-correction conflicts remain explicit but cannot execute a search', () => {
  const item = workItem();
  const packet = buildKnownIssuePartSearchQueue({
    make: 'Acura',
    snapshotHash: 'a'.repeat(64),
    sourceRecords: [{ id: item.issueId, make: 'Acura', model: 'Integra', years: item.years, title: 'Incorrect source claim', solution: 'Replace a part.' }],
    ledger: [ledger(item)],
    workItems: [item],
    evidence: [{ workItemId: item.workItemId, verdict: 'unmapped' }],
    proposals: [],
    sourceCorrectionHolds: [{
      issueId: item.issueId,
      reasonCode: 'authoritative-spec-conflict',
      authoritativeSources: ['https://static.nhtsa.gov/example.pdf'],
    }],
  });
  assert.equal(packet.entries[0]?.searchEligibility, 'source-correction-hold');
  assert.equal(packet.primarySearchCount, 0);
  assert.equal(packet.sourceCorrectionHeldWorkItemCount, 1);
  assert.throws(() => reviewKnownIssuePartSearchDiscoveries(packet, [{
    workItemId: item.workItemId,
    template: 'devon',
    query: packet.entries[0]!.queries.devon,
    vendor: 'Acura Parts Warehouse',
    productUrl: 'https://www.acurapartswarehouse.com/oem/acura~mount~engine~50810-sk7-a01.html',
    observedTitle: 'Genuine Acura Engine Mount 50810-SK7-A01',
    observedPartNumber: '50810-SK7-A01',
    discoverySourceUrl: 'https://www.google.com/search?q=acura+integra+motor+mount',
    retrievedAt: '2026-08-15T10:00:00.000Z',
  }]), /source-correction hold/);
});

test('fails closed when evidence, proposals or non-part routes drift', () => {
  const item = workItem();
  const base = {
    make: 'Acura',
    snapshotHash: 'a'.repeat(64),
    sourceRecords: [{
      id: item.issueId,
      make: 'Acura',
      model: 'Integra',
      years: item.years,
      title: 'Motor mounts crack',
      solution: 'Replace failed motor mounts.',
    }],
    ledger: [ledger(item)],
    workItems: [item],
    evidence: [{ workItemId: item.workItemId, verdict: 'unmapped' }],
    proposals: [] as Array<{ proposalId: string; id: string }>,
  };
  assert.throws(() => buildKnownIssuePartSearchQueue({ ...base, evidence: [] }), /set mismatch/);
  assert.throws(
    () => buildKnownIssuePartSearchQueue({ ...base, ledger: [{ ...ledger(item), workItemIds: [] }] }),
    /ledger\/work item set mismatch/,
  );
  assert.throws(
    () => buildKnownIssuePartSearchQueue({ ...base, proposals: [{ proposalId: 'missing', id: item.issueId }] }),
    /not bound/,
  );
  assert.throws(
    () => buildKnownIssuePartSearchQueue({
      ...base,
      ledger: [{ ...ledger(item), disposition: 'recall/dealer' }],
    }),
    /non-part lane/,
  );
});

test('turns only exact vendor-matched PDP evidence into held candidates', () => {
  const item = workItem();
  const queue = buildKnownIssuePartSearchQueue({
    make: 'Acura',
    snapshotHash: 'a'.repeat(64),
    sourceRecords: [{
      id: item.issueId,
      make: 'Acura',
      model: 'Integra',
      years: item.years,
      title: 'Motor mounts crack',
      solution: 'Replace failed motor mounts.',
    }],
    ledger: [ledger(item)],
    workItems: [item],
    evidence: [{ workItemId: item.workItemId, verdict: 'unmapped' }],
    proposals: [],
  });
  const input = {
    workItemId: item.workItemId,
    template: 'devon' as const,
    query: queue.entries[0]!.queries.devon,
    vendor: 'Acura Parts Warehouse',
    productUrl: 'https://www.acurapartswarehouse.com/oem/acura~mount~engine~50810-sk7-a01.html',
    observedTitle: 'Genuine Acura Engine Mount 50810-SK7-A01',
    observedPartNumber: '50810-SK7-A01',
    discoverySourceUrl: 'https://www.google.com/search?q=acura+integra+motor+mount',
    retrievedAt: '2026-08-15T10:00:00.000Z',
  };
  const candidates = reviewKnownIssuePartSearchDiscoveries(queue, [input]);
  assert.equal(candidates[0]?.releaseDecision, 'hold');
  assert.equal(Object.hasOwn(candidates[0] || {}, 'buyLinks'), false);
  assert.throws(
    () => reviewKnownIssuePartSearchDiscoveries(queue, [{
      ...input,
      productUrl: 'https://www.acurapartswarehouse.com/oem/acura~integra~2000.html',
    }]),
    /not an exact/,
  );
  assert.throws(
    () => reviewKnownIssuePartSearchDiscoveries(queue, [{ ...input, query: 'different query' }]),
    /frozen devon query/,
  );
  assert.throws(
    () => reviewKnownIssuePartSearchDiscoveries(queue, [{
      ...input,
      vendor: 'PartsGeek',
      productUrl: 'https://www.partsgeek.com/6rf5vft-acura-integra-wheel-hub-assembly.html',
      observedTitle: 'Example mount ABC-1234',
      observedPartNumber: 'ABC-123',
    }]),
    /exact product-identity token/,
  );
  assert.equal(reviewKnownIssuePartSearchDiscoveries(queue, [{
    ...input,
    vendor: 'PartsGeek',
    observedTitle: 'Standard Motor Products RY168 Main Relay',
    observedPartNumber: 'RY-168',
    productUrl: 'https://www.partsgeek.com/6rf5vft-acura-integra-main-relay.html',
  }]).length, 1);
  assert.throws(
    () => reviewKnownIssuePartSearchDiscoveries(queue, [{ ...input, discoverySourceUrl: 'https://user:pass@example.com/result' }]),
    /provenance is incomplete/,
  );
  assert.throws(
    () => reviewKnownIssuePartSearchDiscoveries(queue, [
      input,
      { ...input, productUrl: `${input.productUrl}?campaign=duplicate` },
    ]),
    /duplicate discovery product URL/,
  );
});
