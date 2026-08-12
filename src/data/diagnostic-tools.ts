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
  | 'multimeter-basic'
  | 'oil-pressure';

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
    procedures: ['parasitic-draw'],
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
  {
    id: 'autoline-hypersmoke',
    kind: 'tester',
    name: 'AutoLine Pro HyperSmoke Automotive Smoke Machine',
    brand: 'AutoLine Pro',
    priceRange: '$60–$150',
    priceAnchor: 70,
    description:
      'A direct-from-manufacturer smoke machine for leak tests explicitly prescribed by an article. Its EVAP mode is regulated to 0–1 PSI; higher-pressure modes are for intake, exhaust and boost diagnostics, not sealed EVAP systems.',
    features: [
      'Smoke-tests EVAP, vacuum, intake and exhaust leaks',
      'Dedicated 0–1 PSI EVAP mode',
      'Built-in compressor and 12 V power',
    ],
    codeFamilies: [],
    procedures: ['smoke-test'],
    tier: 'midrange',
    productUrl: 'https://www.autolinepro.com/products/autoline-pro-hypersmoke-machine',
  },
  {
    id: 'otc-5630-fuel-pressure',
    kind: 'tester',
    name: 'OTC 5630 Fuel Pressure Tester Kit',
    brand: 'OTC Tools',
    priceRange: 'See retailer',
    priceAnchor: 90,
    description:
      'A 0–100 psi mechanical tester for gasoline fuel-system pressure checks. It is not a diesel, flex-fuel or direct-injection high-pressure-rail tester; the article must explicitly call for a compatible fuel-pressure test.',
    features: [
      '0–100 psi / 0–700 kPa gauge',
      'Pressure-relief valve and brass fittings',
      'For compatible low-pressure gasoline fuel systems',
    ],
    codeFamilies: [],
    procedures: ['fuel-pressure'],
    tier: 'midrange',
    productUrl: 'https://www.otctools.com/products/fuel-pressure-tester-kit',
  },
  {
    id: 'otc-5606-compression',
    kind: 'tester',
    name: 'OTC 5606 Compression Tester Kit',
    brand: 'OTC Tools',
    priceRange: 'See retailer',
    priceAnchor: 130,
    description:
      'A gasoline-engine compression tester with 10, 12, 14 and 18 mm adapters. It must not be presented for diesel compression or as a substitute for a cylinder leak-down test.',
    features: [
      '0–300 psi / 0–2100 kPa gauge',
      'Adapters for common gasoline spark-plug threads',
      'Long flexible hose for confined engine bays',
    ],
    codeFamilies: [],
    procedures: ['compression-test'],
    tier: 'midrange',
    productUrl: 'https://www.otctools.com/products/compression-tester-kit',
  },
  {
    id: 'otc-6977-cooling-pressure',
    kind: 'tester',
    name: 'OTC 6977 Universal Cooling System Pressure Test Kit',
    brand: 'OTC Tools',
    priceRange: 'See retailer',
    priceAnchor: 280,
    description:
      'A cooling-system pressure tester that connects through supplied hose and cap adapters. The owner still has to confirm an included adapter matches the vehicle before purchase.',
    features: [
      'Hand pump with integrated pressure gauge',
      'Four hose adapters plus radiator-cap adapter',
      'Schrader-valve fittings reduce spray at disconnect',
    ],
    codeFamilies: [],
    procedures: ['cooling-pressure-test'],
    tier: 'advanced',
    productUrl: 'https://www.otctools.com/products/universal-cooling-system-pressure-test-kit',
  },
  {
    id: 'fluke-15b-plus',
    kind: 'meter',
    name: 'Fluke 15B+ Digital Multimeter',
    brand: 'Fluke',
    priceRange: '$130–$150',
    priceAnchor: 136,
    description:
      'A general-purpose digital multimeter for article-prescribed voltage, current, resistance and continuity checks. It is not an oscilloscope and should not be inferred for waveform diagnosis the article does not name.',
    features: [
      'AC/DC voltage and current measurement',
      'Resistance, continuity and frequency checks',
      'Includes test leads',
    ],
    codeFamilies: [],
    procedures: ['multimeter-basic'],
    tier: 'midrange',
    productUrl: 'https://www.fluke.com/en-us/product/electrical-testing/digital-multimeters/fluke-15b-plus',
  },
  {
    id: 'otc-5610-oil-pressure',
    kind: 'tester',
    name: 'OTC 5610 Transmission/Engine Oil Pressure Kit',
    brand: 'OTC Tools',
    priceRange: 'See retailer',
    priceAnchor: 250,
    description:
      'A mechanical oil-pressure kit with high- and low-pressure gauges and 13 adapters. The owner must confirm the correct engine-port adapter and factory pressure specification before connecting it.',
    features: [
      '0–100 psi and 0–400 psi gauges',
      'Thirteen adapters for domestic and import applications',
      'Supports static and road testing when safely installed',
    ],
    codeFamilies: [],
    procedures: ['oil-pressure'],
    tier: 'advanced',
    productUrl: 'https://www.otctools.com/products/transmissionengine-oil-pressure-kit',
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
  return /^[PBCU][0-3][0-9A-F]{3}$/.test(normalized)
    ? normalized[0] as CodeFamily
    : null;
}

export interface DiagnosticVehicleContext {
  engines?: string[];
}

/**
 * Procedures a solution calls for, read from its own wording. Deliberately
 * conservative: an unmatched solution surfaces no tool rather than a guess.
 */
const PROCEDURE_PATTERNS: Array<[Procedure, RegExp]> = [
  ['parasitic-draw', /\b(?:perform|run|do|conduct) (?:an? )?parasitic (?:draw|drain)(?: test)?\b|\b(?:measure|test|check|diagnose) (?:for )?(?:the )?parasitic (?:draw|drain)\b|\bcurrent draw test\b|\blow-current (?:dc )?clamp meter\b/i],
  ['battery-state-of-health', /\b(?:perform|run|do|conduct) (?:an? )?battery (?:state[- ]of[- ]health|conductance|cca|internal resistance) test\b|\btest (?:the )?battery(?:'s)? (?:state[- ]of[- ]health|conductance|cca|internal resistance)\b/i],
  ['smoke-test', /\b(?:perform|run|do|conduct|use) (?:an? )?(?:automotive )?smoke test\b|\bsmoke[- ]test (?:the )?(?:evap|intake|vacuum|exhaust|turbo|boost|system)\b|\buse (?:an? )?(?:automotive )?smoke machine\b/i],
  ['fuel-pressure', /\b(?:perform|run|do|conduct) (?:an? )?fuel[- ]pressure test\b|\b(?:check|measure|test) (?:the )?fuel pressure (?:with|using)\b|\b(?:connect|install|use) (?:an? )?fuel[- ]pressure (?:tester|gauge)\b/i],
  ['compression-test', /\b(?:perform|run|do|conduct) (?:an? )?(?:engine |cylinder )?compression test\b|\b(?:check|measure|test) (?:the )?(?:engine |cylinder )?compression (?:with|using)\b|\buse (?:an? )?compression tester\b/i],
  ['cooling-pressure-test', /\b(?:perform|run|do|conduct) (?:an? )?(?:cooling[- ]system|coolant|radiator) pressure test\b|\bpressure[- ]test (?:the )?(?:cooling system|radiator)\b|\buse (?:an? )?(?:cooling[- ]system|coolant|radiator) pressure tester\b/i],
  ['multimeter-basic', /\b(?:test|check|measure|verify|diagnose)[^.!?;]{0,80}\b(?:with|using) (?:an? )?(?:digital )?multimeter\b|\b(?:multimeter|voltmeter|ohmmeter) (?:check|test|measurement)\b|\buse (?:an? )?(?:digital )?(?:multimeter|voltmeter|ohmmeter)\b/i],
  ['oil-pressure', /\b(?:perform|run|do|conduct) (?:an? )?(?:mechanical )?oil[- ]pressure test\b|\b(?:check|measure|test) (?:the )?oil pressure (?:with|using)\b|\b(?:connect|install|use) (?:an? )?(?:mechanical )?oil[- ]pressure (?:tester|gauge)\b|\boil[- ]pressure gauge (?:will|can) confirm\b/i],
  ['scan-codes', /\b(?:use|connect|diagnose with) (?:an? )?(?:scan tool|scanner)\b|\b(?:read|retrieve|scan for) (?:the )?(?:stored )?(?:fault )?codes\b/i],
];

export function proceduresInSolution(solution: string): Procedure[] {
  // Keep the browser registry and snapshot audit on one conservative matcher.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const shared = require('../lib/diagnostic-procedures') as { proceduresInSolution(value: string): Procedure[] };
  return shared.proceduresInSolution(solution);
  /* c8 ignore next 8 -- retained temporarily to keep historical regex review context */
  const text = String(solution || '');
  const clauses = text.split(/(?<=[.;!?])\s+|\n+/).map((clause) => clause.trim()).filter(Boolean);
  const excluded = /\b(?:not|no|never|without|avoid|cannot|unnecessar\w*)\b|\b[a-z]+n['’]t\b|\b(?:dont|isnt|cant|mustnt|shouldnt|wouldnt|wont|neednt)\b|\b(?:dealer|dealership|shop|technician|mechanic|garage|professional|specialist|repair facility|service cent(?:er|re))\b/i;
  return PROCEDURE_PATTERNS
    .filter(([, re]) => clauses.some((clause) => re.test(clause) && !excluded.test(clause)))
    .map(([p]) => p);
}

/** Tools for a set of procedures, cheapest first, deduped. */
function toolMatchesVehicleContext(tool: DiagnosticTool, context: DiagnosticVehicleContext): boolean {
  const engines = (context.engines || []).map((engine) => String(engine).toLowerCase());
  if (tool.id === 'otc-5606-compression') {
    return engines.length > 0
      && engines.every((engine) => /\b(?:gasoline|petrol|spark[- ]ignition)\b/.test(engine))
      && engines.every((engine) => !/\b(?:diesel|tdi|turbodiesel|electric|bev|fuel cell)\b/.test(engine));
  }
  if (tool.id === 'otc-5630-fuel-pressure') {
    return engines.length > 0
      && engines.every((engine) => /\b(?:gasoline|petrol|port[- ]injection|carburet)/.test(engine))
      && engines.every((engine) => !/\b(?:diesel|tdi|turbodiesel|direct[- ]injection|gdi|fsi|flex[- ]fuel|e85)\b/.test(engine));
  }
  return true;
}

export function toolsForProcedures(
  procedures: Procedure[],
  families: CodeFamily[] = [],
  context: DiagnosticVehicleContext = {},
): DiagnosticTool[] {
  const wanted = new Set(procedures);
  return diagnosticTools
    .filter((t) => {
      if (!t.procedures.some((p) => wanted.has(p))) return false;
      if (t.kind !== 'scanner') return true;
      return families.length > 0 && families.every((family) => t.codeFamilies.includes(family));
    })
    .filter((tool) => toolMatchesVehicleContext(tool, context))
    .sort((a, b) => a.priceAnchor - b.priceAnchor);
}
