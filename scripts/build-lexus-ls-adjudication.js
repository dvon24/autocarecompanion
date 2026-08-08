/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { RECALL_FILES, SOURCE_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./lexus-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_lexus-deeplink-snapshot-2026-08-08.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-lexus-ls-adjudication-2026-08-08.json');
const REVIEW_DATE = '2026-08-08';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#manufacturer-communications';
const RECALL_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#recalls';
const PRESSROOM_URL = 'https://pressroom.lexus.com/2021-lexus-ls-500-500h-add-layers-of-flagship-refinement/';
const IDS = Object.freeze({
  airSuspension: 'lexus-ls-air-suspension-failure-2007',
  headlight: 'lexus-ls-headlight-self-leveling-2007',
  lamps: 'lexus-ls-noncompliant-aftermarket-corner-bumper-lamp-assemblies',
  airbag: 'lexus-ls-side-curtain-knee-airbag-inflator-defect',
  infotainment: 'lexus-ls500-infotainment-lag-2018',
});
const MODEL_ALIASES = Object.freeze(['LS', 'LS 430', 'LS 460', 'LS HYBRID']);
const CAMPAIGNS = Object.freeze(['04V295000','04V317000','06E056000','06V096000','09E012000','09V020000','19V134000','19V544000','20V012000','20V682000','22V239000','24V124000','24V275000','25V595000','25V744000']);
const MAPPED_CAMPAIGNS = Object.freeze(['06V096000', '09E012000']);
const DEFERRED_CAMPAIGNS = Object.freeze(CAMPAIGNS.filter((campaign) => !MAPPED_CAMPAIGNS.includes(campaign)));
const BLOCKER_IDS = Object.freeze(Object.values(IDS).sort());
const PDF_SOURCES = Object.freeze({
  airSuspension2018: { title: 'L-SB-0025-18 - Front Suspension Height Low Due to Air Strut Leak', url: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10143930-9999.pdf', localPath: 'C:/tmp/MC-10143930-9999.pdf', nhtsaDocumentId: '10143930', pages: 8, bytes: 407355, sha256: '974c0c9bdd274d6e1160b35092beeb518af00f94da40198c21d33b6fda2b4299' },
  heightSensor2018: { title: 'L-TT-0234-17 - 2018 LC/LS Shipping Company Precaution', url: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10129945-9999.pdf', localPath: 'C:/tmp/MC-10129945-9999.pdf', nhtsaDocumentId: '10129945', pages: 1, bytes: 146159, sha256: '548f7d8c5b2ab2dffc72cf2ce950781835817c9e274bc8edc326755860062b5f' },
  carPlay2018: { title: 'L-SB-0028-19 - Multimedia System Enhancements Phase 3 (Panasonic)', url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10162736-9999.pdf', localPath: 'C:/tmp/MC-10162736-9999.pdf', nhtsaDocumentId: '10162736', pages: 8, bytes: 570205, sha256: '51d882329338c0b631a245e704fa0c0ecc407245693ad5a350bcb784fcdc8eeb' },
  update2019: { title: 'L-SB-0022-19 - Navigation Update Phase 3 (Panasonic)', url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10159733-9999.pdf', localPath: 'C:/tmp/MC-10159733-9999.pdf', nhtsaDocumentId: '10159733', pages: 6, bytes: 660188, sha256: 'a46de3365a4feaca764c3cef381f429357860e48b52636d7618d1670a254ae83' },
  update2020to2021: { title: 'L-SB-0043-19 Rev2 - Navigation System Software Update (Panasonic)', url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10202451-9999.pdf', localPath: 'C:/tmp/MC-10202451-9999.pdf', nhtsaDocumentId: '10202451', pages: 7, bytes: 578739, sha256: 'd06b4fa035016ea563c3ecaf5c2e6bac84c888839c60839d47b79d6c7be49bed' },
  pressKit2021: { title: '2021 Lexus LS 500, 500h Add Layers of Flagship Refinement', url: 'https://pressroom.lexus.com/?generate_pdf=60319', localPath: 'C:/tmp/lexus-2021-ls-press-kit.pdf', nhtsaDocumentId: 'lexus-pressroom-60319', pages: 11, bytes: 15703, sha256: 'b3ff32f44b98f11ed777e2b38a181240f7a88b0cdeef029d9b9f9f667592c6d6' },
  lampOwnerNotice: { title: 'NHTSA 09E-012 - SaberSport Owner Notification and Affected Lamp List', url: 'https://static.nhtsa.gov/odi/rcl/2009/RCONL-09E012-9446.pdf', localPath: 'C:/tmp/RCONL-09E012-9446.pdf', nhtsaDocumentId: '09E012', pages: 4, bytes: 223984, sha256: 'aab4708af0143cec30a5602439f295ae618b8e7a2fc158dd32c91a5f0f72a6bb' },
  airbagDefect: { title: 'NHTSA 06V-096 - Toyota Part 573 Defect Information Report', url: 'https://static.nhtsa.gov/odi/rcl/2006/RCDNN-06V096-2980.PDF', localPath: 'C:/tmp/RCDNN-06V096-2980.pdf', nhtsaDocumentId: '06V096', pages: 4, bytes: 111975, sha256: '16509b39c2de64e01db971b024b67c6afe66b599102a1533d7486413bc4d4fd6' },
  airbagOwnerNotice: { title: 'Lexus SSC 6LB - Supplemental Restraint System Airbag Replacement Notice', url: 'https://static.nhtsa.gov/odi/rcl/2006/RCONL-06V096-3339.PDF', localPath: 'C:/tmp/RCONL-06V096-3339.pdf', nhtsaDocumentId: '06V096', pages: 1, bytes: 52524, sha256: '0a5d24dca63902855491db22c5a75d60c9e43a4ca5abe4d104256d7bbf6de878' },
});
const BULLETIN_INVENTORY = Object.freeze({ source: NHTSA_DATASET_URL, modelAliases: MODEL_ALIASES, periodCounts: { '1995-1999': 0, '2000-2004': 12, '2005-2009': 25, '2010-2014': 20, '2015-2019': 252, '2020-2024': 321, '2025-2026': 74 }, totalRows: 704, exactSourceDocumentIds: ['10129945','10143930','10159733','10162736','10202451'], sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })) });
const RECALL_INVENTORY = Object.freeze({ source: RECALL_DATASET_URL, modelAliases: MODEL_ALIASES, periodCounts: { pre: 18, post: 661 }, totalRows: 679, campaignCount: CAMPAIGNS.length, campaigns: CAMPAIGNS, mappedCampaigns: MAPPED_CAMPAIGNS, deferredCampaigns: DEFERRED_CAMPAIGNS, sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })) });

function actionFor(id) { return [IDS.lamps, IDS.airbag].includes(id) ? 'replace_incomplete_citation_and_targeted_safety_cleanup_pending_source' : 'remove_false_citation_and_targeted_safety_cleanup_pending_source'; }
function commerceDecisionFor(id) {
  if (id === IDS.lamps) return 'campaign-specific-refund-or-compliant-replacement-no-retail-part';
  if (id === IDS.airbag) return 'dealer-recall-vin-and-airbag-serial-specific-no-retail-part';
  if (id === IDS.infotainment) return 'dealer-software-version-specific-no-retail-part';
  return 'blocked-no-exact-fitment-no-retail-part';
}
function citation(source, type) { return { type, title: source.title, url: source.url }; }
function citationsFor(id) {
  if (id === IDS.airSuspension) return [citation(PDF_SOURCES.airSuspension2018, 'tsb'), { type: 'nhtsa', title: 'NHTSA Manufacturer Communications datasets', url: NHTSA_DATASET_URL }];
  if (id === IDS.headlight) return [citation(PDF_SOURCES.heightSensor2018, 'tech-tip'), { type: 'nhtsa', title: 'NHTSA Manufacturer Communications datasets', url: NHTSA_DATASET_URL }];
  if (id === IDS.lamps) return [citation(PDF_SOURCES.lampOwnerNotice, 'recall'), { type: 'nhtsa', title: 'NHTSA Recall datasets', url: RECALL_DATASET_URL }];
  if (id === IDS.airbag) return [citation(PDF_SOURCES.airbagDefect, 'recall'), citation(PDF_SOURCES.airbagOwnerNotice, 'recall'), { type: 'nhtsa', title: 'NHTSA Recall datasets', url: RECALL_DATASET_URL }];
  if (id === IDS.infotainment) return [citation(PDF_SOURCES.carPlay2018, 'tsb'), citation(PDF_SOURCES.update2019, 'tsb'), citation(PDF_SOURCES.update2020to2021, 'tsb'), citation(PDF_SOURCES.pressKit2021, 'oem'), { type: 'nhtsa', title: 'NHTSA Manufacturer Communications datasets', url: NHTSA_DATASET_URL }];
  throw new Error(`Unexpected LS record ${id}`);
}
function contentFor(id) {
  const content = {
    [IDS.airSuspension]: {
      description: 'The complete federal LS-family communication inventory contains no exact source establishing a recurring 2007-2017 air-strut and compressor failure across every LS 460, LS 460L, LS 600h and LS 600hL listed on this page. Lexus L-SB-0025-18 documents an air leak at a shock-absorber seal only on certain production-defined 2018 LS 500 and LS 500h vehicles equipped with air suspension; it does not extend backward to this page or support the claimed compressor-burnout pattern, mileage range or universal conversion remedy.',
      solution: 'Confirm that the exact vehicle is equipped with air suspension, measure ride height under the model-year procedure, and isolate any pneumatic leak, sensor/bracket fault, electrical fault or compressor-control condition before replacing a component. Do not order an Arnott, Suncore, Strutmasters, BC Racing or SM-LS460 product, and do not convert the suspension, from this page. This is a vehicle-specific diagnostic/service remedy; no universal retail part is asserted.',
      summary: 'Separated a verified 2018 LS 500/500h air-strut bulletin from the unsupported 2007-2017 identity and removed the unverified compressor, conversion-kit and aftermarket-brand prescriptions.',
    },
    [IDS.headlight]: {
      description: 'The complete federal LS-family inventory contains no exact 2007-2017 source establishing recurring deterioration or moisture failure of three or four headlight-level sensors, the listed B1601/B1602 codes, or an OEM-only sensor pattern. Lexus L-TT-0234-17 instead covers 2018 two-wheel-drive LS 500/LS 500h vehicles whose front height-sensor bracket can be bent by incorrect towing; that later, damage-specific condition cannot support this page across the prior generation.',
      solution: 'Verify the warning and aiming complaint with the exact model-year lighting diagnostic procedure. Inspect wiring, linkage, mounting and any evidence of collision, road or towing damage before replacing or calibrating a sensor. Do not assume a sensor count, fault code, failed side or replacement part from this page. This is a vehicle-specific diagnostic/service remedy; no universal retail part is asserted.',
      summary: 'Removed the unsupported sensor-count, moisture, DTC and automatic-replacement claims and bounded the only exact height-sensor source to incorrect towing of 2018 LS vehicles.',
    },
    [IDS.lamps]: {
      description: 'NHTSA campaign 09E-012 covers SaberSport aftermarket replacement lamps, not original Lexus equipment. The visually verified owner-notice list identifies part TY727-J0WW2 as a side-marker application for 1998-2005 Lexus GS/IS/LS vehicles. The lamps lacked the required amber side reflex reflector under FMVSS 108. A 2001 LS is within that catalog range only when that exact SaberSport aftermarket part is installed; the campaign does not establish a defect in every 2001 LS lamp.',
      solution: 'Inspect the installed aftermarket lamp for the manufacturer and part number. For TY727-J0WW2 or another part expressly listed in 09E-012, use the campaign documents to confirm the historical free compliant replacement or refund process; replace a noncompliant lamp assembly with a compliant application. A generic bulb does not correct a missing side reflector. This is an equipment-specific recall remedy; no universal retail part is asserted.',
      summary: 'Added the exact NHTSA owner notice and TY727-J0WW2 application, separated aftermarket equipment from OEM lamps, and removed the unrelated Bosch-bulb recommendation.',
    },
    [IDS.airbag]: {
      description: 'NHTSA campaign 06V-096 and Lexus campaign 6LB cover certain 2004-2006 LS vehicles identified by production records, VIN and airbag serial number. The Part 573 report identifies LS production from October 4, 2003 through December 2, 2005 and explains that some side, curtain-shield or knee-airbag inflators had insufficient heating agent, which could produce insufficient inflation in a crash. The indexed 2004 year is supported, but the recall does not apply to every 2004 LS and an airbag warning light is not the eligibility test.',
      solution: 'Check the full VIN and Lexus campaign-completion history for 6LB/NHTSA 06V-096. If the campaign is open, an authorized Lexus dealer replaces the specific SRS airbag identified for that vehicle at no charge. Do not use a battery replacement or generic SRS code scan to decide recall eligibility, and do not buy an inflator from this page. This is a VIN-and-airbag-serial-specific dealer recall remedy; no universal retail part is asserted.',
      summary: 'Added the exact Part 573 report and Lexus owner notice, bounded applicability to VIN/airbag-serial records, and removed the unrelated battery recommendation and warning-light eligibility inference.',
    },
    [IDS.infotainment]: {
      description: 'Exact Lexus documents support defined model-year, head-unit and software-version conditions rather than a universal touchpad defect. L-SB-0028-19 added Apple CarPlay and Amazon Alexa to applicable 2018 LS 500/LS 500h Panasonic systems; L-SB-0022-19 addressed defined 2019 symptoms including a frozen display and lost Bluetooth connection; and L-SB-0043-19 Rev2 covered defined Panasonic faults on 2020-2021 LS models. Lexus introduced the 12.3-inch multimedia touchscreen for the 2021 LS, not 2022. The prior broad input-lag, overshoot and frustration claims are subjective and do not establish a hardware failure across 2018-2025.',
      solution: 'Identify the model year, installed multimedia generation, audio/navigation version and reproducible symptom, then use the exact applicable Lexus bulletin to determine whether a software update is available. Do not apply an update intended for another head unit, and do not tell every 2018-2025 owner to use the later "Hey Lexus" interface. This is a VIN/head-unit-specific dealer software remedy; no universal retail part is asserted.',
      summary: 'Replaced subjective interface claims with three visually verified software boundaries, corrected the touchscreen introduction from 2022 to 2021, and removed the all-years "Hey Lexus" advice.',
    },
  }[id];
  if (!content) throw new Error(`Unexpected LS record ${id}`);
  return content;
}
function proposalFor(row) {
  const proposal = clone(fullRecord(row));
  const content = contentFor(row.id);
  proposal.description = content.description;
  proposal.solution = content.solution;
  proposal.confidence = [IDS.lamps, IDS.airbag, IDS.infotainment].includes(row.id) ? 'high' : 'low';
  proposal.symptoms = [];
  proposal.affectedSystems = [];
  proposal.dtcCodes = [];
  proposal.estimatedCostLow = null;
  proposal.estimatedCostHigh = null;
  proposal.typicalMileageLow = null;
  proposal.typicalMileageHigh = null;
  proposal.citations = citationsFor(row.id);
  proposal.communityRecommendations = [];
  proposal.fixParts = [];
  proposal.humanApproved = false;
  proposal.reportCount = 0;
  proposal.source = 'manual';
  proposal.lastReportedByOwners = '';
  proposal.reviewedOn = REVIEW_DATE;
  proposal.contentUpdatedOn = REVIEW_DATE;
  proposal.contentUpdateSummary = content.summary;
  proposal.relatedIssueIds = [];
  return proposal;
}
function evidenceFor(row) {
  const common = `Complete inventory: ${BULLETIN_INVENTORY.totalRows} exact LS-family manufacturer-communication rows and ${RECALL_INVENTORY.totalRows} exact recall rows / ${RECALL_INVENTORY.campaignCount} campaigns were replayed.`;
  return {
    [IDS.airSuspension]: [common, 'Visual review of L-SB-0025-18 limits the verified seal-leak condition to production-defined 2018 LS 500/LS 500h vehicles equipped with air suspension.', 'No exact 2007-2017 source supports compressor burnout, universal air-strut failure, SM-LS460 fitment or a coil-conversion prescription.'],
    [IDS.headlight]: [common, 'Visual review of L-TT-0234-17 limits the exact height-sensor condition to a bent bracket caused by incorrect towing of 2018 two-wheel-drive LS/LC vehicles.', 'No exact 2007-2017 source supports deterioration, moisture failure, three-to-four sensor counts, B1601/B1602 or automatic sensor replacement.'],
    [IDS.lamps]: [common, 'The corrected recall parser reads the official defect, consequence, remedy and notes columns; 09E-012 is aftermarket-only and unrelated to Lexus OEM equipment.', 'Visual review of the owner-notice list identifies TY727-J0WW2 as a side-marker application for 1998-2005 Lexus GS/IS/LS and offers compliant replacement or refund.'],
    [IDS.airbag]: [common, 'Visual review of the Part 573 report identifies 2004-2006 LS production, VINs and the insufficient-heating-agent defect; only 133 vehicles across all listed models were potentially affected.', 'Visual review of the Lexus 6LB notice makes remedy eligibility VIN/airbag-serial-specific and states that the dealer replaces the specific SRS airbag at no charge.'],
    [IDS.infotainment]: [common, 'Visual review of three Lexus bulletins supports exact 2018, 2019 and 2020-2021 Panasonic update boundaries and warns against applying the wrong head-unit software.', 'The official 2021 Lexus LS release says the 12.3-inch multimedia touchscreen was added for 2021, disproving the page\'s 2022 timeline; no source establishes a universal touchpad hardware defect.'],
  }[row.id];
}
function buildPacket(snapshot) {
  const rows = snapshot.records.filter((row) => row.make === 'Lexus' && row.model === 'LS').sort((a, b) => a.id.localeCompare(b.id));
  const decisions = rows.map((row) => { const before = fullRecord(row); const proposal = proposalFor(row); return { id: row.id, action: actionFor(row.id), commerceDecision: commerceDecisionFor(row.id), evidence: evidenceFor(row), before, beforeSha256: hashValue(before), proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal) }; });
  return {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-adjudication',
    requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE,
    make: 'Lexus',
    model: 'LS',
    completionStatement: 'All five frozen LS pages retain their indexed identities. Two recall pages are corrected to exact equipment/VIN scopes, one infotainment page is corrected to exact software and touchscreen timelines, and two unsupported prior-generation identities remain held for independent review.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'The packet corrects two recall scopes, a false touchscreen timeline and three unsafe or unsupported parts prescriptions. Independent review is required before any body-copy write.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change or new issue is authorized.',
      'All five LS IDs, titles, categories, indexed year sets, trim sets, engine sets, allowed severities and publication states remain unchanged.',
      'Recall 09E-012 is bounded to listed SaberSport aftermarket equipment; recall 06V-096/6LB is bounded to VIN and airbag serial records.',
      'No suspension conversion, guessed sensor, generic bulb, battery, airbag inflator, head unit or other retail part is approved.',
      'All 704 exact manufacturer-communication rows and 679 exact recall rows / 15 campaigns were replayed; only 06V-096 and 09E-012 map to existing LS pages.',
    ],
    source: { snapshotFile: 'data/_lexus-deeplink-snapshot-2026-08-08.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: rows.length },
    observations: [
      { code: 'ls-recall-scopes-corrected', severity: 'critical-correction', recordIds: [IDS.airbag, IDS.lamps].sort(), campaignNumbers: MAPPED_CAMPAIGNS, detail: 'The two recall pages are bounded to exact OEM VIN/serial or aftermarket equipment applicability and direct official campaign documents.' },
      { code: 'ls-touchscreen-timeline-corrected', severity: 'critical-correction', recordIds: [IDS.infotainment], detail: 'Official Lexus material establishes the LS touchscreen for 2021, not 2022; later voice-interface advice is not extrapolated backward.' },
      { code: 'ls-prior-generation-source-gaps', severity: 'critical-correction', recordIds: [IDS.airSuspension, IDS.headlight].sort(), detail: 'The only exact air-strut and height-sensor documents concern 2018 LS vehicles and cannot establish the frozen 2007-2017 identities.' },
      { code: 'ls-no-unverified-commerce', severity: 'commerce-safety', recordIds: BLOCKER_IDS, detail: 'Every prescription has an explicit equipment/VIN/dealer diagnostic boundary and no guessed retail link or search URL.' },
      { code: 'ls-thirteen-campaign-identities-deferred', severity: 'new-issues-deferred', recordIds: [], campaignNumbers: DEFERRED_CAMPAIGNS, detail: 'Thirteen separate campaign identities remain deferred until the remaining-make audit is complete.' },
      { code: 'all-ls-pages-preserved', severity: 'seo-safety', recordIds: BLOCKER_IDS, detail: 'All five IDs, titles, categories, indexed year sets, trim sets, engine sets, allowed severities and publication states remain preserved.' },
    ],
    pressroomSource: { title: PDF_SOURCES.pressKit2021.title, url: PRESSROOM_URL, pdfUrl: PDF_SOURCES.pressKit2021.url, assertedBoundary: 'New 12.3-inch multimedia touchscreen added for all 2021 LS models.' },
    pdfSources: Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => [key, Object.fromEntries(Object.entries(source).filter(([field]) => field !== 'localPath'))])),
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    mappedCampaigns: MAPPED_CAMPAIGNS,
    deferredCampaigns: DEFERRED_CAMPAIGNS,
    summary: { remove_false_citation_and_targeted_safety_cleanup_pending_source: 3, replace_incomplete_citation_and_targeted_safety_cleanup_pending_source: 2, total: 5 },
    rows: decisions,
  };
}

if (require.main === module) { const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const packet = buildPacket(snapshot); fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`); console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2)); }
module.exports = { BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, DEFERRED_CAMPAIGNS, IDS, MAPPED_CAMPAIGNS, MODEL_ALIASES, OUTPUT, PDF_SOURCES, PRESSROOM_URL, RECALL_INVENTORY, REVIEW_DATE, SNAPSHOT, actionFor, buildPacket, citationsFor, commerceDecisionFor, contentFor, evidenceFor, proposalFor };
