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

const PROCEDURE_PATTERNS = Object.freeze([
  ['parasitic-draw', /\b(?:perform|run|do|conduct) (?:an? )?parasitic (?:draw|drain)(?: test)?\b|\b(?:measure|test|check|diagnose) (?:for )?(?:the )?parasitic (?:draw|drain)\b|\bcurrent draw test\b|\blow-current (?:dc )?clamp meter\b/i],
  ['battery-state-of-health', /\b(?:perform|run|do|conduct) (?:an? )?battery (?:state[- ]of[- ]health|conductance|cca|internal resistance) test\b|\btest (?:the )?battery(?:'s)? (?:state[- ]of[- ]health|conductance|cca|internal resistance)\b/i],
  ['smoke-test', /\b(?:perform|run|do|conduct|use) (?:an? )?(?:automotive )?smoke test\b|\bsmoke[- ]test (?:the )?(?:evap|intake|vacuum|exhaust|turbo|boost|system)\b|\buse (?:an? )?(?:automotive )?smoke machine\b/i],
  ['fuel-pressure', /\b(?:perform|run|do|conduct) (?:an? )?fuel[- ]pressure test\b|\b(?:check|measure|test) (?:the )?fuel pressure (?:with|using)\b|\b(?:connect|install|use) (?:an? )?fuel[- ]pressure (?:tester|gauge)\b/i],
  ['compression-test', /\b(?:perform|run|do|conduct) (?:an? )?(?:engine |cylinder )?compression test\b|\b(?:check|measure|test) (?:the )?(?:engine |cylinder )?compression (?:with|using)\b|\buse (?:an? )?compression tester\b/i],
  ['cooling-pressure-test', /\b(?:perform|run|do|conduct) (?:an? )?(?:cooling[- ]system|coolant|radiator) pressure test\b|\bpressure[- ]test (?:the )?(?:cooling system|radiator)\b|\buse (?:an? )?(?:cooling[- ]system|coolant|radiator) pressure tester\b/i],
  ['multimeter-basic', /\b(?:test|check|measure|verify|diagnose)[^.!?;]{0,80}\b(?:with|using) (?:an? )?(?:digital )?multimeter\b|\b(?:multimeter|voltmeter|ohmmeter) (?:check|test|measurement)\b|\buse (?:an? )?(?:digital )?(?:multimeter|voltmeter|ohmmeter)\b/i],
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
const NEGATION_BEFORE_ACTION = /\b(?:do not|don't|dont|never|avoid|must not|should not|cannot|can't|cant|without|there is no reason to|it is unnecessary to)\b[^.!?;]{0,80}\b(?:perform|run|do|conduct|use|connect|install|read|retrieve|scan|pull|test|check|measure|diagnose)\b/i;
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

function scannerToolIdForCodes(codes) {
  const normalized = [...new Set((Array.isArray(codes) ? codes : []).map((code) => String(code).trim()).filter(Boolean))];
  if (normalized.length === 0) return { toolId: null, families: [], reasonCode: 'scanner-capability-needs-code-or-module' };
  const families = normalized.map(codeFamilyOf);
  if (families.some((family) => family === null)) {
    return { toolId: null, families: families.filter(Boolean), reasonCode: 'manufacturer-code-capability-unverified' };
  }
  const unique = [...new Set(families)];
  return {
    toolId: unique.every((family) => family === 'P') ? 'ancel-ad310' : 'autel-mk808s',
    families: unique,
    reasonCode: 'dtc-family-capability-matched',
  };
}

function toolIdForProcedure(procedure, context = {}) {
  const toolId = PROCEDURE_TOOL_IDS[procedure] || null;
  if (!toolId) return { toolId: null, reasonCode: 'procedure-tool-unresolved' };
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
          const scanner = scannerToolIdForCodes(scannerCodes);
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
          const selected = toolIdForProcedure(procedure, context);
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
    const scanner = scannerToolIdForCodes([...codes, ...inlineCodes]);
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
  codeFamilyOf,
  diagnosticDispositionsForIssue,
  diagnosticProcedureIsNegated,
  inlineManufacturerCodes,
  proceduresInSolution,
  scannerToolIdForCodes,
  splitClauses,
  toolIdForProcedure,
};
