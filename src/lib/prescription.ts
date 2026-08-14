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
const PRESCRIBE = /\b(?:replaces?|replacing|replacement of|installs?|installing|retrofit(?:ting)?|swap(?:ping)?(?:\s+or\s+replace)?|upgrad(?:e|ing))\b/gi;

/** Imperative purchase/install verbs that name a buyable repair item. */
const BUY_COMMAND = /\b(?:add|apply|seal|reseal(?:ing)?|order|source|use|fit|fitting|run|buy|purchase|pair|switch(?:ing)?\s+to|press(?:ing)?\s+in|convert(?:ing)?|weld(?:ing)?\s+in|bolt(?:ing)?\s+on)\b/gi;

/** Passive/modal forms used by repair prose where the part precedes the verb. */
const MODAL_REQUIRES_REPLACEMENT = /\b(may|might|can|could)\s+require\s+((?:(?:the|a|an)\s+)?[a-z0-9][a-z0-9/-]*(?:\s+[a-z0-9][a-z0-9/-]*){0,5})\s+replacement\b/gi;
const PART_BEFORE_REPLACEMENT = /\b(?:(?:may|might|can|could|must|should|will)\s+(?:(?:need|require)s?\s+(?:(?:hardware\s+)?replacement|to\s+be\s+replaced)|be\s+replaced)|(?:is|are|was|were)\s+to\s+be\s+replaced|(?:needs?|requires?)\s+(?:hardware\s+)?replacement|(?:needs?|requires?)\s+to\s+be\s+replaced)\b/gi;
const MODAL_NEEDS_OBJECT = /\b(may|might|can|could|must|should|will)\s+(?:need|needs|require|requires)\s+([^.;!?\u2013\u2014]{1,180})/gi;
const NOUN_FIRST_MODAL_REPLACEMENT = /\breplacement\b([^.!?]{0,140}?)\b(may|might|can|could|must|should|will)\s+be\s+(?:required|needed)\b/gi;
const REPLACEMENT_LIST = /\breplacement\s*:\s*([^.!?]+)/gi;
const FIX_IS_PART = /\b(?:(?:the\s+)?(?:only\s+)?(?:durable\s+|proper\s+|permanent\s+)?fix|the\s+accepted\s+repair)\s+is\s+([^.;!?\u2013\u2014]+)/gi;
const REBUILD_WITH_PARTS = /\b(?:rebuild|rebuilding)\b[^.;!?\u2013\u2014]{0,120}?\bwith\s+([^.;!?\u2013\u2014]+)/gi;
const MODAL_INVOLVES_PARTS = /\b(?:repairs?|repair work)\s+(may|might|can|could)\s+(?:involve|include)\s+([^.;!?\u2013\u2014]{1,180})/gi;
const PART_REPLACEMENT_REQUIRED = /\breplacement\s+(?:(?:is|was)\s+|(?:may|might|can|could)\s+be\s+)?(?:required|needed|recommended|necessary)\b/gi;

/**
 * A clause is NOT a prescription when the verb is negated or conditional:
 * "before replacing", "instead of replacing", "do not replace", "rather than
 * replacing". These appear constantly in diagnostic guidance and each one names
 * a part the article is steering you AWAY from.
 */
const NEGATED_BEFORE = /(?:\b(?:before|after|prior to|instead of|rather than|without|avoid|unnecessar\w*|don'?t|do not|never|no need to|no need for|no reason to|no benefit in|little benefit in)\s+(?:\w+\s+){0,2}|\b(?:may|might|can|could|does|do|did)\s+not\s+(?:involve|include)\s+|\b(?:not|no)\s+)$/i;
// Post-object negation must describe the replacement instruction itself. A
// later bare "not" often belongs to a qualifier ("not all four") or a fault
// condition ("if the actuator is not engaging") and must not erase the buyable
// object. These predicates are deliberately narrow grammatical statements that
// the replacement is unnecessary, prohibited, or discouraged.
const NEGATED_REPLACEMENT_PREDICATE = /\b(?:(?:is|are|was|were|seems?|remains?)\s+(?:not\s+(?:recommended|required|needed|advised|appropriate|necessary|beneficial)|unnecessar\w*|prohibit\w*|inadvis\w*|contraindicat\w*|unwarrant\w*)|(?:should|must|ought\s+to)\s+(?:not\s+be\s+(?:used|done|performed|installed|replaced)|be\s+(?:avoided|prohibited|discouraged)))\b/i;
const NON_PRESCRIPTIVE_BEFORE = /\b(?:costs?|price|estimate|labor|time)\s+(?:(?:for|to|of)\s+)?$/i;

/** Words that qualify a part without identifying it. */
const NOISE = new Set([
  'the', 'a', 'an', 'this', 'that', 'these', 'those', 'its', 'his', 'her', 'their',
  'failed', 'failing', 'faulty', 'bad', 'good', 'weak', 'worn', 'rusted', 'perforated', 'compromised', 'broken', 'old', 'new', 'fresh', 'entire', 'complete', 'whole', 'full',
  'affected', 'identified', 'damaged', 'leaking', 'cracked', 'defective', 'original', 'oem', 'assembly', 'assemblies',
  'genuine', 'updated', 'revised', 'improved', 'correct', 'proper', 'both', 'all',
  'any', 'each', 'one', 'two', 'four', 'six', 'eight',
  'again', 'usually', 'typically', 'often', 'frequently', 'persistently', 'structurally', 'simply', 'just', 'too', 'consider', 'ensure',
  'immediately', 'simultaneously', 'themselves', 'sometimes', 'promptly', 'proactively', 'preventively', 'replacement', 'work',
]);

/** Single words that name nothing buyable. Anything else standing alone — an
 *  acronym like FPDM, TIPM, PCV — is a real part name and is kept. */
const VAGUE = new Set(['it', 'them', 'this', 'that', 'one', 'unit', 'part', 'component', 'item', 'piece']);

/** Trailing words that start a new thought rather than continue the part name. */
const STOP = /^(?:with|without|using|including|per|as|if|when|where|after|before|then|to|for|on|in|at|from|of|under|because|since|which|that|they|is|are|may|might|can|could|must|should|will|run|diy|plus|along|by|during|while|into|through|around|about|sized|so|rather|straight|wired|only|regardless)$/i;
const NON_PART_ACTION = /^(?:(?:either\s+)?use|replace|replacing|install|fit|add|order|source|inspect|check|test|diagnos|clean|flush|bleed|verify|confirm|measure|machine|resurface|repair|service|reprogram|program|reset|tighten|remove|free|seal|treat|prime|change|switch|fixing|adjust|avoid)\b/i;
const SHARED_NOUN_QUALIFIER = /^(?:cam|camshaft|crank|crankshaft|front|rear|upper|lower|inner|outer|interior|exterior|left|right|driver|passenger|track-bar|radius-arm)$/i;
const BUYABLE_NOUN_SOURCE = '(?:pump|sensor|hub|accumulator|thermostat|radiator|condenser|compressor|alternator|starter|batter(?:y|ies)|belt|tensioner|pulley|bearing|race|bushing|brush|bolt|stud|clamp|tube|axle|grommet|seal|gasket|hose|filter|valve|body|module|switch|motor|actuator|solenoid|ignitor|coil|rotor|pad|caliper|cylinder|clutch|converter|manifold|injector|plug|housing|bracket|kit|latch|blower|core|tank|bottle|cap|pipe|driveshaft|shaft|link|joint|end|differential|turbo|intercooler|lifter|piston|ring|transmission|distributor|dashboard|interlock|wire|cable|connector|fitting|synchronizer|synchro|sprag|o-ring|relay|resistor|weatherstrip|weatherstripping|strip|nut|mount|modulator|engine|block|head|screen|digitizer|idler|unit|rack|drier|dryer|case|shim|panel|quarter|controller|tuner|boot|tape|sealer|sealant|silicone|adhesive|undercoat|primer|paint|sink|regulator|absorber|shock|strut|strap|windshield|linkage|insert|gear|gearset|handle|tire|chain|guide|valve-guide|sprocket|line|spacer|carburetor|cooler|leadframe|lead-frame|brace|bar|adapter|can|harness|conductor|cover|hanger|knuckle|spindle|spring|light|glass|clip|hardware|rocker|post|tub|conversion|blade|dipstick|governor|transaxle|washer|door|phaser|shield|shroud|roller|cluster|device|heater|hardtop|top|hood|spigot|exchanger|frame|subframe|camera|tune|cradle|column|pack|cell|ptu|apim|bcm|tcm|gem|cvt|pcm|fpdm|sjb|bccm|rcm)(?:s|es)?';
const BUYABLE_NOUN = new RegExp(`\\b${BUYABLE_NOUN_SOURCE}\\b`, 'i');
const PART_NAME_QUALIFIER_SOURCE = '(?:a|an|the|rear|front|upper|lower|full|complete|engine|cylinder|short|long|remanufactured|rebuilt|updated|revised|hydraulic|head|valve|main|control|torque|synchronizer|timing|vct|power|steering|water|oil|soft|mic|shift|solenoid|high-voltage|electric|column|intake|agm)';
const BUYABLE_HEAD_NOUN = new RegExp(
  `(?:\\b${BUYABLE_NOUN_SOURCE}(?:\\s+[a-z0-9/-]+){0,2}\\s+(?:packs?|portions?|pieces?|sections?|accessor(?:y|ies))|\\b${BUYABLE_NOUN_SOURCE})(?:\\s+[a-z0-9.-]*\\d[a-z0-9.-]*)?$`,
  'i',
);
const NOMINAL_PART_REPLACEMENT = new RegExp(
  `\\b((?:(?:${PART_NAME_QUALIFIER_SOURCE})\\s+|(?:short|long|valve|control|timing)-){0,6}${BUYABLE_NOUN_SOURCE}(?:\\s+(?:assembly|assemblies|units|sections))?)\\s+replacement\\b`,
  'gi',
);
const AVAILABLE_PARTS = new RegExp(`\\b((?:(?:aftermarket|replacement|repair|conversion|upgrade|upgraded|patch|complete|rear|front|upper|lower|left|right|wheel|arch|quarter)\\s+){0,5}${BUYABLE_NOUN_SOURCE})\\s+(?:is|are)\\s+(?:(?:also|readily|widely|commercially)\\s+)?available\\b`, 'gi');
const AVAILABLE_PART_WITH_DETAILS = new RegExp(
  `\\b((?:(?:a|an|the|aftermarket|replacement|repair|conversion|upgrade|upgraded|rebuilt|remanufactured|complete|rear|front|upper|lower|auto|start-stop|eliminator)\\s+){0,8}${BUYABLE_NOUN_SOURCE}(?:\\s+(?:assemblies|units|devices|sections))?)(?:\\s+with\\b[^.!?]{0,60})?\\s+(?:is|are)\\s+(?:(?:also|readily|widely|commercially)\\s+)?available\\b`,
  'gi',
);
const PART_CAN_SOLVE = new RegExp(
  `\\b((?:(?:a|an|the|aftermarket|replacement|repair|thread|shift|transgo|conversion|upgrade|upgraded|dedicated|rebuilt|remanufactured|complete)\\s+){0,6}${BUYABLE_NOUN_SOURCE}(?:\\s+(?:assemblies|units|devices|sections))?)\\b[^.!?]{0,80}?\\bcan\\s+(?:[a-z-]+\\s+){0,2}(?:address|restore|correct|resolve|prevent|reduce|improve|eliminate)\\b`,
  'gi',
);
const CONSIDER_PART = new RegExp(
  `\\bconsider(?:\\s+(?:installing|adding|using))?\\s+((?:(?:a|an|the|aftermarket|replacement|repair|conversion|upgrade|upgraded|dedicated|rebuilt|remanufactured|complete|engine|block|oil|catch)\\s+){0,6}${BUYABLE_NOUN_SOURCE})\\b`,
  'gi',
);
const CONDITIONAL_COSTED_OPTION = new RegExp(
  `\\b(can|may|could)\\s+work\\b[^.!?]{0,180}?\\$\\s*\\d[\\d,]*(?:\\.\\d{2})?\\s+((?:(?:aftermarket|replacement|repair|conversion|complete|outer|inner|front|rear)\\s+){0,5}${BUYABLE_NOUN_SOURCE}(?:\\s+kit)?)\\b`,
  'gi',
);
const BENEFICIAL_AFTERMARKET_UPGRADE = new RegExp(
  `\\b(aftermarket\\s+(?:(?:front|rear|upper|lower|larger|upgraded)\\s+){0,3}${BUYABLE_NOUN_SOURCE})\\s+upgrades?\\b[^.!?]{0,120}?\\b(?:reduce|prevent|improve|address|limit)s?\\b`,
  'gi',
);
const RECOMMENDED_PART = new RegExp(
  `\\b((?:(?:a|an|the|new|oem|aftermarket|carbon|fiber|one-piece|aluminum|steel|complete|full|upgraded|larger|front|rear|left|right|high-strength)\\s+){0,8}${BUYABLE_NOUN_SOURCE})\\s*(?:\\([^)]*\\))?\\s+(?:is|are)\\s+(?:recommended|preferred)\\b`,
  'gi',
);
const OFFERED_PART = new RegExp(
  `\\b(?:sells?|offers?)\\s+(?:a|an|the)?\\s*((?:[a-z0-9-]+\\s+){0,5}${BUYABLE_NOUN_SOURCE}(?:\\s+accessory)?)\\b`,
  'gi',
);
const ANTECEDENT_PART = new RegExp(
  `\\b(?:the|a|an|this|that)\\s+((?:[a-z0-9][a-z0-9/-]*\\s+){0,5}?${BUYABLE_NOUN_SOURCE})\\b`,
  'gi',
);
const ANAPHORIC_OBJECT = /^(?:(?:the|this|that|a|an)\s+)?(?:(failed|faulty|worn|damaged|affected)\s+)?(it|them|these|those|this|that|one|units?|parts?|components?|items?|pieces?)?(?:\s+(?:first|only))?(?:\s+(?:at|during|after|before)\b[\s\S]*)?$/i;
const LOOSE_PART_PHRASE_SOURCE = `(?:(?:(?:\\d+\\.\\d+|[a-z0-9][a-z0-9/-]*)\\s+){0,5}${BUYABLE_NOUN_SOURCE}(?:\\s*\/\\s*${BUYABLE_NOUN_SOURCE})?(?:\\s+(?:assembly|assemblies|units|sections|kit))?)`;
const REPLACEMENT_WITH_PART = new RegExp(`\\breplacement\\s+with\\s+(?:an|a|the)?\\s*(${LOOSE_PART_PHRASE_SOURCE})`, 'gi');
const PASSIVE_PART_REPLACED = new RegExp(`\\b(${LOOSE_PART_PHRASE_SOURCE})(?:\\s*,?\\s+which)?\\s+(?:is|are|was|were)\\s+(?:usually\\s+|commonly\\s+|typically\\s+)?replaced\\b`, 'gi');
const BARE_PART_REPLACED = new RegExp(`\\b(${LOOSE_PART_PHRASE_SOURCE})\\s+replaced\\b`, 'gi');
const HAVE_PART_REPLACED = new RegExp(`\\b(?:has|have)\\s+had\\s+(?:an|a|the)?\\s*(${LOOSE_PART_PHRASE_SOURCE})\\s+replaced\\b`, 'gi');
const FAILED_PART_REPLACEMENT = new RegExp(
  `\\b(?:if|when)\\s+(?:the\\s+)?(${LOOSE_PART_PHRASE_SOURCE})\\b[^,.;!?]{0,80}?\\b(?:failed|faulty|damaged|cracked|worn)\\b[^,.;!?]*,\\s*replacement(?:\\s+and\\s+(?:programming|coding|calibration))?\\s+(?:is|may\\s+be|might\\s+be|can\\s+be|could\\s+be)\\s+(?:necessary|required|needed|recommended)\\b`,
  'gi',
);
const COMMONLY_REPLACED_PART = new RegExp(
  `\\b(${LOOSE_PART_PHRASE_SOURCE})(?:\\s*\\([^)]*\\))?\\s+(?:is|are)\\s+(?:the\\s+)?(?:most\\s+)?commonly\\s+replaced\\s+(?:component|part|unit)\\b`,
  'gi',
);
const REPAIR_WITH_PART = new RegExp(
  `\\b(?:repair|restore|fix)\\b[^.;!?]{0,100}?\\bwith\\s+(?:an|a|the)?\\s*(${LOOSE_PART_PHRASE_SOURCE})`,
  'gi',
);
const REPLACEMENT_PART_COST = new RegExp(`\\breplacement\\s+(${LOOSE_PART_PHRASE_SOURCE})\\s+costs?\\b`, 'gi');
const CHEAPER_REPLACEMENT_PART = new RegExp(
  `\\b((?:(?:aftermarket|remanufactured|rebuilt|replacement)\\s+){1,3}${LOOSE_PART_PHRASE_SOURCE})\\b[^.;!?]{0,80}?\\bcheaper\\s+than\\s+(?:dealer|oem)\\s+replacement\\b`,
  'gi',
);
const REPLACEMENT_OPTION_PART = new RegExp(`\\b(${LOOSE_PART_PHRASE_SOURCE})\\s+replacement\\b[^.;!?]{0,80}?\\bis\\s+an\\s+option\\b`, 'gi');
const CASES_INVOLVE_PARTS = /\b(?:persistent|severe|advanced)\s+cases?\s+(?:may\s+)?involve\s+([^.;!?]{1,180})/gi;
const REQUIRES_REPAIR_KIT = new RegExp(`\\brequires?\\b[^.;!?]{0,140}?\\b(${LOOSE_PART_PHRASE_SOURCE}\\s+repair\\s+kits?)\\b`, 'gi');
const RELATIVE_PART_REPLACED = new RegExp(
  `\\b(?:an|a|the)?\\s*((?:(?:failing|failed|faulty|damaged|worn)\\s+)?(?:(?:[a-z0-9][a-z0-9/-]*\\s+){0,4}${BUYABLE_NOUN_SOURCE}))\\s*,\\s*which\\s+(?:is|are|was|were)\\s+replaced\\b`,
  'gi',
);
const PART_REQUIRES_ACCESS_TO_REPLACE = /\b(?:a|an|the)\s+((?:(?:failing|failed|faulty|damaged|worn)\s+)?[a-z0-9][a-z0-9/-]*(?:\s+[a-z0-9][a-z0-9/-]*){0,5})\s*,\s*which\s+requires?\b[^.;!?]{0,120}?\bto\s+replace\b/gi;
const RELATIVE_ACRONYM_REPLACED = /\b([A-Z][A-Z0-9/-]{1,})\s*,\s*which\s+(?:is|are|was|were)\s+replaced\b/g;
const IDENTIFIED_FAILED_PART = new RegExp(
  `\\b(?:identify|determine|confirm)\\s+which\\s+(${LOOSE_PART_PHRASE_SOURCE})\\s+(?:has|have)\\s+failed\\b`,
  'gi',
);
const PART_WITH_COST = new RegExp(
  `\\b(${LOOSE_PART_PHRASE_SOURCE}(?:\\s+with\\s+${LOOSE_PART_PHRASE_SOURCE})?)\\s+costs?\\s+\\$`,
  'gi',
);
const COMMON_REPAIRS_ARE = /\bcommon\s+repairs?\s+(?:are|include)\s+([^.;!?]{1,220})/gi;
const PATCHED_WITH_PART = new RegExp(`\\b(?:patched|repaired|restored)\\s+with\\s+(?:an|a|the)?\\s*(${LOOSE_PART_PHRASE_SOURCE})`, 'gi');
const REFRESH_PART_LIST = /\brefresh\b[^:.;!?]{0,100}:\s*([^.;!?]{1,220})/gi;
const FIX_INVOLVES_APPLYING = new RegExp(`\\bfix\\s+involves\\s+applying\\s+(?:an|a|the)?\\s*(${LOOSE_PART_PHRASE_SOURCE})`, 'gi');
const REQUIRES_NEW_PART = new RegExp(
  `\\brequires?\\b[^.;!?]{0,160}?\\b((?:(?:new|replacement|updated|revised|remanufactured|rebuilt)\\s+){1,3}${LOOSE_PART_PHRASE_SOURCE})`,
  'gi',
);
const FUNCTIONAL_BOLT_ON_KIT = new RegExp(
  `\\b((?:bolt-on\\s+(?:[a-z0-9/-]+\\s+){1,6}kits?)|(?:(?:[a-z0-9/-]+\\s+){0,5}${BUYABLE_NOUN_SOURCE}\\s+kits?))\\b[^.!?]{0,180}?\\b(?:add|include|provide|convert)s?\\b`,
  'gi',
);

export interface PrescribedRepairComponent {
  component: string;
  evidence: string;
  diagnosisDependent: boolean;
  condition?: string;
}

function cleanPhrase(raw: string): string {
  const words = raw
    .replace(/\bevery\s+(?:(?:roughly|about|approximately)\s+|~\s*)?\d[\d,]*(?:\s*(?:miles?|mi|km|months?|years?|hours?))?[\s\S]*$/i, '')
    .toLowerCase()
    .replace(/^screwed\s+up\s+/, '')
    .replace(/\([^)]*\)/g, ' ')          // drop parentheticals
    .replace(/['’]s\b/g, '')             // driver's -> driver
    .replace(/[^a-z0-9\s/.-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const out: string[] = [];
  for (let wordIndex = 0; wordIndex < words.length; wordIndex += 1) {
    const w = words[wordIndex]!;
    if (w === 'can' && out.at(-1) === 'catch') {
      out.push(w);
      continue;
    }
    if (w === 'at' && /^tires?$/.test(words[wordIndex + 1] || '')) {
      out.push(w);
      continue;
    }
    if ((STOP.test(w) || VAGUE.has(w)) && out.length === 0) return '';
    if (STOP.test(w) && out.length > 0) break;   // stop at a new clause
    if (NOISE.has(w)) continue;
    out.push(w);
    // Part names are short. Beyond four significant words we are collecting
    // sentence, not part, and every extra token over-constrains the catalog
    // query into returning nothing.
    if (out.length >= 10) break;
  }
  return out.join(' ').replace(/\s+(?:and|or)$/i, '').trim();
}

function sentenceStart(text: string, index: number): number {
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    const character = text[cursor]!;
    if (character === '.' && /\d/.test(text[cursor - 1] || '') && /\d/.test(text[cursor + 1] || '')) continue;
    if (/[.;!?]/.test(character)) return cursor + 1;
  }
  return 0;
}

function sentenceEnd(text: string, index: number): number {
  const boundary = clauseBoundaryIndex(text, index, false);
  return boundary < 0 ? text.length : boundary + 1;
}

function clauseBoundaryIndex(text: string, start: number, includeClauseSeparators = true): number {
  for (let index = start; index < text.length; index += 1) {
    const character = text[index]!;
    if (character === '.' && /\d/.test(text[index - 1] || '') && /\d/.test(text[index + 1] || '')) continue;
    if (character === '.' && /^(?:e\.g\.|i\.e\.)$/i.test(
      text.slice(Math.max(0, index - 3), index + 3).match(/(?:e\.g\.|i\.e\.)/i)?.[0] || '',
    )) continue;
    if (/[!?]/.test(character) || character === '.'
      || (includeClauseSeparators && /[;\u2013\u2014]/.test(character))) return index;
  }
  return -1;
}

function firstClause(text: string, maxLength = 300): string {
  const boundary = clauseBoundaryIndex(text, 0);
  return text.slice(0, boundary < 0 ? undefined : boundary).slice(0, maxLength);
}

function replacementCondition(text: string, index: number, after = ''): string | undefined {
  const beforeInSentence = text.slice(sentenceStart(text, index), index).trim();
  return beforeInSentence.match(/\b(?:if|when|once|only after|after)\b[\s\S]*$/i)?.[0]?.trim()
    || beforeInSentence.match(/\b(?:in\s+)?severe cases?\b[\s\S]*$/i)?.[0]?.trim()
    || beforeInSentence.match(/^for\s+[^,]{1,100},?\s*$/i)?.[0]?.trim()
    || beforeInSentence.match(/\b(?:may|might|can|could|must|should|will)(?:\s+need\s+to)?\s*$/i)?.[0]?.trim()
    || after.match(/\b(?:may|might|can|could|must|should|will)\s+be\s+(?:required|needed)\b/i)?.[0]?.trim()
    || after.match(/\b(?:if|when|only if|only when)\b[\s\S]*$/i)?.[0]?.trim();
}

function normalizedComponent(raw: string): string {
  let phrase = cleanPhrase(raw
    .replace(/^\s*(?:and|or)\s+/i, '')
    .replace(/^\s*\/+\s*/, '')
    .replace(/\b(long|short|valve)-(?=[a-z])/gi, '$1 '));
  if (!phrase) return '';
  phrase = phrase.replace(/\b((?:head|control|screen|infotainment)\s+unit)\s+hardware$/i, '$1');
  if (/\b(?:control\s+(?:module|unit)|head\s+unit|screen\s+unit|omron\s+unit)$/i.test(phrase)) return phrase;
  const withoutArticle = raw.trim().replace(/^(?:the|a|an)\s+/i, '');
  const rawWithoutOem = withoutArticle.replace(/\bOEM\b/g, '').trim();
  const rawLooksLikeAcronym = /^[A-Z][A-Z0-9/-]{1,}$/.test(rawWithoutOem)
    || (!phrase.includes(' ') && /^(?:the|a|an)?\s*[A-Z][A-Z0-9/-]{1,}\b/.test(rawWithoutOem))
    || /\b(?:fpdm|tipm|pcv|bcm|ecm|tcm|ccu|abs|alb)\b/i.test(phrase)
    || /\b[a-z][a-z0-9/-]{1,}\s+(?:module|relay|sensor|pump|valve|unit|motor|assembly)\b/i.test(phrase);
  // Fluids themselves are not repair parts, but the same words are legitimate
  // qualifiers on buyable components (oil-fouled plugs, oil filter, coolant
  // hose). Reject only when no concrete part noun survives.
  if (/\b(?:ATF|PSF|coolant|fluid|oil|grease)\b/i.test(phrase) && !BUYABLE_NOUN.test(phrase)) return '';
  if (/^[a-z0-9-]+\s+unit$/i.test(phrase)
    && !/\b(?:control|head|screen|compressor|transfer|abs|alb|ccu|ecm|bcm|omron|na1|na2)\s+unit$/i.test(phrase)) return '';
  if (/^(?:sos|egmcartech)\s+kit$/i.test(phrase)) return '';
  if (/^ez-?out$/i.test(phrase)) return '';
  if (/^(?:remanufactured|rebuilt|replacement|aftermarket)\s+units?$/i.test(phrase)) return '';
  if (/^(?:hardware|units?|kits?|conversions?)$/i.test(phrase)) return '';
  const rawLooksLikeKnownPart = /\bfans?\b/i.test(phrase);
  if (!BUYABLE_HEAD_NOUN.test(phrase) && !rawLooksLikeAcronym && !rawLooksLikeKnownPart) return '';
  if (!phrase.includes(' ') && !phrase.includes('/') && !BUYABLE_NOUN.test(phrase) && !rawLooksLikeAcronym && !rawLooksLikeKnownPart) return '';
  return phrase;
}

function componentHeadNoun(value: string): string {
  const primary = String(value || '').split(/\b(?:with|over|under|on|in|at|from)\b/i, 1)[0] || '';
  const matches = [...primary.matchAll(new RegExp(`\\b(${BUYABLE_NOUN_SOURCE})\\b`, 'gi'))];
  return String(matches.at(-1)?.[1] || '').toLowerCase().replace(/(?:es|s)$/i, '');
}

function semanticComponentKey(value: string): string {
  const primary = String(value || '').split(/\b(?:with|over|under|on|in|at|from)\b/i, 1)[0] || '';
  const tokens = primary.toLowerCase().split(/\s+/).filter(Boolean)
    .filter((token) => !/^(?:aftermarket|replacement|new|oem|genuine|updated|revised|improved|assembly|assemblies)$/.test(token));
  if (tokens.length) tokens[tokens.length - 1] = tokens[tokens.length - 1]!.replace(/(?:es|s)$/i, '');
  return tokens.join(' ');
}

function replacementObjects(raw: string): string[] {
  const withoutTail = raw
    .replace(/\b(?:as a set|as an assembly|as one job|together)\b.*$/i, '')
    .replace(/\(([^)]*\b[a-z]*\d+(?:x|\.)\d+[a-z0-9.-]*[^)]*)\)/gi, ' $1 ')
    // firstClause may stop at an em dash inside a warning parenthesis. Strip
    // that unterminated warning as well as ordinary balanced parentheses so
    // "Replace the distributor (avoid cheap aftermarket — ...)" cannot turn
    // the warning into part of the component identity.
    .replace(/\([^)]*(?:\)|$)/g, ' ')
    .replace(/\bas\s+(?:(?:a|an|the)\s+)?(?:complete|full|new)\s+/i, ' ');
  const normalizedOperation = withoutTail.replace(/^\s*or\s+(?:machine|resurface)\s+/i, '');
  // "along with" joins additional repair parts; it is not the replacement
  // relation in "replace X with Y". Split it first so a later thermostat or
  // sensor cannot displace the primary manifold/synchronizer object.
  const alongWithParts = normalizedOperation.split(/\s+along\s+with\s+/i);
  const primaryOperation = alongWithParts.shift() || '';
  const leadingWith = /^\s*with\s+/i.test(primaryOperation);
  const withParts = !leadingWith ? primaryOperation.match(/^([\s\S]*?)\s+with\s+([\s\S]+)$/i) : null;
  const leftObject = withParts ? normalizedComponent(withParts[1] || '') : '';
  const rightObject = withParts ? normalizedComponent(withParts[2] || '') : '';
  const rightIsGeneric = /^(?:\s*(?:a|an|the|new|reman(?:ufactured)?|oem|genuine|high-strength|upgraded|replacement)\s+)*(?:parts?|units?|assembl(?:y|ies))\b/i
    .test(withParts?.[2] || '');
  const rightHead = componentHeadNoun(rightObject);
  const rightIsExplicitUpgrade = componentHeadNoun(leftObject) === rightHead
    && /\b(?:braided|stainless|aluminum|steel|metal|high-strength|one-piece|upgraded|revised|updated)\b/i
      .test(withParts?.[2] || '');
  const leftHasVariantQualifier = /\b(?:front|rear|upper|lower|inner|outer|interior|exterior|left|right|driver|passenger|bank\s+\d)\b/i
    .test(withParts?.[1] || '');
  const samePartRole = Boolean(leftObject && rightObject
    && (componentHeadNoun(leftObject) === rightHead || /^(?:unit|assembly)$/.test(rightHead)));
  const objectText = (withParts
    ? (rightObject && !rightIsGeneric && (!samePartRole || (rightIsExplicitUpgrade && !leftHasVariantQualifier))
      ? withParts[2]!
      : withParts[1]!)
    : primaryOperation.replace(/^\s*with\s+/i, ''))
    .replace(/\s+from\s+[\s\S]*$/i, '')
    .replace(/^\s*[^:]{0,100}\bparts?\s*:\s*/i, '');
  const objects = [objectText, ...alongWithParts]
    .flatMap((part) => part.split(/\s*,\s*(?:and(?:\s*\/\s*or)?\s+)?|\s+(?:and\s*\/\s*or|and|or|plus)\s+|\s*\+\s*/i));

  let sharedNoun: string | undefined;
  for (let index = objects.length - 1; index >= 0; index -= 1) {
    const object = objects[index]!.trim();
    const qualifier = object.replace(/^(?:(?:the|all|both|failed|failing|faulty|worn|damaged|affected)\s+)+/i, '');
    if (SHARED_NOUN_QUALIFIER.test(qualifier) && sharedNoun) {
      objects[index] = `${qualifier} ${sharedNoun}`;
      continue;
    }
    const nounMatches = [...object.matchAll(new RegExp(`\\b(${BUYABLE_NOUN_SOURCE})\\b`, 'gi'))];
    const noun = nounMatches.at(-1)?.[1];
    if (noun) {
      const words = object.replace(/^(?:(?:the|all|both)\s+)+/i, '').split(/\s+/);
      sharedNoun = SHARED_NOUN_QUALIFIER.test(words[0] || '') && words.length > 1
        ? words.slice(1).join(' ')
        : noun;
    }
    if (!SHARED_NOUN_QUALIFIER.test(qualifier) && !noun) sharedNoun = undefined;
  }
  return objects.map((object) => object
    .replace(/^\s*(?:(?:cleaning|adjusting|repairing|removing)\s+or\s+)?(?:replace|replacing|install|installing)\s+/i, '')
    .replace(/^\s*(?:or\s+)?(?:machine|resurface)\s+/i, '')
    .replace(/\s+called out\b[\s\S]*$/i, ''));
}

function directActionNegation(beforeInSentence: string): boolean {
  // Bind the negative word to this action. "To avoid recurrence, install X"
  // is positive; "avoid installing X" and "do not install X" are not.
  // A coordinating contrast starts a new instruction: "avoid replacing X but
  // replace Y" must preserve Y while still rejecting X.
  const governingClause = beforeInSentence.split(/\b(?:but|however)\b/i).at(-1) || beforeInSentence;
  return /(?:^|[,;:\u2013\u2014])\s*(?:do not|don'?t|never|avoid|instead of|rather than|without)\s+(?:[a-z0-9/-]+\s+){0,5}$/i
    .test(governingClause);
}

function prescribedObjectText(verb: string, after: string): string {
  let value = after
    .replace(/^\s*to\s+/i, '');
  const relativeClause = value.match(/\s+(?:that|which)\s+(?:replaces?|installs?|uses?|contains?|includes?)\b/i);
  if (relativeClause?.index != null) {
    const relativeTail = value.slice(relativeClause.index);
    const additionalParts = relativeTail.match(/,\s+along\s+with\s+[\s\S]+$/i)?.[0] || '';
    value = `${value.slice(0, relativeClause.index)}${additionalParts}`;
  }
  if (/^swap/i.test(verb)) {
    const replacement = value.match(/^[\s\S]*?\s+for\s+([\s\S]+)$/i)?.[1];
    // "swap the old pump for a new pump" names the RHS; "swap the full
    // half-shaft for under $100" is a price phrase and keeps the LHS.
    if (replacement && !/^(?:under|over|around|about|approximately|roughly|\$|\d)/i.test(replacement.trim())) value = replacement;
    else value = value.replace(/\s+for\s+(?:under|over|around|about|approximately|roughly)?\s*\$?[\d,]+[\s\S]*$/i, '');
  }
  return value;
}

function precedingReplacementObject(text: string, index: number): string {
  const prefix = text.slice(sentenceStart(text, index), index);
  const clause = prefix.split(/[,;:\u2013\u2014]/).at(-1)?.trim() || prefix.trim();
  return clause
    .replace(/^(?:and|or|then|some|the|a|an)\s+/i, '')
    .replace(/^\(?\d+\)?\s+/, '')
    .replace(/^DIY\s+/i, '')
    .replace(/^(?:acura|honda)\s+dealer\s+/i, '')
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
  return !prefix.trim()
    || /(?:[,;:\u2013\u2014]|\b(?:and|then|or))\s*$/i.test(prefix)
    || (/^fitting$/i.test(verb) && /\bby\s*$/i.test(prefix))
    || /\b(?:owners?|others|shops?|technicians?|builders?|restorers?|enthusiasts?|you|they|many)(?:\s+(?:also|commonly|often|typically))?\s*$/i.test(prefix);
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
    new RegExp(`\\b(?:pull|remove)(?!\\s+or\\b)\\s+(?:the|a|an)?\\s*((?:[a-z0-9][a-z0-9/-]*\\s+){0,5}?${BUYABLE_NOUN_SOURCE})\\b`, 'i'),
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

function pluralReplacementAntecedents(text: string, index: number): ReplacementAntecedent[] {
  const currentStart = sentenceStart(text, index);
  const previousStart = currentStart > 0 ? sentenceStart(text, currentStart - 1) : 0;
  const context = text.slice(previousStart, index);
  const conditionalList = context.match(new RegExp(
    `\\bif\\s+(?:the\\s+)?((?:[a-z0-9/-]+\\s+){0,4}?${BUYABLE_NOUN_SOURCE})\\s+(?:and|or)\\s+(?:the\\s+)?((?:[a-z0-9/-]+\\s+){0,4}?${BUYABLE_NOUN_SOURCE})\\s+(?:is|are|was|were|has|have|shows?|become)\\b`,
    'i',
  ));
  if (conditionalList?.[1] && conditionalList[2]) {
    return [conditionalList[1], conditionalList[2]]
      .map((raw) => normalizedComponent(raw))
      .filter(Boolean)
      .map((component) => ({ component, evidenceStart: previousStart }));
  }
  const conditionalPlural = context.match(new RegExp(`\\bif\\s+(?:the\\s+)?((?:[a-z0-9/-]+\\s+){0,4}?${BUYABLE_NOUN_SOURCE})\\s+(?:are|were|have|become)\\b`, 'i'));
  if (conditionalPlural?.[1]) {
    const component = normalizedComponent(conditionalPlural[1]);
    return component ? [{ component, evidenceStart: previousStart }] : [];
  }
  const inspected = context.trim().match(/\b(?:inspect|test|check)\s+([^.!?]{1,180}?)(?:\s+for\b[^.!?]*)?\.?$/i)?.[1];
  if (!inspected) return [];
  const components = replacementObjects(inspected).map(normalizedComponent).filter(Boolean);
  return [...new Set(components)].map((component) => ({ component, evidenceStart: previousStart }));
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
    if (NEGATED_BEFORE.test(before) || /\bnot\s+to\s*$/i.test(before) || NON_PRESCRIPTIVE_BEFORE.test(before)
      || (/^replacing$/i.test(m[0]) && /\b(?:avoid|never|do not|don'?t)\b/i.test(sentenceBefore))
      || /\b(?:kit|assembly|unit)\s+(?:that|which)\s*$/i.test(sentenceBefore)
      || directActionNegation(sentenceBefore)) continue;

    // Truncate at the sentence boundary FIRST. "Replace crankshaft position
    // sensor. Inspect the connector." otherwise yields "crankshaft position
    // sensor inspect", which queries nothing.
    const rawAfter = firstClause(text.slice(m.index + m[0].length));
    if (/^upgrad/i.test(m[0]) && (/^\s*path\s+to\b/i.test(rawAfter)
      || /^\s*(?:kits?|parts?|options?)\s+(?:is|are)\s+available\b/i.test(rawAfter))) continue;
    const after = prescribedObjectText(m[0], rawAfter);
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
        evidence: `${m[0]} ${after.trimStart()}`.trim(),
        diagnosisDependent: Boolean(condition),
        ...(condition ? { condition } : {}),
        sourceIndex: m.index,
      });
    }

    // A swap can require a separately purchasable conversion kit. Preserve it
    // as its own terminal work item instead of hiding it behind the replacement
    // unit's row.
    const usedKit = rawAfter.match(/\busing\s+(?:the|a|an)?\s*([^.;!?]{1,100}?\bkit)\b/i)?.[1];
    const kit = normalizedComponent(usedKit || '');
    if (kit) {
      found.push({
        component: kit,
        evidence: `${m[0]}${rawAfter}`.trim(),
        diagnosisDependent: Boolean(condition),
        ...(condition ? { condition } : {}),
        sourceIndex: m.index,
      });
    }

    const fullAnaphoricObject = after.replace(/\([^)]*\)/g, ' ').trim();
    const firstAnaphoricObject = String(objects[0] || '').replace(/\([^)]*\)/g, ' ').trim();
    const anaphoricObject = ANAPHORIC_OBJECT.test(fullAnaphoricObject)
      ? fullAnaphoricObject
      : firstAnaphoricObject;
    const hasObjectAtThisVerb = found.some((item) => item.sourceIndex === m!.index);
    const clauseBefore = text.slice(sentenceStart(text, m.index), m.index);
    const vagueReplacementObject = ANAPHORIC_OBJECT.test(anaphoricObject)
      || /^(?:with\s+)?(?:oem\s+)?(?:[a-z0-9-]+\s+)?unit(?:\s+at\b[\s\S]*)?$/i.test(anaphoricObject);
    if (!hasObjectAtThisVerb
      && vagueReplacementObject
      && !/\b(?:not|no|rather than|instead of)(?:\s+[a-z0-9/-]+){0,3}\s*$/i.test(clauseBefore)) {
      const anaphoricMatch = anaphoricObject.match(ANAPHORIC_OBJECT);
      const failureQualified = /^(?:failed|faulty|worn|damaged)$/i.test(anaphoricMatch?.[1] || '');
      const plural = /^(?:them|these|those|units|parts|components|items|pieces)$/.test(
        anaphoricMatch?.[2]?.toLowerCase() || '',
      );
      const unit = /^(?:(?:the|this|that|a|an)\s+)?unit\b/i.test(anaphoricObject);
      const costObject = /\bcosts?\b/i.test(clauseBefore) ? normalizedComponent(objectBeforeCostReplace(text, m.index)) : '';
      const antecedents = costObject
        ? [{
          component: costObject,
          evidenceStart: sentenceStart(text, Math.max(0, sentenceStart(text, m.index) - 1)),
        }]
        : plural
          ? pluralReplacementAntecedents(text, m.index)
        : unit
          ? [uniqueAntecedentByHeadNoun(text, m.index, 'unit')].filter((item): item is ReplacementAntecedent => Boolean(item))
        : coordinatedAntecedentIsAmbiguous(text, m.index)
          ? []
          : [uniqueReplacementAntecedent(text, m.index)].filter((item): item is ReplacementAntecedent => Boolean(item));
      for (const antecedent of antecedents) {
        found.push({
          component: antecedent.component,
          evidence: text.slice(antecedent.evidenceStart, sentenceEnd(text, m.index)).trim(),
          diagnosisDependent: Boolean(condition) || failureQualified,
          ...(condition || failureQualified ? { condition: condition || 'confirmed component failure' } : {}),
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
    const condition = replacementCondition(text, m.index)
      || (/\b(?:failed|faulty|damaged|cracked|worn)\b/i.test(rawObject) ? 'confirmed component failure' : undefined)
      || (modal && /^(?:may|might|can|could)$/i.test(modal) ? `${modal} replacement` : undefined);
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
    const parenthetical = rawObject.match(/\(\s*(?:and\s+)?(?:often\s+)?(?:the\s+)?([^)]*)\)/i)?.[1];
    for (const component of replacementObjects(parenthetical || '').map(normalizedComponent).filter(Boolean)) {
      found.push({
        component,
        evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
        diagnosisDependent: true,
        condition: condition || 'same confirmed repair condition',
        sourceIndex: m.index,
      });
    }
  }

  MODAL_NEEDS_OBJECT.lastIndex = 0;
  while ((m = MODAL_NEEDS_OBJECT.exec(text))) {
    const afterModal = ((m[2] || '').split(/\b(?:because|since|while|but)\b/i)[0] || '')
      .replace(/\s+(?:diagnosis|inspection)\s+and\s+replacement[\s\S]*$/i, '');
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
    if (/\b(?:diagnosis|inspection)\b/i.test(m[2] || '')) continue;
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

  MODAL_INVOLVES_PARTS.lastIndex = 0;
  while ((m = MODAL_INVOLVES_PARTS.exec(text))) {
    const condition = replacementCondition(text, m.index) || `${m[1]} involve`;
    for (const rawObject of replacementObjects(m[2] || '')) {
      const component = normalizedComponent(rawObject);
      if (!component) continue;
      found.push({
        component,
        evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
        diagnosisDependent: true,
        condition,
        sourceIndex: m.index,
      });
    }
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

  PART_REPLACEMENT_REQUIRED.lastIndex = 0;
  while ((m = PART_REPLACEMENT_REQUIRED.exec(text))) {
    const beforeReplacement = text.slice(sentenceStart(text, m.index), m.index);
    if (/\b(?:may|might|can|could)\s+require\b[\s\S]*\b(?:diagnosis|inspection)\s+and\s*$/i.test(beforeReplacement)) continue;
    const component = normalizedComponent(precedingReplacementObject(text, m.index));
    if (!component) continue;
    const condition = replacementCondition(text, m.index);
    found.push({
      component,
      evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
      diagnosisDependent: Boolean(condition),
      ...(condition ? { condition } : {}),
      sourceIndex: m.index,
    });
  }

  NOMINAL_PART_REPLACEMENT.lastIndex = 0;
  while ((m = NOMINAL_PART_REPLACEMENT.exec(text))) {
    const sentenceBefore = text.slice(sentenceStart(text, m.index), m.index);
    const sentenceAfter = text.slice(m.index + m[0].length, sentenceEnd(text, m.index));
    if (/^\s*:/.test(sentenceAfter)
      || NON_PRESCRIPTIVE_BEFORE.test(sentenceBefore)
      || /\b(?:costs?|price|estimate|labor|time)\b[^.!?]*$/i.test(sentenceBefore)
      || /^\s*(?:costs?|price)\b/i.test(sentenceAfter)
      || NEGATED_BEFORE.test(sentenceBefore)
      || directActionNegation(sentenceBefore)
      || NEGATED_REPLACEMENT_PREDICATE.test(sentenceAfter)) continue;
    const component = normalizedComponent(m[1] || '');
    if (!component) continue;
    if (component === 'cover' && /\bto\s*$/i.test(sentenceBefore)) continue;
    const condition = replacementCondition(text, m.index, sentenceAfter)
      || (/\bunder\s+(?:warranty|recall|campaign)\b/i.test(sentenceAfter) ? 'coverage-dependent replacement' : undefined);
    const coordinatedPrior = normalizedComponent(sentenceBefore.match(new RegExp(
      `((?:(?:${PART_NAME_QUALIFIER_SOURCE})\\s+|(?:short|long|valve|control|timing)-){0,6}${BUYABLE_NOUN_SOURCE}(?:\\s+(?:assembly|assemblies|units|sections))?)\\s+(?:and|or)\\s*$`,
      'i',
    ))?.[1] || '');
    if (coordinatedPrior && coordinatedPrior !== component) {
      found.push({
        component: coordinatedPrior,
        evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
        diagnosisDependent: Boolean(condition),
        ...(condition ? { condition } : {}),
        sourceIndex: m.index,
      });
    }
    found.push({
      component,
      evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
      diagnosisDependent: Boolean(condition),
      ...(condition ? { condition } : {}),
      sourceIndex: m.index,
    });
  }

  REPLACEMENT_WITH_PART.lastIndex = 0;
  while ((m = REPLACEMENT_WITH_PART.exec(text))) {
    const sentenceBefore = text.slice(sentenceStart(text, m.index), m.index);
    if (directActionNegation(sentenceBefore) || NEGATED_BEFORE.test(sentenceBefore)) continue;
    const component = normalizedComponent(m[1] || '');
    if (!component) continue;
    const sentenceAfter = text.slice(m.index + m[0].length, sentenceEnd(text, m.index));
    const condition = replacementCondition(text, m.index, sentenceAfter)
      || (/\bunder\s+(?:warranty|recall|campaign)\b/i.test(sentenceAfter) ? 'coverage-dependent replacement' : undefined);
    found.push({
      component,
      evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
      diagnosisDependent: Boolean(condition),
      ...(condition ? { condition } : {}),
      sourceIndex: m.index,
    });
  }

  PASSIVE_PART_REPLACED.lastIndex = 0;
  while ((m = PASSIVE_PART_REPLACED.exec(text))) {
    const sentenceBefore = text.slice(sentenceStart(text, m.index), m.index);
    if (directActionNegation(sentenceBefore) || NEGATED_BEFORE.test(sentenceBefore)) continue;
    const component = normalizedComponent(m[1] || '');
    if (!component) continue;
    const sentenceAfter = text.slice(m.index + m[0].length, sentenceEnd(text, m.index));
    const condition = replacementCondition(text, m.index, sentenceAfter)
      || (/\bunder\s+(?:warranty|recall|campaign)\b/i.test(sentenceAfter) ? 'coverage-dependent replacement' : undefined);
    found.push({
      component,
      evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
      diagnosisDependent: Boolean(condition),
      ...(condition ? { condition } : {}),
      sourceIndex: m.index,
    });
  }

  RELATIVE_PART_REPLACED.lastIndex = 0;
  while ((m = RELATIVE_PART_REPLACED.exec(text))) {
    const component = normalizedComponent(m[1] || '');
    if (!component) continue;
    found.push({
      component,
      evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
      diagnosisDependent: true,
      condition: 'confirmed persistent component failure',
      sourceIndex: m.index,
    });
  }

  PART_REQUIRES_ACCESS_TO_REPLACE.lastIndex = 0;
  while ((m = PART_REQUIRES_ACCESS_TO_REPLACE.exec(text))) {
    const component = normalizedComponent(m[1] || '');
    if (!component) continue;
    found.push({
      component,
      evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
      diagnosisDependent: true,
      condition: 'confirmed component failure',
      sourceIndex: m.index,
    });
  }

  RELATIVE_ACRONYM_REPLACED.lastIndex = 0;
  while ((m = RELATIVE_ACRONYM_REPLACED.exec(text))) {
    const component = normalizedComponent(m[1] || '');
    if (!component) continue;
    found.push({
      component,
      evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
      diagnosisDependent: true,
      condition: 'confirmed persistent component failure',
      sourceIndex: m.index,
    });
  }

  IDENTIFIED_FAILED_PART.lastIndex = 0;
  while ((m = IDENTIFIED_FAILED_PART.exec(text))) {
    const component = normalizedComponent(m[1] || '');
    if (!component) continue;
    found.push({
      component,
      evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
      diagnosisDependent: true,
      condition: 'identify the failed component first',
      sourceIndex: m.index,
    });
  }

  PART_WITH_COST.lastIndex = 0;
  while ((m = PART_WITH_COST.exec(text))) {
    const component = normalizedComponent(m[1] || '');
    if (!component) continue;
    found.push({
      component,
      evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
      diagnosisDependent: true,
      condition: 'confirmed failed component',
      sourceIndex: m.index,
    });
  }

  BARE_PART_REPLACED.lastIndex = 0;
  while ((m = BARE_PART_REPLACED.exec(text))) {
    if (/\b(?:has|have)\s+had\b/i.test(m[0])) continue;
    const sentenceBefore = text.slice(sentenceStart(text, m.index), m.index);
    if (directActionNegation(sentenceBefore) || NEGATED_BEFORE.test(sentenceBefore)
      || /\b(?:costs?|price|estimate|labor|time)\b/i.test(sentenceBefore)) continue;
    const component = normalizedComponent(m[1] || '');
    if (!component) continue;
    const sentenceAfter = text.slice(m.index + m[0].length, sentenceEnd(text, m.index));
    const condition = replacementCondition(text, m.index, sentenceAfter)
      || (/\bunder\s+(?:warranty|recall|campaign)\b/i.test(sentenceAfter) ? 'coverage-dependent replacement' : undefined);
    found.push({
      component,
      evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
      diagnosisDependent: Boolean(condition),
      ...(condition ? { condition } : {}),
      sourceIndex: m.index,
    });
  }

  HAVE_PART_REPLACED.lastIndex = 0;
  while ((m = HAVE_PART_REPLACED.exec(text))) {
    const component = normalizedComponent(m[1] || '');
    if (!component) continue;
    const condition = replacementCondition(text, m.index) || 'reported successful repair';
    found.push({
      component,
      evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
      diagnosisDependent: true,
      condition,
      sourceIndex: m.index,
    });
  }

  FAILED_PART_REPLACEMENT.lastIndex = 0;
  while ((m = FAILED_PART_REPLACEMENT.exec(text))) {
    const component = normalizedComponent(m[1] || '');
    if (!component) continue;
    const condition = replacementCondition(text, m.index) || 'confirmed component failure';
    found.push({
      component,
      evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
      diagnosisDependent: true,
      condition,
      sourceIndex: m.index,
    });
  }

  COMMONLY_REPLACED_PART.lastIndex = 0;
  while ((m = COMMONLY_REPLACED_PART.exec(text))) {
    const component = normalizedComponent(m[1] || '');
    if (!component) continue;
    found.push({
      component,
      evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
      diagnosisDependent: true,
      condition: 'identified failed component',
      sourceIndex: m.index,
    });
  }

  REPAIR_WITH_PART.lastIndex = 0;
  while ((m = REPAIR_WITH_PART.exec(text))) {
    if (/^repair\s+(?:is|was|costs?|can\s+be|may\s+be|could\s+be|must\s+be|should\s+be)\b/i.test(m[0])
      || /\b(?:do not|don'?t|never)\b/i.test(m[0])) continue;
    const sentenceBefore = text.slice(sentenceStart(text, m.index), m.index);
    if (directActionNegation(sentenceBefore) || NEGATED_BEFORE.test(sentenceBefore)) continue;
    const component = normalizedComponent(m[1] || '');
    if (!component) continue;
    const condition = replacementCondition(text, m.index);
    found.push({
      component,
      evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
      diagnosisDependent: Boolean(condition),
      ...(condition ? { condition } : {}),
      sourceIndex: m.index,
    });
  }

  REPLACEMENT_PART_COST.lastIndex = 0;
  while ((m = REPLACEMENT_PART_COST.exec(text))) {
    const component = normalizedComponent(m[1] || '');
    if (!component) continue;
    found.push({
      component,
      evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
      diagnosisDependent: true,
      condition: 'confirmed failed component',
      sourceIndex: m.index,
    });
  }

  CHEAPER_REPLACEMENT_PART.lastIndex = 0;
  while ((m = CHEAPER_REPLACEMENT_PART.exec(text))) {
    const component = normalizedComponent(m[1] || '');
    if (!component) continue;
    found.push({
      component,
      evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
      diagnosisDependent: true,
      condition: 'out-of-warranty replacement option',
      sourceIndex: m.index,
    });
  }

  REPLACEMENT_OPTION_PART.lastIndex = 0;
  while ((m = REPLACEMENT_OPTION_PART.exec(text))) {
    const component = normalizedComponent(m[1] || '');
    if (!component) continue;
    found.push({
      component,
      evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
      diagnosisDependent: true,
      condition: 'confirmed failed component',
      sourceIndex: m.index,
    });
  }

  CASES_INVOLVE_PARTS.lastIndex = 0;
  while ((m = CASES_INVOLVE_PARTS.exec(text))) {
    for (const rawObject of replacementObjects(m[1] || '')) {
      if (NON_PART_ACTION.test(rawObject.trim())) continue;
      const component = normalizedComponent(rawObject);
      if (!component) continue;
      found.push({
        component,
        evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
        diagnosisDependent: true,
        condition: 'persistent or severe case',
        sourceIndex: m.index,
      });
    }
  }

  REQUIRES_REPAIR_KIT.lastIndex = 0;
  while ((m = REQUIRES_REPAIR_KIT.exec(text))) {
    const component = normalizedComponent(m[1] || '');
    if (!component) continue;
    found.push({
      component,
      evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
      diagnosisDependent: true,
      condition: 'advanced damage',
      sourceIndex: m.index,
    });
  }

  COMMON_REPAIRS_ARE.lastIndex = 0;
  while ((m = COMMON_REPAIRS_ARE.exec(text))) {
    for (const rawObject of replacementObjects(m[1] || '')) {
      if (NON_PART_ACTION.test(rawObject.trim())) continue;
      const component = normalizedComponent(rawObject.replace(/\s+rebuild\s*$/i, ''));
      if (!component) continue;
      found.push({
        component,
        evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
        diagnosisDependent: true,
        condition: 'diagnose the failed transmission component first',
        sourceIndex: m.index,
      });
    }
  }

  PATCHED_WITH_PART.lastIndex = 0;
  while ((m = PATCHED_WITH_PART.exec(text))) {
    const component = normalizedComponent(m[1] || '');
    if (!component) continue;
    found.push({
      component,
      evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
      diagnosisDependent: true,
      condition: 'repairable localized damage',
      sourceIndex: m.index,
    });
  }

  REFRESH_PART_LIST.lastIndex = 0;
  while ((m = REFRESH_PART_LIST.exec(text))) {
    for (const rawObject of replacementObjects((m[1] || '').replace(/\s+as\s+needed[\s\S]*$/i, ''))) {
      const component = normalizedComponent(rawObject);
      if (!component) continue;
      found.push({
        component,
        evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
        diagnosisDependent: true,
        condition: 'replace only as inspection indicates',
        sourceIndex: m.index,
      });
    }
  }

  FIX_INVOLVES_APPLYING.lastIndex = 0;
  while ((m = FIX_INVOLVES_APPLYING.exec(text))) {
    const component = normalizedComponent(m[1] || '');
    if (!component) continue;
    found.push({
      component,
      evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
      diagnosisDependent: false,
      sourceIndex: m.index,
    });
  }

  REQUIRES_NEW_PART.lastIndex = 0;
  while ((m = REQUIRES_NEW_PART.exec(text))) {
    const component = normalizedComponent(m[1] || '');
    if (!component) continue;
    const condition = replacementCondition(text, m.index) || 'required repair part';
    found.push({
      component,
      evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
      diagnosisDependent: true,
      condition,
      sourceIndex: m.index,
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
    const sentenceBefore = text.slice(sentenceStart(text, m.index), m.index);
    if (directActionNegation(sentenceBefore) || /^\s*(?:not|never|no\b|do not|don'?t)\b/i.test(m[1] || '')) continue;
    const condition = replacementCondition(text, m.index);
    const fixObject = (m[1] || '').replace(/^\s*(?:replace|replacing|replacement of|install|installing)\s+/i, '');
    const fixObjects = replacementObjects(fixObject);
    const withLeft = normalizedComponent(fixObject.match(/^([\s\S]*?)\s+with\s+[\s\S]+$/i)?.[1] || '');
    if (withLeft && !fixObjects.some((raw) => componentHeadNoun(normalizedComponent(raw)) === componentHeadNoun(withLeft))) {
      fixObjects.unshift(withLeft);
    }
    for (const rawObject of fixObjects) {
      if (NON_PART_ACTION.test(rawObject.trim())) continue;
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

  REBUILD_WITH_PARTS.lastIndex = 0;
  while ((m = REBUILD_WITH_PARTS.exec(text))) {
    const sentenceBefore = text.slice(sentenceStart(text, m.index), m.index);
    if (directActionNegation(sentenceBefore)) continue;
    const condition = replacementCondition(text, m.index);
    const rebuildSubject = normalizedComponent(precedingReplacementObject(text, m.index));
    if (rebuildSubject && /\bo-?rings?\b/i.test(rebuildSubject)) {
      found.push({
        component: `${rebuildSubject} rebuild kit`,
        evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
        diagnosisDependent: Boolean(condition),
        ...(condition ? { condition } : {}),
        sourceIndex: m.index,
      });
    }
    for (const rawObject of rebuildSubject && /\bo-?rings?\b/i.test(rebuildSubject)
      ? [] : replacementObjects(m[1] || '')) {
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
    const sentenceBefore = text.slice(sentenceStart(text, m.index), m.index);
    if (directActionNegation(sentenceBefore) || NEGATED_BEFORE.test(sentenceBefore)) continue;
    const after = firstClause(text.slice(m.index + m[0].length));
    if (NEGATED_REPLACEMENT_PREDICATE.test(after.replace(/\([^)]*\)/g, ' '))) continue;
    const partNumberObject = after.match(/\bpart\s+number\s+[A-Z0-9-]+\s*\(([^)]+)\)/i)?.[1];
    const preventionCondition = /^fitting$/i.test(m[0]) && /\bby\s*$/i.test(sentenceBefore)
      ? 'optional prevention branch'
      : undefined;
    const condition = replacementCondition(text, m.index, after) || preventionCondition;
    const commandObject = partNumberObject || after
      .replace(/^\s*(?:it\s+with|to)\s+/i, '')
      .replace(/\s+\+\s+.*$/, '')
      .replace(/\s+by\s+part\s+number\b.*$/i, '');
    // "Use a replacement hose with updated crimp fittings" names one hose;
    // the fittings describe that assembly rather than a second owner-buyable
    // repair row. Preserve the commanded LHS when a use/fit instruction's RHS
    // is explicitly an integrated/updated feature. Coordinated "with a new
    // gasket" instructions remain eligible through the ordinary splitter.
    const integratedUseObject = /^(?:use|fit|fitting)$/i.test(m[0])
      ? commandObject.match(/^([\s\S]*?\b(?:assembly|hose|line|module|unit|kit))\s+with\s+(?:updated|integrated|built-in|preinstalled|attached)\b/i)?.[1]
      : undefined;
    for (const rawObject of replacementObjects(integratedUseObject || commandObject)) {
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
    // A comma before "plus" can terminate the primary list in prose such as
    // "Use tape and sealer called out in the manual, plus sealant #123".
    // Preserve the explicitly commanded final material as its own component.
    const plusObject = after.match(/\bplus\s+([^.;!?]+)/i)?.[1];
    const plusComponent = normalizedComponent(plusObject || '');
    if (plusComponent) {
      found.push({
        component: plusComponent,
        evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
        diagnosisDependent: Boolean(condition),
        ...(condition ? { condition } : {}),
        sourceIndex: m.index,
      });
    }
  }

  FUNCTIONAL_BOLT_ON_KIT.lastIndex = 0;
  while ((m = FUNCTIONAL_BOLT_ON_KIT.exec(text))) {
    const component = normalizedComponent(m[1] || '');
    if (!component) continue;
    found.push({
      component,
      evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
      diagnosisDependent: false,
      sourceIndex: m.index,
    });
  }

  CONDITIONAL_COSTED_OPTION.lastIndex = 0;
  while ((m = CONDITIONAL_COSTED_OPTION.exec(text))) {
    const component = normalizedComponent(m[2] || '');
    if (!component) continue;
    found.push({
      component,
      evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
      diagnosisDependent: true,
      condition: `${m[1]} work`,
      sourceIndex: m.index,
    });
  }

  BENEFICIAL_AFTERMARKET_UPGRADE.lastIndex = 0;
  while ((m = BENEFICIAL_AFTERMARKET_UPGRADE.exec(text))) {
    const component = normalizedComponent(m[1] || '');
    if (!component) continue;
    found.push({
      component,
      evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
      diagnosisDependent: false,
      sourceIndex: m.index,
    });
  }

  RECOMMENDED_PART.lastIndex = 0;
  while ((m = RECOMMENDED_PART.exec(text))) {
    const sentenceBefore = text.slice(sentenceStart(text, m.index), m.index);
    if (NEGATED_BEFORE.test(sentenceBefore)
      || /\bno\s+replacement\s+of\b/i.test(sentenceBefore)
      || /\bon\s+all\s*$/i.test(sentenceBefore)) continue;
    const component = normalizedComponent(m[1] || '');
    if (!component) continue;
    const condition = replacementCondition(text, m.index);
    found.push({
      component,
      evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
      diagnosisDependent: Boolean(condition),
      ...(condition ? { condition } : {}),
      sourceIndex: m.index,
    });
  }

  OFFERED_PART.lastIndex = 0;
  while ((m = OFFERED_PART.exec(text))) {
    const component = normalizedComponent(m[1] || '');
    if (!component) continue;
    found.push({
      component,
      evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
      diagnosisDependent: false,
      sourceIndex: m.index,
    });
  }

  AVAILABLE_PARTS.lastIndex = 0;
  while ((m = AVAILABLE_PARTS.exec(text))) {
    const sentenceBefore = text.slice(sentenceStart(text, m.index), m.index);
    if (/\bwith\b[^.!?]{0,50}$/i.test(sentenceBefore)) continue;
    const component = normalizedComponent(m[1] || '');
    if (!component || /^(?:devices|units)$/i.test(component)) continue;
    found.push({
      component,
      evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
      diagnosisDependent: false,
      sourceIndex: m.index,
    });
  }

  AVAILABLE_PART_WITH_DETAILS.lastIndex = 0;
  while ((m = AVAILABLE_PART_WITH_DETAILS.exec(text))) {
    const component = normalizedComponent(m[1] || '');
    if (!component) continue;
    found.push({
      component,
      evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
      diagnosisDependent: false,
      sourceIndex: m.index,
    });
  }

  PART_CAN_SOLVE.lastIndex = 0;
  while ((m = PART_CAN_SOLVE.exec(text))) {
    if (/\b(?:carbon|cleaning|fluid|oil|grease|service|procedure)\b/i.test(m[0])) continue;
    const component = normalizedComponent(m[1] || '');
    if (!component) continue;
    found.push({
      component,
      evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
      diagnosisDependent: true,
      condition: 'repair option',
      sourceIndex: m.index,
    });
  }

  CONSIDER_PART.lastIndex = 0;
  while ((m = CONSIDER_PART.exec(text))) {
    const component = normalizedComponent(m[1] || '');
    if (!component) continue;
    found.push({
      component,
      evidence: text.slice(sentenceStart(text, m.index), sentenceEnd(text, m.index)).trim(),
      diagnosisDependent: true,
      condition: 'optional repair or prevention branch',
      sourceIndex: m.index,
    });
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
  const semantic = new Map<string, PrescribedRepairComponent>();
  for (const item of unique.values()) {
    const key = semanticComponentKey(item.component) || item.component;
    const existing = semantic.get(key);
    if (!existing) {
      semantic.set(key, item);
      continue;
    }
    semantic.set(key, {
      ...existing,
      evidence: existing.evidence === item.evidence ? existing.evidence : `${existing.evidence}; ${item.evidence}`,
      diagnosisDependent: existing.diagnosisDependent && item.diagnosisDependent,
      ...(existing.diagnosisDependent && item.diagnosisDependent
        ? { condition: existing.condition || item.condition }
        : {}),
    });
  }
  const results = [...semantic.values()];
  return results.filter((item) => !results.some((other) => (
    other !== item
    && (other.evidence === item.evidence
      || other.evidence.startsWith(item.evidence)
      || item.evidence.startsWith(other.evidence))
    && other.component.length > item.component.length
    && (other.component.endsWith(item.component)
      || (other.component.startsWith(`${item.component} `)
        && componentHeadNoun(other.component) === componentHeadNoun(item.component)))
  ))).filter((item) => {
    const head = componentHeadNoun(item.component);
    if (!head || !/^use\b/i.test(item.evidence)) return true;
    const genericSupplierRestatement = new RegExp(`^(?:[a-z0-9-]+(?:/[a-z0-9-]+)?\\s+)?${head}$`, 'i')
      .test(item.component);
    if (!genericSupplierRestatement) return true;
    return !results.some((other) => other !== item
      && componentHeadNoun(other.component) === head
      && other.component !== item.component);
  });
}

export function extractPrescribedParts(solution: string): string[] {
  return extractPrescriptionComponents(solution).map((item) => item.component);
}
