/** Score the frozen Devon-vs-precision search experiment without asserting fitment. */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { isKnownIssueProductUrl } from '../src/lib/known-issue-commerce';

interface ExperimentQuery {
  issueId: string;
  workItemId: string;
  expectedComponent: string;
  searchEligibility: 'eligible' | 'source-correction-hold';
  template: 'devon' | 'precision';
  query: string;
}

interface LaneEvaluation {
  make: string;
  snapshotHash: string;
  productionApplied: false;
  experimentQueryCount: number;
  experimentQueries: ExperimentQuery[];
}

interface RawExperiment {
  schemaVersion: 1;
  artifactKind: 'known-issue-part-search-codex-raw';
  source: 'codex-built-in-web-search';
  evaluationSha256: string;
  queryCount: number;
  results: Array<{
    queryIndex: number;
    sources: Array<{ title: string; url: string }>;
  }>;
}

function normalizedSha256(file: string): string {
  const bytes = fs.readFileSync(file, 'utf8').replace(/\r\n?/g, '\n');
  return createHash('sha256').update(bytes, 'utf8').digest('hex');
}

function normalized(value: string): string {
  let decoded = value;
  try { decoded = decodeURIComponent(value); } catch { /* keep source text */ }
  return decoded.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function has(value: string, pattern: RegExp): boolean {
  return pattern.test(normalized(value));
}

/** Same-component only. This deliberately says nothing about exact vehicle fitment. */
export function productMatchesExpectedComponent(expected: string, title: string, url: string): boolean {
  const value = `${title} ${url}`;
  const key = normalized(expected);
  if (key === 'remanufactured rear axle') {
    return has(value, /\brear\b/) && has(value, /\baxle\b/)
      && has(value, /\b(?:assembly|shaft)\b/) && !has(value, /\bbearings?\b/);
  }
  if (key === 'dashboard assembly') {
    return has(value, /\b(?:dashboard|dash)\b/) && has(value, /\bassembly\b/)
      && !has(value, /\b(?:cover|cap|trim|panel)\b/);
  }
  const profiles: Record<string, RegExp[]> = {
    'torque converter': [/\btorque\b/, /\bconverter\b/],
    'lock up solenoid': [/\block\b/, /\bsolenoid\b/],
    'motor mounts': [/\b(?:motor|engine|transmission)\b/, /\bmounts?\b/],
    'ignition switch electrical portion': [/\bignition\b/, /\bswitch\b/],
    ignitor: [/\b(?:ignitor|igniter)\b|\bignition (?:control )?module\b/],
    distributor: [/\bdistributor\b/],
    'outer cv boot kit': [/\b(?:cv|outboard)\b/, /\bboot\b/],
    'cowl grommet seal 91608 sj6 003': [/\b91608\b/, /\bsj6\b/, /\b003\b/],
    'main relay': [/\bmain\b/, /\brelay\b/],
    'rear lower control arm bolts': [/\brear\b/, /\b(?:lower control arm|lca)\b/, /\bbolts?\b/],
    'rear pre pressed hub': [/\brear\b/, /\bhub\b/],
    'timing belt kit': [/\btiming\b/, /\bbelt\b/, /\bkit\b/],
    'aftermarket intercooler': [/\bintercooler\b/],
    'vtec oil pressure switch': [/\bvtec\b/, /\boil\b/, /\bpressure\b/, /\bswitch\b/],
    'abs pump accumulator assembly': [/\b(?:abs|alb)\b/, /\b(?:pump|modulator)\b/, /\baccumulator\b/],
    'head gaskets': [/\bhead\b/, /\bgaskets?\b/],
    'fan control unit': [/\bfan\b/, /\b(?:control|module)\b/],
    'pgm fi main relay omron': [/\bmain\b/, /\brelay\b/],
    'power steering high pressure hose': [/\bpower\b/, /\bsteering\b/, /\b(?:pressure|feed)\b/, /\bhose\b/],
    'sunroof drain tubes': [/\bsunroof\b/, /\bdrain\b/, /\b(?:tubes?|hoses?)\b/],
    'valve cover gaskets': [/\bvalve\b/, /\bcover\b/, /\bgaskets?\b/],
    'vcm tuner s vcm controller': [/\bvcm\b/, /\b(?:tuner|controller|disabler)\b/],
    'ac compressor assembly': [/\b(?:ac|air conditioner)\b/, /\bcompressor\b/],
    'sh awd electromagnetic actuators': [/\bsh\b/, /\bawd\b/, /\bactuators?\b/],
    'timing belt': [/\btiming\b/, /\bbelt\b/],
    'ac compressor clutch': [/\b(?:ac|air conditioner)\b/, /\bcompressor\b/, /\bclutch\b/],
    'remanufactured rear axle': [/\brear\b/, /\baxle\b/],
    'upgraded 3rd gear clutch pack': [/\b(?:3rd|third)\b/, /\bgear\b/, /\bclutch\b/],
    'front brake rotors': [/\bfront\b/, /\bbrake\b/, /\brotors?\b/],
    'high pressure power steering hose': [/\bpower\b/, /\bsteering\b/, /\b(?:pressure|feed)\b/, /\bhose\b/],
    'type s brembo front brake pads': [/\bfront\b/, /\bbrake\b/, /\bpads?\b/, /\b(?:brembo|type s)\b/],
    'timing kit': [/\btiming\b/, /\bkit\b/],
  };
  const required = profiles[key];
  if (!required) throw new Error(`No strict component profile for "${expected}"`);
  return required.every((pattern) => has(value, pattern));
}

function exactIndexSet(results: RawExperiment['results'], queryCount: number) {
  const actual = results.map((row) => row.queryIndex).sort((a, b) => a - b);
  const expected = Array.from({ length: queryCount }, (_, index) => index);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error('Raw experiment query-index set mismatch');
}

export function evaluateSearchExperiment(evaluation: LaneEvaluation, raw: RawExperiment) {
  if (evaluation.productionApplied !== false) throw new Error('Evaluation must remain non-production');
  if (raw.schemaVersion !== 1 || raw.artifactKind !== 'known-issue-part-search-codex-raw'
    || raw.source !== 'codex-built-in-web-search') throw new Error('Raw experiment schema is unsupported');
  if (evaluation.experimentQueryCount !== evaluation.experimentQueries.length
    || raw.queryCount !== evaluation.experimentQueryCount) throw new Error('Experiment query count mismatch');
  exactIndexSet(raw.results, raw.queryCount);
  const pairByIssue = new Map<string, ExperimentQuery[]>();
  for (const query of evaluation.experimentQueries) {
    const rows = pairByIssue.get(query.issueId) || [];
    rows.push(query);
    pairByIssue.set(query.issueId, rows);
  }
  for (const [issueId, rows] of pairByIssue) {
    const templates = rows.map((row) => row.template).sort();
    if (JSON.stringify(templates) !== JSON.stringify(['devon', 'precision'])
      || new Set(rows.map((row) => row.workItemId)).size !== 1) {
      throw new Error(`${issueId}: experiment must contain exactly one paired query per template`);
    }
  }

  const queryResults = raw.results
    .sort((a, b) => a.queryIndex - b.queryIndex)
    .map((row) => {
      const query = evaluation.experimentQueries[row.queryIndex]!;
      const directProducts = row.sources.filter((source) => isKnownIssueProductUrl(source.url));
      const matchingProducts = directProducts.filter((source) => productMatchesExpectedComponent(
        query.expectedComponent,
        source.title,
        source.url,
      ));
      return {
        ...query,
        queryIndex: row.queryIndex,
        searchResultCount: row.sources.length,
        directProductCount: directProducts.length,
        strictComponentProductCount: matchingProducts.length,
        strictComponentMatched: matchingProducts.length > 0,
        matchingProducts,
      };
    });

  const templateResults = (['devon', 'precision'] as const).map((template) => {
    const rows = queryResults.filter((row) => row.template === template);
    const matched = rows.filter((row) => row.strictComponentMatched).length;
    const directProducts = rows.reduce((sum, row) => sum + row.directProductCount, 0);
    const matchingProducts = rows.reduce((sum, row) => sum + row.strictComponentProductCount, 0);
    return {
      template,
      queryCount: rows.length,
      directProductQueryCount: rows.filter((row) => row.directProductCount > 0).length,
      strictComponentMatchedIssueCount: matched,
      strictComponentRecall: rows.length ? matched / rows.length : 0,
      directProductCount: directProducts,
      strictComponentProductCount: matchingProducts,
      strictComponentPrecision: directProducts ? matchingProducts / directProducts : 0,
      missedIssueIds: rows.filter((row) => !row.strictComponentMatched).map((row) => row.issueId),
    };
  });
  const [devon, precision] = templateResults;
  const sourceCorrectionHeldIssueIds = [...new Set(queryResults
    .filter((row) => row.searchEligibility === 'source-correction-hold')
    .map((row) => row.issueId))].sort();
  const recommendedTemplate = devon.strictComponentRecall > precision.strictComponentRecall
    ? 'devon'
    : precision.strictComponentRecall > devon.strictComponentRecall
      ? 'precision'
      : 'no-clear-winner';

  return {
    schemaVersion: 1,
    artifactKind: 'known-issue-part-search-experiment-evaluation',
    make: evaluation.make,
    snapshotHash: evaluation.snapshotHash,
    status: 'DISCOVERY_EXPERIMENT_COMPLETE_REVIEW_REQUIRED',
    productionApplied: false,
    metricDefinition: 'Historical frozen-search benchmark over all 38 issues: strict component recall requires at least one direct product URL whose observed title or path identifies the prescribed component. Source-correction-held issues remain in this already-collected comparison but are excluded from operational searching. This metric does not prove product identity, repair role, year/trim/engine fitment, availability, or publishability.',
    recommendedTemplate,
    nextStep: 'INDEPENDENT_DISCOVERY_AUDIT',
    sourceCorrectionHeldIssueIds,
    templateResults,
    queryResults,
  };
}

function requiredArg(args: string[], flag: string): string {
  const index = args.indexOf(flag);
  if (index < 0 || !args[index + 1]) throw new Error(`${flag} is required`);
  return args[index + 1]!;
}

function main() {
  const args = process.argv.slice(2);
  const evaluationFile = path.resolve(requiredArg(args, '--evaluation'));
  const rawFile = path.resolve(requiredArg(args, '--raw'));
  const out = path.resolve(requiredArg(args, '--out'));
  const evaluation = JSON.parse(fs.readFileSync(evaluationFile, 'utf8'));
  const raw = JSON.parse(fs.readFileSync(rawFile, 'utf8'));
  if (raw.evaluationSha256 !== normalizedSha256(evaluationFile)) throw new Error('Raw experiment evaluation hash mismatch');
  const result = evaluateSearchExperiment(evaluation, raw);
  fs.writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ recommendedTemplate: result.recommendedTemplate, templateResults: result.templateResults, out }, null, 2));
}

if (require.main === module) {
  try { main(); } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
