/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(PROJECT_ROOT, 'data', '_honda-deeplink-snapshot-2026-08-05.json');
const OUTPUT = path.join(PROJECT_ROOT, 'data', 'known-issue-honda-adjudication-2026-08-05.json');

const RIDGELINE_ID = 'honda-ridgeline-rear-differential-noise-2006';
const S2000_ID = 'honda-s2000-valve-retainer-failure-2000';

const ACTION_BY_ID = new Map([
  [RIDGELINE_ID, 'correct_clicked_integrity'],
  [S2000_ID, 'remove_invalid_search_link'],
]);

const FULL_RECORD_FIELDS = [
  'make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'description', 'solution',
  'severity', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow',
  'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations',
  'communityRecommendations', 'fixParts', 'humanApproved', 'reportCount', 'source', 'status',
  'lastReportedByOwners', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary', 'relatedIssueIds',
];

const RIDGELINE_MANUAL_2006 = 'https://techinfo.honda.com/rjanisis/pubs/OM/AH/AJC0606OM/enu/JC0606OM.pdf';
const RIDGELINE_MANUAL_2014 = 'https://techinfo.honda.com/rjanisis/pubs/om/jc1414/jc1414om.pdf';
const S2000_MANUAL_2000 = 'https://techinfo.honda.com/rjanisis/pubs/OM/AH/AS20000OM/enu/S20000OM.pdf';

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  }
  return value;
}

function hashValue(value) {
  return crypto.createHash('sha256').update(JSON.stringify(stableValue(value))).digest('hex');
}

function sha256File(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex');
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function fullRecord(row) {
  return Object.fromEntries(FULL_RECORD_FIELDS.map((field) => [field, clone(row[field])]));
}

function diffFields(before, after) {
  return FULL_RECORD_FIELDS.filter((field) => hashValue(before[field]) !== hashValue(after[field]));
}

function ridgelineProposal(before) {
  return fullRecord({
    ...before,
    solution: 'Honda specifies Honda VTM-4 Differential Fluid for the 2006-2014 Ridgeline rear differential. Have the fluid level and condition checked, diagnose other drivetrain causes before replacing components, and replace the rear differential fluid when the Maintenance Minder indicates service. Honda directs owners to have a dealer perform the fluid replacement.',
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    citations: [
      {
        type: 'manufacturer',
        title: '2006 Honda Ridgeline Owner Manual - Rear Differential Fluid',
        url: RIDGELINE_MANUAL_2006,
      },
      {
        type: 'manufacturer',
        title: '2014 Honda Ridgeline Owner Manual - Service Information Summary',
        url: RIDGELINE_MANUAL_2014,
      },
    ],
    communityRecommendations: [
      {
        type: 'part',
        content: 'Use Honda VTM-4 Differential Fluid for the 2006-2014 Ridgeline rear differential.',
        upvotes: 0,
        needsReview: false,
      },
      {
        type: 'tip',
        content: 'Follow the Maintenance Minder for rear-differential fluid service and have persistent noise, shudder or binding diagnosed before replacing the differential.',
        upvotes: 0,
        needsReview: false,
      },
    ],
    fixParts: [],
    reviewedOn: '2026-08-05',
    contentUpdatedOn: '2026-08-05',
    contentUpdateSummary: 'Corrected the fluid specification to Honda VTM-4, removed the invalid search shopping link and unsupported fixed price/mileage claims, and added Honda boundary-year manuals.',
  });
}

function s2000Proposal(before) {
  const communityRecommendations = clone(before.communityRecommendations);
  const linkedIndex = communityRecommendations.findIndex((item) => typeof item.affiliateUrl === 'string');
  if (linkedIndex < 0) throw new Error(`${S2000_ID}: expected linked recommendation missing`);
  delete communityRecommendations[linkedIndex].affiliateUrl;
  return fullRecord({
    ...before,
    communityRecommendations,
    contentUpdatedOn: '2026-08-05',
    contentUpdateSummary: 'Removed an invalid search-results shopping link. The AP2-retainer remedy remains unmonetized and pending a same-identity Honda primary source.',
  });
}

function proposalFor(current) {
  const before = fullRecord(current);
  if (current.id === RIDGELINE_ID) return ridgelineProposal(before);
  if (current.id === S2000_ID) return s2000Proposal(before);
  return before;
}

function evidenceFor(id) {
  if (id === RIDGELINE_ID) {
    return [
      {
        kind: 'manufacturer-manual',
        url: RIDGELINE_MANUAL_2006,
        verifiedOn: '2026-08-05',
        observation: 'Owner-manual page 242 says to always use Honda VTM-4 Differential Fluid and have the dealer replace the rear differential fluid when the Maintenance Minder indicates service.',
      },
      {
        kind: 'manufacturer-manual',
        url: RIDGELINE_MANUAL_2014,
        verifiedOn: '2026-08-05',
        observation: 'The 2014 service-information summary specifies Honda VTM-4 Differential Fluid, confirming the boundary-year fluid specification.',
      },
      {
        kind: 'showmetheparts-candidate-check',
        verifiedOn: '2026-08-05',
        observation: 'The 2006 Ridgeline FUNCTIONAL FLUID, LUBRICANT & GREASE category returned coolant, fuel additive, ATF and brake-fluid products but no VTM-4 rear-differential fluid candidate; no substitute product was approved.',
      },
    ];
  }
  if (id === S2000_ID) {
    return [
      {
        kind: 'manufacturer-manual',
        url: S2000_MANUAL_2000,
        verifiedOn: '2026-08-05',
        observation: 'Owner-manual pages 133-134 warn against entering the tachometer red zone and over-revving on a downshift; they do not establish an AP2 valve-retainer conversion as a Honda remedy.',
      },
      {
        kind: 'showmetheparts-candidate-check',
        verifiedOn: '2026-08-05',
        observation: 'The 2000 S2000 VALVE TRAIN COMPONENTS category returned a timing-chain tensioner and VVT-solenoid filter, not a valve retainer or spring; no unrelated product was substituted.',
      },
    ];
  }
  return [];
}

function reasonFor(current, action) {
  if (action === 'correct_clicked_integrity') {
    return 'The only clicked Ridgeline commerce claim names DPSF, but Honda specifies VTM-4 at both boundary years. The proposal corrects that dangerous mismatch and removes commerce because the catalog has no matching product.';
  }
  if (action === 'remove_invalid_search_link') {
    return 'The clicked S2000 URL is an Amazon search page, not a verified product. Honda primary material found so far supports avoiding over-revving but not the AP2-retainer remedy, so the text remains published and the search link alone is removed pending review.';
  }
  return 'No same-identity primary source and exact repair-role product were completed in this priority pass. The existing published row remains byte-for-byte unchanged; absence of a source is not evidence for removal or substitution.';
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  if (snapshot.records.some((row) => row.make !== 'Honda')) throw new Error('snapshot contains a non-Honda row');
  if (snapshot.records.length !== 383) throw new Error(`expected 383 Honda rows, found ${snapshot.records.length}`);

  const rows = snapshot.records.map((current) => {
    const before = fullRecord(current);
    const action = ACTION_BY_ID.get(current.id) || 'keep_published_pending_source';
    const proposal = proposalFor(current);
    return {
      id: current.id,
      model: current.model,
      action,
      reason: reasonFor(current, action),
      identityRule: action === 'keep_published_pending_source'
        ? 'No content or publication state changes; an unrelated official source cannot replace this issue.'
        : 'The model, model-year scope, page identity and published status remain unchanged.',
      commerceDecision: action === 'keep_published_pending_source' ? 'unchanged-pending-audit' : 'no-commerce',
      changedFields: diffFields(before, proposal),
      evidence: evidenceFor(current.id),
      beforeSha256: hashValue(before),
      proposalSha256: hashValue(proposal),
      before,
      proposal,
    };
  });

  const actions = ['correct_clicked_integrity', 'remove_invalid_search_link', 'keep_published_pending_source'];
  const summary = Object.fromEntries(actions.map((action) => [action, rows.filter((row) => row.action === action).length]));
  summary.total = rows.length;
  const byModel = {};
  for (const model of [...new Set(rows.map((row) => row.model))].sort()) {
    const scoped = rows.filter((row) => row.model === model);
    byModel[model] = Object.fromEntries(actions.map((action) => [action, scoped.filter((row) => row.action === action).length]));
    byModel[model].total = scoped.length;
  }

  const packet = {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'priority-click-integrity-and-make-inventory',
    requiresIndependentApproval: true,
    generatedOn: '2026-08-05',
    make: 'Honda',
    completionStatement: 'This packet reconciles every currently published Honda row, but it does not claim that the 381 unchanged rows have completed full-record primary-source research.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, or public-page change is authorized by this packet.',
      'All 383 Honda rows remain published; 381 rows are byte-for-byte unchanged.',
      'An unrelated official campaign or catalog part may never replace the component or symptom named by an existing ID.',
      'Search, category and storefront-result URLs are not product deep links.',
      'The two clicked rows remain no-commerce because ShowMeTheParts returned no exact repair-role candidate.',
    ],
    source: {
      snapshotFile: 'data/_honda-deeplink-snapshot-2026-08-05.json',
      snapshotSha256: sha256File(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      productionRecordCount: snapshot.records.length,
      inventory: snapshot.inventory,
    },
    observations: [
      {
        code: 'model-case-split',
        severity: 'review',
        detail: 'The snapshot contains 3 rows labeled "Del Sol" and 6 labeled "del Sol". They normalize to one model name and include likely overlapping distributor, trailing-arm and targa-roof records. This packet makes no casing or deduplication change.',
      },
      {
        code: 'commerce-backlog',
        severity: 'review',
        detail: `${snapshot.inventory.invalidOrSearchLinkCount} of ${snapshot.inventory.linkCount} catalog links are invalid or search URLs; this priority packet removes only the two links with recorded clicks and leaves every unreviewed row unchanged.`,
      },
    ],
    summary,
    byModel,
    rows,
  };

  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: sha256File(OUTPUT), summary, byModel }, null, 2));
}

if (require.main === module) main();

module.exports = {
  ACTION_BY_ID,
  FULL_RECORD_FIELDS,
  RIDGELINE_ID,
  RIDGELINE_MANUAL_2006,
  RIDGELINE_MANUAL_2014,
  S2000_ID,
  S2000_MANUAL_2000,
  diffFields,
  fullRecord,
  hashValue,
  proposalFor,
};
