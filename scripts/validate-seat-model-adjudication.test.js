/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const { buildForModel, retainedProposal } = require('./build-seat-model-adjudication');
const { clone, diffFields, hashValue } = require('./known-issue-adjudication-utils');
const { getContract, supportedModels } = require('./seat-model-adjudication-contracts');
const { validatePacket } = require('./validate-seat-model-adjudication');
const { buildReconciliation } = require('./build-seat-make-reconciliation');
const { validateReconciliation } = require('./validate-seat-make-reconciliation');
const { assertSeatEvidence } = require('./validate-seat-primary-evidence');

const EXPECTED = {
  Alhambra: { total: 1, retained: 0, held: 1 },
  Arona: { total: 8, retained: 1, held: 7 },
  Ateca: { total: 1, retained: 0, held: 1 },
  Ibiza: { total: 11, retained: 0, held: 11 },
  Leon: { total: 14, retained: 0, held: 14 },
  Mii: { total: 1, retained: 0, held: 1 },
};

for (const model of supportedModels) {
  test(`${model} packet passes deterministic identity and evidence gates`, () => {
    const { contract, packet, snapshot } = buildForModel(model);
    assert.deepEqual(validatePacket(contract, packet, snapshot), []);
    assert.equal(packet.summary.total, EXPECTED[model].total);
    assert.equal(packet.summary.retain_indexed_identity_and_accuracy_cleanup, EXPECTED[model].retained);
    assert.equal(packet.summary.hold_indexed_identity_byte_identical_pending_identity_policy, EXPECTED[model].held);
    assert.equal(packet.summary.pages_preserved_published, EXPECTED[model].total);
  });
}

test('all 35 held SEAT rows are byte-identical no-ops', () => {
  const holds = [];
  for (const model of supportedModels) {
    const { packet } = buildForModel(model);
    holds.push(...packet.rows.filter((row) => row.action.startsWith('hold_')));
  }
  assert.equal(holds.length, 35);
  for (const row of holds) {
    assert.deepEqual(row.proposal, row.before);
    assert.equal(row.proposalSha256, row.beforeSha256);
    assert.deepEqual(row.changedFields, []);
  }
});

test('the retained row preserves identity and commerce while removing unsupported precision', () => {
  const retained = [];
  for (const model of supportedModels) {
    const { packet } = buildForModel(model);
    retained.push(...packet.rows.filter((row) => row.action.startsWith('retain_')));
  }
  assert.equal(retained.length, 1);
  for (const row of retained) {
    for (const field of ['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'relatedIssueIds']) {
      assert.deepEqual(row.proposal[field], row.before[field]);
    }
    assert.deepEqual(row.proposal.fixParts, row.before.fixParts);
    assert.deepEqual(row.proposal.communityRecommendations, row.before.communityRecommendations);
    assert.equal(row.proposal.reportCount, 0);
    assert.equal(row.proposal.lastReportedByOwners, '');
    assert.equal(row.proposal.estimatedCostLow, null);
    assert.equal(row.proposal.estimatedCostHigh, null);
    assert.equal(row.proposal.typicalMileageLow, null);
    assert.equal(row.proposal.typicalMileageHigh, null);
    assert.deepEqual(row.proposal.dtcCodes, []);
    assert.match(row.proposal.solution, /Do not buy/);
  }
});

test('retained proposal preserves nonzero live owner telemetry unless explicitly authorized for cleanup', () => {
  const contract = getContract('Arona');
  const { snapshot } = buildForModel('Arona');
  const source = clone(snapshot.records.find((row) => row.id === 'seat-arona-handbrake-lever-travel-increases'));
  source.reportCount = 9;
  source.lastReportedByOwners = '2026-08-11';
  const proposal = retainedProposal(contract, source);
  assert.equal(proposal.reportCount, 9);
  assert.equal(proposal.lastReportedByOwners, '2026-08-11');
});

test('manual evidence fingerprints and rendered pages remain locked', () => {
  assert.equal(assertSeatEvidence().sources.length, 5);
  const arona = getContract('Arona').pdfSources.aronaManual2021.localVerification;
  const ibiza = getContract('Ibiza').pdfSources.ibizaManual2015.localVerification;
  assert.deepEqual(arona, { bytes: 6058372, sha256: 'c704116e21bb265b367b80bcd2d100bb6e89a318a28833812d851ada271909e2', pdfPage: 278, printedPage: 276, renderedAndInspected: true });
  assert.deepEqual(ibiza, { bytes: 5125249, sha256: '2576cea7ce38b3a058b1908f9def034c3627923da7c19506c285338d7b66a6ef', pdfPage: 61, printedPage: 59, renderedAndInspected: true });
});

test('snapshot contract rejects case-variant rows and frozen field mutation', () => {
  const { contract, snapshot } = buildForModel('Arona');
  const caseVariant = clone(snapshot);
  caseVariant.records.push({ ...clone(snapshot.records[0]), id: 'seat-case-variant-test', make: 'seat' });
  assert.throws(() => require('./build-seat-model-adjudication').buildPacket(contract, caseVariant), /case-insensitive row count|noncanonical make/);
  const titleMutation = clone(snapshot);
  titleMutation.records[0].title += ' changed';
  assert.throws(() => require('./build-seat-model-adjudication').buildPacket(contract, titleMutation), /frozen title hash drifted/);
});

function rehash(row) {
  row.proposalSha256 = hashValue(row.proposal);
  row.changedFields = diffFields(row.before, row.proposal);
}

test('validator rejects a mutation to a held row', () => {
  const { contract, packet, snapshot } = buildForModel('Alhambra');
  const changed = clone(packet);
  changed.rows[0].proposal.description += ' changed';
  rehash(changed.rows[0]);
  assert.match(validatePacket(contract, changed, snapshot).join('\n'), /held row is not byte-identical|deterministic/);
});

test('validator rejects frozen title and publication drift', () => {
  const { contract, packet, snapshot } = buildForModel('Arona');
  const changed = clone(packet);
  const row = changed.rows.find((entry) => entry.id === 'seat-arona-handbrake-lever-travel-increases');
  row.proposal.title += ' changed';
  row.proposal.status = 'archived';
  rehash(row);
  assert.match(validatePacket(contract, changed, snapshot).join('\n'), /immutable title|immutable status|page became unpublished|deterministic/);
});

test('validator rejects commerce, owner social proof, and search citations', () => {
  const { contract, packet, snapshot } = buildForModel('Arona');
  const changed = clone(packet);
  const row = changed.rows.find((entry) => entry.id === 'seat-arona-handbrake-lever-travel-increases');
  row.proposal.symptoms.push('Reported by 12 owners');
  row.proposal.fixParts.push({ partNumber: 'FAKE' });
  row.proposal.citations[0].url = 'https://www.check-vehicle-recalls.service.gov.uk/recall-type/vehicle/make/SEAT/model/ARONA/year/2017/recalls?lookup=1';
  rehash(row);
  assert.match(validatePacket(contract, changed, snapshot).join('\n'), /owner social proof|commerce drifted|citation is not an exact official source|deterministic/);
});

test('validator rejects DTC and mileage precision hidden in retained prose', () => {
  const { contract, packet, snapshot } = buildForModel('Arona');
  const changed = clone(packet);
  const row = changed.rows.find((entry) => entry.id === 'seat-arona-handbrake-lever-travel-increases');
  row.proposal.description += ' DTC P2002 usually appears at 80,000 miles.';
  rehash(row);
  assert.match(validatePacket(contract, changed, snapshot).join('\n'), /unsupported DTC|unsupported mileage precision|deterministic/);
});

test('SEAT make reconciliation covers all six models and 36 rows', () => {
  const report = buildReconciliation();
  assert.deepEqual(validateReconciliation(report), []);
  assert.deepEqual(report.summary, { models: 6, rows: 36, retained: 1, held: 35, pagesPreservedPublished: 36, authorizedWriteCandidates: 1 });
  assert.deepEqual(report.snapshot.frozenMakeValues, ['SEAT']);
  assert.deepEqual(report.snapshot.frozenMakeCounts, { SEAT: 36 });
});
