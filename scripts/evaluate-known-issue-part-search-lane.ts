/** Offline answer-key evaluation for the deterministic Known Issue search queue. */
import fs from 'node:fs';
import path from 'node:path';
import type { PartSearchQueue } from '../src/lib/known-issue-part-search';

interface Benchmark {
  make: string;
  snapshotHash: string;
  status: string;
  productionApplied: false;
  rows: Array<{ issueId: string; candidates: unknown[] }>;
}

interface Expectations {
  schemaVersion: 1;
  artifactKind: 'known-issue-human-search-component-expectations';
  make: string;
  snapshotHash: string;
  status: 'EVALUATION_ONLY_NOT_APPLIED';
  productionApplied: false;
  rows: Array<{ issueId: string; expectedComponents: string[] }>;
}

const canonical = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function exactSet(label: string, left: string[], right: string[]) {
  const a = [...left].sort();
  const b = [...right].sort();
  if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${label} set mismatch`);
}

export function evaluateKnownIssuePartSearchLane(
  benchmark: Benchmark,
  expectations: Expectations,
  queue: PartSearchQueue,
) {
  if (benchmark.productionApplied !== false || expectations.productionApplied !== false
    || queue.productionApplied !== false) throw new Error('Search evaluation inputs must be non-production');
  if (expectations.schemaVersion !== 1
    || expectations.artifactKind !== 'known-issue-human-search-component-expectations'
    || expectations.status !== 'EVALUATION_ONLY_NOT_APPLIED') {
    throw new Error('Component expectation schema is unsupported');
  }
  if (benchmark.make !== expectations.make || benchmark.make !== queue.make
    || benchmark.snapshotHash !== expectations.snapshotHash
    || benchmark.snapshotHash !== queue.snapshotHash) throw new Error('Search evaluation source binding mismatch');
  const humanLinked = benchmark.rows.filter((row) => row.candidates.length > 0);
  exactSet('benchmark/expectation issue', humanLinked.map((row) => row.issueId), expectations.rows.map((row) => row.issueId));
  const entriesByIssue = new Map<string, string[]>();
  for (const entry of queue.entries) {
    const values = entriesByIssue.get(entry.issueId) || [];
    values.push(canonical(entry.searchComponent));
    entriesByIssue.set(entry.issueId, values);
    if (!entry.queries.devon.endsWith(' us') || !entry.queries.precision.endsWith(' us')
      || !entry.queries.devon.includes(entry.searchComponent)
      || !entry.queries.precision.includes(entry.searchComponent)) {
      throw new Error(`${entry.workItemId}: queries do not retain component and US market scope`);
    }
    if (entry.queries.devon.includes(entry.declaredEngine || '__no_engine__')) {
      throw new Error(`${entry.workItemId}: Devon query unexpectedly includes an engine token`);
    }
  }
  const issueResults = expectations.rows.map((row) => {
    const actual = new Set(entriesByIssue.get(row.issueId) || []);
    const missingComponents = row.expectedComponents.filter((component) => !actual.has(canonical(component)));
    return {
      issueId: row.issueId,
      expectedComponents: row.expectedComponents,
      missingComponents,
      matched: missingComponents.length === 0,
    };
  });
  const experimentQueries = expectations.rows.flatMap((row) => {
    const expectedComponent = row.expectedComponents[0]!;
    const entry = queue.entries
      .filter((candidate) => candidate.issueId === row.issueId
        && canonical(candidate.searchComponent) === canonical(expectedComponent))
      .sort((left, right) => left.workItemId.localeCompare(right.workItemId))[0];
    if (!entry) return [];
    return (['devon', 'precision'] as const).map((template) => ({
      issueId: row.issueId,
      workItemId: entry.workItemId,
      expectedComponent,
      searchEligibility: entry.searchEligibility,
      template,
      query: entry.queries[template],
    }));
  });
  const componentQueryCoveredCount = issueResults.filter((row) => row.matched).length;
  const componentQueryIssueCount = issueResults.length;
  const componentQueryCoverage = componentQueryIssueCount
    ? componentQueryCoveredCount / componentQueryIssueCount
    : 0;
  return {
    schemaVersion: 1,
    artifactKind: 'known-issue-part-search-lane-evaluation',
    make: queue.make,
    snapshotHash: queue.snapshotHash,
    status: 'QUERY_COMPONENTS_EVALUATED_DISCOVERY_NOT_RUN',
    productionApplied: false,
    metricDefinition: 'Extraction check only: an issue is covered when every human-reviewed repair component has both frozen query variants. This is not retrieval recall and cannot clear the discovery gate.',
    componentQueryIssueCount,
    componentQueryCoveredCount,
    componentQueryCoverage,
    nextStep: 'RUN_DEVON_VS_PRECISION_DISCOVERY_EXPERIMENT',
    exactProductPrecision: null,
    wrongLaneCount: 0,
    wrongScopeCount: 0,
    experimentQueryCount: experimentQueries.length,
    experimentQueries,
    issueResults,
  };
}

function requiredArg(args: string[], flag: string): string {
  const index = args.indexOf(flag);
  if (index < 0 || !args[index + 1]) throw new Error(`${flag} is required`);
  return args[index + 1]!;
}

function main() {
  const args = process.argv.slice(2);
  const benchmark = JSON.parse(fs.readFileSync(path.resolve(requiredArg(args, '--benchmark')), 'utf8'));
  const expectations = JSON.parse(fs.readFileSync(path.resolve(requiredArg(args, '--expectations')), 'utf8'));
  const queue = JSON.parse(fs.readFileSync(path.resolve(requiredArg(args, '--queue')), 'utf8'));
  const output = path.resolve(requiredArg(args, '--out'));
  const evaluation = evaluateKnownIssuePartSearchLane(benchmark, expectations, queue);
  fs.writeFileSync(output, `${JSON.stringify(evaluation, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({
    componentQueryCoveredCount: evaluation.componentQueryCoveredCount,
    componentQueryIssueCount: evaluation.componentQueryIssueCount,
    componentQueryCoverage: evaluation.componentQueryCoverage,
    nextStep: evaluation.nextStep,
    output,
  }, null, 2));
}

if (require.main === module) {
  try { main(); } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
