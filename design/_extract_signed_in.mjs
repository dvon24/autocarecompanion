// Unpack the bundler manifest from au7o-signed-in-bundle.html.
// Each manifest entry is { mime, compressed, data } where data is
// base64-encoded gzipped content (typically JSX source).
//
// Run: node design/_extract_components.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

const src = readFileSync('design/au7o-signed-in-bundle.html', 'utf8');
const tag = '<script type="__bundler/manifest">';
const start = src.indexOf(tag);
if (start < 0) throw new Error('manifest not found');
const open = src.indexOf('>', start) + 1;
const close = src.indexOf('</script>', open);
const raw = src.slice(open, close).trim();
const manifest = JSON.parse(raw);

const outDir = 'design/signed-in-components';
mkdirSync(outDir, { recursive: true });

const extByMime = {
  'text/jsx': 'jsx',
  'text/javascript': 'js',
  'text/css': 'css',
  'text/html': 'html',
  'application/json': 'json',
};

const index = [];
let i = 0;
for (const [uuid, entry] of Object.entries(manifest)) {
  i++;
  const ext = extByMime[entry.mime] || 'txt';
  let bytes;
  try {
    const buf = Buffer.from(entry.data, 'base64');
    bytes = entry.compressed ? gunzipSync(buf) : buf;
  } catch (err) {
    console.warn(`skip ${uuid}: ${err.message}`);
    continue;
  }
  const text = bytes.toString('utf8');

  // Try to find a component name in the JSX source for a friendlier filename.
  let label = `entry_${String(i).padStart(2, '0')}`;
  const m =
    text.match(/function\s+([A-Z][A-Za-z0-9_]+)\s*\(/) ||
    text.match(/const\s+([A-Z][A-Za-z0-9_]+)\s*=/) ||
    text.match(/export\s+default\s+function\s+([A-Z][A-Za-z0-9_]+)/);
  if (m) label = m[1];

  const filename = `${outDir}/${label}__${uuid.slice(0, 8)}.${ext}`;
  writeFileSync(filename, text, 'utf8');
  index.push({ uuid, label, mime: entry.mime, bytes: bytes.length, file: filename });
  console.log(`✓ ${label} (${entry.mime}, ${bytes.length.toLocaleString()} bytes)`);
}

writeFileSync(`${outDir}/_index.json`, JSON.stringify(index, null, 2), 'utf8');
console.log(`\nWrote ${index.length} files to ${outDir}/`);
