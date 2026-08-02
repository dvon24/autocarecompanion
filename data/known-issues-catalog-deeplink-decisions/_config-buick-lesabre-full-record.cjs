const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const sources = {
  intakeBackfire: {
    type: 'recall',
    title: 'NHTSA Recall 96V116 - Upper Intake Manifold Can Break During Starting',
    url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Buick&model=LeSabre&modelYear=1996',
  },
  mallModule: {
    type: 'recall',
    title: 'NHTSA Recall 95V204 - Malfunction Alarm, Lighting and Locking Module',
    url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Buick&model=LeSabre&modelYear=1996',
  },
  coolerLines1992: {
    type: 'recall',
    title: 'NHTSA Recall 96V015 - Transmission Oil Cooler Lines (1992 LeSabre)',
    url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Buick&model=LeSabre&modelYear=1992',
  },
  coolerLines1993: {
    type: 'recall',
    title: 'NHTSA Recall 96V015 - Transmission Oil Cooler Lines (1993 LeSabre)',
    url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Buick&model=LeSabre&modelYear=1993',
  },
  fuelRegulator: {
    type: 'recall',
    title: 'GM Recall 03054B / NHTSA 04V090 - Fuel Pressure Regulator',
    url: 'https://static.nhtsa.gov/odi/rcl/2004/RCRIT-04V090-6207.pdf',
  },
  transmissionLink: {
    type: 'recall',
    title: 'NHTSA Recall 99V089 - 4T65E Manual Valve Link',
    url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Buick&model=LeSabre&modelYear=1999',
  },
  steeringBolts: {
    type: 'recall',
    title: 'NHTSA Recall 02V067 - Steering Gear Attachment Bolts',
    url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Buick&model=LeSabre&modelYear=2002',
  },
  airbagInflator: {
    type: 'recall',
    title: 'NHTSA Recall 02V222 - Driver Air-Bag Inflator Weld',
    url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Buick&model=LeSabre&modelYear=2002',
  },
  brakeBoosterNuts: {
    type: 'recall',
    title: 'NHTSA Recall 99V238 - Brake-Booster Attachment Nuts',
    url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Buick&model=LeSabre&modelYear=2000',
  },
};

function evidence(...items) {
  return items.map((item) => ({
    type: item.type,
    label: item.title,
    url: item.url,
  }));
}

function citations(...items) {
  return items.map((item) => ({
    type: item.type,
    title: item.title,
    url: item.url,
  }));
}

module.exports = buildConfig({
  label: 'Buick LeSabre',
  model: 'LeSabre',
  slug: 'buick-lesabre',
  batchId: 'buick-lesabre-full-record-cohort-7-2026-08-02',
  auditDate: '2026-08-02',
  snapshotHash:
    '991abdae63b3e8a088f1390aa51f6a18f19aa81a2914b3540a1e26f6d3fef77d',
  sourceSnapshotFileHash:
    'd82c00ca22d379625ecb893217f7ca25f57d910813f46c091cea5d2977bef833',
  packetFileHash:
    '48eaeb1974d5bafd34631b4c0aaf2b08798dce21e6531b8c6a78fb6fc29de53f',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/buick-lesabre/991abdae63b3/all-0001.json',
  reviewTokens: {
    blind: 'buicklesabre_blind:self-no-blocker',
    edge: 'buicklesabre_edge:self-no-blocker',
  },
  published: {
    'buick-3800-lower-intake-gasket-lesabre': {
      disposition: 'replace',
      decision:
        'Replace the unsupported 1995-2005 lower-intake-gasket aggregation, aftermarket recommendation, cost range and engine-damage claims with the exact 1996 upper-intake starting-backfire recall.',
      evidence: evidence(sources.intakeBackfire),
      after: {
        years: [1996],
        trims: [],
        engines: ['3.8L V6'],
        category: 'engine',
        title: 'Upper Intake Manifold Can Break During Starting (Recall 96V116)',
        description:
          'NHTSA Recall 96V116 covers certain 1996 Buick LeSabre vehicles equipped with the 3.8L V6. A backfire while the engine is being started can break the upper intake manifold, causing a no-start condition and possibly an engine-compartment fire.',
        solution:
          'Check the VIN for recall completion. The recall remedy updates the powertrain-control-module programming. Until the campaign repair is completed, NHTSA directs owners to keep the hood shut whenever starting the vehicle to reduce the chance of personal injury.',
        severity: 'high',
        confidence: 'high',
        symptoms: [
          'Backfire while starting the engine',
          'No-start condition after the intake manifold breaks',
          'Possible engine-compartment fire',
        ],
        affectedSystems: ['upper intake manifold', 'powertrain control module programming'],
        dtcCodes: [],
        citations: citations(sources.intakeBackfire),
        summary:
          'Replaced an unsupported decade-wide gasket card with the exact 1996 3.8L upper-intake starting-backfire recall and removed cost, damage and aftermarket-part claims.',
      },
    },
    'buick-lesabre-electronic-climate-control-programmer-blower-control-module': {
      disposition: 'replace',
      decision:
        'Replace the forum-derived 1992-2005 HVAC programmer and blower-control aggregation with 1996 recall 95V204\'s exact MALL-module noncompliance and inspect/replace remedy.',
      evidence: evidence(sources.mallModule),
      after: {
        years: [1996],
        trims: [],
        engines: [],
        category: 'electrical',
        title: 'MALL Module Can Disable Required Chimes and Controls (Recall 95V204)',
        description:
          'NHTSA Recall 95V204 covers certain 1996 Buick LeSabre vehicles assembled with a Malfunction Alarm, Lighting and Locking module that may contain a damaged capacitor. The key-in-ignition warning chime and driver-seat-belt warning chime and lamp may not work; other reminder chimes, interior-lighting controls and power-door-lock functions can also be affected.',
        solution:
          'Check the VIN for recall completion. A Buick dealer inspects the MALL module and replaces it when required under the recall. Do not substitute blower-motor, resistor or HVAC-programmer replacement for this recall condition without a separate diagnosis.',
        severity: 'medium',
        confidence: 'high',
        symptoms: [
          'Key-in-ignition warning chime does not sound',
          'Driver-seat-belt warning chime or indicator does not work',
          'Interior lighting or power-door-lock functions are affected',
        ],
        affectedSystems: [
          'Malfunction Alarm, Lighting and Locking module',
          'warning chimes, interior lighting and power door locks',
        ],
        dtcCodes: [],
        citations: citations(sources.mallModule),
        summary:
          'Replaced a forum-derived HVAC hardware aggregation with the exact 1996 MALL-module recall and its inspect/replace remedy.',
      },
    },
    'buick-lesabre-front-strut-mount-bearing-wear-clunking-popping-over-bumps-t': {
      disposition: 'replace',
      decision:
        'Replace the forum and aftermarket-derived strut-mount wear card with NHTSA 96V015\'s cold-region, low-temperature transmission-oil-cooler-line safety recall.',
      evidence: evidence(sources.coolerLines1992, sources.coolerLines1993),
      after: {
        years: [1992, 1993],
        trims: [],
        engines: ['L27 or L67 engine with 4T60E automatic transmission'],
        category: 'transmission',
        title: 'Transmission Oil Cooler Lines Can Separate (Recall 96V015)',
        description:
          'NHTSA Recall 96V015 covers certain 1992-1993 Buick LeSabre vehicles with an L27 or L67 engine and 4T60E automatic transmission that were sold or registered in the cold-weather states listed by the campaign. In low temperatures combined with high transmission loads, an oil-cooler line can separate and spill transmission fluid, creating a fire risk.',
        solution:
          'Because eligibility depends on VIN, equipment and original sale or registration region, have a Buick dealer check recall status. The no-charge recall remedy replaces the transmission oil cooler lines.',
        severity: 'high',
        confidence: 'high',
        symptoms: [
          'Transmission oil cooler line separates in cold, high-load operation',
          'Transmission-fluid spill with possible vehicle fire',
        ],
        affectedSystems: ['4T60E transmission oil cooler lines'],
        dtcCodes: [],
        citations: citations(sources.coolerLines1992, sources.coolerLines1993),
        summary:
          'Replaced an unsupported strut-mount wear card with the VIN-, equipment- and cold-region-bounded 1992-1993 transmission-cooler-line recall.',
      },
    },
    'buick-lesabre-fuel-pressure-regulator-diaphragm-leak-fire-risk-recall': {
      disposition: 'replace',
      decision:
        'Keep the genuine fuel-pressure-regulator recall but replace secondary sourcing, vague early warnings and generic repair advice with GM recall 03054B\'s exact population, failure chain and regulator replacement.',
      evidence: evidence(sources.fuelRegulator),
      after: {
        years: [1998, 1999, 2000],
        trims: [],
        engines: ['3.8L V6 RPO L36 / VIN K'],
        category: 'fuel',
        title: 'Fuel Pressure Regulator Can Leak and Cause Fire (Recall 04V090)',
        description:
          'GM Recall 03054B, NHTSA 04V090, covers certain 1998-2000 Buick LeSabre vehicles with the 3.8L V6 L36 engine and affected fuel-pressure regulators. A leaking diaphragm can send fuel through a vacuum line into the intake manifold. During a failed start with a low battery, the fuel and a mistimed spark can backfire, rupture the intake, displace a fuel line or injector and create a fuel leak and fire risk.',
        solution:
          'Check the VIN for recall completion. The no-charge recall remedy replaces the fuel-pressure regulator with the improved part. A slow crank, difficult start, poor drivability or malfunction indicator should be inspected promptly, but only the VIN check determines recall inclusion.',
        severity: 'high',
        confidence: 'high',
        symptoms: [
          'Slow cranking or difficult starting',
          'Poor drivability or malfunction indicator from a leaking regulator',
          'Loud intake backfire with possible fuel leak or fire',
        ],
        affectedSystems: ['fuel pressure regulator', 'intake manifold and fuel rail'],
        dtcCodes: [],
        citations: citations(sources.fuelRegulator),
        summary:
          'Corrected the fuel-pressure-regulator card to the 1998-2000 L36 recall population, exact backfire-to-fire chain and improved-regulator remedy using the primary GM bulletin.',
      },
    },
    'buick-lesabre-pass-key-anti-theft-system-fault-security-light-engine-crank': {
      disposition: 'replace',
      decision:
        'Replace the forum-derived PASS-Key aggregation and unsafe bypass advice with the exact 1999 4T65E manual-valve-link safety recall.',
      evidence: evidence(sources.transmissionLink),
      after: {
        years: [1999],
        trims: [],
        engines: [],
        category: 'transmission',
        title: 'Transmission Gear State May Differ From PRNDL (Recall 99V089)',
        description:
          'NHTSA Recall 99V089 covers certain 1999 Buick LeSabre vehicles equipped with the 4T65E automatic transmission. A retaining clip can loosen during certain shifting maneuvers and let the transmission-detent linkage disconnect from the manual valve. The indicated PRNDL position can then differ from the transmission\'s hydraulic state; for example, Drive may be indicated while Reverse is engaged.',
        solution:
          'Check the VIN for recall completion. The recall remedy replaces the manual-valve/link assembly with a kit that uses a spring-type fastener. Do not use resistor, key-cylinder or anti-theft bypass modifications for this unrelated transmission safety condition.',
        severity: 'high',
        confidence: 'high',
        symptoms: [
          'PRNDL indication does not match actual vehicle movement',
          'Vehicle moves in Reverse after Drive is selected',
        ],
        affectedSystems: ['4T65E transmission manual valve, detent linkage and retaining clip'],
        dtcCodes: [],
        citations: citations(sources.transmissionLink),
        summary:
          'Replaced a forum-derived anti-theft card and bypass advice with the exact 1999 transmission manual-valve-link recall.',
      },
    },
    'buick-lesabre-plastic-upper-intake-manifold-degradation-causing-coolant-le': {
      disposition: 'replace',
      decision:
        'Replace the secondary-source plastic-plenum degradation aggregation and unverified TSB claim with 2002 recall 02V067\'s exact missing or under-torqued steering-gear bolts.',
      evidence: evidence(sources.steeringBolts),
      after: {
        years: [2002],
        trims: [],
        engines: [],
        category: 'steering',
        title: 'Steering-Gear Attachment Bolts May Be Missing or Loose (Recall 02V067)',
        description:
          'NHTSA Recall 02V067 covers certain 2002 Buick LeSabre vehicles built with missing or under-torqued steering-gear attachment bolts. A missing bolt can cause uneven steering response or unusual noises during turns. If the left bolt is missing and the right mounting strap fails, steering control can be lost.',
        solution:
          'Check the VIN for recall completion. A Buick dealer inspects for the presence and proper torque of both steering-gear attachment bolts and completes the recall correction at no charge.',
        severity: 'high',
        confidence: 'high',
        symptoms: [
          'Uneven steering response',
          'Unusual noise during turns',
          'Loss of steering control if the remaining mounting strap fails',
        ],
        affectedSystems: ['steering gear attachment bolts and right mounting strap'],
        dtcCodes: [],
        citations: citations(sources.steeringBolts),
        summary:
          'Replaced an unsupported plastic-plenum card with the exact 2002 steering-gear-bolt recall and removed unverified TSB, coolant and repair claims.',
      },
    },
    'buick-lesabre-power-window-regulator-cable-failure': {
      disposition: 'replace',
      decision:
        'Replace the complaint, forum and aftermarket-derived window-regulator aggregation with the exact 2002 driver-air-bag inflator-weld recall.',
      evidence: evidence(sources.airbagInflator),
      after: {
        years: [2002],
        trims: [],
        engines: [],
        category: 'safety',
        title: 'Driver Air-Bag Inflator Can Fracture at Its Weld (Recall 02V222)',
        description:
          'NHTSA Recall 02V222 covers certain 2002 Buick LeSabre vehicles with a driver-side air-bag inflator that can fracture at a weld during deployment. Inflator pieces can strike and injure occupants, and the air-bag cushion may not inflate fully, reducing protection for the driver.',
        solution:
          'Check the VIN for recall completion. A Buick dealer inspects the driver-side air-bag module assembly and replaces it when necessary under the no-charge recall.',
        severity: 'high',
        confidence: 'high',
        symptoms: [
          'No reliable warning before an affected inflator deploys',
          'Inflator fragments or incomplete driver-air-bag inflation during deployment',
        ],
        affectedSystems: ['driver-side air-bag inflator and module assembly'],
        dtcCodes: [],
        citations: citations(sources.airbagInflator),
        summary:
          'Replaced a generic window-regulator card with the exact 2002 driver-air-bag inflator-weld recall and its inspect/replace remedy.',
      },
    },
    'buick-lesabre-tank-fuel-pump-fuel-level-sender-failure': {
      disposition: 'replace',
      decision:
        'Replace the low-confidence complaint and forum-derived fuel-pump/sender aggregation with the exact 2000 brake-booster attachment-nut recall.',
      evidence: evidence(sources.brakeBoosterNuts),
      after: {
        years: [2000],
        trims: [],
        engines: [],
        category: 'brakes',
        title: 'Brake-Booster Attachment Nuts May Be Loose (Recall 99V238)',
        description:
          'NHTSA Recall 99V238 covers certain 2000 Buick LeSabre vehicles whose brake-booster-to-pedal assembly attachment nuts may be loose. The brake pedal can sit low, the assembly can be loose, the brakes may fail to release, and complete nut loss can cause loss of braking. Fumes or water can also enter the passenger compartment.',
        solution:
          'Check the VIN for recall completion. A Buick dealer replaces any missing brake-booster-to-pedal assembly nuts and tightens all four nuts to the specified torque under the recall.',
        severity: 'high',
        confidence: 'high',
        symptoms: [
          'Low brake pedal or loose pedal assembly',
          'Brakes do not release',
          'Loss of braking if attachment nuts back completely off',
          'Fume or water intrusion into the passenger compartment',
        ],
        affectedSystems: ['brake booster to brake-pedal assembly attachment nuts'],
        dtcCodes: [],
        citations: citations(sources.brakeBoosterNuts),
        summary:
          'Replaced a low-confidence fuel-pump/sender aggregation with the exact 2000 brake-booster attachment-nut recall and torque remedy.',
      },
    },
  },
  proposalCampaigns: [],
});
