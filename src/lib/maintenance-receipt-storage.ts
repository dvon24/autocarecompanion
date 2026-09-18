import { randomUUID } from 'node:crypto';
import { del, get, list, put } from '@vercel/blob';
import { receiptCleanupEnvironmentReady } from './maintenance-receipt-cleanup-auth';

import { maintenanceDocumentError, MAX_MAINTENANCE_RECEIPT_BODY_BYTES } from '@/lib/maintenance-document';
export { MAX_MAINTENANCE_RECEIPT_BYTES } from '@/lib/maintenance-document';
export const MAINTENANCE_RECEIPT_PREFIX = 'maintenance-receipts/';

/** Bound the body even for chunked uploads without a Content-Length header. */
export async function readMaintenanceReceiptForm(request: Request): Promise<FormData> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Missing receipt form.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > MAX_MAINTENANCE_RECEIPT_BODY_BYTES) { await reader.cancel(); throw new RangeError('Choose a document, 4 MiB or smaller.'); }
      chunks.push(chunk.value);
    }
  } finally { reader.releaseLock(); }
  return new Response(Buffer.concat(chunks), { headers: { 'Content-Type': request.headers.get('content-type') || '' } }).formData();
}

export function maintenanceReceiptStorageConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** Uploads must not outlive a disabled cleanup lifecycle. Reads and deletes
 * remain available when new uploads are held. Scheduling is a launch gate. */
export function maintenanceReceiptUploadsConfigured(): boolean {
  return maintenanceReceiptStorageConfigured() && receiptCleanupEnvironmentReady();
}

export function validateMaintenanceReceipt(file: File): string | null {
  if (!(file instanceof File) || file.size <= 0) return 'Choose a receipt file.';
  return maintenanceDocumentError(file);
}

export async function validateMaintenanceReceiptContents(file: File): Promise<string | null> {
  const metadataError = validateMaintenanceReceipt(file);
  if (metadataError) return metadataError;
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const startsWith = (...expected: number[]) => expected.every((value, index) => bytes[index] === value);
  const valid = file.type === 'application/pdf'
    ? startsWith(0x25, 0x50, 0x44, 0x46, 0x2d)
    : file.type === 'image/jpeg'
      ? startsWith(0xff, 0xd8, 0xff)
      : file.type === 'image/png'
        ? startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)
        : file.type === 'image/webp'
          ? startsWith(0x52, 0x49, 0x46, 0x46)
            && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
          : false;
  return valid ? null : 'The file contents do not match the selected receipt format.';
}

function safeFilename(name: string): string {
  const cleaned = name
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(-90);
  return cleaned || 'receipt';
}

export function isManagedMaintenanceReceipt(value: string | null | undefined): boolean {
  if (!value) return false;
  if (value.startsWith(MAINTENANCE_RECEIPT_PREFIX)) return true;
  try {
    const parsed = new URL(value);
    return parsed.hostname.toLowerCase().endsWith('.blob.vercel-storage.com')
      && parsed.pathname.slice(1).startsWith(MAINTENANCE_RECEIPT_PREFIX);
  } catch {
    return false;
  }
}

export function ownerReceiptPrefix(userId: string, vehicleId?: string): string {
  return `${MAINTENANCE_RECEIPT_PREFIX}${encodeURIComponent(userId)}/${vehicleId ? `${encodeURIComponent(vehicleId)}/` : ''}`;
}

/** Use a configured-store pathname for cleanup, never a caller-selected host. */
export function maintenanceReceiptPath(value: string): string | null {
  if (!isManagedMaintenanceReceipt(value)) return null;
  if (value.startsWith(MAINTENANCE_RECEIPT_PREFIX)) return value;
  const parsed = new URL(value);
  return parsed.protocol === 'https:' && !parsed.search && !parsed.hash ? parsed.pathname.slice(1) : null;
}

export async function listMaintenanceReceiptPaths(userId: string, vehicleId?: string, cursor?: string): Promise<{ paths: string[]; cursor: string | null }> {
  if (!maintenanceReceiptStorageConfigured()) throw new Error('Private document storage is unavailable.');
  const page = await list({ prefix: ownerReceiptPrefix(userId, vehicleId), limit: 100, cursor });
  if (page.hasMore && !page.cursor) throw new Error('Private document listing needs a continuation cursor.');
  return { paths: page.blobs.map(blob => blob.pathname), cursor: page.hasMore ? page.cursor! : null };
}

export function maintenanceReceiptBelongsToOwner(
  value: string | null | undefined,
  userId: string,
  vehicleId: string,
): boolean {
  if (!isManagedMaintenanceReceipt(value) || !value) return false;
  const pathname = value.startsWith(MAINTENANCE_RECEIPT_PREFIX)
    ? value
    : new URL(value).pathname.slice(1);
  return pathname.startsWith(ownerReceiptPrefix(userId, vehicleId));
}

export async function storeMaintenanceReceipt(input: {
  userId: string;
  vehicleId: string;
  file: File;
  contentKey?: string;
}): Promise<{ url: string; pathname: string }> {
  if (!maintenanceReceiptUploadsConfigured()) {
    throw new Error('Private receipt storage and cleanup must be configured before uploading.');
  }
  const validationError = await validateMaintenanceReceiptContents(input.file);
  if (validationError) throw new Error(validationError);
  if (input.contentKey && !/^[a-f0-9]{64}$/.test(input.contentKey)) throw new Error('Invalid receipt content key.');
  const pathname = `${ownerReceiptPrefix(input.userId, input.vehicleId)}${input.contentKey || randomUUID()}-${input.contentKey ? 'receipt' : safeFilename(input.file.name)}`;
  const result = await put(pathname, input.file, {
    access: 'private',
    addRandomSuffix: false,
    contentType: input.file.type,
    ...(input.contentKey ? { allowOverwrite: true } : {}),
  });
  return { url: result.url, pathname: result.pathname };
}

export async function readMaintenanceReceipt(urlOrPathname: string) {
  if (!maintenanceReceiptStorageConfigured()) return null;
  return get(urlOrPathname, { access: 'private', useCache: false });
}

export async function deleteMaintenanceReceipts(values: Array<string | null | undefined>): Promise<void> {
  const managed = values.filter((value): value is string => isManagedMaintenanceReceipt(value));
  if (managed.length === 0) return;
  if (!maintenanceReceiptStorageConfigured()) {
    throw new Error('BLOB_READ_WRITE_TOKEN missing — cannot purge stored maintenance receipts');
  }
  await del(managed);
}

export async function deleteAllMaintenanceReceiptsForUser(userId: string): Promise<number> {
  if (!maintenanceReceiptStorageConfigured()) {
    throw new Error('BLOB_READ_WRITE_TOKEN missing — cannot purge stored maintenance receipts');
  }
  let cursor: string | undefined;
  let deleted = 0;
  do {
    const page = await list({ prefix: ownerReceiptPrefix(userId), cursor, limit: 1000 });
    if (page.blobs.length) {
      await del(page.blobs.map((blob) => blob.url));
      deleted += page.blobs.length;
    }
    if (page.hasMore && !page.cursor) throw new Error('Receipt listing did not return a continuation cursor');
    cursor = page.hasMore ? page.cursor : undefined;
    if (!page.hasMore) break;
  } while (cursor);
  return deleted;
}
