#!/usr/bin/env node
/**
 * Generate procedure hints for ALL vehicles across 9 maintenance types.
 *
 * Reads existing curated specs from vehicle-specs.json and produces
 * vehicle-specific stepHints, specialTools, and commonMistakes.
 *
 * RULES:
 *  - Never overwrites entries where verified === true
 *  - All generated entries are marked verified: false
 *  - Skips inapplicable types (e.g. spark_plugs for diesel/EV)
 */

const fs = require('fs');
const path = require('path');

const specsPath = path.join(__dirname, '../src/data/vehicle-specs.json');
const specs = JSON.parse(fs.readFileSync(specsPath, 'utf8'));

// ────────────────────────────────────────────────────────────────────────
// Detection helpers
// ────────────────────────────────────────────────────────────────────────

const GERMAN_MAKES = ['BMW', 'Audi', 'Mercedes-Benz', 'Volkswagen', 'Volvo', 'MINI'];
const MOPAR_MAKES = ['Dodge', 'Chrysler', 'Jeep', 'RAM'];
const GM_MAKES = ['Chevrolet', 'GMC', 'Cadillac'];
const FORD_MAKES = ['Ford'];

function isGerman(make) { return GERMAN_MAKES.includes(make); }
function isMopar(make) { return MOPAR_MAKES.includes(make); }
function isGM(make) { return GM_MAKES.includes(make); }
function isFord(make) { return FORD_MAKES.includes(make); }

function eng(genData) { return (genData.engine || '').toLowerCase(); }

function isDiesel(genData) { return /diesel|cummins|power\s*stroke|duramax/i.test(genData.engine || ''); }
function isEV(genData) { return genData.ev === true || /fully electric|bev|electric motor only/i.test(genData.engine || ''); }
function isHybrid(genData) {
  const e = genData.engine || '';
  const s = (genData.safety || []).join(' ');
  return /hybrid|atkinson.*electric|e-cvt|phev/i.test(e) || /HYBRID/i.test(s);
}
function isTurbo(genData) { return /turbo|supercharged|twin.?scroll/i.test(genData.engine || ''); }
function isDrySump(genData) { return /dry.?sump/i.test(genData.engine || '') || /dry.?sump/i.test((genData.oil || {}).type || ''); }

function getLayout(genData) {
  const e = eng(genData);
  if (/boxer|flat[- ]?\d/i.test(e)) return 'boxer';
  if (/v8|v-8/i.test(e)) return 'V8';
  if (/v6|v-6/i.test(e)) return 'V6';
  if (/v10|v-10/i.test(e)) return 'V10';
  if (/i[- ]?6|inline[- ]?6|straight[- ]?6/i.test(e)) return 'I6';
  if (/i[- ]?4|4[- ]?cyl|inline[- ]?4|2\.\d|1\.\d/i.test(e)) return 'I4';
  return 'unknown';
}

function isCartridgeFilter(oil) {
  if (!oil) return false;
  const loc = (oil.filterLocation || '').toLowerCase();
  const pn = (oil.filterPartNumber || '').toLowerCase();
  return /cartridge/i.test(loc) || /cartridge/i.test(pn) || /housing/i.test(loc);
}

function isTopAccessFilter(oil) {
  if (!oil) return false;
  return /top|above|accessible from above|from the top/i.test(oil.filterLocation || '');
}

function hasSkidPlateOrBellyPan(genData) {
  return (genData.safety || []).some(s => /skid plate|belly pan|undertray|under.?tray|splash.?shield/i.test(s));
}

function getLugInfo(genData) {
  if (genData.lugBolts) return { type: 'bolts', size: genData.lugBolts.size, torque: genData.lugBolts.torque };
  if (genData.lugNuts) return { type: 'nuts', size: genData.lugNuts.size, torque: genData.lugNuts.torque };
  return null;
}

function parseCapacity(capStr) {
  if (!capStr) return 0;
  const m = capStr.match(/([\d.]+)\s*q/i);
  return m ? parseFloat(m[1]) : 0;
}

function isPerformanceCar(model, genKey) {
  return /corvette|camaro|mustang|challenger|charger|gt350|gt500|zl1|z06|hellcat|scat pack|392|viper|m[2-8]|amg|rs\s?\d|type.?r|sti|wrx|nismo|trd pro|raptor|gt-r/i.test(model + ' ' + genKey);
}

function inferDrivetrain(make, model, genData) {
  const e = (genData.engine || '').toLowerCase();
  const m = model.toLowerCase();
  const hasFrontDiff = genData.differentials && genData.differentials.front;
  const hasTransferCase = !!genData.transferCase;

  // Explicit AWD/4WD indicators
  if (hasTransferCase || hasFrontDiff) return '4WD/AWD';

  // Known AWD makes
  if (/subaru/i.test(make) && !/brz|86/i.test(model)) return 'AWD';
  if (/audi/i.test(make)) return 'AWD'; // quattro is standard on most
  if (/volvo/i.test(make)) return 'FWD'; // base; AWD optional

  // Known RWD models
  if (/mustang|camaro|corvette|challenger|charger|86|brz|supra|miata|mx-5|370z|350z|gt-r/i.test(m)) return 'RWD';
  if (/bmw|mercedes/i.test(make) && !/x\d|gl[a-z]|eq/i.test(m)) return 'RWD';

  // Trucks - RWD base, 4WD optional
  if (/f-150|f-250|f-350|silverado|sierra|ram|tacoma|frontier|titan|tundra|colorado|canyon|ranger|ridgeline/i.test(m)) return 'RWD/4WD';

  // SUVs often AWD
  if (/4runner|wrangler|grand cherokee|tahoe|suburban|expedition|sequoia|gx|lx/i.test(m)) return '4WD';
  if (/rav4|cr-v|cx-5|tucson|sportage|tiguan|escape|rogue|forester|outback|crosstrek/i.test(m)) return 'FWD/AWD';

  // Default sedans
  return 'FWD';
}

// ────────────────────────────────────────────────────────────────────────
// Template generators
// ────────────────────────────────────────────────────────────────────────

function generateOilChange(genData, make, model, genKey) {
  const oil = genData.oil;
  if (!oil || isEV(genData)) return null;

  const cartridge = isCartridgeFilter(oil);
  const topFilter = isTopAccessFilter(oil);
  const bellyPan = hasSkidPlateOrBellyPan(genData);
  const boxer = getLayout(genData) === 'boxer';
  const drySump = isDrySump(genData);
  const capQt = parseCapacity(oil.capacity);
  const highCap = capQt >= 8;

  const stepHints = [];

  // Access
  if (bellyPan) {
    stepHints.push('Remove skid plate or belly pan/undertray to access oil drain plug and filter from underneath');
  }
  if (!topFilter) {
    stepHints.push('Raise vehicle securely on ramps or jack stands before going underneath');
  }

  // Drain
  stepHints.push(`Locate drain plug on oil pan - use ${oil.drainPlugSize || '14mm'} socket to remove. Have drain pan positioned for ${oil.capacity || 'full capacity'}`);
  stepHints.push(`Install drain plug with new crush washer, torque to ${oil.drainPlugTorque || '25 ft-lbs'} - do not overtighten`);

  // Filter
  if (cartridge) {
    const wrenchNote = /bmw/i.test(make) ? ' (36mm cap wrench for BMW)' :
                       /mercedes/i.test(make) ? ' (use Mercedes-specific cap wrench)' :
                       /volvo/i.test(make) ? ' (use Volvo-specific cap wrench)' :
                       isGerman(make) ? ' (use appropriate cap wrench)' : '';
    stepHints.push(`Remove cartridge filter from housing${topFilter ? ' (accessible from top of engine)' : ''}${wrenchNote} - replace with ${oil.filterPartNumber || 'new OE cartridge'}, ensure new O-ring is properly seated on housing`);
  } else if (boxer) {
    stepHints.push(`Oil filter is horizontally mounted on the engine - place rag underneath to catch drips. Install new ${oil.filterPartNumber || 'filter'}, hand-tighten 3/4 turn past gasket contact`);
  } else {
    const locNote = oil.filterLocation ? ` (${oil.filterLocation})` : '';
    stepHints.push(`Remove old spin-on oil filter${locNote} - apply thin film of new oil to gasket of new ${oil.filterPartNumber || 'filter'}, hand-tighten 3/4 turn past gasket contact`);
  }

  // Refill
  if (highCap) {
    const pourFirst = Math.floor(capQt * 0.85);
    stepHints.push(`Pour ${pourFirst} quarts of ${oil.type || 'specified oil'} first, then check dipstick and add remaining - total capacity is ${oil.capacity}`);
  } else {
    stepHints.push(`Refill with ${oil.capacity || 'specified amount'} of ${oil.type || 'recommended oil'}`);
  }

  // Final check
  if (drySump) {
    stepHints.push('Dry sump system: start engine, idle 3 minutes to circulate oil through remote reservoir. Shut off, wait 5 minutes, recheck level');
  } else {
    stepHints.push('Start engine and let idle 2 minutes. Shut off, wait 5 minutes, recheck dipstick level and top off if needed');
  }

  // Reinstall panels
  if (bellyPan) {
    stepHints.push('Reinstall skid plate/belly pan and all fasteners before lowering vehicle');
  }

  // Special tools
  const specialTools = [`${oil.drainPlugSize || '14mm'} socket (drain plug)`];
  if (cartridge) {
    if (/bmw/i.test(make)) specialTools.push('36mm oil filter housing cap wrench');
    else if (/mini/i.test(make)) specialTools.push('36mm oil filter housing cap wrench (same as BMW)');
    else if (/mercedes/i.test(make)) specialTools.push('Oil filter housing cap wrench (Mercedes-specific)');
    else if (/audi|volkswagen/i.test(make)) specialTools.push('32mm oil filter housing cap wrench');
    else specialTools.push('Oil filter housing cap wrench');
  }
  specialTools.push(`Drain pan (capacity for ${oil.capacity || '6+ quarts'})`);
  if (!topFilter) specialTools.push('Jack and jack stands or ramps');

  // Common mistakes
  const commonMistakes = [];
  if (oil.type) {
    commonMistakes.push(`Using incorrect oil - this vehicle requires ${oil.type}`);
  }
  if (highCap) {
    commonMistakes.push(`Underfilling - this engine takes ${oil.capacity}, significantly more than typical sedans`);
  }
  commonMistakes.push('Forgetting to install new crush washer on drain plug (causes slow leak)');
  if (cartridge) {
    commonMistakes.push('Not replacing the O-ring on cartridge filter housing (causes oil leak)');
  }
  if (bellyPan) {
    commonMistakes.push('Forgetting to reinstall all skid plate/belly pan fasteners');
  }
  if (drySump) {
    commonMistakes.push('Not running engine to circulate through dry sump before checking level - reading will be inaccurate');
  }

  return { stepHints, specialTools, commonMistakes, verified: false };
}

function generateSparkPlugs(genData, make, model, genKey) {
  const sp = genData.sparkPlugs;
  if (!sp || isEV(genData) || isDiesel(genData)) return null;

  let layout = getLayout(genData);
  const turbo = isTurbo(genData);
  const qty = sp.quantity || 4;

  // For multi-engine descriptions (e.g. "V6 or V8"), use plug count to pick correct layout
  if (qty <= 4 && (layout === 'V6' || layout === 'V8')) layout = 'I4';
  if (qty === 6 && layout === 'V8') layout = 'V6';
  if (qty === 8 && layout === 'V6') layout = 'V8';

  const stepHints = [];

  // Safety
  stepHints.push('Disconnect negative battery terminal before starting. Let engine cool completely - spark plug work on a hot engine risks burns and thread damage');

  // Access
  if (/engine cover/i.test(genData.engine || '') || isGerman(make) || turbo) {
    stepHints.push('Remove engine cover (if equipped) for access to ignition coils');
  }

  // Layout-specific access notes
  if (layout === 'V6') {
    stepHints.push(`This is a V6 engine with ${qty} plugs. Front bank (3 plugs) is easily accessible. Rear bank may require removing intake manifold or reaching from behind engine`);
  } else if (layout === 'V8') {
    stepHints.push(`V8 engine with ${qty} spark plugs. Work one cylinder at a time to avoid mixing up coil connections. Some plugs may require universal joint socket extensions for access`);
  } else if (layout === 'boxer') {
    stepHints.push(`Boxer/flat engine - spark plugs are accessed horizontally from the sides of the engine. Use extensions and universal joints for access`);
  } else if (layout === 'I4') {
    stepHints.push(`Inline 4-cylinder with ${qty} plugs in a row along the top of the engine - straightforward access after removing coil packs`);
  } else if (layout === 'I6') {
    stepHints.push(`Inline 6-cylinder with ${qty} plugs along the top. Rear plugs near firewall may be tight - use extensions`);
  }

  // Coil removal
  stepHints.push('Remove ignition coil packs one at a time (typically 8mm or 10mm bolt). Label or photograph if concerned about order');

  // Plug removal
  const socketSize = qty <= 4 && /14mm/i.test(sp.partNumber || '') ? '5/8"' : '5/8"';
  stepHints.push(`Use spark plug socket (typically 5/8" or 16mm) with extension to remove old plugs. Inspect old plugs for abnormal wear patterns`);

  // Gap
  if (sp.gap) {
    if (/pre.?gap/i.test(sp.gap)) {
      stepHints.push(`${sp.partNumber || 'New plugs'} come pre-gapped from factory - do NOT adjust the gap`);
    } else {
      stepHints.push(`Gap new plugs to ${sp.gap} using a feeler gauge before installation`);
    }
  }

  // Installation — all modern vehicles (2015+) use iridium/platinum plugs; anti-seize is NOT recommended
  stepHints.push(`Install ${sp.partNumber || 'new spark plugs'} by hand first to avoid cross-threading, then torque to ${sp.torque || '15 ft-lbs'}. Do NOT apply anti-seize to modern iridium/platinum plugs - they have factory-applied coating that serves this purpose`);

  // Reassembly
  stepHints.push('Reinstall ignition coils and secure with bolts. Reconnect battery and start engine to verify smooth idle');

  // Special tools
  const specialTools = [
    'Spark plug socket (5/8" or 16mm, with rubber insert)',
    `Socket extensions (6" and 12") ${layout === 'V6' ? '+ universal joint for rear bank' : ''}`.trim(),
    'Torque wrench (inch-lb range)',
  ];
  if (sp.gap && !/pre.?gap/i.test(sp.gap)) {
    specialTools.push(`Feeler gauge or gap tool (${sp.gap})`);
  }
  if (/engine cover/i.test(genData.engine || '') || isGerman(make) || turbo) {
    specialTools.push('8mm or 10mm socket (coil pack and engine cover bolts)');
  }

  // Common mistakes
  const commonMistakes = [];
  commonMistakes.push(`Using wrong spark plug - this vehicle requires ${sp.partNumber || 'OE specification plugs'}`);
  commonMistakes.push(`Over-torquing spark plugs (spec is ${sp.torque || '15 ft-lbs'}) - overtightening can crack the ceramic or strip aluminum head threads`);
  commonMistakes.push('Applying anti-seize to modern iridium/platinum plugs - they have factory-applied coating, adding more can cause inaccurate torque readings');
  if (layout === 'V6') {
    commonMistakes.push('Skipping rear bank plugs because they are hard to access - all plugs must be replaced as a set');
  }
  if (sp.gap && !/pre.?gap/i.test(sp.gap)) {
    commonMistakes.push(`Installing plugs without checking gap - must be set to ${sp.gap}`);
  }

  return { stepHints, specialTools, commonMistakes, verified: false };
}

function generateCoolantFlush(genData, make, model, genKey) {
  const cool = genData.coolant;
  if (!cool) return null;

  const hybrid = isHybrid(genData);
  const ev = isEV(genData);
  const isGermanMake = isGerman(make);

  // EV thermal systems are typically dealer-service only
  if (ev) {
    return {
      stepHints: [
        'EV thermal/cooling systems should be serviced by a qualified technician or dealer',
        `System uses ${cool.type || 'manufacturer-specified coolant'}`,
        'Do NOT open cooling system without proper EV high-voltage safety training',
      ],
      specialTools: [],
      commonMistakes: ['Attempting to service EV thermal system without HV safety training'],
      verified: false,
    };
  }

  const stepHints = [];

  // Safety
  stepHints.push('NEVER open a hot cooling system - wait until engine is completely cool. Pressurized coolant can cause severe burns');

  // Drain
  stepHints.push(`Locate radiator drain petcock at bottom of radiator (usually driver side). Place drain pan underneath and open to drain old coolant. Capacity is ${cool.capacity || 'check owner\'s manual'}`);

  // Flush
  stepHints.push('Once drained, close petcock. Fill system with distilled water, run engine to operating temperature with heater on HIGH, then drain again. Repeat until water runs clear');

  // Brand-specific coolant warnings
  if (/dex.?cool/i.test(cool.type || '')) {
    stepHints.push(`Refill with ${cool.type}. IMPORTANT: Dex-Cool must NOT be mixed with traditional green coolant - mixing causes gel formation and clogs`);
  } else if (/toyota/i.test(cool.type || '')) {
    stepHints.push(`Refill with ${cool.type}. Do not mix with other coolant types - Toyota pink coolant is specific to Toyota/Lexus`);
  } else if (/bmw|blue/i.test(cool.type || '') && isGermanMake) {
    stepHints.push(`Refill with ${cool.type}. BMW/European coolant is phosphate-free - do NOT use conventional US coolant`);
  } else {
    stepHints.push(`Refill with ${cool.type || 'manufacturer-specified coolant'}. Use 50/50 mix with distilled water unless using pre-mixed`);
  }

  // Bleed
  stepHints.push('Bleed air from system: look for bleed valve/screw on thermostat housing or upper radiator hose. Fill slowly, squeeze upper hose to work out air pockets');

  // Hybrid note
  if (hybrid) {
    stepHints.push('HYBRID NOTE: This vehicle may have a separate inverter coolant loop. Do NOT cross-fill between engine and inverter circuits. Consult service manual for inverter coolant service');
  }

  // Final
  stepHints.push('Run engine to operating temperature with heater on HIGH. Check for leaks at all connections. Recheck coolant level after engine cools and top off');

  // Special tools
  const specialTools = [
    'Drain pan (capacity for ' + (cool.capacity || '10+ quarts') + ')',
    'Funnel with bleed tube (spill-free type recommended)',
    'Distilled water for flushing',
  ];
  if (isGermanMake) {
    specialTools.push('Coolant vacuum fill tool (recommended for European cars with complex routing)');
  }

  // Common mistakes
  const commonMistakes = [];
  commonMistakes.push(`Using wrong coolant type - this vehicle requires ${cool.type || 'manufacturer-specified coolant'}`);
  commonMistakes.push('Mixing different coolant types - can cause gel formation, corrosion, or overheating');
  commonMistakes.push('Not bleeding air from system - trapped air causes hot spots, overheating, and inaccurate temp gauge readings');
  if (hybrid) {
    commonMistakes.push('Mixing engine coolant into hybrid inverter coolant circuit - systems are separate');
  }

  return { stepHints, specialTools, commonMistakes, verified: false };
}

function generateTransmissionFluid(genData, make, model, genKey) {
  const trans = genData.transmission;
  if (!trans || isEV(genData)) return null;

  const type = (trans.type || '').toLowerCase();
  const isSealed = /sealed|lifetime|no.?change|dealer.?service|no.?fluid.?change|e-cvt/i.test(type);
  const isCVT = /cvt/i.test(type);
  const isManual = /manual|mt-?82|tr-?6060|tremec|getrag|6-speed manual|5-speed manual/i.test(type);
  const isDCT = /dct|dual.?clutch|dsg|pdk|smt/i.test(type);

  // Sealed transmissions - still provide info but note dealer recommendation
  if (isSealed && !isManual) {
    return {
      stepHints: [
        `This vehicle has a sealed transmission (${trans.type || 'sealed unit'}) - manufacturer states "lifetime fill"`,
        'Many independent mechanics recommend fluid service at 60,000-80,000 miles despite "lifetime" claim',
        'Sealed transmission fluid service requires special equipment to measure correct fill level via temperature',
        'If servicing: drain and fill only (NOT a full flush) with correct fluid type',
        trans.capacity ? `Drain and fill capacity: ${trans.capacity}` : 'Consult service manual for drain/fill capacity',
      ],
      specialTools: ['Transmission fluid pump (for sealed units)', 'OBD-II scanner to monitor fluid temperature during fill'],
      commonMistakes: [
        `Using incorrect fluid - must use ${trans.type || 'manufacturer-specified ATF'}`,
        'Overfilling sealed transmission - level must be checked at specific temperature via overflow plug',
        'Performing a full flush instead of drain-and-fill on older transmissions (can dislodge debris)',
      ],
      verified: false,
    };
  }

  const stepHints = [];

  if (isManual) {
    // Manual transmission
    stepHints.push('Raise vehicle securely on jack stands. Locate fill plug (usually on side of transmission) and drain plug (bottom)');
    stepHints.push('IMPORTANT: Remove fill plug FIRST before drain plug - if fill plug is seized, you can still drive with old fluid');
    stepHints.push(`Remove drain plug and let fluid drain completely into pan`);
    stepHints.push(`Install drain plug. Fill through fill plug hole with ${trans.type || 'specified gear oil'} using a pump until fluid seeps from fill hole`);
    stepHints.push(`Total capacity: ${trans.capacity || 'consult service manual'}. Install fill plug once fluid reaches the fill hole level`);
  } else if (isCVT) {
    // CVT
    stepHints.push(`This vehicle uses a CVT (Continuously Variable Transmission) requiring specific ${trans.type || 'CVT fluid'}`);
    stepHints.push('Raise vehicle and locate CVT drain plug on transmission pan. Drain old fluid');
    stepHints.push(`Refill with exactly ${trans.capacity || 'specified amount'} of ${trans.type || 'manufacturer CVT fluid'} through dipstick tube or fill port`);
    stepHints.push('CVT fluid level must be checked at operating temperature (typically 122-176°F) - use OBD scanner to verify');
    stepHints.push('CRITICAL: Never use conventional ATF in a CVT - it will destroy the belt/chain assembly');
  } else if (isDCT) {
    // Dual-clutch
    stepHints.push(`Dual-clutch transmission requires specific ${trans.type || 'DCT fluid'} - do not substitute`);
    stepHints.push('This service is typically recommended for dealer or specialist due to clutch adaptation reset required after fluid change');
    stepHints.push(`Drain and fill capacity: ${trans.capacity || 'consult service manual'}`);
  } else {
    // Standard automatic
    stepHints.push('Warm transmission to operating temperature by driving 10-15 minutes before draining');
    stepHints.push(`Locate transmission drain plug or pan bolts. Remove and drain fluid into pan. Drain and fill capacity: ${trans.capacity || 'consult service manual'}`);
    stepHints.push(`Refill through dipstick tube (if equipped) or fill port with ${trans.type || 'manufacturer-specified ATF'}`);
    stepHints.push('Check fluid level with engine running, transmission in Park, at operating temperature. Level should be in the crosshatch area on dipstick');
    stepHints.push('Perform a drain-and-fill (NOT a full flush) to exchange approximately 30-40% of total fluid volume. Repeat at next interval for gradual refresh');
  }

  // Special tools
  const specialTools = ['Drain pan', 'Fluid pump or funnel with long neck'];
  if (isCVT || isSealed) {
    specialTools.push('OBD-II scanner (to monitor fluid temperature for correct fill level)');
  }
  if (isManual) {
    specialTools.push('Fluid transfer pump (to fill through side plug)');
  }

  // Common mistakes
  const commonMistakes = [
    `Using wrong fluid type - this vehicle requires ${trans.type || 'manufacturer-specified fluid'}`,
  ];
  if (isCVT) {
    commonMistakes.push('Using conventional ATF in a CVT - will destroy the variator. Must use CVT-specific fluid');
  }
  commonMistakes.push('Overfilling transmission - too much fluid causes foaming, overheating, and erratic shifting');
  if (!isManual) {
    commonMistakes.push('Checking fluid level with engine off or transmission not in Park - gives inaccurate reading');
  }

  return { stepHints, specialTools, commonMistakes, verified: false };
}

function generateDifferentialFluid(genData, make, model, genKey) {
  const diffs = genData.differentials;
  if (!diffs || isEV(genData)) return null;

  const hasFront = diffs.front && diffs.front.type;
  const hasRear = diffs.rear && diffs.rear.type;
  if (!hasFront && !hasRear) return null;

  const stepHints = [];
  const specialTools = ['Drain pan', 'Fluid transfer pump (for fill plug)', 'Ratchet and socket set'];
  const commonMistakes = [];

  stepHints.push('Raise vehicle securely on jack stands. Locate differential fill and drain plugs');
  stepHints.push('Remove FILL plug first before drain plug - if fill plug is seized, you can still drive with old fluid');

  if (hasRear) {
    const r = diffs.rear;
    const isLSD = /limited.?slip|posi|lsd|electronic/i.test(r.type);
    stepHints.push(`REAR differential: drain old fluid, then fill with ${r.type} - capacity ${r.capacity || 'until fluid seeps from fill hole'}`);
    if (isLSD) {
      stepHints.push('This rear differential has a limited-slip or electronic LSD - add friction modifier additive if required by manufacturer');
      commonMistakes.push('Forgetting limited-slip friction modifier additive - causes chattering/clunking in turns');
    }
  }

  if (hasFront) {
    const f = diffs.front;
    stepHints.push(`FRONT differential: drain and fill with ${f.type} - capacity ${f.capacity || 'until fluid seeps from fill hole'}`);
  }

  stepHints.push('Install fill plug once fluid reaches the fill hole level. Check for leaks after test drive');

  commonMistakes.push('Mixing gear oil weights or types between front and rear differentials - they may require different specifications');
  commonMistakes.push('Forgetting to remove fill plug first - if seized, you cannot refill the differential');

  return { stepHints, specialTools, commonMistakes, verified: false };
}

function generateTransferCaseFluid(genData, make, model, genKey) {
  const tc = genData.transferCase;
  if (!tc || isEV(genData)) return null;

  const fluid = tc.fluidType || tc.type || 'manufacturer-specified transfer case fluid';
  const cap = tc.capacity || 'until fluid seeps from fill hole';

  const stepHints = [
    'Raise vehicle securely on jack stands. Locate transfer case fill and drain plugs on the transfer case housing',
    'Remove FILL plug first before drain plug - if fill plug is seized, you can still drive with old fluid',
    `Remove drain plug and let fluid drain completely into pan`,
    `Install drain plug. Fill through fill plug with ${fluid} - capacity ${cap}`,
    'Install fill plug once fluid reaches the fill hole level',
    'Check for leaks after a short test drive and verify no unusual noises from transfer case',
  ];

  const specialTools = [
    'Drain pan',
    'Fluid transfer pump (for fill plug)',
    'Socket/wrench set for drain and fill plugs',
  ];

  const commonMistakes = [
    `Using incorrect fluid - transfer case requires ${fluid}`,
    'Confusing transfer case plugs with transmission or differential plugs - verify correct location',
    'Overfilling - fill only until fluid seeps from fill hole',
  ];

  return { stepHints, specialTools, commonMistakes, verified: false };
}

function generateBrakeFluid(genData, make, model, genKey) {
  const bf = genData.brakeFluid;
  if (!bf) return null;

  const dotType = bf.type || 'DOT 4';
  const lug = getLugInfo(genData);
  const hybrid = isHybrid(genData);
  const ev = isEV(genData);

  const stepHints = [];

  stepHints.push('SAFETY: Brake fluid is corrosive to paint - immediately wipe any spills. Work in a well-ventilated area');
  stepHints.push(`This vehicle requires ${dotType} brake fluid. Do NOT mix DOT types (especially DOT 5 silicone with DOT 3/4 glycol-based)`);
  stepHints.push(`Open master cylinder reservoir (under hood, driver side) and top off with fresh ${dotType}. Keep reservoir topped during bleeding`);
  stepHints.push('Bleed brakes starting from the wheel FARTHEST from the master cylinder (typically: RR → LR → RF → LF)');
  stepHints.push('At each wheel: attach clear hose to bleeder valve into catch bottle. Have helper pump brake pedal 3x, hold on last pump. Open bleeder briefly until fluid flows, close, then release pedal. Repeat until no bubbles appear');

  if (lug) {
    stepHints.push(`Wheel removal: use ${lug.size} socket for lug ${lug.type}. Torque to ${lug.torque} when reinstalling`);
  }

  if (hybrid || ev) {
    stepHints.push('HYBRID/EV NOTE: Regenerative braking means brake fluid may have longer life, but moisture absorption still requires periodic replacement');
  }

  stepHints.push('After bleeding all 4 corners: pump brake pedal several times to build pressure. Pedal should feel firm - if spongy, re-bleed');

  const specialTools = [
    'Brake bleeder wrench (8mm or 10mm, vehicle-specific)',
    'Clear vinyl hose and catch bottle',
    `Fresh ${dotType} brake fluid (1 quart minimum)`,
    'Helper for two-person bleed method (or one-person bleeder kit)',
  ];
  if (lug) {
    specialTools.push(`${lug.size} socket and breaker bar (wheel removal)`);
  }

  const commonMistakes = [
    `Using wrong DOT rating - this vehicle requires ${dotType}`,
    'Letting master cylinder reservoir run dry during bleeding - introduces air into system',
    'Not bleeding in correct order (farthest to nearest from master cylinder)',
    'Using old/opened brake fluid - brake fluid absorbs moisture from air rapidly once opened',
  ];

  return { stepHints, specialTools, commonMistakes, verified: false };
}

function generateBrakeInspection(genData, make, model, genKey) {
  const lug = getLugInfo(genData);
  if (!lug) return null;

  const german = isGerman(make);
  const ev = isEV(genData);
  const hybrid = isHybrid(genData);

  const stepHints = [];

  stepHints.push(`Loosen lug ${lug.type} (${lug.size} socket) while wheel is on ground, then raise vehicle and remove wheel`);

  if (german) {
    stepHints.push(`NOTE: This vehicle uses lug BOLTS (not nuts) - when removing the wheel, the wheel is not held by studs. Use a wheel alignment pin/guide tool to assist with reinstallation`);
  }

  stepHints.push('Inspect brake pads through caliper inspection window or by removing caliper. Minimum pad thickness is typically 3mm (1/8") - replace if at or below this');
  stepHints.push('Check brake rotor surface for scoring, grooves, or heat spots (blue discoloration). Measure rotor thickness with micrometer - compare to minimum thickness stamped on rotor');
  stepHints.push('Inspect caliper for leaks, damaged dust boots, and sticky slide pins. Slide pins should move freely');
  stepHints.push('Check brake hoses for cracks, bulging, or leaks');

  if (ev || hybrid) {
    stepHints.push('EV/HYBRID: Regenerative braking means brake pads last significantly longer. However, rotors can develop surface rust from infrequent mechanical braking - inspect for excessive corrosion');
  }

  stepHints.push(`Reinstall wheel and torque lug ${lug.type} to ${lug.torque} in a star/cross pattern. Re-torque after 50-100 miles`);

  const specialTools = [
    `${lug.size} socket and breaker bar`,
    'Jack and jack stands',
    'Brake pad thickness gauge or micrometer',
    'Flashlight for visual inspection',
  ];
  if (german) {
    specialTools.push('Wheel alignment guide pins (for lug bolt vehicles)');
  }

  const commonMistakes = [
    `Not torquing lug ${lug.type} to spec (${lug.torque}) - under-torque causes wheel loosening, over-torque warps rotors`,
    'Ignoring brake fluid level - low fluid often indicates worn pads (fluid fills caliper space as pads wear)',
    'Only checking one corner - brake wear can vary significantly between axles and sides',
  ];
  if (german) {
    commonMistakes.push('Trying to hang wheel on studs like American/Japanese cars - lug bolt vehicles require holding the wheel while threading bolts');
  }

  return { stepHints, specialTools, commonMistakes, verified: false };
}

function generateTireRotation(genData, make, model, genKey) {
  const lug = getLugInfo(genData);
  if (!lug) return null;

  const drivetrain = inferDrivetrain(make, model, genData);
  const performance = isPerformanceCar(model, genKey);

  const stepHints = [];

  // Check for staggered setup
  if (performance) {
    stepHints.push('CHECK FIRST: If this vehicle has a staggered tire setup (different front/rear sizes), standard rotation is NOT possible. Tires can only be swapped side-to-side on the same axle if they are non-directional');
  }

  stepHints.push(`Loosen all lug ${lug.type} (${lug.size} socket) while wheels are on ground, then raise vehicle`);

  // Rotation pattern based on drivetrain
  if (/RWD/.test(drivetrain)) {
    stepHints.push('RWD rotation pattern: Rear tires move straight to front. Front tires cross to opposite rear positions (X-pattern for front tires)');
  } else if (/FWD/.test(drivetrain) && !/AWD|4WD/.test(drivetrain)) {
    stepHints.push('FWD rotation pattern: Front tires move straight to rear. Rear tires cross to opposite front positions (X-pattern for rear tires)');
  } else if (/AWD|4WD/.test(drivetrain)) {
    stepHints.push('AWD/4WD rotation pattern: Use X-pattern (each tire crosses to diagonal position) or forward cross pattern per manufacturer recommendation');
  }

  stepHints.push('If tires are DIRECTIONAL (arrow on sidewall), they can only be rotated front-to-rear on the same side - never crossed');
  stepHints.push('Check tire pressures and adjust all tires to door placard specification after rotation');
  stepHints.push(`Torque all lug ${lug.type} to ${lug.torque} in a star/cross pattern. Re-torque after 50-100 miles of driving`);

  const specialTools = [
    `${lug.size} socket and breaker bar`,
    'Floor jack and 4 jack stands (or lift)',
    'Torque wrench',
    'Tire pressure gauge',
  ];

  const commonMistakes = [
    `Not torquing lug ${lug.type} to spec (${lug.torque})`,
    'Rotating directional tires to opposite sides (check for directional arrow on sidewall)',
    'Forgetting to adjust tire pressures after rotation - front and rear specs may differ',
    'Not re-torquing lug nuts/bolts after 50-100 miles',
  ];
  if (performance) {
    commonMistakes.push('Attempting standard rotation on staggered-fitment setup (different front/rear tire sizes)');
  }

  return { stepHints, specialTools, commonMistakes, verified: false };
}

// ────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────

const generators = {
  oil_change: generateOilChange,
  spark_plugs: generateSparkPlugs,
  coolant_flush: generateCoolantFlush,
  transmission_fluid: generateTransmissionFluid,
  differential_fluid: generateDifferentialFluid,
  transfer_case_fluid: generateTransferCaseFluid,
  brake_fluid: generateBrakeFluid,
  brake_inspection: generateBrakeInspection,
  tire_rotation: generateTireRotation,
};

const stats = { total: 0, generated: {}, preserved: 0, skipped: 0, entries: 0 };

for (const [make, models] of Object.entries(specs)) {
  for (const [model, gens] of Object.entries(models)) {
    for (const [genKey, genData] of Object.entries(gens)) {
      if (!genData.years || !Array.isArray(genData.years)) continue;
      stats.entries++;

      if (!genData.procedures) genData.procedures = {};

      for (const [type, generator] of Object.entries(generators)) {
        // Preserve existing verified entries
        if (genData.procedures[type] && genData.procedures[type].verified === true) {
          stats.preserved++;
          continue;
        }

        const result = generator(genData, make, model, genKey);
        if (result) {
          genData.procedures[type] = result;
          stats.generated[type] = (stats.generated[type] || 0) + 1;
          stats.total++;
        } else {
          stats.skipped++;
        }
      }
    }
  }
}

// Write back
fs.writeFileSync(specsPath, JSON.stringify(specs, null, 2) + '\n');

// Summary
console.log('\n' + '='.repeat(70));
console.log('Procedure Generation Summary');
console.log('='.repeat(70));
console.log(`\nGeneration entries processed: ${stats.entries}\n`);
console.log('Procedures generated per type:');
for (const [type, count] of Object.entries(stats.generated).sort()) {
  console.log(`  ${type.padEnd(25)} ${count}`);
}
console.log(`\n  ${'TOTAL GENERATED'.padEnd(25)} ${stats.total}`);
console.log(`  ${'Verified preserved'.padEnd(25)} ${stats.preserved}`);
console.log(`  ${'Skipped (N/A)'.padEnd(25)} ${stats.skipped}`);
console.log('\n' + '='.repeat(70));
