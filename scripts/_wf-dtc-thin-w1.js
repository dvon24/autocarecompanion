export const meta = {
  name: 'dtc-thin-wave-1',
  description: 'Add real vehicle-specific cases to 20 DTC code pages currently held back by the 150-word content bar, so they re-index themselves',
  phases: [ { title: 'Discover' }, { title: 'Verify' } ],
}
const TARGETS = [
  {
    "code": "P0133",
    "name": "O2 Sensor Circuit Slow Response (Bank 1, Sensor 1)",
    "system": "Powertrain",
    "blurb": "This code indicates the upstream oxygen sensor on bank 1 is responding too slowly when switching between rich and lean readings. The computer relies on this sensor to react quickly so it can fine-tune the air-fuel mixture in real time. When the sensor's response time falls below specification, this ",
    "words": 141,
    "have": [
      {
        "make": "Nissan",
        "model": "Frontier",
        "years": [
          2000,
          2001,
          2002
        ]
      }
    ]
  },
  {
    "code": "P2789",
    "name": "Clutch \"A\" Adaptive Learning at Limit",
    "system": "Powertrain",
    "blurb": "This code, common on dual-clutch and automated-manual transmissions, indicates the transmission control module's adaptive learning for clutch \"A\" has reached its maximum programmed limit. The transmission continuously makes small software adjustments to compensate for normal clutch wear and keep shi",
    "words": 140,
    "have": [
      {
        "make": "Volkswagen",
        "model": "Atlas",
        "years": [
          2018,
          2019,
          2020
        ]
      }
    ]
  },
  {
    "code": "P34C4",
    "name": "Hybrid Battery Temperature Sensor Circuit",
    "system": "Electrical",
    "blurb": "P34C4 is a hybrid/electric powertrain code indicating a fault in a hybrid battery temperature sensor circuit. The high-voltage battery pack uses multiple temperature sensors so the hybrid control system can keep cells within safe limits and manage cooling. When the module reads an implausible, out-o",
    "words": 139,
    "have": [
      {
        "make": "Nissan",
        "model": "Pathfinder",
        "years": [
          2013,
          2014,
          2015
        ]
      }
    ]
  },
  {
    "code": "B1551",
    "name": "Radio/Tuner (HD Radio) Module Malfunction",
    "system": "Body",
    "blurb": "B1551 is a manufacturer-specific body code that, on several applications (e.g., Toyota/Lexus), indicates a malfunction in the radio/HD Radio tuner module, meaning the audio system detected a tuner hardware or communication fault. Symptoms are limited to the audio/infotainment system, such as loss of",
    "words": 139,
    "have": [
      {
        "make": "Ford",
        "model": "Bronco",
        "years": [
          2021,
          2022,
          2023
        ]
      }
    ]
  },
  {
    "code": "B2005",
    "name": "Invalid Data Record",
    "system": "Body / Control Module Configuration",
    "blurb": "A control module has found that the parameter or coding data set stored in its own memory is invalid or corrupt. The module cannot verify its configuration, so it limits or disables its functions until a valid data record is written back. On Audi 4.0T V8 models it is most often seen in the active en",
    "words": 139,
    "have": [
      {
        "make": "Audi",
        "model": "S8",
        "years": [
          2013,
          2014,
          2015
        ]
      }
    ]
  },
  {
    "code": "B2010",
    "name": "No Basic Setting",
    "system": "Body / Control Module Adaptation",
    "blurb": "The control module reports that its stored basic setting (adaptation/calibration) has been lost or was never performed. The module knows it is uncalibrated and disables the affected function until the basic-setting routine is run with a capable scan tool. On the Audi S8/A8 4.0 TFSI this is a J931 ac",
    "words": 139,
    "have": [
      {
        "make": "Audi",
        "model": "S8",
        "years": [
          2013,
          2014,
          2015
        ]
      }
    ]
  },
  {
    "code": "B210D",
    "name": "Manufacturer-Specific Body Code (low battery voltage / starter or relay condition)",
    "system": "Body",
    "blurb": "B210D is a manufacturer-specific body code whose meaning varies by automaker. On Dodge/Chrysler it is commonly reported as a low battery-voltage condition seen by a body module, while some other references list a starter or relay state. It generally indicates a power-supply or control-circuit issue ",
    "words": 137,
    "have": [
      {
        "make": "Jeep",
        "model": "Grand Wagoneer",
        "years": [
          2022,
          2023,
          2024
        ]
      }
    ]
  },
  {
    "code": "P07A3",
    "name": "Transmission Friction Element \"A\" Stuck On",
    "system": "Powertrain",
    "blurb": "This code sets when the transmission control module detects that friction element A (a clutch, band, or multi-disc pack) remains engaged/applied when it was commanded to release. A friction element that will not disengage can bind the transmission, cause harsh engagement, or contribute to a tie-up c",
    "words": 135,
    "have": [
      {
        "make": "Ford",
        "model": "Transit",
        "years": [
          2020,
          2021,
          2022
        ]
      }
    ]
  },
  {
    "code": "P144A",
    "name": "Evaporative Emission System Purge Vapor Line Restricted/Blocked",
    "system": "Emissions",
    "blurb": "Manufacturer-specific code used by Ford. During the EVAP monitor the powertrain control module closes the canister vent valve and watches how quickly vacuum builds in the fuel tank and vapor lines via the fuel tank pressure sensor. If vacuum rises faster than expected, the PCM concludes the purge va",
    "words": 135,
    "have": [
      {
        "make": "Ford",
        "model": "Fusion",
        "years": [
          2010,
          2011,
          2012
        ]
      }
    ]
  },
  {
    "code": "P0575",
    "name": "Cruise Control Input Circuit",
    "system": "Body",
    "blurb": "The PCM has detected a general electrical malfunction in the cruise control input circuit (the signal line carrying cruise switch inputs to the controller).",
    "words": 135,
    "have": [
      {
        "make": "Chrysler",
        "model": "200",
        "years": [
          2015,
          2016,
          2017
        ]
      }
    ]
  },
  {
    "code": "P219B",
    "name": "Bank 2 Air/Fuel Ratio Imbalance",
    "system": "Fuel & Air Metering",
    "blurb": "Generic SAE J2012 code. The PCM continuously compares fuel-trim behavior between cylinder banks. P219B sets when it detects that the air/fuel mixture on Bank 2 (the cylinder bank that does NOT contain cylinder #1 on a V-type engine) is imbalanced relative to Bank 1, meaning the module can no longer ",
    "words": 134,
    "have": [
      {
        "make": "Honda",
        "model": "Pilot",
        "years": [
          2016,
          2017,
          2018
        ]
      }
    ]
  },
  {
    "code": "01130",
    "name": "ABS Operation: Implausible Signal",
    "system": "Brakes",
    "blurb": "This is a VAG (Volkswagen/Audi/Seat/Skoda) fault code logged by the ABS/Brake Electronics Control Module (J104). It indicates the ABS control unit received an implausible or inconsistent operation signal and can no longer trust its data, so it disables ABS function. It typically shows as a steady AB",
    "words": 134,
    "have": [
      {
        "make": "Skoda",
        "model": "Octavia",
        "years": [
          2004,
          2005,
          2006
        ]
      }
    ]
  },
  {
    "code": "C1760",
    "name": "Air Suspension Rear Height Sensor Signal Circuit Failure",
    "system": "Chassis",
    "blurb": "C1760 is a manufacturer-specific chassis code indicating the suspension control module detected an invalid signal from the rear ride-height sensor on an air-suspension-equipped vehicle. The height sensor reports the vehicle's rear ride height so the system can level the vehicle and adjust the air sp",
    "words": 133,
    "have": [
      {
        "make": "Lexus",
        "model": "LS",
        "years": [
          2007,
          2008,
          2009
        ]
      }
    ]
  },
  {
    "code": "P1614",
    "name": "NATS Signal Error",
    "system": "Electrical",
    "blurb": "This is a Nissan/Infiniti-specific code meaning the immobilizer (NATS anti-theft) system could not properly read the signal from the key's transponder chip — essentially a chain-of-communication error between the key, immobilizer antenna, and engine computer. Because the system can't confirm an auth",
    "words": 133,
    "have": [
      {
        "make": "Nissan",
        "model": "350Z",
        "years": [
          2003,
          2004,
          2005
        ]
      }
    ]
  },
  {
    "code": "P1610",
    "name": "NATS (Nissan Anti-Theft System) Malfunction",
    "system": "Electrical",
    "blurb": "This is a Nissan-specific code related to the NATS (Nissan Anti-Theft System) immobilizer, the security system that requires a recognized key or transponder before the engine is allowed to start and run. The code sets when the engine control module and the immobilizer (BCM/IMMU) cannot properly comm",
    "words": 133,
    "have": [
      {
        "make": "Nissan",
        "model": "350Z",
        "years": [
          2003,
          2004,
          2005
        ]
      }
    ]
  },
  {
    "code": "P1C84",
    "name": "High Voltage Power Resource Circuit Short During Ready ON",
    "system": "Hybrid control system - high-voltage power supply",
    "blurb": "Toyota bulletin T-SB-0085-23 defines sub-code P1C8449 as 'High Voltage Power Resource Circuit Short during Ready ON.' The hybrid control ECU monitors the high-voltage power supply path between the traction battery and the inverter/converter assembly while the vehicle is in Ready. If it measures a sh",
    "words": 132,
    "have": [
      {
        "make": "Toyota",
        "model": "Crown",
        "years": [
          2023
        ]
      }
    ]
  },
  {
    "code": "P20B9",
    "name": "Reductant Heater \"A\" Control Circuit/Open",
    "system": "Powertrain",
    "blurb": "This code applies to diesel vehicles with Selective Catalytic Reduction (SCR) and means the engine computer detected an open circuit in the control for reductant (Diesel Exhaust Fluid / DEF) heater \"A\". This heater keeps the DEF and its lines from freezing or crystallizing in cold weather so the emi",
    "words": 131,
    "have": [
      {
        "make": "Chevrolet",
        "model": "Silverado 3500HD",
        "years": [
          2011,
          2012,
          2013
        ]
      }
    ]
  },
  {
    "code": "P2BAB",
    "name": "NOx Exceedence - Incorrect/Insufficient EGR Flow",
    "system": "Powertrain",
    "blurb": "This emissions-related code indicates the engine computer determined that nitrogen oxide (NOx) emissions exceeded the allowable limit due to incorrect or insufficient exhaust gas recirculation (EGR) flow, most often on diesel engines. The EGR system recirculates some exhaust back into the intake to ",
    "words": 131,
    "have": [
      {
        "make": "Chevrolet",
        "model": "Silverado 3500HD",
        "years": [
          2011,
          2012,
          2013
        ]
      }
    ]
  },
  {
    "code": "C1435",
    "name": "Yaw Rate Sensor Circuit Malfunction",
    "system": "Chassis",
    "blurb": "C1435 is a manufacturer-specific chassis code (commonly seen on Toyota/Lexus) indicating a fault in the yaw rate sensor circuit. The yaw rate sensor measures how quickly the vehicle is rotating about its vertical axis and is a core input for the electronic stability/vehicle stability control system.",
    "words": 130,
    "have": [
      {
        "make": "Lexus",
        "model": "GX",
        "years": [
          2010,
          2011,
          2012
        ]
      }
    ]
  },
  {
    "code": "P0793",
    "name": "Intermediate Shaft Speed Sensor \"A\" Circuit No Signal",
    "system": "Powertrain",
    "blurb": "This code sets when the transmission control module receives no signal from the intermediate shaft speed sensor (sensor A). This sensor measures the rotational speed of an intermediate shaft inside the automatic transmission/transaxle, and the module uses it to calculate gear ratios and command prop",
    "words": 130,
    "have": [
      {
        "make": "Mercedes-Benz",
        "model": "SLK-Class",
        "years": [
          2005,
          2006,
          2007
        ]
      }
    ]
  }
]
const CITATION = { type:'object', additionalProperties:false, properties:{ type:{type:'string',enum:['forum','nhtsa','tsb','recall','article','manufacturer','reddit']}, title:{type:'string'}, url:{type:'string'} }, required:['type','title','url'] }
const IP = { make:{type:'string'}, model:{type:'string'}, title:{type:'string'}, description:{type:'string'}, solution:{type:'string'}, category:{type:'string',enum:['engine','transmission','drivetrain','electrical','brakes','suspension','cooling','fuel','interior','exterior','body','safety','exhaust','steering','hvac','emissions','other']}, severity:{type:'string',enum:['high','medium','low']}, years:{type:'array',items:{type:'integer'}}, trims:{type:'array',items:{type:'string'}}, engines:{type:'array',items:{type:'string'}}, symptoms:{type:'array',items:{type:'string'}}, dtcCodes:{type:'array',items:{type:'string'}}, estimatedCostLow:{type:'number'}, estimatedCostHigh:{type:'number'}, citations:{type:'array',items:CITATION} }
const REQ = ['make','model','title','description','solution','category','severity','years','trims','engines','symptoms','dtcCodes','estimatedCostLow','estimatedCostHigh','citations']
const RS = { type:'object', additionalProperties:false, properties:{ issues:{type:'array',items:{type:'object',additionalProperties:false,properties:IP,required:REQ}} }, required:['issues'] }
const VS = { type:'object', additionalProperties:false, properties:{ confirmed:{type:'array',items:{type:'object',additionalProperties:false,properties:{...IP,confidence:{type:'number'}},required:[...REQ,'confidence']}} }, required:['confirmed'] }

function rp(t){ return `You are an OBD-II diagnostics and vehicle-reliability researcher.

Trouble code: ${t.code} — ${t.name} (system: ${t.system})
${t.blurb ? 'Reference: ' + t.blurb : ''}

We already document this code on:
${t.have.map(h=>'- '+h.make+' '+h.model+(h.years.length?' ('+h.years.join(', ')+')':'')).join(String.fromCharCode(10))}

Find 2-4 ADDITIONAL real, documented cases of ${t.code} on DIFFERENT vehicles (do not repeat the makes/models above). Each must be a specific, recognised failure pattern on a specific vehicle — not a generic restatement of what the code means. For each: the exact cause that sets ${t.code} on that vehicle, affected years/engines, what the driver notices, the accepted repair, a realistic cost range, and 2-4 REAL citations (NHTSA, manufacturer TSBs, owner forums, Reddit).

Rules:
- Use web search to confirm every case. NEVER invent a URL. If you cannot find real corroboration for a vehicle, drop it — returning two solid cases beats four thin ones.
- Set dtcCodes to EXACTLY ["${t.code}"].
- Title must name the failure, not the code, e.g. "Cylinder 1 Misfire from Failed Ignition Coil".
- description and solution should each be substantial prose; these pages are being rewritten because they were too thin.
- If this code genuinely has no documented pattern beyond the vehicles listed, return an empty issues array. That is an acceptable answer.`; }

function vp(t,issues){ return `Skeptical fact-checker for trouble code ${t.code} (${t.name}).

Proposed cases (JSON): ${JSON.stringify(issues)}

For each, verify with web search: is this a REAL documented cause of ${t.code} on that exact vehicle, correctly attributed, and do the citations actually support it? Reject anything you cannot corroborate, anything that merely paraphrases the generic code definition, and any case whose citations do not resolve to real pages about that vehicle. Judge on the evidence you can actually retrieve, not on how confident the proposal sounds. Return ONLY confirmed cases, each with confidence 0-1, dtcCodes kept exactly as ["${t.code}"].`; }

phase('Discover')
const per = await pipeline(TARGETS,
  (t)=>agent(rp(t),{label:'dtc:'+t.code,phase:'Discover',schema:RS,model:'opus'}).then(r=>({t,issues:(r&&Array.isArray(r.issues))?r.issues:[]})),
  (p)=>(!p||p.issues.length===0)?{t:p?p.t:null,confirmed:[]}:agent(vp(p.t,p.issues),{label:'verify:'+p.t.code,phase:'Verify',schema:VS,model:'opus'}).then(v=>({t:p.t,confirmed:(v&&Array.isArray(v.confirmed))?v.confirmed:[]})))

const confirmed=[]; let kept=0, dropped=0
for(const r of per){
  if(!r||!r.t)continue
  for(const iss of r.confirmed){
    // Gate on evidence, not on the self-reported number: a case with no
    // citation is unusable regardless of how confident the agent claims to be.
    const hasEvidence = Array.isArray(iss.citations) && iss.citations.length > 0
    const okConfidence = typeof iss.confidence!=='number' || iss.confidence>=0.7
    if(hasEvidence && okConfidence){ confirmed.push({...iss,_verdictConfidence:iss.confidence}); kept++ }
    else dropped++
  }
}
log('Confirmed '+kept+' new cases across '+TARGETS.length+' thin codes ('+dropped+' dropped for missing evidence)')
return { confirmed, visualEvidence:[], stats:{ codes:TARGETS.length, confirmed:kept, dropped } }
