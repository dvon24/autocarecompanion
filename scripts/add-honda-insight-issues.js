const fs = require('fs');
const path = require('path');

const knownIssuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(knownIssuesPath, 'utf8'));

const newIssues = [
  {
    id: 'honda-insight-ima-battery-failure-2000',
    make: 'Honda',
    model: 'Insight',
    years: { start: 2000, end: 2022 },
    title: 'IMA Hybrid Battery Failure (All Generations)',
    severity: 'high',
    description: 'All Honda Insight generations (2000-2006, 2010-2014, 2019-2022) experience IMA (Integrated Motor Assist) hybrid battery failures, typically between 75,000-175,000 miles (8-15 years). Symptoms include IMA warning light, reduced fuel economy, lack of electric assist, poor acceleration, and frequent battery recalibrations. The battery cells degrade over time, especially in hot climates. First and second generation batteries are more prone to failure. Third generation (2019-2022) batteries have better warranty coverage (8yr/100k miles in CARB states, 3yr/36k elsewhere). Replacement cost: $1,500-4,000 depending on generation.',
    symptoms: [
      'IMA warning light on dashboard',
      'Reduced fuel economy (MPG drops significantly)',
      'Lack of electric motor assist during acceleration',
      'Poor acceleration and sluggish performance',
      'Battery gauge fluctuating or always empty',
      'Frequent battery recalibrations',
      'Check engine light with P1xxx hybrid codes'
    ],
    solution: 'Options: (1) OEM Honda replacement battery ($2,500-4,000 installed), (2) Refurbished battery from specialist like Bumblebee Batteries or HybridReVolt ($1,200-2,000), (3) DIY battery rebuild ($400-800 in parts if mechanically skilled). For 3rd gen (2019-2022), check warranty coverage - 8yr/100k in CARB states (CA, NY, etc). InsightCentral.net forum has extensive guides on battery testing, reconditioning, and replacement. Some owners bypass IMA entirely and run as gas-only ($0-300) but lose hybrid benefits.',
    estimatedCost: { min: 400, max: 4000 },
    recallInfo: 'No official recalls, but battery warranty extended in CARB states (8yr/100k miles). Check if your state qualifies.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'InsightCentral.net trusted rebuilders: Bumblebee Batteries ($1,500-1,800) and HybridReVolt ($1,200-2,000) - both offer warranties and have rebuilt 1,000+ Insight batteries.',
        partBrand: 'Bumblebee Batteries',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Battery doesn\'t "fail" instantly - slow charging/discharging gives warning weeks ahead. Monitor battery gauge and MPG for early detection.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Hot climates kill IMA batteries faster (Arizona, Texas, Florida). Parking in shade and avoiding extreme discharge extends life significantly.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'DIY rebuild: Individual cells cost $5-10 each (20 cells total). InsightCentral has step-by-step guides - saves $2,000+ if mechanically inclined.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-insight-fuel-pump-recall-2019',
    make: 'Honda',
    model: 'Insight',
    years: { start: 2019, end: 2022 },
    title: 'Fuel Pump Failure (NHTSA Recall)',
    severity: 'high',
    description: 'The 2019-2022 Honda Insight (third generation) has been recalled for fuel pump failures. The fuel pump impeller was improperly molded (low density), causing it to deform over time and interfere with the fuel pump body, rendering it inoperative. Symptoms include engine stalling while driving (especially highway speeds), rough idle, difficulty starting, and complete loss of power. Honda issued recall covering many 2019-2021 models. Free repair at Honda dealers - fuel pump module replacement.',
    symptoms: [
      'Engine stalls while driving',
      'Difficulty starting engine',
      'Engine cranks but won\'t start',
      'Rough idle or hesitation',
      'Check engine light with fuel codes (P0087, P0230)',
      'Loss of power during acceleration'
    ],
    solution: 'This is a SAFETY RECALL - contact Honda dealer immediately to schedule free fuel pump module replacement. Check if your VIN is affected at https://www.honda.com/recall or call 1-888-234-2138. Repair is FREE regardless of mileage/warranty. If vehicle stalls while driving, pull over safely and contact Honda roadside assistance.',
    estimatedCost: { min: 0, max: 0 },
    recallInfo: 'NHTSA Recall covering 2019-2021 Honda Insight models. Free fuel pump module replacement at Honda dealers.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'CRITICAL: Engine stalling at highway speeds is extremely dangerous. Schedule recall repair IMMEDIATELY even if no symptoms yet.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Recall was expanded multiple times - check your VIN even if you weren\'t affected initially. Gen3Insight.com forum tracks recall updates.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Repair takes 1-2 hours. Most dealers provide loaner since it\'s a safety recall.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-insight-cvt-transmission-judder-2010',
    make: 'Honda',
    model: 'Insight',
    years: { start: 2010, end: 2014 },
    title: 'CVT Transmission Judder and Failure (Second Gen)',
    severity: 'high',
    description: 'The 2010-2014 Honda Insight (second generation) CVT transmission experiences judder, shuddering, knocking noise during acceleration, and complete failure. Early CVT steel belt failures were identified. When CVT fails, the green "D" indicator on dash blinks. The transmission shudders at low speeds (15-35 mph) and makes knocking noises when shifting or accelerating. Honda extended CVT warranty to 10yr/150k miles on some models. CVT replacement: $3,000-5,000.',
    symptoms: [
      'Transmission shuddering or juddering',
      'Knocking noise from CVT when accelerating',
      'Green "D" indicator blinking on dashboard',
      'Hesitation during acceleration',
      'Grinding or whining noise from transmission',
      'Complete transmission failure (no movement)'
    ],
    solution: 'Early stage: CVT fluid replacement with genuine Honda CVTF ($150-250) may help. Severe cases: Complete CVT replacement ($3,000-5,000). Check if your Insight qualifies for Honda\'s extended CVT warranty (10yr/150k miles on some models). If CVT fails under warranty, Honda covers replacement. Keep records of all CVT fluid changes to support warranty claims. InsightCentral forum recommends changing CVT fluid every 25k-30k miles.',
    estimatedCost: { min: 150, max: 5000 },
    recallInfo: 'Honda extended CVT warranty to 10yr/150k miles on some 2010-2011 models. Check with dealer if your VIN qualifies.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Use ONLY genuine Honda CVTF fluid - aftermarket fluids destroy the CVT belt. InsightCentral members who used aftermarket had failures within 10k miles.',
        partBrand: 'Honda',
        partName: 'CVT Fluid (CVTF)',
        partNumber: '08200-9006',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Change CVT fluid every 25k-30k miles (not Honda\'s "lifetime" claim). Owners who follow this schedule report CVTs lasting 150k+ miles.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Blinking "D" indicator means CVT is failing - stop driving immediately and have it towed. Continuing to drive will destroy the CVT completely.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-insight-dcdc-converter-shutdown-2020',
    make: 'Honda',
    model: 'Insight',
    years: { start: 2020, end: 2021 },
    title: 'DC-DC Converter Shutdown (Loss of Drive Power)',
    severity: 'high',
    description: 'The 2020-2021 Honda Insight experiences DC-DC converter shutdowns that prevent the 12-volt battery from recharging, resulting in loss of drive power. The power converter unit (PCU) software has a defect that causes the DC-DC converter to shut down unexpectedly. Symptoms include electrical system warnings, loss of hybrid assist, and vehicle coming to a stop. Honda issued a recall/software update to fix the PCU software. Free repair at Honda dealers.',
    symptoms: [
      'Loss of drive power while driving',
      'Electrical system warning lights',
      '12V battery not recharging',
      'Hybrid system warnings',
      'Vehicle shuts down or loses power',
      'Battery discharge warnings'
    ],
    solution: 'This is a SAFETY RECALL/TSB - contact Honda dealer to schedule free power converter unit (PCU) software update. The update fixes the DC-DC converter shutdown issue. Repair is free regardless of warranty status. If you experience loss of power while driving, pull over safely and contact Honda roadside assistance.',
    estimatedCost: { min: 0, max: 0 },
    recallInfo: 'Honda recall for 2020-2021 Insight models. Dealers will update PCU software free of charge.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'CRITICAL: Loss of drive power is a safety issue. Schedule repair immediately even if no symptoms.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Software update takes 30-60 minutes. Gen3Insight.com members report issue fully resolved after update.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-insight-ground-cable-corrosion-2010',
    make: 'Honda',
    model: 'Insight',
    years: { start: 2010, end: 2014 },
    title: 'Ground Cable Internal Corrosion (No Start)',
    severity: 'medium',
    description: 'The 2010-2014 Honda Insight (second generation) has ground cables that corrode from the inside, preventing the vehicle from starting. There are three ground cables prone to corrosion: (1) between battery and firewall, (2) between left side and transmission, (3) between left side and air filter support. The cables look fine externally but are corroded internally, causing intermittent no-start conditions, electrical gremlins, and charging issues. Replacement: $50-200 for all three cables.',
    symptoms: [
      'No start condition (engine won\'t crank)',
      'Intermittent starting issues',
      'Electrical system glitches',
      'Battery not charging properly',
      'Dim lights or electrical accessories not working',
      'Clicking sound when trying to start'
    ],
    solution: 'Inspect all three ground cables for internal corrosion (cut open cable end to check). Replace corroded cables with new OEM or upgraded aftermarket cables ($50-200 for all three). DIY-friendly repair - takes 1-2 hours with basic hand tools. InsightCentral forum has detailed guides with photos. Preventive: Apply dielectric grease to cable terminals to prevent future corrosion.',
    estimatedCost: { min: 50, max: 200 },
    communityRecommendations: [
      {
        type: 'tip',
        content: 'DIY fix: Buy pre-made ground cable kit ($50-100 on Amazon) or make your own with marine-grade cable. InsightCentral has step-by-step guide.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use marine-grade tinned copper cable (resists corrosion) instead of OEM. InsightCentral members report zero corrosion after 5+ years.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Cables can LOOK fine but be corroded inside - if you have intermittent electrical issues, replace all three ground cables preventively.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-insight-12v-battery-issues-2010',
    make: 'Honda',
    model: 'Insight',
    years: { start: 2010, end: 2022 },
    title: '12V Battery Premature Failure',
    severity: 'medium',
    description: 'Honda Insight models (especially 2010-2014 and 2019-2022) experience premature 12V battery failures. The small 12V battery (not the IMA hybrid battery) dies unexpectedly, often within 2-3 years. Symptoms include no start, electrical gremlins, and hybrid system errors. The Insight uses a smaller 12V battery than other vehicles due to space constraints, and it\'s more sensitive to parasitic drain. Weak 12V battery can also trigger false IMA battery warnings.',
    symptoms: [
      'No start condition',
      'Clicking when trying to start',
      'Electrical system warnings',
      'Hybrid system errors (false warnings)',
      'Battery dies after sitting overnight',
      'Dim interior lights'
    ],
    solution: 'Replace 12V battery with AGM battery (better than flooded) rated for hybrid vehicles ($150-250). Test for parasitic drain if battery keeps dying (normal is <50mA). Common causes of drain: trunk light staying on, aftermarket accessories, faulty BCM. Charge battery with low-amp charger (2-amp max) - high amp charging can damage hybrid system electronics.',
    estimatedCost: { min: 150, max: 250 },
    communityRecommendations: [
      {
        type: 'part',
        content: 'Gen3Insight.com top pick: Interstate or DieHard AGM batteries - last 5+ years vs OEM lasting 2-3 years. Worth the extra $50.',
        partBrand: 'Interstate',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'NEVER jump-start a hybrid - use proper jump points in fuse box (see manual). Jumping at battery terminals can damage hybrid electronics.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Weak 12V battery can cause false IMA battery warnings. Replace 12V first before assuming IMA battery is bad - saves $1,000s.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-insight-catalytic-converter-failure-2000',
    make: 'Honda',
    model: 'Insight',
    years: { start: 2000, end: 2006 },
    title: 'Catalytic Converter Failure (First Gen)',
    severity: 'medium',
    description: 'The 2000-2006 Honda Insight (first generation) experiences premature catalytic converter failures. The lean-burn engine runs very lean, putting extra stress on the catalytic converter. Symptoms include check engine light with P0420/P0430 codes, rattling noise from exhaust, reduced power, and failed emissions test. OEM Honda catalytic converter: $1,200-2,000. Aftermarket: $400-800.',
    symptoms: [
      'Check engine light with P0420 or P0430 code',
      'Rattling noise from exhaust',
      'Reduced engine power',
      'Failed emissions test',
      'Sulfur smell from exhaust',
      'Poor fuel economy'
    ],
    solution: 'Replace catalytic converter with OEM Honda ($1,200-2,000) or high-quality aftermarket like MagnaFlow or Walker ($400-800). Cheap universal cats won\'t last on lean-burn engine. Address root cause: clogged EGR system can overheat and kill cat - clean EGR before replacing cat. InsightCentral recommends MagnaFlow Direct-Fit cats - last 100k+ miles.',
    estimatedCost: { min: 400, max: 2000 },
    communityRecommendations: [
      {
        type: 'part',
        content: 'InsightCentral consensus: MagnaFlow Direct-Fit catalytic converter - lasts 100k+ miles on lean-burn engine, passes emissions, costs $400-600.',
        partBrand: 'MagnaFlow',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Clean EGR system BEFORE replacing cat - clogged EGR overheats and kills new cats within 10k miles. Fix the root cause first.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Avoid ultra-cheap universal cats ($150-250) - they won\'t pass emissions on lean-burn Insight and fail quickly. Spend $400+ for direct-fit.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-insight-egr-system-clogging-2000',
    make: 'Honda',
    model: 'Insight',
    years: { start: 2000, end: 2006 },
    title: 'EGR System Clogging (Lean Burn Engine)',
    severity: 'medium',
    description: 'The 2000-2006 Honda Insight first generation with lean-burn engine experiences clogged EGR (exhaust gas recirculation) systems. The EGR valve and passages get clogged with carbon buildup, causing rough idle, hesitation, poor fuel economy, and check engine lights (P0401 code). The lean-burn operation creates excessive carbon. Cleaning EGR system: $150-400. Replacement: $300-600.',
    symptoms: [
      'Rough idle or stalling',
      'Hesitation during acceleration',
      'Poor fuel economy (MPG drops)',
      'Check engine light with P0401 code',
      'Engine runs rough in lean burn mode',
      'Loss of power'
    ],
    solution: 'Clean EGR valve and passages with carburetor cleaner or seafoam ($20-50 DIY, $150-400 shop). For severe cases, replace EGR valve ($300-600). DIY cleaning: Remove EGR valve, soak in carb cleaner overnight, clean passages with wire brush. InsightCentral recommends cleaning every 60k-80k miles preventively. Causes catalytic converter failure if ignored.',
    estimatedCost: { min: 20, max: 600 },
    communityRecommendations: [
      {
        type: 'tip',
        content: 'DIY EGR cleaning: Remove valve (2 bolts), soak in carb cleaner overnight, scrub with wire brush. Takes 1 hour, saves $200-300.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use Seafoam or Berryman B12 Chemtool to clean EGR passages - InsightCentral members swear by these for carbon removal.',
        partBrand: 'Seafoam',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Clogged EGR overheats catalytic converter and kills it - clean EGR every 60k miles to avoid $1,500 cat replacement.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-insight-bcm-communication-errors-2019',
    make: 'Honda',
    model: 'Insight',
    years: { start: 2019, end: 2020 },
    title: 'Body Control Module Communication Errors (BCM)',
    severity: 'medium',
    description: 'The 2019-2020 Honda Insight (third generation) experiences body control module (BCM) software errors causing communication disruptions between BCM and other components. This results in malfunctions of windshield wipers, defroster, rearview camera, and exterior lights. Honda issued a recall/software update to fix the BCM software. Free repair at Honda dealers.',
    symptoms: [
      'Windshield wipers not working properly',
      'Defroster not functioning',
      'Rearview camera display issues',
      'Exterior lights malfunctioning',
      'Intermittent electrical gremlins',
      'Warning lights on dashboard'
    ],
    solution: 'This is a SAFETY RECALL - contact Honda dealer to schedule free BCM software update. The update fixes communication errors between BCM and other modules. Repair is free regardless of warranty status.',
    estimatedCost: { min: 0, max: 0 },
    recallInfo: 'Honda recall for 2019-2020 Insight models. Dealers will update BCM software free of charge.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Software update takes 30-45 minutes. Gen3Insight.com members report all BCM issues resolved after update.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'BCM issues affect safety systems (wipers, lights, camera) - schedule repair promptly.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-insight-rear-suspension-noise-2010',
    make: 'Honda',
    model: 'Insight',
    years: { start: 2010, end: 2014 },
    title: 'Rear Suspension Clunking (Shock Absorber Failure)',
    severity: 'low',
    description: 'The 2010-2014 Honda Insight (second generation) experiences rear suspension clunking and noise over bumps and rough roads. The rear shock absorbers fail prematurely due to the excess weight of the hybrid battery in the rear. The clunking is most noticeable over speed bumps and potholes. Replacement rear shocks: $200-400 per pair.',
    symptoms: [
      'Clunking noise from rear suspension over bumps',
      'Rattling sound over rough roads',
      'Noise over speed bumps',
      'Bouncy or loose rear end',
      'Noise from one side or both'
    ],
    solution: 'Replace rear shock absorbers with OEM Honda or quality aftermarket (KYB, Monroe, Gabriel) shocks ($200-400 for pair + labor). DIY-friendly if you have basic tools - takes 1-2 hours. InsightCentral recommends KYB or Monroe shocks for better ride quality than OEM.',
    estimatedCost: { min: 200, max: 400 },
    communityRecommendations: [
      {
        type: 'part',
        content: 'InsightCentral top picks: KYB or Monroe Gas-Magnum shocks - better ride quality than OEM and cost 30% less.',
        partBrand: 'KYB',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'DIY-friendly - rear shocks are easy to replace (2 bolts per shock). Takes 1 hour, saves $150-200 in labor.',
        upvotes: 0,
        needsReview: true
      }
    ]
  }
];

newIssues.forEach(issue => {
  const exists = knownIssues.issues.some(existing => existing.id === issue.id);
  if (!exists) {
    knownIssues.issues.push(issue);
  }
});

fs.writeFileSync(knownIssuesPath, JSON.stringify(knownIssues, null, 2));

console.log(`✓ Successfully added ${newIssues.length} Honda Insight issues`);
console.log(`  Total issues in database: ${knownIssues.issues.length}`);
console.log('\nAdded:');
newIssues.forEach(issue => {
  const yearRange = `${issue.years.start}${issue.years.end !== issue.years.start ? `-${issue.years.end}` : ''}`;
  console.log(`  - ${issue.title} (${yearRange})`);
});
