const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {
  buildManifest,
} = require('./build-known-issue-deeplink-manifest.js');

const projectRoot = path.resolve(__dirname, '..');

function argValue(flag) {
  const index = process.argv.indexOf(flag);
  if (index < 0 || !process.argv[index + 1]) {
    throw new Error(`Missing ${flag}`);
  }
  return path.resolve(projectRoot, process.argv[index + 1]);
}

function sha256(file) {
  return crypto
    .createHash('sha256')
    .update(fs.readFileSync(file))
    .digest('hex');
}

function reviewedAfter(config, reviewed) {
  const after = reviewed.after || {};
  const contentUpdateSummary = after.summary;
  if (!contentUpdateSummary) {
    throw new Error('Every Buick decision must provide after.summary');
  }
  const normalized = {
    make: config.make,
    model: config.model,
    years: after.years,
    trims: after.trims || [],
    engines: after.engines || [],
    category: after.category,
    title: after.title,
    description: after.description,
    solution: after.solution,
    severity: after.severity,
    confidence: after.confidence,
    symptoms: after.symptoms || [],
    affectedSystems: after.affectedSystems || [],
    dtcCodes: after.dtcCodes || [],
    estimatedCostLow: after.estimatedCostLow ?? null,
    estimatedCostHigh: after.estimatedCostHigh ?? null,
    typicalMileageLow: after.typicalMileageLow ?? null,
    typicalMileageHigh: after.typicalMileageHigh ?? null,
    citations: after.citations || [],
    communityRecommendations: [],
    fixParts: [],
    humanApproved: true,
    reportCount: 0,
    source: after.source || 'manual',
    status: reviewed.disposition === 'remove' ? 'archived' : 'published',
    lastReportedByOwners: '',
    reviewedOn: config.auditDate,
    contentUpdatedOn: config.auditDate,
    contentUpdateSummary,
    relatedIssueIds: [],
  };
  const missing = [
    'years',
    'category',
    'title',
    'description',
    'solution',
    'severity',
    'confidence',
  ].filter((field) => normalized[field] === undefined || normalized[field] === '');
  if (missing.length > 0) {
    throw new Error(`Reviewed Buick after-state is missing: ${missing.join(', ')}`);
  }
  return normalized;
}

function writeJsonAtomic(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  fs.renameSync(temporary, file);
}

function main() {
  const configFile = argValue('--config');
  const snapshotFile = argValue('--snapshot');
  const outputFile = argValue('--output');
  const config = require(configFile);
  const snapshot = JSON.parse(fs.readFileSync(snapshotFile, 'utf8'));
  const decisions = config.expectedIds.map((id) => {
    const reviewed = config.records[id];
    return {
      id,
      disposition: reviewed.disposition,
      decision: reviewed.decision,
      evidence: reviewed.evidence,
      ...reviewedAfter(config, reviewed),
    };
  });
  const manifest = buildManifest(snapshot, {
    schemaVersion: 2,
    auditScope: 'full-record',
    patchKind: 'known-issues-catalog-deeplink-decisions',
    batchId: config.batchId,
    snapshotHash: config.snapshotHash,
    decisions,
  });
  manifest.sourceSnapshotFileHash = config.sourceSnapshotFileHash;
  manifest.packetFileHash = config.packetFileHash;
  manifest.reviewApproval = {
    approvedAfterBlindAndEdgeReview: true,
    approvedOn: config.auditDate,
    blindReviewer: config.reviewTokens.blind,
    edgeReviewer: config.reviewTokens.edge,
    reviewedGeneratorFileHash: sha256(configFile),
  };
  manifest.researchedWith =
    'Ultra-effort current manufacturer/regulator primary-source review; no LLM API and no commerce approval';
  manifest.controlledDeltaProposals = config.controlledDeltaProposals;
  config.assertReviewedAfterState(manifest.issues);
  writeJsonAtomic(outputFile, manifest);
  console.log(
    JSON.stringify(
      {
        output: path.relative(projectRoot, outputFile),
        batchId: manifest.batchId,
        issueCount: manifest.issues.length,
        expectedDispositionCounts: config.expectedDispositionCounts,
      },
      null,
      2,
    ),
  );
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
