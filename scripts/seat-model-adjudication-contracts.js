const SNAPSHOT_FILE = 'data/_seat-deeplink-snapshot-2026-08-11.json';
const REVIEW_DATE = '2026-08-11';

const ARONA_RECALL_2017 = 'https://www.check-vehicle-recalls.service.gov.uk/recall-type/vehicle/make/SEAT/model/ARONA/year/2017/recalls';
const ARONA_RECALL_2018 = 'https://www.check-vehicle-recalls.service.gov.uk/recall-type/vehicle/make/SEAT/model/ARONA/year/2018/recalls';
const ARONA_MANUAL = 'https://www.seat.com/datamanual-manual/arona/my21_w48/en-uk/ARONA_11_20_EN.pdf';
const IBIZA_MANUAL = 'https://www.seat.com/datamanual-manual/ibiza/my15_w45/en-uk/Gama%20Ibiza_EN.pdf';
const SEAT_TAKATA = 'https://www.seat.com/owners/aftersales/takata-airbag-recall-campaign';

const contracts = {
  Alhambra: {
    make: 'SEAT', model: 'Alhambra', reviewDate: REVIEW_DATE, snapshotFile: SNAPSHOT_FILE,
    outputFile: 'data/known-issue-seat-alhambra-adjudication-2026-08-11.json',
    allIds: ['seat-alhambra-tailgate-struts'], retainedIds: [], reportCountCleanupIds: [],
    observations: [
      'The frozen page turns age-related tailgate support wear into a model-wide failure pattern without an exact SEAT communication, campaign or bounded population.',
      'The captured evidence does not validate the frozen mileage, price, body-control-module interaction or universal replacement specification.',
    ],
    holdReasons: {
      'seat-alhambra-tailgate-struts': 'No exact SEAT primary source establishes the frozen recurring-failure identity, population, mechanism, mileage or repair scope.',
    },
    pdfSources: {}, otherSources: {},
    evidenceInventory: { method: 'Exact SEAT Alhambra tailgate-support, service-campaign and recall searches; no identity-grade primary document was captured.', exactDocuments: 0 },
    modelAliases: ['Alhambra'], searchTerms: ['tailgate strut failure', 'tailgate support gas spring', 'tailgate will not stay open'],
    requiredProse: [], content: {},
  },
  Arona: {
    make: 'SEAT', model: 'Arona', reviewDate: REVIEW_DATE, snapshotFile: SNAPSHOT_FILE,
    outputFile: 'data/known-issue-seat-arona-adjudication-2026-08-11.json',
    allIds: [
      'seat-arona-1-5-tsi-evo-kangarooing-cold-start-hesitation-low-speed-jerk',
      'seat-arona-7-speed-dry-clutch-dsg-jerky-shifts-mechatronic-failure',
      'seat-arona-early-1-0-tsi-clutch-injector-failures',
      'seat-arona-handbrake-lever-travel-increases',
      'seat-arona-infotainment-system-goes-black-continuously-reboots',
      'seat-arona-petrol-particulate-filter-blocks-short-journey-city-driving',
      'seat-arona-rear-brake-discs-corrode-seize-very-low-mileage',
      'seat-arona-rear-left-seatbelt-buckle-can-release-involuntarily',
    ],
    retainedIds: [
      'seat-arona-handbrake-lever-travel-increases',
    ],
    reportCountCleanupIds: [],
    observations: [
      'DVSA lists campaign R/2019/039 for 2017 and 2018 Arona vehicles: adjuster-nut movement can increase handbrake lever travel, and the remedy is readjustment plus a locking device.',
      'The official model-year-2021 manual treats petrol and diesel particulate-filter soot loading after continuous short journeys as an operating condition and gives a 50-120 km/h regeneration journey.',
      'The 15-minute, 60 km/h, fourth/fifth-gear instruction on the older manual is explicitly diesel-only and must not be copied onto the petrol-filter page.',
      'The exact DVSA rear-buckle campaign does not identify Takata as the supplier; the frozen title does, so that row cannot be rewritten without changing an indexed identity claim.',
      'The remaining frozen pages extrapolate forum reports or VW-platform conditions into Arona-wide recurring defects without exact primary evidence and remain unchanged.',
    ],
    holdReasons: {
      'seat-arona-1-5-tsi-evo-kangarooing-cold-start-hesitation-low-speed-jerk': 'No exact Arona primary record supports the frozen all-year/all-trim recurrence, mechanism, software history or repair sequence.',
      'seat-arona-7-speed-dry-clutch-dsg-jerky-shifts-mechatronic-failure': 'The frozen page bundles drivability, clutch and mechatronic identities and applies platform-level evidence without an exact Arona population.',
      'seat-arona-early-1-0-tsi-clutch-injector-failures': 'The frozen composite joins unrelated clutch and injector claims without an exact primary SEAT population or common remedy.',
      'seat-arona-infotainment-system-goes-black-continuously-reboots': 'No exact Arona communication captured supports the frozen continuous-failure prevalence, model-year scope or component-level remedy.',
      'seat-arona-petrol-particulate-filter-blocks-short-journey-city-driving': 'The official model-year-2021 manual supports the operating condition but does not establish the frozen 2018-2022 applicability across both named engines and trims.',
      'seat-arona-rear-brake-discs-corrode-seize-very-low-mileage': 'The frozen low-mileage recurring-defect identity is not established by an exact SEAT campaign or service communication.',
      'seat-arona-rear-left-seatbelt-buckle-can-release-involuntarily': 'DVSA supports the buckle-release recall, but the frozen title attributes the buckle to Takata and the primary record does not identify that supplier.',
    },
    pdfSources: {
      aronaManual2021: {
        url: ARONA_MANUAL, type: 'manufacturer', title: 'SEAT Arona model-year-2021 owner manual',
        contains: ['Regeneration of the petrol and diesel particulate filter', 'Drive at a speed of between 50-120 km/h', 'warning lamp stays on after 30 minutes'],
        localVerification: { bytes: 6058372, sha256: 'c704116e21bb265b367b80bcd2d100bb6e89a318a28833812d851ada271909e2', pdfPage: 278, printedPage: 276, renderedAndInspected: true },
      },
    },
    otherSources: {
      aronaRecall2017: { url: ARONA_RECALL_2017, type: 'recall', title: 'DVSA SEAT Arona 2017 recall results', contains: ['R/2019/039', 'hand brake lever travel increase', 'locking device'] },
      aronaRecall2018: { url: ARONA_RECALL_2018, type: 'recall', title: 'DVSA SEAT Arona 2018 recall results', contains: ['R/2019/039', 'hand brake lever travel increase', 'locking device'] },
    },
    evidenceInventory: { method: 'Exact DVSA model-year recall pages plus official SEAT owner-manual text and rendered-page inspection; no platform inference was accepted.', exactDocuments: 3 },
    modelAliases: ['Arona'], searchTerms: ['R/2019/039', 'handbrake adjuster locking device', 'petrol particulate filter regeneration'],
    requiredProse: [
      { id: 'seat-arona-handbrake-lever-travel-increases', field: 'description', patterns: ['R/2019/039', 'does not substantiate the frozen "early build" trim label', 'VIN or recall check'] },
    ],
    content: {
      'seat-arona-handbrake-lever-travel-increases': {
        confidence: 'high',
        description: 'The UK DVSA recall results for 2017 and 2018 SEAT Arona vehicles list campaign R/2019/039. The record says handbrake lever travel can increase because the adjuster nut moves. The public recall page does not publish build dates and does not substantiate the frozen "early build" trim label; model year alone does not prove inclusion, so a VIN or recall check is required for a particular Arona.',
        solution: 'Check the VIN with SEAT or the applicable national recall service. For a vehicle included in R/2019/039, the official remedy is to readjust the handbrake assembly and fit a locking device to the nut; the DVSA page says recall work is provided without charge. Do not buy a handbrake cable, caliper or adjuster from this page; recall inclusion and the required repair must be confirmed from the VIN.',
        symptoms: ['Handbrake lever travel increases from its previous position'],
        affectedSystems: ['Handbrake lever adjuster nut and locking device'], citations: ['aronaRecall2017', 'aronaRecall2018'],
        evidence: ['DVSA campaign R/2019/039 states the defect mechanism and remedy on both the 2017 and 2018 Arona recall pages.'],
        summary: 'Replaced secondary recall copy with exact DVSA campaign language; removed inferred loss-of-hold symptoms and exposed the unverified early-build label.',
        commerceDecision: 'recall inclusion and repair scope require VIN confirmation; no universal retail part',
      },
      'seat-arona-petrol-particulate-filter-blocks-short-journey-city-driving': {
        confidence: 'medium',
        description: 'The official model-year-2021 Arona manual says vehicles equipped with a petrol or diesel particulate filter can accumulate soot when the filter cannot clean itself, for example when short journeys are made continuously. That supports the operating condition described by this page, not a failure rate or a claim that every listed engine and model year has the same filter. Equipment and applicable instructions must be confirmed from the vehicle manual or VIN.',
        solution: 'For an equipped Arona displaying the particulate-filter message, follow the applicable vehicle manual. The model-year-2021 manual says the engine must be at operating temperature, then to drive between 50-120 km/h while observing speed limits and recommended gears, ending the journey when the lamp goes out. If the warning stays on after 30 minutes of regeneration-mode driving, use a specialised workshop. The older 15-minute/60 km/h/fourth-or-fifth-gear procedure is diesel-specific and is not the instruction for this petrol-filter page. Do not buy a filter, pressure sensor or exhaust component from this page; confirm the warning, equipment and cause first.',
        symptoms: ['Particulate-filter warning or cleaning message after repeated short journeys', 'Warning lamp remains on after the applicable regeneration journey'],
        affectedSystems: ['Petrol particulate filter on equipped vehicles', 'Engine and emissions-control monitoring'], citations: ['aronaManual2021'],
        evidence: ['Rendered page 278 of the official model-year-2021 manual shows the short-journey condition, 50-120 km/h journey and 30-minute workshop escalation.'],
        summary: 'Corrected diesel-only regeneration advice, removed unsupported price/replacement/forced-regeneration claims and bounded the page to equipped vehicles and the applicable manual.',
        commerceDecision: 'filter equipment, warning cause and VIN-specific procedure require diagnosis; no universal retail part',
      },
    },
  },
  Ateca: {
    make: 'SEAT', model: 'Ateca', reviewDate: REVIEW_DATE, snapshotFile: SNAPSHOT_FILE,
    outputFile: 'data/known-issue-seat-ateca-adjudication-2026-08-11.json',
    allIds: ['seat-ateca-tarraco-2.0-tsi-water-pump'], retainedIds: [], reportCountCleanupIds: [],
    observations: ['The frozen page combines Ateca and Tarraco populations and imports a broad VW-platform water-pump narrative without an exact SEAT communication supporting its mileage, DTC, cost or recurrence claims.'],
    holdReasons: { 'seat-ateca-tarraco-2.0-tsi-water-pump': 'No exact SEAT primary source establishes the frozen cross-model recurring-defect identity and its detailed failure scope.' },
    pdfSources: {}, otherSources: {}, evidenceInventory: { method: 'Exact Ateca/Tarraco water-pump and thermostat-housing communication searches; no identity-grade primary source captured.', exactDocuments: 0 },
    modelAliases: ['Ateca', 'Tarraco'], searchTerms: ['2.0 TSI water pump leak', 'thermostat housing coolant leak'], requiredProse: [], content: {},
  },
  Ibiza: {
    make: 'SEAT', model: 'Ibiza', reviewDate: REVIEW_DATE, snapshotFile: SNAPSHOT_FILE,
    outputFile: 'data/known-issue-seat-ibiza-adjudication-2026-08-11.json',
    allIds: [
      'seat-dsg-dq200-mechatronic',
      'seat-ibiza-1-2-tsi-timing-chain-stretch-tensioner-failure',
      'seat-ibiza-1-6-tdi-egr-valve-failure-aggravated-by-dieselgate-emissions',
      'seat-ibiza-battery-drain-parasitic-drain-requiring-ecu-software-update',
      'seat-ibiza-diesel-particulate-filter-clogging-tdi-diesels',
      'seat-ibiza-dq200-7-speed-dry-clutch-dsg-mechatronic-clutch-failure',
      'seat-ibiza-electric-power-steering-loss-assistance-no-communication',
      'seat-ibiza-integrated-water-pump-thermostat-housing-coolant-leak',
      'seat-ibiza-leon-1.2-tsi-ea111-chain',
      'seat-ibiza-leon-1.6-tdi-cr-injectors',
      'seat-ibiza-wheel-arch-body-seam-corrosion',
    ],
    retainedIds: [], reportCountCleanupIds: [],
    observations: [
      'The official Ibiza manual states that repeated short journeys can prevent DPF self-cleaning and gives a bounded driver regeneration procedure for an illuminated DPF lamp.',
      'The same manual identifies DPF equipment by PR code; the rewrite therefore does not claim that every frozen-year TDI has identical hardware.',
      'The frozen EGR title asserts that the Dieselgate technical measure aggravated failure, while SEAT says the measure had no adverse durability effect; that indexed conflict cannot be repaired in body copy.',
      'The remaining rows contain duplicate identities, cross-model composites or platform-level mechanisms that lack exact SEAT model/population support.',
    ],
    holdReasons: {
      'seat-dsg-dq200-mechatronic': 'The frozen identity is a broad DQ200 platform aggregation without an exact Ibiza production window or single failure identity.',
      'seat-ibiza-1-2-tsi-timing-chain-stretch-tensioner-failure': 'No exact Ibiza primary source supports the frozen recurrence, year/engine scope, mileage and mandatory replacement package.',
      'seat-ibiza-1-6-tdi-egr-valve-failure-aggravated-by-dieselgate-emissions': 'The frozen title asserts post-Dieselgate causation that conflicts with SEAT manufacturer guidance and cannot be removed without identity approval.',
      'seat-ibiza-battery-drain-parasitic-drain-requiring-ecu-software-update': 'No exact Ibiza campaign captured supports the frozen recurring software-root-cause identity and repair prescription.',
      'seat-ibiza-diesel-particulate-filter-clogging-tdi-diesels': 'The model-year-2015 manual supports DPF soot loading and a warning-lamp procedure but does not establish the frozen 2009-2016 scope across both named EA189 engines.',
      'seat-ibiza-dq200-7-speed-dry-clutch-dsg-mechatronic-clutch-failure': 'The page bundles clutch and mechatronic failures and duplicates another DQ200 identity without redirect or consolidation authority.',
      'seat-ibiza-electric-power-steering-loss-assistance-no-communication': 'No exact primary record captured supports the frozen cross-year recurrence, module diagnosis and replacement scope.',
      'seat-ibiza-integrated-water-pump-thermostat-housing-coolant-leak': 'The frozen platform claim lacks an exact Ibiza population and verified failure mechanism.',
      'seat-ibiza-leon-1.2-tsi-ea111-chain': 'The frozen cross-model chain identity overlaps another Ibiza timing-chain page and lacks an approved canonical/redirect decision.',
      'seat-ibiza-leon-1.6-tdi-cr-injectors': 'The frozen cross-model injector identity lacks exact SEAT population, campaign and universal remedy evidence.',
      'seat-ibiza-wheel-arch-body-seam-corrosion': 'No exact SEAT communication captured supports the frozen climate-wide recurrence, body locations, mileage and price claims.',
    },
    pdfSources: {
      ibizaManual2015: {
        url: IBIZA_MANUAL, type: 'manufacturer', title: 'SEAT Ibiza model-year-2015 owner manual',
        contains: ['Soot accumulation in the diesel engine particulate filter', 'drive about 15 minutes', 'minimum speed of 60 km/h', 'approximately 2,000 rpm'],
        localVerification: { bytes: 5125249, sha256: '2576cea7ce38b3a058b1908f9def034c3627923da7c19506c285338d7b66a6ef', pdfPage: 61, printedPage: 59, renderedAndInspected: true },
      },
    },
    otherSources: {}, evidenceInventory: { method: 'Official SEAT Ibiza owner-manual extraction and rendered-page inspection plus exact identity searches; no forum recurrence was promoted to manufacturer fact.', exactDocuments: 1 },
    modelAliases: ['Ibiza', 'Ibiza ST', 'Ibiza Ecomotive'], searchTerms: ['diesel particulate filter', 'DPF warning lamp', 'PR code 7GG 7MG'],
    requiredProse: [],
    content: {
      'seat-ibiza-diesel-particulate-filter-clogging-tdi-diesels': {
        confidence: 'medium',
        description: 'The official Ibiza manual says the diesel particulate filter normally cleans itself, but multiple short journeys can prevent self-cleaning and allow soot to obstruct the filter, illuminating the DPF warning lamp. The manual also identifies particulate-filter equipment by vehicle PR code, so this page does not establish that every listed year and engine has identical hardware or that DPF loading is a model-wide defect. The captured manual does not support the prior claims of diesel-diluted oil, engine wear, universal limp mode or a specific repair-price range.',
        solution: 'If the DPF lamp is illuminated and the applicable Ibiza manual permits a regeneration journey, the model-year-2015 manual says to drive about 15 minutes in fourth or fifth gear (automatic: S range) at a minimum 60 km/h with the engine near 2,000 rpm. Stop if safety or traffic conditions do not allow it. Successful cleaning turns the lamp off; if it does not turn off, or the DPF, emissions and glow-plug lamps appear together, use a specialised workshop promptly. Do not buy a DPF, pressure sensor or cleaning product from this page; confirm equipment, stored faults, soot/ash loading and the cause first.',
        symptoms: ['DPF warning lamp after repeated short journeys', 'DPF, emissions and glow-plug lamps remain illuminated after the permitted cleaning attempt'],
        affectedSystems: ['Diesel particulate filter on equipped vehicles', 'Diesel emissions-control monitoring'], citations: ['ibizaManual2015'],
        evidence: ['Rendered page 61 of the official model-year-2015 manual states the soot-loading condition and exact driver regeneration instruction.'],
        summary: 'Replaced forum-derived recurrence, oil-dilution, DTC, cost and replacement claims with the official equipment-bounded warning-lamp procedure.',
        commerceDecision: 'DPF equipment, stored faults and soot/ash condition require diagnosis; no universal retail part',
      },
    },
  },
  Leon: {
    make: 'SEAT', model: 'Leon', reviewDate: REVIEW_DATE, snapshotFile: SNAPSHOT_FILE,
    outputFile: 'data/known-issue-seat-leon-adjudication-2026-08-11.json',
    allIds: [
      'seat-leon-1-2-1-4-tsi-timing-chain-stretch-tensioner-failure',
      'seat-leon-1-8-2-0-tsi-oil-consumption-intake-valve-carbon-buildup',
      'seat-leon-2.0-tfsi-ea888-gen2-oil',
      'seat-leon-7-speed-dsg-dry-clutch-mechatronic-failure',
      'seat-leon-cordoba-window-regulator',
      'seat-leon-ea189-tdi-diesel-egr-dpf-clogging-post-dieselgate-oil-diluti',
      'seat-leon-ea211-water-pump-thermostat-housing-coolant-leak',
      'seat-leon-infotainment-media-system-faults-touchscreen-failures',
      'seat-leon-mk2-1.4-tsi-twincharger-chain',
      'seat-leon-mk2-2.0-tdi-pd-injectors',
      'seat-leon-mk3-2.0-tsi-carbon',
      'seat-leon-mk3-cupra-haldex',
      'seat-leon-takata-airbag-inflator-safety-recall',
      'seat-leon-tdi-dual-mass-flywheel-failure',
    ],
    retainedIds: [], reportCountCleanupIds: [],
    observations: [
      'SEAT officially identifies Takata gas-generator aging from heat and humidity, excessive pressure during deployment, metal-fragment risk, VIN-based inclusion and free replacement.',
      'The official page describes potentially affected SEAT vehicles from 2009-2018 but does not make every 2012-2017 Leon affected; the rewrite makes VIN confirmation explicit.',
      'The remaining pages contain duplicate identities, cross-model composites, incompatible engine generations or unsupported prevalence, mileage, price and mechanism claims.',
    ],
    holdReasons: {
      'seat-leon-1-2-1-4-tsi-timing-chain-stretch-tensioner-failure': 'The frozen page combines different engine families and broad platform claims without an exact Leon population.',
      'seat-leon-1-8-2-0-tsi-oil-consumption-intake-valve-carbon-buildup': 'The frozen identity joins oil consumption and intake-carbon conditions as one defect across incompatible engines.',
      'seat-leon-2.0-tfsi-ea888-gen2-oil': 'The frozen engine-generation and recurrence scope lacks an exact Leon primary campaign and overlaps another oil/carbon identity.',
      'seat-leon-7-speed-dsg-dry-clutch-mechatronic-failure': 'The frozen page bundles clutch and mechatronic conditions and extrapolates platform evidence without an exact Leon population.',
      'seat-leon-cordoba-window-regulator': 'The frozen title combines Leon and Cordoba identities without exact shared production or remedy evidence.',
      'seat-leon-ea189-tdi-diesel-egr-dpf-clogging-post-dieselgate-oil-diluti': 'The frozen post-Dieselgate causation claim conflicts with SEAT manufacturer guidance and cannot be removed from the indexed identity here.',
      'seat-leon-ea211-water-pump-thermostat-housing-coolant-leak': 'No exact Leon population captured supports the frozen recurrence, mileage, DTC and repair-price claims.',
      'seat-leon-infotainment-media-system-faults-touchscreen-failures': 'The frozen page aggregates distinct software, display and hardware symptoms without one exact identity-grade SEAT record.',
      'seat-leon-mk2-1.4-tsi-twincharger-chain': 'The frozen recurrence and mandatory repair package lack an exact Leon campaign and overlap another timing-chain identity.',
      'seat-leon-mk2-2.0-tdi-pd-injectors': 'The frozen injector identity lacks exact Leon campaign/population support for every listed year and engine.',
      'seat-leon-mk3-2.0-tsi-carbon': 'The frozen intake-carbon recurrence and mileage/cost scope are extrapolated from engine-family evidence rather than an exact Leon population.',
      'seat-leon-mk3-cupra-haldex': 'The frozen Haldex failure mechanism, interval and repair scope lack exact SEAT campaign support.',
      'seat-leon-takata-airbag-inflator-safety-recall': 'The SEAT-wide Takata page supports the mechanism and VIN gate but does not identify the frozen 2012-2017 Leon Mk3/5F population; the captured DVSA page covers only model-year 2014.',
      'seat-leon-tdi-dual-mass-flywheel-failure': 'The frozen recurrence, mileage and replacement scope are not established by an exact Leon primary source.',
    },
    pdfSources: {},
    otherSources: {
      seatTakata: { url: SEAT_TAKATA, type: 'recall', title: 'Official SEAT Takata airbag recall campaign', contains: ['faulty gas generators', 'heat and humidity', 'metal fragments', 'VIN', 'free of charge'] },
    },
    evidenceInventory: { method: 'Official SEAT Takata campaign review and exact Leon identity searches; year alone was not treated as campaign inclusion.', exactDocuments: 1 },
    modelAliases: ['Leon', 'Leon Mk2', 'Leon Mk3', 'Leon 5F'], searchTerms: ['Takata airbag recall', 'gas generator heat humidity', 'VIN recall check'],
    requiredProse: [],
    content: {
      'seat-leon-takata-airbag-inflator-safety-recall': {
        confidence: 'high',
        description: 'SEAT says some of its vehicles produced from 2009-2018 may contain Takata airbags with faulty gas generators. Aging associated with heat and humidity can cause excessive pressure during deployment, allowing metal fragments to enter the cabin and cause serious or fatal injury. The official campaign requires a VIN check: year alone does not confirm inclusion, so this page does not claim that every 2012-2017 Leon is affected.',
        solution: 'Use SEAT\'s official Takata campaign page to check the VIN. If the vehicle is returned as affected, contact a SEAT service partner and follow any stop-driving instruction shown for that VIN; SEAT says the affected airbag is replaced free of charge. Do not buy an inflator, airbag module or steering-wheel part from this page; campaign inclusion and the exact module are VIN-specific.',
        symptoms: ['Usually no advance warning before a crash deployment', 'VIN returned as affected by the official Takata campaign checker'],
        affectedSystems: ['VIN-specific Takata airbag gas generator and module'], citations: ['seatTakata'],
        evidence: ['Official SEAT campaign text establishes the aging mechanism, deployment hazard, VIN gate and free replacement while bounding the affected population.'],
        summary: 'Removed the unverified campaign number/build-date example and made VIN-specific inclusion, stop-driving instructions and the official remedy explicit.',
        commerceDecision: 'campaign inclusion and exact airbag module are VIN-specific; no universal retail part',
      },
    },
  },
  Mii: {
    make: 'SEAT', model: 'Mii', reviewDate: REVIEW_DATE, snapshotFile: SNAPSHOT_FILE,
    outputFile: 'data/known-issue-seat-mii-adjudication-2026-08-11.json',
    allIds: ['seat-mii-electric-12v-drain'], retainedIds: [], reportCountCleanupIds: [],
    observations: ['The frozen page combines 12-volt battery discharge, charging/software behavior and a separate high-voltage battery campaign without an exact common identity or remedy.'],
    holdReasons: { 'seat-mii-electric-12v-drain': 'No exact primary source captured establishes the frozen recurring 12-volt-drain mechanism and its bundled high-voltage recall claims.' },
    pdfSources: {}, otherSources: {}, evidenceInventory: { method: 'Exact Mii electric 12-volt battery, charging-software and recall searches; no single identity-grade document captured.', exactDocuments: 0 },
    modelAliases: ['Mii electric', 'Mii Electric'], searchTerms: ['12V battery drain', 'charging software', 'high voltage battery recall'], requiredProse: [], content: {},
  },
};

const supportedModels = Object.freeze(['Alhambra', 'Arona', 'Ateca', 'Ibiza', 'Leon', 'Mii']);

function getContract(model) {
  const contract = contracts[model];
  if (!contract) throw new Error(`Unsupported SEAT model: ${model}`);
  return contract;
}

module.exports = { getContract, supportedModels };
