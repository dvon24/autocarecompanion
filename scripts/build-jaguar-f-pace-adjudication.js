/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { fullRecord, hashValue, normalizedFileHash } = require('./jaguar-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_jaguar-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-jaguar-f-pace-adjudication-2026-08-06.json');
const IDS = {
  coolant: 'jaguar-f-pace-coolant-crossover-v6-2017',
  infotainment: 'jaguar-f-pace-incontrol-freeze-2017',
  roof: 'jaguar-f-pace-panoramic-roof-creak-2017',
  rearDifferential: 'jaguar-f-pace-rear-diff-bushing-2017',
  waterPump: 'jaguar-f-pace-water-pump-ingenium-2017',
  transmission: 'jaguar-f-pace-zf-8hp-valve-body-2017',
};
const SOURCES = {
  coolant: 'https://static.nhtsa.gov/odi/tsbs/2016/SB-10098581-1020.pdf',
  infotainment: 'https://static.nhtsa.gov/odi/tsbs/2016/MC-10079866-7690.pdf',
  roof: 'https://static.nhtsa.gov/odi/tsbs/2016/SB-10080420-7690.pdf',
  rearDifferential: 'https://static.nhtsa.gov/odi/tsbs/2016/MC-10094530-1020.pdf',
  waterPump: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10177147-0001.pdf',
  transmission: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10142395-9999.pdf',
};
const PDF_SHA256 = {
  coolant: '3853d6a94ef441817428840c11accbcda2167828f1be101e7f1f8020c5c76172',
  infotainment: '558786160de99d58b33cda6c104a0e6ef11de21be9e5b1f8e2f3ec6a3e97a966',
  roof: 'fa08269c04d8b71a103210c6170bf8fdfa581ff4bccaa0d1e32a7ccb5869df2f',
  rearDifferential: '96b9e5349a324df5664771f3a56da3e5e7e7b8a6ff4bd4e47dc29d380f33f208',
  waterPump: '604bdc73f9458965ae7c29ef0767387b35db71ab578924f0e6e68e6394bc9f8e',
  transmission: '99624ff3287f9c0b27c3a0bf714f2cb706297997ec2acbd3fb51169f848c986e',
};
const VISUALLY_INSPECTED_PAGES = {
  coolant: [1, 2], infotainment: [4], roof: [1], rearDifferential: [6], waterPump: [1], transmission: [1, 2, 4],
};
const RECALL_QUERIES = Object.fromEntries(Array.from({ length: 10 }, (_, index) => 2017 + index).map((year) => [year, `https://api.nhtsa.gov/recalls/recallsByVehicle?make=JAGUAR&model=F-PACE&modelYear=${year}`]));
const EXPECTED_RECALLS = {
  2017: { status: 200, campaigns: ['17V153000', '17V491000', '17V678000', '18V052000'] },
  2018: { status: 200, campaigns: ['17V678000', '18V052000', '18V090000'] },
  2019: { status: 200, campaigns: ['19V039000', '21V118000'] },
  2020: { status: 200, campaigns: ['21V118000', '21V667000'] },
  2021: { status: 200, campaigns: ['21V667000', '22V525000', '24V451000', '26V248000'] },
  2022: { status: 200, campaigns: ['22V524000', '22V525000', '22V580000', '24V451000', '26V248000'] },
  2023: { status: 200, campaigns: ['23V045000', '24V451000', '26V248000'] },
  2024: { status: 200, campaigns: ['24V451000', '24V677000', '26V248000'] },
  2025: { status: 400, campaigns: [] },
  2026: { status: 200, campaigns: ['25V705000'] },
};
const KEEP_REASONS = {
  [IDS.coolant]: 'K404 is limited to 2017 F-PACE VIN 051144-062053 with the 3.0L supercharged V6 and documents a thermostat-housing coolant hose that may chafe on the accessory belt because a retention clip is missing. It does not establish crossover-pipe O-ring leakage under the supercharger, 2018-2020 scope, the V8/SVR fitment, corrosion or updated silicone O-rings, so the frozen row remains byte-for-byte unchanged.',
  [IDS.infotainment]: 'JLR acknowledged F-PACE InControl Touch Pro screen freezing and an ignition-cycle workaround, but the June 2016 source says the root cause was still under investigation and publication was TBC. It does not establish the frozen 2017-2021 year scope, underpowered-processor or heat mechanism, USB update, head-unit replacement, or navigation-cache remedy, so the row remains unchanged.',
  [IDS.roof]: 'JTB00368NAS3 is a panoramic-roof creak bulletin for the 2010-2016 XJ Range, not the F-PACE. Its tooth-contact and mechanism-arm causes cannot substantiate the frozen 2017-2023 F-PACE roof-frame, adhesive, seal-lubrication, rebonding or cassette-replacement claims, so the page remains unchanged.',
  [IDS.rearDifferential]: 'The official 2017 F-PACE rear-creak source identifies a deformed rear suspension coil spring isolator contacting the body and proposes new spring isolators. It does not establish premature rear differential mount-bushing wear, AWD torque causation, acceleration/deceleration clunking or polyurethane replacement, so the different component identity remains unchanged.',
  [IDS.waterPump]: 'H291 is limited to 2019-2021 F-PACE with the 2.0L Ingenium I4 and addresses excessive cooling-fan noise and eventual cooling-performance degradation with a PCM software update. It does not establish 2017-2023 scope, the 3.0L I6, P26B7, bearing seizure, impeller separation, rapid coolant loss, or pump-and-thermostat replacement, so the frozen row remains unchanged.',
  [IDS.transmission]: 'JTB00637NAS1 is limited to 2018 F-PACE VIN 249771-292228 with the 2.0L Ingenium I4 and attributes hesitation or harsh shifts to engine/transmission calibration software, with no parts required. It does not establish the frozen 2017-2023 multi-engine scope, P0730/P0657, premature solenoid wear, limp mode or a valve-body failure; it is not a valve body bulletin, so the row remains unchanged.',
};

function evidenceFor(id) {
  const evidence = {
    [IDS.coolant]: [{ kind: 'jlr-bulletin-mechanism-year-vin-mismatch', url: SOURCES.coolant, verifiedOn: '2026-08-06', observation: 'K404 documents a 2017 VIN-limited hose-retention-clip chafe condition, not crossover-pipe O-ring leakage under the supercharger.' }],
    [IDS.infotainment]: [{ kind: 'jlr-concern-confirmation-with-unresolved-cause', url: SOURCES.infotainment, verifiedOn: '2026-08-06', observation: 'JLR confirms touch-screen freezing reports but says the root cause remains under investigation and names no firmware or hardware repair.' }],
    [IDS.roof]: [{ kind: 'jlr-bulletin-model-mismatch', url: SOURCES.roof, verifiedOn: '2026-08-06', observation: 'JTB00368NAS3 applies to 2010-2016 XJ, not F-PACE.' }],
    [IDS.rearDifferential]: [{ kind: 'jlr-concern-component-mismatch', url: SOURCES.rearDifferential, verifiedOn: '2026-08-06', observation: 'The official F-PACE rear creak concerns coil spring isolators, not a differential mount bushing.' }],
    [IDS.waterPump]: [{ kind: 'jlr-service-action-year-engine-remedy-mismatch', url: SOURCES.waterPump, verifiedOn: '2026-08-06', observation: 'H291 applies to 2019-2021 2.0L I4 vehicles and prescribes a PCM update for pump operation, not mechanical pump replacement.' }],
    [IDS.transmission]: [{ kind: 'jlr-bulletin-mechanism-year-engine-mismatch', url: SOURCES.transmission, verifiedOn: '2026-08-06', observation: 'JTB00637NAS1 applies to a 2018 VIN-limited 2.0L I4 calibration condition and says no parts are required; it does not identify valve-body or solenoid wear.' }],
  };
  return evidence[id];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Jaguar' && row.model === 'F-PACE');
  if (modelRows.length !== 6) throw new Error(`expected 6 Jaguar F-PACE rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => {
    if (!KEEP_REASONS[current.id] || !evidenceFor(current.id)) throw new Error(`missing F-PACE decision: ${current.id}`);
    const before = fullRecord(current);
    return {
      id: current.id, model: current.model, action: 'keep_published_pending_source', reason: KEEP_REASONS[current.id],
      identityRule: 'No content, scope or publication-state changes; a partial or different JLR document cannot be expanded into the frozen indexed identity.',
      commerceDecision: 'unchanged-no-commerce-present', changedFields: [], evidence: evidenceFor(current.id),
      beforeSha256: hashValue(before), proposalSha256: hashValue(before), before, proposal: before,
    };
  });
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true,
    generatedOn: '2026-08-06', make: 'Jaguar', model: 'F-PACE',
    completionStatement: 'This packet reconciles all six frozen Jaguar F-PACE rows. Six official JLR PDFs were downloaded and their relevant pages visually reviewed, but every source has a material year, VIN, engine, model, component, mechanism or remedy mismatch; all six rows remain byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change, new issue or public-page change is authorized by this packet.',
      'All six F-PACE rows remain published and byte-for-byte unchanged.',
      'A partial year, VIN, engine, model, symptom, component, mechanism or remedy match cannot authorize a broader rewrite.',
      'The six frozen citation objects contain titles but no URLs and therefore are not treated as verified source evidence.',
      'Distinct recall identities remain deferred until the post-audit new-known-issues phase.',
    ],
    source: { snapshotFile: 'data/_jaguar-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: 6 },
    observations: [
      { code: 'f-pace-coolant-mechanism-year-vin-mismatch', severity: 'high', recordIds: [IDS.coolant], detail: 'The official 2017 VIN-limited hose-chafe condition is not the frozen crossover-pipe O-ring identity.' },
      { code: 'f-pace-infotainment-cause-remedy-unresolved', severity: 'high', recordIds: [IDS.infotainment], detail: 'JLR acknowledged freezing reports but stated the cause remained under investigation and supplied no frozen-row remedy.' },
      { code: 'f-pace-roof-model-mismatch', severity: 'high', recordIds: [IDS.roof], detail: 'The direct panoramic-roof creak bulletin applies to XJ, not F-PACE.' },
      { code: 'f-pace-rear-differential-component-mismatch', severity: 'high', recordIds: [IDS.rearDifferential], detail: 'The official rear creak is a coil-spring-isolator condition, not differential-bushing wear.' },
      { code: 'f-pace-water-pump-year-engine-remedy-mismatch', severity: 'high', recordIds: [IDS.waterPump], detail: 'H291 is a 2019-2021 I4 PCM-update program, not the frozen mechanical I4/I6 pump-failure identity.' },
      { code: 'f-pace-transmission-mechanism-year-engine-mismatch', severity: 'high', recordIds: [IDS.transmission], detail: 'JTB00637 is a 2018 VIN-limited I4 calibration condition with no parts required, not valve-body wear.' },
      { code: 'f-pace-existing-citations-missing-urls', severity: 'source-gap', recordIds: Object.values(IDS), detail: 'Every frozen citation has a title but no URL, so none can independently clear a rewrite.' },
      { code: 'all-f-pace-pages-preserved', severity: 'seo-safety', recordIds: Object.values(IDS), detail: 'Every indexed F-PACE record remains published with identical ID, title, years, category, content, citations and commerce.' },
    ],
    reviewSources: SOURCES, sourceArtifactSha256: PDF_SHA256, visuallyInspectedPages: VISUALLY_INSPECTED_PAGES,
    mismatchSources: { recallQueries: RECALL_QUERIES, expected: EXPECTED_RECALLS },
    summary: { rewrite_same_identity: 0, keep_published_pending_source: 6, total: 6 }, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary }, null, 2));
}

if (require.main === module) main();
module.exports = { EXPECTED_RECALLS, IDS, KEEP_REASONS, PDF_SHA256, RECALL_QUERIES, SOURCES, VISUALLY_INSPECTED_PAGES, evidenceFor };
