/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { fullRecord, hashValue, normalizedFileHash } = require('./jaguar-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_jaguar-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-jaguar-e-pace-adjudication-2026-08-06.json');
const IDS = {
  transmission: 'jaguar-e-pace-9-speed-harsh-shift-2018',
  infotainment: 'jaguar-e-pace-incontrol-freeze-2018',
  roof: 'jaguar-e-pace-panoramic-roof-leak-2018',
  coolant: 'jaguar-e-pace-turbo-coolant-hose-ingenium-2018',
};
const SOURCES = {
  transmission: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10158613-9999.pdf',
  infotainment: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10167329-0001.pdf',
  roof: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10202151-0001.pdf',
  coolant: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10206284-0001.pdf',
};
const PDF_SHA256 = {
  transmission: '7df7abbfb99bf3809aa34ac44394ec49e51f46b785ec2d8d10c73591b4a986a9',
  infotainment: '2a32eb756069d54aad259945006ef85065c889165b73e7da0b0a22b9179c7683',
  roof: 'b7394f58146675ce8a4ca73731c4bce79d4c56e73b4323bccc15ddb4a4a6f861',
  coolant: '47d244ba72f5b6e2cb8facf4423a995d764174083090b64a199867235d3392a7',
};
const RECALL_QUERIES = Object.fromEntries(Array.from({ length: 9 }, (_, index) => 2018 + index).map((year) => [year, `https://api.nhtsa.gov/recalls/recallsByVehicle?make=JAGUAR&model=E-PACE&modelYear=${year}`]));
const EXPECTED_RECALLS = {
  2018: { status: 200, campaigns: ['18V090000', '18V140000'] },
  2019: { status: 400, campaigns: [] },
  2020: { status: 400, campaigns: [] },
  2021: { status: 200, campaigns: ['24V201000', '24V278000', '25V466000', '26V248000'] },
  2022: { status: 200, campaigns: ['24V201000', '24V278000', '25V466000', '26V248000'] },
  2023: { status: 200, campaigns: ['24V201000', '24V278000', '25V466000'] },
  2024: { status: 200, campaigns: ['24V201000', '25V466000'] },
  2025: { status: 400, campaigns: [] },
  2026: { status: 400, campaigns: [] },
};
const KEEP_REASONS = {
  [IDS.transmission]: 'JLR bulletin JTB00688 applies only to 2018 E-PACE VINs Z00001-Z33577 and a harsh 4th-to-5th upshift at 30-50 km/h, with P07D4-07 or P07DF-07. It does not establish the frozen 2018-2023 range, P0730, hill hunting, cold hesitation, fluid interval or valve-body remedy, so the broader indexed row remains byte-for-byte unchanged.',
  [IDS.infotainment]: 'JLR SSM74590 covers an iOS 13-or-later Bluetooth pairing incompatibility and explicitly says not to replace the infotainment master controller. It does not establish the frozen 2018-2021 freeze, reboot, black-screen, processor-overload, base-Touch hardware or DIY USB-update claims, so this different outcome remains unchanged.',
  [IDS.roof]: 'JLR SSM75536 concerns an inoperable panoramic-roof sun blind caused by motor oxidation and describes recalibration. It is not a water-leak, blocked-drain or roof-seal bulletin and cannot support the frozen 2018-2023 cabin-leak identity or its compressed-air remedy, so the row remains unchanged.',
  [IDS.coolant]: 'JLR SSM75559 concerns diagnosis of an AJ20-P4 thermostat leak and says to pressure-test the system and not replace the thermostat without a confirmed leak. It is not evidence of a turbo coolant hose splitting near the turbo, updated silicone hoses or a 50,000-mile replacement interval, so the frozen turbo-hose row remains unchanged.',
};

function evidenceFor(id) {
  const evidence = {
    [IDS.transmission]: [{ kind: 'jlr-bulletin-partial-year-vin-symptom-scope', url: SOURCES.transmission, verifiedOn: '2026-08-06', observation: 'JTB00688 is limited to 2018 VIN Z00001-Z33577, harsh 4th-to-5th shift at 30-50 km/h and P07D4-07/P07DF-07; it does not support the frozen six-year P0730 identity.' }],
    [IDS.infotainment]: [{ kind: 'jlr-bulletin-outcome-mismatch', url: SOURCES.infotainment, verifiedOn: '2026-08-06', observation: 'SSM74590 addresses iOS 13+ Bluetooth pairing and says not to replace the infotainment master controller; it does not document freezing or rebooting.' }],
    [IDS.roof]: [{ kind: 'jlr-bulletin-outcome-mismatch', url: SOURCES.roof, verifiedOn: '2026-08-06', observation: 'SSM75536 documents an inoperable panoramic-roof sun blind, not water entering the cabin through drains or seals.' }],
    [IDS.coolant]: [{ kind: 'jlr-bulletin-component-mismatch', url: SOURCES.coolant, verifiedOn: '2026-08-06', observation: 'SSM75559 documents thermostat-leak diagnosis on AJ20-P4 engines, not a turbo coolant hose failure or updated hose.' }],
  };
  return evidence[id];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Jaguar' && row.model === 'E-PACE');
  if (modelRows.length !== 4) throw new Error(`expected 4 Jaguar E-PACE rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => {
    if (!KEEP_REASONS[current.id] || !evidenceFor(current.id)) throw new Error(`missing E-PACE decision: ${current.id}`);
    const before = fullRecord(current);
    return {
      id: current.id,
      model: current.model,
      action: 'keep_published_pending_source',
      reason: KEEP_REASONS[current.id],
      identityRule: 'No content, scope or publication-state changes; a partial or different JLR bulletin cannot be expanded into the frozen indexed identity.',
      commerceDecision: 'unchanged-no-commerce-present',
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
    make: 'Jaguar',
    model: 'E-PACE',
    completionStatement: 'This packet reconciles all four frozen Jaguar E-PACE rows. Four official JLR PDFs were downloaded and visually reviewed, but each has a material identity, scope, outcome or component mismatch; all four rows remain byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change, new issue or public-page change is authorized by this packet.',
      'All four E-PACE rows remain published and byte-for-byte unchanged.',
      'A partial year, VIN, symptom, outcome or component match cannot authorize a rewrite of a broader indexed identity.',
      'The four frozen citation objects contain titles but no URLs and therefore are not treated as verified source evidence.',
      'Distinct recall identities remain deferred until the post-audit new-known-issues phase.',
    ],
    source: {
      snapshotFile: 'data/_jaguar-deeplink-snapshot-2026-08-06.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      modelRecordCount: 4,
    },
    observations: [
      { code: 'e-pace-transmission-partial-vin-year-scope', severity: 'high', recordIds: [IDS.transmission], detail: 'JTB00688 is 2018/VIN/symptom/DTC limited and cannot support the broader frozen identity.' },
      { code: 'e-pace-infotainment-outcome-mismatch', severity: 'high', recordIds: [IDS.infotainment], detail: 'The official iOS Bluetooth bulletin does not establish freezing, rebooting or black-screen behavior.' },
      { code: 'e-pace-roof-outcome-mismatch', severity: 'high', recordIds: [IDS.roof], detail: 'The official panoramic-roof document concerns the sun blind, not a water leak.' },
      { code: 'e-pace-coolant-component-mismatch', severity: 'high', recordIds: [IDS.coolant], detail: 'The official coolant document concerns the thermostat, not a turbo coolant hose.' },
      { code: 'e-pace-existing-citations-missing-urls', severity: 'source-gap', recordIds: Object.values(IDS), detail: 'Every frozen citation has a title but no URL, so none can independently clear a rewrite.' },
      { code: 'all-e-pace-pages-preserved', severity: 'seo-safety', recordIds: Object.values(IDS), detail: 'Every indexed E-PACE record remains published with identical ID, title, years, category, content, citations and commerce.' },
    ],
    reviewSources: SOURCES,
    sourceArtifactSha256: PDF_SHA256,
    mismatchSources: { recallQueries: RECALL_QUERIES, expected: EXPECTED_RECALLS },
    summary: { rewrite_same_identity: 0, keep_published_pending_source: 4, total: 4 },
    rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary }, null, 2));
}

if (require.main === module) main();
module.exports = { EXPECTED_RECALLS, IDS, KEEP_REASONS, PDF_SHA256, RECALL_QUERIES, SOURCES, evidenceFor };
