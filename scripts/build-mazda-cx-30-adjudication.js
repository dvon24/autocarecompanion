/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  SOURCE_FILES, RECALL_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash,
} = require('./mazda-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mazda-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mazda-cx-30-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const MODEL_ALIASES = Object.freeze(['CX-30', 'CX30']);

const IDS = Object.freeze({
  ac: 'mazda-cx30-ac-condenser-leak-2020',
  abs: 'mazda-cx-30-damaged-abs-hydraulic-control-unit-reduced-braking-recall-23',
  aeb: 'mazda-cx-30-i-activsense-false-emergency-braking-spurious-brake-driver-a',
  evap: 'mazda-cx-30-disconnected-fuel-evap-vent-hose-causing-fuel-leak-stalling',
  infotainment: 'mazda-cx30-infotainment-freeze-2020',
  liftgate: 'mazda-cx-30-power-liftgate-unexpectedly-lowers-recall-21v086000',
  oil: 'mazda-cx-30-excessive-oil-consumption-low-oil-warning-between-changes',
  valvetrain: 'mazda-cx-30-cylinder-deactivation-valvetrain-tapping-rattle-sa-026-23',
  windshield: 'mazda-cx30-windshield-cracking-2020',
});
const BLOCKER_IDS = Object.freeze(Object.values(IDS).sort());
const REQUIRED_COMMUNICATION_IDS = Object.freeze([
  '10179085', '10190958', '10191534', '10203760', '10210880', '10218772',
  '10225784', '10226896', '10230891', '10235702', '10246216', '10251367', '11032106',
]);
const CAMPAIGNS = Object.freeze(['20V346000', '20V347000', '21V086000', '21V101000', '23V275000', '24V649000', '25V357000']);

const PDF_SOURCES = Object.freeze({
  valvetrain: {
    title: 'Mazda Service Alert SA-026/23 - Valvetrain Tapping/Rattling', type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10235702-0001.pdf', localPath: 'C:/tmp/mazda-cx30-valvetrain.pdf',
    pages: 2, visualPages: [1, 2], bytes: 140687, sha256: '53b9713e00e5ed4ec4c6804ae3298ff9a8a3fa96a1e769999aab31b533f66a90',
  },
  ac: {
    title: 'Mazda Service Alert SA-053/21 - Poor A/C Due to Evaporator Leak', type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10203760-0001.pdf', localPath: 'C:/tmp/mazda-cx30-ac.pdf',
    pages: 2, visualPages: [1, 2], bytes: 152942, sha256: 'a9556befabd866f8d764bd4ceb479de74fed25160c6c83f993301327961c78a0',
  },
  infotainment: {
    title: 'Mazda TSB 09-037/22 - Mazda Connect Software Concerns', type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10226896-0001.pdf', localPath: 'C:/tmp/mazda-cx30-infotainment.pdf',
    pages: 7, visualPages: [1, 2, 3, 4, 5, 6, 7], bytes: 310719, sha256: 'e0a9104b3e972ecf304182d72553d57d1e674b0458c07369b1e1e38c815462d2',
  },
  windshield: {
    title: 'Mazda TSB 09-042/22 - Windshield Distortion or Double Image', type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10225784-0001.pdf', localPath: 'C:/tmp/mazda-cx30-windshield.pdf',
    pages: 3, visualPages: [1, 2, 3], bytes: 218592, sha256: 'f3109d45294310323621580dcfbba5d0832161726155dcf729a3fae248694b7e',
  },
  oil: {
    title: 'Mazda SSPD5 - 2.5T Oil Consumption Warranty Extension', type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2026/MC-11032106-0001.pdf', localPath: 'C:/tmp/mazda-cx30-sspd5.pdf',
    pages: 6, visualPages: [1, 2, 3, 4, 5, 6], bytes: 323120, sha256: '79a9732b3d0292590ab7502c8a544e214c2d2018971fa1b74dd62670fe0997af',
  },
  sbs: {
    title: 'Mazda Service Alert SA-007/24 - Unintended Smart Brake Support Operation', type: 'manufacturer',
    url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-10251367-0001.pdf', localPath: 'C:/tmp/mazda-cx30-sbs.pdf',
    pages: 11, visualPages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], bytes: 577786, sha256: '5085b174ea83ef338f47c92ee19fbcbdbc715dcf07fd7ee286338140b3b5358f',
  },
});

function complaints(year) { return { title: `NHTSA ${year} Mazda CX-30 Complaints`, type: 'nhtsa', url: `https://api.nhtsa.gov/complaints/complaintsByVehicle?make=MAZDA&model=CX-30&modelYear=${year}` }; }
function recalls(year) { return { title: `NHTSA ${year} Mazda CX-30 Recalls`, type: 'nhtsa', url: `https://api.nhtsa.gov/recalls/recallsByVehicle?make=MAZDA&model=CX-30&modelYear=${year}` }; }
const OTHER_SOURCES = Object.freeze({
  datasets: { title: 'NHTSA Datasets and APIs', type: 'nhtsa', url: NHTSA_DATASET_URL },
  complaints2020: complaints(2020), complaints2021: complaints(2021), complaints2022: complaints(2022),
  complaints2023: complaints(2023), complaints2024: complaints(2024), complaints2025: complaints(2025),
  recalls2020: recalls(2020), recalls2021: recalls(2021), recalls2022: recalls(2022),
  recalls2023: recalls(2023), recalls2024: recalls(2024), recalls2025: recalls(2025),
});

const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES,
  periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 20, '2020-2024': 655, '2025-2026': 155 },
  totalRows: 830, requiredCommunicationIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL, aliases: MODEL_ALIASES, periodCounts: { pre: 0, post: 12 }, totalRows: 12,
  campaignCount: CAMPAIGNS.length, campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

function citation(source) { return { url: source.url, type: source.type, title: source.title }; }
function citationsFor(id) {
  const map = {
    [IDS.valvetrain]: [PDF_SOURCES.valvetrain],
    [IDS.abs]: [OTHER_SOURCES.recalls2022, OTHER_SOURCES.recalls2023],
    [IDS.evap]: [OTHER_SOURCES.recalls2020],
    [IDS.oil]: [PDF_SOURCES.oil, OTHER_SOURCES.complaints2021, OTHER_SOURCES.complaints2022],
    [IDS.aeb]: [PDF_SOURCES.sbs, OTHER_SOURCES.complaints2020, OTHER_SOURCES.complaints2023, OTHER_SOURCES.complaints2024, OTHER_SOURCES.recalls2024],
    [IDS.liftgate]: [OTHER_SOURCES.recalls2020, OTHER_SOURCES.recalls2021],
    [IDS.ac]: [PDF_SOURCES.ac, OTHER_SOURCES.complaints2021],
    [IDS.infotainment]: [PDF_SOURCES.infotainment, OTHER_SOURCES.complaints2022, OTHER_SOURCES.complaints2024],
    [IDS.windshield]: [PDF_SOURCES.windshield, OTHER_SOURCES.complaints2020, OTHER_SOURCES.complaints2021, OTHER_SOURCES.complaints2022, OTHER_SOURCES.complaints2023],
  };
  if (!map[id]) throw new Error(`Unexpected Mazda CX-30 row ${id}`);
  return map[id].map(citation);
}

function contentFor(id) {
  const content = {
    [IDS.valvetrain]: {
      confidence: 'medium',
      description: 'Mazda Service Alert SA-026/23 covers 2021-2023 CX-30 vehicles with cylinder deactivation when tapping or rattling is heard from the valvetrain after new-vehicle storage or repeated short cold starts. Mazda says air may enter the switchable hydraulic lash adjusters. That source does not cover the frozen page\'s 2020, 2024 or 2025 years and does not establish a general cylinder-head defect.',
      solution: 'For a vehicle inside SA-026/23, first check engine-oil level, warm the engine and follow Mazda\'s purge and road-test sequence. If the noise remains, Mazda directs the technician to contact its hotline; this alert does not prescribe automatic HLA or cylinder-head replacement. Other model years or persistent noise require oil-pressure and valvetrain diagnosis. Do not buy HLAs or a cylinder head from this page; verify VIN, engine equipment, oil condition and the applicable service document first.',
      symptoms: ['tapping or rattling from the upper engine after storage or repeated short cold starts', 'noise may change after the engine is warmed and held near 2,500-3,000 rpm', 'persistent noise requires separate oil-pressure and valvetrain diagnosis'],
      summary: 'Preserved the frozen identity while correcting SA-026/23 year scope and removing unsupported automatic HLA and cylinder-head replacement advice.',
    },
    [IDS.abs]: {
      confidence: 'high',
      description: 'NHTSA recall 23V275000 covers certain 2022-2023 Mazda CX-30 vehicles whose ABS hydraulic control unit may have internal damage. Reduced braking assistance can increase stopping distance and crash risk.',
      solution: 'Check the VIN for open Mazda campaign 5823D. An authorized Mazda dealer will inspect the ABS hydraulic control unit and replace it if necessary at no charge under the recall. If braking feels reduced or a brake warning appears, stop driving when safe and arrange service. Do not buy an ABS hydraulic unit from this page; recall eligibility and the exact installed unit must be verified by VIN.',
      symptoms: ['reduced braking effectiveness', 'longer stopping distance or unusual pedal response', 'ABS or brake warning indicators may appear'],
      summary: 'Replaced secondary recall summaries with exact NHTSA campaign records and retained the VIN-based free remedy.',
    },
    [IDS.evap]: {
      confidence: 'high',
      description: 'NHTSA recall 20V347000 covers certain 2020 all-wheel-drive Mazda CX-30 vehicles. The evaporative-emissions vent hose may be disconnected from the fuel tank, allowing fuel to leak from the charcoal canister and increasing the risk of fire or an engine stall.',
      solution: 'Check the VIN for open Mazda campaign 4520F. An authorized Mazda dealer will inspect the vent-hose connection and reconnect it or replace the charcoal canister as needed at no charge. If fuel odor, visible leakage or stalling occurs, stop in a safe place, switch the engine off and arrange service. Do not buy a hose or charcoal canister from this page; recall eligibility and the failed connection must be verified by VIN.',
      symptoms: ['fuel odor or visible fuel leakage', 'engine may stall', 'check-engine or evaporative-emissions warning may appear'],
      summary: 'Bounded the fuel-leak and stall risk to the official 2020 AWD recall population and VIN-based remedy.',
    },
    [IDS.oil]: {
      confidence: 'high',
      description: 'Mazda SSPD5 covers certain Mexico-built 2021-2022 CX-30 vehicles with the SKYACTIV-G 2.5T engine, within the bulletin\'s VIN and December 7, 2020-June 30, 2022 build range. Mazda identifies damaged exhaust-valve seals as a source of engine-oil consumption and low-oil warnings. DTC P250F may be present but is not required.',
      solution: 'Check oil level promptly and document the mileage and quantity added. Have a Mazda dealer confirm VIN eligibility, build date, turbo engine and the applicable diagnostic procedure. The April 28, 2026 SSPD5 revision lists a 7-year/84,000-mile warranty extension; the temporary 8-year/96,000-mile period expired in October 2025. Eligible repairs use the Mazda valve-seal procedure. Do not buy valve seals or authorize cylinder-head work from this page; VIN eligibility and the cause of consumption must be confirmed first.',
      symptoms: ['low-engine-oil warning between scheduled services', 'oil level drops on the dipstick and requires documented additions', 'P250F may be stored but is not required for SSPD5 eligibility'],
      summary: 'Updated the exact SSPD5 VIN/build scope, valve-seal cause and current warranty term while removing broad settlement and eligibility claims.',
    },
    [IDS.aeb]: {
      confidence: 'medium',
      description: 'Mazda Service Alert SA-007/24 documents situations in which Smart Brake Support can activate because the forward camera or radar interprets curves, overhead structures, roadside objects, grade changes, trees, bicycles or turning vehicles as a collision risk. NHTSA complaints also describe unexpected braking. Separately, recall 24V649000 concerns a 2024 forward-sensing-camera fault that can prevent several driver-assistance functions; it is not proof of unintended braking on every 2020-2025 vehicle.',
      solution: 'Record the road, weather, speed, warning message and whether video is available. Inspect the windshield and sensor areas for contamination or damage, scan all modules, check software and open recalls by VIN, and have a Mazda technician reproduce or diagnose the event. Maintain a safe following distance and do not disable safety systems as a substitute for diagnosis. Do not buy a camera, radar sensor or brake component from this page; identify the trigger or fault and verify calibration and VIN applicability first.',
      symptoms: ['unexpected Smart Brake Support warning or braking', 'event may occur near curves, signs, roadside objects, grade changes, trees, bicycles or turning vehicles', 'driver-assistance warnings or unavailable functions require separate fault diagnosis'],
      summary: 'Separated documented SBS perception scenarios, owner complaints and the distinct 2024 camera recall without recommending blanket system disablement.',
    },
    [IDS.liftgate]: {
      confidence: 'high',
      description: 'NHTSA recall 21V086000 covers certain 2020-2021 Mazda CX-30 vehicles whose fully opened power liftgate can partially lower when the vehicle is facing uphill, especially at high ambient temperature, creating an injury risk.',
      solution: 'Check the VIN for open Mazda campaign 4621B. An authorized Mazda dealer will update the power-liftgate control software, inspect the drive-unit serial number and replace the drive unit if required at no charge. Until completed, keep people clear of an unsupported liftgate. Do not buy a liftgate drive unit from this page; recall eligibility and the installed unit must be verified by VIN.',
      symptoms: ['fully opened power liftgate slowly lowers', 'condition is more likely while parked facing uphill', 'high ambient temperature may worsen the condition'],
      summary: 'Replaced secondary summaries with exact NHTSA recall records and retained the software plus serial-number inspection remedy.',
    },
    [IDS.ac]: {
      confidence: 'medium',
      description: 'Mazda Service Alert SA-053/21 covers certain 2020-2021 CX-30 vehicles below its VIN and October 22, 2020 production cutoffs when the A/C blows warm because refrigerant charge is low. It directs leak diagnosis and specifically identifies an evaporator leak as a possible cause. The reviewed primary inventory does not establish the frozen title\'s recurring condenser defect, road-debris mechanism, corrosion mechanism or a 2020-2025-wide pattern.',
      solution: 'Have a qualified A/C technician verify refrigerant charge and locate the leak before replacing anything. For a vehicle within SA-053/21, Mazda directs inspection of the evaporator if charge is low and no other leak is found; the expansion valve is replaced only if it leaks. Verify the under-hood refrigerant label because the bulletin covers both HFC-134a and HFO-1234yf vehicles. Do not buy a condenser, evaporator, expansion valve, refrigerant or stone guard from this page; confirm VIN, refrigerant type and exact leak location first.',
      symptoms: ['A/C blows warm or cooling performance declines', 'system inspection shows low refrigerant charge', 'leak testing is required to distinguish evaporator, condenser, valve or connection faults'],
      summary: 'Preserved the condenser title for SEO while replacing unsupported debris, corrosion and R-134a-only claims with the bounded Mazda evaporator-leak procedure.',
    },
    [IDS.infotainment]: {
      confidence: 'high',
      description: 'Mazda TSB 09-037/22 documents multiple Mazda Connect symptoms on certain non-turbo 2020-2022 CX-30 vehicles below its VIN and December 22, 2021 production cutoffs, including freezing, blank or white screens, reboots and Apple CarPlay or Android Auto faults. Vehicles with the 2.5T engine use different software and are excluded from that bulletin.',
      solution: 'Document the exact symptom, connected device and current CMU software version, then have Mazda identify the correct update path for the VIN and engine. Inspect the cable and phone only when the symptom involves a wired connection; do not assume every freeze is a phone or cable fault. Do not buy a CMU, USB cable or wireless adapter from this page; verify vehicle scope, current software and the failed component first.',
      symptoms: ['Mazda Connect screen freezes, turns blank or white, or reboots', 'Apple CarPlay or Android Auto disconnects or fails to operate', 'symptom and repair path depend on VIN, engine and installed software version'],
      summary: 'Added the exact non-turbo 2020-2022 Mazda software scope and removed universal cable, wireless CarPlay and CMU-replacement advice.',
    },
    [IDS.windshield]: {
      confidence: 'medium',
      description: 'Mazda TSB 09-042/22 covers certain 2020-2022 CX-30 vehicles with Active Driving Display below its VIN and August 13, 2022 production cutoffs when the windshield produces distortion or a double image. NHTSA complaints describe this optical problem. The reviewed evidence does not establish the frozen title\'s broad spontaneous stress-cracking mechanism, acoustic glass as the cause, thermal shock, frame flex or a 2020-2025-wide cracking defect.',
      solution: 'For distortion or a double image, verify Active Driving Display equipment, VIN and the exact glass specification before following Mazda\'s replacement procedure. For a crack, photograph its origin and have a glass professional distinguish an impact point from a non-impact failure before making a warranty claim. After replacement, follow Mazda procedures for any forward camera, display, sensor or aiming work required by the exact configuration. Do not buy a windshield from this page; verify the failure mode, glass options, VIN and calibration requirements first.',
      symptoms: ['wavy or distorted view through the windshield', 'double image from the Active Driving Display', 'a crack requires inspection for an impact point and origin before cause is assigned'],
      summary: 'Preserved the frozen cracking identity but limited supported evidence to Mazda-documented distortion and complaint reports, removing unsupported cause and cost claims.',
    },
  };
  if (!content[id]) throw new Error(`Unexpected Mazda CX-30 row ${id}`);
  return content[id];
}

function evidenceFor(id) {
  const map = {
    [IDS.valvetrain]: ['SA-026/23 directly covers 2021-2023 cylinder-deactivation vehicles and a purge/road-test sequence.', 'The alert does not prescribe automatic HLA or cylinder-head replacement and conflicts with the frozen year list.'],
    [IDS.abs]: ['NHTSA campaign 23V275000 directly establishes the HCU damage, braking risk and no-charge remedy.'],
    [IDS.evap]: ['NHTSA campaign 20V347000 directly establishes the 2020 AWD hose-disconnection, fuel-leak, stall and fire risk.'],
    [IDS.oil]: ['The April 28, 2026 SSPD5 bulletin directly states VIN/build eligibility, exhaust-valve-seal cause and the current warranty term.'],
    [IDS.aeb]: ['SA-007/24 directly describes expected or misidentified SBS activation scenarios.', 'Complaint records document reported events but do not prove one cause; recall 24V649000 is a distinct loss-of-function defect.'],
    [IDS.liftgate]: ['NHTSA campaign 21V086000 directly establishes the uphill/high-temperature lowering condition and no-charge remedy.'],
    [IDS.ac]: ['SA-053/21 directly supports a bounded evaporator-leak procedure, not a universal condenser defect.'],
    [IDS.infotainment]: ['TSB 09-037/22 directly supports bounded non-turbo software symptoms and an update path.'],
    [IDS.windshield]: ['TSB 09-042/22 directly supports distortion/double image in a bounded population.', 'The cited complaint set does not establish the frozen page\'s universal stress-cracking causes.'],
  };
  return { primaryEvidence: map[id], limitations: 'Complaint records are reports, not proof of prevalence, a universal root cause, exact retail fitment or warranty eligibility.' };
}

function commerceDecisionFor(id) {
  const subjects = {
    [IDS.valvetrain]: 'VIN, cylinder-deactivation equipment, oil condition and service-alert scope',
    [IDS.abs]: 'recall eligibility and the installed HCU',
    [IDS.evap]: 'recall eligibility and the failed vent-hose connection or canister',
    [IDS.oil]: 'VIN, build date, engine and diagnosed oil-loss cause',
    [IDS.aeb]: 'the trigger, stored faults, software, calibration and VIN scope',
    [IDS.liftgate]: 'recall eligibility and drive-unit serial number',
    [IDS.ac]: 'VIN, refrigerant type and exact leak location',
    [IDS.infotainment]: 'VIN, engine, CMU version and failed component',
    [IDS.windshield]: 'failure mode, glass options, VIN and calibration needs',
  };
  return `No universal retail part; ${subjects[id]} must be verified before replacement.`;
}

function proposalFor(before, id) {
  const content = contentFor(id);
  return {
    ...clone(before), description: content.description, solution: content.solution, confidence: content.confidence,
    symptoms: clone(content.symptoms), affectedSystems: [], dtcCodes: id === IDS.oil ? ['P250F'] : [],
    estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null,
    citations: citationsFor(id), communityRecommendations: [], fixParts: [], humanApproved: false,
    source: 'ai-researched', reviewedOn: REVIEW_DATE, contentUpdatedOn: REVIEW_DATE, contentUpdateSummary: content.summary,
  };
}

function publicPdfSources() {
  return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => { const rest = clone(source); delete rest.localPath; return [key, rest]; }));
}

function buildPacket(snapshot) {
  const rows = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'CX-30').sort((a, b) => a.id.localeCompare(b.id));
  if (rows.length !== 9) throw new Error(`Expected 9 Mazda CX-30 rows, found ${rows.length}`);
  const decisions = rows.map((row) => {
    const before = fullRecord(row); const proposal = proposalFor(before, row.id);
    return { id: row.id, action: 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source', reason: contentFor(row.id).summary, evidence: evidenceFor(row.id), commerceDecision: commerceDecisionFor(row.id), before, beforeSha256: hashValue(before), proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal) };
  });
  return {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-technical-adjudication', requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE, make: 'Mazda', model: 'CX-30',
    completionStatement: 'All 9 frozen Mazda CX-30 pages are accounted for with indexed identities and vehicle scopes preserved.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'All 9 rows contain material source, scope, diagnosis or remedy corrections and require independent review before any catalog write.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, related-link change or new issue is authorized.',
      'All 9 pages remain published with their exact frozen identity, vehicle metadata, report count and canonical severity.',
      'Complaint records are symptom reports, not proof of a defect rate, universal cause or exact failed component.',
      'Manufacturer bulletin and recall remedies remain VIN-, model-year-, equipment- and condition-scoped.',
      'Every named replaceable part has an explicit no-universal-retail-part boundary.',
      'Unknown owner totals remain zero and are never rendered or written as "0+ owners" social proof.',
      'Frozen nonzero report counts remain data only and are never inserted into audit prose.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: { snapshotFile: 'data/_mazda-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: rows.length },
    observations: [
      { code: 'cx30-valvetrain-year-source-mismatch-held', severity: 'identity-hold', recordIds: [IDS.valvetrain], detail: 'The frozen years remain unchanged for SEO, while SA-026/23 itself covers 2021-2023 and does not prescribe automatic HLA or head replacement.' },
      { code: 'cx30-ac-title-evidence-mismatch-held', severity: 'identity-hold', recordIds: [IDS.ac], detail: 'The condenser title remains frozen, while exact Mazda evidence supports a bounded evaporator leak rather than a universal condenser defect.' },
      { code: 'cx30-windshield-title-evidence-mismatch-held', severity: 'identity-hold', recordIds: [IDS.windshield], detail: 'The cracking title remains frozen, while exact Mazda evidence supports distortion/double image and does not prove the former stress-cracking mechanisms.' },
      { code: 'cx30-aeb-mechanisms-separated', severity: 'safety-correction', recordIds: [IDS.aeb], detail: 'Documented SBS perception scenarios, complaints and the distinct 2024 loss-of-function recall are kept separate.' },
      { code: 'cx30-recall-identities-verified', severity: 'primary-source-correction', recordIds: [IDS.abs, IDS.evap, IDS.liftgate], detail: 'All three recall pages retain their identities and cite exact NHTSA campaign APIs.' },
      { code: 'all-cx30-pages-preserved', severity: 'seo-safety', recordIds: rows.map((row) => row.id), detail: 'No Mazda CX-30 page is removed, redirected or allowed to lose its indexed identity or vehicle scope.' },
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
