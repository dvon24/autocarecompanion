const fs = require('fs');
const path = require('path');

const knownIssuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(knownIssuesPath, 'utf8'));

const bmwX7Issues = [
  {
    id: 'bmw-x7-n63-oil-consumption-2019',
    make: 'BMW',
    model: 'X7',
    years: { start: 2019, end: 2023 },
    title: 'N63TU3 Oil Consumption & Valve Stem Seal Degradation (xDrive50i/M50i/M60i)',
    severity: 'high',
    description: 'The N63TU3 4.4L twin-turbo V8 engine in X7 xDrive50i, M50i, and M60i (2019-2023) suffers from premature valve stem seal degradation causing excessive oil consumption. The hot-vee configuration where turbos sit between the cylinder banks creates extreme heat that degrades valve stem seals faster than normal. Oil consumption of 1 quart per 1,000 miles or more is common. BMW issued TSB MC-10149960-9999 acknowledging the issue. A class action settlement has been reached regarding N63 oil consumption. The repair is extremely labor-intensive requiring cylinder head removal. Elring seals 11340039494, 5150 AutoSport Viton seals ($150-200), and AGA Tools kit are recommended parts.',
    symptoms: [
      'Excessive oil consumption (1+ quart per 1,000 miles)',
      'Blue smoke from exhaust on startup or hard acceleration',
      'Fouled spark plugs from oil contamination',
      'Oil burning smell from exhaust',
      'Low oil warnings between oil changes',
      'Rough idle from oil-fouled spark plugs'
    ],
    solution: 'Replace valve stem seals - extremely labor-intensive job requiring cylinder head work ($4,900-12,000 total). Elring seals 11340039494 for OEM spec. 5150 AutoSport Viton upgraded seals ($150-200) recommended for better heat resistance. AGA Tools kit includes specialized tools required. Reference TSB MC-10149960-9999 when visiting dealer. Check eligibility for class action settlement coverage. Some owners monitor oil levels and top off rather than repair. Use quality synthetic 0W-40 BMW LL-01 spec oil and check level every 500-1,000 miles.',
    estimatedCost: { min: 4900, max: 12000 },
    recallInfo: 'TSB: MC-10149960-9999. Class action settlement for N63 oil consumption. Check eligibility with dealer.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Check eligibility for N63 oil consumption class action settlement before paying out of pocket. May cover partial or full repair costs.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: '5150 AutoSport Viton seals ($150-200) are upgraded aftermarket option with better heat resistance than OEM for hot-vee N63 application.',
        partBrand: '5150 AutoSport',
        partName: 'Viton Valve Stem Seals',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Check oil level every 500-1,000 miles on N63 engines. Carry extra quart in vehicle. Running low on oil causes bearing damage ($10,000+ engine replacement).',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Reference TSB MC-10149960-9999 when visiting dealer - ensures they acknowledge the known valve stem seal issue rather than dismissing oil consumption as "normal."',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x7-air-suspension-2019',
    make: 'BMW',
    model: 'X7',
    years: { start: 2019, end: 2023 },
    title: 'Air Suspension Compressor & Strut Failure (Standard Equipment)',
    severity: 'high',
    description: 'The X7 (2019-2023) comes standard with air suspension on all models, and it is one of the most failure-prone systems on the vehicle. Bimmerpost users describe this as a "massive design flaw." Air struts develop leaks from rubber deterioration, the compressor burns out from constant cycling to compensate for leaking struts, and the entire system can fail within 50,000-80,000 miles. Unlike other BMW SUVs where air suspension is optional, it is standard on ALL X7s - there is no way to avoid this issue. Front struts are particularly expensive at $1,500-2,000 each. The compressor 37206861882 costs $800-1,200. RebuildMasterTech offers rebuilt struts at $600-900 each as a more affordable alternative.',
    symptoms: [
      'Vehicle sits low on one or more corners',
      '"Chassis Function Restricted" warning message',
      'Compressor runs continuously or excessively',
      'Hissing sound from air struts',
      'Uneven ride height side-to-side or front-to-back',
      'Suspension warning lights on dashboard',
      'Rough or bouncy ride quality'
    ],
    solution: 'Replace failed air struts and/or compressor. Front strut left 37106869035 ($1,500-2,000), right 37106869036 ($1,500-2,000), rear 37106869039 ($1,000-1,500). Compressor 37206861882 ($800-1,200). RebuildMasterTech rebuilt struts ($600-900 each) are a more affordable alternative. Total repair can reach $2,180-5,000+ depending on which components have failed. Replace both struts on same axle simultaneously. Inspect at 50,000 miles for early signs of leaking.',
    estimatedCost: { min: 2180, max: 5000 },
    recallInfo: 'No official recall. Known design issue on X7 air suspension system.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'RebuildMasterTech rebuilt air struts ($600-900 each) are significantly cheaper than OEM ($1,500-2,000 each) and offer comparable performance.',
        partBrand: 'RebuildMasterTech',
        partName: 'Rebuilt Air Suspension Strut',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Air suspension is STANDARD on all X7s - there is no way to avoid this issue. Budget $2,000-5,000 for suspension repairs by 60,000-80,000 miles.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Replace both struts on same axle simultaneously to prevent uneven wear and premature failure of the other side.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Inspect air struts at every oil change after 50k miles. Catching a leak early prevents compressor burnout ($800-1,200 additional cost).',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x7-b58-coolant-2019',
    make: 'BMW',
    model: 'X7',
    years: { start: 2019, end: 2023 },
    title: 'B58 Coolant System Failures (xDrive40i)',
    severity: 'moderate',
    description: 'The B58 3.0L turbo inline-6 in X7 xDrive40i (2019-2023) suffers from multiple coolant system failures. The plastic expansion tank, thermostat housing, and coolant connections crack from heat cycling, causing coolant leaks and potential engine overheating. The electric water pump can also fail suddenly without warning at 60,000-80,000 miles. BMW issued recall 24V-608 for coolant pump connector issues on 2023+ models. These coolant system components are made from plastic that becomes brittle over time from repeated heating and cooling cycles. A single coolant leak left unaddressed can cascade into overheating, head gasket failure, and engine damage ($3,000-6,000+).',
    symptoms: [
      'Coolant level dropping without visible external leak',
      'Sweet coolant smell from engine bay',
      'Engine overheating warning',
      'Steam from engine bay or radiator area',
      'Coolant puddle under vehicle (pink/green fluid)',
      'Heater not blowing hot air (low coolant)',
      'Coolant warning light on dashboard'
    ],
    solution: 'Replace failed coolant system components. Water pump 11518482250 ($300-400). Thermostat 11537644811 ($150-250). Replace expansion tank and all plastic coolant connections when performing repair to prevent cascading failures. For 2023+ models, check VIN for recall 24V-608 coverage for coolant pump connector. Total repair $500-2,500 depending on extent of damage. PREVENTIVE: Replace thermostat and water pump at 60,000-70,000 miles before failure. Inspect coolant hoses and connections at every oil change after 50k miles.',
    estimatedCost: { min: 500, max: 2500 },
    recallInfo: 'Recall 24V-608 for coolant pump connector (2023+ models). Check VIN for eligibility.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Replace thermostat and water pump together at 60,000-70,000 miles - labor overlaps and prevents being stranded from sudden pump failure.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Water pump 11518482250 ($300-400) and thermostat 11537644811 ($150-250) are the key components. Replace both together to save on labor.',
        partBrand: 'BMW',
        partName: 'Electric Water Pump 11518482250',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If engine overheats, STOP IMMEDIATELY and shut off engine. Do not drive - call tow truck. Overheating damages head gaskets ($3,000-6,000+ repair).',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'For 2023+ X7 xDrive40i, check VIN for recall 24V-608 (coolant pump connector). FREE repair at dealer.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x7-ibs-brake-recall-2023',
    make: 'BMW',
    model: 'X7',
    years: { start: 2023, end: 2025 },
    title: 'IBS Brake System Recall',
    severity: 'high',
    description: 'Certain 2023-2025 BMW X7 models are affected by recall 24V-104 for the Integrated Braking System (IBS). This is a massive recall affecting approximately 1.5 million vehicles globally across multiple BMW models. Welds in the IBS servomotor may break, causing partial or complete loss of power-assisted braking. Without power brake assist, significantly more pedal force is required to stop the vehicle, dramatically increasing stopping distances and crash risk. This is a safety-critical recall that should be addressed immediately. The repair is FREE under the recall.',
    symptoms: [
      'Brake pedal feels hard or requires excessive force',
      'Longer stopping distances than normal',
      'Brake warning lights on dashboard',
      'Loss of power brake assist',
      'Unusual noise from brake system',
      'Brake system malfunction warning message'
    ],
    solution: 'This is a FREE repair under NHTSA recall 24V-104. Contact BMW dealer immediately to check VIN for recall eligibility. Dealer will inspect and replace the IBS servomotor at no charge. Do not delay - this is a safety-critical brake system issue affecting 1.5 million vehicles globally. If experiencing hard brake pedal, drive cautiously to dealer or have vehicle towed.',
    estimatedCost: { min: 0, max: 0 },
    recallInfo: 'NHTSA Recall 24V-104. Approximately 1.5 million vehicles affected globally. FREE repair at BMW dealer.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Check VIN immediately with BMW dealer or NHTSA.gov for recall 24V-104 eligibility. Repair is completely FREE.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'This is a safety-critical brake recall affecting 1.5M vehicles. Schedule repair IMMEDIATELY - loss of power braking at highway speed is extremely dangerous.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'When buying used 2023-2025 X7, check NHTSA.gov recall database to verify recall 24V-104 was completed before purchasing.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x7-48v-battery-2020',
    make: 'BMW',
    model: 'X7',
    years: { start: 2020, end: 2023 },
    title: '48V Mild Hybrid Battery Issues',
    severity: 'low',
    description: 'The 48V mild hybrid system in 2020-2023 X7 models experiences battery degradation and auto start-stop system failure. The 48V lithium-ion battery that powers the mild hybrid system and auto start-stop function degrades over time, losing capacity and eventually failing. When the 48V battery fails, the auto start-stop system stops functioning, the mild hybrid energy recovery is lost, and various electrical warning messages may appear. Replacement requires dealer-level diagnostic tools and coding - this is NOT a DIY repair. The 48V battery is separate from the main 12V battery and is located in the trunk area.',
    symptoms: [
      'Auto start-stop system stops functioning',
      'Mild hybrid system warning messages',
      'Reduced fuel economy from lost energy recovery',
      'Electrical system warning lights',
      'Battery-related fault codes',
      '48V system malfunction message on dashboard'
    ],
    solution: 'Replace the 48V mild hybrid battery ($1,000-2,000 at dealer). Requires dealer-level diagnostic tools and coding after installation - this is NOT a DIY repair. The 48V battery is separate from the main 12V battery. No aftermarket alternatives currently available. Check if vehicle is still under BMW warranty or extended warranty coverage. Some owners choose to live with the failed auto start-stop rather than pay for replacement.',
    estimatedCost: { min: 1000, max: 2000 },
    recallInfo: 'No official recall. Known issue with 48V mild hybrid system batteries.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Check if vehicle is still under BMW warranty before paying out of pocket. 48V battery may be covered under drivetrain or hybrid component warranty.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'This is dealer-only repair requiring specialized coding after battery replacement. Independent shops may not have proper tools.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Some owners choose to live with failed auto start-stop rather than pay $1,000-2,000 for 48V battery replacement. Vehicle drives fine without it.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x7-tire-wear-2019',
    make: 'BMW',
    model: 'X7',
    years: { start: 2019, end: 2023 },
    title: 'Premature Tire Wear (Especially 21"/22" Wheels)',
    severity: 'low',
    description: 'All X7 models (2019-2023) experience premature tire wear, particularly those equipped with 21" or 22" wheels. The aggressive factory camber settings, combined with the X7\'s 5,800 lb curb weight and staggered tire setup (different front/rear sizes), cause tires to wear unevenly and prematurely. Many owners report needing new tires at 15,000-25,000 miles versus the normal 40,000-50,000 mile lifespan. The staggered setup means tires cannot be rotated front-to-rear, accelerating uneven wear. Large wheel options (21"/22") have lower-profile tires that are more susceptible to pothole damage and wear faster due to stiffer sidewalls transmitting more load to the tread.',
    symptoms: [
      'Inner edge tire wear (from aggressive camber)',
      'Tires worn out by 15,000-25,000 miles',
      'Uneven tire wear patterns',
      'Increased road noise from worn tires',
      'Tire pressure monitoring warnings',
      'Visible feathering on tire edges'
    ],
    solution: 'Have alignment adjusted to reduce aggressive camber settings ($200-400). Switch to quality tires designed for heavy SUVs: Michelin Pilot Sport 4S or Continental PremiumContact 6 are recommended. If possible, avoid 22" wheels and opt for 21" or smaller for better tire longevity and ride comfort. Alignment adjustment can extend tire life from 15,000 to 30,000+ miles. Total cost $200-2,000 depending on tire replacement needs. Check alignment every 10,000 miles.',
    estimatedCost: { min: 200, max: 2000 },
    recallInfo: 'No recall. Design characteristic of heavy SUV with aggressive alignment settings.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Have alignment adjusted to reduce aggressive factory camber. Can extend tire life from 15,000 to 30,000+ miles. Worth $200-400 to save thousands on premature tire replacement.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Michelin Pilot Sport 4S or Continental PremiumContact 6 offer best tread life for X7 weight and performance. Avoid budget tires on 5,800 lb SUV.',
        partBrand: 'Michelin',
        partName: 'Pilot Sport 4S',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Avoid 22" wheels if tire cost is a concern. 21" or smaller wheels provide longer tire life, better ride comfort, and reduced pothole damage risk.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Staggered tire setup means tires CANNOT be rotated front-to-rear. Budget for more frequent tire replacement on X7.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x7-sunroof-leak-2019',
    make: 'BMW',
    model: 'X7',
    years: { start: 2019, end: 2023 },
    title: 'Panoramic Sunroof Water Leak',
    severity: 'low',
    description: 'The panoramic sunroof on X7 models (2019-2023) is prone to water leaks due to clogged drain tubes. The sunroof drain system has four tubes that channel water away from the sunroof tray to exit points under the vehicle. These tubes become clogged with debris (leaves, dirt, pollen) over time, causing water to back up and overflow into the cabin. Water damage can affect headliner, electronics, and interior trim. BMW issued TSB SIB 54 11 19 addressing the issue. In severe cases, the sunroof seal or drain tube connections may need replacement. Simple drain tube clearing costs $100-300, but water damage repair to interior components can reach $3,000.',
    symptoms: [
      'Water dripping from headliner or A/B pillar area',
      'Wet carpet or floor mats (especially front footwells)',
      'Musty or mildew smell in cabin',
      'Water stains on headliner',
      'Foggy windows (from moisture in cabin)',
      'Electrical malfunctions from water intrusion on modules'
    ],
    solution: 'Clear clogged sunroof drain tubes ($100-300 at shop). Reference TSB SIB 54 11 19 when visiting dealer. For persistent leaks, drain tube connections or sunroof seal may need replacement ($500-1,500). If water has damaged interior electronics, repair costs can reach $3,000. PREVENTIVE: Clear sunroof drains annually, especially in areas with heavy tree debris. Run compressed air or flexible drain snake through drain tubes during oil changes. Keep sunroof track clean of debris.',
    estimatedCost: { min: 100, max: 3000 },
    recallInfo: 'TSB: SIB 54 11 19. No official recall.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Clear sunroof drain tubes annually to prevent clogs. Compressed air or flexible drain snake through all four drain openings. Simple preventive maintenance saves thousands in water damage.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Reference TSB SIB 54 11 19 when visiting dealer for sunroof leak issues. Ensures proper diagnosis and repair procedure.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Don\'t ignore minor drips - water damage to headliner and electronics can escalate from $100 drain clearing to $3,000 in water damage repairs.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If parking under trees regularly, check sunroof drains every 6 months. Leaves and pollen are the primary cause of drain tube clogs.',
        upvotes: 0,
        needsReview: true
      }
    ]
  }
];

// Add new issues to the known issues array
knownIssues.issues.push(...bmwX7Issues);

// Write back to file
fs.writeFileSync(knownIssuesPath, JSON.stringify(knownIssues, null, 2));

console.log(`\u2713 Successfully added ${bmwX7Issues.length} BMW X7 issues`);
console.log(`  Total issues in database: ${knownIssues.issues.length}`);
console.log('\nAdded:');
bmwX7Issues.forEach(issue => {
  console.log(`  - ${issue.title} (${issue.years.start}-${issue.years.end})`);
});
