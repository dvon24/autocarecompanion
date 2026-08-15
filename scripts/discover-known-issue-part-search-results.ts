/**
 * Execute frozen Known Issue part-search queries with Anthropic web search.
 *
 * Output is raw discovery evidence only. It contains no fixParts, buyLinks,
 * approval, application write, or runtime benchmark dependency.
 */
import Anthropic from '@anthropic-ai/sdk';
import { config as loadEnv } from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { isKnownIssueProductUrl } from '../src/lib/known-issue-commerce';
import type {
  PartSearchQueryTemplate,
  PartSearchQueue,
  PartSearchQueueEntry,
} from '../src/lib/known-issue-part-search';

export interface RawSearchResult {
  title: string;
  url: string;
  host: string;
}

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

export function exactProductResultsFromAnthropic(content: unknown[]): RawSearchResult[] {
  const seen = new Set<string>();
  const results: RawSearchResult[] = [];
  for (const blockValue of content) {
    const block = record(blockValue);
    if (!block || block.type !== 'web_search_tool_result' || !Array.isArray(block.content)) continue;
    for (const resultValue of block.content) {
      const result = record(resultValue);
      const url = String(result?.url || '');
      const title = String(result?.title || '').trim();
      if (result?.type !== 'web_search_result' || !title || !isKnownIssueProductUrl(url)) continue;
      const canonicalUrl = new URL(url).toString();
      const identityUrl = new URL(canonicalUrl);
      identityUrl.search = '';
      identityUrl.hash = '';
      const identity = identityUrl.toString();
      if (seen.has(identity)) continue;
      seen.add(identity);
      results.push({
        title,
        url: canonicalUrl,
        host: new URL(canonicalUrl).hostname.toLowerCase().replace(/^www\./, ''),
      });
    }
  }
  return results;
}

export function knownIssuePartSearchPrompt(
  entry: PartSearchQueueEntry,
  template: PartSearchQueryTemplate,
): string {
  return [
    `Search the US web for: ${entry.queries[template]}`,
    `Known issue: ${entry.title}`,
    `Repair component: ${entry.component}`,
    `How-to-Fix evidence: ${entry.repairRoleEvidence}`,
    'Return retailer or manufacturer pages for one exact purchasable product only.',
    'Do not use search, category, catalog-list, forum, article, recall, dealer-locator, or generic model/year pages.',
    'Do not claim fitment or repair suitability; this run records discovery candidates for later independent review.',
  ].join('\n');
}

function requiredArg(args: string[], flag: string): string {
  const index = args.indexOf(flag);
  if (index < 0 || !args[index + 1]) throw new Error(`${flag} is required`);
  return args[index + 1]!;
}

function optionalArg(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

function writeArtifact(file: string, artifact: Record<string, unknown>) {
  fs.writeFileSync(file, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
}

async function main() {
  const args = process.argv.slice(2);
  const queueFile = path.resolve(requiredArg(args, '--queue'));
  const output = path.resolve(requiredArg(args, '--out'));
  const mode = optionalArg(args, '--mode') || 'all';
  if (!['primary', 'alternate', 'all'].includes(mode)) throw new Error('--mode must be primary, alternate, or all');
  const experimentFile = optionalArg(args, '--experiment');
  const templateValue = optionalArg(args, '--template');
  if (!experimentFile && !['devon', 'precision'].includes(templateValue || '')) {
    throw new Error('--template must be devon or precision outside an experiment');
  }
  const limitValue = optionalArg(args, '--limit');
  const limit = limitValue ? Number(limitValue) : Number.POSITIVE_INFINITY;
  if (!(limit > 0)) throw new Error('--limit must be a positive number');
  const queue = JSON.parse(fs.readFileSync(queueFile, 'utf8')) as PartSearchQueue;
  if (queue.status !== 'DISCOVERY_QUEUED_NOT_APPLIED' || queue.productionApplied !== false) {
    throw new Error('Search queue is not an explicitly non-production discovery artifact');
  }
  const envFile = optionalArg(args, '--env-file');
  if (envFile) loadEnv({ path: path.resolve(envFile), override: false, quiet: true });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is required');
  const existing = fs.existsSync(output) ? JSON.parse(fs.readFileSync(output, 'utf8')) : null;
  if (existing && (existing.make !== queue.make || existing.snapshotHash !== queue.snapshotHash)) {
    throw new Error('Existing discovery output belongs to a different make or snapshot');
  }
  const results: Array<Record<string, unknown>> = Array.isArray(existing?.results) ? existing.results : [];
  const completed = new Set(results.map((row) => `${row.workItemId}|${row.template}`));
  const normalSelected = queue.entries
    .filter((entry) => entry.searchEligibility === 'eligible')
    .filter((entry) => mode === 'all'
      || (mode === 'primary' && entry.searchDecision === 'find-primary')
      || (mode === 'alternate' && entry.searchDecision === 'find-alternate'))
    .map((entry) => ({ entry, template: templateValue as PartSearchQueryTemplate }));
  const experimentSelected = experimentFile
    ? (JSON.parse(fs.readFileSync(path.resolve(experimentFile), 'utf8')).experimentQueries as Array<{
      workItemId: string;
      template: PartSearchQueryTemplate;
      query: string;
    }>).map((row) => {
      const entry = queue.entries.find((candidate) => candidate.workItemId === row.workItemId);
      if (!entry || entry.queries[row.template] !== row.query) {
        throw new Error(`${row.workItemId}: experiment query does not match the frozen queue`);
      }
      if (entry.searchEligibility !== 'eligible') {
        throw new Error(`${row.workItemId}: experiment query is source-correction-held`);
      }
      return { entry, template: row.template };
    })
    : normalSelected;
  const selected = experimentSelected
    .filter(({ entry, template }) => !completed.has(`${entry.workItemId}|${template}`))
    .slice(0, limit);
  const client = new Anthropic({ apiKey });
  for (const { entry, template } of selected) {
    const retrievedAt = new Date().toISOString();
    try {
      const response = await client.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 1024,
        tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 2 } as never],
        messages: [{ role: 'user', content: knownIssuePartSearchPrompt(entry, template) }],
      });
      results.push({
        workItemId: entry.workItemId,
        issueId: entry.issueId,
        component: entry.component,
        template,
        query: entry.queries[template],
        retrievedAt,
        status: 'RAW_DISCOVERY_HELD',
        productResults: exactProductResultsFromAnthropic(response.content as unknown[]),
      });
    } catch (error) {
      results.push({
        workItemId: entry.workItemId,
        issueId: entry.issueId,
        component: entry.component,
        template,
        query: entry.queries[template],
        retrievedAt,
        status: 'DISCOVERY_ERROR_HELD',
        error: error instanceof Error ? error.message : String(error),
        productResults: [],
      });
    }
    results.sort((a, b) => `${a.workItemId}|${a.template}`.localeCompare(`${b.workItemId}|${b.template}`));
    writeArtifact(output, {
      schemaVersion: 1,
      artifactKind: 'known-issue-part-search-raw-discovery',
      make: queue.make,
      snapshotHash: queue.snapshotHash,
      status: 'RAW_DISCOVERY_HELD_NOT_APPLIED',
      productionApplied: false,
      guardrail: 'Raw search results are unapproved evidence. Search/category URLs are excluded and no result is a public buy link.',
      completedCount: results.length,
      results,
    });
  }
  console.log(JSON.stringify({ make: queue.make, searched: selected.length, completed: results.length, output }, null, 2));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
