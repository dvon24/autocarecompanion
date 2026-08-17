/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Shared, conservative diagnostic-procedure recognition.
 *
 * This module stays plain JavaScript so the browser-facing diagnostic-tool
 * registry and the snapshot-only Node audit ledger use exactly the same
 * matcher. A tool is selected only when the article's own How-to-Fix names the
 * procedure. Broad symptom words ("low pressure", "blue smoke") are not
 * enough.
 */

const PROCEDURE_TOOL_IDS = Object.freeze({
  'vag-scan-codes': 'ross-tech-vcds-hex-v2',
  'parasitic-draw': 'dc-clamp-meter-low-current',
  'battery-state-of-health': 'battery-conductance-tester',
  'smoke-test': 'autoline-hypersmoke',
  'fuel-pressure': 'otc-5630-fuel-pressure',
  'compression-test': 'otc-5606-compression',
  'cooling-pressure-test': 'otc-6977-cooling-pressure',
  'multimeter-basic': 'fluke-15b-plus',
  'oil-pressure': 'otc-5610-oil-pressure',
});

/** Exact product-identity pages only; no search or category URLs. */
const TOOL_PRODUCT_URLS = Object.freeze({
  'ancel-ad310': 'https://www.amazon.com/ANCEL-AD310-Enhanced-Universal-Diagnostic/dp/B01G5EA74I?tag=au7o-20',
  'ross-tech-vcds-hex-v2': 'https://store.ross-tech.com/shop/vchv2_ent/',
  'autel-mk808s': 'https://www.amazon.com/Autel-Scanner-MaxiCOM-MK808S-Bi-Directional/dp/B094QTNWYQ?tag=au7o-20',
  'dc-clamp-meter-low-current': 'https://www.amazon.com/UNI-T-Digital-Handheld-Resistance-Capacitance/dp/B0188WD1NE?tag=au7o-20',
  'battery-conductance-tester': 'https://www.amazon.com/ANCEL-BA101-Professional-Automotive-Motorcycle/dp/B01M0ARG3X?tag=au7o-20',
  'autoline-hypersmoke': 'https://www.autolinepro.com/products/autoline-pro-hypersmoke-machine',
  'otc-5630-fuel-pressure': 'https://www.otctools.com/products/fuel-pressure-tester-kit',
  'otc-5606-compression': 'https://www.otctools.com/products/compression-tester-kit',
  'otc-6977-cooling-pressure': 'https://www.otctools.com/products/universal-cooling-system-pressure-test-kit',
  'fluke-15b-plus': 'https://www.fluke.com/en-us/product/electrical-testing/digital-multimeters/fluke-15b-plus',
  'otc-5610-oil-pressure': 'https://www.otctools.com/products/transmissionengine-oil-pressure-kit',
});

const TOOL_REVIEW_EVIDENCE = Object.freeze({
  'ancel-ad310': {
    manufacturerEvidenceUrl: 'https://www.ancel.com/products/ancel-ad310',
    capability: 'Generic OBD-II powertrain-code reading for canonical generic P-family DTCs.',
    restriction: 'Does not establish manufacturer-specific, body, chassis, network, hybrid/EV, or exact-vehicle compatibility.',
  },
  'ross-tech-vcds-hex-v2': {
    manufacturerEvidenceUrl: 'https://www.ross-tech.com/vcds/hex-v2.php',
    capability: 'Licensed VCDS interface for diagnostic-capable Volkswagen/Audi Group passenger cars, including manufacturer-specific control-module diagnostics.',
    restriction: 'Limited to supported VAG vehicles and VIN count; 1990-1994 applications require separate legacy/adapter review, and hybrid/EV coverage remains fail-closed here.',
  },
  'battery-conductance-tester': {
    manufacturerEvidenceUrl: 'https://www.ancel.com/products/ancel-ba101',
    capability: 'Battery state of health, CCA and internal-resistance analysis.',
    restriction: 'Not a true resistive battery load tester; load-test wording is an unresolved-tool hold.',
  },
  'dc-clamp-meter-low-current': {
    manufacturerEvidenceUrl: 'https://meters.uni-trend.com/product/ut210-series',
    capability: 'Low-current DC clamp measurement for explicit parasitic-draw procedures.',
    restriction: 'Not inferred from a parasitic-drain symptom alone.',
  },
  'autoline-hypersmoke': {
    manufacturerEvidenceUrl: 'https://www.autolinepro.com/products/autoline-pro-hypersmoke-machine',
    capability: 'Smoke testing for EVAP, vacuum, intake, exhaust and turbo/boost leaks, with a dedicated 0-1 psi EVAP mode.',
    restriction: 'Only shown when the How-to-Fix explicitly prescribes a smoke test.',
  },
  'otc-5630-fuel-pressure': {
    manufacturerEvidenceUrl: 'https://www.otctools.com/products/fuel-pressure-tester-kit',
    capability: '0-100 psi fuel-system pressure testing with a relief valve and brass fittings.',
    restriction: 'Requires proven compatible low-pressure gasoline application; suppressed for diesel, direct-injection high-pressure rail, flex-fuel and unknown engine context.',
  },
  'otc-5606-compression': {
    manufacturerEvidenceUrl: 'https://www.otctools.com/products/compression-tester-kit',
    capability: '0-300 psi compression testing on gasoline engines with 10, 12, 14 and 18 mm adapters.',
    restriction: 'Requires explicitly proven gasoline-engine context; suppressed for diesel, EV and unknown engine context.',
  },
  'otc-6977-cooling-pressure': {
    manufacturerEvidenceUrl: 'https://www.otctools.com/products/universal-cooling-system-pressure-test-kit',
    capability: 'Cooling-system pressure testing through supplied hose and cap adapters.',
    restriction: 'Owner must confirm an included adapter matches the vehicle before buying.',
  },
  'fluke-15b-plus': {
    manufacturerEvidenceUrl: 'https://www.fluke.com/en-us/product/electrical-testing/digital-multimeters/fluke-15b-plus',
    capability: 'AC/DC voltage and current, resistance, continuity, capacitance, frequency and diode tests.',
    restriction: 'Not a waveform scope and not inferred when the article does not explicitly prescribe a multimeter.',
  },
  'otc-5610-oil-pressure': {
    manufacturerEvidenceUrl: 'https://www.otctools.com/products/transmissionengine-oil-pressure-kit',
    capability: 'Mechanical engine/transmission oil-pressure testing with 0-100 psi and 0-400 psi gauges and 13 adapters.',
    restriction: 'Owner must confirm the correct engine-port adapter and factory pressure specification.',
  },
});

const PROCEDURE_PATTERNS = Object.freeze([
  ['vag-scan-codes', /\b(?:use|connect|scan with|diagnose with|check with|read with) (?:an? )?(?:ross-tech )?(?:vcds|vag-com)(?: scan tool| interface| cable)?\b|\b(?:test|check|measure|confirm|log)[^.!?;]{0,80}\b(?:with|using) (?:vcds|vag-com)\b|\b(?:vcds|vag-com) (?:scan|autoscan|auto-scan|fault-code scan|diagnostic scan)\b|\b(?:vag|factory)[- ]capable scan tool\b|\bscan (?:the )?(?:tcm|transmission control module|cluster module|address [0-9a-f]{2,4})\b/i],
  ['parasitic-draw', /\b(?:perform(?:ing)?|run(?:ning)?|do(?:ing)?|conduct(?:ing)?) (?:an? )?parasitic (?:draw|drain)(?: test)?\b|\b(?:measure|test|check|diagnose) (?:for )?(?:the )?parasitic (?:draw|drain)\b|\bparasitic (?:draw|drain) (?:test|measurement)\b|\bcurrent draw test\b|\blow-current (?:dc )?clamp meter\b/i],
  ['battery-state-of-health', /\b(?:perform|run|do|conduct) (?:an? )?battery (?:state[- ]of[- ]health|conductance|cca|internal resistance) test\b|\bbattery (?:state[- ]of[- ]health|conductance|cca|internal resistance) testing\b|\btest (?:the )?battery(?:'s)? (?:state[- ]of[- ]health|conductance|cca|internal resistance)\b/i],
  ['smoke-test', /\b(?:perform|run|do|conduct|use) (?:an? )?(?:automotive )?smoke test\b|\bsmoke[- ]test (?:the )?(?:evap|intake|vacuum|exhaust|turbo|boost|system)\b|\buse (?:an? )?(?:automotive )?smoke machine\b/i],
  ['fuel-pressure', /\b(?:perform|run|do|conduct) (?:an? )?fuel[- ]pressure test\b|\b(?:check|measure|test) (?:the )?fuel pressure (?:with|using)\b|\b(?:connect|install|use) (?:an? )?fuel[- ]pressure (?:tester|gauge)\b/i],
  ['compression-test', /\b(?:perform|run|do|conduct) (?:an? )?(?:engine |cylinder )?compression test\b|\b(?:check|measure|test) (?:the )?(?:engine |cylinder )?compression (?:with|using)\b|\buse (?:an? )?compression tester\b/i],
  ['cooling-pressure-test', /\b(?:perform|run|do|conduct) (?:an? )?(?:cooling[- ]system|coolant|radiator) pressure test\b|\bpressure[- ]test (?:the )?(?:cooling system|radiator)\b|\b(?:cooling[- ]system|coolant system|radiator)[^.!?;]{0,90}\b(?:pressure[- ]tested|pressure[- ]test the system)\b|\buse (?:an? )?(?:cooling[- ]system|coolant|radiator) pressure tester\b/i],
  ['multimeter-basic', /\b(?:test|check|measure|verify|diagnose)[^.!?;]{0,80}\b(?:with|using) (?:an? )?(?:digital )?multimeter\b|\b(?:connect|attach) (?:an? )?(?:digital )?(?:multimeter|voltmeter|ohmmeter)\b|\b(?:multimeter|voltmeter|ohmmeter) (?:check|test|measurement)\b|\buse (?:an? )?(?:digital )?(?:multimeter|voltmeter|ohmmeter)\b/i],
  ['oil-pressure', /\b(?:perform|run|do|conduct) (?:an? )?(?:mechanical )?oil[- ]pressure test\b|\b(?:check|measure|test) (?:the )?oil pressure (?:with|using)\b|\b(?:connect|install|use) (?:an? )?(?:mechanical )?oil[- ]pressure (?:tester|gauge)\b|\boil[- ]pressure gauge (?:will|can) confirm\b/i],
  ['scan-codes', /\b(?:use|connect|diagnose with) (?:an? )?(?:scan tool|scanner)\b|\b(?:check|read|retrieve|scan for|pull) (?:for )?(?:the )?(?:(?:honda|acura|manufacturer(?:-specific)?) )?(?:stored )?(?:fault )?(?:code|codes|dtc|dtcs)\b/i],
]);

const EXCLUDED_TOOL_CLAUSE = /\b(?:not|no|never|without|avoid|cannot|unnecessar\w*)\b|\b[a-z]+n['’]t\b|\b(?:dont|isnt|cant|mustnt|shouldnt|wouldnt|wont|neednt)\b|\b(?:dealer|dealership|shop|technician|mechanic|garage|professional|specialist|repair facility|service cent(?:er|re))\b/i;
const DELEGATED = /\b(?:dealer|dealership|shop|technician|mechanic|garage|professional|specialist|repair facility|service cent(?:er|re))\b/i;
const NEGATED = /\b(?:do not|don['’]?t|never|avoid|must not|should not|isn['’]?t needed|not required|not recommended|unnecessary)\b/i;
const INSTRUCTION = /\b(?:test|tested|testing|check|checked|checking|inspect|inspected|inspecting|inspection|monitor|monitored|monitoring|diagnos\w*|scan|read|retrieve|verify|confirm|road[- ]test|look|listen|feel)\b|\bpull (?:the )?(?:stored )?(?:fault )?(?:codes|dtcs)\b|\b(?:multimeter|voltmeter|ohmmeter|gauge|tester|scan tool|scanner)\b/i;
const OBSERVATION_ONLY = /\b(?:inspect|inspected|inspecting|inspection|monitor|monitored|monitoring|look|listen|feel|road[- ]test|check|checked|checking|verify|confirm)\b/i;
const NON_DIAGNOSTIC_IDIOM = /\b(?:preventive measure|discipline check)\b/i;

function splitClauses(solution) {
  return String(solution || '')
    .replace(/\s+/g, ' ')
    .split(/(?<=[.;!?])\s+|\n+/)
    .map((clause) => clause.trim())
    .filter(Boolean);
}

function matchedProceduresInClause(clause) {
  return PROCEDURE_PATTERNS
    .filter(([, pattern]) => pattern.test(clause))
    .map(([procedure]) => procedure);
}

const DIAGNOSTIC_ACTION = /\b(?:perform|run|do|conduct|use|connect|install|read|retrieve|scan|pull|test|check|measure|diagnose|multimeter|voltmeter|ohmmeter|scanner|scan tool|gauge|tester|meter)\b/i;
const NEGATION_BEFORE_ACTION = /\b(?:(?:do not|don't|dont|never|avoid|must not|should not|cannot|can't|cant|without)\s+(?:directly\s+)?|there is no reason to\s+|it is unnecessary to\s+)(?:perform|run|do|conduct|use|connect|install|read|retrieve|scan|pull|test|check|measure|diagnose)\b/i;
const NEGATION_AFTER_ACTION = /\b(?:test|check|measurement|procedure|multimeter|voltmeter|ohmmeter|scanner|scan tool|gauge|tester|meter)\b[^.!?;]{0,50}\b(?:is|are|was|were|would be|will be|should be|must be)?\s*(?:not required|not recommended|not needed|unnecessary|not appropriate|should not be used|must not be used|should not be connected|isn't needed|isnt needed|won't be needed|wont be needed|wouldn't be appropriate|wouldnt be appropriate|needn't be used|neednt be used)\b/i;

function diagnosticProcedureIsNegated(clause) {
  return DIAGNOSTIC_ACTION.test(clause)
    && (NEGATION_BEFORE_ACTION.test(clause) || NEGATION_AFTER_ACTION.test(clause));
}

function inlineManufacturerCodes(solution) {
  const codes = [];
  const pattern = /\b(honda|acura|manufacturer(?:-specific)?)\s+(?:code|dtc)\s*[:#-]?\s*([a-z]?\d{1,5})\b/ig;
  for (const match of String(solution || '').matchAll(pattern)) {
    codes.push(`${match[1].toUpperCase()}:${match[2].toUpperCase()}`);
  }
  return [...new Set(codes)];
}

function proceduresInSolution(solution) {
  const clauses = splitClauses(solution);
  return PROCEDURE_PATTERNS
    .filter(([, pattern]) => clauses.some((clause) => pattern.test(clause)
      && !DELEGATED.test(clause) && !diagnosticProcedureIsNegated(clause)))
    .map(([procedure]) => procedure);
}

function codeFamilyOf(code) {
  const normalized = String(code || '').trim().toUpperCase();
  return /^[PBCU][0-3][0-9A-F]{3}$/.test(normalized) ? normalized[0] : null;
}

function diagnosticEraForYears(years) {
  const selected = (Array.isArray(years) ? years : []).filter(Number.isInteger);
  if (selected.length === 0) return 'unknown';
  const hasObd1 = selected.some((year) => year < 1996);
  const hasObd2 = selected.some((year) => year >= 1996);
  if (hasObd1 && hasObd2) return 'mixed';
  return hasObd1 ? 'obd1' : 'obd2';
}

function supportedVagContext(context = {}) {
  const make = String(context.make || '').trim().toLowerCase();
  const years = (context.years || []).filter(Number.isInteger);
  return /^(?:audi|volkswagen|vw)$/.test(make)
    && years.length > 0
    && years.every((year) => year >= 1995);
}

function hybridOrElectricContext(context = {}) {
  return (context.engines || [])
    .map((engine) => String(engine).toLowerCase())
    .some((engine) => /\b(?:hybrid|phev|electric|bev|ev|fuel cell)\b/.test(engine));
}

function scannerToolIdForCodes(codes, context = {}) {
  const normalized = [...new Set((Array.isArray(codes) ? codes : []).map((code) => String(code).trim()).filter(Boolean))];
  const diagnosticEra = diagnosticEraForYears(context.years);
  if (normalized.length === 0) {
    if (diagnosticEra === 'obd1') return { toolId: null, families: [], reasonCode: 'pre-obd2-reader-incompatible' };
    if (diagnosticEra === 'mixed') return { toolId: null, families: [], reasonCode: 'mixed-obd-era-requires-year' };
    return { toolId: null, families: [], reasonCode: 'scanner-capability-needs-code-or-module' };
  }
  const families = normalized.map(codeFamilyOf);
  const canonicalCodes = normalized.map((code) => code.toUpperCase());
  const reviewedVagContext = supportedVagContext(context);
  const hybridOrElectricApplication = hybridOrElectricContext(context);
  const hybridOrElectricCode = canonicalCodes.some((code) => /^P0[A-F]/.test(code));
  const requiresVagCapability = reviewedVagContext && (
    families.some((family) => family === null || family !== 'P')
    || canonicalCodes.some((code) => code[0] === 'P' && /[13]/.test(code[1]))
  );
  if (!requiresVagCapability && diagnosticEra === 'obd1') {
    return { toolId: null, families: families.filter(Boolean), reasonCode: 'pre-obd2-reader-incompatible' };
  }
  if (!requiresVagCapability && diagnosticEra === 'mixed') {
    return { toolId: null, families: families.filter(Boolean), reasonCode: 'mixed-obd-era-requires-year' };
  }
  if (hybridOrElectricApplication || hybridOrElectricCode) {
    return { toolId: null, families: [...new Set(families)], reasonCode: 'hybrid-ev-scanner-capability-unverified' };
  }
  if (families.some((family) => family === null)) {
    if (reviewedVagContext) {
      return { toolId: 'ross-tech-vcds-hex-v2', families: families.filter(Boolean), reasonCode: 'vag-manufacturer-code-capability-matched' };
    }
    return { toolId: null, families: families.filter(Boolean), reasonCode: 'manufacturer-code-capability-unverified' };
  }
  if (canonicalCodes.some((code) => code[0] === 'P' && /[13]/.test(code[1]))) {
    if (reviewedVagContext) {
      return { toolId: 'ross-tech-vcds-hex-v2', families: [...new Set(families)], reasonCode: 'vag-manufacturer-code-capability-matched' };
    }
    return { toolId: null, families: [...new Set(families)], reasonCode: 'manufacturer-code-capability-unverified' };
  }
  const unique = [...new Set(families)];
  if (unique.some((family) => family !== 'P')) {
    if (supportedVagContext(context)) {
      return { toolId: 'ross-tech-vcds-hex-v2', families: unique, reasonCode: 'vag-control-module-capability-matched' };
    }
    return { toolId: null, families: unique, reasonCode: 'non-powertrain-module-capability-unverified' };
  }
  return {
    toolId: 'ancel-ad310',
    families: unique,
    reasonCode: 'dtc-family-capability-matched',
  };
}

function toolIdForProcedure(procedure, context = {}) {
  const toolId = PROCEDURE_TOOL_IDS[procedure] || null;
  if (!toolId) return { toolId: null, reasonCode: 'procedure-tool-unresolved' };
  if (toolId === 'ross-tech-vcds-hex-v2') {
    return supportedVagContext(context) && !hybridOrElectricContext(context)
      ? { toolId, reasonCode: 'explicit-vag-procedure-tool-matched' }
      : { toolId: null, reasonCode: hybridOrElectricContext(context)
        ? 'hybrid-ev-scanner-capability-unverified'
        : 'vag-vehicle-context-unproven' };
  }
  const engines = (context.engines || []).map((engine) => String(engine).toLowerCase());
  if (toolId === 'otc-5606-compression') {
    const provenGasoline = engines.length > 0
      && engines.every((engine) => /\b(?:gasoline|petrol|spark[- ]ignition)\b/.test(engine))
      && engines.every((engine) => !/\b(?:diesel|tdi|turbodiesel|electric|bev|fuel cell)\b/.test(engine));
    return provenGasoline
      ? { toolId, reasonCode: 'explicit-procedure-tool-matched' }
      : { toolId: null, reasonCode: 'gasoline-compression-application-unproven' };
  }
  if (toolId === 'otc-5630-fuel-pressure') {
    const provenLowPressureGasoline = engines.length > 0
      && engines.every((engine) => /\b(?:gasoline|petrol|port[- ]injection|carburet)/.test(engine))
      && engines.every((engine) => !/\b(?:diesel|tdi|turbodiesel|direct[- ]injection|gdi|fsi|flex[- ]fuel|e85)\b/.test(engine));
    return provenLowPressureGasoline
      ? { toolId, reasonCode: 'explicit-procedure-tool-matched' }
      : { toolId: null, reasonCode: 'low-pressure-gasoline-application-unproven' };
  }
  return { toolId, reasonCode: 'explicit-procedure-tool-matched' };
}

/**
 * Produce an auditable disposition for every diagnostic instruction found in
 * the article plus one disposition for its DTC set. "procedure-no-tool" is an
 * intentional no-commerce result; "unresolved-tool-hold" means the wording
 * asks for an instrument but the catalog cannot safely select one.
 */
function diagnosticDispositionsForIssue(solution, dtcCodes, context = {}) {
  const dispositions = [];
  const inlineCodes = inlineManufacturerCodes(solution);
  const scannerCodes = [...(Array.isArray(dtcCodes) ? dtcCodes : []), ...inlineCodes];
  for (const clause of splitClauses(solution)) {
    if (!INSTRUCTION.test(clause) || NON_DIAGNOSTIC_IDIOM.test(clause)) continue;
    const matched = matchedProceduresInClause(clause);

    if (diagnosticProcedureIsNegated(clause)) {
      dispositions.push({
        source: 'solution',
        status: 'procedure-no-tool',
        procedure: 'prohibited-or-negated-test',
        toolId: null,
        productUrl: null,
        reasonCode: 'article-prohibits-tool-recommendation',
        excerpt: clause,
      });
      continue;
    }
    if (DELEGATED.test(clause)) {
      dispositions.push({
        source: 'solution',
        status: 'procedure-no-tool',
        procedure: 'professional-or-dealer-test',
        toolId: null,
        productUrl: null,
        reasonCode: 'article-delegates-procedure',
        excerpt: clause,
      });
      continue;
    }

    if (matched.length > 0) {
      for (const procedure of matched) {
        if (procedure === 'scan-codes') {
          const scanner = scannerToolIdForCodes(scannerCodes, context);
          dispositions.push({
            source: 'solution',
            status: scanner.toolId ? 'tool-linked' : 'unresolved-tool-hold',
            procedure,
            toolId: scanner.toolId,
            productUrl: scanner.toolId ? TOOL_PRODUCT_URLS[scanner.toolId] : null,
            reasonCode: scanner.reasonCode,
            excerpt: clause,
          });
        } else {
          const codeSelection = procedure === 'vag-scan-codes' && scannerCodes.length > 0
            ? scannerToolIdForCodes(scannerCodes, context)
            : null;
          const selected = codeSelection && !codeSelection.toolId
            ? codeSelection
            : toolIdForProcedure(procedure, context);
          dispositions.push({
            source: 'solution',
            status: selected.toolId ? 'tool-linked' : 'unresolved-tool-hold',
            procedure,
            toolId: selected.toolId,
            productUrl: selected.toolId ? TOOL_PRODUCT_URLS[selected.toolId] : null,
            reasonCode: selected.reasonCode,
            excerpt: clause,
          });
        }
      }
      continue;
    }

    if (OBSERVATION_ONLY.test(clause)) {
      dispositions.push({
        source: 'solution',
        status: 'procedure-no-tool',
        procedure: 'inspection-or-monitoring',
        toolId: null,
        productUrl: null,
        reasonCode: 'article-prescribes-observation-not-instrument',
        excerpt: clause,
      });
    } else {
      dispositions.push({
        source: 'solution',
        status: 'unresolved-tool-hold',
        procedure: 'unresolved-diagnostic-instruction',
        toolId: null,
        productUrl: null,
        reasonCode: 'instruction-does-not-identify-safe-tool',
        excerpt: clause,
      });
    }
  }

  const codes = [...new Set((Array.isArray(dtcCodes) ? dtcCodes : []).map((code) => String(code).trim()).filter(Boolean))];
  if (codes.length > 0) {
    const scanner = scannerToolIdForCodes([...codes, ...inlineCodes], context);
    dispositions.push({
      source: 'dtcCodes',
      status: scanner.toolId ? 'tool-linked' : 'unresolved-tool-hold',
      procedure: 'scan-codes',
      toolId: scanner.toolId,
      productUrl: scanner.toolId ? TOOL_PRODUCT_URLS[scanner.toolId] : null,
      reasonCode: scanner.reasonCode,
      excerpt: codes.join(', '),
    });
  }
  return dispositions;
}

module.exports = {
  PROCEDURE_PATTERNS,
  PROCEDURE_TOOL_IDS,
  TOOL_PRODUCT_URLS,
  TOOL_REVIEW_EVIDENCE,
  codeFamilyOf,
  diagnosticEraForYears,
  diagnosticDispositionsForIssue,
  diagnosticProcedureIsNegated,
  inlineManufacturerCodes,
  proceduresInSolution,
  scannerToolIdForCodes,
  splitClauses,
  toolIdForProcedure,
};
