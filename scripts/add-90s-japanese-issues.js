// Add known issues for models with YMMT entries but no known issues
// Covers: Toyota, Honda, Nissan, Subaru, Mazda, Hyundai, Kia models
// Uses NEW schema format: top-level make/model, years: {start, end}, estimatedCost: {min, max}
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

const newIssues = [
  // ========================================
  // TOYOTA
  // ========================================

  // ----- CELICA (1990-2005) -----
  {
    id: 'toyota-celica-1zz-oil-consumption-2000',
    make: 'Toyota',
    model: 'Celica',
    title: '1ZZ-FE Engine Excessive Oil Consumption (GT)',
    description: 'The 1ZZ-FE engine used in 2000-2005 Celica GT models is notorious for excessive oil consumption, often burning 1 quart every 1,000-1,500 miles. The root cause is poorly designed oil control piston rings that allow oil to pass into the combustion chamber. Toyota revised the piston ring design in later production runs but never issued a recall for the Celica. High-mileage examples may consume even more oil, leading to catalytic converter damage from oil contamination.',
    category: 'engine',
    severity: 'high',
    years: { start: 2000, end: 2005 },
    estimatedCost: { min: 1500, max: 3500 },
    symptoms: [
      'Low oil level between oil changes',
      'Blue exhaust smoke on acceleration',
      'Fouled spark plugs',
      'Catalytic converter failure from oil contamination',
      'Rough idle when oil level is critically low'
    ],
    commonFixes: [
      'Piston ring replacement with updated design ($1,500-$3,000)',
      'Short block replacement for severe cases ($2,500-$3,500)',
      'Monitor oil level weekly and top off as needed'
    ],
    dtcCodes: ['P0171', 'P0174', 'P0420']
  },
  {
    id: 'toyota-celica-2zz-lift-bolt-failure-2000',
    make: 'Toyota',
    model: 'Celica',
    title: '2ZZ-GE Lift Bolt Failure (GT-S)',
    description: 'The 2ZZ-GE engine in the Celica GT-S uses a variable valve lift system (VVTL-i) that engages at approximately 6,200 RPM. The lift bolts that actuate the high-cam profile can fail due to oil starvation or wear, preventing VVTL-i engagement. When the lift bolts fail, the engine loses its high-RPM power band entirely. Regular oil changes with quality synthetic oil are critical to preventing this failure. Many owners never rev high enough to notice the problem until they attempt spirited driving.',
    category: 'engine',
    severity: 'high',
    years: { start: 2000, end: 2005 },
    estimatedCost: { min: 800, max: 2500 },
    symptoms: [
      'Loss of power above 6,200 RPM',
      'No noticeable VVTL-i engagement (missing second power surge)',
      'Check engine light related to VVTL-i system',
      'Ticking noise from valve train at high RPM'
    ],
    commonFixes: [
      'Lift bolt replacement ($800-$1,500)',
      'Cylinder head rebuild if bolt damage is extensive ($1,500-$2,500)',
      'Use quality 0W-20 or 5W-30 synthetic oil with frequent changes'
    ],
    dtcCodes: ['P0011', 'P0012']
  },
  {
    id: 'toyota-celica-pre-cat-failure-2000',
    make: 'Toyota',
    model: 'Celica',
    title: 'Pre-Catalytic Converter Disintegration',
    description: 'The pre-catalytic converter (integrated into the exhaust manifold) on 2000-2005 Celicas can disintegrate internally, sending ceramic fragments back into the engine through exhaust valve overlap. This causes scoring of cylinder walls and accelerated engine wear. The pre-cat material breaks down from age and heat cycling. Removing or gutting the pre-cat and installing a proper downstream catalytic converter is the standard community fix, though emissions compliance varies by state.',
    category: 'engine',
    severity: 'high',
    years: { start: 2000, end: 2005 },
    estimatedCost: { min: 500, max: 2000 },
    symptoms: [
      'Rattling noise from exhaust manifold area',
      'Decreased engine performance',
      'Check engine light for catalytic efficiency',
      'Metallic debris in exhaust'
    ],
    commonFixes: [
      'Pre-cat delete with aftermarket header ($500-$1,200)',
      'Replace exhaust manifold with updated unit ($800-$1,500)',
      'Install high-flow catalytic converter downstream ($400-$800)'
    ],
    dtcCodes: ['P0420', 'P0430']
  },

  // ----- MR2 (1990-2005) -----
  {
    id: 'toyota-mr2-snap-oversteer-1990',
    make: 'Toyota',
    model: 'MR2',
    title: 'Snap Oversteer Under Lift-Off (SW20)',
    description: 'The second-generation MR2 (SW20, 1990-1999) is well-known for snap oversteer, particularly during mid-corner lift-off or abrupt throttle changes. The mid-engine layout with short wheelbase and rear weight bias causes the rear end to break loose suddenly when weight transfers forward during deceleration. Toyota revised the rear suspension geometry in 1993 (Rev 2) and again in 1994 (Rev 3) to improve predictability, but the inherent characteristic remains. Proper driving technique is essential.',
    category: 'suspension',
    severity: 'high',
    years: { start: 1990, end: 1999 },
    estimatedCost: { min: 300, max: 1500 },
    symptoms: [
      'Sudden rear-end breakaway during cornering',
      'Loss of control during mid-corner throttle lift',
      'Excessive oversteer in wet conditions',
      'Unpredictable handling at the limit'
    ],
    commonFixes: [
      'Aftermarket rear sway bar to improve balance ($300-$600)',
      'Upgraded rear suspension bushings for more predictable response ($200-$500)',
      'Alignment adjustment with more rear toe-in ($100-$200)',
      'Driver training for mid-engine handling characteristics'
    ],
    dtcCodes: []
  },
  {
    id: 'toyota-mr2-spyder-1zz-oil-consumption-2000',
    make: 'Toyota',
    model: 'MR2',
    title: '1ZZ-FE Oil Consumption (MR2 Spyder)',
    description: 'The third-generation MR2 Spyder (2000-2005) uses the same 1ZZ-FE engine that plagues the Celica and Corolla with excessive oil consumption. The defective piston ring design allows oil to bypass into the combustion chamber. The MR2 Spyder is particularly susceptible because the mid-engine placement and higher operating temperatures can exacerbate oil consumption. Owners should check oil level at every fuel stop.',
    category: 'engine',
    severity: 'high',
    years: { start: 2000, end: 2005 },
    estimatedCost: { min: 1500, max: 3500 },
    symptoms: [
      'Oil level drops 1 quart every 1,000-1,500 miles',
      'Blue exhaust smoke under acceleration',
      'Fouled spark plugs',
      'Catalytic converter damage from oil contamination'
    ],
    commonFixes: [
      'Piston ring replacement with updated Toyota rings ($1,500-$3,000)',
      'Engine swap with 2ZZ-GE (popular performance upgrade, $2,000-$3,500)',
      'Frequent oil level monitoring and top-off'
    ],
    dtcCodes: ['P0171', 'P0174', 'P0420']
  },
  {
    id: 'toyota-mr2-pre-cat-failure-2000',
    make: 'Toyota',
    model: 'MR2',
    title: 'Pre-Catalytic Converter Disintegration (Spyder)',
    description: 'The pre-catalytic converter on 2000-2005 MR2 Spyders can disintegrate internally, sending ceramic material back into the engine cylinders during exhaust valve overlap. This is the same issue affecting all 1ZZ-FE-equipped Toyotas of this era. The ceramic debris scores cylinder walls and accelerates engine wear. Early removal or replacement of the pre-cat is considered essential preventive maintenance in the MR2 community.',
    category: 'engine',
    severity: 'high',
    years: { start: 2000, end: 2005 },
    estimatedCost: { min: 500, max: 2000 },
    symptoms: [
      'Rattling from exhaust manifold area',
      'Gradual loss of engine power',
      'Check engine light for catalytic efficiency',
      'Increased oil consumption as cylinder walls score'
    ],
    commonFixes: [
      'Pre-cat removal with aftermarket header ($500-$1,200)',
      'Exhaust manifold replacement with non-pre-cat design ($600-$1,000)',
      'Downstream high-flow catalytic converter ($400-$800)'
    ],
    dtcCodes: ['P0420', 'P0430']
  },

  // ----- TERCEL (1990-1999) -----
  {
    id: 'toyota-tercel-head-gasket-failure-1990',
    make: 'Toyota',
    model: 'Tercel',
    title: 'Head Gasket Failure',
    description: 'The Toyota Tercel equipped with the 1.5L 3E-E and 5E-FE engines is prone to head gasket failure, particularly at higher mileages. The gasket material deteriorates over time, allowing coolant to leak externally or mix with engine oil. Overheating episodes accelerate gasket failure. The 5E-FE (1995-1999) is somewhat more reliable but still susceptible. Regular cooling system maintenance and avoiding overheating are key to longevity.',
    category: 'engine',
    severity: 'high',
    years: { start: 1990, end: 1999 },
    estimatedCost: { min: 600, max: 1500 },
    symptoms: [
      'Coolant loss without visible external leak',
      'White exhaust smoke (coolant burning)',
      'Milky residue on oil filler cap',
      'Engine overheating',
      'Rough idle and misfire'
    ],
    commonFixes: [
      'Head gasket replacement with MLS (multi-layer steel) gasket ($600-$1,200)',
      'Cylinder head resurfacing during gasket job ($100-$200 additional)',
      'Replace thermostat and water pump preventively during repair ($150-$300)'
    ],
    dtcCodes: ['P0171', 'P0174', 'P0300', 'P0128']
  },
  {
    id: 'toyota-tercel-automatic-transmission-failure-1990',
    make: 'Toyota',
    model: 'Tercel',
    title: 'Automatic Transmission Failure (A132L)',
    description: 'The A132L 3-speed automatic transmission in the Tercel is prone to premature failure, typically presenting as harsh shifting, slipping, or complete loss of forward gears. The transmission was designed for economy driving and struggles with sustained highway use or towing. Internal clutch pack wear and valve body issues are the most common failure modes. Many owners convert to manual transmission or source used replacements rather than rebuild.',
    category: 'transmission',
    severity: 'high',
    years: { start: 1990, end: 1999 },
    estimatedCost: { min: 800, max: 2500 },
    symptoms: [
      'Harsh or delayed shifts',
      'Transmission slipping under acceleration',
      'Loss of overdrive or forward gears',
      'Transmission fluid discolored or burnt-smelling',
      'Check engine light for transmission codes'
    ],
    commonFixes: [
      'Transmission rebuild ($1,500-$2,500)',
      'Used transmission replacement from junkyard ($800-$1,500 installed)',
      'Fluid and filter change as preventive maintenance ($150-$300)'
    ],
    dtcCodes: ['P0700', 'P0741', 'P0751']
  },

  // ----- PREVIA (1991-1997) -----
  {
    id: 'toyota-previa-head-gasket-supercharged-1994',
    make: 'Toyota',
    model: 'Previa',
    title: 'Head Gasket Failure (Supercharged Models)',
    description: 'The supercharged (SC) version of the Toyota Previa uses a 2TZ-FZE engine with a factory supercharger. The added boost pressure accelerates head gasket wear, and failures are common at 100,000-150,000 miles. The mid-mounted engine location makes the repair extremely labor-intensive, as the engine sits under the front passenger seat area. The supercharger itself adds complexity and heat that the gasket was not well-designed to handle long-term.',
    category: 'engine',
    severity: 'high',
    years: { start: 1994, end: 1997 },
    estimatedCost: { min: 1500, max: 3500 },
    symptoms: [
      'Coolant loss without visible external leak',
      'White exhaust smoke',
      'Engine overheating under load',
      'Milky residue in oil',
      'Sweet coolant smell from exhaust'
    ],
    commonFixes: [
      'Head gasket replacement ($1,500-$3,500 due to labor-intensive engine access)',
      'Cylinder head resurfacing ($100-$200 additional)',
      'Replace water pump and thermostat during repair ($200-$400 extra)'
    ],
    dtcCodes: ['P0171', 'P0174', 'P0300', 'P0128']
  },
  {
    id: 'toyota-previa-rear-heater-core-leak-1991',
    make: 'Toyota',
    model: 'Previa',
    title: 'Rear Heater Core Leak',
    description: 'The Previa features a rear heater system for passenger comfort, and the rear heater core is prone to developing leaks due to corrosion and age. Coolant leaks onto the rear floor area, causing carpet damage, mold, and a sweet antifreeze smell. The rear heater core is located under the rear seat area and requires significant interior disassembly to access. Many owners bypass the rear heater circuit entirely rather than replace the core.',
    category: 'cooling',
    severity: 'medium',
    years: { start: 1991, end: 1997 },
    estimatedCost: { min: 300, max: 1200 },
    symptoms: [
      'Sweet antifreeze smell inside vehicle',
      'Wet carpet in rear passenger area',
      'Coolant level dropping slowly',
      'Foggy windows from coolant vapor',
      'Rear heater output diminished'
    ],
    commonFixes: [
      'Rear heater core replacement ($600-$1,200)',
      'Bypass rear heater circuit with hose loop ($50-$100, eliminates rear heat)',
      'Flush cooling system and use quality coolant to prevent future corrosion'
    ],
    dtcCodes: []
  },
  {
    id: 'toyota-previa-starter-access-1991',
    make: 'Toyota',
    model: 'Previa',
    title: 'Difficult Starter Motor Access and Failure',
    description: 'The Previa mid-engine layout places the starter motor in an extremely difficult-to-reach location beneath the passenger compartment floor. When the starter fails (common at 100,000+ miles), the repair requires removing the passenger seat, cutting an access panel in the floor, or lifting the vehicle and working from below. Labor costs are significantly higher than typical starter replacements due to access difficulty. Some mechanics refuse the job entirely.',
    category: 'electrical',
    severity: 'medium',
    years: { start: 1991, end: 1997 },
    estimatedCost: { min: 500, max: 1200 },
    symptoms: [
      'Clicking noise when turning key with no engine crank',
      'Intermittent no-start condition',
      'Grinding noise during starting',
      'Slow cranking speed'
    ],
    commonFixes: [
      'Starter motor replacement via floor access panel ($500-$1,200)',
      'Install permanent access panel in floor for future starter replacements ($50 extra)',
      'Use OEM Denso starter for reliability ($200-$350 for part)'
    ],
    dtcCodes: []
  },

  // ----- T100 (1993-1998) -----
  {
    id: 'toyota-t100-frame-rust-1993',
    make: 'Toyota',
    model: 'T100',
    title: 'Frame Rust and Corrosion',
    description: 'The Toyota T100 pickup truck is susceptible to severe frame rust, particularly in regions that use road salt. The frame rails, crossmembers, and body mount points corrode from the inside out, weakening the structural integrity. Toyota did not apply adequate corrosion protection to the T100 frame compared to later Tacoma and Tundra models. Rust can progress to the point where the frame is structurally unsafe, making the truck a total loss regardless of body and drivetrain condition.',
    category: 'body',
    severity: 'high',
    years: { start: 1993, end: 1998 },
    estimatedCost: { min: 500, max: 5000 },
    symptoms: [
      'Visible rust on frame rails and crossmembers',
      'Rust flakes falling from undercarriage',
      'Body mount points deteriorating',
      'Sagging or misaligned body panels',
      'Failed safety inspection due to frame condition'
    ],
    commonFixes: [
      'Frame rust treatment and undercoating ($500-$1,000)',
      'Crossmember welding and reinforcement ($800-$2,000)',
      'Complete frame replacement with donor frame ($3,000-$5,000)',
      'Annual undercoating application for prevention ($100-$200)'
    ],
    dtcCodes: []
  },
  {
    id: 'toyota-t100-34l-head-gasket-1995',
    make: 'Toyota',
    model: 'T100',
    title: '3.4L 5VZ-FE Head Gasket Failure',
    description: 'The 3.4L 5VZ-FE V6 engine in 1995-1998 T100 trucks can develop head gasket leaks, typically presenting as external coolant leaks from the rear of the passenger-side cylinder head. The gasket material deteriorates over time, especially with infrequent coolant changes. While the 5VZ-FE is generally a reliable engine, the head gasket is its most common failure point. The V6 configuration makes the rear head gasket particularly labor-intensive to access.',
    category: 'engine',
    severity: 'high',
    years: { start: 1995, end: 1998 },
    estimatedCost: { min: 1000, max: 2500 },
    symptoms: [
      'Coolant leak from rear of engine',
      'Engine overheating',
      'White exhaust smoke',
      'Coolant loss without obvious external leak',
      'Rough idle and misfires'
    ],
    commonFixes: [
      'Head gasket replacement on both banks ($1,000-$2,500)',
      'Cylinder head resurfacing ($100-$200 per head)',
      'Replace timing belt and water pump during repair ($300-$500 additional)'
    ],
    dtcCodes: ['P0171', 'P0174', 'P0300', 'P0128']
  },

  // ----- PICKUP (1990-1995) -----
  {
    id: 'toyota-pickup-frame-rust-1990',
    make: 'Toyota',
    model: 'Pickup',
    title: 'Frame Rust and Structural Corrosion',
    description: 'The Toyota Pickup (Hilux-based) is highly susceptible to frame rust in salt-belt states. The boxed frame rails trap moisture and salt, causing rust to develop from the inside out. By the time rust is visible externally, structural integrity may already be compromised. This is the primary reason many otherwise mechanically sound Pickups are scrapped. The issue affects all model years but is worst on vehicles that spent their lives in northern US states.',
    category: 'body',
    severity: 'high',
    years: { start: 1990, end: 1995 },
    estimatedCost: { min: 500, max: 5000 },
    symptoms: [
      'Visible rust perforation on frame rails',
      'Rust flakes falling when driving over bumps',
      'Body mount points collapsing',
      'Steering alignment changes from frame flex',
      'Failed state safety inspection'
    ],
    commonFixes: [
      'Frame section replacement and welding ($1,500-$3,000)',
      'Complete donor frame swap ($3,000-$5,000)',
      'Rust treatment and undercoating for early-stage rust ($500-$1,000)',
      'Annual oil-based undercoating for prevention ($100-$200)'
    ],
    dtcCodes: []
  },
  {
    id: 'toyota-pickup-22re-head-gasket-1990',
    make: 'Toyota',
    model: 'Pickup',
    title: '22R-E Head Gasket Failure',
    description: 'The 2.4L 22R-E engine in the Toyota Pickup is prone to head gasket failure, often presenting as coolant leaking externally from the rear of the cylinder head or mixing with engine oil. The single-layer gasket used in early production deteriorates over time. Overheating episodes dramatically accelerate gasket failure. The 22R-E is otherwise extremely reliable, and head gasket replacement extends engine life significantly. A multi-layer steel (MLS) gasket upgrade is recommended during repair.',
    category: 'engine',
    severity: 'high',
    years: { start: 1990, end: 1995 },
    estimatedCost: { min: 500, max: 1500 },
    symptoms: [
      'External coolant leak from cylinder head area',
      'White exhaust smoke',
      'Coolant mixing with oil (milky dipstick)',
      'Engine overheating',
      'Coolant level dropping over time'
    ],
    commonFixes: [
      'Head gasket replacement with MLS gasket ($500-$1,200)',
      'Cylinder head resurfacing ($100-$200)',
      'Replace timing chain guides and water pump during repair ($200-$400 additional)'
    ],
    dtcCodes: ['P0171', 'P0174', 'P0300', 'P0128']
  },

  // ----- PASEO (1992-1997) -----
  {
    id: 'toyota-paseo-head-gasket-1992',
    make: 'Toyota',
    model: 'Paseo',
    title: 'Head Gasket Failure (5E-FE)',
    description: 'The Toyota Paseo uses the 1.5L 5E-FE engine, which shares the head gasket weakness common to many small Toyota engines of this era. The gasket material degrades over time, leading to coolant leaks, overheating, and potential engine damage if not addressed. The Paseo is particularly vulnerable because many owners deferred maintenance on these economy cars. A head gasket replacement is straightforward on the 5E-FE due to its simple inline-4 layout.',
    category: 'engine',
    severity: 'high',
    years: { start: 1992, end: 1997 },
    estimatedCost: { min: 500, max: 1200 },
    symptoms: [
      'Coolant loss without visible external leak',
      'White exhaust smoke',
      'Engine overheating',
      'Milky oil on dipstick',
      'Sweet coolant smell from exhaust'
    ],
    commonFixes: [
      'Head gasket replacement ($500-$1,000)',
      'Cylinder head resurfacing ($100-$200)',
      'Cooling system flush and thermostat replacement ($100-$200)'
    ],
    dtcCodes: ['P0171', 'P0174', 'P0300', 'P0128']
  },
  {
    id: 'toyota-paseo-clutch-cable-breakage-1992',
    make: 'Toyota',
    model: 'Paseo',
    title: 'Clutch Cable Breakage',
    description: 'Manual transmission Paseos use a cable-actuated clutch rather than a hydraulic system. The clutch cable is prone to fraying and eventual breakage, leaving the driver unable to disengage the clutch. The cable wears at the firewall pass-through point and at the pedal pivot. Breakage typically occurs without warning, leaving the vehicle undriveable. Carrying a spare clutch cable is recommended by Paseo enthusiasts, as the cable is inexpensive and relatively easy to replace roadside.',
    category: 'transmission',
    severity: 'medium',
    years: { start: 1992, end: 1997 },
    estimatedCost: { min: 50, max: 300 },
    symptoms: [
      'Clutch pedal feels loose or has excessive play',
      'Clutch pedal suddenly drops to floor',
      'Unable to shift gears',
      'Fraying visible at cable ends',
      'Clutch engagement point changes over time'
    ],
    commonFixes: [
      'Clutch cable replacement ($50-$150 DIY, $150-$300 at shop)',
      'Lubricate cable housing to extend life ($10-$20)',
      'Carry spare cable in trunk for emergency roadside replacement'
    ],
    dtcCodes: []
  },

  // ----- 86 (2017-2020) -----
  {
    id: 'toyota-86-valve-spring-recall-2017',
    make: 'Toyota',
    model: '86',
    title: 'FA20 Valve Spring Recall (Campaign E0G/17V-587)',
    description: 'Certain 2017-2020 Toyota 86 vehicles equipped with the FA20 (4U-GSE) boxer engine are subject to a valve spring recall. The valve springs may have been manufactured with an improper surface treatment, making them susceptible to fracture. A broken valve spring can cause engine misfires, rough running, and in severe cases, contact between the valve and piston causing catastrophic engine damage. Toyota recall campaign E0G (NHTSA 17V-587) covers free valve spring replacement at dealers.',
    category: 'engine',
    severity: 'high',
    years: { start: 2017, end: 2020 },
    estimatedCost: { min: 0, max: 0 },
    symptoms: [
      'Engine misfire on one or more cylinders',
      'Rough idle or vibration',
      'Check engine light with misfire codes',
      'Ticking or tapping noise from engine',
      'Loss of power'
    ],
    commonFixes: [
      'Valve spring replacement under recall (free at Toyota dealer)',
      'Check VIN at toyota.com/recall to verify coverage',
      'If past recall period, valve spring replacement ($800-$1,500)'
    ],
    dtcCodes: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304']
  },
  {
    id: 'toyota-86-carbon-buildup-2017',
    make: 'Toyota',
    model: '86',
    title: 'Direct Injection Carbon Buildup on Intake Valves',
    description: 'The FA20 engine in the Toyota 86 uses direct injection (port injection was added in later Subaru BRZ variants but not the Toyota 86). Without fuel washing over the intake valves, carbon deposits accumulate on the valve stems and ports, reducing airflow and causing rough running. The issue becomes noticeable around 40,000-60,000 miles. Walnut blasting the intake valves is the standard maintenance procedure to restore performance.',
    category: 'engine',
    severity: 'medium',
    years: { start: 2017, end: 2020 },
    estimatedCost: { min: 300, max: 800 },
    symptoms: [
      'Rough idle that worsens over time',
      'Hesitation during acceleration',
      'Reduced engine power output',
      'Slightly increased fuel consumption',
      'Cold start roughness'
    ],
    commonFixes: [
      'Walnut shell blasting of intake valves ($300-$600)',
      'Manual carbon cleaning during valve cover service ($400-$800)',
      'Use fuel system cleaner additives as mild preventive measure ($15-$30)'
    ],
    dtcCodes: ['P0171', 'P0174']
  },

  // ----- COROLLA CROSS (2022-2026) -----
  {
    id: 'toyota-corolla-cross-cvt-hesitation-2022',
    make: 'Toyota',
    model: 'Corolla Cross',
    title: 'CVT Hesitation and Delayed Acceleration Response',
    description: 'The Direct Shift CVT in the Corolla Cross can exhibit hesitation and delayed response during initial acceleration from a stop or when requesting sudden power during passing maneuvers. The CVT programming prioritizes fuel economy, resulting in a noticeable delay between throttle input and vehicle response. Toyota has issued software updates to improve throttle response in some model years. The issue is more pronounced in non-hybrid models with the 2.0L engine.',
    category: 'transmission',
    severity: 'medium',
    years: { start: 2022, end: 2026 },
    estimatedCost: { min: 0, max: 200 },
    symptoms: [
      'Delayed acceleration from a stop',
      'Hesitation when pressing accelerator for passing',
      'Rubber-band feeling during acceleration',
      'Jerky low-speed driving in traffic',
      'RPM flare before power delivery'
    ],
    commonFixes: [
      'TCM (Transmission Control Module) software update at dealer (free under warranty)',
      'CVT fluid change with Toyota Genuine CVT Fluid FE ($150-$200)',
      'Adaptive driving technique (gradual throttle application)'
    ],
    dtcCodes: ['P0700', 'P0730', 'P0868']
  },
  {
    id: 'toyota-corolla-cross-infotainment-lag-2022',
    make: 'Toyota',
    model: 'Corolla Cross',
    title: 'Infotainment System Lag and Connectivity Issues',
    description: 'The Corolla Cross infotainment system can experience lag, freezing, and Bluetooth/wireless connectivity issues. The touchscreen may become unresponsive for several seconds, Apple CarPlay or Android Auto connections may drop intermittently, and the system may require periodic reboots. Toyota has released multiple software updates to address these issues. The problem is more common in earlier production 2022 models.',
    category: 'electrical',
    severity: 'low',
    years: { start: 2022, end: 2026 },
    estimatedCost: { min: 0, max: 150 },
    symptoms: [
      'Touchscreen lag or freezing',
      'Bluetooth connection dropping',
      'Apple CarPlay or Android Auto disconnecting',
      'Backup camera delay on startup',
      'System requiring manual reboot'
    ],
    commonFixes: [
      'Software update at Toyota dealer (free under warranty)',
      'Hard reset of infotainment system (hold power button 10+ seconds)',
      'Clear paired Bluetooth devices and re-pair ($0 DIY)'
    ],
    dtcCodes: []
  },

  // ----- GRAND HIGHLANDER (2024-2026) -----
  {
    id: 'toyota-grand-highlander-infotainment-bugs-2024',
    make: 'Toyota',
    model: 'Grand Highlander',
    title: 'Infotainment Software Bugs and Display Issues',
    description: 'As a new model, the Grand Highlander has experienced various infotainment software bugs including touchscreen freezes, navigation glitches, wireless Apple CarPlay/Android Auto connectivity drops, and occasional display blackouts. Toyota has addressed many of these through over-the-air (OTA) and dealer-applied software updates. These are typical first-model-year software issues that improve over time with updates.',
    category: 'electrical',
    severity: 'low',
    years: { start: 2024, end: 2026 },
    estimatedCost: { min: 0, max: 0 },
    symptoms: [
      'Touchscreen freezes or becomes unresponsive',
      'Wireless CarPlay/Android Auto connection drops',
      'Navigation display glitches',
      'Screen goes black momentarily',
      'Audio system cuts out briefly'
    ],
    commonFixes: [
      'Software update at Toyota dealer (free under warranty)',
      'Accept OTA updates when prompted',
      'Hard reset infotainment by holding power button 10+ seconds'
    ],
    dtcCodes: []
  },

  // ========================================
  // HONDA
  // ========================================

  // ----- PRELUDE (1990-2001) -----
  {
    id: 'honda-prelude-atts-failure-1997',
    make: 'Honda',
    model: 'Prelude',
    title: 'ATTS (Active Torque Transfer System) Failure (SH Models)',
    description: 'The 5th generation Prelude SH (1997-2001) features the ATTS (Active Torque Transfer System), a mechanical torque-vectoring system that transfers power between the front wheels for improved cornering. The ATTS unit is complex, uses dedicated fluid separate from the transmission, and is prone to failure due to internal clutch pack wear, pump failure, or fluid degradation. A failed ATTS system causes grinding noises, vibration, and an ATTS warning light. Replacement units are increasingly scarce and expensive.',
    category: 'drivetrain',
    severity: 'high',
    years: { start: 1997, end: 2001 },
    estimatedCost: { min: 1500, max: 4000 },
    symptoms: [
      'ATTS warning light on dashboard',
      'Grinding or whining noise from front differential area',
      'Vibration during cornering',
      'Reduced cornering performance',
      'Clicking or clunking during turns'
    ],
    commonFixes: [
      'ATTS fluid change with Honda genuine ATTS fluid ($50-$100)',
      'ATTS unit rebuild with new clutch packs ($1,500-$2,500)',
      'ATTS unit replacement with used or remanufactured unit ($2,000-$4,000)',
      'ATTS delete and conversion to base model axles ($800-$1,500)'
    ],
    dtcCodes: []
  },
  {
    id: 'honda-prelude-vtec-solenoid-leak-1993',
    make: 'Honda',
    model: 'Prelude',
    title: 'VTEC Solenoid Gasket Oil Leak',
    description: 'The VTEC solenoid on H22A and H23A engines in 1993-2001 Preludes develops oil leaks from the solenoid gasket and filter screen. Oil weeps from the solenoid housing onto the back of the engine, creating a mess and potentially dripping onto the exhaust manifold (fire risk in extreme cases). The solenoid gasket hardens with heat cycling and age. The VTEC solenoid screen filter can also clog, preventing proper VTEC engagement. This is a simple and inexpensive repair when caught early.',
    category: 'engine',
    severity: 'medium',
    years: { start: 1993, end: 2001 },
    estimatedCost: { min: 30, max: 300 },
    symptoms: [
      'Oil leak from back of engine near valve cover',
      'Burning oil smell from engine bay',
      'VTEC not engaging properly (loss of high-RPM power)',
      'Check engine light with VTEC system code',
      'Oil dripping on exhaust manifold'
    ],
    commonFixes: [
      'VTEC solenoid gasket replacement ($30-$80 DIY)',
      'Clean VTEC solenoid screen filter during gasket replacement ($0 additional)',
      'VTEC solenoid replacement if internals are worn ($150-$300)'
    ],
    dtcCodes: ['P1259']
  },
  {
    id: 'honda-prelude-auto-transmission-failure-1997',
    make: 'Honda',
    model: 'Prelude',
    title: '5th Generation Automatic Transmission Failure',
    description: 'The 4-speed automatic transmission (MAXA/M6HA) in the 1997-2001 Prelude is prone to premature failure, a problem shared with many late-1990s Honda automatic transmissions. The 3rd and 4th gear clutch packs wear prematurely, and the torque converter can develop shudder. High-mileage automatics often slip, flare between shifts, or fail to engage gears. Honda automatics of this era were undersized for the power output of the H22A engine.',
    category: 'transmission',
    severity: 'high',
    years: { start: 1997, end: 2001 },
    estimatedCost: { min: 1500, max: 3500 },
    symptoms: [
      'Transmission slipping between gears',
      'Harsh or delayed shifts',
      'Flare (RPM surge) between 2nd and 3rd gear',
      'Check engine light with transmission codes',
      'Complete loss of gear engagement'
    ],
    commonFixes: [
      'Transmission rebuild with upgraded clutch packs ($1,500-$2,500)',
      'Used JDM transmission swap ($1,200-$2,000 installed)',
      'Regular ATF changes every 30,000 miles as preventive maintenance ($100-$200)',
      'Manual transmission swap (popular enthusiast option, $1,500-$3,500)'
    ],
    dtcCodes: ['P0700', 'P0741', 'P0751']
  },

  // ----- DEL SOL (1993-1997) -----
  {
    id: 'honda-del-sol-roof-panel-seal-leak-1993',
    make: 'Honda',
    model: 'Del Sol',
    title: 'Targa Roof Panel Seal Leak',
    description: 'The Honda Del Sol features a removable targa roof panel, and the weatherstripping seals around the roof opening deteriorate with age and UV exposure. Water leaks into the cabin through degraded seals, particularly at the front header and rear corners. The roof seal channels can also become clogged with debris, redirecting water into the interior. Wet carpets, mold, and electrical issues from water intrusion are common consequences. Replacement seals are still available from Honda and aftermarket sources.',
    category: 'body',
    severity: 'medium',
    years: { start: 1993, end: 1997 },
    estimatedCost: { min: 50, max: 500 },
    symptoms: [
      'Water dripping into cabin during rain',
      'Wet headliner or A-pillar trim',
      'Musty or moldy smell inside vehicle',
      'Water pooling on floorboards',
      'Wind noise at highway speeds'
    ],
    commonFixes: [
      'Weatherstrip seal replacement ($50-$200 for seal kit)',
      'Clean and unclog roof drain channels ($0-$50 DIY)',
      'Apply silicone seal conditioner to extend seal life ($10-$20)',
      'Professional seal installation and adjustment ($200-$500)'
    ],
    dtcCodes: []
  },
  {
    id: 'honda-del-sol-distributor-failure-1993',
    make: 'Honda',
    model: 'Del Sol',
    title: 'Distributor Failure (Ignition Issues)',
    description: 'The Del Sol uses a distributor-based ignition system with internal coil and ignition module. The distributor is prone to failure from moisture intrusion, internal coil cracking, and igniter module heat damage. Symptoms include intermittent no-start conditions, engine dying while driving, and misfires. The distributor is mounted at the rear of the cylinder head where it is exposed to engine heat and splash from the road. Remanufactured distributors are available but quality varies significantly between brands.',
    category: 'electrical',
    severity: 'high',
    years: { start: 1993, end: 1997 },
    estimatedCost: { min: 150, max: 500 },
    symptoms: [
      'Intermittent no-start condition',
      'Engine stalling while driving',
      'Random misfires across all cylinders',
      'Engine runs rough in humid conditions',
      'Check engine light for ignition-related codes'
    ],
    commonFixes: [
      'Distributor replacement with OEM or quality remanufactured unit ($150-$400)',
      'Distributor cap and rotor replacement as first diagnostic step ($30-$60)',
      'Seal distributor housing to prevent moisture intrusion ($10-$20)'
    ],
    dtcCodes: ['P0340']
  },

  // ========================================
  // NISSAN
  // ========================================

  // ----- 240SX (1990-1998) -----
  {
    id: 'nissan-240sx-timing-chain-guide-1991',
    make: 'Nissan',
    model: '240SX',
    title: 'KA24DE Timing Chain Guide Wear and Rattle',
    description: 'The KA24DE engine in the 240SX uses a single timing chain with plastic-backed guides that wear and crack over time. As the guides deteriorate, the chain develops excessive slack, causing a distinctive rattle on cold start and eventually leading to jumped timing if left unaddressed. The upper guide (tensioner side) fails first, typically between 100,000-150,000 miles. A jumped timing chain can bend valves and cause catastrophic engine damage on this interference engine.',
    category: 'engine',
    severity: 'high',
    years: { start: 1991, end: 1998 },
    estimatedCost: { min: 400, max: 1200 },
    symptoms: [
      'Rattling noise on cold start that diminishes when warm',
      'Timing chain noise at idle',
      'Check engine light for timing-related codes',
      'Rough idle and misfires (if timing has jumped)',
      'Pieces of plastic guide material in oil pan'
    ],
    commonFixes: [
      'Timing chain guide and tensioner replacement ($400-$800)',
      'Full timing chain kit replacement ($600-$1,200)',
      'Replace water pump and front seals during the job ($150-$300 additional)'
    ],
    dtcCodes: ['P0011', 'P0012', 'P0016']
  },
  {
    id: 'nissan-240sx-oil-leak-1991',
    make: 'Nissan',
    model: '240SX',
    title: 'Rear Main Seal and Valve Cover Oil Leaks',
    description: 'The KA24DE engine in the 240SX is known for developing oil leaks from multiple locations as gaskets age. The rear main seal is the most problematic, leaking oil onto the clutch (manual trans) or flex plate (automatic). Valve cover gaskets also harden and leak, dripping oil onto the exhaust manifold. The oil pan gasket and front crank seal are additional common leak points. These leaks are exacerbated by age and the high operating temperatures of the KA24DE.',
    category: 'engine',
    severity: 'medium',
    years: { start: 1991, end: 1998 },
    estimatedCost: { min: 200, max: 1500 },
    symptoms: [
      'Oil spots under vehicle',
      'Burning oil smell from engine bay',
      'Oil dripping on exhaust manifold (smoke)',
      'Low oil level between changes',
      'Clutch slipping from oil contamination (manual trans)'
    ],
    commonFixes: [
      'Valve cover gasket replacement ($50-$150 DIY, $200-$400 at shop)',
      'Rear main seal replacement ($500-$1,000, requires transmission removal)',
      'Complete engine reseal with all gaskets ($800-$1,500)',
      'Use high-mileage oil with seal conditioners as temporary measure'
    ],
    dtcCodes: ['P0171', 'P0174', 'P0420']
  },
  {
    id: 'nissan-240sx-rust-1990',
    make: 'Nissan',
    model: '240SX',
    title: 'Body and Chassis Rust (Fenders, Quarter Panels, Hatch)',
    description: 'The Nissan 240SX is highly susceptible to body rust, particularly in the rear quarter panels, rear fender wells, door bottoms, rear hatch/trunk area, and rocker panels. The S13 (1989-1994) is more rust-prone than the S14 (1995-1998) due to thinner body panels and less corrosion protection. Rust in the rear quarters can compromise structural integrity. The increasing value of 240SXs as drift and enthusiast cars has made rust repair and prevention more worthwhile, but finding rust-free examples is increasingly difficult.',
    category: 'body',
    severity: 'medium',
    years: { start: 1990, end: 1998 },
    estimatedCost: { min: 300, max: 3000 },
    symptoms: [
      'Bubbling paint on rear quarter panels',
      'Rust holes in fender wells',
      'Door bottom rust and perforation',
      'Rear hatch or trunk area corrosion',
      'Rocker panel rust and structural weakness'
    ],
    commonFixes: [
      'Rust repair and body panel welding ($500-$2,000 per panel)',
      'Replacement quarter panels from donor car ($300-$800 per side)',
      'POR-15 rust encapsulation for early-stage rust ($50-$100)',
      'Full body rust repair and respray ($2,000-$3,000+)'
    ],
    dtcCodes: []
  },

  // ----- 300ZX (1990-1996) -----
  {
    id: 'nissan-300zx-tt-fuel-system-1990',
    make: 'Nissan',
    model: '300ZX',
    title: 'Twin Turbo Fuel System Degradation',
    description: 'The Z32 300ZX Twin Turbo fuel system components degrade with age, causing significant reliability issues. The fuel injectors become clogged or develop poor spray patterns, fuel dampers can leak, and the rubber fuel lines become brittle and crack. The extremely tight engine bay makes fuel line inspection difficult, and leaking fuel near hot turbo components creates a serious fire risk. The factory fuel lines use rubber hoses with spring clamps that weaken over time. This is considered the most critical maintenance item on the Z32TT.',
    category: 'engine',
    severity: 'high',
    years: { start: 1990, end: 1996 },
    estimatedCost: { min: 500, max: 2500 },
    symptoms: [
      'Fuel smell in engine bay or cabin',
      'Visible fuel weeping from rubber hose connections',
      'Hard starting or long crank times',
      'Rough idle and poor fuel economy',
      'Hesitation under boost'
    ],
    commonFixes: [
      'Replace all rubber fuel lines with braided stainless steel ($500-$1,000)',
      'Fuel injector cleaning or replacement ($300-$800 for set of 6)',
      'Fuel damper replacement ($100-$200)',
      'Complete fuel system refresh ($1,500-$2,500)'
    ],
    dtcCodes: ['P0171', 'P0174']
  },
  {
    id: 'nissan-300zx-cas-failure-1990',
    make: 'Nissan',
    model: '300ZX',
    title: 'CAS (Crank Angle Sensor) Failure',
    description: 'The Crank Angle Sensor (CAS) on the VG30DE and VG30DETT engines is located inside the distributor and is a common failure point on both naturally aspirated and twin turbo Z32 models. The CAS provides timing information to the ECU, and when it fails, the engine will not start or will stall intermittently. The internal optical sensor deteriorates with heat and age. CAS failure is one of the most common reasons for Z32 no-start conditions. Replacement requires distributor removal.',
    category: 'electrical',
    severity: 'high',
    years: { start: 1990, end: 1996 },
    estimatedCost: { min: 150, max: 600 },
    symptoms: [
      'Intermittent no-start condition',
      'Engine stalling without warning',
      'Random misfires',
      'Tachometer dropping to zero while driving',
      'Engine dies and restarts after cooling down'
    ],
    commonFixes: [
      'CAS replacement ($150-$400 for OEM Nissan unit)',
      'Complete distributor replacement with new CAS ($300-$600)',
      'Carry spare CAS as emergency roadside part ($150-$250)'
    ],
    dtcCodes: ['P0340']
  },
  {
    id: 'nissan-300zx-power-steering-leak-1990',
    make: 'Nissan',
    model: '300ZX',
    title: 'Power Steering System Leaks',
    description: 'The Z32 300ZX HICAS (High Capacity Actively Controlled Steering) and standard power steering systems develop leaks from aged hoses, the power steering rack, and the HICAS actuator. The HICAS system adds rear-wheel steering capability but also adds complexity and more potential leak points. Power steering fluid can leak onto the exhaust or hot engine components, creating smoke and fire risk. Many owners delete the HICAS system and convert to a standard power steering setup to eliminate the rear steer complexity.',
    category: 'steering',
    severity: 'medium',
    years: { start: 1990, end: 1996 },
    estimatedCost: { min: 200, max: 1500 },
    symptoms: [
      'Power steering fluid on garage floor',
      'Whining noise when turning the steering wheel',
      'Heavy steering effort',
      'Smoke from engine bay (fluid on exhaust)',
      'HICAS warning light on dashboard'
    ],
    commonFixes: [
      'Power steering hose replacement ($200-$500)',
      'Power steering rack rebuild or replacement ($500-$1,200)',
      'HICAS delete and standard PS conversion ($300-$600)',
      'HICAS actuator seal replacement ($200-$400)'
    ],
    dtcCodes: []
  },

  // ----- 350Z (2003-2009) -----
  {
    id: 'nissan-350z-oil-consumption-2007',
    make: 'Nissan',
    model: '350Z',
    title: 'VQ35DE Rev-Up Engine Oil Consumption',
    description: 'The revised VQ35DE "Rev-Up" engine (2005-2006 350Z, also known as the VQ35DE Rev-Up) is notorious for excessive oil consumption, often burning 1 quart every 1,000-2,000 miles. The issue is caused by defective galley gaskets (oil passage o-rings) that leak oil internally. The standard VQ35DE (2003-2004) and the later VQ35HR (2007-2009) do not suffer from this issue to the same degree. Nissan acknowledged the problem but did not issue a recall. The Rev-Up engine can be identified by its higher redline (7,000 vs 6,600 RPM).',
    category: 'engine',
    severity: 'high',
    years: { start: 2005, end: 2006 },
    estimatedCost: { min: 500, max: 3000 },
    symptoms: [
      'Oil level drops significantly between changes',
      'Blue or grey exhaust smoke',
      'Low oil pressure light at idle',
      'Catalytic converter failure from oil contamination',
      'Fouled spark plugs'
    ],
    commonFixes: [
      'Oil galley gasket (o-ring) replacement ($500-$1,500)',
      'Engine rebuild with updated gaskets ($2,000-$3,000)',
      'Monitor oil level weekly and use 5W-30 synthetic',
      'VQ35HR engine swap from 2007+ model ($1,500-$3,000 used engine)'
    ],
    dtcCodes: ['P0171', 'P0174', 'P0420']
  },
  {
    id: 'nissan-350z-window-regulator-failure-2003',
    make: 'Nissan',
    model: '350Z',
    title: 'Power Window Regulator Failure',
    description: 'The 350Z power window regulators are a common failure item, with the cable-driven mechanism breaking or the motor failing. The driver-side window regulator fails most frequently due to higher usage. When the regulator fails, the window either drops into the door, becomes stuck in position, or operates very slowly. The 350Z window regulator is a known weak point across all model years (2003-2009). The frameless door glass design puts more stress on the regulator mechanism.',
    category: 'electrical',
    severity: 'low',
    years: { start: 2003, end: 2009 },
    estimatedCost: { min: 150, max: 500 },
    symptoms: [
      'Window drops into door suddenly',
      'Window moves very slowly or intermittently',
      'Grinding or clicking noise when operating window',
      'Window stuck in down position',
      'Window tilts or binds during operation'
    ],
    commonFixes: [
      'Window regulator replacement ($150-$300 for part, $100-$200 labor)',
      'Window motor replacement if motor is the failure point ($100-$200)',
      'Lubricate window tracks and guides as preventive maintenance ($10-$20)'
    ],
    dtcCodes: []
  },

  // ----- HARDBODY (1990-1997) -----
  {
    id: 'nissan-hardbody-timing-chain-guide-1990',
    make: 'Nissan',
    model: 'Hardbody',
    title: 'KA24E Timing Chain Guide Failure',
    description: 'The KA24E (single-cam) engine in the Nissan Hardbody (D21) pickup uses plastic-backed timing chain guides that become brittle and break with age and heat exposure. When the guides fail, the timing chain develops excessive slack, causing a loud rattle on startup and potential timing jump. The KA24E is an interference engine, so a jumped timing chain can cause valve-to-piston contact and catastrophic engine damage. Preventive guide replacement is recommended at 100,000+ miles.',
    category: 'engine',
    severity: 'high',
    years: { start: 1990, end: 1997 },
    estimatedCost: { min: 400, max: 1000 },
    symptoms: [
      'Loud rattle on cold start',
      'Timing chain noise at idle',
      'Check engine light for timing codes',
      'Rough running if timing has jumped',
      'Plastic debris in oil during oil changes'
    ],
    commonFixes: [
      'Timing chain guide and tensioner replacement ($400-$800)',
      'Full timing chain kit with updated metal guides ($600-$1,000)',
      'Replace front crank seal during the job ($20-$50 additional)'
    ],
    dtcCodes: ['P0011', 'P0012', 'P0016']
  },
  {
    id: 'nissan-hardbody-rust-1990',
    make: 'Nissan',
    model: 'Hardbody',
    title: 'Frame and Body Rust',
    description: 'The Nissan Hardbody pickup is highly susceptible to rust in salt-belt regions. The frame, bed floor, cab corners, rocker panels, and fender wells are the most common areas for corrosion. The bed floor rusts from the inside when water and debris are trapped, and the frame corrodes from road salt exposure. Frame rust can compromise the structural integrity and make the vehicle unsafe. This is the primary reason Hardbody trucks are scrapped in northern states.',
    category: 'body',
    severity: 'high',
    years: { start: 1990, end: 1997 },
    estimatedCost: { min: 300, max: 3000 },
    symptoms: [
      'Rust holes in bed floor',
      'Cab corner corrosion and perforation',
      'Frame rail rust visible from underneath',
      'Rocker panel rust and structural weakness',
      'Failed safety inspection'
    ],
    commonFixes: [
      'Bed floor patch panels and welding ($300-$800)',
      'Cab corner repair panels ($200-$500 per side)',
      'Frame rust treatment and undercoating ($500-$1,500)',
      'Complete frame swap from donor truck ($2,000-$3,000)'
    ],
    dtcCodes: []
  },
  {
    id: 'nissan-hardbody-fuel-pump-failure-1990',
    make: 'Nissan',
    model: 'Hardbody',
    title: 'In-Tank Fuel Pump Failure',
    description: 'The in-tank electric fuel pump on the Hardbody is prone to failure, particularly at higher mileages. The pump motor wears out, the fuel filter sock becomes clogged, and electrical connections corrode. Failure typically presents as intermittent stalling, hard starting, or complete no-start. Running the fuel tank below 1/4 tank accelerates pump wear by reducing cooling from fuel immersion. Access to the fuel pump requires dropping the fuel tank, as there is no access panel in the bed.',
    category: 'engine',
    severity: 'medium',
    years: { start: 1990, end: 1997 },
    estimatedCost: { min: 200, max: 600 },
    symptoms: [
      'Engine stalling at low fuel levels',
      'Hard starting or long crank times',
      'Whining noise from rear of vehicle',
      'Loss of power under load',
      'Complete no-start condition'
    ],
    commonFixes: [
      'Fuel pump replacement ($200-$400 for pump, $100-$200 labor)',
      'Replace fuel filter sock with new pump ($10-$20 additional)',
      'Install fuel pump access panel in bed for easier future access ($50-$100)',
      'Keep tank above 1/4 full to extend pump life'
    ],
    dtcCodes: []
  },

  // ----- STANZA (1990-1992) -----
  {
    id: 'nissan-stanza-auto-transmission-failure-1990',
    make: 'Nissan',
    model: 'Stanza',
    title: 'Automatic Transmission Failure',
    description: 'The 4-speed automatic transmission in the Nissan Stanza is prone to premature failure, particularly the torque converter and forward clutch packs. Symptoms include slipping, harsh shifts, and eventual loss of forward gears. The transmission was marginal for the KA24E engine output and deteriorates faster with aggressive driving or towing. Rebuilds are possible but finding a transmission specialist familiar with the Stanza-specific unit can be challenging.',
    category: 'transmission',
    severity: 'high',
    years: { start: 1990, end: 1992 },
    estimatedCost: { min: 1000, max: 2500 },
    symptoms: [
      'Transmission slipping under acceleration',
      'Harsh or delayed shifts',
      'Loss of forward gears',
      'Burnt transmission fluid smell',
      'Check engine light with transmission codes'
    ],
    commonFixes: [
      'Transmission rebuild ($1,500-$2,500)',
      'Used transmission replacement from junkyard ($800-$1,500 installed)',
      'Regular ATF changes every 30,000 miles as prevention ($100-$200)'
    ],
    dtcCodes: ['P0700', 'P0741', 'P0751']
  },
  {
    id: 'nissan-stanza-oil-leak-1990',
    make: 'Nissan',
    model: 'Stanza',
    title: 'Engine Oil Leaks (Multiple Locations)',
    description: 'The KA24E engine in the Stanza develops oil leaks from the valve cover gasket, oil pan gasket, rear main seal, and front crank seal as the gasket materials age and harden. The most common and visible leak is from the valve cover gasket, which drips oil onto the exhaust manifold causing a burning oil smell. The rear main seal leak is more serious and labor-intensive to repair. These leaks are typical of aging KA24E engines across all Nissan applications.',
    category: 'engine',
    severity: 'medium',
    years: { start: 1990, end: 1992 },
    estimatedCost: { min: 100, max: 800 },
    symptoms: [
      'Oil spots under vehicle',
      'Burning oil smell from engine bay',
      'Visible oil weeping from valve cover area',
      'Low oil level between changes',
      'Smoke from exhaust manifold area'
    ],
    commonFixes: [
      'Valve cover gasket replacement ($50-$150 DIY, $150-$300 at shop)',
      'Oil pan gasket replacement ($200-$400)',
      'Rear main seal replacement ($400-$800, requires trans removal)',
      'Complete engine reseal ($500-$800)'
    ],
    dtcCodes: ['P0171', 'P0174', 'P0420']
  },

  // ----- ROGUE SPORT (2017-2022) -----
  {
    id: 'nissan-rogue-sport-cvt-issues-2017',
    make: 'Nissan',
    model: 'Rogue Sport',
    title: 'CVT Transmission Shudder and Premature Failure',
    description: 'The Nissan Rogue Sport uses the same Jatco CVT (Continuously Variable Transmission) that has been problematic across the Nissan lineup. The CVT can develop shuddering during acceleration, hesitation, and in severe cases, complete failure. The belt and pulley system wears prematurely, and the transmission fluid degrades faster than Nissan service intervals account for. Nissan extended the CVT warranty to 10 years/120,000 miles for some model years due to the widespread nature of this issue.',
    category: 'transmission',
    severity: 'high',
    years: { start: 2017, end: 2022 },
    estimatedCost: { min: 200, max: 4500 },
    symptoms: [
      'Shuddering during light acceleration',
      'Hesitation or delay when accelerating',
      'CVT whining or droning noise',
      'Loss of power at highway speeds',
      'Transmission warning light'
    ],
    commonFixes: [
      'CVT fluid change with Nissan NS-3 CVT fluid ($150-$200)',
      'TCM (Transmission Control Module) reprogram ($100-$200)',
      'CVT replacement under extended warranty (free if eligible)',
      'CVT replacement if out of warranty ($3,500-$4,500)'
    ],
    dtcCodes: ['P0700', 'P0730', 'P0868']
  },
  {
    id: 'nissan-rogue-sport-cvt-judder-2017',
    make: 'Nissan',
    model: 'Rogue Sport',
    title: 'CVT Low-Speed Judder and Acceleration Hesitation',
    description: 'The Rogue Sport CVT exhibits a characteristic low-speed judder and hesitation during initial acceleration from a stop, particularly noticeable in parking lots and stop-and-go traffic. The CVT engages harshly at low speeds and can feel like the vehicle is bucking or stumbling. TCM software updates improve but do not fully eliminate the behavior. This is inherent to the CVT design and belt-drive engagement characteristics.',
    category: 'transmission',
    severity: 'medium',
    years: { start: 2017, end: 2022 },
    estimatedCost: { min: 0, max: 200 },
    symptoms: [
      'Judder or shaking during initial acceleration',
      'Bucking sensation at low speeds',
      'Rough engagement from stop',
      'Hesitation when pressing accelerator',
      'Vibration felt through steering wheel and seat'
    ],
    commonFixes: [
      'TCM software update at Nissan dealer ($0-$100)',
      'CVT fluid change with Nissan NS-3 ($150-$200)',
      'Gradual throttle application technique to minimize judder'
    ],
    dtcCodes: ['P0700', 'P0730', 'P0868']
  },

  // ----- ARIYA (2023-2026) -----
  {
    id: 'nissan-ariya-software-bugs-2023',
    make: 'Nissan',
    model: 'Ariya',
    title: 'Software Bugs and Infotainment Issues',
    description: 'As a new electric vehicle platform, the Nissan Ariya has experienced various software-related issues including infotainment freezes, navigation glitches, EV charging session failures, and mobile app connectivity problems. The battery management system occasionally reports inaccurate range estimates, and OTA update installations have sometimes failed, requiring dealer intervention. Nissan has been actively releasing software updates to address these issues. These are typical first-generation EV software growing pains.',
    category: 'electrical',
    severity: 'low',
    years: { start: 2023, end: 2026 },
    estimatedCost: { min: 0, max: 0 },
    symptoms: [
      'Infotainment screen freezing or rebooting',
      'Inaccurate range estimation',
      'Charging session interruptions',
      'Mobile app connectivity failures',
      'OTA update installation failures'
    ],
    commonFixes: [
      'Software update at Nissan dealer (free under warranty)',
      'Accept OTA updates promptly when available',
      'Hard reset infotainment by holding power button'
    ],
    dtcCodes: []
  },

  // ========================================
  // SUBARU
  // ========================================

  // ----- SVX (1992-1997) -----
  {
    id: 'subaru-svx-auto-transmission-failure-1992',
    make: 'Subaru',
    model: 'SVX',
    title: 'Automatic Transmission Failure (4EAT)',
    description: 'The Subaru SVX was only offered with a 4-speed automatic transmission (4EAT), and this transmission is the weakest link in an otherwise robust vehicle. The 4EAT struggles to handle the 230 hp output of the EG33 flat-six engine, leading to premature torque converter failure, clutch pack wear, and complete transmission failure. Many SVXs have been scrapped due to transmission failure because rebuilds are expensive and finding specialists is difficult. No manual transmission option was ever offered by Subaru for the SVX.',
    category: 'transmission',
    severity: 'high',
    years: { start: 1992, end: 1997 },
    estimatedCost: { min: 1500, max: 4000 },
    symptoms: [
      'Transmission slipping under load',
      'Harsh shifts between gears',
      'Torque converter shudder at lockup',
      'Loss of forward or reverse gears',
      'Burnt transmission fluid smell'
    ],
    commonFixes: [
      'Transmission rebuild with upgraded clutch packs ($2,000-$3,500)',
      'Manual transmission swap (popular enthusiast modification, $2,500-$4,000)',
      'Regular ATF changes every 25,000 miles ($100-$200)',
      'Used transmission from low-mileage donor ($1,500-$2,500 installed)'
    ],
    dtcCodes: ['P0700', 'P0741', 'P0751']
  },
  {
    id: 'subaru-svx-window-regulator-1992',
    make: 'Subaru',
    model: 'SVX',
    title: 'Power Window Regulator Failure (Window-Within-Window)',
    description: 'The SVX features a unique window-within-a-window design where only the inner portion of the side glass drops down. This distinctive design uses complex window regulators that are prone to failure. The cable-driven regulators stretch, break, or the motor fails, leaving the inner window stuck. OEM replacement parts are extremely scarce due to the unique design. Aftermarket options are limited, and many SVX owners rebuild regulators or source used parts from salvage vehicles.',
    category: 'electrical',
    severity: 'medium',
    years: { start: 1992, end: 1997 },
    estimatedCost: { min: 200, max: 800 },
    symptoms: [
      'Inner window stuck in up or down position',
      'Grinding noise when operating window',
      'Window moves very slowly',
      'Motor runs but window does not move',
      'Broken cable visible inside door panel'
    ],
    commonFixes: [
      'Window regulator rebuild with new cable ($200-$400)',
      'Used OEM regulator from salvage vehicle ($150-$350)',
      'Window motor replacement ($100-$250)',
      'Professional regulator cable repair ($200-$500)'
    ],
    dtcCodes: []
  },

  // ----- LOYALE (1990-1994) -----
  {
    id: 'subaru-loyale-head-gasket-failure-1990',
    make: 'Subaru',
    model: 'Loyale',
    title: 'Head Gasket Failure (EA82 Engine)',
    description: 'The Subaru Loyale uses the EA82 flat-four engine, which is the predecessor to the EJ-series engines that became famous for head gasket failures. The EA82 head gaskets deteriorate with age and heat cycling, causing external coolant leaks, internal coolant-to-oil contamination, or combustion gas leaks into the cooling system. The flat-four (boxer) layout means there are two head gaskets, and both typically need replacement. The EA82 is otherwise a durable engine that can last well over 200,000 miles with proper maintenance.',
    category: 'engine',
    severity: 'high',
    years: { start: 1990, end: 1994 },
    estimatedCost: { min: 600, max: 1500 },
    symptoms: [
      'External coolant leak from head gasket area',
      'Overheating under load',
      'White exhaust smoke',
      'Milky residue on oil filler cap',
      'Coolant level dropping without visible external leak'
    ],
    commonFixes: [
      'Head gasket replacement on both banks ($600-$1,200)',
      'Cylinder head resurfacing ($100-$200 per head)',
      'Replace water pump and thermostat during repair ($100-$200 additional)',
      'Upgrade to MLS (multi-layer steel) gaskets for improved durability'
    ],
    dtcCodes: ['P0171', 'P0174', 'P0300', 'P0128']
  },
  {
    id: 'subaru-loyale-rust-1990',
    make: 'Subaru',
    model: 'Loyale',
    title: 'Body and Underbody Rust',
    description: 'The Subaru Loyale is highly susceptible to body and underbody rust, especially in salt-belt regions. The wheel wells, rocker panels, rear quarter panels, and underbody are the most common rust areas. The Loyale was a budget vehicle with minimal corrosion protection from the factory. Many Loyales have been scrapped due to structural rust despite having mechanically sound drivetrains. The AWD system components (rear differential, driveshaft) can also suffer from corrosion-related issues.',
    category: 'body',
    severity: 'high',
    years: { start: 1990, end: 1994 },
    estimatedCost: { min: 300, max: 2000 },
    symptoms: [
      'Bubbling paint on wheel wells and rocker panels',
      'Rust perforation on rear quarter panels',
      'Floor pan rusting through',
      'Subframe and crossmember corrosion',
      'Failed safety inspection due to rust'
    ],
    commonFixes: [
      'Rust repair and patch panels ($300-$1,000)',
      'Rocker panel replacement ($300-$600 per side)',
      'POR-15 rust encapsulation treatment ($50-$100)',
      'Annual undercoating for prevention ($100-$200)'
    ],
    dtcCodes: []
  },

  // ========================================
  // MAZDA
  // ========================================

  // ----- CX-7 (2007-2012) -----
  {
    id: 'mazda-cx7-turbo-engine-failure-2007',
    make: 'Mazda',
    model: 'CX-7',
    title: '2.3L Turbo Engine Failure from Oil Starvation',
    description: 'The 2.3L MZR DISI turbocharged engine in the CX-7 (shared with the Mazdaspeed3/6) is prone to catastrophic failure from turbocharger oil starvation and timing chain tensioner failure. The turbo oil feed line becomes restricted with carbon buildup, starving the turbo bearings of oil. The timing chain tensioner can also fail, allowing the chain to jump and cause valve-to-piston contact. Short oil change intervals (5,000 miles or less) with full synthetic oil are critical for longevity. Many CX-7s have had engine replacements before 100,000 miles.',
    category: 'engine',
    severity: 'high',
    years: { start: 2007, end: 2012 },
    estimatedCost: { min: 1500, max: 5000 },
    symptoms: [
      'Excessive turbo lag or loss of boost',
      'Blue or white smoke from exhaust',
      'Engine knocking or rattling',
      'Low oil pressure warning',
      'Check engine light with misfire codes',
      'Turbo whine or grinding noise'
    ],
    commonFixes: [
      'Turbo oil feed line cleaning or replacement ($200-$500)',
      'Turbocharger replacement ($1,000-$2,000)',
      'Timing chain and tensioner replacement ($800-$1,500)',
      'Complete engine replacement ($3,000-$5,000)',
      'Use full synthetic oil with 5,000-mile change intervals'
    ],
    dtcCodes: ['P0011', 'P0012', 'P0016']
  },
  {
    id: 'mazda-cx7-vvt-actuator-2007',
    make: 'Mazda',
    model: 'CX-7',
    title: 'VVT Actuator Failure',
    description: 'The Variable Valve Timing (VVT) actuator on the 2.3L turbo engine can fail due to oil contamination, internal seal wear, or solenoid malfunction. A failed VVT actuator causes rough idle, poor performance, and check engine lights with timing-related codes. The VVT system relies on clean oil pressure to function, so oil contamination from extended oil change intervals accelerates failure. This issue often accompanies or precedes the larger turbo engine failure problem.',
    category: 'engine',
    severity: 'medium',
    years: { start: 2007, end: 2012 },
    estimatedCost: { min: 300, max: 1000 },
    symptoms: [
      'Check engine light with VVT codes',
      'Rough idle especially when cold',
      'Rattling noise from engine on startup',
      'Reduced engine power',
      'Poor fuel economy'
    ],
    commonFixes: [
      'VVT actuator replacement ($300-$600)',
      'VVT solenoid replacement ($100-$250)',
      'Oil change with full synthetic to restore VVT function ($50-$100)',
      'Complete VVT system service ($500-$1,000)'
    ],
    dtcCodes: ['P0011', 'P0012', 'P0016']
  },

  // ----- MAZDA2 (2011-2014) -----
  {
    id: 'mazda-mazda2-tcm-reprogram-2011',
    make: 'Mazda',
    model: 'Mazda2',
    title: 'TCM Reprogram Needed for Shift Quality',
    description: 'The Mazda2 4-speed automatic transmission may exhibit harsh shifting, particularly the 1-2 and 2-3 upshifts during light throttle driving. Mazda released a TCM (Transmission Control Module) software update to improve shift quality and smoothness. The update adjusts shift timing and torque converter lockup strategy. This is a minor issue that does not indicate mechanical failure, and the manual transmission version is not affected.',
    category: 'transmission',
    severity: 'low',
    years: { start: 2011, end: 2014 },
    estimatedCost: { min: 0, max: 150 },
    symptoms: [
      'Harsh 1-2 upshift during light throttle',
      'Firm 2-3 shift felt through vehicle',
      'Slight hesitation before downshift',
      'Occasional rough engagement into Drive'
    ],
    commonFixes: [
      'TCM software update at Mazda dealer ($0-$150)',
      'ATF fluid change with Mazda M5 ATF ($100-$150)'
    ],
    dtcCodes: ['P0700']
  },

  // ----- CX-70 (2025-2026) -----
  {
    id: 'mazda-cx70-infotainment-updates-2025',
    make: 'Mazda',
    model: 'CX-70',
    title: 'Infotainment System Software Updates Needed',
    description: 'As a new model on the Mazda Large Product platform, the CX-70 has experienced typical first-model-year infotainment software issues including occasional screen freezes, Bluetooth connectivity drops, and wireless Apple CarPlay/Android Auto disconnections. Mazda has been releasing regular software updates to address these issues. The 12.3-inch touchscreen system occasionally requires a hard reset. These are minor software growing pains expected to resolve with updates.',
    category: 'electrical',
    severity: 'low',
    years: { start: 2025, end: 2026 },
    estimatedCost: { min: 0, max: 0 },
    symptoms: [
      'Infotainment screen freezing momentarily',
      'Bluetooth connection dropping',
      'Wireless CarPlay/Android Auto disconnecting',
      'Slow infotainment system response',
      'Screen requiring manual restart'
    ],
    commonFixes: [
      'Software update at Mazda dealer (free under warranty)',
      'Hard reset infotainment by holding power/volume knob',
      'Clear paired devices and re-pair Bluetooth connections'
    ],
    dtcCodes: []
  },

  // ========================================
  // HYUNDAI
  // ========================================

  // ----- TIBURON (1997-2008) -----
  {
    id: 'hyundai-tiburon-timing-belt-tensioner-1997',
    make: 'Hyundai',
    model: 'Tiburon',
    title: 'Timing Belt Tensioner Failure',
    description: 'The Tiburon Beta and Delta engines use a timing belt with a hydraulic tensioner that can fail, causing the belt to lose tension and potentially jump timing. Both the 2.0L Beta engine (1997-2001) and the 2.7L Delta V6 (2003-2008) are interference engines, meaning a jumped or broken timing belt causes catastrophic valve-to-piston contact. The tensioner bearing can also seize, causing belt wear and failure. Replacement at the recommended 60,000-mile interval is critical.',
    category: 'engine',
    severity: 'high',
    years: { start: 1997, end: 2008 },
    estimatedCost: { min: 400, max: 1200 },
    symptoms: [
      'Ticking or squealing from timing cover area',
      'Engine vibration at idle',
      'Check engine light with timing-related codes',
      'Sudden engine failure if belt jumps',
      'Rattling on cold start'
    ],
    commonFixes: [
      'Timing belt and tensioner replacement ($400-$800 for 4-cylinder)',
      'Timing belt kit with water pump for V6 ($600-$1,200)',
      'Replace timing belt every 60,000 miles as preventive maintenance',
      'Replace water pump during timing belt job ($100-$200 additional)'
    ],
    dtcCodes: ['P0016', 'P0017']
  },
  {
    id: 'hyundai-tiburon-clutch-hydraulic-failure-1997',
    make: 'Hyundai',
    model: 'Tiburon',
    title: 'Clutch Hydraulic System Failure',
    description: 'Manual transmission Tiburons use a hydraulic clutch with master and slave cylinders that are prone to failure. The clutch master cylinder develops internal seal leaks, and the slave cylinder (mounted on the transmission bell housing) can develop external leaks. When either cylinder fails, the clutch pedal becomes spongy or drops to the floor, making shifting impossible. The slave cylinder is the more common failure point and requires transmission removal on some models for replacement.',
    category: 'transmission',
    severity: 'medium',
    years: { start: 1997, end: 2008 },
    estimatedCost: { min: 150, max: 800 },
    symptoms: [
      'Spongy or soft clutch pedal',
      'Clutch pedal drops to floor',
      'Difficulty shifting gears',
      'Clutch fluid level dropping',
      'Clutch not fully disengaging (grinding into gear)'
    ],
    commonFixes: [
      'Clutch slave cylinder replacement ($150-$400)',
      'Clutch master cylinder replacement ($100-$300)',
      'Complete clutch hydraulic system flush and bleed ($50-$100)',
      'Replace both cylinders together as preventive measure ($250-$600)'
    ],
    dtcCodes: []
  },

  // ----- EXCEL (1990-1994) -----
  {
    id: 'hyundai-excel-head-gasket-1990',
    make: 'Hyundai',
    model: 'Excel',
    title: 'Head Gasket Failure (Mitsubishi G4DJ/G4EK)',
    description: 'The Hyundai Excel uses Mitsubishi-derived 1.5L engines (G4DJ and G4EK) that are prone to head gasket failure. The gasket material deteriorates from heat cycling and age, causing coolant leaks, overheating, and combustion gas intrusion into the cooling system. The Excel was a budget vehicle and many owners deferred maintenance, accelerating gasket failure. While the repair is straightforward on this simple engine, the low value of the vehicle often makes head gasket replacement uneconomical.',
    category: 'engine',
    severity: 'high',
    years: { start: 1990, end: 1994 },
    estimatedCost: { min: 400, max: 1000 },
    symptoms: [
      'Engine overheating',
      'White exhaust smoke',
      'Coolant loss without visible external leak',
      'Milky oil on dipstick',
      'Rough idle and misfires'
    ],
    commonFixes: [
      'Head gasket replacement ($400-$800)',
      'Cylinder head resurfacing ($100-$200)',
      'Cooling system flush and thermostat replacement ($50-$100 additional)'
    ],
    dtcCodes: ['P0171', 'P0174', 'P0300', 'P0128']
  },
  {
    id: 'hyundai-excel-auto-transmission-1990',
    make: 'Hyundai',
    model: 'Excel',
    title: 'Automatic Transmission Premature Failure',
    description: 'The 4-speed automatic transmission in the Excel is the least reliable component of the vehicle. The transmission suffers from premature clutch pack wear, valve body failures, and torque converter issues. Harsh shifting progresses to slipping, and eventual complete failure typically occurs between 80,000-120,000 miles. The transmission was designed for minimal cost and is marginal for even the modest power output of the 1.5L engine. Manual transmission models are significantly more reliable.',
    category: 'transmission',
    severity: 'high',
    years: { start: 1990, end: 1994 },
    estimatedCost: { min: 800, max: 2000 },
    symptoms: [
      'Harsh or delayed shifts',
      'Transmission slipping under acceleration',
      'Loss of reverse or forward gears',
      'Burnt transmission fluid',
      'Shudder during gear changes'
    ],
    commonFixes: [
      'Transmission rebuild ($1,200-$2,000)',
      'Used transmission from junkyard ($500-$1,000 installed)',
      'Regular ATF changes every 25,000 miles ($80-$150)',
      'Consider manual transmission swap for reliability'
    ],
    dtcCodes: ['P0700', 'P0741', 'P0751']
  },

  // ----- SCOUPE (1991-1995) -----
  {
    id: 'hyundai-scoupe-head-gasket-1991',
    make: 'Hyundai',
    model: 'Scoupe',
    title: 'Head Gasket Failure (Shared Excel Platform)',
    description: 'The Hyundai Scoupe shares its engine and platform with the Excel, inheriting the same head gasket weakness from the Mitsubishi-derived 1.5L engine (G4EK). The head gasket deteriorates with heat cycling, causing coolant leaks and overheating. The Scoupe Turbo model (1993-1995) is even more susceptible due to the added heat and pressure from forced induction. Regular cooling system maintenance is essential for longevity.',
    category: 'engine',
    severity: 'high',
    years: { start: 1991, end: 1995 },
    estimatedCost: { min: 400, max: 1000 },
    symptoms: [
      'Engine overheating',
      'White exhaust smoke',
      'Coolant loss without visible leak',
      'Milky oil residue',
      'Rough idle and cylinder misfires'
    ],
    commonFixes: [
      'Head gasket replacement ($400-$800)',
      'Cylinder head resurfacing ($100-$200)',
      'Replace thermostat and water pump during repair ($100-$200)'
    ],
    dtcCodes: ['P0171', 'P0174', 'P0300', 'P0128']
  },
  {
    id: 'hyundai-scoupe-auto-transmission-1991',
    make: 'Hyundai',
    model: 'Scoupe',
    title: 'Automatic Transmission Premature Failure',
    description: 'Like its Excel sibling, the Scoupe automatic transmission suffers from premature wear and failure. The same 4-speed automatic unit is used, with identical failure modes including clutch pack degradation, valve body issues, and torque converter problems. The Scoupe Turbo model puts additional stress on the already marginal transmission. Manual transmission models are far more reliable and the preferred choice among enthusiasts.',
    category: 'transmission',
    severity: 'high',
    years: { start: 1991, end: 1995 },
    estimatedCost: { min: 800, max: 2000 },
    symptoms: [
      'Transmission slipping',
      'Harsh or delayed shifting',
      'Loss of gears',
      'Burnt fluid smell',
      'Shudder during shifts'
    ],
    commonFixes: [
      'Transmission rebuild ($1,200-$2,000)',
      'Used transmission replacement ($500-$1,000 installed)',
      'Regular ATF service every 25,000 miles ($80-$150)'
    ],
    dtcCodes: ['P0700', 'P0741', 'P0751']
  },

  // ----- AZERA (2006-2011) -----
  {
    id: 'hyundai-azera-timing-chain-tensioner-2006',
    make: 'Hyundai',
    model: 'Azera',
    title: 'Timing Chain Tensioner Failure (3.3L/3.8L Lambda)',
    description: 'The 3.3L and 3.8L Lambda V6 engines in the Azera use timing chains with hydraulic tensioners that can fail due to oil pressure loss or internal wear. The tensioner relies on consistent oil pressure to maintain chain tension, and low oil levels or degraded oil can cause the tensioner to lose pressure, resulting in chain slack and noise. In severe cases, the chain can jump timing, causing valve-to-piston contact on these interference engines. Regular oil changes and maintaining proper oil levels are critical.',
    category: 'engine',
    severity: 'high',
    years: { start: 2006, end: 2011 },
    estimatedCost: { min: 800, max: 2500 },
    symptoms: [
      'Rattling or chain noise on cold start',
      'Check engine light with timing codes',
      'Rough idle',
      'Reduced engine power',
      'Engine noise increases with RPM'
    ],
    commonFixes: [
      'Timing chain tensioner replacement ($800-$1,500)',
      'Complete timing chain kit replacement ($1,500-$2,500)',
      'Regular oil changes with OEM-spec oil every 5,000 miles',
      'Maintain oil level and never let it drop below minimum'
    ],
    dtcCodes: ['P0011', 'P0012', 'P0016']
  },
  {
    id: 'hyundai-azera-power-steering-leak-2006',
    make: 'Hyundai',
    model: 'Azera',
    title: 'Power Steering System Leak',
    description: 'The hydraulic power steering system on the Azera develops leaks from the high-pressure hose, pump seals, and steering rack seals. The power steering hose is the most common leak point, typically failing at the crimp fitting where the hose connects to the metal line. A leaking power steering system causes whining noise, heavy steering, and can lead to pump damage if fluid runs low. The pump itself can also develop seal leaks from age and heat.',
    category: 'steering',
    severity: 'medium',
    years: { start: 2006, end: 2011 },
    estimatedCost: { min: 200, max: 1000 },
    symptoms: [
      'Power steering fluid on ground under vehicle',
      'Whining noise when turning steering wheel',
      'Heavy or stiff steering',
      'Low power steering fluid level',
      'Groaning noise at full lock'
    ],
    commonFixes: [
      'Power steering hose replacement ($200-$400)',
      'Power steering pump replacement ($300-$600)',
      'Steering rack seal replacement ($500-$1,000)',
      'Power steering fluid flush ($80-$150)'
    ],
    dtcCodes: []
  },

  // ----- XG350 (2001-2005) -----
  {
    id: 'hyundai-xg350-timing-belt-tensioner-2001',
    make: 'Hyundai',
    model: 'XG350',
    title: 'Timing Belt Tensioner Failure (3.5L Sigma V6)',
    description: 'The 3.5L Sigma V6 engine in the XG350 uses a timing belt with a hydraulic tensioner that can fail, allowing the belt to lose tension. The tensioner bearing can seize or the hydraulic damper can leak, both leading to belt slack and potential timing jump. The Sigma V6 is an interference engine, so a timing belt failure or jump causes catastrophic engine damage. Hyundai recommends timing belt replacement at 60,000-mile intervals, but many XG350 owners defer this service due to cost.',
    category: 'engine',
    severity: 'high',
    years: { start: 2001, end: 2005 },
    estimatedCost: { min: 500, max: 1200 },
    symptoms: [
      'Squealing or chirping from timing cover area',
      'Engine vibration and rough idle',
      'Check engine light with timing codes',
      'Ticking noise from front of engine',
      'Sudden engine failure if belt jumps or breaks'
    ],
    commonFixes: [
      'Timing belt and tensioner replacement ($500-$900)',
      'Complete timing belt kit with water pump ($700-$1,200)',
      'Replace timing belt every 60,000 miles as preventive maintenance',
      'Replace idler pulleys during belt service ($50-$100 additional)'
    ],
    dtcCodes: ['P0016', 'P0017']
  },
  {
    id: 'hyundai-xg350-power-steering-leak-2001',
    make: 'Hyundai',
    model: 'XG350',
    title: 'Power Steering System Leak',
    description: 'The XG350 power steering system develops leaks from the high-pressure hose, pump shaft seal, and steering rack seals. The rubber power steering hoses deteriorate from heat and age, developing leaks at crimped fittings. The power steering pump shaft seal is another common leak point. A leaking system causes whining on turns, heavy steering effort, and potential pump damage from low fluid. Regular fluid checks and timely hose replacement prevent expensive pump and rack failures.',
    category: 'steering',
    severity: 'medium',
    years: { start: 2001, end: 2005 },
    estimatedCost: { min: 150, max: 800 },
    symptoms: [
      'Power steering fluid leaking under vehicle',
      'Whining or groaning when turning',
      'Heavy steering effort',
      'Steering fluid level drops frequently',
      'Noise worse in cold weather'
    ],
    commonFixes: [
      'Power steering pressure hose replacement ($150-$350)',
      'Power steering pump seal or replacement ($250-$500)',
      'Steering rack seal replacement ($400-$800)',
      'Fluid flush and system check ($80-$120)'
    ],
    dtcCodes: []
  },

  // ----- VENUE (2020-2026) -----
  {
    id: 'hyundai-venue-cvt-judder-2020',
    make: 'Hyundai',
    model: 'Venue',
    title: 'IVT (CVT) Judder and Hesitation',
    description: 'The Hyundai Venue uses an IVT (Intelligent Variable Transmission), which is Hyundai\'s version of a CVT. The IVT can exhibit judder during low-speed acceleration, hesitation when merging or passing, and a rubber-band effect during throttle changes. The transmission programming prioritizes fuel economy, causing noticeable delays between throttle input and vehicle response. Hyundai has released TCM software updates to improve responsiveness for some model years.',
    category: 'transmission',
    severity: 'medium',
    years: { start: 2020, end: 2026 },
    estimatedCost: { min: 0, max: 200 },
    symptoms: [
      'Low-speed judder during acceleration',
      'Hesitation during passing maneuvers',
      'Rubber-band effect during throttle changes',
      'Rough engagement from stop',
      'CVT whining under load'
    ],
    commonFixes: [
      'TCM software update at Hyundai dealer (free under warranty)',
      'IVT/CVT fluid change ($150-$200)',
      'Gradual throttle application to minimize judder'
    ],
    dtcCodes: ['P0700', 'P0730', 'P0868']
  },
  {
    id: 'hyundai-venue-infotainment-lag-2020',
    make: 'Hyundai',
    model: 'Venue',
    title: 'Infotainment System Lag and Connectivity Issues',
    description: 'The Venue infotainment system can experience lag, freezing, and Bluetooth/smartphone connectivity issues. The 8-inch touchscreen may become unresponsive, Apple CarPlay or Android Auto connections can drop, and the system may require periodic reboots. Software updates from Hyundai address many of these issues, but the entry-level hardware in the Venue makes it more susceptible to slowness compared to higher-end Hyundai models.',
    category: 'electrical',
    severity: 'low',
    years: { start: 2020, end: 2026 },
    estimatedCost: { min: 0, max: 150 },
    symptoms: [
      'Touchscreen lag and slow response',
      'Bluetooth connection dropping',
      'Apple CarPlay/Android Auto disconnecting',
      'System freezing and requiring reboot',
      'Backup camera display delay'
    ],
    commonFixes: [
      'Software update at Hyundai dealer (free under warranty)',
      'Hard reset infotainment system',
      'Clear paired Bluetooth devices and re-pair'
    ],
    dtcCodes: []
  },

  // ========================================
  // KIA
  // ========================================

  // ----- SEPHIA (1994-2001) -----
  {
    id: 'kia-sephia-head-gasket-failure-1994',
    make: 'Kia',
    model: 'Sephia',
    title: 'Head Gasket Failure (Mazda B-Series Engine)',
    description: 'The Kia Sephia uses Mazda-derived 1.6L and 1.8L engines (B6 and BP platform) that develop head gasket failures from heat cycling and age. The gasket material deteriorates, allowing coolant to leak externally or mix with engine oil. The Sephia was a budget vehicle with many owners deferring maintenance, which accelerates gasket failure through overheating. The engine design is otherwise sound, being the same basic architecture used in the Mazda Protege and MX-5 Miata.',
    category: 'engine',
    severity: 'high',
    years: { start: 1994, end: 2001 },
    estimatedCost: { min: 400, max: 1000 },
    symptoms: [
      'Coolant loss without visible external leak',
      'White exhaust smoke',
      'Engine overheating',
      'Milky oil residue on filler cap',
      'Rough idle and misfires'
    ],
    commonFixes: [
      'Head gasket replacement ($400-$800)',
      'Cylinder head resurfacing ($100-$200)',
      'Replace thermostat and water pump during repair ($100-$200)',
      'Cooling system flush ($50-$80)'
    ],
    dtcCodes: ['P0171', 'P0174', 'P0300', 'P0128']
  },
  {
    id: 'kia-sephia-timing-belt-failure-1994',
    make: 'Kia',
    model: 'Sephia',
    title: 'Timing Belt Failure and Tensioner Wear',
    description: 'The Sephia engines are interference designs that require timing belt replacement at 60,000-mile intervals. The timing belt tensioner bearing can fail prematurely, causing the belt to jump or break. A broken timing belt on the Sephia engine causes catastrophic valve damage. Many Sephia owners were unaware of the timing belt replacement interval, leading to preventable engine failures. The belt, tensioner, and water pump should all be replaced together as a kit.',
    category: 'engine',
    severity: 'high',
    years: { start: 1994, end: 2001 },
    estimatedCost: { min: 300, max: 800 },
    symptoms: [
      'Squealing from timing belt area',
      'Engine suddenly stops running (belt break)',
      'Rough idle and misfires (belt jumped one tooth)',
      'Ticking noise from timing cover',
      'Engine cranks but will not start (broken belt)'
    ],
    commonFixes: [
      'Timing belt and tensioner replacement ($300-$600)',
      'Timing belt kit with water pump ($400-$800)',
      'Replace belt every 60,000 miles as scheduled maintenance'
    ],
    dtcCodes: ['P0016', 'P0017']
  },
  {
    id: 'kia-sephia-clutch-hydraulic-1994',
    make: 'Kia',
    model: 'Sephia',
    title: 'Clutch Hydraulic System Failure',
    description: 'Manual transmission Sephias use a hydraulic clutch with master and slave cylinders that are prone to seal failure. The slave cylinder (mounted externally on the transmission) is the more common failure point, developing leaks that cause the clutch pedal to become spongy or drop to the floor. The master cylinder can also fail internally. Both components use low-cost seals that deteriorate faster than in more premium vehicles. Replacement parts are inexpensive and readily available.',
    category: 'transmission',
    severity: 'medium',
    years: { start: 1994, end: 2001 },
    estimatedCost: { min: 100, max: 400 },
    symptoms: [
      'Spongy clutch pedal',
      'Clutch pedal drops to floor',
      'Difficulty getting into gear',
      'Clutch fluid level dropping',
      'Grinding when shifting'
    ],
    commonFixes: [
      'Clutch slave cylinder replacement ($100-$200)',
      'Clutch master cylinder replacement ($80-$200)',
      'Complete clutch hydraulic system bleed ($30-$50)',
      'Replace both cylinders as preventive measure ($150-$350)'
    ],
    dtcCodes: []
  },

  // ----- SPECTRA (2000-2009) -----
  {
    id: 'kia-spectra-timing-belt-2000',
    make: 'Kia',
    model: 'Spectra',
    title: 'Timing Belt Premature Wear and Failure',
    description: 'The Kia Spectra uses a 1.8L or 2.0L DOHC engine that requires timing belt replacement at 60,000-mile intervals. The timing belt tensioner and idler pulleys wear prematurely, causing belt flutter and eventual failure. These are interference engines, so a broken or jumped timing belt causes catastrophic engine damage. The timing belt is the single most critical maintenance item on the Spectra. Many engines have been destroyed by owners unaware of the replacement interval.',
    category: 'engine',
    severity: 'high',
    years: { start: 2000, end: 2009 },
    estimatedCost: { min: 300, max: 800 },
    symptoms: [
      'Squealing or chirping from timing belt area',
      'Engine vibration at idle',
      'Engine suddenly stops running',
      'Engine cranks but will not start',
      'Ticking noise from front of engine'
    ],
    commonFixes: [
      'Timing belt and tensioner replacement ($300-$600)',
      'Complete timing belt kit with water pump ($400-$800)',
      'Replace every 60,000 miles without exception'
    ],
    dtcCodes: ['P0016', 'P0017']
  },
  {
    id: 'kia-spectra-alternator-failure-2000',
    make: 'Kia',
    model: 'Spectra',
    title: 'Alternator Premature Failure',
    description: 'The alternator in the Kia Spectra has a higher-than-average failure rate, typically failing between 60,000-100,000 miles. The internal voltage regulator and rectifier are the common failure points, causing undercharging or overcharging of the battery. Symptoms include dimming lights, battery warning light, and eventual no-start condition. Some owners have experienced multiple alternator replacements. Remanufactured units from auto parts stores have mixed reliability.',
    category: 'electrical',
    severity: 'medium',
    years: { start: 2000, end: 2009 },
    estimatedCost: { min: 200, max: 500 },
    symptoms: [
      'Battery warning light on dashboard',
      'Dimming headlights at idle',
      'Battery not holding charge',
      'Electrical accessories cutting out',
      'Dead battery after short parking period'
    ],
    commonFixes: [
      'Alternator replacement ($200-$400 for OEM quality)',
      'New alternator (not remanufactured) for better reliability ($300-$500)',
      'Check and clean battery terminals and ground cables ($0-$20)'
    ],
    dtcCodes: []
  },
  {
    id: 'kia-spectra-catalytic-converter-2000',
    make: 'Kia',
    model: 'Spectra',
    title: 'Catalytic Converter Premature Failure',
    description: 'The catalytic converter on the Spectra can fail prematurely, often before 100,000 miles. The catalyst substrate deteriorates or becomes clogged, causing reduced engine performance and increased emissions. Oil burning from worn valve seals can contaminate the catalyst, accelerating failure. The Spectra was covered under the federal emissions warranty (8 years/80,000 miles) for catalytic converter failure, but many vehicles are now beyond this coverage.',
    category: 'exhaust',
    severity: 'medium',
    years: { start: 2000, end: 2009 },
    estimatedCost: { min: 400, max: 1200 },
    symptoms: [
      'Check engine light with catalyst efficiency code',
      'Sulfur (rotten egg) smell from exhaust',
      'Reduced engine power',
      'Poor fuel economy',
      'Failed emissions test'
    ],
    commonFixes: [
      'Catalytic converter replacement ($400-$900 aftermarket, $800-$1,200 OEM)',
      'Check for underlying oil burning causing catalyst contamination',
      'Verify emissions warranty coverage (8 years/80,000 miles federal)'
    ],
    dtcCodes: ['P0420', 'P0430']
  },

  // ----- AMANTI (2004-2009) -----
  {
    id: 'kia-amanti-transmission-failure-2004',
    make: 'Kia',
    model: 'Amanti',
    title: 'Automatic Transmission Failure (5-Speed)',
    description: 'The 5-speed automatic transmission in the Kia Amanti is prone to premature failure, particularly affecting the torque converter, forward clutch pack, and valve body. The transmission was shared with the Hyundai XG350 platform and struggles with the 3.5L V6 engine torque output. Symptoms progress from harsh shifting to slipping to complete failure, typically between 80,000-120,000 miles. Regular ATF changes can extend life, but the transmission design has inherent durability limitations.',
    category: 'transmission',
    severity: 'high',
    years: { start: 2004, end: 2009 },
    estimatedCost: { min: 1500, max: 3500 },
    symptoms: [
      'Harsh or delayed shifts',
      'Transmission slipping under acceleration',
      'Shudder during gear changes',
      'Loss of forward or reverse gears',
      'Check engine light with transmission codes'
    ],
    commonFixes: [
      'Transmission rebuild ($2,000-$3,500)',
      'Remanufactured transmission installation ($1,500-$2,500)',
      'Regular ATF changes every 30,000 miles as prevention ($100-$200)',
      'Valve body replacement for shifting issues ($500-$1,000)'
    ],
    dtcCodes: ['P0700', 'P0741', 'P0751']
  },
  {
    id: 'kia-amanti-power-steering-leak-2004',
    make: 'Kia',
    model: 'Amanti',
    title: 'Power Steering System Leak',
    description: 'The Amanti power steering system develops leaks from the high-pressure hose, pump seals, and steering rack. The rubber hoses deteriorate with age and heat, developing leaks at crimp fittings. The power steering pump shaft seal is another common failure point. A leaking power steering system causes whining noise, heavy steering, and potential pump failure from running low on fluid. The Amanti shares power steering components with the Hyundai XG350 platform.',
    category: 'steering',
    severity: 'medium',
    years: { start: 2004, end: 2009 },
    estimatedCost: { min: 200, max: 800 },
    symptoms: [
      'Power steering fluid on ground',
      'Whining noise when turning',
      'Heavy steering effort',
      'Low fluid level requiring frequent top-off',
      'Groaning at full steering lock'
    ],
    commonFixes: [
      'Power steering pressure hose replacement ($200-$400)',
      'Power steering pump replacement ($300-$600)',
      'Steering rack seal replacement ($400-$800)',
      'Power steering fluid flush ($80-$120)'
    ],
    dtcCodes: []
  },

  // ----- EV9 (2024-2026) -----
  {
    id: 'kia-ev9-software-update-issues-2024',
    make: 'Kia',
    model: 'EV9',
    title: 'Software Update and Infotainment Issues',
    description: 'As a new electric vehicle, the Kia EV9 has experienced typical first-generation software issues including infotainment freezes, occasional display glitches, OTA update failures, and EV charging session interruptions. The dual-screen display setup occasionally desynchronizes, and some owners have reported inaccurate range estimation in extreme temperatures. Kia has been actively pushing software updates to address these issues. These are expected growing pains for a new EV platform.',
    category: 'electrical',
    severity: 'low',
    years: { start: 2024, end: 2026 },
    estimatedCost: { min: 0, max: 0 },
    symptoms: [
      'Infotainment screen freezing or rebooting',
      'Dual displays desynchronizing',
      'OTA update installation failures',
      'Charging session interruptions at public chargers',
      'Inaccurate range estimation in extreme temperatures'
    ],
    commonFixes: [
      'Software update at Kia dealer (free under warranty)',
      'Accept OTA updates when available',
      'Hard reset infotainment by holding power button'
    ],
    dtcCodes: []
  }
];

// Check for duplicate IDs before adding
const existingIds = new Set(data.issues.map(i => i.id));
const duplicates = newIssues.filter(i => existingIds.has(i.id));
if (duplicates.length > 0) {
  console.log('WARNING: Found duplicate IDs that already exist in database:');
  duplicates.forEach(d => console.log(`  - ${d.id}`));
  console.log('Skipping duplicates and adding only new issues.\n');
}

const issuesToAdd = newIssues.filter(i => !existingIds.has(i.id));
data.issues.push(...issuesToAdd);

// Write back
fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');

// Print summary
const makeModelCount = {};
issuesToAdd.forEach(issue => {
  const key = `${issue.make} ${issue.model}`;
  if (!makeModelCount[key]) makeModelCount[key] = 0;
  makeModelCount[key]++;
});

console.log(`\nSuccessfully added ${issuesToAdd.length} issues to known-issues.json`);
console.log(`Total issues in database: ${data.issues.length}\n`);

console.log('Issues added by make/model:');
console.log('='.repeat(50));

const makes = {};
Object.entries(makeModelCount).forEach(([key, count]) => {
  const make = key.split(' ')[0];
  if (!makes[make]) makes[make] = [];
  makes[make].push({ model: key, count });
});

Object.keys(makes).sort().forEach(make => {
  const total = makes[make].reduce((sum, m) => sum + m.count, 0);
  console.log(`\n${make} (${total} issues):`);
  makes[make].forEach(({ model, count }) => {
    console.log(`  ${model}: ${count} issue(s)`);
  });
});

console.log('\n' + '='.repeat(50));
console.log(`\nBreakdown by category:`);
const categories = {};
issuesToAdd.forEach(i => {
  categories[i.category] = (categories[i.category] || 0) + 1;
});
Object.entries(categories).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count}`);
});

console.log(`\nBreakdown by severity:`);
const severities = {};
issuesToAdd.forEach(i => {
  severities[i.severity] = (severities[i.severity] || 0) + 1;
});
Object.entries(severities).sort((a, b) => b[1] - a[1]).forEach(([sev, count]) => {
  console.log(`  ${sev}: ${count}`);
});
