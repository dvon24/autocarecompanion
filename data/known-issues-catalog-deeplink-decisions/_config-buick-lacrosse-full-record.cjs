const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const sources = {
  ignition: {
    type: 'recall',
    title: 'NHTSA Recall 14V355 - Ignition Switch May Turn Off',
    url: 'https://static.nhtsa.gov/odi/rcl/2014/RCAK-14V355-9481.pdf',
  },
  seatBolt: {
    type: 'recall',
    title: 'GM Safety Recall 14271 / NHTSA 14V447 - Power Seat Height Adjuster Bolt',
    url: 'https://static.nhtsa.gov/odi/rcl/2014/RCRIT-14V447-4068.pdf',
  },
  toeCorrosion: {
    type: 'recall',
    title: 'GM Safety Recall N212346640 - Rear Suspension Toe Link May Break',
    url: 'https://static.nhtsa.gov/odi/rcl/2021/RCSB-21V00F-2798.pdf',
  },
  doorSplice: {
    type: 'recall',
    title: 'GM Recall 14235A / NHTSA 14V317 - Driver Door Wiring Splice',
    url: 'https://static.nhtsa.gov/odi/rcl/2014/RCMN-14V317-6147.pdf',
  },
  generatorModule: {
    type: 'recall',
    title: 'GM Product Safety Recall 13136A / NHTSA 13V173 - Generator Control Module',
    url: 'https://static.nhtsa.gov/odi/rcl/2013/RCMN-13V173-5770.pdf',
  },
  steering: {
    type: 'recall',
    title: 'GM Product Safety Recall 17085 / NHTSA 17V116 - EPS Connector Cable Seal',
    url: 'https://static.nhtsa.gov/odi/rcl/2017/RCSB-17V116-1708.pdf',
  },
  climate: {
    type: 'recall',
    title: 'GM Recall 11057A / NHTSA 11V149 - Electronic Climate Control Software',
    url: 'https://static.nhtsa.gov/odi/rcl/2011/RCRIT-11V149-8822.pdf',
  },
  headlamp: {
    type: 'recall',
    title: 'GM Product Safety Recall 14291 / NHTSA 15V519 - Low-Beam Headlamp Driver Module',
    url: 'https://static.nhtsa.gov/odi/rcl/2015/RCSB-15V519-4439.pdf',
  },
  toeInstall: {
    type: 'recall',
    title: 'NHTSA Recall 17V267 / GM 17168 - Rear Suspension Toe-Link Installation',
    url: 'https://static.nhtsa.gov/odi/rcl/2017/RCAK-17V267-6191.pdf',
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
  label: 'Buick LaCrosse',
  model: 'LaCrosse',
  slug: 'buick-lacrosse',
  batchId: 'buick-lacrosse-full-record-cohort-6-2026-08-02',
  auditDate: '2026-08-02',
  snapshotHash:
    '991abdae63b3e8a088f1390aa51f6a18f19aa81a2914b3540a1e26f6d3fef77d',
  sourceSnapshotFileHash:
    'd82c00ca22d379625ecb893217f7ca25f57d910813f46c091cea5d2977bef833',
  packetFileHash:
    'efbd80579fc27074101ddcaf8a83457a79cf1cf71da56ecf1886304f3c98138f',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/buick-lacrosse/991abdae63b3/all-0001.json',
  reviewTokens: {
    blind: 'buicklacrosse_blind:self-no-blocker',
    edge: 'buicklacrosse_edge:self-no-blocker',
  },
  published: {
    'buick-lacrosse-3-6l-v6-timing-chain-stretch-wear': {
      disposition: 'replace',
      decision:
        'Replace the unsupported timing-chain cause, damage, maintenance and universal repair aggregation with the exact 2005-2009 LaCrosse ignition-key safety recall.',
      evidence: evidence(sources.ignition),
      after: {
        years: [2005, 2006, 2007, 2008, 2009],
        trims: [],
        engines: [],
        category: 'electrical',
        title: 'Ignition Key Can Move Out of Run (Recall 14V355)',
        description:
          'NHTSA Recall 14V355 covers certain 2005-2009 Buick LaCrosse vehicles. Added weight on the key ring, road conditions or another jarring event can move the ignition switch out of Run and turn off the engine. Engine power, power-steering assist and power-brake assist can be lost, and the airbags may not deploy in a crash if the key is no longer in Run.',
        solution:
          'Check the VIN for recall completion. GM\'s no-charge remedy installs two 13 mm key rings and a key insert in the ignition keys. Until the recall is completed, remove all other items and the key fob from the key ring so only the ignition key remains.',
        severity: 'high',
        confidence: 'high',
        symptoms: [
          'Engine turns off after the key moves out of Run',
          'Loss of power-steering and power-brake assist after engine shutdown',
        ],
        affectedSystems: [
          'ignition switch and ignition key',
          'engine power and steering/brake assist',
          'airbag enablement',
        ],
        dtcCodes: [],
        citations: citations(sources.ignition),
        summary:
          'Replaced an unsupported timing-chain aggregation with the exact 2005-2009 LaCrosse 14V355 ignition-key recall and removed speculative engine damage, cost and maintenance claims.',
      },
    },
    'buick-lacrosse-3-8l-v6-lower-intake-manifold-gasket-plastic-coolant-elbow-l': {
      disposition: 'replace',
      decision:
        'Replace the owner/aftermarket-derived intake-gasket and coolant-elbow aggregation, metal-part recommendation and severe-engine-damage claims with primary GM Safety Recall 14271.',
      evidence: evidence(sources.seatBolt),
      after: {
        years: [2011, 2012],
        trims: [],
        engines: [],
        category: 'interior',
        title: 'Power-Seat Height Adjuster Bolt Can Fall Out (Recall 14V447)',
        description:
          'GM Safety Recall 14271, NHTSA 14V447, covers certain 2011-2012 Buick LaCrosse vehicles equipped with power height-adjustable front seats. A bolt securing the front-seat height adjuster can loosen or fall out, causing the seat to drop suddenly to its lowest vertical position. Sudden driver-seat movement can affect control and increase crash risk.',
        solution:
          'Have a Buick dealer check the VIN and replace the affected height-adjuster shoulder bolt with the recall attachment kit. If the passenger seat also has a power height adjuster, the bulletin directs the same replacement there. The recall repair is performed at no charge.',
        severity: 'high',
        confidence: 'high',
        symptoms: [
          'Power front seat suddenly drops to its lowest height',
          'Loose or missing seat height-adjuster bolt',
        ],
        affectedSystems: ['driver and passenger power-seat height adjusters'],
        dtcCodes: [],
        citations: citations(sources.seatBolt),
        summary:
          'Replaced an unsupported coolant-leak aggregation with the exact 2011-2012 power-seat height-adjuster recall and removed aftermarket part and engine-damage advice.',
      },
    },
    'buick-lacrosse-3.6l-timing-chain': {
      disposition: 'replace',
      decision:
        'Replace the duplicate seven-year timing-chain, mileage, cost and oil-interval aggregation with GM Safety Recall N212346640\'s region- and VIN-bounded rear toe-link corrosion condition.',
      evidence: evidence(sources.toeCorrosion),
      after: {
        years: [2010, 2011, 2012, 2013],
        trims: [],
        engines: [],
        category: 'suspension',
        title: 'Rear Toe Links Can Corrode and Fracture (Recall N212346640)',
        description:
          'GM Safety Recall N212346640 covers certain 2010-2013 Buick LaCrosse vehicles that were ever registered in specified high-corrosion U.S. states or Canadian provinces. Improper electrocoating can leave a rear toe link vulnerable to long-term corrosion; the link can thin and eventually fracture, reducing the ability to control the vehicle and increasing crash risk.',
        solution:
          'Because the campaign is VIN- and registration-region-specific, have a Buick dealer check the vehicle\'s recall status even if it later moved. GM directs replacement of both rear adjust links, the adjuster fasteners and a rear alignment under the recall.',
        severity: 'high',
        confidence: 'high',
        symptoms: [
          'Corroded or thinned rear toe link',
          'Rear toe-link fracture with reduced vehicle control',
        ],
        affectedSystems: ['left and right rear suspension adjust links and fasteners'],
        dtcCodes: [],
        citations: citations(sources.toeCorrosion),
        summary:
          'Replaced a duplicate unsupported timing-chain card with the region- and VIN-bounded 2010-2013 N212346640 rear toe-link corrosion recall.',
      },
    },
    'buick-lacrosse-driver-door-wiring-splice-corrosion': {
      disposition: 'replace',
      decision:
        'Keep recall 14V317 but remove unrelated door-jamb repair advice and unsupported rollaway/window-function symptoms, using GM 14235A\'s exact splice effects, harness inspection and repair.',
      evidence: evidence(sources.doorSplice),
      after: {
        years: [2014],
        trims: [],
        engines: [],
        category: 'electrical',
        title: 'Driver-Door Wiring Splice Can Corrode (Recall 14V317)',
        description:
          'GM Recall 14235A, NHTSA 14V317, covers certain 2014 Buick LaCrosse vehicles. An unsealed splice in the driver-door wiring can corrode and break, causing incorrect door-chime and Retained Accessory Power information. The key-in-ignition chime may not sound, or the passenger windows, rear windows and sunroof may remain operable for ten minutes after the ignition is off and the driver door is opened.',
        solution:
          'A Buick dealer checks the VIN and the driver-door window-motor harness tag. A harness produced before the bulletin\'s October 2, 2013 breakpoint receives the documented sealed-jumper splice repair; a later harness requires no further recall action. The recall repair is no charge.',
        severity: 'medium',
        confidence: 'high',
        symptoms: [
          'No chime with the key in the ignition and driver door open',
          'Passenger or rear windows or sunroof remain powered for ten minutes after shutdown and door opening',
        ],
        affectedSystems: [
          'driver-door window-motor harness splice J501',
          'door chime and Retained Accessory Power circuits',
        ],
        dtcCodes: [],
        citations: citations(sources.doorSplice),
        summary:
          'Rebuilt the 2014 door-splice card from GM 14235A, limiting effects and repair to the recall and removing unrelated door-jamb wiring advice.',
      },
    },
    'buick-lacrosse-eassist-12v-battery-drain-service-battery-charging-system-wa': {
      disposition: 'replace',
      decision:
        'Narrow the five-year multi-module battery-drain aggregation to Safety Recall 13136A\'s VIN-selected 2012-2013 eAssist Generator Control Module condition, exact warnings, DTCs and inspect/replace remedy.',
      evidence: evidence(sources.generatorModule),
      after: {
        years: [2012, 2013],
        trims: [],
        engines: ['eAssist powertrain'],
        category: 'electrical',
        title: 'eAssist Generator Control Module Can Fail (Recall 13V173)',
        description:
          'GM Product Safety Recall 13136A, NHTSA 13V173, covers certain 2012-2013 Buick LaCrosse eAssist vehicles. A malfunctioning Generator Control Module can cause gradual loss of battery charge and illuminate the malfunction indicator. If ignored, the engine can stall or fail to start; a burning or melting odor, smoke and possibly a trunk fire can also occur.',
        solution:
          'Check the VIN for the recall and have the dealer perform GM\'s specified Generator Control Module inspection. The dealer replaces the module when the recall test or listed DTCs require it, using the bulletin\'s approved replacement population. Do not substitute a generic 12-volt battery or parasitic-draw repair for this high-voltage recall diagnosis.',
        severity: 'high',
        confidence: 'high',
        symptoms: [
          'Gradual loss of battery charge with malfunction indicator',
          'Engine stall or no-start after warnings are ignored',
          'Burning or melting odor, smoke or fire from the trunk power-pack area',
        ],
        affectedSystems: ['eAssist Generator Control Module and high-voltage power pack'],
        dtcCodes: ['P0CA2', 'P1AF0', 'P1B0B', 'P1E0C', 'P1E12'],
        citations: citations(sources.generatorModule),
        summary:
          'Corrected the eAssist card to 2012-2013 recall 13V173, replacing a five-year multi-module drain narrative with exact GCM symptoms, DTCs and inspect/replace procedure.',
      },
    },
    'buick-lacrosse-electronic-power-steering-connector-corrosion-loss-assist': {
      disposition: 'replace',
      decision:
        'Keep recall 17V116 but replace third-party sourcing and overbroad corrosion/module advice with GM 17085\'s exact unseated cable-seal condition, warnings and seal-seating remedy.',
      evidence: evidence(sources.steering),
      after: {
        years: [2017],
        trims: [],
        engines: [],
        category: 'steering',
        title: 'EPS Connector Cable Seal May Be Unseated (Recall 17V116)',
        description:
          'GM Product Safety Recall 17085, NHTSA 17V116, covers certain 2017 Buick LaCrosse vehicles. A cable seal on one or both electric-power-steering connectors may not be fully seated, allowing water intrusion, corrosion or a high-resistance condition that can melt a connector and cause loss of power assist. Manual steering remains but requires more effort, especially at low speed.',
        solution:
          'Have a Buick dealer confirm the VIN and verify that both EPS connector wire seals are fully seated. GM\'s recall procedure reseats a seal when needed and secures the affected connector wiring with the specified tie and electrical tape; it does not direct automatic EPS-module replacement.',
        severity: 'high',
        confidence: 'high',
        symptoms: [
          'Power-steering malfunction indicator and warning chime',
          'Sudden increase in steering effort, especially at low speed',
        ],
        affectedSystems: ['electric power steering connector wire seals'],
        dtcCodes: [],
        citations: citations(sources.steering),
        summary:
          'Rebuilt the 2017 EPS card from recall 17085/17V116, using the exact connector-seal cause, warnings and reseat/secure remedy and removing third-party citations.',
      },
    },
    'buick-lacrosse-hvac-blower-motor-climate-control-module-failures': {
      disposition: 'replace',
      decision:
        'Replace the unsupported seven-year blower-motor/resistor and connector aggregation with 2011 recall 11057A\'s exact ECC software noncompliance and software-only remedy.',
      evidence: evidence(sources.climate),
      after: {
        years: [2011],
        trims: [],
        engines: [],
        category: 'hvac',
        title: 'HVAC Settings Can Become Unadjustable (Recall 11V149)',
        description:
          'GM Recall 11057A, NHTSA 11V149, covers certain 2011 Buick LaCrosse vehicles. Electronic Climate Control module software can disable the ability to adjust heating, ventilation and air-conditioning settings. If defrost control is lost when needed, driver visibility can decrease and crash risk can increase.',
        solution:
          'Check the VIN for recall completion. GM\'s no-parts remedy is to reprogram the Electronic Climate Control remote heater and air-conditioning control module with the corrected calibration. Do not replace the blower motor or resistor solely from this symptom before verifying recall and software status.',
        severity: 'high',
        confidence: 'high',
        symptoms: [
          'Unable to adjust heating, cooling or ventilation settings',
          'Loss of defrost control',
        ],
        affectedSystems: ['Electronic Climate Control module software'],
        dtcCodes: [],
        citations: citations(sources.climate),
        summary:
          'Replaced a generic 2008-2014 HVAC hardware aggregation with the exact 2011 ECC software recall and its no-parts reprogramming remedy.',
      },
    },
    'buick-lacrosse-intermittent-low-beam-headlight-failure': {
      disposition: 'replace',
      decision:
        'Keep the genuine headlamp condition but correct the years to 2005-2009, remove complaint and connector speculation, and use GM recall 14291\'s exact HDM failure mode and replacement.',
      evidence: evidence(sources.headlamp),
      after: {
        years: [2005, 2006, 2007, 2008, 2009],
        trims: [],
        engines: [],
        category: 'electrical',
        title: 'Low Beams and Daytime Running Lamps Can Fail (Recall 15V519)',
        description:
          'GM Product Safety Recall 14291, NHTSA 15V519, covers certain 2005-2009 Buick LaCrosse vehicles. The headlamp driver module can malfunction in the thermal environment of the underhood electrical center, causing the low-beam headlamps and daytime running lamps to fail intermittently or permanently. High beams, marker lamps, turn signals and fog lamps are not affected.',
        solution:
          'Check the VIN for recall completion. GM directs replacement of the headlamp driver module in the underhood fuse block with the recall service part. Do not substitute unrelated socket, switch or harness replacement without separate diagnosis.',
        severity: 'high',
        confidence: 'high',
        symptoms: [
          'Intermittent or permanent loss of both low-beam headlamps',
          'Daytime running lamps fail while high beams and other exterior lamps remain available',
        ],
        affectedSystems: ['headlamp driver module in the underhood electrical center'],
        dtcCodes: [],
        citations: citations(sources.headlamp),
        summary:
          'Corrected the low-beam card to the full 2005-2009 recall population and exact HDM failure/replacement, removing complaint counts and speculative wiring repairs.',
      },
    },
    'buick-lacrosse-rear-suspension-toe-link-may-loosen-fracture': {
      disposition: 'replace',
      decision:
        'Keep 2017 recall 17V267 but separate it from the unrelated corrosion-region campaigns and remove unsubstantiated clunk, wandering and tire-wear symptoms.',
      evidence: evidence(sources.toeInstall),
      after: {
        years: [2017],
        trims: [],
        engines: [],
        category: 'suspension',
        title: 'Rear Toe Links May Loosen and Disconnect (Recall 17V267)',
        description:
          'NHTSA Recall 17V267, GM 17168, covers certain 2017 Buick LaCrosse vehicles. The rear suspension toe links may have been installed incorrectly, allowing them to loosen and disconnect from the rear suspension. A disconnected toe link can cause loss of vehicle control and increase crash risk. This is separate from the corrosion-region recalls affecting earlier model years.',
        solution:
          'Have a Buick dealer verify the VIN and inspect both rear suspension toe-link assemblies. The recall remedy corrects their installation as necessary at no charge; it does not call for automatic replacement based on the separate earlier-model corrosion campaign.',
        severity: 'high',
        confidence: 'high',
        symptoms: [
          'Rear suspension toe link loosens or disconnects',
          'Sudden reduction in vehicle control after disconnection',
        ],
        affectedSystems: ['left and right rear suspension toe-link assemblies'],
        dtcCodes: [],
        citations: citations(sources.toeInstall),
        summary:
          'Separated 2017 installation recall 17V267 from earlier corrosion recalls and removed unsupported early-warning symptoms and automatic replacement claims.',
      },
    },
  },
  proposalCampaigns: [],
});
