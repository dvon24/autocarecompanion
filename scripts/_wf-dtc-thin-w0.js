export const meta = {
  name: 'dtc-thin-wave-0',
  description: 'Add real vehicle-specific cases to 20 DTC code pages currently held back by the 150-word content bar, so they re-index themselves',
  phases: [ { title: 'Discover' }, { title: 'Verify' } ],
}
const TARGETS = [
  {
    "code": "B2603",
    "name": "Body/Control Circuit Fault (manufacturer-specific)",
    "system": "Body",
    "blurb": "B2603 is a manufacturer-specific body code whose meaning differs by automaker. On many GM vehicles it is defined as the daytime running lamp (DRL) relay control circuit shorted to battery voltage, while on Nissan it relates to the shift-position status input monitored by the body/security control mo",
    "words": 149,
    "have": [
      {
        "make": "Nissan",
        "model": "Sentra",
        "years": [
          2023,
          2024,
          2025
        ]
      }
    ]
  },
  {
    "code": "P246B",
    "name": "Diesel Particulate Filter Active/Regeneration - Incorrect Conditions/Temperature Too Low - Bank 2",
    "system": "Powertrain",
    "blurb": "This code indicates the engine computer detected that conditions were not correct to perform a proper regeneration (burn-off) cycle of the diesel particulate filter (DPF) on bank 2, typically because exhaust temperatures were too low. The DPF traps soot from diesel exhaust and must periodically heat",
    "words": 149,
    "have": [
      {
        "make": "Volkswagen",
        "model": "Passat",
        "years": [
          2012,
          2013,
          2014
        ]
      }
    ]
  },
  {
    "code": "P1519",
    "name": "Intake Camshaft Control / Adjustment Bank 1 Malfunction",
    "system": "Engine",
    "blurb": "P1519 is a manufacturer-specific code most commonly found on VAG vehicles (Volkswagen/Audi), where it indicates a malfunction in the intake camshaft control (variable valve timing / camshaft adjustment) on Bank 1. The engine control module has detected that the intake camshaft cannot be adjusted to ",
    "words": 149,
    "have": [
      {
        "make": "Mercury",
        "model": "Cougar",
        "years": [
          1999,
          2000,
          2001
        ]
      }
    ]
  },
  {
    "code": "P061B",
    "name": "Internal Control Module Torque Calculation Performance",
    "system": "Engine",
    "blurb": "A generic OBD-II powertrain code. The powertrain control module continuously cross-checks its own calculated engine torque against the torque it commanded, and sets P061B when the two disagree by more than the allowed margin (on many applications roughly 50 Nm for longer than a second, typically at ",
    "words": 149,
    "have": [
      {
        "make": "Ford",
        "model": "Fiesta",
        "years": [
          2011,
          2012,
          2013
        ]
      }
    ]
  },
  {
    "code": "B1B0D",
    "name": "Manufacturer-Specific Body System Code",
    "system": "Body",
    "blurb": "B1B0D is a manufacturer-specific body code; the alphanumeric format marks it as an enhanced/manufacturer-defined code rather than a generic SAE code, so its meaning depends entirely on the vehicle maker. It generally points to a fault detected by a body-domain module (such as a body control, securit",
    "words": 149,
    "have": [
      {
        "make": "Jeep",
        "model": "Grand Cherokee",
        "years": [
          2022,
          2023,
          2024
        ]
      }
    ]
  },
  {
    "code": "P1506",
    "name": "Idle Air Control Overspeed Error",
    "system": "Powertrain",
    "blurb": "This manufacturer-specific code (common on Ford, Lincoln, Mazda, Mercury) means the engine computer detected that idle speed is higher than the target the Idle Air Control (IAC) system is commanding. The IAC valve meters air into the engine at idle to hold a steady RPM; when actual idle RPM runs too",
    "words": 149,
    "have": [
      {
        "make": "Ford",
        "model": "Ranger",
        "years": [
          2000,
          2001,
          2002
        ]
      }
    ]
  },
  {
    "code": "P1507",
    "name": "Idle Air Control Underspeed Error",
    "system": "Powertrain",
    "blurb": "This manufacturer-specific code (common on Ford, Lincoln, Mazda, Mercury) means the engine computer detected idle speed lower than the target the Idle Air Control (IAC) system is commanding. The IAC valve regulates air into the engine at idle to keep RPM steady; when the engine idles too low or stal",
    "words": 149,
    "have": [
      {
        "make": "Ford",
        "model": "Ranger",
        "years": [
          2000,
          2001,
          2002
        ]
      }
    ]
  },
  {
    "code": "P2014",
    "name": "Intake Manifold Runner Position Sensor/Switch Circuit (Bank 1)",
    "system": "Powertrain",
    "blurb": "This code means the engine computer detected an erratic or out-of-range signal from the intake manifold runner position sensor or switch on Bank 1. This sensor reports the actual position of the variable intake runner flaps so the computer can confirm they are moving as commanded. When the signal is",
    "words": 149,
    "have": [
      {
        "make": "Volkswagen",
        "model": "Beetle",
        "years": [
          2012,
          2013,
          2014
        ]
      }
    ]
  },
  {
    "code": "P2066",
    "name": "Fuel Level Sensor \"B\" Circuit Range/Performance",
    "system": "Fuel & Air Metering",
    "blurb": "Set when the Fuel Level Sensor 'B' signal is present but implausible or does not track expected fuel usage compared with the primary sender, indicating a performance problem rather than a hard open/short.",
    "words": 148,
    "have": [
      {
        "make": "Chevrolet",
        "model": "Tahoe",
        "years": [
          2007,
          2008,
          2009
        ]
      }
    ]
  },
  {
    "code": "P0322",
    "name": "Ignition/Distributor Engine Speed Input Circuit No Signal",
    "system": "Ignition",
    "blurb": "The ECM/PCM is receiving no signal at all from the ignition/distributor engine-speed input circuit. With no RPM reference, the controller cannot properly time spark and fuel, which typically causes a no-start or stall. Usually an open circuit or completely failed pickup.",
    "words": 148,
    "have": [
      {
        "make": "RAM",
        "model": "1500",
        "years": [
          1994,
          1995,
          1996
        ]
      }
    ]
  },
  {
    "code": "P2104",
    "name": "Throttle Actuator Control System - Forced Idle",
    "system": "Powertrain",
    "blurb": "This code means the engine computer detected a serious fault in the electronic throttle actuator control (TAC) system and has put the engine into a protective forced-idle (limp) mode. In this mode the throttle plate is held near the idle position regardless of how far you press the accelerator, so t",
    "words": 148,
    "have": [
      {
        "make": "Ford",
        "model": "Explorer",
        "years": [
          2006,
          2007,
          2008
        ]
      }
    ]
  },
  {
    "code": "P2067",
    "name": "Fuel Level Sensor \"B\" Circuit Low Input",
    "system": "Fuel & Air Metering",
    "blurb": "Set when the PCM detects the Fuel Level Sensor 'B' signal voltage is lower than expected, typically indicating a short to ground or a failed sender.",
    "words": 148,
    "have": [
      {
        "make": "Chevrolet",
        "model": "Tahoe",
        "years": [
          2007,
          2008,
          2009
        ]
      }
    ]
  },
  {
    "code": "P1490",
    "name": "Secondary Air Relief / Injection Solenoid Circuit Malfunction",
    "system": "Powertrain",
    "blurb": "This is a manufacturer-specific code whose exact meaning varies by maker; on Ford it commonly indicates a fault in the secondary air relief solenoid circuit (part of the system that injects air into the exhaust to reduce cold-start emissions), while some applications use it for an EVAP or vacuum sol",
    "words": 147,
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
    "code": "9062",
    "name": "Airbag Device Control - Wrong/Incorrect Coding",
    "system": "Safety",
    "blurb": "9062 is a Mercedes-Benz SRS (Supplemental Restraint System / airbag) control-unit fault code, titled \"Device control airbag, wrong code,\" and corresponds to OBD-II code B1062. It indicates the airbag control module's coding/configuration does not match the airbag device(s) actually installed in the ",
    "words": 147,
    "have": [
      {
        "make": "Mercedes-Benz",
        "model": "CLA",
        "years": [
          2014,
          2015,
          2016
        ]
      }
    ]
  },
  {
    "code": "C0038",
    "name": "Left Rear Wheel Speed Sensor Circuit",
    "system": "Chassis",
    "blurb": "C0038 is a chassis/brake code indicating a fault in the left rear wheel speed sensor circuit (often specifically the sensor's supply/voltage portion of the circuit). The ABS module needs this sensor's signal for anti-lock braking, traction control, and stability control, and sets the code when the c",
    "words": 146,
    "have": [
      {
        "make": "Volkswagen",
        "model": "Jetta",
        "years": [
          2000,
          2001
        ]
      }
    ]
  },
  {
    "code": "B1102",
    "name": "Airbag/Restraint System Battery Voltage Low",
    "system": "Body",
    "blurb": "B1102 is a manufacturer-specific body code that, on many Asian-make vehicles (e.g., Hyundai/Kia), indicates the airbag (SRS) control module detected battery/supply voltage below the required range to operate the restraint system correctly; on some GM applications it relates to an audio output circui",
    "words": 145,
    "have": [
      {
        "make": "Kia",
        "model": "Rio",
        "years": [
          2021,
          2022,
          2023
        ]
      }
    ]
  },
  {
    "code": "C1114",
    "name": "Manufacturer-Specific Chassis Control Code",
    "system": "Chassis",
    "blurb": "C1114 is a manufacturer-specific chassis trouble code, and its meaning differs between makers (for example, some applications associate it with a trailer brake control or other chassis control circuit). Broadly, it indicates that a chassis control module detected a fault in a circuit or component it",
    "words": 144,
    "have": [
      {
        "make": "GMC",
        "model": "Sierra 3500HD",
        "years": [
          2015,
          2016,
          2017
        ]
      }
    ]
  },
  {
    "code": "00816",
    "name": "Power Steering Sensor (G250): Faulty",
    "system": "Steering",
    "blurb": "This is a VAG (Volkswagen/Audi/Skoda/SEAT) manufacturer-specific fault code stored by the power steering control module, indicating a fault with the Power Steering Sensor (G250). The module has detected an electrical problem with the sensor signal (short to ground, open/short to positive, or a fault",
    "words": 143,
    "have": [
      {
        "make": "SEAT",
        "model": "Ibiza",
        "years": [
          2008,
          2009,
          2010
        ]
      }
    ]
  },
  {
    "code": "P0153",
    "name": "O2 Sensor Circuit Slow Response (Bank 2, Sensor 1)",
    "system": "Powertrain",
    "blurb": "This code indicates the upstream oxygen sensor on bank 2 is switching too slowly between rich and lean signals. The computer depends on a fast-responding sensor to continuously adjust the fuel mixture for that bank. When the sensor's response time is below the required threshold, this code is stored",
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
    "code": "P1238",
    "name": "Manufacturer-Specific Fuel/Injector System Fault",
    "system": "Powertrain",
    "blurb": "P1238 is a manufacturer-specific powertrain code whose definition varies by maker, so it should be confirmed against model-specific data. Reported meanings include a fuel pump circuit/relay fault (Ford), a mechanical injector failure on some Toyota diesels, and a cylinder 2 injector circuit (open) f",
    "words": 141,
    "have": [
      {
        "make": "Volvo",
        "model": "V70",
        "years": [
          2008,
          2009,
          2010
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
