/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function loadFullRecordDecisions(directory, targetIds) {
  const byId = new Map();
  for (const name of fs.readdirSync(directory)) {
    if (!name.endsWith('.json')) continue;
    let document;
    try {
      document = JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8'));
    } catch {
      continue;
    }
    if (document.schemaVersion !== 2 || document.auditScope !== 'full-record') continue;
    for (const decision of [...(document.issues || []), ...(document.decisions || [])]) {
      if (!targetIds.has(decision.id)) continue;
      const normalized = {
        disposition: decision.disposition,
        decision: decision.decision,
        evidence: decision.evidence || [],
        after: decision.after || null,
      };
      const rows = byId.get(decision.id) || [];
      const key = JSON.stringify(normalized);
      if (!rows.some((row) => row.key === key)) rows.push({ key, sourceFiles: [name], ...normalized });
      else rows.find((row) => row.key === key).sourceFiles.push(name);
      byId.set(decision.id, rows);
    }
  }
  return byId;
}

function buildPacket({ manifest, snapshot, decisionsById, manifestFile, snapshotFile }) {
  const sourceById = new Map(snapshot.records.map((row) => [row.id, row]));
  const rows = manifest.hold.map((hold) => ({
    id: hold.id,
    make: hold.make,
    model: hold.model,
    preAudit: sourceById.get(hold.id) || null,
    auditDecisions: (decisionsById.get(hold.id) || []).map(({ key, ...row }) => row),
  }));
  const missingSource = rows.filter((row) => !row.preAudit).map((row) => row.id);
  const missingDecision = rows.filter((row) => row.auditDecisions.length === 0).map((row) => row.id);
  const conflictingDecision = rows.filter((row) => row.auditDecisions.length > 1).map((row) => row.id);
  const dispositions = {};
  for (const row of rows) {
    for (const decision of row.auditDecisions) {
      dispositions[decision.disposition] = (dispositions[decision.disposition] || 0) + 1;
    }
  }
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source: {
      holdManifest: manifestFile,
      holdManifestSha256: sha256(manifestFile),
      preAuditSnapshot: snapshotFile,
      preAuditSnapshotSha256: sha256(snapshotFile),
    },
    summary: {
      holdRows: rows.length,
      missingSource: missingSource.length,
      missingDecision: missingDecision.length,
      conflictingDecision: conflictingDecision.length,
      dispositions,
    },
    anomalies: { missingSource, missingDecision, conflictingDecision },
    rows,
  };
}

function argValue(args, flag) {
  const index = args.indexOf(flag);
  if (index < 0 || !args[index + 1]) throw new Error(`Missing ${flag}`);
  return path.resolve(args[index + 1]);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const manifestFile = argValue(args, '--manifest');
  const snapshotFile = argValue(args, '--snapshot');
  const decisionsDirectory = argValue(args, '--decisions-dir');
  const outputFile = argValue(args, '--output');
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(snapshotFile, 'utf8'));
  const targetIds = new Set(manifest.hold.map((row) => row.id));
  const packet = buildPacket({
    manifest,
    snapshot,
    decisionsById: loadFullRecordDecisions(decisionsDirectory, targetIds),
    manifestFile,
    snapshotFile,
  });
  fs.writeFileSync(outputFile, JSON.stringify(packet, null, 2));
  console.log(JSON.stringify(packet.summary, null, 2));
  if (packet.summary.missingSource || packet.summary.missingDecision || packet.summary.conflictingDecision) process.exitCode = 1;
}

module.exports = { buildPacket, loadFullRecordDecisions };
