/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { RECALL_FILES, SOURCE_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./lincoln-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_lincoln-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-lincoln-mkz-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const MODEL_ALIASES = Object.freeze(['MKZ']);
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const IDS = Object.freeze({
  coolant: 'lincoln-mkz-2-0l-ecoboost-internal-coolant-leak-coolant-intrusion-into-c',
  waterPump: 'lincoln-mkz-3.5l-water-pump-internal-leak',
  doorLatch: 'lincoln-mkz-door-latch-failure-doors-can-open-while-driving',
  steering: 'lincoln-mkz-electric-power-steering-loss-assist',
  transmission: 'lincoln-mkz-harsh-delayed-automatic-transmission-shifting',
  hybridSteering: 'lincoln-mkz-hybrid-electric-power-steering',
  apim: 'lincoln-mkz-mylincoln-touch-sync-infotainment-failures',
  roof: 'lincoln-mkz-panoramic-retractable-glass-roof-leaks-stuck-sunshade-shatte',
  brakes: 'lincoln-mkz-premature-brake-wear-abs-brake-fade',
  airbag: 'lincoln-mkz-takata-airbag-inflator-rupture',
});
const BLOCKER_IDS = Object.freeze(Object.values(IDS).sort());

const PDF_SOURCES = Object.freeze({
  coolant: { title: 'Ford TSB 22-2229: 2.0L EcoBoost Coolant in Cylinders', type: 'tsb', url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10214126-0001.pdf', localPath: 'C:/tmp/lincoln-mkz-coolant-22-2229.pdf', pages: 13, visualPages: [1,2,3,4,5,6,7,8,9,10,11,12,13], bytes: 208197, sha256: '1dd609942d0ad02298a056f5fd341aa0f626fac8874ba1b693d90aec0b96f1bb' },
  owner2012: { title: '2012 Lincoln MKZ Owner Guide: Engine Coolant Checks and Fail-Safe Cooling', type: 'owner-manual', url: 'https://www.fordservicecontent.com/Ford_Content/catalog/owner_guides/12378og1e.pdf', localPath: 'C:/tmp/lincoln-mkz-owner-2012.pdf', pages: 347, visualPages: [285,286,287,288,289,290], bytes: 2433373, sha256: '04565b32820853b5a6de01f9b68fde1638c95d241500600edfedf0e072a5b92a' },
  door2023: { title: 'NHTSA Part 573 Report 23V775 / Ford 23S64: MKZ Door Latches', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V775-2631.PDF', localPath: 'C:/tmp/lincoln-mkz-door-23V775.pdf', pages: 6, visualPages: [1,2,3,4,5,6], bytes: 219026, sha256: '310391120d8cd51f60a8441f3c94a4d356decfc2851bddc7e71a4888e8c4fb44' },
  door2020: { title: 'NHTSA Part 573 Report 20V331 / Ford 20S30: Previously Repaired MKZ Door Latches', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2020/RCLRPT-20V331-9851.PDF', localPath: 'C:/tmp/lincoln-mkz-door-20V331.pdf', pages: 8, visualPages: [1,2,3,4,5,6,7,8], bytes: 222982, sha256: 'd8845a7a4a4d8922ecb409c8687f6dbc9d85965d82fb277c746bb9f406964947' },
  steering: { title: 'NHTSA Part 573 Report 19V632 / Ford 19S26: MKZ Steering-Gear Motor Bolts', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2019/RCLRPT-19V632-4464.PDF', localPath: 'C:/tmp/lincoln-mkz-steering-19V632.pdf', pages: 5, visualPages: [1,2,3,4,5], bytes: 218541, sha256: '14ce73514f3fa49e808787d9145320ad8baf50ac71feb4558e9e1d7966ebe293' },
  transmission: { title: 'Ford SSM 46355: 6F35 Harsh Reverse and Delayed Third/Fifth Gear', type: 'tsb', url: 'https://static.nhtsa.gov/odi/tsbs/2017/SB-10095624-2532.pdf', localPath: 'C:/tmp/lincoln-mkz-6f35-ssm46355.pdf', pages: 1, visualPages: [1], bytes: 6449, sha256: 'fce87cecbf5cf1d170697e54c3513ea5e5304584fc0b78a39abb6937a7307ef3' },
  hybridSteering: { title: 'NHTSA Part 573 Report 15V340 / Ford 15S18: MKZ Hybrid Steering Assist', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2015/RCLRPT-15V340-7526.PDF', localPath: 'C:/tmp/lincoln-mkz-steering-15V340.pdf', pages: 6, visualPages: [1,2,3,4,5,6], bytes: 34421, sha256: '01d1cadbe1b587a2d8773f01cfd663fcd57d6f38315f166e2a4bb53aeb845ce8' },
  apim: { title: 'Ford Customer Satisfaction Program 12M02: MKZ APIM Coverage', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2013/SB-10052069-8195.pdf', localPath: 'C:/tmp/lincoln-mkz-apim-12M02.pdf', pages: 10, visualPages: [1,2,3,4,5,6,7,8,9,10], bytes: 1560385, sha256: 'c5d4278123692a0583d39232214d35376cb1ab1668dc051a73c9ecb4b78051d9' },
  brakes: { title: 'NHTSA Part 573 Report 19V904 / Ford 19S54: MKZ Hydraulic Control Unit', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2019/RCLRPT-19V904-2085.PDF', localPath: 'C:/tmp/lincoln-mkz-brake-19V904.pdf', pages: 4, visualPages: [1,2,3,4], bytes: 216003, sha256: 'a0c44963d3f431931d67ff9d1dfcdcfa517c3a115e3bcfb62877d3e62a3eb3f5' },
  airbag: { title: 'NHTSA Part 573 Report 21V158 / Ford 21S12: MKZ Driver Airbag Inflator', type: 'recall', url: 'https://static.nhtsa.gov/odi/rcl/2021/RCLRPT-21V158-8333.PDF', localPath: 'C:/tmp/lincoln-mkx-airbag-21v158.pdf', pages: 6, visualPages: [1,2,3,4,5,6], bytes: 218090, sha256: 'a2acad790ddb2f9a40216f6bb15887b1635f5bfd18ade63057e34aae0801e9a8' },
});
const OTHER_SOURCES = Object.freeze({
  roof2014: { title: 'NHTSA 2014 Lincoln MKZ Complaints (ODI 11592151)', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=LINCOLN&model=MKZ&modelYear=2014', odiNumber: '11592151' },
  roof2015: { title: 'NHTSA 2015 Lincoln MKZ Complaints (ODI 11055208)', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=LINCOLN&model=MKZ&modelYear=2015', odiNumber: '11055208' },
  takataDnd: { title: 'NHTSA 2024 Ford and Mazda Takata Do Not Drive Consumer Alert', type: 'nhtsa', url: 'https://www.nhtsa.gov/press-releases/consumer-alert-ford-mazda-issue-do-not-drive-warnings-more-457000-vehicles-recalled' },
});
const CAMPAIGNS = Object.freeze(['13V227000','13V230000','13V594000','14E028000','14V164000','14V597000','15V246000','15V248000','15V250000','15V340000','15V618000','16V384000','16V875000','17V024000','17V210000','17V427000','18V046000','18V167000','18V390000','18V775000','19V001000','19V590000','19V632000','19V904000','20E025000','20V177000','20V331000','21E013000','21V081000','21V158000','22V011000','23V162000','23V775000','25V442000','25V695000']);
const BULLETIN_INVENTORY = Object.freeze({ source: NHTSA_DATASET_URL, modelAliases: MODEL_ALIASES, periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 2, '2010-2014': 74, '2015-2019': 245, '2020-2024': 135, '2025-2026': 10 }, totalRows: 466, sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })) });
const RECALL_INVENTORY = Object.freeze({ source: NHTSA_DATASET_URL, modelAliases: MODEL_ALIASES, periodCounts: { pre: 0, post: 351 }, totalRows: 351, campaignCount: CAMPAIGNS.length, campaigns: CAMPAIGNS, sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })) });

function citation(source) { return { url: source.url, type: source.type, title: source.title }; }
function citationsFor(id) {
  const sources = {
    [IDS.coolant]: [PDF_SOURCES.coolant],
    [IDS.waterPump]: [PDF_SOURCES.owner2012],
    [IDS.doorLatch]: [PDF_SOURCES.door2023, PDF_SOURCES.door2020],
    [IDS.steering]: [PDF_SOURCES.steering],
    [IDS.transmission]: [PDF_SOURCES.transmission],
    [IDS.hybridSteering]: [PDF_SOURCES.hybridSteering],
    [IDS.apim]: [PDF_SOURCES.apim],
    [IDS.roof]: [OTHER_SOURCES.roof2014, OTHER_SOURCES.roof2015],
    [IDS.brakes]: [PDF_SOURCES.brakes],
    [IDS.airbag]: [PDF_SOURCES.airbag, OTHER_SOURCES.takataDnd],
  };
  if (!sources[id]) throw new Error(`Unexpected MKZ row ${id}`);
  return sources[id].map(citation);
}

function contentFor(id) {
  const content = {
    [IDS.coolant]: {
      confidence: 'high',
      description: 'Ford TSB 22-2229 applies to certain 2017-2019 Lincoln MKZ vehicles with the 2.0L EcoBoost engine built on or before April 8, 2019. It documents low coolant, white exhaust smoke, rough running with or without an illuminated malfunction indicator, and possible DTCs P0300, P0301-P0304, P0316, P0217, P1285 or P1299. Ford attributes the bulletin condition to coolant intrusion into a cylinder, but the bulletin does not cover every 2013-2020 vehicle represented by this indexed page.',
      solution: 'Have a Ford or Lincoln technician first confirm the VIN, engine, build date and symptoms. TSB 22-2229 directs a 20 psi cooling-system pressure test held for five hours, followed by borescope inspection if pressure drops more than 4 psi. It directs long-block replacement only when coolant is then confirmed in a cylinder; it does not prescribe a head-gasket-only repair or promise class-action or warranty reimbursement. Do not buy a long block, cylinder head, gasket or coolant-intrusion kit from this page; this is a VIN- and diagnosis-specific technician procedure with no universal retail part.',
      symptoms: ['low coolant level', 'white exhaust smoke', 'rough running or misfire', 'illuminated malfunction indicator'],
      dtcCodes: ['P0300','P0301','P0302','P0303','P0304','P0316','P0217','P1285','P1299'],
      summary: 'Narrowed coolant intrusion to TSB 22-2229 model/build/engine and diagnostic criteria; removed unsupported repair-cost, class-action and warranty claims.',
    },
    [IDS.waterPump]: {
      confidence: 'medium',
      description: 'The complete 466-document MKZ manufacturer-communication inventory reviewed for this audit does not establish a model-wide 2007-2012 3.5L internal-water-pump failure rate, a universal failure mileage or a preventive-replacement interval. The 2012 MKZ owner guide says to inspect the cooling system when more than 1 quart or 1 liter of coolant is added per month and warns that low coolant can cause overheating and engine damage. Coolant loss, white exhaust or unusual-looking oil requires diagnosis and does not by itself prove that the internal water pump failed.',
      solution: 'Check coolant only when the engine is cool. If the engine overheats, stop safely, switch it off and have the vehicle inspected; never remove the coolant cap while the engine is running or hot. Have a qualified technician pressure-test the cooling system and inspect the oil before identifying the failed component. Do not buy a water pump, timing-chain kit or engine from this page; there is no universal retail part or proactive mileage-based replacement supported by the reviewed primary evidence.',
      symptoms: ['repeated coolant loss requiring inspection', 'engine overheating', 'possible oil contamination requiring diagnosis'],
      dtcCodes: [],
      summary: 'Replaced unsupported catastrophic-failure, cost and 100,000-mile advice with owner-guide coolant safety and diagnosis boundaries.',
    },
    [IDS.doorLatch]: {
      confidence: 'high',
      description: 'Door-latch recall coverage is VIN-, year-, location- and repair-history-specific rather than universal across this page\'s indexed 2013-2018 range. NHTSA 23V775/Ford 23S64 covers certain 2016 MKZ vehicles in specified warm-weather states and territories because a latch pawl-spring tab can crack after high ambient-temperature exposure; a door may rebound while closing or fail to latch and can open while driving. NHTSA 20V331/Ford 20S30 separately covers certain 2013-2014 MKZ vehicles previously repaired under 15S16 or 16S30 because some latches may not have been replaced or may have been replaced incorrectly.',
      solution: 'Check the VIN for every open door-latch campaign. For 23V775, dealers inspect latch date codes and replace all four side-door latches when a suspect code is found. For 20V331, dealers inspect the prior-repair latch date codes and replace affected latches. Recall inspection and repair are free. If a door rebounds or will not latch, do not drive with it unsecured. Do not buy a latch from this page; these are VIN-scoped dealer recall remedies with no universal retail part.',
      symptoms: ['door rebounds or will not latch while closing', 'door may open while driving', 'difficulty securing a side door'],
      dtcCodes: [],
      summary: 'Separated the 2016 warm-weather latch recall from the 2013-2014 prior-repair recall and removed blanket 2013-2018 recall coverage.',
    },
    [IDS.steering]: {
      confidence: 'high',
      description: 'NHTSA 19V632/Ford 19S26 covers certain 2013-2016 MKZ vehicles registered or sold in specified high-corrosion jurisdictions. Road salt can corrode steering-gear motor attachment bolts; broken bolts can let the motor separate and cause loss of power assist. Manual steering remains, but steering effort increases, especially at low speed. The filing reported no accidents or injuries for this condition when submitted.',
      solution: 'Check the VIN for 19S26/19V632, because model year alone does not establish recall coverage. The free dealer remedy replaces the motor bolts and applies wax sealer; if bolts are already broken or missing, the steering gear is replaced. If assist is lost, slow down, allow extra steering effort and stop safely. Do not buy bolts, sealer or a steering gear from this page; this is a VIN- and inspection-specific dealer recall remedy.',
      symptoms: ['power-steering assist loss', 'substantially increased steering effort, especially at low speed', 'steering warning message'],
      dtcCodes: [],
      summary: 'Bound the steering page to the exact salt-jurisdiction recall, retained manual-steering context and removed unverified extra symptoms.',
    },
    [IDS.transmission]: {
      confidence: 'high',
      description: 'Ford SSM 46355 covers some 2014-2016 MKZ vehicles built from January 1, 2014 through December 31, 2015 with a 6F35 transmission. It describes harsh reverse engagement plus harsh or delayed engagement into third and fifth gears, with no diagnostic trouble codes, caused by a mechanically binding Shift Solenoid B. That evidence does not cover every 2010-2016 MKZ or support the former separator-plate, check-ball, cold-start, overdrive-shudder or universal rebuild claims.',
      solution: 'Have a technician confirm the 6F35 transmission, build date, exact reverse/third/fifth-gear symptom pattern and absence of DTCs. SSM 46355 directs cleaning the valve-body and solenoid-body areas, replacing Shift Solenoid B, clearing adaptive tables and performing an adaptive drive cycle. Do not buy a valve body, separator plate, check ball, fluid service or generic solenoid from this page; this is a VIN- and diagnosis-specific technician procedure with no universal retail part.',
      symptoms: ['harsh reverse engagement', 'harsh or delayed engagement into third gear', 'harsh or delayed engagement into fifth gear', 'no diagnostic trouble codes for the documented SSM condition'],
      dtcCodes: [],
      summary: 'Replaced an unrelated separator-plate/check-ball theory with exact SSM 46355 build dates, gear pattern and Shift Solenoid B remedy.',
    },
    [IDS.hybridSteering]: {
      confidence: 'high',
      description: 'NHTSA 15V340/Ford 15S18 covers certain 2011-2012 MKZ Hybrid vehicles. Intermittent motor-position signals can result from conformal-coat contamination or ribbon-cable pin misalignment in the steering gear, causing loss of electric power-steering assist and increased effort, especially at low speed. Ford reported 16 accident allegations and three minor-injury allegations across the broader field-action population when the filing was submitted.',
      solution: 'Check the VIN for an open 15S18/15V340 recall. Dealers inspect the Power Steering Control Module for applicable loss-of-assist DTCs: the filing calls for a software update when none are present and steering-gear replacement when they are present. Historical extended-coverage terms should not be treated as a current promise; an open safety recall remains free. Do not buy a steering gear or control module from this page; this is a VIN- and DTC-specific dealer recall remedy.',
      symptoms: ['electric power-steering assist loss', 'increased steering effort, especially at low speed', 'power-steering warning message'],
      dtcCodes: [],
      summary: 'Kept the hybrid steering identity but replaced unverified DTCs and coverage promises with the exact recall diagnosis and remedy.',
    },
    [IDS.apim]: {
      confidence: 'high',
      description: 'Ford Customer Satisfaction Program 12M02 initially covered certain 2013 MKZ vehicles and extended APIM coverage to six years from the warranty start date regardless of mileage. The program required Workshop Manual diagnosis before APIM replacement and did not establish that every 2013-2016 black screen, camera, climate-control or defroster concern was caused by the APIM. The six-year program period is historical for these vehicles, and the reviewed primary document does not support the former class-action assertion.',
      solution: 'Record the exact symptoms, check for current software or field actions and have the system diagnosed before replacing hardware. An APIM replacement is appropriate only when diagnosis identifies the APIM as the causal part, and a reset is not proof of the failed component. Do not buy a used APIM, touchscreen or generic module from this page; programming and configuration are VIN-specific and there is no universal retail part.',
      symptoms: ['black or frozen MyLincoln Touch display', 'intermittent restart or unresponsive controls', 'camera or connected-feature concern requiring diagnosis'],
      dtcCodes: [],
      summary: 'Corrected 12M02 to certain 2013 MKZ vehicles, six historical years and diagnosis-before-replacement; removed the unsupported class-action claim.',
    },
    [IDS.roof]: {
      confidence: 'low',
      description: 'The complete 466-document MKZ manufacturer-communication inventory reviewed here does not establish a universal 2013-2016 panoramic-roof leak, sunshade mechanism defect, glass-design defect, lawsuit remedy or warranty policy. NHTSA complaint ODI 11592151 records one 2014 MKZ roof-glass breakage allegation in 2024, and ODI 11055208 records one 2015 MKZ allegation in 2017; neither complaint reports an injury, and the 2015 complaint says the dealer could not determine a cause and suggested impact. Individual complaints document allegations, not causation or a model-wide defect.',
      solution: 'For a leak or stuck roof, have a qualified technician identify whether the drain, seal, track, motor, shade or glass is actually at fault before ordering anything. If glass breaks, stop safely, keep occupants away from loose fragments, photograph the condition and arrange inspection by Lincoln or a qualified automotive-glass professional; an unexplained event can also be reported to NHTSA. Do not buy seals, motors, tracks, a shade assembly or roof glass from this page; options and parts are VIN-specific and there is no universal retail part.',
      symptoms: ['water intrusion requiring source diagnosis', 'sunshade or roof movement concern requiring diagnosis', 'reported roof-glass breakage allegation'],
      dtcCodes: [],
      summary: 'Removed unsupported leak, mechanism, glass-design, lawsuit and warranty assertions; retained two NHTSA complaints only as explicitly bounded allegations.',
    },
    [IDS.brakes]: {
      confidence: 'high',
      description: 'NHTSA 19V904/Ford 19S54 covers certain 2006-2010 Zephyr and MKZ vehicles built through July 15, 2009. After an ABS activation, a normally closed valve in the hydraulic control unit can remain stuck open because of a reaction between zinc-plated valve armatures and aged DOT 3 brake fluid. Brake pedal travel can increase before the brakes apply, increasing crash risk, although braking capability remains. The filing does not establish the former model-wide premature pad-and-rotor-wear claim.',
      solution: 'Check the VIN for 19S54/19V904. The dealer remedy uses an IDS functional test: vehicles that pass receive a DOT 4 brake-fluid flush, while vehicles that fail receive HCU replacement followed by a DOT 4 flush and updated reservoir cap. If the pedal becomes abnormally long or soft, stop driving and have the braking system inspected. Do not buy pads, rotors, an HCU or brake fluid from this page; this is a VIN- and test-specific dealer recall remedy with no universal retail part.',
      symptoms: ['increased brake-pedal travel after an ABS activation', 'delayed brake application', 'soft or abnormally long brake pedal'],
      dtcCodes: [],
      summary: 'Separated the recalled HCU valve condition from unsupported routine brake-wear claims and restored the exact test/flush/replacement remedy.',
    },
    [IDS.airbag]: {
      confidence: 'high',
      description: 'NHTSA 21V158/Ford 21S12 covers certain 2006-2012 Zephyr and MKZ vehicles with a desiccated Takata PSDI-5 driver inflator that may degrade after long-term temperature and humidity exposure and can rupture during deployment. Ford reported no related accident or injury allegations when that filing was submitted. NHTSA\'s August 2024 Do Not Drive alert separately identifies vehicles with open, unrepaired non-desiccated campaigns 16V384, 17V024, 18V046 or 19V001; Do Not Drive status must not be inferred from 21V158 alone.',
      solution: 'Check the VIN at NHTSA and Ford for every open airbag campaign. If it is in one of the open non-desiccated Do Not Drive campaigns named in the 2024 alert, do not drive it until the free repair is completed. For an open 21V158/21S12 campaign, arrange the free driver-inflator or module replacement according to the recall instructions. Do not buy an inflator or airbag module from this page; recall status and remedy are VIN-specific dealer work with no universal retail part.',
      symptoms: ['open Takata airbag recall shown by VIN lookup', 'no advance warning for the documented inflator degradation'],
      dtcCodes: [],
      summary: 'Separated 21V158 from the non-desiccated Do Not Drive campaigns and removed unverified complaint-ranking and blanket passenger-side claims.',
    },
  };
  if (!content[id]) throw new Error(`Unexpected MKZ row ${id}`);
  return content[id];
}

function commerceDecisionFor(id) {
  const labels = {
    [IDS.coolant]: 'dealer-only diagnostic and long-block procedure; no universal retail part',
    [IDS.waterPump]: 'diagnosis required; no universal water-pump or timing-kit fitment',
    [IDS.doorLatch]: 'free VIN-scoped dealer recall remedy',
    [IDS.steering]: 'free VIN-scoped dealer recall remedy',
    [IDS.transmission]: 'technician-only 6F35 diagnosis and solenoid procedure; no universal retail part',
    [IDS.hybridSteering]: 'free VIN- and DTC-scoped dealer recall remedy',
    [IDS.apim]: 'programming and configuration are VIN-specific; no universal retail part',
    [IDS.roof]: 'failure mode and roof option require diagnosis; no universal retail part',
    [IDS.brakes]: 'free VIN- and test-scoped dealer recall remedy',
    [IDS.airbag]: 'free VIN-scoped dealer recall remedy',
  };
  return labels[id];
}

function proposalFor(row) {
  const content = contentFor(row.id);
  return {
    ...clone(fullRecord(row)),
    description: content.description,
    solution: content.solution,
    confidence: content.confidence,
    symptoms: content.symptoms,
    dtcCodes: content.dtcCodes,
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    citations: citationsFor(row.id),
    communityRecommendations: [],
    fixParts: [],
    humanApproved: false,
    source: 'primary-source-audit',
    reviewedOn: REVIEW_DATE,
    contentUpdatedOn: REVIEW_DATE,
    contentUpdateSummary: content.summary,
  };
}

function evidenceFor(row) {
  const common = `The frozen snapshot keeps ${row.id} published with its exact title, URL identity, indexed years, trims, engines, category, severity and related links.`;
  const notes = {
    [IDS.coolant]: ['TSB 22-2229 limits MKZ coverage to 2017-2019 2.0L vehicles built on or before April 8, 2019.', 'The bulletin requires a five-hour 20 psi pressure test and borescope confirmation before long-block replacement.'],
    [IDS.waterPump]: ['The complete 466-document MKZ communication inventory contains no exact water-pump bulletin establishing the former universal claims.', 'The 2012 owner guide supports coolant-level, overheating and hot-cap safety language only.'],
    [IDS.doorLatch]: ['23V775 is a warm-jurisdiction recall for certain 2016 MKZ vehicles.', '20V331 is a separate prior-repair recall for certain 2013-2014 MKZ vehicles.'],
    [IDS.steering]: ['19V632 is limited by VIN and specified high-corrosion jurisdictions.', 'The filing says manual steering remains but effort increases.'],
    [IDS.transmission]: ['SSM 46355 describes a narrow 2014-2016 build window and Shift Solenoid B, not a separator plate or check ball.', 'The documented symptom pattern includes harsh reverse and harsh/delayed third and fifth with no DTCs.'],
    [IDS.hybridSteering]: ['15V340 covers certain 2011-2012 MKZ Hybrid vehicles and uses a DTC-dependent remedy.', 'Historical extended coverage is not represented as current coverage.'],
    [IDS.apim]: ['12M02 initially identifies certain 2013 MKZ vehicles and six-year Lincoln coverage.', 'The document requires Workshop Manual diagnosis before APIM replacement.'],
    [IDS.roof]: ['No exact roof-defect communication was found in the complete 466-document inventory.', 'The two cited NHTSA records are individual allegations and do not establish cause.'],
    [IDS.brakes]: ['19V904 documents an HCU valve condition after ABS activation, not universal premature friction wear.', 'The exact remedy is IDS test plus DOT 4 flush, with HCU replacement only after a failed test.'],
    [IDS.airbag]: ['21V158 documents the desiccated driver-inflator population.', 'The 2024 Do Not Drive alert applies to open non-desiccated campaigns named by NHTSA, not every 21V158 vehicle.'],
  };
  return [common, ...notes[row.id], `Commerce boundary: ${commerceDecisionFor(row.id)}.`];
}

function publicPdfSources() { return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => [key, Object.fromEntries(Object.entries(source).filter(([field]) => field !== 'localPath'))])); }

function buildPacket(snapshot) {
  const rows = snapshot.records.filter((row) => row.make === 'Lincoln' && row.model === 'MKZ').sort((a, b) => a.id.localeCompare(b.id));
  if (rows.length !== 10 || !BLOCKER_IDS.every((id) => rows.some((row) => row.id === id))) throw new Error('Lincoln MKZ frozen coverage drifted');
  const decisions = rows.map((row) => {
    const before = fullRecord(row);
    const proposal = proposalFor(row);
    return { id: row.id, action: 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source', commerceDecision: commerceDecisionFor(row.id), evidence: evidenceFor(row), before, beforeSha256: hashValue(before), proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal) };
  });
  return {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-technical-adjudication',
    requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE,
    make: 'Lincoln',
    model: 'MKZ',
    completionStatement: 'All ten frozen Lincoln MKZ pages are accounted for with indexed identities and vehicle scopes preserved.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'All ten rows contain material source, safety or remedy corrections and require independent review before any catalog write.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, related-link change or new issue is authorized.',
      'All ten pages remain published with their exact frozen identity, vehicle metadata and canonical severity.',
      'Broader indexed year ranges are retained for SEO continuity while the copy explicitly limits each primary source to its supported population.',
      'Recall remedies and Do Not Drive instructions are campaign- and VIN-scoped.',
      'Every named replaceable part is covered by an explicit dealer-only or no-universal-retail-part boundary.',
      'Unknown owner totals remain zero and are never rendered as social proof.',
    ],
    source: { snapshotFile: 'data/_lincoln-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: rows.length },
    observations: [
      { code: 'mkz-coolant-scope-overstated', severity: 'critical-correction', recordIds: [IDS.coolant], detail: 'The current bulletin supports only certain 2017-2019 2.0L vehicles built by April 8, 2019, not every indexed year.' },
      { code: 'mkz-transmission-remedy-wrong', severity: 'critical-correction', recordIds: [IDS.transmission], detail: 'The exact SSM calls for Shift Solenoid B after a narrow symptom/build check, not separator-plate or check-ball modification.' },
      { code: 'mkz-roof-claims-unproven', severity: 'critical-correction', recordIds: [IDS.roof], detail: 'Two owner allegations do not establish the former universal leak, mechanism, design, lawsuit or warranty claims.' },
      { code: 'mkz-brake-identities-conflated', severity: 'safety-correction', recordIds: [IDS.brakes], detail: 'The HCU recall does not substantiate a model-wide premature pad/rotor-wear issue.' },
      { code: 'mkz-airbag-campaigns-conflated', severity: 'safety-correction', recordIds: [IDS.airbag], detail: '21V158 and the non-desiccated Do Not Drive campaigns require distinct instructions.' },
      { code: 'all-mkz-pages-preserved', severity: 'seo-safety', recordIds: rows.map((row) => row.id), detail: 'No MKZ page is removed, redirected or allowed to lose its indexed identity or vehicle scope.' },
    ],
    pdfSources: publicPdfSources(),
    otherSources: clone(OTHER_SOURCES),
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

module.exports = { BLOCKER_IDS, BULLETIN_INVENTORY, IDS, MODEL_ALIASES, OTHER_SOURCES, OUTPUT, PDF_SOURCES, RECALL_INVENTORY, REVIEW_DATE, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, contentFor, evidenceFor, proposalFor };
