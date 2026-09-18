/** Browser-safe policy; multipart body stays below the 4.5 MB host limit. */
export const MAX_MAINTENANCE_RECEIPT_BYTES = 4 * 1024 * 1024;
export const MAX_MAINTENANCE_RECEIPT_BODY_BYTES = MAX_MAINTENANCE_RECEIPT_BYTES + 256 * 1024;
export const MAINTENANCE_DOCUMENT_LIMIT_LABEL = '4 MiB';
export const MAINTENANCE_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
export const MAINTENANCE_DOCUMENT_ERROR = 'Choose a PDF, JPEG, PNG, or WebP document, 4 MiB or smaller.';
export function maintenanceDocumentError(file: Pick<File, 'type' | 'size'>): string | null {
  return !MAINTENANCE_DOCUMENT_TYPES.includes(file.type) || file.size <= 0 || file.size > MAX_MAINTENANCE_RECEIPT_BYTES
    ? MAINTENANCE_DOCUMENT_ERROR : null;
}
