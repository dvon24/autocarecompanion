/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  ecmRelay: 'nissan-xterra-ecm-relay-engine-stalling',
  exhaustManifold: 'nissan-xterra-first-generation-exhaust-manifold-cracking',
  headGasket: 'nissan-xterra-first-generation-head-gasket-failure',
  ballJoint: 'nissan-xterra-front-lower-ball-joint-control-arm-wear',
  fuelGauge: 'nissan-xterra-fuel-gauge-fuel-level-sender-inaccuracy',
  radiatorCrossContamination: 'nissan-xterra-radiator-to-transmission-coolant-cross-contamination',
  axleSeal: 'nissan-xterra-rear-axle-seal-2005',
  secondaryTiming: 'nissan-xterra-secondary-timing-chain-tensioner-guide-noise',
  smod: 'nissan-xterra-smod-2005',
  timingChain: 'nissan-xterra-timing-chain-2005',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([ids.ecmRelay, ids.secondaryTiming].sort());
const reportCountCleanupIds = Object.freeze([ids.axleSeal, ids.smod, ids.timingChain].sort());
const relevantDocumentIds = Object.freeze([
  '10001739', '10010196', '10015857', '10017410', '10019300', '10019613',
  '10020595', '10022421', '10024689', '10025003', '10025522', '10030165',
  '10031124', '10032506', '10032627', '10033306', '10033691', '10034871',
  '10034904', '10042754', '10043771', '10047580', '10054095', '10109211',
  '10117404', '10123360', '10138223', '10144508', '10144513', '10152514',
  '10152998', '10153007', '10182353', '10190124', '10192048', '10192051',
  '10192158', '10192192', '10192216', '10192217', '10192234', '10192266',
  '10192293', '10192354', '10192445', '10192474', '10192478', '10192506',
  '10192508', '10192524', '10192661', '10192691', '10192727', '10192744',
  '10192813', '10192821', '10213684', '10227268', '10232652', '10235707',
  '10243708', '11004962', '609968', '609976', '613469', '613960', '613965',
  '616640', '618799', '618801', '623299', '625260', '625428', '627440',
  '628209', '629180', '629206', '630975', '631329', '633628',
]);
const campaigns = Object.freeze([
  '00V288000', '02V298000', '02V299000', '02V300000', '03V061000',
  '03V307000', '04V230000', '04V581000', '05E062000', '05V458000',
  '06E026000', '07E046000', '07E105000', '07V528000', '08V045000',
  '08V690000', '09E012000', '10E019000', '10E043000', '10V075000',
  '10V115000', '10V208000', '10V401000', '10V517000', '10V554000',
  '11V592000', '12V462000', '23V067000',
]);

function held({ description, solution, symptoms, systems, evidence, conflict, summary, citations = ['datasets'] }) {
  return Object.freeze({
    description, solution, symptoms, affectedSystems: systems, evidence, conflict, summary, citations,
    commerceDecision: 'failure path, component, generation and VIN fitment remain unresolved; no universal retail part',
  });
}
function retained({ description, solution, symptoms, systems, evidence, summary, citations }) {
  return Object.freeze({
    description, solution, symptoms, affectedSystems: systems, evidence, conflict: null, summary, citations,
    commerceDecision: 'campaign, condition, production range and VIN fitment govern the remedy; no universal retail part',
  });
}

const content = Object.freeze({
  [ids.ecmRelay]: retained({
    description: 'Nissan recall campaign 10V-517/PC068 exactly covers 2005-2006 Xterra. Oxidation on ECM-relay electrical contacts in the IPDM can interrupt ECM power, cause engine-performance problems and permit stalling at low engine speed. The campaign replaces the relay with a new one after VIN eligibility is confirmed. The frozen silicon-evaporation narrative is more specific than the campaign bulletin and is not needed to support this indexed identity.',
    solution: 'Check Service COMM or Nissan recall status by VIN. If PC068 is open, have a Nissan dealer replace the ECM relay in the IPDM using the campaign procedure at no charge. For a completed or ineligible vehicle with a stall, preserve power-loss data and test ECM power, relay control, IPDM terminals, battery and grounds before replacement. Do not buy a relay or IPDM from this page; campaign status and exact electrical diagnosis must be established first.',
    symptoms: ['low-speed stall and ECM power interruption documented', 'campaign eligibility checked by VIN', 'relay, IPDM terminals, battery and grounds separated'],
    systems: ['ECM relay inside IPDM', 'ECM power and relay-control circuit', 'battery, grounds and IPDM terminals'],
    evidence: ['NTB10-137 exactly names 2005-2006 Xterra and 10V-517.', 'It states oxidation can cause performance issues and low-speed stalling.', 'The remedy is VIN-gated ECM-relay replacement.'],
    summary: 'Retained the exact 2005-2006 ECM-relay recall identity and removed unnecessary mechanism detail and out-of-campaign self-repair advice.',
    citations: ['ecmRelayRecall10V517', 'ecmRelayApi10V517'],
  }),
  [ids.exhaustManifold]: held({
    description: 'Nissan communications 625428 and 630975 support a cracked right-hand exhaust manifold only for a bounded first-generation population: the detailed NTB01-038 applicability is 2000-2001 Xterra built before April 6, 2001 and before the stated VG33 engine boundary. They do not establish passenger-side cracking across every 2000-2004 VG33E/VG33ER vehicle, downstream oxygen-sensor effects or a replace-both recommendation.',
    solution: 'Confirm the VG33 application and production boundary, localize the leak at the right-hand manifold rather than a gasket, stud, front tube or catalyst joint, and follow the exact service procedure for a qualifying vehicle. Do not buy a manifold, header, gasket, studs or oxygen sensor from this page; production date, leak source, emissions specification and exact VIN fitment must be established first.',
    symptoms: ['right-hand manifold crack separated from gasket and stud leaks', 'cold-start ticking localized before replacement', '2000-2001 production boundary preserved'],
    systems: ['right-hand exhaust manifold', 'manifold gasket and fasteners', 'front tube, catalyst and oxygen-sensor interfaces'],
    evidence: ['Communication 630975 exactly names 2000-2001 Xterra.', 'The detailed bulletin has VIN/date/engine production gates.', 'No primary source extends the defect through 2004 or supports replacing both manifolds.'],
    conflict: 'The indexed page expands a bounded 2000-2001 right-hand-manifold bulletin into every first-generation year and engine variant.',
    summary: 'Held the overbroad exhaust-manifold identity and preserved the exact right-hand, production-date and leak-source boundaries.',
  }),
  [ids.headGasket]: held({
    description: 'The complete Xterra manufacturer and recall corpus does not establish head-gasket failure as a 2000-2004 VG33 model-wide defect. Exact early communications concern an intake-manifold water-outlet coolant leak, not combustion sealing. The frozen theory that catalytic heat causes rear injectors to fail and cylinders 5/6 to run hot is derived from forums and complaint aggregations, not sanctioned Nissan evidence.',
    solution: 'Pressure-test the cooling system, distinguish external water-outlet, hose, radiator and heater leaks from internal combustion-gas leakage, test cylinder sealing, and inspect injector operation and head flatness only after the failure path is established. Do not buy head gaskets, injectors, heads or a cooling kit from this page; leak path, engine condition and exact VIN fitment must be established first.',
    symptoms: ['external coolant leak separated from combustion sealing', 'coolant/oil mixing and overheating independently verified', 'injector and rear-cylinder heat theory not assumed'],
    systems: ['cylinder heads and head gaskets', 'intake-manifold water outlet and cooling system', 'fuel injectors and cylinder sealing'],
    evidence: ['No head-gasket communication appears in the exact corpus.', '631329/633628 concern an intake-manifold water-outlet leak.', 'No primary source supports the rear-injector/catalyst-heat mechanism.'],
    conflict: 'The indexed page converts secondary owner theories and generic overheating consequences into a five-year head-gasket defect.',
    summary: 'Held the unsupported head-gasket identity and separated external coolant leakage, injector diagnosis and combustion sealing.',
  }),
  [ids.ballJoint]: held({
    description: 'Nissan communication 10109211 supplies a corrected ball-joint axial-end-play measurement procedure across 2000-2015 Xterra; it does not establish premature lower-ball-joint/control-arm wear across 2005-2015. Communication 10034904 identifies the front stabilizer-bar bushing as the source of specified clunk/squeak/pop complaints on 2005-2010 vehicles. The frozen solution also confuses the unrelated 10V-517 ECM-relay campaign with a control-arm recall.',
    solution: 'Measure ball-joint axial end play through the corrected procedure, inspect control-arm bushings and fasteners, isolate stabilizer-bushing noise, and verify steering and wheel-bearing causes before replacement and alignment. Do not buy a control arm, ball joint, bushings or alignment parts from this page; failed component, side, specification and VIN fitment must be established first.',
    symptoms: ['ball-joint play measured rather than inferred from clunking', 'stabilizer-bushing noise kept separate', 'steering, bearing and alignment causes checked'],
    systems: ['lower ball joints and control arms', 'front stabilizer bar bushings', 'steering joints, wheel bearings and alignment'],
    evidence: ['10109211 is a measurement-procedure correction, not a defect bulletin.', '10034904 attributes a bounded noise condition to stabilizer bushings.', '10V-517 is an ECM-relay recall, not a control-arm campaign.'],
    conflict: 'The indexed page turns a measurement procedure into an eleven-year wear defect and cites an unrelated engine-stall recall as suspension evidence.',
    summary: 'Held the unsupported ball-joint/control-arm identity and removed the false 10V-517 suspension-recall claim and universal paired-arm replacement.',
  }),
  [ids.fuelGauge]: held({
    description: 'Recall 10V-075/PC042 exactly covers certain 2006 and 2008 Xterra vehicles, not the frozen 2005-2011 range. It documents an out-of-specification fuel-tank shell that can skew the sender and leave the gauge near one-quarter when empty; the campaign installs a modified fuel-level sender. A separate bulletin covers 2005-2008 gauge/DTC conditions, but neither source establishes the same recall mechanism through 2011 or proves that all similar symptoms share one remedy.',
    solution: 'Check PC042 status by VIN. For a covered vehicle, use the no-charge campaign sender remedy. Otherwise verify gauge behavior, DTCs, sender resistance, wiring and tank condition before selecting a repair, and maintain fuel conservatively until accuracy is restored. Do not buy a sender, pump assembly, tank or seal from this page; campaign eligibility, failure path and exact VIN fitment must be established first.',
    symptoms: ['recall-covered quarter-tank reading preserved', '2006/2008 campaign separated from other gauge faults', 'sender, wiring and tank deformation tested'],
    systems: ['fuel-level sending unit and float arm', 'fuel-tank shell and pump module', 'gauge circuit and ECM fuel-level DTCs'],
    evidence: ['NTB10-031 exactly lists 2006 and 2008 Xterra.', 'The remedy is a modified sender after VIN confirmation.', 'No primary record extends the recall mechanism through 2011.'],
    conflict: 'The indexed page embeds a two-model-year recall number in a seven-year identity and attributes out-of-recall symptoms to the same tank-shell mechanism.',
    summary: 'Held the overbroad fuel-gauge recall identity and preserved the exact 2006/2008 VIN-gated sender remedy.',
    citations: ['fuelSenderRecall10V075', 'fuelSenderApi10V075', 'datasets'],
  }),
  [ids.radiatorCrossContamination]: held({
    description: 'Nissan warranty bulletin WBI12-028 exactly covers 2005-2010 Xterra with automatic transmission and documents an internal crack in the radiator AT-oil-cooler tube that can leak engine coolant internally. It extends radiator coverage to 10 years/100,000 miles with mileage-based co-pays beyond 8 years/80,000 miles. The frozen page adds an unqualified Calsonic seal-failure mechanism, claims the transmission is usually unsalvageable and prescribes a universal bypass/external-cooler conversion; those claims exceed the official evidence. A second live SMOD page covers the same indexed defect and requires canonical policy.',
    solution: 'Inspect coolant and ATF when symptoms or contamination are suspected, stop driving when cross-contamination or transmission malfunction is present, and confirm exact radiator/warranty eligibility and damage through Nissan service information. Do not perform a universal bypass from this page. Do not buy a radiator, external cooler, transmission or flush kit from this page; contamination state, repair path and exact VIN fitment must be established first.',
    symptoms: ['radiator internal leak and resulting contamination documented', '2005-2010 automatic-transmission boundary preserved', 'contamination severity diagnosed before radiator or transmission repair'],
    systems: ['radiator internal AT oil-cooler tube', 'engine coolant and automatic-transmission fluid circuits', 'automatic transmission and related cooling lines'],
    evidence: ['WBI12-028 exactly names 2005-2010 automatic-transmission Xterra.', 'It states an internal oil-cooler-tube crack can leak coolant.', 'The official extension is 10 years/100,000 miles with bounded co-pays.'],
    conflict: 'This indexed page and the separate SMOD page describe the same radiator/cooler identity; choosing a canonical URL requires redirect policy, and the frozen bypass/inevitable-destruction claims exceed official evidence.',
    summary: 'Held the duplicate radiator/cooler identity and replaced universal bypass and inevitable-transmission-loss advice with exact warranty and contamination diagnosis.',
    citations: ['smodWarrantyExtension', 'datasets'],
  }),
  [ids.axleSeal]: held({
    description: 'Nissan NTB10-008 exactly covers rear axle-seal leakage on 2005-2010 Xterra equipped with the M226 axle only when no noise or vibration comes from the rear final-drive gears or side bearings. It directs an axle-shaft assembly repair rather than complete axle replacement. The frozen title combines that bounded seal condition with differential whine, extends it through 2015, and adds pinion-seal, ring-and-pinion and rebuild assumptions. The frozen 450-owner total is unsupported.',
    solution: 'Confirm the axle type, locate the oil source, inspect brake contamination and measure noise/vibration separately. Apply the exact axle-shaft/seal procedure only when the M226 and no-noise conditions are met; diagnose pinion, gear and bearing noise through a separate final-drive path. Do not buy seals, an axle shaft, brakes, bearings or a differential from this page; axle type, leak/noise branch and VIN fitment must be established first.',
    symptoms: ['axle-seal leakage separated from differential whine', 'M226 axle positively identified', 'brake contamination and gear/bearing noise assessed separately'],
    systems: ['M226 axle shafts and oil seals', 'rear brakes and ABS tone components', 'separate pinion, ring gear and side bearings'],
    evidence: ['10033306 applies to 2005-2010 M226 vehicles.', 'Its gate explicitly requires no final-drive noise or vibration.', 'No primary source supports 2011-2015 or one combined seal-and-whine identity.'],
    conflict: 'The indexed page merges a no-noise axle-seal bulletin with differential whine and adds five unsupported model years.',
    summary: 'Held the conflated axle-seal/differential-whine identity and removed the fabricated 450-owner total and universal seal/rebuild pricing.',
  }),
  [ids.secondaryTiming]: retained({
    description: 'Nissan NTB09-128A exactly supports a high-frequency buzzing or whining noise from the VQ40 secondary timing-chain system that rises with engine speed. The bulletin applies to 2005-2010 Xterra, so the frozen 2005-2007 subset is supported, and it directs replacement of both secondary chains and both tensioner shoes after the condition is confirmed. It does not require replacing the primary chain or water pump, and the frozen worn-tooling mechanism and catastrophic-damage claims are not needed for this identity.',
    solution: 'Confirm the high-frequency noise comes from the secondary timing-chain system and increases with engine speed. Follow the exact Nissan procedure for both secondary chains and both tensioner shoes, including oil/filter service, while preserving the primary chain unless separate inspection requires otherwise. Do not buy chains, shoes, a primary-chain kit or water pump from this page; the confirmed noise branch and exact VIN/part supersession must be established first.',
    symptoms: ['high-frequency buzz or whine localized to secondary chains', 'noise frequency confirmed to rise with engine RPM', 'primary-chain and water-pump work kept separate'],
    systems: ['VQ40 secondary timing chains', 'secondary tensioner shoes', 'front cover, oil and primary timing chain'],
    evidence: ['NTB09-128A exactly names Xterra and the secondary-chain noise.', 'The 2005-2007 frozen subset lies within its 2005-2010 applicability.', 'The action is both secondary chains and both tensioner shoes.'],
    summary: 'Retained the exact VQ40 secondary-chain/tensioner-noise identity and removed unsupported mechanism, catastrophic-damage and while-you-are-there parts claims.',
    citations: ['secondaryTimingBulletin'],
  }),
  [ids.smod]: held({
    description: 'This page duplicates the separate radiator-to-transmission cross-contamination page for the same 2005-2010 automatic-transmission Xterra identity. Nissan WBI12-028 supports an internal crack in the radiator AT-oil-cooler tube and resultant internal coolant leakage, with coverage extended to 10 years/100,000 miles; it does not call the condition Campaign P9521, say contamination destroys the transmission within minutes to hours, or prescribe a universal bypass and external cooler. The frozen 2,200-owner total is unsupported.',
    solution: 'Inspect coolant and ATF when cross-contamination is suspected, stop driving if contamination or transmission malfunction is present, and confirm exact radiator/warranty eligibility and resulting damage through Nissan service information. Do not perform a universal bypass from this page. Do not buy a radiator, cooler, transmission or flush kit from this page; canonical URL, contamination state, repair path and exact VIN fitment must be established first.',
    symptoms: ['duplicate SMOD identity explicitly flagged', 'radiator oil-cooler-tube leak separated from resulting transmission damage', 'warranty status and contamination state verified'],
    systems: ['radiator internal AT oil-cooler tube', 'coolant and automatic-transmission fluid circuits', 'automatic transmission and cooler lines'],
    evidence: ['WBI12-028 supports the exact 2005-2010 automatic-transmission boundary.', 'The official extension reaches 10 years/100,000 miles.', 'No primary source supports 2,200 reports, minutes-to-destruction or Campaign P9521.'],
    conflict: 'Two live Xterra URLs cover the same defect, and this one adds unsupported social proof, campaign naming and universal bypass advice; canonicalization requires redirect policy.',
    summary: 'Held the duplicate SMOD identity and removed the fabricated 2,200-owner total, P9521 claim and universal bypass/transmission-replacement advice.',
    citations: ['smodWarrantyExtension', 'datasets'],
  }),
  [ids.timingChain]: held({
    description: 'The exact Nissan bulletin concerns high-frequency secondary-chain noise and replacement of both secondary chains and tensioner shoes on 2005-2010 Xterra. It does not establish deterioration and shattering of all timing-chain guides across 2005-2015, an 80,000-130,000-mile failure band, catastrophic chain jump or replacement of every chain/guide/tensioner. This page also overlaps the narrower secondary-chain page. The frozen 1,800-owner total is unsupported.',
    solution: 'Localize the noise, verify whether its frequency rises with RPM, preserve cam/crank and oil-pressure data, and distinguish secondary-chain/shoe noise from primary timing, accessory and internal-engine conditions. Apply the exact secondary-chain procedure only when its gate is met. Do not buy a complete timing kit, oil or engine parts from this page; identity, failure branch and exact fitment must be established first.',
    symptoms: ['secondary-chain buzz separated from general rattle', '2005-2010 bulletin boundary preserved', 'primary-chain, oil-pressure and accessory causes tested'],
    systems: ['secondary chains and tensioner shoes', 'primary timing chain and guides', 'cam/crank timing, lubrication and accessories'],
    evidence: ['NTB09-128A is limited to secondary-chain noise and 2005-2010.', 'It does not establish all-guide failure through 2015.', 'No primary source supports 1,800 reports or the mileage/catastrophic-damage claims.'],
    conflict: 'The indexed page expands a bounded secondary-chain bulletin into an eleven-year all-guide failure identity and overlaps the narrower live page.',
    summary: 'Held the overbroad general timing-chain identity and removed the fabricated 1,800-owner total, mileage, catastrophic-damage and complete-kit claims.',
    citations: ['secondaryTimingBulletin', 'datasets'],
  }),
});

const pdfSources = Object.freeze({
  ecmRelayRecall10V517: {
    title: 'Nissan NTB10-137 - Xterra ECM Relay Recall 10V-517',
    type: 'recall',
    url: 'https://static.nhtsa.gov/odi/rcl/2010/RCRIT-10V517-9900.pdf',
    sha256: '2455a38d79e5b819531c64e760828da11676066636c9e189d4b58849779427c8',
    pageCount: 8,
    visuallyReviewedPages: [1, 3, 4, 6, 7],
  },
  fuelSenderRecall10V075: {
    title: 'Nissan NTB10-031 - Xterra Fuel Gauge Recall 10V-075',
    type: 'recall',
    url: 'https://static.nhtsa.gov/odi/rcl/2010/RCRIT-10V075-4498.pdf',
    sha256: '283a0a14e02316a209d2c7b168c6ca8457f4261abdaf1accae2ade8c90ab1861',
    pageCount: 7,
    visuallyReviewedPages: [1, 2, 3, 6, 7],
  },
  smodWarrantyExtension: {
    title: 'Nissan WBI12-028 - 2005-2010 Xterra Radiator Warranty Extension',
    type: 'tsb',
    url: 'https://static.nhtsa.gov/odi/tsbs/2012/MC-10192051-9999.pdf',
    sha256: 'fc9ccdd0f7b2752d5e662f1e25b70239482380612633d282b9682d44a19260ac',
    pageCount: 3,
    visuallyReviewedPages: [1, 2, 3],
  },
  secondaryTimingBulletin: {
    title: 'Nissan NTB09-128A - Xterra Secondary Timing Chain Noise',
    type: 'tsb',
    url: 'https://www.nissan-techinfo.com/asistgc_1/diskdocs/1/S/S/1SS19.PDF',
    sha256: '41dc565c14b585e643c14b7374d69b1fecdb242b1646a6a72a002bbc8ee85d6a',
    pageCount: 5,
    visuallyReviewedPages: [1, 2, 3, 4, 5],
  },
});

function recallApi(campaign, title, contains = campaign) {
  return Object.freeze({ title, type: 'nhtsa', url: `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}`, contains });
}
const otherSources = Object.freeze({
  datasets: { title: 'NHTSA Manufacturer Communications and Recall Datasets', type: 'nhtsa', url: DATASET_URL, contains: 'Manufacturer Communications' },
  ecmRelayApi10V517: recallApi('10V517000', 'NHTSA Recall 10V517000 - Xterra ECM Relay'),
  fuelSenderApi10V075: recallApi('10V075000', 'NHTSA Recall 10V075000 - Xterra Fuel Sender'),
});

module.exports = Object.freeze({
  make: 'Nissan', model: 'Xterra', slug: 'xterra', reviewDate: '2026-08-10',
  snapshotFile: 'data/_nissan-deeplink-snapshot-2026-08-10.json',
  outputFile: 'data/known-issue-nissan-xterra-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds,
  modelAliases: ['XTERRA'],
  searchTerms: ['ECM relay', 'IPDM', 'stall', 'exhaust manifold', 'manifold crack', 'head gasket', 'overheat', 'ball joint', 'control arm', 'fuel gauge', 'fuel level', 'sender', 'radiator', 'transmission cooler', 'coolant', 'cross contamination', 'axle seal', 'differential', 'timing chain', 'chain guide', 'tensioner', 'suspension', 'transmission', 'engine', 'fire', 'wiring', 'brake', 'steering'],
  relevantDocumentIds,
  campaigns,
  pdfSources,
  otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 5, '2000-2004': 76, '2005-2009': 27, '2010-2014': 30, '2015-2019': 89, '2020-2024': 43, '2025-2026': 2 },
    totalRows: 272,
    relevantRowCount: 80,
    uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 32, post: 68 },
    totalRows: 100,
    campaignCount: campaigns.length,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'The complete 100-row Xterra recall corpus exactly supports the 2005-2006 ECM-relay identity and limits 10V-075 to certain 2006/2008 fuel-sender vehicles. It contains no control-arm recall under 10V-517 and no SMOD safety recall.',
  },
  content,
  requiredProse: [
    { id: ids.ecmRelay, field: 'description', patterns: ['10V-517/PC068 exactly covers 2005-2006', 'Oxidation', 'low engine speed'] },
    { id: ids.exhaustManifold, field: 'description', patterns: ['2000-2001 Xterra', 'before April 6, 2001', 'do not establish.*2000-2004'] },
    { id: ids.ballJoint, field: 'description', patterns: ['measurement procedure', '10V-517 ECM-relay'] },
    { id: ids.fuelGauge, field: 'description', patterns: ['2006 and 2008 Xterra', 'not the frozen 2005-2011'] },
    { id: ids.radiatorCrossContamination, field: 'description', patterns: ['10 years/100,000 miles', 'second live SMOD page'] },
    { id: ids.axleSeal, field: 'description', patterns: ['2005-2010', 'no noise or vibration', '450-owner total'] },
    { id: ids.secondaryTiming, field: 'description', patterns: ['high-frequency buzzing or whining', '2005-2010 Xterra', 'both secondary chains'] },
    { id: ids.smod, field: 'description', patterns: ['duplicates the separate', '2,200-owner total'] },
    { id: ids.timingChain, field: 'description', patterns: ['does not establish.*2005-2015', '1,800-owner total'] },
  ],
  observations: [
    { code: 'two-retained-eight-held', severity: 'identity-safety', recordIds: allIds, detail: 'Only the exact ECM-relay recall and bounded secondary-chain-noise identities clear the gate; eight pages remain published but held.' },
    { code: 'two-live-smod-identities', severity: 'seo-safety', recordIds: [ids.radiatorCrossContamination, ids.smod], detail: 'Two live URLs cover the same 2005-2010 radiator/cooler identity; no canonical choice or redirect is authorized without policy.' },
    { code: 'ecm-recall-exact', severity: 'safety-accuracy', recordIds: [ids.ecmRelay], detail: '10V-517/PC068 exactly covers 2005-2006 Xterra ECM-relay oxidation and possible low-speed stalling.' },
    { code: 'fuel-recall-overextended', severity: 'safety-accuracy', recordIds: [ids.fuelGauge], detail: '10V-075 is limited to certain 2006 and 2008 vehicles, not 2005-2011.' },
    { code: 'false-control-arm-recall', severity: 'safety-accuracy', recordIds: [ids.ballJoint], detail: '10V-517 is an ECM-relay campaign and cannot support a lower-control-arm recall claim.' },
    { code: 'head-gasket-theory-unverified', severity: 'technical-accuracy', recordIds: [ids.headGasket], detail: 'The corpus supports an intake-water-outlet leak, not the frozen catalyst-heat/rear-injector head-gasket mechanism.' },
    { code: 'axle-leak-excludes-whine', severity: 'technical-accuracy', recordIds: [ids.axleSeal], detail: 'NTB10-008 explicitly applies only when no final-drive noise or vibration is present.' },
    { code: 'timing-pages-separated', severity: 'technical-accuracy', recordIds: [ids.secondaryTiming, ids.timingChain], detail: 'The exact secondary-chain bulletin is preserved while the overlapping 2005-2015 all-guide identity remains held.' },
    { code: 'fabricated-owner-totals-proposed-zero', severity: 'social-proof-safety', recordIds: reportCountCleanupIds, detail: 'Three unsupported owner totals totaling 4,450 are reduced to unknown zero and never rendered as 0+ owners.' },
    { code: 'all-xterra-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No Xterra page is removed, archived, merged, redirected or allowed to lose its frozen indexed identity.' },
  ],
});
