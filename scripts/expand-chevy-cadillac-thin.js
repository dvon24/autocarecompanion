/**
 * Expand thin Chevrolet and Cadillac models — add 2 real issues each
 * 24 Chevy models + 20 Cadillac models = 88 new issues
 */
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function yrs(start, end) {
  const arr = [];
  for (let y = start; y <= end; y++) arr.push(y);
  return arr;
}

const issues = [
  // ============================================================
  // CHEVROLET
  // ============================================================

  // Cobalt (2005-2010)
  {
    id: 'chevy-cobalt-fuel-pump-failure-2005',
    make: 'Chevrolet', model: 'Cobalt', years: yrs(2005, 2010),
    category: 'fuel', severity: 'medium',
    title: 'Fuel Pump Module Failure Causing Stalling and No-Start',
    description: 'The in-tank fuel pump assembly is prone to failure, often due to deteriorating fuel pump wiring harness connections or internal pump motor wear. Symptoms appear gradually with intermittent stalling before complete failure. Hot weather exacerbates the problem as heat-soaked pumps lose pressure.',
    solution: 'Replace the fuel pump module assembly. Use an OEM-equivalent pump with updated wiring harness connector. Drop the fuel tank for access — the Cobalt has no trunk access panel. Run the tank low before removal for safety.',
    symptoms: ['Engine stalls at highway speed', 'Hard starting when engine is hot', 'Sputtering under acceleration', 'Fuel pressure below 50 PSI'],
    affectedSystems: ['Fuel delivery system'],
    dtcCodes: ['P0087', 'P0230'],
    estimatedCostLow: 400, estimatedCostHigh: 700
  },
  {
    id: 'chevy-cobalt-front-hub-bearing-2005',
    make: 'Chevrolet', model: 'Cobalt', years: yrs(2005, 2010),
    category: 'suspension', severity: 'medium',
    title: 'Premature Front Wheel Hub Bearing Failure',
    description: 'Front wheel hub bearings commonly fail prematurely, sometimes as early as 50,000 miles. The sealed bearing units develop excessive play and noise due to poor sealing that allows water intrusion. Road salt environments accelerate failure dramatically.',
    solution: 'Replace the front hub bearing assembly. This is a bolt-on unit that does not require a press. Torque the axle nut to 159 ft-lbs. Inspect the ABS tone ring on the new hub before installing. Replace in pairs if high mileage.',
    symptoms: ['Humming noise that changes with speed', 'Noise changes pitch on turns', 'ABS warning light on', 'Steering wheel vibration at highway speed'],
    affectedSystems: ['Front suspension', 'ABS'],
    dtcCodes: ['C0035', 'C0040'],
    estimatedCostLow: 200, estimatedCostHigh: 400
  },

  // SS (2014-2017)
  {
    id: 'chevy-ss-differential-clunk-2014',
    make: 'Chevrolet', model: 'SS', years: yrs(2014, 2017),
    category: 'drivetrain', severity: 'low',
    title: 'Rear Differential Clunk on Low-Speed Turns',
    description: 'The limited-slip differential in the Chevy SS produces a noticeable clunking or banging noise during low-speed tight turns, particularly in parking lots. This is caused by the clutch-type LSD plates grabbing unevenly. While annoying, it is largely a characteristic of the differential design rather than a defect.',
    solution: 'Drain and refill the differential with GM-specified 75W-90 synthetic gear oil and add GM limited-slip additive (GM P/N 88900330). Some owners report improvement with Amsoil Severe Gear with friction modifier. The noise will return after a few thousand miles and the additive treatment can be repeated.',
    symptoms: ['Clunk or bang noise during slow tight turns', 'Shuddering from rear end in parking lots', 'Noise disappears above 15 mph'],
    affectedSystems: ['Rear differential'],
    dtcCodes: [],
    estimatedCostLow: 80, estimatedCostHigh: 200
  },
  {
    id: 'chevy-ss-ac-compressor-2014',
    make: 'Chevrolet', model: 'SS', years: yrs(2014, 2017),
    category: 'other', severity: 'medium',
    title: 'A/C Compressor Failure and Refrigerant Leak',
    description: 'The A/C compressor on the LS3-powered SS is prone to premature failure, often developing internal seal leaks that cause refrigerant loss. The Australian-built Holden platform used different A/C system specifications that can contribute to premature wear in North American climates with extreme heat.',
    solution: 'Replace the A/C compressor, receiver/drier, and expansion valve as a complete system. Flush the condenser and lines to remove debris from the failed compressor. Evacuate and recharge with R-134a to the correct spec (24 oz). Check that the cooling fan operates at full speed during A/C operation.',
    symptoms: ['A/C blows warm intermittently', 'A/C clutch cycling rapidly', 'Squealing noise from compressor', 'Oily residue around A/C fittings'],
    affectedSystems: ['A/C system'],
    dtcCodes: [],
    estimatedCostLow: 800, estimatedCostHigh: 1400
  },

  // Cavalier (1995-2005)
  {
    id: 'chevy-cavalier-intake-gasket-leak-1995',
    make: 'Chevrolet', model: 'Cavalier', years: yrs(1995, 2005),
    category: 'engine', severity: 'medium',
    title: 'Lower Intake Manifold Gasket Coolant Leak',
    description: 'The 2.2L and 2.4L engines in the Cavalier are prone to intake manifold gasket failure, allowing coolant to leak externally or internally mix with oil. The composite gaskets deteriorate over time due to heat cycling. Dex-Cool coolant interaction with these gaskets accelerates deterioration.',
    solution: 'Replace the lower intake manifold gasket with an updated Fel-Pro design. Flush the cooling system and switch to conventional green coolant if desired. Check the oil for milky contamination — if present, perform multiple oil changes to flush the system. Torque intake bolts to specification in the correct sequence.',
    symptoms: ['Coolant loss with no visible external leak', 'Sweet smell from engine bay', 'Milky oil on dipstick', 'Overheating at idle'],
    affectedSystems: ['Intake manifold', 'Cooling system'],
    dtcCodes: ['P0128'],
    estimatedCostLow: 300, estimatedCostHigh: 600
  },
  {
    id: 'chevy-cavalier-pass-lock-2000',
    make: 'Chevrolet', model: 'Cavalier', years: yrs(2000, 2005),
    category: 'electrical', severity: 'medium',
    title: 'Passlock Anti-Theft System Prevents Starting',
    description: 'The Passlock security system frequently malfunctions, reading the wrong resistance from the ignition cylinder sensor and refusing to allow the engine to start. The security light flashes and the car cranks but will not fire. This commonly occurs in cold weather or after the ignition cylinder wears internally.',
    solution: 'The temporary fix is to turn the key to ON (not start), wait 10 minutes for the security light to stop flashing, then turn off and restart. The permanent fix is to bypass the Passlock sensor by wiring a 2.2K ohm resistor in place of the hall-effect sensor in the ignition cylinder. Some owners replace the entire ignition lock cylinder assembly.',
    symptoms: ['Engine cranks but will not start', 'Security light flashing on dash', 'Intermittent no-start condition', 'Problem worse in cold weather'],
    affectedSystems: ['Anti-theft system', 'Ignition'],
    dtcCodes: ['B2960'],
    estimatedCostLow: 50, estimatedCostHigh: 350
  },

  // Astro (1990-2005)
  {
    id: 'chevy-astro-intake-gasket-1996',
    make: 'Chevrolet', model: 'Astro', years: yrs(1996, 2005),
    category: 'engine', severity: 'high',
    title: 'Vortec 4.3L Intake Manifold Gasket Failure',
    description: 'The 4.3L Vortec V6 suffers from notorious intake manifold gasket failure, which can cause coolant to leak into the engine oil or externally down the back of the engine. The plastic/composite gaskets warp and crack under thermal stress. This is one of the most common and serious issues with the Vortec engine family.',
    solution: 'Replace both intake manifold gaskets with updated Fel-Pro gaskets that use a metal core design. Clean all mating surfaces thoroughly. Replace the thermostat and coolant while the intake is off. Check oil for contamination and change oil immediately after repair. Monitor for leaks during the first 500 miles.',
    symptoms: ['Coolant loss without visible leak', 'White exhaust smoke', 'Milky oil on dipstick or oil cap', 'Overheating', 'Rough idle'],
    affectedSystems: ['Intake manifold', 'Cooling system', 'Lubrication system'],
    dtcCodes: ['P0300', 'P0128'],
    estimatedCostLow: 400, estimatedCostHigh: 800
  },
  {
    id: 'chevy-astro-awd-transfer-case-1990',
    make: 'Chevrolet', model: 'Astro', years: yrs(1990, 2005),
    category: 'drivetrain', severity: 'medium',
    title: 'AWD Transfer Case Encoder Motor and Chain Failure',
    description: 'AWD-equipped Astros suffer from transfer case issues including encoder motor failure and stretched drive chains. The encoder motor controls the AWD engagement and when it fails, the system may default to 2WD or make grinding noises. Chain stretch causes a noticeable clunk on acceleration from a stop.',
    solution: 'Replace the encoder motor if the AWD is not engaging properly. For chain noise, the transfer case must be opened and the chain replaced. Change transfer case fluid every 30,000 miles with AutoTrak II fluid. Do not use conventional ATF — the Astro AWD system requires the specific NP-233 fluid.',
    symptoms: ['AWD not engaging', 'Grinding noise from under vehicle', 'Clunk on acceleration from stop', 'Service 4WD light on'],
    affectedSystems: ['Transfer case', 'AWD system'],
    dtcCodes: [],
    estimatedCostLow: 300, estimatedCostHigh: 1200
  },

  // Monte Carlo (1995-2007)
  {
    id: 'chevy-monte-carlo-window-regulator-2000',
    make: 'Chevrolet', model: 'Monte Carlo', years: yrs(2000, 2007),
    category: 'electrical', severity: 'low',
    title: 'Power Window Regulator Cable Failure',
    description: 'The cable-driven power window regulators are a common failure point, with the cable fraying or snapping and causing the window to drop into the door. This affects both front and rear windows. The motor may still run but the window will not move or will fall down on its own.',
    solution: 'Replace the window regulator assembly. Aftermarket units are widely available and affordable. When reinstalling, lubricate the window tracks with dry silicone spray. The door panel uses plastic clips that break easily — have replacements on hand.',
    symptoms: ['Window drops into door', 'Window moves slowly or unevenly', 'Grinding noise when operating window', 'Window falls down after closing'],
    affectedSystems: ['Power windows'],
    dtcCodes: [],
    estimatedCostLow: 100, estimatedCostHigh: 250
  },
  {
    id: 'chevy-monte-carlo-abs-module-2000',
    make: 'Chevrolet', model: 'Monte Carlo', years: yrs(2000, 2007),
    category: 'brakes', severity: 'high',
    title: 'ABS/EBCM Module Failure and Brake Lamp Warning',
    description: 'The Electronic Brake Control Module (EBCM) mounted on the ABS hydraulic unit is prone to failure due to internal solder joint cracking from vibration and thermal cycling. When it fails, ABS, traction control, and stability control all stop functioning. The brake warning light, ABS light, and traction control light all illuminate.',
    solution: 'The EBCM can be sent to a rebuilder for solder repair and reprogramming, which is more affordable than dealer replacement. Alternatively, replace the ABS modulator assembly. After replacement, the module must be programmed to the vehicle VIN. Bleeding the ABS system requires a scan tool to cycle the pump and valves.',
    symptoms: ['ABS light on', 'Traction control light on', 'Service stability system message', 'Loss of ABS function', 'Brake pedal pulsation during normal braking'],
    affectedSystems: ['ABS', 'Traction control', 'Stability control'],
    dtcCodes: ['C0265', 'C0267', 'C0269'],
    estimatedCostLow: 300, estimatedCostHigh: 900
  },

  // Venture (1997-2005)
  {
    id: 'chevy-venture-intake-gasket-1997',
    make: 'Chevrolet', model: 'Venture', years: yrs(1997, 2005),
    category: 'engine', severity: 'high',
    title: '3.4L V6 Lower Intake Manifold Gasket Leak',
    description: 'The GM 3.4L V6 is infamous for lower intake manifold gasket failure. The original composite gaskets fail and allow Dex-Cool coolant to mix with engine oil, which can cause catastrophic engine damage if not caught early. This issue is essentially universal on this engine with high enough mileage.',
    solution: 'Replace the lower intake manifold gaskets with updated Fel-Pro gaskets. Flush the cooling system completely. If oil contamination occurred, change oil and filter immediately and repeat after 500 miles. Inspect the oil pan for sludge buildup. Consider switching to conventional green coolant.',
    symptoms: ['Oil looks milky or like chocolate milk', 'Coolant loss with no external leak', 'Overheating', 'White exhaust smoke', 'Low oil pressure warning'],
    affectedSystems: ['Intake manifold', 'Cooling system', 'Lubrication system'],
    dtcCodes: ['P0128', 'P0300'],
    estimatedCostLow: 500, estimatedCostHigh: 900
  },
  {
    id: 'chevy-venture-power-sliding-door-1997',
    make: 'Chevrolet', model: 'Venture', years: yrs(1997, 2005),
    category: 'electrical', severity: 'low',
    title: 'Power Sliding Door Mechanism Failure',
    description: 'The power sliding door system is unreliable, with the cable mechanism, latch, and motor all being common failure points. The door may open partially and stop, refuse to latch closed, or make grinding noises during operation. Cables can fray and jam the mechanism, requiring manual override.',
    solution: 'Diagnose which component failed — the cable assembly is the most common. Replace the sliding door cable assembly and lubricate the track and rollers. If the motor is weak, replace it. The manual release handle allows the door to operate manually until repair. Inspect the lower track for debris and corrosion.',
    symptoms: ['Sliding door stops mid-travel', 'Grinding noise during operation', 'Door will not latch closed', 'Door opens on its own', 'Sliding door warning chime stays on'],
    affectedSystems: ['Power sliding door'],
    dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 600
  },

  // Corsica (1990-1996)
  {
    id: 'chevy-corsica-head-gasket-1990',
    make: 'Chevrolet', model: 'Corsica', years: yrs(1990, 1996),
    category: 'engine', severity: 'high',
    title: '2.2L OHV Head Gasket Failure',
    description: 'The 2.2L OHV four-cylinder engine is prone to head gasket failure, particularly on higher-mileage examples. Overheating from cooling system neglect or a failing water pump accelerates gasket failure. Once the gasket fails, coolant enters the combustion chamber causing white smoke and potential hydro-lock.',
    solution: 'Replace the head gasket and have the cylinder head checked for warpage — machine the head if out of specification (max 0.003" deviation). Replace the thermostat and inspect the water pump while accessible. Use a quality multi-layer steel gasket and torque head bolts in sequence. Perform a cooling system pressure test after repair.',
    symptoms: ['White exhaust smoke', 'Overheating', 'Coolant in oil', 'Air bubbles in coolant overflow', 'Rough running engine'],
    affectedSystems: ['Engine', 'Cooling system'],
    dtcCodes: ['P0300', 'P0301'],
    estimatedCostLow: 500, estimatedCostHigh: 1000
  },
  {
    id: 'chevy-corsica-ignition-module-1990',
    make: 'Chevrolet', model: 'Corsica', years: yrs(1990, 1996),
    category: 'electrical', severity: 'medium',
    title: 'Ignition Control Module Failure Causing Stalling',
    description: 'The ignition control module (ICM) mounted on the ignition coil pack runs hot and fails, causing sudden stalling or no-start conditions. The module is a heat-sensitive component and GM did not provide adequate heatsinking on these models. Failure is often intermittent at first, occurring when the engine is hot.',
    solution: 'Replace the ignition control module. Apply a thin layer of heat sink compound (dielectric thermal grease) between the ICM and mounting surface for better heat dissipation. Replace the ignition coil pack at the same time if it has high mileage. Carry a spare ICM — this is a known stranding failure.',
    symptoms: ['Engine stalls when hot then restarts after cooling', 'Intermittent no-start', 'Engine cuts out under load', 'No spark condition'],
    affectedSystems: ['Ignition system'],
    dtcCodes: [],
    estimatedCostLow: 80, estimatedCostHigh: 200
  },

  // Spark (2013-2022)
  {
    id: 'chevy-spark-cvt-shudder-2016',
    make: 'Chevrolet', model: 'Spark', years: yrs(2016, 2022),
    category: 'transmission', severity: 'medium',
    title: 'CVT Transmission Shudder and Jerking During Acceleration',
    description: 'The CVT automatic transmission in the second-generation Spark develops a shudder or jerking sensation during light to moderate acceleration, particularly between 20-40 mph. The issue is caused by CVT belt slip and deteriorating transmission fluid. Some vehicles have been traded in early due to the severity of the vibration.',
    solution: 'Perform a CVT fluid drain and fill with the correct GM CVT fluid (do not use conventional ATF). If the shudder persists after a fluid change, the CVT may need internal valve body work or replacement. GM extended some warranties on CVT transmissions — check with your dealer for coverage eligibility.',
    symptoms: ['Shuddering during acceleration', 'Jerky acceleration at low speeds', 'Vibration between 20-40 mph', 'RPM fluctuation during steady cruise'],
    affectedSystems: ['CVT transmission'],
    dtcCodes: ['P0700', 'P0868'],
    estimatedCostLow: 150, estimatedCostHigh: 3500
  },
  {
    id: 'chevy-spark-ac-weak-2013',
    make: 'Chevrolet', model: 'Spark', years: yrs(2013, 2022),
    category: 'other', severity: 'low',
    title: 'Weak A/C Performance in Hot Weather',
    description: 'The Spark is notorious for inadequate A/C cooling in hot climates. The small 1.4L engine barely keeps up with accessory loads, and the undersized condenser and compressor struggle to cool the cabin above 90F ambient temperatures. This is partly a design limitation of the subcompact platform.',
    solution: 'Verify refrigerant charge is at the correct level (do not overcharge). Replace the cabin air filter. Ensure the condenser is clean and free of debris. Aftermarket solutions include adding a condenser fan or upgrading to a slightly larger condenser. Using recirculate mode instead of fresh air helps significantly.',
    symptoms: ['A/C blows lukewarm in hot weather', 'A/C struggles at idle', 'A/C works better at highway speed', 'Cabin takes very long to cool down'],
    affectedSystems: ['A/C system'],
    dtcCodes: [],
    estimatedCostLow: 50, estimatedCostHigh: 500
  },

  // Blazer (2019-2025)
  {
    id: 'chevy-blazer-transmission-shudder-2019',
    make: 'Chevrolet', model: 'Blazer', years: yrs(2019, 2025),
    category: 'transmission', severity: 'medium',
    title: '9-Speed Automatic Transmission Shudder and Harsh Shifts',
    description: 'The 9-speed automatic transmission (9T50/9T65) produces a noticeable shudder during light acceleration and torque converter lockup, typically between 30-50 mph. Harsh or delayed shifts, especially 1-2 and 2-3, are also common complaints. GM has issued multiple TSBs addressing transmission calibration.',
    solution: 'Start with a transmission fluid flush using the updated Mobil 1 Synthetic LV ATF HP fluid and a TCM reprogramming to the latest calibration. If shudder persists, the torque converter may need replacement. GM has a customer satisfaction program for some VINs — check with your dealer for eligibility.',
    symptoms: ['Shudder during light acceleration at 30-50 mph', 'Harsh 1-2 shift', 'Delayed downshift', 'Transmission hesitation from stop'],
    affectedSystems: ['9-speed automatic transmission', 'Torque converter'],
    dtcCodes: ['P0711', 'P0716'],
    estimatedCostLow: 200, estimatedCostHigh: 2500
  },
  {
    id: 'chevy-blazer-start-stop-battery-2019',
    make: 'Chevrolet', model: 'Blazer', years: yrs(2019, 2025),
    category: 'electrical', severity: 'low',
    title: 'Auto Start-Stop Battery Degradation and System Faults',
    description: 'The AGM battery required for the auto start-stop system degrades prematurely, often failing within 2-3 years. When the battery weakens, the start-stop system disables itself and various electrical warnings appear. The auxiliary battery (on equipped models) can also fail, compounding the issues.',
    solution: 'Replace the AGM battery with a genuine ACDelco AGM battery — standard flooded batteries are not compatible with the start-stop system. After replacement, a battery sensor reset via a scan tool is required. Some owners permanently disable start-stop with aftermarket modules if they find the feature annoying.',
    symptoms: ['Start-stop system not functioning', 'Battery warning messages', 'Multiple warning lights on startup', 'Slow cranking', 'Electrical accessories resetting'],
    affectedSystems: ['Starting system', 'Start-stop system', 'Electrical'],
    dtcCodes: ['P0562', 'U0100'],
    estimatedCostLow: 200, estimatedCostHigh: 400
  },

  // Trax (2015-2025)
  {
    id: 'chevy-trax-turbo-oil-consumption-2015',
    make: 'Chevrolet', model: 'Trax', years: yrs(2015, 2022),
    category: 'engine', severity: 'medium',
    title: '1.4L Turbo Excessive Oil Consumption',
    description: 'The 1.4L turbocharged engine burns oil at an excessive rate, often consuming a quart every 1,000-2,000 miles. The issue is attributed to piston ring design and PCV system routing. GM considers up to 1 quart per 2,000 miles "normal" but many owners find this unacceptable.',
    solution: 'Monitor oil level between changes and top off as needed. Replace the PCV valve and inspect the intake manifold for oil buildup. For severe consumption, an engine teardown to replace piston rings and valve stem seals may be necessary. Use full synthetic 5W-30 oil as specified.',
    symptoms: ['Low oil level between changes', 'Blue smoke on startup', 'Oil smell from exhaust', 'Low oil pressure warning'],
    affectedSystems: ['Engine', 'PCV system'],
    dtcCodes: ['P06DE'],
    estimatedCostLow: 50, estimatedCostHigh: 2500
  },
  {
    id: 'chevy-trax-shift-quality-2015',
    make: 'Chevrolet', model: 'Trax', years: yrs(2015, 2022),
    category: 'transmission', severity: 'medium',
    title: '6-Speed Automatic Rough Shifting and Delayed Engagement',
    description: 'The 6T40 automatic transmission exhibits rough or harsh shifts, delayed engagement from Park or Reverse, and occasional lurching. The valve body is the primary culprit, with wear on the pressure regulator bore causing erratic shift quality. Cold weather operation tends to make the issue more pronounced.',
    solution: 'A transmission fluid and filter change using Dexron HP fluid is the first step. If symptoms persist, a valve body replacement or rebuild addresses the root cause. Have the TCM reflashed to the latest GM calibration. In severe cases, a remanufactured transmission may be the most cost-effective solution.',
    symptoms: ['Harsh shifts', 'Delayed engagement from Park', 'Lurching at low speed', 'Clunk when shifting from Reverse to Drive'],
    affectedSystems: ['6-speed automatic transmission'],
    dtcCodes: ['P0751', 'P0700'],
    estimatedCostLow: 200, estimatedCostHigh: 2800
  },

  // Uplander (2005-2009)
  {
    id: 'chevy-uplander-power-steering-lines-2005',
    make: 'Chevrolet', model: 'Uplander', years: yrs(2005, 2009),
    category: 'steering', severity: 'medium',
    title: 'Power Steering Pressure Line Leak',
    description: 'The high-pressure power steering line develops leaks at the crimped fittings and rubber sections, causing power steering fluid loss and groaning from the pump. The lines run near exhaust components, and leaking fluid on hot exhaust creates smoke and a burning smell. This can progress to sudden power steering loss.',
    solution: 'Replace the high-pressure power steering line assembly. Flush the system with fresh power steering fluid after replacement. Inspect the power steering pump for damage from running low on fluid — a whining pump indicates internal damage. Fill and bleed the system by turning the wheel lock-to-lock several times.',
    symptoms: ['Power steering whining or groaning', 'Fluid leak on ground', 'Burning smell from engine bay', 'Heavy steering effort', 'Low fluid in reservoir'],
    affectedSystems: ['Power steering'],
    dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 450
  },
  {
    id: 'chevy-uplander-rear-ac-lines-2005',
    make: 'Chevrolet', model: 'Uplander', years: yrs(2005, 2009),
    category: 'other', severity: 'low',
    title: 'Rear A/C Refrigerant Line Corrosion and Leak',
    description: 'The rear A/C refrigerant lines that run under the vehicle to the rear evaporator corrode and develop leaks, especially in salt-belt states. Once the lines leak, the entire system loses charge and both front and rear A/C stop working. The lines are aluminum and are particularly susceptible to road salt.',
    solution: 'Replace the corroded rear A/C lines. Aftermarket stainless steel replacement lines are available and resist future corrosion. Evacuate and recharge the entire A/C system after repair. Apply undercoating to the new lines for corrosion protection. Some owners delete the rear A/C system entirely and cap the lines.',
    symptoms: ['Rear A/C blows warm', 'Front and rear A/C both stop working', 'Visible corrosion on underbody lines', 'A/C low charge warning'],
    affectedSystems: ['A/C system', 'Rear HVAC'],
    dtcCodes: [],
    estimatedCostLow: 400, estimatedCostHigh: 900
  },

  // Trailblazer (2002-2009)
  {
    id: 'chevy-trailblazer-fan-clutch-2002',
    make: 'Chevrolet', model: 'Trailblazer', years: yrs(2002, 2009),
    category: 'cooling', severity: 'medium',
    title: 'Electric Fan Clutch Failure Causing Overheating',
    description: 'The Trailblazer uses an electronically controlled viscous fan clutch that is expensive and failure-prone. When the clutch fails, the fan either stops spinning (causing overheating) or locks on permanently (causing excess noise and reduced fuel economy). The electrical connector on the clutch corrodes from heat and moisture.',
    solution: 'Replace the fan clutch assembly. Use OEM or quality aftermarket units — cheap replacements have high failure rates. Clean and apply dielectric grease to the electrical connector. Check the fan clutch relay and fuse before condemning the clutch itself. The 42mm wrench needed for removal is reverse-threaded.',
    symptoms: ['Overheating in traffic or at idle', 'Loud roaring fan noise at all times', 'A/C not cooling at idle', 'Reduced fuel economy', 'Fan clutch warning message'],
    affectedSystems: ['Cooling system', 'Fan clutch'],
    dtcCodes: ['P0480', 'P0481'],
    estimatedCostLow: 300, estimatedCostHigh: 600
  },
  {
    id: 'chevy-trailblazer-4wd-actuator-2002',
    make: 'Chevrolet', model: 'Trailblazer', years: yrs(2002, 2009),
    category: 'drivetrain', severity: 'medium',
    title: 'Front Axle Disconnect Actuator Failure',
    description: 'The thermal front axle disconnect actuator fails, preventing the front differential from engaging when 4WD is selected. The actuator uses a heat-activated element that cracks and leaks fluid internally. When it fails, the transfer case shifts but the front axle does not engage, leaving you effectively in 2WD.',
    solution: 'Replace the thermal actuator with an upgraded unit. Some owners install a cable-operated manual actuator for more reliable engagement. Check the front differential fluid level — low fluid can also prevent smooth engagement. The actuator is located on the front axle housing and is accessible from underneath.',
    symptoms: ['4WD not engaging', 'Service 4WD message', 'Grinding when shifting to 4WD', 'Front axle not locking in'],
    affectedSystems: ['4WD system', 'Front differential'],
    dtcCodes: [],
    estimatedCostLow: 150, estimatedCostHigh: 400
  },

  // Metro (1990-2001)
  {
    id: 'chevy-metro-head-gasket-1990',
    make: 'Chevrolet', model: 'Metro', years: yrs(1990, 2001),
    category: 'engine', severity: 'medium',
    title: '1.0L/1.3L Engine Head Gasket Failure',
    description: 'The small Suzuki-sourced 3-cylinder and 4-cylinder engines develop head gasket failures, particularly when the cooling system is neglected. The aluminum cylinder head warps from overheating episodes, and once warped, even a new gasket will fail again without head resurfacing. The 1.0L 3-cylinder is especially vulnerable.',
    solution: 'Replace the head gasket and have the cylinder head inspected for warpage and resurfaced if needed. Replace the thermostat and water pump at the same time. Use the correct torque specifications and tightening sequence. The small engine makes this a relatively quick job compared to larger vehicles.',
    symptoms: ['White exhaust smoke', 'Overheating', 'Coolant loss', 'Bubbles in coolant reservoir', 'Rough idle'],
    affectedSystems: ['Engine', 'Cooling system'],
    dtcCodes: [],
    estimatedCostLow: 300, estimatedCostHigh: 600
  },
  {
    id: 'chevy-metro-rust-subframe-1990',
    make: 'Chevrolet', model: 'Metro', years: yrs(1990, 2001),
    category: 'body', severity: 'high',
    title: 'Severe Subframe and Rocker Panel Rust-Through',
    description: 'The Metro is extremely rust-prone due to thin body panels and inadequate corrosion protection. The front subframe, rocker panels, and rear quarter panels rot through, sometimes to the point of structural failure. In salt-belt states, Metros can become structurally unsafe within 10-15 years.',
    solution: 'Inspect the subframe mounting points and rocker panels carefully before investing in any other repairs. If the subframe mounts are compromised, the vehicle is unsafe. Minor rust can be cut out and patched with welded-in repair panels. Apply rust converter and undercoating to slow progression. Many Metros are scrapped due to rust rather than mechanical failure.',
    symptoms: ['Visible rust holes in body panels', 'Soft or spongy floor pan', 'Clunking from front end over bumps', 'Subframe visibly corroded', 'Failed safety inspection'],
    affectedSystems: ['Body structure', 'Subframe'],
    dtcCodes: [],
    estimatedCostLow: 500, estimatedCostHigh: 2000
  },

  // Beretta (1990-1996)
  {
    id: 'chevy-beretta-dist-gear-1990',
    make: 'Chevrolet', model: 'Beretta', years: yrs(1990, 1996),
    category: 'engine', severity: 'medium',
    title: '3.1L V6 Distributor Gear Wear Causing Timing Issues',
    description: 'The 3.1L V6 engine uses a nylon distributor drive gear that wears prematurely, causing ignition timing to become erratic. As the gear teeth wear, timing retards inconsistently, leading to poor performance, misfires, and increased fuel consumption. The gear material is simply not durable enough for sustained use.',
    solution: 'Replace the distributor assembly with one that has an updated drive gear. Check the camshaft gear for wear as well — if the cam gear teeth are damaged, the camshaft must be replaced. Set base timing to 10 degrees BTDC after installation. Consider upgrading to an aftermarket brass gear if available.',
    symptoms: ['Rough idle', 'Poor acceleration', 'Misfires under load', 'Increased fuel consumption', 'Engine timing varies at idle'],
    affectedSystems: ['Ignition system', 'Distributor'],
    dtcCodes: ['P0300', 'P0301'],
    estimatedCostLow: 150, estimatedCostHigh: 350
  },
  {
    id: 'chevy-beretta-brake-proportioning-1990',
    make: 'Chevrolet', model: 'Beretta', years: yrs(1990, 1996),
    category: 'brakes', severity: 'medium',
    title: 'Rear Brake Proportioning Valve Malfunction',
    description: 'The height-sensing rear brake proportioning valve, mounted on the rear axle area, corrodes and sticks, causing improper brake balance. When the valve sticks, the rear brakes may lock up prematurely during normal braking, or provide insufficient rear brake force, both creating dangerous handling characteristics.',
    solution: 'Replace the proportioning valve assembly. The valve is connected to the rear suspension by a link that measures ride height. Ensure the link is properly adjusted after installation. Bleed the entire brake system starting from the wheel furthest from the master cylinder. Check rear brake hardware for glazing from lockup.',
    symptoms: ['Rear wheels locking during normal braking', 'Vehicle nose-dives excessively', 'Uneven brake wear front to rear', 'Poor braking performance'],
    affectedSystems: ['Braking system', 'Proportioning valve'],
    dtcCodes: [],
    estimatedCostLow: 100, estimatedCostHigh: 300
  },

  // Lumina (1990-2001)
  {
    id: 'chevy-lumina-intake-gasket-1995',
    make: 'Chevrolet', model: 'Lumina', years: yrs(1995, 2001),
    category: 'engine', severity: 'high',
    title: '3.1L/3.4L Lower Intake Manifold Gasket Failure',
    description: 'Like most GM 60-degree V6 engines of this era, the 3.1L and 3.4L in the Lumina suffer from intake manifold gasket failure. Dex-Cool coolant degrades the composite gaskets, allowing coolant into the oil. If not caught early, this destroys bearings and can cause complete engine failure.',
    solution: 'Replace the lower intake manifold gaskets with updated Fel-Pro MS98000T metal carrier gaskets. Flush the cooling system and consider switching to conventional coolant. Change the oil immediately after repair and again at 500 miles if contamination was present. Inspect the engine bearings for damage if the car was driven with milky oil.',
    symptoms: ['Milky brown oil on dipstick', 'Coolant level dropping', 'Overheating at idle', 'White smoke from exhaust', 'Rough idle'],
    affectedSystems: ['Intake manifold', 'Cooling system'],
    dtcCodes: ['P0128', 'P0300'],
    estimatedCostLow: 400, estimatedCostHigh: 800
  },
  {
    id: 'chevy-lumina-crankshaft-sensor-1995',
    make: 'Chevrolet', model: 'Lumina', years: yrs(1995, 2001),
    category: 'electrical', severity: 'medium',
    title: 'Crankshaft Position Sensor Failure Causing Stalling',
    description: 'The crankshaft position sensor fails due to heat exposure, causing intermittent stalling and no-start conditions. The sensor is located behind the harmonic balancer and is exposed to engine heat and oil contamination. Failure is often intermittent, making diagnosis difficult until complete failure occurs.',
    solution: 'Replace the crankshaft position sensor. The harmonic balancer must be removed for access. Inspect the balancer for rubber separation while it is removed. Use a quality OEM-equivalent sensor. Apply anti-seize to the sensor bolt threads. Clear any stored DTCs after installation.',
    symptoms: ['Intermittent stalling', 'No-start condition', 'Engine dies and restarts after cooling', 'Check engine light with crank sensor code'],
    affectedSystems: ['Ignition system', 'Engine management'],
    dtcCodes: ['P0335', 'P0336'],
    estimatedCostLow: 80, estimatedCostHigh: 250
  },

  // Tracker (1990-2004)
  {
    id: 'chevy-tracker-timing-chain-1999',
    make: 'Chevrolet', model: 'Tracker', years: yrs(1999, 2004),
    category: 'engine', severity: 'high',
    title: '2.5L V6 Timing Chain Tensioner Failure',
    description: 'The 2.5L Suzuki V6 engine has a hydraulic timing chain tensioner that leaks down overnight, causing a loud rattling noise on cold startup. If the tensioner fails completely, the timing chain can jump and cause valve-to-piston contact, bending valves and potentially destroying the engine.',
    solution: 'Replace the timing chain, guides, and tensioner as a complete kit. This is a major repair requiring significant engine disassembly. The front timing cover must be removed. Inspect the chain for stretch — more than 1/2" deflection indicates replacement. Use genuine or quality aftermarket parts.',
    symptoms: ['Rattling noise on cold startup', 'Rattle that goes away after engine warms', 'Check engine light', 'Loss of power', 'Engine misfires'],
    affectedSystems: ['Timing system'],
    dtcCodes: ['P0300', 'P0016'],
    estimatedCostLow: 800, estimatedCostHigh: 1500
  },
  {
    id: 'chevy-tracker-rust-frame-1990',
    make: 'Chevrolet', model: 'Tracker', years: yrs(1990, 2004),
    category: 'body', severity: 'high',
    title: 'Frame and Body Rust-Through',
    description: 'The body-on-frame Tracker has significant rust issues, particularly on the frame rails, body mounts, and rear wheel arches. In northern climates, the frame can rust through to the point of being unsafe for road use. The small dimensions and thin metal make the Tracker especially vulnerable to corrosion.',
    solution: 'Have the frame inspected by a professional, especially at the body mount locations and near the rear suspension. Localized frame rust can be cut out and plated with welded-in reinforcement. Apply rust converter and frame coating to slow progression. If frame rails are perforated in structural areas, the vehicle should be retired from road use.',
    symptoms: ['Visible rust on frame rails', 'Body mount looseness', 'Rust holes in fenders and quarter panels', 'Failed safety inspection'],
    affectedSystems: ['Frame', 'Body'],
    dtcCodes: [],
    estimatedCostLow: 500, estimatedCostHigh: 2500
  },

  // TrailBlazer (2021-2025 — new)
  {
    id: 'chevy-trailblazer-turbo-lag-2021',
    make: 'Chevrolet', model: 'TrailBlazer', years: yrs(2021, 2025),
    category: 'engine', severity: 'low',
    title: '1.2L/1.3L Turbo Hesitation and Turbo Lag',
    description: 'The small-displacement turbocharged 3-cylinder engines exhibit significant turbo lag and hesitation during initial acceleration from a stop, particularly when the A/C compressor is engaged. The ECM calibration is aggressive on fuel economy, which delays throttle response. The CVT exacerbates the sluggish feel.',
    solution: 'Have the dealer update the ECM calibration to the latest version — GM has released multiple updates to improve throttle response. Ensure the air filter is clean. Some owners report that switching to Sport mode (if equipped) provides noticeably better response. This is partly a design characteristic of the small turbocharged engine.',
    symptoms: ['Hesitation from a stop', 'Slow throttle response', 'Worse performance with A/C on', 'Turbo lag at low RPM'],
    affectedSystems: ['Engine', 'Turbocharger'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 150
  },
  {
    id: 'chevy-trailblazer-infotainment-freeze-2021',
    make: 'Chevrolet', model: 'TrailBlazer', years: yrs(2021, 2025),
    category: 'electrical', severity: 'low',
    title: 'Infotainment System Freezing and Rebooting',
    description: 'The Chevrolet Infotainment 3 system freezes, goes to a black screen, or reboots spontaneously. Bluetooth connectivity drops and Apple CarPlay/Android Auto connections are lost. The system may become unresponsive to touch input, requiring a manual reboot. Software stability issues have been addressed through multiple OTA updates.',
    solution: 'Check for and install any available OTA software updates through the Settings menu. Perform a hard reset by holding the power/volume knob for 10+ seconds. If issues persist, the dealer can reflash the infotainment module to the latest software. Clear paired Bluetooth devices and re-pair. In rare cases, the infotainment module hardware must be replaced.',
    symptoms: ['Screen freezes or goes black', 'System reboots while driving', 'Bluetooth disconnects repeatedly', 'CarPlay/Android Auto not connecting', 'Touchscreen unresponsive'],
    affectedSystems: ['Infotainment system'],
    dtcCodes: ['U0184'],
    estimatedCostLow: 0, estimatedCostHigh: 800
  },

  // S-10 (1990-2004)
  {
    id: 'chevy-s10-fuel-pump-1997',
    make: 'Chevrolet', model: 'S-10', years: yrs(1997, 2004),
    category: 'fuel', severity: 'medium',
    title: 'In-Tank Fuel Pump Failure',
    description: 'The in-tank electric fuel pump is a frequent failure point, especially on higher-mileage trucks. The pump motor wears out and cannot maintain adequate fuel pressure. Running the tank below a quarter frequently accelerates pump failure because the fuel acts as a coolant for the pump motor.',
    solution: 'Replace the fuel pump module assembly by dropping the fuel tank. Use an OEM-equivalent pump — cheap aftermarket pumps often fail within a year. Replace the fuel filter at the same time. Prime the new pump by cycling the key ON for 2 seconds three times before starting. Check fuel pressure after installation (should be 60-66 PSI).',
    symptoms: ['Long cranking before start', 'Stalling at low fuel levels', 'Loss of power under acceleration', 'Whining noise from fuel tank area', 'No start condition'],
    affectedSystems: ['Fuel delivery system'],
    dtcCodes: ['P0230', 'P0087'],
    estimatedCostLow: 350, estimatedCostHigh: 650
  },
  {
    id: 'chevy-s10-spider-injector-1996',
    make: 'Chevrolet', model: 'S-10', years: yrs(1996, 2004),
    category: 'fuel', severity: 'medium',
    title: '4.3L Vortec Central Sequential Fuel Injection (CSFI) Failure',
    description: 'The "spider" fuel injection system in the 4.3L Vortec V6 uses a central injector assembly with poppet nozzles connected by fuel lines. The poppet nozzles stick and leak, causing rough running, hard starting, and fuel smell. The original design was replaced by an updated MPFI system that uses actual injectors at each port.',
    solution: 'Replace the entire spider injector assembly with the updated MPFI conversion kit (AC Delco 217-3029). The updated kit replaces the poppet nozzles with proper fuel injectors and is a direct fit. Remove the upper intake manifold for access. Replace the fuel pressure regulator at the same time.',
    symptoms: ['Rough idle', 'Hard starting especially when cold', 'Fuel smell in engine bay', 'Poor fuel economy', 'Engine misfires under load'],
    affectedSystems: ['Fuel injection system'],
    dtcCodes: ['P0171', 'P0174', 'P0300'],
    estimatedCostLow: 300, estimatedCostHigh: 600
  },

  // Blazer S-10 (1990-1994)
  {
    id: 'chevy-blazer-s10-cpi-leak-1992',
    make: 'Chevrolet', model: 'Blazer S-10', years: yrs(1992, 1994),
    category: 'fuel', severity: 'medium',
    title: 'Central Port Injection Fuel Leak Under Intake',
    description: 'The early central port injection (CPI) system uses pressurized fuel lines under the upper intake manifold that develop cracks and leaks over time. Fuel leaks directly onto the hot engine, creating a serious fire hazard. The plastic fuel lines become brittle with age and heat exposure.',
    solution: 'Replace the CPI unit and all associated fuel lines under the upper intake. Updated kits with more durable fuel lines are available. Inspect the fuel pressure regulator diaphragm for leaks. Clean the intake manifold thoroughly before reassembly. Test for leaks with a fuel pressure gauge before closing up.',
    symptoms: ['Fuel smell from engine bay', 'Hard starting', 'Visible fuel leak under intake manifold', 'Rough idle', 'Poor fuel economy'],
    affectedSystems: ['Fuel injection system'],
    dtcCodes: ['P0171', 'P0174'],
    estimatedCostLow: 250, estimatedCostHigh: 500
  },
  {
    id: 'chevy-blazer-s10-transfer-case-1990',
    make: 'Chevrolet', model: 'Blazer S-10', years: yrs(1990, 1994),
    category: 'drivetrain', severity: 'medium',
    title: 'Transfer Case Vacuum Actuator Failure',
    description: 'The 4WD engagement system uses a vacuum-operated front axle actuator controlled by a thermal actuator on the transfer case. The vacuum lines crack and the thermal actuator diaphragm tears, preventing the front axle from engaging when 4WD is selected. This leaves you in 2WD when you need 4WD most.',
    solution: 'Inspect all vacuum lines from the transfer case to the front axle actuator and replace any cracked or brittle lines. Replace the thermal actuator if it is not holding vacuum. Some owners upgrade to a cable-operated actuator for more reliable engagement. Test the system by engaging 4WD on a loose surface.',
    symptoms: ['4WD will not engage', 'Front axle not locking', 'Clicking from transfer case when shifting', 'Service 4WD light on'],
    affectedSystems: ['4WD system', 'Transfer case'],
    dtcCodes: [],
    estimatedCostLow: 100, estimatedCostHigh: 350
  },

  // Silverado 3500HD (2001-2025)
  {
    id: 'chevy-silverado-3500hd-allison-tcm-2006',
    make: 'Chevrolet', model: 'Silverado 3500HD', years: yrs(2006, 2019),
    category: 'transmission', severity: 'high',
    title: 'Allison 1000 Transmission TCM Internal Failure',
    description: 'The Transmission Control Module (TCM) mounted internally on the Allison 1000 transmission fails due to heat exposure and vibration. The internal TCM is bathed in transmission fluid and subjected to extreme temperatures. When it fails, the transmission goes into limp mode or refuses to shift from 3rd gear.',
    solution: 'Replace the internal TCM (ITCM) inside the Allison transmission. This requires dropping the transmission pan and valve body for access. The new TCM must be programmed with the correct transmission calibration for your specific truck and axle ratio. Reprogram with the latest Allison calibration files.',
    symptoms: ['Transmission stuck in 3rd gear', 'Limp mode activation', 'Check engine light with transmission codes', 'Harsh or erratic shifting', 'No upshift from 1st gear'],
    affectedSystems: ['Allison 1000 transmission', 'TCM'],
    dtcCodes: ['P0700', 'P0880', 'U0101'],
    estimatedCostLow: 800, estimatedCostHigh: 1800
  },
  {
    id: 'chevy-silverado-3500hd-def-system-2011',
    make: 'Chevrolet', model: 'Silverado 3500HD', years: yrs(2011, 2025),
    category: 'exhaust', severity: 'medium',
    title: 'DEF System and SCR Catalyst Failures',
    description: 'The Diesel Exhaust Fluid (DEF) system is plagued with issues including DEF tank heater failure, injector clogging, quality sensor malfunctions, and SCR catalyst degradation. Any failure triggers a countdown timer that eventually limits the truck to 5 mph if not addressed. The system is sensitive to DEF quality and crystallization.',
    solution: 'Diagnose the specific fault code to determine which DEF component failed. Common repairs include DEF injector replacement, tank heater element replacement, or DEF quality sensor replacement. Use only API-certified DEF fluid. Do not use non-certified DEF or add water. The dealer can reset the countdown timer after repairs.',
    symptoms: ['Check engine light with DEF warning', 'Reduced engine power message', 'Speed limited to 55 mph then 5 mph', 'DEF level sensor reading incorrectly', 'Service exhaust system message'],
    affectedSystems: ['DEF system', 'SCR catalyst', 'Emissions'],
    dtcCodes: ['P20B9', 'P20EE', 'P2BAB'],
    estimatedCostLow: 300, estimatedCostHigh: 2500
  },

  // Silverado EV (2024-2025)
  {
    id: 'chevy-silverado-ev-charging-fault-2024',
    make: 'Chevrolet', model: 'Silverado EV', years: yrs(2024, 2025),
    category: 'electrical', severity: 'medium',
    title: 'Level 2 Charging Interruptions and EVSE Communication Faults',
    description: 'Early Silverado EVs experience intermittent Level 2 charging interruptions where the vehicle stops charging mid-session or fails to initiate charging. The issue is attributed to EVSE communication protocol timing and software bugs in the onboard charging module. DC fast charging is generally unaffected.',
    solution: 'Update the vehicle software to the latest OTA version — GM has released multiple charging-related fixes. Try a different EVSE/charging station to rule out equipment issues. If the problem persists with multiple chargers, the dealer can diagnose the onboard charger module and CCS communication system. A control module reflash typically resolves the issue.',
    symptoms: ['Charging stops unexpectedly', 'Charge port light flashing red', 'Vehicle fails to start charging', 'Charging fault message in app', 'Reduced charging speed on Level 2'],
    affectedSystems: ['Onboard charger', 'EVSE communication'],
    dtcCodes: ['P0D00', 'P0AF0'],
    estimatedCostLow: 0, estimatedCostHigh: 1500
  },
  {
    id: 'chevy-silverado-ev-propulsion-reduced-2024',
    make: 'Chevrolet', model: 'Silverado EV', years: yrs(2024, 2025),
    category: 'drivetrain', severity: 'high',
    title: 'Propulsion Power Reduced Warning During Towing',
    description: 'When towing or driving on steep grades, the Silverado EV may display a "Propulsion Power Reduced" warning and limit motor output significantly. The battery management system is overly conservative with thermal management during high-load scenarios, triggering power derates before the battery reaches critical temperatures.',
    solution: 'Ensure the latest software is installed — GM has released calibration updates that raise the thermal derate thresholds. Pre-condition the battery before towing by driving for 15-20 minutes on highway. Reduce towing speed to lower thermal load. If the issue persists, the dealer can inspect the battery cooling system for pump or valve faults.',
    symptoms: ['Propulsion power reduced message', 'Significant loss of power while towing', 'Power limited on steep grades', 'Battery temperature warnings', 'Reduced range during heavy load'],
    affectedSystems: ['Battery thermal management', 'Drivetrain'],
    dtcCodes: ['P0A09', 'P1E00'],
    estimatedCostLow: 0, estimatedCostHigh: 500
  },

  // Prizm (1990-2002)
  {
    id: 'chevy-prizm-oil-consumption-1998',
    make: 'Chevrolet', model: 'Prizm', years: yrs(1998, 2002),
    category: 'engine', severity: 'medium',
    title: '1.8L 1ZZ-FE Oil Consumption Due to Piston Ring Design',
    description: 'The Toyota-sourced 1.8L 1ZZ-FE engine has a well-documented excessive oil consumption problem caused by poorly designed oil control piston rings. The rings do not adequately scrape oil from the cylinder walls, leading to consumption of 1 quart per 1,000 miles or worse. Toyota acknowledged the defect in the Corolla/Matrix but GM did not offer a similar remedy for the Prizm.',
    solution: 'The only permanent fix is replacing the piston rings with the updated design (Toyota revised the ring design in 2005). This requires a full engine teardown. As a management strategy, check oil every fill-up and top off as needed. Use 5W-30 conventional oil — some owners report reduced consumption with conventional over synthetic.',
    symptoms: ['Excessive oil consumption', 'Blue smoke from exhaust', 'Fouled spark plugs', 'Low oil level between changes'],
    affectedSystems: ['Engine', 'Piston rings'],
    dtcCodes: ['P0171'],
    estimatedCostLow: 50, estimatedCostHigh: 2000
  },
  {
    id: 'chevy-prizm-strut-mount-1998',
    make: 'Chevrolet', model: 'Prizm', years: yrs(1998, 2002),
    category: 'suspension', severity: 'low',
    title: 'Front Strut Mount Bearing Wear and Clunking',
    description: 'The front strut mount bearings wear out, causing a clunking noise over bumps and a grinding or popping sensation when turning the steering wheel at low speed. The rubber isolator in the mount also deteriorates, transmitting more road noise and vibration into the cabin.',
    solution: 'Replace both front strut mounts and bearings. This is typically done during strut replacement. If the struts are still in good condition, just the mounts can be replaced using spring compressors. Have a wheel alignment performed after strut mount replacement.',
    symptoms: ['Clunk over bumps from front end', 'Grinding when turning steering wheel', 'Increased road noise', 'Steering wheel does not return to center smoothly'],
    affectedSystems: ['Front suspension', 'Strut mounts'],
    dtcCodes: [],
    estimatedCostLow: 150, estimatedCostHigh: 400
  },

  // Express (1996-2025)
  {
    id: 'chevy-express-stabilitrak-2008',
    make: 'Chevrolet', model: 'Express', years: yrs(2008, 2025),
    category: 'electrical', severity: 'medium',
    title: 'StabiliTrak and ABS False Activation from Wheel Speed Sensors',
    description: 'The wheel speed sensors and their wiring are prone to failure due to the harsh commercial-use environment, causing the StabiliTrak and ABS systems to falsely activate during normal driving. The ABS unexpectedly engages during normal braking, extending stopping distances. The tone rings on the hub bearings also corrode.',
    solution: 'Scan for specific wheel speed sensor codes to identify which corner has failed. Replace the faulty wheel speed sensor and inspect the tone ring for corrosion or damage. Clean the sensor mounting area and apply anti-corrosion compound. If the hub bearing is original, replace the entire hub assembly for a fresh tone ring.',
    symptoms: ['StabiliTrak warning light', 'ABS activating during normal braking', 'Traction control light on', 'Speedometer fluctuating', 'Extended braking distances'],
    affectedSystems: ['ABS', 'StabiliTrak', 'Traction control'],
    dtcCodes: ['C0035', 'C0040', 'C0045', 'C0050'],
    estimatedCostLow: 150, estimatedCostHigh: 400
  },
  {
    id: 'chevy-express-door-hinge-pins-1996',
    make: 'Chevrolet', model: 'Express', years: yrs(1996, 2025),
    category: 'body', severity: 'low',
    title: 'Front Door Hinge Pin and Bushing Wear',
    description: 'The front door hinge pins and bushings wear out from the heavy doors and frequent commercial use, causing the doors to sag. Sagging doors do not latch properly, create wind noise, and are difficult to close. The driver door is typically the first to sag due to heavier usage.',
    solution: 'Replace the door hinge pins and bushings using a hinge repair kit. The door must be supported during the repair. Use a drift punch to remove the old pins and press in new ones. Apply grease to the new pins and bushings. In severe cases where the hinge body is worn, replace the entire hinge.',
    symptoms: ['Door sags when opened', 'Difficulty closing door', 'Door scrapes on body when opening', 'Wind noise from door area', 'Door latch requires extra force'],
    affectedSystems: ['Door hinges'],
    dtcCodes: [],
    estimatedCostLow: 30, estimatedCostHigh: 200
  },

  // Equinox EV (2024-2025)
  {
    id: 'chevy-equinox-ev-software-glitch-2024',
    make: 'Chevrolet', model: 'Equinox EV', years: yrs(2024, 2025),
    category: 'electrical', severity: 'medium',
    title: 'Infotainment and Vehicle Software Glitches Requiring Reboot',
    description: 'As a first-model-year EV on GM\'s Ultium platform, the Equinox EV experiences various software glitches including infotainment freezing, incorrect range estimates, phantom driver assistance warnings, and occasional 12V auxiliary battery management issues. These are typical new-platform teething problems.',
    solution: 'Keep the vehicle software updated via OTA updates — GM is actively pushing fixes. Perform a vehicle reset by parking, locking, and waiting 5 minutes before restarting. For persistent issues, the dealer can perform a full system reflash. The 12V battery may need replacement if it was drained by a software bug.',
    symptoms: ['Infotainment screen freezes or goes black', 'Incorrect range estimate', 'False collision warnings', 'Vehicle fails to enter Ready mode', '12V battery drain overnight'],
    affectedSystems: ['Vehicle software', 'Infotainment', '12V electrical system'],
    dtcCodes: ['U0100', 'U0140'],
    estimatedCostLow: 0, estimatedCostHigh: 500
  },
  {
    id: 'chevy-equinox-ev-one-pedal-calibration-2024',
    make: 'Chevrolet', model: 'Equinox EV', years: yrs(2024, 2025),
    category: 'drivetrain', severity: 'low',
    title: 'Regenerative Braking Inconsistency and One-Pedal Driving Jerkiness',
    description: 'The regenerative braking system exhibits inconsistent behavior depending on battery state of charge and temperature. One-pedal driving mode can feel jerky or abrupt at low speeds, and the transition between regenerative and friction braking is not always smooth. Cold weather significantly reduces regen capacity.',
    solution: 'GM has released software updates that improve regen braking calibration — ensure the latest version is installed. Pre-condition the battery in cold weather by using the scheduled departure feature. If the jerkiness is severe, the dealer can recalibrate the brake blending module. Regen limitations in cold weather are normal for all EVs.',
    symptoms: ['Jerky deceleration in one-pedal mode', 'Inconsistent braking feel', 'Regen reduced warning in cold weather', 'Abrupt transition from regen to friction braking'],
    affectedSystems: ['Regenerative braking', 'Brake blending'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 150
  },

  // ============================================================
  // CADILLAC
  // ============================================================

  // STS (2005-2011)
  {
    id: 'cadillac-sts-timing-chain-2005',
    make: 'Cadillac', model: 'STS', years: yrs(2005, 2011),
    category: 'engine', severity: 'high',
    title: '3.6L V6 Timing Chain Stretch and Guide Failure',
    description: 'The 3.6L V6 LY7 engine suffers from premature timing chain stretch and plastic timing chain guide failure, often before 100,000 miles. The stretched chain causes valve timing errors that trigger check engine lights and can eventually lead to jumped timing and catastrophic engine damage. This is one of the most expensive repairs on the STS.',
    solution: 'Replace all three timing chains, guides, tensioners, and sprockets as a complete kit. This requires significant engine disassembly including removing the front cover. Use updated GM timing chain components with improved guide material. Change oil on schedule with full synthetic to minimize chain wear.',
    symptoms: ['Check engine light with timing codes', 'Rough running on cold start', 'Rattling noise from front of engine', 'Reduced power', 'Engine misfires'],
    affectedSystems: ['Timing system'],
    dtcCodes: ['P0008', 'P0009', 'P0016', 'P0017'],
    estimatedCostLow: 1500, estimatedCostHigh: 3000
  },
  {
    id: 'cadillac-sts-cue-screen-2008',
    make: 'Cadillac', model: 'STS', years: yrs(2008, 2011),
    category: 'electrical', severity: 'low',
    title: 'Navigation and Climate Control Screen Delamination',
    description: 'The touchscreen for the navigation and climate control system develops bubbling and delamination, making it difficult or impossible to read and operate. The screen layers separate due to heat exposure from the dashboard. This affects all controls that are integrated into the screen, including climate settings.',
    solution: 'Replace the touchscreen display unit. Aftermarket refurbished screens are available at lower cost than dealer parts. Some specialty shops can repair the delamination issue. A sunshade on the windshield when parked helps prevent heat damage to the replacement screen.',
    symptoms: ['Bubbling or cloudy screen', 'Screen difficult to read', 'Touch inputs not registering', 'Screen flickers or has dark spots'],
    affectedSystems: ['Infotainment', 'Climate control display'],
    dtcCodes: [],
    estimatedCostLow: 300, estimatedCostHigh: 800
  },

  // Escalade ESV (2002-2025)
  {
    id: 'cadillac-escalade-esv-air-ride-2007',
    make: 'Cadillac', model: 'Escalade ESV', years: yrs(2007, 2020),
    category: 'suspension', severity: 'high',
    title: 'Rear Air Suspension Compressor and Air Spring Failure',
    description: 'The rear air ride suspension system fails frequently due to air spring leaks and compressor burnout. The air springs develop cracks in the rubber bladders, causing the rear to sag overnight. The compressor then runs continuously trying to maintain ride height, eventually burning itself out. This is extremely common after 80,000 miles.',
    solution: 'Replace both rear air springs and the compressor as a set. If the air lines have cracks, replace those too. Alternatively, convert to conventional coil springs and shocks with an air suspension bypass kit, which eliminates the problem permanently. The conversion kit costs less than one OEM air spring.',
    symptoms: ['Rear end sagging overnight', 'Air compressor running constantly', 'Service ride control message', 'Rear end bouncy or harsh', 'Compressor not running at all'],
    affectedSystems: ['Air suspension', 'Compressor'],
    dtcCodes: ['C0660'],
    estimatedCostLow: 400, estimatedCostHigh: 2500
  },
  {
    id: 'cadillac-escalade-esv-transfer-case-2002',
    make: 'Cadillac', model: 'Escalade ESV', years: yrs(2002, 2020),
    category: 'drivetrain', severity: 'medium',
    title: 'Transfer Case Encoder Motor and Position Sensor Failure',
    description: 'The transfer case encoder motor that controls AWD/4WD engagement fails, causing the "Service 4WD" message and preventing 4WD engagement. The position sensor inside the encoder motor sends incorrect signals. The transfer case may also develop an internal fluid leak past the front output seal.',
    solution: 'Replace the encoder motor on the transfer case. The motor is externally mounted and accessible. After replacement, a transfer case relearn procedure must be performed with a scan tool. Check and top off the transfer case fluid with the correct Auto-Trak II fluid.',
    symptoms: ['Service 4WD message on dash', '4WD not engaging', 'Grinding noise when shifting to 4WD', 'Transfer case stuck between modes'],
    affectedSystems: ['Transfer case', '4WD system'],
    dtcCodes: ['C0327', 'C0387'],
    estimatedCostLow: 250, estimatedCostHigh: 600
  },

  // Allante (1987-1993)
  {
    id: 'cadillac-allante-hg-4100-1987',
    make: 'Cadillac', model: 'Allante', years: yrs(1987, 1992),
    category: 'engine', severity: 'high',
    title: '4.1L/4.5L HT Engine Head Gasket and Bolt Failure',
    description: 'The Cadillac HT series 4.1L and 4.5L engines suffer from head gasket failure caused by insufficient head bolt clamping force. The aluminum block and iron heads expand at different rates, and the original head bolts stretch under repeated thermal cycling. Coolant enters the combustion chambers, and the engine overheats rapidly once the gasket fails.',
    solution: 'Replace head gaskets using updated Time-Sert thread repair inserts in the block to accept stronger head bolts. The original bolt holes strip in the aluminum block, requiring helicoil or Time-Sert repair. Resurface the heads and use multi-layer steel gaskets. This is a well-known repair for Cadillac HT engines.',
    symptoms: ['Overheating', 'White smoke from exhaust', 'Coolant loss', 'Oil contamination', 'Sweet smell from exhaust'],
    affectedSystems: ['Engine', 'Cooling system'],
    dtcCodes: [],
    estimatedCostLow: 1500, estimatedCostHigh: 3000
  },
  {
    id: 'cadillac-allante-convertible-top-1987',
    make: 'Cadillac', model: 'Allante', years: yrs(1987, 1993),
    category: 'electrical', severity: 'medium',
    title: 'Power Convertible Top Hydraulic System Failure',
    description: 'The hydraulic power convertible top system develops leaks in the hydraulic cylinders, lines, and pump motor. The system is complex with multiple actuators for the folding hardtop/softtop mechanism. Hydraulic fluid leaks onto the trunk carpet and the top may stop mid-cycle, leaving it partially open.',
    solution: 'Inspect all hydraulic cylinders and lines for leaks. Replace worn hydraulic cylinders and rebuild the hydraulic pump. Use the correct hydraulic fluid — never substitute brake fluid or ATF. The hydraulic reservoir is in the trunk area. Lubricate all pivot points during service. A convertible top specialist is recommended for this complex mechanism.',
    symptoms: ['Top operates slowly', 'Top stops mid-cycle', 'Hydraulic fluid leaking in trunk', 'Motor runs but top does not move', 'Top warning light on'],
    affectedSystems: ['Convertible top system', 'Hydraulics'],
    dtcCodes: [],
    estimatedCostLow: 500, estimatedCostHigh: 2000
  },

  // Eldorado (1992-2002)
  {
    id: 'cadillac-eldorado-northstar-hg-1993',
    make: 'Cadillac', model: 'Eldorado', years: yrs(1993, 2002),
    category: 'engine', severity: 'high',
    title: 'Northstar 4.6L Head Gasket Failure from Head Bolt Thread Stripping',
    description: 'The Northstar 4.6L V8 is infamous for head gasket failure caused by the head bolts pulling out of the aluminum block threads. The original open-deck block design and aluminum bolt threads cannot withstand the thermal cycling forces. Once the bolts lose clamping force, the head gaskets fail and coolant mixes with exhaust gases.',
    solution: 'The proven repair involves drilling out the original head bolt holes and installing Time-Sert or Norm\'s inserts with longer, stronger studs. This is typically done with the engine in the vehicle using specialized tools. The repair is expensive but well-documented. Alternatively, the engine can be replaced with a later Northstar that has the improved bolt design.',
    symptoms: ['Overheating', 'White smoke from exhaust', 'Coolant loss with no visible leak', 'Exhaust gases bubbling in coolant reservoir', 'Rough idle'],
    affectedSystems: ['Engine', 'Cooling system'],
    dtcCodes: ['P0300', 'P0128'],
    estimatedCostLow: 2000, estimatedCostHigh: 4000
  },
  {
    id: 'cadillac-eldorado-abs-traction-1992',
    make: 'Cadillac', model: 'Eldorado', years: yrs(1992, 2002),
    category: 'brakes', severity: 'medium',
    title: 'ABS Modulator and Traction Control System Failure',
    description: 'The Teves Mark IV ABS modulator assembly develops internal leaks and electronic failures, disabling ABS and traction control. The modulator is expensive and integrates the hydraulic pump, valves, and electronic controller into one unit. Moisture intrusion into the electrical connector accelerates failure.',
    solution: 'The ABS modulator can be sent to a specialty rebuilder for significantly less than dealer replacement cost. Apply dielectric grease to all electrical connectors during reinstallation. Bleed the ABS system using a scan tool to cycle the pump and valves. Inspect the wheel speed sensors and tone rings during the repair.',
    symptoms: ['ABS light on', 'Traction control disabled message', 'Brake pedal drops under ABS activation', 'ABS motor runs continuously for short periods'],
    affectedSystems: ['ABS', 'Traction control'],
    dtcCodes: ['C0265', 'C0267'],
    estimatedCostLow: 400, estimatedCostHigh: 1200
  },

  // XT4 (2019-2025)
  {
    id: 'cadillac-xt4-turbo-oil-consumption-2019',
    make: 'Cadillac', model: 'XT4', years: yrs(2019, 2025),
    category: 'engine', severity: 'medium',
    title: '2.0L Turbo Excessive Oil Consumption',
    description: 'The 2.0L turbocharged engine in the XT4 consumes oil at a higher-than-expected rate, with some owners reporting a quart consumed every 2,000-3,000 miles. The issue is related to the piston ring design and turbocharger oil scavenge system. GM has not issued a formal service bulletin addressing the root cause.',
    solution: 'Monitor oil level between changes and top off as needed. Use only Dexos1 Gen3 certified 0W-20 synthetic oil. Have the PCV system inspected for proper function. If consumption exceeds 1 quart per 2,000 miles, request a GM oil consumption test from the dealer. Document consumption for warranty purposes.',
    symptoms: ['Low oil level between changes', 'Low oil pressure warning', 'Oil smell from exhaust', 'Blue haze on hard acceleration'],
    affectedSystems: ['Engine', 'Turbocharger'],
    dtcCodes: ['P06DE'],
    estimatedCostLow: 50, estimatedCostHigh: 2000
  },
  {
    id: 'cadillac-xt4-transmission-hesitation-2019',
    make: 'Cadillac', model: 'XT4', years: yrs(2019, 2025),
    category: 'transmission', severity: 'low',
    title: '9-Speed Automatic Hesitation and Shift Hunting',
    description: 'The 9-speed automatic transmission exhibits hesitation during low-speed acceleration and hunts between gears on slight grades. The numerous gear ratios and aggressive fuel economy calibration cause the transmission to be indecisive, especially in the 3-4-5 gear range during light throttle driving.',
    solution: 'Have the TCM reprogrammed to the latest calibration — GM has released multiple updates improving shift quality. Use Sport mode for more decisive shifting when desired. A transmission fluid flush with the latest fluid specification may also improve shift quality. This is largely a calibration issue rather than a hardware defect.',
    symptoms: ['Hesitation on acceleration from slow speeds', 'Transmission hunting between gears', 'Jerky low-speed behavior', 'Delayed downshift for passing'],
    affectedSystems: ['9-speed automatic transmission'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 300
  },

  // XTS (2013-2019)
  {
    id: 'cadillac-xts-cue-touch-screen-2013',
    make: 'Cadillac', model: 'XTS', years: yrs(2013, 2019),
    category: 'electrical', severity: 'medium',
    title: 'CUE Touchscreen Delamination and Failure',
    description: 'The Cadillac User Experience (CUE) touchscreen is notorious for delamination, where the capacitive touch layer separates from the LCD, creating bubbles and dead zones. The screen may crack internally or become completely unresponsive. Since climate control is integrated into the touchscreen, a failed screen means no access to HVAC controls.',
    solution: 'Replace the CUE screen assembly. Aftermarket replacement screens are significantly cheaper than dealer parts and readily available. The screen replacement is a straightforward swap. Some repair services can re-laminate the existing screen at even lower cost. Use a windshield sunshade to reduce heat exposure and extend screen life.',
    symptoms: ['Bubbles or cloudiness on screen', 'Touch input not responding', 'Screen cracked internally', 'Unable to adjust climate controls', 'Screen goes black'],
    affectedSystems: ['CUE infotainment', 'Climate control interface'],
    dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 700
  },
  {
    id: 'cadillac-xts-electric-parking-brake-2013',
    make: 'Cadillac', model: 'XTS', years: yrs(2013, 2019),
    category: 'brakes', severity: 'medium',
    title: 'Electronic Parking Brake Actuator Failure',
    description: 'The electronic parking brake actuator motors on the rear calipers fail, either failing to apply or release the parking brake. A failed actuator can leave the parking brake stuck on one side, causing brake drag, heat, and uneven wear. The actuators are integrated into the rear brake calipers.',
    solution: 'Replace the rear brake caliper with integrated parking brake actuator on the affected side. Both sides should be replaced if the vehicle has high mileage. The new actuator must be initialized with a scan tool. Some aftermarket calipers include the actuator motor. Brake fluid flush is recommended during the repair.',
    symptoms: ['Parking brake warning light', 'Parking brake will not release', 'One rear wheel dragging', 'Burning smell from rear brakes', 'Service parking brake message'],
    affectedSystems: ['Electronic parking brake', 'Rear brakes'],
    dtcCodes: ['C0110'],
    estimatedCostLow: 400, estimatedCostHigh: 900
  },

  // Lyriq (2023-2025)
  {
    id: 'cadillac-lyriq-12v-battery-drain-2023',
    make: 'Cadillac', model: 'Lyriq', years: yrs(2023, 2025),
    category: 'electrical', severity: 'medium',
    title: '12V Battery Drain Preventing Vehicle Startup',
    description: 'The 12V auxiliary battery drains when the vehicle is parked for several days, preventing the Lyriq from entering "Ready" mode. The high-voltage battery remains fully charged but the vehicle cannot boot its systems without the 12V battery. Software modules failing to enter sleep mode properly cause parasitic draw.',
    solution: 'GM has released OTA software updates to address parasitic draw from modules not sleeping properly. Ensure all updates are installed. If the 12V battery has been deeply discharged multiple times, it may need replacement as deep cycling damages AGM batteries. A battery maintainer is recommended if the vehicle sits for extended periods.',
    symptoms: ['Vehicle will not start or enter Ready mode', 'Key fob not detected', 'No response from touchscreen', 'High-voltage battery shows charge but vehicle dead', 'Multiple warning messages on restart'],
    affectedSystems: ['12V electrical system', 'Body control module'],
    dtcCodes: ['U0100', 'P0562'],
    estimatedCostLow: 0, estimatedCostHigh: 400
  },
  {
    id: 'cadillac-lyriq-rear-camera-glitch-2023',
    make: 'Cadillac', model: 'Lyriq', years: yrs(2023, 2025),
    category: 'electrical', severity: 'low',
    title: 'Rear Camera and Surround Vision System Intermittent Failure',
    description: 'The rear camera and surround vision system intermittently displays a black or distorted image when engaging Reverse. The camera feeds may freeze, show the wrong camera angle, or display a "Rear Camera Unavailable" message. The issue is software-related and typically resolves after a vehicle restart.',
    solution: 'Apply the latest OTA software updates. If the issue persists, the dealer can reflash the camera control module. Check for moisture in the rear camera housing — condensation can affect image quality. A hard reset of the vehicle (park, lock, wait 5 minutes) usually restores camera function temporarily.',
    symptoms: ['Black screen when in Reverse', 'Distorted camera image', 'Rear camera unavailable message', 'Surround vision showing wrong angle', 'Camera image freezes'],
    affectedSystems: ['Rear camera', 'Surround vision'],
    dtcCodes: ['B1325'],
    estimatedCostLow: 0, estimatedCostHigh: 300
  },

  // Catera (1997-2001)
  {
    id: 'cadillac-catera-timing-belt-1997',
    make: 'Cadillac', model: 'Catera', years: yrs(1997, 2001),
    category: 'engine', severity: 'high',
    title: '3.0L V6 Timing Belt Failure and Engine Damage',
    description: 'The Opel-sourced 3.0L V6 is an interference engine that uses a timing belt rather than a chain. If the timing belt breaks, pistons contact valves causing severe engine damage. The belt must be replaced at 60,000-mile intervals. Many Cateras have been destroyed by neglected timing belt service.',
    solution: 'Replace the timing belt, tensioner, and idler pulleys at 60,000-mile intervals without exception. Replace the water pump at the same time since it is driven by the timing belt and is a common failure. This is a labor-intensive job — budget for 6-8 hours of labor. Use only quality OEM-spec belts.',
    symptoms: ['No symptoms until failure occurs', 'Ticking noise from timing cover', 'Engine will not start after belt breaks', 'Visible belt cracking on inspection'],
    affectedSystems: ['Timing belt', 'Valvetrain'],
    dtcCodes: [],
    estimatedCostLow: 800, estimatedCostHigh: 1500
  },
  {
    id: 'cadillac-catera-coolant-leak-1997',
    make: 'Cadillac', model: 'Catera', years: yrs(1997, 2001),
    category: 'cooling', severity: 'medium',
    title: 'Coolant Pipe and Crossover Tube Corrosion Leak',
    description: 'The metal coolant crossover pipes at the rear of the engine corrode and develop pinhole leaks. The Catera uses Dex-Cool coolant which is notoriously aggressive toward certain metals and gaskets. The rear-mounted pipes are difficult to access and the leak often drips onto the exhaust, causing steam and a sweet smell.',
    solution: 'Replace the corroded coolant pipes with updated stainless steel replacements if available. Flush the entire cooling system. Consider switching to conventional green coolant with more frequent change intervals. Pressure test the cooling system after repair to verify no other leaks exist.',
    symptoms: ['Coolant loss', 'Sweet smell from engine bay', 'Steam from rear of engine', 'Overheating', 'Coolant dripping on exhaust'],
    affectedSystems: ['Cooling system'],
    dtcCodes: ['P0128'],
    estimatedCostLow: 400, estimatedCostHigh: 900
  },

  // XT6 (2020-2025)
  {
    id: 'cadillac-xt6-transmission-shudder-2020',
    make: 'Cadillac', model: 'XT6', years: yrs(2020, 2025),
    category: 'transmission', severity: 'medium',
    title: '9-Speed Automatic Torque Converter Shudder',
    description: 'The 9-speed automatic transmission develops a torque converter shudder during light acceleration between 25-45 mph, similar to driving over rumble strips. The shudder is caused by degraded transmission fluid and torque converter clutch slip. GM has issued TSBs addressing this issue.',
    solution: 'Flush the transmission fluid with the updated Mobil 1 Synthetic LV ATF HP and reprogram the TCM to the latest calibration. If the shudder persists after a fluid change, the torque converter must be replaced. Some dealers will replace the torque converter under warranty or goodwill.',
    symptoms: ['Vibration like rumble strips at 25-45 mph', 'Shudder during light acceleration', 'Shudder disappears with heavy throttle', 'Transmission slip feel'],
    affectedSystems: ['9-speed automatic transmission', 'Torque converter'],
    dtcCodes: ['P0711'],
    estimatedCostLow: 200, estimatedCostHigh: 2500
  },
  {
    id: 'cadillac-xt6-auto-stop-2020',
    make: 'Cadillac', model: 'XT6', years: yrs(2020, 2025),
    category: 'electrical', severity: 'low',
    title: 'Auto Start-Stop Harshness and Battery Issues',
    description: 'The auto start-stop system engages and disengages harshly, causing the vehicle to shudder on restart. The AGM battery required for the system degrades quickly, and when it weakens, the start-stop system becomes erratic or disables itself. Many owners find the system intrusive.',
    solution: 'Replace the AGM battery with a fresh ACDelco unit if the system is not functioning properly. Have the battery monitor sensor reset after replacement. GM has released recalibrations to improve start-stop smoothness. Aftermarket start-stop eliminator modules are available for owners who want to permanently disable the feature.',
    symptoms: ['Harsh restart vibration', 'Start-stop not functioning', 'Battery warning message', 'Multiple systems acting erratic', 'Slow cranking on restart'],
    affectedSystems: ['Start-stop system', 'Battery management'],
    dtcCodes: ['P0562'],
    estimatedCostLow: 50, estimatedCostHigh: 400
  },

  // CTS-V (2004-2019)
  {
    id: 'cadillac-cts-v-differential-2009',
    make: 'Cadillac', model: 'CTS-V', years: yrs(2009, 2015),
    category: 'drivetrain', severity: 'high',
    title: 'Rear Differential Pinion Seal and Bearing Failure Under Hard Use',
    description: 'The rear differential in the second-generation CTS-V (with the supercharged LSA) develops pinion seal leaks and carrier bearing noise from high-torque abuse. The 556 hp output stresses the differential components, especially during drag launches and aggressive driving. The pinion seal leaks fluid which then causes bearing starvation.',
    solution: 'Replace the pinion seal and inspect the pinion bearing for wear. If the bearing is noisy, a differential rebuild is required including new ring and pinion setup. Upgrade to a stronger aftermarket differential cover with additional fluid capacity. Use a quality 75W-90 synthetic gear oil with limited-slip additive. Check fluid level regularly if driving hard.',
    symptoms: ['Whining noise from rear end', 'Gear oil leak at pinion', 'Clunking on hard acceleration', 'Vibration at highway speed'],
    affectedSystems: ['Rear differential'],
    dtcCodes: [],
    estimatedCostLow: 300, estimatedCostHigh: 2000
  },
  {
    id: 'cadillac-cts-v-supercharger-snout-2009',
    make: 'Cadillac', model: 'CTS-V', years: yrs(2009, 2015),
    category: 'engine', severity: 'medium',
    title: 'Eaton Supercharger Snout Coupler and Bearing Wear',
    description: 'The Eaton TVS2300 supercharger develops wear in the front coupler (snout) that connects the drive to the rotors. The isolator coupler deteriorates, causing a rattle on deceleration and eventually a metallic grinding from the supercharger. The front bearing can also fail, causing a whining noise that increases with RPM.',
    solution: 'Replace the supercharger isolator coupler and front bearing. The snout assembly can be rebuilt without removing the entire supercharger from the engine. Aftermarket upgraded coupler kits with more durable materials are available. If the rotors or housing are scored from bearing failure, the supercharger must be rebuilt or replaced.',
    symptoms: ['Rattle from supercharger on deceleration', 'Whining noise that increases with RPM', 'Metallic grinding from top of engine', 'Supercharger vibration'],
    affectedSystems: ['Supercharger'],
    dtcCodes: [],
    estimatedCostLow: 300, estimatedCostHigh: 1500
  },

  // Celestiq (2024-2025)
  {
    id: 'cadillac-celestiq-software-integration-2024',
    make: 'Cadillac', model: 'Celestiq', years: yrs(2024, 2025),
    category: 'electrical', severity: 'low',
    title: 'Complex Software Integration Issues Across Vehicle Systems',
    description: 'As a hand-built, technology-flagship vehicle, the Celestiq experiences occasional software integration issues between its numerous systems including the 55-inch LED display, four-zone smart glass roof, and advanced driver assistance features. Individual systems may temporarily lose communication with each other, requiring a vehicle restart.',
    solution: 'Given the Celestiq\'s bespoke nature, all service should be performed at authorized Cadillac dealers with Celestiq certification. OTA updates address the majority of software integration issues. The concierge service team can remotely diagnose many issues. Keep the vehicle connected to Wi-Fi for timely update delivery.',
    symptoms: ['Display panels showing incorrect information', 'Smart glass roof not responding', 'Driver assist features temporarily unavailable', 'System communication warnings'],
    affectedSystems: ['Vehicle software', 'Display systems', 'Smart glass'],
    dtcCodes: ['U0140'],
    estimatedCostLow: 0, estimatedCostHigh: 500
  },
  {
    id: 'cadillac-celestiq-suspension-calibration-2024',
    make: 'Cadillac', model: 'Celestiq', years: yrs(2024, 2025),
    category: 'suspension', severity: 'low',
    title: 'Active Suspension Calibration Sensitivity to Road Conditions',
    description: 'The advanced active suspension with independent wheel control occasionally miscalibrates, producing ride quality inconsistencies over certain road surfaces. The system may feel overly stiff on rough roads or too soft during cornering. The four-motor active suspension requires precise calibration for optimal performance.',
    solution: 'Dealer software updates address calibration algorithms. The suspension system can be recalibrated using GM diagnostic tools. Ensure all ride height sensors are functioning properly. The system learns road conditions over time, so initial rides in a new area may feel less refined until the adaptive algorithms adjust.',
    symptoms: ['Inconsistent ride quality', 'Overly stiff ride on rough roads', 'Body roll in corners', 'Ride height warning message', 'Clunking from suspension'],
    affectedSystems: ['Active suspension'],
    dtcCodes: ['C0710'],
    estimatedCostLow: 0, estimatedCostHigh: 500
  },

  // ATS (2013-2019)
  {
    id: 'cadillac-ats-cue-screen-2013',
    make: 'Cadillac', model: 'ATS', years: yrs(2013, 2019),
    category: 'electrical', severity: 'medium',
    title: 'CUE Touchscreen Cracking and Delamination',
    description: 'The Cadillac User Experience (CUE) capacitive touchscreen is plagued with cracking, delamination, and unresponsive touch zones. The screen layers separate from heat exposure, and internal cracks develop even without physical impact. Since HVAC controls are integrated into the screen, failure affects climate control operation.',
    solution: 'Replace the CUE screen with an aftermarket unit — they are significantly less expensive than dealer parts and often include improved bonding to resist future delamination. The replacement is a plug-and-play swap. Park in shade and use a windshield sunshade to extend screen life.',
    symptoms: ['Screen bubbling or peeling', 'Dead spots on touchscreen', 'Climate controls inaccessible', 'Screen cracked without impact', 'Display flickering'],
    affectedSystems: ['CUE infotainment', 'HVAC controls'],
    dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 600
  },
  {
    id: 'cadillac-ats-rear-differential-seal-2013',
    make: 'Cadillac', model: 'ATS', years: yrs(2013, 2019),
    category: 'drivetrain', severity: 'medium',
    title: 'Rear Differential Output Seal Leak',
    description: 'The rear differential output shaft seals develop leaks, allowing gear oil to seep onto the rear brakes and driveway. The 2.0T and 3.6L models are both affected. Low differential fluid from the leak causes bearing noise and eventual differential damage if not addressed.',
    solution: 'Replace the leaking output shaft seal(s). This requires removing the half-shafts for access. Top off the differential with the correct fluid after seal replacement. Inspect the rear brake pads and rotors for oil contamination — contaminated pads must be replaced. Clean the rear brake components thoroughly.',
    symptoms: ['Oil spots on driveway near rear wheels', 'Whining from rear differential', 'Oil on rear brake components', 'Low differential fluid'],
    affectedSystems: ['Rear differential', 'Seals'],
    dtcCodes: [],
    estimatedCostLow: 250, estimatedCostHigh: 600
  },

  // Seville (1992-2004)
  {
    id: 'cadillac-seville-northstar-hg-1993',
    make: 'Cadillac', model: 'Seville', years: yrs(1993, 2004),
    category: 'engine', severity: 'high',
    title: 'Northstar 4.6L Head Gasket Failure',
    description: 'The Northstar V8 in the Seville shares the same head gasket failure as all Northstar-equipped vehicles. The aluminum block head bolt threads strip, reducing clamping force on the head gaskets. This allows combustion gases to enter the cooling system and coolant to enter the cylinders. The issue is virtually guaranteed on high-mileage Northstars.',
    solution: 'The industry-standard repair uses Time-Sert inserts to repair the head bolt threads in the aluminum block with stronger steel threads. This can be performed with the engine in the vehicle. Use updated MLS head gaskets and proper torque specifications. Budget $2,500-$4,000 for this repair at a shop experienced with Northstars.',
    symptoms: ['Overheating', 'Coolant loss', 'White exhaust smoke', 'Bubbles in coolant tank', 'Rough running engine'],
    affectedSystems: ['Engine', 'Cooling system'],
    dtcCodes: ['P0300', 'P0128'],
    estimatedCostLow: 2500, estimatedCostHigh: 4000
  },
  {
    id: 'cadillac-seville-ecs-strut-1998',
    make: 'Cadillac', model: 'Seville', years: yrs(1998, 2004),
    category: 'suspension', severity: 'medium',
    title: 'Electronic Continuously Variable Real-Time Damping Strut Failure',
    description: 'The Magneride/ECS (Electronic Controlled Suspension) struts are expensive and fail, causing a harsh ride, clunking, and "Service Ride Control" messages. The struts use magnetorheological fluid that degrades over time, losing its ability to adjust damping. Replacement OEM struts are very costly.',
    solution: 'Replace the failed electronic struts. Aftermarket passive replacement struts are available at a fraction of the cost but you lose the adjustable ride. If converting to passive struts, install a bypass module to prevent the "Service Ride Control" warning. Pairs should be replaced together for even ride quality.',
    symptoms: ['Service ride control message', 'Harsh or bouncy ride', 'Clunking over bumps', 'Uneven ride quality side to side', 'Fluid leak from strut body'],
    affectedSystems: ['Electronic suspension', 'Struts'],
    dtcCodes: ['C0660', 'C0710'],
    estimatedCostLow: 400, estimatedCostHigh: 1800
  },

  // DTS (2006-2011)
  {
    id: 'cadillac-dts-northstar-oil-leak-2006',
    make: 'Cadillac', model: 'DTS', years: yrs(2006, 2011),
    category: 'engine', severity: 'medium',
    title: 'Northstar 4.6L Rear Main Seal and Oil Pan Gasket Leak',
    description: 'The Northstar V8 in the DTS develops oil leaks from the rear main seal and oil pan gasket. The transverse-mounted engine makes rear main seal access extremely difficult. Oil drips onto the exhaust crossover pipe, creating smoke and burning smell. The leak worsens over time and can become significant.',
    solution: 'The rear main seal replacement on a transverse Northstar is extremely labor-intensive — the engine and transmission must be separated. For the oil pan gasket, the engine must be raised for access. Some shops use stop-leak additives as a temporary measure. Budget for significant labor hours if doing the rear main seal properly.',
    symptoms: ['Oil dripping from bell housing area', 'Burning oil smell', 'Smoke from under the vehicle', 'Oil spots on driveway', 'Low oil level between changes'],
    affectedSystems: ['Engine seals', 'Lubrication system'],
    dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 2500
  },
  {
    id: 'cadillac-dts-steering-column-2006',
    make: 'Cadillac', model: 'DTS', years: yrs(2006, 2011),
    category: 'steering', severity: 'medium',
    title: 'Power Tilt/Telescope Steering Column Motor Failure',
    description: 'The power-adjustable steering column motors fail, leaving the column stuck in one position or failing to retract when the vehicle is turned off. The column is supposed to retract for easy entry/exit and can block the driver from comfortably entering the vehicle when it fails in the extended position.',
    solution: 'Replace the faulty steering column motor(s). There are separate motors for tilt and telescope functions. The column shroud must be removed for access. Test all column functions after replacement. In some cases, the issue is a failed relay or corroded connector rather than the motor itself — check these first.',
    symptoms: ['Steering column does not adjust', 'Column stuck in extended position', 'Column does not retract on vehicle shutdown', 'Motor noise but no movement'],
    affectedSystems: ['Steering column'],
    dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 600
  },

  // Fleetwood (1993-1996)
  {
    id: 'cadillac-fleetwood-optispark-1994',
    make: 'Cadillac', model: 'Fleetwood', years: yrs(1994, 1996),
    category: 'engine', severity: 'high',
    title: 'LT1 Optispark Distributor Water Intrusion and Failure',
    description: 'The LT1 5.7L V8 uses the Optispark distributor mounted behind the water pump at the front of the engine. Water from the water pump weep hole drips directly onto the Optispark, causing internal corrosion and failure. When the Optispark fails, the engine misfires severely or will not start at all.',
    solution: 'Replace the Optispark distributor with an updated unit that has improved sealing. Install a water pump with the weep hole redirected away from the distributor, or install a weep hole deflector. Apply RTV sealant around the Optispark housing. Replace the water pump at the same time if it has any age on it.',
    symptoms: ['Severe misfiring', 'No-start condition', 'Rough running in wet weather', 'Check engine light', 'Engine stumbling under load'],
    affectedSystems: ['Ignition system', 'Distributor'],
    dtcCodes: ['P0300', 'P0301', 'P0302'],
    estimatedCostLow: 400, estimatedCostHigh: 900
  },
  {
    id: 'cadillac-fleetwood-rear-air-spring-1993',
    make: 'Cadillac', model: 'Fleetwood', years: yrs(1993, 1996),
    category: 'suspension', severity: 'medium',
    title: 'Rear Air Leveling System Air Spring and Compressor Failure',
    description: 'The rear self-leveling air springs crack and leak, causing the rear of the vehicle to sag. The compressor then runs excessively to compensate and eventually burns out. The rubber air springs deteriorate from age, ozone exposure, and road salt. This is a common issue on all full-size GM vehicles of this era with the air leveling option.',
    solution: 'Replace both rear air springs and the compressor as a set. Alternatively, convert to conventional heavy-duty shock absorbers with an air suspension bypass kit. The conversion is straightforward and eliminates future air suspension issues. If keeping the air system, inspect the air lines for cracks as well.',
    symptoms: ['Rear end sagging', 'Compressor running constantly', 'Rear end bottoming out', 'Compressor not running at all', 'Uneven ride height'],
    affectedSystems: ['Air suspension', 'Self-leveling system'],
    dtcCodes: [],
    estimatedCostLow: 300, estimatedCostHigh: 1200
  },

  // ELR (2014-2016)
  {
    id: 'cadillac-elr-charging-system-2014',
    make: 'Cadillac', model: 'ELR', years: yrs(2014, 2016),
    category: 'electrical', severity: 'medium',
    title: 'Onboard Charger and EVSE Communication Failures',
    description: 'The ELR, based on the Chevrolet Volt platform, experiences onboard charger failures and communication issues with Level 2 EVSEs. The charging module may fail to initiate charging, stop mid-charge, or throw fault codes. The 120V Level 1 EVSE included with the car is also known to have reliability issues.',
    solution: 'Have the dealer diagnose the specific fault code. The onboard charger module may need replacement. Try different EVSEs to rule out charging station issues. Update the vehicle software to the latest calibration. The Voltec warranty may cover charging system components for 8 years/100,000 miles.',
    symptoms: ['Vehicle fails to start charging', 'Charging stops mid-session', 'Charge fault message on dash', 'Amber charging light instead of green', 'Unable to charge on specific EVSEs'],
    affectedSystems: ['Onboard charger', 'Voltec system'],
    dtcCodes: ['P1E00', 'P0AF0'],
    estimatedCostLow: 0, estimatedCostHigh: 2000
  },
  {
    id: 'cadillac-elr-12v-battery-2014',
    make: 'Cadillac', model: 'ELR', years: yrs(2014, 2016),
    category: 'electrical', severity: 'medium',
    title: '12V Auxiliary Battery Drain Preventing System Boot',
    description: 'The 12V auxiliary battery is prone to parasitic drain, especially when the vehicle is left unplugged for extended periods. Unlike a conventional car, the ELR cannot start if the 12V battery is dead even if the main traction battery is fully charged. The vehicle\'s electronics draw from the 12V system even when off.',
    solution: 'Replace the 12V battery with a quality AGM battery — the original battery often fails within 3-4 years. Keep the vehicle plugged in when parked for extended periods, as the Voltec system maintains the 12V battery when plugged in. A battery tender connected to the 12V battery is recommended for long-term storage.',
    symptoms: ['Vehicle will not enter Ready mode', 'No dashboard lights', 'Key fob not detected', 'Shift to Park warning despite being in Park'],
    affectedSystems: ['12V electrical system'],
    dtcCodes: ['P0562'],
    estimatedCostLow: 150, estimatedCostHigh: 350
  },

  // XT5 (2017-2025)
  {
    id: 'cadillac-xt5-transmission-shudder-2017',
    make: 'Cadillac', model: 'XT5', years: yrs(2017, 2025),
    category: 'transmission', severity: 'medium',
    title: '8-Speed Automatic Torque Converter Shudder',
    description: 'The 8-speed automatic transmission develops a shudder during torque converter lockup, typically felt between 25-50 mph under light acceleration. The shudder feels like driving over a grooved road surface and is caused by degrading transmission fluid affecting torque converter clutch engagement.',
    solution: 'A transmission fluid flush with Mobil 1 Synthetic LV ATF HP and a TCM reprogram typically resolves the issue. If the shudder returns after a fluid change, the torque converter needs replacement. GM has issued TSBs covering this condition. Some VINs may be eligible for warranty coverage.',
    symptoms: ['Shudder at 25-50 mph', 'Vibration during light acceleration', 'Shudder disappears under heavy throttle', 'Transmission feels rough'],
    affectedSystems: ['8-speed automatic transmission', 'Torque converter'],
    dtcCodes: ['P0711', 'P0717'],
    estimatedCostLow: 200, estimatedCostHigh: 2500
  },
  {
    id: 'cadillac-xt5-liftgate-strut-2017',
    make: 'Cadillac', model: 'XT5', years: yrs(2017, 2025),
    category: 'body', severity: 'low',
    title: 'Power Liftgate Strut Failure and Erratic Operation',
    description: 'The power liftgate struts lose their charge and fail to hold the liftgate open, causing it to slowly close or fall. The motorized struts can also operate erratically, stopping mid-travel or failing to open fully. In cold weather, the struts may not have enough force to lift the gate at all.',
    solution: 'Replace both power liftgate struts as a pair. Use OEM struts for proper fit with the power liftgate system. After replacement, the liftgate height setting may need to be reprogrammed. If the liftgate motor is also weak, it should be replaced at the same time. Lubricating the hinge points helps reduce strain on the struts.',
    symptoms: ['Liftgate will not stay open', 'Liftgate closes slowly on its own', 'Liftgate stops mid-travel', 'Liftgate will not open in cold weather', 'Warning beep during liftgate operation'],
    affectedSystems: ['Power liftgate'],
    dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 500
  },

  // CT6 (2016-2020)
  {
    id: 'cadillac-ct6-rear-camera-mirror-2016',
    make: 'Cadillac', model: 'CT6', years: yrs(2016, 2020),
    category: 'electrical', severity: 'low',
    title: 'Rear Camera Mirror Display Dimming and Image Quality Issues',
    description: 'The innovative rear camera mirror (streaming video rearview mirror) develops dimming issues, washed-out image quality, and intermittent blackouts. The camera lens on the rear of the vehicle fogs internally, and the mirror display electronics can malfunction. Switching to traditional mirror mode is always available as a fallback.',
    solution: 'Clean the rear camera lens exterior. If the image is still poor, the camera unit on the rear of the vehicle may need replacement due to internal fogging. The mirror display unit itself can be replaced if the display is the issue. Check for software updates that improve image processing.',
    symptoms: ['Dim camera mirror display', 'Washed-out image', 'Camera image intermittently blacks out', 'Image fogging or haziness', 'Flickering display'],
    affectedSystems: ['Rear camera mirror', 'Rear camera'],
    dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 800
  },
  {
    id: 'cadillac-ct6-3tt-turbo-wastegate-2016',
    make: 'Cadillac', model: 'CT6', years: yrs(2016, 2020),
    category: 'engine', severity: 'medium',
    title: '3.0L Twin-Turbo V6 Wastegate Actuator Failure',
    description: 'The twin-turbo 3.0L V6 (LGW) can develop wastegate actuator issues where the electronic wastegate sticks or fails to regulate boost pressure properly. This can result in either overboosting (which triggers limp mode) or underboosting (causing reduced power). The actuators are exposed to extreme heat cycles.',
    solution: 'Replace the failed wastegate actuator. Both turbochargers should be inspected even if only one side is symptomatic. The actuator is externally mounted and can be replaced without removing the turbocharger in most cases. Clear adaptations after replacement and test drive to verify proper boost control.',
    symptoms: ['Reduced engine power message', 'Check engine light', 'Turbo whistle or flutter noise', 'Loss of power above 3000 RPM', 'Engine enters limp mode'],
    affectedSystems: ['Turbocharger system', 'Wastegate'],
    dtcCodes: ['P0299', 'P0234'],
    estimatedCostLow: 400, estimatedCostHigh: 1200
  },

  // DeVille (1994-2005)
  {
    id: 'cadillac-deville-northstar-hg-1996',
    make: 'Cadillac', model: 'DeVille', years: yrs(1996, 2005),
    category: 'engine', severity: 'high',
    title: 'Northstar 4.6L Head Gasket Blown from Block Thread Failure',
    description: 'The Northstar V8 in the DeVille is plagued by head gasket failure caused by the aluminum block head bolt threads stripping out. This is the single most common and expensive problem on all Northstar-equipped Cadillacs. The failure is progressive — once the bolts lose torque, the gaskets cannot seal properly.',
    solution: 'The accepted repair is the Time-Sert thread insert procedure, which installs steel thread inserts in the aluminum block to accept longer, stronger head bolts. This provides a permanent fix if done correctly. Shop around for a technician experienced with Northstar head gasket repairs. The engine can remain in the vehicle for this repair with the proper tools.',
    symptoms: ['Overheating', 'White exhaust smoke', 'Sweet smell from exhaust', 'Coolant level dropping', 'Air bubbles in coolant reservoir'],
    affectedSystems: ['Engine', 'Cooling system'],
    dtcCodes: ['P0300', 'P0128'],
    estimatedCostLow: 2000, estimatedCostHigh: 4000
  },
  {
    id: 'cadillac-deville-blend-door-2000',
    make: 'Cadillac', model: 'DeVille', years: yrs(2000, 2005),
    category: 'interior', severity: 'low',
    title: 'HVAC Blend Door Actuator Failure',
    description: 'The blend door actuator motor fails, causing the HVAC system to blow only hot or only cold air regardless of the temperature setting. The DeVille uses multiple actuators for its dual-zone climate control, and a clicking or tapping noise from behind the dash is the telltale sign of a failing actuator.',
    solution: 'Replace the failed blend door actuator. The actuator is typically accessible behind the glove box or under the dash on the driver side. Identify which actuator failed by listening for the clicking noise during temperature changes. Calibrate the new actuator by disconnecting the battery for 30 seconds and then running the HVAC through a full cycle.',
    symptoms: ['Heat stuck on max', 'A/C blows hot air', 'Clicking noise from behind dash', 'Different temperatures from different vents', 'Temperature does not change with adjustment'],
    affectedSystems: ['HVAC', 'Blend door'],
    dtcCodes: [],
    estimatedCostLow: 80, estimatedCostHigh: 300
  },

  // SRX (2004-2016)
  {
    id: 'cadillac-srx-timing-chain-2010',
    make: 'Cadillac', model: 'SRX', years: yrs(2010, 2016),
    category: 'engine', severity: 'high',
    title: '3.6L V6 Timing Chain Stretch and Check Engine Light',
    description: 'The 3.6L V6 in the second-generation SRX suffers from premature timing chain stretch, causing rough running, check engine lights, and potential engine damage. The chain stretches beyond the tensioner\'s ability to compensate, and the plastic chain guides crack and break. If a guide breaks, chain debris can cause further internal damage.',
    solution: 'Replace all timing chains (primary and secondary), chain guides, tensioners, and sprockets. This is a labor-intensive job requiring extensive front-of-engine disassembly. Use only GM or quality aftermarket chain kits with updated guide materials. Regular oil changes with full synthetic oil help slow chain wear.',
    symptoms: ['Check engine light with timing codes', 'Rough idle on cold start', 'Rattling from front of engine', 'Loss of power', 'Engine misfires'],
    affectedSystems: ['Timing system'],
    dtcCodes: ['P0008', 'P0009', 'P0016', 'P0017'],
    estimatedCostLow: 1500, estimatedCostHigh: 3000
  },
  {
    id: 'cadillac-srx-awd-power-transfer-2010',
    make: 'Cadillac', model: 'SRX', years: yrs(2010, 2016),
    category: 'drivetrain', severity: 'medium',
    title: 'AWD Power Transfer Unit (PTU) Seal Leak and Bearing Noise',
    description: 'The Power Transfer Unit (PTU) that distributes power to the rear wheels on AWD models develops seal leaks and bearing noise. The PTU bolts to the transmission and is difficult to service. Low fluid from seal leaks causes the internal bearings and gears to wear, producing a whining noise that increases with speed.',
    solution: 'If caught early (seal leak only), replace the PTU seals and refill with the correct fluid. If bearing noise is present, the PTU must be replaced as it is not rebuildable. Check the PTU fluid at every oil change — many dealerships do not include this in their inspections. Use the GM-specified fluid only.',
    symptoms: ['Whining noise from front of vehicle', 'Fluid leak near transmission', 'Vibration at highway speed', 'AWD malfunction warning'],
    affectedSystems: ['Power transfer unit', 'AWD system'],
    dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 2500
  }
];

async function main() {
  console.log(`Inserting ${issues.length} issues...`);

  let created = 0;
  let skipped = 0;

  for (const issue of issues) {
    try {
      const existing = await prisma.knownIssue.findUnique({ where: { id: issue.id } });
      if (existing) {
        console.log(`  SKIP (exists): ${issue.id}`);
        skipped++;
        continue;
      }

      await prisma.knownIssue.create({
        data: {
          id: issue.id,
          make: issue.make,
          model: issue.model,
          years: issue.years,
          trims: [],
          engines: [],
          category: issue.category,
          title: issue.title,
          description: issue.description,
          solution: issue.solution,
          severity: issue.severity,
          confidence: 'medium',
          symptoms: issue.symptoms,
          affectedSystems: issue.affectedSystems,
          dtcCodes: issue.dtcCodes,
          estimatedCostLow: issue.estimatedCostLow,
          estimatedCostHigh: issue.estimatedCostHigh,
          citations: [],
          communityRecommendations: [],
          status: 'published'
        }
      });
      console.log(`  OK: ${issue.id}`);
      created++;
    } catch (err) {
      console.error(`  ERROR: ${issue.id} — ${err.message}`);
    }
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped`);

  // Summary counts
  const chevyCount = await prisma.knownIssue.count({ where: { make: 'Chevrolet' } });
  const cadillacCount = await prisma.knownIssue.count({ where: { make: 'Cadillac' } });
  console.log(`Total Chevrolet issues: ${chevyCount}`);
  console.log(`Total Cadillac issues: ${cadillacCount}`);

  const totalCount = await prisma.knownIssue.count();
  console.log(`Total issues in DB: ${totalCount}`);

  await prisma.$disconnect();
  pool.end();
}

main().catch(console.error);
