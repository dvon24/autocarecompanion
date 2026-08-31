/**
 * RESEARCH WAVE 18 — DEMAND-DRIVEN THIN NAMEPLATES.
 *
 * GENERATED FILE. Edit scripts/_gen-demand-wave.js and re-run it instead.
 *
 * Every target is a vehicle somebody gave us their email address about, ranked by
 * leads per published issue. Selection is measured demand over measured coverage
 * — not an editor's guess at what is interesting. Nameplates already sitting in
 * pending_review are excluded, so waves cannot overlap each other.
 *
 * Carries the wave-14 body verbatim: same style prompts, same closed category and
 * severity enums (the renderer knows 17 categories and high/medium/low only — a
 * wider enum has previously crashed article pages for 39 models), same EVIDENCE
 * gates and NO numeric confidence gate (self-reported confidence tracks prompt
 * wording, not belief).
 *
 * 'thin'  the low count is a coverage gap, and the prompt says so explicitly.
 * 'new'   nameplates whose earliest documented year is 2020+: forums are thin, so
 *         official sources first — a recall number is a checkable fact, an
 *         invented forum thread is not.
 *
 * DOWNSTREAM: save to data/research-wave18-<date>.json, then
 * _persist-known-issues-run.js -> _promote-pending-review.js -> _check-tonight-dupes.js.
 * Do NOT deploy; hand off to Sol.
 */
export const meta = {
  name: 'research-wave18-demand-driven',
  description: 'Wave-18: 12 thin nameplates chosen by interest-email demand. Style-selected discover prompt + adversarial verify',
  phases: [
    { title: 'Discover' },
    { title: 'Verify' },
  ],
}

const TARGETS = [
  {
    "style": "thin",
    "make": "Mercedes-Benz",
    "model": "GLC",
    "yearsHint": "2016-2026",
    "note": "Only 22 documented issues on this nameplate. 3 interest-email leads asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 12V Board-Net Parasitic Drain from Door Control Modules Leaving X254 GLC Stranded | 48V Mild-Hybrid (EQ Boost) Integrated Starter-Generator Failure | 9G-Tronic Harsh Shifting | Active Brake Assist and 360-Degree Camera False Activations (Phantom Braking) | Air Suspension Compressor Failure | Cold-Start Camshaft Adjuster (Magnet/Solenoid) Rattle | Crankcase Vent (PCV) Valve Failure with Engine Harness Oil Contamination | Diesel Timing Chain Tensioner Seal Oil Leak and Chain Stretch (OM651) | Driver Door Lock Micro-Switch Corrosion Preventing Auto-Park / Parking Brake Engagement (Rollaway Recall 26V481) | Fixed Panoramic Roof Front and Side Trim Panels Debonding and Separating in Motion (Recall 17V715) | Front Lower Spring Control Arm and Thrust Arm Bushing Wear Causing Clunk and Squeak | Fuel Pump Shutdown Causing Loss of Drive Power (Recall) | GLC 350e High-Voltage System Faults and Charging Failures (Plug-In Hybrid Only) | Infotainment Control Unit Reset Blanking the Instrument Cluster While Driving (Recall 26V281) | LED Headlamp Moisture Ingress and Internal Condensation (Recall 22V261 plus Out-of-Recall Complaints) | MBUX Infotainment System Freeze | Panoramic Sunroof Creak and Rattle | Power Tailgate Gas Support Strut Failure Causing the Liftgate to Drop or Slam Shut | Rear Brake Squeal and Premature Rear Pad Wear | SCR / AdBlue System Plausibility Failure Triggering a No-Restart Countdown (OM651 Diesel) | Steering Coupling Bolt Loosening / Loss of Steering Control (Recall) | Turbocharger Wastegate Actuator Diaphragm Rupture Causing Underboost and Limp Mode (M274/M264 2.0T)",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Infiniti",
    "model": "QX60",
    "yearsHint": "2013-2025",
    "note": "Only 8 documented issues on this nameplate. 1 interest-email lead asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: Battery Drain / No-Start from Telematics, Infotainment, or Control Module Sleep Issues | CVT Transmission Failure | Forward Collision Warning / Automatic Emergency Braking False Activation or Unexpected Braking | Front Steering Knuckle / Rear Axle Housing May Be Insufficiently Strong (Recall 21V402000) | Panoramic Moonroof Exploding or Cracking Spontaneously | Power Steering Pump Whine | Rearview Camera Image Blank, Distorted, or Intermittent Due to Infotainment/Display Software | Transmission Judder at Low Speed",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Audi",
    "model": "A7",
    "yearsHint": "2012-2023",
    "note": "Only 8 documented issues on this nameplate. 1 interest-email lead asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 2012-2015 Audi A7 Cold-Start Rattle TSB 2039995/2 | 2019-2020 Audi A7 Starter-Alternator Service Action 27BQ | 2019-2022 Audi A7 Gateway Recall 90V2 / NHTSA 22V861 | 2022 Audi A7 E Battery Recall 93AA / NHTSA 25V080 | Severe Carbon Buildup on Intake Valves (Direct Injection) | Supercharger Clutch and Isolator Failure (S7 3.0T) | Supercharger Nose Cone Bearing Wear | Thermostat Housing Coolant Leak",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Pontiac",
    "model": "Grand Am",
    "yearsHint": "1999-2005",
    "note": "Only 8 documented issues on this nameplate. 1 interest-email lead asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: Front Wheel Hub Bearing Premature and Repeat Failure | Grand Am 3.4L V6 Upper/Lower Intake Gasket Failure | Hazard Warning Switch Failure Disabling Turn Signals (Recall 03V327000) | Ignition Switch Inadvertent Key Rotation — Stall and Airbag Non-Deployment (Recall 14V-400) | In-Tank Fuel Pump Module Failure — Stalling, No-Start, and Erratic Fuel Gauge | Passlock Anti-Theft System False Activation Causing No-Start | Power Window Regulator Cable and Plastic Clip Failure | Premature Front Brake Rotor Warping and Pedal Pulsation",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "MINI",
    "model": "Cooper",
    "yearsHint": "2007-2025",
    "note": "Only 8 documented issues on this nameplate. 1 interest-email lead asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 2025 MINI Cooper — Integrated Brake System Recall 24V104000 | Coolant Expansion Tank Cracking | Electric Power Steering Rack Failure | Electric Thermostat and Water Pump Failure | N12/N16 Timing Chain Tensioner Failure | NHTSA Recall 23V337000: Footwell Electronic Control Module Short-Circuit Fire Risk | Recall 17V222000: Bumper Brake Light Goes Out With Turn Signal On (Clubman) | Valve Cover and VANOS Solenoid Oil Leaks",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Infiniti",
    "model": "QX50",
    "yearsHint": "2014-2026",
    "note": "Only 8 documented issues on this nameplate. 1 interest-email lead asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: CVT Shudder Under Light Acceleration | Improperly Heat-Treated Front Steering Knuckle / Rear Axle Housing (Recall 21V402000) | Infotainment System Lag and Connectivity Issues | Premature Front Lower Control Arm / Compression Rod Bushing Wear Causing Clunks and Tire Wear | Steering Wheel Lock / Ignition No-Start from Electronic Steering Lock Failure | Sunroof Drain / HVAC Evaporator Water Intrusion Causing Wet Carpets and Electrical Faults | Timing Chain / VVEL Rattle and Front Timing Cover Oil Leaks on VQ37VHR | VC-Turbo Engine Oil Consumption",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Mazda",
    "model": "CX-9",
    "yearsHint": "2007-2025",
    "note": "Only 8 documented issues on this nameplate. 1 interest-email lead asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: A/C Evaporator Core Leak and Refrigerant Loss | Power Liftgate Failure | Rear Differential Coupling Failure (AWD) | Timing Chain Stretch and Rattle (2.5L Turbo SkyActiv) | Timing Chain Stretch on 3.7L V6 | Transfer Case Fluid Leak (AWD Models) | Turbocharger Coolant Line Leak | Water Pump and Coolant Crossover Pipe Leak (3.7L V6)",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Genesis",
    "model": "G70",
    "yearsHint": "2019-2026",
    "note": "Only 16 documented issues on this nameplate. 2 interest-email leads asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 3.3T Oil Consumption with Smoke and Fouled Plugs | 8-Speed Automatic Shift Quality Issues | ABS Module Electrical Short Causing Engine-Bay Fire Risk (Recall 21V-161 / 007G) | Electronic Parking Brake (EPB) Actuator Failure — Won't Release or Engage | Front Brake Rotor Warping / Pulsation (Brembo Pad Deposit and Early Warping) | GDI Intake-Valve Carbon Buildup (Misfires, Rough Idle) | Headlight Condensation and Moisture Causing Lighting Failure | High-Pressure Fuel Pump Failure Causing Power Loss (Recall 24V-528 / 023G) | Infotainment System Lag and Crashes | Left Turbocharger Oil Feed Line Leak (Recall 24V-191) | Limited-Slip Differential Chatter Noise | Parasitic Battery Drain / Dead 12V Battery | Power-Folding Mirror Failure (Clicking / Not Folding or Unfolding) | Soft Clear Coat — Easy Chipping, Peeling and Swirl Marks | Sunroof / Headliner Rattle and Creaking Noise | Torque Converter Internal Rivet Damage — Scratching Noise / Low-Speed Stall (Campaign T27G)",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Ford",
    "model": "Freestar",
    "yearsHint": "2004-2007",
    "note": "Only 16 documented issues on this nameplate. 2 interest-email leads asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: ABS Light and Unwanted ABS Activation from Brake-Dust-Fouled Rear Wheel Speed Sensors | AX4S Transmission Torque Converter Shudder and Failure | DPFE Sensor and Clogged EGR Passages Causing P0401 Insufficient EGR Flow | Front Wheel Hub Cracking from Improper Heat Treatment (Recall 04S24 / 04V446000) | Fuel Level Sender Card Contamination Causing a Stuck or Erratic Fuel Gauge | HVAC Blend Door Actuator Failure | Ignition Coil Pack Failure | Instrument Cluster Cold Solder Joints Causing Dead Gauges and Odometer Blackout | Power Sliding Door Jams Shut — Fuel Filler Door Interlock Cable and Latch Failure | Power Steering Low-Pressure Line Unseated at the Rack and Pinion (Recall 03S09 / 03V457000) | Rear A/C Expansion Valve Sticking and Rear Evaporator Circuit Leaks | Rear Axle Trailing Arm Bushing Deterioration | Rear Wheel Hub and Bearing Assembly Growl and Failure | Third-Row Stowable Seat Latch Striker Bracket Corrosion (Recall 13S01 / 13V081000) | Torque Converter Shudder and Transmission Failure | Water Intrusion into the PCM from the Cowl Grille Causing Stalling, Harsh Shifts and No Reverse (TSB 06-14-10)",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Chrysler",
    "model": "LeBaron",
    "yearsHint": "1985-1995",
    "note": "Only 17 documented issues on this nameplate. 2 interest-email leads asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 2.5L and 3.0L Head Gasket Failure | A604 (41TE) Automatic Transaxle Electronic Shift Solenoid Failure | A604 (41TE) Ultradrive Limp Mode, Torque-Converter & Clutch Failure | Auto Shutdown (ASD) Relay Failure — Cranks but Won't Start (No Spark/No Fuel) | Automatic Idle Speed (AIS) Motor Failure — Rough Idle, Stalling, Hunting | Chronic Overheating — Wrong-Rotation Water Pump (1989+) & Cooling System Neglect | Convertible Top Hydraulic System and Fabric Deterioration | Coolant Temperature Sensor Failure — Hot Stall, Erratic Gauge, Hard Restart | Distributor Hall-Effect Pickup Heat-Soak Failure — Intermittent No-Spark Stall | Engine Controller Failure (Logic/Power Module, SMEC, SBEC) — No-Start / Stalling | Fuel Injector Clogging and Leaking | HVAC Blower Motor Resistor Failure — Fan Works Only on High | Instrument Cluster / Speedometer & Odometer Failure | Mitsubishi 3.0L V6 Valve Stem Seal / Valve Guide Wear — Oil Consumption and Blue Smoke on Startup | Power Window Motor Failure | Timing Belt Wear and Breakage (2.2L/2.5L/3.0L) — Stranding No-Start | Turbocharger Bearing/Seal Failure (Oil Starvation, Blue Smoke)",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Cadillac",
    "model": "CT6",
    "yearsHint": "2016-2020",
    "note": "Only 17 documented issues on this nameplate. 2 interest-email leads asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 10-Speed Transmission Damage Can Cause Wheel Lock-Up (Recall 25V148) | 3.0L Twin-Turbo (LGW) Turbocharger Turbine Wheel Failure — GM Service Update 17408 | 8L45/8L90 Eight-Speed Torque Converter Clutch Shudder — TSB 18-NA-355 Fluid Exchange | ABS and Stability Control Can Disable Without Warning Lamps (Recall 19V889) | CT6 Plug-In Hybrid: Faulty Transmission Wire Harness Thermistor Crimp — Service Update N202318000 | Engine Oil Cooler Core Leaks Oil Into Coolant, Causing Overheating (2016 LGW Customer Satisfaction Program) | Excess Adhesive Can Obstruct Child-Seat Anchorages (Recall 18V437) | Failed Thermostat Sets P0128, Forces Cooling Fans to Run Constantly and Disables the A/C | Front Passenger Seat Belt Anchor Bolt Missing From Assembly (Recall 16V687) | Harsh 1-2 Shifting and Delayed Reverse Engagement on the Eight-Speed Automatic | Incorrect-Frequency TPMS Sensors on Dealer-Installed 20-Inch Wheels (Recall 19V731) | Panoramic Sunroof Guide Rail Contact Causes Roof Creak, Tick and Rattle — TSB 16-NA-370 | Parasitic Battery Drain From Keyless Entry Module Polling for Approach Lighting | Park and Position Lamps May Be Excessively Bright (Recall 21V759) | Rear Camera Mirror Module Failure — Blank, Blurry or Distorted Streaming Mirror Image | Rear Seat Belt Automatic Locking Retractor Fails to Lock for Child Seats (Recall 18V673) | Turn Signals May Not Cancel Automatically (Recall 19V117)",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "MINI",
    "model": "Cooper S",
    "yearsHint": "2007-2025",
    "note": "Only 9 documented issues on this nameplate. 1 interest-email lead asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 2025 MINI Cooper S Included in BMW Integrated Brake Recall 24V104000 | 2025 MINI Cooper S Integrated Brake System Recall 26V-422 | Brake Light Drops Out During Turn Signal Use - Recall 17V222000 | Direct Injection Carbon Buildup on Intake Valves | High-Pressure Fuel Pump (HPFP) Failure | N14/N18 Turbo Engine Timing Chain Catastrophic Failure | NHTSA Recall 23V337000: Driver's Footwell Control Module Can Short-Circuit and Cause a Fire | Premature Clutch and Dual-Mass Flywheel Failure | Turbocharger Oil Feed Line Leak and Turbo Failure",
    "forums": ""
  }
]

const EXCLUSIONS = [
  {
    "make": "Mercedes-Benz",
    "model": "GLC",
    "existingTitles": [
      "12V Board-Net Parasitic Drain from Door Control Modules Leaving X254 GLC Stranded",
      "48V Mild-Hybrid (EQ Boost) Integrated Starter-Generator Failure",
      "9G-Tronic Harsh Shifting",
      "Active Brake Assist and 360-Degree Camera False Activations (Phantom Braking)",
      "Air Suspension Compressor Failure",
      "Cold-Start Camshaft Adjuster (Magnet/Solenoid) Rattle",
      "Crankcase Vent (PCV) Valve Failure with Engine Harness Oil Contamination",
      "Diesel Timing Chain Tensioner Seal Oil Leak and Chain Stretch (OM651)",
      "Driver Door Lock Micro-Switch Corrosion Preventing Auto-Park / Parking Brake Engagement (Rollaway Recall 26V481)",
      "Fixed Panoramic Roof Front and Side Trim Panels Debonding and Separating in Motion (Recall 17V715)",
      "Front Lower Spring Control Arm and Thrust Arm Bushing Wear Causing Clunk and Squeak",
      "Fuel Pump Shutdown Causing Loss of Drive Power (Recall)",
      "GLC 350e High-Voltage System Faults and Charging Failures (Plug-In Hybrid Only)",
      "Infotainment Control Unit Reset Blanking the Instrument Cluster While Driving (Recall 26V281)",
      "LED Headlamp Moisture Ingress and Internal Condensation (Recall 22V261 plus Out-of-Recall Complaints)",
      "MBUX Infotainment System Freeze",
      "Panoramic Sunroof Creak and Rattle",
      "Power Tailgate Gas Support Strut Failure Causing the Liftgate to Drop or Slam Shut",
      "Rear Brake Squeal and Premature Rear Pad Wear",
      "SCR / AdBlue System Plausibility Failure Triggering a No-Restart Countdown (OM651 Diesel)",
      "Steering Coupling Bolt Loosening / Loss of Steering Control (Recall)",
      "Turbocharger Wastegate Actuator Diaphragm Rupture Causing Underboost and Limp Mode (M274/M264 2.0T)"
    ]
  },
  {
    "make": "Infiniti",
    "model": "QX60",
    "existingTitles": [
      "Battery Drain / No-Start from Telematics, Infotainment, or Control Module Sleep Issues",
      "CVT Transmission Failure",
      "Forward Collision Warning / Automatic Emergency Braking False Activation or Unexpected Braking",
      "Front Steering Knuckle / Rear Axle Housing May Be Insufficiently Strong (Recall 21V402000)",
      "Panoramic Moonroof Exploding or Cracking Spontaneously",
      "Power Steering Pump Whine",
      "Rearview Camera Image Blank, Distorted, or Intermittent Due to Infotainment/Display Software",
      "Transmission Judder at Low Speed"
    ]
  },
  {
    "make": "Audi",
    "model": "A7",
    "existingTitles": [
      "2012-2015 Audi A7 Cold-Start Rattle TSB 2039995/2",
      "2019-2020 Audi A7 Starter-Alternator Service Action 27BQ",
      "2019-2022 Audi A7 Gateway Recall 90V2 / NHTSA 22V861",
      "2022 Audi A7 E Battery Recall 93AA / NHTSA 25V080",
      "Severe Carbon Buildup on Intake Valves (Direct Injection)",
      "Supercharger Clutch and Isolator Failure (S7 3.0T)",
      "Supercharger Nose Cone Bearing Wear",
      "Thermostat Housing Coolant Leak"
    ]
  },
  {
    "make": "Pontiac",
    "model": "Grand Am",
    "existingTitles": [
      "Front Wheel Hub Bearing Premature and Repeat Failure",
      "Grand Am 3.4L V6 Upper/Lower Intake Gasket Failure",
      "Hazard Warning Switch Failure Disabling Turn Signals (Recall 03V327000)",
      "Ignition Switch Inadvertent Key Rotation — Stall and Airbag Non-Deployment (Recall 14V-400)",
      "In-Tank Fuel Pump Module Failure — Stalling, No-Start, and Erratic Fuel Gauge",
      "Passlock Anti-Theft System False Activation Causing No-Start",
      "Power Window Regulator Cable and Plastic Clip Failure",
      "Premature Front Brake Rotor Warping and Pedal Pulsation"
    ]
  },
  {
    "make": "MINI",
    "model": "Cooper",
    "existingTitles": [
      "2025 MINI Cooper — Integrated Brake System Recall 24V104000",
      "Coolant Expansion Tank Cracking",
      "Electric Power Steering Rack Failure",
      "Electric Thermostat and Water Pump Failure",
      "N12/N16 Timing Chain Tensioner Failure",
      "NHTSA Recall 23V337000: Footwell Electronic Control Module Short-Circuit Fire Risk",
      "Recall 17V222000: Bumper Brake Light Goes Out With Turn Signal On (Clubman)",
      "Valve Cover and VANOS Solenoid Oil Leaks"
    ]
  },
  {
    "make": "Infiniti",
    "model": "QX50",
    "existingTitles": [
      "CVT Shudder Under Light Acceleration",
      "Improperly Heat-Treated Front Steering Knuckle / Rear Axle Housing (Recall 21V402000)",
      "Infotainment System Lag and Connectivity Issues",
      "Premature Front Lower Control Arm / Compression Rod Bushing Wear Causing Clunks and Tire Wear",
      "Steering Wheel Lock / Ignition No-Start from Electronic Steering Lock Failure",
      "Sunroof Drain / HVAC Evaporator Water Intrusion Causing Wet Carpets and Electrical Faults",
      "Timing Chain / VVEL Rattle and Front Timing Cover Oil Leaks on VQ37VHR",
      "VC-Turbo Engine Oil Consumption"
    ]
  },
  {
    "make": "Mazda",
    "model": "CX-9",
    "existingTitles": [
      "A/C Evaporator Core Leak and Refrigerant Loss",
      "Power Liftgate Failure",
      "Rear Differential Coupling Failure (AWD)",
      "Timing Chain Stretch and Rattle (2.5L Turbo SkyActiv)",
      "Timing Chain Stretch on 3.7L V6",
      "Transfer Case Fluid Leak (AWD Models)",
      "Turbocharger Coolant Line Leak",
      "Water Pump and Coolant Crossover Pipe Leak (3.7L V6)"
    ]
  },
  {
    "make": "Genesis",
    "model": "G70",
    "existingTitles": [
      "3.3T Oil Consumption with Smoke and Fouled Plugs",
      "8-Speed Automatic Shift Quality Issues",
      "ABS Module Electrical Short Causing Engine-Bay Fire Risk (Recall 21V-161 / 007G)",
      "Electronic Parking Brake (EPB) Actuator Failure — Won't Release or Engage",
      "Front Brake Rotor Warping / Pulsation (Brembo Pad Deposit and Early Warping)",
      "GDI Intake-Valve Carbon Buildup (Misfires, Rough Idle)",
      "Headlight Condensation and Moisture Causing Lighting Failure",
      "High-Pressure Fuel Pump Failure Causing Power Loss (Recall 24V-528 / 023G)",
      "Infotainment System Lag and Crashes",
      "Left Turbocharger Oil Feed Line Leak (Recall 24V-191)",
      "Limited-Slip Differential Chatter Noise",
      "Parasitic Battery Drain / Dead 12V Battery",
      "Power-Folding Mirror Failure (Clicking / Not Folding or Unfolding)",
      "Soft Clear Coat — Easy Chipping, Peeling and Swirl Marks",
      "Sunroof / Headliner Rattle and Creaking Noise",
      "Torque Converter Internal Rivet Damage — Scratching Noise / Low-Speed Stall (Campaign T27G)"
    ]
  },
  {
    "make": "Ford",
    "model": "Freestar",
    "existingTitles": [
      "ABS Light and Unwanted ABS Activation from Brake-Dust-Fouled Rear Wheel Speed Sensors",
      "AX4S Transmission Torque Converter Shudder and Failure",
      "DPFE Sensor and Clogged EGR Passages Causing P0401 Insufficient EGR Flow",
      "Front Wheel Hub Cracking from Improper Heat Treatment (Recall 04S24 / 04V446000)",
      "Fuel Level Sender Card Contamination Causing a Stuck or Erratic Fuel Gauge",
      "HVAC Blend Door Actuator Failure",
      "Ignition Coil Pack Failure",
      "Instrument Cluster Cold Solder Joints Causing Dead Gauges and Odometer Blackout",
      "Power Sliding Door Jams Shut — Fuel Filler Door Interlock Cable and Latch Failure",
      "Power Steering Low-Pressure Line Unseated at the Rack and Pinion (Recall 03S09 / 03V457000)",
      "Rear A/C Expansion Valve Sticking and Rear Evaporator Circuit Leaks",
      "Rear Axle Trailing Arm Bushing Deterioration",
      "Rear Wheel Hub and Bearing Assembly Growl and Failure",
      "Third-Row Stowable Seat Latch Striker Bracket Corrosion (Recall 13S01 / 13V081000)",
      "Torque Converter Shudder and Transmission Failure",
      "Water Intrusion into the PCM from the Cowl Grille Causing Stalling, Harsh Shifts and No Reverse (TSB 06-14-10)"
    ]
  },
  {
    "make": "Chrysler",
    "model": "LeBaron",
    "existingTitles": [
      "2.5L and 3.0L Head Gasket Failure",
      "A604 (41TE) Automatic Transaxle Electronic Shift Solenoid Failure",
      "A604 (41TE) Ultradrive Limp Mode, Torque-Converter & Clutch Failure",
      "Auto Shutdown (ASD) Relay Failure — Cranks but Won't Start (No Spark/No Fuel)",
      "Automatic Idle Speed (AIS) Motor Failure — Rough Idle, Stalling, Hunting",
      "Chronic Overheating — Wrong-Rotation Water Pump (1989+) & Cooling System Neglect",
      "Convertible Top Hydraulic System and Fabric Deterioration",
      "Coolant Temperature Sensor Failure — Hot Stall, Erratic Gauge, Hard Restart",
      "Distributor Hall-Effect Pickup Heat-Soak Failure — Intermittent No-Spark Stall",
      "Engine Controller Failure (Logic/Power Module, SMEC, SBEC) — No-Start / Stalling",
      "Fuel Injector Clogging and Leaking",
      "HVAC Blower Motor Resistor Failure — Fan Works Only on High",
      "Instrument Cluster / Speedometer & Odometer Failure",
      "Mitsubishi 3.0L V6 Valve Stem Seal / Valve Guide Wear — Oil Consumption and Blue Smoke on Startup",
      "Power Window Motor Failure",
      "Timing Belt Wear and Breakage (2.2L/2.5L/3.0L) — Stranding No-Start",
      "Turbocharger Bearing/Seal Failure (Oil Starvation, Blue Smoke)"
    ]
  },
  {
    "make": "Cadillac",
    "model": "CT6",
    "existingTitles": [
      "10-Speed Transmission Damage Can Cause Wheel Lock-Up (Recall 25V148)",
      "3.0L Twin-Turbo (LGW) Turbocharger Turbine Wheel Failure — GM Service Update 17408",
      "8L45/8L90 Eight-Speed Torque Converter Clutch Shudder — TSB 18-NA-355 Fluid Exchange",
      "ABS and Stability Control Can Disable Without Warning Lamps (Recall 19V889)",
      "CT6 Plug-In Hybrid: Faulty Transmission Wire Harness Thermistor Crimp — Service Update N202318000",
      "Engine Oil Cooler Core Leaks Oil Into Coolant, Causing Overheating (2016 LGW Customer Satisfaction Program)",
      "Excess Adhesive Can Obstruct Child-Seat Anchorages (Recall 18V437)",
      "Failed Thermostat Sets P0128, Forces Cooling Fans to Run Constantly and Disables the A/C",
      "Front Passenger Seat Belt Anchor Bolt Missing From Assembly (Recall 16V687)",
      "Harsh 1-2 Shifting and Delayed Reverse Engagement on the Eight-Speed Automatic",
      "Incorrect-Frequency TPMS Sensors on Dealer-Installed 20-Inch Wheels (Recall 19V731)",
      "Panoramic Sunroof Guide Rail Contact Causes Roof Creak, Tick and Rattle — TSB 16-NA-370",
      "Parasitic Battery Drain From Keyless Entry Module Polling for Approach Lighting",
      "Park and Position Lamps May Be Excessively Bright (Recall 21V759)",
      "Rear Camera Mirror Module Failure — Blank, Blurry or Distorted Streaming Mirror Image",
      "Rear Seat Belt Automatic Locking Retractor Fails to Lock for Child Seats (Recall 18V673)",
      "Turn Signals May Not Cancel Automatically (Recall 19V117)"
    ]
  },
  {
    "make": "MINI",
    "model": "Cooper S",
    "existingTitles": [
      "2025 MINI Cooper S Included in BMW Integrated Brake Recall 24V104000",
      "2025 MINI Cooper S Integrated Brake System Recall 26V-422",
      "Brake Light Drops Out During Turn Signal Use - Recall 17V222000",
      "Direct Injection Carbon Buildup on Intake Valves",
      "High-Pressure Fuel Pump (HPFP) Failure",
      "N14/N18 Turbo Engine Timing Chain Catastrophic Failure",
      "NHTSA Recall 23V337000: Driver's Footwell Control Module Can Short-Circuit and Cause a Fire",
      "Premature Clutch and Dual-Mass Flywheel Failure",
      "Turbocharger Oil Feed Line Leak and Turbo Failure"
    ]
  }
]

const CATEGORIES = ['engine', 'transmission', 'drivetrain', 'electrical', 'brakes', 'suspension', 'cooling', 'fuel', 'interior', 'exterior', 'body', 'safety', 'exhaust', 'steering', 'hvac', 'emissions', 'other']

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
          category: { type: 'string', enum: CATEGORIES },
          years: { type: 'array', items: { type: 'number' } },
          trims: { type: 'array', items: { type: 'string' } },
          engines: { type: 'array', items: { type: 'string' } },
          symptoms: { type: 'array', items: { type: 'string' } },
          dtcCodes: { type: 'array', items: { type: 'string' } },
          recallCampaigns: { type: 'array', items: { type: 'string' } },
          estimatedCostLow: { type: 'number' },
          estimatedCostHigh: { type: 'number' },
          typicalMileageLow: { type: 'number' },
          typicalMileageHigh: { type: 'number' },
          citations: { type: 'array', items: CITATION },
        },
        required: ['title', 'description', 'solution', 'severity', 'category', 'years', 'symptoms', 'citations'],
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
    hasOfficialSource: { type: 'boolean' },
    isDuplicate: { type: 'boolean' },
    reason: { type: 'string' },
  },
  required: ['isReal', 'confidence', 'hasLiveCitation', 'hasNonAggregatorSource', 'hasOwnerCommunitySource', 'hasOfficialSource', 'isDuplicate', 'reason'],
}

function existingFor(t) {
  const e = EXCLUSIONS.find((x) => x.make === t.make && x.model === t.model)
  return (e && e.existingTitles) || []
}

const CITATION_RULES = [
  `CITATION RULES - hard requirements:`,
  `  * At least ONE citation per issue must be an official source (NHTSA, manufacturer campaign, TSB) or a real owner community thread. Third-party problem-aggregator sites alone do not qualify.`,
  `  * NEVER cite a raw api.nhtsa.gov endpoint - cite the human-readable nhtsa.gov page or the campaign PDF.`,
  `  * Cite ONLY pages you actually found and opened. Do NOT construct or guess a URL from a pattern - fabricated URLs have polluted this database before, and a guessed static.nhtsa.gov PDF path was tested and 404s.`,
  `  * A forum thread found in search results counts even if the site blocks automated fetching (403).`,
].join('\n')

function fieldSpec(t) {
  return [
    `For EACH issue provide: title (name the component AND the failure mode), description, solution (the real fix, including whether a free recall remedy exists), severity, category (one of: ${CATEGORIES.join(', ')}), years, trims when variant-specific, engines[] when the failure is engine-code specific, symptoms[], recallCampaigns[] (NHTSA campaign numbers such as 24V123 - state these ONLY where you actually found them), dtcCodes[] where genuinely documented, estimatedCostLow/High and typicalMileageLow/High when known, and citations[].`,
    ``,
    `ENGINE-CODE SPECIFICITY: the model name is not enough. A failure on one engine is not a failure on another sold in the same body. Where the note above names specific engines, tag down to them.`,
  ].join('\n')
}

// ---------------------------------------------------------------- prompts

function discoverOfficialFirst(t) {
  const existing = existingFor(t)
  const isEv = t.style === 'ev'
  return [
    `You research REAL, documented known issues for a RECENTLY LAUNCHED vehicle. Vehicle: ${t.make} ${t.model} (${t.yearsHint}).`,
    ``,
    `Context on this vehicle: ${t.note}`,
    ``,
    `This vehicle is NEW. That changes where the evidence lives, so change where you look:`,
    `  1. OFFICIAL FIRST - NHTSA recalls and complaints, manufacturer recall and service campaigns, TSBs, stop-sale and delivery-hold notices, OEM service documentation. On a vehicle this new this is the RICHEST and most reliable source and where most of your effort should go.`,
    `  2. OWNER COMMUNITIES second - ${t.forums}. These exist but are THIN for a vehicle this new. Use them to corroborate and add detail, not as primary evidence.`,
    ``,
    `Because the forums are thin, the temptation to fill gaps with plausible-sounding threads is high. Do not. One issue grounded in a verifiable recall campaign is worth more than five with invented forum links. If you cannot find real evidence, return fewer issues.`,
    ``,
    `WE ALREADY HAVE THESE ${existing.length} ISSUES. Do NOT return any of them or a reworded restatement:`,
    existing.length ? existing.map((s) => `  - ${s}`).join('\n') : '  (none - this nameplate has NO coverage at all yet, so establish the foundational issues)',
    ``,
    `Find 6-10 ADDITIONAL well-documented issues NOT in that list.`,
    ``,
    isEv
      ? `THE EV FAILURE SURFACE IS NOT THE ICE ONE. Look specifically at: high-voltage battery and BMS faults; ICCU / on-board charger / DC-DC converter failures; DC fast-charging faults and derating; thermal management and heat pump; 12V auxiliary battery drain (an extremely common real complaint on new EVs); software and OTA update failures; infotainment; regenerative braking and brake-blending; drive-unit and reduction-gear failures; and propulsion-power-loss campaigns.`
      : `FAILURE SURFACE: this is an internal-combustion or hybrid vehicle in its first generation. Concentrate on the powertrain the note names (new turbo engines, new transmissions and new hybrid systems generate the launch-period failures), plus electrical and infotainment architecture, ADAS false activations, and any seat, belt or airbag campaigns.`,
    ``,
    `PLATFORM SIBLINGS - the single biggest error risk in this wave. Several targets share hardware with vehicles already in this catalog. A recall or failure on a sibling is NOT automatically an issue on THIS nameplate. Before you attribute one, confirm NHTSA or the manufacturer actually names THIS vehicle. Copying failures across platform mates is the exact error a previous cross-link audit caught.`,
    ``,
    `MODEL YEARS: this vehicle is 1-5 years old. Never return a year that predates its launch.`,
    ``,
    fieldSpec(t),
    ``,
    `CATEGORY MAPPING - the list is CLOSED and shared with the whole catalog. Map concepts INTO it, never extend it: HV battery / BMS / charging / ICCU / 12V / software -> electrical; drive unit and reduction gear -> drivetrain; regenerative braking -> brakes; heat pump and cabin climate -> hvac; thermal management of the pack -> cooling.`,
    ``,
    isEv
      ? `DTC CODES: most EV faults surface as manufacturer-specific codes or dash messages, not generic OBD-II P-codes. Provide dtcCodes[] only where a code is genuinely documented for this vehicle. Never infer one by analogy to a gas car.`
      : `DTC CODES: provide them only where genuinely documented for this vehicle. Never infer a code by analogy to a related model.`,
    ``,
    CITATION_RULES,
    ``,
    `Accuracy over volume. A single isolated complaint is an anecdote, not a known issue. Never invent an issue or a citation. Respond ONLY via the StructuredOutput tool.`,
  ].join('\n')
}

function discoverForumFirst(t) {
  const existing = existingFor(t)
  const isThin = t.style === 'thin'
  return [
    `You research REAL, documented known issues for a specific vehicle. Vehicle: ${t.make} ${t.model} (${t.yearsHint}).`,
    ``,
    `Context on this vehicle: ${t.note}`,
    ``,
    isThin
      ? `THIS NAMEPLATE HAS ALMOST NO COVERAGE IN OUR DATABASE - ${existing.length} issue(s) for a vehicle sold for years with an active owner community. Read that as a COVERAGE GAP, not as evidence the vehicle is reliable. The note above names failures that are extensively documented. Your job is to establish the foundational record for this nameplate.`
      : `THIS IS A HIGH-VOLUME NAMEPLATE CARRYING ONLY ${existing.length} ISSUES, while comparable-volume vehicles in this catalog average 50 or more. It is under-documented, not clean. Go deep: this vehicle has decades of owner reporting behind it.`,
    ``,
    `WHERE TO LOOK, in order:`,
    `  1. OWNER COMMUNITIES FIRST - ${t.forums}. On a vehicle with this much history the forums hold detail no government summary ever captures: which build months, which engine code, what the actual fix was, what the dealer denied.`,
    `  2. OFFICIAL SOURCES second - NHTSA recalls and complaints, manufacturer campaigns, TSBs, class-action settlements and extended warranty notices. These make an issue checkable.`,
    ``,
    `WE ALREADY HAVE THESE ${existing.length} ISSUES. Do NOT return any of them or a reworded restatement:`,
    existing.length ? existing.map((s) => `  - ${s}`).join('\n') : '  (none)',
    ``,
    `Find ${isThin ? '8-12' : '10-14'} ADDITIONAL well-documented issues NOT in that list. Spread them across generations and across systems - do not return ten variations of the same engine complaint.`,
    ``,
    `GENERATION AND ENGINE DISCIPLINE: this nameplate spans multiple generations and engines. A failure on one generation is NOT a failure on the next, and the most common error on nameplates like this is merging two different engines' stories into one issue. The note above names the specific traps.`,
    ``,
    fieldSpec(t),
    ``,
    `CATEGORY MAPPING - the list is CLOSED and shared with the whole catalog. Map concepts INTO it, never extend it.`,
    ``,
    CITATION_RULES,
    ``,
    `Accuracy over volume. A single isolated complaint is an anecdote, not a known issue. Never invent an issue or a citation. Respond ONLY via the StructuredOutput tool.`,
  ].join('\n')
}

function discoverMoto(t) {
  const existing = existingFor(t)
  return [
    `You research REAL, documented known issues for a specific MOTORCYCLE. Machine: ${t.make} ${t.model} (${t.yearsHint}).`,
    ``,
    `Context on this machine: ${t.note}`,
    ``,
    `This is a motorcycle, not a car. Treat it as one: riders diagnose and document differently, and the failure surface is different - charging systems (stator, regulator/rectifier), final drive (chain, belt, or shaft and its splines), fork seals and steering head bearings, cam chain tensioners, clutch baskets and slave cylinders, fuel pumps and FI, and corrosion on exposed components are the recurring themes across most makes.`,
    ``,
    `WHERE TO LOOK, in order:`,
    `  1. RIDER COMMUNITIES FIRST - ${t.forums}. These are the primary record for motorcycles; long-running model-specific forums document failures in far more detail than any official source.`,
    `  2. OFFICIAL SOURCES second - NHTSA recalls (manufacturers file motorcycle campaigns like any other vehicle), manufacturer service bulletins and campaigns.`,
    ``,
    `WE ALREADY HAVE THESE ${existing.length} ISSUES. Do NOT return any of them or a reworded restatement:`,
    existing.length ? existing.map((s) => `  - ${s}`).join('\n') : '  (none - this machine has NO coverage yet, so establish the foundational issues)',
    ``,
    `Find 8-12 well-documented issues NOT in that list.`,
    ``,
    `GENERATION AND ENGINE DISCIPLINE: the note above names the generation split for this machine, and it matters more on bikes than on cars because manufacturers reuse a nameplate across completely unrelated engines. Never carry a finding across that split.`,
    ``,
    fieldSpec(t),
    ``,
    `CATEGORY MAPPING - the category list is CLOSED and SHARED with the automotive catalog. The renderer knows exactly these 17 and nothing else. Map motorcycle concepts INTO the set, never extend it: final drive / chain / belt / shaft splines -> drivetrain; fairing and bodywork -> exterior; stator, regulator-rectifier and wiring -> electrical; forks, shocks and steering head bearings -> suspension (or steering where it is genuinely the steering head).`,
    ``,
    `DTC CODES: motorcycles largely do NOT use OBD-II. Codes here are manufacturer-specific (Harley P- and B-codes, Honda/Yamaha/Suzuki/Kawasaki FI blink codes). Provide dtcCodes[] only where a code is genuinely documented for THIS machine, and never one borrowed from automotive OBD-II.`,
    ``,
    CITATION_RULES,
    ``,
    `Accuracy over volume. A single isolated complaint is an anecdote, not a known issue. Never invent an issue or a citation. Respond ONLY via the StructuredOutput tool.`,
  ].join('\n')
}

function discoverPrompt(t) {
  if (t.style === 'moto') return discoverMoto(t)
  if (t.style === 'ev' || t.style === 'new') return discoverOfficialFirst(t)
  return discoverForumFirst(t)
}

function verifyPrompt(t, c) {
  const existing = existingFor(t)
  const isNewish = t.style === 'ev' || t.style === 'new'
  const kind = t.style === 'moto' ? 'MOTORCYCLE' : (isNewish ? 'RECENTLY LAUNCHED vehicle' : 'vehicle')
  return [
    `You are a skeptical automotive fact-checker. DEFAULT TO REFUTING unless the evidence is solid. Subject: ${t.make} ${t.model} (${t.yearsHint}) - a ${kind}.`,
    ``,
    `CLAIM:`,
    `Title: ${c.title}`,
    `Description: ${c.description}`,
    `Years: ${(c.years || []).join(', ')}`,
    `Engines claimed: ${(c.engines || []).join(', ') || '(none)'}`,
    `Recall campaigns claimed: ${(c.recallCampaigns || []).join(', ') || '(none)'}`,
    `Cited URLs: ${(c.citations || []).map((x) => x.url).join(' | ') || '(none)'}`,
    ``,
    `Context on this vehicle: ${t.note}`,
    ``,
    `ISSUES ALREADY IN OUR DATABASE for this nameplate:`,
    existing.length ? existing.map((s) => `  - ${s}`).join('\n') : '  (none)',
    ``,
    `Verify:`,
    `(1) PLATFORM AND GENERATION. Is this genuinely documented for THIS nameplate, THIS generation and THIS engine - or is it a sibling's or a different generation's problem copied across? Shared hardware makes a shared defect PLAUSIBLE but never automatic. If a recall is claimed, confirm the campaign lists THIS vehicle.`,
    `(2) If a recall campaign number is claimed, does it exist AND cover this make/model? An invented campaign number is the clearest possible sign of fabrication.`,
    `(3) Do the cited URLs exist, resolve, and support the claim? A 404 is not a live citation. A 403 from a forum that clearly exists DOES count as live.`,
    `(4) Are the model years plausible for this nameplate and generation?`,
    isNewish
      ? `(5) Is this a RECURRING documented problem or a handful of early-adopter complaints? New vehicles attract loud launch-period noise, and a software annoyance that one OTA fixed is not a known issue.`
      : `(5) Is this a RECURRING documented problem affecting a meaningful population, or one owner's bad luck amplified by a single thread?`,
    `(6) Is it substantively the same problem as one already in our database above (isDuplicate)? Judge on the FAILURE, not the wording.`,
    ``,
    `Classify sources: hasOfficialSource (NHTSA / manufacturer campaign / TSB), hasOwnerCommunitySource (a real owner or rider forum, or a model-specific community), hasNonAggregatorSource (either of those, as opposed to third-party problem-aggregator sites).`,
    ``,
    `Return isReal, confidence 0-1, hasLiveCitation, hasNonAggregatorSource, hasOwnerCommunitySource, hasOfficialSource, isDuplicate, and a one-sentence reason. If the citations look fabricated, or you cannot corroborate a recurring documented problem, isReal=false.`,
  ].join('\n')
}

// ------------------------------------------------------------------- run

const byStyle = {}
for (const t of TARGETS) byStyle[t.style] = (byStyle[t.style] || 0) + 1
log(`Wave 18: ${TARGETS.length} targets — ${Object.entries(byStyle).map(([k, v]) => `${k}:${v}`).join('  ')}`)

const perModel = await pipeline(
  TARGETS,
  (t) => agent(discoverPrompt(t), { label: `discover:${t.make} ${t.model}`, phase: 'Discover', schema: DISCOVER_SCHEMA })
    .then((d) => ({ t, candidates: (d && Array.isArray(d.candidates)) ? d.candidates : [] })),
  (disc) => {
    const { t, candidates } = disc
    if (!candidates.length) {
      return { make: t.make, model: t.model, style: t.style, found: 0, confirmed: [], forumBacked: 0, officialBacked: 0 }
    }
    return parallel(candidates.map((c) => () =>
      agent(verifyPrompt(t, c), { label: `verify:${t.model}`, phase: 'Verify', schema: VERDICT_SCHEMA })
        .then((v) => {
          if (!v) return null
          // EVIDENCE gates only — see the header note on why there is no numeric confidence threshold.
          if (!v.isReal) return null
          if (!v.hasLiveCitation) return null
          if (!v.hasNonAggregatorSource) return null
          if (v.isDuplicate) return null
          if (!Array.isArray(c.citations) || c.citations.length === 0) return null
          return {
            ...c,
            make: t.make,
            model: t.model,
            vehicleType: t.style === 'moto' ? 'motorcycle' : 'car',
            _style: t.style,
            _verdict: v,
            _verdictConfidence: v.confidence,
            _verdictReason: v.reason,
            _forumBacked: !!v.hasOwnerCommunitySource,
            _officialBacked: !!v.hasOfficialSource,
          }
        })
    )).then((res) => {
      const kept = res.filter(Boolean)
      return {
        make: t.make, model: t.model, style: t.style,
        found: candidates.length,
        confirmed: kept,
        forumBacked: kept.filter((x) => x._forumBacked).length,
        officialBacked: kept.filter((x) => x._officialBacked).length,
      }
    })
  }
)

const confirmed = []
let totalFound = 0, totalForum = 0, totalOfficial = 0
const perModelStats = []
const styleTotals = {}
for (const r of perModel.filter(Boolean)) {
  totalFound += r.found
  totalForum += r.forumBacked
  totalOfficial += r.officialBacked
  styleTotals[r.style] = styleTotals[r.style] || { found: 0, confirmed: 0 }
  styleTotals[r.style].found += r.found
  styleTotals[r.style].confirmed += r.confirmed.length
  perModelStats.push({ make: r.make, model: r.model, style: r.style, found: r.found, confirmed: r.confirmed.length, forumBacked: r.forumBacked, officialBacked: r.officialBacked })
  log(`[${r.style}] ${r.make} ${r.model}: ${r.confirmed.length}/${r.found} confirmed, ${r.officialBacked} official-backed, ${r.forumBacked} forum-backed`)
  for (const c of r.confirmed) confirmed.push(c)
}
for (const [s, v] of Object.entries(styleTotals)) log(`  style ${s}: ${v.confirmed}/${v.found} confirmed`)
log(`WAVE 18 TOTAL: ${confirmed.length}/${totalFound} confirmed, ${totalOfficial} official-backed, ${totalForum} forum-backed`)

return { result: { confirmed, stats: { models: TARGETS.length, found: totalFound, confirmed: confirmed.length, forumBacked: totalForum, officialBacked: totalOfficial, byStyle: styleTotals, perModel: perModelStats } } }
