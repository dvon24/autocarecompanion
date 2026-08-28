/** Prisma uses P2034 for retryable serializable/deadlock transaction failures. */
export function isPrismaWriteConflict(error: unknown): boolean {
  return !!error
    && typeof error === 'object'
    && 'code' in error
    && (error as { code?: unknown }).code === 'P2034';
}
