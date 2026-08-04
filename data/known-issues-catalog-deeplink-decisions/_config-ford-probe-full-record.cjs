const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.sources.map((item) => ({ type: item.type, label: item.title, url: item.url })),
    after: {
      years: card.years,
      trims: card.trims || [],
      engines: card.engines || [],
      category: card.category,
      title: card.title,
      description: card.description,
      solution: card.solution,
      severity: card.severity,
      confidence: 'high',
      symptoms: card.symptoms,
      affectedSystems: card.affectedSystems,
      dtcCodes: card.dtcCodes || [],
      estimatedCostLow: null,
      estimatedCostHigh: null,
      typicalMileageLow: null,
      typicalMileageHigh: null,
      citations: card.sources,
      source: 'manual',
      summary: card.summary,
    },
  };
}

const recalls = (year) => `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Probe&modelYear=${year}`;

const published = {
  'ford-probe-coolant-leak-1993': replacement(
    {
      years: [1993],
      trims: ['Certain vehicles identified by recall eligibility'],
      category: 'body',
      title: 'Liftgate Support-Strut Pivot-Pin Recall',
      description:
        'NHTSA campaign 93V058 covers certain 1993 Ford Probe vehicles. An undersized rivet head can allow the lower pivot pin joining a liftgate gas strut to its body bracket to separate, causing the liftgate to descend suddenly and potentially strike someone.',
      solution:
        'Check the VIN and recall-completion history with Ford. The recall directs replacement of liftgate strut assemblies whose lower pivot-pin rivet heads are undersized. Until the hardware is confirmed secure, support the liftgate and do not rely on a suspect strut to hold it open.',
      severity: 'high',
      symptoms: ['Loose or separating lower liftgate-strut pivot pin', 'Liftgate may descend unexpectedly'],
      affectedSystems: ['liftgate gas struts', 'lower strut pivot pins', 'lower strut mounting brackets'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 93V058 - Ford Probe Liftgate Strut Pivot Pin', url: recalls(1993) }],
      summary:
        'Replaced an uncited universal cooling-leak card with the exact 1993 Ford liftgate support-strut safety recall.',
    },
    'The frozen coolant card had no citation and prescribed wholesale hose, thermostat-housing, thermostat, and coolant replacement for every 1993-1997 Probe. Retain the exact Ford recall instead.',
  ),

  'ford-probe-cooling-system-neglect-leads-to-overheating-head-gasket-fail': replacement(
    {
      years: [1994],
      trims: ['Certain vehicles in Ford pre-delivery campaign 93V169'],
      category: 'safety',
      title: 'Passenger-Airbag Module Retention Campaign',
      description:
        'NHTSA campaign 93V169 covers certain 1994 Ford Probe vehicles. If the passenger airbag deploys with no passenger present, the module can detach from and deform its mounting bracket, which can impede installation of a replacement airbag. NHTSA describes this as a pre-delivery campaign whose vehicles were expected to remain in dealer inventory.',
      solution:
        'If campaign history is uncertain, ask Ford to confirm completion by VIN. The campaign installed a revised passenger-airbag module and a doubler on the mounting bracket. Because this was a pre-delivery action, do not assume a current vehicle is unrepaired from model year alone.',
      severity: 'medium',
      symptoms: ['No driver-observable warning is specified before airbag deployment'],
      affectedSystems: ['passenger frontal airbag module', 'passenger-airbag mounting bracket'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 93V169 - 1994 Ford Probe Passenger Airbag Retention', url: recalls(1994) }],
      summary:
        'Removed a secondary-source cooling-neglect narrative and retained the exact 1994 Ford pre-delivery airbag module-retention action with its limited context.',
    },
    'The frozen cooling card converts ordinary maintenance possibilities into a universal V6 defect and head-gasket diagnosis. Retain a defined Ford campaign without promising that a decades-old pre-delivery action remains open.',
  ),

  'ford-probe-distributor-1993': replacement(
    {
      years: [1995],
      trims: ['Certain vehicles and passenger-airbag modules identified by campaign eligibility'],
      category: 'safety',
      title: 'Passenger-Airbag Inflator Module Recall',
      description:
        'NHTSA campaign 95E006002 covers certain 1995 Ford Probe passenger-airbag modules. A crack in the inflator body or separation of the igniter end cap could prevent proper inflation, release hot gases, ignite flammable material, or cause burn injuries.',
      solution:
        'Check the VIN and campaign-completion history with Ford. The recall remedy replaces the passenger-side airbag module. Airbag service involves pyrotechnic components and must be performed using the manufacturer procedure by qualified personnel.',
      severity: 'high',
      symptoms: ['No reliable driver-observable symptom is specified before deployment'],
      affectedSystems: ['passenger frontal airbag module', 'airbag inflator body', 'inflator igniter end cap'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 95E006002 - Ford Passenger Airbag Inflator', url: recalls(1995) }],
      summary:
        'Replaced a forum-based five-year distributor failure claim with the exact 1995 Ford passenger-airbag inflator recall.',
    },
    'No Ford primary source in the frozen record establishes that both Probe engines share one integrated coil and sensor defect, a universal overheating cause, or automatic distributor replacement. Retain the exact Ford safety campaign instead.',
  ),

  'ford-probe-distributor-internal-oil-seal-failure-contaminates-crank-cam': replacement(
    {
      years: [1996],
      trims: ['Certain vehicles identified by recall eligibility'],
      category: 'safety',
      title: 'Missing Rear-Facing Child-Seat Airbag Warning Recall',
      description:
        'NHTSA campaign 96V090 covers certain 1996 Ford Probe vehicles whose driver-side sun-visor airbag caution label omitted the warning not to install a rear-facing child seat in a front passenger seating position. The label therefore did not meet FMVSS 208 requirements.',
      solution:
        'Confirm that the corrected caution label was installed. Ford sent owners a replacement label with installation instructions and allowed dealer installation. Regardless of label condition, follow the current owner-manual and child-restraint instructions and never place a rear-facing child seat in front of an active passenger airbag.',
      severity: 'high',
      symptoms: ['Required rear-facing child-seat warning text is missing from the driver-side sun-visor label'],
      affectedSystems: ['airbag caution label', 'child-restraint safety information'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 96V090 - Ford Probe Airbag Warning Label', url: recalls(1996) }],
      summary:
        'Replaced a duplicate forum-based distributor oil-seal narrative with the exact 1996 federal airbag-warning-label recall.',
    },
    'The frozen record duplicates the other distributor card and adds an unsupported internal-seal mechanism, mileage threshold, optical-sensor contamination, cleaning, used-part screening, and base-timing procedure without a Ford primary source.',
  ),

  'ford-probe-timing-belt-1993': replacement(
    {
      years: [1997],
      trims: ['Certain vehicles identified by recall eligibility'],
      category: 'engine',
      title: 'Timing-Belt Tensioner External-Spring Recall',
      description:
        'NHTSA campaign 98V206002 covers certain 1997 Ford Probe vehicles. An external spring in the timing-belt tensioner can break and become caught in the timing belt, which can cause the engine to stall.',
      solution:
        'Check the VIN and recall-completion history with Ford. Dealers were directed to inspect the timing-belt tensioner and replace it when necessary. Diagnose current belt noise, damage, or stalling independently rather than relying on the frozen card\'s unsupported interference-engine and maintenance-interval claims.',
      severity: 'high',
      symptoms: ['Possible engine stall if a broken tensioner spring interferes with the timing belt'],
      affectedSystems: ['timing-belt tensioner external spring', 'timing belt'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 98V206002 - 1997 Ford Probe Timing-Belt Tensioner', url: recalls(1997) }],
      summary:
        'Replaced an inaccurate five-year V6 timing-belt catastrophe claim with the exact 1997 tensioner-spring recall and inspection remedy.',
    },
    'Retain the actual Ford timing-system safety action while removing an uncited interference-engine assertion, universal 60,000-mile interval, catastrophic-damage promise, and bundled-parts prescription.',
  ),
};

const reasons = {
  'ford-probe-gf4a-el-4eat-automatic-transmission-slips-shifts-harshly-dev':
    'The frozen record relies on Wikipedia and an enthusiast forum, applies a detailed thrust-washer and seal-failure chain to every automatic Probe, and prescribes service, a shift kit, rebuild, remanufactured unit, cooler, or manual swap without a Ford-defined condition or source.',
  'ford-probe-pop-up-headlight-motors-seize-fail-from-corrosion-worn-gears':
    'Two Q&A and forum pages do not establish a Ford-wide corrosion and stripped-gear defect, water-intrusion mechanism, nighttime drop claim, stronger remanufactured gear, shared-Mazda replacement, or preventive service for every 1993-1997 Probe.',
  'ford-probe-power-window-motor-1993':
    'The frozen card has no citation and asserts premature burnout, undersized Mazda motors, driver-side prevalence, regulator survival, and a specific lubricant for every 1993-1997 Probe without primary evidence.',
  'ford-probe-timing-belt-failure-destroys-2-0l-i4':
    'This duplicate timing card relies on Q&A and forum sources, makes unsupported interference-engine and universal 60,000-mile assertions, and prescribes cylinder-head removal or engine replacement. The exact 1997 tensioner-spring recall is retained separately.',
};

module.exports = buildConfig({
  label: 'Ford Probe',
  make: 'Ford',
  model: 'Probe',
  slug: 'ford-probe',
  batchId: 'ford-probe-full-record-cohort-130-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'ec215b38d27b5fd5dbe4615ec4f50d891f061101964c9e465c572250ba9a9045',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-probe/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordprobe_blind:manual-primary-source-gate',
    edge: 'fordprobe_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
