/** Build a deterministic, non-production web-search queue for one frozen make. */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { buildKnownIssuePartSearchQueue } from '../src/lib/known-issue-part-search';

const INPUT_FILES = [
  '00-make-source.json',
  '01-disposition-ledger.json',
  '02-fitment-worklist.json',
  '03-showmetheparts-evidence.json',
  '04-part-proposals.json',
] as const;

function requiredArg(args: string[], flag: string): string {
  const index = args.indexOf(flag);
  if (index < 0 || !args[index + 1]) throw new Error(`${flag} is required`);
  return args[index + 1]!;
}

function optionalArg(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

function normalizedBytes(value: Buffer): Buffer {
  return Buffer.from(value.toString('utf8').replace(/\r\n?/g, '\n'), 'utf8');
}

function sha256File(file: string): string {
  return createHash('sha256').update(normalizedBytes(fs.readFileSync(file))).digest('hex');
}

export function buildSearchQueueArtifact(auditDir: string, make: string, sourceCorrectionsFile?: string) {
  const read = (name: typeof INPUT_FILES[number]) => {
    const file = path.join(auditDir, name);
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  };
  const source = read('00-make-source.json');
  const ledger = read('01-disposition-ledger.json');
  const worklist = read('02-fitment-worklist.json');
  const evidence = read('03-showmetheparts-evidence.json');
  const proposals = read('04-part-proposals.json');
  const sourceCorrections = sourceCorrectionsFile
    ? JSON.parse(fs.readFileSync(sourceCorrectionsFile, 'utf8'))
    : null;
  const queue = buildKnownIssuePartSearchQueue({
    make,
    snapshotHash: source.snapshotHash,
    sourceRecords: source.records,
    ledger: ledger.issues,
    workItems: worklist.entries,
    evidence: evidence.results,
    proposals: proposals.proposals,
    sourceCorrectionHolds: sourceCorrections?.sourceCorrectionHolds || [],
  });
  return {
    ...queue,
    sourceArtifacts: {
      ...Object.fromEntries(INPUT_FILES.map((name) => [name, sha256File(path.join(auditDir, name))])),
      ...(sourceCorrectionsFile ? { [path.basename(sourceCorrectionsFile)]: sha256File(sourceCorrectionsFile) } : {}),
    },
  };
}

function main() {
  const args = process.argv.slice(2);
  const auditDir = path.resolve(requiredArg(args, '--audit-dir'));
  const make = requiredArg(args, '--make');
  const output = path.resolve(requiredArg(args, '--out'));
  const sourceCorrections = optionalArg(args, '--source-corrections');
  const artifact = buildSearchQueueArtifact(
    auditDir,
    make,
    sourceCorrections ? path.resolve(sourceCorrections) : undefined,
  );
  fs.writeFileSync(output, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({
    make: artifact.make,
    issueCount: artifact.issueCount,
    workItemCount: artifact.workItemCount,
    primarySearchCount: artifact.primarySearchCount,
    alternateSearchCount: artifact.alternateSearchCount,
    output,
  }, null, 2));
}

if (require.main === module) {
  try { main(); } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
