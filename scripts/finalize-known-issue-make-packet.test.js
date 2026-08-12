/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {
  claimIdsForRow,
  fullRecordHashes,
  hashValue,
  validateManifest,
} = require('./apply-known-issue-catalog-deeplinks');
const {
  DIAGNOSTIC_ARTIFACT_FILES,
  DIAGNOSTIC_IMPLEMENTATION_FILES,
  PACKET_FILES,
  buildCompletionArtifact,
  buildMakeSource,
  consolidateCandidates,
  finalizePacket,
  sha256File,
  validateMakeSource,
  verifyReviewHashes,
} = require('./finalize-known-issue-make-packet');

test('bound text hashes ignore line-ending checkout style but reject semantic byte changes', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'au7o-canonical-hash-'));
  const file = path.join(directory, 'artifact.json');
  fs.writeFileSync(file, '{\n  "status": "approve"\n}\n', 'utf8');
  const lfHash = sha256File(file);
  fs.writeFileSync(file, '{\r\n  "status": "approve"\r\n}\r\n', 'utf8');
  assert.equal(sha256File(file), lfHash);
  fs.writeFileSync(file, '{\r  "status": "approve"\r}\r', 'utf8');
  assert.equal(sha256File(file), lfHash);
  fs.writeFileSync(file, '{\r\n  "status": "blocked"\r\n}\r\n', 'utf8');
  assert.notEqual(sha256File(file), lfHash);
});

test('review bindings accept CRLF checkouts and reject semantic evidence mutations', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'au7o-review-hash-'));
  const files = [
    '01-disposition-ledger.json',
    '02-fitment-worklist.json',
    '03-showmetheparts-evidence.json',
    '04-part-proposals.json',
    '05-direct-link-evidence.json',
  ];
  for (const [index, file] of files.entries()) {
    fs.writeFileSync(path.join(directory, file), `{\n  "row": ${index}\n}\n`, 'utf8');
  }
  const review = {
    reviewedArtifactSha256: Object.fromEntries(
      files.map((file) => [file, sha256File(path.join(directory, file))]),
    ),
  };
  for (const [index, file] of files.entries()) {
    fs.writeFileSync(path.join(directory, file), `{\r\n  "row": ${index}\r\n}\r\n`, 'utf8');
  }
  assert.deepEqual(verifyReviewHashes(directory, review), review.reviewedArtifactSha256);
  fs.writeFileSync(path.join(directory, files[2]), '{\r\n  "row": 999\r\n}\r\n', 'utf8');
  assert.throws(() => verifyReviewHashes(directory, review), /independent-review SHA-256 mismatch/);
});

function row(id, options = {}) {
  const value = {
    id,
    make: 'Acura',
    model: 'Example',
    years: [2020],
    trims: [],
    engines: ['2.0L I4'],
    category: 'engine',
    title: `Water pump issue ${id}`,
    description: 'The water pump can leak.',
    solution: 'Replace the water pump after confirming the leak.',
    severity: 'medium',
    confidence: 'high',
    symptoms: ['coolant leak'],
    affectedSystems: ['cooling'],
    dtcCodes: options.dtcCodes || [],
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    citations: [{ type: options.legacyCitation ? 'article' : 'manual', title: 'Repair source', url: 'https://example.com/product/12345' }],
    communityRecommendations: [],
    fixParts: options.fixParts || [],
    humanApproved: true,
    reportCount: 0,
    source: 'manual',
    status: 'published',
    lastReportedByOwners: '2026-01-01',
    reviewedOn: '2026-01-01',
    contentUpdatedOn: '',
    contentUpdateSummary: '',
    relatedIssueIds: [],
  };
  value.vehicle = { make: value.make, model: value.model, years: value.years, trims: value.trims, engines: value.engines };
  value.before = { ...fullRecordHashes(value), claimIds: claimIdsForRow(value) };
  value.claims = [];
  value.clicks = 0;
  value.priorityClicks = 0;
  return value;
}

function exactLink(partNumber, item = '123456789012') {
  return { vendor: 'eBay', url: `https://www.ebay.com/itm/${item}?_skw=${partNumber}`, linkType: 'product', verified: true };
}

function fixture() {
  const records = Array.from({ length: 70 }, (_, index) => row(
    `acura-${String(index + 1).padStart(2, '0')}`,
    index === 0 ? { legacyCitation: true, dtcCodes: ['22'] } : index === 1 ? {
      fixParts: [{ component: 'Existing belt kit', oemPartNumber: 'OLD-1', buyLinks: [exactLink('OLD-1', '123456789013')] }],
    } : {},
  ));
  const globalBody = {
    schemaVersion: 2,
    auditScope: 'full-record',
    snapshotKind: 'known-issues-catalog-deeplinks',
    generatedAt: '2026-08-12T12:00:00.000Z',
    source: 'test freeze',
    inventory: { publishedIssueCount: 70 },
    records,
  };
  const global = { ...globalBody, snapshotHash: hashValue(globalBody) };
  const source = buildMakeSource(global, 'Acura');
  const primary = {
    role: 'primary', component: 'Engine Water Pump', supplier: 'Aisin', oemPartNumber: '',
    aftermarketXref: ['ABC-123'], fitment: { years: [2020], engines: ['2.0L I4'] },
    buyLinks: [exactLink('ABC-123')], note: 'Fitment evidence', verified: false,
  };
  const alternate = {
    role: 'alternate', component: 'Engine Water Pump', supplier: 'Other', oemPartNumber: '',
    aftermarketXref: ['ALT-456'], fitment: { years: [2020], engines: ['2.0L I4'] },
    buyLinks: [exactLink('ALT-456', '123456789014')], note: 'Alternate', verified: false,
  };
  const held = {
    role: 'primary', component: 'Engine Thermostat', supplier: 'Other', oemPartNumber: '',
    aftermarketXref: ['HOLD-1'], fitment: { years: [2020] }, buyLinks: [], note: 'No link', verified: false,
  };
  const proposal = { proposalId: 'proposal-1', id: records[0].id, component: 'water pump', parts: [primary, alternate, held] };
  const ledger = {
    snapshotHash: source.snapshotHash,
    issueCount: 70,
    issues: records.map((record, index) => ({
      issueId: record.id,
      disposition: index < 2 ? 'buyable' : 'no-commerce',
      workItemIds: index === 0 ? ['work-1'] : index === 1 ? ['existing-1'] : [],
    })),
  };
  const worklist = {
    snapshotHash: source.snapshotHash,
    issueCount: 70,
    componentApplicationCount: 2,
    entries: [
      { workItemId: 'work-1', issueId: records[0].id, source: 'prescription' },
      { workItemId: 'existing-1', issueId: records[1].id, source: 'existing-fix-part' },
    ],
  };
  const evidence = { complete: true, progress: '2/2', results: [{ workItemId: 'work-1' }, { workItemId: 'existing-1' }] };
  const proposals = { count: 1, proposals: [{ ...proposal, parts: proposal.parts.map((part) => ({ ...part, buyLinks: [] })) }] };
  const links = { count: 1, proposals: [proposal] };
  const review = {
    schemaVersion: 2,
    artifactKind: 'known-issue-part-independent-review',
    snapshotHash: source.snapshotHash,
    reviewedArtifacts: [
      '01-disposition-ledger.json', '02-fitment-worklist.json', '03-showmetheparts-evidence.json',
      '04-part-proposals.json', '05-direct-link-evidence.json',
    ],
    decisions: [
      { proposalId: 'proposal-1', issueId: records[0].id, partIndex: 0, partNumber: 'ABC-123', decision: 'approve', reason: 'Approved exact primary.', reviewedSourceEvidence: { directLink: 'Exact ABC-123 product link.' } },
      { proposalId: 'proposal-1', issueId: records[0].id, partIndex: 1, partNumber: 'ALT-456', decision: 'approve', reason: 'Approved alternate.', reviewedSourceEvidence: { directLink: 'Exact ALT-456 product link.' } },
      { proposalId: 'proposal-1', issueId: records[0].id, partIndex: 2, partNumber: 'HOLD-1', decision: 'hold_no_exact_link', reason: 'No exact link.', reviewedSourceEvidence: { directLink: 'No exact link.' } },
    ],
    reconciliation: { complete: true, sourcePartRowCount: 3, reviewedPartRowCount: 3, missing: [], duplicates: [] },
    existingClaimWorkRowCount: 1,
    existingClaims: [{ workItemId: 'existing-1', issueId: records[1].id, partNumber: 'OLD-1', verdict: 'block', reason: 'Existing claim needs explicit removal.' }],
  };
  const hold = {
    issueId: records[0].id,
    procedure: 'scan-codes',
    excerpt: '22',
    reasonCode: 'manufacturer-code-capability-unverified',
    toolId: null,
    productUrl: null,
  };
  const diagnosticSummary = {
    issueWithDtcCount: 1,
    uniqueDtcCount: 1,
    instructionCount: 0,
    dtcDispositionCount: 1,
    toolLinkedCount: 0,
    procedureNoToolCount: 0,
    unresolvedToolHoldCount: 1,
  };
  const classification = {
    schemaVersion: 1,
    artifactKind: 'known-issue-part-classification-ledger',
    snapshotHash: source.snapshotHash,
    make: 'Acura',
    makeKey: 'acura',
    makeIndex: 0,
    totalMakes: 54,
    issueCount: 70,
    counts: { buyable: 2, 'diagnosis-dependent': 0, 'recall/dealer': 0, 'service/tool/fluid': 0, 'no-commerce': 68 },
    diagnosticSummary,
    unclassifiedCount: 0,
    zeroUnclassified: true,
    rows: records.map((record, index) => ({
      issueId: record.id,
      dtcCodes: record.dtcCodes,
      diagnosticDispositions: index === 0 ? [{
        source: 'dtcCodes',
        status: 'unresolved-tool-hold',
        procedure: hold.procedure,
        toolId: hold.toolId,
        productUrl: hold.productUrl,
        reasonCode: hold.reasonCode,
        excerpt: hold.excerpt,
      }] : [],
    })),
  };
  const classificationHash = '7'.repeat(64);
  const checkpoint = {
    schemaVersion: 1,
    artifactKind: 'known-issue-part-audit-checkpoint',
    status: 'IN_PROGRESS',
    stage: 'DIAGNOSTIC_DISPOSITION_RECONCILED',
    snapshotHash: source.snapshotHash,
    make: 'Acura',
    makeKey: 'acura',
    makeIndex: 0,
    totalMakes: 54,
    issueCount: 70,
    diagnosticSummary,
    unclassifiedCount: 0,
    zeroUnclassified: true,
    ledgerFile: 'classification-ledger.json',
    ledgerHash: classificationHash,
  };
  const diagnosticEvidence = {
    schemaVersion: 1,
    artifactKind: 'known-issue-diagnostic-tool-evidence',
    snapshotHash: source.snapshotHash,
    make: 'Acura',
    status: 'IN_PROGRESS',
    scope: {
      issueCount: 70,
      issuesWithDtcCodes: 1,
      uniqueDtcCount: 1,
      solutionInstructionCount: 0,
      dtcDispositionCount: 1,
      toolLinkedDispositionCount: 0,
      procedureNoToolDispositionCount: 0,
      unresolvedToolHoldCount: 1,
      uncoveredDiagnosticInstructionCount: 0,
    },
    acuraToolLinks: [],
    reusableReviewedTools: [],
    holds: [hold],
  };
  const inputSha256 = Object.fromEntries(
    [...PACKET_FILES.slice(0, 7), ...DIAGNOSTIC_ARTIFACT_FILES]
      .map((file, index) => [file, String((index % 9) + 1).repeat(64)]),
  );
  inputSha256['classification-ledger.json'] = classificationHash;
  const implementationSha256 = Object.fromEntries(
    DIAGNOSTIC_IMPLEMENTATION_FILES.map((file) => [file, 'a'.repeat(64)]),
  );
  return {
    source, ledger, worklist, evidence, proposals, links, review,
    classification, checkpoint, diagnosticEvidence,
    options: { make: 'Acura', inputSha256, implementationSha256 },
  };
}

test('make source is a deterministic exact 70-record subset with full-field proofs', () => {
  const inputs = fixture();
  assert.equal(inputs.source.recordCount, 70);
  assert.equal(inputs.source.recordProvenance.length, 70);
  assert.equal(validateMakeSource(inputs.source, 'Acura'), inputs.source);
  const reorderedBody = {
    schemaVersion: 2,
    auditScope: 'full-record',
    snapshotKind: 'known-issues-catalog-deeplinks',
    generatedAt: inputs.source.globalGeneratedAt,
    source: 'test freeze',
    inventory: { publishedIssueCount: 70 },
    records: [...inputs.source.records].reverse(),
  };
  assert.deepEqual(buildMakeSource({ ...reorderedBody, snapshotHash: hashValue(reorderedBody) }, 'Acura').recordIds, inputs.source.recordIds);
});

test('finalizer selects approved primary only, records holds, and builds a valid keyed manifest', () => {
  const inputs = fixture();
  const result = finalizePacket(inputs, inputs.options);
  assert.equal(result.reconciliation.counts.issueCount, 70);
  assert.equal(result.reconciliation.counts.approvedRows, 2);
  assert.equal(result.reconciliation.counts.selectedPrimaryRows, 1);
  assert.equal(result.reconciliation.counts.excludedApprovedNonPrimaryRows, 1);
  assert.equal(result.reconciliation.counts.heldProposalRows, 1);
  assert.equal(result.reconciliation.counts.blockedExistingClaimRows, 1);
  assert.equal(result.reconciliation.counts.changedIssueCount, 1);
  assert.equal(result.manifest.issues.length, 1);
  assert.deepEqual(validateManifest(result.manifest), []);
  assert.equal(result.manifest.issues[0].after.fixParts.length, 1);
  assert.equal(result.manifest.issues[0].after.fixParts[0].aftermarketXref[0], 'ABC-123');
  assert.equal(result.manifest.issues[0].after.citations[0].type, 'article');
  assert.equal(result.patch.removalProposals[0].applied, false);
  assert.equal(result.patch.status, 'REVIEW_READY_RECONCILED');
  assert.equal(result.patch.makeComplete, true);
  assert.equal(result.patch.productionApplied, false);
  assert.equal(result.reconciliation.diagnosticReconciliation.scope.uncoveredDiagnosticInstructionCount, 0);
  assert.equal(result.reconciliation.diagnosticReconciliation.hold.issueId, 'acura-01');

  const artifactSha256 = Object.fromEntries(
    [...PACKET_FILES, ...DIAGNOSTIC_ARTIFACT_FILES].map((file) => [file, 'b'.repeat(64)]),
  );
  Object.assign(artifactSha256, inputs.options.inputSha256);
  const complete = buildCompletionArtifact({
    source: inputs.source,
    patch: result.patch,
    manifest: result.manifest,
    artifactSha256,
    implementationSha256: inputs.options.implementationSha256,
  });
  assert.equal(complete.status, 'COMPLETE');
  assert.equal(complete.completionState, 'REVIEW_READY_NOT_APPLIED');
  assert.equal(complete.productionApplied, false);
  assert.equal(complete.manifestHash, artifactSha256['08-guarded-manifest.json']);
});

test('overlapping approved variants and non-product links fail closed', () => {
  const inputs = fixture();
  const candidate = {
    proposal: inputs.links.proposals[0],
    part: inputs.links.proposals[0].parts[0],
    review: inputs.review.decisions[0],
  };
  const conflicting = JSON.parse(JSON.stringify(candidate));
  conflicting.review.partNumber = 'CONFLICT-2';
  conflicting.review.partIndex = 9;
  conflicting.part.aftermarketXref = ['CONFLICT-2'];
  assert.throws(() => consolidateCandidates([candidate, conflicting]), /overlapping approved variants/);

  inputs.links.proposals[0].parts[0].buyLinks[0].url = 'https://www.ebay.com/sch/i.html?_nkw=ABC-123';
  assert.throws(() => finalizePacket(inputs, inputs.options), /not a verified product URL/);
});

test('diagnostic mutations fail closed before COMPLETE can be generated', async (t) => {
  await t.test('uncovered diagnostic clause', () => {
    const inputs = fixture();
    inputs.diagnosticEvidence.scope.uncoveredDiagnosticInstructionCount = 1;
    assert.throws(() => finalizePacket(inputs, inputs.options), /uncoveredDiagnosticInstructionCount expected 0/);
  });
  await t.test('missing explicit hold', () => {
    const inputs = fixture();
    inputs.diagnosticEvidence.holds = [];
    assert.throws(() => finalizePacket(inputs, inputs.options), /exactly one explicit hold/);
  });
  await t.test('mutated issue set', () => {
    const inputs = fixture();
    inputs.classification.rows[0].issueId = 'wrong-issue';
    assert.throws(() => finalizePacket(inputs, inputs.options), /source\/diagnostic issue IDs set mismatch/);
  });
  await t.test('checkpoint advanced prematurely', () => {
    const inputs = fixture();
    inputs.checkpoint.status = 'COMPLETE';
    assert.throws(() => finalizePacket(inputs, inputs.options), /must remain IN_PROGRESS/);
  });
  await t.test('implementation binding omitted', () => {
    const inputs = fixture();
    delete inputs.options.implementationSha256[DIAGNOSTIC_IMPLEMENTATION_FILES[0]];
    assert.throws(() => finalizePacket(inputs, inputs.options), /diagnostic implementation files set mismatch/);
  });
});
