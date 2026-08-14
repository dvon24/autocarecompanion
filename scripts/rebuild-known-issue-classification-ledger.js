#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/** Recompute a make's diagnostic classification from its frozen 00/01 artifacts. */
const fs = require('node:fs');
const path = require('node:path');
const {
  buildMakeLedger,
  hashValue,
  makeKey,
} = require('./build-known-issue-part-audit-ledger');

function rebuildClassification(source, disposition, checkpoint) {
  if (source?.artifactKind !== 'known-issue-make-source' || !Array.isArray(source.records)) {
    throw new Error('Make source is invalid.');
  }
  if (disposition?.artifactKind !== 'known-issue-make-disposition-ledger'
    || !Array.isArray(disposition.issues)) {
    throw new Error('Disposition ledger is invalid.');
  }
  if (source.snapshotHash !== disposition.snapshotHash
    || source.make !== disposition.make
    || makeKey(source.make) !== source.makeKey) {
    throw new Error('Frozen make source and disposition ledger do not reconcile.');
  }
  if (source.recordCount !== source.records.length
    || disposition.issueCount !== disposition.issues.length) {
    throw new Error('Frozen make source or disposition count is inconsistent.');
  }
  const makeIndex = Number.isInteger(checkpoint?.makeIndex) ? checkpoint.makeIndex : 0;
  const totalMakes = Number.isInteger(checkpoint?.totalMakes) ? checkpoint.totalMakes : 1;
  const ledger = buildMakeLedger({
    snapshot: { records: source.records },
    snapshotHash: source.snapshotHash,
    makeEntry: { make: source.make, key: source.makeKey },
    makeIndex,
    makes: Array.from({ length: totalMakes }, (_, index) => ({ make: String(index), key: String(index) })),
    canonicalDispositionLedger: disposition,
  });
  const ledgerContents = `${JSON.stringify(ledger, null, 2)}\n`;
  return {
    ledger,
    ledgerContents,
    checkpoint: {
      ...checkpoint,
      status: 'IN_PROGRESS',
      stage: 'DIAGNOSTIC_DISPOSITION_RECONCILED',
      snapshotHash: source.snapshotHash,
      make: source.make,
      makeKey: source.makeKey,
      makeIndex,
      totalMakes,
      issueCount: ledger.issueCount,
      diagnosticSummary: ledger.diagnosticSummary,
      unclassifiedCount: 0,
      zeroUnclassified: true,
      ledgerFile: 'classification-ledger.json',
      ledgerHash: hashValue(ledgerContents),
    },
  };
}

function argValue(args, flag) {
  const index = args.indexOf(flag);
  if (index < 0 || !args[index + 1]) throw new Error(`${flag} is required`);
  return args[index + 1];
}

function main() {
  const args = process.argv.slice(2);
  const sourceFile = path.resolve(argValue(args, '--source'));
  const dispositionFile = path.resolve(argValue(args, '--disposition'));
  const checkpointFile = path.resolve(argValue(args, '--checkpoint'));
  const outputFile = path.resolve(argValue(args, '--out'));
  const output = rebuildClassification(
    JSON.parse(fs.readFileSync(sourceFile, 'utf8')),
    JSON.parse(fs.readFileSync(dispositionFile, 'utf8')),
    JSON.parse(fs.readFileSync(checkpointFile, 'utf8')),
  );
  fs.writeFileSync(outputFile, output.ledgerContents, 'utf8');
  fs.writeFileSync(checkpointFile, `${JSON.stringify(output.checkpoint, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({
    make: output.ledger.make,
    issueCount: output.ledger.issueCount,
    diagnosticSummary: output.ledger.diagnosticSummary,
    output: outputFile,
  }, null, 2));
}

if (require.main === module) {
  try { main(); } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

module.exports = { rebuildClassification };
