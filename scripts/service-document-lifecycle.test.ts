import test from 'node:test';
import assert from 'node:assert/strict';
import { MAX_MAINTENANCE_RECEIPT_BYTES, MAX_MAINTENANCE_RECEIPT_BODY_BYTES, maintenanceDocumentError } from '../src/lib/maintenance-document';
import { extractMaintenanceReceipt, validateReceiptDocument } from '../src/lib/maintenance-receipt-extraction';
import { maintenanceReceiptPath, validateMaintenanceReceiptContents } from '../src/lib/maintenance-receipt-storage';
import { assertReceiptUploadAllowed, processReceiptCleanupJob, queueReceiptCleanup, runReceiptCleanup, type ReceiptCleanupJob } from '../src/lib/maintenance-receipt-cleanup';
import { receiptCleanupAuthorized, receiptCleanupEnvironmentReady } from '../src/lib/maintenance-receipt-cleanup-auth';

const path = 'maintenance-receipts/synthetic-owner/synthetic-vehicle/private';
const job: ReceiptCleanupJob = { id: 'synthetic-job', userId: 'synthetic-owner', vehicleId: 'synthetic-vehicle', receiptPath: path, attempts: 0, retiredAt: null, generation: 'synthetic-generation', cursor: null, sweepHadReferences: false };
const pdf = () => new File(['%PDF-1.7 synthetic untrusted fixture'], 'private-name.pdf', { type: 'application/pdf' });
const draft = { date: null, mileage: null, mileageUnit: 'unknown', provider: null, invoiceTotal: null, currency: null, vehicleEvidence: null, vehicleMismatch: 'unknown', jobs: [], warnings: ['Unreadable completed work'] };

test('shared deployable document limits accept boundary and reject unsupported/disguised bytes', async () => {
  assert(MAX_MAINTENANCE_RECEIPT_BODY_BYTES < 4_500_000);
  for (const type of ['application/pdf', 'image/png', 'image/jpeg', 'image/webp']) {
    assert.equal(maintenanceDocumentError({ type, size: MAX_MAINTENANCE_RECEIPT_BYTES }), null);
    assert.match(maintenanceDocumentError({ type, size: MAX_MAINTENANCE_RECEIPT_BYTES + 1 }) || '', /4 MiB/);
  }
  assert.equal(await validateReceiptDocument(pdf()), null);
  assert.match(await validateMaintenanceReceiptContents(new File(['not PDF'], 'fake.pdf', { type: 'application/pdf' })) || '', /contents/);
  assert(maintenanceDocumentError({ type: 'text/plain', size: 1 }));
});

test('mocked PDF extraction sends official read-only file input; invalid/provider/refusal drafts recover without writes', async () => {
  const oldEnabled = process.env.MAINTENANCE_RECEIPT_EXTRACTION_ENABLED, oldKey = process.env.MAINTENANCE_RECEIPT_API_KEY;
  process.env.MAINTENANCE_RECEIPT_EXTRACTION_ENABLED = 'true'; process.env.MAINTENANCE_RECEIPT_API_KEY = 'synthetic-only';
  let calls = 0;
  try {
    const extracted = await extractMaintenanceReceipt(pdf(), 'Synthetic selected vehicle', (async (_url, init) => {
      calls++;
      const request = JSON.parse(String(init?.body));
      assert.equal(request.store, false); assert.equal(request.tools, undefined);
      assert.match(request.messages[0].content, /UNTRUSTED DOCUMENT DATA/);
      assert.match(request.messages[0].content, /completed work/);
      const file = request.messages[1].content[1];
      assert.equal(file.type, 'file'); assert.equal(file.file.filename, 'service-document.pdf');
      assert.match(file.file.file_data, /^data:application\/pdf;base64,/);
      assert.doesNotMatch(JSON.stringify(request), /private-name/);
      return Response.json({ choices: [{ message: { content: JSON.stringify(draft) } }] });
    }) as typeof fetch);
    assert.equal(extracted.date, null); assert.deepEqual(extracted.jobs, []);
    await assert.rejects(extractMaintenanceReceipt(new File(['wrong'], 'bad.pdf', { type: 'application/pdf' }), 'Synthetic', (async () => { calls++; throw Error('must not call'); }) as typeof fetch), /contents/);
    assert.equal(calls, 1);
    for (const response of [new Response('', { status: 503 }), Response.json({ choices: [{ message: { refusal: 'Cannot read', content: null } }] }), Response.json({ choices: [{ message: { content: '{invalid' } }] }), Response.json({ choices: [{ message: { content: JSON.stringify({ ...draft, execute: 'save' }) } }] })]) {
      await assert.rejects(extractMaintenanceReceipt(pdf(), 'Synthetic', (async () => response) as typeof fetch));
    }
    delete process.env.MAINTENANCE_RECEIPT_API_KEY;
    await assert.rejects(extractMaintenanceReceipt(pdf(), 'Synthetic'), /manually/);
  } finally {
    if (oldEnabled === undefined) delete process.env.MAINTENANCE_RECEIPT_EXTRACTION_ENABLED; else process.env.MAINTENANCE_RECEIPT_EXTRACTION_ENABLED = oldEnabled;
    if (oldKey === undefined) delete process.env.MAINTENANCE_RECEIPT_API_KEY; else process.env.MAINTENANCE_RECEIPT_API_KEY = oldKey;
  }
});

function fixture({ references = 0, parent = 1, failProvider = false } = {}) {
  const sql: Array<{ query: string; values: unknown[] }> = [], removed: string[] = [];
  const tx = {
    maintenanceRecord: { count: async () => references },
    vehicle: { count: async () => parent }, user: { count: async () => parent },
    $executeRaw: async (strings: TemplateStringsArray, ...values: unknown[]) => { sql.push({ query: strings.join('?'), values }); return 1; },
    $queryRaw: async () => [],
  };
  const provider = { list: async () => ({ paths: [path], cursor: null }), remove: async (paths: string[]) => { if (failProvider) throw Error('private-provider-secret'); removed.push(...paths); } };
  return { tx, provider, sql, removed };
}

test('shared invoice reference prevents provider deletion and retirement', async () => {
  const f = fixture({ references: 1 });
  assert.equal(await processReceiptCleanupJob(f.tx as never, job, f.provider), 'referenced');
  assert.deepEqual(f.removed, []); assert(!f.sql.some(item => item.query.includes('SET "retiredAt"')));
});
test('first cleanup pass commits retirement without provider calls; upload cannot reuse retired path', async () => {
  const f = fixture();
  assert.equal(await processReceiptCleanupJob(f.tx as never, job, f.provider), 'pending');
  assert.deepEqual(f.removed, []); assert(f.sql.some(item => item.query.includes('SET "retiredAt"')));
  await assert.rejects(assertReceiptUploadAllowed({ ...f.tx, $queryRaw: async () => [{ id: job.id }] } as never, path), /Start a new service review/);
});
test('retired unreferenced document deletes idempotently; provider failure keeps bounded durable retry', async () => {
  const retired = { ...job, retiredAt: new Date(), attempts: 999_999 };
  const f = fixture({ failProvider: true });
  assert.equal(await processReceiptCleanupJob(f.tx as never, retired, f.provider), 'pending');
  assert.equal(f.sql.length, 1); assert.match(f.sql[0].query, /SET "attempts"/);
  assert.equal(f.sql[0].values[0], 1_000_000);
  assert((f.sql[0].values[1] as Date).getTime() <= Date.now() + 86_400_000);
  assert.doesNotMatch(JSON.stringify(f.sql), /private-provider-secret/);
  const good = fixture();
  for (let i = 0; i < 2; i++) assert.equal(await processReceiptCleanupJob(good.tx as never, retired, good.provider), 'completed');
  assert.deepEqual(good.removed, [path, path]); assert(good.sql.every(item => item.query.includes('SET "completedAt"')));
});
test('foreign-owner paths, active parent prefix, and surviving foreign reference never delete', async () => {
  const f = fixture();
  await assert.rejects(queueReceiptCleanup(f.tx as never, { userId: 'another-owner', vehicleId: job.vehicleId!, receiptPath: path }), /ownership/);
  assert.equal(await processReceiptCleanupJob(f.tx as never, { ...job, userId: 'another-owner' }, f.provider), 'pending');
  assert.equal(await processReceiptCleanupJob(f.tx as never, { ...job, receiptPath: null }, f.provider), 'pending');
  assert.deepEqual(f.removed, []);
  const referenced = fixture({ references: 1 });
  assert.equal(await processReceiptCleanupJob(referenced.tx as never, { ...job, retiredAt: new Date() }, referenced.provider), 'pending');
  assert.deepEqual(referenced.removed, []);
  assert.equal(maintenanceReceiptPath('https://evil.invalid/' + path), null);
  assert.equal(maintenanceReceiptPath('https://synthetic.blob.vercel-storage.com/' + path), path);
});
test('worker bounds job count and obtains owner then vehicle before locking work row', async () => {
  const f = fixture(), operations: string[] = [];
  const tx = { ...f.tx, $queryRaw: async (strings: TemplateStringsArray, ...values: unknown[]) => {
    const query = strings.join('?');
    if (query.includes('pg_advisory_xact_lock')) operations.push(String(values[0]));
    else { assert.match(query, /FOR UPDATE SKIP LOCKED/); operations.push('job'); return [job]; }
    return [];
  } };
  const db = {
    $queryRaw: async (strings: TemplateStringsArray, limit: number) => { assert.match(strings.join('?'), /"completedAt" IS NULL/); assert.equal(limit, 10); return [job]; },
    $transaction: async (fn: (db: unknown) => unknown) => fn(tx),
  };
  const result = await runReceiptCleanup(db as never, 1000, f.provider);
  assert.equal(result.pending, 1);
  assert.deepEqual(operations, ['maintenance-owner:synthetic-owner', 'synthetic-vehicle', 'job']);
});
test('internal cleanup fails closed without explicit credentials, database identity and secret', () => {
  const secret = 'synthetic-secret-'.repeat(3);
  const env = { MAINTENANCE_RECEIPT_CLEANUP_ENABLED: 'true', MAINTENANCE_RECEIPT_CLEANUP_SECRET: secret, BLOB_READ_WRITE_TOKEN: 'synthetic-only', DATABASE_URL: 'postgresql://synthetic:synthetic@127.0.0.1:55439/au7o_signup_sandbox', MAINTENANCE_RECEIPT_CLEANUP_DATABASE_HOST: '127.0.0.1', MAINTENANCE_RECEIPT_CLEANUP_DATABASE_NAME: 'au7o_signup_sandbox' };
  assert(receiptCleanupEnvironmentReady(env));
  for (const key of Object.keys(env)) assert(!receiptCleanupEnvironmentReady({ ...env, [key]: undefined }), key);
  assert(!receiptCleanupEnvironmentReady({ ...env, MAINTENANCE_RECEIPT_CLEANUP_DATABASE_HOST: 'unexpected.invalid' }));
  assert(receiptCleanupAuthorized('Bearer ' + secret, secret));
  assert(!receiptCleanupAuthorized(null, secret)); assert(!receiptCleanupAuthorized('Bearer wrong', secret)); assert(!receiptCleanupAuthorized('Bearer short', 'short'));
});

test('prefix cursor passes 100 protected paths, survives provider failure/restart, and revisits references', async () => {
  let current = { ...job, receiptPath: null as string | null }, fail = true;
  const protectedPaths = Array.from({ length: 100 }, (_, i) => `maintenance-receipts/synthetic-owner/synthetic-vehicle/protected-${i}`);
  const orphan = 'maintenance-receipts/synthetic-owner/synthetic-vehicle/orphan';
  const removed: string[] = [], cursors: Array<string | undefined> = [];
  const tx = {
    vehicle: { count: async () => 0 }, user: { count: async () => 1 },
    maintenanceRecord: { count: async (query: { where: { OR: Array<{ receiptUrl: unknown }> } }) => protectedPaths.includes(String(query.where.OR[0].receiptUrl)) ? 1 : 0 },
    $executeRaw: async (strings: TemplateStringsArray, ...values: unknown[]) => {
      const sql = strings.join('?');
      if (sql.includes('SET "cursor"')) current = { ...current, cursor: values[0] as string | null, sweepHadReferences: values[1] as boolean, generation: values[3] as string };
      else if (sql.includes('SET "attempts"')) { assert.equal(values[4], current.generation); current = { ...current, attempts: values[0] as number, generation: values[2] as string }; }
      else assert.fail('Unexpected write: ' + sql);
      return 1;
    },
  };
  const provider = {
    list: async (_owner: string, _vehicle?: string, cursor?: string) => { cursors.push(cursor); return cursor ? { paths: removed.includes(orphan) ? [] : [orphan], cursor: null } : { paths: protectedPaths, cursor: 'page-2' }; },
    remove: async (paths: string[]) => { if (fail) throw Error('Synthetic provider interruption'); removed.push(...paths); },
  };
  assert.equal(await processReceiptCleanupJob(tx as never, { ...current }, provider), 'pending');
  assert.equal(current.cursor, 'page-2'); assert(current.sweepHadReferences);
  assert.equal(await processReceiptCleanupJob(tx as never, { ...current }, provider), 'pending');
  assert.equal(current.cursor, 'page-2'); assert.equal(current.attempts, 1);
  fail = false;
  assert.equal(await processReceiptCleanupJob(tx as never, { ...current }, provider), 'pending');
  assert.deepEqual(removed, [orphan]); assert.equal(current.cursor, null);
  await processReceiptCleanupJob(tx as never, { ...current }, provider);
  assert.deepEqual(cursors, [undefined, 'page-2', 'page-2', undefined]);
  assert.equal(current.cursor, 'page-2'); assert.deepEqual(removed, [orphan]);
});

test('transaction timeout schedules a guarded retry outside rollback so the next due job can run', async () => {
  const first = { ...job, id: 'first' }, second = { ...job, id: 'second', generation: 'second-generation' };
  const selected: string[] = []; let deferred = false, timeout = true;
  const f = fixture({ references: 1 });
  const db = {
    $queryRaw: async () => [deferred ? second : first],
    $executeRaw: async (strings: TemplateStringsArray, ...values: unknown[]) => {
      assert.match(strings.join('?'), /AND "generation" = \? AND "completedAt" IS NULL/);
      assert.equal(values[3], first.id); assert.equal(values[4], first.generation); deferred = true; return 1;
    },
    $transaction: async (fn: (tx: unknown) => Promise<unknown>) => {
      const selectedJob = deferred ? second : first;
      const tx = { ...f.tx, $queryRaw: async (strings: TemplateStringsArray) => strings.join('?').includes('FOR UPDATE') ? [selectedJob] : [] };
      selected.push(selectedJob.id);
      const result = await fn(tx);
      if (timeout) { timeout = false; throw Error('Synthetic transaction timeout/rollback'); }
      return result;
    },
  };
  assert.equal((await runReceiptCleanup(db as never, 1, f.provider)).pending, 1);
  assert.equal((await runReceiptCleanup(db as never, 1, f.provider)).completed, 1);
  assert.deepEqual(selected, ['first', 'second']);
});
