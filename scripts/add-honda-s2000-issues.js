// Add Honda S2000 known issues (2000-2009, AP1 & AP2 generations)
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const s2000Issues = [
  // ===== ENGINE ISSUES =====
  {
    id: 'honda-s2000-vtec-oil-consumption-2000',
    vehicleMatch: {
      make: 'Honda',
      model: 'S2000',
      years: [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009],
    },
    category: 'Engine',
    title: 'VTEC Oil Consumption and Burning',
    description: 'High-revving F20C and F22C engines consume oil at higher rates than typical engines, especially in VTEC mode. Normal consumption is approximately 1 quart per 1,000 miles, but excessive consumption (more than 1qt/1000mi) indicates PCV valve clogging, worn valve guide seals, or cylinder wall scoring. Running oil levels 2+ quarts low prevents VTEC engagement. AP1 (2000-2003) more severe than AP2 (2004-2009). Many owners avoid Mobil 1 due to higher burn-off rates.',
    symptoms: [
      'Oil level dropping quickly between services',
      'Blue smoke on acceleration or in VTEC',
      'Weak VTEC engagement or no VTEC kick',
      'Fuel smell in oil (indicates PCV issue)',
      'Check engine light for VTEC system',
    ],
    solution: 'First: Check and replace PCV valve (~$50-150 parts, DIY friendly). If persists: Valve guide seal replacement requires engine opening (~$500-1,500). For severe cases: Full engine rebuild ($2,000-4,000). Use synthetic 0W-40 oil with high ZDDP (Pennzoil Ultra Platinum 0W-40, Redline, or Motul recommended). Check oil weekly. Change oil every 5,000 miles for track use.',
    estimatedCost: {
      low: 50,
      high: 4000,
    },
    severity: 'high',
    confidence: 95,
    tsb: null,
    recall: null,
    communityRecommendations: [
      { type: 'warning', content: 'Regular oil monitoring is MANDATORY - check weekly for high-mileage cars, never let oil drop more than 1 quart low', upvotes: 0, needsReview: true },
      { type: 'part', content: 'Use 0W-40 synthetic with ZDDP additives like Pennzoil Ultra Platinum 0W-40 - avoid Mobil 1 due to higher burn-off rate', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Change oil every 5,000 miles for track use, 7,500 for normal street driving', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Replace PCV valve first before expensive valve guide seal work - often solves the problem for $50-150', upvotes: 0, needsReview: true },
      { type: 'warning', content: 'Running 2+ quarts low prevents VTEC engagement and can cause engine damage - top off immediately', upvotes: 0, needsReview: true },
    ],
    humanApproved: false,
    lastReportedByOwners: '2024-02-19',
    reviewedOn: '2026-02-21',
    reportCount: 180,
    status: 'active',
  },

  {
    id: 'honda-s2000-valve-retainer-failure-2000',
    vehicleMatch: {
      make: 'Honda',
      model: 'S2000',
      years: [2000, 2001, 2002, 2003],
    },
    category: 'Engine',
    title: 'Valve Retainer Failure at High RPM (AP1)',
    description: 'Stock AP1 valve retainers crack or split when engine exceeds 9,000 RPM consistently. VTEC engagement raises valve spring pressure, and over-revving (money shifting or redline bouncing) causes keepers to fail, leading to catastrophic head damage. AP1 valve retainers start failing around 9,000 RPM under stress. AP2 improved retainers tolerate up to 9,700 RPM. This is a CRITICAL issue for track-day S2000s. Many owners proactively upgrade to AP2 retainers before track use.',
    symptoms: [
      'Sudden loss of power after over-rev event',
      'Ticking or rattling from cylinder head (pre-failure)',
      'Metal shavings in oil (post-failure)',
      'Engine knock or misfire after over-rev',
      'Catastrophic engine failure',
    ],
    solution: 'PREVENTIVE (Best Option): Install AP2 valve retainers on early AP1s (~$300-500 parts, ~$800-1,200 labor for head removal) = total $1,000-1,700. After Failure: Full cylinder head rebuild required ($2,000-3,500). For track use, AP2 retainers are MANDATORY upgrade. Proper shifting technique crucial - avoid downshifting into redline. Stay below 9,000 RPM if running stock AP1 retainers.',
    estimatedCost: {
      low: 1000,
      high: 3500,
    },
    severity: 'high',
    confidence: 90,
    tsb: null,
    recall: null,
    communityRecommendations: [
      { type: 'warning', content: 'For any track-day AP1 S2000, AP2 valve retainers are a MUST-DO upgrade before sustained high RPM use - prevents $2,000+ engine rebuild', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Never downshift into corners - shift before braking to avoid money-shifting into redline', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Stay below 9,000 RPM if running stock AP1 retainers - AP2 retainers tolerate up to 9,700 RPM', upvotes: 0, needsReview: true },
      { type: 'part', content: 'AP2 valve retainers and springs most common upgrade - Science of Speed also offers complete valve spring kits', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Always warm up engine before high RPM operation - cold oil and tight tolerances increase failure risk', upvotes: 0, needsReview: true },
    ],
    humanApproved: false,
    lastReportedByOwners: '2024-02-19',
    reviewedOn: '2026-02-21',
    reportCount: 85,
    status: 'active',
  },

  {
    id: 'honda-s2000-banjo-bolt-oil-starvation-2000',
    vehicleMatch: {
      make: 'Honda',
      model: 'S2000',
      years: [2000, 2001, 2002],
    },
    category: 'Engine',
    title: 'Banjo Bolt Oil Jet Insufficiency - Cylinder 4 Oil Starvation',
    description: 'Early AP1 banjo bolts (before VIN ~VT006255 or engine #F20C-1025386) have only 2 oil delivery holes instead of 4, restricting oil flow to cylinder walls. Cylinder 4 is most prone to oil starvation and scuffing, particularly under sustained high-RPM operation. This is a design flaw Honda never recalled in North America. Catastrophic failure can occur with NO symptoms until it happens. MUST-DO preventive upgrade for early AP1, especially track cars.',
    symptoms: [
      'Cylinder 4 wall scoring (only visible after engine teardown)',
      'No symptoms until catastrophic failure occurs',
      'Oil starvation damage from track use',
      'Engine seizure in worst cases',
    ],
    solution: 'PREVENTIVE: Replace 2-hole banjo bolts with 4-hole upgrade (Honda part #15290-PCX-000) ~$50 parts, DIY with basic tools ~1-2 hours = total $50-200. After Damage: Full engine rebuild required ($3,000-5,000). This is a MUST-DO preventive maintenance for any early AP1 before high-RPM driving or track use.',
    estimatedCost: {
      low: 50,
      high: 5000,
    },
    severity: 'high',
    confidence: 85,
    tsb: null,
    recall: null,
    communityRecommendations: [
      { type: 'warning', content: 'This is a MUST-DO preventive maintenance for any pre-mid-2002 AP1, especially track cars - $50 upgrade prevents $3,000+ engine rebuild', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Many owners do this upgrade even if no issues present due to severity of potential catastrophic failure', upvotes: 0, needsReview: true },
      { type: 'part', content: 'Use quality Honda 4-hole banjo bolts (part #15290-PCX-000) - not aftermarket substitutes for reliability', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'DIY installation possible with basic tools in 1-2 hours - very simple preventive upgrade', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Check VIN or engine number to determine if your early AP1 needs this upgrade - critical before track use', upvotes: 0, needsReview: true },
    ],
    humanApproved: false,
    lastReportedByOwners: '2024-02-19',
    reviewedOn: '2026-02-21',
    reportCount: 65,
    status: 'active',
  },

  // ===== TRANSMISSION ISSUES =====
  {
    id: 'honda-s2000-2nd-gear-synchro-grinding-2000',
    vehicleMatch: {
      make: 'Honda',
      model: 'S2000',
      years: [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009],
    },
    category: 'Drivetrain',
    title: 'Second Gear Synchronizer Grinding and Pop-Out',
    description: 'S2000 transmission has weak synchronizers, especially 2nd gear. AP1 (2000-2003): Grinding on downshift. AP2 (2004-2009): Gear lever pops out of 2nd/4th/6th during hard deceleration (2004-mid-2005 most common). Aggressive downshifting or fast shifting causes grinding. TSB 00-055 for AP1, TSB 05-009 for AP2. This is NOT a performance gearbox - requires slow, deliberate shifts.',
    symptoms: [
      'Grinding noise when shifting to 2nd gear (AP1)',
      'Gear lever pops out of 2nd/4th/6th under hard deceleration (AP2)',
      'Notchy or difficult shifts when cold',
      'Crunching sensation when downshifting',
      'Transmission feels notchy or resistant',
    ],
    solution: 'First attempt: Fluid change with GM Syncromesh fluid (~$50-100, DIY). Bleed and change clutch fluid (~$50-150). Adjust shifting technique - slower, deliberate shifts. If persists: Transmission rebuild or replacement (~$1,500-3,000). Some owners use Amsoil MTX transmission fluid for improved synchro life.',
    estimatedCost: {
      low: 50,
      high: 3000,
    },
    severity: 'medium',
    confidence: 90,
    tsb: '00-055 (AP1), 05-009 (AP2)',
    recall: null,
    communityRecommendations: [
      { type: 'part', content: 'Use quality MTF transmission fluid only - GM Syncromesh or Honda MTF recommended, avoid random oils', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Slow, deliberate shifts prevent wear - this is not a performance gearbox, shift smoothly', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Let transmission warm up before aggressive driving - shifts are notchy and resistant when cold', upvotes: 0, needsReview: true },
      { type: 'part', content: 'Some owners switch to Amsoil MTX transmission fluid for improved synchro life and smoother shifts', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Track drivers report using upshifts only to avoid synchro stress during competition driving', upvotes: 0, needsReview: true },
    ],
    humanApproved: false,
    lastReportedByOwners: '2024-02-19',
    reviewedOn: '2026-02-21',
    reportCount: 140,
    status: 'active',
  },

  // ===== DIFFERENTIAL ISSUES =====
  {
    id: 'honda-s2000-rear-differential-noise-2000',
    vehicleMatch: {
      make: 'Honda',
      model: 'S2000',
      years: [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009],
    },
    category: 'Drivetrain',
    title: 'Rear Differential Noise and Limited Slip Failure',
    description: 'S2000 uses Torsen limited-slip differential prone to noise and potential internal failure. CRITICAL: Some dealers mistakenly filled S2000 diffs with VTM-4 fluid (CR-V/Pilot spec), causing diffs to fail within hours to weeks. Honda has specific S2000 differential fluid requirement - using wrong fluid causes rapid catastrophic failure. Whining/clicking noise indicates backlash or wear. Limited slip function can fail (one wheel spins freely).',
    symptoms: [
      'Whining noise that increases with RPM',
      'Clicking after engine warm-up',
      'Loss of traction - single wheel spinning freely',
      'Clunking on acceleration',
      'Limited slip not engaging properly',
    ],
    solution: 'PREVENTIVE: Change differential fluid every 15,000 miles (Honda spec) with CORRECT Honda S2000 fluid only. Use only OEM Honda fluid or certified equivalent - NEVER VTM-4. Track cars should service diff every 10,000 miles. Avoid aggressive launches and hard shifts. Inspection/rebuild if noise develops: $1,500-2,500. Full replacement unit: $2,000-3,000+.',
    estimatedCost: {
      low: 150,
      high: 3500,
    },
    severity: 'high',
    confidence: 85,
    tsb: null,
    recall: null,
    communityRecommendations: [
      { type: 'warning', content: 'CRITICAL - verify dealer uses correct S2000 differential fluid, NOT VTM-4 - wrong fluid causes catastrophic failure within hours to weeks', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Never skip differential fluid changes - change every 15k miles street, 10k miles track use', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Document all fluid services to maintain warranty and verify correct fluid used', upvotes: 0, needsReview: true },
      { type: 'part', content: 'For track use, consider limited-slip differential upgrade from Quaife or similar - stronger than OEM Torsen', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Avoid aggressive launches and hard shifts - reduces differential stress and extends life', upvotes: 0, needsReview: true },
    ],
    humanApproved: false,
    lastReportedByOwners: '2024-02-19',
    reviewedOn: '2026-02-21',
    reportCount: 95,
    status: 'active',
  },

  // ===== SUSPENSION ISSUES =====
  {
    id: 'honda-s2000-compliance-bushing-failure-2000',
    vehicleMatch: {
      make: 'Honda',
      model: 'S2000',
      years: [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009],
    },
    category: 'Suspension',
    title: 'Compliance Bushing Failure (Front Lower Control Arm)',
    description: 'Front lower control arm has compliant (soft) rubber bushings that split and tear from road vibration and hard cornering. Typically shows wear at 80,000-100,000+ miles. Honda does not sell bushings separately - only full control arms (~$350+ each). Causes steering to feel loose or vague and increases understeer. Popular upgrade: aftermarket spherical compliance bushings (firmer, longer-lasting) from Spoon, Hardrace, or Energy Suspension.',
    symptoms: [
      'Steering feels loose or vague',
      'Increased understeer in corners',
      'Front end clunking over bumps',
      'Visible splits or tears in rubber bushing',
      'Uneven tire wear',
    ],
    solution: 'DIY Option: Replace with aftermarket spherical compliance bushings (firmer, longer-lasting) $400-600 parts + DIY labor. OEM: Replace full control arm ($300-400 per side) + labor = $600-800 both sides. Upgrade: Spoon or Mugen bushing kits provide improved feel and durability. Track cars: Hardrace spherical bearings (stiffer, better for motorsports).',
    estimatedCost: {
      low: 400,
      high: 800,
    },
    severity: 'medium',
    confidence: 85,
    tsb: null,
    recall: null,
    communityRecommendations: [
      { type: 'tip', content: 'Compliance bushings are a wear item - plan on replacement every 80k-100k miles for all S2000s', upvotes: 0, needsReview: true },
      { type: 'part', content: 'For track use, upgrade to Hardrace or Spoon spherical bushings - stiffer and more durable than OEM rubber', upvotes: 0, needsReview: true },
      { type: 'part', content: 'Energy Suspension polyurethane option more street-friendly than Hardrace for daily drivers', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Check at regular intervals to catch failure before it affects handling and causes tire wear', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Popular S2K track forums recommend preventive bushing replacement before motorsports use', upvotes: 0, needsReview: true },
    ],
    humanApproved: false,
    lastReportedByOwners: '2024-02-19',
    reviewedOn: '2026-02-21',
    reportCount: 110,
    status: 'active',
  },

  {
    id: 'honda-s2000-cv-joint-boot-wear-2000',
    vehicleMatch: {
      make: 'Honda',
      model: 'S2000',
      years: [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009],
    },
    category: 'Drivetrain',
    title: 'CV Joint and Boot Wear',
    description: 'CV joints wear and boots tear at 80,000+ miles, allowing grease to escape and dirt to enter. Repetitive clicking sounds indicate joint damage. Left CV joint typically fails first. CV boots tear from road debris and age. OEM Honda axles cost ~$876 but have strong reputation. Many aftermarket options use thinner intermediate shafts and poorly constructed joints - OEM quality critical.',
    symptoms: [
      'Repetitive clicking sound when accelerating through turns',
      'Clunking noise on deceleration',
      'Vibration at highway speeds',
      'Grease visible on inside of wheels',
      'Clicking increases with turning angle',
    ],
    solution: 'Early detection (just torn boot): Boot replacement with new grease (~$200-400). Joint wear: Full axle replacement necessary (~$400-600 per side). Professional install: $400-600 labor. OEM Honda axles or Ballade Sports OEM S2000 axles recommended for quality. Use quality CV grease (Redline CV-2 Red Moly, OEM Honda) with proper clamps (not hose clamps).',
    estimatedCost: {
      low: 200,
      high: 1200,
    },
    severity: 'medium',
    confidence: 80,
    tsb: null,
    recall: null,
    communityRecommendations: [
      { type: 'part', content: 'Replace with OEM or quality OEM-equivalent parts like Ballade Sports - aftermarket axles often use thinner shafts and poorly constructed joints', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Address boot failure quickly before joint damage occurs - saves $200-400 in axle replacement costs', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'If replacing one axle, both sides recommended for balanced handling and to avoid repeat labor costs', upvotes: 0, needsReview: true },
      { type: 'part', content: 'Use quality CV grease like Redline CV-2 Red Moly or OEM Honda with proper clamps (not hose clamps)', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'DIY axle replacement possible with basic tools - many S2Ki.com forum guides available', upvotes: 0, needsReview: true },
    ],
    humanApproved: false,
    lastReportedByOwners: '2024-02-19',
    reviewedOn: '2026-02-21',
    reportCount: 90,
    status: 'active',
  },

  // ===== SOFT TOP ISSUES =====
  {
    id: 'honda-s2000-soft-top-tears-2000',
    vehicleMatch: {
      make: 'Honda',
      model: 'S2000',
      years: [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009],
    },
    category: 'Body',
    title: 'Soft Top Tears and Rips',
    description: 'Canvas soft top material can tear at 100,000+ miles, especially at stress points like rear lock handle and passenger-side rear corner. Material degrades over time from UV exposure. Small tears can be repaired with Tear-Aid kits (~$20-40). Full replacement: $1,500-2,500 installed for standard vinyl, $2,500-3,500 for higher-quality Haartz Stayfast Cloth (3-ply composite). Regular conditioning with protective coating extends soft top life significantly.',
    symptoms: [
      'Visible tears in fabric at stress points',
      'Water leaks into interior during rain',
      'Deteriorating fabric texture',
      'Rear window clouding or separation',
      'Top material feels brittle or stiff',
    ],
    solution: 'Small tears: Tear-Aid repair kits (~$20-40). Medium damage: Professional stitching repair (~$200-400). Full replacement: New soft top ($1,500-2,500 installed) or higher-quality Haartz Stayfast Cloth (~$2,500-3,500). Preventive: Regular protective coating with Shinetsu or equivalent, avoid parking under trees/direct sun, use retractable sunshade for storage, gentle operation.',
    estimatedCost: {
      low: 20,
      high: 3500,
    },
    severity: 'medium',
    confidence: 90,
    tsb: null,
    recall: null,
    communityRecommendations: [
      { type: 'tip', content: 'Higher-quality Haartz Stayfast Cloth top is worth the extra $1,000 vs. cheaper vinyl - lasts significantly longer', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Regular conditioning with protective coating extends soft top life significantly - apply every 6 months', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Many track-day owners move to hardtops for durability - eliminates soft top maintenance entirely', upvotes: 0, needsReview: true },
      { type: 'part', content: 'Tear-Aid repair kits work well for small tears - $20-40 prevents $1,500+ replacement', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Avoid parking under trees and direct sun - UV exposure is the #1 cause of premature soft top failure', upvotes: 0, needsReview: true },
    ],
    humanApproved: false,
    lastReportedByOwners: '2024-02-19',
    reviewedOn: '2026-02-21',
    reportCount: 125,
    status: 'active',
  },

  {
    id: 'honda-s2000-rear-window-clouding-2000',
    vehicleMatch: {
      make: 'Honda',
      model: 'S2000',
      years: [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009],
    },
    category: 'Body',
    title: 'Rear Window Clouding, Creasing, and Scratching',
    description: 'Rear window (vinyl on soft top) can become clouded from road grime/oil film, creased from improper folding, or scratched from cleaning or rubbing. Clouding: Accumulation of road grime and dirt. Creasing: Permanent fold lines from improper top operation. Scratching: Damage from abrasive cleaning. PREVENTION CRITICAL - use "Miata tube" technique with foam or rolled towel inserted in rear window fold when lowering top to prevent creasing.',
    symptoms: [
      'Rear window appears cloudy or hazy',
      'Permanent crease lines visible in window',
      'Scratches on vinyl window surface',
      'Difficulty seeing through rear window',
      'Window appears yellowed or discolored',
    ],
    solution: 'PREVENTION: Insert foam tube or rolled towel in rear window fold when lowering to prevent creasing. Use soft cloths only - never abrasive materials. Clean in cool, shaded area to prevent vinyl stretching. Clean regularly with proper vinyl cleaner. Creases: Usually fade naturally after car sits in sun with top up (cosmetic only). Clouding: Frequent gentle cleaning with proper vinyl cleaner restores clarity. Scratches: No permanent fix - prevention is key.',
    estimatedCost: {
      low: 0,
      high: 250,
    },
    severity: 'low',
    confidence: 80,
    tsb: null,
    recall: null,
    communityRecommendations: [
      { type: 'tip', content: 'Use "Miata tube" technique with foam or towel - very popular among S2000 owners to prevent creasing', upvotes: 0, needsReview: true },
      { type: 'warning', content: 'Never scrub the rear window with abrasive materials - light cleaning only to prevent permanent scratches', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Some owners keep windows up when parked to minimize exposure and extend window life', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Regular gentle cleaning prevents permanent clouding - use proper vinyl cleaner in cool, shaded area', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Creases are usually harmless cosmetic issue that fades naturally after car sits in sun with top up', upvotes: 0, needsReview: true },
    ],
    humanApproved: false,
    lastReportedByOwners: '2024-02-19',
    reviewedOn: '2026-02-21',
    reportCount: 95,
    status: 'active',
  },

  // ===== ELECTRICAL ISSUES =====
  {
    id: 'honda-s2000-alternator-failure-2000',
    vehicleMatch: {
      make: 'Honda',
      model: 'S2000',
      years: [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009],
    },
    category: 'Electrical',
    title: 'Alternator Failure',
    description: 'Alternator can fail at 80,000+ miles, preventing battery charging. Internal voltage regulator (AP2 especially) can malfunction. AP1 and AP2 alternators are interchangeable. Symptoms include battery discharge, charging light illuminated, dimming headlights under load, weak starter cranking. OEM replacement recommended for reliability over remanufactured units.',
    symptoms: [
      'Battery discharge (dead battery after parking)',
      'Charging light illuminated during driving',
      'Dimming headlights under load',
      'Weak starter cranking',
      'Electrical system voltage drops below 13V',
    ],
    solution: 'Test alternator output (~$50-100 diagnostic). Replacement alternator: OEM $400-600, Remanufactured $200-300. OEM replacement recommended for reliability. Have charging system tested regularly. Voltage regulator replacement included in alternator replacement.',
    estimatedCost: {
      low: 200,
      high: 700,
    },
    severity: 'medium',
    confidence: 75,
    tsb: null,
    recall: null,
    communityRecommendations: [
      { type: 'tip', content: 'Have charging system tested regularly at 80k+ miles to catch alternator failure before stranding', upvotes: 0, needsReview: true },
      { type: 'part', content: 'OEM replacement recommended for reliability - remanufactured units often fail prematurely', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'The charging light issue can occur even on functional alternators - get voltage tested to confirm', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'AP1 and AP2 alternators are interchangeable - allows flexibility in parts sourcing', upvotes: 0, needsReview: true },
    ],
    humanApproved: false,
    lastReportedByOwners: '2024-02-19',
    reviewedOn: '2026-02-21',
    reportCount: 70,
    status: 'active',
  },

  {
    id: 'honda-s2000-window-regulator-failure-2000',
    vehicleMatch: {
      make: 'Honda',
      model: 'S2000',
      years: [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009],
    },
    category: 'Electrical',
    title: 'Window Regulator / Motor Failure',
    description: 'Automatic window regulators fail at 80,000+ miles, leaving windows stuck. More common in older cars. Can be expensive to repair at dealership ($400-600) but DIY replacement with aftermarket part is achievable (~$200-300). JDM regulator swaps available. Many enthusiasts replace DIY with basic tools.',
    symptoms: [
      'Window won\'t operate up or down',
      'Grinding noise when attempting to operate window',
      'Window stuck partially down',
      'Window operates very slowly',
      'Window falls into door',
    ],
    solution: 'Window regulator replacement: $400-600 at dealer. DIY replacement with aftermarket part: $200-300 (popular among enthusiasts). JDM regulator swaps available. DIY replacement is achievable with basic tools - many S2Ki.com guides available.',
    estimatedCost: {
      low: 200,
      high: 600,
    },
    severity: 'low',
    confidence: 75,
    tsb: null,
    recall: null,
    communityRecommendations: [
      { type: 'tip', content: 'DIY replacement is achievable with basic tools - saves $200-400 over dealer labor costs', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Aftermarket regulators are significantly cheaper than OEM dealer parts and work well', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'S2Ki.com has detailed DIY window regulator replacement guides with photos', upvotes: 0, needsReview: true },
      { type: 'part', content: 'JDM regulator swaps available as alternative to OEM or aftermarket options', upvotes: 0, needsReview: true },
    ],
    humanApproved: false,
    lastReportedByOwners: '2024-02-19',
    reviewedOn: '2026-02-21',
    reportCount: 85,
    status: 'active',
  },

  {
    id: 'honda-s2000-dashboard-bubbling-2006',
    vehicleMatch: {
      make: 'Honda',
      model: 'S2000',
      years: [2006, 2007, 2008, 2009],
    },
    category: 'Interior',
    title: 'Dashboard Bubbling and Wrinkling (AP2)',
    description: 'Dashboard surface can bubble, wrinkle, or blister from heat and UV exposure, particularly in hot climates. Primarily affects 2006+ AP2 models. Dashboard develops bubbles or wrinkles, sticky texture, shiny/warped appearance. Prevention with dashboard cover or sunshade (~$30-50) is key. Existing damage can be cleaned with isopropyl alcohol and matte dashboard protectant (~$30). Severe cases require OEM dashboard replacement ($800-1,500).',
    symptoms: [
      'Visible bubbles or wrinkles in dashboard',
      'Dashboard surface feels sticky',
      'Shiny or warped appearance on dashboard',
      'Dashboard delaminating from backing',
      'Texture changes on dash surface',
    ],
    solution: 'PREVENTION: Dashboard cover or sunshade (~$30-50). Existing damage: Clean with isopropyl alcohol and apply matte dashboard protectant (~$30). Severe cases: OEM dashboard replacement ($400-800 parts, $400-700 labor) = total $800-1,500. Park in shade when possible.',
    estimatedCost: {
      low: 30,
      high: 1500,
    },
    severity: 'low',
    confidence: 70,
    tsb: null,
    recall: null,
    communityRecommendations: [
      { type: 'tip', content: 'Dashboard cover or sunshade is cheap prevention ($30-50) - install before damage occurs', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Park in shade when possible - UV exposure is primary cause of dashboard bubbling', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'Clean with isopropyl alcohol and apply matte dashboard protectant for existing minor damage', upvotes: 0, needsReview: true },
      { type: 'tip', content: 'More common in hot climates (Southwest US) - prevention critical for these regions', upvotes: 0, needsReview: true },
    ],
    humanApproved: false,
    lastReportedByOwners: '2024-02-19',
    reviewedOn: '2026-02-21',
    reportCount: 55,
    status: 'active',
  },
];

// Add to database
data.issues.push(...s2000Issues);

// Write back
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');

console.log(`\n✓ Successfully added ${s2000Issues.length} Honda S2000 issues`);
console.log(`  Total issues in database: ${data.issues.length}`);
console.log('\nAdded:');
s2000Issues.forEach(issue => {
  const years = issue.vehicleMatch.years;
  console.log(`  - ${issue.title} (${years[0]}-${years[years.length - 1]})`);
});
