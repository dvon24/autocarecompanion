/**
 * Read the PART THE ARTICLE TELLS YOU TO BUY out of its solution text.
 *
 * A solution is a mix of instructions: diagnose this, inspect that, then replace
 * the specific thing. Only the last kind names a part. Treating the whole
 * solution as evidence is how "also check the spark plugs" turned a distributor
 * article into a spark-plug recommendation — but ignoring it entirely throws
 * away the most precise signal we have, because the prescription is usually
 * exact where the title is loose:
 *
 *   title    "Crankshaft Position Sensor Failure Causing Stalling"
 *   solution "Replace crankshaft position sensor (use OEM part)."   <- the part
 *
 *   title    "Fuel Pump Driver Module (FPDM) Corrosion and No-Start"
 *   solution "Repair usually involves replacing the FPDM…"          <- the part
 *
 * So this extracts the OBJECT OF THE REPLACE VERB and nothing else. Everything
 * before "replace" is diagnosis; everything in another sentence is context.
 */

/** Verbs that introduce a part you buy. "Repair" and "service" do not qualify. */
const PRESCRIBE = /\b(?:replace|replacing|replacement of|install|installing|swap(?:\s+or\s+replace)?)\b/gi;

/** Imperative purchase/install verbs that name a buyable repair item. */
const BUY_COMMAND = /\b(?:add|order|source|use)\b/gi;

/** Passive/modal forms used by repair prose where the part precedes the verb. */
const MODAL_REQUIRES_REPLACEMENT = /\b(may|might|can|could)\s+require\s+((?:(?:the|a|an)\s+)?[a-z0-9][a-z0-9/-]*(?:\s+[a-z0-9][a-z0-9/-]*){0,5})\s+replacement\b/gi;
const PART_BEFORE_REPLACEMENT = /\b(?:(?:needs?|requires?)\s+(?:hardware\s+)?replacement|(?:needs?|requires?)\s+to\s+be\s+replaced|(?:may|might|can|could|must|should|will)\s+(?:(?:need|require)s?\s+(?:hardware\s+)?replacement|be\s+replaced))\b/gi;
const MODAL_NEEDS_OBJECT = /\b(may|might|can|could|must|should|will)\s+(?:need|needs|require|requires)\s+([^.;!?\u2013\u2014]{1,180})/gi;
const NOUN_FIRST_MODAL_REPLACEMENT = /\breplacement\b([^.!?]{0,140}?)\b(may|might|can|could|must|should|will)\s+be\s+(?:required|needed)\b/gi;
const REPLACEMENT_LIST = /\breplacement\s*:\s*([^.!?]+)/gi;
const FIX_IS_PART = /\b(?:the\s+)?(?:only\s+)?(?:durable\s+|proper\s+|permanent\s+)?fix\s+is\s+([^.;!?\u2013\u2014]+)/gi;

/**
 * A clause is NOT a prescription when the verb is negated or conditional:
 * "before replacing", "instead of replacing", "do not replace", "rather than
 * replacing". These appear constantly in diagnostic guidance and each one names
 * a part the article is steering you AWAY from.
 */
const NEGATED_BEFORE = /(?:\b(?:before|after|prior to|instead of|rather than|without|avoid|unnecessar\w*|don'?t|do not|never|no need to|no need for|no reason to|no benefit in|little benefit in)\s+(?:\w+\s+){0,2}|\b(?:not|no)\s+)$/i;
// Post-object negation must describe the replacement instruction itself. A
// later bare "not" often belongs to a qualifier ("not all four") or a fault
// condition ("if the actuator is not engaging") and must not erase the buyable
// object. These predicates are deliberately narrow grammatical statements that
// the replacement is unnecessary, prohibited, or discouraged.
const NEGATED_REPLACEMENT_PREDICATE = /\b(?:(?:is|are|was|were|seems?|remains?)\s+(?:not\s+(?:recommended|required|needed|advised|appropriate|necessary|beneficial)|unnecessar\w*|prohibit\w*|inadvis\w*|contraindicat\w*|unwarrant\w*)|(?:should|must|ought\s+to)\s+(?:not\s+be\s+(?:used|done|performed|installed|replaced)|be\s+(?:avoided|prohibited|discouraged)))\b/i;
const NON_PRESCRIPTIVE_BEFORE = /\b(?:cost|price|estimate|labor|time)\s+(?:for\s+)?$/i;

/** Words that qualify a part without identifying it. */
const NOISE = new Set([
  'the', 'a', 'an', 'this', 'that', 'these', 'those', 'its', 'his', 'her', 'their',
  'failed', 'faulty', 'bad', 'worn', 'rusted', 'old', 'new', 'fresh', 'entire', 'complete', 'whole', 'full',
  'affected', 'damaged', 'leaking', 'cracked', 'defective', 'original', 'oem', 'assembly',
  'genuine', 'updated', 'revised', 'improved', 'correct', 'proper', 'both', 'all', 'hardware',
  'any', 'each', 'one', 'two', 'four', 'six', 'eight',
  'again', 'usually', 'typically', 'often', 'simply', 'just',
]);

/** Single words that name nothing buyable. Anything else standing alone — an
 *  acronym like FPDM, TIPM, PCV — is a real part name and is kept. */
const VAGUE = new Set(['it', 'them', 'this', 'that', 'one', 'unit', 'part', 'component', 'item', 'piece']);

/** Trailing words that start a new thought rather than continue the part name. */
const STOP = /\b(?:with|without|using|per|as|if|when|where|after|before|then|to|for|on|in|at|from|of|under|because|since|which|that|they|is|are|run|diy|plus|along|by|during|while|into|through|around|about)\b/i;
const NON_PART_ACTION = /^(?:replace|install|use|add|order|source|inspect|check|test|diagnos|clean|flush|bleed|verify|confirm|measure|machine|resurface|repair|service|reprogram|program|reset|tighten|remove)\b/i;
const STANDALONE_PART = /^(?:pump|sensor|hub|mount|mounts|thermostat|radiator|condenser|compressor|alternator|starter|battery|belt|belts|tensioner|pulley|bearing|bearings|bushing|bushings|brush|brushes|bolt|bolts|clamp|clamps|tube|tubes|axle|axles|grommet|grommets|seal|seals|gasket|gaskets|hose|hoses|filter|valve|module|switch|motor|actuator|solenoid|ignitor|coil|rotor|pad|pads|caliper|cylinder|clutch|converter|manifold|injector|plug|plugs|housing|bracket|kit|latch|blower|core|tank|cap|pipe|shaft|differential|turbo|intercooler|lifter|piston|transmission|distributor|dashboard|interlock|idler|relay|relays|resistor|weatherstrip|weatherstripping|ring|rings)$/i;
const SHARED_NOUN_QUALIFIER = /^(?:cam|crank|front|rear|upper|lower|left|right)$/i;
const BUYABLE_NOUN_SOURCE = '(?:pump|sensor|hub|accumulator|thermostat|radiator|condenser|compressor|alternator|starter|battery|belt|tensioner|pulley|bearing|bushing|brush|bolt|clamp|tube|axle|grommet|seal|gasket|hose|filter|valve|body|module|switch|motor|actuator|solenoid|ignitor|coil|rotor|pad|caliper|cylinder|clutch|converter|manifold|injector|plug|housing|bracket|kit|latch|blower|core|tank|cap|pipe|shaft|differential|turbo|intercooler|lifter|piston|ring|transmission|distributor|dashboard|interlock|wire|synchronizer|o-ring|relay|resistor|weatherstrip|weatherstripping|strip|nut|mount|modulator|engine|head|screen|idler|unit)(?:s|es)?';
const BUYABLE_NOUN = new RegExp(`\\b${BUYABLE_NOUN_SOURCE}\\b`, 'i');
const ANTECEDENT_PART = new RegExp(
  `\\b(?:the|a|an|this|that)\\s+((?:[a-z0-9][a-z0-9/-]*\\s+){0,5}?${BUYABLE_NOUN_SOURCE})\\b`,
  'gi',
);
const ANAPHORIC_OBJECT = /^(?:(?:the|this|that|a|an)\s+)?(it|them|these|those|this|that|one|unit|part|component|item|piece)?(?:\s+(?:at|during|after|before)\b[\s\S]*)?$/i;

export interface PrescribedRepairComponent {
  component: string;
  evidence: string;
  diagnosisDependent: boolean;
  condition?: string;
}

function cleanPhrase(raw: string): string {
  const words = raw
    .toLowerCase()
    .replace(/^screwed\s+up\s+/, '')
    .replace(/\([^)]*\)/g, ' ')          // drop parentheticals
    .replace(/['’]s\b/g, '')             // driver's -> driver
    .replace(/[^a-z0-9\s/-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const out: string[] = [];
  for (const w of words) {
    if ((STOP.test(w) || VAGUE.has(w)) && out.length === 0) return '';
    if (STOP.test(w) && out.length > 0) break;   // stop at a new clause
    if (NOISE.has(w)) continue;
    out.push(w);
    // Part names are short. Beyond four significant words we are collecting
    // sentence, not part, and every extra token over-constrains the catalog
    // query into returning nothing.
    if (out.length >= 6) break;
  }
  return out.join(' ').trim();
}

function sentenceStart(text: string, index: number): number {
  return Math.max(
    text.lastIndexOf('.', index - 1),
    text.lastIndexOf(';', index - 1),
    text.lastIndexOf('!', index - 1),
    text.lastIndexOf('?', index - 1),
  ) + 1;
}

function sentenceEnd(text: string, index: number): number {
  const boundary = text.slice(index).search(/[.!?]/);
  return boundary < 0 ? text.length : index + boundary + 1;
}

function replacementCondition(text: string, index: number, after = ''): string | undefined {
  const beforeInSentence = text.slice(sentenceStart(text, index), index).trim();
  return beforeInSentence.match(/\b(?:if|when|once|only after|after)\b[\s\S]*$/i)?.[0]?.trim()
    || beforeInSentence.match(/\b(?:in\s+)?severe cases?\b[\s\S]*$/i)?.[0]?.trim()
    || after.match(/\b(?:if|when|only if|only when)\b[\s\S]*$/i)?.[0]?.trim();
}

function normalizedComponent(raw: string): string {
  const phrase = cleanPhrase(raw);
  if (!phrase) return '';
  if (/\b(?:control\s+(?:module|unit)|head\s+unit|screen\s+unit|omron\s+unit)$/i.test(phrase)) return phrase;
  const withoutArticle = raw.trim().replace(/^(?:the|a|an)\s+/i, '');
  const rawWithoutOem = withoutArticle.replace(/\bOEM\b/g, '').trim();
  const rawLooksLikeAcronym = /^[A-Z][A-Z0-9/-]{1,}$/.test(rawWithoutOem)
    || /\b[A-Z][A-Z0-9/-]{1,}$/.test(rawWithoutOem)
    || /\b[A-Z][A-Z0-9/-]{1,}\s+(?:module|relay|sensor|pump|valve|unit|motor|assembly)\b/.test(rawWithoutOem);
  if (/\b(?:ATF|PSF|coolant|fluid|oil|grease)\b/i.test(phrase)) return '';
  if (/^[a-z0-9-]+\s+unit$/i.test(phrase)
    && !/\b(?:control|head|screen|compressor|transfer|abs|alb|ccu|ecm|bcm|omron)\s+unit$/i.test(phrase)) return '';
  if (!BUYABLE_NOUN.test(phrase) && !rawLooksLikeAcronym) return '';
  if (!phrase.includes(' ') && !phrase.includes('/') && !STANDALONE_PART.test(phrase) && !rawLooksLikeAcronym) return '';
  return phrase;
}

function replacementObjects(raw: string): string[] {
  const withoutTail = raw
    .replace(/\b(?:as a set|as an assembly|as one job|together)\b.*$/i, '')
    .replace(/\s+replacement\b.*$/i, '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\bas\s+(?:a|an|the)?\s*(?:complete|full|new)?\s*/i, ' ');
  const withParts = withoutTail.match(/^([\s\S]*?)\s+with\s+([\s\S]+)$/i);
  const objectText = withParts && normalizedComponent(withParts[2] || '')
    ? withParts[2]!
    : withoutTail.replace(/^\s*with\s+/i, '');
  const objects = objectText.split(/\s*,\s*(?:and\s+)?|\s+(?:and|or)\s+|\s*\+\s*/i);

  for (let index = 0; index + 1 < objects.length; index += 1) {
    const qualifier = objects[index]!.trim().replace(/^(?:the|all|both)\s+/i, '');
    const sharedNoun = objects[index + 1]!.trim().match(/\b(seals?|gaskets?|hoses?|belts?|pulleys?|bearings?|bushings?|tubes?)\b/i)?.[1];
    if (SHARED_NOUN_QUALIFIER.test(qualifier) && sharedNoun) objects[index] = `${qualifier} ${sharedNoun}`;
  }
  return objects;
}

function precedingReplacementObject(text: string, index: number): string {
  const prefix = text.slice(sentenceStart(text, index), index);
  const clause = prefix.split(/[,;:\u2013\u2014]/).at(-1)?.trim() || prefix.trim();
  return clause
    .replace(/^(?:and|or|then|some|the|a|an)\s+/i, '')
    .replace(/\b(?:hardware\s+)?$/i, '')
    .trim();
}

function objectBeforeCostReplace(text: string, index: number): string {
  const currentStart = sentenceStart(text, index);
  const previousStart = currentStart > 0 ? sentenceStart(text, currentStart - 1) : 0;
  const prefix = text.slice(previousStart, index);
  const generic = normalizedComponent(prefix.match(new RegExp(`((?:[a-z0-9][a-z0-9/-]*\\s+){0,5}?${BUYABLE_NOUN_SOURCE})\\s+(?:is|are)\\b`, 'i'))?.[1] || '');
  if (!generic) return '';
  const candidates: string[] = [];
  ANTECEDENT_PART.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = ANTECEDENT_PART.exec(prefix))) {
    const candidate = normalizedComponent(match[1] || '');
    if (candidate === generic || candidate.endsWith(` ${generic}`)) candidates.push(candidate);
  }
  return candidates.sort((a, b) => b.length - a.length)[0] || generic;
}

function imperativeCommand(text: string, index: number, verb: string): boolean {
  if (/^[A-Z]/.test(verb)) return true;
  const prefix = text.slice(sentenceStart(text, index), index);
  return !prefix.trim() || /(?:[,;:\u2013\u2014]|\b(?:and|then|or))\s*$/i.test(prefix);
}

interface ReplacementAntecedent {
  component: string;
  evidenceStart: number;
}

/**
 * Resolve only high-confidence anaphora: a specific multi-word part, or a
 * one-word part directly governed by a diagnostic action ("test the ignitor").
 * The search is limited to the current and immediately preceding sentence so
 * a bare "replace it" cannot borrow an unrelated part from the paragraph.
 */
function uniqueReplacementAntecedent(text: string, index: number): ReplacementAntecedent | undefined {
  const currentStart = sentenceStart(text, index);
  const previousStart = currentStart > 0 ? sentenceStart(text, currentStart - 1) : 0;
  const context = text.slice(previousStart, index);
  const explicitlyTested = context.match(
    new RegExp(`\\b(?:test|inspect|check|diagnose)\\s+(?:the|a|an)?\\s*((?:[a-z0-9][a-z0-9/-]*\\s+){0,5}?${BUYABLE_NOUN_SOURCE})\\s+before\\s+replac`, 'i'),
  );
  if (explicitlyTested?.[1]) {
    const component = normalizedComponent(explicitlyTested[1]);
    if (component) return { component, evidenceStart: previousStart };
  }
  const explicitlyHandled = context.match(
    new RegExp(`\\b(?:pull|remove)\\s+(?:the|a|an)?\\s*((?:[a-z0-9][a-z0-9/-]*\\s+){0,5}?${BUYABLE_NOUN_SOURCE})\\b`, 'i'),
  );
  if (explicitlyHandled?.[1]) {
    const component = normalizedComponent(explicitlyHandled[1]);
    if (component) return { component, evidenceStart: previousStart };
  }
  const candidates = new Map<string, ReplacementAntecedent>();
  ANTECEDENT_PART.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = ANTECEDENT_PART.exec(context))) {
    const component = normalizedComponent(match[1] || '');
    if (!component) continue;
    candidates.set(component, { component, evidenceStart: previousStart });
  }
  return candidates.size === 1 ? [...candidates.values()][0] : undefined;
}

function coordinatedAntecedentIsAmbiguous(text: string, index: number): boolean {
  const currentStart = sentenceStart(text, index);
  const previousStart = currentStart > 0 ? sentenceStart(text, currentStart - 1) : 0;
  const context = text.slice(previousStart, index);
  const explicitList = context.match(new RegExp(
    `(?:the|a|an)\\s+((?:[a-z0-9][a-z0-9/-]*\\s+){0,4}?${BUYABLE_NOUN_SOURCE})\\s+(?:and|or)\\s+(?:the|a|an)?\\s*((?:[a-z0-9][a-z0-9/-]*\\s+){0,4}?${BUYABLE_NOUN_SOURCE})`,
    'i',
  ));
  return Boolean(explicitList?.[1] && explicitList?.[2]);
}

function pluralReplacementAntecedent(text: string, index: number): ReplacementAntecedent | undefined {
  const currentStart = sentenceStart(text, index);
  const previousStart = currentStart > 0 ? sentenceStart(text, currentStart - 1) : 0;
  const context = text.slice(previousStart, index);
  const conditionalPlural = context.match(new RegExp(`\\bif\\s+(?:the\\s+)?((?:[a-z0-9/-]+\\s+){0,4}?${BUYABLE_NOUN_SOURCE})\\s+(?:are|were|have|become)\\b`, 'i'));
  if (!conditionalPlural?.[1]) return undefined;
  const component = normalizedComponent(conditionalPlural[1]);
  return component ? { component, evidenceStart: previousStart } : undefined;
}

function uniqueAntecedentByHeadNoun(text: string, index: number, headNoun: string): ReplacementAntecedent | undefined {
  const currentStart = sentenceStart(text, index);
  const previousStart = currentStart > 0 ? sentenceStart(text, currentStart - 1) : 0;
  const context = text.slice(previousStart, index);
  const candidates = new Map<string, ReplacementAntecedent>();
  ANTECEDENT_PART.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = ANTECEDENT_PART.exec(context))) {
    const component = normalizedComponent(match[1] || '');
    if (component && new RegExp(`(?:^|\\s)${headNoun}$`, 'i').test(component)) {
      candidates.set(component, { component, evidenceStart: previousStart });
    }
  }
  return candidates.size === 1 ? [...candidates.values()][0] : undefined;
}

interface IndexedPrescription extends PrescribedRepairComponent {
  sourceIndex: number;
}

/**
 * Every part the solution actually prescribes, most-prescribed first.
 * Returns [] when the solution only diagnoses — which is a real answer, not a
 * failure: plenty of issues have no part to sell.
 */
export function extractPrescriptionComponents(solution: string): PrescribedRepairComponent[] {
  const text = String(solution || '');
  if (!text) return [];

  const found: IndexedPrescription[] = [];
  PRESCRIBE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = PRESCRIBE.exec(text))) {
    const before = text.slice(Math.max(0, m.index - 40), m.index);
    const sentenceBefore = text.slice(sentenceStart(text, m.index), m.index);
    if (NEGATED_BEFORE.test(before) || NON_PRESCRIPTIVE_BEFORE.test(before)
      || /\b(?:avoid|never)\b[\s\S]*$/i.test(sentenceBefore)) continue;

    // Truncate at the sentence boundary FIRST. "Replace crankshaft position
    // sensor. Inspect the connector." otherwise yields "crankshaft position
    // sensor inspect", which queries nothing.
    const after = text.slice(m.index + m[0].length).split(/[.;!?\u2013\u2014]/)[0]!.slice(0, 300);
    if (NEGATED_REPLACEMENT_PREDICATE.test(after.replace(/\([^)]*\)/g, ' '))) continue;
    const condition = replacementCondition(text, m.index, after);
    const objects = replacementObjects(after);

    for (const object of objects) {
      if (NON_PART_ACTION.test(object.trim())) break;
      const phrase = normalizedComponent(object);
      if (!phrase) continue;
    // A single word is usually too vague ("replace it") — but not always: an
    // acronym IS the part name, and "replacing the FPDM" is the most precise
    // prescription in its whole article.
      found.push({
        component: phrase,
        evidence: `${m[0]}${after}`.trim(),
        diagnosisDependent: Boolean(condition),
        ...(condition ? { condition } : {}),
        sourceIndex: m.index,
      });
    }

    const anaphoricObject = after.replace(/\([^)]*\)/g, ' ').trim();
    const hasObjectAtThisVerb = found.some((item) => item.sourceIndex === m!.index);
    const clauseBefore = text.slice(sentenceStart(text, m.index), m.index);
    const vagueReplacementObject = ANAPHORIC_OBJECT.test(anaphoricObject)
      || /^(?:with\s+)?(?:oem\s+)?(?:[a-z0-9-]+\s+)?unit(?:\s+at\b[\s\S]*)?$/i.test(anaphoricObject);
    if (!hasObjectAtThisVerb
      && vagueReplacementObject
      && !/\b(?:not|no|rather than|instead of)(?:\s+[a-z0-9/-]+){0,3}\s*$/i.test(clauseBefore)) {
      const plural = /^(?:them|these|those)$/.test(anaphoricObject.match(ANAPHORIC_OBJECT)?.[1]?.toLowerCase() || '');
      const unit = /^(?:(?:the|this|that|a|an)\s+)?unit\b/i.test(anaphoricObject);
      const costObject = /\bcosts?\b/i.test(clauseBefore) ? normalizedComponent(objectBeforeCostReplace(text, m.index)) : '';
      const antecedent = costObject
        ? {
          component: costObject,
          evidenceStart: sentenceStart(text, Math.max(0, sentenceStart(text, m.index) - 1)),
        }
        : plural
          ? pluralReplacementAntecedent(text, m.index)
        : unit
          ? uniqueAntecedentByHeadNoun(text, m.index, 'unit')
        : coordinatedAntecedentIsAmbiguous(text, m.index)
          ? undefined
          : uniqueReplacementAntecedent(text, m.index);
      if (antecedent) {
        found.push({
          component: antecedent.component,
          evidence: text.slice(antecedent.evidenceStart, sentenceEnd(text, m.index)).trim(),
          diagnosisDependent: Boolean(condition),
          ...(condition ? { condition } : {}),
          sourceIndex: m.index,
        });
      }
    }
  }

  PART_BEFORE_REPLACEMENT.lastIndex = 0;
  while ((m = PART_BEFORE_REPLACEMENT.exec(text))) {
    const rawObject = precedingReplacementObject(text, m.index);
    const before = text.slice(Math.max(0, m.index - 40), m.index);
    if (/^(?:no|not)\b/i.test(rawObject) || NEGATED_BEFORE.test(before)) continue;
    const modal = m[0].match(/\b(may|might|can|could|must|should|will)\b/i)?.[1];
    const condition = replacementCondition(text, m.index) || (modal ? `${modal} replacement` : undefined);
    const listedComponents = replacementObjects(rawObject).map(normalizedComponent).filter(Boolean);
    const components = listedComponents.length
      ? listedComponents
      : (!coordinatedAntecedentIsAmbiguous(text, m.index)
        ? [uniqueReplacementAntecedent(text, m.index)?.component || ''].filter(Boolean)
        : []);
    for (const component of components) {
      found.push({
        component,
        evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
        diagnosisDependent: Boolean(condition),
        ...(condition ? { condition } : {}),
        sourceIndex: m.index,
      });
    }
  }

  MODAL_NEEDS_OBJECT.lastIndex = 0;
  while ((m = MODAL_NEEDS_OBJECT.exec(text))) {
    const afterModal = (m[2] || '').split(/\b(?:because|since|while|but)\b/i)[0] || '';
    for (const rawObject of replacementObjects(afterModal)) {
      const component = normalizedComponent(rawObject);
      if (!component) continue;
      const condition = replacementCondition(text, m.index) || `${m[1]} need`;
      found.push({
        component,
        evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
        diagnosisDependent: true,
        condition,
        sourceIndex: m.index,
      });
    }
  }

  MODAL_REQUIRES_REPLACEMENT.lastIndex = 0;
  while ((m = MODAL_REQUIRES_REPLACEMENT.exec(text))) {
    const component = normalizedComponent(m[2] || '');
    if (!component) continue;
    const condition = replacementCondition(text, m.index) || `${m[1]} require`;
    found.push({
      component,
      evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
      diagnosisDependent: true,
      condition,
      sourceIndex: m.index,
    });
  }

  NOUN_FIRST_MODAL_REPLACEMENT.lastIndex = 0;
  while ((m = NOUN_FIRST_MODAL_REPLACEMENT.exec(text))) {
    const replacementIndex = m.index;
    const component = normalizedComponent(precedingReplacementObject(text, replacementIndex));
    if (!component) continue;
    const condition = replacementCondition(text, replacementIndex) || `${m[2]} be required`;
    found.push({
      component,
      evidence: text.slice(sentenceStart(text, replacementIndex), sentenceEnd(text, replacementIndex)).trim(),
      diagnosisDependent: true,
      condition,
      sourceIndex: replacementIndex,
    });
  }

  REPLACEMENT_LIST.lastIndex = 0;
  while ((m = REPLACEMENT_LIST.exec(text))) {
    const before = text.slice(sentenceStart(text, m.index), m.index);
    if (/\b(?:avoid|never|do not|don'?t|rather than|instead of)\b[\s\S]*$/i.test(before)) continue;
    const heading = precedingReplacementObject(text, m.index);
    const list = m[1] || '';
    for (const rawObject of replacementObjects(list)) {
      const component = normalizedComponent(rawObject);
      if (!component) continue;
      found.push({
        component,
        evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
        diagnosisDependent: false,
        sourceIndex: m.index,
      });
    }
    const headingComponent = normalizedComponent(heading);
    if (headingComponent) {
      found.push({
        component: headingComponent,
        evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
        diagnosisDependent: false,
        sourceIndex: m.index,
      });
    }
  }

  FIX_IS_PART.lastIndex = 0;
  while ((m = FIX_IS_PART.exec(text))) {
    const condition = replacementCondition(text, m.index);
    for (const rawObject of replacementObjects(m[1] || '')) {
      const component = normalizedComponent(rawObject);
      if (!component) continue;
      found.push({
        component,
        evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
        diagnosisDependent: Boolean(condition),
        ...(condition ? { condition } : {}),
        sourceIndex: m.index,
      });
    }
  }

  BUY_COMMAND.lastIndex = 0;
  while ((m = BUY_COMMAND.exec(text))) {
    if (!imperativeCommand(text, m.index, m[0])) continue;
    const after = text.slice(m.index + m[0].length).split(/[.;!?\u2013\u2014]/)[0]!.slice(0, 300);
    if (NEGATED_REPLACEMENT_PREDICATE.test(after.replace(/\([^)]*\)/g, ' '))) continue;
    const partNumberObject = after.match(/\bpart\s+number\s+[A-Z0-9-]+\s*\(([^)]+)\)/i)?.[1];
    const condition = replacementCondition(text, m.index, after);
    const commandObject = partNumberObject || after
      .replace(/\s+\+\s+.*$/, '')
      .replace(/\s+by\s+part\s+number\b.*$/i, '');
    for (const rawObject of replacementObjects(commandObject)) {
      if (NON_PART_ACTION.test(rawObject.trim())) break;
      const component = normalizedComponent(rawObject);
      if (!component) continue;
      found.push({
        component,
        evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
        diagnosisDependent: Boolean(condition),
        ...(condition ? { condition } : {}),
        sourceIndex: m.index,
      });
    }
  }

  found.sort((a, b) => a.sourceIndex - b.sourceIndex);
  const unique = new Map<string, PrescribedRepairComponent>();
  for (const indexed of found) {
    const item: PrescribedRepairComponent = {
      component: indexed.component,
      evidence: indexed.evidence,
      diagnosisDependent: indexed.diagnosisDependent,
      ...(indexed.condition ? { condition: indexed.condition } : {}),
    };
    if (!unique.has(item.component)) unique.set(item.component, item);
  }
  return [...unique.values()];
}

export function extractPrescribedParts(solution: string): string[] {
  return extractPrescriptionComponents(solution).map((item) => item.component);
}
