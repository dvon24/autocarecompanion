/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');
const snapshot = require('../data/_ram-deeplink-snapshot-2026-08-10.json');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const rows = snapshot.records.filter((row) => row.make === 'RAM' && row.model === '1500 Classic').sort((left, right) => left.id.localeCompare(right.id));
const allIds = Object.freeze(rows.map((row) => row.id));
const exhaustIds = Object.freeze(allIds.filter((id) => /exhaust-manifold/.test(id)));
const lifterIds = Object.freeze(allIds.filter((id) => /lifter/.test(id)));
const reportCountCleanupIds = Object.freeze(rows.filter((row) => Number(row.reportCount) > 0).map((row) => row.id));

function exhaustIssue(row) {
  return {
    description: `Stellantis TSB 09-001-24 supports a bounded cold exhaust-manifold tick on 2019-2024 DT RAM 1500 trucks with 5.7L HEMI EZH/EZL engines. Its diagnostic procedure identifies a cracked exhaust manifold and its repair replaces the cracked manifold with a kit; it does not identify exhaust-manifold bolt breakage as the cause asserted by the frozen title “${row.title}.” Three frozen 1500 Classic pages also assert the same bolt-breakage identity. This page remains published as an identity hold with its title, route and vehicle metadata unchanged.`,
    solution: 'Start the engine cold and localize a tick that fades as the engine warms. Remove the heat shield only under the service procedure, inspect the suspected manifold for a crack and distinguish it from casting lines or fins. If the VIN, engine sales code and condition match TSB 09-001-24, follow its manifold-kit procedure; do not convert that evidence into proof of a broken bolt. Do not buy a manifold, gasket, fastener, shield or tie-bar kit from this page; the crack location, engine code, current kit number, supersession and VIN fitment must be established first.',
    symptoms: ['cold-only tick and warm-up behavior recorded', 'noise localized to the exhaust manifold area', 'manifold inspected for a crack under the TSB procedure', 'cracked manifold separated from fastener, gasket and internal-engine noise'],
    affectedSystems: ['5.7L HEMI exhaust manifolds', 'manifold gaskets, fasteners, heat shields and tie bars', 'cold-start exhaust sealing'],
    evidence: ['TSB 09-001-24 covers 2019-2024 DT RAM 1500 EZH/EZL engines.', 'The bulletin lists exhaust manifold as the cause and requires visual confirmation of a cracked manifold.', 'The bulletin does not identify bolt breakage as the condition, and three frozen pages compete for the same indexed identity.'],
    conflict: 'The frozen title asserts bolt breakage while the exact manufacturer procedure identifies a cracked manifold; three frozen pages also compete for the same identity and no merge, redirect or title change is authorized.',
    summary: 'Held the unsupported bolt-breakage identity, preserved the indexed page and replaced it with the exact cracked-manifold diagnostic boundary pending identity policy.',
    citations: ['exhaustBulletin', 'datasets'],
    commerceDecision: 'crack location, fastener or gasket involvement, engine sales code, current kit number, supersession and VIN fitment remain unresolved; no universal retail part',
  };
}

function lifterIssue(row) {
  return {
    description: `The complete frozen RAM/Dodge 1500 source pass did not identify an exact manufacturer communication or recall establishing the full indexed identity “${row.title}” across all 2019-2025 1500 Classic years. The corpus contains distinct cold exhaust-manifold ticks, misfire diagnostics, oil-control conditions and engine procedures, but none is proof that every indexed tick is an MDS lifter failure. Two frozen 1500 Classic pages also assert overlapping lifter/tick identities. This page remains published as an identity hold with no title, route or metadata change.`,
    solution: 'Record whether the noise is cold-only or persists warm, engine speed and load, oil level and pressure, misfire counts and fault data. Separate cracked exhaust manifold, accessory drive, injector noise, rocker/cam/lifter wear, cylinder deactivation control, lubrication and internal-engine paths with localized listening, oil-pressure testing and mechanical inspection before teardown. Do not buy lifters, a camshaft, rockers, an MDS solenoid, oil pump or engine kit from this page; the failed component, current part number, supersession and VIN fitment must be established first.',
    symptoms: ['cold-only versus warm persistent tick recorded', 'oil level, pressure and condition measured', 'misfire and cylinder-deactivation data preserved', 'exhaust, accessory, valvetrain and lubrication paths separated'],
    affectedSystems: ['5.7L HEMI valvetrain and camshaft', 'MDS cylinder-deactivation control', 'engine lubrication and exhaust-manifold noise paths'],
    evidence: ['No exact communication or campaign in the frozen source corpus establishes the full title and year scope.', 'Cold tick, misfire and oil-control records describe distinct diagnostic identities.', 'Two frozen pages compete for the same lifter/tick identity and cannot be merged during content adjudication.'],
    conflict: 'The title converts a nonspecific tick into MDS lifter failure without one exact all-year source, and overlaps another frozen lifter identity; no merge, redirect or title change is authorized.',
    summary: 'Held the unsupported MDS-lifter identity, removed invented social proof and restored exhaust-versus-valvetrain-versus-lubrication diagnosis without changing indexed identity.',
    citations: ['datasets'],
    commerceDecision: 'noise source, mechanical or control failure, current part number, supersession and VIN fitment remain unresolved; no universal retail part',
  };
}

const content = Object.fromEntries(rows.map((row) => [row.id, exhaustIds.includes(row.id) ? exhaustIssue(row) : lifterIssue(row)]));
const pdfSources = Object.freeze({
  exhaustBulletin: {
    title: 'Stellantis TSB 09-001-24 - Cold Engine Ticking Noise',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-10251862-9999.pdf',
    contains: ['2019 - 2024', 'Cause: Exhaust manifold', 'cracked manifold', 'replace all fasteners'],
  },
});
const otherSources = Object.freeze({ datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL } });

module.exports = Object.freeze({
  make: 'RAM', frozenMakeValues: ['RAM'], model: '1500 Classic', slug: '1500-classic', reviewDate: '2026-08-11',
  snapshotFile: 'data/_ram-deeplink-snapshot-2026-08-10.json', snapshotFileSha256: 'e47326640702306eb85ee0cfc33418e55908fd72b4094ecff71186a2e0610623', snapshotHash: 'bdb5e4ec822f7c28c21a5f6f1143e49a0d89b1005428bf1ea93ba5059a7b9057',
  liveRecallFile: 'data/_ram-1500-live-recalls-2026-08-11.json', outputFile: 'data/known-issue-ram-1500-classic-adjudication-2026-08-11.json',
  allIds, retainedIds: [], reportCountCleanupIds, duplicateGroups: [
    { label: 'exhaust-manifold bolt-breakage', recordIds: exhaustIds },
    { label: 'MDS lifter/tick', recordIds: lifterIds },
  ],
  sourceMakes: ['RAM', 'DODGE'], modelAliases: ['1500', 'RAM 1500'], searchTerms: ['cold engine ticking', 'exhaust manifold', 'manifold crack', 'manifold bolt', 'lifter', 'camshaft', 'MDS', 'misfire'],
  relevantDocumentIds: ['10251862'], campaigns: [], pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL, periodCounts: { '1995-1999': 165, '2000-2004': 291, '2005-2009': 118, '2010-2014': 33, '2015-2019': 1269, '2020-2024': 2111, '2025-2026': 639 }, totalRows: 4626,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'NHTSA indexes 1500 Classic communications under 1500 rather than a distinct Classic alias. The complete RAM/Dodge 1500 corpus was searched. TSB 09-001-24 proves a cracked-manifold condition, not the three frozen bolt-breakage titles; no exact document proves either lifter title at full scope.',
  },
  recallInventory: {
    source: DATASET_URL, periodCounts: { pre: 200, post: 387 }, totalRows: 587, downloadedCampaignCount: 198, liveModernCampaignCount: 98,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The NHTSA live API returns HTTP 400 for model alias 1500 Classic, while RAM 1500 returns the shared pickup campaigns. No recall is treated as proof of either frozen Classic identity.',
  },
  content,
  requiredProse: [
    ...exhaustIds.map((id) => ({ id, field: 'description', patterns: ['09-001-24', 'cracked exhaust manifold', 'does not identify.*bolt breakage'] })),
    ...lifterIds.map((id) => ({ id, field: 'description', patterns: ['did not identify', 'MDS lifter failure', 'identity hold'] })),
    ...allIds.map((id) => ({ id, field: 'solution', patterns: ['Do not buy', 'VIN fitment'] })),
  ],
  observations: [
    { code: 'coverage-complete', severity: 'source-integrity', recordIds: allIds, detail: 'All five frozen RAM 1500 Classic rows are represented exactly once.' },
    { code: 'all-identities-held', severity: 'identity-safety', recordIds: allIds, detail: 'All five pages remain published holds; none is archived, redirected, merged or relabeled.' },
    { code: 'exhaust-title-conflict', severity: 'technical-accuracy', recordIds: exhaustIds, detail: 'TSB 09-001-24 identifies a cracked manifold, not bolt breakage, and three frozen pages compete for that identity.' },
    { code: 'lifter-identity-conflict', severity: 'technical-accuracy', recordIds: lifterIds, detail: 'No exact source proves the two overlapping MDS-lifter titles at full frozen scope.' },
    { code: 'invented-owner-count-zeroed', severity: 'consumer-accuracy', recordIds: reportCountCleanupIds, detail: 'The unsupported 240-owner total is proposed as unknown zero and never rendered as 0+ owners.' },
    { code: 'no-commerce', severity: 'commerce-safety', recordIds: allIds, detail: 'No buy link, fixParts record or community recommendation is introduced.' },
    { code: 'identity-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'Titles, make, model, years, trims, engines, categories, severities, statuses and routing remain frozen.' },
  ],
});
