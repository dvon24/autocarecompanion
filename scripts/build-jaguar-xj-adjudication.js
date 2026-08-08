/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { diffFields, fullRecord, hashValue, normalizedFileHash } = require('./jaguar-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_jaguar-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-jaguar-xj-adjudication-2026-08-06.json');
const IDS = {
  air: 'jaguar-xj-air-suspension-compressor-2004',
  bcm: 'jaguar-xj-electrical-gremlins-bcm-2004',
  rearMain: 'jaguar-xj-rear-main-seal-v8-2004',
  supercharger: 'jaguar-xj-supercharger-nose-cone-2010',
  throttle: 'jaguar-xj-throttle-body-2004',
};
const SOURCES = {
  airDiagnostic: 'https://jl-discourse-uploads.s3.dualstack.us-east-1.amazonaws.com/original/3X/6/0/6081fe383444af86a78fcf6c79b6d0813e45c041.pdf',
  airConnector: 'https://static.nhtsa.gov/odi/tsbs/2015/SB-10096760-1020.pdf',
  supercharger: 'https://static.nhtsa.gov/odi/tsbs/2017/MC-10127304-9999.pdf',
  communicationsDataset: 'https://static.nhtsa.gov/odi/ffdd/tsbs/MFR_COMMS_RECEIVED_2005-2009.zip',
};
const PDF_SOURCES = {
  airDiagnostic: SOURCES.airDiagnostic,
  airConnector: SOURCES.airConnector,
  supercharger: SOURCES.supercharger,
};
const PDF_SHA256 = {
  airDiagnostic: '74fc391fb8aff949f50eaf5fe27d8eddf10b5318b5ceecb3e07127a91b8611b2',
  airConnector: 'fb7c07241202f377305f3834b26ba86771acb209077b74fd164c5c65c92b0afd',
  supercharger: '4c9043550244d576ac04dd36649fac92a8bf93bac14e48fc1996b51fc0d527f5',
};
const VISUALLY_INSPECTED_PAGES = {
  airDiagnostic: [1, 2, 3],
  airConnector: [1],
  supercharger: [1, 2, 3, 4],
};
const NHTSA_COMMUNICATION_RECORD = {
  tsbId: '10017595',
  make: 'JAGUAR',
  model: 'XJ',
  years: '2004',
  summary: 'ELECTRONIC THROTTLE BODY - CLEANING PROHIBITED.    *TT',
};
const DATASET_MARKERS = ['10017595', 'JAGUAR', 'XJ', '2004', 'ELECTRONIC THROTTLE BODY - CLEANING PROHIBITED.'];
const DATASET_SHA256 = '5b83e44442d60ca44d4280fa3ba4ceeac75e40dc75b6c9cd6534dfc006068639';
const RECALL_QUERIES = Object.fromEntries(Array.from({ length: 16 }, (_, index) => 2004 + index).map((year) => [year, `https://api.nhtsa.gov/recalls/recallsByVehicle?make=JAGUAR&model=XJ&modelYear=${year}`]));
const EXPECTED_RECALLS = {
  2004: { status: 200, campaigns: ['04V024000', '04V136000', '09V144000'] },
  2005: { status: 400, campaigns: [] },
  2006: { status: 200, campaigns: ['05V503000', '06V018000', '06V358000'] },
  2007: { status: 200, campaigns: ['06V358000'] },
  2008: { status: 400, campaigns: [] },
  2009: { status: 400, campaigns: [] },
  2010: { status: 200, campaigns: ['10V578000', '17V394000', '20V557000'] },
  2011: { status: 200, campaigns: ['10V578000', '17V394000', '20V557000'] },
  2012: { status: 400, campaigns: [] },
  2013: { status: 200, campaigns: ['14V123000', '14V157000', '14V292000'] },
  2014: { status: 200, campaigns: ['14V157000', '14V741000'] },
  2015: { status: 200, campaigns: ['14V673000', '14V741000', '15V037000'] },
  2016: { status: 200, campaigns: ['16V943000', '17V678000'] },
  2017: { status: 200, campaigns: ['16V943000', '17V678000', '20V557000'] },
  2018: { status: 400, campaigns: [] },
  2019: { status: 200, campaigns: ['19V039000'] },
};
const KEEP_REASONS = {
  [IDS.air]: 'Jaguar bulletin XJ204-06 is a 2004-MY-on diagnostic workflow: test air springs, compressor pipes and valve-block connections for leaks, then separately test compressor electrical continuity and reservoir fill time. JTB00438NAS1 is a 2010-on X351 action for specific connector and compressor damage with OEM compressor C2D34552. Neither source establishes one 2004-2019 compressor-overwork identity across all frozen engines, the frozen C1A20/C1A13 pair, broad prevalence, costs or the aftermarket remedy. Arnott P-2936 fitment and the Amazon affiliate recommendation were not verified by a primary source, so the entire indexed row remains byte-for-byte unchanged.',
  [IDS.bcm]: 'No exact Jaguar primary source was located that establishes one 2004-2012 XJ body-control-module software/CAN/ground/battery identity with frozen U0140/U0155, the claim that a weak battery is the number-one cause, mandatory AGM replacement, jump-start warning, prevalence and costs. The official recall inventory is a boundary rather than negative proof, and the frozen forum citation has no URL. The row remains byte-for-byte unchanged.',
  [IDS.rearMain]: 'No exact Jaguar primary source was located for one rear-main-seal hardening and crankshaft-groove identity across 2004-2019 XJ 4.2L and 5.0L naturally aspirated and supercharged engines. The frozen statement about contaminating a clutch on manual models, two-piece seal availability, Speedi-Sleeve remedy, prevalence, mileage and cost all require exact support; the modern XJ scope is otherwise presented as automatic-equipped. The recall inventory cannot prove absence, and the title-only forum citation cannot clear a rewrite, so the row remains unchanged.',
  [IDS.supercharger]: 'Jaguar bulletin JTB00349NAS2 covers 2010-on X351 5.0L supercharged vehicles with clatter/knock/rattle caused by torsional isolator or torsional-isolator spring-support-shaft wear and prescribes an isolator kit or complete supercharger after exact physical checks. It does not establish a nose-cone bearing identity, an on-car bearing-and-coupler rebuild, supercharger-oil replacement or a 50,000-mile oil interval. Those are materially different cause and remedy claims, so the frozen row remains byte-for-byte unchanged.',
  [IDS.throttle]: 'NHTSA manufacturer-communication record 10017595 identifies 2004 Jaguar XJ bulletin XJ303-10 as “Electronic Throttle Body - Cleaning Prohibited.” That directly conflicts with the frozen solution and preventive-maintenance tip. This safety correction removes the prohibited cleaning instruction and unsupported DTC, cause, cost, fitment and forum claims without changing the indexed page identity or extending the 2004 bulletin to later model years.',
};

function throttleCorrection(before) {
  return {
    ...before,
    trims: [],
    engines: [],
    description: 'This page previously presented one 2004-2009 electronic-throttle-body failure pattern as established fact. The audited official material does not verify that broad cause or model-year scope. It does show a direct safety conflict: NHTSA manufacturer-communication record 10017595 identifies Jaguar bulletin XJ303-10 for the 2004 XJ as “Electronic Throttle Body - Cleaning Prohibited.” Treat throttle symptoms as a reason for model-year-specific diagnosis, not proof that the throttle body needs cleaning or replacement.',
    solution: 'Do not follow this page’s former throttle-body cleaning procedure. For a 2004 XJ, Jaguar bulletin XJ303-10 explicitly prohibits electronic throttle-body cleaning. For any model year listed here, have a Jaguar-qualified technician read the stored faults and follow the VIN- and model-year-specific service information before servicing or replacing the assembly. Do not replace the throttle body solely from the symptoms formerly listed on this page.',
    severity: 'medium',
    confidence: 'low',
    symptoms: [],
    affectedSystems: ['Electronic throttle control'],
    dtcCodes: [],
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    citations: [{
      type: 'manufacturer',
      title: 'NHTSA Manufacturer Communication 10017595 — Jaguar XJ303-10 Electronic Throttle Body Cleaning Prohibited',
      url: SOURCES.communicationsDataset,
    }],
    communityRecommendations: [],
    fixParts: [],
    humanApproved: false,
    source: 'manual',
    reviewedOn: '2026-08-08',
    contentUpdatedOn: '2026-08-08',
    contentUpdateSummary: 'Removed throttle-body cleaning advice contradicted by Jaguar bulletin XJ303-10 and stripped unsupported cause, DTC, cost, fitment and forum claims while preserving the indexed page identity.',
  };
}

function evidenceFor(id) {
  return {
    [IDS.air]: [
      { kind: 'jaguar-bulletin-diagnostic-cause-remedy-boundary', url: SOURCES.airDiagnostic, verifiedOn: '2026-08-06', observation: 'XJ204-06 separates leak checks, air-spring replacement and compressor electrical/fill-time diagnosis; it does not state the frozen blanket cause or aftermarket remedy.' },
      { kind: 'jaguar-bulletin-model-generation-component-boundary', url: SOURCES.airConnector, verifiedOn: '2026-08-06', observation: 'JTB00438NAS1 is limited to 2010-on X351 connector/compressor damage and names OEM compressor C2D34552.' },
    ],
    [IDS.bcm]: [{ kind: 'official-registry-boundary-not-negative-proof', url: RECALL_QUERIES[2004], verifiedOn: '2026-08-06', observation: 'Year-by-year recall results contain distinct campaign identities and cannot establish or disprove the broad BCM aggregation.' }],
    [IDS.rearMain]: [{ kind: 'official-registry-boundary-not-negative-proof', url: RECALL_QUERIES[2004], verifiedOn: '2026-08-06', observation: 'The recall inventory does not establish the frozen seal cause, transmission/clutch scope or repair details and is not negative proof.' }],
    [IDS.supercharger]: [{ kind: 'jaguar-bulletin-cause-remedy-identity-mismatch', url: SOURCES.supercharger, verifiedOn: '2026-08-06', observation: 'JTB00349NAS2 identifies torsional-isolator backlash and an isolator-kit/full-assembly decision, not a bearing rebuild or oil interval.' }],
    [IDS.throttle]: [{ kind: 'nhtsa-manufacturer-communication-remedy-conflict', url: SOURCES.communicationsDataset, verifiedOn: '2026-08-06', observation: 'Official record 10017595 says throttle-body cleaning is prohibited for 2004 XJ, directly conflicting with the frozen cleaning advice.' }],
  }[id];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Jaguar' && row.model === 'XJ');
  if (modelRows.length !== 5) throw new Error(`expected 5 Jaguar XJ rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => {
    if (!KEEP_REASONS[current.id] || !evidenceFor(current.id)) throw new Error(`missing XJ decision: ${current.id}`);
    const before = fullRecord(current);
    const hasAffiliate = current.communityRecommendations.some((item) => Boolean(item.affiliateUrl));
    const proposal = current.id === IDS.throttle ? throttleCorrection(before) : before;
    const action = current.id === IDS.throttle ? 'rewrite_same_identity' : 'keep_published_pending_source';
    return { id: current.id, model: current.model, action, reason: KEEP_REASONS[current.id], identityRule: 'ID, make, model, title, category, years, publication state and related-issue identity remain fixed; only source-supported safety and content corrections are allowed.', commerceDecision: current.id === IDS.throttle ? 'removed-unsupported-forum-guidance-no-commerce' : (hasAffiliate ? 'unchanged-affiliate-fitment-unverified' : 'unchanged-no-affiliate-commerce-present'), changedFields: diffFields(before, proposal), evidence: evidenceFor(current.id), beforeSha256: hashValue(before), proposalSha256: hashValue(proposal), before, proposal };
  });
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true, generatedOn: '2026-08-06', make: 'Jaguar', model: 'XJ',
    completionStatement: 'This packet reconciles all five frozen Jaguar XJ rows. Three Jaguar technical PDFs and eight relevant pages were visually inspected, NHTSA communication record 10017595 was confirmed in the official dataset, and 2004-2019 recall inventories were live-locked. One same-identity safety correction removes advice explicitly prohibited by Jaguar; four rows remain byte-for-byte unchanged.',
    safetyContract: ['No production database write, cache purge, deployment, archive action, redirect, slug change, new issue or public-page change is authorized by this packet.', 'All five XJ rows remain published; four remain byte-for-byte unchanged and one receives an explicit same-identity safety correction.', 'ID, title, model, category, years and publication state are immutable in this packet.', 'A component, model generation, engine, VIN, year, cause, code, symptom, remedy or commerce-fitment mismatch cannot authorize a broader rewrite.', 'A recall-registry result is not negative proof that a non-recall issue does not exist.', 'Unsafe or contradicted maintenance advice is removed transparently without substituting a different issue identity.', 'Distinct issue identities remain deferred until the post-audit new-known-issues phase.'],
    source: { snapshotFile: 'data/_jaguar-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: 5 },
    observations: [
      { code: 'xj-air-diagnostic-and-component-scope-mismatch', severity: 'high', recordIds: [IDS.air], detail: 'The official bulletins separate leak, compressor and connector diagnosis and do not validate the frozen blanket cause, DTC or aftermarket-fitment claims.' },
      { code: 'xj-bcm-primary-source-gap', severity: 'source-gap', recordIds: [IDS.bcm], detail: 'No exact primary source cleared the nine-year BCM/battery/ground/software aggregation.' },
      { code: 'xj-rear-main-primary-source-and-equipment-gap', severity: 'high', recordIds: [IDS.rearMain], detail: 'The sixteen-year seal aggregation and manual-clutch claim lack exact primary support.' },
      { code: 'xj-supercharger-cause-remedy-identity-mismatch', severity: 'high', recordIds: [IDS.supercharger], detail: 'JTB00349NAS2 is an isolator-backlash repair bulletin, not a bearing/oil-maintenance identity.' },
      { code: 'xj-throttle-official-cleaning-prohibition-conflict', severity: 'critical-safety', recordIds: [IDS.throttle], detail: 'NHTSA record 10017595 says cleaning is prohibited, directly conflicting with the frozen solution and preventive-maintenance tip.' },
      { code: 'xj-existing-citations-missing-urls', severity: 'source-gap', recordIds: Object.values(IDS), detail: 'Every frozen citation is title-only and cannot independently clear a rewrite.' },
      { code: 'all-xj-pages-preserved', severity: 'seo-safety', recordIds: Object.values(IDS), detail: 'Every indexed XJ record remains published with identical ID, title, model, category, years and related-issue identity; only the documented throttle safety correction changes content.' },
    ],
    reviewSources: SOURCES, pdfSources: PDF_SOURCES, sourceArtifactSha256: PDF_SHA256, communicationsDatasetSha256: DATASET_SHA256, visuallyInspectedPages: VISUALLY_INSPECTED_PAGES, nhtsaCommunicationRecord: NHTSA_COMMUNICATION_RECORD, datasetMarkers: DATASET_MARKERS, mismatchSources: { recallQueries: RECALL_QUERIES, expected: EXPECTED_RECALLS }, summary: { rewrite_same_identity: 1, keep_published_pending_source: 4, total: 5 }, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary }, null, 2));
}
if (require.main === module) main();
module.exports = { DATASET_MARKERS, DATASET_SHA256, EXPECTED_RECALLS, IDS, KEEP_REASONS, NHTSA_COMMUNICATION_RECORD, PDF_SHA256, PDF_SOURCES, RECALL_QUERIES, SOURCES, VISUALLY_INSPECTED_PAGES, evidenceFor, throttleCorrection };
