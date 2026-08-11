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
  '9-2X': {
    make: 'Saab',
    model: '9-2X',
    reviewDate: REVIEW_DATE,
    snapshotFile: SNAPSHOT_FILE,
    outputFile: 'data/known-issue-saab-9-2x-adjudication-2026-08-11.json',
    allIds: ['saab-9-2x-head-gasket-2.5'],
    retainedIds: [],
    reportCountCleanupIds: [],
    observations: [
      'Saab workshop information confirms the 9-2X 2.5i/Linear configuration and supplies the cylinder-head gasket replacement procedure, but does not label external head-gasket leakage a recurring 2005-2006 9-2X defect.',
      'A gasket-manufacturer technical note describes external oil leakage as a possible failure mode on Subaru EJ-series 2.5 L engines, but it does not establish 9-2X incidence, mileage, all listed years or the frozen cost range.',
      'Subaru WWP-99 is not used: it covered earlier 1999-2002 Subaru populations and external coolant leakage, not the frozen 2005-2006 Saab 9-2X external-oil identity.',
    ],
    pdfSources: {
      felProGuide: {
        url: 'https://www.felpro.com/content/dam/marketing/North-America/felpro/pdfs/article-bulletins/Fel-Pro%20TechTip_Solving%20Subaru%202.5L%20Head%20Gasket%20Problems%20With%20Fel-Pro.pdf',
        type: 'manufacturer',
        title: 'Fel-Pro technical note on Subaru 2.5 L head-gasket diagnosis',
        contains: ['External oil leak from failed gasket', 'EJ-series 2.5L boxer engine'],
      },
    },
    otherSources: {
      saabSpecification: {
        url: 'https://saabwisonline.com/9-2x-9346/2005/2-engine/mechanical-2-5i/general-description/technical-data/specification',
        type: 'manufacturer',
        title: 'Saab WIS 2005 9-2X 2.5i engine specification',
        contains: ['Saab 9-2X 2.5i Linear', 'single over-head camshaft'],
      },
      saabHeadInstallation: {
        url: 'https://saabwisonline.com/9-2x-9346/2005/2-engine/mechanical-2-5i/cylinder-head/adjustment-replacement/installation',
        type: 'manufacturer',
        title: 'Saab WIS 2005 9-2X 2.5i cylinder-head installation procedure',
        contains: ['Use new cylinder head gaskets', 'mating surface'],
      },
    },
    bulletinInventory: {
      method: 'Exact Saab 9-2X WIS and Subaru head-gasket campaign searches; WWP-99 was rejected as an earlier Subaru-only coolant-leak population.',
      exactDocuments: 2,
    },
    recallInventory: {
      method: 'No recall was used to substantiate this non-safety engine-leak identity.',
      exactCampaigns: 0,
    },
    modelAliases: ['9-2X', '9-2X 2.5i', '9-2X Linear'],
    searchTerms: ['head gasket external oil leak', 'head gasket coolant leak', '2.5i cylinder head'],
    relevantDocumentIds: [],
    campaigns: [],
    requiredProse: [
      {
        id: 'saab-9-2x-head-gasket-2.5',
        field: 'description',
        patterns: ['do not establish a recurring 2005-2006 Saab 9-2X defect', 'WWP-99 does not apply'],
      },
    ],
    content: {
      'saab-9-2x-head-gasket-2.5': {
        description: 'Saab workshop information confirms that the 9-2X 2.5i/Linear uses a 2,457 cc horizontally opposed SOHC engine and supplies a cylinder-head gasket installation procedure. A Fel-Pro technical note for Subaru EJ-series 2.5 L engines identifies external oil leakage as one possible head-gasket failure mode. Those documents do not establish a recurring 2005-2006 Saab 9-2X defect, an 80,000-150,000-mile onset or a universal front-of-engine leak location. Subaru service program WWP-99 does not apply: it addressed external coolant leakage on specified 1999-2002 Subaru vehicles, not this frozen Saab population. Oil or coolant observed near the head-to-block joint can also travel from another seal or component and requires source confirmation.',
        solution: 'Clean the area and have a Subaru/Saab-experienced technician identify the fluid and its highest fresh source; pressure testing, UV dye, cooling-system testing or a combustion-gas test may be appropriate depending on the symptoms. If a head-gasket leak is confirmed, use the exact 9-2X service procedure, new gaskets and measured checks of the head and block surfaces. Resurfacing, timing-belt service, idlers and water-pump replacement should follow measurements, maintenance history and component condition rather than an automatic rule. Stop driving if the engine overheats, loses coolant rapidly or oil pressure is affected. Do not buy a head-gasket kit, timing parts or water pump from this page; engine identification, leak source, machining needs and kit contents require VIN-level diagnosis.',
        symptoms: ['Fresh oil or coolant at the head-to-block joint after the engine is cleaned', 'Burning-fluid odor or smoke from fluid reaching hot exhaust parts', 'Coolant loss or overheating requiring immediate diagnosis', 'Leak traced to another upper-engine seal rather than the head gasket'],
        affectedSystems: ['2.5i cylinder-head sealing surfaces and gaskets', 'Cooling and lubrication systems, leak source unresolved', 'Timing-belt-area components, condition-dependent'],
        citations: ['saabSpecification', 'saabHeadInstallation', 'felProGuide'],
        evidence: ['Saab WIS identifies the 2.5i/Linear engine configuration and the exact cylinder-head installation sequence.', 'Fel-Pro documents external oil leakage as a possible EJ-series 2.5 L head-gasket failure mode but does not prove Saab 9-2X frequency or mileage.'],
        summary: 'Removed unsupported prevalence, mileage, price, universal leak location, gasket-brand recommendation and automatic resurfacing/timing-system replacement claims; added leak-source and measurement gates.',
        conflict: 'The frozen page converts a general EJ-series possible failure mode into a high-confidence, all-2005-2006 Saab 9-2X pattern with exact mileage, price and mandatory repair steps unsupported by a 9-2X-specific campaign.',
        commerceDecision: 'engine identity, leak source, surface measurements, maintenance history and kit contents require VIN-level diagnosis; no universal retail part',
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
