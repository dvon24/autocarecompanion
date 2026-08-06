/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { fullRecord, hashValue, normalizedFileHash } = require('./hyundai-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-hyundai-casper-adjudication-2026-08-06.json');

const IDS = {
  turbo: 'hyundai-casper-1-0-t-gdi-turbocharger-defect-rpm-rises-but-car-won-t-accele',
  threeWayValve: 'hyundai-casper-casper-electric-3-way-coolant-valve-failure-fire-risk-recall',
  coolantHub: 'hyundai-casper-casper-electric-coolant-hub-drive-module-defect-ewp-warning',
  iccu: 'hyundai-casper-casper-electric-iccu-failure-slow-charging-stops-working',
  rainwaterLeak: 'hyundai-casper-rainwater-leak-into-passenger-footwell-through-cowl-air-inta',
  idleVibration: 'hyundai-casper-severe-idle-vibration-when-c-rear-defroster-run-together',
};

const OFFICIAL_REGISTRY = {
  threeWayValve: {
    indexUrl: 'https://www.car.go.kr/ri/stat/list.do',
    recordType: 'recall',
    recordId: '6154',
    retrieval: 'POST /ri/stat/detail.do with recallId=6154 and ctype=O',
    verifiedOn: '2026-08-06',
    facts: {
      vehicle: 'Casper Electric (AX1 EV)',
      productionPeriod: '2024-06-21 through 2026-04-24',
      affectedCount: 18961,
      campaignStart: '2026-05-12',
      defect: 'An inadequately designed 3-way valve can suffer an internal shaft failure, creating smoke and fire risk.',
      remedy: 'Replace the 3-way valve and fuse; replace the connector if contamination or burning is found.',
    },
  },
  coolantHub: {
    indexUrl: 'https://www.car.go.kr/ri/grts/list.do',
    recordType: 'free-repair',
    recordId: '3750',
    retrieval: 'POST /ri/grts/detail.do with gratischeckId=3750 and ctype=O',
    verifiedOn: '2026-08-06',
    facts: {
      vehicle: 'Casper Electric (AX EV)',
      productionPeriod: '2024-07-06 through 2024-09-21',
      affectedCount: 2245,
      campaignStart: '2024-10-16',
      defect: 'Intermittent EWP operation can cause a false low-coolant diagnosis and a drive-motor coolant-system warning.',
      remedy: 'Replace the driver-coolant hub.',
    },
  },
  iccu: {
    indexUrl: 'https://www.car.go.kr/ri/grts/list.do',
    recordType: 'free-repair',
    recordId: '4279',
    retrieval: 'POST /ri/grts/detail.do with gratischeckId=4279 and ctype=O',
    verifiedOn: '2026-08-06',
    facts: {
      vehicle: 'Casper Electric (AX EV)',
      productionPeriod: '2024-07-16 through 2025-08-22',
      affectedCount: 13587,
      campaignStart: '2025-09-05',
      defect: 'An intermittent ICCU internal failure during V2L use can cause AC slow-charging malfunction.',
      remedy: 'Diagnose specific fault codes and test slow charging, then update ICCU software or replace the ICCU.',
    },
  },
};

const KEEP_REASONS = {
  [IDS.turbo]: 'The frozen row depends on Korean press and owner material for a narrow 2023 turbocharger population, complaint count, supplier investigation, warranty outcome and replacement remedy. No directly linkable Hyundai or Korean-government primary document was found that establishes the complete same-identity claim, so the row remains byte-for-byte unchanged.',
  [IDS.threeWayValve]: 'Korea\'s official recall registry record 6154 confirms the central 3-way-valve fire-risk recall, production period, count and replacement remedy. The frozen row also adds a prior 2025 campaign, o-ring leaks, HVAC and coolant-leak symptoms, parts shortages and labor-time claims that the registry entry does not establish. Because the registry exposes the detail only through a POST-backed view rather than a stable record deep link, no partial rewrite or broad list citation is proposed; the row remains byte-for-byte unchanged for independent review.',
  [IDS.coolantHub]: 'Official free-repair record 3750 materially conflicts with the frozen row: it covers 2,245 Casper EVs produced 2024-07-06 through 2024-09-21, not 12,004 vehicles produced 2024-02-28 through 2025-04-16. It describes intermittent EWP operation causing a false low-coolant diagnosis and prescribes driver-coolant-hub replacement. The current identity and scope therefore require independent correction rather than an automated substitution, so the row remains byte-for-byte unchanged.',
  [IDS.iccu]: 'Official free-repair record 4279 confirms 13,587 Casper EVs produced 2024-07-16 through 2025-08-22 and an intermittent V2L-related ICCU fault that can disrupt AC slow charging. The frozen row adds wider fleet inheritance, recall terminology, 12V consequences, fuse/components and repair-cost claims not established by that entry. With no stable record-specific GET link, the row remains byte-for-byte unchanged pending an independently approved scoped rewrite and citation path.',
  [IDS.rainwaterLeak]: 'The frozen rainwater-intrusion row relies on press and owner material for complaint counts, root cause, campaign timing and component replacement. No directly linkable Hyundai or Korean-government primary document was found that establishes the same issue and remedy, so the row remains byte-for-byte unchanged.',
  [IDS.idleVibration]: 'The frozen idle-vibration row relies on press and an unofficial campaign summary for complaint totals, electrical-load diagnosis and ECU remedy. No directly linkable Hyundai or Korean-government primary document was found that establishes the complete same-identity campaign, so the row remains byte-for-byte unchanged.',
};

function evidenceFor(id) {
  if (id === IDS.threeWayValve) return [{ kind: 'official-registry-partial-support', ...OFFICIAL_REGISTRY.threeWayValve, observation: 'The primary record supports the core recall but not all frozen symptoms, prior-campaign history or service-detail claims.' }];
  if (id === IDS.coolantHub) return [{ kind: 'official-registry-material-scope-conflict', ...OFFICIAL_REGISTRY.coolantHub, observation: 'The official count, production dates and stated failure mechanism conflict with the frozen row.' }];
  if (id === IDS.iccu) return [{ kind: 'official-registry-partial-support', ...OFFICIAL_REGISTRY.iccu, observation: 'The primary record supports the V2L/slow-charging campaign but not every frozen consequence or repair claim.' }];
  return [];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Hyundai' && row.model === 'Casper');
  if (modelRows.length !== 6) throw new Error(`expected 6 Hyundai Casper rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    return {
      id: current.id,
      model: current.model,
      action: 'keep_published_pending_source',
      reason: KEEP_REASONS[current.id],
      identityRule: 'No content or publication-state changes; unsupported facts and a different scope, component, remedy or campaign cannot replace this indexed issue.',
      commerceDecision: 'unchanged-pending-audit',
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
    make: 'Hyundai',
    model: 'Casper',
    completionStatement: 'This packet reconciles all six frozen Hyundai Casper rows. None is changed: three primary registry records are exposed for independent review, including a material production-period and vehicle-count conflict in the coolant-hub row.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All six rows remain published and byte-for-byte unchanged.',
      'An unsupported campaign scope, symptom, component, remedy or model may never replace the issue named by an existing indexed page.',
      'A registry search/list page is not treated as an issue-specific deep link; POST-only record evidence is review metadata, not a proposed public citation.',
      'Existing commerce remains frozen rather than being silently rewritten without exact repair-role evidence.',
      'Independent row-by-row approval is required before any separate correction path may be created.',
    ],
    source: {
      snapshotFile: 'data/_hyundai-deeplink-snapshot-2026-08-06.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      casperRecordCount: modelRows.length,
    },
    observations: [
      { code: 'coolant-hub-official-scope-conflict', severity: 'independent-review-required', recordIds: [IDS.coolantHub], detail: 'Official record 3750 covers 2,245 vehicles built 2024-07-06 through 2024-09-21; the frozen row claims 12,004 vehicles built 2024-02-28 through 2025-04-16.' },
      { code: 'post-only-registry-records-not-public-deep-links', severity: 'independent-review-required', recordIds: [IDS.threeWayValve, IDS.coolantHub, IDS.iccu], detail: 'The registry detail records are primary evidence but require POST-backed navigation. Broad list URLs are not substituted as public citations.' },
      { code: 'three-way-valve-row-exceeds-official-record', severity: 'independent-review-required', recordIds: [IDS.threeWayValve], detail: 'The official recall supports the core shaft/fire-risk identity, but several frozen history, symptom and service-detail claims remain secondary-only.' },
      { code: 'iccu-row-exceeds-official-record', severity: 'independent-review-required', recordIds: [IDS.iccu], detail: 'The official free-repair entry supports V2L-related ICCU slow-charging malfunction but not the full frozen consequence and repair narrative.' },
      { code: 'three-secondary-only-rows-frozen', severity: 'independent-review-required', recordIds: [IDS.turbo, IDS.rainwaterLeak, IDS.idleVibration], detail: 'No directly linkable same-identity Hyundai or Korean-government primary document was found for the complete frozen claim.' },
    ],
    officialRegistry: OFFICIAL_REGISTRY,
    summary: { rewrite_same_identity: 0, keep_published_pending_source: 6, total: 6 },
    rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary }, null, 2));
}

if (require.main === module) main();
module.exports = { IDS, KEEP_REASONS, OFFICIAL_REGISTRY, evidenceFor, fullRecord, hashValue, normalizedFileHash };
