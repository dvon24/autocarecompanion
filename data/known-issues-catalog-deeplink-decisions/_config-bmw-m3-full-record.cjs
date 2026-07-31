const communicationsCorpus =
  'https://www.nhtsa.gov/nhtsa-datasets-and-apis';

function recallUrl(campaign) {
  return `https://www.nhtsa.gov/recalls?nhtsaId=${campaign}`;
}

function recallCorpus(campaign) {
  const campaignYear = Number.parseInt(campaign.slice(0, 2), 10);
  return campaignYear <= 9 || campaignYear >= 90
    ? 'https://static.nhtsa.gov/odi/ffdd/rcl/FLAT_RCL_PRE_2010.zip'
    : 'https://static.nhtsa.gov/odi/ffdd/rcl/FLAT_RCL_POST_2010.zip';
}

function archived({ oldTitle, years, category, claims, urls, reason }) {
  return {
    disposition: 'remove',
    decision: `Archive the frozen "${oldTitle}" aggregation. ${reason} Remove all ${claims} commerce claims and ${urls} outbound URL occurrences.`,
    evidence: [
      {
        type: 'nhtsa',
        label: 'NHTSA Manufacturer Communications Data Corpus',
        url: communicationsCorpus,
      },
    ],
    after: {
      years,
      trims: [],
      engines: [],
      category,
      title: `Archived - ${oldTitle}`,
      description: `The former BMW M3 card asserted "${oldTitle}" across the listed population. ${reason}`,
      solution:
        'Do not order parts or apply a universal repair from this archived card. Verify the exact chassis, model year, production date, engine, transmission, symptoms, DTCs, modifications, open recalls and current BMW service information before diagnosis.',
      severity: 'low',
      confidence: 'low',
      source: 'manual',
      symptoms: [],
      affectedSystems: [],
      dtcCodes: [],
      citations: [
        {
          type: 'nhtsa',
          title: 'NHTSA Manufacturer Communications Data Corpus',
          url: communicationsCorpus,
        },
      ],
      summary: `Archived the unsupported BMW M3 "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const frozen = {
  'bmw-m3-brittle-plastic-cooling-system-components-fail-catastrophica': {
    years: [1995, 1996, 1997, 1998, 1999],
    category: 'cooling',
    oldTitle:
      'Brittle plastic cooling-system components fail catastrophically',
    claims: 1,
    urls: 3,
  },
  'bmw-m3-e46-rod-bearing-2001': {
    years: [2001, 2002, 2003, 2004, 2005, 2006],
    category: 'engine',
    oldTitle: 'Rod Bearing Wear (S54 Engine)',
    claims: 3,
    urls: 5,
  },
  'bmw-m3-e46-subframe-crack-2001': {
    years: [2001, 2002, 2003, 2004, 2005, 2006],
    category: 'suspension',
    oldTitle: 'Rear Subframe Mounting Point Cracking',
    claims: 2,
    urls: 2,
  },
  'bmw-m3-e46-throttle-actuator-2001': {
    years: [2001, 2002, 2003, 2004, 2005, 2006],
    category: 'other',
    oldTitle: 'Electronic Throttle Actuator (EDR) Failure',
    claims: 2,
    urls: 4,
  },
  'bmw-m3-e46-vanos-failure-2001': {
    years: [2001, 2002, 2003, 2004, 2005, 2006],
    category: 'engine',
    oldTitle: 'VANOS Unit Failure (S54 Double-VANOS)',
    claims: 4,
    urls: 6,
  },
  'bmw-m3-e92-differential-mount-subframe-stress': {
    years: [2008, 2009, 2010, 2011, 2012, 2013],
    category: 'suspension',
    oldTitle: 'E92 Rear Differential Mount and Subframe Stress',
    claims: 3,
    urls: 5,
  },
  'bmw-m3-e92-edc-damper-failure': {
    years: [2008, 2009, 2010, 2011, 2012, 2013],
    category: 'suspension',
    oldTitle: 'EDC Electronic Damper Control System Failure',
    claims: 3,
    urls: 5,
  },
  'bmw-m3-e9x-idle-control-2008': {
    years: [2008, 2009, 2010, 2011, 2012, 2013],
    category: 'engine',
    oldTitle: 'Idle Control Valve (ICV) Failure / Idle Surge',
    claims: 2,
    urls: 4,
  },
  'bmw-m3-e9x-rod-bearing-2008': {
    years: [2008, 2009, 2010, 2011, 2012, 2013],
    category: 'engine',
    oldTitle: 'Rod Bearing Failure (S65 V8) - CRITICAL',
    claims: 4,
    urls: 6,
  },
  'bmw-m3-e9x-throttle-actuator-2008': {
    years: [2008, 2009, 2010, 2011, 2012, 2013],
    category: 'other',
    oldTitle: 'Throttle Actuator Gear Failure (S65 V8)',
    claims: 3,
    urls: 5,
  },
  'bmw-m3-e9x-vanos-solenoid-2008': {
    years: [2008, 2009, 2010, 2011, 2012, 2013],
    category: 'engine',
    oldTitle: 'VANOS Solenoid Failure (S65 V8)',
    claims: 2,
    urls: 4,
  },
  'bmw-m3-elevated-oil-consumption-via-crankcase-ventilation-rings': {
    years: [1995, 1996, 1997, 1998, 1999],
    category: 'engine',
    oldTitle:
      'Elevated oil consumption via crankcase ventilation (CCV) and rings',
    claims: 1,
    urls: 3,
  },
  'bmw-m3-f80-charge-pipe-2015': {
    years: [2015, 2016, 2017, 2018],
    category: 'engine',
    oldTitle: 'Plastic Charge Pipe Failure (S55)',
    claims: 2,
    urls: 2,
  },
  'bmw-m3-f80-crank-hub-2015': {
    years: [2015, 2016, 2017, 2018],
    category: 'engine',
    oldTitle: 'Crank Hub Slip/Failure (S55) - CRITICAL',
    claims: 1,
    urls: 1,
  },
  'bmw-m3-f80-injector-failure-2015': {
    years: [2015, 2016, 2017, 2018],
    category: 'engine',
    oldTitle: 'Direct Fuel Injector Failure (S55)',
    claims: 3,
    urls: 5,
  },
  'bmw-m3-f80-water-pump-2015': {
    years: [2015, 2016, 2017, 2018],
    category: 'engine',
    oldTitle: 'Electric Water Pump Failure (S55)',
    claims: 3,
    urls: 5,
  },
  'bmw-m3-g80-adaptive-suspension-2021': {
    years: [2021, 2022, 2023],
    category: 'suspension',
    oldTitle: 'Adaptive M Suspension Electronic Damper Failure',
    claims: 3,
    urls: 5,
  },
  'bmw-m3-g80-charge-pipe-2021': {
    years: [2021, 2022, 2023],
    category: 'engine',
    oldTitle: 'Plastic Y-Shaped Charge Pipe Failure (S58)',
    claims: 2,
    urls: 2,
  },
  'bmw-m3-g80-cooling-system-2021': {
    years: [2021, 2022, 2023],
    category: 'cooling',
    oldTitle: 'Coolant System Issues (S58)',
    claims: 5,
    urls: 7,
  },
  'bmw-m3-g80-idrive-electronics-2021': {
    years: [2021, 2022, 2023],
    category: 'electrical',
    oldTitle: 'iDrive 8 Software/Electronics Issues',
    claims: 1,
    urls: 1,
  },
  'bmw-m3-g80-integrated-brake-system-recall': {
    years: [2021, 2022],
    category: 'brakes',
    oldTitle: 'G80 Integrated Brake System Weld Defect',
    claims: 2,
    urls: 2,
  },
  'bmw-m3-g80-s58-carbon-buildup': {
    years: [2021, 2022, 2023],
    category: 'engine',
    oldTitle: 'G80 S58 Engine Carbon Buildup on Intake Valves',
    claims: 1,
    urls: 1,
  },
  'bmw-m3-power-window-regulator-failure-interior-trim-rattles': {
    years: [1995, 1996, 1997, 1998, 1999],
    category: 'electrical',
    oldTitle: 'Power window regulator failure and interior trim rattles',
    claims: 1,
    urls: 3,
  },
  'bmw-m3-rear-subframe-mounting-points-rear-axle-carrier-panel-cracki': {
    years: [1995, 1996, 1997, 1998, 1999],
    category: 'body',
    oldTitle:
      'Rear subframe mounting points / rear axle carrier panel (RACP) cracking',
    claims: 1,
    urls: 3,
  },
  'bmw-m3-s55-charge-pipe-failure': {
    years: [2015, 2016, 2017, 2018],
    category: 'engine',
    oldTitle: 'S55 Plastic Charge Pipe Cracking',
    claims: 2,
    urls: 2,
  },
  'bmw-m3-s55-crank-hub-slip': {
    years: [2015, 2016, 2017, 2018],
    category: 'engine',
    oldTitle: 'S55 Crank Hub Slip/Failure',
    claims: 2,
    urls: 2,
  },
  'bmw-m3-s55-water-pump-electric-failure': {
    years: [2015, 2016, 2017, 2018, 2021, 2022, 2023],
    category: 'cooling',
    oldTitle: 'S55/S58 Electric Water Pump Failure',
    claims: 3,
    urls: 5,
  },
  'bmw-m3-s65-rod-bearing-failure': {
    years: [2008, 2009, 2010, 2011, 2012, 2013],
    category: 'engine',
    oldTitle: 'S65 V8 Rod Bearing Premature Failure',
    claims: 3,
    urls: 5,
  },
  'bmw-m3-s65-throttle-actuator-failure': {
    years: [2008, 2009, 2010, 2011, 2012, 2013],
    category: 'engine',
    oldTitle: 'S65 Throttle Body Actuator Failure',
    claims: 3,
    urls: 5,
  },
  'bmw-m3-s65-vanos-solenoid-failure': {
    years: [2008, 2009, 2010, 2011, 2012, 2013],
    category: 'engine',
    oldTitle: 'VANOS Solenoid Wear and Failure',
    claims: 3,
    urls: 5,
  },
  'bmw-m3-single-vanos-variable-timing-unit-rattle-seal-failure': {
    years: [1996, 1997, 1998, 1999],
    category: 'engine',
    oldTitle:
      'Single-VANOS variable-timing unit rattle and seal failure (S52)',
    claims: 0,
    urls: 0,
  },
  'bmw-m3-worn-rear-trailing-arm-bushings-suspension-mounts': {
    years: [1995, 1996, 1997, 1998, 1999],
    category: 'suspension',
    oldTitle:
      'Worn rear trailing arm bushings (RTAB) and suspension mounts',
    claims: 1,
    urls: 3,
  },
};

const reasons = {
  'bmw-m3-e46-rod-bearing-2001':
    'It turns high-load use and oil-analysis heuristics into a six-model-year preventive replacement mandate, promotes three aftermarket bearing systems, and assigns a universal repair interval without an exact VIN campaign, BMW wear limit or fault-led diagnosis.',
  'bmw-m3-e46-subframe-crack-2001':
    'It claims nearly every high-mileage E46 M3 is structurally affected and prescribes aftermarket welded plates or through-bolting without a BMW inspection threshold, crack measurement, production boundary or campaign tied to the exact vehicle.',
  'bmw-m3-e46-throttle-actuator-2001':
    'It treats age-related actuator or throttle-position faults as a model-wide failure and promotes rebuilt or used units based on alleged part discontinuation without BMW fault codes, test plans, VIN-specific part validation or an official repair program.',
  'bmw-m3-e46-vanos-failure-2001':
    'It combines seals, pump-disc wear, bearing play and rattle into a mandatory 80,000-to-120,000-mile rebuild, then promotes several aftermarket kits without BMW timing faults, oil-pressure checks, mechanical measurements or an applicable campaign.',
  'bmw-m3-e92-differential-mount-subframe-stress':
    'It converts hard-use bushing wear and drivetrain movement into an inherent subframe-cracking defect and promotes solid mounts and welded reinforcement without BMW measurements, a production boundary or an applicable campaign.',
  'bmw-m3-e92-edc-damper-failure':
    'It groups dampers, sensors and the EDC module under one failure card and promotes a complete damper set or EDC deletion without BMW faults, leakage or damping measurements, option-code verification or a service bulletin.',
  'bmw-m3-e9x-rod-bearing-2008':
    'It presents disputed clearance figures and forum consensus as proof of an imminent model-wide defect, labels preventive replacement mandatory and promotes bearings and non-BMW fasteners without a BMW campaign, wear limit or fault-led diagnosis.',
  'bmw-m3-e9x-throttle-actuator-2008':
    'It infers paired actuator failure from limp mode and promotes gear/electronics rebuilds without distinguishing the two bank actuators from other air-path or DME faults and without an applicable BMW warranty extension or test plan.',
  'bmw-m3-e9x-vanos-solenoid-2008':
    'It assigns generic BMW fault codes and prescribes paired solenoid replacement or side-to-side swapping without confirming S65 applicability, BMW hydraulic diagnostics, circuit checks or a bounded service bulletin.',
  'bmw-m3-elevated-oil-consumption-via-crankcase-ventilation-rings':
    'It combines normal consumption, crankcase ventilation, rings and valve seals into one broad E36 diagnosis and recommends oil viscosity and parts without a measured consumption test, leakage test, engine boundary or BMW repair instruction.',
  'bmw-m3-f80-charge-pipe-2015':
    'It treats tuned-vehicle boost risk as a stock S55 defect, says aftermarket aluminum pipes are essential maintenance and assigns part numbers without a BMW bulletin, production boundary, pressure test or verified repair role.',
  'bmw-m3-f80-crank-hub-2015':
    'It promotes a drilled aftermarket crank-hub kit as mandatory prevention for a catastrophic but unbounded tuning-community failure theory without BMW timing faults, an applicable campaign or a verified stock-vehicle repair path.',
  'bmw-m3-f80-injector-failure-2015':
    'It turns generic misfire symptoms into a model-wide injector defect and promotes higher-flow S63 tuning injectors without injector compensation tests, cylinder-specific faults, VIN-based part selection or BMW repair evidence.',
  'bmw-m3-f80-water-pump-2015':
    'It is internally inconsistent by calling the S55 pump electric and belt-driven, assigns a 60,000-mile preventive interval, and promotes pump, belt and thermostat replacement without BMW cooling faults, flow tests or a campaign.',
  'bmw-m3-g80-adaptive-suspension-2021':
    'It combines software, water intrusion, surges, sensors and dampers under a generic chassis warning and recommends software or corner-by-corner hardware replacement without BMW EDC faults, option scope, measurements or a bulletin.',
  'bmw-m3-g80-charge-pipe-2021':
    'It extrapolates the F80 tuning narrative to the S58, promotes higher-flow aftermarket piping for Stage 2 vehicles and lacks BMW production, pressure-test, fault-code or repair evidence for stock G80 M3s.',
  'bmw-m3-g80-cooling-system-2021':
    'It describes normal bleeding or settling while simultaneously prescribing a 37,000-mile water-pump replacement, combines hoses and pump risk, and has no BMW fault, leak location, production boundary or service bulletin.',
  'bmw-m3-g80-idrive-electronics-2021':
    'It incorrectly labels early 2021 G80 vehicles as iDrive 8, mixes phone, stereo, display and head-unit behavior, and recommends reboot, reflash or expensive hardware replacement without a BMW fault, software level or bulletin.',
  'bmw-m3-g80-s58-carbon-buildup':
    'It converts a general direct-injection mechanism into a scheduled G80 defect and promotes walnut blasting, catch cans and high-RPM driving without BMW measured deposits, adaptation values, fault codes or a service interval.',
  'bmw-m3-power-window-regulator-failure-interior-trim-rattles':
    'It combines unrelated age-related window hardware, door clips, glovebox, sunroof and rear-deck noises across 1995-1999 vehicles without a component-specific diagnosis or official campaign; the separate 2003 E46 anti-pinch recall is captured as a proposal.',
  'bmw-m3-rear-subframe-mounting-points-rear-axle-carrier-panel-cracki':
    'It extrapolates hard-use structural fatigue across all E36 M3s and prescribes welding and reinforcement plates without BMW crack criteria, production scope or an applicable campaign.',
  'bmw-m3-s55-charge-pipe-failure':
    'It duplicates the F80 charge-pipe card and repeats the tuning/track failure theory and aftermarket repair list without BMW pressure diagnostics, a service bulletin or a production boundary.',
  'bmw-m3-s55-crank-hub-slip':
    'It duplicates the F80 crank-hub card and promotes capture plates, pinned, keyed or spline-lock kits as essential without BMW timing diagnostics, an applicable campaign or verified repair role.',
  'bmw-m3-s55-water-pump-electric-failure':
    'It merges S55 and S58 generations into one assumed electric-pump lifespan, recommends thermostat replacement and omits pump circuit, flow, temperature and VIN-specific diagnosis; it also duplicates the F80 coolant card.',
  'bmw-m3-s65-rod-bearing-failure':
    'It duplicates the E9x rod-bearing card, repeats unsupported universal clearance figures and a preventive replacement interval, and promotes aftermarket bearings without BMW wear criteria or a campaign.',
  'bmw-m3-s65-throttle-actuator-failure':
    'It duplicates the E9x throttle-actuator card and promotes upgraded or rebuilt units without bank-specific faults, electrical tests, adaptation data or an applicable BMW repair program.',
  'bmw-m3-s65-vanos-solenoid-failure':
    'It duplicates the E9x VANOS-solenoid card and recommends set replacement from broad performance symptoms without S65-specific BMW faults, hydraulic/electrical tests or a bulletin.',
  'bmw-m3-single-vanos-variable-timing-unit-rattle-seal-failure':
    'It incorrectly says the 1995 US M3 had no VANOS, converts age-related noise and seal theories into a universal S52 failure, and promotes aftermarket rebuild kits without BMW timing faults, play measurements or a campaign.',
  'bmw-m3-worn-rear-trailing-arm-bushings-suspension-mounts':
    'It combines normal wear in trailing-arm bushings, shock mounts and powertrain mounts and promotes rubber, polyurethane, spherical and limiter solutions without measured play, alignment change or a component-specific BMW bulletin.',
};

const records = Object.fromEntries(
  Object.entries(frozen).map(([id, metadata]) => [
    id,
    archived({
      ...metadata,
      reason:
        reasons[id] ||
        'The broad failure narrative and universal preventive parts list are not supported for the frozen population by a production-bounded BMW bulletin, recall, measured diagnostic threshold or verified repair role.',
    }),
  ]),
);

records[
  'bmw-m3-brittle-plastic-cooling-system-components-fail-catastrophica'
] = {
  disposition: 'recall-dealer',
  decision:
    'Replace the broad E36 cooling-system catastrophe card with the exact 1995 M3 radiator-cap safety recall 98V-178. Remove its one commerce claim and all three outbound URL occurrences.',
  evidence: [
    {
      type: 'recall',
      label: 'NHTSA Safety Recall 98V-178',
      url: recallUrl('98V178000'),
    },
  ],
  after: {
    years: [1995],
    trims: [],
    engines: ['S50 3.0L inline-six'],
    category: 'cooling',
    title: '1995 M3 Radiator-Cap Safety Recall 98V-178',
    description:
      'NHTSA campaign 98V-178 covers certain 1995 BMW M3 vehicles. If another cooling-system component fails and the driver does not notice the resulting critical overheating, coolant temperature and system pressure can rise enough to damage or fail another cooling component, allowing hot coolant to contact an occupant. This recall does not establish that every E36 plastic cooling component fails at a fixed mileage.',
    solution:
      'Check the VIN for an open 98V-178 campaign. An authorized BMW dealer installs the redesigned radiator cap, which controls pressure and provides greater coolant overflow during overheating. Stop safely if an overheating warning appears and do not open a hot cooling system. ShowMeTheParts resolves exact 1995 M3 3.0-liter fitment and a radiator-cap candidate, but catalog fitment does not establish recall applicability or replace the free recall remedy.',
    severity: 'high',
    confidence: 'high',
    source: 'nhtsa-verified',
    symptoms: [
      'Critical engine-overtemperature indication',
      'Coolant-system overpressure following another cooling-system malfunction',
      'Coolant overflow or leakage during overheating',
    ],
    affectedSystems: [
      'radiator pressure cap',
      'engine cooling system',
    ],
    dtcCodes: [],
    citations: [
      {
        type: 'recall',
        title: 'NHTSA Safety Recall 98V-178',
        url: recallUrl('98V178000'),
      },
    ],
    summary:
      'Replaced the broad E36 cooling-system claim with the exact 1995 radiator-cap recall and removed 1 commerce claim with 3 URLs.',
  },
};

records['bmw-m3-e9x-idle-control-2008'] = {
  disposition: 'diagnosis-hold',
  decision:
    'Replace the all-year idle-control claim and false recall statement with BMW SIB 01 03 16, a VIN- and production-bounded warranty extension for certain model-year 2013 E92/E93 M3 vehicles. Remove both commerce claims and all four URLs.',
  evidence: [
    {
      type: 'tsb',
      label:
        'BMW SIB 01 03 16 - S65 Idle Control Device Limited Warranty Extension',
      url: 'https://static.nhtsa.gov/odi/tsbs/2016/MC-10151158-9999.pdf',
    },
  ],
  after: {
    years: [2013],
    trims: [],
    engines: ['S65 4.0L V8'],
    category: 'engine',
    title: '2013 S65 Idle-Control-Device Warranty Extension',
    description:
      'BMW SIB 01 03 16 extends the engine idle control device limited warranty to 10 years or 120,000 miles for eligible US-specification model-year 2013 E92 M3 Coupes produced June 30, 2012 through June 27, 2013 and E93 M3 Convertibles produced February 22, 2012 through October 1, 2013. It is not a recall and does not establish all 2008-2013 M3 vehicles as affected.',
    solution:
      'Confirm the exact model, production date and VIN-specific warranty comment and repair history before diagnosis. For a confirmed eligible failure, an authorized BMW center performs the BMW test module and replaces the idle control device when required. Do not infer coverage from rough idle alone. ShowMeTheParts resolves exact 2013 M3 4.0-liter fuel-injection fitment but returned no idle-control-valve candidate; catalog output would not establish failure or coverage.',
    severity: 'medium',
    confidence: 'high',
    source: 'nhtsa-verified',
    symptoms: [
      'Idle-control complaint on an eligible model-year 2013 vehicle',
      'Idle-control-device failure confirmed by BMW diagnosis',
    ],
    affectedSystems: [
      'S65 engine idle control device',
      'DME idle control',
    ],
    dtcCodes: [],
    citations: [
      {
        type: 'tsb',
        title:
          'BMW SIB 01 03 16 - S65 Idle Control Device Limited Warranty Extension',
        url: 'https://static.nhtsa.gov/odi/tsbs/2016/MC-10151158-9999.pdf',
      },
    ],
    summary:
      'Narrowed the idle-control card to BMW\'s exact 2013 production and warranty scope and removed 2 commerce claims with 4 URLs.',
  },
};

records['bmw-m3-g80-integrated-brake-system-recall'] = {
  disposition: 'recall-dealer',
  decision:
    'Correct the G80 integrated-brake recall to model year 2021 only, remove unrelated later recall citations and false emissions DTCs, and remove both ABS-sensor commerce claims and both URLs.',
  evidence: [
    {
      type: 'recall',
      label:
        'BMW SIB 34 02 21 / NHTSA Recall 21V-062 - Integrated Brake System',
      url: 'https://static.nhtsa.gov/odi/rcl/2021/RCRIT-21V062-2025.pdf',
    },
  ],
  after: {
    years: [2021],
    trims: [],
    engines: [],
    category: 'brakes',
    title: '2021 G80 Integrated Brake System Recall 21V-062',
    description:
      'BMW SIB 34 02 21 and NHTSA campaign 21V-062 cover certain 2021 G80 M3 vehicles. The integrated-brake control unit may not have been produced to specification; during hard braking, the internal rotor and shaft can separate, reducing braking assistance, disabling ABS and increasing stopping distance. Applicability is VIN-specific.',
    solution:
      'Check the VIN for an open 21V-062 campaign. If open, an authorized BMW dealer replaces the integrated brake system free of charge and performs the required programming. A stiff pedal or brake warning during hard braking requires safely stopping and arranging assistance. Do not replace wheel-speed sensors from this card. ShowMeTheParts resolves exact 2021 M3 brake-hydraulics fitment but returned no brake-booster candidate; catalog output cannot establish recall applicability.',
    severity: 'high',
    confidence: 'high',
    source: 'nhtsa-verified',
    symptoms: [
      'Stiff brake pedal during hard braking',
      'Reduced braking assistance',
      'ABS unavailable',
      'Brake warning lamp',
      'Extended stopping distance',
    ],
    affectedSystems: [
      'integrated brake system control unit',
      'brake assistance',
      'anti-lock braking system',
    ],
    dtcCodes: [],
    citations: [
      {
        type: 'recall',
        title:
          'BMW SIB 34 02 21 / NHTSA Recall 21V-062 - Integrated Brake System',
        url: 'https://static.nhtsa.gov/odi/rcl/2021/RCRIT-21V062-2025.pdf',
      },
    ],
    summary:
      'Corrected the G80 recall to model year 2021, removed unrelated citations and false DTCs, and removed 2 commerce claims with 2 URLs.',
  },
};

const proposalCampaigns = [
  ['bmw-e36-m3-brake-light-switch-recall', '96V111000'],
  ['bmw-e36-m3-occupant-crash-protection-recall', '94V151000'],
  ['bmw-e36-m3-throttle-cruise-cable-recall', '97V131000'],
  ['bmw-e36-m3-side-airbag-sensitivity-recall', '99V063001'],
  ['bmw-e46-m3-takata-airbag-recall-20v018', '20V018000'],
  ['bmw-e46-m3-replacement-driver-airbag-recall', '17V047000'],
  ['bmw-e46-m3-passenger-airbag-recall-14v428', '14V428000'],
  ['bmw-e46-m3-driver-airbag-recall-15v318', '15V318000'],
  ['bmw-e46-m3-passenger-airbag-recall-13v172', '13V172000'],
  ['bmw-e46-m3-parking-brake-screw-recall', '01V245000'],
  ['bmw-e46-m3-window-antipinch-recall', '03V160000'],
  ['bmw-e9x-m3-takata-driver-airbag-recall-20v017', '20V017000'],
  ['bmw-e9x-m3-driver-airbag-recall-16v071', '16V071000'],
  ['bmw-e9x-m3-blower-wiring-overheat-recall', '17V676000'],
  ['bmw-e9x-m3-positive-battery-cable-recall', '19V472000'],
  ['bmw-e9x-m3-dct-software-recall', '08V595000'],
  ['bmw-f80-m3-reused-rear-subframe-bolt-recall', '16V653000'],
  ['bmw-f80-m3-driveshaft-slip-joint-recall', '15V782000'],
  ['bmw-f80-m3-driveshaft-flange-recall', '18V713000'],
  ['bmw-f80-m3-head-airbag-inflator-recall', '24V288000'],
  ['bmw-g80-m3-passenger-seatbelt-alr-recall', '21V554000'],
  ['bmw-g80-m3-front-seatbelt-buckle-bolt-recall', '21V298000'],
  ['bmw-g80-m3-replacement-ecu-programming-recall', '23V118000'],
];

const controlledDeltaProposals = proposalCampaigns.map(
  ([title, campaign]) => ({
    disposition: 'proposal-only',
    insert: false,
    title,
    sources: [recallCorpus(campaign)],
  }),
);

const config = {
  label: 'BMW M3',
  make: 'BMW',
  model: 'M3',
  batchId: 'bmw-m3-full-record-cohort-17-2026-07-31',
  auditDate: '2026-07-31',
  snapshotHash:
    'c1996c77e72513a9266abc571ae946f1327cee06d70036b6e47b13e5a5c4bd4d',
  sourceSnapshotFileHash:
    'e591dd33f224f7f361f0de163c797673ce040bbbe7ad0d668519898f92742044',
  packetFileHash:
    '830cd7ebed86350293e5298cb6fc03efa3baef0bc8eb13dfa0655c1e2d07353a',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/bmw-m3/c1996c77e725/all-0001.json',
  reviewTokens: {
    blind: 'bmwm3_blind:self-no-blocker',
    edge: 'bmwm3_edge:self-no-blocker',
  },
  expectedIds: Object.keys(frozen),
  records,
  expectedTelemetry: {
    claimCount: 72,
    urlCount: 116,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    remove: 29,
    'recall-dealer': 2,
    'diagnosis-hold': 1,
  },
  expectedPublished: 3,
  expectedArchived: 29,
  controlledDeltaProposals,
  expectedProposalIdentities: proposalCampaigns.map(
    ([title, campaign]) => `${title}::${recallCorpus(campaign)}`,
  ),
};

config.assertReviewedAfterState = function assertReviewedAfterState(
  issues,
) {
  const publishedScopes = {
    'bmw-m3-brittle-plastic-cooling-system-components-fail-catastrophica':
      [1995],
    'bmw-m3-e9x-idle-control-2008': [2013],
    'bmw-m3-g80-integrated-brake-system-recall': [2021],
  };
  if (
    issues.some((issue) => {
      const years = publishedScopes[issue.id];
      return (
        issue.after.status !==
          (years ? 'published' : 'archived') ||
        JSON.stringify(issue.after.years) !==
          JSON.stringify(
            years || config.records[issue.id].after.years,
          )
      );
    })
  ) {
    throw new Error('BMW M3 reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
