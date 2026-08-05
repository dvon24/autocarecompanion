const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const cards = [
  {
    "id": "honda-accord-1-5l-turbo-coolant-intrusion-into-cylinders-head-gasket-cool",
    "frozenClaim": "1.5L Turbo Coolant Intrusion into Cylinders / Head Gasket Coolant-Slot Defect",
    "sourceType": "tsb",
    "documentId": "10194961",
    "years": [
      2018,
      2019,
      2020
    ],
    "category": "hvac",
    "title": "A/C Condenser Corrosion and Refrigerant Leak",
    "description": "Honda bulletin 21-053 documents factory A/C condensers whose tube walls can corrode into pinholes and release refrigerant on certain 2018-2020 Accord and Accord Hybrid vehicles.",
    "solution": "Confirm the leak is from the condenser rather than impact damage. Honda extended condenser coverage to 10 years with unlimited mileage for eligible vehicles; replace a qualifying condenser and recharge the system.",
    "symptoms": [
      "A/C blows warm air",
      "Refrigerant level is low",
      "Leak is visible at the condenser"
    ],
    "affectedSystems": [
      "A/C condenser",
      "condenser tube walls",
      "refrigerant circuit"
    ],
    "url": "https://static.nhtsa.gov/odi/tsbs/2021/MC-10194961-0001.pdf"
  },
  {
    "id": "honda-accord-1-5t-oil-dilution",
    "frozenClaim": "1.5L Turbo Engine Oil Dilution",
    "sourceType": "tsb",
    "documentId": "10239504",
    "years": [
      2023
    ],
    "category": "electrical",
    "title": "Telematics Control Unit Parasitic Battery Drain",
    "description": "Honda bulletin 23-030 identifies a telematics control unit that can remain in a reboot loop after provisioning fails, creating a parasitic draw on the 12-volt battery in certain 2023 Accord vehicles.",
    "solution": "Measure key-off draw and confirm the telematics unit is the source. Follow Honda bulletin 23-030 to complete the prescribed telematics repair and verify the unit enters sleep mode.",
    "symptoms": [
      "Dead or weak 12-volt battery",
      "Repeated jump-starts may be needed",
      "Telematics unit may keep rebooting"
    ],
    "affectedSystems": [
      "12-volt battery",
      "telematics control unit"
    ],
    "url": "https://static.nhtsa.gov/odi/tsbs/2023/MC-10239504-0001.pdf"
  },
  {
    "id": "honda-accord-10th-gen-ac-condenser-leak-2018",
    "frozenClaim": "A/C Condenser Leak and Refrigerant Loss",
    "sourceType": "tsb",
    "documentId": "10184661",
    "years": [
      2018,
      2019,
      2020
    ],
    "category": "body",
    "title": "Windshield Edge Stress-Crack Bulletin",
    "description": "Honda bulletin 20-091 covers stress cracks that begin at an edge of the windshield on certain 2018-2020 Accord vehicles.",
    "solution": "Inspect the glass and crack origin for an impact point. If the bulletin criteria are met and no impact damage is present, replace the windshield using Honda's specified procedure.",
    "symptoms": [
      "Crack begins at the windshield edge",
      "Crack can spread without a visible impact chip"
    ],
    "affectedSystems": [
      "windshield glass",
      "windshield bonding area"
    ],
    "url": "https://static.nhtsa.gov/odi/tsbs/2020/MC-10184661-0001.pdf"
  },
  {
    "id": "honda-accord-10th-gen-fuel-pump-recall-2018",
    "frozenClaim": "Denso Fuel Pump Impeller Failure - Safety Recall NHTSA 20V-374",
    "sourceType": "tsb",
    "documentId": "10167689",
    "years": [
      2013,
      2014,
      2015,
      2016,
      2017,
      2018,
      2019
    ],
    "category": "body",
    "title": "Power-Seat Flex-Cable Buzz or Whine",
    "description": "Honda bulletin 19-115 documents a loud buzz or whine while moving a front power seat because the seat-adjustment flex cable was not lubricated correctly.",
    "solution": "Confirm the noise while operating the affected front seat, then lubricate or service the flex cable as directed by Honda and verify quiet travel through the full range.",
    "symptoms": [
      "Buzzing or whining while a front seat moves"
    ],
    "affectedSystems": [
      "front power seat",
      "seat-adjustment flex cable"
    ],
    "url": "https://static.nhtsa.gov/odi/tsbs/2019/MC-10167689-0001.pdf"
  },
  {
    "id": "honda-accord-11th-gen-2-0t-carbon-buildup-2023",
    "frozenClaim": "11th Gen 2.0T Direct Injection Carbon Buildup and Idle Vibration",
    "sourceType": "tsb",
    "documentId": "10169979",
    "years": [
      2018,
      2019,
      2020
    ],
    "category": "electrical",
    "title": "Active Noise Cancellation Microphone Foam Noise",
    "description": "Honda service information links booming or rumbling through the speakers on certain 2018-2020 Accord vehicles to damaged or folded insulating foam around the active-noise-cancellation microphones.",
    "solution": "Inspect the microphone covers and insulating foam in the headliner. Correct damaged or folded foam and verify the booming or rumbling is gone.",
    "symptoms": [
      "Booming or rumbling through the speakers"
    ],
    "affectedSystems": [
      "active noise cancellation microphones",
      "headliner microphone foam",
      "audio system"
    ],
    "url": "https://static.nhtsa.gov/odi/tsbs/2019/MC-10169979-0001.pdf"
  },
  {
    "id": "honda-accord-11th-gen-honda-sensing-update-2023",
    "frozenClaim": "Honda Sensing 360 - Lane Centering and Adaptive Cruise Control Issues",
    "sourceType": "tsb",
    "documentId": "10169981",
    "years": [
      2018,
      2019,
      2020
    ],
    "category": "electrical",
    "title": "Audio Phone Button Does Not Respond",
    "description": "Honda service information documents an audio unit that may not respond when the phone button is pressed on certain 2018-2020 Accord vehicles.",
    "solution": "Confirm the symptom and software level, then follow Honda's audio-unit troubleshooting and update or repair procedure for the affected vehicle.",
    "symptoms": [
      "Phone button produces no response"
    ],
    "affectedSystems": [
      "display audio unit",
      "phone controls"
    ],
    "url": "https://static.nhtsa.gov/odi/tsbs/2019/MC-10169981-0001.pdf"
  },
  {
    "id": "honda-accord-12-volt-battery-management-sensor-corrosion-fire-risk",
    "frozenClaim": "12-Volt Battery Management Sensor Corrosion - Fire Risk (Recall 17V-418)",
    "sourceType": "tsb",
    "documentId": "10174695",
    "years": [
      2016
    ],
    "category": "hvac",
    "title": "A/C Compressor Stator Pressure-Loss Bulletin",
    "description": "Honda bulletin 20-040 identifies a failed stator in the A/C compressor that can prevent refrigerant pressure from building after about 15 minutes of driving in certain 2016 Accord vehicles.",
    "solution": "Measure high- and low-side pressures after the symptom appears. If the bulletin diagnosis confirms the stator fault, replace the specified compressor components and recharge the system.",
    "symptoms": [
      "A/C becomes warm after about 15 minutes",
      "Refrigerant pressure does not build normally"
    ],
    "affectedSystems": [
      "A/C compressor stator",
      "refrigerant circuit"
    ],
    "url": "https://static.nhtsa.gov/odi/tsbs/2020/MC-10174695-0001.pdf"
  },
  {
    "id": "honda-accord-2-4l-k24-i-vtec-excessive-oil-consumption-sticking-piston-oi",
    "frozenClaim": "2.4L K24 i-VTEC Excessive Oil Consumption - Sticking Piston Oil Control Rings",
    "sourceType": "tsb",
    "documentId": "11015016",
    "years": [
      2021,
      2022,
      2023,
      2024,
      2025
    ],
    "category": "suspension",
    "title": "Front Damper Bump-Stop Creak",
    "description": "Honda bulletin 25-023 documents a dull creak, rub, pop or click at low-speed turns when a front bump stop contacts the top of the damper body.",
    "solution": "Reproduce the noise during a low-speed turn, isolate it to the front damper, and perform Honda's bump-stop/damper service procedure.",
    "symptoms": [
      "Creaking, rubbing, popping or clicking during low-speed turns"
    ],
    "affectedSystems": [
      "front damper",
      "front bump stop"
    ],
    "url": "https://static.nhtsa.gov/odi/tsbs/2025/MC-11015016-0001.pdf"
  },
  {
    "id": "honda-accord-9speed-zf-transmission-2018",
    "frozenClaim": "ZF 9-Speed Transmission Rough Shifting, Shudder, and Hesitation (2.0T)",
    "sourceType": "tsb",
    "documentId": "11017324",
    "years": [
      2017
    ],
    "category": "drivetrain",
    "title": "Cracked Torque-Converter Lock-Up Piston (P0741)",
    "description": "Honda bulletin 25-040 covers certain 2017 Accord vehicles whose torque-converter lock-up piston can crack, bleed pressure and reduce clutch holding force.",
    "solution": "Confirm a flashing D indicator, transmission-overheat message or DTC P0741, then follow Honda bulletin 25-040 for torque-converter diagnosis and replacement.",
    "symptoms": [
      "D indicator flashes",
      "Transmission overheat message",
      "DTC P0741"
    ],
    "affectedSystems": [
      "torque converter",
      "lock-up clutch piston",
      "automatic transmission"
    ],
    "url": "https://static.nhtsa.gov/odi/tsbs/2025/MC-11017324-0001.pdf",
    "dtcCodes": [
      "P0741"
    ]
  },
  {
    "id": "honda-accord-9th-gen-paint-peeling-white-2013",
    "frozenClaim": "White Paint Clearcoat Peeling (Taffeta White/White Diamond Pearl)",
    "sourceType": "tsb",
    "documentId": "11013337",
    "years": [
      2023,
      2024,
      2025
    ],
    "category": "body",
    "title": "Door Weatherstrip Pulled Loose at Sash",
    "description": "Honda bulletin 25-009 covers door weatherstripping that can be pulled out of position at the top of the frame when an occupant grips the door sash while entering or exiting.",
    "solution": "Inspect the seal and retainer at the top of the door frame, then reseat or replace the weatherstrip using Honda's bulletin procedure.",
    "symptoms": [
      "Weatherstrip is loose at the top of the door frame",
      "Possible wind or water noise"
    ],
    "affectedSystems": [
      "door weatherstrip",
      "door sash"
    ],
    "url": "https://static.nhtsa.gov/odi/tsbs/2025/MC-11013337-0001.pdf"
  },
  {
    "id": "honda-accord-9th-gen-starter-failure-2013",
    "frozenClaim": "Starter Motor Failure - Direct Injection Carbon on Starter Ring Gear",
    "sourceType": "tsb",
    "documentId": "10086213",
    "years": [
      2016
    ],
    "category": "electrical",
    "title": "Audio-Unit Clock Reset from GPS Chip Fault",
    "description": "Honda service information identifies a faulty chip in some 2016 Accord EX-and-above audio units that can lose communication with GPS timing and reset or misstate the clock.",
    "solution": "Confirm the clock fault is not a settings or reception problem. Honda directs replacement of the audio unit with an updated remanufactured unit when the chip fault is confirmed.",
    "symptoms": [
      "Clock resets",
      "Clock shows the wrong time"
    ],
    "affectedSystems": [
      "display audio unit",
      "GPS timing chip",
      "GPS antenna communication"
    ],
    "url": "https://static.nhtsa.gov/odi/tsbs/2016/MC-10086213-2280.pdf"
  },
  {
    "id": "honda-accord-aeb-false-activation",
    "frozenClaim": "Automatic Emergency Braking False Activation (CMBS)",
    "sourceType": "tsb",
    "documentId": "10106823",
    "years": [
      2013,
      2014,
      2015,
      2016,
      2017
    ],
    "category": "body",
    "title": "Rear Parcel-Shelf Rattle with Bass",
    "description": "Honda bulletin 17-006 documents vibration transmitted through the rear parcel shelf, causing the rear tray to rattle when the audio system produces strong bass.",
    "solution": "Confirm the rattle with the audio system, then replace the torsion-bar clip and install EPT sealer and wool felt at the locations specified by Honda.",
    "symptoms": [
      "Rear tray rattles when bass is elevated"
    ],
    "affectedSystems": [
      "rear parcel shelf",
      "rear tray",
      "torsion-bar clip"
    ],
    "url": "https://static.nhtsa.gov/odi/tsbs/2017/SB-10106823-9340.pdf"
  },
  {
    "id": "honda-accord-alternator-charging-system-failure-battery-light-dimming",
    "frozenClaim": "Alternator / Charging System Failure - Battery Light and Dimming",
    "sourceType": "tsb",
    "documentId": "10052516",
    "years": [
      2013
    ],
    "category": "brakes",
    "title": "Front Brake-Pad Retainer Contact",
    "description": "Honda bulletin 12-081 covers a front brake-pad retaining clip that can shift and touch the rotor on certain 2013 Accord vehicles.",
    "solution": "Confirm the squeal or scrape occurs while turning, then replace the pad retainers and lubricate the specified contact points as directed by Honda.",
    "symptoms": [
      "Front brake squeal or scraping while turning"
    ],
    "affectedSystems": [
      "front brake pads",
      "pad retaining clips",
      "front brake rotors"
    ],
    "url": "https://static.nhtsa.gov/odi/tsbs/2013/SB-10052516-8099.pdf"
  },
  {
    "id": "honda-accord-automatic-transmission-slipping-failure",
    "frozenClaim": "Automatic Transmission Slipping / Failure (4-Speed, V6 Worst)",
    "sourceType": "tsb",
    "documentId": "10084011",
    "years": [
      2013,
      2014,
      2015,
      2016
    ],
    "category": "fuel",
    "title": "EVAP Canister Vent Tube Blockage (P2422)",
    "description": "Honda bulletin 15-010 documents dirt blocking the EVAP canister vent tube and setting DTC P2422 on certain 2013-2016 non-hybrid Accord vehicles.",
    "solution": "Inspect the canister vent tube. If restricted, replace the canister as necessary and install Honda's revised vent-tube/drain-box kit.",
    "symptoms": [
      "Malfunction indicator lamp",
      "DTC P2422"
    ],
    "affectedSystems": [
      "EVAP canister",
      "canister vent tube",
      "vent shut valve"
    ],
    "url": "https://static.nhtsa.gov/odi/tsbs/2016/SB-10084011-2280.pdf",
    "dtcCodes": [
      "P2422"
    ],
    "trims": [
      "Excludes Accord Hybrid and Accord Plug-in Hybrid"
    ]
  },
  {
    "id": "honda-accord-backup-rearview-camera-blank-screen-software-defect",
    "frozenClaim": "Backup/Rearview Camera Blank Screen - Software Defect (Recall 18V-629)",
    "sourceType": "tsb",
    "documentId": "10115802",
    "years": [
      2013,
      2014,
      2015,
      2016
    ],
    "category": "engine",
    "title": "Starter-to-Ring-Gear Clearance Fault",
    "description": "Honda bulletin 16-002 covers V6 automatic Accords whose starter gear clearance to the torque-converter ring gear is not optimal, producing grinding or free-spinning at startup.",
    "solution": "Confirm the startup symptom, replace the starter and rotate the torque converter one bolt hole according to Honda bulletin 16-002.",
    "symptoms": [
      "Starter grinds at startup",
      "Starter spins without engaging"
    ],
    "affectedSystems": [
      "starter motor gear",
      "torque-converter ring gear"
    ],
    "url": "https://static.nhtsa.gov/odi/tsbs/2017/MC-10115802-9999.pdf",
    "engines": [
      "3.5L V6"
    ],
    "trims": [
      "Automatic transmission"
    ]
  },
  {
    "id": "honda-accord-battery-drain",
    "frozenClaim": "Parasitic Battery Drain",
    "sourceType": "tsb",
    "documentId": "10108586",
    "years": [
      2008,
      2009,
      2010,
      2011
    ],
    "category": "engine",
    "title": "L4 Sticking Oil-Control Rings",
    "description": "Honda bulletin 12-087 covers deposits that can make the oil-control rings stick and cause unusually high engine-oil consumption in eligible 2008-2011 four-cylinder Accord vehicles.",
    "solution": "Perform Honda's oil-consumption test. For an eligible vehicle that exceeds the limit, follow the bulletin's piston and ring repair procedure.",
    "symptoms": [
      "Low oil level on dipstick",
      "Oil warning lamp may illuminate",
      "Frequent oil top-offs"
    ],
    "affectedSystems": [
      "pistons",
      "oil-control rings",
      "engine lubrication"
    ],
    "url": "https://static.nhtsa.gov/odi/tsbs/2015/MC-10108586-9999.pdf",
    "engines": [
      "2.4L four-cylinder"
    ]
  },
  {
    "id": "honda-accord-bcm-software-malfunction",
    "frozenClaim": "Body Control Module (BCM) Software Issues",
    "sourceType": "tsb",
    "documentId": "10129795",
    "years": [
      2013,
      2014,
      2015,
      2016,
      2017
    ],
    "category": "drivetrain",
    "title": "6AT Torque-Converter Judder from Deteriorated Fluid",
    "description": "Honda bulletin 17-017 explains that a 20-60 mph lock-up judder on certain V6 six-speed automatic Accords is caused by transmission-fluid deterioration under intermittent high heat, not a damaged torque converter.",
    "solution": "Confirm the judder with Honda's snapshot procedure, update the PGM-FI or transmission software as applicable, and perform the prescribed transmission-fluid flush.",
    "symptoms": [
      "Judder between about 20 and 60 mph during lock-up"
    ],
    "affectedSystems": [
      "six-speed automatic transmission",
      "transmission fluid",
      "torque-converter lock-up clutch"
    ],
    "url": "https://static.nhtsa.gov/odi/tsbs/2018/MC-10129795-9999.pdf",
    "engines": [
      "3.5L V6"
    ],
    "trims": [
      "Six-speed automatic transmission"
    ]
  },
  {
    "id": "honda-accord-brake-hydraulic-line-failure-and-soft-pedal",
    "frozenClaim": "Brake Hydraulic Line Failure and Soft Pedal",
    "sourceType": "tsb",
    "documentId": "10152445",
    "years": [
      2013,
      2014
    ],
    "category": "steering",
    "title": "EPS Torque-Sensor Signal Failure",
    "description": "Honda product-update material documents a supplier defect that can make the EPS torque sensor send an incorrect signal and cause the control unit to disable power assist on certain 2013-2014 Accord vehicles.",
    "solution": "Check for DTC 53-01 or 53-02. Update the EPS software and replace the steering gearbox when the applicable torque-sensor code is stored, subject to VIN eligibility.",
    "symptoms": [
      "EPS warning lamp",
      "Sudden loss of steering assist",
      "DTC 53-01 or 53-02"
    ],
    "affectedSystems": [
      "EPS torque sensor",
      "EPS control unit",
      "steering gearbox"
    ],
    "url": "https://static.nhtsa.gov/odi/tsbs/2018/MC-10152445-0001.pdf",
    "dtcCodes": [
      "53-01",
      "53-02"
    ]
  },
  {
    "id": "honda-accord-c-compressor-clutch-will-not-engage",
    "frozenClaim": "A/C Compressor Clutch Will Not Engage (Coil Failure / Excess Air Gap)",
    "sourceType": "tsb",
    "documentId": "10204264",
    "years": [
      2008,
      2009,
      2010,
      2011,
      2012
    ],
    "category": "engine",
    "title": "Cold-Start VTC Actuator Rattle",
    "description": "Honda bulletin 09-010 covers a loud rattle for roughly two seconds at cold start when the VTC actuator does not lock as intended on certain four-cylinder Accord vehicles.",
    "solution": "Cold-soak the vehicle, confirm the brief startup rattle, and replace the VTC actuator using Honda's bulletin procedure when the condition is verified.",
    "symptoms": [
      "Loud engine rattle for about two seconds after cold start"
    ],
    "affectedSystems": [
      "VTC actuator",
      "camshaft timing system"
    ],
    "url": "https://static.nhtsa.gov/odi/tsbs/2016/MC-10204264-9999.pdf",
    "engines": [
      "2.4L four-cylinder"
    ]
  },
  {
    "id": "honda-accord-cvt-start-clutch-judder",
    "frozenClaim": "CVT Start Clutch Juddering",
    "sourceType": "tsb",
    "documentId": "10054349",
    "years": [
      2013
    ],
    "category": "suspension",
    "title": "Front Wheel-Bearing Noise Investigation",
    "description": "Honda documented an investigation into growling, groaning, howling or whining from the front wheel bearing on certain 2013 Accord vehicles.",
    "solution": "Road-test and isolate the noise to a front bearing. Because the source is an investigation request rather than a repair bulletin, use current Honda service information before replacing parts.",
    "symptoms": [
      "Growling, groaning, howling or whining from a front wheel"
    ],
    "affectedSystems": [
      "front wheel bearings",
      "front hubs"
    ],
    "url": "https://static.nhtsa.gov/odi/tsbs/2013/SB-10054349-4308.pdf"
  },
  {
    "id": "honda-accord-display-audio-apple-carplay-infotainment-freezing-rebooting",
    "frozenClaim": "Display Audio / Apple CarPlay Infotainment Freezing, Rebooting, and Blank Screen",
    "sourceType": "tsb",
    "documentId": "10170223",
    "years": [
      2018
    ],
    "category": "body",
    "title": "Roof Paint Peeling Investigation",
    "description": "Honda documented an investigation into roof-paint peeling complaints on certain 2018 Accord vehicles.",
    "solution": "Document the paint condition and confirm there is no impact, chemical or prior-repair damage. This source is an investigation request, so consult current Honda guidance before repair.",
    "symptoms": [
      "Paint peels from the roof panel"
    ],
    "affectedSystems": [
      "roof panel",
      "paint finish"
    ],
    "url": "https://static.nhtsa.gov/odi/tsbs/2020/MC-10170223-0001.pdf"
  },
  {
    "id": "honda-accord-engine-balance-shaft-seal-timing-component-oil-leak-risk",
    "frozenClaim": "Engine Balance Shaft Seal / Timing Component Oil Leak Risk",
    "sourceType": "tsb",
    "documentId": "10144040",
    "years": [
      2018
    ],
    "category": "body",
    "title": "Fuel-Fill Door Lock Actuator Sticks Closed",
    "description": "Honda service information documents a fuel-fill door that will not open on certain 2018 Accord vehicles and identifies the lock actuator as the interim repair target.",
    "solution": "Confirm the release command reaches the actuator, then replace the fuel-fill door lock actuator under Honda's procedure when the actuator is at fault.",
    "symptoms": [
      "Fuel-fill door will not open"
    ],
    "affectedSystems": [
      "fuel-fill door",
      "fuel-fill door lock actuator"
    ],
    "url": "https://static.nhtsa.gov/odi/tsbs/2018/MC-10144040-9999.pdf"
  },
  {
    "id": "honda-accord-eps-failure",
    "frozenClaim": "Electric Power Steering (EPS) Failure",
    "sourceType": "tsb",
    "documentId": "10162002",
    "years": [
      2008,
      2009,
      2010,
      2011,
      2012
    ],
    "category": "engine",
    "title": "V6 Piston-Ring Rotation and Oil-Fouled Misfire",
    "description": "Honda bulletin 13-081 covers piston rings that can rotate and align on certain V6 Accords, increasing oil entry into the combustion chamber and fouling spark plugs.",
    "solution": "Confirm the bulletin's misfire and oil-consumption criteria. Replace affected pistons, rings and fouled spark plugs following Honda's cylinder-specific procedure.",
    "symptoms": [
      "Misfire and check-engine lamp",
      "Oil-fouled spark plugs",
      "Elevated oil consumption"
    ],
    "affectedSystems": [
      "V6 pistons",
      "piston rings",
      "spark plugs"
    ],
    "url": "https://static.nhtsa.gov/odi/tsbs/2019/MC-10162002-0001.pdf",
    "engines": [
      "3.5L V6"
    ]
  },
  {
    "id": "honda-accord-evap-canister-purge-valve-sticking-p0455-p0496-p0441",
    "frozenClaim": "EVAP Canister Purge Valve Sticking - P0455 / P0496 / P0441",
    "sourceType": "recall",
    "campaign": "00V184",
    "sourceYear": 2000,
    "years": [
      2000
    ],
    "category": "suspension",
    "title": "Rear Suspension Arm Weld Recall",
    "description": "NHTSA campaign 00V184 covers certain 2000 Honda Accord vehicles. The rear suspension lower arms and/or control arms could break due to improper welding.",
    "solution": "Dealers will inspect and replace the rear suspension lower arms or control arms if necessary.",
    "symptoms": [
      "Vehicle handling and control would be reduced."
    ],
    "affectedSystems": [
      "suspension:front:control arm:lower arm"
    ],
    "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=ACCORD&modelYear=2000"
  },
  {
    "id": "honda-accord-front-stabilizer-bar-link-wear-clunk-rattle-over-bumps",
    "frozenClaim": "Front Stabilizer Bar Link Wear - Clunk/Rattle Over Bumps",
    "sourceType": "recall",
    "campaign": "02V051",
    "sourceYear": 2000,
    "years": [
      2000,
      2001
    ],
    "category": "safety",
    "title": "Rear Center Seat-Belt Buckle Follow-Up Recall",
    "description": "NHTSA campaign 02V051 covers certain 2000, 2001 Honda Accord vehicles. Certain sedans and coupes fail to comply with the requirements of federal motor vehicle safety standard no. 209, \"seat belt assemblies.\" Certain rear seat belt buckles were improperly manufactured.",
    "solution": "In a previous recall (01v-380), only right and left buckles were inspected. The rear center buckle should also be inspected and corrected if necessary. This recall is being conducted only for the center buckle. Dealers will inspect the vehicles and replace the seat belt assemblies that were improperly manufactured. Only buckles that are marked (on the back side of the buckle) with an assembly number beginning with 00185, 00186, or 00187, will be replaced. Owners should contact their dealer for this replacement.",
    "symptoms": [
      "The rear seat belts will work properly and provide protection in a crash, but the owner may experience difficulty unfastening the belt after the crash."
    ],
    "affectedSystems": [
      "seat belts:front:buckle assembly"
    ],
    "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=ACCORD&modelYear=2000"
  },
  {
    "id": "honda-accord-hvac-blend-door-actuator-clicking-wrong-air-temperature",
    "frozenClaim": "HVAC Blend Door Actuator Clicking and Wrong Air Temperature",
    "sourceType": "recall",
    "campaign": "02V080",
    "sourceYear": 2000,
    "years": [
      2000
    ],
    "category": "safety",
    "title": "Passenger Airbag Inflator Weld Recall",
    "description": "NHTSA campaign 02V080 covers certain 2000 Honda Accord vehicles. On affected vehicles, a component in the inflator of some passenger air bag modules was not welded properly.",
    "solution": "Dealers will replace the passenger air bag module.",
    "symptoms": [
      "As a result, the affected air bags may not deploy correctly in a crash, increasing the risk of injury to a front seat passenger."
    ],
    "affectedSystems": [
      "air bags:frontal"
    ],
    "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=ACCORD&modelYear=2000"
  },
  {
    "id": "honda-accord-hybrid-ima-inverter-2018",
    "frozenClaim": "Hybrid Inverter/Power Control Unit (PCU) Cooling System Failure",
    "sourceType": "recall",
    "campaign": "02V120",
    "sourceYear": 1997,
    "years": [
      1997,
      1998,
      1999
    ],
    "category": "electrical",
    "title": "Ignition-Switch Contact Wear and Stall Recall",
    "description": "NHTSA campaign 02V120 covers certain 1997, 1998, 1999 Honda Accord vehicles. On certain sedans, coupes, hatchbacks, and sport utility vehicles, electrical contacts in the ignition switch can degrade due to the high electrical current passing through the switch when the vehicle is started.",
    "solution": "Dealers will replace the ignition switch.",
    "symptoms": [
      "Worn contacts could cause the engine to stall without warning, increasing the risk of a crash."
    ],
    "affectedSystems": [
      "electrical system:ignition:switch"
    ],
    "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=ACCORD&modelYear=1997"
  },
  {
    "id": "honda-accord-hybrid-power-loss",
    "frozenClaim": "Hybrid Power Loss While Driving",
    "sourceType": "recall",
    "campaign": "02V226",
    "sourceYear": 2002,
    "years": [
      2002
    ],
    "category": "engine",
    "title": "V6 Water-Pump and Timing-Belt Alignment Recall",
    "description": "NHTSA campaign 02V226 covers certain 2002 Honda Accord vehicles. On certain minivans, sedans, coupes, and sport utility vehicles equipped with V6 engines, a timing belt tensioner pulley on the water pump is misaligned and could cause the timing belt to contact a bolt on the cylinder head. Eventually the belt could be damaged and fail.",
    "solution": "Dealers will inspect the water pump and if it is one of the defective pumps, the water pump and timing belt will be replaced.",
    "symptoms": [
      "If the timing belt breaks, the engine will stall, increasing the risk of a crash."
    ],
    "affectedSystems": [
      "engine and engine cooling:engine"
    ],
    "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=ACCORD&modelYear=2002"
  },
  {
    "id": "honda-accord-ignition-distributor-internal-failure-stalling-no-start",
    "frozenClaim": "Ignition Distributor Internal Failure (Igniter/Coil) - Stalling and No-Start",
    "sourceType": "recall",
    "campaign": "03V423",
    "sourceYear": 1998,
    "years": [
      1998,
      1999
    ],
    "category": "electrical",
    "title": "Ignition Interlock Wear and Rollaway Recall",
    "description": "NHTSA campaign 03V423 covers certain 1998, 1999 Honda Accord vehicles. On certain passenger vehicles and mini vans, the ignition switch may wear excessively and prevent proper interlock operation, making it possible to turn the ignition key to the \"off\" position and remove the key without shifting the transmission to \"park.\"",
    "solution": "Dealers will perform an inspection procedure that determines the amount of cylinder body wear. If significant wear is indicated, the dealer will replace the cylinder body, collar, and latch plate. If no signs of wear are indicated, dealers will replace the latch plate with a redesigned part.",
    "symptoms": [
      "If the vehicle operator does not shift to \"park\" before removing the key and fails to engage the parking brake, the vehicle could roll and a crash could occur."
    ],
    "affectedSystems": [
      "electrical system:ignition:switch"
    ],
    "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=ACCORD&modelYear=1998"
  },
  {
    "id": "honda-accord-ignition-interlock-key-removal-allows-rollaway",
    "frozenClaim": "Ignition Interlock / Key Removal Allows Rollaway",
    "sourceType": "recall",
    "campaign": "04V176",
    "sourceYear": 2003,
    "years": [
      2003,
      2004
    ],
    "category": "drivetrain",
    "title": "Automatic-Transmission Second-Gear Overheat Recall",
    "description": "NHTSA campaign 04V176 covers certain 2003, 2004 Honda Accord vehicles. On some mini vans, sport utility and passenger vehicles, certain operating conditions can result in heat build-up between the countershaft and secondary shaft second gears in the automatic transmission, eventually leading to gear tooth chipping or gear breakage.",
    "solution": "On vehicles with 15,000 miles or less, the dealer will update the transmission with a simple revision to the oil cooler return line to increase lubrication to the second gear. On vehicles with more than 15,000 miles, the dealer will inspect the transmission to identify gears that have already experienced discoloration due to overheating. If discoloration exists, the transmission will be replaced if discoloration is not present, the dealer will perform the revision to the oil cooler return line.",
    "symptoms": [
      "Gear failure could result in transmission lockup, which could result in a crash."
    ],
    "affectedSystems": [
      "power train:automatic transmission"
    ],
    "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=ACCORD&modelYear=2003"
  },
  {
    "id": "honda-accord-ignition-switch-and-immobilizer-shut-off-no-start",
    "frozenClaim": "Ignition Switch and Immobilizer Shut-Off / No-Start",
    "sourceType": "recall",
    "campaign": "04V256",
    "sourceYear": 2000,
    "years": [
      2000,
      2001
    ],
    "category": "electrical",
    "title": "Instrument-Panel Dimmer Heat Failure Recall",
    "description": "NHTSA campaign 04V256 covers certain 2000, 2001 Honda Accord vehicles. On affected vehicles, the dimmer control for the instrument panel lights could fail due to heat buildup.",
    "solution": "Dealers will replace a multiplex control unit for the instrument panel lights.",
    "symptoms": [
      "If this occurs, the instrument lights may fail and, at night, the driver may not be able to see the instrument panel gauges, such as the speedometer."
    ],
    "affectedSystems": [
      "interior lighting"
    ],
    "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=ACCORD&modelYear=2000"
  },
  {
    "id": "honda-accord-ignition-switch-wear-park-shift-interlock-defect",
    "frozenClaim": "Ignition Switch Wear & Park-Shift Interlock Defect (NHTSA Recalls)",
    "sourceType": "recall",
    "campaign": "04V551",
    "sourceYear": 2004,
    "years": [
      2004,
      2005
    ],
    "category": "safety",
    "title": "Driver Airbag Fabric Tear Recall",
    "description": "NHTSA campaign 04V551 covers certain 2004, 2005 Honda Accord vehicles. On certain sedans, a tear in the fabric of the driver's front air bag occurred after apparent contact with the inside surface of the air bag cover during deployment.",
    "solution": "Dealers will install a protective fabric flap between the air bag module cover and the inner module.",
    "symptoms": [
      "A torn air bag may not offer the same level of protection, in the event of a crash, thereby increasing the risk of injury to the driver."
    ],
    "affectedSystems": [
      "air bags:frontal"
    ],
    "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=ACCORD&modelYear=2004"
  },
  {
    "id": "honda-accord-ima-hybrid-battery-deterioration-ima-warning-light",
    "frozenClaim": "IMA Hybrid Battery Deterioration and IMA Warning Light (1st-Gen Accord Hybrid)",
    "sourceType": "recall",
    "campaign": "05V025",
    "sourceYear": 1999,
    "years": [
      1999,
      2000,
      2001,
      2002
    ],
    "category": "electrical",
    "title": "Ignition-Key Park-Interlock Recall",
    "description": "NHTSA campaign 05V025 covers certain 1999, 2000, 2001, 2002 Honda Accord vehicles. On affected vehicles, the interlock operation of the ignition switch may not function properly, making it possible to turn the ignition key to the \"off\" position and remove the key without shifting the transmission to park.",
    "solution": "Dealers will perform an inspection procedure that confirms interlock function. Vehicles will be updated with a redesigned interlock lever free of charge.",
    "symptoms": [
      "If the driver does not shift to park before removing the key and fails to engage the parking brake, the vehicle could roll and a crash could occur."
    ],
    "affectedSystems": [
      "electrical system:ignition:switch"
    ],
    "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=ACCORD&modelYear=1999"
  },
  {
    "id": "honda-accord-instrument-cluster-display-backlight-failure",
    "frozenClaim": "Instrument Cluster / Display Backlight Failure (Dark Gauges & Climate Display)",
    "sourceType": "recall",
    "campaign": "05V132",
    "sourceYear": 2005,
    "years": [
      2005
    ],
    "category": "electrical",
    "title": "Main Fuse-Box Fuel-Pump Terminal Recall",
    "description": "NHTSA campaign 05V132 covers certain 2005 Honda Accord vehicles. On affected vehicles, a loose terminal in the main fuse box may cause the fuel pump to lose power. If the fuel pump becomes inoperative, the engine may not start.",
    "solution": "Dealers will replace the entire fuse box free of charge.",
    "symptoms": [
      "If the fuel pump loses power while driving the engine could stall without warning which could result in a crash."
    ],
    "affectedSystems": [
      "electrical system:wiring:fuses and circuit breakers"
    ],
    "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=ACCORD&modelYear=2005"
  },
  {
    "id": "honda-accord-oil-consumption-blue-smoke-startup",
    "frozenClaim": "Oil Consumption / Blue Smoke on Startup (Valve Seals & Valve-Cover Gasket)",
    "sourceType": "recall",
    "campaign": "05V510",
    "sourceYear": 2006,
    "years": [
      2006
    ],
    "category": "safety",
    "title": "Front Impact-Sensor Bolt Recall",
    "description": "NHTSA campaign 05V510 covers certain 2006 Honda Accord vehicles. On affected vehicles, on the frontal airbag system where the two external impact sensors is mounted, near the front headlights the front impact sensor bolts were not properly torqued.",
    "solution": "Dealers will inspect and remove the bumper and retorque the loose bolts.",
    "symptoms": [
      "If the bolts loosen or fall out, the sensor may fail to properly detect a crash, possibly resulting in delayed or non-deployment of the front airbag increasing the risk of injury."
    ],
    "affectedSystems": [
      "air bags:frontal"
    ],
    "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=ACCORD&modelYear=2006"
  },
  {
    "id": "honda-accord-p0011-intake-cam-over-advanced-from-defective-vtc-actuator",
    "frozenClaim": "P0011 — Intake Cam Over-Advanced from Defective VTC Actuator (Cold-Start Rattle)",
    "sourceType": "recall",
    "campaign": "05V536",
    "sourceYear": 2006,
    "years": [
      2006
    ],
    "category": "suspension",
    "title": "Factory Tire-Bead Damage Recall",
    "description": "NHTSA campaign 05V536 covers certain 2006 Honda Accord vehicles. On affected vehicles, the tires could have been damaged when the tires were mounted on the wheels. In certain circumstances, the bead area of the tire may have been damaged.",
    "solution": "Dealers will remove all four tires and inspect them for bead area damage. If there is damage, a new tire will be installed free of charge.",
    "symptoms": [
      "If the bead sealing area is damaged, loss of air could occur while driving, increasing the risk of a crash."
    ],
    "affectedSystems": [
      "tires:bead"
    ],
    "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=ACCORD&modelYear=2006"
  },
  {
    "id": "honda-accord-p0016-crank-cam-correlation-from-stretched-timing-chain-worn",
    "frozenClaim": "P0016 — Crank/Cam Correlation from Stretched Timing Chain or Worn VTC Actuator",
    "sourceType": "recall",
    "campaign": "07V097",
    "sourceYear": 2005,
    "years": [
      2005
    ],
    "category": "fuel",
    "title": "Fuel-Pump Relay Coil-Wire Recall",
    "description": "NHTSA campaign 07V097 covers certain 2005 Honda Accord vehicles. On certain vehicles, a coil wire inside the fuel pump relay may break, causing the fuel pump to lose power. If the fuel pump becomes inoperative, the engine may not start.",
    "solution": "Dealers will inspect and replace the fuel pump relay free of charge.",
    "symptoms": [
      "If the fuel pump loses power while driving, the engine could stall without warning, and a crash could occur."
    ],
    "affectedSystems": [
      "fuel system, gasoline:delivery:fuel pump"
    ],
    "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=ACCORD&modelYear=2005"
  },
  {
    "id": "honda-accord-p0442-small-evap-leak-from-degraded-fuel-cap-seal-failing-pu",
    "frozenClaim": "P0442 — Small EVAP Leak from Degraded Fuel Cap Seal or Failing Purge Valve",
    "sourceType": "recall",
    "campaign": "08V169",
    "sourceYear": 2003,
    "years": [
      2003
    ],
    "category": "body",
    "title": "Windshield-Wiper Motor Water-Intrusion Recall",
    "description": "NHTSA campaign 08V169 covers certain 2003 Honda Accord vehicles. Honda is recalling 351,000 my 2003 Accord vehicles. If water enters the windshield wiper motor breather port, which is designed to allow the motor to vent warm air during normal operation, it can result in corrosion inside the motor housing. This can cause a failure of the electrical circuit breaker inside the motor housing.",
    "solution": "Dealers will inspect the windshield wiper motor for signs of corrosion. If no signs of corrosion are present, a cover will be installed over the wiper motor to prevent water from entering the wiper motor housing. If signs of corrosion damage are observed on the wiper motor, the motor will be replaced.",
    "symptoms": [
      "If the circuit breaker fails, it will cause the windshield wiper motor to become inoperative, which can increase the likelihood of a crash in certain conditions."
    ],
    "affectedSystems": [
      "visibility:windshield wiper/washer:motor"
    ],
    "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=ACCORD&modelYear=2003"
  },
  {
    "id": "honda-accord-p0741-torque-converter-clutch-stuck-off-failing-lockup-clutc",
    "frozenClaim": "P0741 — Torque Converter Clutch Stuck Off / Failing Lockup Clutch Solenoid",
    "sourceType": "recall",
    "campaign": "10V640",
    "sourceYear": 2010,
    "years": [
      2010,
      2011
    ],
    "category": "suspension",
    "title": "V6 Front Spindle-Nut Recall",
    "description": "NHTSA campaign 10V640 covers certain 2010, 2011 Honda Accord vehicles. The bolts that attach the lower left and right front damper bracket to the front suspension and the spindle nuts on the pilot may not have been properly tightened which may result in loss of steering. The spindle nuts for the axle on the Accord V6 may not have been tightened properly which may result in excessive noise and/or loss of steering.",
    "solution": "Dealer will inspect and replace any loose front damper bracket bolts or spindle nuts on the pilot if necessary. Dealer will inspect and replace the spindle nuts on the Accord V6 if necessary.",
    "symptoms": [
      "Loss of steering increases the risk of a crash."
    ],
    "affectedSystems": [
      "suspension"
    ],
    "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=ACCORD&modelYear=2010"
  },
  {
    "id": "honda-accord-passenger-side-front-subframe-rust-corrosion",
    "frozenClaim": "Passenger-Side Front Subframe Rust Corrosion",
    "sourceType": "recall",
    "campaign": "11V004",
    "sourceYear": 2010,
    "years": [
      2010
    ],
    "category": "electrical",
    "title": "Ignition Harness Connector Stall Recall",
    "description": "NHTSA campaign 11V004 covers certain 2010 Honda Accord vehicles. There is a potential failure with the engine wiring harness connector which may cause intermittent spark firing or the engine to stall.",
    "solution": "Dealer will inspect and replace the ignition wiring harness connector free of charge.",
    "symptoms": [
      "An engine stall will increase the risk of a crash."
    ],
    "affectedSystems": [
      "electrical system"
    ],
    "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=ACCORD&modelYear=2010"
  },
  {
    "id": "honda-accord-pgm-fi-main-relay-failure-hot-no-start",
    "frozenClaim": "PGM-FI Main Relay Failure (Cracked Solder Joints) — Hot No-Start",
    "sourceType": "recall",
    "campaign": "11V395",
    "sourceYear": 2005,
    "years": [
      2005,
      2006,
      2007,
      2008,
      2009,
      2010
    ],
    "category": "drivetrain",
    "title": "Automatic-Transmission Control Software Recall",
    "description": "NHTSA campaign 11V395 covers certain 2005, 2006, 2007, 2008, 2009, 2010 Honda Accord vehicles. Honda is recalling certain model year 2005-2010 Accord, 2007-2010 cr-v, and 2005-2008 element passenger cars manufactured from july 1, 2004, through september 3, 2010. The outer race of the secondary shaft bearing may be broken during certain driving styles. A broken outer race may cause abnormal noise, the malfunction indicator light to turn on, and allow contact between the transmission idle gear and an electronic sensor housing within the transmission.",
    "solution": "Honda will notify owners and dealers will update the automatic transmission control module software free of charge.",
    "symptoms": [
      "This could result in a short circuit causing the engine to stall. Additionally, broken pieces of the outer race or ball bearing from the secondary shaft may become lodged in the parking pawl resulting in the vehicle rolling after the driver has placed the gear selector in the park position. Engine stall and unexpected vehicle movement increases the risk of a crash or personal injury to persons within the path of a rolling vehicle."
    ],
    "affectedSystems": [
      "power train:automatic transmission:control module (tcm/pcm/tecm)"
    ],
    "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=ACCORD&modelYear=2005"
  },
  {
    "id": "honda-accord-porous-engine-block-casting-causing-oil-coolant-leak",
    "frozenClaim": "Porous Engine Block Casting Causing Oil/Coolant Leak",
    "sourceType": "recall",
    "campaign": "12V030",
    "sourceYear": 2012,
    "years": [
      2012
    ],
    "category": "safety",
    "title": "Side-Curtain Airbag Inflator Recall",
    "description": "NHTSA campaign 12V030 covers certain 2012 Honda Accord vehicles. The driver-side or passenger-side side curtain airbag inflator may not have been manufactured according to correct specifications.",
    "solution": "Honda will replace the driver's side or passenger's side side curtain airbag as needed free of charge.",
    "symptoms": [
      "In the event of a crash, the side curtain airbag may fail to deploy, increasing the risk of injury."
    ],
    "affectedSystems": [
      "air bags:side/window"
    ],
    "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=ACCORD&modelYear=2012"
  },
  {
    "id": "honda-accord-power-door-lock-actuator-failure-buzzing-auto-cycling-locks",
    "frozenClaim": "Power Door Lock Actuator Failure - Buzzing and Auto-Cycling Locks",
    "sourceType": "recall",
    "campaign": "12V222",
    "sourceYear": 2003,
    "years": [
      2003,
      2004,
      2005,
      2006,
      2007
    ],
    "category": "steering",
    "title": "V6 Power-Steering Pressure-Hose Recall",
    "description": "NHTSA campaign 12V222 covers certain 2003, 2004, 2005, 2006, 2007 Honda Accord vehicles. In May 2012, Honda filed a defect report to recall certain model year 2007 and 2008 Acura TL vehicles. In September 2012, Honda informed the agency that it was including an additional 573,147 vehicles including certain model year 2003 through 2007 Accord V6 vehicles. The total number of vehicles being recalled is now 625,762. Prolonged under-hood and power steering fluid temperatures may cause the power steering hose to deteriorate prematurely, resulting in cracks and power steering fluid leakage.",
    "solution": "Honda will notify owners, and dealers will install a new heat resistant power steering hose, free of charge. The original",
    "symptoms": [
      "If this occurs, power steering fluid can leak onto a hot catalytic converter, leading to smoke and possibly an under-hood fire."
    ],
    "affectedSystems": [
      "steering:hydraulic power assist:hose, piping, and connections"
    ],
    "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=ACCORD&modelYear=2003"
  },
  {
    "id": "honda-accord-power-window-regulator-cable-clip-failure-window-falls-into",
    "frozenClaim": "Power Window Regulator Cable/Clip Failure - Window Falls Into Door",
    "sourceType": "recall",
    "campaign": "13V297",
    "sourceYear": 2013,
    "years": [
      2013
    ],
    "category": "fuel",
    "title": "Fuel-Tank Neck and Pump-Seal Recall",
    "description": "NHTSA campaign 13V297 covers certain 2013 Honda Accord vehicles. American Honda Motor Co., Inc. (Honda) is recalling certain model year 2013 Accord vehicles that are Low-Emission Vehicle (LEV) II rated that were manufactured January 15, 2013, through April 5, 2013. The fuel tank neck may be out of specification causing the fuel pump to not properly seal to the fuel tank.",
    "solution": "Honda will notify owners, and dealers will replace the fuel tank, nut and O-ring gasket free of charge.",
    "symptoms": [
      "An insufficent seal may led to a fuel leak which increases the risk of a fire."
    ],
    "affectedSystems": [
      "fuel system, gasoline"
    ],
    "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=ACCORD&modelYear=2013"
  },
  {
    "id": "honda-accord-premature-catalytic-converter-failure-p0420-p0430-low-effici",
    "frozenClaim": "Premature Catalytic Converter Failure - P0420 / P0430 Low Efficiency",
    "sourceType": "recall",
    "campaign": "15V121",
    "sourceYear": 2014,
    "years": [
      2014,
      2015
    ],
    "category": "engine",
    "title": "Connecting-Rod Bolt Torque Recall",
    "description": "NHTSA campaign 15V121 covers certain 2014, 2015 Honda Accord vehicles. American Honda Motor Co. (Honda) is recalling certain model year 2014 Accord L4 vehicles manufactured July 29, 2014, to July 31, 2014, 2015 Accord L4 vehicles manufactured August 14, 2014, to January 30, 2015, and 2015 CR-V vehicles manufactured September 9, 2014, to February 6, 2015. The affected vehicles may have been assembled with improperly torqued connecting rod bolts, which can cause the engine to lose power or leak oil.",
    "solution": "Honda will notify owners, and dealers will replace the engine short block, free of charge.",
    "symptoms": [
      "Loss of engine power may result in a vehicle stall, increasing the risk of a crash. If the engine leaks oil in the proximity of hot engine or exhaust components, there is an increased risk of a fire."
    ],
    "affectedSystems": [
      "engine and engine cooling:engine"
    ],
    "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=ACCORD&modelYear=2014"
  },
  {
    "id": "honda-accord-rear-brake-caliper-seizing-premature-rear-brake-pad-wear",
    "frozenClaim": "Rear Brake Caliper Seizing and Premature Rear Brake Pad Wear",
    "sourceType": "recall",
    "campaign": "17V418",
    "sourceYear": 2013,
    "years": [
      2013,
      2014,
      2015,
      2016
    ],
    "category": "electrical",
    "title": "12-Volt Battery Sensor Corrosion Recall",
    "description": "NHTSA campaign 17V418 covers certain 2013, 2014, 2015, 2016 Honda Accord vehicles. Honda (American Honda Motor Co.) is recalling certain 2013-2016 Honda Accord vehicles. The case for the battery sensor, part of the battery management system, may allow water to get in, potentially causing an electrical short.",
    "solution": "Honda will notify owners, and dealers will replace the sensor, free of charge. Dealers will perform an interim remedy of applying adhesive to the case to prevent water intrusion.",
    "symptoms": [
      "An electrical short increases the risk of a fire."
    ],
    "affectedSystems": [
      "electrical system:12v/24v/48v battery"
    ],
    "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=ACCORD&modelYear=2013"
  },
  {
    "id": "honda-accord-rear-wheel-bearing-hub-noise-humming-growling",
    "frozenClaim": "Rear Wheel Bearing / Hub Noise - Humming and Growling (TSB A17-089)",
    "sourceType": "recall",
    "campaign": "18V629",
    "sourceYear": 2018,
    "years": [
      2018
    ],
    "category": "electrical",
    "title": "Rearview-Camera Software Recall",
    "description": "NHTSA campaign 18V629 covers certain 2018 Honda Accord vehicles. Honda (American Honda Motor Co.) is recalling certain 2018 Honda Accord and 2019 Honda Insight vehicles. In certain scenarios, the back-up camera center display may not function properly. As such, these vehicles fail to comply with the requirements of Federal Motor Vehicle Safety Standard (FMVSS) number 111, \"Rearview Mirrors.\"",
    "solution": "Honda will notify owners, and dealers will reprogram the display audio unit software, free of charge.",
    "symptoms": [
      "If the rearview camera display does not show what is behind the vehicle, it can increase the risk of a crash."
    ],
    "affectedSystems": [
      "back over prevention: sensing system: camera"
    ],
    "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=ACCORD&modelYear=2018"
  },
  {
    "id": "honda-accord-sun-visor-loses-tension-falls-down",
    "frozenClaim": "Sun Visor Loses Tension and Falls Down (9th Gen)",
    "sourceType": "recall",
    "campaign": "20V769",
    "sourceYear": 2013,
    "years": [
      2013,
      2014,
      2015
    ],
    "category": "drivetrain",
    "title": "Salt-Corrosion Driveshaft Recall",
    "description": "NHTSA campaign 20V769 covers certain 2013, 2014, 2015 Honda Accord vehicles. Honda (American Honda Motor Co.) is recalling certain 2013-2015 Accord vehicles equipped with a 4-cylinder engine and a continuously-variable transmission that were originally sold, or ever registered, in Connecticut, Delaware, District of Columbia, Illinois, Indiana, Iowa, Kentucky, Maine, Maryland, Massachusetts, Michigan, Minnesota, Missouri, New Hampshire, New Jersey, New York, Ohio, Pennsylvania, Rhode Island, Vermont, Virginia, West Virginia, and Wisconsin. The drive shafts were assembled with a lubricant that may have degraded the drive shafts' protective coating, making it more susceptible to damage from road salt or other contaminants, and potentially cause it to break.",
    "solution": "Honda will notify owners, and dealers will inspect the drive shafts, replacing both the left and right drive shafts, if necessary, free of charge.",
    "symptoms": [
      "A broken drive shaft may cause a sudden loss of drive power. The vehicle could also roll away if the parking brake has not been applied before the vehicle has been exited. Either condition can increase the risk of a crash or injury."
    ],
    "affectedSystems": [
      "power train:driveline:driveshaft"
    ],
    "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=ACCORD&modelYear=2013"
  },
  {
    "id": "honda-accord-takata-airbag-inflator-and-srs-warning-light-problems",
    "frozenClaim": "Takata Airbag Inflator and SRS Warning Light Problems",
    "sourceType": "recall",
    "campaign": "20V771",
    "sourceYear": 2018,
    "years": [
      2018,
      2019,
      2020
    ],
    "category": "electrical",
    "title": "Body-Control Module Software Recall",
    "description": "NHTSA campaign 20V771 covers certain 2018, 2019, 2020 Honda Accord vehicles. Honda (American Honda Motor Co.) is recalling certain 2018-2020 Accord Sedan, Accord Hybrid, and 2019-2020 Insight vehicles. A software error may cause intermittent or continuous disruptions in communication between the Body Control Module (BCM) and other components. This may result in malfunctions of various systems such as the windshield wipers and defroster, rearview camera, exterior lights, audible warning of a stopped vehicle, and power window operation. As such, these vehicles fail to comply with the requirements of Federal Motor Vehicle Safety Standard (FMVSS) number 103, \"Windshield Defrosting and Defogging Systems\" and number 111, \"Rear Visibility\" as well as FMVSS numbers 104, 108, 114, 118, and 305.",
    "solution": "Honda will notify owners, and dealers will update the BCM software, free of charge.",
    "symptoms": [
      "Various system malfunctions such as inoperative windshield wipers, defroster, rearview camera, or exterior lighting can increase the risk of a crash."
    ],
    "affectedSystems": [
      "electrical system:body control module:software"
    ],
    "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=ACCORD&modelYear=2018"
  },
  {
    "id": "honda-accord-timing-belt-neglect-interference-engine",
    "frozenClaim": "Timing Belt Neglect on Interference Engine (Catastrophic Valve Damage)",
    "sourceType": "recall",
    "campaign": "21V900",
    "sourceYear": 2021,
    "years": [
      2021
    ],
    "category": "safety",
    "title": "Rear Center Seat-Belt Retractor Recall",
    "description": "NHTSA campaign 21V900 covers certain 2021 Honda Accord vehicles. Honda (American Honda Motor Co.) is recalling certain 2021 Accord Sedan, Accord Hybrid, CR-V, Ridgeline, 2022 Insight and CR-V Hybrid vehicles. The automatic locking retractor on the second-row center seat belt assembly may deactivate improperly, which can result in an unsecured child restraint system. As such, these vehicles fail to comply with the requirements of Federal Motor Vehicle Safety Standard number 208, \"Occupant Crash Protection.\"",
    "solution": "Dealers will replace the second-row center seat belt assembly, free of charge.",
    "symptoms": [
      "An unsecured child restraint system can increase the risk of injury during a crash."
    ],
    "affectedSystems": [
      "seat belts:rear/other:retractor"
    ],
    "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=ACCORD&modelYear=2021"
  },
  {
    "id": "honda-accord-v6-automatic-transmission-failure-and-gear-slipping",
    "frozenClaim": "V6 Automatic Transmission Failure and Gear Slipping",
    "sourceType": "recall",
    "campaign": "23V158",
    "sourceYear": 2018,
    "years": [
      2018,
      2019
    ],
    "category": "safety",
    "title": "Front Seat-Belt Buckle Release-Button Recall",
    "description": "NHTSA campaign 23V158 covers certain 2018, 2019 Honda Accord vehicles. Honda (American Honda Motor Co.) is recalling certain 2017-2020 CR-V, 2018-2019 Accord and Accord Hybrid, 2018-2020 Odyssey, 2019 Insight, and 2019-2020 Acura RDX vehicles. A manufacturing issue with the front seat belts may cause the seat belt buckle channel to interfere with the release button, preventing the seat belt buckle from latching.",
    "solution": "Dealers will replace the driver and front passenger seat belt buckle release buttons or the buckle assemblies as necessary, free of charge.",
    "symptoms": [
      "An unlatched seat belt cannot properly restrain the seat occupant during a crash, increasing their risk of injury."
    ],
    "affectedSystems": [
      "seat belts:front:buckle assembly"
    ],
    "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=ACCORD&modelYear=2018"
  },
  {
    "id": "honda-accord-v6-hydraulic-engine-mount-failure-idle-vibration-clunk",
    "frozenClaim": "V6 Hydraulic Engine Mount Failure - Idle Vibration and Clunk (VCM)",
    "sourceType": "recall",
    "campaign": "23V430",
    "sourceYear": 2022,
    "years": [
      2022
    ],
    "category": "brakes",
    "title": "VSA Modulator Brake-Fluid Leak Recall",
    "description": "NHTSA campaign 23V430 covers certain 2022 Honda Accord vehicles. Honda (America Honda Motor Co.) is recalling certain 2023 Civic, Acura RDX, Acura Integra, and 2022 Honda Accord vehicles. A ball valve in the vehicle stability assist (VSA) modulator may leak brake fluid, which can result in unintended vehicle movement when the brake hold feature is engaged or an unexpected increase in brake pedal travel.",
    "solution": "Dealers will replace the VSA modulator, free of charge.",
    "symptoms": [
      "Unintended vehicle movement or an unexpected increase in brake pedal travel can increase the risk of a crash or injury."
    ],
    "affectedSystems": [
      "service brakes, hydraulic:antilock/traction control/electronic limited slip:control unit/module"
    ],
    "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=ACCORD&modelYear=2022"
  },
  {
    "id": "honda-accord-v6-power-steering-pressure-hose-deterioration-leak-under-hoo",
    "frozenClaim": "V6 Power Steering Pressure Hose Deterioration - Leak and Under-Hood Fire Risk (Recall 12V222000)",
    "sourceType": "recall",
    "campaign": "23V782",
    "sourceYear": 2023,
    "years": [
      2023,
      2024
    ],
    "category": "safety",
    "title": "Front Seat-Belt Pretensioner Rivet Recall",
    "description": "NHTSA campaign 23V782 covers certain 2023, 2024 Honda Accord vehicles. Honda (American Honda Motor Co.) is recalling certain 2023-2024 Accord and HR-V vehicles. The front seat belt pretensioners may be missing the rivet that secures the quick connector and wire plate. As such, these vehicles fail to comply with the requirements of Federal Motor Vehicle Safety Standard numbers 208, \"Occupant Crash Protection,\" 209, \"Seat Belt Assembles,\" and 210, \"Seat Belt Assembly Anchorages.\"",
    "solution": "Dealers will inspect and replace the seat belt pretensioner assemblies as necessary, free of charge.",
    "symptoms": [
      "A seat belt pretensioner missing a rivet will not properly restrain the occupant, increasing the risk of injury during a crash."
    ],
    "affectedSystems": [
      "seat belts:front"
    ],
    "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=ACCORD&modelYear=2023"
  },
  {
    "id": "honda-accord-v6-timing-belt-water-pump-2008",
    "frozenClaim": "V6 Timing Belt and Water Pump Required Service (Interference Engine)",
    "sourceType": "recall",
    "campaign": "23V858",
    "sourceYear": 2013,
    "years": [
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
    ],
    "category": "fuel",
    "title": "Low-Pressure Fuel-Pump Impeller Recall",
    "description": "NHTSA campaign 23V858 covers certain 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023 Honda Accord vehicles. Honda (American Honda Motor Co.) is recalling certain 2013-2023 Honda Accord, Civic Coupe, Civic Sedan, Civic Hatchback, Civic Type R, CR-V, HR-V, Ridgeline, Odyssey, Acura ILX, MDX, MDX Hybrid, RDX, RLX, TLX, 2019-2022 Honda Insight, Passport, 2020 Honda CR-V Hybrid, 2018-2019 Honda Clarity PHEV, Fit, and 2015-2020 Honda Accord Hybrid, Pilot, Acura NSX vehicles. The fuel pump inside the fuel tank may fail.",
    "solution": "Dealers will replace the fuel pump module, free of charge. Owner letters were mailed September 6, 2024.",
    "symptoms": [
      "Fuel pump failure can cause an engine stall while driving, increasing the risk of a crash."
    ],
    "affectedSystems": [
      "fuel system, gasoline:delivery:fuel pump"
    ],
    "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=ACCORD&modelYear=2013"
  },
  {
    "id": "honda-accord-v6-vcm-oil-consumption-2008",
    "frozenClaim": "V6 VCM Excessive Oil Consumption and Engine Vibration",
    "sourceType": "recall",
    "campaign": "24V763",
    "sourceYear": 2023,
    "years": [
      2023,
      2024
    ],
    "category": "fuel",
    "title": "High-Pressure Fuel-Pump Crack and Leak Recall",
    "description": "NHTSA campaign 24V763 covers certain 2023, 2024 Honda Accord vehicles. Honda (American Honda Motor Co.) is recalling certain 2023-2024 Honda Accord, Accord Hybrid, 2023-2025 Honda CR-V Hybrid, and 2025 Honda Civic and Civic Hybrid vehicles. The high-pressure fuel pump may crack and leak fuel.",
    "solution": "Dealers will inspect and replace the high-pressure fuel pump as necessary, free of charge. Owner letters were mailed February 20, 2025.",
    "symptoms": [
      "A fuel leak in the presence of an ignition source can increase the risk of a fire."
    ],
    "affectedSystems": [
      "fuel system, gasoline:delivery:fuel pump"
    ],
    "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=ACCORD&modelYear=2023"
  },
  {
    "id": "honda-accord-windshield-cracks-stress-fractures-spontaneously",
    "frozenClaim": "Windshield Cracks / Stress Fractures Spontaneously (10th Gen)",
    "sourceType": "recall",
    "campaign": "24V859",
    "sourceYear": 2023,
    "years": [
      2023,
      2024
    ],
    "category": "safety",
    "title": "Driver Seat-Cushion Frame Recall",
    "description": "NHTSA campaign 24V859 covers certain 2023, 2024 Honda Accord vehicles. Honda (American Honda Motor Co.) is recalling certain 2023-2024 Honda Accord, Accord Hybrid, Civic Sedan, Civic Hatchback, Pilot, and 2024 HR-V, Acura Integra and Acura Integra Type S vehicles. The driver's seat cushion frame may not have been tightened properly, which can result in an unsecured seat. As such, these vehicles fail to comply with the requirements of Federal Motor Vehicle Safety Standard number 207, \"Seating Systems.\"",
    "solution": "Dealers will replace the driver's seat cushion frame, free of charge.",
    "symptoms": [
      "An unsecured driver's seat may not adequately restrain the driver during a crash, increasing the risk of injury."
    ],
    "affectedSystems": [
      "seats:critical fasteners"
    ],
    "url": "https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=ACCORD&modelYear=2023"
  }
];

function replacement(card) {
  const isRecall = card.sourceType === 'recall';
  const source = {
    type: card.sourceType,
    title: isRecall ? `NHTSA Campaign ${card.campaign} - ${card.title}` : `Honda/NHTSA Document ${card.documentId} - ${card.title}`,
    url: card.url,
  };
  return {
    disposition: 'replace',
    decision: `The frozen ${card.frozenClaim} card did not establish a complete population, single mechanism, diagnosis and remedy with a directly applicable Honda or NHTSA primary source.`,
    evidence: [{ type: source.type, label: source.title, url: source.url }],
    after: {
      years: card.years, trims: card.trims || [], engines: card.engines || [], category: card.category,
      title: card.title, description: card.description, solution: card.solution,
      severity: 'high', confidence: 'high', symptoms: card.symptoms, affectedSystems: card.affectedSystems,
      dtcCodes: card.dtcCodes || [], estimatedCostLow: null, estimatedCostHigh: null,
      typicalMileageLow: null, typicalMileageHigh: null, citations: [source],
      source: 'manual',
      summary: isRecall
        ? `Replaced the unsupported ${card.frozenClaim} aggregation with exact NHTSA campaign ${card.campaign}.`
        : `Replaced the unsupported ${card.frozenClaim} aggregation with direct Honda/NHTSA document ${card.documentId}.`,
    },
  };
}

const published = Object.fromEntries(cards.map((card) => [card.id, replacement(card)]));

module.exports = buildConfig({
  label: 'Honda Accord', make: 'Honda', model: 'Accord', slug: 'honda-accord',
  batchId: 'honda-accord-full-record-cohort-164-2026-08-05', auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '7dee342858886bc0ba73de4543707dc288d7deb39e1af14a5202480f3652793d',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/honda-accord/422f4bceb371/all-0001.json',
  reviewTokens: { blind: 'hondaaccord_blind:manual-primary-source-gate', edge: 'hondaaccord_edge:manual-primary-source-gate' },
  published, reasons: {}, proposalCampaigns: [],
});
