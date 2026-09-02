import { VEHICLE_TWIN_CATALOG } from '../src/lib/vehicle-twin-catalog';
import { resolveTwinTrees } from '../src/components/twin/demo-trees.js';
import { readFileSync, writeFileSync } from 'node:fs';
import { getReviewedTransmissionChoices, type TransmissionChoice } from '../src/lib/transmission-options';

type TreeNode = {
  label?: string;
  group?: boolean;
  partNo?: string;
  buyUrl?: string;
  commerceStatus?: 'fitment-hold' | 'link-hold';
  holdReason?: string;
  brand?: string;
  price?: string;
  spec?: string;
  buyLabel?: string;
  knownIssue?: { id?: string; href?: string };
  products?: Array<{
    label?: string;
    partNo?: string;
    brand?: string;
    price?: string;
    buyUrl?: string;
    buyLabel?: string;
    spec?: string;
  }>;
};

const GENERIC_DESTINATION = /(?:amazon\.com\/s\?|rockauto\.com\/en\/partsearch|TireSearchResults\.jsp|\/search(?:[/?#]|$))/i;
type PublishedIssue = { id?: string; description?: string; solution?: string; vehicle?: { make?: string; model?: string; years?: number[]; trims?: string[] } };
const publishedSnapshot = JSON.parse(readFileSync('data/known-issues-catalog-deeplink-snapshot-2026-07-17.json', 'utf8')) as { source?: string; records?: PublishedIssue[] };
if (!/live published KnownIssue rows/i.test(publishedSnapshot.source || '')) throw new Error('Known-issue validation source is not a published-row snapshot');
const knownIssuesById = new Map((publishedSnapshot.records || []).filter((issue) => issue.id).map((issue) => [issue.id as string, issue]));
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const configurations = (twin:typeof VEHICLE_TWIN_CATALOG[number]):Array<TransmissionChoice|undefined> => {
  const choices=getReviewedTransmissionChoices(twin.identity);
  return choices.length ? [...choices] : [undefined];
};

const summaries = VEHICLE_TWIN_CATALOG.flatMap((twin) => configurations(twin).map((transmission) => {
  const trees = resolveTwinTrees(twin, { transmission });
  const seen = new Map<string,string>();
  const rows: Array<Record<string, unknown>> = [];

  for (const tree of Object.values(trees) as Array<{ nodes: Record<string, TreeNode> }>) {
    for (const [nodeId, node] of Object.entries(tree.nodes)) {
      if (node.group) continue;
      const signature=JSON.stringify({label:node.label,partNo:node.partNo,buyUrl:node.buyUrl,commerceStatus:node.commerceStatus,holdReason:node.holdReason,brand:node.brand,price:node.price,spec:node.spec,knownIssue:node.knownIssue,products:node.products});
      const first=seen.get(nodeId);
      if(first){if(first!==signature)rows.push({nodeId,label:node.label||nodeId,status:'duplicate-node-divergence'});continue;}
      seen.set(nodeId,signature);
      const products = Array.isArray(node.products) ? node.products : [];
      const incompleteProducts = products.filter((product) => !product.partNo || !product.brand || !product.price?.startsWith('$') || !product.buyUrl || GENERIC_DESTINATION.test(product.buyUrl));
      const incompleteSingle = Boolean(node.buyUrl && (!node.partNo || !node.brand || !node.price?.startsWith('$')));
      const issue = node.knownIssue?.id ? knownIssuesById.get(node.knownIssue.id) : undefined;
      const expectedIssueUrl = issue?.vehicle?.make && issue?.vehicle?.model && issue?.id ? `/known-issues/${slug(`${issue.vehicle.make}-${issue.vehicle.model}`)}#${issue.id}` : '';
      const issueApplies = Boolean(issue && issue.vehicle?.make === twin.identity.make && issue.vehicle?.model === twin.identity.model && issue.vehicle?.years?.includes(twin.identity.year));
      const validIssueLink = Boolean(issueApplies && expectedIssueUrl === node.knownIssue?.href && issue?.description?.trim());
      const status = products.length
        ? incompleteProducts.length ? 'incomplete-products' : 'linked-set'
        : node.buyUrl
          ? GENERIC_DESTINATION.test(node.buyUrl) ? 'generic-link' : incompleteSingle ? 'incomplete-single' : 'linked'
          : node.commerceStatus || (node.knownIssue?.id ? validIssueLink ? 'issue-linked' : 'issue-invalid-link' : 'unclassified');
      rows.push({
        nodeId,
        label: node.label || nodeId,
        status,
        brand: node.brand || '',
        partNumber: node.partNo || '',
        price: node.price || '',
        url: node.buyUrl || '',
        buyLabel: node.buyLabel || '',
        spec: node.spec || '',
        holdReason: node.holdReason || '',
        knownIssueId: node.knownIssue?.id || '',
        knownIssueUrl: node.knownIssue?.href || '',
        expectedKnownIssueUrl: expectedIssueUrl,
        knownIssuePublished: Boolean(issue),
        knownIssueApplies: issueApplies,
        products: products.map((product) => [product.label, product.brand, product.partNo, product.price, product.buyUrl].filter(Boolean).join(' | ')).join(' ; '),
        productDetails: products,
        incompleteProducts: incompleteProducts.map((product) => product.label || product.partNo || 'unnamed product').join(' ; '),
        incompleteSingle,
      });
    }
  }

  return {
    id: transmission ? `${twin.id}:${transmission}` : twin.id,
    twinId:twin.id,
    transmission:transmission??null,
    identity: `${twin.identity.year} ${twin.identity.make} ${twin.identity.model} ${twin.identity.trim || ''}`.trim(),
    leaves: rows.length,
    linked: rows.filter((row) => row.status === 'linked' || row.status === 'linked-set').length,
    fitmentHold: rows.filter((row) => row.status === 'fitment-hold').length,
    linkHold: rows.filter((row) => row.status === 'link-hold').length,
    issueLinked: rows.filter((row) => row.status === 'issue-linked').length,
    failures: rows.filter((row) => !['linked', 'linked-set', 'issue-linked'].includes(String(row.status))),
    rows,
  };
}));

for (const summary of summaries) {
  console.log(`${summary.id}\tleaves=${summary.leaves}\tlinked=${summary.linked}\tfitmentHold=${summary.fitmentHold}\tlinkHold=${summary.linkHold}\tissueLinked=${summary.issueLinked}\tfailures=${summary.failures.length}`);
  for (const failure of summary.failures) console.log(`  ${failure.nodeId}\t${failure.status}\t${failure.label}`);
}

const failures = summaries.flatMap((summary) => summary.failures.map((failure) => ({ twin: summary.id, ...failure })));
const result = { generatedAt: new Date().toISOString(), summaries, failures };
if (process.argv.includes('--json')) console.log(JSON.stringify(result, null, 2));
const outputIndex = process.argv.indexOf('--output');
if (outputIndex !== -1) {
  const outputPath = process.argv[outputIndex + 1];
  if (!outputPath) throw new Error('--output requires a file path');
  writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
}
if (failures.length) process.exitCode = 1;
