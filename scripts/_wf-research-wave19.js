/**
 * RESEARCH WAVE 19 — DEMAND-DRIVEN THIN NAMEPLATES.
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
 * DOWNSTREAM: save to data/research-wave19-<date>.json, then
 * _persist-known-issues-run.js -> _promote-pending-review.js -> _check-tonight-dupes.js.
 * Do NOT deploy; hand off to Sol.
 */
export const meta = {
  name: 'research-wave19-demand-driven',
  description: 'Wave-19: 12 thin nameplates chosen by interest-email demand. Style-selected discover prompt + adversarial verify',
  phases: [
    { title: 'Discover' },
    { title: 'Verify' },
  ],
}

const TARGETS = [
  {
    "style": "thin",
    "make": "Infiniti",
    "model": "FX35",
    "yearsHint": "2003-2012",
    "note": "Only 6 documented issues on this nameplate. 1 interest-email lead asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: Brake Rotor Warping / Front Brake Vibration | Camshaft / Crankshaft Position Sensor Failure | Front Suspension Clunk / Worn Control Arm Bushings | Fuel Gauge Sending Unit Failure | Radiator Crack and Coolant / Transmission Cross-Contamination | Timing Chain Guide / Whine from Front Cover",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "BMW",
    "model": "6 Series",
    "yearsHint": "2004-2018",
    "note": "Only 7 documented issues on this nameplate. 1 interest-email lead asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: Adaptive Headlight Module and Stepper Motor Failure | Convertible Top Hydraulic Pump & Cylinder Failure (E64/F12) | Early N63 650i Timing-Chain Wear Check | N62 Coolant Transfer Pipe Leak (Engine Valley Pipe) | N62 Valve Stem Seal Failure (Heavy Oil Consumption & Blue Smoke) | N63TU1 650i Oil Consumption Requires BMW Diagnosis | SMG III Hydraulic Pump Failure (M6 and SMG-Equipped 645Ci/650i)",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Mercedes-Benz",
    "model": "A-Class",
    "yearsHint": "2019-2025",
    "note": "Only 9 documented issues on this nameplate. 1 interest-email lead asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: A/C Drain Hose Water Ingress into Footwell (Electrical/SRS Damage) | DCT Transmission Shudder | Diesel Particulate Filter (DPF) Blockage and Limp Mode on Short Trips | Front Axle Integral Carrier Corrosion (Steering Loss Risk) | Front Suspension Strut Noise | M282 1.3L Intake Valve Carbon Buildup | M282 Thermostat Housing / Coolant Leak | MBUX Infotainment Software Bugs | Rearview Camera Blank / No Image (FMVSS 111 Non-Compliance)",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Hyundai",
    "model": "Veloster",
    "yearsHint": "2012-2021",
    "note": "Only 9 documented issues on this nameplate. 1 interest-email lead asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 6-Speed DCT Premature Clutch Failure | Asymmetric Third Door Hinge Failure / Alignment Issue | Battery Drain and No-Start from Infotainment/Telematics or Electrical Module Sleep Failures | Electric Power Steering Assist Loss or Heavy Steering from MDPS/Steering Column Faults | Forward Collision-Avoidance / Driver Assistance False Warnings and Camera-Radar Malfunctions | Knock Sensor / Engine Protection Logic Triggering Reduced Power and Check-Engine Light on 2.0L Models | Panoramic Sunroof Spontaneous Shattering | Smartstream IVT/CVT Hesitation, Judder, and Limp-Mode from Transmission Control Logic or Internal Faults | Turbo Wastegate Rattle at Idle",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Pontiac",
    "model": "Bonneville",
    "yearsHint": "1992-2005",
    "note": "Only 9 documented issues on this nameplate. 1 interest-email lead asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 3800 V6 (L36) Fuel Pressure Regulator Leak Can Cause Backfire and Fire (NHTSA Recall 04V090000) | Bonneville 3800 V6 Lower Intake Manifold (LIM) Gasket Failure | Crankshaft Position Sensor / Ignition Control Module Failure Causing Stalling and No-Start | Fuel Tank Pressure Sensor Defect — Fuel Leak and Fire Risk (NHTSA Recall 03V238000, SSEi) | Instrument Cluster Gauge (Stepper Motor) and Backlighting Failure | Mass Air Flow (MAF) Sensor Contamination and Failure | Plastic Upper Intake Manifold (Plenum) Degradation and Coolant Ingestion (3800 Series II) | Power Window Regulator Cable and Motor Failure | SSEi Supercharger Nose-Drive Coupler and Bearing Wear (Eaton M62/M90)",
    "forums": ""
  },
  {
    "style": "new",
    "make": "Mercedes-Benz",
    "model": "EQS",
    "yearsHint": "2022-2025",
    "note": "Only 9 documented issues on this nameplate. 1 interest-email lead asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 12V Auxiliary Battery Drain | AIRMATIC Air Suspension Clunks and Premature Rear Shock/Damper Wear | Battery Management System Software Overload Triggers High-Voltage Shutdown (NHTSA 24V372000) | Electric Drivetrain Software Fault Causing Sudden Loss of Propulsion (NHTSA 23V405000) | Flush/Retractable Door Handles Fail to Present, Locking Owners Out | MBUX Hyperscreen Freezing, Blackouts and Random Reboots | Rear Axle Steering Calibration Fault | Recurring 'Battery Malfunction / Do Not Tow' Warning and Front Motor Interlock Faults | Significant Range Degradation in Cold Weather",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Mercedes-Benz",
    "model": "CLA",
    "yearsHint": "2014-2023",
    "note": "Only 9 documented issues on this nameplate. 1 interest-email lead asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 7G-DCT (724.0) Dual-Clutch Transmission Shudder and Mechatronics Failure | Auxiliary (Backup) Battery Malfunction Warning | COMAND Infotainment Freeze | Front Suspension Strut Noise | M270/M274 Camshaft Breakage from Defective Weld (Engine Stall) — Safety Recall | Panoramic Roof Front Panel Detachment — Safety Recall | Premature Rear Brake Wear and Caliper Piston Sticking | Turbo Oil Leak (M270) | Water Leaks into Trunk and Rear Footwell (Vent Flap / Seam Sealing)",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Jaguar",
    "model": "XJ",
    "yearsHint": "2004-2019",
    "note": "Only 18 documented issues on this nameplate. 2 interest-email leads asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 306DT 3.0 V6 Diesel Crankshaft and Main Bearing Failure | Air Suspension Compressor Failure | AJ133 5.0 V8 Timing Chain Tensioner Ratchet and Plastic Guide Rail Wear | Electrical Gremlins from Body Control Module Issues | Electronic Parking Brake Module Failure and Stuck-On Park Brake | Electronic Throttle Body Failure | Front Lower Control Arm Bushing Collapse Causing Front-End Clunk | JaguarDrive Rotary Gear Selector Fails to Rise on Start-Up | Panoramic Roof and Powered Sunblind Motor Failure / Loss of Calibration | Plastic Thermostat Housing and Water Pump Impeller Failure on the 4.2 AJ34 V8 | Rear Main Seal Oil Leak on V8 Engines | Restraints Control Module Miscalibration — Airbags Deploy at Wrong Thresholds (Recall 20V-557 / Jaguar H294) | Supercharger Nose Cone Bearing Wear | Supercharger Torsional Isolator Coupler Backlash ('Marbles in a Can' Rattle) — TSB JTB00349 | Underfloor and Rear Crossmember Brake Pipe Corrosion (Recall 09V144 / Jaguar J012) | Water Ingress into the Boot from Rear Lamp Seals and Blocked Sunroof Drains | X351 Water Pump and Plastic Coolant Pipe Failure Under the Supercharger | ZF 6HP26 Mechatronic Connector Sleeve and Plastic Sump Pan Fluid Leak",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Volkswagen",
    "model": "Tiguan",
    "yearsHint": "2009-2025",
    "note": "Only 18 documented issues on this nameplate. 2 interest-email leads asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: A/C Condenser Refrigerant Leak - No Cold Air | Aisin AWF8F35 8-Speed Automatic Hesitation and Torque Converter Shudder (MQB AD1) | DSG Mechatronic Unit Failure | EA888 Water Pump and Thermostat Housing Failure | Excessive Oil Consumption from Low-Tension Piston Rings (EA888) | Haldex 4Motion AWD Pump Screen Clogging and Clutch Pack Burnout | Intake Manifold Runner Flap Failure (P2015) - EA888 Gen1/Gen2 2.0 TSI | Intake Valve Carbon Buildup on Direct-Injected EA888 2.0 TSI | Panoramic Sunroof Cracking and Exploding | Panoramic Sunroof Drain Clog and Water Leak | Parasitic Battery Drain and Start/Stop Non-Operation (MQB Tiguan) | Rear Axle Coil Spring Fracture - Recall 42J5 / NHTSA 19V188000 | Rear Hatch Wiring Harness Break | Rear Visibility Noncompliance - Camera Image May Not Show on Screen (Recall 91DV) | Steering Wheel Clock Spring Debris Contamination - Driver Airbag Recall 15V483000 | Timing Chain Tensioner Failure (Gen 1 EA888) | Turbocharger Diverter Valve Diaphragm Tear and Boost Leak (P0299 / P1297) | Valve Cover Gasket and PCV Valve Oil Leak",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Cadillac",
    "model": "XTS",
    "yearsHint": "2013-2019",
    "note": "Only 19 documented issues on this nameplate. 2 interest-email leads asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 3.6L Direct-Injection Intake Valve Carbon Buildup | Cold-Start Service Power Steering Message May Require Power, Ground and Software Checks | CUE Infotainment Touchscreen Delamination - XTS | Early-Build Illuminated Door Handles May Fail from Water Intrusion | HID Xenon Headlight Ballast Failure & Housing Moisture | High-Pressure Direct-Injection Fuel Pump Failure | HVAC Blend Door Actuator Clicking / Blower Resistor No Heat | Launch or 2-3/3-2 Shift Shudder Must Be Separated from TCC Shudder | Multiple Cam/Crank Correlation DTCs Require Chain, Tensioner and Reluctor Diagnosis | Parasitic Battery Drain / Modules Not Entering Sleep Mode | Passenger Presence System Fault / Passenger Airbag Light On | Rear Air Suspension Sudden Collapse (F38 Air Ride) | Rear-Shock Seepage or Clunk Requires Inspection Before Replacement | Recall 13V220: Brake Lamps May Flash and Cruise Control May Disengage | Recall 14V116: Brake-Booster Pump Connector Corrosion Can Create a Fire Risk | Recall 14V541: Electronic Parking-Brake Software May Allow Brake Drag | Safety Alert Seat Haptic Motor Failure | Sunroof Drain Leak / Headliner Water Damage | Water Pump Weep-Hole Coolant Leak (3.6L V6)",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Subaru",
    "model": "WRX",
    "yearsHint": "2002-2025",
    "note": "Only 19 documented issues on this nameplate. 2 interest-email leads asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: Battery Drain / No-Start After Sitting Due to Low Quiescent Voltage | Brake Pedal Squeak / Creak from Pedal Bracket or Booster Area | Clutch Judder/Chatter When Engaging | Excessive Oil Consumption | Eyesight Driver-Assist Disablement and Warning Lights on CVT Models | FA24 Turbo Oil Feed Line / Banjo Bolt Leak Causing Burning Oil Smell and Smoke | Firewall Spot-Weld Cracking and Clutch Pedal Bracket Flex Causing Hard Shifting or Clutch Engagement Problems | Front Driveshaft Outer-Race Quench Cracking Leading to Fracture and Power Loss (Recall 23V-754) | Front Suspension Clunk Over Bumps | Fuel Filler Neck Corrosion Causing EVAP Leaks, Fuel Smell, and Check-Engine Light | Manual Transmission 2nd/3rd Gear Synchro Grind and Notchy Cold Shifting | Piston Ringland Failure | Power Steering Pump and Suction Hose Air Leak Causing Whine, Foamy Fluid, and Heavy Steering | Radiator End Tank Cracking and Coolant Leaks on Plastic-Aluminum OEM Radiators | Rear Differential / Final Drive Whine or Howl at Highway Speeds | Secondary Air Injection Pump and Switching Valve Failure Triggering CEL and Limp Mode | Starlink Infotainment Freezing/Lag | Throttle Rev-Hang (Slow RPM Drop) | Throw-Out Bearing Chirp/Failure",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Jeep",
    "model": "Compass",
    "yearsHint": "2007-2025",
    "note": "Only 19 documented issues on this nameplate. 2 interest-email leads asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 2.4L Tigershark Oil Pump Failure / Engine Stalling | 2022-2023 Jeep Compass — Radio Software May Block the Rearview Camera Image (Recall 24V436000) | 9-Speed Automatic Transmission Rough Shifting | A/C Evaporator Core Leak | Auxiliary Stop/Start Battery Failure Causing Parasitic Drain and No-Start | Blocked Sunroof Drain Tubes Causing Water Leaks into Headliner and Rear Cargo Area | Catalytic Converter Efficiency Loss (P0420) - Emissions Recall U67 | Electrical System / Voltage Regulator Failure Causing Stalling | Front Lower Control Arm Bushing and Tie Rod Wear Causing Clunk and Wander | HVAC Blend Door Actuator Gear Failure (Clicking Behind the Dash, Stuck Temperature) | Jatco CVT Transmission Failure / Overheating | Liftgate Strut Failure and Liftgate Dropping | Oil Filter Housing Leak (2.4L Tigershark) | Power Transfer Unit (PTU) / Rear Differential Seal Leak and Whine on 4x4 Models | Rear Wheel Bearing / Hub Assembly Failure (Repeat Failures) | Recall 17V824000 — Supplied Kidde Fire Extinguisher May Not Work in a Fire | Thermostat Housing Coolant Leak | Uconnect Head Unit Random Reboot / Frozen Touchscreen | Windshield Stress Cracking",
    "forums": ""
  }
]

const EXCLUSIONS = [
  {
    "make": "Infiniti",
    "model": "FX35",
    "existingTitles": [
      "Brake Rotor Warping / Front Brake Vibration",
      "Camshaft / Crankshaft Position Sensor Failure",
      "Front Suspension Clunk / Worn Control Arm Bushings",
      "Fuel Gauge Sending Unit Failure",
      "Radiator Crack and Coolant / Transmission Cross-Contamination",
      "Timing Chain Guide / Whine from Front Cover"
    ]
  },
  {
    "make": "BMW",
    "model": "6 Series",
    "existingTitles": [
      "Adaptive Headlight Module and Stepper Motor Failure",
      "Convertible Top Hydraulic Pump & Cylinder Failure (E64/F12)",
      "Early N63 650i Timing-Chain Wear Check",
      "N62 Coolant Transfer Pipe Leak (Engine Valley Pipe)",
      "N62 Valve Stem Seal Failure (Heavy Oil Consumption & Blue Smoke)",
      "N63TU1 650i Oil Consumption Requires BMW Diagnosis",
      "SMG III Hydraulic Pump Failure (M6 and SMG-Equipped 645Ci/650i)"
    ]
  },
  {
    "make": "Mercedes-Benz",
    "model": "A-Class",
    "existingTitles": [
      "A/C Drain Hose Water Ingress into Footwell (Electrical/SRS Damage)",
      "DCT Transmission Shudder",
      "Diesel Particulate Filter (DPF) Blockage and Limp Mode on Short Trips",
      "Front Axle Integral Carrier Corrosion (Steering Loss Risk)",
      "Front Suspension Strut Noise",
      "M282 1.3L Intake Valve Carbon Buildup",
      "M282 Thermostat Housing / Coolant Leak",
      "MBUX Infotainment Software Bugs",
      "Rearview Camera Blank / No Image (FMVSS 111 Non-Compliance)"
    ]
  },
  {
    "make": "Hyundai",
    "model": "Veloster",
    "existingTitles": [
      "6-Speed DCT Premature Clutch Failure",
      "Asymmetric Third Door Hinge Failure / Alignment Issue",
      "Battery Drain and No-Start from Infotainment/Telematics or Electrical Module Sleep Failures",
      "Electric Power Steering Assist Loss or Heavy Steering from MDPS/Steering Column Faults",
      "Forward Collision-Avoidance / Driver Assistance False Warnings and Camera-Radar Malfunctions",
      "Knock Sensor / Engine Protection Logic Triggering Reduced Power and Check-Engine Light on 2.0L Models",
      "Panoramic Sunroof Spontaneous Shattering",
      "Smartstream IVT/CVT Hesitation, Judder, and Limp-Mode from Transmission Control Logic or Internal Faults",
      "Turbo Wastegate Rattle at Idle"
    ]
  },
  {
    "make": "Pontiac",
    "model": "Bonneville",
    "existingTitles": [
      "3800 V6 (L36) Fuel Pressure Regulator Leak Can Cause Backfire and Fire (NHTSA Recall 04V090000)",
      "Bonneville 3800 V6 Lower Intake Manifold (LIM) Gasket Failure",
      "Crankshaft Position Sensor / Ignition Control Module Failure Causing Stalling and No-Start",
      "Fuel Tank Pressure Sensor Defect — Fuel Leak and Fire Risk (NHTSA Recall 03V238000, SSEi)",
      "Instrument Cluster Gauge (Stepper Motor) and Backlighting Failure",
      "Mass Air Flow (MAF) Sensor Contamination and Failure",
      "Plastic Upper Intake Manifold (Plenum) Degradation and Coolant Ingestion (3800 Series II)",
      "Power Window Regulator Cable and Motor Failure",
      "SSEi Supercharger Nose-Drive Coupler and Bearing Wear (Eaton M62/M90)"
    ]
  },
  {
    "make": "Mercedes-Benz",
    "model": "EQS",
    "existingTitles": [
      "12V Auxiliary Battery Drain",
      "AIRMATIC Air Suspension Clunks and Premature Rear Shock/Damper Wear",
      "Battery Management System Software Overload Triggers High-Voltage Shutdown (NHTSA 24V372000)",
      "Electric Drivetrain Software Fault Causing Sudden Loss of Propulsion (NHTSA 23V405000)",
      "Flush/Retractable Door Handles Fail to Present, Locking Owners Out",
      "MBUX Hyperscreen Freezing, Blackouts and Random Reboots",
      "Rear Axle Steering Calibration Fault",
      "Recurring 'Battery Malfunction / Do Not Tow' Warning and Front Motor Interlock Faults",
      "Significant Range Degradation in Cold Weather"
    ]
  },
  {
    "make": "Mercedes-Benz",
    "model": "CLA",
    "existingTitles": [
      "7G-DCT (724.0) Dual-Clutch Transmission Shudder and Mechatronics Failure",
      "Auxiliary (Backup) Battery Malfunction Warning",
      "COMAND Infotainment Freeze",
      "Front Suspension Strut Noise",
      "M270/M274 Camshaft Breakage from Defective Weld (Engine Stall) — Safety Recall",
      "Panoramic Roof Front Panel Detachment — Safety Recall",
      "Premature Rear Brake Wear and Caliper Piston Sticking",
      "Turbo Oil Leak (M270)",
      "Water Leaks into Trunk and Rear Footwell (Vent Flap / Seam Sealing)"
    ]
  },
  {
    "make": "Jaguar",
    "model": "XJ",
    "existingTitles": [
      "306DT 3.0 V6 Diesel Crankshaft and Main Bearing Failure",
      "Air Suspension Compressor Failure",
      "AJ133 5.0 V8 Timing Chain Tensioner Ratchet and Plastic Guide Rail Wear",
      "Electrical Gremlins from Body Control Module Issues",
      "Electronic Parking Brake Module Failure and Stuck-On Park Brake",
      "Electronic Throttle Body Failure",
      "Front Lower Control Arm Bushing Collapse Causing Front-End Clunk",
      "JaguarDrive Rotary Gear Selector Fails to Rise on Start-Up",
      "Panoramic Roof and Powered Sunblind Motor Failure / Loss of Calibration",
      "Plastic Thermostat Housing and Water Pump Impeller Failure on the 4.2 AJ34 V8",
      "Rear Main Seal Oil Leak on V8 Engines",
      "Restraints Control Module Miscalibration — Airbags Deploy at Wrong Thresholds (Recall 20V-557 / Jaguar H294)",
      "Supercharger Nose Cone Bearing Wear",
      "Supercharger Torsional Isolator Coupler Backlash ('Marbles in a Can' Rattle) — TSB JTB00349",
      "Underfloor and Rear Crossmember Brake Pipe Corrosion (Recall 09V144 / Jaguar J012)",
      "Water Ingress into the Boot from Rear Lamp Seals and Blocked Sunroof Drains",
      "X351 Water Pump and Plastic Coolant Pipe Failure Under the Supercharger",
      "ZF 6HP26 Mechatronic Connector Sleeve and Plastic Sump Pan Fluid Leak"
    ]
  },
  {
    "make": "Volkswagen",
    "model": "Tiguan",
    "existingTitles": [
      "A/C Condenser Refrigerant Leak - No Cold Air",
      "Aisin AWF8F35 8-Speed Automatic Hesitation and Torque Converter Shudder (MQB AD1)",
      "DSG Mechatronic Unit Failure",
      "EA888 Water Pump and Thermostat Housing Failure",
      "Excessive Oil Consumption from Low-Tension Piston Rings (EA888)",
      "Haldex 4Motion AWD Pump Screen Clogging and Clutch Pack Burnout",
      "Intake Manifold Runner Flap Failure (P2015) - EA888 Gen1/Gen2 2.0 TSI",
      "Intake Valve Carbon Buildup on Direct-Injected EA888 2.0 TSI",
      "Panoramic Sunroof Cracking and Exploding",
      "Panoramic Sunroof Drain Clog and Water Leak",
      "Parasitic Battery Drain and Start/Stop Non-Operation (MQB Tiguan)",
      "Rear Axle Coil Spring Fracture - Recall 42J5 / NHTSA 19V188000",
      "Rear Hatch Wiring Harness Break",
      "Rear Visibility Noncompliance - Camera Image May Not Show on Screen (Recall 91DV)",
      "Steering Wheel Clock Spring Debris Contamination - Driver Airbag Recall 15V483000",
      "Timing Chain Tensioner Failure (Gen 1 EA888)",
      "Turbocharger Diverter Valve Diaphragm Tear and Boost Leak (P0299 / P1297)",
      "Valve Cover Gasket and PCV Valve Oil Leak"
    ]
  },
  {
    "make": "Cadillac",
    "model": "XTS",
    "existingTitles": [
      "3.6L Direct-Injection Intake Valve Carbon Buildup",
      "Cold-Start Service Power Steering Message May Require Power, Ground and Software Checks",
      "CUE Infotainment Touchscreen Delamination - XTS",
      "Early-Build Illuminated Door Handles May Fail from Water Intrusion",
      "HID Xenon Headlight Ballast Failure & Housing Moisture",
      "High-Pressure Direct-Injection Fuel Pump Failure",
      "HVAC Blend Door Actuator Clicking / Blower Resistor No Heat",
      "Launch or 2-3/3-2 Shift Shudder Must Be Separated from TCC Shudder",
      "Multiple Cam/Crank Correlation DTCs Require Chain, Tensioner and Reluctor Diagnosis",
      "Parasitic Battery Drain / Modules Not Entering Sleep Mode",
      "Passenger Presence System Fault / Passenger Airbag Light On",
      "Rear Air Suspension Sudden Collapse (F38 Air Ride)",
      "Rear-Shock Seepage or Clunk Requires Inspection Before Replacement",
      "Recall 13V220: Brake Lamps May Flash and Cruise Control May Disengage",
      "Recall 14V116: Brake-Booster Pump Connector Corrosion Can Create a Fire Risk",
      "Recall 14V541: Electronic Parking-Brake Software May Allow Brake Drag",
      "Safety Alert Seat Haptic Motor Failure",
      "Sunroof Drain Leak / Headliner Water Damage",
      "Water Pump Weep-Hole Coolant Leak (3.6L V6)"
    ]
  },
  {
    "make": "Subaru",
    "model": "WRX",
    "existingTitles": [
      "Battery Drain / No-Start After Sitting Due to Low Quiescent Voltage",
      "Brake Pedal Squeak / Creak from Pedal Bracket or Booster Area",
      "Clutch Judder/Chatter When Engaging",
      "Excessive Oil Consumption",
      "Eyesight Driver-Assist Disablement and Warning Lights on CVT Models",
      "FA24 Turbo Oil Feed Line / Banjo Bolt Leak Causing Burning Oil Smell and Smoke",
      "Firewall Spot-Weld Cracking and Clutch Pedal Bracket Flex Causing Hard Shifting or Clutch Engagement Problems",
      "Front Driveshaft Outer-Race Quench Cracking Leading to Fracture and Power Loss (Recall 23V-754)",
      "Front Suspension Clunk Over Bumps",
      "Fuel Filler Neck Corrosion Causing EVAP Leaks, Fuel Smell, and Check-Engine Light",
      "Manual Transmission 2nd/3rd Gear Synchro Grind and Notchy Cold Shifting",
      "Piston Ringland Failure",
      "Power Steering Pump and Suction Hose Air Leak Causing Whine, Foamy Fluid, and Heavy Steering",
      "Radiator End Tank Cracking and Coolant Leaks on Plastic-Aluminum OEM Radiators",
      "Rear Differential / Final Drive Whine or Howl at Highway Speeds",
      "Secondary Air Injection Pump and Switching Valve Failure Triggering CEL and Limp Mode",
      "Starlink Infotainment Freezing/Lag",
      "Throttle Rev-Hang (Slow RPM Drop)",
      "Throw-Out Bearing Chirp/Failure"
    ]
  },
  {
    "make": "Jeep",
    "model": "Compass",
    "existingTitles": [
      "2.4L Tigershark Oil Pump Failure / Engine Stalling",
      "2022-2023 Jeep Compass — Radio Software May Block the Rearview Camera Image (Recall 24V436000)",
      "9-Speed Automatic Transmission Rough Shifting",
      "A/C Evaporator Core Leak",
      "Auxiliary Stop/Start Battery Failure Causing Parasitic Drain and No-Start",
      "Blocked Sunroof Drain Tubes Causing Water Leaks into Headliner and Rear Cargo Area",
      "Catalytic Converter Efficiency Loss (P0420) - Emissions Recall U67",
      "Electrical System / Voltage Regulator Failure Causing Stalling",
      "Front Lower Control Arm Bushing and Tie Rod Wear Causing Clunk and Wander",
      "HVAC Blend Door Actuator Gear Failure (Clicking Behind the Dash, Stuck Temperature)",
      "Jatco CVT Transmission Failure / Overheating",
      "Liftgate Strut Failure and Liftgate Dropping",
      "Oil Filter Housing Leak (2.4L Tigershark)",
      "Power Transfer Unit (PTU) / Rear Differential Seal Leak and Whine on 4x4 Models",
      "Rear Wheel Bearing / Hub Assembly Failure (Repeat Failures)",
      "Recall 17V824000 — Supplied Kidde Fire Extinguisher May Not Work in a Fire",
      "Thermostat Housing Coolant Leak",
      "Uconnect Head Unit Random Reboot / Frozen Touchscreen",
      "Windshield Stress Cracking"
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
log(`Wave 19: ${TARGETS.length} targets — ${Object.entries(byStyle).map(([k, v]) => `${k}:${v}`).join('  ')}`)

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
log(`WAVE 19 TOTAL: ${confirmed.length}/${totalFound} confirmed, ${totalOfficial} official-backed, ${totalForum} forum-backed`)

return { result: { confirmed, stats: { models: TARGETS.length, found: totalFound, confirmed: confirmed.length, forumBacked: totalForum, officialBacked: totalOfficial, byStyle: styleTotals, perModel: perModelStats } } }
