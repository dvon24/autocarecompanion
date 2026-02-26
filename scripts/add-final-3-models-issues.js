const fs = require('fs');
const path = require('path');

const issuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(issuesPath, 'utf8'));
const existingIds = new Set(data.issues.map(function(i) { return i.id; }));

const newIssues = [
  // Chevrolet Trailblazer (2021-2026) - subcompact crossover, NOT the old TrailBlazer
  {
    id: 'chevrolet-trailblazer-cvt-shudder-2021',
    make: 'Chevrolet', model: 'Trailblazer',
    title: 'CVT Transmission Shudder and Hesitation',
    description: 'The Trailblazer with the 1.2L turbo and CVT automatic develops shudder during light acceleration and hesitation from stops. Some owners report a rubber-band feel typical of CVT calibration issues.',
    category: 'transmission', severity: 'moderate',
    years: { start: 2021, end: 2026 },
    estimatedCost: { min: 0, max: 3500 },
    symptoms: ['Shuddering at low speeds', 'Hesitation from stops', 'Rubber-band acceleration feel', 'Whining noise from transmission'],
    commonFixes: ['CVT software recalibration (covered under warranty)', 'CVT fluid change ($150-$300)', 'CVT replacement ($2500-$3500 if out of warranty)'],
    dtcCodes: ['P0700', 'P0730', 'P0868']
  },
  {
    id: 'chevrolet-trailblazer-turbo-oil-consumption-2021',
    make: 'Chevrolet', model: 'Trailblazer',
    title: '1.2L/1.3L Turbo Engine Oil Consumption',
    description: 'The small-displacement turbo engines in the Trailblazer can consume oil between changes, particularly the 1.2L 3-cylinder. Some owners report needing to add oil between the 7,500-mile change intervals.',
    category: 'engine', severity: 'moderate',
    years: { start: 2021, end: 2026 },
    estimatedCost: { min: 0, max: 2000 },
    symptoms: ['Low oil level between changes', 'Oil consumption above 1 qt per 2000 miles', 'No visible leaks', 'Oil life monitor depleting quickly'],
    commonFixes: ['Monitor oil level regularly', 'Oil consumption test at dealer (warranty)', 'Piston ring replacement if excessive ($1500-$2000)'],
    dtcCodes: ['P0171', 'P0174']
  },

  // Jeep Grand Cherokee L (2021-2026) - 3-row version
  {
    id: 'jeep-grand-cherokee-l-etorque-issues-2021',
    make: 'Jeep', model: 'Grand Cherokee L',
    title: 'eTorque Mild Hybrid System Malfunctions',
    description: 'The eTorque 48V mild hybrid system on the 3.6L V6 Grand Cherokee L experiences starter/generator failures, battery module issues, and auto start-stop malfunctions. The system can cause rough restarts and hesitation.',
    category: 'electrical', severity: 'moderate',
    years: { start: 2021, end: 2026 },
    estimatedCost: { min: 200, max: 2500 },
    symptoms: ['Rough restart from auto stop', 'eTorque warning light', 'Start-stop not functioning', 'Battery warning messages', 'Hesitation on acceleration from stop'],
    commonFixes: ['eTorque module software update (warranty)', '48V battery replacement ($500-$1200)', 'eTorque motor/generator replacement ($1500-$2500)'],
    dtcCodes: []
  },
  {
    id: 'jeep-grand-cherokee-l-infotainment-uconnect5-2021',
    make: 'Jeep', model: 'Grand Cherokee L',
    title: 'Uconnect 5 Infotainment Freezing and Lag',
    description: 'The Uconnect 5 system in the Grand Cherokee L experiences frequent freezing, touchscreen lag, wireless CarPlay/Android Auto disconnections, and occasional black screen events requiring a hard reset.',
    category: 'electrical', severity: 'low',
    years: { start: 2021, end: 2026 },
    estimatedCost: { min: 0, max: 200 },
    symptoms: ['Touchscreen freezing', 'Black screen', 'CarPlay/Android Auto disconnecting', 'Slow response to inputs', 'Backup camera delay'],
    commonFixes: ['Software update (free at dealer)', 'Hard reset (hold power and tuning buttons)', 'Uconnect module replacement ($500-$1500 if out of warranty)'],
    dtcCodes: []
  },

  // RAM 1500 Classic (2019-2024) - continuation of DS/DJ generation
  {
    id: 'ram-1500-classic-hemi-lifter-failure-2019',
    make: 'RAM', model: '1500 Classic',
    title: '5.7L HEMI MDS Lifter Failure',
    description: 'The 5.7L HEMI with Multi-Displacement System (MDS) in the 1500 Classic develops lifter failure, particularly on cylinders that deactivate. The roller lifters can collapse or seize, causing ticking noise and misfires. This is the same issue as the standard 1500.',
    category: 'engine', severity: 'high',
    years: { start: 2019, end: 2024 },
    estimatedCost: { min: 2000, max: 5000 },
    symptoms: ['Ticking or tapping noise from engine', 'Misfire codes', 'Check engine light', 'Rough idle', 'Loss of power on affected cylinder'],
    commonFixes: ['Lifter replacement ($2000-$4000)', 'MDS delete kit ($500-$1000 parts + labor)', 'Camshaft and lifter replacement ($3000-$5000)'],
    dtcCodes: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'P0305', 'P0306', 'P0307', 'P0308']
  },
  {
    id: 'ram-1500-classic-exhaust-manifold-bolts-2019',
    make: 'RAM', model: '1500 Classic',
    title: '5.7L HEMI Exhaust Manifold Bolt Breakage',
    description: 'The exhaust manifold bolts on the 5.7L HEMI break due to thermal cycling, causing an exhaust leak with a ticking sound that is louder on cold starts and quiets as the engine warms up.',
    category: 'engine', severity: 'moderate',
    years: { start: 2019, end: 2024 },
    estimatedCost: { min: 500, max: 1500 },
    symptoms: ['Ticking noise on cold start', 'Exhaust smell', 'Ticking decreases when warm', 'Visible exhaust leak at manifold'],
    commonFixes: ['Exhaust manifold bolt extraction and replacement ($500-$1000)', 'Exhaust manifold replacement ($800-$1500)', 'Updated bolt design'],
    dtcCodes: ['P0420', 'P0430']
  }
];

let added = 0;
newIssues.forEach(function(issue) {
  if (existingIds.has(issue.id)) {
    console.log('  SKIP (duplicate): ' + issue.id);
    return;
  }
  data.issues.push(issue);
  existingIds.add(issue.id);
  added++;
});

fs.writeFileSync(issuesPath, JSON.stringify(data, null, 2));
console.log('Final 3 Models Issues:');
console.log('  Added: ' + added + ' issues');
console.log('  Total issues now: ' + data.issues.length);
console.log('  Models covered: Chevrolet Trailblazer, Jeep Grand Cherokee L, RAM 1500 Classic');
