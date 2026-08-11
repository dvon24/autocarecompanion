const SNAPSHOT_FILE = 'data/_saab-deeplink-snapshot-2026-08-11.json';
const REVIEW_DATE = '2026-08-11';

const contracts = {
  '900': {
    make: 'Saab',
    model: '900',
    reviewDate: REVIEW_DATE,
    snapshotFile: SNAPSHOT_FILE,
    outputFile: 'data/known-issue-saab-900-adjudication-2026-08-11.json',
    allIds: ['saab-900-classic-windshield-frame-rust'],
    retainedIds: [],
    reportCountCleanupIds: [],
    observations: [
      'The frozen vehicle metadata covers 1990-1993, while the frozen title asserts 1979-1993; this scope conflict cannot be fixed by a body-only rewrite.',
      'Independent buyer guides support inspection for corrosion at wheel arches, door bottoms, floors, suspension mounting areas and other structural locations, but the captured sources do not validate the frozen windshield-frame-plus-rear-arch composite as one recurring defect across every listed trim.',
      'No captured primary Saab communication supports the frozen prevalence, hidden-inner-structure sequence, annual trim-lifting instruction, convertible-stiffener claim, repair-price ranges or named restoration-service availability.',
    ],
    pdfSources: {},
    otherSources: {
      carAndDriverGuide: {
        url: 'https://www.caranddriver.com/features/a44601095/what-to-buy-1979-1993-saab-900/',
        type: 'article',
        title: 'Car and Driver 1979-1993 Saab 900 buyer guide',
        contains: ['wheel arches', 'suspension mounting points'],
      },
      hemmingsGuide: {
        url: 'https://www.hemmings.com/stories/buyers-guide-1986-94-saab-900-convertible/',
        type: 'article',
        title: 'Hemmings 1986-1994 Saab 900 Convertible buyer guide',
        contains: ['floors under the carpets', 'common corrosion points'],
      },
    },
    bulletinInventory: {
      method: 'Exact Saab 900 corrosion searches and captured buyer-guide review; no primary Saab service communication was found that establishes the frozen composite identity or prevalence.',
      exactDocuments: 0,
    },
    recallInventory: {
      method: 'No safety recall was used to substantiate age-, climate- and condition-dependent body corrosion.',
      exactCampaigns: 0,
    },
    modelAliases: ['900', 'Classic 900', 'C900'],
    searchTerms: ['windshield frame rust', 'windscreen surround rust', 'rear wheel arch rust', 'floor corrosion'],
    relevantDocumentIds: [],
    campaigns: [],
    requiredProse: [
      {
        id: 'saab-900-classic-windshield-frame-rust',
        field: 'description',
        patterns: ['vehicle metadata is limited to 1990-1993', 'do not establish the windshield frame and rear wheel arches as one recurring defect'],
      },
    ],
    content: {
      'saab-900-classic-windshield-frame-rust': {
        description: 'The frozen title describes 1979-1993 Classic 900s, but this page\'s indexed vehicle metadata is limited to 1990-1993. Independent buyer guides support careful corrosion inspection on surviving Classic 900s, including wheel arches, door bottoms, floors, jacking or suspension mounting areas and moisture-trapping locations. The captured guides do not establish the windshield frame and rear wheel arches as one recurring defect across every listed trim, do not prove that inner structure always rusts first and do not supply a failure rate for salt-region cars. Vehicle history, prior glass or body work, storage, drainage, coatings and road-salt exposure materially change the condition.',
        solution: 'Have a qualified body or restoration shop inspect the whole body and understructure, ideally on a lift. Look for paint bubbles, seam swelling, perforation, soft metal, wet carpet and repairs hidden by trim or undercoating; a glass specialist should assess corrosion near the windshield before moldings or bonded glass are disturbed. Structural corrosion, suspension-mount damage or perforation needs professional measurement and repair planning rather than a cosmetic patch. Do not buy wheel-arch panels, floor sections, windshield trim or rust treatment from this page; the location, depth, body style and repair section require hands-on inspection.',
        symptoms: ['Paint bubbling or seam swelling near a wheel arch or body joint', 'Wet carpet or visible corrosion under interior trim', 'Perforation, flaking metal or damage near a structural or suspension mounting point', 'Corrosion near windshield trim requiring glass-and-body inspection'],
        affectedSystems: ['Body panels, seams and floor structure', 'Wheel arches, jacking and suspension mounting areas', 'Windshield opening, exact condition unresolved'],
        citations: ['carAndDriverGuide', 'hemmingsGuide'],
        evidence: ['Car and Driver identifies wheel-arch and suspension-mount corrosion as inspection priorities on 1979-1993 Saab 900s.', 'Hemmings identifies multiple corrosion locations and trapped-moisture inspection points on 1986-1994 Saab 900 convertibles, while not proving the frozen all-trim composite.'],
        summary: 'Removed unsupported prevalence, hidden-rust sequence, price, annual trim-lifting, convertible-stiffener and restoration-provider claims; exposed the frozen 1979-1993 versus indexed 1990-1993 conflict.',
        conflict: 'The frozen title claims 1979-1993 while the indexed years are 1990-1993, and the title combines windshield-frame and rear-wheel-arch corrosion without exact evidence that they form one cross-trim recurring defect.',
        commerceDecision: 'corrosion location, depth, body style, prior repair and required panel section must be established by inspection; no universal retail part',
      },
    },
  },
};

const supportedModels = Object.freeze(Object.keys(contracts));
function getContract(model) {
  const contract = contracts[model];
  if (!contract) throw new Error(`Unsupported Saab model: ${model}`);
  return contract;
}

module.exports = { getContract, supportedModels };
