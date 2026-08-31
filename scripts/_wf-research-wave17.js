/**
 * RESEARCH WAVE 17 — DEMAND-DRIVEN THIN NAMEPLATES.
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
 * DOWNSTREAM: save to data/research-wave17-<date>.json, then
 * _persist-known-issues-run.js -> _promote-pending-review.js -> _check-tonight-dupes.js.
 * Do NOT deploy; hand off to Sol.
 */
export const meta = {
  name: 'research-wave17-demand-driven',
  description: 'Wave-17: 12 thin nameplates chosen by interest-email demand. Style-selected discover prompt + adversarial verify',
  phases: [
    { title: 'Discover' },
    { title: 'Verify' },
  ],
}

const TARGETS = [
  {
    "style": "new",
    "make": "Cadillac",
    "model": "XT6",
    "yearsHint": "2020-2025",
    "note": "Only 17 documented issues on this nameplate. 7 interest-email leads asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 2020 XT6 Start/Stop Accumulator May Be Missing Endcap Bolts — Recall 20V668000 | 2021 XT6 Fuel Supply Line May Separate and Leak — Recall 21V422 | 2022 XT6 Left-Rear Toe Link May Be Loose or Separate — Recall 22V427 | 3.6L LGX Engine Oil Migrating Into the Cooling System Through Block Porosity — Overheating with Sludge in the Radiator | 3.6L V6 Timing Chain Concern (XT6) | 9-Speed Automatic Transmission Shudder and Harsh Shifts | Auto Start-Stop Harshness and Battery Issues | AWD Power Transfer Unit Fluid Leak | Electric Power Steering Rack Failure — \"Steering Assist Is Reduced / Service Power Steering\" with C0460 or C0545 | Incorrect Transmission Sun Gear Lets the Driver-Side Half-Shaft Disengage — Recall 23V172 | Instrument Panel Fails to Illuminate Hazard, High-Beam and Turn-Signal Telltales — Software Recall 24V459 | Loss of Cabin Heat Caused by an Engine Control Module Software Anomaly — Bulletin 22-NA-094 | Low-Speed TCC Shudder Must Be Confirmed Before a Fluid Drain and Fill | Rearview Camera Cuts Out Due to Bad Coaxial Cable Crimp on Surround Vision-Equipped XT6 (Recall 22V709000) | Recall 22V446000: Fuel Tank Rollover Valve May Fail to Seal on 2022 XT6 | Water Leaks Into the Interior Through Pinholes in the Roof Panel Laser Braze — Wet Carpet and Inoperative Liftgate Actuator | Windshield Not Properly Bonded to the Body — Missing Urethane Sealant, Recall 23V681",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Lincoln",
    "model": "Nautilus",
    "yearsHint": "2019-2026",
    "note": "Only 22 documented issues on this nameplate. 7 interest-email leads asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 2.0L EcoBoost coolant loss / EGR cooler leak — low coolant, white smoke, overheat | 2.7L EcoBoost cold-start VCT rattle (top-front-cover tick/tap on startup) | 8F35 8-speed automatic shudder, buck, and jerk under 35 mph | Auto Start-Stop malfunction / engine won't auto-restart (weak 12V battery) | Both panoramic and center displays go blank while driving (NHTSA recall 25V337 / Ford 25C21, 30,679 units) | EGR Valve Failure Leading to Unexpected Loss of Drive Power (Recall 26S10 / NHTSA 26V122000) | Engine block heater overheats while plugged in — fire risk | Front brake groan/grunt noise on stopping (rotor material defect) | Hybrid 2.0L EcoBoost direct fuel injector failure — broken tips cause engine damage | Hybrid pedestrian warning sound fails at low speed (recall 25SA2) | Image Processing Module A (IPMA) resets — loss of rearview camera and ADAS | Incorrectly manufactured rear shock absorbers damage rear brake hose (recall 23V439 / Ford 23S32) | LED headlight and tail-light driver modules fail due to burnt Schottky diodes (NHTSA recall 25V519 / Ford 25C39, 1,539 Nautilus units) | Panoramic Vista Roof water leaks from clogged sunroof drains | Parasitic 12V battery drain — dead battery after short ownership (CSP 24P14 / 24P08) | Power liftgate inoperative / opens or closes on its own (RGTM software, motor, strut) | Power-window auto-reverse fails to retract — pinch hazard (NHTSA recall 24V953, ~48,000 units) | Rear Drive Unit Underfilled With Lubricant Can Seize — AWD Recall 21S02 (NHTSA 21V011000) | Rearview backup camera blank or distorted image (recall 20V575 / 20C19) | Rearview Camera and ADAS Loss from Image Processing Module Resets (Recall 26V165000) | Rearview Camera Software Error — Blank Image or Image That Won't Clear (Recall 25S72 / NHTSA 25V442) | SYNC 3 / APIM infotainment freezes, black-screens, and reboots",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Cadillac",
    "model": "XT5",
    "yearsHint": "2017-2025",
    "note": "Only 15 documented issues on this nameplate. 4 interest-email leads asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 2022 XT5 Fuel Tank Rollover Valve May Be Dislodged or Missing — Recall 22V446000 | 3.6L V6 Timing Chain Issues (XT5 V6 models) | 8-Speed / 9-Speed Transmission Shudder and Harsh Shifting | Electronic Gear Selector Park-Switch Fault - Persistent 'Shift to Park' Message / Won't Power Down (TSB 19-NA-206) | Engine Thermostat Sticks Open on the 3.6L LGX - Triggers P0128, 'Steering Assist is Reduced' Message and A/C Shutdown | Front Brake Rotor Warping and Pedal Pulsation | Low-Speed TCC Shudder Must Be Confirmed Before a Fluid Drain and Fill | Panoramic Sunroof Glass Spontaneously Shatters at Highway Speed | Power Liftgate Strut Failure and Erratic Operation | Recall 16V802: Front Brake Caliper Piston Seal May Leak Brake Fluid on Early-Build 2017 XT5 | Recall 20V639: AWD Fuel-Pump Mixing-Tube Burr May Cause a Stall | Recall 21V115000: Continental Tires on the 2020 XT5 Were Cured Too Long | Recall 21V422: Improperly Seated Fuel Supply Line Can Separate and Leak Gasoline | Recall 22V427: Left-Rear Suspension Toe Link Fastener May Be Loose on the 2022 XT5 | Recall 22V709: Improperly Crimped Surround Vision Coaxial Cable Kills the Rearview Camera Image",
    "forums": ""
  },
  {
    "style": "new",
    "make": "Chevrolet",
    "model": "Silverado EV",
    "yearsHint": "2024-2026",
    "note": "Only 5 documented issues on this nameplate. 1 interest-email lead asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: Charge Port Door Malfunction | Infotainment Screen Random Reboot | Level 2 Charging Interruptions and EVSE Communication Faults | Propulsion Power Reduced Warning During Towing | Significant Range Loss in Cold Weather",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Toyota",
    "model": "Solara",
    "yearsHint": "1999-2008",
    "note": "Only 5 documented issues on this nameplate. 1 interest-email lead asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 2.4L 2AZ-FE Excessive Oil Consumption | Convertible Top Hydraulic Pump and Cylinder Failure | Convertible Top Motor and Hydraulic System Failure | Dashboard Cracking and Melting in Hot Climates | Dashboard Melting and Becoming Sticky",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Kia",
    "model": "Amanti",
    "yearsHint": "2004-2009",
    "note": "Only 5 documented issues on this nameplate. 1 interest-email lead asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: A/C Compressor Clutch and Coil Failure | Alternator Premature Failure and Voltage Regulator Issues | Automatic Transmission Failure (5-Speed) | Power Steering System Leak | Timing Belt Tensioner Bearing Failure",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Alfa Romeo",
    "model": "Stelvio",
    "yearsHint": "2018-2026",
    "note": "Only 17 documented issues on this nameplate. 3 interest-email leads asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 2.0L Turbo Intake Valve Carbon Buildup Causing Cold-Start Misfire | ABS Hydraulic Control Unit Motor Rotor Shaft Separates Under Hard Braking (Recall 21V-309 / Y24) | Adaptive Cruise Control Cannot Be Switched Off After Wheel Slip (Recall 19V-148 / V27) | Brake Pedal-to-Booster Fastener Improperly Assembled, Pedal Can Detach (Recall 24V-943) | Carbon-Ceramic Brake Rotor Fractures From Excessive Parking-Brake Clamp Force (Recall 23V-382 / 68A) | Front Suspension Knocking and Clunking at Low Speed From End Links and Control Arm Bushings | Fuel Line Sensor Housing Cracks and Leaks Fuel (Recall 21V-878) | Infotainment System Crash and Black Screen | Low-Pressure Fuel Pump Failure Causing Stall (Recall 25V-667) | Panoramic Sunroof Rattle and Wind Noise | Parasitic Battery Drain From Modules Failing to Sleep, Repeat Dead Batteries | Quadrifoglio Engine-to-Radiator Coolant Hose Made From Wrong Material, Leaks and Stalls (Recall 18V-635 / U99) | Transfer Case Fluid Leak | Turbo Oil Line Leak | Water Intrusion at A-Pillar Corrodes Body Control Module Connectors (Recall 18V-205 / U36) | Water Pump Housing and Gasket Leak Causing Slow Coolant Loss | ZF 8HP Harsh 1-2 Shift and Cold-Weather Shift Clunk",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Jaguar",
    "model": "F-PACE",
    "yearsHint": "2017-2023",
    "note": "Only 6 documented issues on this nameplate. 1 interest-email lead asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: Coolant Crossover Pipe Leak on Supercharged V6 | InControl Touch Pro Infotainment System Freeze | Ingenium Engine Water Pump Failure | Panoramic Sunroof Creaking and Popping Noise | Rear Differential Mount Bushing Premature Wear | ZF 8HP Transmission Valve Body Malfunction",
    "forums": ""
  },
  {
    "style": "thin",
    "make": "Alfa Romeo",
    "model": "Giulia",
    "yearsHint": "2017-2026",
    "note": "Only 13 documented issues on this nameplate. 2 interest-email leads asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: Contaminated Brake/Clutch Fluid (Reduced Braking) | Electrical Faults from Water Intrusion / BCM Failure | Front Brake Squeal and Dust | Infotainment System Random Reboots | Interior/Cabin Water Leaks (Cowl, Bulkhead, A/C Drain) | Jerky / Hunting Transmission at Low Speed (ZF 8-Speed) | Low-Pressure Fuel Pump Failure (Sudden Power Loss) | Low-Pressure Fuel Pump Failure Causing Stall (Recall 25V-586) | Parasitic Battery Drain / IBS & Stop-Start Faults | Q4 AWD Transfer Case Jolting and Resonance Rumble | Rearview Camera Blank/Inverted Image (Infotainment Recall) | Timing Chain Rattle / Oil Pump Bolt Loosening (2.0T) | Turbo Coolant Line Leak",
    "forums": ""
  },
  {
    "style": "new",
    "make": "Volkswagen",
    "model": "ID.4",
    "yearsHint": "2021-2025",
    "note": "Only 13 documented issues on this nameplate. 2 interest-email leads asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 12V Auxiliary Battery Drain and Dead Battery | Charge Port Door Actuator/Solenoid Failure (Won't Open) | DC Fast Charging Failures and Slow Charging Speeds | Electronic Door Handle Water Intrusion Causing Doors to Open Unexpectedly | Heat Pump System Failure in Cold Weather | High-Voltage Battery Cell Module Fire Risk and Range Loss (Self-Discharge) | ID. Software Infotainment Bugs, Slow Response, and OTA Update Failures | Onboard Charger (OCDC) Condensation Failure Stopping 12V Charging | Panoramic Glass Roof Creaking and Squeaking in Cold Weather | Panoramic Roof Sunshade Insufficiently Fire Retardant (FMVSS 302) | Pulse Inverter / HV Battery Management Reset Causing Sudden Loss of Drive Power | Rear Window Defroster Grid Delamination | Rearview Camera Image Fails to Display in Reverse (Peripheral Camera Control Module)",
    "forums": ""
  },
  {
    "style": "new",
    "make": "Chrysler",
    "model": "Voyager",
    "yearsHint": "2020-2024",
    "note": "Only 20 documented issues on this nameplate. 3 interest-email leads asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: 2022 Chrysler Voyager Backup Camera Blank in Reverse — Free Radio Software Recall 24V436000 | 2023 Voyager Driver Air Bag May Not Deploy — Steering Column Control Module Weld Recall (24V199) | 3.6L Pentastar V6 Oil Filter Housing / Oil Cooler Assembly Cracking (Oil & Coolant Leaks) | 3.6L Pentastar Valvetrain Failure (Rocker Arm / Lifter Ticking, Misfire, Engine Damage) | 3.6L Pentastar Water Pump Mechanical Seal Leak (Weep-Hole Coolant Loss, Whine, Overheat) | 948TE 9-Speed Transmission Calibration Issues | Active Grille Shutter Module Failure — Check Engine Light With Lost Communication (U11E9) | Auxiliary (ESS) Battery Failure — Stop/Start Unavailable, Drained Main Battery and No-Start | Blind Spot Monitoring False Alerts — Warning Illuminates With No Vehicle Present | Front Wheel Bearing-to-Hub Bolts Under-Torqued From the Factory (Customer Satisfaction Notification Y97) | Power Liftgate Cinch Latch Failure — Gate Beeps, Reverses and Will Not Stay Closed | Power Sliding Door Malfunction | Rear HVAC Blower Motor Resistor Failure | Roof Seam Sealer Voids at the Upper D-Pillar Cause Water Leaks Into the Headliner and Cargo Floor | Second-Row Seat-to-Floor Latch May Bind Open (LATCH/FMVSS 225 Recall Z22 / 22V-181) | Shift-by-Wire Rotary Shifter Fault — \"Service Shifter\" Message and Refusal to Change Gears | Side Curtain Airbag Defects (May Not Deploy / Insufficient Pressure) - Safety Recalls | Telematics Box Module (Uconnect Box) Communication Failure — SOS and Assist Silently Disabled | UConnect 4 Touchscreen Delamination | Windshield Wiper Arm Nuts Improperly Tightened (Wiper Failure Recall Z80 / 22V-619)",
    "forums": ""
  },
  {
    "style": "new",
    "make": "Volkswagen",
    "model": "Taos",
    "yearsHint": "2022-2026",
    "note": "Only 22 documented issues on this nameplate. 3 interest-email leads asked to be alerted about this exact vehicle, so the demand is measured, not assumed. The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is. Already documented — do NOT restate any of these, find what is missing around them: \"Please Reduce Oil Level\" Warning From Routine Oil-Change Overfill | 12V Battery Parasitic Drain / Repeated Dead Battery | 7-Speed DSG (DQ381) Shudder and Rough Low-Speed Shifting | A/C Compressor Noise and Vibration | Acceleration Hesitation / Throttle Lag From a Standstill (4Motion DSG) | Digital Cockpit Instrument Cluster Goes Blank at Startup (Recall 26V185 / VW 90Z5) | EA211 1.5 TSI (DNKA) Head Gasket Leakage at the Rear of the Cylinder Head | EA211 1.5T Coolant Loss from Water Pump / Thermostat Housing Leak | EA211 1.5T Engine Ticking and Fuel Injector Noise | Engine Stalls When Coming to a Stop - AWD ECU Software Defect (Recall 21V615) | False Front Assist Collision Alerts and Unwarranted Autonomous Emergency Braking | Fuel Delivery Module Failure Causing Sudden Power Loss (Recall 23V214 / 20DV) | Fuel Pressure Sensor Wiring Harness Too Short - Sensor Can Pull Off the Tank in a Rear Crash (Recall 26V258) | Intake Valve Carbon Buildup on the GDI 1.5 TSI | MIB3 Infotainment System Glitches and Connectivity Issues | Panoramic Sunroof Frame Clicking, Tapping and Cold-Weather Popping | Premature Rear Brake Pad Wear (VW Warranty Extension / TSB) | Random Misfire, EPC Light and Limp Mode on Lower-Octane Fuel (1.5 TSI, 11.5:1 Compression) | Rear Drum Brake Groaning and Noise | Rear Suspension Knuckle Cracking / Fracture (Recall 22V176 / VW code 42L8) | Rearview Camera Image Fails to Display - eMMC Infotainment Memory Defect (Recall 22V514 / 91DV) | Underhood Fuel Supply Quick-Connector Detachment and Fuel Leak (Recall 21V651 / 20DB)",
    "forums": ""
  }
]

const EXCLUSIONS = [
  {
    "make": "Cadillac",
    "model": "XT6",
    "existingTitles": [
      "2020 XT6 Start/Stop Accumulator May Be Missing Endcap Bolts — Recall 20V668000",
      "2021 XT6 Fuel Supply Line May Separate and Leak — Recall 21V422",
      "2022 XT6 Left-Rear Toe Link May Be Loose or Separate — Recall 22V427",
      "3.6L LGX Engine Oil Migrating Into the Cooling System Through Block Porosity — Overheating with Sludge in the Radiator",
      "3.6L V6 Timing Chain Concern (XT6)",
      "9-Speed Automatic Transmission Shudder and Harsh Shifts",
      "Auto Start-Stop Harshness and Battery Issues",
      "AWD Power Transfer Unit Fluid Leak",
      "Electric Power Steering Rack Failure — \"Steering Assist Is Reduced / Service Power Steering\" with C0460 or C0545",
      "Incorrect Transmission Sun Gear Lets the Driver-Side Half-Shaft Disengage — Recall 23V172",
      "Instrument Panel Fails to Illuminate Hazard, High-Beam and Turn-Signal Telltales — Software Recall 24V459",
      "Loss of Cabin Heat Caused by an Engine Control Module Software Anomaly — Bulletin 22-NA-094",
      "Low-Speed TCC Shudder Must Be Confirmed Before a Fluid Drain and Fill",
      "Rearview Camera Cuts Out Due to Bad Coaxial Cable Crimp on Surround Vision-Equipped XT6 (Recall 22V709000)",
      "Recall 22V446000: Fuel Tank Rollover Valve May Fail to Seal on 2022 XT6",
      "Water Leaks Into the Interior Through Pinholes in the Roof Panel Laser Braze — Wet Carpet and Inoperative Liftgate Actuator",
      "Windshield Not Properly Bonded to the Body — Missing Urethane Sealant, Recall 23V681"
    ]
  },
  {
    "make": "Lincoln",
    "model": "Nautilus",
    "existingTitles": [
      "2.0L EcoBoost coolant loss / EGR cooler leak — low coolant, white smoke, overheat",
      "2.7L EcoBoost cold-start VCT rattle (top-front-cover tick/tap on startup)",
      "8F35 8-speed automatic shudder, buck, and jerk under 35 mph",
      "Auto Start-Stop malfunction / engine won't auto-restart (weak 12V battery)",
      "Both panoramic and center displays go blank while driving (NHTSA recall 25V337 / Ford 25C21, 30,679 units)",
      "EGR Valve Failure Leading to Unexpected Loss of Drive Power (Recall 26S10 / NHTSA 26V122000)",
      "Engine block heater overheats while plugged in — fire risk",
      "Front brake groan/grunt noise on stopping (rotor material defect)",
      "Hybrid 2.0L EcoBoost direct fuel injector failure — broken tips cause engine damage",
      "Hybrid pedestrian warning sound fails at low speed (recall 25SA2)",
      "Image Processing Module A (IPMA) resets — loss of rearview camera and ADAS",
      "Incorrectly manufactured rear shock absorbers damage rear brake hose (recall 23V439 / Ford 23S32)",
      "LED headlight and tail-light driver modules fail due to burnt Schottky diodes (NHTSA recall 25V519 / Ford 25C39, 1,539 Nautilus units)",
      "Panoramic Vista Roof water leaks from clogged sunroof drains",
      "Parasitic 12V battery drain — dead battery after short ownership (CSP 24P14 / 24P08)",
      "Power liftgate inoperative / opens or closes on its own (RGTM software, motor, strut)",
      "Power-window auto-reverse fails to retract — pinch hazard (NHTSA recall 24V953, ~48,000 units)",
      "Rear Drive Unit Underfilled With Lubricant Can Seize — AWD Recall 21S02 (NHTSA 21V011000)",
      "Rearview backup camera blank or distorted image (recall 20V575 / 20C19)",
      "Rearview Camera and ADAS Loss from Image Processing Module Resets (Recall 26V165000)",
      "Rearview Camera Software Error — Blank Image or Image That Won't Clear (Recall 25S72 / NHTSA 25V442)",
      "SYNC 3 / APIM infotainment freezes, black-screens, and reboots"
    ]
  },
  {
    "make": "Cadillac",
    "model": "XT5",
    "existingTitles": [
      "2022 XT5 Fuel Tank Rollover Valve May Be Dislodged or Missing — Recall 22V446000",
      "3.6L V6 Timing Chain Issues (XT5 V6 models)",
      "8-Speed / 9-Speed Transmission Shudder and Harsh Shifting",
      "Electronic Gear Selector Park-Switch Fault - Persistent 'Shift to Park' Message / Won't Power Down (TSB 19-NA-206)",
      "Engine Thermostat Sticks Open on the 3.6L LGX - Triggers P0128, 'Steering Assist is Reduced' Message and A/C Shutdown",
      "Front Brake Rotor Warping and Pedal Pulsation",
      "Low-Speed TCC Shudder Must Be Confirmed Before a Fluid Drain and Fill",
      "Panoramic Sunroof Glass Spontaneously Shatters at Highway Speed",
      "Power Liftgate Strut Failure and Erratic Operation",
      "Recall 16V802: Front Brake Caliper Piston Seal May Leak Brake Fluid on Early-Build 2017 XT5",
      "Recall 20V639: AWD Fuel-Pump Mixing-Tube Burr May Cause a Stall",
      "Recall 21V115000: Continental Tires on the 2020 XT5 Were Cured Too Long",
      "Recall 21V422: Improperly Seated Fuel Supply Line Can Separate and Leak Gasoline",
      "Recall 22V427: Left-Rear Suspension Toe Link Fastener May Be Loose on the 2022 XT5",
      "Recall 22V709: Improperly Crimped Surround Vision Coaxial Cable Kills the Rearview Camera Image"
    ]
  },
  {
    "make": "Chevrolet",
    "model": "Silverado EV",
    "existingTitles": [
      "Charge Port Door Malfunction",
      "Infotainment Screen Random Reboot",
      "Level 2 Charging Interruptions and EVSE Communication Faults",
      "Propulsion Power Reduced Warning During Towing",
      "Significant Range Loss in Cold Weather"
    ]
  },
  {
    "make": "Toyota",
    "model": "Solara",
    "existingTitles": [
      "2.4L 2AZ-FE Excessive Oil Consumption",
      "Convertible Top Hydraulic Pump and Cylinder Failure",
      "Convertible Top Motor and Hydraulic System Failure",
      "Dashboard Cracking and Melting in Hot Climates",
      "Dashboard Melting and Becoming Sticky"
    ]
  },
  {
    "make": "Kia",
    "model": "Amanti",
    "existingTitles": [
      "A/C Compressor Clutch and Coil Failure",
      "Alternator Premature Failure and Voltage Regulator Issues",
      "Automatic Transmission Failure (5-Speed)",
      "Power Steering System Leak",
      "Timing Belt Tensioner Bearing Failure"
    ]
  },
  {
    "make": "Alfa Romeo",
    "model": "Stelvio",
    "existingTitles": [
      "2.0L Turbo Intake Valve Carbon Buildup Causing Cold-Start Misfire",
      "ABS Hydraulic Control Unit Motor Rotor Shaft Separates Under Hard Braking (Recall 21V-309 / Y24)",
      "Adaptive Cruise Control Cannot Be Switched Off After Wheel Slip (Recall 19V-148 / V27)",
      "Brake Pedal-to-Booster Fastener Improperly Assembled, Pedal Can Detach (Recall 24V-943)",
      "Carbon-Ceramic Brake Rotor Fractures From Excessive Parking-Brake Clamp Force (Recall 23V-382 / 68A)",
      "Front Suspension Knocking and Clunking at Low Speed From End Links and Control Arm Bushings",
      "Fuel Line Sensor Housing Cracks and Leaks Fuel (Recall 21V-878)",
      "Infotainment System Crash and Black Screen",
      "Low-Pressure Fuel Pump Failure Causing Stall (Recall 25V-667)",
      "Panoramic Sunroof Rattle and Wind Noise",
      "Parasitic Battery Drain From Modules Failing to Sleep, Repeat Dead Batteries",
      "Quadrifoglio Engine-to-Radiator Coolant Hose Made From Wrong Material, Leaks and Stalls (Recall 18V-635 / U99)",
      "Transfer Case Fluid Leak",
      "Turbo Oil Line Leak",
      "Water Intrusion at A-Pillar Corrodes Body Control Module Connectors (Recall 18V-205 / U36)",
      "Water Pump Housing and Gasket Leak Causing Slow Coolant Loss",
      "ZF 8HP Harsh 1-2 Shift and Cold-Weather Shift Clunk"
    ]
  },
  {
    "make": "Jaguar",
    "model": "F-PACE",
    "existingTitles": [
      "Coolant Crossover Pipe Leak on Supercharged V6",
      "InControl Touch Pro Infotainment System Freeze",
      "Ingenium Engine Water Pump Failure",
      "Panoramic Sunroof Creaking and Popping Noise",
      "Rear Differential Mount Bushing Premature Wear",
      "ZF 8HP Transmission Valve Body Malfunction"
    ]
  },
  {
    "make": "Alfa Romeo",
    "model": "Giulia",
    "existingTitles": [
      "Contaminated Brake/Clutch Fluid (Reduced Braking)",
      "Electrical Faults from Water Intrusion / BCM Failure",
      "Front Brake Squeal and Dust",
      "Infotainment System Random Reboots",
      "Interior/Cabin Water Leaks (Cowl, Bulkhead, A/C Drain)",
      "Jerky / Hunting Transmission at Low Speed (ZF 8-Speed)",
      "Low-Pressure Fuel Pump Failure (Sudden Power Loss)",
      "Low-Pressure Fuel Pump Failure Causing Stall (Recall 25V-586)",
      "Parasitic Battery Drain / IBS & Stop-Start Faults",
      "Q4 AWD Transfer Case Jolting and Resonance Rumble",
      "Rearview Camera Blank/Inverted Image (Infotainment Recall)",
      "Timing Chain Rattle / Oil Pump Bolt Loosening (2.0T)",
      "Turbo Coolant Line Leak"
    ]
  },
  {
    "make": "Volkswagen",
    "model": "ID.4",
    "existingTitles": [
      "12V Auxiliary Battery Drain and Dead Battery",
      "Charge Port Door Actuator/Solenoid Failure (Won't Open)",
      "DC Fast Charging Failures and Slow Charging Speeds",
      "Electronic Door Handle Water Intrusion Causing Doors to Open Unexpectedly",
      "Heat Pump System Failure in Cold Weather",
      "High-Voltage Battery Cell Module Fire Risk and Range Loss (Self-Discharge)",
      "ID. Software Infotainment Bugs, Slow Response, and OTA Update Failures",
      "Onboard Charger (OCDC) Condensation Failure Stopping 12V Charging",
      "Panoramic Glass Roof Creaking and Squeaking in Cold Weather",
      "Panoramic Roof Sunshade Insufficiently Fire Retardant (FMVSS 302)",
      "Pulse Inverter / HV Battery Management Reset Causing Sudden Loss of Drive Power",
      "Rear Window Defroster Grid Delamination",
      "Rearview Camera Image Fails to Display in Reverse (Peripheral Camera Control Module)"
    ]
  },
  {
    "make": "Chrysler",
    "model": "Voyager",
    "existingTitles": [
      "2022 Chrysler Voyager Backup Camera Blank in Reverse — Free Radio Software Recall 24V436000",
      "2023 Voyager Driver Air Bag May Not Deploy — Steering Column Control Module Weld Recall (24V199)",
      "3.6L Pentastar V6 Oil Filter Housing / Oil Cooler Assembly Cracking (Oil & Coolant Leaks)",
      "3.6L Pentastar Valvetrain Failure (Rocker Arm / Lifter Ticking, Misfire, Engine Damage)",
      "3.6L Pentastar Water Pump Mechanical Seal Leak (Weep-Hole Coolant Loss, Whine, Overheat)",
      "948TE 9-Speed Transmission Calibration Issues",
      "Active Grille Shutter Module Failure — Check Engine Light With Lost Communication (U11E9)",
      "Auxiliary (ESS) Battery Failure — Stop/Start Unavailable, Drained Main Battery and No-Start",
      "Blind Spot Monitoring False Alerts — Warning Illuminates With No Vehicle Present",
      "Front Wheel Bearing-to-Hub Bolts Under-Torqued From the Factory (Customer Satisfaction Notification Y97)",
      "Power Liftgate Cinch Latch Failure — Gate Beeps, Reverses and Will Not Stay Closed",
      "Power Sliding Door Malfunction",
      "Rear HVAC Blower Motor Resistor Failure",
      "Roof Seam Sealer Voids at the Upper D-Pillar Cause Water Leaks Into the Headliner and Cargo Floor",
      "Second-Row Seat-to-Floor Latch May Bind Open (LATCH/FMVSS 225 Recall Z22 / 22V-181)",
      "Shift-by-Wire Rotary Shifter Fault — \"Service Shifter\" Message and Refusal to Change Gears",
      "Side Curtain Airbag Defects (May Not Deploy / Insufficient Pressure) - Safety Recalls",
      "Telematics Box Module (Uconnect Box) Communication Failure — SOS and Assist Silently Disabled",
      "UConnect 4 Touchscreen Delamination",
      "Windshield Wiper Arm Nuts Improperly Tightened (Wiper Failure Recall Z80 / 22V-619)"
    ]
  },
  {
    "make": "Volkswagen",
    "model": "Taos",
    "existingTitles": [
      "\"Please Reduce Oil Level\" Warning From Routine Oil-Change Overfill",
      "12V Battery Parasitic Drain / Repeated Dead Battery",
      "7-Speed DSG (DQ381) Shudder and Rough Low-Speed Shifting",
      "A/C Compressor Noise and Vibration",
      "Acceleration Hesitation / Throttle Lag From a Standstill (4Motion DSG)",
      "Digital Cockpit Instrument Cluster Goes Blank at Startup (Recall 26V185 / VW 90Z5)",
      "EA211 1.5 TSI (DNKA) Head Gasket Leakage at the Rear of the Cylinder Head",
      "EA211 1.5T Coolant Loss from Water Pump / Thermostat Housing Leak",
      "EA211 1.5T Engine Ticking and Fuel Injector Noise",
      "Engine Stalls When Coming to a Stop - AWD ECU Software Defect (Recall 21V615)",
      "False Front Assist Collision Alerts and Unwarranted Autonomous Emergency Braking",
      "Fuel Delivery Module Failure Causing Sudden Power Loss (Recall 23V214 / 20DV)",
      "Fuel Pressure Sensor Wiring Harness Too Short - Sensor Can Pull Off the Tank in a Rear Crash (Recall 26V258)",
      "Intake Valve Carbon Buildup on the GDI 1.5 TSI",
      "MIB3 Infotainment System Glitches and Connectivity Issues",
      "Panoramic Sunroof Frame Clicking, Tapping and Cold-Weather Popping",
      "Premature Rear Brake Pad Wear (VW Warranty Extension / TSB)",
      "Random Misfire, EPC Light and Limp Mode on Lower-Octane Fuel (1.5 TSI, 11.5:1 Compression)",
      "Rear Drum Brake Groaning and Noise",
      "Rear Suspension Knuckle Cracking / Fracture (Recall 22V176 / VW code 42L8)",
      "Rearview Camera Image Fails to Display - eMMC Infotainment Memory Defect (Recall 22V514 / 91DV)",
      "Underhood Fuel Supply Quick-Connector Detachment and Fuel Leak (Recall 21V651 / 20DB)"
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
