/* eslint-disable @typescript-eslint/no-require-imports */
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');

const DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const ids = Object.freeze({
  cvtShudder: 'mitsubishi-eclipse-cross-cvt-shudder',
  infotainment: 'mitsubishi-eclipse-cross-infotainment',
});
const allIds = Object.freeze(Object.values(ids).sort());
const retainedIds = Object.freeze([]);
const relevantDocumentIds = Object.freeze([
  '10130472', '10142732', '10142733', '10142734', '10142738', '10148625',
  '10148757', '10154708', '10154711', '10159648', '10159667', '10161373',
  '10161375', '10163704', '10170070', '10175777', '10182316', '10183952',
  '10185499', '10185500', '10191959', '10200031', '10208827', '10211528',
  '10231411', '10234028', '10235611', '10237510', '10243493', '10250860',
  '10252683', '10252691', '11006083', '11025238',
]);
const campaigns = Object.freeze(['18V620000', '18V621000']);
const pdfSources = Object.freeze({
  cvtShudder: {
    title: 'Mitsubishi TSB-20-23-001 - CVT-8 Shudder or Surge',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10175777-9999.pdf',
    sha256: '993418f2079de366ae6f021394dd363d3ec33f3e6ffa56c3cccdc926429183ae',
    pageCount: 21,
    visuallyReviewedPages: [1, 4, 19],
  },
  infotainmentUpdate: {
    title: 'Mitsubishi TSB-19-54-013REV - Smartphone Link Display Audio Software Update',
    type: 'nhtsa',
    url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11006083-0001.pdf',
    sha256: '4e2e070791660d487beda6525f364ba8a63e1b1ec393bfbfd676638241e917ef',
    pageCount: 14,
    visuallyReviewedPages: [1, 2, 9, 14],
  },
});
const otherSources = Object.freeze({
  datasets: {
    title: 'NHTSA Manufacturer Communications and Recall Datasets',
    type: 'nhtsa',
    url: DATASET_URL,
    contains: 'Manufacturer Communications',
  },
});

const content = Object.freeze({
  [ids.cvtShudder]: {
    description: `Mitsubishi TSB-20-23-001 documents shudder, surge, engine flare, weak acceleration or shaking on certain 2018-2020 Eclipse Cross vehicles with F1CJC or W1CJC CVT-8 units. It attributes the condition to poor hydraulic-pressure-circuit reaction and warns that continued belt slip can accelerate abrasion-powder accumulation. The procedure applies on a customer complaint basis only, and its exact population does not establish the frozen 2018-2026 identity or the claim that the problem is concentrated in the first minutes of driving.`,
    solution: `Record the exact complaint and identify the installed CVT, then follow the bulletin's test drive, drive-data and Techline diagnostic sequence before selecting a repair. Check fluid level, condition and specification under the service procedure, but do not treat a drain-and-refill or recalibration as an automatic remedy. Do not buy CVTF-J4, a valve body, transmission assembly or other CVT part from this page; the exact vehicle population, diagnostic result, approval and failed component must be proven first.`,
    symptoms: ['CVT identity and production scope verified', 'complaint reproduced on a controlled test drive', 'drive data and hydraulic diagnostic result documented'],
    affectedSystems: ['CVT-8 hydraulic pressure circuit', 'CVT belt and pulley clamping system', 'transmission control and drive-data monitoring'],
    evidence: ['TSB-20-23-001 documents shudder or surge on certain 2018-2020 Eclipse Cross CVT-8 vehicles.', 'The bulletin requires a customer complaint, test drive, drive-data review and Techline procedure before parts.', 'It does not establish the frozen 2018-2026 population or automatic fluid-service and recalibration remedy.'],
    conflict: 'The indexed page extends a bounded 2018-2020 CVT bulletin through 2026 and prescribes remedies the bulletin makes diagnosis-dependent.',
    summary: 'Held the overbroad CVT-shudder identity and bounded diagnosis and parts to the exact bulletin population and test sequence.',
    citations: ['cvtShudder', 'datasets'],
  },
  [ids.infotainment]: {
    description: `Mitsubishi TSB-19-54-013REV covers 2018 Eclipse Cross vehicles produced before April 18, 2018 with the JVC Kenwood Smartphone Link Display Audio unit. For this model it addresses low hands-free-call voice volume and an incorrect prompt after an invalid voice command. The bulletin does not establish the frozen touchpad-cursor, screen-freezing, Bluetooth-disconnection or slow-navigation claims, and the reboot and display concerns listed elsewhere in the document apply to Outlander variants rather than Eclipse Cross. It therefore does not establish one 2018-2026 infotainment identity.`,
    solution: `Verify the model, production date, installed JVC Kenwood unit, current software version and exact customer symptom. When diagnosis matches the bulletin, use only the correct vehicle-specific software supplied through Techline and follow the update and reset procedure, including preserving settings and re-pairing phones as required. Do not buy a touchpad, display, radio, Bluetooth module or generic firmware product from this page; the frozen symptoms and later model years are not proven, and the correct unit and software must be identified first.`,
    symptoms: ['production date and installed audio unit verified', 'exact voice or call-volume complaint reproduced', 'current and target software versions confirmed'],
    affectedSystems: ['JVC Kenwood Smartphone Link Display Audio', 'hands-free voice and call audio', 'vehicle-specific display-audio software'],
    evidence: ['TSB-19-54-013REV covers early-production 2018 Eclipse Cross vehicles only.', 'Its Eclipse Cross symptoms are low call voice volume and an incorrect invalid-command prompt.', 'Outlander reboot and display symptoms cannot be transferred to the Eclipse Cross population.'],
    conflict: 'The indexed page assigns unsupported touchpad, freezing and Bluetooth symptoms to every 2018-2026 Eclipse Cross despite a narrow early-2018 software bulletin.',
    summary: 'Held the overbroad infotainment identity and restricted the software procedure to the exact early-2018 unit and symptoms.',
    citations: ['infotainmentUpdate', 'datasets'],
  },
});

module.exports = Object.freeze({
  make: 'Mitsubishi', model: 'Eclipse Cross', slug: 'eclipse-cross', reviewDate: '2026-08-10',
  snapshotFile: 'data/_mitsubishi-deeplink-snapshot-2026-08-10.json',
  outputFile: 'data/known-issue-mitsubishi-eclipse-cross-adjudication-2026-08-10.json',
  ids, allIds, retainedIds, reportCountCleanupIds: [],
  modelAliases: ['ECLIPSE CROSS'],
  searchTerms: ['CVT', 'transmission', 'shudder', 'judder', 'vibration', 'acceleration', 'fluid', 'reprogram', 'recalibration', 'infotainment', 'audio', 'screen', 'display', 'touchpad', 'Bluetooth', 'freeze', 'software', 'firmware'],
  relevantDocumentIds, campaigns, pdfSources, otherSources,
  bulletinInventory: {
    source: DATASET_URL,
    periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 0, '2010-2014': 0, '2015-2019': 51, '2020-2024': 110, '2025-2026': 15 },
    totalRows: 176,
    relevantRowCount: 34,
    uniqueRelevantCommunications: relevantDocumentIds.length,
    sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
  },
  recallInventory: {
    source: DATASET_URL,
    periodCounts: { pre: 0, post: 8 },
    totalRows: 8,
    campaignCount: campaigns.length,
    sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
    scopeFinding: 'Two exact Eclipse Cross campaign identities exist; neither supports the frozen CVT-shudder or infotainment identity in this packet.',
  },
  content,
  requiredProse: [
    { id: ids.cvtShudder, field: 'description', patterns: ['2018-2020 Eclipse Cross', 'customer complaint basis only'] },
    { id: ids.cvtShudder, field: 'solution', patterns: ['test drive', 'Do not buy'] },
    { id: ids.infotainment, field: 'description', patterns: ['produced before April 18, 2018', 'does not establish'] },
    { id: ids.infotainment, field: 'solution', patterns: ['correct vehicle-specific software', 'Do not buy'] },
  ],
  observations: [
    { code: 'two-identities-held', severity: 'identity-safety', recordIds: allIds, detail: 'Both frozen identities materially exceed the exact primary evidence and remain published pending identity policy.' },
    { code: 'cvt-population-bounded', severity: 'production-scope', recordIds: [ids.cvtShudder], detail: 'A bounded 2018-2020 customer-complaint bulletin is not expanded through 2026 or converted into an automatic fluid, recalibration or replacement remedy.' },
    { code: 'infotainment-symptoms-not-cross-modelled', severity: 'technical-accuracy', recordIds: [ids.infotainment], detail: 'Outlander reboot and display symptoms are not transferred to Eclipse Cross, and the early-2018 software bulletin is not expanded through 2026.' },
    { code: 'no-owner-social-proof', severity: 'accuracy-cleanup', recordIds: allIds, detail: 'Both frozen counts are already unknown zero; no owner total or recurrence rate is introduced.' },
    { code: 'all-eclipse-cross-pages-preserved', severity: 'seo-safety', recordIds: allIds, detail: 'No Eclipse Cross page is removed, merged, redirected or allowed to lose its indexed identity.' },
  ],
});
