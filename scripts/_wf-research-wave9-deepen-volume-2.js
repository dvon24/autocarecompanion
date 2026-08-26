/**
 * RESEARCH WAVE 9 - DEEPENING HIGH-VOLUME NAMEPLATES, ROUND 2.
 *
 * Same thesis as wave 8, which worked: the "thin nameplate" population is exhausted, so deepen the
 * high-volume workhorses instead. These 12 sit at 11-15 documented issues while the top-15 US
 * sellers average 56, and every one has a large, long-lived owner community.
 *
 *   X5 15  X3 12  C-Class 15  GLC 11  RX 14  MDX 12
 *   Impreza 13  Titan 13  Optima 14  Terrain 15  Golf 15  Charger 12
 *
 * Covers four quarterly-priority makes (BMW x2, Mercedes-Benz x2, Subaru, Volkswagen, Nissan) plus
 * high-volume Lexus / Acura / Kia / GMC / Dodge.
 *
 * Deep targets, so the exclusion list does the heavy lifting: the headline failures of an X5 or an
 * MDX are already documented, and an unguarded agent would simply rediscover them. Every existing
 * title is passed in and the verifier gates on isDuplicate. Wave 8 confirmed only 38% for exactly
 * this reason - that low pass rate is the gate working, not the wave failing.
 *
 * Carries every prompt fix from waves 3-8: owner communities named first, no aggregator named,
 * >=1 non-aggregator citation gated via hasNonAggregatorSource, raw api.nhtsa.gov banned as a
 * citation, and per-target engine/generation traps flagged in the notes. Several targets here span
 * multiple unrelated engines under one nameplate (N63 vs N55 X5; EJ vs FB Impreza; Pentastar vs
 * Hemi Charger; gas Titan vs Cummins Titan XD) and the notes say so explicitly.
 */
export const meta = {
  name: 'research-wave9-deepen-volume-2',
  description: 'Wave-9: deepen 12 high-volume nameplates covered at 11-15 issues vs a 56 average. Forum-weighted discover + adversarial verify',
  phases: [
    { title: 'Discover' },
    { title: 'Verify' },
  ],
}

const EXCLUSIONS = [
  {
    "make": "BMW",
    "model": "X5",
    "existingTitles": [
      "2024-2025 X5 Integrated Brake System May Malfunction — Recall 24V104000",
      "2024-2025 X5 Integrated Brake System Recall 26V-422",
      "E53 3.0i M54 Valve-Cover Gasket Leak (Confirm the Source)",
      "E53 N62 Blue Smoke: Confirm Valve-Stem Seals Before Repair",
      "E70 ATC700 Transfer-Case Positioning Motor (Diagnosis Required)",
      "E70 N62 Coolant Transfer Pipe Leak (Pressure-Test First)",
      "E70 Rear Air-Supply Unit: Diagnose the Self-Leveling System First",
      "E70 xDrive35i N55 Electric Coolant Pump (Fault-Confirmed)",
      "Early N63 Timing-Chain Wear Check: ISTA Test Before Repair",
      "G05 Suspension Warning: Check Faults and Campaigns Before Parts",
      "G05/F95 Transfer-Case Shudder: Tires and Fluid Diagnosis First",
      "N63 Twin-Turbo V8 Excessive Oil Consumption",
      "N63/N63TU Low Boost or Turbo Rattle: Diagnose Vacuum Control First",
      "Possible Intake-Valve Deposits on Direct-Injected Gasoline Engines",
      "VANOS Adjustment-Unit Bolt Recall 23V-707 (E70 Inline-Six)"
    ],
    "yearsCovered": [
      2003,
      2004,
      2005,
      2006,
      2007,
      2008,
      2009,
      2010,
      2011,
      2012,
      2013,
      2014,
      2015,
      2016,
      2017,
      2018,
      2019,
      2020,
      2021,
      2022,
      2023,
      2024,
      2025,
      2026
    ]
  },
  {
    "make": "BMW",
    "model": "X3",
    "existingTitles": [
      "Coolant Expansion Tank Cracking",
      "Electric Water Pump Failure",
      "Electric Water Pump Failure (N52, N20 Engines)",
      "Lower-Engine Whine Requires X3 N20 Timing-Chain Diagnosis",
      "N20 Timing Chain Guide Failure",
      "Oil Filter Housing Gasket Leak (N52, N20 Engines)",
      "Transfer Case Actuator Motor Failure",
      "Transfer Case Actuator Motor Failure (xDrive AWD System)",
      "Turbocharger Wastegate Rattle (N55, N20, B58 Engines)",
      "Valve Cover Gasket Oil Leak",
      "Valve Cover Gasket Oil Leaks (M54, N52 Engines)",
      "VANOS Solenoid Failure (N52, N55 Engines)"
    ],
    "yearsCovered": [
      2004,
      2005,
      2006,
      2007,
      2008,
      2009,
      2010,
      2011,
      2012,
      2013,
      2014,
      2015,
      2016,
      2017,
      2018,
      2019,
      2020,
      2021,
      2022,
      2023,
      2024,
      2025,
      2026
    ]
  },
  {
    "make": "Mercedes-Benz",
    "model": "C-Class",
    "existingTitles": [
      "48V Mild-Hybrid / Integrated Starter-Generator Failure Causing No-Start and Power Loss",
      "722.6 5G-Tronic conductor plate failure (limp mode, stuck in 2nd gear)",
      "7G-Tronic Valve Body Failure",
      "Biodegradable engine wiring harness insulation breakdown (M104/M111/M119)",
      "Cam Adjuster Solenoid Failure",
      "Door Lock Actuator Failure",
      "Driver Assistance Sensor Misalignment Causing 'Inoperative' Warnings and Disabled Features",
      "Front Seat Occupant Classification / Passenger Airbag Warning Faults",
      "HVAC blend door / duo-valve failure (no heat, split-temperature climate)",
      "M274 Turbo Wastegate Rattle",
      "MBUX / Instrument Cluster Black Screen, Rebooting, or No Rear Camera Image",
      "Premature Front Brake Squeal, Judder, and Rotor/Pads Replacement",
      "SAM Module Failure",
      "Sunroof Drain Clog Water Damage",
      "W204 Rear Subframe Cracking"
    ],
    "yearsCovered": [
      1994,
      1995,
      1996,
      1997,
      1998,
      1999,
      2000,
      2001,
      2002,
      2003,
      2004,
      2005,
      2006,
      2007,
      2008,
      2009,
      2010,
      2011,
      2012,
      2013,
      2014,
      2015,
      2016,
      2017,
      2018,
      2019,
      2020,
      2021,
      2022,
      2023,
      2024,
      2025
    ]
  },
  {
    "make": "Mercedes-Benz",
    "model": "GLC",
    "existingTitles": [
      "48V Mild-Hybrid (EQ Boost) Integrated Starter-Generator Failure",
      "9G-Tronic Harsh Shifting",
      "Air Suspension Compressor Failure",
      "Cold-Start Camshaft Adjuster (Magnet/Solenoid) Rattle",
      "Crankcase Vent (PCV) Valve Failure with Engine Harness Oil Contamination",
      "Diesel Timing Chain Tensioner Seal Oil Leak and Chain Stretch (OM651)",
      "Fuel Pump Shutdown Causing Loss of Drive Power (Recall)",
      "MBUX Infotainment System Freeze",
      "Panoramic Sunroof Creak and Rattle",
      "Rear Brake Squeal and Premature Rear Pad Wear",
      "Steering Coupling Bolt Loosening / Loss of Steering Control (Recall)"
    ],
    "yearsCovered": [
      2016,
      2017,
      2018,
      2019,
      2020,
      2021,
      2022,
      2023,
      2024,
      2025,
      2026
    ]
  },
  {
    "make": "Lexus",
    "model": "RX",
    "existingTitles": [
      "12V Battery Discharge and No-Start from Telematics/DCM Staying Awake",
      "8-Speed Automatic Transmission Shudder",
      "AC Evaporator Core Refrigerant Leak",
      "Backup Camera Image Freezes or Disappears When Shifting to Reverse (Recall 25V744000)",
      "Brake Pedal Vibration/Grinding and Extended Stopping Feel from ABS Actuator Software Logic",
      "Dashboard Melting and Sticky Surface",
      "Excessive Oil Consumption 2GR Engine",
      "Front Camera / Millimeter-Wave Radar Misalignment Causing PCS and Driver-Assist Warnings",
      "Infotainment Screen Freezing, Wireless CarPlay/Android Auto Dropouts, and Rebooting Head Unit",
      "Power Steering Pressure Hose Leak and Pump Whine from Fluid Loss",
      "Rear Main Seal / Engine Oil Leak at Timing Cover and Lower Engine Seals",
      "Steering Intermediate Shaft Clunk and Loose Steering Feel Over Bumps",
      "U140E/U151E Automatic Transmission Failure from Burned Planetary Gearset and Delayed Engagement",
      "Water Pump Premature Failure"
    ],
    "yearsCovered": [
      2000,
      2001,
      2002,
      2003,
      2004,
      2005,
      2006,
      2007,
      2008,
      2009,
      2010,
      2011,
      2012,
      2013,
      2014,
      2015,
      2016,
      2017,
      2018,
      2019,
      2020,
      2021,
      2022,
      2023,
      2024,
      2025,
      2026
    ]
  },
  {
    "make": "Acura",
    "model": "MDX",
    "existingTitles": [
      "Auto Idle-Stop Failure to Restart (2016-2020 MDX)",
      "Dual-Screen Infotainment Freezes, Slow Boots and Reboots (2014-2016 MDX)",
      "First-Year 2001 MDX Included in NADI Driver Airbag Inflator Recall (NHTSA 20V026000)",
      "Fuel Pump Impeller Deformation Causing Stall (NHTSA Recall 23V-858)",
      "Infotainment System Random Reboots",
      "J37 Oil Consumption, Spark Plug Fouling, and Active Motor Mount Failure",
      "Power Steering High-Pressure Hose Cracking and Rack 'Morning Sickness' — Generation-Specific Fitment",
      "Replacement Driver Air Bag Inflator May Rupture or Underinflate (Recall 20V027000)",
      "Timing Belt Tensioner and Water Pump Failure",
      "Torque Converter Lock-Up Clutch Judder at 20-60 mph (2012-2015 MDX)",
      "ZF 9-Speed Automatic Transmission Shudder and Harsh Shifting",
      "ZF 9-Speed Transmission Hesitation, Hard Shifts and Stalling (2016-2019 MDX)"
    ],
    "yearsCovered": [
      2001,
      2002,
      2003,
      2004,
      2005,
      2006,
      2007,
      2008,
      2009,
      2010,
      2011,
      2012,
      2013,
      2014,
      2015,
      2016,
      2017,
      2018,
      2019,
      2020
    ]
  },
  {
    "make": "Subaru",
    "model": "Impreza",
    "existingTitles": [
      "2023 Impreza Driveshaft Center Support Bolt Loosening - Safety Recall 23V647",
      "Automatic (4EAT) AWD Torque Bind / Duty C Solenoid Failure",
      "CVT Transmission Failure and Harsh Engagement",
      "Distributor Cap, Rotor, and Ignition Moisture Misfire (SOHC EJ18/EJ22)",
      "EJ253 Head Gasket Failure (External Leak)",
      "Front (and Rear) Wheel Bearing / Hub Failure",
      "Interference-Engine Timing Belt Neglect (DOHC EJ25 / 1997+ SOHC)",
      "Phase I EJ25D DOHC 2.5L Internal Head Gasket Failure",
      "Premature Wheel Bearing Failure",
      "Rear Coil Spring Fracture",
      "Rear Trailing Arm Bushing Corrosion and Failure",
      "Rear Wheel Arch, Rocker Panel, and Subframe Rust",
      "Windshield Stress Cracking Near EyeSight Cameras"
    ],
    "yearsCovered": [
      1993,
      1994,
      1995,
      1996,
      1997,
      1998,
      1999,
      2000,
      2001,
      2002,
      2003,
      2004,
      2005,
      2006,
      2007,
      2008,
      2009,
      2010,
      2011,
      2012,
      2013,
      2014,
      2015,
      2016,
      2017,
      2018,
      2019,
      2020,
      2021,
      2022,
      2023,
      2024
    ]
  },
  {
    "make": "Nissan",
    "model": "Titan",
    "existingTitles": [
      "9-Speed Automatic Transmission Harsh Shifting, Hesitation, and Limp-Mode Behavior",
      "Battery Drain and No-Start from Telematics/Audio Control Unit Staying Awake",
      "Blind Spot Warning / Rear Cross Traffic Alert False Warnings or Inoperative Sensors",
      "ECM Relay Inside the IPDM Can Cause the Titan to Stall (Recall 10V517000)",
      "Exhaust Manifold Bolt Failure and Leak",
      "Front Brake Caliper Seizing",
      "Fuel Sending Unit Inaccuracy and Failure",
      "Parking Pawl Rollaway Recall on Trucks Not Fully Shifting Into Park",
      "Rear Axle Seal Leak",
      "Rear Differential Whine and Bearing Failure",
      "Tailgate Opening or Unlocking Unexpectedly While Driving",
      "Timing Chain Guide Failure (VK56DE Engine)",
      "Upper Radiator Hose Sudden Failure"
    ],
    "yearsCovered": [
      2004,
      2005,
      2006,
      2007,
      2008,
      2009,
      2010,
      2011,
      2012,
      2013,
      2014,
      2015,
      2016,
      2017,
      2018,
      2019,
      2020,
      2021,
      2022,
      2023,
      2024
    ]
  },
  {
    "make": "Kia",
    "model": "Optima",
    "existingTitles": [
      "7-Speed DCT Transmission Clutch Judder",
      "Airbag Control Unit Electrical Overstress",
      "Automatic Transmission Speed Sensor and Shift Failure",
      "Brake Switch Failure Causing Inoperative Brake Lamps and Shift Issues",
      "Crankshaft Position Sensor Failure Causing Stall or No-Start",
      "Electrical System Voltage Loss and Accessory Failure",
      "Electronic Steering Lock Module Failure",
      "Excessive Oil Consumption",
      "Front Subframe Corrosion and Suspension Collapse",
      "Headlight Dimming and Lighting Circuit Malfunction",
      "Hybrid High-Voltage Battery Degradation",
      "Power Door Lock and Door Latch Failure",
      "Recall 23V652000: Optima HECU Short Circuit Can Start an Engine Bay Fire",
      "Theta II Engine Seizure and Failure"
    ],
    "yearsCovered": [
      2001,
      2002,
      2003,
      2004,
      2008,
      2009,
      2010,
      2011,
      2012,
      2013,
      2014,
      2015,
      2016,
      2017,
      2018,
      2019,
      2020
    ]
  },
  {
    "make": "GMC",
    "model": "Terrain",
    "existingTitles": [
      "1.5L Turbo PCV System Failure and Coolant/Oil Intrusion",
      "2.4L I4 Excessive Oil Consumption and Piston Ring Failure",
      "6T40/6T45 6-Speed Transmission Shudder and Harsh Shifts",
      "Door Striker Fracture Allowing a Door to Open While Driving (Recall 23V869000)",
      "Ecotec 2.4L Timing Chain and Tensioner Failure",
      "Electric Power Steering Sticking / Increased Steering Effort",
      "Electronic Shifter Fault - Vehicle Stuck in Park / \"Shift to Park\" Message",
      "Engine-Driven Brake Vacuum Pump Failure - Sudden Loss of Power Brake Assist (Hard Pedal)",
      "High-Pressure Fuel Pump Failure Causing Engine Stall (Recall)",
      "HVAC Blend Door Actuator Failure (Clicking Noise, No Temperature Control)",
      "IntelliLink Infotainment Freezing/Rebooting and Backup Camera Black Screen",
      "Start/Stop Transmission Accumulator Endcap Missing Bolts - Fluid Leak & Loss of Propulsion (Recall)",
      "Throttle Body / Throttle Position Sensor Failure - 'Reduced Engine Power' Warning",
      "Water Pump Failure and Coolant Leak",
      "Windshield Wiper Module Ball Joint Corrosion Causing Inoperative Wipers (Recall 16V582000)"
    ],
    "yearsCovered": [
      2010,
      2011,
      2012,
      2013,
      2014,
      2015,
      2016,
      2017,
      2018,
      2019,
      2020,
      2021,
      2022,
      2023,
      2024,
      2025
    ]
  },
  {
    "make": "Volkswagen",
    "model": "Golf",
    "existingTitles": [
      "1.9 TDI VNT turbo actuator sticking and MAF sensor failure (power loss / limp mode)",
      "Central-locking vacuum pump failure (won't lock/unlock, pump runs continuously)",
      "Contaminated Clock Spring Can Cut Power to the Driver's Airbag - Recall 15V483000",
      "Direct Injection Carbon Buildup on Intake Valves",
      "DSG (DQ250/DQ381) Mechatronic Unit and Clutch Pack Failure",
      "EA888 Gen1/Gen2 Timing Chain Tensioner Failure",
      "EA888 Plastic Water Pump and Thermostat Housing Failure",
      "Early MK7 IHI Turbocharger Failure",
      "MK4 Power Window Regulator Failure",
      "MK7 2.0T Water Pump Failure",
      "MK8 Infotainment System Bugs and Rearview Camera Recall",
      "Plastic coolant flange / 'blue' temperature sensor leaking at rear of head",
      "Structural rust at sills, wheel arches, jacking points and front suspension turrets",
      "VR6 coil pack casing cracking causing misfires (worse in wet weather)",
      "VR6 timing chain guide and tensioner failure ('marbles in a can' rattle)"
    ],
    "yearsCovered": [
      1990,
      1991,
      1992,
      1993,
      1994,
      1995,
      1996,
      1997,
      1998,
      1999,
      2000,
      2001,
      2002,
      2003,
      2004,
      2005,
      2006,
      2008,
      2009,
      2010,
      2011,
      2012,
      2013,
      2014,
      2015,
      2016,
      2017,
      2018,
      2019,
      2020,
      2021,
      2022,
      2023,
      2024
    ]
  },
  {
    "make": "Dodge",
    "model": "Charger",
    "existingTitles": [
      "2015 Charger Radio Software Vulnerability Allows Remote Vehicle Modification (15V461000)",
      "2024+ Charger Daytona EV/SIXPACK Software and Bricking Issues",
      "42RLE 4-Speed Transmission Solenoid and Connector Failure",
      "8-Speed (8HP) Transmission Harsh Shifts",
      "Alternator/Charging System Failure",
      "Driveshaft / U-Joint Premature Failure",
      "EVAP Leak Detection (ESIM/NVLD) Module Failure Triggers False P0455/P0456 Codes",
      "Front Suspension Premature Wear (LX/LD Platform)",
      "HEMI MDS Lifter Tick",
      "Pentastar V6 Rocker Arm/Lifter Tick",
      "Uconnect Infotainment System Issues",
      "W5A580 (NAG1) 5-Speed Transmission Water Contamination"
    ],
    "yearsCovered": [
      2006,
      2007,
      2008,
      2009,
      2010,
      2011,
      2012,
      2013,
      2014,
      2015,
      2016,
      2017,
      2018,
      2019,
      2020,
      2021,
      2022,
      2023,
      2024,
      2025
    ]
  }
]

const TARGETS = [
  {
    "make": "BMW",
    "model": "X5",
    "yearsHint": "2000-2025",
    "note": "E53 2000-2006, E70 2007-2013 (N63 twin-turbo launch engine, subject of the Customer Care Package rework; also the N55 and M57 diesel), F15 2014-2018, G05 2019+ (B58, S63 on M variants). Quarterly-priority make (8 of 39 models covered). BMW's best-selling SUV in the US. Tag every issue to the exact engine code - an N63 failure is not an N55 failure.",
    "forums": "xoutpost.com, bimmerfest.com, bimmerpost.com, x5world.com, r/BMW"
  },
  {
    "make": "BMW",
    "model": "X3",
    "yearsHint": "2004-2025",
    "note": "E83 2004-2010 (N52, M54; the notorious transfer-case actuator and rear subframe issues), F25 2011-2017 (N20 timing chain guide, N55), G01 2018-2024 (B46/B48, B58), G45 2025+. Quarterly-priority make. The N20 timing-chain failure is engine-code specific - early N20B20A vs the revised unit are not equally affected.",
    "forums": "bimmerfest.com, bimmerpost.com, xbimmers.com, r/BMW"
  },
  {
    "make": "Mercedes-Benz",
    "model": "C-Class",
    "yearsHint": "2001-2025",
    "note": "W203 2001-2007 (balance-shaft gear wear on M272, SBC brake pump), W204 2008-2014 (M271 timing chain and camshaft adjuster magnets), W205 2015-2021 (M274, OM651 diesel), W206 2022+. Very high volume. Tag to the exact engine - M271 vs M274 vs M276 failures do not carry across.",
    "forums": "benzworld.org, mbworld.org, peachparts.com, r/mercedes_benz"
  },
  {
    "make": "Mercedes-Benz",
    "model": "GLC",
    "yearsHint": "2016-2025",
    "note": "X253 2016-2022 (M274 2.0T, OM654 diesel, 9G-Tronic) and X254 2023+ (M254 with 48V ISG). Mercedes' best-selling SUV. Recurring themes: MBUX/COMAND faults, 48V mild-hybrid and auxiliary-battery complaints, water intrusion, and the 2023 recall population. Keep the X253 and X254 generations distinct - the M254/48V architecture is new.",
    "forums": "mbworld.org, benzworld.org, glcforum.com, r/mercedes_benz"
  },
  {
    "make": "Lexus",
    "model": "RX",
    "yearsHint": "1999-2025",
    "note": "XU10 1999-2003, XU30 2004-2009 (2GR-FE - the rubber oil supply hose recall, VVT-i cam tower leak), AL10 2010-2015, AL20 2016-2022 (2GR-FKS, RX450h hybrid), AL30 2023+ (T24A turbo). The best-selling luxury SUV in the US for two decades. Dashboard melting and infotainment faults recur across generations.",
    "forums": "clublexus.com, lexusownersclub.com, toyotanation.com, r/Lexus"
  },
  {
    "make": "Acura",
    "model": "MDX",
    "yearsHint": "2001-2025",
    "note": "YD1 2001-2006, YD2 2007-2013 (J37 with VCM - the oil consumption and spark plug fouling complaints, plus torque converter judder), YD3 2014-2020 (J35Y with the ZF 9-speed - widely reported harsh shifting and rollaway concerns), YD4 2022+ (J35 turbo/Type S). The 9-speed and VCM issues are the defining chapters.",
    "forums": "acurazine.com, mdxers.org, acura-forums.com, r/Acura"
  },
  {
    "make": "Subaru",
    "model": "Impreza",
    "yearsHint": "1993-2025",
    "note": "GC/GM 1993-2001, GD/GG 2002-2007 (EJ25 head gasket era), GE/GH 2008-2011, GJ/GP 2012-2016 (FB20 - excessive oil consumption class action), GK/GT 2017-2023 (FB20 direct injection), 2024+. Quarterly-priority make. The EJ head-gasket and FB oil-consumption stories are distinct engines - do not merge them. WRX/STI are separate nameplates.",
    "forums": "nasioc.com, subaruforester.org, subaruoutback.org, iclub.com, r/subaru"
  },
  {
    "make": "Nissan",
    "model": "Titan",
    "yearsHint": "2004-2024",
    "note": "A60 2004-2015 (VK56DE - rear axle seal leaks, brake master cylinder, the notorious rusted-out bed and frame complaints) and A61 2017-2024 (VK56VD, plus the 5.0 Cummins V8 diesel in the Titan XD, which has its own distinct failures). Quarterly-priority make. Do not carry a Cummins XD issue onto a gas Titan.",
    "forums": "titantalk.com, clubtitan.org, nissanforums.com, r/NissanTitan"
  },
  {
    "make": "Kia",
    "model": "Optima",
    "yearsHint": "2001-2020",
    "note": "MS 2001-2005, MG 2006-2010, TF 2011-2015 and JF 2016-2020. SPANS THE THETA II GDI ERA - the 2.4 Theta II rod-bearing failure, engine-fire recalls and the KSDS knock-sensor software campaign are the defining chapter, but the 2.0T and the 1.6T/7DCT have their own separate failures. Tag to the exact engine.",
    "forums": "kiaoptimaforums.com, optimaforums.com, kia-forums.com, r/kia"
  },
  {
    "make": "GMC",
    "model": "Terrain",
    "yearsHint": "2010-2025",
    "note": "First gen 2010-2017 (2.4 Ecotec LAF/LEA - heavy oil consumption and timing chain wear, plus the 3.0/3.6 V6) and second gen 2018+ (1.5 LYX and 2.0 LTG turbo, 9T50; the 1.6 diesel early on). Shares the Chevrolet Equinox platform - verify Terrain-specific coverage rather than assuming carryover.",
    "forums": "gmcterrainforum.com, terraintalk.com, gm-trucks.com, r/GMC"
  },
  {
    "make": "Volkswagen",
    "model": "Golf",
    "yearsHint": "1999-2025",
    "note": "Mk4 1999-2006, Mk5 2006-2009, Mk6 2010-2014, Mk7 2015-2021, Mk8 2022+. Quarterly-priority make (3 of 22 models covered). EA888 water pump/thermostat housing and PCV, EA211 timing belt, DSG mechatronic faults, and window regulator failures recur. GTI and R are separate nameplates in this catalog - keep issues that are genuinely Golf-wide here.",
    "forums": "vwvortex.com, golfmk7.com, golfmk6.com, tdiclub.com, r/Volkswagen"
  },
  {
    "make": "Dodge",
    "model": "Charger",
    "yearsHint": "2006-2023",
    "note": "LX 2006-2010 and LD 2011-2023 (3.6 Pentastar - the cylinder-head/rocker failure on early builds, 5.7 Hemi with the lifter/camshaft failure and MDS, 6.4 and supercharged 6.2 on SRT/Hellcat). TIPM electrical failures are a defining Chrysler-era complaint. Tag to the exact engine - a Hemi lifter failure is not a Pentastar issue.",
    "forums": "chargerforums.com, lxforums.com, moparts.org, r/DodgeCharger"
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
    candidates: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          solution: { type: 'string' },
          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
          category: { type: 'string', enum: ['engine', 'transmission', 'drivetrain', 'electrical', 'brakes', 'suspension', 'cooling', 'fuel', 'interior', 'exterior', 'body', 'safety', 'exhaust', 'steering', 'hvac', 'emissions', 'other'] },
          years: { type: 'array', items: { type: 'integer' } },
          trims: { type: 'array', items: { type: 'string' } },
          engines: { type: 'array', items: { type: 'string' } },
          symptoms: { type: 'array', items: { type: 'string' } },
          dtcCodes: { type: 'array', items: { type: 'string' } },
          estimatedCostLow: { type: 'number' },
          estimatedCostHigh: { type: 'number' },
          citations: { type: 'array', items: CITATION },
        },
        required: ['title', 'description', 'solution', 'severity', 'category', 'years', 'symptoms', 'dtcCodes', 'citations'],
      },
    },
  },
  required: ['candidates'],
}

const VERDICT_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    isReal: { type: 'boolean' },
    confidence: { type: 'number' },
    hasLiveCitation: { type: 'boolean' },
    hasNonAggregatorSource: { type: 'boolean' },
    hasOwnerCommunitySource: { type: 'boolean' },
    isDuplicate: { type: 'boolean' },
    reason: { type: 'string' },
  },
  required: ['isReal', 'confidence', 'hasLiveCitation', 'hasNonAggregatorSource', 'hasOwnerCommunitySource', 'isDuplicate', 'reason'],
}

function existingFor(t) {
  const e = EXCLUSIONS.find((x) => x.make === t.make && x.model === t.model)
  return (e && e.existingTitles) || []
}

function discoverPrompt(t) {
  const existing = existingFor(t)
  return [
    `You research REAL, documented known issues for a specific car. Vehicle: ${t.make} ${t.model} (${t.yearsHint}). Context: ${t.note}`,
    ``,
    `This is a US-market vehicle. Your sources, in priority order:`,
    `  1. OWNER COMMUNITIES — go here first and spend real effort: ${t.forums}. This is where the detail lives that never reaches a government summary: exact engine codes, which model years actually fail, what the dealer tried first, what finally fixed it.`,
    `  2. OFFICIAL — NHTSA recalls and complaints, manufacturer TSBs and service bulletins, OEM service documentation.`,
    ``,
    `WE ALREADY HAVE THESE ${existing.length} ISSUES. Do NOT return any of them, and do not return a lightly-reworded restatement of one:`,
    existing.length ? existing.map((s) => `  - ${s}`).join('\n') : '  (none)',
    ``,
    `Use web search to find 6-10 ADDITIONAL well-documented, recurring issues real owners report that are NOT in the list above. Go deeper than the obvious headline failures: cover specific engines, transmissions, model-year ranges, and subsystems (electrical, HVAC, suspension, interior wear, infotainment, charging and high-voltage systems on EVs) that the existing list misses.`,
    ``,
    `For EACH issue provide: title (specific - name the component and the failure mode, not a vague symptom), description (what fails and why), solution (the real fix), severity (high/medium/low), category (one of: engine, transmission, drivetrain, electrical, brakes, suspension, cooling, fuel, interior, exterior, body, safety, exhaust, steering, hvac, emissions, other), years (specific model years affected, integers), trims/engines when the issue is specific to them (use exact codes such as M260, OM651, M276 - an issue on one engine is often absent on another), symptoms[], dtcCodes[] when applicable (real codes only), estimatedCostLow/High in USD when known, and citations[].`,
    ``,
    `CITATION RULES — these are hard requirements, not preferences:`,
    `  * At least ONE citation per issue must be an owner community thread or an official source. An issue supported ONLY by third-party problem-aggregator sites does not qualify.`,
    `  * NEVER cite a raw api.nhtsa.gov endpoint. Those return JSON a human cannot read. Cite the human-readable nhtsa.gov page instead.`,
    `  * Cite ONLY pages you actually found and opened in search results. Do NOT construct or guess a URL from a pattern — fabricated URLs have polluted this database before.`,
    `  * A forum thread that you found in search results counts even if the site blocks automated fetching.`,
    ``,
    `Accuracy over volume: 4 solid issues beat 10 with two invented. A single isolated complaint is an anecdote, not a known issue — look for a recurring pattern across multiple owners. Never invent an issue or a citation. Respond ONLY via the StructuredOutput tool.`,
  ].join('\n')
}

function verifyPrompt(t, c) {
  const existing = existingFor(t)
  return [
    `You are a skeptical automotive fact-checker. DEFAULT TO REFUTING unless the evidence is solid. Vehicle: ${t.make} ${t.model} (${t.yearsHint}).`,
    ``,
    `CLAIM:`,
    `Title: ${c.title}`,
    `Description: ${c.description}`,
    `Years: ${(c.years || []).join(', ')}`,
    `Engines: ${(c.engines || []).join(', ') || '(unspecified)'}`,
    `Cited URLs: ${(c.citations || []).map((x) => x.url).join(' | ') || '(none)'}`,
    ``,
    `ISSUES ALREADY IN OUR DATABASE for this model:`,
    existing.length ? existing.map((s) => `  - ${s}`).join('\n') : '  (none)',
    ``,
    `Use web search to verify:`,
    `(1) Is this a genuine, RECURRING issue for THIS specific model and THESE years - not copied from a platform sibling, a different generation, or a different engine? These vehicles share platforms heavily (GLB/EQB, GLA/CLA, Ioniq 5/EV9 on E-GMP, Grand Cherokee L/WL), so a real problem on one is NOT automatically a problem on this nameplate. A single isolated complaint is an anecdote — refute it as a "known issue" unless multiple independent owners report the same failure.`,
    `(2) Do the cited URLs actually exist, resolve, and support the claim? A URL that 404s is not a live citation. A 403 from a forum that clearly exists DOES count as live.`,
    `(3) Are the model years plausible for this nameplate and powertrain? Several of these vehicles are only 1-3 years old — reject year ranges that predate the model.`,
    `(4) Is this substantively the same problem as one already in our database above (isDuplicate)?`,
    ``,
    `Also classify the sources: hasOwnerCommunitySource (at least one citation is a real owner forum, club, or model-specific community thread), and hasNonAggregatorSource (at least one citation is an owner community OR an official source such as NHTSA/TSB/OEM — as opposed to third-party problem-aggregator sites).`,
    ``,
    `Return: isReal, confidence 0-1, hasLiveCitation, hasNonAggregatorSource, hasOwnerCommunitySource, isDuplicate, and a one-sentence reason. If the citations look fabricated, or you cannot corroborate a recurring pattern, isReal=false.`,
  ].join('\n')
}

log(`Wave 9: ${TARGETS.length} high-volume nameplates under-covered vs fleet size (round 2)`)

const perModel = await pipeline(
  TARGETS,
  (t) => agent(discoverPrompt(t), { label: `discover:${t.make} ${t.model}`, phase: 'Discover', schema: DISCOVER_SCHEMA })
    .then((d) => ({ t, candidates: (d && Array.isArray(d.candidates)) ? d.candidates : [] })),
  (disc) => {
    const { t, candidates } = disc
    if (!candidates.length) return { make: t.make, model: t.model, found: 0, confirmed: [], forumBacked: 0 }
    return parallel(candidates.map((c) => () =>
      agent(verifyPrompt(t, c), { label: `verify:${t.model}`, phase: 'Verify', schema: VERDICT_SCHEMA })
        .then((v) => {
          if (!v) return null
          if (!v.isReal || !v.hasLiveCitation || v.isDuplicate) return null
          if ((v.confidence ?? 0) < 0.7) return null
          if (!v.hasNonAggregatorSource) return null
          if (!Array.isArray(c.citations) || c.citations.length === 0) return null
          return {
            ...c, make: t.make, model: t.model,
            _verdictConfidence: v.confidence,
            _verdictReason: v.reason,
            _hasOwnerCommunitySource: v.hasOwnerCommunitySource,
          }
        })
    )).then((arr) => {
      const ok = arr.filter(Boolean)
      return { make: t.make, model: t.model, found: candidates.length, confirmed: ok, forumBacked: ok.filter((x) => x._hasOwnerCommunitySource).length }
    })
  }
)

const confirmed = []
const perModelStats = {}
let totalFound = 0, totalForumBacked = 0
for (const r of perModel.filter(Boolean)) {
  totalFound += r.found
  totalForumBacked += r.forumBacked
  perModelStats[`${r.make} ${r.model}`] = { found: r.found, confirmed: r.confirmed.length, forumBacked: r.forumBacked }
  for (const c of r.confirmed) confirmed.push(c)
}

for (const [k, v] of Object.entries(perModelStats)) log(`${k}: ${v.confirmed}/${v.found} confirmed (${v.forumBacked} forum-backed)`)
log(`TOTAL: ${confirmed.length} confirmed of ${totalFound} candidates | ${totalForumBacked} forum-backed (${confirmed.length ? Math.round(100 * totalForumBacked / confirmed.length) : 0}%)`)

return { result: { confirmed, stats: { models: TARGETS.length, found: totalFound, confirmed: confirmed.length, forumBacked: totalForumBacked, perModel: perModelStats } } }

