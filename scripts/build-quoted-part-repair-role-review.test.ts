import assert from 'node:assert/strict';
import test from 'node:test';
import { buildQuotedPartRepairRoleReview, normalizedTextSha256 } from './build-quoted-part-repair-role-review';

const source = {
  make: 'Audi', snapshotHash: 'snapshot',
  records: [{ id: 'issue', title: 'PCV failure', solution: 'Replace the PCV assembly.' }],
};
const proposals = {
  make: 'Audi', snapshotHash: 'snapshot',
  proposals: [{
    proposalId: 'proposal', id: 'issue',
    parts: [{ component: 'PCV assembly', oemPartNumber: '06H-103-495-AK', fitment: { years: [2010] }, buyLinks: [{}] }],
  }],
};

test('binds every staged proposal part to one repair-role decision', () => {
  const result = buildQuotedPartRepairRoleReview(source, proposals, {
    make: 'Audi', decisions: [{ proposalId: 'proposal', partIndex: 0, decision: 'approve', reason: 'The prescribed repair directly replaces this assembly.' }],
  });
  assert.equal(result.proposalPartCount, 1);
  assert.equal(result.approvedCount, 1);
  const decision = result.decisions[0] as { partNumber: string; sourceEvidence: unknown };
  assert.equal(decision.partNumber, '06H103495AK');
  assert.deepEqual(decision.sourceEvidence, {
    title: 'PCV failure', howToFix: 'Replace the PCV assembly.',
  });
});

test('rejects missing, duplicate, extra, and invalid decisions', () => {
  assert.throws(() => buildQuotedPartRepairRoleReview(source, proposals, { make: 'Audi', decisions: [] }), /decision is missing/);
  const valid = { proposalId: 'proposal', partIndex: 0, decision: 'approve', reason: 'The prescribed repair directly replaces this assembly.' };
  assert.throws(() => buildQuotedPartRepairRoleReview(source, proposals, { make: 'Audi', decisions: [valid, valid] }), /duplicate/);
  assert.throws(() => buildQuotedPartRepairRoleReview(source, proposals, {
    make: 'Audi', decisions: [valid, { ...valid, proposalId: 'extra' }],
  }), /outside/);
  assert.throws(() => buildQuotedPartRepairRoleReview(source, proposals, {
    make: 'Audi', decisions: [{ ...valid, decision: 'maybe' }],
  }), /invalid repair-role/);
});

test('normalizes checkout line endings without masking semantic changes', () => {
  assert.equal(normalizedTextSha256('a\r\nb\r'), normalizedTextSha256('a\nb\n'));
  assert.notEqual(normalizedTextSha256('a\nb\n'), normalizedTextSha256('a\nc\n'));
});
