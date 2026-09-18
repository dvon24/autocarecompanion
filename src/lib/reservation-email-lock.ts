import type { Prisma } from '@prisma/client';
import { normalizeReservationEmail } from './reservation-identity';

/** Capture, unsubscribe and invitation reservation share this transaction lock.
 * Use ReadCommitted so the read after a waiting lock sees the latest consent. */
export async function lockReservationEmail(tx: Pick<Prisma.TransactionClient, '$queryRaw'>, email: string) {
  const key = 'reservation-email:' + normalizeReservationEmail(email);
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${key}, 0))::text`;
}
/** Match historical casing/ECMAScript outer whitespace without mutating or backfilling rows.
 * This uses the leading normalized-email expression in the new unique index. */
export async function reservationEmailWhere(tx: Pick<Prisma.TransactionClient, '$queryRaw'>, email: string) {
  const normalized = normalizeReservationEmail(email);
  const rows = await tx.$queryRaw<Array<{id:string}>>`SELECT "id" FROM "Reservation" WHERE lower(btrim("email", public.reservation_whitespace())) = ${normalized}`;
  return {id:{in:rows.map(row=>row.id)}};
}
