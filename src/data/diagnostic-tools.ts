/**
 * Diagnostic tools recommended by CAPABILITY, not by price tier.
 *
 * WHY THIS REPLACES A FLAT TIER LIST
 * ----------------------------------
 * The previous list showed the same four scanners on every DTC page, ordered by
 * price. On 840 of 3,197 code pages (26%) the "budget pick" physically cannot
 * read the code the page is about: a basic OBD-II reader polls POWERTRAIN (P)
 * codes only, while U (network), B (body) and C (chassis) codes need a scanner
 * that talks to the other modules. Recommending a $20 reader for a U1000 is
 * selling someone a tool that will show them nothing.
 *
 * So eligibility is a capability question — `codeFamilies` for scanners,
 * `procedures` for everything else — and price is only how we order what is
 * already known to work.
 *
 * ON THE HONESTY OF THE CLAIM
 * ---------------------------
 * A fix PART claims "this repairs your car" and has to earn that through
 * catalog fitment plus human approval of repair role. A TOOL claims only "this
 * is what the procedure requires", which needs no fitment and no vehicle match.
 * The two must not share a field, or a tool inherits a repair claim it never
 * earned.
 *
 * LINKS
 * -----
 * Every `productUrl` is a product-identity URL that passed the same five gates
 * as a part link (shape / live / soft-404 / part-or-product-name-on-page /
 * vendor) via scripts/audit-web-part-links.js. Search URLs are NOT acceptable
 * here — `https://www.amazon.com/s?k=...` was what the old list used, and it is
 * exactly the shape isKnownIssueProductUrl rejects on the parts side.
 */

export type ScannerTier = 'budget' | 'midrange' | 'advanced' | 'professional';

/** First character of a DTC. P = powertrain, B = body, C = chassis, U = network. */
export type CodeFamily = 'P' | 'B' | 'C' | 'U';

/** Procedures a known-issue solution can call for, matched from its own wording. */
export type Procedure =
  | 'scan-codes'
  | 'parasitic-draw'
  | 'battery-state-of-health'
  | 'smoke-test'
  | 'fuel-pressure'
  | 'compression-test'
  | 'cooling-pressure-test'
  | 'multimeter-basic';

export type ToolKind = 'scanner' | 'meter' | 'tester';

export interface DiagnosticTool {
  id: string;
  kind: ToolKind;
  name: string;
  brand: string;
  priceRange: string;
  /** Sort key within an eligible set. Approximate street price, USD. */
  priceAnchor: number;
  description: string;
  features: string[];
  /** Which DTC families this tool can actually read. Empty for non-scanners. */
  codeFamilies: CodeFamily[];
  /** Which procedures this tool performs. */
  procedures: Procedure[];
  tier: ScannerTier;
  /**
   * Product-identity URL, audited. Null means we have not verified a link yet
   * and the tool MUST NOT be rendered with a buy button — naming a tool without
   * a link is honest; linking one we have not checked is not.
   */
  productUrl: string | null;
}

export const diagnosticTools: DiagnosticTool[] = [
  {
    id: 'ancel-ad310',
    kind: 'scanner',
    name: 'ANCEL AD310 Classic OBD-II Scanner',
    brand: 'ANCEL',
    priceRange: '$20–$40',
    priceAnchor: 30,
    description:
      'A simple code reader for engine (P) codes on many compatible OBD-II vehicles. It does not support every vehicle or hybrid/EV application, and it does NOT read body, chassis or network codes; confirm exact-vehicle compatibility before buying.',
    features: [
      'Read & clear engine (P) codes',
      'View freeze frame data',
      'I/M readiness status',
      'No batteries or app needed',
    ],
    codeFamilies: ['P'],
    procedures: ['scan-codes'],
    tier: 'budget',
    productUrl: 'https://www.amazon.com/ANCEL-AD310-Enhanced-Universal-Diagnostic/dp/B01G5EA74I?tag=au7o-20',
  },
  {
    id: 'bluedriver-pro',
    kind: 'scanner',
    name: 'BlueDriver Pro Bluetooth Scanner',
    brand: 'BlueDriver',
    priceRange: '$90–$120',
    priceAnchor: 105,
    description:
      'Bluetooth scanner with a companion app that reads beyond the engine module — ABS, SRS and transmission — plus manufacturer-specific codes on many vehicles.',
    features: [
      'Enhanced diagnostics (ABS, SRS, transmission)',
      'Repair Reports with verified fixes',
      'Smog check readiness',
      'Free app (iOS & Android)',
    ],
    // Enhanced coverage is vehicle-specific. Treat only generic powertrain as
    // guaranteed here; the UI must not promise body/chassis/network coverage.
    codeFamilies: ['P'],
    procedures: ['scan-codes'],
    tier: 'midrange',
    productUrl: 'https://www.amazon.com/BlueDriver-Bluetooth-Professional-iPhone-Android/dp/B00652G4TS?tag=au7o-20',
  },
  {
    id: 'launch-crp123x',
    kind: 'scanner',
    name: 'LAUNCH CRP123X V3.0 Elite OBD-II Scanner',
    brand: 'LAUNCH',
    priceRange: '$180–$230',
    priceAnchor: 205,
    description:
      'Handheld scanner covering the four major systems (engine, transmission, ABS, SRS) with live data streaming and graphing.',
    features: [
      'Engine, transmission, ABS, SRS diagnostics',
      'Live data stream & graphing',
      'AutoVIN for vehicle identification',
      'Free lifetime updates via Wi-Fi',
    ],
    // Four named modules are not equivalent to every B/C/U module. Keep the
    // conservative generic guarantee and require a true all-system tool below
    // for non-powertrain families.
    codeFamilies: ['P'],
    procedures: ['scan-codes'],
    tier: 'advanced',
    productUrl: 'https://www.amazon.com/CRP123X-Lifetime-Calibration-Throttle-Diagnostic/dp/B07RLF8FBC?tag=au7o-20',
  },
  {
    id: 'autel-mk808s',
    kind: 'scanner',
    name: 'Autel MaxiCOM MK808S Diagnostic Tool',
    brand: 'Autel',
    priceRange: '$350–$450',
    priceAnchor: 400,
    description:
      'Shop-level tablet with all-system coverage and bi-directional control, so you can command a module rather than only read it.',
    features: [
      'All-system diagnostics (25+ modules)',
      'Bi-directional control & active tests',
      'Oil reset, EPB, BMS, TPMS, injector coding',
      '7-inch touchscreen with Android OS',
    ],
    codeFamilies: ['P', 'B', 'C', 'U'],
    procedures: ['scan-codes'],
    tier: 'professional',
    productUrl: 'https://www.amazon.com/Autel-Scanner-MaxiCOM-MK808S-Bi-Directional/dp/B094QTNWYQ?tag=au7o-20',
  },
  {
    /**
     * The tool the Murano parasitic-draw procedure actually needs, and the one
     * most guides get wrong. A multimeter measures draw IN SERIES, which means
     * breaking the circuit — that wakes every module and restarts the sleep
     * timers you are trying to measure, so you chase a number that is not real.
     * A low-current clamp reads the cable without disconnecting anything.
     */
    id: 'dc-clamp-meter-low-current',
    kind: 'meter',
    name: 'UNI-T UT210E Low-Current DC Clamp Meter',
    brand: 'UNI-T',
    priceRange: '$40–$70',
    priceAnchor: 55,
    description:
      'Measures parasitic draw without breaking the circuit. This matters: disconnecting a battery cable to insert a meter wakes the modules and resets their sleep timers, so an in-series reading on a "sleeping" car is often meaningless.',
    features: [
      '1 mA resolution on the 2 A range — a 0.1 A meter reads a 50 mA drain as zero',
      'No need to disconnect the battery cable',
      'Modules stay asleep, so the reading is real',
      'Also reads DC volts for voltage-drop testing',
    ],
    codeFamilies: [],
    procedures: ['parasitic-draw', 'multimeter-basic'],
    tier: 'midrange',
    productUrl: 'https://www.amazon.com/UNI-T-Digital-Handheld-Resistance-Capacitance/dp/B0188WD1NE?tag=au7o-20',
  },
  {
    id: 'battery-conductance-tester',
    kind: 'tester',
    name: 'ANCEL BA101 Battery & Charging System Tester',
    brand: 'ANCEL',
    priceRange: '$30–$60',
    priceAnchor: 45,
    description:
      'Tests state of health, not just voltage. A battery that has been deep-cycled by months of parasitic draw can still read 12.6V at rest and still fail under load.',
    features: [
      'State-of-health and CCA measurement',
      'Charging-system and starter-draw tests',
      'Catches a failing battery a voltmeter calls good',
    ],
    codeFamilies: [],
    procedures: ['battery-state-of-health'],
    tier: 'budget',
    productUrl: 'https://www.amazon.com/ANCEL-BA101-Professional-Automotive-Motorcycle/dp/B01M0ARG3X?tag=au7o-20',
  },
];

/** Scanners that can actually read the given code family, cheapest first. */
export function scannersForCodeFamily(family: CodeFamily): DiagnosticTool[] {
  return diagnosticTools
    .filter((t) => t.kind === 'scanner' && t.codeFamilies.includes(family))
    .sort((a, b) => a.priceAnchor - b.priceAnchor);
}

/** Scanners that support every required family, cheapest first. */
export function scannersForCodeFamilies(families: CodeFamily[]): DiagnosticTool[] {
  const required = [...new Set(families)];
  if (required.length === 0) return [];
  return diagnosticTools
    .filter((t) => t.kind === 'scanner' && required.every((family) => t.codeFamilies.includes(family)))
    .sort((a, b) => a.priceAnchor - b.priceAnchor);
}

/** The code family of a canonical five-character OBD DTC. */
export function codeFamilyOf(code: string): CodeFamily | null {
  const normalized = String(code || '').trim().toUpperCase();
  if (!/^[PBCU][0-3][0-9A-F]{3}$/.test(normalized)) return null;
  // Family-level coverage does not prove access to a manufacturer-specific
  // controller. Standard P0/P2 and B0/C0/U0 ranges are safe at this level;
  // exact OEM ranges remain unknown until a tool proves module coverage.
  const family = normalized[0] as CodeFamily;
  const range = normalized[1];
  if (family === 'P') return range === '0' || range === '2' ? family : null;
  return range === '0' ? family : null;
}

/**
 * Procedures a solution calls for, read from its own wording. Deliberately
 * conservative: an unmatched solution surfaces no tool rather than a guess.
 */
const PROCEDURE_PATTERNS: Array<[Procedure, RegExp]> = [
  ['parasitic-draw', /\b(?:perform|run|do|conduct) (?:an? )?parasitic (?:draw|drain)(?: test)?\b|\b(?:measure|test|check|diagnose) (?:for )?(?:the )?parasitic (?:draw|drain)\b|\bcurrent draw test\b|\blow-current (?:dc )?clamp meter\b/i],
  ['battery-state-of-health', /\b(?:perform|run|do|conduct) (?:an? )?battery (?:state[- ]of[- ]health|conductance|cca|internal resistance) test\b|\btest (?:the )?battery (?:state[- ]of[- ]health|conductance|cca|internal resistance)\b/i],
  // Unsupported procedures intentionally have no matcher until a verified tool
  // exists. Recognizing them while rendering nothing creates false coverage.
  ['scan-codes', /\b(?:use|connect|diagnose with) (?:an? )?(?:scan tool|scanner)\b|\bdiagnos(?:e|ing)\b[^.;!?]{0,80}\bwith (?:an? )?(?:scan tool|scanner)\b|\b(?:read|retrieve|scan for) (?:the )?(?:stored )?(?:fault )?codes\b/i],
];

export function proceduresInSolution(solution: string): Procedure[] {
  const text = String(solution || '');
  const clauses = text.split(/(?<=[.;!?])\s+|\n+/).map((clause) => clause.trim()).filter(Boolean);
  const excluded = /\b(?:not|no|never|without|avoid|cannot|unnecessar\w*)\b|\b[a-z]+n['’]t\b|\b(?:dont|isnt|cant|mustnt|shouldnt|wouldnt|wont|neednt)\b|\b(?:dealer|dealership|shop|technician|mechanic|garage|professional|specialist|repair facility|service cent(?:er|re))\b/i;
  return PROCEDURE_PATTERNS
    .filter(([, re]) => clauses.some((clause) => re.test(clause) && !excluded.test(clause)))
    .map(([p]) => p);
}

/** Tools for a set of procedures, cheapest first, deduped. */
export function toolsForProcedures(procedures: Procedure[], families: CodeFamily[] = []): DiagnosticTool[] {
  const wanted = new Set(procedures);
  return diagnosticTools
    .filter((t) => {
      if (!t.procedures.some((p) => wanted.has(p))) return false;
      if (t.kind !== 'scanner') return true;
      return families.length > 0 && families.every((family) => t.codeFamilies.includes(family));
    })
    .sort((a, b) => a.priceAnchor - b.priceAnchor);
}

export interface IssueDiagnosticToolSelection {
  tools: DiagnosticTool[];
  procedures: Procedure[];
  families: CodeFamily[];
  hasUnknownCode: boolean;
}

/**
 * Select diagnostic commerce from the prescribed action, never from a DTC by
 * itself. Codes narrow an explicit scan procedure to compatible tool families;
 * they do not create that procedure.
 */
export function diagnosticToolsForIssue(
  solution: string,
  dtcCodes?: string[] | null,
): IssueDiagnosticToolSelection {
  const procedures = proceduresInSolution(solution);
  const codes = (dtcCodes || []).map((code) => String(code).trim()).filter(Boolean);
  const parsedFamilies = codes.map(codeFamilyOf);
  const hasUnknownCode = parsedFamilies.some((family) => family === null);
  const families = [...new Set(
    parsedFamilies.filter((family): family is CodeFamily => family !== null),
  )];

  return {
    procedures,
    families,
    hasUnknownCode,
    tools: toolsForProcedures(procedures, hasUnknownCode ? [] : families),
  };
}
