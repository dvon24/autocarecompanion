/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { fullRecord, hashValue, normalizedFileHash } = require('./kia-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_kia-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-kia-borrego-adjudication-2026-08-06.json');
const IDS = {
  rust: 'kia-borrego-frame-rust-2009',
  steering: 'kia-borrego-power-steering-cooler-2009',
  timing: 'kia-borrego-timing-chain-2009',
  transfer: 'kia-borrego-transfer-case-2009',
};
const EXPECTED_RECALLS = {
  2009: { status: 200, campaigns: ['12V245000', '13V114000', '23V692000'] },
  2010: { status: 200, campaigns: ['23V652000', '23V692000'] },
  2011: { status: 200, campaigns: ['23V652000', '23V692000'] },
};
const RECALL_QUERIES = Object.fromEntries(Object.keys(EXPECTED_RECALLS).map((year) => [year, `https://api.nhtsa.gov/recalls/recallsByVehicle?make=KIA&model=BORREGO&modelYear=${year}`]));
const CAMPAIGN_COMPONENTS = {
  '12V245000': 'PEDALS AND LINKAGES',
  '13V114000': 'BRAKE LIGHTS:SWITCH',
  '23V652000': 'CONTROL UNIT/MODULE',
  '23V692000': 'ROOF AND PILLARS',
};
const CAMPAIGN_QUERIES = Object.fromEntries(Object.keys(CAMPAIGN_COMPONENTS).map((campaign) => [campaign, `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}`]));
const KEEP_REASONS = {
  [IDS.rust]: 'The frozen sources are two owner-forum threads and a secondary recall/complaint index; none is a Kia/NHTSA document establishing a 2009-2011 Borrego frame-perforation population, inadequate factory coating, the listed hot spots, annual chemical treatment or structural weld procedure. The official Borrego campaigns in the frozen years concern brake-pedal mounts, stop-lamp switches, HECU fire risk and headliner plates—not frame corrosion—so this safety-sensitive row remains byte-for-byte unchanged.',
  [IDS.steering]: 'The sole citation uses a placeholder-style YouTube ID and cannot substantiate a 2009-2010 cooler-line/crimp failure population, debris exposure, rack-damage pathway or lock-to-lock bleeding procedure. Generic pump and “compatible with most systems” fluid searches do not establish the cooler/line identity or exact fluid/fitment, so the row remains byte-for-byte unchanged.',
  [IDS.timing]: 'Two secondary sources do not establish a 2009-2011 3.8L Lambda timing-chain defect population, guide-fragment outcome, interference-engine claim, 8-12-hour repair or two-to-four-week deadline. No exact Cloyes manufacturer fitment source was captured for frozen part 9-0908SA, and its link is only an Amazon search, so the row remains byte-for-byte unchanged.',
  [IDS.transfer]: 'The forum and two secondary overview pages do not establish a BorgWarner chain/encoder-motor failure population, 30,000-mile interval or Mohave donor interchange. The frozen solution calls for an unspecified “correct ATF” while its commerce recommends 75W-90 gear oil for both differential and transfer case, an unresolved fluid contradiction; P1875/C0327 and generic gasket commerce also lack exact Kia support. The row remains byte-for-byte unchanged.',
};

function evidenceFor(id) {
  const common = { kind: 'official-recall-inventory-boundary-not-broad-claim-proof', url: RECALL_QUERIES[2009], supportingUrls: Object.values(RECALL_QUERIES), campaignDetailUrls: Object.values(CAMPAIGN_QUERIES), verifiedOn: '2026-08-06' };
  if (id === IDS.rust) return [{ ...common, observation: 'The complete 2009-2011 Borrego recall boundary contains brake-pedal, stop-lamp, HECU and headliner-plate campaigns, not a frame-corrosion campaign.' }];
  if (id === IDS.transfer) return [{ ...common, observation: 'No campaign in the official frozen-year boundary establishes a transfer-case chain, encoder-motor, DTC or fluid claim; the frozen repair advice is internally inconsistent about ATF versus 75W-90.' }];
  return [{ ...common, observation: `The complete 2009-2011 Borrego recall boundary does not substantiate the broad frozen claims for ${id}.` }];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Kia' && row.model === 'Borrego');
  const expectedIds = Object.values(IDS).sort();
  if (modelRows.length !== 4 || JSON.stringify(modelRows.map((row) => row.id).sort()) !== JSON.stringify(expectedIds)) throw new Error('Borrego frozen-ID coverage mismatch');
  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    return {
      id: current.id,
      model: current.model,
      action: 'keep_published_pending_source',
      reason: KEEP_REASONS[current.id],
      identityRule: 'Secondary/forum evidence, unresolved fluid conflicts and unsupported exact fitment require a byte-for-byte hold; no indexed identity field may be silently changed.',
      commerceDecision: current.fixParts.length || current.communityRecommendations.some((item) => item.affiliateUrl || item.affiliateLink || item.amazonLink) ? 'unchanged-search-commerce-pending-exact-fitment' : 'unchanged-no-commerce',
      changedFields: [],
      evidence: evidenceFor(current.id),
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
    make: 'Kia',
    model: 'Borrego',
    completionStatement: 'All four frozen Kia Borrego rows are reconciled. None has exact primary evidence sufficient for a safe same-identity rewrite, so every row remains byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change, new issue or public-page change is authorized by this packet.',
      'All four Borrego rows remain published and byte-for-byte unchanged.',
      'Secondary/forum evidence cannot authorize structural, timing, steering or transfer-case repair claims.',
      'Internal fluid contradictions and search-result commerce cannot prove exact fitment.',
      'New issue identities remain deferred until the remaining-make audit is complete.',
    ],
    source: { snapshotFile: 'data/_kia-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: 4 },
    observations: [
      { code: 'borrego-transfer-fluid-contradiction', severity: 'critical', recordIds: [IDS.transfer], detail: 'The solution calls for unspecified ATF while commerce recommends 75W-90 gear oil for the transfer case and differential.' },
      { code: 'borrego-timing-part-fitment-unverified', severity: 'critical', recordIds: [IDS.timing], detail: 'Frozen Cloyes 9-0908SA has no captured manufacturer application proof and is linked only through a search URL.' },
      { code: 'borrego-frame-structural-guidance-unverified', severity: 'high', recordIds: [IDS.rust], detail: 'The safety-sensitive frame perforation, welding and treatment guidance has no exact Kia/NHTSA source.' },
      { code: 'borrego-steering-placeholder-source', severity: 'high', recordIds: [IDS.steering], detail: 'The sole frozen citation uses a placeholder-style video ID, while its commerce covers a pump and generic fluid rather than the claimed cooler line.' },
      { code: 'all-borrego-pages-preserved', severity: 'seo-safety', recordIds: expectedIds, detail: 'Every frozen Borrego ID, title, category, year set and publication state remains untouched.' },
    ],
    recallInventory: { queries: RECALL_QUERIES, expected: EXPECTED_RECALLS, campaignQueries: CAMPAIGN_QUERIES, campaignComponents: CAMPAIGN_COMPONENTS },
    summary: { rewrite_same_identity: 0, keep_published_pending_source: 4, total: 4 },
    rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary }, null, 2));
}

if (require.main === module) main();
module.exports = { CAMPAIGN_COMPONENTS, CAMPAIGN_QUERIES, EXPECTED_RECALLS, IDS, KEEP_REASONS, RECALL_QUERIES, evidenceFor };
