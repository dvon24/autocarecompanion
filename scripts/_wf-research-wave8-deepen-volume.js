/**
 * RESEARCH WAVE 8 - DEEPENING HIGH-VOLUME NAMEPLATES.
 *
 * The thesis CHANGED from waves 6-7, because the lever moved. Those waves hunted "thin" nameplates
 * (<=8 published issues). That population is now exhausted: only 7 priority-make nameplates remain
 * in the 3-9 band, and all 7 are brand-new halo models (M4 CS, XM, Blazer EV, EX30, Prologue) with
 * almost no owner history - precisely the population where invention risk is HIGHEST and traffic
 * is lowest. Researching those would trade evidence quality for a rounding error in volume.
 *
 * So wave 8 DEEPENS instead. Memory records that the ~8-issues-per-model ceiling was a PROMPT cap,
 * not a real ceiling - a deep dive returns 3-4x. These 12 are high-volume workhorses sitting at
 * 11-16 documented issues while the top-15 US sellers average 56, and every one has a large,
 * active owner community that has been logging failures for years.
 *
 *   Telluride 14  Maverick 16  Santa Fe 14  Atlas 15  Acadia 16  Seltos 16
 *   Sequoia 12    Ascent 12    Maxima 15    MX-5 15   Bronco Sport 14  Soul 11
 *
 * Because these are DEEP targets rather than empty ones, the exclusion list matters far more than
 * in wave 7 - the top few failures of a Telluride are already documented, so an unguarded agent
 * would rediscover them. Every existing title is passed in and the verifier gates on isDuplicate.
 *
 * Carries the wave-3/4/5/6/7 prompt fixes: owner communities named first, no aggregator named,
 * >=1 non-aggregator citation gated via hasNonAggregatorSource, raw api.nhtsa.gov banned as a
 * citation, and the per-model generation traps flagged in the notes.
 */
export const meta = {
  name: 'research-wave8-deepen-volume',
  description: 'Wave-8: deepen 12 high-volume nameplates covered at 11-16 issues vs a 56 average. Forum-weighted discover + adversarial verify',
  phases: [
    { title: 'Discover' },
    { title: 'Verify' },
  ],
}

const EXCLUSIONS = [
  {
    "make": "Kia",
    "model": "Telluride",
    "existingTitles": [
      "8-Speed Automatic Torque-Converter Shudder and Re-Acceleration Hesitation",
      "A/C Compressor Failure / No Cold Air",
      "Door Belt Molding Delamination / Detachment (Recall SC347)",
      "Engine Valve Spring Fracture / Loss of Motive Power (3.8L V6, Recall SC296)",
      "Front Power Seat Motor Overheating / Fire Risk",
      "Headliner Sagging Near Panoramic Sunroof",
      "Incorrect Spare Tire Impairing ABS and Traction Control (Recall SC355)",
      "Infotainment / UVO Touchscreen Freezing and Random Reboot",
      "Intermediate Shaft / Driveshaft Disengagement (Rollaway)",
      "Oil Dilution from Short Trip Driving (3.8L V6)",
      "Paint Bubbling at Hood and Roof Seams",
      "Premature Windshield Cracking",
      "Third Row Seat Latch Jamming",
      "Tow Hitch Wiring Harness Module Fire Risk"
    ],
    "yearsCovered": [
      2020,
      2021,
      2022,
      2023,
      2024,
      2025
    ]
  },
  {
    "make": "Ford",
    "model": "Maverick",
    "existingTitles": [
      "12V Battery Drain and Loss of Drive Power - Recall 24S24 + SSM 53087",
      "2.0L EcoBoost Cold-Start Hesitation and Bucking at Low Speeds",
      "2.5L Hybrid Engine Block/Oil Pan Breach - Underhood Fire Risk (Recall 23S27)",
      "8F35 Transmission Shudder/Buck/Jerk Below 35 mph and Output Carrier Bearing Wear (Early 2022 Builds)",
      "Connected Touch Radio Rear View Camera Image Freeze (Recall 24S59 / 24V684)",
      "Engine Block Heater May Crack and Cause Underhood Fire When Plugged In (Recall 25SA4 / 25V685)",
      "Front Windshield Wiper Motor Failure (Recall 24S51 / NHTSA 24V594)",
      "HPCM Software Forces Vehicle into Neutral While Driving (Recall 24S33 / 24V-330)",
      "Hybrid Battery Cooling Fan Excessive Noise",
      "Hybrid CVT Judder and Hesitation During Acceleration",
      "Hybrid eCVT Transmission Shudder and Delayed Engagement",
      "Integrated Park Module (IPM) Fails to Lock Transmission in Park \u2014 Rollaway Risk",
      "Rear Window Seal Water Leak Into Cab",
      "Recall 26S10: EGR Valve Failure Can Cut Drive Power on 2025 Maverick",
      "SYNC 3 Infotainment Screen Freezing and Black Screen",
      "Truck Bed Flexing and Creaking Noise"
    ],
    "yearsCovered": [
      2022,
      2023,
      2024,
      2025,
      2026
    ]
  },
  {
    "make": "Hyundai",
    "model": "Santa Fe",
    "existingTitles": [
      "8-Speed Wet Dual-Clutch (DCT) TCU Failure \u2014 Rollaway Risk and Rough Shifting",
      "ABS/HECU Module Electrical Short Causing Engine Compartment Fire",
      "Clear Coat / White Paint Delamination and Peeling",
      "CVVT Actuator / Oil Control Valve Failure",
      "Excessive Oil Consumption - 2.4L GDI Engine",
      "Panoramic Sunroof Drain Clog",
      "Panoramic Sunroof Spontaneous Shattering",
      "Premature Alternator Failure",
      "Rear Subframe Corrosion",
      "Steering Column Intermediate Shaft Clunk",
      "Theta II Engine Seizure / Recall",
      "Theta II GDI Connecting Rod Bearing Failure and Engine Seizure",
      "Tow Hitch Harness Water Intrusion Causing Electrical Short and Fire",
      "Transfer Case / PTU Fluid Leak and Whine"
    ],
    "yearsCovered": [
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
    "make": "Volkswagen",
    "model": "Atlas",
    "existingTitles": [
      "12V Battery Drain and No-Start Linked to Start-Stop / Parasitic Draw",
      "2.0T EA888 Intake Valve Carbon Buildup Causing Cold-Start Misfires",
      "3.6L VR6 Water Pump and Thermostat Housing Coolant Leak",
      "8-Speed Automatic Transmission Rough Shifting and Shudder",
      "Engine Compartment Fuse-Box Relay Defect Causing Inadvertent Horn / Starter Activation (Recall 21V-616)",
      "Front Assist / AEB Phantom Braking - NHTSA Engineering Analysis EA24004 (2019 Atlas)",
      "Front Door Wiring Harness Fretting Corrosion Causing Unexpected Braking and Electrical Faults (Recall 22V-152 / 97GF)",
      "High-Pressure Fuel Pump Failure",
      "Infotainment eMMC Memory Defect Can Blank the Rearview Camera (NHTSA 22V514000)",
      "Infotainment Screen Freezing and Rebooting",
      "Panoramic Sunroof Spontaneous Cracking",
      "Rear A/C Blower Motor Failure",
      "Transmission Shudder (8-Speed Automatic)",
      "VR6 3.6L Timing Chain Stretch and Rattle",
      "Water Intrusion into Taillight and Rear Cargo Area"
    ],
    "yearsCovered": [
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
    "make": "GMC",
    "model": "Acadia",
    "existingTitles": [
      "\"Shift to Park\" Message With No-Shutdown / Door-Lock Lockout and Battery Drain",
      "2009 Acadia Shift Cable Clip Not Fully Engaged \u2014 Recall 09V073000",
      "3.6L V6 Internal Water Pump Failure and Coolant Leak",
      "3.6L V6 Timing Chain Stretch and Premature Failure",
      "9T65 9-Speed Transmission Harsh Shifts and Hesitation",
      "Electric Power Steering (EPAS) Failure and Loss of Assist",
      "Front Brake Caliper Piston Seal Leak Reducing Braking Performance (Recall 16V802 / GM 16096)",
      "Fuel Pump Mixing-Tube Burr Causing Engine Stall at Low Fuel (Recall 20V446 / GM N202314760)",
      "Heated Washer Module Fire Risk \u2014 Module Removed Under Recall 10V240000",
      "Heated Wiper Washer Fluid System Fire Recall (08V441) \u2014 2007-2008 Acadia",
      "Incorrect Transmission Sun Gear Causing Driver-Side Half-Shaft Disengagement / Rollaway (Recall N222389310)",
      "Infotainment System Lockup, Black Screen and Random Reboots (2nd-Gen IO/IOR Head Unit)",
      "Recall 21V422: Improperly Seated Fuel Supply Lines Can Leak (Fire Risk)",
      "Start/Stop Transmission Accumulator Missing Bolts - Fluid Leak, Loss of Propulsion and Fire Risk (Recall 20V668 / N202313440)",
      "Surround Vision Rearview Camera Coaxial Cable Crimp Failure - Black/Lost Backup Image (Recall 22V709 / N222378380)",
      "Surround Vision Rearview Camera Failure From Improperly Crimped Coaxial Cable (Recall 22V709000)"
    ],
    "yearsCovered": [
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
    "make": "Kia",
    "model": "Seltos",
    "existingTitles": [
      "1.6L Turbo 7-Speed Dry DCT Overheating, Shudder and Hesitation",
      "4WD ECU Water Intrusion Under Driver's Seat \u2014 AWD Warning Light and Loss of All-Wheel Drive",
      "AVN 5.0 Wide Head Unit Freezing and Apple CarPlay / Android Auto Dropouts",
      "AWD Transfer Case Oil Seal Leak and Overheating When the Compact Spare Is Fitted (SC242)",
      "CVT Hesitation and Jerking Under Load",
      "EPS Warning Light with DTC C160404 \u2014 Electric Power Steering Control Unit Self-Test Fault",
      "Front Strut Bearing and Upper Spring Pad Failure \u2014 Creak/Pop When Turning the Wheel",
      "Idle Stop & Go Oil Pump Overheating",
      "Instrument Cluster Goes Blank on Startup",
      "LED Headlight / DRL / Fog Lamp Internal Condensation",
      "Missing Engine Immobilizer \u2014 \"Kia Boys\" USB Theft Vulnerability",
      "Piston Oil Ring Defect and Engine Damage",
      "Rear Seat Latch and Folding-Seat Rattle \u2014 Knocking From the Cargo Area Over Bumps",
      "Side Curtain Airbag Inadvertent Deployment (Recall 23V830 / SC289)",
      "Stalling and Fire Hazard on Unrepaired / Still-Symptomatic 2021-2023 2.0L Vehicles",
      "Thin Clear Coat and Premature Paint Chipping on Hood, Fenders and Roof"
    ],
    "yearsCovered": [
      2021,
      2022,
      2023,
      2024,
      2025
    ]
  },
  {
    "make": "Toyota",
    "model": "Sequoia",
    "existingTitles": [
      "3UR-FE 5.7L V8 Cam Tower / Timing Cover Oil Leak (FIPG Sealant Failure)",
      "AB60E 6-Speed Torque Converter Lockup Shudder (TSB TC018-07)",
      "Exhaust Manifold Cracking (4.7L 2UZ-FE V8)",
      "Frame Rust and Structural Corrosion",
      "i-FORCE MAX Hybrid Cooling System Issues",
      "Rear Air Suspension Compressor and Air Spring Failure",
      "Rear Liftgate Strut Failure (Hatch Won't Stay Open)",
      "Rearview Camera Green/Black Screen Freeze (Recall, Oct 2025)",
      "Secondary Air Injection Pump Failure (3UR-FE/i-FORCE)",
      "Secondary Air Injection System Failure (2UZ-FE)",
      "Tow Hitch Cover Detachment from Rear Bumper (Recall, Sep 2024)",
      "Transmission Neutral Creep / Unintended Forward Movement (Recall 24V125)"
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
      2020,
      2021,
      2022,
      2023,
      2024,
      2025
    ]
  },
  {
    "make": "Subaru",
    "model": "Ascent",
    "existingTitles": [
      "A/C Condenser Leak from Road Debris",
      "CVT Transmission Hesitation and Harsh Engagement",
      "CVT Valve Body Failure and Transmission Warning",
      "Denso Low-Pressure Fuel Pump Impeller Failure (Recall 21V-587 / WRG-21)",
      "Driveshaft Center Support Bolts Can Loosen and Disconnect Front of Driveshaft (Recall 23V647 / WRN-23)",
      "FA24F PCV Hose Oil/Fuel/Hot-Rubber Odor Under Hood (TSB 11-204-23)",
      "Fuel Pump Impeller Failure - Recall WRK-22 / NHTSA 20V-701",
      "Open Tailgate Drains 12V Battery in Hours (Body Integrated Unit Stays Awake)",
      "Parasitic Battery Drain - Dead Battery After Sitting",
      "Spontaneously Cracking Windshield (Class-Action Settlement Coverage)",
      "TR690 CVT Chain Slip and Chain Guide Breakage (Recall WRK-21 / NHTSA 21V-955)",
      "Windshield Spontaneous Cracking"
    ],
    "yearsCovered": [
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
    "make": "Nissan",
    "model": "Maxima",
    "existingTitles": [
      "4-Speed Automatic Transmission Wear / Failure (RE4F04A)",
      "Catalytic Converter Premature Failure (Bank 1)",
      "Crank/Cam Position Sensor Failure (No-Start, Random Stalling)",
      "CVT Belt Slip at High Mileage",
      "CVT Transmission Shudder and Failure (Jatco CVT8)",
      "Dashboard Cracking and Bubbling",
      "Distributor Oil Leak / Cap & Rotor Contamination (Failed O-Ring, VG30 3rd Gen)",
      "EGR Passage / EGR Temperature Sensor Tube Carbon Clogging (P0400)",
      "Engine / Motor Mount Deterioration (Idle Vibration & Clunk)",
      "Front Suspension Clunk (Strut Mount and Stabilizer Links)",
      "Ignition Coil Failure (VQ35DE)",
      "Power Steering Rack Seal Leak and Pump Failure",
      "Repeated Fuel Injector Leaks / Electrical Failure (VG30 3rd Gen)",
      "Steering Column Clunk and Intermediate Shaft Wear",
      "VQ35DE Excessive Oil Consumption"
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
      2023
    ]
  },
  {
    "make": "Mazda",
    "model": "MX-5 Miata",
    "existingTitles": [
      "Cam/Crank Angle Sensor (CAS) O-ring oil leak on 1.8L engines",
      "Convertible soft-top plastic rear window cracking, hazing, and zipper tear-out",
      "Crankshaft Position Sensor Failure (NB)",
      "Differential Whine (ND)",
      "Electric Power Steering (EPS) Failure and Warning Light (NC)",
      "Fuel filler pipe non-return valve sticking / fuel spit-back (1999 NB - NHTSA recall 00V032000)",
      "Mazda Connect Infotainment USB and Bluetooth Connectivity Issues (ND)",
      "Overdue timing belt / water pump service (age-related, both engines)",
      "Radiator Coolant Overflow and Cracked Upper Tank (NB)",
      "Rear Main Seal Oil Leak",
      "Rocker panel and front frame-rail rust (rear of rockers / behind front wheels)",
      "Short Nose Crank Keyway Failure (NA 1.6L)",
      "Short-nose crankshaft / keyway failure on 1990-early 1991 1.6 (\"the Miata crank problem\")",
      "Soft Top Wear and Rear Window Delamination",
      "Timing Belt and Water Pump Failure (NA 1.6L/1.8L)"
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
    "make": "Ford",
    "model": "Bronco Sport",
    "existingTitles": [
      "1.5L EcoBoost 3-Cylinder Coolant Loss and Engine Failure",
      "1.5L EcoBoost 3-Cylinder Engine Issues \u2014 Oil Dilution + Oil Separator + Fuel Injector (Recalls 22S21 + Injector)",
      "2025 Bronco Sport Engine Block Heater Overheat Recall (25S52 / NHTSA 25V343000)",
      "8F35 8-Speed Transmission Slip When Hot and P0766 Solenoid Fault",
      "ABS Module Internal Leak Causing Increased Brake Pedal Travel (Recall 23S01 / NHTSA 23V021)",
      "EGR Valve Failure Causing Loss of Drive Power (Recall 26S10 / NHTSA 26V122)",
      "Front Lower Control Arm Ball Joint Separation - Do Not Drive Recall",
      "Loss of Drive Power Due to 12V Battery Detection Failure (Recall 24S24 / NHTSA 24V267)",
      "Panoramic Sunroof Drain Tube Clog Causing Interior Leak",
      "Rear Differential Overheating (Badlands AWD)",
      "Rear Drive Unit (RDU) Chatter and Shudder During Low-Speed Turns - AWD Models",
      "SYNC 3 Software Instability - Black Screen, Lost Settings, and Blank Backup Camera (Recall 25S72 / NHTSA 25V442 + CSP 24B47)",
      "Transmission Hesitation and Delayed Engagement From Stop",
      "Windshield Stress Cracking Without Impact"
    ],
    "yearsCovered": [
      2021,
      2022,
      2023,
      2024,
      2025,
      2026
    ]
  },
  {
    "make": "Kia",
    "model": "Soul",
    "existingTitles": [
      "7-Speed Dual-Clutch (DCT) Judder and Premature Clutch Failure",
      "ABS/HECU Module Brake-Fluid Leak Causing Engine Compartment Fire",
      "Catalytic Converter Overheating and Engine Piston Damage",
      "Electric Motor Bearing Noise (Soul EV)",
      "Motor-Driven Power Steering (MDPS) Flexible Coupling Noise",
      "Panoramic Sunroof Spontaneous Shattering",
      "Piston Oil Ring Defect and Excessive Oil Consumption",
      "Recall 23V531000: Electric Oil Pump Controller May Overheat and Cause a Fire (2023 Soul)",
      "Recall 25V099000 (Kia SC336): Improperly Manufactured Piston Oil Rings Can Destroy the Engine",
      "Side Curtain Air Bags Can Deploy Unexpectedly (Recall 23V830000)",
      "Steering Pinion Gear Separation (Loss of Steering)"
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
      2023
    ]
  }
]

const TARGETS = [
  { make: 'Kia',        model: 'Telluride',    yearsHint: '2020-2025', note: 'ON platform, 3.8 Lambda II GDI V6 with the 8-speed A8TR1. Huge US seller. Known themes: windshield stress cracks, trailer-hitch harness water intrusion and the 2024 fire recall, ICCU-adjacent electrical gremlins, sunroof water leaks, and 2020-21 piston-ring oil consumption. Deep target - the headline failures are already documented, so go past them.', forums: 'tellurideownersclub.com, kiatellurideforum.com, r/KiaTelluride, r/kia' },
  { make: 'Ford',       model: 'Maverick',     yearsHint: '2022-2026', note: 'C2 unibody pickup. 2.5 hybrid (HF45 eCVT) and 2.0 EcoBoost (8F35). Recurring: rear-brake and parking-brake actuator faults, 12V battery drain, HVAC blend-door, the 2024 hybrid rear-camera and rear-suspension recalls, and BlueCruise/SYNC4 software faults. Very high volume for 16 documented issues.', forums: 'mavericktruckclub.com, fordmaverickforum.com, r/FordMaverick, r/Ford' },
  { make: 'Hyundai',    model: 'Santa Fe',     yearsHint: '2007-2025', note: 'CM 2007-2012, DM 2013-2018, TM 2019-2023, MX5 2024+. SPANS THE THETA II GDI ERA - the 2.4 Theta II rod-bearing failure, engine-fire recalls and the ABS/HECU brake-fluid fire recalls are the defining chapter, but the DM/TM 2.0T and the 3.3 Lambda have their own distinct failures. Tag to the exact engine.', forums: 'hyundai-forums.com, santafeforums.com, r/Hyundai' },
  { make: 'Volkswagen', model: 'Atlas',        yearsHint: '2018-2025', note: 'MQB, 3.6 VR6 FSI and 2.0T EA888 Gen3, 8-speed AQ450. Quarterly-priority make (3 of 22 models covered). Recurring: water leaks into the footwell from sunroof drains, 12V electrical and start-stop faults, panoramic-roof and door-latch complaints, EA888 water pump and PCV. Cross Sport shares the platform - keep them distinct if the failure differs.', forums: 'vwatlasforum.com, atlasownersclub.com, vwvortex.com, r/VWAtlas, r/Volkswagen' },
  { make: 'GMC',        model: 'Acadia',       yearsHint: '2007-2025', note: 'Lambda 2007-2016 (3.6 LLT/LFX, 6T70 - timing chain stretch, water pump, and the power-steering and transmission wave-plate failures) and C1 2017-2023 (2.5 LCV, 3.6 LGX, 9T65) then 2024+. The Lambda-era failures are shared with Traverse/Enclave/Outlook - verify Acadia-specific coverage rather than assuming carryover.', forums: 'acadiaforum.net, gmcacadiaforum.com, gm-trucks.com, r/GMC' },
  { make: 'Kia',        model: 'Seltos',       yearsHint: '2021-2025', note: 'SP2, 2.0 Nu MPI (IVT) and 1.6T Gamma II (7DCT). The 1.6T Gamma II piston-ring oil-consumption and the 2023 Kia/Hyundai engine-fire and tow-hitch recalls are live topics; the 7DCT has its own shudder and clutch complaints distinct from the IVT. Two very different powertrains under one nameplate.', forums: 'kiaseltosforum.com, seltosforums.com, r/KiaSeltos, r/kia' },
  { make: 'Toyota',     model: 'Sequoia',      yearsHint: '2001-2025', note: 'XK30/40 2001-2007 (2UZ-FE - the secondary air injection system and rusted frame recalls), XK60 2008-2022 (3UR-FE, cam tower oil leak, exhaust manifold), XK80 2023+ (i-FORCE MAX 3.4TT V35A hybrid, subject of the 2024-25 V35A engine debris recall). Three distinct trucks - do not carry issues across generations. Quarterly-priority make.', forums: 'toyotanation.com, tundras.com, sequoiaforum.com, r/ToyotaTundra, r/Toyota' },
  { make: 'Subaru',     model: 'Ascent',       yearsHint: '2019-2025', note: 'SGP platform, FA24F 2.4 turbo with the TR690 Lineartronic CVT. Launch-year 2019 had multiple recalls (fuel pump, PCV valve turbo failure, improperly welded brackets). Recurring: battery drain and parasitic draw, Starlink infotainment faults, CVT torque-converter shudder, oil consumption. Only 12 documented issues on a 6-year-old high-volume 3-row.', forums: 'subaruascentforum.com, ascentforums.com, nasioc.com, r/SubaruAscent, r/subaru' },
  { make: 'Nissan',     model: 'Maxima',       yearsHint: '1995-2023', note: 'A32/A33 (VQ30DE), A34 2004-2008, A35 2009-2014, A36 2016-2023 (VQ35DE with the Jatco CVT8 family). The CVT and its extended warranty dominate A35/A36 reports; the earlier VQ cars have timing-chain, precat and motor-mount failures instead. Quarterly-priority make. Tag to the exact chassis code.', forums: 'maxima.org, thenewmaxima.com, nissanforums.com, r/Maxima, r/Nissan' },
  { make: 'Mazda',      model: 'MX-5 Miata',   yearsHint: '1990-2025', note: 'NA 1990-1997, NB 1999-2005, NC 2006-2015, ND 2016+. Enormous and unusually rigorous enthusiast community with decades of documented failures - rear main seal and crank-nose keyway wear on the NA/NB, NC valve-stem-seal oil consumption and short-shifter issues, ND 2016-2018 clutch-slave and SkyActiv-G 2.0 timing-chain complaints. Rust is chassis-specific, not universal.', forums: 'miata.net, mx5nutz.com, miataturbo.net, r/Miata' },
  { make: 'Ford',       model: 'Bronco Sport', yearsHint: '2021-2026', note: 'C2 platform (Escape-based, NOT the body-on-frame Bronco - do not carry Bronco issues here). 1.5 EcoBoost 3-cyl and 2.0 EcoBoost 4-cyl, 8F35. Multiple fire-risk and fuel-injector recalls (2022-2024), 12V battery drain, rear-camera and SYNC faults, and the 1.5L 3-cylinder has its own distinct complaints from the 2.0.', forums: 'broncosportforum.com, bronco6g.com, r/BroncoSport, r/Ford' },
  { make: 'Kia',        model: 'Soul',         yearsHint: '2010-2023', note: 'AM 2010-2013, PS 2014-2019 (the 1.6 Gamma GDI and 2.0 Nu GDI - covered by the Theta/Gamma engine-fire and rod-bearing recall program), SK3 2020-2023 (2.0 Nu with IVT). Recurring: engine seizure and the knock-sensor detection-system software campaign, catalytic-converter theft, steering-coupler clunk, and A/C evaporator failures.', forums: 'kiasoulforums.com, soulforums.com, kia-forums.com, r/KiaSoul, r/kia' },
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

log(`Wave 8: ${TARGETS.length} high-volume nameplates under-covered vs fleet size`)

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

