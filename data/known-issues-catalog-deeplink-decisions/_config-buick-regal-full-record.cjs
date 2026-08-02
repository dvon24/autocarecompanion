const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const sources = {
  parkLock: {
    type: 'recall',
    title: 'GM Recall 50491 / NHTSA 16V502 - Replacement Electronic Park Lock Lever',
    url: 'https://static.nhtsa.gov/odi/rcl/2016/RCSB-16V502-2946.pdf',
  },
  shiftCable: {
    type: 'recall',
    title: 'NHTSA Recall 14V092 - Transmission Shift Cable Adjuster',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=14V092000',
  },
  steeringFasteners: {
    type: 'recall',
    title: 'NHTSA Recall 14V409 - Steering and Front-Suspension Fasteners',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=14V409000',
  },
  seatWiring: {
    type: 'recall',
    title: 'GM Recall 30710 / NHTSA 16V517 - Power-Seat Wiring Harness',
    url: 'https://static.nhtsa.gov/odi/rcl/2016/RCSB-16V517-6515.pdf',
  },
  seatBolt: {
    type: 'recall',
    title: 'GM Recall 14271 / NHTSA 14V447 - Power-Seat Height Adjuster Bolt',
    url: 'https://static.nhtsa.gov/odi/rcl/2014/RCRIT-14V447-4068.pdf',
  },
  brakeAssist: {
    type: 'recall',
    title: 'GM Recall N222370090 / NHTSA 22V465 - EBCM Brake-Assist Software',
    url: 'https://static.nhtsa.gov/odi/rcl/2022/RCSB-22V465-7798.pdf',
  },
  toeLink: {
    type: 'recall',
    title: 'NHTSA Recall 26V113 - Regal Turbo and GS Rear Toe Links',
    url: 'https://static.nhtsa.gov/odi/rcl/2026/RCLRPT-26V113-9425.pdf',
  },
  steeringAssist: {
    type: 'recall',
    title: 'GM Recall 21510 / NHTSA 16V108 - Electric Power-Steering Assist',
    url: 'https://static.nhtsa.gov/odi/rcl/2016/RCSB-16V108-9377.pdf',
  },
  generatorModule: {
    type: 'recall',
    title: 'GM Recall 13136A / NHTSA 13V173 - eAssist Generator Control Module',
    url: 'https://static.nhtsa.gov/odi/rcl/2013/RCMN-13V173-5770.pdf',
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
  label: 'Buick Regal',
  model: 'Regal',
  slug: 'buick-regal',
  batchId: 'buick-regal-full-record-cohort-10-2026-08-02',
  auditDate: '2026-08-02',
  snapshotHash:
    '991abdae63b3e8a088f1390aa51f6a18f19aa81a2914b3540a1e26f6d3fef77d',
  sourceSnapshotFileHash:
    'd82c00ca22d379625ecb893217f7ca25f57d910813f46c091cea5d2977bef833',
  packetFileHash:
    'dada63456d3687bb59ec0796c98993d7e0b4462aedd939a985493cf59b4d90c9',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/buick-regal/991abdae63b3/all-0001.json',
  reviewTokens: {
    blind: 'buickregal_blind:self-no-blocker',
    edge: 'buickregal_edge:self-no-blocker',
  },
  published: {
    'buick-regal-2.0t-timing-chain-ltg': {
      disposition: 'replace',
      decision:
        'Replace the citation-free seven-year multi-engine timing-chain aggregation with the VIN-specific 2011 Regal service-parts electronic-park-lock recall.',
      evidence: evidence(sources.parkLock),
      after: {
        years: [2011],
        trims: ['vehicles serviced with an affected replacement ignition/start-switch housing'],
        engines: [],
        category: 'electrical',
        title: 'Replacement Park-Lock Lever May Permit Key Removal Outside Park (Recall 16V502)',
        description:
          'GM Recall 50491, NHTSA 16V502, includes certain 2011 Buick Regal vehicles that may have been serviced with an ignition/start-switch housing containing a damaged electronic park-lock lever. The key may be removable while the transmission is not in Park, allowing the vehicle to roll away as occupants exit.',
        solution:
          'Because this is a service-parts and VIN-specific campaign, have a Buick dealer check recall eligibility. The dealer tests the ignition/start-switch housing and replaces it if the key can be removed in any gear other than Park. The recall repair is performed at no charge.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Ignition key can be removed while the gear selector is outside Park'],
        affectedSystems: ['electronic park-lock lever and ignition/start-switch housing'],
        dtcCodes: [],
        citations: citations(sources.parkLock),
        summary:
          'Replaced an unsupported seven-year timing-chain card with the VIN-specific 2011 service-parts park-lock recall and removed engine-damage and repair assumptions.',
      },
    },
    'buick-regal-6t70-6t40-automatic-transmission-shudder-slipping-hard-shift': {
      disposition: 'replace',
      decision:
        'Replace the forum, aftermarket and trade-publication-derived seven-year transmission-shudder aggregation with the exact 2014 shift-cable-adjuster noncompliance recall.',
      evidence: evidence(sources.shiftCable),
      after: {
        years: [2014],
        trims: ['vehicles equipped with an automatic transmission'],
        engines: [],
        category: 'transmission',
        title: 'Shift Cable Adjuster Can Disengage (Recall 14V092)',
        description:
          'NHTSA Recall 14V092 covers certain 2014 Buick Regal vehicles equipped with automatic transmissions. The transmission shift-cable adjuster can disengage from the shift lever, leaving the indicated selector position different from the actual gear. The driver may select Park while the transmission remains outside Park, creating a rollaway risk.',
        solution:
          'Check the VIN for recall completion. A Buick dealer inspects the transmission shift-cable adjuster and replaces an affected adjuster under the no-charge recall.',
        severity: 'high',
        confidence: 'high',
        symptoms: [
          'Gear-selector position does not match the transmission gear',
          'Unable to shift into the intended gear',
          'Vehicle can roll after the selector is placed in Park',
        ],
        affectedSystems: ['transmission shift cable adjuster and shift lever'],
        dtcCodes: [],
        citations: citations(sources.shiftCable),
        summary:
          'Replaced a broad seven-year transmission-shudder aggregation with the exact 2014 shift-cable-adjuster recall and rollaway remedy.',
      },
    },
    'buick-regal-aisin-af40-transmission': {
      disposition: 'replace',
      decision:
        'Replace the citation-free seven-year Aisin transmission card with the exact 2014 steering and front-suspension fastener torque recall.',
      evidence: evidence(sources.steeringFasteners),
      after: {
        years: [2014],
        trims: [],
        engines: [],
        category: 'steering',
        title: 'Steering or Front-Suspension Fasteners May Be Under-Torqued (Recall 14V409)',
        description:
          'NHTSA Recall 14V409 covers certain 2014 Buick Regal vehicles. Improperly torqued fasteners can allow the steering intermediate shaft to separate from the steering gear and/or the lower control arm to separate from the lower ball joint. Either separation can cause loss of steering.',
        solution:
          'Check the VIN for recall completion. A Buick dealer inspects the affected fasteners for correct torque and corrects them as necessary under the no-charge recall.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['No reliable warning is specified before an affected joint separates', 'Loss of steering after component separation'],
        affectedSystems: [
          'steering intermediate shaft and steering gear fasteners',
          'lower control arm and lower ball-joint fasteners',
        ],
        dtcCodes: [],
        citations: citations(sources.steeringFasteners),
        summary:
          'Replaced a citation-free Aisin-transmission aggregation with the exact 2014 steering/front-suspension torque recall.',
      },
    },
    'buick-regal-carbon-buildup-intake-valves': {
      disposition: 'replace',
      decision:
        'Replace the forum and Q&A-derived seven-year intake-valve-carbon aggregation with the exact 2011 eight-way power-seat wiring fire recall.',
      evidence: evidence(sources.seatWiring),
      after: {
        years: [2011],
        trims: ['vehicles equipped with eight-way power-adjustable front seats'],
        engines: [],
        category: 'electrical',
        title: 'Power-Seat Wiring Can Chafe and Short (Recall 16V517)',
        description:
          'GM Recall 30710, NHTSA 16V517, covers certain 2011 Buick Regal vehicles equipped with eight-way power-adjustable front seats. The power-seat wiring harness can contact the seat frame and chafe. Damaged wires can short-circuit, make a power seat inoperative and increase fire risk.',
        solution:
          'Check the VIN for recall completion. A Buick dealer inspects and secures the power-seat wiring harness and repairs any chafed wires under the no-charge recall.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Power seat becomes inoperative', 'Chafed seat-harness wires', 'Electrical short or seat-area fire'],
        affectedSystems: ['front power-seat wiring harness and seat frame'],
        dtcCodes: [],
        citations: citations(sources.seatWiring),
        summary:
          'Replaced an unsupported intake-carbon card with the exact 2011 power-seat wiring recall and removed speculative cleaning advice.',
      },
    },
    'buick-regal-excessive-oil-consumption-2-4l-ecotec': {
      disposition: 'replace',
      decision:
        'Replace the owner-complaint, forum and settlement-article-derived oil-consumption aggregation with the exact 2011-2012 power-seat height-adjuster bolt recall.',
      evidence: evidence(sources.seatBolt),
      after: {
        years: [2011, 2012],
        trims: ['vehicles equipped with power height-adjustable front seats'],
        engines: [],
        category: 'interior',
        title: 'Power-Seat Height Adjuster Bolt Can Fall Out (Recall 14V447)',
        description:
          'GM Recall 14271, NHTSA 14V447, covers certain 2011-2012 Buick Regal vehicles equipped with power height-adjustable front seats. A shoulder bolt securing a front-seat height adjuster can loosen or fall out, causing the seat to drop suddenly to its lowest vertical position. Sudden driver-seat movement can affect vehicle control.',
        solution:
          'Check the VIN for recall completion. A Buick dealer replaces the affected height-adjuster shoulder bolt with the recall attachment kit at no charge; the corresponding passenger-seat bolt is also addressed when that seat has power height adjustment.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Power front seat suddenly drops to its lowest height', 'Loose or missing seat height-adjuster bolt'],
        affectedSystems: ['driver and passenger power-seat height adjusters'],
        dtcCodes: [],
        citations: citations(sources.seatBolt),
        summary:
          'Replaced a secondary-source oil-consumption aggregation with the exact 2011-2012 power-seat height-adjuster recall and removed settlement, mileage and engine-repair assumptions.',
      },
    },
    'buick-regal-loss-power-brake-assist-ebcm-software-defect': {
      disposition: 'replace',
      decision:
        'Keep the genuine brake-assist recall but replace secondary sourcing and vague repair language with GM N222370090\'s exact vacuum-loss/EBCM noncompliance and software-reflash remedy.',
      evidence: evidence(sources.brakeAssist),
      after: {
        years: [2018, 2019, 2020],
        trims: [],
        engines: [],
        category: 'brakes',
        title: 'EBCM Software Can Increase Stopping Distance After Vacuum Loss (Recall 22V465)',
        description:
          'GM Recall N222370090, NHTSA 22V465, covers certain 2018-2020 Buick Regal vehicles. Following a partial or full loss of vacuum brake-assist pressure, an Electronic Brake Control Module software error can cause the vehicle to exceed federal stopping-distance requirements. Braking may require more pedal force and additional distance.',
        solution:
          'Check the VIN for recall completion. A Buick dealer reflashes the Electronic Brake Control Module with the corrected software under the no-charge recall.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['More brake-pedal force required after vacuum-assist loss', 'Longer stopping distance during a vacuum-loss event'],
        affectedSystems: ['vacuum power-brake assist and Electronic Brake Control Module software'],
        dtcCodes: [],
        citations: citations(sources.brakeAssist),
        summary:
          'Rebuilt the 2018-2020 brake-assist card from recall 22V465, using the exact vacuum-loss condition and EBCM software reflash.',
      },
    },
    'buick-regal-rear-suspension-toe-link-corrosion-fracture': {
      disposition: 'replace',
      decision:
        'Update the toe-link card to the February 2026 expansion, limiting it to 2012-2013 Turbo and GS vehicles in the named corrosion states that were not included in prior 21V00F, and remove obsolete secondary citations.',
      evidence: evidence(sources.toeLink),
      after: {
        years: [2012, 2013],
        trims: ['Turbo and GS trim-level vehicles in the campaign corrosion states'],
        engines: [],
        category: 'suspension',
        title: 'Rear Toe Links Can Corrode and Fracture (Recall 26V113)',
        description:
          'NHTSA Recall 26V113 covers certain 2012-2013 Buick Regal Turbo and GS vehicles that were sold or ever registered in the campaign\'s named corrosion states and were not included in prior recall 21V00F. Improper electrocoating can make a rear toe link susceptible to long-term corrosion; the link can thin and fracture, reducing the ability to control the vehicle. This campaign expands 20V764, 21V633 and 21V00F.',
        solution:
          'Because eligibility depends on VIN, trim, prior-campaign inclusion and registration history, have a Buick dealer check the current recall status even if the vehicle later moved. Dealers replace the rear suspension toe links and adjuster fasteners at no charge.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['No specific warning is identified in GM\'s Part 573 report', 'Reduced vehicle control if a rear toe link fractures'],
        affectedSystems: ['rear suspension toe links and adjuster fasteners'],
        dtcCodes: [],
        citations: citations(sources.toeLink),
        summary:
          'Updated the Regal toe-link card to current 2026 recall 26V113, narrowing it to Turbo/GS corrosion-state vehicles outside prior 21V00F and removing obsolete secondary sourcing.',
      },
    },
    'buick-regal-sudden-loss-electric-power-steering-assist': {
      disposition: 'replace',
      decision:
        'Keep recall 16V108 but replace dealer, blog and forum sources plus unrelated DTC claims with GM 21510\'s exact manufacturing window, assist-loss condition and steering-gear replacement.',
      evidence: evidence(sources.steeringAssist),
      after: {
        years: [2016],
        trims: [],
        engines: [],
        category: 'steering',
        title: 'Electric Power-Steering Assist Can Fail (Recall 16V108)',
        description:
          'GM Recall 21510, NHTSA 16V108, covers certain 2016 Buick Regal vehicles manufactured from August 30, 2015, through February 12, 2016. The power-steering assist system may fail. Manual steering remains possible but requires more effort, and the loss of assist increases crash risk.',
        solution:
          'Check the VIN for recall completion. A Buick dealer replaces the electric belt-drive rack-and-pinion steering-gear assembly under the no-charge recall.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Sudden loss of electric power-steering assist', 'Increased steering effort'],
        affectedSystems: ['electric belt-drive rack-and-pinion steering gear assembly'],
        dtcCodes: [],
        citations: citations(sources.steeringAssist),
        summary:
          'Rebuilt the 2016 steering-assist card from recall 16V108, adding the exact manufacturing window and steering-gear replacement while removing unrelated DTCs and secondary sources.',
      },
    },
    'buick-regal-timing-chain-tensioner-failure-2-0t-turbo': {
      disposition: 'replace',
      decision:
        'Replace the forum and complaint-derived 2011-2013 timing-chain/tensioner aggregation with the exact 2012-2013 eAssist Generator Control Module recall.',
      evidence: evidence(sources.generatorModule),
      after: {
        years: [2012, 2013],
        trims: ['vehicles equipped with eAssist'],
        engines: ['eAssist powertrain'],
        category: 'electrical',
        title: 'eAssist Generator Control Module Can Fail (Recall 13V173)',
        description:
          'GM Recall 13136A, NHTSA 13V173, covers certain 2012-2013 Buick Regal eAssist vehicles. A malfunctioning Generator Control Module can cause gradual loss of battery charge and illuminate the malfunction indicator. If the vehicle continues to be driven, the engine can stall or fail to start; a burning or melting odor, smoke and possibly a trunk fire can also occur.',
        solution:
          'Check the VIN for recall completion. A Buick dealer performs GM\'s Generator Control Module test and replaces the module when required under the no-charge campaign.',
        severity: 'high',
        confidence: 'high',
        symptoms: [
          'Gradual loss of battery charge with malfunction indicator',
          'Engine stall or no-start',
          'Burning or melting odor, smoke or fire from the trunk power-pack area',
        ],
        affectedSystems: ['eAssist Generator Control Module and high-voltage power pack'],
        dtcCodes: [],
        citations: citations(sources.generatorModule),
        summary:
          'Replaced an unsupported timing-chain card with the exact 2012-2013 Regal eAssist Generator Control Module recall.',
      },
    },
  },
  proposalCampaigns: [],
});
