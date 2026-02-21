const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// BMW 7 Series issues
// E65/E66 (2002-2008): N62 V8, electrical nightmares
// F01/F02 (2009-2015): N63 V8 twin turbo
// G11/G12 (2016-2023): B58 inline-6, N63TU V8

const bmw7SeriesIssues = [
  {
    id: 'bmw-7series-n63-turbo-2009',
    make: 'BMW',
    model: '7 Series',
    years: { start: 2009, end: 2015 },
    title: 'N63 Turbocharger Failure - F01/F02 750i/750Li',
    severity: 'high',
    description: 'The N63 4.4L twin-turbo V8 in F01/F02 750i models suffers from premature turbocharger failures. The turbos are mounted in the "hot V" configuration (between cylinder banks) where excessive heat accelerates bearing wear and oil coking. Wastegate rattle and turbo seal failure are common between 60,000-100,000 miles. When one turbo fails, the other often follows soon after due to similar wear patterns. BMW issued a Customer Care Package extending warranty coverage to 10 years/120,000 miles for early N63 engines. Complete turbo replacement is extremely expensive due to labor-intensive removal.',
    symptoms: [
      'Whistling or whining noise from engine bay',
      'Wastegate rattle on acceleration (sounds like marbles)',
      'Blue smoke from exhaust (turbo seal failure)',
      'Loss of power or boost',
      'Check engine light with turbo codes (P0299, P003A, P003B)',
      'Oil consumption increase from failed seals'
    ],
    solution: 'Replace failed turbochargers. Both turbos should be replaced together to avoid repeat repairs. BMW N63 Customer Care Package covers repairs up to 10 years/120,000 miles on eligible VINs. Upgraded N63TU turbos from later models are more reliable. Labor is 15-20 hours due to complex hot-V configuration. Some owners opt for aftermarket upgraded turbos that address heat issues. Extremely expensive repair if out of warranty.',
    estimatedCost: { min: 7000, max: 12000 },
    recallTSB: 'BMW N63 Customer Care Package - 10yr/120k miles turbo coverage',
    communityRecommendations: [
      {
        type: 'part',
        content: 'BMW N63TU upgraded turbos - later generation with improved heat resistance',
        partBrand: 'BMW',
        partName: 'N63TU Turbocharger',
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Check if your VIN is covered under N63 Customer Care Package - can save $10k+',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Budget for turbo replacement on any N63 - it\'s when, not if, especially on early models',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Don\'t buy an N63 750i without warranty or Customer Care Package coverage',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-7series-n63-valvetronic-2009',
    make: 'BMW',
    model: '7 Series',
    years: { start: 2009, end: 2015 },
    title: 'N63 Valvetronic Motor Failure - F01/F02 750i/750Li',
    severity: 'moderate',
    description: 'The N63 engine uses BMW\'s Valvetronic system (variable valve lift) which commonly fails. The Valvetronic eccentric shaft motor wears out or burns out, causing rough running and limp mode. The system also suffers from carbon buildup on the Valvetronic mechanism. Failure typically occurs between 60,000-100,000 miles. Symptoms include rough idle, reduced power, and check engine lights. This is a separate issue from the turbo problems but equally common on early N63 engines. The N63 has two Valvetronic motors (one per cylinder bank).',
    symptoms: [
      'Rough idle or engine vibration',
      'Check engine light with Valvetronic codes (P1163, P1164)',
      'Limp mode activation (reduced power)',
      'Poor throttle response',
      'Increased fuel consumption',
      'Rattling noise from valve cover area'
    ],
    solution: 'Replace Valvetronic eccentric shaft motor(s). Often both motors need replacement since wear is similar. Clean carbon buildup from Valvetronic mechanism during repair. N63 Customer Care Package may cover this repair on eligible VINs. Labor is 6-10 hours. Some shops recommend replacing Valvetronic motors preventively at 80,000 miles to avoid being stranded. Extended warranty highly recommended for N63-powered 7 Series.',
    estimatedCost: { min: 2000, max: 4000 },
    recallTSB: 'BMW N63 Customer Care Package may cover',
    communityRecommendations: [
      {
        type: 'part',
        content: 'BMW OEM Valvetronic motor - critical component, use genuine BMW parts',
        partBrand: 'BMW',
        partName: 'Valvetronic Eccentric Shaft Motor',
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Replace both Valvetronic motors at once - they wear at similar rates',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'N63 is a maintenance nightmare - only buy with comprehensive warranty or deep pockets',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-7series-air-suspension-2002',
    make: 'BMW',
    model: '7 Series',
    years: { start: 2002, end: 2023 },
    title: 'Air Suspension Compressor & Strut Failure - All Generations',
    severity: 'moderate',
    description: 'BMW 7 Series models equipped with air suspension commonly experience compressor and air strut failures. The air suspension compressor runs frequently and wears out between 60,000-120,000 miles. Air struts develop leaks from deteriorating rubber airbags. Symptoms include suspension warning lights, sagging corners, and harsh ride quality. The system requires all four air struts and the compressor for proper operation. This affects E65/E66, F01/F02, and G11/G12 generations with air suspension option. Repair costs are extremely high due to specialized components.',
    symptoms: [
      'Suspension malfunction warning on dashboard',
      'Vehicle sits low or sags at one corner',
      'Compressor runs constantly (whining sound)',
      'Harsh ride quality or loss of adaptive damping',
      'Air suspension inactive message on iDrive',
      'Hissing sound from air leaks'
    ],
    solution: 'Replace failed air struts or compressor. Individual air struts can be replaced, but often multiple fail together. Compressor replacement is 3-5 hours labor. Some owners convert to conventional coil springs ($1,500-2,500) to avoid repeat air suspension repairs. Air strut replacement requires specialized tools and calibration. OEM BMW parts are extremely expensive; some aftermarket options (Arnott) available at lower cost but with mixed reliability.',
    estimatedCost: { min: 2500, max: 6000 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'Arnott air struts - remanufactured option, cheaper than BMW OEM but quality varies',
        partBrand: 'Arnott',
        partName: '7 Series Air Strut',
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Consider coil spring conversion if out of warranty - eliminates future air suspension repairs',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Air suspension is a $5k-8k repair waiting to happen on high-mileage 7 Series',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-7series-electrical-e65-2002',
    make: 'BMW',
    model: '7 Series',
    years: { start: 2002, end: 2008 },
    title: 'Widespread Electrical Issues - E65/E66 745i/750i/760i',
    severity: 'moderate',
    description: 'The E65/E66 7 Series is notorious for electrical gremlins and module failures. Common issues include iDrive system crashes, CCC (Car Communication Computer) failures, body control module faults, and random warning lights. The complex electrical architecture has poor reliability. Window regulators, seat motors, and electronic components fail frequently. Battery drain from parasitic draws is common. The E65 was BMW\'s first iDrive generation and had significant teething issues. These electrical problems make E65/E66 ownership very expensive and frustrating.',
    symptoms: [
      'iDrive screen freezing or rebooting randomly',
      'Multiple warning lights with no clear cause',
      'Battery drains overnight (parasitic draw)',
      'Windows, seats, or mirrors not functioning',
      'Key fob not recognized',
      'Various modules failing intermittently'
    ],
    solution: 'Diagnose specific module failures with BMW diagnostic software. Common fixes: CCC module replacement ($1,500-2,500), window regulator replacement ($300-600 per window), battery registration after replacement, and parasitic draw diagnosis. Many electrical issues require dealer-level diagnostics. Some problems can only be resolved with module replacements. E65/E66 ownership requires deep pockets or strong DIY skills. Avoid buying E65 without thorough pre-purchase inspection and warranty.',
    estimatedCost: { min: 500, max: 4000 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'warning',
        content: 'E65/E66 is one of the least reliable BMWs ever made - avoid unless you love expensive repairs',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Budget $3k-5k per year for electrical repairs on E65 - it\'s not a question of if, but when',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Never buy an E65 without comprehensive warranty - electrical repairs will bankrupt you',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-7series-hpfp-2009',
    make: 'BMW',
    model: '7 Series',
    years: { start: 2009, end: 2015 },
    title: 'High-Pressure Fuel Pump Failure - F01/F02 750i/750Li (N63)',
    severity: 'moderate',
    description: 'The N63 V8 engine uses high-pressure direct injection fuel pumps (HPFP) that commonly fail between 60,000-100,000 miles. The HPFP is driven by the engine camshaft and operates at extremely high pressures (2,900+ PSI). Internal wear and seal failures cause fuel pressure loss, leading to rough running, misfires, and no-start conditions. The N63 has two HPFPs (one per cylinder bank) that often fail together. Failed pumps can contaminate the fuel system with metal particles, requiring fuel system flush.',
    symptoms: [
      'Rough idle or engine stumble',
      'Long cranking or no-start condition',
      'Check engine light with fuel pressure codes (P0087, P0088)',
      'Loss of power or hesitation',
      'Engine misfires under load',
      'Fuel smell from engine bay'
    ],
    solution: 'Replace high-pressure fuel pump(s). BMW recommends replacing both HPFPs together on N63 engines. Flush fuel system if metal contamination is present. Use only OEM BMW or Bosch fuel pumps - aftermarket pumps have poor reliability. Labor is 4-6 hours. Some owners report multiple HPFP failures over vehicle life. N63 Customer Care Package may cover HPFP repairs on eligible VINs. Consider extended warranty for N63-powered cars.',
    estimatedCost: { min: 1500, max: 3000 },
    recallTSB: 'BMW N63 Customer Care Package may cover',
    communityRecommendations: [
      {
        type: 'part',
        content: 'BMW OEM high-pressure fuel pump - only use OEM, aftermarket pumps fail quickly',
        partBrand: 'BMW',
        partName: 'N63 High Pressure Fuel Pump',
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Replace both HPFPs together on N63 - labor overlap saves money and prevents second failure',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Failed HPFP can contaminate entire fuel system - requires expensive flush',
        upvotes: 0
      }
    ]
  }
];

console.log(`Adding ${bmw7SeriesIssues.length} BMW 7 Series issues...`);
knownIssues.issues.push(...bmw7SeriesIssues);

fs.writeFileSync(dbPath, JSON.stringify(knownIssues, null, 2));

console.log(`✓ Successfully added ${bmw7SeriesIssues.length} BMW 7 Series issues`);
console.log(`Total issues in database: ${knownIssues.issues.length}`);
