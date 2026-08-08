/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./kia-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_kia-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-kia-morning-adjudication-2026-08-08.json');

const REWRITE_ID = 'kia-morning-pcv-valve-plastic-needle-wear-oil-ingestion-white-exhaust-sm';
const HOLD_IDS = {
  coldStart: 'kia-morning-cold-start-delay-no-start-after-overnight-parking',
  rearSeal: 'kia-morning-crankshaft-rear-main-seal-oil-leak-between-engine-transmissi',
  alternatorPulley: 'kia-morning-drive-belt-cricket-squeal-from-solid-alternator-pulley',
  fuelHose: 'kia-morning-fuel-leveling-hose-cracking-fuel-leak-fire-risk',
  clutch: 'kia-morning-manual-transmission-clutch-judder-rapid-clutch-flywheel-wear',
};

const WEB_SOURCES = {
  pcv: {
    url: 'https://me.go.kr/home/web/board/read.do?boardCategoryId=39&boardId=343514&boardMasterId=1&decorator=&maxIndexPages=10&maxPageItems=10&menuId=&orgCd=&pagerOffset=10050&searchKey=&searchValue=',
    verifiedOn: '2026-08-08',
    markers: ['196,950', '2011년 1월 17일', '2012년 7월 16일', '플라스틱에서 스틸로 무상 교체'],
  },
  fuelHosePage: {
    url: 'https://m.korea.kr/news/pressReleaseView.do?newsId=156266495',
    verifiedOn: '2026-08-08',
    markers: ['모닝(TA)', '190,562', '연료 및 레벨링 호스', '개선부품 교체'],
  },
};

const PDF_SOURCES = {
  fuelHose: {
    url: 'https://www.korea.kr/common/download.do?fileId=191964074&tblKey=GMN',
    sha256: '740918bc2f6d4220fb59a75520532c40da23e879b17ed64c81ce793dd699ea7f',
    visuallyInspectedPages: [1, 4],
    markers: ['구형 모닝(TA)', '연료 호스 및 레벨링 호스', '10.11.09.~12.06.30.', '158,175'],
  },
};

const NHTSA_SOURCE = {
  manufacturerCommunicationsFiles: {
    '2015-2019': { name: 'MFR_COMMS_RECEIVED_2015-2019.csv', sha256: 'd6c2ff16880cc7b31cfebad94bda08c3e8b3b2c3f28d56d5b1bb810c8b878a2e', expectedMorningRows: 0 },
    '2020-2024': { name: 'MFR_COMMS_RECEIVED_2020-2024.csv', sha256: '3b3ca3d690e33386d1d315a0f966285ae8cccb99c45c2386ada164c5e925c3cf', expectedMorningRows: 0 },
    '2025-2026': { name: 'MFR_COMMS_RECEIVED_2025-2026.csv', sha256: '419ebda2f1c1bf22e2b0862858d61699c25e61d73842f9031e796f1fafefba4c', expectedMorningRows: 0 },
  },
  flatRecallFile: { name: 'FLAT_RCL_POST_2010.txt', sha256: '4803a7f298f1d850736fe55830f4d31b004577424cb6429988c5864786f76a70', expectedMorningRows: 0 },
  interpretation: 'Morning is the Korean-market name; zero U.S. NHTSA rows are expected and do not disprove Korean-market identities. Korean government sources are required for affirmative corrections.',
};

const REWRITE_CARD = {
  description: 'South Korea\'s Ministry of Environment states that Kia recalled Morning 1.0 gasoline and Morning 1.0 Bi-Fuel vehicles produced from January 17, 2011 through July 16, 2012 because the plastic needle in the positive crankcase ventilation (PCV) valve could wear. The worn valve can allow engine oil into the intake manifold, where it burns with fuel and can produce white exhaust smoke and increased particulate emissions. The cited total of 196,950 vehicles covers four Morning and Ray variants together, not Morning alone.',
  solution: 'Confirm campaign completion with a Kia service center. The government notice says Kia service centers and partners inspect and replace the PCV valve free of charge, changing the needle material from plastic to steel. This is a Korean-market campaign repair with vehicle-specific applicability, so no retail PCV valve is linked from this page.',
  severity: 'medium',
  confidence: 'high',
  symptoms: ['White exhaust smoke'],
  affectedSystems: ['positive crankcase ventilation valve', 'intake manifold'],
  citations: [{ type: 'recall', title: 'South Korea Ministry of Environment - Kia Morning and Ray PCV Valve Recall', url: WEB_SOURCES.pcv.url }],
  commerceDecision: 'dealer-only-no-retail-part-korean-emissions-recall',
  summary: 'Bounded the same PCV-valve identity to the official Korean recall, corrected the 196,950 figure to the combined four-variant population, and removed unsupported Kappa naming, secondary citations, extra symptoms and retail-repair advice.',
};

const HOLD_REASONS = {
  [HOLD_IDS.coldStart]: 'The claimed Korean free-repair campaign is supported only by the Nolewa recall board, which was unreachable in live verification, plus owner forums. No Kia or Korean government primary notice was located for the frozen 2011-2015 cold-start/fuel-pump aggregation, and the later fuel-pump mechanism is sourced to a single 2015 owner report rather than the claimed ECU campaign. The row remains byte-for-byte frozen and blocks application.',
  [HOLD_IDS.rearSeal]: 'The frozen page combines TA-generation rear-main-seal leakage, a claimed one-time Kia free repair and manual-clutch contamination across 2011-2015. Its free-repair citation explicitly discusses the earlier 2007-2010 SA generation, while the remaining sources are shop cases and secondary articles. No exact primary campaign was found, so the row remains byte-for-byte frozen.',
  [HOLD_IDS.alternatorPulley]: 'The solid-pulley/OAP mechanism, 2013 production change, 5-to-6-rib conversion and permanent-fix claims rely on a secondary blog, shop page, video and wiki. No Kia engineering bulletin or exact part-number/fitment source was located for the 2011-2013 Morning scope. The row remains byte-for-byte frozen.',
  [HOLD_IDS.fuelHose]: 'The official Korean government PDF exactly establishes the Morning TA fuel/leveling-hose material defect, leak/fire risk and improved-part dealer remedy, but its vehicle table covers production from November 9, 2010 through June 30, 2012. The frozen indexed years include 2013, which the source does not support. Because indexed-year changes are prohibited in this audit, the row remains byte-for-byte frozen and blocks application.',
  [HOLD_IDS.clutch]: 'The frozen 2011-2018 identity combines Korean Morning clutch/flywheel durability claims with damp-weather judder reports from several EU-market Picanto generations and engines. No Kia primary bulletin establishes one revised clutch/flywheel remedy across that scope. The cross-market, year and mechanism aggregation remains byte-for-byte frozen.',
};

function rewriteProposal(row) {
  const proposal = fullRecord(row);
  Object.assign(proposal, {
    description: REWRITE_CARD.description,
    solution: REWRITE_CARD.solution,
    severity: REWRITE_CARD.severity,
    confidence: REWRITE_CARD.confidence,
    symptoms: clone(REWRITE_CARD.symptoms),
    affectedSystems: clone(REWRITE_CARD.affectedSystems),
    dtcCodes: [],
    citations: clone(REWRITE_CARD.citations),
    communityRecommendations: [],
    fixParts: [],
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    humanApproved: false,
    reportCount: 0,
    source: 'manual',
    reviewedOn: '2026-08-08',
    contentUpdatedOn: '2026-08-08',
    contentUpdateSummary: REWRITE_CARD.summary,
  });
  return proposal;
}

function evidenceFor(row) {
  if (row.id === REWRITE_ID) return [{ kind: 'official-korean-emissions-recall-exact-same-identity', url: WEB_SOURCES.pcv.url, verifiedOn: '2026-08-08', markers: WEB_SOURCES.pcv.markers, observation: 'The Ministry of Environment page establishes the affected Morning variants, production dates, plastic-needle wear, oil entry into the intake, white smoke and free steel-needle replacement.' }];
  if (row.id === HOLD_IDS.fuelHose) return [{ kind: 'official-korean-safety-recall-year-boundary-conflict', urls: [WEB_SOURCES.fuelHosePage.url, PDF_SOURCES.fuelHose.url], sha256: PDF_SOURCES.fuelHose.sha256, visuallyInspectedPages: PDF_SOURCES.fuelHose.visuallyInspectedPages, verifiedOn: '2026-08-08', observation: HOLD_REASONS[row.id] }];
  return [{ kind: 'secondary-source-only-no-exact-primary-package', verifiedOn: '2026-08-08', observation: HOLD_REASONS[row.id] }];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Kia' && row.model === 'Morning');
  if (modelRows.length !== 6) throw new Error(`expected 6 Morning rows, found ${modelRows.length}`);
  if (!modelRows.some((row) => row.id === REWRITE_ID)) throw new Error(`missing frozen Morning ID ${REWRITE_ID}`);
  for (const id of Object.values(HOLD_IDS)) if (!modelRows.some((row) => row.id === id)) throw new Error(`missing frozen Morning ID ${id}`);
  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    const rewrite = current.id === REWRITE_ID;
    const proposal = rewrite ? rewriteProposal(current) : before;
    return {
      id: current.id, model: current.model,
      action: rewrite ? 'rewrite_same_identity' : 'keep_published_pending_source',
      reason: rewrite ? 'The exact Korean government recall matches this indexed PCV-valve identity and its complete frozen year set. The proposal narrows the content to the official production range, failure mechanism and dealer remedy without changing ID, title, category, years or status.' : HOLD_REASONS[current.id],
      identityRule: 'No source may change an indexed page identity. Cross-market evidence, a different generation, an unsupported year or a different failure mechanism requires a byte-for-byte hold.',
      commerceDecision: rewrite ? REWRITE_CARD.commerceDecision : 'unchanged-no-commerce-or-source-pending-exact-primary-evidence',
      changedFields: diffFields(before, proposal), evidence: evidenceFor(current), beforeSha256: hashValue(before), proposalSha256: hashValue(proposal), before, proposal,
    };
  });
  const blockerRecordIds = Object.values(HOLD_IDS).sort();
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true,
    generatedOn: '2026-08-08', make: 'Kia', model: 'Morning',
    completionStatement: 'All six frozen Kia Morning records are adjudicated using the correct Korean-market source route. One PCV recall identity receives a bounded dealer-only rewrite; five cross-market, year-conflicted or secondary-only rows remain byte-for-byte holds.',
    applicationGate: { status: 'blocked', blockerRecordIds, reason: 'Five Morning pages remain source-, market-, generation- or year-conflicted. Independent correction and approval are required before any proposal is applied.' },
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change, new issue or public-page change is authorized by this packet.',
      'All six Morning IDs, titles, categories, indexed years and publication states remain unchanged.',
      'Zero NHTSA rows are expected because Morning is the Korean-market model name; absence from U.S. data is not treated as disproof.',
      'Only an exact Korean government source may authorize a Korean-market rewrite; secondary or cross-market evidence remains blocked.',
      'The PCV recall is explicitly dealer-only with no retail part; no search-result commerce is introduced.',
      'New issue identities remain deferred until the remaining-make audit is complete.',
    ],
    source: { snapshotFile: 'data/_kia-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: 6 },
    observations: [
      { code: 'morning-korean-market-source-route', severity: 'methodology', recordIds: modelRows.map((row) => row.id).sort(), detail: 'All three NHTSA communication files and the U.S. flat recall file contain zero Morning rows. Affirmative corrections therefore require exact Korean primary sources.' },
      { code: 'morning-pcv-official-recall-bounded', severity: 'content-correction', recordIds: [REWRITE_ID], detail: 'The Ministry of Environment page exactly supports the PCV plastic-needle wear, oil-ingestion, white-smoke and free steel-needle replacement identity for the complete frozen 2011-2012 year set.' },
      { code: 'morning-fuel-hose-2013-boundary-conflict', severity: 'critical', recordIds: [HOLD_IDS.fuelHose], detail: 'The visually inspected government table ends production on June 30, 2012, while the frozen indexed year set includes 2013; the record is held rather than silently changing SEO scope.' },
      { code: 'morning-cold-start-primary-source-missing', severity: 'critical', recordIds: [HOLD_IDS.coldStart], detail: 'The claimed campaign page was unreachable and no Kia or Korean government primary notice was found; an owner-reported 2015 fuel-pump repair cannot validate the broader ECU campaign.' },
      { code: 'morning-rear-seal-generation-conflict', severity: 'critical', recordIds: [HOLD_IDS.rearSeal], detail: 'The claimed free-repair citation is for the earlier SA generation, not the frozen TA scope.' },
      { code: 'morning-oap-and-clutch-secondary-only', severity: 'critical', recordIds: [HOLD_IDS.alternatorPulley, HOLD_IDS.clutch], detail: 'Neither the OAP conversion nor the multi-generation clutch aggregation has exact Kia primary evidence and neither is stretched into validation.' },
      { code: 'all-morning-pages-preserved', severity: 'seo-safety', recordIds: modelRows.map((row) => row.id).sort(), detail: 'Every Morning ID, title, category, indexed year set and publication state remains preserved; no redirect, archive, deletion or new public page is proposed.' },
    ],
    webSources: WEB_SOURCES,
    pdfSources: PDF_SOURCES,
    nhtsaCoverage: NHTSA_SOURCE,
    summary: { rewrite_same_identity: 1, keep_published_pending_source: 5, total: 6 },
    rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

if (require.main === module) main();
module.exports = { HOLD_IDS, HOLD_REASONS, NHTSA_SOURCE, OUTPUT, PDF_SOURCES, REWRITE_CARD, REWRITE_ID, SNAPSHOT, WEB_SOURCES, evidenceFor, rewriteProposal };
