/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {
  applicabilityProseTrimError,
  afterHashes,
  beforeHashes,
  canonicalHash,
  claimIdsForRow,
  evaluateRows,
  filterSupersededLegacyManifests,
  fullRecordHashes,
  fullRecordSnapshot,
  fullRecordUpdateStatement,
  hashValue,
  identityContinuityError,
  isIsoDate,
  loadManifests,
  productUrlError,
  resolveKnownIssueConnectionString,
  run,
  sha256File,
  snapshotFields,
  validateApplyReleaseControl,
  validateMakeReleaseEvidence,
  validateManifest,
  validateResult,
  vendorMatchesUrl,
} = require('./apply-known-issue-catalog-deeplinks');
const {
  COMMERCE_PIPELINE_IMPLEMENTATION_FILES,
  DIAGNOSTIC_IMPLEMENTATION_FILES,
} = require('./known-issue-completion-contract');

test('completion contract binds every release, context, URL, affiliate, and vendor guard', () => {
  for (const file of [
    'scripts/known-issue-completion-contract.js',
    'scripts/finalize-known-issue-make-packet.js',
    'scripts/apply-known-issue-catalog-deeplinks.js',
    'scripts/build-known-issue-part-audit-ledger.js',
    'public/data/ymmt.json',
    'src/lib/external-http-url.ts',
    'src/lib/ebay-affiliate.ts',
    'src/lib/vendor-resolver.ts',
    'src/lib/vendor-link-validator.ts',
  ]) assert.ok(COMMERCE_PIPELINE_IMPLEMENTATION_FILES.includes(file), `unbound critical file ${file}`);
});
const {
  buildSnapshot,
  buildWorkPackets,
  filterSnapshotRecords,
  reconcileSnapshot,
  summarizeReconciliation,
} = require('./audit-known-issue-catalog-deeplinks');

function reviewedBatchManifest(row = baseRow()) {
  const manifest = fullRecordManifest(row, 'reviewed-complete-batch', 'no-commerce');
  manifest.schemaVersion = 3;
  manifest.sourceRef = 'origin/codex/example-audit';
  manifest.sourceCommit = '1'.repeat(40);
  manifest.baselineRef = 'origin/main';
  manifest.baselineCommit = '2'.repeat(40);
  manifest.packetSlug = 'example';
  manifest.make = 'Example';
  manifest.packetCount = 1;
  manifest.packetRowCount = 2;
  manifest.writeRowCount = 1;
  manifest.heldRowCount = 1;
  manifest.packets = [{
    file: 'data/known-issue-example-car-adjudication-2026-08-12.json',
    sha256: '3'.repeat(64),
    model: 'Car',
    summary: { total: 2 },
  }];
  return manifest;
}

test('explicit known-issue env file wins over conflicting ambient database variables', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'known-issue-env-'));
  const envFile = path.join(directory, 'production.env');
  try {
    fs.writeFileSync(envFile, 'DIRECT_URL="postgresql://production.example/audit"\n', 'utf8');
    const resolved = resolveKnownIssueConnectionString({
      KNOWN_ISSUE_ENV_FILE: envFile,
      POSTGRES_PRISMA_URL: 'postgresql://preview.example/audit',
      DATABASE_URL: 'postgresql://ambient.example/audit',
    });
    assert.equal(resolved, 'postgresql://production.example/audit');
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('explicit known-issue env file fails closed when it has no database URL', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'known-issue-env-empty-'));
  const envFile = path.join(directory, 'production.env');
  try {
    fs.writeFileSync(envFile, 'UNRELATED=value\n', 'utf8');
    assert.throws(
      () => resolveKnownIssueConnectionString({
        KNOWN_ISSUE_ENV_FILE: envFile,
        DATABASE_URL: 'postgresql://ambient.example/must-not-be-used',
      }),
      /has no POSTGRES_PRISMA_URL, DATABASE_URL, or DIRECT_URL/,
    );
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

function baseRow(id = 'issue-1') {
  return {
    id,
    make: 'Example',
    model: 'Car',
    years: [2020],
    trims: [],
    engines: ['2.0T'],
    category: 'engine',
    title: 'Water pump leak',
    description: 'The water pump leaks.',
    solution: 'Replace the complete water pump assembly.',
    severity: 'medium',
    confidence: 'high',
    symptoms: ['coolant leak'],
    affectedSystems: ['engine cooling'],
    dtcCodes: ['P0128'],
    citations: [{ type: 'manual', title: 'Parts catalog' }],
    communityRecommendations: [{
      type: 'part',
      content: 'Old search recommendation',
      partName: 'Water pump',
      affiliateUrl: 'https://www.amazon.com/s?k=wrong',
    }],
    fixParts: [],
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    humanApproved: false,
    reportCount: 0,
    source: 'manual',
    status: 'published',
    lastReportedByOwners: '',
    reviewedOn: '',
    contentUpdatedOn: '',
    contentUpdateSummary: '',
    relatedIssueIds: [],
  };
}

function fullRecordManifest(row = baseRow(), batchId = 'full-batch', disposition = 'replace') {
  const after = {
    ...fullRecordSnapshot(row),
    communityRecommendations: [],
    fixParts: disposition === 'no-commerce' ? [] : [{
      component: 'Complete water pump assembly — quantity 1',
      oemPartNumber: '06H121026',
      aftermarketXref: [],
      note: 'Quantity 1; verify the vehicle build before ordering.',
      buyLinks: [{ vendor: 'eBay', url: 'https://www.ebay.com/itm/123456789012', linkType: 'product', verified: true }],
      variants: [],
      verified: true,
    }],
    humanApproved: true,
    reviewedOn: '2026-07-17',
    contentUpdatedOn: '2026-07-17',
    contentUpdateSummary: 'Completed the full record, evidence, and repair-link audit.',
  };
  return {
    schemaVersion: 2,
    auditScope: 'full-record',
    manifestKind: 'known-issues-catalog-deeplinks',
    batchId,
    issues: [{
      id: row.id,
      disposition,
      decision: 'Reviewed and corrected the complete published issue.',
      evidence: [{ label: 'Manual', url: 'https://parts.example.com/product/06H121026' }],
      before: { ...fullRecordHashes(row), claimIds: claimIdsForRow(row) },
      after,
    }],
  };
}

function makeReleaseFixture() {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'known-issue-make-release-'));
  const packetDirectory = path.join(projectRoot, 'packet');
  fs.mkdirSync(packetDirectory, { recursive: true });
  const snapshotHash = '4'.repeat(64);
  const sourceBody = {
    schemaVersion: 2,
    snapshotKind: 'known-issues-catalog-deeplinks',
    auditScope: 'full-record',
    artifactKind: 'known-issue-make-source',
    snapshotHash,
    globalSnapshotHash: snapshotHash,
    make: 'Example',
    makeKey: 'example',
    records: [],
  };
  const source = { ...sourceBody, makeSourceHash: hashValue(sourceBody) };
  const manifest = fullRecordManifest();
  manifest.snapshotHash = snapshotHash;
  manifest.releaseControl = {
    kind: 'make-packet-v1',
    make: 'Example',
    makeKey: 'example',
    makeSourceHash: source.makeSourceHash,
  };
  const requiredArtifacts = [
    '00-make-source.json', '01-disposition-ledger.json', '02-fitment-worklist.json',
    '03-showmetheparts-evidence.json', '04-part-proposals.json', '05-direct-link-evidence.json',
    '06-independent-review.json', '07-decision-patch.json', '08-guarded-manifest.json',
    'classification-ledger.json', 'checkpoint.json', 'diagnostic-tool-evidence.json',
  ];
  for (const file of requiredArtifacts) {
    const value = file === '00-make-source.json' ? source : file === '07-decision-patch.json' ? {
      schemaVersion: 2,
      patchKind: 'known-issues-catalog-deeplink-decisions',
      auditComplete: true,
      makeComplete: true,
      releaseBlocked: false,
      productionApplied: false,
      releaseBlockers: [],
    } : {};
    fs.writeFileSync(path.join(packetDirectory, file), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  }
  const manifestFile = path.join(packetDirectory, '08-guarded-manifest.json');
  fs.writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  for (const implementationFile of new Set([
    ...DIAGNOSTIC_IMPLEMENTATION_FILES,
    ...COMMERCE_PIPELINE_IMPLEMENTATION_FILES,
  ])) {
    const absolute = path.join(projectRoot, implementationFile);
    fs.mkdirSync(path.dirname(absolute), { recursive: true });
    fs.writeFileSync(absolute, `${implementationFile}\n`, 'utf8');
  }
  const artifactSha256 = Object.fromEntries(requiredArtifacts.map((file) => [
    file,
    sha256File(path.join(packetDirectory, file)),
  ]));
  const completionBody = {
    schemaVersion: 2,
    artifactKind: 'known-issue-make-completion',
    status: 'AUDIT_COMPLETE',
    auditComplete: true,
    releaseBlocked: false,
    completionState: 'AUDIT_COMPLETE_RELEASE_READY',
    snapshotHash,
    makeSourceHash: source.makeSourceHash,
    make: 'Example',
    makeKey: 'example',
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
    productionApplied: false,
    productionWriteAuthorized: false,
  };
  const completion = { ...completionBody, completionHash: canonicalHash(completionBody) };
  const completionFile = path.join(packetDirectory, 'COMPLETE.json');
  fs.writeFileSync(completionFile, `${JSON.stringify(completion, null, 2)}\n`, 'utf8');
  const authorization = {
    schemaVersion: 1,
    artifactKind: 'known-issue-make-release-authorization',
    manifestHash: completion.manifestHash,
    completionHash: completion.completionHash,
    snapshotHash,
    gitCommit: '5'.repeat(40),
    baselineCommit: '6'.repeat(40),
    decision: 'APPROVE_RELEASE',
    approver: { type: 'opus', identity: 'test-reviewer' },
    nonce: 'release-test-nonce-0001',
    authorizedAt: '2026-08-12T12:00:00.000Z',
  };
  const authorizationFile = path.join(packetDirectory, 'RELEASE-AUTHORIZATION.json');
  fs.writeFileSync(authorizationFile, `${JSON.stringify(authorization, null, 2)}\n`, 'utf8');
  return {
    projectRoot,
    packetDirectory,
    manifest,
    manifestFile,
    completion,
    completionFile,
    authorization,
    authorizationFile,
    gitReleaseState: () => ({ gitCommit: authorization.gitCommit, baselineCommit: authorization.baselineCommit }),
  };
}

function changedManifest(row = baseRow(), id = 'batch-1') {
  const after = {
    title: row.title,
    years: row.years,
    trims: row.trims,
    engines: row.engines,
    description: row.description,
    solution: row.solution,
    dtcCodes: row.dtcCodes,
    citations: row.citations,
    communityRecommendations: [],
    fixParts: [{
      component: 'Complete water pump assembly',
      oemPartNumber: '06H121026',
      buyLinks: [{ vendor: 'eBay', url: 'https://www.ebay.com/itm/123456789012', linkType: 'product', verified: true }],
      verified: true,
    }],
    contentUpdatedOn: '2026-07-14',
    contentUpdateSummary: 'Corrected the repair part and fitment.',
  };
  return {
    schemaVersion: 1,
    manifestKind: 'known-issues-catalog-deeplinks',
    batchId: id,
    issues: [{
      id: row.id,
      disposition: 'replace',
      decision: 'Replace the search link with an exact product page.',
      evidence: [{ label: 'Catalog', url: 'https://parts.example.com/product/06H121026' }],
      before: { ...beforeHashes(row), claimIds: claimIdsForRow(row) },
      after,
    }],
  };
}

test('date-only validation rejects malformed and normalized dates', () => {
  assert.equal(isIsoDate('2026-07-14'), true);
  assert.equal(isIsoDate('2026-02-30'), false);
  assert.equal(isIsoDate('07/14/2026'), false);
});

test('product URL validation accepts item pages and rejects search variants', () => {
  assert.equal(productUrlError('https://www.amazon.com/dp/B012345678?tag=au7o-20'), null);
  assert.equal(productUrlError('https://www.ebay.com/itm/123456789012'), null);
  assert.equal(productUrlError('https://www.ebay.co.uk/itm/197173644995'), null);
  assert.match(productUrlError('https://www.amazon.com/gp/search?keywords=06H121026'), /search/);
  assert.match(productUrlError('https://www.ebay.com/sch/i.html?_nkw=06H121026'), /search/);
  assert.match(productUrlError('https://parts.example.com/search-results/06H121026'), /search/);
});

test('vendor validation catches mislabeled marketplace links', () => {
  assert.equal(vendorMatchesUrl('eBay', 'https://www.ebay.com/itm/123456789012'), true);
  assert.equal(vendorMatchesUrl('eBay', 'https://www.ebay.co.uk/itm/197173644995'), true);
  assert.equal(vendorMatchesUrl('Amazon', 'https://www.ebay.com/itm/123456789012'), false);
  assert.equal(vendorMatchesUrl('WheelerFleet', 'https://www.wheelerfleet.com/product/123'), true);
});

test('claim IDs cover every fixPart and commerce-bearing community entry', () => {
  const row = baseRow();
  row.fixParts = [{ component: 'Pump', buyLinks: [] }, { component: 'Seal', buyLinks: [] }];
  row.communityRecommendations.push({ type: 'tip', content: 'No commerce' });
  row.communityRecommendations.push({ type: 'tip', content: 'Linked tip', amazonLink: 'https://www.amazon.com/dp/B012345678' });
  assert.deepEqual(claimIdsForRow(row), ['fixParts:0', 'fixParts:1', 'communityRecommendations:0', 'communityRecommendations:2']);
});

test('a complete changed manifest validates', () => {
  assert.deepEqual(validateManifest(changedManifest()), []);
});

test('schema v3 binds packet provenance and exact batch completeness', () => {
  const manifest = reviewedBatchManifest();
  assert.deepEqual(validateManifest(manifest), []);

  for (const field of ['packetCount', 'packetRowCount', 'writeRowCount', 'heldRowCount']) {
    const mutated = structuredClone(manifest);
    delete mutated[field];
    assert.ok(validateManifest(mutated).some((error) => error.includes(field)), `${field} deletion must reject`);
  }

  const truncated = structuredClone(manifest);
  truncated.issues = [];
  assert.ok(validateManifest(truncated).some((error) => error.includes('writeRowCount')));

  const provenance = structuredClone(manifest);
  provenance.packets[0].summary.total = 1;
  assert.ok(validateManifest(provenance).some((error) => error.includes('packetRowCount')));
});

test('the applicator loader rejects a truncated schema-v3 reviewed batch before DB access', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'known-issue-reviewed-batch-'));
  const file = path.join(directory, 'reviewed.json');
  try {
    const manifest = reviewedBatchManifest();
    manifest.issues = [];
    fs.writeFileSync(file, JSON.stringify(manifest), 'utf8');
    assert.throws(() => loadManifests(['--manifest', file]), /issues must be a non-empty array|writeRowCount/);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('make release evidence recomputes manifest, completion, artifact, snapshot, and git bindings', () => {
  const fixture = makeReleaseFixture();
  try {
    const receipt = validateMakeReleaseEvidence(fixture);
    assert.equal(receipt.manifestHash, fixture.completion.manifestHash);
    assert.equal(receipt.completionHash, fixture.completion.completionHash);
    assert.equal(receipt.decision, 'APPROVE_RELEASE');
    assert.equal(receipt.nonce, fixture.authorization.nonce);
  } finally {
    fs.rmSync(fixture.projectRoot, { recursive: true, force: true });
  }
});

test('a blocked decision patch cannot be escalated by rewriting only COMPLETE and authorization', () => {
  const fixture = makeReleaseFixture();
  const patchFile = path.join(path.dirname(fixture.completionFile), '07-decision-patch.json');
  const patch = JSON.parse(fs.readFileSync(patchFile, 'utf8'));
  patch.makeComplete = false;
  patch.releaseBlocked = true;
  patch.releaseBlockers = [{ type: 'unsafe-existing-claim' }];
  fs.writeFileSync(patchFile, JSON.stringify(patch));
  const completion = JSON.parse(fs.readFileSync(fixture.completionFile, 'utf8'));
  completion.artifactSha256['07-decision-patch.json'] = sha256File(patchFile);
  const body = { ...completion };
  delete body.completionHash;
  completion.completionHash = canonicalHash(body);
  fs.writeFileSync(fixture.completionFile, JSON.stringify(completion));
  const authorization = JSON.parse(fs.readFileSync(fixture.authorizationFile, 'utf8'));
  authorization.completionHash = completion.completionHash;
  fs.writeFileSync(fixture.authorizationFile, JSON.stringify(authorization));
  assert.throws(() => validateMakeReleaseEvidence(fixture), /Decision patch is not/);
});

test('make release evidence fails closed under binding mutations', async (t) => {
  await t.test('artifact bytes drift after completion', () => {
    const fixture = makeReleaseFixture();
    try {
      fs.writeFileSync(path.join(fixture.packetDirectory, '04-part-proposals.json'), '{"mutated":true}\n', 'utf8');
      assert.throws(() => validateMakeReleaseEvidence(fixture), /artifactSha256.*drift/);
    } finally {
      fs.rmSync(fixture.projectRoot, { recursive: true, force: true });
    }
  });

  await t.test('authorization is copied to a different completion hash', () => {
    const fixture = makeReleaseFixture();
    try {
      const authorization = { ...fixture.authorization, completionHash: 'f'.repeat(64) };
      fs.writeFileSync(fixture.authorizationFile, `${JSON.stringify(authorization, null, 2)}\n`, 'utf8');
      assert.throws(() => validateMakeReleaseEvidence(fixture), /completionHash binding mismatch/);
    } finally {
      fs.rmSync(fixture.projectRoot, { recursive: true, force: true });
    }
  });

  await t.test('completion attempts to hash itself', () => {
    const fixture = makeReleaseFixture();
    try {
      const completionBody = { ...fixture.completion };
      delete completionBody.completionHash;
      completionBody.artifactSha256 = { ...completionBody.artifactSha256, 'COMPLETE.json': 'a'.repeat(64) };
      const completion = { ...completionBody, completionHash: canonicalHash(completionBody) };
      fs.writeFileSync(fixture.completionFile, `${JSON.stringify(completion, null, 2)}\n`, 'utf8');
      const authorization = { ...fixture.authorization, completionHash: completion.completionHash };
      fs.writeFileSync(fixture.authorizationFile, `${JSON.stringify(authorization, null, 2)}\n`, 'utf8');
      assert.throws(() => validateMakeReleaseEvidence(fixture), /self-referential COMPLETE\.json/);
    } finally {
      fs.rmSync(fixture.projectRoot, { recursive: true, force: true });
    }
  });

  await t.test('checkout commit differs from authorization', () => {
    const fixture = makeReleaseFixture();
    try {
      fixture.gitReleaseState = () => ({
        gitCommit: '7'.repeat(40),
        baselineCommit: fixture.authorization.baselineCommit,
      });
      assert.throws(() => validateMakeReleaseEvidence(fixture), /checkout does not match/);
    } finally {
      fs.rmSync(fixture.projectRoot, { recursive: true, force: true });
    }
  });

  await t.test('authorization nonce was already consumed', () => {
    const fixture = makeReleaseFixture();
    try {
      const resultsDirectory = path.join(
        fixture.projectRoot,
        'data',
        'known-issues-catalog-deeplink-results',
      );
      fs.mkdirSync(resultsDirectory, { recursive: true });
      fs.writeFileSync(path.join(resultsDirectory, 'prior.json'), JSON.stringify({
        releaseAuthorization: { nonce: fixture.authorization.nonce },
      }), 'utf8');
      assert.throws(() => validateMakeReleaseEvidence(fixture), /nonce was already consumed/);
    } finally {
      fs.rmSync(fixture.projectRoot, { recursive: true, force: true });
    }
  });

  for (const [field, requiredFiles] of [
    ['diagnosticImplementationSha256', DIAGNOSTIC_IMPLEMENTATION_FILES],
    ['commercePipelineImplementationSha256', COMMERCE_PIPELINE_IMPLEMENTATION_FILES],
  ]) {
    for (const mutation of ['missing', 'extra', 'renamed']) {
      await t.test(`${field} rejects a ${mutation} key`, () => {
        const fixture = makeReleaseFixture();
        try {
          const completionBody = JSON.parse(fs.readFileSync(fixture.completionFile, 'utf8'));
          delete completionBody.completionHash;
          const map = { ...completionBody[field] };
          const first = requiredFiles[0];
          if (mutation === 'missing') delete map[first];
          if (mutation === 'extra') map['src/unreviewed-extra.ts'] = 'a'.repeat(64);
          if (mutation === 'renamed') {
            map[`${first}.renamed`] = map[first];
            delete map[first];
          }
          completionBody[field] = map;
          const completion = { ...completionBody, completionHash: canonicalHash(completionBody) };
          fs.writeFileSync(fixture.completionFile, `${JSON.stringify(completion, null, 2)}\n`, 'utf8');
          const authorization = { ...fixture.authorization, completionHash: completion.completionHash };
          fs.writeFileSync(fixture.authorizationFile, `${JSON.stringify(authorization, null, 2)}\n`, 'utf8');
          assert.throws(() => validateMakeReleaseEvidence(fixture), /exact required implementation keys/);
        } finally {
          fs.rmSync(fixture.projectRoot, { recursive: true, force: true });
        }
      });
    }
  }
});

test('--apply refuses before pool creation when release evidence is missing or legacy', async (t) => {
  await t.test('marked make manifest without completion/authorization', async () => {
    const fixture = makeReleaseFixture();
    let poolCreations = 0;
    try {
      await assert.rejects(
        run('apply', ['--manifest', fixture.manifestFile], {
          createPool: () => { poolCreations += 1; },
          resolveConnectionString: () => { throw new Error('database resolution must not run'); },
        }),
        /--completion <file> is required/,
      );
      assert.equal(poolCreations, 0);
    } finally {
      fs.rmSync(fixture.projectRoot, { recursive: true, force: true });
    }
  });

  await t.test('legacy unmarked manifest cannot bypass the make gate', async () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'known-issue-legacy-apply-'));
    const file = path.join(directory, 'legacy.json');
    let poolCreations = 0;
    try {
      fs.writeFileSync(file, JSON.stringify(fullRecordManifest()), 'utf8');
      await assert.rejects(
        run('apply', ['--manifest', file], {
          createPool: () => { poolCreations += 1; },
          resolveConnectionString: () => { throw new Error('database resolution must not run'); },
        }),
        /apply is disabled for legacy or unmarked manifests/,
      );
      assert.equal(poolCreations, 0);
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });

  await t.test('blocked completion fails before database configuration or pool creation', async () => {
    const fixture = makeReleaseFixture();
    let poolCreations = 0;
    let databaseResolutions = 0;
    try {
      const completionBody = { ...fixture.completion };
      delete completionBody.completionHash;
      completionBody.releaseBlocked = true;
      completionBody.completionState = 'AUDIT_COMPLETE_RELEASE_BLOCKED';
      const completion = { ...completionBody, completionHash: canonicalHash(completionBody) };
      fs.writeFileSync(fixture.completionFile, `${JSON.stringify(completion, null, 2)}\n`, 'utf8');
      const authorization = { ...fixture.authorization, completionHash: completion.completionHash };
      fs.writeFileSync(fixture.authorizationFile, `${JSON.stringify(authorization, null, 2)}\n`, 'utf8');
      await assert.rejects(
        run('apply', [
          '--manifest', fixture.manifestFile,
          '--completion', fixture.completionFile,
          '--authorization', fixture.authorizationFile,
        ], {
          projectRoot: fixture.projectRoot,
          gitReleaseState: fixture.gitReleaseState,
          createPool: () => { poolCreations += 1; },
          resolveConnectionString: () => { databaseResolutions += 1; },
        }),
        /not an unapplied, unblocked schema-v2 make completion/,
      );
      assert.equal(databaseResolutions, 0);
      assert.equal(poolCreations, 0);
    } finally {
      fs.rmSync(fixture.projectRoot, { recursive: true, force: true });
    }
  });
});

test('make manifests remain available to dry-run and verify without release authority', () => {
  const fixture = makeReleaseFixture();
  try {
    const loaded = [{ file: fixture.manifestFile, manifest: fixture.manifest }];
    assert.equal(validateApplyReleaseControl('dry-run', ['--manifest', fixture.manifestFile], loaded), null);
    assert.equal(validateApplyReleaseControl('verify', ['--manifest', fixture.manifestFile], loaded), null);
  } finally {
    fs.rmSync(fixture.projectRoot, { recursive: true, force: true });
  }
});

test('make result receipts retain the exact authorized manifest identity', () => {
  const fixture = makeReleaseFixture();
  try {
    const releaseAuthorization = validateMakeReleaseEvidence(fixture);
    const row = { id: fixture.manifest.issues[0].id, ...fixture.manifest.issues[0].after };
    const result = {
      schemaVersion: 2,
      auditScope: 'full-record',
      batchId: fixture.manifest.batchId,
      manifestHash: hashValue(fixture.manifest),
      status: 'applied-and-verified',
      releaseAuthorization,
      issues: [{ id: row.id, afterHashes: fullRecordHashes(row) }],
    };
    assert.deepEqual(validateResult(result, fixture.manifest, [row]), []);
    result.releaseAuthorization.manifestCanonicalHash = 'f'.repeat(64);
    assert.ok(validateResult(result, fixture.manifest, [row]).includes('releaseAuthorization'));
  } finally {
    fs.rmSync(fixture.projectRoot, { recursive: true, force: true });
  }
});

test('a full-record manifest accepts an official investigation citation', () => {
  const manifest = fullRecordManifest();
  manifest.issues[0].after.citations = [{
    type: 'investigation',
    title: 'NHTSA Preliminary Evaluation PE25004',
    url: 'https://static.nhtsa.gov/odi/inv/2025/INOA-PE25004-11072.pdf',
  }];
  assert.deepEqual(validateManifest(manifest), []);
});

test('manifest rejects a search URL masquerading as a product', () => {
  const manifest = changedManifest();
  manifest.issues[0].after.fixParts[0].buyLinks[0].url = 'https://www.ebay.com/sch/i.html?_nkw=06H121026';
  assert.ok(validateManifest(manifest).some((error) => /search/.test(error)));
});

test('recall-first and non-commerce dispositions reject retail links', () => {
  const manifest = changedManifest();
  manifest.issues[0].disposition = 'recall-dealer';
  manifest.issues[0].after.fixParts[0].recallFirst = true;
  const errors = validateManifest(manifest);
  assert.ok(errors.some((error) => /recall-first/.test(error)));
  assert.ok(errors.some((error) => /cannot retain commerce/.test(error)));
});

test('meaningful changes require a public correction notice', () => {
  const manifest = changedManifest();
  manifest.issues[0].after.contentUpdatedOn = '';
  manifest.issues[0].after.contentUpdateSummary = '';
  assert.ok(validateManifest(manifest).some((error) => /correction date/.test(error)));
});

test('schema v2 requires every public field plus published human approval', () => {
  const missingField = fullRecordManifest();
  delete missingField.issues[0].after.affectedSystems;
  assert.ok(validateManifest(missingField).some((error) => /missing after\.affectedSystems/.test(error)));

  const notApproved = fullRecordManifest();
  notApproved.issues[0].after.humanApproved = false;
  assert.ok(validateManifest(notApproved).some((error) => /humanApproved/.test(error)));

  const notPublished = fullRecordManifest();
  notPublished.issues[0].after.status = 'pending_review';
  assert.ok(validateManifest(notPublished).some((error) => /status must remain published/.test(error)));
});

test('schema v2 grandfathers only byte-preserved legacy citation types', () => {
  const row = baseRow();
  row.citations = [{ type: 'article', title: 'Legacy published source', url: 'https://example.com/product/12345' }];
  const unchanged = fullRecordManifest(row);
  assert.deepEqual(validateManifest(unchanged), []);

  const changed = fullRecordManifest(row);
  changed.issues[0].after.citations = [
    ...changed.issues[0].after.citations,
    { type: 'article', title: 'New unsupported source', url: 'https://example.com/product/67890' },
  ];
  assert.ok(validateManifest(changed).some((error) => /after\.citations\[0\]\.type/.test(error)));
});

test('schema v2 never archives a published issue through the catalog audit', () => {
  const archivedRemoval = fullRecordManifest(baseRow(), 'archive-duplicate', 'remove');
  archivedRemoval.issues[0].after.status = 'archived';
  archivedRemoval.issues[0].after.fixParts = [];
  assert.ok(validateManifest(archivedRemoval).some((error) => /must remain published/.test(error)));

  const archivedReplacement = fullRecordManifest();
  archivedReplacement.issues[0].after.status = 'archived';
  assert.ok(validateManifest(archivedReplacement).some((error) => /must remain published/.test(error)));
});

test('schema v2 rejects applicability prose in trims', () => {
  const manifest = fullRecordManifest();
  manifest.issues[0].after.trims = ['Vehicles built February 8-9, 2023; verify by VIN'];
  const errors = validateManifest(manifest);
  assert.ok(errors.some((error) => /literal trim names only/.test(error)));
  assert.match(applicabilityProseTrimError('VIN-specific campaign population'), /applicability prose/);
  assert.equal(applicabilityProseTrimError('SRT Hellcat Redeye Widebody'), null);
});

test('schema v2 rejects title substitution under an existing issue id', () => {
  const row = baseRow('dodge-challenger-clear-coat-peeling');
  row.make = 'Dodge';
  row.model = 'Challenger';
  row.title = 'Clear Coat Peeling';
  const manifest = fullRecordManifest(row);
  manifest.issues[0].after.title = 'Demon Hood Bezel Attachment Recall';
  const errors = validateManifest(manifest);
  assert.ok(errors.some((error) => /cannot rename or substitute/.test(error)));
  assert.match(identityContinuityError(manifest.issues[0]), /create a new issue ID/);
});

test('schema v2 preserves make, model, and category routing identity', () => {
  const manifest = fullRecordManifest();
  manifest.issues[0].after.category = 'transmission';
  assert.ok(validateManifest(manifest).some((error) => /make\/model\/category/.test(error)));
});

test('schema v2 permits commerce only in verified fixPart product links', () => {
  const manifest = fullRecordManifest();
  manifest.issues[0].after.communityRecommendations = [{
    type: 'tip',
    content: 'Duplicate commerce location',
    upvotes: 0,
    affiliateUrl: 'https://www.amazon.com/dp/B012345678',
  }];
  assert.ok(validateManifest(manifest).some((error) => /cannot contain commerce links/.test(error)));
});

test('schema v2 update statement writes every public field with explicit array and json casts', () => {
  const issue = fullRecordManifest().issues[0];
  const statement = fullRecordUpdateStatement(issue);
  assert.equal(statement.values.length, 31);
  assert.match(statement.text, /"years"=\$4::int\[\]/);
  assert.match(statement.text, /"citations"=\$20::jsonb/);
  assert.match(statement.text, /"relatedIssueIds"=\$31::text\[\]/);
  assert.match(statement.text, /"updatedAt"=NOW\(\) WHERE id=\$1$/);
  assert.deepEqual(JSON.parse(statement.values[19]), issue.after.citations);
  assert.deepEqual(statement.values[30], issue.after.relatedIssueIds);
});

test('keep disposition is forbidden from silently changing content', () => {
  const manifest = changedManifest();
  manifest.issues[0].disposition = 'keep';
  assert.ok(validateManifest(manifest).some((error) => /keep disposition/.test(error)));
});

test('state evaluation recognizes before, after, and drift', () => {
  const row = baseRow();
  const manifest = fullRecordManifest(row);
  assert.equal(evaluateRows([row], manifest).state, 'before');
  const after = { id: row.id, ...manifest.issues[0].after };
  assert.equal(evaluateRows([after], manifest).state, 'after');
  assert.equal(evaluateRows([{ ...row, solution: 'Unexpected edit' }], manifest).state, 'drift');
});

test('schema v2 content verification ignores runtime recommendation click telemetry', () => {
  const row = baseRow();
  const manifest = fullRecordManifest(row);
  manifest.issues[0].after.communityRecommendations = [{
    type: 'tip',
    content: 'Swap the suspect component before ordering a replacement.',
    upvotes: 0,
  }];
  const after = {
    id: row.id,
    ...manifest.issues[0].after,
    communityRecommendations: [{
      ...manifest.issues[0].after.communityRecommendations[0],
      clickCount: 1,
    }],
  };
  assert.equal(evaluateRows([after], manifest).state, 'after');
  after.communityRecommendations[0].content = 'Unexpected guidance edit';
  assert.equal(evaluateRows([after], manifest).state, 'drift');
});

const recommendationContentMutations = [
  ['URL', (recommendations) => { recommendations[0].affiliateUrl = 'https://www.amazon.com/dp/B012345678'; }],
  ['content', (recommendations) => { recommendations[0].content = 'Unexpected guidance edit'; }],
  ['add', (recommendations) => { recommendations.push({ type: 'tip', content: 'Unexpected added guidance' }); }],
  ['remove', (recommendations) => { recommendations.splice(0, 1); }],
  ['order', (recommendations) => { recommendations.reverse(); }],
];

for (const [name, mutate] of recommendationContentMutations) {
  test(`schema v2 content verification rejects recommendation ${name} drift`, () => {
    const row = baseRow();
    const manifest = fullRecordManifest(row);
    manifest.issues[0].after.communityRecommendations = [
      { type: 'tip', content: 'First reviewed recommendation.', upvotes: 2 },
      { type: 'tip', content: 'Second reviewed recommendation.', upvotes: 1 },
    ];
    const after = {
      id: row.id,
      ...manifest.issues[0].after,
      communityRecommendations: structuredClone(manifest.issues[0].after.communityRecommendations),
    };
    mutate(after.communityRecommendations);
    assert.equal(evaluateRows([after], manifest).state, 'drift');
  });
}

test('full-record projection preserves invalid Prisma JSON container shapes and rejects them as drift', () => {
  const row = baseRow();
  row.citations = [];
  row.communityRecommendations = [];
  row.fixParts = [];
  const manifest = fullRecordManifest(row, 'json-container-shapes', 'no-commerce');
  const cleanAfter = { id: row.id, ...manifest.issues[0].after };
  const invalidContainers = [{ invalid: true }, null, 'invalid-container', 17];

  for (const field of ['citations', 'communityRecommendations', 'fixParts']) {
    for (const invalidContainer of invalidContainers) {
      const actual = { ...cleanAfter, [field]: invalidContainer };
      assert.deepEqual(fullRecordSnapshot(actual)[field], invalidContainer, `${field} must preserve ${JSON.stringify(invalidContainer)}`);
      assert.equal(evaluateRows([actual], manifest).state, 'drift', `${field} ${JSON.stringify(invalidContainer)} must drift from []`);
    }
  }
});

test('full-record projection preserves invalid typed-array container shapes', () => {
  const row = baseRow();
  const invalidContainers = [{ invalid: true }, null, 'invalid-container', 17];
  for (const field of ['years', 'trims', 'engines', 'symptoms', 'affectedSystems', 'dtcCodes', 'relatedIssueIds']) {
    for (const invalidContainer of invalidContainers) {
      assert.deepEqual(fullRecordSnapshot({ ...row, [field]: invalidContainer })[field], invalidContainer, `${field} must preserve ${JSON.stringify(invalidContainer)}`);
    }
  }
});

test('legacy after-state and result verification ignore only recommendation click telemetry', () => {
  const row = baseRow();
  const manifest = changedManifest(row);
  manifest.issues[0].after.communityRecommendations = [{
    type: 'tip',
    content: 'Confirm the failed component before ordering.',
    upvotes: 0,
  }];
  const cleanAfter = { id: row.id, ...manifest.issues[0].after };
  const currentAfter = {
    ...cleanAfter,
    communityRecommendations: [{ ...cleanAfter.communityRecommendations[0], clickCount: 4 }],
  };
  const result = {
    schemaVersion: manifest.schemaVersion,
    batchId: manifest.batchId,
    manifestHash: hashValue(manifest),
    status: 'applied-and-verified',
    issues: [{ id: row.id, afterHashes: afterHashes(cleanAfter) }],
  };
  assert.equal(evaluateRows([currentAfter], manifest).state, 'after');
  assert.deepEqual(validateResult(result, manifest, [currentAfter]), []);
  currentAfter.communityRecommendations[0].content = 'Unexpected guidance edit';
  assert.equal(evaluateRows([currentAfter], manifest).state, 'drift');
  assert.deepEqual(validateResult(result, manifest, [currentAfter]), [`${row.id}: after hashes`]);
});

test('all-manifest verification skips only fully superseded legacy batches', () => {
  const row = baseRow();
  const full = fullRecordManifest(row);
  const legacy = changedManifest(row, 'legacy-batch');
  const selection = filterSupersededLegacyManifests([
    { file: 'legacy.json', manifest: legacy },
    { file: 'full.json', manifest: full },
  ]);
  assert.deepEqual(selection.superseded, ['legacy-batch']);
  assert.deepEqual(selection.active.map(({ manifest }) => manifest.batchId), [full.batchId]);

  const second = baseRow('issue-2');
  legacy.issues.push(changedManifest(second, 'second').issues[0]);
  assert.throws(
    () => filterSupersededLegacyManifests([
      { file: 'legacy.json', manifest: legacy },
      { file: 'full.json', manifest: full },
    ]),
    /partially superseded/,
  );
});

test('after-state comparison ignores JSON object key order from jsonb', () => {
  const row = baseRow();
  const manifest = changedManifest(row);
  const part = manifest.issues[0].after.fixParts[0];
  const reorderedPart = {
    verified: part.verified,
    buyLinks: part.buyLinks.map((link) => ({ verified: link.verified, linkType: link.linkType, url: link.url, vendor: link.vendor })),
    oemPartNumber: part.oemPartNumber,
    component: part.component,
  };
  const after = { id: row.id, ...manifest.issues[0].after, fixParts: [reorderedPart] };
  assert.equal(evaluateRows([after], manifest).state, 'after');
});

test('a mixed before/after batch fails closed while no-op rows are neutral', () => {
  const one = baseRow('issue-1');
  const two = baseRow('issue-2');
  const first = changedManifest(one, 'mixed');
  const secondDecision = changedManifest(two, 'unused').issues[0];
  first.issues.push(secondDecision);
  const twoAfter = { id: two.id, ...secondDecision.after };
  const evaluation = evaluateRows([one, twoAfter], first);
  assert.equal(evaluation.state, 'drift');
  assert.deepEqual(evaluation.drift, ['mixed before/after state']);
});

test('snapshot inventory and reconciliation prove zero-unclassified coverage', () => {
  const row = baseRow();
  const clicks = [{ knownIssueId: row.id, partName: 'Water pump', link: row.communityRecommendations[0].affiliateUrl }];
  const snapshot = buildSnapshot([row], clicks, '2026-07-14T00:00:00.000Z');
  assert.equal(snapshot.inventory.publishedIssueCount, 1);
  assert.equal(snapshot.inventory.claimCount, 1);
  assert.equal(snapshot.inventory.invalidOrSearchLinkCount, 1);
  const manifest = fullRecordManifest(row);
  const complete = reconcileSnapshot(snapshot, [{ manifest }]);
  assert.equal(complete.zeroUnclassified, true);
  assert.equal(complete.coveredClaimCount, 1);
  manifest.issues[0].before.claimIds = [];
  const missing = reconcileSnapshot(snapshot, [{ manifest }]);
  assert.equal(missing.zeroUnclassified, false);
  assert.equal(missing.missingClaims.length, 1);
  const summary = summarizeReconciliation(missing, 1);
  assert.equal(summary.missingClaimsCount, 1);
  assert.deepEqual(summary.missingClaimsSample, missing.missingClaims);
  assert.equal('missingClaims' in summary, false);
});

test('reconciliation requires a full issue review even when an issue has no commerce claims', () => {
  const commerceRow = baseRow('issue-with-commerce');
  const noCommerceRow = baseRow('issue-without-commerce');
  noCommerceRow.communityRecommendations = [];
  noCommerceRow.fixParts = [];
  const snapshot = buildSnapshot([commerceRow, noCommerceRow], [], '2026-07-17T00:00:00.000Z');

  const commerceManifest = fullRecordManifest(commerceRow, 'commerce-batch');
  const incomplete = reconcileSnapshot(snapshot, [{ manifest: commerceManifest }]);
  assert.equal(incomplete.zeroUnclassified, false);
  assert.equal(incomplete.expectedIssueCount, 2);
  assert.equal(incomplete.coveredIssueCount, 1);
  assert.deepEqual(incomplete.missingIssues, [{ issueId: noCommerceRow.id }]);

  const noCommerceManifest = fullRecordManifest(noCommerceRow, 'no-commerce-batch', 'no-commerce');
  assert.deepEqual(validateManifest(noCommerceManifest), []);

  const complete = reconcileSnapshot(snapshot, [
    { manifest: commerceManifest },
    { manifest: noCommerceManifest },
  ]);
  assert.equal(complete.zeroUnclassified, true);
  assert.equal(complete.coveredIssueCount, 2);
  assert.deepEqual(complete.missingIssues, []);
});

test('snapshot field helper preserves every guarded scope, evidence, and repair field', () => {
  const row = baseRow();
  assert.deepEqual(Object.keys(snapshotFields(row)), [
    'years', 'trims', 'engines', 'description', 'solution', 'dtcCodes', 'citations',
    'communityRecommendations', 'fixParts', 'contentUpdatedOn', 'contentUpdateSummary',
  ]);
});

test('scope, DTC, and citation drift are guarded like repair prose', () => {
  const row = baseRow();
  const manifest = changedManifest(row);
  assert.equal(evaluateRows([{ ...row, dtcCodes: ['P0401'] }], manifest).state, 'drift');
  assert.equal(evaluateRows([{ ...row, engines: ['3.0T'] }], manifest).state, 'drift');
  assert.equal(evaluateRows([{ ...row, citations: [] }], manifest).state, 'drift');
});

test('title corrections are guarded and verified without weakening older manifests', () => {
  const row = baseRow();
  const manifest = changedManifest(row);
  manifest.issues[0].after.title = 'Correct complete water-pump repair';
  assert.deepEqual(validateManifest(manifest), []);
  assert.equal(evaluateRows([row], manifest).state, 'before');
  assert.equal(evaluateRows([{ ...row, ...manifest.issues[0].after }], manifest).state, 'after');
  assert.equal(evaluateRows([{ ...row, title: 'Concurrent headline edit' }], manifest).state, 'drift');

  const legacy = changedManifest(row);
  delete legacy.issues[0].before.titleHash;
  delete legacy.issues[0].after.title;
  assert.deepEqual(validateManifest(legacy), []);
});

test('work packets preserve full scope while separating clicked priority', () => {
  const clicked = baseRow('clicked');
  const quiet = baseRow('quiet');
  const noCommerce = baseRow('no-commerce');
  noCommerce.communityRecommendations = [];
  noCommerce.fixParts = [];
  const snapshot = buildSnapshot(
    [clicked, quiet, noCommerce],
    [{ knownIssueId: clicked.id, partName: 'Water pump', link: clicked.communityRecommendations[0].affiliateUrl }],
    '2026-07-14T00:00:00.000Z',
  );
  const clickedPackets = buildWorkPackets(snapshot, 'clicked', 1);
  const remainingPackets = buildWorkPackets(snapshot, 'remaining', 1);
  const allPackets = buildWorkPackets(snapshot, 'all', 1);
  assert.deepEqual(clickedPackets.map((packet) => packet.records[0].id), ['clicked']);
  assert.deepEqual(remainingPackets.map((packet) => packet.records[0].id), ['quiet']);
  assert.deepEqual(allPackets.map((packet) => packet.records[0].id), ['clicked', 'no-commerce', 'quiet']);
  const filtered = filterSnapshotRecords(snapshot, { make: ' example ', model: 'CAR' });
  assert.equal(filtered.records.length, 3);
  assert.equal(filterSnapshotRecords(snapshot, { make: 'Audi' }).records.length, 0);
  assert.throws(() => buildWorkPackets(snapshot, 'clicked', 0), /packet size/);
});
