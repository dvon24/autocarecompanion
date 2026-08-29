/**
 * RESEARCH WAVE 16 — DEMAND-DRIVEN THIN NAMEPLATES.
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
 * DOWNSTREAM: save to data/research-wave16-<date>.json, then
 * _persist-known-issues-run.js -> _promote-pending-review.js -> _check-tonight-dupes.js.
 * Do NOT deploy; hand off to Sol.
 */
export const meta = {
  name: 'research-wave16-demand-driven',
  description: 'Wave-16: 12 thin nameplates chosen by interest-email demand. Style-selected discover prompt + adversarial verify',
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
    "note": "Only 11 documented issues on this nameplate. 3 interest-email leads asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 48V Mild-Hybrid (EQ Boost) Integrated Starter-Generator Failure | 9G-Tronic Harsh Shifting | Air Suspension Compressor Failure | Cold-Start Camshaft Adjuster (Magnet/Solenoid) Rattle | Crankcase Vent (PCV) Valve Failure with Engine Harness Oil Contamination | Diesel Timing Chain Tensioner Seal Oil Leak and Chain Stretch (OM651) | Fuel Pump Shutdown Causing Loss of Drive Power (Recall) | MBUX Infotainment System Freeze | Panoramic Sunroof Creak and Rattle | Rear Brake Squeal and Premature Rear Pad Wear | Steering Coupling Bolt Loosening / Loss of Steering Control (Recall)",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Genesis",
    "model": "G90",
    "yearsHint": "2017-2026",
    "note": "Only 16 documented issues on this nameplate. 4 interest-email leads asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 5.0L Tau V8 GDI intake-valve carbon buildup and some oil consumption | 8-speed automatic harsh/jerky upshifts and low-speed lurch (solenoid TSB) | Air suspension failures — leaking air struts/bags, compressor burnout and rear sag | Blank instrument cluster on startup due to LG software logic error | Coolant leaks from water pump and thermostat housing | Fuel crossover pipe leaks at engine rail (under-torqued fasteners) - fire risk | Infotainment/navigation screen freezes or goes blank, requiring reboot | Intermittent dashboard warning cascade with electronic parking brake lockout | Left turbocharger oil feed pipe cracks and leaks oil onto exhaust manifold, causing engine-compartment fire | Low-pressure fuel pump impeller deforms in heat, causing stalling (NHTSA Recall 24V282000) | Panoramic sunroof creaking, rattling and wind noise (loose/under-torqued frame bolts) | Power trunk fails to close/latch or release, often due to lid misalignment | Repeated 12V battery drain / dead battery from head unit and modules drawing power when parked | Savile Silver paint reflects corner radar, triggering phantom automatic emergency braking (Highway Drive Assist) | Seat-belt pretensioner over-pressurization can rupture and eject metal fragments | Water intrusion into starter solenoid causes electrical short and engine-compartment fire",
    "forums": ""
  },
  {
    "style": "new",
    "make": "Genesis",
    "model": "GV70",
    "yearsHint": "2022-2026",
    "note": "Only 18 documented issues on this nameplate. 4 interest-email leads asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 12V Auxiliary Battery Drain and Dead-Battery 'Bricking' | 8-Speed Automatic Jerky Downshift Syndrome (JDS) and Throttle Response Lag (Gasoline Models) | A/C Not Cooling / Weak Cooling on One Side | Electrified GV70 Range Inconsistency | Forward Collision-Avoidance Assist Phantom / Unwanted Automatic Emergency Braking | Front Brake Squeal and Dust | Fuel Pipe-to-Rail Connection Leak Fire Risk | Fuel Pump Failure Can Cut Drive Power on 2022-2023 GV70 (Recall 24V282000) | Headlight Assembly Moisture and Condensation Buildup | ICCU Failure Causing Loss of Drive Power (Electrified GV70) | Infotainment Screen Freeze and Reboot | Instrument Cluster Blank or Flickering at Startup | Low-Pressure Fuel Pump Impeller Failure Causing Stalling | Paint Color Mismatch Between Plastic Trim and Metal Body Panels (Uyuni White) | Panoramic Sunroof / Headliner Rattle and Wind Noise | Rear Differential / eLSD Whine and Repeat Carrier Failure | Sunroof Drain Clog Causing Water Leak Into Cabin | Transmission Harness Water Leak Causing Park-to-Neutral Rollaway",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Mazda",
    "model": "Tribute",
    "yearsHint": "2001-2011",
    "note": "Only 5 documented issues on this nameplate. 1 interest-email lead asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: CD4E Transmission Failure | Ignition Coil Failure and Misfires | Rear Differential Vibration and Noise | Rear Subframe Corrosion and Control Arm Bushing Failure | Transfer Case Output Seal Leak (AWD Models)",
    "forums": ""
  },
  {
    "style": "new",
    "make": "Volkswagen",
    "model": "ID. Buzz",
    "yearsHint": "2024-2026",
    "note": "Only 5 documented issues on this nameplate. 1 interest-email lead asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 12V Auxiliary Battery Drain and Dead Battery | Charge Port Door Sticking or Not Opening | Infotainment System Freezing and Touchscreen Unresponsive | OTA Software Updates Required for EV Systems | Power Sliding Door Alignment and Operation Issues",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "GMC",
    "model": "Terrain",
    "yearsHint": "2010-2025",
    "note": "Only 15 documented issues on this nameplate. 3 interest-email leads asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 1.5L Turbo PCV System Failure and Coolant/Oil Intrusion | 2.4L I4 Excessive Oil Consumption and Piston Ring Failure | 6T40/6T45 6-Speed Transmission Shudder and Harsh Shifts | Door Striker Fracture Allowing a Door to Open While Driving (Recall 23V869000) | Ecotec 2.4L Timing Chain and Tensioner Failure | Electric Power Steering Sticking / Increased Steering Effort | Electronic Shifter Fault - Vehicle Stuck in Park / \"Shift to Park\" Message | Engine-Driven Brake Vacuum Pump Failure - Sudden Loss of Power Brake Assist (Hard Pedal) | High-Pressure Fuel Pump Failure Causing Engine Stall (Recall) | HVAC Blend Door Actuator Failure (Clicking Noise, No Temperature Control) | IntelliLink Infotainment Freezing/Rebooting and Backup Camera Black Screen | Start/Stop Transmission Accumulator Endcap Missing Bolts - Fluid Leak & Loss of Propulsion (Recall) | Throttle Body / Throttle Position Sensor Failure - 'Reduced Engine Power' Warning | Water Pump Failure and Coolant Leak | Windshield Wiper Module Ball Joint Corrosion Causing Inoperative Wipers (Recall 16V582000)",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Audi",
    "model": "S5",
    "yearsHint": "2008-2025",
    "note": "Only 6 documented issues on this nameplate. 1 interest-email lead asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 2010-2017 S5 3.0L Crankcase-Breather P052E00 - Body/Year Diagnosis | 2018 S5 3.0L Mechanical Coolant-Pump Fault P000000/33688 - Diagnosis Required | 3.0T Supercharger Intercooler Pump Failure | Crankshaft Pulley (Harmonic Balancer) Failure (3.0T) | Direct Injection Carbon Buildup | Thermostat and Water Pump Assembly Failure",
    "forums": ""
  },
  {
    "style": "new",
    "make": "Volkswagen",
    "model": "Atlas Cross Sport",
    "yearsHint": "2020-2025",
    "note": "Only 6 documented issues on this nameplate. 1 interest-email lead asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 2.0T Turbo Lag and Hesitation Under Load | 8-Speed Automatic Transmission Shudder | MIB3 Infotainment System Freezing and Rebooting | Panoramic Sunroof Creaking and Rattling | Rear Taillight Seal Water Intrusion | Rearview Camera Image Fails to Display (NHTSA Recall 22V514000, VW Code 91DV)",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Cadillac",
    "model": "DeVille",
    "yearsHint": "1994-2005",
    "note": "Only 6 documented issues on this nameplate. 1 interest-email lead asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: High Oil Use Needs a Measured Consumption Test Before Repair (01-06-01-011O) | HVAC Blend Door Actuator Failure | Key Ring Weight Can Knock the Ignition Out of Run - Recall 14V355000 | Northstar 4.6L Engine Oil Leak (Rear Main Seal and Crankcase) | Northstar 4.6L V8 Head Bolt/Head Gasket Failure | Recall 03V238000: Fuel Tank Pressure Sensor Can Cause Fuel Leak and Fire",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Mazda",
    "model": "MPV",
    "yearsHint": "1989-2007",
    "note": "Only 6 documented issues on this nameplate. 1 interest-email lead asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: Alternator Premature Failure | Automatic Transmission Shudder and Failure | Automatic Transmission Slipping and Harsh Shifting | Ignition Switch Grease Can Turn Conductive and Overheat (Recall 15V674) | Power Sliding Door Malfunction | Rear Coil Spring Corrosion and Fracture",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Audi",
    "model": "RS3",
    "yearsHint": "2015-2025",
    "note": "Only 6 documented issues on this nameplate. 1 interest-email lead asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 2.5T Five-Cylinder Carbon Buildup | 2015-2018 / Certain 2019 RS3 Magnetic-Ride Rear Shock Noise - TSB 2059240/1 | 2017-2020 / 2022-2023 RS3 Drive-System Warning or No-Start Diagnosis - TSB 2067757/3 | 2023 RS3 TCM Software Emissions Recall 37P3 - VIN Check Required | Fuel Injector Failure and \"Torch Effect\" (2.5T) | Severe Carbon Buildup on Intake Valves (2.5T 5-Cylinder)",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Nissan",
    "model": "Frontier",
    "yearsHint": "2000-2026",
    "note": "Only 19 documented issues on this nameplate. 3 interest-email leads asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 9-Speed Automatic Parking Pawl Rollaway Recall | Distributor / Ignition System Failure Causing Sudden Stall or No-Start | EVAP Canister and Vent Control Valve Failure Triggering Check Engine Light | Exhaust Manifold Stud Breakage and Manifold Leak Tick | Frame Rust and Corrosion (Recall R1601) | Front Brake Rotor Warping / Brake Judder Under Moderate Braking | Fuel Sending Unit Failure and Inaccurate Gauge | Improperly Welded Door Strikers Can Break — Recall 26V023000 | Infotainment Screen Freezing, Rebooting, and Apple CarPlay/Android Auto Dropouts | Intermittent No-Start or Stall from Faulty Start/Stop Logic and ECM Software | IPDM ECM Relay Defect on 2005-2006 Frontier (Safety Recall 10V517000) | Power Window Regulator and Window Motor Failure | Radiator SMOD - Strawberry Milkshake of Death (Transmission Cooler Failure) | Rear Axle / Differential Whine at Highway Speeds | Rear Differential Bushing Clunk | Rear Leaf Spring Sag and Flat Bed Syndrome | Steering Knuckle / Front Suspension Bolt Loosening Recall | Timing Chain Guide and Tensioner Failure (VQ40DE) | Timing Chain Rattle and Failure (QR25DE 4-Cylinder)",
    "forums": ""
  }
]

const EXCLUSIONS = [
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
    ]
  },
  {
    "make": "Genesis",
    "model": "G90",
    "existingTitles": [
      "5.0L Tau V8 GDI intake-valve carbon buildup and some oil consumption",
      "8-speed automatic harsh/jerky upshifts and low-speed lurch (solenoid TSB)",
      "Air suspension failures — leaking air struts/bags, compressor burnout and rear sag",
      "Blank instrument cluster on startup due to LG software logic error",
      "Coolant leaks from water pump and thermostat housing",
      "Fuel crossover pipe leaks at engine rail (under-torqued fasteners) - fire risk",
      "Infotainment/navigation screen freezes or goes blank, requiring reboot",
      "Intermittent dashboard warning cascade with electronic parking brake lockout",
      "Left turbocharger oil feed pipe cracks and leaks oil onto exhaust manifold, causing engine-compartment fire",
      "Low-pressure fuel pump impeller deforms in heat, causing stalling (NHTSA Recall 24V282000)",
      "Panoramic sunroof creaking, rattling and wind noise (loose/under-torqued frame bolts)",
      "Power trunk fails to close/latch or release, often due to lid misalignment",
      "Repeated 12V battery drain / dead battery from head unit and modules drawing power when parked",
      "Savile Silver paint reflects corner radar, triggering phantom automatic emergency braking (Highway Drive Assist)",
      "Seat-belt pretensioner over-pressurization can rupture and eject metal fragments",
      "Water intrusion into starter solenoid causes electrical short and engine-compartment fire"
    ]
  },
  {
    "make": "Genesis",
    "model": "GV70",
    "existingTitles": [
      "12V Auxiliary Battery Drain and Dead-Battery 'Bricking'",
      "8-Speed Automatic Jerky Downshift Syndrome (JDS) and Throttle Response Lag (Gasoline Models)",
      "A/C Not Cooling / Weak Cooling on One Side",
      "Electrified GV70 Range Inconsistency",
      "Forward Collision-Avoidance Assist Phantom / Unwanted Automatic Emergency Braking",
      "Front Brake Squeal and Dust",
      "Fuel Pipe-to-Rail Connection Leak Fire Risk",
      "Fuel Pump Failure Can Cut Drive Power on 2022-2023 GV70 (Recall 24V282000)",
      "Headlight Assembly Moisture and Condensation Buildup",
      "ICCU Failure Causing Loss of Drive Power (Electrified GV70)",
      "Infotainment Screen Freeze and Reboot",
      "Instrument Cluster Blank or Flickering at Startup",
      "Low-Pressure Fuel Pump Impeller Failure Causing Stalling",
      "Paint Color Mismatch Between Plastic Trim and Metal Body Panels (Uyuni White)",
      "Panoramic Sunroof / Headliner Rattle and Wind Noise",
      "Rear Differential / eLSD Whine and Repeat Carrier Failure",
      "Sunroof Drain Clog Causing Water Leak Into Cabin",
      "Transmission Harness Water Leak Causing Park-to-Neutral Rollaway"
    ]
  },
  {
    "make": "Mazda",
    "model": "Tribute",
    "existingTitles": [
      "CD4E Transmission Failure",
      "Ignition Coil Failure and Misfires",
      "Rear Differential Vibration and Noise",
      "Rear Subframe Corrosion and Control Arm Bushing Failure",
      "Transfer Case Output Seal Leak (AWD Models)"
    ]
  },
  {
    "make": "Volkswagen",
    "model": "ID. Buzz",
    "existingTitles": [
      "12V Auxiliary Battery Drain and Dead Battery",
      "Charge Port Door Sticking or Not Opening",
      "Infotainment System Freezing and Touchscreen Unresponsive",
      "OTA Software Updates Required for EV Systems",
      "Power Sliding Door Alignment and Operation Issues"
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
    ]
  },
  {
    "make": "Audi",
    "model": "S5",
    "existingTitles": [
      "2010-2017 S5 3.0L Crankcase-Breather P052E00 - Body/Year Diagnosis",
      "2018 S5 3.0L Mechanical Coolant-Pump Fault P000000/33688 - Diagnosis Required",
      "3.0T Supercharger Intercooler Pump Failure",
      "Crankshaft Pulley (Harmonic Balancer) Failure (3.0T)",
      "Direct Injection Carbon Buildup",
      "Thermostat and Water Pump Assembly Failure"
    ]
  },
  {
    "make": "Volkswagen",
    "model": "Atlas Cross Sport",
    "existingTitles": [
      "2.0T Turbo Lag and Hesitation Under Load",
      "8-Speed Automatic Transmission Shudder",
      "MIB3 Infotainment System Freezing and Rebooting",
      "Panoramic Sunroof Creaking and Rattling",
      "Rear Taillight Seal Water Intrusion",
      "Rearview Camera Image Fails to Display (NHTSA Recall 22V514000, VW Code 91DV)"
    ]
  },
  {
    "make": "Cadillac",
    "model": "DeVille",
    "existingTitles": [
      "High Oil Use Needs a Measured Consumption Test Before Repair (01-06-01-011O)",
      "HVAC Blend Door Actuator Failure",
      "Key Ring Weight Can Knock the Ignition Out of Run - Recall 14V355000",
      "Northstar 4.6L Engine Oil Leak (Rear Main Seal and Crankcase)",
      "Northstar 4.6L V8 Head Bolt/Head Gasket Failure",
      "Recall 03V238000: Fuel Tank Pressure Sensor Can Cause Fuel Leak and Fire"
    ]
  },
  {
    "make": "Mazda",
    "model": "MPV",
    "existingTitles": [
      "Alternator Premature Failure",
      "Automatic Transmission Shudder and Failure",
      "Automatic Transmission Slipping and Harsh Shifting",
      "Ignition Switch Grease Can Turn Conductive and Overheat (Recall 15V674)",
      "Power Sliding Door Malfunction",
      "Rear Coil Spring Corrosion and Fracture"
    ]
  },
  {
    "make": "Audi",
    "model": "RS3",
    "existingTitles": [
      "2.5T Five-Cylinder Carbon Buildup",
      "2015-2018 / Certain 2019 RS3 Magnetic-Ride Rear Shock Noise - TSB 2059240/1",
      "2017-2020 / 2022-2023 RS3 Drive-System Warning or No-Start Diagnosis - TSB 2067757/3",
      "2023 RS3 TCM Software Emissions Recall 37P3 - VIN Check Required",
      "Fuel Injector Failure and \"Torch Effect\" (2.5T)",
      "Severe Carbon Buildup on Intake Valves (2.5T 5-Cylinder)"
    ]
  },
  {
    "make": "Nissan",
    "model": "Frontier",
    "existingTitles": [
      "9-Speed Automatic Parking Pawl Rollaway Recall",
      "Distributor / Ignition System Failure Causing Sudden Stall or No-Start",
      "EVAP Canister and Vent Control Valve Failure Triggering Check Engine Light",
      "Exhaust Manifold Stud Breakage and Manifold Leak Tick",
      "Frame Rust and Corrosion (Recall R1601)",
      "Front Brake Rotor Warping / Brake Judder Under Moderate Braking",
      "Fuel Sending Unit Failure and Inaccurate Gauge",
      "Improperly Welded Door Strikers Can Break — Recall 26V023000",
      "Infotainment Screen Freezing, Rebooting, and Apple CarPlay/Android Auto Dropouts",
      "Intermittent No-Start or Stall from Faulty Start/Stop Logic and ECM Software",
      "IPDM ECM Relay Defect on 2005-2006 Frontier (Safety Recall 10V517000)",
      "Power Window Regulator and Window Motor Failure",
      "Radiator SMOD - Strawberry Milkshake of Death (Transmission Cooler Failure)",
      "Rear Axle / Differential Whine at Highway Speeds",
      "Rear Differential Bushing Clunk",
      "Rear Leaf Spring Sag and Flat Bed Syndrome",
      "Steering Knuckle / Front Suspension Bolt Loosening Recall",
      "Timing Chain Guide and Tensioner Failure (VQ40DE)",
      "Timing Chain Rattle and Failure (QR25DE 4-Cylinder)"
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
log(`Wave 14: ${TARGETS.length} targets — ${Object.entries(byStyle).map(([k, v]) => `${k}:${v}`).join('  ')}`)

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
log(`WAVE 14 TOTAL: ${confirmed.length}/${totalFound} confirmed, ${totalOfficial} official-backed, ${totalForum} forum-backed`)

return { result: { confirmed, stats: { models: TARGETS.length, found: totalFound, confirmed: confirmed.length, forumBacked: totalForum, officialBacked: totalOfficial, byStyle: styleTotals, perModel: perModelStats } } }
