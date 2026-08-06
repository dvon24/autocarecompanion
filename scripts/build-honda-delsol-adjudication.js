/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue } = require('./build-honda-adjudication');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(PROJECT_ROOT, 'data', '_honda-deeplink-snapshot-2026-08-05.json');
const OUTPUT = path.join(PROJECT_ROOT, 'data', 'known-issue-honda-delsol-adjudication-2026-08-06.json');
const MODEL_LABELS = new Set(['Del Sol', 'del Sol']);

const IDS = {
  distributorGeneral: 'honda-del-sol-distributor-failure-1993',
  distributorSeal: 'honda-del-sol-distributor-internal-oil-seal-bearing-failure',
  mainRelay: 'honda-del-sol-pgm-fi-main-relay-failure',
  trailingArmBushing: 'honda-del-sol-rear-trailing-arm-bushing-1993',
  trailingArmRust: 'honda-del-sol-rear-trailing-arm-mount-rear-quarter-rocker-rust',
  roofSeal: 'honda-del-sol-roof-seal-leak-1993',
  targaLeak: 'honda-del-sol-targa-top-water-leaks-rattles',
  timingBelt: 'honda-del-sol-timing-belt-aging-failure-interference-engines',
  vtecLeak: 'honda-del-sol-vtec-solenoid-valve-cover-gasket-oil-leaks',
};

const RESEARCH_NOTES = {
  [IDS.distributorGeneral]: 'The generic NHTSA complaint page does not establish a five-year distributor defect, its moisture/heat mechanism, P0340 applicability, or the proposed complete-distributor remedy. The row remains byte-for-byte unchanged.',
  [IDS.distributorSeal]: 'The cited retailer, forums and RepairPal page are not Honda/NHTSA primary records for an internal distributor seal or bearing defect. The row remains unchanged.',
  [IDS.mainRelay]: 'No exact Honda/NHTSA Del Sol PGM-FI main-relay bulletin was verified. Civic/forum diagnostics cannot be substituted into this indexed Del Sol page.',
  [IDS.trailingArmBushing]: 'The generic NHTSA vehicle page and repair video do not establish the asserted Del Sol-specific suspension geometry, snap-oversteer risk, alignment target or polyurethane remedy.',
  [IDS.trailingArmRust]: 'No Honda/NHTSA Del Sol structural-corrosion campaign or repair procedure was verified. Forum welding advice cannot be promoted as an official remedy.',
  [IDS.roofSeal]: 'The generic NHTSA vehicle page and video do not establish a Honda targa-seal defect or the proposed silicone/latch repair. The row remains unchanged.',
  [IDS.targaLeak]: 'The forum and repair-summary sources do not establish a Honda defect or permanent remedy. This page also overlaps the frozen roof-seal page and remains unchanged pending canonical review.',
  [IDS.timingBelt]: 'No exact Honda source was completed for the card\'s all-engine interference-design claim, 60,000-mile interval, water-pump requirement or post-failure damage statement.',
  [IDS.vtecLeak]: 'No Honda/NHTSA record was verified for the combined VTEC-solenoid, cam-seal, valve-cover and plug-tube aggregation or its bolt-stretch claim.',
};

function normalizedFileHash(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex');
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const rowsInScope = snapshot.records.filter((row) => row.make === 'Honda' && MODEL_LABELS.has(row.model));
  if (rowsInScope.length !== 9) throw new Error(`expected 9 Honda Del Sol/del Sol rows, found ${rowsInScope.length}`);
  const rows = rowsInScope.map((current) => {
    const before = fullRecord(current);
    return {
      id: current.id,
      model: current.model,
      action: 'keep_published_pending_source',
      reason: RESEARCH_NOTES[current.id],
      identityRule: 'No content, model casing or publication-state changes; an unrelated bulletin, generic vehicle page, video, retailer or forum cannot replace this issue.',
      commerceDecision: 'unchanged-pending-audit',
      changedFields: diffFields(before, before),
      evidence: [],
      beforeSha256: hashValue(before),
      proposalSha256: hashValue(before),
      before,
      proposal: before,
    };
  });
  const packet = {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-adjudication',
    requiresIndependentApproval: true,
    generatedOn: '2026-08-06',
    make: 'Honda',
    model: 'Del Sol / del Sol',
    completionStatement: 'This packet reconciles all nine frozen Honda Del Sol/del Sol rows. No same-identity primary-source rewrite cleared the gate; all nine rows remain byte-for-byte unchanged pending exact evidence or independent disposition.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change, model-case normalization or public-page change is authorized by this packet.',
      'All nine rows remain published and byte-for-byte unchanged.',
      'An unrelated campaign, bulletin, component or model may never replace the issue named by an existing indexed page.',
      'Existing model casing, indexed IDs and commerce are frozen; the packet only exposes review risks.',
      'Independent row-by-row approval is required before any separate correction or canonicalization path may be created.',
    ],
    source: {
      snapshotFile: 'data/_honda-deeplink-snapshot-2026-08-05.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      recordCount: rowsInScope.length,
      modelLabelCounts: Object.fromEntries([...MODEL_LABELS].map((label) => [label, rowsInScope.filter((row) => row.model === label).length])),
    },
    observations: [
      { code: 'model-case-split', severity: 'independent-review-required', recordIds: rows.map((row) => row.id), detail: 'Three records use "Del Sol" and six use "del Sol". This packet treats them as one audit cohort but preserves the stored casing and every indexed ID.' },
      { code: 'roof-page-overlap', severity: 'independent-review-required', recordIds: [IDS.roofSeal, IDS.targaLeak], detail: 'The two indexed roof pages substantially overlap. Neither is removed, redirected or rewritten without an exact Honda source and independent canonical decision.' },
      { code: 'distributor-page-overlap', severity: 'independent-review-required', recordIds: [IDS.distributorGeneral, IDS.distributorSeal], detail: 'The distributor pages overlap but are not proven identical: one is a broad ignition-failure aggregation and one names internal seal/bearing failure. Both remain unchanged.' },
      { code: 'unrelated-commerce-frozen', severity: 'independent-review-required', recordIds: [IDS.distributorGeneral, IDS.roofSeal], detail: 'The distributor page currently links starter/relay products and the roof page links door hardware. These are not validated repair-role matches, but the strict unverified-row contract keeps the rows byte-equivalent for reviewer disposition.' },
      { code: 'timing-belt-scope-unverified', severity: 'independent-review-required', recordIds: [IDS.timingBelt], detail: 'The all-engine interference-design, 60,000-mile, water-pump and damage claims were not verified from an exact Honda source.' },
    ],
    summary: { rewrite_same_identity: 0, keep_published_pending_source: 9, total: 9 },
    rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary }, null, 2));
}

if (require.main === module) main();
module.exports = { FULL_RECORD_FIELDS, IDS, MODEL_LABELS, RESEARCH_NOTES, fullRecord, hashValue, normalizedFileHash };
