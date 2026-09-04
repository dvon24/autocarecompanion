export const meta = {
  name: 'dtc-thin-wave-3',
  description: 'Add real vehicle-specific cases to 20 DTC code pages currently held back by the 150-word content bar, so they re-index themselves',
  phases: [ { title: 'Discover' }, { title: 'Verify' } ],
}
const TARGETS = [
  {
    "code": "B1602",
    "name": "PATS Received Invalid Format of Key-Code From Ignition Key Transponder",
    "system": "Body",
    "blurb": "This is a Ford-family body code from the Passive Anti-Theft System (PATS), the immobilizer that verifies your key before allowing the engine to start. The module read the transponder chip in the key but received a code in an invalid or unrecognized format, so it could not confirm the key is authoriz",
    "words": 123,
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
    "code": "P3056",
    "name": "Battery Current Sensor Circuit Malfunction (Toyota/Lexus hybrid)",
    "system": "Powertrain",
    "blurb": "P3056 is a manufacturer-specific code, and its dominant usage is on Toyota and Lexus hybrids, where it means Battery Current Sensor Circuit Malfunction. A current sensor mounted on the negative cable of the high-voltage hybrid battery pack measures the amperage flowing in and out of the pack, and th",
    "words": 123,
    "have": [
      {
        "make": "Buick",
        "model": "Regal",
        "years": [
          2016
        ]
      }
    ]
  },
  {
    "code": "P3055",
    "name": "DC/DC Converter Actuator Voltage 1 Performance (GM)",
    "system": "Powertrain",
    "blurb": "P3055 is a manufacturer-specific code defined primarily by General Motors (Chevrolet, Buick, GMC) on vehicles with the auto stop/start system, such as the 2016-2021 Malibu, 2018-2021 Equinox, Blazer, Encore, and 2019-2021 Silverado/Sierra. When the engine shuts off at a stop, a DC/DC converter (GM c",
    "words": 123,
    "have": [
      {
        "make": "Buick",
        "model": "Regal",
        "years": [
          2016
        ]
      }
    ]
  },
  {
    "code": "P0390",
    "name": "Camshaft Position Sensor \"B\" Circuit (Bank 2)",
    "system": "Powertrain",
    "blurb": "This code means the PCM detected a circuit problem with the 'B' camshaft position sensor on Bank 2 (the cylinder bank opposite Bank 1, typically on V-type engines). This sensor monitors camshaft position so the computer can time fuel delivery, ignition, and variable valve timing accurately. A fault ",
    "words": 123,
    "have": [
      {
        "make": "Infiniti",
        "model": "M37",
        "years": [
          2011,
          2012,
          2013
        ]
      }
    ]
  },
  {
    "code": "C1A23",
    "name": "Manufacturer-Specific Chassis Fault",
    "system": "Chassis",
    "blurb": "C1A23 is a manufacturer-specific chassis code (in the Nissan/Infiniti C1Axx family) whose exact definition is not well documented in public references. Codes in this range typically relate to driver-assistance/radar systems or ride-height/suspension sensing. In general it indicates the module detect",
    "words": 122,
    "have": [
      {
        "make": "Land Rover",
        "model": "Discovery",
        "years": [
          2017,
          2018,
          2019
        ]
      }
    ]
  },
  {
    "code": "P0880",
    "name": "TCM Power Input Signal",
    "system": "Powertrain",
    "blurb": "This code sets when the transmission control module (TCM) does not receive the correct power/voltage on its power input circuit. The TCM needs a stable supply to control shifting, so a power-feed problem can cause it to lose control of the transmission. Symptoms include erratic or failed shifting, t",
    "words": 122,
    "have": [
      {
        "make": "Chevrolet",
        "model": "Silverado 3500HD",
        "years": [
          2006,
          2007,
          2008
        ]
      }
    ]
  },
  {
    "code": "C1A54",
    "name": "Manufacturer-Specific EPS/Steering Control Circuit Fault",
    "system": "Chassis",
    "blurb": "C1A54 is an obscure manufacturer-specific chassis code, most commonly seen in the Electric Power Steering family of trouble codes. It generally indicates a circuit or signal fault within the steering control system that the power steering ECU detected as out of specification. Because the exact meani",
    "words": 118,
    "have": [
      {
        "make": "Land Rover",
        "model": "Range Rover Evoque",
        "years": [
          2012,
          2013,
          2014
        ]
      }
    ]
  },
  {
    "code": "C1731",
    "name": "Front Gate (Cut) Valve Solenoid Circuit",
    "system": "Chassis",
    "blurb": "C1731 is a manufacturer-specific chassis code (documented on Toyota) indicating a fault in the front gate/cut valve solenoid circuit within the ABS/stability control hydraulic actuator. This solenoid valve helps the system isolate and regulate brake-line pressure for anti-lock braking and stability ",
    "words": 117,
    "have": [
      {
        "make": "Lincoln",
        "model": "Navigator",
        "years": [
          2003,
          2004,
          2005
        ]
      }
    ]
  },
  {
    "code": "C0475",
    "name": "Electric Steering Motor Circuit",
    "system": "Chassis",
    "blurb": "This is a General Motors chassis code. The Power Steering Control Module (PSCM) monitors commanded versus actual current in the three-phase electric power steering (EPS) assist motor and sets C0475 when it sees a fault such as an open, a short, motor position outside the allowed tolerance, missing m",
    "words": 114,
    "have": [
      {
        "make": "Cadillac",
        "model": "XTS",
        "years": [
          2014,
          2015,
          2016
        ]
      }
    ]
  },
  {
    "code": "P3006",
    "name": "Battery State-Of-Charge Uneven (Hybrid Battery Imbalance)",
    "system": "Powertrain",
    "blurb": "This code, used on hybrid vehicles such as Toyota/Lexus, indicates the hybrid battery control system detected an unacceptably uneven state of charge between the cells or modules of the high-voltage battery pack. The system monitors the delta (difference) in charge across the pack to keep cells balan",
    "words": 114,
    "have": [
      {
        "make": "Lexus",
        "model": "CT",
        "years": [
          2011,
          2012,
          2013
        ]
      }
    ]
  },
  {
    "code": "C110B",
    "name": "Adaptive Cruise Control Sensor - Restricted View",
    "system": "Driver Assistance / Adaptive Cruise Control (Distance Regula",
    "blurb": "The distance regulation control module J428 has determined that one or both ACC radar sensors have gone an extended period without detecting any object, which the software interprets as the sensor's field of view being obstructed. ACC and the braking guard are deactivated as a protective measure. Au",
    "words": 114,
    "have": [
      {
        "make": "Audi",
        "model": "A8",
        "years": [
          2011,
          2012,
          2013
        ]
      }
    ]
  },
  {
    "code": "P0D58",
    "name": "Proximity Detection Circuit A Low",
    "system": "Electrical",
    "blurb": "A plug-in hybrid and EV charging code that sets when the voltage on the charge port proximity detection circuit falls below the expected threshold. The proximity circuit is how the vehicle knows a charging cable is physically latched into the port, so a fault here can leave the car unable to charge ",
    "words": 108,
    "have": [
      {
        "make": "Cadillac",
        "model": "ELR",
        "years": [
          2014,
          2015
        ]
      }
    ]
  },
  {
    "code": "P0D22",
    "name": "Battery Charger Output Current Performance",
    "system": "Electrical",
    "blurb": "A hybrid/EV code documented in GM service information (Chevrolet Volt and related plug-in models) and used on other plug-in platforms. The hybrid/EV powertrain control module monitors the on-board battery charger's high-voltage output and current and verifies they stay in range; the charger runs in ",
    "words": 108,
    "have": [
      {
        "make": "Cadillac",
        "model": "ELR",
        "years": [
          2014,
          2015
        ]
      }
    ]
  },
  {
    "code": "P1EDD",
    "name": "Battery Charger Converter Input Voltage Sensor 2 Circuit High Voltage",
    "system": "Electrical",
    "blurb": "General Motors manufacturer-specific code documented on the 2014-2015 Chevrolet Volt and Cadillac ELR. The onboard battery charger module reports its internal bulk voltage above roughly 464 volts DC on the second input voltage sensor circuit. The driver typically sees a 'Service High Voltage Chargin",
    "words": 108,
    "have": [
      {
        "make": "Cadillac",
        "model": "ELR",
        "years": [
          2014,
          2015
        ]
      }
    ]
  },
  {
    "code": "P0D26",
    "name": "Battery Charger Hybrid/EV System Precharge Time Too Long",
    "system": "Electrical",
    "blurb": "Applies to hybrids and plug-in/electric vehicles; frequently reported on GM plug-ins such as the Chevrolet Volt. Before the onboard charger connects to the high-voltage battery pack, it must raise its output voltage to match pack voltage - a step called precharge. The hybrid/EV powertrain control mo",
    "words": 108,
    "have": [
      {
        "make": "Cadillac",
        "model": "ELR",
        "years": [
          2014,
          2015
        ]
      }
    ]
  },
  {
    "code": "P0D59",
    "name": "Proximity Detection Circuit \"A\" High",
    "system": "Electrical",
    "blurb": "An EV/plug-in-hybrid charging code documented in Mitsubishi PHEV service information and widely reported on GM plug-ins (Chevrolet Volt). The \"proximity detection\" circuit is the SAE J1772 proximity pilot signal that tells the vehicle a charge cable is physically latched into the charge port; the ch",
    "words": 108,
    "have": [
      {
        "make": "Cadillac",
        "model": "ELR",
        "years": [
          2014,
          2015
        ]
      }
    ]
  },
  {
    "code": "P2723",
    "name": "Pressure Control Solenoid \"E\" Performance/Stuck Off",
    "system": "Powertrain",
    "blurb": "P2723 is a generic powertrain code set when the transmission control module detects that pressure control solenoid \"E\" is stuck off or not responding as commanded. In an automatic transmission, electronically controlled pressure solenoids regulate hydraulic fluid pressure to the clutches and bands t",
    "words": 106,
    "have": [
      {
        "make": "Buick",
        "model": "Enclave",
        "years": [
          2008,
          2009,
          2010
        ]
      }
    ]
  },
  {
    "code": "C108F",
    "name": "Manufacturer-Specific Chassis Control Code",
    "system": "Chassis",
    "blurb": "C108F is an obscure, manufacturer-specific chassis trouble code, and a single standardized definition is not established across makers. It generally indicates that a chassis control module (such as ABS, traction/stability, steering, or suspension) detected a fault in a circuit or component it monito",
    "words": 104,
    "have": [
      {
        "make": "CUPRA",
        "model": "Formentor",
        "years": [
          2020,
          2021,
          2022
        ]
      }
    ]
  },
  {
    "code": "C1080",
    "name": "Manufacturer-Specific Chassis/ABS Control Code",
    "system": "Chassis",
    "blurb": "C1080 is a manufacturer-specific chassis (ABS/stability or related control) trouble code whose precise meaning depends on the vehicle make. In general it points to a fault detected by a chassis control module in a circuit it monitors, such as an ABS, traction/stability, or related actuator or sensor",
    "words": 104,
    "have": [
      {
        "make": "CUPRA",
        "model": "Formentor",
        "years": [
          2020,
          2021,
          2022
        ]
      }
    ]
  },
  {
    "code": "P2452",
    "name": "Diesel Particulate Filter Pressure Sensor \"A\" Circuit",
    "system": "Powertrain",
    "blurb": "This code applies to diesel vehicles and indicates a general electrical fault in the diesel particulate filter (DPF) differential pressure sensor \"A\" circuit. This sensor measures the pressure drop across the DPF so the computer can estimate soot load and decide when to run a regeneration cycle. A c",
    "words": 103,
    "have": [
      {
        "make": "Suzuki",
        "model": "SX4",
        "years": [
          2007,
          2008,
          2009
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
