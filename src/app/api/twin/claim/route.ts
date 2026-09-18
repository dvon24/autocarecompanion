import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createTwinClaimPostHandler } from '@/lib/twin-claim-post-handler';

const claim = createTwinClaimPostHandler({ auth, prisma });
export async function POST(request: Request) {
  if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Same-origin request required'},{status:403});
  const body=await request.clone().json().catch(()=>null);
  if(!body?.expectedUpdatedAt||![7,30].includes(body.expectedTrialDays))return Response.json({error:'Refresh and review your exact vehicle offer before accepting.'},{status:400});
  const session=await auth();
  if(!session?.user?.id)return Response.json({error:'Sign in to accept this offer'},{status:401});
  const user=await prisma.user.findUnique({where:{id:session.user.id},select:{email:true,emailVerified:true}});
  if(!user?.emailVerified||user.email.toLowerCase()!==session.user.email?.toLowerCase())return Response.json({error:'Verify your account email before accepting this offer'},{status:403});
  return claim(request);
}
