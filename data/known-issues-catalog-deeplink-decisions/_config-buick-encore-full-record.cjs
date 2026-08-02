const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const sources = {
  camReluctor: {
    type: 'tsb',
    title: 'GM Bulletin 21-NA-268 - Exhaust Camshaft Reluctor Out of Phase',
    url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11004762-0001.pdf',
  },
  neutralIdle: {
    type: 'tsb',
    title: 'GM Preliminary Information PI0928E - Neutral Idle Bump, Surge or Vibration',
    url: 'https://static.nhtsa.gov/odi/tsbs/2015/MC-10113691-9999.pdf',
  },
  purgeValve: {
    type: 'tsb',
    title: 'GM Special Coverage N232395300 - Evaporative Emissions Purge Valve',
    url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10238343-0001.pdf',
  },
  chargeAirCooler: {
    type: 'tsb',
    title: 'GM Bulletin 17-NA-221 - Charge Air Cooler Icing',
    url: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10137568-9999.pdf',
  },
  reducedPower: {
    type: 'tsb',
    title: 'GM Special Coverage 25160 - Reduced Engine Power, Hesitation or Stall',
    url: 'https://static.nhtsa.gov/odi/tsbs/2016/MC-10126137-9999.pdf',
  },
  purgePump: {
    type: 'tsb',
    title: 'GM Special Coverage N242484740 - Evaporative Emissions Purge Pump',
    url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11012848-0001.pdf',
  },
  oilConsumption: {
    type: 'tsb',
    title: 'GM Preliminary Information PIP5197H - Oil Consumption, PCV and Piston Diagnosis',
    url: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10147383-9999.pdf',
  },
  pcvCoverage: {
    type: 'tsb',
    title: 'GM Special Coverage N202299080 - Camshaft Cover PCV Diaphragm',
    url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10178406-9999.pdf',
  },
  turboCoverage: {
    type: 'tsb',
    title: 'GM Special Coverage N232395330 - Turbocharger Replacement',
    url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-10250285-0001.pdf',
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
  label: 'Buick Encore',
  model: 'Encore',
  slug: 'buick-encore',
  batchId: 'buick-encore-full-record-cohort-3-2026-08-02',
  auditDate: '2026-08-02',
  snapshotHash:
    '991abdae63b3e8a088f1390aa51f6a18f19aa81a2914b3540a1e26f6d3fef77d',
  sourceSnapshotFileHash:
    'd82c00ca22d379625ecb893217f7ca25f57d910813f46c091cea5d2977bef833',
  packetFileHash:
    '1b3e6bfea43b289391a1354555d85ce5bd6070965cf2a436348761d1dbf3fac2',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/buick-encore/991abdae63b3/all-0001.json',
  reviewTokens: {
    blind: 'buickencore_blind:self-no-blocker',
    edge: 'buickencore_edge:self-no-blocker',
  },
  published: {
    'buick-encore-1.4-turbo-timing-chain': {
      disposition: 'replace',
      decision:
        'Replace the unsupported 2013-2022 timing-chain, mileage, cost and maintenance aggregation with GM Bulletin 21-NA-268\'s exact 2016-2022 LE2 exhaust-camshaft reluctor condition.',
      evidence: evidence(sources.camReluctor),
      after: {
        years: [2016, 2017, 2018, 2019, 2020, 2021, 2022],
        engines: ['1.4L LE2 turbocharged engine'],
        category: 'engine',
        title: 'Exhaust Camshaft Reluctor Can Move Out of Phase (21-NA-268)',
        description:
          'GM Bulletin 21-NA-268 applies to 2016-2022 Buick Encore vehicles with the 1.4L LE2 engine. An exhaust-camshaft reluctor that moves out of phase can cause an extended crank or crank/no-start condition, illuminate the MIL and, in some cases, increase brake-pedal effort. The vacuum-pump drive lugs may also be damaged.',
        solution:
          'Complete current no-start diagnostics first. If they do not identify another cause, GM directs inspection of the exhaust-camshaft reluctor orientation, actuator dowel pin and vacuum-pump drive lugs. Replace the exhaust camshaft and vacuum pump when the reluctor is out of position or the drive lugs are broken, and remove any resulting metal debris.',
        severity: 'high',
        confidence: 'high',
        symptoms: [
          'Crank/no-start or extended crank',
          'Check-engine light',
          'Possible increased brake-pedal effort',
        ],
        affectedSystems: [
          'exhaust camshaft reluctor',
          'exhaust camshaft position actuator',
          'vacuum pump drive lugs',
        ],
        dtcCodes: ['P0014', 'P0017', 'P0365', 'P0366'],
        citations: citations(sources.camReluctor),
        summary:
          'Replaced an unsupported timing-chain aggregation with GM\'s exact 2016-2022 LE2 exhaust-camshaft reluctor issue and removed invented mileage, cost and maintenance claims.',
      },
    },
    'buick-encore-6t40-automatic-transmission-hard-shifting-shudder-slipping': {
      disposition: 'replace',
      decision:
        'Replace the broad third-party 2013-2018 transmission aggregation with PI0928E\'s build-bounded 2013-2014 6T40 neutral-idle bump, surge and vibration condition.',
      evidence: evidence(sources.neutralIdle),
      after: {
        years: [2013, 2014],
        engines: ['1.4L LUJ/LUV with 6T40 MHB/MH8 automatic transmission'],
        category: 'transmission',
        title: 'Neutral-Idle Bump, Surge or Vibration at a Stop (PI0928E)',
        description:
          'GM PI0928E covers 2013-2014 Encore vehicles built before August 1, 2013 with the 6T40 automatic. While stopped in Drive with the brake applied and the transmission fluid at 99°F or warmer, the Neutral Idle feature and variation in the 1-2-3-4 clutch fiber plates can cause a continuous on/off bump, surge or engine vibration.',
        solution:
          'Verify the exact stopped-in-Drive condition and move the selector to Manual to disable Neutral Idle. If that eliminates the continuous bump or surge, GM calls for replacing the specified 1-2-3-4 clutch fiber plates and piston. A single bump as the transmission enters or exits Neutral Idle is normal and should not be repaired under this procedure.',
        severity: 'low',
        confidence: 'high',
        symptoms: [
          'Continuous bump or surge while stopped in Drive',
          'Engine vibration with the service brake applied',
          'Concern disappears when the selector is moved to Manual',
        ],
        affectedSystems: [
          '6T40 Neutral Idle feature',
          '1-2-3-4 clutch fiber plates and piston',
        ],
        dtcCodes: [],
        citations: citations(sources.neutralIdle),
        summary:
          'Replaced a generic 2013-2018 hard-shift/slip aggregation with PI0928E\'s exact pre-August-2013-build neutral-idle condition and bounded clutch repair.',
      },
    },
    'buick-encore-encore-gx-three-cylinder-turbo-stalling-low-oil-pressure-ecm': {
      disposition: 'replace',
      decision:
        'Remove Encore GX content from the Encore model packet and replace it with GM Special Coverage N232395300\'s VIN-specific 2020 Encore purge-valve condition.',
      evidence: evidence(sources.purgeValve),
      after: {
        years: [2020],
        engines: ['1.4L LUV turbocharged engine'],
        category: 'emissions',
        title: 'EVAP Purge Valve May Not Fully Close (Special Coverage N232395300)',
        description:
          'GM Special Coverage N232395300 identifies certain 2020 Buick Encore vehicles with the 1.4L LUV engine whose evaporative-emissions purge valve may not fully close. The engine can run rough, hesitate or stall at idle, the check-engine light can illuminate and an EVAP or fuel-trim DTC can set.',
        solution:
          'Diagnose the stored DTC before replacing parts. If GM service diagnostics lead to the purge solenoid valve, replace it using the VIN and current Electronic Parts Catalog to select the correct part. The special coverage provides 15 years/150,000 miles for involved VINs; confirm eligibility and campaign history with a Buick dealer.',
        severity: 'medium',
        confidence: 'high',
        symptoms: [
          'Rough idle',
          'Hesitation or stalling at idle',
          'Check-engine light',
        ],
        affectedSystems: [
          'evaporative-emissions purge valve',
          'engine idle control and fuel trim',
        ],
        dtcCodes: ['P0171', 'P0174', 'P0442', 'P0455', 'P0496'],
        citations: citations(sources.purgeValve),
        summary:
          'Removed incorrectly mixed Encore GX content and replaced it with the exact 2020 Encore N232395300 purge-valve condition, DTCs and VIN-gated coverage.',
      },
    },
    'buick-encore-encore-gx-transmission-shudder-jerking-solenoid-faults': {
      disposition: 'replace',
      decision:
        'Remove unsupported Encore GX transmission content from the Encore page and replace it with GM Bulletin 17-NA-221\'s exact 2016-2018 LE2 charge-air-cooler icing issue.',
      evidence: evidence(sources.chargeAirCooler),
      after: {
        years: [2016, 2017, 2018],
        engines: ['1.4L LE2 turbocharged engine'],
        category: 'engine',
        title: 'Charge-Air Cooler Icing Can Cause Cold-Weather Power Loss (17-NA-221)',
        description:
          'GM Bulletin 17-NA-221 covers specified 2016-2018 Encore vehicles with the LE2 engine, through the September 18, 2017 build breakpoint. At 0°F (-18°C) or below, ice can accumulate in the charge-air cooler and restrict airflow, causing power loss, hesitation, stalling, tailpipe smoke, an oil odor or MIL during the first 10-15 minutes of operation.',
        solution:
          'Allow suspected ice to melt in a warm environment and confirm that the driveability concern is caused by charge-air-cooler icing. Inspect the intake air pressure/temperature sensor when P0299 is set. If the documented condition is validated, GM directs replacement of the charge-air cooler and an oil change when moisture contamination warrants it.',
        severity: 'high',
        confidence: 'high',
        symptoms: [
          'Cold-weather loss of power or hesitation',
          'Stalling during the first 10-15 minutes of operation',
          'Tailpipe smoke or burning-oil odor',
          'Check-engine light',
        ],
        affectedSystems: [
          'charge-air cooler',
          'intake air pressure and temperature sensor',
          'turbocharged intake airflow',
        ],
        dtcCodes: ['P00C7', 'P0236', 'P0299', 'P2227'],
        citations: citations(sources.chargeAirCooler),
        summary:
          'Removed incorrectly mixed Encore GX transmission content and replaced it with GM\'s build-bounded 2016-2018 LE2 charge-air-cooler icing condition.',
      },
    },
    'buick-encore-engine-stalling-sudden-power-loss-while-driving': {
      disposition: 'replace',
      decision:
        'Narrow the complaint-driven 2013-2015 multi-cause stalling aggregation to Special Coverage 25160\'s VIN-selected 2013 Encore software condition and no-parts remedy.',
      evidence: evidence(sources.reducedPower),
      after: {
        years: [2013],
        engines: ['1.4L LUV turbocharged engine with MH8/MH9/MHB 6-speed automatic'],
        category: 'engine',
        title: 'Reduced Engine Power, Hesitation or Stall (Special Coverage 25160)',
        description:
          'GM Special Coverage 25160 identifies some 2013 Buick Encore vehicles with the 1.4L LUV engine and six-speed automatic transmission that can hesitate, enter reduced-engine-power mode and lose acceleration while driving. On infrequent occasions the vehicle may stall; steering and braking remain available but can require greater effort.',
        solution:
          'Confirm the VIN and the documented software condition. GM\'s remedy is to reprogram both the engine control module and transmission control module; no parts are required. The original coverage was six years/100,000 miles, so ask a Buick dealer to check campaign and programming history rather than assuming present eligibility.',
        severity: 'high',
        confidence: 'high',
        symptoms: [
          'ENGINE POWER IS REDUCED message',
          'Hesitation and reduced acceleration while driving',
          'Check-engine light',
          'Infrequent engine stall',
        ],
        affectedSystems: [
          'engine control module calibration',
          'transmission control module calibration',
        ],
        dtcCodes: [],
        citations: citations(sources.reducedPower),
        summary:
          'Corrected a broad 2013-2015 multi-cause stalling card to VIN-selected 2013 Encore Special Coverage 25160 and its exact ECM/TCM reprogramming remedy.',
      },
    },
    'buick-encore-evap-purge-pump-failure-warranty-extension': {
      disposition: 'replace',
      decision:
        'Keep the genuine 2022 purge-pump condition but replace secondary citations, unsupported fuel-economy and driveability claims, and incomplete DTC guidance with Special Coverage N242484740.',
      evidence: evidence(sources.purgePump),
      after: {
        years: [2022],
        engines: [],
        category: 'emissions',
        title: 'EVAP Purge Pump Can Fail (Special Coverage N242484740)',
        description:
          'GM Special Coverage N242484740 identifies certain 2022 Buick Encore vehicles whose evaporative-emissions purge pump can fail. The documented symptoms are a check-engine light and one or more purge-pump diagnostic trouble codes.',
        solution:
          'Follow current GM diagnostic steps for the stored code. If diagnosis leads to the evaporative-emissions canister purge pump, replace the pump and transfer the existing mounting bracket to the new part. The coverage is VIN-specific and provides 15 years/150,000 miles for the documented condition, so confirm eligibility in Buick Investigate Vehicle History.',
        severity: 'low',
        confidence: 'high',
        symptoms: ['Check-engine light', 'EVAP purge-pump diagnostic code'],
        affectedSystems: ['evaporative-emissions canister purge pump'],
        dtcCodes: [
          'P0146',
          'P1467',
          'P1469',
          'P146A',
          'P146B',
          'P146C',
          'P146D',
          'P146E',
          'P146F',
          'P148E',
          'P148F',
          'P1490',
          'P14A4',
        ],
        citations: citations(sources.purgePump),
        summary:
          'Rebuilt the 2022 purge-pump card from GM Special Coverage N242484740, adding exact DTCs and removing unsupported fuel-economy, driveability and secondary-source claims.',
      },
    },
    'buick-encore-excessive-oil-consumption': {
      disposition: 'replace',
      decision:
        'Correct the frozen 2013-2021 owner-report aggregation to PIP5197H\'s exact 2013-2019 LUJ/LUV population, diagnostic threshold and branching PCV, intake-manifold and piston-ring procedure.',
      evidence: evidence(sources.oilConsumption),
      after: {
        years: [2013, 2014, 2015, 2016, 2017, 2018, 2019],
        engines: ['1.4L LUJ/LUV turbocharged engine'],
        category: 'engine',
        title: 'Oil Consumption, Blue Smoke or PCV Faults (PIP5197H)',
        description:
          'GM PIP5197H covers 2013-2019 Encore vehicles with the 1.4L LUJ/LUV engine. The documented concern includes oil use of at least one quart per 2,000 miles when not caused by an external leak, blue exhaust smoke, a whistle, MIL or fuel-trim codes. Possible causes include a leaking cam-cover PCV orifice, a missing intake-manifold non-return valve or a weak/broken piston ring land.',
        solution:
          'Check dipstick and oil-cap sealing, intake leaks and the cam-cover PCV orifice first. Replace the camshaft cover if its PCV port leaks oil or vacuum; replace the intake manifold only if its non-return valve is missing. If those checks pass, measure crankcase pressure and use cylinder-leakage diagnosis before considering piston replacement.',
        severity: 'medium',
        confidence: 'high',
        symptoms: [
          'Oil use of at least one quart per 2,000 miles without an external leak',
          'Blue exhaust smoke or whistle noise',
          'Check-engine light or fuel-trim fault',
        ],
        affectedSystems: [
          'camshaft-cover PCV orifice',
          'intake-manifold non-return valve',
          'piston ring lands and crankcase pressure',
        ],
        dtcCodes: ['P0171', 'P0299', 'P0300'],
        citations: citations(sources.oilConsumption),
        summary:
          'Corrected oil-consumption scope to 2013-2019 LUJ/LUV Encore vehicles and replaced owner reports with PIP5197H\'s exact threshold and staged PCV/intake/piston diagnosis.',
      },
    },
    'buick-encore-pcv-camshaft-cover-diaphragm-failure-tea-kettle-whistle': {
      disposition: 'replace',
      decision:
        'Narrow the 2013-2021 forum-derived PCV card and unapproved bypass-kit advice to Special Coverage N202299080\'s VIN-selected 2014 Encore population and camshaft-cover replacement only.',
      evidence: evidence(sources.pcvCoverage),
      after: {
        years: [2014],
        engines: ['1.4L LUJ/LUV turbocharged engine'],
        category: 'engine',
        title: 'PCV Pressure-Regulator Diaphragm Can Crack (Special Coverage N202299080)',
        description:
          'GM Special Coverage N202299080 identifies certain 2014 Buick Encore vehicles whose PCV pressure-regulator diaphragm, integrated into the engine camshaft cover, can crack. Excess air can then enter the intake, causing rough running especially at idle, a check-engine light and P0171 or another airflow-related DTC.',
        solution:
          'Confirm the PCV valve is noisy and leaking vacuum at its vent after checking that the dipstick and oil cap are sealed. If both findings are present, GM directs replacement of the camshaft cover. The original VIN-specific coverage was 10 years/120,000 miles; confirm campaign and repair history with a Buick dealer and do not substitute an unaudited bypass kit.',
        severity: 'medium',
        confidence: 'high',
        symptoms: [
          'Rough idle',
          'Noise from the PCV valve',
          'Vacuum at the PCV vent',
          'Check-engine light',
        ],
        affectedSystems: [
          'PCV pressure-regulator diaphragm',
          'engine camshaft cover',
          'engine air intake',
        ],
        dtcCodes: ['P0171'],
        citations: citations(sources.pcvCoverage),
        summary:
          'Corrected the PCV diaphragm card to VIN-selected 2014 Encore Special Coverage N202299080 and removed forum citations, bypass-kit advice and unsupported 2013-2021 scope.',
      },
    },
    'buick-encore-turbocharger-oil-supply-line-failure-causing-sudden-loss-pow': {
      disposition: 'replace',
      decision:
        'Narrow the 2013-2018 multi-cause turbo/oil-line aggregation to Special Coverage N232395330\'s exact 2017-2018 LUV turbocharger condition, P0299 diagnosis and VIN-gated replacement.',
      evidence: evidence(sources.turboCoverage),
      after: {
        years: [2017, 2018],
        engines: ['1.4L LUV turbocharged engine'],
        category: 'engine',
        title: 'Turbocharger Can Fail (Special Coverage N232395330)',
        description:
          'GM Special Coverage N232395330 identifies certain 2017-2018 Buick Encore vehicles with the 1.4L LUV engine whose turbocharger can fail. The documented result is a check-engine light with a turbo-related DTC, rough engine operation or reduced power.',
        solution:
          'Follow current GM troubleshooting for P0299 or the stored turbocharger DTC. Replace the turbocharger only when that diagnosis leads to replacement; the service procedure includes the specified oil-feed, coolant, exhaust and return-pipe seals and gaskets. Coverage is VIN-specific for 10 years/120,000 miles, so check Buick Investigate Vehicle History before assuming eligibility.',
        severity: 'high',
        confidence: 'high',
        symptoms: [
          'Reduced engine power',
          'Rough engine operation',
          'Check-engine light with a turbocharger-related code',
        ],
        affectedSystems: [
          'turbocharger assembly',
          'turbo oil-feed and return seals',
          'turbo coolant and exhaust connections',
        ],
        dtcCodes: ['P0299'],
        citations: citations(sources.turboCoverage),
        summary:
          'Corrected turbocharger scope to VIN-selected 2017-2018 LUV Encores under N232395330 and removed unsupported oil-line cause, maintenance and secondary-source claims.',
      },
    },
  },
  proposalCampaigns: [],
});
