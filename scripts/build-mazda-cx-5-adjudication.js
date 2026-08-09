/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  SOURCE_FILES, RECALL_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash,
} = require('./mazda-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mazda-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mazda-cx-5-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const MODEL_ALIASES = Object.freeze(['CX-5', 'CX5']);

const IDS = Object.freeze({
  turboOil: 'mazda-cx-5-2021-turbo-exhaust-valve-stem-seal-oil-consumption',
  ac: 'mazda-cx5-ac-compressor-2013',
  brakes: 'mazda-cx5-brake-calipers-2013',
  carbon: 'mazda-cx5-carbon-buildup-2013',
  cmu: 'mazda-cx5-cmu-failure-2014',
  cylinderDeactivation: 'mazda-cx-5-cylinder-deactivation-rocker-arm-dislodgement-engine-stall',
  drl: 'mazda-cx5-drl-failure-2016',
  epb: 'mazda-cx-5-electronic-parking-brake-actuator-connector-malfunction',
  exhaust: 'mazda-cx5-exhaust-manifold-2013',
  fuelPump: 'mazda-cx5-fuel-pump-2019',
  istopBattery: 'mazda-cx-5-i-stop-agm-battery-premature-failure-start-stop-system-malfu',
  maf: 'mazda-cx5-maf-sensor-2013',
  oil: 'mazda-cx5-oil-consumption-2013',
  rust: 'mazda-cx5-rust-doors-2017',
  cylinderHead: 'mazda-cx-5-skyactiv-g-2-5t-cracked-cylinder-head-coolant-leak',
  suspension: 'mazda-cx5-suspension-clunk-2013',
  coverPump: 'mazda-cx-5-timing-chain-cover-oil-weep-water-pump-coolant-seepage',
  wheelBearing: 'mazda-cx5-wheel-bearing-2013',
});
const BLOCKER_IDS = Object.freeze(Object.values(IDS).sort());
const REQUIRED_COMMUNICATION_IDS = Object.freeze([
  '10111035', '10185804', '10201772', '10206004', '10235413', '10237206',
  '11016198', '11017697', '11032106',
]);
const CAMPAIGNS = Object.freeze(['16E002000', '16V064000', '16V203000', '16V644000', '17V744000', '18V426000', '19V497000', '20V063000', '21V875000']);

const PDF_SOURCES = Object.freeze({
  epb: { title: 'Mazda TSB 04-005/17 - Rear Brake Drag / EPB Release', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2017/MC-10120377-9999.pdf', localPath: 'C:/tmp/mazda-cx5-epb.pdf', pages: 7, visualPages: [1, 2, 3, 4, 5, 6, 7], bytes: 521681, sha256: 'e5d5022b2b50b765483eb8f5cee024524f9259a999e541ded83581f4ca3eb841' },
  cmuSoftware: { title: 'Mazda TSB 09-021/21 - Mazda Connect Software Concerns', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10201772-0001.pdf', localPath: 'C:/tmp/mazda-cx5-cmu-software.pdf', pages: 8, visualPages: [1, 2, 3, 4, 5, 6, 7, 8], bytes: 377704, sha256: '13922e27e1955fcc5098f2ceadaaa088d8be6252b6346cf2091b7fa4317c65cc' },
  cmuHardware: { title: 'Mazda TSB 16-003/23 - CMU DRAM Startup Failure', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10237206-0001.pdf', localPath: 'C:/tmp/mazda-cx5-cmu-hardware.pdf', pages: 5, visualPages: [1, 2, 3, 4, 5], bytes: 1016402, sha256: '54961e64a2d5ad4ed74bc90be104143cb3a27e6c134c2877eaf5edde91aa926e' },
  suspension: { title: 'Mazda TSB 02-003/17 - Front Suspension Noise', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2017/MC-10185799-9999.pdf', localPath: 'C:/tmp/mazda-cx5-suspension.pdf', pages: 12, visualPages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], bytes: 821626, sha256: 'fcb66c8a52b7569569f752ca853dc8769e8beabfd070160db2b05a96c47b032a' },
  waterPump: { title: 'Mazda Service Alert SA-014/26 - Water Pump Coolant Leak Criteria', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2026/MC-11030636-0001.pdf', localPath: 'C:/tmp/mazda-cx5-water-pump.pdf', pages: 7, visualPages: [1, 2, 3, 4, 5, 6, 7], bytes: 2327693, sha256: '5eb3e1585f86b3d0c8f7a490e6722f21dfed33d92d8040cc621416afc232c823' },
  csp11: { title: 'Mazda CSP11 - 2.5T Cylinder-Head Coolant Leak Warranty Extension', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11011136-0001.pdf', localPath: 'C:/tmp/mazda-cx5-csp11.pdf', pages: 4, visualPages: [1, 2, 3, 4], bytes: 141659, sha256: 'a4c6a7109800e023787d332faf4d20e5bb3f4619efc4336d67afefc9f70ae08c' },
  sspd5: { title: 'Mazda SSPD5 - 2.5T Oil Consumption Warranty Extension', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2026/MC-11032106-0001.pdf', localPath: 'C:/tmp/mazda-cx30-sspd5.pdf', pages: 6, visualPages: [1, 2, 3, 4, 5, 6], bytes: 323120, sha256: '79a9732b3d0292590ab7502c8a544e214c2d2018971fa1b74dd62670fe0997af' },
  evaporator: { title: 'Mazda TSB 07-002/17 - No Cool Air / Evaporator Leak', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2017/MC-10185804-9999.pdf', localPath: 'C:/tmp/mazda-cx5-evaporator.pdf', pages: 5, visualPages: [1, 2, 3, 4, 5], bytes: 243424, sha256: 'f7c2e88b7f10bf15b6d5114ef31644cae24f983fc42dcf3707ce6b2c259db3fe' },
  carbonPcm: { title: 'Mazda Service Alert SA-060/17 - PCM Reprogramming / Throttle Carbon', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2017/MC-10111035-9999.pdf', localPath: 'C:/tmp/mazda-cx5-carbon-pcm.pdf', pages: 3, visualPages: [1, 2, 3], bytes: 211379, sha256: 'eb91ddb783f4483d5c08c2e0500c273dd6b26a1d7f1bfd59a7c55ba2fe0db1f7' },
  frontCover: { title: 'Mazda TSB 01-002/25 - Oil Seepage or Leaks at Engine Front Cover', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11016198-0001.pdf', localPath: 'C:/tmp/mazda-cx5-front-cover.pdf', pages: 15, visualPages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], bytes: 1353550, sha256: '0a881e38cd8fa9401446e92db7025494fc6061c3a9feeee060e1ef76d25385e4' },
  wheelBearing: { title: 'Mazda Service Alert SA-020/25 - Wheel Bearing Noise Diagnosis', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11017697-0001.pdf', localPath: 'C:/tmp/mazda-cx5-wheel-bearing.pdf', pages: 2, visualPages: [1, 2], bytes: 169245, sha256: '59f576d885b38da5fb90276b19bac4a23d1715a289ecf0aff4eddb6a0c4e8a05' },
  rust: { title: 'Mazda TSB 09-009/21 - Rust at Bottom Inner Side of Doors', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10206004-0001.pdf', localPath: 'C:/tmp/mazda-cx5-rust.pdf', pages: 5, visualPages: [1, 2, 3, 4, 5], bytes: 306822, sha256: 'de711eaf0d87556e3fd4ecc27ac948f81c578c824c0cf119224cb8196b66c5b1' },
});

function complaints(year) { return { title: `NHTSA ${year} Mazda CX-5 Complaints`, type: 'nhtsa', url: `https://api.nhtsa.gov/complaints/complaintsByVehicle?make=MAZDA&model=CX-5&modelYear=${year}` }; }
function recalls(year) { return { title: `NHTSA ${year} Mazda CX-5 Recalls`, type: 'nhtsa', url: `https://api.nhtsa.gov/recalls/recallsByVehicle?make=MAZDA&model=CX-5&modelYear=${year}` }; }
const OTHER_SOURCES = Object.freeze({
  datasets: { title: 'NHTSA Datasets and APIs', type: 'nhtsa', url: NHTSA_DATASET_URL },
  complaints2013: complaints(2013), complaints2014: complaints(2014), complaints2016: complaints(2016),
  complaints2017: complaints(2017), complaints2018: complaints(2018), complaints2019: complaints(2019),
  complaints2020: complaints(2020), complaints2021: complaints(2021), complaints2022: complaints(2022), complaints2023: complaints(2023),
  recalls2016: recalls(2016), recalls2018: recalls(2018), recalls2019: recalls(2019),
});

const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES,
  periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 15, '2015-2019': 903, '2020-2024': 681, '2025-2026': 168 },
  totalRows: 1767, requiredCommunicationIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES, periodCounts: { pre: 0, post: 23 }, totalRows: 23,
  campaignCount: CAMPAIGNS.length, campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

function citation(source) { return { url: source.url, type: source.type, title: source.title }; }
function citationsFor(id) {
  const map = {
    [IDS.turboOil]: [PDF_SOURCES.sspd5],
    [IDS.ac]: [PDF_SOURCES.evaporator, OTHER_SOURCES.complaints2013, OTHER_SOURCES.complaints2019],
    [IDS.brakes]: [PDF_SOURCES.epb, OTHER_SOURCES.complaints2013, OTHER_SOURCES.complaints2019],
    [IDS.carbon]: [PDF_SOURCES.carbonPcm, OTHER_SOURCES.complaints2013],
    [IDS.cmu]: [PDF_SOURCES.cmuSoftware, PDF_SOURCES.cmuHardware, OTHER_SOURCES.complaints2016, OTHER_SOURCES.complaints2021],
    [IDS.cylinderDeactivation]: [OTHER_SOURCES.recalls2018, OTHER_SOURCES.recalls2019],
    [IDS.drl]: [OTHER_SOURCES.recalls2016],
    [IDS.epb]: [PDF_SOURCES.epb, OTHER_SOURCES.complaints2016],
    [IDS.exhaust]: [OTHER_SOURCES.complaints2013, OTHER_SOURCES.complaints2016],
    [IDS.fuelPump]: [OTHER_SOURCES.recalls2018, OTHER_SOURCES.recalls2019],
    [IDS.istopBattery]: [OTHER_SOURCES.complaints2017, OTHER_SOURCES.complaints2020, OTHER_SOURCES.complaints2023],
    [IDS.maf]: [PDF_SOURCES.carbonPcm, OTHER_SOURCES.complaints2013, OTHER_SOURCES.complaints2018],
    [IDS.oil]: [PDF_SOURCES.sspd5, OTHER_SOURCES.complaints2013, OTHER_SOURCES.complaints2021, OTHER_SOURCES.complaints2022],
    [IDS.rust]: [PDF_SOURCES.rust],
    [IDS.cylinderHead]: [PDF_SOURCES.csp11],
    [IDS.suspension]: [PDF_SOURCES.suspension, OTHER_SOURCES.recalls2016],
    [IDS.coverPump]: [PDF_SOURCES.frontCover, PDF_SOURCES.waterPump],
    [IDS.wheelBearing]: [PDF_SOURCES.wheelBearing],
  };
  if (!map[id]) throw new Error(`Unexpected Mazda CX-5 row ${id}`);
  return map[id].map(citation);
}

function contentFor(id) {
  const content = {
    [IDS.turboOil]: { confidence: 'high', description: 'Mazda SSPD5 covers certain 2021 CX-5 vehicles with the SKYACTIV-G 2.5T engine inside its VIN and production range. Mazda identifies damaged exhaust-valve seals as a source of engine-oil consumption and low-oil warnings; DTC P250F may be present but is not required.', solution: 'Check oil level promptly and document mileage and oil added. Have a Mazda dealer verify VIN, build date, engine and SSPD5 eligibility before repair. The April 28, 2026 revision lists a 7-year/84,000-mile extension; the temporary 8-year/96,000-mile period expired in October 2025. Do not buy valve seals or authorize cylinder-head work from this page; confirm eligibility and the oil-loss cause first.', symptoms: ['low-engine-oil warning between services', 'oil level drops without an external leak being found', 'P250F may be stored but is not required'], summary: 'Bounded the valve-seal condition and current warranty term to exact SSPD5 eligibility.' },
    [IDS.ac]: { confidence: 'medium', description: 'Mazda TSB 07-002/17 documents a refrigerant leak at the evaporator tube-to-header joint on certain 2013-2016 CX-5 vehicles below its VIN and April 7, 2016 production cutoff. The reviewed primary inventory does not establish the frozen title\'s recurring 2013-2019 compressor defect.', solution: 'Have a qualified A/C technician verify charge and locate the leak before replacing anything. For a vehicle inside 07-002/17, Mazda directs dye-based leak testing and evaporator replacement only when that leak is confirmed. Other years or leak locations need normal diagnosis. Do not buy a compressor, evaporator, receiver-drier, expansion valve or refrigerant from this page; verify VIN, refrigerant type and exact failure first.', symptoms: ['A/C blows warm or cooling declines', 'system inspection shows low refrigerant charge', 'leak testing is required to distinguish evaporator, compressor, condenser and connection faults'], summary: 'Preserved the compressor identity while replacing universal compressor advice with the exact evaporator-leak boundary.' },
    [IDS.brakes]: { confidence: 'medium', description: 'Mazda TSB 04-005/17 documents rear-brake drag, abnormal outer-pad wear or a brief roll after releasing the electronic parking brake on certain 2016 CX-5 vehicles below its VIN and September 9, 2016 production cutoff. It attributes that bounded case to EPB-equipped rear calipers not releasing correctly; it does not prove all 2013-2019 caliper concerns share one cause.', solution: 'If a brake is hot, dragging or produces abnormal wear, stop and have the exact wheel inspected. For an in-scope 2016 vehicle, follow Mazda\'s one-side-at-a-time EPB release and temperature/wear checks and replace only the affected caliper and consequentially damaged parts. Other years and front-brake concerns require hose, slide, piston, pad, rotor and parking-brake diagnosis. Do not buy calipers or pads from this page; verify side, VIN and failure mode first.', symptoms: ['one wheel runs hotter or drags', 'uneven inner-to-outer or side-to-side pad wear', 'vehicle may roll briefly after the EPB is released in the bounded 2016 case'], summary: 'Limited the supported caliper mechanism to Mazda\'s VIN-bounded 2016 EPB procedure.' },
    [IDS.carbon]: { confidence: 'low', description: 'Mazda Service Alert SA-060/17 concerns 2013-2015 CX-5 vehicles reprogrammed with specific obsolete IDS software. In that narrow path, throttle-valve carbon can distort calculated airflow and set P0101 or P061B. It does not establish a 2013-2023 intake-valve carbon defect, a mileage threshold or a universal need for walnut blasting.', solution: 'Start with stored codes, fuel trims, ignition, compression, intake leaks, throttle condition and software history. If the exact SA-060/17 software path applies, Mazda directs removing the throttle body and wiping it with cleaner on a cloth; it expressly says not to spray cleaner directly on the valve. Do not buy additives, cleaners or a walnut-blasting service from this page; diagnose the affected component first.', symptoms: ['check-engine light or driveability concern requires code-led diagnosis', 'P0101 or P061B after the specific historical PCM reprogramming path', 'throttle deposits are not proof of intake-valve deposits'], summary: 'Separated a documented throttle/software case from the unsupported universal intake-valve story.' },
    [IDS.cmu]: { confidence: 'high', description: 'Mazda TSB 09-021/21 documents freezing, blank screens, reboots and connectivity faults corrected by software on U.S. 2016-2020 CX-5 vehicles; its 2021 scope is Canada/Mexico only. TSB 16-003/23 separately covers a VIN-, production- and CMU-serial-bounded DRAM startup failure on certain 2021-2022 CX-5 vehicles. These are distinct software and hardware paths.', solution: 'Document the exact screen symptom, connected device, current software and CMU serial number. Have Mazda identify the current VIN-specific software path; replace a CMU only when the hardware bulletin\'s vehicle and serial criteria or diagnosis support it. Do not use battery disconnects or undocumented button combinations as a repair. Do not buy a CMU, SD card or cable from this page; verify software, serial and failed component first.', symptoms: ['screen freezes, goes blank or reboots', 'slow startup or repeated boot cycling', 'phone, audio, navigation or camera behavior may depend on software and configuration'], summary: 'Separated bounded software updates from the narrow 2021-2022 DRAM hardware failure.' },
    [IDS.cylinderDeactivation]: { confidence: 'high', description: 'NHTSA recall 19V497000 covers certain 2018-2019 CX-5 vehicles. A powertrain-control-module software error can cause an engine stall. The recall record does not establish a dislodged rocker arm, cylinder-number pattern or automatic hydraulic-lash-adjuster, camshaft or cylinder-head damage.', solution: 'Check the VIN for open Mazda campaign 3719F. An authorized Mazda dealer will reprogram the PCM at no charge under the recall. If the engine stalls, stop safely and arrange service. Persistent noise, misfire or mechanical damage after recall completion requires separate diagnosis. Do not buy rocker arms, lash adjusters, a camshaft or cylinder head from this page; recall status and the actual fault must be verified first.', symptoms: ['unexpected engine stall', 'loss of motive power while driving', 'mechanical noise or misfire is not established by the recall and needs separate diagnosis'], summary: 'Corrected the page to the exact PCM-software recall without repeating unsupported rocker-arm damage claims.' },
    [IDS.drl]: { confidence: 'high', description: 'NHTSA recall 20V063000 covers certain 2016 Mazda CX-5 vehicles whose LED daytime running lights may fail while driving, reducing visibility to other road users.', solution: 'Check the VIN for open Mazda campaign 4320A. An authorized Mazda dealer will inspect the headlights and replace the sealing gasket or headlamp assemblies as necessary at no charge under the recall. Do not buy LED modules, wiring or headlamp assemblies from this page; recall eligibility and the required remedy must be verified by VIN.', symptoms: ['one or both daytime running lights do not illuminate', 'DRL operation may become intermittent before failure', 'other headlamp faults require separate circuit diagnosis'], summary: 'Replaced generic lighting advice with the exact VIN-based 2016 recall remedy.' },
    [IDS.epb]: { confidence: 'medium', description: 'Mazda TSB 04-005/17 documents EPB-equipped rear calipers that may not release correctly on certain 2016 CX-5 vehicles below its VIN and September 9, 2016 production cutoff. The reviewed source does not establish a 2016-2020-wide actuator-connector defect, corrosion pattern or universal C2005/C112A diagnosis.', solution: 'Treat a hot or dragging brake as a safety issue and have the exact wheel inspected. For an in-scope 2016 vehicle, Mazda\'s procedure checks release, noise, heat and pad wear before replacing only the affected caliper and any consequentially damaged parts. Other years or EPB warnings require scan, voltage, wiring, connector, motor and mechanical checks. Do not buy an actuator, connector or caliper from this page; verify VIN, side and failure first.', symptoms: ['rear brake drags or one disc becomes unusually hot', 'abnormal outer-pad wear on one rear brake', 'EPB warning or release concern requires scan and electrical/mechanical diagnosis'], summary: 'Bounded the EPB evidence to the exact 2016 caliper-release procedure and removed unsupported connector claims.' },
    [IDS.exhaust]: { confidence: 'low', description: 'The reviewed Mazda communication inventory and cited complaint records do not establish a recurring 2013-2016 CX-5 exhaust-manifold or gasket defect, a speed-bump mechanism or a heat-cycle crack pattern. Exhaust tick, odor and catalyst-area noise can have several causes.', solution: 'Do not assume the manifold or gasket is failed. A qualified technician should inspect the system cold, locate soot or leakage, and distinguish manifold, gasket, flex joint, catalyst, heat shield, injector and valvetrain noise before repair. Avoid driving if exhaust enters the cabin. Do not buy a manifold or gasket from this page; confirm the exact leak and VIN-specific part first.', symptoms: ['ticking or puffing that changes with engine load or temperature', 'exhaust odor requires prompt inspection', 'soot or smoke testing can help locate the actual leak'], summary: 'Demoted unsupported universal causes and replaced parts-first advice with exact exhaust-leak diagnosis.' },
    [IDS.fuelPump]: { confidence: 'high', description: 'NHTSA recall 21V875000 covers certain 2018-2019 CX-5 vehicles. The low-pressure fuel-pump impeller may crack and deform, causing pump failure and potentially an engine stall. The campaign does not cover the frozen page\'s 2020-2021 CX-5 years.', solution: 'Check the VIN for open Mazda campaign 5321K. An authorized Mazda dealer will replace the fuel pump at no charge under the recall. If the engine stalls, stop safely and arrange service. A 2020 or 2021 vehicle needs normal fuel-pressure, electrical and engine diagnosis rather than automatic recall attribution. Do not buy a pump from this page; verify VIN eligibility and the failed system first.', symptoms: ['engine may stall or fail to restart', 'loss of fuel pressure can cause hesitation or no-start', 'recall eligibility is VIN-based and limited to the official population'], summary: 'Corrected the recall to its exact 2018-2019 scope while preserving the frozen 2019-2021 identity metadata.' },
    [IDS.istopBattery]: { confidence: 'low', description: 'NHTSA complaint records contain battery and start/stop-related reports, but they do not prove one recurring 2017-2023 CX-5 AGM-battery defect, one CCA specification, a fixed parked-drain threshold or one battery type for every configuration. Battery equipment and i-stop availability vary by VIN and market.', solution: 'Identify the installed battery label and VIN specification, then perform a proper state-of-charge, conductance/load and charging-system test. If the battery repeatedly discharges, measure key-off current after modules sleep and diagnose the draw before replacement. Any i-stop initialization must follow current Mazda service information. Do not buy an AGM/EFB battery from this page; verify equipment, size, rating, charging health and failure first.', symptoms: ['slow crank or no-start after the vehicle sits', 'start/stop function unavailable with a warning', 'repeat discharge after replacement suggests charging or parasitic-draw diagnosis is needed'], summary: 'Removed invented battery ratings and universal AGM advice; retained a configuration-first diagnostic boundary.' },
    [IDS.maf]: { confidence: 'low', description: 'The reviewed primary inventory does not establish a recurring 2013-2018 CX-5 mass-airflow-sensor defect. SA-060/17 instead documents P0101/P061B after a specific historical PCM reprogramming path when throttle-valve carbon affects calculated airflow; that is not proof the MAF sensor failed.', solution: 'Use codes and live data to check intake leaks, filter installation, wiring, throttle condition, fuel trims and PCM software before condemning the MAF sensor. Follow SA-060/17 only if its exact software history applies. Do not spray the MAF or throttle blindly, and do not buy a MAF sensor or cleaner from this page; confirm the failed input or air leak first.', symptoms: ['check-engine light or driveability concern', 'airflow code may result from software, intake, throttle or wiring rather than a failed sensor', 'live-data comparison is needed before replacement'], summary: 'Removed EGR-code and cleaner recommendations and separated a historical PCM/throttle case from MAF failure.' },
    [IDS.oil]: { confidence: 'medium', description: 'Mazda SSPD5 directly supports exhaust-valve-seal oil consumption only for certain 2021 CX-5 2.5T vehicles inside its VIN and production range. It does not establish that every frozen 2013, 2014 or 2022 CX-5 has the same valve-seal cause, nor does it support a universal engine-rebuild remedy.', solution: 'Check oil level, record mileage and quantity added, inspect for leaks and follow Mazda\'s measured oil-consumption diagnosis. For an eligible 2021 2.5T, verify SSPD5 and its 7-year/84,000-mile extension; the temporary 8-year/96,000-mile period expired in October 2025. Other years and engines require separate diagnosis. Do not buy valve seals or engine parts from this page; verify VIN, engine and cause first.', symptoms: ['oil level drops between scheduled services', 'low-engine-oil warning may appear', 'P250F may occur in the bounded 2021 2.5T case but is not required'], summary: 'Separated exact 2021 2.5T SSPD5 evidence from unsupported early-year and 2022 generalization.' },
    [IDS.rust]: { confidence: 'high', description: 'Mazda TSB 09-009/21 covers 2017-2021 CX-5 vehicles with rust at the bottom inner side of the doors near the seam welt. Mazda attributes this bounded condition to mud or sand on the side sill scratching the paint as the door opens and closes; it does not identify a paint color or universally thin paint as the cause.', solution: 'Photograph the location and have a Mazda dealer or qualified body shop confirm the TSB condition and warranty eligibility. Mazda\'s procedure repairs the affected paint and installs the specified protection film on all four doors. Outer-surface corrosion or a different location needs separate body inspection. Do not buy paint, rust converter or generic film from this page; confirm the exact panel condition and Mazda procedure first.', symptoms: ['rust or blistering at the lower inner door seam', 'paint damage occurs where the door area contacts mud or sand from the sill', 'outer-panel corrosion is outside this bulletin and needs separate assessment'], summary: 'Anchored the door-rust page to exact 2017-2021 Mazda location, cause and body-shop remedy.' },
    [IDS.cylinderHead]: { confidence: 'high', description: 'Mazda CSP11 covers certain 2019-2020 CX-5 vehicles with the SKYACTIV-G 2.5T engine inside its VIN and September 18, 2018-June 9, 2020 production range. Coolant may leak at the cylinder head around the exhaust manifold. The program extends specific repair coverage to 10 years/120,000 miles from the original warranty start date.', solution: 'If coolant level falls or leakage is visible near the exhaust-manifold side of the head, stop before overheating and have Mazda verify the concern, VIN and CSP11 eligibility. Mazda directs the current service procedure to decide between a cylinder-head and partial-engine repair. Do not buy a cylinder head, gasket kit or engine from this page; VIN eligibility, leak location and the authorized repair path must be confirmed first.', symptoms: ['coolant loss or residue near the cylinder head and exhaust manifold', 'coolant odor or low-coolant indication', 'overheating requires stopping promptly to prevent further damage'], summary: 'Replaced settlement and cost claims with exact CSP11 VIN, production and warranty boundaries.' },
    [IDS.suspension]: { confidence: 'high', description: 'Mazda TSB 02-003/17 covers certain 2013-2016 CX-5 vehicles below its VIN and November 16, 2015 production cutoff. It identifies three bounded front-noise mechanisms: upper-strut-bearing damage, stick/slip between the bearing and spring, and lower-control-arm bushing stick/slip in wet conditions. It does not establish the frozen 2017-2020 years.', solution: 'Have a technician reproduce the noise and identify whether it occurs over rough roads, while steering at a stop or mainly in wet conditions. For an in-scope vehicle, follow Mazda\'s VIN- and symptom-specific bearing, protector or lower-arm procedure. Also check recall 16V203000 by VIN because loose strut-to-knuckle fasteners are a separate safety campaign. Do not buy struts, bearings, arms or sway links from this page; confirm VIN and mechanism first.', symptoms: ['knock or squeak over rough roads', 'noise while turning the steering wheel at a stop', 'wet-road lower-arm bushing stick/slip in the bounded population'], summary: 'Replaced generic sway-link and lubrication advice with Mazda\'s exact 2013-2016 mechanisms and separate recall check.' },
    [IDS.coverPump]: { confidence: 'high', description: 'Mazda TSB 01-002/25 covers engine-front-cover oil seepage or leakage on VIN-bounded 2018-2023 CX-5 2.5L engines with cylinder deactivation. Separately, Service Alert SA-014/26 covers 2018-2026 CX-5 water-pump inspection and warns that a small dry green deposit at the bleed hole can be normal steam residue rather than a failed pump. The frozen 2016-2017 years are outside both exact scopes.', solution: 'First identify whether the fluid is engine oil or coolant and locate it precisely. Front-cover oil must meet Mazda\'s repair threshold before resealing. For the water pump, Mazda says not to replace it for small dry residue; replacement is supported when crystallized coolant accumulates at the bleed hole or diagnosis finds leakage from another pump sealing area. Do not buy a water pump, cover, sealant or stop-leak from this page; verify VIN, engine and leak criterion first.', symptoms: ['oil residue on the front cover becomes visible with dust', 'dry green bleed-hole deposit may be normal and not require a pump', 'wet or accumulated crystallized coolant requires cooling-system diagnosis'], summary: 'Separated exact front-cover and water-pump criteria and removed automatic replacement and stop-leak advice.' },
    [IDS.wheelBearing]: { confidence: 'high', description: 'Mazda Service Alert SA-020/25 covers 2013-2025 CX-5 vehicles and warns that wheel-bearing growl or whine can be misdiagnosed as transmission, transfer-unit or differential noise. It provides a comparison and chassis-ear procedure; it does not prove premature failure from potholes, contamination or manufacturing on every vehicle.', solution: 'Inspect tires for size, brand and unusual wear, reproduce the noise against a like vehicle, and follow any more specific bulletin first. Mazda then compares wheel-bearing noise with a chassis ear or stethoscope and replaces only a bearing that is significantly noisier. Do not replace both sides automatically. Do not buy a hub or bearing from this page; confirm the noisy corner, drivetrain configuration and VIN-specific part first.', symptoms: ['growl or bearing whine that varies with speed or load', 'noise may be confused with tire, differential, transfer-unit or transmission noise', 'comparison testing and chassis-ear diagnosis identify the suspect corner'], summary: 'Added Mazda\'s exact diagnostic sequence and removed universal cause, bilateral replacement and cost claims.' },
  };
  if (!content[id]) throw new Error(`Unexpected Mazda CX-5 row ${id}`);
  return content[id];
}

function evidenceFor(id) {
  const text = {
    [IDS.turboOil]: 'SSPD5 directly establishes the bounded 2021 2.5T valve-seal condition and current warranty term.',
    [IDS.ac]: 'TSB 07-002/17 supports a VIN-bounded evaporator leak, not a universal compressor failure.',
    [IDS.brakes]: 'TSB 04-005/17 supports a VIN-bounded 2016 rear-caliper EPB release problem.',
    [IDS.carbon]: 'SA-060/17 supports only a historical PCM/throttle-carbon path, not general intake-valve buildup.',
    [IDS.cmu]: 'TSBs 09-021/21 and 16-003/23 separate software symptoms from a serial-bounded DRAM fault.',
    [IDS.cylinderDeactivation]: 'Recall 19V497000 directly supports PCM reprogramming for stall risk, not rocker-arm damage.',
    [IDS.drl]: 'Recall 20V063000 directly supports the 2016 LED DRL failure and free VIN-based remedy.',
    [IDS.epb]: 'TSB 04-005/17 does not establish a 2016-2020 actuator-connector pattern.',
    [IDS.exhaust]: 'The reviewed inventory and complaints do not establish the frozen universal manifold mechanism.',
    [IDS.fuelPump]: 'Recall 21V875000 supports only the official 2018-2019 CX-5 population.',
    [IDS.istopBattery]: 'Complaints are reports and do not establish one battery type, rating, drain threshold or root cause.',
    [IDS.maf]: 'SA-060/17 distinguishes a PCM/throttle path from a failed MAF sensor.',
    [IDS.oil]: 'SSPD5 supports a bounded 2021 2.5T condition but not the entire frozen year set.',
    [IDS.rust]: 'TSB 09-009/21 directly supports the frozen 2017-2021 door-seam condition.',
    [IDS.cylinderHead]: 'CSP11 directly states the VIN/build range, leak location and 10-year/120,000-mile extension.',
    [IDS.suspension]: 'TSB 02-003/17 supports exact 2013-2016 mechanisms; 16V203 is a separate safety campaign.',
    [IDS.coverPump]: 'TSB 01-002/25 and SA-014/26 provide separate oil and coolant replacement thresholds.',
    [IDS.wheelBearing]: 'SA-020/25 directly supports comparison and chassis-ear diagnosis before one-side replacement.',
  };
  return { primaryEvidence: [text[id]], limitations: 'Complaint records are reports, not proof of prevalence, a universal cause, exact retail fitment or warranty eligibility.' };
}

function commerceDecisionFor(id) {
  const subject = {
    [IDS.turboOil]: 'VIN, build date, turbo engine and diagnosed oil-loss cause', [IDS.ac]: 'VIN, refrigerant type and exact failed A/C component',
    [IDS.brakes]: 'VIN, wheel, temperature, wear pattern and failed brake component', [IDS.carbon]: 'software history, codes and actual contaminated component',
    [IDS.cmu]: 'VIN, software, CMU serial and failed component', [IDS.cylinderDeactivation]: 'recall eligibility and any separate mechanical fault',
    [IDS.drl]: 'recall eligibility and required headlamp remedy', [IDS.epb]: 'VIN, side and electrical or mechanical failure',
    [IDS.exhaust]: 'exact leak location and VIN-specific part', [IDS.fuelPump]: 'recall eligibility and failed fuel system',
    [IDS.istopBattery]: 'installed battery specification, test result, charging system and parasitic draw', [IDS.maf]: 'codes, live data, intake integrity, software and failed input',
    [IDS.oil]: 'VIN, engine, measured consumption and cause', [IDS.rust]: 'panel location, body condition and Mazda procedure',
    [IDS.cylinderHead]: 'VIN, leak location and authorized CSP11 repair', [IDS.suspension]: 'VIN, noise mechanism and open recall status',
    [IDS.coverPump]: 'fluid type, VIN, engine and exact leak criterion', [IDS.wheelBearing]: 'noisy corner, drivetrain and VIN-specific part',
  };
  return `No universal retail part; ${subject[id]} must be verified before replacement.`;
}

function proposalFor(before, id) {
  const content = contentFor(id);
  const dtcMap = { [IDS.turboOil]: ['P250F'], [IDS.carbon]: ['P0101', 'P061B'], [IDS.oil]: ['P250F'] };
  return {
    ...clone(before), description: content.description, solution: content.solution, confidence: content.confidence,
    symptoms: clone(content.symptoms), affectedSystems: [], dtcCodes: clone(dtcMap[id] || []),
    estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null,
    citations: citationsFor(id), communityRecommendations: [], fixParts: [], humanApproved: false,
    source: 'ai-researched', reviewedOn: REVIEW_DATE, contentUpdatedOn: REVIEW_DATE, contentUpdateSummary: content.summary,
  };
}

function publicPdfSources() { return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => { const value = clone(source); delete value.localPath; return [key, value]; })); }

function buildPacket(snapshot) {
  const rows = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'CX-5').sort((a, b) => a.id.localeCompare(b.id));
  if (rows.length !== 18) throw new Error(`Expected 18 Mazda CX-5 rows, found ${rows.length}`);
  const decisions = rows.map((row) => {
    const before = fullRecord(row); const proposal = proposalFor(before, row.id);
    return { id: row.id, action: 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source', reason: contentFor(row.id).summary, evidence: evidenceFor(row.id), commerceDecision: commerceDecisionFor(row.id), before, beforeSha256: hashValue(before), proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal) };
  });
  return {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-technical-adjudication', requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE, make: 'Mazda', model: 'CX-5',
    completionStatement: 'All 18 frozen Mazda CX-5 pages are accounted for with indexed identities and vehicle scopes preserved.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'All 18 rows contain material source, scope, diagnosis or remedy corrections and require independent review before any catalog write.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, related-link change or new issue is authorized.',
      'All 18 pages remain published with their exact frozen identity, vehicle metadata, report count and canonical severity.',
      'Complaint records are symptom reports, not proof of a defect rate, universal cause or exact failed component.',
      'Manufacturer bulletin and recall remedies remain VIN-, model-year-, equipment- and condition-scoped.',
      'Every named replaceable part has an explicit no-universal-retail-part boundary.',
      'Unknown owner totals remain zero and are never rendered or written as "0+ owners" social proof.',
      'Frozen nonzero report counts remain data only and are never inserted into audit prose.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: { snapshotFile: 'data/_mazda-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: rows.length },
    observations: [
      { code: 'cx5-recall-title-mechanism-corrected', severity: 'safety-correction', recordIds: [IDS.cylinderDeactivation], detail: '19V497 establishes PCM-software stall risk, not the frozen title\'s rocker-arm damage mechanism.' },
      { code: 'cx5-fuel-pump-year-mismatch-held', severity: 'identity-hold', recordIds: [IDS.fuelPump], detail: 'The frozen 2019-2021 metadata remains unchanged while 21V875 applies to 2018-2019 CX-5 vehicles.' },
      { code: 'cx5-broad-year-bulletin-mismatches-held', severity: 'identity-hold', recordIds: [IDS.ac, IDS.brakes, IDS.epb, IDS.carbon, IDS.cmu, IDS.suspension, IDS.coverPump, IDS.oil], detail: 'Frozen SEO identities and fitment remain intact while prose states each exact bulletin boundary.' },
      { code: 'cx5-unsupported-universal-causes-demoted', severity: 'accuracy-correction', recordIds: [IDS.ac, IDS.carbon, IDS.exhaust, IDS.istopBattery, IDS.maf, IDS.wheelBearing], detail: 'Unsupported universal mechanisms, costs, maintenance intervals and parts-first advice were removed or explicitly bounded.' },
      { code: 'cx5-parts-boundaries-added', severity: 'commerce-safety', recordIds: rows.map((row) => row.id), detail: 'Every row names the diagnostics and fitment that must be verified before a replacement part can be selected; no commerce was activated.' },
      { code: 'all-cx5-pages-preserved', severity: 'seo-safety', recordIds: rows.map((row) => row.id), detail: 'No Mazda CX-5 page is removed, redirected or allowed to lose its indexed identity or vehicle scope.' },
    ],
    pdfSources: publicPdfSources(), otherSources: clone(OTHER_SOURCES), manufacturerCommunications: BULLETIN_INVENTORY, recallInventory: RECALL_INVENTORY,
    summary: { retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source: rows.length, total: rows.length }, rows: decisions,
  };
}

if (require.main === module) {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const packet = buildPacket(snapshot);
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

module.exports = { BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, IDS, MODEL_ALIASES, OTHER_SOURCES, OUTPUT, PDF_SOURCES, RECALL_INVENTORY, REQUIRED_COMMUNICATION_IDS, REVIEW_DATE, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, contentFor, evidenceFor, proposalFor };
