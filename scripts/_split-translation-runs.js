const fs = require('fs');
const src = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const runs = src?.result?.runs || [];
for (const run of runs) {
  const out = { result: { locale: run.locale, languageName: run.languageName, models: run.models } };
  const p = `data/_translation-${String(run.locale).toLowerCase()}.json`;
  fs.writeFileSync(p, JSON.stringify(out));
  console.log(`${run.locale}: ${run.models.length} models -> ${p}`);
}
