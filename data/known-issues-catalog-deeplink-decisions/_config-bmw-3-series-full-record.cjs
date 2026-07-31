const communicationsCorpus =
  'https://www.nhtsa.gov/nhtsa-datasets-and-apis';

function exactPath({
  oldTitle,
  claims,
  urls,
  evidence,
  years,
  engines,
  category,
  title,
  description,
  solution,
  severity = 'high',
  symptoms,
  systems,
  dtcCodes = [],
  source = 'nhtsa-verified',
}) {
  return {
    disposition: 'diagnosis-hold',
    decision: `Replace the frozen "${oldTitle}" aggregation with the bounded primary-source path below. Remove all ${claims} commerce claims and ${urls} outbound URL occurrences.`,
    evidence,
    after: {
      years,
      trims: [],
      engines,
      category,
      title,
      description,
      solution,
      severity,
      confidence: 'high',
      source,
      symptoms,
      affectedSystems: systems,
      dtcCodes,
      citations: evidence.map((item) => ({
        type: item.type,
        title: item.label,
        url: item.url,
      })),
      summary: `Replaced the frozen "${oldTitle}" card with bounded BMW/NHTSA scope and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

function archived({
  oldTitle,
  idSuffix,
  years,
  category,
  claims,
  urls,
  reason,
}) {
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
      title: `Archived - Unsupported BMW 3 Series ${idSuffix}`,
      description: `The former card asserted "${oldTitle}" across a broad BMW 3 Series population. ${reason}`,
      solution:
        'Do not order parts or apply a universal repair from this archived card. Verify the exact chassis, model year, engine, production date, symptoms, DTCs, open recalls and current BMW service information before diagnosis.',
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
      summary: `Archived the unsupported BMW 3 Series "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'BMW 3 Series',
  make: 'BMW',
  model: '3 Series',
  batchId: 'bmw-3-series-full-record-cohort-2-2026-07-30',
  auditDate: '2026-07-30',
  snapshotHash:
    'ab241d2adbf256d082c3849f63147983d947c9ac707ef318b2bb707bbcb610f2',
  sourceSnapshotFileHash:
    'cf3f9ea14c7b1d750e428c90ec003d7ec7cf8b2380beab212d07764d962a1815',
  packetFileHash:
    'ee62411feb567e4dc5cb74b161967c26234960f0df5b0c1da6f1c19a395a2afd',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/bmw-3-series/ab241d2adbf2/all-0001.json',
  reviewTokens: {
    blind: 'bmw3_blind:no-blocker',
    edge: 'bmw3_edge:no-blocker',
  },
  expectedIds: [
    'bmw-3-series-carbon-buildup-2006',
    'bmw-3-series-e36-cooling-system-plastic-failure',
    'bmw-3-series-e36-instrument-cluster-pixel-fade',
    'bmw-3-series-e36-rear-shock-mount-trunk-floor-cracking',
    'bmw-3-series-n20-timing-chain-2012',
    'bmw-3-series-oil-leaks-2006',
    'bmw-3-series-water-pump-2006',
    'bmw-3series-absdsc-module-internal-failure-2000',
    'bmw-3series-automatic-transmission-no-reverse--2000',
    'bmw-3series-ccvoil-separator-failure-causing-2000',
    'bmw-3series-cooling-system-expansion-tank-2000',
    'bmw-3series-final-stage-unit-fsu-2000',
    'bmw-3series-front-control-arm-bushings-2000',
    'bmw-3series-gm5-body-control-module-2000',
    'bmw-3series-ignition-coil-pack-failure-2000',
    'bmw-3series-rear-subframe-trunk-2000',
    'bmw-3series-window-regulator-cable-and-2000',
    'bmw-driveshaft-flex-disc-e90',
    'bmw-n54-hpfp',
    'bmw-n55-boost-solenoid-2012',
    'bmw-n55-carbon-buildup-2012',
    'bmw-n55-charge-pipe-2012',
    'bmw-n55-injector-2012',
    'bmw-n55-oil-filter-housing-2012',
    'bmw-n55-valve-cover-2012',
    'bmw-n55-vanos-2012',
    'bmw-n55-water-pump-2012',
  ],
  records: {
    'bmw-3-series-carbon-buildup-2006': archived({
      oldTitle:
        'Carbon Buildup on Intake Valves (Direct Injection Engines)',
      idSuffix: 'Direct-Injection Carbon Aggregation',
      years: [
        2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016,
        2017, 2018, 2019, 2020, 2021, 2022, 2023,
      ],
      category: 'engine',
      claims: 1,
      urls: 1,
      reason:
        'The frozen card combines five engine families and multiple generations, asserts mandatory walnut blasting at a fixed interval, and cites no matching BMW communication that establishes one population-wide defect or remedy.',
    }),
    'bmw-3-series-e36-cooling-system-plastic-failure': archived({
      oldTitle:
        'E36 plastic cooling system components turn brittle and fail catastrophically by 75,000-100,000 miles',
      idSuffix: 'E36 Cooling-System Aggregation',
      years: [1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999],
      category: 'cooling',
      claims: 3,
      urls: 5,
      reason:
        'The frozen card turns age-related maintenance anecdotes into a universal catastrophic-failure interval and prescribes a multi-part replacement package without a production-bounded BMW bulletin.',
    }),
    'bmw-3-series-e36-instrument-cluster-pixel-fade': archived({
      oldTitle:
        'Instrument cluster LCD pixels fade and disappear (the canonical E36 dash display failure)',
      idSuffix: 'E36 Instrument-Display Aggregation',
      years: [1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999],
      category: 'electrical',
      claims: 1,
      urls: 1,
      reason:
        'No exact BMW communication was found that supports the claimed all-E36 LCD population, failure mechanism and mail-in repair path.',
    }),
    'bmw-3-series-e36-rear-shock-mount-trunk-floor-cracking': archived({
      oldTitle:
        'Rear shock mounts crack the trunk floor / wheelwell sheet metal (worse on non-M3 trims without factory reinforcement)',
      idSuffix: 'E36 Rear-Shock-Mount Aggregation',
      years: [1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999],
      category: 'suspension',
      claims: 3,
      urls: 5,
      reason:
        'The frozen card combines mount wear, body-sheet-metal cracking and trim comparisons without an exact BMW source establishing its broad scope or the asserted reinforcement remedy.',
    }),
    'bmw-3-series-n20-timing-chain-2012': exactPath({
      oldTitle:
        'N20 Timing Chain Guide Failure (Catastrophic) - F30 320i/328i',
      claims: 2,
      urls: 4,
      evidence: [
        {
          type: 'tsb',
          label:
            'BMW SIB 11 03 17 - N20/N26 Timing-Chain and Oil-Pump Drive-Chain Limited Warranty Extension',
          url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10186213-9999.pdf',
        },
      ],
      years: [2012, 2013, 2014, 2015],
      engines: ['N20', 'N26'],
      category: 'engine',
      title:
        'Lower-Engine Whine Requires N20/N26 Timing-Chain Diagnosis',
      description:
        'BMW SIB 11 03 17 identifies specified F30, F31 and F34 3 Series variants with N20 or N26 engines produced through February 2015. A whining noise from the lower engine area that rises with engine speed can be associated with wear in the timing-chain or oil-pump drive-chain system; the bulletin does not declare every 2012-2015 3 Series defective.',
      solution:
        'Confirm the exact chassis, engine, production date and VIN eligibility, then have a BMW-qualified technician reproduce the noise and follow the current BMW diagnostic procedure before replacing anything. The historical seven-year/70,000-mile coverage was a limited warranty extension, not a recall, and is not a current coverage promise. ShowMeTheParts returned no exact 2014 328i timing-chain candidate, so no commerce link is approved.',
      symptoms: [
        'Whining from the lower engine area',
        'Noise frequency increases with engine speed',
      ],
      systems: ['timing-chain drive', 'oil-pump drive chain'],
    }),
    'bmw-3-series-oil-leaks-2006': archived({
      oldTitle: 'Valve Cover Gasket and Oil Filter Housing Gasket Leaks',
      idSuffix: 'Multi-Generation Oil-Leak Aggregation',
      years: [
        2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016,
        2017, 2018, 2019, 2020, 2021, 2022, 2023,
      ],
      category: 'engine',
      claims: 3,
      urls: 5,
      reason:
        'The frozen card combines six engine families, two leak locations and eighteen model years into one replacement claim. The exact N55 oil-filter-housing service action is retained separately below.',
    }),
    'bmw-3-series-water-pump-2006': archived({
      oldTitle: 'Electric Water Pump Failure (All Engines)',
      idSuffix: 'All-Engine Water-Pump Aggregation',
      years: [
        2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016,
        2017, 2018, 2019, 2020, 2021, 2022, 2023,
      ],
      category: 'cooling',
      claims: 2,
      urls: 4,
      reason:
        'The frozen card claims one failure mode and interval for every engine over eighteen model years. The bounded E92/E93 N54T/N55 settlement population is retained separately below.',
    }),
    'bmw-3series-absdsc-module-internal-failure-2000': archived({
      oldTitle:
        'ABS/DSC Module Internal Failure Causing Warning Lights and Loss of Stability/Speed Signal Functions',
      idSuffix: 'E46 ABS/DSC Module Aggregation',
      years: [2000, 2001, 2002, 2003, 2004, 2005],
      category: 'brakes',
      claims: 1,
      urls: 3,
      reason:
        'The frozen card attributes several warning and signal faults to one internal module failure without a matching BMW bulletin or a diagnostic path that rules out sensors, wiring and hydraulic faults.',
    }),
    'bmw-3series-automatic-transmission-no-reverse--2000': archived({
      oldTitle:
        'Automatic Transmission No-Reverse / Failsafe Due to ZF 5HP19 Drum and Valve Body Wear',
      idSuffix: 'E46 No-Reverse Transmission Aggregation',
      years: [2000, 2001, 2002, 2003, 2004, 2005],
      category: 'transmission',
      claims: 1,
      urls: 3,
      reason:
        'The frozen card assigns multiple symptoms to ZF drum and valve-body wear across an unspecified transmission population and prescribes overhaul choices without an exact BMW diagnostic communication.',
    }),
    'bmw-3series-ccvoil-separator-failure-causing-2000': exactPath({
      oldTitle:
        'CCV/Oil Separator Failure Causing Vacuum Leaks, Oil Consumption, and Cold-Weather Hydrolock Risk',
      claims: 1,
      urls: 3,
      evidence: [
        {
          type: 'tsb',
          label:
            'BMW SIB 11 08 03 - M54 Oil Separator in Cold-Climate Conditions',
          url: 'https://bmwrepairguide.com/sib/110803.pdf',
        },
      ],
      years: [2001, 2002, 2003, 2004, 2005],
      engines: ['M54'],
      category: 'engine',
      title:
        'Cold-Climate M54 Oil-Separator Freezing Requires Inspection',
      description:
        'BMW SIB 11 08 03 applies to E46 3 Series vehicles with the M54 engine in very cold climates. Moisture can freeze in the oil separator, its hoses or the dipstick-guide-tube restriction, creating excessive crankcase pressure or an oil-hydrolock condition; this is not a blanket vacuum-leak claim for every E46 or M52TU engine.',
      solution:
        'If cold-weather operation is followed by oil leakage, a damaged valve cover, abnormal crankcase behavior or a no-crank condition, stop and have a BMW-qualified technician inspect the oil separator, hoses and dipstick guide tube before further starting attempts. Follow the bulletin correction for the exact drivetrain. ShowMeTheParts resolved five 2004 330i crankcase-vent candidates, but catalog fitment does not prove the fault or remedy and no commerce link is approved.',
      symptoms: [
        'Oil leakage after extreme cold',
        'Damaged or leaking valve cover',
        'Engine may not crank after an oil-hydrolock event',
      ],
      systems: ['crankcase ventilation', 'oil separator', 'dipstick guide tube'],
    }),
    'bmw-3series-cooling-system-expansion-tank-2000': archived({
      oldTitle: 'Cooling System Expansion Tank and Plastic Radiator Neck Cracking',
      idSuffix: 'E46 Expansion-Tank Aggregation',
      years: [2000, 2001, 2002, 2003, 2004, 2005],
      category: 'cooling',
      claims: 3,
      urls: 5,
      reason:
        'The frozen card combines multiple plastic cooling components, asserts a mileage deadline and prescribes a full refresh package without a matching BMW population or diagnostic communication.',
    }),
    'bmw-3series-final-stage-unit-fsu-2000': archived({
      oldTitle:
        'Final Stage Unit (FSU) Blower Resistor Failure Causing HVAC Fan Malfunctions and Battery Drain',
      idSuffix: 'E46 Blower-Final-Stage Aggregation',
      years: [2000, 2001, 2002, 2003, 2004, 2005],
      category: 'electrical',
      claims: 3,
      urls: 5,
      reason:
        'The frozen card treats varied blower and battery-drain symptoms as proof of one component without an exact BMW bulletin or diagnostic exclusions.',
    }),
    'bmw-3series-front-control-arm-bushings-2000': archived({
      oldTitle:
        'Front Control Arm Bushings and Ball Joint Wear Causing Shimmy Under Braking',
      idSuffix: 'E46 Front-Control-Arm Aggregation',
      years: [2000, 2001, 2002, 2003, 2004, 2005],
      category: 'suspension',
      claims: 3,
      urls: 5,
      reason:
        'The frozen card combines normal wear items and braking vibration into a population-wide defect and parts package without a BMW-defined failure scope.',
    }),
    'bmw-3series-gm5-body-control-module-2000': archived({
      oldTitle:
        'GM5 Body Control Module Relay Failure Causing Door Lock, Interior Light, and Remote Entry Problems',
      idSuffix: 'E46 GM5 Module Aggregation',
      years: [2000, 2001, 2002, 2003, 2004, 2005],
      category: 'electrical',
      claims: 1,
      urls: 3,
      reason:
        'The frozen card attributes several body-electrical symptoms to relays inside one module and recommends third-party rebuild service without an exact BMW diagnostic communication.',
    }),
    'bmw-3series-ignition-coil-pack-failure-2000': exactPath({
      oldTitle:
        'Ignition Coil Pack Failure Causing Misfires and Check Engine Light on M52TU/M54 Engines',
      claims: 1,
      urls: 3,
      evidence: [
        {
          type: 'recall',
          label:
            'BMW SIB 12 13 05 - Voluntary Emissions Recall 05E-A01 for BREMI Ignition Coils',
          url: 'https://bmwrepairguide.com/sib/121305.pdf',
        },
      ],
      years: [2003, 2004, 2005],
      engines: ['M54', 'M56'],
      category: 'engine',
      title:
        'Certain M54/M56 BREMI Ignition Coils Require a Campaign Check',
      description:
        'BMW SIB 12 13 05 covers specified E46 vehicles with M54 or M56 engines produced from September 2002 through November 29, 2004. Internal insulation failure in affected BREMI coils can reduce ignition output or cause coil failure, erratic engine performance and a service-engine-soon lamp; eligibility is production- and VIN-specific.',
      solution:
        'Have a BMW dealer check the VIN and campaign history before ordering coils. On an eligible vehicle, follow campaign 05E-A01 to inspect and replace coils as required, then complete the specified verification. ShowMeTheParts resolved fifteen 2004 330i ignition-coil candidates, but candidate fitment does not identify an affected BREMI coil or prove the recall remedy, so no commerce link is approved.',
      symptoms: [
        'Erratic engine performance',
        'Reduced ignition firing power',
        'Service-engine-soon lamp',
      ],
      systems: ['ignition coils', 'engine management'],
      source: 'recall-related',
    }),
    'bmw-3series-rear-subframe-trunk-2000': exactPath({
      oldTitle: 'Rear Subframe / Trunk Floor Mount Cracking and Separation',
      claims: 2,
      urls: 2,
      evidence: [
        {
          type: 'tsb',
          label:
            'BMW SIB 41 01 09 - E46 Rear Axle Support Inspection',
          url: 'https://bmwrepairguide.com/sib/410109.pdf',
        },
      ],
      years: [2000, 2001, 2002, 2003, 2004, 2005],
      engines: [],
      category: 'suspension',
      title:
        'E46 Rear-Axle Carrier Clicking Requires Structural Inspection',
      description:
        'BMW SIB 41 01 09 covers US-specification E46 3 Series vehicles in the 1999-2006 settlement population. A body-structure fracture can form near a rear-axle-carrier mounting point and may produce a distinct click during driveline load reversals; the sound requires inspection and does not by itself establish separation.',
      solution:
        'Avoid hard launches or abrupt load reversals if a click or visible cracking is present, and arrange a lift inspection by a BMW-qualified body or structural-repair facility. Repair depends on production date and damage severity; the historical settlement inspection program is not a current free-repair promise. No commerce part is approved because this is a structural inspection and repair path.',
      symptoms: [
        'Click from the rear axle carrier area',
        'Noise when selecting forward or reverse',
        'Noise during abrupt driveline load reversal',
      ],
      systems: ['rear axle carrier support', 'rear body structure'],
    }),
    'bmw-3series-window-regulator-cable-and-2000': archived({
      oldTitle: 'Window Regulator Cable and Plastic Carrier Failure',
      idSuffix: 'E46 Window-Regulator Aggregation',
      years: [2000, 2001, 2002, 2003, 2004, 2005],
      category: 'electrical',
      claims: 3,
      urls: 5,
      reason:
        'The frozen card presents common window symptoms as one population-wide cable/carrier defect and prescribes a regulator package without an exact BMW diagnostic bulletin.',
    }),
    'bmw-driveshaft-flex-disc-e90': exactPath({
      oldTitle: 'Driveshaft Flex Disc (Guibo) Failure',
      claims: 2,
      urls: 4,
      evidence: [
        {
          type: 'recall',
          label:
            'BMW Recall 17V-067 / SIB 26 01 17 - Rear Driveshaft Flexible Disc',
          url: 'https://static.nhtsa.gov/odi/rcl/2017/RCRIT-17V067-9870.pdf',
        },
      ],
      years: [2011],
      engines: ['N55', 'N54T', 'M57Y'],
      category: 'drivetrain',
      title:
        'Certain 2011 3 Series Need a Rear-Driveshaft Flex-Disc Recall Check',
      description:
        'BMW recall 17V-067 covers specific 2011 E90 335i/335d and E92/E93 335i/335is vehicles produced in early 2011. A rear-driveshaft flexible disc may have insufficient strength and can break, causing loss of propulsion; this is not a wear claim for every E9x 3 Series.',
      solution:
        'Check the VIN for open recall 17V-067 before authorizing driveline parts. BMW instructs dealers to inspect the installed disc revision index and replace it only when required by the campaign. ShowMeTheParts exposed the exact 2011 335i DRIVE SHAFT category but returned no flex-disc candidate; no commerce link is approved for this recall repair.',
      symptoms: [
        'Open recall shown for the VIN',
        'Possible loss of propulsion if the disc breaks',
      ],
      systems: ['rear driveshaft flexible disc', 'driveline'],
      source: 'recall-related',
    }),
    'bmw-n54-hpfp': exactPath({
      oldTitle: 'High Pressure Fuel Pump (HPFP) Failure',
      claims: 2,
      urls: 4,
      evidence: [
        {
          type: 'tsb',
          label:
            'BMW SIB 12 55 06 - N54 High-Pressure Fuel-System Diagnosis and Limited Warranty Extension',
          url: 'https://static.nhtsa.gov/odi/tsbs/2013/MC-10149587-9999.pdf',
        },
      ],
      years: [2007, 2008, 2009, 2010],
      engines: ['N54'],
      category: 'fuel',
      title:
        'N54 Long Crank or Power Loss Requires Fuel-Pressure Diagnosis',
      description:
        'BMW SIB 12 55 06 covers E90, E92 and E93 3 Series vehicles with the N54 engine when long cranking, reduced power, a service-engine-soon lamp or specified fuel-pressure faults are present. BMW requires separating low-pressure supply, sensor, injector, electrical and high-pressure faults; symptoms alone do not prove the high-pressure pump failed.',
      solution:
        'Have a BMW-qualified technician read fault memory and follow the bulletin pressure tests for 2FBF, 29DC, 29F1 or 29F2 before replacing the pump. The historical ten-year/120,000-mile emissions-warranty extension has expired for this population and is not a current coverage promise. ShowMeTheParts resolved three 2009 335i fuel-pump candidates, but catalog fitment is not diagnosis or remedy proof and no commerce link is approved.',
      symptoms: [
        'Long cranking before start',
        'Power loss while driving',
        'Service-engine-soon lamp',
      ],
      systems: [
        'low-pressure fuel supply',
        'high-pressure fuel system',
        'engine management',
      ],
      dtcCodes: ['2FBF', '29DC', '29F1', '29F2'],
    }),
    'bmw-n55-boost-solenoid-2012': archived({
      oldTitle: 'Wastegate/Boost Solenoid Issues',
      idSuffix: 'N55 Boost-Control Aggregation',
      years: [2012, 2013, 2014, 2015, 2016, 2017, 2018],
      category: 'engine',
      claims: 2,
      urls: 4,
      reason:
        'The frozen card combines wastegate, vacuum-line and boost-solenoid diagnoses across seven model years and prescribes replacement without an exact F30 BMW communication.',
    }),
    'bmw-n55-carbon-buildup-2012': archived({
      oldTitle: 'Intake Valve Carbon Buildup',
      idSuffix: 'N55 Intake-Deposit Aggregation',
      years: [2012, 2013, 2014, 2015, 2016, 2017, 2018],
      category: 'engine',
      claims: 1,
      urls: 1,
      reason:
        'The frozen card converts a generic direct-injection maintenance discussion into a fixed walnut-blasting interval without a BMW-defined 3 Series population or diagnostic threshold.',
    }),
    'bmw-n55-charge-pipe-2012': archived({
      oldTitle: 'Charge Pipe Failure/Cracking',
      idSuffix: 'N55 Charge-Pipe Aggregation',
      years: [2012, 2013, 2014, 2015, 2016, 2017, 2018],
      category: 'engine',
      claims: 3,
      urls: 5,
      reason:
        'The frozen card relies on community claims, treats varied boost faults as proof of a cracked pipe and prescribes an aftermarket aluminum upgrade without an exact BMW bulletin.',
    }),
    'bmw-n55-injector-2012': archived({
      oldTitle: 'High-Pressure Fuel Injector Issues',
      idSuffix: 'N55 Injector Aggregation',
      years: [2012, 2013, 2014, 2015, 2016, 2017, 2018],
      category: 'fuel',
      claims: 2,
      urls: 4,
      reason:
        'No matching BMW 3 Series N55 injector campaign or bulletin was found for the frozen seven-year scope, and misfire symptoms do not establish an injector replacement.',
    }),
    'bmw-n55-oil-filter-housing-2012': exactPath({
      oldTitle: 'Oil Filter Housing Gasket Leak',
      claims: 3,
      urls: 5,
      evidence: [
        {
          type: 'tsb',
          label:
            'BMW SIB 11 14 15 - F30 N55 Oil-Filter-Housing Service Action',
          url: 'https://static.nhtsa.gov/odi/tsbs/2016/MC-10150903-9999.pdf',
        },
      ],
      years: [2012],
      engines: ['N55'],
      category: 'engine',
      title:
        'Certain 2012 F30 N55 Vehicles Need an Oil-Filter-Housing Campaign Check',
      description:
        'BMW SIB 11 14 15 covers F30 3 Series vehicles produced from August 2011 through March 2012. The black plastic engine oil-filter housing may fail and create an internal or external oil or coolant leak; a silver aluminum housing requires no action under the service campaign.',
      solution:
        'Check the VIN and service-action history, then have a BMW-qualified technician inspect the housing material and leak source. Under the bulletin, the black plastic housing is replaced while the silver aluminum housing is left in place. ShowMeTheParts returned no exact 2012 335i oil-filter-housing candidate, and the former generic gasket links were removed.',
      symptoms: [
        'External engine-oil leak',
        'External coolant leak',
        'Possible internal oil or coolant leak',
      ],
      systems: ['engine oil-filter housing', 'engine oil system', 'cooling system'],
    }),
    'bmw-n55-valve-cover-2012': archived({
      oldTitle: 'Valve Cover/Gasket Oil Leak',
      idSuffix: 'N55 Valve-Cover Aggregation',
      years: [2012, 2013, 2014, 2015, 2016, 2017, 2018],
      category: 'engine',
      claims: 3,
      urls: 5,
      reason:
        'The frozen card combines gasket seepage, a plastic cover and crankcase ventilation into one failure and fixed replacement package without an exact BMW communication.',
    }),
    'bmw-n55-vanos-2012': exactPath({
      oldTitle: 'VANOS Solenoid/System Issues',
      claims: 3,
      urls: 5,
      evidence: [
        {
          type: 'recall',
          label:
            'BMW Recall 14V-176 / SIB 11 08 14 - N55 VANOS Gear Bolts',
          url: 'https://static.nhtsa.gov/odi/rcl/2014/RCRIT-14V176-4764.pdf',
        },
      ],
      years: [2012],
      engines: ['N55'],
      category: 'engine',
      title:
        'Certain 2012 N55 3 Series Need a VANOS Gear-Bolt Recall Check',
      description:
        'BMW recall 14V-176 includes certain E90, E92 and E93 3 Series vehicles with the N55 engine produced through November 2011. Internal leakage at affected VANOS adjustment units can prevent fast adjustment and leave engine emergency mode and the malfunction warning active; this recall is not a generic solenoid-cleaning diagnosis.',
      solution:
        'Check the VIN for campaign 14V-176 before ordering VANOS solenoids or gears. For an affected vehicle, BMW specifies replacing the VANOS gear bolts and inspecting for loose or broken bolts, with additional gear work only when the campaign procedure requires it. Recall work belongs with an authorized BMW center, so no commerce link is approved.',
      symptoms: [
        'Engine malfunction warning remains active',
        'Engine emergency mode remains active',
      ],
      systems: ['VANOS adjustment units', 'camshaft timing'],
      source: 'recall-related',
    }),
    'bmw-n55-water-pump-2012': exactPath({
      oldTitle: 'Electric Water Pump Failure',
      claims: 3,
      urls: 5,
      evidence: [
        {
          type: 'tsb',
          label:
            'BMW SIB 01 13 21 - E92/E93 Electric Coolant-Pump Settlement and Diagnostic Scope',
          url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10198894-9999.pdf',
        },
      ],
      years: [2012, 2013],
      engines: ['N54T', 'N55'],
      category: 'cooling',
      title:
        '2012-2013 335i/335is Overheat Warnings Need Coolant-Pump Diagnosis',
      description:
        'BMW SIB 01 13 21 identifies 2012-2013 E92/E93 335i, 335is and specified xDrive coupe/convertible vehicles with N54T or N55 engines in the electric coolant-pump settlement population. The bulletin provides a diagnosis-and-repair path when a warning or fault is present; it does not support preventive replacement for every 2012-2018 N55 3 Series.',
      solution:
        'Stop safely if an overheat warning appears and avoid continued operation until the cooling system is checked. Verify the chassis, engine and VIN, read fault memory and follow the current coolant-pump test plan before replacement. Settlement benefits were time-limited. ShowMeTheParts resolved five 2012 335i water-pump candidates, but fitment does not prove failure or remedy, so no commerce link is approved.',
      symptoms: [
        'Engine warning lamp',
        'Engine-overheat warning',
        'Reduced-power operation may accompany overheating',
      ],
      systems: ['electric engine coolant pump', 'engine cooling system'],
    }),
  },
  expectedTelemetry: {
    claimCount: 58,
    urlCount: 104,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    remove: 18,
    'diagnosis-hold': 9,
  },
  expectedPublished: 9,
  expectedArchived: 18,
  controlledDeltaProposals: [
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-3-series-e46-rear-lamp-ground-recall-2002',
      sources: [
        'https://static.nhtsa.gov/odi/rcl/2011/RCSB-11V438-4559.pdf',
      ],
    },
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-3-series-engine-starter-fire-recall-2021',
      sources: [
        'https://static.nhtsa.gov/odi/rcl/2026/RCLRPT-26V056-6534.pdf',
      ],
    },
  ],
  expectedProposalIdentities: [
    'bmw-3-series-e46-rear-lamp-ground-recall-2002::https://static.nhtsa.gov/odi/rcl/2011/RCSB-11V438-4559.pdf',
    'bmw-3-series-engine-starter-fire-recall-2021::https://static.nhtsa.gov/odi/rcl/2026/RCLRPT-26V056-6534.pdf',
  ],
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  const published = {
    'bmw-3-series-n20-timing-chain-2012': {
      years: [2012, 2013, 2014, 2015],
      engines: ['N20', 'N26'],
    },
    'bmw-3series-ccvoil-separator-failure-causing-2000': {
      years: [2001, 2002, 2003, 2004, 2005],
      engines: ['M54'],
    },
    'bmw-3series-ignition-coil-pack-failure-2000': {
      years: [2003, 2004, 2005],
      engines: ['M54', 'M56'],
    },
    'bmw-3series-rear-subframe-trunk-2000': {
      years: [2000, 2001, 2002, 2003, 2004, 2005],
      engines: [],
    },
    'bmw-driveshaft-flex-disc-e90': {
      years: [2011],
      engines: ['N55', 'N54T', 'M57Y'],
    },
    'bmw-n54-hpfp': {
      years: [2007, 2008, 2009, 2010],
      engines: ['N54'],
    },
    'bmw-n55-oil-filter-housing-2012': {
      years: [2012],
      engines: ['N55'],
    },
    'bmw-n55-vanos-2012': {
      years: [2012],
      engines: ['N55'],
    },
    'bmw-n55-water-pump-2012': {
      years: [2012, 2013],
      engines: ['N54T', 'N55'],
    },
  };
  if (
    issues.some((issue) => {
      const expected = published[issue.id];
      return (
        issue.after.status !== (expected ? 'published' : 'archived') ||
        JSON.stringify(issue.after.years) !==
          JSON.stringify(
            expected ? expected.years : config.records[issue.id].after.years,
          ) ||
        JSON.stringify(issue.after.engines) !==
          JSON.stringify(expected ? expected.engines : [])
      );
    })
  ) {
    throw new Error('BMW 3 Series reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
