import { timingSafeEqual } from 'node:crypto';

/** Disabled until a scheduler, isolated environment credentials, and exact DB
 * identity are explicitly configured. Never borrow another environment's keys. */
export function receiptCleanupEnvironmentReady(env: Record<string, string | undefined> = process.env) {
  if (env.MAINTENANCE_RECEIPT_CLEANUP_ENABLED !== 'true'
    || !env.MAINTENANCE_RECEIPT_CLEANUP_SECRET || env.MAINTENANCE_RECEIPT_CLEANUP_SECRET.length < 32
    || !env.BLOB_READ_WRITE_TOKEN || !env.DATABASE_URL
    || !env.MAINTENANCE_RECEIPT_CLEANUP_DATABASE_HOST || !env.MAINTENANCE_RECEIPT_CLEANUP_DATABASE_NAME) return false;
  try {
    const database = new URL(env.DATABASE_URL);
    return ['postgres:', 'postgresql:'].includes(database.protocol)
      && database.hostname === env.MAINTENANCE_RECEIPT_CLEANUP_DATABASE_HOST
      && database.pathname.slice(1) === env.MAINTENANCE_RECEIPT_CLEANUP_DATABASE_NAME;
  } catch { return false; }
}

export function receiptCleanupAuthorized(header: string | null, secret: string | undefined) {
  if (!secret || secret.length < 32 || !header?.startsWith('Bearer ')) return false;
  const supplied = Buffer.from(header.slice(7));
  const expected = Buffer.from(secret);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}
