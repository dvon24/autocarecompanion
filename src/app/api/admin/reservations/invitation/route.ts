import { createLockedReservationSender } from '@/lib/reservation-invitation-dispatch';
import { lockReservationEmail, reservationEmailWhere } from '@/lib/reservation-email-lock';
import { prisma } from '@/lib/db';
import { requireFounder } from '@/lib/admin-guard';
import { appUrl, sendEmailDetailed } from '@/lib/email';
import { createTwinReadyInvitationHandler } from '@/lib/twin-ready-invitation';
import { publicEnrollmentEnabled } from '@/lib/product-entitlements';
import { nextMonotonicRevision } from '@/lib/maintenance-mutation';
import { prepareTwinReadyInvitationArtwork } from '@/lib/twin-ready-invitation-artwork';

export const dynamic = 'force-dynamic';
export const POST = createTwinReadyInvitationHandler({
  authorize: requireFounder,
  baseUrl: appUrl(),
  enabled: () => publicEnrollmentEnabled() && process.env.TWIN_READY_INVITATIONS_ENABLED === 'true',
  prepareSend: process.env.AU7O_ISOLATED_SIGNUP_PREVIEW === 'true'
    ? (mail, offer) => prepareTwinReadyInvitationArtwork({ mail, artwork: offer.artwork, baseUrl: appUrl() })
    : undefined,
  load: id => prisma.reservation.findUnique({ where: { id } }),
  // Intentionally fail CLOSED for invitations; do not use the password-reset
  // helper's fail-open suppression behavior.
  suppressed: async email => !!await prisma.emailSuppression.findUnique({ where: { email: email.trim().toLowerCase() }, select: { id: true } }) || !!await prisma.reservation.findFirst({where:{...await reservationEmailWhere(prisma,email),unsubscribedAt:{not:null}},select:{id:true}}),
  deliveryExists: async reservationId => !!await prisma.twinInvitationDelivery.findUnique({ where: { reservationId }, select: { id: true } }),
  reserve: async row => prisma.$transaction(async tx => {
    await lockReservationEmail(tx,row.email);
    if(await tx.reservation.findFirst({where:{...await reservationEmailWhere(tx,row.email),unsubscribedAt:{not:null}},select:{id:true}}))return null;
    const locked = await tx.reservation.updateMany({ where: { id: row.id, updatedAt: row.updatedAt, twinStatus: 'ready', invitedAt: null, unsubscribedAt: null }, data: { updatedAt: nextMonotonicRevision(row.updatedAt,new Date()) } });
    if (locked.count !== 1 || await tx.emailSuppression.findUnique({ where: { email: row.email.trim().toLowerCase() } })) return null;
    const delivery = await tx.twinInvitationDelivery.create({ data: { reservationId: row.id, reservationRevision: row.updatedAt.toISOString() } });
    return delivery.id;
  }, { isolationLevel: 'ReadCommitted' }),
  send: createLockedReservationSender({prisma,send:sendEmailDetailed,requireReservation:true}),
  finish: async (id, row, result) => {
    await prisma.$transaction(async tx => {
      await tx.twinInvitationDelivery.update({ where: { id }, data: { status: result.ok ? 'sent' : 'uncertain', providerId: result.providerId } });
      if (result.ok) await tx.reservation.update({ where: { id: row.id }, data: { invitedAt: new Date() } });
    });
  },
});
