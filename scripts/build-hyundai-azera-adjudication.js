/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { fullRecord, hashValue, normalizedFileHash } = require('./hyundai-adjudication-utils');
const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-hyundai-azera-adjudication-2026-08-06.json');
const IDS = {
  steeringLeak: 'hyundai-azera-power-steering-leak-2006', starter: 'hyundai-azera-starter-motor-2006',
  strutBearing: 'hyundai-azera-strut-bearing-2006', timingChain: 'hyundai-azera-timing-chain-tensioner-2006',
  transmission: 'hyundai-azera-transmission-hesitation-2006',
};
const MISMATCH_SOURCES = {
  mdpsRepair: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10180981-0001.pdf',
  inhibitorSwitch: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10128599-9999.pdf',
  harshDelayedShift: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10138240-9999.pdf',
};
const KEEP_REASONS = {
  [IDS.steeringLeak]: 'The frozen 2006-2011 hydraulic power-steering leak row relies on a generic complaint page and an incomplete bulletin citation. Hyundai TSB 20-ST-001H-2 concerns column-mounted motor-driven power steering on Azera HG vehicles, not hydraulic hose, pump or rack leaks, so the row remains byte-for-byte unchanged.',
  [IDS.starter]: 'A generic complaint page, secondary TSB index and Reddit thread do not establish one 2006-2017 Azera starter-solenoid defect or hot-weather pattern. Hyundai Campaign T2M concerns a 2017 inhibitor switch and DTC P0705, not a starter motor, so the row remains byte-for-byte unchanged.',
  [IDS.strutBearing]: 'A generic complaint page and unrelated repair video do not establish one 2006-2017 Azera front-strut-bearing defect or mileage threshold. The MDPS bearing-noise bulletin concerns steering-column components, not strut mounts, so the row remains byte-for-byte unchanged.',
  [IDS.timingChain]: 'The frozen timing-chain row cites an unlinked bulletin number and a generic complaint page. No exact Hyundai/NHTSA primary document was found that establishes one 2006-2011 Lambda V6 tensioner defect, interference-damage claim, DTC set, repair scope or cost, so the row remains byte-for-byte unchanged.',
  [IDS.transmission]: 'Hyundai TSB 18-AT-004 provides GDS diagnosis for harsh or delayed shifts on 2011 Azera TG and 2012+ Azera HG vehicles. It does not establish the frozen 2006-2011 cold 1-2 delay, torque-converter shudder, fluid interval or progressive failure narrative, so it is not substituted and the row remains byte-for-byte unchanged.',
};

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Hyundai' && row.model === 'Azera');
  if (modelRows.length !== 5) throw new Error(`expected 5 Hyundai Azera rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    const evidence = [];
    if ([IDS.steeringLeak, IDS.strutBearing].includes(current.id)) evidence.push({ kind: 'component-mismatch', url: MISMATCH_SOURCES.mdpsRepair, verifiedOn: '2026-08-06', observation: 'TSB 20-ST-001H-2 concerns column-mounted MDPS components, not the frozen hydraulic steering or strut-bearing identity.' });
    if (current.id === IDS.starter) evidence.push({ kind: 'component-mismatch', url: MISMATCH_SOURCES.inhibitorSwitch, verifiedOn: '2026-08-06', observation: 'Campaign T2M concerns a 2017 inhibitor switch and possible P0705, not starter-motor no-crank.' });
    if (current.id === IDS.transmission) evidence.push({ kind: 'scope-mismatch', url: MISMATCH_SOURCES.harshDelayedShift, verifiedOn: '2026-08-06', observation: 'TSB 18-AT-004 is a 2011+ harsh/delayed-shift diagnostic bulletin and does not establish the frozen torque-converter and 2006-2011 failure narrative.' });
    return { id: current.id, model: current.model, action: 'keep_published_pending_source', reason: KEEP_REASONS[current.id], identityRule: 'No content or publication-state changes; a different component, symptom, bulletin or generation cannot replace this indexed issue.', commerceDecision: 'unchanged-pending-audit', changedFields: [], evidence, beforeSha256: hashValue(before), proposalSha256: hashValue(before), before, proposal: before };
  });
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true,
    generatedOn: '2026-08-06', make: 'Hyundai', model: 'Azera',
    completionStatement: 'This packet reconciles all five frozen Hyundai Azera rows. No same-identity primary-source rewrite cleared the gate; all five remain byte-for-byte unchanged with nearby official mismatches exposed for independent review.',
    safetyContract: ['No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.', 'All five rows remain published and byte-for-byte unchanged.', 'An unrelated campaign, bulletin, component, generation or model may never replace the issue named by an existing indexed page.', 'Existing commerce remains frozen rather than being silently rewritten without exact repair-role evidence.', 'Independent row-by-row approval is required before any separate correction path may be created.'],
    source: { snapshotFile: 'data/_hyundai-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, azeraRecordCount: modelRows.length },
    observations: [
      { code: 'hydraulic-versus-mdps-identity-mismatch', severity: 'independent-review-required', recordIds: [IDS.steeringLeak, IDS.strutBearing], detail: 'The exact Hyundai steering bulletin covers column-mounted MDPS repair and bearing noise, not the frozen hydraulic leak or strut-bearing pages.' },
      { code: 'inhibitor-switch-not-starter', severity: 'independent-review-required', recordIds: [IDS.starter], detail: 'Campaign T2M is a 2017 inhibitor-switch repair associated with P0705; it cannot support the starter-solenoid page.' },
      { code: 'transmission-bulletin-narrower-identity', severity: 'independent-review-required', recordIds: [IDS.transmission], detail: 'TSB 18-AT-004 covers 2011+ harsh/delayed-shift GDS analysis and does not establish the frozen torque-converter shudder narrative or 2006-2010 scope.' },
      { code: 'unverified-timing-chain-claims-frozen', severity: 'independent-review-required', recordIds: [IDS.timingChain], detail: 'No exact primary document was found for the claimed Lambda tensioner defect and repair, so it remains unchanged.' },
    ],
    mismatchSources: MISMATCH_SOURCES,
    summary: { rewrite_same_identity: 0, keep_published_pending_source: 5, total: 5 }, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary }, null, 2));
}
if (require.main === module) main();
module.exports = { IDS, KEEP_REASONS, MISMATCH_SOURCES, fullRecord, hashValue, normalizedFileHash };
