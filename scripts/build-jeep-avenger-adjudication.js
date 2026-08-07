/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { fullRecord, hashValue, normalizedFileHash } = require('./jeep-adjudication-utils');
const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_jeep-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-jeep-avenger-adjudication-2026-08-06.json');

const IDS = {
  camera: 'jeep-avenger-adas-camera-failure-2023',
  charge: 'jeep-avenger-ev-charge-port-issue-2023',
  infotainment: 'jeep-avenger-infotainment-reboot-2023',
  startStop: 'jeep-avenger-start-stop-malfunction-2023',
  steering: 'jeep-avenger-steering-rack-defect-2023',
};
const SOURCES = {
  rdwModelRefs: 'https://opendata.rdw.nl/resource/mu2x-mu5e.json?%24where=upper%28merk%29%3D%27JEEP%27%20AND%20upper%28type%29%3D%27AVENGER%27&%24limit=5000',
  rdwActions: 'https://opendata.rdw.nl/resource/j9yg-7rg9.json?%24where=referentiecode_rdw%20in%28%27MGP240312%27%2C%27MGP250060%27%2C%27MGP250067%27%2C%27MGP250283%27%2C%27MGP250387%27%2C%27MGP260097%27%29&%24limit=100',
};
const EXPECTED_RDW_REFERENCES = ['MGP240312', 'MGP250060', 'MGP250067', 'MGP250283', 'MGP250387', 'MGP260097'];
const EXPECTED_RDW_ACTIONS = {
  MGP240312: {
    producerReference: '84B',
    defectMarkers: ['elektrische stuurbekrachtigingsmotor', 'stuurhuis', 'scheuren', 'plastic onderdelen'],
    consequenceMarkers: ['zware besturing', 'blokkeren van de stuurinrichting', 'risico op een ongeval'],
    remedyMarkers: ['merkdealer', 'stuurhuis vervangen'],
  },
  MGP250387: {
    producerReference: 'MYQ',
    defectMarkers: ['start&stop functie werkt mogelijk niet', 'verkeerde codering', 'Body Control Module'],
    consequenceMarkers: ['verhoogde Co2 uitstoot'],
    remedyMarkers: ['software', 'Body Control Module', 'updaten'],
  },
};
const RECALL_QUERIES = Object.fromEntries([2023, 2024, 2025].map((year) => [year, `https://api.nhtsa.gov/recalls/recallsByVehicle?make=JEEP&model=AVENGER&modelYear=${year}`]));
const EXPECTED_RECALLS = { 2023: { status: 400, campaigns: [] }, 2024: { status: 400, campaigns: [] }, 2025: { status: 400, campaigns: [] } };

const KEEP_REASONS = {
  [IDS.camera]: 'The frozen citation is a secondary reliability article, not a pinned manufacturer or government campaign. The exact UK camera action is not present in the official RDW Avenger reference set, and the frozen page additionally asserts 2023 scope, DTC U0428 and simultaneous AEB/LKA disablement that were not established by an accessible primary campaign record. The page remains byte-for-byte unchanged rather than expanding the recall identity.',
  [IDS.charge]: 'The generic NHTSA vehicle page is not an exact primary source for this European-market CCS2 charge-port latch and DC-communication identity, the NHTSA recall API returns no Jeep Avenger result, and the frozen Reddit URL contains a placeholder path. The official RDW Avenger recall set is only a boundary and cannot prove the issue absent, so the row remains byte-for-byte unchanged.',
  [IDS.infotainment]: 'The generic NHTSA vehicle page does not establish a 2023-2025 Avenger Uconnect reboot/black-screen identity, and the frozen Reddit URL contains a placeholder path. No exact Jeep/Stellantis primary bulletin was pinned for the firmware, eMMC, USB-reset or disable-OTA claims, so the row remains byte-for-byte unchanged.',
  [IDS.startStop]: 'Official RDW action MGP250387/MYQ says incorrect Body Control Module coding can cause Start&Stop not to operate, so the engine continues to run and CO2 emissions rise. It does not describe engine stalling, failed restarts, a 2023-2024 mild-hybrid MCU calibration, P0606/P1A0F, a 48V battery or belt-starter-generator replacement. This is an outcome, year-scope and remedy mismatch, so the row remains byte-for-byte unchanged.',
  [IDS.steering]: 'Official RDW action MGP240312/84B says the electric power-steering motor housing can crack and release plastic parts, causing heavy steering or possible steering lock; the remedy is to replace the steering rack. It does not establish the frozen 2023 year scope, vague steering, pulling, progressive tire wear or the stated generic out-of-specification mechanism. The partial cause and year scope cannot authorize a rewrite, so the row remains byte-for-byte unchanged.',
};

function evidenceFor(id) {
  if (id === IDS.steering) return [{ kind: 'rdw-official-recall-cause-and-year-scope-mismatch', url: SOURCES.rdwActions, verifiedOn: '2026-08-06', observation: 'MGP240312/84B identifies cracking of the electric-assist motor housing and a rack replacement, not the full frozen mechanism, symptoms or 2023 scope.' }];
  if (id === IDS.startStop) return [{ kind: 'rdw-official-recall-outcome-year-remedy-mismatch', url: SOURCES.rdwActions, verifiedOn: '2026-08-06', observation: 'MGP250387/MYQ describes Stop&Start failing to shut the engine off because of BCM coding and an emissions consequence, not restart failure or stalling.' }];
  return [
    { kind: 'rdw-official-registry-boundary-not-negative-proof', url: SOURCES.rdwModelRefs, verifiedOn: '2026-08-06', observation: 'The public Avenger reference set contains distinct campaign identities and cannot establish or disprove this non-matching frozen issue.' },
    { kind: 'nhtsa-non-us-vehicle-registry-boundary', url: RECALL_QUERIES[2023], verifiedOn: '2026-08-06', observation: 'The NHTSA Avenger query returns no vehicle result and is not an exact primary source for this European-market page.' },
  ];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Jeep' && row.model === 'Avenger');
  if (modelRows.length !== 5) throw new Error(`expected 5 Jeep Avenger rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => {
    if (!KEEP_REASONS[current.id]) throw new Error(`missing Avenger decision: ${current.id}`);
    const before = fullRecord(current);
    return { id: current.id, model: current.model, action: 'keep_published_pending_source', reason: KEEP_REASONS[current.id], identityRule: 'No content, scope, remedy, commerce or publication-state changes; a partial, inaccessible, non-US or different-outcome source cannot replace the frozen indexed identity.', commerceDecision: current.communityRecommendations.some((item) => item.affiliateUrl) ? 'unchanged-affiliate-pending-source' : 'unchanged-no-affiliate-commerce-present', changedFields: [], evidence: evidenceFor(current.id), beforeSha256: hashValue(before), proposalSha256: hashValue(before), before, proposal: before };
  });
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true,
    generatedOn: '2026-08-06', make: 'Jeep', model: 'Avenger',
    completionStatement: 'This packet reconciles all five frozen Jeep Avenger rows against the official RDW public recall datasets and the NHTSA vehicle boundary. Neither official Avenger action matches the frozen cause, outcome and year scope closely enough to rewrite; all five rows remain byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change, new issue or public-page change is authorized by this packet.',
      'All five Avenger rows remain published and byte-for-byte unchanged.',
      'A different cause, model year, outcome, software module, code, remedy or commerce claim cannot be substituted into an indexed page.',
      'A government registry result is a coverage boundary and is not negative proof that a non-listed issue does not exist.',
      'Distinct Avenger recalls remain deferred until the post-audit new-known-issues phase.',
    ],
    source: { snapshotFile: 'data/_jeep-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: 5 },
    observations: [
      { code: 'avenger-steering-cause-year-scope-mismatch', severity: 'high', recordIds: [IDS.steering], detail: 'RDW 84B supports a cracking electric-assist motor housing and rack replacement, not the frozen 2023-2024 generalized narrative.' },
      { code: 'avenger-start-stop-outcome-mismatch', severity: 'high', recordIds: [IDS.startStop], detail: 'RDW MYQ is an engine-keeps-running emissions coding action, not restart failure or stalling.' },
      { code: 'avenger-camera-primary-record-gap', severity: 'source-gap', recordIds: [IDS.camera], detail: 'The secondary citation cannot clear the page year, DTC and simultaneous-system claims.' },
      { code: 'avenger-charge-and-infotainment-placeholder-sources', severity: 'source-gap', recordIds: [IDS.charge, IDS.infotainment], detail: 'Generic NHTSA pages and placeholder Reddit URLs do not substantiate these identities.' },
      { code: 'all-avenger-pages-preserved', severity: 'seo-safety', recordIds: Object.values(IDS), detail: 'Every indexed Avenger record remains published and byte-for-byte unchanged.' },
    ],
    reviewSources: SOURCES, rdwReferenceCodes: EXPECTED_RDW_REFERENCES, rdwActions: EXPECTED_RDW_ACTIONS,
    mismatchSources: { recallQueries: RECALL_QUERIES, expected: EXPECTED_RECALLS },
    summary: { rewrite_same_identity: 0, keep_published_pending_source: 5, total: 5 }, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary }, null, 2));
}
if (require.main === module) main();
module.exports = { EXPECTED_RDW_ACTIONS, EXPECTED_RDW_REFERENCES, EXPECTED_RECALLS, IDS, KEEP_REASONS, RECALL_QUERIES, SOURCES, evidenceFor };
