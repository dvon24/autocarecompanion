/**
 * RECALL PROPAGATION WAVE — batch 1.
 *
 * Same pipeline as every other wave (schema-forced discover -> adversarial verify ->
 * pending_review -> dead-link gate -> deploy). The ONLY difference is what the discover stage is
 * given: instead of "search the web for issues on this model", it is handed a specific NHTSA
 * recall and the list of OUR models that NHTSA says it covers but we never documented.
 *
 *   Workflow({ scriptPath: 'scripts/_wf-recall-propagation.js' })
 *
 * Why recalls and not complaints: a KnownIssue needs a `solution`. NHTSA complaint records have
 * NO remedy field, so a complaint-only issue would require an invented fix. Recall records carry
 * an authoritative `Remedy` plus the exact affected model-years, so these are fully grounded and
 * fitment-safe. (Complaint-derived issues still need a normal web-research wave for the fix.)
 *
 * Needs NO WebSearch — the evidence is embedded below and the verifier confirms against the
 * campaign URL with WebFetch. Runs even with the session search budget exhausted.
 *
 * Gap source: scripts/_find-recall-propagation-gaps.js -> 399 gaps across 127 campaigns.
 * This is batch 1: the 11 widest campaigns = 112 model-gaps.
 *
 * DOWNSTREAM: save result to data/research-recall-batch1-<date>.json, then the normal
 * persist -> promote -> push. See data/_SESSION-STATE-known-issues.md.
 */
export const meta = {
  name: 'recall-propagation-b1',
  description: 'Propagate 11 multi-model NHTSA recalls onto the 112 of our models that NHTSA covers but we never documented',
  phases: [
    { title: 'Discover' },
    { title: 'Verify' },
  ],
}

const TARGETS = [
{
"campaign":"06V096000",
"component":"AIR BAGS",
"summary":"ON CERTAIN VEHICLES, DUE TO IMPROPER ASSEMBLY OF THE AIR BAG INFLATOR, WHICH IS USED IN THE SIDE AIR BAG, THE CURTAIN SHIELD AIR BAG, AND THE KNEE AIR BAG ASSEMBLY, SOME INFLATORS WERE PRODUCED WITH AN INSUFFICIENT AMOUNT OF THE HEATING AGENTS NECESSARY FOR PROPER AIR BAG DEPLOYMENT. IN THIS CONDITION, THE EXPANSION FORCE OF THE GAS MAY BE INSUFFICIENT TO PROPERLY INFLATE THE AIR BAG WHEN THE SRS SYSTEM IS ACTIVATED DURING A CRASH.",
"consequence":"THIS MAY INCREASE THE RISK OF INJURY TO THE OCCUPANT IN THE INVOLVED SEATING POSITION IN THE EVENT OF A CRASH.",
"remedy":"DEALERS WILL REPLACE THE SPECIFIC SRS AIR BAG. THE RECALL BEGAN ON APRIL 6, 2006. OWNERS MAY CONTACT TOYOTA AT 1-888-270-9371, SCION AT 1-866-548-1851, OR LEXUS AT 1-800-255-3987.",
"unitsAffected":133,
"models":[
{
"make":"Toyota",
"model":"Avalon",
"years":[
2005,
2006
],
"existingTitles":[
"2GR-FE V6 Oil Consumption and Valve Cover Gasket Seepage",
"6-Speed Automatic Transmission Torque Converter Shudder",
"Dashboard Cracking and Warping",
"Front Strut Mount Bearing Noise and Clunking",
"Power Steering Rack Seal Leak",
"Transmission Shudder and Torque Converter Vibration",
"Water Pump Leak and Failure (2GR-FE)"
]
},
{
"make":"Toyota",
"model":"Tacoma",
"years":[
2005,
2006
],
"existingTitles":[
"12.3-inch Digital Instrument Cluster Goes Blank at Startup (Recall 25V595000 /…",
"1GR-FE 4.0L V6 Cracked Exhaust Manifold Causing Ticking and Exhaust Leak",
"1GR-FE 4.0L V6 Head Gasket Failure on Early 2005-2006 Models (Coolant Loss and Cold-Start…",
"2GR-FKS 3.5L V6 Excessive Oil Consumption (Piston Rings / PCV)",
"2GR-FKS 3.5L V6 front timing chain cover oil leak",
"2GR-FKS 3.5L V6 Oil Leak from Camshaft Housing / Cam Sensor Bolt Holes (TSB T-SB-0073-18)",
"4th Gen 12V Battery Goes Dead / No-Start From Parasitic Drain (2024+)",
"4th Gen OEM Accessory Roof Rack Abnormal Vibration and Wind Noise (TSB T-SB-0016-25)",
"6-Speed Automatic Rough Shifting",
"A/C Musty/Mold Smell"
]
},
{
"make":"Toyota",
"model":"Camry",
"years":[
2007
],
"existingTitles":[
"1992-1993 3VZ-FE Overheating and Head-Gasket Failure — Owner Reports",
"1996 Camry Power Window Moves Slowly, Grinds, or Stops — Owner Report",
"1MZ-FE V6 Engine Oil Gelation Customer Support Program",
"2003-2006 Steering Intermediate-Shaft Noise - T-SB-0296-08",
"2005-2007 VVT-i Actuator DTC Verification - T-SB-0269-10",
"2007 Camry A/C Compressor Noise or Loss of Cooling — Owner Report",
"2007 V6 In-Gear Vibration and Engine-Mount Inspection — Owner Report",
"2007-2010 2GR-FE P0138/P0158/P0606 Diagnostic Gates - T-SB-0001-10",
"2007-2011 Sticky, Shiny or Cracked Dashboard - T-SB-0039-15",
"2007-2017 HVAC Odor Maintenance - T-SB-0010-20"
]
},
{
"make":"Toyota",
"model":"RAV4",
"years":[
2005
],
"existingTitles":[
"2001-2002 RAV4 Back-Door Rattle at Spare-Tire Reinforcement Spot Welds - NV005-04",
"2001-2003 RAV4 Harsh Shift or MIL From ECM Condition - T-SB-0156-10 Rev2",
"2006-2007 RAV4 Front-Suspension Thump/Knock Over Bumps - SU009-07",
"2006-2008 2AZ-FE Oil-Consumption Inspection and Repair Program",
"2006-2008 RAV4 Steering Clunk/Pop/Knock While Turning - T-SB-0318-08",
"2006-2008 RAV4 V6 No. 2 Idler Pulley Squeak - T-SB-0056-09",
"2006-2009 2GR-FE VVT-i Oil-Hose Limited Service Campaign History",
"2006-2010 RAV4 Accelerator-Pedal Safety Recalls - 11V-113 and 10V-017",
"2006-2010 RAV4 Liquid Fuel in EVAP System - T-SB-0046-10",
"2006-2010 RAV4 Loose Sunvisor Mount - T-SB-0068-10"
]
},
{
"make":"Toyota",
"model":"Prius",
"years":[
2004,
2005,
2006
],
"existingTitles":[
"12V Auxiliary Battery Drain and Failure",
"1NZ-FXE Head Gasket Failure and EGR Cooler Issues",
"3rd Generation 2ZR-FXE Excessive Oil Consumption",
"Catalytic Converter Theft Vulnerability",
"EGR Valve and Intake Manifold Carbon Buildup",
"Hybrid Battery Pack (HV Battery) Failure",
"Inverter Coolant Pump Failure"
]
},
{
"make":"Lexus",
"model":"GS",
"years":[
2006
],
"existingTitles":[
"Dashboard Melting and Sticky Surface",
"Power Steering Rack Seal Leak",
"Water Pump Premature Failure"
]
},
{
"make":"Lexus",
"model":"IS",
"years":[
2006
],
"existingTitles":[
"8-Speed Automatic Harsh Shifting",
"Alternator Failure from Age and Oil Contamination Leading to Charging Loss",
"Carbon Buildup on Intake Valves (2.0T)",
"Dashboard Melting and Sticky Surface",
"Front Door Trim / Inner Garnish Rattle at Speaker Area",
"Fuel Pump Impeller Failure (Recall)",
"LCD Climate Control and Radio Display Pixel Failure",
"Lexus Safety System+ False Forward Collision / PCS Warnings from Dirty or Misaligned…",
"Lower Ball Joint Wear or Separation Risk in Front Suspension",
"Premature Front Brake Squeal / Groan at Low Speed"
]
}
]
},
{
"campaign":"08V441000",
"component":"ELECTRICAL SYSTEM",
"summary":"GM IS RECALLING 857,735 MY 2006-2008 BUICK LUCERNE; CADILLAC DTS; HUMMER H2; MY 2007-2008 CADILLAC ESCALADE, ESCALADE ESV, ESCALADE EXT; CHEVROLET AVALANCHE, SILVERADO, SUBURBAN, TAHOE; GMC ACADIA, SIERRA, YUKON, YUKON XL, SATURN OUTLOOK; AND MY 2008 BUICK ENCLAVE VEHICLES EQUIPPED WITH A HEATED WIPER WASHER FLUID SYSTEM. A SHORT CIRCUIT ON THE PRINTED CIRCUIT BOARD FOR THE WASHER FLUID HEATER MAY OVERHEAT THE CONTROL-CIRCUIT GROUND WIRE.",
"consequence":"THIS MAY CAUSE OTHER ELECTRICAL FEATURES TO MALFUNCTION, CREATE AN ODOR, OR CAUSE SMOKE INCREASING THE RISK OF A FIRE.",
"remedy":"DEALERS WILL INSTALL A WIRE HARNESS WITH AN IN-LINE FUSE FREE OF CHARGE. THE RECALL BEGAN ON SEPTEMBER 12, 2008. OWNERS MAY CONTACT BUICK AT 1-866-608-8080; CADILLAC AT 1-800-982-2339 OR HTTP://WWW.CADILLAC.COM; CHEVROLET AT 1-800-630-2438; SATURN AT 1-800-972-8876 OR HTTP://WWW.SATURN.COM, GMC AT 1-866-996-9436; OR HUMMER AT 1-800-732-5493; OR THROUGH THEIR WEBSITE AT <A HREF=HTTP://WWW.GMOWNERCENTER.COM>HTTP://WWW.GMOWNERCENTER.COM</A> .",
"unitsAffected":857735,
"models":[
{
"make":"Cadillac",
"model":"DTS",
"years":[
2006,
2007,
2008
],
"existingTitles":[
"Confirm the Oil Leak Source Before Rear-Seal or Oil-Pan Repair (01-06-01-011O)",
"Northstar 4.6L Head Bolt Thread Pull/Head Gasket Failure",
"Northstar 4.6L V8 Head Bolt/Head Gasket Failure",
"Power Tilt/Telescope Steering Column Motor Failure",
"Rear Air Suspension Compressor and Leveling Failure"
]
},
{
"make":"Saturn",
"model":"Outlook",
"years":[
2007,
2008
],
"existingTitles":[
"Outlook Power Steering Assist Loss — GM Special Coverage 14329"
]
},
{
"make":"GMC",
"model":"Yukon",
"years":[
2007,
2008
],
"existingTitles":[
"10L80 10-Speed Transmission Harsh Shifting, Shudder and Rear-Wheel Lock-Up",
"5.3L V8 Excessive Oil Consumption (AFM Oil Spray / Piston Rings)",
"6.2L L87 V8 Rod Bearing Failure and Loss of Propulsion",
"8L90 8-Speed Torque Converter Shudder",
"AFM/DOD Lifter Collapse and Valvetrain Failure",
"Automatic 4WD Transfer Case Position Sensor / Encoder Motor Failure",
"Autoride Air Suspension Compressor and Air Bag Failure",
"Brake Vacuum Pump Failure Causing Hard Brake Pedal",
"Cracked Dashboard Over Airbag and Instrument Panel",
"Engine Overheat/Fail-Safe Mode from Thermostat and Coolant Temp Sensor"
]
},
{
"make":"Chevrolet",
"model":"Tahoe",
"years":[
2007,
2008
],
"existingTitles":[
"'Reduced Engine Power' Limp Mode - Electronic Throttle (TAC) System",
"10L80 10-Speed Transmission Harsh Shifting",
"4L60E Automatic Transmission 3-4 Clutch Failure (Loss of 3rd/4th Gear)",
"4L60E transmission loss of reverse (cracked sun shell / worn lo-reverse clutches)",
"5.3L Vortec Excessive Oil Consumption (Low-Tension Rings / PCV)",
"6.2L L87 Rod-Bearing Engine Failure (Recall 25V-274)",
"8L90 8-Speed Transmission Shudder",
"A/C Condenser Cracking / Refrigerant Leak",
"AFM/DOD Lifter Failure - V8 Cylinder Deactivation",
"Autoride Air Suspension Compressor and Air Spring Failure"
]
},
{
"make":"Cadillac",
"model":"Escalade",
"years":[
2007,
2008
],
"existingTitles":[
"10-Speed Harsh Shift or Shudder Needs Cooler-Line and Data Diagnosis",
"4L60E/4L65E 3-4 Clutch Pack Burnup Causes Loss of Third and Fourth Gear",
"8L90 Light-Throttle Shudder Has a Specific Fluid-Exchange Procedure",
"A/C Condenser Refrigerant Leak Causes Hot Air From the Vents",
"Brake Line Corrosion and Failure (Rust Belt)",
"Clear Coat Peeling From the Roof and Hood on K2XX Escalade",
"Confirmed AFM Lifter Collapse Requires Generation-Specific Diagnosis",
"CUE Touchscreen Delamination and Unresponsive Haptic Panel",
"GMT800 Power Steering Pump Whine and High-Pressure Line Leak",
"GMT900 Outer Door Handle Release Lever Snaps Inside the Handle"
]
},
{
"make":"Buick",
"model":"Enclave",
"years":[
2008
],
"existingTitles":[
"6T70/6T75 Transmission Wave Plate Failure",
"Enclave 3.6L LLT Timing Chain Stretch + Oil Consumption",
"Enclave Power Steering Assist Loss — Special Coverage Adjustment 14329",
"Excessive Oil Consumption / Engine Failure on 3.6L",
"HVAC Blend Door Actuator Failure",
"Loss of Power Steering Assist (Pump Wear)",
"Rear A/C Evaporator Corrosion & Refrigerant Leaks",
"Stretched/Worn Timing Chain on 3.6L V6",
"Torque Converter Clutch (TCC) Shudder",
"Water Pump Leak / Coolant Loss on 3.6L V6"
]
},
{
"make":"GMC",
"model":"Acadia",
"years":[
2007,
2008
],
"existingTitles":[
"\"Shift to Park\" Message With No-Shutdown / Door-Lock Lockout and Battery Drain",
"3.6L V6 Internal Water Pump Failure and Coolant Leak",
"3.6L V6 Timing Chain Stretch and Premature Failure",
"9T65 9-Speed Transmission Harsh Shifts and Hesitation",
"Electric Power Steering (EPAS) Failure and Loss of Assist",
"Fuel Pump Mixing-Tube Burr Causing Engine Stall at Low Fuel (Recall 20V446 / GM…",
"Incorrect Transmission Sun Gear Causing Driver-Side Half-Shaft Disengagement / Rollaway…",
"Infotainment System Lockup, Black Screen and Random Reboots (2nd-Gen IO/IOR Head Unit)",
"Start/Stop Transmission Accumulator Missing Bolts - Fluid Leak, Loss of Propulsion and…",
"Surround Vision Rearview Camera Coaxial Cable Crimp Failure - Black/Lost Backup Image…"
]
},
{
"make":"Chevrolet",
"model":"Silverado",
"years":[
2007,
2008
],
"existingTitles":[
"5.3L AFM Excessive Oil Consumption (Low-Tension Piston Rings / Oil Spray)",
"5.3L V8 Active Fuel Management (AFM) Lifter Collapse and Camshaft Damage",
"6.2L V8 (L87) Connecting Rod / Crankshaft Failure — Loss of Propulsion Recall",
"6.6L Duramax LML Bosch CP4.2 Fuel Pump Failure — Whole Fuel System Destruction",
"8-Speed (8L90 / 8L45) Transmission Shudder, Hard Shift and Torque-Converter Judder",
"A/C Condenser Leak — A/C Blows Warm Air (Spot-Weld Crack / Combi-Cooler Failure)",
"Brake / Fuel Line Corrosion and Failure (Rust-Belt Steel Lines)",
"Brake Vacuum Pump Failure — Hard Brake Pedal (3.4M-Vehicle Recall)",
"Cracking Dashboard (UV / One-Piece Dash Pad Failure)",
"Fuel Pump Control Module (FPCM/FSCM) Corrosion — Crank, No-Start"
]
},
{
"make":"GMC",
"model":"Yukon XL",
"years":[
2007,
2008
],
"existingTitles":[
"6L80/6L90 Transmission Cooler Line Leak at Crimp/Fitting (Fluid Loss)",
"AC Compressor and Rear AC System Failure",
"Active Fuel Management (AFM) Lifter Failure and Tick",
"Blend Door / HVAC Mode Actuator Failure Causing Incorrect Airflow or Temperature Control",
"Brake Line Corrosion and Failure (GMT900 Platform)",
"Cracked Exhaust Manifold Bolts / Manifold Leak (5.3L/6.2L V8) Causing Cold-Start Tick",
"Dashboard Cracking and Warping from UV/Heat Exposure",
"Door Handle/Linkage Failure (Exterior Handle Pulls but Door Won’t Open)",
"Electric Power Steering (EPS) Assist Loss / Reduced Assist (NHTSA 14V-153)",
"Front Hub Bearing and ABS Wheel Speed Sensor Corrosion Causing Unwanted ABS Activation"
]
},
{
"make":"Chevrolet",
"model":"Suburban",
"years":[
2007,
2008
],
"existingTitles":[
"4L60E Transmission 3-4 Clutch Failure / Loss of 3rd & 4th",
"5.7L Vortec CSFI 'Spider' Poppet Injector Failure",
"8L90 Transmission Shudder",
"AFM/DFM Lifter Failure (5.3L/6.2L V8)",
"Brake Line Corrosion (Rust Belt)",
"Dashboard Cracking",
"Erratic Fuel Gauge / Fuel Level Sensor Failure",
"Exhaust Manifold Bolt Breakage / Cold-Start Tick",
"Front Wheel Hub Bearing Failure (ABS Light)",
"HVAC Blend Door Actuator Failure (Clicking Dash)"
]
},
{
"make":"Cadillac",
"model":"Escalade ESV",
"years":[
2007,
2008
],
"existingTitles":[
"10-Speed Harsh Shift, Shudder or Flare Can Come From a Twisted Cooler Line",
"Black Radio Screen With U023C and B1A62-86 Needs VPM Recovery",
"Dead Battery or No-Crank Can Come From the Alarm Glass-Breakage Loop",
"Early Escalade ESV Level-Control Faults Need Sensor and Inlet Diagnosis",
"L87 Connecting-Rod or Crankshaft Defect Can Cause Engine Failure (Recall 25V274)",
"Power Liftgate Strut Failure and Liftgate Falling",
"Rear Level-Control Message or Low Ride Height Needs Circuit Diagnosis",
"Startup Super Cruise Unavailable With U1624 Has a Module-Reset Path",
"Transfer Case Encoder Motor and Position Sensor Failure"
]
},
{
"make":"Chevrolet",
"model":"Avalanche",
"years":[
2007,
2008
],
"existingTitles":[
"4L60E Transmission 3-4 Clutch Failure / Slipping",
"5.3L Vortec AFM Active Fuel Management Oil Consumption and Lifter Failure",
"Body Cladding Fading, Cracking, and Clip Failure",
"Brake Line Corrosion (Salt-Belt Vehicles)",
"Cracked Dashboard (GMT900 Models)",
"Dashboard Cracking Above Instrument Cluster and Airbag Panel",
"Erratic Fuel Gauge / Fuel Level Sensor Failure",
"Excessive Oil Consumption & AFM Lifter Failure (5.3L V8)",
"HVAC Blend Door / Mode Actuator Failure",
"Instrument Cluster Gauge / Speedometer Failure (Stepper Motors)"
]
}
]
},
{
"campaign":"09V073000",
"component":"POWER TRAIN:AUTOMATIC TRANSMISSION:LEVER AND LINKAGE:COLUMN SHIFT",
"summary":"GENERAL MOTORS IS RECALLING 276,729 MY 2009 BUICK ENCLAVE, CHEVROLET COBALT, HHR, MALIBU, TRAVERSE, GMC ACADIA, PONTIAC G5, G6 AND SATURN AURA AND OUTLOOK PASSENGER VEHICLES. THESE VEHICLES FAIL TO COMPLY WITH FEDERAL MOTOR VEHICLES SAFETY STANDARD 102, \"TRANSMISSION SHIFT POSITION SEQUENCE, STARTER INTERLOCK, AND TRANSMISSION BRAKING EFFECT\", AND FMVSS 114, \"THEFT PROTECTION AND ROLLAWAY PREVENTION\". ON SOME OF THESE VEHICLES, THE TRANSMISSION SHIFT CABLE ADJUSTMENT CLIP MAY NOT BE FULLY ENGAGED. IF THE CLIP IS NOT FULLY ENGAGED, THE SHIFT LEVER AND THE ACTUAL POSITION OF THE TRANSMISSION GEAR MAY NOT MATCH. WITH THIS CONDITION, THE DRIVE COULD MOVE THE SHIFTER TO \"PARK\" AND REMOVE THE…",
"consequence":"THE DRIVER MAY NOT BE ABLE TO RESTART THE VEHICLE AND THE VEHICLE COULD ROLL AWAY AFTER THE DRIVER HAS EXITED THE VEHICLE, RESULTING IN A POSSIBLE CRASH WITHOUT PRIOR WARNING.",
"remedy":"DEALERS WILL INSPECT AND ENSURE THAT THE SHIFT CABLE ADJUSTMENT CLIP IS FULLY ENGAGED. IN THE EVENT THAT THE CLIP DOES NOT ENGAGE, THE SHIFT CABLE WILL BE REPLACED FREE OF CHARGE. THE RECALL IS EXPECTED TO BEGIN ON OR BEFORE MARCH 24, 2009. OWNERS MAY CONTACT BUICK AT 1-866-608-8080, CHEVROLET AT 1-800-630-2438, GMC AT 1-866-996-9463, PONTIAC AT 1-800-620-7668 AND SATURN AT 1-800-972-8876 OR AT WWW.GMOWNERCENTER.COM.",
"unitsAffected":276729,
"models":[
{
"make":"Chevrolet",
"model":"Malibu",
"years":[
2009
],
"existingTitles":[
"1.5T LFV/LYX Engine PCV System and Oil Consumption",
"6T40 Transmission Shudder and Harsh Shifts",
"9-Speed Automatic Transmission Shudder and Harsh Shifting",
"A/C Compressor Clutch Failure",
"Body Control Module and Instrument Cluster Electrical Faults Causing Gauges, Warning…",
"Brake Light Switch Failure and Stoplamp Circuit Problems Causing Cruise Control and Shift…",
"Ecotec 2.4L Timing Chain and Guide Failure",
"Electric Power Steering (EPS) Assist Motor Failure",
"Electric Power Steering Column Clunk and Intermediate Steering Shaft Noise",
"Electric Power Steering Motor Failure"
]
},
{
"make":"Chevrolet",
"model":"HHR",
"years":[
2009
],
"existingTitles":[
"Blower Motor Resistor Failure / Cowl Water Leak (HVAC Only Works on High)",
"Defective Ignition Switch Can Shut Off Engine While Driving (Major Recall)",
"Defective Ignition Switch Causing Engine Shutoff and Airbag Failure",
"Ecotec Timing Chain Stretch / Tensioner Failure",
"Ecotec Timing Chain Tensioner Failure and Chain Stretch",
"Electric Power Steering Sudden Loss of Assist",
"Fuel Line Corrosion and Leak Near Rear Wheel",
"Inaccurate / Fluctuating Fuel Gauge (Fuel Level Sensor)",
"Interior and Exterior Door Handle Breakage Trapping Occupants",
"Interior Door Handles Break Off"
]
},
{
"make":"Saturn",
"model":"Aura",
"years":[
2009
],
"existingTitles":[
"2.4L Ecotec Excessive Oil Consumption",
"3.6L Random/Multiple-Cylinder Misfire",
"3.6L V6 (LY7) Stretched Timing Chains",
"Aura 3.6L LY7 V6 Timing Chain Stretch",
"Body Control Module Connection Corrosion (Brake Lights / Cruise)",
"EVAP Canister Purge Valve Failure (Check Engine Light)",
"Premature Warped Front Brake Rotors",
"Sudden Loss of Electric Power Steering Assist",
"Transmission Shift Cable Fracture (Rollaway Risk)"
]
},
{
"make":"Chevrolet",
"model":"Cobalt",
"years":[
2009
],
"existingTitles":[
"Defective Ignition Switch Causing Engine Shutoff and Airbag Failure",
"Ecotec Engine Timing Chain Stretch and Guide Wear",
"Electric Power Steering Motor Sudden Failure",
"Fuel Pump Module Failure Causing Stalling and No-Start",
"Premature Front Wheel Hub Bearing Failure"
]
},
{
"make":"Chevrolet",
"model":"Traverse",
"years":[
2009
],
"existingTitles":[
"9-Speed Automatic (9T65) Torque Converter Shudder on Low-Speed Shifts",
"9-Speed Automatic Transmission Shudder (9T65)",
"A/C Condenser / Refrigerant Line Leak Causing Loss of Cooling",
"A/C Evaporator Core Leak",
"AC Compressor Premature Failure",
"Airbags May Not Deploy - SDM Left in Manufacturing Mode (Recall 18V774000)",
"Engine Oil Consumption (3.6L V6)",
"EVAP Purge Valve Failure Causing Rough Idle, Stalling and Hard Starts (P0496) — GM…",
"Excessive Oil Consumption on 3.6L LFY (Worn Rings / PCV)",
"HVAC Blend Door Actuator Failure — Warm Air on One Side / Inconsistent Dual-Zone Temps"
]
},
{
"make":"Buick",
"model":"Enclave",
"years":[
2009
],
"existingTitles":[
"6T70/6T75 Transmission Wave Plate Failure",
"Enclave 3.6L LLT Timing Chain Stretch + Oil Consumption",
"Enclave Power Steering Assist Loss — Special Coverage Adjustment 14329",
"Excessive Oil Consumption / Engine Failure on 3.6L",
"HVAC Blend Door Actuator Failure",
"Loss of Power Steering Assist (Pump Wear)",
"Rear A/C Evaporator Corrosion & Refrigerant Leaks",
"Stretched/Worn Timing Chain on 3.6L V6",
"Torque Converter Clutch (TCC) Shudder",
"Water Pump Leak / Coolant Loss on 3.6L V6"
]
},
{
"make":"GMC",
"model":"Acadia",
"years":[
2009
],
"existingTitles":[
"\"Shift to Park\" Message With No-Shutdown / Door-Lock Lockout and Battery Drain",
"3.6L V6 Internal Water Pump Failure and Coolant Leak",
"3.6L V6 Timing Chain Stretch and Premature Failure",
"9T65 9-Speed Transmission Harsh Shifts and Hesitation",
"Electric Power Steering (EPAS) Failure and Loss of Assist",
"Fuel Pump Mixing-Tube Burr Causing Engine Stall at Low Fuel (Recall 20V446 / GM…",
"Incorrect Transmission Sun Gear Causing Driver-Side Half-Shaft Disengagement / Rollaway…",
"Infotainment System Lockup, Black Screen and Random Reboots (2nd-Gen IO/IOR Head Unit)",
"Start/Stop Transmission Accumulator Missing Bolts - Fluid Leak, Loss of Propulsion and…",
"Surround Vision Rearview Camera Coaxial Cable Crimp Failure - Black/Lost Backup Image…"
]
},
{
"make":"Saturn",
"model":"Outlook",
"years":[
2009
],
"existingTitles":[
"Outlook Power Steering Assist Loss — GM Special Coverage 14329"
]
}
]
},
{
"campaign":"10V240000",
"component":"ELECTRICAL SYSTEM",
"summary":"GM IS RECALLING CERTAIN MODEL YEAR 2006-2009 BUICK, LUCERNE; CADILLAC DTS; HUMMER H2; MODEL YEAR 2008-2009 BUICK ENCLAVE; CADILLAC CTS; MODEL YEAR 2007-2009 CADILLAC ESCALADE, ESCALADE ESV, ESCALADE EXT; CHEVROLET AVALANCHE, SILVERADO, SUBURBAN, TAHOE; GMC ACADIA, SIERRA, YUKON, YUKON XL; SATURN OUTLOOK; AND MODEL YEAR 2009 CHEVROLET TRAVERSE VEHICLES EQUIPPED WITH A HEATED WASHER FLUID SYSTEM (HWFS). A RECALL WAS IMPLEMENTED IN 2008 TO ADD A FUSE TO THE CONTROL CIRCUIT HARNESS TO ADDRESS THE POTENTIAL CONSEQUENCES OF A PRINTED CIRCUIT BOARD (PCB) ELECTRICAL SHORT. HOWEVER, THERE HAVE BEEN NEW REPORTS OF THERMAL INCIDENTS ON HWFS MODULES AFTER THIS IMPROVEMENT WAS INSTALLED. THESE INCIDENTS…",
"consequence":"IT IS POSSIBLE FOR THE HEATED WASHER MODULE TO IGNITE AND A FIRE MAY OCCUR.",
"remedy":"DEALERS WILL PERMANENTLY DISABLE AND REMOVE THE HEATED WASHER FLUID MODULE. AN UPDATED PAGE FOR THE OWNER MANUAL WILL BE PROVIDED AND INSERTED IN THE OWNER MANUAL TO DOCUMENT THAT THE FEATURE HAS BEEN PERMANENTLY DISABLED AND REMOVED FROM THE VEHICLE. THE SAFETY RECALL BEGAN ON JUNE 11, 2010. OWNERS MAY CONTACT BUICK AT 1-866-608-8080, CADILLAC AT 1-866-982-2339, CHEVROLET AT 1-800-630-2438, SATURN AT 1-800-972-8876, GMC AT 1-866-996-9463 AND HUMMER AT 1-800-732-5493 OR AT THE OWNER CENTER AT…",
"unitsAffected":1365070,
"models":[
{
"make":"Cadillac",
"model":"DTS",
"years":[
2006,
2007,
2008,
2009
],
"existingTitles":[
"Confirm the Oil Leak Source Before Rear-Seal or Oil-Pan Repair (01-06-01-011O)",
"Northstar 4.6L Head Bolt Thread Pull/Head Gasket Failure",
"Northstar 4.6L V8 Head Bolt/Head Gasket Failure",
"Power Tilt/Telescope Steering Column Motor Failure",
"Rear Air Suspension Compressor and Leveling Failure"
]
},
{
"make":"Saturn",
"model":"Outlook",
"years":[
2007,
2008,
2009
],
"existingTitles":[
"Outlook Power Steering Assist Loss — GM Special Coverage 14329"
]
},
{
"make":"GMC",
"model":"Yukon",
"years":[
2007,
2008,
2009
],
"existingTitles":[
"10L80 10-Speed Transmission Harsh Shifting, Shudder and Rear-Wheel Lock-Up",
"5.3L V8 Excessive Oil Consumption (AFM Oil Spray / Piston Rings)",
"6.2L L87 V8 Rod Bearing Failure and Loss of Propulsion",
"8L90 8-Speed Torque Converter Shudder",
"AFM/DOD Lifter Collapse and Valvetrain Failure",
"Automatic 4WD Transfer Case Position Sensor / Encoder Motor Failure",
"Autoride Air Suspension Compressor and Air Bag Failure",
"Brake Vacuum Pump Failure Causing Hard Brake Pedal",
"Cracked Dashboard Over Airbag and Instrument Panel",
"Engine Overheat/Fail-Safe Mode from Thermostat and Coolant Temp Sensor"
]
},
{
"make":"Chevrolet",
"model":"Tahoe",
"years":[
2007,
2008,
2009
],
"existingTitles":[
"'Reduced Engine Power' Limp Mode - Electronic Throttle (TAC) System",
"10L80 10-Speed Transmission Harsh Shifting",
"4L60E Automatic Transmission 3-4 Clutch Failure (Loss of 3rd/4th Gear)",
"4L60E transmission loss of reverse (cracked sun shell / worn lo-reverse clutches)",
"5.3L Vortec Excessive Oil Consumption (Low-Tension Rings / PCV)",
"6.2L L87 Rod-Bearing Engine Failure (Recall 25V-274)",
"8L90 8-Speed Transmission Shudder",
"A/C Condenser Cracking / Refrigerant Leak",
"AFM/DOD Lifter Failure - V8 Cylinder Deactivation",
"Autoride Air Suspension Compressor and Air Spring Failure"
]
},
{
"make":"Cadillac",
"model":"Escalade",
"years":[
2007,
2008,
2009
],
"existingTitles":[
"10-Speed Harsh Shift or Shudder Needs Cooler-Line and Data Diagnosis",
"4L60E/4L65E 3-4 Clutch Pack Burnup Causes Loss of Third and Fourth Gear",
"8L90 Light-Throttle Shudder Has a Specific Fluid-Exchange Procedure",
"A/C Condenser Refrigerant Leak Causes Hot Air From the Vents",
"Brake Line Corrosion and Failure (Rust Belt)",
"Clear Coat Peeling From the Roof and Hood on K2XX Escalade",
"Confirmed AFM Lifter Collapse Requires Generation-Specific Diagnosis",
"CUE Touchscreen Delamination and Unresponsive Haptic Panel",
"GMT800 Power Steering Pump Whine and High-Pressure Line Leak",
"GMT900 Outer Door Handle Release Lever Snaps Inside the Handle"
]
},
{
"make":"Cadillac",
"model":"CTS",
"years":[
2008,
2009
],
"existingTitles":[
"Brake-Pedal Pushrod Bracket May Fracture (Recall 15V358)",
"Chassis Electronic Module Can Short and Stall the Engine (Recall 14V614)",
"Electric Power-Steering Assist May Fail (Recall 25V175)",
"Ignition Key Can Move Out of Run and Disable Airbags (Recall 14V394)",
"Rear-Axle Pinion Seal Can Leak and Allow Differential Failure (Recall 07V589)"
]
},
{
"make":"Buick",
"model":"Enclave",
"years":[
2008,
2009
],
"existingTitles":[
"6T70/6T75 Transmission Wave Plate Failure",
"Enclave 3.6L LLT Timing Chain Stretch + Oil Consumption",
"Enclave Power Steering Assist Loss — Special Coverage Adjustment 14329",
"Excessive Oil Consumption / Engine Failure on 3.6L",
"HVAC Blend Door Actuator Failure",
"Loss of Power Steering Assist (Pump Wear)",
"Rear A/C Evaporator Corrosion & Refrigerant Leaks",
"Stretched/Worn Timing Chain on 3.6L V6",
"Torque Converter Clutch (TCC) Shudder",
"Water Pump Leak / Coolant Loss on 3.6L V6"
]
},
{
"make":"GMC",
"model":"Acadia",
"years":[
2007,
2008,
2009
],
"existingTitles":[
"\"Shift to Park\" Message With No-Shutdown / Door-Lock Lockout and Battery Drain",
"3.6L V6 Internal Water Pump Failure and Coolant Leak",
"3.6L V6 Timing Chain Stretch and Premature Failure",
"9T65 9-Speed Transmission Harsh Shifts and Hesitation",
"Electric Power Steering (EPAS) Failure and Loss of Assist",
"Fuel Pump Mixing-Tube Burr Causing Engine Stall at Low Fuel (Recall 20V446 / GM…",
"Incorrect Transmission Sun Gear Causing Driver-Side Half-Shaft Disengagement / Rollaway…",
"Infotainment System Lockup, Black Screen and Random Reboots (2nd-Gen IO/IOR Head Unit)",
"Start/Stop Transmission Accumulator Missing Bolts - Fluid Leak, Loss of Propulsion and…",
"Surround Vision Rearview Camera Coaxial Cable Crimp Failure - Black/Lost Backup Image…"
]
},
{
"make":"GMC",
"model":"Yukon XL",
"years":[
2007,
2008,
2009
],
"existingTitles":[
"6L80/6L90 Transmission Cooler Line Leak at Crimp/Fitting (Fluid Loss)",
"AC Compressor and Rear AC System Failure",
"Active Fuel Management (AFM) Lifter Failure and Tick",
"Blend Door / HVAC Mode Actuator Failure Causing Incorrect Airflow or Temperature Control",
"Brake Line Corrosion and Failure (GMT900 Platform)",
"Cracked Exhaust Manifold Bolts / Manifold Leak (5.3L/6.2L V8) Causing Cold-Start Tick",
"Dashboard Cracking and Warping from UV/Heat Exposure",
"Door Handle/Linkage Failure (Exterior Handle Pulls but Door Won’t Open)",
"Electric Power Steering (EPS) Assist Loss / Reduced Assist (NHTSA 14V-153)",
"Front Hub Bearing and ABS Wheel Speed Sensor Corrosion Causing Unwanted ABS Activation"
]
},
{
"make":"Chevrolet",
"model":"Traverse",
"years":[
2009
],
"existingTitles":[
"9-Speed Automatic (9T65) Torque Converter Shudder on Low-Speed Shifts",
"9-Speed Automatic Transmission Shudder (9T65)",
"A/C Condenser / Refrigerant Line Leak Causing Loss of Cooling",
"A/C Evaporator Core Leak",
"AC Compressor Premature Failure",
"Airbags May Not Deploy - SDM Left in Manufacturing Mode (Recall 18V774000)",
"Engine Oil Consumption (3.6L V6)",
"EVAP Purge Valve Failure Causing Rough Idle, Stalling and Hard Starts (P0496) — GM…",
"Excessive Oil Consumption on 3.6L LFY (Worn Rings / PCV)",
"HVAC Blend Door Actuator Failure — Warm Air on One Side / Inconsistent Dual-Zone Temps"
]
},
{
"make":"Chevrolet",
"model":"Avalanche",
"years":[
2007,
2008,
2009
],
"existingTitles":[
"4L60E Transmission 3-4 Clutch Failure / Slipping",
"5.3L Vortec AFM Active Fuel Management Oil Consumption and Lifter Failure",
"Body Cladding Fading, Cracking, and Clip Failure",
"Brake Line Corrosion (Salt-Belt Vehicles)",
"Cracked Dashboard (GMT900 Models)",
"Dashboard Cracking Above Instrument Cluster and Airbag Panel",
"Erratic Fuel Gauge / Fuel Level Sensor Failure",
"Excessive Oil Consumption & AFM Lifter Failure (5.3L V8)",
"HVAC Blend Door / Mode Actuator Failure",
"Instrument Cluster Gauge / Speedometer Failure (Stepper Motors)"
]
},
{
"make":"Chevrolet",
"model":"Suburban",
"years":[
2007,
2008,
2009
],
"existingTitles":[
"4L60E Transmission 3-4 Clutch Failure / Loss of 3rd & 4th",
"5.7L Vortec CSFI 'Spider' Poppet Injector Failure",
"8L90 Transmission Shudder",
"AFM/DFM Lifter Failure (5.3L/6.2L V8)",
"Brake Line Corrosion (Rust Belt)",
"Dashboard Cracking",
"Erratic Fuel Gauge / Fuel Level Sensor Failure",
"Exhaust Manifold Bolt Breakage / Cold-Start Tick",
"Front Wheel Hub Bearing Failure (ABS Light)",
"HVAC Blend Door Actuator Failure (Clicking Dash)"
]
},
{
"make":"Cadillac",
"model":"Escalade ESV",
"years":[
2007,
2008,
2009
],
"existingTitles":[
"10-Speed Harsh Shift, Shudder or Flare Can Come From a Twisted Cooler Line",
"Black Radio Screen With U023C and B1A62-86 Needs VPM Recovery",
"Dead Battery or No-Crank Can Come From the Alarm Glass-Breakage Loop",
"Early Escalade ESV Level-Control Faults Need Sensor and Inlet Diagnosis",
"L87 Connecting-Rod or Crankshaft Defect Can Cause Engine Failure (Recall 25V274)",
"Power Liftgate Strut Failure and Liftgate Falling",
"Rear Level-Control Message or Low Ride Height Needs Circuit Diagnosis",
"Startup Super Cruise Unavailable With U1624 Has a Module-Reset Path",
"Transfer Case Encoder Motor and Position Sensor Failure"
]
}
]
},
{
"campaign":"15V461000",
"component":"EQUIPMENT:ELECTRICAL:RADIO/TAPE DECK/CD ETC.",
"summary":"Chrysler (FCA US LLC) is recalling certain model year 2013-2015 Ram 1500, 2500, 3500, 4500, and 5500, 2015 Chrysler 200, Chrysler 300, Dodge Charger, and Dodge Challenger, 2014-2015 Jeep Grand Cherokee, Cherokee, and Dodge Durango, and 2013-2015 Dodge Viper vehicles. The affected vehicles are equipped with radios that have software vulnerabilities that can allow third-party access to certain networked vehicle control systems.",
"consequence":"Exploitation of the software vulnerability may result in unauthorized remote modification and control of certain vehicle systems, increasing the risk of a crash.",
"remedy":"Chrysler will notify and mail affected owners a USB drive that includes a software update that eliminates the vulnerability, free of charge. Optionally, owners may download the update to their own USB drive from http://www.driveuconnect.com/software-update/ or take their vehicle to a Chrysler dealer for immediate installation. In an effort to mitigate the effects of this security vulnerability, Chrysler has had the wireless service provider close the open cellular connection to the vehicle that…",
"unitsAffected":1416903,
"models":[
{
"make":"RAM",
"model":"3500",
"years":[
2013,
2014,
2015
],
"existingTitles":[
"5th Wheel / Gooseneck Prep Wiring Corrosion",
"6.7L Cummins Exhaust Brake Actuator and VGT Turbo Issues",
"68RFE Automatic Transmission Failure When Towing",
"AAM 11.5/11.8 Front Axle Seal and U-Joint Failure",
"Aisin AS69RC Transmission Overheating and Converter Shudder",
"Exhaust Manifold Stud Failure (6.7L Cummins)",
"Front Hub Bearing Failure Under Heavy Load",
"Grid Heater Relay Failure (6.7L Cummins)"
]
},
{
"make":"RAM",
"model":"2500",
"years":[
2013,
2014,
2015
],
"existingTitles":[
"6.4L HEMI Valvetrain Failure (Roller Lifter/Camshaft Wear, \"HEMI Tick\")",
"6.7L Cummins CP4.2 High-Pressure Fuel Pump Catastrophic Failure",
"6.7L Cummins EGR Cooler Clogging and Cracking",
"6.7L Cummins Grid Heater Bolt Failure (Bolt Drops Into Cylinder #6)",
"6.7L Cummins VGT Turbo Actuator Failure",
"6.7L Cummins Water Pump Coolant Leak (Fire Hazard Recall 17V562000)",
"68RFE Torque Converter Shudder and TCC Failure",
"Center High-Mount Stop Lamp (Third Brake Light) Water Leak Into Cab",
"Cracking Dashboard",
"Diesel Exhaust Fluid (DEF) System Failures"
]
},
{
"make":"Jeep",
"model":"Grand Cherokee",
"years":[
2014,
2015
],
"existingTitles":[
"1999-2004 4.0L Coolant Loss or Misfire — Confirm the Cylinder Head and Leak Path First",
"1999-2010 Airbag Light Plus Horn or Wheel-Control Faults - Scan SRS First",
"2004 545RFE Intermittent Low-Line-Pressure or Gear-Ratio DTCs — Check TCM Build Date",
"2008 Grand Cherokee 4WD 4.7L Front-Axle Noise - Diagnose Before Ordering Parts",
"2011-2013 Grand Cherokee 3.6L Low Oil Between Changes - Test Before Replacing PCV Parts",
"2011-2021 5.7L Persistent Tick or Misfire - Confirm Valvetrain Damage Before Parts",
"2011-2021 Quadra-Lift Warning or Uneven Ride Height - Diagnose Before Parts",
"2011-2021 WK2 Front-End Clunk - Isolate the Failed Joint, Link, Bushing, or Mount",
"2011-2021 WK2 Rear Cargo Water Intrusion - Locate the Entry Path First",
"2012-2014 Alternator-Diode Safety Recalls (P60 / T36)"
]
},
{
"make":"RAM",
"model":"1500",
"years":[
2013,
2014,
2015
],
"existingTitles":[
"12-Inch Uconnect 5 Touchscreen Blank/Black Screen and Vertical Lines (5th-Gen DT)",
"2025 RAM 1500 Parasitic 12V Battery Drain / Modules Won't Sleep (Dead Battery, BCM…",
"3.0L EcoDiesel Bottom-End Failure — Spun Main/Rod Bearing and Broken Crankshaft",
"3.0L Hurricane Twin-Turbo I6 Random Misfire (P0300) on Early-Build Trucks Needing…",
"3.6L Pentastar Rocker Arm Roller Bearing Failure Wiping Camshaft ('Pentastar Tick',…",
"4-Corner Air Suspension Compressor Failure / Won't Raise or Lower (Ride Height Faults,…",
"4.7L PowerTech V8 Head Gasket Failure / Coolant Intrusion and Valve-Seat Drop After…",
"42RE/46RE Governor Pressure Solenoid and Sensor Failure — Limp Mode / Wrong-Gear Start",
"4WD Central Axle Disconnect (CAD) Vacuum Actuator / Line Failure — 4x4 Won't Engage",
"5.2L/5.9L Magnum Intake Manifold Plenum Pan Gasket Failure (Oil Burning, Misfire, Cat…"
]
},
{
"make":"Jeep",
"model":"Cherokee",
"years":[
2014,
2015
],
"existingTitles":[
"CAN Bus Communication Failures",
"Cracked Exhaust Manifold on the 4.0L I6",
"Crankshaft Position Sensor (CPS) Failure Causes Intermittent No-Start and Hot Stalling",
"Death Wobble (Front Solid-Axle Steering Oscillation)",
"Electronic Shifter Rollaway Risk",
"Engine Stalling (Multiple Causes)",
"Excessive Oil Consumption (2.4L Tigershark)",
"Headlight Condensation",
"Oil Filter Adapter O-Ring Leak (Commonly Misdiagnosed as Rear Main Seal)",
"Oil Filter Housing Leak (Pentastar V6)"
]
},
{
"make":"Dodge",
"model":"Durango",
"years":[
2014,
2015
],
"existingTitles":[
"8-Speed (ZF 8HP) Transmission Issues",
"A/C Compressor/Dual Zone Climate Issues",
"Alternator Failure",
"Ball Joint Failure - Safety Recall",
"Front Lower Control Arm Bushing Wear",
"HEMI MDS Lifter Tick",
"Plenum Gasket Failure (5.2L/5.9L Magnum V8)",
"TIPM (Totally Integrated Power Module) Issues",
"Transfer Case Seal Leaks (NV242/NV244/NV247)",
"Uconnect Infotainment Issues"
]
},
{
"make":"Chrysler",
"model":"300",
"years":[
2015
],
"existingTitles":[
"5.7L HEMI Exhaust Manifold Bolt Failure",
"ABS Module Internal Failure",
"Alternator Failure (Multiple Recalls)",
"Control Arm Bushing Premature Wear",
"Dashboard Warping and Deterioration",
"EVAP Leak Detection (NVLD/ESIM) Failure Triggers P0455/P0456 — Often Misdiagnosed as a…",
"EVAP System Small Leak (P0456)",
"Front Suspension Premature Wear (LX Platform)",
"Fuel Pump Relay Failure (TIPM-Related)",
"HEMI 5.7L MDS Lifter and Camshaft Failure"
]
},
{
"make":"Dodge",
"model":"Charger",
"years":[
2015
],
"existingTitles":[
"2024+ Charger Daytona EV/SIXPACK Software and Bricking Issues",
"42RLE 4-Speed Transmission Solenoid and Connector Failure",
"8-Speed (8HP) Transmission Harsh Shifts",
"Alternator/Charging System Failure",
"Driveshaft / U-Joint Premature Failure",
"EVAP Leak Detection (ESIM/NVLD) Module Failure Triggers False P0455/P0456 Codes",
"Front Suspension Premature Wear (LX/LD Platform)",
"HEMI MDS Lifter Tick",
"Pentastar V6 Rocker Arm/Lifter Tick",
"Uconnect Infotainment System Issues"
]
},
{
"make":"Dodge",
"model":"Viper",
"years":[
2013,
2014,
2015
],
"existingTitles":[
"8.3L/8.4L V10 Excessive Oil Consumption",
"Clutch Slave Cylinder / Hydraulic Failure",
"Clutch Slave Cylinder and Hydraulic System Failure",
"Coolant Crossover Tube O-Ring Leak (Gen IV/V)",
"Door Hinge Wiring Fracture (Door Lock / Window / Handle Failures)",
"Gen 1 V10 Head Gasket Failure",
"Overheating in Stop-and-Go Traffic (Undersized Cooling Fan)",
"Power Steering Fluid Fire (Reservoir Cap Off, Fluid Ignites on Header)",
"Rod Bearing Failure from Oil Starvation (Track Use)",
"Side-Exit Exhaust / Sill Cockpit Heat (Burned Legs, Cooked Interior)"
]
},
{
"make":"Chrysler",
"model":"200",
"years":[
2015
],
"existingTitles":[
"2.4L Tigershark Excessive Oil Consumption",
"2.4L Tigershark Excessive Oil Consumption",
"62TE 6-Speed Transmission Failure (Gen 1)",
"A/C Evaporator Core Leak",
"Cruise Control Cannot Be Cancelled",
"Engine Stalling at Idle (Electronic Throttle Body)",
"First-Generation Engine Stalling at Low Speed / Idle",
"Oil Filter Housing / Cooler Leak (2.4L Tigershark)",
"Parasitic Battery Drain - Modules Not Sleeping",
"Power Steering Rack Seal Leak (2nd Generation)"
]
}
]
},
{
"campaign":"24V104000",
"component":"ELECTRONIC STABILITY CONTROL (ESC)",
"summary":"BMW of North America, LLC. (BMW) is recalling certain 2023-2025 BMW, MINI, and Rolls-Royce vehicles. Please see the recall report for a complete list of models and model years. The integrated brake (IB) system may malfunction and result in a loss of power brake assist or cause the Antilock Brake (ABS) and Dynamic Stability Control (DSC) systems to not function properly.",
"consequence":"A loss of power brake assist can extend the distance required to stop the vehicle. Additionally, malfunctioning ABS and/or DSC systems can cause a loss of vehicle control. Either of these scenarios can increase the risk of a crash.",
"remedy":"Dealers will replace the integrated brake system, free of charge. Owner notification letters were mailed between June and December 2024. Owners may contact BMW customer service at 1-800-525-7417 or Rolls Royce customer service at 1-877-877-3735.",
"unitsAffected":266716,
"models":[
{
"make":"BMW",
"model":"X1",
"years":[
2023,
2024,
2025
],
"existingTitles":[
"Coolant Leaks - Water Pump & Thermostat - F48 X1",
"Front Suspension Bushing & Control Arm Wear - F48 X1",
"Lower-Engine Whine Requires X1 N20 Timing-Chain Diagnosis",
"N20 Timing Chain Guide Failure",
"Oil Filter Housing Gasket Leak",
"Oil Leaks - Valve Cover & Oil Filter Housing - F48 X1",
"Transfer Case Actuator Motor Failure",
"Transfer Case Failure - xDrive Models E84/F48 X1"
]
},
{
"make":"BMW",
"model":"X7",
"years":[
2023,
2024,
2025
],
"existingTitles":[
"2023-2025 X7 Integrated Brake System Recall 26V-422",
"48V Mild Hybrid Battery Issues",
"Air Suspension Compressor & Strut Failure (Standard Equipment)",
"Air Suspension Compressor Failure",
"B58 Coolant Expansion Tank Crack",
"B58 Coolant System Failures (xDrive40i)",
"N63TU3 Oil Consumption & Valve Stem Seal Degradation (xDrive50i/M50i/M60i)",
"Panoramic Sunroof Rattle and Creak",
"Panoramic Sunroof Water Leak",
"Premature Tire Wear (Especially 21\"/22\" Wheels)"
]
},
{
"make":"BMW",
"model":"i7",
"years":[
2023,
2024,
2025
],
"existingTitles":[
"Air Suspension Calibration and Sensor Issues",
"G70 i7 ADCAM Assistance-Limit Diagnosis",
"G70 i7 Comfort-Access Faults after Remote Upgrade"
]
},
{
"make":"BMW",
"model":"X6",
"years":[
2024,
2025
],
"existingTitles":[
"2024 X6 Integrated Brake System Recall 26V-422",
"Adaptive Drive System Malfunction",
"Air Suspension Compressor & Strut Failure",
"N63 Timing Chain Stretch & Guide Failure (E71/F16 xDrive50i)",
"N63 Turbo Wastegate Rattle (xDrive50i)",
"N63 Valve Stem Seal / Oil Consumption (xDrive50i)",
"N63 Valve Stem Seal Degradation and Oil Burning",
"Rear Differential Bushing Deterioration",
"Transfer Case Actuator Motor Failure (All xDrive Models)"
]
},
{
"make":"BMW",
"model":"i5",
"years":[
2024,
2025
],
"existingTitles":[
"12V Auxiliary Battery Drain and Dead Car Syndrome",
"2024 i5 Pedestrian Sound Recall 23V-885",
"2024 i5 Propulsion-Loss Recall 25V-395",
"2024-2025 i5 Integrated-Brake Recall 24V-697",
"2024-2025 i5 Steering-Spindle Recall 24V-714",
"2024-2026 i5 A/C Harness Recall 26V-096",
"Adaptive Suspension Self-Leveling Calibration Errors",
"DC Fast-Charge Throttling and Loud Cooling Fans on Repeated Sessions",
"Early-Production G60 i5 Condensation-Drain Drum Noise",
"iDrive 8.5 Software Bugs and EV System Errors"
]
},
{
"make":"BMW",
"model":"XM",
"years":[
2023,
2024
],
"existingTitles":[
"2023 XM Front-Passenger Knee-Airbag Recall 23V-622",
"2023-2024 XM Integrated Brake System Recall 26V-422",
"Harsh Ride Quality and Suspension Stiffness",
"Hybrid Drivetrain Hesitation and Power Delivery Lag"
]
},
{
"make":"BMW",
"model":"X5",
"years":[
2024,
2025
],
"existingTitles":[
"E53 3.0i M54 Valve-Cover Gasket Leak (Confirm the Source)",
"E53 N62 Blue Smoke: Confirm Valve-Stem Seals Before Repair",
"E70 ATC700 Transfer-Case Positioning Motor (Diagnosis Required)",
"E70 N62 Coolant Transfer Pipe Leak (Pressure-Test First)",
"E70 Rear Air-Supply Unit: Diagnose the Self-Leveling System First",
"E70 xDrive35i N55 Electric Coolant Pump (Fault-Confirmed)",
"Early N63 Timing-Chain Wear Check: ISTA Test Before Repair",
"G05 Suspension Warning: Check Faults and Campaigns Before Parts",
"G05/F95 Transfer-Case Shudder: Tires and Fluid Diagnosis First",
"N63 Twin-Turbo V8 Excessive Oil Consumption"
]
},
{
"make":"MINI",
"model":"Cooper S",
"years":[
2025
],
"existingTitles":[
"Direct Injection Carbon Buildup on Intake Valves",
"High-Pressure Fuel Pump (HPFP) Failure",
"N14/N18 Turbo Engine Timing Chain Catastrophic Failure",
"Premature Clutch and Dual-Mass Flywheel Failure",
"Turbocharger Oil Feed Line Leak and Turbo Failure"
]
},
{
"make":"MINI",
"model":"Countryman",
"years":[
2025
],
"existingTitles":[
"Aisin 8-Speed Automatic Transmission Shudder",
"ALL4 AWD System Coupling and Transfer Case Issues",
"Electric Water Pump and Thermostat Failure",
"F60 Electric Power Steering Rack Failure — Heavy or Locking Steering",
"F60 Fuel Pump Control Module (EKPS) Failure from Under-Seat Water and Spill Ingress",
"FRM Footwell Control Module Water Damage from Clogged Sunroof Drains",
"Getrag 6-Speed Manual Clutch Premature Burnout on ALL4 Models",
"Intake Valve Carbon Buildup on Direct-Injected N16/N18 Engines",
"N16/N18 Prince Engine Timing Chain Stretch and Tensioner Failure",
"OC3 Passenger Seat Occupancy Detection Mat Failure (Airbag Disabled)"
]
},
{
"make":"BMW",
"model":"X2",
"years":[
2024,
2025
],
"existingTitles":[
"2018 X2 Crankshaft Sensor Safety Recall 18V-465",
"2019 X2 Steering Tie-Rod Safety Recall 19V-601",
"Aisin 8-Speed Transmission Jerking",
"B48 Oil Filter Housing Gasket Leak/Cracking",
"B48 Timing Chain Tensioner Weakness",
"Front Control Arm Bushing Premature Wear",
"Oil Filter Housing Gasket Leak",
"Valve Cover Gasket Oil Leak"
]
},
{
"make":"BMW",
"model":"M5",
"years":[
2025
],
"existingTitles":[
"ABS/DSC Module Failure Triggering ABS, Brake, and Traction Control Warning Lights",
"Clutch Slave Cylinder and Hydraulic Line Failure Causing Soft Pedal and Shift Engagement…",
"DCT Dual-Clutch Transmission Wear & Judder - F10 M5",
"Door Vapor Barrier and Sunroof Drain Leaks Causing Wet Carpets and Electrical Problems",
"E39 M5 VANOS Solenoid/Seal Failure Causing Rattle, Power Loss, and Check Engine Lights",
"Front Thrust Arm Bushing Failure Causing 50-60 MPH Brake Shimmy and Steering Vibration",
"Getrag 420G 6-Speed Synchro Wear and 2nd/3rd Gear Grinding",
"Instrument Cluster Pixel Failure and MID Display Dropout",
"MAF Sensor Degradation Causing Lean Codes, Hesitation, and Reduced Power",
"Radiator End Tank and Expansion Tank Cracking Causing Sudden Coolant Loss and Overheating"
]
},
{
"make":"MINI",
"model":"Cooper",
"years":[
2025
],
"existingTitles":[
"Coolant Expansion Tank Cracking",
"Electric Power Steering Rack Failure",
"Electric Thermostat and Water Pump Failure",
"N12/N16 Timing Chain Tensioner Failure",
"Valve Cover and VANOS Solenoid Oil Leaks"
]
}
]
},
{
"campaign":"24V548000",
"component":"EQUIPMENT:OTHER:LABELS",
"summary":"Gulf States Toyota, Inc. (GST) is recalling certain Toyota 2023 GR Supra, 2024 4 Runner, Corolla, Grand Highlander, Grand Highlander Hybrid, Land Cruiser Hybrid, Tacoma, Tacoma Hybrid, 2023-2024 BZ4X, Corolla Cross Hybrid, GR Corolla, GR86, Highlander, Highlander Hybrid, Prius, Prius Prime, Sequoia Hybrid, Tundra, Tundra Hybrid, Venza Hybrid, 2023-2025 Crown, and 2025 Camry Hybrid vehicles equipped with GST accessories. The load carrying capacity modification label may display inaccurate added weight values. As such, these vehicles fail to comply with the requirements of Federal Motor Vehicle Safety Standard number 110, \"Tire Selection and Rims.\"",
"consequence":"A vehicle with an incorrect maximum capacity weight value may be overloaded, which can increase the risk of a crash.",
"remedy":"GST will mail new labels to owners, free of charge. Owner notification letters were mailed September 16, 2024. Owners may contact GST customer service at 1-800-444-1074. GST's number for this recall is 24R2.",
"unitsAffected":33848,
"models":[
{
"make":"Toyota",
"model":"GR86",
"years":[
2023,
2024
],
"existingTitles":[
"Apple CarPlay and Android Auto Repeated Disconnects/Crashes",
"Clutch Throwout Bearing Squeak and Premature Wear from Insufficient Factory Grease",
"Cold 2nd Gear Grind/Crunch on Upshift",
"Exhaust Drone/Resonance in Cabin at 2000-3300 RPM (Amplified by Aftermarket Exhaust)",
"Extremely Thin/Soft Paint Chips and Scratches Easily",
"FA24 Engine Oil Consumption",
"Manual Transmission Throw-Out Bearing Noise",
"Oil Pressure Drop on Sustained Right-Hand Cornering (Track/Autocross)",
"Rear Turn Signals Intermittently Inoperative (NHTSA Recall 23V-609)",
"RTV Sealant Clogs Oil Pickup, Causing FA24 Engine Failure"
]
},
{
"make":"Toyota",
"model":"Highlander",
"years":[
2023,
2024
],
"existingTitles":[
"1AR-FE 2.7L Four-Cylinder Excessive Oil Consumption (Low-Tension Ring / Carbon Buildup)",
"2.4L 2AZ-FE Head Gasket and Head Bolt Thread Failure",
"2GR-FE V6 Excessive Oil Consumption",
"2GR-FE V6 Oil Leak (Timing Cover and Oil Cooler Line)",
"2GR-FE Valve Cover Gasket & Spark-Plug Tube Seal Oil Leak (Oil-Fouled Coils / Misfire)",
"2GR-FE VVT-i Oil Supply Hose Rupture — Sudden Oil Loss (Service Campaign LSC 90K)",
"8-Speed Automatic Transmission Shudder and Hesitation",
"A/C Condenser Leak / Thin-Fin Failure (Rock-Strike Refrigerant Loss)",
"AC Blower Motor Failure and Resistor Burnout",
"AWD Rear Differential Coupling & Bearing Noise (Whine/Growl That Rises With Speed)"
]
},
{
"make":"Toyota",
"model":"Tundra",
"years":[
2023,
2024
],
"existingTitles":[
"AB60E/AB60F 6-Speed Automatic Torque Converter Shudder",
"Backup Camera Blank/Green Screen on 14-inch Display (Recall)",
"Cam Tower Oil Leak",
"Denso Low-Pressure Fuel Pump Failure and Stalling (Recall)",
"Driver's Power Window Master Switch Overheating and Fire Risk (Recall)",
"Excessive Oil Consumption from Piston Ring Coking (3UR-FE)",
"Exhaust Manifold Cracking and Bolt Failure",
"Frame Rust and Corrosion",
"Front Lower Ball Joint Failure",
"Multimedia/Infotainment System Freezing, Rebooting, and PIN Loop"
]
},
{
"make":"Toyota",
"model":"Prius",
"years":[
2023,
2024
],
"existingTitles":[
"12V Auxiliary Battery Drain and Failure",
"1NZ-FXE Head Gasket Failure and EGR Cooler Issues",
"3rd Generation 2ZR-FXE Excessive Oil Consumption",
"Catalytic Converter Theft Vulnerability",
"EGR Valve and Intake Manifold Carbon Buildup",
"Hybrid Battery Pack (HV Battery) Failure",
"Inverter Coolant Pump Failure"
]
},
{
"make":"Toyota",
"model":"GR Corolla",
"years":[
2023,
2024
],
"existingTitles":[
"Engine and Transmission Overheating During Track Use",
"Front Limited-Slip Differential Whine and Wear",
"G16E-GTS Head Gasket Seepage Under Hard Use",
"iMT Rev-Match System Interference and Shift Feel",
"Premature Clutch Wear and Slipping Under High Torque"
]
},
{
"make":"Toyota",
"model":"4Runner",
"years":[
2024
],
"existingTitles":[
"1GR-FE V6 Head Gasket Failure with External Coolant Leak at Rear of Cylinder Head",
"2UZ-FE 4.7L V8 Timing Belt is an Interference Belt - Failure at Neglected 90k Interval…",
"3.0L 3VZ-E V6 Head Gasket Failure (Coolant Loss, White Smoke, Rough Idle) — SSC V06 /…",
"3.0L V6 (3VZ-E) Head Gasket Failure — Toyota Special Service Campaign V06",
"3.4L 5VZ-FE Idle Air Control (IAC) Valve Carbon Fouling — Rough/Surging Idle, Stalling…",
"3.4L 5VZ-FE Knock Sensor & Sub-Harness Failure (P0325/P0330) — Brittle Harness Under…",
"3.4L 5VZ-FE Water Pump Weep Leak — Replace With Timing Belt Service",
"4WD Transfer Case Actuator Seizure from Infrequent Use Preventing 4HI/4LO Engagement",
"4WD Won't Engage — ADD (Automatic Disconnecting Differential) Vacuum Actuator Failure",
"A/C Compressor Failure"
]
},
{
"make":"Toyota",
"model":"Tacoma",
"years":[
2024
],
"existingTitles":[
"12.3-inch Digital Instrument Cluster Goes Blank at Startup (Recall 25V595000 /…",
"1GR-FE 4.0L V6 Cracked Exhaust Manifold Causing Ticking and Exhaust Leak",
"1GR-FE 4.0L V6 Head Gasket Failure on Early 2005-2006 Models (Coolant Loss and Cold-Start…",
"2GR-FKS 3.5L V6 Excessive Oil Consumption (Piston Rings / PCV)",
"2GR-FKS 3.5L V6 front timing chain cover oil leak",
"2GR-FKS 3.5L V6 Oil Leak from Camshaft Housing / Cam Sensor Bolt Holes (TSB T-SB-0073-18)",
"4th Gen 12V Battery Goes Dead / No-Start From Parasitic Drain (2024+)",
"4th Gen OEM Accessory Roof Rack Abnormal Vibration and Wind Noise (TSB T-SB-0016-25)",
"6-Speed Automatic Rough Shifting",
"A/C Musty/Mold Smell"
]
},
{
"make":"Toyota",
"model":"Corolla",
"years":[
2024
],
"existingTitles":[
"A245E 4-speed automatic transmission shift problems at high mileage",
"Air Conditioning Evaporator or Compressor Failure Leading to Weak/No Cooling",
"Airbag Warning Light from Spiral Cable (Clock Spring) Failure",
"Alternator Failure Causing Battery Light and No-Charge (High-Mileage)",
"Auto Stop/Start System Malfunction",
"Blower Motor Resistor Failure Causing Loss of Fan Speeds (HVAC Works Only on High)",
"Catalytic Converter Efficiency Failure Causing P0420 Check Engine Light",
"Clear Coat Peeling / Paint Delamination on Roof, Hood and Trunk",
"Coolant Bypass Valve Failure",
"Corolla Cross Hybrid Brake Actuator Software Defect Reducing Brake Performance in Corners…"
]
},
{
"make":"Toyota",
"model":"Land Cruiser",
"years":[
2024
],
"existingTitles":[
"100 Series Frame Rust and Corrosion",
"12-Volt Battery Drain and No-Start After Short Parking Periods",
"1FZ-FE \"Pesky Heater Hose\" (PHH) coolant leak under the intake",
"1FZ-FE head gasket failure (pre-1998 design)",
"2UZ-FE 4.7L V8 timing belt / water pump 90k service (100-series)",
"3-Speed Transmission: Tall Gearing & Brittle Case",
"AHC (Active Height Control) Suspension Failure",
"Body and frame rust: rear quarter panels, rockers, and frame rails",
"Center Differential Lock Actuator Failure",
"Dashboard Cracking (100-Series)"
]
}
]
},
{
"campaign":"25V595000",
"component":"ELECTRICAL SYSTEM: INSTRUMENT CLUSTER/PANEL",
"summary":"Toyota Motor Engineering & Manufacturing (Toyota) is recalling certain 2023-2024 Toyota Venza, 2023-2025 RAV4 Prime, RAV4, Highlander, GR Corolla, Crown, 2024-2025 Lexus TX, LS, Toyota Tacoma, Grand Highlander, and 2025 Lexus RX, Toyota Crown Signia, Camry, RAV 4 Plug-in Hybrid (PHEV), and 4 Runner vehicles. Due to an error in the instrument panel software at vehicle startup, the instrument panel may fail to display vehicle speed, brake system, and tire pressure warning lights.",
"consequence":"An instrument panel display that does not show critical information can increase the risk of a crash or injury.",
"remedy":"Dealers will update the instrument panel software over-the-air (OTA) for non-PHEV vehicles, free of charge. For PHEV vehicles, dealers will inspect the instrument panel assembly, and either replace it, or update the software, free of charge. Owner letters were mailed December 5, 2025. Additional letters will be sent, anticipated in May 2026. This is a phased recall. Owners may contact Toyota's customer service at 1-800-331-4331. Toyota's numbers for this recall are 25TB08 and 25TA08. Lexus'…",
"unitsAffected":591377,
"models":[
{
"make":"Toyota",
"model":"Crown",
"years":[
2023,
2024,
2025
],
"existingTitles":[
"Excessive Road and Wind Noise for Segment",
"Front Suspension Clunking Over Bumps",
"Hybrid System Software Glitches and Hesitation",
"Hybrid System Warning Lamp / MIL in Freezing Temperatures (TSB T-SB-0085-23)",
"Hybrid Transaxle Shudder/Vibration Under 8 mph (TSB MC-10253240)",
"Inaccurate Load Carrying Capacity Label (Recall 24V548000, FMVSS 110)",
"Infotainment System Freezing and Rebooting",
"Infotainment System Lag and Wireless CarPlay Disconnects",
"Oil Leak From Cylinder Head Cover at Timing Chain Cover Junction (TSB T-TT-0765-24)",
"Rearview Camera Freezes or Goes Blank in Reverse (PVM Software Recall, FMVSS 111)"
]
},
{
"make":"Toyota",
"model":"Highlander",
"years":[
2023,
2024,
2025
],
"existingTitles":[
"1AR-FE 2.7L Four-Cylinder Excessive Oil Consumption (Low-Tension Ring / Carbon Buildup)",
"2.4L 2AZ-FE Head Gasket and Head Bolt Thread Failure",
"2GR-FE V6 Excessive Oil Consumption",
"2GR-FE V6 Oil Leak (Timing Cover and Oil Cooler Line)",
"2GR-FE Valve Cover Gasket & Spark-Plug Tube Seal Oil Leak (Oil-Fouled Coils / Misfire)",
"2GR-FE VVT-i Oil Supply Hose Rupture — Sudden Oil Loss (Service Campaign LSC 90K)",
"8-Speed Automatic Transmission Shudder and Hesitation",
"A/C Condenser Leak / Thin-Fin Failure (Rock-Strike Refrigerant Loss)",
"AC Blower Motor Failure and Resistor Burnout",
"AWD Rear Differential Coupling & Bearing Noise (Whine/Growl That Rises With Speed)"
]
},
{
"make":"Toyota",
"model":"RAV4",
"years":[
2023,
2024,
2025
],
"existingTitles":[
"2001-2002 RAV4 Back-Door Rattle at Spare-Tire Reinforcement Spot Welds - NV005-04",
"2001-2003 RAV4 Harsh Shift or MIL From ECM Condition - T-SB-0156-10 Rev2",
"2006-2007 RAV4 Front-Suspension Thump/Knock Over Bumps - SU009-07",
"2006-2008 2AZ-FE Oil-Consumption Inspection and Repair Program",
"2006-2008 RAV4 Steering Clunk/Pop/Knock While Turning - T-SB-0318-08",
"2006-2008 RAV4 V6 No. 2 Idler Pulley Squeak - T-SB-0056-09",
"2006-2009 2GR-FE VVT-i Oil-Hose Limited Service Campaign History",
"2006-2010 RAV4 Accelerator-Pedal Safety Recalls - 11V-113 and 10V-017",
"2006-2010 RAV4 Liquid Fuel in EVAP System - T-SB-0046-10",
"2006-2010 RAV4 Loose Sunvisor Mount - T-SB-0068-10"
]
},
{
"make":"Toyota",
"model":"Venza",
"years":[
2023,
2024
],
"existingTitles":[
"2AR-FE Engine Excessive Oil Consumption",
"Exhaust Heat Shield Rattle",
"Hybrid Fuel Tank Underfills and Inaccurate Fuel Gauge",
"Hybrid System Inverter and 12V Battery Issues",
"Infotainment Reboots / Goes Blank (TSB T-SB-0055-22)",
"Rear Turn Signal Failure from Water Intrusion (Recall 22V033)",
"Spontaneous Windshield Cracking and Chipping",
"Star Gaze Fixed Panoramic Roof Spontaneous Cracking and Burn/Spark Marks",
"Valve Cover Gasket Oil Leak",
"Vehicle Stability Control Fails to Re-Enable on Restart (Recall 22V239)"
]
},
{
"make":"Toyota",
"model":"GR Corolla",
"years":[
2023,
2024,
2025
],
"existingTitles":[
"Engine and Transmission Overheating During Track Use",
"Front Limited-Slip Differential Whine and Wear",
"G16E-GTS Head Gasket Seepage Under Hard Use",
"iMT Rev-Match System Interference and Shift Feel",
"Premature Clutch Wear and Slipping Under High Torque"
]
},
{
"make":"Toyota",
"model":"Grand Highlander",
"years":[
2024,
2025
],
"existingTitles":[
"12.3-inch Digital Instrument Panel May Be Blank at Startup (Recall)",
"8-Speed Automatic Harsh Shifting and Torque Converter Shudder",
"Curtain Shield Airbag May Deploy Outside an Open Window (Recall 24V461000)",
"Excessive Wind Noise from A-Pillar and Mirror Area",
"Fuel Tank Will Not Fill to Rated Capacity (Premature Nozzle Shut-Off)",
"Hybrid Max (T24A-FTS) Cold-Start Camshaft Timing DTC P05CE / Check Engine Light",
"Inaccurate Load Carrying Capacity Modification Label (Recall 24V548000)",
"Infotainment Software Bugs and Display Issues",
"Panoramic Roof and Headliner Rattle",
"Phantom Automatic Emergency Braking Activation"
]
},
{
"make":"Lexus",
"model":"LS",
"years":[
2024,
2025
],
"existingTitles":[
"Air Suspension Strut and Compressor Failure",
"Infotainment System Lag and Touchpad Frustration",
"Noncompliant Aftermarket Corner/Bumper Lamp Assemblies",
"Self-Leveling Headlight System Failure",
"Side/Curtain/Knee Airbag Inflator Defect"
]
},
{
"make":"Lexus",
"model":"RX",
"years":[
2025
],
"existingTitles":[
"12V Battery Discharge and No-Start from Telematics/DCM Staying Awake",
"8-Speed Automatic Transmission Shudder",
"AC Evaporator Core Refrigerant Leak",
"Brake Pedal Vibration/Grinding and Extended Stopping Feel from ABS Actuator Software Logic",
"Dashboard Melting and Sticky Surface",
"Excessive Oil Consumption 2GR Engine",
"Front Camera / Millimeter-Wave Radar Misalignment Causing PCS and Driver-Assist Warnings",
"Infotainment Screen Freezing, Wireless CarPlay/Android Auto Dropouts, and Rebooting Head…",
"Power Steering Pressure Hose Leak and Pump Whine from Fluid Loss",
"Rear Main Seal / Engine Oil Leak at Timing Cover and Lower Engine Seals"
]
},
{
"make":"Toyota",
"model":"4Runner",
"years":[
2025
],
"existingTitles":[
"1GR-FE V6 Head Gasket Failure with External Coolant Leak at Rear of Cylinder Head",
"2UZ-FE 4.7L V8 Timing Belt is an Interference Belt - Failure at Neglected 90k Interval…",
"3.0L 3VZ-E V6 Head Gasket Failure (Coolant Loss, White Smoke, Rough Idle) — SSC V06 /…",
"3.0L V6 (3VZ-E) Head Gasket Failure — Toyota Special Service Campaign V06",
"3.4L 5VZ-FE Idle Air Control (IAC) Valve Carbon Fouling — Rough/Surging Idle, Stalling…",
"3.4L 5VZ-FE Knock Sensor & Sub-Harness Failure (P0325/P0330) — Brittle Harness Under…",
"3.4L 5VZ-FE Water Pump Weep Leak — Replace With Timing Belt Service",
"4WD Transfer Case Actuator Seizure from Infrequent Use Preventing 4HI/4LO Engagement",
"4WD Won't Engage — ADD (Automatic Disconnecting Differential) Vacuum Actuator Failure",
"A/C Compressor Failure"
]
},
{
"make":"Toyota",
"model":"Camry",
"years":[
2025
],
"existingTitles":[
"1992-1993 3VZ-FE Overheating and Head-Gasket Failure — Owner Reports",
"1996 Camry Power Window Moves Slowly, Grinds, or Stops — Owner Report",
"1MZ-FE V6 Engine Oil Gelation Customer Support Program",
"2003-2006 Steering Intermediate-Shaft Noise - T-SB-0296-08",
"2005-2007 VVT-i Actuator DTC Verification - T-SB-0269-10",
"2007 Camry A/C Compressor Noise or Loss of Cooling — Owner Report",
"2007 V6 In-Gear Vibration and Engine-Mount Inspection — Owner Report",
"2007-2010 2GR-FE P0138/P0158/P0606 Diagnostic Gates - T-SB-0001-10",
"2007-2011 Sticky, Shiny or Cracked Dashboard - T-SB-0039-15",
"2007-2017 HVAC Odor Maintenance - T-SB-0010-20"
]
}
]
},
{
"campaign":"25V744000",
"component":"BACK OVER PREVENTION:DISPLAY FUNCTION",
"summary":"Toyota Motor Engineering & Manufacturing (Toyota) is recalling certain 2022-2026 Toyota, Lexus, and Subaru Solterra vehicles equipped with a Panoramic View Monitor (PVM) system. Please see the recall report for a complete list of models. A software error may cause the rearview camera to freeze or display a blank screen when the vehicle is in reverse. As such, these vehicles fail to comply with the requirements of Federal Motor Vehicle Safety Standard (FMVSS) number 111, \"Rear Visibility.\"",
"consequence":"A rearview camera that fails to display an image can reduce the driver's view behind the vehicle, increasing the risk of a crash.",
"remedy":"Dealers will update the parking assist software, free of charge. Owner letters were mailed January 2, 2026. Owners may contact Toyota's customer service at 1-800-331-4331. Toyota's numbers for this recall are 25TB13 and 25LB06. Subaru's number for this recall is WRE25.",
"unitsAffected":1024407,
"models":[
{
"make":"Lexus",
"model":"ES",
"years":[
2023,
2024,
2025
],
"existingTitles":[
"Brake Actuator Buzzing and Grinding Noise",
"Dashboard Melting and Sticky Surface",
"Excessive Oil Consumption 2GR-FE Engine",
"Hybrid Battery Pack Degradation"
]
},
{
"make":"Lexus",
"model":"GX",
"years":[
2024,
2025
],
"existingTitles":[
"AHC (Adaptive Hydraulic) Suspension Leak",
"Center Differential Lock Actuator Failure",
"Secondary Air Injection Pump Failure",
"Secondary Air Injection System Failure Causing Limp Mode on GX 460",
"Takata Passenger Airbag Inflator May Rupture (Recall 16V340000)",
"Uneven Ride Height — Vehicle Sits Lower on the Right Side",
"Vehicle Stability Control Calibration Allows Sideways Skid and Rollover Risk (Recall…"
]
},
{
"make":"Lexus",
"model":"LC",
"years":[
2024,
2025
],
"existingTitles":[
"Infotainment System Lag and Touchpad Issues"
]
},
{
"make":"Lexus",
"model":"LS",
"years":[
2023,
2024,
2025
],
"existingTitles":[
"Air Suspension Strut and Compressor Failure",
"Infotainment System Lag and Touchpad Frustration",
"Noncompliant Aftermarket Corner/Bumper Lamp Assemblies",
"Self-Leveling Headlight System Failure",
"Side/Curtain/Knee Airbag Inflator Defect"
]
},
{
"make":"Lexus",
"model":"LX",
"years":[
2022,
2023,
2024,
2025
],
"existingTitles":[
"12.3-inch Infotainment / Lexus Interface Screen Freezing, Rebooting, or Going Blank",
"AHC (Active Height Control) Suspension Failure",
"Brake Pedal Vibration / Front Brake Rotor Warping and Premature Brake Pulsation",
"Center Differential Lock Actuator Failure",
"Front Occupant Classification / Airbag Sensor Fault Triggering SRS Warning and Airbag…",
"Power Tailgate / Rear Hatch Fails to Open or Close Properly Due to Latch or Strut/Module…",
"V35A-FTS 3.4L Twin-Turbo V6 Main Bearing / Engine Failure Risk Covered by Toyota-Lexus…"
]
},
{
"make":"Lexus",
"model":"NX",
"years":[
2022,
2023,
2024,
2025
],
"existingTitles":[
"Airbag Pressure and Acceleration Sensor Failure Prevents Deployment (Recall 18V085000)",
"Blocked A-Pillar and Sunroof Drain Tubes Causing Cabin Water Leak",
"CVT Drone and Rubber Band Effect",
"Infotainment System Lag and Touchpad Issues",
"Low-Pressure Fuel Pump Failure Causing Engine Stall (Recall 25V028000)",
"Panoramic View Monitor Rearview Camera Freezes or Goes Blank (Recall 25V744000)",
"Rearview Camera Image Fails to Display in Reverse (Recall 26V162000)",
"Steering Column Spiral Cable Weld Failure Deactivates Driver Airbag (Recall 25V040000)",
"Water Pump Leak on 8AR-FTS Turbo Engine"
]
},
{
"make":"Lexus",
"model":"RX",
"years":[
2023,
2024,
2025,
2026
],
"existingTitles":[
"12V Battery Discharge and No-Start from Telematics/DCM Staying Awake",
"8-Speed Automatic Transmission Shudder",
"AC Evaporator Core Refrigerant Leak",
"Brake Pedal Vibration/Grinding and Extended Stopping Feel from ABS Actuator Software Logic",
"Dashboard Melting and Sticky Surface",
"Excessive Oil Consumption 2GR Engine",
"Front Camera / Millimeter-Wave Radar Misalignment Causing PCS and Driver-Assist Warnings",
"Infotainment Screen Freezing, Wireless CarPlay/Android Auto Dropouts, and Rebooting Head…",
"Power Steering Pressure Hose Leak and Pump Whine from Fluid Loss",
"Rear Main Seal / Engine Oil Leak at Timing Cover and Lower Engine Seals"
]
},
{
"make":"Toyota",
"model":"Crown",
"years":[
2023,
2024,
2025,
2026
],
"existingTitles":[
"Excessive Road and Wind Noise for Segment",
"Front Suspension Clunking Over Bumps",
"Hybrid System Software Glitches and Hesitation",
"Hybrid System Warning Lamp / MIL in Freezing Temperatures (TSB T-SB-0085-23)",
"Hybrid Transaxle Shudder/Vibration Under 8 mph (TSB MC-10253240)",
"Inaccurate Load Carrying Capacity Label (Recall 24V548000, FMVSS 110)",
"Infotainment System Freezing and Rebooting",
"Infotainment System Lag and Wireless CarPlay Disconnects",
"Oil Leak From Cylinder Head Cover at Timing Chain Cover Junction (TSB T-TT-0765-24)",
"Rearview Camera Freezes or Goes Blank in Reverse (PVM Software Recall, FMVSS 111)"
]
},
{
"make":"Toyota",
"model":"Grand Highlander",
"years":[
2024,
2025,
2026
],
"existingTitles":[
"12.3-inch Digital Instrument Panel May Be Blank at Startup (Recall)",
"8-Speed Automatic Harsh Shifting and Torque Converter Shudder",
"Curtain Shield Airbag May Deploy Outside an Open Window (Recall 24V461000)",
"Excessive Wind Noise from A-Pillar and Mirror Area",
"Fuel Tank Will Not Fill to Rated Capacity (Premature Nozzle Shut-Off)",
"Hybrid Max (T24A-FTS) Cold-Start Camshaft Timing DTC P05CE / Check Engine Light",
"Inaccurate Load Carrying Capacity Modification Label (Recall 24V548000)",
"Infotainment Software Bugs and Display Issues",
"Panoramic Roof and Headliner Rattle",
"Phantom Automatic Emergency Braking Activation"
]
},
{
"make":"Toyota",
"model":"Highlander",
"years":[
2023,
2024,
2025
],
"existingTitles":[
"1AR-FE 2.7L Four-Cylinder Excessive Oil Consumption (Low-Tension Ring / Carbon Buildup)",
"2.4L 2AZ-FE Head Gasket and Head Bolt Thread Failure",
"2GR-FE V6 Excessive Oil Consumption",
"2GR-FE V6 Oil Leak (Timing Cover and Oil Cooler Line)",
"2GR-FE Valve Cover Gasket & Spark-Plug Tube Seal Oil Leak (Oil-Fouled Coils / Misfire)",
"2GR-FE VVT-i Oil Supply Hose Rupture — Sudden Oil Loss (Service Campaign LSC 90K)",
"8-Speed Automatic Transmission Shudder and Hesitation",
"A/C Condenser Leak / Thin-Fin Failure (Rock-Strike Refrigerant Loss)",
"AC Blower Motor Failure and Resistor Burnout",
"AWD Rear Differential Coupling & Bearing Noise (Whine/Growl That Rises With Speed)"
]
},
{
"make":"Toyota",
"model":"Mirai",
"years":[
2023,
2024,
2025
],
"existingTitles":[
"Fuel Cell Stack Performance Degradation",
"Fuel Cell System Warning and Sudden Power Loss",
"Hydrogen Refueling Station Availability and Cost Crisis",
"Real-World Range Significantly Below Advertised Figures"
]
},
{
"make":"Toyota",
"model":"Prius",
"years":[
2023,
2024,
2025
],
"existingTitles":[
"12V Auxiliary Battery Drain and Failure",
"1NZ-FXE Head Gasket Failure and EGR Cooler Issues",
"3rd Generation 2ZR-FXE Excessive Oil Consumption",
"Catalytic Converter Theft Vulnerability",
"EGR Valve and Intake Manifold Carbon Buildup",
"Hybrid Battery Pack (HV Battery) Failure",
"Inverter Coolant Pump Failure"
]
},
{
"make":"Toyota",
"model":"RAV4",
"years":[
2023,
2024,
2025
],
"existingTitles":[
"2001-2002 RAV4 Back-Door Rattle at Spare-Tire Reinforcement Spot Welds - NV005-04",
"2001-2003 RAV4 Harsh Shift or MIL From ECM Condition - T-SB-0156-10 Rev2",
"2006-2007 RAV4 Front-Suspension Thump/Knock Over Bumps - SU009-07",
"2006-2008 2AZ-FE Oil-Consumption Inspection and Repair Program",
"2006-2008 RAV4 Steering Clunk/Pop/Knock While Turning - T-SB-0318-08",
"2006-2008 RAV4 V6 No. 2 Idler Pulley Squeak - T-SB-0056-09",
"2006-2009 2GR-FE VVT-i Oil-Hose Limited Service Campaign History",
"2006-2010 RAV4 Accelerator-Pedal Safety Recalls - 11V-113 and 10V-017",
"2006-2010 RAV4 Liquid Fuel in EVAP System - T-SB-0046-10",
"2006-2010 RAV4 Loose Sunvisor Mount - T-SB-0068-10"
]
},
{
"make":"Subaru",
"model":"Solterra",
"years":[
2023,
2024,
2025
],
"existingTitles":[
"12V Auxiliary Battery Drain - Vehicle Won't Power On",
"Charge Port Door Freezes, Sticks, or Fails to Lock/Release",
"DC Fast Charging Failures and Slow Charging Speeds",
"DC Fast Charging Speed Limitation and Thermal Throttling",
"Driver-Side Mirror Vibrates/Flutters at Highway Speed, Blurring the Rearward View (NHTSA…",
"EV System Malfunction / Drive-Start Control Warning and No-Start / Power Loss",
"EyeSight Lane-Centering 'Ping-Pongs' Between Lane Markers",
"EyeSight Phantom Braking / False Pre-Collision Activation",
"Firm/Busy Ride and Excessive Road & Tire Noise",
"Fragile Low-Profile OE Tires With No Spare and a Near-Useless Sealant Mobility Kit"
]
}
]
},
{
"campaign":"26V122000",
"component":"ENGINE AND ENGINE COOLING:EXHAUST SYSTEM:EMISSION CONTROL:GAS RECIRCULATION VALVE (EGR VALVE)",
"summary":"Ford Motor Company (Ford) is recalling certain 2025 Ranger, Lincoln Nautilus, Mustang, Maverick, Explorer, Escape, Lincoln Corsair, Bronco Sport, and Bronco vehicles. The exhaust gas recirculation (EGR) valve may fail, resulting in an unexpected loss of drive power.",
"consequence":"An unexpected loss of drive power increases the risk of a crash.",
"remedy":"Dealers will replace the EGR valves, free of charge. Owner notification letters were mailed July 31, 2026. Owners may contact Ford customer service at 1-866-436-7332. Ford's number for this recall is 26S10. Vehicle Identification Numbers (VINs) involved in this recall became searchable on NHTSA.gov on March 4, 2026.",
"unitsAffected":47804,
"models":[
{
"make":"Ford",
"model":"Mustang",
"years":[
2025
],
"existingTitles":[
"10R80 10-Speed Automatic Harsh Shifting and Hesitation",
"2.3L EcoBoost Head Gasket Failure and Coolant Intrusion",
"2.3L EcoBoost Turbo Wastegate Rattle and P0299 Underboost / Limp Mode",
"2001 Cobra and 2003-2004 Mustang GT/Cobra Manual Transmission Throwout Bearing and Clutch…",
"2005-2010 Smart Junction Box Water Intrusion Causing Wiper, Lighting, and Electrical…",
"2011-2014 3.7L V6 Electric Power Steering Assist Failure",
"289/302 V8 overheating from undersized 2-row radiator",
"3.8L Essex V6 Head Gasket Failure",
"4.0L Cologne V6 Thermostat Housing Cracking and Coolant Leaks",
"4.6L Plastic Intake Manifold Coolant Crossover Cracking and Coolant Leaks"
]
},
{
"make":"Ford",
"model":"Ranger",
"years":[
2025
],
"existingTitles":[
"10-Speed Transmission Shudder/Harsh Shifts",
"2.3L Lima I4 oil pan gasket leak and oil-pump-related knock",
"3.0L Vulcan timing cover coolant leak leading to overheating/cracked heads",
"4.0L SOHC / OHV Waste-Spark Coil Pack Misfire (P0300 Series)",
"A4LD 4-speed automatic transmission failures",
"Auto Start-Stop System Aggressive/Delayed Restart",
"Automatic transmission slips out of Park (safety recall 91V189000)",
"Camshaft synchronizer chirp and failure (3.0L/4.0L OHV V6)",
"Camshaft Synchronizer Chirp and Oil Pump Drive Failure on 3.0L/4.0L V6",
"Cruise Control Deactivation Switch Brake Fluid Leak and Underhood Fire Risk"
]
},
{
"make":"Ford",
"model":"Maverick",
"years":[
2025
],
"existingTitles":[
"12V Battery Drain and Loss of Drive Power - Recall 24S24 + SSM 53087",
"2.0L EcoBoost Cold-Start Hesitation and Bucking at Low Speeds",
"2.5L Hybrid Engine Block/Oil Pan Breach - Underhood Fire Risk (Recall 23S27)",
"8F35 Transmission Shudder/Buck/Jerk Below 35 mph and Output Carrier Bearing Wear (Early…",
"Connected Touch Radio Rear View Camera Image Freeze (Recall 24S59 / 24V684)",
"Engine Block Heater May Crack and Cause Underhood Fire When Plugged In (Recall 25SA4 /…",
"Front Windshield Wiper Motor Failure (Recall 24S51 / NHTSA 24V594)",
"HPCM Software Forces Vehicle into Neutral While Driving (Recall 24S33 / 24V-330)",
"Hybrid Battery Cooling Fan Excessive Noise",
"Hybrid CVT Judder and Hesitation During Acceleration"
]
},
{
"make":"Ford",
"model":"Escape",
"years":[
2025
],
"existingTitles":[
"1.5L EcoBoost Coolant Intrusion into Cylinders - Engine Block Porosity",
"1.5L EcoBoost Cracked Fuel Injector Leaking Fuel Onto Hot Engine Surfaces (Underhood Fire…",
"2.0L EcoBoost Coolant Intrusion - Open-Deck Block Design Failure",
"2.5L Hybrid Engine Block / Oil Pan Breach - Underhood Fire Risk (Recall 23S27)",
"8F35 8-Speed Automatic Transmission Needle-Bearing Failure and Shudder/Buck (Non-Hybrid)",
"ABS Module Brake Fluid Leak and Underhood Fire Risk",
"Automatic Transmission Failure and Loss of Drive",
"AWD Power Transfer Unit (PTU) Overheating, Fluid Leak, and Failure",
"Cruise Control Cable / Throttle Sticking and Unintended Acceleration",
"CVT Transmission Shudder and Jerking (2020+ Hybrid)"
]
},
{
"make":"Ford",
"model":"Bronco Sport",
"years":[
2025
],
"existingTitles":[
"1.5L EcoBoost 3-Cylinder Coolant Loss and Engine Failure",
"1.5L EcoBoost 3-Cylinder Engine Issues — Oil Dilution + Oil Separator + Fuel Injector…",
"8F35 8-Speed Transmission Slip When Hot and P0766 Solenoid Fault",
"ABS Module Internal Leak Causing Increased Brake Pedal Travel (Recall 23S01 / NHTSA…",
"EGR Valve Failure Causing Loss of Drive Power (Recall 26S10 / NHTSA 26V122)",
"Front Lower Control Arm Ball Joint Separation - Do Not Drive Recall",
"Loss of Drive Power Due to 12V Battery Detection Failure (Recall 24S24 / NHTSA 24V267)",
"Panoramic Sunroof Drain Tube Clog Causing Interior Leak",
"Rear Differential Overheating (Badlands AWD)",
"Rear Drive Unit (RDU) Chatter and Shudder During Low-Speed Turns - AWD Models"
]
},
{
"make":"Lincoln",
"model":"Nautilus",
"years":[
2025
],
"existingTitles":[
"2.0L EcoBoost coolant loss / EGR cooler leak — low coolant, white smoke, overheat",
"2.7L EcoBoost cold-start VCT rattle (top-front-cover tick/tap on startup)",
"8F35 8-speed automatic shudder, buck, and jerk under 35 mph",
"Auto Start-Stop malfunction / engine won't auto-restart (weak 12V battery)",
"Both panoramic and center displays go blank while driving (NHTSA recall 25V337 / Ford…",
"Engine block heater overheats while plugged in — fire risk",
"Front brake groan/grunt noise on stopping (rotor material defect)",
"Hybrid 2.0L EcoBoost direct fuel injector failure — broken tips cause engine damage",
"Hybrid pedestrian warning sound fails at low speed (recall 25SA2)",
"Image Processing Module A (IPMA) resets — loss of rearview camera and ADAS"
]
},
{
"make":"Lincoln",
"model":"Corsair",
"years":[
2025
],
"existingTitles":[
"EGR valve failure causing sudden loss of drive power (Recall 26S10)",
"Rear seat belt retractor bolts not properly tightened (Recall 25C68)",
"Rear tail light water intrusion (Recall 25C53)",
"Windshield air bubbles obscure driver visibility (Recall 25C60)"
]
},
{
"make":"Ford",
"model":"Bronco",
"years":[
2025
],
"existingTitles":[
"10-Speed Automatic Transmission Harsh Shifting",
"2.3L EcoBoost Coolant Intrusion and Misfire from Cracked Cylinder Head/Head Gasket Area",
"2.3L EcoBoost Oil Galley Plug Defect",
"2.7L EcoBoost Intake Valve Failure",
"302 V8 Runs Hot in Traffic (Marginal Factory Cooling)",
"7-Speed Manual Transmission Grinding/Scraping Noise",
"Battery Drain and No-Start from Parasitic Electrical Draw",
"Body Rust: Floors, Rockers & Door Posts Rot From the Drip Rails Down",
"Cam Phaser Rattle and Timing Chain Noise on 2.7L/3.0L EcoBoost",
"Door Latch and Window Drop Malfunction Causing Doors Not to Close Properly"
]
}
]
},
{
"campaign":"26V422000",
"component":"SERVICE BRAKES, HYDRAULIC:POWER ASSIST:ELECTRIC:CONTROL MODULE",
"summary":"BMW of North America, LLC (BMW) is recalling certain 2025 Mini Cooper S, Mini Countryman S All4, X2, 2024 Rolls-Royce Spectre, 2023-2025 i7, 7 Series, X7, 2024-2025 i5, 5 Series, 2023-2024 XM, X1, 2024-2025 X6, and X5 vehicles. The integrated brake (IB) system may malfunction and result in a loss of power brake assist or cause the Antilock Brake (ABS) and Dynamic Stability Control (DSC) systems to not function properly.",
"consequence":"A loss of power brake assist can extend the distance required to stop the vehicle. Additionally, malfunctioning ABS and/or DSC systems can cause a loss of vehicle control. Either of these scenarios can increase the risk of a crash.",
"remedy":"The Integrated brake system will be inspected and, if necessary, replaced, free of charge. Owner notification letters are expected to be mailed August 21, 2026. Owners may contact BMW customer service at 1-800-525-7417 or Rolls-Royce customer service at 1-877-877-3735. Vehicle Identification Numbers (VINs) involved in this recall will become searchable on NHTSA.gov beginning August 21, 2026. Vehicles previously repaired under recall 24V739 or 24V104 will need to have the new remedy completed.",
"unitsAffected":428,
"models":[
{
"make":"BMW",
"model":"X1",
"years":[
2023,
2024
],
"existingTitles":[
"Coolant Leaks - Water Pump & Thermostat - F48 X1",
"Front Suspension Bushing & Control Arm Wear - F48 X1",
"Lower-Engine Whine Requires X1 N20 Timing-Chain Diagnosis",
"N20 Timing Chain Guide Failure",
"Oil Filter Housing Gasket Leak",
"Oil Leaks - Valve Cover & Oil Filter Housing - F48 X1",
"Transfer Case Actuator Motor Failure",
"Transfer Case Failure - xDrive Models E84/F48 X1"
]
},
{
"make":"BMW",
"model":"X6",
"years":[
2024,
2025
],
"existingTitles":[
"2024 X6 Integrated Brake System Recall 26V-422",
"Adaptive Drive System Malfunction",
"Air Suspension Compressor & Strut Failure",
"N63 Timing Chain Stretch & Guide Failure (E71/F16 xDrive50i)",
"N63 Turbo Wastegate Rattle (xDrive50i)",
"N63 Valve Stem Seal / Oil Consumption (xDrive50i)",
"N63 Valve Stem Seal Degradation and Oil Burning",
"Rear Differential Bushing Deterioration",
"Transfer Case Actuator Motor Failure (All xDrive Models)"
]
},
{
"make":"BMW",
"model":"XM",
"years":[
2023,
2024
],
"existingTitles":[
"2023 XM Front-Passenger Knee-Airbag Recall 23V-622",
"2023-2024 XM Integrated Brake System Recall 26V-422",
"Harsh Ride Quality and Suspension Stiffness",
"Hybrid Drivetrain Hesitation and Power Delivery Lag"
]
},
{
"make":"BMW",
"model":"X5",
"years":[
2024,
2025
],
"existingTitles":[
"E53 3.0i M54 Valve-Cover Gasket Leak (Confirm the Source)",
"E53 N62 Blue Smoke: Confirm Valve-Stem Seals Before Repair",
"E70 ATC700 Transfer-Case Positioning Motor (Diagnosis Required)",
"E70 N62 Coolant Transfer Pipe Leak (Pressure-Test First)",
"E70 Rear Air-Supply Unit: Diagnose the Self-Leveling System First",
"E70 xDrive35i N55 Electric Coolant Pump (Fault-Confirmed)",
"Early N63 Timing-Chain Wear Check: ISTA Test Before Repair",
"G05 Suspension Warning: Check Faults and Campaigns Before Parts",
"G05/F95 Transfer-Case Shudder: Tires and Fluid Diagnosis First",
"N63 Twin-Turbo V8 Excessive Oil Consumption"
]
},
{
"make":"BMW",
"model":"X2",
"years":[
2025
],
"existingTitles":[
"2018 X2 Crankshaft Sensor Safety Recall 18V-465",
"2019 X2 Steering Tie-Rod Safety Recall 19V-601",
"Aisin 8-Speed Transmission Jerking",
"B48 Oil Filter Housing Gasket Leak/Cracking",
"B48 Timing Chain Tensioner Weakness",
"Front Control Arm Bushing Premature Wear",
"Oil Filter Housing Gasket Leak",
"Valve Cover Gasket Oil Leak"
]
},
{
"make":"BMW",
"model":"X7",
"years":[
2023,
2024,
2025
],
"existingTitles":[
"2023-2025 X7 Integrated Brake System Recall 26V-422",
"48V Mild Hybrid Battery Issues",
"Air Suspension Compressor & Strut Failure (Standard Equipment)",
"Air Suspension Compressor Failure",
"B58 Coolant Expansion Tank Crack",
"B58 Coolant System Failures (xDrive40i)",
"N63TU3 Oil Consumption & Valve Stem Seal Degradation (xDrive50i/M50i/M60i)",
"Panoramic Sunroof Rattle and Creak",
"Panoramic Sunroof Water Leak",
"Premature Tire Wear (Especially 21\"/22\" Wheels)"
]
},
{
"make":"BMW",
"model":"i7",
"years":[
2023,
2024,
2025
],
"existingTitles":[
"Air Suspension Calibration and Sensor Issues",
"G70 i7 ADCAM Assistance-Limit Diagnosis",
"G70 i7 Comfort-Access Faults after Remote Upgrade"
]
},
{
"make":"BMW",
"model":"i5",
"years":[
2024,
2025
],
"existingTitles":[
"12V Auxiliary Battery Drain and Dead Car Syndrome",
"2024 i5 Pedestrian Sound Recall 23V-885",
"2024 i5 Propulsion-Loss Recall 25V-395",
"2024-2025 i5 Integrated-Brake Recall 24V-697",
"2024-2025 i5 Steering-Spindle Recall 24V-714",
"2024-2026 i5 A/C Harness Recall 26V-096",
"Adaptive Suspension Self-Leveling Calibration Errors",
"DC Fast-Charge Throttling and Loud Cooling Fans on Repeated Sessions",
"Early-Production G60 i5 Condensation-Drain Drum Noise",
"iDrive 8.5 Software Bugs and EV System Errors"
]
},
{
"make":"MINI",
"model":"Cooper S",
"years":[
2025
],
"existingTitles":[
"Direct Injection Carbon Buildup on Intake Valves",
"High-Pressure Fuel Pump (HPFP) Failure",
"N14/N18 Turbo Engine Timing Chain Catastrophic Failure",
"Premature Clutch and Dual-Mass Flywheel Failure",
"Turbocharger Oil Feed Line Leak and Turbo Failure"
]
}
]
}
]

const CITATION = {
  type: 'object', additionalProperties: false,
  properties: { type: { type: 'string' }, title: { type: 'string' }, url: { type: 'string' } },
  required: ['type', 'title', 'url'],
}

const DISCOVER_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    issues: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          make: { type: 'string' },
          model: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          solution: { type: 'string' },
          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
          category: { type: 'string', enum: ['engine', 'transmission', 'drivetrain', 'electrical', 'brakes', 'suspension', 'cooling', 'fuel', 'interior', 'exterior', 'body', 'safety', 'exhaust', 'steering', 'hvac', 'emissions', 'other'] },
          years: { type: 'array', items: { type: 'integer' } },
          symptoms: { type: 'array', items: { type: 'string' } },
          dtcCodes: { type: 'array', items: { type: 'string' } },
          citations: { type: 'array', items: CITATION },
          skipped: { type: 'boolean' },
          skipReason: { type: 'string' },
        },
        required: ['make', 'model', 'title', 'description', 'solution', 'severity', 'category', 'years', 'symptoms', 'dtcCodes', 'citations'],
      },
    },
  },
  required: ['issues'],
}

const VERDICT_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    matchesSource: { type: 'boolean' },
    yearsCorrect: { type: 'boolean' },
    noInventedFacts: { type: 'boolean' },
    isDuplicate: { type: 'boolean' },
    confidence: { type: 'number' },
    reason: { type: 'string' },
  },
  required: ['matchesSource', 'yearsCorrect', 'noInventedFacts', 'isDuplicate', 'confidence', 'reason'],
}

function discoverPrompt(t) {
  return [
    `You are writing known-issue entries for a car-repair site, from an official NHTSA recall record.`,
    ``,
    `=== NHTSA RECALL ${t.campaign} ===`,
    `Component: ${t.component}`,
    `Units affected: ${t.unitsAffected ?? '(not stated)'}`,
    `SUMMARY: ${t.summary}`,
    `CONSEQUENCE: ${t.consequence}`,
    `REMEDY: ${t.remedy}`,
    ``,
    `NHTSA says this campaign covers the following vehicles, which our database does NOT yet document it on. Write ONE entry for EACH:`,
    t.models.map((m) => `  - ${m.make} ${m.model} — NHTSA lists model years: ${m.years.join(', ')}\n      already on this model (do not duplicate): ${m.existingTitles.length ? m.existingTitles.join(' | ') : '(none)'}`).join('\n'),
    ``,
    `RULES — these are strict:`,
    `  * Use ONLY facts contained in the recall record above. Do NOT add causes, mileages, costs, symptoms, or engine codes that are not stated or directly implied by it. If you do not know, leave it out.`,
    `  * The "units affected" figure is CAMPAIGN-WIDE across every vehicle in the recall. You may cite it as such, but do NOT split it per model, do NOT infer how many of THIS vehicle were affected, and do NOT reason about which model the campaign "targeted". If you mention it at all, say plainly that it covers the whole campaign.`,
    `  * "years" must be exactly the model years NHTSA lists for THAT vehicle above — not the campaign's full range across all vehicles.`,
    `  * Write each entry for ITS specific vehicle. Name the vehicle naturally in the title and description. Do NOT emit the same paragraph 14 times with the name swapped — an owner of one of these cars should recognise their own vehicle. Vary structure and emphasis genuinely.`,
    `  * "solution" must be the recall REMEDY, phrased usefully for an owner (it is free at a dealer; say what the dealer does; mention checking the VIN at nhtsa.gov/recalls).`,
    `  * "severity": high if the consequence involves crash, fire, injury or loss of control; otherwise medium; low only for labelling/documentation defects.`,
    `  * "symptoms": only what an owner would actually notice, drawn from the record. A defect with no owner-visible symptom (e.g. an incorrect label) should have an empty or near-empty list — do not invent symptoms.`,
    `  * "citations": exactly one, type "recall", url "https://www.nhtsa.gov/recalls?nhtsaId=${t.campaign}", title naming the campaign and vehicle.`,
    `  * If one of the listed vehicles is genuinely a poor fit (e.g. our model name maps to a different vehicle than NHTSA means), set skipped=true with a skipReason instead of forcing an entry.`,
    ``,
    `Return one object per vehicle listed. Respond ONLY via the StructuredOutput tool.`,
  ].join('\n')
}

function verifyPrompt(t, issue) {
  const m = t.models.find((x) => x.make === issue.make && x.model === issue.model)
  return [
    `You are a skeptical fact-checker verifying a known-issue entry that was written FROM an official NHTSA recall record. Your job is to catch invented facts and wrong year ranges.`,
    ``,
    `=== SOURCE OF TRUTH: NHTSA RECALL ${t.campaign} ===`,
    `Component: ${t.component}`,
    `Units affected (campaign-wide, across ALL vehicles in it): ${t.unitsAffected ?? '(not stated)'}`,
    `SUMMARY: ${t.summary}`,
    `CONSEQUENCE: ${t.consequence}`,
    `REMEDY: ${t.remedy}`,
    `NHTSA lists these model years for the ${issue.make} ${issue.model}: ${m ? m.years.join(', ') : '(unknown)'}`,
    ``,
    `=== THE ENTRY UNDER REVIEW ===`,
    `Vehicle: ${issue.make} ${issue.model}`,
    `Title: ${issue.title}`,
    `Description: ${issue.description}`,
    `Solution: ${issue.solution}`,
    `Years claimed: ${(issue.years || []).join(', ')}`,
    `Symptoms: ${(issue.symptoms || []).join('; ') || '(none)'}`,
    ``,
    `Already in our database for this vehicle: ${m && m.existingTitles.length ? m.existingTitles.join(' | ') : '(none)'}`,
    ``,
    `You may fetch https://www.nhtsa.gov/recalls?nhtsaId=${t.campaign} to confirm, but the record above IS the authoritative text.`,
    ``,
    `Check:`,
    `  1. matchesSource — does the entry describe THIS defect and THIS remedy, without contradicting the record?`,
    `  2. yearsCorrect — are the claimed years exactly the ones NHTSA lists for THIS vehicle (not the campaign's whole span)?`,
    `  3. noInventedFacts — does it add any cause, symptom, mileage, cost, part number or engine code NOT in the record? Any invention means false.`,
    `  4. isDuplicate — is this substantively an entry we already have for this vehicle?`,
    ``,
    `Return matchesSource, yearsCorrect, noInventedFacts, isDuplicate, confidence 0-1, and a one-sentence reason.`,
  ].join('\n')
}

log(`Recall propagation batch 1: ${TARGETS.length} campaigns, ${TARGETS.reduce((s, t) => s + t.models.length, 0)} model-gaps`)

const perCampaign = await pipeline(
  TARGETS,
  (t) => agent(discoverPrompt(t), { label: `recall:${t.campaign}`, phase: 'Discover', schema: DISCOVER_SCHEMA })
    .then((d) => ({ t, issues: (d && Array.isArray(d.issues)) ? d.issues.filter((i) => !i.skipped) : [] })),
  (disc) => {
    const { t, issues } = disc
    if (!issues.length) return { campaign: t.campaign, found: 0, confirmed: [] }
    return parallel(issues.map((i) => () =>
      agent(verifyPrompt(t, i), { label: `verify:${i.make} ${i.model}`, phase: 'Verify', schema: VERDICT_SCHEMA })
        .then((v) => {
          if (!v) return null
          if (!v.matchesSource || !v.yearsCorrect || !v.noInventedFacts || v.isDuplicate) return null
          if ((v.confidence ?? 0) < 0.7) return null
          if (!Array.isArray(i.citations) || !i.citations.length) return null
          return { ...i, _verdictConfidence: v.confidence, _verdictReason: v.reason, _campaign: t.campaign }
        })
    )).then((arr) => ({ campaign: t.campaign, found: issues.length, confirmed: arr.filter(Boolean) }))
  }
)

const confirmed = []
const stats = {}
let totalFound = 0
for (const r of perCampaign.filter(Boolean)) {
  totalFound += r.found
  stats[r.campaign] = { found: r.found, confirmed: r.confirmed.length }
  for (const c of r.confirmed) confirmed.push(c)
}
for (const [k, v] of Object.entries(stats)) log(`${k}: ${v.confirmed}/${v.found} confirmed`)
log(`TOTAL: ${confirmed.length} confirmed of ${totalFound}`)

return { result: { confirmed, stats: { campaigns: TARGETS.length, found: totalFound, confirmed: confirmed.length, perCampaign: stats } } }
