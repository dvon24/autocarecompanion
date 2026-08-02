const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const sources = {
  turbo2020: {
    type: 'tsb',
    title: 'GM Special Coverage N232407740 - 2020 Encore GX Turbocharger Replacement',
    url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10240546-0001.pdf',
  },
  turbo2021: {
    type: 'tsb',
    title: 'GM Special Coverage N242450640 - 2021 Encore GX Turbocharger Replacement',
    url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11010037-0001.pdf',
  },
  turbo2022: {
    type: 'tsb',
    title: 'GM Special Coverage N242484750 - 2022 Encore GX Turbocharger Replacement',
    url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11012883-0001.pdf',
  },
  sparkTiming: {
    type: 'recall',
    title: 'GM Emission Recall A242435780 - Engine Spark Timing Following Auto Stop Event',
    url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11006392-0001.pdf',
  },
  brakeAssist: {
    type: 'recall',
    title: 'GM Product Safety Recall A202307262 / NHTSA 20V588 - Loss of Brake Assist',
    url: 'https://static.nhtsa.gov/odi/rcl/2020/RCSB-20V588-8771.pdf',
  },
  shiftToPark: {
    type: 'tsb',
    title: 'GM Bulletin 23-NA-119 - Shift to Park Message or No Start',
    url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10248715-0001.pdf',
  },
  catalyst2020: {
    type: 'recall',
    title: 'GM Emission Recall A202317281 - 2020-2021 Incorrect Catalytic Converter',
    url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10197318-9999.pdf',
  },
  catalyst2023: {
    type: 'recall',
    title: 'GM Emission Recall A232398131 - 2023 Incorrect Catalytic Converter',
    url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10232163-0001.pdf',
  },
  cluster: {
    type: 'recall',
    title: 'NHTSA Recall 23V744 / GM A232424320 - Instrument Panel Blackout',
    url: 'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V744-5341.PDF',
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
  label: 'Buick Encore GX',
  model: 'Encore GX',
  slug: 'buick-encore-gx',
  batchId: 'buick-encore-gx-full-record-cohort-4-2026-08-02',
  auditDate: '2026-08-02',
  snapshotHash:
    '991abdae63b3e8a088f1390aa51f6a18f19aa81a2914b3540a1e26f6d3fef77d',
  sourceSnapshotFileHash:
    'd82c00ca22d379625ecb893217f7ca25f57d910813f46c091cea5d2977bef833',
  packetFileHash:
    '3bfed9d9efc2fa147ad8a1821239343e9006bcf8b3aad54197e6573b357c35c0',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/buick-encore-gx/991abdae63b3/all-0001.json',
  reviewTokens: {
    blind: 'buickencoregx_blind:self-no-blocker',
    edge: 'buickencoregx_edge:self-no-blocker',
  },
  published: {
    'buick-encore-gx-1.2-1.3-turbo-shudder': {
      disposition: 'replace',
      decision:
        'Replace the unsupported five-year CVT/9-speed aggregation, speculative DTCs and repair ladder with the three model-year-specific GM special coverages for 1.2L turbocharger failure.',
      evidence: evidence(sources.turbo2020, sources.turbo2021, sources.turbo2022),
      after: {
        years: [2020, 2021, 2022],
        trims: [],
        engines: ['1.2L LIH turbocharged engine'],
        category: 'engine',
        title: '1.2L Turbocharger Can Fail (2020-2022 Special Coverages)',
        description:
          'GM Special Coverages N232407740, N242450640 and N242484750 identify certain 2020, 2021 and 2022 Buick Encore GX vehicles with the 1.2L LIH engine whose turbocharger can fail. The documented signs are a check-engine light and diagnostic trouble code, a possible reduced-engine-power message, and commonly a cold-start rattle or P0299 during diagnosis.',
        solution:
          'Confirm that the VIN is included and diagnose the stored code before replacing parts. If GM diagnostics lead to turbocharger replacement, the dealer replaces the turbocharger as necessary; the 2021-2022 procedures also call for a vacuum-tank kit when the vehicle is not already equipped with one. The VIN-specific special coverages extend this condition to 15 years/150,000 miles.',
        severity: 'medium',
        confidence: 'high',
        symptoms: [
          'Check-engine light with a turbocharger-related code',
          'Reduced-engine-power message',
          'Cold-start rattle',
        ],
        affectedSystems: [
          'turbocharger assembly',
          'turbocharger wastegate vacuum control',
        ],
        dtcCodes: ['P0299'],
        citations: citations(sources.turbo2020, sources.turbo2021, sources.turbo2022),
        summary:
          'Replaced a broad, unsupported transmission card with GM\'s exact 2020-2022 1.2L turbocharger special coverages and removed speculative transmission DTCs, costs and repairs.',
      },
    },
    'buick-encore-gx-ecm-ignition-timing-fault-causing-engine-knock-after-auto-st': {
      disposition: 'replace',
      decision:
        'Keep the genuine 2024 emission-recall condition but replace secondary sourcing and imprecise recall language with GM A242435780\'s exact 1.2L scope and no-parts ECM remedy.',
      evidence: evidence(sources.sparkTiming),
      after: {
        years: [2024],
        trims: [],
        engines: ['1.2L LIH turbocharged engine'],
        category: 'engine',
        title: 'Spark Timing Fault After Auto Stop/Start (Emission Recall A242435780)',
        description:
          'GM Emission Recall A242435780 covers certain 2024 Buick Encore GX vehicles with the 1.2L LIH engine. The engine control module may not correctly control ignition timing after some Auto Engine Stop/Start events, illuminating the check-engine light and causing rough running or knock. Driving while the engine is knocking can cause engine damage; proper timing control resumes after a later stop/start event.',
        solution:
          'Have a Buick dealer confirm the VIN and recall status. GM directs the dealer to reprogram the engine control module with the corrected calibration; no parts are required. Do not continue driving a vehicle that is actively knocking or running roughly while awaiting diagnosis.',
        severity: 'high',
        confidence: 'high',
        symptoms: [
          'Check-engine light after an Auto Stop/Start event',
          'Rough engine operation',
          'Audible engine knock',
        ],
        affectedSystems: [
          'engine control module calibration',
          'ignition timing control',
        ],
        dtcCodes: [],
        citations: citations(sources.sparkTiming),
        summary:
          'Rebuilt the 2024 1.2L spark-timing card from GM A242435780, removed secondary sourcing and documented the exact ECM reprogramming remedy.',
      },
    },
    'buick-encore-gx-electronic-brake-boost-sensor-connection-failure-loss-power': {
      disposition: 'replace',
      decision:
        'Keep recall 20V588 but remove owner-complaint sourcing and unsupported warning/longer-distance claims, and align the condition and repair with GM Product Safety Recall A202307262.',
      evidence: evidence(sources.brakeAssist),
      after: {
        years: [2020, 2021],
        trims: [],
        engines: [],
        category: 'brakes',
        title: 'Electronic Brake-Boost Assist Can Be Lost (Recall 20V588)',
        description:
          'GM Product Safety Recall A202307262, NHTSA 20V588, covers certain 2020-2021 Buick Encore GX vehicles. Contaminated material in an electronic brake-boost sensor connection can interrupt communication with the brake-boost system and cause electronic assist to be lost. The driver must then use extra pedal force to slow and stop, increasing crash risk.',
        solution:
          'Check the VIN for an open recall and arrange the no-charge dealer repair. GM\'s Encore GX procedure replaces the brake master-cylinder/electronic brake-boost module assembly, then reprograms and bleeds the system as specified in service information.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Sudden increase in brake-pedal effort'],
        affectedSystems: [
          'electronic brake-boost sensor connection',
          'brake master-cylinder and boost module assembly',
        ],
        dtcCodes: [],
        citations: citations(sources.brakeAssist),
        summary:
          'Corrected the brake-assist card to GM recall A202307262/20V588, removed secondary complaints and limited symptoms and repair language to the primary recall.',
      },
    },
    'buick-encore-gx-false-shift-to-park-warning-park-switch-failure': {
      disposition: 'replace',
      decision:
        'Keep GM Bulletin 23-NA-119 but remove litigation, battery-drain, accessory-mode and stalling claims that the bulletin does not support, while adding the exact B000A and build breakpoint.',
      evidence: evidence(sources.shiftToPark),
      after: {
        years: [2020, 2021, 2022, 2023],
        trims: [],
        engines: [],
        category: 'electrical',
        title: 'Shift to Park Message or No-Start from Park-Switch Fault (23-NA-119)',
        description:
          'GM Bulletin 23-NA-119 covers 2020-2023 Buick Encore GX vehicles, with the 2023 population bounded by the October 7, 2022 Bupyeong #1 plant breakpoint. A malfunctioning park switch inside the shifter assembly can display Shift to Park while the vehicle is already in Park or cause a no-start condition; technicians may find DTC B000A.',
        solution:
          'Inspect the park-switch terminals for spread or damage. If the terminals are spread or damaged, GM directs replacement of the shifter control assembly selected by VIN. Confirm that the message and no-start condition are resolved after repair.',
        severity: 'medium',
        confidence: 'high',
        symptoms: [
          'Shift to Park message while the selector is already in Park',
          'No-start condition',
        ],
        affectedSystems: [
          'park switch',
          'shifter control assembly terminals',
        ],
        dtcCodes: ['B000A'],
        citations: citations(sources.shiftToPark),
        summary:
          'Narrowed the shift-to-park card to bulletin 23-NA-119\'s exact symptoms, DTC, park-switch cause and terminal/shifter-control procedure, removing litigation and unsupported effects.',
      },
    },
    'buick-encore-gx-incorrect-catalytic-converter-installed-factory': {
      disposition: 'replace',
      decision:
        'Correct the mixed-year emission-recall card by adding the omitted 2021 population and using both primary GM programs for 2020-2021 and 2023 1.2L vehicles, without unsupported P0420 or driveability claims.',
      evidence: evidence(sources.catalyst2020, sources.catalyst2023),
      after: {
        years: [2020, 2021, 2023],
        trims: [],
        engines: ['1.2L LIH turbocharged engine'],
        category: 'emissions',
        title: 'Incorrect Catalytic Converter Installed (Emission Recalls)',
        description:
          'GM Emission Recall A202317281 covers certain 2020-2021 Buick Encore GX vehicles, and A232398131 covers certain 2023 vehicles, all with the 1.2L LIH engine. Some received an incorrect catalytic converter that does not meet all emission-system requirements. GM does not document a specific driveability symptom or diagnostic code for these campaigns.',
        solution:
          'Have a Buick dealer check the VIN and inspect the catalytic-converter part number. If the correct converter is installed, the campaign can be closed after inspection; if it is not, the dealer replaces it with the correct VIN-matched part at no charge. Complete an open emission recall before an inspection or registration deadline.',
        severity: 'low',
        confidence: 'high',
        symptoms: [
          'No specific driveability symptom documented by GM',
          'Incorrect catalytic-converter part number found during inspection',
        ],
        affectedSystems: ['warm-up three-way catalytic converter'],
        dtcCodes: [],
        citations: citations(sources.catalyst2020, sources.catalyst2023),
        summary:
          'Corrected the catalytic-converter population to 2020, 2021 and 2023 1.2L vehicles under the two GM emission recalls and removed unsupported P0420 and symptom claims.',
      },
    },
    'buick-encore-gx-instrument-panel-display-goes-blank-while-driving': {
      disposition: 'replace',
      decision:
        'Keep the genuine 2024 recall but remove secondary sourcing and overbroad missing-information claims, and align the population, risk and OTA/dealer remedy with NHTSA recall 23V744.',
      evidence: evidence(sources.cluster),
      after: {
        years: [2024],
        trims: [],
        engines: [],
        category: 'electrical',
        title: 'Instrument Panel Can Intermittently Black Out (Recall 23V744)',
        description:
          'NHTSA Recall 23V744, GM A232424320, covers certain 2024 Buick Encore GX vehicles. A Virtual Cockpit Unit software error can cause the instrument-panel display to intermittently black out at startup or while driving. A blackout while driving can divert the driver\'s attention and increase crash risk.',
        solution:
          'Update the Virtual Cockpit Unit software. Eligible owners who accepted the applicable terms can receive the correction over the air; otherwise a GM dealer can perform the update. Confirm recall completion by VIN and current software level.',
        severity: 'high',
        confidence: 'high',
        symptoms: [
          'Instrument-panel display intermittently black at startup',
          'Instrument-panel display intermittently black while driving',
        ],
        affectedSystems: [
          'Virtual Cockpit Unit software',
          'instrument-panel display',
        ],
        dtcCodes: [],
        citations: citations(sources.cluster),
        summary:
          'Rebuilt the blackout card from NHTSA recall 23V744, using the exact 2024 population, VCU software cause, attention-diversion risk and OTA/dealer update remedy.',
      },
    },
  },
  proposalCampaigns: [],
});
