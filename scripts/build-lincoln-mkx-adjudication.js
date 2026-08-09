/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { RECALL_FILES, SOURCE_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./lincoln-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_lincoln-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-lincoln-mkx-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const MODEL_ALIASES = Object.freeze(['MKX']);
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const IDS = Object.freeze({
  oil: 'lincoln-mkx-2-7l-ecoboost-excessive-oil-consumption-from-faulty-valve-gu',
  water37: 'lincoln-mkx-3.7l-water-pump-internal',
  battery: 'lincoln-mkx-battery-cable-chafing-causing-electrical-short-fire',
  waterFirst: 'lincoln-mkx-internal-water-pump-failure-contaminating-engine-oil',
  sync: 'lincoln-mkx-mylincoln-touch-sync-touchscreen-freezing-crashing',
  roof: 'lincoln-mkx-panoramic-vista-roof-spontaneous-shattering',
  ptu: 'lincoln-mkx-power-transfer-unit-overheating-failure-awd-models',
  brake: 'lincoln-mkx-rear-brake-jounce-hose-rupture',
  airbag: 'lincoln-mkx-takata-driver-airbag-inflator-explosion-risk',
});
const BLOCKER_IDS = Object.freeze(Object.values(IDS).sort());

const PDF_SOURCES = Object.freeze({
  oil: { title: 'Ford TSB 19-2243: MKX 2.7L EcoBoost Oil Consumption and Valve Guides', type: 'tsb', url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10164421-0001.pdf', localPath: 'C:/tmp/lincoln-mkx-oil-19-2243.pdf', pages: 5, visualPages: [1, 2, 3, 4, 5], bytes: 106725, sha256: 'a976815127bf02b43dd5bf015e2dd8e09afbc1c7149c1497ba72e6e5fa5e901e' },
  battery: { title: 'NHTSA Part 573 Report 19V809 / Ford 19S41: MKX Battery Cable Harness', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2019/RCLRPT-19V809-5818.PDF', localPath: 'C:/tmp/lincoln-mkx-battery-19v809.pdf', pages: 3, visualPages: [1, 2, 3], bytes: 214895, sha256: '6336d1584442476b2ccaf2bee8743424d39931509654a2b17ca85863175870a0' },
  syncCoverage: { title: 'Ford Customer Satisfaction Program 12M01: MKX APIM Warranty Extension', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2012/SB-10044905-1809.pdf', localPath: 'C:/tmp/lincoln-mkx-sync-12m01.pdf', pages: 6, visualPages: [1, 2, 3, 4, 5, 6], bytes: 470952, sha256: '4b8a59012b0736a1344e98d28dfe0710bf1021f15f10807d5b394f60ad392c8b' },
  syncTsb: { title: 'Ford TSB 13-8-2: 2011-2013 MKX MyLincoln Touch System Performance', type: 'tsb', url: 'https://www.fordservicecontent.com/pubs/content/~WT/~MUS~LEN/3580/tsb13-08-02.pdf', localPath: 'C:/tmp/lincoln-mkx-sync-tsb-13-8-2.pdf', pages: 3, visualPages: [1, 2, 3], bytes: 52228, sha256: 'f32c9723a43ce82b6785a366876cc6cd9a64d3d433cfe21dc3b8f6519ec2b439' },
  ptuHeat: { title: 'Ford SSM 47230: MKX PTU Fluid Breakdown from Excessive Heat', type: 'tsb', url: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10137131-9999.pdf', localPath: 'C:/tmp/lincoln-mkx-ptu-47230.pdf', pages: 1, visualPages: [1], bytes: 6341, sha256: 'e02c8477236e99cd5111e67a04da8360ef890597333ce40307991c94a8e9bcb7' },
  ptuVent: { title: 'Ford SSM 46522: MKX PTU Internal-Failure Vent-Hose Replacement', type: 'tsb', url: 'https://static.nhtsa.gov/odi/tsbs/2017/MC-10109012-9999.pdf', localPath: 'C:/tmp/lincoln-mkx-ptu-46522.pdf', pages: 1, visualPages: [1], bytes: 6176, sha256: '5619b7b5d8046f0f8fc3e7baf14f3ef7fb7dda0bb76e5d916c7905722b450a49' },
  brake: { title: 'Updated NHTSA Part 573 Report 25V544 / Ford 25S87: MKX Rear Brake Jounce Hoses', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V544-9834.pdf', localPath: 'C:/tmp/lincoln-mkx-brake-25v544.pdf', pages: 5, visualPages: [1, 2, 3, 4, 5], bytes: 466013, sha256: '61e2b56eabfbc5876c2378cdedd31699a83878ab738e95d4c8f0e42f1beabd8f' },
  airbagDriver: { title: 'NHTSA Part 573 Report 21V158 / Ford 21S12: MKX Driver Airbag Inflator', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2021/RCLRPT-21V158-8333.PDF', localPath: 'C:/tmp/lincoln-mkx-airbag-21v158.pdf', pages: 6, visualPages: [1, 2, 3, 4, 5, 6], bytes: 218090, sha256: 'a2acad790ddb2f9a40216f6bb15887b1635f5bfd18ade63057e34aae0801e9a8' },
  airbagPassenger: { title: 'Lincoln Owner Notice 21V081 / 21S05: Certain 2007 MKX Replacement Passenger Airbags', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2021/RCONL-21V081-3857.pdf', localPath: 'C:/tmp/lincoln-mkx-airbag-21v081.pdf', pages: 16, visualPages: [1, 2, 3, 4], bytes: 215279, sha256: '4b1065c08a48a8f45f61ad39a26f13cd5d04bdb5424893396ad352faceedda80' },
  owner2011: { title: '2011 Lincoln MKX Owner Guide: Engine Coolant Checks and Safety', type: 'owner-manual', url: 'https://www.fordservicecontent.com/Ford_Content/catalog/owner_guides/11mkxog1e.pdf', localPath: 'C:/tmp/lincoln-mkx-2011-owner-guide.pdf', pages: 367, visualPages: [304, 305, 306], bytes: 2682785, sha256: '7d14c6db972d5e279a5404af088ed749c7431ac363be374b648d9400a75cb95f' },
  owner2018: { title: '2018 Lincoln MKX Owner Manual: Engine Coolant Checks and Safety', type: 'owner-manual', url: 'https://www.fordservicecontent.com/Ford_Content/Catalog/owner_information/2018-Lincoln-MKX-Owner-Manual-version-2_om_EN-US_02_2018.pdf', localPath: 'C:/tmp/lincoln-mkx-2018-owner-guide.pdf', pages: 607, visualPages: [318, 319, 320], bytes: 6381690, sha256: '1d33e55ef3f013280a0ae4341f2de5981daac8fa5e4967d40fda5ac693075e7c' },
});
const OTHER_SOURCES = Object.freeze({
  roofComplaint: { title: 'NHTSA 2013 Lincoln MKX Complaints (ODI 11083747)', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=LINCOLN&model=MKX&modelYear=2013', localPath: 'C:/tmp/lincoln-mkx-2013-complaints.json', bytes: 157432, sha256: '90ae5585d10fab133eecc204abd8f4f8eb29a3d78adaf7c3ab1a0cd726d7ebc1' },
  takataDnd: { title: 'NHTSA 2024 Ford and Mazda Takata Do Not Drive Consumer Alert', type: 'nhtsa', url: 'https://www.nhtsa.gov/press-releases/consumer-alert-ford-mazda-issue-do-not-drive-warnings-more-457000-vehicles-recalled' },
});
const BULLETIN_INVENTORY = Object.freeze({ source: NHTSA_DATASET_URL, modelAliases: MODEL_ALIASES, periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 12, '2010-2014': 33, '2015-2019': 219, '2020-2024': 160, '2025-2026': 23 }, totalRows: 447, sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })) });
const RECALL_INVENTORY = Object.freeze({ source: NHTSA_DATASET_URL, modelAliases: MODEL_ALIASES, periodCounts: { pre: 1, post: 362 }, totalRows: 363, campaignCount: 24, campaigns: ['08V301000', '10V516000', '10V659000', '11V128000', '14V393000', '14V682000', '15V712000', '16V343000', '16V384000', '17V024000', '17V123000', '18V046000', '18V548000', '18V612000', '19V001000', '19V632000', '19V809000', '20V414000', '20V469000', '21E013000', '21V081000', '21V158000', '25V442000', '25V544000'], sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })) });

function citation(source) { return { url: source.url, type: source.type, title: source.title }; }
function citationsFor(id) {
  const citations = {
    [IDS.oil]: [citation(PDF_SOURCES.oil)],
    [IDS.water37]: [citation(PDF_SOURCES.owner2011), citation(PDF_SOURCES.owner2018)],
    [IDS.battery]: [citation(PDF_SOURCES.battery)],
    [IDS.waterFirst]: [citation(PDF_SOURCES.owner2011)],
    [IDS.sync]: [citation(PDF_SOURCES.syncTsb), citation(PDF_SOURCES.syncCoverage)],
    [IDS.roof]: [citation(OTHER_SOURCES.roofComplaint)],
    [IDS.ptu]: [citation(PDF_SOURCES.ptuHeat), citation(PDF_SOURCES.ptuVent)],
    [IDS.brake]: [citation(PDF_SOURCES.brake)],
    [IDS.airbag]: [citation(PDF_SOURCES.airbagDriver), citation(PDF_SOURCES.airbagPassenger), citation(OTHER_SOURCES.takataDnd)],
  };
  if (!citations[id]) throw new Error(`Unexpected MKX row ${id}`);
  return citations[id];
}

function contentFor(id) {
  const content = {
    [IDS.oil]: {
      confidence: 'high',
      description: 'Ford TSB 19-2243 applies to certain 2016-2017 Lincoln MKX vehicles with the 2.7L EcoBoost engine built from April 1, 2016 through January 1, 2017. It documents white or blue exhaust smoke, rough idle at operating temperature or after a hot restart, misfire or an illuminated malfunction indicator, and oil consumption of 1 quart in less than 3,000 miles. Applicable DTCs are P0300-P0306, P0316, P0524 and P06DD. Ford states that valve guides may be the cause and directs technicians to replace the cylinder heads after confirming all bulletin criteria.',
      solution: 'Have a Ford or Lincoln dealer confirm the build date, 2.7L engine and symptoms against TSB 19-2243 before authorizing the repair. The bulletin procedure replaces the cylinder heads and includes a critical four-stage crankshaft-pulley-bolt torque procedure; it does not tell every 2016-2017 owner to replace spark plugs or promise warranty coverage. Check the oil level as the owner manual directs and avoid driving with low oil pressure. Do not buy cylinder heads, a gasket kit, spark plugs or a universal engine kit from this page; no universal retail part is recommended because this is a dealer/technician procedure, and exact parts and coverage must be confirmed by VIN.',
      symptoms: ['oil consumption of 1 quart in less than 3,000 miles', 'white or blue exhaust smoke', 'rough idle at operating temperature or after a hot restart', 'misfire or illuminated malfunction indicator'],
      dtcCodes: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'P0305', 'P0306', 'P0316', 'P0524', 'P06DD'],
      estimatedCostLow: null,
      estimatedCostHigh: null,
      summary: 'Bound the oil-consumption page to the exact TSB build dates, symptoms, DTC set and technician procedure; removed unsupported spark-plug and cost assumptions.',
    },
    [IDS.water37]: {
      confidence: 'medium',
      description: 'This indexed page overlaps another MKX water-pump page, but neither is being removed or redirected in this proposal. The complete 447-document MKX manufacturer-communication inventory does not establish a model-wide 2011-2018 3.7L water-pump failure rate, a universal mileage threshold or a preventive timing-chain replacement rule. Ford owner guides instead say repeated coolant loss of about 1 quart or 1 liter per month requires inspection and warn that low coolant can cause overheating and engine damage. Unexplained coolant loss or fluid contamination is a diagnosis prompt, not proof that the internal pump failed.',
      solution: 'If the engine overheats, stop safely, switch it off and let it cool. Never remove the coolant-reservoir cap while the engine is running or hot. Have the cooling system pressure-tested and the engine oil inspected so the actual leak path and any contamination are confirmed before parts are ordered. Do not buy a water pump, timing-chain set or universal cooling kit from this page; no universal retail part is recommended, and the repair path and parts must be confirmed for the VIN and diagnosed cause.',
      symptoms: ['repeated coolant loss', 'engine overheating', 'possible fluid contamination requiring diagnosis'],
      dtcCodes: [],
      estimatedCostLow: null,
      estimatedCostHigh: null,
      summary: 'Replaced an unsupported universal failure, mileage, cost and timing-set prescription with owner-manual-backed coolant safety and diagnosis boundaries.',
    },
    [IDS.battery]: {
      confidence: 'high',
      description: 'Ford safety recall 19S41/NHTSA 19V809 covers 54,411 certain 2016-2017 Lincoln MKX vehicles with the 3.7L engine, built November 12, 2014 through September 11, 2017. The B+ battery cable harness can contact the transmission shifter-cable bracket; reduced clearance can wear through insulation and short the cable to ground, increasing the risk of overheated or melted wiring or fire. Ford reviewed three 3.7L MKX underhood-fire reports, but the inspections had not identified a source for those fires.',
      solution: 'Check the VIN for 19S41/19V809. The free dealer remedy removes four battery-harness clips and one elbow guide, then installs a wire-channel shield, protective sleeve, push pins and tie straps. The official filing lists no advance warning, so absence of a warning light does not prove the cable is safe. Do not buy a battery cable, shield or harness part from this page because this is a VIN-scoped, no-charge dealer recall remedy.',
      symptoms: [],
      dtcCodes: [],
      estimatedCostLow: 0,
      estimatedCostHigh: 0,
      summary: 'Consolidated the page to the exact 19V809 population, qualified the three-fire chronology and replaced secondary citations with the Part 573 filing.',
    },
    [IDS.waterFirst]: {
      confidence: 'medium',
      description: "This indexed page overlaps the 3.7L-specific MKX water-pump page, but neither page is being removed or redirected in this proposal. The complete 447-document MKX manufacturer-communication inventory does not establish a universal 2007-2015 internal-water-pump defect, a 20-30 hour repair time or blanket timing-chain replacement. Ford's 2011 MKX owner guide says repeated coolant loss of more than 1 quart per month warrants a cooling-system inspection and that running with low coolant can cause overheating and engine damage. Milky oil or unexplained coolant loss can indicate contamination or a leak, but does not identify the failed component by itself.",
      solution: 'If overheating occurs, stop safely, shut the engine off and allow it to cool; never open a hot pressurized cooling system. Have a qualified technician pressure-test the cooling system and inspect the oil before deciding whether the pump, another cooling component or the engine requires repair. Do not buy a water pump, timing components or a replacement engine from this page; no universal retail part is recommended and any part choice must follow diagnosis and VIN-specific service information.',
      symptoms: ['repeated coolant loss', 'engine overheating', 'milky or contaminated-looking oil requiring diagnosis'],
      dtcCodes: [],
      estimatedCostLow: null,
      estimatedCostHigh: null,
      summary: 'Removed unsupported universal-failure, labor-time and timing-chain prescriptions while retaining the page as a bounded coolant-loss diagnosis guide.',
    },
    [IDS.sync]: {
      confidence: 'high',
      description: 'Ford TSB 13-8-2 covers some 2011-2013 MKX vehicles with MyLincoln Touch that may have navigation, voice-recognition, call-sound, phone-pairing, clock, media, Wi-Fi pass-code or general system-performance concerns. Its action is a software update after checking OASIS for open field-service actions. Customer Satisfaction Program 12M01 separately covered certain 2011-2012 MKX vehicles and authorized APIM replacement only when Workshop Manual diagnosis identified the APIM as the causal part. These sources do not establish that every freeze, black screen or capacitive-panel symptom requires APIM or panel replacement.',
      solution: 'Record the exact symptoms and check the VIN in OASIS for applicable field-service actions before updating software. Have a technician confirm the current software level and diagnose the APIM as causal before replacing it; a reset or battery disconnect is not a durable diagnosis and can erase settings. Do not buy an APIM, touchscreen or control panel from this page because configuration and programming are VIN-specific and no universal retail part is recommended.',
      symptoms: ['navigation concern', 'voice-recognition concern', 'call-sound or phone-pairing concern', 'clock, media or Wi-Fi pass-code concern', 'general MyLincoln Touch system-performance concern'],
      dtcCodes: [],
      estimatedCostLow: null,
      estimatedCostHigh: null,
      summary: 'Replaced broad crash, temporary-fix and control-panel claims with the exact TSB software scope and the 12M01 APIM diagnostic boundary.',
    },
    [IDS.roof]: {
      confidence: 'medium',
      description: "NHTSA complaint ODI 11083747 records a single 2013 MKX owner's allegation that the rear Vista-roof glass imploded while the vehicle was traveling about 35 mph; the complaint reports no crash, fire, injury or death. An owner complaint is evidence of an allegation, not proof of cause or a model-wide defect. The complete MKX recall inventory contains no panoramic-roof-shattering campaign, and the primary evidence reviewed here does not establish the former claims about glass thickness, tempering method, inside-origin breakage, Ford's warranty policy or class-action coverage across every 2007-2015 MKX.",
      solution: 'If roof glass breaks, move out of traffic safely, avoid touching loose glass, keep occupants away from the opening, photograph the condition and arrange inspection by Lincoln or a qualified automotive-glass professional. Report the event to NHTSA if there was no apparent impact. Do not buy a panoramic panel, seal or glass kit from this page; the correct glass is option- and VIN-specific, there is no MKX roof recall in the reviewed inventory, and no universal retail part is recommended.',
      symptoms: ['reported sudden breakage of Vista-roof glass', 'loose or falling roof-glass fragments'],
      dtcCodes: [],
      estimatedCostLow: null,
      estimatedCostHigh: null,
      summary: 'Converted litigation and design allegations into a single-complaint boundary, removed unsupported model-wide claims and added safe glass handling.',
    },
    [IDS.ptu]: {
      confidence: 'high',
      description: 'Ford SSM 47230 says some 2007-2016 AWD MKX vehicles built on or before June 30, 2016 may produce a propane or natural-gas odor during idle or low-speed driving because excessive heat can break down PTU fluid. If the odor is confirmed at the PTU and the unit is repairable, Ford identifies idler-bearing repair kit GB5Z-7P258-A. SSM 46522 separately says that a 2013-2017 3.5L or 3.7L AWD MKX whose PTU is repaired or replaced for an internal failure must also receive a new vent hose because the hose can be contaminated. These sources do not prescribe a universal 30,000-mile fluid interval or prove that every leak, noise or AWD concern will seize the unit or damage the transmission.',
      solution: 'For a propane or natural-gas odor at idle or low speed, have the source confirmed under the Workshop Manual before the PTU is opened. For a diagnosed internal PTU failure on an applicable 2013-2017 3.5L or 3.7L AWD vehicle, the Ford communication requires the vent hose to be replaced with the PTU repair or replacement. Do not buy a PTU, seal, vent hose or GB5Z-7P258-A kit from this page; this is a dealer/technician diagnostic procedure and fitment must be confirmed by VIN and failure mode.',
      symptoms: ['propane or natural-gas odor during idle or low-speed driving', 'diagnosed internal PTU failure'],
      dtcCodes: [],
      estimatedCostLow: null,
      estimatedCostHigh: null,
      summary: 'Replaced an unrelated seal-TSB reference and unsupported 30,000-mile, seizure and cost claims with exact PTU heat and vent-hose communications.',
    },
    [IDS.brake]: {
      confidence: 'high',
      description: "Ford safety recall 25S87/NHTSA 25V544 covers 84,412 certain 2016-2018 Lincoln MKX vehicles with rear brake jounce hoses that can rupture prematurely. A rupture causes a progressive brake-fluid leak; the driver may notice increased pedal travel or a red brake-fluid warning, and stopping distance can increase. Ford's updated Part 573 filing says it was not aware of accidents or injuries related to this concern as of the filing.",
      solution: 'Check the VIN for 25S87/25V544 now. The updated filing says the free remedy is available through the dealer: inspect both rear jounce hoses, replace any damaged or leaking hose, and readjust hoses that pass inspection to reduce strain. Do not wait for a future remedy date. If pedal travel changes, the red brake warning illuminates or fluid is leaking, stop driving and arrange service. Do not buy F2GZ-2282-G, F2GZ-2282-H or another brake hose from this page because the no-charge remedy is VIN- and inspection-specific.',
      symptoms: ['increased brake-pedal travel', 'red brake-fluid warning indicator', 'progressive brake-fluid leak', 'increased stopping distance'],
      dtcCodes: [],
      estimatedCostLow: 0,
      estimatedCostHigh: 0,
      summary: 'Updated the stale anticipated-remedy text to the filed inspect, readjust or replace remedy and exact warning signs.',
    },
    [IDS.airbag]: {
      confidence: 'high',
      description: 'NHTSA recall 21V158/Ford 21S12 covers 2007-2010 MKX driver-airbag inflators using calcium-sulfate-desiccated Takata PSDI-5 inflators that can degrade after long-term humidity and temperature cycling and rupture during deployment. Recall 21V081/Ford 21S05 is narrower: it applies to certain 2007 MKX vehicles whose passenger airbag was replaced under a prior recall and then later replaced during collision or service work with a potentially defective unit. A separate August 2024 Ford/NHTSA Do Not Drive warning covers unrepaired non-desiccated Takata campaigns including 16V384, 17V024, 18V046 and 19V001; it should not be inferred from 21V158 or 21V081 alone.',
      solution: 'Check the VIN immediately in both NHTSA and Ford recall lookup. If the VIN has an open recall in the August 2024 non-desiccated Takata Do Not Drive group, do not drive until the free repair is completed and arrange the towing, mobile repair or loaner support Ford offers. For an open 21V158 or 21V081 campaign, follow the current VIN-specific manufacturer notice promptly; dealer replacement or inspection is free. The official filings identify no advance warning. Do not buy an inflator, airbag module or steering-wheel part from this page because the remedy is VIN- and campaign-specific and must be dealer-administered.',
      symptoms: ['no advance warning identified before possible inflator rupture', 'sharp metal fragments possible during airbag deployment'],
      dtcCodes: [],
      estimatedCostLow: 0,
      estimatedCostHigh: 0,
      summary: 'Separated the driver, narrow replacement-passenger-airbag and non-desiccated Do Not Drive populations so the urgent instruction is campaign-accurate.',
    },
  };
  if (!content[id]) throw new Error(`Unexpected MKX row ${id}`);
  return content[id];
}

function commerceDecisionFor(id) {
  if ([IDS.battery, IDS.brake, IDS.airbag].includes(id)) return 'free-vin-scoped-recall-remedy-no-retail-part';
  if ([IDS.oil, IDS.sync, IDS.ptu].includes(id)) return 'dealer-technical-procedure-no-universal-retail-part';
  return 'diagnosis-first-no-universal-retail-part';
}

function proposalFor(row) {
  const proposal = clone(fullRecord(row));
  const content = contentFor(row.id);
  Object.assign(proposal, {
    description: content.description,
    solution: content.solution,
    confidence: content.confidence,
    symptoms: content.symptoms,
    affectedSystems: [],
    dtcCodes: content.dtcCodes,
    estimatedCostLow: content.estimatedCostLow,
    estimatedCostHigh: content.estimatedCostHigh,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    citations: citationsFor(row.id),
    communityRecommendations: [],
    fixParts: [],
    humanApproved: false,
    reportCount: 0,
    source: 'manual',
    lastReportedByOwners: '',
    reviewedOn: REVIEW_DATE,
    contentUpdatedOn: REVIEW_DATE,
    contentUpdateSummary: content.summary,
  });
  return proposal;
}

function evidenceFor(row) {
  const inventory = `Complete model inventory: ${BULLETIN_INVENTORY.totalRows} exact MKX communications and ${RECALL_INVENTORY.totalRows} exact recall rows across ${RECALL_INVENTORY.campaignCount} campaigns were replayed.`;
  const details = {
    [IDS.oil]: ['Visual review of TSB 19-2243 proves the exact build dates, 2.7L scope, symptom/DTC set, 1-quart threshold and cylinder-head procedure.', 'Spark-plug replacement for MKX and the former retail cost range are not established by the bulletin.'],
    [IDS.water37]: ['No exact MKX communication summary in the complete inventory establishes the universal failure, mileage or timing-set advice.', 'Visual review of 2011 and 2018 owner guides supports prompt inspection of repeated coolant loss and hot-system safety.'],
    [IDS.battery]: ['Visual review of 19V809 proves the 3.7L-only population, 54,411 count, cable-to-bracket contact, qualified three-fire chronology and free shield/sleeve remedy.'],
    [IDS.waterFirst]: ['No exact MKX communication summary establishes the universal 2007-2015 defect, 20-30 hour repair or blanket timing-chain service.', 'The 2011 owner guide supports inspection after repeated coolant loss and warns about low-coolant engine damage.'],
    [IDS.sync]: ['Visual review of TSB 13-8-2 proves the 2011-2013 software-update scope; visual review of 12M01 proves APIM replacement only after Workshop Manual diagnosis for certain 2011-2012 vehicles.'],
    [IDS.roof]: ['The exact NHTSA complaint records one 2013 owner allegation and no crash, fire, injury or death; it does not prove cause or a model-wide defect.', 'No MKX recall campaign in the complete inventory addresses panoramic-roof shattering.'],
    [IDS.ptu]: ['Visual review of SSM 47230 proves PTU-fluid heat breakdown and repair-kit boundaries; SSM 46522 proves the narrower vent-hose rule after diagnosed internal failure.', 'Neither source prescribes a universal 30,000-mile fluid interval or the former seizure/transmission-damage prediction.'],
    [IDS.brake]: ['Visual review of the updated 25V544 filing proves the 84,412-MKX population, warning signs and available inspect, readjust or replace remedy.', 'The former once-available language is stale after the filed April 2026 remedy-notification schedule.'],
    [IDS.airbag]: ['Visual review of 21V158 proves the 2007-2010 driver-inflator scope and free replacement; the 21V081 Lincoln notice proves its narrow 2007 replacement-passenger-airbag scope.', 'The 2024 NHTSA alert ties Do Not Drive to open non-desiccated campaigns, not automatically to 21V158 or 21V081.'],
  };
  return [inventory, ...details[row.id], 'No search-style commerce, unverified fitment or universal retail part is introduced.'];
}

function publicPdfSources() {
  return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => [key, Object.fromEntries(Object.entries(source).filter(([field]) => field !== 'localPath'))]));
}
function publicOtherSources() {
  return Object.fromEntries(Object.entries(OTHER_SOURCES).map(([key, source]) => [key, Object.fromEntries(Object.entries(source).filter(([field]) => field !== 'localPath'))]));
}

function buildPacket(snapshot) {
  const rows = snapshot.records.filter((row) => row.make === 'Lincoln' && row.model === 'MKX').sort((a, b) => a.id.localeCompare(b.id));
  if (rows.length !== 9 || !BLOCKER_IDS.every((id) => rows.some((row) => row.id === id))) throw new Error('Lincoln MKX frozen coverage drifted');
  const decisions = rows.map((row) => {
    const before = fullRecord(row);
    const proposal = proposalFor(row);
    return {
      id: row.id,
      action: 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source',
      commerceDecision: commerceDecisionFor(row.id),
      evidence: evidenceFor(row),
      before,
      beforeSha256: hashValue(before),
      proposal,
      proposalSha256: hashValue(proposal),
      changedFields: diffFields(before, proposal),
    };
  });
  return {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-technical-adjudication',
    requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE,
    make: 'Lincoln',
    model: 'MKX',
    completionStatement: 'All nine frozen Lincoln MKX pages are accounted for with indexed identities and vehicle scopes preserved.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'All nine rows contain material source, safety or remedy corrections and require independent review before any catalog write.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, related-link change or new issue is authorized.',
      'All nine pages remain published with their exact frozen identity, vehicle metadata and canonical severity.',
      'The two overlapping water-pump pages remain separate and indexed pending an independently reviewed identity decision.',
      'Recall remedies and Do Not Drive instructions are campaign- and VIN-scoped.',
      'Every named replaceable part is covered by an explicit dealer-only or no-universal-retail-part boundary.',
      'Unknown owner totals remain zero and are never rendered as social proof.',
    ],
    source: { snapshotFile: 'data/_lincoln-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: rows.length },
    observations: [
      { code: 'mkx-water-pump-pages-overlap', severity: 'identity-hold', recordIds: [IDS.water37, IDS.waterFirst], detail: 'The pages overlap for 2011-2015 3.7L vehicles; both stay published and unredirected pending independent identity review.' },
      { code: 'mkx-water-pump-prescriptions-unsupported', severity: 'critical-correction', recordIds: [IDS.water37, IDS.waterFirst], detail: 'The complete communication inventory does not support the former universal failure, mileage, labor-time or blanket timing-set claims.' },
      { code: 'mkx-roof-claims-overstated', severity: 'critical-correction', recordIds: [IDS.roof], detail: 'One NHTSA owner allegation does not establish glass construction, cause, warranty policy or a model-wide 2007-2015 defect.' },
      { code: 'mkx-brake-remedy-stale', severity: 'safety-correction', recordIds: [IDS.brake], detail: 'The updated filing now describes the free inspect, readjust or replace remedy; the page still said to wait.' },
      { code: 'mkx-airbag-campaigns-conflated', severity: 'safety-correction', recordIds: [IDS.airbag], detail: 'The driver recall, narrow replacement-passenger-airbag recall and non-desiccated Do Not Drive campaigns require distinct instructions.' },
      { code: 'all-mkx-pages-preserved', severity: 'seo-safety', recordIds: rows.map((row) => row.id), detail: 'No MKX page is removed, redirected or allowed to lose its indexed identity or vehicle scope.' },
    ],
    pdfSources: publicPdfSources(),
    otherSources: publicOtherSources(),
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    summary: { retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source: rows.length, total: rows.length },
    rows: decisions,
  };
}

if (require.main === module) {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const packet = buildPacket(snapshot);
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

module.exports = { BLOCKER_IDS, BULLETIN_INVENTORY, IDS, MODEL_ALIASES, OTHER_SOURCES, OUTPUT, PDF_SOURCES, RECALL_INVENTORY, REVIEW_DATE, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, contentFor, evidenceFor, proposalFor, publicOtherSources, publicPdfSources };
