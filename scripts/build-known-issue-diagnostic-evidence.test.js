/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const { buildDiagnosticEvidence } = require('./build-known-issue-diagnostic-evidence');

test('builds exact reviewed tool links and identity-bound diagnostic holds', () => {
  const artifact = buildDiagnosticEvidence({
    artifactKind: 'known-issue-part-classification-ledger',
    snapshotHash: 'a'.repeat(64),
    make: 'Example',
    issueCount: 2,
    diagnosticSummary: {
      issueWithDtcCount: 1,
      uniqueDtcCount: 1,
      instructionCount: 1,
      dtcDispositionCount: 1,
      toolLinkedCount: 1,
      procedureNoToolCount: 0,
      unresolvedToolHoldCount: 1,
    },
    rows: [{
      issueId: 'one',
      diagnosticDispositions: [{
        source: 'dtcCodes', status: 'tool-linked', procedure: 'scan-codes',
        toolId: 'ancel-ad310',
        productUrl: 'https://www.amazon.com/ANCEL-AD310-Enhanced-Universal-Diagnostic/dp/B01G5EA74I?tag=au7o-20',
        reasonCode: 'dtc-family-capability-matched', excerpt: 'P0300',
      }],
    }, {
      issueId: 'two',
      diagnosticDispositions: [{
        source: 'dtcCodes', status: 'unresolved-tool-hold', procedure: 'scan-codes',
        toolId: null, productUrl: null,
        reasonCode: 'manufacturer-code-capability-unverified', excerpt: 'P17D0',
      }],
    }],
  });
  assert.equal(artifact.makeToolLinks.length, 1);
  assert.equal(artifact.makeToolLinks[0].toolId, 'ancel-ad310');
  assert.equal(artifact.holds.length, 1);
  assert.equal(artifact.holds[0].issueId, 'two');
  assert.equal(artifact.scope.uncoveredDiagnosticInstructionCount, 0);
});

test('rejects a tool-linked disposition whose URL is not the reviewed product', () => {
  assert.throws(() => buildDiagnosticEvidence({
    artifactKind: 'known-issue-part-classification-ledger',
    snapshotHash: 'a'.repeat(64),
    make: 'Example',
    issueCount: 1,
    diagnosticSummary: {},
    rows: [{
      issueId: 'one',
      diagnosticDispositions: [{
        status: 'tool-linked', toolId: 'ancel-ad310', productUrl: 'https://example.com/wrong',
      }],
    }],
  }), /not the reviewed URL/);
});
