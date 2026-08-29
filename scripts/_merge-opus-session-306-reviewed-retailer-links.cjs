/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const masterPath = path.join(root, 'outputs', 'pending-repair-first-review', 'opus-session-306-master-review-2026-08-29.json');
const sourcePath = path.join(root, 'outputs', 'pending-known-issue-review', 'session-306-release-readiness.json');
const moduleDir = path.join(root, 'src', 'lib', 'known-issue-reviewed-retailer-links');
const indexPath = path.join(root, 'src', 'lib', 'known-issue-reviewed-retailer-links.ts');

const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const makeByIssueId = new Map(source.issues.map((issue) => [issue.id, issue.make]));

function fingerprint(value) {
  const hash = (seed) => {
    let result = (0x811c9dc5 ^ seed) >>> 0;
    for (let index = 0; index < value.length; index += 1) {
      result = Math.imul(result ^ value.charCodeAt(index), 0x01000193) >>> 0;
    }
    result = (result ^ (result >>> 16)) >>> 0;
    result = Math.imul(result, 0x85ebca6b) >>> 0;
    result = (result ^ (result >>> 13)) >>> 0;
    result = Math.imul(result, 0xc2b2ae35) >>> 0;
    result = (result ^ (result >>> 16)) >>> 0;
    return result.toString(16).padStart(8, '0');
  };
  return `${hash(0x9e3779b9)}${hash(0x243f6a88)}${hash(0xb7e15162)}`;
}

function canonicalUrl(value) {
  const url = new URL(value);
  url.hash = '';
  return url.toString();
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function isMarketplace(host) {
  return /(^|\.)(amazon\.com|ebay\.com|ebay\.co\.uk|ebay\.ca|ebay\.com\.au|rockauto\.com)$/.test(host);
}

function emptyModule(make) {
  return `// GENERATED review approvals for ${make}.\n`
    + '// Comments keep exact approvals human-reviewable; runtime stores compact fingerprints.\n\n'
    + 'export const productUrlFingerprints = [\n] as const;\n\n'
    + 'export const vendorUrlFingerprints = [\n] as const;\n\n'
    + 'export const retailerHostFingerprints = [\n] as const;\n';
}

function addEntry(contents, exportName, hash, comment) {
  const pattern = new RegExp(`(export const ${exportName} = \\[\\n)([\\s\\S]*?)(\\] as const;)`);
  const match = contents.match(pattern);
  if (!match) throw new Error(`Could not find ${exportName}`);
  if (new RegExp(`['\"]${hash}['\"]`).test(match[2])) return contents;
  const body = match[2];
  const separator = body.length > 0 && !body.endsWith('\n') ? '\n' : '';
  const addition = `${separator}  // ${comment.replace(/[\r\n]+/g, ' ')}\n  '${hash}',\n`;
  return contents.replace(pattern, `$1${body}${addition}$3`);
}

const approvalsByMake = new Map();
for (const decision of master.decisions) {
  const make = makeByIssueId.get(decision.id);
  if (!make) throw new Error(`Missing make for ${decision.id}`);
  for (const part of decision.fixParts || []) {
    if (part.verified !== true) throw new Error(`Unverified part: ${decision.id}`);
    for (const link of part.buyLinks || []) {
      if (link.verified !== true || link.linkType !== 'product') {
        throw new Error(`Non-renderable reviewed link metadata: ${decision.id} / ${link.url}`);
      }
      const canonical = canonicalUrl(link.url);
      const host = new URL(canonical).hostname.toLowerCase().replace(/^www\./, '');
      const rows = approvalsByMake.get(make) || [];
      rows.push({
        issueId: decision.id,
        vendor: link.vendor,
        canonical,
        host,
        marketplace: isMarketplace(host),
      });
      approvalsByMake.set(make, rows);
    }
  }
}

fs.mkdirSync(moduleDir, { recursive: true });
for (const [make, approvals] of approvalsByMake) {
  const modulePath = path.join(moduleDir, `${slugify(make)}.ts`);
  let contents = fs.existsSync(modulePath) ? fs.readFileSync(modulePath, 'utf8') : emptyModule(make);
  for (const approval of approvals) {
    const comment = `Opus 306: ${approval.issueId} | ${approval.vendor} | ${approval.canonical}`;
    if (!approval.marketplace) {
      contents = addEntry(contents, 'productUrlFingerprints', fingerprint(approval.canonical), comment);
    }
    contents = addEntry(
      contents,
      'vendorUrlFingerprints',
      fingerprint(`${approval.vendor.trim().toLowerCase()}\n${approval.canonical}`),
      comment,
    );
    if (!approval.marketplace) {
      contents = addEntry(contents, 'retailerHostFingerprints', fingerprint(approval.host), comment);
    }
  }
  fs.writeFileSync(modulePath, contents);
}

const moduleNames = fs.readdirSync(moduleDir)
  .filter((name) => /^[a-z0-9-]+\.ts$/i.test(name))
  .map((name) => name.replace(/\.ts$/i, ''))
  .sort((a, b) => a.localeCompare(b));
const imports = moduleNames.map((moduleName, index) => (
  `import { productUrlFingerprints as productUrls${index}, vendorUrlFingerprints as vendorUrls${index}, retailerHostFingerprints as retailerHosts${index} } from './known-issue-reviewed-retailer-links/${moduleName}';`
)).join('\n');
const productSpreads = moduleNames.map((_, index) => `...productUrls${index}`).join(', ');
const vendorSpreads = moduleNames.map((_, index) => `...vendorUrls${index}`).join(', ');
const hostSpreads = moduleNames.map((_, index) => `...retailerHosts${index}`).join(', ');
const index = `// GENERATED by reviewed known-issue batches. Do not edit by hand.\n`
  + '// Batch modules are additive so a new make review cannot remove prior approvals.\n\n'
  + `${imports}\n\n`
  + `const REVIEWED_PRODUCT_URLS = new Set<string>([${productSpreads}]);\n`
  + `const REVIEWED_VENDOR_URLS = new Set<string>([${vendorSpreads}]);\n`
  + `const REVIEWED_RETAILER_HOSTS = new Set<string>([${hostSpreads}]);\n\n`
  + `function canonicalUrl(value: string): string | null {\n  try {\n    const url = new URL(value);\n    url.hash = '';\n    return url.toString();\n  } catch {\n    return null;\n  }\n}\n\n`
  + `function fingerprint(value: string): string {\n  const hash = (seed: number): string => {\n    let result = (0x811c9dc5 ^ seed) >>> 0;\n    for (let index = 0; index < value.length; index += 1) {\n      result = Math.imul(result ^ value.charCodeAt(index), 0x01000193) >>> 0;\n    }\n    result = (result ^ (result >>> 16)) >>> 0;\n    result = Math.imul(result, 0x85ebca6b) >>> 0;\n    result = (result ^ (result >>> 13)) >>> 0;\n    result = Math.imul(result, 0xc2b2ae35) >>> 0;\n    result = (result ^ (result >>> 16)) >>> 0;\n    return result.toString(16).padStart(8, '0');\n  };\n  return \`${'${hash(0x9e3779b9)}${hash(0x243f6a88)}${hash(0xb7e15162)}'}\`;\n}\n\n`
  + `export function isReviewedKnownIssueProductUrl(value: string): boolean {\n  const canonical = canonicalUrl(value);\n  return canonical !== null && REVIEWED_PRODUCT_URLS.has(fingerprint(canonical));\n}\n\n`
  + `export function isReviewedKnownIssueVendorUrl(vendor: string, value: string): boolean {\n  const canonical = canonicalUrl(value);\n  return canonical !== null && REVIEWED_VENDOR_URLS.has(fingerprint(\`${'${vendor.trim().toLowerCase()}\\n${canonical}'}\`));\n}\n\n`
  + `export function isReviewedKnownIssueRetailerHost(host: string): boolean {\n  return REVIEWED_RETAILER_HOSTS.has(fingerprint(host.trim().toLowerCase().replace(/^www\\./, '')));\n}\n`;
fs.writeFileSync(indexPath, index);

console.log(JSON.stringify({
  makesUpdated: approvalsByMake.size,
  reviewedLinksRegistered: [...approvalsByMake.values()].reduce((sum, rows) => sum + rows.length, 0),
  totalApprovalModules: moduleNames.length,
}, null, 2));
