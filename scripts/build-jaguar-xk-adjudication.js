/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { diffFields, fullRecord, hashValue, normalizedFileHash } = require('./jaguar-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_jaguar-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-jaguar-xk-adjudication-2026-08-06.json');

const IDS = {
  waterPump: 'jaguar-xk-5-0l-aj133-water-pump-bearing-seal-failure',
  hvacDrain: 'jaguar-xk-blocked-hvac-condensate-duckbill-drain-flooding-passenger-fo',
  camCover: 'jaguar-xk-cam-cover-gasket-oil-leak-4-2-aj-v8',
  touchscreen: 'jaguar-xk-center-touchscreen-blank-unresponsive',
  roof: 'jaguar-xk-convertible-roof-mechanism-2007',
  epb: 'jaguar-xk-electronic-parking-brake-motor-module-failure',
  hydrobush: 'jaguar-xk-front-lower-control-arm-hydrobush-failure',
  headlamp: 'jaguar-xk-headlamp-adjustment-mechanism-compliance-setup-issue',
  ignition: 'jaguar-xk-ignition-coil-plug-misfire',
  limp: 'jaguar-xk-limp-mode-and-sudden-loss-of-power',
  propshaft: 'jaguar-xk-non-serviceable-rear-propshaft-rubber-coupling-splitting',
  batteryDrain: 'jaguar-xk-parasitic-battery-drain',
  occupancy: 'jaguar-xk-passenger-seat-airbag-occupancy-sensor-failure',
  coolantPipe: 'jaguar-xk-plastic-crossover-valley-coolant-pipe-splitting',
  differential: 'jaguar-xk-rear-differential-bearing-whine',
  supercharger: 'jaguar-xk-supercharger-nose-cone-coupler-isolator-breakdown',
  throttle: 'jaguar-xk-throttle-body-sensor-2007',
  timing: 'jaguar-xk-timing-chain-tensioner-ajv8-2007',
  tpms: 'jaguar-xk-tpms-sensor-under-seat-module-failure',
  acceleration: 'jaguar-xk-unintended-acceleration-during-braking',
  vvt: 'jaguar-xk-variable-valve-timing-solenoid-cold-start-rattle',
  transmission: 'jaguar-xk-zf-6hp-automatic-transmission-mechatronic-bridge-seal-sealin',
};

const SOURCES = {
  waterPump: 'https://static.nhtsa.gov/odi/tsbs/2015/MC-10096542-1020.pdf',
  hvacDrain: 'https://www.jaguarforums.com/forum/attachments/xk-xkr-x150-33/2007-xkr-water-leak-55566/c-water-leaks-onto-passenger-floor-11603d1309880227',
  coolantPipe: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10142170-9999.pdf',
  differentialDataset: 'https://static.nhtsa.gov/odi/ffdd/tsbs/MFR_COMMS_RECEIVED_2010-2014.zip',
  supercharger: 'https://static.nhtsa.gov/odi/tsbs/2017/MC-10127304-9999.pdf',
  timing: 'https://static.nhtsa.gov/odi/tsbs/2014/SB-10056266-1292.pdf',
  tpms: 'https://static.nhtsa.gov/odi/rcl/2009/RCDNN-09V161-5234.pdf',
  headlampCampaign: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=03V509000',
  accelerationCampaign: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=05V162000',
};

const PDF_SOURCES = {
  waterPump: SOURCES.waterPump,
  coolantPipe: SOURCES.coolantPipe,
  supercharger: SOURCES.supercharger,
  timing: SOURCES.timing,
  tpms: SOURCES.tpms,
};
const PDF_SHA256 = {
  waterPump: '143a4cba4100fe660175f5073219adbbdb363aa0782fbb109bfd410d5d7ad9c3',
  coolantPipe: '364ed5a5a23c9f44fa3a1f846ed89f653f844f2eed543408b40f10165fd23931',
  supercharger: '4c9043550244d576ac04dd36649fac92a8bf93bac14e48fc1996b51fc0d527f5',
  timing: 'bcda1e671fcf2d1f888edf1d2baceff11190f1abb7fe7f582f2d3362a5db280f',
  tpms: 'f59653d2ef66b67dde8ad967051ac5df32ea6208eefcd5f8ef4502e46c1545d8',
};
const VISUALLY_INSPECTED_PAGES = {
  waterPump: [1], coolantPipe: [1, 2, 3], supercharger: [1, 2, 3, 4], timing: [1, 2], tpms: [1, 2],
};

const NHTSA_COMMUNICATION_RECORD = {
  tsbId: '10033384', make: 'JAGUAR', model: 'XK', years: '2007,2008,2009',
  summary: 'REAR DIFFERENTIAL REPLACEMENT. DUE TO A CHANGE IN DESIGN, THE REAR DIFFERENTIAL HAS A NEW SERVICE PART.',
};
const DATASET_MARKERS = ['10033384', 'JAGUAR', 'XK', 'REAR DIFFERENTIAL REPLACEMENT', 'DUE TO A CHANGE IN DESIGN'];

const RECALL_QUERIES = Object.fromEntries(Array.from({ length: 16 }, (_, index) => 2000 + index).map((year) => [year, `https://api.nhtsa.gov/recalls/recallsByVehicle?make=JAGUAR&model=XK&modelYear=${year}`]));
const EXPECTED_RECALLS = {
  2000: { status: 200, campaigns: ['03V509000'] }, 2001: { status: 200, campaigns: ['03V509000'] },
  2002: { status: 200, campaigns: ['03V509000'] }, 2003: { status: 200, campaigns: ['03V509000', '04V024000'] },
  2004: { status: 200, campaigns: ['04V024000'] }, 2005: { status: 400, campaigns: [] },
  2006: { status: 200, campaigns: ['05V162000'] }, 2007: { status: 200, campaigns: ['09V161000'] },
  2008: { status: 200, campaigns: ['09V161000'] }, 2009: { status: 200, campaigns: ['09V161000'] },
  2010: { status: 200, campaigns: ['10V332000', '11V168000'] }, 2011: { status: 200, campaigns: ['10V332000', '13V340000'] },
  2012: { status: 200, campaigns: ['13V340000', '15V038000'] },
  2013: { status: 200, campaigns: ['13V340000', '14V157000', '14V389000', '15V038000'] },
  2014: { status: 200, campaigns: ['13V340000', '14V157000', '14V389000', '15V038000'] },
  2015: { status: 200, campaigns: ['14V389000', '15V038000'] },
};

const EXPECTED_CAMPAIGNS = {
  headlampCampaign: {
    number: '03V509000', model: 'XK', years: ['1997', '1998', '1999', '2000', '2001', '2002', '2003'],
    component: ['EXTERIOR LIGHTING', 'HEADLIGHTS'],
    problem: ['adjustment mechanism', 'operated without suitable instruction', 'Federal Motor Vehicle Safety Standard No. 108'],
    remedy: ["owner's manual addendum", 'necessary headlamp aiming instructions'],
  },
  accelerationCampaign: {
    number: '05V162000', model: 'XK', years: ['2006'],
    component: ['VEHICLE SPEED CONTROL', 'ACCELERATOR PEDAL'],
    problem: ['incorrectly assembled', 'clearance between the accelerator pedal and the brake pedal may be reduced', 'both pedals being operated at the same time'],
    remedy: ['inspect the pedal assembly', 'replace the accelerator pedal'],
  },
};

const REWRITE_CARDS = {
  [IDS.headlamp]: {
    description: 'NHTSA recall 03V509000 covers 1997-2003 Jaguar XK vehicles, including model year 2000. The headlamp adjustment mechanism could be operated without suitable instructions, which did not comply with FMVSS No. 108. Improper headlamp aim can reduce roadway illumination or create glare for other drivers.',
    solution: "Check the VIN and recall-completion record. Jaguar's recall remedy was to send owners an owner's manual addendum containing instructions for operating the headlamp adjustment mechanism. If the lamps appear improperly aimed, use Jaguar service information or a qualified repair facility; the campaign does not prescribe replacing a headlamp part.",
    severity: 'low', confidence: 'high', symptoms: [],
    affectedSystems: ['Headlamp adjustment mechanism', "Owner's manual headlamp-aiming instructions"], dtcCodes: [],
    citations: [{ type: 'recall', title: 'NHTSA Recall 03V509000 - Jaguar XK Headlamp Adjustment Instructions', url: SOURCES.headlampCampaign }],
    summary: 'Replaced unsupported part, cost and aiming-procedure claims with the exact owner-manual-addendum remedy and safety consequence in NHTSA recall 03V509000.',
  },
  [IDS.acceleration]: {
    description: 'NHTSA recall 05V162000 covers 659 model-year 2006 Jaguar XK vehicles. Some accelerator pedal arms were incorrectly assembled, reducing clearance between the accelerator and brake pedals. This could allow both pedals to be operated at the same time, and the accelerator pedal could be held down by the pedal stop assembly, increasing crash risk.',
    solution: 'Check the VIN and recall-completion record. Jaguar dealers were instructed to inspect the accelerator pedal assembly and replace it free of charge if the affected condition was present.',
    severity: 'high', confidence: 'high',
    symptoms: ['Reduced clearance between accelerator and brake pedals', 'Accelerator pedal may be held down by the pedal stop assembly'],
    affectedSystems: ['Accelerator pedal assembly', 'Accelerator-to-brake pedal clearance'], dtcCodes: [],
    citations: [{ type: 'recall', title: 'NHTSA Recall 05V162000 - Jaguar XK Accelerator Pedal Assembly', url: SOURCES.accelerationCampaign }],
    summary: 'Narrowed the page to the exact pedal-assembly defect, affected population and dealer remedy in NHTSA recall 05V162000; removed complaint extrapolation, unrelated electronic-throttle advice, costs and commerce.',
  },
};

const KEEP_REASONS = {
  [IDS.waterPump]: 'Jaguar SSM64657 supports a coolant leak from the 5.0L AJ133 water pump and records a product-improvement break at XK VIN B46456. It does not establish the frozen bearing/seal mechanism, P0217/P00B7, part AJ813909, mandatory valley-pipe co-repair or the cost and interval claims, so the indexed row remains byte-for-byte unchanged.',
  [IDS.hvacDrain]: 'The available JTB00121 transcript is limited to 2007-2009 XK vehicles with a trapped or blocked A/C drain tube and directs installation of a new drain tube. The pinned primary PDF is not available, and the source does not validate clearing/trimming as a guaranteed fix, secondary-drain instructions or the broader frozen remedy, so the row remains unchanged.',
  [IDS.camCover]: 'No exact Jaguar primary source was located for the frozen 2007-2009 AJ-V8 cam-cover-gasket identity, OE-only AJ812399 claim, RTV procedure, aftermarket-gasket warning, cover-cracking mechanism, costs and prevalence. The row remains byte-for-byte unchanged.',
  [IDS.touchscreen]: 'No exact Jaguar primary source was located that establishes one 2007-2015 MOST-ring touchscreen-failure identity, battery-lead bridging reset, used XF/XK screen interchange and programming claims. The row remains byte-for-byte unchanged.',
  [IDS.roof]: 'No exact Jaguar primary source was located for one nine-year convertible-roof hydraulic, microswitch and pivot-binding aggregation or the six-month white-lithium-grease instruction. The row remains byte-for-byte unchanged.',
  [IDS.epb]: 'No exact Jaguar primary source was located for the frozen C1785/C1799 electronic-parking-brake motor/module/harness aggregation, switch diagnosis and cost claims across 2007-2015. The row remains byte-for-byte unchanged.',
  [IDS.hydrobush]: 'No exact Jaguar primary source was located for the all-years hydrobush failure scope, C2P17090 fitment, complete-arm/all-four replacement advice or aftermarket-quality claims. The row remains byte-for-byte unchanged.',
  [IDS.ignition]: 'No exact Jaguar primary source was located for a nine-year, four-engine oil-fouled coil identity, P0300-P0308 scope, full-set replacement or cam-cover co-repair. The row remains byte-for-byte unchanged.',
  [IDS.limp]: 'The row has no citations and broadly combines battery voltage, throttle body and accelerator-pedal causes with affiliate commerce. Recall 05V162000 is a distinct 2006 accelerator-pedal assembly condition and cannot replace this general limp-mode identity, so the row remains byte-for-byte unchanged.',
  [IDS.propshaft]: 'No exact Jaguar primary source was located for the 2006-2014 non-serviceable Jurid-coupling identity, cross-fitment, shaft-balance and center-bearing claims or the proposed replacement alternatives. The row remains byte-for-byte unchanged.',
  [IDS.batteryDrain]: 'No exact Jaguar primary source was located for one 2007-2015 module-not-sleeping, BCM, accessory and charging aggregation or its diagnostic and remedy claims. The row remains byte-for-byte unchanged.',
  [IDS.occupancy]: 'The row has no citations, and no exact Jaguar primary source was located for the passenger-occupancy mat, harness and connector aggregation or contact-cleaner advice. The safety page remains byte-for-byte unchanged pending exact evidence.',
  [IDS.coolantPipe]: 'JTB00566NAS4 covers certain F-TYPE, XF and XJ vehicles and does not include XK; it also does not support the frozen 4.2L silicone-hose, renew-all-pipes or blower-removal claims. A different-model bulletin cannot authorize this indexed XK rewrite, so the row remains unchanged.',
  [IDS.differential]: 'NHTSA manufacturer-communication record 10033384 says the 2007-2009 XK rear differential received a new service part because of a design change. It does not establish premature Visteon bearing failure or whine, nor the frozen shaft/propshaft conversion and used S-Type remedy, so the row remains byte-for-byte unchanged.',
  [IDS.supercharger]: 'JTB00349NAS2 covers 2010-2014 XK 5.0L supercharged vehicles with torsional-isolator or spring-support-shaft wear and prescribes an isolator kit or complete assembly after exact checks. It does not support the 2007-2009 4.2L scope, bearing/coupler rebuild or oil-maintenance claims, so the row remains unchanged.',
  [IDS.throttle]: 'No exact Jaguar primary source was located for one 2007-2015 throttle-position-sensor identity across 4.2L and 5.0L engines with P2135/P2101, cleaning, recalibration and a spare-part roadside swap. The row remains byte-for-byte unchanged.',
  [IDS.timing]: 'The named LTB00473 source was not verified. The accessible LTB00474NAS2 is Land Rover-only for 2010-2012 5.0L vehicles and covers tensioners/levers with 8.1-9.2 labor hours; it does not include Jaguar XK, 4.2L engines, all chains/guides or a 25-plus-hour repair, so the row remains unchanged.',
  [IDS.tpms]: 'Recall 09V161 covers 112 certain 2007-2009 XK vehicles with run-flat tires and a Car Configuration File setting that suppresses TPMS warnings. It does not establish 2007-2015 sensor-battery, under-seat-module or initiator failure, so the broader row remains byte-for-byte unchanged.',
  [IDS.vvt]: 'No exact Jaguar primary source was located for the 2007-2009 P1349/P1396 VVT-solenoid/phaser aggregation, oil-viscosity remedy, costs and prevalence. The row remains byte-for-byte unchanged.',
  [IDS.transmission]: 'No exact Jaguar primary source was located for one 2007-2014 ZF 6HP bridge-seal, sealing-sleeve, mechatronic and conductor-plate aggregation with the frozen DTC set and remedy. The row remains byte-for-byte unchanged.',
};

function boundaryEvidence(id) {
  const startingYear = {
    [IDS.camCover]: 2007, [IDS.touchscreen]: 2007, [IDS.roof]: 2007, [IDS.epb]: 2007,
    [IDS.hydrobush]: 2007, [IDS.ignition]: 2007, [IDS.limp]: 2006, [IDS.propshaft]: 2006,
    [IDS.batteryDrain]: 2007, [IDS.occupancy]: 2006, [IDS.throttle]: 2007,
    [IDS.vvt]: 2007, [IDS.transmission]: 2007,
  }[id];
  return [{ kind: 'official-registry-boundary-not-negative-proof', url: RECALL_QUERIES[startingYear], verifiedOn: '2026-08-06', observation: 'The year recall inventory contains distinct campaign identities and cannot establish or disprove this broad non-recall aggregation.' }];
}

function evidenceFor(id) {
  const exact = {
    [IDS.waterPump]: [{ kind: 'jaguar-ssm-partial-mechanism-remedy-scope', url: SOURCES.waterPump, verifiedOn: '2026-08-06', observation: 'SSM64657 supports AJ133 water-pump leakage and improvement VIN B46456, not the frozen bearing, code, part and co-repair claims.' }],
    [IDS.hvacDrain]: [{ kind: 'jaguar-bulletin-transcript-partial-remedy-scope', url: SOURCES.hvacDrain, verifiedOn: '2026-08-06', observation: 'The JTB00121 transcript identifies a trapped/blocked drain and a new drain tube, not the frozen guaranteed trimming and secondary-drain remedy.' }],
    [IDS.coolantPipe]: [{ kind: 'jaguar-bulletin-model-scope-mismatch', url: SOURCES.coolantPipe, verifiedOn: '2026-08-06', observation: 'JTB00566NAS4 lists F-TYPE, XF and XJ applicability and excludes XK.' }],
    [IDS.differential]: [{ kind: 'nhtsa-manufacturer-communication-cause-remedy-gap', url: SOURCES.differentialDataset, verifiedOn: '2026-08-06', observation: 'Record 10033384 supports a design-change/new-service-part conversion, not the frozen bearing failure or used-part remedy.' }],
    [IDS.supercharger]: [{ kind: 'jaguar-bulletin-engine-year-cause-remedy-scope', url: SOURCES.supercharger, verifiedOn: '2026-08-06', observation: 'JTB00349NAS2 is limited to 2010-2014 5.0L supercharged XK isolator wear and does not support a 4.2L bearing rebuild.' }],
    [IDS.timing]: [{ kind: 'land-rover-bulletin-make-model-scope-mismatch', url: SOURCES.timing, verifiedOn: '2026-08-06', observation: 'LTB00474NAS2 is Land Rover-only and cannot authorize a Jaguar XK rewrite.' }],
    [IDS.tpms]: [{ kind: 'nhtsa-recall-component-year-outcome-mismatch', url: SOURCES.tpms, verifiedOn: '2026-08-06', observation: '09V161 is limited to 112 run-flat-equipped 2007-2009 XK vehicles with an incorrect configuration setting, not sensor or module failure.' }],
    [IDS.headlamp]: [{ kind: 'nhtsa-recall-exact-identity', url: SOURCES.headlampCampaign, verifiedOn: '2026-08-06', observation: 'Campaign 03V509000 directly establishes the frozen headlamp-compliance identity and owner-manual-addendum remedy.' }],
    [IDS.acceleration]: [{ kind: 'nhtsa-recall-exact-identity', url: SOURCES.accelerationCampaign, verifiedOn: '2026-08-06', observation: 'Campaign 05V162000 directly establishes the frozen 2006 pedal-clearance identity, consequence and inspect/replace remedy.' }],
  }[id];
  return exact || boundaryEvidence(id);
}

function rewriteProposal(current, card) {
  return fullRecord({
    ...current, ...card,
    make: current.make, model: current.model, title: current.title, category: current.category,
    severity: current.severity, years: current.years, relatedIssueIds: current.relatedIssueIds,
    trims: [], engines: [], dtcCodes: [], estimatedCostLow: null, estimatedCostHigh: null,
    typicalMileageLow: null, typicalMileageHigh: null, communityRecommendations: [], fixParts: [],
    humanApproved: false, reportCount: 0, source: 'manual', status: 'published', lastReportedByOwners: '',
    reviewedOn: '2026-08-06', contentUpdatedOn: '2026-08-06', contentUpdateSummary: card.summary,
  });
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const modelRows = snapshot.records.filter((row) => row.make === 'Jaguar' && row.model === 'XK');
  if (modelRows.length !== 22) throw new Error(`expected 22 Jaguar XK rows, found ${modelRows.length}`);
  const rows = modelRows.map((current) => {
    const before = fullRecord(current);
    const card = REWRITE_CARDS[current.id];
    if (!card && !KEEP_REASONS[current.id]) throw new Error(`missing XK decision: ${current.id}`);
    const proposal = card ? rewriteProposal(before, card) : before;
    return {
      id: current.id, model: current.model, action: card ? 'rewrite_same_identity' : 'keep_published_pending_source',
      reason: card ? card.summary : KEEP_REASONS[current.id],
      identityRule: card ? 'The existing recall identity remains on the same ID, title, model, category, years and publication state; only exact campaign-backed content changes.' : 'No content, scope, remedy, commerce or publication-state changes; partial, absent or mismatched evidence cannot replace the frozen indexed identity.',
      commerceDecision: card ? 'removed-unsupported-commerce' : (current.communityRecommendations.some((item) => item.affiliateUrl) ? 'unchanged-affiliate-pending-source' : 'unchanged-no-affiliate-commerce-present'),
      changedFields: diffFields(before, proposal), evidence: evidenceFor(current.id), beforeSha256: hashValue(before), proposalSha256: hashValue(proposal), before, proposal,
    };
  });
  const summary = { rewrite_same_identity: rows.filter((row) => row.action === 'rewrite_same_identity').length, keep_published_pending_source: rows.filter((row) => row.action === 'keep_published_pending_source').length, total: rows.length };
  const packet = {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-adjudication', requiresIndependentApproval: true,
    generatedOn: '2026-08-06', make: 'Jaguar', model: 'XK',
    completionStatement: 'This packet reconciles all 22 frozen Jaguar XK rows. Five official PDFs and 12 relevant pages were visually inspected, the official manufacturer-communications dataset record was checked, both exact recall campaigns were verified, and 2000-2015 recall inventories were live-locked. Two exact same-identity recall corrections are proposed; 20 rows remain byte-for-byte unchanged.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change, new issue or public-page change is authorized by this packet.',
      'All 22 XK rows remain published; 20 are byte-for-byte unchanged and two exact recall identities preserve ID, title, model, category and years.',
      'A component, model, engine, VIN, year, cause, code, symptom, remedy or commerce-fitment mismatch cannot authorize a broader rewrite.',
      'A recall-registry result is not negative proof that a non-recall issue does not exist.',
      'Every rewrite contains zero commerce, cost, mileage, trim, engine or DTC claims and requires independent row-by-row approval.',
      'Distinct issue identities remain deferred until the post-audit new-known-issues phase.',
    ],
    source: { snapshotFile: 'data/_jaguar-deeplink-snapshot-2026-08-06.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: 22 },
    observations: [
      { code: 'xk-two-exact-recall-corrections-only', severity: 'high-confidence', recordIds: [IDS.headlamp, IDS.acceleration], detail: 'Only campaigns 03V509000 and 05V162000 clear the exact indexed identity and remedy threshold.' },
      { code: 'xk-coolant-bulletin-excludes-model', severity: 'critical-scope', recordIds: [IDS.coolantPipe], detail: 'JTB00566NAS4 does not list XK; no replacement is proposed.' },
      { code: 'xk-timing-source-is-land-rover-only', severity: 'critical-scope', recordIds: [IDS.timing], detail: 'The accessible timing bulletin is Land Rover-only and cannot authorize a Jaguar rewrite.' },
      { code: 'xk-partial-source-holds', severity: 'independent-review-required', recordIds: [IDS.waterPump, IDS.hvacDrain, IDS.differential, IDS.supercharger, IDS.tpms], detail: 'Each primary source differs materially in mechanism, model/year scope or remedy from the frozen page.' },
      { code: 'xk-primary-source-gaps-held', severity: 'source-gap', recordIds: Object.keys(KEEP_REASONS).filter((id) => ![IDS.waterPump, IDS.hvacDrain, IDS.coolantPipe, IDS.differential, IDS.supercharger, IDS.timing, IDS.tpms].includes(id)), detail: 'No broad row was rewritten from a recall inventory, forum citation or different component identity.' },
      { code: 'all-xk-pages-preserved', severity: 'seo-safety', recordIds: Object.values(IDS), detail: 'Every indexed XK record remains published; there are no archives, redirects, deletions, new IDs or identity changes.' },
    ],
    reviewSources: SOURCES, pdfSources: PDF_SOURCES, sourceArtifactSha256: PDF_SHA256, visuallyInspectedPages: VISUALLY_INSPECTED_PAGES,
    nhtsaCommunicationRecord: NHTSA_COMMUNICATION_RECORD, datasetMarkers: DATASET_MARKERS,
    exactCampaigns: EXPECTED_CAMPAIGNS, mismatchSources: { recallQueries: RECALL_QUERIES, expected: EXPECTED_RECALLS }, summary, rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary }, null, 2));
}

if (require.main === module) main();
module.exports = { DATASET_MARKERS, EXPECTED_CAMPAIGNS, EXPECTED_RECALLS, IDS, KEEP_REASONS, NHTSA_COMMUNICATION_RECORD, PDF_SHA256, PDF_SOURCES, RECALL_QUERIES, REWRITE_CARDS, SOURCES, VISUALLY_INSPECTED_PAGES, evidenceFor, rewriteProposal };
