/**
 * Component prose → catalog product category + part type. DATA, not code.
 *
 * Our articles describe a component the way an owner would ("the blower motor
 * resistor burns out"). The parts catalog organizes the same part under one of
 * ~79 standardized product categories per vehicle. Nothing bridges the two, so
 * every fitment query has to guess the category — and a wrong guess returns
 * zero parts, which reads exactly like "this part does not exist".
 *
 * That failure is not hypothetical. Looking for a Grand Caravan water pump,
 * "cooling" matched a category holding 3 parts and "engine components" held 62
 * with no pumps at all; the answer was WATER PUMP & COMPONENTS. Two wrong
 * guesses, each of which would have condemned a perfectly good part number.
 *
 * MATCHING IS TOKEN-BASED, NOT SUBSTRING. `productMatch` and `partTypeMatch`
 * are passed to the catalog client, which requires every token of the query to
 * appear in the target. So "water pump components" matches WATER PUMP &
 * COMPONENTS, and a category is never matched by a stray letter sequence.
 *
 * ORDER MATTERS. The first entry whose pattern hits the component text wins, so
 * specific rules are listed before general ones — "fuel pump" must be tested
 * before bare "pump", "wheel bearing" before "bearing".
 *
 * Coverage is deliberately partial. An unmapped component yields no query rather
 * than a bad one; `npm run` tooling reports what went unmapped so this table
 * grows from real misses instead of speculation.
 */

export interface ComponentMapping {
  /** Matched against the article's component text (title + solution). */
  pattern: RegExp;
  /**
   * Catalog product category, as tokens that must all appear in its name.
   *
   * An ARRAY is tried in order until one yields parts. Two things make this
   * necessary: a component can sit in more than one category depending on how
   * it fails (an intake manifold's gasket is filed under gaskets, not engine
   * components), and the ~79 categories are per-vehicle, so a category that
   * exists for one model is simply absent on another.
   */
  productMatch: string | string[];
  /** ACES part-type tokens that must all appear in the part's type. */
  partTypeMatch: string;
  /** True when the part is not engine-specific, so engine scoping is skipped. */
  engineIndependent?: boolean;
  /**
   * Veto. A title can NAME a component while the actual repair is something
   * else: "Battery Drain from Door Ajar Switch" is about the switch, and
   * "Hybrid Battery Degradation" is not about the 12V battery under the hood.
   * Matching the noun alone produced exactly those recommendations.
   */
  unless?: RegExp;
}

export const COMPONENT_CATALOG_MAP: ComponentMapping[] = [
  // ── specific pumps before the generic "pump" ──
  { pattern: /\bwater pump\b/i, productMatch: ['water pump components', 'engine components'], partTypeMatch: 'water pump' },
  { pattern: /\bfuel pump\b/i, productMatch: 'fuel pumps components', partTypeMatch: 'fuel pump' },
  { pattern: /\bpower steering pump\b/i, productMatch: 'power steering hoses pumps', partTypeMatch: 'power steering pump' },
  { pattern: /\boil pump\b/i, productMatch: 'engine components', partTypeMatch: 'oil pump' },
  { pattern: /\b(vacuum pump|brake vacuum)\b/i, productMatch: 'brake hydraulics', partTypeMatch: 'vacuum pump' },

  // ── specific bearings before the generic "bearing" ──
  { pattern: /\b(wheel bearing|hub assembly|hub bearing)\b/i, productMatch: 'wheel bearings seals', partTypeMatch: 'wheel bearing', engineIndependent: true },
  { pattern: /\b(rod bearing|main bearing|crankshaft bearing)\b/i, productMatch: 'engine components', partTypeMatch: 'bearing set' },

  // ── cooling ──
  { pattern: /\bthermostat\b/i, productMatch: ['thermostat gasket housing', 'cooling system service'], partTypeMatch: 'thermostat' },
  { pattern: /\bradiator\b/i, productMatch: 'radiators coolers related components', partTypeMatch: 'radiator' },
  { pattern: /\b(coolant hose|radiator hose|heater hose)\b/i, productMatch: 'hoses pipes', partTypeMatch: 'hose' },
  { pattern: /\bintercooler\b/i, productMatch: 'radiators coolers related components', partTypeMatch: 'intercooler' },

  // ── drive belt / timing ──
  { pattern: /\btiming chain\b/i, productMatch: 'engine components', partTypeMatch: 'timing chain' },
  { pattern: /\btiming belt\b/i, productMatch: 'belts hoses tensioners', partTypeMatch: 'timing belt' },
  { pattern: /\b(tensioner|idler pulley)\b/i, productMatch: 'belts hoses tensioners', partTypeMatch: 'tensioner' },
  { pattern: /\b(serpentine belt|drive belt|accessory belt)\b/i, productMatch: 'belts hoses tensioners', partTypeMatch: 'belt' },

  // ── engine internals / sealing ──
  { pattern: /\bhead gasket\b/i, productMatch: ['gaskets sealing systems-engine', 'engine service'], partTypeMatch: 'head gasket' },
  { pattern: /\b(intake manifold)\b/i, productMatch: ['gaskets sealing systems-engine', 'engine components'], partTypeMatch: 'intake manifold' },
  { pattern: /\bexhaust manifold\b/i, productMatch: ['exhaust manifolds', 'gaskets sealing systems-engine', 'exhaust'], partTypeMatch: 'exhaust manifold' },
  { pattern: /\bvalve cover\b/i, productMatch: 'gaskets sealing systems-engine', partTypeMatch: 'valve cover gasket' },
  { pattern: /\b(oil pan)\b/i, productMatch: ['engine components', 'gaskets sealing systems-engine'], partTypeMatch: 'oil pan' },
  { pattern: /\b(lifter|valve lifter|tappet)\b/i, productMatch: 'valve train components', partTypeMatch: 'lifter' },
  { pattern: /\b(rear main seal|crankshaft seal|camshaft seal)\b/i, productMatch: 'gaskets sealing systems-engine', partTypeMatch: 'seal' },
  { pattern: /\bpcv\b|\bcrankcase vent/i, productMatch: 'crankcase ventilation system', partTypeMatch: 'valve' },

  // ── fuel / ignition / emissions ──
  { pattern: /\b(fuel injector|injector)\b/i, productMatch: 'fuel injection system components', partTypeMatch: 'fuel injector' },
  { pattern: /\b(ignition coil|coil pack)\b/i, productMatch: 'ignition', partTypeMatch: 'ignition coil' },
  { pattern: /\bspark plug\b/i, productMatch: 'ignition', partTypeMatch: 'spark plug' },
  { pattern: /\bcatalytic converter\b/i, productMatch: 'catalytic converter', partTypeMatch: 'catalytic converter' },
  { pattern: /\begr\b/i, productMatch: 'egr related components', partTypeMatch: 'egr valve' },
  { pattern: /\b(purge valve|evap)\b/i, productMatch: 'fuel injection system components', partTypeMatch: 'vapor canister purge valve' },

  // ── sensors, split by the catalog's own sensor families ──
  { pattern: /\b(oxygen sensor|o2 sensor|air.?fuel ratio sensor)\b/i, productMatch: 'sensors-exhaust', partTypeMatch: 'oxygen sensor' },
  { pattern: /\b(camshaft position sensor|crankshaft position sensor)\b/i, productMatch: 'sensors-engine', partTypeMatch: 'position sensor' },
  { pattern: /\b(mass air ?flow|maf)\b/i, productMatch: 'sensors-engine', partTypeMatch: 'air flow sensor' },
  { pattern: /\b(abs sensor|wheel speed sensor)\b/i, productMatch: 'abs components', partTypeMatch: 'speed sensor', engineIndependent: true },
  { pattern: /\bcoolant temperature sensor\b/i, productMatch: 'sensors-engine', partTypeMatch: 'coolant temperature sensor' },

  // ── driveline ──
  { pattern: /\b(cv axle|cv joint|half.?shaft|axle shaft)\b/i, productMatch: 'c/v axles boots', partTypeMatch: 'axle', engineIndependent: true },
  { pattern: /\b(clutch)\b/i, productMatch: 'clutch components', partTypeMatch: 'clutch' },
  { pattern: /\btransmission (solenoid|valve body)\b/i, productMatch: 'automatic trans components', partTypeMatch: 'solenoid' },
  { pattern: /\b(differential|ring and pinion)\b/i, productMatch: 'differential', partTypeMatch: 'differential', engineIndependent: true },

  // ── suspension / steering / brakes ──
  { pattern: /\b(sway bar link|stabilizer bar link|end link)\b/i, productMatch: 'suspension springs components', partTypeMatch: 'stabilizer bar link', engineIndependent: true },
  { pattern: /\bcontrol arm\b/i, productMatch: 'suspension springs components', partTypeMatch: 'control arm', engineIndependent: true },
  { pattern: /\bball joint\b/i, productMatch: 'suspension springs components', partTypeMatch: 'ball joint', engineIndependent: true },
  { pattern: /\btie rod\b/i, productMatch: 'steering gear pump components', partTypeMatch: 'tie rod', engineIndependent: true },
  { pattern: /\b(strut|shock absorber|shock)\b/i, productMatch: 'shocks struts', partTypeMatch: 'shock', engineIndependent: true },
  { pattern: /\b(coil spring|leaf spring)\b/i, productMatch: 'suspension springs components', partTypeMatch: 'spring', engineIndependent: true },
  { pattern: /\bbrake (rotor|disc)\b/i, productMatch: 'brake drums rotors', partTypeMatch: 'rotor', engineIndependent: true },
  { pattern: /\bbrake pad\b/i, productMatch: 'brake pads shoes', partTypeMatch: 'brake pad', engineIndependent: true },
  { pattern: /\b(brake caliper|caliper)\b/i, productMatch: 'brake calipers', partTypeMatch: 'caliper', engineIndependent: true },
  { pattern: /\b(master cylinder|wheel cylinder)\b/i, productMatch: 'brake hydraulics', partTypeMatch: 'cylinder', engineIndependent: true },

  // ── electrical / body / HVAC ──
  { pattern: /\balternator\b/i, productMatch: 'alt gen components', partTypeMatch: 'alternator' },
  { pattern: /\bstarter\b/i, productMatch: 'starter components', partTypeMatch: 'starter' },
  { pattern: /\b(blower motor resistor)\b/i, productMatch: ['hvac', 'a/c condenser evaporator'], partTypeMatch: 'blower motor resistor', engineIndependent: true },
  { pattern: /\bblower motor\b/i, productMatch: ['hvac', 'a/c condenser evaporator'], partTypeMatch: 'blower motor', engineIndependent: true },
  { pattern: /\b(a\/?c compressor|air conditioning compressor)\b/i, productMatch: 'a/c clutch compressor', partTypeMatch: 'compressor' },
  { pattern: /\b(condenser)\b/i, productMatch: 'a/c condenser evaporator', partTypeMatch: 'condenser', engineIndependent: true },
  { pattern: /\bevaporator\b/i, productMatch: 'a/c condenser evaporator', partTypeMatch: 'evaporator', engineIndependent: true },
  { pattern: /\b(heater core)\b/i, productMatch: ['hvac', 'radiators coolers related components'], partTypeMatch: 'heater core', engineIndependent: true },
  { pattern: /\b(window regulator)\b/i, productMatch: 'glass windows related components', partTypeMatch: 'window regulator', engineIndependent: true },
  { pattern: /\b(door latch|door lock actuator)\b/i, productMatch: 'body-doors', partTypeMatch: 'latch', engineIndependent: true },
  { pattern: /\b(lift support|strut.{0,10}(hatch|liftgate|hood))\b/i, productMatch: 'lift supports', partTypeMatch: 'lift support', engineIndependent: true },
  { pattern: /\bcabin (air )?filter\b/i, productMatch: 'cabin air filter', partTypeMatch: 'filter', engineIndependent: true },
  { pattern: /\bwiper (blade|arm)\b/i, productMatch: 'windshield wiper arm blades', partTypeMatch: 'wiper', engineIndependent: true },
  {
    pattern: /\bbattery\b/i,
    productMatch: 'battery components',
    partTypeMatch: 'battery',
    engineIndependent: true,
    // "Battery Drain from a Door Ajar Switch" is a switch job, an infotainment
    // reboot is not a battery at all, and a hybrid pack is not the 12V battery
    // this category sells. Without this veto all three got a new battery.
    unless: /\b(drain|parasitic|hybrid|high.?voltage|infotainment|sync|reboot|freez\w*|start.?stop|door ajar|switch|module|alternator)\b/i,
  },

  // ── added from the first Ford coverage run; each of these was a real miss ──
  { pattern: /\baxle (bearing|seal)\b/i, productMatch: 'bearings', partTypeMatch: 'axle', engineIndependent: true },
  { pattern: /\bfuel tank\b/i, productMatch: 'fuel pumps components', partTypeMatch: 'fuel tank', engineIndependent: true },
  { pattern: /\b(ignition module|tfi)\b/i, productMatch: 'ignition', partTypeMatch: 'ignition control module' },
  { pattern: /\b(shift solenoid|transmission.{0,20}solenoid|p07\d\d)\b/i, productMatch: 'automatic trans components', partTypeMatch: 'solenoid' },
  { pattern: /\b(idle air control)\b/i, productMatch: 'fuel injection system components', partTypeMatch: 'idle air control valve' },
  { pattern: /\b(flex pipe|exhaust pipe)\b/i, productMatch: 'exhaust', partTypeMatch: 'exhaust pipe', engineIndependent: true },
  { pattern: /\b(door hinge|hinge pin)\b/i, productMatch: 'body-doors', partTypeMatch: 'hinge', engineIndependent: true },
  { pattern: /\b(motor mount|engine mount|transmission mount)\b/i, productMatch: 'engine components', partTypeMatch: 'mount' },
  { pattern: /\b(throttle body)\b/i, productMatch: 'fuel injection system components', partTypeMatch: 'throttle body' },
  { pattern: /\b(turbocharger|turbo)\b/i, productMatch: 'engine components', partTypeMatch: 'turbocharger' },
  { pattern: /\b(power steering (hose|line))\b/i, productMatch: 'power steering hoses pumps', partTypeMatch: 'hose' },
  { pattern: /\b(steering (rack|gear))\b/i, productMatch: 'steering gear pump components', partTypeMatch: 'steering gear', engineIndependent: true },

  // ── added from the Chevrolet/Dodge/Chrysler coverage run (133 real misses) ──
  // GM 4WD encoder motors and blend-door actuators dominated that list.
  { pattern: /\b(transfer case).{0,30}(encoder|motor|actuator)|encoder motor\b/i, productMatch: 'automatic trans components', partTypeMatch: 'transfer case motor', engineIndependent: true },
  { pattern: /\btransfer case\b/i, productMatch: 'automatic trans components', partTypeMatch: 'transfer case', engineIndependent: true },
  { pattern: /\bblend door actuator\b/i, productMatch: ['hvac', 'control modules'], partTypeMatch: 'blend door actuator', engineIndependent: true },
  { pattern: /\b(4wd|awd).{0,25}actuator\b/i, productMatch: 'automatic trans components', partTypeMatch: 'actuator', engineIndependent: true },
  { pattern: /\b(intermediate (steering )?shaft)\b/i, productMatch: 'steering gear pump components', partTypeMatch: 'intermediate shaft', engineIndependent: true },
  { pattern: /\b(instrument cluster|stepper motor|gauge cluster)\b/i, productMatch: 'lighting - instrumentation', partTypeMatch: 'instrument', engineIndependent: true },
  { pattern: /\b(injection pump|pmd|fsd)\b/i, productMatch: 'fuel injection system components', partTypeMatch: 'injection pump' },
  { pattern: /\b(park.?switch|shift(er)? cable|shift interlock)\b/i, productMatch: 'automatic trans components', partTypeMatch: 'shift', engineIndependent: true },
  { pattern: /\b(window motor|power window)\b/i, productMatch: 'glass windows related components', partTypeMatch: 'window motor', engineIndependent: true },
  { pattern: /\b(wiper motor)\b/i, productMatch: 'windshield wiper arm blades', partTypeMatch: 'wiper motor', engineIndependent: true },
  { pattern: /\b(abs (module|pump|hecu))\b/i, productMatch: 'abs components', partTypeMatch: 'abs', engineIndependent: true },
  { pattern: /\b(oil cooler)\b/i, productMatch: 'radiators coolers related components', partTypeMatch: 'oil cooler' },
  { pattern: /\b(u.?joint|universal joint|driveshaft)\b/i, productMatch: 'c/v axles boots', partTypeMatch: 'universal joint', engineIndependent: true },
  { pattern: /\b(hub assembly|wheel hub)\b/i, productMatch: 'wheel bearings seals', partTypeMatch: 'hub', engineIndependent: true },
  { pattern: /\b(door handle)\b/i, productMatch: 'body-doors', partTypeMatch: 'door handle', engineIndependent: true },
  { pattern: /\b(headlight|headlamp)\b/i, productMatch: 'lighting - exterior', partTypeMatch: 'headlight', engineIndependent: true },
  { pattern: /\b(radiator (support|fan)|cooling fan)\b/i, productMatch: 'radiators coolers related components', partTypeMatch: 'fan' },
  { pattern: /\b(exhaust gas temperature|dpf|diesel particulate)\b/i, productMatch: 'sensors-exhaust', partTypeMatch: 'temperature sensor' },
];

/** First match wins — see the ordering note above. */
/**
 * `text` is what we match POSITIVELY against — the title, normally, because it
 * names what the page is about.
 *
 * `vetoContext` is what the veto is tested against, and it should be the WHOLE
 * article. A veto that only sees the title is trivially defeated: "Parasitic
 * Battery Drain" correctly refuses to map, then the solution's "replace battery
 * with AGM type" maps it right back to a battery. The veto has to hold across
 * both passes or it does nothing.
 */
/**
 * A component named as something the failure is NOT. Titles routinely carry a
 * differential-diagnosis aside — "Oil Filter Adapter O-Ring Leak (Frequently
 * Misdiagnosed as Rear Main Seal)" — and matching the disclaimed component
 * recommends the exact part the article exists to rule out.
 */
const DISCLAIMED = /\b(?:misdiagnos\w*|mistaken|confused|not)\s+(?:as|for|with|a|an)?\s*$/i;

function matchesOutsideDisclaimer(mapping: ComponentMapping, text: string): boolean {
  const m = mapping.pattern.exec(text);
  if (!m) return false;
  // Look at the ~30 characters immediately before the match.
  const before = text.slice(Math.max(0, m.index - 30), m.index);
  return !DISCLAIMED.test(before);
}

/**
 * `text` is what we match POSITIVELY against — the title, normally, because it
 * names what the page is about.
 *
 * `vetoContext` is what the veto is tested against, and it should be the WHOLE
 * article. A veto that only sees the title is trivially defeated: "Parasitic
 * Battery Drain" correctly refuses to map, then the solution's "replace battery
 * with AGM type" maps it right back. The veto has to hold across both passes.
 *
 * The SUBJECT of a title is its leading clause. Everything after a parenthesis
 * or a dash is qualification, and matching it first let "Front Wheel Hub/Bearing
 * Assembly Failure (Integrated ABS Sensor)" resolve to an ABS sensor instead of
 * the hub. So the leading clause is tried first, and the full string only if it
 * yields nothing.
 */
export function mapComponent(text: string, vetoContext?: string): ComponentMapping | null {
  const veto = vetoContext ?? text;
  const lead = String(text).split(/[(—–]|\s-\s/)[0]!.trim();
  const passes = lead && lead !== text ? [lead, text] : [text];

  for (const pass of passes) {
    for (const mapping of COMPONENT_CATALOG_MAP) {
      if (!matchesOutsideDisclaimer(mapping, pass)) continue;
      if (mapping.unless && mapping.unless.test(veto)) continue;
      return mapping;
    }
  }
  return null;
}
