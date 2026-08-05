const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const recall = (year) =>
  `https://api.nhtsa.gov/recalls/recallsByVehicle?make=GMC&model=SIERRA%203500&modelYear=${year}`;

function replacement(card) {
  const source = {
    type: 'recall',
    title: `NHTSA Campaign ${card.campaign} - ${card.title}`,
    url: recall(card.sourceYear),
  };
  return {
    disposition: 'replace',
    decision: `The frozen ${card.frozenClaim} card did not establish its full year population, single failure mechanism, diagnosis and remedy with a directly applicable GM primary source.`,
    evidence: [{ type: source.type, label: source.title, url: source.url }],
    after: {
      years: card.years,
      trims: card.trims || [],
      engines: card.engines || [],
      category: card.category,
      title: card.title,
      description: card.description,
      solution: card.solution,
      severity: 'high',
      confidence: 'high',
      symptoms: card.symptoms,
      affectedSystems: card.affectedSystems,
      dtcCodes: [],
      estimatedCostLow: null,
      estimatedCostHigh: null,
      typicalMileageLow: null,
      typicalMileageHigh: null,
      citations: [source],
      source: 'manual',
      summary: `Replaced the unsupported ${card.frozenClaim} aggregation with exact NHTSA campaign ${card.campaign}.`,
    },
  };
}

const cards = {
  'gmc-sierra-3500hd-allison-trans-2008': {
    campaign: '14V407', sourceYear: 2007, years: [2007, 2008, 2009, 2010, 2011],
    trims: ['Trucks equipped with an auxiliary battery and covered by the campaign'],
    category: 'electrical', title: 'Auxiliary-Battery Fusible-Link Recall',
    description: 'NHTSA campaign 14V407 covers certain 2007-2011 GMC Sierra 3500HD trucks with an auxiliary battery. Excess current through the trailer harness can melt the auxiliary-battery fusible link, damage nearby components and increase fire risk.',
    solution: 'Check the VIN and equipment with GMC or NHTSA. Dealers replace the jumper harness with one containing a 40-amp inline fuse and provide supplemental owner-manual information.',
    symptoms: ['No reliable warning before the auxiliary-battery fusible link melts'],
    affectedSystems: ['auxiliary battery', 'fusible link', 'trailer harness', 'jumper harness'],
    frozenClaim: 'Allison transmission-control-module and sensor failure',
  },

  'gmc-sierra-3500hd-a-c-condenser-leak-leading-to-loss-of-refrigerant-and-warm-air': {
    campaign: '15V324', sourceYear: 2007, years: [2007, 2008],
    category: 'safety', title: 'Passenger Airbag Inflator Moisture Recall',
    description: 'NHTSA campaign 15V324 covers certain 2007-2008 GMC Sierra 3500HD trucks. Moisture intrusion can make the passenger frontal-airbag inflator rupture during deployment and propel metal fragments into the cabin.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers replace the front-passenger airbag inflator free of charge under GM recalls 15438 and 15817.',
    symptoms: ['No reliable warning before a moisture-degraded inflator deploys'],
    affectedSystems: ['passenger frontal airbag', 'airbag inflator'],
    frozenClaim: 'uncited A/C condenser leak',
  },

  'gmc-sierra-3500hd-allison-1000-2000-series-transmission-torque-converter-shudder': {
    campaign: '16V069', sourceYear: 2015, years: [2015, 2016],
    category: 'brakes', title: 'Loose Brake-Pedal Pivot Nut Recall',
    description: 'NHTSA campaign 16V069 covers certain 2015-2016 GMC Sierra 3500HD trucks. The brake-pedal pivot nut can loosen, leaving the brake pedal loose or inoperative and potentially interfering with the accelerator pedal.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers apply adhesive to the pivot nut and reinstall it at the increased torque specification under GM recall 20760.',
    symptoms: ['Loose brake pedal', 'Brake pedal may become inoperative', 'Loose pedal may interfere with the accelerator'],
    affectedSystems: ['brake pedal', 'pivot nut', 'pedal linkage'],
    frozenClaim: 'uncited Allison torque-converter shudder',
  },

  'gmc-sierra-3500hd-blend-door-actuator-failure-causing-temperature-airflow-control-problems': {
    campaign: '16V651', sourceYear: 2015, years: [2015, 2016, 2017],
    category: 'safety', title: 'Airbag Diagnostic-Software Recall',
    description: 'NHTSA campaign 16V651 covers certain 2015-2017 GMC Sierra 3500HD trucks. During a software diagnostic test, the frontal airbags and seat-belt pretensioners may not deploy in a qualifying crash.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers reflash the sensing and diagnostic module; vehicles with a prior airbag deployment receive a replacement module.',
    symptoms: ['No reliable warning that deployment is inhibited during the diagnostic test'],
    affectedSystems: ['airbag sensing and diagnostic module', 'frontal airbags', 'seat-belt pretensioners'],
    frozenClaim: 'Reddit-search-sourced blend-door actuator',
  },

  'gmc-sierra-3500hd-cluster-display-failure-2015': {
    campaign: '17V567', sourceYear: 2017, years: [2017, 2018],
    category: 'safety', title: 'Front Seat-Belt Retractor Torsion-Bar Recall',
    description: 'NHTSA campaign 17V567 covers certain 2017-2018 GMC Sierra 3500HD trucks. The front seat-belt retractors were built with an incorrect torsion bar and may not perform as intended in a crash.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers replace both front seat-belt retractor assemblies free of charge under GM recalls 17368, 17375 and 17376.',
    symptoms: ['No reliable warning that a retractor contains the wrong torsion bar'],
    affectedSystems: ['front seat-belt retractors', 'retractor torsion bars'],
    frozenClaim: 'video-only instrument-cluster display failure',
  },

  'gmc-sierra-3500hd-def-system-2011': {
    campaign: '17V664', sourceYear: 2011, years: [2011, 2012, 2013, 2014, 2015],
    trims: ['Dual-fuel-tank trucks covered by the campaign'],
    category: 'fuel', title: 'Front Fuel-Tank Overfill Recall',
    description: 'NHTSA campaign 17V664 covers certain 2011-2015 dual-tank GMC Sierra 3500HD trucks. A stuck-low front-tank level sensor can let the rear tank overfill the front tank, making it expand into the driveshaft and potentially leak fuel.',
    solution: 'Check the VIN and tank configuration with GMC or NHTSA. Dealers replace the rear-tank pump or update fuel-level software and inspect or replace the front tank as needed.',
    symptoms: ['Front fuel tank may overfill and expand', 'Fuel may leak if the tank contacts the driveshaft'],
    affectedSystems: ['front fuel tank', 'rear-tank fuel pump', 'fuel-level sensor', 'dual-tank transfer system'],
    frozenClaim: 'uncited diesel exhaust-fluid system failure',
  },

  'gmc-sierra-3500hd-dpf-diesel-particulate-filter-clogging-and-regeneration-failure': {
    campaign: '18V267', sourceYear: 2009, years: [2009, 2010, 2011, 2012, 2013, 2014],
    trims: ['Vehicles supplied with a covered Kidde fire extinguisher'],
    category: 'safety', title: 'Kidde Fire-Extinguisher Recall',
    description: 'NHTSA campaign 18V267 covers certain 2009-2014 GMC Sierra 3500HD trucks supplied with specified Kidde plastic-handle or push-button fire extinguishers. The extinguisher can clog, require excessive force or eject its nozzle.',
    solution: 'Check the VIN and extinguisher model with GMC or NHTSA. Owners are instructed to obtain a free replacement extinguisher from Kidde under GM recall 18146.',
    symptoms: ['Extinguisher may not discharge', 'Activation may require excessive force', 'Nozzle may detach'],
    affectedSystems: ['fire extinguisher'],
    frozenClaim: 'uncited DPF clogging and regeneration failure',
  },

  'gmc-sierra-3500hd-duramax-cp4-failure-2011': {
    campaign: '19V088', sourceYear: 2018, years: [2016, 2017, 2018],
    trims: ['Gasoline trucks with dual fuel tanks covered by the campaign'],
    engines: ['Gasoline engine'],
    category: 'fuel', title: 'Dual-Tank Fuel-Level Sensor Recall',
    description: 'NHTSA campaign 19V088 covers certain 2016-2018 gasoline GMC Sierra 3500HD trucks with dual fuel tanks. A front-tank sensor can stick low, allowing the rear tank to overfill the front tank until it expands into the driveshaft and may leak.',
    solution: 'Check the VIN and tank configuration with GMC or NHTSA. Dealers replace the rear-tank fuel-pump module and inspect or replace the front tank as needed.',
    symptoms: ['Front fuel tank may overfill and expand', 'Fuel may leak after tank-to-driveshaft contact'],
    affectedSystems: ['front fuel tank', 'rear-tank pump module', 'fuel-level sensor', 'driveshaft clearance'],
    frozenClaim: 'litigation-based CP4 high-pressure fuel-pump failure',
  },

  'gmc-sierra-3500hd-duramax-water-pump-failure-and-coolant-leak': {
    campaign: '19V328', sourceYear: 2017, years: [2017, 2018, 2019],
    engines: ['6.6L Duramax diesel'],
    category: 'electrical', title: 'Duramax Engine-Block Heater Short Recall',
    description: 'NHTSA campaign 19V328 covers certain 2017-2019 GMC Sierra 3500HD trucks with a 6.6L Duramax diesel and optional block heater. The heater cord or its terminals can short circuit, damage engine components and increase fire risk.',
    solution: 'Check the VIN and equipment with GMC or NHTSA. Dealers replace the engine-block heater free of charge under GM recall N182206310.',
    symptoms: ['No reliable warning before the block-heater circuit shorts'],
    affectedSystems: ['engine-block heater', 'heater cord', 'heater terminals'],
    frozenClaim: 'uncited Duramax water-pump and coolant leak',
  },

  'gmc-sierra-3500hd-egr-cooler-failure-and-coolant-contamination-duramax-lmm-lml': {
    campaign: '19V814', sourceYear: 2020, years: [2020],
    trims: ['Trucks with carpet floor covering covered by the campaign'],
    category: 'safety', title: 'Seat-Belt Pretensioner Carpet-Fire Recall',
    description: 'NHTSA campaign 19V814 covers certain 2020 GMC Sierra 3500HD trucks with carpet flooring. Hot gas from a deploying front seat-belt pretensioner can vent through its bracket and ignite the carpet.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers close the opening in the pretensioner bracket free of charge under GM recall N192270600.',
    symptoms: ['No reliable warning before pretensioner deployment vents hot gas toward the carpet'],
    affectedSystems: ['front seat-belt pretensioners', 'pretensioner brackets', 'carpet floor covering'],
    frozenClaim: 'uncited Duramax EGR cooler and coolant-contamination',
  },

  'gmc-sierra-3500hd-electric-power-steering-eps-assist-loss-reduced-assist-warnings-new-body-style': {
    campaign: '20V142', sourceYear: 2020, years: [2020],
    category: 'safety', title: 'Hood-Latch Striker Wire Recall',
    description: 'NHTSA campaign 20V142 covers certain 2020 GMC Sierra 3500HD trucks. Improperly heat-treated hood-latch striker wires can fracture and allow the hood to open unexpectedly while driving.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers replace the hood assembly free of charge under GM recall N192284960.',
    symptoms: ['No reliable warning before a hood-latch striker wire fractures', 'Hood may open while driving'],
    affectedSystems: ['hood assembly', 'hood-latch striker wires'],
    frozenClaim: 'forum- and lawsuit-sourced electric steering-assist loss',
  },

  'gmc-sierra-3500hd-exhaust-manifold-crack-2015': {
    campaign: '20V446', sourceYear: 2020, years: [2020],
    category: 'safety', title: 'Roof-Rail Airbag Inflator Diffuser Recall',
    description: 'NHTSA campaign 20V446 covers certain 2020 GMC Sierra 3500HD trucks. An improperly crimped roof-rail-airbag inflator diffuser can separate during deployment and degrade airbag performance.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers replace suspect roof-rail airbag modules free of charge under GM recall N202305380.',
    symptoms: ['No reliable warning that an inflator diffuser is improperly crimped'],
    affectedSystems: ['roof-rail airbag modules', 'inflator diffuser'],
    frozenClaim: 'generic-page-sourced exhaust-manifold cracking',
  },

  'gmc-sierra-3500hd-front-differential-actuator-failure-causing-4wd-engagement-problems': {
    campaign: '20V792', sourceYear: 2020, years: [2020, 2021],
    trims: ['Trucks with a front-row center seating position covered by the campaign'],
    category: 'safety', title: 'Front-Center Seat-Belt Bracket Recall',
    description: 'NHTSA campaign 20V792 covers certain 2020-2021 GMC Sierra 3500HD trucks. Front-row center seat-belt brackets may not be secured to the seat frame and may fail to restrain an occupant properly.',
    solution: 'Check the VIN and seating configuration with GMC or NHTSA. Dealers inspect both bracket attachments and reassemble them correctly as needed.',
    symptoms: ['No reliable warning that a center seat-belt bracket is unsecured'],
    affectedSystems: ['front-row center seat belt', 'seat-belt brackets', 'seat frame'],
    frozenClaim: 'uncited front-differential actuator and 4WD engagement',
  },

  'gmc-sierra-3500hd-fuel-tank-strap-and-fuel-sender-unit-corrosion-causing-fuel-gauge-inaccuracy': {
    campaign: '20V811', sourceYear: 2021, years: [2021],
    category: 'safety', title: 'Incorrect Seat-Belt Fastener Recall',
    description: 'NHTSA campaign 20V811 covers certain 2021 GMC Sierra 3500HD trucks. Incorrect bolts may have been installed at one or more seat-belt attachment points, leaving a belt assembly improperly secured.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers replace suspect seat-belt bolts free of charge under GM recall N202322230.',
    symptoms: ['No reliable warning that an incorrect seat-belt bolt was installed'],
    affectedSystems: ['seat-belt assemblies', 'seat-belt attachment bolts'],
    frozenClaim: 'uncited fuel-tank strap and sender corrosion',
  },

  'gmc-sierra-3500hd-glow-plug-control-module-glow-plug-circuit-faults-causing-hard-cold-starts-duramax': {
    campaign: '21V504', sourceYear: 2015, years: [2015, 2016],
    category: 'safety', title: 'Roof-Rail Airbag Inflator Rupture Recall',
    description: 'NHTSA campaign 21V504 covers certain 2015-2016 GMC Sierra 3500HD trucks. A roof-rail-airbag inflator end cap can detach or the inflator sidewall can rupture and propel components into the cabin.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers replace both roof-rail airbag modules free of charge under GM recall N202324251.',
    symptoms: ['No reliable warning before an affected inflator deploys'],
    affectedSystems: ['left roof-rail airbag module', 'right roof-rail airbag module', 'inflators'],
    frozenClaim: 'Reddit-search-sourced Duramax glow-plug circuit fault',
  },

  'gmc-sierra-3500hd-hydroboost-brake-assist-loss-due-to-power-steering-pump-hose-failure': {
    campaign: '21V758', sourceYear: 2021, years: [2021, 2022],
    trims: ['Vehicles whose electronic brake-control module was replaced during assembly'],
    category: 'brakes', title: 'Brake Pressure-Modulator Water-Intrusion Recall',
    description: 'NHTSA campaign 21V758 covers certain 2021-2022 GMC Sierra 3500HD trucks whose electronic brake-control module was replaced during assembly. Loose pressure-modulator bolts can allow water intrusion and an electrical short that may cause a fire.',
    solution: 'Park an affected vehicle outside and away from structures until repaired. Check the VIN with GMC or NHTSA; dealers replace the brake pressure-modulator valve assembly.',
    symptoms: ['No reliable warning before water intrusion causes an electrical short'],
    affectedSystems: ['brake pressure-modulator valve', 'electronic brake-control module', 'modulator attachment bolts'],
    frozenClaim: 'complaint-site hydroboost and power-steering pump failure',
  },

  'gmc-sierra-3500hd-injector-failure-2015': {
    campaign: '23V047', sourceYear: 2017, years: [2017, 2018, 2019],
    trims: ['Trucks with the dual-fuel-tank option covered by the campaign'],
    category: 'fuel', title: 'Rear Fuel-Tank Collapse Recall',
    description: 'NHTSA campaign 23V047 covers certain 2017-2019 dual-tank GMC Sierra 3500HD trucks. The rear tank can collapse, prevent fuel transfer to the front tank and stall the engine.',
    solution: 'Check the VIN and tank configuration with GMC or NHTSA. Dealers inspect and replace the rear tank or pump module as needed and add a vent hose to the rear-tank assembly.',
    symptoms: ['Engine may stall when fuel cannot transfer from the rear tank'],
    affectedSystems: ['rear fuel tank', 'fuel-pump module', 'tank vent hose', 'dual-tank transfer system'],
    frozenClaim: 'vendor- and forum-sourced diesel injector failure',
  },

  'gmc-sierra-3500hd-leaf-spring-breakage-2015': {
    campaign: '23V549', sourceYear: 2024, years: [2024],
    category: 'steering', title: 'Steering-Gear Shaft Fracture Recall',
    description: 'NHTSA campaign 23V549 covers certain 2024 GMC Sierra 3500HD trucks. The steering-gear shaft can fracture and disconnect from the steering arm, causing total loss of steering control.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers inspect and replace the steering gear as needed under GM recall N232414720.',
    symptoms: ['No reliable warning before the steering-gear shaft fractures', 'Total steering loss can occur'],
    affectedSystems: ['steering gear', 'steering-gear shaft', 'steering arm'],
    frozenClaim: 'video-only rear leaf-spring breakage',
  },

  'gmc-sierra-3500hd-rear-axle-pinion-seal-leak-and-differential-fluid-loss-aam-11-5-11-8': {
    campaign: '24V060', sourceYear: 2020, years: [2020, 2021, 2022, 2023, 2024],
    trims: ['Trucks with power-unlatching tailgates covered by the campaign'],
    category: 'electrical', title: 'Power Tailgate Water-Intrusion Recall',
    description: 'NHTSA campaign 24V060 covers certain 2020-2024 GMC Sierra 3500HD trucks with power-unlatching tailgates. Water can short the exterior release switch and unlatch the tailgate while parked, creating a cargo-loss hazard once driving begins.',
    solution: 'Verify that the tailgate is closed and latched before driving. Check the VIN with GMC or NHTSA; dealers replace the exterior touchpad switch assemblies.',
    symptoms: ['Tailgate may unlatch while the truck is in park', 'Unsecured cargo may be lost if the gate opens while driving'],
    affectedSystems: ['power tailgate', 'exterior release switch', 'touchpad switch assembly'],
    frozenClaim: 'uncited rear-axle pinion-seal leak',
  },

  'gmc-sierra-3500hd-silverado-sierra-3500hd-frame-corrosion-and-rust-through-salt-belt': {
    campaign: '24V756', sourceYear: 2019, years: [2018, 2019],
    trims: ['Crew Cab trucks covered by the campaign'],
    category: 'safety', title: 'Crew Cab Roof-Rail Airbag Recall',
    description: 'NHTSA campaign 24V756 covers certain 2018-2019 GMC Sierra 3500HD Crew Cab trucks. A roof-rail-airbag inflator end cap can detach or its sidewall can rupture and propel components into the vehicle.',
    solution: 'Check the VIN and cab style with GMC or NHTSA. Dealers replace both roof-rail airbag modules free of charge under GM recall N242474500.',
    symptoms: ['No reliable warning before an affected inflator deploys'],
    affectedSystems: ['left roof-rail airbag module', 'right roof-rail airbag module', 'inflators'],
    frozenClaim: 'uncited salt-belt frame corrosion and rust-through',
  },

  'gmc-sierra-3500hd-steering-box-leak-2015': {
    campaign: '24V797', sourceYear: 2020, years: [2020, 2021, 2022],
    engines: ['Diesel engine'],
    category: 'drivetrain', title: 'Diesel Transmission Control-Valve Recall',
    description: 'NHTSA campaign 24V797 covers certain 2020-2022 diesel GMC Sierra 3500HD trucks. A transmission control valve can fail and cause the rear wheels to lock.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers install new transmission-control-module software; GM provides special coverage for transmissions the software identifies as containing a defective valve.',
    symptoms: ['Rear wheels may lock if the transmission control valve fails'],
    affectedSystems: ['automatic transmission control valve', 'transmission control module', 'rear wheels'],
    frozenClaim: 'video-only steering-gear leak and play',
  },

  'gmc-sierra-3500hd-trailer-brake-controller-integrated-trailer-brake-module-malfunction': {
    campaign: '26V114', sourceYear: 2026, years: [2026],
    category: 'electrical', title: 'Electronic Owner-Manual Download Recall',
    description: 'NHTSA campaign 26V114 covers certain 2026 GMC Sierra 3500HD trucks. The radio may not be configured to download the electronic owner manual, violating the federal occupant-protection information requirement.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers reset the radio so the electronic owner manual downloads automatically under GM recall N252540430.',
    symptoms: ['Electronic owner manual may be unavailable through the radio'],
    affectedSystems: ['radio configuration', 'electronic owner-manual download'],
    frozenClaim: 'forum-sourced integrated trailer-brake-module malfunction',
  },

  'gmc-sierra-3500hd-transfer-case-pump-rub-causing-fluid-leak-and-transfer-case-damage-4wd': {
    campaign: '26V129', sourceYear: 2025, years: [2025, 2026],
    trims: ['Dual-fuel-tank trucks with RPO L8T and N2N covered by the campaign'],
    engines: ['Gasoline engine'],
    category: 'fuel', title: 'Dual-Tank Fuel-Transfer Software Recall',
    description: 'NHTSA campaign 26V129 covers certain 2025-2026 gasoline GMC Sierra 3500HD trucks with dual fuel tanks. The rear pump may not transfer enough fuel to the front tank, causing an engine stall.',
    solution: 'Check the VIN and RPO codes with GMC or NHTSA. The engine-control-module software is updated by a dealer or over the air free of charge under GM recall N262544420.',
    symptoms: ['Engine may stall when rear-to-front fuel transfer is inadequate'],
    affectedSystems: ['rear fuel pump', 'dual-tank transfer system', 'engine control module'],
    frozenClaim: 'video-only transfer-case pump-rub failure',
  },

  'gmc-sierra-3500hd-turbocharger-vgt-vane-sticking-and-boost-control-failure-duramax-lml-l5p': {
    campaign: '26V325', sourceYear: 2019, years: [2019],
    category: 'safety', title: 'Expanded Roof-Rail Airbag Inflator Recall',
    description: 'NHTSA campaign 26V325 covers certain 2019 GMC Sierra 3500HD trucks. A roof-rail-airbag inflator end cap can detach or its sidewall can rupture, releasing gas and projecting the cap or fragments into the cabin.',
    solution: 'Check the VIN with GMC or NHTSA. Dealers replace both roof-rail airbag modules free of charge under GM recall N262557310.',
    symptoms: ['No reliable warning before an affected inflator deploys'],
    affectedSystems: ['left roof-rail airbag module', 'right roof-rail airbag module', 'inflators'],
    frozenClaim: 'uncited Duramax variable-geometry turbo vane failure',
  },
};

const published = Object.fromEntries(
  Object.entries(cards).map(([id, card]) => [id, replacement(card)]),
);

module.exports = buildConfig({
  label: 'GMC Sierra 3500HD',
  make: 'GMC',
  model: 'Sierra 3500HD',
  slug: 'gmc-sierra-3500hd',
  batchId: 'gmc-sierra-3500hd-full-record-cohort-158-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'af89c026d547209a3c0cda53087159a6b2124443c7bed2ed085e34a0ee5f5ebf',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/gmc-sierra-3500hd/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'gmcsierra3500hd_blind:manual-primary-source-gate',
    edge: 'gmcsierra3500hd_edge:manual-primary-source-gate',
  },
  published,
  reasons: {},
  proposalCampaigns: [],
});
