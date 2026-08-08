/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./kia-adjudication-utils');
const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_kia-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-kia-ray-adjudication-2026-08-08.json');
const IDS = {
  oilCoolant: 'kia-ray-1-0-kappa-engine-oil-seepage-plastic-coolant-hose-leaks',
  newEvIccu: 'kia-ray-2023-ray-ev-integrated-charging-control-unit-overcurrent-slo',
  pulley: 'kia-ray-drive-belt-cricket-chirp-from-solid-alternator-pulley',
  earlyFatc: 'kia-ray-early-ray-engine-stall-c-ecu-climate-control-logic-error',
  ecuRecall: 'kia-ray-ecu-software-defect-causing-engine-stall-while-driving',
  oldEvObc: 'kia-ray-first-generation-ray-ev-board-charger-failure',
};
const REWRITE_ID = IDS.ecuRecall;
const CLEANUP_IDS = [IDS.oilCoolant, IDS.pulley, IDS.oldEvObc];
const HOLD_IDS = [IDS.newEvIccu, IDS.earlyFatc];
const WEB_SOURCES = {
  ecuRecall: { url: 'https://www.car.go.kr/sd/newsDta/list.do', verifiedOn: '2026-08-08', markers: ['레이 220,059대', '엔진제어장치 소프트웨어 설계 미흡', '주행 중 시동꺼짐', '4월 28일부터'] },
  deferredHecu: { url: 'https://www.car.go.kr/ri/stat/detail.do?ctype=O&recallId=5234', verifiedOn: '2026-08-08', markers: ['레이 전기차(TAM EV)', '2011.12.17~2017.12.06', '전자제어유압장치(HECU)', 'HECU 관련 퓨즈를 개선품으로 교환'], use: 'deferred-identity-only-not-rewrite-evidence', directFetchObservation: 'The official detail is indexed and readable through the recall-center index, but direct automated GET returned HTTP 405 on 2026-08-08.' },
};
const NHTSA_SOURCE = {
  manufacturerCommunicationsFiles: {
    '2015-2019': { name: 'MFR_COMMS_RECEIVED_2015-2019.csv', sha256: 'd6c2ff16880cc7b31cfebad94bda08c3e8b3b2c3f28d56d5b1bb810c8b878a2e', expectedRayRows: 0 },
    '2020-2024': { name: 'MFR_COMMS_RECEIVED_2020-2024.csv', sha256: '3b3ca3d690e33386d1d315a0f966285ae8cccb99c45c2386ada164c5e925c3cf', expectedRayRows: 0 },
    '2025-2026': { name: 'MFR_COMMS_RECEIVED_2025-2026.csv', sha256: '419ebda2f1c1bf22e2b0862858d61699c25e61d73842f9031e796f1fafefba4c', expectedRayRows: 0 },
  },
  flatRecallFile: { name: 'FLAT_RCL_POST_2010.txt', sha256: '4803a7f298f1d850736fe55830f4d31b004577424cb6429988c5864786f76a70', expectedRayRows: 0 },
  interpretation: 'Ray is a Korean-market model name; zero U.S. NHTSA rows are expected and do not disprove Korean-market identities. Exact Korean government or Kia sources are required for affirmative corrections.',
};
const REWRITE_CARD = {
  description: 'On April 22, 2026, South Korea\'s automobile recall center published MOLIT\'s announcement that 220,059 Kia Ray vehicles were being recalled because inadequate engine-control-unit software design could cause the engine to shut off while driving. The corrective action was scheduled to begin April 28, 2026. This indexed page retains its existing 2020-2024 year set; recall applicability must be checked by vehicle or VIN.',
  solution: 'Check the vehicle or VIN at South Korea\'s automobile recall center and have the official Kia recall remedy completed. The primary announcement establishes the defect, population and April 28 start date but does not specify a retail repair part, so no part is linked from this page.',
  severity: 'high', confidence: 'high', symptoms: ['Engine may shut off while driving'], affectedSystems: ['engine control unit software'],
  citations: [{ type: 'recall', title: 'South Korea Automobile Recall Center - Kia Ray ECU Software Recall Announcement', url: WEB_SOURCES.ecuRecall.url }],
  summary: 'Replaced secondary sources with the Korean government recall announcement, corrected the repair start date from March 28 to April 28, and removed unsupported production dates, power-assist and reimbursement claims.',
  commerceDecision: 'dealer-only-no-retail-part-korean-safety-recall',
};
const CLEANUP_REASONS = {
  [IDS.oilCoolant]: 'The page combines valve-cover/head-gasket seepage, coolant connectors, turbo heat and exact Korean prices using only secondary used-car guides and owner posts. The proposal removes those sources and prescriptive repair/cost certainty, leaving neutral diagnosis while the broad identity remains blocked.',
  [IDS.pulley]: 'The solid-pulley/OAP production cutoff, causal mechanism and retrofit are supported only by secondary guides, a shop log and owner discussion. The proposal removes the unverified retrofit instruction and citations while the identity remains blocked.',
  [IDS.oldEvObc]: 'The near-universal failure rate, 60,000 km threshold, thermal mechanism and exact dealer/board-repair costs rely on forums and a wiki snippet. The proposal removes high-cost prescriptive advice and unverified citations while the first-generation OBC identity remains blocked.',
};
const HOLD_REASONS = {
  [IDS.newEvIccu]: 'The 3,787-vehicle overcurrent campaign, build dates, 2026 deadline and charger-compatibility advice are sourced only to two news reports. No exact Kia or Korean government service-campaign record was located, so the page remains byte-for-byte frozen and blocks application.',
  [IDS.earlyFatc]: 'Three news reports describe the July 2012 ECU/FATC free repair, but no Kia or Korean government primary campaign document was located for the 11,439-vehicle build scope or dual-module reprogramming. The page remains byte-for-byte frozen.',
};
function stamp(proposal, summary) { Object.assign(proposal, { humanApproved: false, reportCount: 0, source: 'manual', reviewedOn: '2026-08-08', contentUpdatedOn: '2026-08-08', contentUpdateSummary: summary }); return proposal; }
function rewriteProposal(row) {
  const proposal = fullRecord(row); Object.assign(proposal, { description: REWRITE_CARD.description, solution: REWRITE_CARD.solution, severity: REWRITE_CARD.severity, confidence: REWRITE_CARD.confidence, symptoms: clone(REWRITE_CARD.symptoms), affectedSystems: clone(REWRITE_CARD.affectedSystems), dtcCodes: [], citations: clone(REWRITE_CARD.citations), communityRecommendations: [], fixParts: [], estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null, relatedIssueIds: [] }); return stamp(proposal, REWRITE_CARD.summary);
}
function cleanupProposal(row) {
  const proposal = fullRecord(row);
  const solutions = {
    [IDS.oilCoolant]: 'Have a qualified technician locate the exact oil or coolant leak and pressure-test the cooling system before replacing gaskets, hoses or connectors. The frozen evidence does not establish one component, production range or repair price across this broad page.',
    [IDS.pulley]: 'Have the belt, tension, pulley alignment, accessory bearings and charging system diagnosed under the condition that produces the chirp. Do not convert the alternator pulley based on this page; an exact Kia source and part fitment have not been established.',
    [IDS.oldEvObc]: 'Have an EV-qualified technician distinguish the charge inlet, cable/EVSE, wiring and on-board charger before repair. The frozen evidence does not establish a universal failure threshold, one board-level repair or the quoted costs, so no repair part or price is recommended.',
  };
  proposal.solution = solutions[row.id]; proposal.citations = []; proposal.communityRecommendations = []; proposal.fixParts = []; proposal.relatedIssueIds = []; return stamp(proposal, `Targeted safety cleanup only: ${CLEANUP_REASONS[row.id]}`);
}
function actionFor(id) { if (id === REWRITE_ID) return 'rewrite_same_identity'; if (CLEANUP_IDS.includes(id)) return 'targeted_safety_cleanup_pending_source'; return 'keep_published_pending_source'; }
function reasonFor(id) { if (id === REWRITE_ID) return 'The Korean government recall announcement exactly supports the ECU-software stall identity, population and corrected April 28, 2026 action date without changing indexed identity fields.'; return CLEANUP_REASONS[id] || HOLD_REASONS[id]; }
function evidenceFor(row) { if (row.id === REWRITE_ID) return [{ kind: 'official-korean-safety-recall-exact-same-identity', url: WEB_SOURCES.ecuRecall.url, verifiedOn: '2026-08-08', markers: WEB_SOURCES.ecuRecall.markers, observation: 'MOLIT\'s recall-center announcement establishes 220,059 Ray vehicles, inadequate ECU software, possible engine shutdown while driving and an April 28, 2026 action start.' }]; if (CLEANUP_IDS.includes(row.id)) return [{ kind: 'critical-field-cleanup-with-substantive-identity-still-blocked', verifiedOn: '2026-08-08', observation: CLEANUP_REASONS[row.id] }]; return [{ kind: 'secondary-source-only-no-exact-primary-package', verifiedOn: '2026-08-08', observation: HOLD_REASONS[row.id] }]; }
function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const modelRows = snapshot.records.filter((row) => row.make === 'Kia' && row.model === 'Ray'); if (modelRows.length !== 6) throw new Error(`expected 6 Ray rows, found ${modelRows.length}`); if (JSON.stringify(modelRows.map((row) => row.id).sort()) !== JSON.stringify(Object.values(IDS).sort())) throw new Error('frozen Ray ID set mismatch');
  const rows = modelRows.map((current) => { const before = fullRecord(current); const action = actionFor(current.id); const proposal = action === 'rewrite_same_identity' ? rewriteProposal(current) : action === 'targeted_safety_cleanup_pending_source' ? cleanupProposal(current) : before; return { id: current.id, model: current.model, action, reason: reasonFor(current.id), identityRule: 'No Korean secondary report may be stretched into a primary-source rewrite. Known incorrect dates or unsafe high-cost prescriptions receive correction without changing indexed identity.', commerceDecision: current.id === REWRITE_ID ? REWRITE_CARD.commerceDecision : CLEANUP_IDS.includes(current.id) ? 'no-commerce-remove-unverified-repair-prescription' : 'unchanged-no-commerce-pending-exact-primary-source', changedFields: diffFields(before, proposal), evidence: evidenceFor(current), beforeSha256: hashValue(before), proposalSha256: hashValue(proposal), before, proposal }; });
  const blockerRecordIds = [...CLEANUP_IDS, ...HOLD_IDS].sort();
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true, generatedOn: '2026-08-08', make: 'Kia', model: 'Ray', completionStatement: 'All six frozen Kia Ray records are adjudicated through the Korean-market source route. One 2026 ECU recall receives an official bounded rewrite; three secondary-only repair pages receive targeted safety cleanup; two campaign pages remain byte-for-byte holds.',
    applicationGate: { status: 'blocked', blockerRecordIds, reason: 'Five Ray pages remain primary-source or mechanism conflicted. Independent correction and approval are required before any proposal is applied.' },
    safetyContract: ['No production database write, cache purge, deployment, archive, redirect, slug change, title change, category change, indexed-year change, new issue or public-page change is authorized.', 'All six Ray IDs, titles, categories, indexed year sets and publication states remain unchanged.', 'Zero NHTSA rows are expected because Ray is Korean-market; absence from U.S. data is not treated as disproof.', 'Only exact Korean government or Kia evidence may authorize a rewrite; secondary articles and forums remain blocked.', 'The current 2026 recall date is verified live and corrected from March 28 to April 28.', 'New issue identities remain deferred until the remaining-make audit is complete.'],
    source: { snapshotFile: 'data/_kia-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: 6 },
    observations: [
      { code: 'ray-korean-market-source-route', severity: 'methodology', recordIds: Object.values(IDS).sort(), detail: 'All U.S. NHTSA communication and recall datasets contain zero Ray rows; exact Korean primary evidence is required.' },
      { code: 'ray-ecu-recall-date-corrected', severity: 'critical', recordIds: [REWRITE_ID], detail: 'The official announcement states action begins April 28, 2026, not March 28 as the frozen solution claimed.' },
      { code: 'ray-three-secondary-repair-prescriptions-cleaned', severity: 'critical', recordIds: CLEANUP_IDS.slice().sort(), detail: 'Oil/coolant, OAP retrofit and first-generation OBC pages lose unverified sources, fixed prices and prescriptive component replacement while remaining blockers.' },
      { code: 'ray-two-campaign-pages-held', severity: 'critical', recordIds: HOLD_IDS.slice().sort(), detail: 'The 2023 EV overcurrent and 2012 FATC campaigns lack an exact primary package and remain byte-for-byte frozen.' },
      { code: 'ray-ev-hecu-recall-deferred', severity: 'new-issues-deferred', recordIds: [], urls: [WEB_SOURCES.deferredHecu.url], detail: 'The official Korean recall center documents a distinct 2011-2017 Ray EV HECU fire-risk recall. It is not merged into the OBC page and is deferred to the additions phase.' },
      { code: 'all-ray-pages-preserved', severity: 'seo-safety', recordIds: Object.values(IDS).sort(), detail: 'Every Ray ID, title, category, indexed year set and publication state remains preserved; no redirect, archive, deletion or new public page is proposed.' },
    ], webSources: WEB_SOURCES, nhtsaCoverage: NHTSA_SOURCE, summary: { rewrite_same_identity: 1, targeted_safety_cleanup_pending_source: 3, keep_published_pending_source: 2, total: 6 }, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`); console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}
if (require.main === module) main();
module.exports = { CLEANUP_IDS, CLEANUP_REASONS, HOLD_IDS, HOLD_REASONS, IDS, NHTSA_SOURCE, OUTPUT, REWRITE_CARD, REWRITE_ID, SNAPSHOT, WEB_SOURCES, actionFor, cleanupProposal, evidenceFor, reasonFor, rewriteProposal };
