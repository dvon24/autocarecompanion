export const meta = {
  name: 'dtc-thin-wave-2',
  description: 'Add real vehicle-specific cases to 20 DTC code pages currently held back by the 150-word content bar, so they re-index themselves',
  phases: [ { title: 'Discover' }, { title: 'Verify' } ],
}
const TARGETS = [
  {
    "code": "U2105",
    "name": "CAN Bus — No Communication With ECM/ECU (Manufacturer-Specific)",
    "system": "Network",
    "blurb": "U2105 is a manufacturer-specific CAN bus code that generally means a module reported no communication with the engine control module (ECM/ECU) over the network. When the ECM cannot be reached, engine-related coordination breaks down, which can cause drivability problems, no-start conditions, or mult",
    "words": 130,
    "have": [
      {
        "make": "Saab",
        "model": "9-3",
        "years": [
          2003,
          2004,
          2005
        ]
      }
    ]
  },
  {
    "code": "C0269",
    "name": "Excessive Dump/Isolation Time",
    "system": "Chassis",
    "blurb": "This code, common on GM vehicles, sets when the ABS module commands the dump or isolation valves to release/hold brake pressure for too long (typically more than several seconds) on one or more wheels. The dump valve releases pressure to prevent wheel lockup and the isolation valve holds pressure on",
    "words": 130,
    "have": [
      {
        "make": "Chevrolet",
        "model": "Monte Carlo",
        "years": [
          2000,
          2001,
          2002
        ]
      }
    ]
  },
  {
    "code": "P065B",
    "name": "Generator Control Circuit Range/Performance",
    "system": "Electrical",
    "blurb": "Generic charging-system code. The engine control module commands the alternator (generator) through a control circuit and monitors the feedback; the values it sees do not match what it commanded. Charging output may be too high, too low, or erratic. Symptoms include a battery or charge warning light",
    "words": 129,
    "have": [
      {
        "make": "Jeep",
        "model": "Grand Cherokee",
        "years": [
          2011,
          2012,
          2013
        ]
      }
    ]
  },
  {
    "code": "P27EC",
    "name": "Transmission Range Control Valve 1 Position Switch Performance",
    "system": "Transmission",
    "blurb": "A General Motors code found on vehicles with ETRS (Electronic Transmission Range Select), GM's shift-by-wire system — commonly the 9T-family transmissions. It is also written as \"Range Mode Control Valve 1 Position Switch Performance\" in some references, so confirm the wording your scan tool returns",
    "words": 129,
    "have": [
      {
        "make": "Cadillac",
        "model": "Escalade ESV",
        "years": [
          2021,
          2022,
          2023
        ]
      }
    ]
  },
  {
    "code": "P1085",
    "name": "Fuel Control Mixture Lean, Bank 2 Sensor 1 (manufacturer-specific, common on BMW)",
    "system": "Powertrain",
    "blurb": "P1085 is a manufacturer-specific powertrain code, most commonly seen on BMW, indicating a lean fuel/air mixture on bank 2 of the engine as detected by the upstream oxygen sensor. The computer detected it was adding excessive fuel to correct for too much unmetered air, signaling a lean condition. It ",
    "words": 128,
    "have": [
      {
        "make": "BMW",
        "model": "M5",
        "years": [
          2000,
          2001,
          2002
        ]
      }
    ]
  },
  {
    "code": "C003B",
    "name": "Right Rear Wheel Speed Sensor Supply Circuit",
    "system": "Chassis",
    "blurb": "This chassis code relates to the supply/circuit feeding the right rear wheel speed sensor used by the ABS and stability systems. The control module detected a problem with the power supply or signal circuit to that sensor, meaning it may not be receiving valid wheel-speed data from the right rear co",
    "words": 128,
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
    "code": "P1167",
    "name": "Air/Fuel Ratio Sensor 1 Heater System Malfunction",
    "system": "Emissions",
    "blurb": "A manufacturer-specific code used by Honda and Acura for a fault in the heater circuit of the upstream wideband air/fuel ratio sensor (bank 1, sensor 1). That sensor has to reach operating temperature quickly for the PCM to control the fuel mixture accurately; when the PCM commands the heater on and",
    "words": 128,
    "have": [
      {
        "make": "Honda",
        "model": "Civic",
        "years": [
          1996,
          1997,
          1998
        ]
      }
    ]
  },
  {
    "code": "C0041",
    "name": "Right Front Wheel Speed Sensor Circuit Range/Performance",
    "system": "Chassis",
    "blurb": "This code indicates the ABS/electronic brake control module is not receiving a clean, reliable signal from the right front wheel speed sensor. The signal is present but out of the expected range or behaving erratically, so the module flags it as unreliable. ABS, traction control, and stability contr",
    "words": 128,
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
    "code": "C003A",
    "name": "Right Rear Wheel Speed Sensor Circuit",
    "system": "Chassis",
    "blurb": "C003A is a chassis/brake code indicating a fault in the right rear wheel speed sensor circuit. The ABS module uses this sensor to track right-rear wheel rotation for anti-lock braking, traction control, and stability control, and stores the code when it detects an open, short, or implausible signal.",
    "words": 128,
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
    "code": "P1083",
    "name": "Fuel Control Mixture Lean, Bank 1 Sensor 1 (manufacturer-specific, common on BMW)",
    "system": "Powertrain",
    "blurb": "P1083 is a manufacturer-specific powertrain code, most commonly seen on BMW, indicating a lean fuel/air mixture on bank 1 (the side with cylinder 1), as measured by the upstream oxygen sensor. The engine computer found it had to add fuel beyond its normal range to compensate for extra unmetered air,",
    "words": 128,
    "have": [
      {
        "make": "BMW",
        "model": "M5",
        "years": [
          2000,
          2001,
          2002
        ]
      }
    ]
  },
  {
    "code": "P0D00",
    "name": "Control Pilot Charging Ventilation Switch Circuit/Open",
    "system": "Powertrain",
    "blurb": "P0D00 is an electric/plug-in hybrid vehicle code in the high-voltage charging family. It relates to the 'control pilot' communication line of the SAE J1772 charging standard, specifically a charging-ventilation switch circuit that the charging system uses to confirm safe conditions before allowing p",
    "words": 128,
    "have": [
      {
        "make": "Chevrolet",
        "model": "Silverado EV",
        "years": [
          2024,
          2025
        ]
      }
    ]
  },
  {
    "code": "C0562",
    "name": "Manufacturer-Specific Chassis Code (definition reserved/varies)",
    "system": "Chassis",
    "blurb": "C0562 is a chassis-system code that is listed as ISO/SAE reserved in the generic code set, meaning it has no single standardized definition and its meaning is determined by the vehicle manufacturer. It generally falls within the ABS/traction/stability control family of chassis faults, often related ",
    "words": 127,
    "have": [
      {
        "make": "Chevrolet",
        "model": "Express",
        "years": [
          2008,
          2009,
          2010
        ]
      }
    ]
  },
  {
    "code": "B141B",
    "name": "Manufacturer-Specific Body Control Code",
    "system": "Body",
    "blurb": "B141B is a manufacturer-specific body (B-series) diagnostic trouble code with no standardized SAE definition; it appears in maker databases such as Jaguar/Land Rover and its meaning varies by vehicle. It generally indicates a body, comfort, convenience, or safety module detected a circuit or compone",
    "words": 127,
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
    "code": "B142A",
    "name": "Restraint System Ignition Voltage Supply Fault",
    "system": "Body",
    "blurb": "B142A is a manufacturer-specific body/restraint code that, on several applications (e.g., Nissan), indicates a problem with the ignition/voltage supply to the airbag diagnosis (SRS) sensor unit, meaning the supply voltage is out of the expected range. The restraint module needs stable voltage to fun",
    "words": 127,
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
    "code": "P2011",
    "name": "Intake Manifold Runner Control Circuit/Open (Bank 2)",
    "system": "Powertrain",
    "blurb": "This code indicates the engine computer detected an electrical problem (an open or out-of-range circuit) in the intake manifold runner control (IMRC) actuator for Bank 2, the cylinder bank that does not contain cylinder #1. The IMRC system adjusts intake airflow to optimize power and efficiency acro",
    "words": 127,
    "have": [
      {
        "make": "Subaru",
        "model": "WRX STI",
        "years": [
          2004,
          2005,
          2006
        ]
      }
    ]
  },
  {
    "code": "P17B7",
    "name": "High Clutch Solenoid Valve (Circuit/Performance)",
    "system": "Transmission",
    "blurb": "P17B7 is a manufacturer-specific transmission trouble code associated with a clutch-control solenoid valve. In Nissan CVT applications (e.g., RE0F11A) it is defined as the \"High Clutch Solenoid,\" and in GM/Cadillac units it falls within the P17B1-P17B9 group of transmission solenoid faults. The tran",
    "words": 127,
    "have": [
      {
        "make": "Porsche",
        "model": "Cayman",
        "years": [
          2009,
          2010,
          2011
        ]
      }
    ]
  },
  {
    "code": "P18B4",
    "name": "PDK Control Unit Internal Fault (Software Monitoring)",
    "system": "Transmission",
    "blurb": "Porsche-specific code for the PDK dual-clutch transmission. It sits in the P18A0-P18B5 block that Porsche documents as \"PDK control unit, internal error (software monitoring),\" meaning the control unit's own internal monitoring flagged a fault inside the unit rather than at an external sensor or act",
    "words": 127,
    "have": [
      {
        "make": "Porsche",
        "model": "Cayman",
        "years": [
          2009,
          2010,
          2011
        ]
      }
    ]
  },
  {
    "code": "U357B",
    "name": "Manufacturer-specific network code (definition unverified)",
    "system": "Network",
    "blurb": "This code appears in real manufacturer service material - it shows up in a General Motors technical service bulletin hosted by NHTSA alongside other U-series codes - but a verified definition could not be established from a reliable source. U-range codes generally indicate a network or module commun",
    "words": 126,
    "have": [
      {
        "make": "Cadillac",
        "model": "Lyriq",
        "years": [
          2023,
          2024
        ]
      }
    ]
  },
  {
    "code": "P040D",
    "name": "Exhaust Gas Recirculation Temperature Sensor \"A\" Circuit High",
    "system": "Powertrain",
    "blurb": "This code means the engine computer detected an abnormally high voltage on the circuit for EGR temperature sensor 'A'. This sensor measures the temperature of exhaust gases moving through the EGR system (often around the EGR cooler) to confirm the system is flowing and to protect components from ove",
    "words": 126,
    "have": [
      {
        "make": "Skoda",
        "model": "Octavia",
        "years": [
          2010,
          2011,
          2012
        ]
      }
    ]
  },
  {
    "code": "B1601",
    "name": "PATS Received Incorrect Key-Code From Transponder",
    "system": "Body",
    "blurb": "B1601 is a Ford/Lincoln/Mazda body code indicating the Passive Anti-Theft System (PATS) received an incorrect or unrecognized key-code from the ignition key transponder. The anti-theft module could not validate the key, so it may prevent the engine from starting (no-start) and the theft/security lig",
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
