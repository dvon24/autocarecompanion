import type { prisma as Database } from './db';
import { lockReservationEmail, reservationEmailWhere } from './reservation-email-lock';

export function createReservationUnsubscribeHandler(prisma: Pick<typeof Database, '$transaction'>) {
  return async function POST(request: Request) {
    const token = new URL(request.url).searchParams.get('token');
    if (!token || !/^[a-zA-Z0-9_-]{16,256}$/.test(token)) return new Response('This link is incomplete.', {status:400});
    try {
      await prisma.$transaction(async tx => {
        const row = await tx.reservation.findUnique({where:{unsubscribeToken:token},select:{email:true}});
        if (!row) return;
        await lockReservationEmail(tx,row.email);
        await tx.reservation.updateMany({where:{...await reservationEmailWhere(tx,row.email),unsubscribedAt:null},data:{unsubscribedAt:new Date()}});
      },{isolationLevel:'ReadCommitted'});
      return new Response('Request processed. If this link matched a reservation, reservation emails for that address are now stopped. Your account and subscription are unchanged.',{headers:{'Cache-Control':'no-store'}});
    } catch { return new Response('We could not save your preference. Please try again.', {status:503}); }
  };
}
