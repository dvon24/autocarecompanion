/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Read-only inventory/export and catalog decision reconciliation.
 *
 *   node scripts/audit-known-issue-catalog-deeplinks.js --export
 *   node scripts/audit-known-issue-catalog-deeplinks.js --reconcile --snapshot data/...json --all
 *   Add --full-reconcile to print every ledger row instead of compact counts/samples.
 */
const fs = require('fs');
const path = require('path');
const {
  FULL_RECORD_FIELDS,
  beforeHashes,
  claimIdsForRow,
  fullRecordHashes,
  fullRecordSnapshot,
  hashValue,
  isFullRecordManifest,
  loadManifests,
  productUrlError,
  recommendationHasCommerce,
  validateManifest,
} = require('./apply-known-issue-catalog-deeplinks');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DEFAULT_SNAPSHOT = path.join(PROJECT_ROOT, 'data', 'known-issues-catalog-deeplink-snapshot.json');
const URL_FIELDS = ['affiliateUrl', 'affiliateLink', 'amazonLink'];

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizePart(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function clickKey(issueId, value) {
  return `${issueId}||${String(value || '').trim()}`;
}

function linksForPart(part) {
  return asArray(part && part.buyLinks).map((link, index) => ({
    field: `buyLinks:${index}`,
    vendor: link.vendor || '',
    url: link.url || '',
    linkType: link.linkType || '',
    verified: link.verified === true,
    error: productUrlError(link.url || ''),
  }));
}

function linksForRecommendation(rec) {
  return URL_FIELDS.flatMap((field) => typeof rec[field] === 'string' && rec[field].trim()
    ? [{ field, vendor: field === 'amazonLink' ? 'Amazon' : (rec.partBrand || ''), url: rec[field], error: productUrlError(rec[field]) }]
    : []);
}

function claimsForRow(row, clickStats) {
  const claims = [];
  asArray(row.fixParts).forEach((part, index) => {
    const links = linksForPart(part);
    const linkClicks = links.reduce((sum, link) => sum + (clickStats.byLink.get(clickKey(row.id, link.url)) || 0), 0);
    const partClicks = clickStats.byPart.get(clickKey(row.id, normalizePart(part.component))) || 0;
    claims.push({
      claimId: `fixParts:${index}`,
      system: 'fixParts',
      index,
      component: part.component || '',
      oemPartNumber: part.oemPartNumber || '',
      variants: asArray(part.variants),
      recallFirst: part.recallFirst === true,
      links,
      clicks: Math.max(linkClicks, partClicks),
    });
  });
  asArray(row.communityRecommendations).forEach((rec, index) => {
    if (!recommendationHasCommerce(rec)) return;
    const links = linksForRecommendation(rec);
    const linkClicks = links.reduce((sum, link) => sum + (clickStats.byLink.get(clickKey(row.id, link.url)) || 0), 0);
    const partName = rec.partName || rec.partNumber || rec.content || '';
    const partClicks = clickStats.byPart.get(clickKey(row.id, normalizePart(partName))) || 0;
    claims.push({
      claimId: `communityRecommendations:${index}`,
      system: 'communityRecommendations',
      index,
      type: rec.type || '',
      content: rec.content || '',
      partName: rec.partName || '',
      partBrand: rec.partBrand || '',
      partNumber: rec.partNumber || '',
      links,
      clicks: Math.max(linkClicks, partClicks),
    });
  });
  return claims;
}

function buildClickStats(clicks) {
  const byLink = new Map();
  const byPart = new Map();
  const byIssue = new Map();
  let deepLinkedClicks = 0;
  let nonProductClicks = 0;
  for (const click of clicks) {
    const linkKey = clickKey(click.knownIssueId, click.link);
    const partKey = clickKey(click.knownIssueId, normalizePart(click.partName));
    byLink.set(linkKey, (byLink.get(linkKey) || 0) + 1);
    byPart.set(partKey, (byPart.get(partKey) || 0) + 1);
    byIssue.set(click.knownIssueId, (byIssue.get(click.knownIssueId) || 0) + 1);
    if (click.link && !productUrlError(click.link)) deepLinkedClicks += 1;
    else nonProductClicks += 1;
  }
  return { byLink, byPart, byIssue, totalClicks: clicks.length, deepLinkedClicks, nonProductClicks };
}

function inventoryForRecords(records, clickStats) {
  const claims = records.flatMap((record) => record.claims);
  const links = claims.flatMap((claim) => claim.links);
  const commerceRecords = records.filter((record) => record.claims.length > 0);
  return {
    publishedIssueCount: records.length,
    commerceIssueCount: commerceRecords.length,
    claimCount: claims.length,
    fixPartClaimCount: claims.filter((claim) => claim.system === 'fixParts').length,
    communityClaimCount: claims.filter((claim) => claim.system === 'communityRecommendations').length,
    noLinkClaimCount: claims.filter((claim) => claim.links.length === 0).length,
    linkCount: links.length,
    validProductLinkCount: links.filter((link) => !link.error).length,
    invalidOrSearchLinkCount: links.filter((link) => link.error).length,
    recallFirstClaimCount: claims.filter((claim) => claim.recallFirst).length,
    dtcLinkedCommerceIssueCount: commerceRecords.filter((record) => record.dtcCodes.length > 0).length,
    clickedCommerceIssueCount: commerceRecords.filter((record) => record.clicks > 0).length,
    correctedIssueCount: records.filter((record) => record.contentUpdatedOn && record.contentUpdateSummary).length,
    totalRecordedClicks: clickStats.totalClicks,
    deepLinkedClicks: clickStats.deepLinkedClicks,
    nonProductClicks: clickStats.nonProductClicks,
  };
}

function recordFromRow(row, clickStats) {
  const claims = claimsForRow(row, clickStats);
  return {
    id: row.id,
    ...fullRecordSnapshot(row),
    vehicle: { make: row.make, model: row.model, years: row.years, trims: row.trims, engines: row.engines },
    before: { ...fullRecordHashes(row), claimIds: claimIdsForRow(row) },
    claims,
    clicks: clickStats.byIssue.get(row.id) || 0,
    priorityClicks: claims.reduce((sum, claim) => sum + claim.clicks, 0),
  };
}

function buildSnapshot(rows, clicks, generatedAt = new Date().toISOString()) {
  const clickStats = buildClickStats(clicks);
  const records = rows.map((row) => recordFromRow(row, clickStats)).sort((a, b) => b.priorityClicks - a.priorityClicks || a.id.localeCompare(b.id));
  const body = {
    schemaVersion: 2,
    auditScope: 'full-record',
    snapshotKind: 'known-issues-catalog-deeplinks',
    generatedAt,
    source: 'live published KnownIssue rows plus AffiliateClick aggregates',
    inventory: inventoryForRecords(records, clickStats),
    records,
  };
  return { ...body, snapshotHash: hashValue(body) };
}

function reconcileSnapshot(snapshot, manifests) {
  const expected = new Map();
  const recordById = new Map(asArray(snapshot.records).map((record) => [record.id, record]));
  const expectedIssues = new Map(asArray(snapshot.records).map((record) => [record.id, { issueId: record.id }]));
  for (const record of asArray(snapshot.records)) {
    for (const claim of asArray(record.claims)) expected.set(`${record.id}::${claim.claimId}`, { issueId: record.id, claimId: claim.claimId });
  }
  const covered = new Map();
  const duplicateClaims = [];
  const unknownClaims = [];
  const coveredIssues = new Map();
  const unknownIssues = [];
  const beforeDrift = [];
  const duplicateIssues = [];
  const issueOwners = new Map();
  const dispositions = {};
  let legacyManifestCount = 0;
  let legacyIssueCount = 0;
  for (const wrapper of manifests) {
    const manifest = wrapper.manifest || wrapper;
    const manifestErrors = validateManifest(manifest);
    if (manifestErrors.length) throw new Error(`${manifest.batchId || '<batch>'}: ${manifestErrors.join('; ')}`);
    if (snapshot.schemaVersion >= 2 && !isFullRecordManifest(manifest)) {
      legacyManifestCount += 1;
      legacyIssueCount += asArray(manifest.issues).length;
      continue;
    }
    for (const issue of manifest.issues) {
      if (issueOwners.has(issue.id)) duplicateIssues.push({ issueId: issue.id, batches: [issueOwners.get(issue.id), manifest.batchId] });
      else issueOwners.set(issue.id, manifest.batchId);
      dispositions[issue.disposition] = (dispositions[issue.disposition] || 0) + 1;
      const record = recordById.get(issue.id);
      if (!record) {
        unknownIssues.push({ issueId: issue.id, batchId: manifest.batchId });
        for (const claimId of issue.before.claimIds) unknownClaims.push({ issueId: issue.id, claimId, batchId: manifest.batchId });
        continue;
      }
      coveredIssues.set(issue.id, manifest.batchId);
      const expectedBefore = snapshot.schemaVersion >= 2 ? fullRecordHashes(record) : beforeHashes(record);
      for (const key of Object.keys(expectedBefore)) {
        if (expectedBefore[key] !== issue.before[key]) beforeDrift.push({ issueId: issue.id, field: key, batchId: manifest.batchId });
      }
      for (const claimId of issue.before.claimIds) {
        const key = `${issue.id}::${claimId}`;
        if (!expected.has(key)) unknownClaims.push({ issueId: issue.id, claimId, batchId: manifest.batchId });
        else if (covered.has(key)) duplicateClaims.push({ issueId: issue.id, claimId, batches: [covered.get(key), manifest.batchId] });
        else covered.set(key, manifest.batchId);
      }
    }
  }
  const missingClaims = [...expected.entries()].filter(([key]) => !covered.has(key)).map(([, value]) => value);
  const missingIssues = [...expectedIssues.entries()].filter(([key]) => !coveredIssues.has(key)).map(([, value]) => value);
  return {
    snapshotHash: snapshot.snapshotHash,
    expectedIssueCount: expectedIssues.size,
    coveredIssueCount: coveredIssues.size,
    expectedClaimCount: expected.size,
    coveredClaimCount: covered.size,
    missingIssues,
    missingClaims,
    unknownIssues,
    duplicateClaims,
    unknownClaims,
    duplicateIssues,
    beforeDrift,
    dispositions,
    legacyManifestCount,
    legacyIssueCount,
    zeroUnclassified: missingIssues.length === 0 && missingClaims.length === 0
      && duplicateClaims.length === 0 && unknownIssues.length === 0 && unknownClaims.length === 0
      && duplicateIssues.length === 0 && beforeDrift.length === 0,
  };
}

function summarizeReconciliation(reconciliation, sampleSize = 10) {
  const summary = { ...reconciliation };
  for (const field of ['missingIssues', 'missingClaims', 'unknownIssues', 'unknownClaims', 'duplicateClaims', 'duplicateIssues', 'beforeDrift']) {
    const rows = asArray(reconciliation[field]);
    delete summary[field];
    summary[`${field}Count`] = rows.length;
    if (rows.length) summary[`${field}Sample`] = rows.slice(0, sampleSize);
  }
  return summary;
}

async function readLiveRows(connectionString) {
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString, max: 2, idleTimeoutMillis: 30000 });
  const client = await pool.connect();
  try {
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const rows = await client.query(
      `SELECT id, make, model, years, trims, engines, category, title, description, solution, severity,
              confidence, symptoms, "affectedSystems", "dtcCodes", "estimatedCostLow", "estimatedCostHigh",
              "typicalMileageLow", "typicalMileageHigh", citations, "communityRecommendations", "fixParts",
              "humanApproved", "reportCount", source, status, "lastReportedByOwners", "reviewedOn",
              "contentUpdatedOn", "contentUpdateSummary", "relatedIssueIds"
         FROM "KnownIssue" WHERE status='published' ORDER BY id`,
    );
    const clicks = await client.query(
      `SELECT "knownIssueId", "partBrand", "partName", link, "recommendationIdx", "clickedAt"
         FROM "AffiliateClick" ORDER BY "clickedAt" DESC`,
    );
    await client.query('COMMIT');
    return { rows: rows.rows, clicks: clicks.rows };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

function argValue(args, flag, fallback) {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

function writeJsonAtomic(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  fs.renameSync(temp, file);
}

function buildWorkPackets(snapshot, cohort = 'clicked', packetSize = 5) {
  if (!['clicked', 'remaining', 'all'].includes(cohort)) throw new Error(`Unknown cohort: ${cohort}`);
  if (!Number.isInteger(packetSize) || packetSize < 1 || packetSize > 100) throw new Error('packet size must be 1-100');
  const eligible = asArray(snapshot.records).filter((record) => {
    if (cohort === 'all') return true;
    if (asArray(record.claims).length === 0) return false;
    if (cohort === 'clicked') return record.clicks > 0;
    if (cohort === 'remaining') return record.clicks === 0;
    return false;
  });
  const packets = [];
  for (let index = 0; index < eligible.length; index += packetSize) {
    const records = eligible.slice(index, index + packetSize);
    packets.push({
      schemaVersion: snapshot.schemaVersion || 1,
      ...(snapshot.auditScope ? { auditScope: snapshot.auditScope } : {}),
      packetKind: 'known-issues-catalog-deeplink-work',
      snapshotHash: snapshot.snapshotHash,
      cohort,
      packetId: `${cohort}-${String(packets.length + 1).padStart(4, '0')}`,
      records,
    });
  }
  return packets;
}

function filterSnapshotRecords(snapshot, filters = {}) {
  const make = String(filters.make || '').trim().toLowerCase();
  const model = String(filters.model || '').trim().toLowerCase();
  if (!make && !model) return snapshot;
  return {
    ...snapshot,
    records: asArray(snapshot.records).filter((record) => {
      const vehicleMake = String(record.make || record.vehicle && record.vehicle.make || '').trim().toLowerCase();
      const vehicleModel = String(record.model || record.vehicle && record.vehicle.model || '').trim().toLowerCase();
      return (!make || vehicleMake === make) && (!model || vehicleModel === model);
    }),
  };
}

function writeWorkPackets(snapshot, cohort, packetSize, baseDir) {
  const packets = buildWorkPackets(snapshot, cohort, packetSize);
  const dir = path.join(baseDir, snapshot.snapshotHash.slice(0, 12));
  for (const packet of packets) writeJsonAtomic(path.join(dir, `${packet.packetId}.json`), packet);
  return { directory: path.relative(PROJECT_ROOT, dir), packetCount: packets.length, issueCount: packets.reduce((sum, packet) => sum + packet.records.length, 0) };
}

async function main() {
  const args = process.argv.slice(2);
  let snapshot;
  let snapshotFile;
  if (args.includes('--export')) {
    require('dotenv').config({ path: path.join(PROJECT_ROOT, '.env.local') });
    const connectionString = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;
    if (!connectionString) throw new Error('No POSTGRES_PRISMA_URL or DATABASE_URL set.');
    snapshotFile = path.resolve(PROJECT_ROOT, argValue(args, '--output', path.relative(PROJECT_ROOT, DEFAULT_SNAPSHOT)));
    const live = await readLiveRows(connectionString);
    snapshot = buildSnapshot(live.rows, live.clicks);
    writeJsonAtomic(snapshotFile, snapshot);
  } else {
    snapshotFile = path.resolve(PROJECT_ROOT, argValue(args, '--snapshot', path.relative(PROJECT_ROOT, DEFAULT_SNAPSHOT)));
    if (!fs.existsSync(snapshotFile)) throw new Error(`Snapshot not found: ${snapshotFile}`);
    snapshot = JSON.parse(fs.readFileSync(snapshotFile, 'utf8'));
  }

  const output = { snapshot: path.relative(PROJECT_ROOT, snapshotFile), snapshotHash: snapshot.snapshotHash, inventory: snapshot.inventory };
  if (args.includes('--write-packets')) {
    const cohort = argValue(args, '--write-packets', 'clicked');
    const packetSize = Number.parseInt(argValue(args, '--packet-size', '5'), 10);
    const baseDir = path.resolve(PROJECT_ROOT, argValue(args, '--packets-dir', 'data/known-issues-catalog-deeplink-work'));
    const filters = { make: argValue(args, '--make', ''), model: argValue(args, '--model', '') };
    const workSnapshot = filterSnapshotRecords(snapshot, filters);
    output.workPackets = {
      ...writeWorkPackets(workSnapshot, cohort, packetSize, baseDir),
      filters,
    };
  }
  if (args.includes('--reconcile') || args.includes('--all') || args.includes('--manifest')) {
    const manifests = loadManifests(args);
    const reconciliation = reconcileSnapshot(snapshot, manifests);
    output.reconciliation = args.includes('--full-reconcile')
      ? reconciliation
      : summarizeReconciliation(reconciliation);
    if (!reconciliation.zeroUnclassified) process.exitCode = 2;
  }
  console.log(JSON.stringify(output, null, 2));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

module.exports = {
  FULL_RECORD_FIELDS,
  buildClickStats,
  buildSnapshot,
  buildWorkPackets,
  claimsForRow,
  filterSnapshotRecords,
  inventoryForRecords,
  reconcileSnapshot,
  summarizeReconciliation,
};
