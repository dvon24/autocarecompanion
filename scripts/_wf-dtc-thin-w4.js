export const meta = {
  name: 'dtc-thin-wave-4',
  description: 'Add real vehicle-specific cases to 20 DTC code pages currently held back by the 150-word content bar, so they re-index themselves',
  phases: [ { title: 'Discover' }, { title: 'Verify' } ],
}
const TARGETS = [
  {
    "code": "P0DAA",
    "name": "Battery Charging System Isolation Fault",
    "system": "Electrical",
    "blurb": "A hybrid/EV high-voltage code set when the battery management system loses electrical isolation between the high-voltage system and the vehicle chassis ground. GM documents it on the Chevrolet Volt (2011-2014), Cadillac ELR, Opel Ampera and Holden Volt, where it appears with a no-charge complaint an",
    "words": 100,
    "have": [
      {
        "make": "Cadillac",
        "model": "ELR",
        "years": [
          2014
        ]
      }
    ]
  },
  {
    "code": "U023C",
    "name": "Lost Communication With Image Processing Module \"C\"",
    "system": "Network",
    "blurb": "A generic (SAE U0xxx block) network/communication code: the module reporting U023C has stopped receiving expected messages from Image Processing Module C (IPM-C/IPA-C), one of the camera/vision processing controllers used by driver-assistance features. The definition is standardized, though which ph",
    "words": 99,
    "have": [
      {
        "make": "Cadillac",
        "model": "Escalade ESV",
        "years": [
          2021
        ]
      }
    ]
  },
  {
    "code": "B1A62",
    "name": "Rear Vision Camera",
    "system": "Body / Driver Assistance — Video Processing Module (VPM) and",
    "blurb": "A body code owned by the Video Processing Module (VPM) — and, for some symptom bytes, the CSM/Radio — covering faults in the rear vision camera feed. GM enumerates it entirely by symptom byte: B1A62-82 = Rear Vision Camera Alive/Sequence Counter Incorrect, B1A62-86 = Rear Vision Camera Signal Invali",
    "words": 99,
    "have": [
      {
        "make": "Cadillac",
        "model": "Escalade ESV",
        "years": [
          2021
        ]
      }
    ]
  },
  {
    "code": "P1631",
    "name": "Theft Deterrent Start Enable Signal Not Correct",
    "system": "Electrical",
    "blurb": "This is a manufacturer-specific (primarily GM) security code meaning the engine control module did not receive a correct 'start enable' signal or password from the vehicle's theft-deterrent / immobilizer system. The anti-theft system requires the ECM and the theft-deterrent module to exchange a matc",
    "words": 98,
    "have": [
      {
        "make": "Chevrolet",
        "model": "Impala",
        "years": [
          2000,
          2001,
          2002
        ]
      }
    ]
  },
  {
    "code": "C0590",
    "name": "Right Rear Shock Absorber Actuator Circuit",
    "system": "Chassis",
    "blurb": "This is a General Motors chassis code used on vehicles with electronically controlled (real-time / magnetic ride) damping, including Chevrolet, GMC and Cadillac models. The suspension control module pulse-width-modulates current to each shock absorber actuator and continuously measures actual curren",
    "words": 94,
    "have": [
      {
        "make": "Cadillac",
        "model": "CTS-V",
        "years": [
          2009,
          2010,
          2011
        ]
      }
    ]
  },
  {
    "code": "C0575",
    "name": "Left Front Shock Absorber Actuator Circuit",
    "system": "Chassis",
    "blurb": "A General Motors chassis code (Chevrolet, GMC, Cadillac and Buick applications with electronically controlled suspension - Autoride, MagneRide, or Real Time Damping). The suspension control module commands variable current to each shock absorber actuator using pulse-width modulation and continuously",
    "words": 94,
    "have": [
      {
        "make": "Cadillac",
        "model": "CTS-V",
        "years": [
          2009,
          2010,
          2011
        ]
      }
    ]
  },
  {
    "code": "C0585",
    "name": "Left Rear Shock Absorber Actuator Circuit",
    "system": "Chassis",
    "blurb": "A GM chassis code (Buick, Cadillac, Chevrolet, GMC) in the electronically controlled suspension — Autoride, Magnetic Ride Control, and similar systems. The suspension control module commands variable current to each shock absorber actuator in response to road, braking, and steering inputs, and compa",
    "words": 94,
    "have": [
      {
        "make": "Cadillac",
        "model": "CTS-V",
        "years": [
          2009,
          2010,
          2011
        ]
      }
    ]
  },
  {
    "code": "C0580",
    "name": "Brake Booster Motor A Phase U/V/W Circuit Low",
    "system": "Brakes",
    "blurb": "A chassis code for the electric brake booster (electro-hydraulic / regenerative brake assist) used on hybrids, EVs, and many late-model vehicles with brake-by-wire assist. The brake-assist control module drives the booster motor through a three-phase (U/V/W) inverter and sets C0580 when the voltage ",
    "words": 94,
    "have": [
      {
        "make": "Cadillac",
        "model": "CTS-V",
        "years": [
          2009,
          2010,
          2011
        ]
      }
    ]
  },
  {
    "code": "B1A48",
    "name": "Manufacturer-Specific Body/Security System Code",
    "system": "Body",
    "blurb": "B1A48 is a manufacturer-specific body code in the security-systems range and has no single standardized SAE definition. Codes in the B1Axx group are typically tied to immobilizer, key, or security-module functions and vary by automaker. A specific name and cause cannot be reliably given without make",
    "words": 91,
    "have": [
      {
        "make": "Chrysler",
        "model": "Voyager",
        "years": [
          2020,
          2021,
          2022
        ]
      }
    ]
  },
  {
    "code": "B1A49",
    "name": "Manufacturer-Specific Body/Security System Code",
    "system": "Body",
    "blurb": "B1A49 is a manufacturer-specific body code within the security-systems range, and its exact definition depends on the vehicle maker. The surrounding B1Axx codes generally involve immobilizer, key/transponder, or security-module faults. Because no standardized SAE meaning exists for this code, a prec",
    "words": 91,
    "have": [
      {
        "make": "Chrysler",
        "model": "Voyager",
        "years": [
          2020,
          2021,
          2022
        ]
      }
    ]
  },
  {
    "code": "C1A07",
    "name": "Stability Control Lateral Acceleration Sensor",
    "system": "Brakes",
    "blurb": "This is a manufacturer-specific chassis code indicating a fault related to the stability control system's lateral acceleration (G) sensor. This sensor measures sideways force on the vehicle during cornering, and the Electronic Stability Control system uses it together with the yaw and steering-angle",
    "words": 91,
    "have": [
      {
        "make": "MINI",
        "model": "Cooper",
        "years": [
          2014,
          2015,
          2016
        ]
      }
    ]
  },
  {
    "code": "P1240",
    "name": "Manufacturer-Specific Injector / Fuel System Circuit Fault",
    "system": "Powertrain",
    "blurb": "P1240 is a manufacturer-specific powertrain code, generally associated with a fuel injector or fuel-system circuit fault, though the exact assignment differs by manufacturer. On several platforms it indicates a problem in a specific cylinder's injector circuit (often referenced as cylinder 4) or a r",
    "words": 90,
    "have": [
      {
        "make": "SEAT",
        "model": "Ibiza",
        "years": [
          2009,
          2010,
          2011
        ]
      }
    ]
  },
  {
    "code": "P0495",
    "name": "Fan Speed High",
    "system": "Powertrain",
    "blurb": "This code indicates the engine computer (PCM) has detected that the cooling fan is running faster than commanded, or at high speed when it should not be. The PCM monitors the cooling fan's operation and compares actual fan speed or current draw against expected values. While it usually does not leav",
    "words": 89,
    "have": [
      {
        "make": "GMC",
        "model": "Envoy",
        "years": [
          2002,
          2003,
          2004
        ]
      }
    ]
  },
  {
    "code": "P2BAF",
    "name": "NOx Exceedance - Derating Imminent",
    "system": "Emissions",
    "blurb": "This is a serious diesel emissions code meaning the vehicle's nitrogen oxide (NOx) output has exceeded the legally allowed limit and the engine is about to reduce power (a 'derate') to force a repair. It is an EPA-mandated inducement code: when the SCR/DEF system fails to keep NOx in check, the comp",
    "words": 89,
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
    "code": "C1044",
    "name": "Manufacturer-Specific Chassis/ABS Code (commonly Right Rear Tone Wheel/Wheel-Speed Performance)",
    "system": "Chassis",
    "blurb": "C1044 is a manufacturer-specific chassis trouble code, so its exact meaning varies by maker. On many vehicles it relates to an ABS/stability-control wheel-speed input problem (for example, a right rear tone wheel or wheel-speed sensor signal that the control module judges to be abnormal or out of ra",
    "words": 88,
    "have": [
      {
        "make": "Volkswagen",
        "model": "Touareg",
        "years": [
          2004,
          2005,
          2006
        ]
      }
    ]
  },
  {
    "code": "P17D0",
    "name": "Transmission Fluid Over-Temperature",
    "system": "Transmission",
    "blurb": "This manufacturer-specific code indicates the transmission control system detected the transmission fluid temperature has exceeded its safe upper limit. The control module monitors fluid temperature with an internal sensor; overheated fluid loses its lubricating and pressure-holding properties and a",
    "words": 88,
    "have": [
      {
        "make": "Alfa Romeo",
        "model": "Stelvio",
        "years": [
          2018,
          2019,
          2020
        ]
      }
    ]
  },
  {
    "code": "P1004",
    "name": "Short Runner Valve (SRV) Control Performance (manufacturer-specific)",
    "system": "Powertrain",
    "blurb": "P1004 is a manufacturer-specific powertrain code, so its exact meaning depends on the maker. On Chrysler, Dodge, Jeep, and Ram vehicles it most commonly indicates a Short Runner Valve control performance problem, where the engine computer detected that the intake manifold's variable-runner (SRV) fla",
    "words": 86,
    "have": [
      {
        "make": "Chrysler",
        "model": "LHS",
        "years": [
          1999,
          2000,
          2001
        ]
      }
    ]
  },
  {
    "code": "P0765",
    "name": "Shift Solenoid 'D'",
    "system": "Transmission",
    "blurb": "Set when the PCM/TCM detects a general malfunction in shift solenoid 'D' circuit. A 'D' solenoid fault disrupts the gear shift it controls.",
    "words": 86,
    "have": [
      {
        "make": "Dodge",
        "model": "Charger",
        "years": [
          2006,
          2007,
          2008
        ]
      }
    ]
  },
  {
    "code": "P0192",
    "name": "Fuel Rail Pressure Sensor Circuit Low Input",
    "system": "Fuel System",
    "blurb": "This code means the fuel rail pressure sensor is reporting an abnormally low voltage to the computer, lower than the valid operating range. This sensor measures the pressure of fuel in the high-pressure rail feeding the injectors, which the computer uses to control fueling precisely. A low signal us",
    "words": 85,
    "have": [
      {
        "make": "MINI",
        "model": "Cooper S",
        "years": [
          2007,
          2008,
          2009
        ]
      }
    ]
  },
  {
    "code": "P1890",
    "name": "Transmission Adaptive Pressure Table Transfer",
    "system": "Transmission",
    "blurb": "P1890 is a manufacturer-specific transmission code; on the applicable platform its official definition is 'Transmission Adaptive Pressure Table Transfer,' meaning the control module had a problem storing, transferring, or applying its learned adaptive shift-pressure values. Modern transmissions cont",
    "words": 85,
    "have": [
      {
        "make": "MINI",
        "model": "Countryman",
        "years": [
          2011,
          2012,
          2013
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
