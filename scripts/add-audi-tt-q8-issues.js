const fs = require('fs');
const path = require('path');

const knownIssuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(knownIssuesPath, 'utf8'));

const ttQ8Issues = [
  // AUDI TT ISSUES (4 issues)
  {
    id: 'audi-tt-water-pump-2008',
    make: 'Audi',
    model: 'TT',
    years: { start: 2008, end: 2023 },
    title: 'Water Pump Failure (60k Mile Lifespan)',
    severity: 'moderate',
    description: 'The Audi TT across all generations (Mk2 2008-2015, Mk3 2016-2023) uses a plastic impeller water pump with a notorious 60,000-mile lifespan. The plastic impeller cracks or disintegrates from heat cycling, causing coolant leaks and overheating. Unlike other Audi models, the TT water pump is timing belt-driven (early 2.0 TFSI) or electric (later models), making it critical to replace during timing belt service. Symptoms include coolant puddles, sweet smell, overheating, and temperature gauge fluctuations. Ignoring a failed water pump causes severe overheating, warped cylinder heads, and blown head gaskets. TTForum.co.uk reports water pump as one of the most common TT failures, with many owners replacing preemptively at 60k miles.',
    symptoms: [
      'Coolant leak under front of car (pink/green puddle)',
      'Sweet smell under hood (burning coolant)',
      'Overheating in stop-and-go traffic',
      'Temperature gauge rising above normal',
      'Coolant warning light',
      'Hissing or gurgling from engine bay',
      'Steam from engine (severe overheating)'
    ],
    solution: 'Replace water pump AND thermostat together ($600-$1,200). If timing belt-driven, replace during timing belt service (every 80k-100k miles) to save labor. Use OEM or high-quality parts (Rein, Hepu)—cheap pumps fail within 20k miles. Flush cooling system and refill with OEM Audi G12++ or G13 coolant. Inspect all coolant hoses. PREVENTIVE REPLACEMENT: Many TT owners replace water pump at 60k miles before failure to avoid being stranded.',
    estimatedCost: { min: 600, max: 1200 },
    recallInfo: 'No recall. Water pump is routine maintenance.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'TTForum consensus: Replace water pump at 60k miles as preventive maintenance, BEFORE it fails. Cheap insurance against overheating and being stranded.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If timing belt-driven (early 2.0 TFSI), replace water pump during timing belt service at 80k-100k miles. Labor is already 80% done. Saves $300-$400.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use OEM Audi or German water pumps (Rein, Hepu). Cheap eBay pumps fail within 20k miles. Genuine pump lasts 60k-80k miles.',
        partBrand: 'Rein',
        partName: 'Engine Water Pump',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'NEVER ignore coolant leaks. Driving with low coolant warps cylinder heads ($2,000-$4,000 repair). Pull over immediately if temp gauge rises.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use ONLY G12++ or G13 Audi-spec coolant (pink/purple). Generic green coolant damages aluminum components.',
        partBrand: 'Pentosin',
        partName: 'Pentofrost A3 (G13)',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-tt-dsg-transmission-2008',
    make: 'Audi',
    model: 'TT',
    years: { start: 2008, end: 2015 },
    title: 'S-Tronic DSG Transmission Issues (Mk2)',
    severity: 'moderate',
    description: 'Early Mk2 TT models (2008-2009) with the 6-speed or 7-speed S-Tronic dual-clutch transmission (DSG) experience frequent mechatronic unit and clutch pack failures. Symptoms include rough or delayed shifting at low speeds, hesitation when accelerating, jerking when engaging gears, and complete transmission failure requiring tow. The mechatronic unit (valve body) suffers from software glitches and internal failures. Audi marketed DSG as "sealed for life," but fluid and filter changes every 40,000 miles dramatically reduce failure rates. Reports of DSG failures tapered off after 2009 model year with updated parts. Repair costs for mechatronic replacement are $2,000-$4,000. TTForum.co.uk reports many 2008-2009 owners experiencing this issue.',
    symptoms: [
      'Rough or delayed shifting, especially at low speeds',
      'Jerking or shuddering when accelerating',
      'Hesitation when pulling away from stop',
      'Clunking noise when shifting',
      'Check engine light with transmission codes (P0730)',
      'Transmission stuck in gear (won\'t shift)',
      'Complete transmission failure (no movement)'
    ],
    solution: 'For EARLY symptoms: DSG fluid and filter service ($400-$600) + software update from dealer. For MECHATRONIC failure: Replace mechatronic unit ($2,000-$4,000 installed). For CLUTCH failure: Replace clutch pack ($3,000-$5,000). PREVENTION: Service DSG every 40,000 miles despite Audi\'s "lifetime" claim. Use ONLY OEM Audi DSG fluid (G 052 182 A2). Avoid aggressive launches. If buying used, avoid 2008-2009 TT models—opt for 2010+ with updated DSG.',
    estimatedCost: { min: 400, max: 5000 },
    recallInfo: 'No recall. Audi issued software updates to improve DSG shift quality.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Avoid 2008-2009 TT models when buying used—highest DSG failure rate. 2010+ models have updated mechatronic and are far more reliable.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'SERVICE YOUR DSG! Despite "lifetime fluid" claim, change it every 40k miles. Use OEM Audi fluid (G 052 182 A2) ONLY. $500 service prevents $3,000+ repair.',
        partBrand: 'Audi OEM',
        partName: 'S-Tronic DSG Fluid (G 052 182 A2)',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Request software update from dealer first—often improves shift quality. Free for some models, $150-$300 for others.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If shifting worsens after fluid change, mechatronic or clutches are failing. Continuing to drive will cause complete failure. Budget for replacement soon.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'TTForum consensus: Properly serviced DSG is reliable. Neglected DSG will fail. Simple choice—spend $500 every 40k or $3,000+ later.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-tt-cam-follower-2008',
    make: 'Audi',
    model: 'TT',
    years: { start: 2008, end: 2014 },
    title: 'Cam Follower Wear (Damages Camshaft and HPFP)',
    severity: 'high',
    description: 'The 2.0 TFSI engine in the Mk2 TT (2008-2015, particularly 2008-2009 base and 2009-2014 TTS) uses a cam follower (bucket tappet) that rides on the camshaft to drive the high-pressure fuel pump (HPFP). This follower is a wear item that can get completely ground down over time, typically by 60,000-100,000 miles. When the follower wears through, it damages the camshaft lobe and HPFP, causing catastrophic engine damage requiring camshaft replacement ($2,000-$3,000), HPFP replacement ($800-$1,500), and potentially complete cylinder head rebuild ($4,000-$6,000). Symptoms include loss of power, rough running, metallic ticking, and fuel pressure faults. This is a KNOWN DEFECT requiring preventive inspection and replacement.',
    symptoms: [
      'Loss of power, especially under acceleration',
      'Rough running or misfires',
      'Loud metallic ticking from engine',
      'Check engine light with fuel pressure codes (P0087, P0088)',
      'Hard starting or extended cranking',
      'Engine stalling at idle',
      'Catastrophic failure if follower disintegrates'
    ],
    solution: 'PREVENTIVE INSPECTION: Inspect cam follower every 20,000-30,000 miles ($100-$200). If worn, replace immediately ($150-$300 parts + labor). DO NOT wait for symptoms—by then, camshaft and HPFP are already damaged. If camshaft is scored: Replace camshaft ($2,000-$3,000), HPFP ($800-$1,500), and cylinder head gasket. In severe cases, cylinder head requires rebuild ($4,000-$6,000). TTForum recommends checking follower at every oil change. This is cheap preventive maintenance that prevents $5,000+ repair.',
    estimatedCost: { min: 150, max: 6000 },
    recallInfo: 'No recall despite widespread failures. Audi considers cam follower a "wear item."',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'CRITICAL: Inspect cam follower every 20k-30k miles. If worn, replace IMMEDIATELY. Waiting destroys camshaft and HPFP—$5,000+ repair. $200 inspection prevents catastrophe.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If buying used 2008-2014 TT, verify cam follower has been inspected/replaced. If not, budget $2,000-$3,000 for camshaft/HPFP replacement. Many are already damaged.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use OEM Audi cam follower (Part #06D109309C). Costs $40-$60. Aftermarket followers wear faster. Replace every 60k-80k miles as preventive maintenance.',
        partBrand: 'Audi OEM',
        partName: 'Cam Follower',
        partNumber: '06D109309C',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'DIY-friendly: Cam follower inspection takes 30 minutes. Remove HPFP (4 bolts), pull follower, inspect for wear. YouTube has detailed guides. Save $150 in labor.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'TTForum consensus: This is TT\'s Achilles heel. Check follower religiously or pay the price. Many owners add inspection to every oil change routine.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-tt-tail-light-corrosion-2008',
    make: 'Audi',
    model: 'TT',
    years: { start: 2008, end: 2015 },
    title: 'Tail Light Electrical Connector Corrosion (Mk2)',
    severity: 'low',
    description: 'All Mk2 Audi TT models (2008-2015) suffer from corrosion of the electrical connectors for the tail lights. Water intrusion into the tail light housings causes the electrical connectors to corrode, leading to flickering tail lights, brake lights not working, turn signals malfunctioning, and bulb-out warning lights on the dashboard even with good bulbs. The corrosion is caused by poor seal design allowing moisture to enter. This affects all Mk2 model years and is one of the most commonly reported electrical issues on TTForum.co.uk. The fix requires cleaning or replacing the connectors and improving the seal. Left unaddressed, corrosion worsens and can cause electrical shorts.',
    symptoms: [
      'Tail lights flickering or not working',
      'Brake lights intermittent or non-functional',
      'Turn signals not working on one side',
      'Bulb-out warning on dashboard (with good bulbs)',
      'Water visible inside tail light housing',
      'Green corrosion on electrical connector',
      'Multiple bulb failures'
    ],
    solution: 'Remove tail light assembly, inspect electrical connector for green corrosion. CLEAN connector with electrical contact cleaner and wire brush ($20 DIY). Apply dielectric grease to prevent future corrosion ($10). If connector is severely corroded: Replace pigtail connector ($50-$100 parts). Improve tail light seal with silicone sealant around housing ($15). This is a DIY-friendly repair taking 1-2 hours. If paying shop, costs $150-$300. Address early before corrosion causes shorts.',
    estimatedCost: { min: 20, max: 300 },
    recallInfo: 'No recall despite affecting all Mk2 TT models. Audi does not acknowledge design flaw.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'This is easy DIY repair. Remove tail light (twist and pull), clean connector with electrical cleaner, apply dielectric grease, reseal housing. Saves $200+ in shop labor.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use CRC QD Electronic Cleaner to clean corrosion, then apply Permatex Dielectric Grease to prevent future corrosion. Total cost under $30.',
        partBrand: 'CRC',
        partName: 'QD Electronic Cleaner',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Check tail light connectors annually as preventive maintenance. Catch corrosion early before it damages wiring harness.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Apply silicone sealant around tail light housing perimeter after cleaning to improve water seal. Prevents moisture intrusion.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'TTForum has detailed DIY guides with photos. Search "Mk2 tail light corrosion fix" before paying shop $250.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },

  // AUDI Q8 ISSUES (3 issues)
  {
    id: 'audi-q8-carbon-buildup-2019',
    make: 'Audi',
    model: 'Q8',
    years: { start: 2019, end: 2023 },
    title: 'Severe Carbon Buildup on Intake Valves (3.0T)',
    severity: 'moderate',
    description: 'The Audi Q8 with the 3.0T V6 engine (2019-2023) suffers from severe carbon buildup on intake valves due to direct injection design. Similar to other Audi DI engines, fuel bypasses intake valves, leaving them exposed only to oil vapors from the PCV system which bake into hard carbon deposits. Over 60,000-100,000 miles, carbon restricts airflow causing rough idle, misfires, hesitation, and power loss. The 3.0T in the Q8 is particularly susceptible due to higher performance and oil vapor pressure. The ONLY effective fix is walnut blasting every 60,000 miles. This is preventive maintenance, not optional. Failure to clean can cause valve damage requiring engine work on the Q8\'s expensive V6.',
    symptoms: [
      'Rough or unstable idle',
      'Hesitation on acceleration',
      'Noticeable power loss',
      'Poor fuel economy (3-4 MPG drop)',
      'Check engine light with misfire codes',
      'Engine runs rough when cold',
      'Hard starting'
    ],
    solution: 'WALNUT BLASTING: Remove intake manifold and blast walnut shells through intake ports ($900-$1,500). Requires specialized equipment. Repeat every 60,000 miles as PREVENTIVE maintenance. PREVENTION: Install catch can ($400-$600) to filter PCV vapors—extends interval to 100k+ miles. Add Liqui Moly Intake Valve Cleaner to every oil change. Change oil every 5,000 miles.',
    estimatedCost: { min: 900, max: 1500 },
    recallInfo: 'No recall. Carbon buildup inherent to all DI engines.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Install catch can to filter vapors BEFORE they coat valves. APR makes Q8-specific kits for $400-$600. Extends cleaning from 60k to 100k+ miles.',
        partBrand: 'APR',
        partName: 'Baffled Oil Catch Can',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Get walnut blasting at 60k miles as preventive maintenance. Waiting for symptoms means carbon is severe.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Add Liqui Moly Intake Valve Cleaner to every oil change. Slows buildup. $15/bottle.',
        partBrand: 'Liqui Moly',
        partName: 'Intake Valve Clean',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'NEVER use chemical cleaners (Seafoam)—they don\'t reach valves on DI engines. Only walnut blasting works.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Change oil every 5,000 miles to reduce PCV vapor contamination.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-q8-mmi-electrical-2019',
    make: 'Audi',
    model: 'Q8',
    years: { start: 2019, end: 2023 },
    title: 'MMI Infotainment and Electrical Issues',
    severity: 'low',
    description: 'The Q8 (2019-2023) experiences MMI infotainment system failures including touchscreen freezing, system not booting, random reboots, and backup camera failures. Similar to other modern Audis, the complex electronics suffer from software glitches and module failures. Owners also report parking sensor malfunctions, warning lights, and battery drain. Most issues improve with software updates but some require MMI unit replacement ($2,000-$3,500). While frustrating, most are not safety-critical.',
    symptoms: [
      'MMI touchscreen frozen',
      'System won\'t turn on',
      'Random reboots',
      'Backup camera black screen',
      'Parking sensors malfunction',
      'Battery drain',
      'Warning lights'
    ],
    solution: 'MMI hard reset (hold power + volume up 10 seconds). If persistent, dealer software update ($150-$300). For severe cases: MMI replacement ($2,000-$3,500). Most covered under 4-year/50k warranty.',
    estimatedCost: { min: 150, max: 3500 },
    recallInfo: 'No recalls for general electrical issues.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'MMI hard reset fixes most freezing. Hold power + volume up 10 seconds.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Document issues under warranty and push for repairs.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'After warranty, live with minor glitches—$3,000 MMI replacement not worth it.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'For battery drain, get Battery Tender ($50) if car sits more than 3-4 days.',
        partBrand: 'Battery Tender',
        partName: 'Plus 1.25A Trickle Charger',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Test all electronics before buying used Q8—electrical issues are expensive.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'audi-q8-air-suspension-2019',
    make: 'Audi',
    model: 'Q8',
    years: { start: 2019, end: 2023 },
    title: 'Adaptive Air Suspension Issues',
    severity: 'moderate',
    description: 'The Q8 (2019-2023) uses adaptive air suspension that can fail prematurely. Air springs leak causing uneven height, compressor fails from overwork ($1,500-$2,500), and electronic control issues cause erratic behavior. Repair costs $800-$1,200 per corner or $3,000-$5,000 for all corners. Similar to A8/Q7 air suspension reliability issues.',
    symptoms: [
      'Air suspension warning light',
      'One corner sagging',
      'Bouncy ride',
      'Compressor running constantly',
      'Car stuck at low height',
      'Hissing from wheels'
    ],
    solution: 'Replace failed air spring(s) ($800-$1,200 per corner). If compressor failed: $1,500-$2,500. Alternative: Coil conversion ($2,500-$3,500) eliminates air suspension. Monitor warnings and fix leaks early.',
    estimatedCost: { min: 800, max: 5000 },
    recallInfo: 'No recall. Air suspension considered wear item.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Budget $3,000-$5,000 for air suspension on higher-mileage Q8. This is "when not if."',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Fix sagging corners immediately—forces compressor to run constantly, burning it out ($2,500).',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use OEM Audi air springs. Aftermarket fail within 30k miles.',
        partBrand: 'Audi OEM',
        partName: 'Air Suspension Strut',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Consider coil conversion ($2,500-$3,500) to eliminate future air suspension issues.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Air suspension is Q8\'s biggest reliability concern. Budget accordingly.',
        upvotes: 0,
        needsReview: true
      }
    ]
  }
];

// Add new issues to the known issues array
knownIssues.issues.push(...ttQ8Issues);

// Write back to file
fs.writeFileSync(knownIssuesPath, JSON.stringify(knownIssues, null, 2));

console.log(`✓ Successfully added ${ttQ8Issues.length} Audi TT + Q8 issues`);
console.log(`  Total issues in database: ${knownIssues.issues.length}`);
console.log('\nAdded:');
ttQ8Issues.forEach(issue => {
  console.log(`  - [${issue.model}] ${issue.title} (${issue.years.start}-${issue.years.end})`);
});
