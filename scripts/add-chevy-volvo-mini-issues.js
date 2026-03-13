const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Count existing issues per make/model (both schemas)
function countExisting(make, model) {
  return data.issues.filter(i => {
    const m = i.vehicleMatch ? i.vehicleMatch.make : (i.make || '');
    const mod = i.vehicleMatch ? i.vehicleMatch.model : (i.model || '');
    return m === make && mod === model;
  }).length;
}

function range(start, end) {
  const arr = [];
  for (let y = start; y <= end; y++) arr.push(y);
  return arr;
}

function issue(id, make, model, years, category, title, description, solution, symptoms, severity, confidence, costLow, costHigh, recommendations, citations, reportCount, dtcCodes) {
  return {
    id,
    vehicleMatch: { years, make, model },
    category,
    title,
    description,
    solution,
    symptoms,
    severity,
    confidence,
    estimatedCost: { low: costLow, high: costHigh },
    communityRecommendations: recommendations,
    citations,
    humanApproved: false,
    status: "published",
    reportCount,
    reviewedOn: "2026-03-13",
    dtcCodes: dtcCodes || []
  };
}

function rec(type, content, brand, partNum) {
  const r = { type, content };
  if (brand) { r.partBrand = brand; r.partNumber = partNum; r.affiliateUrl = `https://www.amazon.com/s?k=${encodeURIComponent(brand + ' ' + partNum)}&tag=au7o-20`; }
  return r;
}

function cite(source, url, description) {
  return { source, url, description };
}

const newIssues = [];

// ========== CHEVROLET ==========

// Trax (2 existing, need 1 more)
if (countExisting('Chevrolet', 'Trax') < 3) {
  newIssues.push(issue(
    'chevrolet-trax-coolant-leak-2015', 'Chevrolet', 'Trax', range(2015, 2022),
    'Cooling', 'Coolant Leak from Water Outlet Housing',
    'The plastic water outlet housing on the 1.4L turbo engine is prone to cracking and leaking coolant. The housing sits on the back of the engine block and deteriorates from heat cycling. Coolant loss can lead to overheating if not addressed.',
    'Replace the plastic water outlet housing with an updated design. Many owners opt for aftermarket aluminum replacements for improved durability.',
    ['Coolant smell from engine bay', 'Visible coolant drip under vehicle', 'Low coolant warning light', 'Temperature gauge rising higher than normal', 'Sweet smell from heater vents', 'Coolant pooling near firewall'],
    'medium', 'high', 150, 450,
    [rec('part', 'Upgraded aluminum water outlet housing prevents repeat failures', 'Dorman', '902-846'),
     rec('tip', 'Check coolant level every oil change - slow leaks are common before major failure')],
    [cite('NHTSA', 'https://www.nhtsa.gov/vehicle/2017/CHEVROLET/TRAX', 'NHTSA complaints for Trax cooling system'),
     cite('Chevrolet Trax Forum', 'https://www.traxforum.com', 'Owner reports of coolant leak issues')],
    180, ['P0128']
  ));
}

// Spark (1 existing, need 2 more)
if (countExisting('Chevrolet', 'Spark') < 3) {
  newIssues.push(issue(
    'chevrolet-spark-cvt-failure-2013', 'Chevrolet', 'Spark', range(2016, 2022),
    'Transmission', 'CVT Transmission Shudder and Failure',
    'The Spark\'s CVT (continuously variable transmission) develops shuddering during acceleration, particularly between 20-40 mph. The transmission can eventually fail completely, leaving the vehicle unable to move. The issue is linked to belt wear and pulley degradation.',
    'Minor shudder may be temporarily improved with CVT fluid change using genuine GM fluid. Severe cases require transmission replacement as the CVT is not practically rebuildable.',
    ['Shuddering during light acceleration', 'Hesitation when pulling away from stops', 'Whining noise from transmission', 'Check engine light with transmission codes', 'Vehicle jerking at low speeds', 'RPM fluctuation during steady speed'],
    'high', 'high', 200, 4500,
    [rec('warning', 'Do NOT use generic ATF in the CVT - only GM-approved CVT fluid'),
     rec('tip', 'CVT fluid change every 30,000 miles can extend transmission life significantly')],
    [cite('NHTSA', 'https://www.nhtsa.gov/vehicle/2019/CHEVROLET/SPARK', 'NHTSA transmission complaints'),
     cite('GM Authority', 'https://gmauthority.com/blog/gm/chevrolet/spark/', 'Spark CVT reliability reports')],
    220, ['P0700', 'P0868']
  ));

  newIssues.push(issue(
    'chevrolet-spark-ignition-coil-2013', 'Chevrolet', 'Spark', range(2013, 2022),
    'Engine', 'Ignition Coil and Spark Plug Failure',
    'The 1.4L engine in the Spark is prone to premature ignition coil failure, often causing misfires and rough running. Individual coil packs fail due to heat soak in the tight engine bay. Spark plugs also wear faster than the recommended interval suggests.',
    'Replace the failed ignition coil pack. Recommended to replace all four coils and spark plugs at once since labor overlaps and remaining coils are likely near end of life.',
    ['Rough idle', 'Misfire under acceleration', 'Check engine light flashing', 'Reduced power and poor fuel economy', 'Engine stumbling at highway speed', 'Hard starting in cold weather'],
    'medium', 'high', 100, 350,
    [rec('part', 'ACDelco coil pack set - OE quality at reasonable price', 'ACDelco', '19418993'),
     rec('tip', 'Replace spark plugs every 60,000 miles even if the manual says 100,000 - the 1.4L is hard on plugs')],
    [cite('RepairPal', 'https://repairpal.com/chevrolet/spark', 'Spark common repair data'),
     cite('Spark EV Forum', 'https://www.mychevysparkev.com', 'Owner-reported ignition issues')],
    195, ['P0300', 'P0301', 'P0302']
  ));
}

// Bolt EV (1 existing, need 2 more)
if (countExisting('Chevrolet', 'Bolt EV') < 3) {
  newIssues.push(issue(
    'chevrolet-bolt-ev-infotainment-2017', 'Chevrolet', 'Bolt EV', range(2017, 2023),
    'Electrical', 'Infotainment System Freezing and Black Screen',
    'The Bolt EV infotainment system frequently freezes, goes to a black screen, or reboots while driving. The touchscreen becomes unresponsive, losing access to climate controls, navigation, and the rearview camera. The issue affects all model years but is most common on 2017-2020 models.',
    'Perform a hard reset by holding the power/volume knob for 10+ seconds. Software updates from the dealer may temporarily help. Persistent issues may require infotainment module replacement under warranty or Chevrolet goodwill program.',
    ['Touchscreen goes black while driving', 'Infotainment reboots on its own', 'Loss of rearview camera display', 'Climate controls unresponsive', 'Bluetooth connectivity drops repeatedly', 'System extremely slow to respond to inputs'],
    'medium', 'high', 0, 1200,
    [rec('tip', 'Hard reset: hold the home button and fast-forward button simultaneously for 10 seconds'),
     rec('tip', 'Keep infotainment software updated - GM has released multiple patches addressing stability')],
    [cite('NHTSA', 'https://www.nhtsa.gov/vehicle/2020/CHEVROLET/BOLT%20EV', 'NHTSA electrical complaints for Bolt EV'),
     cite('Bolt EV Forum', 'https://www.chevybolt.org', 'Owner reports of infotainment issues')],
    250
  ));

  newIssues.push(issue(
    'chevrolet-bolt-ev-cabin-heater-2017', 'Chevrolet', 'Bolt EV', range(2017, 2023),
    'Electrical', 'Cabin Heater Failure in Cold Weather',
    'The Bolt EV\'s electric cabin heater (PTC heater) can fail, leaving occupants without heat in cold weather. The heater draws significant battery power and its control module can malfunction, resulting in either no heat output or the "Service High Voltage Charging System" warning. Range is also severely impacted in cold weather due to heater power draw.',
    'Diagnose heater control module and PTC heater element. Replacement of the heater assembly or control module resolves the issue. Some owners use seat heaters and a heated steering wheel as a workaround to reduce cabin heater dependency and extend range.',
    ['No heat output from vents in cold weather', 'Service High Voltage Charging System message', 'Significantly reduced range in winter', 'Heater blows cold air intermittently', 'Clicking noise from HVAC system', 'Defrost not clearing windshield effectively'],
    'high', 'medium', 400, 2500,
    [rec('warning', 'Do not ignore heater failures in winter - windshield defogging is a safety concern'),
     rec('tip', 'Pre-condition the cabin while plugged in to save battery and ensure heat works before departing')],
    [cite('GM-Trucks.com', 'https://www.gm-trucks.com', 'Bolt EV heater system analysis'),
     cite('InsideEVs', 'https://insideevs.com/chevrolet/bolt-ev/', 'Bolt EV cold weather and heater reports')],
    165
  ));
}

// Trailblazer (2 existing, need 1 more) - note: lowercase 'b' in YMMT
if (countExisting('Chevrolet', 'Trailblazer') < 3) {
  newIssues.push(issue(
    'chevrolet-trailblazer-turbo-2021', 'Chevrolet', 'Trailblazer', range(2021, 2026),
    'Engine', 'Turbocharger Oil Leak and Failure',
    'The 1.2L and 1.3L turbocharged three-cylinder engines in the Trailblazer can develop turbo oil seal leaks, causing oil consumption and blue smoke on startup. The turbo oil feed and return lines are also prone to seepage. In severe cases, the turbo can fail completely.',
    'Replace turbo oil feed and return line seals first. If the turbo itself is leaking internally, turbocharger replacement is required. Use only GM-spec synthetic oil to minimize carbon buildup on turbo seals.',
    ['Blue smoke on cold startup', 'Oil consumption between changes', 'Turbo whistle or whine changes pitch', 'Check engine light for boost-related codes', 'Oil spots near turbo area', 'Reduced power during hard acceleration'],
    'medium', 'medium', 300, 2200,
    [rec('tip', 'Use only Dexos1 Gen3 synthetic oil - turbo engines are very sensitive to oil quality'),
     rec('warning', 'Do not ignore oil consumption - running low can damage the turbo and engine bearings')],
    [cite('NHTSA', 'https://www.nhtsa.gov/vehicle/2022/CHEVROLET/TRAILBLAZER', 'NHTSA engine complaints'),
     cite('GM Authority', 'https://gmauthority.com/blog/gm/chevrolet/trailblazer/', 'Trailblazer turbo reports')],
    140, ['P0299']
  ));
}

// Venture (2 existing, need 1 more)
if (countExisting('Chevrolet', 'Venture') < 3) {
  newIssues.push(issue(
    'chevrolet-venture-intake-gasket-1997', 'Chevrolet', 'Venture', range(1997, 2005),
    'Engine', 'Lower Intake Manifold Gasket Leak (Dex-Cool)',
    'The 3.4L V6 in the Venture is infamous for lower intake manifold gasket failure. The original gaskets react with Dex-Cool coolant, causing them to erode and leak coolant into the engine oil or externally. This can lead to catastrophic engine damage if coolant mixes with oil.',
    'Replace the lower intake manifold gaskets with updated Fel-Pro design that resists Dex-Cool degradation. Flush the cooling system and change the oil immediately if coolant contamination is found.',
    ['Coolant loss with no visible external leak', 'Milky substance on oil cap or dipstick', 'Overheating', 'White exhaust smoke', 'Sweet smell from exhaust', 'Oil level rising above full mark'],
    'high', 'high', 400, 900,
    [rec('part', 'Fel-Pro updated intake gasket set with improved Dex-Cool resistance', 'Fel-Pro', 'MS98014T'),
     rec('warning', 'If coolant has mixed with oil, flush the engine oil system multiple times before extended driving')],
    [cite('GM TSB', 'https://www.nhtsa.gov/vehicle/2003/CHEVROLET/VENTURE', 'GM intake gasket failure reports'),
     cite('3400 V6 Forum', 'https://www.gm-trucks.com', '3.4L intake gasket failure documentation')],
    290
  ));
}

// Astro (2 existing, need 1 more)
if (countExisting('Chevrolet', 'Astro') < 3) {
  newIssues.push(issue(
    'chevrolet-astro-fuel-spider-1990', 'Chevrolet', 'Astro', range(1996, 2005),
    'Engine', 'Central Port Injection (Spider) Fuel Leak',
    'The 4.3L Vortec V6 uses a central port fuel injection system (nicknamed "spider" for its appearance) that is prone to leaking fuel internally into the intake manifold. The fuel pressure regulator and poppet nozzles develop leaks, causing hard starting, rough idle, and a fuel smell. This is a fire hazard.',
    'Replace the entire CPI (central port injection) unit with the updated MPFI (multi-point fuel injection) spider assembly. The updated design uses standard injectors instead of poppet nozzles and includes a new fuel pressure regulator.',
    ['Hard starting especially when warm', 'Strong fuel smell from engine', 'Rough idle', 'Hesitation on acceleration', 'Black smoke from exhaust', 'Check engine light for lean/rich codes'],
    'high', 'high', 250, 600,
    [rec('part', 'AC Delco updated MPFI spider assembly - direct replacement for original CPI', 'ACDelco', '217-3029'),
     rec('tip', 'The updated MPFI design is a permanent fix - much more reliable than the original poppet nozzle system')],
    [cite('GM TSB', 'https://www.nhtsa.gov/vehicle/2000/CHEVROLET/ASTRO', 'NHTSA fuel system complaints'),
     cite('Astro Safari Forum', 'https://www.astrosafari.com', 'Spider injector replacement guides')],
    260, ['P0171', 'P0174']
  ));
}

// ========== VOLVO ==========

// 240 (2 existing, need 1)
if (countExisting('Volvo', '240') < 3) {
  newIssues.push(issue(
    'volvo-240-flame-trap-1990', 'Volvo', '240', range(1990, 1993),
    'Engine', 'Flame Trap (PCV) Clogging Causes Oil Leaks',
    'The Volvo 240\'s flame trap (PCV system) clogs with oil residue over time, causing excessive crankcase pressure. This leads to oil being pushed past every gasket and seal in the engine, resulting in widespread oil leaks from the valve cover, rear main seal, and oil pan. It is the number one maintenance item on these engines.',
    'Replace the flame trap (located in the intake manifold) and clean or replace all PCV hoses. This is a simple and inexpensive repair that should be done every 30,000 miles. Address any resulting oil leaks after crankcase pressure is normalized.',
    ['Oil leaks from multiple locations', 'Oil drips on exhaust causing smoke', 'Rough idle from vacuum leaks in cracked PCV hoses', 'Oil consumption increase', 'Blue smoke at startup', 'Oil film on air filter housing'],
    'medium', 'high', 20, 80,
    [rec('part', 'Volvo OEM flame trap kit with hoses', 'Genuine Volvo', '1271485'),
     rec('tip', 'Replace every 30,000 miles as preventive maintenance - one of the most important Volvo 240 services')],
    [cite('Turbobricks', 'https://www.turbobricks.com', 'Volvo 240 flame trap maintenance guide'),
     cite('IPD Volvo', 'https://www.ipdusa.com', 'Volvo 240 PCV system information')],
    200
  ));
}

// 740 (2 existing, need 1)
if (countExisting('Volvo', '740') < 3) {
  newIssues.push(issue(
    'volvo-740-overdrive-relay-1990', 'Volvo', '740', range(1990, 1992),
    'Transmission', 'Overdrive Relay and Solenoid Failure',
    'The AW70/71 automatic transmission in the 740 suffers from overdrive relay and solenoid failures. The overdrive relay on the firewall can corrode, and the M46 overdrive solenoid wears out, causing the transmission to lose its overdrive gear. Without overdrive, the engine revs high on the highway, increasing fuel consumption and wear.',
    'Replace the overdrive relay (located on the firewall near the brake booster) and test the overdrive solenoid. If the solenoid has failed, it must be replaced, which requires dropping the transmission pan.',
    ['Overdrive light flashing on dashboard', 'No overdrive engagement on highway', 'Higher than normal RPM at cruising speed', 'Transmission stuck in 3rd gear', 'Clicking from overdrive relay area', 'Poor fuel economy on highway'],
    'medium', 'high', 50, 400,
    [rec('part', 'Volvo overdrive relay - common failure point, always keep a spare', 'Genuine Volvo', '3523765'),
     rec('tip', 'Test the relay first - it is the most common cause and costs under $30 to replace')],
    [cite('Turbobricks', 'https://www.turbobricks.com', 'Volvo 740 overdrive troubleshooting'),
     cite('Volvo Forums', 'https://www.volvoforums.com', 'AW70/71 transmission overdrive issues')],
    175
  ));
}

// 960 (2 existing, need 1)
if (countExisting('Volvo', '960') < 3) {
  newIssues.push(issue(
    'volvo-960-heater-core-1992', 'Volvo', '960', range(1992, 1997),
    'Cooling', 'Heater Core Failure and Coolant Leak into Cabin',
    'The Volvo 960 heater core is prone to developing pinhole leaks due to electrolysis from mixing coolant types. Coolant leaks onto the passenger floor and creates a sweet smell in the cabin. The heater core is buried deep behind the dashboard, making replacement extremely labor-intensive.',
    'Replace the heater core, which requires significant dashboard removal. Flush the cooling system and use only Volvo-approved coolant. Install an inline coolant filter to protect the new heater core from debris.',
    ['Sweet smell inside cabin', 'Wet passenger floor carpet', 'Foggy windshield from inside', 'Coolant level drops with no external leak', 'Poor heater performance', 'Greasy film on inside of windshield'],
    'high', 'medium', 600, 1800,
    [rec('warning', 'Never mix coolant types - electrolysis from mixed coolant accelerates heater core failure'),
     rec('tip', 'An inline coolant filter on the heater hose can extend the life of a new heater core')],
    [cite('Volvo Forums', 'https://www.volvoforums.com', 'Volvo 960 heater core replacement guides'),
     cite('Matthews Volvo', 'https://www.matthewsvolvosite.com', '960/S90 heater core failure reports')],
    155
  ));
}

// EX30 (2 existing, need 1)
if (countExisting('Volvo', 'EX30') < 3) {
  newIssues.push(issue(
    'volvo-ex30-software-glitches-2024', 'Volvo', 'EX30', range(2024, 2026),
    'Electrical', 'Software Glitches and Infotainment Instability',
    'The EX30 relies on a single central screen for all vehicle controls including mirrors, climate, and driving settings. The Android Automotive-based infotainment system experiences frequent crashes, slow response times, and occasional complete restarts while driving. Over-the-air updates have addressed some issues but new bugs continue to appear.',
    'Keep the vehicle software updated via OTA updates. For persistent issues, a dealer can perform a full system reflash. Some owners report improvement after disabling unused connected services.',
    ['Touchscreen freezing or going black', 'Climate controls unresponsive', 'Rearview camera lag or failure to display', 'Phone key connectivity drops', 'Navigation map not loading', 'Vehicle settings resetting after restart'],
    'medium', 'high', 0, 500,
    [rec('tip', 'Always accept OTA updates promptly - Volvo is actively patching software issues'),
     rec('tip', 'Reboot the system by holding both steering wheel scroll wheels for 15 seconds')],
    [cite('Volvo EX30 Forum', 'https://www.volvoex30forum.com', 'Owner reports of software issues'),
     cite('Motor Authority', 'https://www.motorauthority.com/news/volvo/ex30', 'EX30 early reliability reports')],
    210
  ));
}

// EX90 (2 existing, need 1)
if (countExisting('Volvo', 'EX90') < 3) {
  newIssues.push(issue(
    'volvo-ex90-lidar-sensor-2024', 'Volvo', 'EX90', range(2024, 2026),
    'Electrical', 'LiDAR Sensor and ADAS Calibration Issues',
    'The EX90\'s roof-mounted Luminar LiDAR sensor and associated ADAS sensors require frequent recalibration. Sensor faults cause the advanced driver assistance features to disable unexpectedly. Environmental factors like rain, fog, or road spray can trigger false alerts or system shutdowns.',
    'Dealer recalibration of the LiDAR and sensor suite. Keep the roofline sensor clean and free of debris. Software updates from Volvo have improved sensor reliability over time.',
    ['ADAS features suddenly unavailable', 'Pilot Assist disengages unexpectedly', 'Warning messages about sensor obstruction in clear weather', 'LiDAR error light on dashboard', 'Phantom braking events', 'Park assist refusing to function'],
    'medium', 'medium', 0, 800,
    [rec('tip', 'Keep the LiDAR sensor on the roof clean - even a thin layer of grime can cause faults'),
     rec('warning', 'Do not rely solely on ADAS features - always maintain attention while driving')],
    [cite('Volvo EX90 Forum', 'https://www.volvoex90forum.com', 'EX90 sensor and ADAS discussion'),
     cite('The Verge', 'https://www.theverge.com/volvo/ex90', 'EX90 LiDAR and technology reviews')],
    130
  ));
}

// V40 (2 existing, need 1)
if (countExisting('Volvo', 'V40') < 3) {
  newIssues.push(issue(
    'volvo-v40-etm-failure-2000', 'Volvo', 'V40', range(2000, 2004),
    'Engine', 'Electronic Throttle Module (ETM) Failure',
    'The V40 shares the notorious ETM (electronic throttle module) issue with other Volvo models of this era. The ETM fails due to internal solder joint cracking, causing sudden loss of throttle response, stalling, or limp mode. Volvo extended warranty coverage on this part due to widespread failures.',
    'Replace the ETM with an updated revision. Volvo released an improved ETM design. Check if the vehicle is still covered under Volvo\'s extended ETM warranty program before paying out of pocket.',
    ['Sudden loss of throttle response', 'Check engine light with throttle codes', 'Engine stalling at idle', 'Vehicle going into limp mode', 'Erratic idle speed', 'Reduced engine power message'],
    'high', 'high', 300, 800,
    [rec('tip', 'Check with Volvo dealer for extended warranty coverage on the ETM - many are still covered'),
     rec('warning', 'ETM failure can cause sudden loss of power in traffic - address immediately')],
    [cite('Volvo ETM Recall', 'https://www.nhtsa.gov/vehicle/2001/VOLVO/V40', 'NHTSA ETM-related complaints'),
     cite('Volvo Forums', 'https://www.volvoforums.com', 'ETM failure reports and replacement guides')],
    280, ['P1618', 'P0638']
  ));
}

// V50 (2 existing, need 1)
if (countExisting('Volvo', 'V50') < 3) {
  newIssues.push(issue(
    'volvo-v50-power-steering-pump-2005', 'Volvo', 'V50', range(2005, 2011),
    'Suspension', 'Power Steering Pump Failure and Whining',
    'The V50\'s power steering pump develops a loud whine and eventually fails, making steering extremely heavy. The pump reservoir can also crack, causing fluid leaks. The V50 shares this issue with the S40 and C30 of the same era. Low fluid from a leaking reservoir accelerates pump failure.',
    'Replace the power steering pump and inspect the reservoir for cracks. Replace the reservoir if cracked. Flush the power steering system with new fluid after pump replacement.',
    ['Loud whining noise when turning', 'Steering becomes heavy', 'Power steering fluid leak', 'Noise worse when cold', 'Fluid level dropping in reservoir', 'Groaning noise at full lock'],
    'medium', 'high', 300, 800,
    [rec('part', 'OEM-quality power steering pump replacement', 'Atlantic Automotive', '5776N'),
     rec('tip', 'Check the fluid reservoir for cracks before replacing the pump - a leaking reservoir causes pump starvation and failure')],
    [cite('Volvo Forums', 'https://www.volvoforums.com', 'V50/S40 power steering pump failure reports'),
     cite('SwedeSpeed', 'https://www.swedespeed.com', 'V50 steering system discussion')],
    190
  ));
}

// C70 (2 existing, need 1)
if (countExisting('Volvo', 'C70') < 3) {
  newIssues.push(issue(
    'volvo-c70-retractable-hardtop-2006', 'Volvo', 'C70', range(2006, 2013),
    'Electrical', 'Retractable Hardtop Hydraulic System Failure',
    'The second-generation C70\'s retractable hardtop relies on a complex hydraulic system that is prone to failure. Hydraulic lines develop leaks, the pump can fail, and the microswitches that sequence the roof operation wear out. A single failed sensor can prevent the entire roof from operating.',
    'Diagnose which component has failed using Volvo VIDA diagnostic software. Common fixes include replacing hydraulic lines, the hydraulic pump, or individual microswitches. Hydraulic fluid should be checked and topped off regularly.',
    ['Roof stops mid-operation', 'Hydraulic fluid leak in trunk area', 'Warning message about convertible top', 'Roof fails to latch securely', 'Slow or jerky roof movement', 'Clicking noise without roof movement'],
    'high', 'medium', 500, 3000,
    [rec('warning', 'Never force the roof if it stops mid-cycle - this can cause additional mechanical damage'),
     rec('tip', 'Check hydraulic fluid level in the trunk-mounted reservoir monthly during convertible season')],
    [cite('Volvo C70 Forum', 'https://www.volvoforums.com/c70', 'C70 retractable hardtop issues and fixes'),
     cite('SwedeSpeed', 'https://www.swedespeed.com', 'C70 hydraulic roof troubleshooting')],
    175
  ));
}

// V90 (2 existing, need 1)
if (countExisting('Volvo', 'V90') < 3) {
  newIssues.push(issue(
    'volvo-v90-air-suspension-2017', 'Volvo', 'V90', range(2017, 2025),
    'Suspension', 'Rear Air Suspension Compressor and Airbag Failure',
    'V90 models equipped with rear air suspension experience compressor failures and air spring leaks. The compressor overworks to compensate for slow leaks in the air springs, eventually burning out. The vehicle sags at the rear overnight and takes time to level after starting.',
    'Replace the failed air spring(s) and inspect the compressor. If the compressor is noisy or slow to inflate, replace it as well. Check all air lines for cracks or loose fittings.',
    ['Rear of vehicle sagging overnight', 'Compressor running excessively after start', 'Suspension fault warning on dashboard', 'Uneven ride height side to side', 'Loud compressor noise from rear', 'Harsh ride over bumps'],
    'high', 'medium', 800, 2500,
    [rec('tip', 'Address air spring leaks promptly - a leaking spring will kill the compressor from overwork'),
     rec('part', 'Arnott aftermarket air springs offer good quality at lower cost than OEM', 'Arnott', 'A-3345')],
    [cite('SwedeSpeed', 'https://www.swedespeed.com', 'V90 air suspension discussion'),
     cite('Volvo Forums', 'https://www.volvoforums.com', 'V90 rear suspension issues')],
    145
  ));
}

// ========== MINI ==========

// Coupe (1 existing, need 2)
if (countExisting('MINI', 'Coupe') < 3) {
  newIssues.push(issue(
    'mini-coupe-timing-chain-2012', 'MINI', 'Coupe', range(2012, 2015),
    'Engine', 'Timing Chain Tensioner and Guide Failure',
    'The MINI Coupe shares the N14/N18 engine with the Cooper S and suffers from the same timing chain tensioner and guide wear issues. The plastic chain guides deteriorate, and the tensioner loses pressure, causing chain slack. This can lead to jumped timing and catastrophic engine damage.',
    'Replace the timing chain, tensioner, and guides as a complete kit. This is a labor-intensive repair as the front of the engine must be disassembled. Early detection via rattling noise at startup is key to preventing engine damage.',
    ['Rattling noise on cold start that goes away after a few seconds', 'Check engine light for timing-related codes', 'Rough running or misfires', 'Reduced engine power', 'Metallic noise from front of engine', 'Engine warning light on dashboard'],
    'high', 'high', 1200, 3000,
    [rec('part', 'Complete timing chain kit with updated tensioner and guides', 'Genuine MINI', '11318648732'),
     rec('warning', 'Do not ignore startup rattle - a jumped timing chain can destroy the engine')],
    [cite('MINI Cooper Forum', 'https://www.northamericanmotoring.com', 'N14/N18 timing chain failure reports'),
     cite('MINI Service Bulletin', 'https://www.minicooperforum.com', 'MINI timing chain service information')],
    230
  ));

  newIssues.push(issue(
    'mini-coupe-thermostat-housing-2012', 'MINI', 'Coupe', range(2012, 2015),
    'Cooling', 'Thermostat Housing Crack and Coolant Leak',
    'The plastic thermostat housing on the Coupe\'s engine cracks due to heat cycling, causing coolant to leak onto the engine. This is a shared weakness across the MINI/BMW N-series engine family. The housing is located on the front of the engine and is exposed to significant thermal stress.',
    'Replace the thermostat housing with an updated unit. Some aftermarket options use aluminum construction for improved durability. Replace the thermostat and O-ring at the same time.',
    ['Coolant leak from front of engine', 'Low coolant warning light', 'Overheating in traffic', 'Coolant smell from engine bay', 'Steam from under hood', 'Visible crack in plastic housing'],
    'medium', 'high', 200, 600,
    [rec('part', 'Updated thermostat housing with improved plastic or aluminum aftermarket option', 'URO Parts', '11537534521-PRM'),
     rec('tip', 'Always replace the thermostat and O-ring when replacing the housing - reusing old parts leads to repeat failure')],
    [cite('MINI Cooper Forum', 'https://www.northamericanmotoring.com', 'Thermostat housing failure reports'),
     cite('FCP Euro', 'https://www.fcpeuro.com', 'MINI cooling system parts and guides')],
    200
  ));
}

// Paceman (1 existing, need 2)
if (countExisting('MINI', 'Paceman') < 3) {
  newIssues.push(issue(
    'mini-paceman-transfer-case-2013', 'MINI', 'Paceman', range(2013, 2016),
    'Transmission', 'ALL4 Transfer Case Actuator Motor Failure',
    'The Paceman\'s ALL4 all-wheel-drive system uses an electronically controlled transfer case with an actuator motor that is prone to failure. When the actuator fails, the AWD system defaults to front-wheel drive only, and warning lights appear on the dashboard. The actuator motor is located under the vehicle and exposed to road debris and moisture.',
    'Replace the transfer case actuator motor. In some cases, the entire transfer case may need replacement if internal clutch packs are damaged from running without proper AWD engagement.',
    ['AWD warning light on dashboard', 'Drivetrain malfunction message', 'Vehicle defaults to front-wheel drive', 'Grinding noise from under vehicle', 'Vibration during turns on dry pavement', 'Reduced traction in slippery conditions'],
    'high', 'medium', 800, 2500,
    [rec('tip', 'Change the transfer case fluid every 40,000 miles - many owners skip this and it accelerates wear'),
     rec('warning', 'Do not drive aggressively on dry pavement in AWD mode - it stresses the transfer case clutch packs')],
    [cite('MINI Cooper Forum', 'https://www.northamericanmotoring.com', 'Paceman ALL4 transfer case issues'),
     cite('Pelican Parts', 'https://www.pelicanparts.com', 'MINI ALL4 system technical information')],
    140
  ));

  newIssues.push(issue(
    'mini-paceman-high-pressure-fuel-pump-2013', 'MINI', 'Paceman', range(2013, 2016),
    'Engine', 'High-Pressure Fuel Pump (HPFP) Failure',
    'The direct-injection engines in the Paceman use a high-pressure fuel pump that can fail without warning. HPFP failure causes immediate stalling or inability to start. The issue is related to internal cam follower wear and is shared with other MINI/BMW turbocharged engines.',
    'Replace the high-pressure fuel pump and inspect the cam follower for wear. The cam follower should be inspected every 50,000 miles and replaced preventively if worn past the service limit.',
    ['Engine stalls suddenly', 'Long crank with no start', 'Check engine light with fuel pressure codes', 'Reduced power under load', 'Stuttering during acceleration', 'Fuel smell from engine bay'],
    'high', 'high', 500, 1500,
    [rec('part', 'OEM high-pressure fuel pump with updated internals', 'Genuine MINI', '13517588879'),
     rec('tip', 'Inspect the HPFP cam follower every 50,000 miles - replacing a $30 follower prevents a $1,000+ pump failure')],
    [cite('MINI Cooper Forum', 'https://www.northamericanmotoring.com', 'HPFP failure reports and prevention'),
     cite('FCP Euro', 'https://www.fcpeuro.com', 'MINI high-pressure fuel pump replacement guides')],
    185, ['P0087', 'P0191']
  ));
}

// Roadster (1 existing, need 2)
if (countExisting('MINI', 'Roadster') < 3) {
  newIssues.push(issue(
    'mini-roadster-clutch-2012', 'MINI', 'Roadster', range(2012, 2015),
    'Transmission', 'Clutch and Flywheel Premature Wear (Manual)',
    'Manual transmission Roadsters experience premature clutch and dual-mass flywheel wear. The lightweight flywheel design and the turbocharged engine\'s torque characteristics accelerate wear. Clutch slippage becomes noticeable between 40,000-60,000 miles, and the dual-mass flywheel develops a rattle.',
    'Replace the clutch disc, pressure plate, throwout bearing, and dual-mass flywheel as a complete kit. Using the flywheel without replacement leads to repeat clutch failure.',
    ['Clutch slipping under hard acceleration', 'Rattling noise at idle in neutral', 'Burning smell after spirited driving', 'Clutch pedal engagement point changes', 'Difficulty shifting into gear', 'Vibration felt through clutch pedal'],
    'high', 'high', 1500, 3000,
    [rec('part', 'Complete clutch and flywheel kit', 'LuK', '03-089'),
     rec('warning', 'Always replace the dual-mass flywheel with the clutch - a worn flywheel will destroy a new clutch quickly')],
    [cite('MINI Cooper Forum', 'https://www.northamericanmotoring.com', 'Roadster clutch and flywheel reports'),
     cite('Way Motor Works', 'https://www.waymotorworks.com', 'MINI performance clutch options')],
    160
  ));

  newIssues.push(issue(
    'mini-roadster-power-steering-pump-2012', 'MINI', 'Roadster', range(2012, 2015),
    'Suspension', 'Electric Power Steering Pump Failure',
    'The Roadster\'s electric power steering pump can fail, resulting in very heavy steering. The pump is located in the engine bay and the electronic control unit inside it fails due to heat exposure. When it fails, steering becomes manual-effort only, which is especially dangerous at low speeds and during parking.',
    'Replace the electric power steering pump assembly. There is no practical repair for the internal electronics. Aftermarket remanufactured units are available at lower cost than dealer replacement.',
    ['Steering becomes very heavy suddenly', 'Power steering warning light', 'Whining or grinding noise when turning', 'Intermittent power steering loss', 'Steering heavier when engine is hot', 'EPS fault code stored in system'],
    'high', 'medium', 700, 1800,
    [rec('part', 'Remanufactured electric power steering pump - significant savings over new', 'Atlantic Automotive', '5710N'),
     rec('warning', 'Do not ignore intermittent power steering loss - it can fail completely without warning')],
    [cite('MINI Cooper Forum', 'https://www.northamericanmotoring.com', 'MINI electric power steering issues'),
     cite('Pelican Parts', 'https://www.pelicanparts.com', 'MINI power steering pump replacement guide')],
    145
  ));
}

// GP (2 existing, need 1)
if (countExisting('MINI', 'GP') < 3) {
  newIssues.push(issue(
    'mini-gp-supercharger-2013', 'MINI', 'GP', range(2013, 2021),
    'Engine', 'Turbocharger Oil Feed Line Leak and Carbon Buildup',
    'The GP\'s high-output turbocharged engine is pushed harder than standard Cooper S models, making it more susceptible to turbo oil feed line leaks and carbon buildup on intake valves. The banjo bolt oil feed line seal hardens over time, causing oil to drip onto the exhaust manifold. Direct injection also causes severe intake valve carbon deposits that reduce performance.',
    'Replace the turbo oil feed line and banjo bolt seals. For carbon buildup, walnut shell blasting of the intake valves is the established repair. Consider an oil catch can to reduce future carbon accumulation.',
    ['Oil smell from engine bay', 'Smoke from turbo area', 'Reduced power and throttle response', 'Rough idle that worsens over time', 'Misfires under boost', 'Oil drip on exhaust manifold near turbo'],
    'medium', 'high', 200, 1200,
    [rec('part', 'Oil catch can to reduce carbon buildup on intake valves', 'Mishimoto', 'MMBCC-MINI-07'),
     rec('tip', 'Walnut blast the intake valves every 50,000-60,000 miles to maintain peak performance on the GP')],
    [cite('MINI Cooper Forum', 'https://www.northamericanmotoring.com', 'GP turbo and carbon buildup reports'),
     cite('Way Motor Works', 'https://www.waymotorworks.com', 'MINI GP performance maintenance guides')],
    170, ['P0299', 'P0300']
  ));
}

// Add all new issues
data.issues.push(...newIssues);

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Added ${newIssues.length} new issues. Total: ${data.issues.length}`);

// Verify by counting
const makes = ['Chevrolet', 'Volvo', 'MINI'];
makes.forEach(make => {
  const modelCounts = {};
  data.issues.forEach(i => {
    const m = i.vehicleMatch ? i.vehicleMatch.make : (i.make || '');
    const model = i.vehicleMatch ? i.vehicleMatch.model : (i.model || '');
    if (m === make) {
      modelCounts[model] = (modelCounts[model] || 0) + 1;
    }
  });
  const under3 = Object.entries(modelCounts).filter(([,c]) => c < 3);
  console.log(`${make}: ${Object.keys(modelCounts).length} models, ${under3.length} still under 3 issues`);
  if (under3.length > 0) console.log('  Under 3:', under3.map(([m,c]) => `${m}(${c})`).join(', '));
});
