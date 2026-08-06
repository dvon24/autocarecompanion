/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { fullRecord, hashValue, normalizedFileHash } = require('./hyundai-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(
  ROOT,
  'data',
  'known-issue-hyundai-veracruz-adjudication-2026-08-06.json',
);

const IDS = {
  alternator: 'hyundai-veracruz-alternator-2007',
  decoupler: 'hyundai-veracruz-alternator-decoupler-2007',
  sunroof: 'hyundai-veracruz-sunroof-drain-2007',
  transferCase: 'hyundai-veracruz-transfer-case-leak-2007',
  transmission: 'hyundai-veracruz-transmission-2007',
};

const MISMATCH_SOURCES = {
  alternatorOilLeak: 'https://static.nhtsa.gov/odi/rcl/2014/RCDNN-14V415-5243P.pdf',
  atmPolicy: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10174807-0001.pdf',
  tsbIndex: 'https://static.nhtsa.gov/odi/tsbs/2014/MC-10061031-2273.pdf',
};

const KEEP_REASONS = {
  [IDS.alternator]:
    'Recall 14V-415 establishes engine oil leaking from the front cylinder-bank valve-cover gasket onto and damaging the alternator. It does not establish the indexed voltage-regulator failure, electrical-load cause, belt-tensioner mechanism, mileage range, DTCs, 150-amp specification or commerce claims, so the row remains byte-for-byte unchanged.',
  [IDS.decoupler]:
    'A generic NHTSA vehicle page and a video do not establish one 2007-2012 Veracruz alternator-decoupler clutch defect, failure mechanism or repair scope. The row remains byte-for-byte unchanged.',
  [IDS.sunroof]:
    'Generic forum and complaint references do not establish one 2007-2012 Veracruz four-drain clog defect, algae mechanism, electrical-damage path, six-month service interval or silicone treatment. The row remains byte-for-byte unchanged.',
  [IDS.transferCase]:
    'Hyundai TSB 20-AT-016H lists transfer-case oil seals among authorized in-dealership repairs for the 2007-2012 Veracruz Aisin transmission program. It does not establish the indexed output-shaft-seal defect, frequency, clutch-pack damage, mileage range, fluid specification or commerce claims, so the row remains byte-for-byte unchanged.',
  [IDS.transmission]:
    'Hyundai TSB 20-AT-016H is a general automatic-transmission repair policy and does not establish the indexed harsh-shift and torque-converter-shudder defect or its causes, speed range, DTCs and repair outcomes. The row also falsely treats TSB 09-AT-001 as a Veracruz warranty extension; Hyundai service material identifies 09-AT-001 as Genesis Coupe V6 and Genesis V8 automatic-transmission fluid-level information. The row remains byte-for-byte unchanged.',
};

function evidenceFor(id) {
  if (id === IDS.alternator) {
    return [
      {
        kind: 'official-record-different-cause',
        url: MISMATCH_SOURCES.alternatorOilLeak,
        verifiedOn: '2026-08-06',
        observation:
          'Recall 14V-415 covers oil leaking from the front cylinder-bank valve cover gasket onto the alternator, which can make the charging system inoperative and stall the engine; it does not establish an internal voltage-regulator defect.',
      },
    ];
  }
  if (id === IDS.transferCase) {
    return [
      {
        kind: 'official-record-repair-policy-only',
        url: MISMATCH_SOURCES.atmPolicy,
        verifiedOn: '2026-08-06',
        observation:
          'TSB 20-AT-016H lists transfer-case oil-seal replacement as an authorized repair for the 2007-2012 Veracruz Aisin transmission program but does not establish an output-shaft-seal defect or the row\'s failure and mileage claims.',
      },
    ];
  }
  if (id === IDS.transmission) {
    return [
      {
        kind: 'official-record-repair-policy-only',
        url: MISMATCH_SOURCES.atmPolicy,
        verifiedOn: '2026-08-06',
        observation:
          'TSB 20-AT-016H identifies the 2007-2012 Veracruz as using a six-speed Aisin ATM and provides repair-versus-replacement policy; it does not establish a systemic harsh-shift or torque-converter-shudder defect.',
      },
      {
        kind: 'official-record-citation-mismatch',
        url: MISMATCH_SOURCES.tsbIndex,
        verifiedOn: '2026-08-06',
        observation:
          'Hyundai TechNet material identifies TSB 09-AT-001 as Genesis Coupe V6 and Genesis V8 automatic-transmission fluid-level information, not a Veracruz warranty extension.',
      },
    ];
  }
  return [];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter(
    (row) => row.make === 'Hyundai' && row.model === 'Veracruz',
  );
  if (modelRows.length !== 5) {
    throw new Error(`expected 5 Hyundai Veracruz rows, found ${modelRows.length}`);
  }

  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    if (!KEEP_REASONS[current.id]) throw new Error(`missing Veracruz decision: ${current.id}`);
    return {
      id: current.id,
      model: current.model,
      action: 'keep_published_pending_source',
      reason: KEEP_REASONS[current.id],
      identityRule:
        'No content or publication-state changes; a different cause, generic repair policy, mismatched bulletin or unsupported narrative cannot replace this indexed issue.',
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
    model: 'Veracruz',
    completionStatement:
      'This packet reconciles all five frozen Hyundai Veracruz rows. No same-identity primary-source rewrite cleared the gate; all five remain byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All five rows remain published and byte-for-byte unchanged.',
      'A different cause, generic repair policy or mismatched bulletin may never replace the issue named by an existing indexed page.',
      'Existing commerce remains frozen rather than being silently rewritten without exact identity and fitment evidence.',
      'Independent row-by-row approval is required before any separate correction path may be created.',
    ],
    source: {
      snapshotFile: 'data/_hyundai-deeplink-snapshot-2026-08-06.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      veracruzRecordCount: modelRows.length,
    },
    observations: [
      {
        code: 'oil-leak-recall-not-voltage-regulator-defect',
        severity: 'independent-review-required',
        recordIds: [IDS.alternator],
        detail:
          'Recall 14V-415 proves an oil-leak path that can damage the alternator, not the indexed voltage-regulator and accessory-load narrative.',
      },
      {
        code: 'atm-policy-does-not-prove-two-defects',
        severity: 'independent-review-required',
        recordIds: [IDS.transferCase, IDS.transmission],
        detail:
          'TSB 20-AT-016H is repair policy for the Veracruz Aisin transmission; it does not prove either indexed failure narrative.',
      },
      {
        code: 'claimed-transmission-tsb-is-genesis-material',
        severity: 'high',
        recordIds: [IDS.transmission],
        detail:
          'Hyundai material identifies TSB 09-AT-001 as Genesis Coupe V6 and Genesis V8 fluid-level information, not a Veracruz warranty extension.',
      },
      {
        code: 'decoupler-and-sunroof-remain-unsupported',
        severity: 'independent-review-required',
        recordIds: [IDS.decoupler, IDS.sunroof],
        detail:
          'Generic vehicle, forum and video references do not establish the indexed decoupler or sunroof-drain narratives.',
      },
    ],
    mismatchSources: MISMATCH_SOURCES,
    summary: {
      rewrite_same_identity: 0,
      keep_published_pending_source: 5,
      total: 5,
    },
    rows,
  };

  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(
    JSON.stringify(
      { output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary },
      null,
      2,
    ),
  );
}

if (require.main === module) main();

module.exports = {
  IDS,
  KEEP_REASONS,
  MISMATCH_SOURCES,
  evidenceFor,
  fullRecord,
  hashValue,
  normalizedFileHash,
};
