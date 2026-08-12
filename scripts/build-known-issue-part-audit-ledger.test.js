/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {
  CLASSIFICATIONS,
  canonicalHash,
  enumerateMakes,
  hashValue,
  runAudit,
  sha256File,
  snapshotBodyHash,
  validateLedger,
} = require('./build-known-issue-part-audit-ledger');
const {
  COMMERCE_PIPELINE_IMPLEMENTATION_FILES,
  DIAGNOSTIC_IMPLEMENTATION_FILES,
} = require('./known-issue-completion-contract');

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

function markComplete(outputRoot, make, snapshotHash, projectRoot) {
  const makeSlug = make.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const directory = path.join(outputRoot, makeSlug, snapshotHash);
  const file = path.join(directory, 'COMPLETE.json');
  const artifactFiles = [
    '00-make-source.json', '01-disposition-ledger.json', '02-fitment-worklist.json',
    '03-showmetheparts-evidence.json', '04-part-proposals.json', '05-direct-link-evidence.json',
    '06-independent-review.json', '07-decision-patch.json', '08-guarded-manifest.json',
    'classification-ledger.json', 'checkpoint.json', 'diagnostic-tool-evidence.json',
  ];
  fs.mkdirSync(directory, { recursive: true });
  const sourceBody = {
    schemaVersion: 2,
    artifactKind: 'known-issue-make-source',
    snapshotHash,
    globalSnapshotHash: snapshotHash,
    make,
    makeKey: make.toLowerCase(),
    records: [],
  };
  const makeSourceHash = hashValue(sourceBody);
  for (const name of artifactFiles) {
    const artifactFile = path.join(directory, name);
    if (!fs.existsSync(artifactFile)) {
      const value = name === '00-make-source.json' ? { ...sourceBody, makeSourceHash } : {};
      fs.writeFileSync(artifactFile, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
    }
  }
  for (const implementationFile of new Set([
    ...DIAGNOSTIC_IMPLEMENTATION_FILES,
    ...COMMERCE_PIPELINE_IMPLEMENTATION_FILES,
  ])) {
    const absolute = path.join(projectRoot, implementationFile);
    fs.mkdirSync(path.dirname(absolute), { recursive: true });
    if (!fs.existsSync(absolute)) fs.writeFileSync(absolute, `${implementationFile}\n`, 'utf8');
  }
  const artifactSha256 = Object.fromEntries(artifactFiles.map((name) => [name, sha256File(path.join(directory, name))]));
  const completionBody = {
    schemaVersion: 2,
    artifactKind: 'known-issue-make-completion',
    status: 'AUDIT_COMPLETE',
    auditComplete: true,
    releaseBlocked: false,
    completionState: 'AUDIT_COMPLETE_RELEASE_READY',
    snapshotHash,
    makeKey: make.toLowerCase(),
    makeSourceHash,
    issueCount: 1,
    manifestFile: '08-guarded-manifest.json',
    manifestHash: artifactSha256['08-guarded-manifest.json'],
    artifactSha256,
    diagnosticImplementationSha256: Object.fromEntries(DIAGNOSTIC_IMPLEMENTATION_FILES.map((implementationFile) => [
      implementationFile,
      sha256File(path.join(projectRoot, implementationFile)),
    ])),
    commercePipelineImplementationSha256: Object.fromEntries(COMMERCE_PIPELINE_IMPLEMENTATION_FILES.map((implementationFile) => [
      implementationFile,
      sha256File(path.join(projectRoot, implementationFile)),
    ])),
    diagnosticScope: { issueCount: 1, uncoveredDiagnosticInstructionCount: 0 },
    productionApplied: false,
    productionWriteAuthorized: false,
  };
  fs.writeFileSync(file, `${JSON.stringify({
    ...completionBody,
    completionHash: canonicalHash(completionBody),
  }, null, 2)}\n`, 'utf8');
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
  markComplete(outputRoot, 'Acura', hash, temp);
  assert.throws(
    () => runAudit({ snapshotPath: file, make: 'Audi', outputRoot, projectRoot: temp }),
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
  markComplete(outputRoot, 'Acura', hash, temp);
  runAudit({ snapshotPath: file, dispositionPath: alfaDisposition, make: 'Alfa Romeo', outputRoot, projectRoot: temp });
  markComplete(outputRoot, 'Alfa Romeo', hash, temp);
  const result = runAudit({ snapshotPath: file, dispositionPath: audiDisposition, make: 'Audi', outputRoot, projectRoot: temp });
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
  const completeFile = markComplete(outputRoot, 'Acura', hash, temp);
  const complete = JSON.parse(fs.readFileSync(completeFile, 'utf8'));
  complete.artifactSha256['08-guarded-manifest.json'] = 'f'.repeat(64);
  fs.writeFileSync(completeFile, JSON.stringify(complete));
  assert.throws(
    () => runAudit({ snapshotPath: file, dispositionPath: alfaDisposition, make: 'Alfa Romeo', outputRoot, projectRoot: temp }),
    /not a valid COMPLETE checkpoint/,
  );
});

test('an independently reconciled prior audit may remain release-blocked without blocking the next make audit', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'au7o-audit-blocked-resume-'));
  const outputRoot = path.join(temp, 'audit');
  const records = [
    record('acura-1', 'Acura', 'Replace the water pump.'),
    record('alfa-1', 'Alfa Romeo', 'Replace the thermostat.'),
  ];
  const { file, hash } = writeSnapshot(temp, records);
  const acuraDisposition = writeDisposition(temp, hash, 'Acura', [records[0]]);
  runAudit({ snapshotPath: file, dispositionPath: acuraDisposition, make: 'Acura', outputRoot });
  const completeFile = markComplete(outputRoot, 'Acura', hash, temp);
  const complete = JSON.parse(fs.readFileSync(completeFile, 'utf8'));
  complete.releaseBlocked = true;
  complete.completionState = 'AUDIT_COMPLETE_RELEASE_BLOCKED';
  const body = { ...complete };
  delete body.completionHash;
  complete.completionHash = canonicalHash(body);
  fs.writeFileSync(completeFile, JSON.stringify(complete));
  const alfaDisposition = writeDisposition(temp, hash, 'Alfa Romeo', [records[1]]);

  const result = runAudit({ snapshotPath: file, dispositionPath: alfaDisposition, make: 'Alfa Romeo', outputRoot, projectRoot: temp });
  assert.equal(result.make, 'Alfa Romeo');
});

test('later-make gating recomputes prior artifact, implementation, and source bindings from disk', async (t) => {
  function setup() {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'au7o-prior-make-drift-'));
    const outputRoot = path.join(temp, 'audit');
    const records = [
      record('acura-1', 'Acura', 'Replace the water pump.'),
      record('alfa-1', 'Alfa Romeo', 'Replace the thermostat.'),
    ];
    const { file, hash } = writeSnapshot(temp, records);
    const dispositionPath = writeDisposition(temp, hash, 'Alfa Romeo', records.filter((item) => item.make === 'Alfa Romeo'));
    const completeFile = markComplete(outputRoot, 'Acura', hash, temp);
    return { temp, outputRoot, file, hash, dispositionPath, completeFile };
  }

  function advance(state) {
    return runAudit({
      snapshotPath: state.file,
      dispositionPath: state.dispositionPath,
      make: 'Alfa Romeo',
      outputRoot: state.outputRoot,
      projectRoot: state.temp,
    });
  }

  await t.test('packet artifact drift', () => {
    const state = setup();
    try {
      const artifact = path.join(state.outputRoot, 'acura', state.hash, '04-part-proposals.json');
      fs.writeFileSync(artifact, '{"mutated":true}\n', 'utf8');
      assert.throws(() => advance(state), /artifactSha256.*drifted on disk/);
    } finally {
      fs.rmSync(state.temp, { recursive: true, force: true });
    }
  });

  await t.test('implementation drift', () => {
    const state = setup();
    try {
      fs.writeFileSync(path.join(state.temp, COMMERCE_PIPELINE_IMPLEMENTATION_FILES[0]), 'mutated\n', 'utf8');
      assert.throws(() => advance(state), /commercePipelineImplementationSha256.*drifted on disk/);
    } finally {
      fs.rmSync(state.temp, { recursive: true, force: true });
    }
  });

  await t.test('source is rebound to different snapshot after completion', () => {
    const state = setup();
    try {
      const directory = path.join(state.outputRoot, 'acura', state.hash);
      const sourceFile = path.join(directory, '00-make-source.json');
      const source = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
      source.snapshotHash = 'f'.repeat(64);
      const { makeSourceHash: ignored, ...sourceBody } = source;
      source.makeSourceHash = hashValue(sourceBody);
      fs.writeFileSync(sourceFile, `${JSON.stringify(source, null, 2)}\n`, 'utf8');
      const completion = JSON.parse(fs.readFileSync(state.completeFile, 'utf8'));
      completion.artifactSha256['00-make-source.json'] = sha256File(sourceFile);
      delete completion.completionHash;
      completion.completionHash = canonicalHash(completion);
      fs.writeFileSync(state.completeFile, `${JSON.stringify(completion, null, 2)}\n`, 'utf8');
      assert.throws(() => advance(state), /make source binding drifted on disk/);
      void ignored;
    } finally {
      fs.rmSync(state.temp, { recursive: true, force: true });
    }
  });

  for (const [field, requiredFiles] of [
    ['diagnosticImplementationSha256', DIAGNOSTIC_IMPLEMENTATION_FILES],
    ['commercePipelineImplementationSha256', COMMERCE_PIPELINE_IMPLEMENTATION_FILES],
  ]) {
    for (const mutation of ['missing', 'extra', 'renamed']) {
      await t.test(`${field} rejects a ${mutation} key`, () => {
        const state = setup();
        try {
          const completion = JSON.parse(fs.readFileSync(state.completeFile, 'utf8'));
          const map = { ...completion[field] };
          const first = requiredFiles[0];
          if (mutation === 'missing') delete map[first];
          if (mutation === 'extra') map['src/unreviewed-extra.ts'] = 'a'.repeat(64);
          if (mutation === 'renamed') {
            map[`${first}.renamed`] = map[first];
            delete map[first];
          }
          completion[field] = map;
          delete completion.completionHash;
          completion.completionHash = canonicalHash(completion);
          fs.writeFileSync(state.completeFile, `${JSON.stringify(completion, null, 2)}\n`, 'utf8');
          assert.throws(() => advance(state), /exact required implementation keys/);
        } finally {
          fs.rmSync(state.temp, { recursive: true, force: true });
        }
      });
    }
  }
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

test('accepts a hash-pinned make source without requiring the giant global snapshot', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'au7o-make-source-audit-'));
  const outputRoot = path.join(temp, 'audit');
  const records = [record('acura-1', 'Acura', 'Replace the water pump.')];
  const { hash } = writeSnapshot(temp, records);
  const body = {
    schemaVersion: 2,
    snapshotKind: 'known-issues-catalog-deeplinks',
    auditScope: 'full-record',
    artifactKind: 'known-issue-make-source',
    snapshotHash: hash,
    globalSnapshotHash: hash,
    make: 'Acura',
    makeKey: 'acura',
    recordCount: records.length,
    recordIds: records.map((item) => item.id),
    recordProvenance: [],
    records,
  };
  const sourceFile = path.join(temp, '00-make-source.json');
  fs.writeFileSync(sourceFile, JSON.stringify({ ...body, makeSourceHash: hashValue(body) }));
  const dispositionPath = writeDisposition(temp, hash, 'Acura', records);

  const result = runAudit({ snapshotPath: sourceFile, dispositionPath, make: 'Acura', outputRoot });
  assert.equal(result.snapshotHash, hash);
  assert.equal(result.issueCount, 1);

  const tampered = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
  tampered.records[0].solution = 'Changed after the make freeze.';
  fs.writeFileSync(sourceFile, JSON.stringify(tampered));
  assert.throws(
    () => runAudit({ snapshotPath: sourceFile, dispositionPath, make: 'Acura', outputRoot }),
    /make source hash mismatch/,
  );
});
