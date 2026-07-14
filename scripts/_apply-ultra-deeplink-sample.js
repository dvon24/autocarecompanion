#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports -- One-off Node script runs as CommonJS. */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const util = require('util');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(PROJECT_ROOT, 'data', '_ultra-deeplink-sample-decisions.json');
const RESULT_PATH = path.join(PROJECT_ROOT, 'data', '_ultra-deeplink-sample-result.json');
const RESULT_TEMP_PATH = `${RESULT_PATH}.tmp`;
const SEARCH_URL = /(amazon\.com\/s\?|ebay\.com\/sch\/|rockauto\.com\/en\/partsearch)/i;
const SEARCH_QUERY_KEYS = new Set(['q', 'query', 'keyword', 'keywords', 'search', '_nkw']);

function hashValue(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function jsonEqual(left, right) {
  return util.isDeepStrictEqual(left, right);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function isIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  if (!match) return false;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return date.getUTCFullYear() === Number(match[1])
    && date.getUTCMonth() === Number(match[2]) - 1
    && date.getUTCDate() === Number(match[3]);
}

function buyLinkCount(parts) {
  return asArray(parts).reduce((total, part) => total + asArray(part && part.buyLinks).length, 0);
}

function partRecommendations(recommendations) {
  return asArray(recommendations).filter((rec) => rec && rec.type === 'part');
}

function productUrlError(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    return 'invalid product URL';
  }
  if (url.protocol !== 'https:' || !url.hostname) return 'product URL must use HTTPS';
  const host = url.hostname.toLowerCase();
  const pathname = url.pathname.toLowerCase();
  const queryKeys = [...url.searchParams.keys()].map((key) => key.toLowerCase());
  const isAmazon = /(^|\.)amazon\.[a-z.]+$/.test(host);
  const isEbay = /(^|\.)ebay\.[a-z.]+$/.test(host);
  const looksLikeSearch = SEARCH_URL.test(url.href)
    || /(^|\/)(search|search-results?)(\/|$)/.test(pathname)
    || (isAmazon && (pathname === '/s' || pathname.startsWith('/gp/search')))
    || (isEbay && (pathname.startsWith('/sch') || pathname.startsWith('/s/')))
    || queryKeys.some((key) => SEARCH_QUERY_KEYS.has(key));
  return looksLikeSearch ? 'search URL is not a product detail page' : null;
}

function vendorMatchesUrl(vendor, value) {
  let host;
  try {
    host = new URL(value).hostname.toLowerCase();
  } catch {
    return false;
  }
  const normalized = String(vendor || '').trim().toLowerCase();
  if (/(^|\.)ebay\.[a-z.]+$/.test(host)) return normalized === 'ebay';
  if (/(^|\.)amazon\.[a-z.]+$/.test(host)) return normalized === 'amazon';
  if (host === 'www.buyautoparts.com' || host === 'buyautoparts.com') return normalized === 'buyautoparts';
  if (host === 'www.wheelerfleet.com' || host === 'wheelerfleet.com') return normalized === 'wheelerfleet';
  return normalized.length > 0;
}

function validateManifest(manifest) {
  const errors = [];
  if (!manifest || typeof manifest !== 'object') return ['manifest must be an object'];
  if (manifest.schemaVersion !== 1) errors.push('schemaVersion must be 1');
  if (!manifest.baseline || typeof manifest.baseline !== 'object') {
    errors.push('baseline must be an object');
    return errors;
  }
  if (!Array.isArray(manifest.issues) || manifest.issues.length !== manifest.baseline.issueCount) {
    errors.push('issue count does not match baseline');
    return errors;
  }
  const ids = new Set();
  let removed = 0;
  let clicks = 0;
  let removedLinks = 0;
  let addedLinks = 0;
  let retained = 0;
  for (const issue of manifest.issues) {
    if (!issue.id || ids.has(issue.id)) errors.push(`duplicate or empty id: ${issue.id || '<empty>'}`);
    ids.add(issue.id);
    if (!issue.before || !issue.after) errors.push(`${issue.id}: missing before/after`);
    if (!isIsoDate(issue.after && issue.after.contentUpdatedOn)) errors.push(`${issue.id}: invalid public update date`);
    if (!(issue.after && issue.after.contentUpdateSummary || '').trim()) errors.push(`${issue.id}: empty public update summary`);
    if (!Array.isArray(issue.after && issue.after.fixParts)) errors.push(`${issue.id}: after.fixParts must be an array`);
    removed += Number(issue.before && issue.before.partRecommendationCount) || 0;
    clicks += Number(issue.before && issue.before.partClicks) || 0;
    removedLinks += Number(issue.before && issue.before.buyLinkCount) || 0;
    retained += Number(issue.after && issue.after.retainedRecommendationCount) || 0;
    for (const part of asArray(issue.after && issue.after.fixParts)) {
      for (const link of asArray(part && part.buyLinks)) {
        addedLinks += 1;
        const urlError = productUrlError(link.url || '');
        if (urlError) errors.push(`${issue.id}: ${urlError}`);
        if (!vendorMatchesUrl(link.vendor, link.url || '')) errors.push(`${issue.id}: vendor does not match product hostname`);
        if (link.linkType !== 'product' || link.verified !== true) errors.push(`${issue.id}: buy link is not verified product detail`);
      }
    }
  }
  const expected = manifest.baseline;
  if (removed !== expected.partRecommendationsRemoved) errors.push(`removed recommendation total ${removed} != ${expected.partRecommendationsRemoved}`);
  if (clicks !== expected.priorClicks) errors.push(`click total ${clicks} != ${expected.priorClicks}`);
  if (removedLinks !== expected.searchBuyLinksRemoved) errors.push(`removed buy-link total ${removedLinks} != ${expected.searchBuyLinksRemoved}`);
  if (addedLinks !== expected.directProductLinksAdded) errors.push(`added link total ${addedLinks} != ${expected.directProductLinksAdded}`);
  if (retained !== expected.nonPartRecommendationsRetained) errors.push(`retained recommendation total ${retained} != ${expected.nonPartRecommendationsRetained}`);
  return errors;
}

function beforeErrors(row, issue) {
  const recs = asArray(row.communityRecommendations);
  const fixes = asArray(row.fixParts);
  const parts = partRecommendations(recs);
  const before = issue.before;
  const errors = [];
  if (hashValue(recs) !== before.communityHash) errors.push('communityRecommendations hash');
  if (hashValue(fixes) !== before.fixPartsHash) errors.push('fixParts hash');
  if (hashValue(row.description) !== before.descriptionHash) errors.push('description hash');
  if (recs.length !== before.recommendationCount) errors.push('recommendation count');
  if (parts.length !== before.partRecommendationCount) errors.push('part recommendation count');
  if (parts.reduce((sum, rec) => sum + (Number(rec.clickCount) || 0), 0) !== before.partClicks) errors.push('part click count');
  if (fixes.length !== before.fixPartCount) errors.push('fix part count');
  if (buyLinkCount(fixes) !== before.buyLinkCount) errors.push('buy-link count');
  if ((row.contentUpdatedOn || '') !== before.contentUpdatedOn) errors.push('contentUpdatedOn');
  if ((row.contentUpdateSummary || '') !== before.contentUpdateSummary) errors.push('contentUpdateSummary');
  return errors;
}

function afterErrors(row, issue) {
  const recs = asArray(row.communityRecommendations);
  const fixes = asArray(row.fixParts);
  const after = issue.after;
  const errors = [];
  if (hashValue(recs) !== after.communityHash) errors.push('communityRecommendations hash');
  if (recs.length !== after.retainedRecommendationCount) errors.push('retained recommendation count');
  if (partRecommendations(recs).length !== 0) errors.push('part recommendation remains');
  if (!jsonEqual(fixes, after.fixParts)) errors.push('fixParts');
  const expectedDescription = Object.hasOwn(after, 'description') ? after.description : null;
  if (expectedDescription !== null) {
    if (row.description !== expectedDescription) errors.push('description');
  } else if (hashValue(row.description) !== issue.before.descriptionHash) {
    errors.push('unchanged description hash');
  }
  if ((row.contentUpdatedOn || '') !== after.contentUpdatedOn) errors.push('contentUpdatedOn');
  if ((row.contentUpdateSummary || '') !== after.contentUpdateSummary) errors.push('contentUpdateSummary');
  for (const part of fixes) {
    for (const link of asArray(part && part.buyLinks)) {
      if (SEARCH_URL.test(link.url || '')) errors.push('search buy-link remains');
    }
  }
  return errors;
}

function buildAfter(row, issue) {
  return {
    id: row.id,
    description: Object.hasOwn(issue.after, 'description') ? issue.after.description : row.description,
    communityRecommendations: asArray(row.communityRecommendations).filter((rec) => !rec || rec.type !== 'part'),
    fixParts: clone(issue.after.fixParts),
    contentUpdatedOn: issue.after.contentUpdatedOn,
    contentUpdateSummary: issue.after.contentUpdateSummary,
  };
}

function evaluateRows(rows, manifest) {
  const byId = new Map(rows.map((row) => [row.id, row]));
  const states = [];
  const drift = [];
  for (const issue of manifest.issues) {
    const row = byId.get(issue.id);
    if (!row) {
      drift.push(`${issue.id}: missing row`);
      continue;
    }
    const before = beforeErrors(row, issue);
    const after = afterErrors(row, issue);
    if (before.length === 0) states.push({ id: issue.id, state: 'before' });
    else if (after.length === 0) states.push({ id: issue.id, state: 'after' });
    else drift.push(`${issue.id}: before[${before.join(', ')}], after[${after.join(', ')}]`);
  }
  if (rows.length !== manifest.issues.length) drift.push(`query returned ${rows.length} rows; expected ${manifest.issues.length}`);
  if (drift.length > 0) return { state: 'drift', drift, states };
  const unique = new Set(states.map((entry) => entry.state));
  if (unique.size !== 1) return { state: 'drift', drift: ['mixed before/after state'], states };
  return { state: states[0] && states[0].state, drift: [], states };
}

function affectedSnapshot(row) {
  return {
    description: row.description,
    communityRecommendations: clone(asArray(row.communityRecommendations)),
    fixParts: clone(asArray(row.fixParts)),
    contentUpdatedOn: row.contentUpdatedOn || '',
    contentUpdateSummary: row.contentUpdateSummary || '',
  };
}

function secondsBetween(start, end) {
  return Math.max(0, (new Date(end).getTime() - new Date(start).getTime()) / 1000);
}

function timingResult(timing, completedAt) {
  const marketplaceStall = Number(timing.knownToolStalls.find((s) => s.label === 'marketplace HTML request')?.seconds) || 0;
  const preApprovalActiveEstimate = Math.max(0,
    secondsBetween(timing.auditStartedAt, timing.initialCheckpointAt)
      + secondsBetween(timing.editResearchResumedAt, timing.revisedCheckpointAt)
      - marketplaceStall,
  );
  return {
    auditStartedAt: timing.auditStartedAt,
    completedAt,
    totalWallSeconds: secondsBetween(timing.auditStartedAt, completedAt),
    initialEditWaitSeconds: secondsBetween(timing.initialCheckpointAt, timing.editResearchResumedAt),
    approvalWaitUpperBoundSeconds: secondsBetween(timing.revisedCheckpointAt, timing.approvalClockCapturedAt),
    approvalWaitPrecision: 'upper-bound; clock captured after implementation began',
    knownToolStallSeconds: timing.knownToolStalls.reduce((sum, stall) => sum + Number(stall.seconds || 0), 0),
    preApprovalActiveEstimateSeconds: preApprovalActiveEstimate,
    postApprovalClockCaptureWallSeconds: secondsBetween(timing.approvalClockCapturedAt, completedAt),
    note: 'The exact approval event time was not instrumented. Active time is therefore reported as a pre-approval estimate plus a post-capture wall-time segment, not a false exact total.',
  };
}

function plannedSummary(manifest, state) {
  return {
    state,
    issueCount: manifest.baseline.issueCount,
    notices: manifest.baseline.issueCount,
    partRecommendationsRemoved: manifest.baseline.partRecommendationsRemoved,
    existingFixPartTransitions: manifest.baseline.existingFixPartTransitions,
    searchBuyLinksRemoved: manifest.baseline.searchBuyLinksRemoved,
    directProductLinksAdded: manifest.baseline.directProductLinksAdded,
  };
}

function buildResult(manifest, beforeRows, afterRows, completedAt) {
  const issueById = new Map(manifest.issues.map((issue) => [issue.id, issue]));
  const afterById = new Map(afterRows.map((row) => [row.id, row]));
  return {
    schemaVersion: 1,
    batchId: manifest.batchId,
    status: 'applied-and-verified',
    completedAt,
    counts: plannedSummary(manifest, 'applied'),
    timing: timingResult(manifest.timing, completedAt),
    issues: beforeRows.map((row) => ({
      id: row.id,
      decision: issueById.get(row.id).decision,
      evidence: issueById.get(row.id).evidence,
      before: affectedSnapshot(row),
      after: affectedSnapshot(afterById.get(row.id)),
    })),
  };
}

function resultArtifactErrors(result, manifest, rows) {
  const errors = [];
  if (!result || typeof result !== 'object') return ['result must be an object'];
  if (result.schemaVersion !== 1) errors.push('schemaVersion');
  if (result.batchId !== manifest.batchId) errors.push('batchId');
  if (result.status !== 'applied-and-verified') errors.push('status');
  if (!result.completedAt || Number.isNaN(Date.parse(result.completedAt))) errors.push('completedAt');
  if (!jsonEqual(result.counts, plannedSummary(manifest, 'applied'))) errors.push('counts');
  if (!Array.isArray(result.issues) || result.issues.length !== manifest.issues.length) {
    errors.push('issue count');
    return errors;
  }
  const resultById = new Map(result.issues.map((issue) => [issue.id, issue]));
  const rowById = new Map(rows.map((row) => [row.id, row]));
  for (const issue of manifest.issues) {
    const recorded = resultById.get(issue.id);
    const row = rowById.get(issue.id);
    if (!recorded || !row) {
      errors.push(`${issue.id}: missing result or row`);
      continue;
    }
    if (recorded.decision !== issue.decision) errors.push(`${issue.id}: decision`);
    if (!jsonEqual(recorded.evidence, issue.evidence)) errors.push(`${issue.id}: evidence`);
    if (!jsonEqual(recorded.after, affectedSnapshot(row))) errors.push(`${issue.id}: after snapshot`);
  }
  return errors;
}

function ensureResultArtifact(manifest, rows) {
  if (fs.existsSync(RESULT_PATH)) {
    let result;
    try {
      result = JSON.parse(fs.readFileSync(RESULT_PATH, 'utf8'));
    } catch (error) {
      throw new Error(`Result artifact is unreadable: ${error instanceof Error ? error.message : error}`);
    }
    const errors = resultArtifactErrors(result, manifest, rows);
    if (errors.length > 0) throw new Error(`Result artifact does not match the verified database: ${errors.join('; ')}`);
    return 'verified';
  }
  if (fs.existsSync(RESULT_TEMP_PATH)) {
    let staged;
    try {
      staged = JSON.parse(fs.readFileSync(RESULT_TEMP_PATH, 'utf8'));
    } catch (error) {
      throw new Error(`Staged result artifact is unreadable: ${error instanceof Error ? error.message : error}`);
    }
    const errors = resultArtifactErrors(staged, manifest, rows);
    if (errors.length > 0) throw new Error(`Staged result artifact does not match the verified database: ${errors.join('; ')}`);
    fs.renameSync(RESULT_TEMP_PATH, RESULT_PATH);
    return 'recovered';
  }
  throw new Error('Approved after-state exists, but its result artifact is missing and cannot be reconstructed safely.');
}

async function assertColumns(client) {
  const expected = ['contentUpdatedOn', 'contentUpdateSummary'];
  const result = await client.query(
    `SELECT column_name, data_type, is_nullable, column_default
       FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'KnownIssue'
        AND column_name = ANY($1::text[])`,
    [expected],
  );
  const byName = new Map(result.rows.map((row) => [row.column_name, row]));
  const errors = expected.flatMap((name) => {
    const row = byName.get(name);
    if (!row) return [`${name} missing`];
    if (row.data_type !== 'text' || row.is_nullable !== 'NO') return [`${name} has wrong type/nullability`];
    return /^''(?:::text)?$/.test(String(row.column_default || '').replace(/[()\s]/g, ''))
      ? []
      : [`${name} has wrong default`];
  });
  if (errors.length > 0) throw new Error(`Schema preflight failed: ${errors.join('; ')}. Run apply-known-issue-update-metadata.js --apply first.`);
}

async function selectRows(client, ids, lock = false) {
  const result = await client.query(
    `SELECT id, description, "communityRecommendations", "fixParts",
            "contentUpdatedOn", "contentUpdateSummary"
       FROM "KnownIssue"
      WHERE id = ANY($1::text[])
      ORDER BY id${lock ? ' FOR UPDATE' : ''}`,
    [ids],
  );
  return result.rows;
}

function loadManifest() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const errors = validateManifest(manifest);
  if (errors.length > 0) throw new Error(`Manifest validation failed: ${errors.join('; ')}`);
  return manifest;
}

async function run(mode) {
  require('dotenv').config({ path: path.join(PROJECT_ROOT, '.env.local'), quiet: true });
  require('dotenv').config({ path: path.join(PROJECT_ROOT, '.env'), quiet: true });
  const pg = require('pg');
  const url = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('No POSTGRES_PRISMA_URL or DATABASE_URL set.');
  const manifest = loadManifest();
  const ids = manifest.issues.map((issue) => issue.id);
  const pool = new pg.Pool({ connectionString: url, max: 1 });
  pool.on('error', () => {});
  try {
    await assertColumns(pool);
    if (mode !== 'apply') {
      const rows = await selectRows(pool, ids);
      const evaluation = evaluateRows(rows, manifest);
      if (evaluation.state === 'drift') throw new Error(`Preflight drift:\n- ${evaluation.drift.join('\n- ')}`);
      if (mode === 'verify' && evaluation.state !== 'after') throw new Error('Verification failed: approved after-state has not been applied.');
      if (mode === 'verify') ensureResultArtifact(manifest, rows);
      if (mode === 'dry-run' && evaluation.state === 'before') {
        const issueById = new Map(manifest.issues.map((issue) => [issue.id, issue]));
        const synthetic = rows.map((row) => buildAfter(row, issueById.get(row.id)));
        const syntheticEvaluation = evaluateRows(synthetic, manifest);
        if (syntheticEvaluation.state !== 'after') throw new Error(`Transform validation failed:\n- ${syntheticEvaluation.drift.join('\n- ')}`);
      }
      console.log(JSON.stringify(plannedSummary(manifest, evaluation.state === 'after' ? 'already-applied' : 'planned'), null, 2));
      return;
    }

    const client = await pool.connect();
    let beforeRows;
    let afterRows;
    let result;
    let committed = false;
    let wroteStagedResult = false;
    let alreadyApplied = false;
    try {
      await client.query('BEGIN');
      beforeRows = await selectRows(client, ids, true);
      const evaluation = evaluateRows(beforeRows, manifest);
      if (evaluation.state === 'drift') throw new Error(`Preflight drift:\n- ${evaluation.drift.join('\n- ')}`);
      if (evaluation.state === 'after') {
        afterRows = beforeRows;
        await client.query('COMMIT');
        committed = true;
        alreadyApplied = true;
      } else {
        const issueById = new Map(manifest.issues.map((issue) => [issue.id, issue]));
        for (const row of beforeRows) {
          const desired = buildAfter(row, issueById.get(row.id));
          await client.query(
            `UPDATE "KnownIssue"
                SET description = $2,
                    "communityRecommendations" = $3::jsonb,
                    "fixParts" = $4::jsonb,
                    "contentUpdatedOn" = $5,
                    "contentUpdateSummary" = $6,
                    "updatedAt" = NOW()
              WHERE id = $1`,
            [desired.id, desired.description, JSON.stringify(desired.communityRecommendations), JSON.stringify(desired.fixParts), desired.contentUpdatedOn, desired.contentUpdateSummary],
          );
        }
        afterRows = await selectRows(client, ids);
        const verified = evaluateRows(afterRows, manifest);
        if (verified.state !== 'after') throw new Error(`Transactional verification failed:\n- ${verified.drift.join('\n- ')}`);
        result = buildResult(manifest, beforeRows, afterRows, new Date().toISOString());
        fs.writeFileSync(RESULT_TEMP_PATH, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
        wroteStagedResult = true;
        await client.query('COMMIT');
        committed = true;
      }
    } catch (error) {
      if (!committed) {
        await client.query('ROLLBACK').catch(() => {});
        if (wroteStagedResult && fs.existsSync(RESULT_TEMP_PATH)) fs.unlinkSync(RESULT_TEMP_PATH);
      }
      throw error;
    } finally {
      client.release();
    }

    if (alreadyApplied) {
      ensureResultArtifact(manifest, afterRows);
      console.log(JSON.stringify(plannedSummary(manifest, 'already-applied'), null, 2));
      return;
    }
    fs.renameSync(RESULT_TEMP_PATH, RESULT_PATH);
    console.log(JSON.stringify(plannedSummary(manifest, 'applied-and-verified'), null, 2));
  } finally {
    await pool.end();
  }
}

async function main() {
  const modes = ['dry-run', 'apply', 'verify'].filter((name) => process.argv.includes(`--${name}`));
  if (modes.length !== 1) throw new Error('Choose exactly one mode: --dry-run, --apply, or --verify');
  await run(modes[0]);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}

module.exports = {
  afterErrors,
  beforeErrors,
  buildAfter,
  evaluateRows,
  hashValue,
  isIsoDate,
  jsonEqual,
  productUrlError,
  resultArtifactErrors,
  timingResult,
  validateManifest,
  vendorMatchesUrl,
};
