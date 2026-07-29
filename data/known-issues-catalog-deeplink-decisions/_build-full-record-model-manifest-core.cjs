const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const {
  FULL_RECORD_FIELDS,
  fullRecordHashes,
  validateManifest,
} = require(path.join(
  root,
  'scripts',
  'apply-known-issue-catalog-deeplinks.js',
));

const array = (value) => (Array.isArray(value) ? value : []);
const has = (object, key) =>
  Object.prototype.hasOwnProperty.call(object || {}, key);
const sha256 = (bytes) =>
  crypto.createHash('sha256').update(bytes).digest('hex');
const fileHash = (file) => sha256(fs.readFileSync(file));
const parsedHash = (value) =>
  crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const cliValue = (name) => {
  const prefix = `${name}=`;
  const argument = process.argv.find((value) => value.startsWith(prefix));
  return argument ? argument.slice(prefix.length) : '';
};

const configArgument = cliValue('--config');
if (!configArgument) {
  throw new Error('Pass --config=<absolute-or-relative-config-file>.');
}
const configPath = path.resolve(process.cwd(), configArgument);
const config = require(configPath);
const coreFileHash = fileHash(__filename);
const configFileHash = fileHash(configPath);
const reviewedGeneratorFileHash = sha256(
  Buffer.concat([
    fs.readFileSync(__filename),
    Buffer.from([0]),
    fs.readFileSync(configPath),
  ]),
);

if (
  !Array.isArray(FULL_RECORD_FIELDS) ||
  FULL_RECORD_FIELDS.length !== 30 ||
  new Set(FULL_RECORD_FIELDS).size !== 30
) {
  throw new Error(
    'Applicator full-record contract is not the reviewed 30-field contract.',
  );
}

const approvedAfterReview = process.argv.includes('--approved-after-review');
const blindReviewer = cliValue('--blind-review');
const edgeReviewer = cliValue('--edge-review');
if (
  !approvedAfterReview ||
  blindReviewer !== config.reviewTokens.blind ||
  edgeReviewer !== config.reviewTokens.edge ||
  cliValue('--reviewed-core-hash') !== coreFileHash ||
  cliValue('--reviewed-config-hash') !== configFileHash
) {
  throw new Error(
    `${config.label} manifest generation requires exact Blind/Edge approval tokens and reviewed core/config SHA-256 values.`,
  );
}

const sourceSnapshotPath = path.join(
  root,
  'data',
  'known-issues-catalog-deeplink-snapshot.json',
);
const packetPath = path.join(root, config.packetRelativePath);
const outDir = path.join(root, 'data', 'known-issues-catalog-deeplink-decisions');
const resultsDir = path.join(
  root,
  'data',
  'known-issues-catalog-deeplink-results',
);

const sourceSnapshotBytes = fs.readFileSync(sourceSnapshotPath);
const packetBytes = fs.readFileSync(packetPath);
if (sha256(sourceSnapshotBytes) !== config.sourceSnapshotFileHash) {
  throw new Error('Source snapshot file SHA-256 mismatch.');
}
if (sha256(packetBytes) !== config.packetFileHash) {
  throw new Error(`Frozen ${config.label} packet file SHA-256 mismatch.`);
}

const sourceSnapshot = JSON.parse(sourceSnapshotBytes.toString('utf8'));
const packet = JSON.parse(packetBytes.toString('utf8'));
if (
  sourceSnapshot.snapshotHash !== config.snapshotHash ||
  packet.snapshotHash !== config.snapshotHash ||
  packet.schemaVersion !== 2 ||
  packet.auditScope !== 'full-record' ||
  packet.packetKind !== 'known-issues-catalog-deeplink-work' ||
  packet.cohort !== 'all' ||
  packet.packetId !== 'all-0001'
) {
  throw new Error(`Frozen ${config.label} source/packet identity mismatch.`);
}
if (
  packet.records.length !== config.expectedIds.length ||
  !packet.records.every(
    (record) =>
      record.make === config.make && record.model === config.model,
  )
) {
  throw new Error(`Frozen ${config.label} packet cohort mismatch.`);
}
const packetIds = packet.records.map((record) => record.id);
if (
  JSON.stringify(packetIds) !== JSON.stringify(config.expectedIds) ||
  JSON.stringify(Object.keys(config.records)) !==
    JSON.stringify(config.expectedIds)
) {
  throw new Error(
    `${config.label} packet order/IDs do not match the reviewed record matrix.`,
  );
}
const sourceRecords = sourceSnapshot.records.filter(
  (record) =>
    record.make === config.make && record.model === config.model,
);
if (JSON.stringify(sourceRecords) !== JSON.stringify(packet.records)) {
  throw new Error(
    `Frozen ${config.label} packet does not exactly match source snapshot order/content.`,
  );
}

const commerceUrlFields = ['affiliateUrl', 'affiliateLink', 'amazonLink'];
function recommendationHasCommerce(recommendation) {
  return Boolean(
    recommendation &&
      (recommendation.type === 'part' ||
        commerceUrlFields.some(
          (field) =>
            typeof recommendation[field] === 'string' &&
            recommendation[field].trim(),
        )),
  );
}
function rawClaims(record) {
  const claims = array(record.fixParts).map((part, index) => ({
    claimId: `fixParts:${index}`,
    urls: array(part && part.buyLinks).map((link) => link.url || ''),
  }));
  array(record.communityRecommendations).forEach((recommendation, index) => {
    if (!recommendationHasCommerce(recommendation)) return;
    claims.push({
      claimId: `communityRecommendations:${index}`,
      urls: commerceUrlFields.flatMap((field) =>
        typeof recommendation[field] === 'string' &&
        recommendation[field].trim()
          ? [recommendation[field]]
          : [],
      ),
    });
  });
  return claims;
}

for (const record of packet.records) {
  const expected = config.expectedPerRecord
    ? config.expectedPerRecord[record.id]
    : null;
  const derived = rawClaims(record);
  const packetClaims = array(record.claims).map((claim) => ({
    claimId: claim.claimId,
    urls: array(claim.links).map((link) => link.url || ''),
  }));
  const claimClicks = array(record.claims).reduce(
    (sum, claim) => sum + (Number(claim.clicks) || 0),
    0,
  );
  if (
    (config.expectedPerRecord && !expected) ||
    JSON.stringify(packetClaims.map((claim) => claim.claimId)) !==
      JSON.stringify(derived.map((claim) => claim.claimId)) ||
    JSON.stringify(array(record.before && record.before.claimIds)) !==
      JSON.stringify(derived.map((claim) => claim.claimId)) ||
    JSON.stringify(packetClaims.flatMap((claim) => claim.urls)) !==
      JSON.stringify(derived.flatMap((claim) => claim.urls)) ||
    (expected &&
      (JSON.stringify(derived.map((claim) => claim.claimId)) !==
        JSON.stringify(expected.claimIds) ||
        JSON.stringify(derived.flatMap((claim) => claim.urls)) !==
          JSON.stringify(expected.urls) ||
        claimClicks !== expected.claimClicks ||
        (Number(record.clicks) || 0) !== expected.recordClicks ||
        (Number(record.priorityClicks) || 0) !== expected.priorityClicks))
  ) {
    throw new Error(
      `Exact per-record commerce/click mapping drifted for ${record.id}.`,
    );
  }
}

const telemetry = {
  claimCount: packet.records.reduce(
    (sum, record) => sum + rawClaims(record).length,
    0,
  ),
  urlCount: packet.records.reduce(
    (sum, record) =>
      sum +
      rawClaims(record).reduce(
        (claimSum, claim) => claimSum + claim.urls.length,
        0,
      ),
    0,
  ),
  claimClickCount: packet.records.reduce(
    (sum, record) =>
      sum +
      array(record.claims).reduce(
        (claimSum, claim) => claimSum + (Number(claim.clicks) || 0),
        0,
      ),
    0,
  ),
  recordClickCount: packet.records.reduce(
    (sum, record) => sum + (Number(record.clicks) || 0),
    0,
  ),
  priorityClickCount: packet.records.reduce(
    (sum, record) => sum + (Number(record.priorityClicks) || 0),
    0,
  ),
};
if (JSON.stringify(telemetry) !== JSON.stringify(config.expectedTelemetry)) {
  throw new Error(
    `Frozen ${config.label} telemetry drifted: ${JSON.stringify(telemetry)}.`,
  );
}

function buildAfter(record, recordConfig) {
  const after = recordConfig.after;
  return {
    make: config.make,
    model: config.model,
    years: after.years,
    trims: after.trims,
    engines: after.engines,
    category: after.category,
    title: after.title,
    description: after.description,
    solution: after.solution,
    severity: after.severity,
    confidence: after.confidence,
    symptoms: after.symptoms,
    affectedSystems: after.affectedSystems,
    dtcCodes: after.dtcCodes,
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    citations: after.citations,
    communityRecommendations: [],
    fixParts: [],
    humanApproved: true,
    reportCount: 0,
    source: after.source,
    status: recordConfig.disposition === 'remove' ? 'archived' : 'published',
    lastReportedByOwners: '',
    reviewedOn: config.auditDate,
    contentUpdatedOn: config.auditDate,
    contentUpdateSummary: `${after.summary}${
      (Number.isInteger(record.reportCount) && record.reportCount > 0) ||
      (typeof record.lastReportedByOwners === 'string' &&
        record.lastReportedByOwners.trim())
        ? ' Removed unsupported seeded owner-report telemetry.'
        : ''
    }`,
    relatedIssueIds: [],
  };
}

const issues = packet.records.map((record) => {
  const recordConfig = config.records[record.id];
  return {
    id: record.id,
    disposition: recordConfig.disposition,
    decision: recordConfig.decision,
    evidence: recordConfig.evidence,
    before: record.before,
    after: buildAfter(record, recordConfig),
  };
});

const actualDispositionCounts = Object.fromEntries(
  Object.keys(config.expectedDispositionCounts).map((disposition) => [
    disposition,
    issues.filter((issue) => issue.disposition === disposition).length,
  ]),
);
if (
  JSON.stringify(actualDispositionCounts) !==
    JSON.stringify(config.expectedDispositionCounts) ||
  issues.filter((issue) => issue.after.status === 'published').length !==
    config.expectedPublished ||
  issues.filter((issue) => issue.after.status === 'archived').length !==
    config.expectedArchived
) {
  throw new Error(
    `${config.label} outcome split drifted: ${JSON.stringify(actualDispositionCounts)}.`,
  );
}
if (
  issues.some(
    (issue) =>
      issue.evidence.length === 0 ||
      issue.after.citations.length === 0 ||
      issue.after.fixParts.length !== 0 ||
      issue.after.communityRecommendations.length !== 0 ||
      issue.after.trims.length !== 0 ||
      issue.after.humanApproved !== true ||
      issue.after.reportCount !== 0 ||
      issue.after.lastReportedByOwners !== '' ||
      issue.after.estimatedCostLow !== null ||
      issue.after.estimatedCostHigh !== null ||
      issue.after.typicalMileageLow !== null ||
      issue.after.typicalMileageHigh !== null ||
      !issue.after.contentUpdateSummary.trim()
  )
) {
  throw new Error(
    `${config.label} evidence, approval, telemetry, cost, mileage, trim or zero-commerce invariant failed.`,
  );
}
config.assertReviewedAfterState(issues);

const proposalIdentities = config.controlledDeltaProposals.map(
  (proposal) => `${proposal.title}::${proposal.sources.join('|')}`,
);
if (
  config.controlledDeltaProposals.length !==
    config.expectedProposalIdentities.length ||
  new Set(proposalIdentities).size !== proposalIdentities.length ||
  JSON.stringify(proposalIdentities) !==
    JSON.stringify(config.expectedProposalIdentities) ||
  config.controlledDeltaProposals.some(
    (proposal) =>
      proposal.disposition !== 'proposal-only' ||
      proposal.insert !== false ||
      proposal.sources.length < 1 ||
      proposal.sources.some(
        (url) => !/^https:\/\/static\.nhtsa\.gov\//.test(url),
      ),
  )
) {
  throw new Error(
    `${config.label} controlled proposal identities drifted or request inserts.`,
  );
}

const manifest = {
  schemaVersion: 2,
  manifestKind: 'known-issues-catalog-deeplinks',
  auditScope: 'full-record',
  batchId: config.batchId,
  snapshotHash: config.snapshotHash,
  sourceSnapshotFileHash: config.sourceSnapshotFileHash,
  packetFileHash: config.packetFileHash,
  reviewApproval: {
    approvedAfterBlindAndEdgeReview: true,
    approvedOn: config.auditDate,
    blindReviewer,
    edgeReviewer,
    reviewedGeneratorFileHash,
  },
  researchedWith:
    'Ultra-effort current manufacturer/regulator primary-source review; no LLM API and no commerce approval',
  controlledDeltaProposals: config.controlledDeltaProposals,
  issues,
};

const contractErrors = validateManifest(manifest);
if (contractErrors.length > 0) {
  throw new Error(
    `${config.label} manifest failed applicator validation: ${contractErrors.join('; ')}`,
  );
}
for (const issue of issues) {
  const hashes = fullRecordHashes(issue.after);
  if (
    Object.keys(hashes).length !== 30 ||
    !FULL_RECORD_FIELDS.every((field) => has(hashes, `${field}Hash`))
  ) {
    throw new Error(
      `${config.label} 30-field after-hash contract failed for ${issue.id}.`,
    );
  }
}

const outPath = path.join(outDir, `${config.batchId}.json`);
const resultPath = path.join(resultsDir, `${config.batchId}.json`);
const manifestText = `${JSON.stringify(manifest, null, 2)}\n`;
const expectedManifestFileHash = sha256(Buffer.from(manifestText));
const expectedParsedManifestHash = parsedHash(manifest);

if (fs.existsSync(resultPath)) {
  const errors = [];
  if (!fs.existsSync(outPath)) {
    errors.push('manifestFileMissing');
  } else {
    const existingManifestBytes = fs.readFileSync(outPath);
    if (sha256(existingManifestBytes) !== expectedManifestFileHash) {
      errors.push('manifestFileHash');
    }
    if (existingManifestBytes.toString('utf8') !== manifestText) {
      errors.push('manifestExactBytes');
    }
    let existingManifest;
    try {
      existingManifest = JSON.parse(existingManifestBytes.toString('utf8'));
    } catch {
      errors.push('manifestParse');
    }
    if (
      existingManifest &&
      parsedHash(existingManifest) !== expectedParsedManifestHash
    ) {
      errors.push('parsedManifestHash');
    }
  }
  let result;
  try {
    result = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
  } catch (error) {
    throw new Error(
      `Existing ${config.label} result is unreadable: ${error.message}`,
    );
  }
  if (result.schemaVersion !== 2) errors.push('schemaVersion');
  if (result.auditScope !== 'full-record') errors.push('auditScope');
  if (result.batchId !== config.batchId) errors.push('batchId');
  if (result.manifestHash !== expectedParsedManifestHash) {
    errors.push('orderSensitiveParsedManifestHash');
  }
  if (result.status !== 'applied-and-verified') errors.push('status');
  if (!['applied', 'already-applied'].includes(result.state)) {
    errors.push('state');
  }
  if (
    typeof result.completedAt !== 'string' ||
    !Number.isFinite(Date.parse(result.completedAt))
  ) {
    errors.push('completedAt');
  }
  const expectedReceipts = issues.map((issue) => ({
    id: issue.id,
    disposition: issue.disposition,
    afterHashes: fullRecordHashes(issue.after),
  }));
  const actualReceipts = array(result.issues).map((issue) => ({
    id: issue.id,
    disposition: issue.disposition,
    afterHashes: issue.afterHashes,
  }));
  if (JSON.stringify(actualReceipts) !== JSON.stringify(expectedReceipts)) {
    errors.push('orderedIssueDispositionsOr30FieldAfterHashes');
  }
  if (errors.length > 0) {
    throw new Error(
      `Existing ${config.label} local manifest/result receipt failed validation: ${errors.join(', ')}.`,
    );
  }
  throw new Error(
    `Validated exact local ${config.label} manifest bytes/hash and applicator result receipt; refusing regeneration.`,
  );
}
if (fs.existsSync(outPath)) {
  throw new Error(
    `Refusing to overwrite an existing ${config.label} manifest; use a new batch ID.`,
  );
}

function fsyncDirectoryBestEffort(directory) {
  let handle;
  try {
    handle = fs.openSync(directory, 'r');
    fs.fsyncSync(handle);
  } catch (error) {
    process.stderr.write(
      `${config.label} manifest directory durability warning: ${error.message}\n`,
    );
  } finally {
    if (handle !== undefined) {
      try {
        fs.closeSync(handle);
      } catch {}
    }
  }
}

const tempPath = `${outPath}.${process.pid}.${crypto.randomUUID()}.tmp`;
let tempHandle;
try {
  tempHandle = fs.openSync(tempPath, 'wx');
  fs.writeFileSync(tempHandle, manifestText, { encoding: 'utf8' });
  fs.fsyncSync(tempHandle);
  fs.closeSync(tempHandle);
  tempHandle = undefined;
  fs.linkSync(tempPath, outPath);
  fsyncDirectoryBestEffort(outDir);
  try {
    fs.unlinkSync(tempPath);
  } catch (cleanupError) {
    process.stderr.write(
      `${config.label} manifest published; temporary-file cleanup warning: ${cleanupError.message}\n`,
    );
  }
} catch (error) {
  if (tempHandle !== undefined) {
    try {
      fs.closeSync(tempHandle);
    } catch {}
  }
  try {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  } catch {}
  throw new Error(
    `Atomic ${config.label} manifest publication failed: ${error.message}`,
  );
}
process.stdout.write(`${outPath}: ${issues.length} issues\n`);
