export const meta = {
  name: 'dtc-thin-wave-5',
  description: 'Add real vehicle-specific cases to 12 DTC code pages currently held back by the 150-word content bar, so they re-index themselves',
  phases: [ { title: 'Discover' }, { title: 'Verify' } ],
}
const TARGETS = [
  {
    "code": "P1688",
    "name": "Manufacturer-Specific Powertrain Code (definition varies by maker)",
    "system": "Powertrain",
    "blurb": "P1688 is a manufacturer-specific powertrain code whose meaning depends on the vehicle make; for example, on some Mazda rotary applications it relates to the metering oil pump stepping motor circuit, while other manufacturers assign it differently. Because there is no single standardized definition, ",
    "words": 85,
    "have": [
      {
        "make": "Dodge",
        "model": "Ram 2500",
        "years": [
          1998,
          1999,
          2000
        ]
      }
    ]
  },
  {
    "code": "P0104",
    "name": "Mass or Volume Air Flow \"A\" Circuit Intermittent",
    "system": "Fuel & Air Metering",
    "blurb": "The PCM detects an intermittent or erratic MAF sensor 'A' signal — the reading cuts in and out or jumps irrationally rather than failing steadily. Often caused by a loose connection or marginal sensor.",
    "words": 83,
    "have": [
      {
        "make": "Mazda",
        "model": "CX-5",
        "years": [
          2013,
          2014,
          2015
        ]
      }
    ]
  },
  {
    "code": "C1404",
    "name": "Manufacturer-Specific Chassis Code (Toyota/Lexus: Rear Left Speed Sensor; Dodge/Chrysler: Transfer Case Position Sensor)",
    "system": "Chassis",
    "blurb": "C1404 is a manufacturer-specific chassis code whose meaning depends on the maker: on Toyota/Lexus it commonly indicates a rear left wheel speed sensor malfunction, while on Dodge/Chrysler it relates to the transfer case range position sensor circuit (signal low). In general a chassis control module ",
    "words": 80,
    "have": [
      {
        "make": "Citroen",
        "model": "C3",
        "years": [
          2002,
          2003,
          2004
        ]
      }
    ]
  },
  {
    "code": "01276",
    "name": "ABS Hydraulic Pump (V64)",
    "system": "Brakes",
    "blurb": "This is a VAG (VW/Audi/SEAT/Skoda) manufacturer-specific fault code, read via VCDS/Ross-Tech, indicating a fault with the ABS hydraulic pump motor (V64) inside the ABS/ESP control unit. It is typically logged as a signal-outside-tolerance, electrical, or implausible-signal fault, and usually trigger",
    "words": 80,
    "have": [
      {
        "make": "Volkswagen",
        "model": "New Beetle",
        "years": [
          2000,
          2001,
          2002
        ]
      }
    ]
  },
  {
    "code": "C1414",
    "name": "Left Front Wheel Speed Sensor Output Malfunction",
    "system": "Chassis",
    "blurb": "This chassis code indicates the ABS/traction control module detected an invalid or missing signal from the left front wheel speed sensor. That sensor reports how fast the front-left wheel is turning, which the system needs for anti-lock braking, traction control, and stability control. When the sign",
    "words": 80,
    "have": [
      {
        "make": "Citroen",
        "model": "C3",
        "years": [
          2002,
          2003,
          2004
        ]
      }
    ]
  },
  {
    "code": "P2285",
    "name": "Injector Control Pressure Sensor Circuit Low",
    "system": "Powertrain",
    "blurb": "This code means the engine computer detected a low-voltage (or out-of-range low) signal from the injector control pressure (ICP) sensor, used mainly on certain diesel engines with high-pressure oil-actuated fuel injection. This sensor monitors the pressure that operates the injectors. A faulty low s",
    "words": 79,
    "have": [
      {
        "make": "Ford",
        "model": "Excursion",
        "years": [
          2003,
          2004,
          2005
        ]
      }
    ]
  },
  {
    "code": "P1211",
    "name": "Injection Control Pressure / Fuel Injection System Fault (manufacturer-specific)",
    "system": "Powertrain",
    "blurb": "P1211 is a manufacturer-specific powertrain code related to fuel injection pressure control, and its exact meaning depends on the platform. On Ford diesel (Power Stroke) engines it indicates the Injection Control Pressure (ICP) is above or below the desired value and is not controllable, pointing to",
    "words": 79,
    "have": [
      {
        "make": "Ford",
        "model": "Excursion",
        "years": [
          2003,
          2004,
          2005
        ]
      }
    ]
  },
  {
    "code": "C1126",
    "name": "Manufacturer-Specific Chassis Control Code",
    "system": "Chassis",
    "blurb": "C1126 is a manufacturer-specific chassis trouble code whose meaning varies by maker (reported uses range from a cruise/command switch circuit to other chassis control circuits). In general it indicates that a chassis control module detected a fault in a circuit or input it monitors. Because there is",
    "words": 74,
    "have": [
      {
        "make": "Renault",
        "model": "Scenic",
        "years": [
          2003,
          2004,
          2005
        ]
      }
    ]
  },
  {
    "code": "P1065",
    "name": "Cylinder 1 Oil Supply Solenoid Valve / ECM Power or Fuel Pressure Fault (manufacturer-specific)",
    "system": "Powertrain",
    "blurb": "P1065 is a manufacturer-specific powertrain code with more than one meaning. On some Chrysler/Fiat-family engines it refers to the cylinder 1 oil-supply solenoid valve switching time being out of range (part of variable valve/oil control). On other makes (such as Nissan and some GM applications) it ",
    "words": 73,
    "have": [
      {
        "make": "Fiat",
        "model": "500",
        "years": [
          2012,
          2013,
          2014
        ]
      }
    ]
  },
  {
    "code": "P1067",
    "name": "Cylinder 2 Oil Supply Solenoid Valve Switching Time Out of Range (manufacturer-specific)",
    "system": "Powertrain",
    "blurb": "P1067 is a manufacturer-specific powertrain code most often associated with Chrysler/Fiat-family engines, where it indicates the cylinder 2 oil-supply (oil control) solenoid valve switch-on time is out of the expected range. This solenoid meters oil to the variable valve/lifter system for that cylin",
    "words": 73,
    "have": [
      {
        "make": "Fiat",
        "model": "500",
        "years": [
          2012,
          2013,
          2014
        ]
      }
    ]
  },
  {
    "code": "P106B",
    "name": "Manufacturer-Specific Powertrain Sensor/Solenoid Fault",
    "system": "Powertrain",
    "blurb": "P106B is a manufacturer-specific powertrain code whose meaning varies significantly by maker, so it should not be read as a single fixed fault. Reported definitions include a cylinder 4 oil-supply solenoid valve timing fault (Chrysler/Fiat group), a fuel pressure regulator performance issue (some Ho",
    "words": 73,
    "have": [
      {
        "make": "Fiat",
        "model": "500",
        "years": [
          2012,
          2013,
          2014
        ]
      }
    ]
  },
  {
    "code": "P1069",
    "name": "Cylinder 3 Oil Supply Solenoid Valve Switching Time Out of Range (manufacturer-specific)",
    "system": "Powertrain",
    "blurb": "P1069 is a manufacturer-specific powertrain code, most commonly seen on Chrysler/Fiat-family engines, indicating the cylinder 3 oil-supply (oil control) solenoid valve switch-on time is out of range. The solenoid controls oil delivery to that cylinder's variable valve/lifter hardware, so a fault may",
    "words": 73,
    "have": [
      {
        "make": "Fiat",
        "model": "500",
        "years": [
          2012,
          2013,
          2014
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
