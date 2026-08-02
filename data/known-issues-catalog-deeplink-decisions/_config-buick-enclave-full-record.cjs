const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const sources = {
  wavePlateCoverage: {
    type: 'tsb',
    title: 'GM Special Coverage 14404 - Transmission Clutch Wave Plate',
    url: 'https://static.nhtsa.gov/odi/tsbs/2015/SB-10057637-4073.pdf',
  },
  wavePlateTechnical: {
    type: 'tsb',
    title: 'GM Bulletin 09-07-30-012F - Broken 3-5-Reverse Clutch Wave Plate',
    url: 'https://static.nhtsa.gov/odi/tsbs/2012/SB-10062512-7690.pdf',
  },
  pcvDeposits: {
    type: 'tsb',
    title: 'GM Preliminary Information PI0746 - PCV, Ice and Oil Deposits',
    url: 'https://static.nhtsa.gov/odi/tsbs/2014/SB-10044850-2033.pdf',
  },
  waterIntrusion: {
    type: 'tsb',
    title: 'GM Bulletin 08-08-57-003F - A-Pillar Water Intrusion and Electrical Concerns',
    url: 'https://static.nhtsa.gov/odi/tsbs/2015/MC-10113649-9999.pdf',
  },
  steeringCoverage: {
    type: 'tsb',
    title: 'GM Special Coverage 14329B - Loss of Power Steering Assist',
    url: 'https://static.nhtsa.gov/odi/tsbs/2015/MC-10123499-9999.pdf',
  },
  cylinderHead: {
    type: 'tsb',
    title: 'GM Preliminary Information PIP5674 - Cylinder-Head Porosity',
    url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10165866-9999.pdf',
  },
  rearEvaporator: {
    type: 'tsb',
    title: 'GM Preliminary Information PIT5335A - Rear Evaporator Refrigerant Leak',
    url: 'https://static.nhtsa.gov/odi/tsbs/2015/MC-10114651-9999.pdf',
  },
  timingChain: {
    type: 'tsb',
    title: 'GM Special Coverage 11340C - Timing Chain Wear',
    url: 'https://static.nhtsa.gov/odi/tsbs/2012/SB-10063069-7690.pdf',
  },
  transmissionSoftware: {
    type: 'tsb',
    title: 'GM Bulletin 18-NA-379 - P2731 Transmission Software Anomaly',
    url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10158830-9999.pdf',
  },
  tcc2018: {
    type: 'tsb',
    title: 'GM Bulletin 18-NA-091 - Low-Speed TCC Shudder',
    url: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10187432-9999.pdf',
  },
  tcc2019To2021: {
    type: 'tsb',
    title: 'GM Preliminary Information PIP5608F - TCC Shudder, Surge, Fishbite or Chuggle',
    url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10201297-9999.pdf',
  },
  waterPump: {
    type: 'tsb',
    title: 'GM Special Coverage 13091 - Water Pump Shaft Seal Leaks',
    url: 'https://static.nhtsa.gov/odi/tsbs/2013/SB-10052375-9884.pdf',
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
  label: 'Buick Enclave',
  model: 'Enclave',
  slug: 'buick-enclave',
  batchId: 'buick-enclave-full-record-cohort-2-2026-08-02',
  auditDate: '2026-08-02',
  snapshotHash:
    '991abdae63b3e8a088f1390aa51f6a18f19aa81a2914b3540a1e26f6d3fef77d',
  sourceSnapshotFileHash:
    'd82c00ca22d379625ecb893217f7ca25f57d910813f46c091cea5d2977bef833',
  packetFileHash:
    '320075115f4921a804be73807bf5d72379031985be48bcd2f70c7d29317875c8',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/buick-enclave/991abdae63b3/all-0001.json',
  reviewTokens: {
    blind: 'buickenclave_blind:self-no-blocker',
    edge: 'buickenclave_edge:self-no-blocker',
  },
  published: {
    'buick-enclave-6t70-6t75-transmission-wave-plate-failure': {
      disposition: 'replace',
      decision:
        'Narrow the frozen 2008-2012 aggregation to GM\'s documented 2008-2009 Enclave population and replace third-party citations, unsupported cost claims and extra DTCs with Special Coverage 14404 and Bulletin 09-07-30-012F.',
      evidence: evidence(sources.wavePlateCoverage, sources.wavePlateTechnical),
      after: {
        years: [2008, 2009],
        trims: [],
        engines: ['3.6L V6 with 6T70/6T75 automatic transmission'],
        category: 'transmission',
        title:
          '3-5-Reverse Clutch Wave Plate Can Fracture (Special Coverage 14404)',
        description:
          'GM identifies some 2008-2009 Buick Enclave vehicles equipped with a 6T70/6T75 six-speed automatic transmission in which the 3-5-reverse clutch wave plate can crack or fracture. The documented result is loss of reverse, 3rd and 5th gears; drivers may also notice slip, flare or harsh shifts and a check-engine light.',
        solution:
          'Have the transmission concern diagnosed before parts are ordered. GM Bulletin 09-07-30-012F calls for replacing the 3-5-reverse waved clutch plate, cleaning debris from the transmission and inspecting related components rather than automatically replacing the valve body or torque converter. Special Coverage 14404 originally provided 10 years/120,000 miles for VIN-selected vehicles; current campaign history should be checked by a Buick dealer.',
        severity: 'high',
        confidence: 'high',
        symptoms: [
          'No reverse gear',
          'Loss of 3rd or 5th gear',
          'Slip, flare or harsh shifts in 3rd or 5th',
          'Check-engine light',
        ],
        affectedSystems: [
          '3-5-reverse clutch wave plate',
          '6T70/6T75 automatic transmission',
          'transmission filters and speed sensors',
        ],
        dtcCodes: [
          'P0716',
          'P0717',
          'P0776',
          'P0777',
          'P2714',
          'P2715',
          'P2723',
        ],
        estimatedCostLow: null,
        estimatedCostHigh: null,
        typicalMileageLow: 20000,
        typicalMileageHigh: null,
        citations: citations(
          sources.wavePlateCoverage,
          sources.wavePlateTechnical,
        ),
        summary:
          'Corrected wave-plate scope to 2008-2009 6T70/6T75 Enclave vehicles, replaced secondary citations with two GM bulletins and removed unsupported cost and DTC claims.',
      },
    },
    'buick-enclave-excessive-oil-consumption-engine-failure-3-6l': {
      disposition: 'replace',
      decision:
        'Replace the unsupported oil-consumption and catastrophic-engine-failure aggregation, whose cited PIP could not be substantiated for the claimed scope, with GM PI0746\'s exact 2008-2011 cold-weather PCV deposit condition.',
      evidence: evidence(sources.pcvDeposits),
      after: {
        years: [2008, 2009, 2010, 2011],
        trims: [],
        engines: ['3.6L LY7/LLT V6'],
        category: 'engine',
        title: 'Cold-Weather PCV Deposits Can Cause Reduced Power (PI0746)',
        description:
          'GM PI0746 covers 2008-2011 Buick Enclave vehicles with the 3.6L LY7 or LLT engine. After a cold start or low-ambient-temperature driving, condensation can freeze at the throttle-body base while engine vapors, fuel dilution and oil mist collect in the air-inlet duct. The condition can illuminate the MIL and cause poor performance or reduced acceleration.',
        solution:
          'Confirm ice or oil deposits and the applicable DTCs before repair. GM\'s procedure varies by model year but centers on servicing the PCV system: cleaning the PCV orifice and replacing the specified camshaft cover, gasket or insulated PCV tube as directed by current service information.',
        severity: 'medium',
        confidence: 'high',
        symptoms: [
          'Check-engine light',
          'Poor engine performance after a cold start',
          'Reduced acceleration in low ambient temperatures',
          'Ice or oil deposits in the air-inlet duct',
        ],
        affectedSystems: [
          'positive crankcase ventilation system',
          'camshaft covers',
          'air-inlet duct and throttle body',
        ],
        dtcCodes: [
          'P0101',
          'P0171',
          'P0172',
          'P0174',
          'P0175',
          'P1516',
          'P2177',
          'P2178',
          'P2179',
          'P2180',
          'P2187',
          'P2188',
          'P2189',
          'P2190',
        ],
        estimatedCostLow: null,
        estimatedCostHigh: null,
        typicalMileageLow: null,
        typicalMileageHigh: null,
        citations: citations(sources.pcvDeposits),
        summary:
          'Replaced an unsupported oil-consumption/engine-failure aggregation with the exact 2008-2011 GM PI0746 cold-weather PCV deposit condition and year-specific service direction.',
      },
    },
    'buick-enclave-hvac-blend-door-actuator-failure': {
      disposition: 'replace',
      decision:
        'Replace the forum-only blend-door actuator aggregation with GM Bulletin 08-08-57-003F\'s documented 2008-2016 A-pillar water-intrusion condition and its electrical consequences.',
      evidence: evidence(sources.waterIntrusion),
      after: {
        years: [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016],
        trims: [],
        engines: [],
        category: 'electrical',
        title:
          'A-Pillar Water Intrusion Can Cause Electrical Faults (08-08-57-003F)',
        description:
          'GM Bulletin 08-08-57-003F documents water entering the right A-pillar or right-front floor area on 2008-2016 Enclave vehicles. Water may reach the instrument-panel bussed electrical center, producing communication loss, a no-crank/no-start condition, an engine that continues running with the key off or other electrical faults.',
        solution:
          'Water-test the right A-pillar and windshield area, inspect the front drain hoses and check the instrument-panel electrical center for moisture or green corrosion. Repair depends on the confirmed entry path and can include cleaning a sunroof drain, resealing the windshield or resealing the documented plenum seam.',
        severity: 'medium',
        confidence: 'high',
        symptoms: [
          'Wet right-front carpet or evidence of an A-pillar leak',
          'No-crank or no-start condition',
          'Engine continues to run with the key off',
          'Module communication loss or other intermittent electrical concerns',
        ],
        affectedSystems: [
          'right A-pillar and windshield sealing',
          'sunroof drain system',
          'instrument-panel bussed electrical center',
        ],
        dtcCodes: ['P0562', 'P129D', 'P1682', 'B1440'],
        estimatedCostLow: null,
        estimatedCostHigh: null,
        typicalMileageLow: null,
        typicalMileageHigh: null,
        citations: citations(sources.waterIntrusion),
        summary:
          'Replaced a forum-only HVAC actuator claim with GM\'s exact 2008-2016 A-pillar water-intrusion bulletin and removed unsupported mileage and cost estimates.',
      },
    },
    'buick-enclave-loss-power-steering-assist': {
      disposition: 'replace',
      decision:
        'Keep the genuine steering condition but consolidate it into one exact, VIN-bounded card sourced only to GM Special Coverage 14329B; remove generic secondary citations and out-of-date free-repair language.',
      evidence: evidence(sources.steeringCoverage),
      after: {
        years: [2008, 2009, 2010, 2011],
        trims: [],
        engines: [],
        category: 'steering',
        title: 'Intermittent Loss of Steering Assist (Special Coverage 14329B)',
        description:
          'GM Special Coverage 14329B identifies some 2008-2011 Buick Enclave vehicles that can develop power-steering pump wear. The wear can intermittently reduce hydraulic pressure, causing reduced or lost steering assist and much greater steering effort, particularly during low-speed maneuvers.',
        solution:
          'Check fluid level and leaks first because low fluid can mimic the condition. If GM\'s diagnostic conditions confirm pump wear, the documented procedure calls for flushing the system, replacing the power-steering pump and, when not previously updated, installing the steering-gear valve housing. The original 10-year/150,000-mile coverage was VIN-specific; ask a Buick dealer to check campaign and repair history rather than assuming current eligibility.',
        severity: 'high',
        confidence: 'high',
        symptoms: [
          'Intermittently heavy steering',
          'Reduced or lost steering assist during low-speed maneuvers',
          'Manual-level steering effort',
        ],
        affectedSystems: [
          'power-steering pump',
          'hydraulic steering fluid',
          'steering-gear valve housing',
        ],
        dtcCodes: [],
        estimatedCostLow: null,
        estimatedCostHigh: null,
        typicalMileageLow: null,
        typicalMileageHigh: null,
        citations: citations(sources.steeringCoverage),
        summary:
          'Consolidated the Enclave steering issue into exact GM Special Coverage 14329B scope and removed generic citations, unsupported costs and misleading present-tense free-repair language.',
      },
    },
    'buick-enclave-power-steering-recall': {
      disposition: 'replace',
      decision:
        'Replace this duplicate steering card with GM PIP5674\'s distinct 2019 Enclave 3.6L LFY cylinder-head porosity condition, preserving the card count while adding a primary-source-backed issue.',
      evidence: evidence(sources.cylinderHead),
      after: {
        years: [2019],
        trims: [],
        engines: ['3.6L LFY V6'],
        category: 'engine',
        title: 'Cylinder-Head Porosity Can Contaminate Engine Oil (PIP5674)',
        description:
          'GM PIP5674 applies to 2019 Enclave vehicles with the 3.6L LFY engine. Internal porosity near an outer cylinder-head bolt area can allow coolant to contaminate the engine oil, producing a ticking noise, coolant loss, very dark or sticky oil and a check-engine light with cam/crank correlation codes even at low mileage.',
        solution:
          'A technician should inspect the oil, remove the camshaft covers and pressure-test the cooling system while watching the center exhaust-side head-bolt area. If bubbles or coolant confirm porosity, GM directs replacement of the affected cylinder head.',
        severity: 'high',
        confidence: 'high',
        symptoms: [
          'Ticking noise',
          'Coolant loss',
          'Very dark or sticky engine oil at low mileage',
          'Check-engine light',
        ],
        affectedSystems: [
          '3.6L LFY cylinder head',
          'engine oil',
          'engine cooling system',
        ],
        dtcCodes: ['P0016', 'P0017', 'P0018', 'P0019'],
        estimatedCostLow: null,
        estimatedCostHigh: null,
        typicalMileageLow: null,
        typicalMileageHigh: null,
        citations: citations(sources.cylinderHead),
        summary:
          'Replaced a duplicate steering card with GM PIP5674\'s exact 2019 3.6L LFY cylinder-head porosity issue and its pressure-test/replacement procedure.',
      },
    },
    'buick-enclave-rear-c-evaporator-corrosion-refrigerant-leaks': {
      disposition: 'replace',
      decision:
        'Keep the documented rear-evaporator issue but remove unrelated line-leak claims, third-party citations and the incorrect suggestion to replace the blower motor; apply the exact PIT5335A scope and remedy.',
      evidence: evidence(sources.rearEvaporator),
      after: {
        years: [2013, 2014, 2015, 2016],
        trims: [],
        engines: [],
        category: 'hvac',
        title: 'Rear A/C Evaporator Can Corrode and Leak (PIT5335A)',
        description:
          'GM PIT5335A applies to 2013-2016 Buick Enclave vehicles whose air conditioning blows warm with a very low or empty refrigerant charge. When normal diagnostics do not find the leak, copper-bearing brush dust from the rear blower motor may have accelerated corrosion of the rear evaporator and produced a small refrigerant leak.',
        solution:
          'After normal leak diagnosis, test the rear evaporator through the rear auxiliary blower-control-module opening with the specified electronic leak detector. If a leak is confirmed, replace the rear evaporator and blow copper particles and dust off the blower fan cage. GM states that the blower motor itself does not need replacement for this condition.',
        severity: 'low',
        confidence: 'high',
        symptoms: [
          'Air conditioning blows warm',
          'Very low or empty refrigerant charge',
          'No obvious leak found during initial diagnosis',
        ],
        affectedSystems: [
          'rear air-conditioning evaporator',
          'rear blower fan cage',
          'R-134a refrigerant circuit',
        ],
        dtcCodes: [],
        estimatedCostLow: null,
        estimatedCostHigh: null,
        typicalMileageLow: null,
        typicalMileageHigh: null,
        citations: citations(sources.rearEvaporator),
        summary:
          'Corrected the rear-evaporator card to exact 2013-2016 PIT5335A scope, removed unrelated line-leak claims and clarified that the blower motor is cleaned, not replaced.',
      },
    },
    'buick-enclave-stretched-worn-timing-chain-3-6l-v6': {
      disposition: 'replace',
      decision:
        'Narrow the unsupported 2008-2013 timing-chain aggregation to GM Special Coverage 11340C\'s exact 2009 Enclave population and remove unsubstantiated mileage, catastrophic-failure and DTC claims.',
      evidence: evidence(sources.timingChain),
      after: {
        years: [2009],
        trims: [],
        engines: ['3.6L LLT V6'],
        category: 'engine',
        title: 'Premature Timing-Chain Wear (Special Coverage 11340C)',
        description:
          'GM Special Coverage 11340C identifies certain 2009 Buick Enclave vehicles with a 3.6L V6 in which the timing chain could wear prematurely under certain driving conditions and the original oil-change intervals, illuminating the Service Engine Soon light.',
        solution:
          'Confirm the VIN and diagnose whether the timing chain actually requires replacement. GM\'s historical procedure replaced the timing chain when needed; if replacement was not required, dealers checked whether updated ECM/TCM software had already been installed and reprogrammed it when applicable. The original coverage was 10 years/120,000 miles, so current campaign and repair history should be checked rather than assuming eligibility.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Service Engine Soon light caused by timing-chain wear'],
        affectedSystems: [
          'engine timing chain',
          'engine control module calibration',
        ],
        dtcCodes: [],
        estimatedCostLow: null,
        estimatedCostHigh: null,
        typicalMileageLow: null,
        typicalMileageHigh: null,
        citations: citations(sources.timingChain),
        summary:
          'Corrected timing-chain coverage from 2008-2013 to VIN-selected 2009 Enclave vehicles under GM Special Coverage 11340C and removed unsupported mileage, DTC and failure-severity claims.',
      },
    },
    'buick-enclave-timing-chain-2008-2012': {
      disposition: 'replace',
      decision:
        'Replace this duplicate timing-chain and oil-consumption aggregation with GM Bulletin 18-NA-379\'s distinct 2019 9T65 transmission-control software anomaly.',
      evidence: evidence(sources.transmissionSoftware),
      after: {
        years: [2019],
        trims: [],
        engines: ['3.6L LFY V6 with 9T65 M3W automatic transmission'],
        category: 'transmission',
        title: 'P2731 Software Anomaly Can Leave Only 1st or Reverse (18-NA-379)',
        description:
          'GM Bulletin 18-NA-379 applies to 2019 Enclave vehicles with the 3.6L LFY engine and 9T65 M3W automatic transmission. A transmission-control software anomaly can illuminate the MIL, leave only 1st gear or reverse, prevent upshifts, limit the vehicle to about 25 mph or make the 1-2 shift feel momentarily tied up.',
        solution:
          'Confirm DTC P2731 and the documented symptoms before repair. GM directs technicians to update the transmission control module with the latest software and then perform the Service Fast Learn process; the bulletin specifies that no parts are required for this repair.',
        severity: 'high',
        confidence: 'high',
        symptoms: [
          'Only 1st gear or reverse available',
          'No upshift and vehicle limited to about 25 mph',
          'Momentary tie-up during the 1-2 shift',
          'Check-engine light',
        ],
        affectedSystems: [
          '9T65 M3W automatic transmission',
          'transmission control module software',
        ],
        dtcCodes: ['P2731'],
        estimatedCostLow: null,
        estimatedCostHigh: null,
        typicalMileageLow: null,
        typicalMileageHigh: null,
        citations: citations(sources.transmissionSoftware),
        summary:
          'Replaced a duplicate timing-chain/oil-consumption card with GM Bulletin 18-NA-379\'s exact 2019 Enclave P2731 transmission software issue and no-parts reprogramming remedy.',
      },
    },
    'buick-enclave-torque-converter-clutch-shudder': {
      disposition: 'replace',
      decision:
        'Correct the frozen 2014-2020 cross-generation aggregation: GM\'s documented TCC-shudder scope is 2018 under 18-NA-091 and 2019-2021 under PIP5608F, while the 2014-2017 bulletin describes a different non-TCC valve-body shudder.',
      evidence: evidence(sources.tcc2018, sources.tcc2019To2021),
      after: {
        years: [2018, 2019, 2020, 2021],
        trims: [],
        engines: ['3.6L LFY V6 with 9T65 M3W automatic transmission'],
        category: 'transmission',
        title: 'Low-Speed Torque-Converter Clutch Shudder (18-NA-091 / PIP5608F)',
        description:
          'GM documents low-speed torque-converter clutch shudder on 2018-2021 Enclave vehicles with the 9T65 automatic transmission. Drivers may feel a slight shudder, surge, fishbite or chuggle during a light-throttle shift below 40 mph when the TCC reapplies. PIP5608F says 2019-2021 cases may involve excessive assembly lube in the transmission fluid.',
        solution:
          'A technician must confirm TCC slip behavior with a scan tool before applying this repair. For 2018 vehicles, GM calls for the latest TCM calibration, Service Fast Learn and a DEXRON-VI drain and refill. For 2019-2021 vehicles, PIP5608F calls for a DEXRON-VI drain and refill, followed by at least 200 miles of driving to confirm the result.',
        severity: 'medium',
        confidence: 'high',
        symptoms: [
          'Slight shudder during a light-throttle shift below 40 mph',
          'Low-speed surge, fishbite or chuggle',
          'Shudder as the torque-converter clutch reapplies',
        ],
        affectedSystems: [
          '9T65 automatic transmission',
          'torque-converter clutch',
          'transmission fluid and TCM calibration',
        ],
        dtcCodes: [],
        estimatedCostLow: null,
        estimatedCostHigh: null,
        typicalMileageLow: null,
        typicalMileageHigh: null,
        citations: citations(sources.tcc2018, sources.tcc2019To2021),
        summary:
          'Corrected TCC-shudder scope to 2018-2021 9T65 Enclave vehicles using two GM bulletins, separated the 2018 calibration procedure from the 2019-2021 fluid procedure and removed unsupported 2014-2017 claims.',
      },
    },
    'buick-enclave-water-pump-leak-coolant-loss-3-6l-v6': {
      disposition: 'replace',
      decision:
        'Narrow the frozen 2008-2017 wear-item aggregation to GM Special Coverage 13091\'s exact 2008-2010 HFV6 shaft-seal population and replace aftermarket/forum citations and cost estimates with the primary bulletin.',
      evidence: evidence(sources.waterPump),
      after: {
        years: [2008, 2009, 2010],
        trims: [],
        engines: ['3.6L LY7/LLT HFV6'],
        category: 'cooling',
        title: 'Water-Pump Shaft Seal Can Leak (Special Coverage 13091)',
        description:
          'GM Special Coverage 13091 identifies certain 2008-2010 Buick Enclave vehicles with an LY7 or LLT HFV6 engine that may leak coolant from the water-pump shaft seal and experience water-pump failure. GM notes that operation with a low coolant level contributes to the leak and that maintaining the correct coolant level improves shaft-seal reliability.',
        solution:
          'Visually inspect the water pump and diagnose the coolant-loss source before replacement. If the documented shaft-seal leak is confirmed, GM\'s procedure calls for replacing the water pump with new single-use fasteners and restoring the cooling system. The original VIN-specific coverage was 10 years/120,000 miles; ask a Buick dealer to check campaign and repair history.',
        severity: 'medium',
        confidence: 'high',
        symptoms: [
          'Coolant leaking from the water-pump area',
          'Low engine-coolant level',
          'Water-pump failure',
        ],
        affectedSystems: [
          'water-pump shaft seal',
          'engine water pump',
          'engine cooling system',
        ],
        dtcCodes: [],
        estimatedCostLow: null,
        estimatedCostHigh: null,
        typicalMileageLow: null,
        typicalMileageHigh: null,
        citations: citations(sources.waterPump),
        summary:
          'Corrected water-pump scope from 2008-2017 to VIN-selected 2008-2010 HFV6 Enclave vehicles under GM Special Coverage 13091 and removed unsupported cause, cost and aftermarket claims.',
      },
    },
  },
  proposalCampaigns: [],
});
