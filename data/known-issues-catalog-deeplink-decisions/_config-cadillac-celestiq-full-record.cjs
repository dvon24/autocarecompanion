function bulletin({
  oldTitle,
  claims,
  urls,
  bulletinId,
  evidenceUrl,
  years,
  category,
  title,
  description,
  solution,
  severity = 'medium',
  symptoms,
  systems,
}) {
  const evidenceTitle = `GM ${bulletinId} - Cadillac Celestiq`;
  return {
    disposition: 'replace',
    decision: `Replace the frozen "${oldTitle}" aggregation with the bounded GM manufacturer-communication path below. Remove all ${claims} commerce claims and ${urls} outbound URL occurrences.`,
    evidence: [{ label: evidenceTitle, url: evidenceUrl }],
    after: {
      years,
      trims: [],
      engines: [],
      category,
      title,
      description,
      solution,
      severity,
      confidence: 'high',
      source: 'manual',
      symptoms,
      affectedSystems: systems,
      dtcCodes: [],
      citations: [{ type: 'tsb', title: evidenceTitle, url: evidenceUrl }],
      summary: `Replaced the frozen "${oldTitle}" card with exact GM ${bulletinId} scope and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'Cadillac Celestiq',
  make: 'Cadillac',
  model: 'Celestiq',
  batchId: 'cadillac-celestiq-full-record-cohort-1-2026-07-29',
  auditDate: '2026-07-29',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    '01d6ce7cc2c1e29033b276198aa55632c60c5759c2166fbc32ad9d912bc9311d',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/cadillac-celestiq/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'celestiq_blind_review:no-blocker',
    edge: 'celestiq_edge_review:no-blocker',
  },
  expectedIds: [
    'cadillac-celestiq-12v-battery-ultium-2024',
    'cadillac-celestiq-display-software-glitches-2024',
    'cadillac-celestiq-illuminated-grille-recall-2024',
    'cadillac-celestiq-software-integration-2024',
    'cadillac-celestiq-suspension-calibration-2024',
  ],
  records: {
    'cadillac-celestiq-12v-battery-ultium-2024': bulletin({
      oldTitle: '12V Auxiliary Battery Drain on Ultium Platform',
      claims: 4,
      urls: 4,
      bulletinId: 'Service Update N262547330',
      evidenceUrl:
        'https://static.nhtsa.gov/odi/tsbs/2026/MC-11031366-0001.pdf',
      years: [2025],
      category: 'electrical',
      title:
        'Telematics Control Module Can Enter an Unrecoverable State (Service Update N262547330)',
      description:
        'GM service update N262547330 covers selected 2025 Celestiq VINs whose telematics control module may enter an unrecoverable state.',
      solution:
        'Have Cadillac check Investigate Vehicle History for an open action. Eligible vehicles receive the required module programming, potentially through multiple software events or an accepted over-the-air update; a module that cannot complete an OnStar test call may require dealer replacement.',
      symptoms: [
        'OnStar test call cannot connect',
        'Open service update in GM vehicle history',
      ],
      systems: ['telematics control module', 'OnStar communication interface'],
    }),
    'cadillac-celestiq-display-software-glitches-2024': bulletin({
      oldTitle: 'Infotainment and Driver Display Software Glitches',
      claims: 3,
      urls: 3,
      bulletinId: 'PIC6629A',
      evidenceUrl:
        'https://static.nhtsa.gov/odi/tsbs/2025/MC-11025574-0001.pdf',
      years: [2025, 2026],
      category: 'electrical',
      title:
        'Radio or Instrument Display May Go Blank, Flicker, Freeze, or Ignore Touch (PIC6629A)',
      description:
        'GM bulletin PIC6629A covers 2025-2026 Celestiq radio and instrument-display conditions including a blank or black screen, flickering, intermittent recovery, unresponsive touch input, or repeated restarts caused by software, connection, or hardware anomalies.',
      solution:
        'A Cadillac technician should follow PIC6629A symptom-specific diagnostics: check DTCs, update radio software, attempt the approved reboot, inspect display connections and LVDS wiring, and replace restricted components only after the bulletin sequence confirms the fault.',
      symptoms: [
        'Blank or black display',
        'Display flickers or restarts',
        'Touch input does not respond',
      ],
      systems: ['radio display', 'instrument-panel display', 'LVDS connections'],
    }),
    'cadillac-celestiq-illuminated-grille-recall-2024': bulletin({
      oldTitle: 'Illuminated Front Grille Non-Compliance Recall',
      claims: 2,
      urls: 2,
      bulletinId: 'PIE0753I',
      evidenceUrl:
        'https://static.nhtsa.gov/odi/tsbs/2025/MC-11023388-0001.pdf',
      years: [2025],
      category: 'electrical',
      title:
        'Selected VIN May Receive Proactive High-Voltage Battery Pack Replacement (PIE0753I)',
      description:
        'GM engineering information PIE0753I applies only when it appears in vehicle history for a selected 2025 Celestiq VIN. GM may proactively contact the owner to replace the high-voltage battery pack under warranty for engineering analysis; this is not a recall and does not imply that every Celestiq battery is defective.',
      solution:
        'Proceed only after GM contacts the owner or PIE0753I appears for the VIN. An authorized EV dealer must verify warranty coverage, obtain GM Technical Assistance authorization, and perform the battery replacement and return procedure.',
      symptoms: [
        'PIE0753I appears in GM vehicle history',
        'Owner is contacted proactively by GM engineering',
      ],
      systems: ['high-voltage drive battery pack'],
    }),
    'cadillac-celestiq-software-integration-2024': bulletin({
      oldTitle: 'Complex Software Integration Issues Across Vehicle Systems',
      claims: 3,
      urls: 3,
      bulletinId: 'PIT6394B',
      evidenceUrl:
        'https://static.nhtsa.gov/odi/tsbs/2025/MC-11022074-0001.pdf',
      years: [2025],
      category: 'safety',
      title:
        'Long-Range Radar Learn Can Time Out With Service Driver Assist Message (PIT6394B)',
      description:
        'GM bulletin PIT6394B covers 2025 Celestiq vehicles that may show a Service Driver Assist message, set U3000 symptom 78, and time out while learning the long-range radar module because the newer radar uses different calibration criteria.',
      solution:
        'A trained technician should use the scan tool to enable the radar learn procedure and complete the drive cycle in a city or urban environment with varied vehicle targets, following GM service information.',
      symptoms: [
        'Service Driver Assist message',
        'Long-range radar learn times out',
        'Conditions-not-met message during calibration',
      ],
      systems: ['long-range radar module', 'driver-assistance calibration'],
    }),
    'cadillac-celestiq-suspension-calibration-2024': bulletin({
      oldTitle: 'Active Suspension Calibration Sensitivity to Road Conditions',
      claims: 2,
      urls: 2,
      bulletinId: 'PIP6103A',
      evidenceUrl:
        'https://static.nhtsa.gov/odi/tsbs/2026/MC-11032769-0001.pdf',
      years: [2025, 2026],
      category: 'electrical',
      title:
        'Incorrect NACS Adapter Use Can Set Charger Codes That Mimic a Vehicle Fault (PIP6103A)',
      description:
        'GM bulletin PIP6103A covers NACS-equipped 2025-2026 Celestiq vehicles where incorrect use of a DC adapter at an AC station can set codes that may be mistaken for a failed T18 battery-charger module.',
      solution:
        'Do not replace the charger module from codes alone. A high-voltage-trained Cadillac technician should document the charger, adapter, conditions, and DTCs and open a GM Technical Assistance case before restricted-part replacement.',
      symptoms: [
        'Charging-related diagnostic codes after adapter use',
        'Suspected charger-module fault that may be an adapter mismatch',
      ],
      systems: ['NACS charge port', 'T18 battery-charger module'],
    }),
  },
  expectedTelemetry: {
    claimCount: 14,
    urlCount: 14,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: { replace: 5 },
  expectedPublished: 5,
  expectedArchived: 0,
  controlledDeltaProposals: [],
  expectedProposalIdentities: [],
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  const expectedYears = {
    'cadillac-celestiq-12v-battery-ultium-2024': [2025],
    'cadillac-celestiq-display-software-glitches-2024': [2025, 2026],
    'cadillac-celestiq-illuminated-grille-recall-2024': [2025],
    'cadillac-celestiq-software-integration-2024': [2025],
    'cadillac-celestiq-suspension-calibration-2024': [2025, 2026],
  };
  if (
    issues.some(
      (issue) =>
        JSON.stringify(issue.after.years) !==
          JSON.stringify(expectedYears[issue.id]) ||
        issue.after.status !== 'published',
    )
  ) {
    throw new Error('Cadillac Celestiq reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
