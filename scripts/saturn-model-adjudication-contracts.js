const SNAPSHOT_FILE = 'data/_saturn-deeplink-snapshot-2026-08-11.json';
const REVIEW_DATE = '2026-08-11';

const contracts = {
  Astra: {
    make: 'Saturn',
    model: 'Astra',
    reviewDate: REVIEW_DATE,
    snapshotFile: SNAPSHOT_FILE,
    outputFile: 'data/known-issue-saturn-astra-adjudication-2026-08-11.json',
    allIds: ['saturn-astra-1.8-timing-chain'],
    retainedIds: [],
    reportCountCleanupIds: [],
    observations: [
      'The frozen title and body identify a timing chain, but the 2008 Saturn Astra factory procedure specifies a toothed timing belt for the U18XER/Z18XER application.',
      'The owner manual treats a water pump as one possible cooling-system leak source; it does not establish a recurring pump-failure population, a timing-system jam mechanism or an 80,000-130,000-mile onset.',
      'No captured primary evidence supports the frozen price ranges, parts-scarcity claim, preventive pump-plus-timing-kit mandate or the three attached DTCs as one recurring defect identity.',
    ],
    pdfSources: {
      ownerManual: {
        url: 'https://experience.gm.com/ownercenter/content/dam/gmownercenter/gmna/dynamic/manuals/2008/saturn/astra/2008_saturn_astra_owners.pdf',
        type: 'manufacturer',
        title: '2008 Saturn Astra Owner Manual',
        contains: ['water pump', 'Get any leak fixed before you drive the vehicle'],
      },
    },
    otherSources: {
      timingBeltProcedure: {
        url: 'https://charm.li/Saturn/2008/Astra%20L4-1.8L/Repair%20and%20Diagnosis/Maintenance/Timing%20Belt/Service%20and%20Repair/',
        type: 'manufacturer-service-manual-mirror',
        title: '2008 Saturn Astra factory service procedure: Timing Belt Replacement',
        contains: ['Timing Belt Replacement', 'U 18 XER engine', 'Remove the toothed belt'],
      },
      timingSpecifications: {
        url: 'https://charm.li/Saturn/2008/Astra%20L4-1.8L/Repair%20and%20Diagnosis/Engine%2C%20Cooling%20and%20Exhaust/Engine/Timing%20Components/Specifications/',
        type: 'manufacturer-service-manual-mirror',
        title: '2008 Saturn Astra factory timing-component specifications',
        contains: ['Timing Belt Deflection Pulley'],
      },
    },
    bulletinInventory: {
      method: 'Exact 2008-2009 Saturn Astra, U18XER/Z18XER, water-pump and timing-system searches plus review of the factory service procedure and official owner manual.',
      exactDocuments: 3,
    },
    recallInventory: {
      method: 'No safety recall was used to substantiate this maintenance or leak identity.',
      exactCampaigns: 0,
    },
    modelAliases: ['Astra', 'Astra H', 'U18XER', 'Z18XER'],
    searchTerms: ['water pump leak', 'timing belt', 'timing chain', 'coolant leak', 'cam crank correlation'],
    relevantDocumentIds: [],
    campaigns: [],
    requiredProse: [
      {
        id: 'saturn-astra-1.8-timing-chain',
        field: 'description',
        patterns: ['uses a toothed timing belt, not a timing chain', 'do not establish a recurring water-pump defect'],
      },
    ],
    content: {
      'saturn-astra-1.8-timing-chain': {
        description: 'The frozen title calls this a timing-chain condition, but the factory service procedure for the 2008 Saturn Astra 1.8 L U18XER/Z18XER uses a toothed timing belt, not a timing chain. The official owner manual lists the water pump only as one possible source when coolant is low and instructs owners to repair a confirmed leak before driving. Those documents do not establish a recurring water-pump defect across 2008-2009 Astras, do not support an 80,000-130,000-mile onset and do not show that a pump can jam a timing chain on this engine. Coolant loss, front-engine noise, a timing fault or a misfire can have different causes and must be diagnosed separately.',
        solution: 'If coolant is low, the engine overheats or a fresh leak is present, stop as conditions require, allow the cooling system to cool and have the highest fresh leak source identified before further driving. A technician should inspect the water pump, hoses, reservoir, radiator and other cooling-system points and separately inspect timing-belt condition and synchronization using the factory procedure. Diagnostic trouble codes must be read with freeze-frame data and tested rather than treated as proof of one failed component. Do not buy a water pump, timing belt kit, camshaft adjuster or crankshaft sensor from this page; the frozen timing-chain identity is incorrect and the leak source, engine verification, maintenance history and required repair must be established first.',
        symptoms: ['Coolant below the cold-level mark or a verified external coolant leak', 'Engine-overheat warning requiring immediate attention', 'Front-engine noise requiring source isolation', 'Camshaft/crankshaft timing or misfire symptoms requiring code-specific diagnosis'],
        affectedSystems: ['Cooling system, exact leak source unresolved', 'U18XER/Z18XER toothed timing-belt system', 'Engine management and variable valve timing, diagnosis-dependent'],
        citations: ['timingBeltProcedure', 'timingSpecifications', 'ownerManual'],
        evidence: ['The factory service procedure identifies a toothed timing belt on the U18XER application and provides its removal and installation sequence.', 'The official owner manual identifies the water pump as one possible coolant-leak source but does not characterize a recurring failure pattern or timing-system jam.'],
        summary: 'Corrected the timing-chain error, removed unsupported prevalence, mileage, DTC, cost, scarcity and mandatory combined-replacement claims, and added separate leak and timing-system diagnostic gates.',
        conflict: 'The immutable title identifies timing-chain wear even though the factory procedure specifies a toothed timing belt, and no exact primary evidence supports the claimed recurring water-pump failure mechanism.',
        commerceDecision: 'coolant-leak source, belt condition, engine identity, maintenance history and diagnostic findings must be established before selecting any component; no universal retail part',
      },
    },
  },
};

const supportedModels = Object.freeze(Object.keys(contracts));
function getContract(model) {
  const contract = contracts[model];
  if (!contract) throw new Error(`Unsupported Saturn model: ${model}`);
  return contract;
}

module.exports = { getContract, supportedModels };
