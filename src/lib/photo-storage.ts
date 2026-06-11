import { put, del } from '@vercel/blob';

/**
 * Phase 0.1 — private blob storage for CONSENTED diagnosis photos.
 *
 * The store is a PRIVATE Vercel Blob store: bytes are only reachable
 * server-side with BLOB_READ_WRITE_TOKEN, never via public URLs. Every
 * function no-ops gracefully when the token is absent (local dev before
 * the env is pulled) so capture falls back to metadata-only, exactly the
 * Phase 0.0 behavior.
 *
 * GDPR invariants (see /api/account/delete):
 *   - blobs are deleted BEFORE the DiagnosisSample rows cascade away —
 *     a cascaded row would orphan an un-erasable image.
 *   - keys are derived from the sample id, so rows and blobs are always
 *     1:1 reconcilable.
 */

export function blobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

function extFor(contentType: string): string {
  if (contentType.includes('png')) return 'png';
  if (contentType.includes('webp')) return 'webp';
  if (contentType.includes('gif')) return 'gif';
  return 'jpg';
}

/** Store one diagnosis photo; returns the blob pathname or null if storage
 *  is unconfigured/fails (caller keeps imageStored=false). */
export async function storeDiagnosisPhoto(
  sampleId: string,
  buffer: Buffer,
  contentType: string,
): Promise<{ key: string; byteSize: number } | null> {
  if (!blobConfigured()) return null;
  try {
    const key = `diagnosis-samples/${sampleId}.${extFor(contentType)}`;
    const res = await put(key, buffer, {
      access: 'private',
      contentType,
      addRandomSuffix: false,
    });
    return { key: res.pathname, byteSize: buffer.length };
  } catch (err) {
    console.error('[photo-storage] put failed:', err instanceof Error ? err.message : err);
    return null;
  }
}

/** Delete stored diagnosis photos by key. Throws on failure — account
 *  deletion must NOT proceed past an un-erased blob. */
export async function deleteDiagnosisPhotos(keys: string[]): Promise<void> {
  const real = keys.filter(Boolean);
  if (real.length === 0) return;
  if (!blobConfigured()) {
    throw new Error('BLOB_READ_WRITE_TOKEN missing — cannot purge stored diagnosis photos');
  }
  await del(real);
}
