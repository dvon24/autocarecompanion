export const meta = {
  name: 'dtc-vehicle-gap-wave',
  description: 'Build known-issues FROM DTCs: research each top OBD-II code as it presents on a specific popular vehicle (fills 112 thin code x vehicle gaps across 24 models), auto-populating the /dtc/[code]/[make] money pages',
  phases: [ { title: 'Discover' }, { title: 'Verify' } ],
}
const TARGETS = [
  {
    "make": "Ford",
    "model": "F-150",
    "missing": [
      {
        "code": "P0700",
        "name": "Transmission Control System Malfunction"
      }
    ]
  },
  {
    "make": "Chevrolet",
    "model": "Silverado 1500",
    "missing": [
      {
        "code": "P0700",
        "name": "Transmission Control System Malfunction"
      }
    ]
  },
  {
    "make": "RAM",
    "model": "1500",
    "missing": [
      {
        "code": "P0011",
        "name": "Intake Camshaft Position Timing - Over-Advanced (Bank 1)"
      }
    ]
  },
  {
    "make": "Toyota",
    "model": "Camry",
    "missing": [
      {
        "code": "P0171",
        "name": "System Too Lean (Bank 1)"
      },
      {
        "code": "P0174",
        "name": "System Too Lean (Bank 2)"
      },
      {
        "code": "P0430",
        "name": "Catalyst System Efficiency Below Threshold (Bank 2)"
      },
      {
        "code": "P0016",
        "name": "Crankshaft/Camshaft Position Correlation - Bank 1 Sensor A"
      },
      {
        "code": "P0011",
        "name": "Intake Camshaft Position Timing - Over-Advanced (Bank 1)"
      }
    ]
  },
  {
    "make": "Toyota",
    "model": "Corolla",
    "missing": [
      {
        "code": "P0741",
        "name": "Torque Converter Clutch Circuit Performance/Stuck Off"
      }
    ]
  },
  {
    "make": "Toyota",
    "model": "RAV4",
    "missing": [
      {
        "code": "P0174",
        "name": "System Too Lean (Bank 2)"
      }
    ]
  },
  {
    "make": "Honda",
    "model": "CR-V",
    "missing": [
      {
        "code": "P0430",
        "name": "Catalyst System Efficiency Below Threshold (Bank 2)"
      },
      {
        "code": "P0442",
        "name": "Evaporative Emission Control System Leak Detected (Small Leak)"
      },
      {
        "code": "P0455",
        "name": "Evaporative Emission Control System Leak Detected (Gross Leak)"
      },
      {
        "code": "P0700",
        "name": "Transmission Control System Malfunction"
      },
      {
        "code": "P0741",
        "name": "Torque Converter Clutch Circuit Performance/Stuck Off"
      }
    ]
  },
  {
    "make": "Honda",
    "model": "Civic",
    "missing": [
      {
        "code": "P0430",
        "name": "Catalyst System Efficiency Below Threshold (Bank 2)"
      },
      {
        "code": "P0442",
        "name": "Evaporative Emission Control System Leak Detected (Small Leak)"
      },
      {
        "code": "P0455",
        "name": "Evaporative Emission Control System Leak Detected (Gross Leak)"
      },
      {
        "code": "P0741",
        "name": "Torque Converter Clutch Circuit Performance/Stuck Off"
      }
    ]
  },
  {
    "make": "Honda",
    "model": "Accord",
    "missing": [
      {
        "code": "P0442",
        "name": "Evaporative Emission Control System Leak Detected (Small Leak)"
      },
      {
        "code": "P0741",
        "name": "Torque Converter Clutch Circuit Performance/Stuck Off"
      },
      {
        "code": "P0016",
        "name": "Crankshaft/Camshaft Position Correlation - Bank 1 Sensor A"
      },
      {
        "code": "P0011",
        "name": "Intake Camshaft Position Timing - Over-Advanced (Bank 1)"
      }
    ]
  },
  {
    "make": "Nissan",
    "model": "Rogue",
    "missing": [
      {
        "code": "P0174",
        "name": "System Too Lean (Bank 2)"
      },
      {
        "code": "P0128",
        "name": "Coolant Thermostat Below Regulating Temperature"
      },
      {
        "code": "P0741",
        "name": "Torque Converter Clutch Circuit Performance/Stuck Off"
      },
      {
        "code": "P0301",
        "name": "Cylinder 1 Misfire Detected"
      },
      {
        "code": "P0302",
        "name": "Cylinder 2 Misfire Detected"
      },
      {
        "code": "P0303",
        "name": "Cylinder 3 Misfire Detected"
      }
    ]
  },
  {
    "make": "Nissan",
    "model": "Altima",
    "missing": [
      {
        "code": "P0171",
        "name": "System Too Lean (Bank 1)"
      },
      {
        "code": "P0174",
        "name": "System Too Lean (Bank 2)"
      },
      {
        "code": "P0128",
        "name": "Coolant Thermostat Below Regulating Temperature"
      },
      {
        "code": "P0741",
        "name": "Torque Converter Clutch Circuit Performance/Stuck Off"
      },
      {
        "code": "P0016",
        "name": "Crankshaft/Camshaft Position Correlation - Bank 1 Sensor A"
      }
    ]
  },
  {
    "make": "Ford",
    "model": "Escape",
    "missing": [
      {
        "code": "P0420",
        "name": "Catalyst System Efficiency Below Threshold (Bank 1)"
      },
      {
        "code": "P0430",
        "name": "Catalyst System Efficiency Below Threshold (Bank 2)"
      },
      {
        "code": "P0442",
        "name": "Evaporative Emission Control System Leak Detected (Small Leak)"
      },
      {
        "code": "P0455",
        "name": "Evaporative Emission Control System Leak Detected (Gross Leak)"
      },
      {
        "code": "P0741",
        "name": "Torque Converter Clutch Circuit Performance/Stuck Off"
      },
      {
        "code": "P0016",
        "name": "Crankshaft/Camshaft Position Correlation - Bank 1 Sensor A"
      },
      {
        "code": "P0011",
        "name": "Intake Camshaft Position Timing - Over-Advanced (Bank 1)"
      }
    ]
  },
  {
    "make": "Chevrolet",
    "model": "Equinox",
    "missing": [
      {
        "code": "P0430",
        "name": "Catalyst System Efficiency Below Threshold (Bank 2)"
      },
      {
        "code": "P0442",
        "name": "Evaporative Emission Control System Leak Detected (Small Leak)"
      },
      {
        "code": "P0700",
        "name": "Transmission Control System Malfunction"
      }
    ]
  },
  {
    "make": "Chevrolet",
    "model": "Malibu",
    "missing": [
      {
        "code": "P0174",
        "name": "System Too Lean (Bank 2)"
      },
      {
        "code": "P0420",
        "name": "Catalyst System Efficiency Below Threshold (Bank 1)"
      },
      {
        "code": "P0430",
        "name": "Catalyst System Efficiency Below Threshold (Bank 2)"
      },
      {
        "code": "P0128",
        "name": "Coolant Thermostat Below Regulating Temperature"
      },
      {
        "code": "P0442",
        "name": "Evaporative Emission Control System Leak Detected (Small Leak)"
      },
      {
        "code": "P0455",
        "name": "Evaporative Emission Control System Leak Detected (Gross Leak)"
      },
      {
        "code": "P0302",
        "name": "Cylinder 2 Misfire Detected"
      },
      {
        "code": "P0303",
        "name": "Cylinder 3 Misfire Detected"
      }
    ]
  },
  {
    "make": "Jeep",
    "model": "Wrangler",
    "missing": [
      {
        "code": "P0430",
        "name": "Catalyst System Efficiency Below Threshold (Bank 2)"
      },
      {
        "code": "P0442",
        "name": "Evaporative Emission Control System Leak Detected (Small Leak)"
      },
      {
        "code": "P0011",
        "name": "Intake Camshaft Position Timing - Over-Advanced (Bank 1)"
      }
    ]
  },
  {
    "make": "Jeep",
    "model": "Grand Cherokee",
    "missing": [
      {
        "code": "P0171",
        "name": "System Too Lean (Bank 1)"
      },
      {
        "code": "P0174",
        "name": "System Too Lean (Bank 2)"
      },
      {
        "code": "P0442",
        "name": "Evaporative Emission Control System Leak Detected (Small Leak)"
      }
    ]
  },
  {
    "make": "Toyota",
    "model": "Tacoma",
    "missing": [
      {
        "code": "P0430",
        "name": "Catalyst System Efficiency Below Threshold (Bank 2)"
      },
      {
        "code": "P0128",
        "name": "Coolant Thermostat Below Regulating Temperature"
      },
      {
        "code": "P0016",
        "name": "Crankshaft/Camshaft Position Correlation - Bank 1 Sensor A"
      },
      {
        "code": "P0011",
        "name": "Intake Camshaft Position Timing - Over-Advanced (Bank 1)"
      },
      {
        "code": "P0302",
        "name": "Cylinder 2 Misfire Detected"
      },
      {
        "code": "P0303",
        "name": "Cylinder 3 Misfire Detected"
      }
    ]
  },
  {
    "make": "Ford",
    "model": "Mustang",
    "missing": [
      {
        "code": "P0420",
        "name": "Catalyst System Efficiency Below Threshold (Bank 1)"
      },
      {
        "code": "P0430",
        "name": "Catalyst System Efficiency Below Threshold (Bank 2)"
      },
      {
        "code": "P0442",
        "name": "Evaporative Emission Control System Leak Detected (Small Leak)"
      },
      {
        "code": "P0016",
        "name": "Crankshaft/Camshaft Position Correlation - Bank 1 Sensor A"
      }
    ]
  },
  {
    "make": "Hyundai",
    "model": "Sonata",
    "missing": [
      {
        "code": "P0171",
        "name": "System Too Lean (Bank 1)"
      },
      {
        "code": "P0174",
        "name": "System Too Lean (Bank 2)"
      },
      {
        "code": "P0420",
        "name": "Catalyst System Efficiency Below Threshold (Bank 1)"
      },
      {
        "code": "P0430",
        "name": "Catalyst System Efficiency Below Threshold (Bank 2)"
      },
      {
        "code": "P0128",
        "name": "Coolant Thermostat Below Regulating Temperature"
      },
      {
        "code": "P0442",
        "name": "Evaporative Emission Control System Leak Detected (Small Leak)"
      },
      {
        "code": "P0455",
        "name": "Evaporative Emission Control System Leak Detected (Gross Leak)"
      },
      {
        "code": "P0016",
        "name": "Crankshaft/Camshaft Position Correlation - Bank 1 Sensor A"
      },
      {
        "code": "P0011",
        "name": "Intake Camshaft Position Timing - Over-Advanced (Bank 1)"
      }
    ]
  },
  {
    "make": "Hyundai",
    "model": "Elantra",
    "missing": [
      {
        "code": "P0171",
        "name": "System Too Lean (Bank 1)"
      },
      {
        "code": "P0174",
        "name": "System Too Lean (Bank 2)"
      },
      {
        "code": "P0420",
        "name": "Catalyst System Efficiency Below Threshold (Bank 1)"
      },
      {
        "code": "P0430",
        "name": "Catalyst System Efficiency Below Threshold (Bank 2)"
      },
      {
        "code": "P0128",
        "name": "Coolant Thermostat Below Regulating Temperature"
      },
      {
        "code": "P0016",
        "name": "Crankshaft/Camshaft Position Correlation - Bank 1 Sensor A"
      },
      {
        "code": "P0011",
        "name": "Intake Camshaft Position Timing - Over-Advanced (Bank 1)"
      }
    ]
  },
  {
    "make": "Kia",
    "model": "Sorento",
    "missing": [
      {
        "code": "P0300",
        "name": "Random/Multiple Cylinder Misfire Detected"
      },
      {
        "code": "P0430",
        "name": "Catalyst System Efficiency Below Threshold (Bank 2)"
      },
      {
        "code": "P0442",
        "name": "Evaporative Emission Control System Leak Detected (Small Leak)"
      },
      {
        "code": "P0455",
        "name": "Evaporative Emission Control System Leak Detected (Gross Leak)"
      },
      {
        "code": "P0016",
        "name": "Crankshaft/Camshaft Position Correlation - Bank 1 Sensor A"
      },
      {
        "code": "P0011",
        "name": "Intake Camshaft Position Timing - Over-Advanced (Bank 1)"
      },
      {
        "code": "P0301",
        "name": "Cylinder 1 Misfire Detected"
      },
      {
        "code": "P0302",
        "name": "Cylinder 2 Misfire Detected"
      },
      {
        "code": "P0303",
        "name": "Cylinder 3 Misfire Detected"
      }
    ]
  },
  {
    "make": "Subaru",
    "model": "Outback",
    "missing": [
      {
        "code": "P0430",
        "name": "Catalyst System Efficiency Below Threshold (Bank 2)"
      },
      {
        "code": "P0442",
        "name": "Evaporative Emission Control System Leak Detected (Small Leak)"
      },
      {
        "code": "P0455",
        "name": "Evaporative Emission Control System Leak Detected (Gross Leak)"
      },
      {
        "code": "P0741",
        "name": "Torque Converter Clutch Circuit Performance/Stuck Off"
      },
      {
        "code": "P0016",
        "name": "Crankshaft/Camshaft Position Correlation - Bank 1 Sensor A"
      },
      {
        "code": "P0011",
        "name": "Intake Camshaft Position Timing - Over-Advanced (Bank 1)"
      }
    ]
  },
  {
    "make": "Nissan",
    "model": "Sentra",
    "missing": [
      {
        "code": "P0171",
        "name": "System Too Lean (Bank 1)"
      },
      {
        "code": "P0174",
        "name": "System Too Lean (Bank 2)"
      },
      {
        "code": "P0430",
        "name": "Catalyst System Efficiency Below Threshold (Bank 2)"
      },
      {
        "code": "P0128",
        "name": "Coolant Thermostat Below Regulating Temperature"
      },
      {
        "code": "P0741",
        "name": "Torque Converter Clutch Circuit Performance/Stuck Off"
      }
    ]
  },
  {
    "make": "GMC",
    "model": "Sierra 1500",
    "missing": [
      {
        "code": "P0420",
        "name": "Catalyst System Efficiency Below Threshold (Bank 1)"
      },
      {
        "code": "P0430",
        "name": "Catalyst System Efficiency Below Threshold (Bank 2)"
      },
      {
        "code": "P0128",
        "name": "Coolant Thermostat Below Regulating Temperature"
      },
      {
        "code": "P0442",
        "name": "Evaporative Emission Control System Leak Detected (Small Leak)"
      },
      {
        "code": "P0455",
        "name": "Evaporative Emission Control System Leak Detected (Gross Leak)"
      },
      {
        "code": "P0700",
        "name": "Transmission Control System Malfunction"
      },
      {
        "code": "P0016",
        "name": "Crankshaft/Camshaft Position Correlation - Bank 1 Sensor A"
      },
      {
        "code": "P0011",
        "name": "Intake Camshaft Position Timing - Over-Advanced (Bank 1)"
      }
    ]
  }
]
const CITATION = { type:'object', additionalProperties:false, properties:{ type:{type:'string',enum:['forum','nhtsa','tsb','recall','article','manufacturer','reddit']}, title:{type:'string'}, url:{type:'string'} }, required:['type','title','url'] }
const IP = { title:{type:'string'}, description:{type:'string'}, solution:{type:'string'}, category:{type:'string',enum:['engine','transmission','drivetrain','electrical','brakes','suspension','cooling','fuel','interior','exterior','body','safety','exhaust','steering','hvac','emissions','other']}, severity:{type:'string',enum:['high','medium','low']}, years:{type:'array',items:{type:'integer'}}, trims:{type:'array',items:{type:'string'}}, engines:{type:'array',items:{type:'string'}}, symptoms:{type:'array',items:{type:'string'}}, dtcCodes:{type:'array',items:{type:'string'}}, estimatedCostLow:{type:'number'}, estimatedCostHigh:{type:'number'}, citations:{type:'array',items:CITATION} }
const REQ = ['title','description','solution','category','severity','years','trims','engines','symptoms','dtcCodes','estimatedCostLow','estimatedCostHigh','citations']
const RS = { type:'object', additionalProperties:false, properties:{ issues:{type:'array',items:{type:'object',additionalProperties:false,properties:IP,required:REQ}} }, required:['issues'] }
const VS = { type:'object', additionalProperties:false, properties:{ confirmed:{type:'array',items:{type:'object',additionalProperties:false,properties:{...IP,confidence:{type:'number'}},required:[...REQ,'confidence']}} }, required:['confirmed'] }
function rp(t){ return `You are an OBD-II diagnostics + reliability researcher. For the ${t.make} ${t.model}, research ONE distinct, real known issue for EACH trouble code below, AS IT SPECIFICALLY PRESENTS ON THIS VEHICLE (common engine/generation):
${t.missing.map(m=>'- '+m.code+' ('+m.name+')').join(String.fromCharCode(10))}

For each code: the specific cause that triggers THIS code on THIS vehicle, affected years/engines, symptoms the driver notices, the accepted fix, a realistic repair cost range, and 2-4 REAL citations (NHTSA, TSBs, owner forums/Reddit — never invent URLs). Use web search to confirm. Set dtcCodes to EXACTLY that one code. Title should name the failure (not just the code), e.g. "P0301 — Cylinder 1 Misfire from Failed Ignition Coil". Return one issue per code; skip a code only if there's genuinely no real ${t.make} ${t.model}-specific pattern for it.`; }
function vp(t,issues){ return `Skeptical fact-checker. For the ${t.make} ${t.model}, verify each proposed code-specific issue with web search: is it a REAL documented cause of that exact code on THIS vehicle, correctly attributed, with citations that support it? Proposed (JSON): ${JSON.stringify(issues)}. Return ONLY confirmed issues, each with confidence 0-1; keep dtcCodes exact. Drop fabricated/mis-attributed ones.`; }
phase('Discover')
const per = await pipeline(TARGETS,
  (t)=>agent(rp(t),{label:'dtc:'+t.make+' '+t.model,phase:'Discover',schema:RS}).then(r=>({t,issues:(r&&Array.isArray(r.issues))?r.issues:[]})),
  (p)=>(!p||p.issues.length===0)?{t:p?p.t:null,confirmed:[]}:agent(vp(p.t,p.issues),{label:'verify:'+p.t.make+' '+p.t.model,phase:'Verify',schema:VS}).then(v=>({t:p.t,confirmed:(v&&Array.isArray(v.confirmed))?v.confirmed:[]})))
const confirmed=[]; let kept=0
for(const r of per){ if(!r||!r.t)continue; for(const iss of r.confirmed){ if(typeof iss.confidence==='number'&&iss.confidence>=0.7){ confirmed.push({make:r.t.make,model:r.t.model,...iss,_verdictConfidence:iss.confidence}); kept++ } } }
log('Confirmed '+kept+' code-specific issues across '+TARGETS.length+' vehicles')
return { confirmed, visualEvidence:[], stats:{ vehicles:TARGETS.length, gaps:112, confirmed:kept } }
