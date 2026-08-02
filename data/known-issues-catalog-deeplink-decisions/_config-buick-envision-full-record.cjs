const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const lashAdjuster = {
  type: 'tsb',
  title: 'GM Preliminary Information PIP6101B - LSY Tick Noise and Soft Hydraulic Valve Lash Adjuster',
  url: 'https://static.nhtsa.gov/odi/tsbs/2026/MC-11032771-0001.pdf',
};

module.exports = buildConfig({
  label: 'Buick Envision',
  model: 'Envision',
  slug: 'buick-envision',
  batchId: 'buick-envision-full-record-cohort-5-2026-08-02',
  auditDate: '2026-08-02',
  snapshotHash:
    '991abdae63b3e8a088f1390aa51f6a18f19aa81a2914b3540a1e26f6d3fef77d',
  sourceSnapshotFileHash:
    'd82c00ca22d379625ecb893217f7ca25f57d910813f46c091cea5d2977bef833',
  packetFileHash:
    'fdb749abd7d231e68d994c5f90a152ba6f7f91a6e91f2825f8eaa0cf4bd75efb',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/buick-envision/991abdae63b3/all-0001.json',
  reviewTokens: {
    blind: 'buickenvision_blind:self-no-blocker',
    edge: 'buickenvision_edge:self-no-blocker',
  },
  published: {
    'buick-envision-top-end-engine-ticking-from-hydraulic-lash-adjusters': {
      disposition: 'replace',
      decision:
        'Keep the primary condition but update superseded PIP6101A and secondary sources to current PIP6101B, remove unsupported operating-pattern and severity claims, add possible P0324, and correct the repair from selected matched parts to all 16 adjusters and rocker arms.',
      evidence: [
        {
          type: lashAdjuster.type,
          label: lashAdjuster.title,
          url: lashAdjuster.url,
        },
      ],
      after: {
        years: [2025, 2026],
        trims: [],
        engines: ['2.0L LSY turbocharged engine'],
        category: 'engine',
        title: 'Top-End Tick from Soft Hydraulic Lash Adjuster (PIP6101B)',
        description:
          'GM PIP6101B covers North American 2025-2026 Buick Envision vehicles with the 2.0L LSY engine. Valve-rocker-arm debris can enter a hydraulic valve lash adjuster and keep it from pumping up with oil, leaving the adjuster soft and causing a top-end ticking noise. DTC P0324 may also be present.',
        solution:
          'First verify with a stethoscope or equivalent method that the tick comes from the valvetrain. Remove the camshaft carrier and inspect every hydraulic lash adjuster on both the intake and exhaust sides by pressing the rocker arm above it. If any adjuster is soft, GM directs replacement of all 16 hydraulic lash adjusters and all 16 valve rocker arms. Have the dealer check applicable powertrain coverage in Investigate Vehicle History.',
        severity: 'low',
        confidence: 'high',
        symptoms: [
          'Top-end ticking noise from the valvetrain area',
          'Possible P0324 diagnostic trouble code',
        ],
        affectedSystems: [
          'hydraulic valve lash adjusters',
          'intake and exhaust valve rocker arms',
          'camshaft carrier and valvetrain',
        ],
        dtcCodes: ['P0324'],
        citations: [
          {
            type: lashAdjuster.type,
            title: lashAdjuster.title,
            url: lashAdjuster.url,
          },
        ],
        summary:
          'Updated the Envision ticking card to current PIP6101B, removed secondary and unsupported claims, added possible P0324 and corrected the procedure to all 16 adjusters plus all 16 rocker arms when any adjuster is soft.',
      },
    },
  },
  proposalCampaigns: [],
});
