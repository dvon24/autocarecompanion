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
// Phase 2 generators: air_filter, cabin_filter, serpentine_belt, battery,
// wiper_blades, plus shop-service types
// ────────────────────────────────────────────────────────────────────────

function getCabinFilterLocation(make, model) {
  // BMW/MINI: cowl panel area (under windshield wipers)
  if (/bmw|mini/i.test(make)) return 'cowl';
  // Mercedes: cowl panel or behind glove box depending on model
  if (/mercedes/i.test(make)) return 'cowl';
  // Some Audis use cowl, some glove box
  if (/audi/i.test(make)) return 'cowl';
  // Wrangler has it under the cowl
  if (/wrangler/i.test(model)) return 'cowl';
  // Most trucks: behind glove box or under dash
  if (/f-150|f-250|f-350|silverado|sierra|ram|tacoma|tundra|frontier|titan|colorado|canyon|ranger/i.test(model)) return 'glovebox';
  // Default: behind glove box (most common for Japanese/Korean/American sedans/SUVs)
  return 'glovebox';
}

function getBatteryLocation(make, model, genData) {
  const e = (genData.engine || '').toLowerCase();
  const safety = (genData.safety || []).join(' ').toLowerCase();
  // BMW: trunk (most models)
  if (/bmw/i.test(make)) return 'trunk';
  // Mercedes: some in trunk (E/S-Class), some under hood (C-Class, SUVs)
  if (/mercedes/i.test(make)) {
    if (/e-class|s-class|cls|sl/i.test(model)) return 'trunk';
    return 'hood';
  }
  // Chrysler 300, Dodge Challenger/Charger: trunk
  if (/300/i.test(model) && /chrysler/i.test(make)) return 'trunk';
  if (/challenger|charger/i.test(model)) return 'trunk';
  // Hybrids: 12V battery may be in trunk or under rear seat
  if (/hybrid|atkinson.*electric/i.test(e) || /hybrid/i.test(safety)) return 'trunk';
  // EVs: 12V auxiliary under hood or trunk
  if (isEV(genData)) return 'hood-aux';
  // Default: under hood
  return 'hood';
}

function hasPowerSteering(genData) {
  const e = (genData.engine || '').toLowerCase();
  // Most modern vehicles (2012+) use EPS. Exceptions: heavy trucks, some older models
  // We'll generate for trucks and older platforms that likely still use hydraulic
  if (/f-250|f-350|super duty/i.test(e)) return true;
  // Most modern vehicles use EPS - no fluid to change
  return false;
}

function generateAirFilter(genData, make, model, genKey) {
  if (isEV(genData)) return null;

  const turbo = isTurbo(genData);
  const diesel = isDiesel(genData);
  const isTruck = /f-150|f-250|f-350|silverado|sierra|ram|tacoma|tundra|frontier|titan|colorado|canyon|ranger|ridgeline|gladiator/i.test(model);

  const stepHints = [];

  stepHints.push('Open the hood and locate the air filter box - it is a large plastic housing connected to the intake tube, typically on one side of the engine bay');

  if (/bmw|audi|volkswagen|mercedes|volvo|mini/i.test(make)) {
    stepHints.push('Release the clips or unscrew the Torx/hex fasteners on the air box lid. European vehicles often use T25 Torx screws instead of simple clips');
  } else if (/toyota|honda|subaru|nissan|mazda|hyundai|kia/i.test(make)) {
    stepHints.push('Release the metal clips (usually 2-4) on the air box lid. Japanese/Korean vehicles typically use simple spring clips that flip open by hand');
  } else {
    stepHints.push('Release the clips or fasteners on the air box lid. Most have 2-4 spring clips that unsnap by hand');
  }

  if (turbo) {
    stepHints.push('TURBOCHARGED ENGINE: You may need to disconnect the MAF sensor electrical connector and/or loosen the intake tube clamp before fully removing the air box lid');
  }

  stepHints.push('Lift the lid and remove the old air filter. Note the orientation (airflow direction arrow) for installing the new one');
  stepHints.push('Inspect the air box interior for debris, leaves, or rodent nesting material. Wipe clean if needed');
  stepHints.push('Install the new air filter with the airflow arrow pointing toward the engine (downstream). Ensure it seats flat with no gaps around the edges');
  stepHints.push('Close the air box lid and secure all clips/fasteners. Ensure a tight seal - any air leak bypasses the filter');

  if (turbo) {
    stepHints.push('Reconnect MAF sensor connector and tighten intake tube clamp if disconnected');
  }

  const specialTools = ['No tools required for most vehicles (hand-release clips)'];
  if (/bmw|audi|volkswagen|mercedes|volvo|mini/i.test(make)) {
    specialTools[0] = 'T25 Torx screwdriver (European vehicles often use Torx fasteners on air box)';
  }

  const commonMistakes = [
    'Installing filter upside down or backwards - check airflow direction arrow',
    'Not seating filter fully in the air box - gaps allow unfiltered air into engine',
    'Not closing all clips/fasteners on air box lid - causes unmetered air leak and possible check engine light',
  ];
  if (turbo) {
    commonMistakes.push('Forgetting to reconnect MAF sensor connector - causes check engine light and poor running');
  }
  if (diesel || isTruck) {
    commonMistakes.push('Going too long between changes in dusty conditions - trucks and diesels should change filter more frequently in dusty environments');
  }

  return { stepHints, specialTools, commonMistakes, verified: false };
}

function generateCabinFilter(genData, make, model, genKey) {
  const location = getCabinFilterLocation(make, model);

  const stepHints = [];

  if (location === 'cowl') {
    stepHints.push('The cabin air filter on this vehicle is accessed from the cowl area (exterior, under the windshield wiper area)');
    stepHints.push('Turn off the ignition and lift the windshield wipers away from the windshield. Remove the cowl panel cover (usually plastic clips or screws)');
    stepHints.push('Locate the cabin filter housing underneath the cowl panel. Open the cover (clips or screws) and slide out the old filter');
    stepHints.push('Note the airflow direction arrow on the old filter before removing. Install new filter with arrow pointing in the same direction (typically downward/into the vehicle)');
    stepHints.push('Reinstall the filter housing cover, cowl panel, and lower windshield wipers');
  } else {
    // Behind glove box (most common)
    stepHints.push('The cabin air filter is accessed behind the glove box');
    stepHints.push('Open the glove box and empty its contents. Squeeze the sides of the glove box inward to release the stop tabs, then lower it fully to reveal the filter housing');

    if (/toyota|lexus/i.test(make)) {
      stepHints.push('On Toyota/Lexus: the damper arm on the right side of the glove box unhooks easily - squeeze the clip to detach');
    } else if (/honda|acura/i.test(make)) {
      stepHints.push('On Honda/Acura: remove the glove box damper arm (right side) by pushing the pin inward, then squeeze sides and lower');
    }

    stepHints.push('Open the cabin filter housing cover (usually 1-2 tabs). Slide out the old filter, noting the airflow direction arrow');
    stepHints.push('Install the new cabin filter with the airflow direction arrow pointing downward (toward the floor). Ensure it slides in fully and seats flat');
    stepHints.push('Close the filter housing cover, raise the glove box back into position, and re-engage the stop tabs by pushing the sides inward');
  }

  const specialTools = ['No special tools required for most vehicles'];
  if (location === 'cowl') {
    specialTools[0] = 'Phillips screwdriver or T20 Torx (for cowl panel screws)';
    specialTools.push('Plastic trim removal tool (to avoid breaking cowl panel clips)');
  }

  const commonMistakes = [
    'Installing filter with airflow arrow pointing the wrong direction - check arrow before removing old filter',
    'Forgetting to reinstall glove box stop tabs (glove box hangs open and dumps contents)',
    'Not replacing cabin filter often enough - a clogged filter reduces HVAC airflow and can cause musty odor',
  ];
  if (location === 'cowl') {
    commonMistakes[1] = 'Breaking plastic cowl panel clips during removal - use a trim tool, not a screwdriver, to pry clips';
  }

  return { stepHints, specialTools, commonMistakes, verified: false };
}

function generateSerpentineBelt(genData, make, model, genKey) {
  if (isEV(genData)) return null;

  const layout = getLayout(genData);
  const turbo = isTurbo(genData);
  const isGermanMake = isGerman(make);
  const isTruck = /f-150|f-250|f-350|silverado|sierra|ram|tacoma|tundra|titan|expedition|tahoe|suburban|sequoia/i.test(model);

  const stepHints = [];

  stepHints.push('Before starting: take a photo of the belt routing or find the belt routing diagram (usually on a sticker in the engine bay or in the owner\'s manual). This is CRITICAL for reinstallation');

  if (isGermanMake) {
    stepHints.push('European vehicles may use a stretch-fit belt without a traditional tensioner. If your vehicle uses a stretch belt, a special installation tool is required and the belt cannot be reused once removed');
  }

  stepHints.push('Locate the automatic belt tensioner - it is spring-loaded with a smooth (unpainted) idler pulley. Use a 15mm wrench, 3/8" square drive ratchet, or vehicle-specific tensioner tool to rotate the tensioner and release belt tension');

  if (layout === 'V6' || layout === 'V8') {
    stepHints.push('On V6/V8 engines, the belt route is complex and wraps around many pulleys (alternator, A/C, power steering, water pump, idler, tensioner). Work from the top of the engine and reference your routing diagram');
  }

  stepHints.push('Slip the old belt off while holding the tensioner. Inspect all pulleys for smooth spinning and wobble - replace any noisy or rough bearings now while the belt is off');
  stepHints.push('Route the new belt according to the diagram, leaving one pulley for last (usually the tensioner idler or alternator). Rotate tensioner, slip belt onto final pulley, and slowly release tensioner');
  stepHints.push('Verify the belt is properly seated in ALL pulley grooves - a misaligned belt will be thrown off immediately. Start engine briefly to confirm belt tracks correctly');

  const specialTools = [
    'Serpentine belt tool or 15mm wrench or 3/8" square drive ratchet (for tensioner)',
    'Flashlight (to inspect belt routing and pulley condition)',
  ];
  if (isGermanMake) {
    specialTools.push('Stretch belt installation tool (if applicable to this model)');
  }
  if (isTruck || layout === 'V8') {
    specialTools.push('Long-handle breaker bar (truck/V8 tensioners require more force)');
  }

  const commonMistakes = [
    'Not photographing/documenting belt routing before removal - reinstallation without the diagram is very difficult',
    'Belt not fully seated in a pulley groove - causes squealing, belt damage, or belt being thrown off',
    'Not inspecting idler and tensioner pulleys while belt is off - a failing bearing will destroy the new belt quickly',
    'Releasing tensioner too quickly - let it return slowly to avoid damaging the new belt',
  ];
  if (isGermanMake) {
    commonMistakes.push('Attempting to reuse a stretch-fit belt - these belts are one-time use and must be replaced with new');
  }

  return { stepHints, specialTools, commonMistakes, verified: false };
}

function generateBattery(genData, make, model, genKey) {
  const location = getBatteryLocation(make, model, genData);
  const ev = isEV(genData);
  const hybrid = isHybrid(genData);
  const lug = getLugInfo(genData);

  const stepHints = [];

  if (ev) {
    // EV 12V auxiliary battery
    stepHints.push('This is an EV - the 12V AUXILIARY battery powers electronics (not the drive motor). The high-voltage traction battery is NOT owner-serviceable');
    stepHints.push('Locate the 12V auxiliary battery (typically under the hood or in the trunk). Consult owner\'s manual for exact location');
    stepHints.push('IMPORTANT: Follow manufacturer procedures for 12V battery replacement on EVs - incorrect procedure can trigger fault codes');
    stepHints.push('Disconnect negative (-) terminal first, then positive (+). Remove battery hold-down clamp. Install new battery, connect positive first, then negative');
    stepHints.push('After replacement: the vehicle may need systems to reinitialize. Drive for 15+ minutes to allow adaptation');

    return {
      stepHints,
      specialTools: ['10mm wrench (terminal bolts)', '13mm socket (hold-down clamp)', 'Memory saver tool (optional, to preserve settings)'],
      commonMistakes: [
        'Confusing the 12V auxiliary battery with the high-voltage traction battery - NEVER attempt to service the HV battery',
        'Disconnecting positive terminal first - always disconnect NEGATIVE first to avoid short circuits',
      ],
      verified: false,
    };
  }

  // Location-specific instructions
  if (location === 'trunk') {
    stepHints.push(`The battery on this vehicle is located in the TRUNK (not under the hood). ${/bmw/i.test(make) ? 'Look under the trunk floor panel on the right side' : /challenger|charger/i.test(model) ? 'Battery is in the trunk, passenger side' : /300/i.test(model) ? 'Battery is in the trunk' : 'Check trunk floor or side panel'}`);
    stepHints.push('NOTE: There may be a remote positive terminal under the hood for jump-starting - this is NOT where the battery is located');
  } else {
    stepHints.push('Open the hood and locate the battery (typically on one side of the engine bay)');
  }

  // Safety
  stepHints.push('SAFETY: Remove any metal jewelry before working on the battery. A wrench bridging positive to ground can cause severe burns or fire');

  // Disconnect
  stepHints.push('Disconnect the NEGATIVE (-) terminal first (usually 10mm bolt). Move the cable aside so it cannot accidentally contact the terminal');
  stepHints.push('Disconnect the POSITIVE (+) terminal next');

  // Remove
  stepHints.push('Remove the battery hold-down clamp or bracket (typically 10mm, 12mm, or 13mm bolt). Lift the battery out - batteries are heavy (30-50 lbs for cars, 50-75 lbs for trucks)');

  // Clean
  stepHints.push('Clean the battery tray and terminal connectors with baking soda/water solution if there is corrosion. Dry thoroughly');

  // Install
  stepHints.push('Set new battery in tray and secure hold-down clamp. Connect POSITIVE (+) terminal first, then NEGATIVE (-) last');
  stepHints.push('Apply battery terminal protectant spray or thin layer of dielectric grease to terminals to prevent future corrosion');

  if (hybrid) {
    stepHints.push('HYBRID NOTE: This vehicle also has a high-voltage traction battery. Only service the 12V starter/accessory battery. The HV battery is dealer-service only');
  }

  // Post-install
  stepHints.push('After connecting: you may need to reset clock, radio presets, and power windows. Some vehicles require an idle relearn procedure - let engine idle for 10 minutes');

  const specialTools = [
    '10mm wrench or socket (terminal bolts)',
    '10mm, 12mm, or 13mm socket (hold-down clamp)',
    'Wire brush or battery terminal cleaner',
    'Memory saver tool (optional - preserves radio, clock, ECU settings during battery swap)',
  ];

  const commonMistakes = [
    'Disconnecting positive terminal first - always disconnect NEGATIVE first to prevent short circuits',
    'Connecting negative terminal first during installation - always connect POSITIVE first',
    'Not securing hold-down clamp - an unsecured battery can shift and short against the hood',
    'Not cleaning corroded terminals - corrosion on terminals causes voltage drops and starting problems',
  ];
  if (location === 'trunk') {
    commonMistakes.push('Looking for the battery under the hood - this vehicle\'s battery is in the trunk');
  }

  return { stepHints, specialTools, commonMistakes, verified: false };
}

function generateWiperBlades(genData, make, model, genKey) {
  const isGermanMake = isGerman(make);
  const isSUVorHatch = /4runner|rav4|cr-v|cx-5|tucson|sportage|wrangler|grand cherokee|tahoe|suburban|expedition|explorer|highlander|outback|crosstrek|forester|rogue|escape|bronco|prius|impreza|golf|gti/i.test(model);

  const stepHints = [];

  stepHints.push('Check your owner\'s manual or measure your current wiper blades for the correct sizes. Driver and passenger sides are often DIFFERENT lengths');

  if (isGermanMake) {
    stepHints.push('European vehicles often use a specific wiper arm attachment style (pinch tab, push button, or side pin). Verify the connector type before purchasing replacement blades');
  }

  stepHints.push('Lift the wiper arm away from the windshield until it locks in the upright position. Place a folded towel on the windshield under the arm in case it snaps back');
  stepHints.push('Press the release tab on the wiper blade where it connects to the arm. Slide the old blade off the hook (most modern vehicles use a J-hook or push-button adapter)');
  stepHints.push('Attach the new blade by sliding it onto the wiper arm hook until it clicks into place. Gently lower the arm back to the windshield and verify it sits flat');
  stepHints.push('Repeat for the other side. Test both wipers with washer fluid to verify proper sweep and no streaking');

  if (isSUVorHatch) {
    stepHints.push('This vehicle may have a REAR wiper blade as well. Check if the rear wiper needs replacement - it often uses a different size and attachment style');
  }

  const specialTools = ['No tools required - wiper blades are a tool-free replacement on most vehicles'];

  const commonMistakes = [
    'Buying wrong blade size - driver and passenger sides are usually different lengths',
    'Letting wiper arm snap back against windshield without a blade on it - can crack the glass',
    'Not testing new blades with washer fluid - streaking indicates incorrect installation or defective blade',
    'Buying wrong adapter type - verify J-hook, push-button, pin, or bayonet style before purchasing',
  ];

  return { stepHints, specialTools, commonMistakes, verified: false };
}

// ── Shop-service / dealer-only types ──────────────────────────────────

function generateWheelAlignment(genData, make, model, genKey) {
  const lug = getLugInfo(genData);
  const isTruck = /f-150|f-250|f-350|silverado|sierra|ram|tacoma|tundra|titan|expedition|tahoe|suburban|sequoia|4runner|wrangler|grand cherokee/i.test(model);
  const isLowered = isPerformanceCar(model, genKey);

  const stepHints = [
    'Wheel alignment requires specialized equipment (alignment rack with laser/camera sensors) and should be performed by a qualified shop',
    'Signs you need alignment: vehicle pulls to one side, steering wheel is off-center, uneven tire wear patterns',
    'Before alignment: ensure tire pressures are at specification, suspension components are not worn, and ride height is stock (or inform shop of modifications)',
  ];

  if (isTruck) {
    stepHints.push('Trucks/SUVs with lift kits or leveling kits: inform the alignment shop of any suspension modifications as this affects alignment specs');
  }
  if (isLowered) {
    stepHints.push('Performance/lowered vehicles: inform the shop of any coilover or lowering spring modifications. May need custom alignment specs for modified ride height');
  }

  stepHints.push('After alignment: the shop should provide a printout showing before/after measurements for camber, caster, and toe. Keep this for your records');
  stepHints.push('Typical cost: $80-150 for a 4-wheel alignment. Get alignment checked after any suspension work, hitting a major pothole, or if tire wear appears uneven');

  return {
    stepHints,
    specialTools: ['Professional alignment rack (shop service only)'],
    commonMistakes: [
      'Skipping alignment after suspension work or tire replacement - misalignment causes rapid uneven tire wear',
      'Getting alignment with worn suspension components (ball joints, tie rods, bushings) - alignment will not hold',
      'Not checking tire pressures before alignment - incorrect pressures throw off alignment readings',
    ],
    verified: false,
  };
}

function generateFuelFilter(genData, make, model, genKey) {
  if (isEV(genData)) return null;

  const diesel = isDiesel(genData);

  // Diesel trucks have external/serviceable fuel filters
  if (diesel) {
    return {
      stepHints: [
        'Diesel vehicles have an external, owner-serviceable fuel filter (unlike most modern gas vehicles with in-tank filters)',
        'Relieve fuel system pressure before starting - refer to service manual for your specific fuel system pressure relief procedure',
        'Locate the fuel filter housing (typically on the engine or frame rail). Drain any water from the water separator first',
        'Remove old filter element and install new one. Prime the fuel system by cycling the key to ON (not start) several times to build fuel pressure',
        'Start engine and check for leaks at all fuel filter connections. Diesel fuel leaks are a fire hazard',
        'Some diesel trucks have DUAL fuel filters (primary and secondary) - replace both at the same time',
      ],
      specialTools: [
        'Fuel filter wrench (vehicle-specific)',
        'Drain pan for fuel',
        'Rags and safety glasses (pressurized fuel)',
      ],
      commonMistakes: [
        'Not priming the fuel system after filter replacement - engine will crank but not start until air is purged',
        'Not draining water separator before and after filter change',
        'Forgetting to replace the second fuel filter on dual-filter systems',
        'Not relieving fuel system pressure before disconnecting - pressurized fuel spray is dangerous',
      ],
      verified: false,
    };
  }

  // Gas vehicles - most modern gas vehicles have in-tank filters
  return {
    stepHints: [
      'Most modern gasoline vehicles (2006+) have the fuel filter integrated into the fuel pump assembly INSIDE the fuel tank. This is not a routine owner-serviceable item',
      'If your vehicle has an external inline fuel filter (typically older vehicles or some trucks), it is usually located along the fuel line under the vehicle or in the engine bay',
      'Fuel filter replacement involves working with pressurized fuel - consider having a professional handle this service',
      'If fuel delivery issues are suspected (sputtering at high RPM, hard starting, loss of power), have the fuel system professionally diagnosed before assuming the filter is clogged',
    ],
    specialTools: ['Professional service recommended for most modern vehicles'],
    commonMistakes: [
      'Trying to locate an external fuel filter on a vehicle with an in-tank integrated filter/pump assembly',
      'Not relieving fuel system pressure before disconnecting fuel lines',
    ],
    verified: false,
  };
}

function generatePowerSteeringFluid(genData, make, model, genKey) {
  if (isEV(genData)) return null;

  const engine = (genData.engine || '').toLowerCase();
  // Most modern vehicles (2012+) use Electric Power Steering (EPS) - no fluid
  // Heavy trucks and some older platforms still use hydraulic
  const isHeavyTruck = /f-250|f-350|super duty|2500|3500/i.test(model);

  if (!isHeavyTruck) {
    return {
      stepHints: [
        'Most modern vehicles use Electric Power Steering (EPS) which has NO power steering fluid to change',
        'If your steering feels stiff or makes noise, it is likely an EPS motor or sensor issue - not a fluid problem',
        'Consult your owner\'s manual to confirm whether your vehicle has hydraulic or electric power steering',
      ],
      specialTools: [],
      commonMistakes: [
        'Looking for a power steering fluid reservoir on a vehicle with EPS - there is no fluid to check or change',
        'Attempting to add fluid to a system that does not use hydraulic fluid',
      ],
      verified: false,
    };
  }

  return {
    stepHints: [
      'This heavy-duty vehicle uses hydraulic power steering with serviceable fluid',
      'Locate the power steering fluid reservoir (usually on or near the power steering pump, driver side of engine)',
      'Check fluid level on dipstick - should be between MIN and MAX marks when fluid is at operating temperature',
      'To flush: use a turkey baster to remove old fluid from reservoir. Refill with correct specification fluid',
      'Turn steering wheel lock-to-lock several times to circulate new fluid through the system',
      'Repeat drain-and-fill process 2-3 times for a thorough fluid exchange',
      'Top off reservoir to proper level and check for leaks at pump, hoses, and rack connections',
    ],
    specialTools: [
      'Turkey baster or fluid transfer syringe',
      'Correct power steering fluid (check owner\'s manual - ATF, Mercon, or specific PS fluid)',
    ],
    commonMistakes: [
      'Using wrong power steering fluid type - different vehicles require different specifications',
      'Overfilling the reservoir - fluid expands when hot and will overflow',
      'Not turning steering lock-to-lock during flush - old fluid remains trapped in rack and lines',
    ],
    verified: false,
  };
}

function generateTimingBelt(genData, make, model, genKey) {
  if (isEV(genData)) return null;

  const engine = (genData.engine || '').toLowerCase();
  // Most modern engines use timing CHAINS (not belts) - they don't need regular replacement
  // Notable belt exceptions: some Subaru, some Kia/Hyundai, some older Honda/Toyota
  const likelyChain = /chain|direct injection|gdi|tsi|fsi|ecoboost|skyactiv|lt1|lt2|lt4|ls|hemi|pentastar|coyote|voodoo|boxer.*fa2|b48|n20|n55|b58/i.test(engine);

  if (likelyChain) {
    return {
      stepHints: [
        'This engine most likely uses a timing CHAIN, not a timing belt. Timing chains are designed to last the life of the engine under normal conditions',
        'Timing chain replacement is NOT a routine maintenance item - it is only needed if the chain stretches (causes rattling noise at startup or timing-related codes)',
        'If timing chain replacement is needed, it is a major engine service requiring professional disassembly - not a DIY job for most owners',
        'Keep up with oil changes - proper lubrication is critical for timing chain longevity. Skipped oil changes are the #1 cause of premature chain wear',
      ],
      specialTools: ['Professional service required if chain replacement is needed'],
      commonMistakes: [
        'Replacing a timing chain unnecessarily - chains rarely need replacement if oil changes are maintained',
        'Ignoring a rattling noise at cold startup - this can indicate chain stretch and should be inspected before it jumps timing',
      ],
      verified: false,
    };
  }

  // Vehicles that may actually use timing belts
  return {
    stepHints: [
      'Timing belt replacement is a MAJOR service - typically recommended every 60,000-105,000 miles depending on the engine',
      'This is NOT a DIY job for most owners - it requires significant engine disassembly, specialized tools, and precise timing alignment',
      'IMPORTANT: Many timing belt engines are "interference" designs - if the belt breaks, valves contact pistons causing catastrophic engine damage',
      'When replacing the timing belt, also replace the water pump, tensioner, and idler pulleys (they share the same service life)',
      'Have a qualified mechanic perform this service. Typical cost is $500-1,200 depending on the vehicle',
      'Verify your engine\'s replacement interval in the owner\'s manual - do NOT exceed the recommended mileage',
    ],
    specialTools: ['Professional service strongly recommended'],
    commonMistakes: [
      'Exceeding the timing belt replacement interval - a snapped belt on an interference engine destroys the engine',
      'Replacing only the belt and not the water pump/tensioner/idler - these components share the same service life and failing any one of them ruins the new belt',
      'Attempting as a DIY project without proper training - incorrect timing will cause the engine to run poorly or not at all',
    ],
    verified: false,
  };
}

function generateEVBatteryCheck(genData, make, model, genKey) {
  if (!isEV(genData) && !isHybrid(genData)) return null;

  const ev = isEV(genData);

  const stepHints = [
    `${ev ? 'EV' : 'Hybrid'} high-voltage battery health monitoring should be performed by a dealer or qualified EV technician with proper diagnostic equipment`,
    'Owner monitoring: check your vehicle\'s battery health display/app regularly. Most EVs and hybrids show State of Health (SoH) percentage',
    'Signs of battery degradation: noticeably reduced range (EV), reduced electric-only driving distance (hybrid), or battery-related warning lights',
  ];

  if (ev) {
    stepHints.push('Maintain battery health by: avoiding frequent DC fast charging (Level 3), not storing at 100% charge for extended periods, and keeping charge between 20-80% for daily use');
    stepHints.push('Extreme temperatures affect battery performance and longevity. If possible, park in a garage during extreme heat or cold');
    stepHints.push('Most EV batteries are warrantied for 8 years/100,000 miles (federal mandate). Check your specific warranty coverage');
  } else {
    stepHints.push('Hybrid batteries are designed to last 8-10+ years under normal driving conditions. The vehicle\'s battery management system handles charge cycling automatically');
    stepHints.push('If you notice the gas engine running more frequently or reduced fuel economy, have the hybrid battery system scanned for fault codes');
  }

  return {
    stepHints,
    specialTools: ['Dealer or qualified EV technician with manufacturer diagnostic tools'],
    commonMistakes: [
      'Attempting to service or open the high-voltage battery pack - this is LETHAL without proper training and equipment',
      'Ignoring battery warning lights or significant range loss - early diagnosis can sometimes address individual cell issues',
      `${ev ? 'Consistently charging to 100% for daily driving - this accelerates battery degradation' : 'Ignoring reduced fuel economy - may indicate hybrid battery degradation'}`,
    ],
    verified: false,
  };
}

// ─── Bulb Replacement ─────────────────────────────────────────────────

function generateBulbReplacement(genData, make, model, genKey) {
  const bulbs = genData.bulbs;
  if (!bulbs) return null;

  const isAllLED = bulbs.headlightLow === 'LED Module' && bulbs.headlightHigh === 'LED Module';
  const german = isGerman(make);

  const stepHints = [];
  stepHints.push('Identify which bulb needs replacement — check all exterior lights with the vehicle running and someone outside to confirm');

  if (isAllLED) {
    stepHints.push('This vehicle uses LED modules for headlights — these are not user-serviceable bulbs. If an LED headlight fails, the entire module or assembly must be replaced by a dealer or specialist');
  } else {
    stepHints.push(`Low beam bulb: ${bulbs.headlightLow}. High beam bulb: ${bulbs.headlightHigh || bulbs.headlightLow}. Access from behind the headlight housing in the engine bay`);
    stepHints.push('Turn the bulb socket counterclockwise to remove it from the housing. Pull the old bulb straight out of the socket');
    stepHints.push('Do NOT touch the glass of halogen bulbs with bare fingers — skin oils cause hot spots and premature failure. Use gloves or a clean cloth');
    stepHints.push('Insert the new bulb into the socket, align the tabs, and twist clockwise to lock into the housing');
  }

  if (bulbs.fogLight && bulbs.fogLight !== 'LED Module') {
    stepHints.push(`Fog light bulb: ${bulbs.fogLight}. Access from underneath the bumper or through the wheel well liner — may need to remove fasteners`);
  }

  if (bulbs.taillight && bulbs.taillight !== 'LED Module') {
    stepHints.push(`Tail/brake light bulb: ${bulbs.taillight || bulbs.brakeLight}. Remove the tail light assembly from inside the trunk/hatch (2-3 nuts or plastic fasteners)`);
  } else {
    stepHints.push('Tail lights use LED modules — if one fails, the entire tail light assembly must be replaced');
  }

  if (bulbs.frontTurnSignal && bulbs.frontTurnSignal !== 'LED Module') {
    stepHints.push(`Turn signal bulbs: Front ${bulbs.frontTurnSignal}, Rear ${bulbs.rearTurnSignal || bulbs.frontTurnSignal}. If turn signals flash rapidly (hyperflash), a bulb is burnt out`);
  }

  if (bulbs.reverseLight) {
    stepHints.push(`Reverse light: ${bulbs.reverseLight}. License plate light: ${bulbs.licensePlate || '194/168'}. Access through the trunk or hatch interior`);
  }

  stepHints.push('After replacement, test all lights: low beam, high beam, turn signals (both sides), brake lights, reverse, fog lights, and running lights');

  if (bulbs.notes) {
    stepHints.push(`Note: ${bulbs.notes}`);
  }

  const specialTools = ['Gloves (nitrile or cotton — do not touch halogen bulbs with bare skin)'];
  if (german) {
    specialTools.push('T20 or T25 Torx bit (for headlight housing access on some German vehicles)');
  }
  specialTools.push('Flat-head screwdriver or trim removal tool (for accessing some housings)');
  specialTools.push('Flashlight (to see inside the headlight housing area)');

  const commonMistakes = [
    'Touching halogen bulb glass with bare fingers — causes premature failure from oil deposits',
    'Forcing the bulb socket — if it does not turn easily, check alignment of the tabs',
    'Not testing all lights after replacement — always verify both sides and all functions',
    'Buying the wrong bulb size — double-check the owner\'s manual or the old bulb before purchasing',
  ];

  if (isAllLED) {
    commonMistakes.push('Attempting to replace individual LEDs in an LED module — the entire unit must be replaced as an assembly');
  } else {
    commonMistakes.push('Mixing halogen and LED bulbs without proper resistors — causes hyperflash on turn signals and may trigger warnings');
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
  air_filter: generateAirFilter,
  cabin_filter: generateCabinFilter,
  serpentine_belt: generateSerpentineBelt,
  battery: generateBattery,
  wiper_blades: generateWiperBlades,
  wheel_alignment: generateWheelAlignment,
  fuel_filter: generateFuelFilter,
  power_steering_fluid: generatePowerSteeringFluid,
  timing_belt: generateTimingBelt,
  ev_battery_check: generateEVBatteryCheck,
  bulb_replacement: generateBulbReplacement,
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
