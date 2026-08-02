const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const sources = {
  rearElectricalCenter: {
    type: 'tsb',
    title: 'GM Special Coverage 18226 / N182155410 - Overheating Fuel Relay or Motor Terminal',
    url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10194133-9999.pdf',
  },
  heatedWasherInitial: {
    type: 'recall',
    title: 'GM Recall 08048 / NHTSA 08V441 - Heated Windshield Washer Module',
    url: 'https://static.nhtsa.gov/odi/rcl/2008/RCMN-08V441-7924.pdf',
  },
  heatedWasherFinal: {
    type: 'recall',
    title: 'NHTSA Recall 10V240 - Heated Washer Fluid Module Final Remedy',
    url: 'https://static.nhtsa.gov/odi/rcl/2010/RCAK-10V240-8931.pdf',
  },
  ignition: {
    type: 'recall',
    title: 'NHTSA Recall 14V355 - Ignition Switch May Move Out of Run',
    url: 'https://static.nhtsa.gov/odi/rcl/2014/RCAK-14V355-9481.pdf',
  },
  clusterIndex: {
    type: 'tsb',
    title: 'NHTSA Manufacturer Communications Index - TSB/Document ID 10020864',
    url: 'https://static.nhtsa.gov/odi/ffdd/tsbs/MFR_COMMS_RECEIVED_2005-2009.zip',
  },
  steeringShaft: {
    type: 'tsb',
    title: 'GM Bulletin 06-02-35-009H - Intermediate Steering Shaft Clunk',
    url: 'https://static.nhtsa.gov/odi/tsbs/2012/SB-10032192-3713.pdf',
  },
  steeringHose: {
    type: 'recall',
    title: 'NHTSA Recall 06V105 - V8 Power-Steering Gear Inlet Hose',
    url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Buick&model=Lucerne&modelYear=2006',
  },
  cableLineContact: {
    type: 'recall',
    title: 'NHTSA Recall 10V553 - Starter or Alternator Cable Contact With Power-Steering Line',
    url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Buick&model=Lucerne&modelYear=2010',
  },
  sunroof: {
    type: 'recall',
    title: 'NHTSA Recall 07V468 - Power Sunroof Can Close After Doors Open',
    url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Buick&model=Lucerne&modelYear=2007',
  },
  throttle: {
    type: 'tsb',
    title: 'GM Special Coverage 14582A - Throttle Body Reduced Power Mode',
    url: 'https://static.nhtsa.gov/odi/tsbs/2015/MC-10135171-9999.pdf',
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
  label: 'Buick Lucerne',
  model: 'Lucerne',
  slug: 'buick-lucerne',
  batchId: 'buick-lucerne-full-record-cohort-8-2026-08-02',
  auditDate: '2026-08-02',
  snapshotHash:
    '991abdae63b3e8a088f1390aa51f6a18f19aa81a2914b3540a1e26f6d3fef77d',
  sourceSnapshotFileHash:
    'd82c00ca22d379625ecb893217f7ca25f57d910813f46c091cea5d2977bef833',
  packetFileHash:
    'b230f1ff1edd676f6ffa2a2510bb95ccac54243b16e84e11411ad53e6a17eafd',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/buick-lucerne/991abdae63b3/all-0001.json',
  reviewTokens: {
    blind: 'buicklucerne_blind:self-no-blocker',
    edge: 'buicklucerne_edge:self-no-blocker',
  },
  published: {
    'buick-lucerne-fuel-pump-relay-overheats-melts-fuse-box': {
      disposition: 'replace',
      decision:
        'Keep the supported rear-electrical-center condition but replace forum and complaint sourcing, fire language and generic relay relocation advice with the current GM 18226 revision\'s exact condition, VIN gate and repair path.',
      evidence: evidence(sources.rearElectricalCenter),
      after: {
        years: [2008, 2009, 2010, 2011],
        trims: [],
        engines: [],
        category: 'fuel',
        title: 'Rear Electrical Center Fuel-Relay Terminal Can Overheat (Coverage 18226)',
        description:
          'GM Special Coverage 18226, reference N182155410, identifies some 2008-2011 Buick Lucerne vehicles whose rear-seat bracket can contact the Rear Electrical Center. Over time, that contact can damage components inside the enclosure, causing melting or overheating, a melting odor, battery drain, a no-start condition or a stall. Vehicle involvement is VIN-specific.',
        solution:
          'Have a Buick dealer check the VIN and inspect the Rear Electrical Center under the bulletin. If damage is present, GM directs replacement of the Rear Electrical Center as needed, repair of affected fuel-pump-relay wiring, use of the specified low-profile relay where applicable, and trimming the Lucerne rear-seat bracket. The bulletin described time- and mileage-limited special coverage, so current payment eligibility must be confirmed with GM.',
        severity: 'high',
        confidence: 'high',
        symptoms: [
          'Melting odor from the rear-seat electrical-center area',
          'Battery drain',
          'No-start condition',
          'Engine stall',
        ],
        affectedSystems: [
          'rear-seat bracket',
          'Rear Electrical Center',
          'fuel-pump relay wiring and relay',
        ],
        dtcCodes: [],
        citations: citations(sources.rearElectricalCenter),
        summary:
          'Rebuilt the fuel-relay card from GM Special Coverage 18226, preserving the supported condition while removing forum sourcing, unsupported fire language and generic relay relocation advice.',
      },
    },
    'buick-lucerne-heated-windshield-washer-fluid-module-fire-risk': {
      disposition: 'replace',
      decision:
        'Keep the genuine heated-washer fire condition but replace secondary reporting with both primary recall stages and make the permanent disable-and-remove procedure from 10V240 the controlling remedy.',
      evidence: evidence(sources.heatedWasherInitial, sources.heatedWasherFinal),
      after: {
        years: [2006, 2007, 2008, 2009],
        trims: ['vehicles equipped with the heated washer fluid system'],
        engines: [],
        category: 'electrical',
        title: 'Heated Washer Fluid Module Can Ignite (Recall 10V240)',
        description:
          'NHTSA Recall 10V240 covers certain 2006-2009 Buick Lucerne vehicles equipped with a heated washer fluid system. An earlier 2008 campaign added an in-line fuse for a printed-circuit-board short, but later thermal incidents arose from a different failure mode in the module\'s thermal-protection feature. The surrounding plastic can melt and the module can ignite, causing a fire.',
        solution:
          'Check the VIN for recall completion. The controlling no-charge remedy permanently disables and removes the heated washer fluid module and adds the updated owner-manual page. An in-line fuse from the earlier 08V441 campaign alone is not the final 10V240 remedy.',
        severity: 'high',
        confidence: 'high',
        symptoms: [
          'Melting or distortion around the heated-washer module',
          'Electrical odor or smoke',
          'Heated-washer module ignition or vehicle fire',
        ],
        affectedSystems: ['heated washer fluid module and its control circuit'],
        dtcCodes: [],
        citations: citations(sources.heatedWasherInitial, sources.heatedWasherFinal),
        summary:
          'Corrected the heated-washer card to the primary 08V441 and 10V240 records, clearly identifying permanent module removal as the final remedy.',
      },
    },
    'buick-lucerne-ignition-switch-can-slip-out-run-position': {
      disposition: 'replace',
      decision:
        'Keep recall 14V355 but replace secondary sourcing and an overbroad switch-replacement implication with the exact key-ring/jarring-event mechanism, safety effects, interim instruction and key-ring/key-insert remedy.',
      evidence: evidence(sources.ignition),
      after: {
        years: [2006, 2007, 2008, 2009, 2010, 2011],
        trims: [],
        engines: [],
        category: 'electrical',
        title: 'Ignition Key Can Move Out of Run (Recall 14V355)',
        description:
          'NHTSA Recall 14V355 covers certain 2006-2011 Buick Lucerne vehicles. Weight on the key ring, road conditions or another jarring event can move the ignition switch out of Run and turn off the engine. Engine power, power-steering assist and power-brake assist can be lost, and the airbags may not deploy in a crash if the key is no longer in Run.',
        solution:
          'Check the VIN for recall completion. GM\'s no-charge remedy installs two 13 mm key rings and a key insert or key-head cover, depending on the key. Until repaired, remove the key fob and every other item from the key ring so only the ignition key remains.',
        severity: 'high',
        confidence: 'high',
        symptoms: [
          'Engine turns off after the key moves out of Run',
          'Loss of power-steering and power-brake assist after shutdown',
        ],
        affectedSystems: [
          'ignition switch and ignition key',
          'engine power and steering/brake assist',
          'airbag enablement',
        ],
        dtcCodes: [],
        citations: citations(sources.ignition),
        summary:
          'Rebuilt the 2006-2011 ignition card from recall 14V355, using the exact failure mechanism, interim instruction and key modification rather than secondary recall summaries.',
      },
    },
    'buick-lucerne-instrument-cluster-hard-to-read-daylight': {
      disposition: 'replace',
      decision:
        'Keep the manufacturer-communication-backed daylight visibility condition but remove complaint-derived crash implications and unsupported universal repair language; NHTSA identifies the exact four-year bulletin population but does not host its repair document.',
      evidence: evidence(sources.clusterIndex),
      after: {
        years: [2006, 2007, 2008, 2009],
        trims: [],
        engines: [],
        category: 'electrical',
        title: 'Instrument Cluster Can Be Difficult to View in Bright Sunlight (TSB 10020864)',
        description:
          'NHTSA\'s manufacturer-communications index lists TSB/Document ID 10020864 for 2006-2009 Buick Lucerne vehicles: the instrument-panel-cluster display may be difficult to view when driving toward bright sunshine. The public NHTSA index does not characterize this as a recall or say that cluster operation itself fails.',
        solution:
          'If the display is difficult to read in bright sunlight, ask a Buick dealer to check the vehicle against TSB/Document ID 10020864 and the current GM service information before replacing the cluster. NHTSA\'s public index supplies the condition and scope but does not host the underlying repair document, so no universal parts remedy is asserted here.',
        severity: 'medium',
        confidence: 'high',
        symptoms: ['Instrument-panel-cluster display is difficult to view toward bright sunshine'],
        affectedSystems: ['instrument panel cluster display'],
        dtcCodes: [],
        citations: citations(sources.clusterIndex),
        summary:
          'Narrowed the daylight-visibility card to NHTSA TSB/Document ID 10020864\'s 2006-2009 scope and removed unsupported crash and universal-replacement claims.',
      },
    },
    'buick-lucerne-intermediate-steering-shaft-clunk-during-slow-turns': {
      disposition: 'replace',
      decision:
        'Keep the supported steering-shaft condition but replace forum/RepairPal evidence and vague inspection advice with GM bulletin 06-02-35-009H\'s exact V6 scope, reproduction condition, exclusion and redesigned-shaft correction.',
      evidence: evidence(sources.steeringShaft),
      after: {
        years: [2006, 2007, 2008, 2009],
        trims: [],
        engines: ['V6 engines RPO L26, L36, LZ9 or LGD'],
        category: 'steering',
        title: 'Intermediate Steering Shaft Can Clunk in Slow Turns (Bulletin 06-02-35-009H)',
        description:
          'GM Bulletin 06-02-35-009H applies to 2006-2009 Buick Lucerne vehicles with the listed V6 engines. Some vehicles can produce a power-steering clunk, bump or rubbing feel/noise during left or right turns at slow speed, most noticeably during parking-lot maneuvers.',
        solution:
          'Have a technician reproduce the bulletin condition and verify engine RPO and applicability. If confirmed, GM directs replacement of the intermediate steering shaft with redesigned shaft assembly 25810450. The bulletin explicitly says not to replace the steering gear for this concern.',
        severity: 'medium',
        confidence: 'high',
        symptoms: [
          'Clunk or bump while turning left or right at slow speed',
          'Rubbing feel or noise during parking-lot maneuvers',
        ],
        affectedSystems: ['intermediate steering shaft'],
        dtcCodes: [],
        citations: citations(sources.steeringShaft),
        summary:
          'Rebuilt the steering-clunk card from GM bulletin 06-02-35-009H, adding exact V6 scope and the redesigned-shaft remedy while excluding steering-gear replacement.',
      },
    },
    'buick-lucerne-northstar-4-6l-v8-head-gasket-head-bolt-thread-failure': {
      disposition: 'replace',
      decision:
        'Replace the article-derived six-year Northstar head-gasket/head-bolt aggregation and engine-rebuild implication with the exact 2006 V8 power-steering inlet-hose recall.',
      evidence: evidence(sources.steeringHose),
      after: {
        years: [2006],
        trims: [],
        engines: ['V8 engine'],
        category: 'steering',
        title: 'Power-Steering Inlet Hose Can Leak (Recall 06V105)',
        description:
          'NHTSA Recall 06V105 covers certain 2006 Buick Lucerne vehicles equipped with a V8 engine. Inadequately crimped power-steering hose connectors can leak fluid. Loss of fluid can remove power-steering assist and increase steering effort at low speed; fluid contacting hot engine parts can also cause an engine-compartment fire.',
        solution:
          'Check the VIN for recall completion. The no-charge recall remedy replaces the power-steering gear inlet hose. Do not infer a Northstar head-gasket or head-bolt repair from steering-fluid loss or overheating symptoms without a separate engine diagnosis.',
        severity: 'high',
        confidence: 'high',
        symptoms: [
          'Power-steering fluid leak',
          'Loss of power-steering assist and increased low-speed effort',
          'Possible engine-compartment fire if fluid contacts hot parts',
        ],
        affectedSystems: ['power-steering gear inlet hose and connectors'],
        dtcCodes: [],
        citations: citations(sources.steeringHose),
        summary:
          'Replaced an unsupported Northstar head-gasket aggregation with the exact 2006 V8 power-steering inlet-hose recall.',
      },
    },
    'buick-lucerne-northstar-head-bolt': {
      disposition: 'replace',
      decision:
        'Replace the duplicate citation-free Northstar head-bolt/coolant-loss card with the exact 2010-2011 V8 cable-to-power-steering-return-line contact recall.',
      evidence: evidence(sources.cableLineContact),
      after: {
        years: [2010, 2011],
        trims: [],
        engines: ['V8 engine'],
        category: 'steering',
        title: 'Starter or Alternator Cable Can Wear Through Steering Line (Recall 10V553)',
        description:
          'NHTSA Recall 10V553 covers certain 2010-2011 Buick Lucerne vehicles equipped with V8 engines. The starter or alternator cable can contact and wear through the power-steering return line, causing a fluid leak. The leak can cause loss of power-steering assist and increased crash risk, or ignite on hot engine parts and cause an engine-compartment fire.',
        solution:
          'Check the VIN for recall completion. A Buick dealer secures and, when necessary, reroutes the affected lines to prevent contact under the no-charge campaign.',
        severity: 'high',
        confidence: 'high',
        symptoms: [
          'Power-steering fluid leak near starter or alternator cable routing',
          'Loss of power-steering assist',
          'Possible engine-compartment fire if leaked fluid reaches hot parts',
        ],
        affectedSystems: [
          'starter or alternator cable routing',
          'power-steering return line',
        ],
        dtcCodes: [],
        citations: citations(sources.cableLineContact),
        summary:
          'Replaced a duplicate citation-free Northstar card with the exact 2010-2011 V8 cable-routing and power-steering-return-line recall.',
      },
    },
    'buick-lucerne-rear-air-self-leveling-suspension-failure': {
      disposition: 'replace',
      decision:
        'Replace the forum-derived six-year air-leveling-system aggregation and generic compressor/shock replacement advice with the exact 2007 power-sunroof compliance recall.',
      evidence: evidence(sources.sunroof),
      after: {
        years: [2007],
        trims: ['vehicles equipped with the affected power sunroof'],
        engines: [],
        category: 'interior',
        title: 'Power Sunroof Can Close After the Doors Are Opened (Recall 07V468)',
        description:
          'NHTSA Recall 07V468 covers certain 2007 Buick Lucerne vehicles that do not comply with the power-operated window and roof-panel requirements of FMVSS 118. The sunroof may remain able to close after the ignition is turned off and the front doors are opened, creating a risk of injury from accidental operation.',
        solution:
          'Check the VIN for recall completion. The no-charge remedy installs a wire harness that corrects the sunroof operating logic.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Power sunroof can close after ignition-off and front-door opening'],
        affectedSystems: ['power sunroof control wiring and retained operation logic'],
        dtcCodes: [],
        citations: citations(sources.sunroof),
        summary:
          'Replaced an unsupported air-suspension aggregation with the exact 2007 power-sunroof compliance recall and wire-harness remedy.',
      },
    },
    'buick-lucerne-throttle-body-throttle-position-sensor-causing-reduced-engin': {
      disposition: 'replace',
      decision:
        'Keep the supported reduced-power condition but replace an aftermarket throttle-body listing and Q&A sourcing with GM Special Coverage 14582A\'s exact 2009-2011 population, symptoms and equipment-specific remedy.',
      evidence: evidence(sources.throttle),
      after: {
        years: [2009, 2010, 2011],
        trims: [],
        engines: [],
        category: 'engine',
        title: 'Throttle-Position Sensor Can Trigger Reduced Power (Coverage 14582A)',
        description:
          'GM Special Coverage 14582A includes some 2009-2011 Buick Lucerne vehicles. The throttle-position sensor can cause rough running, illuminate the malfunction indicator or Engine Reduced Power message, and reduce engine power. Vehicle involvement and throttle-body supplier are VIN- and equipment-specific.',
        solution:
          'Have a Buick dealer check VIN eligibility and diagnose the bulletin condition. For Bosch-equipped vehicles, GM directs replacement of the throttle-body assembly and gasket. For Hitachi-equipped vehicles, the dealer installs the throttle-position-sensor kit and replaces the throttle body only if the sensor kit does not correct the condition. The bulletin\'s 10-year/120,000-mile special-coverage period was time- and mileage-limited, so current payment eligibility must be confirmed with GM.',
        severity: 'high',
        confidence: 'high',
        symptoms: [
          'Rough engine operation',
          'Malfunction indicator or Engine Reduced Power message',
          'Reduced engine power',
        ],
        affectedSystems: ['throttle-position sensor and throttle-body assembly'],
        dtcCodes: [],
        citations: citations(sources.throttle),
        summary:
          'Corrected the reduced-power card to GM Special Coverage 14582A\'s 2009-2011 scope and Bosch-versus-Hitachi repair path, removing aftermarket sourcing.',
      },
    },
  },
  proposalCampaigns: [],
});
