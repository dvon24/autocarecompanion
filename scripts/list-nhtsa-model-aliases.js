/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const readline = require('node:readline');
const { RECALL_FILES, SOURCE_FILES } = require('./known-issue-adjudication-utils');
const { parseCsv } = require('./inspect-nhtsa-model-source-inventory');

function argValue(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : '';
}

async function readLines(file, onLine) {
  const reader = readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity });
  for await (const line of reader) onLine(line);
}

function increment(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

async function main() {
  const makes = new Set(argValue('--makes').split('|').filter(Boolean).map((value) => value.toUpperCase()));
  const patternValue = argValue('--pattern');
  const pattern = patternValue ? new RegExp(patternValue, 'i') : null;
  if (!makes.size) throw new Error('--makes is required');

  const communications = new Map();
  for (const source of SOURCE_FILES) {
    let first = true;
    await readLines(source.path, (line) => {
      if (first) { first = false; return; }
      const [, make, model] = parseCsv(line);
      if (!makes.has(String(make).toUpperCase()) || (pattern && !pattern.test(model))) return;
      increment(communications, `${make}\t${model}`);
    });
  }

  const recalls = new Map();
  for (const source of RECALL_FILES) {
    await readLines(source.path, (line) => {
      const fields = line.split('\t');
      const make = fields[2];
      const model = fields[3];
      if (!makes.has(String(make).toUpperCase()) || (pattern && !pattern.test(model))) return;
      increment(recalls, `${make}\t${model}`);
    });
  }

  function rows(map) {
    return [...map.entries()]
      .map(([key, count]) => { const [make, model] = key.split('\t'); return { make, model, count }; })
      .sort((left, right) => left.make.localeCompare(right.make) || left.model.localeCompare(right.model));
  }
  console.log(JSON.stringify({ makes: [...makes], pattern: patternValue || null, communications: rows(communications), recalls: rows(recalls) }, null, 2));
}

if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
