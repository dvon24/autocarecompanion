/** Normalize externally observed web results into held, review-only evidence. */
import fs from 'node:fs';
import path from 'node:path';
import {
  reviewKnownIssuePartSearchDiscoveries,
  type PartSearchQueue,
  type SearchDiscoveryInput,
} from '../src/lib/known-issue-part-search';

function requiredArg(args: string[], flag: string): string {
  const index = args.indexOf(flag);
  if (index < 0 || !args[index + 1]) throw new Error(`${flag} is required`);
  return args[index + 1]!;
}

function main() {
  const args = process.argv.slice(2);
  const queueFile = path.resolve(requiredArg(args, '--queue'));
  const discoveriesFile = path.resolve(requiredArg(args, '--discoveries'));
  const output = path.resolve(requiredArg(args, '--out'));
  const queue = JSON.parse(fs.readFileSync(queueFile, 'utf8')) as PartSearchQueue;
  const discoveries = JSON.parse(fs.readFileSync(discoveriesFile, 'utf8')) as SearchDiscoveryInput[];
  const candidates = reviewKnownIssuePartSearchDiscoveries(queue, discoveries);
  const artifact = {
    schemaVersion: 1,
    artifactKind: 'known-issue-part-search-evidence',
    make: queue.make,
    snapshotHash: queue.snapshotHash,
    status: 'HELD_FOR_INDEPENDENT_REVIEW',
    productionApplied: false,
    guardrail: 'Discovery proves only that a product page was observed. Repair role, source accuracy and exact application remain unapproved.',
    candidateCount: candidates.length,
    candidates,
  };
  fs.writeFileSync(output, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ make: artifact.make, candidateCount: artifact.candidateCount, output }, null, 2));
}

if (require.main === module) {
  try { main(); } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
