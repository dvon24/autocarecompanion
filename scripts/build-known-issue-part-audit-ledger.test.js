/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {
  CLASSIFICATIONS,
  enumerateMakes,
  hashValue,
  runAudit,
  snapshotBodyHash,
  validateLedger,
} = require('./build-known-issue-part-audit-ledger');

function record(id, make, solution, extra = {}) {
  return {
    id,
    make,
    model: extra.model || 'Example',
    years: extra.years || [2021],
    trims: extra.trims || [],
    engines: extra.engines || [],
    title: extra.title || id,
    solution,
    dtcCodes: extra.dtcCodes || [],
    claims: extra.claims || [],
  };
}

function writeSnapshot(directory, records) {
  const body = {
    schemaVersion: 2,
    auditScope: 'full-record',
    snapshotKind: 'known-issues-catalog-deeplinks',
    generatedAt: '2026-08-12T00:00:00.000Z',
    source: 'test frozen snapshot',
    records,
  };
  const snapshot = { ...body, snapshotHash: snapshotBodyHash(body) };
  const file = path.join(directory, 'snapshot.json');
  fs.writeFileSync(file, `${JSON.stringify(snapshot, null, 2)}\n`);
  return { file, hash: snapshot.snapshotHash };
}

function writeDisposition(directory, hash, make, records) {
  const file = path.join(directory, `disposition-${make.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`);
  fs.writeFileSync(file, JSON.stringify({
    schemaVersion: 1,
    artifactKind: 'known-issue-make-disposition-ledger',
    snapshotHash: hash,
    make,
    issueCount: records.length,
    issues: records.map((item) => ({
      issueId: item.id,
      disposition: item.disposition || 'no-commerce',
      reason: item.dispositionReason || 'Canonical test disposition.',
      prescriptionCount: 0,
      existingFixPartCount: 0,
      workItemIds: [],
      before: {},
    })),
  }, null, 2));
  return file;
}

function markComplete(outputRoot, make, snapshotHash) {
  const makeSlug = make.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const file = path.join(outputRoot, makeSlug, snapshotHash, 'COMPLETE.json');
  const artifactFiles = [
    '00-make-source.json', '01-disposition-ledger.json', '02-fitment-worklist.json',
    '03-showmetheparts-evidence.json', '04-part-proposals.json', '05-direct-link-evidence.json',
    '06-independent-review.json', '07-decision-patch.json', '08-guarded-manifest.json',
    'classification-ledger.json', 'checkpoint.json', 'diagnostic-tool-evidence.json',
  ];
  const manifestHash = hashValue(`manifest:${make}`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify({
    schemaVersion: 1,
    artifactKind: 'known-issue-make-completion',
    status: 'COMPLETE',
    completionState: 'REVIEW_READY_NOT_APPLIED',
    snapshotHash,
    makeKey: make.toLowerCase(),
    makeSourceHash: hashValue(`source:${make}`),
    issueCount: 1,
    manifestFile: '08-guarded-manifest.json',
    manifestHash,
    artifactSha256: Object.fromEntries(artifactFiles.map((name) => [name, name === '08-guarded-manifest.json' ? manifestHash : hashValue(`${make}:${name}`)])),
    diagnosticImplementationSha256: { 'src/data/diagnostic-tools.ts': hashValue(`tools:${make}`) },
    diagnosticScope: { issueCount: 1, uncoveredDiagnosticInstructionCount: 0 },
    productionApplied: false,
    productionWriteAuthorized: false,
  }));
  return file;
}

test('enumerates makes case-insensitively with Acura first', () => {
  assert.deepEqual(enumerateMakes([
    record('1', 'BMW', ''),
    record('2', 'Audi', ''),
    record('3', 'Alfa Romeo', ''),
    record('4', 'Acura', ''),
    record('5', 'acura', ''),
    record('6', 'Abarth', ''),
  ]), [
    { key: 'acura', make: 'Acura' },
    { key: 'abarth', make: 'Abarth' },
    { key: 'alfa romeo', make: 'Alfa Romeo' },
    { key: 'audi', make: 'Audi' },
    { key: 'bmw', make: 'BMW' },
  ]);
});

test('uses the canonical disposition vocabulary rather than reclassifying with regexes', () => {
  assert.deepEqual(CLASSIFICATIONS, [
    'buyable',
    'diagnosis-dependent',
    'recall/dealer',
    'service/tool/fluid',
    'no-commerce',
  ]);
});

test('requires both snapshot and make inputs', () => {
  assert.throws(() => runAudit({ snapshotPath: '', dispositionPath: '', make: 'Acura' }), /--snapshot is required/);
  assert.throws(() => runAudit({ snapshotPath: 'snapshot.json', dispositionPath: '', make: '' }), /--make is required/);
});

test('refuses to skip any prior make without a valid COMPLETE checkpoint', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'au7o-part-audit-skip-'));
  const outputRoot = path.join(temp, 'audit');
  const records = [
    record('acura-1', 'Acura', 'Replace the water pump.'),
    record('alfa-1', 'Alfa Romeo', 'Replace the thermostat.'),
    record('audi-1', 'Audi', 'Replace the radiator.'),
  ];
  const { file, hash } = writeSnapshot(temp, records);
  const acuraDisposition = writeDisposition(temp, hash, 'Acura', records.filter((item) => item.make === 'Acura'));

  assert.throws(
    () => runAudit({ snapshotPath: file, make: 'Audi', outputRoot }),
    /Acura has no COMPLETE checkpoint/,
  );
  runAudit({ snapshotPath: file, dispositionPath: acuraDisposition, make: 'Acura', outputRoot });
  markComplete(outputRoot, 'Acura', hash);
  assert.throws(
    () => runAudit({ snapshotPath: file, make: 'Audi', outputRoot }),
    /Alfa Romeo has no COMPLETE checkpoint/,
  );
});

test('resumes in order after prior COMPLETE checkpoints', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'au7o-part-audit-resume-'));
  const outputRoot = path.join(temp, 'audit');
  const records = [
    record('acura-1', 'Acura', 'Replace the water pump.'),
    record('alfa-1', 'Alfa Romeo', 'Inspect the circuit before replacing the module.'),
    record('audi-1', 'Audi', 'Flush the coolant.'),
  ];
  const { file, hash } = writeSnapshot(temp, records);
  const acuraDisposition = writeDisposition(temp, hash, 'Acura', records.filter((item) => item.make === 'Acura'));
  const alfaDisposition = writeDisposition(temp, hash, 'Alfa Romeo', records.filter((item) => item.make === 'Alfa Romeo'));
  const audiDisposition = writeDisposition(temp, hash, 'Audi', records.filter((item) => item.make === 'Audi'));

  runAudit({ snapshotPath: file, dispositionPath: acuraDisposition, make: 'Acura', outputRoot });
  markComplete(outputRoot, 'Acura', hash);
  runAudit({ snapshotPath: file, dispositionPath: alfaDisposition, make: 'Alfa Romeo', outputRoot });
  markComplete(outputRoot, 'Alfa Romeo', hash);
  const result = runAudit({ snapshotPath: file, dispositionPath: audiDisposition, make: 'Audi', outputRoot });
  assert.equal(result.make, 'Audi');
  assert.equal(result.makeIndex, 2);
  assert.equal(result.zeroUnclassified, true);
  const checkpoint = JSON.parse(fs.readFileSync(path.join(outputRoot, 'audi', hash, 'checkpoint.json'), 'utf8'));
  assert.equal(checkpoint.status, 'IN_PROGRESS');
  assert.equal(checkpoint.stage, 'DIAGNOSTIC_DISPOSITION_RECONCILED');
});

test('rejects legacy or mutated COMPLETE files for later-make gating', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'au7o-part-audit-complete-contract-'));
  const outputRoot = path.join(temp, 'audit');
  const records = [
    record('acura-1', 'Acura', 'Replace the water pump.'),
    record('alfa-1', 'Alfa Romeo', 'Replace the thermostat.'),
  ];
  const { file, hash } = writeSnapshot(temp, records);
  const alfaDisposition = writeDisposition(temp, hash, 'Alfa Romeo', records.filter((item) => item.make === 'Alfa Romeo'));
  const completeFile = markComplete(outputRoot, 'Acura', hash);
  const complete = JSON.parse(fs.readFileSync(completeFile, 'utf8'));
  complete.artifactSha256['08-guarded-manifest.json'] = 'f'.repeat(64);
  fs.writeFileSync(completeFile, JSON.stringify(complete));
  assert.throws(
    () => runAudit({ snapshotPath: file, dispositionPath: alfaDisposition, make: 'Alfa Romeo', outputRoot }),
    /not a valid COMPLETE checkpoint/,
  );
});

test('writes byte-identical deterministic artifacts on rerun', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'au7o-part-audit-determinism-'));
  const outputRoot = path.join(temp, 'audit');
  const records = [
    record('acura-z', 'Acura', 'Replace the thermostat.', { model: 'ZDX', years: [2012, 2011, 2012] }),
    record('acura-a', 'Acura', 'Read codes and inspect wiring.', {
      model: 'Integra',
      claims: [{ claimId: 'fixParts:2' }, { claimId: 'fixParts:0' }],
    }),
  ];
  const { file, hash } = writeSnapshot(temp, records);
  const dispositionPath = writeDisposition(temp, hash, 'Acura', records);

  runAudit({ snapshotPath: file, dispositionPath, make: 'Acura', outputRoot });
  const directory = path.join(outputRoot, 'acura', hash);
  const firstLedger = fs.readFileSync(path.join(directory, 'classification-ledger.json'), 'utf8');
  const firstCheckpoint = fs.readFileSync(path.join(directory, 'checkpoint.json'), 'utf8');
  runAudit({ snapshotPath: file, dispositionPath, make: 'acura', outputRoot });
  assert.equal(fs.readFileSync(path.join(directory, 'classification-ledger.json'), 'utf8'), firstLedger);
  assert.equal(fs.readFileSync(path.join(directory, 'checkpoint.json'), 'utf8'), firstCheckpoint);

  const ledger = JSON.parse(firstLedger);
  assert.deepEqual(ledger.rows.map((row) => row.issueId), ['acura-a', 'acura-z']);
  assert.deepEqual(ledger.rows[0].existingCommerceClaimIds, ['fixParts:0', 'fixParts:2']);
  assert.deepEqual(ledger.rows[1].years, [2011, 2012]);
});

test('ledger gives every detected diagnostic instruction and DTC set a disposition', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'au7o-diagnostic-ledger-'));
  const outputRoot = path.join(temp, 'audit');
  const records = [
    record('acura-meter', 'Acura', 'Test the ignitor with a digital multimeter before replacing it.'),
    record('acura-codes', 'Acura', 'Pull codes with a scan tool and inspect the connector.', {
      dtcCodes: ['P0700', 'P0730'],
    }),
    record('acura-hold', 'Acura', 'Test the controller before replacing it.'),
  ];
  const { file, hash } = writeSnapshot(temp, records);
  const dispositionPath = writeDisposition(temp, hash, 'Acura', records);

  runAudit({ snapshotPath: file, dispositionPath, make: 'Acura', outputRoot });
  const ledger = JSON.parse(fs.readFileSync(path.join(outputRoot, 'acura', hash, 'classification-ledger.json'), 'utf8'));
  const byId = Object.fromEntries(ledger.rows.map((row) => [row.issueId, row]));
  assert.equal(byId['acura-meter'].diagnosticDispositions[0].toolId, 'fluke-15b-plus');
  assert.ok(byId['acura-codes'].diagnosticDispositions.some((item) => item.toolId === 'ancel-ad310'));
  assert.equal(byId['acura-hold'].diagnosticDispositions[0].status, 'unresolved-tool-hold');
  assert.equal(ledger.diagnosticSummary.issueWithDtcCount, 1);
  assert.equal(ledger.diagnosticSummary.uniqueDtcCount, 2);
  assert.ok(ledger.diagnosticSummary.toolLinkedCount >= 2);
  assert.equal(ledger.diagnosticSummary.unresolvedToolHoldCount, 1);
});

test('zero-unclassified validation rejects missing reason or evidence', () => {
  const bad = {
    rows: [{
      issueId: 'acura-1',
      disposition: 'buyable',
      dispositionReason: '',
      dtcCodes: [],
      diagnosticDispositions: [],
    }],
    counts: { buyable: 1, 'diagnosis-dependent': 0, 'recall/dealer': 0, 'service/tool/fluid': 0, 'no-commerce': 0 },
    diagnosticSummary: {
      issueWithDtcCount: 0,
      uniqueDtcCount: 0,
      instructionCount: 0,
      dtcDispositionCount: 0,
      toolLinkedCount: 0,
      procedureNoToolCount: 0,
      unresolvedToolHoldCount: 0,
    },
    zeroUnclassified: true,
    unclassifiedCount: 0,
  };
  assert.throws(() => validateLedger(bad, ['acura-1']), /unclassified rows/);
});

test('rejects a snapshot whose declared hash no longer matches its body', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'au7o-part-audit-drift-'));
  const outputRoot = path.join(temp, 'audit');
  const { file } = writeSnapshot(temp, [record('acura-1', 'Acura', 'Replace the water pump.')]);
  const snapshot = JSON.parse(fs.readFileSync(file, 'utf8'));
  snapshot.records[0].solution = 'Changed after freeze.';
  fs.writeFileSync(file, JSON.stringify(snapshot, null, 2));
  assert.throws(() => runAudit({ snapshotPath: file, make: 'Acura', outputRoot }), /hash mismatch/);
});
