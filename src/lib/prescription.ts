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

/**
 * A clause is NOT a prescription when the verb is negated or conditional:
 * "before replacing", "instead of replacing", "do not replace", "rather than
 * replacing". These appear constantly in diagnostic guidance and each one names
 * a part the article is steering you AWAY from.
 */
const NEGATED_BEFORE = /\b(?:before|prior to|instead of|rather than|without|avoid|unnecessar\w*|don'?t|do not|never|no need to|not)\s+(?:\w+\s+){0,2}$/i;

/** Words that qualify a part without identifying it. */
const NOISE = new Set([
  'the', 'a', 'an', 'this', 'that', 'these', 'those', 'its', 'his', 'her', 'their',
  'failed', 'faulty', 'bad', 'worn', 'old', 'new', 'entire', 'complete', 'whole',
  'affected', 'damaged', 'leaking', 'cracked', 'defective', 'original', 'oem',
  'genuine', 'updated', 'revised', 'improved', 'correct', 'proper', 'both', 'all',
  'any', 'each', 'one', 'two', 'four', 'six', 'eight',
  'again', 'usually', 'typically', 'often', 'simply', 'just',
]);

/** Single words that name nothing buyable. Anything else standing alone — an
 *  acronym like FPDM, TIPM, PCV — is a real part name and is kept. */
const VAGUE = new Set(['it', 'them', 'this', 'that', 'one', 'unit', 'part', 'component', 'item', 'piece']);

/** Trailing words that start a new thought rather than continue the part name. */
const STOP = /\b(?:and|with|using|per|as|if|when|after|before|then|to|for|on|in|at|from|because|since|which|that|plus|along)\b/i;

function cleanPhrase(raw: string): string {
  const words = raw
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')          // drop parentheticals
    .replace(/['’]s\b/g, '')             // driver's -> driver
    .replace(/[^a-z0-9\s/-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const out: string[] = [];
  for (const w of words) {
    if (STOP.test(w) && out.length > 0) break;   // stop at a new clause
    if (NOISE.has(w)) continue;
    out.push(w);
    // Part names are short. Beyond four significant words we are collecting
    // sentence, not part, and every extra token over-constrains the catalog
    // query into returning nothing.
    if (out.length >= 4) break;
  }
  return out.join(' ').trim();
}

/**
 * Every part the solution actually prescribes, most-prescribed first.
 * Returns [] when the solution only diagnoses — which is a real answer, not a
 * failure: plenty of issues have no part to sell.
 */
export function extractPrescribedParts(solution: string): string[] {
  const text = String(solution || '');
  if (!text) return [];

  const found: string[] = [];
  PRESCRIBE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = PRESCRIBE.exec(text))) {
    const before = text.slice(Math.max(0, m.index - 40), m.index);
    if (NEGATED_BEFORE.test(before)) continue;

    // Truncate at the sentence boundary FIRST. "Replace crankshaft position
    // sensor. Inspect the connector." otherwise yields "crankshaft position
    // sensor inspect", which queries nothing.
    const after = text
      .slice(m.index + m[0].length, m.index + m[0].length + 90)
      .split(/[.;!?]/)[0]!;
    const phrase = cleanPhrase(after);
    if (!phrase) continue;
    // A single word is usually too vague ("replace it") — but not always: an
    // acronym IS the part name, and "replacing the FPDM" is the most precise
    // prescription in its whole article.
    if (!phrase.includes(' ') && VAGUE.has(phrase)) continue;
    found.push(phrase);
  }

  // De-duplicate, preserving order of appearance.
  return [...new Set(found)];
}
