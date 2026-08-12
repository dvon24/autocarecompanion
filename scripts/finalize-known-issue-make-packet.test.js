/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {
  canonicalHash,
  claimIdsForRow,
  fullRecordHashes,
  hashValue,
  validateManifest,
} = require('./apply-known-issue-catalog-deeplinks');
const {
  DIAGNOSTIC_ARTIFACT_FILES,
  DIAGNOSTIC_IMPLEMENTATION_FILES,
  COMMERCE_PIPELINE_IMPLEMENTATION_FILES,
  PACKET_FILES,
  buildCompletionArtifact,
  buildMakeSource,
  consolidateCandidates,
  fitmentValuesMatch,
  finalizePacket,
  reviewedRuntimeContextCovers,
  scopesOverlap,
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
  const observedListingTitle = `${partNumber} exact product`;
  return {
    vendor: 'eBay',
    url: `https://www.ebay.com/itm/${item}?_skw=${partNumber}`,
    linkType: 'product',
    verified: true,
    productIdentity: {
      matchedPartNumber: partNumber,
      productId: item,
      listingTitleHash: crypto.createHash('sha256').update(observedListingTitle).digest('hex'),
      observedListingTitle,
      matchedPartNumberSource: 'listing-title',
      observedPartNumberField: 'title',
      observedPartNumberValue: observedListingTitle,
    },
  };
}

function fixture(recordCount = 70) {
  const records = Array.from({ length: recordCount }, (_, index) => row(
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
    inventory: { publishedIssueCount: recordCount },
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
  const proposal = {
    proposalId: 'work-1', id: records[0].id, component: 'water pump',
    articleScope: { make: 'Acura', model: 'Example' }, parts: [primary, alternate, held],
  };
  const ledger = {
    snapshotHash: source.snapshotHash,
    issueCount: recordCount,
    issues: records.map((record, index) => ({
      issueId: record.id,
      disposition: index < 2 ? 'buyable' : 'no-commerce',
      workItemIds: index === 0 ? ['work-1'] : index === 1 ? ['existing-1'] : [],
    })),
  };
  const worklist = {
    snapshotHash: source.snapshotHash,
    issueCount: recordCount,
    componentApplicationCount: 2,
    entries: [
      { workItemId: 'work-1', issueId: records[0].id, source: 'prescription', model: 'Example' },
      {
        workItemId: 'existing-1', issueId: records[1].id, source: 'existing-fix-part', model: 'Example',
        partNumber: 'OLD-1', declaredEngine: '',
      },
    ],
  };
  const evidence = { complete: true, progress: '2/2', results: [{ workItemId: 'work-1' }, { workItemId: 'existing-1' }] };
  const workItemDispositions = [
    { workItemId: 'existing-1', issueId: records[1].id, verdict: 'hold', reasonCode: 'fitment-confirmed' },
    { workItemId: 'work-1', issueId: records[0].id, verdict: 'proposed', reasonCode: 'eligible-proposal' },
  ];
  const proposals = {
    generatedFrom: ['03-showmetheparts-evidence.json'],
    guardrail: 'Catalog fitment only.',
    count: 1,
    workItemDispositionCount: 2,
    workItemDispositions,
    proposals: [{
      ...JSON.parse(JSON.stringify(proposal)),
      parts: proposal.parts.map((part) => ({ ...JSON.parse(JSON.stringify(part)), buyLinks: [] })),
    }],
  };
  const links = {
    generatedFrom: '04-part-proposals.json',
    guardrail: proposals.guardrail,
    count: 1,
    workItemDispositionCount: 2,
    workItemDispositions: JSON.parse(JSON.stringify(workItemDispositions)),
    proposals: [proposal],
    linkGuardrail: 'Exact product pages only.',
    linkEvidence: proposal.parts.map((part, partIndex) => ({
      proposalId: proposal.proposalId,
      issueId: proposal.id,
      partIndex,
      input: {
        partNumber: part.aftermarketXref[0],
        supplier: part.supplier,
        component: part.component,
        make: proposal.articleScope.make,
        model: proposal.articleScope.model,
        year: part.fitment.years[0],
        engine: part.fitment.engines?.[0],
      },
      result: part.buyLinks.length ? 'exact-product-link' : 'no-exact-product-link',
      links: part.buyLinks,
    })),
  };
  const review = {
    schemaVersion: 2,
    artifactKind: 'known-issue-part-independent-review',
    snapshotHash: source.snapshotHash,
    make: 'Acura',
    proposalCount: 1,
    partRowCount: 3,
    reviewedArtifacts: [
      '01-disposition-ledger.json', '02-fitment-worklist.json', '03-showmetheparts-evidence.json',
      '04-part-proposals.json', '05-direct-link-evidence.json',
    ],
    decisions: [
      { proposalId: 'work-1', issueId: records[0].id, partIndex: 0, partNumber: 'ABC-123', decision: 'approve', reason: 'Approved exact primary.', reviewedSourceEvidence: { howToFix: 'Replace it.', catalog: 'Catalog fitment.', directLink: 'Exact ABC-123 product link.' } },
      { proposalId: 'work-1', issueId: records[0].id, partIndex: 1, partNumber: 'ALT-456', decision: 'approve', reason: 'Approved alternate.', reviewedSourceEvidence: { howToFix: 'Replace it.', catalog: 'Catalog fitment.', directLink: 'Exact ALT-456 product link.' } },
      { proposalId: 'work-1', issueId: records[0].id, partIndex: 2, partNumber: 'HOLD-1', decision: 'hold_no_exact_link', reason: 'No exact link.', reviewedSourceEvidence: { howToFix: 'Replace it.', catalog: 'Catalog fitment.', directLink: 'No exact link.' } },
    ],
    tally: {
      approve: 2, block_wrong_role: 0, block_incomplete_scope: 0,
      block_ambiguous: 0, hold_no_exact_link: 1, hold_needs_manual: 0,
    },
    reconciliation: { complete: true, sourcePartRowCount: 3, reviewedPartRowCount: 3, missing: [], duplicates: [] },
    existingClaimWorkRowCount: 1,
    uniqueExistingClaimCount: 1,
    existingClaimTally: { preserve: 0, block: 1 },
    existingClaims: [{
      workItemId: 'existing-1', issueId: records[1].id, partNumber: 'OLD-1', engineWorkRow: '',
      verdict: 'block', reason: 'Existing claim needs explicit removal.',
      reviewedSourceEvidence: { howToFix: 'Replace the part.', catalog: 'Scope mismatch.', directLink: 'Exact but unsafe.' },
    }],
  };
  const hold = {
    issueId: records[0].id,
    source: 'dtcCodes',
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
    issueCount: recordCount,
    counts: { buyable: 2, 'diagnosis-dependent': 0, 'recall/dealer': 0, 'service/tool/fluid': 0, 'no-commerce': recordCount - 2 },
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
    issueCount: recordCount,
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
      issueCount: recordCount,
      issuesWithDtcCodes: 1,
      uniqueDtcCount: 1,
      solutionInstructionCount: 0,
      dtcDispositionCount: 1,
      toolLinkedDispositionCount: 0,
      procedureNoToolDispositionCount: 0,
      unresolvedToolHoldCount: 1,
      uncoveredDiagnosticInstructionCount: 0,
    },
    makeToolLinks: [],
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
  const commercePipelineImplementationSha256 = Object.fromEntries(
    COMMERCE_PIPELINE_IMPLEMENTATION_FILES.map((file) => [file, 'c'.repeat(64)]),
  );
  return {
    source, ledger, worklist, evidence, proposals, links, review,
    classification, checkpoint, diagnosticEvidence,
    options: {
      make: 'Acura', inputSha256, implementationSha256, commercePipelineImplementationSha256,
      recomputedFitment: { ledger, worklist },
      recomputedProposals: JSON.parse(JSON.stringify(proposals)),
    },
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

test('finalizer selects approved primary but keeps release blocked by unapplied existing claims', () => {
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
  assert.equal(result.patch.status, 'REVIEW_READY_BLOCKED_EXISTING_CLAIMS');
  assert.equal(result.patch.auditComplete, true);
  assert.equal(result.patch.makeComplete, false);
  assert.equal(result.patch.releaseBlocked, true);
  assert.equal(result.patch.productionApplied, false);
  assert.equal(result.reconciliation.diagnosticReconciliation.scope.uncoveredDiagnosticInstructionCount, 0);
  assert.equal(result.reconciliation.diagnosticReconciliation.holds[0].issueId, 'acura-01');

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
    commercePipelineImplementationSha256: inputs.options.commercePipelineImplementationSha256,
  });
  assert.equal(complete.status, 'AUDIT_COMPLETE');
  assert.equal(complete.schemaVersion, 2);
  const { completionHash, ...completionBody } = complete;
  assert.equal(completionHash, canonicalHash(completionBody));
  assert.equal(complete.completionState, 'AUDIT_COMPLETE_RELEASE_BLOCKED');
  assert.equal(complete.releaseBlocked, true);
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

test('finalization derives make coverage from the frozen source rather than Acura constants', () => {
  const inputs = fixture(3);
  const result = finalizePacket(inputs, inputs.options);
  assert.equal(result.reconciliation.counts.issueCount, 3);
  assert.equal(result.reconciliation.issueCoverage.length, 3);
});

test('scope overlap uses runtime-equivalent whole-token fitment matching', () => {
  assert.equal(fitmentValuesMatch('3.5L', '3.5L V6'), true);
  assert.equal(fitmentValuesMatch('AWD', 'SH-AWD'), true);
  assert.equal(fitmentValuesMatch('SE', 'SEL'), false);
  assert.equal(scopesOverlap({ engines: ['3.5L'] }, { engines: ['3.5L V6'] }), true);
  assert.equal(scopesOverlap({ drivetrains: ['AWD'] }, { drivetrains: ['SH-AWD'] }), false);
  assert.equal(scopesOverlap({ trims: ['SE'] }, { trims: ['SEL'] }), false);
});

test('existing-claim review identity is bound beyond a forgeable workItemId', () => {
  const inputs = fixture();
  inputs.review.existingClaims[0].issueId = 'acura-01';
  inputs.review.existingClaims[0].partNumber = 'FAKE-1';
  assert.throws(() => finalizePacket(inputs, inputs.options), /existing-claim review identity mismatch/);
});

test('every fitment work item must terminate in a proposal or an identity-bound hold', () => {
  const inputs = fixture();
  inputs.proposals.workItemDispositions.pop();
  inputs.proposals.workItemDispositionCount -= 1;
  inputs.options.recomputedProposals = JSON.parse(JSON.stringify(inputs.proposals));
  assert.throws(() => finalizePacket(inputs, inputs.options), /do not cover the fitment worklist/);
});

test('04 to 05 permits only exact link additions and their evidence', async (t) => {
  const mutate = (change) => {
    const inputs = fixture();
    change(inputs);
    assert.throws(() => finalizePacket(inputs, inputs.options), /04\/05 structural binding mismatch|link evidence/);
  };
  await t.test('component drift', () => mutate((inputs) => { inputs.links.proposals[0].parts[0].component = 'Wrong'; }));
  await t.test('part-number drift', () => mutate((inputs) => { inputs.links.proposals[0].parts[0].aftermarketXref = ['WRONG']; }));
  await t.test('role drift', () => mutate((inputs) => { inputs.links.proposals[0].parts[0].role = 'alternate'; }));
  await t.test('fitment drift', () => mutate((inputs) => { inputs.links.proposals[0].parts[0].fitment.years = [2019]; }));
  await t.test('scope drift', () => mutate((inputs) => { inputs.links.proposals[0].articleScope.model = 'Other'; }));
  await t.test('part order drift', () => mutate((inputs) => { inputs.links.proposals[0].parts.reverse(); }));
  await t.test('disposition drift', () => mutate((inputs) => { inputs.links.workItemDispositions[0].reasonCode = 'changed'; }));
  await t.test('evidence identity drift', () => mutate((inputs) => { inputs.links.linkEvidence[0].issueId = 'wrong'; }));
});

test('06 review schema, decisions, evidence, and existing claims fail closed', async (t) => {
  const rejects = (change, pattern) => {
    const inputs = fixture();
    change(inputs);
    assert.throws(() => finalizePacket(inputs, inputs.options), pattern);
  };
  await t.test('make', () => rejects((i) => { i.review.make = 'Honda'; }, /schema\/make\/snapshot/));
  await t.test('decision enum', () => rejects((i) => { i.review.decisions[0].decision = 'maybe'; }, /invalid independent-review decision/));
  await t.test('decision reason', () => rejects((i) => { i.review.decisions[0].reason = ''; }, /review reason is required/));
  await t.test('decision evidence', () => rejects((i) => { delete i.review.decisions[0].reviewedSourceEvidence.catalog; }, /catalog is required/));
  await t.test('claim verdict', () => rejects((i) => { i.review.existingClaims[0].verdict = 'delete'; }, /identity mismatch/));
  await t.test('claim reason', () => rejects((i) => { i.review.existingClaims[0].reason = ''; }, /review reason is required/));
});

test('diagnostic holds reconcile as an exact generic zero-or-many set', () => {
  const inputs = fixture();
  inputs.classification.rows[0].diagnosticDispositions = [];
  inputs.classification.rows[0].dtcCodes = [];
  inputs.classification.diagnosticSummary = {
    issueWithDtcCount: 0, uniqueDtcCount: 0, instructionCount: 0, dtcDispositionCount: 0,
    toolLinkedCount: 0, procedureNoToolCount: 0, unresolvedToolHoldCount: 0,
  };
  inputs.checkpoint.diagnosticSummary = { ...inputs.classification.diagnosticSummary };
  Object.assign(inputs.diagnosticEvidence.scope, {
    issuesWithDtcCodes: 0, uniqueDtcCount: 0, dtcDispositionCount: 0, unresolvedToolHoldCount: 0,
  });
  inputs.diagnosticEvidence.holds = [];
  assert.equal(finalizePacket(inputs, inputs.options).reconciliation.diagnosticReconciliation.holds.length, 0);
});

test('reviewed runtime context requires exact nonempty scope and hash-verifiable provenance', () => {
  const inputs = fixture();
  const proposal = inputs.links.proposals[0];
  proposal.articleScope = { make: 'Acura', model: 'Legend', trims: ['L', 'LS', 'GS'] };
  const part = proposal.parts[0];
  part.fitment = { years: [1990], engines: ['2.7L V6 C27A'] };
  const resolver = ({ trim }) => (['L', 'LS'].includes(trim) ? ({
    year: 1990, make: 'Acura', model: 'Legend', trim, engine: '2.7L V6 C27A',
    engineProvenance: {
      artifact: 'package.json', artifactSha256: sha256File(path.join(__dirname, '..', 'package.json')),
      snapshotHash: inputs.source.snapshotHash,
      ymmtArtifact: 'public/data/ymmt.json', ymmtArtifactSha256: sha256File(path.join(__dirname, '..', 'public/data/ymmt.json')),
    },
  }) : { year: 1990, make: 'Acura', model: 'Legend', trim, engine: null });
  assert.equal(reviewedRuntimeContextCovers(inputs.source, proposal, part, resolver), true);
  assert.equal(reviewedRuntimeContextCovers(inputs.source, { ...proposal, articleScope: { ...proposal.articleScope, trims: [] } }, part, resolver), false);
  assert.equal(reviewedRuntimeContextCovers(inputs.source, proposal, part, ({ trim }) => ({ ...resolver({ trim }), engine: '3.0L V6' })), false);
  assert.equal(reviewedRuntimeContextCovers(inputs.source, proposal, part, ({ trim }) => ({
    ...resolver({ trim }), engineProvenance: { ...resolver({ trim }).engineProvenance, artifactSha256: '0'.repeat(64) },
  })), false);
  assert.equal(reviewedRuntimeContextCovers(inputs.source, proposal, part, ({ trim }) => (
    trim === 'LS' ? { year: 1990, make: 'Acura', model: 'Legend', trim, engine: null } : resolver({ trim })
  )), false);
  assert.equal(reviewedRuntimeContextCovers(inputs.source, proposal, { ...part, fitment: { ...part.fitment, years: [1990, 1991] } }, resolver), false);
});

test('review decision identity is bound to proposal and work item', async (t) => {
  await t.test('issue mismatch', () => {
    const inputs = fixture();
    inputs.review.decisions[0].issueId = 'acura-wrong-issue';
    assert.throws(() => finalizePacket(inputs, inputs.options), /review\/proposal\/work-item issueId mismatch/);
  });
  await t.test('model mismatch', () => {
    const inputs = fixture();
    inputs.links.proposals[0].articleScope.model = 'Wrong Model';
    for (const evidence of inputs.links.linkEvidence) evidence.input.model = 'Wrong Model';
    inputs.proposals.proposals[0].articleScope.model = 'Wrong Model';
    inputs.options.recomputedProposals.proposals[0].articleScope.model = 'Wrong Model';
    assert.throws(() => finalizePacket(inputs, inputs.options), /proposal\/work-item model mismatch/);
  });
  await t.test('explicit work item mismatch', () => {
    const inputs = fixture();
    inputs.review.decisions[0].workItemId = 'wrong-work-item';
    assert.throws(() => finalizePacket(inputs, inputs.options), /review workItemId mismatch/);
  });
});

test('arbitrary eBay item with a PN only in query text is rejected', () => {
  const inputs = fixture();
  const link = inputs.links.proposals[0].parts[0].buyLinks[0];
  link.url = 'https://www.ebay.com/itm/999999999999?_skw=ABC-123';
  assert.throws(() => finalizePacket(inputs, inputs.options), /URL item ID does not match resolver evidence/);
});

test('fitment generator drift requires a rebuild before downstream review can finalize', () => {
  const inputs = fixture();
  inputs.options.recomputedFitment = JSON.parse(JSON.stringify(inputs.options.recomputedFitment));
  inputs.options.recomputedFitment.worklist.entries.push({ workItemId: 'new-unreviewed-row' });
  inputs.options.recomputedFitment.worklist.componentApplicationCount += 1;
  assert.throws(() => finalizePacket(inputs, inputs.options), /AUDIT_REBUILD_REQUIRED/);
});

test('dropping an eligible proposal and its review rows cannot disappear from reconciliation', () => {
  const inputs = fixture();
  inputs.proposals.proposals = [];
  inputs.proposals.count = 0;
  inputs.links.proposals = [];
  inputs.links.count = 0;
  inputs.review.decisions = [];
  inputs.review.reconciliation.sourcePartRowCount = 0;
  inputs.review.reconciliation.reviewedPartRowCount = 0;
  assert.throws(() => finalizePacket(inputs, inputs.options), /missing eligible proposals/);
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
    assert.throws(() => finalizePacket(inputs, inputs.options), /unresolved-hold count mismatch/);
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
