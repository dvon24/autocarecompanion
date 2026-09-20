import type { prisma as Database } from './db';
import type { sendEmailDetailed } from './email';
import { lockReservationEmail, reservationEmailWhere } from './reservation-email-lock';

type Mail = Parameters<typeof sendEmailDetailed>[0];
/** Hold consent through invocation, not the remote response. Always await the
 * same send promise outside the transaction; uncertain commits stay held. */
export function createLockedReservationSender(deps: {
  prisma: Pick<typeof Database,'$transaction'>;
  send: typeof sendEmailDetailed;
  clock?: () => number;
  requireReservation?: boolean;
}) {
  return async (mail:Mail & { reservationId?: string }) => {
    const clock = deps.clock ?? (()=>performance.now());
    const deadline = clock()+19000;
    let active=true,invoked=false;
    let pending:ReturnType<typeof sendEmailDetailed>|undefined;
    const response = async () => {
      // Keep the original operation deadline without retaining the consent lock.
      // Promise.race attaches rejection handlers even when the provider settles late.
      let timer:ReturnType<typeof setTimeout>|undefined;
      try {
        return await Promise.race([
          pending!.catch(()=>({ok:false,providerId:undefined,error:'Provider outcome is uncertain.'})),
          new Promise<{ok:boolean;providerId?:string;error:string}>(resolve=>{
            timer=setTimeout(()=>resolve({ok:false,error:'Provider response timed out. Delivery requires reconciliation.'}),Math.max(0,deadline-clock()));
          }),
        ]);
      } finally { clearTimeout(timer); }
    };
    try {
      await deps.prisma.$transaction(async tx=>{
        await lockReservationEmail(tx,mail.to);
        let release!:()=>void;
        const invocation=new Promise<void>(resolve=>{release=resolve;});
        pending=deps.send({...mail,onInvitationProviderInvocation:()=>{invoked=true;release();},invitationConsentGuard:async()=>{
          if(!active||clock()>=deadline)return()=>false;
          // Cancellation and claim share this lock. Check the exact target,
          // never suppress another vehicle merely because its email matches.
          if (deps.requireReservation && !mail.reservationId) return () => false;
          if (mail.reservationId) {
            const target = await tx.reservation.findUnique({ where: { id: mail.reservationId }, select: { email: true, twinStatus: true, claimedAt: true, unsubscribedAt: true } });
            if (!target || target.email.trim().toLowerCase() !== mail.to.trim().toLowerCase() || target.twinStatus !== 'ready' || target.claimedAt || target.unsubscribedAt) return () => false;
          }
          // All invitation suppression uses this connection, never the root pool.
          if(await tx.reservation.findFirst({where:{...await reservationEmailWhere(tx,mail.to),unsubscribedAt:{not:null}},select:{id:true}})
            || await tx.emailSuppression.findUnique({where:{email:mail.to.trim().toLowerCase()},select:{id:true}}))return()=>false;
          if(!active||clock()>=deadline)return()=>false;
          await tx.$queryRaw`SELECT 1 AS "invitation_transaction_live"`;
          return ()=>active&&clock()<deadline;
        }});
        // Suppression/validation can finish without invoking. Neither branch
        // returns the provider promise, which would keep the lock through response.
        await Promise.race([invocation,pending.then(()=>{},()=>{})]);
      },{isolationLevel:'ReadCommitted',timeout:20000});
    } catch(error) {
      active=false;
      if(invoked&&pending){
        const result=await response();
        return {ok:false,providerId:result.providerId,error:'Consent transaction outcome is uncertain. Delivery requires reconciliation.'};
      }
      throw error;
    } finally { active=false; }
    return await response();
  };
}
