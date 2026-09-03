/**
 * RESEARCH WAVE 20 — DEMAND-DRIVEN THIN NAMEPLATES.
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
 * DOWNSTREAM: save to data/research-wave20-<date>.json, then
 * _persist-known-issues-run.js -> _promote-pending-review.js -> _check-tonight-dupes.js.
 * Do NOT deploy; hand off to Sol.
 */
export const meta = {
  name: 'research-wave20-demand-driven',
  description: 'Wave-20: 12 thin nameplates chosen by interest-email demand. Style-selected discover prompt + adversarial verify',
  phases: [
    { title: 'Discover' },
    { title: 'Verify' },
  ],
}

const TARGETS = [
  {
    "style": "thin",
    "make": "Audi",
    "model": "Q3",
    "yearsHint": "2015-2024",
    "note": "Only 10 documented issues on this nameplate. 1 interest-email lead asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 2015 Audi Q3 Sunroof-Control Recall 60C1 / NHTSA 15V200 | 2015-2018 Audi Q3 Coolant-Module Leak TSB 2061604/5 | 2019 Audi Q3 Steering-Rack Recall 48P7 / NHTSA 21V027 | 2020 Audi Q3 Brake-Pedal Recall 46i7 / NHTSA 20V786 | 2020-2024 Audi Q3 Coolant-Pump Leak TSB 2071515/1 | 2022 Audi Q3 Rearview-Camera Recall 91Ei / NHTSA 22V806 | Carbon Buildup on Intake Valves (Direct Injection) | EA888 Timing Chain Tensioner Failure | Excessive Oil Consumption (2.0 TFSI Engine) | Timing Chain Tensioner Failure (2.0 TFSI Engine)",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Buick",
    "model": "Cascada",
    "yearsHint": "2016-2019",
    "note": "Only 10 documented issues on this nameplate. 1 interest-email lead asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 1.6L LWC PCV Pressure Regulator Diaphragm Cracks Inside Camshaft Cover — P0171, Vacuum Whistle (GM Special Coverage N192291620 / N232395320) | 1.6L LWC Turbocharger Wastegate Actuator Solenoid & Bypass Valve Port Fittings Damaged During Service | Cargo Partition Magnet/Sensor Misread Locks Out Roof — \"Extend Cargo Shade To Operate Top\" | Cascada 1.6L Turbo (Opel SIDI) Timing Chain & Carbon Buildup | Convertible Top Stowage Flap Motors: Stripped Plastic Gears / Failed Microswitch Halt Roof Mid-Cycle | Heated Rear Glass Debonding From Soft Top Fabric (Insufficient Primer On Early Build) | Incorrect Convertible Roof Control Module Allows Unsafe Remote Window Closing — Recall 16V844000 (GM 16126) | IntelliLink Head Unit Freezes And Drops Camera, Bluetooth And Steering Wheel Controls | Parasitic Battery Drain — Tail Lamp Diagnostic Request Wakes The BCM And Keeps The Bus Awake | Rear Quarter Window Cavity Drains Blocked — Water Sloshing, Soaked Rear Carpet (GM 17-NA-149)",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Volvo",
    "model": "S90",
    "yearsHint": "2017-2025",
    "note": "Only 10 documented issues on this nameplate. 1 interest-email lead asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: Auxiliary Coolant Pump Leak | Pilot Assist and Adaptive Cruise Control Malfunction | Rear Air Suspension Strut and Compressor Failure | Rearview Camera Does Not Display in Reverse — FMVSS 111 Recall (Volvo R10333) | Recall 25V179000 — S90 Recharge High-Voltage Battery Short Circuit Fire Risk | S90 Low-Pressure Fuel Pump Can Blow a Fuse and Quit (Safety Recall 21V414000) | S90 Rear Visibility Recall: Camera Image May Not Display in Reverse | S90L Automatic Emergency Braking Software Incompatibility (NHTSA Recall 20V144000) | Sensus Infotainment System Lag, Crashes, and Black Screen | T6 Twin-Charged Engine Coolant Crossover Pipe Leak",
    "forums": ""
  },
  {
    "style": "new",
    "make": "Volkswagen",
    "model": "ID. Buzz",
    "yearsHint": "2024-2026",
    "note": "Only 10 documented issues on this nameplate. 1 interest-email lead asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 12V Auxiliary Battery Drain and Dead Battery | Cabin and Battery Preconditioning Fails to Run Below Freezing, Leaving Cold-Soaked Pack and Iced Glass | Charge Port Door Sticking or Not Opening | Infotainment System Freezing and Touchscreen Unresponsive | Instrument Cluster Displays European Brake Telltale Instead of Required Red \"BRAKE\" Warning (FMVSS 135/101 Recall) | OTA Software Updates Required for EV Systems | Power Sliding Door Alignment and Operation Issues | Single-Mode Regeneration and Poorly Blended Brake Pedal Produce Long, Soft, Then Abrupt Stops | Spurious Electronic Child-Lock and Door-Entry Faults Lock Out Sliding Door Interior Releases | Third-Row Bench Seat Too Wide for Its Two Seat Belts (FMVSS 208 Noncompliance Recall)",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Mazda",
    "model": "MX-6",
    "yearsHint": "1990-1997",
    "note": "Only 10 documented issues on this nameplate. 1 interest-email lead asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: Clutch Slave Cylinder Failure (Manual) | Distributor Failure on V6 Models | Distributor Oil Leak and Failure Causing No-Spark Condition | EGR Valve Carbon Buildup Causing Rough Idle and P0400 Codes | Front Suspension Knock from Worn Sway Bar End Links and Strut Mounts | GF4A-EL Automatic Transmission Harsh Shifts and Failure | Ignition Switch Overheating from Conductive Contact Grease (Recall 15V674) | Power Window Regulator Cable Snap | Timing Belt Failure Strands Car (Non-Interference but Stops Engine) | Transmission Mount Failure",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Ford",
    "model": "Fiesta",
    "yearsHint": "2008-2019",
    "note": "Only 20 documented issues on this nameplate. 2 interest-email leads asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 1.0L EcoBoost Degas Hose Coolant Loss & \"EcoBoom\" Overheating Engine Failure | 1.6L EcoBoost Intake-Valve Carbon Buildup (Direct Injection) | Blend Door Actuator Failure — Stuck on Heat or Cold | Coil Spring Fracture — Snapped Suspension Spring | Door Latch Failure — Doors May Open While Driving | DPS6 PowerShift Dual-Clutch Transmission Shudder, Slipping, and Failure | Electric Power Steering (EPS) Assist Fault — Sudden Loss of Assist | Electronic Throttle Body Failure — Sudden Limp Mode & Wrench Light | EVAP Canister Purge Valve Failure | Fiesta ST Rear Motor Mount (Dogbone) Bushing Failure — Vibration & Wheel Hop | Ignition Coil / Spark Plug Misfire — Oil-Fouled Coils & Water Ingress in Plug Wells | In-Tank Fuel Pump Failure — Stall Without Warning (Recall 15V005000) | Manual Transmission Clutch Judder & Slave/Release Cylinder Failure | Power Window Regulator / Cable Failure — Glass Drops Into Door | Rear Suspension Knock — Worn Rear Shock Top Mounts & Damper Bushings | SYNC / APIM Infotainment Freezing, Rebooting & Bluetooth/CarPlay Dropouts | TDCi Diesel DPF Blockage & Failed Regeneration (Short-Trip Use) | Thermostat Housing Coolant Leak | Water Leak Into Footwell — Blocked Scuttle Drain / Pollen-Filter Housing | Wet Belt (Belt-in-Oil) Timing Belt Degradation Clogging Oil Pump Pickup",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Mercedes-Benz",
    "model": "GLS",
    "yearsHint": "2017-2025",
    "note": "Only 11 documented issues on this nameplate. 1 interest-email lead asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 48V Ground Connection Overheating and Fire Risk (Recall 24V207) | 4MATIC Transfer Case Bearing Wear, Whine and Drivetrain Lock-Up Risk | 9G-Tronic Harsh Shift | AIRMATIC Air Suspension Failure | Battery Drain from 48V System | Engine Stall from Transmission Control Unit Software (Recall 24V118) | M256 Engine Excessive Oil Consumption and Piston Ring Wear | MBUX Infotainment Freezing, Black Screen and Random Reboots | OM656 Diesel CP4 High-Pressure Fuel Pump Sensitivity and Injector Damage | OM656 Diesel Emissions System Clogging (EGR/DPF/AdBlue SCR) and Limp Mode | Panoramic Sunroof Water Leak",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Buick",
    "model": "Encore",
    "yearsHint": "2013-2023",
    "note": "Only 11 documented issues on this nameplate. 1 interest-email lead asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 2019 Encore Air Bag Non-Deployment - SDM Not Taken Out of Manufacturing Mode | 6T40 Automatic Transmission Hard Shifting, Shudder and Slipping | Encore 1.4L Turbo (LUJ/LUV) Timing Chain Stretch | Encore GX (2020+) Three-Cylinder Turbo Stalling and Low-Oil-Pressure ECM Recall | Encore GX Transmission Shudder, Jerking and Solenoid Faults | Engine Stalling and Sudden Power Loss While Driving (Early Models) | EVAP Purge Pump Failure (2022 Encore) - Warranty Extension | Excessive Oil Consumption (1.4L Turbo) | PCV / Camshaft Cover Diaphragm Failure (1.4L Turbo) - \"Tea Kettle\" Whistle | Transmission Fluid Leak From an Under-Bolted Start/Stop Accumulator (Recall 20V668000) | Turbocharger / Oil Supply Line Failure Causing Sudden Loss of Power",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "BMW",
    "model": "M340i",
    "yearsHint": "2019-2025",
    "note": "Only 11 documented issues on this nameplate. 1 interest-email lead asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 12V Battery Drain and Failure / Battery Registration Issues | 2019-2022 M340i Seat-Belt Warning Recall 23V-584 | 2020 M340i Brake-Assist Recall 21V-598 | Coolant Loss from Expansion Tank and Water Pump | High-Pressure Fuel Pump (HPFP) Failure | Intake Valve Carbon Buildup | Oil Filter Disintegration in Housing | Turbo Wastegate Rattle at Idle | Valve Cover and Oil Filter Housing Gasket Oil Leaks (B58) | VANOS Solenoid O-Ring Failure | ZF 8HP Harsh / Jerky Low-Speed Shifting and Mechatronic Faults",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Infiniti",
    "model": "G37",
    "yearsHint": "2008-2013",
    "note": "Only 11 documented issues on this nameplate. 1 interest-email lead asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: Cam Cover Gasket Leak Causing Low Oil Pressure | Clogged Sunroof Drains Causing Cabin Water Leaks and Electrical Faults | Concentric Slave Cylinder Failure (Manual) | Dashboard Melts, Turns Sticky, and Cracks Causing Windshield Glare | Electronic Steering Lock Failure | OCS Varistor Defect Suppresses Passenger Airbag (Recall 08V521000) | Oil Gallery Gasket Leak | Power Window Auto-Reverse Threshold Out of Specification (Recall 11V538000) | Timing Chain Stretch and Guide Wear on VQ37VHR | VQ37VHR Excessive Oil Consumption on Early Engines | VVEL Actuator and Control Module Failure Causing Limp Mode",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Audi",
    "model": "R8",
    "yearsHint": "2008-2024",
    "note": "Only 22 documented issues on this nameplate. 2 interest-email leads asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 5.2 V10 Excessive Oil Consumption | 5.2 V10 Oil Pump Driveshaft Seal Timing-Case Oil Leak | A/C Compressor Failure Requiring Engine-Out Repair (4.2 V8) | Carbon Buildup on Intake Valves (4.2 V8 FSI and 5.2 V10 FSI) | Carbon Fiber Sideblade and Trim Clear-Coat Peeling | Catalytic Converter Failure Requiring Engine-Out Replacement | Coolant Expansion Tank Cracking and Cooling System Leaks | Direct-Injection Fuel Injector Failure | Front Axle Hydraulic Lift System Pump Failure | Front-Passenger Airbag Module May Explode or Deploy Improperly (Recall 22V543 / 69DY) | Gearbox Underfilled: Clutch Slippage or Transmission-Oil Leak (Recall 22V225 / 37O1) | Gearbox Ventilation Hose Can Leak Fluid Near Hot Engine Parts (Recall 18V639 / 34J1) | Ignition Coil Pack Failure Causing Misfires | LED Headlight / DRL Module Failure and Flickering | Magnetic Ride Damper Fluid Leaks | Magnetic Ride Suspension Damper Leak and Premature Failure | R tronic Hydraulic Pump and Pressure Accumulator Failure | R-Tronic Clutch Premature Wear and Expensive Replacement | R8 Spyder Fuel Supply Line Can Chafe on Heat Shield (Recall 11V390 / 20Q8) | Rod Bearing Wear and Engine Failure Risk (4.2 V8 FSI) | S-tronic Transmission Actuator Failure | Spyder Convertible Top Hydraulic Pump Failure",
    "forums": ""
  },
  {
    "style": "new",
    "make": "Toyota",
    "model": "Corolla Cross",
    "yearsHint": "2022-2026",
    "note": "Only 22 documented issues on this nameplate. 2 interest-email leads asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: \"12-Volt Battery Charging System Malfunction\" Warning From Insufficient Alternator Output - Long Parts Backorder | 2022 Corolla Cross Power Liftgate Unlatches but Does Not Raise — Owner Report | 2022 Corolla Cross Rear Clunk or Harsh Bang Over Bumps — Owner Report | 2022-2023 Corolla Cross Passenger-Airbag Panel - Recalls 23V-384 and 23V-864 | 2022-2023 Corolla Cross Stop & Start Restart-Failure Reports - Diagnosis Required | 2022-2025 Corolla Cross BSM Limitations or Unavailable Warning - Diagnosis Required | 2023 Corolla Cross Driver-Airbag Spiral Cable - Recalls 23V-480 and 25V-040 | 2023 Corolla Cross Hybrid XSE Whistling Noise — Owner Report | 2023 Corolla Cross PCS Forward-Camera Software - Campaign 25TC03 | 2023 Corolla Cross Toyota Safety Sense Drops Out for ~4 Seconds - Forward Camera Software (Campaign 23TC01) | 2023-2024 Corolla Cross Hybrid Temporary Hard Brake Pedal - Recall 24V-708 | 2023-2025 Corolla Cross Hybrid Reverse Pedestrian Alert - Recall 26V-203 | 2023-2025 Corolla Cross Toyota Multimedia Connectivity or Reboot Concerns - Diagnosis Required | 2024 Corolla Cross Low-Speed Brake Squeal or Squeak — Owner Reports | 2026 Corolla Cross Hybrid Inverter Terminal Bolt Improperly Torqued - Loss of Power or Fire Risk (Recall 25V869) | Cabin Road Noise or Booming on Rough Pavement — Owner Reports | Corolla Cross Hybrid 12-Volt No-READY Events After Sitting — Owner Reports | Fuel-Gauge Reading or Fill-Amount Concern — Owner Reports | LED Low-Beam Headlights - Dim Night Output and Dark Bands in the Beam Pattern | Milky or Discolored Engine Oil and Low Oil Pressure Warning in Freezing Weather - M20A-FKS/FXS (T-SB-0104-21 Rev2) | Rattle at Speed or While Climbing — Owner Reports | Roof Rails Lift, Gap or Detach at the Rear Attachment Point",
    "forums": ""
  }
]

const EXCLUSIONS = [
  {
    "make": "Audi",
    "model": "Q3",
    "existingTitles": [
      "2015 Audi Q3 Sunroof-Control Recall 60C1 / NHTSA 15V200",
      "2015-2018 Audi Q3 Coolant-Module Leak TSB 2061604/5",
      "2019 Audi Q3 Steering-Rack Recall 48P7 / NHTSA 21V027",
      "2020 Audi Q3 Brake-Pedal Recall 46i7 / NHTSA 20V786",
      "2020-2024 Audi Q3 Coolant-Pump Leak TSB 2071515/1",
      "2022 Audi Q3 Rearview-Camera Recall 91Ei / NHTSA 22V806",
      "Carbon Buildup on Intake Valves (Direct Injection)",
      "EA888 Timing Chain Tensioner Failure",
      "Excessive Oil Consumption (2.0 TFSI Engine)",
      "Timing Chain Tensioner Failure (2.0 TFSI Engine)"
    ]
  },
  {
    "make": "Buick",
    "model": "Cascada",
    "existingTitles": [
      "1.6L LWC PCV Pressure Regulator Diaphragm Cracks Inside Camshaft Cover — P0171, Vacuum Whistle (GM Special Coverage N192291620 / N232395320)",
      "1.6L LWC Turbocharger Wastegate Actuator Solenoid & Bypass Valve Port Fittings Damaged During Service",
      "Cargo Partition Magnet/Sensor Misread Locks Out Roof — \"Extend Cargo Shade To Operate Top\"",
      "Cascada 1.6L Turbo (Opel SIDI) Timing Chain & Carbon Buildup",
      "Convertible Top Stowage Flap Motors: Stripped Plastic Gears / Failed Microswitch Halt Roof Mid-Cycle",
      "Heated Rear Glass Debonding From Soft Top Fabric (Insufficient Primer On Early Build)",
      "Incorrect Convertible Roof Control Module Allows Unsafe Remote Window Closing — Recall 16V844000 (GM 16126)",
      "IntelliLink Head Unit Freezes And Drops Camera, Bluetooth And Steering Wheel Controls",
      "Parasitic Battery Drain — Tail Lamp Diagnostic Request Wakes The BCM And Keeps The Bus Awake",
      "Rear Quarter Window Cavity Drains Blocked — Water Sloshing, Soaked Rear Carpet (GM 17-NA-149)"
    ]
  },
  {
    "make": "Volvo",
    "model": "S90",
    "existingTitles": [
      "Auxiliary Coolant Pump Leak",
      "Pilot Assist and Adaptive Cruise Control Malfunction",
      "Rear Air Suspension Strut and Compressor Failure",
      "Rearview Camera Does Not Display in Reverse — FMVSS 111 Recall (Volvo R10333)",
      "Recall 25V179000 — S90 Recharge High-Voltage Battery Short Circuit Fire Risk",
      "S90 Low-Pressure Fuel Pump Can Blow a Fuse and Quit (Safety Recall 21V414000)",
      "S90 Rear Visibility Recall: Camera Image May Not Display in Reverse",
      "S90L Automatic Emergency Braking Software Incompatibility (NHTSA Recall 20V144000)",
      "Sensus Infotainment System Lag, Crashes, and Black Screen",
      "T6 Twin-Charged Engine Coolant Crossover Pipe Leak"
    ]
  },
  {
    "make": "Volkswagen",
    "model": "ID. Buzz",
    "existingTitles": [
      "12V Auxiliary Battery Drain and Dead Battery",
      "Cabin and Battery Preconditioning Fails to Run Below Freezing, Leaving Cold-Soaked Pack and Iced Glass",
      "Charge Port Door Sticking or Not Opening",
      "Infotainment System Freezing and Touchscreen Unresponsive",
      "Instrument Cluster Displays European Brake Telltale Instead of Required Red \"BRAKE\" Warning (FMVSS 135/101 Recall)",
      "OTA Software Updates Required for EV Systems",
      "Power Sliding Door Alignment and Operation Issues",
      "Single-Mode Regeneration and Poorly Blended Brake Pedal Produce Long, Soft, Then Abrupt Stops",
      "Spurious Electronic Child-Lock and Door-Entry Faults Lock Out Sliding Door Interior Releases",
      "Third-Row Bench Seat Too Wide for Its Two Seat Belts (FMVSS 208 Noncompliance Recall)"
    ]
  },
  {
    "make": "Mazda",
    "model": "MX-6",
    "existingTitles": [
      "Clutch Slave Cylinder Failure (Manual)",
      "Distributor Failure on V6 Models",
      "Distributor Oil Leak and Failure Causing No-Spark Condition",
      "EGR Valve Carbon Buildup Causing Rough Idle and P0400 Codes",
      "Front Suspension Knock from Worn Sway Bar End Links and Strut Mounts",
      "GF4A-EL Automatic Transmission Harsh Shifts and Failure",
      "Ignition Switch Overheating from Conductive Contact Grease (Recall 15V674)",
      "Power Window Regulator Cable Snap",
      "Timing Belt Failure Strands Car (Non-Interference but Stops Engine)",
      "Transmission Mount Failure"
    ]
  },
  {
    "make": "Ford",
    "model": "Fiesta",
    "existingTitles": [
      "1.0L EcoBoost Degas Hose Coolant Loss & \"EcoBoom\" Overheating Engine Failure",
      "1.6L EcoBoost Intake-Valve Carbon Buildup (Direct Injection)",
      "Blend Door Actuator Failure — Stuck on Heat or Cold",
      "Coil Spring Fracture — Snapped Suspension Spring",
      "Door Latch Failure — Doors May Open While Driving",
      "DPS6 PowerShift Dual-Clutch Transmission Shudder, Slipping, and Failure",
      "Electric Power Steering (EPS) Assist Fault — Sudden Loss of Assist",
      "Electronic Throttle Body Failure — Sudden Limp Mode & Wrench Light",
      "EVAP Canister Purge Valve Failure",
      "Fiesta ST Rear Motor Mount (Dogbone) Bushing Failure — Vibration & Wheel Hop",
      "Ignition Coil / Spark Plug Misfire — Oil-Fouled Coils & Water Ingress in Plug Wells",
      "In-Tank Fuel Pump Failure — Stall Without Warning (Recall 15V005000)",
      "Manual Transmission Clutch Judder & Slave/Release Cylinder Failure",
      "Power Window Regulator / Cable Failure — Glass Drops Into Door",
      "Rear Suspension Knock — Worn Rear Shock Top Mounts & Damper Bushings",
      "SYNC / APIM Infotainment Freezing, Rebooting & Bluetooth/CarPlay Dropouts",
      "TDCi Diesel DPF Blockage & Failed Regeneration (Short-Trip Use)",
      "Thermostat Housing Coolant Leak",
      "Water Leak Into Footwell — Blocked Scuttle Drain / Pollen-Filter Housing",
      "Wet Belt (Belt-in-Oil) Timing Belt Degradation Clogging Oil Pump Pickup"
    ]
  },
  {
    "make": "Mercedes-Benz",
    "model": "GLS",
    "existingTitles": [
      "48V Ground Connection Overheating and Fire Risk (Recall 24V207)",
      "4MATIC Transfer Case Bearing Wear, Whine and Drivetrain Lock-Up Risk",
      "9G-Tronic Harsh Shift",
      "AIRMATIC Air Suspension Failure",
      "Battery Drain from 48V System",
      "Engine Stall from Transmission Control Unit Software (Recall 24V118)",
      "M256 Engine Excessive Oil Consumption and Piston Ring Wear",
      "MBUX Infotainment Freezing, Black Screen and Random Reboots",
      "OM656 Diesel CP4 High-Pressure Fuel Pump Sensitivity and Injector Damage",
      "OM656 Diesel Emissions System Clogging (EGR/DPF/AdBlue SCR) and Limp Mode",
      "Panoramic Sunroof Water Leak"
    ]
  },
  {
    "make": "Buick",
    "model": "Encore",
    "existingTitles": [
      "2019 Encore Air Bag Non-Deployment - SDM Not Taken Out of Manufacturing Mode",
      "6T40 Automatic Transmission Hard Shifting, Shudder and Slipping",
      "Encore 1.4L Turbo (LUJ/LUV) Timing Chain Stretch",
      "Encore GX (2020+) Three-Cylinder Turbo Stalling and Low-Oil-Pressure ECM Recall",
      "Encore GX Transmission Shudder, Jerking and Solenoid Faults",
      "Engine Stalling and Sudden Power Loss While Driving (Early Models)",
      "EVAP Purge Pump Failure (2022 Encore) - Warranty Extension",
      "Excessive Oil Consumption (1.4L Turbo)",
      "PCV / Camshaft Cover Diaphragm Failure (1.4L Turbo) - \"Tea Kettle\" Whistle",
      "Transmission Fluid Leak From an Under-Bolted Start/Stop Accumulator (Recall 20V668000)",
      "Turbocharger / Oil Supply Line Failure Causing Sudden Loss of Power"
    ]
  },
  {
    "make": "BMW",
    "model": "M340i",
    "existingTitles": [
      "12V Battery Drain and Failure / Battery Registration Issues",
      "2019-2022 M340i Seat-Belt Warning Recall 23V-584",
      "2020 M340i Brake-Assist Recall 21V-598",
      "Coolant Loss from Expansion Tank and Water Pump",
      "High-Pressure Fuel Pump (HPFP) Failure",
      "Intake Valve Carbon Buildup",
      "Oil Filter Disintegration in Housing",
      "Turbo Wastegate Rattle at Idle",
      "Valve Cover and Oil Filter Housing Gasket Oil Leaks (B58)",
      "VANOS Solenoid O-Ring Failure",
      "ZF 8HP Harsh / Jerky Low-Speed Shifting and Mechatronic Faults"
    ]
  },
  {
    "make": "Infiniti",
    "model": "G37",
    "existingTitles": [
      "Cam Cover Gasket Leak Causing Low Oil Pressure",
      "Clogged Sunroof Drains Causing Cabin Water Leaks and Electrical Faults",
      "Concentric Slave Cylinder Failure (Manual)",
      "Dashboard Melts, Turns Sticky, and Cracks Causing Windshield Glare",
      "Electronic Steering Lock Failure",
      "OCS Varistor Defect Suppresses Passenger Airbag (Recall 08V521000)",
      "Oil Gallery Gasket Leak",
      "Power Window Auto-Reverse Threshold Out of Specification (Recall 11V538000)",
      "Timing Chain Stretch and Guide Wear on VQ37VHR",
      "VQ37VHR Excessive Oil Consumption on Early Engines",
      "VVEL Actuator and Control Module Failure Causing Limp Mode"
    ]
  },
  {
    "make": "Audi",
    "model": "R8",
    "existingTitles": [
      "5.2 V10 Excessive Oil Consumption",
      "5.2 V10 Oil Pump Driveshaft Seal Timing-Case Oil Leak",
      "A/C Compressor Failure Requiring Engine-Out Repair (4.2 V8)",
      "Carbon Buildup on Intake Valves (4.2 V8 FSI and 5.2 V10 FSI)",
      "Carbon Fiber Sideblade and Trim Clear-Coat Peeling",
      "Catalytic Converter Failure Requiring Engine-Out Replacement",
      "Coolant Expansion Tank Cracking and Cooling System Leaks",
      "Direct-Injection Fuel Injector Failure",
      "Front Axle Hydraulic Lift System Pump Failure",
      "Front-Passenger Airbag Module May Explode or Deploy Improperly (Recall 22V543 / 69DY)",
      "Gearbox Underfilled: Clutch Slippage or Transmission-Oil Leak (Recall 22V225 / 37O1)",
      "Gearbox Ventilation Hose Can Leak Fluid Near Hot Engine Parts (Recall 18V639 / 34J1)",
      "Ignition Coil Pack Failure Causing Misfires",
      "LED Headlight / DRL Module Failure and Flickering",
      "Magnetic Ride Damper Fluid Leaks",
      "Magnetic Ride Suspension Damper Leak and Premature Failure",
      "R tronic Hydraulic Pump and Pressure Accumulator Failure",
      "R-Tronic Clutch Premature Wear and Expensive Replacement",
      "R8 Spyder Fuel Supply Line Can Chafe on Heat Shield (Recall 11V390 / 20Q8)",
      "Rod Bearing Wear and Engine Failure Risk (4.2 V8 FSI)",
      "S-tronic Transmission Actuator Failure",
      "Spyder Convertible Top Hydraulic Pump Failure"
    ]
  },
  {
    "make": "Toyota",
    "model": "Corolla Cross",
    "existingTitles": [
      "\"12-Volt Battery Charging System Malfunction\" Warning From Insufficient Alternator Output - Long Parts Backorder",
      "2022 Corolla Cross Power Liftgate Unlatches but Does Not Raise — Owner Report",
      "2022 Corolla Cross Rear Clunk or Harsh Bang Over Bumps — Owner Report",
      "2022-2023 Corolla Cross Passenger-Airbag Panel - Recalls 23V-384 and 23V-864",
      "2022-2023 Corolla Cross Stop & Start Restart-Failure Reports - Diagnosis Required",
      "2022-2025 Corolla Cross BSM Limitations or Unavailable Warning - Diagnosis Required",
      "2023 Corolla Cross Driver-Airbag Spiral Cable - Recalls 23V-480 and 25V-040",
      "2023 Corolla Cross Hybrid XSE Whistling Noise — Owner Report",
      "2023 Corolla Cross PCS Forward-Camera Software - Campaign 25TC03",
      "2023 Corolla Cross Toyota Safety Sense Drops Out for ~4 Seconds - Forward Camera Software (Campaign 23TC01)",
      "2023-2024 Corolla Cross Hybrid Temporary Hard Brake Pedal - Recall 24V-708",
      "2023-2025 Corolla Cross Hybrid Reverse Pedestrian Alert - Recall 26V-203",
      "2023-2025 Corolla Cross Toyota Multimedia Connectivity or Reboot Concerns - Diagnosis Required",
      "2024 Corolla Cross Low-Speed Brake Squeal or Squeak — Owner Reports",
      "2026 Corolla Cross Hybrid Inverter Terminal Bolt Improperly Torqued - Loss of Power or Fire Risk (Recall 25V869)",
      "Cabin Road Noise or Booming on Rough Pavement — Owner Reports",
      "Corolla Cross Hybrid 12-Volt No-READY Events After Sitting — Owner Reports",
      "Fuel-Gauge Reading or Fill-Amount Concern — Owner Reports",
      "LED Low-Beam Headlights - Dim Night Output and Dark Bands in the Beam Pattern",
      "Milky or Discolored Engine Oil and Low Oil Pressure Warning in Freezing Weather - M20A-FKS/FXS (T-SB-0104-21 Rev2)",
      "Rattle at Speed or While Climbing — Owner Reports",
      "Roof Rails Lift, Gap or Detach at the Rear Attachment Point"
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
log(`Wave 20: ${TARGETS.length} targets — ${Object.entries(byStyle).map(([k, v]) => `${k}:${v}`).join('  ')}`)

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
log(`WAVE 20 TOTAL: ${confirmed.length}/${totalFound} confirmed, ${totalOfficial} official-backed, ${totalForum} forum-backed`)

return { result: { confirmed, stats: { models: TARGETS.length, found: totalFound, confirmed: confirmed.length, forumBacked: totalForum, officialBacked: totalOfficial, byStyle: styleTotals, perModel: perModelStats } } }
