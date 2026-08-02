const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const coverageUrl =
  'https://static.nhtsa.gov/odi/tsbs/2020/MC-10181649-9999.pdf';
const coverageTitle =
  'GM Special Coverage N192291620 - Camshaft Cover Replacement';

module.exports = buildConfig({
  label: 'Buick Cascada',
  model: 'Cascada',
  slug: 'buick-cascada',
  batchId: 'buick-cascada-full-record-cohort-1-2026-08-01',
  auditDate: '2026-08-01',
  snapshotHash:
    '991abdae63b3e8a088f1390aa51f6a18f19aa81a2914b3540a1e26f6d3fef77d',
  sourceSnapshotFileHash:
    'd82c00ca22d379625ecb893217f7ca25f57d910813f46c091cea5d2977bef833',
  packetFileHash:
    '5cd4d477fd074704c9bf02ea7d75a692652da6c6a7b1a0fbf80f8fa0e4824dfe',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/buick-cascada/991abdae63b3/all-0001.json',
  reviewTokens: {
    blind: 'buickcascada_blind:self-no-blocker',
    edge: 'buickcascada_edge:self-no-blocker',
  },
  published: {
    'buick-cascada-1.6t-timing-chain': {
      disposition: 'replace',
      decision:
        'Replace the unsupported timing-chain and intake-carbon aggregation with the exact, VIN-bounded GM camshaft-cover special coverage for selected 2016 Cascada 1.6L vehicles. The source does not support the former 2016-2019 timing-chain, carbon-cleaning, mileage, DTC or cost claims.',
      evidence: [
        {
          type: 'tsb',
          label: coverageTitle,
          url: coverageUrl,
        },
      ],
      after: {
        years: [2016],
        trims: [],
        engines: ['1.6L Turbocharged'],
        category: 'engine',
        title:
          'PCV Pressure-Regulator Diaphragm Can Crack (Special Coverage N192291620)',
        description:
          'GM Special Coverage N192291620 identifies selected 2016 Buick Cascada vehicles with the 1.6L engine in which the PCV pressure-regulator diaphragm, built into the engine camshaft cover, may crack. Excess intake air can then cause rough running, especially at idle, illuminate the check-engine light and set P0171 or another airflow-related DTC.',
        solution:
          'Have a Buick dealer check the VIN in GM Investigate Vehicle History before assuming the coverage applies. If the documented condition is confirmed and the vehicle is eligible under the original 10-year/120,000-mile terms, the GM procedure calls for replacing the engine camshaft cover as necessary; current eligibility depends on the vehicle\'s in-service date, mileage and campaign history.',
        severity: 'medium',
        confidence: 'high',
        source: 'manual',
        symptoms: [
          'Rough engine operation, especially at idle',
          'Check-engine light',
          'Lean-fuel or airflow-related diagnostic code',
        ],
        affectedSystems: [
          'PCV pressure-regulator valve diaphragm',
          'engine camshaft cover',
          'engine air intake',
        ],
        dtcCodes: ['P0171'],
        citations: [
          {
            type: 'tsb',
            title: coverageTitle,
            url: coverageUrl,
          },
        ],
        summary:
          'Replaced the unsupported 2016-2019 timing-chain/carbon aggregation with exact GM Special Coverage N192291620 scope for selected 2016 1.6L Cascada vehicles; removed unsupported cost, mileage and owner-report telemetry.',
      },
    },
  },
  proposalCampaigns: ['16V844000'],
});
