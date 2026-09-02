import { writeFileSync } from 'node:fs';
import { VEHICLE_TWIN_CATALOG } from '../src/lib/vehicle-twin-catalog';
import { resolveTwinTrees } from '../src/components/twin/demo-trees.js';
import { getReviewedTransmissionChoices, type TransmissionChoice } from '../src/lib/transmission-options';

type LinkRecord = { twin: string; nodeId: string; label: string; partNo: string; url: string };
type LinkResult = LinkRecord & { status: number | null; result: 'live' | 'redirected' | 'blocked' | 'failed'; finalUrl: string; error: string };
type LinkNode = { group?: boolean; label?: string; partNo?: string; buyUrl?: string; products?: Array<{ label?: string; partNo?: string; buyUrl?: string }> };

const records: LinkRecord[] = [];
const configurations = (twin:typeof VEHICLE_TWIN_CATALOG[number]):Array<TransmissionChoice|undefined> => {
  const choices=getReviewedTransmissionChoices(twin.identity);
  return choices.length ? [...choices] : [undefined];
};
for (const twin of VEHICLE_TWIN_CATALOG) {
  for(const transmission of configurations(twin)){
    const trees = resolveTwinTrees(twin, { transmission });
    const seen = new Set<string>();
    const twinConfiguration=transmission?`${twin.id}:${transmission}`:twin.id;
    for (const tree of Object.values(trees) as Array<{ nodes: Record<string, LinkNode> }>) {
      for (const [nodeId, node] of Object.entries(tree.nodes)) {
        if (seen.has(nodeId) || node.group) continue;
        seen.add(nodeId);
        if (node.buyUrl) records.push({ twin:twinConfiguration, nodeId, label:node.label || nodeId, partNo:node.partNo || '', url:node.buyUrl });
        for (const product of Array.isArray(node.products) ? node.products : []) {
          if (product.buyUrl) records.push({ twin:twinConfiguration, nodeId, label:product.label || node.label || nodeId, partNo:product.partNo || '', url:product.buyUrl });
        }
      }
    }
  }
}

const unique = [...new Map(records.map((record) => [record.url, record])).values()];
const headers = {
  'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0.0.0 Safari/537.36',
  accept:'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
};

async function check(record: LinkRecord): Promise<LinkResult> {
  try {
    const response = await fetch(record.url, { method:'GET', redirect:'follow', headers, signal:AbortSignal.timeout(25000) });
    const result = response.status >= 200 && response.status < 300
      ? response.url !== record.url ? 'redirected' : 'live'
      : [401,403,412,429].includes(response.status) ? 'blocked' : 'failed';
    await response.body?.cancel();
    return { ...record, status:response.status, result, finalUrl:response.url, error:'' };
  } catch (error) {
    return { ...record, status:null, result:'failed', finalUrl:'', error:error instanceof Error ? error.message : String(error) };
  }
}

async function main() {
  const results: LinkResult[] = [];
  for (let index = 0; index < unique.length; index += 8) {
    results.push(...await Promise.all(unique.slice(index, index + 8).map(check)));
    process.stdout.write(`\rchecked ${Math.min(index + 8, unique.length)}/${unique.length}`);
  }
  process.stdout.write('\n');

  const summary = {
    checkedAt:new Date().toISOString(),
    uniqueUrls:results.length,
    live:results.filter((row) => row.result === 'live' || row.result === 'redirected').length,
    blocked:results.filter((row) => row.result === 'blocked').length,
    failed:results.filter((row) => row.result === 'failed').length,
    results,
  };
  const outputIndex = process.argv.indexOf('--output');
  if (outputIndex !== -1) {
    const outputPath = process.argv[outputIndex + 1];
    if (!outputPath) throw new Error('--output requires a file path');
    writeFileSync(outputPath, JSON.stringify(summary, null, 2), 'utf8');
  }
  console.log(`unique=${summary.uniqueUrls} live=${summary.live} blocked=${summary.blocked} failed=${summary.failed}`);
  for (const row of results.filter((result) => result.result === 'blocked' || result.result === 'failed')) {
    console.log(`${row.result}\t${row.status ?? '-'}\t${row.twin}/${row.nodeId}\t${row.partNo}\t${row.url}\t${row.error}`);
  }
  if (!summary.live) {
    console.error('No product URL produced a live or redirected response; bot-blocked responses alone are not release evidence.');
    process.exitCode = 1;
  } else if (summary.failed) process.exitCode = 1;
}

void main();
